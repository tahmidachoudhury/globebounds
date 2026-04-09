export interface Country {
  name: string;
  iso: string;
  bounds: {
    west: number;
    south: number;
    east: number;
    north: number;
  };
}

export const countries: Country[] = [
  { name: "United States", iso: "US", bounds: { west: -125.0, south: 24.4, east: -66.9, north: 49.4 } },
  { name: "Brazil", iso: "BR", bounds: { west: -73.99, south: -33.75, east: -34.79, north: 5.27 } },
  { name: "Canada", iso: "CA", bounds: { west: -141.0, south: 41.68, east: -52.65, north: 83.11 } },
  { name: "United Kingdom", iso: "GB", bounds: { west: -8.17, south: 49.96, east: 1.75, north: 58.64 } },
  { name: "France", iso: "FR", bounds: { west: -5.14, south: 42.33, east: 9.56, north: 51.09 } },
  { name: "Germany", iso: "DE", bounds: { west: 5.87, south: 47.27, east: 15.04, north: 55.06 } },
  { name: "Japan", iso: "JP", bounds: { west: 129.41, south: 31.03, east: 145.54, north: 45.55 } },
  { name: "Australia", iso: "AU", bounds: { west: 113.34, south: -43.63, east: 153.57, north: -10.67 } },
  { name: "India", iso: "IN", bounds: { west: 68.18, south: 6.75, east: 97.4, north: 35.5 } },
  { name: "South Africa", iso: "ZA", bounds: { west: 16.46, south: -34.83, east: 32.89, north: -22.13 } },
  { name: "Nigeria", iso: "NG", bounds: { west: 2.69, south: 4.24, east: 14.68, north: 13.87 } },
  { name: "Egypt", iso: "EG", bounds: { west: 24.7, south: 22.0, east: 36.87, north: 31.67 } },
  { name: "China", iso: "CN", bounds: { west: 73.5, south: 18.16, east: 134.77, north: 53.56 } },
  { name: "Argentina", iso: "AR", bounds: { west: -73.42, south: -55.25, east: -53.63, north: -21.83 } },
  { name: "Mexico", iso: "MX", bounds: { west: -118.4, south: 14.53, east: -86.71, north: 32.72 } },
];

export function findCountryAtPoint(lng: number, lat: number): Country | null {
  return countries.find(c => {
    const { west, south, east, north } = c.bounds;
    return lng >= west && lng <= east && lat >= south && lat <= north;
  }) ?? null;
}
