/** Costruzione e lettura dei link (base path di GitHub Pages incluso). File foglia: usato anche da Node. */

/** Normalizza l'URL pubblico garantendo lo slash finale: https://utente.github.io/repo/ */
export function normalizePublicUrl(publicUrl: string): string {
  const u = new URL(publicUrl);
  u.search = '';
  u.hash = '';
  if (!u.pathname.endsWith('/')) u.pathname += '/';
  return u.href;
}

/** Base path per Vite: "/repo/" oppure "/" per un dominio radice. */
export function getBasePath(publicUrl: string): string {
  return new URL(normalizePublicUrl(publicUrl)).pathname;
}

/** Link diretto a una casella: https://utente.github.io/repo/?day=7 */
export function buildDayLink(publicUrl: string, day: number): string {
  const u = new URL(normalizePublicUrl(publicUrl));
  u.searchParams.set('day', String(day));
  return u.href;
}

/** Legge ?day=N dalla query string; restituisce null se assente o fuori intervallo. */
export function parseDayParam(search: string, first = 1, last = 25): number | null {
  const raw = new URLSearchParams(search).get('day');
  if (raw === null || !/^\d{1,2}$/.test(raw)) return null;
  const n = Number(raw);
  return n >= first && n <= last ? n : null;
}

/** True se l'URL pubblico è ancora quello di esempio. */
export function isPlaceholderUrl(publicUrl: string): boolean {
  return /UTENTE|example\.(com|org)/.test(publicUrl);
}
