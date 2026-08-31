import { linkedId } from "@/lib/linked-id";
import type { NextRequest } from "next/server";

interface DeezerSearchItem {
  id: number;
  title?: string;
  link: string;
  type?: string;
  artist?: { id: number; name: string };
  album?: { id: number; title: string; cover_medium?: string };
  duration?: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limitParam = searchParams.get("limit");
  const type = searchParams.get("type") || "track";

  if (!q || !q.trim()) {
    return Response.json({ error: "Missing 'q' query parameter." }, { status: 400 });
  }

  const limit = Math.min(Math.max(parseInt(limitParam || "10", 10), 1), 25);
  const searchType = type === "album" ? "album" : type === "artist" ? "artist" : "track";

  const deezerTypeMap: Record<string, string> = { track: "track", album: "album", artist: "artist" };
  const deezerType = deezerTypeMap[searchType];

  try {
    const url = `https://api.deezer.com/search/${deezerType}?q=${encodeURIComponent(q)}&limit=${limit}`;
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) {
      return Response.json({ error: "Upstream search failed." }, { status: 502 });
    }
    const data = await response.json();
    const items: DeezerSearchItem[] = data.data || [];

    const results = items.map((item) => ({
      title: item.title || item.album?.title || "Unknown",
      artist: item.artist?.name || null,
      platform: "deezer",
      type: deezerType === "track" ? "song" : deezerType,
      platformId: String(item.id),
      linkedId: linkedId("deezer", deezerType === "track" ? "song" : deezerType, String(item.id)),
      duration: item.duration || null,
      image: item.album?.cover_medium || null,
    }));

    return Response.json(
      { query: q.trim(), type: searchType, limit, results },
      { headers: corsHeaders() }
    );
  } catch {
    return Response.json({ error: "Search failed." }, { status: 500 });
  }
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
