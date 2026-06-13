"use client";

import { useEffect, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { HONEYPOT_FIELD } from "@/lib/spam";

/**
 * Hidden honeypot input. Kept out of the layout and away from assistive tech and
 * tab order so real users never interact with it; bots that auto-fill inputs do.
 */
export function Honeypot() {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input
          type="text"
          name={HONEYPOT_FIELD}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>
    </div>
  );
}

/**
 * Cloudflare Turnstile widget. Renders nothing when no site key is configured
 * (captcha disabled). It injects a hidden `cf-turnstile-response` input that the
 * server action verifies. Pass the action's state as `resetSignal` so the widget
 * issues a fresh token after every submission (Turnstile tokens are single-use).
 */
export function Captcha({ resetSignal }: { resetSignal?: unknown }) {
  const ref = useRef<TurnstileInstance | null>(null);
  const mounted = useRef(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return; // skip the initial render
    }
    ref.current?.reset();
  }, [resetSignal]);

  if (!siteKey) return null;

  return (
    <Turnstile
      ref={ref}
      siteKey={siteKey}
      options={{ theme: "auto", size: "flexible" }}
    />
  );
}
