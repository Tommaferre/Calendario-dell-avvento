import { describe, it, expect } from 'vitest';
import { currentCalendarDay, getZonedDateParts, isDayUnlocked, opensOnLabel, parseIsoDate } from '../src/lib/dates.ts';
import { parseDayParam, buildDayLink, getBasePath, normalizePublicUrl } from '../src/lib/links.ts';
import { readPreviewDate } from '../src/lib/preview.ts';

const TZ = 'Europe/Rome';
const today = (iso: string) => getZonedDateParts(new Date(iso), TZ);

describe('date in Europe/Rome', () => {
  it('usa il fuso di Roma e non UTC', () => {
    expect(today('2026-11-30T23:30:00Z')).toEqual({ year: 2026, month: 12, day: 1 });
    expect(today('2026-11-30T22:30:00Z')).toEqual({ year: 2026, month: 11, day: 30 });
  });
  it('sblocca i giorni giusti, uno alla volta, per tutte le 25 caselle', () => {
    for (let d = 1; d <= 25; d++) {
      const noon = `2026-12-${String(d).padStart(2, '0')}T11:00:00Z`;
      for (let day = 1; day <= 25; day++) expect(isDayUnlocked(day, today(noon), 2026)).toBe(day <= d);
    }
  });
  it('prima di dicembre nulla è sbloccato, dopo il 25 tutto lo è', () => {
    for (let d = 1; d <= 25; d++) expect(isDayUnlocked(d, today('2026-11-15T12:00:00Z'), 2026)).toBe(false);
    for (let d = 1; d <= 25; d++) expect(isDayUnlocked(d, today('2026-12-31T12:00:00Z'), 2026)).toBe(true);
  });
  it('cambio di anno', () => {
    expect(isDayUnlocked(25, today('2027-01-01T00:30:00+01:00'), 2026)).toBe(true);
    expect(isDayUnlocked(1, today('2025-12-31T23:59:00Z'), 2026)).toBe(false);
    expect(currentCalendarDay(today('2027-01-01T10:00:00Z'), 2026)).toBeNull();
  });
  it('giorno corrente', () => {
    expect(currentCalendarDay({ year: 2026, month: 12, day: 7 }, 2026)).toBe(7);
    expect(currentCalendarDay({ year: 2026, month: 12, day: 26 }, 2026)).toBeNull();
    expect(currentCalendarDay({ year: 2026, month: 11, day: 7 }, 2026)).toBeNull();
  });
  it('parseIsoDate rifiuta date impossibili', () => {
    expect(parseIsoDate('2026-12-07')).toEqual({ year: 2026, month: 12, day: 7 });
    expect(parseIsoDate('2026-02-31')).toBeNull();
    expect(parseIsoDate('boh')).toBeNull();
  });
  it('articolo corretto', () => {
    expect(opensOnLabel(7)).toBe('il 7 dicembre');
    expect(opensOnLabel(8)).toBe('l’8 dicembre');
    expect(opensOnLabel(11)).toBe('l’11 dicembre');
  });
});

describe('link e base path', () => {
  it('repository GitHub Pages', () => {
    expect(getBasePath('https://utente.github.io/nome-repo/')).toBe('/nome-repo/');
    expect(getBasePath('https://utente.github.io/nome-repo')).toBe('/nome-repo/');
    expect(getBasePath('https://miodominio.it/')).toBe('/');
    expect(buildDayLink('https://utente.github.io/nome-repo', 7)).toBe('https://utente.github.io/nome-repo/?day=7');
    expect(normalizePublicUrl('https://u.github.io/r/?x=1#y')).toBe('https://u.github.io/r/');
  });
  it('parametro day', () => {
    expect(parseDayParam('?day=7')).toBe(7);
    expect(parseDayParam('?day=25')).toBe(25);
    for (const bad of ['', '?day=0', '?day=26', '?day=abc', '?day=7;drop', '?day=-1', '?day=007']) expect(parseDayParam(bad)).toBeNull();
  });
});

describe('modalità anteprima', () => {
  it('legge la data solo se abilitata (mai in produzione)', () => {
    expect(readPreviewDate('?preview=2026-12-10', true)).toEqual({ year: 2026, month: 12, day: 10 });
    expect(readPreviewDate('?preview=2026-12-10', false)).toBeNull();
    expect(readPreviewDate('?preview=xx', true)).toBeNull();
  });
});
