# Next-Session Prompt — M1-CP2: Layer 2 module (`layer2-mechanisms.ts`) + ADR-006 (per-mechanism deterministic algorithm)

**Stream:** founder.
**Tier:** `code-standard`.
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day = ADR-006 + the new module + harness Phase 3 + Phase 4).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP1-close.md`.
**Predecessor decision-log entries:** `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-04` (M1-CP1 — Layer 1 module Verified standalone + ADR-005 Adopted); `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification, including the §4.2 deferral this session resolves).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol **NOT** engaged this session — the Layer 2 module is a new file under `/website/src/lib/translation-sandwich/`, not yet wired into any route, and contains **no LLM calls** (deterministic code only). No production behaviour change deploys with this commit. PR6 NOT engaged. AC7 NOT engaged. AC5 R20a perimeter NOT touched (the route is unchanged). The Critical Change Protocol engages at M1-CP4 (parallel-run wiring) and M1-CP6 (cutover); not before.

## Why this session matters

ADR-004 §4.2 names the high-level approach for each of the six Stoic mechanisms but defers the per-mechanism deterministic rules to M1-CP2. Layer 2 is the architecturally distinctive layer of the translation-sandwich engine — it is the layer where principled mechanism reasoning replaces LLM defaults. ADR-004 §"Negative / known costs" names Layer 2's algorithm as the largest unknown in the M1 arc; under-specified rules risk producing assessments that miss the input's nuance, while over-specified rules risk locking in bias from today's LLM defaults. M1-CP2 is the moment that risk is converted into a concrete, citable deterministic algorithm.

Layer 2 has a tractable contract: given a `Layer1Schema` (M1-CP1's output), produce a `Layer2Assessment` with the same shape every time. No LLM, no I/O, no async — pure synchronous code. Phase 3 (idempotency) and Phase 4 (coverage) are the proof.

## Pre-conditions

1. Founder pushed M1-CP1's six uncommitted files via GitHub Desktop. Working tree clean at session open. Vercel build green confirmation post-push (no behaviour change deploys this commit; build runs on `src/` and should succeed unchanged).
2. Founder ran the optional `tsc --noEmit -p .` independent verification and confirmed exit 0.
3. Founder ran the verification listings (five files in `/adopted/adr/`; empty `/drafts/adr/`; two "approve as drafted" matches in ADR-005; one file in `/website/src/lib/translation-sandwich/`). All passed cleanly.
4. Founder availability: 4–6 hours estimated (drafting ADR-006 with citations to canonical Stoic primary sources is the largest item; Layer 2 module is mechanical once ADR-006 is settled; Phases 3 + 4 are smaller than CP1's harness build because they reuse the existing harness file). May extend to two sessions if ADR-006 is larger than expected; defer to M1-CP2b in that case.

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-standard`, no model selection (Layer 2 has no LLM), risk class Standard, status vocabulary, signals).
2. `/operations/handoffs/founder/2026-05-04-sub-session-M1-CP1-close.md` (~5 min — predecessor close).
3. `/adopted/adr/2026-05-04-layer1-schema-specification.md` (ADR-005) **§2 + §3 in full** — Layer 2's input contract is exactly `Layer1Schema`. The per-field guidance in §3 names which Layer 2 mechanism consumes each category.
4. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) **§4 in full** — the deliverable-of-the-day's parent specification (deterministic mechanism approach per mechanism).
5. `/operations/decision-log.md` last 2 entries (`D-M1-CP1` + `D-E10`) — full context.
6. `/website/src/lib/translation-sandwich/layer1-extractor.ts` — re-read the exported types (`Layer1Schema`, controlled vocabularies). Layer 2 imports these directly.
7. `/website/src/lib/sage-reason-engine.ts` — re-read the existing system prompts (`STANDARD_SYSTEM_PROMPT`, `DEEP_SYSTEM_PROMPT`) for the mechanism descriptions Layer 2 will encode deterministically. The bundled engine's prompts are the closest existing specification of the Stoic mechanisms; ADR-006 cites them as one source alongside primary Stoic texts.

Confirm at session open per cache: tier (`code-standard`); hold-point (P0 0h still active); model selection (N/A — Layer 2 has no LLM); status vocabulary; signals + risk class (Standard); AC7 + AC8 + R20a dispositions (AC7 NOT engaged; AC8 engaged — second build under the migration; R20a perimeter NOT touched this session — module is not yet wired into any route).

## Part B — Procedure

### Step 1 — Surface load-bearing decisions for ADR-006, then draft

The AI surfaces the load-bearing per-mechanism decisions before drafting (e.g., what counts as a control-filter "lookup table" entry — fixed list vs configurable; how oikeiosis circle-by-circle assessment handles tied honourability scores; whether iterative_refinement requires a temporal-marker baseline or operates on single-snapshot inputs). Founder selects.

The AI then drafts ADR-006 in `/drafts/adr/2026-05-04-layer2-mechanism-algorithm.md`. ADR-006 specifies:
- The exact TypeScript type `Layer2Assessment` — every field per ADR-004 §2.3.
- Per-mechanism deterministic algorithm pseudocode + lookup tables (control filter classification rules; passion-to-false-judgement mapping; oikeiosis Cicero-question application; per-indifferent axia ranking; kathekon four-rule weights; Senecan-grade computation from four-dimension scores).
- Citations to canonical Stoic primary sources for each rule (Stoic Brain passages, Cicero *De Officiis*, Seneca *Letters*, Epictetus *Discourses* / *Enchiridion*) — per ADR-004 §"Risks named: Layer 2 algorithmic bias" mitigation.
- Idempotency guarantee (§4.3 of ADR-004) and how it is verified.
- Open questions deferred to M1-CP4 (when fixtures from real `/api/reason` traffic are observed).

The AI surfaces ADR-006's draft for founder review. Founder approves verbatim, requests edits, or defers. Same approval flow as ADR-004 + ADR-005.

### Step 2 — Build the Layer 2 module

The AI creates `/website/src/lib/translation-sandwich/layer2-mechanisms.ts` implementing the contract from ADR-006:
- Module exports `applyMechanisms(schema: Layer1Schema, options?: ApplyOptions): Layer2Assessment`.
- Implementation: per-mechanism functions (one per Stoic mechanism); each is pure (no I/O, no module state). Lookup tables defined as `const` data structures inside the module.
- Synchronous (no `async`/`await`); deterministic (same input → same output, byte-for-byte equal across calls).
- KG1 compliance: no LLM, no DB writes, no fetch, no fire-and-forget. Pure function.
- AC1: no model selected; N/A for deterministic code.
- AC8 compliance: module sits under `/website/src/lib/translation-sandwich/` per the architectural constraint's directory rule.

### Step 3 — Extend the standalone harness with Phase 3 + Phase 4

The AI extends `/website/scripts/verify-translation-sandwich.ts` (per ADR-004 §7.2) replacing the Phase 3 + Phase 4 stubs with implementation. Phases 5–9 remain stubbed.

- **Phase 3 — Layer 2 determinism.** For each fixture (the same F1–F4 from CP1), run `applyMechanisms` twice with the same Layer 1 schema; assert the two outputs deep-equal. Use a deterministic Layer 1 input (cache the CP1 harness's Layer 1 output to disk on first run; replay on subsequent runs to avoid Sonnet variance affecting Layer 2 testing).
- **Phase 4 — Layer 2 coverage.** Across all four fixtures, every mechanism produces non-empty output for at least one fixture. No mechanism silently absent.

The AI runs the harness; founder confirms exit 0 + the per-fixture diagnostics look reasonable.

### Step 4 — Verify

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```
Expected: `tsc clean` (the new module compiles without errors).

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```
Expected: Phase 1 + Phase 2 + Phase 3 + Phase 4 pass for all fixtures. Phase 5+ skipped with TODO markers. Cost: similar to CP1 (~$0.10–0.40 for Layer 1 calls; Phase 3 + 4 add no LLM cost since Layer 2 is deterministic).

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/" | wc -l
```
Expected: 6 (after ADR-006 promotion if approved).

```
grep -n "TODO: M1-CP" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/scripts/verify-translation-sandwich.ts"
```
Expected: 5 matches (CP3, CP4, CP4, CP4, CP4 — Phase 5 + Phase 6 + Phase 7 + Phase 8 + Phase 9 stubs remain).

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP2-LAYER2-MODULE-AND-ADR006-2026-05-XX` (date stamp at session). Cross-references ADR-004 §10 M1-CP2 + ADR-006 + the M1-CP1 entry.

### Step 6 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close". The next-session prompt at session close names M1-CP3 (Layer 3 module + ADR-007). Risk class for M1-CP3 = Standard (per-consumer prose generation; new module not yet wired into route).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-005 + ADR-004 §4 read | 25–35 min |
| Step 1 — Surface decisions + draft ADR-006 + founder review | 90–150 min |
| Step 2 — Build `layer2-mechanisms.ts` | 60–90 min |
| Step 3 — Extend harness Phase 3 + 4 + run | 30–45 min |
| Step 4 verify | 15–20 min |
| Decision-log + close | 25–35 min |
| **Total** | **~4–6 hours** |

If Step 1's ADR-006 turns out larger than anticipated (the per-mechanism citations + algorithm detail can be substantial), defer Steps 2 + 3 to M1-CP2b. Founder's call.

## Rollback path

`git revert` of the session's commit reverts: (a) ADR-006 file move (returns ADR-006 to non-existent state); (b) the new `layer2-mechanisms.ts` module (file deleted); (c) the harness extensions (Phase 3 + 4 implementations revert to stubs); (d) the decision-log entry; (e) the close + next-session prompt files. Production state unchanged before and after revert; the route is not touched this session.

## Forecast

If M1-CP2 succeeds: Layer 2 module reaches Verified (standalone). ADR-006 Adopted with citations to canonical Stoic sources. Harness Phases 1–4 operational. M1-CP3 (Layer 3 module + ADR-007) is the next session. Two of three layers proven standalone; M1-CP4's parallel-run wiring becomes the meaningful integration test.

If ADR-006's algorithm reveals that ADR-004 §4.2's high-level approach is insufficient (e.g., the deterministic rules can't capture a mechanism without LLM judgement), ADR-006 surfaces gaps and proposes amendments to ADR-004. Founder decides at CP2 whether to amend ADR-004 in-session (per the ADR-001 in-session refinement pattern) or to defer.

If the harness fails Phase 3 (determinism) or Phase 4 (coverage): the AI surfaces the failure pattern; founder decides whether the failure is in the module (fix in CP2), the algorithm (revise ADR-006), or the schema (rare; would propagate back to ADR-005).

Knowledge-gap watch: the M1-CP1 PR5 candidate ("LLM JSON-key fidelity requires concrete OUTPUT examples") does **not** apply to Layer 2 (no LLM). It re-engages at M1-CP3 when Layer 3's prompt template is drafted. Carry the watch forward.

End of prompt.
