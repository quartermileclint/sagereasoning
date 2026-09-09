/**
 * GET /api/cron/cognitive-os-retention-sweep - R17c retention enforcement for
 * the Cognitive OS core slice (cognitive_contexts, cognitive_events,
 * cognitive_claims, cognitive_belief_states).
 *
 * All four tables carry a 90-day `retain_until`. For a context keyed only by
 * credential_ref - no owner_user_id - this sweep and the on-demand
 * /api/credential/erase are the ONLY deletion mechanisms, because such rows are
 * unreachable by the user-JWT data-rights paths. NOTHING enforces retention
 * without this cron.
 *
 * The handler and its testable dependency seam live in ./handler.ts: a Next.js
 * route.ts may export ONLY the method handlers and route-segment config.
 */
import { NextRequest, NextResponse } from 'next/server'
import { runCognitiveOsRetentionSweep } from './handler'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest): Promise<NextResponse> {
  return runCognitiveOsRetentionSweep(request)
}
