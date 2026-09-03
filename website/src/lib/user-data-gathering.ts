/**
 * user-data-gathering.ts
 *
 * Shared helper that gathers ALL personal data held for a given user, with the
 * encrypted intimate mentor store decrypted into usable form for the data
 * subject. This is the single data-gathering path reused by the GDPR Article 15
 * access endpoint (/api/user/access, A15b).
 *
 * It is a faithful extraction of the data-gathering logic in
 * /api/user/export/route.ts (Art 20 portability). The export route is left
 * byte-identical this session (PR1 single-surface proof: the shared helper is
 * proven on /api/user/access first; migrating /export onto it is a separate,
 * lower-priority change to a Verified-live endpoint). The brief duplication is
 * intentional and flagged for a future consolidation.
 *
 * Rules: R17 (data protection), R17b (encryption — decrypt-on-access for the
 * subject), R17g (Article 15 access).
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import { decryptProfileData, type ServerEncryptedPayload } from '@/lib/server-encryption'
// Stoa ST2 (R17g/R17i, 2026-08-03) — the practitioner's Stoa entries in the
// Art 15 access copy (owner_user_id-keyed; missing-table-benign).
import { getStoaDataForOwner, getStoaDataForCredentials } from '@/lib/stoa/stoa-store'
import { pagedRows, pagedRangeSelect } from '@/lib/db/paged-select'

/**
 * Decrypt an at-rest encrypted field (ciphertext column + encryption_meta JSONB)
 * into its plaintext value, parsing JSON when possible. Mirrors the canonical
 * read pattern in mentor-profile-store.ts and the export route.
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

/**
 * Gather every user-scoped table for `userId`, decrypting the encrypted intimate
 * store for the subject. Each table query is independent — one table's failure
 * does not block the rest (the failing key carries an { error } marker instead).
 *
 * Returns a plain object keyed by table name. Does NOT include the response
 * metadata wrapper — the caller adds that (so the same gathered data can be
 * wrapped differently by the access vs. portability surfaces).
 */
export async function gatherUserPersonalData(
  userId: string
): Promise<Record<string, unknown>> {
  const data: Record<string, unknown> = {}

  // profiles is keyed by `id` (= the auth user id), NOT user_id — so it must be
  // queried separately; querying it by user_id returns an empty profile section.
  // (D-PROFILE-EXPORT-ACCESS-KEYING-FIX-2026-06-07 — completeness fix for the
  // Art 15 access copy + Art 20 export.)
  {
    const { data: rows, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
    if (error && !error.message.includes('does not exist')) {
      data.profile = { error: error.message }
    } else {
      data.profile = rows || []
    }
  }

  // 1. Core user-scoped tables (plaintext). Each query independent.
  const tables = [
    { key: 'evaluations', table: 'action_evaluations_v3' },
    { key: 'baseline_assessments', table: 'baseline_assessments_v3' },
    { key: 'journal_entries', table: 'journal_entries' },
    // The nightly evening review (/reflect). Distinct from `oikeiosis_reflections`
    // (the quarterly circle diagnostic) — different table, different practice.
    { key: 'reflections', table: 'reflections' },
    { key: 'deliberation_chains', table: 'deliberation_chains' },
    { key: 'deliberation_steps', table: 'deliberation_steps' },
    { key: 'location', table: 'user_locations' },
    { key: 'analytics_events', table: 'analytics_events' },
    // R17b intimate mentor store — user_id-scoped, plaintext
    { key: 'passion_events', table: 'passion_events' },
    { key: 'premeditatio_entries', table: 'premeditatio_entries' },
    { key: 'oikeiosis_reflections', table: 'oikeiosis_reflections' },
    { key: 'founder_hub_entries', table: 'founder_hub_entries' },
    // Remaining Principles #10-human — the reserve-clause practitioner tool.
    { key: 'reserve_clause_entries', table: 'reserve_clause_entries' },
    // Remaining Principles #9 + #13 — the view-from-above practitioner tool.
    { key: 'view_from_above_entries', table: 'view_from_above_entries' },
    // Remaining Principles #8 — the morning-preparation practitioner tool.
    { key: 'morning_preparation_entries', table: 'morning_preparation_entries' },
    // Remaining Principles #6 + #15 — the circle-extension practice (on /oikeiosis).
    { key: 'circle_extension_entries', table: 'circle_extension_entries' },
    // Remaining Principles #14 — the sage-compass decision-support tool.
    { key: 'sage_compass_entries', table: 'sage_compass_entries' },
    // S7 — the primal-impulse examination tool (/impulse). R17b intimate: the
    // practitioner's own account of shame, fear, envy and status-seeking, in
    // their own words. Access must return it in full.
    { key: 'impulse_entries', table: 'impulse_entries' },
    // Earned virtue milestones — user_id-scoped (was missing from R17 coverage).
    { key: 'milestones', table: 'milestones' },
  ]

  // M5, row-cap sweep 2026-09-02/-03: this loop was an unbounded per-user
  // read on every table — a silent truncation here is an incomplete Article
  // 15 copy presented as complete. `pagedRangeSelect` walks each table
  // exhaustively via offset pagination (no per-table PK knowledge needed —
  // see the helper's own header for why offset pagination, not keyset, is
  // the right tool here). `incomplete: true` is added to a table's access
  // entry ONLY if its safety-valve ceiling (25,000 rows) is hit — an honest
  // disclosure rather than a silently truncated "complete" access copy.
  // Mirrors the identical fix in /api/user/export/route.ts's 2. loop.
  for (const { key, table } of tables) {
    const { rows, error, incomplete } = await pagedRangeSelect(
      supabaseAdmin,
      table,
      (q) => q.eq('user_id', userId)
    )

    if (error && !error.includes('does not exist')) {
      data[key] = { error }
    } else if (incomplete) {
      data[key] = { rows: rows || [], incomplete: true }
    } else {
      data[key] = rows || []
    }
  }

  // 1b. Stoa ST2 (2026-08-03) — the practitioner's Stoa entries, keyed by
  //     owner_user_id (= profiles.id, NOT user_id — so they cannot ride the
  //     loop above). Standing declarations (#24 — no retention sweep covers
  //     them). The store classifies a not-yet-migrated table as benign empty,
  //     so only a REAL failure surfaces here.
  {
    const stoa = await getStoaDataForOwner(userId)
    if (!stoa.ok) {
      data.stoa_entries = { error: stoa.error }
    } else {
      data.stoa_entries = stoa.value
    }
    // PR19 fold F3 (2026-08-03): agent entries declared under this user's
    // owned credentials (owner-NULL rows; the operator is the accountable
    // declarer) join the Art 15 copy. Keyed by credential_ref, exactly.
    // M5, row-cap sweep 2026-09-02/-03: was an unbounded per-owner read — an
    // incomplete key list here means an incomplete Art 15 access copy
    // presented as complete. Paged on `id` (api_keys' UUID PK). Mirrors the
    // identical fix in /api/user/export/route.ts's 2d. block.
    const { rows: credRows, error: credError } = await pagedRows<{ id: string }>(
      supabaseAdmin,
      'api_keys',
      'id',
      'id',
      { eqColumn: 'owner_user_id', eqValue: userId }
    )
    if (credError) {
      data.stoa_agent_entries = { error: credError }
    } else {
      const refs = (credRows ?? []).map((r) => `api_key:${r.id}`)
      const agentStoa = await getStoaDataForCredentials(refs)
      data.stoa_agent_entries = agentStoa.ok ? agentStoa.value : { error: agentStoa.error }
    }
  }

  // 2. Encrypted intimate tables — decrypt for the data subject (usable form).
  //    mentor_profiles is the parent of the profile_id-scoped tables below, so
  //    fetch it once and reuse its id(s).
  let profileIds: string[] = []
  {
    // row-cap sweep 2026-09-02/-03: was an unbounded .select('*') — silently
    // truncated at PostgREST's confirmed 1,000-row cap with no error. Paged
    // on the confirmed UUID 'id' primary key (supabase-mentor-profiles-
    // migration.sql). Mirrors listAppendixRounds' identical fix below and in
    // mentor-appendix-store.ts.
    const { rows: pagedData, error: pagedError } = await pagedRows<Record<string, unknown>>(
      supabaseAdmin,
      'mentor_profiles',
      'id',
      '*',
      { eqColumn: 'user_id', eqValue: userId }
    )
    const rows = pagedData
    const error = pagedError ? { message: pagedError } : null

    if (error && !error.message.includes('does not exist')) {
      data.mentor_profile = { error: error.message }
    } else {
      const list = (rows || []) as Array<Record<string, unknown>>
      profileIds = list
        .map((r) => r.id)
        .filter((v): v is string => typeof v === 'string')
      data.mentor_profile = list.map((row) => {
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
    // row-cap sweep 2026-09-02/-03: was an unbounded .select('*'). Paged on
    // the confirmed UUID 'id' primary key, mirroring mentor-appendix-store.ts's
    // listAppendixRounds fix for the identical table.
    const { rows: pagedData, error: pagedError } = await pagedRows<Record<string, unknown>>(
      supabaseAdmin,
      'mentor_baseline_appendix',
      'id',
      '*',
      { eqColumn: 'user_id', eqValue: userId }
    )
    const rows = pagedData
    const error = pagedError ? { message: pagedError } : null

    if (error && !error.message.includes('does not exist')) {
      data.mentor_baseline_appendix = { error: error.message }
    } else {
      const list = (rows || []) as Array<Record<string, unknown>>
      data.mentor_baseline_appendix = list.map((row) => {
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

  // realtime_journal_entries — R17b encrypted at rest; decrypt for the subject.
  // Falls back to legacy plaintext columns for any pre-encryption row.
  {
    // row-cap sweep 2026-09-02/-03: was an unbounded .select('*'). Paged on
    // the confirmed UUID 'id' primary key (supabase-mentor-gaps-migration.sql).
    const { rows: pagedData, error: pagedError } = await pagedRows<Record<string, unknown>>(
      supabaseAdmin,
      'realtime_journal_entries',
      'id',
      '*',
      { eqColumn: 'user_id', eqValue: userId }
    )
    const rows = pagedData
    const error = pagedError ? { message: pagedError } : null

    if (error && !error.message.includes('does not exist')) {
      data.realtime_journal_entries = { error: error.message }
    } else {
      const list = (rows || []) as Array<Record<string, unknown>>
      data.realtime_journal_entries = list.map((row) => {
        const { entry_ciphertext, entry_meta, impression, assent, action, ...rest } = row
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

  // 3. Profile_id-scoped intimate tables (FK → mentor_profiles). No user_id
  //    column, so queried by the profile id(s) resolved above.
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

  // M5, row-cap sweep 2026-09-02/-03: same fix as the user_id loop above,
  // applied to the profile_id-scoped tables. Mirrors the identical fix in
  // /api/user/export/route.ts's 4. loop.
  for (const table of profileScopedTables) {
    if (profileIds.length === 0) {
      data[table] = []
      continue
    }
    const { rows, error, incomplete } = await pagedRangeSelect(
      supabaseAdmin,
      table,
      (q) => q.in('profile_id', profileIds)
    )

    if (error && !error.includes('does not exist')) {
      data[table] = { error }
    } else if (incomplete) {
      data[table] = { rows: rows || [], incomplete: true }
    } else {
      data[table] = rows || []
    }
  }

  return data
}
