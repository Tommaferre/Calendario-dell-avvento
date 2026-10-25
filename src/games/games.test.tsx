import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizGame from "./QuizGame";
import RiddleGame from "./RiddleGame";
import type { QuizData, RiddleData } from "../content/types";

describe("QuizGame", () => {
  const quiz: QuizData = {
    intro: "intro",
    questions: [
      {
        question: "Domanda 1?",
        options: ["A", "B"],
        correctIndex: 0,
        feedbackCorrect: "Bravo",
        feedbackWrong: "Peccato",
      },
    ],
    resultGood: "Ottimo risultato",
    resultBad: "Si può migliorare",
  };

  it("calcola correttamente il punteggio e chiama onComplete", () => {
    const onComplete = vi.fn();
    render(<QuizGame quiz={quiz} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("Vedi il risultato"));
    expect(onComplete).toHaveBeenCalledWith(1, 1);
    expect(screen.getByText(/Ottimo risultato/)).toBeInTheDocument();
  });

  it("segnala una risposta sbagliata senza assegnare punti", () => {
    const onComplete = vi.fn();
    render(<QuizGame quiz={quiz} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("B"));
    fireEvent.click(screen.getByText("Vedi il risultato"));
    expect(onComplete).toHaveBeenCalledWith(0, 1);
  });
});

describe("RiddleGame", () => {
  const riddle: RiddleData = {
    intro: "intro",
    riddleText: "Cos'è?",
    acceptedAnswers: ["amore", "affetto"],
    hint: "un indizio",
    solutionReveal: "era l'amore",
  };

  it("accetta una risposta corretta ignorando maiuscole/accenti/spazi", () => {
    const onComplete = vi.fn();
    render(<RiddleGame riddle={riddle} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText("La tua risposta"), {
      target: { value: "  AMORE  " },
    });
    fireEvent.click(screen.getByText("Rispondi"));
    expect(onComplete).toHaveBeenCalled();
    expect(screen.getByText(/Esatto!/)).toBeInTheDocument();
  });

  it("mostra un feedback per una risposta sbagliata senza chiamare onComplete", () => {
    const onComplete = vi.fn();
    render(<RiddleGame riddle={riddle} onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText("La tua risposta"), {
      target: { value: "boh" },
    });
    fireEvent.click(screen.getByText("Rispondi"));
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText(/Non proprio/)).toBeInTheDocument();
  });

  it("permette di rivelare la soluzione e completa comunque il gioco", () => {
    const onComplete = vi.fn();
    render(<RiddleGame riddle={riddle} onComplete={onComplete} />);
    fireEvent.click(screen.getByText("Rivela la soluzione"));
    expect(onComplete).toHaveBeenCalled();
    expect(screen.getByText(/era l'amore/)).toBeInTheDocument();
  });
});
