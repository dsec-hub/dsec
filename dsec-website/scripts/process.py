#!/usr/bin/env python3
"""Turn raw black-background pixel renders into clean transparent .webp assets.

Pipeline per image:
  1. Flood-fill the near-black background starting from the border. Flood-fill
     (not a global black threshold) is deliberate: it removes the surrounding
     black while PRESERVING the black pixel outlines *inside* the sprite, which
     a naive threshold would eat.
  2. Hard binary alpha (0/255) — no semi-transparent fuzz, keeps pixel edges crisp.
  3. Crop to the sprite's bounding box with a small transparent margin.
  4. Downscale chunky renders to a sane max dimension with nearest-neighbour so
     the pixels stay square.
  5. Export lossless .webp (flat pixel art compresses tiny) to public/pixel/.

Usage:
    python scripts/process.py             # process every raw PNG
    python scripts/process.py duck-mascot # just one
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw-images"
OUT = ROOT / "public" / "pixel"
OUT.mkdir(parents=True, exist_ok=True)

BLACK_THRESHOLD = 42      # max(R,G,B) below this counts as "background black"
MAX_DIM = {                      # per-key override; default below
    "hero-banner": 1536,         # wide full-bleed banner — keep it big
    "hero-desk": 1280,
    "hero-iso-island": 1100,
    "hero-iso-arcade": 1100,
    "duck-iso": 760,
}
DEFAULT_MAX_DIM = 560


def flood_background(rgb: np.ndarray) -> np.ndarray:
    """Return a boolean mask of background pixels (near-black, edge-connected)."""
    h, w, _ = rgb.shape
    near_black = rgb.max(axis=2) < BLACK_THRESHOLD
    bg = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    # Seed from every border pixel that is near-black.
    for x in range(w):
        for y in (0, h - 1):
            if near_black[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if near_black[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and near_black[ny, nx] and not bg[ny, nx]:
                bg[ny, nx] = True
                q.append((ny, nx))
    return bg


def process(png: Path) -> None:
    key = png.stem
    img = Image.open(png).convert("RGB")
    rgb = np.asarray(img)
    bg = flood_background(rgb)

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])
    out = Image.fromarray(rgba, "RGBA")

    # Crop to content.
    bbox = out.getbbox()
    if bbox:
        out = out.crop(bbox)

    # Downscale chunky render, keep square pixels.
    max_dim = MAX_DIM.get(key, DEFAULT_MAX_DIM)
    if max(out.size) > max_dim:
        scale = max_dim / max(out.size)
        new = (max(1, round(out.width * scale)), max(1, round(out.height * scale)))
        out = out.resize(new, Image.NEAREST)

    # Re-harden alpha after any resampling.
    arr = np.asarray(out).copy()
    arr[..., 3] = np.where(arr[..., 3] < 128, 0, 255)
    out = Image.fromarray(arr, "RGBA")

    dest = OUT / f"{key}.webp"
    out.save(dest, "WEBP", lossless=True, quality=90, method=6)
    kb = dest.stat().st_size / 1024
    print(f"  {key:16s} -> {dest.relative_to(ROOT)}  {out.width}x{out.height}  {kb:6.1f} KB")


def main() -> None:
    keys = sys.argv[1:]
    pngs = [RAW / f"{k}.png" for k in keys] if keys else sorted(RAW.glob("*.png"))
    if not pngs:
        sys.exit("no raw PNGs found in raw-images/ — run generate.py first")
    for png in pngs:
        if not png.exists():
            print(f"  !! missing {png.name}")
            continue
        process(png)


if __name__ == "__main__":
    main()
