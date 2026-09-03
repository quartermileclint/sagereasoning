/**
 * session-store.ts — Sage Reflect persistence layer (Stage A, A-2 + A-4 store half).
 *
 * Built at the Sage Reflect build Stage A session. Backs the sage_reflect_sessions
 * table + the sage_reflect_proximity_domains table created in
 *   website/supabase-sage-reflect-migration.sql.
 * Implements SR-12 (full session persistence + 90-day retention + genuine hard
 * deletion + minimisation + app-level encryption for the intimate fields) and the
 * SR-15 per-domain proximity store of /adopted/sage-reflect-product-design.md.
 *
 * RESPONSIBILITIES
 * ----------------
 *  • create / read / advance a reflection-session row (one row per session_id).
 *  • persist the five Sage-Reflect-owned additive logs (phantasia / synkatathesis
 *    / horme / kathekon-quality / circle-need) derived from the completed history.
 *  • persist the completion scalars (exit_path, rs_class, confidence, fabrication
 *    risk, progress-dimensions-held, scrutiny flags, developer note, the Sage
 *    Calling trigger).
 *  • SR-15: read + upsert the per-virtue-domain proximity breakdown (keyed by
 *    agent_id, agent-level aggregate).
 *  • R17h GENUINE deletion — hard DELETE by session_id and by agent_id.
 *  • SR-12 retention sweep — hard DELETE rows older than the retention window.
 *
 * RULE COMPLIANCE
 * ---------------
 *  • KG1 (Vercel five rules): EVERY Supabase read/write is awaited; no
 *    fire-and-forget; errors surface as discriminated results, never swallowed.
 *    The admin client is lazily constructed at first I/O call (rule 4 — never
 *    module-level at import), so unit tests of the pure helpers need no env.
 *  • KG7 (JSONB storage): the five log arrays + scrutiny_flags are written by
 *    passing JS arrays DIRECTLY to the Supabase client — never JSON.stringify'd —
 *    so jsonb_typeof(...) returns 'array'. response_history_meta is written as a
 *    PLAIN OBJECT (jsonb_typeof = 'object'). sage_calling_trigger is a plain object.
 *  • R17b (app-level encryption): the agent's verbatim responses (the most
 *    intimate introspective content) are encrypted via encryptForStorage
 *    (AES-256-GCM, MENTOR_ENCRYPTION_KEY) and stored as a ciphertext TEXT column +
 *    a meta JSONB column — the established mentor-profile-store / encryption-helpers
 *    pattern. The categorical log arrays carry the queryable profile signal in
 *    plaintext JSONB; the raw prose is encrypted. (Design interpretation of
 *    "intimate introspective fields"; founder-confirmable — see the session close.)
 *  • R17i (minimisation): only the logs, the encrypted responses, the outcome
 *    scalars, and timestamps are persisted. No extraneous operational context.
 *  • R0 (audit trail): the logs + the encrypted response history reconstruct the run.
 *
 * Stage A is INERT: nothing reads/writes this until the Stage-B POST
 * /api/practice/reflect (Critical) is wired. This module is the data layer only.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { encryptForStorage, decryptFromStorage, type EncryptedField } from '@/lib/encryption-helpers'
import { pagedRows } from '@/lib/db/paged-select'
import type { KatorthomaProximityLevel } from '@/lib/substrate/trust-layer/types/accreditation'
import type { PerDomainProximity } from './proximity-domains'
import type {
  ReflectTurn,
  ReflectStepId,
  ReflectOutcome,
  ExitPath,
  RsClass,
  ProfileUpdateConfidence,
  FabricationRiskLevel,
  ScrutinyFlag,
  SageCallingTrigger,
  SessionSummary,
  PhantasiaDistortion,
  SynkatathesisFailure,
  HormePattern,
  PriorSessionSummary,
} from './engine'

// ============================================================================
// LOG-ENTRY SHAPES (the five Sage-Reflect-owned additive logs)
// ============================================================================

export type PhantasiaLogEntry = PhantasiaDistortion
export type SynkatathesisLogEntry = SynkatathesisFailure
export type HormeLogEntry = HormePattern
export interface KathekonLogEntry {
  readonly action: string
  readonly quality: string
  readonly is_kathekon: boolean
  readonly proximity: KatorthomaProximityLevel
  readonly virtue_domains_engaged: readonly string[]
}
export interface CircleNeedLogEntry {
  readonly circle: string | null
  readonly need_description: string
  readonly independence_confirmed: boolean
  readonly proportion_assessment: string
}

// ============================================================================
// ROW SHAPES — mirror the migration exactly
// ============================================================================

export interface SageReflectSessionRow {
  id: string
  session_id: string
  agent_id: string
  current_step: ReflectStepId
  /** R17b — encrypted verbatim responses (TEXT). null until the first persist. */
  response_history_ciphertext: string | null
  /** R17b — encryption meta (JSONB plain object, KG7). null until the first persist. */
  response_history_meta: EncryptedField['meta'] | null
  phantasia_distortion_log: PhantasiaLogEntry[]
  synkatathesis_failure_log: SynkatathesisLogEntry[]
  horme_pattern_log: HormeLogEntry[]
  kathekon_quality_log: KathekonLogEntry[]
  circle_need_log: CircleNeedLogEntry[]
  exit_path: ExitPath | null
  rs_class: RsClass | null
  profile_update_confidence: ProfileUpdateConfidence
  fabrication_risk_level: FabricationRiskLevel
  progress_dimensions_held: boolean
  scrutiny_flags: ScrutinyFlag[]
  developer_note: string | null
  sage_calling_trigger: SageCallingTrigger | null
  /** Slice-5c (Gate-1 full-loop harness): provenance of the session_summary supplied at open —
   *  'agent_stated' (the agent stated it) | 'harness_inferred' (a harness inferred it) | null
   *  (unmarked — the pre-field / unsupplied default). Validated by the route's request-helpers
   *  (CONTEXT_SOURCES) and the migration CHECK; nullable + additive. */
  context_source?: 'agent_stated' | 'harness_inferred' | null
  /** A1 (PR7) cross-session scalars, written at completion. Optional + nullable:
   *  pre-A1-migration rows + non-completed rows carry null. */
  complexity?: number | null
  calibration_all_correct?: boolean | null
  started_at: string
  completed_at: string | null
  created_at: string
}

/** SR-15 — the per-agent per-domain proximity row. */
export interface ProximityDomainsRow {
  agent_id: string
  phronesis: KatorthomaProximityLevel | null
  dikaiosyne: KatorthomaProximityLevel | null
  andreia: KatorthomaProximityLevel | null
  sophrosyne: KatorthomaProximityLevel | null
  aggregate: KatorthomaProximityLevel | null
  updated_at: string
}

/** Discriminated result — KG1: surface errors, never swallow. */
export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string }

// ============================================================================
// RETENTION POLICY (SR-12 / R17h / R17i)
// ============================================================================
//
// 90 days — inherits the Sage Calling discovery_sessions default + the substrate
// history_window default. FOUNDER-CONFIRMABLE (privacy-policy-adjacent; flagged
// for the lawyer-engagement track). Changing it is a one-line edit here + the
// migration comment. The enforcing sweep is sweepExpiredSessions(); scheduling it
// (cron) is wired separately.

export const RETENTION_WINDOW_DAYS = 90

// ============================================================================
// PURE HELPERS (no I/O — unit-testable without a live DB or encryption key)
// ============================================================================

/** The minimised insert payload for a new reflection session (R17i). The Slice-5c context_source is
 *  included ONLY when supplied (additive — omitting it lets the DB default the nullable column to
 *  null, so a pre-migration table / an unmarked caller is byte-identical). */
export function initialSessionInsert(
  session_id: string,
  agent_id: string,
  context_source?: 'agent_stated' | 'harness_inferred' | null,
): {
  session_id: string
  agent_id: string
  current_step: ReflectStepId
  phantasia_distortion_log: PhantasiaLogEntry[]
  synkatathesis_failure_log: SynkatathesisLogEntry[]
  horme_pattern_log: HormeLogEntry[]
  kathekon_quality_log: KathekonLogEntry[]
  circle_need_log: CircleNeedLogEntry[]
  context_source?: 'agent_stated' | 'harness_inferred'
} {
  return {
    session_id,
    agent_id,
    current_step: 'Q1',
    // KG7 — JS arrays, written directly (never stringified).
    phantasia_distortion_log: [],
    synkatathesis_failure_log: [],
    horme_pattern_log: [],
    kathekon_quality_log: [],
    circle_need_log: [],
    // Only set the column when an explicit provenance was supplied (otherwise omit ⇒ DB null).
    ...(context_source ? { context_source } : {}),
  }
}

/** The five additive logs derived from a completed (or partial) turn history. Pure. */
export function buildLogs(history: readonly ReflectTurn[]): {
  phantasia_distortion_log: PhantasiaLogEntry[]
  synkatathesis_failure_log: SynkatathesisLogEntry[]
  horme_pattern_log: HormeLogEntry[]
  kathekon_quality_log: KathekonLogEntry[]
  circle_need_log: CircleNeedLogEntry[]
} {
  const q1 = history.find((t) => t.step === 'Q1')
  const q2 = history.find((t) => t.step === 'Q2')
  const q3 = history.find((t) => t.step === 'Q3')
  const q4 = history.find((t) => t.step === 'Q4')
  const q5 = history.find((t) => t.step === 'Q5')

  const phantasia_distortion_log: PhantasiaLogEntry[] =
    q1 && q1.step === 'Q1' ? q1.assessment.distortions.map((d) => ({ ...d })) : []

  const synkatathesis_failure_log: SynkatathesisLogEntry[] =
    q2 && q2.step === 'Q2' ? q2.assessment.failures.map((f) => ({ ...f })) : []

  const horme_pattern_log: HormeLogEntry[] =
    q3 && q3.step === 'Q3' ? q3.assessment.patterns.map((p) => ({ ...p })) : []

  const kathekon_quality_log: KathekonLogEntry[] =
    q4 && q4.step === 'Q4'
      ? q4.assessment.actions.map((a) => ({
          action: a.action,
          quality: a.quality,
          is_kathekon: a.is_kathekon,
          proximity: a.proximity,
          virtue_domains_engaged: [...a.virtue_domains_engaged],
        }))
      : []

  const circle_need_log: CircleNeedLogEntry[] =
    q5 && q5.step === 'Q5'
      ? [
          {
            circle: q5.assessment.circle_need_delta.circle,
            need_description: q5.assessment.circle_need_delta.need_description,
            independence_confirmed: q5.assessment.circle_need_delta.independence_confirmed,
            proportion_assessment: q5.assessment.circle_need_delta.proportion_assessment,
          },
        ]
      : []

  return {
    phantasia_distortion_log,
    synkatathesis_failure_log,
    horme_pattern_log,
    kathekon_quality_log,
    circle_need_log,
  }
}

/** Map a ReflectOutcome to the completion scalar columns. Pure. */
export function deriveCompletionFields(outcome: ReflectOutcome): {
  exit_path: ExitPath
  rs_class: RsClass
  profile_update_confidence: ProfileUpdateConfidence
  fabrication_risk_level: FabricationRiskLevel
  progress_dimensions_held: boolean
  scrutiny_flags: ScrutinyFlag[]
  developer_note: string | null
  sage_calling_trigger: SageCallingTrigger | null
} {
  return {
    exit_path: outcome.exit_path,
    rs_class: outcome.rs_class,
    profile_update_confidence: outcome.profile_update_confidence,
    fabrication_risk_level: outcome.fabrication_risk_level,
    progress_dimensions_held: outcome.progress_dimensions_held,
    scrutiny_flags: [...outcome.scrutiny_flags], // KG7 — array, direct
    developer_note: outcome.developer_note,
    sage_calling_trigger: outcome.sage_calling_trigger,
  }
}

/**
 * A1 (PR7) — derive the cross-session scalars written at completion so the NEXT
 * session's open-path read can populate FD-R2 / Q1-3-null / FD-R4 in cleartext
 * (R17b stays intact — no decryption of a prior session's intimate blob is needed).
 * PURE.
 *   • complexity = the completed turn count (== the engine's currentComplexity =
 *     history.length used by FD-R2).
 *   • calibration_all_correct = the Q4 calibration was reviewed AND clean
 *     (verdicts_reviewed > 0 AND discrepancies_found === 0) — the FD-R4 streak input.
 *     No Q4 turn, or no verdicts reviewed → false (there is nothing to be "all
 *     correct" about; a non-reviewing session does not extend a deference streak).
 */
export function deriveCrossSessionScalars(state: ReflectPersistedState): {
  complexity: number
  calibration_all_correct: boolean
} {
  const q4 = state.turns.find((t) => t.step === 'Q4')
  const cal = q4 && q4.step === 'Q4' ? q4.assessment.calibration : null
  return {
    complexity: state.turns.length,
    calibration_all_correct: !!cal && cal.verdicts_reviewed > 0 && cal.discrepancies_found === 0,
  }
}

/** A1 (PR7) — the cross-session inputs the engine consumes (FD-R2 + FD-R4 + Q1-3-null). */
export interface CrossSessionContext {
  prior_sessions: PriorSessionSummary[]
  sage_assent_agreement_streak: number
}

/** Empty cross-session context — the fail-closed default (== pre-A1 behaviour). */
export const EMPTY_CROSS_SESSION_CONTEXT: CrossSessionContext = {
  prior_sessions: [],
  sage_assent_agreement_streak: 0,
}

/**
 * The Stage-B resumable session state, persisted (encrypted) across the stateless
 * HTTP calls of POST /api/practice/reflect.
 *
 * WHY THE FULL TURNS (not just verbatim responses): the deterministic engine's
 * nextStep() reconstructs its routing + outcome from the STRUCTURED per-turn
 * assessments (Q2 pressure-assent, Q4 calibration, Q5 deltas, the FD-R1 result,
 * the Q6 response-shape, the RS-4 ladder). The plaintext log columns are written
 * only at completion and omit several of these, so they cannot resume a mid-run
 * sequence. The full ReflectTurn[] + the session summary are therefore the
 * minimum state needed to resume (R17i — necessary operational state, not extra).
 *
 * R17b posture is UNCHANGED from Stage A: the same AES-256-GCM /
 * MENTOR_ENCRYPTION_KEY mechanism encrypts this blob (the intimate verbatim
 * responses live inside the turns); the five CATEGORICAL log columns remain
 * plaintext-queryable (founder-confirmed verbatim-only split, 2026-05-22). Only
 * the encrypted plaintext PAYLOAD shape grew from {step,response}[] to this state.
 */
export interface ReflectPersistedState {
  readonly session_summary: SessionSummary
  readonly turns: readonly ReflectTurn[]
  /** S9b G4 (additive, OPTIONAL — pre-S9b blobs simply lack the key, which reads
   *  as undefined ⇒ no suppression-watch cross-check ⇒ byte-identical outcomes):
   *  the session's self-screen evidence, supplied at OPEN by a harness caller.
   *  signed_assessments are stored OPAQUE here and re-verified (Ed25519) by the
   *  deriver at completion — an unverified artifact counts as absent evidence. */
  readonly screen_evidence?: {
    readonly screen_ran: boolean
    readonly signed_assessments: readonly unknown[]
  }
  /** S9b G2 (additive, OPTIONAL): the provenance of the persisted VERBATIM (the
   *  Q1 answer) — distinct from the row's context_source, which records the
   *  OPEN-call summary's provenance (the harness flow deliberately opens
   *  harness_inferred and marks only the verbatim agent_stated — Slice-5c).
   *  'agent_stated' here is what the screened credential + the out-of-band
   *  examination key on. */
  readonly verbatim_provenance?: 'agent_stated' | 'harness_inferred'
}

/** R17b — encrypt the resumable session state (intimate free text + the structured
 *  turns needed to resume the engine). Reads MENTOR_ENCRYPTION_KEY at call time
 *  (server-encryption is lazy). */
export function encryptPersistedState(state: ReflectPersistedState): EncryptedField {
  return encryptForStorage(state)
}

/** R17b — decrypt the stored session state back to {session_summary, turns}. */
export function decryptPersistedState(field: EncryptedField): ReflectPersistedState {
  const plaintext = decryptFromStorage(field)
  return JSON.parse(plaintext) as ReflectPersistedState
}

/** Pure: the ISO cutoff timestamp for the retention sweep. Exported for tests. */
export function computeRetentionCutoffIso(
  windowDays: number = RETENTION_WINDOW_DAYS,
  now: Date = new Date(),
): string {
  return new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000).toISOString()
}

/** SR-15 — map a computed PerDomainProximity to the upsert row. Pure. */
export function proximityDomainsToRow(agent_id: string, p: PerDomainProximity): Omit<ProximityDomainsRow, 'updated_at'> {
  return {
    agent_id,
    phronesis: p.phronesis,
    dikaiosyne: p.dikaiosyne,
    andreia: p.andreia,
    sophrosyne: p.sophrosyne,
    aggregate: p.aggregate,
  }
}

// ============================================================================
// ADMIN CLIENT (lazy — KG1 rule 4; constructed on first I/O call, not at import)
// ============================================================================

let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[sage-reflect/session-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const SESSIONS = 'sage_reflect_sessions'
const PROXIMITY = 'sage_reflect_proximity_domains'

// ============================================================================
// I/O — every call awaited; errors surfaced (KG1)
// ============================================================================

/** Fetch one reflection session by session_id. null if absent (not an error). */
export async function getSession(
  session_id: string,
): Promise<StoreResult<SageReflectSessionRow | null>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(SESSIONS).select('*').eq('session_id', session_id).maybeSingle()
    if (error) return { ok: false, error: `getSession: ${error.message}` }
    return { ok: true, value: (data as SageReflectSessionRow | null) ?? null }
  } catch (e) {
    return { ok: false, error: `getSession threw: ${(e as Error).message}` }
  }
}

/**
 * A1 (PR7) — read the cross-session context for an agent from the COMPLETED rows:
 * the last 3 (most-recent-first) mapped to PriorSessionSummary, plus the
 * Sage-Assent agreement streak (consecutive most-recent completed sessions whose
 * calibration_all_correct is true). All in cleartext columns — no decryption of any
 * prior session's intimate blob (R17b intact).
 *
 * total_failures mirrors the engine's countFailures EXACTLY: distortions + assent
 * failures + impulse patterns (the three causal-layer plaintext logs), NOT just
 * synkatathesis (resolves the A1 build open-question against engine.ts).
 *
 * FAIL-CLOSED (design-pack A1): on ANY error this returns the EMPTY context rather
 * than throwing — a bad read degrades to today's behaviour (no cross-session
 * signal), never a 503. A bounded window (20) caps the streak walk; the FD-R4
 * threshold is 5, so the cap never changes a verdict.
 */
export async function getCrossSessionContext(agent_id: string): Promise<CrossSessionContext> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from(SESSIONS)
      .select('phantasia_distortion_log, synkatathesis_failure_log, horme_pattern_log, complexity, calibration_all_correct')
      .eq('agent_id', agent_id)
      .eq('current_step', 'complete')
      .order('completed_at', { ascending: false })
      .limit(20)
    if (error || !data) {
      if (error) console.warn('[session-store] getCrossSessionContext read failed; empty context:', error.message)
      return { ...EMPTY_CROSS_SESSION_CONTEXT }
    }

    const arrLen = (x: unknown): number => (Array.isArray(x) ? x.length : 0)
    const prior_sessions: PriorSessionSummary[] = data.slice(0, 3).map((r) => ({
      total_failures:
        arrLen(r.phantasia_distortion_log) + arrLen(r.synkatathesis_failure_log) + arrLen(r.horme_pattern_log),
      complexity: typeof r.complexity === 'number' ? r.complexity : 0,
      q1_clean: arrLen(r.phantasia_distortion_log) === 0,
    }))

    let sage_assent_agreement_streak = 0
    for (const r of data) {
      if (r.calibration_all_correct === true) sage_assent_agreement_streak += 1
      else break
    }

    return { prior_sessions, sage_assent_agreement_streak }
  } catch (e) {
    console.warn('[session-store] getCrossSessionContext threw; empty context:', (e as Error).message)
    return { ...EMPTY_CROSS_SESSION_CONTEXT }
  }
}

/** Create a new reflection-session row (minimised initial state). The optional Slice-5c
 *  context_source records the provenance of the session_summary supplied at open. */
export async function createSession(
  session_id: string,
  agent_id: string,
  context_source?: 'agent_stated' | 'harness_inferred' | null,
): Promise<StoreResult<SageReflectSessionRow>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from(SESSIONS)
      .insert(initialSessionInsert(session_id, agent_id, context_source)) // KG7 — arrays direct
      .select('*')
      .single()
    if (error) return { ok: false, error: `createSession: ${error.message}` }
    return { ok: true, value: data as SageReflectSessionRow }
  } catch (e) {
    return { ok: false, error: `createSession threw: ${(e as Error).message}` }
  }
}

/**
 * Persist progress mid-run: the current step + the encrypted verbatim responses so
 * far. One awaited UPDATE; the meta object is passed directly (KG7 — object).
 */
export async function persistProgress(
  session_id: string,
  currentStep: ReflectStepId,
  state: ReflectPersistedState,
): Promise<StoreResult<void>> {
  try {
    const admin = getAdminClient()
    const enc = encryptPersistedState(state) // R17b
    const { error } = await admin
      .from(SESSIONS)
      .update({
        current_step: currentStep,
        response_history_ciphertext: enc.ciphertext,
        response_history_meta: enc.meta, // KG7 — plain object, direct
      })
      .eq('session_id', session_id)
    if (error) return { ok: false, error: `persistProgress: ${error.message}` }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `persistProgress threw: ${(e as Error).message}` }
  }
}

/**
 * Persist completion: the five additive logs (KG7 arrays direct), the encrypted
 * verbatim responses, the outcome scalars, current_step='complete', completed_at.
 * One awaited UPDATE.
 */
export async function persistCompletion(
  session_id: string,
  state: ReflectPersistedState,
  outcome: ReflectOutcome,
  completedAt: string = new Date().toISOString(),
): Promise<StoreResult<void>> {
  try {
    const admin = getAdminClient()
    const enc = encryptPersistedState(state) // R17b
    const logs = buildLogs(state.turns) // KG7 — arrays direct
    const fields = deriveCompletionFields(outcome)
    const cross = deriveCrossSessionScalars(state) // A1 (PR7) — complexity + calibration_all_correct
    const { error } = await admin
      .from(SESSIONS)
      .update({
        current_step: 'complete',
        response_history_ciphertext: enc.ciphertext,
        response_history_meta: enc.meta, // KG7 — object
        ...logs, // five JSONB arrays, direct
        ...fields, // scalars + scrutiny_flags array + sage_calling_trigger object
        ...cross, // A1 — complexity (int) + calibration_all_correct (bool)
        completed_at: completedAt,
      })
      .eq('session_id', session_id)
    if (error) return { ok: false, error: `persistCompletion: ${error.message}` }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `persistCompletion threw: ${(e as Error).message}` }
  }
}

/**
 * SR-9 / R20a Zone-3 block — persist a harm-flagged session as completed WITHOUT
 * running the reflection: record the contrary kathekon failure (profile update) +
 * the developer note, set current_step='complete', exit_path/rs_class left null
 * (the boundary is neither a sage_reasoning nor a sage_calling exit). One awaited
 * UPDATE. The encrypted state preserves the audit trail (R0). Sage Reflect does
 * NOT feed a fabricated grade move from a harm flag — the contrary kathekon log
 * entry is the minimal honest profile record.
 */
export async function persistZone3Block(
  session_id: string,
  state: ReflectPersistedState,
  kathekonLog: KathekonLogEntry[],
  developerNote: string,
  completedAt: string = new Date().toISOString(),
): Promise<StoreResult<void>> {
  try {
    const admin = getAdminClient()
    const enc = encryptPersistedState(state) // R17b
    const { error } = await admin
      .from(SESSIONS)
      .update({
        current_step: 'complete',
        response_history_ciphertext: enc.ciphertext,
        response_history_meta: enc.meta, // KG7 — object
        kathekon_quality_log: kathekonLog, // KG7 — array, direct
        scrutiny_flags: [], // KG7 — array, direct
        developer_note: developerNote,
        fabrication_risk_level: 'low',
        completed_at: completedAt,
      })
      .eq('session_id', session_id)
    if (error) return { ok: false, error: `persistZone3Block: ${error.message}` }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `persistZone3Block threw: ${(e as Error).message}` }
  }
}

/** R17h GENUINE deletion — hard DELETE one session by session_id. */
export async function deleteSession(session_id: string): Promise<StoreResult<{ deleted: number }>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(SESSIONS).delete().eq('session_id', session_id).select('id')
    if (error) return { ok: false, error: `deleteSession: ${error.message}` }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `deleteSession threw: ${(e as Error).message}` }
  }
}

/** R17h GENUINE deletion — hard DELETE ALL of an agent's reflection sessions. */
export async function deleteAgentSessions(agent_id: string): Promise<StoreResult<{ deleted: number }>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(SESSIONS).delete().eq('agent_id', agent_id).select('id')
    if (error) return { ok: false, error: `deleteAgentSessions: ${error.message}` }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `deleteAgentSessions threw: ${(e as Error).message}` }
  }
}

/**
 * R17i portability (Trust Layer S10 rider, 2026-07-12 — closes the S9b carried
 * "/api/user/export reflect rows" item): read ALL of an agent's reflect-session
 * rows in export form — plaintext columns as stored, with the R17b-encrypted
 * response history DECRYPTED for the data subject (the export route's Art-20
 * "usable form" precedent for the intimate mentor store), and the raw
 * ciphertext/meta columns dropped. A per-row decrypt failure degrades to an
 * honest marker, never a fabricated history and never a failed export.
 * Missing-table tolerated by the CALLER (mirrors the export route's posture).
 */
export async function getAgentSessionsForExport(
  agent_id: string,
): Promise<StoreResult<Array<Record<string, unknown>>>> {
  try {
    const admin = getAdminClient()
    // Row-cap sweep 2026-09-02/-03 (M-series): an unbounded .select('*').eq(agent_id) silently
    // truncates at PostgREST's confirmed 1,000-row server cap with no error — an agent with more
    // than 1,000 reflect sessions would previously get a silently-incomplete Article 15/20 export.
    // pagedRows keyset-pages by the genuine 'id' primary key, exhaustive + fail-honest (an error on
    // any page surfaces as {rows: null, error}, never a partial result presented as complete).
    const { rows: data, error } = await pagedRows<SageReflectSessionRow>(admin, SESSIONS, 'id', '*', {
      eqColumn: 'agent_id',
      eqValue: agent_id,
    })
    if (error) return { ok: false, error: `getAgentSessionsForExport: ${error}` }
    const rows = (data ?? []) as SageReflectSessionRow[]
    const exported = rows.map((row) => {
      const { response_history_ciphertext, response_history_meta, ...plain } = row
      let response_history: unknown = null
      if (response_history_ciphertext && response_history_meta) {
        try {
          response_history = decryptPersistedState({
            ciphertext: response_history_ciphertext,
            meta: response_history_meta,
          })
        } catch (e) {
          response_history = {
            error: `decryption failed (fail-honest): ${(e as Error).message}`,
          }
        }
      }
      return { ...plain, response_history }
    })
    return { ok: true, value: exported }
  } catch (e) {
    return { ok: false, error: `getAgentSessionsForExport threw: ${(e as Error).message}` }
  }
}

/**
 * SR-12 retention sweep — hard DELETE rows whose created_at is older than the
 * window. The cutoff is computed via the pure computeRetentionCutoffIso.
 */
export async function sweepExpiredSessions(
  windowDays: number = RETENTION_WINDOW_DAYS,
  now: Date = new Date(),
): Promise<StoreResult<{ deleted: number }>> {
  try {
    const admin = getAdminClient()
    const cutoff = computeRetentionCutoffIso(windowDays, now)
    const { data, error } = await admin.from(SESSIONS).delete().lt('created_at', cutoff).select('id')
    if (error) return { ok: false, error: `sweepExpiredSessions: ${error.message}` }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `sweepExpiredSessions threw: ${(e as Error).message}` }
  }
}

// ============================================================================
// SR-15 — per-domain proximity store (keyed by agent_id)
// ============================================================================

/** Read an agent's per-domain proximity row. null if absent (not an error). */
export async function getProximityDomains(
  agent_id: string,
): Promise<StoreResult<ProximityDomainsRow | null>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(PROXIMITY).select('*').eq('agent_id', agent_id).maybeSingle()
    if (error) return { ok: false, error: `getProximityDomains: ${error.message}` }
    return { ok: true, value: (data as ProximityDomainsRow | null) ?? null }
  } catch (e) {
    return { ok: false, error: `getProximityDomains threw: ${(e as Error).message}` }
  }
}

/** Upsert an agent's per-domain proximity (SR-15). Upserts on the agent_id PK. */
export async function upsertProximityDomains(
  agent_id: string,
  p: PerDomainProximity,
): Promise<StoreResult<void>> {
  try {
    const admin = getAdminClient()
    const row = { ...proximityDomainsToRow(agent_id, p), updated_at: new Date().toISOString() }
    const { error } = await admin.from(PROXIMITY).upsert(row, { onConflict: 'agent_id' })
    if (error) return { ok: false, error: `upsertProximityDomains: ${error.message}` }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `upsertProximityDomains threw: ${(e as Error).message}` }
  }
}
