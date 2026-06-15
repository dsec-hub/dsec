import type { Metadata } from "next";
import { SponsorForm } from "@/components/sponsor-form";
import { SponsorTiers } from "@/components/sponsor-tiers";
import { BookMeetingButton } from "@/components/book-meeting-button";
import { SectionHeading, EventCard } from "@/components/ui";
import { SponsorLogos } from "@/components/media";
import { PixelDuck } from "@/components/pixel-duck";
import { stats, projects } from "@/lib/content";
import { getEvents, getPackages, getSponsors } from "@/lib/api";

export const metadata: Metadata = {
  title: "Sponsor DSEC - Reach Deakin Software Talent",
  description:
    "Reach Deakin's most active software students. Brand presence at events, a pipeline to grads, and proof we deliver.",
  alternates: { canonical: "/sponsor" },
  openGraph: {
    title: "Sponsor DSEC - Reach Deakin Software Talent",
    description:
      "Brand at events students show up to, plus a direct pipeline to Deakin grads. Packages from $500.",
    url: "/sponsor",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sponsor DSEC - Reach Deakin Software Talent",
    description:
      "Brand at events students show up to, plus a direct pipeline to Deakin grads. Packages from $500.",
  },
};

export default async function SponsorPage() {
  // Live events when present, else the static proof list (same fallback as the
  // rest of the site), so the cards always link to a real detail page.
  const [flagship, tiers, sponsors] = await Promise.all([
    getEvents().then((evts) => evts.filter((e) => e.status === "past").slice(0, 2)),
    getPackages(),
    getSponsors(),
  ]);

  return (
    <div>
      {/* 1 - VALUE PROP in the company's language */}
      <section className="border-b-[3px] border-paper bg-blue text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col justify-center">
            <p className="eyebrow !text-yellow">For companies</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Reach Deakin&apos;s most active software talent.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-paper/85">
              DSEC members don&apos;t just attend. They build and ship. Sponsoring us
              puts your brand in front of students who can already code, at the events
              they actually turn up to, with a direct line to graduates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#packages" className="btn btn-pink">
                See the packages
              </a>
              <BookMeetingButton className="btn btn-ghost !bg-panel" label="Book a call" />
            </div>
          </div>
          <div className="flex items-center justify-center overflow-visible">
            <PixelDuck name="duck-rocket" alt="" size={200} bob />
          </div>
        </div>
      </section>

      {/* What you get - benefit-led */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="What you get" title="Three things, plainly.">
          No fluffy &quot;brand alignment&quot;. Here&apos;s what a sponsorship buys.
        </SectionHeading>
        <div className="stagger mt-8 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: "icon-cursor",
              h: "Access to talent",
              p: "~190 software students who build in their spare time. Your roles land in front of people who can already ship.",
            },
            {
              icon: "icon-star",
              h: "Brand at real events",
              p: "Your logo where students show up: hackathons, workshops, ship nights. Not a banner nobody reads.",
            },
            {
              icon: "icon-controller",
              h: "A pipeline to grads",
              p: "Workshops, project briefs and a CV book that turn into interns and graduate hires.",
            },
          ].map((b) => (
            <div key={b.h} className="pixel-card pixel-hover group p-6">
              <PixelDuck
                name={b.icon as never}
                alt=""
                size={56}
                className="transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-110"
              />
              <h3 className="mt-3 font-display text-2xl font-bold">{b.h}</h3>
              <p className="mt-2 text-paper/75">{b.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 2 - PROOF BLOCK, placed immediately before the tiers + ask */}
      <section className="border-y-[3px] border-paper bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading eyebrow="The proof" title="We've already done the hard part.">
            Reach, flagship events and shipped projects. The evidence sits right
            next to the ask.
          </SectionHeading>

          {/* reach numbers */}
          <div className="stagger mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`pixel-card p-5 ${
                  ["bg-yellow text-ink", "bg-mint text-ink", "bg-pink text-paper", "bg-panel-2"][i % 4]
                }`}
              >
                <div className="font-display text-4xl font-bold sm:text-5xl">
                  {s.value}
                </div>
                <div className="mt-1 font-mono text-xs font-bold uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* flagship events as social proof — same card style as the rest of the site */}
          <div className="stagger mt-6 grid gap-5 sm:grid-cols-2">
            {flagship.map((e) => (
              <EventCard key={e.slug} event={e} />
            ))}
          </div>

          {/* shipped projects strip */}
          <div className="mt-6">
            <p className="eyebrow">Members ship real software</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {projects.map((p) => (
                <span key={p.slug} className="pixel-tag !bg-panel">
                  {p.title} · {p.stack[0]}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Our sponsors — real logo wall, only when sponsors are published */}
      {sponsors.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading eyebrow="Our sponsors" title="Brands that back us.">
            The companies already supporting DSEC and the students who build with us.
          </SectionHeading>
          <div className="mt-8">
            <SponsorLogos sponsors={sponsors} center />
          </div>
        </section>
      )}

      {/* 3 - PACKAGED TIERS, anchored */}
      <section id="packages" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Packages" title="See what each package offers.">
          Here&apos;s what each tier includes. Hit &quot;Sponsor&quot; on the one
          that fits, share a few details, and we&apos;ll reveal pricing instantly.
          Then book a call to talk it through.
        </SectionHeading>
        <SponsorTiers tiers={tiers} />
      </section>

      {/* 4 - SINGLE PRIMARY CTA: the enquiry form, proof restated beside it */}
      <section id="enquire" className="border-t-[3px] border-paper bg-void scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col text-paper">
            <p className="eyebrow !text-yellow">One step</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Tell us what you&apos;re after.
            </h2>
            <p className="mt-3 max-w-md text-paper/80">
              Email plus two quick questions, that&apos;s it. We&apos;ll come back
              with a tailored package and a time to talk. No payment taken here.
            </p>
            <ul className="stagger mt-6 space-y-2 font-mono text-sm text-paper/75">
              <li>✓ ~190 members at Deakin Burwood</li>
              <li>✓ 150-attendee hackathon already delivered</li>
              <li>✓ Affiliated with DUSA · invoiced properly, +GST</li>
            </ul>
            <div className="mt-6 hidden md:flex md:flex-1 md:items-center md:justify-center">
              <PixelDuck name="duck-mascot" alt="" size={280} bob />
            </div>
          </div>
          <SponsorForm />
        </div>
      </section>
    </div>
  );
}
