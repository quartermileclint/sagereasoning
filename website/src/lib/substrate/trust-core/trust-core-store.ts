/**
 * trust-core-store.ts — the DB seam for the Trust Layer S1 trust core.
 *
 * Mirrors agent-assessment-history-store.ts: a lazy injectable service-role admin
 * client, StoreResult<T>, the missing-table-benign classifier (so the Live
 * data-rights routes never break before the migration lands), and fail-honest
 * writes (a trust-write failure NEVER throws to a live route — MEASURE mode,
 * log-and-continue). All emission is gated by the caller behind
 * SUBSTRATE_TRUST_CORE_ENABLED.
 *
 * EMISSION IDEMPOTENCY: emitTrustEvents inserts each event FIRST (the
 * (correlation_id, event_type, virtue_domain) unique index dedupes retries). It
 * folds the event into agent_trust_state ONLY when the row was NEWLY inserted, so
 * a retried write cannot double-count. The insert→fold pair is not transactional
 * (Supabase JS has no multi-statement transaction here); a rare crash between them
 * leaves the materialised state slightly behind the ledger — acceptable in measure
 * mode (the state gates nothing) and the event ledger stays authoritative within
 * the retention window. Insert-first (over fold-first) is chosen deliberately: a
 * retry then dedupes and skips the fold, so the worst case is state-behind, never
 * a double-count.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { EarnedDomainState, TrustEvent, TrustProfile } from './types'
import { applyTrustEvent } from './trust-transition'
import { computeTrustProfile } from './trust-aggregate'
import type { VirtueTrustDomain } from './types'
import { PROXIMITY_RANK } from './constants'
import type { SessionDomainObservation } from './intervention-engine'

// ============================================================================
// SHARED PLUMBING (mirrors agent-assessment-history-store.ts)
// ============================================================================

export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string }

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate/trust-core-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const EVENTS_TABLE = 'agent_trust_events'
const STATE_TABLE = 'agent_trust_state'
const RETENTION_MS = 90 * 24 * 60 * 60 * 1000

/** Postgres unique_violation — a duplicate (correlation_id, event_type, domain). */
const PG_UNIQUE_VIOLATION = '23505'

/** True when the error means "this table does not exist yet" — the data-rights
 *  paths are Live but the migration is its own founder-walked step, so an
 *  erasure/export/purge BEFORE the tables land must succeed (nothing to touch).
 *  A REAL post-migration failure is NOT matched and surfaces as ok:false. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = error.message ?? ''
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

// ============================================================================
// ROW SHAPES + MAPPERS
// ============================================================================

interface TrustStateRow {
  agent_id: string
  virtue_domain: string
  owner_user_id: string | null
  credential_ref: string | null
  earned_level: EarnedDomainState['earnedLevel']
  profile_prior: EarnedDomainState['profilePrior']
  volatility_rating: EarnedDomainState['volatility']
  last_domain_activity_at: string | null
  reflect_last_honest_at: string | null
  /** S9b G2 — nullable + OPTIONAL: the column exists only after the S9b
   *  CHECK-widening migration; pre-migration rows simply have no key. */
  reflect_last_screened_at?: string | null
  justice_floor_active: boolean
  coverage_status: EarnedDomainState['coverageStatus']
  updated_at: string
  retain_until: string
}

function rowToEarnedState(row: TrustStateRow): EarnedDomainState {
  return {
    earnedLevel: row.earned_level,
    profilePrior: row.profile_prior,
    volatility: row.volatility_rating,
    lastDomainActivityAt: row.last_domain_activity_at,
    reflectLastHonestAt: row.reflect_last_honest_at,
    reflectLastScreenedAt: row.reflect_last_screened_at ?? null,
    justiceFloorActive: row.justice_floor_active,
    coverageStatus: row.coverage_status,
  }
}

function eventToRow(event: TrustEvent): Record<string, unknown> {
  return {
    agent_id: event.agentId,
    owner_user_id: event.ownerUserId ?? null,
    credential_ref: event.credentialRef ?? null,
    virtue_domain: event.virtueDomain,
    event_type: event.eventType,
    artifact_kind: event.artifactKind,
    artifact_ref: event.artifactRef,
    payload: event.payload, // KG7 — object passed directly
    occurred_at: event.occurredAt,
    correlation_id: event.correlationId ?? null,
    retain_until: new Date(Date.parse(event.occurredAt) + RETENTION_MS).toISOString(),
  }
}

// ============================================================================
// EMISSION (measure mode; awaited; fail-honest — never throws to a live route)
// ============================================================================

/**
 * Emit a batch of trust events (events are applied in array order). Inserts each
 * event idempotently, then folds NEWLY-inserted domain events into
 * agent_trust_state; reflect events (null domain) update the agent's reflect
 * timestamp across all its domain rows. Returns the count written. Fail-honest.
 */
export async function emitTrustEvents(
  events: TrustEvent[],
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ written: number }>> {
  try {
    let written = 0
    for (const event of events) {
      const inserted = await insertEvent(event, client)
      if (!inserted.ok) {
        // PA-7 fold (2026-07-11): a RETURNED (non-thrown) store failure must be
        // LOUD — the header's log-and-continue contract's "log" half. The batch
        // stops here (this event + the rest are lost); the caller's live write
        // is unaffected (measure mode).
        console.error(
          `[trust-core] emitTrustEvents: insert failed at ${event.eventType} — events lost:`,
          inserted.error,
        )
        return inserted
      }
      if (!inserted.value.inserted) continue // duplicate — state already folded
      written++
      if (event.virtueDomain === null) {
        await applyReflectAcrossDomains(event, client)
      } else {
        await foldDomainEvent(event, client)
      }
    }
    return { ok: true, value: { written } }
  } catch (e) {
    const error = `emitTrustEvents threw: ${(e as Error).message}`
    console.error('[trust-core] ' + error) // PA-7: loud, never silent
    return { ok: false, error }
  }
}

async function insertEvent(
  event: TrustEvent,
  client: SupabaseClient,
): Promise<StoreResult<{ inserted: boolean }>> {
  const { error } = await client.from(EVENTS_TABLE).insert(eventToRow(event)).select('id')
  if (error) {
    if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
      return { ok: true, value: { inserted: false } } // duplicate — benign
    }
    if (isMissingTableError(error as { code?: string; message?: string })) {
      // Table not migrated yet (should not happen behind the flag, but stay honest).
      return { ok: true, value: { inserted: false } }
    }
    return { ok: false, error: `insertEvent(${event.eventType}): ${error.message}` }
  }
  return { ok: true, value: { inserted: true } }
}

/** Fold one domain event into agent_trust_state (read current → applyTrustEvent →
 *  upsert). Config (prior/volatility) is set on first insert; a new row inherits
 *  the agent's latest reflect timestamp so decay modulation is correct. */
async function foldDomainEvent(event: TrustEvent, client: SupabaseClient): Promise<void> {
  const domain = event.virtueDomain as VirtueTrustDomain
  const { data: existing, error: readError } = await client
    .from(STATE_TABLE)
    .select('*')
    .eq('agent_id', event.agentId)
    .eq('virtue_domain', domain)
    .maybeSingle()

  if (readError) {
    // PA-3 fold (2026-07-11 pre-activation audit): a REAL read error must ABORT
    // the fold — falling through to the seed branch would upsert-overwrite the
    // agent's earned state with a fresh habitual/high-volatility prior (a silent
    // BACKWARD reset, a different direction than the disclosed state-behind
    // class). The ledger insert already succeeded, so the worst case is
    // state-behind — logged, repairable by replaying the ledger. Missing-table
    // stays benign-quiet (schema-drift class; the insert no-ops the same way).
    if (!isMissingTableError(readError as { code?: string; message?: string })) {
      console.error(
        `[trust-core] foldDomainEvent(${event.eventType}/${domain}): state read failed — fold skipped (state-behind):`,
        (readError as { message?: string }).message,
      )
    }
    return
  }

  let prior: EarnedDomainState
  if (existing) {
    prior = rowToEarnedState(existing as TrustStateRow)
  } else {
    prior = {
      earnedLevel: 'habitual',
      profilePrior: 'habitual',
      volatility: 'high',
      lastDomainActivityAt: null,
      reflectLastHonestAt: await resolveLatestReflectAt(
        event.agentId,
        'reflect-completed-honest',
        client,
      ),
      reflectLastScreenedAt: await resolveLatestReflectAt(
        event.agentId,
        'reflect-screened-honest',
        client,
      ),
      justiceFloorActive: false,
      coverageStatus: null,
    }
  }

  const next = applyTrustEvent(prior, event)
  const retainUntil = new Date(Date.parse(event.occurredAt) + RETENTION_MS).toISOString()

  const row: TrustStateRow = {
    agent_id: event.agentId,
    virtue_domain: domain,
    owner_user_id: event.ownerUserId ?? (existing?.owner_user_id ?? null),
    credential_ref: event.credentialRef ?? (existing?.credential_ref ?? null),
    earned_level: next.earnedLevel,
    profile_prior: next.profilePrior,
    volatility_rating: next.volatility,
    last_domain_activity_at: next.lastDomainActivityAt,
    reflect_last_honest_at: next.reflectLastHonestAt,
    // S9b deploy-order safety (the build-dark-migrate-later lesson, applied to a
    // LIVE-flag surface): the screened column is written ONLY when a value
    // exists. Pre-migration no reflect-screened-honest event can be inserted
    // (the event-type CHECK rejects it), so the value is always null then and
    // the upsert never names an unknown column (no PGRST204 fold regression).
    ...(next.reflectLastScreenedAt != null
      ? { reflect_last_screened_at: next.reflectLastScreenedAt }
      : {}),
    justice_floor_active: next.justiceFloorActive,
    coverage_status: next.coverageStatus,
    updated_at: new Date().toISOString(),
    retain_until: retainUntil,
  }
  const { error: upsertError } = await client
    .from(STATE_TABLE)
    .upsert(row, { onConflict: 'agent_id,virtue_domain' })
  if (upsertError && !isMissingTableError(upsertError as { code?: string; message?: string })) {
    // PA-3/PA-7 (2026-07-11): a failed state write is state-behind — log it
    // (never throw; the ledger stays authoritative).
    console.error(
      `[trust-core] foldDomainEvent(${event.eventType}/${domain}): state upsert failed (state-behind):`,
      (upsertError as { message?: string }).message,
    )
  }
}

/** Reflect event (agent-wide, null domain): set the matching reflect timestamp
 *  across the agent's existing domain rows (agent-wide decay modulation). S9b:
 *  reflect-screened-honest targets reflect_last_screened_at (quarter-rate);
 *  reflect-completed-honest targets reflect_last_honest_at (half-rate). A domain
 *  row created LATER inherits both via the seed resolvers. */
async function applyReflectAcrossDomains(
  event: TrustEvent,
  client: SupabaseClient,
): Promise<void> {
  const retainUntil = new Date(Date.parse(event.occurredAt) + RETENTION_MS).toISOString()
  const timestampColumn =
    event.eventType === 'reflect-screened-honest'
      ? 'reflect_last_screened_at'
      : 'reflect_last_honest_at'
  const { error } = await client
    .from(STATE_TABLE)
    .update({
      [timestampColumn]: event.occurredAt,
      retain_until: retainUntil,
      updated_at: new Date().toISOString(),
    })
    .eq('agent_id', event.agentId)
  if (error && !isMissingTableError(error as { code?: string; message?: string })) {
    // PA-7 (2026-07-11): state-behind must be loud, never silent.
    console.error(
      '[trust-core] applyReflectAcrossDomains: update failed (state-behind):',
      (error as { message?: string }).message,
    )
  }
}

/** The agent's latest reflect timestamp of the given type from the ledger (for
 *  seeding a new domain row's decay modulation — full or screened, S9b).
 *  Read-only; null on any miss/error. */
async function resolveLatestReflectAt(
  agentId: string,
  eventType: 'reflect-completed-honest' | 'reflect-screened-honest',
  client: SupabaseClient,
): Promise<string | null> {
  try {
    const { data, error } = await client
      .from(EVENTS_TABLE)
      .select('occurred_at')
      .eq('agent_id', agentId)
      .eq('event_type', eventType)
      .order('occurred_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error || !data) return null
    return (data as { occurred_at: string }).occurred_at ?? null
  } catch {
    return null
  }
}

// ============================================================================
// READ (measure mode)
// ============================================================================

/** Read an agent's full trust profile (decayed + capped + aggregated, lazy-on-read
 *  E3). `now` injected for determinism in tests. Fail-honest.
 *
 *  `opts.strictMissingTable` (S10 fold, 2026-07-12 — the S10-ABUSE-1 finding; the
 *  A-3 regex class in a NEW direction): the missing-table-benign fold is correct
 *  for the data-rights paths (Live before the migration), but on the PUBLIC read
 *  surface — where the table must exist — a transient PostgREST schema-cache
 *  error matching the regex would read as a benign EMPTY profile and be served as
 *  a definitive, publicly-cached 404 ("no trust events have been folded") — a
 *  false public claim. Strict mode surfaces the failure as ok:false so the
 *  handler answers 503 no-store instead. Default false ⇒ every existing caller
 *  byte-identical. */
export async function readTrustProfile(
  agentId: string,
  now: Date = new Date(),
  client: SupabaseClient = getAdminClient(),
  opts?: { strictMissingTable?: boolean },
): Promise<StoreResult<TrustProfile>> {
  try {
    const { data, error } = await client
      .from(STATE_TABLE)
      .select('*')
      .eq('agent_id', agentId)
    if (error) {
      if (
        !opts?.strictMissingTable &&
        isMissingTableError(error as { code?: string; message?: string })
      ) {
        return { ok: true, value: emptyProfile(agentId) }
      }
      return { ok: false, error: `readTrustProfile: ${error.message}` }
    }
    const states = new Map<VirtueTrustDomain, EarnedDomainState>()
    for (const row of (data ?? []) as TrustStateRow[]) {
      states.set(row.virtue_domain as VirtueTrustDomain, rowToEarnedState(row))
    }
    return { ok: true, value: computeTrustProfile(agentId, states, now) }
  } catch (e) {
    return { ok: false, error: `readTrustProfile threw: ${(e as Error).message}` }
  }
}

/**
 * Read an agent's honest Sage Reflect record — the count + most-recent timestamp of
 * its `reflect-completed-honest` events (agent-wide; honest BY CONSTRUCTION —
 * deriveReflectEvent only emits them for honest completions: context_source
 * 'agent_stated' + fabrication_risk != high). The S7 L4 trust-tier derivation (mentor
 * A7 "a strong Sage Reflect history and a demonstrated pattern of honest
 * self-diagnosis") consumes this. Additive read — no existing S1 behaviour changed.
 * Fail-honest; counts in JS (no DB count option) so the in-memory fake works. The
 * recency window is applied later by the pure deriver (deriveL4TrustTier), not here.
 *
 * Bounded (S10 fold, 2026-07-12 — the S10-ABUSE-2 finding): the read is now
 * capped at HONEST_REFLECT_SUMMARY_ROW_CAP newest rows (order desc ⇒ the latest
 * timestamp is always inside the window), so a public unauthenticated GET can
 * never trigger an unbounded per-agent row fetch. At the cap the count
 * UNDER-reports (the safe direction) and `capped` is set so consumers can say so
 * honestly; the S7 L4 tier threshold (≥3) is far below the cap — unaffected.
 */
export const HONEST_REFLECT_SUMMARY_ROW_CAP = 500

export async function readHonestReflectSummary(
  agentId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<
  StoreResult<{ honestReflectCount: number; latestHonestReflectAt: string | null; capped?: boolean }>
> {
  try {
    const { data, error } = await client
      .from(EVENTS_TABLE)
      .select('occurred_at')
      .eq('agent_id', agentId)
      .eq('event_type', 'reflect-completed-honest')
      .order('occurred_at', { ascending: false })
      .limit(HONEST_REFLECT_SUMMARY_ROW_CAP)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: { honestReflectCount: 0, latestHonestReflectAt: null } }
      }
      return { ok: false, error: `readHonestReflectSummary: ${error.message}` }
    }
    const rows = (data ?? []) as { occurred_at: string }[]
    let latest: string | null = null
    for (const r of rows) {
      // ISO-8601 timestamps compare lexicographically in chronological order.
      if (r.occurred_at && (latest === null || r.occurred_at > latest)) latest = r.occurred_at
    }
    return {
      ok: true,
      value: {
        honestReflectCount: rows.length,
        latestHonestReflectAt: latest,
        capped: rows.length >= HONEST_REFLECT_SUMMARY_ROW_CAP,
      },
    }
  } catch (e) {
    return { ok: false, error: `readHonestReflectSummary threw: ${(e as Error).message}` }
  }
}

/**
 * A2 (practice reminders, agent Phase A2, 2026-07-28) — a bounded, AGENT-SCOPED
 * read of `credential-completed` events for the S4 developmental-flag scan
 * (`evaluateDevelopmentalFlags`, intervention-engine.ts §E). One row per engaged
 * cardinal virtue domain per accreditation write (`deriveCredentialAndJusticeEvents`),
 * sharing one `correlation_id` per write — the accreditation write IS the
 * `SessionDomainObservation.sessionId` unit (the 2026-07-28 mentor verdict Item 6:
 * "the accreditation write is the moment the agent submits its accumulated signed
 * examination chain… the more reliable boundary because it is externally triggered
 * and formally recorded").
 *
 * PR19 REVIEW FOLD (2026-07-28) — A DISCLOSED, OUT-OF-SESSION-SCOPE RESIDUAL.
 * Each observation's identity rests on `correlation_id`, produced upstream by
 * emitAccreditationTrustEvents (emission-hooks.ts, PRE-EXISTING S1 code, NOT
 * touched this session) as a sha256 digest of the WRITE's signatures joined in
 * SUBMITTED (unsorted) array order. A resubmission carrying the identical
 * evidence in a different array order therefore produces a DIFFERENT
 * correlation_id, bypassing the (correlation_id, event_type, virtue_domain)
 * unique-index dedup and potentially double-counting one write as two
 * observations here (inflating a streak). This is a genuine, CONFIRMED,
 * currently-live-in-production defect in existing S1 emission infrastructure —
 * not something this session introduced or can fix within its stated
 * code-elevated, dark-build scope (emission-hooks.ts is a live, flag-on
 * production file outside this session's file list). Flagged to the founder as
 * its own follow-up (a one-line root-cause fix: sort the signatures before
 * hashing); disclosed here so a reader of THIS function understands the
 * observation identity is not yet airtight against reordered retries.
 *
 * SCOPED BY agent_id, NOT credential_ref. This mirrors readTrustProfile's own
 * agent_id-scoped precedent for the S1 folded state (the SAME key
 * evaluateDevelopmentalFlags's domain concept already matches) — deliberately NOT
 * the M7 trajectory window's credential_ref scope, whose own docstring
 * (agent-assessment-history-store.ts, getTrajectoryWindow) explicitly defers
 * agent_id-keyed windows "to M8 credential-consolidation (where owner-binding
 * makes them R17a-safe)". Re-opening that deferred boundary is out of scope here;
 * this read is a DIFFERENT, coarser-cardinality surface (one row per engaged
 * domain per accreditation WRITE, not per consult) that the S1 fold already
 * treats as agent-scoped by design.
 *
 * Bounded: capped at DEVELOPMENTAL_OBSERVATION_ROW_CAP newest rows (order desc),
 * enough to reconstruct roughly the agent's ten most recent accreditation writes
 * across up to four cardinal domains each — comfortable margin over the
 * DEVELOPMENTAL_CONSISTENCY_THRESHOLD=3 streak the S4 engine detects, while
 * remaining a small, single, indexed query (mirrors readHonestReflectSummary's
 * cap precedent — the S10-ABUSE-2 lesson: always cap a read that scales with an
 * agent's lifetime history).
 *
 * Malformed rows (missing domain/correlation_id, or a level outside the
 * KatorthomaProximity vocabulary) are SKIPPED, never guessed — a partial
 * developmental read is honest; a fabricated one is not. Missing-table-benign +
 * fail-honest, mirroring every other trust-core-store read.
 *
 * PR19 review fold (2026-07-28) — THE LICENSED-FALLBACK DISCLOSURE. This feed's
 * consumer, evaluateDevelopmentalFlags (intervention-engine.ts, S4, unmodified
 * this session), detects a 3-CONSECUTIVE 'deliberate' STREAK per domain
 * (DEVELOPMENTAL_CONSISTENCY_THRESHOLD=3). That is NOT the mentor's first-choice
 * design — the 2026-07-28 verbatim record (Item 6) recommends a PLATEAU test
 * instead ("deliberate-level reasoning in at least three of the four most recent
 * accreditation writes in a domain, with no single write showing reflexive-level
 * reasoning"), explicitly because a streak "is brittle — one strong session
 * breaks it and resets the count." The verdict licenses the streak ONLY
 * conditionally: "If the engine cannot currently compute this, three consecutive
 * is an acceptable approximation — but note it as a known limitation and flag it
 * for revision when the storage change makes richer evidence available." This IS
 * that note. The condition for revisiting it is ALREADY MET by this function's
 * own design: DEVELOPMENTAL_OBSERVATION_ROW_CAP=40 retrieves comfortably more
 * than the plateau test needs (~10 writes × 4 domains) — computing the plateau
 * (4-of-most-recent, no-reflexive) is a NAMED FOLLOW-UP, to be built at the CALL
 * SITE (this function or its caller), never as a silent edit to the shared,
 * battery-locked S4 engine file.
 */
export const DEVELOPMENTAL_OBSERVATION_ROW_CAP = 40

function isKatorthomaProximityValue(v: unknown): v is keyof typeof PROXIMITY_RANK {
  return typeof v === 'string' && Object.prototype.hasOwnProperty.call(PROXIMITY_RANK, v)
}

export async function readDevelopmentalObservations(
  agentId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<SessionDomainObservation[]>> {
  try {
    const { data, error } = await client
      .from(EVENTS_TABLE)
      .select('virtue_domain, payload, occurred_at, correlation_id, created_at, id')
      .eq('agent_id', agentId)
      .eq('event_type', 'credential-completed')
      // PR19 review fold (2026-07-28): occurred_at alone has no tiebreak, so two
      // writes landing on the identical millisecond have an UNSPECIFIED relative
      // order absent a secondary key — Postgres gives no stability guarantee
      // across separate query executions. created_at (the ledger-write time,
      // always distinct per insert) and id (the row PK, always unique) are
      // deterministic fallbacks, in that order, so repeated reads of unchanged
      // data always return the same order and evaluateDevelopmentalFlags's own
      // stable re-sort deterministically preserves it. Neither needs to reach
      // SessionDomainObservation — this is ordering-only.
      .order('occurred_at', { ascending: false })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(DEVELOPMENTAL_OBSERVATION_ROW_CAP)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `readDevelopmentalObservations: ${error.message}` }
    }
    const rows = (data ?? []) as {
      virtue_domain: string | null
      payload: Record<string, unknown> | null
      occurred_at: string | null
      correlation_id: string | null
    }[]
    const observations: SessionDomainObservation[] = []
    for (const row of rows) {
      const level = row.payload?.demonstratedProximity
      if (
        row.virtue_domain === null ||
        row.correlation_id === null ||
        row.occurred_at === null ||
        !isKatorthomaProximityValue(level)
      ) {
        continue // malformed / incomplete row — skip, never guess
      }
      observations.push({
        sessionId: row.correlation_id,
        domain: row.virtue_domain as VirtueTrustDomain,
        level,
        occurredAt: row.occurred_at,
      })
    }
    return { ok: true, value: observations }
  } catch (e) {
    return { ok: false, error: `readDevelopmentalObservations threw: ${(e as Error).message}` }
  }
}

function emptyProfile(agentId: string): TrustProfile {
  return {
    schema: 'agent-trust-profile-v1',
    agentId,
    domains: [],
    aggregate: { level: null, limitingDomain: null, basis: 'no trust data', anyJusticeCapped: false },
    unevaluatedCardinalDomains: ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'],
    sparse: true,
  }
}

// ============================================================================
// DATA RIGHTS (R17c/R17i) — genuine deletion + export, missing-table-benign
// ============================================================================

/** Genuine deletion (R17c) of an operator's trust events + state. Called by
 *  /api/user/delete. */
export async function deleteTrustDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ events: number; state: number }>> {
  const events = await deleteBy(EVENTS_TABLE, 'owner_user_id', ownerUserId, client)
  if (!events.ok) return events
  const state = await deleteBy(STATE_TABLE, 'owner_user_id', ownerUserId, client)
  if (!state.ok) return state
  return { ok: true, value: { events: events.value, state: state.value } }
}

/** Genuine deletion (R17c) of an external-consumer credential's trust events +
 *  state. Called by /api/credential/erase (consumer-erasure). */
export async function deleteTrustDataForCredential(
  credentialRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ events: number; state: number }>> {
  const events = await deleteBy(EVENTS_TABLE, 'credential_ref', credentialRef, client)
  if (!events.ok) return events
  const state = await deleteBy(STATE_TABLE, 'credential_ref', credentialRef, client)
  if (!state.ok) return state
  return { ok: true, value: { events: events.value, state: state.value } }
}

async function deleteBy(
  table: string,
  column: string,
  value: string,
  client: SupabaseClient,
): Promise<StoreResult<number>> {
  try {
    const { data, error } = await client.from(table).delete().eq(column, value).select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: 0 }
      }
      return { ok: false, error: `delete ${table} by ${column}: ${error.message}` }
    }
    return { ok: true, value: (data as unknown[] | null)?.length ?? 0 }
  } catch (e) {
    return { ok: false, error: `delete ${table} threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) an operator's trust events + state. Called by /api/user/export. */
export async function getTrustDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ events: unknown[]; state: unknown[] }>> {
  const events = await selectBy(EVENTS_TABLE, 'owner_user_id', ownerUserId, client)
  if (!events.ok) return events
  const state = await selectBy(STATE_TABLE, 'owner_user_id', ownerUserId, client)
  if (!state.ok) return state
  return { ok: true, value: { events: events.value, state: state.value } }
}

async function selectBy(
  table: string,
  column: string,
  value: string,
  client: SupabaseClient,
): Promise<StoreResult<unknown[]>> {
  try {
    const { data, error } = await client.from(table).select('*').eq(column, value)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `select ${table} by ${column}: ${error.message}` }
    }
    return { ok: true, value: (data ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `select ${table} threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// RETENTION SWEEP (R17c) — hard-delete past retain_until; fail-honest (cron shape)
// ============================================================================

/** Purge both trust tables past retain_until. Returns the cron-friendly shape
 *  ({ deleted, error }, NOT StoreResult) so the sweep route spreads it. Fail-honest:
 *  a missing env / missing table never throws or fails closed. */
export async function purgeExpiredTrustCore(
  client?: SupabaseClient,
): Promise<{ deleted: number; events: number; state: number; error: string | null }> {
  try {
    const db = client ?? getAdminClient()
    const nowIso = new Date().toISOString()
    const events = await purgeTable(EVENTS_TABLE, nowIso, db)
    const state = await purgeTable(STATE_TABLE, nowIso, db)
    const error = events.error ?? state.error
    return { deleted: events.deleted + state.deleted, events: events.deleted, state: state.deleted, error }
  } catch (e) {
    return { deleted: 0, events: 0, state: 0, error: `purgeExpiredTrustCore threw: ${(e as Error).message}` }
  }
}

async function purgeTable(
  table: string,
  nowIso: string,
  client: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  const { data, error } = await client.from(table).delete().lt('retain_until', nowIso).select('id')
  if (error) {
    if (isMissingTableError(error as { code?: string; message?: string })) {
      return { deleted: 0, error: null }
    }
    return { deleted: 0, error: `purge ${table}: ${error.message}` }
  }
  return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
}
