/**
 * Live content from the dsec-api public website feed (`/website/*`, no auth).
 *
 * Each loader maps the API shape onto the local `Project` / `ClubEvent` types so
 * the existing pixel-art cards keep working, while carrying the real uploaded
 * `imageUrl` (WebP) + `downloadUrl` (PNG). Every loader returns `null` on any
 * failure (unset `DSEC_API_URL`, network error, bad status) so pages fall back
 * to the "coming soon" placeholder instead of crashing.
 */

import "server-only";

import {
  events as placeholderEvents,
  projects as placeholderProjects,
  team as placeholderTeam,
  tiers as placeholderTiers,
  type ClubEvent,
  type Lead,
  type MediaItem,
  type Member,
  type Project,
  type Speaker,
  type SponsorBrand,
  type Tier,
} from "@/lib/content";
import type { DuckName } from "@/components/pixel-duck";

const ACCENTS = ["blue", "pink", "yellow", "mint"] as const;
const PROJECT_DUCKS: DuckName[] = ["icon-controller", "icon-cursor", "icon-floppy", "icon-star"];
const EVENT_DUCKS: DuckName[] = ["duck-trophy", "duck-rocket", "duck-coffee", "duck-laptop"];

type ApiMedia = {
  role: string; // image | poster | banner
  webp: string;
  png: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

type ApiLead = {
  name: string;
  role: string | null;
  photo: string | null;
};

type ApiProject = {
  slug: string | null;
  title: string;
  summary: string | null;
  description: string | null;
  tags: string[] | null;
  status: string | null;
  category: string | null;
  repo: string | null;
  demo: string | null;
  image: string | null;
  download: string | null;
  media: ApiMedia[] | null;
  lead?: ApiLead | null;
};

type ApiEvent = {
  slug: string;
  title: string;
  type: string | null;
  status: string | null;
  description: string | null;
  date: string | null;
  end_date: string | null;
  venue: string | null;
  format: string | null;
  ticket_url: string | null;
  ticket_tiers: { label: string; price: number | null }[] | null;
  food_provided: boolean;
  upcoming: boolean;
  image: string | null;
  download: string | null;
  media: ApiMedia[] | null;
  lead?: ApiLead | null;
  speakers?: ApiSpeaker[] | null;
  sponsors?: ApiEventSponsor[] | null;
};

type ApiSpeaker = {
  name: string;
  title: string | null;
  bio: string | null;
  photo: string | null;
  photo_png: string | null;
};

type ApiEventSponsor = {
  name: string;
  website: string | null;
  tier: string | null;
  logo: string | null;
  logo_png: string | null;
};

type ApiSponsor = {
  name: string;
  website: string | null;
  logo: string | null;
  logo_png: string | null;
};

type ApiPerson = {
  name: string;
  role: string | null;
  type: string | null;
  committee: string | null;
  bio: string | null;
  photo: string | null;
  photo_png: string | null;
  instagram: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
};

/**
 * Split the API media list into the three slots the UI renders separately:
 * the first `banner` (wide hero), the first `poster` (portrait key art), and
 * every `image` as the gallery. Unknown roles are ignored.
 */
function splitMedia(media: ApiMedia[] | null | undefined): {
  bannerUrl?: string;
  posterUrl?: string;
  gallery: MediaItem[];
} {
  const items: MediaItem[] = (media ?? []).map((m) => ({
    role: (m.role === "banner" || m.role === "poster" ? m.role : "image") as MediaItem["role"],
    webp: m.webp,
    png: m.png,
    alt: m.alt ?? undefined,
    width: m.width ?? undefined,
    height: m.height ?? undefined,
  }));
  return {
    bannerUrl: items.find((m) => m.role === "banner")?.webp,
    posterUrl: items.find((m) => m.role === "poster")?.webp,
    gallery: items.filter((m) => m.role === "image"),
  };
}

function apiBase(): string | null {
  const b = process.env.DSEC_API_URL;
  return b ? b.replace(/\/+$/, "") : null;
}

async function fetchJson<T>(path: string): Promise<T | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    // Revalidate every 5 minutes — the public feed changes slowly.
    const res = await fetch(`${base}${path}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function formatEventDate(e: ApiEvent): string {
  if (!e.date) return "Date to be confirmed";
  const d = new Date(`${e.date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return e.date;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

function mapProject(p: ApiProject, i: number): Project {
  const { bannerUrl, posterUrl, gallery } = splitMedia(p.media);
  return {
    slug: p.slug ?? `project-${i}`,
    title: p.title,
    blurb: p.summary ?? p.description ?? "",
    stack: p.tags ?? [],
    image: PROJECT_DUCKS[i % PROJECT_DUCKS.length],
    accent: ACCENTS[i % ACCENTS.length],
    repo: p.repo ?? undefined,
    live: p.demo ?? undefined,
    description: p.description ?? undefined,
    status: p.status ?? undefined,
    category: p.category ?? undefined,
    imageUrl: p.image ?? undefined,
    downloadUrl: p.download ?? undefined,
    bannerUrl,
    posterUrl,
    gallery,
    lead: mapLead(p.lead),
  };
}

function mapLead(l: ApiLead | null | undefined): Lead | undefined {
  if (!l) return undefined;
  return { name: l.name, role: l.role ?? undefined, photo: l.photo ?? undefined };
}

function mapSpeaker(s: ApiSpeaker): Speaker {
  return {
    name: s.name,
    title: s.title ?? undefined,
    bio: s.bio ?? undefined,
    photo: s.photo ?? undefined,
  };
}

function mapEventSponsor(s: ApiEventSponsor): SponsorBrand {
  return {
    name: s.name,
    website: s.website ?? undefined,
    tier: s.tier ?? undefined,
    logo: s.logo ?? undefined,
  };
}

function mapEvent(e: ApiEvent, i: number): ClubEvent {
  const { bannerUrl, posterUrl, gallery } = splitMedia(e.media);
  return {
    slug: e.slug,
    title: e.title,
    date: formatEventDate(e),
    isoDate: e.date ?? undefined,
    status: e.upcoming ? "upcoming" : "past",
    blurb: [e.type, e.format, e.venue].filter(Boolean).join(" · ") || "Details on Discord.",
    description: e.description ?? undefined,
    image: EVENT_DUCKS[i % EVENT_DUCKS.length],
    accent: ACCENTS[i % ACCENTS.length],
    ticketUrl: e.ticket_url ?? undefined,
    ticketTiers: e.ticket_tiers ?? undefined,
    foodIncluded: e.food_provided ?? undefined,
    venue: e.venue ?? undefined,
    format: e.format ?? undefined,
    type: e.type ?? undefined,
    endDate: e.end_date ?? undefined,
    imageUrl: e.image ?? undefined,
    downloadUrl: e.download ?? undefined,
    bannerUrl,
    posterUrl,
    gallery,
    lead: mapLead(e.lead),
    speakers: (e.speakers ?? []).map(mapSpeaker),
    sponsors: (e.sponsors ?? []).map(mapEventSponsor),
  };
}

export async function getProjectsFromApi(): Promise<Project[] | null> {
  const rows = await fetchJson<ApiProject[]>("/website/projects");
  if (!rows) return null;
  return rows.map(mapProject);
}

export async function getProjectFromApi(slug: string): Promise<Project | null> {
  const row = await fetchJson<ApiProject>(`/website/projects/${encodeURIComponent(slug)}`);
  return row ? mapProject(row, 0) : null;
}

export async function getEventsFromApi(): Promise<ClubEvent[] | null> {
  const rows = await fetchJson<ApiEvent[]>("/website/events");
  if (!rows) return null;
  return rows.map(mapEvent);
}

export async function getEventFromApi(slug: string): Promise<ClubEvent | null> {
  const row = await fetchJson<ApiEvent>(`/website/events/${encodeURIComponent(slug)}`);
  return row ? mapEvent(row, 0) : null;
}

/* ---------------------------------------------------------------------------
 * Public loaders with a placeholder fallback.
 *
 * These are what the pages call. They prefer live API content, but fall back to
 * the static `content.ts` placeholders when the feed is empty/unreachable — so
 * the card + page layout is visible before any real content is entered. As soon
 * as the API returns rows, those take over automatically (it's checked first).
 * ------------------------------------------------------------------------- */

export async function getProjects(): Promise<Project[]> {
  const rows = await getProjectsFromApi();
  return rows && rows.length > 0 ? rows : placeholderProjects;
}

export async function getEvents(): Promise<ClubEvent[]> {
  const rows = await getEventsFromApi();
  return rows && rows.length > 0 ? rows : placeholderEvents;
}

export async function getProject(slug: string): Promise<Project | null> {
  return (
    (await getProjectFromApi(slug)) ??
    placeholderProjects.find((p) => p.slug === slug) ??
    null
  );
}

export async function getEvent(slug: string): Promise<ClubEvent | null> {
  return (
    (await getEventFromApi(slug)) ??
    placeholderEvents.find((e) => e.slug === slug) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Sponsor packages
// ---------------------------------------------------------------------------

type ApiSponsorPackage = {
  id: number;
  name: string;
  pitch: string | null;
  price: string | null;
  includes: string[] | null;
  featured: boolean;
  display_order: number;
};

async function getPackagesFromApi(): Promise<Tier[] | null> {
  const rows = await fetchJson<ApiSponsorPackage[]>("/website/sponsor-packages");
  if (!rows || rows.length === 0) return null;
  return rows.map((p) => ({
    name: p.name,
    pitch: p.pitch ?? "",
    price: p.price ?? "Contact us",
    includes: p.includes ?? [],
    featured: p.featured,
  }));
}

/** Live packages when the API has them; falls back to the hardcoded tiers. */
export async function getPackages(): Promise<Tier[]> {
  const rows = await getPackagesFromApi();
  return rows ?? placeholderTiers;
}

// ---------------------------------------------------------------------------
// Published sponsors (logo wall)
// ---------------------------------------------------------------------------

/**
 * Sponsors the exec has published (show_on_website + a logo), for the sponsor
 * page's "our sponsors" wall. Returns [] on any failure so the section simply
 * doesn't render — no placeholder, since fake logos would be misleading.
 */
export async function getSponsors(): Promise<SponsorBrand[]> {
  const rows = await fetchJson<ApiSponsor[]>("/website/sponsors");
  if (!rows) return [];
  return rows.map((s) => ({
    name: s.name,
    website: s.website ?? undefined,
    logo: s.logo ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Team / committee (the public About-page roster)
// ---------------------------------------------------------------------------

/** Map an API person onto the local `Member` card shape. The pixel-card accent
 *  isn't stored per-person, so it's assigned deterministically by position so
 *  the grid keeps its blue/pink/yellow/mint rhythm. */
function mapPerson(p: ApiPerson, i: number): Member {
  return {
    name: p.name,
    role: p.role ?? p.type ?? "",
    accent: ACCENTS[i % ACCENTS.length],
    description: p.bio ?? undefined,
    image: p.photo ?? undefined,
    instagram: p.instagram ?? undefined,
    linkedin: p.linkedin ?? undefined,
  };
}

async function getTeamFromApi(): Promise<Member[] | null> {
  const rows = await fetchJson<ApiPerson[]>("/website/team");
  if (!rows) return null;
  return rows.map(mapPerson);
}

/**
 * The committee/team for the About page. Prefers the people the exec has
 * published (show_on_website) from the live feed; falls back to the static
 * roster in `content.ts` when none are published or the feed is unreachable —
 * so the page always renders a team.
 */
export async function getTeam(): Promise<Member[]> {
  const rows = await getTeamFromApi();
  return rows && rows.length > 0 ? rows : placeholderTeam;
}
