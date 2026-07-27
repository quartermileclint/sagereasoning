# Next-Session Prompt — Practice Reminders Phase 3: The Stage-Crossing Trigger

**Stream:** founder (website build).
**Tier:** `code-elevated`.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor session close:** `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase2-in-session-suggestions-CLOSE.md`.
**Predecessor decision-log entry:** `D-PRACTICE-REMINDERS-HUMAN-PHASE2-IN-SESSION-TRIGGER-BUILT`.
**Risk classification:** Elevated under 0d-ii (existing user-facing pages gain rendering; the dashboard gains the earn card). Critical Change Protocol NOT engaged — no schema, flag, auth or deploy-config change. AC7/PR6 not engaged.

## Where the arc stands

Phases 0, 1, 2 and 4 are built (0/1/4 live; 2 lands on the founder's push of its commit). **Phase 3 is the arc's last unbuilt phase**, and everything it needs already exists: Phase 0's milestone POST returns the newly-earned list; the five `stage_*` milestones fire on a single exact-level evaluation; `STAGE_PRACTICES` in `practice-sequence.ts` carries the vetted stage↔tools mapping; and the Step M verdicts settled the copy. The verbatim record (`operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md`) **wins over every summary.**

## The binding Phase 3 verdicts (human plan §8)

1. **The card NAMES the stage**: *"Something has shifted in how you are meeting difficulty. This is ⟨Stage Name⟩. These practices meet you where you now are."* — a description of a condition, never a grade.
2. **Dismissible / never-repeated / never-congratulates are LOAD-BEARING, kept exactly.**
3. **No prerequisite gating** — but because every `stage_*` milestone here fires on a single evaluation, EVERY crossing carries the honest orientation line: *"this practice builds on the passion log — if that is not yet familiar, begin there first."*

## Pre-conditions

1. The Phase 2 commit is pushed (check `git log` for "in-session trigger"; if still local, fine for building — say so).
2. Suite baseline at open: unit 602/0 · boundary suites 526/467/415/705/626/539/591/526/249 · render 53/0 + 15/0 · tsc 0.

## Part B — Procedure sketch (per §8, all four items)

1. **The earn moment:** the dashboard consumes Phase 0's newly-earned list; a `stage_*` earn renders the card (vetted copy above + the stage's `STAGE_PRACTICES` tools with doorbell lines + the Stage page link + the orientation line). Dismissible client-side; never re-rendered once dismissed (decide + record the dismissal store — localStorage vs a milestones-read derivation; no schema change is in scope). The milestone grid stays the durable record.
2. **Stage pages gain their practices** (`/stages/<slug>` renders `STAGE_PRACTICES` + doorbells; The Inner Fire renders the no-scaffolding line instead).
3. **`MilestonesDisplay`** stage panels add the same practice links.
4. **The two cadence banners** restyle onto the shared visual component — cadence logic unchanged.

All copy pre-authored in `practice-sequence.ts` as exported values, verbatim-pinned, added to the ALL_COPY sweep (H0-style meta-pin). Mutation-test every new pin (python3; verify each mutation applied). The dismissed-state logic must never turn the card into "a grade delivered on a schedule" — pin never-repeated behaviourally (render suite).

## Step 5 — Adversarial review (PR19)

4 dimensions + a single refuter pass. NOTE: Phase 2's review Workflow died whole on the account monthly spend limit (4/4 finders — so did Phase 0's and Phase 1's verifiers); if the limit has not reset, budget for a first-hand completion + disclosure up front, and consider queueing the independent re-runs for Phases 0–2 alongside this one when capacity returns.

## Rollback path

`git revert` the session commit — rendering + lib copy + tests only.

## Open items carried (not this session's work)

- **R17 on `milestones`** — oldest item; Critical, founder-walked; gates external onboarding.
- The journal UTC pace-gate mismatch (chip `task_4cee2a1c`); the day-55 evening-pole terminal case (chip `task_197803bb`).
- `/api/milestones` + `/api/baseline` on the `scoring` rate-limit bucket.
- The optional returning-line refinement (founder-electable).
- `oikeiosis_context` never written → two milestones unearnable.
- Independent review re-runs for Phases 0, 1 and 2 (spend-limit casualties).
- The score page sits in no boundary-guard TARGET_FILES (pre-existing; named at Phase 2).

## Forecast

Success = a stage crossing surfaces its practices at the earn moment in the mentor's exact register — named as a condition, dismissible, never repeated, never congratulated — and the Stage pages finally link to their tools. That completes the human plan; behind it sits the agent plan (A1 sequencing is the founder's E4 call).

End of prompt.
