"use strict";

const sourceCanvas = document.querySelector("#preview");
const orientationControl = document.querySelector("#projectorOrientation");
const distanceControl = document.querySelector("#projectorDistance");
const apertureControl = document.querySelector("#projectorAperture");
const brumaControl = document.querySelector("#brumaAlpha");
const distanceOutput = document.querySelector("#projectorDistanceValue");
const apertureOutput = document.querySelector("#projectorApertureValue");
const brumaOutput = document.querySelector("#brumaAlphaValue");
const views = ["projectionIso", "projectionProfile"].map((id) => {
  const canvas = document.querySelector(`#${id}`);
  return { canvas, context: canvas.getContext("2d"), width: 0, height: 0 };
});

const sampleCanvas = document.createElement("canvas");
const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
const cos30 = Math.cos(Math.PI / 6);
const sin30 = Math.sin(Math.PI / 6);
const projectionShapeScale = 2.5; // Visual emphasis; the displayed footprint is not to physical scale.
const projectionZoom = 1.35;
const volumeSliceSteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

function resizeView(view) {
  const rect = view.canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  view.width = rect.width;
  view.height = rect.height;
  view.canvas.width = Math.round(rect.width * pixelRatio);
  view.canvas.height = Math.round(rect.height * pixelRatio);
  view.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

views.forEach((view) => new ResizeObserver(() => resizeView(view)).observe(view.canvas));

function readSettings() {
  const distance = Number(distanceControl.value);
  const aperture = Number(apertureControl.value);
  const fieldWidth = 2 * distance * Math.tan(aperture * Math.PI / 360);
  const sourceRect = sourceCanvas.getBoundingClientRect();
  const aspect = sourceRect.width > 0 && sourceRect.height > 0
    ? sourceRect.width / sourceRect.height
    : 1;
  const fieldHeight = fieldWidth / aspect;
  const orientation = orientationControl.value;

  if (orientation === "floor") {
    return {
      orientation,
      distance,
      aperture,
      brumaAlpha: Number(brumaControl.value) / 100,
      width: fieldWidth,
      height: fieldHeight,
      projector: [0, 0, distance],
      corners: [
        [-fieldWidth / 2, -fieldHeight / 2, 0],
        [fieldWidth / 2, -fieldHeight / 2, 0],
        [fieldWidth / 2, fieldHeight / 2, 0],
        [-fieldWidth / 2, fieldHeight / 2, 0],
      ],
    };
  }

  return {
    orientation,
    distance,
    aperture,
    brumaAlpha: Number(brumaControl.value) / 100,
    width: fieldWidth,
    height: fieldHeight,
    projector: [0, -distance, 0],
    corners: [
      [-fieldWidth / 2, 0, -fieldHeight / 2],
      [fieldWidth / 2, 0, -fieldHeight / 2],
      [fieldWidth / 2, 0, fieldHeight / 2],
      [-fieldWidth / 2, 0, fieldHeight / 2],
    ],
  };
}

function captureFigure() {
  const rect = sourceCanvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0 || sourceCanvas.width <= 0) return null;

  const width = 320;
  const height = Math.max(32, Math.round(width * rect.height / rect.width));
  if (sampleCanvas.width !== width || sampleCanvas.height !== height) {
    sampleCanvas.width = width;
    sampleCanvas.height = height;
  }

  sampleContext.clearRect(0, 0, width, height);
  sampleContext.drawImage(sourceCanvas, 0, 0, width, height);
  return { width, height, pixels: sampleContext.getImageData(0, 0, width, height).data };
}

function projectIso(point) {
  return [
    (point[0] - point[1]) * cos30,
    (point[0] + point[1]) * sin30 - point[2],
  ];
}

function createIsoTransform(view, settings) {
  const projector = projectIso(settings.projector);
  const projectedCorners = settings.corners.map((corner) => (
    projectIso(corner.map((coordinate) => coordinate * projectionShapeScale))
  ));
  const maxX = Math.max(...projectedCorners.map((point) => Math.abs(point[0] - projector[0])));
  const maxY = Math.max(...projectedCorners.map((point) => Math.abs(point[1] - projector[1])));
  const margin = 14;
  const scale = Math.min(
    (view.width - margin * 2) / Math.max(maxX * 2, 0.001),
    (view.height - margin * 2) / Math.max(maxY * 2, 0.001),
  ) * projectionZoom;
  const offsetX = view.width / 2 - projector[0] * scale;
  const offsetY = view.height / 2 - projector[1] * scale;

  return {
    scale,
    map(point) {
      const projected = projectIso(point);
      return [offsetX + projected[0] * scale, offsetY + projected[1] * scale];
    },
  };
}

function drawTriangle(context, points, fill) {
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  context.lineTo(points[1][0], points[1][1]);
  context.lineTo(points[2][0], points[2][1]);
  context.closePath();
  context.fillStyle = fill;
  context.fill();
}

function interpolatePoint(start, end, amount) {
  return [
    start[0] + (end[0] - start[0]) * amount,
    start[1] + (end[1] - start[1]) * amount,
    start[2] + (end[2] - start[2]) * amount,
  ];
}

function collectFigurePixels(sample) {
  if (!sample) return [];

  const points = [];
  for (let y = 0; y < sample.height; y += 1) {
    for (let x = 0; x < sample.width; x += 1) {
      const index = (y * sample.width + x) * 4;
      const alpha = sample.pixels[index + 3] / 255;
      if (alpha < 0.08) continue;

      points.push({
        column: x,
        row: y,
        x: (x + 0.5) / sample.width - 0.5,
        y: 0.5 - (y + 0.5) / sample.height,
        red: sample.pixels[index],
        green: sample.pixels[index + 1],
        blue: sample.pixels[index + 2],
        alpha,
      });
    }
  }
  return points;
}

function targetPoint(pixel, settings) {
  const x = pixel.x * settings.width * projectionShapeScale;
  const y = pixel.y * settings.height * projectionShapeScale;
  return settings.orientation === "floor" ? [x, y, 0] : [x, 0, y];
}

function targetPixelCorners(pixel, settings, sample) {
  const left = (pixel.column / sample.width - 0.5) * settings.width * projectionShapeScale;
  const right = ((pixel.column + 1) / sample.width - 0.5) * settings.width * projectionShapeScale;
  const top = (0.5 - pixel.row / sample.height) * settings.height * projectionShapeScale;
  const bottom = (0.5 - (pixel.row + 1) / sample.height) * settings.height * projectionShapeScale;
  return settings.orientation === "floor"
    ? [[left, top, 0], [right, top, 0], [right, bottom, 0], [left, bottom, 0]]
    : [[left, 0, top], [right, 0, top], [right, 0, bottom], [left, 0, bottom]];
}

function targetCenter(points, settings) {
  if (points.length === 0) return [0, 0, 0];
  const targets = points.map((pixel) => targetPoint(pixel, settings));
  const xs = targets.map((point) => point[0]);
  const ys = targets.map((point) => settings.orientation === "floor" ? point[1] : point[2]);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  return settings.orientation === "floor" ? [centerX, centerY, 0] : [centerX, 0, centerY];
}

function projectionPlanePoint(horizontal, vertical, settings) {
  return settings.orientation === "floor"
    ? [horizontal, vertical, 0]
    : [horizontal, 0, vertical];
}

function pixelRgba(pixel, alpha) {
  return `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${alpha})`;
}

function averagePixelColor(points) {
  return points.reduce((color, pixel) => ({
    red: color.red + pixel.red / points.length,
    green: color.green + pixel.green / points.length,
    blue: color.blue + pixel.blue / points.length,
  }), { red: 0, green: 0, blue: 0 });
}

function drawFigureVolume(context, settings, projector, points, frame, sample) {
  if (settings.brumaAlpha <= 0 || points.length === 0) return;

  const surfacePixelSize = Math.max(
    1,
    frame.scale * Math.min(settings.width / sample.width, settings.height / sample.height)
      * projectionShapeScale * 0.8,
  );
  const mappedProjector = frame.map(projector);

  points.forEach((pixel) => {
    const mappedCorners = targetPixelCorners(pixel, settings, sample).map(frame.map);
    mappedCorners.forEach((corner, index) => {
      const nextCorner = mappedCorners[(index + 1) % mappedCorners.length];
      const gradient = context.createLinearGradient(
        mappedProjector[0],
        mappedProjector[1],
        (corner[0] + nextCorner[0]) / 2,
        (corner[1] + nextCorner[1]) / 2,
      );
      const alpha = settings.brumaAlpha * pixel.alpha;
      gradient.addColorStop(0, pixelRgba(pixel, alpha * 0.1));
      gradient.addColorStop(1, pixelRgba(pixel, alpha * 0.7));
      drawTriangle(context, [mappedProjector, corner, nextCorner], gradient);
    });
  });

  context.save();
  context.lineWidth = Math.max(surfacePixelSize * 2, 2);
  points.forEach((pixel) => {
    const mappedTarget = frame.map(targetPoint(pixel, settings));
    context.strokeStyle = pixelRgba(pixel, settings.brumaAlpha * pixel.alpha * 0.35);
    context.beginPath();
    context.moveTo(mappedProjector[0], mappedProjector[1]);
    context.lineTo(mappedTarget[0], mappedTarget[1]);
    context.stroke();
  });
  context.restore();

  volumeSliceSteps.forEach((amount) => {
    points.forEach((pixel) => {
      const slice = frame.map(interpolatePoint(
        projector,
        targetPoint(pixel, settings),
        amount,
      ));
      const size = Math.max(1.8, surfacePixelSize * 2.2);
      context.fillStyle = pixelRgba(
        pixel,
        settings.brumaAlpha * pixel.alpha * 0.18,
      );
      context.fillRect(slice[0] - size / 2, slice[1] - size / 2, size, size);
    });
  });
}

function drawIsoFigure(context, frame, settings, points, sample) {
  if (!sample || points.length === 0) return;
  const pixelSize = Math.max(
    1,
    frame.scale * Math.min(settings.width / sample.width, settings.height / sample.height)
      * projectionShapeScale * 0.8,
  );
  points.forEach((pixel) => {
    const [screenX, screenY] = frame.map(targetPoint(pixel, settings));
    context.fillStyle = pixelRgba(pixel, 0.55);
    context.fillRect(
      screenX - pixelSize / 2 - 0.7,
      screenY - pixelSize / 2 - 0.7,
      pixelSize + 1.4,
      pixelSize + 1.4,
    );
    context.fillStyle = pixelRgba(pixel, pixel.alpha);
    context.fillRect(screenX - pixelSize / 2, screenY - pixelSize / 2, pixelSize, pixelSize);
  });
}

function drawProjector(context, point, label) {
  context.fillStyle = "#ff0000";
  context.beginPath();
  context.arc(point[0], point[1], 4, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#ededed";
  context.font = "10px Helvetica, Arial, sans-serif";
  context.fillText(label, point[0] + 8, point[1] - 8);
}

function drawProjectionGrid(context, frame, settings) {
  const halfWidth = settings.width * projectionShapeScale / 2;
  const halfHeight = settings.height * projectionShapeScale / 2;
  context.save();
  for (let division = -2; division <= 2; division += 1) {
    const horizontal = halfWidth * division / 3;
    const vertical = halfHeight * division / 3;
    context.strokeStyle = division === 0
      ? "rgba(255, 255, 255, 0.28)"
      : "rgba(255, 255, 255, 0.15)";
    context.lineWidth = division === 0 ? 1 : 0.65;

    const acrossPlane = [
      frame.map(projectionPlanePoint(horizontal, -halfHeight, settings)),
      frame.map(projectionPlanePoint(horizontal, halfHeight, settings)),
    ];
    context.beginPath();
    context.moveTo(acrossPlane[0][0], acrossPlane[0][1]);
    context.lineTo(acrossPlane[1][0], acrossPlane[1][1]);
    context.stroke();

    const alongPlane = [
      frame.map(projectionPlanePoint(-halfWidth, vertical, settings)),
      frame.map(projectionPlanePoint(halfWidth, vertical, settings)),
    ];
    context.beginPath();
    context.moveTo(alongPlane[0][0], alongPlane[0][1]);
    context.lineTo(alongPlane[1][0], alongPlane[1][1]);
    context.stroke();
  }
  context.restore();
}

function drawIso(view, settings, sample, points) {
  const context = view.context;
  context.clearRect(0, 0, view.width, view.height);
  context.fillStyle = "#000000";
  context.fillRect(0, 0, view.width, view.height);
  const center = targetCenter(points, settings);
  const frame = createIsoTransform(view, settings);
  const projector = frame.map(settings.projector);
  const mappedTargetCenter = frame.map(center);
  drawProjectionGrid(context, frame, settings);
  drawFigureVolume(context, settings, settings.projector, points, frame, sample);
  drawIsoFigure(context, frame, settings, points, sample);

  drawProjector(context, projector, "PROYECTOR");
  context.fillStyle = "#cccccc";
  context.font = "10px Helvetica, Arial, sans-serif";
  context.fillText(
    settings.orientation === "floor" ? "SUELO" : "PARED",
    mappedTargetCenter[0] + 6,
    mappedTargetCenter[1] + 14,
  );
}

function profileProjector(settings) {
  return settings.orientation === "floor"
    ? [0, settings.distance]
    : [-settings.distance, 0];
}

function createProfileTransform(view, settings) {
  const projector = profileProjector(settings);
  const axisHalfLength = (settings.orientation === "floor" ? settings.width : settings.height)
    * projectionShapeScale / 2;
  const targets = settings.orientation === "floor"
    ? [[-axisHalfLength, 0], [axisHalfLength, 0]]
    : [[0, -axisHalfLength], [0, axisHalfLength]];
  const maxX = Math.max(...targets.map((point) => Math.abs(point[0] - projector[0])));
  const maxY = Math.max(...targets.map((point) => Math.abs(point[1] - projector[1])));
  const margin = 14;
  const scale = Math.min(
    (view.width - margin * 2) / Math.max(maxX * 2, 0.001),
    (view.height - margin * 2) / Math.max(maxY * 2, 0.001),
  ) * projectionZoom;
  const offsetX = view.width / 2 - projector[0] * scale;
  const offsetY = view.height / 2 + projector[1] * scale;

  return {
    scale,
    map(point) {
      return [offsetX + point[0] * scale, offsetY - point[1] * scale];
    },
  };
}

function drawProfileFigure(context, transform, settings, points, sample) {
  if (!sample || points.length === 0) return;
  const pixelSize = Math.max(
    1,
    transform.scale * (settings.orientation === "floor"
      ? settings.width / sample.width
      : settings.height / sample.height) * projectionShapeScale * 0.8,
  );
  points.forEach((pixel) => {
    const coordinate = settings.orientation === "floor"
      ? [pixel.x * settings.width * projectionShapeScale, 0]
      : [0, pixel.y * settings.height * projectionShapeScale];
    const point = transform.map(coordinate);
    context.fillStyle = pixelRgba(pixel, 0.55);
    context.fillRect(
      point[0] - pixelSize / 2 - 0.5,
      point[1] - pixelSize / 2 - 0.5,
      pixelSize + 1,
      pixelSize + 1,
    );
    context.fillStyle = pixelRgba(pixel, pixel.alpha);
    context.fillRect(point[0] - pixelSize / 2, point[1] - pixelSize / 2, pixelSize, pixelSize);
  });
}

function drawProfileVolume(context, transform, settings, projector, points, sample) {
  if (!sample || settings.brumaAlpha <= 0 || points.length === 0) return;

  const axisSize = settings.orientation === "floor"
    ? settings.width / sample.width * projectionShapeScale
    : settings.height / sample.height * projectionShapeScale;
  const pixelSize = Math.max(0.7, transform.scale * axisSize * 0.8);
  const mappedProjector = transform.map(projector);
  const axisValues = points.map((pixel) => (
    (settings.orientation === "floor" ? pixel.x : pixel.y)
      * (settings.orientation === "floor" ? settings.width : settings.height)
      * projectionShapeScale
  ));
  const minAxis = Math.min(...axisValues) - axisSize / 2;
  const maxAxis = Math.max(...axisValues) + axisSize / 2;
  const targetStart = settings.orientation === "floor" ? [minAxis, 0] : [0, minAxis];
  const targetEnd = settings.orientation === "floor" ? [maxAxis, 0] : [0, maxAxis];
  const screenStart = transform.map(targetStart);
  const screenEnd = transform.map(targetEnd);
  const averageColor = averagePixelColor(points);

  drawTriangle(
    context,
    [mappedProjector, screenStart, screenEnd],
    pixelRgba(averageColor, settings.brumaAlpha * 0.55),
  );
  volumeSliceSteps.forEach((amount) => {
    const start = transform.map([
      projector[0] + (targetStart[0] - projector[0]) * amount,
      projector[1] + (targetStart[1] - projector[1]) * amount,
    ]);
    const end = transform.map([
      projector[0] + (targetEnd[0] - projector[0]) * amount,
      projector[1] + (targetEnd[1] - projector[1]) * amount,
    ]);
    context.strokeStyle = pixelRgba(averageColor, settings.brumaAlpha * 0.18);
    context.lineWidth = 0.75;
    context.beginPath();
    context.moveTo(start[0], start[1]);
    context.lineTo(end[0], end[1]);
    context.stroke();
  });

  context.save();
  context.lineWidth = Math.max(pixelSize * 2, 2);
  points.forEach((pixel) => {
    const coordinate = settings.orientation === "floor"
      ? [pixel.x * settings.width * projectionShapeScale, 0]
      : [0, pixel.y * settings.height * projectionShapeScale];
    const mappedTarget = transform.map(coordinate);
    context.strokeStyle = pixelRgba(pixel, settings.brumaAlpha * pixel.alpha * 0.35);
    context.beginPath();
    context.moveTo(mappedProjector[0], mappedProjector[1]);
    context.lineTo(mappedTarget[0], mappedTarget[1]);
    context.stroke();
  });
  context.restore();

  volumeSliceSteps.forEach((amount) => {
    points.forEach((pixel) => {
      const coordinate = settings.orientation === "floor"
        ? [pixel.x * settings.width * projectionShapeScale, 0]
        : [0, pixel.y * settings.height * projectionShapeScale];
      const point = transform.map(interpolatePoint(
        [projector[0], projector[1], 0],
        [coordinate[0], coordinate[1], 0],
        amount,
      ).slice(0, 2));
      const size = Math.max(1.8, pixelSize * 2.2);
      context.fillStyle = pixelRgba(
        pixel,
        settings.brumaAlpha * pixel.alpha * 0.18,
      );
      context.fillRect(point[0] - size / 2, point[1] - size / 2, size, size);
    });
  });
}

function drawProfile(view, settings, sample, points) {
  const context = view.context;
  context.clearRect(0, 0, view.width, view.height);
  context.fillStyle = "#000000";
  context.fillRect(0, 0, view.width, view.height);

  const projector = profileProjector(settings);
  const axisLength = settings.orientation === "floor" ? settings.width : settings.height;
  const axisValues = points.map((pixel) => (
    (settings.orientation === "floor" ? pixel.x : pixel.y)
      * axisLength * projectionShapeScale
  ));
  const axisHalfLength = axisLength * projectionShapeScale / 2;
  const minAxis = points.length > 0 ? Math.min(...axisValues) : -axisHalfLength;
  const maxAxis = points.length > 0 ? Math.max(...axisValues) : axisHalfLength;
  const padding = points.length > 0
    ? Math.max(
      (maxAxis - minAxis) * 0.15,
      axisLength * projectionShapeScale * 0.025,
    )
    : 0;
  const targetMin = Math.max(minAxis - padding, -axisHalfLength);
  const targetMax = Math.min(maxAxis + padding, axisHalfLength);
  const target = settings.orientation === "floor"
    ? [[targetMin, 0], [targetMax, 0]]
    : [[0, targetMin], [0, targetMax]];
  const transform = createProfileTransform(view, settings);
  const screenProjector = transform.map(projector);
  const screenTarget = target.map(transform.map);
  const screenCenter = transform.map([0, 0]);

  drawProfileVolume(context, transform, settings, projector, points, sample);
  context.strokeStyle = points.length > 0
    ? pixelRgba(averagePixelColor(points), 0.9)
    : "#aaaaaa";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(screenTarget[0][0], screenTarget[0][1]);
  context.lineTo(screenTarget[1][0], screenTarget[1][1]);
  context.stroke();

  context.setLineDash([4, 4]);
  context.strokeStyle = "rgba(255, 255, 255, 0.35)";
  context.beginPath();
  context.moveTo(screenProjector[0], screenProjector[1]);
  context.lineTo(screenCenter[0], screenCenter[1]);
  context.stroke();
  context.setLineDash([]);

  drawProfileFigure(context, transform, settings, points, sample);
  drawProjector(context, screenProjector, "PROYECTOR");
  context.fillStyle = "#cccccc";
  context.font = "10px Helvetica, Arial, sans-serif";
  context.fillText(
    `${settings.distance.toFixed(1)} m · ${settings.aperture}°`,
    10,
    16,
  );
}

function updateOutputs() {
  distanceOutput.value = `${Number(distanceControl.value).toFixed(1)} m`;
  distanceOutput.textContent = distanceOutput.value;
  apertureOutput.value = `${Number(apertureControl.value).toFixed(0)}°`;
  apertureOutput.textContent = apertureOutput.value;
  brumaOutput.value = `${Number(brumaControl.value).toFixed(0)}%`;
  brumaOutput.textContent = brumaOutput.value;
}

distanceControl.addEventListener("input", updateOutputs);
apertureControl.addEventListener("input", updateOutputs);
brumaControl.addEventListener("input", updateOutputs);
updateOutputs();

function renderProjection() {
  const settings = readSettings();
  const sample = captureFigure();
  const points = collectFigurePixels(sample);
  if (views.every((view) => view.width > 0 && view.height > 0)) {
    drawIso(views[0], settings, sample, points);
    drawProfile(views[1], settings, sample, points);
  }
  requestAnimationFrame(renderProjection);
}

views.forEach(resizeView);
requestAnimationFrame(renderProjection);
