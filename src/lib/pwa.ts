import { useEffect, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true);

/** Intercetta il prompt nativo di installazione (Chrome Android). */
export function useInstallPrompt() {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone());
  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvent(e as BeforeInstallPromptEvent); };
    const onInstalled = () => { setInstalled(true); setEvent(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);
  const install = async () => {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
  };
  return { canPrompt: event !== null, installed, install };
}

/** Registra il service worker (solo in produzione) e segnala quando c'è una nuova versione in attesa. */
export function useServiceWorker() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  // Si ricarica SOLO dopo che l'utente ha toccato "Aggiorna": al primo avvio il service worker
  // prende il controllo della pagina e un ricaricamento automatico chiuderebbe la sorpresa aperta.
  const updateRequested = useRef(false);
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    let reloading = false;
    const onController = () => { if (updateRequested.current && !reloading) { reloading = true; window.location.reload(); } };
    navigator.serviceWorker.addEventListener('controllerchange', onController);
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((reg) => {
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) setWaiting(worker);
        });
      });
    }).catch(() => { /* l'app funziona anche senza service worker */ });
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onController);
  }, []);
  const update = () => { updateRequested.current = true; waiting?.postMessage({ type: 'SKIP_WAITING' }); };
  return { updateAvailable: waiting !== null, update };
}
