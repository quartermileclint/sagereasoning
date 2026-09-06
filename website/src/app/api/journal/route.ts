import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/journal
 *
 * Submit a journal entry. Creates a record in journal_entries and
 * also registers a journal completion in the practice calendar system.
 *
 * Body: { day_number, phase_number, reflection_text }
 * User identity is extracted from the JWT — not from the request body.
 *
 * For local-storage users, reflection_text will be '__local__' — the actual
 * text stays on their device. We still record the completion for calendar stamps.
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const user_id = auth.user.id

  try {
    const body = await request.json()
    const { day_number, phase_number, reflection_text } = body

    // PRESENCE of the SCREENED field only. This check used to read
    // `!day_number || !reflection_text` (provenance ab46c8c 2026-03-26,
    // file creation) and was followed by the `day_number` 1–56 range 400. SPLIT on
    // 2026-09-06 (Session 3C, Group 2b of operations/count-discipline-2026-09/
    // 2026-09-05-r20a-perimeter-ordering-AUDIT.md — the audit's §4.4 P′ and O
    // classes) under the mentor's Part 5 ruling (D-MENTOR-RULINGS-FIVE-RELAYS-
    // ADOPTED-2026-09-05): the `reflection_text` half STAYS (it is the
    // screened text itself — absent, there is nothing to screen); the
    // `day_number` presence half and the range 400 MOVED after the R20a
    // redirect return (see below). The message is kept identical on both
    // halves.
    if (!reflection_text) {
      return NextResponse.json({ error: 'day_number and reflection_text are required' }, { status: 400 })
    }

    // The MAXIMUM-length guard on `reflection_text` (provenance aeadbd1
    // 2026-03-26, a general security pass) used to sit HERE, before the
    // distress check. MOVED after the R20a redirect return on 2026-09-05
    // (Session 3B, Group 2 of operations/count-discipline-2026-09/2026-09-05-
    // r20a-perimeter-ordering-AUDIT.md §6, item 6) under the binding ruling:
    // "the distress check runs before the length guard on any route where the
    // human crisis form is rendered." See the guard's new site below.

    // R20a — Vulnerable-user detection (PR6 / AC5 tenth-route perimeter member).
    // Screen the reflection text through the two-stage distress classifier
    // (regex → Haiku) BEFORE any store. PR3: the check is awaited (synchronous),
    // never fire-and-forget. Skip the '__local__' sentinel — local-storage users
    // keep their text on-device, so there is no real server-side text to screen
    // and a Haiku call would be wasted. On moderate/acute distress, redirect to
    // support and do NOT store the entry.
    //
    // SCREENING CAP (2026-09-05, Session 3B Group 2, audit §3 constraint 2):
    // now that the maximum-length guard runs AFTER this check, the raw field
    // is unbounded here, so it is sliced at the route's own bound
    // (TEXT_LIMITS.medium — the same value the guard below enforces) before
    // the classifier sees it. An in-bound request is screened byte-identically
    // to before. A NON-STRING `reflection_text` (the presence check is not a
    // type check) is coerced with String() — the same ToString the regex
    // stage always applied to it — and THEN sliced, so the bound holds for
    // every value (PR19 fold, 2026-09-06: a first cut sliced strings only, so
    // an array of >5,000 elements — which HEAD's guard 400'd by element count
    // before the check — reached the classifier unbounded); its status
    // afterwards is unchanged (the guard, then `.trim()`). DISCLOSED RESIDUAL
    // (audit §4.3): distress appearing only past character 5,000 is not
    // screened — before this move it was not read at all (a bare 400). COST,
    // disclosed: an oversized regex-silent entry now reaches stage 2 (Haiku)
    // at cap size where it was previously a free 400; RATE_LIMITS.scoring
    // governs.
    if (reflection_text !== '__local__') {
      const screenedReflectionText = String(reflection_text).slice(0, TEXT_LIMITS.medium)
      const gate = await enforceDistressCheck(detectDistressTwoStage(screenedReflectionText))
      if (gate.shouldRedirect) {
        return NextResponse.json(
          {
            distress_detected: true,
            severity: gate.result.severity,
            redirect_message: gate.result.redirect_message,
          },
          { status: 200 }
        )
      }
    }

    // `reflection_text` MAXIMUM length — MOVED here 2026-09-05 (Session 3B,
    // Group 2 of the perimeter-ordering audit, §6 item 6) under the 2026-09-06
    // ruling (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06).
    // A long distressed entry now reaches the check above (capped at this same
    // bound) and receives the crisis resources instead of this 400. ORDER, NOT
    // EXISTENCE: value, message and status are unchanged, and the guard still
    // precedes every store touch. Pinned by MAX-1..4 in
    // __tests__/r20a-invocation.test.ts on the redirect block's brace-matched
    // END; mutation-verified against both bypasses and the cap's removal.
    const textErr = validateTextLength(reflection_text, 'Reflection text', TEXT_LIMITS.medium)
    if (textErr) return NextResponse.json({ error: textErr }, { status: 400 })

    // `day_number` PRESENCE (the other half of the split above) + the 1–56
    // RANGE — MOVED here 2026-09-06 (Session 3C, Group 2b of the perimeter-
    // ordering audit, the §4.4 P′ and O classes) under the mentor's 2026-09-05
    // Part 5 ruling. A distressed entry submitted without a `day_number` (or
    // with one out of range) now reaches the check above and receives the
    // crisis resources instead of these 400s. ORDER, NOT EXISTENCE: values,
    // messages and status are unchanged, and both still precede the store
    // client and every store touch. The `'__local__'` sentinel path is
    // unchanged: a local-storage completion skips the check and lands here
    // exactly as before. Pinned by DAY-1..3 + NEG-2 in
    // __tests__/r20a-invocation.test.ts on the sentinel block's brace-matched
    // END; mutation-verified against both bypasses and a decoy re-add before
    // the check.
    if (!day_number) {
      return NextResponse.json({ error: 'day_number and reflection_text are required' }, { status: 400 })
    }

    if (day_number < 1 || day_number > 56) {
      return NextResponse.json({ error: 'day_number must be between 1 and 56' }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check for duplicate entry
    const { data: existing } = await supabase
      .from('journal_entries')
      .select('id')
      .eq('user_id', user_id)
      .eq('day_number', day_number)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Entry for this day already exists' }, { status: 409 })
    }

    // Pace control — an ELAPSED-HOURS gate, not a calendar-day one.
    //
    // The old gate compared UTC calendar dates, which is wrong in every
    // timezone: an entry written at, say, 9pm local is already "tomorrow" in
    // UTC west of Greenwich (so the gate never fires and pacing is defeated),
    // and east of Greenwich the UTC day does not roll until mid-morning local
    // (so a "come back tomorrow" 429 kept firing through the next local morning
    // — false to the practitioner, who was looking at a new local day). Founder
    // decision, C4 2026-08-16: replace it with a timezone-free elapsed-hours
    // floor. The next day opens JOURNAL_PACE_MIN_HOURS after the last entry,
    // which preserves the "roughly one a day, no binging" intent the pacing
    // exists for and is honest in every timezone with no client tz signal.
    const { data: lastEntry } = await supabase
      .from('journal_entries')
      .select('day_number, created_at')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const JOURNAL_PACE_MIN_HOURS = 16
    if (lastEntry && day_number > 1 && day_number > lastEntry.day_number) {
      const hoursSince = (Date.now() - new Date(lastEntry.created_at).getTime()) / 3_600_000
      if (hoursSince < JOURNAL_PACE_MIN_HOURS) {
        const hoursRemaining = Math.max(1, Math.ceil(JOURNAL_PACE_MIN_HOURS - hoursSince))
        return NextResponse.json({
          error: `You can move to the next day once a little time has passed — about ${hoursRemaining} more hour${hoursRemaining === 1 ? '' : 's'}. The path is walked at a steady pace, not rushed.`,
          hours_remaining: hoursRemaining,
        }, { status: 429 })
      }
    }

    const isLocal = reflection_text === '__local__'
    const wordCount = isLocal ? 0 : reflection_text.trim().split(/\s+/).filter(Boolean).length

    // Insert journal entry
    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id,
        day_number,
        phase_number: phase_number || 1,
        reflection_text: isLocal ? '__local__' : reflection_text.trim(),
        word_count: wordCount,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('Journal insert error:', error)
      return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entry: data,
      message: `Day ${day_number} complete. Calendar stamp earned.`,
    })
  } catch (err) {
    console.error('Journal API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/journal?day=5
 *
 * Retrieve journal entries for the authenticated user.
 * If day is specified, returns that single entry.
 * Otherwise returns all entries.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const day = searchParams.get('day')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  if (day) {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('day_number', parseInt(day))
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  }

  // Return all entries (just day numbers and dates for progress, not full text)
  const { data, error: _error } = await supabase
    .from('journal_entries')
    .select('day_number, phase_number, word_count, created_at')
    .eq('user_id', userId)
    .order('day_number', { ascending: true })

  return NextResponse.json({
    entries: data || [],
    total_days: 56,
    completed_days: data?.length || 0,
    completion_percent: Math.round(((data?.length || 0) / 56) * 100),
  })
}
