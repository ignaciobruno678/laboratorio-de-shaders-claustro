"use strict";

(function initializeMadLaserExport() {
  const exportButton = document.querySelector("#exportShader");
  const folderButton = document.querySelector("#chooseShaderFolder");
  const status = document.querySelector("#exportStatus");
  if (!exportButton || !folderButton || !status) return;

  const shaderByPage = {
    "curvas.html": "curvas",
    "gotitas.html": "gotitas",
    "fibonakis.html": "fibonakis",
    "relampago.html": "relampago",
  };
  const shader = shaderByPage[window.location.pathname.split("/").pop() || "curvas.html"];
  const source = window.shaderSources?.[shader];
  const fileName = `${shader}-configurada.fs`;
  const controlOverrides = {
    gotitas: {
      mat_starCount: "count",
      mat_sizeRandomness: "randomness",
      mat_positionJitter: "jitter",
      mat_duration: "duration",
      mat_trail: "trail",
      mat_stagger: "stagger",
      mat_rotationDegrees: "rotation",
      mat_circleFormation: "formation",
      mat_circleRadius: "radius",
      mat_circleRotation: "circleRotation",
      mat_verticalSweep: "sweep",
      mat_sweepSoftness: "sweepSoftness",
      mat_driftAmount: "drift",
    },
  };
  let selectedDirectory = null;

  function openHandleDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("claustro-shader-lab", 1);
      request.onupgradeneeded = () => request.result.createObjectStore("handles");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function storedDirectory() {
    try {
      const database = await openHandleDatabase();
      return await new Promise((resolve, reject) => {
        const request = database.transaction("handles").objectStore("handles").get("madmapper-shaders");
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      return null;
    }
  }

  async function storeDirectory(handle) {
    try {
      const database = await openHandleDatabase();
      await new Promise((resolve, reject) => {
        const request = database.transaction("handles", "readwrite").objectStore("handles").put(handle, "madmapper-shaders");
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });
    } catch (error) { /* The picker still works without persistence. */ }
  }

  async function chooseDirectory() {
    if (!("showDirectoryPicker" in window)) return null;
    const handle = await window.showDirectoryPicker({
      id: "madmapper-shaders",
      mode: "readwrite",
      startIn: "documents",
    });
    selectedDirectory = handle;
    await storeDirectory(handle);
    status.textContent = `Carpeta activa: ${handle.name}`;
    return handle;
  }

  async function writableDirectory() {
    let handle = selectedDirectory;
    if (handle) {
      const permission = await handle.queryPermission({ mode: "readwrite" });
      if (permission !== "granted") {
        const requested = await handle.requestPermission({ mode: "readwrite" });
        if (requested !== "granted") handle = null;
      }
    }
    return handle || chooseDirectory();
  }

  function readControl(control) {
    if (control.type !== "color") return Number(control.value);
    const hex = control.value.slice(1);
    const channels = [0, 2, 4].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255);
    return [...channels.map((channel) => Number(channel.toFixed(6))), 1];
  }

  function configuredSource() {
    if (!source) throw new Error("No se encontró la fuente nativa del shader.");
    const header = source.match(/^\/\*([\s\S]*?)\*\//);
    if (!header) throw new Error("El shader no contiene metadata INPUTS válida.");
    const metadata = JSON.parse(header[1]);
    metadata.INPUTS.forEach((input) => {
      const directId = input.NAME.replace(/^mat_/, "");
      const controlId = controlOverrides[shader]?.[input.NAME] || directId;
      const control = document.querySelector(`#${controlId}`);
      if (control) input.DEFAULT = readControl(control);
    });
    return `/*${JSON.stringify(metadata, null, 4)}*/${source.slice(header[0].length)}`;
  }

  function downloadFallback(contents) {
    const blob = new Blob([contents], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  folderButton.addEventListener("click", async () => {
    try {
      if (!("showDirectoryPicker" in window)) throw new Error("Este navegador no permite elegir carpetas. Usá Edge o Chrome.");
      await chooseDirectory();
    } catch (error) {
      if (error.name !== "AbortError") status.textContent = error.message;
    }
  });

  exportButton.addEventListener("click", async () => {
    exportButton.disabled = true;
    status.textContent = "Preparando material MadLaser…";
    try {
      const contents = configuredSource();
      if (!("showDirectoryPicker" in window)) {
        downloadFallback(contents);
        status.textContent = "Shader descargado. Movelo a la carpeta de materiales de MadMapper.";
        return;
      }
      const directory = await writableDirectory();
      if (!directory) return;
      const file = await directory.getFileHandle(fileName, { create: true });
      const writable = await file.createWritable();
      await writable.write(contents);
      await writable.close();
      selectedDirectory = directory;
      status.textContent = `${fileName} guardado en ${directory.name}.`;
    } catch (error) {
      if (error.name !== "AbortError") status.textContent = `No se pudo exportar: ${error.message}`;
    } finally {
      exportButton.disabled = false;
    }
  });

  storedDirectory().then((handle) => {
    if (handle) {
      selectedDirectory = handle;
      status.textContent = `Carpeta recordada: ${handle.name}`;
    }
  });
}());
