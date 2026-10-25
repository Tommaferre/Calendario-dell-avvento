import { useEffect, useMemo, useState } from "react";
import type { MemoryData } from "../content/types";

interface Props {
  memory: MemoryData;
  onComplete: (attempts: number) => void;
}

interface Card {
  id: number;
  symbol: string;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MemoryGame({ memory, onComplete }: Props) {
  const initialCards = useMemo<Card[]>(() => {
    const pairs = [...memory.symbols, ...memory.symbols];
    return shuffle(pairs).map((symbol, id) => ({ id, symbol, matched: false }));
  }, [memory.symbols]);

  const [cards, setCards] = useState<Card[]>(initialCards);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [done, setDone] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (cards.every((c) => c.matched) && !done) {
      setDone(true);
      onComplete(attempts);
    }
  }, [cards, attempts, done, onComplete]);

  function flip(id: number) {
    if (locked || done) return;
    const card = cards.find((c) => c.id === id);
    if (!card || card.matched || revealed.includes(id)) return;
    if (revealed.length === 2) return;

    const nextRevealed = [...revealed, id];
    setRevealed(nextRevealed);

    if (nextRevealed.length === 2) {
      setLocked(true);
      setAttempts((a) => a + 1);
      const [firstId, secondId] = nextRevealed;
      const first = cards.find((c) => c.id === firstId);
      const second = cards.find((c) => c.id === secondId);

      if (first && second && first.symbol === second.symbol) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, matched: true } : c))
          );
          setRevealed([]);
          setLocked(false);
        }, 450);
      } else {
        setTimeout(() => {
          setRevealed([]);
          setLocked(false);
        }, 850);
      }
    }
  }

  function reset() {
    setCards(shuffle([...memory.symbols, ...memory.symbols]).map((symbol, id) => ({ id, symbol, matched: false })));
    setRevealed([]);
    setAttempts(0);
    setDone(false);
    setLocked(false);
  }

  return (
    <div>
      <p>{memory.intro}</p>
      <p aria-live="polite">Tentativi: {attempts}</p>
      <div className="memory-grid" role="grid" aria-label="Griglia del memory">
        {cards.map((card) => {
          const isRevealed = card.matched || revealed.includes(card.id);
          let cls = "memory-card";
          if (card.matched) cls += " memory-card--matched";
          else if (isRevealed) cls += " memory-card--revealed";
          return (
            <button
              key={card.id}
              type="button"
              className={cls}
              onClick={() => flip(card.id)}
              aria-label={isRevealed ? `Carta: ${card.symbol}` : "Carta coperta"}
              disabled={card.matched}
            >
              {isRevealed ? card.symbol : ""}
            </button>
          );
        })}
      </div>
      {done && (
        <div className="feedback-box" role="status">
          <p>
            <strong>Fatto! Hai trovato tutte le coppie in {attempts} tentativi.</strong>
          </p>
          <button type="button" className="btn btn--ghost" onClick={reset}>
            Rigioca
          </button>
        </div>
      )}
    </div>
  );
}
