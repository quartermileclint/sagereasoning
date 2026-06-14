/**
 * GET /api/user/export
 *
 * Returns all personal data held for the authenticated user as a JSON download.
 * Satisfies the Australian Privacy Act right to access personal information
 * and GDPR Article 15 (access) + Article 20 (data portability).
 *
 * Coverage: the core reasoning/journal tables PLUS the full R17b intimate
 * mentor store. The two encrypted tables (mentor_profiles, mentor_baseline_appendix)
 * are DECRYPTED server-side so the export is in a usable form (Art 20 requires
 * portability in a usable format). Only the authenticated user can request their
 * own export, so the decrypted intimate content is disclosed only to its subject.
 *
 * Rules: R17 (data protection), R17b (encryption — decrypt-on-access for the subject)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, corsHeaders, corsPreflightResponse } from '@/lib/security'
import { supabaseAdmin } from '@/lib/supabase-server'
import { decryptProfileData, type ServerEncryptedPayload } from '@/lib/server-encryption'
// R17i (CI-5 / M6, 2026-06-14): export the per-consult agent trajectory keyed to
// the operator (owner_user_id = profiles.id = the auth user id).
import { getAssessmentHistoryForOwner } from '@/lib/substrate/agent-assessment-history-store'

export async function OPTIONS() {
  return corsPreflightResponse()
}

/**
 * Decrypt an at-rest encrypted field (ciphertext column + encryption_meta JSONB)
 * into its plaintext value, parsing JSON when possible. Mirrors the canonical
 * read pattern in mentor-profile-store.ts.
 */
function decryptStoredField(
  ciphertext: string,
  meta: { iv: string; authTag: string; algorithm: string; version: number }
): unknown {
  const payload: ServerEncryptedPayload = {
    ciphertext,
    iv: meta.iv,
    authTag: meta.authTag,
    algorithm: meta.algorithm as 'AES-256-GCM',
    version: meta.version,
  }
  const plaintext = decryptProfileData(payload)
  try {
    return JSON.parse(plaintext)
  } catch {
    return plaintext
  }
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
      format_version: '1.1',
      description:
        'Complete personal data export from SageReasoning, including the encrypted intimate mentor store (decrypted for the data subject).',
    },
  }

  // profiles is keyed by `id` (= the auth user id), NOT user_id — so it must be
  // queried separately; querying it by user_id returns an empty profile section.
  // (D-PROFILE-EXPORT-ACCESS-KEYING-FIX-2026-06-07 — completeness fix for the
  // Art 20 export + Art 15 access copy.)
  {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
    if (error && !error.message.includes('does not exist')) {
      exportData.profile = { error: error.message }
    } else {
      exportData.profile = data || []
    }
  }

  // 2. Query the core user-scoped tables (plaintext)
  // Each query is independent — failures in one table don't block others
  const tables = [
    { key: 'evaluations', table: 'action_evaluations_v3', select: '*' },
    { key: 'baseline_assessments', table: 'baseline_assessments_v3', select: '*' },
    { key: 'journal_entries', table: 'journal_entries', select: '*' },
    { key: 'deliberation_chains', table: 'deliberation_chains', select: '*' },
    { key: 'deliberation_steps', table: 'deliberation_steps', select: '*' },
    { key: 'location', table: 'user_locations', select: '*' },
    { key: 'analytics_events', table: 'analytics_events', select: '*' },
    // R17b intimate mentor store — user_id-scoped, plaintext
    // NOTE: realtime_journal_entries is handled separately below — its prose is
    // encrypted at rest (R17b) and must be decrypted for the subject (Art 20).
    { key: 'passion_events', table: 'passion_events', select: '*' },
    { key: 'premeditatio_entries', table: 'premeditatio_entries', select: '*' },
    { key: 'oikeiosis_reflections', table: 'oikeiosis_reflections', select: '*' },
    { key: 'founder_hub_entries', table: 'founder_hub_entries', select: '*' },
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

  // 2b. agent_assessment_history (CI-5 / M6) — keyed to owner_user_id
  //     (= profiles.id = this auth user id), so it is exported separately from the
  //     .eq('user_id') loop above. Structural trajectory facts (no encrypted prose
  //     — that lives in substrate_audit_narratives). A "does not exist" error is
  //     tolerated: the M6 migration is its own founder-elected step, and the Live
  //     export route must not break before it lands.
  {
    // The store classifies a not-yet-migrated table as benign empty
    // (isMissingTableError → ok:true, []), so only a REAL failure surfaces here.
    const aahExport = await getAssessmentHistoryForOwner(userId)
    if (!aahExport.ok) {
      exportData.agent_assessment_history = { error: aahExport.error }
    } else {
      exportData.agent_assessment_history = aahExport.value
    }
  }

  // 3. Encrypted intimate tables — decrypt for the data subject (Art 20 usable form).
  //    mentor_profiles is also the parent of the profile_id-scoped tables below,
  //    so we fetch it once and reuse its id(s).
  let profileIds: string[] = []
  {
    const { data, error } = await supabaseAdmin
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', userId)

    if (error && !error.message.includes('does not exist')) {
      exportData.mentor_profile = { error: error.message }
    } else {
      const rows = (data || []) as Array<Record<string, unknown>>
      profileIds = rows
        .map((r) => r.id)
        .filter((v): v is string => typeof v === 'string')
      exportData.mentor_profile = rows.map((row) => {
        const { encrypted_profile, encryption_meta, ...rest } = row
        try {
          return {
            ...rest,
            profile: decryptStoredField(
              encrypted_profile as string,
              encryption_meta as { iv: string; authTag: string; algorithm: string; version: number }
            ),
          }
        } catch (e) {
          return { ...rest, decryption_error: e instanceof Error ? e.message : String(e) }
        }
      })
    }
  }

  // mentor_baseline_appendix — user_id-scoped, encrypted_payload
  {
    const { data, error } = await supabaseAdmin
      .from('mentor_baseline_appendix')
      .select('*')
      .eq('user_id', userId)

    if (error && !error.message.includes('does not exist')) {
      exportData.mentor_baseline_appendix = { error: error.message }
    } else {
      const rows = (data || []) as Array<Record<string, unknown>>
      exportData.mentor_baseline_appendix = rows.map((row) => {
        const { encrypted_payload, encryption_meta, ...rest } = row
        try {
          return {
            ...rest,
            payload: decryptStoredField(
              encrypted_payload as string,
              encryption_meta as { iv: string; authTag: string; algorithm: string; version: number }
            ),
          }
        } catch (e) {
          return { ...rest, decryption_error: e instanceof Error ? e.message : String(e) }
        }
      })
    }
  }

  // 3b. realtime_journal_entries — R17b encrypted at rest; decrypt for the
  //     subject (Art 20 usable form). Falls back to the legacy plaintext
  //     columns for any pre-encryption row (leave-and-tolerate).
  {
    const { data, error } = await supabaseAdmin
      .from('realtime_journal_entries')
      .select('*')
      .eq('user_id', userId)

    if (error && !error.message.includes('does not exist')) {
      exportData.realtime_journal_entries = { error: error.message }
    } else {
      const rows = (data || []) as Array<Record<string, unknown>>
      exportData.realtime_journal_entries = rows.map((row) => {
        const {
          entry_ciphertext,
          entry_meta,
          impression,
          assent,
          action,
          ...rest
        } = row
        if (
          typeof entry_ciphertext === 'string' &&
          entry_ciphertext.length > 0 &&
          entry_meta &&
          typeof entry_meta === 'object'
        ) {
          try {
            const decoded = decryptStoredField(
              entry_ciphertext,
              entry_meta as { iv: string; authTag: string; algorithm: string; version: number }
            ) as { impression?: string; assent?: string; action?: string }
            return {
              ...rest,
              impression: decoded.impression ?? null,
              assent: decoded.assent ?? null,
              action: decoded.action ?? null,
            }
          } catch (e) {
            return { ...rest, decryption_error: e instanceof Error ? e.message : String(e) }
          }
        }
        // Legacy plaintext row (pre-encryption; founder/test only).
        return { ...rest, impression: impression ?? null, assent: assent ?? null, action: action ?? null }
      })
    }
  }

  // 4. Profile_id-scoped intimate tables (FK → mentor_profiles).
  //    These have no user_id column, so they are queried by the profile id(s)
  //    resolved above. If the user has no mentor profile, they are empty.
  const profileScopedTables = [
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

  for (const table of profileScopedTables) {
    if (profileIds.length === 0) {
      exportData[table] = []
      continue
    }
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('*')
      .in('profile_id', profileIds)

    if (error && !error.message.includes('does not exist')) {
      exportData[table] = { error: error.message }
    } else {
      exportData[table] = data || []
    }
  }

  // 5. Return as a JSON file download
  const jsonString = JSON.stringify(exportData, null, 2)
  const headers = {
    ...corsHeaders(),
    'Content-Type': 'application/json',
    'Content-Disposition': `attachment; filename="sagereasoning-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
  }

  return new NextResponse(jsonString, { status: 200, headers })
}
