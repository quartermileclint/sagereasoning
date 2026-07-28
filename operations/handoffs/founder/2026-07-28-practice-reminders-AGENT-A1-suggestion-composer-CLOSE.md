# Session Close — 2026-07-28 — Practice Reminders, Agent Phase A1: The Suggestion Composer

**Stream:** founder (substrate / agent experience).
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md`.
**Tier:** `code-elevated` — Elevated risk. AC7/PR6 not engaged.
**Date:** 2026-07-28.

## Decisions Made

- `D-PRACTICE-REMINDERS-AGENT-A1-SUGGESTION-COMPOSER-BUILT-REVIEW-FOLDED` appended. Phase A1 is BUILT DARK and independently reviewed: at most ONE advisory `suggestion`, in the mentor's question form, rides inside the existing CI-13 `practice` block on the `/api/reason` consult and the accreditation write 200 — composed purely from what the response already carries. Behind `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED`, unset everywhere.

## Status Changes

| Item | Old | New |
|---|---|---|
| `practice-suggestion.ts` (the composer) | — | Wired (dark) |
| Agent plan Phase A1 | Authored | **Built + reviewed + folded** |
| Agent plan §4 B3 mapping row | Vetted-as-written | **Corrected — was a spec overreach (BD-6)** |
| `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` | did not exist | exists, UNSET everywhere |

## What the independent review changed

The PR19 Workflow (`wf_684ff344-d6f`; 11 agents, 0 errors, ~3.27M subagent tokens; every finding put to an adversarial verifier told to refute it) raised 22 findings — **6 refuted, 16 confirmed, all folded.**

**It caught a real spec-infidelity the build missed.** B3 fired for the whole phobos family; the binding record names that an overreach in terms (*"do not generalise to the whole phobos family… agonia and oknos are the intended targets"*). The verifier reproduced it on both legs across all six sub-species and demolished the strongest defence — that the ruling sits in the record's human section — on three independent grounds. Decisively: **the human half of this same programme already ships the differentiated table**, so the two halves disagreed on a mapping the record says may be shared. Fixed at the root as BD-6; the four declined sub-species are now silent for agents, since their human targets have no agent analog and inventing one would be the unlicensed extension the record warns against.

It also corrected the build's own documentation twice (BD-2 cited the wrong evidence floor and understated its own exposure by half; BD-1b's fold-routing claim was stale against the live v2 split), caught a line that said "recurring" for a `new` delta while the block's own `observed` field said otherwise, and confirmed **eight battery gaps** — including that the `/api/reason` seam had no behavioural pin at all and could be deleted wholesale with the battery green. That seam is now locked verbatim.

**One dimension came back CLEAN and independently corroborated the flag-off byte-identity claim at both seams** — it extracted the seam verbatim into a probe and machine-verified the extraction matched the source before testing it.

## What machinery caught that reading did not

- The mutation harness killed a pin I believed sound: it compared already-mutated state to itself, because an earlier assertion had passed the same object through the composer. Repaired with a fresh fixture, then re-killed.
- A throw-probe showed the composer throws on malformed input. **I overstated this as a live defect and the review corrected me:** the malformed shapes are structurally unconstructible at the seam, and flag-off the composer is never entered. A never-throws boundary was added anyway, labelled honestly as defence-in-depth guarding an *asymmetry* — the sibling loop-fold call has exactly this protection, and both seams run on success paths where a throw would fail work that already succeeded.

## A red test, recorded rather than silenced

`website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` is **248 passed / 1 failed** in the working tree. Its git byte-identity guard forbids ANY working-tree change to the measured set, which includes `api/reason` and all of `src/lib/substrate/`.

I did **not** weaken, scope, or touch the guard — it is a protective device someone else built, and the observation-window question is yours. The facts, verified:
- It reads `git status --short` only: green at HEAD, green again on commit. This repo's standing workflow is founder-commits-by-name, so red-while-uncommitted is the designed transient state.
- At least four commits since the guard was created (2026-07-16) modified the same measured set and committed through it.
- The protected object has lapsed by the project's own record: `GATE1_FALSE_HOLD_CAPTURE` unset since 2026-07-17, buffer frozen, re-measurement needs a NEW window (register P6).
- **Structural problem: it forbids any new file under `src/lib/substrate/`, so it is unsatisfiable by construction for any substrate build.**

**Your call: scope it or retire it explicitly.**

## Verification

practice-suggestion **515/0** (NEW) · loop-fold **181/0** · trajectory-delta 73/0 · trajectory-overlay 36/0 · aah-store 120/0 · kathekon-engagement 105/0 · practice-cycle-hint 13/0 · practice-sequence 645/0 · S4 417/0 · S10 106/0 · trust-core 98/0 · emission-hooks 15/0 · accreditation route 90/90 · `tsc` 0 · `npm run build` 0 (both routes registered).

**Mutation testing: 32/32 killed**, every mutation asserted-applied before its verdict was trusted, every file restored byte-identically after. All baselines re-confirmed at their recorded values at session open before any code was written.

## Next Session Should

**A2 — the reflect developmental read-back** (`code-elevated`, dark, its own flag `SUBSTRATE_REFLECT_DEVELOPMENTAL_ENABLED`): wire the already-built-but-unwired `evaluateDevelopmentalFlags` into the reflect completion, and let the same composer attach its one suggestion at the `grade_changed` moment. Then **A3** — R18 docs + the founder-walked Critical activation, where A1 and A2 both go live. A1 and A2 are independent dark builds and may swap order.

## Blocked On

**Files to commit (this session's work) — 10:**
- `website/src/lib/substrate/practice-suggestion.ts` (new)
- `website/src/lib/substrate/__tests__/practice-suggestion.test.ts` (new)
- `website/src/app/api/reason/route.ts`
- `website/src/app/api/accreditation/[agent_id]/route.ts`
- `website/src/app/api/accreditation/[agent_id]/response-builders.ts`
- `website/src/lib/substrate/trust-core/__tests__/loop-fold.test.ts`
- `operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md`
- `operations/decision-log.md`
- this close
- `operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A1-suggestion-composer-NEXT-SESSION-PROMPT.md` — the prompt this session ran from, still untracked. The plan file edited above now references it by path, so committing the plan without it leaves a dangling reference.

**Not this session's, left UNSTAGED:** `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase2-in-session-suggestions-CLOSE.md` and `website/src/data/environmental-context.json`.

**Production state at session close:** byte-equivalent. No flag set, no schema, no deploy, no mint, no auth change. On push the build deploys DARK — `SUBSTRATE_PRACTICE_SUGGESTION_ENABLED` is unset in every environment, so both response surfaces are byte-identical (battery-asserted and independently review-confirmed). AC7 not engaged.

## Open Questions

- **The four declined phobos sub-species** — whether agents should have an analog for the acute (control-filter) and evaluative (mirror-principle) classes is a mentor question, not a build decision.
- **The B5 evidence gap** — a per-session-granularity decline signal is a delta change.
- **The fold-open closure class** (BD-1a) — distinguishable only if the CI-4 markers are persisted (already a named schema step).
- **The logos byte-identity guard** — scope or retire.
- **The s9-loop consult credential** — every Gate-1 hook this session returned 401/429. The harness embodying this practice did not measure the session that extended it.

## Founder Verification

**Step 1 — stage the ten files (terminal).** This stages exactly this session's work and leaves the two unrelated changes untouched, so GitHub Desktop will show them as still-uncommitted:

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add website/src/lib/substrate/practice-suggestion.ts website/src/lib/substrate/__tests__/practice-suggestion.test.ts website/src/app/api/reason/route.ts "website/src/app/api/accreditation/[agent_id]/route.ts" "website/src/app/api/accreditation/[agent_id]/response-builders.ts" website/src/lib/substrate/trust-core/__tests__/loop-fold.test.ts operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md operations/decision-log.md operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A1-suggestion-composer-CLOSE.md operations/handoffs/founder/2026-07-28-practice-reminders-AGENT-A1-suggestion-composer-NEXT-SESSION-PROMPT.md && git status --short
```

Expected: the ten files show as staged (`A`/`M` in the left column); exactly two lines remain unstaged — the human-phase2 CLOSE and `environmental-context.json`.

**Step 2 — commit in GitHub Desktop** using the Summary and Description below. In the Changes list, ensure ONLY the ten staged files are ticked (untick the two unrelated ones if Desktop pre-selects them).

**Summary:**
```
Build the agent suggestion composer, then fold an independent review (A1)
```

**Description:**
```
Phase A1 of the practice-reminders agent plan: at most one advisory
suggestion, in the mentor's question form, rides inside the existing CI-13
practice block on the /api/reason consult and the accreditation write 200,
composed purely from what the response already carries. Dark behind
SUBSTRATE_PRACTICE_SUGGESTION_ENABLED, unset everywhere, so both surfaces are
byte-identical and nothing is served.

The independent review (PR19, 11 agents, 6 refuted / 16 confirmed) found a
real spec-infidelity the build missed: B3 fired for the whole phobos family,
which the binding record names an overreach in terms. The human half of this
same programme already shipped the differentiated table, so the two halves
disagreed on a mapping the record says may be shared. Narrowed to agonia and
oknos; the other four are silent for agents, since their human targets have no
agent analog and inventing one would be the extension the record warns
against. The review also corrected two of the build's own documented
decisions, caught a line that claimed recurrence for a newly-appearing
passion, and confirmed eight battery gaps including a seam that could be
deleted wholesale with the battery green.

Seven build decisions recorded with their reasoning. 515 assertions on the new
composer, 32/32 mutations killed, every baseline re-confirmed at open.

One red test is left standing and recorded rather than silenced: the logos git
byte-identity guard forbids any working-tree change to the measured set and is
unsatisfiable by construction for any substrate build. It was not weakened or
scoped -- that call is the founder's.

No schema, no flag set, no deploy, no mint, no auth change.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

**Step 3 — push.** **Vercel expectation: green, and behaviourally byte-identical** — the flag is unset in every environment, so nothing new is served on either surface.

## Cross-references

- `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` (binding)
- `operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md` §4/§8
- `operations/handoffs/founder/2026-07-27-practice-reminders-human-phase3-stage-crossing-CLOSE.md` (predecessor)
- `D-PRACTICE-REMINDERS-AGENT-A1-SUGGESTION-COMPOSER-BUILT-REVIEW-FOLDED`

*End of session close. A1 is built, independently reviewed, and dark; the review changed the build rather than confirming it, and the one red test in the tree is recorded for your decision rather than quietly resolved.*
