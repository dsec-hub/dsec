# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# dsec-games

The playable web surface (`games.dsec.club`). A THIN client: it renders games and
submits plays to dsec-api, which decides every score, point and leaderboard
position. This app holds ZERO scoring authority — never compute points here.

- The dsec-api service key is server-only. Browser code talks to our own
  `/api/games/*` route handlers, which add the key and call dsec-api.
- Identity comes from the shared portal session cookie (same `AUTH_SECRET`, cookie
  domain `.dsec.club`). Unauthenticated players can view, but must sign in at the
  portal to save a score.
- Design system is shared verbatim with dsec-website / dsec-app (`globals.css`,
  pixel ducks). Copy voice: Australian English, no em dashes, no semicolons,
  punchy, no corporate or gaming/esports framing.
