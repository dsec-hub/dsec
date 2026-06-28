/**
 * Build the portal sign-in URL for an unauthenticated player.
 *
 * The portal (dsec-app) owns login. We hand it an ABSOLUTE callbackUrl back into
 * this games site so it can drop the player straight where they were once their
 * one-time code is verified — no detour through the portal dashboard. The portal
 * allowlists this origin before honouring it (see dsec-app lib/login-redirect).
 *
 * Pure + client-safe (no server-only deps) so both the server game pages and the
 * client nav can share it.
 */
const PORTAL = (process.env.NEXT_PUBLIC_PORTAL_URL ?? "").replace(/\/+$/, "");
// This app's own public origin, so the portal can redirect back across domains.
// Falls back to the production origin when unset (matches layout metadataBase).
const GAMES = (process.env.NEXT_PUBLIC_GAMES_URL ?? "https://games.dsec.club").replace(/\/+$/, "");

export function portalLoginUrl(callbackPath = "/"): string {
  const path = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;
  const callbackUrl = encodeURIComponent(`${GAMES}${path}`);
  return `${PORTAL}/login?callbackUrl=${callbackUrl}`;
}
