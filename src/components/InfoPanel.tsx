import type { Country } from "@/data/countries";

interface InfoPanelProps {
  country: Country;
  onZoom: () => void;
  onClear: () => void;
}

export default function InfoPanel({ country, onZoom, onClear }: InfoPanelProps) {
  const { west, south, east, north } = country.bounds;

  return (
    <div className="absolute bottom-6 left-6 z-20 w-80 rounded-2xl border border-border bg-card/60 p-5 shadow-2xl backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">{country.iso}</span>
      </div>
      <h2 className="mb-4 text-xl font-semibold text-foreground">{country.name}</h2>

      <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
        {[
          ["West", west],
          ["South", south],
          ["East", east],
          ["North", north],
        ].map(([label, val]) => (
          <div key={label as string} className="rounded-lg bg-secondary px-3 py-2">
            <span className="block text-xs text-muted-foreground">{label}</span>
            <span className="font-mono text-secondary-foreground">{(val as number).toFixed(2)}°</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onZoom}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          Zoom to bounds
        </button>
        <button
          onClick={onClear}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
