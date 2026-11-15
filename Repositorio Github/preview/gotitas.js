"use strict";

const canvas = document.querySelector("#preview");
const displayContext = canvas.getContext("2d");
const projectionSourceCanvas = document.createElement("canvas");
const projectionSourceContext = projectionSourceCanvas.getContext("2d");
let context = displayContext;
window.projectionSourceCanvas = projectionSourceCanvas;
const previewZoomOutControl = document.querySelector("#previewZoomOut");
const previewZoomInControl = document.querySelector("#previewZoomIn");
const previewZoomResetControl = document.querySelector("#previewZoomReset");
const previewZoomOutput = document.querySelector("#previewZoomValue");
const controls = {
  count: document.querySelector("#count"),
  size: document.querySelector("#size"),
  randomness: document.querySelector("#randomness"),
  spreadX: document.querySelector("#spreadX"),
  spreadY: document.querySelector("#spreadY"),
  jitter: document.querySelector("#jitter"),
  seed: document.querySelector("#seed"),
  duration: document.querySelector("#duration"),
  trail: document.querySelector("#trail"),
  stagger: document.querySelector("#stagger"),
  speed: document.querySelector("#speed"),
  rotation: document.querySelector("#rotation"),
  rotationSpeed: document.querySelector("#rotationSpeed"),
  smoothness: document.querySelector("#smoothness"),
  formation: document.querySelector("#formation"),
  radius: document.querySelector("#radius"),
  circleRotation: document.querySelector("#circleRotation"),
  sweep: document.querySelector("#sweep"),
  sweepSoftness: document.querySelector("#sweepSoftness"),
  drift: document.querySelector("#drift"),
  driftSpeed: document.querySelector("#driftSpeed"),
  colorMode: document.querySelector("#colorMode"),
  color: document.querySelector("#color"),
  color2: document.querySelector("#color2"),
  brightness: document.querySelector("#brightness"),
};

const MAX_STARS = 12;
const ARMS_PER_STAR = 4;
const POINTS_PER_ARM = 45;
let canvasWidth = 0;
let canvasHeight = 0;
let previewZoom = 1;
let previewPan = { x: 0, y: 0 };
let previewPointerId = null;
let lastPreviewPointerPosition = null;

function value(name) {
  return Number(controls[name].value);
}

function updateOutput(inputId, outputId, format) {
  const input = document.querySelector(`#${inputId}`);
  const output = document.querySelector(`#${outputId}`);
  const update = () => {
    output.value = format(Number(input.value));
    output.textContent = output.value;
  };
  input.addEventListener("input", update);
  update();
}

updateOutput("count", "countValue", (n) => String(n));
updateOutput("size", "sizeValue", (n) => n.toFixed(3));
updateOutput("randomness", "randomnessValue", (n) => n.toFixed(2));
updateOutput("spreadX", "spreadXValue", (n) => n.toFixed(2));
updateOutput("spreadY", "spreadYValue", (n) => n.toFixed(2));
updateOutput("jitter", "jitterValue", (n) => n.toFixed(3));
updateOutput("seed", "seedValue", (n) => n.toFixed(1));
updateOutput("duration", "durationValue", (n) => `${n.toFixed(1)} s`);
updateOutput("trail", "trailValue", (n) => n.toFixed(2));
updateOutput("stagger", "staggerValue", (n) => n.toFixed(2));
updateOutput("speed", "speedValue", (n) => n.toFixed(1));
updateOutput("rotation", "rotationValue", (n) => `${n}°`);
updateOutput("rotationSpeed", "rotationSpeedValue", (n) => n.toFixed(1));
updateOutput("smoothness", "smoothnessValue", (n) => n.toFixed(3));
updateOutput("formation", "formationValue", (n) => n.toFixed(2));
updateOutput("radius", "radiusValue", (n) => n.toFixed(2));
updateOutput("circleRotation", "circleRotationValue", (n) => `${n}°`);
updateOutput("sweep", "sweepValue", (n) => n.toFixed(2));
updateOutput("sweepSoftness", "sweepSoftnessValue", (n) => n.toFixed(3));
updateOutput("drift", "driftValue", (n) => n.toFixed(3));
updateOutput("driftSpeed", "driftSpeedValue", (n) => n.toFixed(1));
updateOutput("brightness", "brightnessValue", (n) => n.toFixed(2));

controls.colorMode.addEventListener("change", () => {
  document.querySelector("#color2Group").hidden = controls.colorMode.value !== "1";
});

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  const resolutionScale = pixelRatio;
  const width = Math.round(rect.width * resolutionScale);
  const height = Math.round(rect.height * resolutionScale);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  if (projectionSourceCanvas.width !== width || projectionSourceCanvas.height !== height) {
    projectionSourceCanvas.width = width;
    projectionSourceCanvas.height = height;
  }
  displayContext.setTransform(
    resolutionScale * previewZoom,
    0,
    0,
    resolutionScale * previewZoom,
    resolutionScale * (canvasWidth * (1 - previewZoom) / 2 + previewPan.x),
    resolutionScale * (canvasHeight * (1 - previewZoom) / 2 + previewPan.y),
  );
  projectionSourceContext.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0);
}

new ResizeObserver(resizeCanvas).observe(canvas);

function updatePreviewZoom(zoom) {
  previewZoom = Math.min(6, Math.max(0.5, zoom));
  resizeCanvas();
  previewZoomOutput.value = `${Math.round(previewZoom * 100)}%`;
  previewZoomOutput.textContent = previewZoomOutput.value;
}

previewZoomInControl.addEventListener("click", () => updatePreviewZoom(previewZoom * 1.2));
previewZoomOutControl.addEventListener("click", () => updatePreviewZoom(previewZoom / 1.2));
previewZoomResetControl.addEventListener("click", () => {
  previewPan = { x: 0, y: 0 };
  updatePreviewZoom(1);
});
canvas.addEventListener("dblclick", () => {
  const shouldReset = previewZoom > 1.01;
  if (shouldReset) previewPan = { x: 0, y: 0 };
  updatePreviewZoom(shouldReset ? 1 : 2);
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

function finishPreviewPan(event) {
  if (event.pointerId !== previewPointerId) return;
  previewPointerId = null;
  lastPreviewPointerPosition = null;
  canvas.classList.remove("is-panning");
}

canvas.addEventListener("pointerup", finishPreviewPan);
canvas.addEventListener("pointercancel", finishPreviewPan);
canvas.addEventListener("lostpointercapture", finishPreviewPan);

function fract(n) {
  return n - Math.floor(n);
}

function hash(n) {
  return fract(Math.sin(n * 127.1 + 311.7) * 43758.5453123);
}

function signedHash(n) {
  return hash(n) * 2 - 1;
}

function clamp(n, low, high) {
  return Math.max(low, Math.min(high, n));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function easeSmooth(x) {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
}

function positiveMod12(n) {
  return ((n % 12) + 12) % 12;
}

function gridCenter(starIndex) {
  const seed = value("seed");
  const cell = positiveMod12(Math.floor(seed * 3) + starIndex * 5);
  const column = cell % 4;
  const row = Math.floor(cell / 4);
  const y = row === 0 ? 0.68 : row === 1 ? 0 : -0.68;
  const jitterSeed = seed * 17.71 + starIndex * 37.13;
  return [
    (-0.75 + column * 0.5) * value("spreadX")
      + signedHash(jitterSeed + 1) * value("jitter"),
    y * value("spreadY")
      + signedHash(jitterSeed + 2) * value("jitter"),
  ];
}

function circleCenter(starIndex, count) {
  const angle = 2 * Math.PI * starIndex / Math.max(count, 1)
    + (value("circleRotation") - 90) * Math.PI / 180;
  return [Math.cos(angle) * value("radius"), Math.sin(angle) * value("radius")];
}

function starCenter(starIndex, count) {
  const grid = gridCenter(starIndex);
  const circle = circleCenter(starIndex, count);
  const formation = value("formation");
  return [
    grid[0] + (circle[0] - grid[0]) * formation,
    grid[1] + (circle[1] - grid[1]) * formation,
  ];
}

function starScale(starIndex) {
  const seed = value("seed");
  const random = hash(seed * 13 + starIndex * 19.3 + 4);
  const minScale = 1 - value("randomness") * 0.4;
  const maxScale = 1 + value("randomness") * 0.5;
  return value("size") * (minScale + (maxScale - minScale) * random);
}

function starPhase(starIndex, time) {
  const duration = Math.max(value("duration"), 0.001);
  const offset = value("stagger") * starIndex / MAX_STARS;
  return easeSmooth(fract(time / duration + offset));
}

function starRotation(phase) {
  const rotationPhase = easeSmooth(clamp(phase * value("rotationSpeed"), 0, 1));
  return value("rotation") * Math.PI / 180 * rotationPhase;
}

function driftOffset(starIndex, phase, driftTime) {
  const amount = value("drift");
  if (amount <= 0.00001) return [0, 0];
  const seed = value("seed");
  const driftSeed = seed + starIndex * 7.31;
  const envelope = Math.sin(phase * Math.PI);
  const tx = driftTime * Math.PI * 2 + driftSeed;
  const ty = driftTime * Math.PI * 2 * 0.73 + driftSeed * 1.71;
  return [Math.sin(tx) * amount * envelope, Math.cos(ty) * amount * envelope];
}

function armBrightness(armT, phase) {
  const trail = clamp(value("trail"), 0.001, 1);
  const head = clamp(phase * (1 + trail), 0, 1);
  const tail = clamp(phase * (1 + trail) - trail, 0, 1);
  if (armT < tail || armT > head) return 0;

  const softness = Math.max(Math.min(value("smoothness"), trail * 0.49), 0.0001);
  return smoothstep(tail, tail + softness, armT)
    * (1 - smoothstep(head - softness, head, armT));
}

function sweepBrightness(worldY) {
  const softness = Math.max(value("sweepSoftness"), 0.0001);
  const normalizedY = clamp((worldY + 1) * 0.5, 0, 1);
  const threshold = -softness + (1 + softness - -softness) * value("sweep");
  return 1 - smoothstep(threshold - softness, threshold + softness, normalizedY);
}

function rotate(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * point[0] - s * point[1], s * point[0] + c * point[1]];
}

function drawArm(center, scale, rotation, armIndex, phase, drift) {
  const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const direction = directions[armIndex];
  const color = controls.color.value;

  for (let point = 0; point < POINTS_PER_ARM - 1; point += 1) {
    const t0 = point / (POINTS_PER_ARM - 1);
    const t1 = (point + 1) / (POINTS_PER_ARM - 1);
    const t = (t0 + t1) * 0.5;
    const local0 = rotate([direction[0] * t0 * scale, direction[1] * t0 * scale], rotation);
    const local1 = rotate([direction[0] * t1 * scale, direction[1] * t1 * scale], rotation);
    const x0 = (center[0] + drift[0] + local0[0]) * viewScale + canvasWidth / 2;
    const y0 = canvasHeight / 2 - (center[1] + drift[1] + local0[1]) * viewScale;
    const x1 = (center[0] + drift[0] + local1[0]) * viewScale + canvasWidth / 2;
    const y1 = canvasHeight / 2 - (center[1] + drift[1] + local1[1]) * viewScale;
    const worldY = center[1] + drift[1] + (local0[1] + local1[1]) * 0.5;
    const brightness = armBrightness(t, phase) * sweepBrightness(worldY) * value("brightness");
    if (brightness < 0.005) continue;

    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = controls.colorMode.value === "1" && t >= 0.5
      ? controls.color2.value
      : color;
    context.globalAlpha = Math.min(1, brightness);
    context.lineWidth = 1.4;
    context.stroke();
  }
  context.globalAlpha = 1;
}

let viewScale = 1;

function clearCanvas(targetContext, targetCanvas) {
  targetContext.save();
  targetContext.setTransform(1, 0, 0, 1, 0, 0);
  targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetContext.restore();
}

function renderFrame(now, targetContext, targetCanvas) {
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return;
  }
  context = targetContext;
  clearCanvas(context, targetCanvas);
  viewScale = Math.min(canvasWidth * 0.4, canvasHeight * 0.4);
  const elapsed = now / 1000;
  const animationTime = elapsed * value("speed");
  const driftTime = elapsed * value("driftSpeed");
  const count = Math.min(value("count"), MAX_STARS);

  for (let starIndex = 0; starIndex < count; starIndex += 1) {
    const phase = starPhase(starIndex, animationTime);
    const center = starCenter(starIndex, count);
    const drift = driftOffset(starIndex, phase, driftTime);
    const scale = starScale(starIndex);
    const rotation = starRotation(phase);

    for (let armIndex = 0; armIndex < ARMS_PER_STAR; armIndex += 1) {
      drawArm(center, scale, rotation, armIndex, phase, drift);
    }
  }
}

function render(now) {
  renderFrame(now, projectionSourceContext, projectionSourceCanvas);
  renderFrame(now, displayContext, canvas);
}

let previousFrame = performance.now();
let elapsed = 0;
function tick(now) {
  const delta = Math.min((now - previousFrame) / 1000, 0.1);
  elapsed += delta;
  previousFrame = now;
  render(elapsed * 1000);
  requestAnimationFrame(tick);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(tick);
