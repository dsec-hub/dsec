/**
 * Server-only client for dsec-api. The scoped service key is read from the
 * environment and attached here — it must NEVER reach the browser. Browser code
 * calls our own /api/games/* route handlers, which call these helpers.
 *
 * Every call returns a typed result or throws an `ApiError` the route handler
 * turns into a clean JSON status.
 */

import "server-only";

function apiBase(): string | null {
  const b = process.env.DSEC_API_URL;
  return b ? b.replace(/\/+$/, "") : null;
}

export function apiAuth(): { base: string; key: string } | null {
  const base = apiBase();
  const key = process.env.DSEC_API_KEY;
  return base && key ? { base, key } : null;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call(method: "GET" | "POST", path: string, body?: unknown): Promise<unknown> {
  const env = apiAuth();
  if (!env) throw new ApiError("games backend is not configured", 503);
  const res = await fetch(`${env.base}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.key}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    const detail =
      data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : `request failed (${res.status})`;
    throw new ApiError(detail, res.status);
  }
  return data;
}

export const apiGet = (path: string) => call("GET", path);
export const apiPost = (path: string, body: unknown) => call("POST", path, body);
