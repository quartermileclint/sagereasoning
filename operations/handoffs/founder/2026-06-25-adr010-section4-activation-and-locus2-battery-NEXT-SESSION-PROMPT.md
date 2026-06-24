# Next-Session Prompt — ADR-010 §4 Activation + Full-Sandwich LOCUS-2 Battery (+ Layer-1 prompt change; bridge retirement gated)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** — activates native dikaiosyne weighting on the shared `/api/reason` engine AND (via the shared env flag) the Live `/api/guardrail` gate. **Full Critical Change Protocol (0c-ii); every prod step is the founder's (PR17).** AC7 engaged (env-flag activation + a prod deploy + a live smoke).
**Governing decisions:** ADR-010 §4 (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`, incl. the **§4 build record + the bridge-retirement gate**) + ADR-012 + the build spec `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md`.
**Predecessor close:** `operations/handoffs/founder/2026-06-25-adr010-section4-engine-fix-CLOSE.md`. **Build results:** `…/2026-06-25-adr010-section4-engine-fix-build-results.md`.

## Carried state — what is / isn't done
- **Done (dark, flag-gated):** `computeProximity` weights dikaiosyne natively (per-domain + KP-04 minimum + obligation resolution route 2a + D4), behind `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` (UNSET ⇒ byte-identical, test-asserted). Repo-only battery green both directions; adversarial review folded; `tsc`/build 0. Production byte-equivalent.
- **NOT done (this session):** the Layer-1 extraction-PROMPT change (route 2a — the field is hand-authored on fixtures only); the full-sandwich LOCUS-2 verdict-equivalence battery; the flag flip + live smoke; the R18 contract publication; the §3 bridge retirement.
- **0h held.** No public weights/profile claim until the gaming-robustness bar clears.

## The three load-bearing risks this session must close (from the §4 adversarial review)
1. **Layer-1 prompt is the hard prerequisite.** Today's Layer-1 LLM does NOT emit `obligation_assessment`. Flag-on over today's extraction → `obligationToProximity(null) → reflexive` (J1) → **every circle-engaged good action over-floors to reflexive**. So the prompt change MUST ship in the SAME deploy as (or strictly before) the flag flip.
2. **The native trigger is narrower than the §3 bridge.** A role-obligation-only, circle-free injustice is un-floored at LOCUS-1 (indistinguishable from a prudential role action without an obligation field; probe **P5e**). The bridge caught this class via its LLM resolution. **Do NOT retire the §3 bridge** until the full-sandwich battery proves role-framed injustices reliably surface a circle/obligation.
3. **The env flag is shared** — one flip activates both `/api/reason` and the Live `/api/guardrail` gate (monotonic-safe, no fail-open, but the both-flags-on interaction is untested). Decide: retire the bridge same-deploy / add a both-on test / decouple the guardrail consumer with an explicit option.

## Part A — Open under the protocol
Read in order: `/adopted/standing-protocol-cache.md`; `/adopted/build-sessions-protocol-cache.md`; the predecessor close + the build-results memo; ADR-010 (the §4 build record + bridge-retirement gate); the engine first-hand (`layer2-mechanisms.ts` `computeProximity`/`computeDikaiosyneFloor`/`computeAndreiaFloor`; `layer1-extractor.ts` `LAYER1_SYSTEM_PROMPT` + the `obligation_assessment` field). Confirm at open: tier `code-critical`; 0h held; AC1 (the Layer-1 prompt change touches Sonnet DeepModel); model selection; the founder elections below.

## Part B — Procedure (founder-walked; the AI guides + verifies)
### Step 1 — Land the Layer-1 data-model changes (route 2a obligation + the andreia urgency→stage link)
(1a) Extend `LAYER1_SYSTEM_PROMPT` so the extractor emits, per engaged oikeiosis circle, an `obligation_assessment {status: met|violated|indeterminate, justification}` — reasoning about what is owed to that circle and whether the action honours/violates/leaves-genuinely-unclear it (J2: indeterminate must be ARGUED). The field already validates (`validateLayer1Schema`, tested OA-1…9). **Decide:** does an other-affecting action that frames itself ONLY as a role obligation reliably surface a circle (closing P5e's class)? — this gates bridge retirement.
(1b) **The sound andreia fix (the fold-verification residual OS3):** bind the `urgency_indicators` signal to its causal stage (a structured field), so `computeAndreiaFloor` can require the GRAVE praxis itself to be the un-examined one — replacing the current conservative "any carried-out grave act → reflexive" (which over-floors a genuinely-good examined irreversible act, the OS3 ceiling). Do NOT re-introduce the reverted "any synkatathesis escapes" gate — it let a rash act bypass via an unrelated pause (P4c locks this). With the stage link, examined-the-GRAVE-act → no floor; rash (grave praxis un-examined) → reflexive; a gamed lie about examining it → the LOCUS-2 ceiling.
Gate both behind the same flag (or ship additive) so flag-off Layer-2 stays byte-identical.
### Step 2 — Full-sandwich LOCUS-2 verdict-equivalence battery
Model on `website/scripts/guardrail-verdict-equivalence-battery.ts` but on `/api/reason` with the REAL Layer-1 LLM. Confirm BOTH directions on real extractions: (a) the proximity distribution shifts conservatively (currently-`principled` calm injustices drop) WITHOUT over-blocking the benign set (the over-strictness direction — does the real prompt emit met-argued obligations for genuinely-good actions?); (b) role-framed injustices reliably surface a circle/obligation (the bridge-retirement equivalence). Use the repo-only P1/P4/P5 fixtures as known-quality seeds.
### Step 3 — Adversarial pre-activation review (ultracode)
Re-run a focused review on the LOCUS-2 results + the both-flags-on guardrail interaction. Fold; re-verify.
### Step 4 — Activate (founder-walked 0c-ii)
Set `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` in Vercel + redeploy + a live `/api/reason` smoke (a calm injustice now scores reflexive; a good action keeps its score) + a live `/api/guardrail` check (the shared flag also governs it). Publish the R18 contract: the `proximity_floors` + `obligation_assessment` response fields + the **D3 epistemic-accuracy scoping bound** (the profile reads *how* a decision was reasoned, not *whether it was factually right*). **Rollback = unset the flag + redeploy (byte-identical).**
### Step 5 — Retire the §3 guardrail justice bridge — ONLY after the Step-2 coverage-equivalence proof
Once the full-sandwich battery shows role-framed injustices reliably surface a circle/obligation (P5e's class covered), remove the bridge (`guardrail-sandwich.ts` `justiceCheckScope`/`resolveJusticeObligation`/`applyJusticeFloor`) behind its own step; the signed deterministic proximity is now reproducible == surfaced. If the equivalence does NOT hold, KEEP the bridge and document the residual.
### Step 6 — Decision-log + close (full Critical template).

## Critical Change Protocol (0c-ii) — to discharge in-session
What changes: native dikaiosyne weighting goes Live on `/api/reason` (+ the guardrail gate via the shared flag) + the Layer-1 prompt emits obligation assessments. What could break: over-strictness on real extractions (Step 2 gate); the both-flags-on guardrail interaction (Step 3); a premature bridge retirement reopening the role-only class (Step 5 gate). Existing sessions: only-founder/test logins. Rollback: unset the flag + redeploy. Verification: the full-sandwich battery (both directions) + the live smokes + the adversarial review. Founder approval: the flag flip, the prompt deploy, the bridge-retirement go/no-go.

## Forecast
Ends with the engine measuring Stoic virtue (incl. justice) natively in production, the LOCUS-2 extraction dependency measured + closed, the §3 bridge retired (or the residual documented), and the R18 profile contract scoped honestly — clearing the engine-fidelity prerequisite for the honest practice-mode profile claim. **Then** the `practice-on`/`practice-off` rename; logos-mode + the model-creator/weights signal remain future (gated on the gaming-robustness bar). The 0h call remains the founder's.

End of prompt.
