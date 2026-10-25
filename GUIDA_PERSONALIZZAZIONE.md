# Guida alla personalizzazione

Tutto il contenuto vive in due file: **`config/app.json`** (impostazioni) e **`src/content/advent-content.json`** (i 25 giorni).
Dopo ogni modifica esegui `npm run validate`: ti dice esattamente quale giorno e quale campo sono sbagliati.
Nel JSON usa `« »` o `’` nei testi; un `"` dentro una stringa va scritto `\"`.

## 1. Nome dell'app e dedica iniziale

File: `src/content/advent-content.json`, blocco `meta` (in alto).

```diff
-    "title": "Il nostro dicembre",
+    "title": "Il calendario di Giulia",
-    "dedication": ["Venticinque giorni, venticinque piccole sorprese.", "Questo calendario è il mio modo…"],
+    "dedication": ["Per te, giorno dopo giorno.", "Aprine una al giorno e non avere fretta."],
```

Il nome sotto l'icona dell'app è in `config/app.json`:

```diff
-  "appName": "Il nostro dicembre",
-  "shortName": "Dicembre",
+  "appName": "Il calendario di Giulia",
+  "shortName": "Giulia",
```

## 2. Anno

Esegui `npm run set-year -- 2027`: aggiorna `year` in `config/app.json` e le 25 date. Rileggi poi i testi che citano il
solstizio (giorno 21) o giorni specifici. A mano: `config/app.json` → `"year": 2026` e il campo `"date"` di ogni giorno.

## 3. URL del sito

File: `config/app.json`. È l'**unico** punto: lo usano la build (base path), il manifest e i link di Telegram.

```diff
-  "publicUrl": "https://UTENTE.github.io/christmas-advent/",
+  "publicUrl": "https://giulio.github.io/nostro-dicembre/",
```

## 4. Testo di un giorno

File: `src/content/advent-content.json`, cerca `"day": 9`.

```diff
       "content": { "paragraphs": [
-        "Se oggi fuori fa freddo, ricordati che…",
+        "Oggi ti ho pensata appena sveglio.",
+        "Metti la sciarpa grande e torna a casa presto."
       ] }
```

Ogni giorno ha: `title`, `preview`, `illustration`, `type`, `content` e `reminder` (il testo del messaggio Telegram, max 300 caratteri,
diverso per ogni giorno). Il `type` decide quali campi servono dentro `content` (vedi sezioni seguenti).

## 5. Sostituire un'illustrazione con una fotografia

Le illustrazioni dei giorni sono in `public/assets/advent/day-NN.svg`. Per usare una foto al posto dell'illustrazione:

1. Copia la foto in `public/assets/advent/` come `day-09.jpg`.
2. Nel JSON, giorno 9:

```diff
-      "illustration": "assets/advent/day-09.svg",
+      "illustration": "assets/advent/day-09.jpg",
```

I percorsi sono sempre **relativi a `public/`**, senza `/` iniziale e senza `http`.

## 6. Aggiungere, rinominare, ottimizzare una fotografia

I giorni di tipo `photo` (3, 11, 19) mostrano `content.image`.

1. **Ottimizza**: lato lungo ~1600 px, JPEG qualità 80 (o WebP), meglio sotto i 400 KB. Esempio con ImageMagick:
   `magick originale.jpg -resize 1600x1600 -quality 80 -strip public/assets/photos/mare-estate.jpg`
2. **Nome**: minuscolo, senza spazi né accenti (`mare-estate.jpg`).
3. **Collega** nel JSON (giorno 11):

```diff
       "content": {
-        "image": "assets/photos/luci-della-citta.svg",
-        "alt": "Illustrazione di una città di sera…",
-        "caption": "A dicembre ogni finestra accesa…"
+        "image": "assets/photos/mare-estate.jpg",
+        "alt": "Noi due sulla spiaggia al tramonto",
+        "caption": "Il giorno in cui ho capito che il mare è più bello con te."
       }
```

`alt` descrive la foto per chi usa uno screen reader; la `caption` è la dedica. Se il file manca, l'app mostra
un'illustrazione di riserva con un messaggio gentile. Ricorda: le foto nel repository pubblico sono raggiungibili da tutti
tramite l'URL. Per trasformare un altro giorno in una foto: cambia `"type": "photo"` e il suo `content` come sopra.

## 7. Buoni

Giorni 4, 8, 13, 17, 22 (`"type": "voucher"`).

```diff
       "content": {
-        "title": "Buono per una cioccolata calda",
-        "description": "Valido per una cioccolata calda fatta come si deve…",
-        "redeem": "Quando vuoi usarlo, fammelo sapere…",
-        "validity": "Valido fino all’Epifania."
+        "title": "Buono per un massaggio ai piedi",
+        "description": "Venti minuti, olio profumato, nessuna protesta.",
+        "redeem": "Mostrami il buono e premi «Segna come usato».",
+        "validity": "Valido fino a febbraio."
       }
```

`validity` è facoltativo. Lo **stato** (usato/non usato) è salvato nel telefono, non nel JSON. Per azzerarlo durante i test:
nel browser, `Impostazioni sito → Cancella dati`, oppure dalla console `localStorage.removeItem('christmas-advent')`.
Il tasto *Segna come non usato* nella finestra del buono lo riporta indietro. Il buono resta consultabile anche dopo l'uso.

## 8. Quiz (domande e risposte)

Giorni 5, 12, 20 (`"type": "quiz"`). Ogni domanda:

```json
{ "question": "Quale colore ha il nastro del mio regalo?",
  "options": ["Rosso", "Oro", "Verde"],
  "correctIndex": 1,
  "correctFeedback": "Esatto, oro!",
  "wrongFeedback": "Era oro, guarda meglio la prossima volta." }
```

`correctIndex` conta da **0** (0 = prima risposta). Da 2 a 5 risposte per domanda. In `results` ogni voce ha un `minScore`:
la prima deve essere `0`, poi crescenti, mai oltre il numero di domande. Per personalizzare con ricordi veri, sostituisci
le domande generiche con le vostre (es. «Dove ci siamo dati il primo appuntamento?»).

## 9. Indovinello

Giorni 7, 15, 21 (`"type": "game"`, `"kind": "riddle"`).

```diff
         "kind": "riddle",
-        "riddle": "Scende dal cielo senza fare rumore…",
-        "answers": ["neve", "fiocchi di neve", "fiocco di neve"],
-        "hint": "Quando arriva, tutto intorno si fa silenzioso.",
+        "riddle": "Più ne togli, più diventa grande. Cos'è?",
+        "answers": ["buco", "il buco"],
+        "hint": "Lo trovi nel formaggio.",
```

In `answers` metti tutte le risposte accettate: maiuscole, accenti, punteggiatura e articoli iniziali (il, la, un…) vengono ignorati.
`hint` è facoltativo. `revealText`, `successMessage`, `wrongMessage` sono i messaggi.

## 10. Memory

Giorni 10 e 18 (`"kind": "memory"`). Da 3 a 10 coppie (6 coppie = 12 carte).

```diff
         "pairs": [
           { "id": "star", "label": "Stella", "image": "assets/decor/star.svg" },
-          { "id": "heart", "label": "Cuore", "image": "assets/decor/heart.svg" }
+          { "id": "photo1", "label": "Noi al mare", "image": "assets/photos/mare-estate.jpg" }
```

Ogni `id` deve essere diverso. Immagini quadrate funzionano meglio. `label` è letto dagli screen reader.
Disponibili in `public/assets/decor/`: star, bell, candy-cane, tree, gift, heart, wreath, mitten, candle, snowflake, ornament, stocking.

## 11. Lettera finale del 25 dicembre

Giorno 25 (`"type": "letter"`). Per le altre lettere (14, 23) valgono gli stessi campi.

```diff
         "greeting": "Amore mio,",
         "paragraphs": [
-          "eccoci arrivati in fondo a questo calendario…",
+          "Questo Natale è il primo in cui…",
         ],
         "closing": "Buon Natale, con tutto il cuore,",
         "signature": "Il tuo ragazzo",
         "gift": {
-          "title": "Il regalo che non si scarta",
-          "description": "Dodici appuntamenti, uno al mese…"
+          "title": "Un weekend a Praga",
+          "description": "Partiamo a febbraio. Biglietti già prenotati."
         }
```

Ogni elemento di `paragraphs` è un paragrafo. `gift` è facoltativo: appare come pulsante «Scopri il regalo» sotto la lettera.

## 12. Colori e stile

File: `src/styles.css`, blocco `:root` in alto.

```diff
-  --bordeaux: #7b2233;
+  --bordeaux: #5a2a6b;
```

Per la PWA (barra del telefono e sfondo di avvio) cambia anche `themeColor` e `backgroundColor` in `config/app.json`.
Le illustrazioni usano la loro palette in `scripts/generate-assets.mjs` (oggetto `C`): modificala e lancia `npm run assets`
(le icone PNG richiedono il pacchetto `sharp`: `npm i -D sharp` solo se vuoi rigenerarle).

## 13. Modalità anteprima

`npm run dev`, poi in basso a sinistra compare il pannello **Anteprima**: scegli una data (es. 12 dicembre) e le caselle
si sbloccano di conseguenza. In alternativa apri `http://localhost:5173/?preview=2026-12-12`.
La modalità esiste **solo in sviluppo**: nella versione pubblicata non c'è e `?preview=` è ignorato.
Per ripartire da zero svuota i dati del sito di `localhost`.

## 14. Aggiornare e ripubblicare

```bash
npm run check          # facoltativo ma consigliato
git add -A && git commit -m "Aggiorno i contenuti" && git push
```

Il push sul branch `main` avvia il deploy (1–2 minuti, controlla la scheda *Actions*).
**Sul telefono**: apri l'app; quando compare «È disponibile una versione aggiornata» tocca **Aggiorna**.
Se non compare, chiudi del tutto l'app e riaprila (a volte serve due volte).

## 15. Bot Telegram, Secrets, prove e invio reale

I passaggi completi (BotFather, `/start`, chat id, Secrets) sono nel **README → Reminder Telegram**. In sintesi:

1. Crea il bot con @BotFather, copia il token.
2. La destinataria preme **Avvia** sul bot.
3. *Settings → Secrets and variables → Actions → New repository secret*: `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`.
4. **Dry-run** (non invia nulla): *Actions → Advent reminder → Run workflow* → `day` = 7, `dry_run` = `true`. Leggi il log.
5. **Invio reale di prova**: stessa schermata con `dry_run` = `false`: arriva un messaggio «🧪 [PROVA]» con il pulsante *Apri la sorpresa*.
6. **Verifica del workflow pianificato**: scheda *Actions → Advent reminder* attiva e senza avvisi, repository con attività recente
   (vedi la checklist nel README). Il primo run reale è il 1° dicembre dopo le 09:07.

In locale puoi provare lo script senza inviare nulla:

```bash
EVENT_NAME=workflow_dispatch REMINDER_DAY=7 DRY_RUN=true node --experimental-strip-types scripts/send-advent-reminder.mjs
```

Il testo di ogni messaggio è il campo `reminder` del giorno in `advent-content.json`, e il link viene costruito da `publicUrl`:

```diff
-      "reminder": "Buongiorno ❄️ Oggi ti aspetta un indovinello…",
+      "reminder": "Buongiorno amore ❄️ Oggi c’è un indovinello solo per te.",
```

## 16. Aggiornare la PWA dopo una nuova pubblicazione

Ogni build produce una nuova versione della cache (cambia al variare dei file). Il telefono la scarica in background e
mostra il banner **Aggiorna**; non si ricarica mai da solo mentre stai guardando una sorpresa. Se il banner non appare:
chiudi l'app dai recenti e riaprila con la connessione attiva.

## Aggiungere una nuova tipologia o un nuovo gioco

Aggiungi il tipo in `src/content/types.ts` (tipi + validazione), il renderer in `src/components/renderers/` e il `case`
in `src/components/SurpriseModal.tsx`. La logica di gioco va in `src/games/` (funzioni pure, facili da testare).
