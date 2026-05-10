/**
 * layer2-signer.ts — Ed25519 signing for Layer 2 authoritative assessments.
 *
 * Per /adopted/ADR-layer2-signing-infrastructure.md Decision 1 (Ed25519) +
 * Decision 2 (Layer2Assessment-only signed payload) + the Critical Change
 * Protocol responses pre-drafted inside the ADR.
 *
 * WHY THIS EXISTS. The substrate's moat sits jointly on Layer 2 + Layer 3
 * (per /adopted/ADR-stoic-agent-substrate-concept.md §"The moat boundary").
 * Cryptographic signing is what distinguishes a Layer 2 assessment that is
 * "validated" from one that is "authoritative" — every Layer2Assessment leaves
 * the substrate with a signature that downstream consumers can verify against
 * the substrate's public key without holding the signing capability.
 *
 * Algorithm:
 *   - Canonicalise the Layer2Assessment via canonicaliseLayer2Assessment
 *     (deterministic JSON; sorted keys at every nesting level).
 *   - crypto.sign(null, Buffer.from(canonical, 'utf8'), privateKey).
 *     Ed25519 takes null as the algorithm parameter — the algorithm is
 *     determined by the key type. Signature is exactly 64 bytes.
 *   - Encode the signature as standard base64 (88 base64 characters including
 *     padding for a 64-byte signature; 86 + '==' padding).
 *   - Return { assessment, signature, key_id }.
 *
 * Discipline (mirrors tier1-token.ts):
 *   - Env var read at call time, not at module load. The standalone harness
 *     and Vercel runtime may differ on env-var-load timing; reading at call
 *     time is robust to either.
 *   - Fail-closed on missing or malformed key. The orchestrator (parallel-run.ts)
 *     translates the throw into a user-facing 503 rather than emitting an
 *     unsigned assessment.
 *   - Constant-time considerations: signing itself is not a comparison
 *     operation, so timing-side-channel concerns from the auth surface do not
 *     transfer here. Ed25519 sign is deterministic and constant-time by
 *     algorithm property.
 *
 * Compliance:
 *   - AC1: N/A — no LLM call.
 *   - AC4: This module is imported by parallel-run.ts ONLY; called AFTER
 *           Layer 2 produces Layer2Assessment, BEFORE composed-output
 *           construction. AC4 invocation testing is satisfied at the
 *           orchestrator wiring (parallel-run.ts) and verified in production
 *           via the Step 12 PR1 single-endpoint proof scenarios.
 *   - AC5: R20a perimeter unaffected.
 *   - AC6: N/A — no RAG context.
 *   - AC7: NOT engaged at the function-definition level. The import-site in
 *           parallel-run.ts engages AC7-adjacent caution because route.ts is
 *           the auth surface.
 *   - AC8: Module under translation-sandwich/.
 *   - KG1: Pure synchronous function; no fire-and-forget; no DB writes; no
 *           module-level cache; no self-calls.
 *   - PR3: Synchronous.
 *   - PR4: N/A — no model selected.
 *   - PR6: This is the safety-critical surface; changes require the full
 *           Critical Change Protocol per the ADR §"Critical Change Protocol
 *           responses".
 *
 * Status at file creation: Wired (this module is imported by parallel-run.ts
 * Step 7 wiring). Reaches Verified after the three production scenarios pass
 * at /api/reason per the PR1 single-endpoint proof at Step 12.
 */

import { sign, createPrivateKey } from 'node:crypto'

import { canonicaliseLayer2Assessment } from './layer2-canonical-json'
import type { Layer2Assessment } from './layer2-mechanisms'

// ============================================================================
// CONSTANTS
// ============================================================================

/** Env var name for the Ed25519 private signing key (PEM-encoded). Set in
 *  Vercel project settings (Production + Preview + Development). Provisioned
 *  at the founder backup ceremony per the next-session prompt's Step 4. */
const SIGNING_KEY_ENV_VAR = 'SUBSTRATE_LAYER2_SIGNING_KEY'

/** Env var name for the human-readable key identifier. Quarter-encoded for
 *  rotation traceability (e.g. 'substrate-layer2-2026Q2'). */
const KEY_ID_ENV_VAR = 'SUBSTRATE_LAYER2_KEY_ID'

/** Fallback key identifier used only when SUBSTRATE_LAYER2_KEY_ID is unset.
 *  Production deployments should always set the env var explicitly so the
 *  key_id reflects the rotation generation. */
const DEFAULT_KEY_ID = 'substrate-layer2-default'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Wire shape per ADR Decision 2. The `assessment` field is the bare
 * Layer2Assessment; `signature` is base64; `key_id` selects the verification
 * key during a rotation overlap window.
 */
export interface SignedLayer2Assessment {
  assessment: Layer2Assessment
  signature: string
  key_id: string
}

/**
 * Typed error thrown by signLayer2Assessment when the signing-key env var is
 * unset or malformed. The orchestrator (parallel-run.ts) catches this and
 * fails closed — a 503 response rather than an unsigned assessment.
 */
export class SubstrateSigningKeyMissingError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SubstrateSigningKeyMissingError'
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Read and parse the Ed25519 signing key from env at call time. Throws
 * SubstrateSigningKeyMissingError if the env var is unset, empty, or fails to
 * parse as a PEM-encoded private key.
 */
function loadSigningKey() {
  const pem = process.env[SIGNING_KEY_ENV_VAR]
  if (!pem || pem.length === 0) {
    throw new SubstrateSigningKeyMissingError(
      `${SIGNING_KEY_ENV_VAR} is not set. Layer 2 cannot sign assessments ` +
        `without the signing key. Set the env var per ` +
        `/adopted/ADR-layer2-signing-infrastructure.md §Decision 1.`
    )
  }
  try {
    return createPrivateKey(pem)
  } catch (err) {
    throw new SubstrateSigningKeyMissingError(
      `${SIGNING_KEY_ENV_VAR} is set but malformed: ` +
        `${err instanceof Error ? err.message : String(err)}. ` +
        `Expected a PEM-encoded Ed25519 private key (PKCS#8 format). ` +
        `Per /adopted/ADR-layer2-signing-infrastructure.md §Decision 1.`
    )
  }
}

/**
 * Read the key identifier from env at call time. Falls back to a default if
 * unset; production should always set this explicitly.
 */
function getKeyId(): string {
  const keyId = process.env[KEY_ID_ENV_VAR]
  if (keyId && keyId.length > 0) {
    return keyId
  }
  return DEFAULT_KEY_ID
}

// ============================================================================
// SIGNING
// ============================================================================

/**
 * Sign a Layer2Assessment with the substrate's Ed25519 private key.
 *
 * Returns a SignedLayer2Assessment whose `signature` field is a base64-encoded
 * 64-byte Ed25519 signature over the canonical JSON of the assessment, and
 * whose `key_id` field identifies the public key needed to verify.
 *
 * Verification (verifier-side, e.g. plugin or third-party agent):
 *
 *   const canonical = canonicaliseLayer2Assessment(signed.assessment)
 *   const ok = crypto.verify(
 *     null,
 *     Buffer.from(canonical, 'utf8'),
 *     publicKeyForKeyId(signed.key_id),
 *     Buffer.from(signed.signature, 'base64'),
 *   )
 *
 * @param assessment - the Layer2Assessment to sign
 * @returns the wrapped, signed assessment
 * @throws SubstrateSigningKeyMissingError if the signing-key env var is unset
 *         or malformed
 * @throws Layer2CanonicalisationError if the assessment contains a value with
 *         no canonical representation (NaN, Infinity, undefined, etc.)
 */
export function signLayer2Assessment(assessment: Layer2Assessment): SignedLayer2Assessment {
  const privateKey = loadSigningKey()
  const key_id = getKeyId()

  const canonical = canonicaliseLayer2Assessment(assessment)
  // Ed25519: the algorithm parameter is null because the algorithm is
  // determined by the key type. crypto.sign returns a 64-byte Buffer.
  const signatureBytes = sign(null, Buffer.from(canonical, 'utf8'), privateKey)
  const signature = signatureBytes.toString('base64')

  return { assessment, signature, key_id }
}

// ============================================================================
// HARNESS-FACING EXPORTS
// ============================================================================

/** Test-only: env var names. Test harnesses set + unset these around the
 *  signing operation; exposing the names keeps tests robust to renames. */
export const SUBSTRATE_LAYER2_SIGNER_CONFIG = {
  SIGNING_KEY_ENV_VAR,
  KEY_ID_ENV_VAR,
  DEFAULT_KEY_ID,
} as const
