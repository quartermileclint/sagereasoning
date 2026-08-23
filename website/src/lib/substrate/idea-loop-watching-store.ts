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
/** ATRF completion signal (GS-ATRF-3, RULED 2026-08-23 Q-C1). A NEW ROW TYPE in
 *  the watching family — the ruling's own first option — not a column set on the
 *  candidate row. See the migration header for why: the candidate row's identity
 *  columns are the RUNNER's, and a completion signal's identity is the AGENT's. */
const COMPLETION_SIGNALS_TABLE = 'idea_loop_completion_signals'

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

/** Postgres foreign_key_violation. On the completion-signal insert this means
 *  exactly one thing: the cycle row resolved a moment ago no longer exists —
 *  a concurrent /api/credential/erase or retention sweep deleted it between the
 *  lookup and the insert. That is the SAME state as "no such cycle", so it is
 *  reported as such rather than as a generic write failure (PR19 finding,
 *  2026-08-23: the race window is narrow and already fail-honest, but a 503
 *  tells the agent "try again later" when the truthful answer is "that cycle is
 *  gone and no retry will help"). */
const PG_FOREIGN_KEY_VIOLATION = '23503'

/** True when the error means "this table does not exist yet" — the data-rights
 *  paths are Live but the migration is its own founder-walked step, so an
 *  erasure/export/purge BEFORE the table lands must succeed (nothing to touch).
 *  A REAL post-migration failure is NOT matched and surfaces as ok:false. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  // PR19 hardening (2026-08-23), applying the AE-1 F1 precedent already carried
  // by agent-assessment-history-store.ts:437 rather than re-deriving it: a
  // missing COLUMN is NEVER benign. Postgres undefined_column (42703, "column
  // ... does not exist") and PostgREST's PGRST204 ("Could not find the '...'
  // column of '...' in the schema cache") both otherwise MATCH the table-ish
  // regexes below and false-benign — turning a real schema mismatch into a
  // silent 0-rows-deleted / 0-rows-exported result on an R17c genuine-deletion
  // path, which is exactly the class the C-1 observability sweep was burned by
  // (a hardcoded wrong column name that the fake test client could not catch).
  // A REAL post-migration failure must surface as ok:false so erasure stays
  // verifiable.
  if (error.code === '42703' || error.code === 'PGRST204') return false
  const msg = error.message ?? ''
  if (/column/i.test(msg)) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
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

  // ── ATRF/S4 additive columns (migration:
  //    supabase-idea-loop-candidates-atrf-blast-radius-and-s4-migration.sql).
  //
  //    DELIBERATELY OPTIONAL, not `T | null` like every field above. The
  //    difference is load-bearing, not stylistic: the required-nullable fields
  //    above are ALWAYS present as keys in the insert object, so a deploy that
  //    ran before its migration would send a key for a column that does not
  //    exist and every write would 400 with PGRST204 (memory
  //    `build-dark-migrate-later-breaks-writes`). These six are OMITTED
  //    ENTIRELY when the runner does not supply them, so the insert body is
  //    byte-identical to a pre-ATRF write and the code is safe in EITHER order
  //    against the migration. Migration-before-deploy is still walked as
  //    standing discipline; it is simply no longer a dependency.
  //
  //    This is also how the S4 build-success criterion "a candidate write with
  //    the new column absent behaves byte-identically to today" is satisfied by
  //    construction rather than by inspection — and it is asserted by a test.
  blast_radius?: string
  agent_blast_radius?: string
  target_circle?: number
  blast_radius_basis?: Record<string, unknown>
  traceability_check?: string
  extraction_evidence?: Record<string, unknown>
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
// ATRF COMPLETION SIGNAL (GS-ATRF-3) — the agent's post-execution report
//
// Q-C1: "Receipt triggers a write — the completion signal is persisted
// immediately on receipt. Receipt does not trigger a flag, a dashboard update,
// or any downstream action at this stage." Nothing below reads this table for
// any purpose except data-rights export.
//
// NO TRUST EVENT IS EVER WRITTEN FROM HERE — the same §2.9 posture as the
// sibling record surfaces: "the record surfaces write no trust event; any
// future event class is a new question for the mentor."
// ============================================================================

export interface CompletionSignalInsert {
  loop_id: string
  cycle_number: number
  impression_assented_to: string
  assent_quality: string
  /** NULL exactly when refuse_to_attest is true — the DB carries a coherence
   *  CHECK for this, and the route validates it first so the caller gets a named
   *  400 rather than an opaque 23514. */
  threshold_reached: string | null
  refuse_to_attest: boolean
  refusal_reason: string | null
  examination_record_provenance: string
  examination_record_credence: string
  threshold_provenance: string
  threshold_credence: string
  /** Stamped SERVER-SIDE from the presenting completion_signal_write credential
   *  — never caller-supplied. This is the AGENT's identity and is deliberately
   *  independent of the cycle row's (the RUNNER's). */
  agent_id: string | null
  owner_user_id: string | null
  credential_ref: string | null
}

export type CompletionSignalWriteOutcome =
  | { status: 'written'; signal_id: string; cycle_id: string }
  | { status: 'duplicate'; cycle_id: string }
  | { status: 'no_such_cycle' }

/**
 * Resolve (loop_id, cycle_number) → the cycle row's id, then insert the signal.
 *
 * WHY THE LOOKUP: Q-C1 names loop_id as what the signal carries, but loop_id
 * alone is NOT a cycle identifier in this schema — idea_loop_cycles is unique on
 * the PAIR. The route requires both and this resolves them.
 *
 * WHY no_such_cycle IS AN HONEST OUTCOME AND NOT AN ERROR: the signal's cycle FK
 * is NOT NULL with ON DELETE CASCADE, which is what gives this table retention
 * and data rights for free. A signal for a cycle that was never recorded has
 * nothing to attach to. Reporting that plainly is better than either fabricating
 * a parent row or silently accumulating orphans — the disclosed cost is that an
 * agent cannot report on a cycle whose runner-side write never landed.
 *
 * IDEMPOTENT on cycle_id via the DB unique index: a retry collides 23505 and
 * reports { status: 'duplicate' }, writing nothing — the sibling's posture on
 * this table's own key.
 */
export async function insertCompletionSignal(
  signal: CompletionSignalInsert,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<CompletionSignalWriteOutcome>> {
  try {
    const { data: cycleRow, error: lookupErr } = await client
      .from(CYCLES_TABLE)
      .select('id')
      .eq('loop_id', signal.loop_id)
      .eq('cycle_number', signal.cycle_number)
      .maybeSingle()
    if (lookupErr) {
      return { ok: false, error: `lookup ${CYCLES_TABLE}: ${lookupErr.message}` }
    }
    if (!cycleRow) {
      return { ok: true, value: { status: 'no_such_cycle' } }
    }
    const cycleId = (cycleRow as { id: string }).id

    // ECHO-CONSISTENCY IS STRUCTURAL, NOT CHECKED — and must stay that way.
    // The persisted loop_id/cycle_number are the SAME values used to resolve
    // cycleId three lines above, so a row whose echo disagrees with its FK'd
    // cycle is unconstructible on this path. That is why no cross-check exists
    // and why none is needed. If a future change ever accepts a caller-supplied
    // cycle_id instead of resolving it here, this guarantee is GONE and an
    // explicit cross-check becomes mandatory — the echoed columns exist for
    // auditability, and an auditability column that can silently lie is worse
    // than no column. (Raised as a NIT by independent review 2026-08-23;
    // refuted as already-closed, then pinned so it stays closed.)
    const { data, error } = await client
      .from(COMPLETION_SIGNALS_TABLE)
      .insert({ ...signal, cycle_id: cycleId } as unknown as Record<string, unknown>)
      .select('id')
      .single()
    if (error) {
      const code = (error as { code?: string }).code
      if (code === PG_UNIQUE_VIOLATION) {
        return { ok: true, value: { status: 'duplicate', cycle_id: cycleId } }
      }
      // The lookup-then-insert is not atomic (Supabase's REST seam offers no
      // cross-statement transaction here). If the cycle vanished in between, the
      // FK fails — and the honest report is the one the caller already
      // understands, not a generic service error.
      if (code === PG_FOREIGN_KEY_VIOLATION) {
        return { ok: true, value: { status: 'no_such_cycle' } }
      }
      return { ok: false, error: `insert ${COMPLETION_SIGNALS_TABLE}: ${error.message}` }
    }
    return {
      ok: true,
      value: { status: 'written', signal_id: (data as { id: string }).id, cycle_id: cycleId },
    }
  } catch (e) {
    return { ok: false, error: `insertCompletionSignal threw: ${(e as Error).message}` }
  }
}

/**
 * Genuine deletion (R17c) of an AGENT credential's completion signals.
 *
 * THE ONE GAP THE CASCADE DOES NOT COVER, and the reason this function exists:
 * /api/credential/erase deletes cycles by the CYCLE's credential_ref, which is
 * the RUNNER's. A completion signal is written under the AGENT's credential. An
 * agent erasing its own credential would otherwise leave its signals behind,
 * attached to someone else's cycles. Wired alongside the cycle delete.
 */
export function deleteCompletionSignalsForCredential(
  credentialRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<number>> {
  return deleteSignalsBy('credential_ref', credentialRef, client)
}

/** Genuine deletion (R17c) of an owner's completion signals. The profiles FK
 *  already cascades; this is the explicit path for /api/user/delete, which does
 *  not rely on cascade ordering elsewhere either. */
export function deleteCompletionSignalsForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<number>> {
  return deleteSignalsBy('owner_user_id', ownerUserId, client)
}

async function deleteSignalsBy(
  column: string,
  value: string,
  client: SupabaseClient,
): Promise<StoreResult<number>> {
  try {
    const { data, error } = await client
      .from(COMPLETION_SIGNALS_TABLE)
      .delete()
      .eq(column, value)
      .select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: 0 }
      }
      return { ok: false, error: `delete ${COMPLETION_SIGNALS_TABLE} by ${column}: ${error.message}` }
    }
    return { ok: true, value: (data as unknown[] | null)?.length ?? 0 }
  } catch (e) {
    return { ok: false, error: `delete ${COMPLETION_SIGNALS_TABLE} threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) an owner's completion signals. Structural + the agent's own
 *  examination record; nothing encrypted, nothing derived. */
export async function getCompletionSignalsForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<unknown[]>> {
  try {
    const { data, error } = await client
      .from(COMPLETION_SIGNALS_TABLE)
      .select('*')
      .eq('owner_user_id', ownerUserId)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `select ${COMPLETION_SIGNALS_TABLE} by owner: ${error.message}` }
    }
    return { ok: true, value: (data ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `select ${COMPLETION_SIGNALS_TABLE} threw: ${(e as Error).message}` }
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
