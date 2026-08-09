/**
 * /api/founder/watching — the founder's per-cycle record read (agent-circles
 * `watching`, 2026-08-09). DARK behind SUBSTRATE_WATCHING_ENABLED (UNSET ⇒ 503).
 * FOUNDER_USER_ID Bearer JWT gate (the founder-hub pattern) — see ./handler.
 *
 * route.ts may export ONLY HTTP handlers (Next route-export validation; memory
 * `nextjs-route-export-validation`).
 *
 * Rate-limit bucket: admin (the founder-hub sibling's bucket) — never `scoring`
 * (memory `rate-limit-bucket-couples-to-measured-surface`).
 */
import { NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runFounderWatchingGet } from './handler'

export async function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.admin)
  if (rateLimited) return rateLimited
  return runFounderWatchingGet(request)
}
