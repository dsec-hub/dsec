import Link from "next/link";
import { PixelDuck } from "@/components/pixel-duck";
import { stats } from "@/lib/content";

/**
 * Five hero treatments for the Home switchboard. Every one forks the two
 * audiences (students → Join, companies → Sponsor) and never lets their CTAs
 * compete for the same emphasis. Swap the active one in src/app/page.tsx.
 */

/* Decorative twinkling pixel marks scattered behind a hero. */
function Sparkles() {
  const marks = [
    { c: "text-pink", s: "✦", t: "top-10 left-[8%] text-2xl", d: "0s" },
    { c: "text-yellow", s: "+", t: "top-24 right-[12%] text-3xl", d: "0.6s" },
    { c: "text-mint", s: "◆", t: "top-1/2 left-[4%] text-xl", d: "1.1s" },
    { c: "text-sky", s: "+", t: "bottom-24 right-[7%] text-2xl", d: "0.3s" },
    { c: "text-pink", s: "◇", t: "bottom-10 left-[14%] text-2xl", d: "1.4s" },
    { c: "text-yellow", s: "✦", t: "top-1/3 right-[5%] text-xl", d: "0.9s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {marks.map((m, i) => (
        <span
          key={i}
          className={`twinkle absolute font-display ${m.c} ${m.t}`}
          style={{ animationDelay: m.d }}
        >
          {m.s}
        </span>
      ))}
    </div>
  );
}

/* =====================================================================
   HERO 0 - "Console" (the home hero)
   Centered, Tamagotchi-energy: a giant extruded pixel headline, the
   isometric 3D build-island as the centerpiece, and a press-start fork.
   ===================================================================== */
export function HeroConsole() {
  return (
    <section className="relative overflow-hidden">
      <Sparkles />

      {/* Headline block - centered text */}
      <div className="relative mx-auto max-w-5xl px-4 pt-12 text-center sm:px-6 sm:pt-16">
        <p className="eyebrow inline-flex items-center justify-center gap-3">
          <span className="twinkle">✦</span>
          Deakin Software Engineering Club
          <span className="twinkle">✦</span>
        </p>
        <h1 className="animate-rise mt-6 font-display text-[2.6rem] font-bold leading-[0.95] text-yellow text-3d-pink sm:text-[4.5rem] lg:text-[5.6rem]">
          WE BUILD
          <br />
          REAL SOFTWARE
        </h1>
        <p className="mx-auto mt-7 max-w-xl text-lg text-paper/75 sm:text-xl">
          A project-led student club at Deakin Burwood. You leave with software in
          your portfolio, not a folder of workshop slides.
        </p>

        {/* the fork - sits right under the copy, never merged, never competing */}
        <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
          <Link href="/join" className="btn btn-pink btn-start">
            ▶ Join now
          </Link>
          <Link href="/sponsor" className="btn btn-ghost group">
            Sponsor us{" "}
            <span className="transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
        <p className="mt-8 font-mono text-xs text-paper/50">
          $5 for DUSA members · $7.50 otherwise · companies talk to us
        </p>
      </div>

      {/* FULL-BLEED party banner - a ">-<" valley scene that frames the copy
          above: duck crowds cluster left + right, the open centre keeps the
          headline breathing. Full-res, seamless looping animation. Served
          opaque with the page background (#0a0a0a) baked in - transparent
          HEVC alpha is unreliable in Safari, so we composite ahead of time:
          VP9 WebM + H.264 MP4 (universal), GIF as the last-resort fallback. */}
      <div className="-mt-6 -mb-1 w-full sm:-mt-12 sm:-mb-1">
        <video
          width={1280}
          height={350}
          autoPlay
          loop
          muted
          playsInline
          poster="/pixel/hero-party-loop-poster.webp"
          aria-label="Wide pixel-art scene of a DSEC tech-nerd party: yellow ducks in groups chatting and sipping drinks, sharing pizza, and coding on glowing laptops, gently bobbing in a looped animation"
          className="pixelated pointer-events-none mx-auto block h-auto w-full select-none"
        >
          <source src="/pixel/hero-party-loop.webm" type="video/webm" />
          <source src="/pixel/hero-party-loop.mp4" type="video/mp4" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pixel/hero-party-loop.gif"
            alt="Pixel-art scene of DSEC ducks chatting, sharing pizza and coding on laptops"
            className="pixelated mx-auto block h-auto w-full select-none"
          />
        </video>
      </div>
    </section>
  );
}

/* =====================================================================
   HERO 1 - "Boot Sequence"
   A build artifact as the hero: a terminal window boots DSEC, the two
   CTAs read as commands. Most characteristic of "we build in public".
   ===================================================================== */
export function HeroBoot() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="pixel-card-lg overflow-hidden bg-void text-paper">
        {/* window chrome */}
        <div className="flex items-center gap-2 border-b-[3px] border-paper/20 bg-void px-4 py-3">
          <span className="h-3 w-3 border-2 border-paper bg-pink" />
          <span className="h-3 w-3 border-2 border-paper bg-yellow" />
          <span className="h-3 w-3 border-2 border-paper bg-mint" />
          <span className="ml-3 font-mono text-xs text-paper/60">
            dsec@burwood: ~/club
          </span>
        </div>
        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-[1.6fr_1fr] md:items-center">
          <div className="font-mono text-sm leading-relaxed sm:text-base">
            <p className="text-mint">$ ./dsec --init</p>
            <p className="mt-1 text-paper/60">
              booting Deakin Software Engineering Club…
            </p>
            <p className="mt-1 text-paper/60">
              members loaded ......... <span className="text-yellow">190+</span>
            </p>
            <p className="text-paper/60">
              projects shipped ....... <span className="text-yellow">real</span>
            </p>
            <p className="text-paper/60">
              workshops, passive ..... <span className="text-pink">none</span>
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] text-paper sm:text-6xl">
              We build real
              <br />
              <span className="text-yellow">software.</span>
              <span className="caret" />
            </h1>
            <p className="mt-4 max-w-md font-body text-base text-paper/75">
              Not workshops you sit through. Projects you ship. Pick your path:
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/join" className="btn btn-pink">
                $ join --as student
              </Link>
              <Link href="/sponsor" className="btn btn-ghost !bg-panel">
                $ sponsor --as company
              </Link>
            </div>
          </div>
          <div className="hidden justify-self-center md:block">
            <PixelDuck
              name="duck-laptop"
              alt="Pixel-art duck coding on a laptop"
              size={260}
              priority
              bob
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   HERO 2 - "Split Arcade"
   Literal switchboard: two-player select screen. Students on one side,
   companies on the other, the duck refereeing in the middle.
   ===================================================================== */
export function HeroSplit() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="mb-8 text-center">
        <p className="eyebrow">Deakin Software Engineering Club</p>
        <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
          Choose your <span className="text-blue">player</span>.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-lg text-paper/75">
          Two doors, one club that ships real software. Walk through yours.
        </p>
      </div>
      <div className="relative grid gap-5 md:grid-cols-2">
        {/* duck referee */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden -translate-x-1/2 -translate-y-1/2 md:block">
          <span className="grid h-16 w-16 place-items-center rounded-none border-[3px] border-paper bg-yellow font-display text-xl font-bold shadow-[4px_4px_0_0_var(--color-paper)]">
            VS
          </span>
        </div>
        <Link
          href="/join"
          className="pixel-card pixel-hover group flex flex-col justify-between bg-mint text-ink p-7 sm:p-9"
        >
          <div>
            <span className="pixel-tag !bg-panel">P1 · Student</span>
            <h2 className="mt-4 font-display text-3xl font-bold">
              Build a portfolio, not a CV full of buzzwords.
            </h2>
            <p className="mt-2 text-ink/80">
              Ship real projects, find your people, learn by doing. Near-zero
              friction. Just join the Discord.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-display text-lg font-bold">
            Join the community
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
        <Link
          href="/sponsor"
          className="pixel-card pixel-hover group flex flex-col justify-between bg-blue p-7 text-paper sm:p-9"
        >
          <div>
            <span className="pixel-tag !bg-panel !text-paper">P2 · Company</span>
            <h2 className="mt-4 font-display text-3xl font-bold">
              Reach Deakin&apos;s most active software talent.
            </h2>
            <p className="mt-2 text-paper/85">
              Brand presence at events students show up to, plus a real pipeline
              to grads. See the proof and the packages.
            </p>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-display text-lg font-bold">
            Sponsor DSEC
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>
    </section>
  );
}

/* =====================================================================
   HERO 3 - "Workshop Scene"
   The wide pixel desk illustration carries the hero; copy + fork sit
   beside it. Warmest, most editorial of the five.
   ===================================================================== */
export function HeroScene() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <p className="eyebrow">Deakin · Burwood · ~190 members</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
            A club that
            <br />
            <span className="bg-yellow px-1 box-decoration-clone text-ink">actually ships</span>
            .
          </h1>
          <p className="mt-4 max-w-md text-lg text-paper/75">
            DSEC is project-led. Members leave with software in their portfolio
            and the people who helped them build it.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/join" className="btn btn-pink">
              Join the community
            </Link>
            <Link href="/sponsor" className="btn btn-ghost">
              Sponsor us →
            </Link>
          </div>
          <p className="mt-4 font-mono text-xs text-paper/55">
            students join in seconds · companies talk to us
          </p>
        </div>
        <div className="pixel-card-lg overflow-hidden border-[3px] border-paper bg-panel-2">
          <PixelDuck
            name="hero-desk"
            alt="Pixel-art scene of a duck building software at a desk"
            size={640}
            priority
            className="!max-w-full"
          />
        </div>
      </div>
    </section>
  );
}

/* =====================================================================
   HERO 4 - "Marquee"
   Giant pixel wordmark + a scrolling ticker of what members build. Loud,
   confident, single biggest type on the site.
   ===================================================================== */
export function HeroMarquee() {
  const ticker = [
    "git push origin main",
    "150-person hackathon",
    "shipped 4 projects",
    "first grad offer",
    "pizza + deploys",
    "190+ members",
  ];
  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex items-center justify-center gap-4">
          <PixelDuck name="duck-wave" alt="" size={88} bob />
          <p className="eyebrow text-center">
            Deakin Software Engineering Club
          </p>
          <PixelDuck name="duck-mascot" alt="" size={88} bob />
        </div>
        <h1 className="mt-4 text-center font-display text-[15vw] font-bold leading-[0.9] sm:text-[10rem]">
          WE BUILD
          <br />
          <span className="text-pink">REAL STUFF</span>
        </h1>
      </div>
      {/* full-bleed ticker */}
      <div className="mt-8 overflow-hidden border-y-[3px] border-paper bg-void py-3">
        <div className="flex animate-[marquee_22s_linear_infinite] gap-8 whitespace-nowrap font-mono text-sm font-bold uppercase text-paper">
          {[...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-8">
              <span className="text-yellow">◆</span>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-3 px-4 sm:flex-row sm:justify-center sm:px-6">
        <Link href="/join" className="btn btn-pink">
          Join the community
        </Link>
        <Link href="/sponsor" className="btn btn-ghost">
          Companies: sponsor us →
        </Link>
      </div>
    </section>
  );
}

/* =====================================================================
   HERO 5 - "Bento Board"
   A pixel pegboard: headline, mascot, live stats and the two forks as
   tiles. Densest - shows proof and routes in one screen.
   ===================================================================== */
export function HeroBento() {
  const s = stats.slice(0, 2);
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid auto-rows-[minmax(0,1fr)] gap-4 md:grid-cols-4 md:grid-rows-2">
        {/* headline */}
        <div className="pixel-card flex flex-col justify-between p-7 md:col-span-2 md:row-span-2">
          <p className="eyebrow">Deakin · Burwood</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
            Project-led. <span className="text-blue">Portfolio-first.</span> Run by
            students who ship.
          </h1>
          <p className="mt-4 text-paper/75">
            Pick your path. We keep the two completely separate so neither gets in
            the other&apos;s way.
          </p>
        </div>
        {/* mascot */}
        <div className="pixel-card grid place-items-center bg-yellow p-4">
          <PixelDuck name="duck-mascot" alt="DSEC duck mascot" size={130} priority bob />
        </div>
        {/* stats */}
        {s.map((stat) => (
          <div key={stat.label} className="pixel-card bg-panel-2 p-5">
            <div className="font-display text-4xl font-bold">{stat.value}</div>
            <div className="font-mono text-xs font-bold uppercase">{stat.label}</div>
          </div>
        ))}
        {/* fork: student */}
        <Link
          href="/join"
          className="pixel-card pixel-hover group flex items-center justify-between bg-mint text-ink p-6 md:col-span-2"
        >
          <span>
            <span className="block font-display text-2xl font-bold">
              Join the community
            </span>
            <span className="font-mono text-xs">students · $5 DUSA / $7.50 external · 30 seconds</span>
          </span>
          <span className="font-display text-2xl transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
        {/* fork: sponsor */}
        <Link
          href="/sponsor"
          className="pixel-card pixel-hover group flex items-center justify-between bg-blue p-6 text-paper md:col-span-2"
        >
          <span>
            <span className="block font-display text-2xl font-bold">Sponsor DSEC</span>
            <span className="font-mono text-xs text-paper/80">
              companies · proof + packages
            </span>
          </span>
          <span className="font-display text-2xl transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

export const heroes = [
  { id: "console", name: "Console (live)", Component: HeroConsole },
  { id: "boot", name: "Boot Sequence", Component: HeroBoot },
  { id: "split", name: "Split Arcade", Component: HeroSplit },
  { id: "scene", name: "Workshop Scene", Component: HeroScene },
  { id: "marquee", name: "Marquee", Component: HeroMarquee },
  { id: "bento", name: "Bento Board", Component: HeroBento },
];
