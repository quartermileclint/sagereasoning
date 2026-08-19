/**
 * /api/practice/fresh — the IDEA loop's novelty-check endpoint (agent-circles,
 * 2026-08-09). FLAG-GATED behind SUBSTRATE_FRESH_ENABLED (unset ⇒ 503).
 * CORRECTED 2026-08-19: this line read "DARK behind SUBSTRATE_FRESH_ENABLED",
 * false since 2026-08-10 — the flag was activated and live-verified in
 * production at D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10. THIS ROUTE IS
 * LIVE. (Found by PR19 review: the same session's correction pass fixed the
 * handler, the types module, and the battery, and missed the route wrapper of
 * the very route it was correcting — four independent review dimensions
 * converged on it.)
 *
 * The implementation + its injectable deps live in ./handler (route.ts may
 * export ONLY HTTP handlers — Next route-export validation; memory
 * `nextjs-route-export-validation`).
 *
 * Rate-limit bucket: publicAgent (30/min/IP), matching the discernment
 * sibling — deliberately NEVER `scoring`, which is IP-shared with /api/reason
 * and would couple this surface to the measured instrument (memory
 * `rate-limit-bucket-couples-to-measured-surface`; ruled §2.6).
 */
import { NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runFreshPost, freshPreflight } from './handler'

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimited) return rateLimited
  return runFreshPost(request)
}

export async function OPTIONS() {
  return freshPreflight()
}
