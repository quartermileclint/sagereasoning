# Next-Session Prompt — Trust Layer S8: the seven-layer reference harness (the first live consumer)

> **SPENT 2026-07-10** — executed under `D-TRUST-LAYER-S8-REFERENCE-HARNESS-BUILT-DARK-REVIEW-FOLDED`. Close: `operations/handoffs/founder/2026-07-10-trust-layer-S8-reference-harness-CLOSE.md`. Successor: `operations/handoffs/founder/2026-07-10-trust-layer-S9-dogfood-install-NEXT-SESSION-PROMPT.md`. Retained for the record; do not re-run.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-elevated → Critical at install`. The BUILD (generalizing the Gate-1 H1–H4 hooks onto the seven-layer harness + wiring the S1–S7 trust core / discernment engine / L4 audit into them) is `code-elevated`, repo-only, and byte-identical to production until the founder pushes + installs. **The INSTALL is a separate founder-walked `code-critical` 0c-ii** (a real Claude-Code hook install in the founder's loop, a standing credential, and — only if standing reflect-persist is elected — the Gate-1 S7 reflect-row erasure wiring); nothing this session pre-approves it. **ENFORCE is S11.**
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md (build-arc context).
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 §6 architecture — trust core + reference harness; the seven-layer framing; the five founder elections; the channel law) + **ADR-011** (the Gate-1 harness + the channel law — the reference this session generalizes).
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S8 (+ §S9 dogfood, which S8 sets up).
**Predecessor close:** `operations/handoffs/founder/2026-07-10-trust-layer-S7-l4-passion-audit-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S7-L4-PASSION-AUDIT-BUILT-DARK-REVIEW-FOLDED`.

## Why this session matters

Phases 0–2 built the whole **trust core** (S1 state/events/decay · S2 evidence-weighting/confidence · S3 combiner · S4 intervention engine + transparency ledger, MEASURE) and the **four-layer discernment protocol** (S5 profiles + collaboration record · S6 the L1–L3 engine · S7 the out-of-band L4 passion audit) — every piece a pure deterministic library with injectable extraction seams, DARK behind `SUBSTRATE_TRUST_CORE_ENABLED`, **with no live consumer**. S8 is the first consumer: it **generalizes the Gate-1 reference harness (ADR-011 H1–H4) onto the seven-layer harness anatomy** (Execution · Tooling · Context · Lifecycle · Observability · Verification · Governance) and **wires the trust core + discernment engine + L4 audit into the Verification + Governance layers** of a real Claude-Code agent loop — the reference integration the founder elected (election 1: "trust core + reference harness"). This is where the arc's Verification + Governance layers stop being libraries and become a harness an agent actually runs inside. It opens Phase 3 (the reference harness + dogfood).

## What S8 builds (per build plan §S8 + ADR §6 + ADR-011)

**Generalize Gate-1 H1–H4 onto the seven layers, channel-law-classified at every step (ADR-011: out-of-band binds; injected advice is advisory by design):**

1. **H1/H2 frames — the Context layer (advisory-by-design):** keep the existing Gate-1 pre-decision framing hooks (`UserPromptSubmit` top-level + `PreToolUse`/`Agent` subagents). Channel = ADVISE.
2. **H2 extended — the discernment call at subagent spawn (NEW):** when the orchestrator spawns a sub-agent (Task/Agent), run the **S6 discernment engine** (`runDiscernment` / `runDiscernmentWithExtraction`) over the candidate set, **open a collaboration record + set the A9 authority boundary** (`openDiscernmentSelection`), then run the **S7 out-of-band L4 passion audit** on the orchestrator's own selection reasoning trace (`runL4AuditAndCommit` — reads the tier, audits the trace via the real extractor, writes the readable-not-modifiable `l4_audit_result`, gates finalization). The **authority-boundary injection** into the delegated Task/Agent is the ENFORCE/INSTRUMENT channel; the discernment recommendation is ADVISE (MEASURE — the orchestrator selects).
3. **H3 at-action — the Verification layer:** keep the guard for the already-proven **irreversible-action class** (guard-deny, the one ENFORCE channel that exists pre-S11); **surface the S4 measure-mode intervention verdict + the trust-core reads** (`readTrustProfile`, the S3 combiner) as `additionalContext` (ADVISE — log-and-continue, never blocks except the irreversible class); keep the CI-4 iterate/loop-closure marker.
4. **H4 close — the Governance layer:** keep reflect + the accreditation write; **emit the S1 trust events** from the R18f-verified artifacts (credential-completed, reflect-completed-honest, the justice-surface events; the A8/A9 delegation-reflection events from the collaboration record S7/S6 populated).
5. **The real extraction wiring:** implement the **S7 `L4TraceExtractor`** + the **S6 `DiscernmentExtractor`** against the live Sonnet Layer-1 machinery (`extractFeatures` / the l1-supply path) — `extractFeatures(trace) |> l4TraceFeaturesFromLayer1 |> mapTraceFeaturesToL4Signals` for L4; the circle-alignment/condition-match reads for S6. This is the "same deterministic engine" A7/§4 name (the injected seams the pure cores left).
6. **Durable provenance JSONL** + **the five-layer kill-switch documentation** (credential revoke = the real one) + **OTel-GenAI-shaped span references** (design-for; nothing published — election 4).
7. **The `practice-on` / `practice-off` rename** rides here (it touches the live `/sage-on` `/sage-off` skills — a repo-only rename, its own careful step; the standing dogfood install is currently toggled OFF).

**Gate:** every load-bearing step is **channel-law-classified before it is trusted** (ADR-011). ENFORCE = out-of-band (guard-deny, authority-boundary injection, the write-once trust records). ADVISE = the injected frames + the surfaced measure-mode verdicts. INSTRUMENT = the accreditation + trust-event writes. **Binding the intervention verdict (ENFORCE beyond the irreversible class) is S11** — not this session.

## What S8 CONSUMES (all built — reuse, do not re-implement)

- **S6** `runDiscernment` / `runDiscernmentWithExtraction` / `openDiscernmentSelection` / `DiscernmentExtractor` (`discernment-engine.ts`).
- **S7** `runL4AuditAndCommit` / `runL4PassionAudit` / `readOrchestratorL4TrustTier` / `commitL4Audit` / `L4TraceExtractor` / `l4TraceFeaturesFromLayer1` / `mapTraceFeaturesToL4Signals` (`l4-passion-audit.ts`).
- **S4** the intervention engine + transparency ledger (MEASURE verdicts to surface).
- **S3** the combiner · **S2** evidence-weighting/confidence · **S1** the trust store + emission (`emitTrustEvents`, `readTrustProfile`, `readHonestReflectSummary`) + the derivers.
- **S5** the collaboration record + store (`openCollaborationRecord`, `recordAuthorityBoundary`, `recordL4AuditResult`, `updateCollaborationRecord`).
- The **live Gate-1 hooks** (ADR-011; the `.claude/gate1-hooks-block.json` canonical ON state, restorable via `/sage-on`) + the Sonnet Layer-1 machinery (`extractFeatures` / the l1-supply path).

## The discipline (non-negotiable this session)

- **Channel-law-classify every step** (ADR-011) before trusting it — out-of-band binds; injected advice is advisory.
- **MEASURE:** the intervention verdict + the discernment recommendation + the L4 disposition are all advisory records; only the already-proven irreversible-action guard-deny binds. ENFORCE (binding the verdict) is S11.
- **Flag-off byte-identity** for every live-route/skill touch; the trust-core writes stay gated behind `SUBSTRATE_TRUST_CORE_ENABLED` (unset ⇒ inert).
- **R18f-parallel:** no trust event / no L4 result without a verifiable examination artifact (the derivers + the S7 traceRef contract already enforce this).
- **Instrument-fidelity battery** (never beats-bare, KG-EX1): the harness composes the pieces correctly; the discernment→collaboration→L4→trust-event chain fires end-to-end on synthetic fixtures; the channel classifications hold.
- Adversarial review (Workflow PR15 or first-hand per the §4 precedent — **check the account credit/session balance first**). Fold every confirmed finding.
- The **INSTALL** (real hook install + standing credential + optional reflect-persist erasure wiring) is a **separate founder-walked `code-critical` 0c-ii** — S9. The named Gate-1 dogfood-credential rotation (from the 2026-07-08 activation close) still gates any `/sage-on` re-enable.

## Procedure (elevated build; Critical template only if the install is walked this session)
- **Read** the two caches + the S7 close + ADR §6 + ADR-011 + the build plan §S8/§S9, then the S6/S7 seams + the live Gate-1 hooks + the Sonnet Layer-1 machinery.
- **Confirm tier at open** (`code-elevated`; the install is a deferred Critical); model selection (the real extractors → Sonnet per AC1); KG1 at any DB-write seam; KG-EX1 (instrument-fidelity).
- **Build** the seven-layer harness generalization + the real extractor wiring + the discernment/L4 spawn integration + the provenance JSONL + the kill-switch docs + the `practice-on/off` rename, all repo-only/dark.
- **Verify** tsc 0; the S1–S7 batteries green; a new S8 harness-integration battery; `npm run build`.
- **Adversarial review** (channel-law fidelity; flag-off byte-identity; the discernment→L4→trust-event chain; the real-extractor fail-honest; the rename's skill-touch safety). Fold.
- **Records** (elevated close + decision-log + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the **S9 prompt** — the founder-walked dogfood install + instrument-fidelity validation).

## Session shape
Reads 45–60m · the seven-layer generalization + channel classification 60–90m · the real extractor wiring (S6 + S7) 60–80m · the spawn-time discernment/L4 integration 60–80m · provenance JSONL + kill-switch docs + the rename 45–60m · battery 45–60m · verify 20–30m · review + folds 45–70m · records 40–55m · **~7–9 h** (consider splitting the `practice-on/off` rename into its own short step if time is tight).

## Rollback
`git revert` the build commit (harness code + extractor wiring + the rename + docs). `SUBSTRATE_TRUST_CORE_ENABLED` stays unset ⇒ the trust-core writes are inert; no schema change. The live Gate-1 install is untouched until the S9 founder-walked install.

## Forecast
Ends with the seven-layer reference harness built — the first live consumer wiring the S1–S7 trust core + discernment engine + L4 audit into a real Claude-Code agent loop, every step channel-law-classified, DARK/MEASURE, byte-identical until push. Ready for **S9 — the founder-walked dogfood install + instrument-fidelity validation** (`code-critical`), then **S10 (the public trust-record read surface)** and **S11 (the founder-walked ENFORCE activation — the logos gate)**. Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
