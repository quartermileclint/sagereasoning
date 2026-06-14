/**
 * practice-cycle-hint.ts — the CI-13 reflect-at-close default hint
 * (mechanism-correction M5, 2026-06-13).
 *
 * STATUS: Wired (ships DARK — SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED unset in
 * every environment; behaviour byte-identical to pre-M5). Reaches Verified at
 * its own founder-elected 0c-ii activation step (paired with the staged docs at
 * operations/p1-rebuild-2026-06/m5-docs-staged-for-activation.md).
 *
 * GOVERNING DOCUMENTS:
 *   - The Q3 mentor verdict, ADOPTED 2026-06-12 under
 *     D-SAGE-PRACTICE-METHODOLOGY-AMENDMENTS-ADOPTED-2026-06-12 (dossier row
 *     B7, amended): for AGENTS, automatic firing of Sage Reflect at session
 *     close is the DEFAULT ("the developer's configuration is the agent's
 *     disposition"); explicit opt-out permitted; the full Q1–Q6 sequence is
 *     NEVER abbreviated.
 *   - Build plan CI-13 (D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12).
 *   - FX-9 (fresh-test-analysis §3.5): Sage Reflect is Live and one call away
 *     but undiscoverable from the consult/close path. This hint makes the
 *     fourth discipline discoverable from the practice's own surfaces.
 *
 * WHAT THIS IS. The substrate is stateless and cannot observe an agent's
 * session close, so the default lives where it can bite: (1) the published
 * integration contract ships reflect-at-close as the default flow with an
 * explicit named opt-out (the staged docs); (2) consult + accreditation-write
 * responses carry this structural hint so the close step is discoverable. There
 * is NO server-side reflect call here and NO abbreviation path — the hint
 * points at the existing /api/practice/reflect endpoint (SR-13), which runs the
 * full Q1–Q6 sequence whole.
 *
 * COST (R5 — auto-fired calls bill; consent must be informed): the staged
 * opt-out docs state that an auto-fired reflect pass is one metered
 * /api/practice/reflect call per session close. The opt_out key below names the
 * integration config a developer sets to disable auto-firing.
 *
 * PURE + SYNCHRONOUS (env read only; no I/O). Additive response field — absent
 * entirely when the flag is off (byte-identical; verified by the flag-off test).
 */

export const PRACTICE_CYCLE_HINT_ENV_VAR = 'SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → no
 *  `practice` field is added (byte-identical to pre-M5). */
export function isPracticeCycleHintEnabled(): boolean {
  return process.env[PRACTICE_CYCLE_HINT_ENV_VAR] === 'true'
}

/** The structural practice-cycle hint (CI-13). Static — same on every response. */
export interface PracticeCycleHint {
  /** The trigger point: a completed SageReasoning pass at session close. */
  readonly reflect_due: 'TR-02'
  /** The existing reflect endpoint (SR-13) — full Q1–Q6, never abbreviated. */
  readonly endpoint: '/api/practice/reflect'
  /** 'auto' = fire at session close by default (the Q3 verdict). */
  readonly default: 'auto'
  /** The integration config key a developer sets to disable auto-firing. */
  readonly opt_out: 'reflect_at_close'
}

export const PRACTICE_CYCLE_HINT: PracticeCycleHint = {
  reflect_due: 'TR-02',
  endpoint: '/api/practice/reflect',
  default: 'auto',
  opt_out: 'reflect_at_close',
}

/**
 * Return `{ practice: PRACTICE_CYCLE_HINT }` when the flag is on, else `{}`.
 * Designed for spreading into a response body so the field is ABSENT (not
 * present-and-null) when off — byte-identical to pre-M5.
 */
export function practiceCycleHintField(): { practice?: PracticeCycleHint } {
  return isPracticeCycleHintEnabled() ? { practice: PRACTICE_CYCLE_HINT } : {}
}
