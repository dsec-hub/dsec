import Link from "next/link";

import { PixelDuck } from "@/components/pixel-duck";

const GAMES = [
  {
    href: "/flappy-duck",
    duck: "duck-rocket" as const,
    title: "Flappy Duck",
    blurb: "Tap to flap, dodge the pipes, bank points. The arcade classic, DSEC duck edition.",
    cta: "Play now",
    btn: "btn-pink",
  },
  {
    href: "/codle",
    duck: "duck-laptop" as const,
    title: "Codle",
    blurb: "Wordle for code. One hidden keyword a day, six guesses. Same puzzle in Discord and here.",
    cta: "Guess today's word",
    btn: "btn-mint",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <section className="flex flex-col items-center text-center">
        <PixelDuck name="duck-trophy" alt="DSEC arcade duck" size={140} bob priority />
        <p className="eyebrow mt-6">DSEC Arcade</p>
        <h1 className="text-3d-pink mt-2 font-display text-3xl sm:text-5xl">PLAY. CLIMB. WIN.</h1>
        <p className="text-balance mt-4 max-w-xl text-paper/70">
          Two games, one leaderboard, a gift card up for grabs every month. Members play unlimited and
          every point counts toward the draw.
        </p>
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {GAMES.map((g) => (
          <Link key={g.href} href={g.href} className="pixel-card pixel-hover flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between">
              <PixelDuck name={g.duck} alt="" size={72} />
              <span className="pixel-tag">{g.cta}</span>
            </div>
            <h2 className="font-display text-xl text-yellow">{g.title}</h2>
            <p className="text-sm text-paper/70">{g.blurb}</p>
            <span className={`${g.btn} mt-auto w-fit px-4 py-2 text-sm`}>{g.cta}</span>
          </Link>
        ))}
      </section>

      <section className="mt-10 flex flex-col items-center gap-3 text-center">
        <Link href="/leaderboard" className="btn-yellow px-5 py-2 text-sm">
          See the leaderboard
        </Link>
        <p className="font-mono text-xs text-paper/50">
          The monthly draw is members only, highest total points wins. Not a random lottery.
        </p>
      </section>
    </div>
  );
}
