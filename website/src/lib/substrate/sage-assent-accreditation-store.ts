/**
 * sage-assent-accreditation-store.ts — the Sage Assent badge persistence layer (Component 3).
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-15, this session). New code,
 * imported by no route — no production exposure this session.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/substrate-modes/sage-assent-wrapper-spec.md — the spec
 *     (Adopted 2026-05-14). This module builds the persistence half of spec
 *     §"Component 3 — The Badge / Accreditation": the AccreditationRecord ⇄
 *     Supabase round-trip the public verification endpoint queries.
 *   - /operations/decision-log.md — D-ATL-BADGE-SCHEMA-PERSISTENCE-WIRED-
 *     VERIFIED-2026-05-15 (this build; the Step 2 design-decision gate is
 *     recorded there).
 *   - /website/supabase-agent-accreditation-migration.sql — the DDL for the two
 *     tables this module reads + writes (agent_accreditation + grade_history).
 *     The approved subset of /trust-layer/schema/trust-layer-schema-REVIEW.sql.
 *   - /manifest.md §R4 (IP boundary) / §R18 a–e (the badge certifies the
 *     carried profile) / §AC8 (translation-sandwich substrate) / §KG1 (Vercel
 *     five-rule constraint) / §KG7 (JSONB storage format).
 *
 * WHAT THIS MODULE IS
 *
 * The badge (Component 3) is the FIRST server-side persistence in the Sage Assent arc.
 * Components 1, 2, 4, 5 are all wrapper-side carriage — pure, deterministic, no
 * database. The badge changes that: the public verification endpoint (spec step
 * 6b) must query SOMETHING, so the AccreditationRecord has to live in Supabase.
 *
 * This module is that persistence layer. It does two things:
 *
 *   1. PURE MAPPERS — accreditationRecordToRow / rowToAccreditationRecord /
 *      rowToStoreMetadata / gradeChangeEventToRow / buildInitialGradeHistoryRow.
 *      These translate between the in-memory domain types (AccreditationRecord,
 *      GradeChangeEvent — from the ported /trust-layer/ closure) and the flat
 *      Supabase row shapes (AgentAccreditationRow, GradeHistoryRow). No I/O —
 *      pure functions.
 *
 *   2. ASYNC STORE FUNCTIONS — lookupAccreditationRecord / upsertAccreditation-
 *      Record / appendGradeHistory / appendInitialGradeHistory. These wrap the
 *      Supabase client (supabaseAdmin). lookupAccreditationRecord is shaped
 *      EXACTLY as handleAccreditationLookup's injected `lookupFn` — it is the
 *      clean persistence seam the public endpoint (spec step 6b) plugs in:
 *        handleAccreditationLookup(agentId, lookupAccreditationRecord).
 *
 * NO ROUTE THIS SESSION (spec step 6a). The public verification endpoint
 * (/api/accreditation/[agent_id]) is spec step 6b — a Critical-classified route
 * + deployment surface with its own session and the full Critical Change
 * Protocol. PR1: this persistence layer is the single-endpoint proof of the
 * badge-storage pattern — it reaches Verified as library code BEFORE any route
 * exposes it.
 *
 * THE THREE MAPPING SEAMS (Step 1 survey findings):
 *
 *   - DIMENSION FLATTEN/UNFLATTEN. AccreditationRecord.dimension_levels is a
 *     nested DimensionScores object; agent_accreditation stores the four
 *     dimensions as four flat columns. accreditationRecordToRow flattens;
 *     rowToAccreditationRecord re-nests.
 *
 *   - DERIVED FIELDS. AccreditationRecord.verification_url and .disclaimer are
 *     NOT columns — they are derived constants (VERIFICATION_BASE_URL/{agent_id}
 *     and ACCREDITATION_DISCLAIMER). accreditationRecordToRow drops them;
 *     rowToAccreditationRecord reconstructs them. This keeps the table free of
 *     redundant derived data.
 *
 *   - STORE-ONLY COLUMNS. agent_accreditation carries `tier` (default 'free')
 *     and `regressing_check_count` — neither is an AccreditationRecord field
 *     (regressing_check_count lives on the wrapper's CarriedProfile). They are
 *     write-time options on accreditationRecordToRow / upsertAccreditationRecord
 *     and read back via rowToStoreMetadata, never folded into the record.
 *
 * COMPLIANCE
 *   - R4 (IP boundary): the persistence layer stores + retrieves the
 *     R4-respecting AccreditationRecord. No internal thresholds, micro-logic, or
 *     evaluation sequence touches this surface — the grade engine's thresholds
 *     stay module-private inside the ported grade-transition-engine.ts. The
 *     public payload boundary (record → AccreditationPayload) is enforced by
 *     buildAccreditationPayload in the ported public-endpoint.ts, not here.
 *   - R18 a–e: the AccreditationRecord this module persists IS the credential
 *     the badge certifies.
 *   - AC8: this module sits in /website/src/lib/substrate/ and persists the
 *     output of the Sage Assent Wrapper, which consumes the translation-sandwich
 *     substrate.
 *   - KG1 (Vercel five-rule constraint) — postures, stated up front:
 *       1. No self-calls — this module makes no endpoint-to-endpoint calls; it
 *          talks only to the Supabase client.
 *       2. Await all DB writes — every write function (upsertAccreditationRecord
 *          / appendGradeHistory / appendInitialGradeHistory) awaits the Supabase
 *          call and throws on error. No fire-and-forget.
 *       3. Headers strip on redirects — N/A; this module issues no redirects.
 *       4. Execution terminates after response — every async function here is
 *          awaited by its caller (the future route); no background work.
 *       5. process.cwd() — N/A; no file-based loaders.
 *   - KG7 (JSONB storage format): passions_persisting is a JSONB column.
 *     accreditationRecordToRow passes the PersistingPassion[] ARRAY DIRECTLY
 *     into the row object — it never JSON.stringify()s it. The Supabase client
 *     receives a real array; expected `jsonb_typeof(passions_persisting)` is
 *     'array'. rowToAccreditationRecord reads it back with an Array.isArray
 *     guard (a double-serialised string would fail the guard and yield [] —
 *     the KG7 failure mode — rather than iterating characters). Verify after
 *     the first write:
 *       SELECT jsonb_typeof(passions_persisting) FROM public.agent_accreditation
 *       ORDER BY updated_at DESC LIMIT 1;   -- expect 'array'
 *   - PR1: this persistence layer is the single-endpoint proof of the
 *     badge-storage pattern; the public route (spec step 6b) is its first
 *     consumer and does not exist until this is Verified.
 *   - PR2: the test file (__tests__/sage-assent-accreditation-store.test.ts) invokes
 *     every exported function in the same session this module is written — the
 *     pure mappers directly, the lookupFn seam via handleAccreditationLookup
 *     with a fake lookupFn, and a compile-time check that the real
 *     lookupAccreditationRecord is assignable to the seam.
 *   - PR4: N/A — no LLM call. The persistence layer is deterministic plumbing.
 *   - PR6: not engaged — the badge does not touch the R20a distress classifier,
 *     Zone 2 / Zone 3 logic, or their wrappers.
 *   - PR10: the build follows the Plan → Execute → Verify loop; the Step 2
 *     design-decision gate was the Plan step.
 */

import { supabaseAdmin } from '@/lib/supabase-server'

import {
  ACCREDITATION_DISCLAIMER,
  VERIFICATION_BASE_URL,
} from './trust-layer/accreditation/accreditation-record'

import type {
  AccreditationRecord,
  AuthorityLevel,
  CoverageStatus,
  DimensionLevel,
  DimensionScores,
  DirectionOfTravel,
  GradeChangeEvent,
  KatorthomaProximityLevel,
  PersistingPassion,
  SenecanGradeId,
} from './trust-layer/types/accreditation'
import type {
  DeliberationBreadth,
  KathekonQuality,
  OperationClass,
  TargetSystemVendor,
  OutcomeVerification,
  ReversibilitySignal,
} from './trust-layer/types/evaluation'

import {
  isAcceptedAgentId,
  AGENT_ID_FORMAT_MESSAGE,
} from './trust-layer/accreditation/agent-id-vocabulary'

// Re-export the domain types a persistence-layer consumer (the spec step 6b
// route) needs, so it imports them from one place.
export type {
  AccreditationRecord,
  GradeChangeEvent,
} from './trust-layer/types/accreditation'

// ============================================================================
// ROW SHAPES — the flat Supabase table shapes
// ============================================================================

/** The two tier values agent_accreditation.tier accepts. */
export type AccreditationTier = 'free' | 'paid'

/**
 * A row of public.agent_accreditation — the persistent agent credential.
 *
 * Mirrors website/supabase-agent-accreditation-migration.sql exactly. The four
 * dimension columns are the flattened DimensionScores; passions_persisting is a
 * real JSONB array (KG7); tier + regressing_check_count are store-only columns
 * with no AccreditationRecord counterpart; verification_url + disclaimer are
 * NOT columns (derived constants — see the module header's mapping seams).
 */
export interface AgentAccreditationRow {
  readonly agent_id: string
  readonly senecan_grade: SenecanGradeId
  readonly typical_proximity: KatorthomaProximityLevel
  readonly authority_level: AuthorityLevel
  readonly passion_reduction: DimensionLevel
  readonly judgement_quality: DimensionLevel
  readonly disposition_stability: DimensionLevel
  readonly oikeiosis_extension: DimensionLevel
  readonly direction_of_travel: DirectionOfTravel
  readonly evaluation_window_size: number
  readonly actions_evaluated: number
  readonly grade_since: string
  readonly last_evaluation: string
  readonly expires_at: string
  readonly passions_persisting: PersistingPassion[]
  readonly created_at: string
  readonly updated_at: string
  readonly tier: AccreditationTier
  readonly regressing_check_count: number
  /** R18a-observable credential — the typical deliberation-breadth bucket the
   *  badge surfaces. Default 'intuited' at the DB layer (the conservative
   *  no-evidence-yet baseline). Added 2026-05-16 under D-ATL-ITEMS-1-3-BUILD-
   *  WIRED-VERIFIED-2026-05-16 §"Decision A"; column added by
   *  /website/supabase-agent-accreditation-typical-deliberation-breadth-migration.sql. */
  readonly typical_deliberation_breadth: DeliberationBreadth
  /** R18a-observable credential parallel to typical_deliberation_breadth — the
   *  typical kathekon-quality bucket the badge surfaces. Default 'contrary' at
   *  the DB layer (the conservative no-evidence-yet baseline). Added 2026-05-16
   *  under D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-2026-05-16
   *  §"Decision C"; column added by
   *  /website/supabase-agent-accreditation-typical-kathekon-quality-migration.sql. */
  readonly typical_kathekon_quality: KathekonQuality
  /** A10 typical-class aggregates (Decision 3b/3c). Nullable columns added by
   *  /website/supabase-agent-accreditation-a10-migration.sql. */
  readonly typical_operation_class: OperationClass | null
  readonly typical_target_system_vendor: TargetSystemVendor | null
  readonly typical_outcome_verification: OutcomeVerification | null
  readonly typical_reversibility_signal: ReversibilitySignal | null
  /** A10 forensic JOIN trace to loop_billing_events.loop_id (Decision 2 — A10
   *  does NOT write loop_billing_events). Store-only; no AccreditationRecord
   *  counterpart. Nullable column added by the same migration. */
  readonly loop_id: string | null
  /** K1 coverage-status fields (first slice — CI-11, 2026-06-13). Nullable
   *  columns added by /website/supabase-agent-accreditation-k1-coverage-
   *  migration.sql. WRITE: taken exclusively from AccreditationRowOptions
   *  (server-composed via composeK1InitialCoverage — values on a consumer-
   *  submitted record are ignored). READ: folded into the returned
   *  AccreditationRecord so the public payload can serve them. NULL on rows
   *  written before the slice (the honest "coverage unstated" state). */
  readonly coverage_status: CoverageStatus | null
  readonly monitored_since: string | null
  readonly credential_basis: string | null
}

/** A row of public.grade_history — the append-only grade-change audit trail. */
export interface GradeHistoryRow {
  readonly agent_id: string
  readonly event_type: 'grade_upgrade' | 'grade_downgrade' | 'initial_grade'
  readonly previous_grade: SenecanGradeId | null
  readonly new_grade: SenecanGradeId
  readonly previous_proximity: KatorthomaProximityLevel | null
  readonly new_proximity: KatorthomaProximityLevel
  readonly previous_authority: AuthorityLevel | null
  readonly new_authority: AuthorityLevel
  readonly trigger_action_count: number
  readonly evidence_summary: string | null
  readonly occurred_at: string
}

/** The two store-only columns on agent_accreditation — no AccreditationRecord
 *  counterpart. Returned by rowToStoreMetadata for a caller that needs them. */
export interface AccreditationStoreMetadata {
  readonly tier: AccreditationTier
  readonly regressing_check_count: number
}

/** Write-time options for the store-only columns. */
export interface AccreditationRowOptions {
  /** Defaults to 'free' (the table default). */
  readonly tier?: AccreditationTier
  /** Defaults to 0 (the table default). The wrapper's CarriedProfile is the
   *  authority on this value — pass CarriedProfile.regressing_check_count. */
  readonly regressing_check_count?: number
  /** A10 forensic JOIN trace (Decision 2). Per-write value supplied by the
   *  route from the X-Loop-Id header; defaults to NULL. Store-only column —
   *  no AccreditationRecord counterpart. */
  readonly loop_id?: string | null
  /** K1 coverage-status fields (CI-11, 2026-06-13) — the SERVER-SIDE authority
   *  for the honest coverage values. Callers compose these via
   *  composeK1InitialCoverage (trust-layer/accreditation/coverage-status.ts);
   *  the row builder reads them from HERE and never from the record, so a
   *  consumer-submitted record cannot claim its own coverage. Omitted →
   *  NULL (legacy-write shape). */
  readonly coverage_status?: CoverageStatus | null
  readonly monitored_since?: string | null
  readonly credential_basis?: string | null
}

/** Write-time options for a grade_history row's optional audit note. */
export interface GradeHistoryRowOptions {
  /** Optional plain-English audit note (nullable column). */
  readonly evidence_summary?: string
}

// ============================================================================
// PURE MAPPERS — domain type ⇄ row shape. No I/O.
// ============================================================================

/**
 * Map an AccreditationRecord to an agent_accreditation row.
 *
 * PURE — no clock read, no I/O, no mutation of the input. The three Step 1
 * survey seams are applied here:
 *   - dimension_levels (nested) → four flat columns;
 *   - verification_url + disclaimer (derived constants) → dropped (not columns);
 *   - tier + regressing_check_count (store-only) → taken from opts (table
 *     defaults 'free' / 0 if omitted).
 *
 * KG7: passions_persisting is assigned the PersistingPassion[] ARRAY directly —
 * never JSON.stringify()d. The Supabase client serialises the real array into
 * the JSONB column.
 */
export function accreditationRecordToRow(
  record: AccreditationRecord,
  opts: AccreditationRowOptions = {}
): AgentAccreditationRow {
  return {
    agent_id: record.agent_id,
    senecan_grade: record.senecan_grade,
    typical_proximity: record.typical_proximity,
    authority_level: record.authority_level,
    // dimension_levels (nested) → four flat columns
    passion_reduction: record.dimension_levels.passion_reduction,
    judgement_quality: record.dimension_levels.judgement_quality,
    disposition_stability: record.dimension_levels.disposition_stability,
    oikeiosis_extension: record.dimension_levels.oikeiosis_extension,
    direction_of_travel: record.direction_of_travel,
    evaluation_window_size: record.evaluation_window_size,
    actions_evaluated: record.actions_evaluated,
    grade_since: record.grade_since,
    last_evaluation: record.last_evaluation,
    expires_at: record.expires_at,
    // KG7: the array goes in directly — no JSON.stringify
    passions_persisting: record.passions_persisting,
    created_at: record.created_at,
    updated_at: record.updated_at,
    // store-only columns — verification_url + disclaimer are NOT stored
    tier: opts.tier ?? 'free',
    regressing_check_count: opts.regressing_check_count ?? 0,
    // Decision A (D-ATL-ITEMS-1-3-BUILD-WIRED-VERIFIED-2026-05-16) — write
    // path for the new column. Column has a NOT NULL DEFAULT 'intuited'
    // server-side; we pass the record's value explicitly.
    typical_deliberation_breadth: record.typical_deliberation_breadth,
    // Decision C (D-ATL-KATHEKON-ALIGNED-ALTERNATIVE-BUILD-WIRED-VERIFIED-
    // 2026-05-16) — write path for the parallel kathekon credential column.
    // Column has a NOT NULL DEFAULT 'contrary' server-side; we pass the
    // record's value explicitly.
    typical_kathekon_quality: record.typical_kathekon_quality,
    // A10 (D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21) — nullable typical-class
    // aggregate columns (carried on the record) + the store-only loop_id trace
    // (supplied via opts from the route's X-Loop-Id header).
    typical_operation_class: record.typical_operation_class ?? null,
    typical_target_system_vendor: record.typical_target_system_vendor ?? null,
    typical_outcome_verification: record.typical_outcome_verification ?? null,
    typical_reversibility_signal: record.typical_reversibility_signal ?? null,
    loop_id: opts.loop_id ?? null,
    // K1 coverage fields (CI-11) — from OPTS exclusively, never the record:
    // the write boundary (composeK1InitialCoverage) is the authority on
    // coverage honesty; a consumer-submitted record's own values are ignored.
    coverage_status: opts.coverage_status ?? null,
    monitored_since: opts.monitored_since ?? null,
    credential_basis: opts.credential_basis ?? null,
  }
}

/**
 * Map an agent_accreditation row back to an AccreditationRecord.
 *
 * PURE — no I/O, no mutation of the input. Inverse of accreditationRecordToRow:
 *   - four flat columns → dimension_levels (nested);
 *   - verification_url + disclaimer → reconstructed from the derived constants;
 *   - tier + regressing_check_count → dropped (use rowToStoreMetadata for them).
 *
 * KG7: passions_persisting is read as an array. The Array.isArray guard defends
 * against a malformed JSONB value — a double-serialised string would fail the
 * guard and yield [] rather than iterating characters (the KG7 failure mode).
 */
export function rowToAccreditationRecord(
  row: AgentAccreditationRow
): AccreditationRecord {
  const dimension_levels: DimensionScores = {
    passion_reduction: row.passion_reduction,
    judgement_quality: row.judgement_quality,
    disposition_stability: row.disposition_stability,
    oikeiosis_extension: row.oikeiosis_extension,
  }

  return {
    agent_id: row.agent_id,
    senecan_grade: row.senecan_grade,
    typical_proximity: row.typical_proximity,
    authority_level: row.authority_level,
    dimension_levels,
    direction_of_travel: row.direction_of_travel,
    evaluation_window_size: row.evaluation_window_size,
    actions_evaluated: row.actions_evaluated,
    grade_since: row.grade_since,
    last_evaluation: row.last_evaluation,
    passions_persisting: Array.isArray(row.passions_persisting)
      ? row.passions_persisting
      : [],
    // derived fields — reconstructed, not stored
    verification_url: `${VERIFICATION_BASE_URL}/${row.agent_id}`,
    expires_at: row.expires_at,
    disclaimer: ACCREDITATION_DISCLAIMER,
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Decision A — read path for the new column. The migration sets a server-
    // side default; older rows missing this field would be filled by the
    // default at write time.
    typical_deliberation_breadth: row.typical_deliberation_breadth,
    // Decision C — read path for the parallel kathekon credential column. The
    // migration sets a server-side default; older rows missing this field
    // would be filled by the default at write time.
    typical_kathekon_quality: row.typical_kathekon_quality,
    // A10 (D-ATL-A10-BUILD-WIRED-VERIFIED-2026-05-21) — read path for the
    // nullable typical-class aggregates. NULL in the DB → undefined on the
    // (optional) record field. loop_id is store-only — not folded into the
    // record (see rowToStoreMetadata pattern for tier/regressing_check_count).
    typical_operation_class: row.typical_operation_class ?? undefined,
    typical_target_system_vendor: row.typical_target_system_vendor ?? undefined,
    typical_outcome_verification: row.typical_outcome_verification ?? undefined,
    typical_reversibility_signal: row.typical_reversibility_signal ?? undefined,
    // K1 coverage fields (CI-11) — folded in on read so the public payload
    // can serve them. NULL on pre-slice rows (honest "coverage unstated").
    coverage_status: row.coverage_status ?? null,
    monitored_since: row.monitored_since ?? null,
    credential_basis: row.credential_basis ?? null,
  }
}

/** Extract the two store-only columns from a row. PURE. */
export function rowToStoreMetadata(
  row: AgentAccreditationRow
): AccreditationStoreMetadata {
  return {
    tier: row.tier,
    regressing_check_count: row.regressing_check_count,
  }
}

/**
 * Map a GradeChangeEvent (from buildGradeChangeEvent — upgrade/downgrade only)
 * to a grade_history row. PURE.
 *
 * The GradeChangeEvent.timestamp field maps to the row's occurred_at column.
 * evidence_summary is an optional plain-English audit note (nullable column);
 * buildGradeChangeEvent does not produce one, so it is an opt here.
 */
export function gradeChangeEventToRow(
  event: GradeChangeEvent,
  opts: GradeHistoryRowOptions = {}
): GradeHistoryRow {
  return {
    agent_id: event.agent_id,
    event_type: event.event_type,
    previous_grade: event.previous_grade,
    new_grade: event.new_grade,
    previous_proximity: event.previous_proximity,
    new_proximity: event.new_proximity,
    previous_authority: event.previous_authority,
    new_authority: event.new_authority,
    trigger_action_count: event.trigger_action_count,
    evidence_summary: opts.evidence_summary ?? null,
    occurred_at: event.timestamp,
  }
}

/**
 * Build an 'initial_grade' grade_history row from a freshly created
 * AccreditationRecord. PURE.
 *
 * buildGradeChangeEvent only produces upgrade/downgrade events; the schema's
 * event_type domain also includes 'initial_grade' — the audit entry for an
 * agent's first credential. This is its builder. previous_* are null (there is
 * no prior grade); trigger_action_count is the record's actions_evaluated
 * (0 for a fresh agent, or the onboarding count once spec open question 7 is
 * built); occurred_at is the record's created_at.
 */
export function buildInitialGradeHistoryRow(
  record: AccreditationRecord,
  opts: GradeHistoryRowOptions = {}
): GradeHistoryRow {
  return {
    agent_id: record.agent_id,
    event_type: 'initial_grade',
    previous_grade: null,
    new_grade: record.senecan_grade,
    previous_proximity: null,
    new_proximity: record.typical_proximity,
    previous_authority: null,
    new_authority: record.authority_level,
    trigger_action_count: record.actions_evaluated,
    evidence_summary: opts.evidence_summary ?? null,
    occurred_at: record.created_at,
  }
}

// ============================================================================
// ASYNC STORE FUNCTIONS — the Supabase seam
// ============================================================================

/**
 * Look up an agent's accreditation record by agent_id.
 *
 * Returns the AccreditationRecord, or null if no row exists for that agent_id.
 *
 * THIS IS THE PERSISTENCE SEAM. Its signature —
 *   (agentId: string) => Promise<AccreditationRecord | null>
 * — matches handleAccreditationLookup's injected `lookupFn` parameter exactly.
 * The public verification endpoint (spec step 6b) passes this function straight
 * in: handleAccreditationLookup(agentId, lookupAccreditationRecord).
 *
 * KG1 rule 2: the query is awaited; a query error is thrown (not swallowed). A
 * genuine "not found" is NOT an error — .maybeSingle() returns null data and
 * this returns null.
 *
 * @throws if the Supabase query errors.
 */
export async function lookupAccreditationRecord(
  agentId: string
): Promise<AccreditationRecord | null> {
  const { data, error } = await supabaseAdmin
    .from('agent_accreditation')
    .select('*')
    .eq('agent_id', agentId)
    .maybeSingle()

  if (error) {
    throw new Error(
      `lookupAccreditationRecord: Supabase query failed for agent_id ` +
        `"${agentId}": ${error.message}`
    )
  }

  if (!data) return null

  return rowToAccreditationRecord(data as AgentAccreditationRow)
}

/**
 * Insert or update an agent's accreditation record.
 *
 * Upserts on the agent_id primary key — the first call for an agent inserts;
 * subsequent calls update in place. The agent_accreditation `accreditation_-
 * updated` trigger stamps updated_at = NOW() on every UPDATE.
 *
 * KG1 rule 2: the write is awaited; an error is thrown, not swallowed.
 * KG7: accreditationRecordToRow hands the passions_persisting ARRAY to the
 * Supabase client directly.
 *
 * @throws if the Supabase upsert errors.
 */
export async function upsertAccreditationRecord(
  record: AccreditationRecord,
  opts: AccreditationRowOptions = {}
): Promise<void> {
  // CI-12 (2026-06-13): the agent_id vocabulary check at the SINGLE write
  // chokepoint. Every path that writes agent_accreditation flows through here
  // (the wrapper POST via the writer library — already 400-guarded at the
  // route; the Sage Reflect feed; any future caller), so the CI-12 invariant
  // — every writable record is readable through the public GET — holds BY
  // CONSTRUCTION rather than route-by-route (the founder's drift-proof
  // election). The public GET validates with the same isAcceptedAgentId, so a
  // row that cannot be written here is exactly a row that could not be read.
  if (!isAcceptedAgentId(record.agent_id)) {
    throw new Error(
      `upsertAccreditationRecord: refusing to write an unreadable agent_id ` +
        `"${record.agent_id}". ${AGENT_ID_FORMAT_MESSAGE}`,
    )
  }

  const row = accreditationRecordToRow(record, opts)

  const { error } = await supabaseAdmin
    .from('agent_accreditation')
    .upsert(row, { onConflict: 'agent_id' })

  if (error) {
    throw new Error(
      `upsertAccreditationRecord: Supabase upsert failed for agent_id ` +
        `"${record.agent_id}": ${error.message}`
    )
  }
}

/**
 * Append a grade-change event to the grade_history audit trail.
 *
 * grade_history is append-only — every grade transition is one new row. The
 * agent_accreditation row must already exist (the foreign key enforces this);
 * call upsertAccreditationRecord first.
 *
 * KG1 rule 2: the insert is awaited; an error is thrown.
 *
 * @throws if the Supabase insert errors.
 */
export async function appendGradeHistory(
  event: GradeChangeEvent,
  opts: GradeHistoryRowOptions = {}
): Promise<void> {
  const row = gradeChangeEventToRow(event, opts)

  const { error } = await supabaseAdmin.from('grade_history').insert(row)

  if (error) {
    throw new Error(
      `appendGradeHistory: Supabase insert failed for agent_id ` +
        `"${event.agent_id}": ${error.message}`
    )
  }
}

/**
 * Append an 'initial_grade' row to the grade_history audit trail — the audit
 * entry for an agent's first credential.
 *
 * Same append-only discipline + foreign-key precondition as appendGradeHistory.
 *
 * KG1 rule 2: the insert is awaited; an error is thrown.
 *
 * @throws if the Supabase insert errors.
 */
export async function appendInitialGradeHistory(
  record: AccreditationRecord,
  opts: GradeHistoryRowOptions = {}
): Promise<void> {
  const row = buildInitialGradeHistoryRow(record, opts)

  const { error } = await supabaseAdmin.from('grade_history').insert(row)

  if (error) {
    throw new Error(
      `appendInitialGradeHistory: Supabase insert failed for agent_id ` +
        `"${record.agent_id}": ${error.message}`
    )
  }
}
