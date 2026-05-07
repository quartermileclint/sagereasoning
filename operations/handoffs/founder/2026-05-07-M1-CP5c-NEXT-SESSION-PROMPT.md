# Next-Session Prompt — M1-CP5c: Layer 3 module update + harness re-cache + brief parallel-run re-validation

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverable-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5b-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (the seven Revisions to implement; gap 6 disposition; Pattern B election); `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` (the seven gaps catalogued); `D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07` (the parallel-run infrastructure used for re-validation).
**Risk classification:** Elevated under 0d-ii. Existing user-facing functionality changes — Layer 3 module is on the parallel-run path. The user-facing path remains bundled-depth (per ADR-004 §6.3 failure-isolation guarantee), so the module change is dormant until M1-CP6 cutover. Critical Change Protocol NOT engaged. AC4/AC5/AC7/PR6 NOT engaged.

## Why this session matters

M1-CP5b adopted seven Revisions to ADR-007's Layer 3 prompt template. M1-CP5c implements them: rewrites the system prompt + fallback helpers in `layer3-prose.ts`; updates Phase 5 harness assertions; regenerates F1–F5 layer3 fixture caches against live Sonnet; runs a brief parallel-run re-validation to confirm the new prose passes the seven-gap criteria the founder identified at M1-CP5. The module change sits on the parallel-run path (dormant until M1-CP6); user-facing prose remains bundled-depth throughout this session. After M1-CP5c lands cleanly, return-to-M1-CP5 with refreshed comparison data; if prose now confirms user-facing readiness, advance to M1-CP6 cutover (Critical tier).

This is the implementation half of the Revise election. M1-CP5b named what changes; M1-CP5c makes the changes; return-to-M1-CP5 verifies the changes meet the bar; M1-CP6 commits.

## Pre-conditions

1. M1-CP5b commit + push completed (per `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5b-close.md` Step A).
2. Founder ready for an Elevated-tier code session — typically 2–3 hours.
3. Anthropic API key available and funded. Estimated LLM cost this session: $0.20–$0.60 for F1–F5 layer3 cache regeneration (5 fixtures × Sonnet at ~2000 max-tokens) + $0.15–$0.50 for the brief parallel-run re-validation (5–10 `/admin/test-reason` clicks × full-sandwich engine at ~$0.0306/req observed). Total session-cost ceiling: ~$1.10.
4. ADR-007 (amended) read in full at session open — particularly the Amendment section dated 2026-05-07.
5. The seven Revisions reviewed at session open.
6. No env-flag changes anticipated.
7. No Supabase schema changes anticipated. New rows accumulate in `translation_sandwich_comparisons` from the brief parallel-run re-validation (additive INSERTs).
8. The `LAYER1_REPLAY_CACHE` env flag (or equivalent — check what the harness uses today) MUST be unset for the F1–F5 cache regeneration step (live Sonnet calls required), then can be set again for subsequent harness verification runs.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-elevated`, Elevated risk class, model selection per Element 6, signals).
2. `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5b-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry (`D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07`) — read in full, especially the seven Revisions and their implementation scope.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` Amendment section dated 2026-05-07 — read in full. This is the implementation specification.
5. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` §3, §5, §6, §7, §8 — these are the sections M1-CP5c modifies in code (the prompt constant, composition rule, fallback helpers, validator, harness Phase 5 assertions).
6. `/website/src/lib/translation-sandwich/layer3-prose.ts` — read in full. This is the module M1-CP5c rewrites.
7. `/website/scripts/verify-translation-sandwich.ts` Phase 5 section — read the existing assertions before updating them.

Confirm at session open per cache + Elevated-tier protocol:

- **Tier:** `code-elevated` — Elevated risk under 0d-ii (changes to existing user-facing functionality on the parallel-run path; user-visible behaviour remains unchanged because the user-facing path is bundled-depth; the module the change touches becomes user-facing at M1-CP6).
- **Hold-point:** P0 0h active.
- **Model selection (per cache Element 6):** Sonnet (`MODEL_DEEP`) for Layer 3 — unchanged from ADR-007 §4. The amendment touches the prompt content and the fallback templates, not the model selection.
- **Status vocabulary:** Layer 3 module starts at Verified (current behaviour); becomes Scoped → Designed → Scaffolded → Wired → Verified across this session as the Revisions are implemented and harness passes. ADR-007 stays at Verified (amended).
- **Engaged rules:** R0, R8a, R8c, R7, AC1 (model selection cited), AC8 (translation-sandwich engine), KG1 (Vercel five rules — LLM call still awaited; no fire-and-forget; no module-level cache; no DB writes), KG2 (Sonnet retained), PR1 (single-endpoint proof — `/api/reason` is the M1 pilot), PR3 (synchronous discipline preserved — `generateProse` is awaited), PR4 (model selection enforced via `assessment_deep` PermittedModel), PR5 (knowledge-gap carry-forward — the M1-CP3 worked-example discipline applied to the new OUTPUT examples). **NOT engaged:** AC4, AC5, AC7, PR6 (no R20a perimeter or auth surface touched; the route's distress check at line 144 is unchanged; the Layer 3 module is called by the route AFTER the perimeter fires).

## Part B — Procedure

### Step 1 — Rewrite `LAYER3_SYSTEM_PROMPT_API_REASON` per Revisions 1–7

Open `/website/src/lib/translation-sandwich/layer3-prose.ts`. Locate the `LAYER3_SYSTEM_PROMPT_API_REASON` constant (the system prompt text from ADR-007 §3). Rewrite per the seven Revisions adopted at M1-CP5b:

- **Revision 1 (closing on action).** The PROSE FIELDS section's instructions for `philosophical_reflection` and `improvement_guidance` are updated so the closing-sentence rule is explicit. New rule text: closing sentences MUST be a concrete practice / actionable orientation / specific Stoic move. Disclaimers, marginal-case acknowledgments, single-snapshot caveats MUST NOT close any prose field.
- **Revision 2 (voice as guidance).** The PROSE FIELDS instructions tighten — first sentence carries the principled finding (one sentence; no extended unpacking); remaining sentences carry orientation + move.
- **Revision 3 (consistent bracketed glossing).** The CONTROLLED VOCABULARY (R8a) section is rewritten: "first use within a single prose field" → "first use per response across all prose fields". Add the required-gloss term list from the amendment (causal-chain stages, passions, eupatheiai, virtues, architecture terms, affect descriptors).
- **Revision 4 (careful false-judgement framing).** Add a new sub-section under PROSE FIELDS with the anti-pattern + target patterns from the amendment. Anti-pattern: predicating "evil" of the practitioner's character / response / person. Target: predicating moral weight of virtue/vice as framework features; applying the criterion to the false judgement (corrigible), not the practitioner's standing.
- **Revision 5 (marginal-case disclaimers demoted from closing line — Pattern B).** Update each MANDATORY rule (single_snapshot, is_kathekon: null, improvement_path_structured: null, EUPATHEIA_BOUNDARY, PRAXIS_MOTIVATION_AMBIGUITY) per the amendment's specifics. Each MUST appear when conditions apply, MUST appear mid-prose, MUST NOT close any field. Add the input-condition heuristic for single_snapshot ("temporal hooks present in input") and is_kathekon: null ("input has raised the question of appropriateness").
- **Revision 6 (surface preferred-indifferent observations).** Add a new rendering rule to PROSE FIELDS section 1 (philosophical_reflection): when `value_assessment.identified_value_errors` is non-empty, the prose MUST surface the value error as a structural observation (name the indifferent, name the agent's framing, connect to the principled finding). Worked example from the amendment (drawn from row 5b8bf957) added as a new sub-example.
- **Revision 7 (proportions).** Update word budgets: `philosophical_reflection` → 2–4 sentences (~40–110 words; was 2–6 / ~40–180); `improvement_guidance` → 2–5 sentences (~50–140 words; was 1–3 / ~30–80); `summary` unchanged. Add proportion guidance: `philosophical_reflection` ≤ 25%; `improvement_guidance` ≥ 60% by sentence count across the three primary fields.

Rewrite both OUTPUT examples in the prompt (the standard example + the M1-CP4b WORKED EXAMPLE for EUPATHEIA_BOUNDARY) to demonstrate the new shape. Per PR5 worked-example discipline, the OUTPUT example carries more weight than written instruction — invest in the examples.

Verification of this step: `grep -c "Closing sentences MUST" layer3-prose.ts` returns ≥ 1; `grep -c "first use per response" layer3-prose.ts` returns ≥ 1; `grep -c "value_assessment.identified_value_errors" layer3-prose.ts` returns ≥ 1.

Estimated time: 60–90 min.

### Step 2 — Update `generateFallbackProse` helpers per Revisions 4 + 5 + 6

Locate the fallback helper functions (`fallbackPhilosophicalReflection`, `fallbackImprovementGuidance`, `fallbackSummary`, the marginal-case append helpers) in `layer3-prose.ts`. Update per the amendment:

- **Revision 4 (careful false-judgement framing).** Review every fallback template that touches the criterion of good and evil. Rewrite any template that predicates "evil" of the practitioner's character / response / person. Use the target patterns from the amendment.
- **Revision 5 (closing-line discipline).** Restructure each fallback so marginal-case appends are inserted mid-prose, not as the closing sentence. The closing sentence is the action-orientation drawn from `correct_judgements` / `ruling_faculty_state` / `oikeiosis` / `value_assessment` per template.
- **Revision 6 (value-error rendering).** Add a value-error template keyed by `value_assessment.identified_value_errors[0].indifferent` × `agent_framing`. When `identified_value_errors` is non-empty AND `passions_detected` is empty, the value-error template carries the principled finding. When both are non-empty, both are rendered (the value-error observation is a peer of the principal-passion observation per the amendment).

Preserve the M1-CP4b additions (`soft_clarification_prose`, `open_deferrals_prose`) — those fields' fallback rendering is unchanged from the M1-CP4b spec (d-a16 stem text rendered verbatim from slot_fills).

Verification of this step: idempotency holds (per ADR-007 §6 — `generateFallbackProse` produces byte-equal output on two consecutive calls with the same input). The harness Phase 5 assertion 4 verifies this.

Estimated time: 30–45 min.

### Step 3 — Update Phase 5 harness assertions per Revisions 1 + 5 + 7

Open `/website/scripts/verify-translation-sandwich.ts`. Locate the Phase 5 section. Update assertions per the amendment:

- **Assertion 7 (marginal-case coverage).** Reword from "the prose for that fixture must contain the corresponding marginal-case phrasing" to "the prose for that fixture, when the corresponding assessment field condition fires AND the input-condition heuristic from Revision 5 is satisfied, must contain the corresponding marginal-case phrasing AND the phrasing MUST NOT be the closing sentence of any prose field".
- **NEW negative assertion (closing line is NOT a disclaimer).** For each fixture, parse the closing sentence of `philosophical_reflection` and `improvement_guidance`. Hard-fail if the closing sentence matches any of the marginal-case templates: "single snapshot", "cannot be determined from the available evidence", "no specific improvement path is identified", "polished surface over passion", "from virtue or from convention". Allow paraphrases — match on the conceptual substring rather than verbatim. The negative assertion catches the new failure mode introduced by Pattern B (LLM places disclaimer at closing line despite instruction).
- **NEW soft-warn assertion (proportion).** For each fixture, count sentences in `philosophical_reflection` vs `improvement_guidance`. Log a warning (not a hard-fail) when `improvement_guidance` sentence count is less than `philosophical_reflection` sentence count. The soft-warn surfaces the cases where the LLM produced more reflection than guidance — useful diagnostic during the brief parallel-run re-validation.
- **Assertions 8 + 9 + 10 (M1-CP4b additions for `soft_clarification_prose` / `open_deferrals_prose` / fallback parity).** Preserved unchanged. The amendment does not affect the AC-13 / AC-14 paths.

Verification of this step: harness compiles without TypeScript errors; the new assertions are reachable in the Phase 5 loop.

Estimated time: 30–45 min.

### Step 4 — Regenerate F1–F5 layer3 fixture caches against live Sonnet

Run the harness with the new prompt + new fallback templates against fixtures F1, F2, F3, F4, F5 with `LAYER1_REPLAY_CACHE` (or whatever the existing flag is) UNSET — so live Sonnet calls produce fresh layer3 prose.

Expected: harness passes Phase 1 (Layer 1 extraction), Phase 2 (Layer 1 schema fidelity), Phase 3 (Layer 2 determinism), Phase 4 (Layer 2 coverage) — these phases are unchanged from M1-CP4c. Phase 5 (Layer 3 prose-assessment consistency) MUST pass all assertions including the new negative assertion. Phase 6 (end-to-end orchestration) and Phase 7 (R20a perimeter preservation) MUST pass unchanged. Phase 8 (fallback semantics) MUST pass with the updated fallback templates.

If Phase 5 fails on any assertion: the prompt template or fallback template needs revision. Iterate within this session per the M1-CP3 in-session amendment precedent (the M1-CP3 changelog has two examples). Do not promote to a new session unless the failure pattern is structural rather than wording.

Cost ceiling for this step: $0.60. If exceeded, stop and report — surfaces a regression in token usage that needs investigation.

Verification of this step: harness output reports 100% pass on Phase 5; the new fixture caches at `/website/scripts/.translation-sandwich-cache/layer3-{F.id}.json` are present for F1–F5; subsequent runs with `LAYER1_REPLAY_CACHE=1` (or equivalent) replay the new caches without Sonnet calls.

Estimated time: 20–40 min (plus iteration if Phase 5 fails).

### Step 5 — Brief parallel-run re-validation via `/admin/test-reason`

Once the harness is green, exercise the new prompt template against the production-shaped path. Open `/admin/test-reason` (or whatever the admin fixture-firing surface is named per M1-CP4f). Click 5–10 fixtures that exercise the seven gap conditions:

- 1–2 fixtures that exercise Revision 1 (verify closing on action).
- 1 fixture that exercises Revision 3 (verify consistent glossing).
- 1 fixture that exercises Revision 4 (false-judgement framing) — pick a fixture with strong false-judgement content.
- 1 fixture that exercises Revision 5's input-condition heuristic for single_snapshot (an input WITHOUT temporal hooks — verify the disclaimer is omitted).
- 1 fixture that exercises Revision 6 (preferred-indifferent observation) — pick a fixture similar to row 5b8bf957's compulsive-checking shape.
- 1 fixture that exercises Revision 7 (verify proportions).

These produce new rows in `translation_sandwich_comparisons`. Founder reviews the prose for each row by querying:

```sql
SELECT
  request_id,
  translation_sandwich_output->'prose'->>'philosophical_reflection' AS reflection,
  translation_sandwich_output->'prose'->>'improvement_guidance' AS guidance,
  translation_sandwich_output->'prose'->>'summary' AS summary
FROM translation_sandwich_comparisons
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND tier1_aware = true
ORDER BY created_at DESC;
```

Spot-check each row against the seven Revisions. The verdict at this step is informal — the formal verdict is at return-to-M1-CP5. The brief re-validation is to catch obvious regressions before scheduling return-to-M1-CP5.

Cost ceiling for this step: $0.50. If exceeded, stop and report.

Verification of this step: 5–10 new rows in `translation_sandwich_comparisons` post-step-4; the prose in those rows passes informal founder review against the seven Revisions.

Estimated time: 30–45 min (including review).

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-MM-DD`. Cross-references: `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07`, `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07`.

Entry MUST capture: each Revision's implementation status (Wired/Verified); the LLM cost incurred (Steps 4 + 5); any in-session amendments to the prompt or fallback templates required to pass Phase 5; the brief parallel-run re-validation outcome (informal verdict); whether any new failure mode surfaced that needs M1-CP5c-prime or carries into return-to-M1-CP5.

### Step 7 — Session close (lean form) + draft return-to-M1-CP5 next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Names return-to-M1-CP5 as the next session.

The return-to-M1-CP5 next-session prompt scope: re-run the six-dimension comparison rubric against `translation_sandwich_comparisons` filtered on `tier1_aware = true AND created_at > [M1-CP5c timestamp]`; spot-check Step 4 prose against the seven Revisions; founder verdict on cutover-readiness; decision: cutover (advance to M1-CP6 — Critical tier with R10 announcement), revise-again (M1-CP5d), or rollback (revert parallel-run wiring; revisit ADR-003). Estimated time: 1.5–2 hours. Risk class: Standard (analysis-primary; no code change unless rollback).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + amendment + ADR-007 §3 + module + harness reads | 25–30 min |
| Step 1 — rewrite system prompt per Revisions 1–7 | 60–90 min |
| Step 2 — update fallback helpers per Revisions 4 + 5 + 6 | 30–45 min |
| Step 3 — update Phase 5 harness assertions | 30–45 min |
| Step 4 — regenerate F1–F5 fixture caches; iterate if Phase 5 fails | 20–60 min (depends on iteration) |
| Step 5 — brief parallel-run re-validation; spot-check prose | 30–45 min |
| Step 6 — decision-log entry (lean form) | 15–20 min |
| Step 7 — session close (lean form) + return-to-M1-CP5 prompt | 20–30 min |
| **Total** | **~3.5–4.5 hours** |

This is at the upper end of "Elevated-tier code session". If cumulative fatigue sets in around Step 5, can pause + resume Steps 6–7 next session (decision-log + close are quick once the implementation is verified). If Step 4 fails Phase 5 in ways that suggest structural issues (not wording drift), pause + reschedule Step 4 onward as M1-CP5c-prime.

## Rollback path

`git revert` of the M1-CP5c module + harness commit. The Layer 3 module reverts to its M1-CP4c-post state. The fixture caches at `/website/scripts/.translation-sandwich-cache/layer3-{F.id}.json` revert to their pre-M1-CP5c contents (cached on disk; `git revert` restores the prior caches). The new rows added to `translation_sandwich_comparisons` from Step 5 are not reversed (DB DML once committed; the additional rows simply continue to inform future analysis).

Production effect of rollback: the user-facing path is bundled-depth throughout this session and after rollback. Rollback only affects the dormant parallel-run path, which is also dormant before rollback. No user-visible change in either direction.

## Forecast

If M1-CP5c lands clean (Phase 5 100%; brief re-validation produces prose that passes informal founder review): return-to-M1-CP5 follows (Standard tier; 1.5–2 hours). If return-to-M1-CP5 confirms cutover-readiness, advance to M1-CP6 cutover (Critical tier; 3–4 hours; full Critical Change Protocol; R10 announcement). Total path from this point to cutover: M1-CP5c (~3.5–4.5hr) + return-to-M1-CP5 (~1.5–2hr) + M1-CP6 (~3–4hr) = ~8.5–10 hours session time across 3 sub-sessions.

If M1-CP5c discovers Pattern B produces unfixable LLM drift (the LLM places disclaimers at the closing line despite instruction + worked examples + harness assertions), the session reschedules: a follow-up M1-CP5b-prime amendment switches to Pattern A (field-absent = silent; remove MANDATORY entirely) and M1-CP5c-prime re-implements. This is the contingency the founder named at M1-CP5b's open-checkpoint. Total path adds ~2–3 hours if this contingency fires.

This is the implementation pivot session — the analytical work proven at M1-CP5 + the design work at M1-CP5b lands as code that ships at M1-CP6. Cutover-by-readiness rather than cutover-by-deadline.

End of prompt.
