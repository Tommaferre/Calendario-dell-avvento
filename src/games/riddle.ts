/** Normalizza una risposta: minuscole, senza accenti/punteggiatura/articoli iniziali. */
export function normalizeAnswer(input: string): string {
  let s = input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/^(il|lo|la|l|i|gli|le|un|uno|una|di|del|della|dello)\s+/, '');
  s = s.replace(/^(il|lo|la|l|un|una)\s+/, '');
  return s;
}

export function checkRiddle(input: string, answers: string[]): boolean {
  const n = normalizeAnswer(input);
  if (!n) return false;
  return answers.some((a) => normalizeAnswer(a) === n);
}
