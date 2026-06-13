"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { site } from "@/lib/content";
import { submitSponsorEnquiry, type SponsorFormState } from "@/app/sponsor/actions";
import { Captcha, Honeypot } from "@/components/anti-spam";
import { BookMeetingButton } from "@/components/book-meeting-button";

const initialState: SponsorFormState = { ok: false };

const interests = [
  "Brand at events",
  "Hackathon naming",
  "Grad pipeline / hiring",
  "Workshop or tech talk",
  "Not sure yet",
];

const budgets = ["Under $500", "$500–$1,500", "$1,500–$5,000", "$5,000+", "Need guidance"];

export function SponsorForm() {
  const [state, formAction] = useActionState(submitSponsorEnquiry, initialState);
  const error = state.ok ? null : state.error ?? null;
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  if (state.ok) {
    return (
      <div className="pixel-card-lg bg-mint p-8 text-center text-black">
        <div className="font-display text-3xl font-bold">You&apos;re in the queue ✓</div>
        <p className="mx-auto mt-3 max-w-md text-black/80">
          Thanks, your enquiry is on its way to our team. If you&apos;d rather reach
          us directly, email{" "}
          <a href={`mailto:${site.email}`} className="font-bold underline">
            {site.email}
          </a>
          . We reply within a couple of days.
        </p>
        <div className="mt-6 flex justify-center">
          <BookMeetingButton
            className="btn btn-ghost !bg-black/10 !text-black"
            label="Book a call with the team"
            prefill={{ email, company }}
          />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="pixel-card-lg relative bg-panel p-6 sm:p-8">
      <Honeypot />
      <div className="grid gap-5">
        <Field label="Work email" required hint="The only required field.">
          <input
            type="email"
            name="email"
            required
            placeholder="you@company.com"
            className="pixel-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Company">
          <input
            type="text"
            name="company"
            placeholder="Company name"
            className="pixel-input"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Rough budget" hint="A range is enough.">
            <select name="budget" className="pixel-input" defaultValue="">
              <option value="" disabled>
                Choose a range
              </option>
              {budgets.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Most interested in">
            <select name="interest" className="pixel-input" defaultValue="">
              <option value="" disabled>
                Choose one
              </option>
              {interests.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Anything else?" hint="Optional.">
          <textarea
            name="message"
            rows={3}
            placeholder="Timeline, the team you're hiring for, a specific event…"
            className="pixel-input resize-y"
          />
        </Field>

        {error && (
          <p className="border-2 border-pink bg-pink/10 px-3 py-2 font-mono text-sm text-pink">
            {error}
          </p>
        )}

        <Captcha resetSignal={state} />
        <SubmitButton />
        <p className="text-center font-mono text-xs text-paper/55">
          No payment here, this just routes an enquiry. Sponsorship is invoiced
          via DUSA (+GST) once we&apos;ve talked.
        </p>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-pink justify-center">
      {pending ? "Sending…" : "Send sponsorship enquiry"}
    </button>
  );
}

function Field({
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
    <label className="flex h-full flex-col">
      <span className="mb-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="font-display text-lg font-bold">{label}</span>
        {required && <span className="font-mono text-xs text-pink">required</span>}
        {hint && <span className="font-mono text-xs text-paper/50">{hint}</span>}
      </span>
      <div className="mt-auto">{children}</div>
    </label>
  );
}
