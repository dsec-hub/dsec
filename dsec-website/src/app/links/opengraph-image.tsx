import { OG_SIZE, OG_CONTENT_TYPE, renderOgCard } from "@/lib/og";

export const alt = "DSEC · all our links in one place";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    title: "ALL OUR LINKS",
    subtitle:
      "Discord, membership, events and everything DSEC — one tap from our bio.",
    tags: ["discord", "membership", "events"],
    accent: "pink",
  });
}
