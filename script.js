// Current year in footer

document.getElementById("year").textContent =
    new Date().getFullYear();


// Subtle mouse-following glow

const glow = document.querySelector(".background-glow");

document.addEventListener("mousemove", (event) => {

    const x = event.clientX;
    const y = event.clientY;

    glow.style.left = `${x}px`;
    glow.style.top = `${y - 350}px`;

});


// Carrusel de 3 capturas, estilo "coverflow": una centrada y nítida, una a
// cada lado (izquierda/derecha), más pequeñas y difuminadas. Al hacer clic
// en una de los lados, rota como una noria: la clicada pasa al centro, y
// las otras dos giran respetando el lado por el que entró cada una.
//
// Importante para que esto no se "vuelva loco": la posición (centro/
// derecha/izquierda) la controla SOLO CSS, vía las clases
// carousel-pos-0/1/2 (ver style.css). El JS de aquí abajo NUNCA toca el
// transform de .carousel-card (el contenedor) -> solo toca el transform
// de la <img> de dentro, y solo la que esté en el centro en cada momento.
// Al no escribir los dos en el mismo sitio, no hay manera de que compitan.

const pilaCarrusel = document.getElementById("carousel-stack");

if (pilaCarrusel) {

    const tarjetas = Array.from(pilaCarrusel.querySelectorAll(".carousel-card"));

    // orden[0] = índice de la tarjeta central ahora mismo,
    // orden[1] = la de la derecha, orden[2] = la de la izquierda.
    let orden = tarjetas.map((_, indice) => indice);

    function aplicarOrden() {
        orden.forEach((indiceTarjeta, posicion) => {
            const tarjeta = tarjetas[indiceTarjeta];
            tarjeta.classList.remove("carousel-pos-0", "carousel-pos-1", "carousel-pos-2");
            tarjeta.classList.add(`carousel-pos-${posicion}`);

            if (posicion !== 0) {
                // Si esta tarjeta deja de estar en el centro, quitamos
                // cualquier transform de flotación/parallax que le hubiera
                // quedado puesto a mano -> si no, se vería torcida al lado.
                tarjeta.querySelector("img").style.transform = "";
            }
        });
    }

    function rotarHaciaLaIzquierda() {
        // Se pulsó la tarjeta de la DERECHA: entra al centro desde la
        // derecha: centro -> izquierda, izquierda -> derecha (da la vuelta).
        orden = [orden[1], orden[2], orden[0]];
        aplicarOrden();
    }

    function rotarHaciaLaDerecha() {
        // Se pulsó la tarjeta de la IZQUIERDA: entra al centro desde la
        // izquierda: centro -> derecha, derecha -> izquierda (da la vuelta).
        orden = [orden[2], orden[0], orden[1]];
        aplicarOrden();
    }

    tarjetas.forEach((tarjeta, indice) => {
        tarjeta.addEventListener("click", () => {
            const posicionActual = orden.indexOf(indice);
            if (posicionActual === 1) rotarHaciaLaIzquierda();
            if (posicionActual === 2) rotarHaciaLaDerecha();
        });
    });

    aplicarOrden();

    // Flotación + parallax (mismo efecto que antes), aplicados siempre a
    // la <img> que esté en el centro en ese instante.

    function imagenCentral() {
        return tarjetas[orden[0]].querySelector("img");
    }

    let flotarY = 0;
    let subiendo = true;
    let dentroDelHover = false;

    function animarFlotacion() {

        flotarY += subiendo ? 0.04 : -0.04;

        if (flotarY > 7) subiendo = false;
        if (flotarY < -7) subiendo = true;

        if (!dentroDelHover) {
            imagenCentral().style.transform =
                `translateY(${flotarY}px) rotateX(0deg) rotateY(0deg)`;
        }

        requestAnimationFrame(animarFlotacion);
    }

    animarFlotacion();

    pilaCarrusel.addEventListener("mousemove", (event) => {

        const img = imagenCentral();
        const rect = img.getBoundingClientRect();

        const dentroDeLaImagen =
            event.clientX >= rect.left && event.clientX <= rect.right &&
            event.clientY >= rect.top && event.clientY <= rect.bottom;

        if (!dentroDeLaImagen) {
            dentroDelHover = false;
            return;
        }

        dentroDelHover = true;

        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        const rotY = (x / rect.width) * 14;
        const rotX = -(y / rect.height) * 14;

        img.style.transform =
            `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;

    });

    pilaCarrusel.addEventListener("mouseleave", () => {
        dentroDelHover = false;
    });


    // Rotación automática al hacer scroll, sin "secuestrar" el scroll de
    // la página (a propósito: eso puede romper el scroll normal, marear
    // en trackpad, o dar problemas de accesibilidad). Es 100% pasivo:
    // solo miramos en qué punto de la página estás y, si toca, llamamos
    // a las MISMAS funciones de rotación que ya usa el clic -> mismo
    // comportamiento, ya probado, cero lógica nueva que pueda romperse.

    let ultimoPasoScroll = 0;

    function calcularPasoScroll() {
        const rect = pilaCarrusel.getBoundingClientRect();
        const alturaVentana = window.innerHeight;

        // 0 = el carrusel todavía no ha entrado por abajo de la pantalla.
        // 1 = el carrusel ya ha terminado de salir por arriba.
        const recorridoTotal = rect.height + alturaVentana;
        const recorrido = alturaVentana - rect.top;
        const progreso = Math.min(1, Math.max(0, recorrido / recorridoTotal));

        // Solo 3 "escalones" (uno por cada imagen del carrusel).
        return Math.min(2, Math.floor(progreso * 3));
    }

    function sincronizarCarruselConScroll() {
        const pasoActual = calcularPasoScroll();

        while (pasoActual > ultimoPasoScroll) {
            rotarHaciaLaIzquierda();
            ultimoPasoScroll++;
        }

        while (pasoActual < ultimoPasoScroll) {
            rotarHaciaLaDerecha();
            ultimoPasoScroll--;
        }
    }

    let scrollEnCurso = false;

    window.addEventListener("scroll", () => {
        if (!scrollEnCurso) {
            requestAnimationFrame(() => {
                sincronizarCarruselConScroll();
                scrollEnCurso = false;
            });
            scrollEnCurso = true;
        }
    });

    sincronizarCarruselConScroll(); // por si la página carga ya scrolleada

}


// Scroll reveal: cada elemento con clase "reveal" aparece con un
// fundido + desplazamiento suave en cuanto entra en la pantalla.

const elementosRevelables = document.querySelectorAll(".reveal");

if (elementosRevelables.length) {

    const observador = new IntersectionObserver((entradas) => {

        entradas.forEach((entrada) => {

            if (entrada.isIntersecting) {
                entrada.target.classList.add("reveal-visible");
                observador.unobserve(entrada.target);
            }

        });

    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -60px 0px",
    });

    elementosRevelables.forEach((elemento) => {
        observador.observe(elemento);
    });

}

// ------------------------------------------------------------------
// Demostración del modo miniatura: un puntero entra en la captura, pulsa
// sobre la nota musical y el reproductor se transforma en la barra
// compacta. Luego vuelve, y se repite en bucle.
//
// Solo se anima mientras la sección está a la vista: si no, estaría
// gastando batería moviendo cosas que nadie ve.
// ------------------------------------------------------------------

const demoMiniatura = document.getElementById("demo-miniatura");

if (demoMiniatura && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {

    const cursor = demoMiniatura.querySelector(".demo-cursor");
    const pulso = demoMiniatura.querySelector(".demo-pulso");

    // Dónde está la nota musical dentro de la captura completa. La ventana
    // mide 300x369 puntos y la portada ocupa de y=29 a y=219, centrada:
    // su centro cae en el 50% horizontal y el 34% vertical.
    const NOTA_X = "50%";
    const NOTA_Y = "34%";

    // Sitio de reposo del puntero: abajo a la derecha, fuera de la ventana.
    const REPOSO_X = "78%";
    const REPOSO_Y = "92%";

    let temporizadores = [];
    let enMarcha = false;

    function programar(retraso, accion) {
        temporizadores.push(setTimeout(accion, retraso));
    }

    function cancelarTodo() {
        temporizadores.forEach(clearTimeout);
        temporizadores = [];
    }

    function colocarCursor(x, y) {
        cursor.style.left = x;
        cursor.style.top = y;
    }

    function hacerClic() {
        // El anillo se dibuja justo donde está el puntero.
        pulso.style.left = cursor.style.left;
        pulso.style.top = cursor.style.top;
        pulso.style.marginLeft = "-8px";
        pulso.style.marginTop = "-8px";

        demoMiniatura.classList.add("demo-pulsando");
        programar(160, () => demoMiniatura.classList.remove("demo-pulsando"));
    }

    function ciclo() {
        if (!enMarcha) return;

        // 1) El puntero aparece abajo a la derecha.
        colocarCursor(REPOSO_X, REPOSO_Y);
        demoMiniatura.classList.add("demo-cursor-visible");

        // 2) Sube hasta la nota musical.
        programar(500, () => colocarCursor(NOTA_X, NOTA_Y));

        // 3) Clic: el reproductor se encoge.
        programar(1650, hacerClic);
        programar(1800, () => demoMiniatura.classList.add("demo-en-mini"));

        // 4) Pausa para que se lea la miniatura, y segundo clic para volver.
        programar(3600, hacerClic);
        programar(3750, () => demoMiniatura.classList.remove("demo-en-mini"));

        // 5) El puntero se retira y el ciclo vuelve a empezar.
        programar(4400, () => colocarCursor(REPOSO_X, REPOSO_Y));
        programar(5000, () => demoMiniatura.classList.remove("demo-cursor-visible"));
        programar(5800, ciclo);
    }

    function arrancar() {
        if (enMarcha) return;
        enMarcha = true;
        ciclo();
    }

    function parar() {
        enMarcha = false;
        cancelarTodo();
        demoMiniatura.classList.remove(
            "demo-cursor-visible", "demo-pulsando", "demo-en-mini"
        );
    }

    const observadorDemo = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) arrancar();
            else parar();
        });
    }, { threshold: 0.35 });

    observadorDemo.observe(demoMiniatura);

    // Si se cambia de pestaña, se pausa: al volver, el ciclo se reanuda
    // desde el principio en vez de aparecer a mitad de la transformación.
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) parar();
    });

}
