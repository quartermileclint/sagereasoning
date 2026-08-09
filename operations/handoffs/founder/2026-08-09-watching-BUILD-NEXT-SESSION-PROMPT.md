# Next-Session Prompt — Build `watching`, the per-cycle record table + dashboard (second of the founder-approved build order)

**Stream:** founder.
**Tier:** `code-critical` — a new write-class capability (`watching_write`), which requires a founder-walked `api_keys` CHECK widening (the 6e §A owner+agent invariant); two new tables via a founder-walked migration; two new dark routes. Elevated risk under 0d-ii escalated to Critical by the schema + capability-widening step, per the standing cache and the `watching` ruling's own §2.10(5) required review dimension. **Critical Change Protocol IS engaged at this build's migration/capability step** — provisioning `watching_write` on any credential, and applying the migration to production, are founder-walked live ops (AC7 + PR6); the AI performs no Supabase/Vercel/git/mint op. Building the dark route code itself, and applying the migration to TEST, are `code-elevated`-shaped work inside the same session; **activation (the `SUBSTRATE_WATCHING_ENABLED` flag flip) remains its own later founder-walked step, not pre-approved here.**

## THE FOUNDER-APPROVED BUILD ORDER (read this first — every session in this arc should)

**Approved 2026-08-09** (founder election, following the AI's recommendation put to the founder for mentor confirmation — see the honesty note below, carried unchanged from the `fresh` prompt):

1. **`fresh`** — the novelty-check endpoint. **DONE 2026-08-09** — built dark, batteries green (61/0 + 20/0), PR19 GO with zero findings. See `D-FRESH-ENDPOINT-BUILT-DARK-REVIEW-CLEAN-2026-08-09` + `operations/handoffs/founder/2026-08-09-fresh-endpoint-build-CLOSE.md`. Activation not yet taken.
2. **`watching`** — the per-cycle record table + dashboard. **DONE 2026-08-09** — routes built dark (batteries 70/0 + 20/0 + 23/0, PR19 GO_WITH_FIX, two nits folded across a first-hand pass and a fully-completed independent re-run), and — because this session touched schema + a write-class capability — **the migration + the capability CHECK-widening were WALKED LIVE founder-side to both TEST and PRODUCTION** (both `idea_loop_cycles`/`idea_loop_candidates` and the widened `api_keys` CHECKs are now Live; `SUBSTRATE_WATCHING_ENABLED` itself stays unset — routes still dark). See `D-WATCHING-BUILT-AND-CAPABILITY-LIVE-2026-08-09` + `operations/handoffs/founder/2026-08-09-watching-build-CLOSE.md`. No credential was minted — `watching_write` provisioning stays with the runner scoping session. Route activation not yet taken.
3. **The generation-side runner code** — in this repo, only the additive `loop_id` field on the live `/api/reason` route (per QG-C); the heuristic templates/cycle logic themselves run in the external runner, outside this repo, per the architecture ruling. **← NEXT.** Both `fresh` and `watching` now exist (the ruled cycle composition, §2.8 of the generation-step scope, calls `fresh` in step 3 and `watching` in step 6) — the structural dependency is discharged.

**Honesty note, carried forward unchanged:** this order is a **founder election**, not itself a separate mentor ruling — the AI recommended it and the founder approved it in the same conversation that produced the original `fresh` prompt. As of the `fresh` build's close, no mentor confirmation of the order had arrived. **Confirm at this session's open whether that has changed** (pre-condition 1, below) — if the founder has since confirmed it with the mentor, record that confirmation in this session's own decision-log entry (a one-line addendum is enough).

**Update this section (or leave a pointer) at the close of this session** so the next one (the generation-side build) opens knowing exactly what came before and what's next — this file is designed to be copied forward with `s/watching/generation-side/` or superseded by a fresh prompt at that point.

---

**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `operations/handoffs/founder/2026-08-09-fresh-endpoint-build-CLOSE.md`.
**Predecessor decision-log entries:** `D-FRESH-ENDPOINT-BUILT-DARK-REVIEW-CLEAN-2026-08-09` (the build this session follows); `D-WATCHING-SCOPE-RULED-2026-08-09` (the ruled scope this session builds to); `D-GENERATION-STEP-SCOPE-RULED-2026-08-09` (the sequence's next-but-one item, not touched here).

## Why this session matters

This is the second build gate of the ruled Q11 sequence, and the heaviest of the three: it is the first session in this arc to touch schema and mint a new capability class. `fresh` proved the build-gate process (scope → build → battery → PR19 → founder-walked activation) on the smallest, self-contained item; `watching` proves it under real Critical-tier weight — a migration walked TEST→prod, a `WRITE_CLASS_CAPABILITIES` widening, and a five-dimension required review set (the ruling's own §2.10, four dimensions plus a fifth the ruling itself added). Getting this right sets the pattern the generation-side build (which touches the live `/api/reason` route) will follow.

## Pre-conditions

1. Confirm at open: no new mentor guidance has superseded anything in the ruled corpus (the brief, `fresh`, `watching`, the generation-step scope [not yet ruled — do not read it as settled], or the build order above) — ask the founder before writing code.
2. Confirm the session's hook framed. If it does not (the known 28s-timeout transient class, memory `api-key-1-per-day-limit-masks-as-401` is the adjacent quota-masking lesson, not this one), proceed unframed and disclose it at close, per the `fresh` session's precedent — do not block on it.
3. **The `watching_write` capability provisioning is a founder-walked live op** (§2.3/QW-B ruled) — decide explicitly at open whether this session's scope includes minting/provisioning the runner credential now, or whether that stays with the runner scoping session (the ruling's own carry-forward names the runner scoping session as where provisioning happens: *"the `watching_write` capability must be provisioned on the runner credential at that session"*). **Default assumption, confirm before building:** this session builds the capability value + the CHECK widening + the route/schema machinery that RECOGNISES `watching_write`, but does **not** mint or provision any credential with it — that stays the runner scoping session's job, per the ruling's own carry-forward. If the founder wants provisioning pulled forward into this session, say so explicitly and treat it as its own live-op sub-step with its own confirmation.
4. Confirm at open whether the Q6 `'terminated_by_timeout'` type-follow-up is fully closed (it landed in `idea-loop-types.ts` at the `fresh` build, 2026-08-09) — it should require no further code-side action here; the CHECK constraints below are authored to the ruled vocabulary, which already matches the type.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier, model selection, risk class, signals).
2. `operations/handoffs/founder/2026-08-09-fresh-endpoint-build-CLOSE.md` (~3 min — the immediate predecessor).
3. **The ruled `watching` scope document IN FULL** — `operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md`. This is the deliverable-of-the-day; every field, table, route, capability, and honesty-posture item below is transcribed from it, not re-derived.
4. The verbatim ruling record — `operations/agent-circles-2026-08/2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md` — verbatim wins over the scope document's own annotations if either is ambiguous.
5. The code, read first-hand (PR20): `website/src/lib/substrate/idea-loop-types.ts` (now consumed by `fresh`; confirm the `cycleOutcome`/`GenerationHeuristic` vocabularies match what the CHECK constraints below need); `website/src/app/api/practice/fresh/{handler,route}.ts` (the sibling this session's routes should match in shape — handler-split, Bearer-only, dark-flag pattern); `website/src/lib/practice-credential.ts` (`validatePracticeCredential`, `WRITE_CLASS_CAPABILITIES` at `practice-credential.ts:59` — the exact constant this session widens); the 6e §A invariant migration (`website/supabase-api-keys-upc-step6e-invariant-reanchor-migration.sql` — the mint-time CHECK this session's capability addition must satisfy, per the ruling's carry-forward); `website/src/lib/loop-cost-tracker.ts` (`buildLoopHeaders`, `estimateCallCostCents`, the integer-cents contract — memory `loop-billing-rpc-integer-uuid-contract`); the founder-hub route + page (`website/src/app/api/founder/hub/` + its page) as the read/dashboard-pattern precedent named in §2.4; the `collaboration_records` migration (the retention/data-rights precedent named in §2.7, NOT the `agent_hold_observations` deferred-rider posture).
6. `operations/decision-log.md` — last 3 entries.

Confirm at open: tier (`code-critical` — schema + capability widening; the dark-route code build itself is `code-elevated`-shaped, confirm the cache's guidance on mixed-tier sessions); hold-point status (P0 0h); model selection per the cache's AC1 table (both routes make **no LLM call** — pure record read/write over indexed tables, so no model-selection row applies to either route's own logic); status vocabulary; signals/risk class.

## Part B — Procedure

### Step 1 — Author the migration, exactly to the ruled shape

Two tables, `idea_loop_cycles` + `idea_loop_candidates` (FK → cycle, `ON DELETE CASCADE`), per §2.1's proposed columns (build-time details flexible; the **ruled fields are fixed** — re-read §1 items 2–4 and §2.1–§2.2 before finalising column names). Load-bearing constraints, all ruled:

- **Outcome vocabularies (§2.2, QW-C ruled):** candidate-level `cycle_outcome` CHECK — seven values, `pending | rejected_by_guardrail | rejected_by_novelty | winner | null_cycle | dependency_unavailable | terminated_by_timeout`. Cycle-level `cycle_outcome` CHECK — four values, `winner | null_cycle | dependency_unavailable | terminated_by_timeout` (the uniform `terminated_by_timeout` spelling at **both** levels — QW-C's ruled token, not Q5's literal "timeout" field description).
- **`cost_cents` is INTEGER** (the loop-billing integer contract — memory `loop-billing-rpc-integer-uuid-contract`; do not repeat the float-cost 503 class the discernment sibling had to fix).
- **`loop_id` NOT NULL** on the cycle table (the ruled required field); `gap_ref` uses the settled `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}` format (§2.6 — kept separate from `loop_id`, never composited into one key).
- **Candidate row carries `fresh`'s ruled outcome shape** (§1 item 7): `passed_novelty_check` (nullable boolean), `novelty_confidence` (nullable numeric), `novelty_basis` (nullable text — carries `insufficient_history` when `fresh` returned it; confirm the exact string matches `STRUCTURAL_NOVELTY_LIMITATION`'s sibling constant in `fresh/handler.ts`, `'insufficient_history'`).
- **Retention (§2.7, ruled):** the `collaboration_records` precedent — `retain_until` 90-day, `owner_user_id` FK → `profiles ON DELETE CASCADE`. Wire at build into `/api/user/delete` + `/api/user/export` + the trust-core retention sweep, **missing-table-benign** until the migration lands (the standing dark-built-table-read discipline).
- RLS service-role-only; indexes on `(loop_id, cycle_number)` and `retain_until`; idempotent + reversible.

**Migration-before-flag order is standing discipline (§2.8, ruled)** — apply TEST → prod **before** any `SUBSTRATE_WATCHING_ENABLED` flip (which stays out of scope for this session regardless).

### Step 2 — The `watching_write` capability (QW-B ruled — the Critical-tier step)

Add `watching_write` to the write-class capability set (`WRITE_CLASS_CAPABILITIES` in `practice-credential.ts:59`, alongside `accreditation_write | calling | reflect`) — this inherits Bearer-only-by-class transport and the 6e §A owner+agent mint-time invariant automatically once added to that set (re-verify this first-hand against the 6e migration file rather than assuming it). This is the founder-walked `api_keys` CHECK-widening step — confirm with the founder exactly when in this session to walk it (before or after the dark route code is built; the route code can be written and battery-tested against injected fakes without the live widening having happened yet, per the discernment/`fresh` precedent of building dark-and-testable before any live schema touch).

**Per pre-condition 3 above:** this step adds the capability *value* and the CHECK widening; it does **not** by default mint or provision any actual credential with `watching_write` — confirm that boundary explicitly with the founder before proceeding.

### Step 3 — Build the write route, exactly to the ruled shape

`POST /api/practice/watching`, handler-split (`handler.ts` + thin `route.ts`), matching the `fresh` sibling's file-organisation pattern. Per §2.3 (ruled):

- **Auth:** UPC `watching_write` capability via `validatePracticeCredential`, Bearer-only (inherited from the write-class set once Step 2 lands).
- **One call per completed cycle**, carrying the cycle row + all its candidate rows in one body (never a mid-cycle snapshot; `pending` candidate rows should never appear in a completed cycle's record — QW-C's adjacent ruling in §2.2).
- Idempotency on `(loop_id, cycle_number)` — a retried write must not duplicate a cycle (the discernment sibling's `deterministicLoopId`/duplicate-no-op pattern is the house precedent to reuse, not re-derive).
- Input caps (max candidates per write, max `proposed_action` length) — build-time details under the house input-cap pattern (mirror `fresh`'s documented-rationale style, don't leave them unexplained).
- **No trust-event write** (§2.9, settled ground carried verbatim from the `fresh` ruling — the identical statement applies here with equal force: *"the record surfaces write no trust event; any future event class is a new question for the mentor"*).
- **No verdict modification, no execution pathway** (the Q1 hard constraint — a record row describes; nothing reads the table to act).

### Step 4 — Build the read route + dashboard, exactly to the ruled shape

`GET /api/founder/watching` (§2.4, ruled) — auth via `FOUNDER_USER_ID` Bearer JWT (**not** `ADMIN_EMAILS` — confirmed distinct, non-interchangeable gates; re-verify against the founder-hub route which one it actually uses before copying). Serves the founder only; nothing lands on S10 or any public surface. Follow the founder-hub page-fetches-a-GET-route pattern (no push/websocket/SSE anywhere in this repo — confirmed by grep at scoping time, re-confirm if you add anything novel). Polling cadence, pagination, and `?loop_id=` filtering are build-time details.

**The required §2.10 review dimension (2): the runner-composed disclosure must be actually RENDERED on the dashboard, not merely documented in the schema** — this is a build requirement, ruled explicitly as such, not optional. Same for **dimension (1): Q7 transparency** — rejected candidates visible with heuristic attribution on the dashboard page itself, not just present in the underlying table.

### Step 5 — Flag posture

Dark behind a **new** `SUBSTRATE_WATCHING_ENABLED`, UNSET everywhere ⇒ **both routes** answer honest 503, zero work (the `fresh`/discernment/S10 dark-route pattern). Flag-off byte-identity battery-asserted, not merely claimed. Activation is its own founder-walked `code-critical` step at or after this build — nothing here pre-approves it.

### Step 6 — Battery

**The ruling names FIVE required review dimensions (§2.10, the fourth item + the mentor-added fifth) — build the battery to hit all five explicitly, don't discover them ad hoc:**
1. Q7 transparency preserved end-to-end — rejected candidates visible with heuristic attribution **on the dashboard**, not just in the schema.
2. The runner-composed disclosure actually **rendered**, not just documented.
3. Flag-off byte-identity, **including the data-rights riders' missing-table-benign behaviour**.
4. The candidate/cycle outcome vocabularies **exactly as ruled** (both CHECK sets; the uniform `terminated_by_timeout` spelling; the `pending`-never-in-a-completed-record discipline).
5. **The `watching_write` capability correctly provisioned and the write-class discipline verified end-to-end at build** (Bearer-only enforced by class, not just by route choice; the 6e §A invariant genuinely fires on this capability).

Plus the house-standard set for a dark-flag Critical build: flag-off byte-identity (503, zero work, zero DB touch, on **both** routes); input-cap rejection paths; the idempotent-retry-no-duplicate path on `(loop_id, cycle_number)`; the `dependency_unavailable`/QW-A(i)/(ii) semantics if any code logic depends on them (confirm whether this build needs to encode QW-A at all, or whether it is purely the runner's concern per §2.9's "no counter enforcement" — the table only *records* outcomes and mode). `tsc` clean; `npm run build` clean (both routes registered, no non-handler export errors — the standing Next route-export lesson).

### Step 7 — Adversarial review (PR19)

Independent review before this build is treated as done — ruling-fidelity (every ruled field, both CHECK vocabularies, the QW-C uniform spelling, the capability-class discipline); PR20 compliance (every mechanism-fact claim in code comments/docs traces to actual code); boundary compliance (nothing here activates the flag, mints a live-provisioned credential beyond what pre-condition 3 settled, builds the generation-side runner code, or touches the generation-step scope document's own open items). **Pause before and after the review for the founder's model-settings changes**, per this arc's standing practice.

### Step 8 — Records

Decision-log entry (`code-critical`, given the schema + capability-widening step; note explicitly which parts were founder-walked live ops vs AI-built dark code, mirroring the `fresh` entry's discipline of naming exactly what was verified vs. built-but-untested). Session close, updating the build-order note at the top of this file (or superseding it with a fresh generation-side-build prompt) so the next session knows this one is done and the generation-side build is next.

## What this session does NOT do

- Does not flip `SUBSTRATE_WATCHING_ENABLED` in production — activation is its own founder-walked `code-critical` step, at or after this build, not pre-approved here.
- Does not build the generation-side runner code (next in the order, above) — including the `loop_id` field addition to `/api/reason` (QG-C), which waits for its own session.
- Does not open the generation-step scope document's own content (heuristics, prompts, thresholds, the guardrail-fail-closed handling) — that document is separately queued, not yet ruled at the time this prompt was written; confirm at open whether it has been ruled since.
- Does not, by default, mint or provision any credential with `watching_write` — confirm this boundary explicitly per pre-condition 3.
- Does not re-open anything ruled — the brief's Q1–Q11, the `fresh` scope's §1/§2, the `watching` scope's own §1/§2/§3 (QW-A/QW-B/QW-C all ruled), the generation-step scope's QG-A/B/C/D (once ruled).
- Does not touch C1c-original, D4, the Stoa activation, W1–W3, B6, the permission-layer items 14–17, or the ATRF/Consciousness-and-Continuity Obligation additions (all independent, untouched by this arc).

## Rollback path

`git revert` the build commit — the routes are dark (flag unset), so nothing live-facing is affected regardless. The migration, if applied to production before this git revert, is a separate rollback action (DROP TABLE per the migration's own footer) — the schema change does NOT auto-revert with the code commit; name this explicitly in the session's own close if the migration was walked to prod.

## Forecast

Success = `watching` built exactly to the ruled shape (both tables, both routes, the uniform outcome-vocabulary tokens, the `watching_write` capability correctly added to the write-class set), all five required §2.10 review dimensions explicitly hit in the battery, flag-off byte-identity proven on both routes, PR19 clean or folded, and dark on push (with the migration walked founder-side per whatever the session elects at open). Next session: the generation-side runner code (the additive `loop_id` field on `/api/reason` per QG-C) — its own session, structurally dependent on both `fresh` and `watching` existing, gated on the generation-step scope document being ruled if it is not already.

End of prompt.
