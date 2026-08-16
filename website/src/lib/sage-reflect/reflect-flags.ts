/**
 * reflect-flags.ts — Sage Reflect feature kill-switches.
 *
 * Separate module so the pure engine + the extractor can read a flag without
 * either importing the other's surface, and so a test can set/unset in-process.
 */

/**
 * R2b (2026-08-17) — the Q1 THIRD STATE ("I cannot determine").
 *
 * WHAT IT GATES: an additive `determination` field on the Q1 extraction contract,
 * and the `q1Clean` reading that stops an explicit inability counting as a clean
 * answer. UNSET ⇒ `Q1_SYSTEM` is byte-identical, `mapQ1` returns exactly what it
 * returned before, and `q1Clean` is unchanged — the whole fix is inert.
 *
 * WHY FLAGGED, when the defect it closes is LIVE: `Q1_SYSTEM` is an LLM extraction
 * contract on a live trust-event-adjacent surface, and changing what the model is
 * asked to return changes elicitation behaviour on push. R2b activates nothing, so
 * this ships dark like everything beside it.
 *
 * BE CLEAR ABOUT WHAT THAT MEANS: the mentor-vetted Q1 wording inviting "I cannot
 * determine" went LIVE 2026-08-16. So the mislabelling is happening in production
 * NOW, and it is the ACTIVATION — not this build — that closes it. That is a real
 * cost of the dark posture and is stated rather than left implicit.
 */
export const REFLECT_Q1_DETERMINATION_ENV_VAR = 'SUBSTRATE_REFLECT_Q1_DETERMINATION_ENABLED'

export function isReflectQ1DeterminationEnabled(): boolean {
  return process.env[REFLECT_Q1_DETERMINATION_ENV_VAR] === 'true'
}
