# Session Close — 2026-07-29 — Independent Review Re-runs (AE-1, S11b, Phase 0, Phase 1) + Two Follow-up Fixes

**Stream:** founder (substrate / general — spans Trust Layer PR19 debt and the practice-reminders human plan).
**Governing frame:** `/adopted/standing-protocol-cache.md`. Not a build-sessions-protocol session.
**Tier:** `code-elevated` throughout — MEASURE-only annotation fixes, defensive security hardening in a local harness hook, and Elevated-tier fixes to existing user-facing routes/components. No schema/flag/auth-model/perimeter change. AC7/PR6/PR17 not engaged.
**Date:** 2026-07-29 (same day as, and a continuation of, the correlationId order-fix sessions earlier today).

## Decisions Made

`D-INDEPENDENT-REVIEW-RERUNS-AE1-S11B-PHASE0-PHASE1-FOLDED-2026-07-29` appended (`operations/decision-log.md`).

## What this session did

Opened with a bounded historical audit (had the pre-fix correlationId formula actually caused double-counting in `agent_trust_state`?) and a CLAUDE.md staleness refresh. At the founder's direction, this expanded into discharging two separate standing review debts: the PR19 retroactive-review debt named at `2026-07-25-AE1-S11b-retroactive-independent-reviews-NEXT-SESSION-PROMPT.md` (AE-1 + S11b — both died whole on an account spend limit at build time and were only ever reviewed first-hand), and the "human Phases 0–1 independent-review re-runs" item carried since the practice-reminders human plan (Phase 0's and Phase 1's own reviews had the same class of gap — verifiers killed by the spend limit, findings adjudicated single-perspective for the surviving cases).

Four subjects, four genuinely independent reviews. Three surfaced real findings; all were folded and re-verified. At the founder's explicit follow-up request, two more standalone fixes (unrelated to the reviews, previously just diagnosed and named) were also built.

## Method

Each review agent received only the artifact and a set of review dimensions — explicitly told not to search the decision log or any close/handoff file for the surface's own prior review conclusions (the PR19 independence rule). The Workflow-orchestration opt-in gate was not met this session, so reviews ran as parallel, independent `Agent` tool calls rather than a `Workflow` script — following the practice-reminders arc's own Phase 3 precedent for this exact situation, disclosed rather than left implicit.

## Findings and fixes, by subject

**Phase 1 (sequence trigger) — clean across all five dimensions.** No action needed; this debt is discharged outright.

**AE-1 (practice-delta layer) — one HIGH, folded.** `dimension_trends`/`passions_persisted_in_window` floored on the segment total rather than per compared half, letting a starved baseline half combined with a populated current half produce a confidently-labelled trend from zero real baseline evidence. Fixed to use the same per-half floor every other signal in the file already used. A stale comment in `practice-suggestion.ts` that had cited the buggy behaviour as part of its own B5-silence reasoning was corrected (conclusion unchanged).

**S11b (recomposition + reducer) — two HIGH folded, one HIGH confirmed-not-new.** `action-composer.mjs`'s sensitive-path denylist skipped the `default` branch entirely (an unrecognised/MCP tool could leak a denylisted path's raw content) — fixed. Truncation ran before redaction in two composition paths, letting a boundary-straddling secret survive as an undetectable fragment — fixed (redact-first everywhere now). Both mutation-verified non-vacuous by a temporary-revert-and-confirm-fail cycle. A pre-existing test fixture (`"P".repeat(60000)`) turned out to be accidentally base64-alphabet-shaped and was silently defeated by the ordering fix — caught and replaced. The third HIGH — no self-circle narrowing exists in `derive-trust-events.ts` — is register item D4, already disclosed as its own founder-walked Critical step; confirmed real, deliberately left untouched.

**Phase 0 (milestone wiring) — one HIGH + two MEDIUM, all folded.** `GET /api/milestones` degraded any DB error (not just a missing table) to a false "0 earned" 200, defeating the component's own error state — fixed with the standard missing-table-benign/missing-column-never-benign discipline copied locally from three substrate stores. The dashboard's retroactive catch-up effect lacked the StrictMode guard its sibling component already had — added. `consistent_deliberate`/`passion_reduction` had zero coverage of their order-dependent consumption logic (only that the data builder sorts correctly was tested) — added four mirrored, mutation-verified fixtures.

**Two standalone follow-up fixes (built after the reviews closed, no policy question attached):** `oikeiosis_context` — computed by the engine, rendered in the UI, but never included in the `action_evaluations_v3` insert, so two milestones were permanently unearnable — fixed, purely additive. `/api/milestones` + `/api/baseline`'s GET shared `/api/reason`'s `scoring` rate-limit bucket while firing on every dashboard mount — isolated to the `analytics` bucket, mirroring the existing `/api/mentor/practice-status` precedent; `/api/baseline`'s POST deliberately left alone (a genuine LLM-backed assessment, not a mount-triggered read).

## Historical audit (same session opening, before the reviews)

Queried `agent_trust_events` for evidence of real pre-fix double-counting. First query had a time-ordering bug (self-joined on insertion id rather than timestamp, letting cross-window pairs 15 days apart register as "close") — caught and corrected. The corrected query found exactly one confirmed instance: `sagereasoning:a3-smoke@v1`/`phronesis`, three duplicate events within ~50 seconds on 2026-07-28, isolated to throwaway smoke-test traffic. Left as-is per founder direction.

## Verification

trajectory-delta 76/0, aah-store 120/0, trajectory-overlay 36/0, practice-suggestion 759/0, logic-harness 163/0, negative-battery 230/0 (RELEASE GATE PASS), milestone-check-data 65/0, milestones boundary 937/0, schema-drift 52/0. `tsc --noEmit` and `npm run build` both confirmed 0 after every code change, not only at the end. Every new regression test was mutation-verified non-vacuous by an actual revert-and-confirm-fail cycle, not merely asserted.

## Commits (five, each independently revertable)

- `17b7a31` — CLAUDE.md staleness refresh (docs only).
- `ee726fa` — AE-1 evidence-floor fix.
- `ae1d879` — S11b harness egress fixes.
- `a918b98` — Phase 0 StrictMode guard + predicate test coverage.
- `603f94d` — milestones fail-open fix + rate-limit bucket isolation + `oikeiosis_context`.

**Not pushed.** Push was not requested this session and this environment doesn't push unilaterally without direction.

## What went wrong, and what it taught

Two vacuous-fixture near-misses, both caught before being reported as verified, neither shipped: the historical-audit SQL query's time-ordering bug (caught by reading the returned `min_gap`/`max_gap` values and noticing they were nonsensically negative and large, rather than trusting the row count), and the first attempt at the S11b truncation-boundary regression test (caught by reasoning through why it passed — it turned out to prove nothing, since the constructed "secret" never reached the redaction pattern's minimum length). Both were rebuilt correctly and mutation-verified. The standing lesson each reinforces: a self-join or fixture that "happens to pass" needs the same scrutiny as one that fails.

## Next Session Should

See the paired next-session prompt (`2026-07-29-independent-review-reruns-ae1-s11b-phase0-phase1-NEXT-SESSION-PROMPT.md`) for the full standing list. Nothing here is mandatory or gates anything else. Two groups: items buildable dark without a policy call (B5, the fold-open closure class's code, R17 on `milestones`, the consult-lookup resilience follow-up), and items that need the founder directly (the logos byte-identity guard, P2's 0h call, S11 ENFORCE readiness, Resend provisioning).

## Production State at Session Close

No flag, schema, or perimeter change. Every fix this session either changes an advisory/MEASURE-only annotation, hardens a local harness hook's egress discipline (strictly reduces what can leak, never widens it), or fixes existing Elevated-tier user-facing behavior (a route's error handling, a component's mount guard, a missing insert field, a rate-limit bucket assignment) — all reachable today by existing flags/routes, none of it newly activated. Nothing is live until the founder pushes; production is unchanged from before this session until then.

## Files touched

- `CLAUDE.md` (staleness refresh)
- `harness/gate1-pre-decision/claude-code/hooks/lib/action-composer.mjs`
- `harness/gate1-pre-decision/test/logic-harness.mjs`
- `website/src/app/api/baseline/route.ts`
- `website/src/app/api/milestones/route.ts`
- `website/src/app/dashboard/page.tsx`
- `website/src/app/score/page.tsx`
- `website/src/lib/__tests__/milestone-check-data.test.ts`
- `website/src/lib/substrate/__tests__/trajectory-delta.test.ts`
- `website/src/lib/substrate/practice-suggestion.ts`
- `website/src/lib/substrate/trajectory-delta.ts`
- `operations/decision-log.md` (this session's entry)
- `operations/handoffs/founder/2026-07-29-independent-review-reruns-ae1-s11b-phase0-phase1-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-07-29-independent-review-reruns-ae1-s11b-phase0-phase1-NEXT-SESSION-PROMPT.md` (paired prompt)
