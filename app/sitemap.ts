import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://linkedapp.ddns.net";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/docs/playground`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/docs/examples`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // Note: Dynamic entity pages (/song/*, /album/*, /artist/*) are not included here
  // because they are generated on-demand from user input. Instead, we rely on:
  // 1. Google discovering them via internal links from the home page featured artists
  // 2. Social shares and external links
  // 3. The sitemap ping API if needed for specific URLs
  //
  // If you want to include popular/recent entities, you could fetch them from a database here.

  return staticPages;
}