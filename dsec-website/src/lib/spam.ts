/**
 * Lightweight, dependency-free spam defences for form submissions:
 *  - a honeypot field bots tend to auto-fill, and
 *  - a heuristic gibberish/keyboard-mash detector for free-text fields.
 *
 * These run server-side alongside the Turnstile captcha (see turnstile.ts).
 */

/** Hidden field name. Real users never see or fill it; many bots do. */
export const HONEYPOT_FIELD = "company_url";

/** True when the honeypot was filled (i.e. almost certainly a bot). */
export function isHoneypotTripped(formData: FormData): boolean {
  return String(formData.get(HONEYPOT_FIELD) || "").trim().length > 0;
}

const VOWELS = /[aeiou]/g;
const CONSONANTS = /[bcdfghjklmnpqrstvwxyz]+/g;
const MASH = /(asdf|sdfg|dfgh|qwer|wert|erty|zxcv|xcvb|hjkl|gjkl|uiop|poiu)/;

/**
 * Heuristic gibberish detector tuned to be conservative — it only flags text
 * that trips multiple independent signals, so unusual-but-real names and
 * messages pass. Returns false for very short input (not enough to judge).
 */
export function isGibberish(raw: string): boolean {
  const text = raw.trim().toLowerCase();
  if (text.length < 8) return false;

  const letters = text.replace(/[^a-z]/g, "");
  if (letters.length < 6) return false;

  let score = 0;

  // 1. Vowel ratio — natural English sits roughly 0.25–0.6.
  const vowelCount = (letters.match(VOWELS) || []).length;
  const vowelRatio = vowelCount / letters.length;
  if (vowelRatio < 0.2 || vowelRatio > 0.8) score++;

  // 2. Long consonant runs ("hjkldfgh").
  const longestConsonantRun = Math.max(
    0,
    ...(letters.match(CONSONANTS) || []).map((s) => s.length),
  );
  if (longestConsonantRun >= 5) score++;

  // 3. Low character diversity ("aaaaaa", "asasasas").
  const uniqueRatio = new Set(letters).size / letters.length;
  if (uniqueRatio < 0.3) score++;

  // 4. A very long single token — real sentences have spaces.
  const tokens = text.split(/\s+/).filter(Boolean);
  const longestToken = Math.max(...tokens.map((t) => t.length));
  if (longestToken >= 20) score++;

  // 4b. The whole input is one unbroken blob ("ksjdhfksjdhf", "aaaaaaaaaaaa").
  if (tokens.length === 1 && text.length >= 12) score++;

  // 5. Few word-shaped tokens (each real word mixes vowels + consonants).
  if (tokens.length >= 3) {
    const wordish = tokens.filter(
      (t) => /[aeiou]/.test(t) && /[bcdfghjklmnpqrstvwxyz]/.test(t),
    ).length;
    if (wordish / tokens.length < 0.4) score++;
  }

  // 6. Obvious keyboard-mash sequences.
  if (MASH.test(text)) score++;

  return score >= 3;
}

/** Convenience: gibberish check across several fields; true if any is gibberish. */
export function anyGibberish(...fields: (string | null | undefined)[]): boolean {
  return fields.some((f) => f && isGibberish(f));
}
