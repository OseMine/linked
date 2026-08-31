import { linkedId } from "@/lib/linked-id";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import type { NextRequest } from "next/server";

interface SearchResult {
  title: string;
  artist: string | null;
  platform: string;
  type: "song" | "album" | "artist";
  platformId: string;
  linkedId: string;
  duration: number | null;
  image: string | null;
}

interface DeezerTrack {
  id: number;
  title?: string;
  link: string;
  type?: string;
  artist?: { id: number; name: string };
  album?: { id: number; title: string; cover_medium?: string };
  duration?: number;
}

interface DeezerAlbum {
  id: number;
  title?: string;
  link: string;
  type?: string;
  artist?: { id: number; name: string };
  cover_medium?: string;
}

interface DeezerArtist {
  id: number;
  name?: string;
  link: string;
  type?: string;
  picture_medium?: string;
}

interface SpotifySearchItem {
  id: string;
  name: string;
  artists?: { name: string }[];
  album?: { name: string; images?: { url: string }[] };
  duration_ms?: number;
  external_urls?: { spotify: string };
}

interface SpotifySearchResponse {
  tracks?: { items: SpotifySearchItem[] };
  albums?: { items: { id: string; name: string; artists?: { name: string }[]; images?: { url: string }[]; external_urls?: { spotify: string } }[] };
  artists?: { items: { id: string; name: string; images?: { url: string }[]; external_urls?: { spotify: string } }[] };
}

const spotifyTokenCache = new Map<string, { token: string; expires: number }>();

async function getSpotifyToken(): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const cacheKey = `${clientId}:${clientSecret}`;
  const cached = spotifyTokenCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) return cached.token;

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    const token = data.access_token as string;
    spotifyTokenCache.set(cacheKey, { token, expires: Date.now() + (data.expires_in || 3600) * 1000 });
    return token;
  } catch {
    return null;
  }
}

async function searchDeezer(
  query: string,
  type: "track" | "album" | "artist",
  limit: number
): Promise<SearchResult[]> {
  try {
    const url = `https://api.deezer.com/search/${type}?q=${encodeURIComponent(query)}&limit=${limit}`;
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return [];

    const data = await response.json();
    const items = data.data || [];

    return items.map((item: DeezerTrack | DeezerAlbum | DeezerArtist) => {
      if (type === "track") {
        const track = item as DeezerTrack;
        return {
          title: track.title || (item as DeezerTrack).album?.title || "Unknown",
          artist: track.artist?.name || null,
          platform: "deezer",
          type: "song" as const,
          platformId: String(track.id),
          linkedId: linkedId("deezer", "song", String(track.id)),
          duration: track.duration || null,
          image: track.album?.cover_medium || null,
        };
      } else if (type === "album") {
        const album = item as DeezerAlbum;
        return {
          title: album.title || "Unknown",
          artist: album.artist?.name || null,
          platform: "deezer",
          type: "album" as const,
          platformId: String(album.id),
          linkedId: linkedId("deezer", "album", String(album.id)),
          duration: null,
          image: album.cover_medium || null,
        };
      } else {
        const artist = item as DeezerArtist;
        return {
          title: artist.name || "Unknown",
          artist: null,
          platform: "deezer",
          type: "artist" as const,
          platformId: String(artist.id),
          linkedId: linkedId("deezer", "artist", String(artist.id)),
          duration: null,
          image: artist.picture_medium || null,
        };
      }
    });
  } catch {
    return [];
  }
}

async function searchSpotify(
  query: string,
  type: "track" | "album" | "artist",
  limit: number
): Promise<SearchResult[]> {
  const token = await getSpotifyToken();
  if (!token) return [];

  try {
    const spotifyType = type === "track" ? "track" : type === "album" ? "album" : "artist";
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${spotifyType}&limit=${limit}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];

    const data: SpotifySearchResponse = await response.json();

    if (type === "track" && data.tracks?.items) {
      return data.tracks.items.map((item) => ({
        title: item.name || "Unknown",
        artist: item.artists?.[0]?.name || null,
        platform: "spotify",
        type: "song" as const,
        platformId: item.id,
        linkedId: linkedId("spotify", "song", item.id),
        duration: item.duration_ms ? Math.floor(item.duration_ms / 1000) : null,
        image: item.album?.images?.[2]?.url || item.album?.images?.[0]?.url || null,
      }));
    } else if (type === "album" && data.albums?.items) {
      return data.albums.items.map((item) => ({
        title: item.name || "Unknown",
        artist: item.artists?.[0]?.name || null,
        platform: "spotify",
        type: "album" as const,
        platformId: item.id,
        linkedId: linkedId("spotify", "album", item.id),
        duration: null,
        image: item.images?.[2]?.url || item.images?.[0]?.url || null,
      }));
    } else if (type === "artist" && data.artists?.items) {
      return data.artists.items.map((item) => ({
        title: item.name || "Unknown",
        artist: null,
        platform: "spotify",
        type: "artist" as const,
        platformId: item.id,
        linkedId: linkedId("spotify", "artist", item.id),
        duration: null,
        image: item.images?.[2]?.url || item.images?.[0]?.url || null,
      }));
    }
    return [];
  } catch {
    return [];
  }
}

async function searchItunes(
  query: string,
  type: "track" | "album" | "artist",
  limit: number
): Promise<SearchResult[]> {
  try {
    let entity = "song";
    if (type === "album") entity = "album";
    if (type === "artist") entity = "musicArtist";

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=${entity}&limit=${limit}`;
    const response = await fetch(url, { next: { revalidate: 300 } });
    if (!response.ok) return [];

    const data = await response.json();
    const items = data.results || [];

    return items.map((item: any) => ({
      title: item.trackName || item.collectionName || item.artistName || "Unknown",
      artist: item.artistName || null,
      platform: "apple",
      type: type === "track" ? "song" : type === "album" ? "album" : "artist",
      platformId: String(item.trackId || item.collectionId || item.artistId),
      linkedId: linkedId(
        "apple",
        type === "track" ? "song" : type === "album" ? "album" : "artist",
        String(item.trackId || item.collectionId || item.artistId)
      ),
      duration: item.trackTimeMillis ? Math.floor(item.trackTimeMillis / 1000) : null,
      image: item.artworkUrl100?.replace("100x100", "300x300") || null,
    }));
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
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

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const limitParam = searchParams.get("limit");
  const type = searchParams.get("type") || "track";
  const sources = searchParams.get("sources")?.split(",") || ["deezer", "spotify", "apple"];

  if (!q || !q.trim()) {
    return Response.json(
      { error: "Missing 'q' query parameter." },
      { status: 400, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  }

  const limit = Math.min(Math.max(parseInt(limitParam || "10", 10), 1), 25);
  const searchType = type === "album" ? "album" : type === "artist" ? "artist" : "track";

  try {
    const promises: Promise<SearchResult[]>[] = [];

    if (sources.includes("deezer")) {
      promises.push(searchDeezer(q, searchType, limit));
    }
    if (sources.includes("spotify")) {
      promises.push(searchSpotify(q, searchType, limit));
    }
    if (sources.includes("apple")) {
      promises.push(searchItunes(q, searchType, limit));
    }

    const resultsArrays = await Promise.all(promises);
    const allResults = resultsArrays.flat();

    const seen = new Set<string>();
    const uniqueResults = allResults.filter((result) => {
      const key = `${result.platform}:${result.type}:${result.platformId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    uniqueResults.sort((a, b) => {
      const sourceOrder = { deezer: 0, spotify: 1, apple: 2 };
      return (sourceOrder[a.platform as keyof typeof sourceOrder] ?? 99) - (sourceOrder[b.platform as keyof typeof sourceOrder] ?? 99);
    });

    return Response.json(
      {
        query: q.trim(),
        type: searchType,
        limit,
        sources,
        results: uniqueResults.slice(0, limit),
      },
      { headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
  } catch {
    return Response.json(
      { error: "Search failed." },
      { status: 500, headers: { ...corsHeaders(), ...rateLimitHeaders } }
    );
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
