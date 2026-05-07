# Next-Session Prompt — Sub-session return-to-M1-CP5-prime: Rubric refresh #2 against post-M1-CP5e parallel-run sample
**Stream:** founder.
**Tier:** governance (read-only analysis-primary).
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-M1-CP5e-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-2026-05-07` (M1-CP5e — Q2 truncation defense + Q6 STAGE DISCIPLINE); `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` (M1-CP5d — Refinement to Revision 3 + Revision 8); `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07` (predecessor return-to-M1-CP5 — Branch B election; the verdict pattern this session repeats).
**Risk classification:** Standard under 0d-ii. Read-only analysis against existing data; no production code touched at session. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged.
## Why this session matters
This is the second cutover-readiness verdict for the M1 arc. The first return-to-M1-CP5 (rubric refresh #1) elected Branch B (precautionary refinement) on the basis of two surfaced items: Revision 3 axia-gloss soft miss + Q1 OUTPUT-example over-imitation soft-warns. M1-CP5d landed the Revision 3 term-list refinement + Revision 8 third OUTPUT example (horme-lodged orge with COMPOSITION CONTRACT extension). M1-CP5e landed Q2 truncation defense (max_tokens 2000→3000 + stop_reason check + OUTPUT instruction tightened) + Q6 STAGE DISCIPLINE rule. This session refreshes the rubric against fresh post-M1-CP5e parallel-run rows and produces the cumulative prose-quality verdict against all surfaced refinements: M1-CP5b Revisions 1–7 + M1-CP5d Refinement-to-Revision-3 + Revision 8 + M1-CP5e Q2 (three changes) + Q6 STAGE DISCIPLINE. If the verdict is "ship", M1-CP6 cutover follows. If "revise", another sub-session lands the surfaced items and a third return-to-M1-CP5-prime-prime would follow.
## Pre-conditions
1. M1-CP5e commit + push completed (the twelve files: ADR-007 Amendment 3; layer3-prose.ts; F1–F8 layer3 caches; decision-log entry; close; this prompt). Vercel green; production behaviour unchanged.
2. Sufficient parallel-run sample. Founder may add 4–6 fresh rows between sessions by clicking `/admin/test-reason` fixtures (each click ~$0.03; cap ~$0.20). Recommended fixtures: F1 + F3 + F4 (single-snapshot with temporal hooks — exercise Revision 5 + STAGE DISCIPLINE); F2 (multi-passion; exercise Revision 7 proportion); F5 (eupatheia + AC-14; exercise Revision 5 + Revision 6); plus 1–2 organic submissions if available.
3. ADR-004 §6.4 (six-dimension rubric) read at session open.
4. ADR-007 §3 + cumulative Amendments (Amendment + Amendment 2 + Amendment 3) read at session open. The cumulative spec is the prose-quality target.
5. **Schema-vs-prompt drift carry-forward applies.** Before issuing any SQL or column-reference, AI verifies column / JSONB-path references against `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` + `/website/src/lib/translation-sandwich/parallel-run.ts`. The drift error caught at return-to-M1-CP5 must not recur.
6. Founder-attended browser session for SQL queries against `supabase-us`. Browser session needed; admin UI not required.
7. No env-flag changes anticipated.
8. No Supabase schema changes anticipated.
## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, Standard risk class, status vocabulary, signals, lean-form templates).
2. `/operations/handoffs/founder/2026-05-07-M1-CP5e-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last three entries `D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-2026-05-07`, `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07`, `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07` — read in full, especially the Open Questions sections.
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §6.4 (the six-dimension rubric).
5. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` Amendment + Amendment 2 + Amendment 3 (the cumulative spec).
Confirm at session open per cache + governance protocol:
- **Tier:** `governance` — Standard risk under 0d-ii. AC4/AC5/AC7/PR6 NOT engaged.
- **Hold-point:** P0 0h active.
- **Model selection:** Sonnet (`MODEL_DEEP`) for Layer 3 — unchanged. Per cache Element 6.
- **Status vocabulary:** Layer 3 module currently *Verified (amended at M1-CP5e)*. After return-to-M1-CP5-prime: depends on verdict — *Verified (cutover-ready)* if Branch A; *Verified (amended again — pending follow-on session)* if Branch B; *Verified (rolled back)* if Branch C. ADR-007 currently *Adopted (amended thrice — Amendments 2026-05-07 from M1-CP5b + M1-CP5d + M1-CP5e)*.
- **Engaged rules:** R0, R5, R8a, R8c, R7, AC1, AC8, KG1, KG7, PR1, PR5. NOT engaged: AC4, AC5, AC7, PR3, PR4, PR6, PR8 (PR8 candidates remain held).
## Part B — Procedure
### Step 1 — Run the six-dimension rubric against post-M1-CP5e rows
Run the six rubric queries from ADR-004 §6.4 against `translation_sandwich_comparisons` filtered on `tier1_aware = true AND created_at > '2026-05-07 [M1-CP5e timestamp]'::timestamptz`. The six dimensions: L1 latency; L3 latency; sandwich/bundled total latency ratio; cost per request; cost cap exceedances; proximity match. Compare against M1-CP5 first-pass and return-to-M1-CP5 figures; note any directional change. Cumulative cost should remain under R5 baseline ($0.05/req).

The schema-vs-prompt drift carry-forward applies: AI verifies column / JSONB-path references against `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` BEFORE issuing the queries. Reference-fields are top-level integer columns (`layer1_latency_ms`, `layer2_latency_ms`, `layer3_latency_ms`, `bundled_depth_latency_ms`) and microcent columns (`layer1_cost_usd_microcents`, `layer3_cost_usd_microcents`, `bundled_depth_cost_usd_microcents`); JSONB output columns (`bundled_depth_output`, `translation_sandwich_output`).

### Step 2 — Per-row prose spot-check against the cumulative seven Revisions + refinements
For each post-M1-CP5e row, run the per-row spot-check matrix:
- **Revision 1** (closing-line action) — every closing line is concrete practice / actionable orientation, not a disclaimer.
- **Revision 2 + 7** (voice as guidance + proportional balance) — improvement_guidance ≥ philosophical_reflection by sentence count.
- **Refined Revision 3** (Greek-to-English glossing on every controlled-vocabulary-list term) — all Greek + architecture-row terms glossed once on first appearance per response. **Special attention:** axia (worth/value) when present.
- **Revision 4** (false-judgement framing) — virtue/vice carry moral weight as feature of framework; not predicated of practitioner's character.
- **Revision 5** (marginal-case mid-prose + input-condition heuristic) — single-snapshot disclaimer fires only when temporal hooks present; mid-prose placement; no closing-line disclaimers.
- **Revision 6** (preferred-indifferent observations) — value errors surface as structural observations from `value_assessment.identified_value_errors` when present.
- **Revision 8** (causal-stage variation) — prose uses the stage named in `passion_diagnosis.passions_detected[].causal_stage_affected`, not the stage shown in any OUTPUT example.
- **Q6 STAGE DISCIPLINE** (new this session's verification) — prose names the lodged stage; upstream stages permitted only when assessment names them as part of the corrective sequence.

### Step 3 — Q2 verification (truncation defense)
Verify the Q2 fixes are dormant in the parallel-run sample (i.e., no truncation has occurred):
- Check that no row in the post-M1-CP5e sample has `translation_sandwich_output` null due to a Layer 3 throw at the truncation check.
- The harness at M1-CP5e showed the new max_tokens=3000 cap absorbed the longer prompt cleanly; this session confirms the same on real `/api/reason` traffic.

### Step 4 — Open question track-rate
Review track-rate on the open questions carried from M1-CP5e:
- **Q1 carry-forward (OUTPUT-example over-imitation soft-warns).** F1.P5 + F4.P5 surfaced the soft-warn for `praxis` named in prose at M1-CP5e harness run. The new STAGE DISCIPLINE rule may permit this pattern (downstream-stage-to-prevent). Track at this session: do real parallel-run rows surface the same pattern? If yes, is the assertion's predicate the right thing or does it need refinement? If no, the M1-CP5e refinement closed the issue.
- **Schema-vs-prompt drift** — confirm no recurrence at this session.
- **PR8 candidates** — neither candidate is engaged at this session (no ADR amendment; no in-session prompt strengthening unless surfaced by harness).

### Step 5 — Founder verdict (Branch A / B / C)
After Steps 1–4, the founder produces the cutover-readiness verdict:
- **Branch A — cutover.** Advance to M1-CP6 cutover (Critical tier; ~3–4 hours; full Critical Change Protocol; R10 announcement; Layer 1 cache cost-aware accounting refresh). The prose-quality bar is met across the cumulative refinements; no surfaced items block.
- **Branch B — revise again.** Surface specific items requiring further refinement; scope a follow-on sub-session (M1-CP5f or similar). Return-to-M1-CP5-prime-prime would follow.
- **Branch C — rollback.** Revert parallel-run wiring; revisit ADR-003 / ADR-004. Most invasive option; only if rubric reveals architectural regression.

The verdict is the founder's call. AI surfaces evidence honestly, including findings the founder might not want to hear. AI does not advocate for any branch.

### Step 6 — Append decision-log entry (lean form)
Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-RETURN-TO-M1-CP5-PRIME-RUBRIC-REFRESH-2026-05-07` (or follow-on date).

Entry MUST capture: the six-dimension rubric figures vs M1-CP5 first-pass + return-to-M1-CP5 figures; the per-row prose spot-check verdicts (n/total per Revision); Q2 truncation-defense observation pattern (any throws? any close calls visible in observed output_tokens vs cap?); Q6 STAGE DISCIPLINE observation pattern (does the rule hold across the sample?); the open questions track-rate; the founder's branch verdict; rules served + risk classification; the next session named (M1-CP6 cutover OR follow-on revise session OR rollback); cross-references to all predecessor entries.

### Step 7 — Session close (lean form) + draft next-session prompt for the elected branch
Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt path depends on the verdict: if Branch A, draft `/operations/handoffs/founder/YYYY-MM-DD-M1-CP6-NEXT-SESSION-PROMPT.md` (Critical tier; full Critical Change Protocol contents per cache "Critical-risk sessions" section); if Branch B, draft a lean prompt for the follow-on sub-session; if Branch C, draft a rollback session prompt.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + decision-log + ADR-007 cumulative read | 15–20 min |
| Step 1 — six-dimension rubric (founder runs SQL queries) | 25–35 min |
| Step 2 — per-row prose spot-check (founder reads rows; AI helps interpret) | 30–45 min |
| Step 3 — Q2 truncation-defense verification | 10–15 min |
| Step 4 — open question track-rate | 10–15 min |
| Step 5 — founder verdict (Branch A/B/C) | 10–20 min (depends on whether discussion needed) |
| Step 6 — decision-log entry (lean form) | 15–20 min |
| Step 7 — session close (lean form) + next-session prompt for elected branch | 20–30 min |
| **Total** | **~2–3 hours** |

Branch A's next-session prompt drafting (Critical tier full Critical Change Protocol contents) is at the upper end. Branch B/C drafts are leaner.

## Rollback path
This session is read-only against existing data; no `git revert` needed at session close. Founder's branch decision is the rollback gesture relative to alternative branches. The 4–6 seed rows added between sessions are additive (not reversible except by DELETE; not advised).

## Forecast
After return-to-M1-CP5-prime: depends on verdict.
- **Branch A → M1-CP6 cutover (Critical, ~3–4 hours).** Then Phase 7 (Sage Ops activation post-launch).
- **Branch B → follow-on revise session (Standard or Elevated, ~1–2 hours).** Then return-to-M1-CP5-prime-prime.
- **Branch C → rollback session.** Significant invasive work; reverts parallel-run wiring; revisits ADR-003 / ADR-004.

The pattern across return-to-M1-CP5 → return-to-M1-CP5-prime is testing-then-deciding: the cumulative refinements (M1-CP5b + M1-CP5c + M1-CP5d + M1-CP5e) need ground truth from real parallel-run traffic before cutover. Two iterations of revise is the upper end of what the founder elected at M1-CP5 first-pass; a third revise iteration would warrant the founder reviewing whether the prose-template approach is converging or whether deeper architectural change is needed (Branch C territory).

End of prompt.
