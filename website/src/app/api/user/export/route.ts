/**
 * GET /api/user/export
 *
 * Returns all personal data held for the authenticated user as a JSON download.
 * Satisfies the Australian Privacy Act right to access personal information.
 *
 * ── PLACEHOLDER ──────────────────────────────────────────────────────────────
 * TODO (Priority 9 — Phase 3): Implement this endpoint.
 *
 * Implementation checklist:
 *   1. Authenticate the user (requireAuth)
 *   2. Query Supabase for:
 *      - Account data (email, display_name, created_at)
 *      - All action_scores rows for this user
 *      - Baseline assessment result
 *      - Journal entries
 *      - Location data (if set)
 *      - Analytics events
 *   3. Return as a JSON file download with filename "sagereasoning-data-export.json"
 *   4. Log the export event in analytics
 *   5. Update Privacy Policy if the data fields change
 *
 * Estimated effort: 4–8 hours development
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function GET(request: NextRequest) {
  // Auth check
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // ── PLACEHOLDER RESPONSE ──────────────────────────────────────────────────
  // This endpoint is not yet implemented. When ready, replace this response
  // with the full data export logic described in the TODO above.
  return NextResponse.json(
    {
      error: 'Data export is not yet available.',
      message:
        'This feature is in development. To request your data now, please email support@sagereasoning.com.',
      status: 'coming_soon',
    },
    { status: 503, headers: corsHeaders() }
  )
  // ─────────────────────────────────────────────────────────────────────────
}
