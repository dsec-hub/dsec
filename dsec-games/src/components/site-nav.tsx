import Link from "next/link";

import { PixelDuck } from "@/components/pixel-duck";
import { PortalSignInLink } from "@/components/portal-sign-in-link";

const LINKS = [
  { href: "/flappy-duck", label: "Flappy Duck" },
  { href: "/codle", label: "Codle" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function SiteNav({ email }: { email: string | null }) {
  return (
    <header className="border-b border-paper/15 bg-void/60 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-yellow">
          <PixelDuck name="duck-mascot" alt="" size={36} />
          <span className="text-sm">DSEC GAMES</span>
        </Link>
        <div className="flex items-center gap-4 font-mono text-xs sm:text-sm">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-paper/80 transition-colors hover:text-pink">
              {l.label}
            </Link>
          ))}
          {email ? (
            <span className="hidden text-paper/50 sm:inline" title={email}>
              {email.split("@")[0]}
            </span>
          ) : (
            <PortalSignInLink className="btn-pink px-3 py-1 text-xs">Sign in</PortalSignInLink>
          )}
        </div>
      </nav>
    </header>
  );
}
