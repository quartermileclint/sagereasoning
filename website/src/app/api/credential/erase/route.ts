/**
 * POST /api/credential/erase — CI-14 Step 7: on-demand consumer-erasure-by-token.
 *
 * R17c genuine deletion for owner_kind='external_consumer' credentials (no profiles
 * account / no user-JWT). The consumer presents their own credential (or the admin
 * supplies its id) and this hard-deletes their per-consult trajectory + anonymises +
 * revokes the credential row, retaining the by-law billing/audit ledger.
 *
 * Dark behind SUBSTRATE_CONSUMER_ERASURE_ENABLED (UNSET ⇒ 503). The implementation +
 * its injectable deps live in ./handler (route.ts may export ONLY HTTP handlers — Next
 * route-export validation; memory `nextjs-route-export-validation`).
 */
import { NextRequest } from 'next/server'
import { checkRateLimit, RATE_LIMITS } from '@/lib/security'
import { runConsumerErasure, consumerErasurePreflight } from './handler'

export async function POST(request: NextRequest) {
  // Tight data-rights rate limit (5/hour) — same config the sibling GDPR routes use
  // (/api/user/access, /api/user/rectify). Bounds enumeration of the token-acceptance
  // surface + cheap-DoS on this deletion path. (In-memory per-instance, like every
  // rate-limited route here — a proportionate soft cap, not a global guarantee.)
  const rateLimited = checkRateLimit(request, RATE_LIMITS.dataRights)
  if (rateLimited) return rateLimited
  return runConsumerErasure(request)
}

export async function OPTIONS() {
  return consumerErasurePreflight()
}
