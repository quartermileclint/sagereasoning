# Session Close — 2026-05-04 — Sub-session M1-CP3: Layer 3 module Verified (standalone) + ADR-007 Adopted

**Stream:** founder.
**Governing frame:** `/adopted/standing-protocol-cache.md` (cached governance; deliverable-of-the-day = ADR-007 + Layer 3 module + harness Phase 5).
**Tier:** code-standard — Standard risk under 0d-ii.
**Date:** 2026-05-04.

## Decisions Made

- **D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04** appended to active log (2122 → 2178 lines). ADR-007 (Layer 3 Prose Template for `/api/reason`) drafted in `/drafts/adr/`, founder-approved verbatim ("approved as drafted") across all four load-bearing decisions surfaced before drafting (prose shape: three flat string fields per ADR-004 §2.4; prompt input scope: full `Layer2Assessment` JSON; marginal-case phrasing: explicit per Stoic discipline; fallback architecture: separate exported `generateFallbackProse` function), moved to `/adopted/adr/`. Layer 3 module `/website/src/lib/translation-sandwich/layer3-prose.ts` built and Verified (standalone) via synthetic-schema smoke test (32/32 checks across F1-style fixture + marginal-case fixture + 9 validator-rejection cases across all four error categories shape/version/enum/string_required). Harness extended at Phase 5 (Layer 3 prose-assessment consistency); Phases 6–9 remain stubbed.

- **In-session amendment to D-M1-CP3 — post-harness fix.** Founder ran the real-Sonnet harness; 73/77 checks passed; 4 failures all traced to one root cause: the LLM silently omitted the single-snapshot marginal-case sentence on the 3 fixtures with `direction_of_travel === 'single_snapshot'` (F1, F3, F4); the fallback also omitted it because the original `fallbackPhilosophicalReflection` had no `direction_of_travel` handling. Founder approved fix-in-session ("Recommended"). Amendment applied to ADR-007 §3 (OUTPUT example now includes the single-snapshot sentence as a worked example; prose-field instruction strengthened to mark single-snapshot phrasing as MANDATORY) + ADR-007 §6 (fallback documentation updated) + Changelog. Mirror amendment applied to `layer3-prose.ts` (LAYER3_SYSTEM_PROMPT_API_REASON constant + `fallbackPhilosophicalReflection` function). In-sandbox smoke test re-run: 34/34 (was 32/32) — fallback fix verified. Decision-log Amendment block + new PR5 candidate ("LLM marginal-case discipline requires worked OUTPUT examples"; first observation) logged to `/operations/knowledge-gaps.md`. Decision log: 2178 → 2233 lines.

- **Second in-session amendment to D-M1-CP3 — post-amendment kathekon-null fix.** Founder ran the harness post-first-amendment; score moved from 73/77 → **78/79**. The 3 single-snapshot per-fixture failures + cross-fixture coverage all PASSED (first amendment confirmed working). One residual failure surfaced: F1.P5 `is_kathekon=null → prose contains "cannot be determined"` — same structural pattern as single-snapshot drift on a different marginal field. Visible because F1's Layer 1 output is non-deterministic; this run produced kathekon=marginal/null (last run was kathekon=contrary). PR5 candidate "LLM marginal-case discipline requires worked OUTPUT examples" promoted from Candidate (first observation) to Candidate (2nd recurrence — watch status). Founder approved second fix-in-session ("Recommended — apply same pattern that worked"). Second amendment: ADR-007 §3 COMPOSITION CONTRACT bullets all marked MANDATORY; PROSE FIELDS instruction expanded word budget 2-4 → 2-5 sentences (~40-110 → ~40-140 words); OUTPUT example's philosophical_reflection now includes "The action's appropriateness cannot be determined from the available evidence." between correct-view + single-snapshot sentences (kathekon-null worked-example demonstration); §6 fallback documentation updated; Changelog second-amendment entry added. Mirror amendment in `layer3-prose.ts`: prompt constant + `fallbackPhilosophicalReflection` extended to append kathekon-null sentence independently when applicable. In-sandbox smoke test 36/36 (was 34/34; +2 for kathekon-null fallback assertions on F1 + MARG). Decision log: 2233 → 2308 lines. knowledge-gaps register updated with resolution-applied note + revised promotion trigger. Founder re-runs harness post-second-amendment between sessions to confirm 79/79.

## Status Changes

| Item | Old status | New status |
|---|---|---|
| ADR-007 (Layer 3 Prose Template for `/api/reason`) | non-existent | **Adopted** at `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (~365 lines). Defines `Layer3Prose` TypeScript type with three flat string fields + version metadata + source flag; the Layer 3 system prompt for `/api/reason` with concrete OUTPUT example per PR5 discipline; composition rule mapping `Layer2Assessment` fields to prose categories; consistency contract per ADR-004 §5.3; deterministic fallback prose mechanics per ADR-004 §9.3; validator pattern; standalone harness Phase 5 fixture set; KG-compliance summary. |
| `/website/src/lib/translation-sandwich/layer3-prose.ts` | non-existent | **Verified (standalone).** ~470 lines. Exports `generateProse` (async, Sonnet, 2000 max-tokens, 0.3 temperature, system-message-cached prompt per AC6), `generateFallbackProse` (synchronous, deterministic, no LLM, no I/O), `validateLayer3Prose` (hand-rolled validator mirroring ADR-005 §6 + ADR-006 §5 patterns), `Layer3ValidationError` class, `Layer3Prose` + `ProseInput` + `Layer3Consumer` + `Layer3ProseSource` types, the system prompt constant `LAYER3_SYSTEM_PROMPT_API_REASON` for harness consumption. Synthetic smoke test 32/32 across F1-style + marginal-case fixtures. Not imported by any route until M1-CP4 per ADR-004 §10.1. |
| `/website/scripts/verify-translation-sandwich.ts` | Wired (Phase 1 + 2 + 3 + 4) | **Wired (Phase 1 + 2 + 3 + 4 + 5).** ~720 → ~1130 lines. Phase 5 implementation: per-fixture `runFixtureLayer3` with cache replay path; per-fixture assertions for generateProse + generateFallbackProse + validator + JSON roundtrip + source-flag + idempotency + Greek-identifier consistency + marginal-case phrasing recognisers + hard contradiction checks; cross-fixture coverage assertion for marginal-case phrasing. New Layer 3 cache helpers (`loadCachedLayer3Prose`, `saveCachedLayer3Prose`, `layer3CacheFilePath`) writing to existing `scripts/.translation-sandwich-cache/` directory under same `LAYER1_REPLAY_CACHE=1` env flag (single flag at M1-CP3 per ADR-007 §8.3). main() updated to call `runPhase5Async`; SUMMARY message updated; file-header comment updated. Phases 6–9 remain stubbed with TODO markers. |
| `/drafts/adr/` | empty | **Empty again.** ADR-007 moved to `/adopted/adr/` after approval. |
| `/adopted/adr/` | six ADRs | **Seven ADRs.** ADR-007 added. |
| M1-CP3 deliverable | Scoped (named in ADR-004 §10) | **Verified (standalone).** Layer 3 module structurally + algorithmically correct via synthetic smoke test; full real-Sonnet Phase 5 verification is the founder's between-sessions check. M1-CP4 is the next deliverable. |

## Next Session Should

**Sub-session M1-CP4 — End-to-end orchestration + parallel-run wiring on `/api/reason`.** Per ADR-004 §10. **Critical-tier — Critical Change Protocol applies.** Wire the translation-sandwich engine (Layer 1 → Layer 2 → Layer 3) into `/api/reason`'s existing call to `runSageReason`, configured in parallel-run mode: bundled-depth result returned to user (unchanged); translation-sandwich result logged to a new Supabase `translation_sandwich_comparisons` table for offline comparison. Failure isolation: any throw from Layer 1 or Layer 3 results in the bundled-depth path serving the user (Layer 2 cannot throw under correct inputs); `generateFallbackProse` invoked when `generateProse` throws per ADR-004 §9.3. Harness Phases 6 + 7 + 8 + 9 implemented (end-to-end orchestration; R20a perimeter preservation via AC4 invocation testing; fallback semantics; cost + latency reporting). R5 cost-health alerts engaged for the parallel-run period. Founder approves the parallel-run cost budget + duration cap explicitly under the Critical Change Protocol (proposed default per ADR-004 §6.2: 14 days OR $50 OR 1000 requests, whichever first). Risk class: **Critical** (R20a perimeter; deployment-config; user-facing route change; AC5 + AC7 + PR6 all engaged). Estimated time: 4–6 hours for the wiring + harness, with a separate session for the parallel-run cost cap approval if scope inflates. Pre-conditions: this session's six uncommitted files pushed via GitHub Desktop; Vercel build green; founder's optional real-Sonnet harness run (~$0.20–0.60) confirms Phases 1–5 pass.

PR5 carry-forward stays in **watch (second-recurrence) status** for M1-CP4. The founder's between-sessions real-Sonnet Phase 5 run is the first contact with Layer 3's actual LLM output. If Phase 5's per-fixture assertions surface JSON-key drift in Layer 3's output, that is the third recurrence and triggers promotion of "LLM JSON-key fidelity requires concrete OUTPUT examples" to a permanent KG entry. If Phase 5 passes cleanly, the prophylactic application worked and the candidate stays in watch.

The next-session prompt for M1-CP4 follows the **full** template (per cache §"Critical-risk sessions"), not the lean form. Critical Change Protocol sections (what changes, what could break, rollback plan, verification step, explicit approval) are required.

Next-session prompt: `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md`.

## Blocked On

**Files remaining uncommitted at session close:**

- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (new + amended — ADR-007 in adopted state; original ~365 lines + in-session amendment to §3 + §6 + Changelog)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` (new + amended — Layer 3 module; original ~470 lines + in-session amendment to LAYER3_SYSTEM_PROMPT_API_REASON + fallbackPhilosophicalReflection)
- `/website/scripts/verify-translation-sandwich.ts` (modified — extended with Phase 5 + Layer 3 cache helpers; ~720 → ~1130 lines)
- `/operations/decision-log.md` (modified — D-M1-CP3 entry + in-session Amendment block appended; 2122 → 2233 lines)
- `/operations/knowledge-gaps.md` (modified — new PR5 candidate "LLM marginal-case discipline requires worked OUTPUT examples" logged for first observation)
- `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md` (this file — new + amended)
- `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md` (next — new)
- *Note: the original `/drafts/adr/2026-05-04-layer3-prose-template-api-reason.md` was created earlier this session via Write and then moved via bash `mv` into `/adopted/adr/`. Per E9/E10 snapshot semantics, git tracks only the file at its `/adopted/adr/` location.*

**Production state at session close:**

- Vercel deployment: unchanged behaviourally. New module + harness extension land; `layer3-prose.ts` is not imported by any route. Vercel will rebuild on push and should succeed unchanged (Next.js compiles `src/`; the new module compiles cleanly per `npx tsc --noEmit -p .` confirmed at session close; `scripts/` is outside the build).
- Supabase `supabase-us`: unchanged; no DDL or data writes this session.
- AC7 standing constraint: NOT engaged at any edit this session.
- AC8 standing constraint: third-build engagement realised. Layer 3 module sits under `/website/src/lib/translation-sandwich/` per the architectural constraint's directory rule. Compliant.
- AC1: engaged this session — Sonnet (`MODEL_DEEP`) cited per cache Element 6 row "Layer 3 translation (alt-3)"; type-enforced via `assessment_deep` row of `PermittedModel` resolving to `DeepModel`.
- AC6: engaged — Layer 3 prompt cached system message; assessment in user message. Same placement as `extractFeatures` in Layer 1.
- AC5 + PR6 NOT engaged this session (both engage at M1-CP4 + M1-CP6 per ADR-004 §10). Critical Change Protocol NOT engaged this session. R20a perimeter unchanged.
- LLM cost incurred this session: $0.00 — the workspace bash sandbox blocked outbound Anthropic API calls so the real-Sonnet harness Phase 5 did not run in-session. Founder's between-sessions verification will incur ~$0.20–0.60 for one full harness run (Phase 1+2 ~$0.10–0.40 + Phase 5 ~$0.04–0.16).

## Open Questions

(Carried into the decision-log entry at length; summarised here.)

1. **Layer 3 prompt template behaviour against real Sonnet output.** The founder's between-sessions real-Sonnet harness run is the first contact with actual LLM output for Layer 3. **Revisit at M1-CP4** if Phase 5 surfaces JSON-key drift or marginal-case phrasing failures.
2. **Marginal-case coverage adequacy of F1–F4.** All four fixtures are single-snapshot inputs; the cross-fixture coverage assertion is satisfied trivially by `direction_of_travel === 'single_snapshot'`. A fixture with explicit before/after temporal markers would make the assertion meaningful for `direction_of_travel`. **Revisit at M1-CP4** with first parallel-run traffic data.
3. **Whether the second-person prose addressing convention ("you/your") fits all `/api/reason` consumers.** The OUTPUT example commits to second person. **Revisit at M1-CP4** if real consumer feedback contradicts.
4. **Whether `LAYER1_REPLAY_CACHE=1` should be split into `LAYER1_REPLAY_CACHE` + `LAYER3_REPLAY_CACHE`.** Currently the single flag governs both layers per ADR-007 §8.3. **Revisit at M1-CP4** if cost discipline requires independent control.
5. **Parallel-run cost cap.** **Revisit at M1-CP4.**
6. **Cutover criteria.** **Revisit at M1-CP5.**

(Open question 1 from D-M1-CP2 — "Layer 3 prompt template for `/api/reason`" — is **closed** this session: ADR-007 specifies it.)

**PR5 carry-forward (watch status, second-recurrence):** "LLM JSON-key fidelity requires concrete OUTPUT examples, not semantic bullets". The discipline was applied **prophylactically** to ADR-007 §3 + the corresponding constant in `layer3-prose.ts` — concrete JSON keys + concrete realistic prose values, not placeholder syntax. No third recurrence event occurred this session because the workspace bash sandbox blocked the real-Sonnet harness call. The candidate **stays in watch (second-recurrence) status**. It will engage at M1-CP3b or M1-CP4 if the founder's between-sessions real-Sonnet run reveals JSON-key drift in Layer 3's output. If Phase 5 passes cleanly with no validator throws and no JSON-key drift warnings, that is evidence the prophylactic application worked.

## Founder Verification

Open Terminal, paste this exact block, press **Enter** (one combined command — adds all touched files):

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning" && git add -A adopted/adr/ drafts/adr/ operations/decision-log.md operations/knowledge-gaps.md operations/handoffs/founder/2026-05-04-sub-session-M1-CP3-close.md operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md website/src/lib/translation-sandwich/layer3-prose.ts website/scripts/verify-translation-sandwich.ts && git commit -m "session close: M1-CP3 Layer 3 module Verified (standalone) + ADR-007 Adopted + post-harness in-session amendment — translation-sandwich engine third build — 2026-05-04 (Sub-session M1-CP3)

- D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04 — Layer 3 build + per-consumer prompt template codification + post-harness in-session amendment

- ADR-007 (Layer 3 Prose Template for /api/reason) drafted in /drafts/adr/, founder-approved verbatim ('approved as drafted') across all four load-bearing decisions, moved to /adopted/adr/. Defines Layer3Prose TypeScript type with three flat string fields + version metadata + source flag; the Layer 3 system prompt for /api/reason with concrete OUTPUT example per PR5 discipline; composition rule mapping Layer2Assessment fields to prose categories; consistency contract per ADR-004 §5.3; deterministic fallback prose mechanics per ADR-004 §9.3; validator pattern; standalone harness Phase 5 fixture set; KG-compliance summary.

- /website/src/lib/translation-sandwich/layer3-prose.ts — new module (~470 lines). Exports generateProse (async, Sonnet MODEL_DEEP, 2000 max-tokens, 0.3 temp, system-message-cached prompt per AC6), generateFallbackProse (synchronous, deterministic, no LLM, no I/O), validateLayer3Prose (hand-rolled validator mirroring ADR-005 §6 + ADR-006 §5 patterns), Layer3ValidationError class, Layer3Prose + ProseInput + Layer3Consumer + Layer3ProseSource types, LAYER3_SYSTEM_PROMPT_API_REASON constant. Synthetic smoke test 32/32 across F1-style + marginal-case fixtures + 9 validator-rejection cases. Status: Verified (standalone). Not imported by any route until M1-CP4.

- /website/scripts/verify-translation-sandwich.ts — extended (~720 → ~1130 lines). Phase 5 implementation: per-fixture runFixtureLayer3 with cache replay path; per-fixture assertions for generateProse + generateFallbackProse + validator + JSON roundtrip + source-flag + idempotency + Greek-identifier consistency + marginal-case phrasing recognisers + hard contradiction checks. Cross-fixture coverage assertion for marginal-case phrasing. Layer 3 cache helpers (loadCachedLayer3Prose / saveCachedLayer3Prose / layer3CacheFilePath) writing to existing scripts/.translation-sandwich-cache/ directory under the same LAYER1_REPLAY_CACHE=1 env flag (single flag at M1-CP3 per ADR-007 §8.3). main() updated to call runPhase5Async; SUMMARY message updated; file-header comment updated. Phases 6–9 remain stubbed with TODO markers cross-referencing ADR-004 §7.2.

- Standard risk under 0d-ii. AC7 NOT engaged. PR6 NOT engaged this session. R20a perimeter unchanged. Critical Change Protocol NOT engaged. AC8 third-build engagement realised. AC1 engaged: Sonnet per cache Element 6 row 'Layer 3 translation (alt-3)'. AC6 engaged: cached system prompt + per-request user message. KG1 + KG2 + KG6 engaged. PR3 engaged in spirit (generateProse awaited; no fire-and-forget). PR4 engaged (Sonnet enforced via PermittedModel). No production behaviour change deploys; module not imported by any route until M1-CP4.

- Limitation surfaced at session close: workspace bash sandbox blocks outbound Anthropic API calls, so the AI verified Layer 3 via a synthetic-schema smoke test (32/32) rather than the real-Sonnet harness Phase 5. Founder's between-sessions verification of the real-Sonnet harness is the standing-protocol completion.

- Post-harness amendment: founder ran the real-Sonnet harness and surfaced 4 failures (LLM omitting single-snapshot marginal-case sentence on F1, F3, F4; F2 passed with direction_of_travel=stable). Founder approved fix-in-session ('Recommended'). ADR-007 §3 OUTPUT example amended to include the single-snapshot sentence in philosophical_reflection (worked-example demonstration of the discipline per the PR5 lesson — worked example beats written instruction); §3 PROSE FIELDS instruction strengthened to mark single-snapshot phrasing as MANDATORY when applicable; §6 fallback documentation updated; Changelog amendment entry appended. layer3-prose.ts LAYER3_SYSTEM_PROMPT_API_REASON constant + fallbackPhilosophicalReflection function mirrored the amendment. In-sandbox smoke test re-run 34/34 (was 32/32 — +2 single-snapshot fallback assertions). New PR5 candidate logged to /operations/knowledge-gaps.md (first observation): 'LLM marginal-case discipline requires worked OUTPUT examples'. Original PR5 candidate (JSON-key fidelity) stays in watch (second-recurrence) — JSON contract held cleanly.

- Second post-amendment fix: founder re-ran the harness post-first-amendment; score moved from 73/77 to 78/79 (first amendment worked: all 3 single-snapshot failures + cross-fixture coverage now pass). One residual failure: F1.P5 kathekon-null phrasing missing — same structural pattern as single-snapshot drift, on a different marginal field, visible because F1's Layer 1 output produced kathekon=marginal/null this run (was kathekon=contrary previously; non-determinism at temperature 0.2). PR5 candidate promoted to watch (2nd recurrence) per PR5 rule. Founder approved second fix-in-session ('Recommended — apply same pattern that worked'). ADR-007 §3 COMPOSITION CONTRACT bullets all marked MANDATORY (kathekon-null + single-snapshot + improvement_path-null); §3 word budget expanded 2-4 → 2-5 sentences (~40-110 → ~40-140 words); OUTPUT example philosophical_reflection now includes 'The action's appropriateness cannot be determined from the available evidence.' as a worked example; §6 fallback documentation updated; Changelog second-amendment entry added. layer3-prose.ts prompt constant + fallbackPhilosophicalReflection extended for kathekon-null append. In-sandbox smoke test re-run 36/36 (was 34/34 — +2 kathekon-null fallback assertions). knowledge-gaps register updated with resolution-applied note + revised promotion trigger (third recurrence promotes to permanent KG entry). Founder re-runs harness post-second-amendment between sessions to confirm 79/79.

- M1-CP3 Verified (standalone) + amended twice. M1-CP4 (parallel-run wiring on /api/reason — Critical-tier; full Critical Change Protocol applies) is the next session's deliverable."
```

Then push via **GitHub Desktop**: open GitHub Desktop → select sagereasoning repo → click **Push origin**. Vercel auto-rebuilds on push to main but no behaviour change deploys (new module + harness extension land; `layer3-prose.ts` is not imported by any route).

If `git add` fails with `index.lock` errors (D-LOCK-CLEANUP-2026-04-26 pattern), paste this in Terminal first then retry:

```
rm "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/.git/index.lock"
```

**Independent verification of the M1-CP3 deliverables:**

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/" | wc -l && echo "--- drafts/adr/ ---" && ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/drafts/adr/"
```

Expected: `7` followed by an empty `/drafts/adr/` listing.

```
grep -n "approved as drafted\|Approve as drafted\|approve as drafted" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md"
```

Expected: two matches (the Status line + the Changelog initial-Adoption entry).

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/src/lib/translation-sandwich/"
```

Expected: `layer1-extractor.ts`, `layer2-mechanisms.ts`, `layer3-prose.ts`.

```
grep -n "TODO: M1-CP" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/scripts/verify-translation-sandwich.ts"
```

Expected: 4 matches (CP4, CP4, CP4, CP4 — Phase 6 + Phase 7 + Phase 8 + Phase 9 stubs remain).

**Optional — TypeScript compile sanity check:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```

Expected: `tsc clean` (exit 0). Confirmed at session close.

**Optional — run the full real-Sonnet harness:**

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```

Expected: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 pass for all four fixtures. Phase 6+ skipped with TODO markers. Per-run cost ~$0.20–0.60 (Phase 1+2 + Phase 5 Sonnet calls). On second + subsequent runs, set `LAYER1_REPLAY_CACHE=1` to skip Sonnet calls and replay cached Layer 1 schemas + Layer 3 prose:

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
```

This is the founder's between-sessions verification of M1-CP3's standalone proof. The AI did NOT run this in-session because the workspace bash sandbox blocks outbound Anthropic API calls; the AI verified the Layer 3 module structurally + algorithmically via a synthetic-schema smoke test (hand-crafted Layer2Assessment fixtures, generateFallbackProse invoked twice per fixture for idempotency, validateLayer3Prose accepting valid + rejecting all 9 malformed inputs across shape/version/enum/string_required) which passed 32/32.

**What to look for in the per-fixture diagnostics (between-sessions verification):**

For each fixture, the harness logs `llm.summary` (the LLM-generated one-sentence summary) and `fallback.summary` (the deterministic fallback summary). Read these. The LLM summary should be more varied + tailored to the fixture; the fallback summary follows a fixed template. If they look broadly similar in content (both naming the same primary issue + proximity), the LLM is honouring the composition contract. If the LLM summary contradicts the fallback summary (e.g., names a different primary issue), this is a soft-warn that the consistency contract may need tightening at M1-CP4.

For each fixture's "Greek identifier consistency" log line: clean output is the expected case. If the harness logs `soft-warn: prose names Greek identifier(s) not in assessment: ...`, this is a soft-warn (does not fail the harness) and means the LLM introduced Greek vocabulary the assessment did not name. Note the identifiers; if the same one keeps appearing, the prompt template at ADR-007 §3 may need tightening at M1-CP4.

For each fixture's marginal-case assertion (single_snapshot fires for all four F1–F4 fixtures): the prose must contain "single snapshot" or "no trajectory" phrasing. If this fails for any fixture, the LLM is not honouring the marginal-case discipline and the prompt template needs revision.

If everything passes cleanly with no soft-warns, the prophylactic PR5 application worked and the candidate stays in watch.

## Cross-references

- `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP2-close.md` (predecessor — Sub-session M1-CP2: Layer 2 module + ADR-006)
- `/operations/handoffs/founder/2026-05-04-M1-CP2-NEXT-SESSION-PROMPT.md` (this session's opening prompt)
- `/operations/handoffs/founder/2026-05-04-M1-CP3-NEXT-SESSION-PROMPT.md` (next session — M1-CP4 parallel-run wiring; Critical-tier)
- `/operations/decision-log.md` `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-04` (this session's entry)
- `/operations/decision-log.md` `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — predecessor entry)
- `/operations/decision-log.md` `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005)
- `/operations/decision-log.md` `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification, including the §5.2 deferral this entry resolves)
- `/adopted/adr/2026-05-04-layer3-prose-template-api-reason.md` (ADR-007 — adopted this session)
- `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006 — Layer 2 input contract Layer 3 consumes verbatim)
- `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005 — Layer 1 schema specification)
- `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004 — names the parent context)
- `/website/src/lib/translation-sandwich/layer3-prose.ts` (the Layer 3 module — Verified standalone)
- `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` (the Layer 2 module — provides assessment input shape)
- `/website/src/lib/translation-sandwich/layer1-extractor.ts` (the Layer 1 module — upstream extraction)
- `/website/scripts/verify-translation-sandwich.ts` (the standalone harness — extended at Phase 5)
- `/manifest.md` AC1 + AC6 + AC8 (binds the model + the placement + the architecture)
- `/adopted/standing-protocol-cache.md` (operative governing frame)

*End of session close. M1-CP3 is the M1 arc's third build; Layer 3 is Verified standalone via synthetic smoke test; M1-CP4 begins with the Critical-tier parallel-run wiring on /api/reason under the full Critical Change Protocol.*
