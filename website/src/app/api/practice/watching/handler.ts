/**
 * /api/practice/watching — `watching`, the IDEA loop's per-cycle record write
 * (agent-circles, built 2026-08-09 to the RULED scope
 * `operations/agent-circles-2026-08/2026-08-09-watching-per-cycle-record-table-scope.md`;
 * verbatim ruling record wins:
 * `2026-08-09-mentor-consultation-watching-scope-rulings-verbatim.md`).
 * Implementation lives here; the thin route wrapper is ./route.ts per Next
 * route-export validation (memory `nextjs-route-export-validation`).
 *
 * LIVE behind SUBSTRATE_WATCHING_ENABLED (corrected 2026-09-03 — this comment
 * previously read "DARK... UNSET everywhere", stale since the flag's own
 * activation eight days after this file was written: SUBSTRATE_WATCHING_ENABLED
 * was set in Vercel Production at D-RUNNER-SCOPING-SESSION-COMPLETE-2026-08-10,
 * the same route pattern noted below — the SAME flag lights the founder read
 * route too. The live env cannot be read from source; the decision record is
 * the check — re-verify in Vercel before relying on it. MIGRATION-BEFORE-FLAG
 * was standing discipline at build time (ruled §2.8) and was followed: both
 * migrations were walked live before this flag flipped.
 *
 * WHAT IT DOES (ruled §2.3): the runner POSTs ONE call per COMPLETED cycle —
 * the cycle record + ALL its candidate rows in one body (never a mid-cycle
 * snapshot). The server writes idea_loop_cycles + idea_loop_candidates and
 * derives the winner link. Idempotent on (loop_id, cycle_number) — a retried
 * write collides on the DB unique key and answers a duplicate no-op.
 *
 * ─── Auth (ruled §2.3 / QW-B) ────────────────────────────────────────────────
 * UPC `watching_write` capability via the validatePracticeCredential chokepoint,
 * Bearer-ONLY transport. QW-B RULED the dedicated write-class capability: a
 * durable-record write carries the full write-class discipline — Bearer-only at
 * this call-site (constraint 7) and, at mint, the 6e §A owner+agent invariant
 * (via the companion CHECK-widening migration
 * supabase-api-keys-watching-write-capability-migration.sql). NO credential is
 * minted or provisioned by this build — the runner scoping session's carried
 * step, per the ruling's own carry-forward.
 *
 * ─── Honesty posture (ruled §2.5) ────────────────────────────────────────────
 * Every row is the RUNNER-COMPOSED self-report of its own cycle (the runner is
 * the only party holding full cycle state; SageReasoning is stateless and
 * request-scoped per cycle). Identity (agent_id / owner_user_id /
 * credential_ref) is stamped SERVER-SIDE from the presenting credential — never
 * caller-supplied. maximum_duration_ms is runner-declared configuration the
 * server can never verify — recorded as declared. Traceability
 * (guardrail_session_id) is an AFFORDANCE, not a gate — the write is NEVER
 * refused for missing refs.
 *
 * ─── Outcome vocabularies (ruled §2.2 + QW-C) ────────────────────────────────
 * Candidate-level SEVEN values; cycle-level FOUR values; the timeout token is
 * `terminated_by_timeout` — the UNIFORM spelling at both levels (QW-C ruled).
 * `pending` is REJECTED here: a pending row must never appear in a COMPLETED
 * cycle's record (one write per completed cycle; a timeout cycle's unassessed
 * candidates are written `terminated_by_timeout`, ruled §2.2).
 *
 * ─── What this route deliberately does NOT do (ruled §2.9) ───────────────────
 * - NO execution pathway — the Q1 hard constraint: the loop proposes; it never
 *   executes. A record row DESCRIBES; nothing reads these tables to act.
 * - NO trust-event write — the ruled scope's own §2.9 wording (verbatim from
 *   the watching scope document, which states it "applies with equal force"
 *   from the fresh ruling — the exact sentence, not merely the idea): "the
 *   record surfaces write no trust event; any future event class is a new
 *   question for the mentor."
 * - NO counter enforcement — the three-consecutive-null-cycles fallback counter
 *   is runner-owned; the table records outcomes and mode; QW-A's ruling governs
 *   the RUNNER's counting, never any logic here.
 * - NO verdict modification — nothing touches, floors, or annotates any
 *   guardrail or /api/reason result.
 * - NO LLM call, NO loop_billing_events write, NO cost headers — decisions
 *   mirroring the fresh sibling (a pure record write; the cycle's cost_cents is
 *   the RUNNER's aggregate of metering it already received, recorded not
 *   re-metered), stated per the house rule that these are decisions, not
 *   omissions.
 * - MEASURE-only; weights blocked; rows never ride S10 or any public surface.
 *
 * ─── R20a / AC5 (recorded decision, ruled §2.9) ──────────────────────────────
 * Agent-facing write processing AGENT/runner-produced record text — OUTSIDE the
 * human-distress perimeter per the standing recorded precedent (the
 * discernment/trust-record/fresh posture). Re-checkable per AC5 if the
 * perimeter question is ever re-opened.
 */

import { NextRequest, NextResponse } from 'next/server'

import { corsHeaders } from '@/lib/security'
import {
  validatePracticeCredential,
  type PracticeCapability,
  type PracticeCredentialResult,
} from '@/lib/practice-credential'
import {
  insertCycleRecord,
  type CycleWriteOutcome,
  type WatchingCandidateInsert,
  type WatchingCycleInsert,
} from '@/lib/substrate/idea-loop-watching-store'
import type { StoreResult } from '@/lib/substrate/trust-core/trust-core-store'
import { BLAST_RADIUS_NO_BASIS_DISCLOSURE } from '@/lib/substrate/idea-loop-types'

// ════════════════════════════════════════════════════════════════════════════
// Flag (dark-route pattern — shared by BOTH watching routes)
// ════════════════════════════════════════════════════════════════════════════

/** True only when the flag is the exact string 'true'. Read at call time. */
export function isWatchingEnabled(): boolean {
  return process.env.SUBSTRATE_WATCHING_ENABLED === 'true'
}

// ════════════════════════════════════════════════════════════════════════════
// Ruled vocabularies (§2.2 + QW-C — transcribed, not re-derived; the migration's
// CHECK constraints carry the identical sets, battery-pinned against drift)
// ════════════════════════════════════════════════════════════════════════════

export const CYCLE_LEVEL_OUTCOMES = [
  'winner',
  'null_cycle',
  'dependency_unavailable',
  'terminated_by_timeout',
] as const

export const CANDIDATE_LEVEL_OUTCOMES = [
  'pending',
  'rejected_by_guardrail',
  'rejected_by_novelty',
  'winner',
  'null_cycle',
  'dependency_unavailable',
  'terminated_by_timeout',
  // 'not_selected' ADDED 2026-08-10 (bounded validation run, cycle 1 found the
  // gap): passed guardrail filtering AND passed the novelty check, but was not
  // the highest-proximity survivor. NOT a rejection by any filter — the
  // ORDINARY outcome for every non-winner candidate in a winner cycle, so it is
  // the most common candidate value in real run data, not an edge case.
  // idea_loop_candidates.cycle_outcome's CHECK widened to match — see
  // supabase-idea-loop-candidate-outcome-not-selected-migration.sql (§1) —
  // migration-before-code, standing discipline: the widened CHECK is a
  // backward-compatible superset, so it lands first and breaks nothing; this
  // array change is what actually unblocks a write (the route 400s on an
  // unrecognised value BEFORE any DB call is made — the CHECK alone would not
  // have been sufficient).
  'not_selected',
] as const

export const GENERATION_HEURISTICS = [
  'analogous_transfer',
  'combinatorial_generation',
  'synthesis_over_novelty',
  'context_transfer',
  'fifth_circle_weighting',
  'anomaly_detection',
  'friction_detection',
] as const

const PROXIMITY_VALUES = new Set<string>([
  'reflexive',
  'habitual',
  'deliberate',
  'principled',
  'sage_like',
])

const VIRTUE_DOMAINS = new Set<string>(['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne'])

/** fresh's ruled starved-window basis — the ONLY basis value fresh emits (the
 *  exact sibling string of STRUCTURAL_NOVELTY_LIMITATION's outcome in
 *  fresh/handler.ts; ruled §1 item 7 requires the candidate row to carry it). */
export const NOVELTY_BASIS_VALUES = ['insufficient_history'] as const

// ════════════════════════════════════════════════════════════════════════════
// ATRF / S4 vocabularies (RULED — transcribed, not chosen here; the migration's
// CHECK constraints carry the identical sets, battery-pinned against drift)
// ════════════════════════════════════════════════════════════════════════════

/** GS-ATRF-1's three values, fixed in manifest.md's ATRF section. A build
 *  inherits this enum; it does not choose one. Used for BOTH records — the
 *  loop's own indicator and the agent's own assessment. */
export const BLAST_RADIUS_VALUES = ['high', 'medium', 'low'] as const

/** The B7 four-valued recording vocabulary (S4 / traceability-criterion.md).
 *  `not_comparable` behaves like `unlabelled` under B5's frozen discriminator:
 *  out of scope, NEVER inferred clean. */
export const TRACEABILITY_CHECK_VALUES = [
  'clean',
  'diverged',
  'not_comparable',
  'unlabelled',
] as const

/** The four ruled GS-ATRF-1 dimensions. All four are required when the basis
 *  reports `assessed: true` — the four are not alternatives, they are the
 *  indicator's four constituent readings (one per cardinal virtue). */
export const BLAST_RADIUS_DIMENSION_KEYS = [
  'circles_affected',
  'reversibility',
  'preferred_indifferents',
  'impulse_proportionality',
] as const

// Input caps for the S4 evidence payload. Same house rationale as the existing
// caps above: generous headroom against a real cycle, closing payload abuse
// without ever touching a legitimate write. A real extraction carries ~3
// elements per category (the cycle-5 incident's own numbers were 3/3/2).
export const MAX_EXTRACTION_ELEMENTS_PER_CATEGORY = 32
export const MAX_EXTRACTION_ELEMENT_CHARS = 1000
/** Total serialized bound on extraction_evidence — the real abuse vector is
 *  total payload size, not any single field, and unknown keys are permitted
 *  (so the shape can grow) but they count toward this. */
export const MAX_EXTRACTION_EVIDENCE_CHARS = 20000
export const MAX_DIMENSION_CHARS = 1000


// ════════════════════════════════════════════════════════════════════════════
// Input caps (build-time details under the house input-cap pattern, ruled §2.3;
// rationale documented per the fresh precedent):
//   MAX_CANDIDATES_PER_WRITE 32 — a ruled cycle produces at most ~7 candidates
//     (one per heuristic application; QG-B caps friction-only mode at 7), so 32
//     is generous headroom matching the house non-LLM per-element bound the
//     fresh sibling uses; it forecloses payload abuse without ever touching a
//     legitimate cycle.
//   MAX_PROPOSED_ACTION_CHARS 5000 — matches the house TEXT_LIMITS.medium /
//     the /api/reason input cap: a winner's proposed_action would face exactly
//     that bound at its eventual consult, so a longer record adds nothing.
//   MAX_REF_CHARS 200 — gapRef/loop_id/session-ref echo-field bound (the fresh
//     sibling's MAX_GAPREF_CHARS rationale: short by construction, generous cap).
// ════════════════════════════════════════════════════════════════════════════

export const MAX_CANDIDATES_PER_WRITE = 32
export const MAX_PROPOSED_ACTION_CHARS = 5000
export const MAX_REF_CHARS = 200

// ════════════════════════════════════════════════════════════════════════════
// Injectable deps (tests exercise every branch with fakes — the fresh sibling's
// pattern)
// ════════════════════════════════════════════════════════════════════════════

export interface WatchingWriteDeps {
  isEnabled(): boolean
  validateCredential(
    rawToken: string,
    capability: PracticeCapability,
  ): Promise<PracticeCredentialResult>
  insertCycle(
    cycle: WatchingCycleInsert,
    candidates: readonly WatchingCandidateInsert[],
  ): Promise<StoreResult<CycleWriteOutcome>>
}

const DEFAULT_DEPS: WatchingWriteDeps = {
  isEnabled: isWatchingEnabled,
  validateCredential: (raw, cap) => validatePracticeCredential(raw, cap),
  insertCycle: (cycle, candidates) => insertCycleRecord(cycle, candidates),
}

// ════════════════════════════════════════════════════════════════════════════
// Response helpers (honest, non-leaking — the sibling posture)
// ════════════════════════════════════════════════════════════════════════════

function json(body: unknown, status: number): NextResponse {
  return NextResponse.json(body, { status, headers: corsHeaders() })
}

function flagDisabled(): NextResponse {
  return json(
    {
      error: 'watching not enabled',
      note:
        'The per-cycle record surface is dark: SUBSTRATE_WATCHING_ENABLED is not set. ' +
        'Nothing runs and nothing is written while dark.',
    },
    503,
  )
}

function unauthorized(): NextResponse {
  // Single non-leaking 401 for every auth failure (the sibling posture).
  return json({ error: 'unauthorized' }, 401)
}

function badRequest(errors: string[]): NextResponse {
  return json({ error: 'bad request', details: errors }, 400)
}

export function watchingPreflight(): NextResponse {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

// ════════════════════════════════════════════════════════════════════════════
// Auth (Bearer-only, watching_write — the write-class posture)
// ════════════════════════════════════════════════════════════════════════════

interface AuthOk {
  ok: true
  credentialId: string
  agentId: string | null
  ownerUserId: string | null
}

async function authenticate(
  request: NextRequest,
  deps: WatchingWriteDeps,
): Promise<AuthOk | { ok: false }> {
  const header = request.headers.get('authorization') || ''
  // Bearer-ONLY — write-class transport (constraint 7). X-Api-Key is never read.
  if (!header.startsWith('Bearer ')) return { ok: false }
  const raw = header.slice('Bearer '.length).trim()
  if (!raw) return { ok: false }
  try {
    const result = await deps.validateCredential(raw, 'watching_write')
    if (!result.valid) return { ok: false }
    return {
      ok: true,
      credentialId: result.row.id,
      agentId: result.row.agent_id,
      ownerUserId: result.row.owner_user_id,
    }
  } catch {
    return { ok: false } // fail-closed
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Body parsing (defensive — external/runner input)
// ════════════════════════════════════════════════════════════════════════════

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function optionalCappedString(
  v: unknown,
  field: string,
  max: number,
  errors: string[],
): string | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'string') {
    errors.push(`${field} must be a string when present`)
    return null
  }
  const t = v.trim()
  if (t.length > max) {
    errors.push(`${field} exceeds ${max} chars`)
    return null
  }
  return t || null
}

/** Integer-or-null. Rejects floats — cost_cents rides the loop-billing INTEGER
 *  contract (memory `loop-billing-rpc-integer-uuid-contract`); the other ms
 *  fields share the discipline for the same INTEGER-column reason. */
function optionalNonNegInt(v: unknown, field: string, errors: string[]): number | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
    errors.push(`${field} must be a non-negative integer when present`)
    return null
  }
  return v
}

function optionalUnitNumber(v: unknown, field: string, errors: string[]): number | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > 1) {
    errors.push(`${field} must be a number in [0,1] when present`)
    return null
  }
  return v
}

function optionalIsoTimestamp(v: unknown, field: string, errors: string[]): string | null {
  if (v === undefined || v === null) return null
  if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) {
    errors.push(`${field} must be an ISO-8601 timestamp string when present`)
    return null
  }
  return v
}

function optionalDomainArray(v: unknown, field: string, errors: string[]): string[] | null {
  if (v === undefined || v === null) return null
  if (!Array.isArray(v) || v.some((d) => typeof d !== 'string' || !VIRTUE_DOMAINS.has(d))) {
    errors.push(`${field} must be an array of ${[...VIRTUE_DOMAINS].join(' | ')} when present`)
    return null
  }
  return [...(v as string[])]
}

// ════════════════════════════════════════════════════════════════════════════
// ATRF / S4 field validation
//
// COHERENCE IS ENFORCED HERE, not in a DB CHECK — deliberately, and for two
// reasons stated so a later reader does not "fix" it: (1) the house pattern on
// this table is that the route 400s on an unrecognised value BEFORE any DB call
// is made, giving a clear named error instead of an opaque 23514; (2) a
// cross-column DB CHECK would destroy the independent nullability that makes
// each of the six columns separately droppable and separately deployable.
// ════════════════════════════════════════════════════════════════════════════

/** Optional member of a fixed vocabulary. Returns undefined when absent — the
 *  caller then OMITS the key entirely rather than sending an explicit null. */
function optionalEnum(
  v: unknown,
  field: string,
  allowed: readonly string[],
  errors: string[],
): string | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v !== 'string' || !allowed.includes(v)) {
    errors.push(`${field} must be one of ${allowed.join(' | ')} when present`)
    return undefined
  }
  return v
}

/** The IDEA loop's own LOCAL five-rank oikeiosis enumeration
 *  (OikeiosisCircleRank, idea-loop-types.ts) — 1..5 inclusive, integer.
 *  C15 closure: this is the enumeration the dikaiosyne dimension counts over.
 *  It is NOT profiles.ts's free-form OikeiosisCircle and NOT the
 *  layer1-extractor's string vocabulary. Naming the domain is what C15
 *  requires; the coexistence of the vocabularies is not reopened here. */
function optionalCircleRank(v: unknown, field: string, errors: string[]): number | undefined {
  if (v === undefined || v === null) return undefined
  if (typeof v !== 'number' || !Number.isInteger(v) || v < 1 || v > 5) {
    errors.push(`${field} must be an integer 1-5 (the loop's OikeiosisCircleRank) when present`)
    return undefined
  }
  return v
}

/** Validate the two-shape blast-radius basis, discriminated by `assessed`.
 *
 *  The assessed:false disclosure string is RULED VERBATIM (Q-A4) and is
 *  compared against the frozen constant rather than pattern-matched — a
 *  reworded flag is a rejected write, not a silently-stored paraphrase of the
 *  mentor's own words. */
function optionalBlastRadiusBasis(
  v: unknown,
  field: string,
  errors: string[],
): Record<string, unknown> | undefined {
  if (v === undefined || v === null) return undefined
  if (!isRecord(v)) {
    errors.push(`${field} must be an object when present`)
    return undefined
  }
  const assessed = v.assessed
  if (typeof assessed !== 'boolean') {
    errors.push(`${field}.assessed must be a boolean (the shape discriminant)`)
    return undefined
  }

  if (assessed === false) {
    if (v.disclosure !== BLAST_RADIUS_NO_BASIS_DISCLOSURE) {
      errors.push(
        `${field}.disclosure must be the ruled verbatim string when assessed is false ` +
          `(Q-A4; reword it and the write is refused)`,
      )
      return undefined
    }
    return { assessed: false, disclosure: BLAST_RADIUS_NO_BASIS_DISCLOSURE }
  }

  const dims = v.dimensions
  if (!isRecord(dims)) {
    errors.push(`${field}.dimensions must be an object when assessed is true`)
    return undefined
  }
  const out: Record<string, string> = {}
  for (const key of BLAST_RADIUS_DIMENSION_KEYS) {
    const raw = dims[key]
    if (typeof raw !== 'string' || !raw.trim()) {
      errors.push(
        `${field}.dimensions.${key} must be a non-empty string — all four ruled ` +
          `GS-ATRF-1 dimensions are required when assessed is true (they are the ` +
          `indicator's four constituent readings, not four alternatives)`,
      )
      return undefined
    }
    if (raw.length > MAX_DIMENSION_CHARS) {
      errors.push(`${field}.dimensions.${key} exceeds ${MAX_DIMENSION_CHARS} chars`)
      return undefined
    }
    out[key] = raw.trim()
  }
  const proxyDisclosure = v.proxy_disclosure
  if (typeof proxyDisclosure !== 'string' || !proxyDisclosure.trim()) {
    errors.push(
      `${field}.proxy_disclosure must be a non-empty string — the standing disclosure ` +
        `that the whole indicator is a proxy assessed without task details rides EVERY ` +
        `reading, regardless of which dimensions drove it`,
    )
    return undefined
  }
  if (proxyDisclosure.length > MAX_DIMENSION_CHARS) {
    errors.push(`${field}.proxy_disclosure exceeds ${MAX_DIMENSION_CHARS} chars`)
    return undefined
  }
  return { assessed: true, dimensions: out, proxy_disclosure: proxyDisclosure.trim() }
}

/** One endpoint's extraction record inside extraction_evidence. */
function validateExtractionSide(
  v: unknown,
  field: string,
  errors: string[],
): boolean {
  if (!isRecord(v)) {
    errors.push(`${field} must be an object when present`)
    return false
  }
  for (const cat of ['control_filter_elements', 'oikeiosis_circles_engaged', 'kathekon_factors']) {
    const arr = v[cat]
    if (arr === undefined || arr === null) continue
    if (!Array.isArray(arr)) {
      errors.push(`${field}.${cat} must be an array of strings when present`)
      return false
    }
    if (arr.length > MAX_EXTRACTION_ELEMENTS_PER_CATEGORY) {
      errors.push(`${field}.${cat} must carry at most ${MAX_EXTRACTION_ELEMENTS_PER_CATEGORY} elements`)
      return false
    }
    for (const el of arr) {
      if (typeof el !== 'string') {
        errors.push(`${field}.${cat} must be an array of strings when present`)
        return false
      }
      if (el.length > MAX_EXTRACTION_ELEMENT_CHARS) {
        errors.push(`${field}.${cat} has an element exceeding ${MAX_EXTRACTION_ELEMENT_CHARS} chars`)
        return false
      }
    }
  }
  if (v.virtue_domains !== undefined && v.virtue_domains !== null) {
    if (
      !Array.isArray(v.virtue_domains) ||
      v.virtue_domains.some((d) => typeof d !== 'string' || !VIRTUE_DOMAINS.has(d))
    ) {
      errors.push(`${field}.virtue_domains must be an array of ${[...VIRTUE_DOMAINS].join(' | ')}`)
      return false
    }
  }
  if (v.proximity !== undefined && v.proximity !== null) {
    if (typeof v.proximity !== 'string' || !PROXIMITY_VALUES.has(v.proximity)) {
      errors.push(`${field}.proximity must be one of ${[...PROXIMITY_VALUES].join(' | ')}`)
      return false
    }
  }
  return true
}

/** The S4 traceability evidence. Bounded verbatim, not a derived summary:
 *  the criterion's first property is SOURCE-EXISTENCE ("can a specific span of
 *  the submitted text be named as this element's source?"), which a count
 *  cannot answer. Unknown top-level keys are PERMITTED so the shape can grow,
 *  but they count toward the total serialized bound. */
function optionalExtractionEvidence(
  v: unknown,
  field: string,
  errors: string[],
): Record<string, unknown> | undefined {
  if (v === undefined || v === null) return undefined
  if (!isRecord(v)) {
    errors.push(`${field} must be an object when present`)
    return undefined
  }
  const serialized = JSON.stringify(v)
  if (serialized.length > MAX_EXTRACTION_EVIDENCE_CHARS) {
    errors.push(`${field} exceeds ${MAX_EXTRACTION_EVIDENCE_CHARS} serialized chars`)
    return undefined
  }
  if (v.winner !== undefined && v.winner !== null && typeof v.winner !== 'boolean') {
    errors.push(`${field}.winner must be a boolean when present`)
    return undefined
  }
  for (const side of ['guardrail', 'reason']) {
    if (v[side] === undefined || v[side] === null) continue
    if (!validateExtractionSide(v[side], `${field}.${side}`, errors)) return undefined
  }
  if (v.divergence !== undefined && v.divergence !== null && !isRecord(v.divergence)) {
    errors.push(`${field}.divergence must be an object when present`)
    return undefined
  }
  return v as Record<string, unknown>
}

export interface ParsedWatchingBody {
  cycle: Omit<WatchingCycleInsert, 'agent_id' | 'owner_user_id' | 'credential_ref'>
  candidates: WatchingCandidateInsert[]
}

export function parseWatchingBody(body: unknown, errors: string[]): ParsedWatchingBody | null {
  if (!isRecord(body)) {
    errors.push('request body must be a JSON object')
    return null
  }
  const c = body.cycle
  if (!isRecord(c)) {
    errors.push('cycle must be an object')
    return null
  }

  const loopId = typeof c.loop_id === 'string' ? c.loop_id.trim() : ''
  if (!loopId) errors.push('cycle.loop_id must be a non-empty string')
  else if (loopId.length > MAX_REF_CHARS) errors.push(`cycle.loop_id exceeds ${MAX_REF_CHARS} chars`)

  const cycleNumber = c.cycle_number
  if (typeof cycleNumber !== 'number' || !Number.isInteger(cycleNumber) || cycleNumber < 0) {
    errors.push('cycle.cycle_number must be a non-negative integer')
  }

  const cycleOutcome = c.cycle_outcome
  if (
    typeof cycleOutcome !== 'string' ||
    !(CYCLE_LEVEL_OUTCOMES as readonly string[]).includes(cycleOutcome)
  ) {
    errors.push(`cycle.cycle_outcome must be one of ${CYCLE_LEVEL_OUTCOMES.join(' | ')}`)
  }

  if (typeof c.friction_only_mode !== 'boolean') {
    errors.push('cycle.friction_only_mode must be a boolean')
  }

  const gapRef = optionalCappedString(c.gap_ref, 'cycle.gap_ref', MAX_REF_CHARS, errors)
  const costCents = optionalNonNegInt(c.cost_cents, 'cycle.cost_cents', errors)
  const elapsedMs = optionalNonNegInt(c.elapsed_ms, 'cycle.elapsed_ms', errors)
  const maximumDurationMs = optionalNonNegInt(c.maximum_duration_ms, 'cycle.maximum_duration_ms', errors)
  const startedAt = optionalIsoTimestamp(c.started_at, 'cycle.started_at', errors)
  const endedAt = optionalIsoTimestamp(c.ended_at, 'cycle.ended_at', errors)

  const rawCandidates = body.candidates
  if (!Array.isArray(rawCandidates)) {
    errors.push('candidates must be an array (may be empty for a candidate-less cycle)')
    return null
  }
  if (rawCandidates.length > MAX_CANDIDATES_PER_WRITE) {
    errors.push(`candidates must carry at most ${MAX_CANDIDATES_PER_WRITE} entries`)
    return null
  }

  const candidates: WatchingCandidateInsert[] = []
  rawCandidates.forEach((rc, i) => {
    if (!isRecord(rc)) {
      errors.push(`candidates[${i}] must be an object`)
      return
    }
    const heuristic = rc.heuristic
    if (
      typeof heuristic !== 'string' ||
      !(GENERATION_HEURISTICS as readonly string[]).includes(heuristic)
    ) {
      errors.push(`candidates[${i}].heuristic must be one of ${GENERATION_HEURISTICS.join(' | ')}`)
      return
    }
    const proposedAction = typeof rc.proposed_action === 'string' ? rc.proposed_action.trim() : ''
    if (!proposedAction) {
      errors.push(`candidates[${i}].proposed_action must be a non-empty string`)
      return
    }
    if (proposedAction.length > MAX_PROPOSED_ACTION_CHARS) {
      errors.push(`candidates[${i}].proposed_action exceeds ${MAX_PROPOSED_ACTION_CHARS} chars`)
      return
    }
    const kind = rc.classification_kind
    if (kind !== 'virtue_domain' && kind !== 'preferred_indifferent') {
      errors.push(
        `candidates[${i}].classification_kind must be 'virtue_domain' or 'preferred_indifferent'`,
      )
      return
    }
    const outcome = rc.cycle_outcome
    if (
      typeof outcome !== 'string' ||
      !(CANDIDATE_LEVEL_OUTCOMES as readonly string[]).includes(outcome)
    ) {
      errors.push(
        `candidates[${i}].cycle_outcome must be one of ${CANDIDATE_LEVEL_OUTCOMES.join(' | ')}`,
      )
      return
    }
    // Ruled §2.2: a `pending` row must never appear in a COMPLETED cycle's record
    // (one write per completed cycle; a timeout cycle's unassessed candidates are
    // written terminated_by_timeout).
    if (outcome === 'pending') {
      errors.push(
        `candidates[${i}].cycle_outcome must not be 'pending' — a completed cycle's record ` +
          `never carries a pending candidate (ruled §2.2)`,
      )
      return
    }
    const guardrailProximity = rc.guardrail_proximity
    if (
      guardrailProximity !== undefined &&
      guardrailProximity !== null &&
      (typeof guardrailProximity !== 'string' || !PROXIMITY_VALUES.has(guardrailProximity))
    ) {
      errors.push(
        `candidates[${i}].guardrail_proximity must be one of ${[...PROXIMITY_VALUES].join(' | ')} when present`,
      )
      return
    }
    const noveltyBasis = rc.novelty_basis
    if (
      noveltyBasis !== undefined &&
      noveltyBasis !== null &&
      !(NOVELTY_BASIS_VALUES as readonly string[]).includes(noveltyBasis as string)
    ) {
      errors.push(
        `candidates[${i}].novelty_basis must be '${NOVELTY_BASIS_VALUES[0]}' when present ` +
          `(the only basis the fresh endpoint emits)`,
      )
      return
    }
    const passedNovelty = rc.passed_novelty_check
    if (passedNovelty !== undefined && passedNovelty !== null && typeof passedNovelty !== 'boolean') {
      errors.push(`candidates[${i}].passed_novelty_check must be a boolean when present`)
      return
    }
    const before = errors.length
    const candGapRef = optionalCappedString(rc.gap_ref, `candidates[${i}].gap_ref`, MAX_REF_CHARS, errors)
    const domains = optionalDomainArray(rc.classified_domains, `candidates[${i}].classified_domains`, errors)
    const guardrailDomains = optionalDomainArray(rc.guardrail_domains, `candidates[${i}].guardrail_domains`, errors)
    const genConfidence = optionalUnitNumber(rc.generation_confidence, `candidates[${i}].generation_confidence`, errors)
    const novConfidence = optionalUnitNumber(rc.novelty_confidence, `candidates[${i}].novelty_confidence`, errors)
    const guardrailSessionId = optionalCappedString(
      rc.guardrail_session_id, `candidates[${i}].guardrail_session_id`, MAX_REF_CHARS, errors,
    )
    const unavailableDependency = optionalCappedString(
      rc.unavailable_dependency, `candidates[${i}].unavailable_dependency`, MAX_REF_CHARS, errors,
    )
    // ── ATRF/S4 additive fields (all optional; OMITTED, never explicit-null) ──
    const blastRadius = optionalEnum(
      rc.blast_radius, `candidates[${i}].blast_radius`, BLAST_RADIUS_VALUES, errors,
    )
    const agentBlastRadius = optionalEnum(
      rc.agent_blast_radius, `candidates[${i}].agent_blast_radius`, BLAST_RADIUS_VALUES, errors,
    )
    const targetCircle = optionalCircleRank(rc.target_circle, `candidates[${i}].target_circle`, errors)
    const blastRadiusBasis = optionalBlastRadiusBasis(
      rc.blast_radius_basis, `candidates[${i}].blast_radius_basis`, errors,
    )
    const traceabilityCheck = optionalEnum(
      rc.traceability_check, `candidates[${i}].traceability_check`, TRACEABILITY_CHECK_VALUES, errors,
    )
    const extractionEvidence = optionalExtractionEvidence(
      rc.extraction_evidence, `candidates[${i}].extraction_evidence`, errors,
    )
    if (errors.length > before) return

    // Q-A4 COHERENCE — the null-plus-flag rule, enforced here because the
    // migration deliberately carries no cross-column CHECK.
    //
    //   value  ⟺ the proxy RAN            ⟺ basis.assessed === true
    //   absent ⟺ the proxy had NO BASIS   ⟺ basis.assessed === false
    //
    // "Null is the honest expression of a proposition that was not formed. A
    // fourth vocabulary value would claim the proxy ran and produced a result,
    // which is false." A stored basis that disagrees with the indicator's
    // presence would make the flag meaningless — which is the whole reason the
    // flag was elected onto the row in the first place.
    //
    // NOTE the asymmetry, and that it is deliberate: a candidate may carry
    // NEITHER (an older runner that computes no proxy at all — the byte-identical
    // pre-ATRF write), and that is not an error. The rule binds only when a
    // basis is actually supplied.
    if (blastRadiusBasis !== undefined) {
      const assessed = blastRadiusBasis.assessed === true
      if (assessed && blastRadius === undefined) {
        errors.push(
          `candidates[${i}]: blast_radius_basis.assessed is true but blast_radius is absent — ` +
            `a basis reporting the proxy ran must accompany the value it produced`,
        )
        return
      }
      if (!assessed && blastRadius !== undefined) {
        errors.push(
          `candidates[${i}]: blast_radius_basis.assessed is false but blast_radius carries ` +
            `'${blastRadius}' — the no-basis flag claims the proxy was not run (Q-A4 null-plus-flag)`,
        )
        return
      }
    }

    // PR19 finding (2026-08-23, MEDIUM): Q-B1 elected target_circle as REQUIRED,
    // not merely preferred, on this exact stated reasoning — "without
    // target_circle, a persisted high is not auditable because the dikaiosyne
    // dimension's input is unrecoverable from the row." That reasoning is about
    // a PARTICULAR ROW, not merely the column's existence: a row that persists
    // an ASSESSED blast_radius reading with no target_circle recreates the exact
    // unauditable state the ruling elected the column to close — the free-prose
    // circles_affected field is not a substitute for the recoverable numeric
    // rank. Enforced ONLY when the basis reports assessed:true (a friction
    // candidate's null-plus-flag case has no dikaiosyne-dimension reading to
    // audit in the first place, so nothing to require here — consistent with
    // the coherence block above).
    if (blastRadiusBasis !== undefined && blastRadiusBasis.assessed === true && targetCircle === undefined) {
      errors.push(
        `candidates[${i}]: blast_radius_basis reports assessed:true but target_circle is absent — ` +
          `an assessed blast-radius reading is not auditable without the circle its dikaiosyne ` +
          `dimension was computed against (Q-B1: target_circle is required, not merely preferred)`,
      )
      return
    }

    candidates.push({
      gap_ref: candGapRef,
      heuristic,
      proposed_action: proposedAction,
      classification_kind: kind,
      classified_domains: domains,
      generation_confidence: genConfidence,
      guardrail_proximity: (guardrailProximity as string | undefined) ?? null,
      guardrail_domains: guardrailDomains,
      guardrail_session_id: guardrailSessionId,
      passed_novelty_check: (passedNovelty as boolean | undefined) ?? null,
      novelty_confidence: novConfidence,
      novelty_basis: (noveltyBasis as string | undefined) ?? null,
      cycle_outcome: outcome,
      unavailable_dependency: unavailableDependency,
      // Spread-when-present: an absent field contributes NO KEY, so the insert
      // body stays byte-identical to a pre-ATRF write (and therefore works
      // against a database that has not yet had the migration applied).
      ...(blastRadius !== undefined ? { blast_radius: blastRadius } : {}),
      ...(agentBlastRadius !== undefined ? { agent_blast_radius: agentBlastRadius } : {}),
      ...(targetCircle !== undefined ? { target_circle: targetCircle } : {}),
      ...(blastRadiusBasis !== undefined ? { blast_radius_basis: blastRadiusBasis } : {}),
      ...(traceabilityCheck !== undefined ? { traceability_check: traceabilityCheck } : {}),
      ...(extractionEvidence !== undefined ? { extraction_evidence: extractionEvidence } : {}),
    })
  })

  if (errors.length) return null

  // Winner consistency (honest-record validation, NOT counter logic — §2.9):
  // cycle_outcome 'winner' ⇔ exactly one candidate marked 'winner'.
  const winnerCount = candidates.filter((cd) => cd.cycle_outcome === 'winner').length
  if (cycleOutcome === 'winner' && winnerCount !== 1) {
    errors.push(`cycle.cycle_outcome 'winner' requires exactly one candidate with cycle_outcome 'winner' (got ${winnerCount})`)
  }
  if (cycleOutcome !== 'winner' && winnerCount > 0) {
    errors.push(`a non-winner cycle must carry no candidate with cycle_outcome 'winner' (got ${winnerCount})`)
  }
  if (errors.length) return null

  return {
    cycle: {
      loop_id: loopId,
      cycle_number: cycleNumber as number,
      gap_ref: gapRef,
      cycle_outcome: cycleOutcome as string,
      friction_only_mode: c.friction_only_mode as boolean,
      cost_cents: costCents,
      elapsed_ms: elapsedMs,
      maximum_duration_ms: maximumDurationMs,
      started_at: startedAt,
      ended_at: endedAt,
    },
    candidates,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Handler
// ════════════════════════════════════════════════════════════════════════════

export async function runWatchingPost(
  request: NextRequest,
  deps: WatchingWriteDeps = DEFAULT_DEPS,
): Promise<NextResponse> {
  // 1. Flag posture FIRST (dark route: unset ⇒ honest 503, zero work).
  if (!deps.isEnabled()) return flagDisabled()

  // 2. Auth (Bearer-only, watching_write, UPC chokepoint).
  const auth = await authenticate(request, deps)
  if (!auth.ok) return unauthorized()

  // 3. Parse + validate the body (one completed cycle + its candidates).
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return badRequest(['request body must be JSON'])
  }
  const errors: string[] = []
  const parsed = parseWatchingBody(body, errors)
  if (parsed === null) return badRequest(errors)

  // 4. Stamp server-side identity from the credential (unforgeable — never
  //    caller-supplied; §2.5) and write. KG1: awaited.
  const cycle: WatchingCycleInsert = {
    ...parsed.cycle,
    agent_id: auth.agentId,
    owner_user_id: auth.ownerUserId,
    credential_ref: `api_key:${auth.credentialId}`,
  }
  const result = await deps.insertCycle(cycle, parsed.candidates)
  if (!result.ok) {
    // A write failure is an honest 503 — the store already cleaned up any
    // partial cycle, so the runner's retry starts clean.
    console.error('[watching] cycle write failed:', result.error)
    return json({ error: 'service error' }, 503)
  }

  // 5. Respond. A duplicate is an HONEST no-op 200 (idempotent retry, ruled
  //    §2.3) — the record already exists; nothing was written twice.
  if (result.value.status === 'duplicate') {
    return json(
      {
        schema: 'practice-watching-response-v1',
        status: 'duplicate',
        note: 'A cycle with this (loop_id, cycle_number) is already recorded; nothing was written.',
      },
      200,
    )
  }
  return json(
    {
      schema: 'practice-watching-response-v1',
      status: 'written',
      cycle_id: result.value.cycle_id,
      candidates_written: result.value.candidates_written,
      // The §2.5 disclosure rides the wire too (the dashboard renders it; a
      // stored API response still names the record's basis).
      basis: 'runner_composed_self_report',
    },
    200,
  )
}
