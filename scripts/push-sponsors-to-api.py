#!/usr/bin/env python3
"""Push the DSEC sponsor wall brands into dsec-api over the dsec-hub connection.

Idempotent. Reads DSEC_API_URL + DSEC_API_KEY from dsec-hub/.env.local and:

  (records, default)   ensures one Sponsor row per brand (create if missing,
                       else leave the existing row's data alone), show_on_website
                       = true so it qualifies for the public /website/sponsors feed.
  --logos              also uploads the cleaned logo from sponsor-logos/<slug>.png
                       (entity_type=sponsor, role=logo), removing any existing
                       logo on that sponsor first so the new one wins.

    python3 scripts/push-sponsors-to-api.py            # records only
    python3 scripts/push-sponsors-to-api.py --logos    # records + logos

The feed only shows a sponsor once it has BOTH show_on_website=true AND a logo.
"""
from __future__ import annotations

import json
import mimetypes
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ENV = ROOT / "dsec-hub" / ".env.local"
LOGO_DIR = ROOT / "sponsor-logos"

# organisation, website, relationship_type, logo slug (sponsor-logos/<slug>.png)
SPONSORS = [
    ("Red Bull", "https://www.redbull.com/au-en", "Sponsor", "redbull"),
    ("Deakin University", "https://www.deakin.edu.au", "Sponsor", "deakin"),
    ("DUSA", "https://www.dusa.org.au", "Sponsor", "dusa"),
    ("VicRoads", "https://www.vicroads.vic.gov.au", "Sponsor", "vicroads"),
    ("My First Australian Offer", "https://www.myfirstaustralianoffer.com.au", "Sponsor", "my-first-australian-offer"),
    ("TapCraft Studio", "https://www.tapcraft.shop", "Sponsor", "tapcraft"),
    # Acusys has no public logo yet — record created so it's ready, but it will
    # not appear on the wall until the committee supplies sponsor-logos/acusys.png.
    ("Acusys", None, "Sponsor", "acusys"),
]


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"').strip("'")
    return env


ENVV = load_env(ENV)
BASE = ENVV["DSEC_API_URL"].rstrip("/")
KEY = ENVV["DSEC_API_KEY"]


def api(method: str, path: str, body: dict | None = None) -> tuple[int, object]:
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{BASE}{path}", data=data, method=method)
    req.add_header("Authorization", f"Bearer {KEY}")
    if data is not None:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            raw = r.read()
            return r.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")


def upload_logo(sponsor_id: int, slug: str, name: str) -> None:
    png = LOGO_DIR / f"{slug}.png"
    if not png.exists():
        print(f"      (no {png.name} — skipping logo)")
        return
    # remove existing logo(s) so the fresh upload is the one the feed serves
    code, media = api("GET", f"/media?entity_type=sponsor&entity_id={sponsor_id}")
    if code == 200 and isinstance(media, list):
        for m in media:
            if m.get("role") == "logo":
                dc, _ = api("DELETE", f"/media/{m['id']}")
                print(f"      removed old logo media id={m['id']} ({dc})")
    boundary = f"----dsec{uuid.uuid4().hex}"
    blob = png.read_bytes()
    ctype = mimetypes.guess_type(png.name)[0] or "image/png"
    parts: list[bytes] = []

    def field(nm: str, val: str) -> None:
        parts.append(
            f'--{boundary}\r\nContent-Disposition: form-data; name="{nm}"\r\n\r\n{val}\r\n'.encode()
        )

    field("entity_type", "sponsor")
    field("entity_id", str(sponsor_id))
    field("role", "logo")
    field("alt_text", f"{name} logo")
    parts.append(
        f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{png.name}"\r\n'
        f"Content-Type: {ctype}\r\n\r\n".encode()
    )
    parts.append(blob)
    parts.append(f"\r\n--{boundary}--\r\n".encode())
    payload = b"".join(parts)
    req = urllib.request.Request(f"{BASE}/media", data=payload, method="POST")
    req.add_header("Authorization", f"Bearer {KEY}")
    req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            out = json.loads(r.read())
            print(f"      logo uploaded: media id={out['id']} {out['width']}x{out['height']} {out['size_bytes']}B")
    except urllib.error.HTTPError as e:
        print(f"      LOGO FAIL {e.code}: {e.read().decode(errors='replace')[:200]}")


def main() -> int:
    do_logos = "--logos" in sys.argv[1:]
    print(f"target: {BASE}   mode: {'records + logos' if do_logos else 'records only'}\n")

    code, existing = api("GET", "/sponsors?limit=200&include_archived=true")
    if code != 200:
        print(f"cannot list sponsors ({code}): {existing}")
        return 1
    by_name = {r["organisation"].strip().lower(): r for r in existing}

    for org, website, rel, slug in SPONSORS:
        row = by_name.get(org.strip().lower())
        if row:
            sid = row["id"]
            note = "exists"
            if not row.get("show_on_website"):
                c, _ = api("PATCH", f"/sponsors/{sid}", {"show_on_website": True})
                note = f"exists, set show_on_website ({c})"
        else:
            body = {"organisation": org, "show_on_website": True, "relationship_type": rel}
            if website:
                body["website"] = website
            c, created = api("POST", "/sponsors", body)
            if c != 201:
                print(f"  FAIL {org!r}: {c} {created}")
                continue
            sid = created["id"]
            note = "created"
        print(f"  {org:28} id={sid:<4} [{note}]")
        if do_logos:
            upload_logo(sid, slug, org)

    print("\ndone.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
