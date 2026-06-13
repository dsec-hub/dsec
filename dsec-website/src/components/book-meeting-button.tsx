import { site } from "@/lib/content";

/** Cal.com booking URL with optional prefill query params. */
function calBookingUrl(prefill?: { email?: string; company?: string }): string {
  const params = new URLSearchParams();
  if (prefill?.email) params.set("email", prefill.email);
  if (prefill?.company) params.set("notes", `Company: ${prefill.company}`);
  const query = params.toString();
  return query ? `${site.calBooking}?${query}` : site.calBooking;
}

/**
 * Books a sponsor meeting via Cal.com. Renders a styled link to the club's
 * Cal.com page (opens in a new tab), prefilling the visitor's email and company
 * when we already have them. A public booking link needs no Cal API key.
 */
export function BookMeetingButton({
  className = "btn btn-ghost justify-center",
  label = "Book a meeting with the team",
  prefill,
}: {
  className?: string;
  label?: string;
  prefill?: { email?: string; company?: string };
}) {
  return (
    <a
      href={calBookingUrl(prefill)}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      {label}
    </a>
  );
}
