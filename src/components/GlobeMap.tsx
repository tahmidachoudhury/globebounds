import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { Country } from "@/data/countries";
import { findCountryAtPoint } from "@/data/countries";

const MAPBOX_TOKEN = "pk.eyJ1IjoidGFobWlkMDEiLCJhIjoiY21laDJkMnJjMDM0bjJrcDZucm1ubDZ5cCJ9.p85LMck0PSQRKa_obWk68w";

interface GlobeMapProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
  flyToBounds: Country | null;
}

export default function GlobeMap({ selectedCountry, onSelectCountry, flyToBounds }: GlobeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

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
      style: "mapbox://styles/tahmid01/cmnrcnvbe000f01qw2iib70pv",
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

  return <div ref={containerRef} className="absolute inset-0" />;
}
