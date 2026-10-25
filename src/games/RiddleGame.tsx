import { useState } from "react";
import type { RiddleData } from "../content/types";

interface Props {
  riddle: RiddleData;
  onComplete: () => void;
}

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function RiddleGame({ riddle, onComplete }: Props) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const normalizedAccepted = riddle.acceptedAnswers.map(normalize);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const isCorrect = normalizedAccepted.includes(normalize(answer));
    setStatus(isCorrect ? "correct" : "wrong");
    if (isCorrect) onComplete();
  }

  function reveal() {
    setRevealed(true);
    setStatus("correct");
    onComplete();
  }

  return (
    <div>
      <p>{riddle.intro}</p>
      <p>
        <em>{riddle.riddleText}</em>
      </p>

      {!revealed && status !== "correct" && (
        <form onSubmit={submit}>
          <div className="riddle-input-row">
            <label className="visually-hidden" htmlFor="riddle-answer">
              La tua risposta
            </label>
            <input
              id="riddle-answer"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Scrivi qui la tua risposta..."
            />
            <button type="submit" className="btn btn--primary">
              Rispondi
            </button>
          </div>
        </form>
      )}

      {status === "wrong" && (
        <div className="feedback-box" role="status">
          <p>Non proprio, riprova pure.</p>
          <button type="button" className="btn btn--ghost" onClick={() => setShowHint(true)}>
            Mostra un indizio
          </button>
          {showHint && <p>{riddle.hint}</p>}
        </div>
      )}

      {status === "correct" && (
        <div className="feedback-box" role="status">
          <p>
            <strong>Esatto!</strong> {riddle.solutionReveal}
          </p>
        </div>
      )}

      {!revealed && status !== "correct" && (
        <button type="button" className="btn btn--ghost" style={{ marginTop: "0.6rem" }} onClick={reveal}>
          Rivela la soluzione
        </button>
      )}
    </div>
  );
}
