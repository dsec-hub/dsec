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
import { guardSubmission } from "@/lib/form-guard";

export type ContactFormState = {
  ok: boolean;
  error?: string;
};

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const topic = String(formData.get("topic") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Enter an email so we can reply." };
  }
  if (message.length < 2) {
    return { ok: false, error: "Add a short message so we know how to help." };
  }

  const blocked = await guardSubmission(formData, ["name", "message"]);
  if (blocked) return { ok: false, error: blocked };

  const rows: Field[] = [
    { label: "Name", value: name },
    { label: "Email", value: email },
    { label: "Topic", value: topic },
  ];
  const text = renderText(rows, message);

  try {
    await deliverSubmission({
      to: emailConfig.contactInbox,
      subject: `Contact form · ${topic || "general"} · ${name || email}`,
      text,
      html: renderTeamEmail({
        heading: "New contact message",
        intro: "Someone reached out through the dsec.club contact form.",
        rows,
        message,
      }),
      replyTo: email,
      telegram: [
        "✉️ <b>New contact message</b>",
        `Name: ${escapeHtml(name || "-")}`,
        `Email: ${escapeHtml(email)}`,
        `Topic: ${escapeHtml(topic || "-")}`,
        `Message: ${escapeHtml(message)}`,
      ].join("\n"),
      confirmation: {
        to: email,
        subject: "Thanks for contacting DSEC, we got your message",
        text: [
          name ? `Hi ${name},` : "Hi,",
          "",
          "Thanks for reaching out. We've got your message and someone from the club will get back to you soon. Here's a copy for your records:",
          "",
          text,
          "",
          "Deakin Software Engineering Club",
          "https://dsec.club",
        ].join("\n"),
        html: renderConfirmationEmail({ name: name || undefined, rows, message }),
        replyTo: emailConfig.contactInbox,
      },
    });
  } catch (err) {
    console.error("Contact form delivery failed:", err);
    return {
      ok: false,
      error: "Something went wrong sending your message. Please email us directly.",
    };
  }

  return { ok: true };
}
