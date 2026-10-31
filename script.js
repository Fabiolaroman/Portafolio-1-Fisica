const $ = (id) => document.getElementById(id);

const put = (id, value) => {
  const element = $(id);
  if (element) element.textContent = value;
};

function drawChart(id, series, options = {}) {
  const canvas = $(id);
  if (!canvas || !canvas.getContext) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, Math.floor(rect.width || 600));
  const height = options.height || 300;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const points = series.flatMap((item) => item.points || []);
  if (!points.length) return;

  const xMin = options.xMin ?? Math.min(...points.map((point) => point.x));
  const xMax = options.xMax ?? Math.max(...points.map((point) => point.x));
  let yMin = options.yMin ?? Math.min(0, ...points.map((point) => point.y));
  let yMax = options.yMax ?? Math.max(...points.map((point) => point.y));

  if (xMax <= xMin) return;
  if (yMax <= yMin) yMax = yMin + 1;

  const margin = { left: 66, right: 18, top: 30, bottom: 52 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  const X = (value) =>
    margin.left + ((value - xMin) / (xMax - xMin)) * plotWidth;

  const Y = (value) =>
    margin.top + plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

  ctx.font = "11px Arial";
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#d7e2ed";
  ctx.fillStyle = "#526579";

  for (let index = 0; index <= 4; index += 1) {
    const yValue = yMin + ((yMax - yMin) * index) / 4;
    const y = Y(yValue);

    ctx.beginPath();
    ctx.moveTo(margin.left, y);
    ctx.lineTo(width - margin.right, y);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillText(
      yValue.toFixed(options.yDecimals ?? 1),
      margin.left - 9,
      y + 4
    );

    const xValue = xMin + ((xMax - xMin) * index) / 4;
    const x = X(xValue);

    ctx.beginPath();
    ctx.moveTo(x, margin.top);
    ctx.lineTo(x, margin.top + plotHeight);
    ctx.stroke();

    ctx.textAlign = "center";
    const xLabel = options.xFormatter
      ? options.xFormatter(xValue)
      : xValue.toFixed(options.xDecimals ?? 1);

    ctx.fillText(xLabel, x, margin.top + plotHeight + 19);
  }

  ctx.strokeStyle = "#526579";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(margin.left, margin.top);
  ctx.lineTo(margin.left, margin.top + plotHeight);
  ctx.lineTo(width - margin.right, margin.top + plotHeight);
  ctx.stroke();

  if (options.title) {
    ctx.fillStyle = "#243247";
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(options.title, width / 2, 16);
  }

  ctx.fillStyle = "#243247";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    options.xLabel || "x",
    margin.left + plotWidth / 2,
    height - 7
  );

  ctx.save();
  ctx.translate(15, margin.top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(options.yLabel || "y", 0, 0);
  ctx.restore();

  series.forEach((item) => {
    if (!item.points || !item.points.length) return;

    ctx.strokeStyle = item.color || "#176b87";
    ctx.fillStyle = item.color || "#176b87";
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    item.points.forEach((point, index) => {
      const x = X(point.x);
      const y = Y(point.y);

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    if (item.dots !== false) {
      item.points.forEach((point) => {
        ctx.beginPath();
        ctx.arc(X(point.x), Y(point.y), 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  });

  if (options.annotations) {
    options.annotations.forEach((annotation) => {
      const x = X(annotation.x);

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#9aaabd";
      ctx.beginPath();
      ctx.moveTo(x, margin.top + 18);
      ctx.lineTo(x, margin.top + plotHeight);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "#526579";
      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.fillText(annotation.label, x, margin.top + 12);
    });
  }

  if (options.legend) {
    let legendX = margin.left + 8;

    options.legend.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, margin.top + 5, 12, 4);

      ctx.fillStyle = "#243247";
      ctx.textAlign = "left";
      ctx.fillText(item.label, legendX + 17, margin.top + 11);

      legendX += ctx.measureText(item.label).width + 42;
    });
  }
}

function drawStackedEnergy() {
  const canvas = $("graficaEnergia");
  if (!canvas || !canvas.getContext) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, Math.floor(rect.width || 600));
  const height = 310;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = { left: 68, right: 22, top: 34, bottom: 58 };
  const plotHeight = height - margin.top - margin.bottom;
  const maxValue = 3000;

  const y = (value) =>
    margin.top + plotHeight - (value / maxValue) * plotHeight;

  ctx.font = "11px Arial";
  ctx.fillStyle = "#526579";
  ctx.strokeStyle = "#d7e2ed";

  for (let i = 0; i <= 5; i += 1) {
    const value = (maxValue / 5) * i;
    const py = y(value);

    ctx.beginPath();
    ctx.moveTo(margin.left, py);
    ctx.lineTo(width - margin.right, py);
    ctx.stroke();

    ctx.textAlign = "right";
    ctx.fillText(value.toFixed(0), margin.left - 9, py + 4);
  }

  const barWidth = Math.min(
    90,
    (width - margin.left - margin.right) / 5
  );

  const centers = [width * 0.34, width * 0.70];
  const total = 2594;
  const reused = 1960;
  const difference = 634;

  const drawBar = (center, value, color, bottomValue = 0) => {
    const top = y(bottomValue + value);
    const bottom = y(bottomValue);

    ctx.fillStyle = color;
    ctx.fillRect(center - barWidth / 2, top, barWidth, bottom - top);

    ctx.fillStyle = "#243247";
    ctx.font = "bold 11px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${value.toLocaleString("es-CR")} kJ`,
      center,
      top - 7
    );
  };

  drawBar(centers[0], total, "#176b87");
  drawBar(centers[1], reused, "#16a36a");
  drawBar(centers[1], difference, "#e09f3e", reused);

  ctx.fillStyle = "#243247";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Energía de frenado", centers[0], height - 30);
  ctx.fillText("Desglose del balance", centers[1], height - 30);

  ctx.font = "bold 12px Arial";
  ctx.fillText(
    "Balance de energía · ciclo urbano FTP",
    width / 2,
    17
  );

  ctx.save();
  ctx.translate(15, margin.top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Energía (kJ)", 0, 0);
  ctx.restore();

  const legendY = height - 10;
  ctx.font = "10px Arial";
  ctx.textAlign = "left";

  ctx.fillStyle = "#16a36a";
  ctx.fillRect(margin.left + 2, legendY - 8, 9, 9);

  ctx.fillStyle = "#243247";
  ctx.fillText("Reutilizada", margin.left + 15, legendY);

  ctx.fillStyle = "#e09f3e";
  ctx.fillRect(width - 145, legendY - 8, 9, 9);

  ctx.fillStyle = "#243247";
  ctx.fillText("Diferencia", width - 130, legendY);
}

const droneRoute = [
  { t: 0, x: 0, y: 0 },
  { t: 1, x: 5, y: 2 },
  { t: 2, x: 10, y: 6 },
  { t: 3, x: 15, y: 12 },
  { t: 4, x: 20, y: 16 },
  { t: 5, x: 25, y: 18 }
];

function calculateDroneData() {
  const data = droneRoute.map((point) => ({
    ...point,
    vx: 0,
    vy: 0,
    ax: 0,
    ay: 0
  }));

  data.forEach((point, index) => {
    const previous = data[Math.max(0, index - 1)];
    const next = data[Math.min(data.length - 1, index + 1)];
    const elapsed = next.t - previous.t;

    point.vx = elapsed ? (next.x - previous.x) / elapsed : 0;
    point.vy = elapsed ? (next.y - previous.y) / elapsed : 0;
  });

  data.forEach((point, index) => {
    const previous = data[Math.max(0, index - 1)];
    const next = data[Math.min(data.length - 1, index + 1)];
    const elapsed = next.t - previous.t;

    point.ax = elapsed
      ? (next.vx - previous.vx) / elapsed
      : 0;

    point.ay = elapsed
      ? (next.vy - previous.vy) / elapsed
      : 0;

    point.speed = Math.hypot(point.vx, point.vy);
    point.acceleration = Math.hypot(point.ax, point.ay);
  });

  return data;
}

function drawDrone() {
  const data = calculateDroneData();

  drawChart("graficaPosicion", [
    {
      color: "#176b87",
      points: data.map((point) => ({
        x: point.t,
        y: point.x
      }))
    },
    {
      color: "#e09f3e",
      points: data.map((point) => ({
        x: point.t,
        y: point.y
      }))
    }
  ], {
    xMin: 0,
    xMax: 5,
    yMin: 0,
    yMax: 28,
    xLabel: "Tiempo (s)",
    yLabel: "Posición (m)",
    xDecimals: 2,
    legend: [
      { label: "x(t)", color: "#176b87" },
      { label: "y(t)", color: "#e09f3e" }
    ]
  });

  drawChart("graficaVelocidad", [
    {
      color: "#27864b",
      points: data.map((point) => ({
        x: point.t,
        y: point.speed
      }))
    }
  ], {
    xMin: 0,
    xMax: 5,
    yMin: 0,
    yMax: 8,
    xLabel: "Tiempo (s)",
    yLabel: "Rapidez (m/s)",
    xDecimals: 2
  });

  drawChart("graficaAceleracion", [
    {
      color: "#9b59b6",
      points: data.map((point) => ({
        x: point.t,
        y: point.acceleration
      }))
    }
  ], {
    xMin: 0,
    xMax: 5,
    yMin: 0,
    yMax: 2,
    xLabel: "Tiempo (s)",
    yLabel: "Aceleración (m/s²)",
    xDecimals: 2
  });
}

function updateJump() {
  if (!$("impulso") || !$("gravedadSalto")) return;

  const initialVelocity = Number($("impulso").value);
  const gravity = Number($("gravedadSalto").value);

  const totalTime = (2 * initialVelocity) / gravity;
  const maxHeight = (initialVelocity ** 2) / (2 * gravity);

  put("valorImpulso", initialVelocity.toFixed(0));
  put("valorGravedad", gravity.toFixed(1));
  put("alturaMaxima", `${maxHeight.toFixed(2)} m`);
  put("tiempoTotal", `${totalTime.toFixed(2)} s`);

  const points = Array.from({ length: 101 }, (_, index) => {
    const time = (totalTime * index) / 100;

    return {
      x: time,
      y: Math.max(
        0,
        initialVelocity * time - 0.5 * gravity * time ** 2
      )
    };
  });

  drawChart(
    "graficaSalto",
    [{ color: "#176b87", points, dots: false }],
    {
      xMin: 0,
      xMax: totalTime,
      yMin: 0,
      yMax: Math.max(1, maxHeight * 1.2),
      xLabel: "Tiempo (s)",
      yLabel: "Altura (m)"
    }
  );
}

function updateGravity() {
  if (!$("radioEstacion") || !$("gravedadObjetivo")) return;

  const radius = Number($("radioEstacion").value);
  const targetGravity = Number($("gravedadObjetivo").value);

  const angularVelocity = Math.sqrt(targetGravity / radius);
  const rpm = (angularVelocity * 60) / (2 * Math.PI);

  put("valorRadio", radius.toFixed(0));
  put("valorGObjetivo", targetGravity.toFixed(2));
  put("omegaNecesaria", angularVelocity.toFixed(3));
  put("rpmNecesaria", rpm.toFixed(2));
}

function updateSpring() {
  if (!$("desplazamiento") || !$("constanteResorte")) return;

  const displacement = Number($("desplazamiento").value);
  const springConstant = Number($("constanteResorte").value);
  const force = -springConstant * displacement;

  put("valorDesplazamiento", displacement.toFixed(2));
  put("valorConstante", springConstant.toFixed(0));
  put("fuerzaResorte", force.toFixed(2));

  const spring = $("resorteVisual");

  if (spring) {
    const visualWidth = 140 + displacement * 250;
    spring.style.width = `${visualWidth}px`;
    spring.style.flexBasis = `${visualWidth}px`;
    spring.style.transform = "none";
  }

  const points = Array.from({ length: 41 }, (_, index) => {
    const x = -0.2 + index * 0.01;

    return {
      x,
      y: -springConstant * x
    };
  });

  drawChart(
    "graficaResorte",
    [{ color: "#9b59b6", points, dots: false }],
    {
      xMin: -0.2,
      xMax: 0.2,
      yMin: -springConstant * 0.22,
      yMax: springConstant * 0.22,
      xLabel: "Desplazamiento x (m)",
      yLabel: "Fuerza (N)",
      xDecimals: 2,
      yDecimals: 0
    }
  );
}

function drawTires() {
  const referenceLoad = 4;
  const referenceMu = 1.6;
  const sensitivity = 0.15;

  const loadSensitive = [];
  const constantCoefficient = [];

  for (let load = 0.5; load <= 8.001; load += 0.5) {
    const mu =
      referenceMu *
      (1 - sensitivity * ((load - referenceLoad) / referenceLoad));

    loadSensitive.push({
      x: load,
      y: mu * load
    });

    constantCoefficient.push({
      x: load,
      y: referenceMu * load
    });
  }

  drawChart("graficaNeumaticos", [
    {
      color: "#e07a28",
      points: constantCoefficient,
      dots: false
    },
    {
      color: "#176b87",
      points: loadSensitive,
      dots: false
    }
  ], {
    xMin: 0,
    xMax: 8,
    yMin: 0,
    yMax: 14,
    xLabel: "Carga vertical Fz (kN)",
    yLabel: "Fuerza lateral máxima (kN)",
    legend: [
      { label: "μ fijo", color: "#e07a28" },
      { label: "μ con carga", color: "#176b87" }
    ]
  });
}

function drawVoyager() {
  const jupiter = 1979 + 190 / 365;
  const saturn = 1981 + 238 / 365;
  const uranus = 1986 + 24 / 365;
  const neptune = 1989 + 237 / 365;

  const points = [
    { x: 1978.95, y: 12.6 },
    { x: jupiter, y: 12.6 },
    { x: jupiter, y: 22.6 },
    { x: saturn, y: 22.6 },
    { x: saturn, y: 27.6 },
    { x: uranus, y: 27.6 },
    { x: uranus, y: 29.6 },
    { x: neptune, y: 29.6 },
    { x: neptune, y: 27.6 }
  ];

  drawChart(
    "graficaVoyager",
    [{ color: "#176b87", points, dots: true }],
    {
      xMin: 1978,
      xMax: 1990,
      yMin: 10,
      yMax: 32,
      xLabel: "Año",
      yLabel: "Rapidez heliocéntrica esquemática (km/s)",
      xFormatter: (value) => Math.round(value).toString(),
      annotations: [
        { x: jupiter, label: "Júpiter" },
        { x: saturn, label: "Saturno" },
        { x: uranus, label: "Urano" },
        { x: neptune, label: "Neptuno" }
      ]
    }
  );
}

const initialBounceHeight = 2;

let bounceFrame = null;
let bounceRunning = false;
let bounceHeight = initialBounceHeight;
let bounceVelocity = 0;
let previousBounceTime = 0;
let bounceCount = 0;

function drawBounceScene() {
  const canvas = $("canvasRebote");

  if (!canvas || !canvas.getContext) return;

  const width = Math.max(280, canvas.clientWidth || 500);
  const height = 320;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#f4f8fb";
  ctx.fillRect(0, 0, width, height);

  const ground = height - 30;
  const ballRadius = 16;
  const pixelsPerMeter = (height - 90) / initialBounceHeight;
  const ballY =
    ground - bounceHeight * pixelsPerMeter - ballRadius;

  ctx.fillStyle = "#526579";
  ctx.fillRect(15, ground, width - 30, 4);

  ctx.fillStyle = "#176b87";
  ctx.beginPath();
  ctx.arc(
    width / 2,
    Math.max(22, ballY),
    ballRadius,
    0,
    Math.PI * 2
  );
  ctx.fill();

  const coefficient = Number(
    $("coefRestitucion")?.value ?? 0.75
  );

  ctx.fillStyle = "#243247";
  ctx.font = "13px Arial";
  ctx.textAlign = "left";

  ctx.fillText(
    `e = ${coefficient.toFixed(2)} · rebotes: ${bounceCount}`,
    18,
    24
  );

  ctx.fillText(
    `Altura actual: ${bounceHeight.toFixed(2)} m`,
    18,
    44
  );
}

function drawBounceHeightChart() {
  const coefficient = Number(
    $("coefRestitucion")?.value ?? 0.75
  );

  const points = Array.from({ length: 6 }, (_, index) => ({
    x: index,
    y: initialBounceHeight * coefficient ** (2 * index)
  }));

  drawChart(
    "graficaRebote",
    [{ color: "#7c3aed", points }],
    {
      xMin: 0,
      xMax: 5,
      yMin: 0,
      yMax: initialBounceHeight * 1.1,
      xLabel: "Número de rebote",
      yLabel: "Altura máxima (m)",
      xDecimals: 0,
      yDecimals: 2
    }
  );
}

function updateRestitution() {
  const slider = $("coefRestitucion");
  if (!slider) return;

  const coefficient = Number(slider.value);
  const nextHeight = initialBounceHeight * coefficient ** 2;

  put("valorRestitucion", coefficient.toFixed(2));
  put("alturaRebote", nextHeight.toFixed(2));

  drawBounceHeightChart();

  if (!bounceRunning) drawBounceScene();
}

function animateBounce(timestamp) {
  if (!bounceRunning) return;

  if (!previousBounceTime) {
    previousBounceTime = timestamp;
  }

  const delta = Math.min(
    (timestamp - previousBounceTime) / 1000,
    0.03
  );

  previousBounceTime = timestamp;

  const gravity = 9.81;
  const coefficient = Number(
    $("coefRestitucion")?.value ?? 0.75
  );

  bounceVelocity -= gravity * delta;
  bounceHeight += bounceVelocity * delta;

  if (bounceHeight <= 0) {
    bounceHeight = 0;
    bounceVelocity = Math.abs(bounceVelocity) * coefficient;
    bounceCount += 1;

    if (bounceVelocity < 0.25 && coefficient < 1) {
      bounceRunning = false;
    }
  }

  drawBounceScene();

  if (bounceRunning) {
    bounceFrame = requestAnimationFrame(animateBounce);
  } else {
    bounceFrame = null;
  }
}

function startBounce() {
  if (bounceFrame) {
    cancelAnimationFrame(bounceFrame);
  }

  bounceHeight = initialBounceHeight;
  bounceVelocity = 0;
  bounceCount = 0;
  previousBounceTime = 0;
  bounceRunning = true;

  drawBounceScene();

  bounceFrame = requestAnimationFrame(animateBounce);
}

function resetBounce() {
  bounceRunning = false;

  if (bounceFrame) {
    cancelAnimationFrame(bounceFrame);
  }

  bounceFrame = null;
  bounceHeight = initialBounceHeight;
  bounceVelocity = 0;
  bounceCount = 0;
  previousBounceTime = 0;

  drawBounceScene();
}

function setup() {
  drawDrone();
  updateJump();
  updateGravity();
  updateSpring();
  drawTires();
  drawStackedEnergy();
  drawVoyager();
  updateRestitution();
  drawBounceScene();

  ["impulso", "gravedadSalto"].forEach((id) => {
    $(id)?.addEventListener("input", updateJump);
  });

  ["radioEstacion", "gravedadObjetivo"].forEach((id) => {
    $(id)?.addEventListener("input", updateGravity);
  });

  ["desplazamiento", "constanteResorte"].forEach((id) => {
    $(id)?.addEventListener("input", updateSpring);
  });

  $("reiniciarSalto")?.addEventListener("click", () => {
    if ($("impulso")) $("impulso").value = 8;
    if ($("gravedadSalto")) $("gravedadSalto").value = 9.8;

    updateJump();
  });

  $("coefRestitucion")?.addEventListener(
    "input",
    updateRestitution
  );

  $("iniciarRebote")?.addEventListener("click", startBounce);
  $("reiniciarRebote")?.addEventListener("click", resetBounce);

  document.querySelectorAll("[data-restitution]").forEach((button) => {
    button.addEventListener("click", () => {
      const slider = $("coefRestitucion");
      if (!slider) return;

      slider.value = button.dataset.restitution;

      updateRestitution();
      resetBounce();
    });
  });

  $("menuToggle")?.addEventListener("click", () => {
    const links = $("navLinks");
    if (!links) return;

    links.classList.toggle("open");

    $("menuToggle").setAttribute(
      "aria-expanded",
      String(links.classList.contains("open"))
    );
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      $("navLinks")?.classList.remove("open");
      $("menuToggle")?.setAttribute("aria-expanded", "false");
    });
  });

  let resizeTimer;

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      drawDrone();
      updateJump();
      updateSpring();
      drawTires();
      drawStackedEnergy();
      drawVoyager();
      drawBounceHeightChart();

      if (!bounceRunning) {
        drawBounceScene();
      }
    }, 150);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setup);
} else {
  setup();
}