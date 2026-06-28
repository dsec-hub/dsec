import NextAuth from "next-auth";

import { authConfig } from "./auth.config";

/**
 * Read-only auth instance. With no providers it cannot start a login, but it
 * decodes the shared portal session cookie (same `AUTH_SECRET`) so `auth()`
 * returns the signed-in player's `accountId` + `email`. To sign in, players are
 * redirected to the member portal.
 */
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
