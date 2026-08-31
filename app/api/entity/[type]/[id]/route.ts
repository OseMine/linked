import { decodeLinkedId } from "@/lib/linked-id";
import { getMusicDataCached } from "@/lib/songlink";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;

  const decoded = decodeLinkedId(id);
  if (!decoded || decoded.type !== type) {
    return Response.json({ error: "Invalid or unknown linked ID." }, { status: 404, headers: corsHeaders() });
  }

  let data;
  try {
    data = await getMusicDataCached(decoded.platform, decoded.type, decoded.platformId);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to resolve music data." },
      { status: 500, headers: corsHeaders() }
    );
  }

  return Response.json(
    {
      entity: data,
      source: {
        platform: decoded.platform,
        type: decoded.type,
        platformId: decoded.platformId,
        url: buildSourceUrl(decoded.platform, decoded.type, decoded.platformId),
      },
      linkedId: id,
      linkedUrl: `/${decoded.type}/${id}`,
    },
    { headers: corsHeaders() }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function buildSourceUrl(platform: string, type: string, platformId: string): string {
  const urls: Record<string, Record<string, (id: string) => string>> = {
    spotify: {
      artist: (id) => `https://open.spotify.com/artist/${id}`,
      song: (id) => `https://open.spotify.com/track/${id}`,
      album: (id) => `https://open.spotify.com/album/${id}`,
    },
    apple: {
      artist: (id) => `https://music.apple.com/us/artist/id${id}`,
      song: (id) => `https://music.apple.com/us/song/id${id}`,
      album: (id) => `https://music.apple.com/us/album/id${id}`,
    },
    deezer: {
      artist: (id) => `https://www.deezer.com/artist/${id}`,
      song: (id) => `https://www.deezer.com/track/${id}`,
      album: (id) => `https://www.deezer.com/album/${id}`,
    },
    tidal: {
      artist: (id) => `https://tidal.com/browse/artist/${id}`,
      song: (id) => `https://tidal.com/browse/track/${id}`,
      album: (id) => `https://tidal.com/browse/album/${id}`,
    },
    youtube: {
      song: (id) => `https://www.youtube.com/watch?v=${id}`,
      artist: (id) => `https://www.youtube.com/channel/${id}`,
      album: (id) => `https://www.youtube.com/playlist?list=${id}`,
    },
    amazon: {
      artist: (id) => `https://music.amazon.com/artists/${id}`,
      album: (id) => `https://music.amazon.com/albums/${id}`,
      song: (id) => `https://music.amazon.com/albums/${id}?trackAsin=${id}`,
    },
  };

  const builder = urls[platform]?.[type];
  return builder ? builder(platformId) : "";
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
