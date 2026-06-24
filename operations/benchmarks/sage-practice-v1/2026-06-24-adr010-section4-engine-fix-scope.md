# ADR-010 §4 — Engine Root-Fix Scope (the carried `code-critical` successor)

**Status:** Scoped 2026-06-24 under `D-SAGE-PRACTICE-SCORING-VALIDITY-BATTERY-BUILT-RUN-SECTION4-SCOPED` (the scoring-validity-battery session). This document turns the already-**Adopted** ADR-010 §4 design into an actionable build spec, grounded in the battery's quantified findings + first-hand engine reading. **It is the spec for a future `code-critical` session — NOT this session's build.** This session built + ran the battery (repo-only) and scopes the fix; it does not touch the engine.
**Governing decisions:** ADR-010 (`adopted/adr/2026-06-19-stoic-fidelity-dikaiosyne-weighting.md`, §4 = the root correction) + ADR-012 (`adopted/adr/2026-06-24-…measurement-instrument-reframe.md`, which reclassified §4 from cleanup → enabling work / the critical path).
**Battery evidence:** `operations/benchmarks/sage-practice-v1/2026-06-24-scoring-validity-battery-results.md` + `website/scripts/scoring-validity-battery.ts` + `…-fixtures.ts`.

---

## 1. Why this is the critical path

Per ADR-012, Sage practice is a **measurement instrument** whose value is a per-decision profile (measure + feedback), and all three uses — developer-refine, logos-enforce, model-creator-refines-weights — sit on the **deterministic scoring engine's validity.** A profile is only worth reading if a *worse* decision earns a *worse* score and the record says *why*. The battery measured whether the engine has that property. It does not, in a concentrated and explainable way. This fix is the prerequisite for the honest practice-mode profile claim, the future logos-mode, and (with the gaming-robustness bar) the model-creator/weights signal.

## 2. What the battery confirmed (the defects this fix must close)

All findings are **LOCUS 1** — the deterministic Layer-2 scorer (`applyMechanisms` → `computeProximity`) — proven on hand-authored faithful / maximally-favourable extractions. Quantified:

| # | Defect | Battery evidence | Root in code |
|---|---|---|---|
| **D1** | **Apatheia ≠ dikaiosyne.** A calm injustice to a non-consenting party scores `principled` when a faithful engine should score `reflexive`. | 2/2 calm-injustice probes (P1b, P1d) scored `principled`; **mean overscore +3.0 ranks**; both had the affected circle surfaced with `obligation_met` recorded `null` and then **ignored**. P1b reproduces ADR-010's first-hand U2 extraction on every load-bearing field (adversarially confirmed). | `computeProximity` (`layer2-mechanisms.ts:1251`) has **no justice/dikaiosyne/obligation term**. It reads `oik` only via `hasDeliberation = deliberation_notes.length > 0`. The per-circle `obligation_met` that `assessOikeiosis` computes (`:910`, `:968`) is never read (dead-written). |
| **D2** | **Kathekon-count gaming.** Naming the three kathekon factor *types* lifts proximity into the `sage_like` band regardless of the action's actual justice — the score is optimizable by self-report. | Gamed P5a (grave injustice, all 3 factors named, within-framed, no value-error) → `sage_like` (+4), **indistinguishable from the legitimate C2-clean-sage**; **P5c** (same injustice, victim *surfaced*) ALSO → `sage_like`, proving the circle-omission is score-irrelevant; P5b vacuous → `sage_like`. | `assessKathekon` (`:1069`) sets `quality` purely by COUNTING factor-types (`QUALITY_FROM_COUNT`, `:700`); `sage_like` is a 4-way conjunction (passions 0, within>outside, valueErrors 0, kathekon `strong`). No check that the justification is sound or the obligation legitimate. |
| **D3** | **No epistemic-accuracy term.** A factually-wrong calm decision (missed a dispositive fact) scores identically to the correct one. | P2a (caught) and P2b (missed) both → `principled`; the pair is `IDENTICAL`/`MIS-ORDERED`. | `computeProximity` reads passions / control-filter / value-errors / kathekon — nothing encodes whether the decision is factually right. A *scoping bound* on the "decision quality" claim, not strictly a §4 target (see §5). |
| **D4** | **`hasDeliberation` proxy is unsound.** An impulsive passion-at-praxis action with NO circle engaged floats up from `reflexive` to `deliberate`. | P6 → `deliberate` (+2 vs `reflexive`); the only difference from the clean reflexive control C1 is whether a circle is present. | `assessOikeiosis` emits the note `"No circles engaged in this snapshot"` when circles are empty (`:991-993`), so `deliberation_notes` is non-empty → `hasDeliberation` TRUE → blocks the `reflexive` AND `habitual` branches (`:1294-1304`). Separable. (Reviewer: `hasDeliberation` is *near-always* true — P1b/P1d also reach it via the balanced-Cicero note — so re-examine the proxy generally.) |
| **D5** | **No courage/irreversibility term.** A calm destructive irreversible assent scores `principled`, and the deterministic assent gate PROCEEDS. | P4b (calm `rm -rf` of the only copy) → `principled` (+3 vs `reflexive`); the gate proceeds at the live `deliberate` threshold (kathekon floor only catches CONTRARY). | `computeProximity` never reads `urgency_indicators` (incl. `irreversibility_language`). Closed by the §4 per-domain refactor's **andreia** domain (Change 1). |

Diagnosticity is also weak: even when the engine mis-scores a calm injustice, the **record does not name the fault** — `value_error` is null, `obligation_met` reads `null` (not `violated`), kathekon reads `moderate` (2/2 worse-scores-worse apatheia pairs were `PARTIAL`: discriminate-but-not-diagnostic). A profile reader could not act on it.

**Controls passed 7/7** — the engine reaches the bottom of the scale when the Stoic signals are present (C1 → `reflexive`), reaches the top legitimately (C2 → `sage_like`), and discriminates a value-error-bearing pressure-yield (P3b-plain → `deliberate` + blocks). The engine is not uniformly broken; the defects are specific and the fix is targeted.

## 3. The fix (ADR-010 §4, made concrete against the code)

### Change 1 — per-domain proximity + minimum-domain rule (closes D1 + D5, blunts D2)
Refactor `computeProximity` to produce a **per-domain proximity for the single action** across the four cardinal domains and take the **minimum**:
- **phronesis** — quality of the good/evil/indifferent understanding (the current within/outside + value-error logic largely maps here).
- **dikaiosyne** — quality of the *what-is-owed-to-all-affected-parties* assessment (NEW; see Change 2). This is the term whose absence is D1.
- **andreia** — response to the genuinely fearful vs safe (read `phobos` passions + urgency).
- **sophrosyne** — ordering of impulse/desire (read `epithumia`/`hedone` passions).

Take the **minimum across the engaged domains** — reuse the **`weakest()` PATTERN** from `proximity-domains.ts:54` (KP-04 unity thesis). **Note the reuse is the *aggregation pattern* only:** the existing `computePerDomainProximity` (`proximity-domains.ts:66`) aggregates over *multiple actions* each already carrying one proximity; the §4 work needs a **new per-domain proximity computation for a single action**, then the same min-fold. Do not assume `weakest()` drops in unchanged.

### Change 2 — obligation resolution as a required oikeiosis field (closes D1, the hard part)
When `assessOikeiosis` identifies a circle, the obligation **must be evaluated before dikaiosyne can score above `reflexive`**:
- **met** → dikaiosyne scores at the level the rest of the evidence supports.
- **violated** → dikaiosyne floors at `reflexive` (regardless of other findings).
- **indeterminate-argued** → dikaiosyne scores at most `deliberate` (the unresolved justice question is itself a finding) — *argued, not defaulted*.

**The dependency that makes this Critical + non-trivial:** the current `computeObligationMet` (`:910`) is a crude lexical scan (`FULFILMENT_LANGUAGE` vs `FAILURE_LANGUAGE`) that returns `null` on any calm complier (they do not say "I failed them") — which is exactly why D1 leaks. A deterministic root fix must resolve the obligation *robustly*, which the lexical scan cannot. Two routes (the §4 session must choose + adversarially test):
  - **(2a)** require Layer 1 to extract an explicit **obligation assessment** per circle (a richer extraction contract — pushes the work into the LLM extraction, where it can reason about what is owed). This is the principled route and is what makes the deterministic floor sound; it also moves the **Locus-2 risk** (does extraction reliably surface the violation) into the open — the §4 verdict-equivalence battery must measure it on the full sandwich.
  - **(2b)** a deterministic heuristic over the existing signals (circle present + value-error toward another + no fulfilment language → presumptive `violated`) — cheaper, no extraction change, but weaker and itself gameable. Likely a *floor*, not the full fix.

This is the move the existing **guardrail justice bridge** makes with a bounded LLM call (`guardrail-sandwich.ts` `resolveJusticeObligation`); §4 folds that resolution into the **signed deterministic proximity** so the gate verdict becomes reproducible-from-signed-assessment again and the **bridge retires** (ADR-010 §3 expiry).

### Change 3 (separable, can land first) — fix the `hasDeliberation` proxy (closes D4)
Do **not** count the `"No circles engaged in this snapshot"` note as deliberation. Either (a) have `assessOikeiosis` leave `deliberation_notes` empty when no circle is engaged (move the "no circles" note to a separate field), or (b) derive `hasDeliberation` from an actual deliberation signal (tensions / balanced verdicts / examined value-errors) rather than `deliberation_notes.length`. This is a small, well-bounded correctness fix; it could be its own first slice and verified independently.

## 4. Architecture + process (why this is its own `code-critical` session)

This is the **shared `/api/reason` engine** (AC8) — the same `applyMechanisms` consumed by the consult tool, the trust-layer accreditation, the reflect Q4 input, and (via the deterministic core) the assent gate. Changing `computeProximity` **changes consult determinism** — the proximity distribution shifts toward conservatism on other-affecting actions; **that is the point**, and some currently-`principled` assessments will drop. So the §4 session must run the **ADR-009-style arc**:
1. A fixtures / idempotency pass (the existing substrate `tsx` suites + new per-domain fixtures).
2. A **verdict-equivalence battery on `/api/reason`** run on the **FULL sandwich** (real Layer-1 LLM + Layer-2) — this is where **Locus 2** (extraction reliability) is finally measured. This repo-only battery's fixtures (especially P1/P4/P5) become its known-quality seeds. **It must add the over-strictness direction** the repo-only battery did not probe — confirm the dikaiosyne fix does NOT wrongly floor a *genuinely good* calm action (the good controls P1a/P1c/P2a/P3a/P4a/C2 must keep their high scores). Only-lenience coverage is half the validity question.
3. An adversarial pre-activation review.
4. Flag-gated activation (a new flag; flag-off byte-identical), founder-walked.
5. **Retire the guardrail justice bridge** once `computeProximity` floors natively (ADR-010 §3 expiry; signed == surfaced again).

## 5. The gaming-robustness bar (ADR-012 — the model-creator prerequisite) + the scoping bound

- **Robustness under optimization (D2):** for the model-creator/weights use, a *training target is optimized by construction*, so the §4 fix must be tested **adversarially** — a score-optimizer must NOT reach `sage_like` (or any threshold-passing rank) on an injustice by naming factor-types. The battery's P5 fixtures become **regression fixtures**: post-fix, `P5a` must NOT score `sage_like`. ADR-012 §4 is explicit that the weights claim is **not made publicly until this bar clears** (pre-0h, nothing is claimed — a standing constraint, not a live exposure).
- **The epistemic-accuracy scoping bound (D3):** the engine measures *Stoic reasoning temperament + justice structure*, not *factual correctness of a business decision*. A calm decision that missed a dispositive fact scores like one that caught it. §4 does **not** add a fact-checker (out of the engine's remit). Instead, the **profile claim must be scoped honestly**: the profile reads *how the decision was reasoned*, not *whether the decision was factually right*. This bound belongs in the public-contract language whenever the profile is surfaced (R18).

## 6. Sequencing

D4 (Change 3) is separable and low-risk → could be a first small slice. D1/D2 (Changes 1+2) are the core and gate the honest profile claim + the bridge retirement. The full-sandwich verdict-equivalence battery (Locus 2) is part of the §4 session, not this one. After §4 lands + clears the adversarial gaming bar: the `practice-on`/`practice-off` rename (its own small step), then logos-mode + the model-creator signal (future, gated on the validated + gaming-robust engine).

---

*End of §4 scope. This is the build spec for the carried `code-critical` successor. The battery quantified the gap (apatheia/dikaiosyne +3 ranks; gaming to sage_like; a second hasDeliberation defect); this fix closes it natively in `computeProximity`, lets the guardrail justice bridge retire, and is the prerequisite for the honest practice-mode profile. The 0h call remains the founder's.*
