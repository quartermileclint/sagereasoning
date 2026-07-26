import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'
import {
  PRACTICE_SOURCE_TABLES,
  RHYTHM_TABLES,
  foldPracticeStatuses,
  type TableRead,
} from '@/lib/practice-sequence'
import { logRouteError } from '@/lib/observability-store'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/** The admin client, and its exact inferred type. Taken from a call rather than
 *  written as `ReturnType<typeof createClient>`, which infers a different schema
 *  variant (`never` where the real call yields `"public"`) and does not match. */
function adminClient() {
  return createClient(supabaseUrl, supabaseServiceKey)
}
type AdminClient = ReturnType<typeof adminClient>

/**
 * Most-recent row + total count for one (table, user), in a single read.
 *
 * Index note, stated rather than assumed: seven of the nine tables carry a
 * `(user_id, created_at DESC)` index, so the filter and the ordering are both
 * served. TWO do not. `oikeiosis_reflections` is indexed `(user_id, year DESC,
 * quarter DESC)`, so the `user_id` prefix serves the filter but the
 * `created_at` ordering is a sort — negligible on a quarterly table (a few rows
 * per practitioner ever), and not worth a migration. `journal_entries` IS
 * declared, but at `api/migrations/add-journal-entries-table.sql`, outside the
 * `website/supabase-*.sql` set — with `user_id`, `created_at` and indexes, i.e.
 * exactly what this read needs. (An earlier draft of this comment claimed it was
 * declared nowhere; that was wrong, and was found by looking outside the
 * directory the search had been scoped to.)
 *
 * `count` rides along on PostgREST's exact count and is advisory only — nothing
 * this feature RENDERS depends on it (plan §11 forbids completion framing, so no
 * surface shows a tally). Everything rendered derives from `rows.length > 0` and
 * `rows[0].created_at`, both of which are limit-independent and certain.
 *
 * Never throws: a rejection becomes `status: 'unavailable'`, so one missing or
 * misbehaving table degrades that row alone rather than the whole response.
 */
async function readTable(
  supabase: AdminClient,
  table: string,
  userId: string
): Promise<TableRead> {
  try {
    const { data, error, count } = await supabase
      .from(table)
      .select('created_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error(`practice-status: read failed for ${table}:`, error)
      return { status: 'unavailable', last_used_at: null, count: null }
    }

    const rows = (data ?? []) as Array<{ created_at: string | null }>
    const mostRecent = rows.length > 0 ? rows[0].created_at : null

    return {
      status: 'ok',
      last_used_at: typeof mostRecent === 'string' ? mostRecent : null,
      count: typeof count === 'number' ? count : null,
    }
  } catch (err) {
    console.error(`practice-status: read threw for ${table}:`, err)
    return { status: 'unavailable', last_used_at: null, count: null }
  }
}

/**
 * GET /api/mentor/practice-status
 *
 * Practice reminders, human plan Phase 1 — the SEQUENCE trigger's read side
 * (`operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` §6).
 *
 * Answers one question per practice: has this practitioner met it, and when
 * last. Plus `next_in_sequence` — the first tracked practice with no rows, which
 * is the "default path before enough practitioner context exists to personalise
 * it" (mentor, plan §1 constraint 3).
 *
 * READ-ONLY. Writes nothing, creates nothing, and makes no LLM call. Human-only:
 * never touches /api/reason, the signed assessment, the substrate engine, the
 * trust core or the reflect engine — the accompanying boundary test asserts it.
 *
 * A practice counts as met if ANY of its source tables holds a row, which is why
 * `/oikeiosis` (quarterly reflection + circle extension) reads two.
 */
export async function GET(request: NextRequest) {
  // `analytics`, NOT `scoring` — deliberately, and this is a measurement concern
  // rather than a capacity one. `checkRateLimit` keys its buckets by IP WITHIN a
  // per-category store (security.ts:78-80), and `/api/reason` — the surface the
  // 7-day false-hold observation window is measuring — uses `RATE_LIMITS.scoring`
  // (reason/route.ts:640). Putting a call that fires on every dashboard mount in
  // that same bucket would let ordinary human browsing consume budget the
  // measured surface needs, from the same IP. `analytics` is a separate category
  // store, so this route cannot throttle the instrument. A dedicated bucket
  // would be cleaner still, but RATE_LIMITS lives in security.ts, which IS in
  // the /api/reason import graph and must stay untouched while the window runs.
  //
  // NAMED FOLLOW-UP (pre-existing, not introduced here): /api/milestones and
  // /api/baseline both still use `scoring` and both fire on a dashboard mount.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.analytics)
  if (rateLimitError) return rateLimitError

  const auth = await requireAuth(request)
  if (auth.error) return auth.error
  const userId = auth.user.id

  try {
    const supabase = adminClient()

    // Every distinct table exactly once, even though `/oikeiosis` maps to two and
    // a future mapping could share one between practices.
    const tables = Array.from(
      new Set([
        ...Object.values(PRACTICE_SOURCE_TABLES).flat(),
        ...Object.values(RHYTHM_TABLES),
      ])
    )

    const reads = await Promise.all(tables.map((t) => readTable(supabase, t, userId)))
    const byTable = new Map<string, TableRead>(tables.map((t, i) => [t, reads[i]]))

    // Every decision about what the rows MEAN lives in the pure fold, so the
    // honesty rules (unavailable is contagious within a practice; a next-step
    // answer is withheld when it is not knowable) are unit-tested rather than
    // reachable only through a live database.
    const fold = foldPracticeStatuses(Object.fromEntries(byTable))

    const rhythm = Object.fromEntries(
      Object.entries(RHYTHM_TABLES).map(([key, table]) => {
        const r = byTable.get(table)
        return [
          key,
          r
            ? { status: r.status, last_used_at: r.last_used_at, count: r.count }
            : { status: 'unavailable' as const, last_used_at: null, count: null },
        ]
      })
    )

    return NextResponse.json({
      practices: fold.practices,
      next_in_sequence: fold.next_in_sequence,
      next_basis: fold.next_basis,
      rhythm,
    })
  } catch (err) {
    console.error('practice-status API error:', err)
    logRouteError({ route: '/api/mentor/practice-status', method: 'GET', error: err, statusCode: 500 })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
