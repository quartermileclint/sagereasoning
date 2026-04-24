# SageReasoning Project Index

Last updated: 24 April 2026 | Maintained as part of P0 item 0e
Prior versions preserved in `/archive/` (most recent: `2026-04-24_INDEX_pre-D4-trim.md`)

---

## Purpose (trimmed as of 2026-04-24, resolving D4-D)

INDEX is a **governance navigator** — it tells you where governing documents, archive protocol, and handoff structure live. It does **not** try to track current project status or current technical state. Those change frequently and drift is the recurring failure mode.

**For current project status:** read `PROJECT_STATE.md` at root.
**For current technical state:** read `summary-tech-guide.md` + `summary-tech-guide-addendum-context-and-memory.md` at root (both adopted Apr 22 and kept live). `TECHNICAL_STATE.md` is older (Apr 11) and being assessed under D5.

Code directories (`/website/`, `/api/`, `/sage-mentor/`, `/trust-layer/`, etc.) are not listed here to prevent status drift. Their current status is part of `PROJECT_STATE.md` and the tech guide.

---

## Inbox / Outbox

| Folder | Direction | Purpose |
|--------|-----------|---------|
| /inbox/ | Founder to AI | Drop any file here for review. It gets read, acted on, then filed. |
| /outbox/ | AI to Founder | Drafts, reports, and deliverables placed here for your review. |

---

## Governance Files (canonical as of 2026-04-24)

| File | Purpose |
|------|---------|
| `/manifest.md` | Master governance. R0-R20. Read before every task. Current version: CR-2026-Q2-v4 (Apr 18). |
| `/operations/decision-log.md` | Append-only record of every consequential decision (P0 item 0f). |
| `/operations/discrepancy-sort-2026-04-23.md` | Active governance-corpus discrepancy register (D1-D17). |
| `/operations/knowledge-gaps.md` | PR5 register — concepts that earned a permanent entry after three re-explanations. |
| `/operations/verification-framework.md` | P0 item 0c — how both parties verify work. |
| `/operations/handoffs/` | Canonical handoff tree — see "Handoff Structure" below. |
| `/LICENSE` | Proprietary Evaluation-Only licence. |

Root-level files that are **content, not governance** (updated as project evolves): `README.md`, `PROJECT_STATE.md`, `TECHNICAL_STATE.md`, `summary-tech-guide.md`, `summary-tech-guide-addendum-context-and-memory.md`, `users-guide-to-sagereasoning.md`, `SageReasoning_Ecosystem_Map.html`. Read these for project/technical/user state — do not read INDEX for those.

---

## Governance Corpus Folders

| Folder | Purpose |
|--------|---------|
| `/adopted/` | Current governing documents beyond the manifest. As of 2026-04-24 empty of governing files — V3 Adoption Scope `.md` and `.docx` resolved under D3 (see decision-log DD-2026-04-24-03 and -04). `backup/` subfolder is a harmless D6-A placeholder. |
| `/drafts/` | Documents under review, pending founder approval. Currently empty. `backup/` subfolder is a harmless D6-A placeholder. |
| `/archive/` | Superseded versions (moved here, never deleted). Single canonical archive location — see "Archive Protocol" below. |
| `/compliance/` | Regulatory register, audit logs, security reviews. |
| `/reference/` | Knowledge context, ethical analysis, research (R17-R20 source material, Knowledge Context, Human-AI Development KB). |
| `/legal/` | Licences, terms, privacy, IP-protection audits. |

---

## Archive Protocol (canonical as of 2026-04-23, resolving D6-A)

Single canonical archive location: **`/archive/`** at repo root.

When a governing or strategic file is updated, the previous version is copied to `/archive/` with a date-prefixed descriptive name (e.g. `2026-04-24_INDEX_pre-D4-trim.md`) **before** the update is applied. No version is silently lost.

Superseded forms (retired by D6-A):
- `/backup/` subfolders inside strategic folders — retired. Existing empty `/backup/` folders remain as harmless placeholders; prior content was migrated to `/archive/2026-04-15_R20a-drafts-backup/`.
- Inline `.backup-YYYY-MM-DD` sibling files — retired. Existing inline backups were migrated to `/archive/2026-04-21_inline-backups/` and `/archive/2026-04-22_inline-backups/`.

Recorded in `/operations/decision-log.md` (DD-2026-04-23-01) and `/operations/discrepancy-sort-2026-04-23.md` (D6).

---

## Handoff Structure (canonical as of 2026-04-23, resolving D7-C)

Single canonical handoff path: **`/operations/handoffs/`** with six role subfolders plus a rollup folder.

| Subfolder | Purpose |
|-----------|---------|
| `/operations/handoffs/founder/` | Founder-led sessions, top-level decisions, scope changes |
| `/operations/handoffs/ops/` | Operational state, costs, infrastructure, deployment, sage-ops |
| `/operations/handoffs/tech/` | Code changes, architecture, build state, context loaders |
| `/operations/handoffs/growth/` | Content, positioning, market signals |
| `/operations/handoffs/support/` | User-facing safety, crisis resources, support inbox |
| `/operations/handoffs/mentor/` | Mentor-system changes, mentor profile, mentor KB |
| `/operations/handoffs/_rollup/` | Milestone summaries appended from stream handoffs (R1 manual — founder signals "rollup [milestone-name]") |

File-name conventions per stream:
- `*-prompt.md` — session-opening prompt
- `*-handoff.md` — mid-work state
- `*-close.md` — session-closing note

Retired paths:
- `/operations/session-handoffs/` — migrated to `/operations/handoffs/founder/`. Empty stub with `MIGRATED.md` breadcrumb.
- `/website/operations/session-handoffs/` — abandoned; archived to `/archive/2026-04-16_website-session-handoffs/`.

Rollup mechanism: **R1 (manual)**. Founder signals "rollup [milestone-name]"; AI consolidates the relevant stream entries into a single file in `_rollup/` with date and milestone name; stream files remain in place; founder approves before commit.

---

## Quick Reference

**Status vocabulary (P0 item 0a):**
Scoped → Designed → Scaffolded → Wired → Verified → Live

**Communication signals (P0 item 0d):**
Founder: "Explore" / "Design" / "Build" / "Ship" / "I've decided" / "Thinking out loud" / "I'm done for now" / "Treat this as critical"
AI: "Confident" / "Making an assumption" / "Need your input" / "Push back" / "Limitation" / "This change has a known risk" / "I caused this"

**Risk classification (0d-ii):** Standard / Elevated / Critical. AI classifies; founder can reclassify upward. Safety-critical code is always Critical (PR6).

**Before any task:** read `manifest.md` and quote applicable rules by number.

**To find a document not listed here:** check `PROJECT_STATE.md` for current content, the ecosystem map (`SageReasoning_Ecosystem_Map.html`) for the full visual inventory, or grep the repo.

---

## What moved out of INDEX in the D4-D trim (2026-04-24)

The trim removed:
- `Root Files` status table (was drifting — status words contradicted 0a vocabulary).
- `Folder Structure` listings for business / marketing / product / engineering / prototypes / brand / templates / manuals (descriptions were fine, but they were already duplicated in the ecosystem map).
- `Code Directories` status table (was explicitly stale — `/website/` marked `Scaffolded` when hub is wired-and-live; this kind of drift is what the trim is for).
- `Operational Directories` status table (used vocabulary outside 0a — "Current/Active/Empty" — with no clear semantics).

Rationale: INDEX drifts. Every time it drifts, a session has to spend time fixing it. The governing purpose — "where does authoritative governance live" — doesn't need any of those tables. The ecosystem map + `PROJECT_STATE.md` + the tech guide cover the rest.

Prior version preserved at `/archive/2026-04-24_INDEX_pre-D4-trim.md`.

**Backlog item (deferred under PR7):** Option C from D4 — auto-generated INDEX via file-tree scan. Reconsider if the trimmed INDEX itself starts drifting. Tracked in decision-log DD-2026-04-24-05.
