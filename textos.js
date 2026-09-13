/*
 * Textos en español de la web.
 *
 * El inglés no está aquí: vive escrito directamente en index.html. Esa
 * asimetría es deliberada. Los buscadores indexan el HTML tal cual
 * llega, sin ejecutar nada, así que lo que se escriba ahí es lo que
 * Google va a ver — y el público de Digilogic busca en inglés. El
 * español se aplica después, en el navegador de quien lo necesita.
 *
 * Las claves terminadas en un texto con etiquetas se aplican con
 * innerHTML (atributo data-t-html en el HTML); el resto, como texto
 * plano. Por eso aquí solo hay etiquetas donde el HTML también las
 * tiene: <span>, <strong> y el enlace a GitHub.
 */

const TEXTOS_ES = {

    // --- Barra de navegación ---
    "nav.caracteristicas": "Características",
    "nav.uso": "Cómo se usa",
    "nav.opinion": "Tu opinión",
    "nav.novedades": "Novedades",

    // --- Portada ---
    "hero.badge": "Gratis y de código abierto",
    "hero.titulo": "Tu música.\n<span>Así de simple.</span>",
    "hero.descripcion":
        "Un reproductor MP3 minimalista, ligero y sin conexión para tu escritorio.",

    "hero.descargar_mac": "Descargar para Mac",
    "hero.nota_mac": "macOS 13 Ventura o superior · Apple Silicon",
    "hero.descargar_windows": "Descargar para Windows",
    "hero.nota_windows": "Windows 10 u 11 · 64 bits",
    "hero.github": "Ver en GitHub",
    "hero.kofi": "Apóyame en Ko-fi",

    // --- Aviso de la primera apertura ---
    "aviso.resumen": "¿Tu sistema no te deja abrirla?",
    "aviso.parrafo":
        "Digilogic es una app independiente, así que no está firmada: la " +
        "firma de Apple cuesta 99 € al año y la de Microsoft ronda los " +
        "200 €. Sin ella, los dos sistemas avisan la primera vez. No " +
        "significa que haya nada malo en la app, solo que no han pagado " +
        "por identificarla.",
    "aviso.macos": "En macOS",
    "aviso.mac_1":
        "Clic derecho sobre <strong>Digilogic</strong> en la carpeta " +
        "Aplicaciones y elige <strong>Abrir</strong>.",
    "aviso.mac_2": "Confirma en el aviso. Solo hace falta la primera vez.",
    "aviso.danada":
        "Si el aviso dice que la app «está dañada», ejecuta esto una vez " +
        "en la Terminal:",
    "aviso.windows": "En Windows",
    "aviso.windows_p":
        "Aparece una pantalla azul que dice <strong>«Windows protegió tu " +
        "PC»</strong>. Es SmartScreen, y el botón para continuar viene " +
        "escondido:",
    "aviso.win_1":
        "Pulsa <strong>Más información</strong>, el enlace pequeño bajo " +
        "el mensaje.",
    "aviso.win_2":
        "Aparece el botón <strong>Ejecutar de todas formas</strong>. " +
        "Púlsalo. Solo hace falta la primera vez.",
    "aviso.nota":
        'Puedes revisar todo el código en <a href="https://github.com/' +
        'danielgpf/Digilogic-Player" target="_blank" rel="noopener ' +
        'noreferrer">GitHub</a>.',

    // --- Por qué Digilogic ---
    "features.eyebrow": "POR QUÉ DIGILOGIC",
    "features.titulo": "Música sin\n<span>ruido de más.</span>",
    "features.sub":
        "Todo lo que necesitas para disfrutar tu música local. " +
        "Sin suscripciones ni ataduras.",

    "features.c1_titulo": "Rápido y ligero",
    "features.c1_texto":
        "Arranca al instante y no molesta. Sin procesos innecesarios en " +
        "segundo plano.",
    "features.c2_titulo": "Totalmente offline",
    "features.c2_texto":
        "Tu música vive en tu ordenador. Sin cuentas, suscripciones ni " +
        "conexión a internet.",
    "features.c3_titulo": "Código abierto",
    "features.c3_texto":
        "Digilogic se construye en abierto. Explora el código, reporta " +
        "fallos o contribuye.",
    "features.c3_cta": "Ver el código en GitHub →",

    // --- Cómo se usa ---
    "uso.eyebrow": "CÓMO SE USA",
    "uso.titulo": "Dos clics y\n<span>a sonar.</span>",

    "uso.paso1_t": "Elige tu carpeta",
    "uso.paso1_p":
        "Pulsa sobre el título, donde pone «Selecciona una carpeta», e " +
        "indica dónde tienes tus MP3. Puede ser incluso un USB: Digilogic " +
        "los reproduce desde ahí, sin copiar ni importar nada.",
    "uso.paso2_t": "Busca entre tu música",
    "uso.paso2_p":
        "El botón de las tres líneas abre tu lista completa, con un " +
        "buscador arriba que filtra mientras escribes.",
    "uso.paso3_t": "Pulsa la nota para el modo miniatura",
    "uso.paso3_p":
        "La ventana se encoge y se coloca en una esquina de la pantalla, " +
        "para dejarla de fondo mientras trabajas. Vuelve a pulsarla para " +
        "recuperar el tamaño normal.",
    "uso.pie": "Un clic en la nota y se encoge. Otro, y vuelve.",

    // --- Tu opinión ---
    "opinion.eyebrow": "TU OPINIÓN",
    "opinion.titulo": "Cuéntame qué\n<span>cambiarías.</span>",
    "opinion.sub":
        "Digilogic se hace escuchando a quien lo usa. Todo se lee, y lo " +
        "que entra se anuncia en las notas de cada versión con el nombre " +
        "de quien lo propuso.",

    "opinion.o1_t": "Algo no funciona",
    "opinion.o1_p":
        "Cuéntame qué pasa y en qué sistema. Cuanto más concreto, antes " +
        "se arregla.",
    "opinion.o1_cta": "Reportar un fallo →",
    "opinion.o2_t": "Te falta algo",
    "opinion.o2_p":
        "Una función, un ajuste, un detalle. Explica qué problema te " +
        "resolvería.",
    "opinion.o2_cta": "Proponer una idea →",
    "opinion.o3_t": "Solo quieres hablar",
    "opinion.o3_p": "Dudas, opiniones o contar cómo lo usas. Sin formularios.",
    "opinion.o3_cta": "Abrir una conversación →",

    // --- Apoyo ---
    "cta.titulo": "¿Te está gustando Digilogic?",
    "cta.parrafo":
        "Digilogic es gratis y de código abierto, y lo seguirá siendo. Si " +
        "te resulta útil, puedes apoyarlo con un café. Lo recaudado va, " +
        "por este orden, a:",
    "cta.o1_t": "Microsoft Store",
    "cta.o1_p": "Instalar en Windows sin el aviso de SmartScreen.",
    "cta.o2_t": "Firma en Windows",
    "cta.o2_p": "Que el .exe descargado abra sin avisos.",
    "cta.o3_t": "Apple Developer",
    "cta.o3_p": "Mac sin avisos y, más adelante, versión para iPhone.",
    "cta.o4_t": "Google Play",
    "cta.o4_p": "Versión para Android.",
    "cta.boton": "☕ Apóyame en Ko-fi",

    // --- Pie ---
    "footer.hecho": "Hecho con ♥ en España",

    // --- Metadatos de la pestaña ---
    "meta.titulo": "Digilogic — Reproductor minimalista",
    "meta.descripcion":
        "Digilogic es un reproductor MP3 minimalista, ligero y sin " +
        "conexión para tu ordenador. Gratis y de código abierto.",
};
