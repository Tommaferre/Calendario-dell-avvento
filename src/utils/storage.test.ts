import { describe, expect, it, beforeEach, vi } from "vitest";
import { loadState, saveState, STORAGE_KEY } from "./storage";

describe("storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("ritorna lo stato di default quando non c'è nulla salvato", () => {
    const state = loadState();
    expect(state.openedDays).toEqual([]);
    expect(state.redeemedVouchers).toEqual([]);
    expect(state.preferences.hasSeenOnboarding).toBe(false);
  });

  it("salva e ricarica correttamente lo stato", () => {
    const state = loadState();
    state.openedDays.push(1, 2, 3);
    saveState(state);

    const reloaded = loadState();
    expect(reloaded.openedDays).toEqual([1, 2, 3]);
  });

  it("gestisce JSON malformato senza lanciare errori", () => {
    window.localStorage.setItem(STORAGE_KEY, "{ questo non è json valido");
    const state = loadState();
    expect(state.openedDays).toEqual([]);
  });

  it("gestisce uno schema di versione sconosciuta tornando al default", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 999, openedDays: [1, 2] })
    );
    const state = loadState();
    expect(state.schemaVersion).toBe(1);
    expect(state.openedDays).toEqual([]);
  });

  it("filtra valori non numerici in openedDays", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ schemaVersion: 1, openedDays: [1, "due", 3, null] })
    );
    const state = loadState();
    expect(state.openedDays).toEqual([1, 3]);
  });

  it("non lancia errori se localStorage.setItem fallisce (quota superata)", () => {
    const spy = vi.spyOn(window.localStorage.__proto__, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });
    const result = saveState(loadState());
    expect(result).toBe(false);
    spy.mockRestore();
  });
});
