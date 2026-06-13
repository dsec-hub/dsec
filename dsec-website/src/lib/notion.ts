/**
 * Notion integration for sponsorship leads.
 * Configured via NOTION_TOKEN and NOTION_SPONSOR_DB_ID — see .env.example.
 * If either is missing the call is skipped (no-op) so local/dev never errors.
 *
 * The target Notion database is expected to have these properties (create them
 * with these exact names + types in the database, or adjust the mapping below):
 *   - Name     → Title
 *   - Email    → Email
 *   - Company  → Text
 *   - Phone    → Phone
 *   - Tier     → Select
 *   - Source   → Select
 */

const NOTION_VERSION = "2022-06-28";

export type SponsorLead = {
  name?: string;
  email: string;
  company?: string;
  phone?: string;
  tier?: string;
  /** Where the lead came from, e.g. "Pricing unlock" or "Enquiry form". */
  source?: string;
};

export async function addSponsorLeadToNotion(lead: SponsorLead): Promise<void> {
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_SPONSOR_DB_ID;

  if (!token || !databaseId) {
    console.warn("Notion not configured — skipping lead sync.");
    return;
  }

  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: lead.name || lead.company || lead.email } }] },
    Email: { email: lead.email },
  };
  if (lead.company) {
    properties.Company = { rich_text: [{ text: { content: lead.company } }] };
  }
  if (lead.phone) properties.Phone = { phone_number: lead.phone };
  if (lead.tier) properties.Tier = { select: { name: lead.tier } };
  if (lead.source) properties.Source = { select: { name: lead.source } };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Notion page create failed (${res.status}): ${detail}`);
  }
}
