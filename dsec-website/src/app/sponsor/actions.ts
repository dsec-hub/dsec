"use server";

import { emailConfig } from "@/lib/email";
import { escapeHtml } from "@/lib/telegram";
import { deliverSubmission } from "@/lib/notify";
import {
  renderConfirmationEmail,
  renderTeamEmail,
  renderText,
  type Field,
} from "@/lib/email-templates";
import { addSponsorLeadToNotion, type SponsorLead } from "@/lib/notion";
import { site } from "@/lib/content";
import { guardSubmission } from "@/lib/form-guard";

/** Push a lead to dsec-api (best-effort — never blocks the visitor flow). */
async function pushLeadToApi(data: {
  source: string;
  tier?: string;
  name?: string;
  email: string;
  company?: string;
  phone?: string;
  budget?: string;
  message?: string;
}): Promise<void> {
  const apiUrl = process.env.DSEC_API_URL?.replace(/\/+$/, "");
  if (!apiUrl) return;
  try {
    await fetch(`${apiUrl}/sponsor-leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Intentionally swallowed — API sync is advisory.
  }
}

export type SponsorFormState = {
  ok: boolean;
  error?: string;
};

/** Full enquiry form at the bottom of the sponsor page. */
export async function submitSponsorEnquiry(
  _prev: SponsorFormState,
  formData: FormData,
): Promise<SponsorFormState> {
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const budget = String(formData.get("budget") || "").trim();
  const interest = String(formData.get("interest") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter a work email so we can reply." };
  }

  const blocked = await guardSubmission(formData, ["message"]);
  if (blocked) return { ok: false, error: blocked };

  const rows: Field[] = [
    { label: "Work email", value: email },
    { label: "Company", value: company },
    { label: "Budget", value: budget },
    { label: "Interested in", value: interest },
  ];

  try {
    await deliver({
      subject: `Sponsorship enquiry · ${company || email}`,
      heading: "New sponsorship enquiry",
      intro: "Someone enquired about sponsoring DSEC through the dsec.club sponsor page.",
      rows,
      message,
      replyTo: email,
      confirmSubject: "Thanks for your interest in sponsoring DSEC",
      telegram: [
        "💸 <b>New sponsorship enquiry</b>",
        `Email: ${escapeHtml(email)}`,
        `Company: ${escapeHtml(company || "-")}`,
        `Budget: ${escapeHtml(budget || "-")}`,
        `Interest: ${escapeHtml(interest || "-")}`,
        message ? `Message: ${escapeHtml(message)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    });
  } catch (err) {
    console.error("Sponsor enquiry delivery failed:", err);
    return {
      ok: false,
      error: "Something went wrong sending your enquiry. Please email us directly.",
    };
  }

  void syncLeadToNotion({ email, company, source: "Enquiry form" });
  void pushLeadToApi({ source: "enquiry", email, company: company || undefined, budget: budget || undefined, message: message || undefined });

  return { ok: true };
}

/**
 * Lead-capture for the gated-pricing funnel. Collects contact details before
 * the price is revealed in the UI. Tier name comes from a hidden field.
 */
export async function captureSponsorLead(
  _prev: SponsorFormState,
  formData: FormData,
): Promise<SponsorFormState> {
  const tier = String(formData.get("tier") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const company = String(formData.get("company") || "").trim();
  const phone = String(formData.get("phone") || "").trim();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter an email so we can follow up." };
  }

  const blocked = await guardSubmission(formData, ["name", "company"]);
  if (blocked) return { ok: false, error: blocked };

  const rows: Field[] = [
    { label: "Interested tier", value: tier },
    { label: "Name", value: name },
    { label: "Email", value: email },
    { label: "Company", value: company },
    { label: "Phone", value: phone },
  ];

  try {
    await deliver({
      subject: `Sponsorship lead (${tier || "tier"}) · ${company || name || email}`,
      heading: "New sponsorship lead",
      intro: "A visitor unlocked pricing on the dsec.club sponsor page.",
      rows,
      replyTo: email,
      name,
      confirmSubject: tier
        ? `Thanks for your interest in the ${tier} package`
        : "Thanks for your interest in sponsoring DSEC",
      confirmBody: tier
        ? `thanks for your interest in the ${tier} package. If you haven't already booked a meeting with us, here's our Cal.com link to grab a time. Here's a copy of your details for your records:`
        : "thanks for your interest in sponsoring DSEC. If you haven't already booked a meeting with us, here's our Cal.com link to grab a time. Here's a copy of your details for your records:",
      confirmCta: { label: "Book a meeting", url: site.calBooking },
      telegram: [
        "🦆 <b>New sponsorship lead</b> (pricing unlocked)",
        `Tier: ${escapeHtml(tier || "-")}`,
        `Name: ${escapeHtml(name || "-")}`,
        `Email: ${escapeHtml(email)}`,
        `Company: ${escapeHtml(company || "-")}`,
        `Phone: ${escapeHtml(phone || "-")}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("Sponsor lead delivery failed:", err);
    return {
      ok: false,
      error: "Something went wrong. Please email us directly and we'll send pricing.",
    };
  }

  void syncLeadToNotion({ name, email, company, phone, tier, source: "Pricing unlock" });
  void pushLeadToApi({
    source: "pricing_unlock",
    tier: tier || undefined,
    name: name || undefined,
    email,
    company: company || undefined,
    phone: phone || undefined,
  });

  return { ok: true };
}

/**
 * Push a sponsorship lead into Notion. Best-effort: a Notion failure is logged
 * but never blocks the visitor's flow (the email + Telegram are the source of
 * truth; Notion is the CRM mirror).
 */
async function syncLeadToNotion(lead: SponsorLead): Promise<void> {
  try {
    await addSponsorLeadToNotion(lead);
  } catch (err) {
    console.error("Notion lead sync failed:", err);
  }
}

/**
 * Send the HTML team notification (source of truth) to the sponsor inbox, a
 * best-effort Telegram ping, and an acknowledgment copy back to the submitter.
 * Mirrors the contact form: an email failure is surfaced, the Telegram ping and
 * confirmation are best-effort. See deliverSubmission in @/lib/notify.
 */
async function deliver(opts: {
  subject: string;
  heading: string;
  intro: string;
  rows: Field[];
  message?: string;
  /** Submitter's email, used as the team reply-to and the confirmation recipient. */
  replyTo: string;
  /** Submitter's name, for the confirmation greeting. */
  name?: string;
  telegram: string;
  confirmSubject: string;
  /** Overrides the confirmation body sentence (e.g. to name the chosen package). */
  confirmBody?: string;
  /** Optional CTA button on the confirmation email (e.g. a Cal.com link). */
  confirmCta?: { label: string; url: string };
}): Promise<void> {
  const text = renderText(opts.rows, opts.message);
  const confirmBody =
    opts.confirmBody ??
    "thanks for reaching out. We've got your details and someone from the club will get back to you soon. Here's a copy for your records:";

  await deliverSubmission({
    to: emailConfig.sponsorInbox,
    subject: opts.subject,
    text,
    html: renderTeamEmail({
      heading: opts.heading,
      intro: opts.intro,
      rows: opts.rows,
      message: opts.message,
    }),
    replyTo: opts.replyTo,
    telegram: opts.telegram,
    confirmation: {
      to: opts.replyTo,
      subject: opts.confirmSubject,
      text: [
        `${opts.name ? `Hi ${opts.name},` : "Hi,"} ${confirmBody}`,
        "",
        text,
        ...(opts.confirmCta
          ? ["", `${opts.confirmCta.label}: ${opts.confirmCta.url}`]
          : []),
        "",
        "Deakin Software Engineering Club",
        "https://www.dsec.club",
      ].join("\n"),
      html: renderConfirmationEmail({
        name: opts.name || undefined,
        rows: opts.rows,
        message: opts.message,
        body: confirmBody,
        cta: opts.confirmCta,
      }),
      replyTo: emailConfig.sponsorInbox,
    },
  });
}
