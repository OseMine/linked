import { linkedId } from "@/lib/linked-id";

export type EntityType = "artist" | "song" | "album";

export interface ParsedEntity {
  platform: string;
  entityType: EntityType;
  platformId: string;
  url: string;
  linkedId: string;
}

export function parseUrl(url: string): ParsedEntity | null {
  if (!url || typeof url !== "string") return null;

  url = url.trim();

  const parsers = [
    parseSpotify,
    parseAppleMusic,
    parseDeezer,
    parseTidal,
    parseYouTube,
    parseSoundCloud,
    parseAmazonMusic,
  ];

  for (const parser of parsers) {
    const result = parser(url);
    if (result) {
      return {
        ...result,
        linkedId: linkedId(result.platform, result.entityType, result.platformId),
      };
    }
  }

  return null;
}

function parseSpotify(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const match = url.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?(track|artist|album)\/([a-zA-Z0-9]+)/);
  if (!match) return null;

  const typeMap: Record<string, EntityType> = { track: "song", artist: "artist", album: "album" };

  return {
    platform: "spotify",
    entityType: typeMap[match[1]],
    platformId: match[2],
    url,
  };
}

function parseAppleMusic(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const trackMatch = url.match(/music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/id(\d+)\?i=(\d+)/i);
  if (trackMatch) {
    return {
      platform: "apple",
      entityType: "song",
      platformId: trackMatch[2],
      url,
    };
  }

  const albumMatch = url.match(/music\.apple\.com\/[a-z]{2}\/album\/[^/]+\/id(\d+)/i);
  if (albumMatch) {
    return {
      platform: "apple",
      entityType: "album",
      platformId: albumMatch[1],
      url,
    };
  }

  const artistMatch = url.match(/music\.apple\.com\/[a-z]{2}\/artist\/[^/]+\/id(\d+)/i);
  if (artistMatch) {
    return {
      platform: "apple",
      entityType: "artist",
      platformId: artistMatch[1],
      url,
    };
  }

  return null;
}

function parseDeezer(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const match = url.match(/deezer\.com\/(?:[a-z]{2}\/)?(track|artist|album)\/(\d+)/i);
  if (!match) return null;

  const typeMap: Record<string, EntityType> = { track: "song", artist: "artist", album: "album" };

  return {
    platform: "deezer",
    entityType: typeMap[match[1]],
    platformId: match[2],
    url,
  };
}

function parseTidal(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const match = url.match(/tidal\.com\/(?:browse\/)?(track|artist|album)\/(\d+)/i);
  if (!match) return null;

  const typeMap: Record<string, EntityType> = { track: "song", artist: "artist", album: "album" };

  return {
    platform: "tidal",
    entityType: typeMap[match[1]],
    platformId: match[2],
    url,
  };
}

function parseYouTube(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (!match) return null;

  return {
    platform: "youtube",
    entityType: "song",
    platformId: match[1],
    url,
  };
}

function parseSoundCloud(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const match = url.match(/soundcloud\.com\/([^/?#]+)(?:\/([^/?#]+))?/i);
  if (!match) return null;

  const artistName = match[1];
  const trackName = match[2];

  if (trackName) {
    return {
      platform: "soundcloud",
      entityType: "song",
      platformId: `${artistName}/${trackName}`,
      url,
    };
  }

  return {
    platform: "soundcloud",
    entityType: "artist",
    platformId: artistName,
    url,
  };
}

function parseAmazonMusic(url: string): Omit<ParsedEntity, "linkedId"> | null {
  const trackMatch = url.match(/music\.amazon\.com\/albums\/[A-Z0-9]+\?trackAsin=([A-Z0-9]+)/i);
  if (trackMatch) {
    return {
      platform: "amazon",
      entityType: "song",
      platformId: trackMatch[1],
      url,
    };
  }

  const albumMatch = url.match(/music\.amazon\.com\/albums\/([A-Z0-9]+)/i);
  if (albumMatch) {
    return {
      platform: "amazon",
      entityType: "album",
      platformId: albumMatch[1],
      url,
    };
  }

  const artistMatch = url.match(/music\.amazon\.com\/artists\/([A-Z0-9]+)/i);
  if (artistMatch) {
    return {
      platform: "amazon",
      entityType: "artist",
      platformId: artistMatch[1],
      url,
    };
  }

  return null;
}