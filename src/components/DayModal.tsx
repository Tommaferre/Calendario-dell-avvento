import { useEffect, useRef } from "react";
import type { DayContent } from "../content/types";
import { assetUrl } from "../content";
import { formatDayLabel } from "../utils/dates";
import QuizGame from "../games/QuizGame";
import MemoryGame from "../games/MemoryGame";
import RiddleGame from "../games/RiddleGame";
import type { PersistedState, QuizResult } from "../utils/storage";

const TYPE_LABELS: Record<DayContent["type"], string> = {
  message: "Messaggio",
  letter: "Lettera",
  photo: "Fotografia",
  voucher: "Buono",
  quiz: "Quiz",
  game: "Minigioco",
};

interface Props {
  day: DayContent;
  state: PersistedState;
  onClose: () => void;
  onRedeemVoucher: (day: number) => void;
  onQuizComplete: (day: number, result: QuizResult) => void;
  onGameComplete: (day: number) => void;
}

export default function DayModal({ day, state, onClose, onRedeemVoucher, onQuizComplete, onGameComplete }: Props) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onClose();
  }

  const illustrationPath = day.special ? "assets/advent/day-25-special.svg" : day.illustration;
  const isRedeemed = state.redeemedVouchers.includes(day.day);
  const previousQuizResult = state.quizResults[day.day];
  const gameCompleted = state.gameCompletions.includes(day.day);

  return (
    <div
      className="modal-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-modal-title"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="modal-card__close"
          onClick={onClose}
          aria-label="Chiudi"
        >
          ✕
        </button>

        <img
          className="modal-card__illustration"
          src={assetUrl(illustrationPath)}
          alt=""
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        <span className="badge">
          {formatDayLabel(day.date)} · {TYPE_LABELS[day.type]}
        </span>
        <h2 id="day-modal-title" className="modal-card__title">
          {day.title}
        </h2>

        <div className="modal-card__body">{day.body}</div>

        {day.type === "photo" && day.photoCaption && (
          <p style={{ marginTop: "0.75rem", fontStyle: "italic" }}>{day.photoCaption}</p>
        )}

        {day.type === "voucher" && day.voucher && (
          <div className="voucher-card">
            <p>{day.voucher.instructions}</p>
            <button
              type="button"
              className="btn btn--gold"
              onClick={() => onRedeemVoucher(day.day)}
              disabled={isRedeemed}
            >
              {isRedeemed ? `✓ ${day.voucher.redeemedLabel}` : day.voucher.redeemLabel}
            </button>
          </div>
        )}

        {day.type === "quiz" && day.quiz && (
          <div style={{ marginTop: "1rem" }}>
            {previousQuizResult ? (
              <div className="feedback-box">
                <p>
                  Hai già completato questo quiz: {previousQuizResult.dayScore} su{" "}
                  {previousQuizResult.totalQuestions} corrette.
                </p>
              </div>
            ) : (
              <QuizGame
                quiz={day.quiz}
                onComplete={(scoreValue, total) =>
                  onQuizComplete(day.day, {
                    dayScore: scoreValue,
                    totalQuestions: total,
                    completedAt: new Date().toISOString(),
                  })
                }
              />
            )}
          </div>
        )}

        {day.type === "game" && day.game && (
          <div style={{ marginTop: "1rem" }}>
            {day.game.kind === "quiz" && (
              <QuizGame
                quiz={day.game.data}
                onComplete={() => onGameComplete(day.day)}
              />
            )}
            {day.game.kind === "memory" && (
              <MemoryGame memory={day.game.data} onComplete={() => onGameComplete(day.day)} />
            )}
            {day.game.kind === "riddle" && (
              <RiddleGame riddle={day.game.data} onComplete={() => onGameComplete(day.day)} />
            )}
            {gameCompleted && day.game.kind !== "memory" && (
              <p style={{ marginTop: "0.5rem", opacity: 0.75 }}>
                Hai già completato questo minigioco in precedenza — puoi comunque rigiocare.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
