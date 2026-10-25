/**
 * Tipi e validazione dei contenuti.
 * NOTA: questo file è importato anche da Node (scripts/), quindi usa solo sintassi
 * TypeScript "cancellabile" (niente enum, niente import interni) ed è una foglia del grafo.
 */

export const DAY_TYPES = ['message', 'letter', 'photo', 'voucher', 'quiz', 'game'] as const;
export type DayType = (typeof DAY_TYPES)[number];

export interface AppConfig {
  appName: string;
  shortName: string;
  description: string;
  year: number;
  timezone: string;
  publicUrl: string;
  firstDay: number;
  lastDay: number;
  reminder: { hour: number; minute: number };
  themeColor: string;
  backgroundColor: string;
  storageKey: string;
}

export interface MessageContent { paragraphs: string[] }
export interface LetterContent {
  greeting: string;
  paragraphs: string[];
  closing: string;
  signature: string;
  /** Regalo simbolico opzionale, mostrato dopo la lettera (usato il 25 dicembre). */
  gift?: { title: string; description: string };
}
export interface PhotoContent { image: string; alt: string; caption: string }
export interface VoucherContent { title: string; description: string; redeem: string; validity?: string }
export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  correctFeedback: string;
  wrongFeedback: string;
}
export interface QuizResult { minScore: number; title: string; text: string }
export interface QuizContent { intro: string; questions: QuizQuestion[]; results: QuizResult[] }
export interface MemoryPair { id: string; label: string; image: string }
export interface MemoryContent {
  kind: 'memory';
  intro: string;
  pairs: MemoryPair[];
  successMessage: string;
}
export interface RiddleContent {
  kind: 'riddle';
  intro: string;
  riddle: string;
  /** Risposte accettate (maiuscole, accenti e articoli sono ignorati). */
  answers: string[];
  hint?: string;
  revealText: string;
  successMessage: string;
  wrongMessage: string;
}
export type GameContent = MemoryContent | RiddleContent;

interface BaseDay {
  day: number;
  /** Data ISO YYYY-MM-DD (deve coincidere con anno + giorno). */
  date: string;
  title: string;
  preview: string;
  /** Percorso relativo a public/ (es. assets/advent/day-01.svg). */
  illustration: string;
  /** Testo del reminder Telegram per questo giorno. */
  reminder: string;
}
export type AdventDay =
  | (BaseDay & { type: 'message'; content: MessageContent })
  | (BaseDay & { type: 'letter'; content: LetterContent })
  | (BaseDay & { type: 'photo'; content: PhotoContent })
  | (BaseDay & { type: 'voucher'; content: VoucherContent })
  | (BaseDay & { type: 'quiz'; content: QuizContent })
  | (BaseDay & { type: 'game'; content: GameContent });

export interface AdventContent {
  meta: { title: string; dedication: string[]; howTo: string; finalTitle: string };
  days: AdventDay[];
}

// ---------------------------------------------------------------- validazione

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
const isStrArr = (v: unknown, min = 1): v is string[] => Array.isArray(v) && v.length >= min && v.every(isStr);
const isLocalPath = (v: unknown): v is string =>
  isStr(v) && !/^([a-z][a-z0-9+.-]*:|\/\/|\/)/i.test(v) && !v.includes('..');

export const REMINDER_MAX_LENGTH = 300;

/** Restituisce l'elenco degli errori (array vuoto = contenuti validi). */
export function validateContent(
  data: unknown,
  config: Pick<AppConfig, 'year' | 'firstDay' | 'lastDay'>,
): string[] {
  const errors: string[] = [];
  const err = (m: string) => errors.push(m);
  if (!isObj(data)) return ['Il contenuto deve essere un oggetto JSON.'];

  const meta = data.meta;
  if (!isObj(meta)) err('meta: mancante.');
  else {
    if (!isStr(meta.title)) err('meta.title: testo mancante.');
    if (!isStrArr(meta.dedication)) err('meta.dedication: serve un elenco di paragrafi.');
    if (!isStr(meta.howTo)) err('meta.howTo: testo mancante.');
    if (!isStr(meta.finalTitle)) err('meta.finalTitle: testo mancante.');
  }

  const days = data.days;
  if (!Array.isArray(days)) return [...errors, 'days: deve essere un elenco.'];
  const expected = config.lastDay - config.firstDay + 1;
  if (days.length !== expected) err(`days: attesi ${expected} giorni, trovati ${days.length}.`);

  days.forEach((d, i) => {
    const n = config.firstDay + i;
    const p = `Giorno ${n}`;
    if (!isObj(d)) return err(`${p}: voce non valida.`);
    if (d.day !== n) err(`${p}: "day" deve essere ${n} (trovato ${String(d.day)}); i giorni devono essere in ordine.`);
    const iso = `${config.year}-12-${String(n).padStart(2, '0')}`;
    if (d.date !== iso) err(`${p}: "date" deve essere ${iso} (trovato ${String(d.date)}). Usa "npm run set-year".`);
    for (const k of ['title', 'preview', 'reminder'] as const) if (!isStr(d[k])) err(`${p}: "${k}" mancante.`);
    if (isStr(d.reminder) && d.reminder.length > REMINDER_MAX_LENGTH)
      err(`${p}: "reminder" troppo lungo (${d.reminder.length} > ${REMINDER_MAX_LENGTH}).`);
    if (!isLocalPath(d.illustration)) err(`${p}: "illustration" deve essere un percorso relativo a public/ (senza / iniziale né http).`);
    if (!DAY_TYPES.includes(d.type as DayType)) return err(`${p}: "type" non valido (${String(d.type)}).`);
    const c = d.content;
    if (!isObj(c)) return err(`${p}: "content" mancante.`);

    switch (d.type) {
      case 'message':
        if (!isStrArr(c.paragraphs)) err(`${p}: content.paragraphs deve essere un elenco di testi.`);
        break;
      case 'letter':
        if (!isStr(c.greeting)) err(`${p}: content.greeting mancante.`);
        if (!isStrArr(c.paragraphs)) err(`${p}: content.paragraphs deve essere un elenco di testi.`);
        if (!isStr(c.closing)) err(`${p}: content.closing mancante.`);
        if (!isStr(c.signature)) err(`${p}: content.signature mancante.`);
        if (c.gift !== undefined && !(isObj(c.gift) && isStr(c.gift.title) && isStr(c.gift.description)))
          err(`${p}: content.gift deve avere title e description.`);
        break;
      case 'photo':
        if (!isLocalPath(c.image)) err(`${p}: content.image deve essere un percorso relativo a public/.`);
        if (!isStr(c.alt)) err(`${p}: content.alt (testo alternativo) mancante.`);
        if (!isStr(c.caption)) err(`${p}: content.caption mancante.`);
        break;
      case 'voucher':
        for (const k of ['title', 'description', 'redeem'] as const)
          if (!isStr(c[k])) err(`${p}: content.${k} mancante.`);
        break;
      case 'quiz':
        validateQuiz(c, p, err);
        break;
      case 'game':
        validateGame(c, p, err);
        break;
    }
  });
  return errors;
}

function validateQuiz(c: Obj, p: string, err: (m: string) => void) {
  if (!isStr(c.intro)) err(`${p}: content.intro mancante.`);
  if (!Array.isArray(c.questions) || c.questions.length < 1) return err(`${p}: servono domande.`);
  c.questions.forEach((q: unknown, qi: number) => {
    const qp = `${p}, domanda ${qi + 1}`;
    if (!isObj(q)) return err(`${qp}: non valida.`);
    if (!isStr(q.question)) err(`${qp}: testo mancante.`);
    if (!isStrArr(q.options, 2) || (q.options as string[]).length > 5) err(`${qp}: servono da 2 a 5 risposte.`);
    else if (!Number.isInteger(q.correctIndex) || (q.correctIndex as number) < 0 || (q.correctIndex as number) >= (q.options as string[]).length)
      err(`${qp}: correctIndex fuori intervallo.`);
    if (!isStr(q.correctFeedback)) err(`${qp}: correctFeedback mancante.`);
    if (!isStr(q.wrongFeedback)) err(`${qp}: wrongFeedback mancante.`);
  });
  if (!Array.isArray(c.results) || c.results.length < 1) return err(`${p}: servono i risultati finali.`);
  const total = c.questions.length;
  let prev = -1;
  c.results.forEach((r: unknown, ri: number) => {
    const rp = `${p}, risultato ${ri + 1}`;
    if (!isObj(r) || !Number.isInteger(r.minScore) || !isStr(r.title) || !isStr(r.text)) return err(`${rp}: servono minScore, title, text.`);
    const m = r.minScore as number;
    if (m <= prev) err(`${rp}: i minScore devono essere crescenti.`);
    if (m > total) err(`${rp}: minScore (${m}) supera il numero di domande (${total}).`);
    if (ri === 0 && m !== 0) err(`${rp}: il primo risultato deve avere minScore 0.`);
    prev = m;
  });
}

function validateGame(c: Obj, p: string, err: (m: string) => void) {
  if (!isStr(c.intro)) err(`${p}: content.intro mancante.`);
  if (c.kind === 'memory') {
    if (!isStr(c.successMessage)) err(`${p}: content.successMessage mancante.`);
    if (!Array.isArray(c.pairs) || c.pairs.length < 3 || c.pairs.length > 10) return err(`${p}: il memory vuole da 3 a 10 coppie.`);
    const ids = new Set<string>();
    c.pairs.forEach((pair: unknown, i: number) => {
      const pp = `${p}, coppia ${i + 1}`;
      if (!isObj(pair) || !isStr(pair.id) || !isStr(pair.label) || !isLocalPath(pair.image)) return err(`${pp}: servono id, label, image (percorso relativo).`);
      if (ids.has(pair.id as string)) err(`${pp}: id duplicato (${String(pair.id)}).`);
      ids.add(pair.id as string);
    });
  } else if (c.kind === 'riddle') {
    for (const k of ['riddle', 'revealText', 'successMessage', 'wrongMessage'] as const)
      if (!isStr(c[k])) err(`${p}: content.${k} mancante.`);
    if (!isStrArr(c.answers)) err(`${p}: content.answers deve contenere almeno una risposta.`);
    if (c.hint !== undefined && !isStr(c.hint)) err(`${p}: content.hint non valido.`);
  } else err(`${p}: game.kind deve essere "memory" o "riddle".`);
}

/** Tutti i percorsi di file locali (relativi a public/) citati dai contenuti. */
export function collectAssetPaths(content: AdventContent): string[] {
  const out = new Set<string>();
  for (const d of content.days) {
    out.add(d.illustration);
    if (d.type === 'photo') out.add(d.content.image);
    if (d.type === 'game' && d.content.kind === 'memory') d.content.pairs.forEach((x) => out.add(x.image));
  }
  return [...out];
}
