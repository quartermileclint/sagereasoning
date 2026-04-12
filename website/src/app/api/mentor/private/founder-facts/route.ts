import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { setFounderFacts, appendFounderFactsNote } from '@/lib/context/mentor-context-private'
import type { FounderFacts } from '@/lib/mentor-profile-summary'

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
      { success: true, message: 'Founder facts set successfully' },
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
      { success: true, message: 'Note appended to founder facts' },
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
