const API_VERSION = "1.1.0";

const PLATFORMS = [
  { key: "spotify", name: "Spotify", icon: "spotify", aliases: [] },
  { key: "apple", name: "Apple Music", icon: "applemusic", aliases: ["appleMusic"] },
  { key: "deezer", name: "Deezer", icon: "deezer", aliases: [] },
  { key: "tidal", name: "Tidal", icon: "tidal", aliases: [] },
  { key: "youtube", name: "YouTube", icon: "youtube", aliases: [] },
  { key: "youtubemusic", name: "YouTube Music", icon: "youtubemusic", aliases: ["youtubeMusic"] },
  { key: "amazonmusic", name: "Amazon Music", icon: "amazon", aliases: ["amazonMusic"] },
  { key: "bandcamp", name: "Bandcamp", icon: "bandcamp", aliases: [] },
] as const;

interface EndpointDef {
  method: string;
  path: string;
  description: string;
  parameters?: { name: string; in: string; type: string; required: boolean; description: string }[];
  example?: { request?: Record<string, unknown>; response?: Record<string, unknown> };
}

export async function GET() {
  return Response.json(
    {
      name: "Linked API",
      version: API_VERSION,
      description:
        "Music link unification API. Paste a link from any supported platform, get a universal 'Linked' URL with cross-platform links, lyrics, previews, and embeddable share assets.",
      baseUrl: "/api",
      endpoints: [
        {
          method: "POST",
          path: "/api/resolve",
          description: "Resolve a music URL from any supported platform into a universal Linked URL with cross-platform links.",
          parameters: [
            { name: "url", in: "body", type: "string", required: true, description: "Music URL from a supported platform." },
          ],
          example: {
            request: { url: "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm" },
            response: {
              entity: "{ name, artist, image, year, previewUrl, lyrics, links, tracks }",
              source: "{ platform, type, platformId, url }",
              linkedId: "sp-1wNgc05aCdwZHRuC9wMixm",
              linkedUrl: "/song/sp-1wNgc05aCdwZHRuC9wMixm",
            },
          },
        },
        {
          method: "GET",
          path: "/api/entity/:type/:id",
          description: "Resolve a Linked ID back to full metadata with cross-platform links, lyrics, and previews.",
          parameters: [
            { name: "type", in: "path", type: "string", required: true, description: "Entity type: 'song', 'album', or 'artist'." },
            { name: "id", in: "path", type: "string", required: true, description: "The Linked ID (e.g. 'sp-1wNgc05aCdwZHRuC9wMixm')." },
          ],
        },
        {
          method: "GET",
          path: "/api/lyrics",
          description: "Fetch lyrics for a track via the keyless Lrclib API.",
          parameters: [
            { name: "track", in: "query", type: "string", required: true, description: "Track name." },
            { name: "artist", in: "query", type: "string", required: true, description: "Artist name." },
            { name: "album", in: "query", type: "string", required: false, description: "Album name (improves match)." },
            { name: "duration", in: "query", type: "number", required: false, description: "Track duration in seconds (improves match)." },
          ],
        },
        {
          method: "GET",
          path: "/api/oembed",
          description: "oEmbed endpoint for rich previews (Twitter, Discord, Slack). Returns embeddable HTML with thumbnail and metadata.",
          parameters: [
            { name: "url", in: "query", type: "string", required: true, description: "Music URL from a supported platform." },
            { name: "maxwidth", in: "query", type: "number", required: false, description: "Max embed width in pixels (200-1200, default 600)." },
            { name: "theme", in: "query", type: "string", required: false, description: "'light' (default) or 'dark'." },
          ],
          spec: "https://oembed.com/",
        },
        {
          method: "GET",
          path: "/api/og",
          description: "Generate a dynamic 1200x630 Open Graph share image (SVG) with cover art, title, and artist.",
          parameters: [
            { name: "title", in: "query", type: "string", required: true, description: "Entity title." },
            { name: "artist", in: "query", type: "string", required: false, description: "Artist name." },
            { name: "image", in: "query", type: "string", required: false, description: "Cover art URL." },
            { name: "theme", in: "query", type: "string", required: false, description: "'dark' (default) or 'light'." },
          ],
        },
        {
          method: "GET",
          path: "/api/search",
          description: "Search for tracks, albums, or artists across platforms.",
          parameters: [
            { name: "q", in: "query", type: "string", required: true, description: "Search query (e.g. 'Bohemian Rhapsody')." },
            { name: "type", in: "query", type: "string", required: false, description: "'track' (default), 'album', or 'artist'." },
            { name: "limit", in: "query", type: "number", required: false, description: "Number of results (1-25, default 10)." },
            { name: "sources", in: "query", type: "string", required: false, description: "Comma-separated subset of 'deezer', 'spotify', 'apple'." },
          ],
        },
        {
          method: "GET",
          path: "/api/health",
          description: "Health check for the API and all downstream music services. Returns status and latency for each.",
          parameters: [],
        },
        {
          method: "GET",
          path: "/api/help",
          description: "Lightweight API help and roadmap.",
          parameters: [],
        },
        {
          method: "GET",
          path: "/api/docs",
          description: "Full API reference with platform support, entity types, linked IDs, and endpoint definitions.",
          parameters: [],
        },
      ],
      inputPlatforms: PLATFORMS.filter((p) => ["spotify", "apple", "deezer", "tidal", "youtube", "amazonmusic", "bandcamp"].includes(p.key as string)).map((p) => p.name),
      outputPlatforms: PLATFORMS.map((p) => p.name),
      supportedEntityTypes: ["song", "album", "artist", "podcast", "audiobook"],
      contentFeatures: ["lyrics", "audio-previews", "qr-codes", "og-images", "embed-widgets"],
      rateLimit: "30 req/min for resolve & search endpoints. Fair use appreciated.",
      cors: "Enabled for all origins.",
      roadmap: [
        "Apple Music ISRC lookup",
        "Playlist support (cross-platform playlists)",
        "New releases feed",
      ],
    },
    { headers: corsHeaders() }
  );
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
