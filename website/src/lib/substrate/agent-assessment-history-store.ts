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

import { pagedRows } from '@/lib/db/paged-select'

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

// ============================================================================
// FLAG (SUBSTRATE_TRAJECTORY_SWEEP_ENABLED) — UNSET = the cron is an honest no-op
// ============================================================================
//
// The retention-sweep kill-switch (trajectory-retention-sweep cron, 2026-06-14).
// DEDICATED + SEPARATE from the write flag ON PURPOSE: the activation order
// requires the sweep to be live BEFORE M6-P2 flips SUBSTRATE_TRAJECTORY_WRITE_ENABLED
// (the sweep is the R17c genuine-deletion gate for the null-owner external-consumer
// rows the write flag starts creating; see trajectory-retention-sweep-scope.md §3).
// Reusing the write flag would make the sweep impossible to stand up before P2.
// UNSET ⇒ the cron returns an honest { flag_enabled: false } 200 and does NO DB
// work; rollback is "unset the flag" (the route reverts to the no-op 200).

export const TRAJECTORY_SWEEP_ENV_VAR = 'SUBSTRATE_TRAJECTORY_SWEEP_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → the cron is
 *  an honest no-op (no purge, no DB work). Read at call time (mirrors the write/
 *  read flags); the purge fn below stays flag-free so it is unit-testable. */
export function isTrajectorySweepEnabled(): boolean {
  return process.env[TRAJECTORY_SWEEP_ENV_VAR] === 'true'
}

// ============================================================================
// FLAG (SUBSTRATE_TRAJECTORY_DELTA_ENABLED) — UNSET = byte-identical, no delta
// ============================================================================
//
// AE-1 (ADR-014 §3.1, 2026-07-18). Gates THREE seams as one unit: (a) the
// layer1_source column in the windowed-read select (the column exists only
// after the founder-walked migration — the activation walk applies the
// migration BEFORE the flag, so flag-off never queries it); (b) the write-side
// layer1_source stamp (the route passes the field only flag-on, so a flag-off
// write row carries no unknown column key — the PGRST204
// build-dark-migrate-later class is structurally avoided); (c) the
// meta.trajectory.delta response projection. UNSET ⇒ all three absent ⇒
// byte-identical to pre-AE-1. NOTE: the delta consumes the M7 window, so
// activation requires SUBSTRATE_TRAJECTORY_READ_ENABLED to already be on —
// this flag alone changes nothing.

export const TRAJECTORY_DELTA_ENV_VAR = 'SUBSTRATE_TRAJECTORY_DELTA_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → no delta
 *  select-column, no write stamp, no response block (byte-identical). Read at
 *  call time (mirrors the sibling flags); the pure delta module itself
 *  (trajectory-delta.ts) reads no env — gating happens at the store/route
 *  seams so the computation stays unit-testable. */
export function isTrajectoryDeltaEnabled(): boolean {
  return process.env[TRAJECTORY_DELTA_ENV_VAR] === 'true'
}

/** Spec 4 / B/M-B (2026-08-17) — the proximity-dispersion member's OWN flag.
 *
 *  DEDICATED, not a reuse of TRAJECTORY_DELTA_ENV_VAR, and that is a mentor-stated
 *  requirement rather than a preference: the delta's flag has been LIVE in
 *  production since 2026-07-18, so "a new member riding
 *  SUBSTRATE_TRAJECTORY_DELTA_ENABLED is live the moment it deploys; per-feature
 *  darkness needs its own flag" (Ruling Set B, sequencing). Founder election (b),
 *  2026-08-16.
 *
 *  UNSET ⇒ the member is absent from the delta block, byte-identical
 *  (battery-asserted). Activation is its own founder-walked R4 step; rollback is
 *  one line — unset + redeploy. Requires the delta flag to already be on: this
 *  flag alone changes nothing. */
export const TRAJECTORY_DISPERSION_ENV_VAR = 'SUBSTRATE_TRAJECTORY_DISPERSION_ENABLED'

/**
 * ⚠ ACTIVATION IS BLOCKED — mentor ruling M-4 (2026-08-16). DO NOT SET THIS FLAG
 * until M-4 is resolved, even though the member itself is built and battery-green.
 *
 * The dispersion member was designed to sit BESIDE the existing
 * `computeDispositionStability` (`window-aggregator.ts`), which certifies
 * stddev < 0.4 as `advanced` / "Disposition approaching hexis" and is already
 * surfaced through this same delta's `dimension_trends`. The build's reasoning was
 * that an ungraded honest reading beside a graded defective one was a safe interim.
 *
 * M-4 rejected that: "Adding an honest reading beside a defective one does not
 * neutralise the defective one — it creates a surface that carries two signals with
 * contradictory implications, where the defective signal has the more
 * authoritative-sounding name ... The defective signal will dominate precisely in
 * the cases where it is most wrong." And: "Carrying both is not a safe interim
 * posture."
 *
 * SO THE ORDER IS FIXED: correct `computeDispositionStability` (a
 * perturbation-adjusted measure that distinguishes low variance UNDER perturbation
 * from low variance in the ABSENCE of perturbation), or retire it from
 * agent-facing surfaces — THEN activate this. Activating this first is the one
 * sequence the ruling forbids.
 */
export function isTrajectoryDispersionEnabled(): boolean {
  return process.env[TRAJECTORY_DISPERSION_ENV_VAR] === 'true'
}

// ============================================================================
// FLAG (SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED) — UNSET = byte-identical
// ============================================================================
//
// B5 (practice reminders, 2026-07-29 mentor verdict — "B5 — Session Boundary
// and the Adequacy of Inferred Evidence", binding). Gates THREE seams as one
// unit, mirroring the layer1_source precedent: (a) the session_marker column
// in the windowed-read select (exists only after the founder-walked
// migration); (b) the write-side session_marker stamp (the route passes the
// field only flag-on AND when the caller supplied a valid value, so a
// flag-off write row carries no unknown column key); (c) the B5
// session-decline signal computation at the route, which requires this same
// flag. UNSET ⇒ all three absent ⇒ byte-identical to pre-B5. NOTE: like the
// delta flag, this consumes the M7 window — activation requires
// SUBSTRATE_TRAJECTORY_READ_ENABLED already on.

export const SESSION_DECLINE_ENV_VAR = 'SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED'

/** True only when the flag is the exact string 'true'. Read at call time. */
export function isSessionDeclineSignalEnabled(): boolean {
  return process.env[SESSION_DECLINE_ENV_VAR] === 'true'
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
  /** AE-1 (election E-AE1-1): the Layer-1 provenance of THIS consult
   *  ('supplied' = caller-provided l1_supply extraction; 'server' =
   *  server-side extraction). OPTIONAL — the route passes it ONLY when
   *  SUBSTRATE_TRAJECTORY_DELTA_ENABLED is on (and the migration has landed);
   *  absent ⇒ the insert row carries NO layer1_source key, so a flag-off
   *  deployment never sends an unknown column (the PGRST204
   *  build-dark-migrate-later class). */
  layer1Source?: 'supplied' | 'server'
  /** B5 (2026-07-29): the calling agent's OWN declared session boundary for
   *  this consult. OPTIONAL — the route passes it ONLY when
   *  SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED is on AND the caller supplied a
   *  valid value; absent ⇒ the insert row carries NO session_marker key (the
   *  layer1_source precedent). NEVER inferred by this store or by the B5
   *  signal that reads it back — see session-decline-signal.ts. */
  sessionMarker?: 'session_open' | 'session_close' | 'mid_session'
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
  /** AE-1: present ONLY when the input supplied it (see AssessmentHistoryInput
   *  — flag-gated at the route). Optional so a flag-off insert row is
   *  byte-identical to pre-AE-1 (no unknown column key sent). */
  layer1_source?: 'supplied' | 'server'
  /** B5: present ONLY when the input supplied it (see
   *  AssessmentHistoryInput.sessionMarker). Optional so a flag-off insert row
   *  is byte-identical to pre-B5. */
  session_marker?: 'session_open' | 'session_close' | 'mid_session'
}

/** The columns the M7 windowed read selects — the EvaluatedAction-shaped
 *  projection plus the identity/time columns the aggregator + overlay need.
 *  Distinct from AssessmentHistoryRow (the write shape) because the read needs
 *  created_at (→ evaluated_at) and the identity columns; it does NOT need
 *  owner_user_id / surface / retain_until. AE-1 additions: depth_tier
 *  (persisted since M6; now read — AE-3's future input) and, flag-gated,
 *  layer1_source (the provenance-mix input; optional — absent when the delta
 *  flag is off, since the column may predate the migration). */
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
  depth_tier: string | null
  layer1_source?: 'supplied' | 'server' | null
  /** B5: the row's declared session boundary, flag-gated read (absent when
   *  SUBSTRATE_SESSION_DECLINE_SIGNAL_ENABLED is off or the column predates
   *  the migration). NULL = undeclared (this row carries no marker). */
  session_marker?: 'session_open' | 'session_close' | 'mid_session' | null
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
  /** AE-1: the raw read rows, OLDEST-FIRST, index-aligned with `actions` —
   *  the seam for consumers needing columns EvaluatedAction does not carry
   *  (depth_tier for AE-3; layer1_source for the delta provenance mix).
   *  OPTIONAL so existing constructors/tests are unaffected; the overlay
   *  ignores it (its output is byte-identical). */
  readRows?: AssessmentHistoryReadRow[]
}

/** The select column list for the windowed read (one indexed query — KG1
 *  latency budget; uses idx_aah_credential_time). AE-1 added depth_tier (a
 *  since-M6 persisted column — safe unconditionally). */
const TRAJECTORY_SELECT_COLS =
  'correlation_id, credential_ref, agent_id, created_at, receipt_id, proximity, ' +
  'is_kathekon, kathekon_quality, passions_detected, virtue_domains_engaged, ' +
  'oikeiosis_met, oikeiosis_stage, ruling_faculty_state, skill_id, candidates_considered, ' +
  'depth_tier'

/** AE-1: the windowed-read select, with layer1_source included ONLY flag-on
 *  (the column exists only after the founder-walked migration; the activation
 *  walk orders migration-BEFORE-flag. Flipping the flag pre-migration does not
 *  500 — the read fails honest and the route omits the overlay — but the walk
 *  doc forbids that order). Exported for the battery's byte-identity pin. */
export function trajectorySelectCols(): string {
  let cols = TRAJECTORY_SELECT_COLS
  if (isTrajectoryDeltaEnabled()) cols += ', layer1_source'
  if (isSessionDeclineSignalEnabled()) cols += ', session_marker'
  return cols
}

// ============================================================================
// PURE MAPPER (no I/O)
// ============================================================================

/** Map an AssessmentHistoryInput to an insert row. PURE.
 *  KG7: passions_detected is passed as the array directly; virtue_domains_engaged
 *  is spread into a fresh JS array (Postgres text[]). created_at / retain_until /
 *  id are server defaults — not set here. AE-1: the layer1_source KEY is present
 *  IFF the input supplied it (flag-gated at the route) — an absent key means
 *  PostgREST never sees the column name, so a pre-migration deployment cannot
 *  hit PGRST204 (the build-dark-migrate-later class). */
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
    ...(input.layer1Source !== undefined
      ? { layer1_source: input.layer1Source }
      : {}),
    ...(input.sessionMarker !== undefined
      ? { session_marker: input.sessionMarker }
      : {}),
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
  // AE-1 hardening (the standing missing-table-benign lesson): a missing
  // COLUMN is NEVER benign. Postgres undefined_column (42703, "column ... does
  // not exist") and PostgREST's PGRST204 ("Could not find the '...' column of
  // '...' in the schema cache") would otherwise match the table-ish regexes
  // below and FALSE-BENIGN — the windowed read would serve an EMPTY window
  // (a silent fresh-start lie on the overlay) instead of surfacing ok:false
  // (fail-honest: the route logs and omits the overlay). This matters for the
  // flag-before-migration misordering on the flag-gated layer1_source select.
  if (error.code === '42703' || error.code === 'PGRST204') return false
  const msg = error.message ?? ''
  if (/column/i.test(msg)) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
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

/** Genuine deletion (R17c) of ONE credential's per-consult history, scoped by the
 *  stable credential handle (`credential_ref` = 'api_key:<id>' | 'install:<id>').
 *  The CI-14 Step-7 consumer-erasure-by-token path for `owner_kind='external_consumer'`
 *  credentials, whose rows carry a NULL owner_user_id and therefore CANNOT ride
 *  deleteAssessmentHistoryForOwner (the user-JWT path). One awaited hard DELETE.
 *  Returns the deleted count. Missing-table is benign (the M6 migration is its own
 *  founder-elected step). Mirrors deleteAssessmentHistoryForOwner exactly, swapping
 *  the owner scope for the credential scope. */
export async function deleteAssessmentHistoryForCredential(
  credentialRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ deleted: number }>> {
  try {
    const { data, error } = await client
      .from(TABLE)
      .delete()
      .eq('credential_ref', credentialRef)
      .select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: { deleted: 0 } }
      }
      return { ok: false, error: `deleteAssessmentHistoryForCredential: ${error.message}` }
    }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return {
      ok: false,
      error: `deleteAssessmentHistoryForCredential threw: ${(e as Error).message}`,
    }
  }
}

/**
 * R17c retention enforcement (the trajectory-retention sweep — the M6-P2 gate).
 * Genuinely (hard) delete every row past its `retain_until`, on a schedule. ONE
 * awaited indexed DELETE (`idx_aah_retain_until`). UNIVERSAL predicate — NO owner
 * narrowing: `retain_until` (90 days, migration:121) is an R17 minimisation limit
 * that applies to EVERY row, and narrowing to `owner_user_id IS NULL` would let
 * owner-bearing rows accumulate past 90 days (the scope-doc §1 resolution). For
 * the null-owner external-consumer rows this sweep is the PRIMARY genuine-deletion
 * mechanism, not a backstop (owner-bearing rows are also erasable on demand via
 * the user-JWT data-rights paths). Mirrors purgeExpiredNarratives (narrative-
 * retention.ts) — the proven M1 precedent — but returns the cron-friendly
 * { deleted, error } shape, not StoreResult, so the route can spread it directly.
 *
 * Missing-table ⇒ { deleted: 0, error: null } (benign, via isMissingTableError) —
 * the cron must succeed even if pointed at a deployment where the table is absent.
 * A REAL post-migration failure is surfaced as { error } (the route reports it; no
 * fail-closed — a failed purge never affects a user-facing response). Injectable
 * client (store convention) for unit tests; defaults to the lazy admin client.
 *
 * FAIL-HONEST RESOLUTION: the admin client is resolved INSIDE the try (NOT via a
 * `= getAdminClient()` default parameter, which evaluates BEFORE the try and would
 * let a missing-env throw escape as a 500). getAdminClient() throws when the
 * Supabase env is absent; a cron must report that in JSON, never fail-closed — so
 * the throw is caught here. Mirrors purgeExpiredNarratives (narrative-retention.ts).
 */
export async function purgeExpiredTrajectory(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  try {
    const db = client ?? getAdminClient()
    const { data, error } = await db
      .from(TABLE)
      .delete()
      .lt('retain_until', new Date().toISOString())
      .select('id')
    if (error) {
      // Table not migrated on this deployment → nothing to purge, benign no-op.
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { deleted: 0, error: null }
      }
      return { deleted: 0, error: `purgeExpiredTrajectory: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    return { deleted: 0, error: `purgeExpiredTrajectory threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) an operator's per-consult history rows. One awaited SELECT
 *  scoped to owner_user_id. Called by /api/user/export. */
export async function getAssessmentHistoryForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<AssessmentHistoryRow[]>> {
  try {
    // M6, row-cap sweep 2026-09-02/-03: this SELECT had no .limit(), so any
    // owner with >1,000 rows in agent_assessment_history had their EXPORT
    // (R17i) silently truncated at the PostgREST server cap — an incomplete
    // Article 15/20 copy presented as complete, with no error surfaced.
    // Paged on `id` (the table's confirmed UUID primary key,
    // website/supabase/migrations/20260614_m6_agent_assessment_history.sql)
    // so the export is always exhaustive. pagedRows orders ASCENDING by the
    // cursor column (id), not `created_at DESC` as the original .order()
    // did — see the orderBehaviorNote at the call site below for why that
    // is safe here.
    const { rows, error } = await pagedRows<AssessmentHistoryRow>(
      client,
      TABLE,
      'id',
      '*',
      { eqColumn: 'owner_user_id', eqValue: ownerUserId },
    )
    if (error) {
      // Table not migrated yet (Live route) → nothing to export, benign empty.
      if (isMissingTableError({ message: error })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `getAssessmentHistoryForOwner: ${error}` }
    }
    return { ok: true, value: rows ?? [] }
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
      .select(trajectorySelectCols())
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
    return {
      ok: true,
      value: {
        actions,
        windowDays,
        maxInstances,
        earliest,
        latest,
        // AE-1: the raw rows ride along, index-aligned with `actions`, for the
        // delta projection's depth_tier / layer1_source consumers.
        readRows: ordered,
      },
    }
  } catch (e) {
    return { ok: false, error: `getTrajectoryWindow threw: ${(e as Error).message}` }
  }
}
