# Il nostro dicembre — Calendario dell'Avvento 🎄

Una Progressive Web App romantica con 25 sorprese, una al giorno, dal 1° al
25 dicembre. Pensata per essere pubblicata gratuitamente su GitHub Pages,
installabile su Android da Chrome, e con un reminder giornaliero opzionale
via Telegram.

> **Prima di pubblicarla**: apri `GUIDA_PERSONALIZZAZIONE.md` — spiega passo
> per passo dove cambiare testi, foto, URL e dove configurare il bot
> Telegram. Questo README copre invece la parte più tecnica (setup,
> comandi, deployment, troubleshooting).

## Stack e scelte tecniche (già decise, non modificabili senza motivo)

- React + TypeScript + Vite, mobile-first, interamente in italiano.
- Nessun backend: tutto il calendario gira lato client, con `localStorage`
  per salvare i progressi (solo sul dispositivo dell'utente).
- Hosting statico su GitHub Pages.
- Reminder giornaliero via Telegram Bot API, eseguito da GitHub Actions su
  uno schedule, **completamente separato** dal funzionamento del
  calendario: se non configuri Telegram, l'app funziona comunque al 100%.
- Tutte le immagini sono SVG generati localmente (vedi `scripts/build-assets.mjs`):
  nessuna dipendenza da immagini remote.

## Struttura del progetto

```
config/app.json                   → anno, fuso orario, URL pubblico, titolo, dedica
src/content/advent-content.json   → i 25 contenuti (fonte unica, usata anche dal reminder)
src/content/types.ts              → tipi TypeScript + validazione dei contenuti
src/components/                   → calendario, modal delle sorprese, onboarding, ecc.
src/games/                        → i tre minigiochi (quiz, memory, indovinello)
src/utils/dates.ts                → logica di sblocco basata sul fuso Europe/Rome
src/utils/storage.ts              → persistenza localStorage versionata
public/assets/advent/             → illustrazioni SVG (generate, non placeholder)
public/assets/photos/             → cartella vuota per le TUE fotografie
public/icons/                     → icone della PWA (SVG + PNG)
public/manifest.webmanifest       → manifest della PWA
scripts/sw-template.js            → sorgente del service worker
scripts/build-sw.mjs              → genera public/sw.js con il base path corretto
scripts/build-content.mjs         → genera src/content/advent-content.json (facoltativo, vedi guida)
scripts/build-assets.mjs          → genera le illustrazioni SVG/PNG
scripts/send-advent-reminder.mjs  → script del reminder Telegram
scripts/lib/content.mjs           → helper condivisi tra app e script Telegram
.github/workflows/deploy.yml            → pubblica su GitHub Pages ad ogni push
.github/workflows/advent-reminder.yml   → invia il reminder giornaliero (1-25 dicembre)
GUIDA_PERSONALIZZAZIONE.md        → come modificare tutto, passo per passo
```

## Setup locale

Richiede Node.js 20+ (la stessa versione usata dai workflow GitHub Actions).

```bash
npm install
npm run dev
```

L'app parte su `http://localhost:5173/` (o simile). In sviluppo compare in
alto una **barra di anteprima**: permette di simulare qualsiasi giorno di
dicembre senza dover aspettare o modificare l'orologio del dispositivo.
Questa barra **non esiste nella build di produzione** (è condizionata a
`import.meta.env.DEV`, quindi viene eliminata dal bundle finale).

### Comandi disponibili

| Comando | Cosa fa |
|---|---|
| `npm run dev` | avvia il server di sviluppo con hot reload |
| `npm run build` | genera `public/sw.js`, compila i tipi TypeScript e crea la build di produzione in `dist/` |
| `npm test` | esegue tutti i test automatici (Vitest) |
| `npm run preview` | serve localmente la build di produzione già creata |
| `npm run content:build` | rigenera `src/content/advent-content.json` da `scripts/build-content.mjs` |
| `npm run assets:build` | rigenera le illustrazioni SVG/PNG in `public/` |
| `npm run sw:build` | rigenera `public/sw.js` (eseguito automaticamente prima di ogni build) |
| `npm run reminder:dry-run` | simula l'invio del reminder di oggi, senza inviare nulla |
| `npm run reminder:test` | esegue lo script del reminder esattamente come farebbe il workflow schedulato |

### Test eseguiti e verificati in questo ambiente

Durante lo sviluppo ho eseguito realmente (non solo scritto) quanto segue,
in questo ambiente:

- `npm test` → **42 test, tutti superati**: calcolo delle date nel fuso
  Europe/Rome (incluso il cambio di giorno/mese/anno), sblocco delle
  caselle, persistenza `localStorage` (incluso il recupero da dati
  malformati, versione di schema sconosciuta, quota superata), validazione
  dei 25 contenuti (presenza di tutti i giorni, tutti i tipi, nessun
  duplicato), rendering del calendario (caselle bloccate/sbloccate,
  click), logica dei minigiochi quiz e indovinello, costruzione dei link
  del reminder, riconoscimento delle date fuori dal periodo 1-25 dicembre.
- `npm run build` → **completata con successo**: `tsc -b` senza errori di
  tipo, bundle Vite generato in `dist/`.
- Ho servito la cartella `dist/` da un web server locale sotto un percorso
  `/christmas-advent/` (per simulare `https://utente.github.io/christmas-advent/`)
  e verificato con `curl` che `index.html`, il manifest, il service worker,
  le icone PNG e le illustrazioni SVG rispondano tutti con `200`.
- Ho eseguito `scripts/send-advent-reminder.mjs` in tre scenari: dry-run
  esplicito su un giorno specifico, invio reale senza le variabili
  d'ambiente richieste (fallisce in modo controllato, senza inviare nulla
  e senza esporre segreti), e modalità automatica con la data odierna
  fuori dal periodo 1-25 dicembre (nessun invio, come previsto).

**Cosa NON ho potuto verificare in questo ambiente** (e che quindi ti
chiedo di controllare tu dopo il deploy):

- Un invio Telegram realmente andato a buon fine (l'ambiente usato per
  costruire il progetto non ha accesso di rete verso `api.telegram.org`;
  la logica è testata, ma il primo invio reale va verificato da te con
  `workflow_dispatch` in dry-run e poi con invio reale, come spiegato
  nella guida).
- L'installazione effettiva su un dispositivo Android reale con Chrome
  (il flusso è implementato secondo lo standard PWA — manifest, service
  worker, `beforeinstallprompt` — ma non ho un dispositivo Android fisico
  o un Chrome reale in questo ambiente per confermarlo).
- Il comportamento del workflow schedulato su GitHub reale (la sintassi
  YAML e la logica cron sono corrette, ma solo GitHub può eseguirlo
  davvero).
- Audit di accessibilità automatizzati tipo Lighthouse (non disponibili in
  questo ambiente): l'app segue le pratiche base (contrasto, focus
  visibile, `aria-label`, dimensioni touch ≥ 44px, `prefers-reduced-motion`),
  ma un controllo con uno strumento dedicato resta consigliato.

## Deployment su GitHub Pages

1. Crea un repository pubblico su GitHub e carica questo progetto.
2. Prima di pubblicare, aggiorna **`config/app.json`** → `publicUrl` con
   l'URL reale che avrà il sito, nel formato
   `https://TUO-UTENTE.github.io/NOME-REPOSITORY/` (con lo slash finale).
   Questo valore determina automaticamente anche il "base path" usato da
   Vite e dal service worker: non va impostato altrove.
3. Su GitHub, vai in **Settings → Pages** e imposta **Source: GitHub
   Actions** (non "Deploy from a branch").
4. Fai push sul branch `main`: il workflow `.github/workflows/deploy.yml`
   compila l'app, esegue i test e pubblica automaticamente su Pages.
5. Dopo qualche minuto l'app sarà raggiungibile all'URL configurato.

### Verifica dopo il deploy

- Apri l'URL pubblicato da desktop e da smartphone: il calendario deve
  mostrare tutte e 25 le caselle (bloccate finché non è il loro giorno).
- Su Chrome Android, apri il menu (⋮) e controlla che compaia la voce
  "Installa app" (o "Aggiungi a schermata Home").
- Ricarica la pagina offline (modalità aereo) dopo averla visitata almeno
  una volta: dovrebbe continuare a funzionare grazie al service worker.

## Reminder Telegram — attivazione

Il reminder è **facoltativo**: se non lo configuri, il resto dell'app
funziona comunque. Il setup completo (creazione del bot, Secrets, test in
dry-run, primo invio reale) è descritto passo per passo nella
`GUIDA_PERSONALIZZAZIONE.md`. In sintesi:

1. Crea un bot con [@BotFather](https://t.me/BotFather) su Telegram e
   ottieni il token.
2. Ottieni il tuo `chat_id` (vedi guida) e avvia una conversazione con il
   bot (comando `/start`): senza questo passaggio Telegram non permette
   l'invio di messaggi privati.
3. Su GitHub: **Settings → Secrets and variables → Actions → New
   repository secret**, aggiungi `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.
4. Testa con **Actions → Reminder Telegram dell'avvento → Run workflow**,
   lasciando "Invia davvero" su `false` (dry-run): controlla i log.
5. Solo dopo aver verificato il dry-run, esegui di nuovo con "Invia
   davvero" su `true` per un invio reale di prova.

### ⚠️ Repository pubblici e GitHub Actions `schedule`

GitHub **disabilita automaticamente** i trigger `schedule` su un
repository pubblico dopo **60 giorni senza alcuna attività** (push,
commit, ecc.). Se durante dicembre il reminder smette improvvisamente di
arrivare:

- [ ] Vai sulla scheda **Actions** del repository e controlla se il
      workflow `Reminder Telegram dell'avvento` risulta disabilitato.
- [ ] Se sì, riattivalo manualmente da quella pagina.
- [ ] Fai un piccolo commit (anche solo nella documentazione) ogni tanto
      durante il periodo di utilizzo, per mantenere il repository attivo.
- [ ] In alternativa, usa `workflow_dispatch` per inviare manualmente il
      reminder dei giorni mancanti.

## Sicurezza e privacy (leggi con attenzione)

- Il repository è **pubblico**: chiunque può vedere il codice sorgente,
  tutti i testi del calendario e tutte le immagini pubblicate, comprese
  eventuali fotografie personali che aggiungi.
- Lo sblocco delle caselle in base alla data è **una regola di interfaccia
  pensata per l'esperienza narrativa, non una misura di sicurezza**: chi
  ispeziona il codice o il file `src/content/advent-content.json` può
  vedere tutti i contenuti futuri. Non inserire nulla che non vorresti
  fosse visto in anticipo o da altri.
- Non vengono raccolti analytics né dati personali: l'unico dato salvato
  (progresso, buoni riscattati, risultati quiz) resta in `localStorage`
  **sul dispositivo e nel browser dell'utente**, non sincronizzato altrove.
- Il token del bot Telegram e il chat ID vivono **solo** nei GitHub
  Actions Secrets: non vanno mai scritti nel codice, nei file JSON
  pubblici o in altri asset distribuiti dal sito.

## Troubleshooting

**La build fallisce con un errore su `config/app.json` / URL non valido.**
Controlla che `publicUrl` in `config/app.json` sia un URL completo e
valido (`https://...`), con lo slash finale.

**Le immagini non si vedono dopo il deploy.**
Verifica che `publicUrl` corrisponda esattamente all'URL reale di GitHub
Pages (incluso il nome del repository nel path). Se lo cambi, rifai la
build (`npm run build`) e ripubblica.

**L'app non si aggiorna dopo una nuova pubblicazione.**
Il service worker usa una cache versionata che cambia automaticamente ad
ogni build (`scripts/build-sw.mjs`), quindi di norma l'aggiornamento è
automatico all'apertura successiva. Se proprio non vedi le novità, forza
la ricarica (shift+ricarica su desktop) o disinstalla/reinstalla la PWA.

**Il reminder Telegram non arriva.**
Controlla, in ordine: che i Secrets siano configurati, che tu abbia
avviato una conversazione col bot, che oggi sia effettivamente tra il 1°
e il 25 dicembre a Roma, e che il workflow schedulato non sia stato
disabilitato per inattività (vedi sopra).

**Ho perso il progresso del calendario.**
I dati sono salvati solo in `localStorage`, sul dispositivo e nel browser
usati: cambiare dispositivo, browser, o cancellare i dati di
navigazione del sito, cancella anche il progresso.
