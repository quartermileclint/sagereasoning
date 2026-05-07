# Next-Session Prompt — Sub-session M1-CP5d: ADR-007 Amendment 2 + Layer 3 prompt-template refinement (Revision 3 term-list + Q1 OUTPUT-example over-imitation)

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-return-to-M1-CP5-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07` (this session's verdict + Branch B election + M1-CP5d scope); `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-05-07` (the seven Revisions implemented); `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (the seven Revisions adopted).
**Risk classification:** Elevated under 0d-ii. Existing user-facing functionality changes — Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth so the change is dormant until M1-CP6 cutover, but the module that will become user-facing at M1-CP6 is the one being changed. AC4/AC5/AC7/PR6 NOT engaged (no R20a perimeter or auth surface touched). Critical Change Protocol NOT engaged.

## Why this session matters

return-to-M1-CP5 surfaced one Revision-3 soft miss (Row 1 didn't gloss `axia` — a Stoic architecture term used mid-prose) and carried Q1 (persistent OUTPUT-example over-imitation soft-warns: synkatathesis / phantasia / horme appearing in prose without being in the assessment) as M1-CP5d scope. Both items are surface-level prose-quality refinements that don't change the analytical engine; both would be addressed at cutover anyway, and the founder elected to land them now (Branch B precautionary refinement) rather than ship-then-refine. M1-CP5d implements both via in-place ADR-007 Amendment 2 + module + harness changes. M1-CP6 cutover is deferred until M1-CP5d + M1-CP5e + return-to-M1-CP5-prime land.

## Pre-conditions

1. return-to-M1-CP5 commit + push completed (the three governance files: decision-log entry + close + this prompt). Vercel green; production behaviour unchanged.
2. ADR-007 §3 + Amendment section 2026-05-07 read at session open (the prompt being amended).
3. The Revision 3 term-list (Amendment §"Revision 3" — Architecture row) and both OUTPUT examples (§3 lines ~211 and ~227) located before drafting the in-place changes.
4. **Schema-vs-prompt drift carry-forward applies.** Before issuing any SQL or column-reference, AI verifies column / JSONB-path references against `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` + `/website/src/lib/translation-sandwich/parallel-run.ts`. The column-name error caught at return-to-M1-CP5 must not recur.
5. Founder-attended local-machine session for harness re-run + commit. Browser session not required for steps 1–5; required only if founder elects optional parallel-run spot-check at Step 6.
6. No env-flag changes anticipated.
7. No Supabase schema changes anticipated.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-elevated`, Elevated risk class, model selection per Element 6, signals, lean-form-plus-Elevated-additions templates).
2. `/operations/handoffs/founder/2026-05-07-return-to-M1-CP5-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07` — read in full, especially the Open Questions 1, 2, 5, and 6.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` §3 (the prompt being amended) + Amendment section 2026-05-07 (the existing seven Revisions; the new Amendment 2 is appended as a sibling section).
5. `/website/src/lib/translation-sandwich/layer3-prose.ts` — locate the `LAYER3_SYSTEM_PROMPT_API_REASON` constant; the CONTROLLED VOCABULARY (R8a) section + both OUTPUT examples are the targets.

Confirm at session open per cache + governance protocol:

- **Tier:** `code-elevated` — Elevated risk under 0d-ii. AC4/AC5/AC7/PR6 NOT engaged.
- **Hold-point:** P0 0h active.
- **Model selection:** Sonnet (`MODEL_DEEP`) for Layer 3 — unchanged. Per cache Element 6 row "Layer 3 translation (alt-3)".
- **Status vocabulary:** Layer 3 module currently Verified (amended at M1-CP5c). After M1-CP5d: Verified (amended again — pending return-to-M1-CP5-prime to re-confirm). ADR-007 currently Adopted (amended at M1-CP5b — Amendment section 2026-05-07). After M1-CP5d: Adopted (amended again — Amendment section 2 appended).
- **Engaged rules:** R0, R8a, R8c, R7, AC1, AC8, KG1, PR1, PR3, PR4, PR5. NOT engaged: AC4, AC5, AC7, PR6.

## Part B — Procedure

### Step 1 — Draft ADR-007 Amendment 2 (in-place, sibling to Amendment 2026-05-07)

Amendment 2 is appended to ADR-007 as a NEW section dated YYYY-MM-DD (the actual session date), labelled "M1-CP5d: Revision 3 term-list refinement + Q1 OUTPUT-example over-imitation". The existing Amendment section 2026-05-07 is preserved unchanged.

Amendment 2 captures:

**Revision 3 amendment.** Add `axia (worth/value)`, `kathekon (appropriate action)`, `katorthoma (perfect action)`, `oikeiosis (appropriation)`, `eudaimonia (flourishing)` to the mandatory-gloss list. The current Architecture row of Revision 3 already lists `prohairesis (moral choice / ruling faculty)`, `kathekon (appropriate action)`, `katorthoma (perfect action)`, `oikeiosis (appropriation)`, `eudaimonia (flourishing)` — but the Row-1 evidence shows the LLM treats `axia` as un-listed (it is not in the original term list) and the architecture terms it does list as optional. Amendment 2 (a) explicitly adds `axia` to the term list; (b) adds an explicit "Every Greek or technical term in the term list MUST be glossed on first occurrence per response — including the Architecture-row terms" clarification; (c) updates the harness Phase 5 §3 assertion (if it has a per-term check) to include `axia`.

**Q1 amendment — choose one of two approaches at session open:**

- **Approach (a) — vary OUTPUT-example causal stages.** Rewrite the two OUTPUT examples in §3 to use distinct causal stages: example 1 lodges at `synkatathesis`; example 2 lodges at `horme`; the practitioner-facing intercept-stage references in the prose are explicit about being upstream of the lodged stage where applicable. This reduces the LLM's tendency to pattern-match the OUTPUT examples' Greek terms (the M1-CP5c open Q1 finding).
- **Approach (b) — explicit instruction.** Add a sentence to the COMPOSITION CONTRACT section: "Use the causal stage named in the assessment (`passion_diagnosis.causal_stage_lodged` or equivalent), not the stages shown in the OUTPUT examples. The OUTPUT examples illustrate the prose shape, not the causal-stage selection." Less invasive than (a); preserves the existing examples.

The founder chooses (a) or (b) at session open. Recommended default: **(b)** — minimum change, addresses the over-imitation directly, preserves the M1-CP5c-tested OUTPUT examples. (a) is more thorough but introduces a second prose pattern that hasn't been spot-checked yet.

### Step 2 — Implement in `/website/src/lib/translation-sandwich/layer3-prose.ts`

Update the `LAYER3_SYSTEM_PROMPT_API_REASON` constant:

- **CONTROLLED VOCABULARY (R8a) section.** Add `axia` to the term list. Strengthen the gloss-discipline language to: "Every Greek or technical term named in the assessment OR in this controlled-vocabulary list MUST be glossed in parentheses on its FIRST occurrence per response — across `philosophical_reflection`, `improvement_guidance`, `summary`, `soft_clarification_prose`, `open_deferrals_prose`. The discipline applies to all categories: Causal-chain stages; Passions and sub-species; Eupatheiai; Virtues; Architecture (`prohairesis`, `kathekon`, `katorthoma`, `oikeiosis`, `eudaimonia`, `axia`); Affect descriptors."
- **If founder chose Approach (a)**: rewrite both OUTPUT examples to vary causal stages. Example 1 retains the synkatathesis-lodged shape; example 2 (the EUPATHEIA_BOUNDARY worked example) is amended to lodge at horme instead. The intercept-stage references update accordingly.
- **If founder chose Approach (b)**: add the explicit instruction to the COMPOSITION CONTRACT section, immediately after the "The practitioner is the agent who submitted the input. Address them in second person..." paragraph.

Fallback prose helpers (`fallbackPhilosophicalReflection`, `fallbackImprovementGuidance`, `fallbackValueErrorSentence`) are reviewed for `axia` glossing — if any helper uses the term un-glossed, update.

### Step 3 — Update harness `/website/scripts/verify-translation-sandwich.ts`

If Phase 5 §3 (CONTROLLED VOCABULARY / R8c per-response glossing assertion) has a per-term check, add `axia` and the four architecture terms to the mandatory-gloss list. If the assertion is generic (uses the prompt's CONTROLLED VOCABULARY list at runtime), no harness change is needed.

If founder chose Approach (b), no additional harness assertion is needed — the existing per-term gloss check covers the new term and the COMPOSITION CONTRACT instruction is unverifiable in the harness.

If founder chose Approach (a), the harness's cross-fixture coverage assertion 7 may need rewording to require BOTH causal stages to appear across the fixture set (currently it requires single-snapshot disclaimer + closing-line discipline + heuristic).

### Step 4 — Founder runs the harness locally

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: `SUMMARY: 282 / 283 checks passed` (or higher if F4 Sonnet variance does not recur — Q2 is M1-CP5e scope, so F4 may still throw and produce 281/283; production-safe via the catch path → `generateFallbackProse`). Cost: ~$0.28–$0.70 (L1 REPLAY; L3 regenerated against live Sonnet).

If the harness fails on a non-F4 fixture (i.e., the new prompt template breaks something the M1-CP5c-tested template handled), the in-session amendment pattern from M1-CP5c applies: strengthen the prompt language and re-run. Track recurrence in Q4 / Q7 of the predecessor decision-log entry.

### Step 5 — Optional founder spot-check

Click 1–2 fixtures on `/admin/test-reason` at standard depth. Cost: ~$0.06. Purpose: verify on production parallel-run rows (rather than harness fixtures) that the Revision 3 term-list refinement holds — every architecture term in the prose is glossed on first appearance. Evidence: the prose's `philosophical_reflection` + `improvement_guidance` for the new rows.

This step is OPTIONAL. The harness Phase 5 assertion is the load-bearing check. The spot-check adds parallel-run-row evidence; founder calls.

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5d-LAYER3-AMENDMENT-2-YYYY-MM-DD`. Cross-references: `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07`, `D-M1-CP5c-LAYER3-MODULE-AMENDED-2026-05-07`, `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07`.

Entry MUST capture: the Revision 3 term-list addition (axia + clarification language); the Q1 amendment approach chosen ((a) or (b)) with reasoning; the harness pass figure; any in-session prompt-strengthening (track Q4 recurrence count); whether the optional spot-check was run + its findings; the next session named (M1-CP5e); rules served + risk classification.

### Step 7 — Session close (lean form) + draft M1-CP5e next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt is at `/operations/handoffs/founder/YYYY-MM-DD-M1-CP5e-NEXT-SESSION-PROMPT.md`. M1-CP5e scope: Q2 (extractJSON / "no markdown" hardening) + Q6 (upstream-causal-chain soft-warn refinement). Standard tier (no production module change beyond the harness; the prompt's "no markdown" instruction is already present, M1-CP5e strengthens it).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-007 §3 + Amendment 2026-05-07 read | 15–20 min |
| Step 1 — draft Amendment 2 (in-place to ADR-007) | 20–30 min |
| Step 2 — implement module changes | 30–45 min |
| Step 3 — update harness if needed | 10–20 min |
| Step 4 — harness re-run (founder, ~$0.30–$0.70) | 10–15 min |
| Step 5 — optional spot-check (founder, ~$0.06) | 10–15 min |
| Step 6 — decision-log entry (lean form) | 15–20 min |
| Step 7 — session close (lean form) + M1-CP5e next-session prompt | 25–35 min |
| **Total** | **~2–3 hours** |

Approach (b) at Step 2 lands closer to the lower bound; Approach (a) closer to the upper.

## Rollback path

`git revert` of the M1-CP5d module + harness commit reverts the Layer 3 module to its M1-CP5c-post state. Production effect: none — the user-facing path is bundled-depth before and after the change. The ADR-007 Amendment 2 reverts as part of the same revert. No DB DML this session; no env-flag change; no schema change.

## Forecast

After M1-CP5d: M1-CP5e (Q2 + Q6, Standard, ~1.5–2 hours). Then return-to-M1-CP5-prime (rubric refresh #2, Standard, ~1.5–2 hours). Then M1-CP6 cutover (Critical, ~3–4 hours; full Critical Change Protocol; R10 announcement scope; Layer 1 cache cost-aware accounting refresh).

Total path from this session to M1-CP6: ~6.5–10 hours session time across 3 sub-sessions.

This is the first of two precautionary refinement sessions before cutover. The Branch B election was the founder's call to ship a prose-template that addresses the surfaced items rather than ship-then-refine; this session lands the first half of those items.

End of prompt.
