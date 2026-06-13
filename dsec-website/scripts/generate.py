#!/usr/bin/env python3
"""Generate DSEC pixel illustrations via the OpenAI Images API (gpt-image-1).

Every asset is generated on a pure-black background so the companion
`process.py` script can chroma-key it out, compress, and emit a .webp.

Usage:
    python scripts/generate.py            # generate everything missing
    python scripts/generate.py duck-laptop hero-scene   # only these keys
    python scripts/generate.py --force    # regenerate all
"""
import base64
import os
import sys
import time
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "raw-images"
RAW.mkdir(exist_ok=True)

# Load OPENAI_API_KEY from .env.local if not already in environment.
if not os.environ.get("OPENAI_API_KEY"):
    env = ROOT / ".env.local"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("OPENAI_API_KEY="):
                os.environ["OPENAI_API_KEY"] = line.split("=", 1)[1].strip()

API_KEY = os.environ.get("OPENAI_API_KEY")
if not API_KEY:
    sys.exit("OPENAI_API_KEY not set (expected in .env.local)")

# Shared style so every sprite belongs to the same world.
STYLE = (
    "16-bit retro pixel-art sprite, chunky visible square pixels, thick clean "
    "black 1px pixel outline, flat bold cartoon colours, limited arcade palette "
    "of bright yellow, electric blue, hot magenta-pink, mint green and cream, "
    "high contrast, sharp aliased edges, NO anti-aliasing, NO smooth gradients. "
    "The subject is centered and fully isolated on a PURE SOLID #000000 BLACK "
    "background with absolutely no other objects, no ground line, no drop shadow, "
    "no text, no border, no gradient — just the sprite floating on flat black."
)

# key -> (size, subject prompt)
ASSETS = {
    "duck-mascot": (
        "1024x1024",
        "a cute chubby yellow rubber duck mascot, friendly, sitting upright "
        "facing slightly right, small orange beak, single round black dot eye, "
        "rosy cheek pixel, simple and joyful",
    ),
    "duck-laptop": (
        "1024x1024",
        "a cute yellow rubber duck happily typing on a small open laptop that "
        "glows blue, lines of green pixel code on the screen, focused and proud",
    ),
    "duck-wave": (
        "1024x1024",
        "a cute yellow rubber duck waving hello with one wing raised, big "
        "welcoming grin, inviting friendly pose",
    ),
    "duck-trophy": (
        "1024x1024",
        "a cute yellow rubber duck holding up a shiny golden pixel trophy cup "
        "above its head, celebrating a win, sparkle pixels around the trophy",
    ),
    "duck-rocket": (
        "1024x1024",
        "a cute yellow rubber duck riding a small chunky pixel rocket ship "
        "blasting upward with magenta and yellow pixel flames, shipping to space",
    ),
    "duck-coffee": (
        "1024x1024",
        "a cute yellow rubber duck holding a steaming pixel coffee mug, late "
        "night hack session vibe, tiny laptop sticker on the mug",
    ),
    "hero-desk": (
        "1536x1024",
        "a wide cosy pixel-art scene of a yellow rubber duck building software "
        "at a desk: a chunky CRT-style monitor showing a code editor with green "
        "and blue pixel code, a mechanical keyboard, a coffee mug, a small potted "
        "plant, sticky notes, and a tiny golden trophy on a shelf — the duck sits "
        "on the desk facing the monitor, proud maker workspace",
    ),
    # --- WIDE full-bleed hero banner (spans the whole page width) ------------
    "hero-banner": (
        "1536x1024",
        "a WIDE horizontal panoramic pixel-art scene of the Deakin Software "
        "Engineering Club world, composition spread evenly left-to-right and "
        "vertically centred so it reads as a full-width banner: a chubby yellow "
        "rubber duck mascot standing proudly in the CENTRE on a chunky platform, "
        "flanked symmetrically by glowing CRT monitors showing code, stacked "
        "server towers with blinking lights, a tall arcade cabinet, floppy disks, "
        "a golden trophy, floating coins, code brackets < / > and little plants — "
        "colours strictly limited to hot magenta-pink #e91e63, tech cyan #00bcd4, "
        "creative violet #9c27b0, signal lime #c6ff00, energy coral #ff6b6b, duck "
        "yellow and cream, neon glow on the screens, energetic and friendly",
    ),
    # --- big ISOMETRIC 3D hero illustrations ---------------------------------
    "hero-iso-island": (
        "1536x1024",
        "an ISOMETRIC 3D pixel-art floating island workshop, dimetric 2:1 game "
        "perspective with strong depth and dimension, a chubby yellow rubber duck "
        "standing proudly at the centre on a chunky floating platform of cubic "
        "blocks, surrounded by glowing CRT monitors showing code, stacked server "
        "towers with blinking lights, a giant golden trophy, floating coins and "
        "code brackets, cables and little plants — heavy chunky cube shading with "
        "lit top faces and dark side faces to read as solid 3D, voxel-like, "
        "dramatic dimensional pixel art",
    ),
    "hero-iso-arcade": (
        "1536x1024",
        "an ISOMETRIC 3D pixel-art scene of a giant retro arcade cabinet and a "
        "stack of cubic server blocks built like a small city, dimetric 2:1 game "
        "perspective, a yellow rubber duck hero standing on top holding a flag, "
        "glowing neon screens, floppy disks and keyboards as 3D blocks, strong "
        "top-light and dark sides for solid cube shading, voxel-like chunky pixels, "
        "deep dimensional shadows, energetic",
    ),
    "duck-iso": (
        "1024x1024",
        "an ISOMETRIC 3D pixel-art yellow rubber duck rendered as a chunky solid "
        "voxel block model standing on a small cubic pedestal platform, dimetric "
        "2:1 perspective, clearly lit top faces and shaded side faces so it reads "
        "as a solid 3D object, thick outline, dramatic depth",
    ),
    "icon-star": ("1024x1024", "a single chunky 8-bit golden star burst sparkle"),
    "icon-heart": ("1024x1024", "a single chunky 8-bit hot-pink pixel heart"),
    "icon-floppy": ("1024x1024", "a single chunky 8-bit blue floppy disk save icon"),
    "icon-cursor": ("1024x1024", "a single chunky 8-bit white arrow mouse cursor pointer"),
    "icon-controller": ("1024x1024", "a single chunky 8-bit retro game controller gamepad"),
}


def generate(key: str, size: str, subject: str) -> None:
    prompt = f"{subject}. {STYLE}"
    print(f"  -> generating {key} ({size}) ...", flush=True)
    resp = requests.post(
        "https://api.openai.com/v1/images/generations",
        headers={"Authorization": f"Bearer {API_KEY}"},
        json={
            "model": "gpt-image-2",
            "prompt": prompt,
            "size": size,
            "quality": "high",
            "n": 1,
            "background": "opaque",
        },
        timeout=300,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"{key}: {resp.status_code} {resp.text[:400]}")
    b64 = resp.json()["data"][0]["b64_json"]
    out = RAW / f"{key}.png"
    out.write_bytes(base64.b64decode(b64))
    print(f"     saved {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)")


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    force = "--force" in sys.argv
    keys = args or list(ASSETS)
    for key in keys:
        if key not in ASSETS:
            print(f"  ?? unknown key '{key}', skipping")
            continue
        if not force and (RAW / f"{key}.png").exists():
            print(f"  == {key} already exists, skipping (use --force)")
            continue
        size, subject = ASSETS[key]
        for attempt in range(3):
            try:
                generate(key, size, subject)
                break
            except Exception as exc:  # noqa: BLE001
                print(f"     attempt {attempt + 1} failed: {exc}")
                time.sleep(4 * (attempt + 1))
        else:
            print(f"  !! gave up on {key}")


if __name__ == "__main__":
    main()
