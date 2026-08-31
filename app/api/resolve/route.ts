import { parseUrl } from "@/lib/parsers";
import { linkedId } from "@/lib/linked-id";
import { getMusicDataCached } from "@/lib/songlink";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
  const rateLimitResult = checkRateLimit(clientIp);
  const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

  if (!rateLimitResult.allowed) {
    return Response.json(
      { error: "Too many requests. Please wait before trying again." },
      { status: 429, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body. Expected { \"url\": \"...\" }." },
      { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  }

  const inputUrl = body?.url;
  if (typeof inputUrl !== "string" || !inputUrl.trim()) {
    return Response.json(
      { error: "Missing or empty 'url' field." },
      { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  }

  const parsed = parseUrl(inputUrl);
  if (!parsed) {
    return Response.json(
      { error: "Unsupported URL. Use a link from Spotify, Apple Music, Deezer, Tidal, YouTube, or Amazon Music." },
      { status: 422, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  }

  const id = linkedId(parsed.platform, parsed.entityType, parsed.platformId);

  let data;
  try {
    data = await getMusicDataCached(parsed.platform, parsed.entityType, parsed.platformId);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to resolve music data." },
      { status: 500, headers: { ...corsHeaders(), ...rateLimitHeaders } }
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
    { headers: { ...corsHeaders(), ...rateLimitHeaders } }
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
