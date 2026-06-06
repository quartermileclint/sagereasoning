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
} as const
