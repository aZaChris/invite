# Implementation Plan: RSVP Invite Page

**Branch**: `001-rsvp-invite-page` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-rsvp-invite-page/spec.md`

## Summary

Publish the existing exported invite (`Invito Elisa.html`) as-is — it is a self-contained, portable page (fonts/images inlined, own template runtime) — and edit its embedded template/component in place to replace the two WhatsApp buttons with a small RSVP form (name + attending + optional message) that POSTs to one serverless endpoint backed by Upstash Redis. Deployed on Vercel.

## Technical Context

**Language/Version**: Vanilla JS (matches the existing bundle's runtime; no build step introduced), Node.js (Vercel serverless function runtime, current LTS)

**Primary Dependencies**: `@upstash/redis` only (official client for Upstash Redis) — no framework added for the page itself, since it already renders standalone

**Storage**: Upstash Redis (via Vercel Marketplace integration) — one hash/list of RSVP records keyed by guest name

**Testing**: One smoke script exercising the RSVP endpoint (happy path submit + update, and one validation-failure case) — see constitution's "no test scaffolding beyond one smoke check"

**Target Platform**: Vercel (static hosting + serverless functions)

**Project Type**: Single small web app (one static page + one API route) — not a frontend/backend split, Vercel's own `public/` + `api/` convention covers both

**Performance Goals**: Page interactive in <3s on a mid-range phone over mobile network (SC-003); RSVP submit round-trip <1s on a normal connection

**Constraints**: No horizontal scroll / fully usable at 360-400px width (FR-009); no login/accounts (Assumptions); must preserve existing visual design and copy exactly (FR-001)

**Scale/Scope**: A single private event's guest list (tens of guests, not thousands) — informs the "exact-name-match" identity assumption in spec.md

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Design Fidelity** — PASS. The plan edits the existing exported template in place rather than rebuilding it; visuals/copy untouched except the RSVP section, which keeps the same two-choice button styling.
- **II. Minimal Surface (YAGNI)** — PASS. One page, one API route, one KV store. No accounts, no admin framework, no CMS.
- **III. Mobile-First, Single Page** — PASS. No new pages added; RSVP section is the existing final section of the single-page scroll.
- **IV. RSVP Is the Only Backend Concern** — PASS. The one API route only accepts/validates/stores RSVPs and serves the responses list; nothing else.
- **V. Simplicity Over Framework Ceremony** — PASS. No build pipeline, no ORM, no service split. `@upstash/redis` is the one dependency, required because "smallest stack that ships" on Vercel without hand-rolling a Redis client.

No violations — Complexity Tracking section not needed.

**Post-Phase-1 re-check**: Design added one small unlisted page (`risposte.html`) for Elisa to view responses. This doesn't violate III (Mobile-First, Single Page) — that principle governs the guest-facing invite, which stays one page; `risposte.html` is a separate, unlinked utility view, not a second guest-facing page. Still PASS on all five principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-rsvp-invite-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md         # Phase 1 output
├── quickstart.md         # Phase 1 output
├── contracts/            # Phase 1 output
└── tasks.md              # Phase 2 output (/speckit-tasks — not created here)
```

### Source Code (repository root)

```text
public/
├── index.html            # the edited "Invito Elisa" export (design + RSVP form + submit logic)
└── risposte.html         # unlisted page for Elisa: fetches GET /api/rsvp, lists responses

api/
└── rsvp.js                # Vercel serverless function: GET (list responses), POST (submit/update one)

lib/
└── kv.js                  # thin wrapper around @upstash/redis (read/write RSVP records)

scripts/
└── smoke-rsvp.mjs          # the one smoke check (constitution: Development Workflow)

vercel.json                 # (only if defaults need overriding — likely unnecessary)
package.json                # single package, `@upstash/redis` as the only dependency
```

**Structure Decision**: Single Vercel project using its native `public/` (static) + `api/` (serverless functions) convention — no separate frontend/backend projects, matching Constitution II and V.
