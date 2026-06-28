/**
 * Central content for the DSEC site.
 * Items wrapped with `PLACEHOLDER:` flag copy that must be replaced with real
 * club content before launch (see §7 content checklist in the brief).
 */

import type { DuckName } from "@/components/pixel-duck";

export const PLACEHOLDER = "PLACEHOLDER";

/**
 * One uploaded image from the API media feed. `role` decides where it renders:
 * `banner` (wide hero), `poster` (portrait key art), or `image` (gallery).
 * `webp` is for display, `png` for download.
 */
/** Card accent palette. One shared type for every entity that themes a card. */
export type Accent = "blue" | "pink" | "yellow" | "mint";

export type MediaItem = {
  role: "image" | "poster" | "banner";
  webp: string;
  png: string;
  alt?: string;
  width?: number;
  height?: number;
};

/** A speaker presenting at an event (from the dsec-api feed). */
export type Speaker = {
  name: string;
  title?: string;
  bio?: string;
  photo?: string; // headshot (WebP)
};

/** A sponsor backing an event or shown on the sponsor wall (with its logo). */
export type SponsorBrand = {
  name: string;
  website?: string;
  tier?: string;
  logo?: string; // transparent logo (WebP)
};

/** The person leading a project/event — a public byline (name + role + photo).
 *  Resolved from the event lead / project lead in the dsec-api feed. */
export type Lead = {
  name: string;
  role?: string;
  photo?: string; // headshot (WebP)
};

export const site = {
  name: "DSEC",
  longName: "Deakin Software Engineering Club",
  tagline: "We build real software.",
  email: "admin@dsec.club",
  discord: "https://discord.gg/REPLACE-permanent-invite", // PLACEHOLDER: permanent Discord invite
  dusaMembership:
    "https://www.dusa.org.au/clubs/deakin-software-engineering-club-dsec", // buy membership via DUSA
  github: "https://github.com/dsec-hub",
  instagram: "https://instagram.com/REPLACE", // PLACEHOLDER: Instagram handle
  linkedin: "https://www.linkedin.com/company/REPLACE", // PLACEHOLDER: LinkedIn URL
  calBooking: "https://cal.com/deakin-software-engineering-club/sponsorship", // Cal.com booking link for sponsor meetings
  // Member portal (app.dsec.club). Overridable for local dev via NEXT_PUBLIC_APP_URL.
  app: process.env.NEXT_PUBLIC_APP_URL || "https://app.dsec.club",
  campus: "Deakin University · Burwood",
};

export const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/sponsor", label: "Sponsor us" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/** Credibility numbers used as social proof. PLACEHOLDER: confirm real figures. */
export const stats = [
  { value: "190+", label: "members", note: "and growing each term" },
  { value: "150", label: "hackathon attendees", note: "ACUSYS × DUCA" },
  { value: "12+", label: "events / year", note: "workshops to hackathons" },
  { value: "4", label: "shipped projects", note: "built by members" },
];

export type Project = {
  slug: string;
  title: string;
  blurb: string;
  builtBy?: string;
  lead?: Lead; // project lead (name + role + headshot), from the API
  stack: string[];
  image: DuckName; // pixel sprite name (see PixelDuck), resolved to /public/pixel
  accent: Accent;
  repo?: string;
  live?: string;
  description?: string; // longer body for the detail page
  status?: string;
  category?: string;
  imageUrl?: string; // real uploaded image (WebP) from dsec-api; overrides the sprite
  downloadUrl?: string; // same image as PNG
  bannerUrl?: string; // wide hero image (WebP) for the detail page
  posterUrl?: string; // portrait key-art (WebP) for the detail page
  gallery?: MediaItem[]; // extra images for the detail-page gallery
};

/** PLACEHOLDER: replace with 3–4 real member projects + real links/screenshots. */
export const projects: Project[] = [
  {
    slug: "ducktype",
    title: "DuckType",
    blurb: "A typing-speed game that drills the keyboard shortcuts devs actually use.",
    builtBy: "Maya R. & Tom L.",
    stack: ["React", "TypeScript", "Vite"],
    image: "icon-controller",
    accent: "blue",
    repo: "https://github.com/dsec-hub",
    live: "#",
  },
  {
    slug: "campus-compass",
    title: "Campus Compass",
    blurb: "Indoor wayfinding for Burwood lecture halls, so you never miss a room again.",
    builtBy: "Priya S.",
    stack: ["Next.js", "Mapbox", "Postgres"],
    image: "icon-cursor",
    accent: "pink",
    repo: "https://github.com/dsec-hub",
  },
  {
    slug: "commit-club",
    title: "Commit Club",
    blurb: "A Discord bot that turns your GitHub streak into a leaderboard.",
    builtBy: "Arjun M. & 3 others",
    stack: ["Python", "discord.py", "GitHub API"],
    image: "icon-floppy",
    accent: "mint",
    repo: "https://github.com/dsec-hub",
  },
  {
    slug: "stack-overflow-irl",
    title: "Stack Overflow IRL",
    blurb: "Pair students with seniors for 15-minute debugging sprints on campus.",
    builtBy: "Hannah T.",
    stack: ["SvelteKit", "Supabase"],
    image: "icon-star",
    accent: "yellow",
    repo: "https://github.com/dsec-hub",
  },
];

export type ClubEvent = {
  slug: string;
  title: string;
  date: string;
  /**
   * ISO date (YYYY-MM-DD) used for Event JSON-LD. Only events with a confirmed
   * isoDate emit schema, so vague/TBD events are simply skipped until dated.
   * PLACEHOLDER: confirm exact dates, then they surface as Event rich results.
   */
  isoDate?: string;
  status: "past" | "upcoming";
  blurb: string;
  description?: string; // free-form Markdown body shown on the detail page
  outcome?: string; // for past events - the proof
  image: DuckName;
  accent: Accent;
  registerUrl?: string; // for upcoming
  ticketUrl?: string; // public buy-tickets / RSVP link (from the API)
  ticketTiers?: { label: string; price: number | null }[]; // per-audience pricing (upcoming only)
  foodIncluded?: boolean; // catering provided at the event
  venue?: string;
  format?: string;
  type?: string;
  endDate?: string; // ISO end date, when multi-day
  imageUrl?: string; // real uploaded image (WebP) from dsec-api; overrides the sprite
  downloadUrl?: string; // same image as PNG
  bannerUrl?: string; // wide hero image (WebP) for the detail page
  posterUrl?: string; // portrait key-art (WebP) for the detail page
  gallery?: MediaItem[]; // extra images for the detail-page gallery
  lead?: Lead; // event lead (name + role + headshot), from the API
  speakers?: Speaker[]; // speakers presenting at this event
  sponsors?: SponsorBrand[]; // sponsors backing this event (logo wall)
  partners?: SponsorBrand[]; // collaborator clubs co-hosting this event (published only)
  relatedEvents?: RelatedEvent[]; // other published events visibly linked to this one
};

/** A published event linked to another (a visual-only relation). Just enough to
 * render a clickable list item that deep-links to the related event's page. */
export type RelatedEvent = {
  slug: string;
  title: string;
  label?: string; // optional relation label, e.g. "Series"
  status: "past" | "upcoming";
};

/** Format one tier's price for display: null → "—", 0 → "Free", else AUD. */
export function formatTicketPrice(price: number | null): string {
  if (price == null) return "—";
  if (price === 0) return "Free";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: Number.isInteger(price) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/** A compact one-line ticket-price summary for cards (null when no pricing). */
export function ticketPriceSummary(
  tiers?: { label: string; price: number | null }[],
): string | null {
  const prices = (tiers ?? [])
    .map((t) => t.price)
    .filter((p): p is number => p != null);
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (max === 0) return "Free";
  if (min === 0) return `Free–${formatTicketPrice(max)}`;
  if (min === max) return formatTicketPrice(min);
  return `${formatTicketPrice(min)}–${formatTicketPrice(max)}`;
}

/** PLACEHOLDER: confirm dates, attendance and registration links. */
export const events: ClubEvent[] = [
  {
    slug: "acusys-duca-hackathon",
    title: "ACUSYS × DUCA Hackathon",
    date: "2025 · Trimester 2",
    isoDate: "2025-08-16", // PLACEHOLDER: confirm exact date
    status: "past",
    blurb:
      "A multi-club, weekend-long build sprint co-run with ACUSYS and DUCA. Teams shipped working prototypes from a standing start.",
    outcome: "150 attendees · 30+ teams · 4 partner clubs",
    image: "duck-trophy",
    accent: "yellow",
  },
  {
    slug: "first-australian-offer",
    title: "“My First Australian Offer” Workshop",
    date: "2025",
    isoDate: "2025-05-10", // PLACEHOLDER: confirm exact date
    status: "past",
    blurb:
      "Utkarsh Manocha walked members through landing a first grad offer in Australia: resume, interviews, and what actually moves the needle.",
    outcome: "Packed room · practical, no-fluff career session",
    image: "duck-coffee",
    accent: "pink",
  },
  {
    slug: "ship-it-night",
    title: "Ship It Night",
    date: "Upcoming · check Discord",
    status: "upcoming",
    blurb:
      "Bring a half-finished project, leave with it deployed. Mentors on hand, pizza on us. Demo at the end if you dare.",
    image: "duck-rocket",
    accent: "blue",
    registerUrl: "#register", // PLACEHOLDER: registration link
  },
];

export type Tier = {
  name: string;
  price: string;
  pitch: string;
  includes: string[];
  featured?: boolean;
};

/**
 * PLACEHOLDER + OPEN DECISION (§7): tiers currently route to a call rather than
 * naming final prices, pending the prospectus with Ranveer + Sophie. "from $X"
 * values are anchors, not quotes. All sponsorship is invoiced via DUSA + GST.
 */
export const tiers: Tier[] = [
  {
    name: "Supporter",
    price: "from $500",
    pitch: "Get on the radar of Deakin's most active software students.",
    includes: [
      "Logo on the DSEC site + Discord",
      "Shout-out at one event",
      "Job posts shared to members",
    ],
  },
  {
    name: "Partner",
    price: "from $1,500",
    pitch: "Brand presence at the events members actually show up to.",
    includes: [
      "Everything in Supporter",
      "Branding at 2 flagship events",
      "A workshop or tech talk slot",
      "Featured in the event recap",
    ],
    featured: true,
  },
  {
    name: "Headline",
    price: "Let's talk",
    pitch: "Own a flagship event and the talent pipeline that comes with it.",
    includes: [
      "Everything in Partner",
      "Naming on a hackathon or series",
      "Direct grad pipeline + CV book",
      "Co-branded project brief for members",
    ],
  },
];

export type Member = {
  name: string;
  role: string;
  accent: Accent;
  description?: string;
  image?: string; // headshot in /public/team
  instagram?: string; // handle, with or without leading @
  linkedin?: string; // path after linkedin.com, e.g. /in/name
};

/** The DSEC executive committee. Roles stay constant year to year; the people
 *  are elected at the AGM under DUSA club rules. */
export const team: Member[] = [
  {
    name: "Samridh Limbu",
    role: "President",
    accent: "yellow",
    description:
      "Sets club vision, manages external partnerships, and ensures portfolio-driven outcomes for members.",
    image: "/team/sam.jpg",
    instagram: "@clupai8o0",
    linkedin: "/in/samridh-limbu",
  },
  {
    name: "Tarun Rutvik Gandeti",
    role: "Vice-President",
    accent: "blue",
    description:
      "Executes internal operations, coordinates committee heads, and keeps projects on track.",
    image: "/team/tarun.jpg",
  },
  {
    name: "Aarav Verma",
    role: "Brand Executive",
    accent: "pink",
    description:
      "Builds visual identity, creates marketing assets, and manages social media presence.",
    image: "/team/aarav.jpg",
  },
  {
    name: "Open Position",
    role: "Head of Marketing",
    accent: "mint",
    description:
      "This role is currently open. Plans content strategy, manages outreach campaigns, and grows club visibility.",
  },
  {
    name: "Ranveer Bhasin",
    role: "Head of External Affairs",
    accent: "yellow",
    description:
      "Secures sponsorships, coordinates industry panels, and builds corporate partnerships.",
    image: "/team/ranveer.jpg",
    instagram: "@platypus_mann",
    linkedin: "/in/ranveer-bhasin",
  },
  {
    name: "Shalok Sharma",
    role: "Head of Development",
    accent: "blue",
    description:
      "Oversees all technical teams, sets project standards, and coordinates cross-team initiatives.",
    image: "/team/shalok.jpg",
  },
  {
    name: "Ryan Lee",
    role: "Web Development Lead",
    accent: "pink",
    description:
      "Leads web projects, runs workshops on React/Next.js, and reviews frontend code.",
    image: "/team/ryan.jpg",
  },
  {
    name: "Yordan Simeonov",
    role: "App Development Lead",
    accent: "mint",
    description:
      "Leads mobile and desktop app development projects and workshops.",
    image: "/team/yordan.jpg",
  },
  {
    name: "Samarpan Gupta Kanu",
    role: "AI Lead",
    accent: "yellow",
    description:
      "Builds automation tools, Discord bots, and runs scripting workshops for workflow optimization.",
    image: "/team/samarpan.jpg",
  },
  {
    name: "Nikhil Gupta",
    role: "Robotics Lead",
    accent: "blue",
    description:
      "Runs hardware projects, embedded systems workshops, and robotics showcases.",
    image: "/team/nikhil.jpg",
  },
];

export const accentBg: Record<Accent, string> = {
  blue: "bg-blue",
  pink: "bg-pink",
  yellow: "bg-yellow",
  mint: "bg-mint",
};

// ---------------------------------------------------------------------------
// Link tree (/links) — the chromeless "linktree" page editable by committee.
// ---------------------------------------------------------------------------

/** The 8 brand accents a link can use (maps to tokens in globals.css). A link
 *  may also leave this unset, in which case it auto-cycles by visible position. */
export type LinkAccent =
  | "blue"
  | "pink"
  | "yellow"
  | "mint"
  | "sky"
  | "violet"
  | "lime"
  | "coral";

/** Auto-cycle order applied (by visible index, wrapping) when a link's `accent`
 *  is null. Must match the contract / dsec-api + dsec-hub exactly. */
export const LINK_ACCENT_CYCLE: LinkAccent[] = [
  "pink",
  "blue",
  "yellow",
  "mint",
  "violet",
  "sky",
  "coral",
  "lime",
];

/** Real PixelDuck sprites offered as profile mascots (files in /public/pixel).
 *  The list is the validation set: an API mascot outside it falls back. */
export const LINK_MASCOTS: DuckName[] = [
  "duck-wave",
  "duck-mascot",
  "duck-laptop",
  "duck-rocket",
  "duck-trophy",
  "duck-coffee",
  "duck-mail",
  "duck-iso",
];

/** Default mascot when the profile has none / an unknown sprite name. */
export const DEFAULT_LINK_MASCOT: DuckName = "duck-wave";

export type LinkItem = {
  title: string;
  subtitle?: string;
  url: string; // absolute http(s) (external) or a relative path like /events
  icon?: string; // a single emoji
  accent?: LinkAccent | null; // null ⇒ auto-cycle by visible index
};

export type LinkProfile = {
  title: string;
  tagline?: string;
  mascot: DuckName;
};

export type LinkTree = {
  profile: LinkProfile;
  links: LinkItem[];
};

/** Validate an API mascot string against the real sprite set, else fall back. */
export function resolveMascot(name: string | null | undefined): DuckName {
  return name && (LINK_MASCOTS as string[]).includes(name)
    ? (name as DuckName)
    : DEFAULT_LINK_MASCOT;
}

/** Validate an API accent string against the 8 accents; unknown ⇒ null (cycle). */
export function normalizeLinkAccent(accent: string | null | undefined): LinkAccent | null {
  return accent && (LINK_ACCENT_CYCLE as string[]).includes(accent)
    ? (accent as LinkAccent)
    : null;
}

/** Resolve a link's accent: its own when set, else auto-cycled by visible index. */
export function linkAccentAt(accent: LinkAccent | null | undefined, visibleIndex: number): LinkAccent {
  return accent ?? LINK_ACCENT_CYCLE[visibleIndex % LINK_ACCENT_CYCLE.length];
}

/**
 * Hardcoded fallback link tree, built from the real `site.*` social values. The
 * /links page renders this when the dsec-api feed is unset/down, so the page is
 * never empty. As soon as the API returns a profile + links, those take over.
 */
export const linktree: LinkTree = {
  profile: {
    title: site.name,
    tagline: site.longName,
    mascot: "duck-wave",
  },
  links: ([
    {
      title: "Join the Discord",
      subtitle: "Where everything actually happens",
      url: site.discord,
      icon: "💬",
      accent: "violet",
    },
    {
      title: "Become a member",
      subtitle: "$5 / year · via DUSA",
      url: site.dusaMembership,
      icon: "🎟️",
      accent: "yellow",
    },
    {
      title: "Follow on Instagram",
      url: site.instagram,
      icon: "📸",
      accent: "pink",
    },
    {
      title: "Visit dsec.club",
      subtitle: "Projects, events & the full story",
      url: "/",
      icon: "🦆",
      accent: "blue",
    },
    {
      title: "Join DSEC",
      subtitle: "How to get involved",
      url: "/join",
      icon: "🚀",
      accent: "mint",
    },
    // Drop any link still pointing at a "REPLACE" PLACEHOLDER URL (e.g. the Discord
    // and Instagram CTAs, built from site.discord / site.instagram) so we never
    // render a dead CTA. Set the real Discord / Instagram URLs in site.* above
    // (or manage the link tree via dsec-hub once the feed is live) and these links
    // reappear automatically.
  ] satisfies LinkItem[]).filter((link) => !link.url.includes("REPLACE")),
};

