import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../src/App.tsx';
import { adventContent } from '../src/content/index.ts';
import { LetterView } from '../src/components/renderers/LetterView.tsx';
import { MessageView } from '../src/components/renderers/MessageView.tsx';
import { PhotoView } from '../src/components/renderers/PhotoView.tsx';
import { QuizView } from '../src/components/renderers/QuizView.tsx';
import { RiddleGame } from '../src/components/renderers/RiddleGame.tsx';
import { VoucherView } from '../src/components/renderers/VoucherView.tsx';
import { MemoryGame } from '../src/components/renderers/MemoryGame.tsx';
import type { AdventDay } from '../src/content/types.ts';

const day = <T extends AdventDay['type']>(n: number, type: T) => adventContent.days[n - 1] as Extract<AdventDay, { type: T }>;
const setNow = (iso: string) => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date(iso)); };

beforeEach(() => { localStorage.clear(); window.history.replaceState(null, '', '/'); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('calendario', () => {
  it('mostra 25 caselle e sblocca in base alla data di Roma', () => {
    setNow('2026-12-07T08:00:00Z');
    render(<App />);
    expect(screen.getAllByRole('button', { name: /^Giorno \d+/ })).toHaveLength(25);
    expect(screen.getAllByRole('button', { name: /sorpresa disponibile/ })).toHaveLength(7);
    expect(screen.getByRole('button', { name: /Giorno 8: bloccato, si apre l’8 dicembre/ })).toBeInTheDocument();
  });
  it('apre una sorpresa, aggiorna il progresso e la ritrova dopo il rendering', async () => {
    setNow('2026-12-02T08:00:00Z');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Giorno 1: sorpresa disponibile/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: adventContent.days[0].title })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByText(/1 di 25 sorprese aperte/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem('christmas-advent')!).opened['1']).toBeTruthy();
  });
  it('una casella bloccata non si apre', async () => {
    setNow('2026-12-02T08:00:00Z');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await user.click(screen.getByRole('button', { name: /Giorno 20: bloccato/ }));
    expect(screen.getByText('Non ancora!')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: adventContent.days[19].title })).toBeNull();
  });
  it('?day=N rispetta lo sblocco', () => {
    setNow('2026-12-10T08:00:00Z');
    window.history.replaceState(null, '', '/?day=3');
    render(<App />);
    expect(screen.getByRole('heading', { name: adventContent.days[2].title })).toBeInTheDocument();
    cleanup();
    window.history.replaceState(null, '', '/?day=24');
    render(<App />);
    expect(screen.getByText('Non ancora!')).toBeInTheDocument();
  });
  it('recupera da dati malformati nello storage', () => {
    setNow('2026-12-02T08:00:00Z');
    localStorage.setItem('christmas-advent', '{non json');
    render(<App />);
    expect(screen.getByText(/0 di 25 sorprese aperte/)).toBeInTheDocument();
  });
  it('la modale intrappola il focus e lo restituisce alla chiusura', async () => {
    setNow('2026-12-02T08:00:00Z');
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    const box = screen.getByRole('button', { name: /Giorno 1: sorpresa disponibile/ });
    await user.click(box);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    for (let i = 0; i < 6; i++) { await user.tab(); expect(dialog.contains(document.activeElement)).toBe(true); }
    await user.keyboard('{Escape}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Giorno 1: già aperto/ }));
  });
});

describe('renderer', () => {
  it('messaggio e lettera (con regalo)', async () => {
    render(<MessageView content={day(1, 'message').content} />);
    expect(screen.getByText(/Buon primo dicembre/)).toBeInTheDocument();
    cleanup();
    render(<LetterView content={day(25, 'letter').content} />);
    await userEvent.click(screen.getByRole('button', { name: 'Scopri il regalo' }));
    expect(screen.getByText(day(25, 'letter').content.gift!.title)).toBeInTheDocument();
  });
  it('foto con fallback se il file manca', () => {
    render(<PhotoView content={day(3, 'photo').content} fallbackArt="assets/advent/day-03.svg" />);
    const img = screen.getByRole('img');
    img.dispatchEvent(new Event('error'));
    return screen.findByText(/non è disponibile/);
  });
  it('buono: riscatto e consultazione dopo l’uso', async () => {
    const onToggle = vi.fn();
    const c = day(4, 'voucher').content;
    const { rerender } = render(<VoucherView content={c} art="x.svg" redeemedAt={undefined} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Segna come usato' }));
    expect(onToggle).toHaveBeenCalled();
    rerender(<VoucherView content={c} art="x.svg" redeemedAt="2026-12-05T10:00:00Z" onToggle={onToggle} />);
    expect(screen.getByRole('status')).toHaveTextContent(/Buono usato il/);
    expect(screen.getByText(c.description)).toBeInTheDocument();
  });
  it('quiz: feedback, risultato e rigioca', async () => {
    const onFinish = vi.fn();
    const c = day(5, 'quiz').content;
    render(<QuizView content={c} onFinish={onFinish} />);
    for (let i = 0; i < c.questions.length; i++) {
      const q = c.questions[i];
      await userEvent.click(screen.getByRole('button', { name: q.options[q.correctIndex] }));
      expect(screen.getByText(q.correctFeedback)).toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: i === c.questions.length - 1 ? 'Vedi il risultato' : 'Avanti' }));
    }
    expect(onFinish).toHaveBeenCalledWith(5, 5);
    expect(screen.getByText(/5 domande su 5/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Rigioca' }));
    expect(screen.getByText(/Domanda 1 di 5/)).toBeInTheDocument();
  });
  it('indovinello: errore, indizio, successo, riprova', async () => {
    const onSolved = vi.fn();
    const c = day(7, 'game').content as Extract<typeof c0, { kind: 'riddle' }>;
    render(<RiddleGame content={c} onSolved={onSolved} />);
    await userEvent.type(screen.getByLabelText('La tua risposta'), 'sole');
    await userEvent.click(screen.getByRole('button', { name: 'Rispondi' }));
    expect(screen.getByText(c.wrongMessage)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /indizio/i }));
    expect(screen.getByText(/Indizio:/)).toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText('La tua risposta'));
    await userEvent.type(screen.getByLabelText('La tua risposta'), 'La neve');
    await userEvent.click(screen.getByRole('button', { name: 'Rispondi' }));
    expect(onSolved).toHaveBeenCalledWith(2);
    await userEvent.click(screen.getByRole('button', { name: 'Riprova' }));
    expect(screen.getByLabelText('La tua risposta')).toHaveValue('');
  });
  it('memory: renderizza tutte le carte coperte', () => {
    const c = day(10, 'game').content as Extract<typeof c0, { kind: 'memory' }>;
    render(<MemoryGame content={c} onComplete={() => {}} />);
    expect(screen.getAllByRole('button', { name: /coperta/ })).toHaveLength(c.pairs.length * 2);
  });
});
const c0 = day(7, 'game').content;
