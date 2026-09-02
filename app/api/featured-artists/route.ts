import { parseUrl } from "@/lib/parsers";
import { getArtistMetadataCached } from "@/lib/songlink";

interface FeaturedArtistResult {
  name: string;
  linkedUrl: string;
  image: string | null;
}

const FALLBACK_ARTIST = {
  name: "Artist",
  linkedUrl: "/",
  image: null,
};

export async function POST(request: Request) {
  let body: { urls?: string[] };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.urls) || body.urls.length === 0 || body.urls.some((url) => typeof url !== "string")) {
    return Response.json({ error: "Provide at least one artist URL." }, { status: 400 });
  }

  // Resolve up to 8 submissions in parallel; tolerate individual failures.
  const results = await Promise.allSettled(
    body.urls.map(async (url) => {
      const parsed = parseUrl(url);
      if (!parsed || parsed.entityType !== "artist") return null;

      const entity = await getArtistMetadataCached(parsed.platform, parsed.platformId);
      return {
        name: entity.name,
        image: entity.image,
        linkedUrl: `/${parsed.entityType}/${parsed.linkedId}`,
      };
    }),
  );

  const artists = results
    .map((r) => (r.status === "fulfilled" ? r.value : null))
    .filter((a): a is FeaturedArtistResult => a !== null);

  // Always return exactly 4 cards so the grid never has awkward gaps.
  while (artists.length < 4) {
    artists.push({ ...FALLBACK_ARTIST });
  }

  return Response.json({ artists: artists.slice(0, 4) });
}
