const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export interface CoffeeShop {
  id: number;
  name: string;
  lat: number;
  lon: number;
  address?: string;
  openingHours?: string;
  phone?: string;
  website?: string;
}

interface OverpassElement {
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

export async function fetchNearbyCoffeeShops(
  lat: number,
  lon: number,
  radiusMeters = 1500
): Promise<CoffeeShop[]> {
  const query = [
    '[out:json][timeout:25];(',
    `node["amenity"="cafe"](around:${radiusMeters},${lat},${lon});`,
    `node["amenity"="coffee_shop"](around:${radiusMeters},${lat},${lon});`,
    `node["shop"="coffee"](around:${radiusMeters},${lat},${lon});`,
    ');out body;',
  ].join('');

  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error(`Overpass API responded with ${res.status}`);

  const json = (await res.json()) as { elements: OverpassElement[] };
  const seen = new Set<number>();

  return json.elements
    .filter((el) => {
      if (seen.has(el.id)) return false;
      seen.add(el.id);
      return true;
    })
    .map((el) => ({
      id: el.id,
      name: el.tags?.name ?? 'Coffee Shop',
      lat: el.lat,
      lon: el.lon,
      address: buildAddress(el.tags),
      openingHours: el.tags?.opening_hours,
      phone: el.tags?.phone,
      website: el.tags?.website,
    }));
}

function buildAddress(tags?: Record<string, string>): string | undefined {
  const parts = [
    tags?.['addr:housenumber'],
    tags?.['addr:street'],
    tags?.['addr:city'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : undefined;
}
