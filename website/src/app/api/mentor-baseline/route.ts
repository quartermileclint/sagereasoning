import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'

// =============================================================================
// mentor-baseline — Post-Extraction Gap Detection Questionnaire
//
// POST /api/mentor-baseline
//
// After sage-interpret extracts a MentorProfile from the journal, this endpoint
// generates tailored baseline questions to:
//   1. Confirm the extraction captured the practitioner accurately
//   2. Probe edge cases where the journal data was ambiguous
//   3. Fill gaps where sections were thin or passions were borderline
//   4. Establish a verified foundation before the mentor journey begins
//
// Input: The current MentorProfile JSON (or a summary of it)
// Output: 8-12 tailored questions drawn from the Stoic Brain, each targeting
//         a specific gap, edge case, or ambiguity in the extracted profile.
//
// R1:  Philosophical exercise, not therapy
// R6d: Diagnostic, not punitive
// R7:  Questions trace to Stoic Brain source files
// =============================================================================

const BASELINE_SYSTEM_PROMPT = `You are the Sage Mentor's baseline assessment engine for SageReasoning.

You have just received a practitioner's MentorProfile, extracted from their personal Stoic journal. Your task is to generate tailored baseline questions that will:

1. CONFIRM accuracy: Ask about key findings to verify the extraction got it right
2. PROBE edge cases: Where the data is ambiguous, ask clarifying questions
3. FILL gaps: Where sections were thin or dimensions under-represented, ask targeted questions
4. TEST live reasoning: Present a scenario that tests the practitioner's weakest area

QUESTION DESIGN RULES:
- Each question must target a SPECIFIC finding from their profile (cite which dimension/passion/virtue)
- Questions must be scenario-based where possible (not abstract philosophy)
- Use the practitioner's own language patterns and metaphors where the profile reveals them
- Frame everything as practice and exploration (R1: philosophical, not therapeutic)
- Never punitive — every question opens a door, not a judgment (R6d)
- Each question must trace to a Stoic Brain concept (cite the source file)

GENERATE exactly 10 questions in this structure:
1. 2 CONFIRMATION questions — verify the strongest findings (most frequent passions, dominant causal pattern)
2. 3 EDGE-CASE questions — probe where the profile showed borderline or contradictory signals
3. 3 GAP-FILL questions — target dimensions with thin evidence (under-represented virtues, missing oikeiosis circles)
4. 2 LIVE-REASONING scenarios — present a situation that tests the practitioner's identified weakest domain

For each question return:
{
  "id": "baseline_01",
  "category": "confirmation|edge_case|gap_fill|live_reasoning",
  "target_dimension": "which profile dimension this question probes",
  "stoic_brain_source": "which brain file this connects to",
  "question_text": "the actual question to present to the practitioner",
  "what_the_answer_reveals": "what the mentor learns from their response",
  "follow_up_if_surprising": "what to ask if the answer contradicts the profile"
}

Return ONLY valid JSON: { "questions": [...], "profile_summary_used": "brief note of what you based questions on" }`

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { profile_summary } = body

    if (!profile_summary || typeof profile_summary !== 'string') {
      return NextResponse.json(
        { error: 'profile_summary is required (string summarising the MentorProfile)' },
        { status: 400, headers: corsHeaders() }
      )
    }

    // Layer 3: Project context at 'summary' level (mentor endpoints need
    // identity + phase + recent decisions for contextual question design).
    const projectContext = await getProjectContext('summary')

    const result = await runSageReason({
      input: profile_summary,
      depth: 'deep',
      systemPromptOverride: BASELINE_SYSTEM_PROMPT,
      domain_context: 'mentor_baseline_assessment',
      stoicBrainContext: getStoicBrainContext('deep'),
      projectContext,
    })

    return NextResponse.json(
      {
        success: true,
        baseline_questions: result,
        usage_note: 'Present these questions to the practitioner after journal extraction. Their answers refine the MentorProfile before the mentor journey begins.',
        disclaimer: 'SageReasoning offers philosophical exercises for self-examination. This is not psychological assessment or therapy.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-baseline] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate baseline questions' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
