import { NextResponse } from "next/server";

import { apiGet } from "@/lib/api";
import { errorResponse } from "@/lib/proxy-helpers";

/** Leaderboard pass-through (game / window / limit). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const qs = new URLSearchParams();
  for (const k of ["game", "window", "limit"]) {
    const v = url.searchParams.get(k);
    if (v) qs.set(k, v);
  }
  try {
    const data = await apiGet(`/games/leaderboard?${qs.toString()}`);
    return NextResponse.json(data);
  } catch (e) {
    return errorResponse(e);
  }
}
