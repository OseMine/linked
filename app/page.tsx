"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { parseUrl } from "@/lib/parsers";
import { linkedId } from "@/lib/linked-id";

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ linkedUrl: string } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setResult(null);
    setCopied(false);

    const parsed = parseUrl(url);

    if (!parsed) {
      setError(
        "Unsupported URL. Please use a link from Spotify, Apple Music, Deezer, Tidal, YouTube, SoundCloud, or Amazon Music."
      );
      return;
    }

    const id = linkedId(parsed.platform, parsed.entityType, parsed.platformId);
    setResult({ linkedUrl: `/${parsed.entityType}/${id}` });
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
        <p className="tagline">Share music withy anyone</p>

        <form onSubmit={handleCreate} className="create-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a music link (Spotify, Apple Music, Deezer, Tidal, YouTube, SoundCloud)"
            required
            autoComplete="off"
          />
          <button type="submit" aria-label="Create linked URL">
            <Play size={18} />
          </button>
        </form>

        {error && <div className="error-message">{error}</div>}

        {result && (
          <div className="result-content">
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
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/deezer.svg" alt="Deezer" className="platform-icon-small" />
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/tidal.svg" alt="Tidal" className="platform-icon-small" />
            <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/youtube.svg" alt="YouTube" className="platform-icon-small" />
        </div>
        </div>
      </div>
    </main>
  );
}