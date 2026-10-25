import { useState } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export default function InstallBanner() {
  const { canPromptNatively, isInstalled, promptInstall } = useInstallPrompt();
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  async function handleClick() {
    if (canPromptNatively) {
      await promptInstall();
    } else {
      setShowManualInstructions((v) => !v);
    }
  }

  return (
    <div className="install-banner">
      <span>📲 Puoi installare questa app sul telefono, come un'app vera.</span>
      <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
        <button type="button" className="btn btn--ghost" onClick={handleClick}>
          Installa
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setDismissed(true)}
          aria-label="Chiudi questo avviso"
        >
          ✕
        </button>
      </div>
      {showManualInstructions && !canPromptNatively && (
        <div className="feedback-box" style={{ width: "100%" }}>
          <p>
            <strong>Su Chrome per Android:</strong> tocca i tre puntini in alto a destra, poi
            "Installa app" (o "Aggiungi a schermata Home"). Su altri browser la voce può avere un
            nome leggermente diverso.
          </p>
        </div>
      )}
    </div>
  );
}
