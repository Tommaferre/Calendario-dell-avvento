// Helper condiviso per leggere la stessa fonte di verità dei contenuti
// (src/content/advent-content.json) e della configurazione
// (config/app.json) usata dal frontend React. In questo modo testi e
// date non sono mai duplicati tra l'app e lo script del reminder.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "..");

export function loadConfig() {
  const raw = readFileSync(path.join(root, "config", "app.json"), "utf-8");
  return JSON.parse(raw);
}

export function loadContent() {
  const raw = readFileSync(path.join(root, "src", "content", "advent-content.json"), "utf-8");
  return JSON.parse(raw);
}

export function getDay(content, dayNumber) {
  return content.days.find((entry) => entry.day === dayNumber) ?? null;
}

/** Validazione leggera, equivalente a quella TypeScript lato frontend. */
export function validateContent(content) {
  const issues = [];
  const seen = new Set();
  for (const entry of content.days ?? []) {
    if (typeof entry.day !== "number" || entry.day < 1 || entry.day > 25) {
      issues.push(`Giorno non valido: ${JSON.stringify(entry.day)}`);
      continue;
    }
    if (seen.has(entry.day)) issues.push(`Giorno duplicato: ${entry.day}`);
    seen.add(entry.day);
    if (!entry.title) issues.push(`Giorno ${entry.day}: manca il titolo`);
    if (!entry.date) issues.push(`Giorno ${entry.day}: manca la data`);
  }
  for (let d = 1; d <= 25; d++) {
    if (!seen.has(d)) issues.push(`Manca il contenuto per il giorno ${d}`);
  }
  return issues;
}

/** Costruisce l'URL pubblico di una casella, gestendo correttamente lo slash finale. */
export function buildDayUrl(publicUrl, dayNumber) {
  const base = publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`;
  return `${base}?day=${dayNumber}`;
}

/**
 * Costruisce il testo del messaggio Telegram per un dato giorno,
 * usando lo stesso titolo/anteprima mostrati nell'app.
 */
export function buildReminderMessage(day, dayContent) {
  const preview = dayContent.preview ?? "";
  return [
    `🎄 Giorno ${day} del nostro calendario dell'avvento!`,
    "",
    `${dayContent.title}`,
    preview,
    "",
    "Tocca il pulsante qui sotto per aprire la sorpresa di oggi.",
  ].join("\n");
}

/** Ritorna la data odierna a Roma come stringa YYYY-MM-DD (equivalente a src/utils/dates.ts). */
export function todayInRome(referenceDate = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(referenceDate);
}
