import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageBlocks } from "@/components/page-blocks";
import { getPage, getPages } from "@/lib/api";

/**
 * Committee-authored custom pages, served at the clean top-level URL
 * `dsec.club/<slug>`. Pages published at build time are prebuilt by
 * `generateStaticParams`; a page published LATER is rendered on-demand the first
 * time it's visited (`dynamicParams = true`) and then cached — so the committee
 * can publish without waiting for a redeploy. Unknown / reserved / unpublished
 * slugs still 404 via the RESERVED guard + `getPage()` returning null. The
 * `pages` cache tag (revalidated by the dashboard on publish/unpublish) keeps the
 * rendered output fresh.
 */
export const dynamicParams = true;

/**
 * Slugs a custom page can NEVER claim — every real top-level folder in
 * `src/app/` plus the spec's reserved set (`pages`, `preview`, `p`). The dsec-hub
 * editor refuses these too, but this is the website's own guard. Keep in sync if
 * a new top-level route is added.
 */
const RESERVED = new Set<string>([
  // Real top-level routes (folders in src/app/).
  "about",
  "api",
  "contact",
  "events",
  "heroes",
  "join",
  "links",
  "projects",
  "scan",
  "sponsor",
  "team",
  // Spec-reserved (route namespaces / short links).
  "pages",
  "preview",
  "p",
]);

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await getPages();
  return pages
    .filter((p) => p.slug && !RESERVED.has(p.slug))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (RESERVED.has(slug)) return {};
  const page = await getPage(slug);
  if (!page) return { title: "Page not found - DSEC" };

  const title = `${page.title} - DSEC`;
  const description = page.seoDescription || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title,
      description,
      url: `/${slug}`,
      type: "website",
      images: page.coverImage ? [page.coverImage] : undefined,
    },
  };
}

export default async function CustomPageRoute({ params }: Props) {
  const { slug } = await params;
  if (RESERVED.has(slug)) notFound();
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <div className="min-h-[40vh]">
      <PageBlocks blocks={page.blocks} />
    </div>
  );
}
