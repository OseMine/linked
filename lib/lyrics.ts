export interface LrclibTrack {
  id: number;
  trackName: string;
  artistName: string;
  albumName: string;
  duration: number;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export interface LyricsResult {
  plainLyrics: string | null;
  syncedLyrics: string | null;
  instrumental: boolean;
  source: "lrclib";
}

export async function fetchLyrics(
  trackName: string,
  artistName: string,
  albumName?: string,
  duration?: number
): Promise<LyricsResult | null> {
  const params = new URLSearchParams({
    track_name: trackName,
    artist_name: artistName,
  });
  if (albumName) params.set("album_name", albumName);
  if (duration) params.set("duration", String(duration));

  try {
    const response = await fetch(
      `https://lrclib.net/api/get?${params.toString()}`,
      { next: { revalidate: 86400 } }
    );
    if (!response.ok) return null;
    const data: LrclibTrack = await response.json();
    return {
      plainLyrics: data.plainLyrics || null,
      syncedLyrics: data.syncedLyrics || null,
      instrumental: data.instrumental,
      source: "lrclib",
    };
  } catch {
    return null;
  }
}

export async function searchLyrics(
  query: string,
  limit: number = 5
): Promise<LrclibTrack[]> {
  try {
    const response = await fetch(
      `https://lrclib.net/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
      { next: { revalidate: 3600 } }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}
