/**
 * Email HTML templates for form submissions.
 *
 * Deliverability-first: table layout, inline styles, no web fonts. Brand assets
 * are PNGs (not SVG/WebP, which Gmail and others won't render) served from the
 * site over absolute https URLs. Every dynamic value MUST be passed through
 * `escapeHtml` (telegram.ts) by the caller before it reaches here. These
 * helpers do not escape.
 */

import { escapeHtml } from "@/lib/telegram";

// Canonical host: the apex 307-redirects to www, and email clients won't follow
// redirects for <img>, so reference www directly.
const SITE = "https://www.dsec.club";

// Dark + pink brand palette (mirrors src/app/globals.css tokens).
const BG = "#000000"; // page
const CARD = "#0a0a0a"; // card surface
const CARD_ALT = "#141414"; // message well
const PAPER = "#f5efe2"; // primary text
const PINK = "#e91e63"; // brand accent
const MUTED = "#9c97a8"; // secondary text
const BORDER = "#242424"; // hairlines

export type Field = { label: string; value: string };

/** Build the plain-text body shared with the HTML version (multipart fallback). */
export function renderText(rows: Field[], message?: string): string {
  const lines = rows.map((r) => `${r.label}: ${r.value || "-"}`);
  if (message !== undefined) {
    lines.push("", "Message:", message || "-");
  }
  return lines.join("\n");
}

function fieldRows(rows: Field[]): string {
  return rows
    .map(
      (r) => `
      <tr>
        <td style="padding:6px 16px 6px 0;color:${MUTED};font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(
          r.label,
        )}</td>
        <td style="padding:6px 0;color:${PAPER};font-size:14px;font-weight:600;vertical-align:top;">${escapeHtml(
          r.value,
        ) || "-"}</td>
      </tr>`,
    )
    .join("");
}

function messageBlock(message: string): string {
  return `
    <tr><td colspan="2" style="padding-top:18px;">
      <div style="color:${MUTED};font-size:13px;margin-bottom:6px;">Message</div>
      <div style="background:${CARD_ALT};border:1px solid ${BORDER};border-left:3px solid ${PINK};border-radius:8px;padding:14px 16px;color:${PAPER};font-size:14px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(
        message,
      )}</div>
    </td></tr>`;
}

function ctaBlock(label: string, url: string): string {
  return `
    <tr><td colspan="2" style="padding-top:22px;">
      <a href="${escapeHtml(url)}" style="display:inline-block;background:${PINK};color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">${escapeHtml(
        label,
      )}</a>
    </td></tr>`;
}

function shell(heading: string, intro: string, inner: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark"></head>
<body style="margin:0;padding:0;background:${BG};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:${CARD};border:1px solid ${BORDER};border-radius:14px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:${CARD};padding:22px 24px;border-bottom:3px solid ${PINK};">
          <img src="${SITE}/email/dsec-logo.png" width="63" height="40" alt="DSEC" style="display:block;border:0;">
        </td></tr>
        <tr><td style="padding:24px 24px 8px;">
          <h1 style="margin:0 0 4px;font-size:19px;color:${PAPER};">${escapeHtml(heading)}</h1>
          <p style="margin:0;color:${MUTED};font-size:14px;line-height:1.5;">${escapeHtml(intro)}</p>
        </td></tr>
        <tr><td style="padding:14px 24px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${inner}</table>
        </td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid ${BORDER};color:${MUTED};font-size:12px;line-height:1.5;">
          Deakin Software Engineering Club · <a href="${SITE}" style="color:${PINK};text-decoration:none;">dsec.club</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/** Internal notification sent to the team inbox. */
export function renderTeamEmail(opts: {
  heading: string;
  intro: string;
  rows: Field[];
  message?: string;
}): string {
  const inner =
    fieldRows(opts.rows) +
    (opts.message !== undefined ? messageBlock(opts.message) : "");
  return shell(opts.heading, opts.intro, inner);
}

/** Acknowledgment copy sent back to the person who submitted the form. */
export function renderConfirmationEmail(opts: {
  name?: string;
  rows: Field[];
  message?: string;
  /** Overrides the body sentence after the greeting (e.g. to name a package). */
  body?: string;
  /** Optional call-to-action button (e.g. a Cal.com booking link). */
  cta?: { label: string; url: string };
}): string {
  const greeting = opts.name ? `Hi ${opts.name},` : "Hi,";
  const body =
    opts.body ??
    "thanks for reaching out. We've got your message and a human from the club will get back to you soon. Here's a copy for your records.";
  const intro = `${greeting} ${body}`;
  const inner =
    fieldRows(opts.rows) +
    (opts.message !== undefined ? messageBlock(opts.message) : "") +
    (opts.cta ? ctaBlock(opts.cta.label, opts.cta.url) : "");
  return shell("We got your message", intro, inner);
}
