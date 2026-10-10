
const rutaDron = [
    { t: 0, x: 0, y: 0 },
    { t: 1, x: 5, y: 2 },
    { t: 2, x: 10, y: 6 },
    { t: 3, x: 15, y: 12 },
    { t: 4, x: 20, y: 16 },
    { t: 5, x: 25, y: 18 }
];

function obtenerElemento(id) {
    return document.getElementById(id);
}

function actualizarTexto(id, texto) {
    const elemento = obtenerElemento(id);

    if (elemento) {
        elemento.textContent = texto;
    }
}

function calcularDatosDron(ruta) {
    const datos = ruta.map((punto, indice) => {
        let vx = 0;
        let vy = 0;

        if (indice > 0) {
            const anterior = ruta[indice - 1];
            const dt = punto.t - anterior.t;

            if (dt !== 0) {
                vx = (punto.x - anterior.x) / dt;
                vy = (punto.y - anterior.y) / dt;
            }
        }

        return {
            ...punto,
            vx,
            vy,
            velocidad: Math.hypot(vx, vy),
            ax: 0,
            ay: 0,
            aceleracion: 0
        };
    });

    datos.forEach((punto, indice) => {
        if (indice > 0) {
            const anterior = datos[indice - 1];
            const dt = punto.t - anterior.t;

            if (dt !== 0) {
                punto.ax = (punto.vx - anterior.vx) / dt;
                punto.ay = (punto.vy - anterior.vy) / dt;
                punto.aceleracion = Math.hypot(
                    punto.ax,
                    punto.ay
                );
            }
        }
    });

    return datos;
}

function dibujarGrafica(id, series, opciones = {}) {
    const canvas = obtenerElemento(id);

    if (!canvas || !canvas.getContext) {
        return;
    }

    const contexto = canvas.getContext("2d");

    if (!contexto) {
        return;
    }

    const escala = window.devicePixelRatio || 1;
    const ancho = Math.max(
        Math.floor(canvas.getBoundingClientRect().width),
        280
    );
    const alto = opciones.alto || 300;

    canvas.style.height = `${alto}px`;
    canvas.width = Math.round(ancho * escala);
    canvas.height = Math.round(alto * escala);

    contexto.setTransform(escala, 0, 0, escala, 0, 0);
    contexto.clearRect(0, 0, ancho, alto);

    const margen = {
        izquierda: 62,
        derecha: 18,
        arriba: 22,
        abajo: 48
    };

    const anchoGrafica = ancho - margen.izquierda - margen.derecha;
    const altoGrafica = alto - margen.arriba - margen.abajo;

    const todosLosPuntos = series.flatMap(serie => serie.points);

    if (todosLosPuntos.length === 0) {
        return;
    }

    const valoresX = todosLosPuntos.map(punto => punto.x);
    const valoresY = todosLosPuntos.map(punto => punto.y);

    const minimoX = opciones.xMin ?? Math.min(0, ...valoresX);
    const maximoX = opciones.xMax ?? Math.max(1, ...valoresX);
    let minimoY = opciones.yMin ?? Math.min(0, ...valoresY);
    let maximoY = opciones.yMax ?? Math.max(1, ...valoresY);

    if (maximoX <= minimoX) {
        return;
    }

    if (maximoY <= minimoY) {
        maximoY = minimoY + 1;
    }

    const convertirX = valor =>
        margen.izquierda +
        ((valor - minimoX) / (maximoX - minimoX)) * anchoGrafica;

    const convertirY = valor =>
        margen.arriba +
        altoGrafica -
        ((valor - minimoY) / (maximoY - minimoY)) * altoGrafica;

    contexto.font = "12px Arial";
    contexto.lineWidth = 1;
    contexto.strokeStyle = "#d7e2ed";
    contexto.fillStyle = "#526579";

    for (let i = 0; i <= 4; i++) {
        const valorY = minimoY + (maximoY - minimoY) * i / 4;
        const posicionY = convertirY(valorY);

        contexto.beginPath();
        contexto.moveTo(margen.izquierda, posicionY);
        contexto.lineTo(ancho - margen.derecha, posicionY);
        contexto.stroke();

        contexto.textAlign = "right";
        contexto.fillText(
            valorY.toFixed(opciones.decimales ?? 1),
            margen.izquierda - 8,
            posicionY + 4
        );
    }

    for (let i = 0; i <= 4; i++) {
        const valorX = minimoX + (maximoX - minimoX) * i / 4;
        const posicionX = convertirX(valorX);

        contexto.beginPath();
        contexto.moveTo(posicionX, margen.arriba);
        contexto.lineTo(posicionX, margen.arriba + altoGrafica);
        contexto.stroke();

        contexto.textAlign = "center";
        contexto.fillText(
            valorX.toFixed(opciones.decimalesX ?? 1),
            posicionX,
            margen.arriba + altoGrafica + 18
        );
    }

    contexto.strokeStyle = "#526579";
    contexto.lineWidth = 1.5;
    contexto.beginPath();
    contexto.moveTo(margen.izquierda, margen.arriba);
    contexto.lineTo(
        margen.izquierda,
        margen.arriba + altoGrafica
    );
    contexto.lineTo(
        ancho - margen.derecha,
        margen.arriba + altoGrafica
    );
    contexto.stroke();

    contexto.fillStyle = "#243247";
    contexto.textAlign = "center";
    contexto.fillText(
        opciones.xLabel || "Tiempo (s)",
        margen.izquierda + anchoGrafica / 2,
        alto - 8
    );

    contexto.save();
    contexto.translate(15, margen.arriba + altoGrafica / 2);
    contexto.rotate(-Math.PI / 2);
    contexto.fillText(opciones.yLabel || "Valor", 0, 0);
    contexto.restore();

    series.forEach(serie => {
        if (!serie.points.length) {
            return;
        }

        contexto.strokeStyle = serie.color;
        contexto.fillStyle = serie.color;
        contexto.lineWidth = 2.5;
        contexto.beginPath();

        serie.points.forEach((punto, indice) => {
            const x = convertirX(punto.x);
            const y = convertirY(punto.y);

            if (indice === 0) {
                contexto.moveTo(x, y);
            } else {
                contexto.lineTo(x, y);
            }
        });

        contexto.stroke();

        serie.points.forEach(punto => {
            contexto.beginPath();
            contexto.arc(
                convertirX(punto.x),
                convertirY(punto.y),
                3.5,
                0,
                Math.PI * 2
            );
            contexto.fill();
        });
    });
}

const datosDron = calcularDatosDron(rutaDron);

function dibujarGraficasDron() {
    dibujarGrafica(
        "graficaPosicion",
        [
            {
                color: "#176b87",
                points: datosDron.map(p => ({ x: p.t, y: p.x }))
            },
            {
                color: "#e09f3e",
                points: datosDron.map(p => ({ x: p.t, y: p.y }))
            }
        ],
        {
            xLabel: "Tiempo (s)",
            yLabel: "Posición (m)",
            xMin: 0,
            xMax: 5,
            yMin: 0,
            yMax: 21
        }
    );

    dibujarGrafica(
        "graficaVelocidad",
        [{
            color: "#27864b",
            points: datosDron.map(p => ({
                x: p.t,
                y: p.velocidad
            }))
        }],
        {
            xLabel: "Tiempo (s)",
            yLabel: "Velocidad (m/s)",
            xMin: 0,
            xMax: 5,
            yMin: 0,
            yMax: 10
        }
    );

    dibujarGrafica(
        "graficaAceleracion",
        [{
            color: "#9b59b6",
            points: datosDron.map(p => ({
                x: p.t,
                y: p.aceleracion
            }))
        }],
        {
            xLabel: "Tiempo (s)",
            yLabel: "Aceleración (m/s²)",
            xMin: 0,
            xMax: 5,
            yMin: 0,
            yMax: 6
        }
    );
}

function actualizarSalto() {
    const impulso = obtenerElemento("impulso");
    const gravedad = obtenerElemento("gravedadSalto");

    if (!impulso || !gravedad) {
        return;
    }

    const velocidadInicial = Number(impulso.value);
    const gravedadValor = Number(gravedad.value);

    if (gravedadValor <= 0) {
        return;
    }

    actualizarTexto("valorImpulso", velocidadInicial.toFixed(0));
    actualizarTexto("valorGravedad", gravedadValor.toFixed(1));

    const tiempoTotal = 2 * velocidadInicial / gravedadValor;
    const alturaMaxima =
        velocidadInicial ** 2 / (2 * gravedadValor);

    actualizarTexto("alturaMaxima", `${alturaMaxima.toFixed(2)} m`);
    actualizarTexto("tiempoTotal", `${tiempoTotal.toFixed(2)} s`);

    const puntos = [];

    for (let i = 0; i <= 100; i++) {
        const tiempo = tiempoTotal * i / 100;
        const altura =
            velocidadInicial * tiempo -
            0.5 * gravedadValor * tiempo ** 2;

        puntos.push({
            x: tiempo,
            y: Math.max(0, altura)
        });
    }

    dibujarGrafica(
        "graficaSalto",
        [{ color: "#176b87", points: puntos }],
        {
            xLabel: "Tiempo (s)",
            yLabel: "Altura (m)",
            xMin: 0,
            xMax: tiempoTotal,
            yMin: 0,
            yMax: Math.max(1, alturaMaxima * 1.2)
        }
    );
}

function actualizarGravedad() {
    const radioElemento = obtenerElemento("radioEstacion");
    const velocidadElemento = obtenerElemento("velocidadAngular");

    if (!radioElemento || !velocidadElemento) {
        return;
    }

    const radio = Number(radioElemento.value);
    const velocidadAngular = Number(velocidadElemento.value);
    const aceleracion = velocidadAngular ** 2 * radio;

    actualizarTexto("valorRadio", radio.toFixed(0));
    actualizarTexto("valorAngular", velocidadAngular.toFixed(2));
    actualizarTexto(
        "aceleracionCentripeta",
        aceleracion.toFixed(2)
    );
}

function actualizarResorte() {
    const desplazamientoElemento = obtenerElemento("desplazamiento");
    const constanteElemento = obtenerElemento("constanteResorte");

    if (!desplazamientoElemento || !constanteElemento) {
        return;
    }

    const desplazamiento = Number(desplazamientoElemento.value);
    const constante = Number(constanteElemento.value);
    const fuerza = -constante * desplazamiento;

    actualizarTexto(
        "valorDesplazamiento",
        desplazamiento.toFixed(2)
    );
    actualizarTexto("valorConstante", constante.toFixed(0));
    actualizarTexto("fuerzaResorte", fuerza.toFixed(2));

    const resorte = obtenerElemento("resorteVisual");

    if (resorte) {
        const longitud = 90 + Math.abs(desplazamiento) * 500;

        resorte.style.width = `${longitud}px`;
        resorte.style.flex = `0 0 ${longitud}px`;
        resorte.style.transform =
            desplazamiento < 0 ? "scaleX(-1)" : "scaleX(1)";
        resorte.style.transformOrigin = "center";
    }

    const puntos = [];

    for (let i = 0; i <= 40; i++) {
        const x = -0.2 + i * 0.01;

        puntos.push({
            x: Number(x.toFixed(2)),
            y: -constante * x
        });
    }

    dibujarGrafica(
        "graficaResorte",
        [{ color: "#9b59b6", points: puntos }],
        {
            xLabel: "Desplazamiento x (m)",
            yLabel: "Fuerza (N)",
            xMin: -0.2,
            xMax: 0.2,
            yMin: -constante * 0.2,
            yMax: constante * 0.2
        }
    );
}

function dibujarGraficaNeumaticos() {
    const puntos = [
        { x: 40, y: 0.35 },
        { x: 50, y: 0.50 },
        { x: 60, y: 0.68 },
        { x: 70, y: 0.83 },
        { x: 80, y: 0.95 },
        { x: 90, y: 1.00 },
        { x: 100, y: 0.96 },
        { x: 110, y: 0.86 },
        { x: 120, y: 0.70 },
        { x: 130, y: 0.53 },
        { x: 140, y: 0.38 }
    ];

    dibujarGrafica(
        "graficaNeumaticos",
        [{ color: "#e07a28", points: puntos }],
        {
            xLabel: "Temperatura ilustrativa (°C)",
            yLabel: "Índice de agarre relativo",
            xMin: 40,
            xMax: 140,
            yMin: 0,
            yMax: 1.1,
            decimalesX: 0,
            decimales: 2
        }
    );
}

function dibujarTodo() {
    dibujarGraficasDron();
    actualizarSalto();
    actualizarGravedad();
    actualizarResorte();
    dibujarGraficaNeumaticos();
}

function configurarEventos() {
    const controles = [
        "impulso",
        "gravedadSalto",
        "radioEstacion",
        "velocidadAngular",
        "desplazamiento",
        "constanteResorte"
    ];

    controles.forEach(id => {
        const elemento = obtenerElemento(id);

        if (elemento) {
            elemento.addEventListener("input", () => {
                if (id === "impulso" || id === "gravedadSalto") {
                    actualizarSalto();
                }

                if (id === "radioEstacion" || id === "velocidadAngular") {
                    actualizarGravedad();
                }

                if (id === "desplazamiento" || id === "constanteResorte") {
                    actualizarResorte();
                }
            });
        }
    });

    const botonReiniciar = obtenerElemento("reiniciarSalto");

    if (botonReiniciar) {
        botonReiniciar.addEventListener("click", () => {
            obtenerElemento("impulso").value = 8;
            obtenerElemento("gravedadSalto").value = 9.8;
            actualizarSalto();
        });
    }

    window.addEventListener("resize", dibujarTodo);
}

function iniciarPortafolio() {
    configurarEventos();
    dibujarTodo();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarPortafolio);
} else {
    iniciarPortafolio();
}
