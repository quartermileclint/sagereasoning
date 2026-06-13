/**
 * PORTED — verbatim mirror of /trust-layer/accreditation/coverage-status.ts
 *
 * Source of truth: /trust-layer/accreditation/coverage-status.ts
 *   (created 2026-06-13 under the mechanism-correction M3 accreditation session).
 * See ../types/accreditation.ts banner for why the /trust-layer/ closure is
 * ported into website/'s tsconfig rather than imported across the boundary.
 *
 * KEEP IN SYNC: if /trust-layer/accreditation/coverage-status.ts changes,
 *   re-port it here in the same change. Everything below the banner is a
 *   VERBATIM copy.
 * ===========================================================================
 */

/**
 * coverage-status.ts — K1 coverage-status first slice (CI-11, 2026-06-13).
 *
 * GOVERNING DOCUMENT (carry, don't re-derive):
 *   /adopted/adr/2026-05-26-credential-scope-and-coverage-status.md (the K1
 *   ADR, Accepted under D-SAGE-PRACTICE-DISTRIBUTION-IDENTITY-ELECTIONS-
 *   2026-05-26). A Sage Assent credential is "a dated, scoped verdict — not a
 *   binary pass/fail"; coverage_status + credential_basis make "whose hands,
 *   which version, which window" legible to any downstream reader (R18f/R19
 *   honesty by construction; R19e configuration honesty — FX-10).
 *
 * WHAT THIS MODULE IS. The SERVER-SIDE authority for the K1 coverage fields'
 * honest initial values. Both existing write paths call composeK1InitialCoverage
 * and pass the result through the store's write-time options:
 *   - the wrapper write (POST /api/accreditation/[agent_id] → the writer
 *     library) — via 'wrapper_write'
 *   - the Sage Reflect feed (lib/sage-reflect/sage-assent-feed.ts) — via
 *     'sage_reflect_feed'
 * Consumer-submitted coverage values are NEVER trusted: the store's row
 * builder reads these fields exclusively from its options parameter, so a
 * CarriedProfile that carries its own coverage_status is ignored at write.
 *
 * WHY 'agent_elected' IS THE ONLY REACHABLE INITIAL STATE. Per the K1 ADR,
 * `continuous` is reserved for the deterministic client-side hook (which an
 * API write path cannot prove), and `suspended` / `resumed_unverified` are
 * state-machine transitions that need the hook/plugin surface. Both of
 * today's write paths are DISCRETIONARY submission — the agent (or its
 * operator) chose which evidence to submit — and the ADR names `agent_elected`
 * the honest label for exactly that: "inherently partial; never continuous."
 * The full state machine is NOT this slice.
 *
 * PURE — no I/O, no env, no clock read (timestamps come from the record).
 */

import type { AccreditationRecord, CoverageStatus } from '../types/accreditation'

/** The K1 state vocabulary, verbatim from the ADR — for validation + tests. */
export const VALID_COVERAGE_STATUSES: readonly CoverageStatus[] = [
  'continuous',
  'suspended',
  'resumed_unverified',
  'expired',
  'agent_elected',
] as const

/** The three K1 coverage fields as written to agent_accreditation (CI-11
 *  first slice). Shaped for the store's write-time options. */
export interface K1CoverageFields {
  readonly coverage_status: CoverageStatus
  readonly monitored_since: string
  readonly credential_basis: string
}

/** The write path electing the evidence — determines both the coverage clause
 *  AND whether the window timestamps are server-observed or self-reported. */
export type CoverageWritePath = 'wrapper_write' | 'sage_reflect_feed'

interface WritePathProfile {
  /** The R19e/coverage clause naming how the evidence arrived. */
  readonly clause: string
  /** Whether the record's created_at/last_evaluation are stamped by a server
   *  clock (trustworthy as a window claim) or supplied by the writing consumer
   *  (must be labelled self-reported — the credential must not present forgeable
   *  input as a verified examination window: R18f/R19 honesty by construction). */
  readonly timestampsServerObserved: boolean
}

const WRITE_PATH_PROFILE: Record<CoverageWritePath, WritePathProfile> = {
  // The wrapper POST accepts a consumer-submitted AccreditationRecord, so its
  // created_at/last_evaluation are NOT server-stamped — the window is whatever
  // the submitter put on the record. R19e: a configuration without Sage Reflect
  // is "legitimate single-session credentialing, not an ongoing practice".
  wrapper_write: {
    clause: 'discretionary submission; single-session credentialing per R19e',
    timestampsServerObserved: false,
  },
  // The Sage Reflect feed builds its record server-side (createAccreditationRecord
  // / the grade engine stamp the timestamps from the server clock), so the window
  // is server-observed. Still agent-elected — the agent chose to submit.
  sage_reflect_feed: {
    clause: 'discretionary submission; evidence via Sage Reflect session close',
    timestampsServerObserved: true,
  },
}

/**
 * Compose the honest initial K1 coverage fields for a discretionary write.
 *
 * credential_basis follows the K1 ADR's template — "examined under <operator>
 * from <t1> to <t2>; identity <agent_identity>" — with two honesty guards:
 *   - the operator is unattributed in this slice (the composite
 *     (operator_account, agent_identity) key is a later slice; publishing an
 *     internal account id would violate the R17 minimisation posture);
 *   - the window timestamps are LABELLED by provenance. On the wrapper path the
 *     created_at/last_evaluation are consumer-supplied, so the basis marks the
 *     window "self-reported" — the credential never presents forgeable input as
 *     a server-verified examination window (R18f/R19). On the feed path the
 *     timestamps are server-stamped, so the window is "server-observed".
 *
 * monitored_since carries the record's created_at as the window start.
 *
 * @param record  The AccreditationRecord being written (timestamps + identity
 *                are read from it; its own coverage fields, if any, are ignored).
 * @param via     Which write path is electing the evidence.
 */
export function composeK1InitialCoverage(
  record: AccreditationRecord,
  via: CoverageWritePath,
): K1CoverageFields {
  const profile = WRITE_PATH_PROFILE[via]
  const windowProvenance = profile.timestampsServerObserved
    ? 'server-observed'
    : 'self-reported by submitter'
  return {
    coverage_status: 'agent_elected',
    monitored_since: record.created_at,
    credential_basis:
      `examined under unattributed operator from ${record.created_at} ` +
      `to ${record.last_evaluation} (window ${windowProvenance}); ` +
      `identity ${record.agent_id}; coverage: agent_elected (${profile.clause})`,
  }
}
