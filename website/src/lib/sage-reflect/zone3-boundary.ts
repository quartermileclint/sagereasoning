/**
 * zone3-boundary.ts — SR-9 R20a / Zone-3 deterministic boundary (Stage B, B-3).
 *
 * Built at the Sage Reflect build Stage B (Critical) session. Implements SR-9 of
 * /adopted/sage-reflect-product-design.md ("What Sage Reflect is NOT — Not a crisis
 * pathway") and the R20a / Zone-3 boundary applied to the agent context.
 *
 * THE BOUNDARY (deterministic — PR6 → Critical regardless of apparent scope)
 * --------------------------------------------------------------------------
 * Before any reflection runs on a session, a DETERMINISTIC check asks: did this
 * session reveal an act that caused significant harm? If so, Sage Reflect does NOT
 * engage philosophical reflection on the harm. It:
 *   • records the kathekon failure (a contrary kathekon entry in the profile log),
 *   • surfaces a developer note, and
 *   • passes the flag to the developer.
 * It does NOT attempt to remediate harm through philosophical engagement, and it
 * does NOT route the agent into the six-question sequence. This mirrors the human
 * R20a Zone-3 redirection: the product is not a crisis pathway.
 *
 * NO LLM (PR4 N/A here). This is a pure boolean boundary over a deterministic
 * input signal — NOT a classifier. The locked design is explicit: "the distress /
 * Zone-3 path is a deterministic boundary check, not an LLM classifier."
 *
 * HARM-FLAG SOURCE (interpretation, founder-confirmable — see the Stage B close):
 * the locked design names the boundary but not the exact carrier field. Stage B
 * reads two deterministic signals, EITHER of which engages the boundary:
 *   (1) an explicit `safety_signal.harm_flagged === true` set by the upstream /
 *       developer at session close (the TR-03 "blocked act" path supplies this), and
 *   (2) any `acts_blocked` entry whose category is 'harm' (Sage Assent blocked the
 *       act for a harm reason).
 * This is a Diagnostic-uncertain (symptom-level) interpretation: it addresses the
 * observable signal; the canonical harm-flag contract is a founder-ack item.
 *
 * R4: this module is engine-internal; only the developer note + a coarse status are
 * surfaced — never the boundary's internal rule.
 */

/** A single act Sage Assent blocked during the session (subset of the input schema). */
export interface BlockRecord {
  readonly act: string
  readonly reason: string
  /** Deterministic category the upstream assigned, when present. */
  readonly category?: 'harm' | 'policy' | 'capability' | 'other'
}

/** The explicit session-close safety signal (TR-03 blocked-act path / developer-set). */
export interface SafetySignal {
  /** Set true when the session revealed an act that caused significant harm. */
  readonly harm_flagged: boolean
  readonly detail?: string
}

/** The deterministic inputs the Zone-3 boundary inspects. */
export interface Zone3Input {
  readonly safety_signal?: SafetySignal
  readonly acts_blocked?: readonly BlockRecord[]
}

/** The boundary verdict. */
export interface Zone3Result {
  /** True → Sage Reflect must NOT run the philosophical reflection; flag + return. */
  readonly engaged: boolean
  /** Why the boundary engaged (or did not) — engine-internal reasoning, logged. */
  readonly reason: string
  /** The developer-facing note when engaged; null when the boundary is clear. */
  readonly developer_note: string | null
}

/** The standing developer-facing note when the Zone-3 boundary engages (R20a/SR-9). */
export const ZONE3_DEVELOPER_NOTE =
  'Sage Reflect Zone-3 boundary engaged: this session was flagged for significant ' +
  'harm. Sage Reflect is not a crisis pathway — it has recorded the kathekon failure ' +
  'in the agent profile and flagged it for your attention, and has deliberately NOT ' +
  'engaged philosophical reflection on the harm. Route harm handling through your own ' +
  'safety and escalation process.'

/**
 * The deterministic R20a / Zone-3 boundary check (SR-9). PURE — no I/O, no LLM.
 * Run BEFORE any reflection on a session. Returns engaged=true iff harm is flagged.
 */
export function checkZone3Boundary(input: Zone3Input): Zone3Result {
  const explicit = input.safety_signal?.harm_flagged === true
  const harmBlock = (input.acts_blocked ?? []).some((b) => b.category === 'harm')

  if (explicit || harmBlock) {
    const detail = input.safety_signal?.detail?.trim()
    const reason = explicit
      ? `Harm flagged on this session${detail ? `: ${detail}` : ''}.`
      : 'A blocked act on this session was categorised as harm.'
    return { engaged: true, reason, developer_note: ZONE3_DEVELOPER_NOTE }
  }

  return { engaged: false, reason: 'No harm flag on this session.', developer_note: null }
}

/**
 * The minimal contrary-kathekon profile record written when the boundary engages
 * (SR-9 "records the kathekon failure"). PURE. A single contrary entry — the
 * boundary records THAT a kathekon failure occurred; it does not reconstruct or
 * philosophically assess the harmful act (that is the developer's safety process).
 */
export function zone3KathekonRecord(): {
  action: string
  quality: 'contrary'
  is_kathekon: false
  proximity: 'reflexive'
  virtue_domains_engaged: readonly string[]
}[] {
  return [
    {
      action: 'session flagged for significant harm (Zone-3 boundary)',
      quality: 'contrary',
      is_kathekon: false,
      proximity: 'reflexive',
      virtue_domains_engaged: [],
    },
  ]
}
