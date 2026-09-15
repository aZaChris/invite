# Phase 1 Data Model: RSVP Invite Page

## RSVP Response

Represents one guest's answer (spec.md Key Entities).

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | Trimmed; empty/whitespace-only rejected (FR-004). Lowercased+trimmed copy used as the KV hash field for matching (FR-005); original casing kept in the stored value for display. |
| `attending` | boolean | yes | `true` = "Ci sarò", `false` = "Sono in trasferta astrale" (FR-002). |
| `message` | string | no | Free text, optional (FR-002). Empty string stored as `""`, not omitted, for a stable shape. |
| `submittedAt` | ISO 8601 string | yes | Set server-side on write; overwritten on update (FR-005), not client-supplied. |

**Storage**: Upstash Redis hash `rsvp:responses`, field = `name.trim().toLowerCase()`, value = JSON-encoded `{name, attending, message, submittedAt}`.

**Validation rules** (enforced in `api/rsvp.js`, not trusted from the client):
- `name`: required, non-empty after trim, max 100 chars (defensive cap, not a stated requirement — prevents abuse payloads).
- `attending`: required, must be boolean.
- `message`: optional, max 500 chars (defensive cap).

**State transitions**: none beyond create-or-update-by-name (FR-005) — there is no separate "delete" or "cancel" operation in scope.
