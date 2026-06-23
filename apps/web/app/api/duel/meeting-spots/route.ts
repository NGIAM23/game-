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
  `leisure=park`,
  `shop=mall`,
];

export async function POST(req: NextRequest) {
  const { lat, lng } = await req.json();
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  try {
    const radius = 1500;
    const filters = SAFE_TAGS.map((tag) => `node[${tag}](around:${radius},${lat},${lng});`).join("\n");
    const query = `[out:json][timeout:10];(${filters});out center 20;`;

    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: query,
    });

    if (!res.ok) throw new Error("Overpass error");
    const data = await res.json();

    const elements = (data.elements ?? []) as { lat: number; lon: number; tags?: Record<string, string> }[];
    const candidates: Candidate[] = elements
      .filter((e) => e.tags?.name)
      .map((e) => ({
        label: e.tags!.name,
        lat: e.lat,
        lng: e.lon,
        distance: haversineMeters(lat, lng, e.lat, e.lon),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json({ candidates: [] }, { status: 200 });
  }
}
