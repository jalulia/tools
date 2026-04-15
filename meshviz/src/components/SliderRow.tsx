interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}

export default function SliderRow({ label, value, min, max, step, onChange, unit = '' }: SliderRowProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</label>
        <span className="text-[10px] tabular-nums">{step < 1 ? value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '') : value.toFixed(0)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
