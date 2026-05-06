# Session Close — 2026-05-06 — Sub-session M1-CP4b: ADR amendments for AC-14 + Tier 2 soft-clarification

**Stream:** founder.
**Governing frame:** `/adopted/session-opening-protocol.md` (cached via `/adopted/standing-protocol-cache.md` — lean form for `governance` category).
**Tier:** governance — **Standard** risk under 0d-ii.
**Date:** 2026-05-06.

## Decisions Made

- **D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06** appended to active decision log (~80 lines added). Four ADRs amended in place to specify the four engine-level intake-clarification triggers (EUPATHEIA_BOUNDARY + PRAXIS_MOTIVATION_AMBIGUITY for AC-14 Tier 3 OPEN_DEFERRAL; STATED_OPERATIVE_CONFLICT + STATED_EQUANIMITY_UNVERIFIED for AC-13 Tier 2 soft-clarification). Schemas remain at v1 (additive). Tier 1 force-clarification triggers explicitly out of scope; engage at M1-CP4d/4e per the D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05 sub-session block.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005) | Adopted (M1-CP1, 2026-05-04, with two in-session amendments) | **Adopted (with M1-CP4b cross-session amendment 2026-05-06).** Schema additions for AC-14 + Tier 2 trigger fields. Version remains `layer1-schema-v1`. |
| `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006) | Adopted (M1-CP2, 2026-05-04) | **Adopted (with M1-CP4b cross-session amendment 2026-05-06).** New §3.9 trigger detection + intake_clarifications field on Layer2Assessment. Version remains `layer2-assessment-v1`. |
| `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007) | Adopted (M1-CP3, 2026-05-04, with two in-session amendments) | **Adopted (with M1-CP4b cross-session amendment 2026-05-06).** Two new prose fields + extended marginal-case discipline + extended fallback. Version remains `layer3-prose-v1`. |
| `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) | Adopted (E10, 2026-05-04) | **Adopted (with M1-CP4b cross-session amendment 2026-05-06).** §10 checkpoint table extended with M1-CP4b → M1-CP4f rows; §10.1 + §10.2 extended with sub-session inter-checkpoint state + rollback paths. |
| M1-CP4b deliverable (per yesterday's D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER) | Scoped (named in yesterday's scope-decision entry) | **Verified (governance).** Four ADR amendments applied; decision-log entry appended; this close + next-session prompt produced. |
| `/api/reason` route + the three layer modules | Wired (parallel-run, dormant by default) | **Unchanged.** No code change at this session; modules remain Wired (parallel-run, dormant). M1-CP4c implements the spec extensions in code. |

## Next Session Should

**Sub-session M1-CP4c — Layer 1/2/3 module updates for AC-14 + Tier 2.** Per ADR-004 §10's amended checkpoint table. **Standard-tier code session — lean form per cache.**

The session implements the M1-CP4b spec extensions in `/website/src/lib/translation-sandwich/layer1-extractor.ts` + `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` + `/website/src/lib/translation-sandwich/layer3-prose.ts`. Harness `/website/scripts/verify-translation-sandwich.ts` extended with F5 (eupatheia-shape) + F6 (stated-equanimity-with-passion) fixtures + Phase 5 assertions 8 + 9 + 10. Modules re-verified standalone — no route wiring at this session (parallel-run.ts updates are M1-CP4f). Standalone harness target: all phases pass against the extended fixture set with the new fields populated correctly.

Pre-conditions for M1-CP4c:
1. The four ADR amendments from this session are committed + pushed (Step A of Founder Verification below).
2. Founder is ready for a code session (estimated 4-7 hours; may span two sittings if Sonnet harness costs warrant a pause).
3. No concurrent traffic concerns — parallel-run remains dormant by default; this session's module changes do not touch the dormant runtime path until called by the orchestrator at M1-CP4f.

Estimated time: 4-7 hours. The largest risk is harness cost — F5 + F6 add two new fixtures × Sonnet calls in Phase 1 + Phase 5; cached fixtures (LAYER1_REPLAY_CACHE=1) reduce repeat-run cost. PR5 watch-status discipline applies to the new prose-fields-4-and-5 OUTPUT example — first real-Sonnet harness run is the third potential recurrence of "LLM marginal-case discipline requires worked OUTPUT examples".

Next-session prompt: `/operations/handoffs/founder/2026-05-06-M1-CP4c-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/adopted/adr/2026-05-04-layer1-schema-specification.md` (modified — M1-CP4b amendment)
- `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (modified — M1-CP4b amendment)
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (modified — M1-CP4b amendment)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (modified — §10 amendment)
- `/operations/decision-log.md` (modified — D-M1-CP4b entry appended)
- `/operations/handoffs/founder/2026-05-06-sub-session-M1-CP4b-close.md` (this file — new)
- `/operations/handoffs/founder/2026-05-06-M1-CP4c-NEXT-SESSION-PROMPT.md` (next — new)

**Production state at session close:**

- Vercel deployment: **unchanged.** No `/website/**` files touched this session. Vercel may or may not redeploy depending on its path-filter configuration; either way, runtime behaviour is unchanged. Parallel-run remains dormant by default.
- Supabase `supabase-us`: **unchanged.** No DDL or DML this session.
- Env flags: **unchanged.** `TRANSLATION_SANDWICH_PARALLEL_RUN` remains `1` in Vercel Production (active as of 2026-05-05); the parallel run continues to accumulate comparison data in the no-AC-14 engine. Per yesterday's M1-CP5-resume pre-condition #4(h), this data will be filtered/truncated at M1-CP4f's baseline reset.
- AC4 / AC5 / AC7 / AC8 / PR1 / PR3 / PR4 / PR6: NOT engaged at this session (documentation-only).
- AC1 + AC6: NOT engaged at this session (no LLM call from amendments themselves).
- LLM cost incurred this session: **$0.00.**

## Open Questions

(Carried into the decision-log entry; summarised here.)

1. **Layer 2 motivation_classification default for `motivation_stated == true` cases.** Conservative default (`'virtue_explicit'`) may be over-permissive. Revisit at M1-CP4c harness observation.
2. **EUPATHEIA_BOUNDARY firing on every detected eupatheia candidate.** Working assumption: each candidate is its own self-knowledge gap. Revisit at M1-CP5 if observed-frequency exceeds expectations.
3. **STATED_OPERATIVE_CONFLICT heuristic precision.** Current heuristic (fire when `for_self_concern != null`) may be over-broad. Revisit at M1-CP4c harness if false positives surface on F6.
4. **Sub-session naming consistency.** Yesterday's scope-decision used `M1-CP4b → 4c → 4d → 4e → 4f`; ADR-004 §10's table now matches. If founder later prefers different labels, one rename pass touches the ADR + decision log + handoffs.

## Founder Verification

**Step A — Commit + push.** Open Terminal, paste this exact block, press **Enter** (one combined command):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add -A adopted/adr/2026-05-04-layer1-schema-specification.md adopted/adr/2026-05-04-layer2-mechanism-algorithm.md adopted/adr/2026-05-04-layer3-prose-template-api-reason.md adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md operations/decision-log.md operations/handoffs/founder/2026-05-06-sub-session-M1-CP4b-close.md operations/handoffs/founder/2026-05-06-M1-CP4c-NEXT-SESSION-PROMPT.md && git commit -m "session close: M1-CP4b ADR amendments for AC-14 + Tier 2 soft-clarification — four engine-level intake triggers specified in ADR-005 + ADR-006 + ADR-007 + ADR-004 §10 — 2026-05-06 (Sub-session M1-CP4b)

- D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06 — appended (~80 lines). Four ADRs amended in place per the existing in-session amendment pattern (Changelog entry + in-place edit + git history as canonical preservation).

- ADR-005 (Layer 1) — adds EupatheiaShape + StatedEquanimitySignal vocabularies; four entry-shape interfaces (EupatheiaCandidate, StatedConcernTarget, StatedEquanimitySignalEntry, MotivationEvidenceEntry); five new top-level Layer1Schema fields (eupatheia_candidates, stated_concern_targets, stated_equanimity_signals, motivation_stated, motivation_evidence); per-field guidance §3.8–§3.11; system prompt categories 8–11 with worked OUTPUT example entries per PR5; validator extension §6; F5 + F6 fixtures; Phase 1 assertions updated. Schema version remains layer1-schema-v1 (additive).

- ADR-006 (Layer 2) — adds IntakeTriggerCode + DeferralStatus + MotivationClassification vocabularies; SoftClarification + OpenDeferralEntry + IntakeClarifications interfaces; motivation_classification on IterativeRefinement; intake_clarifications on Layer2Assessment; new §3.9 four-step trigger detection algorithm with lookup tables (eupatheia display names + descriptions + passion counterparts; virtue descriptions; convention substitution description); validator extension §5; citation summary extension §6. Assessment version remains layer2-assessment-v1 (additive).

- ADR-007 (Layer 3) — adds soft_clarification_prose + open_deferrals_prose to Layer3Prose; system prompt prose-fields 4 + 5 + MARGINAL-CASE DISCIPLINE EXTENSION block; OUTPUT example extended with two new fields (null when not applicable) + WORKED EXAMPLE block showing both fields populated for a EUPATHEIA_BOUNDARY case (PR5 worked-example discipline); fallback prose §6 extended with d-a16 stem rendering + AC-14 marginal-case appends; validator extension §7; Phase 5 assertions 8 + 9 + 10 added; cross-fixture coverage extended for F5 + F6. Prose version remains layer3-prose-v1 (additive).

- ADR-004 §10 — checkpoint table extended with M1-CP4b → M1-CP4f rows inserted between M1-CP4 and M1-CP5; §10 prose extended with architectural reasoning for the sub-session block; §10.1 + §10.2 extended with new sub-session inter-checkpoint state + rollback paths.

- Standard risk under 0d-ii. Documentation-only. No code change, no production touch, no environment change, no perimeter touched at this session. AC4 / AC5 / AC7 / AC8 / PR1 / PR3 / PR4 / PR6 NOT engaged. Critical Change Protocol NOT engaged.

- Cross-references: D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05 (the scope decision this amendment realises); D-M1-CP5-FIRST-PASS-DEFERRED-2026-05-05; D-M1-CP4-PARALLEL-RUN-WIRING-2026-05-04; ADR-RAG-MENTOR-ALT3-01 AC-12 + AC-13 + AC-14; /adopted/rag-mentor-alt3/three-tier-intake.md; /adopted/rag-mentor-alt3/d-a16-catalogue.md."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-rebuilds on push to main. **Expected behaviour change at deploy: none** (this commit is documentation-only — no `/website/**` files touched).

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Step B — Independent spot-check.** Confirm the four ADR amendments are present in the files. Run:

```
grep -n "M1-CP4b" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-04-layer1-schema-specification.md" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md"
```

Expected: matches across all four files. Each ADR's amendment is bracketed with explicit "Added 2026-05-06 (M1-CP4b)" comments at the points of insertion + a Changelog entry at the bottom.

**Step C — Optional: monitor parallel-run accumulation between sessions.** Same query as the M1-CP5-resume prompt (no change at this session):

```sql
SELECT count(*) FILTER (WHERE translation_sandwich_output IS NOT NULL) AS sandwich_completed,
       count(*) AS total
FROM translation_sandwich_comparisons;
```

Note: the data accumulating in `translation_sandwich_comparisons` is from the no-AC-14 engine. M1-CP4f's baseline reset filters this out before M1-CP5 reads the rubric. No action needed between sessions.

## Cross-references

- `/operations/handoffs/founder/2026-05-05-sub-session-M1-CP5-first-pass-deferred-close.md` (predecessor — the deferral that surfaced the wiring gap; the scope-decision context for today's session)
- `/operations/handoffs/founder/2026-05-05-M1-CP5-RESUME-NEXT-SESSION-PROMPT.md` (the M1-CP5-resume prompt; this session was its first sub-session in the M1-CP4b → 4f block)
- `/operations/handoffs/founder/2026-05-06-M1-CP4c-NEXT-SESSION-PROMPT.md` (next session — M1-CP4c module updates; Standard-tier code; lean form)
- `/operations/decision-log.md` `D-M1-CP4b-AC14-TIER2-ADR-AMENDMENTS-2026-05-06` (this session's entry)
- `/operations/decision-log.md` `D-M1-AC13-AC14-WIRING-REQUIRED-BEFORE-CUTOVER-2026-05-05` (predecessor scope decision)
- `/adopted/ADR-RAG-MENTOR-ALT3-01-translation-sandwich-deterministic-engine.md` AC-12 + AC-13 + AC-14 (architectural commitments this amendment realises)
- `/adopted/rag-mentor-alt3/three-tier-intake.md` (Tier 1/2/3 specification — the source for §3.9)
- `/adopted/rag-mentor-alt3/d-a16-catalogue.md` (canonical stem text for the four trigger codes)
- `/adopted/adr/2026-05-04-layer1-schema-specification.md` (amended)
- `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (amended)
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (amended)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (§10 amended)
- `/adopted/standing-protocol-cache.md` (operative governing frame; lean form invoked for governance category)

*End of session close. M1-CP4b is the first sub-session of the M1-CP4b → 4f block per yesterday's scope decision. Four ADRs amended; the spec for the four engine-level intake triggers (EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY, STATED_OPERATIVE_CONFLICT, STATED_EQUANIMITY_UNVERIFIED) is now in place. M1-CP4c (the module updates that realise the spec) is the next session's deliverable.*
