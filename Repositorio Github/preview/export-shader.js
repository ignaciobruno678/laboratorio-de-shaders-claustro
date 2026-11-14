"use strict";

const shaderParameterNames = {
  gotitas: {
    count: "mat_starCount",
    size: "mat_size",
    randomness: "mat_sizeRandomness",
    spreadX: "mat_spreadX",
    spreadY: "mat_spreadY",
    jitter: "mat_positionJitter",
    seed: "mat_seed",
    duration: "mat_duration",
    trail: "mat_trail",
    stagger: "mat_stagger",
    speed: "mat_speed",
    rotation: "mat_rotationDegrees",
    rotationSpeed: "mat_rotationSpeed",
    smoothness: "mat_smoothness",
    formation: "mat_circleFormation",
    radius: "mat_circleRadius",
    circleRotation: "mat_circleRotation",
    sweep: "mat_verticalSweep",
    sweepSoftness: "mat_sweepSoftness",
    drift: "mat_driftAmount",
    driftSpeed: "mat_driftSpeed",
    color: "mat_color",
    brightness: "mat_brightness",
  },
  curvas: {
    figureCount: "mat_figureCount",
    size: "mat_size",
    scaleX: "mat_scaleX",
    scaleY: "mat_scaleY",
    rotation: "mat_rotation",
    layerRotation: "mat_layerRotation",
    layerScaleStep: "mat_layerScaleStep",
    layerTrimPhase: "mat_layerTrimPhase",
    start: "mat_start",
    end: "mat_end",
    offset: "mat_offset",
    autoTravelLoops: "mat_autoTravelLoops",
    trimSoftness: "mat_trimSoftness",
    duration: "mat_duration",
    speed: "mat_speed",
    easeStrength: "mat_easeStrength",
    elasticAmount: "mat_elasticAmount",
    elasticFrequency: "mat_elasticFrequency",
    elasticDamping: "mat_elasticDamping",
    orgFreq1: "mat_orgFreq1",
    orgFreq2: "mat_orgFreq2",
    orgAmp1: "mat_orgAmp1",
    orgAmp2: "mat_orgAmp2",
    orgSkewX: "mat_orgSkewX",
    orgSkewY: "mat_orgSkewY",
    orgTwist: "mat_orgTwist",
    colorMode: "mat_colorMode",
    color: "mat_color",
    color2: "mat_color2",
    brightness: "mat_brightness",
  },
};

const exportButton = document.querySelector("#exportShader");
const exportStatus = document.querySelector("#exportStatus");
const shader = window.location.pathname.endsWith("/curvas.html") ? "curvas" : "gotitas";
const fixedShaderParameters = {
  curvas: { mat_family: 0 },
};

function readControlValue(id) {
  const control = document.getElementById(id);
  if (!control) {
    throw new Error(`No se encontró el control "${id}".`);
  }

  if (control.type !== "color") {
    return Number(control.value);
  }

  const hex = control.value.slice(1);
  const channels = [0, 2, 4].map((index) => (
    Number.parseInt(hex.slice(index, index + 2), 16) / 255
  ));
  return [...channels.map((channel) => Number(channel.toFixed(6))), 1];
}

function applyDefaults(source, values) {
  const headerMatch = source.match(/^\/\*([\s\S]*?)\*\//);
  if (!headerMatch) {
    throw new Error("El shader no tiene un encabezado de parámetros válido.");
  }

  const metadata = JSON.parse(headerMatch[1]);
  if (!Array.isArray(metadata.INPUTS)) {
    throw new Error("El encabezado del shader no contiene parámetros INPUTS.");
  }

  Object.entries(values).forEach(([name, value]) => {
    const input = metadata.INPUTS.find((item) => item.NAME === name);
    if (!input) {
      throw new Error(`El shader no declara el parámetro "${name}".`);
    }
    input.DEFAULT = value;
  });

  return `/*${JSON.stringify(metadata, null, 4)}*/${source.slice(headerMatch[0].length)}`;
}

async function exportConfiguredShader() {
  if (window.location.protocol === "file:") {
    throw new Error("Abre el preview online para exportar el archivo .fs.");
  }

  const values = Object.fromEntries(
    Object.entries(shaderParameterNames[shader]).map(([controlId, parameterName]) => [
      parameterName,
      readControlValue(controlId),
    ]),
  );
  Object.assign(values, fixedShaderParameters[shader]);
  const response = await fetch(`../shaders/${shader}.fs`);
  if (!response.ok) {
    throw new Error(`No se pudo cargar el shader base (HTTP ${response.status}).`);
  }

  const source = await response.text();
  const configuredSource = applyDefaults(source, values);
  const file = new Blob([configuredSource], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${shader}-configurada.fs`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

exportButton.addEventListener("click", async () => {
  exportButton.disabled = true;
  exportStatus.textContent = "Preparando archivo .fs...";

  try {
    await exportConfiguredShader();
    exportStatus.textContent = "Descarga lista. Cárgala en MadMapper como Laser Material.";
  } catch (error) {
    console.error("No se pudo exportar la configuración para MadMapper.", error);
    exportStatus.textContent = `No se pudo exportar: ${error.message}`;
  } finally {
    exportButton.disabled = false;
  }
});
