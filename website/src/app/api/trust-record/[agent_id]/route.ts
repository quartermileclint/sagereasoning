/**
 * route.ts — Trust Layer S10: GET /api/trust-record/{agent_id}
 *
 * The public trust-record read surface (build plan §S10; ADR-013 §8 is the
 * honest-claims boundary it publishes inside). THIN by the route-export rule
 * (Next.js rejects non-handler exports at build): rate-limit → delegate to
 * handler.ts. All composition, dark-gating, and status mapping live there.
 *
 * Public + unauthenticated (founder election E1, 2026-07-12 — the
 * accreditation-GET posture); RATE_LIMITS.publicAgent (30 req/min/IP).
 * DARK until the founder-walked activation: SUBSTRATE_TRUST_READ_SURFACE_ENABLED
 * unset ⇒ honest 503, zero DB work.
 *
 * R20a / AC5 (recorded decision — the S10 re-check): agent-facing READ surface;
 * the only input is the agent_id path segment (no free-text human submission),
 * so it sits OUTSIDE the human-distress perimeter — see handler.ts header and
 * the S10 R18 sign-off memo. AC5 untouched.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runTrustRecordGet, TRUST_RECORD_RESPONSE_HEADERS } from './handler'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> },
): Promise<NextResponse> {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimitError) return rateLimitError

  const { agent_id } = await params
  return runTrustRecordGet(agent_id)
}

export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: TRUST_RECORD_RESPONSE_HEADERS })
}

function methodNotAllowed(): NextResponse {
  return NextResponse.json(
    { status: 'error', message: 'Method not allowed. This surface is read-only (GET).' },
    { status: 405, headers: TRUST_RECORD_RESPONSE_HEADERS },
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
