import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Deriva automaticamente il "base path" di Vite dall'URL pubblico
// configurato in config/app.json, così da gestire correttamente il caso
// https://utente.github.io/nome-repository/ senza doverlo impostare in
// due posti diversi. Può essere sovrascritto con la variabile
// d'ambiente VITE_BASE_PATH, utile per test locali o se l'URL finale
// non è ancora stato deciso.
function resolveBasePath(): string {
  if (process.env.VITE_BASE_PATH) return process.env.VITE_BASE_PATH;
  try {
    const appConfig = JSON.parse(
      readFileSync(path.join(__dirname, "config", "app.json"), "utf-8")
    );
    const url = new URL(appConfig.publicUrl);
    return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  } catch {
    return "/";
  }
}

export default defineConfig({
  base: resolveBasePath(),
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
