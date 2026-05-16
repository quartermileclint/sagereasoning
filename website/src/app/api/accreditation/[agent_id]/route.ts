/**
 * /api/accreditation/[agent_id] — Public Verification Endpoint (ATL Wrapper
 * Component 3 — the badge / accreditation, public face).
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-16, this session — step 6b).
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md §"Component 3"
 *     (the spec, Adopted 2026-05-14). This is the named public surface — the
 *     verifiable credential third parties query.
 *   - /operations/decision-log.md —
 *       D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16
 *       (this build; the Critical Change Protocol responses recorded there)
 *       D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15
 *       (predecessor — the 6a persistence layer this route consumes)
 *   - /manifest.md §R3 (disclaimer) / §R4 (IP boundary) / §R9 (does not promise
 *     outcomes) / §R18 a–e (the badge certifies the carried profile) / §AC5
 *     (R20a perimeter — NOT engaged: no distress surface) / §AC7 (NOT engaged:
 *     no auth/cookie/session/redirect surface) / §AC8 (translation-sandwich
 *     substrate) / §KG1 (Vercel five-rule constraint).
 *
 * WHAT THIS ROUTE IS
 *
 * The single public read endpoint for the ATL badge. A verifier — a person, an
 * agent, an auditor — calls
 *     GET https://sagereasoning.com/api/accreditation/{agent_id}
 * and receives that wrapped agent's reasoning-pattern credential as JSON. The
 * credential is the R4-compliant AccreditationPayload (Senecan grade, typical
 * proximity, authority level, the four dimension levels, direction of travel,
 * persisting passions, evaluation window, timestamps, verification URL,
 * disclaimer). Optionally `?format=card` returns the richer displayable
 * AccreditationCard.
 *
 * THE THREE 6a LIBRARY SEAMS THIS ROUTE CONSUMES
 *   - lookupAccreditationRecord (atl-accreditation-store.ts) — the Supabase
 *     read; signature matches handleAccreditationLookup's `lookupFn`.
 *   - handleAccreditationLookup (trust-layer/accreditation/public-endpoint.ts)
 *     — validation + lookup + expiry detection + payload build. Returns the
 *     discriminated AccreditationEndpointResponse (ok / not_found / expired /
 *     error).
 *   - buildAccreditationCard + serializeCard (trust-layer/card/
 *     accreditation-card.ts) — the displayable card builder used for
 *     ?format=card.
 *
 * STATUS → HTTP MAPPING (per Step 2 design decision 3, 2026-05-16):
 *   - 'ok'        → 200 (the canonical credential response)
 *   - 'not_found' → 404 (no row for that agent_id)
 *   - 'expired'   → 200 (carries data — the known-but-stale credential the
 *                        verifier can still inspect; the body's `status` field
 *                        signals staleness)
 *   - 'error'     → 400 (invalid agent_id format — a client error)
 *   - Supabase exception → 503 (service-temporarily-unavailable; the message
 *                              is intentionally vague to avoid leaking internal
 *                              details; the failure is NOT cached so operators
 *                              can fix and retry — mirrors /api/public-key)
 *
 * RESPONSE BODY ENVELOPE
 *
 * Every successful and known-error response is a JSON object with the
 * AccreditationEndpointResponse shape *extended* with a top-level
 * `documentation_url` field pointing at /limitations (R18b). For ?format=card,
 * `data` is the serialized card rather than the AccreditationPayload.
 *
 *   { status: 'ok',
 *     data: <AccreditationPayload | serialized card>,
 *     documentation_url: 'https://sagereasoning.com/limitations' }
 *
 * COMPLIANCE
 *   - R3 (disclaimer always present): the AccreditationPayload's `disclaimer`
 *     field is non-optional in the ported library; the
 *     X-Accreditation-Disclaimer header is also set via
 *     ACCREDITATION_RESPONSE_HEADERS.
 *   - R4 (IP boundary): the route serves whatever handleAccreditationLookup
 *     returns — the R4 boundary (payload, not full record) is enforced inside
 *     the ported library by buildAccreditationPayload. The route does not
 *     reach around the handler to expose internal fields.
 *   - R9 (does not promise outcomes): the X-Accreditation-Disclaimer header
 *     states "Evaluates reasoning quality. Does not promise outcomes."
 *   - R18a — Character Kernel: the badge certifies observable reasoning
 *     patterns against the Stoic framework, not safety/ethics/trustworthiness
 *     absolutely. Stated in the disclaimer.
 *   - R18b — documentation link: every response carries
 *     `documentation_url: 'https://sagereasoning.com/limitations'`. The
 *     /limitations page (Next.js page at /website/src/app/limitations/page.tsx,
 *     R19c/R19d) is the documented place describing what the badge measures
 *     and its limitations.
 *   - R18c — interoperability: the accreditation schema accommodates other
 *     providers. The route returns the schema-defined fields verbatim.
 *   - R18d — adversarial evaluation: Priority 3.3d, its own work item; not
 *     wired this session.
 *   - R18e — Article 50 transparency: N/A for this endpoint (no
 *     substrate-generated prose served here; it serves a structured credential).
 *   - AC5 (R20a perimeter): NOT engaged. The route carries no distress
 *     surface; it serves a credential record. The R20a eight-route perimeter is
 *     unchanged.
 *   - AC7 (auth/session/cookie/redirect): NOT engaged. Public, no-auth GET.
 *     No cookies read or set; no redirects; no session state.
 *   - AC8: this route is the first public substrate-consumer that serves the
 *     ATL Wrapper's credential.
 *   - KG1 (Vercel five-rule constraint):
 *       1. No self-calls — the route makes no endpoint-to-endpoint calls.
 *       2. Await all DB reads — the Supabase read inside
 *          lookupAccreditationRecord is awaited; an error throws (caught here
 *          and mapped to 503) rather than fire-and-forget.
 *       3. Headers strip on redirects — N/A; no redirects.
 *       4. Execution terminates after response — every async path returns a
 *          NextResponse; no background work.
 *       5. process.cwd() — N/A; no file-based loaders.
 *   - KG7 (JSONB storage format) — engaged on the read path through
 *     rowToAccreditationRecord (Array.isArray guard on passions_persisting).
 *     This route does not write; KG7 write-side protections do not apply.
 *   - PR1 — single-endpoint proof: this is the single new public route this
 *     session. The batch endpoint (handleBatchLookup) is intentionally NOT
 *     wired — deferred to a follow-on session per PR7.
 *   - PR2 — invocation testing: the test file
 *     /website/src/app/api/accreditation/[agent_id]/__tests__/route.test.ts
 *     invokes buildAccreditationResponse (the pure mapping function factored
 *     below) with all four AccreditationEndpointResponse variants, asserting
 *     status codes, headers, and body shape. The end-to-end Supabase round-trip
 *     is verified by the founder's post-deploy URL check (Critical Change
 *     Protocol step 5).
 *   - PR4 — model selection: N/A (no LLM call).
 *   - PR6 — safety-critical: NOT engaged. The route does not touch the R20a
 *     distress classifier, Zone 2 / Zone 3 logic, or their wrappers.
 *   - PR10 — Plan → Execute → Verify: this session's Step 2 design-decision
 *     gate was the Plan step; this file is the Execute step; the test +
 *     regressions + founder post-deploy URL check are the Verify step.
 *   - PR15 — Anthropic-native posture: mcp-builder is a forward pointer for
 *     R18c interoperability (the verification surface could later also be
 *     exposed as an MCP server), but the spec's named surface for 6b is the
 *     Next.js route, and no Anthropic primitive substitutes for it. Bespoke
 *     election justified.
 */

import { NextRequest, NextResponse } from 'next/server'

import { checkRateLimit, RATE_LIMITS } from '@/lib/security'

import {
  handleAccreditationLookup,
  ACCREDITATION_RESPONSE_HEADERS,
  type AccreditationEndpointResponse,
} from '@/lib/substrate/trust-layer/accreditation/public-endpoint'

import {
  isValidAgentId,
  isExpired,
} from '@/lib/substrate/trust-layer/accreditation/accreditation-record'

import {
  buildAccreditationCard,
  serializeCard,
} from '@/lib/substrate/trust-layer/card/accreditation-card'

import { lookupAccreditationRecord } from '@/lib/substrate/atl-accreditation-store'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * The R18b documentation link injected into every response body.
 *
 * /limitations is the R19c/R19d page describing what SageReasoning can and
 * cannot do — the documented place for what the badge measures, how, and its
 * limitations. Lives at /website/src/app/limitations/page.tsx.
 *
 * Absolute URL (rather than env-var-derived) because an external verifier
 * reading the JSON needs a URL it can click; relative URLs don't resolve out
 * of the API consumer's context.
 */
const DOCUMENTATION_URL = 'https://sagereasoning.com/limitations'

// ============================================================================
// PURE RESPONSE BUILDERS (testable without a Supabase round-trip)
// ============================================================================

/**
 * Build the payload-format NextResponse from a discriminated
 * AccreditationEndpointResponse. Pure — no I/O.
 *
 * THIS IS THE TESTABLE SEAM. The route's GET handler does the orchestration
 * (rate-limit → params → handleAccreditationLookup). This function does the
 * status → HTTP mapping + header attachment + documentation_url injection.
 * The test file invokes this function directly with hand-constructed
 * AccreditationEndpointResponse values, asserting status codes, headers, and
 * body shape across all four discriminated variants — no Supabase round-trip
 * required (PR2).
 */
export function buildAccreditationResponse(
  result: AccreditationEndpointResponse
): NextResponse {
  const httpStatus = httpStatusFor(result.status)

  // Body: spread the discriminated AccreditationEndpointResponse + inject
  // documentation_url as a sibling. The wire shape stays the union shape;
  // verifiers can switch on `status` exactly as the handler intended.
  const body = {
    ...result,
    documentation_url: DOCUMENTATION_URL,
  }

  return NextResponse.json(body, {
    status: httpStatus,
    headers: ACCREDITATION_RESPONSE_HEADERS,
  })
}

/**
 * Build the card-format NextResponse. The card path bypasses
 * handleAccreditationLookup (which produces a payload, not a card); the route
 * does the equivalent validation + expiry check inline and builds the card
 * directly. Pure — no I/O; takes the already-looked-up record.
 *
 * If `expired` is true, the response shape mirrors handleAccreditationLookup's
 * 'expired' variant (status 'expired' + a message + the data) so verifiers can
 * branch on the same discriminator regardless of format.
 */
export function buildCardResponse(
  record: import('@/lib/substrate/trust-layer/types/accreditation').AccreditationRecord,
  expired: boolean
): NextResponse {
  const card = buildAccreditationCard(record)
  const data = serializeCard(card)

  const body = expired
    ? {
        status: 'expired' as const,
        message:
          'This accreditation has expired and requires re-evaluation. ' +
          'The last known card is included for reference.',
        data,
        documentation_url: DOCUMENTATION_URL,
      }
    : {
        status: 'ok' as const,
        data,
        documentation_url: DOCUMENTATION_URL,
      }

  return NextResponse.json(body, {
    status: 200,
    headers: ACCREDITATION_RESPONSE_HEADERS,
  })
}

/**
 * Build a 503 service-temporarily-unavailable response. Used when the
 * Supabase read throws. The message is intentionally vague to avoid leaking
 * internal details; the failure is NOT cached so operators can fix and retry.
 * Mirrors the /api/public-key fail-closed posture.
 */
export function buildServerErrorResponse(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message:
        'The accreditation service is temporarily unavailable. ' +
        'Please try again shortly.',
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 503,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        // Don't cache failures — operators must be able to fix the underlying
        // issue and see the next request succeed.
        'Cache-Control': 'no-store',
      },
    }
  )
}

/**
 * Map an AccreditationEndpointResponse.status to its HTTP code.
 * Pure; trivial; extracted so the mapping is a single source of truth.
 */
function httpStatusFor(status: AccreditationEndpointResponse['status']): number {
  switch (status) {
    case 'ok':
      return 200
    case 'not_found':
      return 404
    case 'expired':
      return 200 // carries data; the body's `status` field signals staleness
    case 'error':
      return 400
  }
}

// ============================================================================
// GET — THE PUBLIC VERIFICATION ENDPOINT
// ============================================================================

/**
 * GET /api/accreditation/[agent_id]
 *
 * Query params:
 *   - format=card (optional) — return the displayable AccreditationCard
 *     instead of the AccreditationPayload.
 *
 * Returns the agent's reasoning-pattern credential. See the file header for
 * the full status → HTTP mapping and response body envelope.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> }
): Promise<NextResponse> {
  // Rate limit (30 req/min/IP per RATE_LIMITS.publicAgent) — same posture as
  // /api/badge/[id]. Returns the 429 NextResponse if exceeded.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const { agent_id } = await params
  const format = new URL(request.url).searchParams.get('format')

  try {
    if (format === 'card') {
      // CARD PATH — bypass handleAccreditationLookup (which produces a payload)
      // and build the card from the looked-up record directly. Equivalent
      // validation + expiry semantics applied inline.
      if (!isValidAgentId(agent_id)) {
        return buildAccreditationResponse({
          status: 'error',
          message: 'Invalid agent_id format. Expected: agent_{org}_{version}',
        })
      }
      const record = await lookupAccreditationRecord(agent_id)
      if (!record) {
        return buildAccreditationResponse({
          status: 'not_found',
          message:
            `No accreditation record found for agent: ${agent_id}. ` +
            'The agent may need to complete onboarding assessment first.',
        })
      }
      return buildCardResponse(record, isExpired(record))
    }

    // DEFAULT PAYLOAD PATH — handleAccreditationLookup orchestrates validation,
    // lookup, expiry detection, and payload construction. The route serves
    // exactly what the handler returns (R4 boundary enforced inside the
    // ported library, not the route).
    const result = await handleAccreditationLookup(
      agent_id,
      lookupAccreditationRecord
    )
    return buildAccreditationResponse(result)
  } catch (err) {
    // Catches the throw from lookupAccreditationRecord on Supabase query
    // error. Maps to 503 with a vague message; the failure is not cached.
    // The error is logged for the operator (not surfaced to the caller).
    console.error('Accreditation lookup error:', err)
    return buildServerErrorResponse()
  }
}

// ============================================================================
// OPTIONS — CORS preflight
// ============================================================================

/**
 * CORS preflight handler. Returns 204 with the same headers as a successful
 * GET — Access-Control-Allow-Origin: *, GET/OPTIONS allowed, the standard
 * Allow-Headers set. The ACCREDITATION_RESPONSE_HEADERS constant carries the
 * cache-control directive; OPTIONS responses don't need a cache directive,
 * but reusing the same constant keeps the surface consistent and avoids drift.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 204,
    headers: ACCREDITATION_RESPONSE_HEADERS,
  })
}

// ============================================================================
// POST / PUT / DELETE / PATCH — 405
// ============================================================================

/**
 * Helper for the four method-not-allowed handlers below. Each method-handler
 * is exported separately (Next.js convention); they delegate here.
 */
function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message: 'Method not allowed. This endpoint accepts GET only.',
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 405,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        Allow: 'GET, OPTIONS',
      },
    }
  )
}

export async function POST(): Promise<NextResponse> {
  return methodNotAllowed()
}

export async function PUT(): Promise<NextResponse> {
  return methodNotAllowed()
}

export async function DELETE(): Promise<NextResponse> {
  return methodNotAllowed()
}

export async function PATCH(): Promise<NextResponse> {
  return methodNotAllowed()
}
