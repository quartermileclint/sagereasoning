# SESSION PASTE — Cognitive OS: both migrations live, track closed to the standing queue

**Paste this as the FIRST message of a FRESH session.**

**Open the standing opener first** (`STANDING-SESSION-OPENER-grounded-foundations.md`, most recent
version), then this. **EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

---

## 0. What this prompt is, and what it is not

**This is not a build-continuation prompt.** There is no further Cognitive OS work currently
licensed to do. Both the core slice and the second migration are live on TEST and production;
Phase 2 (the actor architecture, the Epistemic Debt service, the decision-readiness gate) remains
**NOT LICENSED** and nothing in this prompt opens it. If you were expecting a task to pick up and
continue, there isn't one on this track — read §2 for what actually remains, and read the standing
opener's own queue for what else in the project might be more useful to work on next.

**Full record, read before touching anything cognitive-os-shaped:**
`operations/cognitive-os-2026-09/2026-09-10-SECOND-MIGRATION-AUTHORED-CLOSE.md`. **Read the whole
thing, including its postscript at the top — it was corrected in place after a real mistake in the
same session that wrote it, and the correction matters more than the original text below it.**
**Verbatim wins over this paste.**

---

## 1. What is actually live, confirmed by direct check, not by citation

- **Core slice** (`cognitive_contexts`, `cognitive_events`, `cognitive_claims`,
  `cognitive_belief_states`) — live on TEST and production since 2026-09-09.
- **Second migration** (`cognitive_decisions`, `cognitive_handoffs`,
  `cognitive_dependency_nodes`, `cognitive_dependency_edges`) — live on TEST and production since
  2026-09-10. All nine `§VERIFY` checks confirmed on both environments; all six
  `§VERIFY-BEHAVIOURAL` probes confirmed on TEST (the composite-FK rejection, the JSONB guard's
  disclosed top-level-only scope, the cascade).
- **Code deployed and live-verified against the actual production build**, not just locally:
  `GET /api/user/access` returns all eight `personal_data.cognitive_os` arrays, empty, no `error`
  key.
- **No score column exists anywhere under `cognitive_*`.** Re-derive this yourself rather than
  trusting the claim — the store battery's `§7`/`§13.2` pins exist precisely so this is checked,
  not asserted: `npx tsx src/lib/cognitive-os-store/__tests__/store.test.ts` from `website/`.

**Re-run before doing anything else:** `tsc --noEmit`, `npm run build`, the Phase-1 battery
(`src/lib/cognitive-os/__tests__/cognitive-os.test.ts`), the critical scenario
(`src/lib/cognitive-os/__tests__/critical-scenario.test.ts`), the store battery, and the
byte-identity guard (`src/app/logos/__tests__/human-practitioner-boundary.test.ts`). All were
green at this prompt's authoring; re-derive, do not quote.

---

## 2. ⚠ Read this before touching git, or before touching anything `GUARD_RE`-shaped

**A real incident happened in the session that produced this state, and it is fully documented in
the close record's postscript — read it, not this summary.** In short: a commit intended to be
scoped to five files (`git add <five paths>` followed by a bare `git commit`) actually landed 18
files, because files from a **different, concurrent session** were already staged in the shared
working tree at that moment, and a bare `git commit` commits the *entire index*, not just what was
most recently added. `git add` scoping what you add is not the same as the *commit* being scoped —
only `git commit -- <explicit paths>` restricts a commit to named paths regardless of what else is
staged.

**The concrete consequence:** commit `75b35a9` carries genuine, functional changes to the
false-hold observation harness itself (`classifyCaller`'s signature, a new `readClientContext`
export, matching edits across `at-action-hook.mjs`, `false-hold-capture.mjs` and its test,
`negative-battery.mjs`, and `false-hold-observation-report.ts` and its test) — work belonging to a
different session's track (caller-class / Q-CALLER-C3), landed inside a commit message that
describes only Cognitive OS work, with no waiver citation anywhere in that commit. **The founder
has confirmed directly with that other session that its inclusion reflects real, intended,
authorized work**, and directed it to record the fact and continue from its own close — so this is
disclosed as a **process incident** (a scoping failure in how the commit was made), not a licensing
violation in substance. But the mechanical fact stands: `GUARD_RE`-matched files changed,
functionally, inside a commit, during an active observation window, without the commit itself
carrying any waiver record.

**If your task is to assess the false-hold observation window's current integrity or continue the
caller-class track, start by reading that other session's own close record for `75b35a9`'s content
(find it via `git log` / the decision log around this date) rather than re-deriving its legitimacy
from scratch — it has the governance context this file does not.**

**Standing lesson for every future commit in this shared-checkout project:** before committing,
run `git show --stat <sha>` (once committed) or `git diff --cached --stat` (before committing) and
verify *nothing beyond your own intended paths* is present — not just that your own files ARE
present. `git commit -- <paths>` restricts a commit to named paths and leaves everything else
staged for its own separate commit; a bare `git commit` does not, ever, regardless of what you
most recently ran `git add` on.

---

## 3. What genuinely remains carried on the Cognitive OS track

None of these are urgent or license anything new to build — they are named so a future session
does not have to re-derive them from scratch.

1. **The library placement question (Q4)** — `cognitive-os/` sits outside `substrate/` for a
   reason that was constraint-driven (the byte-identity guard, active only while the observation
   window runs), not architectural. `cognitive-os-store/` inherited the same reasoning for a
   different guard (the Phase-1 purity guard). Both are marked for review **after the observation
   window closes** — not before.
2. **`SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED`** — still unset. Its own activation decision, now
   covering seven tables (not four), with a disclosed limit: `purgeExpiredCognitive`'s per-table
   counts can under-report real cross-table cascade deletions (retention itself is enforced
   correctly; only the *reported breakdown* can lag). Read the function's own docstring before
   activating, and before deciding whether that limit needs closing first.
3. **Phase 2 remains NOT LICENSED.** Opening it needs its own mentor-consulted scoping session —
   it is not something a session should back into by continuing storage work. The R9/R10 handoff
   reconciliation is a **named prerequisite** to Phase 2 opening (already discharged as design,
   per `operations/cognitive-os-2026-09/2026-09-09-R9-R10-HANDOFF-RECONCILIATION.md`), but
   discharging that prerequisite does not itself license Phase 2 — read that document's own
   closing lines rather than assume.
4. Unchanged and untouched by anything in this arc: `Q-PREFLIP-REPORTS` (three owed disclosures,
   gated on a founder waiver since `false-hold-observation-report.ts` matches `GUARD_RE`); the
   session-opener's own `cat >` addition, still owed; the cap-transparency requirement's fold into
   `/adopted/project-instructions-snapshot.md`, still owed; the manifest amendment owed before
   Phase 3 (the Consciousness and Continuity Obligation, component one).

---

## 4. What this session should actually do

**Read the standing opener's own queue** (Part B, "Standing queue") for what is actually
prioritised right now across the whole project — this file does not attempt to re-derive or
override that ordering. The Cognitive OS track has nothing currently gating any other work, and
nothing currently gates it beyond what §3 above names.

If you were pointed here specifically to assess the observation window given the commit-scope
incident in §2, that is likely the more urgent read right now — but confirm against the standing
opener's own current state, not against this prompt's authoring-time snapshot.

---

## 5. If you hit a conflict

**Route it; do not resolve it.** If any part of this touches a governed surface, a settled
constraint, or a `GUARD_RE` file, stop and flag it. The founder is the decision authority on all
governance questions.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
