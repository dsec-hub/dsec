import Link from "next/link";
import { HeroConsole } from "@/components/heroes";
import { Stat, ProjectCard, EventCard, SectionHeading, ComingSoon } from "@/components/ui";
import { PixelDuck } from "@/components/pixel-duck";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema } from "@/lib/schema";
import { getEvents, getProjects } from "@/lib/api";
import { stats, site } from "@/lib/content";

export default async function HomePage() {
  const [allProjects, allEvents] = await Promise.all([getProjects(), getEvents()]);
  const featuredProjects = allProjects.slice(0, 3);
  const events = allEvents;
  const pastEvent = events.find((e) => e.status === "past");
  const upcoming = events.find((e) => e.status === "upcoming");
  const showProjects = featuredProjects.length > 0;
  const showEvents = Boolean(pastEvent || upcoming);

  return (
    <div>
      <JsonLd data={organizationSchema()} />
      {/* THE SWITCHBOARD - centered console hero, forks both audiences up top.
          Swap HeroConsole for any export in components/heroes.tsx (see /heroes). */}
      <HeroConsole />

      {/* Mission one-liner — pink spikes grow UP out of the banner's top edge,
          breaking the rectangle so the spikes read as outside the container. */}
      <section className="relative border-b-[3px] border-paper bg-pink">
        {/* spikes project above the banner into the scene above */}
        <div className="banner-spikes" />
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <p className="text-center font-display text-xl font-bold text-paper sm:text-2xl">
            A project-led tech club at Deakin Burwood. You leave with software in
            your portfolio and the people who helped you build it.
          </p>
        </div>
      </section>

      {/* Credibility stats */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading
          eyebrow="By the numbers"
          title="Proof, not promises."
          className="mx-auto text-center"
        >
          The kind of club that shows up on a resume.
        </SectionHeading>
        <div className="stagger mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Stat
              key={s.label}
              {...s}
              accent={(["yellow", "blue", "pink", "mint"] as const)[i % 4]}
            />
          ))}
        </div>
      </section>

      {/* Project highlights - teaser into Projects */}
      <div className="skyline skyline-flip" />
      <section className="border-y-[3px] border-paper bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading eyebrow="Built by members" title="Things we shipped.">
              Real software, real repos. This is what makes us worth joining and
              worth sponsoring.
            </SectionHeading>
            <Link href="/projects" className="btn btn-ghost group !py-2.5 !text-sm">
              All projects{" "}
              <span className="transition-transform duration-150 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
          {showProjects ? (
            <div className="stagger mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((p) => (
                <ProjectCard key={p.slug} project={p} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <ComingSoon
                label="updating soon"
                title="Member projects are being added soon."
                duck="duck-laptop"
              >
                We&apos;re wiring up the projects feed. Real repos and stacks will
                show up here shortly.
              </ComingSoon>
            </div>
          )}
        </div>
      </section>

      {/* Event highlights - teaser into Events */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="We run real events"
            title="From hackathons to ship nights."
          >
            Proof we deliver, plus the next thing you can turn up to.
          </SectionHeading>
          <Link href="/events" className="btn btn-ghost group !py-2.5 !text-sm">
            All events{" "}
            <span className="transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
        {showEvents ? (
          <div className="stagger mt-8 grid gap-5 sm:grid-cols-2">
            {upcoming && <EventCard event={upcoming} />}
            {pastEvent && <EventCard event={pastEvent} />}
          </div>
        ) : (
          <div className="mt-8">
            <ComingSoon
              label="updating soon"
              title="Events are landing here shortly."
              duck="duck-rocket"
            >
              We&apos;re wiring up the events feed. Hop on Discord to hear about
              the next one first.
            </ComingSoon>
          </div>
        )}
      </section>

      {/* Final fork - restate the two paths, kept side-by-side, never merged */}
      <div className="skyline" />
      <section className="border-t-[3px] border-paper bg-void">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-10 flex flex-col items-center gap-4 text-center">
            <PixelDuck
              name="hero-iso-arcade"
              alt="Isometric pixel-art arcade tower with a duck holding a flag on top"
              size={220}
              bob
            />
            <h2 className="font-display text-[2rem] font-bold leading-[1.05] text-paper sm:text-5xl">
              Two ways in. <span className="text-yellow">Pick yours.</span>
            </h2>
          </div>
          <div className="stagger grid gap-5 md:grid-cols-2">
            <div className="pixel-card-lg flex flex-col justify-between bg-mint text-ink p-8">
              <div>
                <span className="pixel-tag !bg-panel !text-paper">For students</span>
                <h3 className="mt-3 font-display text-3xl font-bold">
                  Build real things. Belong somewhere.
                </h3>
                <p className="mt-2 text-ink/80">
                  <a
                    href={site.dusaMembership}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold underline underline-offset-4"
                  >
                    Membership
                  </a>{" "}
                  is $5 for DUSA members and $7.50 for non-DUSA and external
                  students. Pay once, turn up, and start shipping.
                </p>
              </div>
              <Link href="/join" className="btn btn-void mt-6 self-start">
                Join now
              </Link>
            </div>
            <div className="pixel-card-lg flex flex-col justify-between bg-blue p-8 text-paper">
              <div>
                <span className="pixel-tag !bg-panel !text-paper">For companies</span>
                <h3 className="mt-3 font-display text-3xl font-bold">
                  Reach the talent before everyone else does.
                </h3>
                <p className="mt-2 text-paper/85">
                  Events, projects and reach as proof. Packages from $500, invoiced
                  via DUSA.
                </p>
              </div>
              <Link href="/sponsor" className="btn btn-pink mt-6 self-start">
                Sponsor DSEC
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
