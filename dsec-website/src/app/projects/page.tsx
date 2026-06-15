import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard, SectionHeading, ComingSoon } from "@/components/ui";
import { PixelDuck } from "@/components/pixel-duck";
import { getProjects } from "@/lib/api";

export const metadata: Metadata = {
  title: "Projects - Real Software by DSEC Members",
  description:
    "Real software built by DSEC members, with repos, stacks and the people who shipped them.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "DSEC Projects - Real Software by Deakin Students",
    description:
      "Not coursework, not tutorials. Software DSEC members chose to build, with repos and stacks.",
    url: "/projects",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSEC Projects - Real Software by Deakin Students",
    description: "Software DSEC members chose to build, with real repos and stacks.",
  },
};

export default async function ProjectsPage() {
  const projects = await getProjects();
  const showContent = projects.length > 0;

  return (
    <div>
      <section className="border-b-[3px] border-paper bg-mint text-ink">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 py-14 sm:px-6 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <p className="eyebrow !text-ink/70">git log --oneline</p>
            <h1 className="mt-2 font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
              Things our members shipped.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-ink/80">
              Not coursework, not tutorials. This is software members chose to
              build, the proof for students deciding to join and companies
              deciding to sponsor.
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PixelDuck name="duck-laptop" alt="" size={400} priority bob />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* TEMP: project cards hidden while the projects API is wired up.
            Restore the grid below (and remove the ComingSoon) once populated. */}
        {showContent ? (
          <div className="stagger grid gap-5 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        ) : (
          <ComingSoon
            label="updating soon"
            title="Member projects are being added soon."
            duck="duck-laptop"
          >
            We&apos;re hooking up the projects feed right now. The repos, stacks
            and the people who shipped them will show up here shortly.
          </ComingSoon>
        )}

        <div className="mt-8 border-[3px] border-paper bg-panel p-5 shadow-[4px_4px_0_0_var(--color-blue)] sm:flex sm:items-center sm:justify-between sm:gap-6">
          <p className="text-paper/80">
            Most of these start at{" "}
            <Link href="/events" className="font-bold text-blue hover:underline">
              our hackathons and ship nights
            </Link>
            . Companies can put their brand on that work.
          </p>
          <Link
            href="/sponsor"
            className="btn btn-ghost group mt-4 !py-2.5 !text-sm sm:mt-0 sm:shrink-0"
          >
            Sponsorship options{" "}
            <span className="transition-transform duration-150 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </section>

      {/* Build-with-us nudge - single CTA, student-facing on this page */}
      <section className="border-t-[3px] border-paper bg-panel-2">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
          <SectionHeading
            title="Your project could be next on this page."
            className="mx-auto text-center"
          >
            Bring an idea or borrow one of ours. We&apos;ll help you ship it.
          </SectionHeading>
          <div className="mt-6">
            <Link href="/join" className="btn btn-pink">
              Join now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
