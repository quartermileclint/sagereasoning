import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { setFounderFacts, appendFounderFactsNote } from '@/lib/context/mentor-context-private'
import type { FounderFacts } from '@/lib/mentor-profile-summary'
import { enforceDistressCheck } from '@/lib/constraints'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import {
  isR20aGapClosureEnabled,
  composeDistressSubject,
  collectFounderFactsPutText,
  buildMildSupportResources,
  hasScreenableSubject,
} from '@/lib/r20a-gap-closure'

// =============================================================================
// PRIVATE founder-facts — Manage the biographical context block
//
// PUT  /api/mentor/private/founder-facts  — Set/replace full FounderFacts
// POST /api/mentor/private/founder-facts  — Append a single biographical note
//
// Access: Founder only (FOUNDER_USER_ID env var)
// =============================================================================

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * PUT — Set or replace the entire FounderFacts block.
 * Body: { facts: FounderFacts }
 */
export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401, headers: corsHeaders() })
  }

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json({ error: 'Founder access only' }, { status: 403, headers: corsHeaders() })
  }

  try {
    const body = await req.json()
    const facts = body.facts as FounderFacts

    // ── R20a perimeter (AC5; added 2026-08-17, builder-found gap 8, PUT half)
    // FounderFacts carries FOUR free-text fields (work_schedule,
    // family_situation, financial_situation, retirement_horizon) plus
    // additional_context: string[] — a bulk REPLACE of the whole biographical
    // block, larger in surface than the POST note this route's sibling
    // endpoint screens. Founder-only is NOT an exemption (this codebase's own
    // precedent: /api/mentor/private/reflect is founder-only and IS a member).
    //
    // Runs BEFORE the route's own `facts.age` shape check and before any
    // write. Flag-off is byte-identical. See r20a-gap-closure.ts.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const subject = composeDistressSubject(collectFounderFactsPutText(facts))
      // PR19 (2026-08-18 fold, extended 2026-08-22): skip the classifier on an
      // empty subject — missing/empty facts fields have no distress to
      // detect, and calling it anyway pays for a real billed Haiku call
      // before the facts.age shape check below fires.
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
          mildSupport = buildMildSupportResources('passion')
        }
      }
    }

    if (!facts || typeof facts.age !== 'number') {
      return NextResponse.json(
        { error: 'Invalid FounderFacts payload — requires at minimum { facts: { age, ... } }' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const result = await setFounderFacts(auth.user.id, facts)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to set founder facts' },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Founder facts set successfully',
        ...(mildSupport ? { support_resources: mildSupport } : {}),
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[founder-facts] PUT error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}

/**
 * POST — Append a biographical note to the additional_context array.
 * Body: { note: string }
 *
 * This is the mechanism by which the mentor (or the founder) can grow
 * the biographical context over time. Notes are timestamped on append.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: 401, headers: corsHeaders() })
  }

  // Founder-only gate
  const founderId = process.env.FOUNDER_USER_ID
  if (!founderId || auth.user.id !== founderId) {
    return NextResponse.json({ error: 'Founder access only' }, { status: 403, headers: corsHeaders() })
  }

  try {
    const body = await req.json()
    const note = body.note as string

    // ── R20a perimeter (AC5; added 2026-08-17, PR19-found gap 8, POST half) ─
    // Unbounded free-text `note` appended to a biographical context block
    // later fed into mentor LLM prompts. Founder-only is NOT an exemption
    // (this codebase's own precedent: /api/mentor/private/reflect is
    // founder-only and IS a member).
    //
    // Runs BEFORE the route's own note-emptiness check and before any write.
    // Flag-off is byte-identical. See r20a-gap-closure.ts.
    let mildSupport: ReturnType<typeof buildMildSupportResources> | null = null
    if (isR20aGapClosureEnabled()) {
      const subject = composeDistressSubject([note])
      // PR19 (2026-08-18 fold, extended 2026-08-22): skip the classifier on an
      // empty subject — a missing/empty `note` has no distress to detect, and
      // calling it anyway pays for a real billed Haiku call before the
      // note-emptiness check below fires.
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
          mildSupport = buildMildSupportResources('passion')
        }
      }
    }

    if (!note || typeof note !== 'string' || note.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing or empty note' },
        { status: 400, headers: corsHeaders() }
      )
    }

    const result = await appendFounderFactsNote(auth.user.id, note.trim())

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to append note' },
        { status: 500, headers: corsHeaders() }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Note appended to founder facts',
        ...(mildSupport ? { support_resources: mildSupport } : {}),
      },
      { headers: corsHeaders() }
    )
  } catch (err) {
    console.error('[founder-facts] POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
