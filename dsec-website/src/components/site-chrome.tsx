"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the site chrome (header / footer) on the standalone `/links` page so it
 * renders chromeless — ideal as the single link in an Instagram/Discord bio.
 * Every other route renders its children unchanged. Wrap `<SiteHeader />` and
 * `<SiteFooter />` in the root layout with this; it returns `null` only on
 * `/links` (and any nested path under it).
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/links" || pathname?.startsWith("/links/")) return null;
  return <>{children}</>;
}
