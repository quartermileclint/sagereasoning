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
 *   - /adopted/substrate-modes/sage-assent-wrapper-spec.md §"Component 3"
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
// Mechanism-correction M5 (CI-13, 2026-06-13): the reflect-at-close practice
// hint on the accreditation-write success response. Flag-gated; absent when off
// (byte-identical). See src/lib/practice-cycle-hint.ts.
import { practiceCycleHintField } from '@/lib/practice-cycle-hint'
// Practice reminders A1 (2026-07-28): the optional practice suggestion, composed
// by the route from the AE-2 loop fold. Flag-gated at the composer's own seam
// helper; undefined here (the flag-unset default) ⇒ the `practice` field is the
// byte-identical CI-13 shape. See src/lib/substrate/practice-suggestion.ts.
import type { PracticeSuggestion } from '@/lib/substrate/practice-suggestion'

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

// ============================================================================
// WRITE-PATH RESPONSE BUILDERS — added 2026-05-16 under D-ATL-WRITE-PATH-
// BUILD-WIRED-VERIFIED-2026-05-16 (Decision A's route half + Decision C's
// auth gate). The POST handler at /api/accreditation/[agent_id] uses these
// to map seedAccreditation / updateAccreditation outcomes to HTTP status
// codes. Each response carries the documentation_url + ACCREDITATION_RESPONSE_-
// HEADERS by the same discipline as the GET-path builders above.
//
// All write-path failure messages are intentionally vague (Decision C's
// non-leaking posture) — internal details about Supabase state, the
// feature-flag state, or the body's validation failure stay in the server
// logs, not the response body.
// ============================================================================

/**
 * 200 ok — the write succeeded. Body carries no payload (the write returns
 * void from the library); the verifier confirms via a subsequent GET if it
 * needs the persisted shape.
 *
 * CI-4 (2026-06-13): when the loop-closure gate is ENABLED (flag mode), the
 * route passes its analysis and the body gains a `loop_closure` block naming
 * the chain's closure verdict. Omitted (the flags-unset default) → the body
 * is BYTE-IDENTICAL to the pre-gate shape.
 *
 * AE-2 (2026-07-18): when SUBSTRATE_LOOP_FOLD_ENABLED is on, the route passes
 * the computed loop-fold block and the body gains a `loop_fold` field
 * (MEASURE-only annotation — see trust-core/loop-fold.ts). Omitted (the
 * flag-unset default) → byte-identical to the pre-AE-2 shape.
 */
export function buildWriteSuccessResponse(
  loopClosure?: {
    verdict: string
    redirections: number
    closed: number
    open: number
    indeterminate: number
  },
  loopFold?: object,
  suggestion?: PracticeSuggestion,
): NextResponse {
  // M5 CI-13 (2026-06-13): the reflect-at-close practice hint. Absent entirely
  // when SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED is unset (byte-identical to
  // pre-M5).
  //
  // A1 (2026-07-28): when a suggestion composed AND the hint is being served,
  // the practice block gains the `suggestion` member (BD-3 — the suggestion
  // rides only an emitted carrier). With `suggestion` undefined (the A1
  // flag-unset default, and also whenever no basis fired — B7's protected
  // silence) the field spreads EXACTLY as before: byte-identical.
  const practiceField = practiceCycleHintField()
  return NextResponse.json(
    {
      status: 'ok',
      documentation_url: DOCUMENTATION_URL,
      ...(loopClosure !== undefined ? { loop_closure: loopClosure } : {}),
      ...(loopFold !== undefined ? { loop_fold: loopFold } : {}),
      ...(practiceField.practice !== undefined && suggestion !== undefined
        ? { practice: { ...practiceField.practice, suggestion } }
        : practiceField),
    },
    {
      status: 200,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        // Don't cache the write response — even a 200 should be re-checked
        // on the next call. Writes are mutating; GET responses can stay
        // cached at 5 min per their own discipline.
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 422 unprocessable — the loop-closure gate (REJECT mode) refused an
 * unclosed assessment chain (CI-4, 2026-06-13). Distinct from 403
 * no_examination (R18f — "was there an examination?"): here the examinations
 * are genuine but the loop they attest is not closed ("did the corrected
 * reasoning get re-examined at the same depth?"). The message tells the
 * caller exactly how to close it; the analysis block quantifies what is open.
 *
 * DISAMBIGUATION (shares HTTP 422 with buildWriteBadProvenanceResponse): the
 * body's `error` field is the discriminator — `'loop_unclosed'` here vs
 * `'bad_provenance'` there. A client routing on status code alone must read
 * `error` to tell the two 422s apart; both also carry `status: 'error'`. The
 * field name `error` is used here (not `reason`) deliberately, to match the
 * pre-existing 422's discriminator key (bad_provenance) — one convention.
 */
export function buildWriteLoopUnclosedResponse(
  message: string,
  loopClosure: {
    verdict: string
    redirections: number
    closed: number
    open: number
    indeterminate: number
  },
): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      error: 'loop_unclosed',
      message,
      loop_closure: loopClosure,
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 422,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 503 service-temporarily-unavailable — the write-path feature flag is
 * unset. Pre-A10 stopgap per Decision C's option (1). The message names
 * the inert state without leaking what env var controls it.
 */
export function buildWriteDisabledResponse(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message:
        'The accreditation write surface is not yet enabled. ' +
        'Please try again later.',
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 503,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 401 unauthorized — the auth gate rejected the request. Non-leaking
 * message per Decision C's structural constraint (the kathekon close's
 * "Unauthorized." pattern). Pre-A10 stopgap option (1) does not return this
 * variant; it is the call site A10 (step 8) will fill.
 */
export function buildWriteUnauthorizedResponse(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message: 'Unauthorized.',
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 401,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 400 bad-request — body validation failed (missing kind, malformed
 * profile, etc.). Message names the specific failure so the caller can
 * correct it; the validation surface is the client's, not the server's
 * internals.
 */
export function buildWriteBadRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message,
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 400,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 404 not-found — an 'update' call was made against an agent_id that has
 * no existing row. The persistence layer's upsertAccreditationRecord would
 * silently insert (matching idempotent semantics), but the route's
 * pre-flight lookup catches the mismatch so the caller knows to use 'seed'
 * for the first write.
 */
export function buildWriteNotFoundResponse(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message:
        "No accreditation record exists for this agent_id. " +
        "Use kind: 'seed' for the first write.",
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 404,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 409 conflict — a 'seed' call was made against an agent_id that already
 * has a row. The persistence layer's upsert with onConflict: 'agent_id'
 * would update in place (matching idempotent semantics), but the route's
 * pre-flight lookup catches the mismatch so the caller knows to use
 * 'update' for subsequent writes.
 */
export function buildWriteConflictResponse(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message:
        "An accreditation record already exists for this agent_id. " +
        "Use kind: 'update' for subsequent writes.",
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 409,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

// ============================================================================
// PROVENANCE-GATE RESPONSE BUILDERS — added under the R18f enforcement build
// (option (a) — server-side Ed25519 provenance verification at the write
// boundary). The POST handler calls these when the provenance gate
// (SUBSTRATE_PROVENANCE_GATE_ENABLED) is ON and the write fails to demonstrate
// a genuine SageReasoning examination.
//
// DISTINCT FROM 401. The 401 buildWriteUnauthorizedResponse means "no
// permission" (the A10 ownership gate). 403 no_examination means "permitted to
// write, but no examination was demonstrated" — the audit log separates the two
// by status code + the body's `error` discriminator, per the ADR §"Where the
// gate is".
// ============================================================================

/**
 * 403 no_examination — the gate is enabled and the caller has a valid write
 * credential (A10 passed), but the write carried no signed substrate provenance
 * that verifies against the published key. Combination 1 (Sage Assent without
 * SageReasoning) is rejected here. Non-leaking, fixed message.
 */
export function buildWriteNoExaminationResponse(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      error: 'no_examination',
      message:
        'This credential write did not demonstrate a SageReasoning ' +
        'examination. A Sage Assent credential requires signed substrate ' +
        'output (R18f).',
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 403,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}

/**
 * 422 unprocessable-entity — the gate is enabled and the body is valid JSON of
 * the right top-level shape, but the `provenance` block is missing or malformed
 * (wrong shape, empty, non-array, element missing fields). The message names
 * the specific shape failure so a caller can correct the request — distinct
 * from 403 (well-formed provenance that simply did not verify).
 */
export function buildWriteBadProvenanceResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      error: 'bad_provenance',
      message,
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 422,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        'Cache-Control': 'no-store',
      },
    },
  )
}
