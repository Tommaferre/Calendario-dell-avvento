import { describe, expect, it } from "vitest";
import {
  loadConfig,
  loadContent,
  getDay,
  buildDayUrl,
  buildReminderMessage,
  validateContent,
  todayInRome,
} from "./content.mjs";

describe("loadConfig / loadContent", () => {
  it("carica la configurazione dell'app", () => {
    const config = loadConfig();
    expect(config.year).toBe(2026);
    expect(config.timezone).toBe("Europe/Rome");
  });

  it("carica i 25 contenuti e non trova problemi di validazione", () => {
    const content = loadContent();
    expect(content.days).toHaveLength(25);
    expect(validateContent(content)).toEqual([]);
  });
});

describe("getDay", () => {
  it("trova il contenuto del giorno richiesto", () => {
    const content = loadContent();
    const day7 = getDay(content, 7);
    expect(day7).not.toBeNull();
    expect(day7.day).toBe(7);
  });

  it("ritorna null per un giorno inesistente", () => {
    const content = loadContent();
    expect(getDay(content, 99)).toBeNull();
  });
});

describe("buildDayUrl", () => {
  it("costruisce correttamente il link con parametro ?day=", () => {
    expect(buildDayUrl("https://utente.github.io/repo/", 7)).toBe(
      "https://utente.github.io/repo/?day=7"
    );
  });

  it("aggiunge lo slash finale se mancante", () => {
    expect(buildDayUrl("https://utente.github.io/repo", 12)).toBe(
      "https://utente.github.io/repo/?day=12"
    );
  });
});

describe("buildReminderMessage", () => {
  it("include il numero del giorno, il titolo e l'anteprima", () => {
    const content = loadContent();
    const day3 = getDay(content, 3);
    const message = buildReminderMessage(3, day3);
    expect(message).toContain("Giorno 3");
    expect(message).toContain(day3.title);
    expect(message).toContain(day3.preview);
  });
});

describe("validateContent", () => {
  it("segnala un giorno mancante nel contenuto grezzo", () => {
    const content = loadContent();
    const broken = { days: content.days.filter((d) => d.day !== 10) };
    const issues = validateContent(broken);
    expect(issues.some((i) => i.includes("giorno 10"))).toBe(true);
  });
});

describe("todayInRome (usato per decidere se inviare il reminder)", () => {
  it("riconosce una data fuori dal periodo 1-25 dicembre", () => {
    const outOfRange = todayInRome(new Date("2026-11-30T12:00:00Z"));
    const [, month, day] = outOfRange.split("-").map(Number);
    const inRange = month === 12 && day >= 1 && day <= 25;
    expect(inRange).toBe(false);
  });

  it("riconosce una data dentro il periodo 1-25 dicembre", () => {
    const inRangeDate = todayInRome(new Date("2026-12-15T12:00:00Z"));
    const [, month, day] = inRangeDate.split("-").map(Number);
    const inRange = month === 12 && day >= 1 && day <= 25;
    expect(inRange).toBe(true);
  });

  it("riconosce il 26 dicembre come fuori periodo", () => {
    const afterRange = todayInRome(new Date("2026-12-26T12:00:00Z"));
    const [, month, day] = afterRange.split("-").map(Number);
    const inRange = month === 12 && day >= 1 && day <= 25;
    expect(inRange).toBe(false);
  });
});
