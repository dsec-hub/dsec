import { headers } from "next/headers";
import { anyGibberish, isHoneypotTripped } from "@/lib/spam";
import { verifyTurnstile } from "@/lib/turnstile";

/**
 * Runs all anti-spam checks for a form submission, cheapest first:
 *   1. honeypot field, 2. gibberish heuristic, 3. Turnstile captcha.
 * Returns a user-facing error string, or null when the submission is clean.
 * Server-only (reads request headers); call from "use server" actions.
 */
export async function guardSubmission(
  formData: FormData,
  gibberishFields: string[] = [],
): Promise<string | null> {
  if (isHoneypotTripped(formData)) {
    return "Your submission was flagged as automated. Please try again.";
  }

  const values = gibberishFields.map((f) => String(formData.get(f) || ""));
  if (anyGibberish(...values)) {
    return "That doesn't look like real text. Please double-check your details.";
  }

  const token = String(formData.get("cf-turnstile-response") || "").trim() || null;
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  if (!(await verifyTurnstile(token, ip))) {
    return "Captcha verification failed. Please complete the challenge and retry.";
  }

  return null;
}
