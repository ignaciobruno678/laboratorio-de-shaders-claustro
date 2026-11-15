"use strict";

const sourceCanvas = window.projectionSourceCanvas;
if (!(sourceCanvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing unzoomed projection source canvas.");
}
const orientationControl = document.querySelector("#projectorOrientation");
const brumaControl = document.querySelector("#brumaAlpha");
const brumaOutput = document.querySelector("#brumaAlphaValue");
const brumaScaleControl = document.querySelector("#brumaScale");
const brumaScaleOutput = document.querySelector("#brumaScaleValue");
const brumaContrastControl = document.querySelector("#brumaContrast");
const brumaContrastOutput = document.querySelector("#brumaContrastValue");
const zoomOutControl = document.querySelector("#projectionZoomOut");
const zoomInControl = document.querySelector("#projectionZoomIn");
const zoomResetControl = document.querySelector("#projectionZoomReset");
const zoomOutput = document.querySelector("#projectionZoomValue");
const gridModeControl = document.querySelector("#projectionGridMode");
const solidModeControl = document.querySelector("#projectionSolidMode");
const views = ["projectionIso", "projectionProfile"].map((id) => {
  const canvas = document.querySelector(`#${id}`);
  const volumeCanvas = document.createElement("canvas");
  return {
    canvas,
    context: canvas.getContext("2d"),
    volumeCanvas,
    volumeContext: volumeCanvas.getContext("2d"),
    width: 0,
    height: 0,
  };
});

const sampleCanvas = document.createElement("canvas");
const sampleContext = sampleCanvas.getContext("2d", { willReadFrequently: true });
const cos30 = Math.cos(Math.PI / 6);
const sin30 = Math.sin(Math.PI / 6);
const projectorDistance = 2;
const projectorAperture = 30;
const projectionShapeScale = 2.5; // Visual emphasis; the displayed footprint is not to physical scale.
const volumeSliceSteps = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
const brumaNoiseWidth = 128;
const brumaNoiseHeight = 96;
const brumaNoiseDepthLayers = 11;
const brumaNoiseAnimationSpeed = 0.5;
const brumaNoiseMaskCanvas = document.createElement("canvas");
const brumaNoiseMaskContext = brumaNoiseMaskCanvas.getContext("2d");
brumaNoiseMaskCanvas.width = brumaNoiseWidth;
brumaNoiseMaskCanvas.height = brumaNoiseHeight;
let projectionZoom = 1;
let projectionPan = { x: 0, y: 0 };
let dragPointerId = null;
let lastPointerPosition = null;
let projectionSurfaceMode = "grid";
let cachedBrumaNoiseFields = [];
let lastBrumaNoiseUpdate = -Infinity;

function resizeView(view) {
  const rect = view.canvas.getBoundingClientRect();
  const pixelRatio = window.devicePixelRatio || 1;
  const resolutionScale = pixelRatio * (view === views[0] ? projectionZoom : 1);
  view.width = rect.width;
  view.height = rect.height;
  view.canvas.width = Math.round(rect.width * resolutionScale);
  view.canvas.height = Math.round(rect.height * resolutionScale);
  view.context.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0);
  view.volumeCanvas.width = view.canvas.width;
  view.volumeCanvas.height = view.canvas.height;
  view.volumeContext.setTransform(resolutionScale, 0, 0, resolutionScale, 0, 0);
}

views.forEach((view) => new ResizeObserver(() => resizeView(view)).observe(view.canvas));

function readBrumaPercent() {
  const minimum = Number(brumaControl.min);
  const maximum = Number(brumaControl.max);
  const value = Number(brumaControl.value);
  return minimum + ((value - minimum) / (maximum - minimum)) * (100 - minimum);
}

function readBrumaSettings() {
  return {
    alpha: readBrumaPercent() / 100,
    scale: Number(brumaScaleControl.value),
    contrast: Number(brumaContrastControl.value) / 100,
  };
}

function scaleSurfacePoint(point, orientation) {
  return orientation === "floor"
    ? [point[0] * projectionShapeScale, point[1] * projectionShapeScale, point[2]]
    : [point[0] * projectionShapeScale, point[1], point[2] * projectionShapeScale];
}

function readSettings() {
  const distance = projectorDistance;
  const aperture = projectorAperture;
  const fieldWidth = 2 * distance * Math.tan(aperture * Math.PI / 360);
  const aspect = sourceCanvas.width > 0 && sourceCanvas.height > 0
    ? sourceCanvas.width / sourceCanvas.height
    : 1;
  const fieldHeight = fieldWidth / aspect;
  const orientation = orientationControl.value;
  const bruma = readBrumaSettings();

  if (orientation === "floor") {
    return {
      orientation,
      distance,
      aperture,
      bruma,
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
    bruma,
    width: fieldWidth,
    height: fieldHeight,
    projector: [0, 0, 0],
    corners: [
      [-fieldWidth / 2, -distance, -fieldHeight / 2],
      [fieldWidth / 2, -distance, -fieldHeight / 2],
      [fieldWidth / 2, -distance, fieldHeight / 2],
      [-fieldWidth / 2, -distance, fieldHeight / 2],
    ],
  };
}

function captureFigure() {
  if (sourceCanvas.width <= 0 || sourceCanvas.height <= 0) return null;

  const width = Math.min(Math.round(480 * projectionZoom), sourceCanvas.width);
  const height = Math.max(32, Math.round(width * sourceCanvas.height / sourceCanvas.width));
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
    projectIso(scaleSurfacePoint(corner, settings.orientation))
  ));
  const minX = Math.min(projector[0], ...projectedCorners.map((point) => point[0]));
  const maxX = Math.max(projector[0], ...projectedCorners.map((point) => point[0]));
  const minY = Math.min(projector[1], ...projectedCorners.map((point) => point[1]));
  const maxY = Math.max(projector[1], ...projectedCorners.map((point) => point[1]));
  const margin = 20;
  const scale = Math.min(
    (view.width - margin * 2) / Math.max(maxX - minX, 0.001),
    (view.height - margin * 2) / Math.max(maxY - minY, 0.001),
  ) * projectionZoom;
  const offsetX = view.width / 2 - (minX + maxX) / 2 * scale
    + projectionPan.x * view.width;
  const offsetY = view.height / 2 - (minY + maxY) / 2 * scale
    + projectionPan.y * view.height;

  return {
    scale,
    map(point) {
      const projected = projectIso(point);
      return [offsetX + projected[0] * scale, offsetY + projected[1] * scale];
    },
    unmap(point) {
      const projectedX = (point[0] - offsetX) / scale;
      const projectedY = (point[1] - offsetY) / scale;
      if (settings.orientation === "floor") {
        const horizontal = projectedX / cos30;
        const vertical = projectedY / sin30;
        return [(horizontal + vertical) / 2, (vertical - horizontal) / 2, 0];
      }

      const horizontal = projectedX / cos30 - settings.distance;
      const vertical = (horizontal - settings.distance) * sin30 - projectedY;
      return [horizontal, -settings.distance, vertical];
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
  return settings.orientation === "floor" ? [x, y, 0] : [x, -settings.distance, y];
}

function targetPixelCorners(pixel, settings, sample) {
  const left = (pixel.column / sample.width - 0.5) * settings.width * projectionShapeScale;
  const right = ((pixel.column + 1) / sample.width - 0.5) * settings.width * projectionShapeScale;
  const top = (0.5 - pixel.row / sample.height) * settings.height * projectionShapeScale;
  const bottom = (0.5 - (pixel.row + 1) / sample.height) * settings.height * projectionShapeScale;
  return settings.orientation === "floor"
    ? [[left, top, 0], [right, top, 0], [right, bottom, 0], [left, bottom, 0]]
    : [
      [left, -settings.distance, top],
      [right, -settings.distance, top],
      [right, -settings.distance, bottom],
      [left, -settings.distance, bottom],
    ];
}

function projectionPlanePoint(horizontal, vertical, settings) {
  return settings.orientation === "floor"
    ? [horizontal, vertical, 0]
    : [horizontal, -settings.distance, vertical];
}

function pixelRgba(pixel, alpha) {
  return `rgba(${pixel.red}, ${pixel.green}, ${pixel.blue}, ${alpha})`;
}

function hashBrumaNoise(x, y) {
  let value = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function valueBrumaNoise(x, y) {
  const left = Math.floor(x);
  const top = Math.floor(y);
  const horizontal = x - left;
  const vertical = y - top;
  const smoothHorizontal = horizontal * horizontal * (3 - 2 * horizontal);
  const smoothVertical = vertical * vertical * (3 - 2 * vertical);
  const topNoise = hashBrumaNoise(left, top) * (1 - smoothHorizontal)
    + hashBrumaNoise(left + 1, top) * smoothHorizontal;
  const bottomNoise = hashBrumaNoise(left, top + 1) * (1 - smoothHorizontal)
    + hashBrumaNoise(left + 1, top + 1) * smoothHorizontal;
  return topNoise * (1 - smoothVertical) + bottomNoise * smoothVertical;
}

function createBrumaNoiseFields(time, bruma) {
  const elapsed = time * brumaNoiseAnimationSpeed;
  return Array.from({ length: brumaNoiseDepthLayers }, (_, layerIndex) => {
    const depth = layerIndex / (brumaNoiseDepthLayers - 1);
    const field = new Float32Array(brumaNoiseWidth * brumaNoiseHeight);
    for (let row = 0; row < brumaNoiseHeight; row += 1) {
      for (let column = 0; column < brumaNoiseWidth; column += 1) {
        const x = column / (brumaNoiseWidth - 1) * 6 / bruma.scale
          + elapsed * 0.09 + depth * 1.4;
        const y = row / (brumaNoiseHeight - 1) * 5 / bruma.scale
          - elapsed * 0.055 + depth * 0.9;
        const broad = valueBrumaNoise(x, y);
        const detail = valueBrumaNoise(x * 2.1 + 12.7, y * 2.1 - 9.3);
        field[row * brumaNoiseWidth + column] = broad * 0.75 + detail * 0.25;
      }
    }
    return field;
  });
}

function brumaNoiseDensity(value, contrast) {
  const contrasted = Math.min(1, Math.max(0, 1 - contrast * (1 - value)));
  const cloud = Math.min(1, Math.max(0, (contrasted - 0.25) / 0.55));
  return cloud * cloud * (3 - 2 * cloud);
}

function updateBrumaNoiseMask(noiseFields, contrast) {
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(views[0].width * pixelRatio));
  const height = Math.max(1, Math.round(views[0].height * pixelRatio));
  if (brumaNoiseMaskCanvas.width !== width || brumaNoiseMaskCanvas.height !== height) {
    brumaNoiseMaskCanvas.width = width;
    brumaNoiseMaskCanvas.height = height;
  }
  const image = brumaNoiseMaskContext.createImageData(width, height);
  const field = noiseFields[Math.floor(noiseFields.length / 2)];
  for (let row = 0; row < height; row += 1) {
    const y = row / Math.max(height - 1, 1);
    for (let column = 0; column < width; column += 1) {
      const x = column / Math.max(width - 1, 1);
      const density = brumaNoiseDensity(sampleBrumaNoiseField(field, x, y), contrast);
      const pixelIndex = (row * width + column) * 4;
      image.data[pixelIndex] = 255;
      image.data[pixelIndex + 1] = 255;
      image.data[pixelIndex + 2] = 255;
      image.data[pixelIndex + 3] = Math.round(density * 255);
    }
  }
  brumaNoiseMaskContext.putImageData(image, 0, 0);
}

function sampleBrumaNoiseField(field, x, y) {
  const horizontal = Math.min(1, Math.max(0, x)) * (brumaNoiseWidth - 1);
  const vertical = Math.min(1, Math.max(0, y)) * (brumaNoiseHeight - 1);
  const left = Math.floor(horizontal);
  const top = Math.floor(vertical);
  const right = Math.min(left + 1, brumaNoiseWidth - 1);
  const bottom = Math.min(top + 1, brumaNoiseHeight - 1);
  const horizontalAmount = horizontal - left;
  const verticalAmount = vertical - top;
  const topNoise = field[top * brumaNoiseWidth + left] * (1 - horizontalAmount)
    + field[top * brumaNoiseWidth + right] * horizontalAmount;
  const bottomNoise = field[bottom * brumaNoiseWidth + left] * (1 - horizontalAmount)
    + field[bottom * brumaNoiseWidth + right] * horizontalAmount;
  return topNoise * (1 - verticalAmount) + bottomNoise * verticalAmount;
}

function sampleBrumaNoise(fields, x, y, depth, contrast) {
  const layerPosition = Math.min(1, Math.max(0, depth)) * (fields.length - 1);
  const lowerLayer = Math.floor(layerPosition);
  const upperLayer = Math.min(lowerLayer + 1, fields.length - 1);
  const depthAmount = layerPosition - lowerLayer;
  const lowerNoise = sampleBrumaNoiseField(fields[lowerLayer], x, y);
  const upperNoise = sampleBrumaNoiseField(fields[upperLayer], x, y);
  const noise = lowerNoise * (1 - depthAmount) + upperNoise * depthAmount;
  return brumaNoiseDensity(noise, contrast);
}

function averagePixelColor(points) {
  return points.reduce((color, pixel) => ({
    red: color.red + pixel.red / points.length,
    green: color.green + pixel.green / points.length,
    blue: color.blue + pixel.blue / points.length,
  }), { red: 0, green: 0, blue: 0 });
}

function drawFigureVolume(view, settings, projector, points, frame, sample) {
  const context = view.volumeContext;
  context.clearRect(0, 0, view.width, view.height);
  if (settings.bruma.alpha <= 0 || points.length === 0) return;

  const surfacePixelSize = Math.max(
    1,
    frame.scale * Math.min(settings.width / sample.width, settings.height / sample.height)
      * projectionShapeScale * 0.8,
  );
  const mappedProjector = frame.map(projector);

  context.save();
  points.forEach((pixel) => {
    const mappedCorners = targetPixelCorners(pixel, settings, sample).map(frame.map);
    const alpha = settings.bruma.alpha * pixel.alpha;
    mappedCorners.forEach((corner, index) => {
      const nextCorner = mappedCorners[(index + 1) % mappedCorners.length];
      const gradient = context.createLinearGradient(
        mappedProjector[0],
        mappedProjector[1],
        (corner[0] + nextCorner[0]) / 2,
        (corner[1] + nextCorner[1]) / 2,
      );
      gradient.addColorStop(0, pixelRgba(pixel, alpha * 0.1));
      gradient.addColorStop(1, pixelRgba(pixel, alpha * 0.7));
      drawTriangle(context, [mappedProjector, corner, nextCorner], gradient);
    });
  });

  context.save();
  context.lineWidth = Math.max(surfacePixelSize * 2, 2);
  points.forEach((pixel) => {
    const mappedTarget = frame.map(targetPoint(pixel, settings));
    context.strokeStyle = pixelRgba(pixel, settings.bruma.alpha * pixel.alpha * 0.35);
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
        settings.bruma.alpha * pixel.alpha * 0.18,
      );
      context.fillRect(slice[0] - size / 2, slice[1] - size / 2, size, size);
    });
  });
  context.restore();

  if (settings.bruma.contrast > 0) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "destination-in";
    context.drawImage(
      brumaNoiseMaskCanvas,
      0,
      0,
      view.volumeCanvas.width,
      view.volumeCanvas.height,
    );
    context.restore();
  }
  view.context.drawImage(view.volumeCanvas, 0, 0, view.width, view.height);
}

function drawIsoFigure(context, frame, settings) {
  if (sourceCanvas.width <= 0 || sourceCanvas.height <= 0) return;

  const targetCorners = settings.corners.map((corner) => (
    scaleSurfacePoint(corner, settings.orientation)
  ));
  const screenTopLeft = frame.map(targetCorners[3]);
  const screenTopRight = frame.map(targetCorners[2]);
  const screenBottomLeft = frame.map(targetCorners[0]);
  const pixelWidth = sourceCanvas.width;
  const pixelHeight = sourceCanvas.height;

  context.save();
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.transform(
    (screenTopRight[0] - screenTopLeft[0]) / pixelWidth,
    (screenTopRight[1] - screenTopLeft[1]) / pixelWidth,
    (screenBottomLeft[0] - screenTopLeft[0]) / pixelHeight,
    (screenBottomLeft[1] - screenTopLeft[1]) / pixelHeight,
    screenTopLeft[0],
    screenTopLeft[1],
  );
  context.drawImage(sourceCanvas, 0, 0);
  context.restore();
}

function drawProjector(context, point) {
  context.fillStyle = "#ff0000";
  context.beginPath();
  context.arc(point[0], point[1], 4, 0, Math.PI * 2);
  context.fill();
}

function drawProjectionGrid(context, frame, settings, width, height) {
  const planeBounds = [[0, 0], [width, 0], [width, height], [0, height]]
    .map(frame.unmap);
  const horizontalValues = planeBounds.map((point) => point[0]);
  const verticalValues = planeBounds.map((point) => (
    settings.orientation === "floor" ? point[1] : point[2]
  ));
  const horizontalStep = settings.width * projectionShapeScale / 6;
  const verticalStep = settings.height * projectionShapeScale / 6;
  const firstHorizontal = Math.floor(Math.min(...horizontalValues) / horizontalStep) - 1;
  const lastHorizontal = Math.ceil(Math.max(...horizontalValues) / horizontalStep) + 1;
  const firstVertical = Math.floor(Math.min(...verticalValues) / verticalStep) - 1;
  const lastVertical = Math.ceil(Math.max(...verticalValues) / verticalStep) + 1;
  context.save();
  for (let index = firstHorizontal; index <= lastHorizontal; index += 1) {
    const horizontal = index * horizontalStep;
    context.strokeStyle = index === 0
      ? "rgba(255, 255, 255, 0.28)"
      : "rgba(255, 255, 255, 0.15)";
    context.lineWidth = index === 0 ? 1 : 0.65;
    const acrossPlane = [
      frame.map(projectionPlanePoint(horizontal, (firstVertical - 1) * verticalStep, settings)),
      frame.map(projectionPlanePoint(horizontal, (lastVertical + 1) * verticalStep, settings)),
    ];
    context.beginPath();
    context.moveTo(acrossPlane[0][0], acrossPlane[0][1]);
    context.lineTo(acrossPlane[1][0], acrossPlane[1][1]);
    context.stroke();
  }

  for (let index = firstVertical; index <= lastVertical; index += 1) {
    const vertical = index * verticalStep;
    context.strokeStyle = index === 0
      ? "rgba(255, 255, 255, 0.28)"
      : "rgba(255, 255, 255, 0.15)";
    context.lineWidth = index === 0 ? 1 : 0.65;
    const alongPlane = [
      frame.map(projectionPlanePoint((firstHorizontal - 1) * horizontalStep, vertical, settings)),
      frame.map(projectionPlanePoint((lastHorizontal + 1) * horizontalStep, vertical, settings)),
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
  context.fillStyle = projectionSurfaceMode === "solid" ? "#101010" : "#000000";
  context.fillRect(0, 0, view.width, view.height);
  const frame = createIsoTransform(view, settings);
  const projector = frame.map(settings.projector);
  if (projectionSurfaceMode === "grid") {
    drawProjectionGrid(context, frame, settings, view.width, view.height);
  }
  drawFigureVolume(view, settings, settings.projector, points, frame, sample);
  drawIsoFigure(context, frame, settings);

  drawProjector(context, projector);
}

function profileProjector(settings) {
  return settings.orientation === "floor"
    ? [0, settings.distance]
    : [0, 0];
}

function createProfileTransform(view, settings) {
  const projector = profileProjector(settings);
  const axisHalfLength = (settings.orientation === "floor" ? settings.width : settings.height)
    * projectionShapeScale / 2;
  const target = settings.orientation === "floor"
    ? [[-axisHalfLength, 0], [axisHalfLength, 0]]
    : [[-settings.distance, -axisHalfLength], [-settings.distance, axisHalfLength]];
  const minX = Math.min(projector[0], ...target.map((point) => point[0]));
  const maxX = Math.max(projector[0], ...target.map((point) => point[0]));
  const minY = Math.min(projector[1], ...target.map((point) => point[1]));
  const maxY = Math.max(projector[1], ...target.map((point) => point[1]));
  const margin = 20;
  const scale = Math.min(
    (view.width - margin * 2) / Math.max(maxX - minX, 0.001),
    (view.height - margin * 2) / Math.max(maxY - minY, 0.001),
  );
  const offsetX = view.width / 2 - (minX + maxX) / 2 * scale;
  const offsetY = view.height / 2 + (minY + maxY) / 2 * scale;

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
      : [-settings.distance, pixel.y * settings.height * projectionShapeScale];
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

function drawProfileVolume(view, transform, settings, projector, points, sample, noiseFields) {
  const context = view.volumeContext;
  context.clearRect(0, 0, view.width, view.height);
  if (!sample || settings.bruma.alpha <= 0 || points.length === 0) return;

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
  const targetStart = settings.orientation === "floor"
    ? [minAxis, 0]
    : [-settings.distance, minAxis];
  const targetEnd = settings.orientation === "floor"
    ? [maxAxis, 0]
    : [-settings.distance, maxAxis];
  const averageColor = averagePixelColor(points);

  const brumaNoiseEnabled = settings.bruma.contrast > 0;
  if (brumaNoiseEnabled) {
    const noiseSegments = 32;
    const noiseDepthSteps = 10;
    const pointAt = (amount, ratio) => {
      const target = [
        targetStart[0] + (targetEnd[0] - targetStart[0]) * ratio,
        targetStart[1] + (targetEnd[1] - targetStart[1]) * ratio,
      ];
      return transform.map([
        projector[0] + (target[0] - projector[0]) * amount,
        projector[1] + (target[1] - projector[1]) * amount,
      ]);
    };
    for (let depthStep = 1; depthStep <= noiseDepthSteps; depthStep += 1) {
      const previousDepth = (depthStep - 1) / noiseDepthSteps;
      const depth = depthStep / noiseDepthSteps;
      for (let segment = 0; segment < noiseSegments; segment += 1) {
        const startRatio = segment / noiseSegments;
        const endRatio = (segment + 1) / noiseSegments;
        const patch = [
          pointAt(previousDepth, startRatio),
          pointAt(depth, startRatio),
          pointAt(depth, endRatio),
          pointAt(previousDepth, endRatio),
        ];
        const noise = sampleBrumaNoise(
          noiseFields,
          (startRatio + endRatio) / 2,
          0.5,
          (previousDepth + depth) / 2,
          settings.bruma.contrast,
        );
        context.beginPath();
        context.moveTo(patch[0][0], patch[0][1]);
        patch.slice(1).forEach((point) => context.lineTo(point[0], point[1]));
        context.closePath();
        context.fillStyle = pixelRgba(averageColor, settings.bruma.alpha * 0.55 * noise);
        context.fill();
      }
    }

    volumeSliceSteps.forEach((amount) => {
      for (let segment = 0; segment < noiseSegments; segment += 1) {
        const startRatio = segment / noiseSegments;
        const endRatio = (segment + 1) / noiseSegments;
        const start = transform.map([
          projector[0] + (targetStart[0] + (targetEnd[0] - targetStart[0]) * startRatio
            - projector[0]) * amount,
          projector[1] + (targetStart[1] + (targetEnd[1] - targetStart[1]) * startRatio
            - projector[1]) * amount,
        ]);
        const end = transform.map([
          projector[0] + (targetStart[0] + (targetEnd[0] - targetStart[0]) * endRatio
            - projector[0]) * amount,
          projector[1] + (targetStart[1] + (targetEnd[1] - targetStart[1]) * endRatio
            - projector[1]) * amount,
        ]);
        const noise = sampleBrumaNoise(
          noiseFields,
          (startRatio + endRatio) / 2,
          0.5,
          amount,
          settings.bruma.contrast,
        );
        context.strokeStyle = pixelRgba(averageColor, settings.bruma.alpha * 0.18 * noise);
        context.lineWidth = 0.75;
        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.stroke();
      }
    });
  } else {
    drawTriangle(
      context,
      [mappedProjector, transform.map(targetStart), transform.map(targetEnd)],
      pixelRgba(averageColor, settings.bruma.alpha * 0.55),
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
      context.strokeStyle = pixelRgba(averageColor, settings.bruma.alpha * 0.18);
      context.lineWidth = 0.75;
      context.beginPath();
      context.moveTo(start[0], start[1]);
      context.lineTo(end[0], end[1]);
      context.stroke();
    });
  }

  context.save();
  context.lineWidth = Math.max(pixelSize * 2, 2);
  points.forEach((pixel) => {
    const coordinate = settings.orientation === "floor"
      ? [pixel.x * settings.width * projectionShapeScale, 0]
      : [-settings.distance, pixel.y * settings.height * projectionShapeScale];
    const mappedTarget = transform.map(coordinate);
    context.strokeStyle = pixelRgba(pixel, settings.bruma.alpha * pixel.alpha * 0.35);
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
        : [-settings.distance, pixel.y * settings.height * projectionShapeScale];
      const point = transform.map(interpolatePoint(
        [projector[0], projector[1], 0],
        [coordinate[0], coordinate[1], 0],
        amount,
      ).slice(0, 2));
      const size = Math.max(1.8, pixelSize * 2.2);
      context.fillStyle = pixelRgba(
        pixel,
        settings.bruma.alpha * pixel.alpha * 0.18,
      );
      context.fillRect(point[0] - size / 2, point[1] - size / 2, size, size);
    });
  });
  if (settings.bruma.contrast > 0) {
    context.save();
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "destination-in";
    context.drawImage(
      brumaNoiseMaskCanvas,
      0,
      0,
      view.volumeCanvas.width,
      view.volumeCanvas.height,
    );
    context.restore();
  }
  view.context.drawImage(view.volumeCanvas, 0, 0, view.width, view.height);
}

function drawProfile(view, settings, sample, points, noiseFields) {
  const context = view.context;
  context.clearRect(0, 0, view.width, view.height);
  context.fillStyle = "#000000";
  context.fillRect(0, 0, view.width, view.height);

  const projector = profileProjector(settings);
  const axisLength = settings.orientation === "floor" ? settings.width : settings.height;
  const axisHalfLength = axisLength * projectionShapeScale / 2;
  const target = settings.orientation === "floor"
    ? [[-axisHalfLength, 0], [axisHalfLength, 0]]
    : [[-settings.distance, -axisHalfLength], [-settings.distance, axisHalfLength]];
  const transform = createProfileTransform(view, settings);
  const screenProjector = transform.map(projector);
  const screenTarget = target.map(transform.map);
  const screenCenter = transform.map([0, 0]);

  drawProfileVolume(view, transform, settings, projector, points, sample, noiseFields);
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
  drawProjector(context, screenProjector);
}

function updateOutputs() {
  brumaOutput.value = `${Number(readBrumaPercent().toFixed(1))}%`;
  brumaOutput.textContent = brumaOutput.value;
  brumaScaleOutput.value = Number(brumaScaleControl.value).toFixed(2);
  brumaScaleOutput.textContent = brumaScaleOutput.value;
  brumaContrastOutput.value = `${Number(brumaContrastControl.value)}%`;
  brumaContrastOutput.textContent = brumaContrastOutput.value;
}

brumaControl.addEventListener("input", updateOutputs);
brumaScaleControl.addEventListener("input", updateOutputs);
brumaContrastControl.addEventListener("input", updateOutputs);
updateOutputs();

function updateProjectionZoom(zoom) {
  projectionZoom = Math.min(6, Math.max(0.5, zoom));
  resizeView(views[0]);
  zoomOutput.value = `${Math.round(projectionZoom * 100)}%`;
  zoomOutput.textContent = zoomOutput.value;
}

zoomInControl.addEventListener("click", () => updateProjectionZoom(projectionZoom * 1.2));
zoomOutControl.addEventListener("click", () => updateProjectionZoom(projectionZoom / 1.2));
zoomResetControl.addEventListener("click", () => {
  projectionPan = { x: 0, y: 0 };
  updateProjectionZoom(1);
});
views[0].canvas.addEventListener("wheel", (event) => {
  event.preventDefault();
  updateProjectionZoom(projectionZoom * Math.exp(-event.deltaY * 0.001));
}, { passive: false });

function setProjectionSurfaceMode(mode) {
  projectionSurfaceMode = mode;
  gridModeControl.setAttribute("aria-pressed", String(mode === "grid"));
  solidModeControl.setAttribute("aria-pressed", String(mode === "solid"));
}

gridModeControl.addEventListener("click", () => setProjectionSurfaceMode("grid"));
solidModeControl.addEventListener("click", () => setProjectionSurfaceMode("solid"));

const isoCanvas = views[0].canvas;
isoCanvas.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  event.preventDefault();
  dragPointerId = event.pointerId;
  lastPointerPosition = [event.clientX, event.clientY];
  isoCanvas.setPointerCapture(event.pointerId);
  isoCanvas.classList.add("is-panning");
});

isoCanvas.addEventListener("pointermove", (event) => {
  if (event.pointerId !== dragPointerId || !lastPointerPosition) return;
  const rect = isoCanvas.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  projectionPan.x += (event.clientX - lastPointerPosition[0]) / rect.width;
  projectionPan.y += (event.clientY - lastPointerPosition[1]) / rect.height;
  lastPointerPosition = [event.clientX, event.clientY];
});

function finishPanning(event) {
  if (event.pointerId !== dragPointerId) return;
  dragPointerId = null;
  lastPointerPosition = null;
  isoCanvas.classList.remove("is-panning");
}

isoCanvas.addEventListener("pointerup", finishPanning);
isoCanvas.addEventListener("pointercancel", finishPanning);
isoCanvas.addEventListener("lostpointercapture", finishPanning);

function renderProjection() {
  const settings = readSettings();
  const sample = captureFigure();
  const points = collectFigurePixels(sample);
  if (views.every((view) => view.width > 0 && view.height > 0)) {
    if (settings.bruma.contrast > 0) {
      const time = performance.now() / 1000;
      if (time - lastBrumaNoiseUpdate >= 1 / 30) {
        cachedBrumaNoiseFields = createBrumaNoiseFields(time, settings.bruma);
        updateBrumaNoiseMask(cachedBrumaNoiseFields, settings.bruma.contrast);
        lastBrumaNoiseUpdate = time;
      }
    }
    drawIso(views[0], settings, sample, points);
    drawProfile(views[1], settings, sample, points, cachedBrumaNoiseFields);
  }
  requestAnimationFrame(renderProjection);
}

views.forEach(resizeView);
requestAnimationFrame(renderProjection);
