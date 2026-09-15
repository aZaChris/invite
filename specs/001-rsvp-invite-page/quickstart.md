# Quickstart: RSVP Invite Page

## Prerequisites

- Node.js (current LTS) and `npm`
- A Vercel account, linked via the Vercel CLI (`npm i -g vercel`, then `vercel login`) — needed before the first deploy/store provisioning; local dev works without it via `vercel dev`.
- An Upstash Redis database, added from the Vercel dashboard (Storage tab → Marketplace Database Providers → Upstash) and linked to this project, then `vercel env pull` to get `KV_REST_API_URL` / `KV_REST_API_TOKEN` locally (Vercel's Upstash integration exposes these names for backward compatibility with the old Vercel KV client).

## Setup

```bash
npm install            # installs @upstash/redis
vercel dev             # runs public/ + api/ locally with KV connected
```

Open `http://localhost:3000` — the invite. Open `http://localhost:3000/risposte.html` — the responses view.

## Validate User Story 1 (view the invite)

1. Open the local URL on a 390px-wide viewport (or an actual phone).
2. Tap the sealed moon → confirm the reveal sequence (spell typing, header, tarot cards, dress code, RSVP section) matches the source `Invito Elisa.html` exactly.
3. Flip both tarot cards → confirm "3 ottobre 2026 · sabato · ore 21" and "Opificio · al calare del buio" appear.

## Validate User Story 2 (submit an RSVP)

1. Scroll to "Risponderai?", enter a name, tap "Ci sarò".
2. Confirm a success state is shown and no page navigation/WhatsApp redirect occurs.
3. Re-submit the same name with "Sono in trasferta astrale" → confirm it updates (not duplicates) — check via `/risposte.html` or `curl localhost:3000/api/rsvp`.
4. Submit with an empty name → confirm a validation error is shown and nothing new appears in `/api/rsvp`.

## Validate User Story 3 (Elisa sees responses)

1. After a few test submissions, open `/risposte.html`.
2. Confirm every submitted name, attending value, message, and timestamp is listed, most recent first.

## Run the smoke check

```bash
node scripts/smoke-rsvp.mjs
```
Exercises: one valid submit, one update-by-name, one validation failure (empty name) — asserts on the HTTP status/body of each (see contracts/rsvp-api.md).

## Deploy

```bash
vercel --prod
```
Share the deployed URL as the invite link; keep `/risposte.html` unlisted (not linked from the invite).
