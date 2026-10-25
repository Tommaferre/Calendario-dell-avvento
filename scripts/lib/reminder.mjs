// Logica pura dei reminder Telegram (testabile senza rete). Legge la stessa configurazione dell'app.
import { getZonedDateParts, dateKey } from '../../src/lib/dates.ts';
import { buildDayLink, isPlaceholderUrl } from '../../src/lib/links.ts';
import { validateContent, REMINDER_MAX_LENGTH } from '../../src/content/types.ts';

export const TELEGRAM_API = 'https://api.telegram.org';

/**
 * Decide quale giorno inviare.
 * - mode "schedule": usa SOLO la data odierna a Roma; fuori dal 1–25 dicembre dell'anno configurato non invia nulla.
 * - mode "manual": usa il giorno richiesto (1–25), indipendentemente dalla data.
 * @returns {{ok:true, day:number}|{ok:false, reason:string}}
 */
export function resolveDay({ now, config, mode, requestedDay }) {
  if (mode === 'manual') {
    const n = Number(requestedDay);
    if (!Number.isInteger(n) || n < config.firstDay || n > config.lastDay)
      return { ok: false, reason: `Giorno non valido: "${requestedDay}" (ammessi ${config.firstDay}–${config.lastDay}).` };
    return { ok: true, day: n };
  }
  const today = getZonedDateParts(now, config.timezone);
  if (today.year !== config.year || today.month !== 12 || today.day < config.firstDay || today.day > config.lastDay) {
    const k = dateKey(today);
    return { ok: false, reason: `Oggi (${today.year}-${String(today.month).padStart(2, '0')}-${String(today.day).padStart(2, '0')}, ${config.timezone}) è fuori dal periodo ${config.year}-12-${String(config.firstDay).padStart(2, '0')} / ${config.year}-12-${config.lastDay}. Nessun invio. [${k}]` };
  }
  return { ok: true, day: today.day };
}

/** Costruisce il testo e il pulsante inline per un giorno. Lancia errore se i contenuti sono incoerenti. */
export function buildReminder({ content, config, day, isTest = false }) {
  const entry = content.days.find((d) => d.day === day);
  if (!entry) throw new Error(`Giorno ${day} non presente nei contenuti.`);
  if (!entry.reminder || entry.reminder.length > REMINDER_MAX_LENGTH)
    throw new Error(`Reminder del giorno ${day} mancante o più lungo di ${REMINDER_MAX_LENGTH} caratteri.`);
  const url = buildDayLink(config.publicUrl, day);
  const prefix = isTest ? '🧪 [PROVA] ' : '';
  return {
    url,
    text: `${prefix}${entry.reminder}`,
    payloadExtras: {
      reply_markup: { inline_keyboard: [[{ text: '🎁 Apri la sorpresa', url }]] },
      disable_web_page_preview: true,
    },
  };
}

/** Controlla la configurazione necessaria per un invio reale. Restituisce l'elenco dei problemi. */
export function checkSendConfig({ env, config }) {
  const problems = [];
  if (!env.TELEGRAM_BOT_TOKEN) problems.push('Secret TELEGRAM_BOT_TOKEN mancante.');
  if (!env.TELEGRAM_CHAT_ID) problems.push('Secret TELEGRAM_CHAT_ID mancante.');
  if (isPlaceholderUrl(config.publicUrl)) problems.push(`publicUrl in config/app.json è ancora quello di esempio (${config.publicUrl}).`);
  return problems;
}

/** Rimuove token e chat id da qualsiasi stringa prima di stamparla. */
export function redact(text, env) {
  let out = String(text);
  for (const v of [env.TELEGRAM_BOT_TOKEN, env.TELEGRAM_CHAT_ID]) if (v) out = out.split(v).join('***');
  return out.replace(/bot\d+:[A-Za-z0-9_-]+/g, 'bot***');
}

/** Invio con l'API ufficiale (sendMessage). `fetchImpl` è iniettabile per i test. */
export async function sendTelegramMessage({ token, chatId, text, extras, fetchImpl = fetch }) {
  let res;
  try {
    res = await fetchImpl(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, ...extras }),
    });
  } catch (e) {
    throw new Error(`Errore di rete verso Telegram: ${e?.message ?? e}`);
  }
  let body = null;
  try { body = await res.json(); } catch { /* risposta non JSON */ }
  if (!res.ok || !body?.ok) {
    const code = body?.error_code ?? res.status;
    const desc = body?.description ?? res.statusText ?? 'errore sconosciuto';
    let hint = '';
    if (code === 401) hint = ' (token non valido)';
    else if (code === 400 && /chat not found/i.test(desc)) hint = ' (chat id errato oppure il destinatario non ha ancora avviato il bot con /start)';
    else if (code === 403) hint = ' (il destinatario ha bloccato il bot o non lo ha avviato)';
    else if (code === 429) hint = ' (troppe richieste: riprova più tardi)';
    throw new Error(`Telegram ha risposto con errore ${code}: ${desc}${hint}`);
  }
  return body;
}

/** Orchestrazione completa, usata dallo script e dai test. Restituisce {exitCode, logs}. */
export async function run({ env, now = new Date(), config, content, fetchImpl, log = () => {} }) {
  const mode = env.EVENT_NAME === 'workflow_dispatch' || env.REMINDER_MODE === 'manual' ? 'manual' : 'schedule';
  const dryRun = mode === 'schedule' ? false : String(env.DRY_RUN ?? 'true').toLowerCase() !== 'false';
  const contentErrors = validateContent(content, config);
  if (contentErrors.length) {
    contentErrors.forEach((e) => log(`✖ ${e}`));
    return { exitCode: 1 };
  }
  const resolved = resolveDay({ now, config, mode, requestedDay: env.REMINDER_DAY });
  if (!resolved.ok) {
    log(resolved.reason);
    return { exitCode: mode === 'manual' ? 1 : 0, skipped: true };
  }
  const reminder = buildReminder({ content, config, day: resolved.day, isTest: mode === 'manual' });
  log(`Modalità: ${mode}${dryRun ? ' (dry-run)' : ''} — giorno ${resolved.day}`);
  log(`Link: ${reminder.url}`);
  log(`Testo: ${reminder.text}`);

  if (dryRun) {
    const problems = checkSendConfig({ env, config });
    problems.forEach((p) => log(`⚠ Per un invio reale servirebbe: ${p}`));
    log('Dry-run: nessun messaggio inviato.');
    return { exitCode: 0, dryRun: true, reminder };
  }
  const problems = checkSendConfig({ env, config });
  if (problems.length) {
    problems.forEach((p) => log(`✖ ${p}`));
    return { exitCode: 1 };
  }
  try {
    await sendTelegramMessage({ token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID, text: reminder.text, extras: reminder.payloadExtras, fetchImpl });
    log('✔ Messaggio accettato da Telegram.');
    return { exitCode: 0, sent: true, reminder };
  } catch (e) {
    log(`✖ ${redact(e.message, env)}`);
    return { exitCode: 1 };
  }
}
