import type { Metadata } from "next";
import Link from "next/link";
import "./docs.css";

export const metadata: Metadata = {
  title: "API Reference — Linked",
  description: "Full API reference for the Linked music link unification service.",
};

const API_VERSION = "1.0.0";

const INPUT_PLATFORMS = [
  { name: "Spotify", key: "sp", note: "Spotify track, album, artist URLs" },
  { name: "Apple Music", key: "am", note: "Apple Music track, album, artist URLs" },
  { name: "Deezer", key: "dz", note: "Deezer track, album, artist URLs" },
  { name: "Tidal", key: "td", note: "Tidal track, album, artist URLs" },
  { name: "YouTube", key: "yt", note: "YouTube video URLs (treated as songs)" },
  { name: "Amazon Music", key: "az", note: "Amazon Music track, album, artist URLs" },
];

const OUTPUT_PLATFORMS = [
  { name: "Spotify", key: "sp" },
  { name: "Apple Music", key: "am" },
  { name: "Deezer", key: "dz" },
  { name: "Tidal", key: "td" },
  { name: "YouTube", key: "yt" },
  { name: "YouTube Music", key: "ytm" },
  { name: "Amazon Music", key: "azm" },
];

const ENDPOINTS = [
  {
    method: "POST",
    path: "/api/resolve",
    badge: "resolve",
    description: "Resolve a music URL from any supported platform into a universal Linked URL with cross-platform links.",
    parameters: [
      { name: "url", in: "body", type: "string", required: true, description: "Music URL from a supported platform." },
    ],
    example: {
      request: { url: "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm" },
      response: {
        entity: "{ name, artist, image, year, links, tracks }",
        source: "{ platform, type, platformId, url }",
        linkedId: "sp-1wNgc05aCdwZHRuC9wMixm",
        linkedUrl: "/song/sp-1wNgc05aCdwZHRuC9wMixm",
      },
    },
  },
  {
    method: "GET",
    path: "/api/entity/:type/:id",
    badge: "entity",
    description: "Resolve a Linked ID back to full metadata with cross-platform links.",
    parameters: [
      { name: "type", in: "path", type: "string", required: true, description: "Entity type: 'song', 'album', or 'artist'." },
      { name: "id", in: "path", type: "string", required: true, description: "The Linked ID (e.g. 'sp-1wNgc05aCdwZHRuC9wMixm')." },
    ],
  },
  {
    method: "GET",
    path: "/api/oembed",
    badge: "oembed",
    description: "oEmbed endpoint for rich previews in Twitter, Discord, Slack, and other embed-aware clients.",
    parameters: [
      { name: "url", in: "query", type: "string", required: true, description: "Music URL from a supported platform." },
      { name: "maxwidth", in: "query", type: "number", required: false, description: "Max embed width in pixels (200-1200, default 600)." },
      { name: "theme", in: "query", type: "string", required: false, description: "'light' (default) or 'dark'." },
    ],
  },
  {
    method: "GET",
    path: "/api/search",
    badge: "search",
    description: "Search for tracks, albums, or artists across platforms via Deezer.",
    parameters: [
      { name: "q", in: "query", type: "string", required: true, description: "Search query (e.g. 'Bohemian Rhapsody')." },
      { name: "type", in: "query", type: "string", required: false, description: "'track' (default), 'album', or 'artist'." },
      { name: "limit", in: "query", type: "number", required: false, description: "Number of results (1-25, default 10)." },
    ],
  },
  {
    method: "GET",
    path: "/api/health",
    badge: "health",
    description: "Health check for the API and all downstream music services. Returns status and latency for each.",
    parameters: [],
  },
  {
    method: "GET",
    path: "/api/docs",
    badge: "docs",
    description: "This page. Full API reference with platform support, entity types, linked IDs, and endpoint definitions.",
    parameters: [],
  },
];

const METHOD_COLORS: Record<string, string> = {
  GET: "#6c5ce7",
  POST: "#00b894",
  PUT: "#fdcb6e",
  DELETE: "#d63031",
};

export default function DocsPage() {
  return (
    <div className="docs-page">
      <div className="docs-back">
        <Link href="/">← Back home</Link>
      </div>

      <header className="docs-header">
        <div className="docs-header-label">API Reference</div>
        <h1 className="docs-title">Linked API</h1>
        <p className="docs-subtitle">
          One link for every music platform. Paste any supported URL, get a universal
          Linked URL that opens in the user's preferred streaming service.
        </p>
        <div className="docs-version-badge">v{API_VERSION}</div>
        <div className="docs-header-stats">
          <div className="docs-stat">
            <span className="docs-stat-value">{ENDPOINTS.length}</span>
            <span className="docs-stat-label">Endpoints</span>
          </div>
          <div className="docs-stat">
            <span className="docs-stat-value">{INPUT_PLATFORMS.length}</span>
            <span className="docs-stat-label">Input platforms</span>
          </div>
          <div className="docs-stat">
            <span className="docs-stat-value">{OUTPUT_PLATFORMS.length}</span>
            <span className="docs-stat-label">Output platforms</span>
          </div>
          <div className="docs-stat">
            <span className="docs-stat-value">3</span>
            <span className="docs-stat-label">Entity types</span>
          </div>
        </div>
      </header>

      <main className="docs-main">
        {/* Quick start */}
        <section className="docs-section">
          <h2 className="docs-section-title">Quick start</h2>
          <div className="docs-code-block">
            <div className="docs-code-lang">bash</div>
            <pre><code>{`# Resolve any music URL
curl -X POST https://linked.fly.dev/api/resolve \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm"}'

# Response
{
  "entity": { "name": "...", "artist": "...", "links": {...} },
  "linkedId": "sp-1wNgc05aCdwZHRuC9wMixm",
  "linkedUrl": "/song/sp-1wNgc05aCdwZHRuC9wMixm"
}`}</code></pre>
          </div>
        </section>

        {/* Endpoints */}
        <section className="docs-section">
          <h2 className="docs-section-title">Endpoints</h2>
          <div className="docs-endpoints">
            {ENDPOINTS.map((ep) => (
              <div key={ep.path} className="docs-endpoint">
                <div className="docs-ep-header">
                  <div className="docs-ep-left">
                    <span
                      className="docs-method"
                      style={{ backgroundColor: METHOD_COLORS[ep.method] ?? "#555" }}
                    >
                      {ep.method}
                    </span>
                    <code className="docs-ep-path">{ep.path}</code>
                  </div>
                  <span className="docs-ep-badge">{ep.badge}</span>
                </div>
                <p className="docs-ep-desc">{ep.description}</p>
                {ep.parameters && ep.parameters.length > 0 && (
                  <table className="docs-params">
                    <thead>
                      <tr>
                        <th>Parameter</th>
                        <th>Type</th>
                        <th>In</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ep.parameters.map((p) => (
                        <tr key={p.name}>
                          <td>
                            <code className="docs-param-name">
                              {p.name}
                              {p.required && <span className="docs-required">*</span>}
                            </code>
                          </td>
                          <td><code className="docs-type">{p.type}</code></td>
                          <td><span className="docs-in">{p.in}</span></td>
                          <td>{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {ep.example && (
                  <div className="docs-example">
                    <div className="docs-example-label">Example</div>
                    <div className="docs-code-block small">
                      <div className="docs-code-lang">{ep.method === "POST" ? "Request body" : "Query params"}</div>
                      <pre><code>{JSON.stringify(ep.example.request ?? ep.example, null, 2)}</code></pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Platforms */}
        <section className="docs-section">
          <h2 className="docs-section-title">Platforms</h2>
          <div className="docs-two-col">
            <div className="docs-card">
              <h3 className="docs-card-title">Input platforms</h3>
              <p className="docs-card-desc">
                These platforms can be used as the source URL in <code>/api/resolve</code>.
              </p>
              <div className="docs-platform-list">
                {INPUT_PLATFORMS.map((p) => (
                  <div key={p.key} className="docs-platform-item">
                    <div className="docs-platform-dot"></div>
                    <div>
                      <div className="docs-platform-name">{p.name}</div>
                      <div className="docs-platform-note">{p.note}</div>
                    </div>
                    <code className="docs-platform-code">{p.key}</code>
                  </div>
                ))}
              </div>
            </div>
            <div className="docs-card">
              <h3 className="docs-card-title">Output platforms</h3>
              <p className="docs-card-desc">
                Cross-platform links are generated for all of these services.
              </p>
              <div className="docs-platform-list">
                {OUTPUT_PLATFORMS.map((p) => (
                  <div key={p.key} className="docs-platform-item">
                    <div className="docs-platform-dot"></div>
                    <div>
                      <div className="docs-platform-name">{p.name}</div>
                    </div>
                    <code className="docs-platform-code">{p.key}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Linked IDs */}
        <section className="docs-section">
          <h2 className="docs-section-title">Linked IDs</h2>
          <p className="docs-text">
            Every entity gets a compact, URL-safe Linked ID. Format: <code>{`{type}{platform}-{id}`}</code>
          </p>
          <div className="docs-id-grid">
            {[
              { id: "sp-1wNgc05aCdwZHRuC9wMixm", parts: [{ label: "s", desc: "song" }, { label: "sp", desc: "Spotify" }, { label: "1wNgc05aCdwZHRuC9wMixm", desc: "Spotify track ID" }] },
              { id: "al-3qTXcsxYQGjBOZ8Ds2ZkyG", parts: [{ label: "l", desc: "album" }, { label: "sp", desc: "Spotify" }, { label: "3qTXcsxYQGjBOZ8Ds2ZkyG", desc: "Spotify album ID" }] },
              { id: "at-0MZ55DwuMQ1B2TXq9lcrE4", parts: [{ label: "a", desc: "artist" }, { label: "sp", desc: "Spotify" }, { label: "0MZ55DwuMQ1B2TXq9lcrE4", desc: "Spotify artist ID" }] },
            ].map((example) => (
              <div key={example.id} className="docs-id-example">
                <code className="docs-id-code">{example.id}</code>
                <div className="docs-id-parts">
                  {example.parts.map((p, i) => (
                    <span key={i} className="docs-id-part">
                      <span className="docs-id-part-label" style={{ background: i === 0 ? "#6c5ce7" : i === 1 ? "#00b894" : "#555" }}>{p.label}</span>
                      <span className="docs-id-part-desc">{p.desc}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="docs-code-block">
            <div className="docs-code-lang">Type codes</div>
            <pre><code>{`  s = song    l = album    a = artist`}</code></pre>
          </div>
          <div className="docs-code-block">
            <div className="docs-code-lang">Platform codes</div>
            <pre><code>{`  sp = Spotify     dz = Deezer      td = Tidal
  am = Apple Music  yt = YouTube      az = Amazon Music
  ytm = YouTube Music (output only, no linked ID)
  azm = Amazon Music (output only, no linked ID)`}</code></pre>
          </div>
        </section>

        {/* Entity types */}
        <section className="docs-section">
          <h2 className="docs-section-title">Entity types</h2>
          <div className="docs-entity-types">
            {[
              {
                type: "song",
                icon: "🎵",
                desc: "A single track. ISRC is used to cross-resolve links across platforms.",
                resolves: "Spotify, Deezer, Apple Music, Tidal, YouTube, YouTube Music, Amazon Music",
              },
              {
                type: "album",
                icon: "💿",
                desc: "An album or EP. Cross-links are resolved by searching album name + artist.",
                resolves: "Spotify, Deezer, Apple Music, Tidal*, YouTube, YouTube Music, Amazon Music*",
              },
              {
                type: "artist",
                icon: "🎤",
                desc: "An artist profile. Cross-links are resolved by searching the artist name.",
                resolves: "Spotify, Deezer, Apple Music, Tidal*, YouTube (channel), YouTube Music, Amazon Music*",
              },
            ].map((e) => (
              <div key={e.type} className="docs-entity-card">
                <div className="docs-entity-header">
                  <span className="docs-entity-icon">{e.icon}</span>
                  <code className="docs-entity-type">{e.type}</code>
                </div>
                <p className="docs-entity-desc">{e.desc}</p>
                <div className="docs-entity-resolves">
                  <span className="docs-entity-resolves-label">Resolves to: </span>
                  {e.resolves}
                </div>
                {(e.resolves.includes("Tidal*") || e.resolves.includes("Amazon Music*")) && (
                  <div className="docs-entity-note">
                    * Requires elevated API access (Tidal: THIRD_PARTY tier; Amazon Music: API key).
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Rate limit & CORS */}
        <section className="docs-section">
          <h2 className="docs-section-title">Rate limit &amp; CORS</h2>
          <div className="docs-info-grid">
            <div className="docs-info-card">
              <div className="docs-info-icon">⚡</div>
              <h3>Rate limit</h3>
              <p>None currently. Fair use appreciated. Services are free and rate limits are generous on all upstream providers.</p>
            </div>
            <div className="docs-info-card">
              <div className="docs-info-icon">🌐</div>
              <h3>CORS</h3>
              <p>All endpoints return <code>Access-Control-Allow-Origin: *</code>. You can call the API from any origin, including browser-side code.</p>
            </div>
          </div>
        </section>

        {/* Health */}
        <section className="docs-section">
          <h2 className="docs-section-title">Service health</h2>
          <p className="docs-text">
            Check the live health of all downstream services at{" "}
            <code>/api/health</code>. Key services (Deezer, Apple Music, YouTube) are marked required — if any go down the API reports degraded.
          </p>
          <div className="docs-health-grid">
            {[
              { name: "Deezer", required: true, note: "Keyless ISRC + metadata lookup" },
              { name: "Apple Music", required: true, note: "Keyless iTunes lookup + search" },
              { name: "YouTube", required: true, note: "Keyless oEmbed + search" },
              { name: "Spotify", required: false, note: "Client credentials (SPOTIFY_CLIENT_ID/SECRET)" },
              { name: "Tidal", required: false, note: "Client credentials (TIDAL_CLIENT_ID/SECRET); artist/album search needs THIRD_PARTY tier" },
            ].map((s) => (
              <div key={s.name} className="docs-health-item">
                <div className="docs-health-header">
                  <span className="docs-health-name">{s.name}</span>
                  {s.required && <span className="docs-required-badge">required</span>}
                </div>
                <div className="docs-health-note">{s.note}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="docs-footer">
        <p>
          Linked API v{API_VERSION} — Built with Next.js.{" "}
          <a href="/api/health">Health check</a> ·{" "}
          <a href="https://github.com/OseMine/linked">GitHub</a>
        </p>
      </footer>
    </div>
  );
}
