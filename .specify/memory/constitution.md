# Invito Elisa Constitution

## Core Principles

### I. Design Fidelity
The exported design (`Invito Elisa.html`, from the Claude Design canvas) is the source of truth for visuals: layout, colors, typography, copy, and animations. Reimplementation MUST preserve it pixel-for-pixel; do not invent new visual elements or restyle sections without an explicit request.

### II. Minimal Surface (YAGNI)
Build only what's needed for a working invite page with RSVP: static content + one form + one storage endpoint. No user accounts, no admin dashboard, no CMS, no multi-tenant abstractions, unless explicitly requested. Every added dependency or moving part must justify itself against "could this be a static file or one endpoint instead?"

### III. Mobile-First, Single Page
Guests open this from a phone via a shared link or QR code. The page MUST be fully usable at 360-400px width with no horizontal scroll, fast first paint, and the RSVP form reachable without hunting. Desktop is a bonus, not the design target.

### IV. RSVP Is the Only Backend Concern
The only server-side responsibility is: accept an RSVP submission, validate it, store it, prevent obvious abuse (duplicate/garbage spam). No feature beyond that belongs in the backend without a new principle amendment.

### V. Simplicity Over Framework Ceremony
Prefer the smallest stack that ships the above: plain HTML/CSS/JS or a single lightweight framework, a single small backend function/route, a single datastore. Do not introduce a build pipeline, ORM, or service split unless the chosen stack requires it to run at all.

## Content & Language

The invite content is in Italian, for a real event (Elisa). Do not alter names, dates, or wording present in the source design without being told the correct replacement — ask rather than guess.

## Development Workflow

Spec-driven via spec-kit (`/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement`). Shell/dev commands go through `rtk` where the project's tooling supports it. No test framework scaffolding beyond one smoke check for the RSVP submit path (happy path + one validation failure).

## Governance

This constitution supersedes ad hoc choices made during implementation. Amendments happen via `/speckit-constitution` when the user changes scope (e.g., adds a feature beyond RSVP). Version bumps: MAJOR for removing/redefining a principle, MINOR for adding one, PATCH for wording fixes.

**Version**: 1.0.0 | **Ratified**: 2026-09-15 | **Last Amended**: 2026-09-15
