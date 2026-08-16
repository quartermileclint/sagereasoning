/**
 * trust-core-flag.ts — the Trust Layer S1 kill-switch.
 *
 * SUBSTRATE_TRUST_CORE_ENABLED must be the exact string 'true' for the trust core
 * to emit. UNSET / anything else ⇒ OFF ⇒ no route emits a trust event and no row
 * is written (the flag-off path adds no DB write — behaviour byte-identical to
 * before the trust core existed; test-asserted). Read at call time, not module
 * load. Mirrors isProvenanceGateEnabled / isTrajectoryWriteEnabled (strictest
 * truthiness).
 */

export const TRUST_CORE_ENV_VAR = 'SUBSTRATE_TRUST_CORE_ENABLED'

export function isTrustCoreEnabled(): boolean {
  return process.env[TRUST_CORE_ENV_VAR] === 'true'
}

/** The retention-sweep kill-switch (separate, so the sweep can go live before the
 *  write flag — the trajectory-sweep precedent). */
export const TRUST_CORE_SWEEP_ENV_VAR = 'SUBSTRATE_TRUST_CORE_SWEEP_ENABLED'

export function isTrustCoreSweepEnabled(): boolean {
  return process.env[TRUST_CORE_SWEEP_ENV_VAR] === 'true'
}

/** Trust Layer S10 (2026-07-12) — the public trust-record read surface's own
 *  kill-switch. UNSET ⇒ GET /api/trust-record/{agent_id} answers an honest 503
 *  with ZERO DB work (the discernment dark-503 posture). Separate from the trust
 *  core flag so the read surface rolls back without touching emission. */
export const TRUST_READ_SURFACE_ENV_VAR = 'SUBSTRATE_TRUST_READ_SURFACE_ENABLED'

export function isTrustReadSurfaceEnabled(): boolean {
  return process.env[TRUST_READ_SURFACE_ENV_VAR] === 'true'
}

/** Stoa Q5c/Q13a (2026-08-04) — a DEDICATED flag alongside (never instead of)
 *  SUBSTRATE_TRUST_CORE_ENABLED (founder election E2). Rationale: a false
 *  positive here writes a PERMANENT ledger row even in measure mode, and the
 *  mentor named the residual risk explicitly (a curator can be wrong about
 *  the artifact/entry pairing). BOTH this flag AND the trust-core flag must
 *  be 'true' for the admin flag-intake route to emit; either unset ⇒ no
 *  derivation attempted, no DB write — byte-identical, battery-asserted. A
 *  rollback on this flag alone leaves S9–S11 surfaces untouched. */
export const STOA_TRUST_EVENTS_ENV_VAR = 'SUBSTRATE_STOA_TRUST_EVENTS_ENABLED'

export function isStoaTrustEventsEnabled(): boolean {
  return process.env[STOA_TRUST_EVENTS_ENV_VAR] === 'true'
}

/** Register D4 (2026-08-17, R2b) — the REDUCER half of the 2026-07-19 self-circle
 *  ruling. A DEDICATED flag, never a reuse of SUBSTRATE_TRUST_CORE_ENABLED, per the
 *  standing lesson that darkness is per-flag and not per-feature (memory
 *  `shared-flag-dark-is-per-flag-not-per-feature`): the trust core is LIVE in
 *  production, so riding its flag would make this narrowing live the moment it
 *  deploys, on a surface that writes PERMANENT ledger rows.
 *
 *  UNSET ⇒ `deriveWorstJusticeOutcome` behaves byte-identically to its pre-D4 form
 *  (battery-asserted). SET ⇒ a self-preservation-only assessment stops deriving
 *  `justice-surface-{unevaluated,indeterminate,transparently-handled}`; a VIOLATED
 *  obligation still derives regardless of circle identity (the conservative
 *  direction — see the asymmetry note in derive-trust-events.ts).
 *
 *  Activation is its own founder-walked `code-critical` step (D3): the reducer is a
 *  LIVE trust-event emitter. The walk must ALSO re-check D1's `justice_floor_active`
 *  re-latch on `sagereasoning:s9-loop@v1` BEFORE the flip, deploy-and-verify first,
 *  and pre-write the rollback UPDATE — the S11b Part-3 ordering guard. */
export const JUSTICE_SELF_CIRCLE_NARROWING_ENV_VAR =
  'SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED'

export function isJusticeSelfCircleNarrowingEnabled(): boolean {
  return process.env[JUSTICE_SELF_CIRCLE_NARROWING_ENV_VAR] === 'true'
}
