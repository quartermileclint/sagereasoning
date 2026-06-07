import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, RATE_LIMITS, requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { runSageReason } from '@/lib/sage-reason-engine'
import { getStoicBrainContext } from '@/lib/context/stoic-brain-loader'
import { getProjectContext } from '@/lib/context/project-context'

// =============================================================================
// mentor-journal-week — Weekly Personalised Journal Questions
//
// POST /api/mentor-journal-week
//
// Generates 7 journal questions (one per day) tailored to the practitioner's
// current developmental needs. Unlike the fixed 55-Day Journal (which teaches
// the Stoic framework from scratch), these questions are selected and adapted
// from the Stoic Brain specifically for THIS practitioner based on:
//
//   1. Their weakest virtue domain → questions that exercise it
//   2. Their most persistent passions → questions that expose the false judgement
//   3. Their causal breakdown point → questions that target that stage
//   4. Their ledger tensions → questions that revisit unresolved gaps
//   5. Their recent progress → questions that consolidate or stretch
//
// The mentor picks from all 8 Stoic Brain files (stoic-brain.json, psychology.json,
// value.json, virtue.json, passions.json, action.json, progress.json, scoring.json)
// and crafts questions that use the practitioner's own language and reference their
// actual life situations where possible.
//
// Input: Profile summary + optional recent_activity summary
// Output: 7 journal questions with teaching, source citation, and targeting rationale
//
// R1:  Philosophical exercise, not therapy
// R6d: Diagnostic, not punitive — questions open doors
// R7:  Every question traces to a Stoic Brain source
// R8c: English only in user-facing content (Greek in data layer)
// =============================================================================

const WEEKLY_JOURNAL_SYSTEM_PROMPT = `You are the Sage Mentor's weekly journal designer for SageReasoning.

You are designing this week's personalised journal questions for a specific practitioner. You have their MentorProfile and (optionally) their recent activity. Your job is to select 7 questions — one for each day — that will help them progress where they most need it.

SELECTION STRATEGY:
- Day 1-2: TARGET THE WEAKEST VIRTUE — questions that specifically exercise the virtue domain where they score lowest
- Day 3-4: CONFRONT THE DOMINANT PASSION — questions that make the false judgement behind their strongest passion visible and examinable
- Day 5: TARGET THE CAUSAL BREAKDOWN — a question that requires the practitioner to practice at the exact stage where their reasoning typically breaks (phantasia/synkatathesis/horme/praxis)
- Day 6: REVISIT A TENSION — take an unresolved tension from their ledger and design a question that approaches it from a new angle
- Day 7: CONSOLIDATE STRENGTH — a question that builds on what they're already good at, extending it further (prevents the practice from feeling only corrective)

QUESTION DESIGN RULES:
- Each question must include a brief teaching (2-3 sentences of Stoic wisdom relevant to this question)
- Use plain English, no Greek/Latin terminology in the question itself (R8c)
- Scenario-based where possible — "Imagine..." or "Recall a time when..."
- Reference the practitioner's actual circumstances where the profile provides them
- Each question must cite its Stoic Brain source file and primary source
- Frame as practice and exploration, never as correction or failure (R1, R6d)
- Make each question answerable in 5-15 minutes of reflective writing

Return ONLY valid JSON:
{
  "week_focus": "one-sentence summary of this week's developmental theme",
  "questions": [
    {
      "day": 1,
      "targeting": "which profile dimension this targets and why",
      "brain_source": "which stoic-brain JSON file",
      "source_citation": "primary source (e.g. Seneca Ep. 75, Epictetus Disc. 1.4)",
      "teaching": "2-3 sentence Stoic teaching that frames the question",
      "question": "the reflective question for the practitioner to answer",
      "what_to_listen_for": "what the mentor watches for in the response (growth signals, passion markers, reasoning quality)"
    }
  ]
}`

export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  try {
    const body = await request.json()
    const { profile_summary, recent_activity, week_number } = body

    if (!profile_summary || typeof profile_summary !== 'string') {
      return NextResponse.json(
        { error: 'profile_summary is required (string summarising the MentorProfile)' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const contextNote = recent_activity
      ? `\n\nRECENT ACTIVITY:\n${recent_activity}`
      : ''
    const weekNote = week_number
      ? `\n\nThis is Week ${week_number} of their personalised journal practice.`
      : ''

    // Layer 3: Project context at 'summary' level (mentor endpoints need
    // identity + phase + recent decisions for contextual question design).
    const projectContext = await getProjectContext('summary')

    const result = await runSageReason({
      input: `${profile_summary}${contextNote}${weekNote}`,
      depth: 'deep',
      systemPromptOverride: WEEKLY_JOURNAL_SYSTEM_PROMPT,
      domain_context: 'mentor_weekly_journal',
      stoicBrainContext: getStoicBrainContext('deep'),
      projectContext,
    })

    return NextResponse.json(
      {
        success: true,
        weekly_journal: result,
        week_number: week_number ?? 1,
        usage_note: 'Present one question per day. After the practitioner answers, their response can be scored via /api/score or /api/reflect to track progress.',
        disclaimer: 'SageReasoning offers philosophical exercises for self-examination. This is not psychological assessment or therapy.',
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[mentor-journal-week] Error:', err)
    return NextResponse.json(
      { error: 'Failed to generate weekly journal questions' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

export async function OPTIONS() {
  return corsPreflightResponse()
}
