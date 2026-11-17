import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const shaders = ["curvas", "gotitas", "fibonakis", "relampago"];
const sources = {};

for (const shader of shaders) {
  const fileName = `${shader}-configurada.fs`;
  const sourcePath = path.join(root, "shaders", fileName);
  sources[shader] = await readFile(sourcePath, "utf8");
}

const bundle = `"use strict";\nwindow.shaderSources = ${JSON.stringify(sources)};\n`;
const previewBundle = path.join(root, "preview", "shader-sources.js");
const deployDirectory = path.join(root, "site-deploy", "dist");
const deployShaders = path.join(deployDirectory, "shaders");
await mkdir(deployShaders, { recursive: true });
await writeFile(previewBundle, bundle, "utf8");
await writeFile(path.join(deployDirectory, "shader-sources.js"), bundle, "utf8");

for (const shader of shaders) {
  const fileName = `${shader}-configurada.fs`;
  await copyFile(path.join(root, "shaders", fileName), path.join(deployShaders, fileName));
}

console.log(`Bundled ${shaders.length} shader sources.`);
