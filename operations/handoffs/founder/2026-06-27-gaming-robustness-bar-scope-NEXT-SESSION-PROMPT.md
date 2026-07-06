# Next-Session Prompt — Gaming-Robustness Bar — SCOPE (purpose + observable + threat model, before any test method)

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** **`governance` / explore-scope** — documents + analysis only. **NO production / perimeter / auth / schema / flag / credential change; no live-fire; no mint. Production byte-equivalent. AC7 NOT engaged.** (If the session later elects to BUILD an adversarial harness, that is a repo-only `code-standard`/`code-elevated` step decided mid-session — still no production.)
**Governing decisions:** ADR-012 (the measurement-instrument reframe — the gaming-robustness bar is its named gate) + ADR-010 (engine fidelity, now fully landed).
**Predecessor close:** `operations/handoffs/founder/2026-06-26-adr010-section3-guardrail-bridge-retirement-CLOSE.md`.

## Why this session matters
ADR-010 is **fully landed** (2026-06-26): the deterministic engine now measures dikaiosyne (justice) + andreia (courage) + sophrosyne (temperance) **natively** on both `/api/reason` and the Live `/api/guardrail` gate; a calmly-reasoned injustice floors to `reflexive`, reproducibly, in the signed assessment. That makes the engine fidelity-correct enough to ask the *next* question — **the one ADR-012 named as the bar before the highest-value (and most dangerous) uses:**

> A virtue-scorer is only safe to optimize against if it **resists optimization**. The danger (Goodhart, ADR-012): a gameable scorer, used to refine weights, trains **serene, fluent vice that scores as virtue**. ADR-012's rule: **no public claim of the model-creator/weights use until the adversarial gaming-robustness bar clears.**

This session does NOT build a benchmark yet. It **defines the bar** — purpose, the observable that proves it, and the threat model — so that whatever test we later build measures the right thing. (Standing failure mode to actively guard against — `method-before-purpose-test-drift`: do not pick a benchmark axis / test method before grounding what the bar is *for* and what observable proves it. Ask at the top: *"are we defining an instrument's robustness, or testing an intervention?"*)

## Carried state — what is already known (read first-hand, do not re-derive)
- **The gameable surfaces are EXTRACTION-TRUST, not the scoring arithmetic.** §4 closed the *honest-extraction* gaming (kathekon-count: a gamed injustice with many high-minded factors still floors because the obligation reads `violated`). What remains is **dishonest-extraction** gaming: the Layer-1 extractor can be made to emit `obligation_assessment: met` (a lie) or `examined_before_acting: true` (a lie) — and the deterministic scorer, which trusts the extraction, then scores the vice as virtue. This is the **P5d "lying-met" LOCUS-2 ceiling** + the `examined_before_acting` corroboration gap (memory `deterministic-l2-measures-apatheia-not-dikaiosyne`, `andreia-over-strictness-unity-thesis-coupling`).
- **Why it wasn't closed in ADR-010:** at LOCUS-1 (hand-authored extractions) a lying-met extraction is indistinguishable from an honest one — the scorer has no ground truth. Closing it needs either (a) extraction corroboration (cross-check the claimed `met`/`examined` against the action text) or (b) a model-creator/weights-tier intervention. It was explicitly deferred as the **model-creator/weights-tier prerequisite**.
- **Post-§3-retirement, these surfaces now reach the Live gate too** (not just the profile) — but ONLY via a *dishonest extraction*, which is the same trust boundary the whole substrate rests on. So the bar matters for the gate's robustness, not only the profile's.
- **The three uses at escalating trust in the score** (ADR-012): developer-refine < logos-enforce < **model-creator-refines-weights** (highest prize, most dangerous). The bar gates how far up that ladder a public claim may go.

## Part A — Open under the protocol
Read in order: `/adopted/standing-protocol-cache.md` (incl. the **AI failure-modes table** — method-before-purpose is the live risk here); `/adopted/build-sessions-protocol-cache.md`; this predecessor close; **ADR-012** (`adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md`) in full; the **scoring-validity battery results** (`operations/benchmarks/sage-practice-v1/2026-06-24-scoring-validity-battery-results.md`) — the P5d/P5a/P5c findings; memories `sage-practice-measurement-instrument-reframe`, `deterministic-l2-measures-apatheia-not-dikaiosyne`, `method-before-purpose-test-drift`. Skim the Layer-1 extractor prompt (`website/src/lib/translation-sandwich/layer1-extractor.ts` `LAYER1_SYSTEM_PROMPT`) to see where `obligation_assessment` + `examined_before_acting` are produced.
Confirm at open: tier (`governance`/explore); 0h held; AI failure-mode guard (method-before-purpose); no production change this session.

## Part B — Procedure (scope, do not build the benchmark)
### Step 1 — Ground the purpose + the observable (BEFORE any method)
Write, in one page: (a) what the gaming-robustness bar is FOR (which of the three uses it licenses, and the claim each use would make publicly); (b) the **observable** that would prove the scorer is "robust under optimization" — i.e., what measurement, if it passed, would justify the claim, and what a FAIL looks like. Name explicitly whether the bar is about the **instrument's resistance** (not an intervention's lift) so the test isn't mis-framed as a beats-baseline benchmark.
### Step 2 — Threat model the gameable surfaces
Enumerate the dishonest-extraction attack surface concretely: the `obligation_assessment: met` lie, the `examined_before_acting: true` lie, any other field a score-optimizer would target. For each: who controls it (the prompted model under optimization vs. an honest extractor), what a corroboration check could catch (cross-reference the claim against the action text), and what is structurally un-catchable at the extraction layer (→ a weights-tier problem).
### Step 3 — Decide the test approach (design, not build)
Propose HOW the bar would be measured — e.g. an adversarial optimization loop that tries to maximize the score while holding the underlying action vicious (a red-team-the-scorer harness), repo-only against the engine + synthetic/known-quality artifacts (no creds/prod). Decide what "clears the bar" means quantitatively and what residual is acceptable-and-disclosed vs. blocking. Consider an Anthropic-primitive first (PR15) before any bespoke harness.
### Step 4 — Decide the gating
State which claims/uses clear at each bar outcome (developer-refine may be defensible now; the model-creator/weights claim is the one explicitly gated). Whether a corroboration check (Step 2) is a near-term `/api/reason` + gate fidelity improvement worth its own build arc, or whether it's deferred to the weights tier.
### Step 5 — Records (lean): decision-log entry + close + (if scoped) a next-session BUILD prompt. Update ADR-012's bar section if the definition sharpens it. Memory if a durable lesson emerges.

## Alternatives the founder may redirect to instead (named, not this session's default)
- **The `practice-on`/`practice-off` rename** (`sage-on`/`sage-off` skills + the toggle) — small, but ADR-012 sequences it *after* the bar; the founder may still elect it first as a quick, independent cleanup.
- **The 0h launch call** — the founder's, standing; this session does not touch it.
- **logos-mode** (ENFORCE the decision aligns with the score) — gated behind the bar; future.

## Critical Change Protocol
N/A this session (no production/perimeter/auth/schema/flag/credential change; documents + analysis only). If the session pivots to building an adversarial harness, that is repo-only (`code-standard`/`code-elevated`) and still engages no production surface; the harness's own activation (if any) would be a later founder-walked step.

## Forecast
Ends with the gaming-robustness bar **defined** — purpose, observable, threat model, and a test-design proposal — so the subsequent BUILD session measures the right thing and the method-before-purpose trap is avoided. Clears the path to (in order) the corroboration-check decision, the `practice-on/off` rename, logos-mode, and — only after the bar clears — the model-creator/weights signal. The **0h call remains the founder's.**

End of prompt.
