/**
 * tier1-token.ts — AC-13 Tier 1 force-clarification continuation token mechanic.
 *
 * Per ADR-008 §4 (Continuation-token mechanic). HMAC-SHA256 over a four-field
 * payload. Stateless: no DB, no session, no cookies. The token carries no
 * user-identifying data; it is bound to the request, not to the user. AC7 NOT
 * engaged — this is a stateless cryptographic signature, not a session credential.
 *
 * Token shape (per ADR-008 §4.1):
 *   <base64(payload_json)>.<hex(hmac_sha256(payload_json, secret))>
 *
 * Payload:
 *   {
 *     "v": 1,
 *     "input_hash": "<sha256(original_input_text) hex>",
 *     "trigger_code": "ELEMENT_FUSION" | "SCOPE_AMBIGUITY" | "TEMPORAL_AMBIGUITY",
 *     "issued_at": <unix timestamp>,
 *     "expires_at": <unix timestamp = issued_at + 1800>
 *   }
 *
 * Compliance:
 *   - AC1: N/A — no LLM call.
 *   - AC4: This module is imported only by route.ts AFTER the line-144 distress
 *           check. Token validation runs AFTER the distress check (per ADR-008 §6).
 *           Phase 7 of the harness asserts the order-of-operations invariant.
 *   - AC5: R20a perimeter preserved. Token validation does not bypass distress.
 *   - AC7: NOT engaged. The token is a stateless signature, not a session credential.
 *           No cookies, no Supabase write, no auth surface.
 *   - AC8: Module sits under /website/src/lib/translation-sandwich/.
 *   - KG1: Pure functions; no fire-and-forget; no module-level cache; no DB writes;
 *           no self-calls; secret read at call time (not at module load).
 *   - PR3: Synchronous; safety-critical-adjacent (token validation gates engine
 *           re-invocation but distress check is upstream).
 *   - PR6: Token mechanic is part of the AC-13 perimeter; changes here are Critical
 *           per the Critical Change Protocol.
 *
 * Status at file creation: Wired (token issuance + validation), pending env var
 * provision (TRANSLATION_SANDWICH_TIER1_SECRET) at Sub-session M1-CP4e-B before
 * the route can actually issue or validate non-test tokens. The fail-closed
 * posture means missing secret produces a typed error, not silent acceptance.
 */

import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

import type { Tier1TriggerCode } from './layer2-mechanisms'

// ============================================================================
// CONSTANTS (per ADR-008 §4)
// ============================================================================

/** Token expiry window in seconds. Default 30 minutes (ADR-008 §4.1).
 *  Revisited at M1-CP5 if real-traffic data shows mismatch (ADR-008 §10.1). */
const TOKEN_EXPIRY_SECONDS = 30 * 60

/** Token version. Bumped if the payload shape changes. */
const TOKEN_VERSION = 1 as const

/** Env var name for the HMAC signing key. Set in Vercel project settings
 *  (Production + Preview + Development) at Sub-session M1-CP4e-B. */
const SECRET_ENV_VAR = 'TRANSLATION_SANDWICH_TIER1_SECRET'

/**
 * Env flag for the AC-13 Tier 1 clarification-continuation fix (ADR-008 §A,
 * 2026-06-18; mechanism-correction Part A). Exact string 'true'; read at call
 * time (not module load). UNSET/other (the default in every environment at
 * build time) → the route never reads `clarification_response`, never
 * suppresses a re-fired trigger, and distress-checks `input` alone — byte-
 * identical to the pre-Part-A route (today's broken-but-inert continuation
 * behaviour is preserved exactly). 'true' → the continuation contract is live
 * (typed answer channel + trigger suppression + answer-into-context fold +
 * distress coverage of the answer). Activation is a founder-walked 0c-ii step;
 * rollback = unset + redeploy.
 */
const CONTINUATION_ENV_VAR = 'SUBSTRATE_TIER1_CONTINUATION_ENABLED'

// ============================================================================
// TYPES
// ============================================================================

/** Token payload shape per ADR-008 §4.1. Base64-encoded JSON string is the
 *  first half of the wire-format token. */
export interface ContinuationTokenPayload {
  v: typeof TOKEN_VERSION
  input_hash: string
  trigger_code: Tier1TriggerCode
  issued_at: number // unix timestamp (seconds)
  expires_at: number // unix timestamp (seconds)
}

/** Validation result. Discriminated union on `ok`. */
export type ContinuationTokenValidationResult =
  | { ok: true; payload: ContinuationTokenPayload }
  | {
      ok: false
      /** Error code per ADR-008 §4.4. The route returns these in HTTP 400 bodies. */
      error_code:
        | 'invalid_continuation_token'
        | 'invalid_continuation_token_signature'
        | 'continuation_token_expired'
        | 'continuation_token_input_mismatch'
        | 'continuation_token_secret_missing'
      /** Optional: the token's expires_at (for the 'expired' case). */
      expired_at?: number
    }

/** Typed error thrown by issueContinuationToken when the secret is missing.
 *  The route handles this as a 503 (engine misconfigured). */
export class Tier1SecretMissingError extends Error {
  constructor() {
    super(
      `${SECRET_ENV_VAR} is not set. Tier 1 force-clarification cannot issue ` +
        'continuation tokens without the signing secret. Set the env var in ' +
        'Vercel (Production + Preview + Development) per ADR-008 §4.2.'
    )
    this.name = 'Tier1SecretMissingError'
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/** Read the HMAC signing secret from env at call time (not at module load).
 *  Throws Tier1SecretMissingError if the env var is unset or empty. */
function getSecret(): string {
  const secret = process.env[SECRET_ENV_VAR]
  if (!secret || secret.length === 0) {
    throw new Tier1SecretMissingError()
  }
  return secret
}

/** Compute SHA-256 of a string and return hex. Used for input_hash. */
export function sha256Hex(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

/** Base64-encode a string. Standard base64 (URL-safe variant not used —
 *  the token includes a `.` delimiter that does not appear in standard base64
 *  output, so disambiguation is preserved). */
function b64Encode(text: string): string {
  return Buffer.from(text, 'utf8').toString('base64')
}

/** Base64-decode a string. Throws if the input is not valid base64. */
function b64Decode(b64: string): string {
  return Buffer.from(b64, 'base64').toString('utf8')
}

// ============================================================================
// ISSUANCE (per ADR-008 §4.3)
// ============================================================================

/**
 * Issue a continuation token for a Tier 1 force-clarification response.
 *
 * Per ADR-008 §4.3:
 *   1. Compute input_hash = sha256(originalInputText).
 *   2. Build payload with issued_at = now(), expires_at = now() + 1800.
 *   3. Compute signature = hmac_sha256(payload_json, secret).
 *   4. Return base64(payload_json) + "." + hex(signature).
 *
 * @param originalInputText - the input text the practitioner submitted
 * @param triggerCode - the Tier 1 trigger that fired
 * @returns the wire-format continuation token string
 * @throws Tier1SecretMissingError when TRANSLATION_SANDWICH_TIER1_SECRET is unset
 */
export function issueContinuationToken(
  originalInputText: string,
  triggerCode: Tier1TriggerCode
): string {
  const secret = getSecret()
  const nowSeconds = Math.floor(Date.now() / 1000)

  const payload: ContinuationTokenPayload = {
    v: TOKEN_VERSION,
    input_hash: sha256Hex(originalInputText),
    trigger_code: triggerCode,
    issued_at: nowSeconds,
    expires_at: nowSeconds + TOKEN_EXPIRY_SECONDS,
  }

  const payloadJson = JSON.stringify(payload)
  const payloadB64 = b64Encode(payloadJson)
  const signatureHex = createHmac('sha256', secret).update(payloadJson).digest('hex')

  return `${payloadB64}.${signatureHex}`
}

// ============================================================================
// VALIDATION (per ADR-008 §4.4)
// ============================================================================

/**
 * Validate a continuation token submitted on a second-turn request.
 *
 * Per ADR-008 §4.4:
 *   1. Split at the delimiter; HTTP 400 with 'invalid_continuation_token' if malformed.
 *   2. Decode the payload; HTTP 400 if not valid JSON with required fields.
 *   3. Recompute the signature over the payload; HTTP 400 with
 *      'invalid_continuation_token_signature' on mismatch (constant-time compare).
 *   4. Check expires_at >= now(); HTTP 400 with 'continuation_token_expired' if expired.
 *   5. Compute sha256(currentInputText); HTTP 400 with
 *      'continuation_token_input_mismatch' if it differs from payload.input_hash.
 *
 * Returns a discriminated union; the route inspects `ok` to dispatch.
 *
 * @param token - the wire-format token from the request body
 * @param currentInputText - the input text on the resumption request (typically
 *                            the original input augmented with the practitioner's
 *                            answer to the clarification question)
 */
export function validateContinuationToken(
  token: unknown,
  currentInputText: string
): ContinuationTokenValidationResult {
  // Step 1: shape + delimiter
  if (typeof token !== 'string' || token.length === 0) {
    return { ok: false, error_code: 'invalid_continuation_token' }
  }
  const parts = token.split('.')
  if (parts.length !== 2) {
    return { ok: false, error_code: 'invalid_continuation_token' }
  }
  const [payloadB64, signatureHex] = parts
  if (payloadB64.length === 0 || signatureHex.length === 0) {
    return { ok: false, error_code: 'invalid_continuation_token' }
  }

  // Step 2: decode + parse + shape-check the payload
  let payloadJson: string
  try {
    payloadJson = b64Decode(payloadB64)
  } catch {
    return { ok: false, error_code: 'invalid_continuation_token' }
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(payloadJson)
  } catch {
    return { ok: false, error_code: 'invalid_continuation_token' }
  }
  const validatedPayload = validatePayloadShape(parsed)
  if (validatedPayload === null) {
    return { ok: false, error_code: 'invalid_continuation_token' }
  }

  // Step 3: recompute + constant-time-compare signature
  let secret: string
  try {
    secret = getSecret()
  } catch (err) {
    if (err instanceof Tier1SecretMissingError) {
      return { ok: false, error_code: 'continuation_token_secret_missing' }
    }
    throw err
  }
  const expectedSignatureHex = createHmac('sha256', secret)
    .update(payloadJson)
    .digest('hex')
  // timingSafeEqual requires equal-length buffers; if lengths differ, compare
  // would short-circuit non-constantly. Pad/truncate is unsafe; instead, fail
  // first on length mismatch (an attacker who controls the token sees this
  // anyway because they crafted the wire-format).
  if (signatureHex.length !== expectedSignatureHex.length) {
    return { ok: false, error_code: 'invalid_continuation_token_signature' }
  }
  const actualBuf = Buffer.from(signatureHex, 'hex')
  const expectedBuf = Buffer.from(expectedSignatureHex, 'hex')
  // hex strings of equal length should produce equal-length buffers, but
  // verify defensively before timingSafeEqual.
  if (actualBuf.length !== expectedBuf.length) {
    return { ok: false, error_code: 'invalid_continuation_token_signature' }
  }
  if (!timingSafeEqual(actualBuf, expectedBuf)) {
    return { ok: false, error_code: 'invalid_continuation_token_signature' }
  }

  // Step 4: expiry check
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (validatedPayload.expires_at < nowSeconds) {
    return {
      ok: false,
      error_code: 'continuation_token_expired',
      expired_at: validatedPayload.expires_at,
    }
  }

  // Step 5: input-hash match
  const currentInputHash = sha256Hex(currentInputText)
  if (currentInputHash !== validatedPayload.input_hash) {
    return { ok: false, error_code: 'continuation_token_input_mismatch' }
  }

  // All checks passed.
  return { ok: true, payload: validatedPayload }
}

/**
 * Validate the parsed-JSON payload's shape. Returns the typed payload on success;
 * null if any field is missing / wrong type / wrong enum value.
 */
function validatePayloadShape(parsed: unknown): ContinuationTokenPayload | null {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return null
  }
  const o = parsed as Record<string, unknown>
  if (o.v !== TOKEN_VERSION) return null
  if (typeof o.input_hash !== 'string' || o.input_hash.length === 0) return null
  if (typeof o.trigger_code !== 'string') return null
  if (
    o.trigger_code !== 'ELEMENT_FUSION' &&
    o.trigger_code !== 'SCOPE_AMBIGUITY' &&
    o.trigger_code !== 'TEMPORAL_AMBIGUITY'
  ) {
    return null
  }
  if (typeof o.issued_at !== 'number' || !Number.isFinite(o.issued_at)) return null
  if (typeof o.expires_at !== 'number' || !Number.isFinite(o.expires_at)) return null
  return {
    v: TOKEN_VERSION,
    input_hash: o.input_hash,
    trigger_code: o.trigger_code as Tier1TriggerCode,
    issued_at: o.issued_at,
    expires_at: o.expires_at,
  }
}

// ============================================================================
// CLARIFICATION-CONTINUATION (ADR-008 §A, 2026-06-18 — mechanism-correction Part A)
// ============================================================================

/**
 * True only when SUBSTRATE_TIER1_CONTINUATION_ENABLED is the exact string
 * 'true'. Read at call time. The single switch that gates the whole Design-A
 * continuation contract on /api/reason (ADR-008 §A.2). Off → byte-identical to
 * the pre-Part-A route.
 */
export function isTier1ContinuationEnabled(): boolean {
  return process.env[CONTINUATION_ENV_VAR] === 'true'
}

/**
 * Compose the distress subject text for the R20a perimeter on a continuation
 * turn (ADR-008 §A.3 step 2). The practitioner's `clarification_response` is a
 * SEPARATE field in Design A (the original `input` stays byte-identical to keep
 * the hash binding), so the perimeter must distress-check `input + answer` —
 * otherwise distress in the answer would escape the perimeter (AC5).
 *
 * Returns `input` unchanged when there is no non-empty answer to fold (the
 * caller gates this on the flag being on, so flag-off is byte-identical). Pure.
 */
export function composeContinuationDistressText(
  input: string,
  clarificationResponse: string | undefined,
): string {
  if (
    typeof clarificationResponse !== 'string' ||
    clarificationResponse.trim() === ''
  ) {
    return input
  }
  return `${input}\n\n${clarificationResponse}`
}

/**
 * Fold the practitioner's clarification answer into the examination context so
 * the second-turn Layer-1 re-extraction is genuinely informed by the answer
 * (ADR-008 §A.1 step 3 / §A.4). A sibling of reason-loop-closure.ts's
 * composeReExaminationContext — same compose pattern, different note. Returns
 * the base context unchanged when there is no answer to fold. Pure.
 */
export function composeClarificationContext(
  baseContext: string | undefined,
  clarificationResponse: string | undefined,
): string | undefined {
  if (
    typeof clarificationResponse !== 'string' ||
    clarificationResponse.trim() === ''
  ) {
    return baseContext
  }
  const note = `Clarification response (answering a prior force-clarification question): ${clarificationResponse}`
  return baseContext !== undefined && baseContext.trim() !== ''
    ? `${baseContext}\n\n${note}`
    : note
}

// ============================================================================
// HARNESS-FACING EXPORTS
// ============================================================================

/** Test-only: token expiry constant. Phase 11 of the harness asserts the
 *  default 30-minute window per ADR-008 §4.1. */
export const TIER1_TOKEN_CONFIG = {
  TOKEN_EXPIRY_SECONDS,
  TOKEN_VERSION,
  SECRET_ENV_VAR,
  CONTINUATION_ENV_VAR,
} as const
