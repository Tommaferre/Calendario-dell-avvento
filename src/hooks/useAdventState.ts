import { useCallback, useEffect, useRef, useState } from "react";
import { loadState, saveState, type PersistedState, type QuizResult } from "../utils/storage";

export function useAdventState() {
  const [state, setState] = useState<PersistedState>(() => loadState());
  const [storageWorks, setStorageWorks] = useState(true);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const ok = saveState(state);
    setStorageWorks(ok);
  }, [state]);

  const openDay = useCallback((day: number) => {
    setState((prev) =>
      prev.openedDays.includes(day) ? prev : { ...prev, openedDays: [...prev.openedDays, day] }
    );
  }, []);

  const redeemVoucher = useCallback((day: number) => {
    setState((prev) =>
      prev.redeemedVouchers.includes(day)
        ? prev
        : { ...prev, redeemedVouchers: [...prev.redeemedVouchers, day] }
    );
  }, []);

  const recordQuizResult = useCallback((day: number, result: QuizResult) => {
    setState((prev) => ({
      ...prev,
      quizResults: { ...prev.quizResults, [day]: result },
    }));
  }, []);

  const recordGameCompletion = useCallback((day: number) => {
    setState((prev) =>
      prev.gameCompletions.includes(day)
        ? prev
        : { ...prev, gameCompletions: [...prev.gameCompletions, day] }
    );
  }, []);

  const setOnboardingSeen = useCallback(() => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, hasSeenOnboarding: true },
    }));
  }, []);

  return {
    state,
    storageWorks,
    openDay,
    redeemVoucher,
    recordQuizResult,
    recordGameCompletion,
    setOnboardingSeen,
  };
}
