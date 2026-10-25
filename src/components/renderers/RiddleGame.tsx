import { useState } from 'react';
import type { RiddleContent } from '../../content/types.ts';
import { checkRiddle } from '../../games/riddle.ts';
import { assetUrl } from '../../lib/assets.ts';

type Status = 'idle' | 'wrong' | 'right' | 'revealed';
interface Props { content: RiddleContent; onSolved: (attempts: number) => void }

export function RiddleGame({ content, onSolved }: Props) {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'right' || !value.trim()) return;
    const n = attempts + 1;
    setAttempts(n);
    if (checkRiddle(value, content.answers)) { setStatus('right'); onSolved(n); } else setStatus('wrong');
  };
  const reset = () => { setValue(''); setStatus('idle'); setAttempts(0); setHint(false); };

  return (
    <div className="game">
      <img className="game__art" src={assetUrl('assets/games/riddle.svg')} alt="" width="400" height="240" />
      <p>{content.intro}</p>
      <blockquote className="riddle">{content.riddle}</blockquote>
      <form onSubmit={submit} className="riddle__form">
        <label htmlFor="riddle-answer">La tua risposta</label>
        <input id="riddle-answer" type="text" value={value} autoComplete="off" autoCapitalize="none" disabled={status === 'right'}
          onChange={(e) => { setValue(e.target.value); if (status === 'wrong') setStatus('idle'); }} />
        <button type="submit" className="btn btn--gold btn--wide" disabled={status === 'right'}>Rispondi</button>
      </form>
      <div aria-live="polite" className="riddle__feedback">
        {status === 'wrong' && <p className="feedback feedback--ko">{content.wrongMessage}</p>}
        {status === 'right' && <p className="feedback feedback--ok">{content.successMessage}</p>}
        {status === 'revealed' && <p className="feedback">{content.revealText}</p>}
        {hint && content.hint && status !== 'right' && <p className="feedback">Indizio: {content.hint}</p>}
      </div>
      <div className="riddle__tools">
        {content.hint && !hint && status !== 'right' && <button type="button" className="btn btn--ghost" onClick={() => setHint(true)}>Mostra l’indizio</button>}
        {status !== 'right' && status !== 'revealed' && <button type="button" className="btn btn--ghost" onClick={() => setStatus('revealed')}>Svela la risposta</button>}
        {(status === 'right' || status === 'revealed') && <button type="button" className="btn btn--ghost" onClick={reset}>Riprova</button>}
      </div>
    </div>
  );
}
