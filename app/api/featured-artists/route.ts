import { parseUrl } from "@/lib/parsers";
import { getArtistMetadataCached } from "@/lib/songlink";

export async function POST(request: Request) {
  let body: { urls?: string[] };

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!Array.isArray(body.urls) || body.urls.length !== 4 || body.urls.some((url) => typeof url !== "string")) {
    return Response.json({ error: "Provide exactly four artist URLs." }, { status: 400 });
  }

  const artists = await Promise.all(
    body.urls.map(async (url) => {
      const parsed = parseUrl(url);
      if (!parsed || parsed.entityType !== "artist") return null;

      try {
        const entity = await getArtistMetadataCached(parsed.platform, parsed.platformId);
        return {
          name: entity.name,
          image: entity.image,
          linkedUrl: `/${parsed.entityType}/${parsed.linkedId}`,
        };
      } catch {
        return null;
      }
    }),
  );

  return Response.json({ artists: artists.filter((artist) => artist !== null) });
}
