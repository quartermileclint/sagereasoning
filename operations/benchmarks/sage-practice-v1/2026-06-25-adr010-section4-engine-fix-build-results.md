# ADR-010 §4 Engine Root-Fix — Build Results (native dikaiosyne weighting in `computeProximity`)

**Date:** 2026-06-25. **Stream:** founder. **Tier:** `code-critical` — the shared `/api/reason` deterministic engine. **Built DARK, flag-gated; flag-off byte-identical (test-asserted); production byte-equivalent. AC7 NOT engaged this session** (no mint / Supabase / Vercel / git op; activation is a separate founder-walked 0c-ii).
**Decision-log:** `D-SAGE-PRACTICE-ADR010-SECTION4-ENGINE-FIX-BUILT-DARK-TEST-VERIFIED`.
**Governing decisions:** ADR-010 §4 (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`) + ADR-012 (engine fidelity = critical path) + the build spec `2026-06-24-adr010-section4-engine-fix-scope.md`.
**Predecessor:** `2026-06-24-scoring-validity-battery-results.md` (the regression target) + `…-CLOSE.md`.

---

## 1. What was built

The deterministic Layer-2 scorer (`computeProximity`) measured **apatheia** (freedom from passion), not **dikaiosyne** (justice): a calmly-reasoned injustice scored `principled` (+3 ranks; ADR-010). This session weights dikaiosyne **natively**, **flag-gated behind `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED` / `ApplyOptions.dikaiosyneWeighting`** (default OFF ⇒ byte-identical). Founder elections at open (AskUserQuestion): **Change-2 route 2a** (richer extraction) + the **full repo-only build**.

- **Change 1 — per-domain proximity + the KP-04 unity-thesis minimum.** Flag-on, the pre-§4 apatheia reading becomes the **base**, then is **floored** (weakest-link) by three engaged-domain readings — **dikaiosyne**, **andreia** (irreversibility/courage; closes D5), **sophrosyne** (disordered impulse acted out). The min can only LOWER the base, never raise it (strong domains do not compensate for a weak one). *Design note: a "complete, don't rewrite" realization — the existing 5-branch logic is preserved verbatim as the base (= phronesis + temperament reading), and the two genuinely-missing domains (dikaiosyne, andreia) plus sophrosyne floor it. This reproduces every control by construction and is lower-regression-risk than a from-scratch four-domain decomposition; it is the KP-04 minimum applied to complete the missing domains.* (`computeProximityBase`, `weakestProximity`, `computeDikaiosyneFloor`, `computeAndreiaFloor`, `computeSophrosyneFloor`, `computeProximity` in `layer2-mechanisms.ts`.)
- **Change 2 — obligation resolution as a required oikeiosis field (route 2a).** Layer 1 gains an **OPTIONAL** per-circle `obligation_assessment {status: met|violated|indeterminate, justification}` (`layer1-extractor.ts`, additive/validated/forward-compat). The dikaiosyne domain resolves it (mentor J1/J2/J3): **violated → reflexive**; **unevaluated/absent → reflexive** (J1); **met-argued → no floor** (top sentinel, ⇒ the aggregate is set by the other domains); **indeterminate-argued → deliberate cap** (J2: argued, not defaulted); **unargued met/indeterminate → treated unevaluated → reflexive**. A **natural_relationship claimed with NO circle** (an unidentified affected party) → **reflexive** — this is what catches the **circle-free gamed injustice** that is otherwise identical to the legitimate sage at Layer 2. **The Layer-1 LLM does NOT yet populate the field** — the extractor PROMPT change is deferred to the §4 full-sandwich LOCUS-2 battery / activation (the field is hand-authored on fixtures this session).
- **D4 — `hasDeliberation` proxy (narrow).** Flag-on, the `"No circles engaged"` filler note no longer counts as deliberation (`hasGenuineDeliberation` reads substantive notes only). Narrow by design: only the proximity computation; `ruling_faculty_state` untouched (the broader proxy re-examination is a named follow-up).
- **Reproducibility + diagnosticity.** Flag-on the assessment surfaces `proximity_floors {base, dikaiosyne, andreia, sophrosyne, aggregate, basis}` + the per-circle `obligation_assessment`, so the aggregate is reproducible-from-signed-assessment and the record **names the fault** (closing the worse-scores-worse diagnosticity gap). **OMITTED entirely flag-off** (the established optional-field pattern; canonical bytes byte-identical).

## 2. Battery results — BOTH validity directions (LOCUS 1; repo-only)

`cd website && npx tsx scripts/scoring-validity-battery.ts` (runs flag-off baseline AND flag-on post-fix):

| Metric | Baseline (flag-off) | Post-fix (flag-on) |
|---|---|---|
| Controls | 7/7 (orig) | **9/9** |
| **Over-strictness** | — | **PASS 0/8** good actions over-floored + **1 disclosed over-strictness ceiling (OS3)** *(LOCUS-1, see caveat §4 + §6)* |
| **Apatheia/dikaiosyne** mean overscore | **+3.0** | **+0.0** |
| calm injustices reaching principled+ | 2/2 | **0/2** (P1b/P1d → reflexive) |
| **Kathekon-count gaming** lever | gamed → `sage_like` | **closed 3/3** (P5a AND P5c → reflexive) |
| D5 calm destructive (P4b / P4c no-bypass) | principled | **reflexive** |
| D4 impulsive no-circle praxis (P6) | deliberate | **reflexive** |
| Grave assent-proceeds (LOCUS-1-closeable) | **6** | **0** → the LLM justice bridge can RETIRE |

`MACHINE_POSTFIX: {controls_ok:true, over_strictness_pass_locus1:true, over_strictness_locus2_conditional_on_l1_prompt:true, apatheia_mean_overscore:0, apatheia_to_principled_plus:0, kathekon_gamed_floored:3/3, locus1_ceiling_probes:3, bad_assent_proceeds_locus1_closeable:0, ceiling_assent_proceeds:[P5d,P5e]}` (`locus1_ceiling_probes:3` = P5d + P5e + OS3.)

## 3. Verification

- **Battery** run first-hand, both directions (above). Flag-off MACHINE footer reproduces the predecessor's documented baseline (apatheia +3.0, gamed→sage_like, assent 5) byte-for-byte.
- **`proximity-dikaiosyne.test.ts` 42/0** — flag-off byte-identity (incl. the additive-field-inert invariant + env-default resolution); the dikaiosyne/andreia/sophrosyne/D4/KP-04 logic; multi-circle (met+violated→reflexive, both-met→no-floor); the andreia conservative floor (carried-out→reflexive) + the no-bypass control (rash + unrelated synkatathesis → reflexive); idempotency.
- **`layer1-schema-additions.test.ts` 59/0** (+9 `obligation_assessment` validator cases on the live `/api/reason` boundary).
- **255 existing substrate assertions** unchanged: canonical 15/0, signer 14/0, verifier 18/0, reason-loop-closure 33/0, tier1-continuation 42/0, prose-deferral 26/0, injection-defence 57/0 — flag-off byte-identity preserved across the signing/verify/loop-closure surfaces.
- **`tsc --noEmit` 0; `npm run build` ✓ Compiled successfully** (engine compiles in the route graph).

## 4. Adversarial review (two passes) + folds

**Pass 1 — pre-activation review (ultracode; 33 agents, ~6.9M subagent tokens).** Six source-grounded dimensions + a completeness critic. **No critical finding; no flag-off safety break; production byte-equivalent.** Verdicts: **flag-off byte-identity HOLDS** (git-diff: `computeProximityBase` is the pre-§4 body verbatim; absent-not-undefined keys; the 895,968-schema monotonicity sweep found 0 cases of flag-on > flag-off). **Minimum-domain monotonicity HOLDS.** Four dimensions **HOLDS_WITH_CAVEAT**.

**Pass 2 — fold-verification (5 agents; ran the code first-hand).** Pass 1's per-finding *refuters* were partly cut off by a session API limit, so a second pass independently verified the FOLDS against the now-folded code. Result: `all_hold: true, any_refuted: []` (flag-off byte-identity re-confirmed by an independent 2,400-case monotonicity sweep, 0 violations; the trigger-narrowing disclosure verified load-bearing via `git diff` showing the bridge untouched) — **EXCEPT it caught one real defect Pass 1's andreia fold had introduced** (below). All folds (both passes) applied + re-verified:

- **andreia floor — FIX, then REVERT (the fold-verification catch).** Pass 1 flagged that the original `hasGrave && actedAtPraxis → reflexive` over-floored a genuinely-good carried-out irreversible act; the Pass-1 fold gated it on examined-before-acting (`!any synkatathesis`). **Pass 2 proved that gate introduced an UNSAFE under-strictness bypass:** a rash destructive `rm -rf` + an *unrelated* synkatathesis ("considered coffee first") → andreia null → `principled` → the assent gate flips BLOCK→PROCEED, reachable by a *faithful* extraction — a regression the pre-fold code did not have. Root cause: `urgency_indicators` are not linked to a causal stage, so at LOCUS-1 the engine cannot tell a courageous examined irreversible act from a rash one (the case is undecidable). **Resolved: REVERTED to the conservative floor (any carried-out grave act → reflexive — no bypass; the SAFE direction for a gate).** The cost — a good carried-out irreversible act over-floors — is now a **disclosed LOCUS-1 over-strictness ceiling (OS3)**, symmetric with the dikaiosyne ceilings; the **no-bypass control P4c** (rash + unrelated synkatathesis → reflexive) locks it. The SOUND fix (bind the urgency signal to its causal stage so the floor requires the GRAVE praxis to be the un-examined one) is added to the §5 activation prerequisites (a Layer-1 data-model change). D5 holds throughout (P4b/P4c → reflexive).
- **DISCLOSE + GATE (dikaiosyne trigger narrower than the §3 bridge it retires):** a **role_obligation-only, circle-free injustice** reaches `principled` un-floored at LOCUS-1, because it is **indistinguishable at Layer 2 from a genuinely-good prudential role action** (P2a) — there is NO LOCUS-1 discriminator without an obligation_assessment, and widening the trigger to `role_obligation` would re-floor P2a (over-strictness regression). The Live §3 bridge caught this class (it fires broadly on kathekon moderate|strong then **resolves via an LLM call** that can distinguish prudential from injustice; a deterministic floor cannot reason). **Folded:** new disclosed-ceiling probe **P5e**; the battery + this memo + ADR-010 now disclose the narrowing; **bridge retirement (Step 8) is GATED** on a LOCUS-2 coverage-equivalence proof (do not retire until the full-sandwich battery shows role-framed injustices reliably surface a circle/obligation, or keep the bridge).
- **DISCLOSE (over-strictness PASS is LOCUS-1-conditional):** the 0/8 over-strictness PASS holds ONLY for maximally-favourable extractions that POPULATE `obligation_assessment`. The Layer-1 LLM does not yet emit it, so **flag-on over today's extraction would over-floor every good action that engages a circle OR names a natural_relationship obligation to reflexive (J1; the Pass-2 wording fold — `computeDikaiosyneFloor` engages on `circles>=1 || hasNaturalRelationship`, broader than "circle-engaged").** **Folded:** the battery SUMMARY + footer now carry the LOCUS-1-conditional caveat + the activation prerequisite; the §4 full-sandwich LOCUS-2 over-strictness battery must measure it on real extractions.
- **TEST coverage folds:** the `obligation_assessment` validator path (live boundary) and multi-circle/mixed-obligation actions were untested — both now covered (OA-1…9; the mixed-circle unit cases).
- **DOC folds:** the `// J3` comment now says it is the extraction-REPORTED violation (not deterministic detection, deferred to 2a/LOCUS-2); the stale scope-doc "did not probe over-strictness" wording is reconciled here (LOCUS-1 over-strictness IS now probed; LOCUS-2 is the full-sandwich battery's).
- **ACTIVATION prerequisite (completeness-critic HIGH; documented, not coded this dark session):** the env flag is **shared** — `guardrail-sandwich.ts` calls `applyMechanisms` with no option, so a single `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED=true` flip activates **both** `/api/reason` AND the Live `/api/guardrail` gate at once, creating an untested both-flags-on interaction (redundant justice LLM call + a new signed-vs-surfaced divergence; **monotonic-safe — no fail-open** — `applyJusticeFloor` only lowers). See §5 activation checklist.

## 5. Activation checklist (the carried founder-walked 0c-ii — NOT this session)

1. **Land the Layer-1 `obligation_assessment` prompt change** (route 2a) in the SAME deploy as, or strictly before, any flag flip — else every good action that engages a circle or names a natural_relationship floors to reflexive. **In the same Layer-1 data-model work, bind the `urgency_indicators` signal to its causal stage** so `computeAndreiaFloor` can require the GRAVE praxis itself to be the un-examined one (the sound andreia fix — retires the OS3 over-strictness ceiling without re-opening the synkatathesis bypass).
2. **Run the §4 full-sandwich verdict-equivalence battery (LOCUS 2)** on the real Layer-1 LLM: confirm the proximity distribution shifts conservatively WITHOUT over-blocking the benign set (the over-strictness direction on real extractions), and that role-framed injustices reliably surface a circle/obligation.
3. **Decide the guardrail coupling:** either retire the §3 bridge in the SAME deploy as the flip, OR add a guardrail-sandwich test with the dikaiosyne flag ON proving no fail-open + acceptable redundant-call + honest signed-vs-surfaced — OR decouple the guardrail consumer with an explicit option.
4. Set the flag in Vercel + redeploy + a live `/api/reason` smoke + publish any R18 contract change (incl. the D3 epistemic-accuracy scoping bound + the `proximity_floors`/`obligation_assessment` fields). **Rollback = unset the flag + redeploy** (byte-identical).
5. **Step 8 — retire the guardrail justice bridge** ONLY after the LOCUS-2 coverage-equivalence proof (the role-only circle-free class must be demonstrably covered).

## 6. Disclosed residuals (NOT §4 LOCUS-1 targets)

- **P5d** — LOCUS-1 ceiling: a LYING `met` obligation defeats a deterministic scorer → §4 full-sandwich LOCUS-2 battery.
- **P5e** — role-obligation-only circle-free injustice: indistinguishable from a prudential role action at LOCUS-1; gates bridge retirement on LOCUS-2 equivalence.
- **OS3** — andreia over-strictness ceiling (the fold-verification catch): a good carried-out irreversible act over-floors to reflexive because `urgency_indicators` are not stage-linked (the conservative SAFE direction; P4c proves no rash-act bypass). Sound fix = the urgency→stage data-model link (§5 prerequisite).
- **P2b** — no epistemic-accuracy term (D3): a missed-fact decision scores like a caught one → an **R18 public-contract scoping bound** (the profile reads *how* a decision was reasoned, not *whether it was factually right*), not a §4 fix.
- **P3b-dressed / K3 / K5 / R4** — within-framing deference + lexical calling/reflection gaps → LOCUS-2 extraction-quality follow-ups.

---

*End of build results. The engine now weights dikaiosyne natively (calm injustice → reflexive; gamed-by-kathekon-count → reflexive; good actions keep their high scores), built dark + flag-gated, adversarially reviewed, ready for a founder-walked activation after the Layer-1 prompt change + the full-sandwich LOCUS-2 battery. The guardrail justice bridge retires only after the LOCUS-2 coverage-equivalence proof. The 0h call remains the founder's.*
