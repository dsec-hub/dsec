# DSEC SEO launch checklist

Tracks the **data** and **off-page** work that the strategy doc (§7, §2.3, §2.4)
calls for but that can't be coded from this repo. The technical SEO, voice and
funnel work (Phases 1–3) is already done in code.

## Phase 4 — content placeholders (replace before launch)

Each is flagged in-code with a `PlaceholderNote` or `// PLACEHOLDER` comment.

- [ ] **Discord invite** — set a permanent invite in `src/lib/content.ts` (`site.discord`). Currently `discord.gg/REPLACE-permanent-invite`. Every Join CTA depends on it.
- [ ] **LinkedIn URL** — `site.linkedin` in `src/lib/content.ts`. Until set, it's filtered out of the Organization `sameAs` schema automatically.
- [ ] **Committee** — replace the 8 placeholder names + duck avatars in `team[]` (`content.ts`) with real names, roles and headshots (`src/app/about/page.tsx`).
- [ ] **Projects** — swap the 4 sample projects in `projects[]` for real member projects: title, one-liner, builder, stack, screenshot (`.webp`, <100KB, descriptive alt), and real repo/live links.
- [ ] **Events** — confirm real dates and set `isoDate` (YYYY-MM-DD) on each event in `events[]`. Only events with `isoDate` emit Event JSON-LD, so dated events will surface as rich results. Add a real `registerUrl` for upcoming events (currently `#register`).
- [ ] **Event photos** — replace pixel-duck placeholders with real photos of the ACUSYS×DUCA hackathon and the Utkarsh Manocha workshop.
- [ ] **Sponsor pricing decision** (open §7) — decide whether to name final tier prices now or keep routing to a call until the DUSA prospectus is signed off with Ranveer + Sophie. Edit `tiers[]` in `content.ts`.
- [ ] **Sponsor form backend** — `src/components/sponsor-form.tsx` currently hands off to a pre-filled `mailto:`. Wire to a real destination (form backend / CRM) before relying on it.

## Phase 5 — off-page & verification (once live)

- [ ] **Google Search Console** — verify the domain, then set `NEXT_PUBLIC_GSC_VERIFICATION` (the meta tag wires up automatically via `layout.tsx`). Submit `https://dsec.club/sitemap.xml`. This is the single most useful SEO action — it confirms "DSEC" / "deakin software club" resolve to the site.
- [ ] **DUSA club directory** — get DSEC listed/linked from the Deakin/DUSA clubs pages. A `.edu.au` backlink is the strongest, most natural trust signal DSEC will get.
- [ ] **Social profiles link back** — GitHub org, LinkedIn and Discord all linking to `dsec.club`.
- [ ] **Partner/co-host backlinks** — ask event co-hosts and sponsors (ACUSYS, DUCA, future partners) to link to DSEC from their sites/announcements.
- [ ] **Don't** buy links or do directory spam. Gut check: "what would a real club do?"

## What to measure (§6)

- Search Console branded-query impressions/clicks ("DSEC", "deakin software club").
- Discord joins from the site.
- Sponsor enquiry form submissions.
- Mobile load time (PageSpeed Insights — target sub-3s).
- **Ignore** rankings for competitive non-branded terms, and vanity impressions.

## Verify after each deploy

- `/sitemap.xml` and `/robots.txt` resolve.
- `/opengraph-image`, `/join/opengraph-image`, `/sponsor/opengraph-image` render the pixel cards.
- Paste a link into [opengraph.xyz](https://www.opengraph.xyz) or LinkedIn Post Inspector to confirm the share card.
- Validate JSON-LD with the [Rich Results Test](https://search.google.com/test/rich-results) (Organization on Home/About, Event on Events).
