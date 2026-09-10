#!/usr/bin/env python3
"""
Genera el reel de Instagram de Digilogic: 1080x1920, 30 fps, MP4.

Dibuja cada fotograma con QPainter (PyQt6 ya está en el venv del
proyecto, así que no hace falta instalar nada) y se los pasa a ffmpeg
por una tubería en crudo. No se guarda ni un PNG intermedio: 600
fotogramas a esta resolución serían varios gigas en disco.

Uso:
    QT_QPA_PLATFORM=offscreen venv/bin/python reel.py salida.mp4
"""

import math
import os
import subprocess
import sys

from PyQt6.QtCore import QPointF, QRectF, Qt
from PyQt6.QtGui import (
    QBrush,
    QColor,
    QFont,
    QFontMetricsF,
    QGuiApplication,
    QImage,
    QLinearGradient,
    QPainter,
    QPainterPath,
    QPen,
    QRadialGradient,
)

ANCHO, ALTO = 1080, 1920
FPS = 30

ASSETS = "/Users/daniel/Proyectos/digilogic-website/assets"

# Paleta idéntica a la de la web, para que el reel y la página se vean
# como la misma marca.
FONDO = QColor("#08090b")
TEXTO = QColor("#f5f5f7")
APAGADO = QColor("#9297a3")
ACENTO = QColor("#4f8cff")
ACENTO_CLARO = QColor("#72a5ff")

FAMILIA = "Helvetica Neue"

# Instagram tapa la parte de arriba y de abajo del reel con su propia
# interfaz (nombre de la cuenta, texto del pie, botones). Todo lo que
# tenga que leerse va entre estas dos alturas.
SEGURO_ARRIBA = 300
SEGURO_ABAJO = 1650

CAPTURA_CY = 1030          # centro vertical de la ventana del reproductor
ESCALA_CAPTURA = 1.13      # 602 px de ancho -> 680 px en el lienzo


# ----------------------------------------------------------------------
# Curvas de animación
# ----------------------------------------------------------------------

def recorta(v, minimo=0.0, maximo=1.0):
    return max(minimo, min(maximo, v))


def suave(t):
    """Arranca y frena despacio. La curva por defecto de casi todo."""
    t = recorta(t)
    return t * t * (3 - 2 * t)


def salida(t):
    """Entra rápido y frena al final: da sensación de peso."""
    t = recorta(t)
    return 1 - (1 - t) ** 3


def aparicion(t, duracion, entra=0.30, sale=0.24):
    """Opacidad de un elemento que entra al principio y sale al final."""
    a = suave(t / entra) if entra else 1.0
    b = suave((duracion - t) / sale) if sale else 1.0
    return recorta(a) * recorta(b)


# ----------------------------------------------------------------------
# Piezas de dibujo
# ----------------------------------------------------------------------

def fuente(tam, negrita=True, espaciado=0.0):
    f = QFont(FAMILIA)
    f.setPixelSize(tam)
    f.setWeight(QFont.Weight.Bold if negrita else QFont.Weight.Medium)
    if espaciado:
        f.setLetterSpacing(QFont.SpacingType.PercentageSpacing, 100 + espaciado)
    return f


def dibujar_fondo(p, segundos):
    """Negro, un resplandor azul que respira y una rejilla muy tenue."""
    p.fillRect(0, 0, ANCHO, ALTO, FONDO)

    # El resplandor sube y baja lentamente para que el fondo nunca esté
    # del todo quieto, igual que el de la web.
    deriva = math.sin(segundos * 0.45) * 60
    brillo = QRadialGradient(QPointF(ANCHO / 2, 430 + deriva), 780)
    brillo.setColorAt(0.0, QColor(79, 140, 255, 46))
    brillo.setColorAt(0.55, QColor(79, 140, 255, 14))
    brillo.setColorAt(1.0, QColor(79, 140, 255, 0))
    p.fillRect(0, 0, ANCHO, ALTO, QBrush(brillo))

    p.setPen(QPen(QColor(255, 255, 255, 7), 1))
    for x in range(0, ANCHO + 1, 90):
        p.drawLine(x, 0, x, ALTO)
    for y in range(0, ALTO + 1, 90):
        p.drawLine(0, y, ANCHO, y)


def texto_centrado(p, cadena, y, f, color, opacidad=1.0, degradado=False):
    """Dibuja una línea centrada. Devuelve la altura de línea."""
    p.setFont(f)
    fm = QFontMetricsF(f)
    ancho = fm.horizontalAdvance(cadena)
    x = (ANCHO - ancho) / 2

    p.setOpacity(opacidad)

    if degradado:
        # Mismo degradado que los titulares de la web: blanco a azul.
        g = QLinearGradient(x, 0, x + ancho, 0)
        g.setColorAt(0.0, TEXTO)
        g.setColorAt(1.0, ACENTO_CLARO)
        p.setPen(QPen(QBrush(g), 1))
    else:
        p.setPen(color)

    p.drawText(QPointF(x, y), cadena)
    p.setOpacity(1.0)
    return fm.height()


def bloque_titulo(p, lineas, y, tam, opacidad, desplaza=0.0):
    """Titular de varias líneas; la última va en degradado."""
    f = fuente(tam, negrita=True, espaciado=-3.0)
    alto_linea = tam * 1.06
    for i, linea in enumerate(lineas):
        texto_centrado(
            p, linea,
            y + i * alto_linea + desplaza,
            f, TEXTO, opacidad,
            degradado=(i == len(lineas) - 1 and len(lineas) > 1),
        )


def dibujar_ventana(p, img, cx, cy, escala, opacidad, resplandor=True):
    """La captura del reproductor, con un halo azul detrás."""
    w = img.width() * escala
    h = img.height() * escala
    destino = QRectF(cx - w / 2, cy - h / 2, w, h)

    if resplandor and opacidad > 0.02:
        halo = QRadialGradient(QPointF(cx, cy), max(w, h) * 0.78)
        halo.setColorAt(0.0, QColor(79, 140, 255, int(58 * opacidad)))
        halo.setColorAt(0.6, QColor(79, 140, 255, int(16 * opacidad)))
        halo.setColorAt(1.0, QColor(79, 140, 255, 0))
        p.fillRect(0, 0, ANCHO, ALTO, QBrush(halo))

    p.setOpacity(opacidad)
    p.drawImage(destino, img)
    p.setOpacity(1.0)


# Silueta del puntero de macOS: flecha estrecha con cola. Las
# coordenadas son las del SVG de la web, en un lienzo de 24x24, con la
# punta en (4, 1.6).
PUNTOS_CURSOR = [
    (4, 1.6), (4, 18.7), (8.3, 14.6), (11.2, 21.4),
    (13.9, 20.1), (11, 13.5), (16.7, 13.5),
]


def dibujar_cursor(p, x, y, escala, opacidad):
    """Puntero con la punta exactamente en (x, y)."""
    ruta = QPainterPath()
    for i, (px, py) in enumerate(PUNTOS_CURSOR):
        punto = QPointF(
            x + (px - 4) * escala,
            y + (py - 1.6) * escala,
        )
        if i == 0:
            ruta.moveTo(punto)
        else:
            ruta.lineTo(punto)
    ruta.closeSubpath()

    p.setOpacity(opacidad)
    # Contorno blanco: es lo que hace visible un puntero negro sobre un
    # fondo oscuro. Es como lo dibuja el propio macOS.
    p.setPen(QPen(QColor(255, 255, 255), 2.6 * escala / 3.0,
                  Qt.PenStyle.SolidLine, Qt.PenCapStyle.RoundCap,
                  Qt.PenJoinStyle.RoundJoin))
    p.setBrush(QColor(12, 12, 14))
    p.drawPath(ruta)
    p.setOpacity(1.0)


def dibujar_pulso(p, x, y, avance):
    """Anillo que se expande desde el punto del clic."""
    if not 0.0 < avance < 1.0:
        return
    radio = 26 + salida(avance) * 118
    alfa = int(200 * (1 - avance) ** 1.6)
    p.setBrush(Qt.BrushStyle.NoBrush)
    p.setPen(QPen(QColor(114, 165, 255, alfa), 5))
    p.drawEllipse(QPointF(x, y), radio, radio)


# ----------------------------------------------------------------------
# Escenas
# ----------------------------------------------------------------------

class Reel:

    def __init__(self):
        self.capturas = [
            QImage(os.path.join(ASSETS, "reproductor-preview.png")),
            QImage(os.path.join(ASSETS, "reproductor-preview-2.png")),
            QImage(os.path.join(ASSETS, "reproductor-preview-3.png")),
        ]
        self.mini = QImage(os.path.join(ASSETS, "modo-compacto.png"))
        self.logo = QImage(os.path.join(ASSETS, "digilogic-logo.png"))

        for img in self.capturas + [self.mini, self.logo]:
            if img.isNull():
                raise SystemExit("Falta alguna imagen en " + ASSETS)

        # (duración en segundos, función que dibuja)
        #
        # Ritmo corto a propósito: en un reel cada plano tiene que haber
        # dicho lo suyo antes de que a quien mira le dé tiempo a deslizar.
        self.escenas = [
            (1.7, self.intro),
            (2.3, lambda p, t, d: self.escena_captura(
                p, t, d, 0,
                ["Tu música.", "Así de simple."],
                "Sin cuentas ni suscripciones")),
            (2.1, lambda p, t, d: self.escena_captura(
                p, t, d, 1,
                ["Toda tu música", "en una lista."],
                "Elige una carpeta y listo")),
            (2.1, lambda p, t, d: self.escena_captura(
                p, t, d, 2,
                ["Busca mientras", "escribes."],
                "Filtra al instante")),
            (4.3, self.escena_miniatura),
            (2.6, self.outro),
        ]

        self.duracion = sum(d for d, _ in self.escenas)

    # -- escena 1: presentación -----------------------------------------

    def intro(self, p, t, d):
        o = aparicion(t, d, entra=0.34, sale=0.28)

        lado = 250
        crece = 0.9 + salida(recorta(t / 0.55)) * 0.1
        l = lado * crece
        p.setOpacity(o)
        p.drawImage(QRectF(ANCHO / 2 - l / 2, 700 - l / 2, l, l), self.logo)
        p.setOpacity(1.0)

        sube = (1 - salida(recorta((t - 0.12) / 0.5))) * 34
        bloque_titulo(p, ["Digilogic"], 1000, 108, o, sube)

        texto_centrado(
            p, "Reproductor MP3 minimalista",
            1075, fuente(40, negrita=False), APAGADO, o * 0.95,
        )

    # -- escenas 2 a 4: las capturas ------------------------------------

    def escena_captura(self, p, t, d, indice, titulo, pie):
        o = aparicion(t, d, entra=0.30, sale=0.24)
        img = self.capturas[indice]

        # La ventana entra desde abajo y se asienta.
        avance = salida(recorta(t / 0.55))
        desplaza = (1 - avance) * 70
        escala = ESCALA_CAPTURA * (0.965 + avance * 0.035)

        bloque_titulo(p, titulo, 400, 78, o, (1 - avance) * 26)
        dibujar_ventana(p, img, ANCHO / 2, CAPTURA_CY + desplaza, escala, o)

        texto_centrado(p, pie, 1560, fuente(38, negrita=False), APAGADO, o * 0.9)

    # -- escena 5: el modo miniatura ------------------------------------

    def escena_miniatura(self, p, t, d):
        o = aparicion(t, d, entra=0.30, sale=0.28)
        img = self.capturas[0]

        # Dónde cae la nota musical dentro de la captura, y por tanto en
        # el lienzo: es el punto al que tiene que llegar el puntero.
        nota_x = ANCHO / 2 + (300 - img.width() / 2) * ESCALA_CAPTURA
        nota_y = CAPTURA_CY + (250 - img.height() / 2) * ESCALA_CAPTURA

        INICIO_CLIC = 1.30

        # La ventana grande se va ANTES de que llegue la miniatura, en vez
        # de fundirse una sobre otra. Cruzar dos imágenes tan distintas
        # deja un instante de imagen doble ilegible; encadenarlas se lee
        # como lo que es, una ventana que se transforma en otra.
        SALE_GRANDE = 0.32
        ENTRA_MINI = 0.36
        SOLAPE = 0.03            # un pelín de solape para que no parpadee

        se_va = suave(recorta((t - INICIO_CLIC) / SALE_GRANDE))
        llega = suave(recorta(
            (t - INICIO_CLIC - SALE_GRANDE + SOLAPE) / ENTRA_MINI))

        if se_va < 1.0:
            dibujar_ventana(
                p, img, ANCHO / 2, CAPTURA_CY,
                ESCALA_CAPTURA * (1 - se_va * 0.16),
                o * (1 - se_va),
            )

        if llega > 0.0:
            dibujar_ventana(
                p, self.mini, ANCHO / 2, CAPTURA_CY,
                ESCALA_CAPTURA * (0.88 + llega * 0.12),
                o * llega,
                resplandor=False,
            )

        # El puntero entra, se acerca a la nota, pulsa y se retira en
        # cuanto la ventana empieza a encogerse.
        fin_cursor = INICIO_CLIC + SALE_GRANDE
        if t < fin_cursor + 0.22:
            viaje = suave(recorta((t - 0.28) / 0.85))
            cx = 880 + (nota_x - 880) * viaje
            cy = 1560 + (nota_y - 1560) * viaje

            # Encoge un instante al pulsar, como un clic de verdad.
            pulsa = recorta((t - INICIO_CLIC + 0.08) / 0.11) * recorta(
                (INICIO_CLIC + 0.22 - t) / 0.11)
            escala_cursor = 3.4 * (1 - 0.16 * pulsa)

            visible = o * suave(recorta((t - 0.18) / 0.22)) * suave(
                recorta((fin_cursor + 0.22 - t) / 0.22))
            dibujar_cursor(p, cx, cy, escala_cursor, visible)

        dibujar_pulso(p, nota_x, nota_y, (t - INICIO_CLIC) / 0.62)

        bloque_titulo(p, ["Un clic", "y se encoge."], 400, 78, o)

        # Los pies se relevan: el primero termina de irse antes de que
        # empiece a aparecer el segundo, para que no se lean superpuestos.
        texto_centrado(p, "Pulsa la nota musical", 1560,
                       fuente(38, negrita=False), APAGADO,
                       o * 0.9 * (1 - se_va))
        texto_centrado(p, "Y sigue sonando en una esquina", 1560,
                       fuente(38, negrita=False), APAGADO,
                       o * 0.9 * llega)

    # -- escena 6: cierre ------------------------------------------------

    def outro(self, p, t, d):
        o = aparicion(t, d, entra=0.32, sale=0.34)

        lado = 200
        p.setOpacity(o)
        p.drawImage(QRectF(ANCHO / 2 - lado / 2, 640, lado, lado), self.logo)
        p.setOpacity(1.0)

        sube = (1 - salida(recorta(t / 0.55))) * 26
        bloque_titulo(p, ["Gratis y de", "código abierto."], 990, 82, o, sube)

        texto_centrado(p, "Mac  ·  Windows", 1230,
                       fuente(40, negrita=False), APAGADO, o * 0.95)

        texto_centrado(p, "digilogic-app.github.io", 1400,
                       fuente(44, negrita=True, espaciado=-1.0), ACENTO_CLARO, o)

        texto_centrado(p, "@digilogic.app", 1490,
                       fuente(36, negrita=False), APAGADO, o * 0.85)

    # -- montaje ---------------------------------------------------------

    def dibujar(self, p, segundos):
        dibujar_fondo(p, segundos)

        acumulado = 0.0
        for duracion, escena in self.escenas:
            if acumulado <= segundos < acumulado + duracion:
                escena(p, segundos - acumulado, duracion)
                return
            acumulado += duracion

        # Último fotograma: repite el final del cierre.
        duracion, escena = self.escenas[-1]
        escena(p, duracion - 0.001, duracion)


def main():
    destino = sys.argv[1] if len(sys.argv) > 1 else "digilogic-reel.mp4"

    app = QGuiApplication(sys.argv)          # noqa: F841 (Qt lo necesita vivo)
    reel = Reel()
    total = int(round(reel.duracion * FPS))

    orden = [
        "ffmpeg", "-y",
        "-f", "rawvideo",
        "-pixel_format", "rgba",
        "-video_size", f"{ANCHO}x{ALTO}",
        "-framerate", str(FPS),
        "-i", "-",
        # Pista de audio en silencio: algunos reproductores y la propia
        # subida de Instagram se llevan mal con un MP4 sin audio.
        "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-shortest",
        "-c:v", "libx264",
        "-preset", "slow",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k",
        # Mete el índice al principio del archivo: así se puede empezar a
        # ver antes de terminar de descargarlo.
        "-movflags", "+faststart",
        destino,
    ]

    proceso = subprocess.Popen(orden, stdin=subprocess.PIPE,
                               stdout=subprocess.DEVNULL,
                               stderr=subprocess.PIPE)

    lienzo = QImage(ANCHO, ALTO, QImage.Format.Format_RGBA8888)

    for n in range(total):
        p = QPainter(lienzo)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        p.setRenderHint(QPainter.RenderHint.SmoothPixmapTransform)
        p.setRenderHint(QPainter.RenderHint.TextAntialiasing)
        reel.dibujar(p, n / FPS)
        p.end()

        proceso.stdin.write(lienzo.constBits().asstring(ANCHO * ALTO * 4))

        if n % 60 == 0:
            print(f"  {n}/{total} fotogramas", flush=True)

    proceso.stdin.close()
    error = proceso.stderr.read().decode("utf-8", "replace")
    codigo = proceso.wait()

    if codigo != 0:
        print(error[-3000:], file=sys.stderr)
        return codigo

    print(f"\nListo: {destino}  ({reel.duracion:.1f} s, {total} fotogramas)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
