"use client";

import { useState } from "react";

const SNIPPETS = {
  bash: `curl -X POST https://linkedapp.ddns.net/api/resolve \\\n  -H "Content-Type: application/json" \\\n  -d '{"url": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm"}'`,
  js: `const res = await fetch('/api/resolve', {\n  method: 'POST',\n  headers: { 'Content-Type': 'application/json' },\n  body: JSON.stringify({ url: 'https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm' })\n});\nconst data = await res.json();\nconsole.log(data.linkedUrl);`,
  py: `import requests\nr = requests.post('https://linkedapp.ddns.net/api/resolve', json={\n    'url': 'https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm'\n})\nprint(r.json()['linkedUrl'])`,
};

export function CodeTabs() {
  const [lang, setLang] = useState<"bash" | "js" | "py">("bash");
  return (
    <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid #333", background: "rgba(255,255,255,0.03)" }}>
        {["bash", "js", "py"].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setLang(k as "bash" | "js" | "py")}
            style={{
              padding: "4px 10px", fontSize: 11, fontWeight: 600,
              border: `1px solid ${lang === k ? "#6c5ce7" : "#333"}`,
              borderRadius: 6,
              background: lang === k ? "rgba(108,92,231,0.15)" : "transparent",
              color: lang === k ? "#fff" : "#a1a1a6",
              cursor: "pointer",
            }}
          >
            {k === "bash" ? "cURL" : k === "js" ? "JavaScript" : "Python"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(SNIPPETS[lang])}
          style={{ marginLeft: "auto", fontSize: 11, color: "#a1a1a6", background: "#333", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
        >Copy</button>
      </div>
      <pre style={{ margin: 0, padding: 16, overflowX: "auto", background: "#0d0d10", fontSize: 13, lineHeight: 1.7, color: "#cdd6f4", fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}><code>{SNIPPETS[lang]}</code></pre>
    </div>
  );
}

export function EndpointList({ endpoints }: { endpoints: Array<{ method: string; path: string; desc: string; params: Array<{ name: string; type: string; required: boolean; desc: string; in: string }>; badge: string }> }) {
  const [lang, setLang] = useState<"bash" | "js" | "py">("bash");
  return (
    <>
      {endpoints.map((ep) => (
        <div key={ep.path} style={{ background: "#161617", border: "1px solid #333", borderRadius: 16, padding: 20, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 12, borderBottom: "1px solid #333", marginBottom: 12 }}>
            <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#fff", background: ep.method === "POST" ? "#00b894" : "#6c5ce7" }}>{ep.method}</span>
            <code style={{ fontFamily: "monospace", fontSize: 15, color: "#f5f5f7" }}>{ep.path}</code>
            <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: "#a1a1a6", padding: "4px 10px", border: "1px solid #333", borderRadius: 20 }}>{ep.badge}</span>
          </div>
          <p style={{ fontSize: 14, color: "#a1a1a6", margin: "0 0 12px", lineHeight: 1.6 }}>{ep.desc}</p>
          {ep.params.length > 0 && (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #333", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#a1a1a6", textTransform: "uppercase", letterSpacing: 0.8 }}>
                    <th style={{ padding: 12 }}>Parameter</th>
                    <th style={{ padding: 12 }}>Type</th>
                    <th style={{ padding: 12 }}>In</th>
                    <th style={{ padding: 12 }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {ep.params.map((p) => (
                    <tr key={p.name} style={{ borderBottom: "1px solid rgba(51,51,54,0.6)" }}>
                      <td style={{ padding: 12, color: "#f5f5f7", fontWeight: 500, fontFamily: "monospace", fontSize: 12 }}>{p.name}{p.required && <span style={{ color: "#ff453a", marginLeft: 3 }}>*</span>}</td>
                      <td style={{ padding: 12 }}><code style={{ padding: "2px 6px", background: "rgba(108,92,231,0.1)", border: "1px solid rgba(108,92,231,0.2)", borderRadius: 4, color: "#a29bfe", fontSize: 11, fontFamily: "monospace" }}>{p.type}</code></td>
                      <td style={{ padding: 12 }}><span style={{ fontSize: 11, padding: "2px 6px", background: "rgba(255,255,255,0.04)", border: "1px solid #333", borderRadius: 4 }}>{p.in}</span></td>
                      <td style={{ padding: 12, color: "#a1a1a6" }}>{p.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </>
  );
}
