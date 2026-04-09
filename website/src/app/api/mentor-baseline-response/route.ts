import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason } from '@/lib/sage-reason-engine'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'
import mentorProfileRaw from '@/data/mentor-profile.json'

// =============================================================================
// mentor-baseline-response — Process practitioner's answers to gap questions
//
// POST /api/mentor-baseline-response
//
// After the practitioner answers the baseline gap detection questions generated
// by /api/mentor-baseline, this endpoint:
//   1. Takes their answers alongside the original questions and current profile
//   2. Feeds everything through sage-reason to analyse what the answers reveal
//   3. Returns a refined MentorProfile with gaps filled, edge cases resolved,
//      and confirmations noted
//
// Input: { responses: [{ question_id, question_text, answer }] }
// Output: { refined_profile, refinement_notes, confidence_changes }
//
// R1:  Philosophical exercise, not therapy
// R6d: Diagnostic, not punitive — answers open understanding, not judgment
// R7:  Analysis traces to Stoic Brain source files
// =============================================================================

const mentorProfile = mentorProfileRaw as MentorProfileData

const REFINEMENT_SYSTEM_PROMPT = `You are the Sage Mentor's profile refinement engine for SageReasoning.

You have three inputs:
1. The practitioner's current MentorProfile (extracted from their Stoic journal)
2. The baseline gap detection questions that were generated for them
3. Their answers to those questions

Your task: analyse their answers and produce a REFINED MentorProfile. Specifically:

CONFIRMATION ANSWERS:
- If the answer confirms the extraction finding: note "confirmed" and increase confidence
- If the answer contradicts the extraction: flag the discrepancy, adjust the profile dimension, explain what changed and why

EDGE CASE ANSWERS:
- Resolve the ambiguity based on their answer
- Update the relevant passion, virtue, or causal tendency accordingly
- Note whether the resolution strengthens or weakens the original finding

GAP FILL ANSWERS:
- Add the new data to the thin dimension
- Update observation counts and evidence summaries
- Note whether the gap fill reveals a new pattern not visible in the journal

LIVE REASONING ANSWERS:
- Assess their actual reasoning quality against the profile's predicted weakness
- Note whether they performed better, worse, or as expected
- Adjust andreia, sophrosyne, or other relevant virtue assessments if warranted

RETURN valid JSON with this structure:
{
  "refined_profile": {
    // Full updated MentorProfile JSON with all fields
    // Include ALL original fields, modifying only what the answers warrant
  },
  "refinement_notes": [
    {
      "question_id": "baseline_01",
      "dimension_affected": "which profile dimension changed",
      "change_type": "confirmed | adjusted | new_finding | gap_filled",
      "before": "what the profile said before",
      "after": "what the profile says now",
      "reasoning": "why this change was made based on the answer"
    }
  ],
  "confidence_changes": {
    // For each major dimension, note whether confidence increased or decreased
    "passion_map": "increased|decreased|unchanged — brief note",
    "virtue_profile": "increased|decreased|unchanged — brief note",
    "causal_tendencies": "increased|decreased|unchanged — brief note",
    "oikeiosis_map": "increased|decreased|unchanged — brief note",
    "proximity_estimate": "increased|decreased|unchanged — brief note"
  },
  "summary": "2-3 sentence plain-language summary of what the baseline responses revealed about the practitioner that the journal alone did not capture"
}

IMPORTANT RULES:
- Preserve ALL original profile fields — only modify what the evidence warrants
- Never invent data the practitioner didn't provide
- Where an answer is ambiguous, note the ambiguity rather than guessing
- Frame everything as philosophical development, not psychological diagnosis (R1)
- This is diagnostic, not punitive — every finding opens a door (R6d)`

interface BaselineResponse {
  question_id: string
  question_text: string
  answer: string
}

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { responses } = body as { responses: BaselineResponse[] }

    // Validate input
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'responses is required: an array of { question_id, question_text, answer }' },
        { status: 400, headers: corsHeaders() }
      )
    }

    for (const r of responses) {
      if (!r.question_id || !r.answer) {
        return NextResponse.json(
          { error: `Each response must have question_id and answer. Missing in: ${JSON.stringify(r)}` },
          { status: 400, headers: corsHeaders() }
        )
      }
    }

    // Build the input for sage-reason: current profile + questions + answers
    const profileSummary = buildProfileSummary(mentorProfile)

    const answersFormatted = responses.map(r =>
      `[${r.question_id}] ${r.question_text || '(question text not provided)'}\n\nPRACTITIONER'S ANSWER:\n${r.answer}`
    ).join('\n\n---\n\n')

    const fullInput = `CURRENT MENTOR PROFILE:\n${profileSummary}\n\n` +
      `FULL PROFILE JSON:\n${JSON.stringify(mentorProfile, null, 2)}\n\n` +
      `========================================\n\n` +
      `BASELINE GAP QUESTION RESPONSES (${responses.length} answers):\n\n${answersFormatted}`

    const result = await runSageReason({
      input: fullInput,
      depth: 'deep',
      systemPromptOverride: REFINEMENT_SYSTEM_PROMPT,
      domain_context: 'mentor_baseline_refinement',
    })

    return NextResponse.json(
      {
        success: true,
        refinement: result,
        responses_processed: responses.length,
        usage_note: 'The refined_profile replaces the current MentorProfile. Review refinement_notes to see what changed and why.',
        disclaimer: 'SageReasoning offers philosophical exercises for self-examination. This is not psychological assessment or therapy.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-baseline-response] Error:', err)
    return NextResponse.json(
      { error: 'Failed to process baseline responses' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
