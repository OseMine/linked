import type { Metadata } from "next";
import Link from "next/link";
import { CodeExampleTabsClient } from "./CodeExampleTabsClient";

export const metadata: Metadata = {
  title: "API Examples — Linked",
  description: "Working examples for every Linked API endpoint.",
};

const EXAMPLES = [
  {
    id: "resolve",
    badge: "resolve",
    method: "POST",
    path: "/api/resolve",
    title: "Resolve a music URL",
    desc: "Take any supported music URL and get back a Linked URL with links to every platform.",
    request: {
      url: "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm",
    },
    curl: `curl -X POST https://linkedapp.ddns.net/api/resolve \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm"}'`,
    js: `const res = await fetch('/api/resolve', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm'
  })
});
const data = await res.json();
console.log(data.linkedUrl); // https://linkedapp.ddns.net/s/sp-1wNgc05aCdwZHRuC9wMixm`,
    py: `import requests
r = requests.post('https://linkedapp.ddns.net/api/resolve', json={
    'url': 'https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm'
})
data = r.json()
print(data['linkedUrl'])`,
    response: `{
  "linkedUrl": "/song/ssp-1wNgc05aCdwZHRuC9wMixm",
  "linkedId": "ssp-1wNgc05aCdwZHRuC9wMixm",
  "entity": {
    "name": "The Less I Know The Better",
    "artist": "Tame Impala",
    "image": "https://i.scdn.co/image/ab67616d0000b273...",
    "year": 2015,
    "links": {
      "spotify": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm",
      "apple": "https://music.apple.com/...",
      "deezer": "https://www.deezer.com/track/...",
      "tidal": "https://tidal.com/browse/track/...",
      "youtube": "https://www.youtube.com/watch?v=p3oxS5k4Suo",
      "youtubemusic": "https://music.youtube.com/watch?v=p3oxS5k4Suo"
    }
  },
  "source": {
    "platform": "spotify",
    "type": "song",
    "platformId": "1wNgc05aCdwZHRuC9wMixm",
    "url": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm"
  }
}`,
  },
  {
    id: "entity",
    badge: "entity",
    method: "GET",
    path: "/api/entity/{type}/{id}",
    title: "Resolve a Linked ID",
    desc: "Look up a Linked ID to get all cross-platform links and full metadata.",
    request: {
      type: "song",
      id: "sp-1wNgc05aCdwZHRuC9wMixm",
    },
    curl: `curl https://linkedapp.ddns.net/api/entity/song/sp-1wNgc05aCdwZHRuC9wMixm`,
    js: `const res = await fetch('/api/entity/song/sp-1wNgc05aCdwZHRuC9wMixm');
const entity = await res.json();
console.log(entity.title, '—', entity.artist);`,
    py: `import requests
r = requests.get('https://linkedapp.ddns.net/api/entity/song/sp-1wNgc05aCdwZHRuC9wMixm')
entity = r.json()
print(f"{entity['title']} — {entity['artist']}")`,
    response: `{
  "type": "song",
  "id": "sp-1wNgc05aCdwZHRuC9wMixm",
  "title": "The Less I Know The Better",
  "artist": "Tame Impala",
  "album": "Currents",
  "year": 2015,
  "duration": 214,
  "isrc": "USQX91500601",
  "links": {
    "spotify": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm",
    "appleMusic": "https://music.apple.com/track/1440885405",
    "deezer": "https://www.deezer.com/track/1023921722",
    "tidal": "https://tidal.com/browse/track/122998414",
    "youtube": "https://www.youtube.com/watch?v=p3oxS5k4Suo",
    "youtubeMusic": "https://music.youtube.com/watch?v=p3oxS5k4Suo",
    "amazonMusic": "https://music.amazon.com/tracks/B00S66QOI6"
  }
}`,
  },
  {
    id: "oembed",
    badge: "oembed",
    method: "GET",
    path: "/api/oembed",
    title: "Get an oEmbed preview",
    desc: "Generate a rich oEmbed card for Twitter, Discord, Slack, and other oEmbed consumers.",
    request: {
      url: "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm",
      maxwidth: 600,
    },
    curl: `curl "https://linkedapp.ddns.net/api/oembed?url=https%3A//open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm&maxwidth=600"`,
    js: `const url = encodeURIComponent('https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm');
const res = await fetch(\`/api/oembed?url=\${url}&maxwidth=600\`);
const embed = await res.json();
document.body.innerHTML = embed.html;`,
    py: `import requests
params = {
    'url': 'https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm',
    'maxwidth': 600
}
r = requests.get('https://linkedapp.ddns.net/api/oembed', params=params)
embed = r.json()
print(embed['html'][:100], '...')`,
    response: `{
  "type": "rich",
  "version": "1.0",
  "title": "The Less I Know The Better — Tame Impala",
  "author_name": "Linked",
  "provider_name": "Linked",
  "provider_url": "https://linkedapp.ddns.net",
  "html": "<iframe ...></iframe>",
  "width": 600,
  "height": 200
}`,
  },
  {
    id: "search",
    badge: "search",
    method: "GET",
    path: "/api/search",
    title: "Search for music",
    desc: "Search across platforms by query. Returns tracks, albums, or artists.",
    request: {
      q: "blinding lights",
      type: "track",
      limit: 5,
    },
    curl: `curl "https://linkedapp.ddns.net/api/search?q=blinding%20lights&type=track&limit=5"`,
    js: `const res = await fetch('/api/search?q=blinding%20lights&type=track&limit=5');
const results = await res.json();
results.data.forEach(track => {
  console.log(track.title, '—', track.artist.name);
});`,
    py: `import requests
params = {'q': 'blinding lights', 'type': 'track', 'limit': 5}
r = requests.get('https://linkedapp.ddns.net/api/search', params=params)
results = r.json()
for track in results['data']:
    print(f"{track['title']} — {track['artist']['name']}")`,
    response: `{
  "type": "track",
  "total": 1,
  "data": [
    {
      "id": 6624,
      "title": "Blinding Lights",
      "duration": 200,
      "artist": { "id": 359侶, "name": "The Weeknd" },
      "album": { "id": 8573伕, "title": "After Hours" }
    }
  ]
}`,
  },
  {
    id: "health",
    badge: "health",
    method: "GET",
    path: "/api/health",
    title: "Check service health",
    desc: "Get the live health status of the API and all downstream music services.",
    request: {},
    curl: `curl https://linkedapp.ddns.net/api/health`,
    js: `const res = await fetch('/api/health');
const health = await res.json();
const status = health.status; // 'operational' | 'degraded' | 'down'
console.log(\`API is \${status}\`);`,
    py: `import requests
r = requests.get('https://linkedapp.ddns.net/api/health')
health = r.json()
print(f"API is {health['status']}")`,
    response: `{
  "status": "operational",
  "timestamp": "2025-01-15T12:00:00Z",
  "services": {
    "deezer": { "status": "up", "latency_ms": 42 },
    "appleMusic": { "status": "up", "latency_ms": 78 },
    "youtube": { "status": "up", "latency_ms": 55 },
    "spotify": { "status": "up", "latency_ms": 31 },
    "tidal": { "status": "up", "latency_ms": 120 }
  }
}`,
  },
];

export default function ExamplesPage() {
  return (
    <div style={{ background: "var(--background)", color: "var(--foreground)", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", minHeight: "100vh", padding: "60px 24px 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Link href="/docs" style={{ color: "#a1a1a6", textDecoration: "none", fontSize: 14, display: "inline-block", padding: "8px 16px", background: "#161617", border: "1px solid #333", borderRadius: 8, marginBottom: 24 }}>
          ← API Reference
        </Link>

        <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6c5ce7" }}>API Reference</div>
        <h1 style={{ fontSize: 40, fontWeight: 700, margin: "0 0 12px", letterSpacing: -1, background: "linear-gradient(135deg, #fff 0%, #a1a1a6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Examples</h1>
        <p style={{ fontSize: 16, color: "#a1a1a6", margin: "0 0 48px", lineHeight: 1.6 }}>
          Working examples for every endpoint. Copy and run them in your terminal or application.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          {EXAMPLES.map((ex) => (
            <div key={ex.id} id={ex.id} style={{ background: "#161617", border: "1px solid #333", borderRadius: 20, overflow: "hidden" }}>
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #333", display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                  <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#fff", background: ex.method === "POST" ? "#00b894" : "#6c5ce7" }}>{ex.method}</span>
                  <code style={{ fontFamily: "monospace", fontSize: 15, color: "#f5f5f7" }}>{ex.path}</code>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#a1a1a6", padding: "4px 10px", border: "1px solid #333", borderRadius: 20 }}>{ex.badge}</span>
                </div>
              </div>

              <div style={{ padding: "24px 28px" }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f7", margin: "0 0 8px" }}>{ex.title}</h2>
                <p style={{ fontSize: 14, color: "#a1a1a6", margin: "0 0 24px", lineHeight: 1.6 }}>{ex.desc}</p>

                {Object.keys(ex.request).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "#6c5ce7", marginBottom: 8 }}>Request parameters</div>
                    <div style={{ background: "#0d0d10", border: "1px solid #333", borderRadius: 10, padding: 14, fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: 13, color: "#cdd6f4" }}>
                      <div style={{ color: "#a1a1a6", marginBottom: 8 }}>Parameters:</div>
                      {Object.entries(ex.request).map(([k, v]) => (
                        <div key={k} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                          <span style={{ color: "#a29bfe" }}>{k}</span>
                          <span style={{ color: "#a1a1a6" }}>=</span>
                          <span style={{ color: "#f5f5f7" }}>{JSON.stringify(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "#6c5ce7", marginBottom: 8 }}>Code examples</div>
                  <CodeExampleTabs examples={ex} />
                </div>

                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "#6c5ce7", marginBottom: 8 }}>Example response</div>
                  <pre style={{ margin: 0, padding: 16, background: "#0d0d10", border: "1px solid #333", borderRadius: 10, overflowX: "auto", fontSize: 13, lineHeight: 1.7, color: "#cdd6f4", fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}>{ex.response}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CodeExampleTabs({ examples }: { examples: (typeof EXAMPLES)[number] }) {
  return <CodeExampleTabsClient examples={examples} />;
}
