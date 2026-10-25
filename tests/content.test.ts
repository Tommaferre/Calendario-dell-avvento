import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { collectAssetPaths, validateContent, type AdventContent } from '../src/content/types.ts';
import app from '../config/app.json';
import raw from '../src/content/advent-content.json';

const content = raw as unknown as AdventContent;
const clone = () => JSON.parse(JSON.stringify(raw));

describe('contenuti reali', () => {
  it('sono validi', () => expect(validateContent(content, app)).toEqual([]));
  it('25 giorni, tutti i tipi obbligatori presenti, date coerenti', () => {
    expect(content.days).toHaveLength(25);
    expect(new Set(content.days.map((d) => d.type))).toEqual(new Set(['message', 'letter', 'photo', 'voucher', 'quiz', 'game']));
    content.days.forEach((d, i) => expect(d.date).toBe(`${app.year}-12-${String(i + 1).padStart(2, '0')}`));
    expect(content.days[23].type).toBe('message');
    expect(content.days[24].type).toBe('letter');
  });
  it('contiene almeno quiz, memory e indovinello', () => {
    const games = content.days.flatMap((d) => (d.type === 'game' ? [d.content.kind] : []));
    expect(games).toContain('memory'); expect(games).toContain('riddle');
    expect(content.days.some((d) => d.type === 'quiz')).toBe(true);
  });
  it('nessun segnaposto da completare', () => {
    expect(JSON.stringify(content)).not.toMatch(/inserisci qui|aggiungi una tua|lorem|TODO/i);
  });
  it('tutti i file citati esistono in public/', () => {
    for (const rel of collectAssetPaths(content)) expect(existsSync(`public/${rel}`), rel).toBe(true);
  });
  it('nessun segreto o risorsa remota nei file pubblici', () => {
    const text = JSON.stringify(content) + readFileSync('config/app.json', 'utf8');
    expect(text).not.toMatch(/\d{8,}:[A-Za-z0-9_-]{30,}/);
    expect(JSON.stringify(content)).not.toMatch(/https?:\/\//);
  });
});

describe('validazione individua gli errori', () => {
  const cases: [string, (c: any) => void, RegExp][] = [
    ['giorno mancante', (c) => c.days.pop(), /attesi 25/],
    ['data errata', (c) => { c.days[2].date = '2025-12-03'; }, /Giorno 3.*date/],
    ['tipo ignoto', (c) => { c.days[0].type = 'boh'; }, /type/],
    ['quiz con indice errato', (c) => { c.days[4].content.questions[0].correctIndex = 9; }, /correctIndex/],
    ['quiz senza minScore 0', (c) => { c.days[4].content.results[0].minScore = 1; }, /minScore 0/],
    ['memory con id duplicato', (c) => { c.days[9].content.pairs[1].id = c.days[9].content.pairs[0].id; }, /duplicato/],
    ['indovinello senza risposte', (c) => { c.days[6].content.answers = []; }, /answers/],
    ['immagine remota', (c) => { c.days[0].illustration = 'https://x.it/a.png'; }, /illustration/],
    ['reminder troppo lungo', (c) => { c.days[0].reminder = 'x'.repeat(301); }, /troppo lungo/],
    ['buono incompleto', (c) => { delete c.days[3].content.redeem; }, /redeem/],
  ];
  for (const [name, mutate, re] of cases)
    it(name, () => { const c = clone(); mutate(c); expect(validateContent(c, app).join('\n')).toMatch(re); });
});
