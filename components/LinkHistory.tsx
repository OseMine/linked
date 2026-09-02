"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { getHistory, clearHistory, removeFromHistory, type HistoryEntry } from "@/lib/history";
import Link from "next/link";

export default function LinkHistory() {
  const { t } = useI18n();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleClear() {
    clearHistory();
    setHistory([]);
  }

  function handleRemove(id: string) {
    removeFromHistory(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  }

  if (history.length === 0) return null;

  return (
    <section className="home-history">
      <div className="home-history-header">
        <h2 className="home-history-title">{t("entity.history.title")}</h2>
        <button onClick={handleClear} className="home-history-clear">
          {t("entity.history.clear")}
        </button>
      </div>
      <div className="home-history-list">
        {history.map((entry) => (
          <div key={entry.id} className="home-history-item">
            <Link href={entry.linkedUrl} className="home-history-link">
              {entry.image && (
                <img src={entry.image} alt="" className="home-history-img" />
              )}
              <div className="home-history-info">
                <span className="home-history-name">{entry.name}</span>
                {entry.artist && (
                  <span className="home-history-artist">{entry.artist}</span>
                )}
              </div>
              <span className="home-history-type">{entry.type}</span>
            </Link>
            <button
              onClick={() => handleRemove(entry.id)}
              className="home-history-remove"
              aria-label={t("entity.history.remove")}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
