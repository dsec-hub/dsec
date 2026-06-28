import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/ui";
import { SponsorLogos } from "@/components/media";
import { PixelDuck } from "@/components/pixel-duck";
import { JsonLd } from "@/components/json-ld";
import { getPartners, getTeam } from "@/lib/api";
import { organizationSchema } from "@/lib/schema";
import { accentBg, isExec, site, type Member } from "@/lib/content";

/** One roster tile — a clickable card that links through to the member's
 *  profile page. Social links live on that page, so the whole card is one link
 *  (no nested anchors). */
function MemberCard({ m }: { m: Member }) {
  return (
    <Link
      href={`/team/${m.slug}`}
      className="pixel-card pixel-hover group flex flex-col overflow-hidden"
    >
      <div
        className={`relative aspect-square overflow-hidden border-b-[3px] border-paper ${accentBg[m.accent]}`}
      >
        {m.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={m.image}
            alt={m.name}
            className="h-full w-full object-cover transition-transform duration-300 ease-[var(--ease-out-strong)] group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center">
            <PixelDuck name="duck-mascot" alt="" size={88} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="font-display text-lg font-bold leading-tight">{m.name}</div>
        <div className="font-mono text-xs text-paper/60">{m.role}</div>
        {m.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-snug text-paper/70">{m.description}</p>
        )}
        <span className="mt-3 font-mono text-xs font-bold text-pink opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          View profile →
        </span>
      </div>
    </Link>
  );
}

/** A titled grid of member cards — one per About-page section (exec / committee). */
function TeamGrid({ members }: { members: Member[] }) {
  return (
    <div className="stagger mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {members.map((m) => (
        <MemberCard key={m.slug ?? m.name} m={m} />
      ))}
    </div>
  );
}

/** Preferred display order for the team blocks (derived from role). Categories
 *  not listed here follow alphabetically; members with no role fall into a final
 *  catch-all. */
const CATEGORY_ORDER = [
  "Web Development",
  "App Development",
  "Game Development",
  "AI",
  "Robotics",
  "Cyber Security",
  "Development",
  "Developer",
  "Design",
  "Marketing",
  "External Affairs",
  "Operations",
  "Events",
];

/** Bucket for members whose role doesn't resolve to a category. */
const NO_CATEGORY = "Committee";

/** Accent bar colours cycled across the team section headings. */
const GROUP_ACCENTS = ["yellow", "pink", "mint", "blue"] as const;

/** Reduce a free-text role title to its discipline so members group into tidy
 *  sections: drop a leading "Head of", a trailing rank word ("Lead", "Officer",
 *  …), and normalise separators — so "Web-Development Lead" and "Web Development
 *  Lead" both become "Web Development". Falls back to the committee, then to a
 *  generic bucket. */
function roleCategory(m: Member): string {
  const base = (m.role ?? "").replace(/[-_/]+/g, " ").replace(/\s+/g, " ").trim();
  const stripped = base
    .replace(/^head of\s+/i, "")
    .replace(/\s+(lead|leads|head|officer|executive|exec|manager|coordinator|director)$/i, "")
    .trim();
  return stripped || base || m.committee?.trim() || NO_CATEGORY;
}

/** Group the (non-exec) roster by role-derived category, ordered by
 *  CATEGORY_ORDER with unknown categories alphabetical and the catch-all last,
 *  so each discipline renders as its own labelled block on the About page. */
function groupByRole(members: Member[]): { name: string; members: Member[] }[] {
  const groups = new Map<string, Member[]>();
  for (const m of members) {
    const key = roleCategory(m);
    const arr = groups.get(key);
    if (arr) arr.push(m);
    else groups.set(key, [m]);
  }
  const rank = (name: string) => {
    if (name === NO_CATEGORY) return CATEGORY_ORDER.length + 1;
    const i = CATEGORY_ORDER.indexOf(name);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...groups.entries()]
    .map(([name, members]) => ({ name, members }))
    .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

export const metadata: Metadata = {
  title: "About DSEC - The Committee & What We Stand For",
  description:
    "The committee behind DSEC, our DUSA affiliation, and what the club stands for.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About DSEC - The Committee & What We Stand For",
    description:
      "DSEC is the Deakin Software Engineering Club, a project-led, DUSA-affiliated club run by students who ship.",
    url: "/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About DSEC - The Committee & What We Stand For",
    description: "A project-led, DUSA-affiliated club at Deakin Burwood, run by students who ship.",
  },
};

const values = [
  {
    h: "Build, don't just attend",
    p: "Every term ends with software that exists. Passive workshops aren't the point.",
  },
  {
    h: "In public",
    p: "Repos, commits and demos. We share what we make and how we made it.",
  },
  {
    h: "Everyone ships",
    p: "First-years to final-years. If you turn up and try, you leave with something real.",
  },
];

export default async function AboutPage() {
  const [team, partners] = await Promise.all([getTeam(), getPartners()]);
  // Three tiers keyed off each member's `type`:
  //   • executives        (type "Exec")    — president, VP, secretary, design lead
  //   • committee leads    (type "… Lead")  — AI / web / game / marketing leads …
  //   • committee members  (everyone else)  — grouped into discipline sub-sections
  // so nobody published is ever dropped.
  const isLead = (m: Member) => !isExec(m) && /lead/i.test(m.type ?? "");
  const execs = team.filter(isExec);
  const leads = team.filter(isLead);
  const memberGroups = groupByRole(team.filter((m) => !isExec(m) && !isLead(m)));
  return (
    <div>
      <JsonLd data={organizationSchema()} />
      <section className="border-b-[3px] border-paper bg-panel-2">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">Who we are</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Run by students who ship.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-paper/80">
              DSEC is the Deakin Software Engineering Club, a project-led student
              club at Burwood affiliated with DUSA. We exist so members leave
              Deakin with real software and real people behind them.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PixelDuck name="duck-coffee" alt="" size={220} priority bob />
          </div>
        </div>
      </section>

      {/* What we stand for */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="What we stand for" title="Three things, no fluff." />
        <div className="stagger mt-8 grid gap-5 md:grid-cols-3">
          {values.map((v, i) => (
            <div key={v.h} className="pixel-card pixel-hover group p-6">
              <div
                className={`mb-3 h-2 w-12 transition-[width] duration-300 ease-[var(--ease-out-strong)] group-hover:w-20 ${["bg-yellow", "bg-pink", "bg-mint"][i]}`}
              />
              <h3 className="font-display text-2xl font-bold">{v.h}</h3>
              <p className="mt-2 text-paper/75">{v.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Executive committee */}
      {execs.length > 0 && (
        <section className="border-t-[3px] border-paper bg-panel-2">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <SectionHeading eyebrow="Who runs DSEC" title="Meet the exec.">
              DSEC is led by a volunteer executive committee of Deakin students who
              handle everything from event planning and sponsorship to Discord
              moderation and code-review nights. Execs are elected at our AGM each
              year, following DUSA club rules. Tap anyone to see their profile.
            </SectionHeading>
            <TeamGrid members={execs} />
          </div>
        </section>
      )}

      {/* Committee leads — flat grid, no committee/discipline split */}
      {leads.length > 0 && (
        <section className="border-t-[3px] border-paper">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <SectionHeading eyebrow="The leads" title="Committee leads.">
              The leads who run each of our project teams. They set direction, run
              workshops, and own what their team ships every term. Tap anyone to
              see their profile.
            </SectionHeading>
            <TeamGrid members={leads} />
          </div>
        </section>
      )}

      {/* Committee members — one labelled block per discipline/team */}
      {memberGroups.length > 0 && (
        <section className="border-t-[3px] border-paper bg-panel-2">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <SectionHeading eyebrow="The wider team" title="Committee members.">
              The members building alongside each lead, grouped by the team
              they&apos;re on.
            </SectionHeading>
            <div className="mt-12 space-y-14">
              {memberGroups.map((g, i) => (
                <div key={g.name}>
                  <div
                    className={`mb-3 h-2 w-12 ${accentBg[GROUP_ACCENTS[i % GROUP_ACCENTS.length]]}`}
                  />
                  <h3 className="font-display text-2xl font-bold sm:text-3xl">{g.name}</h3>
                  <TeamGrid members={g.members} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Join the committee CTA */}
      <section className="border-t-[3px] border-paper bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center sm:px-6">
          <p className="mx-auto max-w-2xl text-paper/75">
            If you are a Deakin student who cares about building communities,
            joining the committee is one of the best ways to grow your leadership
            and project skills while you study.
          </p>
          <a
            href="https://dsec.notion.site/dsec-committee-hiring-2026?source=copy_link"
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-pink mt-5"
          >
            See open volunteer roles
          </a>
        </div>
      </section>

      {/* Clubs & partners — real logo wall, only when partners are published */}
      {partners.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <SectionHeading
            eyebrow="Who we work with"
            title="Clubs & partners we work with."
          >
            The student clubs and organisations we collaborate with on events and
            projects.
          </SectionHeading>
          <div className="mt-8">
            <SponsorLogos sponsors={partners} marquee />
          </div>
        </section>
      )}

      {/* Affiliation + contact */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="pixel-card p-7">
            <h3 className="font-display text-2xl font-bold">DUSA affiliated</h3>
            <p className="mt-2 text-paper/75">
              DSEC is an affiliated club of the Deakin University Student Association.
              Sponsorship is invoiced through DUSA with GST, so everything is above
              board and properly handled.
            </p>
          </div>
          <div className="pixel-card flex flex-col justify-between p-7">
            <div>
              <h3 className="font-display text-2xl font-bold">Get in touch</h3>
              <p className="mt-2 text-paper/75">
                Questions, ideas, or want to work with us?
              </p>
              <a
                href={`mailto:${site.email}`}
                className="mt-2 inline-block font-mono font-bold text-blue hover:underline"
              >
                {site.email}
              </a>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/join" className="btn btn-pink !py-2.5 !text-sm">
                Students: join
              </Link>
              <Link href="/sponsor" className="btn btn-ghost !py-2.5 !text-sm">
                Companies: sponsor
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
