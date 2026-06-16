import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Banner, Poster, Gallery, LeadBadge } from "@/components/media";
import { Markdown } from "@/components/markdown";
import { SectionHeading } from "@/components/ui";
import { getProject, getProjects } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const projects = await getProjects();
  return (projects ?? []).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return { title: "Project not found - DSEC" };
  const title = `${project.title} - DSEC Project`;
  const description = project.blurb || project.description || `A project built by DSEC members: ${project.title}.`;
  return {
    title,
    description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      title,
      description,
      url: `/projects/${project.slug}`,
      type: "website",
      images: project.bannerUrl ? [project.bannerUrl] : project.imageUrl ? [project.imageUrl] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  return (
    <div>
      <Banner src={project.bannerUrl} alt={project.title} />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Link
          href="/projects"
          className="slide-link font-mono text-sm font-bold text-paper/60 hover:text-paper"
        >
          ← All projects
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-[300px_1fr]">
          {/* Side rail: poster + repo/live links */}
          <aside className="space-y-4">
            <Poster src={project.posterUrl} alt={`${project.title} poster`} />
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-pink w-full justify-center !text-sm"
              >
                View live ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="btn btn-ghost w-full justify-center !text-sm"
              >
                View repo ↗
              </a>
            )}
          </aside>

          {/* Main column */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="pixel-tag !bg-panel">{project.slug}</span>
              {project.status && (
                <span className="pixel-tag !bg-mint text-ink">{project.status}</span>
              )}
              {project.category && (
                <span className="font-mono text-xs text-paper/60">{project.category}</span>
              )}
            </div>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
              {project.title}
            </h1>
            {project.lead ? (
              <div className="mt-4">
                <LeadBadge lead={project.lead} label="Project lead" />
              </div>
            ) : (
              project.builtBy && (
                <p className="mt-2 font-mono text-sm text-paper/55">built by {project.builtBy}</p>
              )
            )}
            {project.blurb && project.blurb !== project.description && (
              <p className="mt-4 max-w-2xl text-lg text-paper/80">{project.blurb}</p>
            )}

            {project.stack.length > 0 && (
              <div className="mt-6">
                <p className="eyebrow">Built with</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <span key={t} className="pixel-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* About — free-form Markdown body, only when the project has one */}
        {project.description && (
          <div className="mt-14">
            <SectionHeading eyebrow="About" title="What we built.">
              The full story behind {project.title}.
            </SectionHeading>
            <div className="mt-6 max-w-3xl text-lg">
              <Markdown content={project.description} />
            </div>
          </div>
        )}

        {/* Gallery — screenshots / extra content, with its own empty state */}
        <div className="mt-14">
          <SectionHeading eyebrow="Gallery" title="A closer look.">
            Screenshots and content from {project.title}.
          </SectionHeading>
          <div className="mt-6">
            <Gallery
              items={project.gallery ?? []}
              emptyLabel="no screenshots yet"
              emptyHint="Screenshots and other content for this project will appear here once they're added."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
