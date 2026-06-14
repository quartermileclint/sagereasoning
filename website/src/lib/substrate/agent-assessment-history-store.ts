/**
 * agent-assessment-history-store.ts — the durable per-consult agent trajectory
 * data layer (CI-5, mechanism-correction M6, schema + write half).
 *
 * Backs public.agent_assessment_history
 * (website/supabase/migrations/20260614_m6_agent_assessment_history.sql). One
 * row per completed examination on /api/reason when the write flag is on. This
 * is the continuity half of the Character-Kernel claim (FX-6 / dossier B5): the
 * agent path scores statelessly per instance by design; this store accumulates
 * the longitudinal trajectory keyed to the consulting credential.
 *
 * WRITE-ONLY THIS HALF. The engine does NOT read these rows back this session
 * (determinism is untouched). M7 wires the windowed read (D17 prior-state,
 * 90d/last-30) that feeds Rule 10 and makes CI-15 proximity-calibration live.
 * The structural projection mirrors evaluated_actions so M7 can reconstruct an
 * EvaluatedAction and feed computeWindowSnapshot UNCHANGED.
 *
 * RULE COMPLIANCE
 * ---------------
 *  • KG1: every read/write awaited; errors surfaced as discriminated StoreResult
 *    values, never swallowed, never thrown into the response. Lazy admin client
 *    (rule 4) — unit-testable without env (inject a client).
 *  • KG7: passions_detected is JSONB — the JS array is passed DIRECTLY (no
 *    JSON.stringify); virtue_domains_engaged is a Postgres text[] — JS array direct.
 *  • R17a: rows are credential/operator-scoped; the service role mediates and the
 *    store only ever queries by the supplied identity (no cross-agent reads).
 *  • R17c: deleteAssessmentHistoryForOwner is genuine deletion (hard DELETE).
 *  • R3: owner_user_id is the operator (the credential owner — a developer), never
 *    an end-user.
 *
 * The flag (SUBSTRATE_TRAJECTORY_WRITE_ENABLED) gates the WRITE at the route seam;
 * unset = byte-identical (no write). This module reads no env at import; the lazy
 * client constructs on first I/O only.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { EvaluatedAction } from './trust-layer/types/evaluation'

// ============================================================================
// FLAG (SUBSTRATE_TRAJECTORY_WRITE_ENABLED) — UNSET = byte-identical, no write
// ============================================================================

export const TRAJECTORY_WRITE_ENV_VAR = 'SUBSTRATE_TRAJECTORY_WRITE_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → the route
 *  writes nothing (byte-identical to pre-M6). */
export function isTrajectoryWriteEnabled(): boolean {
  return process.env[TRAJECTORY_WRITE_ENV_VAR] === 'true'
}

// ============================================================================
// TYPES
// ============================================================================

export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string }

/** The caller-supplied input for one per-consult history row. `action` is the
 *  EvaluatedAction-shaped projection of the signed Layer2Assessment (produced by
 *  the canonical mapLayer2AssessmentToEvaluatedAction bridge at the route). */
export interface AssessmentHistoryInput {
  correlationId: string
  /** Stable per-credential handle: 'api_key:<id>' | 'install:<id>'. */
  credentialRef: string
  /** The operator (credential owner) — null when the credential has no owner. */
  ownerUserId: string | null
  /** The K1 declared agent_identity — null when undeclared. Validate via
   *  agent-id-vocabulary.ts BEFORE passing (the route does). */
  agentId: string | null
  /** quick | standard | deep — the consult depth. */
  depthTier: string | null
  surface: string
  action: EvaluatedAction
}

/** The flat agent_assessment_history row shape (mirrors the migration). */
export interface AssessmentHistoryRow {
  correlation_id: string
  credential_ref: string
  owner_user_id: string | null
  agent_id: string | null
  depth_tier: string | null
  surface: string
  receipt_id: string
  proximity: EvaluatedAction['proximity']
  is_kathekon: boolean
  kathekon_quality: EvaluatedAction['kathekon_quality']
  passions_detected: EvaluatedAction['passions_detected']
  virtue_domains_engaged: string[]
  oikeiosis_met: boolean | null
  oikeiosis_stage: string | null
  ruling_faculty_state: string
  skill_id: string
  candidates_considered: number
}

// ============================================================================
// PURE MAPPER (no I/O)
// ============================================================================

/** Map an AssessmentHistoryInput to an insert row. PURE.
 *  KG7: passions_detected is passed as the array directly; virtue_domains_engaged
 *  is spread into a fresh JS array (Postgres text[]). created_at / retain_until /
 *  id are server defaults — not set here. */
export function assessmentHistoryInputToRow(
  input: AssessmentHistoryInput,
): AssessmentHistoryRow {
  const a = input.action
  return {
    correlation_id: input.correlationId,
    credential_ref: input.credentialRef,
    owner_user_id: input.ownerUserId,
    agent_id: input.agentId,
    depth_tier: input.depthTier,
    surface: input.surface,
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
  }
}

// ============================================================================
// LAZY ADMIN CLIENT (KG1 rule 4) — injectable for tests
// ============================================================================

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate/agent-assessment-history-store] Missing NEXT_PUBLIC_SUPABASE_URL ' +
          'or SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const TABLE = 'agent_assessment_history'
const API_KEYS_TABLE = 'api_keys'

/** Postgres unique_violation — a correlation_id already written (retry/replay).
 *  Treated as a benign no-op so the write never strands the response. */
const PG_UNIQUE_VIOLATION = '23505'

/** True when the error means "this table does not exist yet". The data-rights
 *  paths (delete/export) are Live but the M6 migration is its own founder-elected
 *  step, so a production erasure/export BEFORE the table lands must succeed (there
 *  is nothing to delete/export). Catches both the Postgres undefined_table (42P01,
 *  "... does not exist") and the PostgREST schema-cache miss (PGRST205, "Could not
 *  find the table ... in the schema cache") — a missing table never reports "does
 *  not exist" through PostgREST. A REAL post-migration failure is NOT matched here
 *  and is surfaced as ok:false (R17c genuine deletion stays verifiable). */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = error.message ?? ''
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

// ============================================================================
// I/O — every call awaited; errors surfaced (KG1); never throws
// ============================================================================

/**
 * Persist one per-consult assessment-history row. One awaited INSERT. KG7 arrays
 * direct. A duplicate correlation_id (UNIQUE) is a benign no-op (inserted: 0) —
 * the row already exists, so the trajectory is intact. Any other error is
 * surfaced as { ok: false } (the route logs it and proceeds — the guarantee
 * never rides on a write that didn't land; M1 election).
 */
export async function persistAssessmentHistory(
  input: AssessmentHistoryInput,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ inserted: number }>> {
  try {
    const row = assessmentHistoryInputToRow(input)
    const { data, error } = await client.from(TABLE).insert(row).select('id')
    if (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        return { ok: true, value: { inserted: 0 } } // already written — benign
      }
      return { ok: false, error: `persistAssessmentHistory: ${error.message}` }
    }
    return { ok: true, value: { inserted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `persistAssessmentHistory threw: ${(e as Error).message}` }
  }
}

/** Resolve a credential's operator + declared agent identity from its api_keys
 *  row. Read-only; fail-honest (returns nulls on any error so the write still
 *  lands with what identity it has). Invoked ONLY behind the write flag (so the
 *  flag-off path adds no DB read — byte-identical). */
export async function resolveCredentialContext(
  apiKeyId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<{ owner_user_id: string | null; agent_id: string | null }> {
  try {
    const { data, error } = await client
      .from(API_KEYS_TABLE)
      .select('owner_user_id, agent_id')
      .eq('id', apiKeyId)
      .maybeSingle()
    if (error || !data) return { owner_user_id: null, agent_id: null }
    const row = data as { owner_user_id: string | null; agent_id: string | null }
    return {
      owner_user_id: row.owner_user_id ?? null,
      agent_id: row.agent_id ?? null,
    }
  } catch {
    return { owner_user_id: null, agent_id: null }
  }
}

/** Genuine deletion (R17c) of an operator's per-consult history. One awaited
 *  hard DELETE scoped to owner_user_id. Returns the deleted count. Called by
 *  /api/user/delete. */
export async function deleteAssessmentHistoryForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ deleted: number }>> {
  try {
    const { data, error } = await client
      .from(TABLE)
      .delete()
      .eq('owner_user_id', ownerUserId)
      .select('id')
    if (error) {
      // Table not migrated yet (Live route, M6 migration is its own step) →
      // nothing to delete, benign success. A real failure is surfaced.
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: { deleted: 0 } }
      }
      return { ok: false, error: `deleteAssessmentHistoryForOwner: ${error.message}` }
    }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `deleteAssessmentHistoryForOwner threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) an operator's per-consult history rows. One awaited SELECT
 *  scoped to owner_user_id. Called by /api/user/export. */
export async function getAssessmentHistoryForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<AssessmentHistoryRow[]>> {
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .eq('owner_user_id', ownerUserId)
      .order('created_at', { ascending: false })
    if (error) {
      // Table not migrated yet (Live route) → nothing to export, benign empty.
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `getAssessmentHistoryForOwner: ${error.message}` }
    }
    return { ok: true, value: (data as AssessmentHistoryRow[] | null) ?? [] }
  } catch (e) {
    return { ok: false, error: `getAssessmentHistoryForOwner threw: ${(e as Error).message}` }
  }
}
