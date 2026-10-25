/** Persistenza locale versionata. Funziona anche se localStorage non è disponibile (memoria volatile). */

export const SCHEMA_VERSION = 1;

export interface QuizRecord { score: number; total: number }
export interface GameRecord { completed: boolean; bestAttempts?: number; plays: number }
export interface AppState {
  version: typeof SCHEMA_VERSION;
  /** giorno → data/ora di prima apertura (ISO) */
  opened: Record<string, string>;
  /** giorno → data/ora di riscatto del buono (ISO) */
  redeemed: Record<string, string>;
  quizzes: Record<string, QuizRecord>;
  games: Record<string, GameRecord>;
  prefs: { onboardingDismissed: boolean };
}

export const emptyState = (): AppState => ({
  version: SCHEMA_VERSION, opened: {}, redeemed: {}, quizzes: {}, games: {}, prefs: { onboardingDismissed: false },
});

const isRec = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const cleanDayMap = (v: unknown): Record<string, string> => {
  const out: Record<string, string> = {};
  if (isRec(v)) for (const [k, val] of Object.entries(v)) if (/^\d{1,2}$/.test(k) && typeof val === 'string') out[k] = val;
  return out;
};

/** Converte il testo salvato in uno stato valido: dati mancanti, malformati o di versione ignota → valori sicuri. */
export function parseState(raw: string | null | undefined): AppState {
  if (!raw) return emptyState();
  let data: unknown;
  try { data = JSON.parse(raw); } catch { return emptyState(); }
  if (!isRec(data)) return emptyState();
  // Punto di migrazione: if (data.version === 0) { ... }  Versioni sconosciute (future) → si riparte da zero.
  if (data.version !== SCHEMA_VERSION) return emptyState();
  const s = emptyState();
  s.opened = cleanDayMap(data.opened);
  s.redeemed = cleanDayMap(data.redeemed);
  if (isRec(data.quizzes))
    for (const [k, v] of Object.entries(data.quizzes))
      if (isRec(v) && Number.isInteger(v.score) && Number.isInteger(v.total)) s.quizzes[k] = { score: v.score as number, total: v.total as number };
  if (isRec(data.games))
    for (const [k, v] of Object.entries(data.games))
      if (isRec(v) && typeof v.completed === 'boolean')
        s.games[k] = { completed: v.completed, plays: Number.isInteger(v.plays) ? (v.plays as number) : 0, ...(Number.isInteger(v.bestAttempts) ? { bestAttempts: v.bestAttempts as number } : {}) };
  if (isRec(data.prefs) && typeof data.prefs.onboardingDismissed === 'boolean') s.prefs.onboardingDismissed = data.prefs.onboardingDismissed;
  return s;
}

export interface StateStore { load(): AppState; save(state: AppState): boolean }

/** `getStorage` può lanciare (modalità privata, cookie bloccati): in tal caso si usa la sola memoria. */
export function createStore(key: string, getStorage: () => Storage | null = () => globalThis.localStorage ?? null): StateStore {
  let memory: string | null = null;
  const safe = (): Storage | null => { try { return getStorage(); } catch { return null; } };
  return {
    load() {
      try { return parseState(safe()?.getItem(key) ?? memory); } catch { return parseState(memory); }
    },
    save(state) {
      const text = JSON.stringify(state);
      memory = text;
      try { const s = safe(); if (!s) return false; s.setItem(key, text); return true; } catch { return false; }
    },
  };
}
