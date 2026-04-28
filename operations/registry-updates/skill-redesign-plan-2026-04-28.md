# Sage-Registry-Update Skill — Redesign Plan

**Date:** 2026-04-28
**Status:** Proposed (not yet adopted). This is the plan presented to the founder before any edit to `/.claude/skills/sage-registry-update/SKILL.md`.
**Supersedes:** N/A — this is the first redesign of the skill.
**Related:** D-REGISTRY-UPDATE-1.3.0 (2026-04-28; the design-feedback record), D-REGISTRY-UPDATE-1.3.0-SUPERSEDED (2026-04-28; the rollback rationale).

---

## Why the previous skill failed

The original skill scanned recent handoffs since `lastUpdated`, looked at `status` and `blocker` only, and explicitly preserved every other field (`notes`, `connects`, `deps`, `humanReady`, `agentReady`). That conservative scope produced an internally-contradictory partial state on the first invocation: rows promoted to `status: verified` retained `notes` text reading "Part of isolated Sage Mentor. Not integrated." The transitive impact on still-blocked rows was never assessed. After three patch cycles in one session, the founder concluded the skill answered the wrong question.

---

## What the redesigned skill must answer

**One question:** Does the registry reflect the actual current state of the project, across every field that drives the two HTML dashboards?

**Not:** What edits do recent handoffs justify against `status` and `blocker`?

The registry is the single source of truth for "what's done / what's next" on `https://www.sagereasoning.com/SageReasoning_Capability_Inventory.html` and `.../SageReasoning_Architecture_Map.html`. A field that's stale (e.g., `notes` saying "Not integrated" while `status: verified`) is itself a defect the skill must catch.

---

## What the HTMLs actually use

After reading both pages' source, here is what each registry field does:

**Capability Inventory** displays `name`, `type`, `oldStatus`, `status` (renamed "Honest Status"), `desc`, `notes`, `humanReady`, `agentReady`, `origin`. It searches against `name`, `desc`, `notes`, `type`, `origin`. It uses `blocker` (any non-empty string) to colour the entire row red.

**Architecture Map** matches registry rows to flow nodes by `id` and `name`. It uses `blocker` to colour the matched node's label red.

**Fields that exist in the registry but are NOT directly rendered:** `journey`, `priority`, `connects`, `deps`, `rules`, `ext`, `path`, `subtype`, `origin` (in some places), `proximity`, `oldStatus` is rendered but only as the historical "Map Status" comparison. These fields **drive interpretation** — particularly `connects`/`deps` for transitive impact analysis — but they don't show up to the user. Distinguishing these two layers matters for how thoroughly the skill audits each.

This is open question Q4 below.

---

## The four passes the redesigned skill must run

The skill walks through every component, not just those mentioned in handoffs. For each, it runs four passes:

**Pass 1 — Source scan.** Read every handoff in `/operations/handoffs/**/*.md` and every decision-log entry on or after `lastUpdated`. Extract claims about each component (status, integration, blocker resolution, runtime invocation).

**Pass 2 — Code-grep verification.** For each component whose path is in the registry, grep `/website/src/` for imports of that path. This is the actual-code-vs-handoff-text check that was forced by founder pushback three times in the previous session. A handoff saying "X is integrated" plus zero website imports of X means X is integrated *in idea* but not *in runtime*. The blocker text must reflect that distinction.

**Pass 3 — Transitive impact.** For each component changed by Pass 1 or Pass 2, walk the registry's `connects` and `deps` arrays. For every related component whose blocker text references the changed component's *old* state, flag for review. Example: if `engine-pattern-engine` moves from "isolated" to "verified", every component whose blocker says "Pattern engine not integrated" needs its blocker reviewed.

**Pass 4 — Internal consistency.** For every row in the registry (not just touched ones), check that `status`, `blocker`, `notes`, `humanReady`, and `agentReady` are mutually consistent. `status: verified` should not coexist with `notes: "Not integrated"`. `blocker: ""` should not coexist with `humanReady: "not-ready"` if the not-ready reason is integration. Every contradiction is flagged. This pass is what was missing from the previous design.

---

## Source-of-truth per field

The skill must name where each field's truth comes from before proposing any change.

| Field | Source-of-truth |
|---|---|
| `status` | Most recent handoff or decision-log entry using 0a vocabulary (Scoped/Designed/Scaffolded/Wired/Verified/Live). |
| `oldStatus` | Snapshot of `status` at the time of the previous registry update. Preserved automatically. |
| `desc` | Plain-language description of what the component is. Edited only if the component's architecture has changed. |
| `notes` | Synthesis of the row's *current state*: what a reader needs to know right now. Must be consistent with `status` and `blocker`. This is the field most likely to go stale. |
| `humanReady` | Whether a human user can use this component as-is. See open question Q3. |
| `agentReady` | Whether an external agent (API consumer) can use this component. See open question Q3. |
| `blocker` | Specific remaining work; empty string when nothing blocks. See open question Q2. |
| `connects` | Registry-internal edges. Updated when a component's logical dependencies in the registry change (renames, additions). |
| `deps` | External dependencies (claude-api, supabase, resend, etc). Edited only if the external surface changes. |
| `journey` | Where the component sits in the product surface (free_tier, paid_tier, internal, deprecated). Edited under decision-log entries (D-D1-* etc). |
| `priority` | Planning priority (P0–P7). Edited only when project priorities change. |
| `rules` | Manifest rules governing this component. Edited when rules added/removed. |

---

## Output shape

A single comprehensive proposal at `/operations/registry-updates/proposed-YYYY-MM-DD.md` (with `-b`, `-c` suffixes if multi-run in a day). Per row, the proposal lists:

- The current value of every changed field.
- The proposed new value.
- Per-field evidence: handoff quote, code-grep result, decision-log reference, internal-consistency reasoning. Whichever applies.

Founder reviews the proposal once, approves/modifies/rejects per item or in bulk, and the skill applies the approved set in one pass with one backup, one decision-log entry, one push.

---

## Pre-edit backup convention

Before editing `/.claude/skills/sage-registry-update/SKILL.md`, the current SKILL.md is copied to:

```
/archive/2026-04-28_sage-registry-update-SKILL_pre-redesign.md
```

This follows the D6-A archive convention used for governing-document edits.

---

## Risk classification

The SKILL.md edit is **Elevated** under 0d-ii: it's a governing document; it affects how every future registry update behaves. Critical Change Protocol (0c-ii) is not engaged because no live system or authentication surface is touched. The Elevated protocol — name what could break, provide rollback path, founder approval — is followed.

The first run of the redesigned skill produces a JSON proposal; that's a **Standard** read-only operation. Applying the proposal to disk is **Standard** with backup + rollback. Pushing to deploy is **Standard** but reaches the live site, so verification (Part E) follows.

---

## Open decisions for the founder

These are the four questions that need a direction before SKILL.md is rewritten. Each has options with reasoning, not a recommendation.

### Q1 — One skill or two?

The previous narrow design isn't *wrong* — it's just wrong for the founder's actual end-goal of seeing comprehensive current state. There's a use case for a quick incremental update between major checkpoints (where conservative defaults make sense) and a separate use case for a comprehensive audit (where the four passes above run).

**Option A — One skill, comprehensive.** The redesigned skill always runs all four passes. Slower, more thorough. Avoids the question of "which one am I running today?".

**Option B — Two skills.** `sage-registry-update` keeps the narrow incremental pattern (status + blocker, scoped against handoffs since `lastUpdated`). A new `sage-registry-audit` runs the four passes and is invoked less often (e.g., monthly, or before any major review). Splits the work shape; introduces choice overhead.

**Option C — One skill with a depth flag.** `sage-registry-update` runs the comprehensive shape by default, but accepts a "quick" mode for incremental status-only updates. One skill, two behaviours, founder picks at invocation.

### Q2 — Blocker semantics

When a blocking condition is genuinely resolved, should the skill clear the `blocker` field entirely (empty string → row turns from red to whatever the row's natural colour is) or always preserve a short note describing remaining work?

**Option A — Clear when resolved.** A row with no remaining work has `blocker: ""` and renders without red. This matches the founder's stated end-goal ("see what's done and what still needs to be done") cleanly: red means open work, no red means closed.

**Option B — Always preserve a "remaining work" note.** Even when integration is complete, the blocker field carries a short note about the next step (e.g., "Next: P3 evaluation"). Keeps everything visible but means the dashboards remain mostly red even as work completes.

**Option C — Clear by default, preserve only when there's a *named* outstanding item.** Hybrid: empty when truly done; populated when the next step is specific and known. Requires per-row judgement; the skill must make this call honestly per Pass 4.

### Q3 — `humanReady` / `agentReady` for pipeline-internal engines

Several components in the registry are pipeline-internal — they're never going to face human users or external agents directly. They sit between other components. Currently many of these read `humanReady: "not-ready"` and `agentReady: "not-ready"`, which renders them as gaps even though there's nothing to gap. One example in the registry uses `na` for the same shape (`engine-sage-reason-engine`).

**Option A — `na` for pipeline-internal components.** Engines that aren't user-facing read `humanReady: "na"` and `agentReady: "na"`. The dashboard shows "N/A" not "Not Ready". More honest about what each row means.

**Option B — Keep `not-ready` until exposed.** Everything that isn't user-accessible reads `not-ready` regardless of whether it's *intended* to be exposed. Simpler rule; produces more visual gaps.

**Option C — Per-row judgement.** Each component is assessed individually. The skill flags inconsistencies but doesn't apply a blanket rule. Most accurate; most work.

### Q4 — Layer A vs Layer B fields

Layer A fields render in the HTMLs (`name`, `type`, `oldStatus`, `status`, `desc`, `notes`, `humanReady`, `agentReady`, `origin`, `blocker`, plus `id` for matching). Layer B fields drive interpretation but don't render (`connects`, `deps`, `journey`, `priority`, `rules`, `ext`, `path`, `subtype`, `proximity`).

**Option A — Skill edits both layers when stale.** Comprehensive. Slowest, most thorough. Catches stale `connects` arrays that might mislead future analyses.

**Option B — Skill ensures Layer A is accurate; Layer B treated as separate audit.** Layer B is read for interpretation (Pass 3 transitive analysis) but only edited when explicitly named. Lighter; risks Layer B drifting silently.

**Option C — Skill edits Layer A; flags Layer B inconsistencies for founder decision per row.** Layer B isn't auto-edited but isn't ignored. The founder sees a list of "Layer B fields that look stale" and decides which to refresh.

---

## What does not change

- Propose-then-apply pattern. The skill never silently mutates the registry.
- Pre-edit backup to `/archive/component-registry/` before any JSON write. JSON validation post-write. Rollback via backup restore.
- Decision-log entry per applied update.
- Founder verifies on the live site between sessions; the skill provides the verification commands.
- The skill does **not** redesign or touch `flows.json` or `sage-flows-update`. That's a future session.

---

## After founder approval

1. Backup current SKILL.md to `/archive/2026-04-28_sage-registry-update-SKILL_pre-redesign.md`.
2. Edit `/.claude/skills/sage-registry-update/SKILL.md` to reflect the redesign and the founder's choices on Q1–Q4.
3. Append decision-log entry: D-REGISTRY-SKILL-REDESIGN-2026-04-28.
4. Run the redesigned skill to produce `/operations/registry-updates/proposed-2026-04-28-b.md`.
5. Founder reviews; approves; one apply; one push.
6. Verify on live site.
