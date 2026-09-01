import type { Metadata } from "next";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import "./globals.css";

export const metadata: Metadata = {
  title: "Linked - Share Music with anyone",
  description: "Share your favorite music across any platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Link href="https://github.com/OseMine/linked" aria-label="GitHub repository" className="github-link">
          <FaGithub size={20} />
        </Link>
        {children}
      </body>
    </html>
  );
}
