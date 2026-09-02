import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "API Reference — Linked",
  description: "Full API reference for the Linked music link unification service.",
};

import "./docs.css";
import { CodeTabs, EndpointList } from "./DocsClient";

const API_VERSION = "1.1.0";

const ENDPOINTS = [
  { method: "POST", path: "/api/resolve", desc: "Resolve a music URL into a universal Linked URL with cross-platform links, lyrics, and previews.", params: [{ name: "url", type: "string", required: true, desc: "Music URL from a supported platform", in: "body" }], badge: "resolve" },
  { method: "GET", path: "/api/entity/:type/:id", desc: "Resolve a Linked ID back to full metadata with cross-platform links.", params: [{ name: "type", type: "string", required: true, desc: "Entity type: song, album, artist, podcast, or audiobook", in: "path" }, { name: "id", type: "string", required: true, desc: "Linked ID (e.g. sp-1wNgc05aCdwZHRuC9wMixm)", in: "path" }], badge: "entity" },
  { method: "GET", path: "/api/lyrics", desc: "Fetch lyrics for a track via the keyless Lrclib API.", params: [{ name: "track", type: "string", required: true, desc: "Track name", in: "query" }, { name: "artist", type: "string", required: true, desc: "Artist name", in: "query" }, { name: "album", type: "string", required: false, desc: "Album name (improves match)", in: "query" }, { name: "duration", type: "number", required: false, desc: "Track duration in seconds (improves match)", in: "query" }], badge: "lyrics" },
  { method: "GET", path: "/api/og", desc: "Generate a dynamic 1200x630 Open Graph share image (SVG) for social cards.", params: [{ name: "title", type: "string", required: true, desc: "Entity title", in: "query" }, { name: "artist", type: "string", required: false, desc: "Artist name", in: "query" }, { name: "image", type: "string", required: false, desc: "Cover art URL", in: "query" }, { name: "theme", type: "string", required: false, desc: "'dark' or 'light'", in: "query" }], badge: "og" },
  { method: "GET", path: "/api/oembed", desc: "oEmbed endpoint for rich previews (Twitter, Discord, Slack).", params: [{ name: "url", type: "string", required: true, desc: "Music URL from a supported platform", in: "query" }, { name: "maxwidth", type: "number", required: false, desc: "Max embed width (200-1200, default 600)", in: "query" }, { name: "theme", type: "string", required: false, desc: "'light' or 'dark'", in: "query" }], badge: "oembed" },
  { method: "GET", path: "/api/search", desc: "Search for tracks, albums, or artists across platforms (Deezer, Spotify, Apple).", params: [{ name: "q", type: "string", required: true, desc: "Search query", in: "query" }, { name: "type", type: "string", required: false, desc: "track / album / artist", in: "query" }, { name: "limit", type: "number", required: false, desc: "Results (1-25, default 10)", in: "query" }, { name: "sources", type: "string", required: false, desc: "Comma-separated: deezer, spotify, apple", in: "query" }], badge: "search" },
  { method: "GET", path: "/api/health", desc: "Health check for the API and downstream services.", params: [], badge: "health" },
  { method: "GET", path: "/api/docs", desc: "This page. Full API reference.", params: [], badge: "docs" },
];

export default function DocsPage() {
  return (
    <div className="docs-page" style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", minHeight: "100vh", padding: "60px 24px 100px" }}>
      <div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", gap: "3rem", alignItems: "start" }}>
        {/* Sidebar */}
        <aside style={{ width: 260, flexShrink: 0, position: "sticky", top: 32, height: "fit-content", fontSize: 13 }} aria-label="Table of Contents">
          <Link href="/" style={{ color: "#a1a1a6", textDecoration: "none", fontSize: 14, display: "inline-block", padding: "8px 16px", background: "#161617", border: "1px solid #333", borderRadius: 8, marginBottom: 16 }}>
            ← Back home
          </Link>
          <div style={{ marginBottom: 8, fontFamily: "-apple-system, sans-serif", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6c5ce7" }}>
            API Reference
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, margin: "0 0 8px", letterSpacing: -1, background: "linear-gradient(135deg, #fff 0%, #a1a1a6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Linked API</h1>
          <div style={{ fontSize: 14, color: "#a1a1a6", marginBottom: 20, lineHeight: 1.5 }}>One link for every music platform.</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#a29bfe", background: "rgba(108,92,231,0.15)", padding: "3px 10px", borderRadius: 20, display: "inline-block", marginBottom: 24 }}>v{API_VERSION}</div>

          <nav style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 8, display: "flex", flexDirection: "column", gap: 2 }} aria-label="Section links">
            {[
              ["#quick-start", "Quick start"],
              ["#endpoints", "Endpoints"],
              ["#platforms", "Platforms"],
              ["#linked-ids", "Linked IDs"],
              ["#entity-types", "Entity types"],
              ["#rate-limit", "Rate limit & CORS"],
              ["#service-health", "Service health"],
              ["/docs/examples", "Examples"],
              ["/docs/playground", "Playground"],
            ].map(([href, label]) => (
              <a key={href} href={href} style={{ padding: "4px 0 4px 8px", borderLeft: "2px solid transparent", color: "#a1a1a6", textDecoration: "none", fontSize: 13, transition: "all 0.15s" }}>{label}</a>
            ))}
          </nav>

          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", fontSize: 11 }}>
            <div><strong style={{ fontSize: 16, color: "var(--foreground)", display: "block" }}>{ENDPOINTS.length}</strong>Endpoints</div>
            <div><strong style={{ fontSize: 16, color: "var(--foreground)", display: "block" }}>7</strong>Input</div>
            <div><strong style={{ fontSize: 16, color: "var(--foreground)", display: "block" }}>8</strong>Output</div>
            <div><strong style={{ fontSize: 16, color: "var(--foreground)", display: "block" }}>5</strong>Types</div>
          </div>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <section id="quick-start" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 20px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Quick start</h2>
            <CodeTabs />
          </section>

          <section id="endpoints" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Endpoints</h2>
            <EndpointList endpoints={ENDPOINTS} />
          </section>

          <section id="platforms" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Platforms</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f7", margin: 0, paddingBottom: 8 }}>Input platforms</h3>
                <p style={{ fontSize: 13, color: "#a1a1a6", margin: "0 0 16px", lineHeight: 1.5 }}>Source URLs accepted by <code>/api/resolve</code>.</p>
                {["Spotify (sp)", "Apple Music (am)", "Deezer (dz)", "Tidal (td)", "YouTube (yt)", "Amazon Music (az)", "Bandcamp (bc)"].map((line) => (
                  <div key={line} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(51,51,54,0.4)", alignItems: "center", fontSize: 14, color: "#a1a1a6" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#6c5ce7", flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{line}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 16, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f7", margin: 0, paddingBottom: 8 }}>Output platforms</h3>
                <p style={{ fontSize: 13, color: "#a1a1a6", margin: "0 0 16px", lineHeight: 1.5 }}>Cross-link services generated by resolution.</p>
                {["Spotify", "Apple Music", "Deezer", "Tidal", "YouTube", "YouTube Music (ytm)", "Amazon Music (azm)", "Bandcamp"].map((line) => (
                  <div key={line} style={{ display: "flex", gap: 10, padding: "6px 0", borderBottom: "1px solid rgba(51,51,54,0.4)", alignItems: "center", fontSize: 14, color: "#a1a1a6" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00b894", flexShrink: 0 }} />
                    <span style={{ flex: 1 }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="linked-ids" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Linked IDs</h2>
            <p style={{ fontSize: 15, color: "#a1a1a6", lineHeight: 1.65, margin: "0 0 16px" }}>Every entity gets a compact, URL-safe Linked ID. Format: <code style={{ fontSize: 14, padding: "2px 6px", background: "#161617", border: "1px solid #333", borderRadius: 6, color: "#a29bfe" }}>{`{type}{platform}-{id}`}</code></p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
              {[
                { id: "sp-1wNgc05aCdwZHRuC9wMixm", label: "song · Spotify", idColor: "#6c5ce7", codeColor: "#00b894" },
                { id: "al-3qTXcsxYQGjBOZ8Ds2ZkyG", label: "album · Spotify", idColor: "#6c5ce7", codeColor: "#00b894" },
                { id: "at-0MZ55DwuMQ1B2TXq9lcrE4", label: "artist · Spotify", idColor: "#6c5ce7", codeColor: "#00b894" },
              ].map((ex) => (
                <div key={ex.id} style={{ background: "#161617", border: "1px solid #333", borderRadius: 12, padding: 16 }}>
                  <code style={{ fontFamily: "monospace", fontSize: 14, color: "#cdd6f4", display: "block", marginBottom: 10 }}>{ex.id}</code>
                  <div style={{ fontSize: 13, color: "#a1a1a6" }}>{ex.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#8a8a9e", marginBottom: 8 }}>Codes</div>
              <div style={{ fontFamily: "monospace", fontSize: 13, lineHeight: 1.7, color: "#cdd6f4" }}>
                <div style={{ marginBottom: 4 }}><strong style={{ color: "#6c5ce7" }}>Type:</strong> s = song &nbsp; l = album &nbsp; a = artist</div>
                <div><strong style={{ color: "#00b894" }}>Platform:</strong> sp = Spotify &nbsp; dz = Deezer &nbsp; td = Tidal &nbsp; am = Apple Music &nbsp; yt = YouTube &nbsp; az = Amazon Music &nbsp; ytm = YouTube Music &nbsp; azm = Amazon Music &nbsp; bc = Bandcamp</div>
              </div>
            </div>
          </section>

          <section id="entity-types" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Entity types</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {[
                { t: "song", icon: "🎵", desc: "A single track. ISRC is used to cross-resolve links across platforms. Includes lyrics + previews.", res: "Spotify, Deezer, Apple Music, Tidal, YouTube, YouTube Music, Amazon Music" },
                { t: "album", icon: "💿", desc: "An album or EP. Cross-links are resolved by searching album name + artist.", res: "Spotify, Deezer, Apple Music, Tidal*, YouTube, YouTube Music, Amazon Music*" },
                { t: "artist", icon: "🎤", desc: "An artist profile. Cross-links are resolved by searching the artist name.", res: "Spotify, Deezer, Apple Music, Tidal*, YouTube (channel), YouTube Music, Amazon Music*" },
                { t: "podcast / audiobook", icon: "🎙️", desc: "Recognized but not cross-linkable. Shows a graceful region-aware fallback.", res: "Not yet supported" },
              ].map((e) => (
                <div key={e.t} style={{ background: "#161617", border: "1px solid #333", borderRadius: 16, padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: 22 }}>{e.icon}</span>
                    <code style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f7", background: "none", border: "none", padding: 0 }}>{e.t}</code>
                  </div>
                  <p style={{ fontSize: 14, color: "#a1a1a6", margin: "0 0 12px", lineHeight: 1.55 }}>{e.desc}</p>
                  <div style={{ fontSize: 13, color: "#f5f5f7" }}>
                    <span style={{ color: "#a1a1a6", fontWeight: 500 }}>Resolves to: </span>{e.res}
                  </div>
                  {(e.res.includes("Tidal*") || e.res.includes("Amazon Music*")) && (
                    <div style={{ fontSize: 12, color: "#f9ca24", marginTop: 8, padding: 8, background: "rgba(249,202,36,0.08)", border: "1px solid rgba(249,202,36,0.2)", borderRadius: 8 }}>
                      * Requires elevated API access (Tidal: THIRD_PARTY tier; Amazon Music: API key).
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section id="rate-limit" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Rate limit &amp; CORS</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>⚡</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f7", margin: "0 0 8px" }}>Rate limit</h3>
                <p style={{ fontSize: 14, color: "#a1a1a6", margin: 0, lineHeight: 1.6 }}>Resolve and search endpoints are limited to <strong>30 requests/minute per IP</strong>. Responses include <code>X-RateLimit-Remaining</code> / <code>X-RateLimit-Reset</code> headers.</p>
              </div>
              <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 16, padding: 24 }}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>🌐</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f5f5f7", margin: "0 0 8px" }}>CORS</h3>
                <p style={{ fontSize: 14, color: "#a1a1a6", margin: 0, lineHeight: 1.6 }}>All endpoints return <code>Access-Control-Allow-Origin: *</code>. You can call the API from any origin, including browser-side code.</p>
              </div>
            </div>
          </section>

          <section id="service-health" style={{ marginBottom: 64 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.3, color: "#f5f5f7", margin: "0 0 24px", paddingBottom: 16, borderBottom: "1px solid #333" }}>Service health</h2>
            <p style={{ fontSize: 15, color: "#a1a1a6", lineHeight: 1.65, margin: "0 0 16px" }}>
              Check the live health of all downstream services at{" "}
              <code>/api/health</code>. Key services (Deezer, Apple Music, YouTube) are marked required — if any go down the API reports degraded.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {[
                { name: "Deezer", required: true, note: "Keyless ISRC + metadata lookup" },
                { name: "Apple Music", required: true, note: "Keyless iTunes lookup + search" },
                { name: "YouTube", required: true, note: "Keyless oEmbed + search" },
                { name: "Spotify", required: false, note: "Client credentials (SPOTIFY_CLIENT_ID/SECRET)" },
                { name: "Tidal", required: false, note: "Client credentials (TIDAL_CLIENT_ID/SECRET); artist/album search needs THIRD_PARTY tier" },
              ].map((s) => (
                <div key={s.name} style={{ background: "#161617", border: "1px solid #333", borderRadius: 12, padding: 14, transition: "border-color 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#f5f5f7" }}>{s.name}</span>
                    {s.required && <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, padding: "2px 8px", background: "rgba(255,69,58,0.12)", border: "1px solid rgba(255,69,58,0.25)", borderRadius: 20, color: "#ff453a" }}>required</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "#a1a1a6" }}>{s.note}</div>
                </div>
              ))}
            </div>
          </section>

          <footer style={{ padding: "40px 0", borderTop: "1px solid #333", textAlign: "center", color: "#a1a1a6", fontSize: 13 }}>
            <p>
              Linked API v{API_VERSION} — Built with Next.js.{" "}
              <a href="/api/health" style={{ color: "#a1a1a6", textDecoration: "none", fontWeight: 500 }}>Health check</a> ·{" "}
              <a href="https://github.com/OseMine/linked" style={{ color: "#a1a1a6", textDecoration: "none", fontWeight: 500 }}>GitHub</a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}