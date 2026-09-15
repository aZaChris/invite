# Feature Specification: RSVP Invite Page

**Feature Branch**: `001-rsvp-invite-page`

**Created**: 2026-09-15

**Status**: Draft

**Input**: User description: "Publish the exported 'Invito Elisa' design (a Halloween/witch-themed 'sabba' party invite for Elisa, Saturday 3 October 2026, 21:00, at 'Opificio') as a live page, and add an RSVP so responses are recorded server-side instead of only via the WhatsApp links currently in the design."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the invite (Priority: P1)

A guest opens the shared invite link on their phone, taps to break the seal, and scrolls through the reveal: the name, the spell text, the two tarot cards (flip to reveal the date and the place), the dress code, and the closing call to respond.

**Why this priority**: This is the entire current design and the reason the link is being shared. Nothing else matters if this breaks.

**Independent Test**: Open the page on a phone-width viewport, tap the seal, scroll to the end, flip both cards — confirm the date ("3 ottobre 2026, sabato, ore 21") and place ("Opificio, al calare del buio") are revealed and match the source design exactly.

**Acceptance Scenarios**:

1. **Given** a guest opens the link, **When** the page loads, **Then** it shows the sealed moon screen exactly as in the source design.
2. **Given** the guest taps the seal, **When** they scroll down, **Then** each section reveals in the same order/animation as the source design, ending at the response section.

---

### User Story 2 - Respond on the page (Priority: P1)

A guest who has read the invite tells Elisa, from the same page, whether they're coming — without switching to WhatsApp — and their answer is saved.

**Why this priority**: This is the feature being added; without it there's nothing beyond the static design that already exists.

**Independent Test**: Fill in a name, choose "Ci sarò" or "Sono in trasferta astrale", optionally add a message, submit — confirm the submission is accepted and later visible to Elisa (User Story 3).

**Acceptance Scenarios**:

1. **Given** a guest enters their name and picks "Ci sarò", **When** they submit, **Then** the system stores their name, "attending", their message (if any), and a timestamp, and the guest sees a confirmation.
2. **Given** a guest picks "Sono in trasferta astrale" instead, **When** they submit, **Then** the system stores "not attending" the same way.
3. **Given** a guest submits with an empty name or without picking an answer, **When** they try to submit, **Then** the system rejects it with a clear message and nothing is stored.
4. **Given** a guest who already responded submits again under the same name, **When** they submit, **Then** their previous response is updated, not duplicated.

---

### User Story 3 - See who's coming (Priority: P2)

Elisa checks, at any time, who has responded and how — without asking each guest individually or digging through a chat.

**Why this priority**: Collecting responses is only useful if Elisa can actually read them; this is the payoff of User Story 2.

**Independent Test**: After a few test RSVPs are submitted, open the responses view and confirm every name, answer, message, and timestamp appears.

**Acceptance Scenarios**:

1. **Given** several guests have submitted RSVPs, **When** Elisa opens the responses view, **Then** she sees each guest's name, attending yes/no, optional message, and when they responded.

---

### Edge Cases

- Guest submits the form twice with slightly different name spelling/casing → treated as two separate responses (no fuzzy matching); acceptable for a small private guest list (see Assumptions).
- Automated/bot submits the form repeatedly or with garbage data → basic abuse protection (below) rejects or throttles it without blocking real guests.
- Guest is on a very narrow phone screen (360px) → the page and the RSVP form remain fully usable with no horizontal scroll.
- Guest has JavaScript disabled → same as the current design today (it already requires JavaScript to render at all); no new requirement introduced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The page MUST preserve the existing invite design and copy exactly as exported (seal-to-open interaction, scroll reveal sequence, tarot card flips, date "3 ottobre 2026, sabato, ore 21", place "Opificio, al calare del buio", dress code text).
- **FR-002**: The page MUST let a guest submit an RSVP directly on the page with: name (required), attending yes/no (required), and an optional free-text message.
- **FR-003**: The system MUST persist every submitted RSVP (name, attending, message, timestamp) so it survives after the guest closes their browser.
- **FR-004**: The system MUST reject a submission with an empty/whitespace-only name or with no attending choice selected, and MUST NOT store rejected submissions.
- **FR-005**: If a guest submits again under the same name, the system MUST update their existing response rather than create a duplicate.
- **FR-006**: The system MUST provide Elisa a way to see all submitted RSVPs (name, attending, message, timestamp).
- **FR-007**: The RSVP submission endpoint MUST apply basic abuse protection (e.g., reject a filled honeypot field, throttle repeated submissions from the same source) without requiring guests to create an account or log in.
- **FR-008**: The on-page RSVP form MUST replace the current WhatsApp "Ci sarò" / "Sono in trasferta astrale" buttons — the same two-choice visual pattern stays, but choosing one now also captures the guest's name and saves the response server-side instead of opening WhatsApp.
- **FR-009**: The page MUST remain fully usable (no horizontal scroll, RSVP form reachable and usable) at viewport widths from 360px to 400px.

### Key Entities

- **RSVP Response**: one guest's answer — name, attending (yes/no), optional message, submitted-at timestamp. Identified by name (see Assumptions).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A guest can submit their RSVP in under 30 seconds without leaving the invite page.
- **SC-002**: Elisa can see every guest's response without contacting them individually.
- **SC-003**: The invite is fully loaded and interactive on a mid-range phone in under 3 seconds on a typical mobile connection.
- **SC-004**: Zero submitted RSVPs are lost between submission and appearing in Elisa's view.

## Assumptions

- The guest list is small and private (a personal party, not a public event at scale) — exact-name matching for updates (FR-005) is an acceptable identifier; no login/accounts needed.
- No plus-one/guest-count field is required — the source design doesn't ask for one, and none was requested.
- Elisa is the only person who needs to view responses; a simple, unauthenticated-but-unlisted view is acceptable for User Story 3 unless a stronger requirement is given later.
- The existing WhatsApp number in the design belongs to Elisa and remains her personal contact regardless of how FR-008 is resolved.
