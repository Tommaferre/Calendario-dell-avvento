import { describe, it, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { buildReminder, checkSendConfig, redact, resolveDay, run, sendTelegramMessage } from '../scripts/lib/reminder.mjs';
import app from '../config/app.json';
import content from '../src/content/advent-content.json';

const config = { ...app, publicUrl: 'https://utente.github.io/nome-repo/' };
const at = (iso: string) => new Date(iso);

describe('resolveDay', () => {
  it('schedule: usa la data di Roma e solo dentro il periodo', () => {
    expect(resolveDay({ now: at('2026-12-07T08:07:00Z'), config, mode: 'schedule' })).toEqual({ ok: true, day: 7 });
    expect(resolveDay({ now: at('2026-11-30T23:30:00Z'), config, mode: 'schedule' })).toEqual({ ok: true, day: 1 });
    for (const d of ['2026-11-30T12:00:00Z', '2026-12-26T08:00:00Z', '2027-12-05T08:00:00Z', '2025-12-05T08:00:00Z'])
      expect(resolveDay({ now: at(d), config, mode: 'schedule' }).ok).toBe(false);
  });
  it('manuale: solo 1–25', () => {
    expect(resolveDay({ now: new Date(), config, mode: 'manual', requestedDay: '25' })).toEqual({ ok: true, day: 25 });
    for (const bad of ['0', '26', 'x', '', '1.5', undefined]) expect(resolveDay({ now: new Date(), config, mode: 'manual', requestedDay: bad as string }).ok).toBe(false);
  });
});

describe('messaggi', () => {
  it('ogni giorno ha testo, link diretto e pulsante', () => {
    for (let d = 1; d <= 25; d++) {
      const r = buildReminder({ content: content as any, config, day: d });
      expect(r.url).toBe(`https://utente.github.io/nome-repo/?day=${d}`);
      expect(r.text.length).toBeGreaterThan(10);
      expect(r.payloadExtras.reply_markup.inline_keyboard[0][0].url).toBe(r.url);
    }
  });
  it('i testi dei 25 giorni sono tutti diversi', () => {
    expect(new Set(content.days.map((d) => d.reminder)).size).toBe(25);
  });
  it('la prova è marcata come tale', () => {
    expect(buildReminder({ content: content as any, config, day: 3, isTest: true }).text).toMatch(/^🧪 \[PROVA\]/);
  });
});

describe('configurazione e segreti', () => {
  it('segnala secret mancanti e URL di esempio', () => {
    expect(checkSendConfig({ env: {}, config: app }).length).toBe(3);
    expect(checkSendConfig({ env: { TELEGRAM_BOT_TOKEN: 'a', TELEGRAM_CHAT_ID: 'b' }, config })).toEqual([]);
  });
  it('redact nasconde token e chat id', () => {
    const env = { TELEGRAM_BOT_TOKEN: '123456:ABC-def', TELEGRAM_CHAT_ID: '987654' };
    expect(redact('url bot123456:ABC-def chat 987654', env)).not.toMatch(/123456|ABC|987654/);
  });
});

describe('invio (fetch simulato: nessun messaggio reale)', () => {
  const ok = async () => new Response(JSON.stringify({ ok: true, result: {} }), { status: 200 });
  const env = { EVENT_NAME: 'workflow_dispatch', REMINDER_DAY: '4', TELEGRAM_BOT_TOKEN: '111:SECRETTOKEN', TELEGRAM_CHAT_ID: '555' };
  it('dry-run per default: non chiama fetch', async () => {
    let calls = 0; const logs: string[] = [];
    const r = await run({ env: { ...env, DRY_RUN: undefined }, config, content, fetchImpl: (async () => { calls++; return ok(); }) as any, log: (m: string) => logs.push(m) });
    expect(r.exitCode).toBe(0); expect(calls).toBe(0); expect(logs.join('\n')).toMatch(/Dry-run/);
  });
  it('invio reale: chiamata sendMessage con testo e pulsante', async () => {
    let body: any, url = '';
    const r = await run({ env: { ...env, DRY_RUN: 'false' }, config, content, fetchImpl: (async (u: string, init: any) => { url = u; body = JSON.parse(init.body); return ok(); }) as any, log: () => {} });
    expect(r.exitCode).toBe(0);
    expect(url).toBe('https://api.telegram.org/bot111:SECRETTOKEN/sendMessage');
    expect(body.chat_id).toBe('555'); expect(body.reply_markup.inline_keyboard[0][0].url).toContain('?day=4');
  });
  it('errori Telegram → exit 1 e log senza token', async () => {
    const logs: string[] = [];
    const bad = async () => new Response(JSON.stringify({ ok: false, error_code: 400, description: 'Bad Request: chat not found' }), { status: 400 });
    const r = await run({ env: { ...env, DRY_RUN: 'false' }, config, content, fetchImpl: bad as any, log: (m: string) => logs.push(m) });
    expect(r.exitCode).toBe(1); expect(logs.join('\n')).toMatch(/chat not found/); expect(logs.join('\n')).not.toMatch(/SECRETTOKEN/);
  });
  it('errore di rete e risposta non JSON', async () => {
    await expect(sendTelegramMessage({ token: 't', chatId: 'c', text: 'x', fetchImpl: (async () => { throw new Error('ECONNRESET'); }) as any })).rejects.toThrow(/rete/);
    await expect(sendTelegramMessage({ token: 't', chatId: 'c', text: 'x', fetchImpl: (async () => new Response('<html>', { status: 502 })) as any })).rejects.toThrow(/502/);
  });
  it('schedule fuori periodo: nessun invio', async () => {
    let calls = 0;
    const r = await run({ env: { TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: 'c' }, now: at('2026-10-24T08:07:00Z'), config, content, fetchImpl: (async () => { calls++; return ok(); }) as any, log: () => {} });
    expect(r.exitCode).toBe(0); expect(r.skipped).toBe(true); expect(calls).toBe(0);
  });
  it('invio reale senza secret → errore', async () => {
    const r = await run({ env: { EVENT_NAME: 'workflow_dispatch', REMINDER_DAY: '2', DRY_RUN: 'false' }, config, content, log: () => {} });
    expect(r.exitCode).toBe(1);
  });
});

describe('script da riga di comando', () => {
  it('dry-run manuale esce con 0 e non invia', () => {
    const res = spawnSync('node', ['--experimental-strip-types', '--no-warnings', 'scripts/send-advent-reminder.mjs'], { env: { PATH: process.env.PATH, EVENT_NAME: 'workflow_dispatch', REMINDER_DAY: '7', DRY_RUN: 'true' }, encoding: 'utf8' });
    expect(res.status).toBe(0); expect(res.stdout).toMatch(/Dry-run: nessun messaggio inviato/);
  });
  it('giorno non valido → exit 1', () => {
    const res = spawnSync('node', ['--experimental-strip-types', '--no-warnings', 'scripts/send-advent-reminder.mjs'], { env: { PATH: process.env.PATH, EVENT_NAME: 'workflow_dispatch', REMINDER_DAY: '99' }, encoding: 'utf8' });
    expect(res.status).toBe(1);
  });
});
