"use strict";

(function initializeGlobalLabUi() {
  const panel = document.querySelector(".panel");
  const stage = document.querySelector(".stage");
  if (!panel || !stage) return;

  const backdrop = document.createElement("canvas");
  backdrop.className = "global-shader-backdrop";
  backdrop.setAttribute("aria-hidden", "true");
  document.body.prepend(backdrop);
  const backdropContext = backdrop.getContext("2d");
  const previewCanvas = document.querySelector("#preview");
  let previousBackdropDraw = -Infinity;

  function upgradeProjectionSource() {
    const source = window.projectionSourceCanvas;
    if (!(source instanceof HTMLCanvasElement) || !previewCanvas) return;
    const rect = previewCanvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const pixelRatio = window.devicePixelRatio || 1;
    const sourceScale = 2;
    const width = Math.round(rect.width * pixelRatio * sourceScale);
    const height = Math.round(rect.height * pixelRatio * sourceScale);
    if (source.width !== width || source.height !== height) {
      source.width = width;
      source.height = height;
      source.getContext("2d").setTransform(pixelRatio * sourceScale, 0, 0, pixelRatio * sourceScale, 0, 0);
    }
  }

  function drawGlobalBackdrop(now) {
    if (now - previousBackdropDraw < 1000 / 15) return;
    previousBackdropDraw = now;
    const source = window.projectionSourceCanvas;
    if (!(source instanceof HTMLCanvasElement) || source.width <= 0 || source.height <= 0) return;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.round(window.innerWidth * pixelRatio);
    const height = Math.round(window.innerHeight * pixelRatio);
    if (backdrop.width !== width || backdrop.height !== height) {
      backdrop.width = width;
      backdrop.height = height;
      backdropContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }
    backdropContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    backdropContext.imageSmoothingEnabled = true;
    backdropContext.imageSmoothingQuality = "high";
    const pattern = backdropContext.createPattern(source, "repeat");
    if (!pattern) return;
    const tileWidth = Math.max(360, window.innerWidth / 2.6);
    const patternScale = tileWidth / source.width;
    pattern.setTransform(new DOMMatrix().scale(patternScale));
    backdropContext.fillStyle = pattern;
    backdropContext.fillRect(0, 0, window.innerWidth, window.innerHeight);
  }

  if (previewCanvas) new ResizeObserver(upgradeProjectionSource).observe(previewCanvas);
  window.addEventListener("resize", upgradeProjectionSource);

  const currentFile = window.location.pathname.split("/").pop() || "curvas.html";
  const shaderIdentity = {
    "curvas.html": {
      code: "#001",
      name: "CURVATURAS",
      concept: "Nada en la naturaleza avanza en línea recta: el agua rodea la piedra, la rama busca una luz que no conoce y el viento modifica, sin memoria, la forma de las nubes. Curvaturas observa esa gracia involuntaria. Cada trazo parece elegir su destino y, sin embargo, obedece a una ley secreta: la fluidez como una forma de inteligencia del mundo.",
    },
    "gotitas.html": {
      code: "#002",
      name: "CHISPAS",
      concept: "Una chispa dura menos que la certeza de haberla visto. Estas pequeñas estrellas habitan ese intervalo: el instante exacto en que el truco deja de ser mecanismo y se vuelve magia. Aparecen, giran y desaparecen como señales de un alfabeto luminoso cuya lectura ignoramos, pero que reconocemos desde la infancia como la forma visible del asombro.",
    },
    "fibonakis.html": {
      code: "#003",
      name: "FIBONAKIS",
      concept: "Fibonacci imagina un orden que no necesita imponerse: ya estaba en la semilla, en la concha y en la distancia entre las hojas. La espiral no repite un círculo; recuerda cada vuelta y la transforma. Esta animación explora esa aritmética del crecimiento, donde el número se vuelve organismo y el movimiento sugiere que toda forma contiene la memoria de las formas anteriores.",
    },
    "relampago.html": {
      code: "#004",
      name: "RELÁMPAGO",
      concept: "El relámpago escribe en el cielo una figura que sólo existe mientras desaparece. Su recorrido parece azaroso, aunque cada quiebre responde a fuerzas invisibles. Esta pieza nace de esa contradicción: una violencia instantánea que también es dibujo, una luz que divide la noche y nos recuerda que la naturaleza puede revelar, en una fracción de segundo, una arquitectura imposible.",
    },
  }[currentFile] || { code: "#---", name: "SHADER", concept: "Exploración de luz, movimiento y forma." };

  stage.insertAdjacentHTML("afterbegin", `
    <div class="stage-identity" aria-hidden="true">
      <span>${shaderIdentity.code}</span>
      <span>${shaderIdentity.name}</span>
    </div>
  `);
  const projectionGrid = document.querySelector(".projection-grid");
  if (projectionGrid && !document.querySelector(".shader-concept")) {
    projectionGrid.insertAdjacentHTML("afterend", `<p class="shader-concept">${shaderIdentity.concept}</p>`);
  }

  if (!document.querySelector("#projectorOrientation")) {
    panel.insertAdjacentHTML("afterbegin", `
      <details class="control-section global-control">
        <summary>Proyección</summary>
        <label class="field">
          <span>Orientación</span>
          <select id="projectorOrientation">
            <option value="floor">Cenital · suelo</option>
            <option value="wall">Horizontal</option>
          </select>
        </label>
      </details>
      <details class="control-section global-control">
        <summary>Bruma</summary>
        <label class="field"><span>Opacidad <output id="brumaAlphaValue">30%</output></span><input id="brumaAlpha" type="range" min="1" max="30" step="0.1" value="30"></label>
        <label class="field"><span>Escala <output id="brumaScaleValue">1.00</output></span><input id="brumaScale" type="range" min="0.25" max="3" step="0.05" value="1"></label>
        <label class="field"><span>Contraste <output id="brumaContrastValue">100%</output></span><input id="brumaContrast" type="range" min="0" max="200" step="1" value="100"></label>
      </details>
      <div class="global-parameter-divider" role="separator" aria-label="Parámetros específicos del shader"></div>
    `);
  }

  if (!document.querySelector("#exportShader")) {
    panel.insertAdjacentHTML("beforeend", `
      <section class="shader-export" aria-label="Exportar material MadLaser">
        <button id="exportShader" type="button">EXPORTAR MADLASER</button>
        <button id="chooseShaderFolder" class="shader-export-folder" type="button">CARPETA</button>
        <p id="exportStatus" role="status"></p>
      </section>
    `);
  }

  if (!document.querySelector("#globalTelemetry")) {
    stage.insertAdjacentHTML("afterbegin", `
      <aside id="globalTelemetry" class="animation-telemetry" aria-label="Parámetros animados y rendimiento">
        <dl id="globalTelemetryRows"></dl>
      </aside>
    `);
  }

  const globalIds = ["projectorOrientation", "brumaAlpha", "brumaScale", "brumaContrast"];
  const storageKey = "claustro.shaderLab.globalProjection.v1";
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (error) { saved = {}; }
  globalIds.forEach((id) => {
    const control = document.querySelector(`#${id}`);
    if (!control) return;
    if (saved[id] !== undefined) control.value = String(saved[id]);
    const save = () => {
      const values = Object.fromEntries(globalIds.map((globalId) => {
        const globalControl = document.querySelector(`#${globalId}`);
        return [globalId, globalControl?.value];
      }));
      try { localStorage.setItem(storageKey, JSON.stringify(values)); } catch (error) { /* Storage is optional. */ }
    };
    control.addEventListener("input", save);
    control.addEventListener("change", save);
  });

  const rows = document.querySelector("#globalTelemetryRows");
  let previousFrame = performance.now();
  let previewFps = 60;
  let previousUiUpdate = -Infinity;

  function numericValue(id, fallback = 0) {
    const control = document.querySelector(`#${id}`);
    return control ? Number(control.value) : fallback;
  }

  function selectedLabel(id) {
    return document.querySelector(`#${id}`)?.selectedOptions?.[0]?.textContent || "";
  }

  function currentStats(now) {
    const speed = numericValue("speed", 1);
    const duration = Math.max(numericValue("duration", 1), 0.001);
    const phase = ((now / 1000 * speed / duration) % 1 + 1) % 1;
    const stats = [];
    if (document.querySelector("#motionPreset")) stats.push(["Preset", selectedLabel("motionPreset")]);
    if (document.querySelector("#duration")) stats.push(["Fase", phase.toFixed(3)]);
    const trimStart = document.querySelector("#trimStart") ? numericValue("trimStart") : numericValue("start", NaN);
    const trimEnd = document.querySelector("#trimEnd") ? numericValue("trimEnd") : numericValue("end", NaN);
    if (Number.isFinite(trimStart) && Number.isFinite(trimEnd)) stats.push(["Trim", `${trimStart.toFixed(3)}–${trimEnd.toFixed(3)}`]);
    if (document.querySelector("#offset")) {
      const travel = document.querySelector("#travel") ? numericValue("travel") : numericValue("autoTravelLoops", 0);
      stats.push(["Recorrido", (numericValue("offset") + phase * travel).toFixed(3)]);
    }
    if (document.querySelector("#speed")) stats.push(["Velocidad", `${speed.toFixed(2)}×`]);
    if (document.querySelector("#mirrorCount")) stats.push(["Mirrors", String(numericValue("mirrorCount", 1))]);
    if (document.querySelector("#figureCount")) stats.push(["Figuras", String(numericValue("figureCount", 1))]);
    if (document.querySelector("#count")) stats.push(["Figuras", String(numericValue("count", 1))]);
    stats.push(["FPS", `${Math.round(previewFps)}`]);
    const volumeFps = Number(window.projectionCurrentFps) || 0;
    stats.push(["FPS volumen", volumeFps > 0 ? `${Math.round(volumeFps)}` : "—"]);
    return stats;
  }

  function updateStats(now) {
    if (now - previousUiUpdate < 100) return;
    previousUiUpdate = now;
    rows.replaceChildren(...currentStats(now).flatMap(([name, value]) => {
      const term = document.createElement("dt");
      term.textContent = name;
      const description = document.createElement("dd");
      description.textContent = value;
      return [term, description];
    }));
  }

  function measure(now) {
    const delta = Math.min((now - previousFrame) / 1000, 0.1);
    previousFrame = now;
    if (delta > 0) {
      const instantaneous = Math.min(120, 1 / delta);
      previewFps += (instantaneous - previewFps) * 0.12;
    }
    upgradeProjectionSource();
    drawGlobalBackdrop(now);
    updateStats(now);
    requestAnimationFrame(measure);
  }
  requestAnimationFrame(measure);
}());
