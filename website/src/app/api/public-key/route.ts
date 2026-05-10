import { NextResponse } from 'next/server'
import { corsHeaders, corsPreflightResponse } from '@/lib/security'

// =============================================================================
// /api/public-key — Layer 2 verification key discovery endpoint.
//
// GET /api/public-key
//
// Outcome: returns the substrate's Ed25519 public verification key + metadata,
//          allowing third-party verifiers (plugins, downstream agents, auditors)
//          to verify Layer 2 signatures against the canonical public key.
//
// Per /adopted/ADR-layer2-signing-infrastructure.md Decision 3 (hybrid
// distribution: API discovery + plugin manifest) + Open Question 1
// (Choice 3(a) elected at the A3 scaffolding session-open: public read, no
// auth, edge-cached). Per /adopted/ADR-A4-key-management.md Decision 2
// (Choice 2(a) elected at A4 session-open: previous-key env-var slots only;
// substrate signs with current key only; verifiers accept either key during
// the 30-day overlap window via key_id matching).
//
// Response shape (per A3 ADR Decision 3, extended at A4 to populate `previous`
// and `rotation_overlap_until` during the overlap window):
//   {
//     "key_id": "<string>",
//     "algorithm": "Ed25519",
//     "public_key_pem": "<PEM-encoded SPKI public key>",
//     "issued_at": "<ISO 8601>",
//     "rotation_overlap_until": "<ISO 8601 or null>",
//     "previous": {
//       "key_id": "<string>",
//       "public_key_pem": "<PEM-encoded SPKI public key>",
//       "issued_at": "<ISO 8601>",
//       "retires_at": "<ISO 8601>"
//     } | null
//   }
//
// `rotation_overlap_until` and `previous` are non-null only when ALL FOUR
// previous-key env vars are set (rotation in progress); partial state defaults
// to no-rotation per the fail-safe posture committed in A4 ADR §Decision 2.
// Verifiers should select the public key matching the `key_id` field on a
// signed-assessment object: if it matches the top-level `key_id`, use the
// current public_key_pem; if it matches `previous.key_id`, use that; otherwise
// reject.
//
// Auth posture (A3 Choice 3(a); unchanged at A4):
//   - No authentication. The public key is, by definition, public.
//   - CORS: Access-Control-Allow-Origin: * (any origin may verify).
//   - Cache: public, max-age=3600 + s-maxage=3600 (1 hour) — verifiers refresh
//     on cadence; rotation overlap window is 30 days, so 1-hour cache is well
//     within tolerance per A3 ADR Decision 4.
//
// Compliance:
//   - AC1: N/A — no LLM call.
//   - AC4: N/A — no safety surface; no invocation testing required.
//   - AC5: R20a perimeter unaffected.
//   - AC6: N/A — no RAG context.
//   - AC7: NOT engaged. No auth/cookie/session/redirect surface touched.
//   - AC8: N/A — endpoint serves the substrate's Layer 2 signing infrastructure;
//           no translation-sandwich data flows through this surface.
//   - KG1: No DB writes; pure env-var read; synchronous return.
//   - PR3: Synchronous; no async work.
//   - PR4: N/A — no model selection.
//   - PR6: Companion endpoint to the safety-critical signing surface; the
//           public key publication itself is not safety-critical (the key is
//           public and forgery requires breaking Ed25519), but changes to
//           this endpoint co-reside with signing infrastructure and inherit
//           AC7-adjacent caution. The A4 extension adds rotation-overlap
//           support, which preserves the A3 verification contract during the
//           30-day window.
// =============================================================================

// Current key env vars (provisioned at A3 session 2026-05-10).
const PUBLIC_KEY_ENV_VAR = 'SUBSTRATE_LAYER2_PUBLIC_KEY'
const KEY_ID_ENV_VAR = 'SUBSTRATE_LAYER2_KEY_ID'
const KEY_ISSUED_AT_ENV_VAR = 'SUBSTRATE_LAYER2_KEY_ISSUED_AT'

// Previous-key env vars (provisioned at A4 session 2026-05-10; optional —
// populated only during a rotation overlap window per A4 ADR Decision 2).
// All four MUST be set together for the previous slot to be populated; partial
// state defaults to no-rotation per the fail-safe posture.
const PREVIOUS_PUBLIC_KEY_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY'
const PREVIOUS_KEY_ID_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_KEY_ID'
const PREVIOUS_KEY_ISSUED_AT_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT'
const PREVIOUS_KEY_RETIRES_AT_ENV_VAR = 'SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT'

const DEFAULT_KEY_ID = 'substrate-layer2-default'
const ALGORITHM = 'Ed25519' as const

/**
 * Cache-Control: 1-hour edge cache. Lower bound on revisit comes from the
 * rotation overlap window (30 days per ADR Decision 4); 1 hour is well within
 * that window so verifiers refreshing every hour will always see at least the
 * `previous` slot for a key entering rotation.
 *
 * The `s-maxage` directive caches at the Vercel edge; `max-age` caches at the
 * verifier's HTTP client. Both align at 1 hour.
 */
const CACHE_CONTROL_HEADER = 'public, max-age=3600, s-maxage=3600'

/**
 * Resolve the previous-key block from env vars. Returns the populated previous
 * structure when ALL FOUR previous-key env vars are set (rotation overlap in
 * progress); returns null otherwise (steady state, or partial state per the
 * fail-safe posture committed in A4 ADR §Decision 2).
 *
 * Fail-safe rationale: if a rotation is mid-process and one of the four env
 * vars is accidentally unset (or not yet propagated by Vercel during a
 * multi-variable deploy), the endpoint defaults to no-rotation rather than
 * producing an inconsistent response. The runbook (Step 4 of the rotation
 * procedure) verifies all four are set after each redeploy.
 */
function resolvePreviousKey(): {
  key_id: string
  public_key_pem: string
  issued_at: string
  retires_at: string
} | null {
  const previousPublicKeyPem = process.env[PREVIOUS_PUBLIC_KEY_ENV_VAR]
  const previousKeyId = process.env[PREVIOUS_KEY_ID_ENV_VAR]
  const previousIssuedAt = process.env[PREVIOUS_KEY_ISSUED_AT_ENV_VAR]
  const previousRetiresAt = process.env[PREVIOUS_KEY_RETIRES_AT_ENV_VAR]

  // All four must be non-empty strings; partial state → null (fail-safe).
  if (
    !previousPublicKeyPem ||
    previousPublicKeyPem.length === 0 ||
    !previousKeyId ||
    previousKeyId.length === 0 ||
    !previousIssuedAt ||
    previousIssuedAt.length === 0 ||
    !previousRetiresAt ||
    previousRetiresAt.length === 0
  ) {
    return null
  }

  return {
    key_id: previousKeyId,
    public_key_pem: previousPublicKeyPem,
    issued_at: previousIssuedAt,
    retires_at: previousRetiresAt,
  }
}

export async function GET() {
  const publicKeyPem = process.env[PUBLIC_KEY_ENV_VAR]
  const keyId = process.env[KEY_ID_ENV_VAR] || DEFAULT_KEY_ID

  // Read issued_at from env, falling back to deploy-time. The deploy-time
  // fallback is acceptable for first deploy (it captures the cold-start of the
  // serverless function instance, which approximates the deploy time within
  // seconds). Production should always set the env var explicitly so the
  // value reflects the actual key-generation event.
  const issuedAt =
    process.env[KEY_ISSUED_AT_ENV_VAR] && process.env[KEY_ISSUED_AT_ENV_VAR]!.length > 0
      ? process.env[KEY_ISSUED_AT_ENV_VAR]!
      : new Date().toISOString()

  if (!publicKeyPem || publicKeyPem.length === 0) {
    // Operational issue: the env var is unset. Verifiers cannot proceed; return
    // 503 with a clear error. Mirrors the signing-throw fail-closed posture
    // on /api/reason.
    return NextResponse.json(
      {
        error: 'substrate_public_key_unavailable',
        detail:
          'The substrate verification key is not configured on this deployment. ' +
          'Set SUBSTRATE_LAYER2_PUBLIC_KEY in environment variables. ' +
          'Per /adopted/ADR-layer2-signing-infrastructure.md §Decision 3.',
      },
      {
        status: 503,
        headers: {
          ...corsHeaders(),
          // Don't cache failures — operators must be able to fix the env var
          // and see the next request succeed.
          'Cache-Control': 'no-store',
        },
      }
    )
  }

  // Resolve the previous-key block per A4 ADR §Decision 2. Returns null in
  // steady state (no rotation in progress) and during partial-state config
  // drift (fail-safe). When non-null, rotation_overlap_until mirrors
  // previous.retires_at to give verifiers a single field for trust-window
  // assessment.
  const previous = resolvePreviousKey()
  const rotationOverlapUntil = previous ? previous.retires_at : null

  return NextResponse.json(
    {
      key_id: keyId,
      algorithm: ALGORITHM,
      public_key_pem: publicKeyPem,
      issued_at: issuedAt,
      rotation_overlap_until: rotationOverlapUntil,
      previous,
    },
    {
      status: 200,
      headers: {
        ...corsHeaders(),
        'Cache-Control': CACHE_CONTROL_HEADER,
      },
    }
  )
}

// POST / PUT / DELETE / PATCH return 405. Only GET is meaningful.
export async function POST() {
  return NextResponse.json(
    { error: 'method_not_allowed', detail: 'GET only.' },
    { status: 405, headers: { ...corsHeaders(), Allow: 'GET, OPTIONS' } }
  )
}

// OPTIONS — CORS preflight.
export async function OPTIONS() {
  return corsPreflightResponse()
}
