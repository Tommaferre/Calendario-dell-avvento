import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, type DayStatus } from './components/Calendar.tsx';
import { Header } from './components/Header.tsx';
import { LockIcon } from './components/Icons.tsx';
import { Modal } from './components/Modal.tsx';
import { Onboarding } from './components/Onboarding.tsx';
import { PreviewPanel } from './components/PreviewPanel.tsx';
import { SurpriseModal } from './components/SurpriseModal.tsx';
import { adventContent, appConfig } from './content/index.ts';
import { currentCalendarDay, getZonedDateParts, isDayUnlocked, opensOnLabel, type DateParts } from './lib/dates.ts';
import { parseDayParam } from './lib/links.ts';
import { PREVIEW_AVAILABLE, readPreviewDate } from './lib/preview.ts';
import { useServiceWorker } from './lib/pwa.ts';
import { createStore, type AppState } from './lib/storage.ts';

const { days, meta } = adventContent;
const { firstDay, lastDay, year, timezone } = appConfig;

export function App() {
  const store = useMemo(() => createStore(appConfig.storageKey), []);
  const [state, setState] = useState<AppState>(() => store.load());
  const [persistOk, setPersistOk] = useState(true);
  const [now, setNow] = useState(() => new Date());
  const [preview, setPreview] = useState<DateParts | null>(() => readPreviewDate(window.location.search));
  const [selected, setSelected] = useState<number | null>(null);
  const [lockedNotice, setLockedNotice] = useState<number | null>(null);
  const { updateAvailable, update } = useServiceWorker();

  // Data "di oggi" a Roma (o quella simulata, solo in sviluppo).
  const today = preview ?? getZonedDateParts(now, timezone);
  const currentDay = currentCalendarDay(today, year, firstDay, lastDay);

  useEffect(() => { setPersistOk(store.save(state)); }, [state, store]);

  useEffect(() => {
    const refresh = () => setNow(new Date());
    const id = window.setInterval(refresh, 60_000);
    document.addEventListener('visibilitychange', refresh);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', refresh); };
  }, []);

  const statusOf = useCallback((day: number): DayStatus => {
    if (state.opened[String(day)]) return 'opened';
    return isDayUnlocked(day, today, year) ? 'available' : 'locked';
  }, [state.opened, today.year, today.month, today.day]); // eslint-disable-line react-hooks/exhaustive-deps

  const openDay = useCallback((day: number) => {
    const status = statusOf(day);
    if (status === 'locked') { setLockedNotice(day); return; }
    setState((s) => (s.opened[String(day)] ? s : { ...s, opened: { ...s.opened, [String(day)]: new Date().toISOString() } }));
    setSelected(day);
  }, [statusOf]);

  // Link diretto (?day=7): rispetta sempre le regole di sblocco, poi ripulisce l'URL.
  useEffect(() => {
    const requested = parseDayParam(window.location.search, firstDay, lastDay);
    if (requested === null) return;
    openDay(requested);
    const url = new URL(window.location.href);
    url.searchParams.delete('day');
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openedCount = days.filter((d) => state.opened[String(d.day)]).length;
  const selectedDay = days.find((d) => d.day === selected) ?? null;
  const todayAvailable = currentDay !== null && statusOf(currentDay) === 'available';

  return (
    <>
      <main className="page">
        <Header title={meta.title} dedication={meta.dedication} howTo={meta.howTo} opened={openedCount} total={days.length} />
        {todayAvailable && currentDay !== null && (
          <button type="button" className="btn btn--gold btn--wide today-cta" onClick={() => openDay(currentDay)}>
            Apri la sorpresa di oggi
          </button>
        )}
        <Calendar days={days} statusOf={statusOf} currentDay={currentDay} onSelect={openDay} lastDay={lastDay} />
        <Onboarding dismissed={state.prefs.onboardingDismissed} onDismiss={() => setState((s) => ({ ...s, prefs: { ...s.prefs, onboardingDismissed: true } }))} />
        <footer className="footer">
          <p>I tuoi progressi restano salvati solo su questo dispositivo.</p>
          {!persistOk && <p className="footer__warn" role="status">Questo browser non permette di salvare i progressi: se chiudi la pagina le sorprese aperte si azzerano.</p>}
        </footer>
      </main>

      {selectedDay && (
        <SurpriseModal
          key={selectedDay.day}
          day={selectedDay}
          state={state}
          isFinal={selectedDay.day === lastDay}
          finalTitle={meta.finalTitle}
          onClose={() => setSelected(null)}
          onToggleVoucher={(d) => setState((s) => {
            const redeemed = { ...s.redeemed };
            if (redeemed[String(d)]) delete redeemed[String(d)]; else redeemed[String(d)] = new Date().toISOString();
            return { ...s, redeemed };
          })}
          onQuiz={(d, score, total) => setState((s) => ({ ...s, quizzes: { ...s.quizzes, [String(d)]: { score, total } } }))}
          onGame={(d, attempts) => setState((s) => {
            const prev = s.games[String(d)];
            const best = prev?.bestAttempts === undefined ? attempts : Math.min(prev.bestAttempts, attempts);
            return { ...s, games: { ...s.games, [String(d)]: { completed: true, plays: (prev?.plays ?? 0) + 1, bestAttempts: best } } };
          })}
        />
      )}

      {lockedNotice !== null && (
        <Modal labelledBy="locked-title" onClose={() => setLockedNotice(null)} className="sheet--small">
          <div className="sheet__body locked">
            <span className="locked__icon"><LockIcon /></span>
            <h2 id="locked-title" className="sheet__title">Non ancora!</h2>
            <p>Questa sorpresa si apre <strong>{opensOnLabel(lockedNotice)}</strong>. Nel frattempo puoi aprire quelle dei giorni passati.</p>
            <button type="button" className="btn btn--gold btn--wide" onClick={() => setLockedNotice(null)}>Va bene</button>
          </div>
        </Modal>
      )}

      {updateAvailable && (
        <div className="toast" role="status">
          <span>È disponibile una versione aggiornata.</span>
          <button type="button" className="btn btn--gold" onClick={update}>Aggiorna</button>
        </div>
      )}
      {PREVIEW_AVAILABLE && <PreviewPanel value={preview} onChange={setPreview} year={year} />}
    </>
  );
}
