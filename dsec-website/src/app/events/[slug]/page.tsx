import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Banner, Poster, Gallery, LeadBadge, Speakers, SponsorLogos } from "@/components/media";
import { Markdown } from "@/components/markdown";
import { SectionHeading } from "@/components/ui";
import { formatTicketPrice } from "@/lib/content";
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

/** Small label/value row for the event facts list. */
function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="border-l-4 border-paper/20 pl-3">
      <dt className="font-mono text-xs uppercase tracking-wide text-paper/50">{label}</dt>
      <dd className="mt-0.5 font-bold">{value}</dd>
    </div>
  );
}

export default async function EventDetailPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const isUpcoming = event.status === "upcoming";
  // A past event is auto-completed — its ticket link is hidden on the website.
  const ticket = isUpcoming ? event.ticketUrl ?? event.registerUrl : undefined;
  const ticketExternal = ticket ? /^https?:\/\//i.test(ticket) : false;
  // Only surface tiers that have a set price (0 = free) — skip unpriced/TBC rows.
  const tiers = (isUpcoming ? event.ticketTiers ?? [] : []).filter(
    (t) => t.price != null,
  );

  return (
    <div>
      <Banner src={event.bannerUrl} alt={event.title} />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/events"
          className="slide-link font-mono text-sm font-bold text-paper/60 hover:text-paper"
        >
          ← All events
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Side rail: poster + primary ticket CTA */}
          <aside className="space-y-4">
            <Poster src={event.posterUrl} alt={`${event.title} poster`} />
            {ticket && (
              <a
                href={ticket}
                target={ticketExternal ? "_blank" : undefined}
                rel={ticketExternal ? "noreferrer noopener" : undefined}
                className="btn btn-pink w-full justify-center !text-sm"
              >
                Get tickets{ticketExternal && " ↗"}
              </a>
            )}
            {tiers.length > 0 && (
              <div className="border-[3px] border-paper bg-panel p-4">
                <p className="font-mono text-xs uppercase tracking-wide text-paper/50">
                  Ticket pricing
                </p>
                <dl className="mt-2 space-y-1.5">
                  {tiers.map((t) => (
                    <div
                      key={t.label}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <dt className="text-paper/80">{t.label}</dt>
                      <dd className="font-bold">{formatTicketPrice(t.price)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </aside>

          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`pixel-tag ${isUpcoming ? "!bg-mint text-ink" : "!bg-panel-2"}`}>
                {isUpcoming ? "● upcoming" : "✓ past"}
              </span>
              <span className="font-mono text-xs text-paper/60">{event.date}</span>
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-paper/80">{event.blurb}</p>
            {event.outcome && (
              <p className="mt-4 inline-block border-l-4 border-yellow bg-yellow/15 px-3 py-1.5 font-mono text-sm font-bold">
                {event.outcome}
              </p>
            )}

            {event.lead && (
              <div className="mt-6">
                <LeadBadge lead={event.lead} label="Event lead" />
              </div>
            )}

            <dl className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Fact label="When" value={event.date} />
              <Fact label="Venue" value={event.venue} />
              <Fact label="Format" value={event.format} />
              <Fact label="Type" value={event.type} />
              <Fact label="Catering" value={event.foodIncluded ? "Food included" : undefined} />
            </dl>
          </div>
        </div>

        {/* Description — free-form Markdown body, only when the event has one */}
        {event.description && (
          <div className="mt-14">
            <SectionHeading eyebrow="About" title="What's happening.">
              The full rundown for {event.title}.
            </SectionHeading>
            <div className="mt-6 max-w-3xl text-lg">
              <Markdown content={event.description} />
            </div>
          </div>
        )}

        {/* Speakers — only when the event has them */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Speakers" title="Who's presenting.">
              The people sharing what they know at {event.title}.
            </SectionHeading>
            <div className="mt-6">
              <Speakers speakers={event.speakers} />
            </div>
          </div>
        )}

        {/* Sponsors — logo wall, only when the event has them */}
        {event.sponsors && event.sponsors.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Sponsors" title="Thanks to our sponsors.">
              {event.title} is made possible with the support of these partners.
            </SectionHeading>
            <div className="mt-6">
              <SponsorLogos sponsors={event.sponsors} />
            </div>
          </div>
        )}

        {/* Partners — collaborator clubs, only the ones published */}
        {event.partners && event.partners.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Partners" title="In collaboration with.">
              {event.title} is run together with these clubs and organisations.
            </SectionHeading>
            <div className="mt-6">
              <SponsorLogos sponsors={event.partners} />
            </div>
          </div>
        )}

        {/* Related events — other published events linked to this one */}
        {event.relatedEvents && event.relatedEvents.length > 0 && (
          <div className="mt-14">
            <SectionHeading eyebrow="Related" title="Part of the story.">
              Other events connected to {event.title}.
            </SectionHeading>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {event.relatedEvents.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/events/${r.slug}`}
                    className="group flex items-center justify-between gap-3 border-[3px] border-paper bg-panel p-4 transition-colors hover:bg-panel-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate font-bold">{r.title}</span>
                        {r.label && <span className="pixel-tag !bg-yellow text-ink">{r.label}</span>}
                      </div>
                      <span className="font-mono text-xs uppercase tracking-wide text-paper/50">
                        {r.status === "upcoming" ? "● upcoming" : "✓ past"}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-bold text-paper/40 transition-transform group-hover:translate-x-0.5 group-hover:text-paper">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gallery — any extra uploaded content, with its own empty state */}
        <div className="mt-14">
          <SectionHeading eyebrow="Gallery" title="From the event.">
            Photos and content from {event.title}.
          </SectionHeading>
          <div className="mt-6">
            <Gallery
              items={event.gallery ?? []}
              emptyLabel={isUpcoming ? "photos coming soon" : "no photos yet"}
              emptyHint={
                isUpcoming
                  ? "Come along — photos from the day will land here afterwards."
                  : "Photos from this event will appear here once they're added."
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
