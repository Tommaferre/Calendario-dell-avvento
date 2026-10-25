// Utilità per il confronto di date nel fuso Europe/Rome.
//
// Perché non usiamo semplicemente `new Date()` e confronti di stringhe:
// il dispositivo dell'utente potrebbe essere in un fuso diverso, e le
// stringhe ISO prodotte da `toISOString()` sono sempre in UTC. Usiamo
// `Intl.DateTimeFormat` con `timeZone: 'Europe/Rome'` per ottenere la
// data "civile" corrente a Roma, indipendentemente dal fuso del device.

const TIMEZONE = "Europe/Rome";

/**
 * Ritorna la data odierna a Roma come stringa YYYY-MM-DD,
 * indipendentemente dal fuso orario del dispositivo dell'utente.
 */
export function todayInRome(referenceDate: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  // "en-CA" produce direttamente il formato YYYY-MM-DD.
  return formatter.format(referenceDate);
}

/**
 * Confronta due date in formato YYYY-MM-DD come stringhe: funziona
 * correttamente perché il formato è a larghezza fissa e ordinabile
 * lessicograficamente.
 */
export function compareDateStrings(a: string, b: string): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * Determina se una casella del giorno `dayDate` (YYYY-MM-DD) è sbloccata,
 * cioè se la data odierna a Roma è uguale o successiva a `dayDate`.
 *
 * IMPORTANTE: questo è un controllo lato interfaccia, pensato per
 * un'esperienza narrativa (non aprire tutto subito). Non è, e non
 * vuole essere, una misura di sicurezza: chiunque ispezioni il codice
 * client può aggirarlo. Vedi la sezione dedicata nella guida di
 * personalizzazione e nel README.
 */
export function isUnlocked(dayDate: string, referenceDate: Date = new Date()): boolean {
  return compareDateStrings(todayInRome(referenceDate), dayDate) >= 0;
}

export function formatDayLabel(dayDate: string): string {
  const [, month, day] = dayDate.split("-").map(Number);
  const months = [
    "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
    "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
  ];
  return `${day} ${months[month - 1]}`;
}
