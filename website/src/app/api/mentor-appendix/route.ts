import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import {
  saveAppendixRound,
  AppendixPayload,
} from '@/lib/mentor-appendix-store'

// =============================================================================
// mentor-appendix — Server-side persistence of baseline refinement rounds
//
// POST /api/mentor-appendix
//
// Stage 1 (write-only). Takes the output of /api/mentor-baseline-response
// together with the practitioner's raw answers and the original question set,
// encrypts the full payload (R17b), and stores it as an APPENDIX row in
// mentor_baseline_appendix. The mentor_profiles row is NEVER modified here.
//
// Mentor endpoints may, in future (Stage 3), optionally read the latest
// appendix for additional context. Reading is out of scope for Stage 1.
//
// Input body:
//   {
//     submittedAt:   ISO string (required)
//     generatedAt:   ISO string (optional — when the questions were generated)
//     questions:     unknown[]           (required — the 10 baseline questions)
//     answers:       Record<string,str>  (required — { question_id -> answer })
//     refinement:    unknown             (required — full response from
//                                         /api/mentor-baseline-response,
//                                         including meta + result)
//   }
//
// Output: { success, id, appendix_version, encrypted: true }
//
// Classification (0d-ii): Critical — touches encryption and persistent storage
// of intimate practitioner data. Matches the mentor_profiles encryption
// pattern exactly.
// =============================================================================

interface AppendixRequestBody {
  submittedAt?: string
  generatedAt?: string
  questions?: unknown[]
  answers?: Record<string, string>
  refinement?: unknown
}

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  if (!auth.user?.id) {
    return NextResponse.json(
      { error: 'Authenticated user missing id' },
      { status: 401, headers: corsHeaders() }
    )
  }

  // Encryption MUST be configured — refuse to write plaintext (R17b)
  if (!isServerEncryptionConfigured()) {
    console.error(
      '[mentor-appendix] Refusing to save: server encryption not configured'
    )
    return NextResponse.json(
      {
        error:
          'Server encryption is not configured. MENTOR_ENCRYPTION_KEY must be set before appendix rounds can be stored.',
      },
      { status: 503, headers: corsHeaders() }
    )
  }

  try {
    const body = (await request.json()) as AppendixRequestBody

    // ── Validate input ────────────────────────────────────────────
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const { submittedAt, generatedAt, questions, answers, refinement } = body

    if (!submittedAt || typeof submittedAt !== 'string') {
      return NextResponse.json(
        { error: 'submittedAt (ISO string) is required' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'questions must be a non-empty array' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (
      !answers ||
      typeof answers !== 'object' ||
      Array.isArray(answers) ||
      Object.keys(answers).length === 0
    ) {
      return NextResponse.json(
        { error: 'answers must be a non-empty object of question_id -> answer' },
        { status: 400, headers: corsHeaders() }
      )
    }

    if (!refinement || typeof refinement !== 'object') {
      return NextResponse.json(
        { error: 'refinement is required (the full response from /api/mentor-baseline-response)' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // ── Extract non-sensitive metadata from refinement ────────────
    // Best-effort — any missing fields fall back to null/0. The full shape
    // is preserved inside the encrypted payload, so nothing is lost.
    const refAny = refinement as {
      meta?: { ai_model?: string | null }
      result?: {
        reasoning_receipt?: { id?: string | null } | null
        responses_processed?: number
      }
      responses_processed?: number
    }

    const aiModel = refAny?.meta?.ai_model ?? null
    const receiptId = refAny?.result?.reasoning_receipt?.id ?? null

    // responses_processed is authoritative from the refinement response if
    // present; otherwise use the count of answers.
    const responsesProcessed =
      typeof refAny?.result?.responses_processed === 'number'
        ? refAny.result.responses_processed
        : typeof refAny?.responses_processed === 'number'
        ? refAny.responses_processed
        : Object.keys(answers).length

    // ── Build encrypted payload input ─────────────────────────────
    const payload: AppendixPayload = {
      questions,
      answers,
      refinement,
    }

    const saveResult = await saveAppendixRound(auth.user.id, {
      submittedAt,
      generatedAt: generatedAt || undefined,
      responsesProcessed,
      aiModel,
      receiptId,
      payload,
    })

    if (!saveResult.success) {
      console.error('[mentor-appendix] Save failed:', saveResult.error)
      return NextResponse.json(
        { error: saveResult.error || 'Failed to save appendix round' },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      {
        success: true,
        id: saveResult.id,
        appendix_version: saveResult.appendix_version,
        encrypted: true,
        note: 'Round stored as an appendix to the mentor profile. The profile itself was not modified.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-appendix] Error:', err)
    return NextResponse.json(
      { error: 'Failed to save appendix round' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
