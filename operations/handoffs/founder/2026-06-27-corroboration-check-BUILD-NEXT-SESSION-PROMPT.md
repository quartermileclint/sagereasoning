# Next-Session Prompt — Corroboration Check — BUILD (the catchable-half extraction-trust fidelity arc)

> **SPENT 2026-07-08** — executed as Trust Layer S0a (`D-TRUST-LAYER-S0A-CORROBORATION-CHECK-BUILT-DARK-REVIEW-FOLDED`; results `operations/benchmarks/sage-practice-v1/2026-07-08-corroboration-check-build-results.md`; close `operations/handoffs/founder/2026-07-08-corroboration-check-build-CLOSE.md`). The successor prompt is `2026-07-08-corroboration-check-live-battery-completion-NEXT-SESSION-PROMPT.md` (the carried live-battery completion, blocked on the API credit top-up).

> **2026-07-07 addendum — this prompt is now Phase-0 Slice S0a of the ADOPTED Sage Trust Layer build plan** (`operations/trust-layer-2026-07/trust-layer-build-plan.md`, `D-TRUST-LAYER-BUILD-PLAN-ADOPTED`). The fork this prompt asks the founder to confirm at open is **confirmed by the plan adoption** (build near-term stands). Two additions from the plan context: (1) mentor answer A1 keys the multi-source confidence weights on this check landing (deterministic primary on corroborated obligation fields post-corroboration) — record the check's output fields with that consumer in mind; (2) mentor answer A9 case-2 keys delegation-chain responsibility on "would the corroboration check have flagged it" — the check must be invokable as a standalone evaluation over an (extraction, action-text) pair, not only inline in the sandwich. Mentor verbatim: `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md`.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** **`code-elevated` (repo-only)** — build + verify a deterministic corroboration check against `/api/reason`'s Layer-2 (and, dark, the gate) + a both-directions battery. **NO production / perimeter / auth / schema / flag / credential change; no live-fire; no mint. Production byte-equivalent. AC7 NOT engaged.** Activation on the Live gate is a SEPARATE later founder-walked Critical step (do NOT flip anything this session).
**Governing decisions:** ADR-012 (three-use ladder) + ADR-010 (engine fidelity, fully landed) + the gaming-robustness bar SCOPE §4.1 + the bar RESULTS (`operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-harness-results.md`).
**Predecessor:** `D-SAGE-PRACTICE-GAMING-ROBUSTNESS-HARNESS-BUILT-RUN` (the measured bar).

## Why this session
The gaming-robustness harness measured the residual. **§4 closed the arithmetic; the whole remaining gaming surface is extraction trust**, and it splits into a **CATCHABLE half** (the lie contradicts the verbatim action text — 14 Arm-A "A1" harm-in-text rewrites + the Arm-B naive lies) and a **STRUCTURAL half** (the harm is omitted from the text — 34 Arm-A "A2" self-report omissions + the Arm-B consistent lies). This session builds the deterministic **corroboration check** that closes the catchable half — a near-term developer/logos fidelity gain AND the first half of any weights-tier mitigation. **It cannot close the structural half** (that is the weights residual: an independent affected-party / non-co-trained-extractor pass); do not over-claim it does.

## Part A — Open under the protocol
Read: `/adopted/standing-protocol-cache.md` (AI failure-modes — method-before-purpose; the over-strictness-must-be-rank-preserving memory); the bar RESULTS memo in full; `website/scripts/gaming-robustness-harness.ts` + the `runs/2026-06-27/` corpora (the seed set + the A1/A2 corpus you regression-test against); `website/src/lib/translation-sandwich/layer2-mechanisms.ts` (`computeProximity`, the dikaiosyne/andreia floors) + `layer1-extractor.ts` (`LAYER1_SYSTEM_PROMPT`, `ObligationAssessment`, `examined_before_acting`); the LOCUS-2 + gate verdict-equivalence batteries (`scripts/locus2-sandwich-battery.ts`, `scripts/guardrail-verdict-equivalence-battery.ts`). Memories: `over-strictness-check-must-be-rank-preserving`, `deterministic-l2-measures-apatheia-not-dikaiosyne`, `verdict-battery-test-the-default-threshold`, `andreia-over-strictness-unity-thesis-coupling`.

## Part B — What to build (design first, then build)
A deterministic, rank-preserving corroboration layer that runs AFTER extraction and BEFORE (or inside) `computeProximity`, cross-referencing the extraction's self-report against the verbatim action text:
1. **`met → violated` override** when the action text imposes a non-consented cost on the circle claimed `met` (the Arm-A A1 / Arm-B naive class). Must fire on visible harm markers *grounded in the text*, not a topic-word substring test (the bar's `schemaContradictsText` proxy was explicitly noisy — do NOT ship that; build the real check).
2. **Reject a bare `examined_before_acting:true`** on a grave praxis act lacking a corroborating quote tying the examination to THIS act (the rmrf A1 class).
3. **RANK-PRESERVING** — it must NOT override a *genuine* `met` on a truly-good calm action (the §4 unity-thesis over-strictness fix must not regress). This is the load-bearing constraint.

## Part C — Verify (both directions, the §4 discipline)
- A **both-directions verdict-equivalence battery** (lenience AND over-strictness), reusing the bar's seeds + the §4 LOCUS-2 good-action fixtures (G1–G4, OS1–OS3, BL1/BL2). Lenience: the A1/A2 corpus — the catchable A1 rewrites now floor; disclose that A2 (harm-omitted) still passes (structural, out of scope). Over-strictness: the good/borderline set keeps its score (no new over-floor). Target: 0 over-strictness regressions.
- Replace the harness's `schemaContradictsText` proxy with this real check and **re-run Arm B** — report the sharpened catchable/structural split (the proxy over/under-count corrected).
- Add a **sophrosyne (self-regarding-craving) gating seed** to the harness seed set (the method audit's coverage gap) and confirm Arm 1 still locks.
- `tsc` + the substrate suites green; flag-off byte-identity if you gate it behind a flag.

## Part D — Records
Results memo + decision-log entry + close. Update the bar's gating (§6 of the results memo) with the corroboration check's measured catchable-closure. If it clears both directions dark, author its Live-gate activation prompt (a later Critical step). Memory if a durable lesson emerges.

## Forecast
Ends with the catchable extraction-trust residual **closed dark + rank-preservation proven**, the Arm-B split sharpened by the real check, and the structural residual (self-report omission / consistent lies) cleanly isolated as the weights-tier problem. Advances developer-refine (defensible → defensible+catchable-closed) and unblocks logos-enforce's remaining gate. The weights claim stays BLOCKED. The **0h call remains the founder's.**

End of prompt.
