/**
 * store.ts - persistence + R17 data-rights for the Cognitive OS core slice.
 *
 * THIS IS THE ONLY MODULE IN `cognitive-os/` THAT TOUCHES THE DATABASE. Every
 * other component is pure, deterministic and dependency-free, and stays that
 * way: nothing here is imported by them.
 *
 * ---------------------------------------------------------------------------
 * WHY THE DATA-RIGHTS SURFACE WAS DESIGNED BEFORE THE SCHEMA
 * ---------------------------------------------------------------------------
 * Q-R6 (mentor ruling, 2026-09-09): R17 on envelope content "must be on the
 * table step's opening surface, not discovered after the migration is written."
 * Designing the wiring first surfaced the finding that shaped the whole step:
 *
 *   THE PHASE-1 LIBRARY CARRIES NO OWNERSHIP FIELD. `Claim.provenance.created_by`
 *   and `CognitiveEvent.caused_by` are free-form service strings. R17's four
 *   routes all key on owner_user_id or credential_ref, and the library supplies
 *   neither. The axis is introduced by `cognitive_contexts` - the single scoping
 *   root the founder elected 2026-09-09 - and every other table hangs off it.
 *
 * ---------------------------------------------------------------------------
 * THE THREE R17 SURFACES THIS SERVES
 * ---------------------------------------------------------------------------
 *   /api/user/access + /api/user/export -> getCognitiveDataForOwner  (R17i)
 *   /api/user/delete                    -> deleteCognitiveDataForOwner (R17c),
 *                                          in TWO arms - see below
 *   /api/credential/erase               -> deleteCognitiveDataForCredential
 *   the retention sweep                 -> purgeExpiredCognitive
 *
 * ALWAYS-ON, NEVER FLAG-GATED. Erasure and export cannot be behind a flag. They
 * are safe BEFORE the migration lands because a missing table is treated as
 * benign (and a missing COLUMN is never benign - see isMissingTableError).
 *
 * TWO ARMS on the owner path, matching the Stoa PR19 HIGH of 2026-08-03: a
 * context created under one of this user's CREDENTIALS carries no owner_user_id,
 * and would otherwise survive account deletion. The route resolves the user's
 * credential ids and calls the credential arm for each. Keyed by credential_ref
 * EXACTLY, never by agent_id (the reflect precedent's disclosed overreach).
 *
 * ---------------------------------------------------------------------------
 * WHY THE EXPORT MAY SAFELY SELECT WHOLE ROWS
 * ---------------------------------------------------------------------------
 * Q9 requires the internal-only scalars (epistemic_debt_score,
 * identity_coherence_score) to be MACHINE-ENFORCED internal - "not
 * internal-by-convention while being accessible via an API route a consumer
 * could call". /api/user/export IS such a route and this project's standing
 * export pattern is select('*').
 *
 * The core slice persists NO Cognitive OS scalar at all (Q-R7's own preference:
 * components persisted, summary re-derived), so there is nothing at rest for an
 * export to leak and the collision cannot arise.
 *
 * ** IF A LATER SLICE ADDS ANY SCORE COLUMN, THIS EXPORT MUST BECOME AN EXPLICIT
 *    PROJECTION AND STOP USING '*'. ** That is not a style note. It is the exact
 *    point at which the Q9 boundary would silently stop being machine-enforced.
 *    A battery pin reads the migration file and fails if a score column appears.
 *
 * ---------------------------------------------------------------------------
 * ROW-CAP DISCIPLINE (the 2026-09-02/03 sweep)
 * ---------------------------------------------------------------------------
 * PostgREST silently returns at most 1,000 rows. Every list read here that
 * DRIVES behaviour is paged with `pagedRows`, and every delete count is taken
 * from an exact head count rather than from a returned representation - a
 * DELETE ... RETURNING is capped the same way, so counting its rows would
 * UNDER-REPORT a large erasure while reporting success. A deliberate
 * improvement on the sibling stores, which count the returned rows.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { pagedRows } from '@/lib/db/paged-select'

// ============================================================================
// SHARED PLUMBING (mirrors collaboration-store.ts)
// ============================================================================

let _adminClient: SupabaseClient | null = null

/** LAZY - constructed on first call, never at module load. A module-load
 *  construction would make merely importing this file throw on a host with no
 *  Supabase env, which is how an unrelated route can be taken down by an import. */
function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[cognitive-os/store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

/**
 * Resolve the client INSIDE a caller's try block, never as a default parameter.
 *
 * A default parameter (`client = getAdminClient()`) is evaluated BEFORE the
 * function body runs, so its throw escapes the body's own try/catch entirely.
 * On a data-rights route that turns a missing env var into a 500 instead of an
 * honest error - the KG1 fail-honest violation a prior review found on the
 * trust-core sweep. Every exported function below therefore takes an OPTIONAL
 * client and resolves it here, inside its try.
 */
function resolveClient(client?: SupabaseClient): SupabaseClient {
  return client ?? getAdminClient()
}

export const CONTEXTS_TABLE = 'cognitive_contexts'
export const EVENTS_TABLE = 'cognitive_events'
export const CLAIMS_TABLE = 'cognitive_claims'
export const BELIEF_STATES_TABLE = 'cognitive_belief_states'

/** The child tables, in the order a delete must visit them: children before the
 *  parent. The FK cascade is a backstop; this project verifies erasure by query
 *  and never infers it from a cascade. */
export const CHILD_TABLES = [
  EVENTS_TABLE,
  CLAIMS_TABLE,
  BELIEF_STATES_TABLE,
] as const

export type StoreResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

/**
 * True when the error means "this table does not exist yet".
 *
 * The data-rights paths are always-on while the migration is its own
 * founder-walked step, so an export or erasure BEFORE the tables land must
 * succeed with nothing to touch.
 *
 * A MISSING COLUMN IS NEVER BENIGN. PostgREST's PGRST204 ("Could not find the
 * '...' column of '...' in the schema cache") and Postgres 42703 would otherwise
 * match the table-ish regexes below and FALSE-BENIGN, turning a schema drift
 * into a false "erased, 0 rows". This is the hardened form from the AE-1 PR19
 * fold, not the older unhardened one.
 */
export function isMissingTableError(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) return false
  if (error.code === '42703' || error.code === 'PGRST204') return false
  const msg = error.message ?? ''
  if (/column/i.test(msg)) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

/** Normalise the several error shapes PostgREST hands back. */
function asError(e: unknown): { code?: string; message?: string } {
  if (e && typeof e === 'object') {
    const o = e as { code?: string; message?: string }
    return { code: o.code, message: o.message ?? String(e) }
  }
  return { message: String(e) }
}

// ============================================================================
// READ (R17i) - export + access
// ============================================================================

export interface CognitiveExport {
  readonly contexts: unknown[]
  readonly events: unknown[]
  readonly claims: unknown[]
  readonly belief_states: unknown[]
}

const EMPTY_EXPORT: CognitiveExport = Object.freeze({
  contexts: [],
  events: [],
  claims: [],
  belief_states: [],
})

/**
 * Every context id this owner reaches, by BOTH arms.
 *
 * Arm 1: contexts they own directly (owner_user_id).
 * Arm 2: contexts created under their credentials (credential_ref), resolved
 *        from the credential ids the caller supplies. The caller resolves those
 *        because `api_keys` belongs to the credential layer, not to this one.
 *
 * Paged: this list DRIVES both export and deletion, so a truncation at the
 * 1,000-row cap would silently omit data from an export and leave rows
 * undeleted while still reporting success.
 */
async function contextIdsForOwner(
  ownerUserId: string,
  credentialRefs: readonly string[],
  client: SupabaseClient,
): Promise<{ ids: string[]; error: string | null; missingTable: boolean }> {
  const ids = new Set<string>()

  const owned = await pagedRows<{ context_id: string }>(
    client,
    CONTEXTS_TABLE,
    'context_id',
    'context_id',
    { eqColumn: 'owner_user_id', eqValue: ownerUserId },
  )
  if (owned.error) {
    if (isMissingTableError({ message: owned.error })) {
      return { ids: [], error: null, missingTable: true }
    }
    return { ids: [], error: `select ${CONTEXTS_TABLE} by owner: ${owned.error}`, missingTable: false }
  }
  for (const r of owned.rows ?? []) ids.add(r.context_id)

  for (const ref of credentialRefs) {
    const byCred = await pagedRows<{ context_id: string }>(
      client,
      CONTEXTS_TABLE,
      'context_id',
      'context_id',
      { eqColumn: 'credential_ref', eqValue: ref },
    )
    if (byCred.error) {
      if (isMissingTableError({ message: byCred.error })) {
        return { ids: [], error: null, missingTable: true }
      }
      return {
        ids: [],
        error: `select ${CONTEXTS_TABLE} by credential_ref ${ref}: ${byCred.error}`,
        missingTable: false,
      }
    }
    for (const r of byCred.rows ?? []) ids.add(r.context_id)
  }

  return { ids: [...ids], error: null, missingTable: false }
}

/** Page every row of `table` whose context_id is in `contextIds`. One paged read
 *  per context: `pagedRows` takes a single equality, and correctness matters more
 *  than the round-trip count on a data-rights path. */
async function childRowsForContexts(
  table: string,
  contextIds: readonly string[],
  client: SupabaseClient,
): Promise<{ rows: unknown[]; error: string | null }> {
  const out: unknown[] = []
  for (const id of contextIds) {
    const { rows, error } = await pagedRows<Record<string, unknown>>(
      client,
      table,
      'id',
      '*',
      { eqColumn: 'context_id', eqValue: id },
    )
    if (error) {
      if (isMissingTableError({ message: error })) return { rows: [], error: null }
      return { rows: [], error: `select ${table} by context: ${error}` }
    }
    out.push(...(rows ?? []))
  }
  return { rows: out, error: null }
}

/**
 * R17i - everything this owner's cognitive-os state holds.
 *
 * Whole rows are safe here ONLY because the core slice persists no Cognitive OS
 * scalar. See this file's header before adding a score column anywhere.
 */
export async function getCognitiveDataForOwner(
  ownerUserId: string,
  credentialRefs: readonly string[] = [],
  clientOpt?: SupabaseClient,
): Promise<StoreResult<CognitiveExport>> {
  try {
    const client = resolveClient(clientOpt)
    const { ids, error, missingTable } = await contextIdsForOwner(
      ownerUserId,
      credentialRefs,
      client,
    )
    if (missingTable) return { ok: true, value: EMPTY_EXPORT }
    if (error) return { ok: false, error }
    if (ids.length === 0) return { ok: true, value: EMPTY_EXPORT }

    const contexts = await childContextRows(ids, client)
    if (contexts.error) return { ok: false, error: contexts.error }

    const events = await childRowsForContexts(EVENTS_TABLE, ids, client)
    if (events.error) return { ok: false, error: events.error }

    const claims = await childRowsForContexts(CLAIMS_TABLE, ids, client)
    if (claims.error) return { ok: false, error: claims.error }

    const states = await childRowsForContexts(BELIEF_STATES_TABLE, ids, client)
    if (states.error) return { ok: false, error: states.error }

    return {
      ok: true,
      value: {
        contexts: contexts.rows,
        events: events.rows,
        claims: claims.rows,
        belief_states: states.rows,
      },
    }
  } catch (e) {
    return { ok: false, error: `${CONTEXTS_TABLE} export threw: ${asError(e).message}` }
  }
}

/** The context rows themselves, paged, for the ids already resolved. */
async function childContextRows(
  contextIds: readonly string[],
  client: SupabaseClient,
): Promise<{ rows: unknown[]; error: string | null }> {
  const out: unknown[] = []
  for (const id of contextIds) {
    const { rows, error } = await pagedRows<Record<string, unknown>>(
      client,
      CONTEXTS_TABLE,
      'context_id',
      '*',
      { eqColumn: 'context_id', eqValue: id },
    )
    if (error) {
      if (isMissingTableError({ message: error })) return { rows: [], error: null }
      return { rows: [], error: `select ${CONTEXTS_TABLE} by id: ${error}` }
    }
    out.push(...(rows ?? []))
  }
  return { rows: out, error: null }
}

// ============================================================================
// DELETE (R17c) - genuine deletion, verified by query
// ============================================================================

export interface CognitiveDeletion {
  readonly contexts: number
  readonly events: number
  readonly claims: number
  readonly belief_states: number
}

const EMPTY_DELETION: CognitiveDeletion = Object.freeze({
  contexts: 0,
  events: 0,
  claims: 0,
  belief_states: 0,
})

/**
 * Exact row count for a table/column/value. `head: true` returns no rows, so
 * this is NOT subject to the 1,000-row representation cap.
 */
async function exactCount(
  table: string,
  column: string,
  value: string,
  client: SupabaseClient,
): Promise<{ count: number; error: string | null; missingTable: boolean }> {
  const { count, error } = await client
    .from(table)
    .select('*', { count: 'exact', head: true })
    .eq(column, value)
  if (error) {
    const e = asError(error)
    if (isMissingTableError(e)) return { count: 0, error: null, missingTable: true }
    return { count: 0, error: `count ${table} by ${column}: ${e.message}`, missingTable: false }
  }
  return { count: count ?? 0, error: null, missingTable: false }
}

/**
 * Delete every row of `table` for one context, and PROVE it.
 *
 * Counts exactly before, deletes, counts exactly after, and reports the
 * difference. A non-zero remainder is returned as an ERROR rather than silently
 * reported as a partial success - "erasure is verified by query, never inferred".
 *
 * Deliberately NOT `delete().select('id').length`, which the sibling stores use:
 * a returned representation is capped at 1,000 rows, so a large erasure would
 * under-report while appearing to succeed.
 */
async function deleteForContext(
  table: string,
  contextId: string,
  client: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  const before = await exactCount(table, 'context_id', contextId, client)
  if (before.missingTable) return { deleted: 0, error: null }
  if (before.error) return { deleted: 0, error: before.error }
  if (before.count === 0) return { deleted: 0, error: null }

  const { error } = await client.from(table).delete().eq('context_id', contextId)
  if (error) {
    const e = asError(error)
    if (isMissingTableError(e)) return { deleted: 0, error: null }
    return { deleted: 0, error: `delete ${table} by context: ${e.message}` }
  }

  const after = await exactCount(table, 'context_id', contextId, client)
  if (after.error) return { deleted: 0, error: after.error }
  if (after.count !== 0) {
    return {
      deleted: before.count - after.count,
      error: `delete ${table} by context left ${after.count} row(s) - erasure NOT complete`,
    }
  }
  return { deleted: before.count, error: null }
}

/** Delete one whole context: children first, then the parent row. */
async function deleteContext(
  contextId: string,
  client: SupabaseClient,
): Promise<{ counts: CognitiveDeletion; error: string | null }> {
  let events = 0
  let claims = 0
  let states = 0

  for (const table of CHILD_TABLES) {
    const r = await deleteForContext(table, contextId, client)
    if (r.error) {
      return { counts: { contexts: 0, events, claims, belief_states: states }, error: r.error }
    }
    if (table === EVENTS_TABLE) events = r.deleted
    else if (table === CLAIMS_TABLE) claims = r.deleted
    else states = r.deleted
  }

  const before = await exactCount(CONTEXTS_TABLE, 'context_id', contextId, client)
  if (before.missingTable) {
    return { counts: { contexts: 0, events, claims, belief_states: states }, error: null }
  }
  if (before.error) {
    return { counts: { contexts: 0, events, claims, belief_states: states }, error: before.error }
  }

  const { error } = await client.from(CONTEXTS_TABLE).delete().eq('context_id', contextId)
  if (error) {
    const e = asError(error)
    if (!isMissingTableError(e)) {
      return {
        counts: { contexts: 0, events, claims, belief_states: states },
        error: `delete ${CONTEXTS_TABLE}: ${e.message}`,
      }
    }
  }

  const after = await exactCount(CONTEXTS_TABLE, 'context_id', contextId, client)
  if (after.error) {
    return { counts: { contexts: 0, events, claims, belief_states: states }, error: after.error }
  }
  if (after.count !== 0) {
    return {
      counts: { contexts: 0, events, claims, belief_states: states },
      error: `delete ${CONTEXTS_TABLE} left ${after.count} row(s) - erasure NOT complete`,
    }
  }

  return {
    counts: { contexts: before.count, events, claims, belief_states: states },
    error: null,
  }
}

function addCounts(a: CognitiveDeletion, b: CognitiveDeletion): CognitiveDeletion {
  return {
    contexts: a.contexts + b.contexts,
    events: a.events + b.events,
    claims: a.claims + b.claims,
    belief_states: a.belief_states + b.belief_states,
  }
}

/**
 * R17c - genuine deletion of everything this owner reaches, BOTH arms.
 *
 * `credentialRefs` carries the user's own `api_key:<id>` refs, resolved by the
 * caller. Omitting them would leave agent-created contexts orphaned forever -
 * the exact defect the Stoa PR19 review found and fixed.
 */
export async function deleteCognitiveDataForOwner(
  ownerUserId: string,
  credentialRefs: readonly string[] = [],
  clientOpt?: SupabaseClient,
): Promise<StoreResult<CognitiveDeletion>> {
  try {
    const client = resolveClient(clientOpt)
    const { ids, error, missingTable } = await contextIdsForOwner(
      ownerUserId,
      credentialRefs,
      client,
    )
    if (missingTable) return { ok: true, value: EMPTY_DELETION }
    if (error) return { ok: false, error }

    let totals = EMPTY_DELETION
    for (const id of ids) {
      const r = await deleteContext(id, client)
      totals = addCounts(totals, r.counts)
      if (r.error) return { ok: false, error: r.error }
    }
    return { ok: true, value: totals }
  } catch (e) {
    return { ok: false, error: `${CONTEXTS_TABLE} delete threw: ${asError(e).message}` }
  }
}

/**
 * R17c - genuine deletion for ONE credential, used by /api/credential/erase.
 *
 * For a credential-keyed context with no owner this and the retention sweep are
 * the ONLY exits: such rows are unreachable by the user-JWT paths.
 */
export async function deleteCognitiveDataForCredential(
  credentialRef: string,
  clientOpt?: SupabaseClient,
): Promise<StoreResult<CognitiveDeletion>> {
  try {
    const client = resolveClient(clientOpt)
    const { rows, error } = await pagedRows<{ context_id: string }>(
      client,
      CONTEXTS_TABLE,
      'context_id',
      'context_id',
      { eqColumn: 'credential_ref', eqValue: credentialRef },
    )
    if (error) {
      if (isMissingTableError({ message: error })) return { ok: true, value: EMPTY_DELETION }
      return { ok: false, error: `select ${CONTEXTS_TABLE} by credential_ref: ${error}` }
    }

    let totals = EMPTY_DELETION
    for (const { context_id } of rows ?? []) {
      const r = await deleteContext(context_id, client)
      totals = addCounts(totals, r.counts)
      if (r.error) return { ok: false, error: r.error }
    }
    return { ok: true, value: totals }
  } catch (e) {
    return { ok: false, error: `${CONTEXTS_TABLE} credential delete threw: ${asError(e).message}` }
  }
}

// ============================================================================
// RETENTION SWEEP (R17c)
// ============================================================================

/**
 * Purge every cognitive-os table past `retain_until`.
 *
 * Cron shape ({ deleted, error }, NOT StoreResult) so the sweep route spreads
 * it. FAIL-HONEST: a missing env or missing table never throws and never fails
 * closed - a cron has no user response to break.
 *
 * Children are swept before contexts so a parent row is never removed while its
 * children are still being counted. Each table is swept on its own
 * `retain_until`, so a long-lived context does not keep expired events alive.
 */
export async function purgeExpiredCognitive(
  client?: SupabaseClient,
): Promise<{
  deleted: number
  contexts: number
  events: number
  claims: number
  belief_states: number
  error: string | null
}> {
  const zero = {
    deleted: 0,
    contexts: 0,
    events: 0,
    claims: 0,
    belief_states: 0,
    error: null as string | null,
  }
  let db: SupabaseClient
  try {
    db = client ?? getAdminClient()
  } catch (e) {
    return { ...zero, error: `admin client unavailable: ${asError(e).message}` }
  }

  const nowIso = new Date().toISOString()
  const counts: Record<string, number> = {}
  let firstError: string | null = null

  for (const table of [...CHILD_TABLES, CONTEXTS_TABLE]) {
    try {
      const { count, error: cErr } = await db
        .from(table)
        .select('*', { count: 'exact', head: true })
        .lt('retain_until', nowIso)
      if (cErr) {
        const e = asError(cErr)
        if (!isMissingTableError(e)) firstError = firstError ?? `count ${table}: ${e.message}`
        counts[table] = 0
        continue
      }
      const expired = count ?? 0
      if (expired === 0) {
        counts[table] = 0
        continue
      }
      const { error } = await db.from(table).delete().lt('retain_until', nowIso)
      if (error) {
        const e = asError(error)
        if (!isMissingTableError(e)) firstError = firstError ?? `purge ${table}: ${e.message}`
        counts[table] = 0
        continue
      }
      // PR19 fold (2026-09-09): report what was ACTUALLY removed, not the
      // pre-delete count. The rest of this file counts before and after and this
      // did not — reporting `expired` would overstate the sweep's own work if a
      // concurrent erasure removed some of the counted rows between the SELECT
      // and the DELETE. The erasure itself is correct either way (the predicate
      // is deterministic); the COUNT was the inaccurate part.
      const { count: remaining, error: rErr } = await db
        .from(table)
        .select('*', { count: 'exact', head: true })
        .lt('retain_until', nowIso)
      if (rErr) {
        const e = asError(rErr)
        if (!isMissingTableError(e)) {
          firstError = firstError ?? `recount ${table} after purge: ${e.message}`
        }
        counts[table] = expired
        continue
      }
      const left = remaining ?? 0
      if (left !== 0) {
        firstError =
          firstError ?? `purge ${table} left ${left} expired row(s) - retention NOT enforced`
      }
      counts[table] = expired - left
    } catch (e) {
      firstError = firstError ?? `purge ${table} threw: ${asError(e).message}`
      counts[table] = 0
    }
  }

  const contexts = counts[CONTEXTS_TABLE] ?? 0
  const events = counts[EVENTS_TABLE] ?? 0
  const claims = counts[CLAIMS_TABLE] ?? 0
  const belief_states = counts[BELIEF_STATES_TABLE] ?? 0

  return {
    deleted: contexts + events + claims + belief_states,
    contexts,
    events,
    claims,
    belief_states,
    error: firstError,
  }
}
