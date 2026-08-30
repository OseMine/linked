# Linked – Share music across platforms

Linked provides universal music links that resolve to the correct content on any platform (Spotify, Apple Music, Deezer, Tidal, YouTube, SoundCloud, Amazon Music).

## Roadmap

- [x] **Keyless Resolution:** Implemented Deezer and iTunes API lookups to resolve metadata and cross-platform links without needing expensive API keys.
- [x] **ISRC Verteiler:** Implemented an ISRC-based resolution engine for songs to ensure accurate cross-platform linking when ISRCs are available.
- [ ] **YouTube/Tidal Keyless:** Investigating keyless options for YouTube and Tidal metadata resolution.
- [ ] **Persistent Caching:** Adding redis or similar for faster link resolution.

## How it works

1. **Source Parsing:** When you paste a link, the app detects the platform and entity type (song/album/artist) using RegEx patterns in `lib/parsers.ts`.
2. **Entity Encoding:** The app creates a "Linked ID" (`/[type]/[code]-[encodedId]`) which encodes the platform and entity ID.
3. **Data Resolution (`lib/songlink.ts`):**
   - **Step A:** It tries to fetch metadata (name, artist, cover, ISRC) from the source platform's API (e.g., Deezer API or iTunes API).
   - **Step B:** For songs with an ISRC, it distributes this ID to other supported platforms to find corresponding links.
   - **Step C:** For albums/artists, it falls back to a title/artist search on Deezer if metadata isn't available.

## How to get a link

Simply copy the share URL from your music app (Spotify, Apple, Deezer, etc.) and paste it into the main page to generate a universal `Linked` URL.
