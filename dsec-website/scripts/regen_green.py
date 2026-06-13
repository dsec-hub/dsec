#!/usr/bin/env python3
"""Generate DSEC duck sprites on a pure-GREEN chroma screen and key them out to
clean, fully transparent, LOSSLESS .webp files.

Why green instead of the project's usual black screen: the duck's own outline is
black, so a black background shares a colour with the sprite and needs a fragile
flood-fill that can leave a dark halo "leaking" around the edges. Pure chroma
green is absent from the entire duck palette (yellow / orange / magenta / gold /
cream / white / black / blue), so it removes completely and cleanly. Output is
saved lossless so WebP compression can't reintroduce edge tint either.

    python scripts/regen_green.py duck-wave duck-mail   # generate + key these
    python scripts/regen_green.py --key-only duck-trophy # re-key an existing raw
    python scripts/regen_green.py                        # all keys in ASSETS
"""
import base64
import os
import sys
from pathlib import Path

import numpy as np
import requests
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw-images"
OUT = ROOT / "public" / "pixel"
RAW.mkdir(exist_ok=True)
TARGET_H = 560
CHROMA = "#00E000"  # pure green — absent from the duck palette

GREEN_STYLE = (
    "16-bit retro pixel-art sprite, chunky visible square pixels, thick clean "
    "1px black pixel outline, flat bold cartoon colours, limited arcade palette "
    "of bright duck yellow, orange, hot magenta-pink, electric blue and cream, "
    "high contrast, sharp aliased edges, NO anti-aliasing, NO smooth gradients, "
    "NO 3D shading. The duck is centered, fully in frame, and completely isolated "
    f"on a PURE FLAT SOLID {CHROMA} GREEN background (chroma key / green screen) — "
    "one perfectly even solid colour, NO other objects, no ground line, no drop "
    "shadow, no text, no border, no gradient, no texture. Nothing in the duck or "
    "props may be green."
)

# key -> subject prompt (style appended automatically)
ASSETS = {
    "duck-trophy": (
        "A single cute chubby yellow rubber-duck mascot cheering, holding a big "
        "shiny golden pixel trophy cup triumphantly above its head with both "
        "little wings, joyful open-beak smile, round happy eyes, rosy cheeks, "
        "small orange feet, a few bright sparkle pixels around the trophy."
    ),
    "duck-wave": (
        "A single cute chubby yellow rubber-duck mascot waving hello, one little "
        "wing raised high in a friendly wave, big welcoming open-beak smile, round "
        "happy eyes, rosy cheeks, small orange beak and feet, warm inviting pose, "
        "facing the viewer. Drawn on a ~72x72 pixel grid, medium chunky square "
        "pixels matching a classic 16-bit arcade sprite — not too fine, not overly "
        "blocky, clean even pixel size with a 1px black outline."
    ),
    "duck-mail": (
        "A single cute chubby yellow rubber-duck mascot happily holding up a "
        "cream-white envelope letter with a small red heart wax seal, as if "
        "sending a message, big joyful open-beak smile, round happy eyes, rosy "
        "cheeks, small orange beak and feet, cheerful pose, facing the viewer."
    ),
}


def load_key() -> str:
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        for line in (ROOT / ".env.local").read_text().splitlines():
            if line.startswith("OPENAI_API_KEY="):
                key = line.split("=", 1)[1].strip()
    if not key:
        sys.exit("OPENAI_API_KEY not set")
    return key


def generate(key: str, api_key: str) -> None:
    prompt = f"{ASSETS[key]} {GREEN_STYLE}"
    for model in ("gpt-image-2", "gpt-image-1"):
        print(f"  -> generating {key} on green via {model} ...", flush=True)
        resp = requests.post(
            "https://api.openai.com/v1/images/generations",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": model,
                "prompt": prompt,
                "size": "1024x1024",
                "quality": "high",
                "n": 1,
                "background": "opaque",
            },
            timeout=300,
        )
        if resp.status_code == 200:
            raw = RAW / f"{key}-green.png"
            raw.write_bytes(base64.b64decode(resp.json()["data"][0]["b64_json"]))
            print(f"     saved {raw.relative_to(ROOT)}")
            return
        print(f"     {model} failed: {resp.status_code} {resp.text[:160]}")
    sys.exit(f"image generation failed for {key}")


def chroma_key(key: str) -> None:
    img = Image.open(RAW / f"{key}-green.png").convert("RGBA")
    arr = np.array(img).astype(np.int32)
    r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

    # Sample the actual background colour from an 8px border frame.
    h, w = r.shape
    frame = np.zeros((h, w), bool)
    frame[:8, :] = frame[-8:, :] = frame[:, :8] = frame[:, -8:] = True
    bg = np.array([int(np.median(c[frame])) for c in (r, g, b)])

    # Core key: near the sampled green.
    dist = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
    is_core = dist < 120
    # De-fringe: green-tinted blend pixels (green well above red AND blue).
    is_greenish = (g - r > 25) & (g - b > 25)
    remove = is_core | (is_greenish & (dist < 260))
    alpha = np.where(remove, 0, 255).astype(np.uint8)

    # Green-spill suppression on KEPT pixels: no duck colour has green above both
    # red and blue, so clamp such pixels' green to max(red, blue) to kill tint.
    rgb = arr[..., :3].astype(np.uint8).copy()
    rr, gg, bb = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    spill = (alpha > 0) & (gg.astype(int) > rr) & (gg.astype(int) > bb)
    gg[spill] = np.maximum(rr[spill], bb[spill])

    # Erode kept region 1px to eat any residual edge halo.
    alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3))
    res = Image.fromarray(np.dstack([rgb, np.array(alpha_img)]), "RGBA")

    # Crop to content, scale to match sibling sprites, keep pixels crisp.
    res = res.crop(res.getbbox())
    nw = round(res.width * TARGET_H / res.height)
    res = res.resize((nw, TARGET_H), Image.NEAREST)
    dest = OUT / f"{key}.webp"
    res.save(dest, "WEBP", lossless=True, quality=100, method=6)
    print(f"  saved {dest.relative_to(ROOT)} -> {res.width}x{res.height}")


def main() -> None:
    key_only = "--key-only" in sys.argv
    keys = [a for a in sys.argv[1:] if not a.startswith("--")] or list(ASSETS)
    api_key = "" if key_only else load_key()
    for key in keys:
        if key not in ASSETS:
            print(f"  ?? unknown key '{key}', skipping")
            continue
        if not key_only:
            generate(key, api_key)
        chroma_key(key)


if __name__ == "__main__":
    main()
