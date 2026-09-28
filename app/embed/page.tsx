import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://linkedapp.ddns.net";

export const metadata: Metadata = {
  title: "Embed - Linked",
  description: "Embed a music player widget from Linked.",
  alternates: {
    canonical: `${BASE_URL}/embed`,
  },
  openGraph: {
    title: "Embed - Linked",
    description: "Embed a music player widget from Linked.",
    url: `${BASE_URL}/embed`,
    siteName: "Linked",
    type: "website",
    images: [
      {
        url: "/api/og?title=Embed&artist=Linked",
        width: 1200,
        height: 630,
        alt: "Linked Embed",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Embed - Linked",
    description: "Embed a music player widget from Linked.",
    images: ["/api/og?title=Embed&artist=Linked"],
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function EmbedPage() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: "#a1a1a6", fontFamily: "sans-serif" }}>
      <p>This is an embeddable widget. Use it in an iframe:</p>
      <code style={{ fontSize: 12 }}><iframe src="..."></iframe></code>
    </div>
  );
}