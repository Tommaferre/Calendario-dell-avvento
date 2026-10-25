// Persistenza locale con schema versionato.
//
// Tutti i dati restano nel browser dell'utente (localStorage). Non c'è
// alcuna sincronizzazione: se l'utente cambia dispositivo o cancella i
// dati del sito, il progresso si perde. Questo è documentato anche nel
// README e nella guida di personalizzazione.

export const STORAGE_KEY = "christmas-advent:v1";
const SCHEMA_VERSION = 1;

export interface QuizResult {
  dayScore: number;
  totalQuestions: number;
  completedAt: string;
}

export interface PersistedState {
  schemaVersion: number;
  openedDays: number[];
  redeemedVouchers: number[];
  quizResults: Record<number, QuizResult>;
  gameCompletions: number[];
  preferences: {
    reducedMotionOverride: boolean | null;
    hasSeenOnboarding: boolean;
  };
}

function defaultState(): PersistedState {
  return {
    schemaVersion: SCHEMA_VERSION,
    openedDays: [],
    redeemedVouchers: [],
    quizResults: {},
    gameCompletions: [],
    preferences: {
      reducedMotionOverride: null,
      hasSeenOnboarding: false,
    },
  };
}

function isStorageAvailable(): boolean {
  try {
    const testKey = "__advent_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Carica lo stato persistito, gestendo in modo sicuro dati mancanti,
 * malformati o di uno schema precedente. In caso di qualunque problema
 * ritorna uno stato di default, senza mai far crollare l'app.
 */
export function loadState(): PersistedState {
  if (!isStorageAvailable()) {
    return defaultState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return defaultState();
    }

    // Migrazione: se in futuro cambia lo schema, qui si aggiungono i casi
    // per le versioni precedenti. Per ora esiste solo la v1.
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      return defaultState();
    }

    const base = defaultState();
    return {
      schemaVersion: SCHEMA_VERSION,
      openedDays: Array.isArray(parsed.openedDays)
        ? parsed.openedDays.filter((n: unknown) => typeof n === "number")
        : base.openedDays,
      redeemedVouchers: Array.isArray(parsed.redeemedVouchers)
        ? parsed.redeemedVouchers.filter((n: unknown) => typeof n === "number")
        : base.redeemedVouchers,
      quizResults: typeof parsed.quizResults === "object" && parsed.quizResults !== null
        ? parsed.quizResults
        : base.quizResults,
      gameCompletions: Array.isArray(parsed.gameCompletions)
        ? parsed.gameCompletions.filter((n: unknown) => typeof n === "number")
        : base.gameCompletions,
      preferences: {
        reducedMotionOverride:
          typeof parsed.preferences?.reducedMotionOverride === "boolean"
            ? parsed.preferences.reducedMotionOverride
            : null,
        hasSeenOnboarding: Boolean(parsed.preferences?.hasSeenOnboarding),
      },
    };
  } catch {
    // JSON malformato, quota superata, storage bloccato dal browser, ecc.
    return defaultState();
  }
}

export function saveState(state: PersistedState): boolean {
  if (!isStorageAvailable()) return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    // Quota superata o storage non scrivibile: l'app continua a
    // funzionare, semplicemente il progresso non verrà ricordato.
    return false;
  }
}
