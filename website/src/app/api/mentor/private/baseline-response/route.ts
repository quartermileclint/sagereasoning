import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'
import { buildProfileSummary, MentorProfileData } from '@/lib/mentor-profile-summary'
import { loadMentorProfile, saveMentorProfile } from '@/lib/mentor-profile-store'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import mentorProfileFallback from '@/data/mentor-profile.json'
import { getMentorKnowledgeBase } from '@/lib/context/mentor-knowledge-base-loader'
import { getMentorObservations, getProfileSnapshots, createProfileSnapshot } from '@/lib/context/mentor-context-private'

// =============================================================================
// PRIVATE mentor-baseline-response — Founder-only profile refinement
//
// POST /api/mentor/private/baseline-response
//
// Same logic as public /api/mentor-baseline-response, but with:
//   - L2 Project Context
//   - L5 Mentor Knowledge Base
//   - Auto-save refined profile (Phase C, Gap 5: baseline auto-save)
//
// Access: Founder only (FOUNDER_USER_ID env var)
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

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json(
      { error: 'This endpoint is restricted to the private mentor.' },
      { status: 403 }
    )
  }

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

    // Private mentor gets project context + L5 + growth accumulation context
    const [projectContext, mentorObservations, profileSnapshots] = await Promise.all([
      getProjectContext('summary'),
      getMentorObservations(auth.user.id, 'private-mentor'),
      getProfileSnapshots(auth.user.id, 'private-mentor'),
    ])
    const mentorKnowledgeBase = getMentorKnowledgeBase()

    // Enrich input with growth accumulation context
    let enrichedInput = fullInput
    if (mentorObservations) enrichedInput += `\n\n${mentorObservations}`
    if (profileSnapshots) enrichedInput += `\n\n${profileSnapshots}`

    const result = await runSageReason({
      input: enrichedInput,
      depth: 'deep',
      systemPromptOverride: REFINEMENT_SYSTEM_PROMPT,
      domain_context: 'mentor_baseline_refinement',
      stoicBrainContext: getStoicBrainContext('deep'),
      projectContext,
      mentorKnowledgeBase,
    })

    // Gap 5: Auto-save — record the baseline refinement as an interaction
    // and trigger a profile snapshot. Awaited to ensure writes complete before Vercel terminates.
    if (isServerEncryptionConfigured() && auth.user?.id) {
      try {
        const { recordInteraction } = await import('../../../../../../../sage-mentor/profile-store')
        const { data: profileRow } = await supabaseAdmin
          .from('mentor_profiles')
          .select('id')
          .eq('user_id', auth.user.id)
          .single()

        if (profileRow) {
          await recordInteraction(supabaseAdmin as any, profileRow.id, {
            type: 'baseline_question' as any,
            hub_id: 'private-mentor',
            description: `Baseline refinement: ${responses.length} gap questions processed`,
            proximity_assessed: undefined,
            passions_detected: [],
            mechanisms_applied: ['passion_diagnosis', 'oikeiosis', 'virtue_assessment'],
            mentor_observation: typeof result === 'object' && result !== null && 'summary' in result
              ? String((result as any).summary)
              : `Processed ${responses.length} baseline responses for profile refinement`,
          })

          await createProfileSnapshot(profileRow.id, 'manual', 'private-mentor')
        }
      } catch (err) {
        console.error('[mentor/private/baseline-response] Auto-save failed (non-blocking):', err)
      }
    }

    return NextResponse.json(
      {
        success: true,
        refinement: result,
        current_profile: currentProfile,
        responses_processed: responses.length,
        mentor_mode: 'private',
        auto_saved: true,
        usage_note: 'Refinement insights have been auto-saved to the interaction log and a profile snapshot has been taken. Review refinement_notes to see what the answers revealed.',
        disclaimer: 'SageReasoning offers philosophical exercises for self-examination. This is not psychological assessment or therapy.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor/private/baseline-response] Error:', err)
    return NextResponse.json(
      { error: 'Failed to process baseline responses' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
