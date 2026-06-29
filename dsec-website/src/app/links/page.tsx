import type { Metadata } from "next";
import Link from "next/link";
import { PixelDuck } from "@/components/pixel-duck";
import { getLinkTree } from "@/lib/api";
import {
  linkAccentAt,
  linktree as fallbackLinkTree,
  socialHref,
  SOCIAL_META,
  SOCIAL_ORDER,
  type LinkAccent,
  type LinkItem,
  type SocialKey,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "DSEC · Links",
  description:
    "Every DSEC link in one place — Discord, membership, events, projects and more. The single tap from our Instagram and Discord bios.",
  alternates: { canonical: "/links" },
  openGraph: {
    title: "DSEC · Links",
    description:
      "Every DSEC link in one place — Discord, membership, events and more.",
    url: "/links",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSEC · Links",
    description:
      "Every DSEC link in one place — Discord, membership, events and more.",
  },
};

/**
 * Per-accent classes for a link row: a coloured left bar + a matching emoji
 * tile. Text colour on the tile flips between ink/white for contrast. The 8
 * accents map to the brand tokens defined in globals.css (@theme).
 */
const ACCENT: Record<LinkAccent, { bar: string; tile: string }> = {
  blue: { bar: "bg-blue", tile: "bg-blue text-white" },
  pink: { bar: "bg-pink", tile: "bg-pink text-white" },
  yellow: { bar: "bg-yellow", tile: "bg-yellow text-ink" },
  mint: { bar: "bg-mint", tile: "bg-mint text-ink" },
  sky: { bar: "bg-sky", tile: "bg-sky text-ink" },
  violet: { bar: "bg-violet", tile: "bg-violet text-white" },
  lime: { bar: "bg-lime", tile: "bg-lime text-ink" },
  coral: { bar: "bg-coral", tile: "bg-coral text-ink" },
};

/** The canonical site origin used to classify links as internal vs external. */
const SITE_ORIGIN = "https://dsec.club";

/**
 * Render-time allowlist for the value we put in an href. Trims it; keeps in-app
 * paths (`/events`); otherwise only allows absolute http/https/mailto/tel URLs.
 * Anything else (`javascript:`, `data:`, `vbscript:`, …) collapses to "#", so a
 * hostile URL already sitting in the DB can never execute on click.
 */
function safeHref(value: string): string {
  const v = value.trim();
  if (v.startsWith("/")) return v;
  try {
    const { protocol } = new URL(v);
    if (["http:", "https:", "mailto:", "tel:"].includes(protocol)) return v;
  } catch {
    // not a parseable absolute URL → fall through to "#"
  }
  return "#";
}

/** A link is external when it resolves to a different origin than the site (it
 *  opens in a new tab with the ↗ cue). Relative/same-origin paths like `/events`
 *  stay in-app (and get the pixel transition); protocol-relative `//host`,
 *  `mailto:` and `tel:` all count as external. */
function isExternal(url: string): boolean {
  try {
    return new URL(url, SITE_ORIGIN).origin !== SITE_ORIGIN;
  } catch {
    return false;
  }
}

function LinkRow({ link, index }: { link: LinkItem; index: number }) {
  const accent = ACCENT[linkAccentAt(link.accent, index)];
  const href = safeHref(link.url);
  const external = isExternal(href);

  const inner = (
    <>
      <span
        className={`absolute inset-y-0 left-0 w-1.5 ${accent.bar}`}
        aria-hidden="true"
      />
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center border-[3px] border-paper text-xl leading-none ${accent.tile}`}
        aria-hidden="true"
      >
        {link.icon || "🔗"}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-sm font-bold leading-tight sm:text-base">
          {link.title}
        </span>
        {link.subtitle && (
          <span className="mt-1 truncate font-mono text-xs text-paper/60">
            {link.subtitle}
          </span>
        )}
      </span>
      <span
        className="shrink-0 font-mono text-lg text-paper/70"
        aria-hidden="true"
      >
        {external ? "↗" : "→"}
      </span>
    </>
  );

  const className =
    "pixel-card pixel-hover relative flex min-h-[64px] items-center gap-3 overflow-hidden py-3 pl-5 pr-4";

  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${link.title} (opens in a new tab)`}
      className={className}
    >
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}

export default async function LinksPage() {
  // Live feed first. Keep the live profile when present, but fall back to the
  // curated links whenever the feed returns zero visible links — otherwise a
  // profile-only response would leave a barren, link-less page.
  const tree = await getLinkTree();
  const profile = tree?.profile ?? fallbackLinkTree.profile;
  const links = tree && tree.links.length ? tree.links : fallbackLinkTree.links;
  // Socials are pulled in by default — the committee sets them once on the link
  // profile, and they head up the page as a row of icons above the link stack.
  const socials = tree?.socials ?? fallbackLinkTree.socials;
  const socialEntries = SOCIAL_ORDER.filter((k) => socials[k]).map((k) => ({
    key: k as SocialKey,
    href: socialHref(k, socials[k] as string),
  }));

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10 sm:py-14">
      <header className="flex flex-col items-center text-center">
        <PixelDuck name={profile.mascot} alt={`${profile.title} mascot`} size={150} bob priority />
        <h1 className="font-display mt-4 text-3xl font-bold tracking-tight">
          {profile.title}
        </h1>
        {profile.tagline && (
          <p className="mt-2 font-mono text-sm text-paper/70">{profile.tagline}</p>
        )}
        {socialEntries.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            {socialEntries.map(({ key, href }) => {
              const meta = SOCIAL_META[key];
              const isMail = key === "email";
              return (
                <a
                  key={key}
                  href={href}
                  {...(isMail
                    ? {}
                    : { target: "_blank", rel: "noopener noreferrer" })}
                  aria-label={meta.label}
                  title={meta.label}
                  className={`pixel-hover grid h-12 w-12 place-items-center border-[3px] border-paper text-2xl leading-none ${ACCENT[meta.accent].tile}`}
                >
                  <span aria-hidden="true">{meta.icon}</span>
                </a>
              );
            })}
          </div>
        )}
      </header>

      <nav className="stagger mt-8 flex flex-col gap-4">
        {links.map((link, i) => (
          <LinkRow key={`${link.url}-${i}`} link={link} index={i} />
        ))}
      </nav>

      <footer className="mt-auto pt-12 text-center">
        <Link href="/" className="slide-link font-display text-sm font-bold text-yellow">
          dsec.club
        </Link>
        <p className="mt-2 font-mono text-[11px] text-paper/40">
          © DSEC · Deakin Software Engineering Club
        </p>
      </footer>
    </div>
  );
}
