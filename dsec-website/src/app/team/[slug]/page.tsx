import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/ui";
import { PixelDuck } from "@/components/pixel-duck";
import { getTeam, getTeamMember } from "@/lib/api";
import { accentBg } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

/** Build a LinkedIn URL from a full URL, a "linkedin.com/…" string, or a bare
 *  path/handle (e.g. "/in/name"). Handles both the static roster and live data. */
function linkedinHref(v: string): string {
  if (/^https?:\/\//i.test(v)) return v;
  const s = v.replace(/^\/+/, "");
  return /^(www\.)?linkedin\.com/i.test(s) ? `https://${s}` : `https://linkedin.com/${s}`;
}

/** Build an Instagram URL from a handle (with/without leading @) or a full URL. */
function instagramHref(v: string): string {
  return /^https?:\/\//i.test(v) ? v : `https://instagram.com/${v.replace(/^@+/, "")}`;
}

/** Build a GitHub URL from a handle, a "github.com/…" string, or a full URL. */
function githubHref(v: string): string {
  if (/^https?:\/\//i.test(v)) return v;
  const s = v.replace(/^\/+/, "");
  return /^(www\.)?github\.com/i.test(s) ? `https://${s}` : `https://github.com/${s}`;
}

/** Coerce a bare domain into an absolute URL so the link always works. */
function websiteHref(v: string): string {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function formatDate(iso?: string): string {
  if (!iso) return "Date to be confirmed";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export async function generateStaticParams() {
  const team = await getTeam();
  return team.map((m) => ({ slug: m.slug ?? "" })).filter((p) => p.slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  if (!member) return { title: "Team member not found - DSEC" };
  const title = `${member.name} - DSEC ${member.role || "Committee"}`;
  const description =
    member.description ||
    `${member.name} is part of the DSEC committee${member.role ? `, ${member.role}` : ""}.`;
  return {
    title,
    description,
    alternates: { canonical: `/team/${member.slug}` },
    openGraph: {
      title,
      description,
      url: `/team/${member.slug}`,
      type: "profile",
      images: member.image ? [member.image] : undefined,
    },
  };
}

export default async function TeamMemberPage({ params }: Props) {
  const { slug } = await params;
  const member = await getTeamMember(slug);
  if (!member) notFound();

  const socials: { label: string; href: string }[] = [
    member.linkedin && { label: "LinkedIn", href: linkedinHref(member.linkedin) },
    member.instagram && { label: "Instagram", href: instagramHref(member.instagram) },
    member.github && { label: "GitHub", href: githubHref(member.github) },
    member.website && { label: "Website", href: websiteHref(member.website) },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/about"
          className="slide-link font-mono text-sm font-bold text-paper/60 hover:text-paper"
        >
          ← All committee
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Side rail: headshot + social links */}
          <aside className="space-y-4">
            <div
              className={`pixel-card relative aspect-square overflow-hidden ${accentBg[member.accent]}`}
            >
              {member.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center">
                  <PixelDuck name="duck-mascot" alt="" size={120} />
                </div>
              )}
            </div>

            {socials.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="pixel-tag !bg-panel !text-blue hover:!text-paper"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            )}
            {member.discord && (
              <p className="font-mono text-xs text-paper/55">Discord: {member.discord}</p>
            )}
          </aside>

          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {member.committee && (
                <span className="pixel-tag !bg-mint text-ink">{member.committee}</span>
              )}
              {member.type && (
                <span className="font-mono text-xs text-paper/60">{member.type}</span>
              )}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              {member.name}
            </h1>
            {member.role && (
              <p className="mt-2 font-mono text-sm text-paper/60">{member.role}</p>
            )}
            {member.description && (
              <p className="mt-4 max-w-2xl text-lg text-paper/80">{member.description}</p>
            )}

            {/* Events they lead */}
            {member.ledEvents.length > 0 && (
              <div className="mt-12">
                <SectionHeading eyebrow="On the ground" title="Events they lead.">
                  {member.name.split(" ")[0]} runs these DSEC events.
                </SectionHeading>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {member.ledEvents.map((e) => (
                    <Link
                      key={e.slug}
                      href={`/events/${e.slug}`}
                      className="pixel-card pixel-hover group flex flex-col p-5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`pixel-tag ${e.status === "upcoming" ? "!bg-yellow text-ink" : "!bg-panel"}`}
                        >
                          {e.status === "upcoming" ? "Upcoming" : "Past"}
                        </span>
                        <span className="font-mono text-xs text-paper/55">{formatDate(e.date)}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold leading-tight">
                        {e.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Projects they lead */}
            {member.ledProjects.length > 0 && (
              <div className="mt-12">
                <SectionHeading eyebrow="In the open" title="Projects they lead.">
                  Software {member.name.split(" ")[0]} ships with DSEC.
                </SectionHeading>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {member.ledProjects.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/projects/${p.slug}`}
                      className="pixel-card pixel-hover group flex flex-col p-5"
                    >
                      <h3 className="font-display text-lg font-bold leading-tight">{p.title}</h3>
                      {p.summary && (
                        <p className="mt-2 line-clamp-3 text-sm leading-snug text-paper/70">
                          {p.summary}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
