import type { Metadata } from "next";
import Link from "next/link";
import { EventCard, SectionHeading, ComingSoon } from "@/components/ui";
import { PixelDuck } from "@/components/pixel-duck";
import { JsonLd } from "@/components/json-ld";
import { eventsSchema } from "@/lib/schema";
import { events } from "@/lib/content";

export const metadata: Metadata = {
  title: "Events - DSEC Hackathons & Workshops at Deakin",
  description:
    "Hackathons, workshops and ship nights. Proof DSEC delivers, and what's coming up.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "DSEC Events - Hackathons & Workshops at Deakin",
    description:
      "Hackathons, workshops and ship nights students actually turn up to. See what's on.",
    url: "/events",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSEC Events - Hackathons & Workshops at Deakin",
    description: "Hackathons, workshops and ship nights. See what's coming up.",
  },
};

// TEMP: flip to true to show real event cards once the events API is wired up.
const showContent: boolean = false;

export default function EventsPage() {
  const past = events.filter((e) => e.status === "past");
  const upcoming = events.filter((e) => e.status === "upcoming");

  const schema = eventsSchema();

  return (
    <div>
      {schema.length > 0 && <JsonLd data={schema} />}
      <section className="border-b-[3px] border-paper bg-pink text-paper">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="eyebrow !text-ink">What we run</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Events people actually turn up to.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-paper/90">
              The proven winners first, then the next thing you can register for.
            </p>
            <p className="mt-3 font-mono text-xs font-bold uppercase tracking-wide text-ink">
              Free for club members · paid entry for non-members
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PixelDuck name="duck-trophy" alt="" size={220} priority bob />
          </div>
        </div>
      </section>

      {/* Upcoming first for students, with a clear register CTA */}
      {/* TEMP: event cards hidden while the events API is wired up. Restore the
          block below (and remove the ComingSoon) once events are populated. */}
      {upcoming.length > 0 && showContent && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading eyebrow="Upcoming" title="Coming up. Grab a spot.">
            Free for club members, paid entry for non-members. Register and
            we&apos;ll save you a seat.
          </SectionHeading>
          <div className="stagger mt-8 grid gap-5">
            {upcoming.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <ComingSoon
          label="updating soon"
          title="Events are landing here shortly."
          duck="duck-rocket"
        >
          We&apos;re wiring up the events feed right now. Check back soon, or hop
          on Discord to hear about the next one first.
        </ComingSoon>
      </section>

      {/* Past events emphasise scale + outcomes - sponsor proof */}
      {/* TEMP: past event cards hidden while the events API is wired up. */}
      <section className="border-t-[3px] border-paper bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading eyebrow="Already delivered" title="The proof we deliver.">
            Scale and outcomes first. This is what makes sponsorship credible.
          </SectionHeading>
          {showContent && (
            <div className="stagger mt-8 grid gap-5">
              {past.map((e) => (
                <EventCard key={e.slug} event={e} />
              ))}
            </div>
          )}
          <div className="mt-8">
            <ComingSoon
              label="updating soon"
              title="Our event recaps are on the way."
              duck="duck-trophy"
            >
              Photos, attendance and outcomes from past events will appear here
              once the API is connected.
            </ComingSoon>
          </div>
          <p className="mt-8 text-paper/75">
            These events are where members{" "}
            <Link href="/projects" className="font-bold text-blue hover:underline">
              ship real projects
            </Link>
            . If your company wants in front of them,{" "}
            <Link href="/sponsor" className="font-bold text-blue hover:underline">
              see sponsorship options
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
