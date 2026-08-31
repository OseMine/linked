import { parseUrl } from "@/lib/parsers";
import { linkedId } from "@/lib/linked-id";
import { getMusicDataCached } from "@/lib/songlink";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body. Expected { \"url\": \"...\" }." }, { status: 400 });
  }

  const inputUrl = body?.url;
  if (typeof inputUrl !== "string" || !inputUrl.trim()) {
    return Response.json({ error: "Missing or empty 'url' field." }, { status: 400 });
  }

  const parsed = parseUrl(inputUrl);
  if (!parsed) {
    return Response.json(
      { error: "Unsupported URL. Use a link from Spotify, Apple Music, Deezer, Tidal, YouTube, or Amazon Music." },
      { status: 422 }
    );
  }

  const id = linkedId(parsed.platform, parsed.entityType, parsed.platformId);

  let data;
  try {
    data = await getMusicDataCached(parsed.platform, parsed.entityType, parsed.platformId);
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
        platform: parsed.platform,
        type: parsed.entityType,
        platformId: parsed.platformId,
        url: parsed.url,
      },
      linkedId: id,
      linkedUrl: `/${parsed.entityType}/${id}`,
    },
    { headers: corsHeaders() }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
