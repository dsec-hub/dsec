import Link from "next/link";
import { accentBg, ticketPriceSummary, type Project, type ClubEvent } from "@/lib/content";
import { PixelDuck, type DuckName } from "@/components/pixel-duck";

/* ---------- Section heading ---------- */
export function SectionHeading({
  eyebrow,
  title,
  children,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-3 font-display text-[2rem] font-bold leading-[1.05] text-balance sm:text-[2.9rem]">
        {title}
      </h2>
      {children && (
        <p className="mt-3 text-lg text-paper/75 text-balance">{children}</p>
      )}
    </div>
  );
}

/* ---------- Stat tile ---------- */
export function Stat({
  value,
  label,
  note,
  accent = "yellow",
}: {
  value: string;
  label: string;
  note?: string;
  accent?: "blue" | "pink" | "yellow" | "mint";
}) {
  return (
    <div className="pixel-card pixel-hover group p-5">
      <div
        className={`mb-2 h-2 w-10 transition-[width] duration-300 ease-[var(--ease-out-strong)] group-hover:w-16 ${accentBg[accent]}`}
      />
      <div className="font-display text-4xl font-bold leading-none sm:text-[3.4rem]">
        {value}
      </div>
      <div className="mt-2 font-mono text-sm font-bold uppercase tracking-wide">
        {label}
      </div>
      {note && <div className="mt-1 text-sm text-paper/60">{note}</div>}
    </div>
  );
}

/* ---------- Coming soon (temporary stand-in while content is wired up) ---------- */
export function ComingSoon({
  label,
  title,
  duck = "duck-laptop",
  children,
}: {
  label: string;
  title: string;
  duck?: DuckName;
  children?: React.ReactNode;
}) {
  return (
    <div className="pixel-card flex flex-col items-center gap-4 p-8 text-center sm:p-12">
      <PixelDuck name={duck} alt="" size={140} bob />
      <span className="pixel-tag !bg-yellow text-ink">● {label}</span>
      <h3 className="font-display text-2xl font-bold text-balance sm:text-3xl">
        {title}
      </h3>
      {children && (
        <p className="max-w-md text-paper/75 text-balance">{children}</p>
      )}
    </div>
  );
}

/* ---------- Shared content card ----------
   ONE card style for both events and projects, used on the home, events,
   projects and sponsor pages. The whole card links to its detail page via an
   accessible stretched-link (the title's `after:absolute inset-0` overlay);
   footer actions sit above it with `relative z-10` so they stay clickable. */

type CardAction = { label: string; href: string; tone: "blue" | "pink" | "mint"; external?: boolean };

const actionTone: Record<CardAction["tone"], string> = {
  blue: "text-blue",
  pink: "text-pink",
  mint: "text-mint",
};

export function ContentCard({
  href,
  title,
  blurb,
  accent,
  imageUrl,
  sprite,
  spriteBob = false,
  badge,
  meta,
  outcome,
  tags,
  actions,
}: {
  href: string;
  title: string;
  blurb?: string;
  accent: "blue" | "pink" | "yellow" | "mint";
  imageUrl?: string;
  sprite: DuckName;
  spriteBob?: boolean;
  badge?: { text: string; className?: string };
  meta?: string;
  outcome?: string;
  tags?: string[];
  actions?: CardAction[];
}) {
  const acts = (actions ?? []).filter(Boolean);
  return (
    <article className="pixel-card pixel-hover group relative flex flex-col overflow-hidden">
      <div className="relative border-b-[3px] border-paper">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="aspect-video w-full object-cover transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-105"
          />
        ) : (
          <div className={`grid aspect-video place-items-center ${accentBg[accent]} px-6`}>
            <PixelDuck
              name={sprite}
              alt=""
              size={120}
              bob={spriteBob}
              className="drop-shadow-[3px_3px_0_rgba(24,20,37,0.25)] transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-110"
            />
          </div>
        )}
        {badge && (
          <span className={`pixel-tag absolute left-3 top-3 !bg-panel ${badge.className ?? ""}`}>
            {badge.text}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {meta && <p className="font-mono text-xs text-paper/60">{meta}</p>}
        <h3 className="mt-1 font-display text-2xl font-bold">
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {title}
          </Link>
        </h3>
        {blurb && <p className="mt-1.5 text-paper/75">{blurb}</p>}
        {outcome && (
          <p className="mt-3 inline-block border-l-4 border-yellow bg-yellow/15 px-3 py-1.5 font-mono text-sm font-bold">
            {outcome}
          </p>
        )}
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="pixel-tag !text-[0.65rem]">
                {t}
              </span>
            ))}
          </div>
        )}
        {acts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4 border-t-[2px] border-dashed border-paper/30 pt-4">
            {acts.map((a) =>
              a.external ? (
                <a
                  key={a.label}
                  href={a.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`relative z-10 inline-block font-mono text-sm font-bold transition-transform duration-150 hover:-translate-y-0.5 hover:underline ${actionTone[a.tone]}`}
                >
                  {a.label}
                </a>
              ) : (
                <Link
                  key={a.label}
                  href={a.href}
                  className={`relative z-10 inline-block font-mono text-sm font-bold transition-transform duration-150 hover:-translate-y-0.5 hover:underline ${actionTone[a.tone]}`}
                >
                  {a.label}
                </Link>
              ),
            )}
          </div>
        )}
      </div>
    </article>
  );
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/* ---------- Project card (wraps ContentCard) ---------- */
export function ProjectCard({ project }: { project: Project }) {
  const actions: CardAction[] = [];
  if (project.repo) actions.push({ label: "repo ↗", href: project.repo, tone: "blue", external: true });
  if (project.live) actions.push({ label: "live ↗", href: project.live, tone: "pink", external: true });
  return (
    <ContentCard
      href={`/projects/${project.slug}`}
      title={project.title}
      blurb={project.blurb}
      accent={project.accent}
      imageUrl={project.imageUrl}
      sprite={project.image}
      badge={{ text: project.slug }}
      meta={project.builtBy ? `built by ${project.builtBy}` : undefined}
      tags={project.stack}
      actions={actions}
    />
  );
}

/* ---------- Event card (wraps ContentCard) ---------- */
export function EventCard({ event }: { event: ClubEvent }) {
  const isUpcoming = event.status === "upcoming";
  // Ticketing is only meaningful while upcoming — past events never link out.
  const ticket = isUpcoming ? event.ticketUrl ?? event.registerUrl : undefined;
  const actions: CardAction[] = [];
  if (ticket) {
    actions.push({
      label: "Get tickets ↗",
      href: ticket,
      tone: "pink",
      external: isExternal(ticket),
    });
  }
  // Compact chips: ticket pricing (upcoming only) + catering.
  const tags: string[] = [];
  const price = isUpcoming ? ticketPriceSummary(event.ticketTiers) : null;
  if (price) tags.push(price === "Free" ? "Free entry" : `Tickets ${price}`);
  if (event.foodIncluded) tags.push("🍕 Food included");
  return (
    <ContentCard
      href={`/events/${event.slug}`}
      title={event.title}
      blurb={event.blurb}
      accent={event.accent}
      imageUrl={event.imageUrl}
      sprite={event.image}
      spriteBob={isUpcoming}
      badge={{
        text: isUpcoming ? "● upcoming" : "✓ past",
        className: isUpcoming ? "!bg-mint !text-ink" : "",
      }}
      meta={event.date}
      outcome={event.outcome}
      tags={tags.length ? tags : undefined}
      actions={actions}
    />
  );
}
