/**
 * JSON-LD schema builders (§2.3). Organization feeds the branded search panel
 * - the single highest-value SEO play for a name-search club. Event can surface
 * event rich results. Absolute URLs throughout (Google requires them).
 */
import { site, events, type ClubEvent, type Socials } from "@/lib/content";

const BASE = "https://dsec.club";

/** Real, public social profiles only - placeholders are filtered out so we
 *  never publish a dead sameAs link. When the resolved API socials are passed
 *  (already placeholder-filtered) they win; otherwise fall back to site.*. */
function sameAs(socials?: Socials): string[] {
  if (socials) {
    return [socials.github, socials.discord, socials.linkedin, socials.instagram].filter(
      (url): url is string => !!url,
    );
  }
  return [site.github, site.discord, site.linkedin].filter(
    (url) => url && !url.includes("REPLACE"),
  );
}

export function organizationSchema(socials?: Socials) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: site.longName,
    alternateName: site.name,
    url: BASE,
    logo: `${BASE}/icon.png`,
    email: socials?.email ?? site.email,
    description:
      "A project-led student software club at Deakin University, Burwood. Members build real, portfolio-worthy software.",
    sameAs: sameAs(socials),
    location: {
      "@type": "Place",
      name: "Deakin University - Burwood Campus",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Burwood",
        addressRegion: "VIC",
        addressCountry: "AU",
      },
    },
    parentOrganization: {
      "@type": "CollegeOrUniversity",
      name: "Deakin University",
      url: "https://www.deakin.edu.au",
    },
  };
}

function eventSchema(e: ClubEvent) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: e.isoDate,
    eventStatus:
      e.status === "upcoming"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: e.blurb,
    image: `${BASE}${e.image}`,
    location: {
      "@type": "Place",
      name: "Deakin University - Burwood Campus",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Burwood",
        addressRegion: "VIC",
        addressCountry: "AU",
      },
    },
    organizer: {
      "@type": "Organization",
      name: site.name,
      url: BASE,
    },
  };
}

/** Event schema for every event that has a confirmed isoDate (others skipped). */
export function eventsSchema() {
  return events.filter((e) => e.isoDate).map(eventSchema);
}
