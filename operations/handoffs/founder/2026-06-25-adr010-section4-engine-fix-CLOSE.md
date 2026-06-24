# Session Close — 2026-06-25 — ADR-010 §4 Engine Root-Fix (native dikaiosyne weighting in `computeProximity`)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md (substrate-build session).
**Tier:** `code-critical` — the shared `/api/reason` deterministic engine. **Built DARK, flag-gated; flag-off byte-identical (test-asserted); production byte-equivalent to session open. AC7 NOT engaged** (no mint / Supabase / Vercel / git op; the AI performed no live step). Full Critical Change Protocol discharged.
**Date:** 2026-06-25.
**Governing decisions:** ADR-010 §4 + ADR-012 + the build spec `2026-06-24-adr010-section4-engine-fix-scope.md`.

## What happened
Built the **ADR-010 §4 root correction** the predecessor battery scoped: `computeProximity` now weights **dikaiosyne natively** (per-domain proximity + the KP-04 unity-thesis minimum + obligation-resolution as a required oikeiosis field, Change-2 **route 2a**), plus the **D4** `hasDeliberation`-proxy fix — all **flag-gated behind the NEW `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`** (default OFF ⇒ byte-identical to pre-§4). A calmly-reasoned injustice now floors to `reflexive` (apatheia **+3.0 → +0.0**); a gamed-by-kathekon-count injustice no longer reaches `sage_like` (closed 3/3); the deterministic assent gate blocks the grave cases natively (6 → 0) — so the LLM justice bridge can retire (after a LOCUS-2 equivalence proof). Genuinely-good actions keep their high scores (over-strictness PASS 0/8 + 1 disclosed ceiling at LOCUS-1). **Two adversarial passes** ran: Pass 1 (ultracode, 33 agents) — no critical, no flag-off safety break; Pass 2 (fold-verification, 5 agents, ran the code) — `all_hold:true, any_refuted:[]`, and it **caught that Pass 1's andreia fold had introduced an unsafe under-strictness bypass**, which was then **reverted to the conservative floor** (any carried-out grave act → reflexive; no bypass) with the over-strictness now a disclosed ceiling (OS3) + a no-bypass control (P4c). **The engine itself does not change in production — the flag is unset.**

## Decisions Made
- `D-SAGE-PRACTICE-ADR010-SECTION4-ENGINE-FIX-BUILT-DARK-TEST-VERIFIED` appended (full Critical entry). ADR-010 §4 build record + bridge-retirement gate appended to the ADR.

## Status Changes
| Item | Old | New |
|---|---|---|
| ADR-010 §4 root correction | Scoped (build spec) | **BUILT (Wired + TEST-Verified, DARK)** behind `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` |
| `computeProximity` dikaiosyne | absent (apatheia only; +3 leak) | **native per-domain + KP-04 minimum + obligation resolution** (flag-on) |
| D4 `hasDeliberation` proxy | unsound (filler counts) | **fixed (narrow, proximity-only)** flag-on |
| Scoring-validity battery | one-direction (lenience) | **both directions** (lenience closed + over-strictness held) + 2 disclosed LOCUS-1 ceilings |
| Guardrail justice bridge (ADR-010 §3) | Live; "retires when §4 lands" | Live; **retirement GATED on a LOCUS-2 coverage-equivalence proof** (the trigger-narrowing finding) |

## Next Session Should
Run the **§4 activation + the full-sandwich LOCUS-2 battery** (`code-critical`, founder-walked 0c-ii) per `operations/handoffs/founder/2026-06-25-adr010-section4-activation-and-locus2-battery-NEXT-SESSION-PROMPT.md`: (1) land the Layer-1 `obligation_assessment` extraction-prompt change (route 2a) — **a hard prerequisite**, else flag-on over today's extraction over-floors every circle-engaged good action to reflexive; (2) run the full-sandwich verdict-equivalence battery on the real Layer-1 LLM (the over-strictness direction on real extractions + role-framed-injustice circle-surfacing — LOCUS 2); (3) decide the guardrail coupling (retire the bridge same-deploy / add a both-flags-on test / decouple via an explicit option); (4) set the flag + redeploy + a live `/api/reason` smoke + publish the R18 contract; (5) retire the §3 bridge ONLY after the LOCUS-2 coverage-equivalence proof (the role-only circle-free class, P5e, demonstrably covered).

## Blocked On
**Files to commit (this session's deliverables — commit scoped to these; do NOT `git add -A`):**
- `website/src/lib/translation-sandwich/layer1-extractor.ts`
- `website/src/lib/translation-sandwich/layer2-mechanisms.ts`
- `website/src/lib/translation-sandwich/__tests__/proximity-dikaiosyne.test.ts` (new)
- `website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts`
- `website/scripts/scoring-validity-fixtures.ts`
- `website/scripts/scoring-validity-battery.ts`
- `adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`
- `operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-engine-fix-build-results.md` (new)
- `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md` (reconciliation note)
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-25-adr010-section4-engine-fix-CLOSE.md` (this file)
- `operations/handoffs/founder/2026-06-25-adr010-section4-activation-and-locus2-battery-NEXT-SESSION-PROMPT.md` (new)
- `CLAUDE.md`

**Do NOT commit:** the many pre-existing `M`/`??` working-tree files from prior sessions (not this session's); `s6-phase2-scratch/`; memory files (outside the repo).

**Production state at session close:** **byte-equivalent to session open.** `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` is UNSET everywhere; the Layer-1 prompt is unchanged; `computeProximity` flag-off is byte-identical (test-asserted). The Live §3 guardrail bridge, the standing `pre_decision_harness` dogfood marker, the LIVE H1/H2 install, R18f/R20a/distress/Layer-2 signing/UPC auth — all untouched.

## Open Questions
- The guardrail-consumer coupling (explicit option vs shared env default) — a founder election for the activation session (the shared env flag auto-activates the Live `/api/guardrail` gate alongside `/api/reason`; monotonic-safe, no fail-open, but untested both-on).
- The D3 epistemic-accuracy scoping bound — to be stated in the public-contract language whenever the profile is surfaced (R18), at activation.

## Verification Method Used
- The scoring-validity battery **run first-hand, both directions** (`npx tsx scripts/scoring-validity-battery.ts`): baseline `MACHINE_BASELINE` reproduces the predecessor (apatheia +3.0, gamed→sage_like); `MACHINE_POSTFIX` shows apatheia +0.0, gaming closed 3/3, over-strictness PASS 0/8 (+1 disclosed ceiling OS3), grave assent 6→0.
- `proximity-dikaiosyne.test.ts` **42/0**; `layer1-schema-additions.test.ts` **59/0**; canonical 15/0, signer 14/0, verifier 18/0, reason-loop-closure 33/0, tier1-continuation 42/0, prose-deferral 26/0, injection-defence 57/0 (flag-off byte-identity preserved). `tsc --noEmit` 0; `npm run build` ✓ Compiled successfully (run three times — across both fold rounds).
- Every load-bearing change traced first-hand against `layer2-mechanisms.ts` / `layer1-extractor.ts` (PR11).
- **Two ultracode adversarial passes.** Pass 1 — pre-activation review (33 agents, ~6.9M tokens): flag-off byte-identity HOLDS (git-diff + 895,968-schema monotonicity sweep), no critical. Pass 2 — fold-verification (5 agents, ran the code; prompted by the user after Pass 1's per-finding refuters were partly cut off by a session API limit): `all_hold:true, any_refuted:[]`; independently re-confirmed byte-identity (2,400-case sweep, 0 violations) AND **caught a real defect Pass 1's andreia fold had introduced** (an unrelated-synkatathesis under-strictness bypass) → reverted to the conservative floor + disclosed ceiling (OS3) + the no-bypass control (P4c). Both passes' folds applied + re-verified.

## Risk Classification Record
**Critical** under 0d-ii — shared `/api/reason` determinism (`computeProximity`). Built DARK + flag-gated; flag UNSET ⇒ production byte-equivalent; flag-off byte-identity test-asserted. **AC7 NOT engaged** (no live-fire/mint/deploy). PR6 engaged (shared determinism) — discharged via the Critical Change Protocol (dark build + both-direction battery + adversarial review; activation a separate founder-walked 0c-ii). Reversed by `git revert` of the build commit.

## PR5 Knowledge-Gap Carry-Forward
- **The §4 fix is LOCUS-1 only.** Flag-on over **today's** Layer-1 extraction (which does not yet emit `obligation_assessment`) would over-floor every engaged-circle good action to reflexive — so the **Layer-1 prompt change is a hard activation prerequisite**, and the over-strictness PASS is a LOCUS-1-conditional claim until the full-sandwich LOCUS-2 battery measures it on real extractions.
- **The native dikaiosyne trigger is narrower than the §3 bridge** it retires (role-only circle-free injustice un-floored at LOCUS-1 — indistinguishable from a prudential role action without an obligation field). **Do not retire the bridge** until a LOCUS-2 coverage-equivalence proof.
- **The §4 env flag is shared** — one flip activates both `/api/reason` and the Live `/api/guardrail` gate (monotonic-safe; untested both-on).
- The deterministic L2 still measures **apatheia + justice structure, not factual correctness** (D3) — an R18 public-contract scoping bound.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/lib/translation-sandwich/layer1-extractor.ts website/src/lib/translation-sandwich/layer2-mechanisms.ts website/src/lib/translation-sandwich/__tests__/proximity-dikaiosyne.test.ts website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts website/scripts/scoring-validity-fixtures.ts website/scripts/scoring-validity-battery.ts adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-engine-fix-build-results.md operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md operations/decision-log.md operations/handoffs/founder/2026-06-25-adr010-section4-engine-fix-CLOSE.md operations/handoffs/founder/2026-06-25-adr010-section4-activation-and-locus2-battery-NEXT-SESSION-PROMPT.md CLAUDE.md
git commit -m "ADR-010 §4 engine root-fix (native dikaiosyne weighting in computeProximity): per-domain proximity + KP-04 minimum + obligation resolution (route 2a) + D4 hasDeliberation fix, built DARK behind SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED (flag-off byte-identical, test-asserted). Battery both directions: apatheia +3.0->+0.0, gaming closed 3/3, over-strictness PASS 0/8 + 1 disclosed ceiling (LOCUS-1), grave assent 6->0. Two adversarial passes (33-agent review + 5-agent fold-verification); fold-verification caught an andreia under-strictness bypass -> reverted to the conservative floor + disclosed OS3 ceiling + no-bypass control P4c. Folds: trigger-narrowing + LOCUS-1-conditional disclosure; validator/multi-circle tests. Production byte-equivalent; AC7 not engaged; activation + bridge-retirement are founder-walked successors.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Then push via GitHub Desktop. **No Vercel behaviour change expected** (the flag is unset; the engine is byte-identical flag-off; the docs + scripts are inert). **Do not** `git add -A`.

## Orchestration Reminder
No credentials minted; nothing standing changed; production byte-equivalent. The §4 activation (next session) is **`code-critical`, founder-walked** — it lands the Layer-1 prompt change, runs the full-sandwich LOCUS-2 battery, flips the flag, and (only after a coverage-equivalence proof) retires the §3 bridge. The **0h launch call remains the founder's.**

## Cross-references
- `operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-engine-fix-build-results.md` (build results)
- `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md` (the spec + reconciliation)
- `operations/handoffs/founder/2026-06-25-adr010-section4-activation-and-locus2-battery-NEXT-SESSION-PROMPT.md` (next session)
- `operations/handoffs/founder/2026-06-24-scoring-validity-battery-CLOSE.md` (predecessor)
- `adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md` (ADR-010 §4) + `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` (ADR-012)
- `operations/decision-log.md` → `D-SAGE-PRACTICE-ADR010-SECTION4-ENGINE-FIX-BUILT-DARK-TEST-VERIFIED`

*End of session close. The engine measures Stoic virtue (incl. justice) natively, not Stoic temperament — built dark, flag-gated, adversarially reviewed, ready for a founder-walked activation after the Layer-1 prompt change + the full-sandwich LOCUS-2 battery. Production is byte-equivalent; the 0h call remains the founder's.*
