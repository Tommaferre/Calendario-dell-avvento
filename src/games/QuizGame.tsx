import { useState } from "react";
import type { QuizData } from "../content/types";

interface Props {
  quiz: QuizData;
  onComplete: (score: number, total: number) => void;
}

export default function QuizGame({ quiz, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = quiz.questions[index];
  const isLast = index === quiz.questions.length - 1;

  function choose(optionIndex: number) {
    if (selected !== null) return;
    setSelected(optionIndex);
    if (optionIndex === question.correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    if (isLast) {
      setFinished(true);
      onComplete(score, quiz.questions.length);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  if (finished) {
    const good = score >= Math.ceil(quiz.questions.length / 2);
    return (
      <div className="feedback-box" role="status">
        <p>
          <strong>
            Hai risposto correttamente a {score} su {quiz.questions.length} domande.
          </strong>
        </p>
        <p>{good ? quiz.resultGood : quiz.resultBad}</p>
      </div>
    );
  }

  return (
    <div>
      <p>{quiz.intro}</p>
      <div className="quiz-question">
        <p>
          <strong>
            Domanda {index + 1} di {quiz.questions.length}
          </strong>
        </p>
        <p>{question.question}</p>
        <div className="quiz-options" role="radiogroup" aria-label={question.question}>
          {question.options.map((option, i) => {
            let cls = "quiz-option";
            if (selected !== null) {
              if (i === question.correctIndex) cls += " quiz-option--correct";
              else if (i === selected) cls += " quiz-option--wrong";
            }
            return (
              <button
                key={option}
                type="button"
                className={cls}
                role="radio"
                aria-checked={selected === i}
                disabled={selected !== null}
                onClick={() => choose(i)}
              >
                {option}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div className="feedback-box" role="status">
            {selected === question.correctIndex ? question.feedbackCorrect : question.feedbackWrong}
          </div>
        )}
      </div>
      {selected !== null && (
        <button type="button" className="btn btn--primary" onClick={next}>
          {isLast ? "Vedi il risultato" : "Prossima domanda"}
        </button>
      )}
    </div>
  );
}
