#!/usr/bin/env node
// Invia (o simula l'invio di) il reminder Telegram giornaliero per il
// calendario dell'avvento.
//
// USO:
//   node scripts/send-advent-reminder.mjs                → modalità automatica:
//       calcola il giorno da inviare in base alla data odierna a Roma,
//       invia solo se oggi è tra 1 e 25 dicembre dell'anno configurato.
//
//   node scripts/send-advent-reminder.mjs --day=7 --dry-run   → test del
//       giorno 7 senza inviare nulla (DEFAULT quando si usa --day).
//
//   node scripts/send-advent-reminder.mjs --day=7 --send       → invio
//       REALE del messaggio per il giorno 7 (richiede le secret).
//
// Variabili d'ambiente richieste per un invio reale:
//   TELEGRAM_BOT_TOKEN
//   TELEGRAM_CHAT_ID
//
// Il destinatario deve aver avviato una conversazione con il bot almeno
// una volta (comando /start), altrimenti Telegram non permette l'invio
// di messaggi privati.
//
// Questo script non invia mai messaggi reali se eseguito dai test
// automatici: i test automatici chiamano solo le funzioni pure
// (buildReminderMessage, buildDayUrl, ecc.) senza mai invocare
// sendTelegramMessage.

import { loadConfig, loadContent, getDay, buildDayUrl, buildReminderMessage, todayInRome, validateContent } from "./lib/content.mjs";

function parseArgs(argv) {
  const args = { dryRun: false, send: false, day: null };
  for (const raw of argv.slice(2)) {
    if (raw === "--dry-run") args.dryRun = true;
    else if (raw === "--send") args.send = true;
    else if (raw.startsWith("--day=")) args.day = Number(raw.split("=")[1]);
  }
  // Se è stato specificato un giorno manuale, il default è dry-run,
  // a meno che non venga passato esplicitamente --send.
  if (args.day !== null && !args.send) args.dryRun = true;
  return args;
}

function maskSecretsInLogs(text) {
  // Non dovremmo mai loggare i segreti, ma per sicurezza offriamo
  // comunque una funzione di mascheramento da usare su qualsiasi
  // stringa che potrebbe (per errore) contenerli.
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  let out = text;
  if (token) out = out.split(token).join("[TOKEN NASCOSTO]");
  if (chatId) out = out.split(chatId).join("[CHAT ID NASCOSTO]");
  return out;
}

async function sendTelegramMessage({ token, chatId, text, url, dayNumber }) {
  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  const body = {
    chat_id: chatId,
    text,
    reply_markup: {
      inline_keyboard: [[{ text: `Apri la sorpresa del giorno ${dayNumber}`, url }]],
    },
  };

  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkError) {
    throw new Error(`Errore di rete verso l'API Telegram: ${maskSecretsInLogs(String(networkError))}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`Risposta non valida da Telegram (status HTTP ${response.status}).`);
  }

  if (!response.ok || payload.ok === false) {
    const description = payload?.description ?? "errore sconosciuto";
    throw new Error(`Telegram ha rifiutato il messaggio (status ${response.status}): ${description}`);
  }

  return payload;
}

async function main() {
  const args = parseArgs(process.argv);
  const config = loadConfig();
  const content = loadContent();

  const issues = validateContent(content);
  if (issues.length > 0) {
    console.error("Validazione dei contenuti fallita, invio annullato:");
    for (const issue of issues) console.error(` - ${issue}`);
    process.exitCode = 1;
    return;
  }

  // Determina quale giorno inviare.
  let dayNumber = args.day;
  if (dayNumber === null) {
    const today = todayInRome();
    const [yearStr, monthStr, dayStr] = today.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (year !== config.year || month !== 12 || day < 1 || day > 25) {
      console.log(
        `Oggi (${today}, fuso ${config.timezone}) è fuori dal periodo del calendario (1–25 dicembre ${config.year}). Nessun invio.`
      );
      return;
    }
    dayNumber = day;
  }

  if (!Number.isInteger(dayNumber) || dayNumber < 1 || dayNumber > 25) {
    console.error(`Giorno non valido: ${dayNumber}. Deve essere un intero tra 1 e 25.`);
    process.exitCode = 1;
    return;
  }

  const dayContent = getDay(content, dayNumber);
  if (!dayContent) {
    console.error(`Nessun contenuto trovato per il giorno ${dayNumber}.`);
    process.exitCode = 1;
    return;
  }

  const url = buildDayUrl(config.publicUrl, dayNumber);
  const message = buildReminderMessage(dayNumber, dayContent);

  console.log(`--- Reminder per il giorno ${dayNumber} (${dayContent.date}) ---`);
  console.log(message);
  console.log(`Link: ${url}`);
  console.log("----------------------------------------------");

  // Regola di sicurezza: un giorno scelto manualmente (--day=N) resta in
  // dry-run finché non si aggiunge esplicitamente --send. La modalità
  // automatica (nessun --day, usata dal workflow schedulato) invece
  // invia sempre davvero, perché è esattamente il suo scopo.
  const isManualTest = args.day !== null;
  const shouldActuallySend = args.send && !args.dryRun;

  if (isManualTest && !shouldActuallySend) {
    console.log("Modalità DRY-RUN: nessun messaggio è stato realmente inviato.");
    console.log("Per inviare davvero questo messaggio di prova, esegui di nuovo con --send.");
    return;
  }

  if (!isManualTest && args.dryRun) {
    console.log("Modalità DRY-RUN esplicita: nessun messaggio è stato realmente inviato.");
    return;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "Mancano le variabili d'ambiente TELEGRAM_BOT_TOKEN e/o TELEGRAM_CHAT_ID: impossibile inviare. " +
        "Configura i GitHub Actions Secrets, oppure esportale localmente solo per un test manuale."
    );
    process.exitCode = 1;
    return;
  }

  try {
    await sendTelegramMessage({ token, chatId, text: message, url, dayNumber });
    console.log(`Messaggio per il giorno ${dayNumber} inviato con successo.`);
  } catch (error) {
    console.error(`Invio fallito: ${maskSecretsInLogs(error.message)}`);
    process.exitCode = 1;
  }
}

main();
