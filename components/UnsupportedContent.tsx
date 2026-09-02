"use client";

import { useI18n } from "@/lib/i18n";

interface UnsupportedContentProps {
  type: string;
}

export default function UnsupportedContent({ type }: UnsupportedContentProps) {
  const { t } = useI18n();

  const message = type === "podcast"
    ? t("unsupported.podcast")
    : t("unsupported.region");

  return (
    <div className="unsupported-content">
      <div className="unsupported-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 className="unsupported-title">{t("unsupported.title")}</h2>
      <p className="unsupported-message">{message}</p>
    </div>
  );
}
