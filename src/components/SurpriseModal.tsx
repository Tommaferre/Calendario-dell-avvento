import type { AdventDay } from '../content/types.ts';
import { assetUrl } from '../lib/assets.ts';
import { formatDayMonth } from '../lib/dates.ts';
import type { AppState } from '../lib/storage.ts';
import { Modal } from './Modal.tsx';
import { LetterView } from './renderers/LetterView.tsx';
import { MemoryGame } from './renderers/MemoryGame.tsx';
import { MessageView } from './renderers/MessageView.tsx';
import { PhotoView } from './renderers/PhotoView.tsx';
import { QuizView } from './renderers/QuizView.tsx';
import { RiddleGame } from './renderers/RiddleGame.tsx';
import { VoucherView } from './renderers/VoucherView.tsx';

interface Props {
  day: AdventDay;
  state: AppState;
  isFinal: boolean;
  finalTitle: string;
  onClose: () => void;
  onToggleVoucher: (day: number) => void;
  onQuiz: (day: number, score: number, total: number) => void;
  onGame: (day: number, attempts: number) => void;
}

export function SurpriseModal({ day, state, isFinal, finalTitle, onClose, onToggleVoucher, onQuiz, onGame }: Props) {
  const key = String(day.day);
  const body = (() => {
    switch (day.type) {
      case 'message': return <MessageView content={day.content} />;
      case 'letter': return <LetterView content={day.content} />;
      case 'photo': return <PhotoView content={day.content} fallbackArt={day.illustration} />;
      case 'voucher': return <VoucherView content={day.content} art={day.illustration} redeemedAt={state.redeemed[key]} onToggle={() => onToggleVoucher(day.day)} />;
      case 'quiz': return <QuizView content={day.content} onFinish={(s, t) => onQuiz(day.day, s, t)} />;
      case 'game':
        return day.content.kind === 'memory'
          ? <MemoryGame content={day.content} onComplete={(a) => onGame(day.day, a)} />
          : <RiddleGame content={day.content} onSolved={(a) => onGame(day.day, a)} />;
    }
  })();
  const prior = day.type === 'quiz' ? state.quizzes[key] : null;
  const game = day.type === 'game' ? state.games[key] : null;
  return (
    <Modal labelledBy="surprise-title" onClose={onClose} className={isFinal ? 'sheet--final' : ''}>
      <div className="sheet__top">
        <button type="button" className="sheet__close" onClick={onClose} aria-label="Chiudi la sorpresa">×</button>
        <img className="sheet__art" src={assetUrl(day.illustration)} alt="" width="400" height="400" />
        {isFinal && <div className="sparkles" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} style={{ left: `${(i * 8.3 + 4) % 100}%`, animationDelay: `${(i % 6) * 0.35}s` }} />)}</div>}
      </div>
      <div className="sheet__body">
        <p className="sheet__date">{isFinal ? finalTitle : formatDayMonth(day.day)}</p>
        <h2 id="surprise-title" className="sheet__title">{day.title}</h2>
        {prior && <p className="sheet__note">Ultimo risultato: {prior.score} su {prior.total}</p>}
        {game?.completed && <p className="sheet__note">Gioco già completato{game.bestAttempts ? ` (miglior risultato: ${game.bestAttempts} tentativi)` : ''}.</p>}
        {body}
        <button type="button" className="btn btn--ghost btn--wide sheet__done" onClick={onClose}>Chiudi</button>
      </div>
    </Modal>
  );
}
