/**
 * examination-mode-flag.ts — the dark-flag + marker read for the Arc 1
 * `examination_mode` credential extension (Gate-1 surface honesty, Option 2).
 *
 * GOVERNING DOCUMENTS (carry, don't re-derive):
 *   /drafts/sage-practice-examination-mode-credential-build-scope.md (Arc 1 spec)
 *   /drafts/D-gate1-surface-honesty-option2-honest-differentiation.md (decision)
 *   decision-log: D-SAGE-PRACTICE-GATE1-SURFACE-HONESTY-OPTION2-DIFFERENTIATION
 *
 * WHAT THIS IS. Two small, website-only I/O concerns kept OUT of the pure
 * mappers and the ported trust-layer modules so those stay env-free + testable:
 *
 *   1. isExaminationModeEnabled() — the single dark flag. UNSET ⇒ the whole
 *      feature is invisible: no `examination_mode` column is written, no field
 *      is folded on read, the route never selects the harness write-path. The
 *      accreditation write + public read are then BYTE-IDENTICAL to pre-Arc-1.
 *      (Flag read at the I/O boundary only — never inside a pure mapper.)
 *
 *   2. readPreDecisionMarker(credentialId) — the UNFORGEABILITY ROOT. The
 *      pre-decision distinction is an attestation carried in the credential's
 *      `api_keys.credential_provenance` jsonb, set ONLY at admin mint (a
 *      consumer cannot self-issue it). This reads that marker for an
 *      already-authenticated credential. Fail-CLOSED: any error / missing row /
 *      malformed provenance ⇒ false (treated as a discretionary, post-decision
 *      credential — the honest conservative default).
 *
 * THE HONEST LIMIT (must stay documented, not hidden). The server cannot prove
 * from an API write that a hook fired *pre-decision* — timing is not observable
 * in the call (even the Ed25519 signature proves "examined," not
 * "examined-pre-decision"). `pre_decision_harness` is therefore unforgeable
 * AGAINST THE CONSUMER (server-composed; admin-gated mint) but rests on an
 * attestation: the write arrived via an operator-issued harness credential, and
 * the harness enforces pre-decision by construction. Same trust model as the
 * rest of the credential.
 *
 * KG1 (rule 2): the Supabase read is awaited; a query error is fail-closed
 * (false), never swallowed-and-allowed.
 */

import { createClient } from '@supabase/supabase-js'

/** The provenance key (D1a — credential_provenance jsonb) carrying the
 *  operator-set pre-decision attestation. Set ONLY at admin mint. */
export const EXAMINATION_ENFORCEMENT_PROVENANCE_KEY = 'examination_enforcement'

/** The single attestation value that earns `pre_decision_harness` on the
 *  accreditation credential. */
export const PRE_DECISION_HARNESS_MARKER = 'pre_decision_harness'

/**
 * The Arc 1 dark flag. UNSET (or anything other than the literal 'true') ⇒ the
 * examination_mode feature is OFF and the accreditation write + read are
 * byte-identical to pre-Arc-1.
 */
export function isExaminationModeEnabled(): boolean {
  return process.env.SUBSTRATE_EXAMINATION_MODE_ENABLED === 'true'
}

/** The minimal api_keys row this reads — the provenance jsonb only. */
interface CredentialProvenanceRow {
  credential_provenance: Record<string, unknown> | null
}

/**
 * PURE decision: does this credential's provenance carry the operator-set
 * pre-decision-harness attestation? Factored out for unit testing (no I/O).
 * A consumer cannot reach this state — credential_provenance is set only at
 * admin mint.
 */
export function provenanceCarriesPreDecisionMarker(
  provenance: Record<string, unknown> | null | undefined,
): boolean {
  if (!provenance || typeof provenance !== 'object') return false
  return provenance[EXAMINATION_ENFORCEMENT_PROVENANCE_KEY] === PRE_DECISION_HARNESS_MARKER
}

/**
 * Read the pre-decision-harness marker for an already-authenticated credential.
 *
 * Called by the accreditation route's auth step (verifyAgentIdOwnership) ONLY
 * when isExaminationModeEnabled() is true, on the credential the validator just
 * authenticated (so this is a read of an already-trusted row — minimal-touch:
 * the shared credential validators are left byte-identical in what they return).
 *
 * Fail-CLOSED: no id, missing row, query error, or malformed provenance ⇒
 * false. The honest conservative default is a discretionary (post-decision)
 * credential; the harness attestation must be affirmatively present to be honoured.
 */
export async function readPreDecisionMarker(credentialId: string | null | undefined): Promise<boolean> {
  if (!credentialId) return false
  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { data, error } = await admin
      .from('api_keys')
      .select('credential_provenance')
      .eq('id', credentialId)
      .eq('is_active', true)
      .maybeSingle()
    if (error || !data) return false
    return provenanceCarriesPreDecisionMarker(
      (data as CredentialProvenanceRow).credential_provenance,
    )
  } catch {
    // KG1 rule 2 — fail-closed on any unexpected throw.
    return false
  }
}
