"use strict";

const canvas = document.querySelector("#preview");
const displayContext = canvas.getContext("2d");
const projectionSourceCanvas = document.createElement("canvas");
const projectionSourceContext = projectionSourceCanvas.getContext("2d");
window.projectionSourceCanvas = projectionSourceCanvas;
window.projectionFrameInterval = 1000 / 30;
window.projectionSampleWidth = 280;

const controls = {
  color: document.querySelector("#color"),
  color2: document.querySelector("#color2"),
  color3: document.querySelector("#color3"),
  color4: document.querySelector("#color4"),
  brightness: document.querySelector("#brightness"),
};
const POINT_COUNT = 560;
const PI = Math.PI;
let context = displayContext;
let canvasWidth = 0;
let canvasHeight = 0;
let viewScale = 1;
let elapsed = 0;
let previousFrame = performance.now();
let previewZoom = 1;
let previewPan = { x: 0, y: 0 };
let previewPointerId = null;
let lastPreviewPointerPosition = null;

const groups = [
  {
    title: "Trazo A → B",
    controls: [
      ["startX", "Salida X", -1, 1, 0.01, -0.72],
      ["startY", "Salida Y", -1, 1, 0.01, 0.62],
      ["endX", "Destino X", -1, 1, 0.01, 0.68],
      ["endY", "Destino Y", -1, 1, 0.01, -0.62],
      ["scale", "Escala", 0.1, 2, 0.01, 1],
      ["breakCount", "Cantidad de quiebres", 2, 32, 1, 14],
      ["jaggedness", "Apertura de quiebres", 0, 0.8, 0.01, 0.16],
      ["detail", "Detalle eléctrico", 0, 0.12, 0.001, 0.035],
      ["curvature", "Curvatura amplia", -0.8, 0.8, 0.01, 0],
      ["foldCount", "Cantidad de pliegues", 0, 16, 1, 0],
      ["foldAmount", "Superficie de pliegues", 0, 0.7, 0.01, 0],
      ["seed", "Semilla", 0, 100, 0.1, 17],
    ],
  },
  {
    title: "Mirrors",
    select: ["mirrorCount", "Cantidad de figuras", [
      [1, "1 · Original"],
      [2, "2 · Espejo horizontal"],
      [4, "4 · Espejo horizontal + vertical"],
    ], 1],
    controls: [],
  },
  {
    title: "Trim path manual",
    controls: [
      ["trimStart", "Inicio", 0, 1, 0.001, 0],
      ["trimEnd", "Fin", 0, 1, 0.001, 0.22],
      ["offset", "Recorrido manual", -2, 2, 0.001, 0],
      ["travel", "Vueltas automáticas", 0, 4, 1, 1],
      ["softness", "Suavidad", 0.001, 0.15, 0.001, 0.012],
    ],
  },
  {
    title: "Animación",
    select: ["motionPreset", "Recorrido de luz", [
      [0, "Manual"],
      [1, "Flash"],
      [2, "Descarga"],
      [3, "Latigazo"],
      [4, "Pulso"],
      [5, "Tormenta"],
      [6, "Caudal"],
    ], 6],
    controls: [
      ["duration", "Duración", 0.15, 12, 0.05, 2.4],
      ["speed", "Velocidad", 0, 5, 0.05, 1],
      ["elasticAmount", "Elasticidad", 0, 1, 0.01, 0.2],
      ["elasticFrequency", "Frecuencia elástica", 0.5, 10, 0.1, 3],
      ["elasticDamping", "Amortiguación", 0.5, 14, 0.1, 5],
    ],
  },
];

function value(name) { return Number(controls[name].value); }
function clamp(n, low, high) { return Math.max(low, Math.min(high, n)); }
function fract(n) { return n - Math.floor(n); }
function smoother(n) { n = clamp(n, 0, 1); return n * n * n * (n * (n * 6 - 15) + 10); }
function smoothstep(a, b, n) { const t = clamp((n - a) / Math.max(b - a, 0.000001), 0, 1); return t * t * (3 - 2 * t); }
function hash(n) { return fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123); }
function signedHash(n) { return hash(n) * 2 - 1; }

function formatValue(n, step) {
  if (step >= 1) return String(Math.round(n));
  if (step >= 0.1) return n.toFixed(1);
  if (step >= 0.01) return n.toFixed(2);
  return n.toFixed(3);
}

function createControls() {
  const container = document.querySelector("#generatedControls");
  groups.forEach((group) => {
    const section = document.createElement("details");
    section.className = "control-section parameter-group";
    const summary = document.createElement("summary");
    summary.textContent = group.title;
    section.append(summary);

    if (group.select) {
      const [id, text, options, initial] = group.select;
      const label = document.createElement("label");
      label.className = "field";
      const caption = document.createElement("span");
      caption.textContent = text;
      const select = document.createElement("select");
      select.id = id;
      options.forEach(([optionValue, optionLabel]) => {
        const option = document.createElement("option");
        option.value = String(optionValue);
        option.textContent = optionLabel;
        select.append(option);
      });
      select.value = String(initial);
      controls[id] = select;
      label.append(caption, select);
      section.append(label);
    }

    group.controls.forEach(([id, text, min, max, step, initial]) => {
      const label = document.createElement("label");
      label.className = "field";
      const caption = document.createElement("span");
      caption.append(document.createTextNode(text));
      const output = document.createElement("output");
      output.id = `${id}Value`;
      caption.append(output);
      const input = document.createElement("input");
      input.id = id;
      input.type = "range";
      input.min = String(min);
      input.max = String(max);
      input.step = String(step);
      input.value = String(initial);
      controls[id] = input;
      const update = () => {
        output.value = formatValue(Number(input.value), step);
        output.textContent = output.value;
      };
      input.addEventListener("input", update);
      update();
      label.append(caption, input);
      section.append(label);
    });
    container.append(section);
  });
}

createControls();
function updateMirrorColorVisibility() {
  const count = value("mirrorCount");
  window.projectionSampleWidth = count >= 4 ? 180 : count >= 2 ? 220 : 280;
  document.querySelector("#color2Group").hidden = count < 2;
  document.querySelector("#color3Group").hidden = count < 4;
  document.querySelector("#color4Group").hidden = count < 4;
}
controls.mirrorCount.addEventListener("change", updateMirrorColorVisibility);
updateMirrorColorVisibility();
const brightnessOutput = document.querySelector("#brightnessValue");
controls.brightness.addEventListener("input", () => {
  brightnessOutput.value = value("brightness").toFixed(2);
  brightnessOutput.textContent = brightnessOutput.value;
});

const presetDefaults = {
  1: { trimStart: 0, trimEnd: 0.72, elasticAmount: 0.08, elasticFrequency: 2, elasticDamping: 8, duration: 1.4, softness: 0.025 },
  2: { trimStart: 0, trimEnd: 0.28, elasticAmount: 0.65, elasticFrequency: 4.2, elasticDamping: 4.5, duration: 2.1, softness: 0.012 },
  3: { trimStart: 0, trimEnd: 0.12, elasticAmount: 0.35, elasticFrequency: 2.5, elasticDamping: 7, duration: 1.1, softness: 0.008 },
  4: { trimStart: 0, trimEnd: 0.42, elasticAmount: 0.18, elasticFrequency: 1.5, elasticDamping: 3.5, duration: 3.4, softness: 0.04 },
  5: { trimStart: 0, trimEnd: 0.08, elasticAmount: 0.9, elasticFrequency: 8, elasticDamping: 2.4, duration: 0.75, softness: 0.006 },
  6: { trimStart: 0, trimEnd: 0.34, elasticAmount: 0, elasticFrequency: 1, elasticDamping: 12, duration: 4.8, softness: 0.045 },
};

function setControl(name, next) {
  controls[name].value = String(next);
  controls[name].dispatchEvent(new Event("input"));
}

controls.motionPreset.addEventListener("change", () => {
  const defaults = presetDefaults[value("motionPreset")];
  if (!defaults) return;
  Object.entries(defaults).forEach(([name, next]) => setControl(name, next));
});
controls.motionPreset.dispatchEvent(new Event("change"));

const zoomOut = document.querySelector("#previewZoomOut");
const zoomIn = document.querySelector("#previewZoomIn");
const zoomReset = document.querySelector("#previewZoomReset");
const previewZoomOutput = document.querySelector("#previewZoomValue");

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  const width = Math.round(rect.width * ratio);
  const height = Math.round(rect.height * ratio);
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  if (projectionSourceCanvas.width !== width || projectionSourceCanvas.height !== height) {
    projectionSourceCanvas.width = width;
    projectionSourceCanvas.height = height;
  }
  displayContext.setTransform(
    ratio * previewZoom, 0, 0, ratio * previewZoom,
    ratio * (canvasWidth * (1 - previewZoom) / 2 + previewPan.x),
    ratio * (canvasHeight * (1 - previewZoom) / 2 + previewPan.y),
  );
  projectionSourceContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function updateZoom(next) {
  previewZoom = clamp(next, 0.5, 6);
  resizeCanvas();
  previewZoomOutput.value = `${Math.round(previewZoom * 100)}%`;
  previewZoomOutput.textContent = previewZoomOutput.value;
}

new ResizeObserver(resizeCanvas).observe(canvas);
zoomIn.addEventListener("click", () => updateZoom(previewZoom * 1.2));
zoomOut.addEventListener("click", () => updateZoom(previewZoom / 1.2));
zoomReset.addEventListener("click", () => { previewPan = { x: 0, y: 0 }; updateZoom(1); });
canvas.addEventListener("dblclick", () => {
  const reset = previewZoom > 1.01;
  if (reset) previewPan = { x: 0, y: 0 };
  updateZoom(reset ? 1 : 2);
});
canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  previewPointerId = event.pointerId;
  lastPreviewPointerPosition = [event.clientX, event.clientY];
  canvas.setPointerCapture(event.pointerId);
  canvas.classList.add("is-panning");
});
canvas.addEventListener("pointermove", (event) => {
  if (event.pointerId !== previewPointerId || !lastPreviewPointerPosition) return;
  previewPan.x += event.clientX - lastPreviewPointerPosition[0];
  previewPan.y += event.clientY - lastPreviewPointerPosition[1];
  lastPreviewPointerPosition = [event.clientX, event.clientY];
  resizeCanvas();
});
function finishPan(event) {
  if (event.pointerId !== previewPointerId) return;
  previewPointerId = null;
  lastPreviewPointerPosition = null;
  canvas.classList.remove("is-panning");
}
canvas.addEventListener("pointerup", finishPan);
canvas.addEventListener("pointercancel", finishPan);
canvas.addEventListener("lostpointercapture", finishPan);

function readGeometry(currentSeed) {
  const start = [value("startX"), value("startY")];
  const rawEnd = [value("endX"), value("endY")];
  const end = [start[0] + (rawEnd[0] - start[0]) * value("scale"), start[1] + (rawEnd[1] - start[1]) * value("scale")];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.max(Math.hypot(dx, dy), 0.0001);
  return {
    start,
    dx,
    dy,
    perpendicular: [-dy / length, dx / length],
    breaks: Math.round(value("breakCount")),
    seed: currentSeed * 13.17,
    currentSeed,
    jaggedness: value("jaggedness"),
    detail: value("detail"),
    curvature: value("curvature"),
    folds: Math.round(value("foldCount")),
    foldAmount: value("foldAmount"),
  };
}

function lightningPoint(t, geometry) {
  const { start, dx, dy, perpendicular, breaks, seed } = geometry;
  const segmentValue = t * breaks;
  const segment = Math.min(Math.floor(segmentValue), breaks - 1);
  const local = t >= 1 ? 1 : fract(segmentValue);
  const envelope = (u) => Math.sin(PI * clamp(u, 0, 1));
  const offsetAt = (index) => {
    if (index <= 0 || index >= breaks) return 0;
    const u = index / breaks;
    const major = signedHash(seed + index * 19.31) * geometry.jaggedness * envelope(u);
    const detail = signedHash(seed * 2.3 + index * 41.7) * geometry.detail * envelope(u);
    return major + detail;
  };
  const aT = segment / breaks;
  const bT = (segment + 1) / breaks;
  let offset = offsetAt(segment) + (offsetAt(segment + 1) - offsetAt(segment)) * local;
  offset += signedHash(seed + segment * 7.9 + 91) * geometry.detail * Math.sin(local * PI) * envelope(t);
  offset += geometry.curvature * envelope(t);
  if (geometry.folds > 0) {
    const foldPhase = fract(geometry.currentSeed * 0.173) * 0.5;
    const foldPosition = fract(t * geometry.folds + foldPhase);
    const triangle = 1 - 4 * Math.abs(foldPosition - 0.5);
    offset += triangle * geometry.foldAmount * envelope(t);
  }
  return [start[0] + dx * (aT + (bT - aT) * local) + perpendicular[0] * offset,
    start[1] + dy * (aT + (bT - aT) * local) + perpendicular[1] * offset];
}

function buildLightningPoints(currentSeed) {
  const geometry = readGeometry(currentSeed);
  return Array.from(
    { length: POINT_COUNT },
    (_, index) => lightningPoint(index / (POINT_COUNT - 1), geometry),
  );
}

function motionProgress(time) {
  const p = fract(time / Math.max(value("duration"), 0.001));
  const preset = value("motionPreset");
  let base = p;
  if (preset === 1) base = 1 - Math.pow(1 - p, 3);
  if (preset === 2) base = smoother(p);
  if (preset === 3) base = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  if (preset === 4) base = smoother(p) + Math.sin(p * PI * 2) * 0.035 * Math.sin(p * PI);
  if (preset === 5) base = p + Math.sin(p * PI * 12) * 0.035 * Math.sin(p * PI);
  const spring = Math.sin(p * PI * value("elasticFrequency"))
    * Math.exp(-p * value("elasticDamping")) * Math.sin(p * PI);
  return base + spring * value("elasticAmount") * 0.2;
}

function trimMask(t, start, end) {
  if (Math.abs(end - start) >= 0.999) return 1;
  const softness = Math.max(value("softness"), 0.0001);
  const s = fract(start + 10);
  const e = fract(end + 10);
  const position = fract(t + 10);
  if (s <= e) return smoothstep(s - softness, s + softness, position) * (1 - smoothstep(e - softness, e + softness, position));
  return Math.max(smoothstep(s - softness, s + softness, position), 1 - smoothstep(e - softness, e + softness, position));
}

function clearCanvas(targetContext, targetCanvas) {
  targetContext.save();
  targetContext.setTransform(1, 0, 0, 1, 0, 0);
  targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetContext.restore();
}

function mirrorPoint(point, mirrorIndex) {
  return [
    mirrorIndex === 1 || mirrorIndex === 3 ? -point[0] : point[0],
    mirrorIndex >= 2 ? -point[1] : point[1],
  ];
}

function renderFrame(targetContext, targetCanvas, frame) {
  if (canvasWidth <= 0 || canvasHeight <= 0) return;
  context = targetContext;
  clearCanvas(context, targetCanvas);
  viewScale = Math.min(canvasWidth, canvasHeight) * 0.44;
  const animatedOffset = frame.animatedOffset;
  const mirrorCount = value("mirrorCount");
  const colors = [controls.color.value, controls.color2.value, controls.color3.value, controls.color4.value];
  for (let index = 0; index < POINT_COUNT - 1; index += 1) {
    const t0 = index / (POINT_COUNT - 1);
    const t1 = (index + 1) / (POINT_COUNT - 1);
    const t = (t0 + t1) * 0.5;
    const alpha = trimMask(fract(t - animatedOffset + 20), value("trimStart"), value("trimEnd"));
    if (alpha < 0.004) continue;
    for (let mirrorIndex = 0; mirrorIndex < mirrorCount; mirrorIndex += 1) {
      const a = mirrorPoint(frame.points[index], mirrorIndex);
      const b = mirrorPoint(frame.points[index + 1], mirrorIndex);
      context.beginPath();
      context.moveTo(canvasWidth / 2 + a[0] * viewScale, canvasHeight / 2 - a[1] * viewScale);
      context.lineTo(canvasWidth / 2 + b[0] * viewScale, canvasHeight / 2 - b[1] * viewScale);
      context.strokeStyle = colors[mirrorIndex];
      context.globalAlpha = Math.min(1, alpha * value("brightness"));
      context.lineWidth = targetCanvas === projectionSourceCanvas
        ? (mirrorCount >= 4 ? 2.1 : 2.5)
        : 1.55;
      context.stroke();
    }
  }
  context.globalAlpha = 1;
}

function render(now) {
  const animationTime = now * value("speed");
  const currentSeed = value("seed");
  const phase = fract(animationTime / Math.max(value("duration"), 0.001));
  const motion = motionProgress(animationTime);
  const frame = {
    phase,
    motion,
    animatedOffset: value("offset") + motion * value("travel"),
    points: buildLightningPoints(currentSeed),
  };
  renderFrame(projectionSourceContext, projectionSourceCanvas, frame);
  renderFrame(displayContext, canvas, frame);
}
function tick(now) {
  const delta = Math.min((now - previousFrame) / 1000, 0.1);
  elapsed += delta;
  previousFrame = now;
  render(elapsed);
  requestAnimationFrame(tick);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(tick);
