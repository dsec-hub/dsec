/**
 * Flagship teaser funnel sink (the email marketing capture).
 *
 * The teaser page's "notify me" and "sponsor interest" forms POST here; this
 * handler forwards to the dsec-api public endpoint
 * `POST /website/flagship/{slug}/signup`, which stores the signup (and, for
 * sponsor enquiries, feeds the sponsor-lead pipeline). Kept server-side so the
 * API base URL stays out of the client bundle.
 *
 * POST is never cached by Next, so this always runs. Always resolves 200 with
 * `{ ok }` so a transient API hiccup never shows the visitor a hard error — the
 * form just reports it couldn't save and they can retry.
 */

const KINDS = new Set(["notify", "sponsor"]);

function apiBase(): string | null {
  const b = process.env.DSEC_API_URL;
  return b ? b.replace(/\/+$/, "") : null;
}

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "bad_request" }, { status: 400 });
  }

  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  const kind = typeof body.kind === "string" ? body.kind : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!slug || !KINDS.has(kind) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return Response.json({ ok: false, error: "invalid" }, { status: 422 });
  }

  const base = apiBase();
  // No API configured (e.g. local preview) → accept optimistically so the demo
  // funnel still "works"; nothing is stored but the visitor isn't blocked.
  if (!base) return Response.json({ ok: true, stored: false });

  const payload = {
    kind,
    email,
    name: typeof body.name === "string" ? body.name.trim() || null : null,
    company: typeof body.company === "string" ? body.company.trim() || null : null,
    message: typeof body.message === "string" ? body.message.trim() || null : null,
    source: "website",
  };

  try {
    const res = await fetch(`${base}/website/flagship/${encodeURIComponent(slug)}/signup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!res.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[flagship-signup] API ${res.status} for ${slug}`);
      }
      return Response.json({ ok: false, error: "api_error" }, { status: 502 });
    }
    return Response.json({ ok: true, stored: true });
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[flagship-signup] proxy failed: ${(err as Error).message}`);
    }
    return Response.json({ ok: false, error: "network" }, { status: 502 });
  }
}
