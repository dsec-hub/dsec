import { NextResponse } from "next/server";

import { apiGet } from "@/lib/api";
import { errorResponse } from "@/lib/proxy-helpers";

/** Today's round for a game (public payload only — never the answer). */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const data = await apiGet(`/games/${encodeURIComponent(slug)}/round`);
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}
