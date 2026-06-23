import { NextRequest, NextResponse } from "next/server";

interface Candidate {
  label: string;
  lat: number;
  lng: number;
  distance: number;
}

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Lieux publics, connus et sûrs (on exclut volontairement les lieux de culte
// pour rester neutre).
const SAFE_TAGS = [
  `amenity=library`,
  `amenity=cafe`,
  `amenity=townhall`,
  `amenity=community_centre`,
  `amenity=marketplace`,
  `amenity=pharmacy`,
  `amenity=fast_food`,
  `leisure=park`,
  `shop=mall`,
  `shop=supermarket`,
];

// Plusieurs miroirs Overpass : si l'un est inaccessible ou saturé, on tente le suivant.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

async function fetchCandidates(lat: number, lng: number, radius: number): Promise<Candidate[]> {
  const filters = SAFE_TAGS.map(
    (tag) => `nwr[${tag}](around:${radius},${lat},${lng});`
  ).join("\n");
  const query = `[out:json][timeout:15];(${filters});out center 30;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
          "User-Agent": "Luavio/1.0 (duel meeting spot finder)",
        },
        body: query,
        cache: "no-store",
      });
      if (!res.ok) continue;
      const data = await res.json();
      const elements = (data.elements ?? []) as {
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }[];

      const candidates: Candidate[] = elements
        .filter((e) => e.tags?.name)
        .map((e) => {
          const elat = e.lat ?? e.center?.lat;
          const elng = e.lon ?? e.center?.lon;
          return elat !== undefined && elng !== undefined
            ? { label: e.tags!.name, lat: elat, lng: elng, distance: haversineMeters(lat, lng, elat, elng) }
            : null;
        })
        .filter((c): c is Candidate => c !== null)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);

      if (candidates.length > 0) return candidates;
    } catch {
      continue;
    }
  }
  return [];
}

// Petits décalages (en degrés) autour du centre si aucun lieu nommé n'est trouvé,
// pour ne jamais bloquer le duel.
function fallbackCandidates(lat: number, lng: number): Candidate[] {
  const offsets = [
    { label: "Point de rendez-vous Nord", dLat: 0.0015, dLng: 0 },
    { label: "Point de rendez-vous Sud", dLat: -0.0015, dLng: 0 },
    { label: "Point de rendez-vous Est", dLat: 0, dLng: 0.0015 },
    { label: "Point de rendez-vous Ouest", dLat: 0, dLng: -0.0015 },
  ];
  return offsets.map((o) => {
    const clat = lat + o.dLat;
    const clng = lng + o.dLng;
    return { label: o.label, lat: clat, lng: clng, distance: haversineMeters(lat, lng, clat, clng) };
  });
}

export async function POST(req: NextRequest) {
  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  let candidates = await fetchCandidates(lat, lng, 1500);
  if (candidates.length === 0) candidates = await fetchCandidates(lat, lng, 4000);
  if (candidates.length === 0) candidates = fallbackCandidates(lat, lng);

  return NextResponse.json({ candidates });
}
