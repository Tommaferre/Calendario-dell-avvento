interface Props {
  onDismiss: () => void;
  onInstallClick?: () => void;
  canInstall: boolean;
}

export default function Onboarding({ onDismiss, onInstallClick, canInstall }: Props) {
  return (
    <div className="onboarding-overlay" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <h2 id="onboarding-title">Benvenuta nel nostro calendario 🎄</h2>
        <p>
          Ogni giorno, dal 1° al 25 dicembre, si sblocca una nuova casella. Toccala per aprire
          la sorpresa del giorno: a volte è un pensiero, a volte un gioco, a volte qualcosa da
          riscuotere insieme.
        </p>
        <p>Le caselle già aperte restano sempre consultabili, in qualsiasi momento.</p>
        <div style={{ display: "flex", gap: "0.6rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1.2rem" }}>
          <button type="button" className="btn btn--primary" onClick={onDismiss}>
            Ho capito, si comincia
          </button>
          {canInstall && onInstallClick && (
            <button type="button" className="btn btn--ghost" onClick={onInstallClick}>
              Installa l'app
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
