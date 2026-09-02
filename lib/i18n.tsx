"use client";

import { createContext, useContext, useMemo, useCallback, type ReactNode } from "react";

export type Locale = "en" | "es" | "ja";

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || (navigator as any).userLanguage || "en";
  const code = lang.toLowerCase().split("-")[0];
  if (code === "es") return "es";
  if (code === "ja") return "ja";
  return "en";
}

const translations: Record<Locale, Record<string, string>> = {
  en: {
    "home.title": "Linked",
    "home.tagline": "One link for every music platform",
    "home.search.placeholder": "Paste a link or search...",
    "home.search.resolving": "Resolving link...",
    "home.result.copy": "Copy",
    "home.result.copied": "Copied!",
    "home.result.view": "View page",
    "home.showcase.label": "See it in action",
    "home.showcase.title": "Try a linked page",
    "home.showcase.desc": "Every link resolves to a universal page with options to open on any supported platform.",
    "home.steps.title": "How it works",
    "home.steps.1.title": "Copy a link",
    "home.steps.1.desc": "Grab a share URL from your favorite music app.",
    "home.steps.2.title": "Paste it here",
    "home.steps.2.desc": "Drop it into the input above and hit create.",
    "home.steps.3.title": "Share anywhere",
    "home.steps.3.desc": "Your new link works on Spotify, Apple Music, Deezer, Tidal, YouTube, and more.",
    "home.platforms": "Supported platforms",
    "home.footer.api": "API docs & health",
    "entity.tracklist": "Tracklist",
    "entity.single": "Single",
    "entity.album": "Album",
    "entity.artist": "Artist",
    "entity.notOn": "Not on {platform}",
    "entity.openOn": "Open on {platform}",
    "entity.lyrics.title": "Lyrics",
    "entity.lyrics.instrumental": "This is an instrumental track",
    "entity.lyrics.unavailable": "Lyrics not available",
    "entity.lyrics.loading": "Loading lyrics...",
    "entity.preview.title": "Preview",
    "entity.preview.play": "Play preview",
    "entity.preview.pause": "Pause preview",
    "entity.qr.title": "QR Code",
    "entity.qr.download": "Download QR",
    "entity.history.title": "Recent Links",
    "entity.history.empty": "No recent links yet",
    "entity.history.clear": "Clear history",
    "entity.history.remove": "Remove",
    "entity.embed.title": "Embed",
    "entity.embed.copy": "Copy embed code",
    "entity.embed.copied": "Copied!",
    "entity.share.title": "Share",
    "entity.share.copyLink": "Copy link",
    "entity.share.qr": "QR Code",
    "entity.share.embed": "Embed",
    "error.title": "Error",
    "error.message": "Failed to load music data. Please try again.",
    "error.back": "Go home",
    "notFound.title": "Not Found",
    "notFound.message": "The page you're looking for doesn't exist.",
    "notFound.back": "Go home",
    "api.title": "API Documentation",
    "api.search": "Search",
    "api.resolve": "Resolve",
    "api.health": "Health",
    "api.examples": "Examples",
    "api.playground": "Playground",
    "unsupported.title": "Content not available",
    "unsupported.podcast": "This appears to be a podcast or audiobook. Cross-platform linking is not yet supported for this content type.",
    "unsupported.region": "This content is not available in your region.",
  },
  es: {
    "home.title": "Linked",
    "home.tagline": "Un enlace para cada plataforma de música",
    "home.search.placeholder": "Pega un enlace o busca...",
    "home.search.resolving": "Resolviendo enlace...",
    "home.result.copy": "Copiar",
    "home.result.copied": "¡Copiado!",
    "home.result.view": "Ver página",
    "home.showcase.label": "Míralo en acción",
    "home.showcase.title": "Prueba una página linked",
    "home.showcase.desc": "Cada enlace resuelve a una página universal con opciones para abrir en cualquier plataforma compatible.",
    "home.steps.title": "Cómo funciona",
    "home.steps.1.title": "Copia un enlace",
    "home.steps.1.desc": "Obtén una URL de tu aplicación de música favorita.",
    "home.steps.2.title": "Pégalo aquí",
    "home.steps.2.desc": "Suéltalo en el campo de arriba y presiona crear.",
    "home.steps.3.title": "Comparte en cualquier lugar",
    "home.steps.3.desc": "Tu nuevo enlace funciona en Spotify, Apple Music, Deezer, Tidal, YouTube y más.",
    "home.platforms": "Plataformas compatibles",
    "home.footer.api": "Documentación de la API",
    "entity.tracklist": "Lista de canciones",
    "entity.single": "Single",
    "entity.album": "Álbum",
    "entity.artist": "Artista",
    "entity.notOn": "No disponible en {platform}",
    "entity.openOn": "Abrir en {platform}",
    "entity.lyrics.title": "Letra",
    "entity.lyrics.instrumental": "Esta es una pista instrumental",
    "entity.lyrics.unavailable": "Letra no disponible",
    "entity.lyrics.loading": "Cargando letra...",
    "entity.preview.title": "Vista previa",
    "entity.preview.play": "Reproducir vista previa",
    "entity.preview.pause": "Pausar vista previa",
    "entity.qr.title": "Código QR",
    "entity.qr.download": "Descargar QR",
    "entity.history.title": "Enlaces recientes",
    "entity.history.empty": "Sin enlaces recientes",
    "entity.history.clear": "Borrar historial",
    "entity.history.remove": "Eliminar",
    "entity.embed.title": "Insertar",
    "entity.embed.copy": "Copiar código",
    "entity.embed.copied": "¡Copiado!",
    "entity.share.title": "Compartir",
    "entity.share.copyLink": "Copiar enlace",
    "entity.share.qr": "Código QR",
    "entity.share.embed": "Insertar",
    "error.title": "Error",
    "error.message": "Error al cargar los datos. Intenta de nuevo.",
    "error.back": "Ir al inicio",
    "notFound.title": "No encontrado",
    "notFound.message": "La página que buscas no existe.",
    "notFound.back": "Ir al inicio",
    "api.title": "Documentación de la API",
    "api.search": "Buscar",
    "api.resolve": "Resolver",
    "api.health": "Salud",
    "api.examples": "Ejemplos",
    "api.playground": "Playground",
    "unsupported.title": "Contenido no disponible",
    "unsupported.podcast": "Esto parece ser un podcast o audiolibro. El enlace cruzado aún no es compatible con este tipo de contenido.",
    "unsupported.region": "Este contenido no está disponible en tu región.",
  },
  ja: {
    "home.title": "Linked",
    "home.tagline": "すべての音楽プラットフォームのための1つのリンク",
    "home.search.placeholder": "リンクを貼り付けるか検索...",
    "home.search.resolving": "リンクを解決中...",
    "home.result.copy": "コピー",
    "home.result.copied": "コピーしました！",
    "home.result.view": "ページを見る",
    "home.showcase.label": "実際にお試し",
    "home.showcase.title": "Linkedページを試す",
    "home.showcase.desc": "すべてのリンクは、サポートされているすべてのプラットフォームで開くオプション付きのユニバーサルページに解決されます。",
    "home.steps.title": "使い方",
    "home.steps.1.title": "リンクをコピー",
    "home.steps.1.desc": "お気に入りの音楽アプリから共有URLを取得。",
    "home.steps.2.title": "ここに貼り付け",
    "home.steps.2.desc": "上の入力欄にドロップして作成をクリック。",
    "home.steps.3.title": "どこでも共有",
    "home.steps.3.desc": "新しいリンクはSpotify、Apple Music、Deezer、Tidal、YouTubeなどで動作します。",
    "home.platforms": "対応プラットフォーム",
    "home.footer.api": "APIドキュメント",
    "entity.tracklist": "トラックリスト",
    "entity.single": "シングル",
    "entity.album": "アルバム",
    "entity.artist": "アーティスト",
    "entity.notOn": "{platform}では利用できません",
    "entity.openOn": "{platform}で開く",
    "entity.lyrics.title": "歌詞",
    "entity.lyrics.instrumental": "インストゥルメンタル曲です",
    "entity.lyrics.unavailable": "歌詞は利用できません",
    "entity.lyrics.loading": "歌詞を読み込み中...",
    "entity.preview.title": "プレビュー",
    "entity.preview.play": "プレビューを再生",
    "entity.preview.pause": "プレビューを一時停止",
    "entity.qr.title": "QRコード",
    "entity.qr.download": "QRをダウンロード",
    "entity.history.title": "最近のリンク",
    "entity.history.empty": "最近のリンクはありません",
    "entity.history.clear": "履歴をクリア",
    "entity.history.remove": "削除",
    "entity.embed.title": "埋め込み",
    "entity.embed.copy": "コードをコピー",
    "entity.embed.copied": "コピーしました！",
    "entity.share.title": "共有",
    "entity.share.copyLink": "リンクをコピー",
    "entity.share.qr": "QRコード",
    "entity.share.embed": "埋め込み",
    "error.title": "エラー",
    "error.message": "データの読み込みに失敗しました。もう一度お試しください。",
    "error.back": "ホームに戻る",
    "notFound.title": "見つかりません",
    "notFound.message": "お探しのページは存在しません。",
    "notFound.back": "ホームに戻る",
    "api.title": "APIドキュメント",
    "api.search": "検索",
    "api.resolve": "解決",
    "api.health": "ヘルス",
    "api.examples": "例",
    "api.playground": "プレイグラウンド",
    "unsupported.title": "コンテンツは利用できません",
    "unsupported.podcast": "これはポッドキャストまたはオーディオブックのようです。このコンテンツタイプのクロスプラットフォームリンクはまだサポートされていません。",
    "unsupported.region": "このコンテンツはお使いの地域では利用できません。",
  },
};

interface I18nContextValue {
  locale: Locale;
  t: (key: string, params?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useMemo(() => detectLocale(), []);

  const t = useCallback(
    (key: string, params?: Record<string, string>): string => {
      let value = translations[locale]?.[key] || translations.en[key] || key;
      if (params) {
        for (const [param, replacement] of Object.entries(params)) {
          value = value.replace(`{${param}}`, replacement);
        }
      }
      return value;
    },
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: "en" as Locale,
      t: (key: string, params?: Record<string, string>) => {
        let value = translations.en[key] || key;
        if (params) {
          for (const [param, replacement] of Object.entries(params)) {
            value = value.replace(`{${param}}`, replacement);
          }
        }
        return value;
      },
    };
  }
  return context;
}

export { translations };
