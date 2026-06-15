# DSEC — Deakin Software Engineering Club website

A conversion-focused marketing site for DSEC, a project-led student tech club at
Deakin Burwood. Built with **Next.js 16 (App Router) + TypeScript + Tailwind v4**.

The visual identity is a from-scratch pixel-art design system — **"DSEC OS"**, a
dark handheld-console / CRT aesthetic — built around the club's yellow rubber-duck
mascot. Near-black violet base, neon arcade accents, chunky cream offset shadows for
3D pop, jagged pixel-skyline section seams, extruded pixel headlines, and
hand-generated isometric 3D pixel illustrations.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (all pages are static)
```

## Pages

| Route | Audience | Single CTA |
|-------|----------|-----------|
| `/` | switchboard | forks to the two paths |
| `/sponsor` | companies | Send sponsorship enquiry |
| `/projects` | both | (proof — nudges students to join) |
| `/events` | both | Register / proof of delivery |
| `/join` | students | Join the Discord |
| `/about` | trust | committee + DUSA affiliation |
| `/contact` | both | Reach the committee (email / Discord / socials) |
| `/scan` | in-person | QR board for event screens (site / IG / Discord / join) |
| `/heroes` | **design exploration** — all 6 hero treatments |

The two funnels (sponsors vs students) never share a CTA on the same page, per the
brief. Replace anything flagged `PLACEHOLDER` (and the `⚑` notes in the UI) with
real club content before launch — see the §7 checklist in the original brief.

## Design system

Defined in `src/app/globals.css` via Tailwind v4 `@theme`.

- **Surfaces** (dark): `bg` `#0d0a1c` (page), `panel` `#181235`, `panel-2` `#221a45`,
  `void` `#070512` (deepest wells / footer).
- **Line + text**: `paper` `#f5efe2` (light text, borders, shadows on dark),
  `ink` `#0a0714` (dark text on bright accents).
- **Arcade accents**: `blue` `#3d6bff`, `pink` `#ff4d96`, `yellow` `#ffcf33` (duck),
  `mint` `#2ce0a3`, `sky` `#59c2ff`.
- **Type**: Pixelify Sans (display) · Hanken Grotesk (sans body) · JetBrains Mono (utility).
- **Signature**: the pixel duck mascot + chunky cream offset shadows on dark
  (`--shadow-pix`), jagged `.skyline` pixel seams, extruded `.text-3d` headlines, and
  a CRT scanline + grid body texture. Utilities: `.btn` (+ `.btn-start` arcade ring),
  `.pixel-card`, `.pixel-tag`, `.pixel-corners`, `.pixel-input`, `.skyline`,
  `.stripes`, `.twinkle`, `.caret`.
- **Motion**: one orchestrated page-load reveal (`animate-rise` / `animate-pop`),
  gentle mascot `animate-bob`, twinkling sparkles; `prefers-reduced-motion` kills it
  all. Sprites use `image-rendering: pixelated`.

### Swapping the home hero

Six hero treatments live in `src/components/heroes.tsx` (`HeroConsole`, `HeroBoot`,
`HeroSplit`, `HeroScene`, `HeroMarquee`, `HeroBento`). The home page imports
`HeroConsole` (centered, isometric-3D centerpiece) — change that one import in
`src/app/page.tsx` to try another. Preview all six at `/heroes`.

## Pixel illustration pipeline

Illustrations are generated, then the black background is removed in Python and the
result is compressed to `.webp`. Final assets live in `public/pixel/`.

```bash
# 1. generate raw renders on a pure-black background (OpenAI Images API, gpt-image-1)
.venv/bin/python scripts/generate.py            # all, or pass keys: duck-laptop hero-desk

# 2. flood-fill the black bg -> crop -> hard alpha -> lossless webp
.venv/bin/python scripts/process.py
```

`scripts/generate.py` reads `OPENAI_API_KEY` from `.env.local` (gitignored).
`scripts/process.py` uses an **edge-seeded flood fill** so the black *background* is
removed while black pixel *outlines inside* each sprite are preserved. Asset prompts
and the shared art style live in the `ASSETS` / `STYLE` constants in `generate.py` —
add a key there and re-run to mint new sprites.

> Note: the brief asked for "gpt image 2". Both image MCP servers were unavailable
> (no API key / depleted credits), so generation calls the OpenAI Images API
> directly with `gpt-image-1`. Swap the model/endpoint in `generate.py` if needed.

## Project layout

```
src/
  app/            # routes (App Router) + globals.css design system + icons
  components/
    heroes.tsx    # the 6 hero explorations
    site-header / site-footer
    ui.tsx        # Stat, ProjectCard, EventCard, SectionHeading, PlaceholderNote
    pixel-duck.tsx# typed <Image> wrapper for the sprites
    sponsor-form.tsx
  lib/content.ts  # all copy + data + PLACEHOLDER flags in one place
scripts/          # generate.py + process.py (image pipeline)
public/pixel/     # final .webp illustrations
raw-images/       # raw black-bg PNGs (intermediate)
```
