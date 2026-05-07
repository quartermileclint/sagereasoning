# Session Close — 2026-05-07 — Sub-session M1-CP5b: ADR-007 amendment for Layer 3 prose-template revisions

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** governance — Standard risk under 0d-ii (documentation only; no production touch).
**Date:** 2026-05-07.

## Decisions Made

- `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` appended to active decision log (~50 lines, lean form per cache). Captures the seven Revisions adopted, the gap 6 Possibility-B disposition, the Pattern-B election for Revision 5, and the M1-CP5c implementation scope.

## Status Changes

| Item | Old | New |
|---|---|---|
| ADR-007 (`/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md`) | Verified (M1-CP4b amendment latest) | **Verified (amended)** — Amendment section dated 2026-05-07 appended; seven Revisions specified; brief changelog bullet pointing to it added. The §1–§9 sections of ADR-007 are unchanged in place; the amendment names what M1-CP5c implements. |
| Layer 3 prose-template scope (decision-level) | Adopted as of M1-CP4b | **Adopted (amended)** — seven Revisions adopted at this session; runtime behaviour unchanged until M1-CP5c implements them. |
| Gap 6 disposition (Layer 1 vs Layer 3) | Open question carried from M1-CP5 | **Resolved** — Possibility B confirmed (Layer 1 already extracts `value_categories_at_stake[]` per ADR-005 §2 + §3.4; Layer 2 consumes via `value_assessment` per ADR-004 §2.3). ADR-005 NOT co-amended; ADR-007 amendment alone sufficient. |
| Layer 3 module (`layer3-prose.ts`) | Verified (current behaviour) | **Verified (current behaviour)** — unchanged at session close. Becomes Scoped → Designed for the seven Revisions; lands at Wired/Verified at M1-CP5c. |

## Next Session Should

**Sub-session M1-CP5c — Layer 3 module update + harness re-cache + brief parallel-run re-validation.** Elevated tier under 0d-ii (existing user-facing functionality changes — Layer 3 module is on the parallel-run path; user-facing path remains bundled-depth so the change is dormant until M1-CP6 cutover, but the module that will become user-facing at M1-CP6 is the one being changed). The session implements the seven Revisions adopted today: rewrites `LAYER3_SYSTEM_PROMPT_API_REASON` in `/website/src/lib/translation-sandwich/layer3-prose.ts` per Revisions 1–7; updates `generateFallbackProse` helpers per Revisions 4 + 5 + 6; rewrites both OUTPUT examples in the prompt to demonstrate the new shape; updates Phase 5 assertions in `/website/scripts/verify-translation-sandwich.ts` (assertion 7 reworded for non-closing-line placement; new negative assertion that closing sentence is NOT a disclaimer; new soft-warn assertion for `improvement_guidance` proportion); regenerates F1–F5 layer3 fixture caches against live Sonnet; runs a brief parallel-run re-validation via 5–10 `/admin/test-reason` clicks. Then return-to-M1-CP5 with refreshed comparison data; if prose now confirms user-facing readiness, advance to M1-CP6 cutover (Critical tier; with R10 announcement).

The next-session prompt is at `/operations/handoffs/founder/2026-05-07-M1-CP5c-NEXT-SESSION-PROMPT.md`.

Pre-conditions for M1-CP5c:

1. M1-CP5b commit + push completed (Vercel state unchanged — this session is documentation-only; no `/website/**` files touched).
2. Founder ready for an Elevated-tier code session — typically 2–3 hours.
3. Anthropic API key available and funded (live Sonnet calls for fixture regeneration; estimated ~$0.20–$0.60 across F1–F5).
4. ADR-007 (amended) read in full at session open (Part A reads).
5. The seven Revisions reviewed at session open.
6. No env-flag changes anticipated (parallel-run path remains dormant by default; user-facing route stays on bundled-depth).
7. No Supabase schema changes anticipated. New rows accumulate in `translation_sandwich_comparisons` from the brief parallel-run re-validation (additive INSERTs only).

Estimated time for M1-CP5c: 2–3 hours.

After M1-CP5c: return-to-M1-CP5 with refreshed comparison data (~1.5–2 hours; analysis-primary). If the prose review now confirms user-facing readiness, advance to M1-CP6 cutover (~3–4 hours; Critical tier with full Critical Change Protocol + R10 announcement). Total path from M1-CP5b onwards to cutover: ~7–10 hours session time across 3 sub-sessions plus the brief parallel-run re-validation period within M1-CP5c.

## Blocked On

**Files remaining uncommitted at session close:**

- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (Amendment section + changelog bullet appended)
- `/operations/decision-log.md` (D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07 entry appended)
- `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5b-close.md` (this file)
- `/operations/handoffs/founder/2026-05-07-M1-CP5c-NEXT-SESSION-PROMPT.md` (next-session prompt)

**Production state at session close:**

- **Vercel deployment:** unchanged from M1-CP5 post-deploy state. No `/website/**` files touched this session. User-visible behaviour at session close: **UNCHANGED**.
- **Supabase `supabase-us`:** unchanged. No DB reads or writes this session.
- **Env flags:** `TRANSLATION_SANDWICH_PARALLEL_RUN` = `1` in Vercel Production (unchanged). `TRANSLATION_SANDWICH_TIER1_SECRET` SET in Vercel Production + Preview + Development (unchanged from M1-CP4e-B).
- **AC4 / AC5 / AC7:** NOT engaged this session. R20a perimeter unchanged; no auth/cookie/session/redirect surface touched.
- **R0, R8a, R8c, R7, AC8, PR1:** ENGAGED at the documentation level (per the decision-log entry's Rules served).
- **LLM cost incurred this session:** $0.00 (governance session; no LLM calls).

## Open Questions

(Carried into the decision-log entry; four items.)

1. **Pattern B may produce different LLM drift than Pattern A would have.** New failure mode is "LLM places disclaimer at closing line despite instruction"; mitigated by M1-CP5c's new negative harness assertion. Track during M1-CP5c parallel-run re-validation.
2. **PR8 promotion candidate count.** Founder elected to hold PR8 promotion of the in-place ADR amendment pattern for one more cycle (this is the fourth in-place amendment to ADR-007). Revisit at the next in-place ADR amendment.
3. **Revision 5's input-condition logic is heuristic.** "Temporal hooks", "input has raised the question of appropriateness" are LLM-judged conditions. M1-CP5c codifies the heuristic in the prompt; harness flags edge cases. May need refinement after M1-CP5c parallel-run data.
4. **Word-budget proportions in Revision 7 are sentence-count-based.** May produce edge cases where one long sentence carries the content of three short sentences. Track at M1-CP5c; revisit if the heuristic produces false positives or negatives in the soft-warn assertion.

## Founder Verification

**Step A — Commit + push the M1-CP5b governance changes.** Open Terminal, paste this exact block, press **Enter**:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add adopted/adr/2026-05-04-layer3-prose-template-api-reason.md operations/decision-log.md operations/handoffs/founder/2026-05-07-sub-session-M1-CP5b-close.md operations/handoffs/founder/2026-05-07-M1-CP5c-NEXT-SESSION-PROMPT.md && git commit -m "M1-CP5b: ADR-007 amendment for Layer 3 prose-template revisions

Per D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07, ADR-007 amended in place with seven Revisions to the Layer 3 prompt template:

1. Closing sentence MUST be the action (hard rule).
2. Voice as guidance, not factual recap (structural rule).
3. Consistent bracketed Greek-to-English glossing on first use per response (R8c application).
4. Careful false-judgement framing — virtue/vice carry moral weight, not the practitioner's character (new sub-section).
5. Marginal-case disclaimers demoted from closing line — Pattern B selected: discipline preserved (M1-CP3 anti-drift lesson), placement changed (mid-prose, not closing).
6. Surface preferred-indifferent observations from value_assessment.identified_value_errors (new rendering rule + composition table extension).
7. Lighter assessment recap (≤25%), heavier actionable guidance (≥60%) by sentence count (proportional rebalance).

Gap 6 dispositioned: Possibility B confirmed (Layer 1 already extracts value_categories_at_stake per ADR-005 §2 + §3.4; Layer 2 consumes via value_assessment per ADR-004 §2.3). ADR-005 NOT co-amended.

PR8 promotion held for one more cycle (this is the fourth in-place amendment to ADR-007 specifically).

Implementation scope deferred to M1-CP5c (Elevated tier; module + harness + brief parallel-run re-validation).

Risk classification: Standard under 0d-ii. Governance/documentation only; no production touch. AC4/AC5/AC7/PR6 NOT engaged. Critical Change Protocol NOT engaged.

Decision-log entry D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07 appended (lean form per cache). Next-session prompt for M1-CP5c drafted.

Cross-references: D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07, D-M1-CP4f-PARALLEL-RUN-OBSERVATION-INFRA-2026-05-07, D-M1-CP4e-B-AC13-TIER1-DEPLOYED-2026-05-07; ADR-007 (the amended deliverable), ADR-005 §2 + §3.4 (gap 6 source), ADR-004 §2.3 + §10 (M1-CP4b precedent)."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**.

If `git add` fails with `index.lock` errors, paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

Vercel will rebuild on push (it always does on any commit), but the build is **expected to be a no-op for `/website/**`** because no `/website/**` files were touched. Build should be **green** with no behavioural change to user-facing paths.

**Step B — Independent verification (founder-performable, optional but recommended).** Open Terminal, paste:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
grep -c "^## Amendment — 2026-05-07" adopted/adr/2026-05-04-layer3-prose-template-api-reason.md
grep -c "^#### Revision" adopted/adr/2026-05-04-layer3-prose-template-api-reason.md
grep -c "Pattern B" adopted/adr/2026-05-04-layer3-prose-template-api-reason.md
```

Expected: first command returns `1` (the new Amendment section exists); second command returns `7` (seven Revisions present); third command returns `1` (Pattern B election recorded once in Revision 5's heading).

If figures diverge, surface in the M1-CP5c session-open.

## Cross-references

- `/operations/handoffs/founder/2026-05-07-sub-session-M1-CP5-close.md` (predecessor close)
- `/operations/handoffs/founder/2026-05-07-M1-CP5b-NEXT-SESSION-PROMPT.md` (this session's input prompt)
- `/operations/handoffs/founder/2026-05-07-M1-CP5c-NEXT-SESSION-PROMPT.md` (next-session prompt for M1-CP5c)
- `/operations/decision-log.md` `D-M1-CP5b-ADR-007-AMENDMENT-2026-05-07` (this session's entry)
- `/operations/decision-log.md` `D-M1-CP5-COMPARISON-RUBRIC-FIRST-PASS-2026-05-07` (predecessor entry — the seven gaps)
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (the amended deliverable; Amendment section dated 2026-05-07)
- `/adopted/adr/2026-05-04-layer1-schema-specification.md` §2 + §3.4 (gap 6 disposition source)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` §2.3 + §10 (gap 6 source + M1-CP4b in-place amendment precedent)
- `/adopted/standing-protocol-cache.md` (operative governing frame)

*End of session close. Sub-session M1-CP5b landed: ADR-007 amended in place with seven Revisions; gap 6 dispositioned; Pattern B selected; M1-CP5c implementation scope named. The Layer 3 prose-template specification is now scoped for the M1-CP5c module update; the runtime engine's behaviour is unchanged at session close.*
