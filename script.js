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

    if (item.line !== false) ctx.stroke();

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

  put("valorImpulso", initialVelocity.toFixed(1));
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

/* =====================================================
   MODELOS NUEVOS DE LA ENTREGA FINAL
   ===================================================== */

/* ---------- Tema 2: diseño inverso del salto ---------- */
function jumpDesign(height, airTime) {
  // hmax = v0²/(2g) y T = 2v0/g  ->  v0 = 4H/T  y  g = 8H/T²
  return {
    v0: (4 * height) / airTime,
    g: (8 * height) / airTime ** 2
  };
}

function updateJumpDesign() {
  if (!$("alturaDeseada") || !$("tiempoDeseado")) return;

  const height = Number($("alturaDeseada").value);
  const airTime = Number($("tiempoDeseado").value);
  const design = jumpDesign(height, airTime);

  put("valorAlturaDeseada", height.toFixed(2));
  put("valorTiempoDeseado", airTime.toFixed(2));
  put("v0Diseno", design.v0.toFixed(2));
  put("gDiseno", design.g.toFixed(2));
  put("hComprobada", ((design.v0 ** 2) / (2 * design.g)).toFixed(2));
  put("tComprobado", ((2 * design.v0) / design.g).toFixed(2));
}

function applyJumpDesign() {
  const height = Number($("alturaDeseada").value);
  const airTime = Number($("tiempoDeseado").value);
  const design = jumpDesign(height, airTime);

  $("impulso").value = design.v0.toFixed(1);
  $("gravedadSalto").value = design.g.toFixed(1);
  updateJump();
}

/* ---------- Tema 6: reparto de la energía a lo largo de un ciclo ---------- */
const urbanCycle = {
  mass: 1600,      // kg, masa de prueba aproximada (supuesto)
  cdA: 0.67,       // m², Cd·A aproximado (supuesto)
  crr: 0.010,      // coeficiente de rodadura (supuesto)
  rho: 1.2,        // kg/m³
  etaDrive: 0.90,  // batería -> rueda al traccionar (supuesto)
  etaRegen: 0.80,  // rueda -> batería al regenerar (supuesto)
  pRegenMax: 25e3, // W, potencia máxima de regeneración en la rueda (supuesto)
  vCutoff: 8 / 3.6, // m/s, por debajo de 8 km/h frenan solo los frenos de fricción
  // puntos (t en s, rapidez en km/h) del ciclo urbano propio con cuatro paradas
  profile: [
    [0, 0], [10, 0], [22, 40], [40, 40], [54, 0],
    [64, 0], [80, 50], [102, 50], [112, 0],
    [122, 0], [136, 30], [156, 30], [160, 0],
    [170, 0], [188, 55], [218, 55], [224, 0], [234, 0]
  ]
};

function cycleSpeed(t) {
  const p = urbanCycle.profile;
  for (let i = 1; i < p.length; i += 1) {
    if (t <= p[i][0]) {
      const k = (t - p[i - 1][0]) / (p[i][0] - p[i - 1][0]);
      return (p[i - 1][1] + k * (p[i][1] - p[i - 1][1])) / 3.6;
    }
  }
  return 0;
}

function simulateCycle() {
  const c = urbanCycle;
  const dt = 0.5;
  const end = c.profile[c.profile.length - 1][0];
  const speed = [];
  const energy = [];
  const events = [];
  const total = { draw: 0, resist: 0, avail: 0, regenWheel: 0, regenBattery: 0, friction: 0, convLoss: 0 };
  let current = null;

  for (let t = 0; t <= end + 1e-9; t += dt) {
    const v = cycleSpeed(t);
    const a = (cycleSpeed(t + 0.01) - cycleSpeed(t - 0.01)) / 0.02;
    const fRoll = v > 0.05 ? c.crr * c.mass * 9.81 : 0;
    const fAero = 0.5 * c.rho * c.cdA * v * v;
    const power = (c.mass * a + fRoll + fAero) * v;   // potencia en la rueda (W)

    if (power > 0) {
      total.draw += (power / c.etaDrive) * dt;
    } else if (power < 0) {
      const avail = -power;
      const regenWheel = v > c.vCutoff ? Math.min(avail, c.pRegenMax) : 0;
      total.avail += avail * dt;
      total.regenWheel += regenWheel * dt;
      total.regenBattery += c.etaRegen * regenWheel * dt;
      total.convLoss += (1 - c.etaRegen) * regenWheel * dt;
      total.friction += (avail - regenWheel) * dt;

      if (!current) current = { start: t, vStart: v * 3.6, avail: 0, regenWheel: 0, friction: 0 };
      current.avail += avail * dt;
      current.regenWheel += regenWheel * dt;
      current.friction += (avail - regenWheel) * dt;
    }

    if (power >= 0 && current) {
      events.push(current);
      current = null;
    }

    total.resist += (fRoll + fAero) * v * dt;
    speed.push({ x: t, y: v * 3.6 });
    energy.push({
      t,
      draw: total.draw / 1000,
      avail: total.avail / 1000,
      regenBattery: total.regenBattery / 1000,
      friction: total.friction / 1000
    });
  }

  if (current) events.push(current);
  return { speed, energy, events, total };
}

function drawUrbanCycle() {
  if (!$("graficaCicloVel") || !$("graficaCicloEnergia")) return;

  const result = simulateCycle();
  const end = urbanCycle.profile[urbanCycle.profile.length - 1][0];

  drawChart("graficaCicloVel", [
    { color: "#176b87", points: result.speed, dots: false }
  ], {
    height: 220,
    xMin: 0,
    xMax: end,
    yMin: 0,
    yMax: 60,
    xLabel: "Tiempo (s)",
    yLabel: "Rapidez (km/h)",
    xDecimals: 0,
    yDecimals: 0
  });

  const series = (key, color) => ({
    color,
    dots: false,
    points: result.energy.map((row) => ({ x: row.t, y: row[key] }))
  });

  drawChart("graficaCicloEnergia", [
    series("avail", "#176b87"),
    series("regenBattery", "#16a36a"),
    series("friction", "#e09f3e")
  ], {
    xMin: 0,
    xMax: end,
    yMin: 0,
    xLabel: "Tiempo (s)",
    yLabel: "Energía acumulada (kJ)",
    xDecimals: 0,
    yDecimals: 0,
    legend: [
      { label: "Energía de frenado disponible", color: "#176b87" },
      { label: "Llega a la batería", color: "#16a36a" },
      { label: "Frenos de fricción", color: "#e09f3e" }
    ]
  });

  const tot = result.total;
  const reused = (tot.regenBattery * urbanCycle.etaDrive) / tot.avail;

  put("cicloTraccion", `${(tot.draw / 1000).toFixed(0)} kJ`);
  put("cicloDisponible", `${(tot.avail / 1000).toFixed(0)} kJ`);
  put("cicloBateria", `${(tot.regenBattery / 1000).toFixed(0)} kJ`);
  put("cicloFriccion", `${(tot.friction / 1000).toFixed(0)} kJ`);
  put("cicloConversion", `${(tot.convLoss / 1000).toFixed(0)} kJ`);
  put("cicloReutilizada", `${(reused * 100).toFixed(1).replace(".", ",")} %`);
  put("cicloAhorro", `${((tot.regenBattery / tot.draw) * 100).toFixed(1).replace(".", ",")} %`);

  const body = $("tablaFrenadas");
  if (body) {
    body.innerHTML = result.events
      .filter((event) => event.avail > 2000)
      .map((event, index) => {
        const share = (event.regenWheel * urbanCycle.etaRegen) / event.avail;
        return `<tr><td>${index + 1}</td><td>${event.vStart.toFixed(0)} km/h</td><td>${(event.avail / 1000).toFixed(0)} kJ</td><td>${(share * 100).toFixed(0)} %</td><td>${(event.friction / 1000).toFixed(0)} kJ</td></tr>`;
      })
      .join("");
  }
}

/* ---------- Tema 9: modelo físico de la rapidez heliocéntrica de Voyager 2 ---------- */
const GM_SUN = 1.32712440018e11; // km³/s²
const AU_KM = 1.495978707e8;     // km

function speedAtDistance(v1, r1, r) {
  // conservación de la energía mecánica en el campo del Sol: v² − 2GM/r = constante
  const v2 = v1 * v1 - 2 * GM_SUN * (1 / (r1 * AU_KM) - 1 / (r * AU_KM));
  return Math.sqrt(Math.max(v2, 0));
}

const voyagerModel = (() => {
  // Distancias heliocéntricas de cada planeta en la fecha del encuentro, calculadas con
  // los elementos keplerianos de JPL (Tabla 1, 1800-2050): ver nota de la sección.
  const encounters = [
    { name: "Júpiter", year: 1979 + 190 / 365, r: 5.331, boost: 10 },
    { name: "Saturno", year: 1981 + 237 / 365, r: 9.591, boost: 4 },
    { name: "Urano", year: 1986 + 23 / 365, r: 19.115, boost: 2 },
    { name: "Neptuno", year: 1989 + 236 / 365, r: 30.211, boost: -3 }
  ];
  const vDec = 12.6;      // km/s, diciembre de 1978 (informe del JPL)
  const vJupiterIn = 10.5; // km/s, rapidez antes de Júpiter (valor aproximado de un curso de RIT)
  const tDec = 1978 + 349 / 365;
  // distancia de Voyager 2 en diciembre de 1978 que implica la conservación de la energía
  const rDec = 1 / (1 / (encounters[0].r * AU_KM) + (vDec ** 2 - vJupiterIn ** 2) / (2 * GM_SUN)) / AU_KM;

  const points = [{ x: tDec, y: vDec }];
  const jumps = [];
  let vStart = vDec;
  let rStart = rDec;
  let tStart = tDec;

  encounters.forEach((enc) => {
    const steps = 24;
    for (let k = 1; k <= steps; k += 1) {
      const f = k / steps;
      // simplificación: la distancia crece de forma lineal entre encuentros
      const r = rStart + (enc.r - rStart) * f;
      points.push({ x: tStart + (enc.year - tStart) * f, y: speedAtDistance(vStart, rStart, r) });
    }
    const vBefore = speedAtDistance(vStart, rStart, enc.r);
    const vAfter = vBefore + enc.boost;
    points.push({ x: enc.year, y: vAfter });
    jumps.push({ name: enc.name, year: enc.year, before: vBefore, after: vAfter, r: enc.r });
    vStart = vAfter;
    rStart = enc.r;
    tStart = enc.year;
  });

  // curva rapidez-distancia para la validación con el dato de la NASA (116 AU)
  const byDistance = [];
  let seg = { v: vDec, r: rDec };
  const marks = [rDec, ...encounters.map((e) => e.r)];
  for (let i = 0; i < marks.length; i += 1) {
    const rEnd = i + 1 < marks.length ? marks[i + 1] : 120;
    const n = 40;
    for (let k = 0; k <= n; k += 1) {
      const r = seg.r + ((rEnd - seg.r) * k) / n;
      byDistance.push({ x: r, y: speedAtDistance(seg.v, seg.r, r) });
    }
    if (i + 1 < marks.length) {
      const vb = speedAtDistance(seg.v, seg.r, rEnd);
      const va = vb + encounters[i].boost;
      byDistance.push({ x: rEnd, y: va });
      seg = { v: va, r: rEnd };
    }
  }

  return { points, jumps, byDistance, rDec, tDec, encounters, vAt116: speedAtDistance(vStart, rStart, 116.167) };
})();

function drawVoyager() {
  const model = voyagerModel;

  drawChart(
    "graficaVoyager",
    [{ color: "#176b87", points: model.points, dots: false }],
    {
      xMin: 1978.5,
      xMax: 1990,
      yMin: 10,
      yMax: 24,
      xLabel: "Año",
      yLabel: "Rapidez respecto al Sol (km/s)",
      xFormatter: (value) => Math.round(value).toString(),
      annotations: model.jumps.map((jump) => ({ x: jump.year, label: jump.name }))
    }
  );

  const escape = [];
  for (let r = 4.6; r <= 120; r += 1.4) {
    escape.push({ x: r, y: Math.sqrt((2 * GM_SUN) / (r * AU_KM)) });
  }

  drawChart(
    "graficaVoyagerDistancia",
    [
      { color: "#c9d4df", points: escape, dots: false },
      { color: "#176b87", points: model.byDistance, dots: false },
      { color: "#d65c4a", points: [{ x: 116.167, y: 15.4 }], dots: true, line: false }
    ],
    {
      xMin: 0,
      xMax: 120,
      yMin: 0,
      yMax: 26,
      xLabel: "Distancia al Sol (UA)",
      yLabel: "Rapidez (km/s)",
      xDecimals: 0,
      legend: [
        { label: "Rapidez de escape", color: "#c9d4df" },
        { label: "Modelo", color: "#176b87" },
        { label: "Dato NASA (116 UA)", color: "#d65c4a" }
      ]
    }
  );

  const lines = model.jumps.map((jump) =>
    `${jump.name}: ${jump.before.toFixed(1).replace(".", ",")} → ${jump.after.toFixed(1).replace(".", ",")} km/s`
  );
  put("tablaVoyager", lines.join(" · "));
  put("voyagerRDec", model.rDec.toFixed(2).replace(".", ","));
  put("voyagerFinal", model.vAt116.toFixed(1).replace(".", ","));
}

/* ---------- Tema 10: resorte amortiguado ---------- */
function springResponse(k, c, m, t) {
  // x(t) hacia un objetivo de 1, con x(0) = 0 y v(0) = 0
  const wn = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));

  if (Math.abs(zeta - 1) < 1e-3) {
    return 1 - Math.exp(-wn * t) * (1 + wn * t);
  }

  if (zeta < 1) {
    const wd = wn * Math.sqrt(1 - zeta ** 2);
    return 1 - Math.exp(-zeta * wn * t) * (Math.cos(wd * t) + ((zeta * wn) / wd) * Math.sin(wd * t));
  }

  const root = Math.sqrt(zeta ** 2 - 1);
  const s1 = -wn * (zeta - root);
  const s2 = -wn * (zeta + root);
  return 1 - (s2 * Math.exp(s1 * t) - s1 * Math.exp(s2 * t)) / (s2 - s1);
}

function springStats(k, c, m) {
  const wn = Math.sqrt(k / m);
  const zeta = c / (2 * Math.sqrt(k * m));
  const overshoot = zeta < 1 ? Math.exp((-Math.PI * zeta) / Math.sqrt(1 - zeta ** 2)) * 100 : 0;
  let settling = 0;

  for (let t = 0; t <= 30; t += 0.005) {
    if (Math.abs(springResponse(k, c, m, t) - 1) > 0.02) settling = t;
  }

  let regime = "subamortiguado";
  if (Math.abs(zeta - 1) <= 0.02) regime = "crítico";
  else if (zeta > 1) regime = "sobreamortiguado";

  return { wn, zeta, overshoot, settling: settling + 0.005, regime };
}

let springAnimStart = 0;
let springAnimFrame = null;

function springValues() {
  return {
    k: Number($("rigidez")?.value ?? 100),
    c: Number($("amortiguamiento")?.value ?? 10),
    m: Number($("masaSpring")?.value ?? 1)
  };
}

function updateSpringAnimation() {
  if (!$("rigidez")) return;

  const { k, c, m } = springValues();
  const stats = springStats(k, c, m);

  put("valorRigidez", k.toFixed(0));
  put("valorAmortiguamiento", c.toFixed(0));
  put("valorMasaSpring", m.toFixed(1));
  put("springZeta", stats.zeta.toFixed(2));
  put("springRegimen", stats.regime);
  put("springWn", stats.wn.toFixed(2));
  put("springSobreimpulso", `${stats.overshoot.toFixed(1)} %`);
  put("springAsentamiento", `${stats.settling.toFixed(2)} s`);

  const tMax = Math.min(8, Math.max(1.2, stats.settling * 1.25));
  const points = Array.from({ length: 241 }, (_, index) => {
    const t = (tMax * index) / 240;
    return { x: t, y: springResponse(k, c, m, t) };
  });
  const peak = Math.max(1.05, ...points.map((point) => point.y));

  drawChart("graficaSpring", [
    { color: "#e09f3e", points: [{ x: 0, y: 1 }, { x: tMax, y: 1 }], dots: false },
    { color: "#176b87", points, dots: false }
  ], {
    xMin: 0,
    xMax: tMax,
    yMin: 0,
    yMax: peak * 1.08,
    xLabel: "Tiempo (s)",
    yLabel: "Posición (objetivo = 1)",
    xDecimals: 2,
    yDecimals: 2,
    legend: [
      { label: "Objetivo", color: "#e09f3e" },
      { label: "x(t)", color: "#176b87" }
    ]
  });

  drawSpringBox(springResponse(k, c, m, 0));
}

function drawSpringBox(position) {
  const box = $("springBox");
  const track = $("springTrack");
  if (!box || !track) return;

  const room = track.clientWidth - box.offsetWidth - 8;
  box.style.transform = `translateX(${position * room}px)`;
}

function playSpring() {
  if (springAnimFrame) cancelAnimationFrame(springAnimFrame);

  const { k, c, m } = springValues();
  springAnimStart = 0;

  const step = (timestamp) => {
    if (!springAnimStart) springAnimStart = timestamp;
    const t = (timestamp - springAnimStart) / 1000;

    drawSpringBox(springResponse(k, c, m, t));

    if (t < 8) {
      springAnimFrame = requestAnimationFrame(step);
    } else {
      springAnimFrame = null;
      drawSpringBox(1);
    }
  };

  springAnimFrame = requestAnimationFrame(step);
}

function setSpring(k, c, m) {
  $("rigidez").value = k;
  $("amortiguamiento").value = c;
  $("masaSpring").value = m;
  updateSpringAnimation();
  playSpring();
}

function criticalSpring() {
  const k = Number($("rigidez").value);
  const m = Number($("masaSpring").value);
  const c = Math.min(100, 2 * Math.sqrt(k * m));
  $("amortiguamiento").value = c.toFixed(0);
  updateSpringAnimation();
  playSpring();
}

/* ---------- Tema 11: síntesis aditiva ---------- */
const timbres = {
  a: { name: "Muestra A", color: "#176b87", harmonics: [1, 3, 5, 7, 9].map((n) => ({ n, amp: 1 / n })) },
  b: { name: "Muestra B", color: "#e07a28", harmonics: Array.from({ length: 10 }, (_, i) => ({ n: i + 1, amp: 1 / (i + 1) })) }
};
const baseFrequency = 220;

function timbreWave(timbre, t) {
  const sum = timbre.harmonics.reduce((acc, h) => acc + h.amp * Math.sin(2 * Math.PI * h.n * baseFrequency * t), 0);
  return sum;
}

function drawTimbres() {
  if (!$("graficaOndaA") || !$("graficaOndaB")) return;

  const period = 1 / baseFrequency;
  const length = period * 3;

  ["a", "b"].forEach((key) => {
    const timbre = timbres[key];
    const raw = Array.from({ length: 400 }, (_, i) => {
      const t = (length * i) / 399;
      return { x: t * 1000, y: timbreWave(timbre, t) };
    });
    const peak = Math.max(...raw.map((p) => Math.abs(p.y)));
    const points = raw.map((p) => ({ x: p.x, y: p.y / peak }));

    drawChart(`graficaOnda${key.toUpperCase()}`, [
      { color: timbre.color, points, dots: false }
    ], {
      height: 230,
      xMin: 0,
      xMax: length * 1000,
      yMin: -1.1,
      yMax: 1.1,
      xLabel: "Tiempo (ms)",
      yLabel: "Amplitud normalizada",
      xDecimals: 1,
      yDecimals: 1
    });

    drawSpectrum(`graficaEspectro${key.toUpperCase()}`, timbre);
  });
}

function drawSpectrum(id, timbre) {
  const canvas = $(id);
  if (!canvas || !canvas.getContext) return;

  const rect = canvas.getBoundingClientRect();
  const width = Math.max(280, Math.floor(rect.width || 500));
  const height = 230;
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const margin = { left: 58, right: 16, top: 24, bottom: 50 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const slots = 11;
  const barWidth = Math.min(26, (plotWidth / slots) * 0.62);
  const Y = (value) => margin.top + plotHeight - value * plotHeight;

  ctx.font = "11px Arial";
  ctx.strokeStyle = "#d7e2ed";
  ctx.fillStyle = "#526579";
  ctx.textAlign = "right";

  for (let i = 0; i <= 4; i += 1) {
    const value = i / 4;
    ctx.beginPath();
    ctx.moveTo(margin.left, Y(value));
    ctx.lineTo(width - margin.right, Y(value));
    ctx.stroke();
    ctx.fillText(value.toFixed(2), margin.left - 8, Y(value) + 4);
  }

  ctx.textAlign = "center";

  for (let n = 1; n <= 10; n += 1) {
    const x = margin.left + (plotWidth / slots) * (n - 0.5);
    const harmonic = timbre.harmonics.find((h) => h.n === n);

    if (harmonic) {
      ctx.fillStyle = timbre.color;
      ctx.fillRect(x - barWidth / 2, Y(harmonic.amp), barWidth, plotHeight - (Y(harmonic.amp) - margin.top));
    }

    ctx.fillStyle = "#526579";
    ctx.fillText(String(n), x, margin.top + plotHeight + 16);
    ctx.fillText(String(n * baseFrequency), x, margin.top + plotHeight + 30);
  }

  ctx.fillStyle = "#243247";
  ctx.font = "12px Arial";
  ctx.fillText("Armónico n  ·  frecuencia (Hz)", margin.left + plotWidth / 2, height - 6);

  ctx.save();
  ctx.translate(14, margin.top + plotHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Amplitud relativa", 0, 0);
  ctx.restore();
}

/* ---------- Tema 12: resonancia y amortiguamiento efectivo ---------- */
function drawResonance() {
  if (!$("graficaResonancia") || !$("graficaCrecimiento")) return;

  const curve = (zeta) =>
    Array.from({ length: 201 }, (_, i) => {
      const r = (2 * i) / 200;
      return { x: r, y: 1 / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2) };
    });

  drawChart("graficaResonancia", [
    { color: "#176b87", points: curve(0.25), dots: false },
    { color: "#e09f3e", points: curve(0.10), dots: false },
    { color: "#d65c4a", points: curve(0.05), dots: false }
  ], {
    xMin: 0,
    xMax: 2,
    yMin: 0,
    yMax: 11,
    xLabel: "Frecuencia de excitación / frecuencia natural (ω/ωₙ)",
    yLabel: "Amplitud / desplazamiento estático",
    xDecimals: 1,
    yDecimals: 0,
    legend: [
      { label: "ζ = 0,25", color: "#176b87" },
      { label: "ζ = 0,10", color: "#e09f3e" },
      { label: "ζ = 0,05", color: "#d65c4a" }
    ]
  });

  const omega = 2 * Math.PI * 0.2;
  const growth = (sigma) =>
    Array.from({ length: 601 }, (_, i) => {
      const t = (60 * i) / 600;
      return { x: t, y: Math.exp(sigma * t) * Math.cos(omega * t) };
    });

  drawChart("graficaCrecimiento", [
    { color: "#176b87", points: growth(-0.03), dots: false },
    { color: "#9aaabd", points: growth(0), dots: false },
    { color: "#d65c4a", points: growth(0.03), dots: false }
  ], {
    xMin: 0,
    xMax: 60,
    yMin: -6.5,
    yMax: 6.5,
    xLabel: "Tiempo (s)",
    yLabel: "Giro de la calzada (unidades relativas)",
    xDecimals: 0,
    yDecimals: 0,
    legend: [
      { label: "σ = −0,03 s⁻¹", color: "#176b87" },
      { label: "σ = 0", color: "#9aaabd" },
      { label: "σ = +0,03 s⁻¹", color: "#d65c4a" }
    ]
  });
}

/* ---------- Tema 13: circuito de refrigeración líquida ---------- */
const coolant = {
  rho: 996,       // kg/m³, agua a unos 30 °C (supuesto)
  mu: 0.8e-3,     // Pa·s
  cp: 4180,       // J/(kg·K)
  rackFlow: 96 / 60000, // m³/s (96 L/min por rack)
  branchFlow: 12 / 60000, // m³/s (12 L/min por servidor)
  deltaT: 12      // K
};

function sectionArea(diameterMm) {
  return Math.PI * (diameterMm / 2000) ** 2;
}

function coolingNumbers() {
  const c = coolant;
  const power = c.rho * c.rackFlow * c.cp * c.deltaT;
  return { power };
}

function drawCooling() {
  if (!$("graficaVelocidadFlujo") || !$("graficaPresionFlujo")) return;

  const c = coolant;

  const speedCurve = (flow, from, to) => {
    const list = [];
    for (let d = from; d <= to + 1e-9; d += 0.25) {
      list.push({ x: sectionArea(d) * 1e4, y: flow / sectionArea(d) });
    }
    return list;
  };

  const marks = [
    { d: 32, flow: c.rackFlow },
    { d: 16, flow: c.branchFlow },
    { d: 10, flow: c.branchFlow },
    { d: 8, flow: c.branchFlow }
  ];

  drawChart("graficaVelocidadFlujo", [
    { color: "#176b87", points: speedCurve(c.rackFlow, 20, 34), dots: false },
    { color: "#e07a28", points: speedCurve(c.branchFlow, 7.5, 34), dots: false },
    { color: "#102a43", points: marks.map((m) => ({ x: sectionArea(m.d) * 1e4, y: m.flow / sectionArea(m.d) })), dots: true, line: false }
  ], {
    xMin: 0,
    xMax: 9,
    yMin: 0,
    yMax: 6,
    xLabel: "Sección interior de la tubería (cm²)",
    yLabel: "Velocidad del fluido (m/s)",
    xDecimals: 0,
    yDecimals: 1,
    legend: [
      { label: "Colector: Q = 96 L/min", color: "#176b87" },
      { label: "Rama: Q = 12 L/min", color: "#e07a28" }
    ]
  });

  // presión a lo largo de una rama de servidor (12 L/min), tomando como referencia la sección de Ø16 mm
  const refArea = sectionArea(16);
  const vRef = c.branchFlow / refArea;
  const bernoulli = [];
  const friction = [];

  for (let d = 8; d <= 20.01; d += 0.25) {
    const area = sectionArea(d);
    const v = c.branchFlow / area;
    const D = d / 1000;
    const re = (c.rho * v * D) / c.mu;
    const f = 0.316 * re ** -0.25;

    bernoulli.push({ x: area * 1e4, y: (0.5 * c.rho * (vRef ** 2 - v ** 2)) / 1000 });
    friction.push({ x: area * 1e4, y: ((f / D) * 0.5 * c.rho * v * v) / 1000 });
  }

  drawChart("graficaPresionFlujo", [
    { color: "#176b87", points: bernoulli, dots: false },
    { color: "#d65c4a", points: friction, dots: false }
  ], {
    xMin: 0.5,
    xMax: 3.2,
    yMin: -10,
    yMax: 30,
    xLabel: "Sección interior de la tubería (cm²)",
    yLabel: "Presión (kPa)",
    xDecimals: 1,
    yDecimals: 0,
    legend: [
      { label: "Bernoulli ideal", color: "#176b87" },
      { label: "Fricción por metro", color: "#d65c4a" }
    ]
  });

  put("potenciaRack", `${(coolingNumbers().power / 1000).toFixed(1).replace(".", ",")} kW`);
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
  updateJumpDesign();
  drawUrbanCycle();
  updateSpringAnimation();
  drawTimbres();
  drawResonance();
  drawCooling();

  ["alturaDeseada", "tiempoDeseado"].forEach((id) => {
    $(id)?.addEventListener("input", updateJumpDesign);
  });
  $("aplicarDiseno")?.addEventListener("click", applyJumpDesign);

  ["rigidez", "amortiguamiento", "masaSpring"].forEach((id) => {
    $(id)?.addEventListener("input", updateSpringAnimation);
    $(id)?.addEventListener("change", playSpring);
  });
  $("springPlay")?.addEventListener("click", playSpring);
  $("springDefault")?.addEventListener("click", () => setSpring(100, 10, 1));
  $("springCritical")?.addEventListener("click", criticalSpring);
  $("springOver")?.addEventListener("click", () => setSpring(100, 40, 1));

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
      drawUrbanCycle();
      updateSpringAnimation();
      drawTimbres();
      drawResonance();
      drawCooling();

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