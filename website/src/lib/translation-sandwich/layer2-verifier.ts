/**
 * layer2-verifier.ts — Ed25519 verification for Layer 2 authoritative assessments.
 *
 * This is the VERIFY counterpart to layer2-signer.ts's signLayer2Assessment —
 * "the missing half" the P1 enforcement-seam ADR names
 * (/adopted/adr/2026-05-23-sage-assent-sagereasoning-dependency-enforcement.md
 * §"Evidence" + §Options (a)). The signer holds the PRIVATE key and signs;
 * this module holds nothing secret — it reads the PUBLIC verification key from
 * env and confirms a SignedLayer2Assessment was produced by the substrate's
 * signing key.
 *
 * WHY THIS EXISTS. R18f ("no credential without examination") requires that a
 * Sage Assent credential write carry genuine SageReasoning provenance. The
 * recommended primitive (option (a), Adopted 2026-05-23) is server-side Ed25519
 * signature verification at the credential write boundary. Before that gate can
 * exist, the verify function must exist. The crypto recipe already sat in
 * layer2-signer.ts's doc comment (~:169); this module makes it a callable,
 * fail-closed, typed function.
 *
 * KEY SOURCE — env, NOT a self-call. The published verification key lives in
 * the same env vars /api/public-key reads (SUBSTRATE_LAYER2_PUBLIC_KEY +
 * SUBSTRATE_LAYER2_KEY_ID, plus the four SUBSTRATE_LAYER2_PREVIOUS_* vars during
 * a rotation overlap). This module reads those env vars DIRECTLY. It does NOT
 * fetch /api/public-key — an endpoint-to-endpoint call would violate KG1 rule 1
 * (no self-calls). Reading the same env keeps the verifier in lockstep with the
 * published key without an HTTP hop.
 *
 * ROTATION (A4). During a 30-day overlap window, a signature may carry the
 * previous key_id. This module accepts the current key, and — when ALL FOUR
 * SUBSTRATE_LAYER2_PREVIOUS_* vars are set (the same fail-safe posture as
 * /api/public-key's resolvePreviousKey) and the overlap has not expired
 * (retires_at > now) — also the previous key. Anything else → unknown/expired.
 *
 * FAIL-CLOSED, NEVER THROW. A verification gate must return a decision, not
 * crash the request. Every failure mode — missing/malformed verifier key,
 * unknown/expired key_id, malformed signature, uncanonicalisable payload,
 * cryptographic mismatch, malformed input — returns a typed
 * { valid: false; reason } result. The function never throws.
 *
 * SCOPE (honest limitation, per the ADR §Options (a)). A valid result proves
 * that ONE genuine substrate-signed assessment exists. It does NOT prove that a
 * submitted accreditation aggregate was faithfully computed from signed
 * assessments — that "aggregate-faithfulness gap" is deferred (PR7; ADR
 * revisit-condition 1). This module is the Combination-1 lever ("must possess
 * genuine substrate output"), nothing more.
 *
 * Compliance:
 *   - AC1: N/A — no LLM call (deterministic crypto).
 *   - AC4: N/A at the function-definition level. When the credential-write gate
 *           imports this (Build B), invocation testing (PR2) is satisfied at
 *           that wiring.
 *   - AC5: R20a perimeter unaffected.
 *   - AC6: N/A — no RAG context.
 *   - AC7: NOT engaged at the function-definition level. The eventual import
 *           site (the POST /api/accreditation/[agent_id] write gate) engages
 *           AC7-adjacent caution because route.ts is the auth/write surface.
 *   - AC8: Module under translation-sandwich/.
 *   - KG1: Pure synchronous function; env read at call time; no DB writes; no
 *           self-calls (reads the published key from env, not via HTTP); no
 *           module-level cache.
 *   - PR3: Synchronous — the verify result is complete before the caller
 *           constructs its response (the gate that imports this is synchronous).
 *   - PR4: N/A — no model selected.
 *   - PR6: NOT engaged — no distress / Zone-2 / Zone-3 logic. (This is the
 *           credential-integrity surface, not the safety perimeter.)
 *
 * Status at file creation: Scaffolded — built + unit-tested in isolation
 * (Build A), NOT wired into any route. Reaches Wired when the POST credential
 * gate imports it (Build B); Verified after the PR1 single-endpoint production
 * proof.
 */

import { verify, createPublicKey } from 'node:crypto'

import {
  canonicaliseLayer2Assessment,
  Layer2CanonicalisationError,
} from './layer2-canonical-json'
import type { SignedLayer2Assessment } from './layer2-signer'

// ============================================================================
// CONSTANTS — env var names (mirror /api/public-key/route.ts exactly)
// ============================================================================

/** PEM-encoded SPKI Ed25519 PUBLIC verification key (the current key). */
const PUBLIC_KEY_ENV_VAR = 'SUBSTRATE_LAYER2_PUBLIC_KEY'
/** Human-readable identifier for the current key. */
const KEY_ID_ENV_VAR = 'SUBSTRATE_LAYER2_KEY_ID'
/** Fallback key identifier (matches layer2-signer + /api/public-key). */
const DEFAULT_KEY_ID = 'substrate-layer2-default'

// Previous-key env vars (populated only during a rotation overlap window — A4).
// All four MUST be set together for the previous slot to be honoured; partial
// state defaults to no-rotation (fail-safe, identical to /api/public-key).
const PREVIOUS_PUBLIC_KEY_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY'
const PREVIOUS_KEY_ID_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_KEY_ID'
const PREVIOUS_KEY_ISSUED_AT_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT'
const PREVIOUS_KEY_RETIRES_AT_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Why a verification failed. Distinguishes operational misconfiguration
 * (verifier_key_*) from caller/data problems (everything else) so the eventual
 * gate can map them to different HTTP statuses (e.g. 503 vs 403/422).
 */
export type Layer2VerificationFailureReason =
  | 'malformed_input' // `signed` is not a structurally-valid SignedLayer2Assessment
  | 'verifier_key_unavailable' // SUBSTRATE_LAYER2_PUBLIC_KEY is unset/empty (operator must fix)
  | 'verifier_key_malformed' // the configured PEM does not parse as a public key
  | 'unknown_key_id' // signed.key_id matches neither the current nor the (active) previous key
  | 'expired_key_id' // signed.key_id matches the previous key, but its rotation overlap has ended
  | 'malformed_signature' // signature is not a 64-byte (base64) Ed25519 signature
  | 'uncanonicalisable_payload' // the assessment cannot be canonicalised (NaN/Infinity/undefined)
  | 'signature_mismatch' // canonical bytes + signature did not verify against the selected key

/**
 * Discriminated verification result. `valid: true` carries which published key
 * matched (current vs the rotation-overlap previous key) for audit clarity.
 */
export type Layer2VerificationResult =
  | { valid: true; key_id: string; matched: 'current' | 'previous' }
  | { valid: false; reason: Layer2VerificationFailureReason }

// ============================================================================
// HELPERS
// ============================================================================

interface ResolvedKey {
  key_id: string
  public_key_pem: string
}

interface ResolvedPreviousKey extends ResolvedKey {
  retires_at: string
}

/**
 * Resolve the current verification key from env at call time. Returns null when
 * SUBSTRATE_LAYER2_PUBLIC_KEY is unset/empty (operator misconfiguration — the
 * caller maps this to verifier_key_unavailable). key_id falls back to the
 * default, matching layer2-signer.getKeyId + /api/public-key.
 */
function resolveCurrentKey(): ResolvedKey | null {
  const pem = process.env[PUBLIC_KEY_ENV_VAR]
  if (!pem || pem.length === 0) return null
  const key_id = process.env[KEY_ID_ENV_VAR] || DEFAULT_KEY_ID
  return { key_id, public_key_pem: pem }
}

/**
 * Resolve the previous verification key from env at call time. Returns null
 * unless ALL FOUR previous-key env vars are set (rotation overlap in progress) —
 * the same fail-safe posture as /api/public-key's resolvePreviousKey. Partial
 * state → null (treated as no rotation).
 */
function resolvePreviousKey(): ResolvedPreviousKey | null {
  const pem = process.env[PREVIOUS_PUBLIC_KEY_ENV_VAR]
  const key_id = process.env[PREVIOUS_KEY_ID_ENV_VAR]
  const issuedAt = process.env[PREVIOUS_KEY_ISSUED_AT_ENV_VAR]
  const retiresAt = process.env[PREVIOUS_KEY_RETIRES_AT_ENV_VAR]

  if (
    !pem ||
    pem.length === 0 ||
    !key_id ||
    key_id.length === 0 ||
    !issuedAt ||
    issuedAt.length === 0 ||
    !retiresAt ||
    retiresAt.length === 0
  ) {
    return null
  }

  return { key_id, public_key_pem: pem, retires_at: retiresAt }
}

/**
 * Structural guard. `signed` arrives from untrusted JSON at the gate, so the
 * compile-time type is not a runtime guarantee. Confirms the three required
 * fields are present with the right primitive types before any crypto runs.
 */
function isStructurallySignedAssessment(
  signed: unknown,
): signed is SignedLayer2Assessment {
  if (typeof signed !== 'object' || signed === null) return false
  const s = signed as Record<string, unknown>
  if (typeof s.assessment !== 'object' || s.assessment === null) return false
  if (typeof s.signature !== 'string' || s.signature.length === 0) return false
  if (typeof s.key_id !== 'string' || s.key_id.length === 0) return false
  return true
}

// ============================================================================
// VERIFICATION
// ============================================================================

/**
 * Verify a SignedLayer2Assessment against the substrate's published Ed25519
 * verification key.
 *
 * Selects the key by `signed.key_id`: the current key, or — during a rotation
 * overlap (all four SUBSTRATE_LAYER2_PREVIOUS_* vars set and not yet expired) —
 * the previous key. Canonicalises `signed.assessment` with the SAME
 * canonicaliser the signer used, decodes the base64 signature, and runs
 * crypto.verify(null, …) (Ed25519 — the algorithm parameter is null; the key
 * type selects the algorithm).
 *
 * Never throws. Every failure is a typed { valid: false; reason } result.
 *
 * @param signed - the signed assessment to verify (treated as untrusted input)
 * @param now    - clock injection for the rotation-expiry check; defaults to
 *                 the current time. Tests pass a fixed Date for determinism.
 */
export function verifyLayer2Signature(
  signed: SignedLayer2Assessment | unknown,
  now: Date = new Date(),
): Layer2VerificationResult {
  // 1. Structural guard — untrusted input.
  if (!isStructurallySignedAssessment(signed)) {
    return { valid: false, reason: 'malformed_input' }
  }

  // 2. Resolve the verification key by key_id (current, or previous in overlap).
  const current = resolveCurrentKey()
  if (current === null) {
    return { valid: false, reason: 'verifier_key_unavailable' }
  }

  let selectedPem: string
  let matched: 'current' | 'previous'

  if (signed.key_id === current.key_id) {
    selectedPem = current.public_key_pem
    matched = 'current'
  } else {
    const previous = resolvePreviousKey()
    if (previous !== null && signed.key_id === previous.key_id) {
      // Rotation overlap: accept the previous key only while it is still in its
      // overlap window. A non-parseable retires_at is treated as expired
      // (fail-closed) rather than throwing.
      const retiresAtMs = Date.parse(previous.retires_at)
      if (Number.isNaN(retiresAtMs) || now.getTime() > retiresAtMs) {
        return { valid: false, reason: 'expired_key_id' }
      }
      selectedPem = previous.public_key_pem
      matched = 'previous'
    } else {
      return { valid: false, reason: 'unknown_key_id' }
    }
  }

  // 3. Parse the public key. A malformed configured PEM is an operator issue,
  //    not a caller issue — surfaced distinctly, fail-closed.
  let publicKey: ReturnType<typeof createPublicKey>
  try {
    publicKey = createPublicKey(selectedPem)
  } catch {
    return { valid: false, reason: 'verifier_key_malformed' }
  }

  // 4. Decode the signature — a valid Ed25519 signature is exactly 64 bytes.
  const signatureBytes = Buffer.from(signed.signature, 'base64')
  if (signatureBytes.length !== 64) {
    return { valid: false, reason: 'malformed_signature' }
  }

  // 5. Canonicalise the assessment with the SAME canonicaliser the signer used.
  //    A non-canonicalisable assessment (NaN/Infinity/undefined) cannot have
  //    been produced + signed by the substrate; reject, do not throw.
  let canonical: string
  try {
    canonical = canonicaliseLayer2Assessment(signed.assessment)
  } catch (err) {
    if (err instanceof Layer2CanonicalisationError) {
      return { valid: false, reason: 'uncanonicalisable_payload' }
    }
    // Any other unexpected throw is still failed-closed as a mismatch — the
    // gate never crashes on a verify call.
    return { valid: false, reason: 'uncanonicalisable_payload' }
  }

  // 6. Cryptographic verification. crypto.verify can throw on a malformed key
  //    object; we built `publicKey` via createPublicKey, but guard anyway so
  //    the function's never-throw contract holds.
  let ok: boolean
  try {
    ok = verify(
      null,
      Buffer.from(canonical, 'utf8'),
      publicKey,
      signatureBytes,
    )
  } catch {
    return { valid: false, reason: 'signature_mismatch' }
  }

  if (!ok) {
    return { valid: false, reason: 'signature_mismatch' }
  }

  return { valid: true, key_id: signed.key_id, matched }
}

// ============================================================================
// HARNESS-FACING EXPORTS
// ============================================================================

/** Test-only: env var names + default. Mirrors SUBSTRATE_LAYER2_SIGNER_CONFIG —
 *  lets test harnesses set/unset the verification-key env vars by reference,
 *  robust to renames. */
export const SUBSTRATE_LAYER2_VERIFIER_CONFIG = {
  PUBLIC_KEY_ENV_VAR,
  KEY_ID_ENV_VAR,
  DEFAULT_KEY_ID,
  PREVIOUS_PUBLIC_KEY_ENV_VAR,
  PREVIOUS_KEY_ID_ENV_VAR,
  PREVIOUS_KEY_ISSUED_AT_ENV_VAR,
  PREVIOUS_KEY_RETIRES_AT_ENV_VAR,
} as const
