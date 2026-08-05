# Backlog — two C1a-caused measurement-fidelity degradations (logged, not fixed)

**Status:** Open backlog item, logged 2026-08-04 per mentor directive. Source: a practice-on/logos-on status brief given to the mentor 2026-08-04 (not a formal consultation, no separate verbatim-record file), in which the mentor ruled on sequencing and required this item be logged with an owner and enough context to pick up without reconstruction. Canonical pointer: `operations/decision-log.md` under `D-C1A-DEGRADATIONS-LOGGED-2026-08-04`.

**Mentor's ruling on priority (verbatim, 2026-08-04):** *"Leave them in sequence. Do not interrupt C1c/C2/D4 to fix them... A known, named, bounded cost is a different thing from an unknown one. These are known. They stay on the list, they get their own session, and the sequencing holds."* The one thing the mentor asked to be confirmed: that each item has "a clear owner in the backlog with enough context that they can be picked up without reconstruction." This file is that confirmation.

**Do not fix these from a stray session.** Both require their own scoped `code-elevated` (or higher, if touching a live gate/write path) session, sequenced AFTER C1c/C2/D4 in the practice-on arc, per the mentor's explicit ordering.

---

## Item 1 — `loop-fold.ts`'s `self_regarding` bucket is being starved by C1a

**Root cause:** `isSelfRegardingLoop` in `website/src/lib/substrate/trust-core/loop-fold.ts` (AE-2, LIVE in production since 2026-07-19 under `SUBSTRATE_LOOP_FOLD_ENABLED=true`) classifies a loop as self-regarding-vs-instrument-noise by checking whether the shared kathekon-engagement predicate (`website/src/lib/substrate/trust-core/kathekon-engagement.ts`) extracted the `self_preservation` circle at all. C1a (the practice-on first-circle correction, live since 2026-08-02 under `SUBSTRATE_AGENT_CIRCLES_ENABLED=true`) deliberately extracts `self_preservation` far less often — that narrowing is the whole point of C1a, per the 2026-07-19 self-circle ruling it extends. Consequence: genuine phronesis/sophrosyne self-regarding evidence that used to be correctly bucketed as `self_regarding` increasingly falls through to `instrument_calibration` (treated as noise) instead.

**Nature of the harm:** a silent accuracy degradation on a LIVE MEASURE surface (AE-2's loop-fold classification, part of the accreditation-write response's `loop_fold` block). Not a safety issue — nothing in this path binds a verdict or gates any live decision.

**Where it was found and disclosed:** `operations/handoffs/founder/2026-08-01-agent-circles-C0-C1-C3-CLOSE.md` §4b (PR19 pass 4, finding #4, "NOT fixed, disclosed here instead, because fixing either means touching live trust-core measurement machinery this session was scoped to leave alone").

**What the fixing session needs to decide:** whether `isSelfRegardingLoop`'s classification test should be widened to accept a signal beyond raw `self_preservation` presence (e.g. reading the same phronesis/sophrosyne routing C1a's own positive-routing mechanism now produces — `applyFirstCircleRouting` in `layer2-mechanisms.ts` — as an alternate self-regarding signal), or whether the bucket's definition itself needs re-examination now that first-circle extraction has changed shape. This is a genuine design question, not a mechanical fix — likely worth its own short mentor consultation before building, given it touches the same kathekon-engagement predicate the 2026-07-19 ruling already narrowed once.

**Files to read first:** `kathekon-engagement.ts` (the shared predicate), `loop-fold.ts` (`isSelfRegardingLoop` + the three-way character/self_regarding/instrument_calibration split), `layer2-mechanisms.ts` (`applyFirstCircleRouting`, the C1a mechanism causing the starvation).

---

## Item 2 — `practice-suggestion.ts` basis B6 (`self_only_circles`) is becoming largely unreachable

**Root cause:** identical mechanism to Item 1. `website/src/lib/substrate/practice-suggestion.ts` (A1, LIVE since 2026-07-28 under `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED=true`) fires basis code B6 when a consult's extraction carries a self-only circle set. C1a makes a self-only circle set rare by design, so B6 becomes largely unreachable for the exact class it was built to target.

**Nature of the harm:** a live agent-facing suggestion feature loses most of its trigger surface for one of its 18–19 locked basis codes. Not a safety issue; the feature degrades to silence for that basis rather than misfiring.

**Where it was found and disclosed:** same source as Item 1, finding #5, same session, same reasoning for not fixing (out of scope, touches live measurement machinery).

**What the fixing session needs to decide:** whether B6's trigger condition should be widened analogously to Item 1's proposed fix, or whether B6 is simply retired/renamed to reflect what C1a-narrowed self-only circles now actually indicate. Likely the SAME session as Item 1 — "they share the root cause and the files involved" (per the original disclosure).

**Files to read first:** `practice-suggestion.ts` (the B6 basis code + its trigger condition), plus the same two files as Item 1 (the shared root cause).

---

## Sequencing (per the mentor's 2026-08-04 ruling)

C1c → C2 → D4 → **this backlog item (Items 1+2, likely one combined session)**. Do not reorder without a fresh reason recorded in the decision log.
