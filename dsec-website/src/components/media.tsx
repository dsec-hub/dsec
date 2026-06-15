import { type MediaItem } from "@/lib/content";
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
