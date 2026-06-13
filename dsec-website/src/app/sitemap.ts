import type { MetadataRoute } from "next";

const BASE = "https://dsec.club";

/**
 * Static sitemap for DSEC's public routes. The /heroes page is a dev-only
 * hero picker and is intentionally excluded (also disallowed in robots).
 * Submit this in Google Search Console so branded queries index fast (§2.3).
 */
export default function sitemap(): MetadataRoute.Sitemap {
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

  return routes.map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
