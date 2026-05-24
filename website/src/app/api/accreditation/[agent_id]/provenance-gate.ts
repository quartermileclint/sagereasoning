/**
 * provenance-gate.ts — the R18f credential-write provenance gate (option (a)).
 *
 * STATUS: Wired (Build B) — imported by the POST handler in route.ts. Reaches
 * Verified after the PR1 single-endpoint production proof (founder flips
 * SUBSTRATE_PROVENANCE_GATE_ENABLED and confirms forged→rejected / genuine→200).
 *
 * GOVERNING DOCUMENT:
 *   /adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md
 *   (option (a), Adopted 2026-05-23). The gate sits in the accreditation write
 *   path, AFTER the A10 ownership gate (verifyAgentIdOwnership — "who may
 *   write") and BEFORE the writer (seedAccreditation / updateAccreditation).
 *   This answers the distinct question: "was there an examination?"
 *
 * WHAT IT DOES. Orchestrates the two Build-A primitives behind a kill-switch:
 *   1. KILL-SWITCH — SUBSTRATE_PROVENANCE_GATE_ENABLED must be the exact string
 *      'true'. UNSET / anything else → the gate is OFF → returns ok immediately
 *      (enforced: false) → the write proceeds exactly as it did before this
 *      gate existed (behaviour byte-identical to today). This is the dark-deploy
 *      safety: the code ships inert and only enforces when the flag is flipped.
 *   2. STRUCTURAL — when ON, the body must carry a well-formed `provenance`
 *      block (validateWriteProvenance, ./provenance-contract). Missing/malformed
 *      → bad_provenance.
 *   3. CRYPTOGRAPHIC — at least one carried SignedLayer2Assessment must verify
 *      against the substrate's published key (verifyLayer2Signature,
 *      lib/translation-sandwich/layer2-verifier). None → no_examination.
 *
 * SYNCHRONOUS (PR3 / KG1). No I/O, no DB, no self-calls, no fire-and-forget.
 * The decision is fully computed before the route constructs its response.
 *
 * OPERATIONAL vs CALLER FAILURES. If every carried assessment fails ONLY because
 * the verifier key itself is unavailable/malformed (an operator misconfiguration
 * — e.g. SUBSTRATE_LAYER2_PUBLIC_KEY unset), the gate returns `verifier_unavailable`
 * (→ 503 at the route), NOT no_examination (→ 403). Mislabelling a server
 * config error as "the caller has no examination" would be dishonest and would
 * mask the real fix. Genuine missing/forged provenance still returns
 * no_examination.
 *
 * SCOPE (honest limitation, per the ADR). A pass proves the writer possesses
 * genuine substrate output. It does NOT prove the credited aggregate was
 * faithfully computed from these signed assessments — the aggregate-faithfulness
 * gap is deferred (PR7; ADR revisit-condition 1). This gate forecloses
 * Combination 1 ("Sage Assent with NO SageReasoning"), nothing more.
 *
 * Compliance: AC1 N/A (deterministic crypto, no LLM); AC5 unaffected (no
 * distress surface); AC7 — this module is part of the write/access surface, so
 * the wiring session is Critical (the full Critical Change Protocol applies);
 * KG1 — synchronous, no DB/self-calls/fs; PR3 synchronous; PR6 NOT engaged
 * (no distress / Zone-2 / Zone-3 logic).
 */

import { validateWriteProvenance } from './provenance-contract'
import {
  verifyLayer2Signature,
  type Layer2VerificationFailureReason,
} from '@/lib/translation-sandwich/layer2-verifier'

/** The kill-switch env var. UNSET (or anything other than the exact string
 *  'true') → the gate does not enforce. Named consistently with
 *  SUBSTRATE_WRITE_PATH_ENABLED / SUBSTRATE_R20A_GATE_ENABLED. */
export const PROVENANCE_GATE_ENV_VAR = 'SUBSTRATE_PROVENANCE_GATE_ENABLED'

/**
 * Gate result.
 *   ok:true  — proceed. `enforced` says whether the gate actually ran (false =
 *              kill-switch off) so callers/tests can assert the dark-deploy path.
 *   ok:false — reject. `status` selects the HTTP mapping at the route:
 *                bad_provenance      → 422 (shape missing/malformed)
 *                no_examination      → 403 (valid shape, but no genuine signature)
 *                verifier_unavailable→ 503 (operator misconfiguration)
 */
export type ProvenanceGateResult =
  | { ok: true; enforced: boolean; matched_key_id?: string }
  | {
      ok: false
      status: 'bad_provenance' | 'no_examination' | 'verifier_unavailable'
      message: string
    }

/** True only when the kill-switch is the exact string 'true' (strictest
 *  truthiness — mirrors verifyAgentIdOwnership's SUBSTRATE_WRITE_PATH_ENABLED
 *  check). Read at call time, not module load. */
export function isProvenanceGateEnabled(): boolean {
  return process.env[PROVENANCE_GATE_ENV_VAR] === 'true'
}

/**
 * Enforce the provenance gate against an already-parsed request body.
 *
 * @param rawBody - the parsed POST body (validateWriteBody has already confirmed
 *                  it is a valid object by the time the route calls this).
 * @param now     - clock injection for the verifier's rotation-expiry check;
 *                  defaults to current time. Tests pass a fixed Date.
 */
export function enforceWriteProvenance(
  rawBody: unknown,
  now: Date = new Date(),
): ProvenanceGateResult {
  // 1. Kill-switch. OFF → skip entirely → behaviour byte-identical to pre-gate.
  if (!isProvenanceGateEnabled()) {
    return { ok: true, enforced: false }
  }

  // 2. Structural — extract + validate the `provenance` block on the body.
  const provenanceRaw =
    typeof rawBody === 'object' && rawBody !== null
      ? (rawBody as Record<string, unknown>).provenance
      : undefined

  const structural = validateWriteProvenance(provenanceRaw)
  if (!structural.ok) {
    return { ok: false, status: 'bad_provenance', message: structural.message }
  }

  // 3. Cryptographic — require AT LEAST ONE signed assessment to verify.
  const reasons: Layer2VerificationFailureReason[] = []
  for (const signed of structural.provenance.signed_assessments) {
    const result = verifyLayer2Signature(signed, now)
    if (result.valid) {
      return { ok: true, enforced: true, matched_key_id: result.key_id }
    }
    reasons.push(result.reason)
  }

  // None verified. Distinguish an operator misconfiguration (verifier key
  // unavailable/malformed for EVERY element) from a genuine no-examination.
  const allOperational = reasons.every(
    (r) => r === 'verifier_key_unavailable' || r === 'verifier_key_malformed',
  )
  if (allOperational) {
    return {
      ok: false,
      status: 'verifier_unavailable',
      message: 'The provenance verifier is not configured on this deployment.',
    }
  }

  return {
    ok: false,
    status: 'no_examination',
    message:
      'No valid SageReasoning examination provenance was presented. A Sage ' +
      'Assent credential requires signed substrate output (R18f).',
  }
}
