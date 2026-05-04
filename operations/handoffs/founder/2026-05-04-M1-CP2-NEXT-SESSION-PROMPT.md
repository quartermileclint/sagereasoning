# Next-Session Prompt — M1-CP3: Layer 3 module (`layer3-prose.ts`) + ADR-007 (per-consumer prose template for `/api/reason`)

**Stream:** founder.
**Tier:** `code-standard`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day = ADR-007 + the new module + harness Phase 5).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP2-close.md`.
**Predecessor decision-log entries:** `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-04` (M1-CP2 — Layer 2 module Verified standalone + ADR-006 Adopted); `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module + ADR-005); `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification, including the §5.2 deferral this session resolves).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol **NOT** engaged this session — the Layer 3 module is a new file under `/website/src/lib/translation-sandwich/`, not yet wired into any route. Layer 3 makes a Sonnet LLM call (per ADR-004 §5.2) but the call is not on a safety-critical path (R20a perimeter is in the route, fires before any layer is called). PR6 NOT engaged. AC7 NOT engaged. AC5 R20a perimeter NOT touched. PR3 engaged in spirit (Layer 3 is awaited; no fire-and-forget). The Critical Change Protocol engages at M1-CP4 (parallel-run wiring) and M1-CP6 (cutover); not before.

## Why this session matters

ADR-004 §5.2 names the high-level approach for the Layer 3 LLM call (Sonnet at 2000 max_tokens, 0.3 temperature, per-consumer template) and explicitly defers field-level specification to M1-CP3. ADR-007 is the per-consumer template for `/api/reason` — the one consumer being migrated in M1. M2/M3/M4 consumers will get their own Layer 3 ADRs at their respective milestones. ADR-004 §5.3 names the consistency contract: Layer 3's prose must not contradict or omit Layer 2's assessment.

The PR5 watch (M1-CP1's second recurrence, second observation) re-engages this session: the Layer 3 prompt template's OUTPUT example must show concrete JSON keys + values per category, not placeholder syntax. A third recurrence at M1-CP3 would promote PR5's candidate to permanent KG entry.

## Pre-conditions

1. Founder pushed M1-CP2's seven uncommitted files via GitHub Desktop. Working tree clean at session open. Vercel build green confirmation post-push (no behaviour change deploys this commit).
2. Founder ran the optional `tsc --noEmit -p .` independent verification and confirmed exit 0.
3. Founder ran the optional real-Sonnet harness (`npx tsx scripts/verify-translation-sandwich.ts`) and confirmed Phase 1 + Phase 2 + Phase 3 + Phase 4 all pass. Per-fixture diagnostics looked reasonable. (If Phase 1+2 surfaced new prompt-shape issues — third recurrence of PR5 candidate — that needs to be raised at session open before drafting ADR-007.)
4. Founder ran the verification listings (six files in `/adopted/adr/`; empty `/drafts/adr/`; two "approve as drafted" matches in ADR-006; two files in `/website/src/lib/translation-sandwich/`; 5 TODO matches in harness). All passed cleanly.
5. Founder availability: 3–5 hours estimated (smaller than CP2 because the algorithm is a single LLM call template; ADR-007 + prompt template + harness Phase 5 + module wiring). May extend to two sessions if real-Sonnet observations from CP2's harness run reveal Layer 2 output shape needs refinement before Layer 3's prompt can be specified — defer to M1-CP3b in that case.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-standard`, model selection Sonnet for Layer 3 (cache Element 6 row "Layer 3 translation (alt-3)"), risk class Standard, status vocabulary, signals).
2. `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP2-close.md` (~5 min — predecessor close).
3. `/adopted/adr/2026-05-04-layer2-mechanism-algorithm.md` (ADR-006) **§2 in full** — the `Layer2Assessment` shape Layer 3 consumes verbatim. Re-read §3 if drafting Layer 3 prose needs to reference specific per-mechanism output fields.
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) **§2.4 + §5 in full** — the deliverable-of-the-day's parent specification (Layer 3 prose block fields + module surface + LLM call config + composition-with-assessment guarantee).
5. `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005) **§4 only** — the Layer 1 system prompt is the closest precedent for Layer 3's prompt template + the OUTPUT example discipline (PR5 watch).
6. `/operations/decision-log.md` last 2 entries (`D-M1-CP2` + `D-M1-CP1`) — full context.
7. `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` — re-read the exported types (`Layer2Assessment`, `PassionDiagnosis`, `Oikeiosis`, etc.) and one or two synthetic outputs from the harness's Phase 3 diagnostics so the prompt-template author has a concrete sample of what Layer 3's input looks like.
8. `/website/src/lib/sage-reason-engine.ts` — re-read the existing engine's `philosophical_reflection` + `improvement_path` field shapes (lines 195–198, 234–235, 309–310). Layer 3's `philosophical_reflection`/`improvement_guidance`/`summary` shape per ADR-004 §2.4 differs (single-string fields per category) but the bundled engine's prose composition is the closest existing precedent.

Confirm at session open per cache: tier (`code-standard`); hold-point (P0 0h still active); model selection (Sonnet for Layer 3 per AC1 row + KG2); status vocabulary; signals + risk class (Standard); AC7 + AC8 + R20a dispositions (AC7 NOT engaged; AC8 engaged — third build under the migration; R20a perimeter NOT touched this session — module is not yet wired into any route); PR5 carry-forward status (the M1-CP1 candidate re-engages this session; concrete OUTPUT examples discipline applies to ADR-007 §4 Layer 3 prompt).

## Part B — Procedure

### Step 1 — Surface load-bearing decisions for ADR-007, then draft

The AI surfaces load-bearing decisions before drafting (e.g., what shape the prose JSON output should take — flat string fields vs structured per-mechanism prose; whether Layer 3's prompt receives the full `Layer2Assessment` JSON or only selected fields; the temperature default 0.3 confirmation; how to handle Layer 2's `single_snapshot` direction-of-travel in prose; how to handle `is_kathekon: null` marginal cases in prose; how to phrase the `disambiguation_required` items in prose). Founder selects.

The AI then drafts ADR-007 in `/drafts/adr/2026-05-04-layer3-prose-template-api-reason.md`. ADR-007 specifies:

- The exact TypeScript type `Layer3Prose` (per `/api/reason`'s consumer needs from ADR-004 §2.4: `philosophical_reflection`, `improvement_guidance`, `summary`).
- The Layer 3 system prompt for `/api/reason` consumers — **with concrete OUTPUT example showing exact JSON keys + values** per the PR5 carry-forward discipline.
- The composition rule: which `Layer2Assessment` fields the prompt receives verbatim vs which it composes. ADR-004 §5.3's "consistency" guarantee is the verifiable contract.
- The fallback behaviour when Layer 3 throws (per ADR-004 §9.3 — the canned per-consumer template generated deterministically from Layer 2's assessment).
- LLM call configuration (Sonnet, 2000 max-tokens default per ADR-004 §5.2, temperature 0.3, system prompt placement per AC6).
- Validator pattern (`validateLayer3Prose(parsed): Layer3Prose` — same hand-rolled approach as ADR-005 §6 + ADR-006 §5).
- The harness Phase 5 fixture set + assertion strategy.
- KG-compliance disposition.
- Open questions deferred to M1-CP4.

The AI surfaces ADR-007's draft for founder review. Founder approves verbatim, requests edits, or defers. Same approval flow as ADR-004 + ADR-005 + ADR-006.

### Step 2 — Build the Layer 3 module

The AI creates `/website/src/lib/translation-sandwich/layer3-prose.ts` implementing the contract from ADR-007:

- Module exports `generateProse(assessment: Layer2Assessment, params: ProseInput): Promise<Layer3Prose>`.
- Implementation: Sonnet LLM call with system-message-cached prompt template (AC6); user message carries the `Layer2Assessment` JSON + per-consumer parameters; response parsed via `extractJSON` and validated via `validateLayer3Prose`.
- Per ADR-004 §9.3 fallback: a `generateFallbackProse(assessment): Layer3Prose` deterministic helper (no LLM) for use when the LLM call throws.
- KG1 compliance: awaited LLM call; no DB writes; no fire-and-forget; no module-level cache.
- AC1: Sonnet (`MODEL_DEEP`) per cache row "Layer 3 translation (alt-3)".
- AC8 compliance: module sits under `/website/src/lib/translation-sandwich/` per the architectural constraint's directory rule.

### Step 3 — Extend the standalone harness with Phase 5

The AI extends `/website/scripts/verify-translation-sandwich.ts` (per ADR-004 §7.2) replacing the Phase 5 stub with implementation. Phases 6–9 remain stubbed.

- **Phase 5 — Layer 3 prose-assessment consistency.** For each fixture, run `generateProse(assessment_from_phase_3, {consumer: '/api/reason'})`; assert: (a) the prose validates against `Layer3Prose`; (b) prose claims do not contradict the assessment (extracted claims checked against assessment fields per ADR-004 §5.3). Per-run cost ~$0.04–0.16 (4 fixtures × Sonnet). Idempotent — safe to re-run. Cache the Layer 3 output to disk under `scripts/.translation-sandwich-cache/layer3-{F.id}.json` for replay.

The AI runs the harness; founder confirms exit 0 + the per-fixture prose looks reasonable + assessment-consistency assertions pass. **Limitation surfaced again at M1-CP3:** the workspace bash sandbox blocks outbound Anthropic API calls. The AI may verify Layer 3 structurally via a synthetic-schema smoke test (hand-crafted `Layer2Assessment` + synthetic prose); the founder's between-sessions verification is the standing-protocol completion.

### Step 4 — Verify

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```
Expected: `tsc clean`.

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```
Expected: Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 pass for all fixtures. Phase 6+ skipped with TODO markers. Cost: ~$0.20–0.60 (Phase 1+2 Sonnet + Phase 5 Sonnet).

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/" | wc -l
```
Expected: 7 (after ADR-007 promotion if approved).

```
grep -n "TODO: M1-CP" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/scripts/verify-translation-sandwich.ts"
```
Expected: 4 matches (CP4, CP4, CP4, CP4 — Phase 6 + Phase 7 + Phase 8 + Phase 9 stubs remain).

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/src/lib/translation-sandwich/"
```
Expected: `layer1-extractor.ts`, `layer2-mechanisms.ts`, `layer3-prose.ts`.

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP3-LAYER3-MODULE-AND-ADR007-2026-05-XX` (date stamp at session). Cross-references ADR-004 §10 M1-CP3 + ADR-007 + the M1-CP2 entry.

PR5 carry-forward status to record explicitly: whether the third recurrence of "LLM JSON-key fidelity requires concrete OUTPUT examples" occurred this session (likely will if Layer 3's first prompt iteration uses placeholder examples and the harness Phase 5 surfaces JSON-key drift). If third recurrence: promote to permanent KG entry per PR5 + log promotion in this entry.

### Step 6 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt at session close names M1-CP4 (Critical-tier — parallel-run wiring on `/api/reason`). Risk class for M1-CP4 = **Critical** (per cache + ADR-004 §10 + AC5/AC7/PR6); **Critical Change Protocol applies**; the next-session prompt for M1-CP4 must follow the full template, not the lean form.

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-006 §2 + ADR-004 §2.4 + §5 read | 25–35 min |
| Step 1 — Surface decisions + draft ADR-007 + founder review | 75–120 min |
| Step 2 — Build `layer3-prose.ts` (incl. fallback helper) | 45–75 min |
| Step 3 — Extend harness Phase 5 + run | 30–60 min |
| Step 4 verify | 15–25 min |
| Decision-log + close | 25–35 min |
| **Total** | **~3–5 hours** |

If Step 1's ADR-007 + prompt-template engineering surfaces an unexpected complication (e.g., Layer 2's output shape needs amendment because Layer 3's prompt can't compose certain prose without additional fields), defer Steps 2 + 3 to M1-CP3b. Founder's call.

## Rollback path

`git revert` of the session's commit reverts: (a) ADR-007 file move; (b) the new `layer3-prose.ts` module (file deleted); (c) the harness Phase 5 implementation (revert to stub); (d) the decision-log entry; (e) the close + next-session prompt files. Production state unchanged before and after revert; the route is not touched this session.

## Forecast

If M1-CP3 succeeds: Layer 3 module reaches Verified (standalone). ADR-007 Adopted with concrete OUTPUT example per PR5 discipline. Harness Phases 1–5 operational. Three of three layers proven standalone; M1-CP4's parallel-run wiring becomes the meaningful integration test (Critical-tier; Critical Change Protocol applies; full template required for that next-session prompt).

If ADR-007's prompt template reveals that ADR-006's Layer 2 output shape is insufficient (e.g., the prose needs information Layer 2 doesn't compute), ADR-007 surfaces gaps and proposes amendments to ADR-006. Founder decides at CP3 whether to amend ADR-006 in-session or defer.

If the harness fails Phase 5 (consistency): the AI surfaces the failure pattern; founder decides whether the failure is in the Layer 3 prompt (revise ADR-007), the consistency rubric (revise the harness assertion), or Layer 2's assessment (revise ADR-006). The third option is the most consequential and would justify M1-CP3b.

PR5 carry-forward expected to engage actively this session — the Layer 3 prompt template's OUTPUT example MUST show concrete JSON keys per category. If the first harness Phase 5 run shows JSON-key drift in Layer 3's output (third recurrence), the AI promotes PR5's candidate to permanent KG entry per PR5's promotion rule.

End of prompt.
