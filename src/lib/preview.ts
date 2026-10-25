import { parseIsoDate, type DateParts } from './dates.ts';

/** L'anteprima esiste solo in sviluppo (npm run dev); nella build di produzione è sempre disattivata. */
export const PREVIEW_AVAILABLE: boolean = import.meta.env.DEV === true;

/** Legge ?preview=YYYY-MM-DD, ma solo se l'anteprima è abilitata. */
export function readPreviewDate(search: string, enabled: boolean = PREVIEW_AVAILABLE): DateParts | null {
  if (!enabled) return null;
  const raw = new URLSearchParams(search).get('preview');
  return raw ? parseIsoDate(raw) : null;
}
