import type { MetadataRoute } from "next";

const BASE = "https://dsec.club";

/**
 * Allow everything except the dev-only /heroes hero picker, and point crawlers
 * at the sitemap so branded/navigational queries resolve to us quickly (§2.3).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/heroes",
    },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
