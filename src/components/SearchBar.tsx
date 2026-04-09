import { useState, useMemo } from "react";
import { countries, type Country } from "@/data/countries";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSelect: (country: Country) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return countries.filter(c => c.name.toLowerCase().includes(q) || c.iso.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card/90 px-3 py-2 backdrop-blur-xl">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search country…"
          className="w-40 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full rounded-xl border border-border bg-card/95 py-1 shadow-xl backdrop-blur-xl">
          {results.map((c) => (
            <button
              key={c.iso}
              onClick={() => { onSelect(c); setQuery(""); setOpen(false); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
            >
              <span className="text-xs text-muted-foreground">{c.iso}</span>
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
