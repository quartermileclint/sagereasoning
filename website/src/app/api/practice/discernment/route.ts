/**
 * /api/practice/discernment — Trust Layer S8: the reference harness's server
 * seam (spawn-time discernment + L4 audit; hand-back A8/A9 events; the standing
 * trust-verdict read). DARK behind SUBSTRATE_TRUST_CORE_ENABLED (UNSET ⇒ 503).
 *
 * The implementation + its injectable deps live in ./handler (route.ts may
 * export ONLY HTTP handlers — Next route-export validation; memory
 * `nextjs-route-export-validation`).
 */
import { NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runDiscernmentPost, runDiscernmentGet, discernmentPreflight } from './handler'

export async function POST(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimited) return rateLimited
  return runDiscernmentPost(request)
}

export async function GET(request: NextRequest) {
  const rateLimited = checkRateLimit(request, RATE_LIMITS.publicAgent)
  if (rateLimited) return rateLimited
  return runDiscernmentGet(request)
}

export async function OPTIONS() {
  return discernmentPreflight()
}
