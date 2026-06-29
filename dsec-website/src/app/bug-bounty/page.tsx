import type { Metadata } from "next";
import { qrSvg } from "@/lib/qr";

const BOUNTY_URL = "https://bug.dsec.club";

export const metadata: Metadata = {
  title: "Bug Bounty",
  description:
    "Found a security bug in DSEC? Scan the code or head to bug.dsec.club to report it.",
  alternates: { canonical: "/bug-bounty" },
  openGraph: {
    title: "Bug Bounty · DSEC",
    description: "Found a security bug in DSEC? Report it at bug.dsec.club.",
    url: "/bug-bounty",
    type: "website",
  },
};

export default async function BugBountyPage() {
  // Vector QR generated at build (statically prerendered) — no network call.
  const svg = await qrSvg(BOUNTY_URL);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 py-16 text-center sm:px-6 sm:py-24 md:flex-row md:gap-14 md:text-left">
      <div className="flex flex-col items-center md:items-start">
        <p className="eyebrow">Security · DSEC</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-3d sm:text-6xl">
          Bug <span className="text-yellow">Bounty</span>
        </h1>
        <p className="mt-5 max-w-md text-lg text-paper/80">
          Spotted a security bug in anything DSEC runs? Scan the code or head to{" "}
          <span className="font-mono text-paper">bug.dsec.club</span> to report it
          — responsible disclosure, no drama.
        </p>

        <div className="mt-8">
          <a
            href={BOUNTY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="btn btn-pink !px-7 !py-4 !text-lg"
          >
            Open bug.dsec.club ↗
          </a>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-3">
        <div
          role="img"
          aria-label="QR code linking to bug.dsec.club"
          className="h-56 w-56 select-none border-[3px] border-paper bg-paper p-3 shadow-[8px_8px_0_0_var(--color-pink)] [&>svg]:h-full [&>svg]:w-full sm:h-64 sm:w-64"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <p className="font-mono text-xs text-paper/55">scan to report a bug</p>
      </div>
    </section>
  );
}
