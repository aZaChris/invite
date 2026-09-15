# Tasks: RSVP Invite Page

**Input**: Design documents from `/specs/001-rsvp-invite-page/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rsvp-api.md, quickstart.md

**Tests**: Constitution limits testing to one smoke check (Development Workflow) — no per-story test tasks beyond it (Polish phase, T014).

**Organization**: Grouped by user story (spec.md priorities: US1/US2 = P1, US3 = P2).

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Setup

- [X] T001 Create `public/`, `api/`, `lib/`, `scripts/` directories per plan.md Project Structure
- [X] T002 `npm init -y` at repo root, add `@upstash/redis` as the only dependency (`npm install @upstash/redis`)
- [X] T003 `git mv "Invito Elisa.html" public/index.html` — one canonical copy, no duplicate at repo root

---

## Phase 2: Foundational (blocks all user stories)

- [X] T004 Implement `lib/kv.js`: `getResponse(nameKey)`, `setResponse(nameKey, record)`, `listResponses()` wrapping `@upstash/redis` `HGET`/`HSET`/`HGETALL` on hash `rsvp:responses`, per data-model.md
- [X] T005 Create `api/rsvp.js` with method routing (POST/GET handled, all others → 405), importing `lib/kv.js`

**Checkpoint**: KV wrapper and API entrypoint exist — user stories can now be built.

---

## Phase 3: User Story 1 - View the invite (Priority: P1) 🎯 MVP

**Goal**: The invite renders on Vercel exactly as the original export.

**Independent Test**: Per quickstart.md "Validate User Story 1" — open on a 390px viewport, tap the seal, scroll through, flip both cards, confirm date/place text.

- [X] T006 [US1] Serve `public/index.html` via `vercel dev`; diff-check against the original `Invito Elisa.html` (pre-move) to confirm byte-for-byte parity before any edits in Phase 4 touch it

**Checkpoint**: Invite viewable and visually identical to the source export.

---

## Phase 4: User Story 2 - Respond on the page (Priority: P1)

**Goal**: A guest can submit name + attending + optional message from the page; it's stored server-side.

**Independent Test**: Per quickstart.md "Validate User Story 2" — submit, confirm no WhatsApp redirect, re-submit same name to confirm update-not-duplicate, submit empty name to confirm rejection.

- [X] T007 [US2] In `public/index.html`'s `<x-dc>` template, replace the two WhatsApp `<a>` links in the "Risponderai?" section with: a text input bound to `{{ name }}`, and the two existing buttons re-wired to `sc-camel-on-click="{{ chooseAttending }}"` (passing `true`/`false`) instead of `href`
- [X] T008 [US2] In the embedded `Component` class (`public/index.html`), add state (`name: ''`, `attending: null`, `message: '', submitting: false, submitted: false, error: null`) and a `submit()` method: client-side validates non-empty name and a chosen `attending`, then `fetch('/api/rsvp', { method: 'POST', body: JSON.stringify({ name, attending, message, hp: this.hp }) })`
- [X] T009 [US2] In `api/rsvp.js`, implement `POST`: validate per data-model.md (name required/non-empty/≤100 chars, attending boolean, message ≤500 chars) and contracts/rsvp-api.md (honeypot field `hp` → silently accept without storing; per-IP rate limit via a short-TTL KV key), then `lib/kv.js.setResponse` keyed by `name.trim().toLowerCase()`; return 201/400/429 per contract
- [X] T010 [P] [US2] In `public/index.html`, add the submitting/submitted/error UI states (simple text swap in the same typography/spacing as the existing design — no new visual language)

**Checkpoint**: A guest can RSVP on-page; responses are stored and updatable by name.

---

## Phase 5: User Story 3 - See who's coming (Priority: P2)

**Goal**: Elisa can view every RSVP without asking guests individually.

**Independent Test**: Per quickstart.md "Validate User Story 3" — after test submissions, open `/risposte.html` and confirm all fields are listed, most recent first.

- [X] T011 [US3] In `api/rsvp.js`, implement `GET`: `lib/kv.js.listResponses()`, sort by `submittedAt` descending, return `{ responses: [...] }` per contracts/rsvp-api.md
- [X] T012 [P] [US3] Create `public/risposte.html`: fetches `GET /api/rsvp` on load, renders name/attending/message/submittedAt as a simple list, dark theme consistent with `index.html`, not linked from it

**Checkpoint**: All three user stories independently functional.

---

## Phase 6: Polish & Cross-Cutting

- [X] T013 [P] Add `.gitignore` (`node_modules/`, `.vercel/`, `.env*`)
- [X] T014 Write `scripts/smoke-rsvp.mjs`: one valid POST, one update-by-name POST (same name, different `attending`), one validation-failure POST (empty name) — asserts HTTP status/body per contracts/rsvp-api.md (constitution's one required smoke check)
- [X] T015 Run every scenario in quickstart.md end-to-end against `vercel dev` before deploying — done: static pages 200, RSVP submit+update+validation verified via smoke check, a real rate-limiter bug found & fixed in the process (see research.md).

---

## Dependencies & Execution Order

- **Setup (T001-T003)**: no dependencies, run first and sequentially (T003 depends on T001).
- **Foundational (T004-T005)**: depends on Setup; blocks every user story.
- **US1 (T006)**: depends on Foundational only.
- **US2 (T007-T010)**: depends on Foundational only; T007→T008→T009 sequential (same file/flow), T010 parallel with T009.
- **US3 (T011-T012)**: depends on Foundational only; independent of US2 (different handler, different file) — can be built in parallel with US2 by a second contributor.
- **Polish (T013-T015)**: T013 anytime after Setup; T014 after US2+US3 exist (exercises both); T015 last, before deploy.

## Implementation Strategy

**MVP** = Setup + Foundational + US1 + US2 (T001-T010): guests can view the invite and RSVP. Deploy this before building US3 if the response-viewing page can wait.

**Incremental**: MVP → add US3 (Elisa's view) → Polish (smoke check + full quickstart pass) → `vercel --prod`.
