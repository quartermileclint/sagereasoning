> **⛔ SPENT — executed 2026-07-08** under `D-TRUST-LAYER-S3-COMBINER-BUILT-REVIEW-FOLDED`. The combiner is built (`combiner.ts`, battery 106/0, review-folded). Close: `operations/handoffs/founder/2026-07-08-trust-layer-S3-combiner-CLOSE.md`. **Next is S4** — `operations/handoffs/founder/2026-07-08-trust-layer-S4-intervention-engine-NEXT-SESSION-PROMPT.md`. Retained for the record only.

# Next-Session Prompt — Trust Layer S3: the multi-source combiner (mentor A1)

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-elevated` for the **pure combiner lib** (this session's default) → **`code-critical` at WIRING** (when the combiner is wired into a live decision path OR the justice-surface **LLM second-reader** call is added — a real Anthropic call on a live surface). Build the pure combiner + battery this session; keep the LLM second-reader and any live wiring **behind the trust-core flag / dark**, and treat the wiring as its own founder-walked 0c-ii. Lean + Elevated template for the lib; escalate to Full only if you wire.
**Governing frame:** /adopted/standing-protocol-cache.md.
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 **§3 row 6 + the spec-6 aggregation rule at the end of §3**, **§5 A1**).
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A1** (source-confidence weighting, post-§4) is the load-bearing spec; read it verbatim. Where the ADR and the verbatim record diverge, the verbatim record wins.
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S3.
**Predecessor close:** `operations/handoffs/founder/2026-07-08-trust-layer-S2-evidence-weighting-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S2-EVIDENCE-WEIGHTING-BUILT-REVIEW-FOLDED`.

## Why this session matters

S2 built the per-source primitives: the A5 confidence tier of a single verdict and the A2 evidence weight of a single credential/behavioural/prior source on a required domain (with the zero-floor enforced). S3 is where **multiple sources are combined into one trust verdict** per the mentor's A1 routing, and where the **cross-session / cross-source** rules land. This is the last pure-lib slice before the intervention engine (S4) — it turns "weigh one source" into "combine all sources and decide whether they agree, conflict, or must pause."

## What S3 builds (per ADR-013 §3 row 6 + §5 A1 + build plan §S3)

1. **Mentor A1 — source-confidence routing, EXACTLY as stated (post-§4, the live state):**
   - **Default tasks (no justice surface):** the deterministic engine is authoritative — **no parallel LLM** (running both adds latency, not fidelity).
   - **Justice-surface tasks, pre-corroboration:** deterministic primary on the proximity verdict; the LLM is a **second reader on the OBLIGATION FIELD ONLY** (met / violated / indeterminate-argued). Agree → the deterministic verdict stands. **Conflict → pause-and-escalate** (never average).
   - **Justice-surface tasks, post-corroboration (the LIVE state since 2026-07-08):** deterministic primary on the proximity verdict **and on CORROBORATED obligation fields**; the LLM is **supplementary on UNCORROBORATED obligation fields, with explicit low-confidence marking** (it detects what the text does not say — structurally weak evidence); **conflict pauses regardless of which source is primary.** The corroboration finding vocabulary (`corroborated | uncorroborated | contradicted`, riding inside the signed assessment) **is the routing key** — S2 already reuses `CorroborationFindingStatus`; S3 routes on it.
2. **The spec-6 cross-domain aggregation rule** (ADR §3, end): *aggregate trust = the minimum domain trust level, modified by justice-surface evaluation, weighted by coverage continuity and source confidence (the S2 pieces), with conflicts escalating to pause rather than averaging.* This is the minimum across the subject's per-`(agent_id, domain)` **trust levels** — DISTINCT from the S1 within-examination four-virtue minimum-domain rule. It **refines S1's `computeAggregate`** (the S2 seam marked in `trust-aggregate.ts`): fold S2's `weighEvidence` / confidence into the coverage/source-confidence weighting, keep the minimum-domain core, and surface conflicts as pause (never average).
3. **Combining verification results (spec 6):** within-session → **most recent supersedes** (reuse the LIVE CI-4 marker semantics — `analyseLoopClosure` / the `examination.{ref,depth_tier,prior_feedback_ref}` markers; do NOT re-implement); cross-session → **weighted recency, PER-DOMAIN ONLY** (a domain's evidence updates only that domain — never bleed across domains). **Conflicts ALWAYS pause, never average** (the binding spec-7 constraint, surfaced here as the combiner's conflict output for S4 to act on).

## What S3 CONSUMES from S2 (already built)

`website/src/lib/substrate/trust-core/confidence-tiers.ts` — `assessConfidence(dims | null)` → A5 tier + monotone weight + `ceilingDimension`. `evidence-weighting.ts` — `domainDistance`, `computeCredentialTransfer` (per-dimension τ + the zero-floor), `credentialCanContribute` (the enforcement primitive), `weighEvidence` (the composed per-source weight; **credential tier REQUIRES a transfer — discriminated union**; a zeroed credential returns weight 0 / contributes false; the justice deficit lowers but never zeroes). **S3 must honor the A2 enforcement:** a source with `contributes === false` (or `credentialCanContribute === false` on the required domain) must count as **NO coverage** for that domain — it must not be averaged in as a proceed, and a domain whose only evidence is zeroed falls back to profile-prior (mentor A2: "equivalent to no credential"). This is the S2→S3 handoff the S2 lib documents.

## The LLM second-reader (the ONE Critical-at-wiring piece)

The A1 second reader is a bounded LLM call on the obligation field only (Sonnet per cache Element 6 — multi-mechanism), added ONLY on justice-surface tasks, ONLY on the fields A1 names (pre-corroboration: the obligation field; post-corroboration: uncorroborated obligation fields). Build the routing + the conflict/agree logic PURE + dark this session (inject the LLM result as a parameter; test with fixtures). The real call + any live wiring is the founder-walked 0c-ii successor (a real Anthropic call = cost + a live surface). Keep it behind `SUBSTRATE_TRUST_CORE_ENABLED` (or a new S3 flag) — nothing live this session.

## Procedure (lean + elevated)

- **Read** the cache + the S2 close + ADR §3 row 6 + the spec-6 rule + §5 A1 (verbatim), then the S2 lib + the S1 `trust-aggregate.ts` / `trust-transition.ts` seams.
- **Build** the pure combiner (`website/src/lib/substrate/trust-core/combiner.ts` or similar): the A1 router (default / justice-pre-corrob / justice-post-corrob), the agree/conflict resolver (conflict → pause, never average), the cross-session per-domain weighted-recency fold, and the spec-6 aggregate refinement (folding S2 into `computeAggregate` — keep S1 byte-identical unless a fold is genuinely required; if you refine `computeAggregate`, re-run the S1 battery). The LLM second-reader is a pure function taking the LLM verdict as input (dark).
- **Verify** tsc 0; the S1 + S2 batteries green; a new S3 battery (instrument-fidelity: conflict→pause never averages; per-domain isolation; the A2 zeroed-source→no-coverage handoff; the A1 routing on the corroboration key; worse evidence → lower-or-equal aggregate). `npm run build` if any registered file changed (the pure lib should touch none).
- **Adversarial review** (Workflow PR15 or first-hand per §4 — **check the account credit/session balance first**; the S0a/S0b/S1/S2 sessions all hit the limit): A1 routing fidelity vs verbatim; the conflict-never-averages property (can any path average a conflict to a proceed?); per-domain isolation (does cross-domain evidence ever bleed?); the A2 zeroed-source handoff (does a zeroed credential ever get averaged in?); claims-vs-code. Fold every confirmed finding.
- **Records** (lean+elevated): decision-log entry + close + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the S4 prompt (the intervention engine, MEASURE mode + transparency tracking; `code-elevated` dark).

## Session shape
Reads 25–35m · A1 router 40–60m · conflict/agree + per-domain recency 40–60m · spec-6 aggregate refinement 30–45m · battery 40–60m · verify 15–25m · review + folds 40–60m · records 25–35m · **~4–5.5 h**.

## Rollback
`git revert` the build commit — a pure lib + tests; nothing deploys, no schema, no flag set. (If `computeAggregate` was refined, the revert restores S1's minimum-domain core; the S1 battery re-passes.)

## Forecast
Ends with the deterministic multi-source combiner built + battery-verified + reviewed, the A1 routing + conflict-pause + per-domain recency + spec-6 aggregate in hand, ready for **S4 (the intervention policy engine, MEASURE mode + the transparency ledger — mentor A4/spec-7; enforce is S11)**. S5–S7 (discernment) parallelizable with S4. Enforcement gated on S11; weights BLOCKED; the 0h call remains the founder's.

End of prompt.
