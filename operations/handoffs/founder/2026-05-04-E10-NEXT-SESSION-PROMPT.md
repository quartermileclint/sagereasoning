# Next-Session Prompt — M1-CP1: Layer 1 module (`layer1-extractor.ts`) + ADR-005 (Layer 1 schema specification)

**Stream:** founder.
**Tier:** `code-standard` (new module under `/website/src/lib/translation-sandwich/`; not yet wired into any route; no production effect).
**Governing frame:** `/adopted/standing-protocol-cache.md` (full governance via the cache; deliverable-of-the-day = ADR-004 + the new module file).
**Predecessor session close:** `/operations/handoffs/founder/2026-05-04-sub-session-E10-close.md`.
**Predecessor decision-log entries:** `D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04` (E10 — ADR-004 codification); `D-E9-ADR003-AC8-AND-CACHE-DRIFT-RESOLVED-2026-05-04` (E9 — migration codification).
**Risk classification:** Standard under 0d-ii. Critical Change Protocol **NOT** engaged this session — the Layer 1 module is a new file under `/website/src/lib/translation-sandwich/` and is not imported by any route at session close. No production behaviour change deploys with this commit. PR6 NOT engaged. AC7 NOT engaged. AC5 R20a perimeter NOT touched (the route is unchanged). The Critical Change Protocol engages at M1-CP4 (parallel-run wiring) and M1-CP6 (cutover); not before.

## Why this session matters

ADR-004 named the M1 pilot's wiring shape and the six-checkpoint structure. M1-CP1 is the first build session — the first time the translation-sandwich engine produces any output. Layer 1 is the foundation: every later layer depends on the schema Layer 1 produces. Getting the schema right at CP1 makes CP2 (deterministic mechanism application) tractable; getting it wrong forces rework. CP1 is also the first opportunity to observe LLM behaviour on extraction-only prompts (a mode the bundled-depth engine never tested), generating data the founder may want to act on at CP2 and CP3.

## Pre-conditions

1. Founder pushed E10's four uncommitted files via GitHub Desktop. Working tree clean at session open. Vercel build green confirmation post-push (no behaviour change deploys this commit; build runs but should succeed unchanged).
2. Founder ran the optional `tsc --noEmit -p .` independent verification and confirmed exit 0. Same expected as E9 — no `.ts` file touched at E10.
3. Founder ran the verification listings (four files in `/adopted/adr/`; empty `/drafts/adr/`; two "Approve as drafted" matches in ADR-004). All passed cleanly.
4. Founder availability: 3–5 hours estimated (drafting ADR-005 + writing the module + standalone harness phases 1 + 2 + founder approval). May extend to two sessions if the schema specification turns out larger than expected; defer to M1-CP1b in that case.

## Part A — Open under the protocol

Read in order:

1. `/adopted/standing-protocol-cache.md` (~3 min — confirms tier `code-standard`, model selection per AC1 row "Layer 1 translation (alt-3)" = Sonnet, risk class Standard per 0d-ii, status vocabulary per 0a, signals per 0d).
2. `/operations/handoffs/founder/2026-05-04-sub-session-E10-close.md` (~5 min — predecessor close).
3. `/adopted/adr/2026-05-04-translation-sandwich-pilot-api-reason.md` (ADR-004) **in full** — read §2 (schema redesign), §2.2 (extraction block content categories), §3 (Layer 1 specification), §10 (checkpoints — confirms CP1 deliverables). This is the deliverable-of-the-day.
4. `/operations/decision-log.md` last entry (`D-E10-ADR004-DRAFTED-AND-ADOPTED-2026-05-04`) — read in full.
5. `/website/src/lib/sage-reason-engine.ts` — re-read §"DEPTH CONFIGURATION" + the three `*_SYSTEM_PROMPT` constants. Layer 1's prompt is informed by what the bundled prompts ask the LLM to do; this session's task is to extract just the extraction part, leaving reasoning + prose generation to Layers 2 + 3.
6. `/manifest.md` AC1 (line ~200) + AC8 (line ~281) — re-read. AC1 binds Layer 1's model selection; AC8 binds the migration scope.
7. `/operations/knowledge-gaps.md` — KG1 (Vercel five rules), KG2 (Haiku reliability boundary). Both engage this session: KG1 at any DB writes (none expected for the standalone module — this session is module-only, not route-wired); KG2 at model selection.

Confirm at session open per cache: tier (`code-standard`); hold-point (P0 0h still active); model selection (Sonnet per AC1 row "Layer 1 translation (alt-3)"); status vocabulary (module Scoped → Designed → Scaffolded → Wired → Verified); signals + risk class (Standard); AC7 + AC8 + R20a dispositions (AC7 NOT engaged; AC8 engaged — first build session under the migration; R20a perimeter NOT touched this session — module is not yet wired into any route).

## Part B — Procedure

### Step 1 — Draft ADR-005 (Layer 1 schema field-level specification)

The AI drafts ADR-005 in `/drafts/adr/2026-05-04-layer1-schema-specification.md`. ADR-005 is the field-level specification ADR-004 §2.2 deferred to M1-CP1.

ADR-005 specifies:

- The exact TypeScript type `Layer1Schema` — every field, every nested object, every enum.
- Per-field Layer 1 LLM extraction guidance (what evidence in the input populates the field; what to do when the input is silent on the field).
- The Layer 1 system prompt — extraction-only; no reasoning instructions; explicit schema description; rules for handling ambiguity.
- Max tokens (proposed default in ADR-004 §3.2 = 4000; founder approves at CP1 or revises).
- Temperature (proposed default 0.2 per ADR-004 §3.2; founder approves).
- The standalone fixture set Phase 1 + Phase 2 of the harness will run against (3–5 fixtures of varying complexity).
- Open questions deferred to CP4 (when fixtures from real `/api/reason` traffic are observed against the schema).

The AI surfaces ADR-005's draft for founder review. Founder approves verbatim, requests edits, or defers. Same approval flow as ADR-004.

### Step 2 — Build the Layer 1 module

The AI creates `/website/src/lib/translation-sandwich/layer1-extractor.ts` implementing the contract from ADR-005:

- Module exports `extractFeatures(params: ExtractInput): Promise<Layer1Schema>`.
- Implementation: builds the system message from the Layer 1 prompt (per ADR-005); composes the user message from input + practitioner context + project context per the existing four-layer architecture (AC6); calls Sonnet via the existing Anthropic client; parses the JSON response; validates against `Layer1Schema`; returns the schema or throws a typed error.
- Error handling per ADR-004 §9.1: throws on LLM failure / parse failure / validation failure; the route's wiring at CP4 catches the throw and falls back to bundled-depth.
- KG1 compliance: no module-level cache; per-request cache lifetime (the route at CP4 owns the cache); no fire-and-forget (the function awaits the LLM call before returning); no DB writes this session (module is standalone).
- AC1 + KG2 compliance: model is Sonnet (`MODEL_DEEP`); max-tokens per ADR-005; temperature per ADR-005.

### Step 3 — Build the standalone harness phases 1 + 2

The AI creates `/website/scripts/verify-translation-sandwich.ts` (per ADR-004 §7.1) with Phase 1 (Layer 1 extraction completeness) and Phase 2 (Layer 1 schema fidelity) implemented. Phases 3 through 9 are stubbed with `// TODO: M1-CPN — see ADR-004 §7.2` markers and skipped at this session.

Fixtures: 3–5 input strings of varying complexity (per ADR-005 §"Fixture set"). Each fixture is run through `extractFeatures`; the harness asserts:

- Phase 1: returned schema is non-empty for all required content categories.
- Phase 2: every key in `Layer1Schema` is present (or explicitly marked absent per the schema's optional-field convention).

The AI runs the harness; founder confirms exit 0 + the per-fixture diagnostics look reasonable.

### Step 4 — Verify

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsc --noEmit -p . && echo "tsc clean"
```
Expected: `tsc clean` (the new module compiles without errors).

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website" && npx tsx scripts/verify-translation-sandwich.ts
```
Expected: Phase 1 + Phase 2 pass for all fixtures. Phase 3+ skipped with TODO markers.

```
ls "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/adopted/adr/" | wc -l
```
Expected: 5 (after ADR-005 promotion if approved).

```
grep -n "TODO: M1-CP" "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website/scripts/verify-translation-sandwich.ts"
```
Expected: matches for CP2, CP3, CP4 phase markers.

### Step 5 — Append decision-log entry (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean decision-log entry". ID: `D-M1-CP1-LAYER1-MODULE-AND-ADR005-2026-05-XX` (date stamp at session). Cross-references ADR-004 §10 M1-CP1 + ADR-005.

### Step 6 — Session close (lean form)

Pattern: per `/adopted/standing-protocol-cache.md` §"Lean session close".

The next-session prompt at session close names M1-CP2 (Layer 2 module + ADR-006). Risk class for M1-CP2 = Standard (deterministic code, no LLM, not yet wired into route).

## Part C — Anticipated session shape

| Phase | Estimate |
|---|---|
| Cache + predecessor close + ADR-004 read | 25–30 min |
| Step 1 — Draft ADR-005 + founder review | 60–90 min |
| Step 2 — Build `layer1-extractor.ts` | 45–75 min |
| Step 3 — Build harness Phases 1 + 2 + run | 45–60 min |
| Step 4 verify | 15–20 min |
| Decision-log + close | 25–35 min |
| **Total** | **~3.5–5 hours** |

If Step 1 produces a larger ADR-005 than anticipated (e.g., schema has more fields than ADR-004 §2.2 sketched), defer Steps 2 + 3 to M1-CP1b. Founder's call.

## Rollback path

`git revert` of the session's commit reverts: (a) ADR-005 file move (returns ADR-005 to `/drafts/adr/`); (b) the new `layer1-extractor.ts` module (file deleted); (c) the new `verify-translation-sandwich.ts` harness (file deleted); (d) the decision-log entry. Production state unchanged before and after revert; the route is not touched this session.

## Forecast

If M1-CP1 succeeds: Layer 1 module reaches Verified (standalone). ADR-005 Adopted. Harness Phases 1 + 2 operational. M1-CP2 (Layer 2 module + ADR-006) is the next session.

If M1-CP1's ADR-005 reveals that ADR-004 §2.2's content categories are insufficient: ADR-005 surfaces gaps and proposes amendments to ADR-004. The founder decides at CP1 whether to amend ADR-004 in-session (per the ADR-001 in-session refinement pattern) or to defer the amendment to a separate session.

If the harness fails Phase 1 or Phase 2 against fixtures: the AI surfaces the failure pattern; founder decides whether the failure is in the module (fix in CP1), the schema (revise ADR-005), or the prompt (revise ADR-005's prompt section).

End of prompt.
