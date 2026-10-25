# Guida alla personalizzazione

Questa guida spiega, punto per punto, dove modificare ogni parte del
calendario. Ogni sezione indica il file esatto da aprire e un esempio
prima/dopo.

---

## 1. Nome dell'app e dedica iniziale

**File:** `config/app.json`

```diff
- "appTitle": "Il nostro dicembre",
- "dedication": "25 giorni, 25 piccoli pezzi di noi. ...",
+ "appTitle": "Il nostro Natale",
+ "dedication": "Per te, che rendi speciale anche dicembre. ...",
```

## 2. Cambiare l'anno

**File:** `config/app.json`, campo `"year"`.

```diff
- "year": 2026,
+ "year": 2027,
```

Dopo aver cambiato l'anno, rigenera le date dei 25 contenuti eseguendo
`npm run content:build` (vedi sezione 4 per i dettagli), perché le date
in `src/content/advent-content.json` sono derivate dall'anno al momento
della generazione.

## 3. Configurare l'URL del sito

**File:** `config/app.json`, campo `"publicUrl"`.

```diff
- "publicUrl": "https://TUO-UTENTE.github.io/christmas-advent/",
+ "publicUrl": "https://marioRossi.github.io/avvento-per-giulia/",
```

Questo singolo valore controlla automaticamente:
- il "base path" usato da Vite in `vite.config.ts`;
- il base path usato dal service worker (`scripts/build-sw.mjs`);
- il link che lo script Telegram costruisce per ogni giorno.

Dopo averlo cambiato, esegui `npm run build` per rigenerare tutto
correttamente.

## 4. Modificare il testo di uno specifico giorno

**File:** `src/content/advent-content.json` (il file "vivo", quello
letto dall'app) — oppure, se preferisci lavorare sul file sorgente più
leggibile, `scripts/build-content.mjs` e poi rigenerare con
`npm run content:build`.

Esempio: cambiare il messaggio del giorno 4 direttamente nel JSON:

```diff
  {
    "day": 4,
    "date": "2026-12-04",
    "type": "message",
    "title": "Piccola pausa",
    "preview": "Tre righe per ricordarti una cosa semplice.",
-   "body": "Tra una cosa e l'altra della giornata, volevo solo...",
+   "body": "Oggi penso solo a quanto mi piace il tuo modo di ridere.",
    "illustration": "assets/advent/day-04.svg"
  },
```

**Importante:** se modifichi `src/content/advent-content.json` a mano, i
tuoi cambiamenti andranno persi se in futuro rilanci
`npm run content:build` (che lo rigenera da `scripts/build-content.mjs`).
Scegli un solo "luogo della verità": o modifichi sempre il JSON a mano, o
modifichi sempre `scripts/build-content.mjs` e rigeneri.

## 5. Sostituire un'illustrazione con una fotografia

1. Metti la tua foto in `public/assets/photos/`, per esempio
   `public/assets/photos/giorno-04.jpg`.
2. Nel contenuto del giorno, cambia il campo `illustration`:

```diff
  {
    "day": 4,
    ...
-   "illustration": "assets/advent/day-04.svg"
+   "illustration": "assets/photos/giorno-04.jpg"
  },
```

Se il file manca o il percorso è sbagliato, la modal mostra comunque il
titolo e il testo: l'immagine semplicemente non appare (fallback
"silenzioso", nessun errore bloccante).

## 6. Aggiungere, rinominare e ottimizzare una fotografia

- Metti i file in `public/assets/photos/` con un nome descrittivo e senza
  spazi, per esempio `montagna-ottobre-2025.jpg` (evita spazi e accenti
  nei nomi file: usa trattini).
- Formati consigliati: `.jpg` o `.webp`. Per non appesantire il sito,
  ridimensiona le foto a un lato massimo di circa 1600px prima di
  caricarle (puoi usare qualsiasi editor o convertitore che preferisci).
- Ricorda: essendo il repository pubblico, queste foto sono raggiungibili
  da chiunque conosca o indovini l'URL esatto del file.

## 7. Modificare un buono (voucher) e il suo stato

**File:** `src/content/advent-content.json`, nel giorno con
`"type": "voucher"`.

```diff
  "voucher": {
-   "instructions": "Mostrami questa pagina quando vuoi riscuotere...",
-   "redeemLabel": "Segna come riscattato",
-   "redeemedLabel": "Riscattato — e rifarei tutto identico"
+   "instructions": "Scrivimi quando vuoi usare questo buono!",
+   "redeemLabel": "Ho usato il buono",
+   "redeemedLabel": "Usato, e rifarei tutto identico"
  }
```

Lo **stato** "riscattato" invece non si modifica nel JSON: è salvato in
`localStorage` quando l'utente tocca il pulsante nell'app. Per
"resettare" un buono già riscattato durante i test, apri gli strumenti
sviluppatore del browser e cancella la chiave `christmas-advent:v1` da
Local Storage (oppure cancella i dati del sito).

## 8. Cambiare domande e risposte del quiz

**File:** `src/content/advent-content.json`, nei giorni con
`"type": "quiz"` (campo `quiz.questions`).

```diff
  {
    "question": "Qual è il modo migliore per iniziare una domenica insieme?",
    "options": ["Colazione con calma", "Sveglia presto per uscire", "Film sul divano", "Dipende dall'umore"],
-   "correctIndex": 3,
-   "feedbackCorrect": "Esatto: con noi dipende sempre dall'umore...",
-   "feedbackWrong": "Quasi! La verità è che con noi cambia sempre..."
+   "correctIndex": 0,
+   "feedbackCorrect": "Sì! La colazione con calma è imbattibile.",
+   "feedbackWrong": "Quasi, ma per me vince sempre la colazione con calma."
  }
```

`correctIndex` è la posizione (si parte da 0) dell'opzione corretta
nell'array `options`.

## 9. Configurare un indovinello

**File:** `src/content/advent-content.json`, nei giorni con
`"type": "game"` e `"game": { "kind": "riddle", ... }`.

```diff
  "game": {
    "kind": "riddle",
    "data": {
      "intro": "Leggi con calma, poi scrivi la tua risposta.",
-     "riddleText": "Più lo nutri, più cresce in silenzio...",
-     "acceptedAnswers": ["amore", "l'amore", "affetto", "fiducia"],
-     "hint": "Non è qualcosa che si compra...",
-     "solutionReveal": "La risposta era: l'amore..."
+     "riddleText": "Sono dolce, ma non si mangia. Cosa sono?",
+     "acceptedAnswers": ["un bacio", "bacio"],
+     "hint": "C'entrano le labbra.",
+     "solutionReveal": "La risposta era: un bacio!"
    }
  }
```

Puoi inserire più varianti accettate in `acceptedAnswers`: il confronto
ignora maiuscole/minuscole, accenti e spazi iniziali/finali.

## 10. Modificare il memory

**File:** `src/content/advent-content.json`, nel giorno con
`"type": "game"` e `"game": { "kind": "memory", ... }`.

```diff
  "game": {
    "kind": "memory",
    "data": {
      "intro": "Gira due carte alla volta e trova tutte le coppie.",
-     "symbols": ["🎄", "🎁", "⭐", "🔔", "❄️", "🕯️", "🧦", "🦌"]
+     "symbols": ["🎄", "🎁", "⭐", "🔔", "❄️", "🕯️", "🧦", "💛"]
    }
  }
```

Ogni simbolo nell'array genera una coppia di carte: con 8 simboli ottieni
16 carte (una griglia 4×4).

## 11. Modificare la lettera finale del 25 dicembre

**File:** `src/content/advent-content.json`, giorno `25`
(`"special": true`).

```diff
  {
    "day": 25,
    "special": true,
    "title": "Buon Natale, amore mio",
-   "body": "Siamo arrivati fino a qui, casella dopo casella...",
+   "body": "Il tuo testo personalizzato per il 25 dicembre...",
    "illustration": "assets/advent/day-25.svg"
  }
```

La grafica speciale del 25 dicembre è sempre `assets/advent/day-25-special.svg`
(gestita automaticamente quando `"special": true`), indipendentemente dal
campo `illustration` di quel giorno.

## 12. Cambiare i colori e lo stile

**File:** `src/styles/global.css`, variabili in cima al file (`:root`).

```diff
  :root {
-   --fir: #1f4d3a;
-   --bordeaux: #7a2335;
-   --gold: #c9a24b;
+   --fir: #0f3d5c;      /* es. blu notte al posto del verde abete */
+   --bordeaux: #7a2335;
+   --gold: #c9a24b;
```

Tutti gli altri colori dei componenti derivano da queste variabili, quindi
cambiandole aggiorni l'intera palette in modo coerente.

## 13. Usare la modalità anteprima

In sviluppo (`npm run dev`), in cima alla pagina trovi una barra "Modalità
anteprima (solo sviluppo)" con un menu a tendina: scegli un giorno di
dicembre e l'app si comporta come se oggi fosse quel giorno, senza dover
aspettare o cambiare l'orologio del dispositivo. Questa barra **non
esiste** nella build pubblicata (`npm run build` / sito online): è stata
rimossa automaticamente dal codice di produzione.

## 14. Aggiornare e ripubblicare l'app

1. Fai le tue modifiche ai file.
2. (facoltativo ma consigliato) `npm test` per assicurarti che nulla si
   sia rotto.
3. `git add . && git commit -m "Aggiorno i contenuti" && git push`
4. Il workflow `deploy.yml` ripubblica automaticamente il sito in pochi
   minuti. Nessun comando manuale aggiuntivo è necessario.

## 15. Configurare il bot Telegram

1. Apri Telegram e scrivi a [@BotFather](https://t.me/BotFather).
2. Invia `/newbot`, scegli un nome e uno username per il bot. BotFather ti
   restituirà un **token** nel formato `123456789:ABCdefGhIJKlmNoPQRstuVWxyz`.
3. Ottieni il tuo `chat_id`: il modo più semplice è scrivere un messaggio
   al tuo nuovo bot (qualsiasi testo, anche "ciao"), poi aprire nel
   browser:
   `https://api.telegram.org/bot<IL_TUO_TOKEN>/getUpdates`
   e cercare il campo `"chat":{"id": ...}` nella risposta JSON: quel
   numero è il tuo `chat_id`.
4. **Fondamentale:** devi aver scritto almeno un messaggio al bot (comando
   `/start` o un testo qualsiasi) prima che possa scriverti lui: è una
   regola di Telegram, non di questo progetto.

## 16. Aggiungere i GitHub Actions Secrets

1. Sul repository GitHub: **Settings → Secrets and variables → Actions**.
2. **New repository secret** → nome `TELEGRAM_BOT_TOKEN`, valore il token
   ottenuto da BotFather.
3. **New repository secret** → nome `TELEGRAM_CHAT_ID`, valore il tuo
   chat id.
4. Non inserire mai questi valori nel codice, in `config/app.json` o in
   qualunque altro file del repository.

## 17. Eseguire un test manuale in dry-run

Dalla scheda **Actions** del repository su GitHub:

1. Apri il workflow **"Reminder Telegram dell'avvento"**.
2. Clicca **Run workflow**.
3. Nel campo "Giorno da testare" scrivi un numero da 1 a 25 (es. `5`).
4. Lascia **"Invia davvero" su `false`** (è il default).
5. Avvia ed esamina i log: vedrai il testo esatto del messaggio e il link
   generato, ma **nessun messaggio Telegram reale verrà inviato**.

In locale puoi fare lo stesso con:

```bash
node scripts/send-advent-reminder.mjs --day=5 --dry-run
```

## 18. Effettuare un invio reale di prova

Stessa procedura del punto 17, ma impostando **"Invia davvero" su
`true`**. Lo script invierà davvero il messaggio del giorno scelto al tuo
`chat_id`. In locale (solo per un test rapido, con le variabili
esportate temporaneamente nella tua shell):

```bash
TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=... node scripts/send-advent-reminder.mjs --day=5 --send
```

## 19. Verificare il workflow pianificato

- Vai su **Actions → Reminder Telegram dell'avvento** e controlla che
  esistano esecuzioni passate (quelle schedulate compaiono con l'icona
  dell'orologio).
- Se non vedi esecuzioni programmate da un po' di tempo, controlla la nota
  sui 60 giorni di inattività nel README: GitHub potrebbe aver disattivato
  lo schedule.
- Puoi sempre forzare un invio dei giorni mancanti con `workflow_dispatch`
  (punto 18).

## 20. Aggiornare la PWA dopo una nuova pubblicazione

Non serve fare nulla di manuale: ogni build genera automaticamente una
nuova versione della cache del service worker
(`scripts/build-sw.mjs`, eseguito da `npm run build` prima di `vite
build`). Alla prossima apertura dell'app, il service worker scarica in
background la nuova versione e la rende attiva. Se un dispositivo sembra
"bloccato" su una versione vecchia, chiudi completamente l'app (o il tab)
e riaprila.
