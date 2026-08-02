/**
 * consumer-erasure.ts — CI-14 Step 7: on-demand consumer-erasure-by-token.
 *
 * STATUS: NEW (2026-06-15, CI-14 completion). Implements ADR
 * `adopted/adr/2026-06-14-credential-consolidation.md` Migration §7 + the design
 * `operations/p1-rebuild-2026-06/ci14-step7-consumer-erasure-design.md`.
 *
 * WHAT THIS IS: the R17c "genuine deletion on request" path for
 * `owner_kind='external_consumer'` credentials — a third-party API consumer with NO
 * profiles account / NO user-JWT, whose only prior deletion path was the time-based
 * retention sweep. The consumer presents their own raw credential (or the admin
 * supplies its id) and this genuinely deletes their per-consult trajectory + removes
 * their identifying data from the credential row.
 *
 * WHY ANONYMISE-NOT-HARD-DELETE (the FK reality — see the design doc §2): a literal
 * hard-DELETE of the api_keys row would CASCADE-destroy the retained-by-law
 * loop_billing_events ledger (ON DELETE CASCADE) and can be BLOCKED by credential_audit
 * (NO ACTION). The existing /api/user/delete (R17c, operators) likewise never hard-
 * deletes api_keys — it SET-NULLs the owner + revokes, retaining billing/audit. So this
 * mirrors that posture: hard-DELETE the trajectory children (the personal/practice
 * data), anonymise + revoke the credential husk (anchors the retained ledger), and
 * de-personalise the retained billing (strip the agent_id identifier, keep the money).
 *
 * SCOPE GUARD: keys off `owner_user_id IS NULL` (the honest "no operator account / no
 * user-JWT path" signal) — robust to the owner_kind legacy-mint drift (6e §D). An
 * operator credential (owner_user_id non-null) is REFUSED here and routed to
 * /api/user/delete; the token path can never become a second deletion path for operator
 * data.
 *
 * RULE COMPLIANCE: KG1 (every I/O awaited; errors surfaced as discriminated results,
 * never thrown into a response); KG7 (credential_provenance jsonb — the object is passed
 * directly, no JSON.stringify); R17c (trajectory is a genuine hard DELETE); R3 (operates
 * only on owner_user_id-NULL rows — never an end-user / operator); R18f (honest result —
 * no false "deleted"). Lazy admin client (rule 4) — injectable for tests.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createHash } from 'node:crypto'

import {
  deleteAssessmentHistoryForCredential,
  type StoreResult,
} from './substrate/agent-assessment-history-store'
// Trust Layer S1 (2026-07-08) — genuine deletion (R17c) of a consumer credential's
// trust events + state, by credential_ref. Missing-table-benign.
import { deleteTrustDataForCredential } from './substrate/trust-core/trust-core-store'
import { deleteCollaborationDataForCredential } from './substrate/trust-core/collaboration-store'
// Stoa ST2 (R17c, 2026-08-03) — genuine deletion of the agent's Stoa entries by
// owning credential. Missing-table-benign until the migration lands.
import { deleteStoaDataForCredential } from './stoa/stoa-store'
import { deleteAgentSessions } from './sage-reflect/session-store'

// ============================================================================
// FLAG (SUBSTRATE_CONSUMER_ERASURE_ENABLED) — UNSET ⇒ the route is dark (503)
// ============================================================================

export const CONSUMER_ERASURE_ENV_VAR = 'SUBSTRATE_CONSUMER_ERASURE_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other ⇒ the erasure
 *  route returns 503 (dark; activate per a founder-elected 0c-ii). Read at call time
 *  (mirrors the substrate flags); the helpers below stay flag-free so they unit-test. */
export function isConsumerErasureEnabled(): boolean {
  return process.env[CONSUMER_ERASURE_ENV_VAR] === 'true'
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
        '[consumer-erasure] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const API_KEYS_TABLE = 'api_keys'
const BILLING_TABLE = 'loop_billing_events'

/** The marker written to suspended_reason on a consumer-erased row — also the
 *  idempotency signal (a re-presented token classifies as already_erased). */
export const CONSUMER_ERASURE_MARKER = 'consumer_erasure'

/** The columns the lookup selects — the scope-guard inputs + the provenance to merge. */
const ERASURE_SELECT =
  'id, owner_user_id, owner_kind, is_active, suspended_reason, key_prefix, ' +
  'purpose, credential_provenance, agent_id'

/** The looked-up credential row (the subset the erasure path needs). */
export interface ErasureCredentialRow {
  id: string
  owner_user_id: string | null
  owner_kind: string | null
  is_active: boolean
  suspended_reason: string | null
  key_prefix: string | null
  purpose: string | null
  credential_provenance: Record<string, unknown> | null
  /** S9b G2: the bound agent identity — the key for the agent-scoped reflect
   *  deletion (read BEFORE the anonymise step nulls it). */
  agent_id: string | null
}

// ============================================================================
// PURE SCOPE-GUARD CLASSIFIER (no I/O) — the unit-testable decision
// ============================================================================

export type ErasureClassification =
  | 'erasable' // external consumer (owner_user_id NULL), not yet erased
  | 'refuse_operator' // owner_user_id present ⇒ route to /api/user/delete
  | 'already_erased' // husk already carries the consumer-erasure marker (idempotent)
  | 'not_found' // no row resolved from the token/id

/**
 * The scope guard, as a pure function. Keys off owner_user_id (NOT owner_kind) so a
 * legacy-mint owner_kind='operator'+null-owner row is still correctly erasable. An
 * owner_user_id-bearing row is refused (operator → /api/user/delete). A row already
 * carrying the consumer-erasure marker is idempotent already_erased.
 */
export function classifyErasureTarget(
  row: ErasureCredentialRow | null,
): ErasureClassification {
  if (!row) return 'not_found'
  if (row.owner_user_id !== null) return 'refuse_operator'
  if (row.suspended_reason === CONSUMER_ERASURE_MARKER) return 'already_erased'
  return 'erasable'
}

// ============================================================================
// LOOKUPS (I/O) — DISTINGUISH a real DB error from a genuine miss
// ============================================================================
//
// R17/R18f honesty: a transient DB error must NOT be reported to a consumer as
// "no such credential" (a false definitive negative on a deletion-rights request —
// they would not retry, and their data would not be erased). So the lookups return a
// discriminated { row, error }: error set ⇒ the caller emits a retryable 5xx; error
// null + row null ⇒ a genuine miss (honest 404).

export interface ErasureLookup {
  row: ErasureCredentialRow | null
  error: string | null
}

/** Resolve a credential by the raw token the consumer presents (prefix-agnostic —
 *  any sr_* credential the consumer holds). SHA-256 → one indexed key_hash lookup. */
export async function lookupCredentialByTokenHash(
  rawToken: string,
  client: SupabaseClient = getAdminClient(),
): Promise<ErasureLookup> {
  const keyHash = createHash('sha256').update(rawToken).digest('hex')
  const { data, error } = await client
    .from(API_KEYS_TABLE)
    .select(ERASURE_SELECT)
    .eq('key_hash', keyHash)
    .maybeSingle()
  if (error) {
    return { row: null, error: (error as { message?: string }).message ?? 'lookup error' }
  }
  return { row: (data as unknown as ErasureCredentialRow | null) ?? null, error: null }
}

/** Resolve a credential by id (admin mode — the founder actions an erasure request). */
export async function lookupCredentialById(
  id: string,
  client: SupabaseClient = getAdminClient(),
): Promise<ErasureLookup> {
  const { data, error } = await client
    .from(API_KEYS_TABLE)
    .select(ERASURE_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) {
    return { row: null, error: (error as { message?: string }).message ?? 'lookup error' }
  }
  return { row: (data as unknown as ErasureCredentialRow | null) ?? null, error: null }
}

// ============================================================================
// THE ERASE (I/O) — genuine deletion of personal data; retained ledger preserved
// ============================================================================

export interface ErasureResult {
  trajectory_deleted: number
  /** Trust Layer S1 (R17c): trust events + state rows hard-deleted for this
   *  credential (agent_trust_events + agent_trust_state). */
  trust_deleted: number
  /** Trust Layer S5 (R17c): collaboration_records rows hard-deleted for this
   *  credential. */
  collaboration_deleted: number
  /** S9b G2 (R17c): sage_reflect_sessions rows hard-deleted for the credential's
   *  agent identity (agent-keyed — the disclosed shared-identity scope). */
  reflect_deleted: number
  /** Stoa ST2 (R17c): stoa_entries rows hard-deleted for this credential
   *  (credential_ref-keyed standing declarations — no sweep covers them). */
  stoa_deleted: number
  billing_depersonalised: number
  /** Non-fatal issues (e.g. the best-effort billing de-personalisation) — the
   *  personal data is gone regardless; these are surfaced for the audit record. */
  warnings: string[]
}

/**
 * Genuinely erase an external-consumer credential's personal data (R17c). The caller
 * MUST have classified the row as 'erasable' first. Three steps, in order:
 *   1. HARD-DELETE the trajectory children (agent_assessment_history by credential_ref)
 *      — the genuine deletion that must succeed (fail ⇒ ok:false, R17c verifiable).
 *   2. ANONYMISE + REVOKE the credential husk — null the identifying fields
 *      (owner_email/label/notes/agent_id), revoke (is_active=false), mark the erasure;
 *      keeps the row husk to anchor the retained-by-law billing/audit/usage rows.
 *      Must succeed (it removes the PII).
 *   3. DE-PERSONALISE the retained billing ledger (best-effort) — null the
 *      wrapper-supplied agent_id on loop_billing_events, keeping the financial facts.
 *      A failure here is a WARNING, not fatal (the personal data is already gone).
 * KG7: credential_provenance (jsonb) is passed as the merged object directly.
 */
export async function eraseExternalConsumerCredential(
  row: Pick<ErasureCredentialRow, 'id' | 'credential_provenance' | 'agent_id'>,
  client: SupabaseClient = getAdminClient(),
): Promise<StoreResult<ErasureResult>> {
  const warnings: string[] = []
  const credentialRef = `api_key:${row.id}`

  // 1. Genuine deletion of the trajectory (R17c critical).
  const traj = await deleteAssessmentHistoryForCredential(credentialRef, client)
  if (!traj.ok) return { ok: false, error: `trajectory: ${traj.error}` }

  // 1b. Genuine deletion of this credential's trust events + materialised state
  //     (Trust Layer S1, R17c critical — a fail is ok:false so erasure stays
  //     verifiable). Missing-table-benign until the migration lands.
  const trust = await deleteTrustDataForCredential(credentialRef, client)
  if (!trust.ok) return { ok: false, error: `trust: ${trust.error}` }

  // 1c. Genuine deletion of this credential's collaboration records (Trust Layer S5,
  //     R17c critical — a fail is ok:false so erasure stays verifiable).
  //     Missing-table-benign until the migration lands.
  const collab = await deleteCollaborationDataForCredential(credentialRef, client)
  if (!collab.ok) return { ok: false, error: `collaboration: ${collab.error}` }

  // 1c-ii. Stoa ST2 (R17c critical — a fail is ok:false so erasure stays
  //        verifiable): genuine deletion of this credential's Stoa entries
  //        (standing declarations, #24 — no retention sweep ever covers them,
  //        so this path is one of their only two exits). Missing-table-benign
  //        until the migration lands. Runs BEFORE step 2 anonymises the husk.
  const stoa = await deleteStoaDataForCredential(credentialRef, client)
  if (!stoa.ok) return { ok: false, error: `stoa: ${stoa.error}` }

  // 1d. S9b G2 (R17c — closes the Gate-1 Slice-5c named follow-up, 2026-07-11):
  //     genuine deletion of the credential's agent-keyed reflect sessions.
  //     HONEST SCOPE (disclosed): sage_reflect_sessions rows key on agent_id, not
  //     credential_ref — this deletes the reflect record of the AGENT IDENTITY the
  //     erased credential is bound to. Where several credentials share one
  //     agent_id (e.g. a loop identity), the shared identity's reflect rows go
  //     with the first erasure — the conservative direction for a deletion right
  //     (more is deleted, never less). Erase-by-token only reaches
  //     owner_user_id IS NULL credentials, so operator rows are never touched.
  //     A null agent_id (already-anonymised husk) has nothing to reach — 0 rows.
  let reflect_deleted = 0
  if (row.agent_id !== null && row.agent_id !== undefined && row.agent_id !== '') {
    const reflect = await deleteAgentSessions(row.agent_id)
    if (!reflect.ok) return { ok: false, error: `reflect: ${reflect.error}` }
    reflect_deleted = reflect.value.deleted
  }

  // 2. Anonymise + revoke the credential husk (removes PII; keeps the FK anchor).
  //    The WHERE re-asserts owner_user_id IS NULL — the scope guard enforced
  //    ATOMICALLY at write time (defense-in-depth on invariant 1: the token path can
  //    never touch operator data). Today owner_user_id is never mutated post-mint, so
  //    the read-time classify already guarantees this, but the predicate closes the
  //    theoretical TOCTOU window — if the row gained an owner between read and write
  //    the UPDATE matches 0 rows and we report failure rather than touch operator data.
  const erasedAt = new Date().toISOString()
  const provenance = {
    ...(row.credential_provenance ?? {}),
    erased_at: erasedAt,
    erased_basis: 'consumer_erasure_by_token',
  }
  const { data: anonRows, error: anonErr } = await client
    .from(API_KEYS_TABLE)
    .update({
      owner_email: null,
      label: '[erased]',
      notes: null,
      agent_id: null,
      is_active: false,
      revoked_at: erasedAt,
      suspended_reason: CONSUMER_ERASURE_MARKER,
      credential_provenance: provenance, // KG7 — jsonb object passed directly
    })
    .eq('id', row.id)
    .is('owner_user_id', null) // atomic scope guard — never operator data
    .select('id')
  if (anonErr) return { ok: false, error: `anonymise: ${anonErr.message}` }
  if (((anonRows as unknown[] | null)?.length ?? 0) === 0) {
    // The owner-null predicate matched no row (already gone, or it gained an owner) —
    // honest failure, never a false "erased". The trajectory delete above is
    // idempotent on retry.
    return { ok: false, error: 'anonymise: credential not found as an erasable (null-owner) row' }
  }

  // NOTE on credential_audit (R0 audit immutability): credential_audit rows are NOT
  // de-personalised or deleted here. They are an append-only audit ledger (R0), and —
  // verified — NO erasable (null-owner) credential ever has a credential_audit row:
  // only the accreditation + plugin-install mints write that table and both bind a
  // non-null operator owner (so those creds 409-refuse here). Were a future null-owner
  // audit-writing mint ever added, de-personalising the audit identifier would have to
  // be reconciled against R0 immutability at that point — flagged, not silently
  // handled. (loop_billing_events is a financial ledger, not an R0 audit record, so
  // stripping its agent_id identifier below is the right "keep the money, drop the id".)

  // 3. De-personalise the retained billing ledger (best-effort — strip the agent_id
  //    identifier, keep the money facts; a failure never strands the erasure).
  let billing_depersonalised = 0
  const { data: billRows, error: billErr } = await client
    .from(BILLING_TABLE)
    .update({ agent_id: null })
    .eq('api_key_id', row.id)
    .not('agent_id', 'is', null)
    .select('id')
  if (billErr) {
    warnings.push(`billing de-personalisation: ${billErr.message}`)
  } else {
    billing_depersonalised = (billRows as unknown[] | null)?.length ?? 0
  }

  return {
    ok: true,
    value: {
      trajectory_deleted: traj.value.deleted,
      trust_deleted: trust.value.events + trust.value.state,
      collaboration_deleted: collab.value,
      reflect_deleted,
      stoa_deleted: stoa.value,
      billing_depersonalised,
      warnings,
    },
  }
}
