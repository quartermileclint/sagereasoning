# Session Close — 2026-07-08 — Trust Layer S0b: the Trust Layer ADR (+ two governance riders)

**Stream:** founder.
**Governing frame:** /adopted/session-opening-protocol.md (cached via /adopted/standing-protocol-cache.md).
**Tier:** `governance` + a `code-elevated` rider (the `direction_of_travel` normalization touched two Live wire values). **AC7 NOT engaged** — no flag / schema / credential / perimeter change; nothing deploys until the founder's push.
**Date:** 2026-07-08.

## Decisions Made
- `D-TRUST-LAYER-S0B-ADR-ADOPTED` appended (+42 lines). **ADR-013 (`adopted/adr/2026-07-08-sage-trust-layer.md`) is Adopted as the design-of-record for the whole Trust Layer arc** — trust definition, the seven specs → slice traceability, the four-layer discernment protocol, the nine mentor answers as binding specifications, the architecture + five elections, the measure→enforce gate state (logos-enforce activation condition discharged; binding enforcement still non-existent until S11's own founder-walked Critical activation), and the R18 honest-claims envelope (weights BLOCKED). **Phase 0 complete.**
- Two governance riders landed: manifest R5 free-tier **100→30** (founder-approved in-session, cache clean); `direction_of_travel` normalized to canonical **`declining`** (E1) at both live trust-layer boundaries (E2) — the M7 overlay + the reflect completion profile — fixing a live reflect docs/wire drift in passing.

## Founder elections at open
- **E1** — canonical `direction_of_travel` = **`declining`** (the engine/D17 form).
- **E2** — **land both boundaries this session** (the recommendation; grounding found the reflect boundary in addition to the M7 overlay named in the prompt).
- **Step 3** — **approve** the manifest R5 100→30 edit.

## Status Changes
| Item | Old | New |
|---|---|---|
| Trust Layer ADR (ADR-013) | Scoped (S0b mandate) | **Adopted** (design-of-record) |
| Trust Layer arc — Phase 0 | S0a discharged; S0b pending | **Complete** (S0a Live + S0b Adopted) |
| manifest R5 free-tier number | "100 calls per month" (stale) | "30 calls per month" (matches the adopted-and-live 30/1/1) |
| `direction_of_travel` (trust-layer wires) | split (`regressing` on the overlay + reflect wires) | **canonical `declining`** at both boundaries; aggregator/record untouched |
| Reflect completion `direction_of_travel` | docs said `declining`, wire forwarded `regressing` (drift) | wire matches the documented contract |
| Capture set (three sources + 9 answers + research) | assumed committed | **verified complete first-hand** |

## Verification Method Used
1. **Step 1 capture verification (first-hand):** `git ls-files` confirmed the three inbox primary sources + the trust-layer-2026-07 records tracked; the nine-answers record read in full (answer-9 tail present); no gap → "verified complete," no re-capture.
2. **Step 4 gates (AI-run):** `direction-of-travel.test.ts` 7/0; `trajectory-overlay.test.ts` 36/0; `response-builders-direction.test.ts` 6/0; `tsc --noEmit` 0; `npm run build` 0 (page.tsx gate honoured). The two untouched-path `regressing` suites (accreditation-store 83/0, hand-back-report 54/0) re-run green.
3. **Step 3 cache-drift check:** grepped the standing-protocol cache for any quoted R5 number → none (the cache references only "PR5", not the free-tier figure); manifest `git diff` shows the single 100→30 change in R5, nothing else.
4. **Adversarial review (first-hand completion):** see below.

## Adversarial Review (Risk Record)
A 4-dimension Workflow (mentor-fidelity / claims-vs-code / overclaim-R18 / diff-correctness) launched; **the account's Fable-5 credit balance ran out** after 2 of 4 finders (12/14 agents errored). Per the §4 precedent the two dead dimensions were **completed first-hand on Opus** — both **CLEAN** (manifest/docs diffs scoped exactly; no missed trust-layer boundary — the V3 assessment routes carry their own independent `regressing` vocabulary, not the aggregator's; the 3 other `regressing` tests are on the untouched record/store path; the docs/wire drift + the `<10→stable` aggregator threshold verified against git history + `window-aggregator.ts:342`). The two completed dimensions surfaced **10 findings — 1 medium, 4 low, 5 nit, none critical/high — ALL confirmed first-hand against the sources + ALL folded into the ADR** (spec-6 aggregation rule; three spec-7 prose constraints; the A2 domain-scope qualifier; the L4 dispositions + recommendation formula; the spec-3 decrease magnitude; the Q1.2 ambiguity; the Q1.3 A2-supersession note; the A3 per-function-type unit; §1 Gate-1 status precision; §7 R20c slice-anchoring). Every fold a fidelity/status-honesty improvement to the design-of-record; no code correctness issue was raised (diff-correctness came back clean).

## PR5 Knowledge-Gap Carry-Forward
KG1 N/A (no DB writes). KG-EX1 honoured (the ADR is design-of-record, not a benchmark; purpose+observable held). The cache update discipline was engaged for the manifest R5 edit (drift check run, clean). No new KG.

## Next Session Should
**S1 — trust state + event vocabulary** (`code-critical`: new schema + data rights; its own founder-walked 0c-ii for the migration). The ADR is its design surface; S1 inherits the canonical `direction_of_travel` vocabulary and the R18f-parallel trust-event rule. S2/S3 parallelizable after S1. A next-session prompt is not yet authored (the founder sequences P1's start).

## Blocked On
**Files remaining uncommitted (this session's commit set):**
- `adopted/adr/2026-07-08-sage-trust-layer.md` (NEW)
- `manifest.md`
- `website/src/lib/substrate/direction-of-travel.ts` (NEW)
- `website/src/lib/substrate/trajectory-overlay.ts`
- `website/src/app/api/practice/reflect/response-builders.ts`
- `website/public/llms.txt`
- `website/src/app/api-docs/page.tsx`
- `website/src/lib/substrate/__tests__/direction-of-travel.test.ts` (NEW)
- `website/src/lib/substrate/__tests__/trajectory-overlay.test.ts`
- `website/src/app/api/practice/reflect/__tests__/response-builders-direction.test.ts` (NEW)
- `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-NEXT-SESSION-PROMPT.md` (SPENT marker)
- `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-CLOSE.md` (NEW — this file)
- `operations/decision-log.md` (appended)
- `CLAUDE.md` (PR18 refresh)

**Production state at session close:** byte-equivalent until the founder's push. On push, Vercel deploys: the manifest edit (not user-facing); the `direction_of_travel` boundary normalization (two Live agent-facing wire values change `regressing`→`declining` — prospective: the aggregator emits `stable` below ≥10 actions, so `regressing` was very likely never emitted live; and the reflect wire is brought into the value its docs already publish); and the two reflect-completion doc-enum tightenings. `SUBSTRATE_CORROBORATION_CHECK_ENABLED` + `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` remain `true` (untouched). R18f / R20a / distress / Layer-2 signing / UPC auth untouched.

## Open Questions
None blocking. Named S1 inputs (carried in the ADR, not debts): the persisted accreditation `direction_of_travel` stays `regressing` as the documented legacy exception until a separate deliberate migration; the dogfood-credential rotation (from the activation close) still gates any `/sage-on` re-enable.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/website"
npx tsx src/lib/substrate/__tests__/direction-of-travel.test.ts
npx tsx src/lib/substrate/__tests__/trajectory-overlay.test.ts
npx tsx src/app/api/practice/reflect/__tests__/response-builders-direction.test.ts
npx tsc --noEmit && npm run build
```
Expected: `7 passed, 0 failed` / `36 passed, 0 failed` / `6 passed, 0 failed`; tsc 0; build 0. Then commit the file list above and push via GitHub Desktop. Post-push spot-check (optional): `curl -s https://www.sagereasoning.com/llms.txt | grep -n "direction_of_travel"` → the reflect-completion line reads `improving|stable|declining`.

## Rollback
`git revert` the session commit — documents + one pure boundary mapper. The ADR / manifest line / normalization are independently revertable; nothing live changes until the push; the only push-time behaviour change is the disclosed reflect/overlay wire value.

## Orchestration Reminder
Phase 0 of the Trust Layer arc is complete. S1 is `code-critical` (its own 0c-ii for the schema migration). Weights BLOCKED throughout; the 0h call remains the founder's.

## Cross-references
- `operations/handoffs/founder/2026-07-08-corroboration-check-activation-CLOSE.md` (predecessor close)
- `operations/handoffs/founder/2026-07-08-trust-layer-S0b-ADR-NEXT-SESSION-PROMPT.md` (the executed prompt, SPENT)
- `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 — the deliverable)
- `operations/trust-layer-2026-07/trust-layer-build-plan.md` (S1 next)
- `D-TRUST-LAYER-S0B-ADR-ADOPTED`

*End of session close. Phase 0 stands complete: the Trust Layer ADR is the design-of-record the P1–P4 slices cite, the capture set is verified, the two governance debts are cleared, and the vocabulary boundary is fixed before S1 builds on it.*
