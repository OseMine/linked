"use client";

import { Play } from "lucide-react";
import { useState } from "react";

interface ResolveResponse {
  entity: {
    name: string;
    artist: string | null;
    image: string | null;
    links: Record<string, string>;
  };
  source: { platform: string; type: string; url: string };
  linkedUrl: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);

    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!result) return;
    await navigator.clipboard.writeText(window.location.origin + result.linkedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="create-page">
      <div className="create-content">
        <h1 className="logo">Linked</h1>
        <p className="tagline">Share music with anyone</p>

        <form onSubmit={handleCreate} className="create-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a music link (Spotify, Apple Music, Deezer, Tidal, YouTube, SoundCloud)"
            required
            autoComplete="off"
          />
          <button type="submit" aria-label="Create linked URL" disabled={loading}>
            <Play size={18} />
          </button>
        </form>

        {loading && <div className="loading-message">Resolving link…</div>}
        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-content">
            <div className="preview">
              {result.entity.image && <img src={result.entity.image} alt="" className="preview-cover" />}
              <div className="preview-info">
                <strong>{result.entity.name}</strong>
                {result.entity.artist && <span>{result.entity.artist}</span>}
              </div>
            </div>
            <h3>Your Linked URL</h3>
            <div className="linked-url">
              <input type="text" value={window.location.origin + result.linkedUrl} readOnly />
              <button onClick={copyLink}>{copied ? "Copied!" : "Copy"}</button>
            </div>
            <a href={result.linkedUrl} className="view-link">
              View page →
            </a>
          </div>
        )}

        <div className="info-section">
          <h3>How it works</h3>
          <ol>
            <li>Copy a share link from your music app</li>
            <li>Paste it above</li>
            <li>Get a universal link that works on any platform</li>
          </ol>
        </div>

        <div className="supported-platforms">
          <h3>Supported platforms</h3>
          <div className="platform-icons">
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/spotify.svg" alt="Spotify" className="platform-icon-small" />
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/applemusic.svg" alt="Apple Music" className="platform-icon-small" />
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/deezer.svg" alt="Deezer" className="platform-icon-small" />
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/tidal.svg" alt="Tidal" className="platform-icon-small" />
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/youtube.svg" alt="YouTube" className="platform-icon-small" />
          </div>
        </div>
      </div>
    </main>
  );
}
