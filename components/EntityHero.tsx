"use client";

import type { EntityData } from "@/lib/songlink";
import Link from "next/link";

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
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function EntityHero({ data, type }: EntityHeroProps) {
  const { name, artist, image, links, year } = data;
  const imageSrc = image || "/images.svg";

  const typeLabel = type === "artist" ? "Artist" : type === "album" ? "Album" : "Single";
  const subtitleParts = [artist, type === "album" && year ? String(year) : typeLabel].filter(Boolean);
  const subtitle = subtitleParts.join(" • ");

  const getHref = (p: (typeof PLATFORMS)[number]): string | undefined => {
    if (links[p.key]) return links[p.key];
    for (const a of p.aliases ?? []) if (links[a]) return links[a];
    return undefined;
  };

  return (
    <div className="hero scrollable">
      <img src={imageSrc} alt={name} className="band-image-big" />
      <div className="hero-overlay"></div>
      <div className="hero-content">
        <img src={imageSrc} alt={name} className="entity-cover" />
        <h2 className="band">{name}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
        {data.tracks.length > 0 && (
          <section className="tracklist">
            <h3 className="section-title">Tracklist</h3>
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
        <div className="platforms">
          {PLATFORMS.map((p) => {
            const href = getHref(p);
            if (!href) {
              return (
                <div key={p.key} className="platform unavailable">
                  <img src={`https://cdn.jsdelivr.net/npm/simple-icons@9/icons/${p.icon}.svg`} alt="" className="platform-icon" />
                  <span>Not on {p.name}</span>
                </div>
              );
            }
            return (
              <a key={p.key} className="platform" href={href} target="_blank" rel="noopener">
                <img src={`https://cdn.jsdelivr.net/npm/simple-icons@9/icons/${p.icon}.svg`} alt="" className="platform-icon" />
                <span>Open on {p.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
