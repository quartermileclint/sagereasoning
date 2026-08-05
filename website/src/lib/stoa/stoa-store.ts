/**
 * stoa-store.ts — the DB seam for The Stoa's entry model (ST2).
 *
 * The Stoa is the connective layer: one voluntary self-declaration per
 * practitioner (human or agent), under the fourteen adopted mentor rulings
 * (binding verbatim: operations/connective-layer-2026-08/2026-08-02-mentor-
 * consultation-connective-layer-verbatim.md; constraint numbers below cite the
 * build plan §2 table).
 *
 * STRUCTURAL SEPARATION (#20, Q6c — both directions): this module imports NO
 * trust-core / kathekon / practice / suggestion / milestone / reflect module,
 * and none of those modules read stoa_entries. Nothing about Stoa presence or
 * use ever feeds a trust record, practice profile, milestone, or suggestion —
 * and nothing evaluative ever enters an entry. The ONE allowlisted
 * cross-boundary import is `isCanonicalAgentId` from the K1 agent-id
 * vocabulary: pure identity GRAMMAR (a format regex), zero data flow in either
 * direction — duplicating the canonical pattern locally would invite drift.
 * The boundary battery (stoa-boundary.test.ts) pins both directions and this
 * exact allowlist.
 *
 * HOUSE PATTERN (mirrors collaboration-store.ts): lazy injectable service-role
 * admin client, StoaStoreResult<T>, missing-table-benign READS (the data-rights
 * routes are Live before the migration lands), fail-honest WRITES (an error
 * never becomes a false success). All SERVING access is route-level over
 * service_role — the table is RLS deny-all for anon/authenticated (see the
 * migration §2 note: a client-side write policy would bypass ST3's R20a
 * distress check, and credentialed agents hold no Supabase JWT).
 *
 * RETENTION POSTURE (#24, Q9 — a deliberate contrast with the 90-day practice
 * records): entries are STANDING declarations. No retain_until, no sweep, no
 * expiry. They persist until the practitioner withdraws (status flip, their own
 * act) or erasure hard-deletes (data rights). Never add this table to any
 * retention sweep.
 *
 * ORDERING (#8, Q3a): declaration recency is the ONLY sort key — every .order()
 * call in this module keys declared_at (two exist: the serving list and the
 * own-entry read; battery-pinned as a universal property, §D). Renewal/edits
 * set renewed_at (honest ageing, #12/#24) but
 * never reorder: renewal-bumps-recency would be a float-to-top lever, an
 * engagement-adjacent incentive the space must not create (#23).
 *
 * NO ENGAGEMENT DATA (#23, Q8 sharpened): nothing here counts, records, or
 * exposes views, matches, or use — internally or externally.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
// The ONE allowlisted cross-boundary import — pure K1 identity grammar (see
// the header note + the boundary battery's allowlist).
import { isCanonicalAgentId } from '@/lib/substrate/trust-layer/accreditation/agent-id-vocabulary'

// ============================================================================
// SHARED PLUMBING
// ============================================================================

/** Locally defined (NOT imported from trust-core-store — the #20 boundary):
 *  the house ok/error result shape. */
export type StoaStoreResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[stoa/stoa-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const TABLE = 'stoa_entries'

/** Postgres unique_violation — a concurrent second active declare (#11). */
const PG_UNIQUE_VIOLATION = '23505'

/** True when the error means "this table does not exist yet" — the data-rights
 *  paths are Live but the migration is its own founder-walked step, so an
 *  erasure/export BEFORE the table lands must succeed (nothing to touch). A
 *  REAL post-migration failure is NOT matched and surfaces as ok:false. */
function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false
  // AE-1 hardening (PR19 fold, 2026-08-03): a missing COLUMN is NEVER benign.
  // Postgres undefined_column (42703) and PostgREST's PGRST204 ("Could not find
  // the '...' column of '...' in the schema cache") would otherwise match the
  // table-ish regexes below and FALSE-BENIGN — for THIS table that would let a
  // schema drift turn /api/credential/erase into a false "erased, 0 rows" on a
  // table whose ONLY exits are the data-rights paths (#24: no sweep, no FK
  // backstop for credential-keyed rows). Fail-honest instead.
  if (error.code === '42703' || error.code === 'PGRST204') return false
  const msg = error.message ?? ''
  if (/column/i.test(msg)) return false
  if (error.code === '42P01' || error.code === 'PGRST205') return true
  return /does not exist|could not find the table|schema cache/i.test(msg)
}

/** The activation flag (ST5). ST3/ST4 serving routes gate on this; the store's
 *  CRUD is flag-neutral (nothing calls it until those routes exist) and the
 *  data-rights functions are ALWAYS-ON (erasure/export cannot be flag-gated). */
export function isStoaEnabled(): boolean {
  return process.env.SUBSTRATE_STOA_ENABLED === 'true'
}

/** The shared read-path rate-limit config (PR19 fold, 2026-08-03: both read
 *  surfaces share the 'stoa-read' BUCKET, so the limits must be one literal —
 *  two drifting copies would enforce inconsistent limits against one shared
 *  counter with no compile-time signal). Dedicated category — never `scoring`
 *  (memory: rate-limit-bucket-couples-to-measured-surface). */
export const STOA_READ_RATE_LIMIT = {
  maxRequests: 60,
  windowSeconds: 60,
  category: 'stoa-read',
}

// ============================================================================
// VOCABULARY + TYPES
// ============================================================================

export type StoaVisibility = 'community' | 'public'
export type StoaStatus = 'active' | 'withdrawn' | 'removed'

/** Removal ONLY on the three ruled grounds (#16, Q5b). Modesty is never
 *  grounds. Exactly these three — nothing else may be added without re-opening
 *  the mentor record. */
export const STOA_REMOVAL_GROUNDS = [
  'dishonesty_examined',
  'injustice_facilitation',
  'spam_flooding',
] as const
export type StoaRemovalGround = (typeof STOA_REMOVAL_GROUNDS)[number]

/** Identity floor (#13, Q4a): account XOR credential. A discriminated union so
 *  the XOR is compile-time on every store call (the DB CHECK is the backstop). */
export type StoaIdentity =
  | { kind: 'human'; ownerUserId: string }
  | { kind: 'agent'; agentId: string; credentialRef: string }

/** Per-entry visibility defaults, identity-conditional (#1, Q1): community-only
 *  for humans, public for agents. */
export const STOA_DEFAULT_VISIBILITY: Record<StoaIdentity['kind'], StoaVisibility> = {
  human: 'community',
  agent: 'public',
}

/** The declaration's voluntary fields — the practitioner's OWN words (#15).
 *  Any subset may be present; an entry may exist with none. */
export interface StoaDeclarationInput {
  whatIBring?: string | null
  whatISeek?: string | null
  contactChannel?: string | null
  visibility?: StoaVisibility
  tags?: string[]
}

export interface StoaEntry {
  schema: 'stoa-entry-v1'
  id: string
  ownerUserId: string | null
  agentId: string | null
  credentialRef: string | null
  whatIBring: string | null
  whatISeek: string | null
  contactChannel: string | null
  visibility: StoaVisibility
  tags: string[]
  declaredAt: string
  renewedAt: string | null
  status: StoaStatus
  removalGround: StoaRemovalGround | null
  removalArtifactRef: string | null
}

// Store-level depth caps (defense; the ST3/ST4 routes add friendlier 400s).
const FIELD_MAX = 2000
const TAG_MAX = 40
const TAGS_MAX_COUNT = 12
const LIST_DEFAULT_LIMIT = 50
const LIST_MAX_LIMIT = 200

// ============================================================================
// ROW MAPPERS
// ============================================================================

interface StoaRow {
  id: string
  owner_user_id: string | null
  agent_id: string | null
  credential_ref: string | null
  what_i_bring: string | null
  what_i_seek: string | null
  contact_channel: string | null
  visibility: StoaVisibility
  tags: string[] | null
  declared_at: string
  renewed_at: string | null
  status: StoaStatus
  removal_ground: StoaRemovalGround | null
  removal_artifact_ref: string | null
}

function rowToEntry(row: StoaRow): StoaEntry {
  return {
    schema: 'stoa-entry-v1',
    id: row.id,
    ownerUserId: row.owner_user_id,
    agentId: row.agent_id,
    credentialRef: row.credential_ref,
    whatIBring: row.what_i_bring,
    whatISeek: row.what_i_seek,
    contactChannel: row.contact_channel,
    visibility: row.visibility,
    tags: Array.isArray(row.tags) ? row.tags : [],
    declaredAt: row.declared_at,
    renewedAt: row.renewed_at,
    status: row.status,
    removalGround: row.removal_ground,
    removalArtifactRef: row.removal_artifact_ref,
  }
}

function identityFilter(identity: StoaIdentity): { col: string; val: string } {
  return identity.kind === 'human'
    ? { col: 'owner_user_id', val: identity.ownerUserId }
    : { col: 'agent_id', val: identity.agentId }
}

/** Validate + normalise the voluntary fields. Returns an error string or the
 *  normalised column patch. Depth defense only — content judgement is never
 *  performed here (#15: their own words; the platform verifies nothing). */
function validateInput(
  input: StoaDeclarationInput,
): { ok: true; patch: Record<string, unknown> } | { ok: false; error: string } {
  const patch: Record<string, unknown> = {}
  const fields: Array<[keyof StoaDeclarationInput, string]> = [
    ['whatIBring', 'what_i_bring'],
    ['whatISeek', 'what_i_seek'],
    ['contactChannel', 'contact_channel'],
  ]
  for (const [key, col] of fields) {
    if (key in input) {
      const v = input[key] as string | null | undefined
      if (v === null || v === undefined) {
        patch[col] = null
      } else if (typeof v !== 'string') {
        return { ok: false, error: `${key} must be a string` }
      } else if (v.length > FIELD_MAX) {
        return { ok: false, error: `${key} exceeds ${FIELD_MAX} characters` }
      } else {
        const trimmed = v.trim()
        patch[col] = trimmed.length > 0 ? trimmed : null
      }
    }
  }
  if ('visibility' in input && input.visibility !== undefined) {
    if (input.visibility !== 'community' && input.visibility !== 'public') {
      return { ok: false, error: `visibility must be 'community' or 'public'` }
    }
    patch.visibility = input.visibility
  }
  if ('tags' in input && input.tags !== undefined) {
    if (!Array.isArray(input.tags)) return { ok: false, error: 'tags must be an array' }
    if (input.tags.length > TAGS_MAX_COUNT) {
      return { ok: false, error: `at most ${TAGS_MAX_COUNT} tags` }
    }
    const cleaned: string[] = []
    for (const t of input.tags) {
      if (typeof t !== 'string') return { ok: false, error: 'tags must be strings' }
      const trimmed = t.trim()
      if (trimmed.length === 0) continue
      if (trimmed.length > TAG_MAX) {
        return { ok: false, error: `tag exceeds ${TAG_MAX} characters` }
      }
      if (!cleaned.includes(trimmed)) cleaned.push(trimmed)
    }
    patch.tags = cleaned
  }
  return { ok: true, patch }
}

function validateIdentity(identity: StoaIdentity): string | null {
  if (identity.kind === 'human') {
    if (!identity.ownerUserId || typeof identity.ownerUserId !== 'string') {
      return 'ownerUserId required for a human identity'
    }
    return null
  }
  // Agents: strictly K1-canonical (namespace:name@version) — a NEW surface
  // admits no legacy agent_* ids (contrast the accreditation boundary's
  // accepted-legacy posture).
  if (!identity.agentId || !isCanonicalAgentId(identity.agentId)) {
    return 'agentId must be K1-canonical (namespace:name@version)'
  }
  if (!identity.credentialRef || typeof identity.credentialRef !== 'string') {
    return 'credentialRef required for an agent identity (#13 accountability)'
  }
  return null
}

// ============================================================================
// CRUD (consumed by ST3/ST4 routes; fail-honest — never throws to a route)
// ============================================================================

/**
 * Declare an entry (#11: one entry per practitioner).
 *  - an ACTIVE entry already exists → honest refusal (edit, don't re-declare)
 *  - a WITHDRAWN row exists → REACTIVATE it with the new content and a fresh
 *    declared_at (re-declaring is the reversal of withdrawal; one physical row
 *    per identity in the common path)
 *  - a REMOVED row exists → it does not block: removal removed THAT
 *    declaration, not the practitioner — a new row is inserted
 *  - otherwise → insert, with the identity-conditional visibility default (#1)
 */
export async function declareStoaEntry(
  identity: StoaIdentity,
  input: StoaDeclarationInput,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<{ entry: StoaEntry; reactivated: boolean }>> {
  const idErr = validateIdentity(identity)
  if (idErr) return { ok: false, error: idErr }
  const v = validateInput(input)
  if (!v.ok) return { ok: false, error: v.error }

  const { col, val } = identityFilter(identity)
  try {
    // Existing non-removed row for this identity?
    const { data: existing, error: readErr } = await client
      .from(TABLE)
      .select('*')
      .eq(col, val)
      .in('status', ['active', 'withdrawn'])
      .maybeSingle()
    if (readErr && !isMissingTableError(readErr as { code?: string; message?: string })) {
      return { ok: false, error: `declareStoaEntry read: ${readErr.message}` }
    }

    const existingRow = (existing ?? null) as StoaRow | null
    if (existingRow && existingRow.status === 'active') {
      return { ok: false, error: 'already_declared' } // #11 — edit instead
    }

    const nowIso = new Date().toISOString()
    const visibility: StoaVisibility =
      (v.patch.visibility as StoaVisibility | undefined) ??
      STOA_DEFAULT_VISIBILITY[identity.kind] // #1 defaults

    if (existingRow && existingRow.status === 'withdrawn') {
      // Reactivate: new content, fresh declaration date, renewal cleared.
      const { data, error } = await client
        .from(TABLE)
        .update({
          ...v.patch,
          visibility,
          status: 'active',
          declared_at: nowIso,
          renewed_at: null,
          updated_at: nowIso,
        })
        .eq('id', existingRow.id)
        .select('*')
        .maybeSingle()
      if (error) return { ok: false, error: `declareStoaEntry reactivate: ${error.message}` }
      if (!data) return { ok: false, error: 'declareStoaEntry reactivate: row not returned' }
      return { ok: true, value: { entry: rowToEntry(data as StoaRow), reactivated: true } }
    }

    const insertRow: Record<string, unknown> = {
      ...v.patch,
      visibility,
      status: 'active',
      declared_at: nowIso,
      owner_user_id: identity.kind === 'human' ? identity.ownerUserId : null,
      agent_id: identity.kind === 'agent' ? identity.agentId : null,
      credential_ref: identity.kind === 'agent' ? identity.credentialRef : null,
    }
    const { data, error } = await client.from(TABLE).insert(insertRow).select('*').maybeSingle()
    if (error) {
      if ((error as { code?: string }).code === PG_UNIQUE_VIOLATION) {
        return { ok: false, error: 'already_declared' } // concurrent duplicate — honest refusal
      }
      return { ok: false, error: `declareStoaEntry insert: ${error.message}` }
    }
    if (!data) return { ok: false, error: 'declareStoaEntry insert: row not returned' }
    return { ok: true, value: { entry: rowToEntry(data as StoaRow), reactivated: false } }
  } catch (e) {
    return { ok: false, error: `declareStoaEntry threw: ${(e as Error).message}` }
  }
}

/** Read one's own entry (any status except removed rows are included too — the
 *  owner may see their own removal record). Missing-table-benign → null. */
export async function readStoaEntryForIdentity(
  identity: StoaIdentity,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<StoaEntry | null>> {
  const idErr = validateIdentity(identity)
  if (idErr) return { ok: false, error: idErr }
  const { col, val } = identityFilter(identity)
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .eq(col, val)
      .order('declared_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: null }
      }
      return { ok: false, error: `readStoaEntryForIdentity: ${error.message}` }
    }
    return { ok: true, value: data ? rowToEntry(data as StoaRow) : null }
  } catch (e) {
    return { ok: false, error: `readStoaEntryForIdentity threw: ${(e as Error).message}` }
  }
}

/** Edit the ACTIVE entry's content. Sets renewed_at (the practitioner tended
 *  their word — honest ageing shows both dates) but NEVER declared_at (#8:
 *  editing must not be a float-to-top lever). */
export async function updateStoaEntry(
  identity: StoaIdentity,
  input: StoaDeclarationInput,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<StoaEntry>> {
  const idErr = validateIdentity(identity)
  if (idErr) return { ok: false, error: idErr }
  const v = validateInput(input)
  if (!v.ok) return { ok: false, error: v.error }
  const { col, val } = identityFilter(identity)
  try {
    const nowIso = new Date().toISOString()
    const { data, error } = await client
      .from(TABLE)
      .update({ ...v.patch, renewed_at: nowIso, updated_at: nowIso })
      .eq(col, val)
      .eq('status', 'active')
      .select('*')
      .maybeSingle()
    if (error) return { ok: false, error: `updateStoaEntry: ${error.message}` }
    if (!data) return { ok: false, error: 'no_active_entry' }
    return { ok: true, value: rowToEntry(data as StoaRow) }
  } catch (e) {
    return { ok: false, error: `updateStoaEntry threw: ${(e as Error).message}` }
  }
}

/** The Q9 renewal — "is this still yours?" answered yes. Sets renewed_at only.
 *  No badge, no penalty, no reordering (#24). */
export async function renewStoaEntry(
  identity: StoaIdentity,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<StoaEntry>> {
  return updateStoaEntry(identity, {}, client)
}

/** Withdrawal — the practitioner's own act (#24: their presence leaves only by
 *  their act or erasure). Status flip; reversible by re-declaring. */
export async function withdrawStoaEntry(
  identity: StoaIdentity,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<{ withdrawn: boolean }>> {
  const idErr = validateIdentity(identity)
  if (idErr) return { ok: false, error: idErr }
  const { col, val } = identityFilter(identity)
  try {
    const { data, error } = await client
      .from(TABLE)
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq(col, val)
      .eq('status', 'active')
      .select('id')
    if (error) return { ok: false, error: `withdrawStoaEntry: ${error.message}` }
    return { ok: true, value: { withdrawn: ((data as unknown[] | null)?.length ?? 0) > 0 } }
  } catch (e) {
    return { ok: false, error: `withdrawStoaEntry threw: ${(e as Error).message}` }
  }
}

/**
 * Fetch one entry by id, founder/admin-operated (ST7 — the Q5c/Q13a trust-
 * event flag intake). Returns null on not-found or a missing table (the
 * house missing-table-benign read discipline); a genuine query error is
 * surfaced as ok:false so a caller never mistakes a DB outage for "no such
 * entry". No visibility/status filtering — the admin path may reference any
 * entry, including a withdrawn or removed one (the trust event describes
 * what was examined, not the entry's current lifecycle state).
 */
export async function getStoaEntryById(
  entryId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<{ entry: StoaEntry | null }>> {
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .eq('id', entryId)
      .maybeSingle()
    if (error) {
      if (isMissingTableError(error)) return { ok: true, value: { entry: null } }
      return { ok: false, error: `getStoaEntryById: ${error.message}` }
    }
    return { ok: true, value: { entry: data ? rowToEntry(data as StoaRow) : null } }
  } catch (e) {
    return { ok: false, error: `getStoaEntryById threw: ${(e as Error).message}` }
  }
}

/**
 * Platform removal — ONLY on the three ruled grounds (#16, Q5b), founder-
 * operated until the ST7 machinery exists. The Q5b examined-artifact standard
 * is enforced HERE as well as at the DB CHECK: a dishonesty removal without an
 * artifact reference is refused ("accusation alone never suffices").
 */
export async function removeStoaEntry(
  entryId: string,
  ground: StoaRemovalGround,
  artifactRef: string | null,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<{ removed: boolean }>> {
  if (!STOA_REMOVAL_GROUNDS.includes(ground)) {
    return { ok: false, error: `removal ground must be one of: ${STOA_REMOVAL_GROUNDS.join(', ')}` }
  }
  if (ground === 'dishonesty_examined' && (!artifactRef || artifactRef.trim() === '')) {
    return {
      ok: false,
      error:
        'dishonesty_examined requires an examined-artifact reference (Q5b: accusation alone never suffices)',
    }
  }
  try {
    const { data, error } = await client
      .from(TABLE)
      .update({
        status: 'removed',
        removal_ground: ground,
        removal_artifact_ref: artifactRef,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .eq('status', 'active')
      .select('id')
    if (error) return { ok: false, error: `removeStoaEntry: ${error.message}` }
    return { ok: true, value: { removed: ((data as unknown[] | null)?.length ?? 0) > 0 } }
  } catch (e) {
    return { ok: false, error: `removeStoaEntry threw: ${(e as Error).message}` }
  }
}

/**
 * The serving list (#8: recency of declaration, the ONLY ordering — both
 * .order() calls in this module key declared_at; battery-pinned §D).
 *
 * scope 'public'    → active entries with visibility 'public' (unauthenticated)
 * scope 'community' → ALL active entries — community-scoped AND public
 *                     (an authenticated practitioner, human or agent, is
 *                     "present in the space" and sees everything, #2)
 * tag               → optional domain-tag filter (#9: consultation of the
 *                     resource; #10 vocabulary discipline lives at ST3)
 */
export async function listStoaEntries(
  opts: { scope: 'public' | 'community'; tag?: string; limit?: number; offset?: number },
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<{ entries: StoaEntry[]; capped: boolean }>> {
  const limit = Math.min(Math.max(1, opts.limit ?? LIST_DEFAULT_LIMIT), LIST_MAX_LIMIT)
  const offset = Math.max(0, opts.offset ?? 0)
  try {
    let q = client.from(TABLE).select('*').eq('status', 'active')
    if (opts.scope === 'public') q = q.eq('visibility', 'public')
    if (opts.tag) q = q.contains('tags', [opts.tag])
    const { data, error } = await q
      .order('declared_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: { entries: [], capped: false } }
      }
      return { ok: false, error: `listStoaEntries: ${error.message}` }
    }
    const rows = (data ?? []) as StoaRow[]
    return {
      ok: true,
      value: { entries: rows.map(rowToEntry), capped: rows.length >= limit },
    }
  } catch (e) {
    return { ok: false, error: `listStoaEntries threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// DATA RIGHTS (R17c/R17i) — genuine deletion + export, missing-table-benign,
// wired ALWAYS-ON at birth (the milestones lesson). NO retention sweep exists
// for this table (#24) — erasure and withdrawal are the only exits.
// ============================================================================

/** Genuine deletion (R17c) of a practitioner's Stoa entries (any status —
 *  erasure clears removal records too). Called by /api/user/delete; the
 *  profiles FK cascade is the backstop. */
export async function deleteStoaDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<number>> {
  return deleteBy('owner_user_id', ownerUserId, client)
}

/** Genuine deletion (R17c) of an agent's Stoa entries by owning credential.
 *  Called by /api/credential/erase (consumer-erasure). */
export async function deleteStoaDataForCredential(
  credentialRef: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<number>> {
  return deleteBy('credential_ref', credentialRef, client)
}

async function deleteBy(
  column: string,
  value: string,
  client: SupabaseClient,
): Promise<StoaStoreResult<number>> {
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

/** Export (R17i) the agent entries declared under a set of owned credentials
 *  (PR19 fold F3, 2026-08-03 — the operator's agents' declarations belong in
 *  the operator's Art 15/20 copies by the same reasoning that makes the
 *  developer the accountable declarer). Keyed by credential_ref — exact, no
 *  shared-agent_id overreach. */
export async function getStoaDataForCredentials(
  credentialRefs: string[],
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<unknown[]>> {
  if (credentialRefs.length === 0) return { ok: true, value: [] }
  try {
    const { data, error } = await client
      .from(TABLE)
      .select('*')
      .in('credential_ref', credentialRefs)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `select ${TABLE} by credentials: ${error.message}` }
    }
    return { ok: true, value: (data ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `select ${TABLE} threw: ${(e as Error).message}` }
  }
}

/** Export (R17i) a practitioner's Stoa entries. Called by /api/user/export +
 *  the Art 15 access copy. */
export async function getStoaDataForOwner(
  ownerUserId: string,
  client: SupabaseClient = getAdminClient(),
): Promise<StoaStoreResult<unknown[]>> {
  try {
    const { data, error } = await client.from(TABLE).select('*').eq('owner_user_id', ownerUserId)
    if (error) {
      if (isMissingTableError(error as { code?: string; message?: string })) {
        return { ok: true, value: [] }
      }
      return { ok: false, error: `select ${TABLE} by owner: ${error.message}` }
    }
    return { ok: true, value: (data ?? []) as unknown[] }
  } catch (e) {
    return { ok: false, error: `select ${TABLE} threw: ${(e as Error).message}` }
  }
}
