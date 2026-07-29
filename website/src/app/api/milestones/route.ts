import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-server'
import { checkNewMilestones } from '@/lib/milestones'
import { buildV3MilestoneCheckData } from '@/lib/milestone-check-data'
import { checkRateLimit, RATE_LIMITS, requireAuth } from '@/lib/security'

/** True when the error means "this table does not exist yet" — the same
 *  missing-table-benign / missing-column-never-benign discipline used
 *  throughout substrate (agent-assessment-history-store.ts, trust-core-store.ts,
 *  collaboration-store.ts). Copied rather than imported: those are substrate
 *  modules, this route isn't, and this repo's established convention is a
 *  local copy per module, not a shared cross-domain export. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return false
  const msg = error.message ?? ''
  if (/column/i.test(msg)) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

/**
 * GET /api/milestones
 * Returns the user's earned milestones.
 *
 * POST /api/milestones
 * Checks for newly earned milestones and awards them.
 * Called after evaluating an action (score flow) and on dashboard load
 * (retroactive catch-up from stored history). Idempotent — awarding upserts
 * on the UNIQUE(user_id, milestone_id) constraint and `checkNewMilestones`
 * filters against already-earned ids, so a repeat call is a no-op.
 *
 * Both handlers authenticate via `Authorization: Bearer <supabase-jwt>` only
 * (`getAuthenticatedUser` accepts no other credential source). Callers must
 * use `authFetch`, never a bare `fetch` — a bare fetch 401s silently.
 *
 * Phase 0 of the human practice-reminders build plan
 * (operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md §5).
 */

export async function GET(request: NextRequest) {
  // Named follow-up from the Phase 1 independent review (PR19, 2026-07-27):
  // this route shared /api/reason's scoring bucket while firing on every
  // dashboard mount (a read) and every evaluation save (an award check) —
  // neither is a scoring call, so ordinary browsing could throttle the
  // measured instrument. Isolated to `analytics`, the same bucket
  // /api/mentor/practice-status already uses for the identical reason.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.analytics)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const userId = auth.user.id

  const { data: milestones, error } = await supabaseAdmin
    .from('milestones')
    .select('*')
    .eq('user_id', userId)
    .order('earned_at', { ascending: true })

  if (error) {
    if (isMissingTableError(error)) {
      // Table might not exist yet — return empty array gracefully
      return NextResponse.json({ milestones: [] })
    }
    // Independent-review fold (HIGH, 2026-07-29): a genuine DB error (transient
    // network failure, RLS misconfiguration, connection-pool exhaustion, ...)
    // used to degrade to the same 200 { milestones: [] } as a missing table —
    // indistinguishable from an honest zero-earned new user, and it defeated
    // MilestonesDisplay's own loadFailed state (res.ok was true). Fail honest,
    // matching the POST handler's already-correct discipline three lines below.
    console.error('Failed to read milestones:', error)
    return NextResponse.json({ error: 'Failed to load milestones' }, { status: 500 })
  }

  return NextResponse.json({ milestones: milestones || [] })
}

export async function POST(request: NextRequest) {
  // Named follow-up from the Phase 1 independent review (PR19, 2026-07-27):
  // this route shared /api/reason's scoring bucket while firing on every
  // dashboard mount (a read) and every evaluation save (an award check) —
  // neither is a scoring call, so ordinary browsing could throttle the
  // measured instrument. Isolated to `analytics`, the same bucket
  // /api/mentor/practice-status already uses for the identical reason.
  const rateLimitError = checkRateLimit(request, RATE_LIMITS.analytics)
  if (rateLimitError) return rateLimitError
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const userId = auth.user.id

  // Gather all data needed for V3 milestone checks in parallel
  const [
    earnedRes,
    evalsRes,
    reflectionsRes,
    baselineV3Res,
    journalRes,
  ] = await Promise.all([
    supabaseAdmin.from('milestones').select('milestone_id').eq('user_id', userId),
    // V3 evaluations
    supabaseAdmin.from('action_evaluations_v3')
      .select('katorthoma_proximity, passions_detected, oikeiosis_context, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin.from('reflections')
      .select('id')
      .eq('user_id', userId),
    // V3 baseline. `maybeSingle` (not `single`) so that "no baseline yet" is a
    // null row rather than a PGRST116 error — which lets a genuine query failure
    // below be distinguished from the ordinary no-baseline case.
    supabaseAdmin.from('baseline_assessments_v3')
      .select('senecan_grade')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Journal entries. Row existence IS completion — there is no status flag, and
    // UNIQUE(user_id, day_number) guarantees one row per day. Local-storage users
    // are deliberately NOT filtered out: they still get a row (with
    // reflection_text = '__local__') precisely so their practice is recorded.
    // `reflection_text` is intimate, R20a-screened prose and is never selected here.
    supabaseAdmin.from('journal_entries')
      .select('day_number, created_at')
      .eq('user_id', userId),
  ])

  // Fail honest, never silently under-award. A load-bearing query that errors would
  // otherwise degrade to an empty array and quietly withhold milestones the record
  // supports — the same false-benign class as the reflect-completion schema drift
  // (2026-06-18) and the AE-2 `isMissingTableError` finding. `milestones` itself is
  // excluded: an unreadable earned-list would risk re-awarding, so it is fatal too.
  const loadBearing: Array<[string, { error: unknown } ]> = [
    ['milestones', earnedRes],
    ['action_evaluations_v3', evalsRes],
    ['reflections', reflectionsRes],
    ['baseline_assessments_v3', baselineV3Res],
    ['journal_entries', journalRes],
  ]
  const failed = loadBearing.filter(([, res]) => res.error).map(([name]) => name)
  if (failed.length > 0) {
    console.error('Milestone check-data incomplete; refusing to award. Failed sources:', failed,
      loadBearing.filter(([, res]) => res.error).map(([, res]) => res.error))
    return NextResponse.json({
      new_milestones: [],
      all_milestones: (earnedRes.data || []).map(m => m.milestone_id),
      check_data_incomplete: failed,
    })
  }

  const earnedMilestoneIds = (earnedRes.data || []).map(m => m.milestone_id)

  const checkData = buildV3MilestoneCheckData({
    earnedMilestoneIds,
    hasBaseline: !!baselineV3Res.data,
    senecanGrade: baselineV3Res.data?.senecan_grade,
    evaluations: evalsRes.data || [],
    reflectionCount: (reflectionsRes.data || []).length,
    journalEntries: journalRes.data || [],
  })

  const newMilestoneIds = checkNewMilestones(checkData)

  if (newMilestoneIds.length === 0) {
    return NextResponse.json({ new_milestones: [], all_milestones: earnedMilestoneIds })
  }

  // Insert new milestones (V3: no V1 score snapshot needed)
  const inserts = newMilestoneIds.map(milestoneId => ({
    user_id: userId,
    milestone_id: milestoneId,
  }))

  const { error: insertError } = await supabaseAdmin
    .from('milestones')
    .upsert(inserts, { onConflict: 'user_id,milestone_id' })

  if (insertError) {
    // Honest: report that the award attempt failed rather than returning a bare
    // empty list, which a caller cannot distinguish from "nothing new to award".
    console.error('Failed to insert milestones:', insertError)
    return NextResponse.json({
      new_milestones: [],
      all_milestones: earnedMilestoneIds,
      award_failed: true,
    })
  }

  return NextResponse.json({
    new_milestones: newMilestoneIds,
    all_milestones: [...earnedMilestoneIds, ...newMilestoneIds],
  })
}
