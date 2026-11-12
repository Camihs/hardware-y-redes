import fs from "node:fs";
import vm from "node:vm";

const required = [
  "index.html",
  "manifest.webmanifest",
  "sw.js",
  "computadoraa.glb",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "assets/site-refinement.css",
  "assets/site-interactions.js",
  "assets/hardware-models.js"
];

const fail = (message) => {
  console.error("✖ " + message);
  process.exitCode = 1;
};

for (const file of required) {
  if (!fs.existsSync(file)) fail("Falta el archivo requerido: " + file);
}

if (process.exitCode) process.exit();

const html = fs.readFileSync("index.html", "utf8");
const manifest = JSON.parse(fs.readFileSync("manifest.webmanifest", "utf8"));
if (!manifest.name || !manifest.start_url || !Array.isArray(manifest.icons)) {
  fail("El manifiesto PWA no contiene los campos esenciales.");
}

const ids = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
if (duplicates.length) fail("Hay IDs HTML duplicados: " + [...new Set(duplicates)].join(", "));

const inlineScripts = [...html.matchAll(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)];
for (const [index, match] of inlineScripts.entries()) {
  try {
    new vm.Script(match[1], { filename: `index.html:inline-script-${index + 1}` });
  } catch (error) {
    fail(`Error de sintaxis en el script ${index + 1}: ${error.message}`);
  }
}

const referencedIds = new Set(ids);
for (const [attribute, pattern] of [
  ["enlaces internos", /\bhref=["']#([^"']+)["']/g],
  ["controles accesibles", /\baria-controls=["']([^"']+)["']/g]
]) {
  const missing = [...html.matchAll(pattern)].map((match) => match[1]).filter((id) => !referencedIds.has(id));
  if (missing.length) fail(`Hay ${attribute} sin destino: ${[...new Set(missing)].join(", ")}`);
}

for (const file of ["assets/site-interactions.js", "assets/hardware-models.js"]) {
  try {
    new vm.Script(fs.readFileSync(file, "utf8"), { filename: file });
  } catch (error) {
    fail("Error de sintaxis en " + file + ": " + error.message);
  }
}
const modelLibrary = fs.readFileSync("assets/hardware-models.js", "utf8");
const modelCount = (modelLibrary.match(/\{id:"hw-/g) || []).length;
if (modelCount < 10) fail("La biblioteca 3D debe incluir al menos 10 modelos educativos.");
if (!html.includes("__hyrRegisterHardwareModel") || !html.includes("__hyrSelectHardwareModel")) {
  fail("El visor 3D no tiene conectada la biblioteca de modelos.");
}

try {
  new vm.Script(fs.readFileSync("sw.js", "utf8"), { filename: "sw.js" });
} catch (error) {
  fail("Error de sintaxis en sw.js: " + error.message);
}

const glb = fs.readFileSync("computadoraa.glb");
if (glb.length < 12 || glb.toString("ascii", 0, 4) !== "glTF") {
  fail("computadoraa.glb no parece ser un archivo GLB válido.");
}

if (process.exitCode) process.exit();
console.log(`✓ Revisión correcta: ${required.length} archivos esenciales, manifiesto, ${ids.length} IDs, destinos internos y ${inlineScripts.length + 3} scripts; ${modelCount} modelos 3D.`);
console.log("ℹ El visor model-viewer tiene una ruta local opcional y un respaldo CDN; el video LSC es un recurso opcional pendiente de incorporar.");
