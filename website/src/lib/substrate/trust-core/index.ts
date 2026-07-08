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
