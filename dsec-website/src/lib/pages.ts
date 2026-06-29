/**
 * Custom-page types for the public website renderer.
 *
 * A committee Document can be published as a public page at `dsec.club/<slug>`.
 * Its body is a list of canonical `Block`s (see `@/lib/page-blocks`). The server
 * feed (dsec-api `/website/pages*`) is the source of truth; the loaders that map
 * the API shape onto these types live in `@/lib/api` (server-only).
 *
 * Kept here (no `server-only`) so client chrome can import `NavEntry` for prop
 * typing without pulling in the server-only fetchers.
 */

import type { Block } from "@/lib/page-blocks";

/** A published page as it appears in the nav / sitemap (no body). */
export type PageSummary = {
  slug: string;
  title: string;
  /** Optional shorter label for the nav (falls back to `title`). */
  navLabel?: string;
  showInNav: boolean;
  navArea: "header" | "footer";
  navOrder: number;
  seoDescription?: string;
  /** Cover image URL (WebP) for OpenGraph cards. */
  coverImage?: string;
  updatedAt?: string;
};

/** A full published page: the summary plus its sanitized block body. */
export type CustomPage = PageSummary & { blocks: Block[] };

/** One rendered nav item appended after the static site nav. */
export type NavEntry = { href: string; label: string };
