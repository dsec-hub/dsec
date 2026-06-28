import { NextResponse } from "next/server";

import { apiGet } from "@/lib/api";
import { resolvePlayer } from "@/lib/player";
import { errorResponse } from "@/lib/proxy-helpers";

/** The signed-in player's own points / streak this cycle. */
export async function GET() {
  const player = await resolvePlayer();
  if (!player) {
    return NextResponse.json({ error: "not signed in" }, { status: 401 });
  }
  try {
    const data = await apiGet(`/games/me?account_id=${player.accountId}`);
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}
