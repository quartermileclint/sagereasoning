/**
 * DELETE /api/user/delete
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Satisfies the Australian Privacy Act right to erasure and GDPR right to be forgotten.
 *
 * Rules: R17c (genuine deletion, not soft-delete)
 *
 * Security:
 *   - Requires valid auth session
 *   - Requires explicit confirmation token { confirm: "DELETE" }
 *   - Uses supabaseAdmin (service role) for auth.admin.deleteUser only
 *   - Deletes in foreign-key-safe order
 *   - Logs deletion event without PII for compliance audit trail
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'
// R17c (CI-5 / M6, 2026-06-14): genuine deletion of the per-consult agent
// trajectory keyed to the operator (owner_user_id = profiles.id = the auth user
// id, per resolveProfileId's handle_new_user invariant).
import { deleteAssessmentHistoryForOwner } from '@/lib/substrate/agent-assessment-history-store'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function DELETE(request: NextRequest) {
  // 1. Authenticate the user
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  // 2. Require explicit confirmation token to prevent accidental deletion
  let body: { confirm?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Request body must be JSON with { "confirm": "DELETE" }' },
      { status: 400, headers: corsHeaders() }
    )
  }

  if (body.confirm !== 'DELETE') {
    return NextResponse.json(
      {
        error: 'Confirmation required.',
        message: 'To permanently delete your account, send { "confirm": "DELETE" } in the request body. This action is irreversible.',
      },
      { status: 400, headers: corsHeaders() }
    )
  }

  const userId = auth.user.id
  const deletionErrors: string[] = []

  // 3. Delete user data in foreign-key-safe order
  // Each deletion is attempted independently so partial failures don't block the rest.
  // Tables that may not exist yet are handled gracefully.
  //
  // The R17b intimate mentor store is deleted EXPLICITLY here (belt-and-braces).
  // Every one of these tables already declares ON DELETE CASCADE to auth.users,
  // so step 4 (auth.admin.deleteUser) would remove them automatically — but
  // explicit removal means erasure no longer depends on that cascade and survives
  // any future FK change. Deleting `mentor_profiles` cascade-removes its nine
  // profile_id-scoped children (see cascadeClearedViaMentorProfile below), which
  // are NOT user_id-scoped and therefore cannot be deleted by the .eq('user_id')
  // pattern used here.
  // FK-safe order: tables that reference another are listed before the table they
  // reference (premeditatio/oikeiosis → passion_events → realtime_journal_entries).
  const tablesToDelete = [
    'analytics_events',
    'action_evaluations_v3',
    'deliberation_steps',
    'deliberation_chains',
    'journal_entries',
    'baseline_assessments_v3',
    'premeditatio_entries',      // R17b intimate; → passion_events
    'oikeiosis_reflections',     // R17b intimate; → passion_events
    'passion_events',            // R17b intimate; → realtime_journal_entries
    'realtime_journal_entries',  // R17b intimate
    'mentor_baseline_appendix',  // R17b intimate (encrypted)
    'mentor_profiles',           // R17b intimate (encrypted); cascades profile_id-scoped children
    'founder_hub_entries',       // R17b intimate (founder hub)
    'user_locations',
    'profiles',
  ]

  // Tables removed transitively by the mentor_profiles delete above. They are
  // profile_id-scoped (FK → mentor_profiles, ON DELETE CASCADE), so deleting the
  // parent clears them. Named here only so the compliance audit log honestly
  // reflects everything that was cleared — not only the explicitly-issued deletes.
  const cascadeClearedViaMentorProfile = [
    'mentor_interactions',
    'mentor_profile_snapshots',
    'mentor_journal_refs',
    'mentor_observations_structured',
    'mentor_passion_map',
    'mentor_causal_tendencies',
    'mentor_value_hierarchy',
    'mentor_oikeiosis_map',
    'mentor_virtue_profile',
  ]

  // R17c — agent_assessment_history (CI-5 / M6) is keyed to owner_user_id
  // (= profiles.id = this auth user id), NOT user_id, so it cannot ride the
  // .eq('user_id') loop below. Deleted EXPLICITLY here, BEFORE the profiles row
  // (whose ON DELETE CASCADE is the FK backstop), so erasure is genuine +
  // verifiable and survives any future FK change (the route's belt-and-braces
  // posture). A "does not exist" error is tolerated — the M6 migration is its own
  // founder-elected step, so the Live delete route must not 207 before it lands.
  {
    // The store classifies a not-yet-migrated table as benign success
    // (isMissingTableError), so only a REAL failure surfaces here (ok:false).
    const aahDelete = await deleteAssessmentHistoryForOwner(userId)
    if (!aahDelete.ok) {
      deletionErrors.push(`agent_assessment_history: ${aahDelete.error}`)
    }
  }

  for (const table of tablesToDelete) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('user_id', userId)

    if (error && !error.message.includes('does not exist')) {
      deletionErrors.push(`${table}: ${error.message}`)
    }
  }

  // 4. Delete the auth user (requires service role)
  const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (authDeleteError) {
    deletionErrors.push(`auth.deleteUser: ${authDeleteError.message}`)
  }

  // 5. Log the deletion event for compliance (no PII — just the fact it happened)
  // Logging failure is non-blocking — the deletion still succeeds
  try {
    await supabaseAdmin.from('compliance_deletion_log').insert({
      event: 'account_deleted',
      timestamp: new Date().toISOString(),
      tables_cleared: [...tablesToDelete, ...cascadeClearedViaMentorProfile, 'agent_assessment_history'],
      errors: deletionErrors.length > 0 ? deletionErrors : null,
    })
  } catch {
    // Ignore logging errors
  }

  // 6. Return result
  if (deletionErrors.length > 0) {
    return NextResponse.json(
      {
        status: 'partial_deletion',
        message: 'Account deletion partially completed. Some data may require manual removal. Contact support@sagereasoning.com if needed.',
        errors: deletionErrors,
      },
      { status: 207, headers: corsHeaders() }
    )
  }

  return NextResponse.json(
    {
      status: 'deleted',
      message: 'Your account and all associated data have been permanently deleted. This action cannot be undone.',
    },
    { status: 200, headers: corsHeaders() }
  )
}
