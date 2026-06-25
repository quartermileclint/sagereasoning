# Next-Session Prompt — ADR-010 §4 Flag-Flip Activation (the founder-walked 0c-ii) + bridge-retirement gate

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** — activates native dikaiosyne weighting on the shared `/api/reason` engine. **Full Critical Change Protocol (0c-ii); every prod step is the founder's (PR17).** AC7 engaged (a code deploy + an env-flag flip + a live smoke).
**Governing decisions:** ADR-010 §4 (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`) + ADR-012 + the build spec `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md`.
**Predecessor close:** `operations/handoffs/founder/2026-06-25-adr010-section4-locus2-and-prompt-CLOSE.md`. **Battery results:** `…/2026-06-25-adr010-section4-locus2-battery-results.md` + `…-gate-verdict-equivalence-rerun.txt`.

## Carried state — what IS done (the activation prerequisites are MET)
- **The Layer-1 prompt change is landed** (route 2a `obligation_assessment` per circle + the andreia urgency stage-link), additive + flag-off byte-identical. The hardened full-sandwich **LOCUS-2 battery (N=3, rank-preserving over-strictness check) cleared BOTH directions on the REAL Sonnet extraction** (lenience 0 fails, over-strictness 0 fails), role-framed injustices reliably surface a circle, andreia examined→kept / rash→floored / no-bypass held.
- **The andreia stage-less bypass the pre-activation review caught is FIXED** (per-indicator conservative reading; the global `enriched` switch removed) + locked with the exact mixed-stage no-bypass control.
- **The over-strictness residual the hardened battery surfaced is FIXED at the engine level — the UNITY-THESIS courage↔justice coupling.** A carried-out grave act that honours what is owed to EVERY affected party (`dik=sage_like`) is courage, not rashness → the andreia floor is suppressed. This resolved the LOCUS-2 G4 urgent-protective case ("immediately rotated leaked creds to protect customers" — `off=deliberate on=deliberate` ×3 after the fix) AND the LOCUS-1 OS3 ceiling (now `sage_like`), WITHOUT loosening the gameable `examined` boolean (the only escape is an all-`met` dikaiosyne = the same disclosed lying-met ceiling P5d). A violated/indeterminate/self-regarding grave act still floors (unit-tested).
- **The gate verdict-equivalence battery was RE-RUN against the new prompt and CLEARED** (0 drifts / 0 unsafe leaks): the unconditional prompt change makes the Live `/api/guardrail` gate equal-or-MORE conservative (more circles → §3 bridge fires more), never less. So the **code deploy is safe for the gate**.
- **The guardrail is DECOUPLED:** `guardrail-sandwich.ts` pins `applyMechanisms(schema, { dikaiosyneWeighting: false })`, so the §4 flag flip touches ONLY `/api/reason`; the Live gate keeps the proven §3 bridge.
- Adversarial review verdict **GO_WITH_FIX → all folds applied + re-verified** (the andreia bypass + the over-strictness blind spot were real catches; both fixed).

## CRITICAL deploy/flag distinction (read first)
- **The Layer-1 prompt change is UNCONDITIONAL — it ships on the CODE DEPLOY (git push), not the flag flip.** On deploy, the Live `/api/guardrail` gate's *extraction* changes (it surfaces affected-party circles under role framing) — confirmed equal-or-more-conservative by the re-run gate battery. The `/api/reason` consult also changes its extraction on deploy, but its *scoring* stays byte-identical until the flag flips (flag-off Layer 2 ignores the new fields — test-asserted).
- **The flag flip (`SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true`) then activates native dikaiosyne weighting on `/api/reason` ONLY** (decoupled). Rollback = unset the flag + redeploy (byte-identical scoring).

## Part A — Open under the protocol
Read in order: `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`; the predecessor close + the LOCUS-2 results memo + the gate-battery re-run; ADR-010 (the §4 build record + the bridge-retirement gate). Confirm at open: tier `code-critical`; 0h held; AC1 (the prompt change is Sonnet/DeepModel, already deployed-as-code); model selection; the founder election below.

## Part B — Procedure (founder-walked; the AI guides + verifies)
### Step 1 — Deploy the code (the prompt change + andreia fix + decouple), then re-confirm the gate
Push the committed branch → Vercel build green. The prompt change is now Live in extraction. **Re-run the gate verdict-equivalence battery once against production-config** (or trust the pre-deploy re-run — founder's call): confirm 0 unsafe leaks. The `/api/reason` scoring is still byte-identical (flag unset).
### Step 2 — Flip the flag (the 0c-ii activation)
Set `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` in Vercel Production + redeploy.
### Step 3 — Live smokes
- `/api/reason`: a calm injustice (e.g. "send unsolicited marketing emails to all users who never opted in") now scores **reflexive** with `proximity_floors.dikaiosyne=reflexive` + a per-circle `obligation_assessment`; a genuinely-good action keeps its high score.
- `/api/guardrail`: unchanged behaviour (decoupled — the §3 bridge still runs; the verdict is equal-or-more-conservative than pre-deploy, never less).
### Step 4 — Publish the R18 contract
Document the new `/api/reason` response fields (`proximity_floors {base, dikaiosyne, andreia, sophrosyne, aggregate, basis}` + per-circle `obligation_assessment`) and the **D3 epistemic-accuracy scoping bound** (the profile reads *how* a decision was reasoned — incl. justice structure — NOT *whether it was factually right*) on `llms.txt` / `agent-card.json` / api-docs.
### Step 5 — §3 guardrail bridge retirement — GATED, do NOT do at the flip
Retire the bridge (`guardrail-sandwich.ts` `justiceCheckScope`/`resolveJusticeObligation`/`applyJusticeFloor`) ONLY after a **higher-N full-sandwich LOCUS-2 run** (REPRO_RUNS ≥ 5–10) confirms role-framed injustices reliably surface a circle/obligation (the P5e coverage-equivalence) AND the over-strictness rank-preservation holds at higher N. If equivalence does NOT hold at higher N, KEEP the bridge and document the residual as a deliberate belt-and-braces conservatism. The decouple means retirement is never forced.
### Step 6 — Decision-log + close (full Critical template).

## Carried residuals / follow-ups (named, not blocking the /api/reason flip)
- **Over-strictness now rests on the extractor reading a good action's obligations as `met`** (the unity-thesis coupling resolves the andreia over-floor *when* `dik=sage_like`). A noisy extraction that reads a clearly-met obligation as `indeterminate` could still over-floor a good action — the DIKAIOSYNE-OMIT residual, SAFE direction, profile-bounded. A **higher-N over-strictness run is prudent before the flip**. Do NOT weaken J1 (an absent obligation reading reflexive is the lenience safety property).
- **The `examined_before_acting` boolean is a single gameable surface** (assert-examination-on-a-rash-act lifts the andreia floor — disclosed ceiling, pinned by a test). The unity-thesis coupling adds a SECOND lift path (an all-`met` dikaiosyne) — but both are the SAME lying-`met` extraction-trust ceiling class (a harmful act cannot honestly get `dik=sage_like`). Closing the gameable surfaces (corroboration tying examination to THIS act; resistance to a gamed all-`met`) is the **model-creator/weights-tier prerequisite**, NOT the /api/reason flip. Post-decouple they reach only the profile, never the gate.
- The deterministic L2 still measures **apatheia + justice/courage structure, not factual correctness** (D3) — the R18 scoping bound (Step 4).

## Critical Change Protocol (0c-ii) — to discharge in-session
What changes: the prompt change is Live-on-deploy (gate extraction equal-or-more-conservative); the flag flip activates native dikaiosyne weighting on `/api/reason` only. What could break: an over-strict drift on a good action (mitigated — measured 0; higher-N prudent); the §3 bridge over-firing on the gate (measured equal-or-more-conservative, safe). Existing sessions: only-founder/test logins. Rollback: unset the flag + redeploy (scoring byte-identical); `git revert` the deploy to undo the prompt change. Verification: the live smokes + the (optional) production gate-battery re-run. Founder approval: the deploy, the flag flip, the bridge-retirement go/no-go (Step 5, higher-N gated).

## Forecast
Ends with the engine measuring Stoic virtue (incl. justice + courage) natively on `/api/reason` in production, the LOCUS-2 extraction dependency measured + cleared, the gate held safe + decoupled, and the R18 profile contract scoped honestly — clearing the engine-fidelity prerequisite for the honest practice-mode profile claim. The §3 bridge retires only after a higher-N equivalence proof. **Then** the `practice-on`/`practice-off` rename; logos-mode + the model-creator/weights signal remain future (gated on the gaming-robustness bar — incl. the `examined_before_acting` corroboration). The 0h call remains the founder's.

End of prompt.
