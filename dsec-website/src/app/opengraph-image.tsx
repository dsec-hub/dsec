import { OG_SIZE, OG_CONTENT_TYPE, renderOgCard } from "@/lib/og";

export const alt = "DSEC - Deakin Software Engineering Club. We build real software.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    title: "WE BUILD REAL SOFTWARE",
    subtitle: "A project-led student tech club at Deakin Burwood. ~190 members shipping real things.",
    tags: ["$5 student membership", "companies sponsor", "deakin · burwood"],
    accent: "yellow",
  });
}
