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
const controls = {};
const groups = [
  {
    title: "Espiral",
    controls: [
      { id: "turns", label: "Vueltas", min: 0.5, max: 8, step: 0.1, value: 4 },
      { id: "outerRadius", label: "Radio exterior", min: 0.1, max: 1, step: 0.01, value: 0.82 },
      { id: "centerScale", label: "Escala del centro", min: 0.2, max: 4, step: 0.01, value: 1 },
      {
        id: "direction",
        label: "Sentido",
        value: 0,
        options: [[0, "Horario"], [1, "Antihorario"]],
      },
    ],
  },
  {
    title: "Figura",
    controls: [
      { id: "scaleX", label: "Escala X", min: 0.1, max: 2, step: 0.01, value: 1 },
      { id: "scaleY", label: "Escala Y", min: 0.1, max: 2, step: 0.01, value: 1 },
      { id: "rotation", label: "Rotación", min: -360, max: 360, step: 1, value: 0 },
    ],
  },
  {
    title: "Espejos",
    controls: [
      {
        id: "mirrorCount",
        label: "Cantidad",
        value: 1,
        options: Array.from({ length: 12 }, (_, index) => [index + 1, String(index + 1)]),
      },
      {
        id: "mirrorMode",
        label: "Modo",
        value: 1,
        options: [[0, "Copias radiales"], [1, "Reflejo alternado"]],
      },
      { id: "mirrorSpread", label: "Separación", min: 0, max: 2, step: 0.01, value: 1 },
      { id: "mirrorPhase", label: "Desfase de flujo", min: 0, max: 1, step: 0.01, value: 0 },
    ],
  },
  {
    title: "Flujo",
    controls: [
      { id: "trailLength", label: "Longitud del segmento", min: 0.02, max: 1, step: 0.01, value: 0.28 },
      { id: "offset", label: "Desplazamiento", min: -4, max: 4, step: 0.01, value: 0 },
      {
        id: "travelLoops",
        label: "Vueltas de recorrido",
        value: 1,
        options: Array.from({ length: 16 }, (_, index) => [index + 1, String(index + 1)]),
      },
      { id: "duration", label: "Duración (s)", min: 0.2, max: 30, step: 0.1, value: 5 },
      { id: "speed", label: "Velocidad", min: 0, max: 5, step: 0.1, value: 1 },
      { id: "easeStrength", label: "Suavizado", min: 0, max: 1, step: 0.01, value: 0.75 },
      { id: "acceleration", label: "Sesgo de aceleración", min: -1, max: 1, step: 0.01, value: 0 },
      { id: "elasticAmount", label: "Elasticidad", min: 0, max: 0.5, step: 0.005, value: 0.035 },
      { id: "elasticFrequency", label: "Frecuencia elástica", min: 0.5, max: 8, step: 0.1, value: 2.5 },
      { id: "elasticDamping", label: "Amortiguación elástica", min: 1, max: 12, step: 0.1, value: 5 },
      { id: "headSoftness", label: "Suavidad de cabeza", min: 0.001, max: 0.15, step: 0.001, value: 0.015 },
      { id: "tailSoftness", label: "Suavidad de cola", min: 0.001, max: 0.2, step: 0.001, value: 0.03 },
    ],
  },
  {
    title: "Geometría",
    controls: [
      { id: "breathAmount", label: "Respiración", min: 0, max: 0.4, step: 0.01, value: 0 },
      {
        id: "breathCycles",
        label: "Ciclos de respiración",
        value: 1,
        options: Array.from({ length: 8 }, (_, index) => [index + 1, String(index + 1)]),
      },
      {
        id: "rotationCycles",
        label: "Ciclos de rotación",
        value: 0,
        options: Array.from({ length: 9 }, (_, index) => [index - 4, String(index - 4)]),
      },
      { id: "waveAmount", label: "Ondulación", min: 0, max: 0.25, step: 0.005, value: 0 },
      { id: "waveFrequency", label: "Frecuencia de onda", min: 1, max: 20, step: 0.1, value: 6 },
      {
        id: "waveCycles",
        label: "Ciclos de onda",
        value: 1,
        options: Array.from({ length: 17 }, (_, index) => [index - 8, String(index - 8)]),
      },
    ],
  },
  {
    title: "Color",
    controls: [
      {
        id: "colorMode",
        label: "Modo",
        value: 0,
        options: [
          [0, "Degradado del flujo"],
          [1, "Degradado de espiral"],
          [2, "Espejos alternados"],
          [3, "Degradado animado"],
          [4, "División dura"],
        ],
      },
      { id: "colorA", label: "Color A", type: "color", value: "#ff0d26" },
      { id: "colorB", label: "Color B", type: "color", value: "#0d59ff" },
      { id: "colorPosition", label: "Posición", min: 0, max: 1, step: 0.01, value: 0.5 },
      { id: "colorSoftness", label: "Suavidad", min: 0.001, max: 1, step: 0.001, value: 0.35 },
      {
        id: "colorCycles",
        label: "Ciclos de color",
        value: 1,
        options: Array.from({ length: 9 }, (_, index) => [index - 4, String(index - 4)]),
      },
    ],
  },
  {
    title: "Brillo",
    controls: [
      { id: "brightness", label: "Brillo", min: 0, max: 2, step: 0.01, value: 1 },
    ],
  },
];

const MAX_MIRRORS = 12;
const POINTS_PER_MIRROR = 300;
const PI = Math.PI;
const TWO_PI = 2 * PI;
const PHI = (1 + Math.sqrt(5)) / 2;
let canvasWidth = 0;
let canvasHeight = 0;
let previewZoom = 1;
let previewPan = { x: 0, y: 0 };
let previewPointerId = null;
let lastPreviewPointerPosition = null;
let elapsed = 0;
let previousFrame = performance.now();

function value(name) {
  return Number(controls[name].value);
}

function createControls() {
  const container = document.querySelector("#generatedControls");

  groups.forEach((group) => {
    const section = document.createElement("details");
    section.className = "control-section parameter-group";
    const heading = document.createElement("summary");
    heading.textContent = group.title;
    section.append(heading);

    group.controls.forEach((parameter) => {
      const label = document.createElement("label");
      label.className = parameter.type === "color" ? "color-field" : "field";
      const input = document.createElement(parameter.options ? "select" : "input");
      input.id = parameter.id;
      controls[parameter.id] = input;

      if (parameter.type === "color") {
        input.type = "color";
        input.value = parameter.value;
        label.append(document.createTextNode(parameter.label), input);
      } else if (parameter.options) {
        const caption = document.createElement("span");
        caption.textContent = parameter.label;
        parameter.options.forEach(([optionValue, optionLabel]) => {
          const option = document.createElement("option");
          option.value = String(optionValue);
          option.textContent = optionLabel;
          input.append(option);
        });
        input.value = String(parameter.value);
        label.append(caption, input);
      } else {
        label.classList.add("field");
        const caption = document.createElement("span");
        caption.append(document.createTextNode(parameter.label));
        const output = document.createElement("output");
        const precision = (String(parameter.step).split(".")[1] || "").length;
        const updateOutput = () => {
          output.value = Number(input.value).toFixed(precision);
          output.textContent = output.value;
        };
        input.type = "range";
        input.min = String(parameter.min);
        input.max = String(parameter.max);
        input.step = String(parameter.step);
        input.value = String(parameter.value);
        input.addEventListener("input", updateOutput);
        updateOutput();
        caption.append(output);
        label.append(caption, input);
      }

      section.append(label);
    });

    container.append(section);
  });
}

createControls();

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  const width = Math.round(rect.width * pixelRatio);
  const height = Math.round(rect.height * pixelRatio);

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  if (projectionSourceCanvas.width !== width || projectionSourceCanvas.height !== height) {
    projectionSourceCanvas.width = width;
    projectionSourceCanvas.height = height;
  }

  displayContext.setTransform(
    pixelRatio * previewZoom,
    0,
    0,
    pixelRatio * previewZoom,
    pixelRatio * (canvasWidth * (1 - previewZoom) / 2 + previewPan.x),
    pixelRatio * (canvasHeight * (1 - previewZoom) / 2 + previewPan.y),
  );
  projectionSourceContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
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
canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  updatePreviewZoom(previewZoom * Math.exp(-event.deltaY * 0.001));
}, { passive: false });

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

function clamp(number, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, number));
}

function fract(number) {
  return number - Math.floor(number);
}

function smoother(number) {
  const x = clamp(number, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function smoothstep(edge0, edge1, number) {
  const x = clamp((number - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}

function mix(start, end, amount) {
  return start + (end - start) * amount;
}

function readColor(hex) {
  return [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ];
}

function readFrameSettings() {
  const duration = Math.max(value("duration"), 0.001);
  const phase = fract(elapsed * value("speed") / duration);
  let motion = mix(phase, smoother(phase), value("easeStrength"));
  const acceleration = value("acceleration");

  if (acceleration > 0.001) {
    const accelerated = phase ** mix(1, 3.5, acceleration);
    motion = mix(motion, accelerated, acceleration);
  } else if (acceleration < -0.001) {
    const amount = Math.abs(acceleration);
    const decelerated = 1 - (1 - phase) ** mix(1, 3.5, amount);
    motion = mix(motion, decelerated, amount);
  }

  motion += Math.sin(phase * PI * value("elasticFrequency"))
    * Math.exp(-phase * value("elasticDamping"))
    * Math.sin(phase * PI)
    * value("elasticAmount") * 0.1;

  return {
    phase,
    motion,
    turns: value("turns"),
    outerRadius: value("outerRadius"),
    centerScale: value("centerScale"),
    direction: value("direction") === 0 ? 1 : -1,
    scaleX: value("scaleX"),
    scaleY: value("scaleY"),
    rotation: value("rotation") * PI / 180 + phase * TWO_PI * value("rotationCycles"),
    mirrorCount: clamp(Math.round(value("mirrorCount")), 1, MAX_MIRRORS),
    mirrorMode: value("mirrorMode"),
    mirrorSpread: value("mirrorSpread"),
    mirrorPhase: value("mirrorPhase"),
    trailLength: clamp(value("trailLength"), 0.02, 1),
    offset: value("offset"),
    travelLoops: value("travelLoops"),
    headSoftness: value("headSoftness"),
    tailSoftness: value("tailSoftness"),
    breath: 1 + (0.5 - 0.5 * Math.cos(phase * TWO_PI * value("breathCycles")))
      * value("breathAmount"),
    waveAmount: value("waveAmount"),
    waveFrequency: value("waveFrequency"),
    waveCycles: value("waveCycles"),
    colorMode: value("colorMode"),
    colorA: readColor(controls.colorA.value),
    colorB: readColor(controls.colorB.value),
    colorPosition: value("colorPosition"),
    colorSoftness: value("colorSoftness"),
    colorCycles: value("colorCycles"),
    brightness: value("brightness"),
  };
}

function rotatePoint(point, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  return [
    cosine * point[0] - sine * point[1],
    sine * point[0] + cosine * point[1],
  ];
}

function spiralPoint(pathT, mirrorIndex, settings) {
  const exponentRange = 4 * settings.turns;
  const innerRadius = settings.outerRadius / PHI ** exponentRange * settings.centerScale;
  const radius = Math.min(
    innerRadius * PHI ** (exponentRange * pathT),
    settings.outerRadius,
  );
  const wave = 1 + Math.sin(
    pathT * TWO_PI * settings.waveFrequency - settings.phase * TWO_PI * settings.waveCycles,
  ) * settings.waveAmount;
  const angle = settings.direction * pathT * TWO_PI * settings.turns;
  let point = [Math.cos(angle) * radius * wave, Math.sin(angle) * radius * wave];

  if (settings.mirrorMode === 1 && mirrorIndex % 2 === 1) {
    point[0] = -point[0];
  }

  point[0] *= settings.breath * settings.scaleX;
  point[1] *= settings.breath * settings.scaleY;
  point = rotatePoint(point, settings.rotation);

  const radialAngle = TWO_PI * mirrorIndex / settings.mirrorCount * settings.mirrorSpread;
  return rotatePoint(point, radialAngle);
}

function readTrail(pathT, head, settings) {
  const distanceBehind = fract(head - pathT + 1);
  if (distanceBehind > settings.trailLength) {
    return { position: 0, brightness: 0 };
  }

  const position = 1 - distanceBehind / settings.trailLength;
  const headLocal = Math.max(
    Math.min(settings.headSoftness, settings.trailLength * 0.48),
    0.0001,
  ) / settings.trailLength;
  const tailLocal = Math.max(
    Math.min(settings.tailSoftness, settings.trailLength * 0.48),
    0.0001,
  ) / settings.trailLength;
  const tailFade = smoothstep(0, tailLocal, position);
  const headFade = 1 - smoothstep(1 - headLocal, 1, position);
  const brightness = Math.max(tailFade * headFade, 0.01) * settings.brightness;
  return { position, brightness };
}

function colorAmount(pathT, trailPosition, mirrorIndex, settings) {
  if (settings.colorMode === 0) return smoother(trailPosition);
  if (settings.colorMode === 1) {
    return smoothstep(
      settings.colorPosition - settings.colorSoftness,
      settings.colorPosition + settings.colorSoftness,
      pathT,
    );
  }
  if (settings.colorMode === 2) return mirrorIndex % 2 === 0 ? 0 : 1;
  if (settings.colorMode === 3) {
    return smoother(0.5 + 0.5 * Math.sin(
      pathT * TWO_PI - settings.phase * TWO_PI * settings.colorCycles,
    ));
  }
  return pathT < settings.colorPosition ? 0 : 1;
}

function clearCanvas(targetContext, targetCanvas) {
  targetContext.save();
  targetContext.setTransform(1, 0, 0, 1, 0, 0);
  targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  targetContext.restore();
}

function renderFrame(targetContext, targetCanvas, settings) {
  if (canvasWidth <= 0 || canvasHeight <= 0) return;
  context = targetContext;
  clearCanvas(context, targetCanvas);
  const scale = Math.min(canvasWidth, canvasHeight) * 0.42;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  context.lineWidth = 1.4;
  context.lineCap = "round";

  for (let mirrorIndex = 0; mirrorIndex < settings.mirrorCount; mirrorIndex += 1) {
    const head = fract(
      settings.offset + settings.motion * settings.travelLoops
        + mirrorIndex * settings.mirrorPhase,
    );
    const points = Array.from({ length: POINTS_PER_MIRROR }, (_, index) => (
      spiralPoint(index / (POINTS_PER_MIRROR - 1), mirrorIndex, settings)
    ));

    for (let index = 0; index < POINTS_PER_MIRROR - 1; index += 1) {
      const pathT = (index + 0.5) / (POINTS_PER_MIRROR - 1);
      const trail = readTrail(pathT, head, settings);
      if (trail.brightness < 0.005) continue;

      const amount = colorAmount(pathT, trail.position, mirrorIndex, settings);
      const red = Math.round(mix(settings.colorA[0], settings.colorB[0], amount) * 255);
      const green = Math.round(mix(settings.colorA[1], settings.colorB[1], amount) * 255);
      const blue = Math.round(mix(settings.colorA[2], settings.colorB[2], amount) * 255);
      const alpha = clamp(trail.brightness, 0, 1);
      const pointA = points[index];
      const pointB = points[index + 1];

      context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      context.beginPath();
      context.moveTo(centerX + pointA[0] * scale, centerY - pointA[1] * scale);
      context.lineTo(centerX + pointB[0] * scale, centerY - pointB[1] * scale);
      context.stroke();
    }
  }
}

function render() {
  const settings = readFrameSettings();
  renderFrame(projectionSourceContext, projectionSourceCanvas, settings);
  renderFrame(displayContext, canvas, settings);
}

function tick(now) {
  elapsed += Math.min((now - previousFrame) / 1000, 0.1);
  previousFrame = now;
  render();
  requestAnimationFrame(tick);
}

resizeCanvas();
requestAnimationFrame(tick);
