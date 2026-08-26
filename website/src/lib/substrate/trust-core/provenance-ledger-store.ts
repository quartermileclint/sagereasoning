/**
 * provenance-ledger-store.ts — the DB seam for the signature-keyed
 * extraction-provenance ledger (ruled option (a); SCOPE §4).
 *
 * SLICE 1 built ONLY the R17 data-rights functions (genuine deletion + export
 * by owner/credential) for the two new, empty, inert tables.
 *
 * SLICE 2 (this file, this section) adds: the ledger's own flag
 * (SUBSTRATE_PROVENANCE_LEDGER_ENABLED — round-6 ruling, Q6: the two new
 * purge functions gate INTERNALLY on this flag, never on the shared
 * SUBSTRATE_TRAJECTORY_SWEEP_ENABLED, never a dedicated third flag); the
 * consult-side write (persistProvenanceLedgerEntry, insert-once via
 * ON-CONFLICT-benign on signature_hash — SCOPE §4.3); the accreditation-write-
 * boundary lookup (lookupProvenanceLedgerEntry, fail-honest — an I/O error is
 * a DISTINCT `ok:false`, never silently coerced into a lookup-miss, SCOPE
 * §5's "not fail-open" rule); and the two PR24 purge functions
 * (purgeExpiredProvenanceLedger / purgeExpiredProvenanceGaps), mirroring
 * agent-assessment-history-store.ts's purgeExpiredTrajectory exactly.
 *
 * Slice 3 wires the served `provenance_gaps` payload read; slice 5 wires
 * ENFORCE-phase writes to agent_provenance_gaps, reusing the pure classifier
 * in provenance-classification.ts unchanged.
 *
 * Two tables, one file (mirrors trust-core-store.ts's EVENTS_TABLE/STATE_TABLE
 * pairing): agent_provenance_ledger (the signature-keyed record) and
 * agent_provenance_gaps (F-2's refusal record). A single owner/credential
 * deletion or export touches both and folds their counts, since they always
 * travel together in every data-rights path.
 */

import { createHash } from 'crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  resolveLongitudinalIdentity,
  type LongitudinalIdentityInput,
} from '../longitudinal-identity'

// ============================================================================
// SHARED PLUMBING (mirrors trust-core-store.ts / collaboration-store.ts)
// ============================================================================

export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string }

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[substrate/provenance-ledger-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const LEDGER_TABLE = 'agent_provenance_ledger'
const GAPS_TABLE = 'agent_provenance_gaps'

/** Postgres unique_violation — a retried write conflicting on signature_hash
 *  (insert-once, SCOPE §4.3) or correlation_id. Treated as a benign no-op. */
const PG_UNIQUE_VIOLATION = '23505'

// ============================================================================
// FLAG (SUBSTRATE_PROVENANCE_LEDGER_ENABLED) — UNSET = byte-identical
// ============================================================================
//
// Its OWN flag (SCOPE §4.2, the slice-1 prompt's own "no flag" constraint,
// which named this flag as slice 2's to create) — never a reuse of
// isTrajectoryWriteEnabled() or any other existing flag. UNSET ⇒ the
// consult-side write never runs (byte-identical /api/reason), the
// accreditation-write-boundary classification never runs (byte-identical
// emitAccreditationTrustEvents — record-only, and inert flag-off), and BOTH
// new purge functions are documented no-ops (round-6 ruling, Q6 — gate
// INTERNALLY on this flag, never on the shared trajectory-sweep flag, which
// is already `true` in production; riding that flag would make the purges
// "dark" only by the coincidence of the tables being empty, not by the flag's
// own meaning — the exact shape the Stoa ST3/ST4 incident named as a standing
// rule: dark is per-flag, not per-feature).
export const PROVENANCE_LEDGER_ENV_VAR = 'SUBSTRATE_PROVENANCE_LEDGER_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other → the
 *  write, the classification loop, and both purges are all no-ops. */
export function isProvenanceLedgerEnabled(): boolean {
  return process.env[PROVENANCE_LEDGER_ENV_VAR] === 'true'
}

/** SCOPE §7: 90-day retention, matching the trust-core/hold-observations
 *  family. Exported so the classification pure function (provenance-
 *  classification.ts) can default its window without importing an env read
 *  (it stays pure — see that file's header). */
export const PROVENANCE_LEDGER_RETENTION_DAYS = 90

/** True when the error means "this table does not exist yet" — both new
 *  tables are their own founder-walked migration step, so a delete/export
 *  BEFORE they land must succeed (nothing to touch). A REAL post-migration
 *  failure is NOT matched and surfaces as ok:false. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  const msg = error.message ?? ''
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

// ============================================================================
// DATA RIGHTS (R17c/R17i) — genuine deletion + export, missing-table-benign
// ============================================================================

/** Genuine deletion (R17c) of an operator's provenance-ledger entries + gap
 *  records. Called by /api/user/delete. */
export async function deleteProvenanceDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ ledger: number; gaps: number }>> {
  const ledger = await deleteBy(LEDGER_TABLE, 'owner_user_id', ownerUserId, client)
  if (!ledger.ok) return ledger
  const gaps = await deleteBy(GAPS_TABLE, 'owner_user_id', ownerUserId, client)
  if (!gaps.ok) return gaps
  return { ok: true, value: { ledger: ledger.value, gaps: gaps.value } }
}

/** Genuine deletion (R17c) of an external-consumer credential's
 *  provenance-ledger entries + gap records. Called by /api/credential/erase
 *  (consumer-erasure). */
export async function deleteProvenanceDataForCredential(
  credentialRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ ledger: number; gaps: number }>> {
  const ledger = await deleteBy(LEDGER_TABLE, 'credential_ref', credentialRef, client)
  if (!ledger.ok) return ledger
  const gaps = await deleteBy(GAPS_TABLE, 'credential_ref', credentialRef, client)
  if (!gaps.ok) return gaps
  return { ok: true, value: { ledger: ledger.value, gaps: gaps.value } }
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

/** Export (R17i) an operator's provenance-ledger entries + gap records.
 *  Called by /api/user/export. */
export async function getProvenanceDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<{ ledger: unknown[]; gaps: unknown[] }>> {
  const ledger = await selectBy(LEDGER_TABLE, 'owner_user_id', ownerUserId, client)
  if (!ledger.ok) return ledger
  const gaps = await selectBy(GAPS_TABLE, 'owner_user_id', ownerUserId, client)
  if (!gaps.ok) return gaps
  return { ok: true, value: { ledger: ledger.value, gaps: gaps.value } }
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
// SLICE 2 — the consult-side write (Step 3)
// ============================================================================

/** The write's identity inputs — the SAME shape resolveLongitudinalIdentity
 *  takes (LongitudinalIdentityInput), plus the two ledger-specific facts.
 *  No second identity notion (SCOPE §3): this function calls
 *  resolveLongitudinalIdentity internally to derive `identity_kind`, but
 *  persists the RAW `agentId` on the `agent_id` column regardless of branch —
 *  the migration's own header states agent_id "MAY also be set on the
 *  credential branch" (the agent-declared-but-owner-less shape), a fact the
 *  LongitudinalIdentity TYPE deliberately does not carry (its `credential`
 *  branch exposes only the `agent_declared` boolean, not the string) because
 *  no prior consumer of that module needed the raw value back. This store is
 *  the first that does, so it takes the raw identity inputs rather than a
 *  pre-resolved LongitudinalIdentity. */
export interface PersistProvenanceLedgerEntryInput extends LongitudinalIdentityInput {
  /** The RAW base64 Ed25519 signature (SignedLayer2Assessment.signature) —
   *  HASHED here (sha256, hex); the raw value is never persisted (F-2's hard
   *  exclusion — the sibling migration's header). Caller must have already
   *  confirmed this is a non-empty string ("gate on a signature being
   *  present" — the slice-2 prompt's Step 1 ruled table; signing off ⇒
   *  nothing to key on ⇒ the caller skips the write entirely). */
  signature: string
  /** 'server' | 'supplied' — computed UNCONDITIONALLY at the call site from
   *  `preExtractedLayer1Schema !== undefined` (SCOPE §2 fact 6 / §4.2).
   *  NEVER gated behind SUBSTRATE_TRAJECTORY_DELTA_ENABLED or any other flag
   *  — that would inherit the trajectory-delta blind window this ledger
   *  exists specifically to avoid. */
  layer1Source: 'server' | 'supplied'
  /** The consult time (SCOPE §0.3/§8 — load-bearing for the PA-10/A5-recency-
   *  tier dependency this ledger enables). Injected, not read via `new
   *  Date()` inside this function, so the caller can share ONE timestamp
   *  between this write and the sibling M6 trajectory write (Step 3's "both
   *  rows agree on the moment" instruction). */
  recordedAt: Date
}

/**
 * Persist one signature-keyed provenance-ledger row. Insert-once (SCOPE
 * §4.3): a duplicate `signature_hash` (UNIQUE) is a benign no-op
 * ('already_recorded'), never an upsert, never a logged failure — the
 * database enforces insert-once, not application ordering (this project's
 * standing idiom, mirrored from persistAssessmentHistory /
 * emitLedgerOnlyTrustEvents). Any OTHER error is surfaced as `ok:false` and
 * logged non-fatally by the caller; this write must never be able to fail
 * the consult (mirrors the M6 trajectory write's fail-honest posture
 * exactly — the M1 election).
 */
export async function persistProvenanceLedgerEntry(
  input: PersistProvenanceLedgerEntryInput,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<'inserted' | 'already_recorded'>> {
  try {
    const identity = resolveLongitudinalIdentity({
      credentialRef: input.credentialRef,
      ownerUserId: input.ownerUserId,
      agentId: input.agentId,
    })
    const signatureHash = createHash('sha256').update(input.signature).digest('hex')
    const row = {
      signature_hash: signatureHash,
      identity_kind: identity.kind,
      // owner_user_id set ONLY on the pair branch (the CHECK's second clause
      // requires it NULL on the credential branch — apl_identity_kind_
      // consistency in the migration).
      owner_user_id: identity.kind === 'owner_agent_pair' ? identity.owner_user_id : null,
      // agent_id is the RAW input, present on either branch when declared —
      // see this function's own header comment for why the resolved
      // LongitudinalIdentity type cannot supply it on the credential branch.
      agent_id: input.agentId,
      credential_ref: input.credentialRef,
      layer1_source: input.layer1Source,
      recorded_at: input.recordedAt.toISOString(),
    }
    const { error } = await client.from(LEDGER_TABLE).insert(row)
    if (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        return { ok: true, value: 'already_recorded' } // insert-once — benign
      }
      return { ok: false, error: `persistProvenanceLedgerEntry: ${error.message}` }
    }
    return { ok: true, value: 'inserted' }
  } catch (e) {
    return { ok: false, error: `persistProvenanceLedgerEntry threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// SLICE 2 — the accreditation-write-boundary lookup (Step 2 / SCOPE §5)
// ============================================================================

/** The fields SCOPE §5's classification needs from a resolved ledger row.
 *  Deliberately excludes `signature_hash` (never re-served, never re-hashed
 *  by a caller — this store is the only place that computes it). */
export interface ProvenanceLedgerLookupHit {
  identity_kind: 'owner_agent_pair' | 'credential'
  owner_user_id: string | null
  agent_id: string | null
  layer1_source: 'server' | 'supplied'
  recorded_at: string
}

/** The lookup's DATA outcome — deliberately distinct from the I/O `StoreResult`
 *  wrapper (an I/O failure is `StoreResult`'s `ok:false`, never coerced into
 *  `found:false` — SCOPE §5's "fail-honest, not fail-open" rule: "a ledger
 *  read that errors is not a missing entry"). The pure classifier
 *  (provenance-classification.ts) is only ever given this type, never a raw
 *  I/O error — a caller whose lookup returned `ok:false` must log the I/O
 *  failure distinctly and skip classification for that artifact entirely. */
export type ProvenanceLedgerLookupOutcome =
  | { found: true; entry: ProvenanceLedgerLookupHit }
  | { found: false }

/**
 * Resolve one artifact's ledger entry by its (raw, unhashed) signature — this
 * function hashes it. Fail-honest: a missing table (pre-migration deployment)
 * is `ok:true, value:{found:false}` is WRONG and NOT what this returns —
 * see below. A missing-table error is a genuine INSTRUMENT failure (the
 * ledger cannot be consulted at all), not a lookup miss, so it surfaces as
 * `ok:false` exactly like any other read error (SCOPE §5).
 */
export async function lookupProvenanceLedgerEntry(
  signature: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<ProvenanceLedgerLookupOutcome>> {
  try {
    const signatureHash = createHash('sha256').update(signature).digest('hex')
    const { data, error } = await client
      .from(LEDGER_TABLE)
      .select('identity_kind, owner_user_id, agent_id, layer1_source, recorded_at')
      .eq('signature_hash', signatureHash)
      .maybeSingle()
    if (error) {
      // Deliberately NOT isMissingTableError-benign here (contrast the R17
      // delete/select helpers above): a missing table means the ledger
      // cannot be consulted at all, which is an instrument failure the
      // classifier must never see as a genuine "no entry" (SCOPE §5).
      return { ok: false, error: `lookupProvenanceLedgerEntry: ${error.message}` }
    }
    if (!data) return { ok: true, value: { found: false } }
    const row = data as ProvenanceLedgerLookupHit
    return {
      ok: true,
      value: {
        found: true,
        entry: {
          identity_kind: row.identity_kind,
          owner_user_id: row.owner_user_id,
          agent_id: row.agent_id,
          layer1_source: row.layer1_source,
          recorded_at: row.recorded_at,
        },
      },
    }
  } catch (e) {
    return { ok: false, error: `lookupProvenanceLedgerEntry threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// SLICE 2 — PR24 retention purges (Step 4)
// ============================================================================
//
// Mirrors purgeExpiredTrajectory (agent-assessment-history-store.ts) exactly:
// { deleted, error } shape (not StoreResult) so the cron handler can spread it
// directly; missing-table ⇒ benign { deleted: 0, error: null }; a REAL error
// is surfaced (never fail-closed — a failed purge never affects a live
// response, and this is a cron with no user-facing response to protect
// anyway); the admin client is resolved INSIDE the try (never a default
// parameter, which would evaluate before the try and let a missing-env throw
// escape uncaught).
//
// GATED INTERNALLY on isProvenanceLedgerEnabled() (round-6 ruling, Q6) — NOT
// on isTrajectorySweepEnabled(). Calling either function when the ledger's
// own flag is unset is a documented no-op: no DB touch at all, not even a
// query that would return zero rows. This is deliberately NOT symmetrical
// with purgeExpiredTrajectory (which has no internal flag check of its own —
// its caller, the cron handler, gates it) precisely because the ruling
// requires these two specific functions to carry their own gate, so that
// calling them from ANY future call site (not only this cron) can never
// accidentally activate the ledger's sweep ahead of the ledger's own flag.

/** Purge expired agent_provenance_ledger rows (retain_until < now()). A
 *  documented no-op — zero DB work — when SUBSTRATE_PROVENANCE_LEDGER_ENABLED
 *  is unset. */
export async function purgeExpiredProvenanceLedger(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  if (!isProvenanceLedgerEnabled()) return { deleted: 0, error: null }
  try {
    const db = client ?? getAdminClient()
    const { data, error } = await db
      .from(LEDGER_TABLE)
      .delete()
      .lt('retain_until', new Date().toISOString())
      .select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { deleted: 0, error: null }
      }
      return { deleted: 0, error: `purgeExpiredProvenanceLedger: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    return { deleted: 0, error: `purgeExpiredProvenanceLedger threw: ${(e as Error).message}` }
  }
}

/** Purge expired agent_provenance_gaps rows (retain_until < now()). A
 *  documented no-op — zero DB work — when SUBSTRATE_PROVENANCE_LEDGER_ENABLED
 *  is unset. */
export async function purgeExpiredProvenanceGaps(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  if (!isProvenanceLedgerEnabled()) return { deleted: 0, error: null }
  try {
    const db = client ?? getAdminClient()
    const { data, error } = await db
      .from(GAPS_TABLE)
      .delete()
      .lt('retain_until', new Date().toISOString())
      .select('id')
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { deleted: 0, error: null }
      }
      return { deleted: 0, error: `purgeExpiredProvenanceGaps: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    return { deleted: 0, error: `purgeExpiredProvenanceGaps threw: ${(e as Error).message}` }
  }
}
