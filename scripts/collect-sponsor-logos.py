#!/usr/bin/env python3
"""Collect + clean DSEC sponsor logos for the dark (#0a0a0a) marquee.

For each brand it downloads the official logo, normalises it to a transparent
PNG that reads on near-black (reversing dark wordmarks to white where the brand
mark would otherwise vanish), trims the transparent margin and caps the
resolution. The output PNGs are ready to drag straight into the dsec-hub
dashboard media-manager (entity type = sponsor, role = logo), which re-encodes
them to the WebP/PNG the public /website/sponsors feed serves.

    python3 scripts/collect-sponsor-logos.py

Output:
    sponsor-logos/<slug>.png        cleaned, upload-ready
    sponsor-logos/_raw/<slug>.*     untouched original download (for reference)

Notes
-----
* SVGs are rasterised with ImageMagick (`magick`). The Red Bull emblem is the
  only detailed one, so eyeball sponsor-logos/redbull.png after running.
* "Acusys" is intentionally absent: no public Australian entity / logo could be
  found. Ask the committee for that file and drop it in by hand.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image

try:
    import numpy as np
except ImportError:  # pragma: no cover - numpy is usually present
    np = None

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "sponsor-logos"
RAW = OUT / "_raw"
SCRATCH_DUSA = (
    "/private/tmp/claude-501/-Users-clupa-Documents-projects-dsec-dsec-monorepo/"
    "8bf78154-5ee0-45a8-9cd5-f61a45642eac/scratchpad/dusa-logo-white.svg"
)
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
MAX_DIM = 900  # cap the longest side; the dashboard re-crops anyway

# treatment:
#   none           keep colours as-is (already light / full-colour on transparent)
#   to_white       monochrome dark mark on transparent -> reverse opaque px to white
#   ink_to_white   dark mark on an opaque WHITE canvas (e.g. an SVG with a white
#                  background rect) -> key the white out and reverse the ink to
#                  white, keeping the anti-aliased edges
#   vicroads       drop any white backing, then recolour the black wordmark white
#                  (keeps the green "vic" in brand colour)
LOGOS = [
    {
        "slug": "redbull",
        "name": "Red Bull",
        "website": "https://www.redbull.com/au-en",
        "url": "https://cdn.worldvectorlogo.com/logos/redbullenergydrink.svg",
        "treatment": "none",
    },
    {
        "slug": "deakin",
        "name": "Deakin University",
        "website": "https://www.deakin.edu.au",
        # Deakin's header logo: already crisp WHITE on transparent, horizontal
        # lockup. (The Wikipedia SVG ships a white background rect that the
        # rsvg-less renderer can't see past, so we use the official PNG instead.)
        "url": "https://www.deakin.edu.au/__data/assets/git_bridge/0024/3858/dist/images/logo_deakin-rebrand-stacked.png",
        "treatment": "none",
    },
    {
        "slug": "dusa",
        "name": "DUSA",
        "website": "https://www.dusa.org.au",
        "url": f"file://{SCRATCH_DUSA}",
        "treatment": "none",  # already white artwork
    },
    {
        "slug": "vicroads",
        "name": "VicRoads",
        "website": "https://www.vicroads.vic.gov.au",
        "url": "https://cdn.freebiesupply.com/logos/large/2x/vicroads-logo-png-transparent.png",
        "treatment": "vicroads",
    },
    {
        "slug": "my-first-australian-offer",
        "name": "My First Australian Offer",
        "website": "https://www.myfirstaustralianoffer.com.au",
        "url": "https://framerusercontent.com/images/74BGNbjs81NhudtrxoQyh3e8kq4.png",
        "treatment": "none",  # the brand's own light/dark-mode logo
    },
    {
        "slug": "tapcraft",
        "name": "TapCraft Studio",
        "website": "https://www.tapcraft.shop",
        "url": "https://www.tapcraft.shop/tapcraft%20logo(black%20bg).png",
        "treatment": "none",  # the brand's own "black bg" (light) logo
    },
]


def download(url: str, dest: Path) -> None:
    if url.startswith("file://"):
        shutil.copyfile(url[len("file://") :], dest)
        return
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp, open(dest, "wb") as fh:
        shutil.copyfileobj(resp, fh)


def rasterise_svg(src: Path, dst: Path) -> None:
    # High density so the raster is crisp; transparent background.
    subprocess.run(
        ["magick", "-background", "none", "-density", "600", str(src), str(dst)],
        check=True,
        capture_output=True,
    )


def load_rgba(path: Path) -> Image.Image:
    if path.suffix.lower() == ".svg":
        png = path.with_suffix(".png")
        rasterise_svg(path, png)
        path = png
    return Image.open(path).convert("RGBA")


def to_white(img: Image.Image) -> Image.Image:
    """Reverse a monochrome dark mark: every opaque pixel becomes white,
    alpha (and therefore the shape / anti-aliasing) preserved."""
    out = Image.new("RGBA", img.size, (255, 255, 255, 0))
    out.putalpha(img.getchannel("A"))
    return out


def ink_to_white(img: Image.Image) -> Image.Image:
    """Dark mark sitting on an opaque white canvas -> white mark on transparent.
    Uses inverse luminance as the new alpha so the white background drops out and
    the dark ink reverses to white, anti-aliased edges intact."""
    if np is None:
        raise SystemExit("numpy required for ink_to_white (pip install numpy)")
    a = np.array(img).astype(np.float32)
    lum = np.minimum(np.minimum(a[..., 0], a[..., 1]), a[..., 2])  # 0 ink .. 255 white
    new_alpha = (a[..., 3] / 255.0) * (255.0 - lum)
    out = np.full_like(a, 255.0)
    out[..., 3] = np.clip(new_alpha, 0, 255)
    return Image.fromarray(out.astype(np.uint8), "RGBA")


def vicroads(img: Image.Image) -> Image.Image:
    """Key out any white backing, then recolour the near-black 'roads' to white
    while leaving the green 'vic' untouched."""
    if np is None:
        raise SystemExit("numpy required for the vicroads treatment (pip install numpy)")
    a = np.array(img)  # H x W x 4
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    near_white = (r > 235) & (g > 235) & (b > 235)
    a[near_white, 3] = 0  # drop a white background if present
    near_black = (al > 20) & (r < 80) & (g < 80) & (b < 80)
    a[near_black, 0:3] = 255  # black wordmark -> white
    return Image.fromarray(a, "RGBA")


def trim_and_cap(img: Image.Image) -> Image.Image:
    bbox = img.getchannel("A").getbbox()
    if bbox:
        img = img.crop(bbox)
    # small breathing-room margin so nothing kisses the edge
    pad = max(2, round(max(img.size) * 0.02))
    padded = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    padded.paste(img, (pad, pad))
    img = padded
    if max(img.size) > MAX_DIM:
        scale = MAX_DIM / max(img.size)
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
    return img


TREATMENTS = {
    "none": lambda i: i,
    "to_white": to_white,
    "ink_to_white": ink_to_white,
    "vicroads": vicroads,
}


def main() -> int:
    OUT.mkdir(exist_ok=True)
    RAW.mkdir(exist_ok=True)
    print(f"writing -> {OUT}\n")
    ok = 0
    for spec in LOGOS:
        slug = spec["slug"]
        ext = ".svg" if spec["url"].split("?")[0].endswith(".svg") else Path(spec["url"].split("?")[0]).suffix or ".png"
        raw = RAW / f"{slug}{ext}"
        try:
            download(spec["url"], raw)
            img = load_rgba(raw)
            img = TREATMENTS[spec["treatment"]](img)
            img = trim_and_cap(img)
            dst = OUT / f"{slug}.png"
            img.save(dst)
            print(f"  ok  {slug:28} {img.width}x{img.height}  [{spec['treatment']}]")
            ok += 1
        except Exception as exc:  # noqa: BLE001 - report and continue
            print(f"  FAIL {slug:27} {type(exc).__name__}: {exc}")
    print(f"\n{ok}/{len(LOGOS)} logos cleaned.")
    print("Missing: acusys (no public logo found — get the file from the committee).")
    return 0 if ok == len(LOGOS) else 1


if __name__ == "__main__":
    sys.exit(main())
