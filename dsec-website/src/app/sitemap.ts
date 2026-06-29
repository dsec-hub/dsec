import type { MetadataRoute } from "next";

import { getPages } from "@/lib/api";

const BASE = "https://dsec.club";

/**
 * Sitemap for DSEC's public routes. The /heroes page is a dev-only hero picker
 * and is intentionally excluded (also disallowed in robots). Committee-published
 * custom pages (`dsec.club/<slug>`) are appended from the live feed; the list is
 * just the static routes when the feed is unset/unreachable. Submit this in
 * Google Search Console so branded queries index fast (§2.3).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const routes: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/join", priority: 0.9 },
    { path: "/sponsor", priority: 0.9 },
    { path: "/projects", priority: 0.7 },
    { path: "/events", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/scan", priority: 0.5 },
  ];

  const staticEntries: MetadataRoute.Sitemap = routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));

  const pages = await getPages();
  const pageEntries: MetadataRoute.Sitemap = pages.map((p) => ({
    url: `${BASE}/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : lastModified,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...pageEntries];
}
