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
// Trust Layer S1 (2026-07-08) — portability (R17i) of the operator's trust events
// + state. Missing-table-benign (the migration is its own founder-walked step).
import { getTrustDataForOwner } from '@/lib/substrate/trust-core/trust-core-store'
import { getCollaborationDataForOwner } from '@/lib/substrate/trust-core/collaboration-store'
import { getProvenanceDataForOwner } from '@/lib/substrate/trust-core/provenance-ledger-store'
import {
  getWatchingDataForOwner,
  getCompletionSignalsForOwner,
} from '@/lib/substrate/idea-loop-watching-store'
// Trust Layer S10 rider (R17i, 2026-07-12) — portability of the operator's agents'
// reflect sessions (agent_id-keyed; owner→agent_ids resolution mirrors /api/user/delete).
import { getAgentSessionsForExport } from '@/lib/sage-reflect/session-store'
// Stoa ST2 (R17i, 2026-08-03) — portability of the practitioner's Stoa entries
// (owner_user_id-keyed standing declarations). Missing-table-benign.
import { getStoaDataForOwner, getStoaDataForCredentials } from '@/lib/stoa/stoa-store'

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
    // The nightly evening review (/reflect). Distinct from `oikeiosis_reflections`
    // (the quarterly circle diagnostic) — different table, different practice.
    { key: 'reflections', table: 'reflections', select: '*' },
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
    // Remaining Principles #10-human — the reserve-clause practitioner tool.
    { key: 'reserve_clause_entries', table: 'reserve_clause_entries', select: '*' },
    // Remaining Principles #9 + #13 — the view-from-above practitioner tool.
    { key: 'view_from_above_entries', table: 'view_from_above_entries', select: '*' },
    // Remaining Principles #8 — the morning-preparation practitioner tool.
    { key: 'morning_preparation_entries', table: 'morning_preparation_entries', select: '*' },
    // Remaining Principles #6 + #15 — the circle-extension practice (on /oikeiosis).
    { key: 'circle_extension_entries', table: 'circle_extension_entries', select: '*' },
    // Remaining Principles #14 — the sage-compass decision-support tool.
    { key: 'sage_compass_entries', table: 'sage_compass_entries', select: '*' },
    // S7 — the primal-impulse examination tool (/impulse). R17b intimate.
    { key: 'impulse_entries', table: 'impulse_entries', select: '*' },
    // Earned virtue milestones — user_id-scoped (was missing from R17i coverage).
    { key: 'milestones', table: 'milestones', select: '*' },
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

  // 2c. Trust Layer S1 (R17i) — the operator's trust events + materialised state,
  //     keyed by owner_user_id. Structural facts (no encrypted prose). Missing-table
  //     benign, so the Live export route does not break before the migration lands.
  {
    const trustExport = await getTrustDataForOwner(userId)
    if (!trustExport.ok) {
      exportData.agent_trust_events = { error: trustExport.error }
      exportData.agent_trust_state = { error: trustExport.error }
    } else {
      exportData.agent_trust_events = trustExport.value.events
      exportData.agent_trust_state = trustExport.value.state
    }
  }

  // 2d. Trust Layer S5 (R17i) — the operator's collaboration records, keyed by
  //     owner_user_id. Structural facts (no encrypted prose). Missing-table benign.
  {
    const collabExport = await getCollaborationDataForOwner(userId)
    if (!collabExport.ok) {
      exportData.collaboration_records = { error: collabExport.error }
    } else {
      exportData.collaboration_records = collabExport.value
    }
  }

  // 2e. Provenance-ledger slice 1 (R17i) — the operator's signature-keyed
  //     ledger entries + coverage-gap records, keyed by owner_user_id.
  //     Structural facts (no signature, no artifact detail — F-2's hard
  //     exclusion). Missing-table benign until the two migrations land.
  {
    const provenanceExport = await getProvenanceDataForOwner(userId)
    if (!provenanceExport.ok) {
      exportData.agent_provenance_ledger = { error: provenanceExport.error }
      exportData.agent_provenance_gaps = { error: provenanceExport.error }
    } else {
      exportData.agent_provenance_ledger = provenanceExport.value.ledger
      exportData.agent_provenance_gaps = provenanceExport.value.gaps
    }
  }

  // 2d-iii. watching (agent-circles, R17i, ruled §2.7) — the operator's IDEA-loop
  //         cycle records with their candidate rows, keyed by owner_user_id.
  //         Missing-table-benign until the watching migration lands.
  {
    const watchingExport = await getWatchingDataForOwner(userId)
    if (!watchingExport.ok) {
      exportData.idea_loop_cycles = { error: watchingExport.error }
    } else {
      exportData.idea_loop_cycles = watchingExport.value
    }
  }

  // 2d-iv. ATRF completion signals (GS-ATRF-3, R17i) — the AGENT's own
  //        post-execution reports, keyed by owner_user_id. A separate export key
  //        from idea_loop_cycles deliberately: the two carry DIFFERENT actors'
  //        identities (the runner's and the agent's), and folding the agent's
  //        report into the runner's cycle export would obscure that.
  //        Missing-table-benign until the completion-signal migration lands.
  {
    const signalsExport = await getCompletionSignalsForOwner(userId)
    if (!signalsExport.ok) {
      exportData.idea_loop_completion_signals = { error: signalsExport.error }
    } else {
      exportData.idea_loop_completion_signals = signalsExport.value
    }
  }

  // 2d-ii. Stoa ST2 (R17i, 2026-08-03) — the practitioner's Stoa entries, keyed
  //        by owner_user_id (standing declarations, #24 — no sweep covers them,
  //        so the export is their portability surface). Missing-table-benign.
  {
    const stoaExport = await getStoaDataForOwner(userId)
    if (!stoaExport.ok) {
      exportData.stoa_entries = { error: stoaExport.error }
    } else {
      exportData.stoa_entries = stoaExport.value
    }
    // PR19 fold F3 (2026-08-03): agent entries declared under this user's
    // owned credentials are owner-NULL by the identity XOR, yet the operator
    // is the accountable declarer (the ST4 design) — so they belong in the
    // Art 20 copy too. Keyed by credential_ref, exactly.
    const { data: credRows, error: credError } = await supabaseAdmin
      .from('api_keys')
      .select('id')
      .eq('owner_user_id', userId)
    if (credError) {
      exportData.stoa_agent_entries = { error: credError.message }
    } else {
      const refs = ((credRows ?? []) as { id: string }[]).map((r) => `api_key:${r.id}`)
      const agentStoa = await getStoaDataForCredentials(refs)
      exportData.stoa_agent_entries = agentStoa.ok ? agentStoa.value : { error: agentStoa.error }
    }
  }

  // 2e. Trust Layer S10 rider (R17i, 2026-07-12) — the operator's agents' reflect
  //     sessions. sage_reflect_sessions is keyed by agent_id, so resolve this
  //     user's credential-bound agent_ids from api_keys (the /api/user/delete S9b
  //     precedent, same scoping) and export each agent's rows with the R17b
  //     response history DECRYPTED for the data subject (Art 20 usable form —
  //     the intimate-mentor-store precedent below). Fail-collected per agent;
  //     a decrypt failure degrades to an honest per-row marker in the store.
  //     DISCLOSED BOUNDARY (S10 review, carried): sage_reflect_sessions carries
  //     no owner column and agent_id is NOT owner-unique (the UPC uniqueness is
  //     the (owner, agent) PAIR), so if two owners ever hold the same agent_id
  //     this export — like the shipped delete precedent above it — is scoped by
  //     agent_id alone. Zero exposure today (pre-0h, single operator); the
  //     owner-scoping schema step is a named register item gating any external
  //     multi-tenant onboarding.
  {
    const { data: keyRows, error: keysError } = await supabaseAdmin
      .from('api_keys')
      .select('agent_id')
      .eq('owner_user_id', userId)
      .not('agent_id', 'is', null)
    if (keysError) {
      exportData.sage_reflect_sessions = { error: `agent resolution: ${keysError.message}` }
    } else {
      const agentIds = [...new Set(((keyRows ?? []) as { agent_id: string }[]).map((r) => r.agent_id))]
      const reflectSessions: Record<string, unknown> = {}
      for (const agentId of agentIds) {
        const sessions = await getAgentSessionsForExport(agentId)
        if (!sessions.ok) {
          // Missing-table benign (pre-migration environments): mirror the 2a loop.
          if (sessions.error.includes('does not exist')) continue
          reflectSessions[agentId] = { error: sessions.error }
        } else if (sessions.value.length > 0) {
          reflectSessions[agentId] = sessions.value
        }
      }
      exportData.sage_reflect_sessions = reflectSessions
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
