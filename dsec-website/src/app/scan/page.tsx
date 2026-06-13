import type { Metadata } from "next";
import { site } from "@/lib/content";
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

const targets: ScanTarget[] = [
  {
    label: "Website",
    caption: "See what we're building",
    href: "https://dsec.club",
    pretty: "dsec.club",
    accent: "blue",
  },
  {
    label: "Instagram",
    caption: "Photos from every event",
    href: site.instagram,
    pretty: "@dsec",
    accent: "pink",
  },
  {
    label: "Discord",
    caption: "Where it all actually happens",
    href: site.discord,
    pretty: "the DSEC server",
    accent: "mint",
  },
  {
    label: "Join the club",
    caption: "One click, no application",
    href: "https://dsec.club/join",
    pretty: "dsec.club/join",
    accent: "yellow",
  },
];

export default async function ScanPage() {
  // Generated once at build time - static, no runtime/network dependency.
  const cards = await Promise.all(
    targets.map(async (target) => ({ target, svg: await qrSvg(target.href) })),
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
          Point your camera.{" "}
          <span className="text-yellow">You&apos;re basically in.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base text-paper/70">
          DSEC is Deakin&apos;s project-led software club. Scan any code below.
          No app to install, just your phone.
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
