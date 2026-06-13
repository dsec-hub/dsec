"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Tier } from "@/lib/content";
import { captureSponsorLead, type SponsorFormState } from "@/app/sponsor/actions";
import { BookMeetingButton } from "@/components/book-meeting-button";
import { Captcha, Honeypot } from "@/components/anti-spam";

const initialState: SponsorFormState = { ok: false };

export function SponsorTiers({ tiers }: { tiers: Tier[] }) {
  const [activeTier, setActiveTier] = useState<Tier | null>(null);

  return (
    <>
      <div className="stagger mt-8 grid gap-5 md:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`pixel-card pixel-hover flex flex-col p-6 ${
              t.featured ? "bg-blue text-paper pixel-card-lg" : "bg-panel"
            }`}
          >
            {t.featured && (
              <span className="pixel-tag mb-3 self-start !bg-yellow !text-ink">
                ★ most popular
              </span>
            )}
            <h3 className="font-display text-2xl font-bold">{t.name}</h3>
            {/* Pricing is gated — revealed after the lead fills the modal. */}
            <div
              className={`mt-1 font-mono text-sm font-bold ${
                t.featured ? "text-yellow" : "text-blue"
              }`}
            >
              🔒 Pricing revealed on request
            </div>
            <p
              className={`mt-2 text-sm ${t.featured ? "text-paper/85" : "text-paper/75"}`}
            >
              {t.pitch}
            </p>
            <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wide opacity-60">
              What this package offers
            </p>
            <ul className="mt-2 flex flex-1 flex-col gap-2 text-sm">
              {t.includes.map((inc) => (
                <li key={inc} className="flex gap-2">
                  <span className={t.featured ? "text-yellow" : "text-mint"}>▸</span>
                  {inc}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setActiveTier(t)}
              className={`btn mt-5 justify-center !text-sm ${
                t.featured ? "btn-pink" : "btn-blue"
              }`}
            >
              Sponsor {t.name} →
            </button>
          </div>
        ))}
      </div>

      {activeTier && (
        <SponsorModal tier={activeTier} onClose={() => setActiveTier(null)} />
      )}
    </>
  );
}

function SponsorModal({ tier, onClose }: { tier: Tier; onClose: () => void }) {
  const [state, formAction] = useActionState(captureSponsorLead, initialState);
  const error = state.ok ? null : state.error ?? null;

  // Close on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock background scroll while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Sponsor ${tier.name}`}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="modal-overlay absolute inset-0 bg-ink/70"
      />
      <div className="modal-panel pixel-card-lg relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto bg-panel p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 font-mono text-lg font-bold text-paper/60 transition-colors duration-150 hover:text-paper"
        >
          ✕
        </button>

        {state.ok ? (
          <Revealed tier={tier} />
        ) : (
          <>
            <p className="eyebrow !text-blue">{tier.name} package</p>
            <h3 className="mt-1 font-display text-2xl font-bold">
              Unlock pricing for {tier.name}
            </h3>
            <p className="mt-2 text-sm text-paper/75">
              Drop your details and we&apos;ll reveal the pricing right away, plus
              the option to book a chat with the team.
            </p>

            <form action={formAction} className="relative mt-5 grid gap-4">
              <Honeypot />
              <input type="hidden" name="tier" value={tier.name} />
              <ModalField label="Name">
                <input type="text" name="name" placeholder="Your name" className="pixel-input" />
              </ModalField>
              <ModalField label="Work email" required>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="pixel-input"
                />
              </ModalField>
              <ModalField label="Company">
                <input
                  type="text"
                  name="company"
                  placeholder="Company name"
                  className="pixel-input"
                />
              </ModalField>
              <ModalField label="Phone" hint="Optional.">
                <input
                  type="tel"
                  name="phone"
                  placeholder="For a quicker chat"
                  className="pixel-input"
                />
              </ModalField>

              {error && (
                <p className="border-2 border-pink bg-pink/10 px-3 py-2 font-mono text-sm text-pink">
                  {error}
                </p>
              )}

              <Captcha resetSignal={state} />
              <ModalSubmit tierName={tier.name} />
              <p className="text-center font-mono text-xs text-paper/55">
                No payment here. We just send pricing and follow up.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function Revealed({ tier }: { tier: Tier }) {
  return (
    <div className="text-center">
      <p className="eyebrow !text-mint">Unlocked ✓</p>
      <h3 className="mt-1 font-display text-2xl font-bold">{tier.name}</h3>
      <div className="mt-3 border-[3px] border-paper bg-yellow p-5 text-ink">
        <div className="font-mono text-xs font-bold uppercase tracking-wide">
          Sponsorship from
        </div>
        <div className="font-display text-4xl font-bold">{tier.price}</div>
        <div className="mt-1 font-mono text-xs">Invoiced via DUSA, +GST.</div>
      </div>
      <p className="mt-4 text-sm text-paper/75">
        We&apos;ve got your details and will be in touch. Want to talk it through
        now? Book a time with the team.
      </p>
      <div className="mt-4 grid gap-3">
        <BookMeetingButton className="btn btn-pink justify-center" />
      </div>
    </div>
  );
}

function ModalSubmit({ tierName }: { tierName: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-pink justify-center">
      {pending ? "Sending…" : `Reveal ${tierName} pricing`}
    </button>
  );
}

function ModalField({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="font-display text-base font-bold">{label}</span>
        {required && <span className="font-mono text-xs text-pink">required</span>}
        {hint && <span className="font-mono text-xs text-paper/50">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
