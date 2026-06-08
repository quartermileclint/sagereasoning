/**
 * abuse-thresholds.ts — A19 abuse-detection threshold constants.
 *
 * The single source of truth for A19's detection lines, mirroring the role of
 * COST_HEALTH (in stripe.ts) for A13. Kept SEPARATE from the pure detector
 * (abuse-detector.ts) so the detector takes its thresholds as explicit arguments
 * and stays I/O-free and unit-testable with a bare `npx tsx` (no env, no config
 * import in the test). The evaluate endpoint imports these and passes them in.
 *
 * Defaults are intentionally conservative (higher multiplier + non-trivial floor)
 * because an abuse signal that fires on bursty-but-legitimate traffic is worse
 * than a missed one at this stage — detection-only, no enforcement yet.
 *
 * Rules served: R5 (operational health), R0 (audit-derived). NOT on the
 * /api/reason critical path.
 */

export const ABUSE_DETECTION = {
  /** Time-window size (seconds) for the per-identity request-velocity detector.
   *  occurred_at timestamps from substrate_audit_events are bucketed into windows
   *  of this width; the detector compares the busiest window to the baseline. */
  REQUEST_VELOCITY_WINDOW_SECONDS: 60,

  /** Alert when an identity's busiest window's request count >= N x the mean of
   *  its OTHER active windows. 3.0 = a 3x burst (deliberately above A13's 2.0 cost
   *  multiplier — request traffic is naturally burstier than per-loop cost). */
  REQUEST_VELOCITY_MULTIPLIER: 3.0,

  /** Need >= this many PRIOR active windows (excluding the busiest) to form a
   *  baseline. False-positive guard: a brand-new identity cannot trip it. */
  REQUEST_VELOCITY_MIN_PRIOR_WINDOWS: 5,

  /** Ignore the candidate window and the baseline if below this many requests —
   *  a near-zero-noise guard so we never fire on e.g. 6 vs 2 requests/window. */
  REQUEST_VELOCITY_ABSOLUTE_FLOOR_REQUESTS: 5,

  // ──────────────────────────────────────────────────────────────────────
  // Structural detectors (PR1 surface rollout — gated behind the rollout
  // sub-flag SUBSTRATE_ABUSE_DETECTION_ROLLOUT_ENABLED; UNSET in production).
  // Read structural masked_context fields ONLY (input_char_count) — never raw
  // text (R3 / R17). Defaults are PROVISIONAL — retune against real traffic
  // once usage exists; detection-only, so a missed signal beats a false one.
  // ──────────────────────────────────────────────────────────────────────

  /** systematic_enumeration — "testing the space, not using it". Need at least
   *  this many requests from an identity before the breadth measure is
   *  meaningful (volume floor; a handful of varied requests is normal use). */
  SYSTEMATIC_ENUMERATION_MIN_REQUESTS: 20,

  /** Fire when the share of DISTINCT input_char_count values is >= this fraction
   *  of total requests. 0.9 = ~every request a different input size — the
   *  fingerprint of a methodical sweep, not organic repeated use. PROVISIONAL. */
  SYSTEMATIC_ENUMERATION_DISTINCT_RATIO: 0.9,

  /** rapid_input_variation — "fuzzing fast". Need at least this many requests in
   *  the identity's busiest window before the churn measure is meaningful. */
  RAPID_INPUT_VARIATION_MIN_WINDOW_REQUESTS: 10,

  /** A successive change in input_char_count of >= this many characters counts as
   *  a "large jump". Below this is treated as ordinary variation. PROVISIONAL. */
  RAPID_INPUT_VARIATION_DELTA_CHARS: 50,

  /** Fire when the share of successive request pairs that are "large jumps"
   *  (>= DELTA_CHARS) within the busiest window is >= this fraction. 0.8 = most
   *  consecutive inputs mutate sharply — automated churn, not human edits. PROVISIONAL. */
  RAPID_INPUT_VARIATION_RATIO: 0.8,
} as const
