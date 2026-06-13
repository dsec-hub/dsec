import { OG_SIZE, OG_CONTENT_TYPE, renderOgCard } from "@/lib/og";

export const alt = "Sponsor DSEC - reach Deakin's most active software talent.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    title: "REACH THE TALENT FIRST",
    subtitle: "Brand at events students show up to, plus a direct pipeline to Deakin grads. Packages from $500.",
    tags: ["150-person hackathon", "~190 members", "via dusa"],
    accent: "blue",
  });
}
