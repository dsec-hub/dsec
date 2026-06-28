"use client";

import { usePathname } from "next/navigation";

import { portalLoginUrl } from "@/lib/login-url";

/**
 * "Sign in" link that remembers the page you're on. After the portal verifies
 * your code it redirects straight back here via the callbackUrl — so signing in
 * from a game lands you back on that game, not the portal dashboard.
 */
export function PortalSignInLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <a href={portalLoginUrl(pathname)} className={className}>
      {children}
    </a>
  );
}
