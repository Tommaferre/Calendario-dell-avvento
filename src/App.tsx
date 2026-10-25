import { useEffect, useMemo, useState } from "react";
import { content, config, assetUrl, getDayContent } from "./content";
import { isUnlocked, todayInRome } from "./utils/dates";
import { useAdventState } from "./hooks/useAdventState";
import CalendarGrid from "./components/CalendarGrid";
import DayModal from "./components/DayModal";
import Onboarding from "./components/Onboarding";
import InstallBanner from "./components/InstallBanner";
import PreviewBar from "./components/PreviewBar";
import { useInstallPrompt } from "./hooks/useInstallPrompt";
import type { DayContent } from "./content/types";

function readDayParam(): number | null {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("day");
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 25) return null;
  return n;
}

export default function App() {
  const { state, storageWorks, openDay, redeemVoucher, recordQuizResult, recordGameCompletion, setOnboardingSeen } =
    useAdventState();
  const { promptInstall, canPromptNatively } = useInstallPrompt();

  // La modalità anteprima esiste solo in sviluppo: in produzione questo
  // intero ramo è eliminato dal bundle (import.meta.env.DEV è una
  // costante nota a build time, quindi Vite/Rollup rimuove il codice
  // morto risultante).
  const [previewDate, setPreviewDate] = useState<string | null>(null);
  const referenceDate = import.meta.env.DEV && previewDate ? new Date(`${previewDate}T12:00:00`) : undefined;

  const todayDate = todayInRome(referenceDate);
  const [activeDay, setActiveDay] = useState<DayContent | null>(null);
  const [linkWarning, setLinkWarning] = useState<string | null>(null);

  const sortedDays = useMemo(() => [...content.days].sort((a, b) => a.day - b.day), []);
  const openedCount = state.openedDays.length;

  // Apertura tramite link diretto (?day=N), ad esempio dal reminder
  // Telegram. Lo sblocco resta comunque regolato dalla data: se la
  // casella non è ancora disponibile, mostriamo un avviso invece di
  // aprirla.
  useEffect(() => {
    const day = readDayParam();
    if (!day) return;
    const dayContent = getDayContent(day);
    if (!dayContent) return;
    if (isUnlocked(dayContent.date, referenceDate)) {
      setActiveDay(dayContent);
    } else {
      setLinkWarning(
        `La casella del giorno ${day} non è ancora disponibile: tornerà utile proprio il ${dayContent.date.split("-").reverse().join("/")}.`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleOpenDay(day: DayContent) {
    openDay(day.day);
    setActiveDay(day);
  }

  return (
    <div className="app-shell">
      {import.meta.env.DEV && (
        <PreviewBar previewDate={previewDate} onChange={setPreviewDate} year={config.year} />
      )}

      {!state.preferences.hasSeenOnboarding && (
        <Onboarding
          onDismiss={setOnboardingSeen}
          onInstallClick={canPromptNatively ? () => promptInstall() : undefined}
          canInstall={canPromptNatively}
        />
      )}

      <header className="hero">
        <div className="hero__illustration">
          <img src={assetUrl("assets/advent/hero.svg")} alt="Illustrazione del calendario dell'avvento" />
        </div>
        <h1 className="hero__title">{config.appTitle}</h1>
        <p className="hero__dedication">{config.dedication}</p>

        <div className="progress" aria-label="Avanzamento del calendario">
          <div className="progress__bar">
            <div className="progress__fill" style={{ width: `${(openedCount / 25) * 100}%` }} />
          </div>
          <p className="progress__label">{openedCount} / 25 caselle aperte</p>
        </div>

        {!storageWorks && (
          <p className="progress__label" role="status">
            Il salvataggio locale non è disponibile su questo browser: l'app funziona comunque,
            ma il progresso potrebbe non essere ricordato.
          </p>
        )}

        {linkWarning && (
          <p className="progress__label" role="status">
            {linkWarning}
          </p>
        )}

        <InstallBanner />
      </header>

      <CalendarGrid
        days={sortedDays}
        openedDays={state.openedDays}
        todayDate={todayDate}
        referenceDate={referenceDate}
        onOpenDay={handleOpenDay}
      />

      {activeDay && (
        <DayModal
          day={activeDay}
          state={state}
          onClose={() => setActiveDay(null)}
          onRedeemVoucher={redeemVoucher}
          onQuizComplete={recordQuizResult}
          onGameComplete={recordGameCompletion}
        />
      )}

      <p className="footer-note">
        I tuoi progressi sono salvati solo su questo dispositivo e in questo browser (localStorage),
        non vengono inviati altrove. Il calendario funziona anche offline dopo il primo
        caricamento. Fuso orario di riferimento: {config.timezone}.
      </p>
    </div>
  );
}
