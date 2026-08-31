"use client";

import { Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

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

const FEATURED_ARTISTS = [
  {
    name: "Falschgeld",
    linkedId: "asp-4nXKLJPNMpME7ZtV1ClQLc",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab67616100005174455708c558ded1affc55fd59",
  },
  {
    name: "Kraftklub",
    linkedId: "asp-0MZ55DwuMQ1B2TXq9lcrE4",
    image: "https://image-cdn-ak.spotifycdn.com/image/ab67616100005174ba37a104ca04d602889d7415",
  },
  {
    name: "KAFFKIEZ",
    linkedId: "asp-02RMYgMewVfvyoxyAbegTo",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab67616100005174657e587dcfc14eaba2374c95",
  },
  {
    name: "Das Lumpenpack",
    linkedId: "asp-1yoERhqOE1iKKzKELHhEWM",
    image: "https://image-cdn-fa.spotifycdn.com/image/ab676161000051749e6d2520f7b7fb6e54f40c59",
  },
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const logoRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const platformsRef = useRef<HTMLDivElement>(null);
  const artistCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = "1";
          (entry.target as HTMLElement).style.transform = "translateY(0)";
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    if (logoRef.current) {
      logoRef.current.style.opacity = "1";
      logoRef.current.style.transform = "translateY(0)";
      logoRef.current.style.transition = "none";
    }

    if (taglineRef.current) {
      taglineRef.current.style.opacity = "1";
      taglineRef.current.style.transform = "translateY(0)";
      taglineRef.current.style.transition = "none";
    }

    if (formRef.current) {
      formRef.current.style.opacity = "0";
      formRef.current.style.transform = "translateY(15px)";
      setTimeout(() => {
        formRef.current!.style.opacity = "1";
        formRef.current!.style.transform = "translateY(0)";
      }, 300);
    }

    if (resultRef.current) {
      resultRef.current.style.opacity = "0";
      resultRef.current.style.transform = "translateY(15px)";
      observer.observe(resultRef.current);
    }

    if (showcaseRef.current) {
      showcaseRef.current.style.opacity = "0";
      showcaseRef.current.style.transform = "translateY(15px)";
      setTimeout(() => observer.observe(showcaseRef.current!), 100);
    }

    if (stepsRef.current) {
      stepsRef.current.style.opacity = "0";
      stepsRef.current.style.transform = "translateY(15px)";
      setTimeout(() => observer.observe(stepsRef.current!), 150);
    }

    if (platformsRef.current) {
      platformsRef.current.style.opacity = "0";
      platformsRef.current.style.transform = "translateY(15px)";
      setTimeout(() => observer.observe(platformsRef.current!), 200);
    }

    artistCardRefs.current.forEach((card, index) => {
      if (card) {
        const delay = (index * 100) + 300;
        card.style.opacity = "0";
        card.style.transform = "translateY(15px)";
        card.style.transition = `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`;
        setTimeout(() => observer.observe(card!), delay);
      }
    });

    return () => observer.disconnect();
  }, []);

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
    <main className="home">
      <section className="home-hero">
        <h1 ref={logoRef} className="home-logo">Linked</h1>
        <p ref={taglineRef} className="home-tagline">One link for every music platform</p>

        <form ref={formRef} onSubmit={handleCreate} className="home-form">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a link from Spotify, Apple Music, Deezer, Tidal, YouTube..."
            required
            autoComplete="off"
          />
          <button type="submit" aria-label="Create linked URL" disabled={loading}>
            <Play size={18} />
          </button>
        </form>

        {loading && <div className="home-status">Resolving link...</div>}
        {error && <div className="home-status error">{error}</div>}

        {result && (
          <div ref={resultRef} className="home-result">
            <div className="home-result-preview">
              {result.entity.image && (
                <img src={result.entity.image} alt="" className="home-result-img" />
              )}
              <div className="home-result-info">
                <strong>{result.entity.name}</strong>
                {result.entity.artist && <span>{result.entity.artist}</span>}
              </div>
            </div>
            <div className="home-result-url">
              <input
                type="text"
                value={window.location.origin + result.linkedUrl}
                readOnly
              />
              <button onClick={copyLink} type="button">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <a href={result.linkedUrl} className="home-result-view">
              View page &rarr;
            </a>
          </div>
        )}
      </section>

      <section className="home-showcase" ref={showcaseRef}>
        <p className="home-showcase-label">See it in action</p>
        <h2 className="home-showcase-title">Try a linked page</h2>
        <p className="home-showcase-desc">
          Every link resolves to a universal page with options to open on any
          supported platform.
        </p>
        <div className="home-showcase-grid">
          {FEATURED_ARTISTS.map((a, index) => (
            <div
              key={a.linkedId}
              ref={(el) => { artistCardRefs.current[index] = el; }}
              className="home-artist-card-wrapper"
            >
              <Link href={`/artist/${a.linkedId}`} className="home-artist-card">
                <img src={a.image} alt={a.name} className="home-artist-img" />
                <div className="home-artist-overlay" />
                <span className="home-artist-name">{a.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="home-steps" ref={stepsRef}>
        <h2 className="home-steps-title">How it works</h2>
        <div className="home-steps-grid">
          <div className="home-step">
            <span className="home-step-num">1</span>
            <h3>Copy a link</h3>
            <p>Grab a share URL from your favorite music app.</p>
          </div>
          <div className="home-step">
            <span className="home-step-num">2</span>
            <h3>Paste it here</h3>
            <p>Drop it into the input above and hit create.</p>
          </div>
          <div className="home-step">
            <span className="home-step-num">3</span>
            <h3>Share anywhere</h3>
            <p>
              Your new link works on Spotify, Apple Music, Deezer, Tidal,
              YouTube, and more.
            </p>
          </div>
        </div>
      </section>

      <section className="home-platforms" ref={platformsRef}>
        <h3>Supported platforms</h3>
        <div className="home-platform-icons">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/spotify.svg" alt="Spotify" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/applemusic.svg" alt="Apple Music" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/deezer.svg" alt="Deezer" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/tidal.svg" alt="Tidal" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/youtube.svg" alt="YouTube" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/amazonmusic.svg" alt="Amazon Music" />
        </div>
      </section>

      <footer className="home-footer">
        <Link href="/api/help" className="home-api-link">
          API docs &amp; health &rarr;
        </Link>
      </footer>
    </main>
  );
}