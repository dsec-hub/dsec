import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventDetail } from "@/components/event-detail";
import { FlagshipEvent } from "@/components/flagship-event";
import { getEvent, getEvents } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const events = await getEvents();
  return (events ?? []).map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found - DSEC" };

  // Flagship gets a louder card: the teaser headline + the theme key art as a
  // large summary image, so a shared link spreads the mystery.
  if (event.flagship) {
    const isTeaser = event.flagshipState !== "revealed";
    const fTitle = isTeaser
      ? `${event.flagshipTeaserTitle || event.title} — coming soon`
      : `${event.title} - DSEC Flagship`;
    const fDesc = (isTeaser && event.flagshipTeaserBody) || event.blurb || `A DSEC flagship event: ${event.title}.`;
    const art = `/flagship/hero-${event.flagshipTheme ?? "arena"}.webp`;
    return {
      title: fTitle,
      description: fDesc,
      alternates: { canonical: `/events/${event.slug}` },
      openGraph: { title: fTitle, description: fDesc, url: `/events/${event.slug}`, type: "website", images: [art] },
      twitter: { card: "summary_large_image", title: fTitle, description: fDesc, images: [art] },
    };
  }

  const title = `${event.title} - DSEC Event`;
  const description = event.blurb || `A DSEC event: ${event.title}.`;
  return {
    title,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      title,
      description,
      url: `/events/${event.slug}`,
      type: "website",
      images: event.bannerUrl ? [event.bannerUrl] : event.imageUrl ? [event.imageUrl] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  // Flagship events render their own unique two-state marketing template.
  if (event.flagship) return <FlagshipEvent event={event} />;

  return <EventDetail event={event} />;
}
