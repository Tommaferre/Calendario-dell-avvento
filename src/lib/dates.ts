/**
 * Gestione delle date nel fuso orario del calendario (Europe/Rome).
 * Nessun confronto tra stringhe e nessun uso dell'ora UTC del browser:
 * si estraggono anno/mese/giorno "a muro" nel fuso richiesto con Intl.
 * File foglia: importato anche da Node.
 */

export interface DateParts { year: number; month: number; day: number }

export function getZonedDateParts(date: Date, timeZone: string): DateParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: 'numeric', day: 'numeric',
  }).formatToParts(date);
  const pick = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { year: pick('year'), month: pick('month'), day: pick('day') };
}

export function getZonedHourMinute(date: Date, timeZone: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(date);
  const pick = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { hour: pick('hour'), minute: pick('minute') };
}

/** Numero confrontabile: 20261207. */
export const dateKey = (p: DateParts): number => p.year * 10000 + p.month * 100 + p.day;

/** Un giorno del calendario è sbloccato quando "oggi" (a Roma) ha raggiunto il suo 'dicembre'. */
export function isDayUnlocked(day: number, today: DateParts, calendarYear: number): boolean {
  return dateKey(today) >= calendarYear * 10000 + 1200 + day;
}

/** Il giorno "corrente" del calendario (1–25) oppure null se siamo fuori periodo. */
export function currentCalendarDay(today: DateParts, calendarYear: number, first = 1, last = 25): number | null {
  if (today.year !== calendarYear || today.month !== 12) return null;
  return today.day >= first && today.day <= last ? today.day : null;
}

export function parseIsoDate(iso: string): DateParts | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const parts = { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const valid = check.getUTCFullYear() === parts.year && check.getUTCMonth() === parts.month - 1 && check.getUTCDate() === parts.day;
  return valid ? parts : null;
}

export const formatIso = (p: DateParts): string =>
  `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;

/** "7 dicembre" */
export function formatDayMonth(day: number): string {
  return `${day} dicembre`;
}

/** "il 7 dicembre", "l’8 dicembre", "l’11 dicembre": articolo corretto per la frase «si apre …». */
export function opensOnLabel(day: number): string {
  return `${day === 8 || day === 11 ? 'l’' : 'il '}${day} dicembre`;
}
