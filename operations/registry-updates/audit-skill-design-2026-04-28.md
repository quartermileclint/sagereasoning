# Sage-Registry-Audit Skill — Design

**Date:** 2026-04-28
**Status:** Proposed (not yet adopted). This is the design presented to the founder before any edit creating `/.claude/skills/sage-registry-audit/SKILL.md`.
**Related:** `/operations/registry-updates/skill-redesign-plan-2026-04-28.md` (the parallel redesign of the existing update skill, deferred to next session).
**Decision-log entry:** D-REGISTRY-AUDIT-SKILL-CREATED-2026-04-28 (to be written on adoption).

---

## Why this skill exists

The component registry has accumulated drift between its claims and reality. Examples we already know:

- `lastUpdated` reads `2026-04-18` even though the file contains post-2026-04-18 content (D-D1-1 through D-D1-12 journey changes from 2026-04-25; D-D3-1 rename from 2026-04-22).
- `statusSummary` was wrong in the previous session — undercounted `scaffolded` and overcounted `wired`/`designed`. The rollback restored the wrong counts.
- "Isolated. Not integrated" blockers on components that are now Verified end-to-end on production (engine-pattern-engine, engine-ring-wrapper, agent-private-mentor).
- Three modules created during the lookback (`mentor-profile-adapter.ts`, `sage-mentor-ring-bridge.ts`, `mentor-interactions-loader.ts`) were not in the registry; only one was added before rollback. There may be more that have never been audited.

The update skill (`sage-registry-update`) brings in new work since `lastUpdated`. It does not, by itself, verify that the existing baseline is correct. If we run the update skill against a drifted baseline, we end up with new accurate state on top of old wrong state — and the dashboard remains misleading even after we push.

This skill is the verification half. It checks the existing registry against reality, surfaces every drift and completeness gap, and produces a corrections proposal the founder reviews before any push.

---

## What the skill does

The skill runs six passes against the existing registry, then produces a single comprehensive audit proposal. Founder reviews, approves, the skill applies the approved corrections, increments to a new version (typically a patch bump like v1.2.1), writes a decision-log entry, and provides git commands for the founder to deploy.

### Pass A — Path existence

For every component with a `path` field, confirm the path exists in the filesystem.

- File path (e.g., `/website/src/lib/foo.ts`): file must exist.
- Directory path (e.g., `/sage-mentor/`): directory must exist.
- Empty `path`: skipped.

Any component pointing to a non-existent path is flagged. Likely cause: file moved, renamed, or deleted without a registry update.

### Pass B — Code-grep integration check

For every component, search the website's source tree (`/website/src/`) for imports or references to the component's path.

Findings classified into:

- **Cited as integrated, found integrated.** Status `wired`/`verified`/`live` AND `≥1` import in `/website/src/`. Consistent.
- **Cited as integrated, NOT found integrated.** Status `wired`/`verified`/`live` AND `0` imports in `/website/src/`. Inconsistent — flag for status review or path correction.
- **Cited as isolated, found integrated.** `blocker` text says "isolated"/"not integrated" AND `≥1` import. Inconsistent — flag for blocker rewrite.
- **Cited as isolated, found isolated.** `blocker` text says "isolated"/"not integrated" AND `0` imports. Consistent.

This pass is the single biggest source of audit-driven corrections.

### Pass C — Internal consistency

For every row in the registry, check that `status`, `blocker`, `notes`, `humanReady`, `agentReady` are mutually consistent.

Specific contradiction checks:

- `status: verified` AND `notes` contains "Not integrated" or "Isolated" → inconsistent.
- `status: verified` AND `blocker` contains "Not integrated" or "Isolated" → inconsistent.
- `blocker: ""` (empty) AND `humanReady: not-ready` → inconsistent unless `agentReady` says otherwise and the row is genuinely pipeline-internal.
- `journey: deprecated` AND `status: live` → inconsistent.
- `humanReady: ready` AND `status: scoped`/`designed`/`scaffolded` → inconsistent (can't be human-ready before being wired).

### Pass D — Completeness walk

Walk every significant directory in the project and identify modules without a registry entry.

Directories walked:

- `/website/src/` — every `.ts` and `.tsx` file
- `/sage-mentor/` — every `.ts` file
- `/trust-layer/` — every `.ts` file
- `/agents/` — every `.md` and `.ts` file
- `/operations/` — strategic documents (Sage_Cofounder_Blueprint.md and similar)

For each file, check if any registry component's `path` field references it. If not, flag as a completeness gap with reasoning ("This file exists but no registry component represents it").

The skill then proposes either: (a) add a new registry component, or (b) attribute the file to an existing component as part of its surface, or (c) note that the file is wiring-code that doesn't warrant its own component. The founder decides per finding.

This pass directly addresses your concern about the registry being incomplete, not just inaccurate.

### Pass E — Header consistency

Check the registry header fields against actual content:

- `totalComponents` matches `components.length`.
- `statusSummary` counts match a fresh per-status recount.
- `lastUpdated` is older than or equal to the most recent edit date observed in the file (no stale lastUpdated when the body has newer edits).
- `version` is sensible given the recent change history (follows semver per the update skill's rules).

### Pass F — Decision-log cross-reference

Walk `/operations/decision-log.md` for entries that name specific component IDs or component names. For each, confirm the registry reflects the entry's outcome.

Examples this would catch:

- D-D1-1 through D-D1-12 (2026-04-25 journey field changes) — confirmed in registry.
- D-D3-1 (2026-04-22 rename of `doc-journal-layers` → `reasoning-journal-layers`) — confirmed in registry.
- D-RING-2-S4C (2026-04-26 canonical profile migration) — should be reflected in `engine-ring-wrapper`'s status/blocker.
- D-PE-01-S6-REFLECT-RECOMPUTE-VERIFIED (2026-04-26) — should be reflected in `engine-pattern-engine`'s status/blocker.

Any decision-log entry whose outcome isn't in the registry is flagged.

---

## Output shape

Single audit proposal at `/operations/registry-updates/audit-YYYY-MM-DD.md`. Sections:

1. **Header drift findings** — lastUpdated, version, statusSummary, totalComponents corrections.
2. **Per-row drift findings** — registry claim vs reality, with grep evidence per row.
3. **Internal consistency findings** — rows with contradictory fields (Pass C).
4. **Completeness gaps** — modules in code without registry entries; registry entries with missing paths.
5. **Decision-log items not yet reflected** — Pass F findings.
6. **No-change findings** — rows audited and confirmed accurate (consistency check passed; no need for change).

Per finding, the proposal lists: current state, proposed correction, evidence, reasoning. Founder reviews, approves/modifies/rejects per item or in bulk.

---

## Apply mechanics

After founder approval:

1. Pre-edit backup to `/archive/component-registry/component-registry.json.backup-audit-YYYY-MM-DD-HHMM`.
2. Apply approved corrections.
3. Recompute `statusSummary`.
4. Set `lastUpdated` to today's date.
5. Bump `version`: typically patch (v1.2.0 → v1.2.1) for corrections only; minor bump (v1.2.0 → v1.3.0) only if completeness adds new components.
6. JSON validate.
7. Write file.
8. Append decision-log entry: `D-REGISTRY-AUDIT-vX.Y.Z-YYYY-MM-DD`.
9. Provide git commands to the founder verbatim.
10. After deploy, founder verifies on live site.

---

## When to use

- After a substantial period of work where the registry's `lastUpdated` may have drifted.
- Before running the update skill on a registry whose accuracy is uncertain.
- After a rollback (like the v1.3.0 rollback this session).
- Manually as a periodic baseline check (e.g., monthly).

This skill does not run on a schedule. It is invoked manually when you decide it's needed.

---

## What this skill does not do

- Does not bring in "new work since lastUpdated" that hasn't yet been registry-tracked. That's the update skill's job.
- Does not change the registry schema. Schema changes require a separate decision.
- Does not edit `flows.json` or the architecture map's node positions. That's `sage-flows-update` (also out of scope this session).
- Does not silently mutate the registry under any circumstance. Every change requires founder approval.

---

## Risk classification

Creating `/.claude/skills/sage-registry-audit/SKILL.md` is **Elevated** under 0d-ii: it's a new governing document that affects future audit behaviour. Rollback by deleting the file or restoring from a pre-creation snapshot.

The audit skill's first run is **read-only** — it produces a proposal but doesn't write to the registry until the founder approves. That's **Standard** risk.

Applying audit corrections to the registry is **Standard** with backup + rollback. Pushing to deploy is **Standard** but reaches the live site, so verification follows.

---

## Pre-edit backup convention

Before creating `/.claude/skills/sage-registry-audit/SKILL.md`: not applicable (file doesn't exist yet).

Before applying audit corrections to the registry: backup at `/archive/component-registry/component-registry.json.backup-audit-2026-04-28-HHMM`.

Before any future edit to the audit SKILL.md: D6-A archive convention — backup to `/archive/[date]_sage-registry-audit-SKILL_pre-[change-id].md`.

---

## Phase structure for this session

Each phase is a natural pause point. You can call "done for now" at any checkpoint and we close cleanly.

1. **Phase 1 — Design approved.** You've read this document. You give OK or modifications.
2. **Phase 2 — Skill built.** I create `/.claude/skills/sage-registry-audit/SKILL.md` per the design. Decision-log entry written.
3. **Phase 3 — Audit run.** I invoke the skill against the current registry. Produces `/operations/registry-updates/audit-2026-04-28.md`.
4. **Phase 4 — Founder review.** You read the audit proposal. Decide which corrections to apply.
5. **Phase 5 — Apply approved corrections.** I apply per your direction. v1.2.1 written. Decision-log entry. Backup preserved.
6. **Phase 6 — Push.** Git commands provided. You push (or use GitHub Desktop if push fails per D-PR8-PUSH).
7. **Phase 7 — Verify.** After Vercel deploy (~1 minute), you check both HTML pages. Confirm corrections render. We walk through one or two specific rows together.
8. **Phase 8 — Session close.** Handoff written under 0b extensions.

The audit proposal in Phase 3 will likely be substantial — possibly dozens of corrections. Phase 4 (your review) is the longest phase by founder time.
