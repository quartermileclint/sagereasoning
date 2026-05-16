/**
 * response-builders.ts — pure response-builder helpers for the public
 * accreditation verification endpoint.
 *
 * STATUS: Verified (2026-05-16, hotfix appended same-day after Vercel build
 * rejected the originally-route-co-located helpers).
 *
 * WHY THIS FILE EXISTS (Vercel hotfix 2026-05-16):
 *
 * Next.js App Router `route.ts` files only allow a fixed set of named exports
 * — the HTTP method handlers (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
 * and route-segment config (dynamic, dynamicParams, revalidate, fetchCache,
 * runtime, preferredRegion, maxDuration). Anything else fails the Next.js
 * build worker's type check:
 *
 *   "buildAccreditationResponse" is not a valid Route export field.
 *
 * The original 6b build put these helpers inside `route.ts` (so the test
 * could import them and exercise the response-builder seam directly per PR2).
 * `tsc --noEmit` passed but `next build` rejected the extra exports. Fix:
 * move the helpers to this sibling module; `route.ts` imports them; the test
 * imports them from here too. No behaviour change at runtime — the function
 * bodies are identical to the originals.
 *
 * Sibling .ts files inside an `app/` folder are explicitly supported by
 * Next.js — only the route-handler file (`route.ts`) has the restricted
 * export surface.
 *
 * GOVERNING DOCUMENTS:
 *   - /operations/decision-log.md —
 *       D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16
 *       (the original 6b build) + a hotfix note appended to its files-touched
 *       block recording this refactor.
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md §"Component 3"
 *     (the spec; unchanged).
 *
 * COMPLIANCE
 *   - R4 (IP boundary): the helpers serve the AccreditationEndpointResponse
 *     verbatim (`...result` spread) — they do not reach into the record's
 *     internal fields. The R4 boundary is enforced inside the ported library
 *     (buildAccreditationPayload), not here.
 *   - R3 (disclaimer always present), R9 (does not promise outcomes), R18b
 *     (documentation_url injected on every response): all preserved verbatim
 *     from the original.
 *   - KG1 (Vercel five-rule constraint): pure functions, no I/O, no side
 *     effects.
 *   - PR1 / PR2: the testable seam is exactly where it was; only the import
 *     path moves.
 *   - PR10 (Plan → Execute → Verify): the hotfix Plan step is the diagnostic
 *     above; the Execute step is this file + the route-file edit; the Verify
 *     step is tsc + the route test re-run + the founder's repeat post-deploy
 *     URL check.
 */

import { NextResponse } from 'next/server'

import {
  ACCREDITATION_RESPONSE_HEADERS,
  type AccreditationEndpointResponse,
} from '@/lib/substrate/trust-layer/accreditation/public-endpoint'

import {
  buildAccreditationCard,
  serializeCard,
} from '@/lib/substrate/trust-layer/card/accreditation-card'

import type { AccreditationRecord } from '@/lib/substrate/trust-layer/types/accreditation'

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
export const DOCUMENTATION_URL = 'https://sagereasoning.com/limitations'

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
  record: AccreditationRecord,
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
export function httpStatusFor(
  status: AccreditationEndpointResponse['status']
): number {
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
