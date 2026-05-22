/**
 * evaluated-actions-store.ts — the durable evaluated_actions data layer (A-3).
 *
 * Built at the Sage Reflect build Stage A session. Backs public.evaluated_actions
 * (website/supabase-evaluated-actions-migration.sql). This is the persistence half
 * of the 2026-05-22 lock finding: the ATL ran its rolling window IN-MEMORY; Sage
 * Reflect needs Q4 records to persist + accumulate across sessions so the window
 * is durable. The aggregator (computeWindowSnapshot) consumes the rows read back
 * here UNCHANGED — it is a pure function over an EvaluatedAction[].
 *
 * RULE COMPLIANCE
 * ---------------
 *  • KG1: every read/write awaited; errors surfaced as discriminated results, not
 *    swallowed. Lazy admin client (rule 4) — unit-testable without env.
 *  • KG7: passions_detected is JSONB — the JS array is passed DIRECTLY (no
 *    JSON.stringify); virtue_domains_engaged is a Postgres text[] — JS array direct.
 *  • R4: internal window data; no public read (RLS service-role-only).
 *
 * The Sage Assent feed (sage-assent-feed.ts) is the only caller (Stage A); the
 * Stage-B endpoint drives the feed.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { EvaluatedAction } from '@/lib/substrate/trust-layer/types/evaluation'

export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string }

/** The flat evaluated_actions row shape (mirrors the migration). */
export interface EvaluatedActionRow {
  agent_id: string
  receipt_id: string
  proximity: EvaluatedAction['proximity']
  is_kathekon: boolean
  kathekon_quality: EvaluatedAction['kathekon_quality']
  passions_detected: EvaluatedAction['passions_detected']
  virtue_domains_engaged: string[]
  oikeiosis_met: boolean | null
  oikeiosis_stage: string | null
  ruling_faculty_state: string | null
  skill_id: string
  candidates_considered: number
  evaluated_at: string
}

// ============================================================================
// PURE MAPPERS (no I/O)
// ============================================================================

/** Map an EvaluatedAction to an evaluated_actions insert row. PURE.
 *  The optional pass-through fields (operation_class, …) are NOT columns in this
 *  table (per the review-schema DDL); they are dropped on insert. */
export function evaluatedActionToRow(a: EvaluatedAction): EvaluatedActionRow {
  return {
    agent_id: a.agent_id,
    receipt_id: a.receipt_id,
    proximity: a.proximity,
    is_kathekon: a.is_kathekon,
    kathekon_quality: a.kathekon_quality,
    passions_detected: a.passions_detected, // KG7 — array, direct
    virtue_domains_engaged: [...a.virtue_domains_engaged], // text[] — JS array
    oikeiosis_met: a.oikeiosis_met,
    oikeiosis_stage: a.oikeiosis_stage,
    ruling_faculty_state: a.ruling_faculty_state,
    skill_id: a.skill_id,
    candidates_considered: a.candidates_considered,
    evaluated_at: a.evaluated_at,
  }
}

/** Map an evaluated_actions row back to an EvaluatedAction. PURE.
 *  The Array.isArray guard defends KG7: a double-serialised JSONB string would
 *  fail the guard and yield [] rather than iterating characters. */
export function rowToEvaluatedAction(row: EvaluatedActionRow): EvaluatedAction {
  return {
    receipt_id: row.receipt_id,
    agent_id: row.agent_id,
    evaluated_at: row.evaluated_at,
    proximity: row.proximity,
    is_kathekon: row.is_kathekon,
    kathekon_quality: row.kathekon_quality,
    passions_detected: Array.isArray(row.passions_detected) ? row.passions_detected : [],
    virtue_domains_engaged: Array.isArray(row.virtue_domains_engaged) ? row.virtue_domains_engaged : [],
    oikeiosis_met: row.oikeiosis_met,
    oikeiosis_stage: row.oikeiosis_stage,
    ruling_faculty_state: row.ruling_faculty_state ?? '',
    skill_id: row.skill_id,
    candidates_considered: row.candidates_considered,
  }
}

// ============================================================================
// LAZY ADMIN CLIENT (KG1 rule 4)
// ============================================================================

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[sage-reflect/evaluated-actions-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const TABLE = 'evaluated_actions'

// ============================================================================
// I/O — every call awaited; errors surfaced (KG1)
// ============================================================================

/** Persist a batch of evaluated actions. One awaited INSERT. KG7 arrays direct. */
export async function persistEvaluatedActions(
  actions: readonly EvaluatedAction[],
): Promise<StoreResult<{ inserted: number }>> {
  if (actions.length === 0) return { ok: true, value: { inserted: 0 } }
  try {
    const admin = getAdminClient()
    const rows = actions.map(evaluatedActionToRow)
    const { data, error } = await admin.from(TABLE).insert(rows).select('id')
    if (error) return { ok: false, error: `persistEvaluatedActions: ${error.message}` }
    return { ok: true, value: { inserted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `persistEvaluatedActions threw: ${(e as Error).message}` }
  }
}

/**
 * Read an agent's most-recent `limit` evaluated actions, returned OLDEST-FIRST
 * (chronological order — exactly what computeWindowSnapshot expects).
 */
export async function getRecentEvaluatedActions(
  agent_id: string,
  limit: number,
): Promise<StoreResult<EvaluatedAction[]>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from(TABLE)
      .select('*')
      .eq('agent_id', agent_id)
      .order('evaluated_at', { ascending: false })
      .limit(limit)
    if (error) return { ok: false, error: `getRecentEvaluatedActions: ${error.message}` }
    const rows = (data as EvaluatedActionRow[] | null) ?? []
    // Reverse the DESC result to oldest-first for the aggregator.
    const actions = rows.slice().reverse().map(rowToEvaluatedAction)
    return { ok: true, value: actions }
  } catch (e) {
    return { ok: false, error: `getRecentEvaluatedActions threw: ${(e as Error).message}` }
  }
}

/** Count an agent's lifetime evaluated actions (the WindowSnapshot total). */
export async function countLifetimeActions(agent_id: string): Promise<StoreResult<number>> {
  try {
    const admin = getAdminClient()
    const { count, error } = await admin
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('agent_id', agent_id)
    if (error) return { ok: false, error: `countLifetimeActions: ${error.message}` }
    return { ok: true, value: count ?? 0 }
  } catch (e) {
    return { ok: false, error: `countLifetimeActions threw: ${(e as Error).message}` }
  }
}
