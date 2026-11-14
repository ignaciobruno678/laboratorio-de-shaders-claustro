"use strict";

const canvas = document.querySelector("#preview");
const context = canvas.getContext("2d");
const controls = {
  colorMode: document.querySelector("#colorMode"),
  color: document.querySelector("#color"),
  color2: document.querySelector("#color2"),
};

const MAX_FIGURES = 4;
const POINTS_PER_FIGURE = 600;
const PI = Math.PI;
const TWO_PI = 2 * PI;
let canvasWidth = 0;
let canvasHeight = 0;
let viewScale = 1;
let elapsed = 0;
let previousFrame = performance.now();

const groups = [
  {
    title: "Figura y superposición",
    controls: [
      ["figureCount", "Cantidad", 1, 4, 1, 1],
      ["size", "Tamaño", 0.05, 1, 0.01, 0.65],
      ["scaleX", "Escala X", 0.1, 2, 0.01, 1],
      ["scaleY", "Escala Y", 0.1, 2, 0.01, 1],
      ["rotation", "Rotación", -360, 360, 1, 0],
      ["layerRotation", "Rotación entre capas", -180, 180, 1, 20],
      ["layerScaleStep", "Cambio de escala por capa", -0.3, 0.5, 0.01, 0.08],
      ["layerTrimPhase", "Desfase de trim por capa", 0, 1, 0.01, 0.08],
    ],
  },
  {
    title: "Trim",
    controls: [
      ["start", "Inicio", 0, 1, 0.01, 0],
      ["end", "Fin", 0, 1, 0.01, 0.2],
      ["offset", "Desplazamiento", -4, 4, 0.01, 0],
      ["autoTravelLoops", "Vueltas automáticas", 0, 16, 1, 1],
      ["trimSoftness", "Suavidad", 0.001, 0.2, 0.001, 0.025],
    ],
  },
  {
    title: "Movimiento",
    controls: [
      ["duration", "Duración (s)", 0.2, 30, 0.1, 6],
      ["speed", "Velocidad", 0, 5, 0.1, 1],
      ["easeStrength", "Intensidad de easing", 0, 1, 0.01, 1],
      ["elasticAmount", "Elasticidad", 0, 1, 0.01, 0.1],
      ["elasticFrequency", "Frecuencia elástica", 0.5, 8, 0.1, 2.5],
      ["elasticDamping", "Amortiguación elástica", 1, 12, 0.1, 5],
    ],
  },
  {
    title: "Forma orgánica",
    controls: [
      ["orgFreq1", "Frecuencia 1", 1, 12, 0.1, 3],
      ["orgFreq2", "Frecuencia 2", 1, 16, 0.1, 5],
      ["orgAmp1", "Amplitud 1", 0, 0.5, 0.01, 0.18],
      ["orgAmp2", "Amplitud 2", 0, 0.5, 0.01, 0.1],
      ["orgSkewX", "Inclinación X", -1, 1, 0.01, 0.2],
      ["orgSkewY", "Inclinación Y", -1, 1, 0.01, 0.1],
      ["orgTwist", "Giro", 0, 1.5, 0.01, 0.35],
    ],
  },
  {
    title: "Brillo",
    controls: [["brightness", "Brillo", 0, 2, 0.01, 1]],
  },
];

function value(name) {
  return Number(controls[name].value);
}

function formatValue(n, step) {
  if (step >= 1) return String(n);
  if (step >= 0.1) return n.toFixed(1);
  if (step >= 0.01) return n.toFixed(2);
  return n.toFixed(3);
}

function createControls() {
  const container = document.querySelector("#generatedControls");
  groups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "parameter-group";

    const heading = document.createElement("h2");
    heading.className = "section-title";
    heading.textContent = group.title;
    section.append(heading);

    group.controls.forEach(([id, labelText, min, max, step, initial]) => {
      const label = document.createElement("label");
      label.className = "field";

      const caption = document.createElement("span");
      caption.append(document.createTextNode(labelText));

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
controls.colorMode.addEventListener("change", () => {
  document.querySelector("#color2Group").hidden = controls.colorMode.value !== "1";
});

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  canvasWidth = rect.width;
  canvasHeight = rect.height;
  canvas.width = Math.round(rect.width * pixelRatio);
  canvas.height = Math.round(rect.height * pixelRatio);
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

new ResizeObserver(resizeCanvas).observe(canvas);

function fract(n) {
  return n - Math.floor(n);
}

function clamp(n, low, high) {
  return Math.max(low, Math.min(high, n));
}

function smoother(x) {
  x = clamp(x, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function rotate2D(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * point[0] - s * point[1], s * point[0] + c * point[1]];
}

function linePoint(a, b, t) {
  t = clamp(t, 0, 1);
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function quadraticBezier(a, b, c, t) {
  const u = 1 - t;
  return [
    u * u * a[0] + 2 * u * t * b[0] + t * t * c[0],
    u * u * a[1] + 2 * u * t * b[1] + t * t * c[1],
  ];
}

function organicShape(t) {
  const a = t * TWO_PI;
  const angle = a + value("orgTwist") * 0.55 * Math.sin(2 * a);
  const radius = 0.72
    + value("orgAmp1") * Math.sin(value("orgFreq1") * angle)
    + value("orgAmp2") * Math.cos(value("orgFreq2") * angle + 0.8);
  return [
    Math.cos(angle) * radius + value("orgSkewX") * 0.22 * Math.sin(2 * a),
    Math.sin(angle) * radius + value("orgSkewY") * 0.22 * Math.cos(3 * a),
  ];
}

function greekCrossVertex(index, horizontal, vertical, width) {
  const vertices = [
    [-width, vertical], [width, vertical], [width, width], [horizontal, width],
    [horizontal, -width], [width, -width], [width, -vertical], [-width, -vertical],
    [-width, -width], [-horizontal, -width], [-horizontal, width], [-width, width],
  ];
  return vertices[index % vertices.length];
}

function greekCross(t, horizontal, vertical, width) {
  const segmentValue = t * 12;
  const segment = Math.min(Math.floor(segmentValue), 11);
  return linePoint(
    greekCrossVertex(segment, horizontal, vertical, width),
    greekCrossVertex((segment + 1) % 12, horizontal, vertical, width),
    fract(segmentValue),
  );
}

function steppedCross(t) {
  const horizontal = value("crossHorizontal");
  const vertical = value("crossVertical");
  const width = value("crossWidth");
  const step = Math.min(value("crossStep"), Math.min(horizontal, vertical) * 0.45);
  const vertices = [
    [-width, vertical], [width, vertical], [width, vertical - step],
    [width + step, vertical - step], [width + step, width + step],
    [horizontal - step, width + step], [horizontal - step, width],
    [horizontal, width], [horizontal, -width], [horizontal - step, -width],
    [horizontal - step, -width - step], [width + step, -width - step],
    [width + step, -vertical + step], [width, -vertical + step],
    [width, -vertical], [-width, -vertical], [-width, -vertical + step],
    [-width - step, -vertical + step], [-width - step, -width - step],
    [-horizontal + step, -width - step], [-horizontal + step, -width],
    [-horizontal, -width], [-horizontal, width], [-horizontal + step, width],
    [-horizontal + step, width + step], [-width - step, width + step],
    [-width - step, vertical - step], [-width, vertical - step],
  ];
  const segmentValue = t * 28;
  const segment = Math.min(Math.floor(segmentValue), 27);
  return linePoint(vertices[segment], vertices[(segment + 1) % 28], fract(segmentValue));
}

function crossShape(t) {
  const type = value("crossType");
  const horizontal = value("crossHorizontal");
  const vertical = value("crossVertical");
  const width = value("crossWidth");

  if (type === 1) return greekCross(t, horizontal * 0.72, vertical, width);
  if (type === 2) return greekCross(t, horizontal, vertical * 0.72, width);
  if (type === 3) return steppedCross(t);
  if (type !== 4) return greekCross(t, horizontal, vertical, width);

  if (t < 0.5) return greekCross(t * 2, horizontal, vertical, width);
  const point = greekCross((t - 0.5) * 2, horizontal, vertical, width);
  const rotated = rotate2D(point, PI * 0.5);
  const scale = 1 - value("crossDoubleOffset") * 0.35;
  return [rotated[0] * scale, rotated[1] * scale];
}

function flowerShape(t) {
  const petals = Math.round(value("flowerPetals"));
  const total = t * petals;
  const petalIndex = Math.min(Math.floor(total), petals - 1);
  const petalT = fract(total);
  const angle = TWO_PI * petalIndex / petals
    + value("flowerTwist") * Math.sin(TWO_PI * petalIndex / petals);
  const alternating = petalIndex % 2;
  const length = value("flowerLength") * (1 - value("flowerAlternate") * alternating);
  const direction = [Math.cos(angle), Math.sin(angle)];
  const perpendicular = [-direction[1], direction[0]];
  const center = [0, 0];
  const tip = [direction[0] * length, direction[1] * length];
  const width = value("flowerWidth") * length;

  if (petalT < 0.5) {
    const u = petalT * 2;
    const control = [
      direction[0] * length * 0.52 + perpendicular[0] * width,
      direction[1] * length * 0.52 + perpendicular[1] * width,
    ];
    return quadraticBezier(center, control, tip, u);
  }

  const u = (petalT - 0.5) * 2;
  const control = [
    direction[0] * length * 0.52 - perpendicular[0] * width,
    direction[1] * length * 0.52 - perpendicular[1] * width,
  ];
  return quadraticBezier(tip, control, center, u);
}

function figurePoint(t) {
  return organicShape(t);
}

function motionProgress(time) {
  const p = fract(time / Math.max(value("duration"), 0.001));
  const eased = p + (smoother(p) - p) * value("easeStrength");
  const spring = Math.sin(p * PI * value("elasticFrequency"))
    * Math.exp(-p * value("elasticDamping"))
    * Math.sin(p * PI);
  return eased + value("elasticAmount") * 0.18 * spring;
}

function trimMask(t, startValue, endValue) {
  const softness = Math.max(value("trimSoftness"), 0.0001);
  if (Math.abs(endValue - startValue) >= 0.999) return 1;

  const start = fract(startValue + 1);
  const end = fract(endValue + 1);
  const position = fract(t + 1);
  if (start <= end) {
    const fadeStart = smoothstep(start - softness, start + softness, position);
    const fadeEnd = 1 - smoothstep(end - softness, end + softness, position);
    return fadeStart * fadeEnd;
  }

  const highPart = smoothstep(start - softness, start + softness, position);
  const lowPart = 1 - smoothstep(end - softness, end + softness, position);
  return Math.max(highPart, lowPart);
}

function drawFigure(figureIndex, motion, points) {
  const layerScale = Math.max(0.05, 1 + figureIndex * value("layerScaleStep"));
  const scale = value("size") * layerScale;
  const rotation = (value("rotation") + figureIndex * value("layerRotation")) * PI / 180;
  const animatedOffset = value("offset")
    + motion * value("autoTravelLoops")
    + figureIndex * value("layerTrimPhase");
  const step = 1 / (POINTS_PER_FIGURE - 1);

  for (let pointIndex = 0; pointIndex < POINTS_PER_FIGURE - 1; pointIndex += 1) {
    const t0 = pointIndex * step;
    const t1 = (pointIndex + 1) * step;
    const t = (t0 + t1) * 0.5;
    const trimT = fract(t - animatedOffset + 20);
    const brightness = trimMask(trimT, value("start"), value("end")) * value("brightness");
    if (brightness < 0.005) continue;

    const transform = (p) => {
      const scaled = [p[0] * scale * value("scaleX"), p[1] * scale * value("scaleY")];
      const rotated = rotate2D(scaled, rotation);
      return [
        canvasWidth / 2 + rotated[0] * viewScale,
        canvasHeight / 2 - rotated[1] * viewScale,
      ];
    };
    const a = transform(points[pointIndex]);
    const b = transform(points[pointIndex + 1]);

    const color = controls.colorMode.value === "1" && t >= 0.5
      ? controls.color2.value
      : controls.color.value;
    context.beginPath();
    context.moveTo(a[0], a[1]);
    context.lineTo(b[0], b[1]);
    context.globalAlpha = Math.min(1, brightness);
    context.strokeStyle = color;
    context.lineWidth = 1.5;
    context.stroke();
  }
  context.globalAlpha = 1;
}

function render(now) {
  if (canvasWidth <= 0 || canvasHeight <= 0) return;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  viewScale = Math.min(canvasWidth, canvasHeight) * 0.42;
  const time = now * value("speed");
  const motion = motionProgress(time);
  const count = clamp(Math.round(value("figureCount")), 1, MAX_FIGURES);
  const points = Array.from(
    { length: POINTS_PER_FIGURE },
    (_, index) => figurePoint(index / (POINTS_PER_FIGURE - 1)),
  );

  for (let figureIndex = 0; figureIndex < count; figureIndex += 1) {
    drawFigure(figureIndex, motion, points);
  }
}

function tick(now) {
  elapsed += Math.min((now - previousFrame) / 1000, 0.1);
  previousFrame = now;
  render(elapsed);
  requestAnimationFrame(tick);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(tick);
