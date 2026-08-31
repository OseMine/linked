import { decodeLinkedId } from "@/lib/linked-id";
import { getMusicDataCached } from "@/lib/songlink";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import EntityHero from "@/components/EntityHero";

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

  try {
    const data = await getMusicDataCached(decoded.platform, decoded.type, decoded.platformId);
    const title = decoded.type === "artist" ? data.name : `${data.name} - ${data.artist}`;
    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || ''}/${type}/${id}`;
    return {
      title: `${title} - Linked`,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: `${title} - Linked`,
        images: data.image ? [{ url: data.image }] : [],
      },
      twitter: {
        card: 'summary',
        title: `${title} - Linked`,
        images: data.image ? [data.image] : [],
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