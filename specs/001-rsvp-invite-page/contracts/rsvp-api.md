# Contract: RSVP API

One serverless endpoint, `api/rsvp.js` (path `/api/rsvp`), two methods.

## POST /api/rsvp

Submit or update one guest's RSVP.

**Request body** (JSON):
```json
{
  "name": "string, required, non-empty after trim",
  "attending": "boolean, required",
  "message": "string, optional",
  "hp": "string, optional honeypot field — must be empty/absent"
}
```

**Responses**:
- `201 Created` — `{ "ok": true }` — stored (create or update-by-name, FR-005).
- `400 Bad Request` — `{ "ok": false, "error": "invalid_name" | "invalid_attending" | "too_long" }` — validation failed (FR-004); nothing stored.
- `429 Too Many Requests` — `{ "ok": false, "error": "rate_limited" }` — same IP has submitted more than 8 distinct names in the last 10 minutes (FR-007). Re-submitting under a name you've already used (an update, FR-005) never counts against this.
- Honeypot filled → respond `201 Created` with `{ "ok": true }` (so a bot can't distinguish success from rejection) but do **not** store anything.

## GET /api/rsvp

List all RSVPs, for Elisa's view (FR-006, User Story 3).

**Response**: `200 OK`
```json
{
  "responses": [
    { "name": "string", "attending": true, "message": "string", "submittedAt": "ISO 8601 string" }
  ]
}
```
Sorted by `submittedAt` descending (most recent first) — not a stated requirement, but the obvious useful default for a human scanning the list.

No auth on GET per spec.md Assumptions (unauthenticated-but-unlisted is acceptable for a private event). The response view page itself lives at an unlisted path (see quickstart.md) — not linked from the invite.
