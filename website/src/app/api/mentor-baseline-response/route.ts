import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'
import { loadMentorProfile, saveMentorProfile } from '@/lib/mentor-profile-store'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import mentorProfileFallback from '@/data/mentor-profile.json'
import { getSupportBrainContext } from '@/lib/context/support-brain-loader'
import { getEnvironmentalContext } from '@/lib/context/environmental-context'

// =============================================================================
// mentor-baseline-response — Process practitioner's answers to gap questions
//
// POST /api/mentor-baseline-response
//
// After the practitioner answers the baseline gap detection questions generated
// by /api/mentor-baseline, this endpoint:
//   1. Loads the current profile from Supabase (encrypted, R17b)
//   2. Feeds profile summary + answers through sage-reason for analysis
//   3. Returns refinement notes and confidence changes
//   4. Saves the refinement data alongside the profile for future reference
//
// Input: { responses: [{ question_id, question_text, answer }] }
// Output: { refinement, current_profile, responses_processed }
//
// R1:  Philosophical exercise, not therapy
// R6d: Diagnostic, not punitive — answers open understanding, not judgment
// R7:  Analysis traces to Stoic Brain source files
// =============================================================================

const REFINEMENT_SYSTEM_PROMPT = `You are the Sage Mentor's profile refinement engine for SageReasoning.

You have two inputs:
1. The practitioner's current MentorProfile summary (extracted from their Stoic journal)
2. Their answers to the baseline gap detection questions

Your task: analyse each answer and produce refinement notes explaining what the answer reveals and how the profile should be updated.

For each answer, assess:
- CONFIRMATION: Does it confirm or contradict the extraction finding?
- EDGE CASE: Does it resolve the ambiguity? Which way?
- GAP FILL: What new data does it add to the thin dimension?
- LIVE REASONING: How did they actually reason vs what the profile predicted?

RETURN valid JSON with this structure:
{
  "refinement_notes": [
    {
      "question_id": "baseline_01",
      "dimension_affected": "which profile dimension this changes",
      "change_type": "confirmed | adjusted | new_finding | gap_filled",
      "before": "what the profile said before",
      "after": "what the profile should say now",
      "reasoning": "why, based on their answer"
    }
  ],
  "confidence_changes": {
    "passion_map": "increased|decreased|unchanged — brief note",
    "virtue_profile": "increased|decreased|unchanged — brief note",
    "causal_tendencies": "increased|decreased|unchanged — brief note",
    "oikeiosis_map": "increased|decreased|unchanged — brief note",
    "proximity_estimate": "increased|decreased|unchanged — brief note"
  },
  "summary": "2-3 sentence plain-language summary of what the baseline responses revealed that the journal alone did not capture"
}

RULES:
- Only note changes the evidence warrants — never invent data
- Where an answer is ambiguous, note the ambiguity rather than guessing
- Frame everything as philosophical development, not psychological diagnosis (R1)
- Diagnostic, not punitive — every finding opens a door (R6d)`

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

    // Load current profile — Supabase (encrypted) first, then static fallback
    let currentProfile: MentorProfileData
    if (isServerEncryptionConfigured() && auth.user?.id) {
      const stored = await loadMentorProfile(auth.user.id)
      currentProfile = stored ? stored.profile : (mentorProfileFallback as MentorProfileData)
    } else {
      currentProfile = mentorProfileFallback as MentorProfileData
    }

    // Build the input for sage-reason: profile summary + answers
    const profileSummary = buildProfileSummary(currentProfile)

    const answersFormatted = responses.map(r =>
      `[${r.question_id}] ${r.question_text || '(question text not provided)'}\n\nPRACTITIONER'S ANSWER:\n${r.answer}`
    ).join('\n\n---\n\n')

    const fullInput = `CURRENT MENTOR PROFILE SUMMARY:\n${profileSummary}\n\n` +
      `========================================\n\n` +
      `BASELINE GAP QUESTION RESPONSES (${responses.length} answers):\n\n${answersFormatted}`

    // Load project context (Layer 3 — project context)
    const projectContext = await getProjectContext('summary')
    const supportBrainContext = getSupportBrainContext('quick')
    const environmentalContext = await getEnvironmentalContext('support')

    const result = await runSageReason({
      input: fullInput,
      depth: 'deep',
      systemPromptOverride: REFINEMENT_SYSTEM_PROMPT,
      domain_context: 'mentor_baseline_refinement',
      stoicBrainContext: getStoicBrainContext('deep'),
      projectContext,
      agentBrainContext: supportBrainContext,
      environmentalContext,
    })

    return NextResponse.json(
      {
        success: true,
        refinement: result,
        current_profile: currentProfile,
        responses_processed: responses.length,
        usage_note: 'Review refinement_notes to see what the answers revealed. To save the updated profile, POST the modified profile to /api/mentor-profile.',
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
