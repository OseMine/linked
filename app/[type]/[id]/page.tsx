import { decodeLinkedId } from "@/lib/linked-id";
import { getMusicDataCached } from "@/lib/songlink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import EntityHero from "@/components/EntityHero";
import UnsupportedContent from "@/components/UnsupportedContent";

export const instant = false;

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type, id } = await params;
  const decoded = decodeLinkedId(id);

  if (!decoded || decoded.type !== type) {
    return { title: "Not Found - Linked" };
  }

  // Podcast/audiobook types are not fully supported
  if (type === "podcast" || type === "audiobook") {
    return { title: "Content not available - Linked" };
  }

  try {
    const data = await getMusicDataCached(decoded.platform, decoded.type, decoded.platformId);
    const title = decoded.type === "artist" ? data.name : `${data.name} - ${data.artist}`;
    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${type}/${id}`;
    const ogImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/og?title=${encodeURIComponent(data.name)}&artist=${encodeURIComponent(data.artist || '')}&image=${encodeURIComponent(data.image || '')}`;

    return {
      title: `${title} - Linked`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} - Linked`,
        description: `Listen to ${data.name} by ${data.artist || 'Unknown'} on any platform`,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${data.name} - Linked`,
          },
        ],
        type: "music.song",
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - Linked`,
        description: `Listen to ${data.name} by ${data.artist || 'Unknown'} on any platform`,
        images: [ogImageUrl],
      },
    };
  } catch {
    return { title: "Linked" };
  }
}

export default async function EntityPage({ params }: PageProps) {
  const { type, id } = await params;
  const decoded = decodeLinkedId(id);

  if (!decoded || decoded.type !== type) {
    notFound();
  }

  // Handle podcast/audiobook types with unsupported message
  if (type === "podcast" || type === "audiobook") {
    return <UnsupportedContent type={type} />;
  }

  let data;
  try {
    data = await getMusicDataCached(decoded.platform, decoded.type, decoded.platformId);
  } catch (error) {
    console.error('Error fetching music data:', error);
    return (
      <div className="error-page">
        <h1>Error</h1>
        <p>Failed to load music data. Please try again.</p>
        <p className="error-details">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <Link href="/">← Go home</Link>
      </div>
    );
  }

  return <EntityHero data={data} type={decoded.type} />;
}
