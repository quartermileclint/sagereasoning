/**
 * /api/practice/completion-signal — the ATRF completion-signal return path
 * (GS-ATRF-3, RULED 2026-08-23). DARK behind SUBSTRATE_COMPLETION_SIGNAL_ENABLED
 * (UNSET ⇒ 503).
 *
 * The implementation + its injectable deps live in ./handler (route.ts may
 * export ONLY HTTP handlers — Next route-export validation; memory
 * `nextjs-route-export-validation`, and the standing lesson that `tsc --noEmit`
 * does NOT catch this — only `npm run build` does).
 *
 * Rate-limit bucket: publicAgent (30/min/IP), matching the fresh/watching/
 * discernment siblings — deliberately NEVER `scoring`, which is IP-shared with
 * /api/reason and would couple this surface to the measured instrument (memory
 * `rate-limit-bucket-couples-to-measured-surface`).
 */
import { NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runCompletionSignalPost, completionSignalPreflight } from './handler'

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimited) return rateLimited
  return runCompletionSignalPost(request)
}

export async function OPTIONS() {
  return completionSignalPreflight()
}
