"use client";

/**
 * Client-side bits of the flagship teaser: the live countdown, the two funnel
 * forms (notify + sponsor — the email marketing capture), and the share button.
 * All theme styling comes from flagship.module.css via the data-theme on the
 * server-rendered .root wrapper these render inside.
 */

import { useEffect, useRef, useState } from "react";
import styles from "./flagship.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

/* ---------------------------------------------------------------- countdown */
export function FlagshipCountdown({ target }: { target?: string }) {
  const targetMs = target ? new Date(target).getTime() : NaN;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    // Intentional: `now` starts null so server + first client render match
    // (suppressHydrationWarning on the grid), then we set the real time on mount
    // and tick every second. The mount-time set is the only synchronous one.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  if (Number.isNaN(targetMs)) {
    return <div className={styles.cdTba}>● Date to be confirmed</div>;
  }

  let diff = now == null ? NaN : Math.max(0, targetMs - now);
  const d = Number.isNaN(diff) ? null : Math.floor(diff / 86_400_000);
  if (!Number.isNaN(diff)) diff -= (d as number) * 86_400_000;
  const h = Number.isNaN(diff) ? null : Math.floor(diff / 3_600_000);
  if (!Number.isNaN(diff)) diff -= (h as number) * 3_600_000;
  const m = Number.isNaN(diff) ? null : Math.floor(diff / 60_000);
  if (!Number.isNaN(diff)) diff -= (m as number) * 60_000;
  const s = Number.isNaN(diff) ? null : Math.floor(diff / 1000);

  const cell = (v: number | null, lab: string) => (
    <div className={styles.cdCell}>
      <div className={styles.cdNum}>{v == null ? "--" : lab === "days" ? v : pad(v)}</div>
      <div className={styles.cdLab}>{lab}</div>
    </div>
  );

  return (
    <div className={styles.cdGrid} suppressHydrationWarning>
      {cell(d, "days")}
      {cell(h, "hrs")}
      {cell(m, "min")}
      {cell(s, "sec")}
    </div>
  );
}

/* ------------------------------------------------------------------ funnels */
type Status = "idle" | "submitting" | "done" | "error";

async function postSignup(payload: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch("/api/flagship-signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as { ok?: boolean };
    return res.ok && data.ok === true;
  } catch {
    return false;
  }
}

export function NotifyFunnel({ slug, cta = "Notify me" }: { slug: string; cta?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const ref = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = ref.current?.value?.trim() ?? "";
    if (!email) return;
    setStatus("submitting");
    const ok = await postSignup({ slug, kind: "notify", email });
    setStatus(ok ? "done" : "error");
  }

  if (status === "done") {
    return <div className={styles.done}>✓ You’re on the list — watch your inbox.</div>;
  }
  return (
    <form className={styles.funnelForm} onSubmit={onSubmit}>
      <div className={styles.fieldRow}>
        <input
          ref={ref}
          className={styles.input}
          type="email"
          required
          placeholder="you@deakin.edu.au"
          aria-label="Email address"
          disabled={status === "submitting"}
        />
        <button className="btn btn-pink" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "…" : cta}
        </button>
      </div>
      {status === "error" && <p className={styles.err}>Couldn’t save that — try again in a sec.</p>}
    </form>
  );
}

export function SponsorFunnel({ slug }: { slug: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const company = useRef<HTMLInputElement>(null);
  const email = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = company.current?.value?.trim() ?? "";
    const em = email.current?.value?.trim() ?? "";
    if (!c || !em) return;
    setStatus("submitting");
    const ok = await postSignup({ slug, kind: "sponsor", email: em, company: c });
    setStatus(ok ? "done" : "error");
  }

  if (status === "done") {
    return <div className={styles.done}>✓ Enquiry logged — we’ll send the prospectus.</div>;
  }
  return (
    <form className={styles.funnelForm} onSubmit={onSubmit}>
      <input
        ref={company}
        className={styles.input}
        type="text"
        required
        placeholder="Company / organisation"
        aria-label="Company"
        disabled={status === "submitting"}
      />
      <div className={styles.fieldRow}>
        <input
          ref={email}
          className={styles.input}
          type="email"
          required
          placeholder="you@company.com"
          aria-label="Work email"
          disabled={status === "submitting"}
        />
        <button className="btn btn-yellow" type="submit" disabled={status === "submitting"}>
          {status === "submitting" ? "…" : "Get prospectus"}
        </button>
      </div>
      {status === "error" && <p className={styles.err}>Couldn’t send that — try again in a sec.</p>}
    </form>
  );
}

/* -------------------------------------------------------------------- share */
export function ShareButton({
  text,
  className = "btn btn-sky",
  children = "⌁ Share the mystery",
}: {
  text: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: document.title, text, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {copied ? "✓ Link copied" : children}
    </button>
  );
}
