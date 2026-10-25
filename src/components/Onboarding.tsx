import { useState } from 'react';
import { useInstallPrompt } from '../lib/pwa.ts';

interface Props { dismissed: boolean; onDismiss: () => void }

/** Suggerimento facoltativo per installare l'app. Non blocca mai l'accesso al calendario. */
export function Onboarding({ dismissed, onDismiss }: Props) {
  const { canPrompt, installed, install } = useInstallPrompt();
  const [showHelp, setShowHelp] = useState(false);
  if (dismissed || installed) return null;
  return (
    <section className="onboarding" aria-labelledby="onb-title">
      <h2 id="onb-title">Tienilo sempre con te</h2>
      <p>Puoi aggiungere il calendario alla schermata Home: si apre a schermo intero e funziona anche senza connessione.</p>
      <div className="onboarding__actions">
        {canPrompt && <button type="button" className="btn btn--gold" onClick={install}>Installa l’app</button>}
        {!canPrompt && (
          <button type="button" className="btn btn--gold" aria-expanded={showHelp} aria-controls="onb-help" onClick={() => setShowHelp((v) => !v)}>
            Come si installa
          </button>
        )}
        <button type="button" className="btn btn--ghost" onClick={onDismiss}>Non ora</button>
      </div>
      {!canPrompt && showHelp && (
        <ol id="onb-help" className="onboarding__steps">
          <li>Apri questa pagina con <strong>Google Chrome</strong> sul telefono Android.</li>
          <li>Tocca il menu <strong>⋮</strong> in alto a destra.</li>
          <li>Scegli <strong>Installa app</strong> (oppure <strong>Aggiungi a schermata Home</strong>).</li>
          <li>Conferma: troverai l’icona tra le tue app.</li>
        </ol>
      )}
    </section>
  );
}
