/**
 * Renderer for committee-authored custom pages (`dsec.club/<slug>`).
 *
 * Takes the canonical `Block[]` (see `@/lib/page-blocks`, the shared contract)
 * and renders each of the 15 block types using ONLY the site's existing pixel/
 * duck design system — the same tokens, `.pixel-card`, `.btn`, `.eyebrow` and
 * shared components (`Banner`, `Gallery`, `SponsorLogos`, `Markdown`,
 * `SectionHeading`, `Stat`) the rest of the marketing site is built from. Nothing
 * here hardcodes a colour or shadow.
 *
 * Server component: pure render, no client state (the `<details>` FAQ accordion
 * works without JS).
 */

import { Banner, Gallery, SponsorLogos } from "@/components/media";
import { Markdown } from "@/components/markdown";
import { SectionHeading, Stat } from "@/components/ui";
import type { MediaItem, SponsorBrand } from "@/lib/content";
import type {
  Accent,
  Block,
  CardItem,
  ImageRef,
  PageButton,
} from "@/lib/page-blocks";

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Map a block `ImageRef` onto the `MediaItem` shape Gallery/Banner expect. The
 *  full-res `png` falls back to the display `webp` when no download was stored. */
function toMediaItem(img: ImageRef, role: MediaItem["role"] = "image"): MediaItem {
  return {
    role,
    webp: img.webp,
    png: img.png ?? img.webp,
    alt: img.alt,
    width: img.width,
    height: img.height,
  };
}

/** All 8 brand accents → their Tailwind bg utility (literals so JIT can scan them). */
const accentBar: Record<Accent, string> = {
  blue: "bg-blue",
  pink: "bg-pink",
  yellow: "bg-yellow",
  mint: "bg-mint",
  sky: "bg-sky",
  violet: "bg-violet",
  lime: "bg-lime",
  coral: "bg-coral",
};

/** `Stat` only themes the 4 core accents; clamp the wider palette onto them. */
function statAccent(a?: Accent): "blue" | "pink" | "yellow" | "mint" {
  return a === "blue" || a === "pink" || a === "yellow" || a === "mint" ? a : "yellow";
}

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/** Shared horizontal frame every block sits inside. */
function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-6xl px-4 sm:px-6", className)}>{children}</div>
  );
}

/** A row of page buttons, mapped to the `.btn` variants. */
function Buttons({ buttons, className }: { buttons?: PageButton[]; className?: string }) {
  const list = (buttons ?? []).filter((b) => b.label && b.href);
  if (!list.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {list.map((b, i) => {
        const variant = b.variant ?? "pink";
        const external = isExternal(b.href);
        return (
          <a
            key={i}
            href={b.href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer noopener" : undefined}
            className={`btn btn-${variant} !text-sm`}
          >
            {b.label}
            {external && " ↗"}
          </a>
        );
      })}
    </div>
  );
}

/** Grid-column class for a clamped 2–4 count (literal classes for the JIT). */
function colClass(n?: number): string {
  const c = Math.min(Math.max(n ?? 3, 2), 4);
  return c === 2 ? "lg:grid-cols-2" : c === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";
}

/** One feature card (optionally a whole-card link). */
function Card({ card }: { card: CardItem }) {
  const accent = card.accent ?? "blue";
  const inner = (
    <article className="pixel-card pixel-hover group relative flex h-full flex-col overflow-hidden">
      {card.image?.webp ? (
        <div className="border-b-[3px] border-paper">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.image.webp}
            alt={card.image.alt ?? card.title ?? ""}
            className="aspect-video w-full object-cover transition-transform duration-200 ease-[var(--ease-out-strong)] group-hover:scale-105"
          />
        </div>
      ) : (
        <div className={cn("h-2 w-full", accentBar[accent])} />
      )}
      <div className="flex flex-1 flex-col p-5">
        {card.title && <h3 className="font-display text-xl font-bold">{card.title}</h3>}
        {card.body && <p className="mt-1.5 text-paper/75">{card.body}</p>}
        {card.href && (
          <span className="mt-3 font-mono text-sm font-bold text-pink">
            Learn more →
          </span>
        )}
      </div>
    </article>
  );
  if (!card.href) return inner;
  const external = isExternal(card.href);
  return (
    <a
      href={card.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer noopener" : undefined}
      className="block h-full"
    >
      {inner}
    </a>
  );
}

/* ---------- Video embeds: normalise provider URLs to an embeddable src ---------- */

function youtubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{6,})/,
  );
  if (m) return m[1];
  return /^[\w-]{6,}$/.test(url.trim()) ? url.trim() : null;
}

function vimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return m[1];
  return /^\d+$/.test(url.trim()) ? url.trim() : null;
}

function embedSrc(provider: string | undefined, url: string): string | null {
  const u = url.trim();
  if (!u) return null;
  if (provider === "youtube") {
    const id = youtubeId(u);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (provider === "vimeo") {
    const id = vimeoId(u);
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return u; // raw iframe
}

/* ---------- Block dispatch ---------- */

function renderBlock(block: Block): React.ReactNode {
  switch (block.type) {
    case "hero": {
      const centered = block.align === "center";
      const showBanner = block.variant !== "plain" && !!block.image?.webp;
      return (
        <section>
          {showBanner && (
            <Banner src={block.image!.webp} alt={block.image!.alt ?? block.title ?? ""} />
          )}
          <Container className={showBanner ? "pt-8" : ""}>
            <div
              className={cn(
                "flex flex-col gap-5",
                centered ? "items-center text-center" : "items-start text-left",
              )}
            >
              {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
              {block.title && (
                <h1 className="font-display text-4xl font-bold leading-[1.05] text-balance sm:text-5xl">
                  {block.title}
                </h1>
              )}
              {block.subtitle && (
                <p
                  className={cn(
                    "max-w-2xl text-lg text-paper/80",
                    centered && "mx-auto",
                  )}
                >
                  {block.subtitle}
                </p>
              )}
              <Buttons buttons={block.buttons} className={centered ? "justify-center" : ""} />
            </div>
          </Container>
        </section>
      );
    }

    case "heading":
      return (
        <Container>
          <div className={block.align === "center" ? "mx-auto text-center" : ""}>
            <SectionHeading
              eyebrow={block.eyebrow}
              title={block.title ?? ""}
              className={block.align === "center" ? "mx-auto" : ""}
            >
              {block.subtitle}
            </SectionHeading>
          </div>
        </Container>
      );

    case "richtext":
      return (
        <Container>
          <div className="max-w-3xl text-lg">
            <Markdown content={block.markdown ?? ""} />
          </div>
        </Container>
      );

    case "quote":
      return (
        <Container>
          <figure className="max-w-3xl border-l-4 border-yellow pl-5">
            <blockquote className="font-display text-2xl font-bold leading-snug text-balance sm:text-3xl">
              {block.text}
            </blockquote>
            {block.attribution && (
              <figcaption className="mt-3 font-mono text-sm text-paper/60">
                — {block.attribution}
              </figcaption>
            )}
          </figure>
        </Container>
      );

    case "image": {
      if (!block.image?.webp) return null;
      if (block.width === "full") {
        return (
          <section>
            <Banner src={block.image.webp} alt={block.image.alt ?? ""} />
            {block.caption && (
              <Container className="pt-2">
                <p className="font-mono text-sm text-paper/70">{block.caption}</p>
              </Container>
            )}
          </section>
        );
      }
      const max = block.width === "inset" ? "max-w-2xl" : "max-w-4xl";
      return (
        <Container>
          <figure className={cn("mx-auto", max)}>
            <div className="pixel-card overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={block.image.webp}
                alt={block.image.alt ?? ""}
                className="w-full"
              />
            </div>
            {block.caption && (
              <figcaption className="mt-2 font-mono text-sm text-paper/70">
                {block.caption}
              </figcaption>
            )}
          </figure>
        </Container>
      );
    }

    case "gallery": {
      const items = (block.images ?? [])
        .filter((im): im is ImageRef => !!im?.webp)
        .map((im) => toMediaItem(im));
      if (!items.length) return null;
      return (
        <Container>
          <Gallery items={items} />
        </Container>
      );
    }

    case "embed": {
      const src = embedSrc(block.provider, block.url ?? "");
      if (!src) return null;
      const ratio =
        block.ratio === "4:3"
          ? "aspect-[4/3]"
          : block.ratio === "1:1"
            ? "aspect-square"
            : "aspect-video";
      return (
        <Container>
          <figure className="mx-auto max-w-4xl">
            <div
              className={cn(
                "relative w-full overflow-hidden border-[3px] border-paper bg-void",
                ratio,
              )}
            >
              <iframe
                src={src}
                title={block.caption ?? "Embedded media"}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
            {block.caption && (
              <figcaption className="mt-2 font-mono text-sm text-paper/70">
                {block.caption}
              </figcaption>
            )}
          </figure>
        </Container>
      );
    }

    case "split": {
      const img = block.image?.webp ? (
        <div className="pixel-card overflow-hidden p-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.image.webp}
            alt={block.image.alt ?? block.title ?? ""}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null;
      const text = (
        <div className="flex flex-col justify-center gap-4">
          {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
          {block.title && (
            <h2 className="font-display text-3xl font-bold leading-tight text-balance sm:text-4xl">
              {block.title}
            </h2>
          )}
          {block.markdown && (
            <div className="text-lg">
              <Markdown content={block.markdown} />
            </div>
          )}
          <Buttons buttons={block.buttons} />
        </div>
      );
      const imageLeft = block.imageSide === "left";
      return (
        <Container>
          <div className="grid items-stretch gap-8 md:grid-cols-2">
            {imageLeft ? (
              <>
                {img}
                {text}
              </>
            ) : (
              <>
                {text}
                {img}
              </>
            )}
          </div>
        </Container>
      );
    }

    case "columns": {
      const cols = (block.columns ?? []).filter((c) => c?.markdown);
      if (!cols.length) return null;
      return (
        <Container>
          <div className={cn("grid gap-8 sm:grid-cols-2", colClass(cols.length))}>
            {cols.map((c, i) => (
              <div key={i} className="text-base">
                <Markdown content={c.markdown ?? ""} />
              </div>
            ))}
          </div>
        </Container>
      );
    }

    case "cards": {
      const cards = (block.cards ?? []).filter(
        (c) => c.title || c.body || c.image?.webp,
      );
      if (!cards.length && !block.title) return null;
      return (
        <Container>
          {(block.eyebrow || block.title) && (
            <div className="mb-8">
              <SectionHeading eyebrow={block.eyebrow} title={block.title ?? ""} />
            </div>
          )}
          <div className={cn("stagger grid gap-5 sm:grid-cols-2", colClass(block.columns))}>
            {cards.map((c, i) => (
              <Card key={i} card={c} />
            ))}
          </div>
        </Container>
      );
    }

    case "divider":
      if (block.variant === "space") return <div className="py-6" aria-hidden />;
      return (
        <Container>
          <hr className="border-t-[3px] border-paper/30" />
        </Container>
      );

    case "cta": {
      const centered = block.align !== "left";
      return (
        <Container>
          <div
            className={cn(
              "pixel-card-lg bg-panel p-8 sm:p-12",
              centered && "text-center",
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-4",
                centered ? "items-center" : "items-start",
              )}
            >
              {block.eyebrow && <p className="eyebrow">{block.eyebrow}</p>}
              {block.title && (
                <h2 className="font-display text-3xl font-bold text-balance sm:text-4xl">
                  {block.title}
                </h2>
              )}
              {block.body && (
                <p className="max-w-2xl text-lg text-paper/80">{block.body}</p>
              )}
              <Buttons
                buttons={block.buttons}
                className={centered ? "justify-center" : ""}
              />
            </div>
          </div>
        </Container>
      );
    }

    case "stats": {
      const items = (block.items ?? []).filter((s) => s.value || s.label);
      if (!items.length) return null;
      return (
        <Container>
          {(block.eyebrow || block.title) && (
            <div className="mb-8">
              <SectionHeading eyebrow={block.eyebrow} title={block.title ?? ""} />
            </div>
          )}
          <div className="stagger grid grid-cols-2 gap-4 sm:grid-cols-4">
            {items.map((s, i) => (
              <Stat
                key={i}
                value={s.value ?? ""}
                label={s.label ?? ""}
                accent={statAccent(s.accent)}
              />
            ))}
          </div>
        </Container>
      );
    }

    case "faq": {
      const items = (block.items ?? []).filter((it) => it.q || it.a);
      if (!items.length) return null;
      return (
        <Container>
          <div className="mx-auto max-w-3xl">
            {(block.eyebrow || block.title) && (
              <div className="mb-8">
                <SectionHeading eyebrow={block.eyebrow} title={block.title ?? ""} />
              </div>
            )}
            <div className="space-y-3">
              {items.map((it, i) => (
                <details
                  key={i}
                  className="group border-[3px] border-paper bg-panel p-4"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-bold">
                    <span>{it.q}</span>
                    <span className="font-mono text-paper/50 transition-transform duration-150 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="mt-3 text-paper/85">
                    <Markdown content={it.a} />
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Container>
      );
    }

    case "logos": {
      const sponsors: SponsorBrand[] = (block.items ?? [])
        .filter((it) => it.image?.webp || it.name)
        .map((it) => ({
          name: it.name ?? "",
          website: it.href,
          logo: it.image?.webp,
        }));
      if (!sponsors.length) return null;
      return (
        <Container>
          {(block.eyebrow || block.title) && (
            <div className="mb-8">
              <SectionHeading eyebrow={block.eyebrow} title={block.title ?? ""} />
            </div>
          )}
          <SponsorLogos sponsors={sponsors} marquee={block.marquee} center />
        </Container>
      );
    }
  }
}

/**
 * Render a custom page's block body as a vertically-rhythmic stack. Each block is
 * wrapped in a full-width row so full-bleed blocks (hero banner, full image)
 * still span the viewport while inner content stays inside the `Container`.
 */
export function PageBlocks({ blocks }: { blocks: Block[] }) {
  if (!blocks?.length) return null;
  return (
    <div className="space-y-14 py-10 sm:space-y-16">
      {blocks.map((b) => (
        <div key={b.id}>{renderBlock(b)}</div>
      ))}
    </div>
  );
}
