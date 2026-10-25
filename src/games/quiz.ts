import type { QuizQuestion, QuizResult } from '../content/types.ts';

export interface QuizState {
  index: number;
  /** risposta scelta per ogni domanda già risolta */
  answers: number[];
  /** true dopo aver risposto alla domanda corrente, prima di passare alla successiva */
  revealed: boolean;
  finished: boolean;
}
export const initialQuiz = (): QuizState => ({ index: 0, answers: [], revealed: false, finished: false });

export function answerQuestion(state: QuizState, choice: number, questions: QuizQuestion[]): QuizState {
  if (state.finished || state.revealed) return state;
  const q = questions[state.index];
  if (!q || !Number.isInteger(choice) || choice < 0 || choice >= q.options.length) return state;
  return { ...state, answers: [...state.answers, choice], revealed: true };
}

export function nextQuestion(state: QuizState, questions: QuizQuestion[]): QuizState {
  if (!state.revealed || state.finished) return state;
  const next = state.index + 1;
  return next >= questions.length ? { ...state, finished: true } : { ...state, index: next, revealed: false };
}

export const quizScore = (answers: number[], questions: QuizQuestion[]): number =>
  answers.reduce((n, a, i) => n + (questions[i] && a === questions[i].correctIndex ? 1 : 0), 0);

/** Sceglie il risultato col minScore più alto raggiunto. */
export function pickResult(results: QuizResult[], score: number): QuizResult {
  const sorted = [...results].sort((a, b) => a.minScore - b.minScore);
  let picked = sorted[0];
  for (const r of sorted) if (score >= r.minScore) picked = r;
  return picked;
}
