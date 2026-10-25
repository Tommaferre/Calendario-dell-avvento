#!/usr/bin/env node
/**
 * Invia il reminder Telegram del giorno.
 * Variabili d'ambiente:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID  (solo per l'invio reale; da GitHub Secrets)
 *   EVENT_NAME      "schedule" | "workflow_dispatch" (se assente: schedule)
 *   REMINDER_DAY    giorno 1–25 (solo manuale)
 *   DRY_RUN         "true" (default, manuale) | "false"
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { run, redact } from './lib/reminder.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(path.join(root, 'config/app.json'), 'utf8'));
const content = JSON.parse(readFileSync(path.join(root, 'src/content/advent-content.json'), 'utf8'));
// Un URL pubblico può essere sovrascritto da una variabile (non segreta) del workflow.
if (process.env.PUBLIC_URL) config.publicUrl = process.env.PUBLIC_URL;

try {
  const { exitCode } = await run({ env: process.env, config, content, log: (m) => console.log(redact(m, process.env)) });
  process.exit(exitCode);
} catch (e) {
  console.error(redact(`✖ Errore imprevisto: ${e?.message ?? e}`, process.env));
  process.exit(1);
}
