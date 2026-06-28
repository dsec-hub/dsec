import "server-only";

import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api";

/** Turn any thrown error into a clean JSON response with the right status. */
export function errorResponse(e: unknown): NextResponse {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message }, { status: e.status });
  }
  return NextResponse.json({ error: "unexpected error" }, { status: 500 });
}
