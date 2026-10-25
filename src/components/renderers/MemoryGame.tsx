import { useEffect, useMemo, useReducer, useRef } from 'react';
import type { MemoryContent } from '../../content/types.ts';
import { canFlip, createMemory, flipCard, hideMismatch, isMismatchPending, type MemoryState } from '../../games/memory.ts';
import { assetUrl } from '../../lib/assets.ts';

type Action = { type: 'flip'; index: number } | { type: 'hide' } | { type: 'restart' };

interface Props { content: MemoryContent; onComplete: (attempts: number) => void }

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export function MemoryGame({ content, onComplete }: Props) {
  const { pairs } = content;
  const labelOf = useMemo(() => Object.fromEntries(pairs.map((p) => [p.id, p.label])), [pairs]);
  const imageOf = useMemo(() => Object.fromEntries(pairs.map((p) => [p.id, p.image])), [pairs]);
  const reducer = (s: MemoryState, a: Action): MemoryState =>
    a.type === 'flip' ? flipCard(s, a.index) : a.type === 'hide' ? hideMismatch(s) : createMemory(pairs);
  const [state, dispatch] = useReducer(reducer, pairs, (p) => createMemory(p));
  const reported = useRef(false);

  useEffect(() => {
    if (!isMismatchPending(state)) return;
    const t = setTimeout(() => dispatch({ type: 'hide' }), reduceMotion() ? 1100 : 850);
    return () => clearTimeout(t);
  }, [state]);

  useEffect(() => {
    if (state.completed && !reported.current) { reported.current = true; onComplete(state.attempts); }
    if (!state.completed) reported.current = false;
  }, [state.completed, state.attempts, onComplete]);

  const cols = state.cards.length <= 6 ? 3 : 4;
  return (
    <div className="game">
      <img className="game__art" src={assetUrl('assets/games/memory.svg')} alt="" width="400" height="240" />
      <p>{content.intro}</p>
      <p className="game__progress" aria-live="polite">Tentativi: {state.attempts}</p>
      <div className="memory" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {state.cards.map((card, i) => {
          const up = card.matched || state.flipped.includes(i);
          const label = labelOf[card.pairId];
          return (
            <button
              key={card.uid}
              type="button"
              className={`mcard ${up ? 'is-up' : ''} ${card.matched ? 'is-matched' : ''}`}
              aria-label={up ? `Carta ${i + 1}: ${label}${card.matched ? ', trovata' : ''}` : `Carta ${i + 1}, coperta`}
              aria-disabled={!canFlip(state, i)}
              onClick={() => dispatch({ type: 'flip', index: i })}
            >
              <span className="mcard__inner">
                <img className="mcard__face mcard__back" src={assetUrl('assets/decor/card-back.svg')} alt="" />
                <img className="mcard__face mcard__front" src={assetUrl(imageOf[card.pairId])} alt="" />
              </span>
            </button>
          );
        })}
      </div>
      {state.completed && (
        <div className="game__done" role="status">
          <p>{content.successMessage}</p>
          <p className="game__score">Completato in {state.attempts} tentativi.</p>
          <button type="button" className="btn btn--gold btn--wide" onClick={() => dispatch({ type: 'restart' })}>Rigioca</button>
        </div>
      )}
    </div>
  );
}
