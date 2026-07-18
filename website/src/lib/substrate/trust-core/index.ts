/**
 * trust-core/index.ts — the Trust Layer S1 trust core (MEASURE mode).
 *
 * Public surface: the pure deterministic engine (types, transition, decay,
 * aggregate, derivers), the flag, and the DB store. Everything is DARK behind
 * SUBSTRATE_TRUST_CORE_ENABLED at the emission call sites. Enforcement is S11;
 * this half only records. See adopted/adr/2026-07-08-sage-trust-layer.md.
 */

export * from './types'
export * from './constants'
export * from './trust-decay'
export * from './trust-transition'
export * from './trust-aggregate'
export * from './derive-trust-events'
// S11 observation period — the canonical Q3 kathekon-engagement predicate (the
// shared function the eventual S11 G6(a) qualification binds on) + the false-hold
// classifier the observation instrument uses. Pure; MEASURE — labels, binds nothing.
export * from './kathekon-engagement'
// S2 — evidence weighting + verdict confidence (mentor A2 + A5; pure lib S3/S4 consume).
export * from './confidence-tiers'
export * from './evidence-weighting'
// S3 — the multi-source combiner (mentor A1 + spec 6; pure lib, LLM second-reader
// injected/dark). Critical at wiring.
export * from './combiner'
// S4 — the intervention policy engine (mentor spec 7 + A8) + the A4 transparency
// ledger (pure lib, MEASURE mode — log-and-continue only; ENFORCE is S11).
export * from './intervention-engine'
export * from './transparency-ledger'
// S5 — the four-layer discernment protocol: the three pure-lib profile schemas +
// the collaboration record (pure composition lib; MEASURE mode). The collaboration
// record persists (collaboration-store.ts); profiles are pure-lib (founder election).
export * from './profiles'
export * from './collaboration-record'
// S6 — the four-layer discernment engine (L1 honestum gate · L2 fit · L3 axia; mentor
// discernment protocol + A2/A5/A6; pure deterministic core + an injectable extraction
// seam; MEASURE mode). Consumes S5 profiles + the S2/S4 libs; opens a collaboration
// record + sets the A9 authority boundary at selection (flag-gated). ENFORCE is S11.
export * from './discernment-engine'
// S7 — the out-of-band L4 passion audit (mentor A7; pure core + an injectable trace
// extractor seam + a flag-gated fail-honest write-once store write; MEASURE mode).
// Runs the deterministic engine on the ORCHESTRATOR's reasoning trace (never
// self-report), resolves the disposition, writes the readable-not-modifiable
// l4_audit_result, and gates finalization on the disposition. Closes Phase 2.
export * from './l4-passion-audit'
// S8 — the reference-harness seams: the REAL extraction implementations (the
// live Sonnet Layer-1 machinery behind the S6/S7 injectable seams) + the
// integration turnkeys a live harness calls (spawn discernment + L4 audit,
// the trust-verdict read, the hand-back A8/A9 event wiring). MEASURE mode;
// flag-gated end-to-end; the dark /api/practice/discernment route consumes.
export * from './harness-extractors'
export * from './harness-integration'
// AE-2 (ADR-014 §3.2) — the CI-4 signed-loop fold: wires the S3
// combineVerificationResults into the accreditation write boundary's verified
// provenance chain (the only server-readable home of the signed CI-4 markers).
// Kathekon-engagement-classified (character vs instrument-calibration split);
// MEASURE-only; DARK behind SUBSTRATE_LOOP_FOLD_ENABLED.
export * from './loop-fold'
export * from './trust-core-flag'
export { emitAccreditationTrustEvents, emitReflectTrustEvent } from './emission-hooks'
export {
  emitTrustEvents,
  readTrustProfile,
  readHonestReflectSummary,
  deleteTrustDataForOwner,
  deleteTrustDataForCredential,
  getTrustDataForOwner,
  purgeExpiredTrustCore,
  type StoreResult,
} from './trust-core-store'
export {
  openCollaborationRecord,
  readCollaborationRecord,
  recordAuthorityBoundary,
  recordL4AuditResult,
  updateCollaborationRecord,
  deleteCollaborationDataForOwner,
  deleteCollaborationDataForCredential,
  getCollaborationDataForOwner,
  purgeExpiredCollaboration,
} from './collaboration-store'
