# Session Close — 2026-06-25 — ADR-010 §4 Activation-Prep (Layer-1 prompt landed + LOCUS-2 measured + over-strictness fixed)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md (substrate-build session).
**Tier:** `code-critical` — shared `/api/reason` engine + the Live `/api/guardrail` gate's extraction. **Repo-only: the prompt change is additive + flag-off byte-identical (Layer-2 ignores the new fields flag-off, test-asserted); `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` remains UNSET ⇒ production scoring byte-equivalent. AC7 NOT engaged** (no flag flip / deploy / mint; the AI performed no live op). Full Critical Change Protocol discharged.
**Date:** 2026-06-25.
**Governing decisions:** ADR-010 §4 + ADR-012 + the §4 build-results §5 activation checklist.

## What happened
Executed the §4 dark build's named activation prerequisites. **Founder elections at open (AskUserQuestion):** decouple the guardrail + the repo-only build + LOCUS-2 battery + review (founder walks the flag flip); mid-session, on a surfaced andreia over-strictness, **"find a solution now."**

1. **Layer-1 prompt change (route 2a) — LANDED.** `LAYER1_SYSTEM_PROMPT` now emits per-circle `obligation_assessment {status, justification}` (surfacing the AFFECTED-party circle even under role framing + an anti-rubber-stamp guard) + the andreia urgency stage-link (`stage` + `examined_before_acting`). Additive + flag-off byte-identical. A two-exception carve-out reconciles the feature-extraction-only header.
2. **Guardrail DECOUPLE.** `guardrail-sandwich.ts` pins `applyMechanisms(schema, { dikaiosyneWeighting: false })` so the §4 flag flip activates native weighting on `/api/reason` ONLY; the Live gate keeps the §3 bridge. The prompt change is unconditional (ships on deploy) and reaches the gate's extraction — the **mandatory gate verdict-equivalence battery was re-run against the new prompt and CLEARED** (0 unsafe leaks; equal-or-more-conservative).
3. **LOCUS-2 full-sandwich battery (real Sonnet extraction).** Built `scripts/locus2-sandwich-battery.ts` (extract once → applyMechanisms off-vs-on; rank-preservation over-strictness check; borderline probes; N=3). Cleared both directions on real extractions.
4. **Adversarial pre-activation review (20-agent workflow): GO_WITH_FIX → all folded.** Caught a **HIGH andreia stage-less bypass** (the global `enriched` switch let a decoy skip a stage-less rash act — the predecessor-reverted class via a new trigger) and the **over-strictness blind spot** (the lenient `>= deliberate` check). Both fixed.
5. **The over-strictness residual — FIXED at the engine level (the unity-thesis coupling).** The hardened battery (N=3 + rank-preservation) revealed a real over-floor of a justified urgent GOOD act (G4 "immediately rotated leaked creds to protect customers" → reflexive via the andreia floor). Fix: `computeProximity` suppresses the andreia floor when `dik === 'sage_like'` (a grave act that honours justice toward every affected party is courage, not rashness — the unity thesis). Resolved G4 AND the LOCUS-1 OS3 ceiling, WITHOUT loosening the gameable `examined` boolean.

**Honest arc:** the first LOCUS-2 run (N=2, lenient check) read CLEAN but was a FALSE-PASS (G4's over-floor hidden) → the review caught the bypass + blind spot → the hardened battery exposed G4 → the coupling fixed it → the re-run confirmed clean. The process worked.

## Decisions Made
- `D-SAGE-PRACTICE-ADR010-SECTION4-LOCUS2-AND-PROMPT-LANDED` appended (full Critical entry). ADR-010 §4 activation-prep record + changelog appended.

## Status Changes
| Item | Old | New |
|---|---|---|
| Layer-1 prompt (route 2a obligation + andreia stage-link) | unchanged (field hand-authored on fixtures) | **LANDED** (additive, flag-off byte-identical) |
| `/api/guardrail` ↔ §4 flag | coupled (shared env default) | **DECOUPLED** (`dikaiosyneWeighting:false` pinned; INV-15) |
| `computeAndreiaFloor` | global `enriched` switch (bypassable) | **per-indicator** (stage-less ⇒ conservative; no-bypass) |
| andreia over-strictness (OS3 / urgent-good acts) | disclosed conservative ceiling | **RESOLVED** by the unity-thesis coupling (`dik=sage_like` ⇒ suppress) |
| LOCUS-2 over-strictness on real extractions | LOCUS-1-conditional (unmeasured) | **measured + PASS** (N=3, rank-preserving) |
| §4 flag flip | named prerequisite | **founder-walked successor** (prerequisites MET) |

## Next Session Should
Run the **§4 flag flip** (`code-critical`, founder-walked 0c-ii) per `operations/handoffs/founder/2026-06-25-adr010-section4-FLAG-FLIP-ACTIVATION-NEXT-SESSION-PROMPT.md`: deploy the code (gate held safe — re-confirm the gate battery if desired) → set `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` + redeploy → live `/api/reason` smoke (a calm injustice → reflexive; a good action keeps its score) → publish the R18 contract (`proximity_floors` + `obligation_assessment` + the D3 scoping bound). **Bridge retirement (Step 5) is GATED on a higher-N (≥5–10) LOCUS-2 run** — the decouple means it is never forced. Run a **higher-N over-strictness pass** before the flip (the over-strictness now rests on the extractor reading a good action's obligations as `met`).

## Blocked On
**Files to commit (this session's deliverables — commit scoped to these; do NOT `git add -A`):**
- `website/src/lib/guardrail-sandwich.ts`
- `website/src/lib/translation-sandwich/layer1-extractor.ts`
- `website/src/lib/translation-sandwich/layer2-mechanisms.ts`
- `website/src/lib/translation-sandwich/__tests__/proximity-dikaiosyne.test.ts`
- `website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts`
- `website/src/lib/__tests__/guardrail-sandwich.test.ts`
- `website/scripts/locus2-sandwich-battery.ts` (new)
- `website/scripts/scoring-validity-battery.ts`, `website/scripts/scoring-validity-fixtures.ts`
- `adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`
- `operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-results.md` (new) + the 4 raw-run evidence `.txt` files (new)
- `operations/decision-log.md`
- `operations/handoffs/founder/2026-06-25-adr010-section4-locus2-and-prompt-CLOSE.md` (this file) + `…-FLAG-FLIP-ACTIVATION-NEXT-SESSION-PROMPT.md` (new)
- `CLAUDE.md`

**Do NOT commit:** the pre-existing `M`/`??` working-tree files from prior sessions (`environmental-context.json`, `tsconfig.tsbuildinfo`, `s6-phase2-scratch/`, the older benchmark runs, etc.); memory files (outside the repo).

**Production state at session close:** **byte-equivalent to session open** (scoring). `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` is UNSET; flag-off Layer-2 is byte-identical (the new prompt fields are inert flag-off, test-asserted). The Live §3 guardrail bridge, the standing `pre_decision_harness` dogfood marker, the LIVE H1/H2 install, R18f/R20a/distress/Layer-2 signing/UPC auth — all untouched. **On the founder's push, the Layer-1 prompt change goes Live in extraction** (the gate's extraction shifts equal-or-more-conservative — gate battery confirmed; the §4 scoring stays dark until the flag flip).

## Open Questions
- The higher-N over-strictness + bridge-retirement runs (before the flip / before retirement) — prudent, not blocking the `/api/reason` flip.
- The `examined_before_acting` + all-`met` gameable surfaces — the model-creator/weights-tier prerequisite (corroboration); post-decouple they reach only the profile, never the gate.

## Verification Method Used
- The **hardened LOCUS-2 battery** run first-hand (N=3, real Sonnet) — `gate_ok:true, over_strictness_fails:0, lenience_fails:0, bridge_retirement_equivalence_ok:true`; G4 resolved (`off=deliberate on=deliberate` ×3 via the coupling).
- The **gate verdict-equivalence battery** re-run against the new prompt — 0 drifts / 0 unsafe leaks.
- `proximity-dikaiosyne.test.ts` 59/0; `layer1-schema-additions` 66/0; `guardrail-sandwich` 135/0 (+INV-15a/b/c); LOCUS-1 battery over-strictness PASS 0/9 (zero ceilings), gaming 3/3, apatheia +0.0 (MACHINE_BASELINE reproduces the predecessor); the signer/canonical/verifier/loop-closure/tier1/prose-deferral/injection byte-identity suites + 7 consumer suites green; `tsc --noEmit` 0; `npm run build` ✓ Compiled successfully.
- **20-agent adversarial pre-activation review** (6 dimensions → per-finding adversarial refutation → completeness critic): GO_WITH_FIX; every confirmed finding folded + re-verified first-hand (the HIGH andreia bypass reproduced through the real `applyMechanisms` path, then fixed + locked).
- Every load-bearing change traced first-hand against `layer2-mechanisms.ts` / `layer1-extractor.ts` / `guardrail-sandwich.ts` (PR11).

## Risk Classification Record
**Critical** under 0d-ii — shared `/api/reason` determinism + the Live `/api/guardrail` gate's extraction. **The §4 scoring is flag-gated + UNSET (flag-off byte-identical, test-asserted); the prompt change is additive (inert in flag-off Layer 2) and its effect on the Live gate is equal-or-MORE conservative (gate battery: 0 unsafe leaks).** AC7 NOT engaged (no flag flip / deploy / mint). PR6 engaged (shared determinism + the Live gate) — discharged via the full Critical Change Protocol (decouple + both batteries + the 20-agent review folded; flag flip a separate founder-walked 0c-ii). Reversed by `git revert` of the commit.

## PR5 Knowledge-Gap Carry-Forward
- **A false-pass is the failure mode to fear in a measurement-fidelity battery.** The N=2 lenient `>= deliberate` over-strictness check passed while broken (G4 over-floor hidden); the hardened rank-preservation check at N=3 caught it. Lesson saved to memory.
- **The unity-thesis coupling is the principled andreia over-strictness fix** (suppress courage-deficiency when justice toward all affected is fully met) — and it does NOT add a new gaming class beyond the existing lying-met ceiling. Saved to memory.
- **Over-strictness now rests on the extractor reading a good action's obligations as `met`** — a higher-N run is prudent before the flip; do NOT weaken J1 (an absent obligation reading reflexive is the lenience safety property).
- The prompt change is **unconditional** (Live-on-deploy) and reaches the Live gate's extraction — re-run the gate verdict-equivalence battery before/at any deploy that changes the prompt (done this session).

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add website/src/lib/guardrail-sandwich.ts website/src/lib/translation-sandwich/layer1-extractor.ts website/src/lib/translation-sandwich/layer2-mechanisms.ts website/src/lib/translation-sandwich/__tests__/proximity-dikaiosyne.test.ts website/src/lib/translation-sandwich/__tests__/layer1-schema-additions.test.ts website/src/lib/__tests__/guardrail-sandwich.test.ts website/scripts/locus2-sandwich-battery.ts website/scripts/scoring-validity-battery.ts website/scripts/scoring-validity-fixtures.ts adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-results.md operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-run.txt operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-rerun-hardened.txt operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-FINAL-coupling.txt operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-gate-verdict-equivalence-rerun.txt operations/decision-log.md operations/handoffs/founder/2026-06-25-adr010-section4-locus2-and-prompt-CLOSE.md operations/handoffs/founder/2026-06-25-adr010-section4-FLAG-FLIP-ACTIVATION-NEXT-SESSION-PROMPT.md CLAUDE.md

git commit -m "ADR-010 §4 activation-prep: Layer-1 prompt landed (route-2a obligation_assessment + andreia stage-link), guardrail DECOUPLED, LOCUS-2 battery + gate battery cleared, 20-agent review folded; over-strictness residual fixed by the unity-thesis coupling. Flag-off byte-identical; SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED unset; production scoring byte-equivalent; AC7 not engaged; flag flip is the founder-walked successor.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Then push via GitHub Desktop. **On push: the Layer-1 prompt change goes Live in extraction** (the gate's extraction shifts equal-or-more-conservative — gate battery confirmed; the §4 scoring stays dark, flag unset). **No scoring behaviour change** until the flag flip (the founder-walked successor). **Do not** `git add -A`.

## Orchestration Reminder
No credentials minted; nothing standing changed; production scoring byte-equivalent. The §4 flag flip (next session) is **`code-critical`, founder-walked** — deploy → flag flip → live smoke → R18 contract; the §3 bridge retires only after a higher-N equivalence proof. The **0h launch call remains the founder's.**

## Cross-references
- `operations/benchmarks/sage-practice-v1/2026-06-25-adr010-section4-locus2-battery-results.md` (results) + the 4 raw-run `.txt` evidence files
- `operations/handoffs/founder/2026-06-25-adr010-section4-FLAG-FLIP-ACTIVATION-NEXT-SESSION-PROMPT.md` (next session)
- `operations/handoffs/founder/2026-06-25-adr010-section4-engine-fix-CLOSE.md` (predecessor / the dark build)
- `adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md` (ADR-010 §4 activation-prep record) + `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` (ADR-012)
- `operations/decision-log.md` → `D-SAGE-PRACTICE-ADR010-SECTION4-LOCUS2-AND-PROMPT-LANDED`

*End of session close. The engine measures Stoic virtue (justice + courage) natively, the Layer-1 prompt now feeds it, the LOCUS-2 extraction dependency is measured + cleared on real extractions, the Live gate is held safe + decoupled, and the urgent-good-act over-floor is resolved by the unity-thesis coupling — built repo-only, flag-off byte-identical, adversarially reviewed, ready for a founder-walked flag flip. The 0h call remains the founder's.*
