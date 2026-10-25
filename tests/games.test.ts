import { describe, it, expect } from 'vitest';
import { answerQuestion, initialQuiz, nextQuestion, pickResult, quizScore } from '../src/games/quiz.ts';
import { canFlip, createMemory, flipCard, hideMismatch, shuffle } from '../src/games/memory.ts';
import { checkRiddle, normalizeAnswer } from '../src/games/riddle.ts';
import type { QuizQuestion } from '../src/content/types.ts';

const qs: QuizQuestion[] = [0, 1, 2].map((i) => ({ question: `q${i}`, options: ['a', 'b', 'c'], correctIndex: i, correctFeedback: 'ok', wrongFeedback: 'ko' }));

describe('quiz', () => {
  it('flusso completo e punteggio', () => {
    let s = initialQuiz();
    for (const choice of [0, 0, 2]) { s = answerQuestion(s, choice, qs); s = nextQuestion(s, qs); }
    expect(s.finished).toBe(true);
    expect(quizScore(s.answers, qs)).toBe(2);
  });
  it('non permette doppie risposte né risposte invalide', () => {
    let s = answerQuestion(initialQuiz(), 0, qs);
    expect(answerQuestion(s, 1, qs)).toBe(s);
    expect(answerQuestion(initialQuiz(), 9, qs).answers).toEqual([]);
    expect(nextQuestion(initialQuiz(), qs).index).toBe(0);
  });
  it('sceglie il risultato giusto', () => {
    const r = [{ minScore: 0, title: 'A', text: '' }, { minScore: 2, title: 'B', text: '' }, { minScore: 3, title: 'C', text: '' }];
    expect([0, 1, 2, 3].map((n) => pickResult(r, n).title)).toEqual(['A', 'A', 'B', 'C']);
  });
});

describe('memory', () => {
  const pairs = ['a', 'b', 'c', 'd'].map((id) => ({ id, label: id, image: `${id}.svg` }));
  const find = (s: ReturnType<typeof createMemory>, id: string) => s.cards.map((c, i) => (c.pairId === id ? i : -1)).filter((i) => i >= 0);
  it('crea 2 carte per coppia, mescolate in modo deterministico con rng', () => {
    const s = createMemory(pairs, () => 0.42);
    expect(s.cards).toHaveLength(8);
    expect(shuffle([1, 2, 3, 4], () => 0)).toEqual(shuffle([1, 2, 3, 4], () => 0));
    expect([...s.cards.map((c) => c.pairId)].sort()).toEqual(['a', 'a', 'b', 'b', 'c', 'c', 'd', 'd']);
  });
  it('coppia giusta: resta scoperta e conta un tentativo', () => {
    let s = createMemory(pairs, () => 0.1);
    const [x, y] = find(s, 'a');
    s = flipCard(flipCard(s, x), y);
    expect(s.attempts).toBe(1);
    expect(s.cards[x].matched && s.cards[y].matched).toBe(true);
    expect(s.flipped).toEqual([]);
  });
  it('coppia sbagliata: blocca le altre carte finché non si rigira', () => {
    let s = createMemory(pairs, () => 0.1);
    const x = find(s, 'a')[0], y = find(s, 'b')[0], z = find(s, 'c')[0];
    s = flipCard(flipCard(s, x), y);
    expect(s.attempts).toBe(1);
    expect(canFlip(s, z)).toBe(false);
    expect(flipCard(s, z)).toBe(s);
    s = hideMismatch(s);
    expect(s.flipped).toEqual([]);
    expect(canFlip(s, z)).toBe(true);
  });
  it('si completa e non si può girare la stessa carta due volte', () => {
    let s = createMemory(pairs, () => 0.7);
    const first = find(s, 'a')[0];
    s = flipCard(s, first);
    expect(flipCard(s, first)).toBe(s);
    s = flipCard(s, find(s, 'a')[1]);
    for (const id of ['b', 'c', 'd']) { const [p, q] = find(s, id); s = flipCard(flipCard(s, p), q); }
    expect(s.completed).toBe(true);
    expect(s.attempts).toBe(4);
  });
});

describe('indovinello', () => {
  it('normalizza maiuscole, accenti, punteggiatura e articoli', () => {
    expect(normalizeAnswer('  La NEVE!! ')).toBe('neve');
    expect(normalizeAnswer('l’Omino di Neve')).toBe('omino di neve');
  });
  it('accetta le risposte previste e rifiuta le altre', () => {
    const answers = ['pupazzo di neve', 'omino di neve'];
    expect(checkRiddle('Il pupazzo di neve', answers)).toBe(true);
    expect(checkRiddle('OMINO DI NEVE.', answers)).toBe(true);
    expect(checkRiddle('slitta', answers)).toBe(false);
    expect(checkRiddle('   ', answers)).toBe(false);
  });
});
