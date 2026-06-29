import Link from "next/link";
import {
  site,
  socialHref,
  SOCIAL_META,
  type SocialKey,
  type Socials,
} from "@/lib/content";
import type { NavEntry } from "@/lib/pages";

// "Connect" column order — email first (the primary contact), then platforms.
const FOOTER_SOCIAL_ORDER: SocialKey[] = [
  "email",
  "discord",
  "instagram",
  "linkedin",
  "github",
];

/**
 * The footer. The "Connect" column is built from the club's API-served socials
 * (`socials`, resolved upstream with the site.* fallback) so a handle is changed
 * in one place. Any committee-published custom pages (nav_area = "footer") are
 * appended to the "Site" column. Both props default to empty so the footer still
 * renders if nothing is wired.
 */
export function SiteFooter({
  extra = [],
  socials = {},
}: {
  extra?: NavEntry[];
  socials?: Socials;
}) {
  const connect = FOOTER_SOCIAL_ORDER.filter((k) => socials[k]).map((k) => ({
    href: socialHref(k, socials[k] as string),
    // Email shows the address; the rest show the platform name.
    label: k === "email" ? (socials[k] as string) : SOCIAL_META[k].label,
    external: k !== "email",
  }));
  return (
    <footer className="mt-auto border-t-[3px] border-paper bg-void text-paper">
      <div className="h-3 stripes opacity-90" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-yellow">
              {site.name}
            </span>
            <span className="font-mono text-xs text-paper/60">
              {"// ducks who ship"}
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-paper/70">
            {site.longName}. A project-led student club at {site.campus}. Affiliated
            with DUSA.
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="eyebrow !text-paper/50">Site</p>
          <Link href="/projects" className="slide-link text-sm hover:text-yellow">
            Projects
          </Link>
          <Link href="/events" className="slide-link text-sm hover:text-yellow">
            Events
          </Link>
          <Link href="/join" className="slide-link text-sm hover:text-yellow">
            For students
          </Link>
          <Link href="/sponsor" className="slide-link text-sm hover:text-yellow">
            Sponsor us
          </Link>
          <Link href="/about" className="slide-link text-sm hover:text-yellow">
            About
          </Link>
          <Link href="/contact" className="slide-link text-sm hover:text-yellow">
            Contact
          </Link>
          {extra.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="slide-link text-sm hover:text-yellow"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-2">
          <p className="eyebrow !text-paper/50">Connect</p>
          {connect.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? "_blank" : undefined}
              rel={l.external ? "noreferrer noopener" : undefined}
              className="slide-link text-sm hover:text-yellow"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4 font-mono text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} DSEC · {socials.email ?? site.email}</span>
          <span>Built in public. Sponsorship invoiced via DUSA (+GST).</span>
        </div>
      </div>
    </footer>
  );
}
