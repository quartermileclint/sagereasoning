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
