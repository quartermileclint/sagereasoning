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
export * from './trust-core-flag'
export { emitAccreditationTrustEvents, emitReflectTrustEvent } from './emission-hooks'
export {
  emitTrustEvents,
  readTrustProfile,
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
