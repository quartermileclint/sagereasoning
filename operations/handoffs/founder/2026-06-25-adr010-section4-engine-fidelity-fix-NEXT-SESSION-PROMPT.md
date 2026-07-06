# Next-Session Prompt — ADR-010 §4 Engine Root-Fix (native dikaiosyne weighting in `computeProximity`)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** — this changes the **shared `/api/reason` deterministic engine** (`computeProximity`), which the consult tool, the trust-layer accreditation, the reflect Q4 input, and the assent gate's deterministic core all consume. The proximity distribution shifts toward conservatism on other-affecting actions — **that is the point**, and it is a real production-affecting change. It ships **flag-gated (flag-off byte-identical)**; activation is a separate founder-walked 0c-ii step. **Full Critical Change Protocol** (project instructions 0c-ii) governs — see §Critical Change Protocol below.
**Governing decisions:** **ADR-010 §4** (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`, the adopted root-correction design) + the **build spec** `operations/benchmarks/sage-practice-v1/2026-06-24-adr010-section4-engine-fix-scope.md` (read this in full — it is the deliverable-of-the-day) + **ADR-012** (`adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md`, why the engine is the critical path).
**Predecessor close:** `operations/handoffs/founder/2026-06-24-scoring-validity-battery-CLOSE.md`.
**Battery evidence (the regression target):** `operations/benchmarks/sage-practice-v1/2026-06-24-scoring-validity-battery-results.md` + `website/scripts/scoring-validity-battery.ts` + `…-fixtures.ts`.

## Why this session matters
The scoring-validity battery (predecessor session) **quantified** the standing ADR-010 finding and four further engine defects, all code-attributed and adversarially verified: a calm injustice scores `principled` when it should score `reflexive` (**+3.0 ranks**), and a score-optimizer reaches `sage_like` indistinguishable from a legitimate sage action. Per ADR-012 the deterministic engine's fidelity is the product's **critical path** — the honest practice-mode profile claim, the future logos-mode, and the model-creator/weights signal all sit on it. This session **fixes the engine natively** so a worse decision earns a worse score, and lets the (non-deterministic, LLM) guardrail justice bridge **retire**. It is the work the reframe named as enabling for the whole product.

## Carried state — what is / isn't done
- **Done:** the gap is quantified + scoped. The battery exists and is the regression gate. ADR-010 §4 is adopted design + a concrete build spec. The guardrail justice bridge is the existing LLM-based PARTIAL patch (Live behind `SUBSTRATE_GUARDRAIL_SANDWICH_ENABLED`).
- **Not done (this session):** the native `computeProximity` fix; the full-sandwich verdict-equivalence battery (LOCUS 2 + over-strictness); the adversarial pre-activation review; flag-gated activation; bridge retirement.
- **0h held.** No public weights/profile claim until the gaming-robustness bar clears (ADR-012 §4).

## The defects to close (from the battery; verified against the source)
- **D1 — apatheia ≠ dikaiosyne (headline).** `computeProximity` (`layer2-mechanisms.ts:1251`) has no justice term; the per-circle `obligation_met` `assessOikeiosis` computes (`:910`, `:968`) is dead-written. → +3.0 ranks on calm injustice.
- **D2 — kathekon-count gaming.** `assessKathekon` (`:1069`) sets quality by COUNTING factor-types (`QUALITY_FROM_COUNT`, `:700`); no soundness check → gamed injustice reaches `sage_like`.
- **D4 — `hasDeliberation` proxy unsound.** `assessOikeiosis` emits `"No circles engaged in this snapshot"` (`:991-993`) when circles are empty → `deliberation_notes` non-empty → `hasDeliberation` TRUE → blocks `reflexive`/`habitual`. (Separable; a low-risk FIRST slice.)
- **D5 — no courage/irreversibility term.** `computeProximity` never reads `urgency_indicators` → calm destructive assent scores `principled`. (Closed by the per-domain `andreia` arm.)
- **D3 (scoping bound, NOT a §4 target) — no epistemic-accuracy term.** Scope it in the public contract (R18); do not add a fact-checker.

## Part A — Open under the protocol
Read in order:
1. `/adopted/standing-protocol-cache.md` (~3 min) — tier, model selection, risk class, signals.
2. `/adopted/build-sessions-protocol-cache.md` — this is a substrate-build session.
3. The **build spec** `…/2026-06-24-adr010-section4-engine-fix-scope.md` in full + the battery results memo + the predecessor close.
4. **ADR-010** (§1 minimum-domain rule, §2 J1/J3 conditions, §3 the bridge as built, **§4 the root correction**) + the mentor record it cites (`operations/benchmarks/sage-practice-v1/2026-06-19-mentor-consultation-guardrail-fidelity.md`).
5. The engine, **first-hand (PR11 — verify against code, not memory)**: `website/src/lib/translation-sandwich/layer2-mechanisms.ts` (`computeProximity:1251`, `assessOikeiosis:940`, `computeObligationMet:910`, `assessKathekon:1069`, `computeVirtueDomains:1346`, `applyMechanisms:2136`); the KP-04 `weakest()` rule (`website/src/lib/sage-reflect/proximity-domains.ts:54`); the guardrail bridge (`website/src/lib/guardrail-sandwich.ts` — what §4 lets retire).
6. Memories: `deterministic-l2-measures-apatheia-not-dikaiosyne`, `sage-practice-measurement-instrument-reframe`, `verdict-battery-test-the-default-threshold`, `build-dark-migrate-later-breaks-writes`, `nextjs-route-export-validation`.

Confirm at open: tier (`code-critical`); 0h held; status vocab; model selection (the engine is pure-deterministic — no LLM — but Change 2 may add an extraction-contract field, which touches Layer 1 Sonnet; cite the AC1 rows); that flag-off is byte-identical and activation is a separate 0c-ii step.

## Part B — Procedure
> Build **dark, flag-gated** behind a NEW flag (e.g. `SUBSTRATE_PROXIMITY_DIKAIOSYNE_ENABLED`); flag-off ⇒ `computeProximity` byte-identical (test-asserted, the established pattern). The AI builds + verifies; every prod step (flag flip, any migration) is the founder's (PR17).

### Step 0 — Reproduce the baseline (the regression target)
Run the scoring-validity battery (`cd website && npx tsx scripts/scoring-validity-battery.ts`) and confirm the baseline: controls 7/7, apatheia +3.0, gamed → `sage_like`. This is the BEFORE the §4 fix must move.

### Step 1 — D4 `hasDeliberation` proxy (separable, low-risk; can land first)
Stop counting the `"No circles engaged"` note as deliberation — either move that note to a non-deliberation field, or derive `hasDeliberation` from an actual deliberation signal (tensions / balanced verdicts / examined value-errors). Verify P6 → `reflexive`/`habitual` (below `deliberate`), C1 unchanged, all controls hold. (Reviewer note: `hasDeliberation` is *near-always* true — re-examine the proxy generally.)

### Step 2 — Change 1: per-domain proximity + minimum-domain rule (closes D1 + D5, blunts D2)
Refactor `computeProximity` to produce a **per-domain proximity for the single action** (phronesis / dikaiosyne / andreia / sophrosyne) and take the **minimum**. Reuse the **`weakest()` PATTERN** from `proximity-domains.ts:54` — but note the per-domain-of-a-single-action computation is **NEW** (the existing `computePerDomainProximity` aggregates over *multiple actions*; do not assume it drops in). Map the current logic: within/outside + value-error → phronesis; passions(`phobos`)+urgency → andreia; passions(`epithumia`/`hedone`) → sophrosyne; the obligation assessment → dikaiosyne (Change 2).

### Step 3 — Change 2: obligation resolution as a required oikeiosis field (closes D1, the hard part)
When `assessOikeiosis` identifies a circle, the obligation **must be evaluated before dikaiosyne can score above `reflexive`**: met → no change; violated → dikaiosyne floors `reflexive`; indeterminate-*argued* → at most `deliberate`. The current `computeObligationMet` (`:910`) is a crude lexical scan that returns `null` on any calm complier (the D1 leak). Choose + adversarially test the route per the scope doc:
- **(2a)** require Layer 1 to extract an explicit obligation assessment per circle (richer extraction contract; the principled route; pushes the work where it can reason about what is owed — and surfaces the **LOCUS-2** risk into the open), OR
- **(2b)** a deterministic heuristic over existing signals (circle + other-directed value-error + no fulfilment language → presumptive `violated`) — a *floor*, cheaper, weaker, itself gameable.
This is the move the guardrail bridge makes with a bounded LLM call; §4 folds the resolution into the **signed deterministic proximity** so the gate becomes reproducible-from-signed-assessment again.

### Step 4 — Regression gate: re-run the scoring-validity battery (BOTH directions)
The battery's P1/P4/P5 fixtures are the known-quality seeds + gaming regression set. Post-fix it MUST show: calm injustice (P1b/P1d) → `reflexive`; **P5a AND P5c must NOT reach `sage_like`** (gaming-robustness); P4b → `reflexive`. **AND the over-strictness direction:** the good controls (P1a/P1c/P2a/P3a/P4a/C2) must KEEP their high scores — the dikaiosyne fix must not wrongly floor a genuinely-good calm action. (Add over-strictness fixtures if the set is thin.)

### Step 5 — Full-sandwich verdict-equivalence battery on `/api/reason` (LOCUS 2)
A fixtures/idempotency pass + a verdict-equivalence battery run on the **FULL sandwich** (real Layer-1 LLM + Layer-2) — this is where **LOCUS 2** (does the real extraction surface the violation) is finally measured (the repo-only battery only covers LOCUS 1). Model on `website/scripts/guardrail-verdict-equivalence-battery.ts`. Confirm the proximity distribution shifts as intended (some currently-`principled` consult assessments drop) without over-blocking the benign set.

### Step 6 — Adversarial pre-activation review
An ultracode multi-agent review (flag-off byte-identity; the minimum-domain monotonicity; gaming-robustness on P5; the over-strictness/false-positive direction; the LOCUS-2 extraction dependency). Fold findings; re-verify.

### Step 7 — Activation (a SEPARATE founder-walked 0c-ii; may be its own session)
Set the flag in Vercel + redeploy + a live `/api/reason` smoke; publish any R18 contract change (incl. the D3 epistemic-accuracy scoping note). Flag-off byte-identical; rollback = unset the flag + redeploy.

### Step 8 — Retire the guardrail justice bridge (ADR-010 §3 expiry)
Once `computeProximity` floors natively, the bridge is redundant (signed == surfaced again). Plan/execute the bridge removal behind its own step.

### Step 9 — Decision-log + close (full Critical template)
Per `/adopted/standing-protocol-cache.md` §"Critical-risk sessions". Record the build, the battery deltas (both directions), the activation disposition, and the bridge-retirement plan.

## Critical Change Protocol (0c-ii) — to be discharged in-session
1. **What is changing** — `computeProximity` gains per-domain scoring + a native dikaiosyne/obligation floor (flag-gated).
2. **What could break** — consult/accreditation/assent proximity drops on other-affecting actions (intended); risk of *over*-strictness on good actions (Step 4 over-strictness gate); the extraction dependency (Step 3 route choice; LOCUS-2, Step 5).
3. **What happens to existing sessions** — flag-off byte-identical; flag-on shifts the distribution conservatively.
4. **Rollback** — unset the flag + redeploy (byte-identical); `git revert` the build.
5. **Verification** — the scoring-validity battery (both directions) + the full-sandwich verdict-equivalence battery + the adversarial review.
6. **Founder approval specific to named risks** — the founder walks the flag flip + any migration; approves the Change-2 route (2a vs 2b) and the over-strictness tolerance.

## Part C — Anticipated session shape
| Phase | Estimate |
|---|---|
| Cache + build-cache + ADR-010/§4 spec + engine read | 40–50 min |
| Step 0 baseline + Step 1 (D4) | 30–40 min |
| Step 2 (per-domain refactor) | 60–90 min |
| Step 3 (obligation resolution — route choice + build) | 60–120 min |
| Step 4 (battery, both directions) | 30–45 min |
| Step 5 (full-sandwich battery, LOCUS 2) | 45–60 min |
| Step 6 (adversarial review) | 45–60 min |
| Decision-log + close | 30–40 min |
| **Total** | **~5–7 hours** (consider splitting: D4+Change 1 one session, Change 2+batteries+review the next; activation its own 0c-ii) |

## Rollback
Flag-off is the default (byte-identical, test-asserted); `git revert` the build commit removes it entirely. No schema change unless Change-2 route (2a) adds an extraction field (additive/nullable; reversible).

## Forecast
Ends with `computeProximity` weighting dikaiosyne natively (calm injustice → `reflexive`; gamed artifacts no longer reach `sage_like`; good actions keep their high scores), the LOCUS-2 extraction dependency measured on the full sandwich, an adversarial review folded, and the fix **built dark + flag-gated** ready for a founder-walked activation — after which the guardrail justice bridge retires. That clears the engine-fidelity prerequisite for the honest practice-mode profile, and (with the gaming-robustness bar held) the future model-creator/weights signal. **Then** the `practice-on`/`practice-off` rename. The 0h launch call remains the founder's.

End of prompt.
