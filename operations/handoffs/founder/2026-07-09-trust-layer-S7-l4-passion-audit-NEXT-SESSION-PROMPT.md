# Next-Session Prompt — Trust Layer S7: the out-of-band L4 passion audit

> **STATUS: SPENT — executed 2026-07-09→10.** S7 is built DARK + battery-verified + review-folded (`D-TRUST-LAYER-S7-L4-PASSION-AUDIT-BUILT-DARK-REVIEW-FOLDED`). See the close: `operations/handoffs/founder/2026-07-10-trust-layer-S7-l4-passion-audit-CLOSE.md`. Successor: `2026-07-10-trust-layer-S8-reference-harness-NEXT-SESSION-PROMPT.md`.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-critical` — a **consult-path touch**: the L4 audit runs the deterministic examination engine on the ORCHESTRATOR's reasoning trace (a real extraction call — the same Sonnet Layer-1 machinery, injectable/flag-gated), and it WRITES the readable-not-modifiable `l4_audit_result` into the S5 `collaboration_records` table (a write-once, service-role-only field). **NO new schema** (S5 landed the column + the write-once trigger); **NO new perimeter route** (agent-facing only ⇒ AC5 untouched — re-check at S10); **NO flag flip** (MEASURE; the write is gated by `SUBSTRATE_TRUST_CORE_ENABLED`, unset ⇒ inert). Full Critical template (the extraction call + the write-once persistence are the Critical surfaces; AC7 is engaged only if a live activation is elected — default is dark/MEASURE). **ENFORCE is S11.**
**Governing frame:** /adopted/standing-protocol-cache.md (+ the build-sessions cache for arc context).
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 **§4 L4 — the passion audit on the selection itself**; **§5 A7** — the L4 channel).
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A7** (read verbatim; it wins over the ADR): self-report is structurally gameable by omission; the audit runs **out-of-band on the orchestrator's reasoning trace, extracted by the same deterministic engine, before selection finalizes** — the orchestrator does not control the extraction; the result is logged **readable-not-modifiable**; trust-tier disposition (lower → flag holds; higher [strong reflect history] → flag logs + surfaces + feeds the next Reflect; self-report admissible only as a supplementary corroborating signal at higher tiers, never the channel).
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S7.
**Predecessor close:** `operations/handoffs/founder/2026-07-09-trust-layer-S6-discernment-engine-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S6-DISCERNMENT-ENGINE-BUILT-REVIEW-FOLDED`.

## Why this session matters

S6 built the L1–L3 discernment engine and left the **L4 seam**: `runDiscernment` returns `l4: { pending: true, … }`, and `openDiscernmentSelection` opens the collaboration record with `l4AuditResult: null`. **S7 fills that seam** — the prosoche check on the *orchestrator's own* selection reasoning. It is the harder of the two blocking mentor questions (A7): the passion (a preference formed before the assessment ran; a stake in the outcome; a resolution reached before the assessment completed) is present in the reasoning but absent from the account of it — so **self-report cannot catch it**. The audit must read the orchestrator's *trace*, extracted by a deterministic engine the orchestrator does not control. This closes Phase 2 (the four-layer discernment protocol).

## What S7 builds (per ADR-013 §4 L4 + §5 A7 + build plan §S7)

1. **The out-of-band extraction of the three L4 signals** from the orchestrator's reasoning trace (Q4.1 prior preference formed before the assessment ran; Q4.2 stake present in the selection outcome — epithumia dressed as efficiency; Q4.3 resolution reached before the assessment completed). Reuses the l1-supply/consult machinery with the **orchestrator's trace as the input subject** — the orchestrator does not control the extraction (that is the whole point; A7). Injectable/flag-gated so the battery runs pure (the deterministic engine + a fake extractor).
2. **The disposition** — S5's `resolveL4AuditResult` (already built: signals + trust tier → `no-flag | holds-selection | logs-and-surfaces`) is the resolver; S7 supplies the signals (from the out-of-band extraction) + the `traceRef` + the orchestrator's trust tier. **Lower tier → a flag HOLDS the selection; higher tier (strong reflect history) → logs + surfaces + feeds the next Reflect** (does not auto-hold).
3. **The write** — `recordL4AuditResult` (S5 store, write-once at the DB via `trg_cr_protect_immutable`, service-role-only RLS ⇒ the orchestrator has no write path — **readable-not-modifiable**, A7). Pre-check with the pure `canSetL4AuditResult` guard.
4. **The finalization gate** — the selection finalizes ONLY after the L4 audit runs (A7 "before selection finalizes"). On `holds-selection` the collaboration stays open/held; on `no-flag`/`logs-and-surfaces` it may finalize (`updateCollaborationRecord({ status: 'finalized' })`). MEASURE — the disposition is advisory at v1; ENFORCE (a hold that BINDS) is S11.
5. **The trust-tier input** — derive the orchestrator's L4 trust tier from its oversight-domain reflect history (a strong, honest Sage Reflect record → `higher`; else `lower`). Reuse the S1 trust state / the reflect-completed-honest signal; do not fabricate. Self-report is admissible ONLY as a supplementary corroborating signal at higher tiers (A7) — never the channel.

## What S7 CONSUMES (already built — reuse, do not re-implement)

- **S5 `collaboration-record.ts`** — `L4Signals`, `L4AuditResult`, `resolveL4AuditResult`, `canSetL4AuditResult`, `L4TrustTier`, `L4Disposition`.
- **S5 `collaboration-store.ts`** — `recordL4AuditResult` (write-once), `readCollaborationRecord`, `updateCollaborationRecord` (finalize).
- **S6 `discernment-engine.ts`** — the `L4Seam` on `DiscernmentResult`; `openDiscernmentSelection` (opens the record with `l4AuditResult: null`). S7 runs AFTER the S6 selection opens and BEFORE finalize.
- **The consult / l1-supply machinery** — the extraction engine, with the orchestrator's trace as the input subject (the Critical surface — a real Sonnet call at wiring).

## The discipline (non-negotiable this session)

- **A7 verbatim:** the audit runs on the orchestrator's TRACE, not its self-report; the orchestrator does not control the extraction; the result is readable-not-modifiable.
- **MEASURE:** the disposition is advisory at v1 (a `holds-selection` is surfaced + honored by convention, not force-bound). ENFORCE is S11 — its own founder-walked Critical activation; nothing here pre-approves it.
- **R18f-parallel:** the L4 result rides on a signed extraction of the trace (the `traceRef` is non-empty by contract) — no L4 result without a verifiable extraction artifact.
- **Instrument-fidelity battery** (never beats-bare): a seeded pre-formed preference in the trace is CAUGHT; a clean trace is no-flag; lower vs higher tier disposition; the write-once guard holds; the finalization gate respects the disposition; extraction injectable so the battery is pure.
- Adversarial review (Workflow PR15 or first-hand per the §4 precedent — **check the account credit/session balance first**; it has exhausted mid-run). Fold every confirmed finding.

## Procedure (Full Critical template)
- **Read** the cache + build-sessions cache + the S6 close + ADR §4 L4 + §5 A7 + the verbatim A7, then the S5 L4 shapes + store + the S6 seam + the consult/l1-supply machinery.
- **Critical Change Protocol** (0c-ii): what changes (an extraction of the orchestrator trace + a write-once persistence, both dark/MEASURE); what could break (the extraction call cost/latency; the write-once trigger); existing sessions (N/A — no external users; agent-facing); rollback (`git revert`; flag unset ⇒ inert); verification; explicit founder approval for the extraction-call + persistence surfaces.
- **Build** the out-of-band L4 audit (extraction injected) + the disposition (resolveL4AuditResult) + the write (recordL4AuditResult) + the finalization gate + battery.
- **Verify** tsc 0; the S1–S6 batteries green; the new S7 battery; `npm run build`.
- **Adversarial review** (A7 out-of-band fidelity — never self-report; the readable-not-modifiable write; the trust-tier disposition; the finalization gate; claims-vs-code; the extraction-call safety). Fold.
- **Records** (Full Critical): decision-log entry + close + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the **S8 prompt** (the reference harness — the live consumer that generalizes Gate-1 H1–H4 onto the seven layers; `code-elevated → Critical at install`).

## Session shape
Reads 40–55m · out-of-band extraction of the L4 signals 60–80m · disposition + trust-tier derivation 40–55m · the write + finalization gate 40–55m · battery 45–60m · verify 20–30m · review + folds 45–70m · records (Critical) 40–55m · **~6–8 h**.

## Rollback
`git revert` the build commit (the L4 audit + battery; the extraction is injected, the write is flag-gated). `SUBSTRATE_TRUST_CORE_ENABLED` stays unset ⇒ the write is inert; no schema change (S5's column + trigger predate this). No S1–S6 file behaviour changed (reused, not modified).

## Forecast
Ends with the out-of-band L4 passion audit built + battery-verified + reviewed, DARK/MEASURE, reading the orchestrator's trace (never self-report), writing the readable-not-modifiable `l4_audit_result`, and gating finalization on the disposition — **closing Phase 2 (the four-layer discernment protocol)**. Ready for **S8 — the seven-layer reference harness** (`code-elevated → Critical at install`) — the first live consumer of the whole trust core + discernment engine. ENFORCE is S11. Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
