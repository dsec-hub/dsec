#!/usr/bin/env python3
"""Aggressively remove the flat magenta chroma-key background from the generated
duck-laptop sprite and produce a clean hard-edged transparent webp.

Strategy:
  1. Sample the real background colour from the image border.
  2. Remove any pixel close to that background colour (core key).
  3. De-fringe: also remove magenta/pink/purple-tinted blend pixels (the halo
     where the sprite meets the background) — these have red & blue clearly
     above green, which none of the sprite's own colours (yellow/orange/blue/
     navy/green-screen) satisfy.
  4. Binarise alpha and erode 1px to eat any residual edge fringe.
  5. Crop to content and resize to match the sibling sprites (~560px tall).
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/pixel/duck-laptop-gen.png"
DST = sys.argv[2] if len(sys.argv) > 2 else "public/pixel/duck-laptop.webp"
TARGET_H = 560

img = Image.open(SRC).convert("RGBA")
arr = np.array(img).astype(np.int32)
r, g, b = arr[..., 0], arr[..., 1], arr[..., 2]

# 1) sample background from a border frame (8px) and take the median colour
h, w = r.shape
frame = np.zeros((h, w), bool)
frame[:8, :] = frame[-8:, :] = frame[:, :8] = frame[:, -8:] = True
bg = np.array([int(np.median(c[frame])) for c in (r, g, b)])
print(f"sampled bg = {tuple(bg)}")

# 2) core key: euclidean distance to bg colour
dist = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
is_core = dist < 120

# 3) de-fringe: magenta-tinted blend pixels (red & blue both well above green)
is_magentaish = (r - g > 25) & (b - g > 25)
is_fringe = is_magentaish & (dist < 230)

remove = is_core | is_fringe
alpha = np.where(remove, 0, 255).astype(np.uint8)

# 4) erode the kept region by 1px to remove any leftover 1px halo
alpha_img = Image.fromarray(alpha, "L").filter(ImageFilter.MinFilter(3))
out = np.dstack([arr[..., :3].astype(np.uint8), np.array(alpha_img)])
res = Image.fromarray(out, "RGBA")

# 5) crop to content, scale to target height with nearest-neighbour (stay crisp)
bbox = res.getbbox()
res = res.crop(bbox)
nw = round(res.width * TARGET_H / res.height)
res = res.resize((nw, TARGET_H), Image.NEAREST)
res.save(DST, "WEBP", quality=92, method=6)
print(f"saved {DST} -> {res.width}x{res.height}")
