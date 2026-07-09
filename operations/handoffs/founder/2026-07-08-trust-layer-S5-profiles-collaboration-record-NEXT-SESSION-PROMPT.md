# Next-Session Prompt — Trust Layer S5: profile schemas + the collaboration record

> **SPENT — executed 2026-07-09** (`D-TRUST-LAYER-S5-PROFILES-COLLABORATION-RECORD-BUILT-MIGRATED-REVIEW-FOLDED`). Founder elections: profiles PURE-LIB (not persisted); migration TEST → PROD-inert this session. Built DARK + battery-verified (87/0) + 6-dim Workflow reviewed (6 confirmed low/nit findings folded) + migrated on TEST and PRODUCTION (prod-inert). Close: `operations/handoffs/founder/2026-07-09-trust-layer-S5-profiles-collaboration-record-CLOSE.md`. Successor: S6 (the L1–L3 discernment engine) — `operations/handoffs/founder/2026-07-09-trust-layer-S6-discernment-engine-NEXT-SESSION-PROMPT.md`.

**For the founder. Paste as the first message of a fresh session.** (Rename the date prefix to the actual session date.)

**Stream:** founder.
**Tier:** `code-critical` — this slice introduces a **NEW schema** (the profile + collaboration-record tables). Build the schemas + the pure record-composition lib **DARK / behind `SUBSTRATE_TRUST_CORE_ENABLED`** first; the **migration is its own founder-walked 0c-ii** (Critical Change Protocol — apply to TEST, then prod-inert, exactly as S1's migration was). Nothing wires into a live decision path this session. **ENFORCE is S11**; **the L4 audit's real consult-path touch is S7** (a separate `code-critical`). Full template (Critical) for the migration step; Lean+Elevated for the pure lib.
**Governing frame:** /adopted/standing-protocol-cache.md (§"Critical-risk sessions" — cite the Critical Change Protocol 0c-ii at the migration step; do not abbreviate it).
**Design-of-record:** `adopted/adr/2026-07-08-sage-trust-layer.md` (ADR-013 **§4 the four-layer discernment protocol** — the three profiles + the L1–L4 questions the record must carry; **§5 A6 + A7 + A9** — un-profiled handling, the L4 channel, and the `authority_boundary` + justice-failure-reflection cases).
**Binding methodology:** `operations/trust-layer-2026-07/2026-07-07-mentor-nine-answers-verbatim.md` — **A9** (delegation-chain responsibility: the `authority_boundary` two-dimensional attenuation, unwaivable by trust; the three justice-failure-reflection cases) + **A7** (the L4 audit is out-of-band on the trace, its result readable-not-modifiable) + **A6** (un-profiled candidates: absence ≠ failure; the session-scoped credential) are load-bearing; read them verbatim. Where the ADR and the verbatim record diverge, the verbatim record wins.
**Plan of record:** `operations/trust-layer-2026-07/trust-layer-build-plan.md` §S5.
**Predecessor close:** `operations/handoffs/founder/2026-07-08-trust-layer-S4-intervention-engine-CLOSE.md`.
**Predecessor decision-log entry:** `D-TRUST-LAYER-S4-INTERVENTION-ENGINE-MEASURE-BUILT-REVIEW-FOLDED`.

## Why this session matters

Phase 1 (the server-side trust core) is complete: S1 (state/events/decay) → S2 (weighting/confidence) → S3 (combiner) → S4 (intervention engine MEASURE + transparency ledger). **S5 opens Phase 2 — the four-layer discernment protocol.** S6 (the L1–L3 engine) and S7 (the out-of-band L4 audit) both READ the three profiles + WRITE the collaboration record this slice defines. The load-bearing pieces are the mentor's A9 `authority_boundary` (scope attenuation as a kathekon requirement — a sub-agent carries narrower authority in TWO dimensions, unwaivable by trust) and the collaboration record as the durable home for the fields S4 already produces (the escalation payload, the A8 habitual-stable flag, the A4 transparency-deficit descriptor, and — once S7 lands — the L4 audit result).

## What S5 builds (per ADR-013 §4 + §5 A6/A7/A9 + build plan §S5)

1. **Three profile schemas** (shaped for the A2A-card-extension mapping per the interop election — design-for-interop, ship native; nothing published externally at v1):
   - **Task profile** — function type, circle served, conditions, output requirements, the justice surface (a non-consenting party in scope ⇒ the L3 justice branch is mandatory).
   - **Candidate profile** — role, capability scope, credential coverage (ties to S2 domain distance), performance history, output format, purpose, the prior-interaction record (**A9/L4: a prior positive interaction is data, not a credential — it enters at L2 Q2.2, never before L1**).
   - **Orchestrator profile** — current kathekonta, examination capacity, circle, selection patterns (the L4 audit reads this + the trace).
2. **The collaboration record** with:
   - the mentor **A9 `authority_boundary`** field — `{ function-type scope, circle scope }`, set at selection time by the orchestrator, validated pre-execution; exceeding EITHER boundary → escalate to the orchestrator, **never self-authorized expansion, unwaivable by trust level** (make this structural — a validation that cannot be bypassed by any trust/capability level);
   - the **L4 audit result** field — **readable-not-modifiable** by the orchestrator (A7);
   - the **habitual-stable flag** + the **independence-deficit** descriptor (the S4 fields land here);
   - the **A9 justice-failure-reflection** case record (case 1 briefed→sub-agent primary + orchestrator moderate oversight reduction; case 2 catchable-not-run→higher orchestrator reduction on oversight + dikaiosyne; case 3 uncatchable→sub-agent reduction + orchestrator FLAG-not-reduction — the same three cases the S1 `delegation-reflection-case-{1,2,3}` events already encode; wire the record fields, not the emission).
3. **The pure record-composition lib** — build/validate the profiles + the collaboration record as pure functions (like S2/S3/S4), so S6/S7 compose them deterministically; the DB store + RLS + data-rights (R17) mirror S1's trust-core store pattern (append/immutable where the mentor's semantics require it; service-role-only RLS; retention + erase/export coverage).

## What S5 CONSUMES / MIRRORS (already built)

- **S1 trust-core store + migration pattern** (`trust-core-store.ts` + `supabase-agent-trust-core-migration.sql`) — mirror the additive/idempotent/reversible migration, RLS service-role-only, the R17c/R17i data-rights + retention-sweep coverage, and the R18f-parallel rule (no record without a verifiable artifact where the mentor's semantics require provenance).
- **S1 event vocabulary** (`types.ts`) — the `delegation-reflection-case-{1,2,3}` + `orchestrator-proceeds-under-habitual-flag` events are DEFINED; S5 gives the collaboration record the fields those events reference (do NOT re-define the events).
- **S4 outputs** (`intervention-engine.ts` / `transparency-ledger.ts`) — the `EscalationPayload`, the habitual-stable flag, and the `TransparencyDeficit` descriptor are the collaboration-record fields S5 schematises.

## The channel-law + measure discipline (non-negotiable this session)

- **MEASURE / record-only.** S5 defines schemas + a record-composition lib; it does not enforce selection or bind any action. The L4 audit that READS the trace is S7 (`code-critical`, consult-path); the ENFORCE activation is S11.
- **The migration is a founder-walked 0c-ii** (Critical Change Protocol): what changes / what could break / existing sessions / rollback (DROP TABLE) / verification / explicit founder approval. Apply to TEST, then prod-inert (flag unset ⇒ byte-equivalent), exactly as S1.
- Keep everything behind `SUBSTRATE_TRUST_CORE_ENABLED` at any emission/consumption seam; the pure lib is env/IO-free.

## Procedure (Critical for the migration; Lean+Elevated for the lib)

- **Read** the cache + the S4 close + ADR §4 + §5 A6/A7/A9, then the verbatim A9/A7/A6, then the S1 store + migration + the S1 event vocabulary + the S4 outputs.
- **Design** the three profile schemas + the collaboration record (A2A-card-extension-shaped), naming each A9 field precisely; get founder sign-off on the schema shape before writing the migration (R18/Critical governance gate).
- **Build** the migration (additive/idempotent/reversible, RLS service-role-only, data-rights + retention coverage) DARK + the pure record-composition lib + battery (instrument-fidelity: the `authority_boundary` validation cannot be bypassed by trust level; the L4 result is readable-not-modifiable; the three justice-failure cases map to the right reductions/flag; A6 un-profiled handling; flag-off byte-identity).
- **Verify** tsc 0; S1–S4 batteries green; the new S5 battery; `npm run build`; the founder-walked migration on TEST then prod-inert (§VERIFY green both).
- **Adversarial review** (Workflow PR15 or first-hand per the §4 precedent — **check the account credit/session balance first; it has been exhausting mid-run**): A9 fidelity (unwaivable attenuation; the three cases); the readable-not-modifiable L4 field; A6 un-profiled handling; flag-off byte-identity; claims-vs-code. Fold every confirmed finding.
- **Records** (Full for the Critical migration): decision-log entry + close + CLAUDE.md PR18 refresh + mark this prompt SPENT + author the **S6 prompt** (the L1–L3 discernment engine, `code-elevated`).

## Session shape
Reads 30–40m · schema design + founder sign-off 40–55m · migration (dark) 30–45m · record-composition lib 45–60m · battery 45–60m · verify + TEST/prod-inert migration walk 40–60m · review + folds 40–60m · records 30–40m · **~6–8 h** (Critical).

## Rollback
`git revert` the build commit (pure lib + tests); `DROP TABLE` the new profile/collaboration tables (the migration's rollback block; TEST/prod-inert only — flag unset ⇒ nothing emits). No existing table altered.

## Forecast
Ends with the three profile schemas + the collaboration record (A9 `authority_boundary`, the readable-not-modifiable L4 field, the S4 flags, the three justice-failure cases) built + battery-verified + reviewed + migrated TEST/prod-inert, DARK. Ready for **S6 — the L1–L3 discernment engine** (`code-elevated`) then **S7 — the out-of-band L4 passion audit** (`code-critical`, consult-path). ENFORCE is S11. Weights BLOCKED; the 0h call remains the founder's.

End of prompt.
