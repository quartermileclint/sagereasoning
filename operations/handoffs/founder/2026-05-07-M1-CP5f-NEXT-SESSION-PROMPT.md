# Next-Session Prompt — Sub-session M1-CP5f: Revision 5 prompt-tension fix + OUTPUT-example over-imitation pattern-shift fix

**Stream:** founder.
**Tier:** code-elevated.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-return-to-M1-CP5-prime-close.md`.
**Predecessor decision-log entries:** `D-RETURN-TO-M1-CP5-PRIME-RUBRIC-REFRESH-2026-05-07` (the verdict + Branch B election that scoped this session); `D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-2026-05-07` (M1-CP5e — Q2 truncation defense + Q6 STAGE DISCIPLINE rule); `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` (M1-CP5d — Refinement to Revision 3 + Revision 8); `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (the seven Revisions adopted at M1-CP5b; Revision 5's input-condition heuristic is the half this session preserves).
**Risk classification:** Elevated under 0d-ii. Existing user-facing functionality changes — Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth (per ADR-004 §6.3) so the change is dormant in production until M1-CP6 cutover, but the module that will become user-facing at M1-CP6 is the one being changed. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged.

## Why this session matters

This is the third revise iteration in the M1 arc and the last one before M1-CP6 cutover under the founder's current sequencing. The two surfaced items at return-to-M1-CP5-prime are both on Revision 5 (single-snapshot disclaimer): a soft miss at n=4 (input-condition heuristic violated — input lacked iterative temporal hook but disclaimer fired anyway) and a hard miss at n=5 (disclaimer fired on `direction_of_travel = stable` — a COMPOSITION CONTRACT violation, prose contradicting assessment). The most likely root cause is structural: ADR-007 §3 PROSE FIELDS bullet retains M1-CP3's MANDATORY framing alongside Revision 5's input-condition heuristic; the two co-exist in the prompt and the LLM defaults to the older MANDATORY pattern. Compounding this, two of three OUTPUT examples carry the disclaimer (Examples 1 + 2; Example 3 demonstrates omission per M1-CP5d), pattern-defaulting the LLM toward firing the disclaimer. This is the same shape as the Q1 OUTPUT-example over-imitation issue from M1-CP5d, migrated from causal-stage selection to marginal-case sentence firing.

This session lands two complementary fixes per founder direction at return-to-M1-CP5-prime: **D1 Option (b)** — additive fourth OUTPUT example demonstrating `direction_of_travel = stable` + no marginal-case sentences firing (so the LLM sees variation across four examples rather than two-of-three firing the disclaimer); **D2 in** — defensive removal of M1-CP3's MANDATORY framing from §3 PROSE FIELDS bullets for all three marginal fields (`single_snapshot`, `is_kathekon: null`, `improvement_path_structured: null`), preserving Revision 5's input-condition heuristic which already covers all three.

If the verdict at return-to-M1-CP5-prime-prime (rubric refresh #3) supports cutover, M1-CP6 follows. If a third revise iteration would be needed, founder reviews whether the prose-template approach is converging or whether deeper architectural change is needed (Branch C territory — explicitly raised as the convergence-question moment per the predecessor return-to-M1-CP5-prime-prime forecast).

## Pre-conditions

1. Return-to-M1-CP5-prime commit + push completed (the three governance files: decision-log entry + close + this prompt). Vercel green; production behaviour unchanged.
2. ADR-004 §6.4 + ADR-007 §3 + cumulative Amendment + Amendment 2 + Amendment 3 read at session open. The cumulative spec is the surface this session amends.
3. **Schema-vs-prompt drift carry-forward applies (strengthened — now includes time references).** Before issuing any SQL or column-reference or time-reference, AI verifies column / JSONB-path / time references against `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` + `/website/src/lib/translation-sandwich/parallel-run.ts` + the Supabase clock. The recurrence at return-to-M1-CP5-prime (future-dated time cutoff) must not recur.
4. Founder available for the **fourth-OUTPUT-example fixture-pattern decision at session-open**. The example needs an assessment with `direction_of_travel = stable` AND non-null `kathekon_assessment.is_kathekon` AND non-null `improvement_path_structured` AND empty `intake_clarifications.open_deferrals` so none of the three marginal-case sentences fire (proves the defensive scope). AI surfaces 1–2 candidate fixture patterns at session-open (e.g., iterative-context input ("this keeps happening") with a phobos or epithumia case at synkatathesis with a clear improvement path); founder elects.
5. **PR8 candidate decision at session-open:** in-place ADR amendment pattern is at sixth recurrence; M1-CP5f's Amendment 4 is the seventh. Founder elects between **hold one more cycle** vs **promote to permanent process rule** (PR8 register). Pattern is now well-established across seven recurrences spanning the M1 arc.
6. Founder-attended browser session for the harness re-cache step (founder runs `LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1 npx tsx scripts/verify-translation-sandwich.ts` locally; ~$0.30–0.70 cost; ~5 minutes).
7. No env-flag changes anticipated.
8. No Supabase schema changes anticipated.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-elevated`, Elevated risk class, status vocabulary, signals, lean-form-with-Elevated-additions templates).
2. `/operations/handoffs/founder/2026-05-07-return-to-M1-CP5-prime-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry `D-RETURN-TO-M1-CP5-PRIME-RUBRIC-REFRESH-2026-05-07` — read in full, especially the per-Revision verdict table + Open Questions sections.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` §3 (the original Layer 3 system prompt with the M1-CP3 MANDATORY framing this session amends) + Amendment + Amendment 2 + Amendment 3 (the cumulative spec).
5. `/website/src/lib/translation-sandwich/layer3-prose.ts` — read the current `LAYER3_SYSTEM_PROMPT_API_REASON` constant in full so the diff at Step 3 is precise.

Confirm at session open per cache + governance protocol:

- **Tier:** `code-elevated` — Elevated risk under 0d-ii. AC4/AC5/AC7/PR6 NOT engaged.
- **Hold-point:** P0 0h active.
- **Model selection:** Sonnet (`MODEL_DEEP`) for Layer 3 — unchanged. Per cache Element 6.
- **Status vocabulary:** Layer 3 module currently *Verified (rubric refresh #2 verdict 38/40)*. After M1-CP5f: *Verified (amended at M1-CP5f) — cutover-readiness verdict pending return-to-M1-CP5-prime-prime*. ADR-007 currently *Adopted (amended thrice — Amendments 2026-05-07 from M1-CP5b + M1-CP5d + M1-CP5e)*. After M1-CP5f: *Adopted (amended four times — Amendment 4 — 2026-05-07 appended; seventh recurrence of in-place ADR amendment pattern, OR PR8 promotion if founder elects).*
- **Engaged rules:** R0, R7, R8a, R8c, AC1, AC8, KG1, KG7, PR1, PR3, PR4, PR5. Possibly PR8 (if founder promotes the in-place ADR amendment pattern). NOT engaged: AC4, AC5, AC7, PR6.

## Part B — Procedure

### Step 1 — Founder elects scope-decisions at session-open

Two decisions before any code/ADR is touched:

**(1a) Fourth-OUTPUT-example fixture pattern.** AI surfaces 1–2 candidate patterns; founder elects. The constraints (so none of the three marginal-case sentences fire, proving the defensive scope):

- `iterative_refinement.direction_of_travel === 'stable'` (NOT `single_snapshot`)
- `kathekon_assessment.is_kathekon !== null` (true or false)
- `improvement_path_structured !== null`
- `intake_clarifications.open_deferrals === []`
- `intake_clarifications.soft_clarifications === []` (clean; or non-empty if founder wants Example 4 to also exercise soft_clarification_prose — bonus discipline demonstration)

Candidate patterns AI surfaces at session-open (founder may accept one or propose a third):

- **Pattern A — iterative phobos at synkatathesis with stable trajectory.** Input shape: "I keep [iterative-context]; this has been the case for [time-window]; my reasoning has been the same each time." Assessment: `phobos` lodged at `synkatathesis`, `direction_of_travel = stable`, `is_kathekon = false` (the action driven by phobos is not appropriate), clear `improvement_path_structured` (synkatathesis correction). Demonstrates: gloss discipline (phobos, synkatathesis); R8 (stage match — synkatathesis); R5 omission (no marginal-case sentences fire because all three marginal fields are non-marginal); R6 (preferred-indifferent observation surfaces).
- **Pattern B — iterative epithumia at horme with stable trajectory.** Input shape: "I keep [iterative-acquisition-context]; the urge is the same each time." Assessment: `epithumia` lodged at `horme`, `direction_of_travel = stable`, `is_kathekon = false`, clear `improvement_path_structured` (horme interception). Demonstrates: same rules as Pattern A but on a different stage (horme vs synkatathesis), reinforcing R8 stage variation across the four examples.

The four-example progression after this session (Examples 1 + 2 + 3 + 4):
- **Example 1** (M1-CP3 original): phobos at synkatathesis, single-snapshot, is_kathekon: null — fires single_snapshot + is_kathekon-null marginal cases.
- **Example 2** (M1-CP4b): chara at no-stage (eupatheia), single-snapshot, AC-14 EUPATHEIA_BOUNDARY — fires single_snapshot + AC-14 marginal cases.
- **Example 3** (M1-CP5d): horme-lodged orge with peer value-error rendering, no marginal cases by design.
- **Example 4** (this session): per founder election from Pattern A or B above, no marginal cases by design (with stable trajectory rather than single-snapshot — demonstrates that omission is the default when the assessment is fully determined).

**(1b) PR8 promotion candidate election.** In-place ADR amendment pattern is at the sixth recurrence; M1-CP5f's Amendment 4 will be the seventh. Founder elects:

- **Hold one more cycle** — same pattern as M1-CP5b + M1-CP5d + M1-CP5e. Decision-log entry records "held this cycle; revisit next ADR-amending session."
- **Promote to PR8** — write a new process rule (PR8 in `/adopted/standing-protocol-cache.md` §"Process rules" — actually, process rules live in project instructions, but the cache references them; promotion would be a project-instruction amendment, recorded in the decision log as `D-PR8-PROMOTED-...`). The promoted rule formalises the pattern as standard practice rather than ad-hoc. AI drafts the promotion language at Step 2 if elected.

### Step 2 — Edit ADR-007 §3 PROSE FIELDS — defensive removal of MANDATORY language (D2)

Edit `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` §3 PROSE FIELDS. The three bullets to amend (currently within the philosophical_reflection / improvement_guidance section):

- `**MANDATORY** when iterative_refinement.direction_of_travel === "single_snapshot": include one explicit sentence...`
- `**MANDATORY** when kathekon_assessment.is_kathekon === null: include one explicit sentence...`
- `**MANDATORY** when improvement_path_structured: null: state "no specific improvement path identified at this time"...`

The edit: remove the `**MANDATORY**` framing language. The remaining content (the description of when the sentence applies) is already covered by Revision 5's input-condition heuristic in the Amendment section. The bullets become descriptive (shape of the sentence when it does fire) rather than prescriptive (when it MUST fire).

Append **Amendment 4 — 2026-05-07** to the ADR (in-place sibling to Amendments 2026-05-07 from M1-CP5b + M1-CP5d + M1-CP5e — seventh recurrence of in-place ADR amendment pattern OR PR8 promotion per founder election at Step 1b). The Amendment captures: the defensive scope (D2 — three marginal-field bullets cleaned of MANDATORY language); the additive scope (D1 Option b — fourth OUTPUT example specification with founder-elected fixture pattern from Step 1a); cross-references to predecessor amendments; rules engaged (R0, R7, R8a, R8c, AC1, AC8, KG1, PR1, PR3, PR4, PR5).

### Step 3 — Apply mirror module changes to layer3-prose.ts

Edit `/website/src/lib/translation-sandwich/layer3-prose.ts`:

- `LAYER3_SYSTEM_PROMPT_API_REASON` constant — three bullet edits (defensive scope D2) + new fourth OUTPUT example block (additive scope D1 Option b). Follow the existing escaping conventions for inline-code formatting (backslash-escaped backticks per the M1-CP5d/e convention; AI verifies once before writing per the M1-CP5e bug-fix lesson recorded in `D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-2026-05-07` Open Q5).
- `generateFallbackProse` helpers — confirm the fallback's marginal-case append logic is consistent with the cleaned ADR text. The fallback fires marginal-case appends based on the assessment-side conditions (`direction_of_travel === 'single_snapshot'` etc.), which is correct behaviour and unchanged. Revision 5's input-condition heuristic applies to the LLM only (the fallback cannot read input). No fallback-side change needed.
- No change to `generateProse` (Q2 truncation defense from M1-CP5e remains in place).

### Step 4 — Harness re-cache F1–F5 (and F6, F8) layer3 fixture caches

Founder runs locally:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: SUMMARY all checks pass (the harness has no per-marginal-case-language-omission assertion; the cleaned bullets affect the LLM's pattern but not any harness assertion). Cost: ~$0.30–0.70 (one harness run with regenerated Layer 3 caches).

If the harness surfaces a regression (e.g., the input-condition heuristic now over-fires omission, missing a case where the disclaimer should appear), AI diagnoses at Step 4 and the founder elects: in-session fix (PR8 in-session prompt-strengthening pattern recurrence) vs defer to return-to-M1-CP5-prime-prime.

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5f-LAYER3-AMENDMENT-4-2026-05-07` (or follow-on date if session straddles).

Entry MUST capture: the two scope decisions (D1 Option b — fourth OUTPUT example + founder-elected fixture pattern; D2 in — defensive MANDATORY-language removal); the PR8 candidate election (hold vs promote); the harness re-run verdict; the seven open questions track-rate (which closed at this session, which carried forward, which newly emerged); rules served + risk classification (Elevated); the next session named (return-to-M1-CP5-prime-prime); cross-references to all predecessor entries.

### Step 6 — Session close (lean form) + draft return-to-M1-CP5-prime-prime next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt path is `/operations/handoffs/founder/2026-05-07-return-to-M1-CP5-prime-prime-NEXT-SESSION-PROMPT.md` (or follow-on date). Risk class: Standard (analysis-primary read-only against existing data; same shape as this session). Pre-conditions mirror this session's: founder seeds 4–6 fresh post-M1-CP5f rows via `/admin/test-reason` between sessions (~$0.36–0.78 per the realistic per-click cost from the page comment); ADR + close + decision-log read at session-open.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + decision-log + ADR-007 cumulative read + module read | 20–30 min |
| Step 1 — Founder scope decisions (1a fixture pattern + 1b PR8 election) | 15–25 min |
| Step 2 — ADR-007 §3 edits + Amendment 4 drafting | 30–45 min |
| Step 3 — Module mirror changes (layer3-prose.ts) | 30–45 min |
| Step 4 — Harness re-cache (founder runs locally) | 5–10 min |
| Step 5 — Decision-log entry (lean form) | 15–20 min |
| Step 6 — Session close (lean form) + return-to-M1-CP5-prime-prime next-session prompt | 25–35 min |
| **Total** | **~2.5–3.5 hours** |

If founder elects PR8 promotion at Step 1b, add ~15–25 min for the PR8 rule drafting + project-instructions amendment + the additional decision-log entry.

## Rollback path

`git revert` of the M1-CP5f commit (ADR + module + harness-cache files) reverts the Layer 3 module to its M1-CP5e-post state and the ADR-007 Amendment 4 to absent. Production effect: none — the user-facing path is bundled-depth before and after the change. No DB DML this session; no env-flag change; no schema change.

If the harness re-cache surfaces a regression that the founder cannot in-session-diagnose, the rollback is the same `git revert`. The six post-M1-CP5e seed rows from return-to-M1-CP5-prime remain valid as M1-CP5e baseline data (they are not rolled back; they are additive in `translation_sandwich_comparisons`).

## Forecast

After M1-CP5f: **return-to-M1-CP5-prime-prime** (rubric refresh #3, Standard tier, ~1.5–2hr).

The convergence question becomes load-bearing at return-to-M1-CP5-prime-prime. The pattern across return-to-M1-CP5 → return-to-M1-CP5-prime → return-to-M1-CP5-prime-prime is testing-then-deciding: each cycle has resolved its named issues and surfaced a smaller, more specific next issue. R3 axia (M1-CP5d) → resolved at RTM1-CP5-prime. Q1 stage over-imitation (M1-CP5d) → resolved at RTM1-CP5-prime. Q6 STAGE DISCIPLINE (M1-CP5e) → held at RTM1-CP5-prime. Q2 truncation defense (M1-CP5e) → working at RTM1-CP5-prime. R5 prompt tension + over-imitation pattern shift (M1-CP5f) → verdict at RTM1-CP5-prime-prime.

If RTM1-CP5-prime-prime returns clean (no new R5 issues; no other surface emerging), Branch A (cutover) is the natural verdict; M1-CP6 follows as Critical-tier with full Critical Change Protocol + R10 announcement.

If RTM1-CP5-prime-prime surfaces a new prose-quality issue at the same pattern depth (small surface, specific scope), founder reviews whether the prose-template approach is converging or whether deeper architectural change (Branch C territory — revisit ADR-003 / ADR-004) is the right move. Three iterations of revise from M1-CP5 first-pass with small residuals each cycle is convergence; three iterations with the same shape of residual each cycle is not.

End of prompt.
