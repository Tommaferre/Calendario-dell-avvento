import { useEffect, useReducer, useRef } from 'react';
import type { QuizContent } from '../../content/types.ts';
import { answerQuestion, initialQuiz, nextQuestion, pickResult, quizScore, type QuizState } from '../../games/quiz.ts';
import { assetUrl } from '../../lib/assets.ts';

type Action = { type: 'answer'; choice: number } | { type: 'next' } | { type: 'restart' };

interface Props {
  content: QuizContent;
  onFinish: (score: number, total: number) => void;
}

export function QuizView({ content, onFinish }: Props) {
  const { questions, results } = content;
  const reducer = (s: QuizState, a: Action): QuizState =>
    a.type === 'answer' ? answerQuestion(s, a.choice, questions) : a.type === 'next' ? nextQuestion(s, questions) : initialQuiz();
  const [state, dispatch] = useReducer(reducer, undefined, initialQuiz);
  const reported = useRef(false);
  const score = quizScore(state.answers, questions);

  useEffect(() => {
    if (state.finished && !reported.current) { reported.current = true; onFinish(score, questions.length); }
    if (!state.finished) reported.current = false;
  }, [state.finished, score, questions.length, onFinish]);

  const art = <img className="game__art" src={assetUrl('assets/games/quiz.svg')} alt="" width="400" height="240" />;

  if (state.finished) {
    const r = pickResult(results, score);
    return (
      <div className="game" aria-live="polite">
        {art}
        <h3>{r.title}</h3>
        <p className="game__score">Hai risposto bene a {score} domande su {questions.length}.</p>
        <p>{r.text}</p>
        <button type="button" className="btn btn--gold btn--wide" onClick={() => dispatch({ type: 'restart' })}>Rigioca</button>
      </div>
    );
  }
  const q = questions[state.index];
  const chosen = state.revealed ? state.answers[state.index] : null;
  const last = state.index === questions.length - 1;
  return (
    <div className="game">
      {state.index === 0 && !state.revealed && <>{art}<p>{content.intro}</p></>}
      <p className="game__progress">Domanda {state.index + 1} di {questions.length}</p>
      <h3 className="quiz__question" id={`q-${state.index}`}>{q.question}</h3>
      <div className="quiz__options" role="group" aria-labelledby={`q-${state.index}`}>
        {q.options.map((opt, i) => {
          const cls = chosen === null ? '' : i === q.correctIndex ? 'is-correct' : i === chosen ? 'is-wrong' : 'is-dim';
          return (
            <button key={opt} type="button" className={`option ${cls}`} disabled={chosen !== null} onClick={() => dispatch({ type: 'answer', choice: i })}>
              {opt}
            </button>
          );
        })}
      </div>
      <div aria-live="polite" className="quiz__feedback">
        {chosen !== null && (
          <>
            <p className={chosen === q.correctIndex ? 'feedback feedback--ok' : 'feedback feedback--ko'}>
              {chosen === q.correctIndex ? q.correctFeedback : q.wrongFeedback}
            </p>
            <button type="button" className="btn btn--gold btn--wide" onClick={() => dispatch({ type: 'next' })}>
              {last ? 'Vedi il risultato' : 'Avanti'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
