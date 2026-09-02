import { decodeLinkedId } from "@/lib/linked-id";
import { getMusicDataCached } from "@/lib/songlink";
import type { NextRequest } from "next/server";

export default function EmbedPage() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#a1a1a6", fontFamily: "sans-serif" }}>
      <p>This is an embeddable widget. Use it in an iframe:</p>
      <code style={{ fontSize: 12 }}>&lt;iframe src="..."&gt;&lt;/iframe&gt;</code>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return new Response(
      buildEmbedHtml({
        title: "Linked",
        artist: "",
        image: "",
        linkedUrl: "/",
        theme: "dark",
        entityType: "song",
      }),
      { headers: { "Content-Type": "text/html", "Access-Control-Allow-Origin": "*" } }
    );
  }

  const decoded = decodeLinkedId(id);
  if (!decoded || decoded.type !== type) {
    return new Response("Invalid linked ID", { status: 404 });
  }

  let data;
  try {
    data = await getMusicDataCached(decoded.platform, decoded.type, decoded.platformId);
  } catch {
    return new Response("Failed to load", { status: 500 });
  }

  const html = buildEmbedHtml({
    title: data.name,
    artist: data.artist || "",
    image: data.image || "",
    linkedUrl: `/${decoded.type}/${id}`,
    theme: "dark",
    entityType: decoded.type,
    previewUrl: data.previewUrl,
    tracks: data.tracks,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

interface EmbedOpts {
  title: string;
  artist: string;
  image: string;
  linkedUrl: string;
  theme: string;
  entityType: string;
  previewUrl?: string | null;
  tracks?: { name: string; duration: number | null }[];
}

function buildEmbedHtml(opts: EmbedOpts): string {
  const { title, artist, image, linkedUrl, entityType, previewUrl, tracks } = opts;
  const bg = "#0a0a0a";
  const fg = "#ffffff";
  const sub = "#a1a1a6";
  const border = "#222225";
  const accent = "#6c5ce7";

  const imgTag = image
    ? `<img src="${esc(image)}" alt="${esc(title)}" style="width:80px;height:80px;border-radius:12px;object-fit:cover;" />`
    : `<div style="width:80px;height:80px;border-radius:12px;background:${border};display:flex;align-items:center;justify-content:center;font-size:32px;color:${sub}">&#9835;</div>`;

  let tracklistHtml = "";
  if (entityType === "album" && tracks && tracks.length > 0) {
    const items = tracks.slice(0, 10).map((t, i) => {
      const dur = t.duration ? `${Math.floor(t.duration / 60)}:${(t.duration % 60).toString().padStart(2, "0")}` : "--:--";
      return `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid ${border};font-size:12px;color:${sub};">
        <span>${i + 1}. ${esc(t.name)}</span>
        <span>${dur}</span>
      </div>`;
    }).join("");
    tracklistHtml = `<div style="margin-top:12px;max-height:200px;overflow-y:auto;">${items}</div>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="padding:16px;display:flex;gap:16px;align-items:flex-start;max-width:400px;">
  ${imgTag}
  <div style="flex:1;min-width:0;">
    <div style="font-size:15px;font-weight:600;color:${fg};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(title)}</div>
    <div style="font-size:12px;color:${sub};margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(artist)}</div>
    <a href="${esc(linkedUrl)}" target="_blank" rel="noopener" style="display:inline-block;margin-top:10px;padding:6px 16px;background:${accent};color:#fff;border-radius:8px;text-decoration:none;font-size:12px;font-weight:500;">Open in Linked</a>
  </div>
</div>
${tracklistHtml}
${previewUrl ? `<audio id="preview" src="${esc(previewUrl)}" preload="none"></audio>
<div style="padding:0 16px 16px;">
  <button onclick="var a=document.getElementById('preview');a.paused?a.play():a.pause();" style="padding:6px 14px;background:${border};color:${fg};border:none;border-radius:6px;cursor:pointer;font-size:12px;">&#9654; Preview</button>
</div>` : ''}
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
