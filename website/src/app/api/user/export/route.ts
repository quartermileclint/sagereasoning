/**
 * GET /api/user/export
 *
 * Returns all personal data held for the authenticated user as a JSON download.
 * Satisfies the Australian Privacy Act right to access personal information
 * and GDPR Article 20 right to data portability.
 *
 * Rules: R17 (data protection)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'

export async function OPTIONS() {
  return corsPreflightResponse()
}

export async function GET(request: NextRequest) {
  // 1. Authenticate the user
  const auth = await requireAuth(request)
  if (auth.error) return auth.error

  const userId = auth.user.id
  const exportData: Record<string, unknown> = {
    export_metadata: {
      exported_at: new Date().toISOString(),
      user_id: userId,
      email: auth.user.email,
      format_version: '1.0',
      description: 'Complete personal data export from SageReasoning',
    },
  }

  // 2. Query all user data tables
  // Each query is independent — failures in one table don't block others
  const tables = [
    { key: 'profile', table: 'profiles', select: '*' },
    { key: 'evaluations', table: 'action_evaluations_v3', select: '*' },
    { key: 'baseline_assessments', table: 'baseline_assessments_v3', select: '*' },
    { key: 'journal_entries', table: 'journal_entries', select: '*' },
    { key: 'deliberation_chains', table: 'deliberation_chains', select: '*' },
    { key: 'deliberation_steps', table: 'deliberation_steps', select: '*' },
    { key: 'location', table: 'user_locations', select: '*' },
    { key: 'analytics_events', table: 'analytics_events', select: '*' },
  ]

  for (const { key, table, select } of tables) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select(select)
      .eq('user_id', userId)

    if (error && !error.message.includes('does not exist')) {
      exportData[key] = { error: error.message }
    } else {
      exportData[key] = data || []
    }
  }

  // 3. Return as a JSON file download
  const jsonString = JSON.stringify(exportData, null, 2)
  const headers = {
    ...corsHeaders(),
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="sagereasoning-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
  }

  return new NextResponse(jsonString, { status: 200, headers })
}
