import type { Metadata } from "next";
import { PixelDuck } from "@/components/pixel-duck";
import { getSocials } from "@/lib/api";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Join DSEC - Build Real Software at Deakin",
  description:
    "Build real, portfolio-worthy software and find your people. Join the DSEC Discord.",
  alternates: { canonical: "/join" },
  openGraph: {
    title: "Join DSEC - Build Real Software at Deakin",
    description:
      "Ship portfolio-worthy software with 190+ Deakin students. One click, no application.",
    url: "/join",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Join DSEC - Build Real Software at Deakin",
    description: "Ship real software with 190+ Deakin students. The Discord's one click away.",
  },
};

const perks = [
  {
    icon: "icon-floppy",
    h: "Ship a real portfolio",
    p: "Actual projects with your name on them. The thing recruiters open before your resume.",
  },
  {
    icon: "icon-heart",
    h: "Find your people",
    p: "190+ students who like building things. Pairs, teams, and someone to debug with at 1am.",
  },
  {
    icon: "icon-controller",
    h: "Learn by doing",
    p: "Hackathons, ship nights and workshops. Less sitting still, more making things that run.",
  },
];

export default async function JoinPage() {
  // The Discord CTAs use the API-served invite (live once the committee sets it
  // in the hub), falling back to the configured site value otherwise.
  const socials = await getSocials();
  const discord = socials.discord ?? site.discord;
  return (
    <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="grid items-stretch gap-8 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">For students · $5 DUSA / $7.50 external</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] sm:text-6xl">
            Build real things.
            <br />
            <span className="text-blue">Belong somewhere.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-paper/80">
            DSEC is where Deakin students build portfolio-worthy software together,
            not sit through workshops.{" "}
            <a
              href={site.dusaMembership}
              target="_blank"
              rel="noreferrer noopener"
              className="font-semibold text-blue underline-offset-4 hover:underline"
            >
              Grab a membership
            </a>{" "}
            and you&apos;re in.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={site.dusaMembership}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-pink !px-7 !py-4 !text-lg"
            >
              Get your membership
            </a>
            <a
              href={discord}
              target="_blank"
              rel="noreferrer noopener"
              className="btn btn-void !px-7 !py-4 !text-lg"
            >
              Join the Discord
            </a>
          </div>
          <p className="mt-3 font-mono text-xs text-paper/55">
            <a
              href={site.dusaMembership}
              target="_blank"
              rel="noreferrer noopener"
              className="underline-offset-4 hover:text-blue hover:underline"
            >
              $5 DUSA members · $7.50 external · no application
            </a>
          </p>
        </div>

        <div className="flex items-center justify-center">
          <PixelDuck
            name="duck-wave"
            alt="Pixel-art duck waving hello"
            size={260}
            priority
            bob
          />
        </div>
      </div>

      {/* How joining works - three steps, zero ceremony */}
      <div className="mt-16">
        <p className="eyebrow">How it works</p>
        <div className="stagger mt-4 grid gap-5 md:grid-cols-3">
          {[
            {
              n: "01",
              h: "Grab a membership",
              p: "$5 for DUSA members, $7.50 otherwise. Paid once via DUSA, done in a minute.",
            },
            {
              n: "02",
              h: "Join the Discord",
              p: "That's where the club lives. Say hi, find a team, see what's being built.",
            },
            {
              n: "03",
              h: "Turn up and ship",
              p: "Pick a project or bring your own. Hackathons, ship nights and workshops all term.",
            },
          ].map((step) => (
            <div key={step.n} className="pixel-card p-6">
              <div className="font-mono text-sm font-bold text-sky">{step.n}</div>
              <h2 className="mt-2 font-display text-2xl font-bold">{step.h}</h2>
              <p className="mt-2 text-paper/75">{step.p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What you actually get - plain language, no "networking" */}
      <div className="stagger mt-12 grid gap-5 md:grid-cols-3">
        {perks.map((perk) => (
          <div key={perk.h} className="pixel-card pixel-hover group p-6">
            <PixelDuck
              name={perk.icon as never}
              alt=""
              size={52}
              className="transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-110"
            />
            <h2 className="mt-3 font-display text-2xl font-bold">{perk.h}</h2>
            <p className="mt-2 text-paper/75">{perk.p}</p>
          </div>
        ))}
      </div>

      {/* One more nudge to the single CTA */}
      <div className="mt-12 border-[3px] border-paper bg-void p-8 text-center text-paper shadow-[8px_8px_0_0_var(--color-blue)]">
        <p className="font-display text-2xl font-bold sm:text-3xl">
          That&apos;s it. The duck&apos;s waiting.
        </p>
        <div className="mt-5">
          <a
            href={discord}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-pink !px-7 !py-4 !text-lg"
          >
            Join the Discord
          </a>
        </div>
      </div>
    </section>
  );
}
