"use client";

import type { EntityData } from "@/lib/songlink";
import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { generateQRMatrix, qrToSVG } from "@/lib/qr";
import { addToHistory } from "@/lib/history";

interface EntityHeroProps {
  data: EntityData;
  type: string;
}

const PLATFORMS = [
  { key: "spotify", name: "Spotify", icon: "spotify" },
  { key: "apple", name: "Apple Music", icon: "applemusic", aliases: ["appleMusic"] },
  { key: "deezer", name: "Deezer", icon: "deezer" },
  { key: "tidal", name: "Tidal", icon: "tidal" },
  { key: "youtube", name: "YouTube", icon: "youtube" },
  { key: "youtubemusic", name: "YouTube Music", icon: "youtubemusic", aliases: ["youtubeMusic"] },
  { key: "amazonmusic", name: "Amazon Music", icon: "amazon", aliases: ["amazonMusic"] },
  { key: "bandcamp", name: "Bandcamp", icon: "bandcamp" },
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

type ShareTab = "links" | "qr" | "embed";

export default function EntityHero({ data, type }: EntityHeroProps) {
  const { t } = useI18n();
  const { name, artist, image, links, year, previewUrl, lyrics } = data;
  const imageSrc = image || "/images.svg";

  const typeLabel = type === "artist" ? t("entity.artist") : type === "album" ? t("entity.album") : t("entity.single");
  const subtitleParts = [artist, type === "album" && year ? String(year) : typeLabel].filter(Boolean);
  const subtitle = subtitleParts.join(" \u2022 ");

  const [showLyrics, setShowLyrics] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeShareTab, setActiveShareTab] = useState<ShareTab>("links");
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsRef = useRef<HTMLDivElement>(null);

  // Save to history on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const linkedUrl = `/${type}/${generateLinkedIdFromLinks(links)}`;
      addToHistory({
        id: linkedUrl,
        name,
        artist,
        image,
        type: type as "song" | "album" | "artist",
        linkedUrl,
      });
    }
  }, [name, artist, image, type, links]);

  const getHref = (p: (typeof PLATFORMS)[number]): string | undefined => {
    if (links[p.key]) return links[p.key];
    for (const a of p.aliases ?? []) if (links[a]) return links[a];
    return undefined;
  };

  function togglePreview() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }

  function handleDownloadQR() {
    const svg = qrToSVG(generateQRMatrix(window.location.href));
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `linked-qr-${name.replace(/\s+/g, "-").toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyEmbedCode() {
    const embedUrl = `${window.location.origin}/embed${window.location.pathname}`;
    const code = `<iframe src="${embedUrl}" width="400" height="200" frameborder="0" style="border-radius:12px;border:1px solid #222;"></iframe>`;
    await navigator.clipboard.writeText(code);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  const qrSvg = typeof window !== "undefined"
    ? qrToSVG(generateQRMatrix(window.location.href))
    : "";

  return (
    <div className="hero scrollable">
      <img src={imageSrc} alt={name} className="band-image-big" />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <img src={imageSrc} alt={name} className="entity-cover" />
        <h2 className="band">{name}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}

        {/* Audio Preview */}
        {previewUrl && type === "song" && (
          <div className="audio-preview">
            <audio
              ref={audioRef}
              src={previewUrl}
              onEnded={() => setIsPlaying(false)}
              preload="none"
            />
            <button onClick={togglePreview} className="preview-btn">
              <span className="preview-icon">{isPlaying ? "\u23F8" : "\u25B6"}</span>
              <span>{isPlaying ? t("entity.preview.pause") : t("entity.preview.play")}</span>
            </button>
          </div>
        )}

        {/* Tracklist for albums */}
        {type === "album" && data.tracks.length > 0 && (
          <section className="tracklist">
            <h3 className="section-title">{t("entity.tracklist")}</h3>
            <ol className="tracklist-list">
              {data.tracks.map((track, i) => (
                <li key={i} className="tracklist-item">
                  <span>{track.name}</span>
                  <span className="track-duration">{formatDuration(track.duration)}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Lyrics section */}
        {type === "song" && lyrics && (
          <section className="lyrics-section">
            <button
              className="lyrics-toggle"
              onClick={() => setShowLyrics(!showLyrics)}
            >
              <span>{t("entity.lyrics.title")}</span>
              <span className="lyrics-chevron">{showLyrics ? "\u25B2" : "\u25BC"}</span>
            </button>
            {showLyrics && (
              <div ref={lyricsRef} className="lyrics-content">
                {lyrics.instrumental ? (
                  <p className="lyrics-instrumental">{t("entity.lyrics.instrumental")}</p>
                ) : lyrics.plainLyrics ? (
                  <pre className="lyrics-text">{lyrics.plainLyrics}</pre>
                ) : (
                  <p className="lyrics-unavailable">{t("entity.lyrics.unavailable")}</p>
                )}
              </div>
            )}
          </section>
        )}

        {/* Platform buttons */}
        <div className="platforms">
          {PLATFORMS.map((p) => {
            const href = getHref(p);
            if (!href) {
              return (
                <div key={p.key} className="platform unavailable">
              <img src={`https://cdn.jsdelivr.net/npm/simple-icons@9/icons/${p.icon === "amazon" ? "amazon" : p.icon}.svg`} alt="" className="platform-icon" />
                  <span>{t("entity.notOn", { platform: p.name })}</span>
                </div>
              );
            }
            return (
              <a key={p.key} className="platform" href={href} target="_blank" rel="noopener">
                <img src={`https://cdn.jsdelivr.net/npm/simple-icons@9/icons/${p.icon}.svg`} alt="" className="platform-icon" />
                <span>{t("entity.openOn", { platform: p.name })}</span>
              </a>
            );
          })}
        </div>

        {/* Share section */}
        <div className="share-section">
          <h3 className="section-title">{t("entity.share.title")}</h3>
          <div className="share-tabs">
            <button
              className={`share-tab ${activeShareTab === "links" ? "active" : ""}`}
              onClick={() => setActiveShareTab("links")}
            >
              {t("entity.share.copyLink")}
            </button>
            <button
              className={`share-tab ${activeShareTab === "qr" ? "active" : ""}`}
              onClick={() => setActiveShareTab("qr")}
            >
              {t("entity.share.qr")}
            </button>
            <button
              className={`share-tab ${activeShareTab === "embed" ? "active" : ""}`}
              onClick={() => setActiveShareTab("embed")}
            >
              {t("entity.share.embed")}
            </button>
          </div>

          {activeShareTab === "links" && (
            <div className="share-content">
              <div className="share-link-row">
                <input type="text" value={typeof window !== "undefined" ? window.location.href : ""} readOnly />
                <button onClick={copyLink}>{copiedLink ? t("home.result.copied") : t("home.result.copy")}</button>
              </div>
            </div>
          )}

          {activeShareTab === "qr" && (
            <div className="share-content share-qr">
              <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
              <button onClick={handleDownloadQR} className="qr-download-btn">
                {t("entity.qr.download")}
              </button>
            </div>
          )}

          {activeShareTab === "embed" && (
            <div className="share-content">
              <pre className="embed-code">
{`<iframe src="${typeof window !== "undefined" ? `${window.location.origin}/embed${window.location.pathname}` : ""}" width="400" height="200" frameborder="0" style="border-radius:12px;border:1px solid #222;"></iframe>`}
              </pre>
              <button onClick={copyEmbedCode} className="embed-copy-btn">
                {copiedEmbed ? t("entity.embed.copied") : t("entity.embed.copy")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function generateLinkedIdFromLinks(links: Record<string, string>): string {
  // Extract linked ID from the first available link
  for (const [platform, url] of Object.entries(links)) {
    if (url) return `${platform}-${url.split("/").pop()}`;
  }
  return "unknown";
}
