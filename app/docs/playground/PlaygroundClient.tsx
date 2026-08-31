"use client";

import { useState, useEffect, useRef } from "react";

const ENDPOINTS = [
  {
    id: "resolve",
    badge: "resolve",
    method: "POST",
    path: "/api/resolve",
    title: "Resolve a music URL",
    desc: "Take any supported music URL and get back a Linked URL with links to every platform.",
    defaultCode: `import requests

url = "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm"
r = requests.post("https://linkedapp.ddns.net/api/resolve", json={"url": url})
data = r.json()

print("Linked URL:", data["linkedUrl"])
print("Name:", data["entity"]["name"])
print("Artist:", data["entity"]["artist"])
print()
print("Cross-platform links:")
for platform, link in data["entity"]["links"].items():
    print(f"  {platform}: {link}")`,
  },
  {
    id: "entity",
    badge: "entity",
    method: "GET",
    path: "/api/entity/{type}/{id}",
    title: "Resolve a Linked ID",
    desc: "Look up a Linked ID to get all cross-platform links and full metadata.",
    defaultCode: `import requests

# Resolve a Linked ID back to full metadata
type_id = "song/ssp-1wNgc05aCdwZHRuC9wMixm"
r = requests.get(f"https://linkedapp.ddns.net/api/entity/{type_id}")
data = r.json()

print("Linked ID:", data["linkedId"])
print("Name:", data["entity"]["name"])
print("Artist:", data["entity"]["artist"])
print()
print("Cross-platform links:")
for platform, link in data["entity"]["links"].items():
    print(f"  {platform}: {link}")`,
  },
  {
    id: "oembed",
    badge: "oembed",
    method: "GET",
    path: "/api/oembed",
    title: "Get an oEmbed preview",
    desc: "Generate a rich oEmbed card for Twitter, Discord, Slack, and other oEmbed consumers.",
    defaultCode: `import requests

params = {
    "url": "https://open.spotify.com/track/1wNgc05aCdwZHRuC9wMixm",
    "maxwidth": 600
}
r = requests.get("https://linkedapp.ddns.net/api/oembed", params=params)
embed = r.json()

print("oEmbed response:")
for key, value in embed.items():
    if key != "html":
        print(f"  {key}: {value}")
print()
print("HTML snippet:")
print(embed["html"][:200] + "...")`,
  },
  {
    id: "search",
    badge: "search",
    method: "GET",
    path: "/api/search",
    title: "Search for music",
    desc: "Search across platforms by query. Returns tracks, albums, or artists.",
    defaultCode: `import requests

params = {
    "q": "blinding lights",
    "type": "track",
    "limit": 5
}
r = requests.get("https://linkedapp.ddns.net/api/search", params=params)
results = r.json()

print(f"Found {len(results['results'])} result(s)")
print()
for track in results["results"]:
    print(f"  {track['title']} — {track['artist']}")
    print(f"  Linked ID: {track['linkedId']} | Duration: {track['duration']}s")
    print()`,
  },
  {
    id: "health",
    badge: "health",
    method: "GET",
    path: "/api/health",
    title: "Check service health",
    desc: "Get the live health status of the API and all downstream music services.",
    defaultCode: `import requests

r = requests.get("https://linkedapp.ddns.net/api/health")
health = r.json()

print(f"API Status: {health['status']}")
print(f"Timestamp: {health['timestamp']}")
print()
print("Downstream services:")
for svc in health["services"]:
    icon = "ok" if svc["status"] == "ok" else "error"
    required = "[required]" if svc["required"] else ""
    print(f"  {icon} {svc['service']} {required} ({svc['latencyMs']}ms)")`,
  },
];

export function PlaygroundClient() {
  const [selected, setSelected] = useState(0);
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [pyodideError, setPyodideError] = useState(false);
  const pyodideRef = useRef<any>(null);
  const outputRef = useRef<HTMLPreElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const initPyodide = async () => {
      try {
        const loadPyodide = (window as unknown as { loadPyodide: (opts: { indexURL: string }) => Promise<unknown> }).loadPyodide;
        const pyodide = await loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/" }) as unknown as { loadPackage: (pkg: string) => Promise<void> };
        await pyodide.loadPackage("requests");
        pyodideRef.current = pyodide;
        setPyodideReady(true);
      } catch (e) {
        setPyodideError(true);
      }
    };
    if ((window as unknown as Record<string, unknown>).loadPyodide) {
      initPyodide();
    } else {
      const interval = setInterval(() => {
        if ((window as unknown as Record<string, unknown>).loadPyodide) {
          clearInterval(interval);
          initPyodide();
        }
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const runCode = async () => {
    const code = codeRef.current?.value ?? "";
    if (!pyodideRef.current || isRunning) return;
    setIsRunning(true);
    setOutput([]);
    const lines: string[] = [];

    try {
      const pyodide = pyodideRef.current as unknown as {
        runPython: (code: string) => string;
        runPythonAsync: (code: string) => Promise<void>;
      };
      pyodide.runPython(`
import sys
from io import StringIO
sys.stdout = StringIO()
sys.stderr = StringIO()
`);
      await pyodide.runPythonAsync(code);
      const stdoutStr = pyodide.runPython("sys.stdout.getvalue()");
      const stderrStr = pyodide.runPython("sys.stderr.getvalue()");
      if (stdoutStr) lines.push(...String(stdoutStr).split("\n").filter(Boolean));
      if (stderrStr) lines.push(...String(stderrStr).split("\n").filter(Boolean));
      if (!stdoutStr && !stderrStr) lines.push("(no output)");
    } catch (err: unknown) {
      lines.push(`Error: ${(err as Error).message ?? String(err)}`);
    } finally {
      const pyodide = pyodideRef.current as unknown as { runPython: (code: string) => string };
      pyodide.runPython(`sys.stdout = sys.__stdout__; sys.stderr = sys.__stderr__`);
    }
    setOutput(lines);
    setIsRunning(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 0, background: "#161617", border: "1px solid #333", borderRadius: 20, overflow: "hidden", minHeight: 520 }}>
        <div style={{ borderRight: "1px solid #333", padding: "20px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8, color: "#6c5ce7", padding: "0 16px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 8 }}>
            Endpoints
          </div>
          {ENDPOINTS.map((ep, i) => (
            <button
              key={ep.id}
              type="button"
              onClick={() => setSelected(i)}
              style={{
                display: "block", width: "100%", textAlign: "left",
                padding: "10px 16px", background: selected === i ? "rgba(108,92,231,0.1)" : "transparent",
                border: "none", borderLeft: `2px solid ${selected === i ? "#6c5ce7" : "transparent"}`,
                color: selected === i ? "#f5f5f7" : "#a1a1a6", cursor: "pointer",
                fontSize: 13, fontFamily: "inherit",
              }}
            >
              <span style={{ display: "block", fontSize: 11, color: "#a1a1a6" }}>{ep.path}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 600, marginTop: 2 }}>{ep.title}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700, color: "#fff", background: ENDPOINTS[selected].method === "POST" ? "#00b894" : "#6c5ce7" }}>
              {ENDPOINTS[selected].method}
            </span>
            <code style={{ fontFamily: "monospace", fontSize: 13, color: "#f5f5f7" }}>{ENDPOINTS[selected].path}</code>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#a1a1a6" }}>{ENDPOINTS[selected].desc}</span>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid #333", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#6c5ce7" }}>Python</span>
              <span style={{ fontSize: 11, color: "#a1a1a6", marginLeft: "auto" }}>requests · json</span>
            </div>
            <textarea
              ref={codeRef}
              defaultValue={ENDPOINTS[selected].defaultCode}
              spellCheck={false}
              style={{
                flex: 1, minHeight: 320, resize: "none", background: "#0d0d10",
                color: "#cdd6f4", border: "none", outline: "none",
                padding: "16px 20px", fontSize: 13, lineHeight: 1.7,
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              }}
              key={selected}
            />
          </div>

          <div style={{ borderTop: "1px solid #333", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            {!pyodideReady && !pyodideError ? (
              <span style={{ fontSize: 12, color: "#a1a1a6" }}>Loading Python runtime...</span>
            ) : pyodideError ? (
              <span style={{ fontSize: 12, color: "#ff453a" }}>Python runtime failed to load. Check your internet connection.</span>
            ) : pyodideReady ? (
              <span style={{ fontSize: 12, color: "#00b894" }}>Ready</span>
            ) : null}
            <button
              type="button"
              onClick={runCode}
              disabled={!pyodideReady || isRunning}
              style={{
                marginLeft: "auto", padding: "7px 20px", borderRadius: 8,
                background: isRunning || !pyodideReady ? "#333" : "#6c5ce7",
                border: "none", color: isRunning || !pyodideReady ? "#666" : "#fff",
                fontWeight: 700, fontSize: 13, cursor: isRunning || !pyodideReady ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {isRunning ? "Running..." : "▶ Run"}
            </button>
          </div>
        </div>
      </div>

      {output.length > 0 && (
        <div style={{ background: "#0d0d10", border: "1px solid #333", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "10px 16px", borderBottom: "1px solid #333", fontSize: 11, fontWeight: 600, color: "#6c5ce7", textTransform: "uppercase", letterSpacing: 0.8 }}>
            Output
          </div>
          <pre ref={outputRef} style={{ margin: 0, padding: "16px 20px", overflowX: "auto", fontSize: 13, lineHeight: 1.7, color: "#cdd6f4", fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", maxHeight: 300, overflowY: "auto" }}>
            {output.map((line, i) => (
              <div key={i} style={{ color: line.startsWith("Error") ? "#ff453a" : "#cdd6f4" }}>{line}</div>
            ))}
          </pre>
        </div>
      )}

      <div style={{ background: "#161617", border: "1px solid #333", borderRadius: 14, padding: "16px 20px", fontSize: 13, color: "#a1a1a6" }}>
        <strong style={{ color: "#f5f5f7" }}>How it works:</strong> The playground runs a Python interpreter (Pyodide) entirely in your browser — no server needed. Code is executed client-side and makes real API calls to <code style={{ color: "#a29bfe" }}>linkedapp.ddns.net</code>.
      </div>
    </div>
  );
}
