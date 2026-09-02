import { fetchLyrics } from "@/lib/lyrics";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const track = searchParams.get("track");
  const artist = searchParams.get("artist");
  const album = searchParams.get("album");
  const duration = searchParams.get("duration");

  if (!track || !artist) {
    return Response.json(
      { error: "Missing 'track' and/or 'artist' query parameters." },
      { status: 400, headers: corsHeaders() }
    );
  }

  const result = await fetchLyrics(
    track,
    artist,
    album || undefined,
    duration ? parseInt(duration, 10) : undefined
  );

  if (!result) {
    return Response.json(
      { error: "Lyrics not found." },
      { status: 404, headers: corsHeaders() }
    );
  }

  return Response.json(result, { headers: corsHeaders() });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
