import type { NextAuthConfig } from "next-auth";

/**
 * Reads the SHARED member-portal session. dsec-games does not run its own login —
 * it decodes the same Auth.js JWT session cookie dsec-app issues (same
 * `AUTH_SECRET`, same cookie name), so a player who signed in at the portal is
 * already signed in here. Unauthenticated players are sent to the portal login.
 *
 * `AUTH_COOKIE_DOMAIN` (set to `.dsec.club` on BOTH apps in prod) is what makes
 * the cookie visible across subdomains; Auth.js sets a host-only cookie by
 * default, so the domain must be set explicitly on each app.
 */
const cookieDomain = process.env.AUTH_COOKIE_DOMAIN;
const useSecureCookie = process.env.NODE_ENV === "production";

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [], // no login here — identity comes from the shared cookie
  trustHost: true,
  ...(cookieDomain
    ? {
        cookies: {
          sessionToken: {
            name: useSecureCookie ? "__Secure-authjs.session-token" : "authjs.session-token",
            options: {
              domain: cookieDomain,
              path: "/",
              sameSite: "lax" as const,
              secure: useSecureCookie,
              httpOnly: true,
            },
          },
        },
      }
    : {}),
  callbacks: {
    // Surface the portal account id + email (stamped by dsec-app on sign-in).
    session({ session, token }) {
      if (session.user) {
        if (typeof token.accountId === "number") session.user.accountId = token.accountId;
        if (typeof token.email === "string") session.user.email = token.email;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
