import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "Music";
  const artist = searchParams.get("artist") || "";
  const image = searchParams.get("image") || "";
  const theme = searchParams.get("theme") || "dark";

  const isDark = theme === "dark";
  const bg = isDark ? "#0a0a0a" : "#ffffff";
  const fg = isDark ? "#ffffff" : "#1a1a2e";
  const sub = isDark ? "#a1a1a6" : "#666677";
  const accent = "#6c5ce7";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${isDark ? '#1a1a2e' : '#f0f0f5'};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${accent};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a29bfe;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${image ? `<image href="${escapeXmlAttr(image)}" x="80" y="140" width="300" height="300" rx="24" preserveAspectRatio="xMidYMid slice"/>` : `<rect x="80" y="140" width="300" height="300" rx="24" fill="${isDark ? '#1a1a2e' : '#e8e8ed'}"/>`}
  <text x="440" y="220" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="48" font-weight="700" fill="${fg}">${escapeXmlText(title.length > 30 ? title.slice(0, 27) + '...' : title)}</text>
  ${artist ? `<text x="440" y="280" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="28" fill="${sub}">${escapeXmlText(artist.length > 40 ? artist.slice(0, 37) + '...' : artist)}</text>` : ''}
  <rect x="440" y="340" width="200" height="50" rx="25" fill="url(#accent)"/>
  <text x="540" y="372" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="20" font-weight="600" fill="#ffffff" text-anchor="middle">Open in Linked</text>
  <text x="600" y="580" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" font-size="16" fill="${sub}" text-anchor="middle">linkedapp.ddns.net</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function escapeXmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeXmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
