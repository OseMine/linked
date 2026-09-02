# Linked – Share music across platforms

Linked provides universal music links that resolve to the correct content on any platform (Spotify, Apple Music, Deezer, Tidal, YouTube, YouTube Music, Amazon Music, Bandcamp).

## Features

### Core resolution
- **Keyless resolution:** Deezer and iTunes lookups resolve metadata and cross-platform links without needing expensive API keys.
- **ISRC resolution:** Songs are resolved via ISRC to ensure accurate cross-platform linking when the identifier is available.
- **YouTube/Tidal keyless:** Keyless metadata resolution for YouTube (official oEmbed API) and Tidal. Other platforms degrade gracefully without credentials.
- **Credentialed integrations:** When keys are configured, Spotify, Tidal, and Amazon Music enrich resolution (client-credentials flows with in-memory token caching).
- **Persistent caching:** A server-side cache layer (`use cache` + `cacheLife`) stores resolved links and metadata (hourly revalidation, daily expiry) so repeated lookups are fast.
- **Rate limiting:** The resolve and search endpoints are limited to 30 requests/minute per IP (`X-RateLimit-Remaining` / `X-RateLimit-Reset` headers).
- **CORS enabled:** All API endpoints return `Access-Control-Allow-Origin: *`.

### Content & enrichment
- **Lyrics:** Songs without ISRC metadata still get lyrics via the keyless [Lrclib](https://lrclib.net) API, shown in an expandable panel on entity pages.
- **Audio previews:** 30-second Spotify preview clips are embedded in a play/pause control on song pages when available.
- **Dynamic OG images:** A `/api/og` endpoint generates styled 1200x630 share cards (cover art + title + artist) for Twitter/Instagram/Discord.
- **QR codes:** Every entity page can generate a scannable QR code for its universal URL (downloadable as SVG).
- **Embed widgets:** `/embed/[type]/[id]` serves a self-contained HTML mini-player that can be dropped into any site via `<iframe>` (includes album tracklists and audio previews).

### User experience
- **Link history:** Recently resolved links are stored in `localStorage` and surfaced on the home page (no auth needed, max 50 entries).
- **i18n:** UI auto-translates based on the device language — English, Spanish (`es`), and Japanese (`ja`). No manual switcher; locale is detected from `navigator.language`.
- **Offline PWA:** A service worker + web app manifest enable installability and offline access to recently viewed pages.
- **Podcast/audiobook handling:** Non-music entities show a graceful, region-aware fallback instead of empty links.

### Products & tooling
- **Browser extension** (`packages/extension/`): Manifest V3 extension that detects music URLs and offers a one-click "Open in Linked" banner/button.
- **CLI tool** (`packages/cli/`): Resolve, detect, and open music links directly from the terminal.
- **Turborepo structure:** The repo is laid out for a monorepo (root `turbo.json`, `apps/` + `packages/` workspaces).

## Platforms

| Role | Platforms |
| --- | --- |
| **Input** (pasteable) | Spotify, Apple Music, Deezer, Tidal, YouTube (`youtube.com`/`youtu.be`), Amazon Music, Bandcamp |
| **Output** (resolvable) | Spotify, Apple Music, Deezer, Tidal, YouTube, YouTube Music, Amazon Music, Bandcamp |

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
    "previewUrl": "https://p.scdn.co/mp3-preview/...",
    "lyrics": {
      "plainLyrics": "Aber nein, aber nein ...",
      "syncedLyrics": null,
      "instrumental": false
    },
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

### GET `/api/lyrics`

Fetches lyrics for a track via the keyless Lrclib API. Query params: `track` (required), `artist` (required), `album` (optional), `duration` (optional, seconds).

```
GET /api/lyrics?track=Aber+nein&artist=KUMMER
```

**Response:**
```json
{
  "plainLyrics": "...",
  "syncedLyrics": null,
  "instrumental": false,
  "source": "lrclib"
}
```

### GET `/api/og`

Generates a dynamic 1200x630 OG share image (SVG). Query params: `title`, `artist`, `image`, `theme` (`dark`/`light`).

```
GET /api/og?title=Aber+nein&artist=KUMMER&image=https://i.scdn.co/image/...
```

### GET `/api/health`

Health check for all downstream services (Deezer, Apple/iTunes, Spotify, Tidal, YouTube). Reports a per-service status/latency/error and an overall `healthy`/`degraded`/`down` status.

### GET `/api/docs` and `/api/help`

Machine-readable and human-readable API references.

## Embed widget

Every entity can be embedded as a self-contained mini-player (album tracklists + audio previews included):

```html
<iframe
  src="https://linkedapp.ddns.net/embed/song/ssp-6D7fARfm0eMpAu0j0AQcUB"
  width="400"
  height="200"
  frameborder="0"
  style="border-radius:12px;border:1px solid #222;">
</iframe>
```

The correct embed code is also available on each entity page under the **Embed** share tab.

## CLI

Resolve music links from the terminal:

```bash
npx linked resolve <url>      # Resolve to a universal Linked URL
npx linked detect <url>       # Detect the platform
npx linked open <url>         # Resolve and open in the browser
```

## Browser extension

A Manifest V3 extension lives in [`packages/extension/`](packages/extension/). It auto-detects music URLs on supported platforms and shows an "Open in Linked" banner. To load it: `chrome://extensions` → Developer mode → Load unpacked → select the folder.

## How it works

1. **Source Parsing:** When you paste a link, the app detects the platform and entity type (song/album/artist) using RegEx patterns in `lib/parsers.ts`.
2. **Entity Encoding:** The app creates a "Linked ID" (`/[type]/[code]-[encodedId]`) which encodes the platform and entity ID.
3. **Data Resolution (`lib/songlink.ts`):**
   - **Source resolution:** It tries to fetch metadata (name, artist, cover, ISRC) from the source platform's API (Deezer, iTunes, Spotify, YouTube oEmbed, Tidal).
   - **ISRC propagation:** For songs with an ISRC, it distributes this ID to other supported platforms to find corresponding links.
   - **Album/artist search:** For albums/artists, it falls back to a title/artist search across Deezer, iTunes, Spotify, Tidal, YouTube, and Amazon Music.
4. **Enrichment:** For songs, lyrics are fetched from Lrclib and Spotify preview clips are attached (keyless where possible).

## How to get a link

Simply copy the share URL from your music app (Spotify, Apple, Deezer, etc.) and paste it into the main page to generate a universal `Linked` URL.

## Environment variables

Copy `.env.example` to `.env.local` and fill in any keys you have. All integrations degrade gracefully, so the app works with none of them set (keyless resolution only).

| Variable | Purpose |
| --- | --- |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Spotify client-credentials – richer source metadata + ISRC + preview clips, song/album/artist search. |
| `TIDAL_CLIENT_ID` / `TIDAL_CLIENT_SECRET` | Tidal OpenAPI v2 – ISRC link resolution, album/artist search, track metadata. |
| `AMAZON_MUSIC_API_KEY` / `AMAZON_MUSIC_CLIENT_ID` / `AMAZON_MUSIC_CLIENT_SECRET` | Amazon Music OpenAPI v2 – song/album/artist search by query or ISRC. |
| `NEXT_PUBLIC_BASE_URL` | Base URL used for asset/canonical/OG URLs. |

## Repository layout

```
app/                  # Next.js App Router (pages + API routes)
components/           # React components (EntityHero, LinkHistory, etc.)
lib/                  # Core logic: parsers, linked-id, songlink, lyrics, qr, history, rate-limit, i18n
public/               # Static assets incl. PWA manifest + service worker
packages/
  extension/          # Chrome/Firefox Manifest V3 browser extension
  cli/                # Terminal CLI tool
```

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

# Lyrics
curl "http://localhost:3000/api/lyrics?track=Aber+nein&artist=KUMMER"

# OG share image
curl "http://localhost:3000/api/og?title=Aber+nein&artist=KUMMER"
```
