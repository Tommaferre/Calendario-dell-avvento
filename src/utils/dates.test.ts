import { describe, expect, it } from "vitest";
import { todayInRome, isUnlocked, compareDateStrings, formatDayLabel } from "./dates";

describe("todayInRome", () => {
  it("restituisce la data in formato YYYY-MM-DD", () => {
    const result = todayInRome(new Date("2026-12-05T12:00:00Z"));
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("converte correttamente un orario UTC tardo in data Europe/Rome (CET, UTC+1)", () => {
    // 2026-12-05T23:30:00Z è già 2026-12-06T00:30 a Roma (CET = UTC+1 a dicembre).
    const result = todayInRome(new Date("2026-12-05T23:30:00Z"));
    expect(result).toBe("2026-12-06");
  });

  it("non cambia giorno per un orario UTC presto nello stesso giorno Roma", () => {
    // 2026-12-05T10:00:00Z è 2026-12-05T11:00 a Roma: stesso giorno.
    const result = todayInRome(new Date("2026-12-05T10:00:00Z"));
    expect(result).toBe("2026-12-05");
  });
});

describe("compareDateStrings", () => {
  it("ordina correttamente le date YYYY-MM-DD", () => {
    expect(compareDateStrings("2026-12-01", "2026-12-02")).toBe(-1);
    expect(compareDateStrings("2026-12-02", "2026-12-01")).toBe(1);
    expect(compareDateStrings("2026-12-01", "2026-12-01")).toBe(0);
  });
});

describe("isUnlocked", () => {
  it("sblocca una casella la cui data è oggi", () => {
    const reference = new Date("2026-12-10T12:00:00Z");
    expect(isUnlocked("2026-12-10", reference)) .toBe(true);
  });

  it("sblocca una casella con data passata", () => {
    const reference = new Date("2026-12-10T12:00:00Z");
    expect(isUnlocked("2026-12-05", reference)).toBe(true);
  });

  it("NON sblocca una casella con data futura", () => {
    const reference = new Date("2026-12-10T12:00:00Z");
    expect(isUnlocked("2026-12-15", reference)).toBe(false);
  });

  it("gestisce il cambio di mese/anno correttamente", () => {
    expect(isUnlocked("2026-12-25", new Date("2027-01-01T12:00:00Z"))).toBe(true);
    expect(isUnlocked("2027-12-01", new Date("2026-12-31T12:00:00Z"))).toBe(false);
  });
});

describe("formatDayLabel", () => {
  it("formatta una data in italiano leggibile", () => {
    expect(formatDayLabel("2026-12-25")).toBe("25 dicembre");
    expect(formatDayLabel("2026-12-01")).toBe("1 dicembre");
  });
});
