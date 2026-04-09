import { useState, useCallback } from "react";
import GlobeMap from "@/components/GlobeMap";
import InfoPanel from "@/components/InfoPanel";
import SearchBar from "@/components/SearchBar";
import type { Country } from "@/data/countries";

export default function Index() {
  const [selected, setSelected] = useState<Country | null>(null);
  const [flyTarget, setFlyTarget] = useState<Country | null>(null);

  const handleSelect = useCallback((country: Country | null) => {
    setSelected(country);
    if (country) setFlyTarget({ ...country }); // new ref to trigger effect
  }, []);

  const handleZoom = useCallback(() => {
    if (selected) setFlyTarget({ ...selected });
  }, [selected]);

  const handleClear = useCallback(() => {
    setSelected(null);
    setFlyTarget(null);
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-foreground tracking-tight">
            Globe<span className="text-primary">Bounds</span>
          </h1>
          <span className="hidden sm:block text-xs text-muted-foreground">
            Click a country to inspect its bounds
          </span>
        </div>
        <SearchBar onSelect={handleSelect} />
      </div>

      {/* Map */}
      <GlobeMap
        selectedCountry={selected}
        onSelectCountry={handleSelect}
        flyToBounds={flyTarget}
      />

      {/* Info panel */}
      {selected && (
        <InfoPanel country={selected} onZoom={handleZoom} onClear={handleClear} />
      )}

      {/* Legend */}
      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 backdrop-blur-xl">
        <span className="inline-block h-3 w-5 rounded-sm border border-primary/60 bg-primary/20" />
        <span className="text-xs text-muted-foreground">Bounding box</span>
      </div>
    </div>
  );
}
