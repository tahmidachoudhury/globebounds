import countryMeta from "./countryMeta.json";

export interface Country {
  /** ISO 3166-1 alpha-3 — from GeoJSON feature `id`, matches `countries/{iso3}.geo.json` */
  iso3: string;
  name: string;
  bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

export const countries: Country[] = countryMeta as Country[];

/** O(1) lookup by GeoJSON feature id / file stem */
export const countryByIso3: ReadonlyMap<string, Country> = new Map(countries.map((c) => [c.iso3, c]));

function bboxArea(b: Country["bounds"]): number {
  return (b.east - b.west) * (b.north - b.south);
}

/** Smaller bbox first so overlapping rectangles prefer the smaller territory (e.g. enclaves). */
const countriesByBBoxArea = [...countries].sort((a, b) => bboxArea(a.bounds) - bboxArea(b.bounds));

export function findCountryAtPoint(lng: number, lat: number): Country | null {
  return (
    countriesByBBoxArea.find((c) => {
      const { west, south, east, north } = c.bounds;
      return lng >= west && lng <= east && lat >= south && lat <= north;
    }) ?? null
  );
}
