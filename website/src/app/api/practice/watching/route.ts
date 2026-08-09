/**
 * /api/practice/watching — the IDEA loop's per-cycle record write (agent-circles,
 * 2026-08-09). DARK behind SUBSTRATE_WATCHING_ENABLED (UNSET ⇒ 503).
 *
 * The implementation + its injectable deps live in ./handler (route.ts may
 * export ONLY HTTP handlers — Next route-export validation; memory
 * `nextjs-route-export-validation`).
 *
 * Rate-limit bucket: publicAgent (30/min/IP), matching the fresh/discernment
 * siblings — deliberately NEVER `scoring`, which is IP-shared with /api/reason
 * and would couple this surface to the measured instrument (memory
 * `rate-limit-bucket-couples-to-measured-surface`).
 */
import { NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runWatchingPost, watchingPreflight } from './handler'

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimited) return rateLimited
  return runWatchingPost(request)
}

export async function OPTIONS() {
  return watchingPreflight()
}
