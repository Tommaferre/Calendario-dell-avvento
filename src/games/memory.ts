import type { MemoryPair } from '../content/types.ts';

export interface Card { uid: number; pairId: string; matched: boolean }
export interface MemoryState {
  cards: Card[];
  /** indici delle carte girate in questo turno (max 2) */
  flipped: number[];
  attempts: number;
  completed: boolean;
}

export type Rng = () => number;

/** Fisher–Yates con generatore iniettabile (per test deterministici). */
export function shuffle<T>(items: T[], rng: Rng = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function createMemory(pairs: MemoryPair[], rng: Rng = Math.random): MemoryState {
  const cards = shuffle(pairs.flatMap((p) => [p.id, p.id]), rng).map((pairId, uid) => ({ uid, pairId, matched: false }));
  return { cards, flipped: [], attempts: 0, completed: false };
}

/** True se la carta può essere girata adesso. */
export const canFlip = (s: MemoryState, index: number): boolean =>
  !s.completed && s.flipped.length < 2 && !s.flipped.includes(index) && !!s.cards[index] && !s.cards[index].matched;

/** Gira una carta. Alla seconda carta conta un tentativo e, se uguali, segna la coppia. */
export function flipCard(s: MemoryState, index: number): MemoryState {
  if (!canFlip(s, index)) return s;
  const flipped = [...s.flipped, index];
  if (flipped.length < 2) return { ...s, flipped };
  const [a, b] = flipped;
  const attempts = s.attempts + 1;
  if (s.cards[a].pairId === s.cards[b].pairId) {
    const cards = s.cards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
    return { cards, flipped: [], attempts, completed: cards.every((c) => c.matched) };
  }
  return { ...s, flipped, attempts };
}

/** Dopo una breve pausa, rigira le due carte diverse. */
export const hideMismatch = (s: MemoryState): MemoryState => (s.flipped.length === 2 ? { ...s, flipped: [] } : s);
export const isMismatchPending = (s: MemoryState): boolean => s.flipped.length === 2;
