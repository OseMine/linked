# Linked – Share music across platforms

Linked provides universal music links that resolve to the correct content on any platform (Spotify, Apple Music, Deezer, Tidal, YouTube, YouTube Music, Amazon Music).

## Features

- **Keyless resolution:** Deezer and iTunes lookups resolve metadata and cross-platform links without needing expensive API keys.
- **ISRC resolution:** Songs are resolved via ISRC to ensure accurate cross-platform linking when the identifier is available.
- **YouTube/Tidal keyless:** Keyless metadata resolution for YouTube (official oEmbed API) and Tidal. Other platforms degrade gracefully without credentials.
- **Credentialed integrations:** When keys are configured, Spotify, Tidal, and Amazon Music enrich resolution (client-credentials flows with in-memory token caching).
- **Persistent caching:** A server-side cache layer (`use cache` + `cacheLife`) stores resolved links and metadata (hourly revalidation, daily expiry) so repeated lookups are fast.
- **Rate limiting:** The resolve and search endpoints are limited to 30 requests/minute per IP (`X-RateLimit-Remaining` / `X-RateLimit-Reset` headers).
- **CORS enabled:** All API endpoints return `Access-Control-Allow-Origin: *`.

## APIs

The app exposes its resolution engine over HTTP, so you can generate and resolve Linked URLs programmatically. Below is a full reference; an interactive reference lives at [/docs](https://linkedapp.ddns.net/docs).

### POST `/api/resolve`

Takes a music URL and returns the resolved entity (metadata + links) plus the generated Linked ID/URL. Rate-limited to 30 req/min.

**Request body:**
```json
{ "url": "https://open.spotify.com/track/6D7fARfm0eMpAu0j0AQcUB" }
```

**Response:**
```json
{
  "entity": {
    "name": "Aber nein",
    "artist": "KUMMER",
    "image": "https://i.scdn.co/image/...",
    "year": 2019,
    "links": {
      "spotify": "https://open.spotify.com/track/6D7fARfm0eMpAu0j0AQcUB",
      "deezer": "https://www.deezer.com/track/4167409372"
    },
    "tracks": []
  },
  "source": {
    "platform": "spotify",
    "type": "song",
    "platformId": "6D7fARfm0eMpAu0j0AQcUB",
    "url": "https://open.spotify.com/track/6D7fARfm0eMpAu0j0AQcUB"
  },
  "linkedId": "ssp-6D7fARfm0eMpAu0j0AQcUB",
  "linkedUrl": "/song/ssp-6D7fARfm0eMpAu0j0AQcUB"
}
```

**Errors:** `400` (missing/invalid body), `422` (unsupported URL), `500` (resolution failed).

### GET `/api/entity/[type]/[id]`

Resolves a Linked ID directly into the same shape as above. `type` is one of `song`, `album`, `artist`.

```
GET /api/entity/song/ssp-6D7fARfm0eMpAu0j0AQcUB
```

### GET `/api/search`

Multi-platform search across Deezer, Spotify, and Apple/iTunes.

**Query params:** `q` (required), `type` (`track`/`album`/`artist`, default `track`), `limit` (1–25, default 10), `sources` (comma-separated subset of `deezer`, `spotify`, `apple`).

```
GET /api/search?q=ahmed+ademovic&type=artist&limit=5
```

Rate-limited to 30 req/min.

### GET `/api/oembed`

oEmbed endpoint for rich embed previews (Twitter, Discord, Slack). Query params: `url` (required), `maxwidth` (200–1200, default 600), `theme` (`light`/`dark`).

```
GET /api/oembed?url=/song/ssp-6D7fARfm0eMpAu0j0AQcUB&theme=dark
```

### GET `/api/health`

Health check for all downstream services (Deezer, Apple/iTunes, Spotify, Tidal, YouTube). Reports a per-service status/latency/error and an overall `healthy`/`degraded`/`down` status.

### GET `/api/docs` and `/api/help`

Machine-readable and human-readable API references.

## How it works

1. **Source Parsing:** When you paste a link, the app detects the platform and entity type (song/album/artist) using RegEx patterns in `lib/parsers.ts`.
2. **Entity Encoding:** The app creates a "Linked ID" (`/[type]/[code]-[encodedId]`) which encodes the platform and entity ID.
3. **Data Resolution (`lib/songlink.ts`):**
   - **Source resolution:** It tries to fetch metadata (name, artist, cover, ISRC) from the source platform's API (Deezer, iTunes, Spotify, YouTube oEmbed, Tidal).
   - **ISRC propagation:** For songs with an ISRC, it distributes this ID to other supported platforms to find corresponding links.
   - **Album/artist search:** For albums/artists, it falls back to a title/artist search across Deezer, iTunes, Spotify, Tidal, YouTube, and Amazon Music.

## How to get a link

Simply copy the share URL from your music app (Spotify, Apple, Deezer, etc.) and paste it into the main page to generate a universal `Linked` URL.

## Environment variables

Copy `.env.example` to `.env.local` and fill in any keys you have. All integrations degrade gracefully, so the app works with none of them set (keyless resolution only).

| Variable | Purpose |
| --- | --- |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Spotify client-credentials – richer source metadata + ISRC, song/album/artist search. |
| `TIDAL_CLIENT_ID` / `TIDAL_CLIENT_SECRET` | Tidal OpenAPI v2 – ISRC link resolution, album/artist search, track metadata. |
| `AMAZON_MUSIC_API_KEY` / `AMAZON_MUSIC_CLIENT_ID` / `AMAZON_MUSIC_CLIENT_SECRET` | Amazon Music OpenAPI v2 – song/album/artist search by query or ISRC. |
| `NEXT_PUBLIC_BASE_URL` | Base URL used for asset/canonical URLs. |

## Supported platforms

- **Input** (pasteable link sources): Spotify, Apple Music, Deezer, Tidal, YouTube (`youtube.com` / `youtu.be`), Amazon Music.
- **Output** (resolvable links): Spotify, Apple Music, Deezer, Tidal, YouTube, YouTube Music (`music.youtube.com`), Amazon Music.

## Examples

```bash
# Generate a Linked URL from a music link
curl -X POST http://localhost:3000/api/resolve \
  -H "Content-Type: application/json" \
  -d '{"url":"https://open.spotify.com/track/6D7fARfm0eMpAu0j0AQcUB"}'

# Resolve an existing Linked ID
curl http://localhost:3000/api/entity/album/lsp-503iC3dEbNox92qC6vJOiP

# Search
curl "http://localhost:3000/api/search?q=KUMMER&type=artist"

# oEmbed card
curl "http://localhost:3000/api/oembed?url=/song/ssp-6D7fARfm0eMpAu0j0AQcUB"
```
