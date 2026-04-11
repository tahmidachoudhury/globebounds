/**
 * Reads all src/data/countries/*.geo.json and writes src/data/countryMeta.json
 * with iso3 (from feature id), display name, and bounding box for hit-testing.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const countriesDir = path.join(__dirname, "../src/data/countries");
const outFile = path.join(__dirname, "../src/data/countryMeta.json");

function extendBBox(b, coords) {
  if (!Array.isArray(coords)) return;
  if (coords.length >= 2 && typeof coords[0] === "number" && typeof coords[1] === "number") {
    const lng = coords[0];
    const lat = coords[1];
    b.west = Math.min(b.west, lng);
    b.east = Math.max(b.east, lng);
    b.south = Math.min(b.south, lat);
    b.north = Math.max(b.north, lat);
    return;
  }
  for (const c of coords) extendBBox(b, c);
}

function geometryBBox(geom) {
  const b = { west: Infinity, east: -Infinity, south: Infinity, north: -Infinity };
  if (!geom) return null;
  if (geom.type === "Polygon" || geom.type === "MultiPolygon") {
    extendBBox(b, geom.coordinates);
  } else if (geom.type === "GeometryCollection") {
    for (const g of geom.geometries) {
      const sub = geometryBBox(g);
      if (!sub) continue;
      b.west = Math.min(b.west, sub.west);
      b.east = Math.max(b.east, sub.east);
      b.south = Math.min(b.south, sub.south);
      b.north = Math.max(b.north, sub.north);
    }
  }
  if (b.west === Infinity) return null;
  return b;
}

function mergeBBox(into, gb) {
  into.west = Math.min(into.west, gb.west);
  into.east = Math.max(into.east, gb.east);
  into.south = Math.min(into.south, gb.south);
  into.north = Math.max(into.north, gb.north);
}

function featureCollectionBBox(fc) {
  const b = { west: Infinity, east: -Infinity, south: Infinity, north: -Infinity };
  for (const f of fc.features) {
    const gb = geometryBBox(f.geometry);
    if (gb) mergeBBox(b, gb);
  }
  if (b.west === Infinity) return null;
  return b;
}

const entries = [];
for (const name of fs.readdirSync(countriesDir)) {
  if (!name.endsWith(".geo.json")) continue;
  const stem = name.slice(0, -".geo.json".length);
  const raw = fs.readFileSync(path.join(countriesDir, name), "utf8");
  const fc = JSON.parse(raw);
  const f0 = fc.features && fc.features[0];
  const iso3 = f0 && f0.id != null ? String(f0.id) : stem;
  const displayName = (f0 && f0.properties && f0.properties.name) || stem;
  const bounds = featureCollectionBBox(fc);
  if (!bounds) {
    console.warn(`skip (no bounds): ${name}`);
    continue;
  }
  entries.push({ iso3, name: displayName, bounds });
}

entries.sort((a, b) => a.name.localeCompare(b.name, "en"));

fs.writeFileSync(outFile, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
console.log(`Wrote ${entries.length} countries to ${path.relative(process.cwd(), outFile)}`);
