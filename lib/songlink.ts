export interface EntityData {
  name: string;
  artist: string | null;
  image: string | null;
  year: number | null;
  links: Record<string, string>;
  tracks: { name: string; duration: number | null }[];
}

// --- Platform URL builders -------------------------------------------------
const PLATFORM_URLS: Record<string, Record<string, (id: string) => string>> = {
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
  soundcloud: {
    artist: (id) => `https://soundcloud.com/${id}`,
    song: (id) => `https://soundcloud.com/${id}`,
    album: (id) => `https://soundcloud.com/${id}/sets/${id}`,
  },
  amazon: {
    artist: (id) => `https://music.amazon.com/artists/${id}`,
    album: (id) => `https://music.amazon.com/albums/${id}`,
    song: (id) => `https://music.amazon.com/albums/${id}?trackAsin=${id}`,
  },
};

function buildPlatformUrl(platform: string, type: string, id: string): string {
  const builder = PLATFORM_URLS[platform]?.[type];
  if (!builder) throw new Error("Unsupported platform/type combination");
  return builder(id);
}

// --- Internal entity shape used by resolvers -------------------------------
interface ResolvedEntity {
  name: string;
  artist: string | null;
  image: string | null;
  year: number | null;
  links: Record<string, string>;
  tracks: { name: string; duration: number | null }[];
  isrc?: string | null;
}

function emptyEntity(platform: string, type: string, platformId: string): ResolvedEntity {
  return {
    name: type === "artist" ? "Artist" : type === "song" ? "Song" : "Album",
    artist: type === "artist" ? null : "Artist",
    image: null,
    year: null,
    links: { [platform]: buildPlatformUrl(platform, type, platformId) },
    tracks: type === "album" ? [{ name: "Track 1", duration: 180 }] : [],
  };
}

// --- Deezer (keyless) -------------------------------------------------------
interface DeezerTrack {
  id: number;
  isrc: string;
  title: string;
  link: string;
  duration: number;
  artist?: { id: number; name: string };
  album?: { id: number; title: string; cover_xl?: string; release_date?: string };
}

interface DeezerAlbum {
  id: number;
  link: string;
  title: string;
  cover_xl?: string;
  original_cover?: string;
  release_date?: string;
  tracks?: { data: { title: string; duration: number }[] };
}

interface DeezerSearchItem {
  id: number;
  title?: string;
  link: string;
  type?: string;
  artist?: { id: number; name: string };
  album?: { id: number; title: string };
}

interface DeezerSearchResponse {
  data: DeezerSearchItem[];
}

async function deezerGet<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`https://api.deezer.com${path}`, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getDeezerTrack(id: string): Promise<DeezerTrack | null> {
  return deezerGet<DeezerTrack>(`/track/${id}`);
}

async function getDeezerTrackByIsrc(isrc: string): Promise<DeezerTrack | null> {
  return deezerGet<DeezerTrack>(`/track/isrc:${encodeURIComponent(isrc)}`);
}

async function searchDeezerByTitle(title: string, artist?: string): Promise<DeezerSearchItem | null> {
  const query = [title, artist].filter(Boolean).join(" ");
  const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=5`;
  const response = await fetch(url, { next: { revalidate: 3600 } });
  if (!response.ok) return null;
  const data: DeezerSearchResponse = await response.json();
  return (data.data || [])[0] || null;
}

async function getDeezerAlbum(id: number): Promise<DeezerAlbum | null> {
  return deezerGet<DeezerAlbum>(`/album/${id}`);
}

// --- iTunes/Apple (keyless) -------------------------------------------------
async function iTunesLookup(platformId: string): Promise<{ title: string; artist: string; year: number | null; artwork: string | null } | null> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(platformId)}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.results || data.results.length === 0) return null;
    const r = data.results[0];
    return {
      title: r.trackName || r.collectionName || "Unknown",
      artist: r.artistName || "Unknown",
      year: r.releaseDate ? new Date(r.releaseDate).getFullYear() : null,
      artwork: r.artworkUrl100?.replace("100x100", "600x600") || null,
    };
  } catch {
    return null;
  }
}

// --- Spotify API (needs key via env) ---------------------------------------------
let spotifyToken: { token: string; expires: number } | null = null;

async function getSpotifyAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  if (spotifyToken && spotifyToken.expires > Date.now()) return spotifyToken.token;
  try {
    const body = `grant_type=client_credentials`;
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      },
      body,
      cache: "no-store",
    });
    if (!response.ok) return null;
    const data = await response.json();
    spotifyToken = { token: data.access_token as string, expires: Date.now() + (data.expires_in || 3600) * 1000 };
    return data.access_token as string;
  } catch {
    return null;
  }
}

async function spGet<T>(path: string): Promise<T | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const token = await getSpotifyAccessToken(clientId, clientSecret);
  if (!token) return null;
  try {
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function getSpotifyTrack(id: string): Promise<{ isrc: string | null; name: string; artist: string; image: string | null; year: number | null } | null> {
  const data = await spGet<any>(`/tracks/${id}`);
  if (!data) return null;
  return {
    isrc: data.external_ids?.isrc || null,
    name: data.name || "Unknown",
    artist: data.artists?.[0]?.name || "Unknown",
    image: data.album?.images?.[0]?.url || null,
    year: data.album?.release_date ? new Date(data.album.release_date).getFullYear() : null,
  };
}

async function getSpotifyAlbum(id: string): Promise<{ name: string; artist: string; image: string | null; year: number | null; tracks: { name: string; duration: number | null }[] } | null> {
  const data = await spGet<any>(`/albums/${id}`);
  if (!data) return null;
  return {
    name: data.name || "Unknown",
    artist: data.artists?.[0]?.name || "Unknown",
    image: data.images?.[0]?.url || null,
    year: data.release_date ? new Date(data.release_date).getFullYear() : null,
    tracks: (data.tracks?.items || []).map((t: any) => ({
      name: t.name || "Unknown",
      duration: t.duration_ms ? Math.floor(t.duration_ms / 1000) : null,
    })),
  };
}

async function getSpotifyArtist(id: string): Promise<{ name: string; image: string | null } | null> {
  const data = await spGet<any>(`/artists/${id}`);
  if (!data) return null;
  return {
    name: data.name || "Unknown",
    image: data.images?.[0]?.url || null,
  };
}

async function spotifySearchTrackByIsrc(isrc: string): Promise<string | null> {
  const data = await spGet<any>(`/search?q=${encodeURIComponent(`isrc:${isrc}`)}&type=track&limit=1`);
  if (!data) return null;
  const track = data.tracks?.items?.[0];
  return track ? `https://open.spotify.com/track/${track.id}` : null;
}

// --- Spotify oEmbed (keyless, metadata only) ------------------------------------
async function spotifyOembed(platform: string, type: string, id: string): Promise<{ name: string; image: string | null } | null> {
  try {
    const url = `https://open.spotify.com/oembed?url=${encodeURIComponent(buildPlatformUrl(platform, type, id))}`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      name: data.title || null,
      image: data.thumbnail_url || null,
    };
  } catch {
    return null;
  }
}

// --- Source resolution: get metadata (+ isrc) from whichever platform --------
// Returns base entity (source link) + optional isrc for songs.
async function resolveSource(
  platform: string,
  type: string,
  platformId: string
): Promise<ResolvedEntity> {
  const entity = emptyEntity(platform, type, platformId);

  // Deezer source: full metadata + ISRC keyless
  if (platform === "deezer") {
    if (type === "song") {
      const track = await getDeezerTrack(platformId);
      if (track) {
        entity.name = track.title;
        entity.artist = track.artist?.name || null;
        entity.image = track.album?.cover_xl || null;
        entity.links.deezer = track.link;
        entity.isrc = track.isrc || null;
        entity.tracks[0] = { name: track.title, duration: track.duration };
      }
    } else if (type === "album") {
      const album = await getDeezerAlbum(Number(platformId));
      if (album) {
        entity.name = album.title;
        entity.artist = entity.artist; // artist not in album response
        entity.image = album.cover_xl || album.original_cover || null;
        entity.year = album.release_date ? new Date(album.release_date).getFullYear() : null;
        entity.links.deezer = album.link;
        entity.tracks = (album.tracks?.data || []).map((t) => ({ name: t.title, duration: t.duration }));
      }
    }
    // artist type: keep source link only
    return entity;
  }

  // Apple source: metadata via iTunes lookup (keyless), ISRC unavailable
  if (platform === "apple") {
    const it = await iTunesLookup(platformId);
    if (it) {
      entity.name = it.title;
      entity.artist = type === "artist" ? null : it.artist;
      entity.image = it.artwork;
      entity.year = it.year;
    }
    return entity;
  }

  // Spotify source: metadata via API (if keys present) or oEmbed fallback
  if (platform === "spotify") {
    if (type === "song") {
      const spotify = await getSpotifyTrack(platformId);
      if (spotify) {
        entity.name = spotify.name;
        entity.artist = spotify.artist;
        entity.image = spotify.image;
        entity.year = spotify.year;
        entity.isrc = spotify.isrc;
        return entity;
      }
    } else if (type === "album") {
      const album = await getSpotifyAlbum(platformId);
      if (album) {
        entity.name = album.name;
        entity.artist = album.artist;
        entity.image = album.image;
        entity.year = album.year;
        entity.tracks = album.tracks;
        return entity;
      }
    } else if (type === "artist") {
      const artist = await getSpotifyArtist(platformId);
      if (artist) {
        entity.name = artist.name;
        entity.image = artist.image;
        return entity;
      }
    }
    
    // Keyless metadata fallback via oEmbed for Spotify songs/albums/artists
    const oembed = await spotifyOembed(platform, type, platformId);
    if (oembed) {
      entity.name = oembed.name;
      entity.image = oembed.image;
    }
    return entity;
  }

  // Other sources (tidal, youtube, soundcloud, amazon): source link only (no keyless metadata)
  return entity;
}

// --- ISRC propagator: given isrc, find links on all supported platforms ------
async function resolveLinksFromIsrc(
  isrc: string,
  sourcePlatform: string,
  base: ResolvedEntity
): Promise<void> {
  // Deezer: direct ISRC lookup (keyless)
  if (sourcePlatform !== "deezer") {
    const deezerTrack = await getDeezerTrackByIsrc(isrc);
    if (deezerTrack) {
      base.links.deezer = deezerTrack.link;
      // enrich metadata if missing
      if (base.name === "Song" || !base.name) {
        base.name = deezerTrack.title;
        base.artist = deezerTrack.artist?.name || base.artist;
        base.image = deezerTrack.album?.cover_xl || base.image;
      }
    }
  }

  // Spotify: ISRC search (only with keys)
  if (sourcePlatform !== "spotify") {
    const spotifyUrl = await spotifySearchTrackByIsrc(isrc);
    if (spotifyUrl) base.links.spotify = spotifyUrl;
  }
}

// --- Main entry ---------------------------------------------------------------
export async function fetchMusicData(
  platform: string,
  type: string,
  platformId: string
): Promise<EntityData> {
  // 1. Source metadata + ISRC (keyless where possible)
  const entity = await resolveSource(platform, type, platformId);

  // 2. For songs with ISRC: find links on other platforms
  if (type === "song" && entity.isrc) {
    await resolveLinksFromIsrc(entity.isrc, platform, entity);
  }

  // 3. For albums/artists (or songs without ISRC): Deezer keyless title/artist search
  if (platform !== "deezer" && type !== "song") {
    const queryParts: string[] = [];
    if (entity.name && entity.name !== "Song" && entity.name !== "Album") queryParts.push(entity.name);
    if (entity.artist) queryParts.push(entity.artist);
    if (queryParts.length) {
      const item = await searchDeezerByTitle(queryParts.join(" "));
      if (item) {
        if (type === "album") entity.links.deezer = `https://www.deezer.com/album/${item.album?.id || item.id}`;
        else if (type === "artist") entity.links.deezer = `https://www.deezer.com/artist/${item.id}`;
      }
    }
  }

  return stripInternals(entity);
}

function stripInternals(entity: ResolvedEntity): EntityData {
  const { isrc, ...rest } = entity;
  return rest;
}