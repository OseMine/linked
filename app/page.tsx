"use client";

import { Play, Search, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import LinkHistory from "@/components/LinkHistory";

interface SearchResult {
  title: string;
  artist: string | null;
  platform: string;
  type: "song" | "album" | "artist";
  platformId: string;
  linkedId: string;
  duration: number | null;
  image: string | null;
}

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
  "https://open.spotify.com/artist/4nXKLJPNMpME7ZtV1ClQLc",
  "https://open.spotify.com/artist/0MZ55DwuMQ1B2TXq9lcrE4",
  "https://open.spotify.com/artist/02RMYgMewVfvyoxyAbegTo",
  "https://open.spotify.com/artist/1yoERhqOE1iKKzKELHhEWM",
  "https://open.spotify.com/artist/6SWVilo40Nph8i52kUuAtI",
  "https://open.spotify.com/artist/2TiXt00aPsggbxZxL1RaG7",
  "https://open.spotify.com/artist/432R46LaYsJZV2Gmc4jUV5",
  "https://open.spotify.com/artist/2jXb8AWz82Sn3RRGOaia7a",
  "https://open.spotify.com/artist/6Iif8M5PGhQcm5t490OYB6",
  "https://open.spotify.com/artist/0hLd40hVpRDGENe4KGZLnW",
  "https://open.spotify.com/artist/3udx0FlpyLF8BmjDVgxYZm",
  "https://open.spotify.com/artist/66RYRcCpcfJqF3TwqCbUce",
  "https://open.spotify.com/artist/4NKHTY0ghFbhkFwl29BxMD",
  "https://open.spotify.com/artist/13XOdftLPuWTn5iH2bUq2B",
];

interface FeaturedArtist {
  name: string;
  linkedUrl: string;
  image: string | null;
}

export default function Home() {
  const { t } = useI18n();
  const router = useRouter();
  const [featuredArtists, setFeaturedArtists] = useState<FeaturedArtist[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResolveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const logoRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const platformsRef = useRef<HTMLDivElement>(null);
  const artistCardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    async function loadFeaturedArtists() {
      // Send 8 instead of 4 so transient resolution failures don't leave gaps.
      const selectedUrls = [...FEATURED_ARTISTS]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      const response = await fetch("/api/featured-artists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedUrls }),
      });

      if (!response.ok) return;

      const data: { artists: FeaturedArtist[] } = await response.json();
      setFeaturedArtists(data.artists);
    }

    loadFeaturedArtists();
  }, []);

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

  useEffect(() => {
    if (featuredArtists.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).style.opacity = "1";
          (entry.target as HTMLElement).style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.1 });

    artistCardRefs.current.forEach((card, index) => {
      if (card) {
        const delay = (index * 100) + 300;
        card.style.opacity = "0";
        card.style.transform = "translateY(15px)";
        card.style.transition = `opacity 0.4s ease-out ${delay}ms, transform 0.4s ease-out ${delay}ms`;
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, [featuredArtists]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8&type=track`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.results || []);
      }
    } catch {
      setSuggestions([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (input.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(input);
      }, 300);
    } else {
      setSuggestions([]);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [input, fetchSuggestions]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");
    setResult(null);
    setCopied(false);
    setLoading(true);

    try {
      const res = await fetch("/api/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: input }),
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

  function handleSuggestionClick(result: SearchResult) {
    router.push(`/${result.type}/${result.linkedId}`);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
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
        <h1 ref={logoRef} className="home-logo">{t("home.title")}</h1>
        <p ref={taglineRef} className="home-tagline">{t("home.tagline")}</p>

        <div className="search-container" ref={searchContainerRef}>
          <form onSubmit={handleCreate} className="home-search-form">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              placeholder={t("home.search.placeholder")}
              autoComplete="off"
              className="search-input"
            />
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="search-clear"
              >
                <X size={16} />
              </button>
            )}
            <button type="submit" aria-label="Resolve" disabled={loading} className="search-submit">
              <Play size={16} />
            </button>
          </form>

          {showSuggestions && (suggestions.length > 0 || searchLoading) && (
            <div className="search-suggestions">
              {searchLoading ? (
                <div className="search-suggestion-loading">Searching...</div>
              ) : (
                suggestions.map((result, index) => (
                  <button
                    key={`${result.platform}:${result.type}:${result.platformId}-${index}`}
                    className="search-suggestion"
                    onClick={() => handleSuggestionClick(result)}
                    type="button"
                  >
                    {result.image && (
                      <img src={result.image} alt="" />
                    )}
                    <div className="search-suggestion-info">
                      <span className="search-suggestion-name">{result.title}</span>
                      {result.artist && (
                        <span className="search-suggestion-artist">{result.artist}</span>
                      )}
                    </div>
                    <span className="search-suggestion-type">
                      {result.platform} &bull; {result.type}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {loading && <div className="home-status">{t("home.search.resolving")}</div>}
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
                {copied ? t("home.result.copied") : t("home.result.copy")}
              </button>
            </div>
            <a href={result.linkedUrl} className="home-result-view">
              {t("home.result.view")} &rarr;
            </a>
          </div>
        )}
      </section>

      <LinkHistory />

      <section className="home-showcase" ref={showcaseRef}>
        <p className="home-showcase-label">{t("home.showcase.label")}</p>
        <h2 className="home-showcase-title">{t("home.showcase.title")}</h2>
        <p className="home-showcase-desc">
          {t("home.showcase.desc")}
        </p>
        <div className="home-showcase-grid">
          {featuredArtists.map((a, index) => (
                <div
              key={`${a.linkedUrl}-${index}`}
              ref={(el) => { artistCardRefs.current[index] = el; }}
              className="home-artist-card-wrapper"
            >
              <Link href={a.linkedUrl} className="home-artist-card">
                {a.image && <img src={a.image} alt={a.name} className="home-artist-img" />}
                <div className="home-artist-overlay" />
                <span className="home-artist-name">{a.name}</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="home-steps" ref={stepsRef}>
        <h2 className="home-steps-title">{t("home.steps.title")}</h2>
        <div className="home-steps-grid">
          <div className="home-step">
            <span className="home-step-num">1</span>
            <h3>{t("home.steps.1.title")}</h3>
            <p>{t("home.steps.1.desc")}</p>
          </div>
          <div className="home-step">
            <span className="home-step-num">2</span>
            <h3>{t("home.steps.2.title")}</h3>
            <p>{t("home.steps.2.desc")}</p>
          </div>
          <div className="home-step">
            <span className="home-step-num">3</span>
            <h3>{t("home.steps.3.title")}</h3>
            <p>{t("home.steps.3.desc")}</p>
          </div>
        </div>
      </section>

      <section className="home-platforms" ref={platformsRef}>
        <h3>{t("home.platforms")}</h3>
        <div className="home-platform-icons">
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/spotify.svg" alt="Spotify" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/applemusic.svg" alt="Apple Music" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/deezer.svg" alt="Deezer" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/tidal.svg" alt="Tidal" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/youtube.svg" alt="YouTube" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/youtubemusic.svg" alt="YouTube Music" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/amazon.svg" alt="Amazon Music" />
          <img src="https://cdn.jsdelivr.net/npm/simple-icons@9/icons/bandcamp.svg" alt="Bandcamp" />
        </div>
      </section>

      <footer className="home-footer">
        <Link href="/docs" className="home-api-link">
          {t("home.footer.api")} &rarr;
        </Link>
      </footer>
    </main>
  );
}
