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
  memberSlug,
  normalizeLinkAccent,
  projects as placeholderProjects,
  resolveMascot,
  resolveSocials,
  team as placeholderTeam,
  tiers as placeholderTiers,
  type ClubEvent,
  type Lead,
  type LinkItem,
  type LinkTree,
  type Socials,
  type MediaItem,
  type Member,
  type MemberDetail,
  type Project,
  type RelatedEvent,
  type Speaker,
  type SponsorBrand,
  type Tier,
} from "@/lib/content";
import type { ScanTarget } from "@/app/scan/scan-client";

/** The 4 light scan accents (matches scan-client's local `Accent`). */
type ScanCardAccent = "blue" | "pink" | "yellow" | "mint";
import type { DuckName } from "@/components/pixel-duck";
import { parsePageDoc } from "@/lib/page-blocks";
import type { CustomPage, NavEntry, PageSummary } from "@/lib/pages";

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
  partners?: ApiEventPartner[] | null;
  related_events?: ApiRelatedEvent[] | null;
  flagship?: boolean | null;
  flagship_theme?: string | null;
  flagship_state?: string | null;
  flagship_teaser_title?: string | null;
  flagship_teaser_body?: string | null;
  flagship_reveal_at?: string | null;
};

type ApiRelatedEvent = {
  slug: string;
  title: string;
  label: string | null;
  upcoming: boolean;
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

type ApiEventPartner = {
  name: string;
  website: string | null;
  role: string | null;
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
  slug: string;
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

type ApiPersonDetail = ApiPerson & {
  discord: string | null;
  led_events: { slug: string; title: string; date: string | null; upcoming: boolean }[] | null;
  led_projects: { slug: string | null; title: string; summary: string | null }[] | null;
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

/**
 * Shared cache tag on every feed fetch. The dashboard POSTs to `/api/revalidate`
 * with a feed tag (`events`, `projects`, …) after a write so only that feed
 * refreshes; pinging this `website` tag flushes all of them at once (used by
 * media uploads, which can touch any feed). See `app/api/revalidate/route.ts`.
 */
const SITE_TAG = "website";

/**
 * Safety-net lifetime (seconds). On-demand tag invalidation does the real work —
 * an idle site now makes ZERO API calls instead of refetching every 5 minutes.
 * This fallback only guarantees the site self-heals within a day if a
 * revalidation ping is ever missed (dashboard offline, transient network error).
 * Set to `false` to cache indefinitely and rely entirely on the pings.
 */
const FALLBACK_REVALIDATE = 86_400; // 24h

async function fetchJson<T>(path: string, tags: string[] = []): Promise<T | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    // Cache until the dashboard invalidates a matching tag (on-demand), with a
    // 24h fallback as insurance. Replaces the old fixed 5-minute poll.
    const res = await fetch(`${base}${path}`, {
      next: { tags: [SITE_TAG, ...tags], revalidate: FALLBACK_REVALIDATE },
    });
    if (!res.ok) {
      // The placeholder fallback is intentional, but in dev surface WHY the live
      // feed didn't load (so a misconfigured DSEC_API_URL / a 500 is diagnosable).
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[dsec-api] GET ${path} → ${res.status}; using placeholder content`);
      }
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[dsec-api] GET ${path} failed (${(err as Error).message}); using placeholder content`,
      );
    }
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

// Partners reuse the SponsorBrand shape for the logo wall; the per-event "role"
// label (e.g. "Co-host") maps onto `tier`.
function mapEventPartner(p: ApiEventPartner): SponsorBrand {
  return {
    name: p.name,
    website: p.website ?? undefined,
    tier: p.role ?? undefined,
    logo: p.logo ?? undefined,
  };
}

function mapRelatedEvent(e: ApiRelatedEvent): RelatedEvent {
  return {
    slug: e.slug,
    title: e.title,
    label: e.label ?? undefined,
    status: e.upcoming ? "upcoming" : "past",
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
    foodIncluded: e.food_provided,
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
    partners: (e.partners ?? []).map(mapEventPartner),
    relatedEvents: (e.related_events ?? []).map(mapRelatedEvent),
    flagship: e.flagship ?? false,
    flagshipTheme: mapFlagshipTheme(e.flagship_theme),
    flagshipState: e.flagship_state === "revealed" ? "revealed" : e.flagship_state === "teaser" ? "teaser" : undefined,
    flagshipTeaserTitle: e.flagship_teaser_title ?? undefined,
    flagshipTeaserBody: e.flagship_teaser_body ?? undefined,
    flagshipRevealAt: e.flagship_reveal_at ?? undefined,
  };
}

/** Normalise the API theme string onto the 3 supported skins (defaults to arena). */
function mapFlagshipTheme(t: string | null | undefined): ClubEvent["flagshipTheme"] {
  return t === "blueprint" || t === "nightrun" ? t : "arena";
}

async function getProjectsFromApi(): Promise<Project[] | null> {
  const rows = await fetchJson<ApiProject[]>("/website/projects", ["projects"]);
  if (!rows) return null;
  return rows.map(mapProject);
}

async function getProjectFromApi(slug: string): Promise<Project | null> {
  const row = await fetchJson<ApiProject>(`/website/projects/${encodeURIComponent(slug)}`, ["projects"]);
  return row ? mapProject(row, 0) : null;
}

async function getEventsFromApi(): Promise<ClubEvent[] | null> {
  const rows = await fetchJson<ApiEvent[]>("/website/events", ["events"]);
  if (!rows) return null;
  return rows.map(mapEvent);
}

async function getEventFromApi(slug: string): Promise<ClubEvent | null> {
  const row = await fetchJson<ApiEvent>(`/website/events/${encodeURIComponent(slug)}`, ["events"]);
  return row ? mapEvent(row, 0) : null;
}

/* ---------------------------------------------------------------------------
 * Public loaders with a placeholder fallback.
 *
 * These are what the pages call. They prefer live API content, but fall back to
 * the static `content.ts` placeholders when the feed is empty/unreachable — so
 * the card + page layout is visible before any real content is entered. As soon
 * as the API returns rows, those take over automatically (it's checked first).
 *
 * IMPORTANT: the project/event placeholders are *fake demo data* (DuckType,
 * "Ship It Night"). They're a dev-only scaffold so the layout renders before the
 * feed exists — never shown in production, where an empty/unreachable feed falls
 * through to each page's real "coming soon" empty-state instead. (Team + sponsor
 * packages are excluded below: their placeholders are the club's real roster and
 * pricing, so they stay as genuine fallbacks regardless of environment.)
 * ------------------------------------------------------------------------- */

const SHOW_DEMO_PLACEHOLDERS = process.env.NODE_ENV !== "production";

export async function getProjects(): Promise<Project[]> {
  const rows = await getProjectsFromApi();
  if (rows && rows.length > 0) return rows;
  return SHOW_DEMO_PLACEHOLDERS ? placeholderProjects : [];
}

export async function getEvents(): Promise<ClubEvent[]> {
  const rows = await getEventsFromApi();
  if (rows && rows.length > 0) return rows;
  return SHOW_DEMO_PLACEHOLDERS ? placeholderEvents : [];
}

export async function getProject(slug: string): Promise<Project | null> {
  const live = await getProjectFromApi(slug);
  if (live) return live;
  if (!SHOW_DEMO_PLACEHOLDERS) return null;
  return placeholderProjects.find((p) => p.slug === slug) ?? null;
}

export async function getEvent(slug: string): Promise<ClubEvent | null> {
  const live = await getEventFromApi(slug);
  if (live) return live;
  if (!SHOW_DEMO_PLACEHOLDERS) return null;
  return placeholderEvents.find((e) => e.slug === slug) ?? null;
}

/**
 * One event by a signed committee preview token (the `/events/preview/[token]`
 * route). Unlike `getEvent`, this hits the token-gated feed that also serves
 * *drafts*, is NEVER cached (`no-store` — a preview must reflect the latest
 * unpublished edit), and has no placeholder fallback: an invalid/expired token
 * or unreachable API returns `null` so the page 404s. Returns `null` when
 * `DSEC_API_URL` is unset (no live feed → nothing to preview).
 */
export async function getEventPreview(token: string): Promise<ClubEvent | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/website/events/preview/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return mapEvent((await res.json()) as ApiEvent, 0);
  } catch {
    return null;
  }
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
  const rows = await fetchJson<ApiSponsorPackage[]>("/website/sponsor-packages", ["packages"]);
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
  const rows = await fetchJson<ApiSponsor[]>("/website/sponsors", ["sponsors"]);
  if (!rows) return [];
  return rows.map((s) => ({
    name: s.name,
    website: s.website ?? undefined,
    logo: s.logo ?? undefined,
  }));
}

// ---------------------------------------------------------------------------
// Published partners (collaborator-club logo wall)
// ---------------------------------------------------------------------------

/**
 * Partners (collaborator clubs) the exec has published (show_on_website), for
 * the About page's "clubs & partners we work with" wall. Reuses the sponsor
 * logo shape (name + website + logo); logos are optional here, so the wall
 * renders the club name when a partner hasn't uploaded one. Returns [] on any
 * failure so the section simply doesn't render.
 */
export async function getPartners(): Promise<SponsorBrand[]> {
  const rows = await fetchJson<ApiSponsor[]>("/website/partners", ["partners"]);
  if (!rows) return [];
  return rows.map((p) => ({
    name: p.name,
    website: p.website ?? undefined,
    logo: p.logo ?? undefined,
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
    slug: p.slug,
    name: p.name,
    role: p.role ?? p.type ?? "",
    type: p.type ?? undefined,
    committee: p.committee ?? undefined,
    accent: ACCENTS[i % ACCENTS.length],
    description: p.bio ?? undefined,
    image: p.photo ?? undefined,
    instagram: p.instagram ?? undefined,
    linkedin: p.linkedin ?? undefined,
    github: p.github ?? undefined,
    website: p.website ?? undefined,
  };
}

async function getTeamFromApi(): Promise<Member[] | null> {
  const rows = await fetchJson<ApiPerson[]>("/website/team", ["team"]);
  if (!rows) return null;
  return rows.map(mapPerson);
}

/**
 * The committee/team for the About page. `show_on_website` is still a beta
 * toggle, so the static roster in `content.ts` ALWAYS renders — the live feed
 * augments it rather than replacing it:
 *   - a published (show_on_website) member overrides their matching placeholder
 *     card, matched by slug, with their live photo/bio/socials;
 *   - anyone published who isn't in the static roster is appended.
 * So opting in never removes the curated roster. Every member is guaranteed a
 * `slug` (the live feed supplies one; placeholders derive theirs) for the
 * profile-page link. When the feed is empty/unreachable this is just the roster.
 */
export async function getTeam(): Promise<Member[]> {
  const live = await getTeamFromApi();
  const liveBySlug = new Map(
    (live ?? []).map((m) => [m.slug ?? memberSlug(m.name), m] as const),
  );

  // Walk the curated roster in order; a matching live person overrides the card
  // but keeps the placeholder's grid accent (the feed doesn't store one) and its
  // guaranteed slug. Consumed entries are removed so only genuinely-new people
  // remain to append.
  const merged: Member[] = placeholderTeam.map((m) => {
    const slug = m.slug ?? memberSlug(m.name);
    const hit = liveBySlug.get(slug);
    liveBySlug.delete(slug);
    return hit ? { ...hit, slug, accent: m.accent } : { ...m, slug };
  });

  // Published people who aren't in the static roster, in feed order, accented by
  // final grid position so the blue/pink/yellow/mint rhythm continues.
  for (const m of liveBySlug.values()) {
    merged.push({
      ...m,
      slug: m.slug ?? memberSlug(m.name),
      accent: ACCENTS[merged.length % ACCENTS.length],
    });
  }

  return merged;
}

/** Map an API person-detail onto the local `MemberDetail` profile-page shape. */
function mapPersonDetail(p: ApiPersonDetail): MemberDetail {
  return {
    ...mapPerson(p, 0),
    discord: p.discord ?? undefined,
    ledEvents: (p.led_events ?? []).map((e) => ({
      slug: e.slug,
      title: e.title,
      date: e.date ?? undefined,
      status: e.upcoming ? "upcoming" : "past",
    })),
    ledProjects: (p.led_projects ?? [])
      .filter((pr): pr is { slug: string; title: string; summary: string | null } => !!pr.slug)
      .map((pr) => ({ slug: pr.slug, title: pr.title, summary: pr.summary ?? undefined })),
  };
}

/**
 * One team member's full public profile (the /team/[slug] page). Prefers the
 * live feed; in dev, falls back to the static roster (no events/projects) so the
 * page renders before the API exists. Returns null when the slug is unknown.
 */
export async function getTeamMember(slug: string): Promise<MemberDetail | null> {
  const row = await fetchJson<ApiPersonDetail>(
    `/website/team/${encodeURIComponent(slug)}`,
    ["team"],
  );
  if (row) return mapPersonDetail(row);
  // Team placeholders are the club's real roster — a genuine fallback in every
  // environment (like getTeam), so a known slug still resolves when the feed is
  // down. Unknown slugs return null → the page 404s.
  const m = placeholderTeam.find((x) => memberSlug(x.name) === slug);
  return m ? { ...m, slug, ledEvents: [], ledProjects: [] } : null;
}

// ---------------------------------------------------------------------------
// Link tree (/links) — the chromeless public "linktree" page.
// ---------------------------------------------------------------------------

export type ApiLink = {
  title: string;
  subtitle: string | null;
  url: string;
  icon: string | null;
  accent: string | null;
  display_order: number;
};

export type ApiSocials = {
  instagram: string | null;
  discord: string | null;
  linkedin: string | null;
  github: string | null;
  email: string | null;
};

export type ApiLinkProfile = {
  title: string;
  tagline: string | null;
  mascot: string | null;
  socials?: ApiSocials | null;
};

type ApiLinkTree = {
  profile: ApiLinkProfile;
  links: ApiLink[];
};

/**
 * The public link tree from the dsec-api feed (`/website/linktree`): the profile
 * header + the visible links, already ordered by the API. Mapped onto the local
 * `LinkTree` shape (accents/mascot validated, nulls dropped). Returns `null` on
 * any failure so the page falls back to the hardcoded `linktree` in content.ts.
 */
export async function getLinkTree(): Promise<LinkTree | null> {
  const data = await fetchJson<ApiLinkTree>("/website/linktree", ["links"]);
  if (!data) return null;
  const links: LinkItem[] = (data.links ?? []).map((l) => ({
    title: l.title,
    subtitle: l.subtitle ?? undefined,
    url: l.url,
    icon: l.icon ?? undefined,
    accent: normalizeLinkAccent(l.accent),
  }));
  return {
    profile: {
      title: data.profile?.title ?? "DSEC",
      tagline: data.profile?.tagline ?? undefined,
      mascot: resolveMascot(data.profile?.mascot),
    },
    // Live socials win; fall back to the real site.* values for any unset one.
    socials: resolveSocials(data.profile?.socials ?? undefined),
    links,
  };
}

/**
 * The club's resolved socials (the single source for the footers, contact, scan
 * and join). Reads the same cached `/website/linktree` feed and merges the live
 * values with the hardcoded `site.*` fallback (placeholder/empty values dropped),
 * so callers always get whatever real handles exist — even if the feed is down.
 */
export async function getSocials(): Promise<Socials> {
  const tree = await getLinkTree();
  return tree?.socials ?? resolveSocials(undefined);
}

// ---------------------------------------------------------------------------
// Scan wall (/scan) — the committee-curated QR cards for big-screen display.
// ---------------------------------------------------------------------------

export type ApiScanTarget = {
  label: string;
  caption: string | null;
  url: string;
  pretty: string | null;
  accent: string | null;
  display_order: number;
};

type ApiScanWall = {
  title: string;
  description: string;
  targets: ApiScanTarget[];
};

/** The /scan wall as the page consumes it: the editable heading (already
 *  defaulted by the API) plus the cards mapped onto scan-client's ScanTarget. */
export type ScanWall = { title: string; description: string; cards: ScanTarget[] };

/** The 4 light scan accents, cycled by position when a card leaves accent on
 *  "auto". Matches dsec-hub's SCAN_ACCENTS + the API's SCAN_ACCENTS. */
const SCAN_ACCENT_CYCLE = ["blue", "pink", "yellow", "mint"] as const;

function normalizeScanAccent(accent: string | null, index: number): ScanCardAccent {
  if (accent && (SCAN_ACCENT_CYCLE as readonly string[]).includes(accent)) {
    return accent as ScanCardAccent;
  }
  return SCAN_ACCENT_CYCLE[index % SCAN_ACCENT_CYCLE.length];
}

/**
 * The public /scan wall from the dsec-api feed (`/website/scan`): the editable
 * heading (title + description, already defaulted server-side) plus the visible
 * QR cards in display order, mapped onto the page's ScanTarget shape (accent
 * resolved, nulls → ""). Returns `null` on any failure (unset DSEC_API_URL, bad
 * status) so the page falls back to its default heading + the auto socials cards.
 */
export async function getScanWall(): Promise<ScanWall | null> {
  const data = await fetchJson<ApiScanWall>("/website/scan", ["scan"]);
  if (!data) return null;
  return {
    title: data.title,
    description: data.description,
    cards: (data.targets ?? []).map((t, i) => ({
      label: t.label,
      caption: t.caption ?? "",
      href: t.url,
      pretty: t.pretty ?? "",
      accent: normalizeScanAccent(t.accent, i),
    })),
  };
}

// ---------------------------------------------------------------------------
// Custom pages (/[slug]) — committee-authored marketing pages.
// ---------------------------------------------------------------------------

type ApiPageSummary = {
  slug: string;
  title: string;
  nav_label: string | null;
  show_in_nav: boolean;
  nav_area: string | null;
  nav_order: number | null;
  seo_description: string | null;
  cover_image: string | null;
  updated_at: string | null;
};

type ApiPage = ApiPageSummary & { blocks?: unknown };

function mapPageSummary(p: ApiPageSummary): PageSummary {
  return {
    slug: p.slug,
    title: p.title,
    navLabel: p.nav_label ?? undefined,
    showInNav: !!p.show_in_nav,
    navArea: p.nav_area === "footer" ? "footer" : "header",
    navOrder: p.nav_order ?? 0,
    seoDescription: p.seo_description ?? undefined,
    coverImage: p.cover_image ?? undefined,
    updatedAt: p.updated_at ?? undefined,
  };
}

/** Map a full API page onto the local shape, defensively parsing its block body
 *  through the shared `parsePageDoc` (drops unknown block types, guarantees ids,
 *  never throws → a corrupt payload yields an empty page rather than a crash). */
function mapPage(p: ApiPage): CustomPage {
  return { ...mapPageSummary(p), blocks: parsePageDoc(p.blocks).blocks };
}

/**
 * Every published page (is_public + slug), ordered by the API (nav_order, title).
 * Drives `generateStaticParams`, the nav and the sitemap. Returns `[]` on any
 * failure (unset `DSEC_API_URL`, bad status) so the build prebuilds nothing and
 * the site renders unchanged when there's no live feed.
 */
export async function getPages(): Promise<PageSummary[]> {
  const rows = await fetchJson<ApiPageSummary[]>("/website/pages", ["pages"]);
  if (!rows) return [];
  return rows.filter((p) => p.slug).map(mapPageSummary);
}

/** One published page by slug, with its block body. `null` when missing/unreachable. */
export async function getPage(slug: string): Promise<CustomPage | null> {
  const row = await fetchJson<ApiPage>(`/website/pages/${encodeURIComponent(slug)}`, ["pages"]);
  return row ? mapPage(row) : null;
}

/**
 * One page by a signed committee preview token (`/pages/preview/[token]`). Hits
 * the token-gated feed that also serves DRAFTS, is NEVER cached (`no-store`), and
 * has no fallback: an invalid/expired token or unreachable API returns `null` so
 * the page 404s. Returns `null` when `DSEC_API_URL` is unset.
 */
export async function getPagePreview(token: string): Promise<CustomPage | null> {
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(
      `${base}/website/pages/preview/${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    return mapPage((await res.json()) as ApiPage);
  } catch {
    return null;
  }
}

/**
 * The published pages that opted into the nav, split by area and sorted by
 * `navOrder` then title, mapped to renderable `{ href, label }` entries. The site
 * chrome appends these AFTER its static nav. Empty arrays when there's no feed,
 * so the header/footer render unchanged.
 */
export async function getNavPages(): Promise<{ header: NavEntry[]; footer: NavEntry[] }> {
  const pages = await getPages();
  const sort = (a: PageSummary, b: PageSummary) =>
    a.navOrder - b.navOrder || a.title.localeCompare(b.title);
  const toEntry = (p: PageSummary): NavEntry => ({
    href: `/${p.slug}`,
    label: p.navLabel || p.title,
  });
  const inNav = pages.filter((p) => p.showInNav);
  return {
    header: inNav.filter((p) => p.navArea === "header").sort(sort).map(toEntry),
    footer: inNav.filter((p) => p.navArea === "footer").sort(sort).map(toEntry),
  };
}
