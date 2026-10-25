import { describe, expect, it } from "vitest";
import { validateAdventContent, type AdventContent } from "./types";
import adventContent from "./advent-content.json";

describe("validateAdventContent", () => {
  it("non trova problemi nel file dei contenuti reale del progetto", () => {
    const issues = validateAdventContent(adventContent as AdventContent);
    expect(issues).toEqual([]);
  });

  it("contiene esattamente 25 giorni, da 1 a 25, senza duplicati", () => {
    const days = (adventContent as AdventContent).days.map((d) => d.day).sort((a, b) => a - b);
    expect(days).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it("include almeno una volta ciascuna delle 6 tipologie richieste", () => {
    const types = new Set((adventContent as AdventContent).days.map((d) => d.type));
    for (const t of ["message", "letter", "photo", "voucher", "quiz", "game"]) {
      expect(types.has(t as never)).toBe(true);
    }
  });

  it("segnala un giorno mancante", () => {
    const partial: AdventContent = {
      version: 1,
      days: (adventContent as AdventContent).days.filter((d) => d.day !== 5),
    };
    const issues = validateAdventContent(partial);
    expect(issues.some((i) => i.day === 5 && i.message.includes("Manca"))).toBe(true);
  });

  it("segnala un tipo non valido", () => {
    const broken: AdventContent = {
      version: 1,
      days: (adventContent as AdventContent).days.map((d) =>
        d.day === 1 ? { ...d, type: "invalid-type" as never } : d
      ),
    };
    const issues = validateAdventContent(broken);
    expect(issues.some((i) => i.day === 1 && i.message.includes("Tipo non valido"))).toBe(true);
  });

  it("segnala una data mal formattata", () => {
    const broken: AdventContent = {
      version: 1,
      days: (adventContent as AdventContent).days.map((d) =>
        d.day === 2 ? { ...d, date: "02-12-2026" } : d
      ),
    };
    const issues = validateAdventContent(broken);
    expect(issues.some((i) => i.day === 2 && i.message.includes("date"))).toBe(true);
  });

  it("segnala un giorno duplicato", () => {
    const original = adventContent as AdventContent;
    const broken: AdventContent = {
      version: 1,
      days: [...original.days, { ...original.days[0] }],
    };
    const issues = validateAdventContent(broken);
    expect(issues.some((i) => i.message.includes("duplicato"))).toBe(true);
  });
});
