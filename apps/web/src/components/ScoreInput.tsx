interface ScoreInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export function ScoreInput({ label, value, onChange }: ScoreInputProps) {
  return (
    <label className="score-field">
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        value={value || ''}
        placeholder="0–100"
        onChange={(event) => onChange(Math.min(100, Math.max(0, Number(event.target.value))))}
        aria-label={label}
      />
    </label>
  );
}
