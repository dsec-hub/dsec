import { revalidateTag } from "next/cache";

/**
 * On-demand cache invalidation for the public feeds.
 *
 * The dsec-app dashboard POSTs here after a content write (event / project /
 * person / sponsor / package / media) so the matching feed refreshes right away
 * instead of waiting for the 24h fallback in `lib/api.ts`. This is what makes an
 * idle site cost zero API calls while still showing edits promptly.
 *
 * Auth: a shared secret in the `x-revalidate-secret` header (REVALIDATE_SECRET,
 * set in both this project and the dashboard). Without it anyone could force the
 * site to re-fetch the API at will.
 *
 * Body: `{ "tags": ["events"] }`. Omitted/empty → flush everything via the
 * shared `website` tag (used by media changes that can touch several feeds).
 *
 * POST is never cached by Next, so this handler always runs.
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ revalidated: false, error: "unauthorized" }, { status: 401 });
  }

  let tags: string[] = ["website"];
  try {
    const body = (await req.json()) as { tags?: unknown };
    if (Array.isArray(body?.tags)) {
      const valid = body.tags.filter((t): t is string => typeof t === "string" && t.length > 0);
      if (valid.length > 0) tags = valid;
    }
  } catch {
    // No body / not JSON → keep the default (flush everything).
  }

  // `{ expire: 0 }` expires the tag immediately so the next visitor gets fresh
  // data — the documented pattern for an external service calling a Route
  // Handler. (The bare single-arg `revalidateTag(tag)` is deprecated in Next 16;
  // `updateTag` is Server-Action-only, so it can't be used from here.)
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  return Response.json({ revalidated: true, tags });
}
