import { NextResponse } from "next/server";

import { apiPost } from "@/lib/api";
import { resolvePlayer } from "@/lib/player";
import { errorResponse } from "@/lib/proxy-helpers";

/**
 * Submit a play. Identity is resolved SERVER-SIDE from the shared portal session
 * (or the dev account locally) — the browser never supplies an account id. The
 * API scores the play; this handler just relays the official result.
 */
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await resolvePlayer();
  if (!player) {
    return NextResponse.json({ error: "sign in at the portal to save your score" }, { status: 401 });
  }
  let submission: unknown = {};
  try {
    const body = (await req.json()) as { submission?: unknown };
    submission = body?.submission ?? body ?? {};
  } catch {
    /* empty body — engine will reject */
  }
  try {
    const data = await apiPost(`/games/${encodeURIComponent(slug)}/attempt`, {
      account_id: player.accountId,
      email: player.email,
      display_name: player.displayName,
      submission,
      surface: "portal",
    });
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}
