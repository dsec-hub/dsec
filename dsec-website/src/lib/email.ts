import { Resend } from "resend";

/**
 * Resend client + helpers for transactional email (contact / sponsorship forms).
 * Reads configuration from environment variables — see .env.example.
 */

const apiKey = process.env.RESEND_API_KEY;

/** Lazily-constructed singleton so a missing key fails loudly at send time, not import time. */
let client: Resend | null = null;

function getClient(): Resend {
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not set — cannot send email.");
  }
  client ??= new Resend(apiKey);
  return client;
}

export const emailConfig = {
  from: process.env.EMAIL_FROM ?? "DSEC <noreply@dsec.club>",
  sponsorInbox: process.env.SPONSOR_INBOX ?? "admin@dsec.club",
  contactInbox: process.env.CONTACT_INBOX ?? "admin@dsec.club",
};

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
  /** Optional HTML body. Sent alongside `text` as a multipart message. */
  html?: string;
  replyTo?: string;
}): Promise<void> {
  const { error } = await getClient().emails.send({
    from: emailConfig.from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    replyTo: opts.replyTo,
  });

  if (error) {
    throw new Error(`Resend failed to send email: ${error.message}`);
  }
}
