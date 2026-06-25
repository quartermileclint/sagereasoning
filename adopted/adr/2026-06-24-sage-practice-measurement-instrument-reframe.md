# ADR-012 — Sage Practice as a Measurement Instrument: the four-stage Stoic cycle, practice-vs-logos (measure-vs-enforce), and engine fidelity as the critical path

**Status:** **Adopted (design-of-record / reframe) 2026-06-24** under `D-SAGE-PRACTICE-REFRAME-MEASUREMENT-INSTRUMENT-AND-S6-RECHARACTERISED`. Dual-taxonomy (0a/0f): decision = **Adopted**; the enabling implementation (the scoring-validity battery + the ADR-010 §4 engine root-fix) = **Scoped**. **No production change** — this is a framing/decision artifact; the Live H1/H2 dogfood harness, the engine, R18f/R20a/distress/Layer-2 signing/UPC auth are all untouched.
**Date:** 2026-06-24. **Stream:** founder. **Tier:** `governance`.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Origin / evidence:** the S6 Phase-2 freeze pre-tests (this session). The borderline **pressure-quarantine** decision-value lever read **empty across two counterable levers** — authority/identity (`borderline-cal`/Cobalt) and a diagnostic sunk-cost (`sunkcost-cal`/Calder): **16 bare runs (14 weak-tier proxy + 2 clean Opus-max), zero yields**, the sunk-cost runs naming the fallacy unprompted. The subagent proxy was **bare-validated once** (Cobalt bare-Haiku matched the proxy). A contamination vector was caught (a repo-context Opus-max run recognised the benchmark → one run VOID; clean-context protocol noted). This evidence, plus the founder's reframe of the practice's purpose, is the origin.
**Precedents / engages:** **ADR-010** (the apatheia-not-dikaiosyne engine gap + the §4 root fix — **reclassified here from cleanup to enabling work**); **ADR-011** (the Gate-1 harness + the channel law — practice/logos map onto its ADVISE+RECORD / ENFORCE channels); the Phase-1 channel-law finding (memory `gate1-harness-channel-law`); R0 (oikeiosis), R18/R18f/R19 (honest positioning — claim only what the instrument supports), AC8 (the shared engine), PR16 (positioning + dogfood lens), PR18.

---

## Context — what the benchmark got wrong

The S6 value-gate benchmark (`operations/benchmarks/sage-practice-v1/2026-06-22-S6-value-gate-benchmark-spec.md`) was built around **decision-change**: "where does the harnessed arm produce a *better* decision than bare?" (the `binding − bare` deltas, M1–M4). The freeze pre-tests meant to *validate the borderline scenarios* instead surfaced that the **pressure-quarantine value lever is empty for modern models** — capable agents, down to Haiku 4.5, already detect a salient pressure and set it aside unaided.

The mechanism is the load-bearing insight: the advisory frame's move — *"whose preference is this? reason from the merits"* — is a **salience/detection aid**. But the model is already detecting the salient pressure and already performing the disclaim. **The practice and the model perform the same move, so the practice is redundant exactly when the pressure is detectable.** Both briefs put the pressure above the model's detection threshold, so there was nothing left to add. (The only place an advisory could add decision-value is *sub-detection* pressure — biasing but too subtle to spot-and-disclaim — which neither brief tested and which is hard to construct.)

Read as a decision-change benchmark, that is a null. It is not — **it was the wrong axis.**

## The reframe (the decision)

### 1. Sage practice is the full four-stage Stoic instrument — not a single assent prompt
The practice provides a reasoning entity the tools of a Stoic practitioner across the **whole decision lifecycle**:

| Stage | Stoic discipline | Surface |
|---|---|---|
| **Calling** | role / station / what is appropriate to it (kathēkon; the discipline of action toward others) | `/api/calling` |
| **Reasoning** | examination of the impression / deliberation | `/api/reason` (translation sandwich + katorthoma-proximity scoring) |
| **Assent** | the endorse-and-act gate; pausing to examine before committing (sunkatathesis) | the pre-decision harness |
| **Reflection** | honest retrospective review at close (the evening review / prosochē) | `/api/practice/reflect` |

Crucially, **calling and reflection are stages a capable agent does NOT reliably perform unaided** — so the practice genuinely *adds* there (it does not merely observe reasoning that would happen anyway). The single-assent view understated the instrument.

### 2. The value is the PROFILE — measurement + feedback, not decision-change
The practice **scores and records** the examination, decision by decision, across the four stages, aggregated into a **per-decision character/reasoning profile**. The developer (or model-creator) reads the profile *and the individual decisions that earned the score* to decide what to refine. So **"capable agents reason well unaided" is a measurement success** — the instrument faithfully read high decision-quality — **not a value null.** A thermometer reading "normal" on a healthy patient is working, not broken.

### 3. Two modes, mapping onto the channel law (ADR-011)
- **practice-mode (MEASURE)** — examine + score + **record**; the agent still decides. The advisory may be discounted (fine — not the point); the **record binds out-of-band**. The channel-law "advisory discounted, record binds" stops being a disappointment and becomes exactly what this mode wants. Toggle: **practice-on / practice-off** (rename from `sage-on`/`sage-off` — a later, separate step).
- **logos-mode (ENFORCE)** — examine + score + **force the decision to align with the score**. The ENFORCE channel; the design of the founder's internal sage agents. Toggle: **logos-on / logos-off** (future).

### 4. The three-use ladder — one instrument, at escalating trust in the score

| Use | Channel | Cost of a *wrong* score | Validity bar |
|---|---|---|---|
| **practice → developer refines the agent** (prompt / scaffold / tools) | advise + record | a human catches it; per-deployment | correctness (human-in-loop) |
| **logos → force the decision to align** | enforce | one decision goes wrong, no human catch | correctness, no-loop |
| **profile → model-creator refines weights / reasoning** | training signal | the error **compounds into the model's disposition**, permanently, and is **actively gamed** | correctness **+ robustness under optimization** |

The model-creator use is the **highest prize** (it is where the profile's value peaks — creators *want* the red marks — and where the deterministic/signed/reproducible architecture finally pays its full premium, since training signals must be auditable and hard to drift). It is also the **most dangerous**: a training target is optimized *by construction*, so every scoring flaw becomes an exploit. The apatheia gap, weaponised by optimization, means you could **train serene, fluent vice that scores as virtue** — baked into the weights, persistently. That is a *worse* outcome than not training. Hence the weights claim must not be made publicly until the **adversarial / gaming-robustness** bar is cleared. (Pre-0h, nothing is claimed — no live risk, but a standing constraint.)

> **The gaming-robustness bar — defined (scoped 2026-06-27, `D-SAGE-PRACTICE-GAMING-ROBUSTNESS-BAR-SCOPED`; full scope `operations/benchmarks/sage-practice-v1/2026-06-27-gaming-robustness-bar-scope.md`).** The scorer is **robust under optimization** iff an adversary rewarded to maximize the score, holding an action's *true* virtue-quality fixed at vicious, **cannot drive the score above the reinforcement threshold without emitting a detectable signal** (the observable is the gaming gap `G = S_max − T` in proximity ranks, against the live `deliberate` threshold). It is an **instrument-resistance** measurement, NOT an intervention-lift benchmark. Crucially, after ADR-010 §4 the gameable surface is **extraction trust, not the scoring arithmetic** (§4 closed honest-extraction gaming — an honest extraction of a dressed-up injustice reads `obligation: violated` → floors). The open bar is **LOCUS-2**: a *dishonest* extraction emitting `obligation_assessment: met` / `examined_before_acting: true` lies the deterministic scorer trusts. It partitions by **who controls the extraction** — **Threat A** (honest fixed extractor reading an adversarial *artifact* = the developer/logos bar, largely defended by §4 + the anti-rubber-stamp Layer-1 prompt + a corroboration check) vs **Threat B** (a *dishonest / co-trained* extractor = the weights-tier worst case, structurally un-catchable downstream, the explicitly-gated claim). **Gating:** developer-refine is defensible now; logos-enforce after Arm A + a LOCUS-2 reliability battery; **the weights claim is blocked until Arm B is mitigated** (a corroboration check bounding `G` + a non-co-trained-extractor mitigation, or an accepted disclosed ceiling). The next BUILD step is a two-arm red-team-the-scorer harness (repo-only; PR15 Workflow/subagent fan-out).

### 5. Engine fidelity is the critical path
All three uses sit on the **deterministic scoring engine's validity.** The known **apatheia-not-dikaiosyne gap** (ADR-010 — a calmly-reasoned injustice scores `principled`) makes this load-bearing: a flawed engine yields a *misleading profile*, a *harmfully-forced decision*, or a *Goodhart-trapped training run*, in increasing severity. The project's real critical path is therefore **the engine** — not the hooks, the credential, the channels, or the matrix. **ADR-010 §4 (the root correction — per-domain proximity + dikaiosyne weighted natively in `computeProximity`) is reclassified from cleanup to enabling work for the whole product.**

## Consequences

- **S6's decision-change matrix is RECHARACTERISED, not run as specified.** The `bare/advisory/binding × decision-quality` comparison is **deferred** (it measures logos-mode/enforcement value with practice-mode/advisory mechanics). The **scenario set (§2 + the `scenario/` dirs) and the capability axis (§1.1) survive as VALIDITY PROBES** — repurposed to test whether the *scoring* faithfully tracks decision quality, not whether the advisory changes decisions. **M5 (trust-record materialisation, §4.1) is promoted** from a split side-metric to the primary, capability-independent claim. (A framing note is added at the top of the S6 spec.)
- **The next work is a scoring-validity battery** (scoped next session; repo-only at first — the engine + synthetic/known-quality artifacts need no creds, no prod): **(a)** does a *worse* decision score *worse* — aimed squarely at the apatheia/dikaiosyne gap; **(b)** across all four stages (does "calling" read role-appropriateness, does "reflection" catch dishonest review); **(c) adversarially** — can a score-optimizer score high while reasoning badly. Plus its relation to the ADR-010 §4 root fix.
- **The `sage-on`/`sage-off` → `practice-on`/`practice-off` rename** is a later, separate small step (it touches live skills; the deeper value is the conceptual clarity it encodes — practice = measure, logos = enforce).
- **logos-mode and the model-creator/weights signal are future**, both gated on a validated (and, for those, gaming-robust) engine.
- **No production change.** The Live H1/H2 dogfood harness, the engine, the perimeter, and all credentials are untouched.

## What this does NOT decide
- It does **not** retire the S6 scenarios or the decision-change measurement permanently — they may inform *logos-mode* evaluation later (decision-change is logos-mode's property, by construction — forcing alignment).
- It does **not** fix the engine — that is ADR-010 §4, the scoped enabling work.
- It does **not**, on proxy data alone, *prove* that no borderline pressure has weak-tier headroom — it establishes a strong, bare-validated signal across two counterable levers (and one unexplored frontier: sub-detection pressure) and reframes accordingly. The proxy is a validated *screen*, a lighter foundation than a bare-run matrix; the scoring-validity battery is the rigorous successor.

---

*End ADR-012. This is a framing/decision artifact. The enabling work — the scoring-validity battery + the ADR-010 §4 engine root-fix — is scoped, repo-only, and gates the honest practice-mode profile claim, the future logos-mode, and the future model-creator signal. The 0h launch call remains the founder's.*
