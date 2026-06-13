import { sendEmail } from "@/lib/email";
import { sendTelegramMessage } from "@/lib/telegram";

/**
 * Deliver a form submission to the team over both channels, plus an optional
 * acknowledgment copy back to the submitter.
 *
 * The team email is the source of truth: if it fails, the whole delivery fails
 * so the visitor is told to email directly. The Telegram ping and the
 * submitter confirmation are best-effort — a failure there is logged but never
 * blocks the submission or loses the team email. All run together so none waits
 * on the others.
 */
export async function deliverSubmission(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo: string;
  telegram: string;
  /** Acknowledgment copy emailed back to the person who submitted the form. */
  confirmation?: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    /** Where a reply from the submitter should land (e.g. the team inbox). */
    replyTo?: string;
  };
}): Promise<void> {
  const best: Promise<unknown>[] = [sendTelegramMessage(opts.telegram)];

  if (opts.confirmation) {
    best.push(
      sendEmail({
        to: opts.confirmation.to,
        subject: opts.confirmation.subject,
        text: opts.confirmation.text,
        html: opts.confirmation.html,
        replyTo: opts.confirmation.replyTo,
      }),
    );
  }

  const [teamResult, ...bestResults] = await Promise.allSettled([
    sendEmail({
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
      replyTo: opts.replyTo,
    }),
    ...best,
  ]);

  for (const r of bestResults) {
    if (r.status === "rejected") {
      console.error("Best-effort notification failed (non-blocking):", r.reason);
    }
  }

  if (teamResult.status === "rejected") {
    throw teamResult.reason instanceof Error
      ? teamResult.reason
      : new Error(String(teamResult.reason));
  }
}
