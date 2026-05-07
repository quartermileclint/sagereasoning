# Next-Session Prompt — Sub-session return-to-M1-CP5-prime-prime: rubric refresh #3 against post-M1-CP5f parallel-run sample
**Stream:** founder.
**Tier:** governance.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-M1-CP5f-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5f-LAYER3-AMENDMENT-4-2026-05-07` (the M1-CP5f scope this session refreshes against — D1 Option (b) Example 4 + D2 in MANDATORY removal + CRITICAL clauses); `D-RETURN-TO-M1-CP5-PRIME-RUBRIC-REFRESH-2026-05-07` (RTM1-CP5-prime's verdict + the Branch B election that scoped M1-CP5f); `D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-2026-05-07` (Q2 truncation + Q6 STAGE DISCIPLINE — both held at RTM1-CP5-prime; expected to continue holding); `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` (Refinement to Revision 3 + Revision 8); `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (the seven Revisions adopted — Revision 5 in particular is what M1-CP5f cleaned).
**Risk classification:** Standard under 0d-ii. Read-only analysis against existing data; no production code touched; no schema change; no env-flag change. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged.

## Why this session matters

This is the third rubric-refresh iteration in the M1 arc and the cutover-readiness verdict for M1-CP5f's amendments. The pattern across return-to-M1-CP5 → return-to-M1-CP5-prime → return-to-M1-CP5-prime-prime is testing-then-deciding: each cycle has resolved its named issues and surfaced a smaller, more specific next issue. R3 axia (M1-CP5d) → resolved at RTM1-CP5-prime. Q1 stage over-imitation (M1-CP5d) → resolved at RTM1-CP5-prime. Q6 STAGE DISCIPLINE (M1-CP5e) → held at RTM1-CP5-prime. Q2 truncation defense (M1-CP5e) → working at RTM1-CP5-prime. R5 prompt tension + over-imitation pattern shift (M1-CP5f) → verdict at this session.

The convergence question becomes load-bearing here. If RTM1-CP5-prime-prime returns clean (no new R5 issues; no other surface emerging at the same pattern depth), Branch A (cutover) is the natural verdict; **M1-CP6 follows as Critical-tier with full Critical Change Protocol + R10 announcement**. If RTM1-CP5-prime-prime surfaces a new prose-quality issue at the same pattern depth (small surface, specific scope), founder reviews whether the prose-template approach is converging or whether deeper architectural change is needed (Branch C territory — revisit ADR-003 / ADR-004). Three iterations of revise from M1-CP5 first-pass with small residuals each cycle is convergence; three iterations with the same shape of residual each cycle is not.

The new question this session tests (Q8 from the M1-CP5f close): does the M1-CP5f CRITICAL clause addition (assessment-side condition named explicitly as a hard gate in the module bullets) produce the intended effect (omission misses prevented for the n=5 hard miss case) without producing the side-effect (over-omission on borderline cases where the LLM should have fired)? The fresh post-M1-CP5f sample answers this directly.

## Pre-conditions

1. M1-CP5f commit + push completed (the six files: ADR + module + harness-cache + decision-log + close + this prompt). Vercel green; production behaviour unchanged.
2. **Founder seeds 4–6 fresh post-M1-CP5f rows via `/admin/test-reason` between sessions.** Per the realistic per-click cost from the page comment, ~$0.36–0.78 total. Variety target: at least one row with iterative input + stable trajectory (tests Example 4's omission discipline directly — the n=5 hard miss case from RTM1-CP5-prime); at least one row with single-snapshot input + temporal hook (tests Example 1's firing discipline); at least one row with eupatheia-shape input (tests Example 2's AC-14 path); at least one row with horme-lodged passion (tests Example 3's omission for non-stable trajectory). The rows must be `tier1_aware = true` to land in `translation_sandwich_comparisons` properly.
3. ADR-007 §3 + cumulative Amendment + Amendment 2 + Amendment 3 + **Amendment 4** read at session-open. The cumulative spec is the surface this session refreshes against. Particular attention to Example 4 (Pattern A — iterative phobos at synkatathesis) and the CRITICAL clauses in the module bullets.
4. **Schema-vs-prompt drift carry-forward applies (strengthened — includes time references).** Before issuing any SQL or column-reference or time-reference, AI verifies column / JSONB-path / time references against `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` + `/website/src/lib/translation-sandwich/parallel-run.ts` + the Supabase clock (verify the clock with `SELECT now()` in SQL Editor before issuing time-bounded queries).
5. **PR8 candidate decision at session-open (if any ADR amendment is needed at this session):** in-place ADR amendment pattern is at seventh recurrence; if RTM1-CP5-prime-prime surfaces a fix that requires another in-place amendment, that would be the eighth. Founder elects between **hold** vs **promote to PR8** at the session where the next ADR amendment lands (this session is read-only by default; PR8 promotion only engages if the verdict triggers a Branch B revise-again).
6. Founder available for the **verdict decision at session-open**: Branch A (cutover — M1-CP6 follows as Critical-tier next) vs Branch B (revise-again — surface new scope) vs Branch C (architectural revisit — revisit ADR-003 / ADR-004).
7. No env-flag changes anticipated.
8. No Supabase schema changes anticipated.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `governance`, Standard risk class, status vocabulary, signals, lean-form templates).
2. `/operations/handoffs/founder/2026-05-07-M1-CP5f-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry `D-M1-CP5f-LAYER3-AMENDMENT-4-2026-05-07` — read in full, especially the Files touched + Open questions sections.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` Amendment 4 (the surface this session refreshes against). Cross-reference to Amendment + Amendment 2 + Amendment 3 + §3 (the cumulative spec).
5. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §6.4 (rubric contract — six dimensions + thresholds) + §10 (checkpoint table — RTM1-CP5-prime-prime is checkpoint 7).

Confirm at session open per cache + governance protocol:
- **Tier:** `governance` — Standard risk under 0d-ii. AC4/AC5/AC7/PR6 NOT engaged.
- **Hold-point:** P0 0h active.
- **Model selection:** Sonnet retained (Layer 3 unchanged); cited not exercised at this read-only session.
- **Status vocabulary:** Layer 3 module currently *Verified (amended at M1-CP5f) — cutover-readiness verdict pending this session*. After this session: *Verified (amended at M1-CP5f; rubric refresh #3 verdict X/Y) — Branch A/B/C verdict per founder*. ADR-007 unchanged at this session unless a Branch B fix requires a new amendment.
- **Engaged rules:** R0, R5, R7, R8a, R8c, AC1, AC8, KG1, KG7, PR1, PR5. NOT engaged: AC4, AC5, AC7, PR3, PR4, PR6.

## Part B — Procedure

### Step 1 — Confirm seed data + verify Supabase clock

AI runs (in SQL Editor): `SELECT now();` to confirm Supabase clock + cite the actual time in any subsequent time-bounded query (per the strengthened schema-vs-prompt drift carry-forward — time references must be verified, not assumed).

AI then runs the seed-confirmation query:
```sql
SELECT
  COUNT(*) AS post_m1_cp5f_rows,
  MIN(inserted_at) AS earliest,
  MAX(inserted_at) AS latest
FROM translation_sandwich_comparisons
WHERE inserted_at > '<actual-Supabase-clock-time minus 30 minutes>'::timestamptz
  AND tier1_aware = true;
```

Expected: 4–6 rows seeded by founder between sessions. If fewer than 4, founder seeds additional rows (~$0.18–0.39 per click) before proceeding.

### Step 2 — Six-dimension rubric refresh

Per ADR-004 §6.4 + §10. AI runs the rubric SQL queries (Q1 + Q2) against the post-M1-CP5f rows. Six dimensions:
1. L1 latency avg (median + p95) — comparable to RTM1-CP5-prime's 13,032 ms target; flag at 25,000 ms.
2. L3 latency avg (median + p95) — modest rise expected (M1-CP5f added ~50 lines to the prompt); flag at 25,000 ms.
3. Sandwich vs bundled — sandwich differentiating expected to hold (~50% bundled).
4. Cost per request — under R5 baseline ($0.05/req).
5. Cost cap exceedances — 0 over $0.05; 0 over $0.10 (safe posture).
6. Tier 1 fire distribution — preserved per RTM1-CP5-prime; F8 SCOPE_AMBIGUITY non-fire watched.
7. Proximity match — sandwich differentiating, bundled mode-collapsing (architectural pattern preserved per all prior cycles).

AI captures the rubric data in a table mirroring the predecessor session's format.

### Step 3 — Per-row prose spot-check

For each post-M1-CP5f non-Tier-1 row, AI runs the prose spot-check queries (QA + QB) and walks through the prose against the cumulative seven Revisions + Refinement to Revision 3 + Revision 8 + Q6 STAGE DISCIPLINE rule + Q2 truncation defense + **M1-CP5f's D1 + D2** (the new surfaces).

Particular attention to:
- **Revision 5 firing/omission discipline.** For each row: does the prose include single_snapshot disclaimer? Should it (per the heuristic: input has temporal hook AND assessment.direction_of_travel === "single_snapshot")? Does the prose include is_kathekon: null disclaimer? Should it? Does the prose include improvement_path-null disclaimer? Should it? **The n=5 case (direction_of_travel = stable + iterative input) is the load-bearing test.** If any row in the sample has this shape, verify the disclaimer is OMITTED.
- **Q8 — CRITICAL clause effect.** Does the LLM treat the assessment-side condition as a hard gate (firing only when both conditions met)? Does it over-omit on borderline cases where the LLM should have fired (e.g., the n=4 RTM1-CP5-prime soft miss case — input lacks temporal hook but direction_of_travel === "single_snapshot")? The CRITICAL clauses should not affect the firing-when-both-conditions-met case; they only sharpen the not-firing-when-assessment-side-mismatch case.
- **Example 4 over-imitation check.** Does the LLM pattern-default to omission now (the new failure mode)? With four examples (two firing, two omitting), the pattern-default should be balanced. But pattern-shift could go either way.

AI captures the per-Revision verdict in a table mirroring the predecessor session's format. Hard-fail count + soft-warn count + clean-row count.

### Step 4 — Q2 truncation-defense observation (carry-forward)

AI runs the Q2 truncation-defense query against the post-M1-CP5f rows. Expected: 0 throws; max L3 cost ≤ ~$0.025 (slight increase from RTM1-CP5-prime's $0.019 due to ~50-line prompt growth — well below the 3000-token cap). If any row's L3 cost approaches 75% of the cap, surface as warning (the next prompt growth would need to either trim or raise the cap).

### Step 5 — Founder verdict decision

AI surfaces the verdict shape based on Steps 2 + 3 + 4:

- **Branch A (cutover) — recommended if:** rubric clean + per-row prose ≥ 38/40 (matching or improving on RTM1-CP5-prime) + Q2 truncation defense holding + no new pattern-depth issue surfaced. Convergence achieved.
- **Branch B (revise-again) — recommended if:** rubric clean + 1–2 specific issues surfaced at the same pattern depth (small surface, specific scope, addressable in M1-CP5g). The pattern is still converging; one more iteration is appropriate. Founder elects scope.
- **Branch C (architectural revisit) — recommended if:** rubric clean + 3+ issues surfaced OR same shape of issue recurring across iterations. Convergence is not happening; deeper change to ADR-003 / ADR-004 is the right move.

Founder elects. AI captures the election + reasoning in the decision-log entry.

### Step 6 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-RETURN-TO-M1-CP5-PRIME-PRIME-RUBRIC-REFRESH-2026-05-07` (or follow-on date if session straddles).

Entry MUST capture: the rubric data; the per-Revision verdict; the Q2 observation; the Q8 (CRITICAL clauses) verdict; the founder's Branch A/B/C verdict + reasoning; the eight open questions track-rate (which closed, which carried, which newly emerged); rules served + risk classification; cross-references.

### Step 7 — Session close (lean form) + draft next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". Next-session is one of:
- **If Branch A elected:** the next-session prompt is for **M1-CP6 cutover** at `/operations/handoffs/founder/2026-05-08-M1-CP6-NEXT-SESSION-PROMPT.md` (or follow-on date). Critical tier; full Critical Change Protocol; R10 announcement; deployment-configuration change (env flag activation).
- **If Branch B elected:** the next-session prompt is for **M1-CP5g** at `/operations/handoffs/founder/2026-05-08-M1-CP5g-NEXT-SESSION-PROMPT.md` (or follow-on date). Tier per the scope's risk class (likely Standard or Elevated).
- **If Branch C elected:** the next-session prompt is for **architectural-revisit-discovery** (revisit ADR-003 / ADR-004 boundaries). Scoping work; Standard tier.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + decision-log + ADR-007 cumulative read | 15–20 min |
| Step 1 — Seed confirmation + clock verify | 5–10 min |
| Step 2 — Rubric refresh queries | 15–20 min |
| Step 3 — Per-row prose spot-check | 30–45 min |
| Step 4 — Q2 truncation observation | 5–10 min |
| Step 5 — Founder verdict decision | 10–20 min |
| Step 6 — Decision-log entry (lean form) | 15–20 min |
| Step 7 — Session close (lean form) + next-session prompt | 20–30 min |
| **Total** | **~1.5–2.5 hours** |

If founder elects Branch B (revise-again at M1-CP5g), add ~10–15 min for scope-decision drafting. If founder elects Branch C, add ~20–30 min for architectural-revisit scoping notes.

## Rollback path

Read-only against existing data; no `git revert` needed. Founder's Branch A election is itself the cutover commit (made at M1-CP6, the next session); founder's Branch B election defers cutover to M1-CP5g + RTM1-CP5-prime-prime-prime. Founder's Branch C election defers cutover indefinitely pending architectural revisit.

## Forecast

**If Branch A elected:** M1-CP6 follows as Critical-tier (full Critical Change Protocol; R10 announcement; deployment-configuration change activating the new prose path for the user-facing route). Estimated 3–4 hours. After M1-CP6: Layer 3 module is *Live*; M1 arc completes; M2 (next consumer — likely `/api/journal/...` or `/api/mentor/...`) becomes the next major arc.

**If Branch B elected:** M1-CP5g lands the surfaced fix; RTM1-CP5-prime-prime-prime tests it; cumulative cycles continue. The convergence question sharpens — three Branch-B iterations with the same shape of residual would warrant Branch C consideration.

**If Branch C elected:** the M1 arc pauses while the architectural revisit happens. ADR-003 (the bundled→sandwich design) and/or ADR-004 (the translation-sandwich pilot) get revisited. New scope emerges. M1-CP6 cutover deferred indefinitely.

The pattern across return-to-M1-CP5 → return-to-M1-CP5-prime → return-to-M1-CP5-prime-prime has been productive: each cycle resolved its named issues and surfaced a smaller, more specific next issue. The cumulative trajectory points toward Branch A. The founder's verdict at this session is the load-bearing decision.

End of prompt.
