# Next-Session Prompt — Trust Layer S2: evidence weighting + verdict confidence (the deterministic weighting lib)

**Stream:** founder.
**Tier:** `code-elevated` — a pure deterministic library. NO schema, NO prod, NO flag, NO perimeter/auth touch (it computes; S3/S4 consume it). Lean + Elevated template.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 §3 row 2, §5 A2 + A5).
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A5** (the seven confidence tiers) + **A2** (domain distance) are the load-bearing specs; read both verbatim.
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S2.
**Predecessor close:** `operations/handoffs/founder/2026-07-08-trust-layer-S1-trust-state-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S1-TRUST-STATE-BUILT-…`.

## Why this session matters

S1 built the trust state + typed events + A3 decay, with the event→level transition realising the DIRECTION coarsely (a hysteresis-bounded ±1 ordinal step) and leaving the proportional MAGNITUDE — the mentor's "∝ domain match × coverage continuity", "∝ gap duration × domain relevance" — as a marked S2 seam. S2 fills that seam: the pure functions that weight evidence and compute per-verdict confidence, which S3 (the combiner) and S4 (the intervention engine) then consume. It is a deterministic lib — the lowest-risk slice in the arc — but it is where the mentor's A2 + A5 precision answers become code, so fidelity to the verbatim record is the whole game.

## What S2 builds (per ADR-013 §5 A2/A5 + build plan §S2)

1. **A5 — the seven confidence tiers, as a pure function.** `Depth > Signature > Corroboration > Recency`, **each a multiplier on base confidence, the weakest dimension sets the ceiling** (a deep-but-unsigned verdict cannot compensate with depth). The canonical ordering (verbatim A5): (1) deep+signed+corroborated+recent → max; (2) standard+signed+corroborated+recent; (3) deep/standard+signed+**un**corroborated+recent; (4) deep/standard+signed+corroborated+**aged**; (5) **quick**+signed+corroborated+recent (depth is the limiter — a quick screen is triage, explicitly lower than standard at equal other dims); (6) **unsigned** (any depth/corroboration/recency); (7) **profile-prior only** (un-profiled — S1 already defaults there). The corroboration input is the LIVE `corroboration` report's finding vocabulary (`corroborated|uncorroborated|contradicted`) that rides inside the signed assessment (mentor A1 routing key — S3 consumes it, but S2 reads the corroboration dimension for the tier).
2. **A2 — the domain-distance rule.** Distance is **functional role overlap on virtue-domain demands**, NOT task-content similarity. Over a **deployer-defined function-type taxonomy** (not a canonical one): each function type carries a four-virtue-domain weight profile; `distance = Σ|Δweights|` across the four domains; a credential transfers **per-dimension** at a proportional discount. **The zero-confidence floor:** above the deployer-set threshold, credential confidence in the target domain is **zero**, and the infrastructure must ENFORCE that a zero-confidence credential can never contribute to a proceed verdict **on a task requiring that domain** (domain-scoped — the same credential may still contribute on tasks requiring domains where its per-dimension confidence is nonzero). Restore the exact A2 domain-scope qualifier (the S0b review fold).
3. **The three evidence tiers + justice-surface modifier** (ADR §3 row 2 / mentor spec 2): Tier 1 credential (highest; scoped by coverage continuity + domain distance) > Tier 2 behavioural condition-matched > Tier 3 profile prior; the **justice-surface modifier** — a task affecting non-consenting parties requires credential coverage of the *justice-evaluation function*, not just the task function (reduced weight otherwise).

## Wiring into S1 (the seam already marked)

S1's `derive-trust-events.ts` records the raw signals in the event `payload` (demonstratedProximity, coverageContinuous, coverageStatus, obligationStatus, fabricationRiskLevel) exactly so S2 can weight them. S1's `trust-transition.ts` + `trust-aggregate.ts` carry `// S2 seam` comments where the coarse ±1 / minimum-domain core is refined by A2/A5. S2 is a NEW pure lib (`website/src/lib/substrate/trust-core/evidence-weighting.ts` + `confidence-tiers.ts` or similar) that S3/S4 import; **do not change S1's persisted schema** — S2 layers confidence/weighting ON the stored state at read/combine time. Keep S1's engine byte-identical unless a fold is genuinely required (and if so, re-run the S1 battery).

## Procedure (lean + elevated)

- **Read** the cache + the S1 close + ADR §3/§5 A2/A5 + the A2/A5 verbatim answers, then the S1 trust-core files (types, transition, aggregate, derive — see the seams).
- **Build** the pure A5 tier function + the A2 distance/transfer/zero-floor function + the tier-weighting, all deterministic + unit-tested (a tsx battery in `trust-core/__tests__/`, mirroring the S1 battery style; instrument-fidelity — worse evidence → strictly lower confidence; the weakest-dimension-ceiling property; the zero-floor enforcement property).
- **Verify** tsc 0; `npm run build` 0 (only if a route/page is touched — S2 should touch none, so build may be skippable, but run it if any registered file changed); the new battery; re-run the S1 battery green.
- **Adversarial review** (Workflow PR15 or first-hand per §4 — check the credit balance first): A5 tier fidelity vs the verbatim ordering; A2 distance math + the zero-floor enforcement (can a zero-confidence credential reach a proceed?); the weakest-dimension-ceiling property; instrument-fidelity (never beats-bare). Fold every confirmed finding.
- **Records** (lean+elevated): decision-log entry + close + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the S3 prompt (the combiner — mentor A1; note S3 goes Critical at wiring).

## Session shape
Reads 25–35m · A5 tiers 40–60m · A2 distance 40–60m · tier weighting 20–30m · battery 40–60m · verify 15–25m · review + folds 40–60m · records 25–35m · **~3.5–5 h**.

## Rollback
`git revert` the build commit — a pure lib + tests; nothing deploys, no schema.

## Forecast
Ends with the deterministic evidence-weighting + confidence-tier lib built + battery-verified + reviewed, ready for **S3 (the multi-source combiner, mentor A1 — Critical at wiring)** and **S4 (the intervention engine, MEASURE mode)**. S2 + S3 are parallelizable after S1; S5–S7 (discernment) parallelizable with S4. Enforcement gated on S11; weights BLOCKED; the 0h call remains the founder's.

End of prompt.
