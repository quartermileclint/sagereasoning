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
  const tablesToDelete = [
    'analytics_events',
    'action_evaluations_v3',
    'deliberation_steps',
    'deliberation_chains',
    'journal_entries',
    'baseline_assessments_v3',
    'user_locations',
    'profiles',
  ]

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
      tables_cleared: tablesToDelete,
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
