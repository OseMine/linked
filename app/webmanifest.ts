import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://linkedapp.ddns.net";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Linked",
    short_name: "Linked",
    description: "One link to rule them all - Share music across any platform",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#6c5ce7",
    orientation: "any",
    scope: "/",
    lang: "en",
    categories: ["music", "utilities"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Search Music",
        short_name: "Search",
        description: "Search for music to share",
        url: "/",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
  };
}