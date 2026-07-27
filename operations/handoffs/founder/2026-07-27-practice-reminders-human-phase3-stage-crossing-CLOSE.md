# Session Close — 2026-07-27 — Practice Reminders Phase 3: The Stage-Crossing Trigger BUILT + Independently Reviewed + Tie-Break Verdict Adopted

**Stream:** founder (website build).
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Tier:** `code-elevated` — Elevated risk. AC7/PR6 not engaged (no schema, no flag, no auth change; `security.ts` untouched; no new rate-limit category).
**Date:** 2026-07-27. **Session model:** Sonnet 5. No LLM calls in any product code this phase adds (deterministic lookups over stored classifications; AC1 N/A row).

**UPDATED same session, post-close: the BD-4 tie-break this close originally left as its one genuinely open question has since been put to the mentor and resolved, adopted, and built.** Everything below the original close describes the build as it stood before that fold; the sections that are operational instructions (Verification, Founder Verification, Blocked On, Open Questions) have been corrected in place to the final state — each correction marked, not silent. See the second decision-log entry below and its own fold-specific detail.

## Decisions Made

- `D-PRACTICE-REMINDERS-HUMAN-PHASE3-STAGE-CROSSING-BUILT` appended — the stage-crossing trigger is live in code; five recorded build decisions (BD-1…BD-5) inside the verdicts' bounds, including one found-and-fixed mechanical defect that would have made the feature nearly non-functional as literally specified.
- **`D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT` appended (same session, later)** — the multi-crossing tie-break this close's own adversarial review flagged as open (BD-4, "highest rank wins") was put to the mentor (`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-briefing.md` / `…-verdict-verbatim.md`, binding). Verdict: disclose the plurality, name the stage matching the practitioner's **most recent evaluation**, never the highest ever reached. Built same-day: `resolveNewlyEarnedStage` now requires the current-condition signal as a second parameter and returns `{stage, isPlural}`; three further build decisions (BD-6…BD-8) inside the verdict's bounds. Separately, at the founder's explicit direction ("go with your recommendation for the engineering residuals"), the two disclosed engineering-only residuals below (the concurrent-POST race; the dashboard partial-failure visual inconsistency) were reviewed and left unfixed, as disclosed, accepted trade-offs — a considered recommendation, not a default.

## Status Changes

| Item | Old | New |
|---|---|---|
| Phase 3 (stage-crossing trigger) | Content vetted, unbuilt | **BUILT + VERIFIED** (live on the founder's push) |
| **The human practice-reminders plan** | 4 of 5 phases built | **ALL FIVE PHASES BUILT — the plan is COMPLETE** |
| `practice-sequence.ts` | Sequence + rhythm + Phase 2 mapping | + the stage-crossing copy, `stagePracticesBySlug`, an extensive disclosed-open-question header |
| MilestonesDisplay / `/stages/<slug>` | No earn-moment surface; no shared practices rendering | Earn card wired on 2 surfaces; both delegate practice rendering to a new structurally-gated component |
| `score/page.tsx` | No stage-crossing awareness | Earn card + a fixed per-evaluation state-reset bug (the arc's third instance of the same defect class) |
| Behind this arc | — | The companion agent plan, gated on the founder's go (E4) |

## What shipped

Once a practitioner's evaluation newly crosses into one of the five Stages of Practice, a card appears — on whichever surface (the score result, or the dashboard) happens to observe the crossing first — naming the stage as a condition, never a grade: *"Something has shifted in how you are meeting difficulty. This is ⟨Stage Name⟩. These practices meet you where you now are."* It lists that stage's practices with their doorbell lines and a link, adds the mentor's single-signal orientation line ("this practice builds on the passion log…") whenever there's a practice to orient toward, links to the Stage page, and can be dismissed — with no client-side store needed, since the milestone-award endpoint's own idempotency already makes "never repeated" true, permanently, across devices. Stage pages (`/stages/<slug>`) and MilestonesDisplay's stage-milestone detail panels both gained the same practices, unconditionally — no prerequisite gating, earned or not.

**The mechanical problem found and fixed before shipping:** the session prompt framed this as "a dashboard card," but `score/page.tsx` already independently POSTs to the milestone-award endpoint after every evaluation (from an earlier phase) and that POST almost always lands *before* any dashboard visit — so a dashboard-only card would have found the crossing already claimed and shown nothing, outside the rare retroactive-catchup case. Fixed by mounting the same card on both surfaces, each resolving its own response independently.

**`StagePracticesList` was extracted mid-session**, not originally planned — after the adversarial review found the original inline "no prerequisite gating" render was guarded only by a source-text pin a plausible refactor could silently defeat. The extracted component's props carry no earned/selection concept at all, so the property is now true by construction.

**UPDATED same session, post-fold — the mentor-verdict fold:** the "highest rank wins" tie-break this close originally shipped for simultaneous stage crossings (see the Adversarial review section below) has been replaced. `resolveNewlyEarnedStage` now takes the practitioner's most-recent-evaluation level as a required second parameter and never announces a stage merely because it was the highest ever reached; when more than one crossing was newly earned in the same check, the card now says so explicitly — *"Your practice has moved through more than one condition. Where it stands now is ⟨X⟩. These practices meet you where you now are."* — naming the CURRENT condition, not the peak one. Full detail in `D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT`.

## Verification (all green, post-fold — numbers below are the FINAL state, after the mentor-verdict fold; corrected from the original close's now-superseded 627/17/929/38 figures)

unit **645/0** (also **645/0 under `TZ=UTC`**) · **stage-crossing 18/0** · boundary: hupexairesis 529/0 · morning 467/0 · oikeiosis 418/0 · passion-log 705/0 · practice-status 626/0 · premeditatio 542/0 · sage-compass 594/0 · view-from-above 529/0 · logos 249/0 · **milestones/stage-crossing 937/0** · render: **stage-crossing-card 67/0** · **stage-practices-list 46/0** · suggested-practice-card 15/0 · daily-rhythm-strip 53/0 · milestone-check-data **61/0** · schema-drift 51/0 · `tsc` 0 · `npm run build` 0. **Re-run and confirmed exact, same session, immediately before this close was finalized** — not carried forward from memory.

**Mutation testing, three rounds, 19/19 killed, every mutation verified-applied before its result was trusted** (python3 harness). Round 1 (8 targets — the rank comparison, the milestone-field resolution, the condition-not-grade wording, the orientation-line wording, the orientation-line's zero-practice leak, the slug lookup, the earn card's conditional guard, the detail-panel XOR split) found one genuine gap on first write — a mutation that broke the XOR connection while leaving both fragments textually present survived an independent-substring check — fixed and re-verified in place. Round 2 (5 targets, after the adversarial-review fixes) — 5/5 killed clean. **Round 3 (6 targets, the mentor-verdict fold — the reversion to highest-rank logic; the dedup-guard removal; the plural-composer wording drift; `isPlural` ignored in the card; the stale-closure variant on `score/page.tsx`; `mostRecentProximity` hardcoded to null on the dashboard) — 6/6 killed.** One genuine self-caught defect along the way: the first draft of the new duplicate-id test failed against the actual code, because the resolver did not yet deduplicate by stage before this fold added it (BD-8) — caught by running the test, not merely writing it.

## Adversarial review (PR19) — method honestly disclosed

The Workflow tool's own opt-in gate (an explicit "ultracode" or workflow request) was not met this turn, so the review ran as **4 parallel independent `Agent` tool calls** — verdict-fidelity, rendering-and-wiring correctness, blast-radius/regression risk, test-adequacy — genuinely separate contexts blind to the build's own reasoning, methodologically aligned with but not the literal mechanism of this arc's prior Workflow-based reviews. All four completed fully; this is disclosed as a deliberate departure, not a silent substitution.

**Real findings, not manufactured ones:**

- **HIGH, fixed:** `newlyEarnedStage` was never reset between evaluations on `/score` — a second evaluation in the same visit, without navigating away, resurfaced the *first* evaluation's stage-crossing card. This is the **third instance** of the exact stale-suggestion-card bug class in this arc (Phase 2's independent review found and fixed it across five pages already). Fixed by adding the reset to the per-evaluation reset block; locked with a source-grep wiring pin (interactive React state no static render can exercise) and mutation-killed.
- **MEDIUM-HIGH, fixed structurally:** the original inline "no prerequisite gating" guard was a negative source-text regex a plausible refactor (hoisting the earned-check into a named variable) could silently defeat. Fixed via the `StagePracticesList` extraction.
- **MEDIUM, fixed:** the card's render test asserted the correct-stage-name property against a single fixture; a hardcoded name would have passed. Fixed by looping over all five stages; mutation-verified.
- **MEDIUM, disclosed, named an open question at the time — RESOLVED same session, see the update below:** the "highest rank wins" tie-break for simultaneous stage crossings (the retroactive-catchup case) was this session's own extrapolation from a Phase 2 principle, not a mentor verdict — and adversarial review argued it was not a rare scenario, and that the alternative failure mode (showing a high-water-mark condition to someone whose overall history says otherwise) was arguably close to the achievement-framing verdict 1 exists to prevent. **UPDATED same session, post-fold:** put to the mentor directly (`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-briefing.md` / `…-verdict-verbatim.md`). All three candidates this review weighed were rejected — highest-rank ("not a mirror. It is a trophy"), lowest-rank ("a different distortion of the same historical fact"), and silence ("withholding orientation from the practitioners who have earned the most context") — in favor of a fourth: disclose the plurality, name the practitioner's most-recent-evaluation condition. Built and verified same-day; see `D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT`. No longer open.
- **MEDIUM, disclosed — reconfirmed unfixed by explicit founder-requested recommendation, not merely carried forward:** a genuine, non-transactional read-decide-write race in the pre-existing, unmodified milestone-award route means two truly concurrent requests (two tabs, or a very fast score→dashboard navigation) could each independently observe and independently dismiss the same crossing. The database stays correct; the only consequence is a possible double-show, not a repeat-forever. **UPDATED same session:** the founder asked directly for this session's own engineering recommendation on this residual; the recommendation is to leave it unfixed — a genuine fix needs either a transactional read-decide-write in the already-live route or a cross-tab signal, both bigger and riskier than the low-severity problem justifies. Recorded as a considered judgement in `D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT` (BD-6.9) and in the source comment at the affected call sites, not an omission.
- **LOW, disclosed — reconfirmed unfixed by explicit founder-requested recommendation, cosmetic, self-resolving on reload:** if the award POST succeeds but the following read fails, the dashboard can show the fresh earn card in the same frame as its own "could not be loaded" outage banner with the just-earned tile greyed out. **UPDATED same session:** recommendation is to leave it unfixed — the only real fix (suppress the card when the subsequent read fails) would silently discard the one-shot notification permanently, which is worse than the cosmetic inconsistency it would resolve. Same decision-log entry, same disposition.
- **Precision-only findings, all folded:** a pre-existing pin's regex span was looser than the actual measured distance, with no non-vacuity companion — tightened and completed; a citation in a new test's own header overstated where a known gap was previously recorded — corrected; one wiring block's one-hop reach was narrower than the main sweep's, confirmed not exploited by anything this session added.
- **Confirmed clean, not merely asserted:** copy fidelity against the verbatim mentor record (byte-compared); no prerequisite gating anywhere (re-confirmed post-extraction); measurement-neutrality (traced import-by-import, including transitively); the pre-existing `STAGE_PRACTICES` mapping itself unchanged (zero diff hunks).

## Next Session Should

There is no scripted next phase — **the human plan is complete.** What's queued:
1. **The agent plan** — its own next step, gated on the founder's go (election E4); not started, no session prompt authored yet.
2. **R17 on `milestones`** — the arc's oldest carried item, Critical, founder-walked; gates external onboarding.
3. **Independent review re-runs for Phases 0 and 1** — spend-limit casualties from earlier in the arc; Phase 3's own review was independent-by-construction from the outset, so it does not join this list.

**UPDATED same session, post-fold:** item 4 in the original list — "BD-4, worth a founder or mentor read before it hardens into unquestioned behaviour" — is done. It was read by the mentor, answered, adopted, and built the same session. Nothing about the stage-crossing trigger remains queued for a future session; the two engineering residuals below are the only items this arc still carries, and both now carry an explicit, reasoned recommendation rather than an open status.

## Blocked On

**Files to commit (this session's work — UPDATED to include the mentor-verdict fold; `website/src/app/dashboard/page.tsx` and the two mentor-record files are new since the original close):**
- `website/src/lib/practice-sequence.ts`
- `website/src/lib/__tests__/practice-sequence.test.ts`
- `website/src/lib/__tests__/milestone-check-data.test.ts`
- `website/src/lib/stage-crossing.ts` (new)
- `website/src/lib/__tests__/stage-crossing.test.ts` (new)
- `website/src/components/StageCrossingCard.tsx` (new)
- `website/src/components/StagePracticesList.tsx` (new)
- `website/src/components/__tests__/stage-crossing-card.test.tsx` (new)
- `website/src/components/__tests__/stage-practices-list.test.tsx` (new)
- `website/src/components/MilestonesDisplay.tsx`
- `website/src/app/score/page.tsx`
- `website/src/app/dashboard/page.tsx` (new to this arc — one line, the `mostRecentProximity` prop; this session's first-ever edit to this file)
- `website/src/app/stages/[slug]/page.tsx`
- `website/src/app/api/milestones/__tests__/` (new — `human-practitioner-boundary.test.ts`)
- `operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-briefing.md` (new)
- `operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-verdict-verbatim.md` (new)
- `operations/decision-log.md`, the human build plan (§8 status + top-of-file status line), this close.

**Also pending from a prior thread, not this session's to stage:** `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase2-in-session-suggestions-CLOSE.md` shows one uncommitted edit — a PR18-style production-state update recording that Phase 2's commit was pushed, deployed green, and spot-checked (`sagereasoning.com/logos`), made between sessions by a process this session did not initiate. Verified genuine: `git log`/`git rev-list` confirm `HEAD` matches `origin/main` exactly (Phase 2's commit `c538a4d` is pushed). Carried forward for the founder to include or discard — not this session's authorship, but not discarded either. **Not this session's to stage:** `website/src/data/environmental-context.json` (another thread's carry-forward, pre-existing at session open).

**Production state at close (PR18):** byte-equivalent — nothing deployed; no schema, flag, credential or env change. On the founder's push, the milestone-award response's existing `new_milestones` field (unchanged) is newly consumed client-side; the score page and dashboard gain the earn card; Stage pages and milestone detail panels gain practice links. Every pre-existing response field and behaviour is unchanged (suite-pinned; `tsc`/`build` green). S11 remains REFUSED; MEASURE throughout; weights BLOCKED; the 0h call remains the founder's — all unaffected.

**Session honesty note:** the harness ran **unframed** — every Gate-1/Gate-2 consult and guardrail check 401'd or 429'd throughout (the known transient fail-secure class), so this session's own actions were not examined by the practice. Nothing was blocked; every action proceeded deliberately. The adversarial review's own honesty note: it ran as 4 parallel `Agent` calls rather than the arc's usual `Workflow`-based review, because the Workflow tool's opt-in gate was not met this turn — a disclosed methodological substitution, not a silent one, and it found real, non-trivial defects (see above), so the substitute mechanism was not merely a formality.

## Open Questions

**UPDATED same session, post-fold:** the multi-crossing tie-break below is CLOSED, not open — retained here (struck through in substance, not in text) so the resolution is visible in the same place the question was first raised, per this project's "record, don't silently overwrite" convention.

- ~~BD-4 — the highest-rank-wins simultaneous-crossing tie-break — genuinely open, not merely disclosed.~~ **RESOLVED same session.** Put to the mentor; verdict adopted (disclose the plurality; name the most-recent-evaluation's condition, never the highest ever reached); built and verified. See `D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT`. No longer carried.
- **The concurrent-POST race and the dashboard partial-failure visual inconsistency** — both disclosed, neither fixed. **UPDATED same session:** both reconfirmed unfixed on this session's own explicit engineering recommendation (asked for directly by the founder), not by default — a genuine fix for either is bigger and riskier than the low-severity, self-resolving problem each represents. Recorded reasoning in `D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT` and in the source comments at the affected call sites. Still not fixed; now carries a considered disposition rather than an open status.
- Carried unchanged: **R17 on `milestones`** (oldest, Critical, founder-walked); the journal UTC pace-gate mismatch (chip `task_4cee2a1c`); the day-55 evening-pole case (chip `task_197803bb`); `/api/milestones` + `/api/baseline` on the `scoring` bucket; the optional returning-line refinement; `oikeiosis_context` never written; independent review re-runs for Phases 0 and 1.

## Founder Verification

**UPDATED same session, post-fold — commands, expected counts, and the git block below are all the FINAL state (the mentor-verdict fold included); the original close's `627/17/929/38` figures are superseded.**

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/__tests__/practice-sequence.test.ts && npx tsx src/lib/__tests__/stage-crossing.test.ts && npx tsx src/lib/__tests__/milestone-check-data.test.ts && npx tsx src/app/api/milestones/__tests__/human-practitioner-boundary.test.ts && npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/stage-crossing-card.test.tsx && npx tsx --tsconfig tsconfig.rendertest.json src/components/__tests__/stage-practices-list.test.tsx && npx tsc --noEmit
```
Expected: `645 passed, 0 failed`; `18 passed, 0 failed`; `61 passed, 0 failed`; `937 passed, 0 failed`; `67 passed, 0 failed`; `46 passed, 0 failed`; tsc exit 0. (All six re-run and confirmed exact immediately before this close was finalized.)

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add \
  website/src/lib/practice-sequence.ts \
  website/src/lib/__tests__/practice-sequence.test.ts \
  website/src/lib/__tests__/milestone-check-data.test.ts \
  website/src/lib/stage-crossing.ts \
  website/src/lib/__tests__/stage-crossing.test.ts \
  website/src/components/StageCrossingCard.tsx \
  website/src/components/StagePracticesList.tsx \
  website/src/components/__tests__/stage-crossing-card.test.tsx \
  website/src/components/__tests__/stage-practices-list.test.tsx \
  website/src/components/MilestonesDisplay.tsx \
  website/src/app/score/page.tsx \
  website/src/app/dashboard/page.tsx \
  "website/src/app/stages/[slug]/page.tsx" \
  website/src/app/api/milestones/__tests__ \
  operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-briefing.md \
  operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-verdict-verbatim.md \
  operations/decision-log.md \
  operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md \
  operations/handoffs/founder/2026-07-27-practice-reminders-human-phase3-stage-crossing-CLOSE.md
cat > /tmp/sage-p3-tiebreak-commit-msg.txt <<'EOF'
Build the stage-crossing trigger, completing the human reminders plan

Once an evaluation newly crosses into one of the five Stages of
Practice, a card names the condition -- never a grade -- and offers
that stage's practices, on whichever surface (the score result or the
dashboard) happens to observe the crossing first. No prerequisite
gating; no client-side store, since the milestone-award endpoint's own
idempotency already makes the card one-shot, permanently, across
devices.

The session prompt framed this as a dashboard-only card, but the score
page already independently posts to the same award endpoint after
every evaluation, and that post almost always lands first -- so a
dashboard-only card would have fired only in the rare retroactive-
catchup case. Both surfaces now resolve their own response
independently.

An adversarial review (4 independent agents, the Workflow tool's own
opt-in gate not met this turn so disclosed as a substitute mechanism)
found a HIGH defect -- the third instance in this arc of a stale
suggestion card surviving past the entry it was about, this time
across two evaluations on the score page -- fixed and mutation-locked;
a MEDIUM-HIGH test-fragility issue, fixed by extracting
StagePracticesList so 'no prerequisite gating' is true by construction
rather than a source-text pin a refactor could defeat; and a genuine
open design question -- which stage to name when several are newly
earned at once -- that the review flagged as this session's own
extrapolation rather than a mentor verdict.

That question was then put to the mentor directly, same session. Its
verdict rejected the review's own leading candidate (naming the
highest stage ever reached: "not a mirror. It is a trophy"), rejected
silence ("withholding orientation from the practitioners who have
earned the most context"), and adopted a fourth option: disclose the
plurality, and name the stage matching the practitioner's MOST RECENT
evaluation, never the highest ever reached. Built the same day --
resolveNewlyEarnedStage now takes the practitioner's current condition
as a required second parameter, and the card discloses when more than
one crossing was newly earned at once rather than presenting one point
as the whole truth. Separately, at the founder's explicit request, two
narrower engineering-only residuals (a concurrent-POST race; a
dashboard partial-failure visual inconsistency) were reviewed and left
unfixed as disclosed, accepted trade-offs, on this session's own
recommendation.

Elevated: no schema, flag, auth-model or deploy-config change. Suites
645/0 (and under TZ=UTC), 18/0, 61/0, 937/0, 67/0, 46/0, all nine
sibling boundary suites and logos green, tsc 0, build 0. 19 mutations
killed across three rounds, each verified-applied.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
git commit -F /tmp/sage-p3-tiebreak-commit-msg.txt
rm /tmp/sage-p3-tiebreak-commit-msg.txt
git status --short
```
Expected after commit: only `website/src/data/environmental-context.json` remains modified (another thread's, pre-existing). Then push via GitHub Desktop — an ordinary Vercel build.

**Why this changed from a plain `git commit -m "..."` (2026-07-27, same session, founder-reported):** the message above quotes the mentor's own words verbatim — `"not a mirror. It is a trophy"`, `"withholding orientation from the practitioners who have earned the most context"` — and a bare `-m "..."` cannot contain literal `"` characters inside it; bash closes the outer string at the first inner `"`, and the words between that point and the next `"` become separate, unquoted shell arguments. Reproduced and confirmed: the founder's exact reported errors (`pathspec 'a'`, `pathspec 'mirror.'`) come from precisely this — `not`, `a`, `mirror.`, `It`, `is`, `a`, `trophy` each became stray bare words, which `git commit` (taking any leftover positional argument as a pathspec) tried and failed to resolve as filenames. The fix writes the message to a plain file first (a heredoc with a **quoted** delimiter, `<<'EOF'`, so nothing inside it — quotes, backticks, `$` — is reinterpreted by the shell) and commits with `-F`, which reads the file's bytes literally with no shell quote-parsing at all. Verified in an isolated scratch repo before writing this fix back: `git commit -F` reproduced the exact multi-line message, embedded quotes intact, byte for byte. **Standing lesson for future sessions: any commit message quoting someone's words verbatim needs `-F <file>` (or an equivalent that avoids nested `"..."`), never a bare `-m "..."`.**

**Post-deploy spot-check (signed in, per founder discretion):** evaluate an action that would cross a new stage for the first time (or has not yet been evaluated at that level) → the card should appear on `/score` immediately below the Philosophical Reflection, naming the stage as a condition; dismiss it, then evaluate a *second* action in the same visit → confirm the stale card does NOT reappear (the HIGH fix). Visit `/dashboard` and open a stage milestone's detail panel (earned or not) → confirm its practices (or, for The Inner Fire, its note) appear beside the Stage-page link. Visit `/stages/the-worn-path` (or any stage) directly → confirm its practices render with doorbell lines. **The plural form is not practically spot-checkable this way** — it fires only when a single milestone check newly awards more than one distinct stage at once (the retroactive-catchup case), which an ordinary single-evaluation walkthrough cannot produce; its correctness rests on `stage-crossing.test.ts`'s C1–C4 property tests and the mutation-testing round above, not a live click-through.

## Cross-references

- `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase3-stage-crossing-NEXT-SESSION-PROMPT.md` (the prompt this session executed)
- `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` (binding)
- `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §8 (now BUILT; the plan itself now COMPLETE)
- `D-PRACTICE-REMINDERS-HUMAN-PHASE3-STAGE-CROSSING-BUILT` (this session's original decision-log entry, in full)
- `D-PRACTICE-REMINDERS-HUMAN-PHASE2-IN-SESSION-TRIGGER-BUILT` / `-INDEPENDENT-REVIEW-FOLDED` (the stale-suggestion-card lesson this phase reproduced and re-fixed a third time)
- **`D-PRACTICE-REMINDERS-HUMAN-PHASE3-TIEBREAK-MENTOR-VERDICT-ADOPTED-AND-BUILT` (NEW, same session — the tie-break fold's own decision-log entry, in full: reasoning, BD-6…BD-8, files touched, verification, rollback)**
- **`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-briefing.md`** (NEW — the self-contained question put to the mentor, scoped to genuinely philosophical/delivery questions only)
- **`operations/reminders-2026-07/2026-07-27-phase3-tiebreak-mentor-verdict-verbatim.md`** (NEW — the binding verbatim reply)

*End of session close. Every stage a practitioner reaches now names itself honestly and hands over what fits — on whichever page they happen to be on when it happens, whichever of the conditions it now is, and however many it passed through to arrive there — and the human half of this arc is complete.*
