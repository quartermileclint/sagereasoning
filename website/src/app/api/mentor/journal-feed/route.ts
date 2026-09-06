import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth, validateTextLength, TEXT_LIMITS } from '@/lib/security'
import { encryptJournalProse, resolveJournalProse } from '@/lib/journal-encryption'
import { detectDistressTwoStage } from '@/lib/r20a-classifier'
import { enforceDistressCheck } from '@/lib/constraints'

/**
 * Strip the at-rest encryption columns from a stored row and surface the
 * resolved (decrypted, or legacy-plaintext) prose. The response shape is
 * byte-identical to the pre-encryption shape for the authenticated owner —
 * `impression` / `assent` / `action` are returned as readable text (R17b).
 */
function presentEntry(row: Record<string, unknown>): Record<string, unknown> {
  const { entry_ciphertext: _c, entry_meta: _m, impression: _i, assent: _a, action: _ac, ...rest } = row
  const prose = resolveJournalProse(row as Parameters<typeof resolveJournalProse>[0])
  return { ...rest, impression: prose.impression, assent: prose.assent, action: prose.action }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * POST /api/mentor/journal-feed
 *
 * Create a real-time journal entry capturing the causal sequence:
 * impression → assent → action.
 *
 * Body: { impression, assent, action, event_timestamp? }
 * All three text fields required. event_timestamp optional (ISO string).
 *
 * @gap Gap 1 — Real-Time Journal Feed
 */
export async function POST(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const body = await request.json()
    const { impression, assent, action, event_timestamp } = body

    // The three-field PRESENCE check (provenance 6b52fe8 2026-04-12, file
    // creation) and the two `event_timestamp` 400s used to sit HERE, before
    // the distress check. MOVED after the R20a redirect return on 2026-09-06
    // (Session 3C, Group 2b of operations/count-discipline-2026-09/2026-09-05-
    // r20a-perimeter-ordering-AUDIT.md — the audit's §4.4 P′ and O classes)
    // under the mentor's Part 5 ruling (D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-
    // 2026-09-05): the principle "applies wherever the screened text exists
    // and the rejection fires before the check sees it." The screened subject
    // here is the JOIN of all three fields, so a distressed `impression`
    // submitted alone must reach the check. See the guards' new site below.

    // The three MAXIMUM-length guards (`impression`, `assent`, `action`;
    // provenance 6b52fe8 2026-04-12, file creation) used to sit HERE, before
    // the distress check. MOVED after the R20a redirect return on 2026-09-05
    // (Session 3B, Group 2 of operations/count-discipline-2026-09/2026-09-05-
    // r20a-perimeter-ordering-AUDIT.md §6, item 6) under the binding ruling:
    // "the distress check runs before the length guard on any route where the
    // human crisis form is rendered." See the guards' new site below. The
    // event_timestamp 400s that follow are class O in the audit (not length
    // guards) and are left where they are — audit §4.4, a mentor question.

    // R20a — Vulnerable-user detection (PR6 / AC5 ninth-route perimeter member).
    // Screen the combined free-text (impression + assent + action) through the
    // two-stage distress classifier (regex → Haiku) BEFORE encryption + insert.
    // PR3: the check is awaited (synchronous) — never screen ciphertext, never
    // fire-and-forget. On moderate/acute distress, redirect to support and do
    // NOT store the entry (this is a store-only route; the right action is to
    // redirect, not persist).
    //
    // SCREENING CAP (2026-09-05, Session 3B Group 2, audit §3 constraint 2):
    // now that the maximum-length guards run AFTER this check, the raw fields
    // are unbounded here, so each is sliced at the route's own bound
    // (TEXT_LIMITS.medium — the same value the guards below enforce) before
    // the classifier sees it. The join is unchanged; an in-bound request is
    // screened byte-identically to before. DISCLOSED RESIDUAL (audit §4.3):
    // distress appearing only past character 5,000 of a field is not
    // screened — before this move it was not read at all (a bare 400).
    //
    // PRESENCE MOVED (2026-09-06, Session 3C Group 2b): the three-field
    // presence check now runs AFTER this check, so a field may be absent
    // here. The subject is composed from whichever fields are present
    // (`String(s ?? '')` — an absent field contributes nothing; a present
    // non-string is coerced exactly as before). When NOTHING is present the
    // composed subject is empty and the check is SKIPPED: the Part 5
    // principle binds only where "the screened text is present and readable",
    // and stage 2 (Haiku) would otherwise spend on an empty string before the
    // presence 400 below. The skip test is `.trim()` truthiness, deliberately
    // not a `.length` comparison (the NEG-1 class fence).
    const distressText = [impression, assent, action]
      .map((s) => String(s ?? '').slice(0, TEXT_LIMITS.medium).trim())
      .join('\n\n')
    if (distressText.trim()) {
      const gate = await enforceDistressCheck(detectDistressTwoStage(distressText))
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

    // Three-field PRESENCE + the `event_timestamp` 400s — MOVED here
    // 2026-09-06 (Session 3C, Group 2b of the perimeter-ordering audit, the
    // §4.4 P′ and O classes) under the mentor's 2026-09-05 Part 5 ruling. A
    // distressed `impression` submitted without `assent`/`action` (or with a
    // malformed timestamp) now reaches the check above and receives the crisis
    // resources instead of these 400s. ORDER, NOT EXISTENCE: values, messages,
    // status and the guards' relative order (presence, then the two timestamp
    // checks, then the maxima — the pre-remediation order) are unchanged, and
    // all still precede encryption and the store. Pinned by SIB-1..3, TS-1
    // and NEG-2 in __tests__/r20a-invocation.test.ts on the enclosing
    // skip-block's brace-matched END; mutation-verified against both bypasses
    // and a decoy re-add before the check.
    if (!impression?.trim() || !assent?.trim() || !action?.trim()) {
      return NextResponse.json(
        { error: 'All three fields are required: impression, assent, action' },
        { status: 400 }
      )
    }

    // Validate event_timestamp if provided
    let parsedEventTimestamp: string | null = null
    if (event_timestamp) {
      const ts = new Date(event_timestamp)
      if (isNaN(ts.getTime())) {
        return NextResponse.json({ error: 'Invalid event_timestamp format' }, { status: 400 })
      }
      if (ts > new Date()) {
        return NextResponse.json({ error: 'event_timestamp cannot be in the future' }, { status: 400 })
      }
      parsedEventTimestamp = ts.toISOString()
    }

    // `impression` / `assent` / `action` MAXIMUM length — MOVED here
    // 2026-09-05 (Session 3B, Group 2 of the perimeter-ordering audit, §6
    // item 6) under the 2026-09-06 ruling
    // (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06). A long
    // distressed entry now reaches the check above (each field capped at this
    // same bound) and receives the crisis resources instead of this 400.
    // ORDER, NOT EXISTENCE: values, messages, status and the guards' relative
    // order are unchanged, and all three still precede encryption and the
    // store. Pinned by MAX-1..4 in __tests__/r20a-invocation.test.ts on the
    // redirect block's brace-matched END; mutation-verified against both
    // bypasses and the cap's removal.
    const impressionErr = validateTextLength(impression, 'Impression', TEXT_LIMITS.medium)
    if (impressionErr) return NextResponse.json({ error: impressionErr }, { status: 400 })

    const assentErr = validateTextLength(assent, 'Assent', TEXT_LIMITS.medium)
    if (assentErr) return NextResponse.json({ error: assentErr }, { status: 400 })

    const actionErr = validateTextLength(action, 'Action', TEXT_LIMITS.medium)
    if (actionErr) return NextResponse.json({ error: actionErr }, { status: 400 })

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // R17b — encrypt the three verbatim prose fields at rest as one blob.
    // entry_meta is a PLAIN OBJECT (KG7); never JSON.stringify it.
    const enc = encryptJournalProse({
      impression: impression.trim(),
      assent: assent.trim(),
      action: action.trim(),
    })

    const { data, error } = await supabase
      .from('realtime_journal_entries')
      .insert({
        user_id: userId,
        entry_ciphertext: enc.ciphertext,
        entry_meta: enc.meta,
        event_timestamp: parsedEventTimestamp,
      })
      .select()
      .single()

    if (error) {
      console.error('Journal feed insert error:', error)
      return NextResponse.json({ error: 'Failed to save journal entry' }, { status: 500 })
    }

    // Return the same shape the client expects — decrypted prose, no ciphertext.
    return NextResponse.json({
      success: true,
      entry: presentEntry(data as Record<string, unknown>),
    })
  } catch (err) {
    console.error('Journal feed API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/mentor/journal-feed?limit=20&offset=0
 *
 * Retrieve real-time journal entries for the authenticated user.
 * Returns entries in reverse chronological order with lag metrics.
 *
 * Also returns aggregate stats: total entries, avg lag, % under 24h.
 */
export async function GET(request: NextRequest) {
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.scoring)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Fetch entries
  const { data: entries, error: entriesError } = await supabase
    .from('realtime_journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (entriesError) {
    console.error('Journal feed fetch error:', entriesError)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }

  // Fetch aggregate stats
  const { data: stats, error: _statsError } = await supabase
    .from('realtime_journal_lag_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Total count for pagination
  const { count } = await supabase
    .from('realtime_journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // R17b — decrypt each row's prose server-side before returning to the owner.
  const presentedEntries = (entries || []).map((e) => presentEntry(e as Record<string, unknown>))

  return NextResponse.json({
    entries: presentedEntries,
    stats: stats || {
      total_entries: 0,
      avg_lag_hours: null,
      pct_under_24h: null,
      first_entry: null,
      latest_entry: null,
    },
    total: count || 0,
    limit,
    offset,
  })
}
