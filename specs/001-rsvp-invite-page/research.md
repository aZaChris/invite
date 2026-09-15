# Phase 0 Research: RSVP Invite Page

No unresolved `NEEDS CLARIFICATION` markers remain in the Technical Context — both open questions were resolved directly with the user rather than needing independent research.

## Decision: Vercel (static + serverless + KV)

- **Decision**: Host the page on Vercel; RSVP endpoint as a Vercel serverless function; store responses in Upstash Redis.
- **Rationale**: User's explicit choice. No other hosting CLI/account was already set up on this machine (checked `vercel`/`netlify`/`wrangler`/`flyctl` — none installed); Vercel's free tier and `public/` + `api/` convention fit a single static page + one endpoint with zero extra infrastructure to run.
- **Alternatives considered**: Cloudflare Pages + KV (offered, not chosen). Self-hosted Node server (rejected — adds a server to operate for one endpoint, against Constitution V).

## Decision: RSVP form replaces the WhatsApp buttons

- **Decision**: The existing "Ci sarò" / "Sono in trasferta astrale" WhatsApp links become the RSVP form's two choice buttons; picking one plus entering a name submits to the backend instead of opening WhatsApp.
- **Rationale**: User's explicit choice — keeps the same two-choice visual pattern already in the design (Constitution I) while making responses trackable (the actual reason this feature exists).
- **Alternatives considered**: Keep WhatsApp links and add a separate form alongside — rejected by the user as extra UI surface for no added value.

## Decision: Edit the existing exported template in place, no rewrite

- **Decision**: `Invito Elisa.html` already renders standalone (fonts/images/logic self-contained; the visible markup uses a small in-page template runtime with `{{ }}` bindings, `sc-if`, `sc-camel-on-click`, and a `Component extends DCLogic` class). The RSVP feature is added by editing that embedded template and component directly, not by reimplementing the page in a new framework.
- **Rationale**: Constitution II (Minimal Surface) and V (Simplicity) — the page already works; rewriting it would be pure risk (visual drift) for no benefit. The template syntax is plain enough to extend with new state (`name`, `attending`, `message`, `submitting`, `submitted`) and a `fetch()` call in the existing `Component` class.
- **Alternatives considered**: Rebuild the page as a fresh static HTML/CSS/JS file from scratch — rejected, duplicates work already done and risks losing exact visual fidelity (Constitution I).

## Decision: Storage shape

- **Decision**: One Upstash Redis hash (`rsvp:responses`), field = guest name (trimmed, case-normalized for matching), value = JSON `{name, attending, message, submittedAt}`.
- **Rationale**: Simplest structure that satisfies FR-005 (update by name, not duplicate) and FR-006 (list all) with a single `HGETALL`/`HSET` — no schema/migration machinery needed for a KV store.
- **Alternatives considered**: A list/array of all submissions (append-only) — rejected, would require scanning + dedup logic on every read/write to satisfy FR-005, more code for the same outcome.

## Decision: Abuse protection

- **Decision**: A hidden honeypot field (rejected silently if filled) plus a cap on *distinct names per IP per 10-minute window* (max 8) — both enforced in `api/rsvp.js`.
- **Rationale**: FR-007 asks for "basic" protection without login. The first version rate-limited "1 submit per IP per 5 seconds", but that directly broke FR-005 (updating your own RSVP is a second submission under the same name, seconds apart, from the same IP) — caught by the smoke check (T014) failing on the update scenario. Capping *distinct* names per IP, not requests per IP, stops an IP from fanning out across many fake names while never throttling a guest correcting their own answer.
- **Alternatives considered**: A CAPTCHA (Turnstile/reCAPTCHA) — rejected as disproportionate ceremony for a private party invite (Constitution V); can be added later if spam actually shows up. Plain per-IP request throttling — rejected, see above.
