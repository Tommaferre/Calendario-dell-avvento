// Tipi condivisi per i contenuti del calendario dell'avvento.
// Questo file è pensato per essere importato sia dal frontend React
// sia, concettualmente, consultato dagli script Node (che però lavorano
// sul JSON "puro" e rifanno una validazione leggera in JavaScript,
// vedi scripts/lib/content.mjs).

export type SurpriseType =
  | "message"
  | "letter"
  | "photo"
  | "voucher"
  | "quiz"
  | "game";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  feedbackCorrect: string;
  feedbackWrong: string;
}

export interface QuizData {
  intro: string;
  questions: QuizQuestion[];
  resultGood: string;
  resultBad: string;
}

export interface MemoryData {
  intro: string;
  // Elenco di simboli (emoji) usati per generare le coppie di carte.
  symbols: string[];
}

export interface RiddleData {
  intro: string;
  riddleText: string;
  acceptedAnswers: string[];
  hint: string;
  solutionReveal: string;
}

export type GameData =
  | { kind: "quiz"; data: QuizData }
  | { kind: "memory"; data: MemoryData }
  | { kind: "riddle"; data: RiddleData };

export interface VoucherData {
  instructions: string;
  redeemLabel: string;
  redeemedLabel: string;
}

export interface DayContent {
  day: number;
  date: string; // formato YYYY-MM-DD, nel fuso Europe/Rome
  type: SurpriseType;
  title: string;
  preview: string;
  body: string;
  illustration: string; // percorso relativo in public/assets/advent/
  photoCaption?: string;
  voucher?: VoucherData;
  quiz?: QuizData;
  game?: GameData;
  special?: boolean; // true per il 25 dicembre
}

export interface AdventContent {
  version: number;
  days: DayContent[];
}

const VALID_TYPES: SurpriseType[] = [
  "message",
  "letter",
  "photo",
  "voucher",
  "quiz",
  "game",
];

export interface ValidationIssue {
  day: number | null;
  message: string;
}

/**
 * Valida la struttura dei contenuti dell'avvento.
 * Ritorna un array di problemi: se è vuoto, i contenuti sono validi.
 * Usata sia in sviluppo (console) sia nei test automatici.
 */
export function validateAdventContent(content: AdventContent): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!content || !Array.isArray(content.days)) {
    return [{ day: null, message: "Il file dei contenuti non contiene un array 'days'." }];
  }

  const seenDays = new Set<number>();

  for (const entry of content.days) {
    const d = entry?.day;
    if (typeof d !== "number" || d < 1 || d > 25) {
      issues.push({ day: d ?? null, message: "Il campo 'day' deve essere un numero tra 1 e 25." });
      continue;
    }
    if (seenDays.has(d)) {
      issues.push({ day: d, message: `Il giorno ${d} è duplicato.` });
    }
    seenDays.add(d);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.date ?? "")) {
      issues.push({ day: d, message: "Il campo 'date' deve avere formato YYYY-MM-DD." });
    }
    if (!VALID_TYPES.includes(entry.type)) {
      issues.push({ day: d, message: `Tipo non valido: '${entry.type}'.` });
    }
    if (!entry.title || !entry.preview || !entry.body) {
      issues.push({ day: d, message: "Mancano titolo, anteprima o contenuto." });
    }
    if (!entry.illustration) {
      issues.push({ day: d, message: "Manca il percorso dell'illustrazione." });
    }
    if (entry.type === "voucher" && !entry.voucher) {
      issues.push({ day: d, message: "Tipo 'voucher' ma manca il campo 'voucher'." });
    }
    if (entry.type === "quiz" && !entry.quiz) {
      issues.push({ day: d, message: "Tipo 'quiz' ma manca il campo 'quiz'." });
    }
    if (entry.type === "game" && !entry.game) {
      issues.push({ day: d, message: "Tipo 'game' ma manca il campo 'game'." });
    }
    if (entry.type === "photo" && !entry.photoCaption) {
      issues.push({ day: d, message: "Tipo 'photo' ma manca 'photoCaption'." });
    }
  }

  for (let day = 1; day <= 25; day++) {
    if (!seenDays.has(day)) {
      issues.push({ day, message: `Manca il contenuto per il giorno ${day}.` });
    }
  }

  return issues;
}
