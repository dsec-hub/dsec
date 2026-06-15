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
export type MediaItem = {
  role: "image" | "poster" | "banner";
  webp: string;
  png: string;
  alt?: string;
  width?: number;
  height?: number;
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
  campus: "Deakin University · Burwood",
};

export const nav = [
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
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
  stack: string[];
  image: DuckName; // pixel sprite name (see PixelDuck), resolved to /public/pixel
  accent: "blue" | "pink" | "yellow" | "mint";
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
  outcome?: string; // for past events - the proof
  image: DuckName;
  accent: "blue" | "pink" | "yellow" | "mint";
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
  accent: "blue" | "pink" | "yellow" | "mint";
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

export const accentBg: Record<string, string> = {
  blue: "bg-blue",
  pink: "bg-pink",
  yellow: "bg-yellow",
  mint: "bg-mint",
};

export const accentText: Record<string, string> = {
  blue: "text-blue",
  pink: "text-pink",
  yellow: "text-yellow",
  mint: "text-mint",
};
