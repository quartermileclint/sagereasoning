import { NextRequest, NextResponse } from 'next/server'
import {
  checkRateLimit,
  RATE_LIMITS,
  requireAuth,
  corsHeaders,
  corsPreflightResponse,
} from '@/lib/security'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  collectAppendixAnswerText,
  hasScreenableSubject,
  buildMildSupportResources,
} from '@/lib/r20a-gap-closure'
import {
  saveAppendixRound,
  listAppendixRounds,
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

    // ── R20a perimeter (AC5; added 2026-08-18, perimeter completion) ────────
    // Screens the practitioner's `answers` — their written responses to the
    // baseline gap questions — BEFORE any validation, encryption or store
    // write. Flag-off is byte-identical.
    //
    // ⚠ CARRIED, NOT FIXED BY THIS CHANGE: this route has an ordering bypass
    // independent of R20a. A caller posting `refinement: {}` satisfies the only
    // guard on it, so baseline answers can be persisted here without ever
    // calling the gating /api/mentor-baseline-response route. Screening closes
    // the SAFETY hole (distress in those answers is now caught on this path
    // too); the integrity hole stands and is a founder-elected carry.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const subject = composeDistressSubject(collectAppendixAnswerText(body?.answers))
      // PR19 (2026-08-18, CONFIRMED): skip the classifier on an empty subject
      // — an empty/missing `answers` has no distress to detect, and calling it
      // anyway pays for a real billed Haiku call before the 400 below fires.
      if (hasScreenableSubject(subject)) {
        const gate = await enforceDistressCheck(detectDistressTwoStage(subject))
        if (gate.result.distress_detected && gate.result.severity !== 'mild') {
          return NextResponse.json(
            {
              distress_detected: true,
              severity: gate.result.severity,
              redirect_message: gate.result.redirect_message,
            },
            { headers: corsHeaders() }
          )
        }
        if (gate.result.severity === 'mild') {
          mildSupport = buildMildSupportResources('practice')
        }
      }
    }

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
        ...(mildSupport ? { support_resources: mildSupport } : {}),
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

// ── GET — List all rounds for the authenticated user ────────────────
//
// Returns decrypted rounds newest-first. Auth-gated; users can only
// see their own rounds. Intimate payload is inside each round object.
//
// Output: { success, count, rounds: DecryptedAppendixRound[] }
export async function GET(request: NextRequest) {
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

  if (!isServerEncryptionConfigured()) {
    return NextResponse.json(
      {
        error:
          'Server encryption is not configured. Rounds cannot be decrypted for return.',
      },
      { status: 503, headers: corsHeaders() }
    )
  }

  try {
    const rounds = await listAppendixRounds(auth.user.id)
    return NextResponse.json(
      { success: true, count: rounds.length, rounds },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-appendix] List error:', err)
    return NextResponse.json(
      { error: 'Failed to list appendix rounds' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
