/**
 * /api/accreditation/[agent_id] — Public Verification Endpoint (ATL Wrapper
 * Component 3 — the badge / accreditation, public face).
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-16, step 6b; POST handler +
 * auth gate added 2026-05-16 under the write-path build — D-ATL-WRITE-PATH-
 * BUILD-WIRED-VERIFIED-2026-05-16).
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/agent-trust-layer-wrapper-spec.md §"Component 3"
 *     (the spec, Adopted 2026-05-14). This is the named public surface — the
 *     verifiable credential third parties query.
 *   - /adopted/atl-write-path-design.md — the write-path design (Adopted
 *     2026-05-16 under D-ATL-WRITE-PATH-DESIGN-LOCKED-2026-05-16). Decision A
 *     names the POST handler at this route group; Decision C names the auth
 *     gate (pre-A10 stopgap option (1) — feature-flag gated via
 *     SUBSTRATE_WRITE_PATH_ENABLED env var).
 *   - /operations/decision-log.md —
 *       D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16
 *       (this build's write-path additions — POST handler + auth gate; the
 *       seven Critical Change Protocol responses recorded there)
 *       D-ATL-PUBLIC-ACCREDITATION-ENDPOINT-WIRED-VERIFIED-2026-05-16
 *       (the predecessor GET-only build; this session's POST handler
 *       coexists with the GET-handler that build wired)
 *       D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-VERIFIED-2026-05-15
 *       (predecessor — the 6a persistence layer this route's GET + POST
 *       consume)
 *   - /manifest.md §R3 (disclaimer) / §R4 (IP boundary) / §R9 (does not promise
 *     outcomes) / §R17 (auth gate engaged on POST — see Compliance below) /
 *     §R18 a–e (the badge certifies the carried profile) / §AC5
 *     (R20a perimeter — NOT engaged: no distress surface) / §AC7 (ENGAGED on
 *     POST — new auth surface; full Critical Change Protocol applied at the
 *     write-path build session) / §AC8 (translation-sandwich substrate) /
 *     §KG1 (Vercel five-rule constraint).
 *
 * WHAT THIS ROUTE IS
 *
 * The public read AND write endpoint for the ATL badge.
 *
 * READ — GET https://sagereasoning.com/api/accreditation/{agent_id}
 *   A verifier — a person, an agent, an auditor — receives that wrapped
 *   agent's reasoning-pattern credential as JSON. The credential is the
 *   R4-compliant AccreditationPayload (Senecan grade, typical proximity,
 *   authority level, the four dimension levels, direction of travel,
 *   persisting passions, evaluation window, timestamps, verification URL,
 *   disclaimer). Optionally `?format=card` returns the richer displayable
 *   AccreditationCard.
 *
 * WRITE — POST https://sagereasoning.com/api/accreditation/{agent_id}
 *   A wrapper consumer — orchestrator, dashboard, external agent platform,
 *   CI integration — populates or updates an agent's accreditation row. The
 *   POST handler validates the body, runs the auth gate (pre-A10 stopgap:
 *   feature-flag gated via SUBSTRATE_WRITE_PATH_ENABLED), does a pre-flight
 *   lookup to disambiguate seed vs update vs conflict, then invokes the
 *   atl-accreditation-writer library's seedAccreditation or
 *   updateAccreditation. Outcomes map to 200 / 401 / 400 / 404 / 409 / 503
 *   per the design's Decision A response envelope. The library writes the
 *   row via the persistence layer's existing upsertAccreditationRecord +
 *   appendGradeHistory / appendInitialGradeHistory.
 *
 *   Pre-A10 default state: SUBSTRATE_WRITE_PATH_ENABLED is UNSET in Vercel,
 *   so every POST returns 503 "writes not yet enabled" — the route is inert
 *   until the founder flips the flag. Setting the flag accepts writes from
 *   anywhere (per Decision C option (1)'s coarse-grained gate); A10 (step 8)
 *   replaces this with per-agent token verification.
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
 *   - R17 (auth — engaged on POST only): the POST handler's auth gate is
 *     the primary R17 engagement on this route. Pre-A10 stopgap option (1) —
 *     feature-flag gated. The gate's signature (verifyAgentIdOwnership) is
 *     A10-shaped: post-A10 (step 8), the body swaps to per-agent token
 *     verification without changing the call site. The GET handler remains
 *     auth-free (public read endpoint per spec).
 *   - AC7 (auth/session/cookie/redirect — engaged on POST): the POST handler
 *     introduces a new auth surface (feature-flag gated pre-A10; per-agent
 *     token verification post-A10). The full Critical Change Protocol was
 *     applied at the write-path build session. GET remains AC7-untouched.
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
} from '@/lib/substrate/trust-layer/accreditation/public-endpoint'

import {
  isValidAgentId,
  isExpired,
} from '@/lib/substrate/trust-layer/accreditation/accreditation-record'

import { lookupAccreditationRecord } from '@/lib/substrate/atl-accreditation-store'

import {
  seedAccreditation,
  updateAccreditation,
} from '@/lib/substrate/atl-accreditation-writer'

import type { CarriedProfile } from '@/lib/substrate/atl-wrapper'
import type { TransitionResult } from '@/lib/substrate/atl-wrapper'

import {
  buildAccreditationResponse,
  buildCardResponse,
  buildServerErrorResponse,
  buildWriteSuccessResponse,
  buildWriteDisabledResponse,
  buildWriteUnauthorizedResponse,
  buildWriteBadRequestResponse,
  buildWriteNotFoundResponse,
  buildWriteConflictResponse,
  DOCUMENTATION_URL,
} from './response-builders'

// =============================================================================
// HOTFIX NOTE 2026-05-16 — Next.js App Router rejected the original co-located
// helpers ("buildAccreditationResponse is not a valid Route export field").
// route.ts may only export HTTP method handlers and route-segment config; the
// pure response-builders moved to ./response-builders.ts. No behaviour change.
// See response-builders.ts module header for the full diagnostic.
// =============================================================================

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
// POST — THE WRITE-PATH HANDLER (D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-2026-05-16)
// ============================================================================

/**
 * Auth-gate result — discriminated. The route maps `not_enabled` to 503 (the
 * stopgap's inert state) and `unauthorized` to 401 (the future A10 token
 * failure). `ok` lets the request proceed; `claims.agent_id` is the verified
 * subject the request is authorised to write.
 *
 * Defined inline (rather than in security.ts) because the gate's pre-A10
 * stopgap is route-local and the A10 implementation will live alongside the
 * route's other concerns. Promote to security.ts if a second route reuses
 * the gate.
 */
type AuthGateResult =
  | { ok: true; claims: { agent_id: string } }
  | { ok: false; reason: 'not_enabled' | 'unauthorized' }

/**
 * verifyAgentIdOwnership — the auth gate for POST.
 *
 * PRE-A10 STOPGAP (Decision C option (1) — feature-flag gated): the gate
 * reads SUBSTRATE_WRITE_PATH_ENABLED from the environment. If the value is
 * not the exact string "true", the gate returns `not_enabled` → route
 * returns 503 with a non-leaking "writes not yet enabled" message. Any
 * value other than "true" (including the unset state, "false", "0", "")
 * fails closed; the strictest possible truthiness check.
 *
 * When the flag is set to "true", all writes are allowed — the route is
 * open to any caller with a valid agent_id path parameter and a well-formed
 * body. This is the coarse-grained gate Decision C grants pre-A10; A10
 * (step 8) replaces it with per-agent token verification.
 *
 * THE A10-SHAPED SEAM (per Decision C's structural constraint):
 *   - Signature: (request, agent_id) → discriminated result.
 *   - Pre-A10: the request + agent_id parameters are unused; the gate
 *     decision is purely env-driven.
 *   - Post-A10: the function body swaps to read Authorization: Bearer
 *     headers, verify the token against an A10 per-agent credential store,
 *     check the verified subject matches `agent_id`, and return
 *     `unauthorized` on any failure. The call site does not change.
 *
 * The `request` and `_agent_id` parameters are declared but unused under
 * the pre-A10 stopgap; they are part of the seam that A10 fills.
 */
function verifyAgentIdOwnership(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: NextRequest,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _agent_id: string,
): AuthGateResult {
  // PRE-A10: feature-flag gated only. Strictest possible truthiness — only
  // the exact string "true" enables writes; anything else (unset, "false",
  // "0", "") fails closed.
  if (process.env.SUBSTRATE_WRITE_PATH_ENABLED !== 'true') {
    return { ok: false, reason: 'not_enabled' }
  }
  // Flag is set — accept the write. A10 will replace this with token
  // verification; the claims object's shape is forward-compatible.
  return { ok: true, claims: { agent_id: _agent_id } }
}

/**
 * The discriminated request-body shape the POST handler accepts. Validated
 * inline below; consumers may submit additional fields, which are ignored.
 */
type WriteRequestBody =
  | { kind: 'seed'; profile: CarriedProfile }
  | {
      kind: 'update'
      profile: CarriedProfile
      transition_result: TransitionResult
    }

/**
 * Pure body-shape validator. Returns the typed body or an error message
 * (non-leaking). Validates only the structural shape needed to dispatch to
 * the library; deep validation of CarriedProfile internals is deferred
 * (the library + persistence layer will throw on a malformed shape, which
 * the route catches and maps to 503 — but the explicit 400 here avoids
 * round-tripping the throw for obvious shape errors).
 */
function validateWriteBody(
  raw: unknown,
): { ok: true; body: WriteRequestBody } | { ok: false; message: string } {
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, message: 'Request body must be a JSON object.' }
  }
  const obj = raw as Record<string, unknown>

  if (obj.kind !== 'seed' && obj.kind !== 'update') {
    return {
      ok: false,
      message: "Body field 'kind' must be 'seed' or 'update'.",
    }
  }

  if (typeof obj.profile !== 'object' || obj.profile === null) {
    return {
      ok: false,
      message: "Body field 'profile' must be a CarriedProfile object.",
    }
  }

  // Minimal shape check on the CarriedProfile — we look for the fields the
  // library reads directly (agent_id, accreditation_record, regressing_check_-
  // count). Deeper validation is the library + persistence layer's job.
  const profile = obj.profile as Record<string, unknown>
  if (typeof profile.agent_id !== 'string' || profile.agent_id.length === 0) {
    return {
      ok: false,
      message: "Body field 'profile.agent_id' must be a non-empty string.",
    }
  }
  if (
    typeof profile.accreditation_record !== 'object' ||
    profile.accreditation_record === null
  ) {
    return {
      ok: false,
      message:
        "Body field 'profile.accreditation_record' must be an object.",
    }
  }
  if (typeof profile.regressing_check_count !== 'number') {
    return {
      ok: false,
      message:
        "Body field 'profile.regressing_check_count' must be a number.",
    }
  }

  if (obj.kind === 'update') {
    if (
      typeof obj.transition_result !== 'object' ||
      obj.transition_result === null
    ) {
      return {
        ok: false,
        message:
          "Body field 'transition_result' is required when kind is 'update'.",
      }
    }
    const tr = obj.transition_result as Record<string, unknown>
    if (typeof tr.grade_changed !== 'boolean') {
      return {
        ok: false,
        message:
          "Body field 'transition_result.grade_changed' must be a boolean.",
      }
    }
    if (typeof tr.record !== 'object' || tr.record === null) {
      return {
        ok: false,
        message: "Body field 'transition_result.record' must be an object.",
      }
    }
    return {
      ok: true,
      body: {
        kind: 'update',
        profile: obj.profile as unknown as CarriedProfile,
        transition_result: obj.transition_result as unknown as TransitionResult,
      },
    }
  }

  return {
    ok: true,
    body: {
      kind: 'seed',
      profile: obj.profile as unknown as CarriedProfile,
    },
  }
}

/**
 * POST /api/accreditation/[agent_id]
 *
 * Request body (JSON):
 *   { kind: 'seed', profile: <CarriedProfile> }
 *   { kind: 'update', profile: <CarriedProfile>, transition_result: <TransitionResult> }
 *
 * Outcomes:
 *   200 — write succeeded
 *   400 — invalid body
 *   401 — auth gate rejected the request (A10-shaped reason)
 *   404 — kind='update' against non-existent row
 *   409 — kind='seed' against existing row
 *   503 — write surface not enabled (pre-A10 stopgap) OR Supabase error
 *
 * The handler:
 *   1. Rate-limit (mirrors the GET's 30 req/min/IP — same RATE_LIMITS.publicAgent).
 *   2. Auth-gate check (verifyAgentIdOwnership; pre-A10: env-flag).
 *   3. Body parse + validate (validateWriteBody).
 *   4. Pre-flight lookup to disambiguate seed/update against the row's existence.
 *   5. Invoke seedAccreditation or updateAccreditation from the writer library.
 *   6. Map outcomes to HTTP status codes.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> },
): Promise<NextResponse> {
  // 1. Rate limit — same posture as GET (30 req/min/IP).
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const { agent_id } = await params

  // 2. Auth gate (pre-A10: feature-flag gated).
  const auth = verifyAgentIdOwnership(request, agent_id)
  if (!auth.ok) {
    if (auth.reason === 'not_enabled') return buildWriteDisabledResponse()
    return buildWriteUnauthorizedResponse()
  }

  // 3. Body parse + validate.
  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return buildWriteBadRequestResponse(
      'Request body is not valid JSON.',
    )
  }

  const validated = validateWriteBody(rawBody)
  if (!validated.ok) {
    return buildWriteBadRequestResponse(validated.message)
  }

  // Ensure the body's profile.agent_id matches the path param — the path
  // is the authority on which row is being written; a mismatch is a client
  // error.
  if (validated.body.profile.agent_id !== agent_id) {
    return buildWriteBadRequestResponse(
      "Body field 'profile.agent_id' must match the URL path's agent_id.",
    )
  }

  // 4. Pre-flight lookup — disambiguates seed vs update vs conflict.
  try {
    const existing = await lookupAccreditationRecord(agent_id)

    if (validated.body.kind === 'seed' && existing !== null) {
      return buildWriteConflictResponse()
    }
    if (validated.body.kind === 'update' && existing === null) {
      return buildWriteNotFoundResponse()
    }

    // 5. Invoke the writer library.
    if (validated.body.kind === 'seed') {
      await seedAccreditation(validated.body.profile)
    } else {
      await updateAccreditation(
        validated.body.profile,
        validated.body.transition_result,
      )
    }

    return buildWriteSuccessResponse()
  } catch (err) {
    // Any Supabase failure inside lookupAccreditationRecord or the writer
    // library's persistence-layer calls propagates here. Map to 503 with a
    // non-leaking message; the error is logged for the operator.
    console.error('Accreditation write error:', err)
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
// PUT / DELETE / PATCH — 405
// ============================================================================

/**
 * Helper for the three method-not-allowed handlers below. POST is REMOVED
 * from the 405 set as of 2026-05-16 (D-ATL-WRITE-PATH-BUILD-WIRED-VERIFIED-
 * 2026-05-16) — POST now has a real handler above. Allow header advertises
 * the three accepted methods.
 */
function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    {
      status: 'error',
      message: 'Method not allowed. This endpoint accepts GET, POST, and OPTIONS.',
      documentation_url: DOCUMENTATION_URL,
    },
    {
      status: 405,
      headers: {
        ...ACCREDITATION_RESPONSE_HEADERS,
        Allow: 'GET, POST, OPTIONS',
      },
    }
  )
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
