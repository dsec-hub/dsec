#!/usr/bin/env python3
"""Generate + clean the homepage hero PARTY illustration.

Unlike the other sprites (black background, see generate.py / process.py), this
busy party scene is rendered on a CHROMA-KEY GREEN screen and keyed out here.
White keying left traces because the art reuses light tones (cream highlights,
the silver laptop, code text); pure green appears nowhere else in the scene, so
it lifts out cleanly and aggressively.

Pipeline:
  1. Generate ONE wide pixel-art "tech-nerd duck party" via the OpenAI Images
     API (gpt-image-2) on a flat #00C400 green screen, all ducks standing on one
     floor line beside a central pizza-and-laptop table.
  2. Chroma-key: remove every pixel where green clearly beats both red and blue
     (the flat field AND its anti-aliased fringe), grow a few pixels into any
     leftover greenish edge, then despill the green cast off what survives.
  3. Hard binary alpha, crop to content, downscale with nearest-neighbour to keep
     pixels square, export lossless .webp to public/pixel/hero-party.webp.

Usage:
    python scripts/hero-party.py            # generate (skips if raw exists) + process
    python scripts/hero-party.py --force    # regenerate the raw PNG too
    python scripts/hero-party.py --process  # only re-run bg removal on existing raw
"""
import base64
import os
import sys
import time
from pathlib import Path

import numpy as np
import requests
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw-images"
OUT = ROOT / "public" / "pixel"
RAW.mkdir(exist_ok=True)
OUT.mkdir(parents=True, exist_ok=True)

KEY = "hero-party"
SIZE = "1536x1024"
MAX_DIM = 1536

# --- Chroma-key background -------------------------------------------------
# White keying left traces because the art reuses light tones (cream highlights,
# the silver laptop, code text). Instead we render on a PURE GREEN screen. Green
# sits in the empty hue gap between the ducks' yellow (~48°) and the cyan screens
# (~187°) and appears NOWHERE else in the scene, so it keys out cleanly and
# aggressively: any pixel where green clearly beats both red and blue is removed,
# then a despill pass neutralises the green cast on anti-aliased edges.
GREEN_MARGIN = 28   # G must beat BOTH R and B by at least this to count as background
GREEN_MIN = 70      # ...and be at least this green (ignores near-black outlines)
GROW_PASSES = 3     # extra 1px rings: absorb leftover greenish fringe touching the key

PROMPT = (
    "A WIDE horizontal 16-bit retro pixel-art illustration of a small, fun "
    "tech-nerd PARTY with ONLY about 6 cute chubby yellow rubber ducks. "
    "DUCK STYLE, very important: chubby yellow rubber ducks — a rounded "
    "rubber-duck body with a glossy cream-white highlight patch on the top of the "
    "head and the side of the body, a dark PLUM / eggplant outline (not pure "
    "black), a flat red-orange rubber-duck beak, and a simple round black eye with "
    "a rosy cheek. Each duck wears a cosy coloured HOODIE (in electric blue, "
    "violet, magenta-pink or cyan — NEVER green), and SOME of them also wear a "
    "small pixel CAP or beanie (a baseball cap or a knit beanie, in the same "
    "palette colours). A few wear small thin round nerdy glasses too. "
    "EVERY duck is STANDING UPRIGHT on its little feet — none sitting, none "
    "floating. On the LEFT, a group of two or three ducks stand chatting and "
    "laughing while holding plain blank energy-drink cans. On the RIGHT, two or "
    "three ducks stand holding small laptops, and one duck stands pointing at a "
    "little presentation board lit with a cyan < / > code symbol (the board has a "
    "dark navy / charcoal frame and stand — NO white paper, NO white easel). "
    "LAPTOP RULE, very important: the laptops the ducks HOLD are seen from BEHIND, "
    "so only the plain solid CLOSED-LOOKING BACK LID shows — a blank flat dark "
    "panel with NO screen, NO glow and NO code on the back of it. ONLY the single "
    "laptop on the central table faces the viewer and shows a glowing screen. "
    "In the CENTRE is a small chunky table (wooden / panel-coloured top) holding "
    "an OPEN cardboard PIZZA BOX with a few pizza slices, and that one OPEN laptop "
    "FACING THE VIEWER head-on, its screen glowing and showing little pixel code "
    "and a < / > symbol. A few floating pixel sparkles, hearts and code brackets "
    "< / > for energy — keep it tidy with breathing room. "
    "COMPOSITION, very important: ALL the ducks and the central table stand on "
    "ONE single shared horizontal floor line along the bottom — every duck the "
    "SAME size and its feet resting on that same ground line, lined up like a row "
    "standing on the floor next to the table. A group toward the FAR LEFT and a "
    "group toward the FAR RIGHT with the pizza-and-laptop table centred between "
    "them. Keep every duck, the table, the pizza box and the laptop fully inside "
    "the frame, nothing cropped at the edges. "
    "STYLE: classic chunky 16-bit pixel-art sprites — chunky visible square "
    "pixels, thick clean dark-plum pixel outlines, bold cartoon colours with "
    "simple cel shading (one lighter highlight tone and one darker shadow tone "
    "per colour) for a little depth and roundness, soft NEON GLOW only on the "
    "central laptop and the presentation board, high contrast, sharp aliased "
    "edges, NO smooth gradients, NO anti-aliasing — the same crisp arcade sprite "
    "style as a Tamagotchi screen. "
    "COLOURS: duck yellow #ffcf33, electric blue #3d6bff, hot magenta-pink "
    "#e91e63, tech cyan #00bcd4, creative violet #9c27b0, cream-white #f5efe2 "
    "highlights, red-orange beaks, brown table. Do NOT use any green anywhere. "
    "NO logos, NO brand marks, NO real text anywhere. "
    "BACKGROUND: fill the ENTIRE canvas with ONE pure solid flat CHROMA-KEY GREEN "
    "#00C400 — a vivid uniform green-screen colour. This exact green is used ONLY "
    "for the background and appears NOWHERE else in the picture: no green ducks, "
    "no green clothing, no green objects, no green code text, no green sparkles. "
    "Every duck and object sits on top of the flat green. No gradient, no "
    "vignette, no shadow on the green, no second background colour."
)


def load_key() -> str:
    if not os.environ.get("OPENAI_API_KEY"):
        env = ROOT / ".env.local"
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith("OPENAI_API_KEY="):
                    os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip()
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        sys.exit("OPENAI_API_KEY not set (expected in .env.local)")
    return key


def generate(raw: Path) -> None:
    key = load_key()
    print(f"  -> generating {KEY} ({SIZE}) ...", flush=True)
    resp = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {key}"},
        json={
            "model": "gpt-image-2",
            "prompt": PROMPT,
            "size": SIZE,
            "quality": "high",
            "n": 1,
            "background": "opaque",
        },
        timeout=300,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"{resp.status_code} {resp.text[:400]}")
    b64 = resp.json()["data"][0]["b64_json"]
    raw.write_bytes(base64.b64decode(b64))
    print(f"     saved {raw.relative_to(ROOT)} ({raw.stat().st_size // 1024} KB)")


def chroma_key(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Key out the green screen and despill the green cast off the edges.

    Returns (bg_mask, despilled_rgb). A pixel is background when green clearly
    beats both red and blue — that catches the flat green field AND the
    anti-aliased fringe where a sprite blends into it, which is exactly where
    white keying used to leave traces. Nothing else in the art is green, so the
    ducks (yellow: R≈G), cans (blue), cyan screens (G≈B) and cream highlights
    (R≈G≈B) all stay. We then grow the mask a few pixels into any leftover
    greenish edge and clamp green down to max(R,B) on what survives, removing the
    last green halo."""
    r = rgb[..., 0].astype(np.int16)
    g = rgb[..., 1].astype(np.int16)
    b = rgb[..., 2].astype(np.int16)

    bg = (g - np.maximum(r, b) > GREEN_MARGIN) & (g > GREEN_MIN)

    greenish = g - np.maximum(r, b) > 6  # softer test for the fading fringe
    for _ in range(GROW_PASSES):
        nb = np.zeros_like(bg)
        nb[1:, :] |= bg[:-1, :]
        nb[:-1, :] |= bg[1:, :]
        nb[:, 1:] |= bg[:, :-1]
        nb[:, :-1] |= bg[:, 1:]
        grow = greenish & nb & ~bg
        if not grow.any():
            break
        bg |= grow

    # Despill: neutralise any remaining green tint on kept pixels.
    keep = ~bg
    new_g = np.minimum(g, np.maximum(r, b))
    g_out = np.where(keep, new_g, g).astype(np.uint8)
    despilled = np.dstack([rgb[..., 0], g_out, rgb[..., 2]])
    return bg, despilled


def process(raw: Path) -> None:
    img = Image.open(raw).convert("RGB")
    rgb = np.asarray(img)
    bg, rgb = chroma_key(rgb)

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    out = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")

    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)

    if max(out.size) > MAX_DIM:
        scale = MAX_DIM / max(out.size)
        out = out.resize(
            (max(1, round(out.width * scale)), max(1, round(out.height * scale))),
            Image.NEAREST,
        )

    arr = np.asarray(out).copy()
    arr[..., 3] = np.where(arr[..., 3] < 128, 0, 255)
    out = Image.fromarray(arr, "RGBA")

    dest = OUT / f"{KEY}.webp"
    out.save(dest, "WEBP", lossless=True, quality=90, method=6)
    kb = dest.stat().st_size / 1024
    print(f"  {KEY:16s} -> {dest.relative_to(ROOT)}  {out.width}x{out.height}  {kb:6.1f} KB")


def main() -> None:
    force = "--force" in sys.argv
    only_process = "--process" in sys.argv
    raw = RAW / f"{KEY}.png"

    if not only_process and (force or not raw.exists()):
        for attempt in range(3):
            try:
                generate(raw)
                break
            except Exception as exc:  # noqa: BLE001
                print(f"     attempt {attempt + 1} failed: {exc}")
                time.sleep(4 * (attempt + 1))
        else:
            sys.exit(f"!! gave up generating {KEY}")
    elif raw.exists():
        print(f"  == {raw.relative_to(ROOT)} exists, skipping generation (use --force)")

    if not raw.exists():
        sys.exit(f"!! no raw image at {raw}")
    process(raw)


if __name__ == "__main__":
    main()
