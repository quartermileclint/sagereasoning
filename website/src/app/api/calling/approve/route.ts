/**
 * POST /api/calling/approve — Sage Calling Hard-Gate approval (D-14 / D-5).
 *
 * Built at the Sage Calling build Stage 2 — the Critical public-surface half.
 * This is the EXTERNAL approval entry point that closes the Hard Gate (D-14):
 * the five-specification handoff into the substrate "MUST NOT fire on the agent's
 * say-so". A session paused at the Hard Gate (gate_status='awaiting_approval')
 * stays paused until this route flips it to 'approved' (or 'blocked').
 *
 * APPROVAL AUTHORITY — ADMIN ONLY (founder-elected 2026-05-21).
 * requireAdmin (the existing ADMIN_USER_ID gate, reused — no new env var) means
 * the approver authenticates with an admin Supabase session. The agent holds only
 * an sr_assent_ bearer token and a Supabase admin session is a different, stronger
 * credential it does not possess — so the agent CANNOT self-approve. That is the
 * point of the Hard Gate. A richer per-developer delegated-approval credential is
 * a PR7 follow-on; admin-only is the simplest robust gate for the pre-launch phase
 * ("no current users" — only the founder + test logins exist).
 *
 * ON APPROVE: the five-spec discovered_purpose (D-5) is assembled — DETERMINISTIC
 * STRUCTURAL assembly from the session's response_history (buildDiscoveredPurpose;
 * honest-limitation comment there) — and RETURNED to the developer as the handoff
 * artefact. Sage Calling does NOT itself call Layer 1 (KG1 — no endpoint
 * self-calls); the wrapper threads discovered_purpose into the substrate's Layer 1
 * input (the optional discovered_purpose field, additive since Stage 1; the schema
 * is at version v3 after this session).
 *
 * Risk: Critical (deployment-gated public-adjacent surface that releases the
 * gated handoff). Covered by the same SAGE_CALLING_ENABLED master switch — when
 * the flag is off the main endpoint can't reach a Hard Gate, so no session can be
 * awaiting_approval; this route still requires admin auth regardless.
 */

import { NextRequest, NextResponse } from 'next/server'

import { checkRateLimit, RATE_LIMITS, requireAdmin } from '@/lib/security'
import { getSession, setGateStatus } from '@/lib/sage-calling/session-store'
import { buildDiscoveredPurpose } from '@/lib/sage-calling/calling-service'

import { parseApproveBody } from '../request-helpers'
import {
  buildApproveSuccessResponse,
  buildApproveNotFoundResponse,
  buildApproveConflictResponse,
  buildApproveServerErrorResponse,
  buildCallingBadRequestResponse,
  CALLING_RESPONSE_HEADERS,
} from '../response-builders'

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Rate limit (admin posture).
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimitError) return rateLimitError

  // 2. Admin gate — the agent (sr_assent_ bearer only) cannot pass this.
  const admin = await requireAdmin(request)
  if (admin.error) return admin.error

  // 3. Body.
  let rawBody: unknown = null
  try {
    rawBody = await request.json()
  } catch {
    return buildCallingBadRequestResponse('Request body is not valid JSON.')
  }
  const parsed = parseApproveBody(rawBody)
  if (!parsed.ok) return buildCallingBadRequestResponse(parsed.message)
  const { session_id, decision } = parsed.value

  try {
    const existingResult = await getSession(session_id)
    if (!existingResult.ok) return buildApproveServerErrorResponse()
    const existing = existingResult.value
    if (existing === null) return buildApproveNotFoundResponse()

    // Only a session paused at the Hard Gate can be approved or blocked.
    if (existing.gate_status !== 'awaiting_approval') {
      return buildApproveConflictResponse(existing.gate_status)
    }

    if (decision === 'block') {
      const set = await setGateStatus(session_id, 'blocked')
      if (!set.ok) return buildApproveServerErrorResponse()
      return buildApproveSuccessResponse(session_id, 'block')
    }

    // decision === 'approve' — flip the gate, THEN build + return the handoff.
    const set = await setGateStatus(session_id, 'approved')
    if (!set.ok) return buildApproveServerErrorResponse()

    // D-5 five-spec assembly — built ONLY here, on the approved path. The
    // chosen-role hint from a verified Agent Card is logged at session time but
    // not persisted (no column; no migration this stage), so role defaults to
    // the agent's individual operational nature here. PR7 follow-on: persist the
    // verdict to carry the chosen-role hint into this assembly.
    const discoveredPurpose = buildDiscoveredPurpose(existing.response_history, null)

    return buildApproveSuccessResponse(session_id, 'approve', discoveredPurpose)
  } catch (err) {
    console.error('[api/calling/approve] unexpected error:', err)
    return buildApproveServerErrorResponse()
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: CALLING_RESPONSE_HEADERS })
}

function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed. This endpoint accepts POST and OPTIONS.' },
    { status: 405, headers: { ...CALLING_RESPONSE_HEADERS, Allow: 'POST, OPTIONS' } },
  )
}

export async function GET(): Promise<NextResponse> {
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
