import mapboxgl from "mapbox-gl";

const geoLoaders = import.meta.glob("./countries/*.geo.json") as Record<
  string,
  () => Promise<{ default: GeoJSON.FeatureCollection }>
>;

export async function loadCountryFeatureCollection(
  iso3166Alpha3: string,
): Promise<GeoJSON.FeatureCollection | null> {
  const key = `./countries/${iso3166Alpha3}.geo.json`;
  const load = geoLoaders[key];
  if (!load) return null;
  const mod = await load();
  return mod.default;
}

export function boundsFromFeatureCollection(fc: GeoJSON.FeatureCollection): mapboxgl.LngLatBounds {
  const bounds = new mapboxgl.LngLatBounds();
  for (const feature of fc.features) {
    if (!feature.geometry) continue;
    extendGeometry(bounds, feature.geometry);
  }
  return bounds;
}

function extendGeometry(bounds: mapboxgl.LngLatBounds, geometry: GeoJSON.Geometry): void {
  switch (geometry.type) {
    case "Polygon":
    case "MultiPolygon":
      extendCoords(bounds, geometry.coordinates as unknown);
      break;
    case "GeometryCollection":
      for (const g of geometry.geometries) extendGeometry(bounds, g);
      break;
    default:
      break;
  }
}

function extendCoords(bounds: mapboxgl.LngLatBounds, coords: unknown): void {
  if (!Array.isArray(coords)) return;
  const arr = coords as unknown[];
  if (arr.length >= 2 && typeof arr[0] === "number" && typeof arr[1] === "number") {
    bounds.extend([arr[0] as number, arr[1] as number]);
    return;
  }
  for (const c of arr) extendCoords(bounds, c);
}
