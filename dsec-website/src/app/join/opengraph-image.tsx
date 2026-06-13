import { OG_SIZE, OG_CONTENT_TYPE, renderOgCard } from "@/lib/og";

export const alt = "Join DSEC - build real software at Deakin. One click, no application.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    title: "BUILD REAL THINGS",
    subtitle: "Ship portfolio-worthy software with 190+ Deakin students. The Discord's one click away.",
    tags: ["$5 DUSA / $7.50 external", "no application", "just turn up"],
    accent: "mint",
  });
}
