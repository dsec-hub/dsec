import type { Metadata } from "next";
import { getScanWall, getSocials } from "@/lib/api";
import { DEFAULT_SCAN_PAGE, site } from "@/lib/content";
import { qrSvg } from "@/lib/qr";
import { ScanGrid, type ScanTarget } from "./scan-client";

export const metadata: Metadata = {
  title: "Scan to connect with DSEC",
  description:
    "Point your camera and you're in. DSEC website, Instagram, Discord and how to join, built to put up on a screen at events.",
  alternates: { canonical: "/scan" },
  openGraph: {
    title: "Scan to connect with DSEC",
    description:
      "Website, Instagram, Discord and join, all one camera-scan away.",
    url: "/scan",
    type: "website",
  },
};

export default async function ScanPage() {
  // The wall is committee-curated via dsec-hub: an editable heading (title +
  // description) plus the visible QR cards from the API. We then auto-append the
  // club's Instagram + Discord from the socials feed (single source of truth) so
  // those handles never drift and never need re-entering here. If the API is
  // unreachable, the heading falls back to its default copy and only the socials
  // cards show.
  const [wall, socials] = await Promise.all([getScanWall(), getSocials()]);

  const title = wall?.title ?? DEFAULT_SCAN_PAGE.title;
  const description = wall?.description ?? DEFAULT_SCAN_PAGE.description;
  const targets = wall?.cards ?? [];

  const have = new Set(targets.map((t) => t.label.toLowerCase()));
  const autoCards: ScanTarget[] = [];
  if (socials.instagram && !have.has("instagram")) {
    autoCards.push({
      label: "Instagram",
      caption: "Photos from every event",
      href: socials.instagram,
      pretty: "@dsec",
      accent: "pink",
    });
  }
  if (socials.discord && !have.has("discord")) {
    autoCards.push({
      label: "Discord",
      caption: "Where it all actually happens",
      href: socials.discord,
      pretty: "the DSEC server",
      accent: "mint",
    });
  }
  const allTargets = [...targets, ...autoCards];

  // Generated per request but cached with the feeds - effectively static.
  const cards = await Promise.all(
    allTargets.map(async (target) => ({ target, svg: await qrSvg(target.href) })),
  );

  return (
    <section className="relative overflow-hidden">
      {/* Live party scene - sits BEHIND the content as an animated backdrop so
          the screen never feels static when this page is up on a display at an
          event. Anchored to the bottom and shown at natural aspect, so the duck
          crowd rises up behind the QR grid. Its own treatment, nothing shared
          with the homepage hero. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 flex items-end"
      >
        <video
          width={1280}
          height={350}
          autoPlay
          loop
          muted
          playsInline
          poster="/pixel/hero-party-loop-poster.webp"
          aria-label="Pixel-art scene of DSEC ducks chatting and coding"
          className="pixelated block h-auto w-full select-none"
        >
          <source src="/pixel/hero-party-loop.webm" type="video/webm" />
          <source src="/pixel/hero-party-loop.mp4" type="video/mp4" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/pixel/hero-party-loop.gif"
            alt=""
            className="pixelated block h-auto w-full select-none"
          />
        </video>
      </div>

      {/* Soft scrim - keeps the heading + footnote legible where they overlap
          the ducks, without washing the scene out. */}
      <div
        aria-hidden
        className="absolute inset-0 z-0 bg-gradient-to-b from-bg via-bg/55 to-bg/15"
      />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="eyebrow">Scan to connect · DSEC</p>
        <h1 className="mx-auto mt-3 max-w-3xl font-display text-3xl font-bold leading-tight text-3d sm:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-paper/70">
          {description}
        </p>

        <div className="mt-10">
          <ScanGrid cards={cards} />
        </div>

        <p className="mt-10 font-mono text-xs text-paper/60">
          no app to download · just your phone camera · {site.campus}
        </p>
      </div>
    </section>
  );
}
