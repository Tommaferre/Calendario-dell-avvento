// Genera public/sw.js a partire da scripts/sw-template.js, inserendo il
// base path corretto (per GitHub Pages) e una versione di cache basata
// sull'ora di build, così ogni nuova pubblicazione invalida la cache
// precedente in modo controllato.
//
// Eseguito automaticamente da "npm run build" (vedi script "prebuild"
// in package.json) e disponibile anche come comando a sé: 
//   node scripts/build-sw.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function resolveBasePath() {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  try {
    const appConfig = JSON.parse(readFileSync(path.join(root, "config", "app.json"), "utf-8"));
    const url = new URL(appConfig.publicUrl);
    return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  } catch {
    return "/";
  }
}

const base = resolveBasePath();
const version = new Date().toISOString().replace(/[:.]/g, "-");

const template = readFileSync(path.join(__dirname, "sw-template.js"), "utf-8");
const output = template
  .replaceAll("__BASE_PATH__", base)
  .replaceAll("__CACHE_VERSION__", version);

writeFileSync(path.join(root, "public", "sw.js"), output, "utf-8");
console.log(`public/sw.js generato (base="${base}", cache="advent-cache-${version}").`);
