import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linked - Share Music with anyone",
  description: "Share your favorite music across any platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Linked",
  },
};

export const viewport: Viewport = {
  themeColor: "#6c5ce7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
        <I18nProvider>
          <Link href="https://github.com/OseMine/linked" aria-label="GitHub repository" className="github-link">
            <FaGithub size={20} />
          </Link>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
