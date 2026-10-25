import { describe, it, expect } from 'vitest';
import { createStore, emptyState, parseState, SCHEMA_VERSION } from '../src/lib/storage.ts';

describe('persistenza', () => {
  it('dati mancanti o malformati → stato vuoto', () => {
    for (const raw of [null, '', '{rotto', '[]', '42', '"x"', 'null']) expect(parseState(raw)).toEqual(emptyState());
  });
  it('versione sconosciuta → stato vuoto', () => {
    expect(parseState(JSON.stringify({ version: 99, opened: { '1': 'x' } }))).toEqual(emptyState());
  });
  it('ripulisce campi invalidi ma conserva quelli validi', () => {
    const s = parseState(JSON.stringify({ version: SCHEMA_VERSION, opened: { '3': '2026-12-03T10:00:00Z', abc: 'x', '4': 5 }, redeemed: 'no', quizzes: { '5': { score: 3, total: 5 }, '12': { score: 'x' } }, games: { '7': { completed: true } }, prefs: { onboardingDismissed: true } }));
    expect(Object.keys(s.opened)).toEqual(['3']);
    expect(s.redeemed).toEqual({});
    expect(s.quizzes).toEqual({ '5': { score: 3, total: 5 } });
    expect(s.games['7'].completed).toBe(true);
    expect(s.prefs.onboardingDismissed).toBe(true);
  });
  it('salva e rilegge', () => {
    const mem = new Map<string, string>();
    const fake = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) } as unknown as Storage;
    const store = createStore('k', () => fake);
    const s = emptyState(); s.opened['2'] = 'x';
    expect(store.save(s)).toBe(true);
    expect(store.load().opened).toEqual({ '2': 'x' });
  });
  it('funziona anche se lo storage lancia errori', () => {
    const store = createStore('k', () => { throw new Error('bloccato'); });
    const s = emptyState(); s.opened['2'] = 'x';
    expect(store.save(s)).toBe(false);
    expect(store.load().opened).toEqual({ '2': 'x' });
    const broken = { getItem: () => { throw new Error('x'); }, setItem: () => { throw new Error('quota'); } } as unknown as Storage;
    expect(createStore('k', () => broken).save(s)).toBe(false);
    expect(createStore('k', () => broken).load().version).toBe(SCHEMA_VERSION);
  });
});
