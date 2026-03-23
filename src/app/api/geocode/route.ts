import { NextResponse } from "next/server";

// Geocode an address using Nominatim (OpenStreetMap) — free, no API key needed
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("q");
  if (!address) return NextResponse.json({ error: "Missing q param" }, { status: 400 });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=ar&limit=1`,
      { headers: { "User-Agent": "InmoGestor/1.0" } }
    );
    const data = await res.json();
    if (data.length > 0) {
      return NextResponse.json({
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        display: data[0].display_name,
      });
    }
    return NextResponse.json({ lat: null, lng: null, display: null });
  } catch {
    return NextResponse.json({ lat: null, lng: null, display: null });
  }
}
