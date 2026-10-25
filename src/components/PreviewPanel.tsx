import { formatIso, type DateParts } from '../lib/dates.ts';

interface Props { value: DateParts | null; onChange: (d: DateParts | null) => void; year: number }

/** Pannello di anteprima: visibile SOLO in sviluppo (vedi src/lib/preview.ts). */
export function PreviewPanel({ value, onChange, year }: Props) {
  return (
    <aside className="preview" aria-label="Modalità anteprima (solo sviluppo)">
      <strong>Anteprima</strong>
      <label>
        Data simulata{' '}
        <input
          type="date"
          value={value ? formatIso(value) : ''}
          min={`${year}-11-25`}
          max={`${year}-12-31`}
          onChange={(e) => {
            const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(e.target.value);
            onChange(m ? { year: +m[1], month: +m[2], day: +m[3] } : null);
          }}
        />
      </label>
      <button type="button" onClick={() => onChange(null)}>Data reale</button>
    </aside>
  );
}
