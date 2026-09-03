/**
 * collaboration-store.ts — the DB seam for the Trust Layer S5 collaboration record.
 *
 * Mirrors trust-core-store.ts / agent-assessment-history-store.ts: a lazy injectable
 * service-role admin client, StoreResult<T>, the missing-table-benign classifier (so
 * the Live data-rights routes never break before the migration lands), and
 * fail-honest writes (a collaboration-write failure NEVER throws to a live route —
 * MEASURE mode, log-and-continue). All CRUD emission is gated by the CALLER behind
 * SUBSTRATE_TRUST_CORE_ENABLED (S6/S7 consume the CRUD; nothing in a live route calls
 * it this session). The data-rights + purge functions are wired ALWAYS-ON into the
 * data-rights routes + the retention sweep (R17 — erasure/export cannot be
 * flag-gated), missing-table-benign until the migration lands and empty-safe after.
 *
 * WRITE-ONCE FIELDS: authority_boundary (A9) + l4_audit_result (A7) are write-once at
 * the DB (trg_cr_protect_immutable). The dedicated setters here rely on that DB
 * trigger as the backstop; S6/S7 additionally pre-check with the pure
 * canSetAuthorityBoundary / canSetL4AuditResult guards (collaboration-record.ts) to
 * avoid a wasted round-trip + surface a clean error. A trigger RAISE surfaces here as
 * a fail-honest ok:false.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { StoreResult } from './trust-core-store'
import { canonicalAuthorityBoundary } from './collaboration-record'
import { pagedRows } from '../../db/paged-select'
import type {
  AuthorityBoundary,
  CollaborationRecord,
  CollaborationStatus,
  HabitualStableFlag,
  JusticeFailureReflection,
  L4AuditResult,
  PurposeAcknowledgement,
} from './collaboration-record'
import type { TransparencyDeficit } from './transparency-ledger'

// ============================================================================
// SHARED PLUMBING (mirrors trust-core-store.ts)
// ============================================================================

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate/collaboration-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const TABLE = 'collaboration_records'
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000

/** Postgres unique_violation — a duplicate (orchestrator_agent_id, task_ref). */
const PG_UNIQUE_VIOLATION = '23505'

/** True when the error means "this table does not exist yet" — the data-rights
 *  paths are Live but the migration is its own founder-walked step, so an
 *  erasure/export/purge BEFORE the table lands must succeed (nothing to touch). A
 *  REAL post-migration failure is NOT matched and surfaces as ok:false. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = error.message ?? ''
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

function retainUntilIso(fromIso?: string): string {
  const base = fromIso ? Date.parse(fromIso) : Date.now()
  return new Date(base + RETENTION_MS).toISOString()
}

// ============================================================================
// ROW SHAPE + MAPPERS
// ============================================================================

interface CollaborationRow {
  orchestrator_agent_id: string
  candidate_agent_id: string | null
  task_ref: string
  owner_user_id: string | null
  credential_ref: string | null
  authority_boundary: AuthorityBoundary | null
  l4_audit_result: L4AuditResult | null
  habitual_stable_flag: HabitualStableFlag | null
  independence_deficits: TransparencyDeficit[]
  justice_failure_case: JusticeFailureReflection | null
  status: CollaborationStatus
  updated_at?: string
  retain_until?: string
}

function recordToRow(r: CollaborationRecord): Record<string, unknown> {
  return {
    orchestrator_agent_id: r.orchestratorAgentId,
    candidate_agent_id: r.candidateAgentId ?? null,
    task_ref: r.taskRef,
    owner_user_id: r.ownerUserId ?? null,
    credential_ref: r.credentialRef ?? null,
    // KG7 — object passed directly; circle scope canonicalized so the write-once
    // trigger's whole-jsonb comparison is order-stable (a genuine re-set matches).
    authority_boundary: r.authorityBoundary ? canonicalAuthorityBoundary(r.authorityBoundary) : null,
    l4_audit_result: r.l4AuditResult,
    habitual_stable_flag: r.habitualStableFlag,
    independence_deficits: r.independenceDeficits,
    justice_failure_case: r.justiceFailureCase,
    status: r.status,
    retain_until: retainUntilIso(),
  }
}

function rowToRecord(row: CollaborationRow): CollaborationRecord {
  return {
    schema: 'trust-collaboration-record-v1',
    orchestratorAgentId: row.orchestrator_agent_id,
    candidateAgentId: row.candidate_agent_id,
    taskRef: row.task_ref,
    ownerUserId: row.owner_user_id,
    credentialRef: row.credential_ref,
    authorityBoundary: row.authority_boundary,
    l4AuditResult: row.l4_audit_result,
    habitualStableFlag: row.habitual_stable_flag,
    independenceDeficits: Array.isArray(row.independence_deficits) ? row.independence_deficits : [],
    justiceFailureCase: row.justice_failure_case,
    status: row.status,
  }
}

// ============================================================================
// CRUD (measure mode; consumed by S6/S7; fail-honest — never throws to a route)
// ============================================================================

/**
 * Open a collaboration record (INSERT). Idempotent: a duplicate
 * (orchestrator_agent_id, task_ref) is benign (the collaboration is already open).
 * INSERT (not upsert) so the write-once trigger is never engaged on open.
 */
export async function openCollaborationRecord(
  record: CollaborationRecord,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ opened: boolean }>> {
  try {
    const { error } = await client.from(TABLE).insert(recordToRow(record)).select('id')
    if (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        return { ok: true, value: { opened: false } } // already open — benign
      }
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: { opened: false } }
      }
      return { ok: false, error: `openCollaborationRecord: ${error.message}` }
    }
    return { ok: true, value: { opened: true } }
  } catch (e) {
    return { ok: false, error: `openCollaborationRecord threw: ${(e as Error).message}` }
  }
}

/** Read a collaboration record by its (orchestrator, task) key. Fail-honest; null
 *  when absent or the table is not migrated yet. */
export async function readCollaborationRecord(
  orchestratorAgentId: string,
  taskRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<CollaborationRecord | null>> {
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .eq('orchestrator_agent_id', orchestratorAgentId)
      .eq('task_ref', taskRef)
      .maybeSingle()
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: null }
      }
      return { ok: false, error: `readCollaborationRecord: ${error.message}` }
    }
    return { ok: true, value: data ? rowToRecord(data as CollaborationRow) : null }
  } catch (e) {
    return { ok: false, error: `readCollaborationRecord threw: ${(e as Error).message}` }
  }
}

async function patchByKey(
  orchestratorAgentId: string,
  taskRef: string,
  patch: Record<string, unknown>,
  client: SupabaseClient,
): Promise<StoreResult<void>> {
  try {
    const { error } = await client
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString(), retain_until: retainUntilIso() })
      .eq('orchestrator_agent_id', orchestratorAgentId)
      .eq('task_ref', taskRef)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: undefined }
      }
      // A write-once trigger RAISE surfaces here (fail-honest ok:false).
      return { ok: false, error: `patch ${TABLE}: ${error.message}` }
    }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `patch ${TABLE} threw: ${(e as Error).message}` }
  }
}

/** A9 — set the authority boundary (write-once at the DB). S6 pre-checks with
 *  canSetAuthorityBoundary; the trigger is the backstop. */
export function recordAuthorityBoundary(
  orchestratorAgentId: string,
  taskRef: string,
  boundary: AuthorityBoundary,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<void>> {
  // Canonicalize (circle scope sorted) so the DB write-once comparison is order-stable.
  return patchByKey(orchestratorAgentId, taskRef, { authority_boundary: canonicalAuthorityBoundary(boundary) }, client)
}

/** S9b G1b — write the spawn purpose-acknowledgement (a mutable JSONB column,
 *  written once at spawn open by the selection seam). DEPLOY-ORDER SAFETY
 *  (review fold, 2026-07-12): this deliberately does NOT ride patchByKey —
 *  patchByKey's missing-table-benign fold treats PostgREST's PGRST204
 *  unknown-COLUMN error as ok too (its message ends "…in the schema cache",
 *  matching isMissingTableError's regex — the disclosed A-3 class), which would
 *  FALSE-SUCCEED the ack pre-§E and mint ackPersisted:true with no persisted
 *  artifact (the R18f-parallel gate would then lean on the event-type CHECK
 *  alone, logging a doomed calling-event attempt every live spawn). Here ANY
 *  error — missing table, missing column, trigger — reads ok:false: the ack
 *  either persisted or it did not; it never pretends. */
export async function recordPurposeAcknowledgement(
  orchestratorAgentId: string,
  taskRef: string,
  ack: PurposeAcknowledgement,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<void>> {
  try {
    const { error } = await client
      .from(TABLE)
      .update({
        purpose_acknowledgement: ack,
        updated_at: new Date().toISOString(),
        retain_until: retainUntilIso(),
      })
      .eq('orchestrator_agent_id', orchestratorAgentId)
      .eq('task_ref', taskRef)
    if (error) {
      return { ok: false, error: `recordPurposeAcknowledgement: ${error.message}` }
    }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `recordPurposeAcknowledgement threw: ${(e as Error).message}` }
  }
}

/** A7 — write the L4 audit result (write-once / readable-not-modifiable at the DB). */
export function recordL4AuditResult(
  orchestratorAgentId: string,
  taskRef: string,
  result: L4AuditResult,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<void>> {
  return patchByKey(orchestratorAgentId, taskRef, { l4_audit_result: result }, client)
}

/** Update the MUTABLE lifecycle fields (never authority_boundary / l4_audit_result —
 *  those are the write-once setters above). */
export function updateCollaborationRecord(
  orchestratorAgentId: string,
  taskRef: string,
  patch: {
    candidateAgentId?: string | null
    habitualStableFlag?: HabitualStableFlag | null
    independenceDeficits?: TransparencyDeficit[]
    justiceFailureCase?: JusticeFailureReflection | null
    status?: CollaborationStatus
  },
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<void>> {
  const row: Record<string, unknown> = {}
  if ('candidateAgentId' in patch) row.candidate_agent_id = patch.candidateAgentId ?? null
  if ('habitualStableFlag' in patch) row.habitual_stable_flag = patch.habitualStableFlag ?? null
  if ('independenceDeficits' in patch) row.independence_deficits = patch.independenceDeficits ?? []
  if ('justiceFailureCase' in patch) row.justice_failure_case = patch.justiceFailureCase ?? null
  if ('status' in patch && patch.status) row.status = patch.status
  return patchByKey(orchestratorAgentId, taskRef, row, client)
}

// ============================================================================
// DATA RIGHTS (R17c/R17i) — genuine deletion + export, missing-table-benign,
// wired ALWAYS-ON into the data-rights routes + the retention sweep.
// ============================================================================

/** Genuine deletion (R17c) of an operator's collaboration records. Called by
 *  /api/user/delete. */
export function deleteCollaborationDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<number>> {
  return deleteBy('owner_user_id', ownerUserId, client)
}

/** Genuine deletion (R17c) of an external-consumer credential's collaboration
 *  records. Called by /api/credential/erase (consumer-erasure). */
export function deleteCollaborationDataForCredential(
  credentialRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<number>> {
  return deleteBy('credential_ref', credentialRef, client)
}

async function deleteBy(
  column: string,
  value: string,
  client: SupabaseClient,
): Promise<StoreResult<number>> {
  try {
    const { data, error } = await client.from(TABLE).delete().eq(column, value).select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: 0 }
      }
      return { ok: false, error: `delete ${TABLE} by ${column}: ${error.message}` }
    }
    return { ok: true, value: (data as unknown[] | null)?.length ?? 0 }
  } catch (e) {
    return { ok: false, error: `delete ${TABLE} threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) an operator's collaboration records. Called by /api/user/export.
 *
 *  M5, row-cap sweep 2026-09-02/-03: was an unbounded per-owner read — a
 *  truncated result here means an incomplete Art 20 export presented as
 *  complete. Paged on `id` (collaboration_records' UUID PK). */
export async function getCollaborationDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<unknown[]>> {
  try {
    const { rows, error } = await pagedRows<Record<string, unknown>>(
      client,
      TABLE,
      'id',
      '*',
      { eqColumn: 'owner_user_id', eqValue: ownerUserId },
    )
    if (error) {
      if (isMissingTableError({ message: error })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `select ${TABLE} by owner: ${error}` }
    }
    return { ok: true, value: (rows ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `select ${TABLE} threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// RETENTION SWEEP (R17c) — hard-delete past retain_until; fail-honest (cron shape)
// ============================================================================

/** Purge the collaboration table past retain_until. Returns the cron-friendly shape
 *  ({ deleted, error }, NOT StoreResult) so the sweep route spreads it. Fail-honest:
 *  a missing env / missing table never throws or fails closed. */
export async function purgeExpiredCollaboration(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  try {
    const db = client ?? getAdminClient()
    const nowIso = new Date().toISOString()
    const { data, error } = await db.from(TABLE).delete().lt('retain_until', nowIso).select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { deleted: 0, error: null }
      }
      return { deleted: 0, error: `purge ${TABLE}: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    return { deleted: 0, error: `purgeExpiredCollaboration threw: ${(e as Error).message}` }
  }
}
