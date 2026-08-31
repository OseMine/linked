# Linked – Share music across platforms

Linked provides universal music links that resolve to the correct content on any platform (Spotify, Apple Music, Deezer, Tidal, YouTube, Amazon Music).

## Roadmap

- [x] **Keyless Resolution:** Implemented Deezer and iTunes API lookups to resolve metadata and cross-platform links without needing expensive API keys.
- [x] **ISRC Verteiler:** Implemented an ISRC-based resolution engine for songs to ensure accurate cross-platform linking when ISRCs are available.
- [x] **YouTube/Tidal Keyless:** Added keyless metadata resolution for YouTube (official oEmbed API) and Tidal (public GraphQL API). Other platforms (Amazon) remain source-link-only.
- [x] **Tidal & YouTube distribution:** Songs resolved via ISRC now also produce Tidal (credentialed OpenAPI v2 with a keyless GraphQL fallback, when `TIDAL_CLIENT_ID`/`TIDAL_CLIENT_SECRET` are set) and YouTube (keyless title + artist search) links.
- [x] **Persistent Caching:** Added a persistent caching layer on top of the resolver using Next.js Cache Components (`use cache` + `cacheLife`). Resolved links and metadata are cached server-side (hourly revalidation, daily expiry), and underlying API calls use fetch revalidation, so repeated resolution is fast.

## How it works

1. **Source Parsing:** When you paste a link, the app detects the platform and entity type (song/album/artist) using RegEx patterns in `lib/parsers.ts`.
2. **Entity Encoding:** The app creates a "Linked ID" (`/[type]/[code]-[encodedId]`) which encodes the platform and entity ID.
3. **Data Resolution (`lib/songlink.ts`):**
   - **Step A:** It tries to fetch metadata (name, artist, cover, ISRC) from the source platform's API (e.g., Deezer API or iTunes API).
   - **Step B:** For songs with an ISRC, it distributes this ID to other supported platforms to find corresponding links.
   - **Step C:** For albums/artists, it falls back to a title/artist search on Deezer if metadata isn't available.

## How to get a link

Simply copy the share URL from your music app (Spotify, Apple, Deezer, etc.) and paste it into the main page to generate a universal `Linked` URL.

## API

The app exposes its resolution engine over HTTP, so you can generate and resolve Linked URLs programmatically. Both endpoints return CORS headers (`Access-Control-Allow-Origin: *`).

### POST `/api/resolve`

Takes a music URL and returns the resolved entity (metadata + links) plus the generated Linked ID/URL.

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

### Examples

```bash
# Generate a Linked URL from a music link
curl -X POST http://localhost:3000/api/resolve \
  -H "Content-Type: application/json" \
  -d '{"url":"https://open.spotify.com/track/6D7fARfm0eMpAu0j0AQcUB"}'

# Resolve an existing Linked ID
curl http://localhost:3000/api/entity/album/lsp-503iC3dEbNox92qC6vJOiP
```
