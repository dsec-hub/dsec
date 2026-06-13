import { ImageResponse } from "next/og";

/**
 * Shared Open Graph card renderer for DSEC.
 * One pixel-arcade card, parameterised per audience. We lean on the site's
 * "extruded 3D" signature (stacked offset text shadows + chunky cream borders)
 * rather than the pixel webfont, so the card renders offline at build time with
 * next/og's bundled default font - no network fetch, no missing-glyph risk.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Brand palette (mirrors @theme in globals.css).
const C = {
  bg: "#0a0a0a",
  paper: "#f5efe2",
  ink: "#0a0714",
  pink: "#e91e63",
  yellow: "#ffcf33",
  blue: "#3d6bff",
  mint: "#2ce0a3",
} as const;

export type OgCard = {
  title: string;
  subtitle: string;
  tags: string[];
  /** corner badge colour - the per-audience accent */
  accent: keyof typeof C;
};

export function renderOgCard({ title, subtitle, tags, accent }: OgCard) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.bg,
          color: C.paper,
          padding: 72,
          fontFamily: "Geist",
        }}
      >
        {/* eyebrow */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", width: 18, height: 18, background: C.yellow }} />
          <div
            style={{
              display: "flex",
              fontSize: 27,
              letterSpacing: 5,
              color: C.paper,
            }}
          >
            DEAKIN SOFTWARE ENGINEERING CLUB
          </div>
        </div>

        {/* headline + subtitle */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 98,
              lineHeight: 1,
              fontWeight: 800,
              color: C.yellow,
              letterSpacing: -2,
              textShadow: `6px 6px 0 ${C.pink}, 12px 12px 0 ${C.ink}`,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 34,
              color: "rgba(245,239,226,0.82)",
              maxWidth: 920,
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* tag row + DSEC badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 14 }}>
            {tags.map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  border: `3px solid ${C.paper}`,
                  padding: "10px 18px",
                  fontSize: 23,
                  color: C.paper,
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 104,
              height: 104,
              background: C[accent],
              border: `4px solid ${C.paper}`,
              boxShadow: `7px 7px 0 ${C.paper}`,
              fontSize: 30,
              fontWeight: 800,
              color: C.ink,
              letterSpacing: 1,
            }}
          >
            DSEC
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
