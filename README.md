# Il nostro dicembre — Christmas Advent

Calendario dell'Avvento romantico, installabile come app (PWA), pubblicabile gratis su GitHub Pages,
con reminder quotidiano su Telegram (GitHub Actions). 25 sorprese già scritte, 25 illustrazioni originali (SVG),
tre minigiochi, tutto in italiano.

> Per cambiare testi, immagini, quiz e buoni leggi **[GUIDA_PERSONALIZZAZIONE.md](GUIDA_PERSONALIZZAZIONE.md)**.

## Stato di verifica (onesto)

Verificato nell'ambiente di sviluppo (senza rete, quindi senza `npm install`):
- Logica (date/fuso, sblocco 25 caselle, cambio anno, storage, quiz, memory, indovinelli, validazione contenuti,
  reminder Telegram con `fetch` simulato, link e base path): **55 test superati**, eseguiti con un adattatore minimale al posto di Vitest.
- Script Telegram da riga di comando: dry-run, fuori periodo, giorno non valido, invio senza secret.
- Interfaccia in **Chromium reale** (390×844, touch) su una build emulata con esbuild e lo stesso plugin PWA, servita sotto
  `/christmas-advent/`: 29 controlli superati (25 caselle, sblocco, fuso a mezzanotte, `?day=N` anche se bloccato, apertura di
  tutte le 25 sorprese, quiz, memory, indovinello, buono, regalo finale, persistenza, console senza errori, manifest, icone,
  service worker, **funzionamento offline**, anteprima assente in produzione).
- Sintassi YAML dei due workflow; controllo dei tipi TypeScript sui moduli non-React.

**Non** verificato (non era possibile qui): `npm install`, `npm run build` con Vite, `npm test` con Vitest/jsdom
(i test in `tests/render.test.tsx` sono scritti ma mai eseguiti), `npm run typecheck` sui componenti React,
l'esecuzione reale dei workflow su GitHub, l'invio di messaggi Telegram reali, il prompt nativo di installazione e
l'installazione su un vero Chrome Android, il flusso di aggiornamento del service worker. Esegui `npm run check` e
`npm run build` in locale come primo passo: se qualcosa non torna, parti da lì.

## Setup locale

Serve Node.js **22.14 o successivo** (gli script eseguono direttamente i file `.ts` condivisi, con il flag `--experimental-strip-types` già impostato negli script npm).

```bash
npm install
npm run dev        # sviluppo, con modalità anteprima
npm run check      # typecheck + validazione contenuti + test
npm run build      # build di produzione in dist/
npm run preview    # prova locale della build (senza anteprima date)
```

Comandi utili: `npm run validate` (controlla contenuti e file citati), `npm run assets` (rigenera le illustrazioni),
`npm run set-year -- 2027` (cambia l'anno e le date).

## Struttura

| Percorso | Contenuto |
|---|---|
| `config/app.json` | nome, anno, fuso, **URL pubblico**, colori PWA |
| `src/content/advent-content.json` | **unica fonte di verità** dei 25 giorni (usata anche dallo script Telegram) |
| `src/content/types.ts` | tipi e validazione |
| `src/lib/` | date/fuso, link, storage, PWA, anteprima |
| `src/games/` | logica pura di quiz, memory, indovinelli |
| `src/components/` | interfaccia e renderer dei tipi di sorpresa |
| `src/styles.css` | colori e stile |
| `public/assets/advent/` | illustrazioni del calendario e dei 25 giorni |
| `public/assets/photos/` | le vostre fotografie |
| `public/assets/decor/`, `games/` | carte del memory e grafiche dei giochi |
| `scripts/` | reminder Telegram, validazione, generazione asset |
| `.github/workflows/` | `deploy.yml` e `advent-reminder.yml` |

## Pubblicazione su GitHub Pages

1. Crea il repository **pubblico** e carica il progetto (branch `main`; se usi un altro nome cambialo in `deploy.yml`).
2. Apri `config/app.json` e imposta `publicUrl` con l'indirizzo finale, ad esempio
   `https://TUOUTENTE.github.io/NOME-REPOSITORY/` (slash finale incluso).
3. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
4. Fai push: il workflow *Deploy GitHub Pages* esegue validazione, test e build, poi pubblica.
5. Apri l'indirizzo, prova la pagina come sito normale e poi installala da Chrome Android (menu ⋮ → *Installa app*).

Il base path (`/NOME-REPOSITORY/`) è ricavato da `publicUrl`. Con un dominio personalizzato imposta `publicUrl` a quel dominio.

> Lo sblocco giornaliero è una regola **dell'interfaccia**, non una protezione: tutti i testi e le immagini sono nei file
> pubblicati e leggibili da chiunque guardi il codice o gli URL. Non metterci nulla che non vuoi rendere pubblico.

## Reminder Telegram

Il reminder è separato dal calendario: se non lo configuri, l'app funziona lo stesso.

1. Su Telegram parla con **@BotFather** → `/newbot` → copia il **token**.
2. La destinataria deve **aprire il bot e premere Avvia (/start)** almeno una volta, altrimenti Telegram non permette al bot di scriverle.
3. Ricava il **chat id** della destinataria (dopo che ha premuto Avvia, apri nel browser
   `https://api.telegram.org/bot<TOKEN>/getUpdates` e cerca `"chat":{"id":...}`; non condividere quell'URL).
4. Nel repository: **Settings → Secrets and variables → Actions → New repository secret**, crea
   `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.
5. (Facoltativo) in *Variables* puoi creare `PUBLIC_URL` per sovrascrivere l'URL; altrimenti si usa `config/app.json`.
6. **Prova senza inviare**: *Actions → Advent reminder → Run workflow*, giorno a scelta, `dry_run = true`.
   Nel log vedi testo e link; i secret mancanti sono segnalati.
7. **Invio reale di prova**: stessa schermata con `dry_run = false`. Il messaggio è marcato «🧪 [PROVA]» e non modifica il calendario.

Il workflow pianificato parte dal 1° al 25 dicembre alle 09:07 `Europe/Rome` (campo `timezone` del cron) solo dal branch
predefinito; lo script ricontrolla la data a Roma e non invia nulla fuori periodo. GitHub può ritardare i job
pianificati e Telegram non garantisce il minuto esatto di consegna: non è un orologio di precisione. Non c'è
deduplicazione: rieseguire a mano un run pianificato invia di nuovo il messaggio.

### Checklist del workflow pianificato

- [ ] Il repository è pubblico e **ha avuto attività nei 60 giorni precedenti**: GitHub disattiva i `schedule` dei
      repository pubblici inattivi. Fai un commit (anche minimo) a novembre.
- [ ] *Actions → Advent reminder*: nessun banner «disabled»; se c'è, premi *Enable workflow*.
- [ ] Il file è sul branch predefinito (Settings → Branches).
- [ ] Secret e `publicUrl` impostati (il dry-run non mostra avvisi).
- [ ] Prova reale eseguita con successo prima del 1° dicembre.
- [ ] Il 1° dicembre, dopo le 09:07, controlla che il run sia comparso e verde.

## Privacy

Repository pubblico: testi, immagini e foto sono accessibili da chiunque. Nessun analytics, nessun servizio esterno,
nessun font remoto. Il token Telegram vive solo nei Secrets e non compare mai nel frontend né nei log (viene oscurato).
I progressi sono salvati in `localStorage`: restano su quel browser/dispositivo, non si sincronizzano e si perdono se si
cancellano i dati del sito. Se il browser blocca lo storage, l'app funziona e avvisa che i progressi non verranno salvati.

## Anteprima e aggiornamenti

- **Anteprima**: con `npm run dev` compare un pannello (o `?preview=2026-12-12`) per simulare qualsiasi data.
  Nella build di produzione non esiste e il parametro viene ignorato.
- **Aggiornamenti PWA**: dopo ogni pubblicazione la nuova versione si scarica in background e compare «Aggiorna»;
  toccandolo l'app si ricarica. In alternativa chiudi e riapri l'app.

## Risoluzione problemi

| Problema | Cosa controllare |
|---|---|
| Pagina bianca / immagini mancanti su GitHub Pages | `publicUrl` in `config/app.json` deve combaciare con l'indirizzo reale, slash finale incluso |
| «Configurazione da correggere» | errore in `advent-content.json`: il messaggio dice giorno e campo; `npm run validate` |
| Il workflow di deploy fallisce | leggi il passaggio rosso (validazione, test o build); `npm run check` in locale |
| Il reminder non parte | checklist sopra; poi i log del run; `Chat not found` = la destinataria non ha premuto Avvia o chat id errato |
| Link del reminder apre la casella sbagliata/bloccata | normale se la data non è arrivata: l'app mostra «Non ancora!» |
| Non vedo le modifiche sul telefono | tocca «Aggiorna» o chiudi/riapri l'app |
| Su Android non compare «Installa» | usa Chrome, apri l'indirizzo https, menu ⋮ → Installa app / Aggiungi a schermata Home |
