import { type Lead, type MediaItem, type Speaker, type SponsorBrand } from "@/lib/content";
import { PixelDuck } from "@/components/pixel-duck";

/* ---------- Banner: wide hero across the top of a detail page ----------
   When there's no banner image, render nothing at all — the page just starts
   at the content below (no placeholder band). */
export function Banner({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden border-b-[3px] border-paper sm:aspect-[5/2] md:aspect-[3/1]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

/* ---------- Poster: portrait key art in the side rail ---------- */
export function Poster({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div className="grid aspect-[3/4] w-full place-items-center border-[3px] border-paper bg-panel-2 shadow-[4px_4px_0_0_var(--color-paper)]">
        <div className="flex flex-col items-center gap-2 p-6 text-center text-paper/55">
          <PixelDuck name="icon-floppy" alt="" size={72} />
          <span className="font-mono text-xs font-bold uppercase tracking-wide">
            no poster yet
          </span>
        </div>
      </div>
    );
  }
  return (
    <figure className="border-[3px] border-paper bg-panel shadow-[4px_4px_0_0_var(--color-paper)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="aspect-[3/4] w-full object-cover" />
    </figure>
  );
}

/* ---------- Speakers: headshot + name + title grid ---------- */
export function Speakers({ speakers }: { speakers: Speaker[] }) {
  if (!speakers.length) return null;
  return (
    <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {speakers.map((s, i) => (
        <div key={`${s.name}-${i}`} className="pixel-card p-4 text-center">
          <div className="mx-auto aspect-square w-full max-w-[160px] overflow-hidden border-[3px] border-paper bg-panel-2">
            {s.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.photo} alt={s.name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center">
                <PixelDuck name="duck-laptop" alt="" size={72} />
              </div>
            )}
          </div>
          <h3 className="mt-3 font-display text-lg font-bold leading-tight">{s.name}</h3>
          {s.title && <p className="font-mono text-xs text-paper/60">{s.title}</p>}
          {s.bio && <p className="mt-1 text-sm text-paper/75">{s.bio}</p>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Lead: a single-person byline (avatar + name + role) ----------
   Credits the event lead / project lead on a detail page. Falls back to the
   mascot sprite when the person hasn't uploaded a headshot. */
export function LeadBadge({ lead, label }: { lead: Lead; label: string }) {
  return (
    <div className="inline-flex items-center gap-3 border-[3px] border-paper bg-panel p-2.5 pr-4 shadow-[4px_4px_0_0_var(--color-paper)]">
      <div className="size-12 shrink-0 overflow-hidden border-[3px] border-paper bg-panel-2">
        {lead.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={lead.photo} alt={lead.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full place-items-center">
            <PixelDuck name="duck-mascot" alt="" size={32} />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-paper/50">
          {label}
        </div>
        <div className="truncate font-display text-base font-bold leading-tight">{lead.name}</div>
        {lead.role && <div className="truncate font-mono text-xs text-paper/60">{lead.role}</div>}
      </div>
    </div>
  );
}

/* ---------- Sponsor logos: a wall/strip of brand logos on white cards ----------
   White card so any (transparent) logo reads on the dark theme; falls back to
   the brand name when no logo is uploaded. `center` is used on the sponsor page
   wall; the event page uses the default left-aligned strip. */
function SponsorLogo({ sponsor }: { sponsor: SponsorBrand }) {
  const box = (
    <div className="grid h-20 min-w-[150px] place-items-center border-[3px] border-paper bg-paper px-5 shadow-[4px_4px_0_0_var(--color-paper)]">
      {sponsor.logo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={sponsor.logo} alt={sponsor.name} className="max-h-12 w-auto object-contain" />
      ) : (
        <span className="font-display text-lg font-bold text-ink">{sponsor.name}</span>
      )}
    </div>
  );
  return sponsor.website ? (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noreferrer noopener"
      className="pixel-hover block"
      title={sponsor.name}
    >
      {box}
    </a>
  ) : (
    box
  );
}

export function SponsorLogos({
  sponsors,
  center = false,
}: {
  sponsors: SponsorBrand[];
  center?: boolean;
}) {
  if (!sponsors.length) return null;
  return (
    <div className={`stagger flex flex-wrap items-center gap-5 ${center ? "justify-center" : ""}`}>
      {sponsors.map((s, i) => (
        <SponsorLogo key={`${s.name}-${i}`} sponsor={s} />
      ))}
    </div>
  );
}

/* ---------- Gallery: grid of any extra images, each opens full-res (PNG) ---------- */
export function Gallery({
  items,
  emptyLabel = "No photos yet",
  emptyHint = "Photos and other content will appear here once they're added.",
}: {
  items: MediaItem[];
  emptyLabel?: string;
  emptyHint?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="pixel-card flex flex-col items-center gap-3 p-8 text-center sm:p-12">
        <PixelDuck name="icon-star" alt="" size={96} />
        <span className="pixel-tag !bg-yellow text-ink">● {emptyLabel}</span>
        <p className="max-w-md text-paper/70 text-balance">{emptyHint}</p>
      </div>
    );
  }
  return (
    <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-3">
      {items.map((m, i) => (
        <a
          key={`${m.webp}-${i}`}
          href={m.png}
          target="_blank"
          rel="noreferrer noopener"
          className="pixel-card pixel-hover group block overflow-hidden p-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.webp}
            alt={m.alt ?? ""}
            className="aspect-square w-full object-cover transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-105"
          />
        </a>
      ))}
    </div>
  );
}
