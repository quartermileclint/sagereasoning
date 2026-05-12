import { NextRequest, NextResponse } from 'next/server'
import { corsHeaders, corsPreflightResponse } from '@/lib/security'
import {
  generateLayer3Response,
  isSubstrateLayer3Enabled,
  type Layer3ServiceInput,
  type ConsumerContext,
  type ProseMode,
} from '@/lib/substrate/layer3-service'
import type { Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'

// =============================================================================
// POST /api/substrate/layer3 — A5 Layer 3 substrate-service endpoint.
//
// STATUS: Scaffolded (2026-05-12). Reaches Verified in this session after
// invocation testing. Wired-to-production (with traffic) depends on:
//   - A7 (server-side R20a gate) Verified
//   - A10 (per-agent credentials) Verified (auth surface for plugin-originated
//     traffic)
//   - Stage 3 plugin-originated traffic ready to consume the substrate
//
// Today: this endpoint exists but is gated behind SUBSTRATE_LAYER3_ENABLED
// (default OFF). The /api/reason single-endpoint proof at Step 3 of this
// session validates the A5 library; this route is the public substrate-API
// surface for future plugin-originated traffic.
//
// GOVERNING DOCUMENTS:
//   /adopted/substrate-plugin-staging-plan.md §Stage 1 A5
//   /manifest.md §R3, R18a, R18e, R19, R20a, AC4, AC5, AC7, AC8, AC9, AC10, AC11
//   /website/src/lib/substrate/layer3-service.ts (the underlying service)
//
// RISK CLASSIFICATION: **Critical** under 0d-ii. PR6 engaged (R20a deterministic
// injection is safety-critical). AC7 engaged in spirit (new public surface;
// auth posture below). AC5 perimeter NOT engaged on THIS surface (Layer 3
// service operates on Layer 2 output; the R20a perimeter is enforced at
// Layer 2's gate by A7 — when A7 wires, this surface inherits its protection).
//
// AUTH POSTURE (AC7):
//   - Scaffolding session: endpoint is flag-gated. When flag is OFF,
//     returns 503. No production traffic possible.
//   - Stage 3 wiring: per-agent credentials (A10) extend the existing
//     dual-auth pattern (KG4) to this surface. The auth pattern is the
//     same as /api/reason's plugin-auth path.
//
// PR1 SINGLE-ENDPOINT PROOF: /api/reason is the proof endpoint for A5;
// this route is the substrate-API surface used at Stage 3, NOT a competing
// proof point. A5's Verified status is reached on /api/reason first.
// =============================================================================

interface SubstrateLayer3RequestBody {
  assessment: Layer2Assessment
  consumer_context: ConsumerContext
  prose_mode?: ProseMode
  max_tokens?: number
  temperature?: number
}

function isValidRequestBody(body: unknown): body is SubstrateLayer3RequestBody {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  if (typeof b.assessment !== 'object' || b.assessment === null) return false
  if (typeof b.consumer_context !== 'object' || b.consumer_context === null) return false
  const cc = b.consumer_context as Record<string, unknown>
  if (typeof cc.consumer !== 'string') return false
  // Optional fields (prose_mode, max_tokens, temperature) accepted as undefined
  // or as their typed values; deeper validation happens inside layer3-service.
  return true
}

// -----------------------------------------------------------------------------
// CORS preflight
// -----------------------------------------------------------------------------

export async function OPTIONS(): Promise<NextResponse> {
  return corsPreflightResponse()
}

// -----------------------------------------------------------------------------
// POST handler
// -----------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Flag gate. Until A7 + A10 wire and the flag is flipped ON in production,
  // this endpoint is unavailable. The 503 response is the explicit signal.
  if (!isSubstrateLayer3Enabled()) {
    return NextResponse.json(
      {
        error: 'substrate_layer3_disabled',
        detail:
          'The substrate Layer 3 service is not enabled on this deployment. ' +
          'This endpoint becomes available once the SUBSTRATE_LAYER3_ENABLED ' +
          'flag is flipped (gated on A7 server-side R20a gate + A10 per-agent ' +
          'credentials reaching Verified).',
      },
      { status: 503, headers: corsHeaders() }
    )
  }

  // Parse + validate request body.
  let body: unknown
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json(
      {
        error: 'invalid_json',
        detail: 'Request body could not be parsed as JSON.',
      },
      { status: 400, headers: corsHeaders() }
    )
  }

  if (!isValidRequestBody(body)) {
    return NextResponse.json(
      {
        error: 'invalid_request_shape',
        detail:
          'Request body must contain { assessment: Layer2Assessment, ' +
          'consumer_context: { consumer: string, ... }, ... }. See ' +
          '/website/src/lib/substrate/layer3-service.ts for the full input shape.',
      },
      { status: 400, headers: corsHeaders() }
    )
  }

  // Construct input and call the service.
  const input: Layer3ServiceInput = {
    assessment: body.assessment,
    consumer_context: body.consumer_context,
    prose_mode: body.prose_mode,
    max_tokens: body.max_tokens,
    temperature: body.temperature,
  }

  try {
    const response = await generateLayer3Response(input)
    return NextResponse.json(response, { status: 200, headers: corsHeaders() })
  } catch (err) {
    console.error('[/api/substrate/layer3] Layer 3 service threw:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json(
      {
        error: 'substrate_layer3_error',
        detail: message,
      },
      { status: 500, headers: corsHeaders() }
    )
  }
}
