import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageBlocks } from "@/components/page-blocks";
import { getPagePreview } from "@/lib/api";

// A preview must always reflect the latest unpublished edit, so this route is
// never statically generated or cached — every load refetches the live draft.
export const dynamic = "force-dynamic";

// Preview links are unguessable and temporary, but belt-and-braces: keep them
// out of search engines entirely so a shared link can't get indexed.
export const metadata: Metadata = {
  title: "Page preview — DSEC",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ token: string }> };

export default async function PagePreviewRoute({ params }: Props) {
  const { token } = await params;
  const page = await getPagePreview(token);
  // Bad / expired token, or the page was archived/removed → 404, same as a
  // stranger guessing the URL. Drafts never leak without a valid link.
  if (!page) notFound();

  return (
    <>
      <PreviewBar />
      {/* Identical rendering to the live page — a preview is truly WYSIWYG. */}
      <PageBlocks blocks={page.blocks} />
    </>
  );
}

/** A loud, unmistakable banner so nobody confuses a preview for the live page. */
function PreviewBar() {
  return (
    <div className="border-b-[3px] border-ink bg-yellow text-ink">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 sm:px-6">
        <span className="pixel-tag !bg-ink !text-yellow">● Preview</span>
        <p className="font-mono text-xs font-bold sm:text-sm">
          Private preview of how this page will look once published.
        </p>
        <p className="font-mono text-[11px] text-ink/70">
          Not public · not indexed · this link expires.
        </p>
      </div>
    </div>
  );
}
