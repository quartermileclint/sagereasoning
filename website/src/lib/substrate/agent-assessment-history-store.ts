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
// FLAG (SUBSTRATE_TRAJECTORY_READ_ENABLED) — UNSET = byte-identical, no read
// ============================================================================
//
// M7 (CI-5 read half, 2026-06-14). SEPARATE from the M6 write flag so the read
// can activate only AFTER the write flag has accumulated data. UNSET ⇒ the route
// never calls getTrajectoryWindow (zero new DB reads) and the response carries no
// trajectory overlay → byte-identical to pre-M7. The engine NEVER reads these
// rows (Option A — read-and-overlay): the deterministic Layer2Assessment is
// untouched; the windowed read is surfaced as an honest response overlay only.

export const TRAJECTORY_READ_ENV_VAR = 'SUBSTRATE_TRAJECTORY_READ_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → the route
 *  performs no windowed read and emits no trajectory overlay (byte-identical to
 *  pre-M7). Gated at the route (mirrors isTrajectoryWriteEnabled); the reader
 *  below stays flag-free so it is unit-testable. */
export function isTrajectoryReadEnabled(): boolean {
  return process.env[TRAJECTORY_READ_ENV_VAR] === 'true'
}

// D17 prior-state windowing defaults (progression-delta.md §"Window parameters").
export const TRAJECTORY_DEFAULT_WINDOW_DAYS = 90
export const TRAJECTORY_DEFAULT_MAX_INSTANCES = 30

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

/** The columns the M7 windowed read selects — the EvaluatedAction-shaped
 *  projection plus the identity/time columns the aggregator + overlay need.
 *  Distinct from AssessmentHistoryRow (the write shape) because the read needs
 *  created_at (→ evaluated_at) and the identity columns; it does NOT need
 *  owner_user_id / depth_tier / surface / retain_until. */
export interface AssessmentHistoryReadRow {
  correlation_id: string
  credential_ref: string
  agent_id: string | null
  created_at: string
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

/** The result of one windowed trajectory read (M7). `actions` are OLDEST-FIRST
 *  — exactly what computeWindowSnapshot expects. `earliest`/`latest` are the
 *  oldest/newest created_at in the returned window, so the overlay can compute a
 *  CLOCK-FREE evidence span (latest − earliest) that is byte-identical on replay
 *  for a fixed window (the determinism guard — no now() in the aggregation). */
export interface TrajectoryWindow {
  actions: EvaluatedAction[]
  windowDays: number
  maxInstances: number
  earliest: string | null
  latest: string | null
}

/** The select column list for the windowed read (one indexed query — KG1
 *  latency budget; uses idx_aah_credential_time). */
const TRAJECTORY_SELECT_COLS =
  'correlation_id, credential_ref, agent_id, created_at, receipt_id, proximity, ' +
  'is_kathekon, kathekon_quality, passions_detected, virtue_domains_engaged, ' +
  'oikeiosis_met, oikeiosis_stage, ruling_faculty_state, skill_id, candidates_considered'

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

/** Map a stored row back to an EvaluatedAction for the windowed read (M7). PURE.
 *  KG7: the Array.isArray guards defend against a double-serialised JSONB value
 *  (a string would otherwise iterate as characters). created_at → evaluated_at.
 *  The reconstructed agent_id is a label for computeWindowSnapshot only (the
 *  persisted windowing keys are the credential_ref / agent_id columns); it falls
 *  back to credential_ref so the snapshot is always labelled. */
export function assessmentRowToEvaluatedAction(
  row: AssessmentHistoryReadRow,
): EvaluatedAction {
  return {
    receipt_id: row.receipt_id,
    agent_id: row.agent_id ?? row.credential_ref,
    evaluated_at: row.created_at,
    proximity: row.proximity,
    is_kathekon: row.is_kathekon,
    kathekon_quality: row.kathekon_quality,
    passions_detected: Array.isArray(row.passions_detected) ? row.passions_detected : [],
    virtue_domains_engaged: Array.isArray(row.virtue_domains_engaged)
      ? row.virtue_domains_engaged
      : [],
    oikeiosis_met: row.oikeiosis_met,
    oikeiosis_stage: row.oikeiosis_stage,
    ruling_faculty_state: row.ruling_faculty_state ?? '',
    skill_id: row.skill_id,
    candidates_considered: row.candidates_considered,
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

// ============================================================================
// M7 — windowed trajectory read (CI-5 read half). ONE awaited indexed query.
// ============================================================================

/**
 * Read the consulting credential's own most-recent assessment history as a
 * windowed slice (D17 prior-state: default 90 days / last 30, date desc),
 * reconstructed OLDEST-FIRST as EvaluatedAction[] for computeWindowSnapshot.
 *
 * R17a: scoped to the SUBJECT credential's own rows (`credential_ref` equality) —
 * never a cross-credential read. M7 keys on credential_ref (the universal,
 * NOT-NULL key); agent_id-keyed windows that would span an operator's other
 * credentials are deferred to M8 credential-consolidation (where owner-binding
 * makes them R17a-safe). The current consult's own row is NOT in this window —
 * the M6 write runs AFTER the assessment, so the window holds prior consults only
 * (prior_instances excludes the current one).
 *
 * KG1: ONE awaited indexed query (idx_aah_credential_time). Errors surfaced as a
 * discriminated StoreResult — a missing table (pre-migration) is benign-empty so
 * a flag-on-but-not-yet-migrated deployment never breaks the response.
 *
 * Determinism: the window's time filter reads the clock (the I/O boundary —
 * `nowMs` is injectable for deterministic tests), but the rows returned are fed
 * to a PURE aggregator in a TOTAL, deterministic order (created_at desc with a
 * correlation_id tiebreak, reversed to oldest-first). The aggregation itself
 * (computeTrajectoryOverlay) is a pure function of these rows — no clock, no
 * randomness — so a fixed window yields a byte-identical overlay on replay.
 */
export async function getTrajectoryWindow(
  opts: {
    credentialRef: string
    windowDays?: number
    maxInstances?: number
    /** Injectable clock for deterministic tests; defaults to Date.now(). */
    nowMs?: number
  },
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<TrajectoryWindow>> {
  const windowDays = opts.windowDays ?? TRAJECTORY_DEFAULT_WINDOW_DAYS
  const maxInstances = opts.maxInstances ?? TRAJECTORY_DEFAULT_MAX_INSTANCES
  const empty: TrajectoryWindow = {
    actions: [],
    windowDays,
    maxInstances,
    earliest: null,
    latest: null,
  }
  try {
    const nowMs = opts.nowMs ?? Date.now()
    const cutoffIso = new Date(nowMs - windowDays * 86_400_000).toISOString()
    const { data, error } = await client
      .from(TABLE)
      .select(TRAJECTORY_SELECT_COLS)
      .eq('credential_ref', opts.credentialRef) // R17a — subject credential only
      .gte('created_at', cutoffIso)
      .order('created_at', { ascending: false })
      .order('correlation_id', { ascending: false }) // total, deterministic tiebreak
      .limit(maxInstances)
    if (error) {
      // Table not migrated yet (flag-on but pre-migration) → benign empty window.
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: empty }
      }
      return { ok: false, error: `getTrajectoryWindow: ${error.message}` }
    }
    // `unknown` bridge: an explicit column-list select infers GenericStringError[]
    // in the supabase-js typings; the shape is our row projection at runtime.
    const rows = (data as unknown as AssessmentHistoryReadRow[] | null) ?? []
    // DESC result → reverse to oldest-first for the aggregator.
    const ordered = rows.slice().reverse()
    const actions = ordered.map(assessmentRowToEvaluatedAction)
    const earliest = ordered.length > 0 ? ordered[0].created_at : null
    const latest = ordered.length > 0 ? ordered[ordered.length - 1].created_at : null
    return { ok: true, value: { actions, windowDays, maxInstances, earliest, latest } }
  } catch (e) {
    return { ok: false, error: `getTrajectoryWindow threw: ${(e as Error).message}` }
  }
}
