import { parseUrl } from "@/lib/parsers";
import { getMusicDataCached } from "@/lib/songlink";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const maxWidth = searchParams.get("maxwidth");
  const theme = searchParams.get("theme") || "light";

  if (!url) {
    return Response.json({ error: "Missing 'url' query parameter." }, { status: 400 });
  }

  const parsed = parseUrl(url);
  if (!parsed) {
    return Response.json(
      { error: "Unsupported URL. Use a link from Spotify, Apple Music, Deezer, Tidal, YouTube, or Amazon Music." },
      { status: 422 }
    );
  }

  let data;
  try {
    data = await getMusicDataCached(parsed.platform, parsed.entityType, parsed.platformId);
  } catch {
    data = null;
  }

  const title = data?.name || "Music";
  const author = data?.artist || "";
  const thumbnail = data?.image || "";
  const siteName = "Linked";

  const width = Math.min(Math.max(parseInt(maxWidth || "600", 10), 200), 1200);
  const height = Math.round(width * 0.6);

  const html = buildEmbedHtml({
    title,
    author,
    thumbnail,
    linkedUrl: `/${parsed.entityType}/${parsed.linkedId}`,
    theme,
  });

  return Response.json(
    {
      type: "rich",
      version: "1.0",
      title,
      author_name: author,
      thumbnail_url: thumbnail || undefined,
      thumbnail_width: 600,
      thumbnail_height: 360,
      width,
      height,
      html,
      provider_name: siteName,
      provider_url: "/",
    },
    { headers: corsHeaders() }
  );
}

function buildEmbedHtml(opts: {
  title: string;
  author: string;
  thumbnail: string;
  linkedUrl: string;
  theme: string;
}): string {
  const { title, author, thumbnail, linkedUrl, theme } = opts;
  const isDark = theme === "dark";
  const bg = isDark ? "#1a1a2e" : "#ffffff";
  const fg = isDark ? "#e0e0e0" : "#1a1a2e";
  const sub = isDark ? "#a0a0b0" : "#666677";
  const border = isDark ? "#333355" : "#e0e0e8";

  const imgTag = thumbnail
    ? `<img src="${escapeAttr(thumbnail)}" alt="${escapeAttr(title)}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;" />`
    : `<div style="width:80px;height:80px;border-radius:8px;background:${border};display:flex;align-items:center;justify-content:center;font-size:32px;">&#9835;</div>`;

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:${bg};border:1px solid ${border};border-radius:12px;padding:16px;display:flex;gap:16px;align-items:center;max-width:600px;">
  ${imgTag}
  <div style="flex:1;min-width:0;">
    <div style="font-size:16px;font-weight:600;color:${fg};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(title)}</div>
    <div style="font-size:13px;color:${sub};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(author)}</div>
    <a href="${escapeAttr(linkedUrl)}" style="display:inline-block;margin-top:8px;padding:6px 14px;background:#6c5ce7;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:500;">Open in Linked</a>
  </div>
</div>`;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
