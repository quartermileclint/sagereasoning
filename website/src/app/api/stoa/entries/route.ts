/**
 * GET /api/stoa/entries — browse The Stoa (ST3).
 *
 * The colonnade's serving list. DARK behind SUBSTRATE_STOA_ENABLED (503
 * flag-off — honest, zero work; ST5 is the activation walk).
 *
 * Scope (#1/#2, Q1/Q4a):
 *   - unauthenticated        → PUBLIC entries only
 *   - authenticated (JWT)    → COMMUNITY scope (all active entries: an
 *     authenticated practitioner is "present in the space" and sees both
 *     community-scoped and public declarations). ST4 adds the
 *     practice-credential presence arm for agents.
 *
 * NO RECIPROCITY GATE (#3): consulting the list never requires declaring —
 * nothing here reads whether the viewer has an entry.
 *
 * Ordering (#8): declaration recency, served VERBATIM from the store — no
 * re-sort exists in this route (battery-pinned). Search + tag filter (#9) are
 * FILTERS: they narrow, never reorder.
 *
 * R20a / AC5 recorded decision (ST3 2026-08-03, the other half): this route
 * takes NO human free text — query params only (tag / q / limit / offset) —
 * so it sits OUTSIDE the distress perimeter by the r20a-invocation-guard
 * precedent. The declaration route (/api/mentor/stoa) is the perimeter
 * member.
 *
 * NO engagement capture (#23): nothing here counts, records, or persists
 * views or queries beyond the site's standard operational logging.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkRateLimit, getAuthenticatedUser } from '@/lib/security'
import { isStoaEnabled, listStoaEntries, STOA_READ_RATE_LIMIT } from '@/lib/stoa/stoa-store'
import { presentStoaEntries, filterStoaEntriesByQuery } from '@/lib/stoa/stoa-presentation'

export async function GET(request: NextRequest) {
  // Flag first (PR19 fold): flag-off production does no work at all —
  // not even a rate-bucket increment.
  if (!isStoaEnabled()) {
    return NextResponse.json({ error: 'The Stoa is not yet open.' }, { status: 503 })
  }
  const rateLimitError = checkRateLimit(request, STOA_READ_RATE_LIMIT)
  if (rateLimitError) return rateLimitError

  try {
    // Presence check only — never a gate (#3). A signed-in practitioner sees
    // the community scope; anyone else sees public entries.
    const user = await getAuthenticatedUser(request)
    const scope: 'public' | 'community' = user ? 'community' : 'public'

    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')?.trim() || undefined
    const q = searchParams.get('q')?.trim() || ''
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '50', 10) || 50), 200)
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0)

    const listed = await listStoaEntries({ scope, tag, limit, offset })
    if (!listed.ok) {
      console.error('Stoa list error:', listed.error)
      return NextResponse.json({ error: 'Failed to read the colonnade' }, { status: 500 })
    }

    // Text search is a FILTER over declared fields — order preserved (#8/#9).
    // DISCLOSED BOUND (PR19, 2026-08-03): the filter runs over the fetched
    // page (post-pagination), so a search can miss matches in later pages
    // and `capped` describes the pre-filter page. Correct once the colonnade
    // outgrows one page a store-level search is the fix; at current scale
    // (limit up to 200) the whole space fits one page.
    const filtered = q ? filterStoaEntriesByQuery(listed.value.entries, q) : listed.value.entries

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const entries = await presentStoaEntries(admin, filtered)

    return NextResponse.json({
      scope,
      entries,
      capped: listed.value.capped,
    })
  } catch (err) {
    console.error('Stoa entries API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
