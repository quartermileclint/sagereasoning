/**
 * provenance-contract.ts — the signed-provenance write-contract for the
 * Sage Assent credential write path (R18f enforcement, option (a)).
 *
 * STATUS: Scaffolded — built + unit-tested in isolation (Build A). NOT imported
 * by route.ts yet. The POST handler will require + verify provenance in Build B
 * (the Critical wiring step); this module only defines the SHAPE and a pure
 * STRUCTURAL validator, factored out so it is importable + unit-testable
 * (mirrors how request-helpers.ts and response-builders.ts were factored — see
 * route.ts's HOTFIX NOTE: route.ts may only export HTTP method handlers).
 *
 * GOVERNING DOCUMENT:
 *   /adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md
 *   (option (a), Adopted 2026-05-23): "Require the write to carry the
 *   substrate's signed provenance (at minimum the SignedLayer2Assessment
 *   signature(s) the credited aggregate derives from, with enough of the signed
 *   payload to verify)."
 *
 * STRUCTURAL vs CRYPTOGRAPHIC — two distinct steps, kept separate:
 *   - validateWriteProvenance (THIS module) checks the SHAPE only — that the
 *     body carries a non-empty array of structurally-well-formed
 *     SignedLayer2Assessment objects. Pure; no crypto; no env; no I/O. A 400 /
 *     422 "bad request" concern.
 *   - verifyLayer2Signature (lib/translation-sandwich/layer2-verifier.ts) checks
 *     the TRUTH — that a signature actually verifies against the published key.
 *     A 403 "no examination" concern.
 *   Build B wires them in sequence at the gate: structural-validate the body,
 *   then require at least one element to cryptographically verify.
 *
 * SCOPE (honest limitation, per the ADR). Carrying + verifying signed
 * provenance proves the writer possesses genuine substrate output. It does NOT
 * prove the credited aggregate was faithfully computed from these signed
 * assessments — the "aggregate-faithfulness gap" is deferred (PR7; ADR
 * revisit-condition 1). This contract is the Combination-1 lever, nothing more.
 *
 * Compliance: AC1 N/A (no LLM); AC5 unaffected; AC7 engages at the route in
 * Build B, not here; KG1 — pure synchronous function, no DB / self-calls / fs;
 * PR6 NOT engaged (no distress logic).
 */

import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'

// ============================================================================
// CONTRACT SHAPE
// ============================================================================

/**
 * The signed-provenance block carried on a credential write. An accreditation
 * record is an aggregate over a window of many EvaluatedActions, so the field
 * is an array: the SignedLayer2Assessment(s) the credited aggregate derives
 * from. The gate (Build B) requires at least one to verify; option (a)'s
 * guarantee is "possesses genuine substrate output", not aggregate
 * faithfulness.
 *
 * Expected placement on the POST body: a top-level `provenance` field, e.g.
 *   { kind, profile, transition_result?, provenance: WriteProvenance }
 * The Build-B wiring extracts body.provenance and passes it here; this module
 * does not assume where on the body it sits.
 */
export interface WriteProvenance {
  signed_assessments: SignedLayer2Assessment[]
}

/** Discriminated structural-validation result (non-leaking message on failure). */
export type WriteProvenanceValidation =
  | { ok: true; provenance: WriteProvenance }
  | { ok: false; message: string }

// ============================================================================
// STRUCTURAL VALIDATION (shape only — no crypto, no env)
// ============================================================================

/**
 * True when `x` is a structurally-well-formed SignedLayer2Assessment: an object
 * with an `assessment` object, a non-empty `signature` string, and a non-empty
 * `key_id` string. This is the SAME structural contract layer2-verifier's
 * isStructurallySignedAssessment enforces — duplicated here intentionally so
 * the route can reject obvious shape errors with a 400/422 before reaching the
 * (Build B) crypto step, and so this module carries no runtime dependency on
 * the verifier.
 */
function isStructuralSignedAssessment(x: unknown): x is SignedLayer2Assessment {
  if (typeof x !== 'object' || x === null) return false
  const o = x as Record<string, unknown>
  if (typeof o.assessment !== 'object' || o.assessment === null) return false
  if (typeof o.signature !== 'string' || o.signature.length === 0) return false
  if (typeof o.key_id !== 'string' || o.key_id.length === 0) return false
  return true
}

/**
 * Validate the structural shape of a signed-provenance block.
 *
 * Accepts the raw provenance value (i.e. body.provenance). Confirms it is an
 * object carrying a NON-EMPTY array `signed_assessments`, each element a
 * structurally-well-formed SignedLayer2Assessment. Returns the typed block on
 * success, or a non-leaking message on failure. Pure — no crypto, no env, no
 * I/O. Cryptographic verification is a separate step (layer2-verifier).
 */
export function validateWriteProvenance(raw: unknown): WriteProvenanceValidation {
  if (typeof raw !== 'object' || raw === null) {
    return {
      ok: false,
      message:
        "Body field 'provenance' must be an object carrying 'signed_assessments'.",
    }
  }

  const obj = raw as Record<string, unknown>
  const list = obj.signed_assessments

  if (!Array.isArray(list)) {
    return {
      ok: false,
      message: "Body field 'provenance.signed_assessments' must be an array.",
    }
  }

  if (list.length === 0) {
    return {
      ok: false,
      message:
        "Body field 'provenance.signed_assessments' must contain at least one signed assessment.",
    }
  }

  for (let i = 0; i < list.length; i++) {
    if (!isStructuralSignedAssessment(list[i])) {
      return {
        ok: false,
        message:
          `Body field 'provenance.signed_assessments[${i}]' must be a signed ` +
          "assessment with an 'assessment' object, a non-empty 'signature' " +
          "string, and a non-empty 'key_id' string.",
      }
    }
  }

  return {
    ok: true,
    provenance: { signed_assessments: list as SignedLayer2Assessment[] },
  }
}
