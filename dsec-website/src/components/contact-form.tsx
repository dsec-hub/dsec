"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { site } from "@/lib/content";
import { submitContact, type ContactFormState } from "@/app/contact/actions";
import { Captcha, Honeypot } from "@/components/anti-spam";

const initialState: ContactFormState = { ok: false };

const topics = [
  "Joining / membership",
  "Events",
  "Sponsorship",
  "Press / media",
  "Something else",
];

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initialState);
  const error = state.ok ? null : state.error ?? null;
  const successRef = useRef<HTMLDivElement>(null);

  // On a successful submit the form is replaced by the confirmation; move focus
  // to it (and announce via role="status") so keyboard/SR users aren't stranded.
  useEffect(() => {
    if (state.ok) successRef.current?.focus();
  }, [state.ok]);

  if (state.ok) {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="pixel-card-lg bg-mint p-8 text-center text-ink outline-none"
      >
        <div className="font-display text-3xl font-bold">Message sent ✓</div>
        <p className="mx-auto mt-3 max-w-md text-ink/80">
          Thanks for reaching out. The committee will get back to you soon. You can
          also email us at{" "}
          <a href={`mailto:${site.email}`} className="font-bold underline">
            {site.email}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="pixel-card-lg relative bg-panel p-6 sm:p-8">
      <Honeypot />
      <div className="grid gap-5">
        <Field label="Name">
          <input
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Your name"
            className="pixel-input"
          />
        </Field>

        <Field label="Email" required>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className="pixel-input"
          />
        </Field>

        <Field label="What's it about?">
          <select name="topic" className="pixel-input" defaultValue="">
            <option value="" disabled>
              Choose a topic
            </option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Message" required>
          <textarea
            name="message"
            rows={4}
            required
            placeholder="How can we help?"
            className="pixel-input resize-y"
          />
        </Field>

        {error && (
          <p
            role="alert"
            className="border-2 border-pink bg-pink/10 px-3 py-2 font-mono text-sm text-pink"
          >
            {error}
          </p>
        )}

        <Captcha resetSignal={state} />
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-pink justify-center">
      {pending ? "Sending…" : "Send message"}
    </button>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="font-display text-lg font-bold">{label}</span>
        {required && <span className="font-mono text-xs text-pink">required</span>}
      </span>
      {children}
    </label>
  );
}
