import type { AdventDay } from '../content/types.ts';
import { assetUrl } from '../lib/assets.ts';
import { opensOnLabel } from '../lib/dates.ts';
import { CheckIcon, LockIcon } from './Icons.tsx';

export type DayStatus = 'locked' | 'available' | 'opened';

interface Props {
  days: AdventDay[];
  statusOf: (day: number) => DayStatus;
  currentDay: number | null;
  onSelect: (day: number) => void;
  lastDay: number;
}

export function Calendar({ days, statusOf, currentDay, onSelect, lastDay }: Props) {
  return (
    <ol className="calendar" aria-label="Le 25 caselle del calendario">
      {days.map((d) => {
        const status = statusOf(d.day);
        const isToday = d.day === currentDay;
        const isFinal = d.day === lastDay;
        const label =
          status === 'locked' ? `Giorno ${d.day}: bloccato, si apre ${opensOnLabel(d.day)}`
          : status === 'opened' ? `Giorno ${d.day}: già aperto. ${d.title}`
          : `Giorno ${d.day}: sorpresa disponibile`;
        return (
          <li key={d.day} className={isFinal ? 'calendar__item calendar__item--final' : 'calendar__item'}>
            <button
              type="button"
              className={`box box--${status} ${isFinal ? 'box--final' : ''} ${isToday ? 'box--today' : ''}`}
              data-tone={d.day % 3}
              aria-label={label}
              aria-current={isToday ? 'date' : undefined}
              aria-disabled={status === 'locked' ? true : undefined}
              onClick={() => onSelect(d.day)}
            >
              {status === 'opened' ? (
                <img className="box__art" src={assetUrl(d.illustration)} alt="" loading="lazy" />
              ) : (
                <>
                  <span className="box__ribbon box__ribbon--v" aria-hidden="true" />
                  <span className="box__ribbon box__ribbon--h" aria-hidden="true" />
                  <span className="box__bow" aria-hidden="true" />
                </>
              )}
              <span className="box__tag" aria-hidden="true">
                {isFinal ? <span className="box__tag-text">Natale · {d.day}</span> : d.day}
              </span>
              {status === 'locked' && <span className="box__lock"><LockIcon /></span>}
              {status === 'opened' && <span className="box__check"><CheckIcon /></span>}
              {isToday && <span className="box__today" aria-hidden="true">Oggi</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
