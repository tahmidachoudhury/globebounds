import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { Country } from "@/data/countries";
import { findCountryAtPoint } from "@/data/countries";
import { boundsFromFeatureCollection, loadCountryFeatureCollection } from "@/data/countryGeo";

const MAPBOX_TOKEN = "pk.eyJ1IjoidGFobWlkMDEiLCJhIjoiY21laDJkMnJjMDM0bjJrcDZucm1ubDZ5cCJ9.p85LMck0PSQRKa_obWk68w";

interface GlobeMapProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
  flyToBounds: Country | null;
}

const LIGHT_PRESETS = ["dusk", "dawn", "night", "light"] as const;
type LightPreset = (typeof LIGHT_PRESETS)[number];

const emptyFc: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

export default function GlobeMap({ selectedCountry, onSelectCountry, flyToBounds }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geoCacheRef = useRef(new Map<string, GeoJSON.FeatureCollection>());
  const [lightPreset, setLightPreset] = useState<LightPreset>("dusk");
  const [styleReady, setStyleReady] = useState(false);

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
        },
      });

      setStyleReady(true);
    });

    map.on("click", (e) => {
      const country = findCountryAtPoint(e.lngLat.lng, e.lngLat.lat);
      onSelectCountry(country);
    });

    map.getCanvas().style.cursor = "grab";

    mapRef.current = map;

    return () => {
      setStyleReady(false);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Load GeoJSON outline when selection changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !styleReady || !map.isStyleLoaded()) return;

    const source = map.getSource("bbox-source") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    if (!selectedCountry) {
      source.setData(emptyFc);
      return;
    }

    const { iso3 } = selectedCountry;
    let cancelled = false;

    (async () => {
      let fc = geoCacheRef.current.get(iso3);
      if (!fc) {
        fc = await loadCountryFeatureCollection(iso3);
        if (fc) geoCacheRef.current.set(iso3, fc);
      }
      if (cancelled || mapRef.current !== map) return;
      source.setData(fc ?? emptyFc);
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedCountry, styleReady]);

  // Fit map to country geometry (fallback to bounds if GeoJSON missing)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyToBounds) return;

    const { iso3, bounds: b } = flyToBounds;
    let cancelled = false;

    (async () => {
      let fc = geoCacheRef.current.get(iso3);
      if (!fc) {
        fc = await loadCountryFeatureCollection(iso3);
        if (fc) geoCacheRef.current.set(iso3, fc);
      }
      if (cancelled || mapRef.current !== map) return;

      if (fc) {
        map.fitBounds(boundsFromFeatureCollection(fc), { padding: 80, duration: 1500 });
      } else {
        map.fitBounds([b.west, b.south, b.east, b.north], { padding: 80, duration: 1500 });
      }
    })();

    return () => {
      cancelled = true;
    };
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
