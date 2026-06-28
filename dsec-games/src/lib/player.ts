/**
 * Resolve the current player's identity for a server-side API call.
 *
 * Identity comes from the shared portal session (read via `auth()`). When there
 * is no session AND we are not in production, a configured dev account lets the
 * games be played standalone locally. In production, no session => no identity
 * (the caller should prompt the player to sign in at the portal).
 */

import "server-only";

import { auth } from "@/auth";

export type Player = {
  accountId: number;
  email: string | null;
  displayName: string | null;
};

export async function resolvePlayer(): Promise<Player | null> {
  const session = await auth();
  const accountId = session?.user?.accountId;
  if (typeof accountId === "number") {
    return {
      accountId,
      email: session?.user?.email ?? null,
      displayName: session?.user?.name ?? null,
    };
  }
  if (process.env.NODE_ENV !== "production" && process.env.GAMES_DEV_ACCOUNT_ID) {
    return {
      accountId: Number(process.env.GAMES_DEV_ACCOUNT_ID),
      email: process.env.GAMES_DEV_EMAIL ?? "dev@local",
      displayName: "Dev Duck",
    };
  }
  return null;
}
