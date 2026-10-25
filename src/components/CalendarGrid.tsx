import type { DayContent } from "../content/types";
import { formatDayLabel, isUnlocked } from "../utils/dates";

interface Props {
  days: DayContent[];
  openedDays: number[];
  todayDate: string;
  referenceDate?: Date;
  onOpenDay: (day: DayContent) => void;
}

const TYPE_ICON: Record<DayContent["type"], string> = {
  message: "💌",
  letter: "📜",
  photo: "📷",
  voucher: "🎟️",
  quiz: "❓",
  game: "🎲",
};

export default function CalendarGrid({ days, openedDays, todayDate, referenceDate, onOpenDay }: Props) {
  return (
    <div className="calendar-grid" role="list" aria-label="Caselle del calendario dell'avvento">
      {days.map((day) => {
        const unlocked = isUnlocked(day.date, referenceDate);
        const opened = openedDays.includes(day.day);
        const isToday = day.date === todayDate;

        let cls = "day-tile";
        if (!unlocked) cls += " day-tile--locked";
        if (opened) cls += " day-tile--opened";
        if (isToday && unlocked) cls += " day-tile--today";
        if (day.special && unlocked) cls += " day-tile--special";

        const label = !unlocked
          ? `Giorno ${day.day}, ${formatDayLabel(day.date)}, ancora bloccato`
          : `Giorno ${day.day}, ${formatDayLabel(day.date)}, ${day.title}${opened ? ", già aperto" : ", disponibile"}`;

        return (
          <div key={day.day} role="listitem">
            <button
              type="button"
              className={cls}
              disabled={!unlocked}
              onClick={() => unlocked && onOpenDay(day)}
              aria-label={label}
              title={unlocked ? day.title : "Disponibile al momento giusto"}
            >
              <span className="day-tile__number">{day.day}</span>
              <span className="day-tile__icon" aria-hidden="true">
                {unlocked ? TYPE_ICON[day.type] : "🔒"}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
