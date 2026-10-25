interface Props {
  previewDate: string | null;
  onChange: (date: string | null) => void;
  year: number;
}

// Questo componente viene montato SOLO quando import.meta.env.DEV è vero
// (vedi App.tsx): in una build di produzione (`npm run build`) non viene
// nemmeno incluso nel bundle grazie al tree-shaking su un ramo
// condizionale valutato a build time da Vite.
export default function PreviewBar({ previewDate, onChange, year }: Props) {
  const options = Array.from({ length: 25 }, (_, i) => i + 1);

  return (
    <div className="preview-bar">
      <strong>Modalità anteprima (solo sviluppo)</strong>
      <label>
        Simula data:
        <select
          value={previewDate ?? ""}
          onChange={(e) => {
            const day = e.target.value;
            if (!day) {
              onChange(null);
              return;
            }
            onChange(`${year}-12-${day.padStart(2, "0")}`);
          }}
        >
          <option value="">Data reale del dispositivo</option>
          {options.map((day) => (
            <option key={day} value={day}>
              {day} dicembre
            </option>
          ))}
        </select>
      </label>
      {previewDate && (
        <button type="button" onClick={() => onChange(null)}>
          Reimposta
        </button>
      )}
    </div>
  );
}
