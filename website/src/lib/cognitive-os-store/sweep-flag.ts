/**
 * sweep-flag.ts - the retention sweep's dedicated kill-switch.
 *
 * IMPURE BY DESIGN, and separated for that reason. The nine Phase-1 components
 * are pure, deterministic and env-free; this module and `store.ts` are the only
 * two in `cognitive-os/` that read the outside world, so the purity claim in
 * `types.ts` stays true of the library proper.
 *
 * WHY ITS OWN FLAG, rather than riding the trust-core sweep's:
 * folding cognitive-os retention into SUBSTRATE_TRUST_CORE_SWEEP_ENABLED would
 * make it depend on a trust-layer flag from a different arc. "A shared base flag
 * makes dark a per-flag claim, not a per-feature claim" is a lesson this project
 * has already paid for - one flag set for one sub-item silently activated every
 * sibling gating on it. Separate arcs, separate switches.
 *
 * UNSET is the safe state: the sweep route answers honestly and does no DB work.
 * Note that the DATA-RIGHTS paths are NOT gated by this or any flag - erasure
 * and export cannot be flag-gated.
 */

/**
 * Is the Cognitive OS retention sweep active?
 *
 * Read at call time, never cached at module load, so a flag change takes effect
 * on the next invocation rather than on the next cold start.
 */
export function isCognitiveOsSweepEnabled(): boolean {
  return process.env.SUBSTRATE_COGNITIVE_OS_SWEEP_ENABLED === 'true'
}
