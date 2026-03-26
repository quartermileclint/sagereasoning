/**
 * DELETE /api/user/delete
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Satisfies the Australian Privacy Act right to erasure.
 *
 * ── PLACEHOLDER ──────────────────────────────────────────────────────────────
 * TODO (Priority 9 — Phase 3): Implement this endpoint.
 *
 * Implementation checklist:
 *   1. Authenticate the user (requireAuth)
 *   2. Require a confirmation token in the request body (e.g. { confirm: "DELETE" })
 *      to prevent accidental deletion
 *   3. Delete from Supabase in this order (foreign key safe):
 *      a. analytics_events where user_id = auth.user.id
 *      b. action_scores where user_id = auth.user.id
 *      c. journal_entries where user_id = auth.user.id
 *      d. baseline_assessments where user_id = auth.user.id
 *      e. user_locations where user_id = auth.user.id
 *      f. profiles / user_metadata where user_id = auth.user.id
 *      g. supabase.auth.admin.deleteUser(auth.user.id) — requires service role key
 *   4. Sign the user out
 *   5. Return 200 with a confirmation message
 *   6. Complete within 30 days per Privacy Policy commitment
 *      (ideally: immediate deletion of all personal data)
 *
 * Security notes:
 *   - This is irreversible. Use Supabase row-level security to prevent deletion
 *     of other users' data.
 *   - Use supabaseAdmin (service role) for the auth.admin.deleteUser call only.
 *   - Log the deletion event (without PII) for compliance records.
 *
 * Estimated effort: 4–6 hours development + testing
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function DELETE(request: NextRequest) {
  // Auth check
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // ── PLACEHOLDER RESPONSE ──────────────────────────────────────────────────
  // This endpoint is not yet implemented. When ready, replace this response
  // with the full account deletion logic described in the TODO above.
  return NextResponse.json(
    {
      error: 'Account deletion is not yet available via API.',
      message:
        'This feature is in development. To delete your account now, please email support@sagereasoning.com with the subject "Account Deletion Request".',
      status: 'coming_soon',
    },
    { status: 503, headers: corsHeaders() }
  )
  // ─────────────────────────────────────────────────────────────────────────
}
