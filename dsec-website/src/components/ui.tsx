import Link from "next/link";
import { accentBg, type Project, type ClubEvent } from "@/lib/content";
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

/* ---------- Project card ---------- */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="pixel-card pixel-hover group flex flex-col overflow-hidden">
      <div
        className={`relative grid place-items-center border-b-[3px] border-paper ${accentBg[project.accent]} px-6 py-8`}
      >
        <PixelDuck
          name={project.image}
          alt=""
          size={120}
          className="drop-shadow-[3px_3px_0_rgba(24,20,37,0.25)] transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-110"
        />
        <span className="pixel-tag absolute left-3 top-3 !bg-panel">
          {project.slug}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-2xl font-bold">{project.title}</h3>
        <p className="mt-1.5 text-paper/75">{project.blurb}</p>
        <p className="mt-3 font-mono text-xs text-paper/55">
          built by {project.builtBy}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((t) => (
            <span key={t} className="pixel-tag !text-[0.65rem]">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex gap-3 border-t-[2px] border-dashed border-paper/30 pt-4">
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block font-mono text-sm font-bold text-blue transition-transform duration-150 hover:-translate-y-0.5 hover:underline"
            >
              repo ↗
            </a>
          )}
          {project.live && (
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block font-mono text-sm font-bold text-pink transition-transform duration-150 hover:-translate-y-0.5 hover:underline"
            >
              live ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

/* ---------- Event card ---------- */
export function EventCard({ event }: { event: ClubEvent }) {
  const isUpcoming = event.status === "upcoming";
  return (
    <article className="pixel-card pixel-hover group flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
      <div
        className={`grid w-full shrink-0 place-items-center border-[3px] border-paper ${accentBg[event.accent]} p-4 sm:w-36`}
      >
        <PixelDuck
          name={event.image}
          alt=""
          size={96}
          bob={isUpcoming}
          className="transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-110"
        />
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`pixel-tag ${isUpcoming ? "!bg-mint text-ink" : "!bg-panel-2"}`}
          >
            {isUpcoming ? "● upcoming" : "✓ past"}
          </span>
          <span className="font-mono text-xs text-paper/60">{event.date}</span>
        </div>
        <h3 className="mt-2 font-display text-2xl font-bold">{event.title}</h3>
        <p className="mt-1.5 text-paper/75">{event.blurb}</p>
        {event.outcome && (
          <p className="mt-3 inline-block border-l-4 border-yellow bg-yellow/15 px-3 py-1.5 font-mono text-sm font-bold">
            {event.outcome}
          </p>
        )}
        {isUpcoming && event.registerUrl && (
          <div className="mt-4">
            <Link href={event.registerUrl} className="btn btn-pink !py-2.5 !text-sm">
              Register for {event.title}
            </Link>
          </div>
        )}
      </div>
    </article>
  );
}
