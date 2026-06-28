import { NextResponse } from "next/server";

import { apiGet } from "@/lib/api";
import { resolvePlayer } from "@/lib/player";
import { errorResponse } from "@/lib/proxy-helpers";

/** The signed-in player's resumable state for a stateful game (Codle board). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await resolvePlayer();
  if (!player) {
    return NextResponse.json({ started: false, signedIn: false });
  }
  try {
    const data = await apiGet(`/games/${encodeURIComponent(slug)}/state?account_id=${player.accountId}`);
    return NextResponse.json({ ...(data as object), signedIn: true });
  } catch (e) {
    return errorResponse(e);
  }
}
