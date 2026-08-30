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
  { key: "soundcloud", name: "SoundCloud", icon: "soundcloud" },
  { key: "amazonmusic", name: "Amazon Music", icon: "amazon", aliases: ["amazonMusic"] },
];

function formatDuration(seconds: number | null): string {
  if (!seconds) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function EntityHero({ data, type }: EntityHeroProps) {
  const { name, artist, image, links, year, tracks } = data;
  const imageSrc = image || "/images.svg";

  const action = type === "artist" ? "Follow on" : type === "album" ? "Listen on" : "Play on";

  const platforms = PLATFORMS.filter((p) => (p.aliases?.some((a) => links[a]) || links[p.key]));

  const getHref = (p: (typeof PLATFORMS)[number]): string | undefined => {
    if (links[p.key]) return links[p.key];
    for (const a of p.aliases ?? []) if (links[a]) return links[a];
    return undefined;
  };

  let content;
  if (type === "artist") {
    content = (
      <>
        <img src={imageSrc} alt={name} className="band-profile-picture" />
        <h2 className="band">{name}</h2>
      </>
    );
  } else if (type === "song") {
    content = (
      <>
        <img src={imageSrc} alt={name} className="song-cover" />
        <h2 className="band">{name}</h2>
        <p className="subtitle">{artist} • Single</p>
      </>
    );
  } else {
    content = (
      <>
        <img src={imageSrc} alt={name} className="album-cover" />
        <h2 className="band">{name}</h2>
        <p className="subtitle">{artist} • {year || "Album"}</p>
        {tracks.length > 0 && (
          <section className="tracklist">
            <h3 className="section-title">Tracklist</h3>
            <ol className="tracklist-list">
              {tracks.map((track, i) => (
                <li key={i} className="tracklist-item">
                  <span>{track.name}</span>
                  <span className="track-duration">{formatDuration(track.duration)}</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </>
    );
  }

  return (
    <div className={type === "album" ? "hero scrollable" : "hero"}>
      <img src={imageSrc} alt={name} className="band-image-big" />
      <div className="hero-overlay"></div>
      <div className="hero-content">{content}</div>
      <div className="platforms">
        {platforms.map((p) => {
          const href = getHref(p);
          if (!href) return null;
          return (
            <a key={p.key} className="platform" href={href} target="_blank" rel="noopener">
              <img src={`https://cdn.jsdelivr.net/npm/simple-icons@9/icons/${p.icon}.svg`} alt="" className="platform-icon" />
              <span>{action} {p.name}</span>
            </a>
          );
        })}
      </div>
      <div className="back-link">
      </div>
    </div>
  );
}