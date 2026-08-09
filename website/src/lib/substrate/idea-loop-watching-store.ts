/**
 * idea-loop-watching-store.ts — the DB seam for `watching`, the IDEA loop's
 * per-cycle record tables (agent-circles, RULED 2026-08-09 —
 * operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md;
 * verbatim record wins).
 *
 * Mirrors collaboration-store.ts (the ruled §2.7 precedent): a lazy injectable
 * service-role admin client, StoreResult<T>, the missing-table-benign classifier
 * (so the Live data-rights routes never break before the migration lands), and
 * honest outcomes throughout.
 *
 * WHAT THE STORE HOLDS (ruled §2.1): idea_loop_cycles (one row per COMPLETED
 * cycle) + idea_loop_candidates (one row per generated candidate, FK → cycle
 * ON DELETE CASCADE — Q7's full per-candidate transparency including
 * rejected_by_guardrail candidates with heuristic attribution).
 *
 * HONESTY POSTURE (ruled §2.5): every row is the RUNNER'S SELF-REPORT of its own
 * cycle — the runner is the only party holding full cycle state. The dashboard
 * renders that disclosure; maximum_duration_ms is runner-declared configuration
 * the server can never verify (recorded as declared). Rows never ride S10, the
 * accreditation payload, or any consult response. MEASURE-only; a record row
 * binds nothing; no trust event is ever written from here (§2.9, settled).
 *
 * IDEMPOTENCY (ruled §2.3): the DB UNIQUE (loop_id, cycle_number) is the
 * enforcement; a retried write collides 23505 and insertCycleRecord reports
 * { status: 'duplicate' } — a no-op, never a second row (the discernment
 * sibling's duplicate-no-op posture, realised on this table's own unique key).
 *
 * PARTIAL-FAILURE DISCIPLINE: the cycle row + its candidate rows arrive in one
 * write (one call per completed cycle, ruled). Supabase's REST seam gives no
 * cross-table transaction, so: insert cycle → insert candidates → link winner.
 * If a later step fails, the cycle row is DELETED (cascade removes any inserted
 * candidates) and the write reports ok:false — so a runner retry starts clean
 * instead of hitting a duplicate no-op on a half-written record.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { StoreResult } from './trust-core/trust-core-store'

// ============================================================================
// SHARED PLUMBING (mirrors collaboration-store.ts)
// ============================================================================

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate/idea-loop-watching-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const CYCLES_TABLE = 'idea_loop_cycles'
const CANDIDATES_TABLE = 'idea_loop_candidates'

/**
 * The cycle→candidates embed, DISAMBIGUATED — do not simplify to
 * `${CANDIDATES_TABLE} (*)`.
 *
 * FOUND LIVE 2026-08-09 (runner scoping session, at the SUBSTRATE_WATCHING_ENABLED
 * activation smoke): there are TWO foreign keys between these tables —
 *   idea_loop_candidates_cycle_id_fkey  candidates.cycle_id        -> cycles.id  (CASCADE)
 *   fk_ilc_winner_candidate             cycles.winner_candidate_id -> candidates.id (SET NULL)
 * so an UNQUALIFIED embed is ambiguous and PostgREST refuses it (PGRST201,
 * "more than one relationship was found"). The unqualified form returned a
 * hard error on every read: GET /api/founder/watching answered 503
 * {"error":"service error"} and /api/user/export wrote {error} in place of the
 * subject's cycle data. Writes were unaffected (no embed), which is why the
 * defect stayed latent from the `watching` build until the first live read.
 *
 * The `!<constraint>` hint pins the parent->children direction both readers
 * intend. Both FKs are legitimate; only one is the one these reads want.
 *
 * NOT BATTERY-DETECTABLE: the in-memory fake models result SHAPE, not
 * PostgREST's relationship resolution, so it agrees with whatever the code
 * asks for. Both suites were green while production reads were failing. Any
 * change to this constant must be verified by a LIVE call, never by a suite.
 */
const CANDIDATES_EMBED = `${CANDIDATES_TABLE}!idea_loop_candidates_cycle_id_fkey (*)`

/** Postgres unique_violation — a duplicate (loop_id, cycle_number). */
const PG_UNIQUE_VIOLATION = '23505'

/** True when the error means "this table does not exist yet" — the data-rights
 *  paths are Live but the migration is its own founder-walked step, so an
 *  erasure/export/purge BEFORE the table lands must succeed (nothing to touch).
 *  A REAL post-migration failure is NOT matched and surfaces as ok:false. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = error.message ?? ''
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

// ============================================================================
// WRITE SHAPES — the validated input the handler passes (snake_case matches the
// table columns; validation happens at the route boundary, not here)
// ============================================================================

export interface WatchingCycleInsert {
  loop_id: string
  cycle_number: number
  gap_ref: string | null
  cycle_outcome: string
  friction_only_mode: boolean
  cost_cents: number | null
  elapsed_ms: number | null
  maximum_duration_ms: number | null
  /** Stamped SERVER-SIDE from the presenting watching_write credential —
   *  never caller-supplied (unforgeable identity). */
  agent_id: string | null
  owner_user_id: string | null
  credential_ref: string | null
  started_at: string | null
  ended_at: string | null
}

export interface WatchingCandidateInsert {
  gap_ref: string | null
  heuristic: string
  proposed_action: string
  classification_kind: string
  classified_domains: string[] | null
  generation_confidence: number | null
  guardrail_proximity: string | null
  guardrail_domains: string[] | null
  guardrail_session_id: string | null
  passed_novelty_check: boolean | null
  novelty_confidence: number | null
  novelty_basis: string | null
  cycle_outcome: string
  unavailable_dependency: string | null
}

export type CycleWriteOutcome =
  | { status: 'written'; cycle_id: string; candidates_written: number }
  | { status: 'duplicate' }

/**
 * Insert one completed cycle + its candidate rows (one call per completed cycle,
 * ruled §2.3). Idempotent on (loop_id, cycle_number) via the DB unique key:
 * a retry reports { status: 'duplicate' } and writes nothing. On a partial
 * failure (candidates or winner-link), the cycle row is deleted (cascade) so the
 * retry path stays clean — the caller surfaces an honest 503 and the runner
 * retries the whole write.
 */
export async function insertCycleRecord(
  cycle: WatchingCycleInsert,
  candidates: readonly WatchingCandidateInsert[],
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<CycleWriteOutcome>> {
  // The winner link is derived from the candidate rows' own outcome (the handler
  // validates AT MOST one 'winner', exactly one when cycle_outcome='winner') —
  // order-independent, so it never depends on batch-insert row ordering.
  const hasWinner = candidates.some((c) => c.cycle_outcome === 'winner')
  try {
    // 1. The cycle row (retain_until defaults in the DB).
    const { data: cycleRow, error: cycleErr } = await client
      .from(CYCLES_TABLE)
      .insert(cycle as unknown as Record<string, unknown>)
      .select('id')
      .single()
    if (cycleErr) {
      if ((cycleErr as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        return { ok: true, value: { status: 'duplicate' } }
      }
      return { ok: false, error: `insert ${CYCLES_TABLE}: ${cycleErr.message}` }
    }
    const cycleId = (cycleRow as { id: string }).id

    // 2. The candidate rows (KG1 — awaited; one batched insert).
    const candidateRows = candidates.map((c) => ({ ...c, cycle_id: cycleId }))
    const { data: candData, error: candErr } = await client
      .from(CANDIDATES_TABLE)
      .insert(candidateRows as unknown as Record<string, unknown>[])
      .select('id, cycle_outcome')
    if (candErr) {
      await cleanupCycle(cycleId, client)
      return { ok: false, error: `insert ${CANDIDATES_TABLE}: ${candErr.message}` }
    }
    const candIds = (candData as { id: string; cycle_outcome: string }[] | null) ?? []

    // 3. The winner link — matched by the inserted rows' own cycle_outcome
    //    (order-independent; the handler guarantees at most one 'winner').
    if (hasWinner) {
      const winnerId = candIds.find((c) => c.cycle_outcome === 'winner')?.id
      if (!winnerId) {
        await cleanupCycle(cycleId, client)
        return { ok: false, error: 'winner link: no inserted candidate row carries cycle_outcome=winner' }
      }
      const { error: linkErr } = await client
        .from(CYCLES_TABLE)
        .update({ winner_candidate_id: winnerId })
        .eq('id', cycleId)
      if (linkErr) {
        await cleanupCycle(cycleId, client)
        return { ok: false, error: `winner link: ${linkErr.message}` }
      }
    }

    return {
      ok: true,
      value: { status: 'written', cycle_id: cycleId, candidates_written: candIds.length },
    }
  } catch (e) {
    return { ok: false, error: `insertCycleRecord threw: ${(e as Error).message}` }
  }
}

/** Best-effort removal of a half-written cycle (cascade removes candidates).
 *  Failure here is logged-not-thrown — the caller already reports ok:false and
 *  the orphaned row, if any, is bounded by retain_until. */
async function cleanupCycle(cycleId: string, client: SupabaseClient): Promise<void> {
  try {
    await client.from(CYCLES_TABLE).delete().eq('id', cycleId)
  } catch (e) {
    console.error('[watching-store] cleanup of partial cycle failed:', (e as Error).message)
  }
}

// ============================================================================
// READ — the founder dashboard (GET /api/founder/watching)
// ============================================================================

export interface WatchingReadOpts {
  loopId?: string
  limit?: number
}

/** Read the most recent cycles (desc by created_at), each with its candidate
 *  rows. Founder-only surface — the route gates on FOUNDER_USER_ID; this fn is
 *  service-role plumbing. */
export async function getCyclesWithCandidates(
  opts: WatchingReadOpts = {},
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<unknown[]>> {
  const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200)
  try {
    let query = client
      .from(CYCLES_TABLE)
      .select(`*, ${CANDIDATES_EMBED}`)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (opts.loopId) query = query.eq('loop_id', opts.loopId)
    const { data, error } = await query
    if (error) {
      return { ok: false, error: `select ${CYCLES_TABLE}: ${error.message}` }
    }
    return { ok: true, value: (data ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `getCyclesWithCandidates threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// DATA RIGHTS (R17c/R17i, ruled §2.7) — genuine deletion + export,
// missing-table-benign, wired ALWAYS-ON into the data-rights routes + the
// retention sweep. Candidates cascade with their cycle (FK ON DELETE CASCADE),
// so cycle-level deletes cover both tables.
// ============================================================================

/** Genuine deletion (R17c) of an operator's cycle records (+ cascaded
 *  candidates). Called by /api/user/delete. */
export function deleteWatchingDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<number>> {
  return deleteBy('owner_user_id', ownerUserId, client)
}

/** Genuine deletion (R17c) of an external-consumer credential's cycle records.
 *  Called by /api/credential/erase (consumer-erasure). Ruled §2.7: "cheap and
 *  correct regardless of the runner credential's ownership shape, which the
 *  runner scoping session fixes." */
export function deleteWatchingDataForCredential(
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
    const { data, error } = await client.from(CYCLES_TABLE).delete().eq(column, value).select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: 0 }
      }
      return { ok: false, error: `delete ${CYCLES_TABLE} by ${column}: ${error.message}` }
    }
    return { ok: true, value: (data as unknown[] | null)?.length ?? 0 }
  } catch (e) {
    return { ok: false, error: `delete ${CYCLES_TABLE} threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) an operator's cycle records with candidates. Called by
 *  /api/user/export. Structural + proposal text (never encrypted prose). */
export async function getWatchingDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<unknown[]>> {
  try {
    const { data, error } = await client
      .from(CYCLES_TABLE)
      .select(`*, ${CANDIDATES_EMBED}`)
      .eq('owner_user_id', ownerUserId)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `select ${CYCLES_TABLE} by owner: ${error.message}` }
    }
    return { ok: true, value: (data ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `select ${CYCLES_TABLE} threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// RETENTION SWEEP (R17c) — hard-delete past retain_until; fail-honest (the
// cron-friendly { deleted, error } shape the trust-core sweep spreads).
// ============================================================================

export async function purgeExpiredWatching(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  try {
    const db = client ?? getAdminClient()
    const nowIso = new Date().toISOString()
    const { data, error } = await db
      .from(CYCLES_TABLE)
      .delete()
      .lt('retain_until', nowIso)
      .select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { deleted: 0, error: null }
      }
      return { deleted: 0, error: `purge ${CYCLES_TABLE}: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    return { deleted: 0, error: `purgeExpiredWatching threw: ${(e as Error).message}` }
  }
}
