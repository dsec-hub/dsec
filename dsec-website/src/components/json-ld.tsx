/**
 * Renders a JSON-LD <script> for structured data. Next.js recommends embedding
 * schema this way inside a Server Component (it's static, so it ships in the
 * initial HTML where crawlers read it).
 */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Schema is built from our own static content - no user input to escape.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
