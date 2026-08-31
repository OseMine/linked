"use client";

import { useState } from "react";

export function CodeExampleTabsClient({ examples }: { examples: { curl: string; js: string; py: string } }) {
  const [lang, setLang] = useState<"curl" | "js" | "py">("curl");
  const snippets: Record<"curl" | "js" | "py", string> = {
    curl: examples.curl,
    js: examples.js,
    py: examples.py,
  };
  return (
    <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid #333", background: "rgba(255,255,255,0.03)" }}>
        {(["curl", "js", "py"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setLang(k)}
            style={{
              padding: "4px 10px", fontSize: 11, fontWeight: 600,
              border: `1px solid ${lang === k ? "#6c5ce7" : "#333"}`,
              borderRadius: 6,
              background: lang === k ? "rgba(108,92,231,0.15)" : "transparent",
              color: lang === k ? "#fff" : "#a1a1a6",
              cursor: "pointer",
            }}
          >
            {k === "curl" ? "cURL" : k === "js" ? "JavaScript" : "Python"}
          </button>
        ))}
        <button
          type="button"
          onClick={() => navigator.clipboard.writeText(snippets[lang])}
          style={{ marginLeft: "auto", fontSize: 11, color: "#a1a1a6", background: "#333", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}
        >Copy</button>
      </div>
      <pre style={{ margin: 0, padding: 16, overflowX: "auto", background: "#0d0d10", fontSize: 13, lineHeight: 1.7, color: "#cdd6f4", fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace" }}><code>{snippets[lang]}</code></pre>
    </div>
  );
}
