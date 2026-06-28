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

/* ---------- Sponsor logos: full-colour brand marks, no card ----------
   The marks sit straight on the dark theme (no paper card, no border), so an
   uploaded logo should be a transparent PNG that reads on near-black — use the
   light/white variant for any dark wordmark. Falls back to the brand name when
   no logo is uploaded. Rendered two ways by `SponsorLogos`: a scrolling marquee
   on the sponsor / partner walls, and a static strip on event pages. */
function SponsorLogo({ sponsor }: { sponsor: SponsorBrand }) {
  const content = sponsor.logo ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={sponsor.logo}
      alt={sponsor.name}
      className="h-9 w-auto max-w-[180px] object-contain sm:h-11"
    />
  ) : (
    <span className="font-display text-lg font-bold text-paper/80">{sponsor.name}</span>
  );
  const cls =
    "grid h-12 shrink-0 place-items-center px-2 opacity-85 transition-opacity duration-200 hover:opacity-100";
  return sponsor.website ? (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noreferrer noopener"
      className={cls}
      title={sponsor.name}
    >
      {content}
    </a>
  ) : (
    <span className={cls}>{content}</span>
  );
}

export function SponsorLogos({
  sponsors,
  center = false,
  marquee = false,
}: {
  sponsors: SponsorBrand[];
  center?: boolean;
  marquee?: boolean;
}) {
  if (!sponsors.length) return null;

  /* Scrolling marquee for the sponsor / partner walls. The track holds three
     copies of the strip and slides by exactly one-third (see @keyframes marquee),
     so the loop is seamless; it pauses on hover and honours reduced-motion. Only
     worth it once there are enough logos to fill the row — otherwise we drop
     through to the static strip so two logos don't slide past awkwardly. */
  if (marquee && sponsors.length >= 3) {
    const mask =
      "linear-gradient(to right, transparent, #000 7%, #000 93%, transparent)";
    return (
      <div
        className="group relative overflow-hidden py-2"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      >
        <div className="flex w-max items-center gap-12 animate-[marquee_34s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none sm:gap-20">
          {[0, 1, 2].map((copy) =>
            sponsors.map((s, i) => (
              <SponsorLogo key={`${copy}-${s.name}-${i}`} sponsor={s} />
            )),
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`stagger flex flex-wrap items-center gap-8 ${center ? "justify-center" : ""}`}
    >
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
