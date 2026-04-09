import { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { Country } from "@/data/countries";
import { findCountryAtPoint } from "@/data/countries";

const MAPBOX_TOKEN = "pk.eyJ1IjoidGFobWlkMDEiLCJhIjoiY21laDJkMnJjMDM0bjJrcDZucm1ubDZ5cCJ9.p85LMck0PSQRKa_obWk68w";

interface GlobeMapProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
  flyToBounds: Country | null;
}

const LIGHT_PRESETS = ["dusk", "dawn", "night", "light"] as const;
type LightPreset = (typeof LIGHT_PRESETS)[number];

export default function GlobeMap({ selectedCountry, onSelectCountry, flyToBounds }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [lightPreset, setLightPreset] = useState<LightPreset>("dusk");

  const updateBoundsLayer = useCallback((map: mapboxgl.Map, country: Country | null) => {
    const sourceId = "bbox-source";
    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;

    if (!country) {
      if (source) {
        source.setData({ type: "FeatureCollection", features: [] });
      }
      return;
    }

    const { west, south, east, north } = country.bounds;
    const geojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: { name: country.name },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ]],
          },
        },
      ],
    };

    if (source) {
      source.setData(geojson);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      //-------------------------------------------------------------
      //MINIMAL BLACK
      // style: "mapbox://styles/tahmid01/cmnrp0k9f001f01s65qc2134c",
      //-------------------------------------------------------------
      //DEFAULT
      style: "mapbox://styles/tahmid01/cmnrpanxm001l01qn9e2hcjwm",
      config: {
        basemap: {
          lightPreset,
        },
      },
      center: [0, 20],
      zoom: 1.5,
      projection: "globe" as any,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    map.on("style.load", () => {
      map.setFog({
        color: "rgb(10, 14, 20)",
        "high-color": "rgb(20, 30, 60)",
        "horizon-blend": 0.08,
        "space-color": "rgb(8, 10, 16)",
        "star-intensity": 0.6,
      } as any);

      map.addSource("bbox-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });

      map.addLayer({
        id: "bbox-fill",
        type: "fill",
        source: "bbox-source",
        paint: {
          "fill-color": "#0ea5e9",
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "bbox-line",
        type: "line",
        source: "bbox-source",
        paint: {
          "line-color": "#0ea5e9",
          "line-width": 2,
          "line-dasharray": [3, 2],
        },
      });
    });

    map.on("click", (e) => {
      const country = findCountryAtPoint(e.lngLat.lng, e.lngLat.lat);
      onSelectCountry(country);
    });

    map.getCanvas().style.cursor = "grab";

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update bbox when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    updateBoundsLayer(map, selectedCountry);
  }, [selectedCountry, updateBoundsLayer]);

  // Fly to bounds
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToBounds) return;
    const { west, south, east, north } = flyToBounds.bounds;
    map.fitBounds([west, south, east, north], { padding: 80, duration: 1500 });
  }, [flyToBounds]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.isStyleLoaded()) return;

    map.setConfigProperty("basemap", "lightPreset", lightPreset);
  }, [lightPreset]);

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute left-4 top-16 z-10 rounded-md border border-white/15 bg-black/40 p-1 backdrop-blur">
        <div className="flex items-center gap-1">
          {LIGHT_PRESETS.map((preset) => {
            const isActive = preset === lightPreset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => setLightPreset(preset)}
                className={`rounded px-3 py-1 text-xs font-medium capitalize transition-colors ${isActive
                  ? "bg-sky-500 text-white"
                  : "bg-transparent text-slate-200 hover:bg-white/10"
                  }`}
              >
                {preset}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
