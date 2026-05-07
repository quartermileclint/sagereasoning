# Next-Session Prompt — Sub-session M1-CP5e: Q2 extractJSON / "no markdown" hardening + Q6 upstream-causal-chain soft-warn refinement

**Stream:** founder.
**Tier:** code-standard.
**Governing frame:** /adopted/standing-protocol-cache.md (full governance via the cache; deliverables-of-the-day named below).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-07-M1-CP5d-close.md`.
**Predecessor decision-log entries:** `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` (M1-CP5d's two refinements + harness all-checks pass); `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07` (Q2 + Q6 surfaced as M1-CP5e scope at return-to-M1-CP5).
**Risk classification:** Standard under 0d-ii. The session changes prompt language and possibly extends `extractJSON` with a defensive markdown-fence-stripping pre-process. Module changes are confined to the parallel-run-dormant Layer 3 surface (per ADR-004 §6.3); user-facing path remains bundled-depth so changes are dormant in production until M1-CP6 cutover. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged.

## Why this session matters

Two open questions surfaced at return-to-M1-CP5 + M1-CP5d need resolution before return-to-M1-CP5-prime can run a clean rubric refresh: **Q2** (F4 one-off JSON parse failure — the LLM occasionally wraps its JSON output in markdown fences despite the "Return only the JSON" instruction; `extractJSON` does not currently strip them; the production path catches and falls back to deterministic prose, but a parse-clean Layer 3 LLM path is the goal at M1) and **Q6** (upstream-causal-chain soft-warn refinement — the LLM sometimes names upstream stages in prose with confusing framing rather than focusing on the stage where the work is, diluting practitioner-facing focus). Both are surface-level prose-quality / parse-discipline refinements that don't change the analytical engine. M1-CP5e lands these so return-to-M1-CP5-prime can verify the seven Revisions + the M1-CP5d refinements + the M1-CP5e refinements all hold cleanly on a fresh post-M1-CP5e parallel-run sample.

## Pre-conditions

1. M1-CP5d commit + push completed (the nine governance + module + cache files: ADR-007 Amendment 2; layer3-prose.ts; F1–F5 layer3 caches; decision-log entry; close; this prompt). Vercel green; production behaviour unchanged.
2. ADR-007 Amendment 2 — 2026-05-07 (the M1-CP5d amendment) read at session open — confirms current prompt-template state.
3. The "OUTPUT" section of `LAYER3_SYSTEM_PROMPT_API_REASON` (around the line that begins "Return ONLY valid JSON conforming to Layer3Prose. No markdown.") and the `extractJSON` helper at `/website/src/lib/json-utils.ts` located before drafting the in-place changes.
4. **Schema-vs-prompt drift carry-forward applies.** Before issuing any SQL or column-reference, AI verifies column / JSONB-path references against `/website/migrations/2026-05-04-translation-sandwich-comparisons.sql` + `/website/src/lib/translation-sandwich/parallel-run.ts`. The column-name error caught at return-to-M1-CP5 must not recur.
5. Founder-attended local-machine session for harness re-run + commit. Browser session not required.
6. No env-flag changes anticipated.
7. No Supabase schema changes anticipated.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-standard`, Standard risk class, model selection per Element 6, signals, lean-form templates).
2. `/operations/handoffs/founder/2026-05-07-M1-CP5d-close.md` (~5 min — predecessor close).
3. `/operations/decision-log.md` last entry `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07` — read in full, especially the Open Questions 1, 2, 3.
4. `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` Amendment 2 — 2026-05-07 (the prompt as M1-CP5d left it).
5. `/website/src/lib/translation-sandwich/layer3-prose.ts` — `LAYER3_SYSTEM_PROMPT_API_REASON` constant; the OUTPUT instruction location.
6. `/website/src/lib/json-utils.ts` — `extractJSON` helper (the function the F4 failure routes through).

Confirm at session open per cache + governance protocol:

- **Tier:** `code-standard` — Standard risk under 0d-ii. AC4/AC5/AC7/PR6 NOT engaged.
- **Hold-point:** P0 0h active.
- **Model selection:** Sonnet (`MODEL_DEEP`) for Layer 3 — unchanged. Per cache Element 6 row "Layer 3 translation (alt-3)".
- **Status vocabulary:** Layer 3 module currently *Verified (amended at M1-CP5d)*. After M1-CP5e: *Verified (amended again — pending return-to-M1-CP5-prime to re-confirm)*. ADR-007 currently *Adopted (amended twice — Amendment 2026-05-07 from M1-CP5b + Amendment 2 — 2026-05-07 from M1-CP5d)*. After M1-CP5e: *Adopted (amended again — Amendment 3 appended OR Q2/Q6 absorbed into Amendment 2)*. The session opens with both options on Step 5 and AI surfaces a recommendation; founder calls.
- **Engaged rules:** R0, R8a, R8c, R7, AC1, AC8, KG1, PR1, PR3, PR4, PR5. NOT engaged: AC4, AC5, AC7, PR6.

## Part B — Procedure

### Step 1 — Investigate Q2 (extractJSON / "no markdown" failure mode)

Read `extractJSON` at `/website/src/lib/json-utils.ts`. The F4 failure pattern (per M1-CP5c diagnosis): LLM occasionally returns markdown-wrapped JSON (e.g., ` ```json\n{...}\n``` `) rather than raw JSON; `extractJSON`'s parse logic doesn't strip the fences and throws. Two fix candidates:

- **Approach (a) — prompt-only.** Tighten the OUTPUT instruction in `LAYER3_SYSTEM_PROMPT_API_REASON` to be more emphatic. Current text: "Return ONLY valid JSON conforming to Layer3Prose. No markdown. No commentary outside the JSON." Tightened text: "Return ONLY the raw JSON object. Do NOT wrap it in markdown fences (no ```json, no ```). The first character of your response MUST be `{` and the last character MUST be `}`. No commentary outside the JSON. No code-block syntax."
- **Approach (b) — defensive parsing.** Extend `extractJSON` with an idempotent markdown-fence-stripping pre-process step (strips ` ```json ... ``` ` and ` ``` ... ``` ` if present, leaves raw JSON unchanged otherwise). Non-breaking — passes existing call sites unchanged.

The two approaches are not mutually exclusive — combining both is the most defensive option. AI surfaces this at session open; founder elects one or both.

### Step 2 — Implement Q2 fix

Apply the chosen Q2 fix:
- If Approach (a): update the OUTPUT instruction text in `LAYER3_SYSTEM_PROMPT_API_REASON`.
- If Approach (b): extend `extractJSON` in `/website/src/lib/json-utils.ts`. Pre-process step removes leading/trailing markdown fences before the existing parse path runs.
- If both: apply both in the same session.

### Step 3 — Investigate Q6 (upstream-causal-chain soft-warn refinement)

Locate the post-M1-CP5c row(s) where the LLM named upstream stages in confusing prose. The pattern: prose like "the work is at the synkatathesis stage upstream of the lodged horme stage" — names two stages, dilutes the practitioner-facing focus. The intent: prose names the stage where the work is (the lodged stage). Naming an "upstream" stage is permissible only when the assessment explicitly names it as a step in the corrective sequence (e.g., when the lodged stage is `horme` but the corrective move is to intercept at `synkatathesis` going forward — that is the upstream-stage case where naming it adds clarity rather than dilutes it).

The fix: clarify in the philosophical_reflection STRUCTURE section (or COMPOSITION CONTRACT) that the prose names the stage where the passion is lodged (`passion_diagnosis.passions_detected[].causal_stage_affected`); naming upstream stages is permissible only when the assessment names them as part of the corrective sequence.

### Step 4 — Implement Q6 fix in `/website/src/lib/translation-sandwich/layer3-prose.ts`

Update the prose-template language. Add to the philosophical_reflection STRUCTURE section (or to the COMPOSITION CONTRACT section, founder calls):

> "Name the stage where the passion is lodged (`passion_diagnosis.passions_detected[].causal_stage_affected`). Do not name upstream stages in prose unless the assessment explicitly names them as part of the corrective sequence — naming multiple stages dilutes the practitioner-facing focus."

The third OUTPUT example added at M1-CP5d uses this pattern correctly (names `horme` as the lodged stage; the corrective move at horme is to intercept the impulse before it becomes praxis — `praxis` is named as the downstream stage to prevent, not as an upstream stage). The new prose-template language is consistent with that example.

### Step 5 — Decide on Amendment 3 vs absorb-into-Amendment-2

Two options for the ADR side:

- **Option (a) — Amendment 3.** Append a new Amendment 3 — 2026-05-07 (M1-CP5e) sibling to Amendments 1 + 2. Preserves the per-session granularity that M1-CP5b + M1-CP5d adopted. Sixth recurrence of the in-place ADR amendment pattern (PR8 candidate count advances; founder may elect to promote at this point or hold one more cycle).
- **Option (b) — extend Amendment 2.** Add a Revision 9 (Q2) + Revision 10 (Q6) to Amendment 2 since both refinements are continuations of the Branch B precautionary refinement scope. Holds the in-place ADR amendment count at five (no new Amendment section adopted).

Default recommendation: **(a) Amendment 3** — preserves per-session granularity. Founder calls.

### Step 6 — Founder runs the harness locally

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
LAYER1_REPLAY_CACHE=1 LAYER3_FORCE_REGEN=1 npx tsx scripts/verify-translation-sandwich.ts
```

Expected: SUMMARY all checks pass (the goal of Q2 is to clean F4's JSON parse failure when it next surfaces; Q6 should not introduce new failures since the prose-template change is additive guidance). Cost: ~$0.30–$0.70 (Layer 1 REPLAY from cache; Layer 3 regenerated against live Sonnet).

If F4 still fails after Approach (a) only, fall back to Approach (b) (extractJSON markdown-stripping) and re-run. If F4 still fails after both approaches, surface the failure here — that would be a sign of a different parse failure mode and would warrant in-session investigation.

### Step 7 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP5e-LAYER3-Q2-Q6-RESOLVED-YYYY-MM-DD`. Cross-references: `D-M1-CP5d-LAYER3-AMENDMENT-2-2026-05-07`, `D-M1-CP5-RETURN-RUBRIC-REFRESH-2026-05-07`.

Entry MUST capture: the Q2 approach chosen ((a), (b), or both) with reasoning; the Q6 prose-template language change; the Amendment 3 vs absorb-into-Amendment-2 decision; the harness pass figure (was F4 cleaned by the Q2 fix?); whether any in-session prompt-strengthening was needed (PR8 candidate recurrence count); the next session named (return-to-M1-CP5-prime); rules served + risk classification.

### Step 8 — Session close (lean form) + draft return-to-M1-CP5-prime next-session prompt

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt is at `/operations/handoffs/founder/YYYY-MM-DD-return-to-M1-CP5-prime-NEXT-SESSION-PROMPT.md`. Scope: rubric refresh #2 against post-M1-CP5e parallel-run sample (4–6 rows; six rubric dimensions; prose-quality verdict against M1-CP5b Revisions 1–7 + M1-CP5d Refinement to Revision 3 + Revision 8 + M1-CP5e Q2 + Q6). Standard tier (read-only analysis).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-007 Amendment 2 + layer3-prose.ts + extractJSON read | 15–20 min |
| Step 1 — investigate Q2 + surface fix-option choice | 15–20 min |
| Step 2 — implement Q2 fix | 20–30 min |
| Step 3 — investigate Q6 | 10–15 min |
| Step 4 — implement Q6 fix | 15–20 min |
| Step 5 — Amendment 3 vs absorb-into-Amendment-2 decision + apply | 20–30 min |
| Step 6 — harness re-run (founder, ~$0.30–$0.70) | 10–15 min |
| Step 7 — decision-log entry (lean form) | 15–20 min |
| Step 8 — session close (lean form) + return-to-M1-CP5-prime next-session prompt | 25–35 min |
| **Total** | **~1.5–2.5 hours** |

Approach (a) only at Step 2 lands closer to the lower bound; combining (a) + (b) closer to the upper.

## Rollback path

`git revert` of the M1-CP5e module + ADR + (possibly) `extractJSON` commit reverts the Layer 3 module + `extractJSON` to their M1-CP5d-post state. Production effect: none — the user-facing path is bundled-depth before and after the change. The ADR-007 Amendment 3 (or extended Amendment 2) reverts as part of the same revert. No DB DML this session; no env-flag change; no schema change.

## Forecast

After M1-CP5e: return-to-M1-CP5-prime (rubric refresh #2 against fresh post-M1-CP5e parallel-run sample, Standard tier, ~1.5–2 hours). Then M1-CP6 cutover (Critical, ~3–4 hours; full Critical Change Protocol; R10 announcement scope; Layer 1 cache cost-aware accounting refresh).

Total path from this session to M1-CP6: ~5–8 hours session time across 2 sub-sessions.

This is the second of two precautionary refinement sessions before cutover. M1-CP5d landed the Revision 3 term-list refinement + Revision 8 third OUTPUT example (Q1 over-imitation); M1-CP5e lands the Q2 + Q6 fixes; return-to-M1-CP5-prime verifies the cumulative result; M1-CP6 cutover follows.

End of prompt.
