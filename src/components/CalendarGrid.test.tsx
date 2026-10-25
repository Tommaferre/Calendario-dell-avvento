import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CalendarGrid from "./CalendarGrid";
import { content } from "../content";

const referenceDate = new Date("2026-12-10T12:00:00Z");

describe("CalendarGrid", () => {
  it("mostra tutte e 25 le caselle fin dall'inizio", () => {
    render(
      <CalendarGrid
        days={content.days}
        openedDays={[]}
        todayDate="2026-12-10"
        referenceDate={referenceDate}
        onOpenDay={() => {}}
      />
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(25);
  });

  it("disabilita le caselle future e abilita quelle passate/odierne", () => {
    render(
      <CalendarGrid
        days={content.days}
        openedDays={[]}
        todayDate="2026-12-10"
        referenceDate={referenceDate}
        onOpenDay={() => {}}
      />
    );
    const future = screen.getByRole("button", { name: /Giorno 15/i });
    const past = screen.getByRole("button", { name: /Giorno 5/i });
    expect(future).toBeDisabled();
    expect(past).not.toBeDisabled();
  });

  it("chiama onOpenDay solo per una casella sbloccata", () => {
    const onOpenDay = vi.fn();
    render(
      <CalendarGrid
        days={content.days}
        openedDays={[]}
        todayDate="2026-12-10"
        referenceDate={referenceDate}
        onOpenDay={onOpenDay}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Giorno 3/i }));
    expect(onOpenDay).toHaveBeenCalledTimes(1);
    expect(onOpenDay.mock.calls[0][0].day).toBe(3);
  });

  it("non apre una casella bloccata anche forzando il click", () => {
    const onOpenDay = vi.fn();
    render(
      <CalendarGrid
        days={content.days}
        openedDays={[]}
        todayDate="2026-12-10"
        referenceDate={referenceDate}
        onOpenDay={onOpenDay}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Giorno 20/i }));
    expect(onOpenDay).not.toHaveBeenCalled();
  });
});
