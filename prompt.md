# Next Session — After D3 Registry Hygiene + D-D3-1 In-Session Resolution

**Date written:** 22 April 2026 (end of D3 session; Ops re-probe confirmed resolution on production).
**Read first:** `/operations/handoffs/sage-ops-d3-registry-hygiene-close.md` (including the **Post-close amendment** at the top — it records the one mid-session correction).
**Previous prompt (for context):** the "Session — After B3 Blocker-Field Classification" prompt that opened the D3 session.

## Status Snapshot

D3 landed and is verified on production. The `doc-journal-layers` duplicate id was resolved via Option B: index 104 renamed to `reasoning-journal-layers`, with `path` / `desc` / `ext` corrected to describe the code implementation rather than the spec document. Ops' post-deploy probe confirmed the resolution — it now references D-D3-1 as the resolution entry rather than D-B3-3 as a deferred item.

Four decision-log entries landed this session:

- `D-B3-1` at line 1022 — loader filter on `by_journey` by blocker-field presence (retroactive for B3).
- `D-B3-2` at line 1040 — REAL / STATUS / BORDERLINE classification rubric (retroactive for B3).
- `D-B3-3` at line 1058 — duplicate id deferred (retroactive for B3, now effectively superseded by D-D3-1).
- `D-D3-1` at line 1076 — rename of `doc-journal-layers` to `reasoning-journal-layers`; explicitly resolves D-B3-3. Appended in-session after Ops probe revealed log-vs-state drift.

Registry now: 163 entries, 0 duplicate ids, 19 explicit blockers distributed `paid_api=3 / both=3 / free_tier=9 / internal=4 / unknown=0`. Main non-Ready list remains at 65 items. No changes to loader code, types, formatters, `flows.json`, or the hub route since B3.

## Founder's Chosen Scope for This Session

**D1 — C3 journey classifications second pass.**

The 65 `journey` values assigned in Option A were a single-pass classification from component id + type. Now that blocker text is visible for 19 items, mis-classifications are easier to spot. The exercise: review each of the 19 blocker-carrying items (and optionally the other 46 non-Ready items) and propose moves where the blocker text implies a different journey value than the one currently set.

- No code change — registry edit only. Same class of Standard-risk change as D3's rename.
- Needs founder adjudication on borderline cases.
- Expected shape: AI produces a proposal table (id / current journey / proposed journey / reasoning drawn from blocker text). Founder approves en-bloc or per-item.

### Candidates surfaced in prior prompts (starting points — not exhaustive)

- `engine-llm-bridge` — marked `free_tier` but its blocker text says "candidate for deprecation rather than integration". Candidate journey values: `unknown`, or a new `deprecated` category, or leave as-is with a scope-expansion note.
- Any `paid_api` / `both` / `free_tier` item where the blocker text describes a different audience than the current journey suggests.

More will emerge once the 19 blocker-carrying items are reviewed systematically.

## Other Candidates Still Available (not chosen for this session)

- **D2 — B4 flow-step descriptions surfacing.** Medium value, Standard or Elevated depending on implementation shape. Budget-dependent — `formatted_context` sits at ~49–50 KB, comfortable headroom.
- **D4 — 0h Hold-Point Assessment.** Multi-session scope. The project-instructions P0→P1 gate.
- **D5 — Move to a different build priority.** P1 (business plan review) or P2 (ethical safeguards — Critical under 0d-ii, invokes PR6).

## Standing Instructions (carried forward, unchanged)

These apply every session.

1. **Single-endpoint proof first (PR1).** Any new architectural pattern proves on one endpoint before rollout.
2. **Same-session verification (PR2).** A function that exists but is never called is worse than one that doesn't exist. Grep for invocation, not definition.
3. **Risk classification before execution (0d-ii).** Standard = additive, non-safety. Elevated = changes existing user-facing surface, include rollback step. Critical = auth / session / safety classifier / deployment config, full Critical Change Protocol applies.
4. **Backups first.** Any file edit gets a `.backup-YYYY-MM-DD` copy before the write. List backup paths in the close note.
5. **TypeScript check must be clean.** `cd website && npx --no-install tsc --noEmit -p tsconfig.json` — expect zero output.
6. **Session close note mandatory.** Template from existing close notes in `/operations/handoffs/`.
7. **Do not edit governance documents without explicit approval.** Manifest, project instructions, decision log, adopted strategies. Flag the need; draft in chat; wait for approval.
8. **Respect working pace.** When the founder says "proceed" or "done", move forward. When the founder signals end of session, stabilise to known-good and close — no additional fixes.

## D3 Lessons to Carry Forward

Three findings from the D3 session worth preserving for future sessions.

### Lesson 1 — Retroactive decision-log entries for in-session resolutions should be appended in-session, not deferred

The B2→B3 pattern of deferring session-N decision-log entries to session-N+1 works for decisions **made this session but acted on next**. It does **not** work for decisions where the action is completed this session and the log entry documents the completion — in that case, the log and the registry disagree until the next session, and Ops (which trusts the decision log as the audit trail for "has X been resolved") reports stale answers. D-D3-1 was originally parked for next-session approval; Ops' probe caught the drift the same day, and D-D3-1 was appended in-session as a correction.

**Implication for D1:** Any journey-reclassification decisions made in D1 should be logged in D1, not deferred to the session after.

### Lesson 2 — The outputs scratch folder is cleared between sessions on this platform

The D3 forward prompt asked to archive B3 probe scripts to `/archive/2026-04-22-b3-tmp-scripts/`, but the scripts didn't exist at session open — the folder had been cleared. Close notes from here on should skip the "archive probe scripts" step or rephrase it ("probe scripts were temporary; cleared with the session workspace").

### Lesson 3 — Two PR8 candidate patterns at one observation each

Logged during D3, not yet promoted.

- **"Frankenstein duplicate" pattern** — a registry entry created by duplicating another and changing the `type` field but not the `id`, `path`, `ext`, or `desc`. Partial semantic alignment with new type; carry-over from source. Third recurrence triggers promotion.
- **"Type-prefix naming invariant" pattern** — registry ids are strongly type-prefixed in practice (21/21 `document` use `doc-*`; 12/12 `reasoning` use `reasoning-*` after D3). A loader-level assertion could enforce this in future. Third recurrence triggers promotion.

## Context the New Session Will Need

Before D1 starts:

- **Registry file:** `website/public/component-registry.json` — 163 components. 65 non-Ready. 19 with explicit `blocker` field. 0 duplicate ids after D3 + D-D3-1. The 19 journey-classified blocker items are the richest signal for spotting mis-classifications.
- **Loader file:** `website/src/lib/context/ops-continuity-state.ts` (~37 KB) — reads `journey` around line 672 and groups `by_journey` around lines 673–675. Sort order is defined in `compareJourneyKeys` — if D1 proposes a new journey value (e.g., `deprecated`), grep this function first to confirm it handles unknown keys gracefully before assuming Standard risk.
- **Route:** `website/src/app/api/founder/hub/route.ts:213` invokes `getOpsContinuityState()`, line 270 reads only `.formatted_context`. Do not edit this file for D1.
- **Backups parked from D3:** `operations/decision-log.md.backup-2026-04-22-d3`, `operations/decision-log.md.backup-2026-04-22-d3-pre-dd3-1`, `website/public/component-registry.json.backup-2026-04-22-d3`. Earlier B3 backups preserved.
- **Decision log state:** ends at line 1090. Most recent entry is D-D3-1 at line 1076.

### PR5 Scan — Knowledge-Gap Register

For D1 (registry edits to the `journey` field):

- **KG3 / KG7 (Build-to-Wire Gap)** — not applicable. No new code.
- **"Frankenstein duplicate" (PR8 candidate, 1st observation)** — potentially applicable if any journey-field change also touches `id` / `path` / `ext` / `desc` on the same entry. Unlikely for D1 (scope is journey only), but worth keeping in mind.
- **KG1 Vercel serverless; KG2 Haiku boundary; KG4 Layer 2 applicability; KG5 token budgets; KG6 composition order; KG8/KG9 hub labels; KG10 JSONB** — not relevant for a journey-field registry pass.

## Open Questions for the Founder

1. **Scope within D1:** First-pass proposal for all 19 blocker-carrying items, or only items where the journey value looks demonstrably wrong? AI recommends the former — same effort, cleaner audit trail.
2. **New journey value permitted?** The `engine-llm-bridge` blocker suggests a `deprecated` value might fit. Current values are `paid_api / both / free_tier / internal / unknown`. Adding a new value changes the loader's `compareJourneyKeys` sort order and may affect rendering. Risk: Standard if `compareJourneyKeys` handles unknown keys gracefully (grep first); Elevated if it's closed over the current set.
3. **Decision-log timing (D3 Lesson 1):** Append this session's decision-log entries in-session to avoid log-vs-state drift? AI recommends yes.
4. **Proposal-review format:** AI produces a table (id / current journey / proposed journey / reasoning from blocker text); founder approves en-bloc or per-item? Or different format?

## Signals to Use

Unchanged from the D3 prompt.

Founder to AI: "D1", "proceed", "treat this as critical", "I'm done for now", "scrap that", "skip the menu, do X instead".
AI to founder: "I'm confident", "I'm making an assumption", "I need your input", "I'd push back on this", "This is a limitation", "This change has a known risk", "I caused this".

## One-Line Summary

D3 is closed and verified on production; next session executes **D1 (journey classifications second pass)** using the 19 blocker-carrying items as the primary signal for spotting mis-classifications — founder approves scope, new-value policy, and review format at session open.
