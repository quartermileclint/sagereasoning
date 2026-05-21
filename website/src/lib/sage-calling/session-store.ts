/**
 * session-store.ts — Sage Calling discovery_sessions persistence layer (D-7).
 *
 * Built at the Sage Calling build Stage 2 session (engine + store half).
 * Backs the discovery_sessions table created in Stage 1
 *   (website/supabase-discovery-sessions-migration.sql;
 *    D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21).
 * Implements D-7 (full session persistence + retention/deletion/minimisation)
 * of /adopted/purpose-discovery-product-design.md.
 *
 * RESPONSIBILITIES
 * ----------------
 *  • create / read / advance a discovery session row (one row per session_id).
 *  • append to response_history (the answered turns) and signals_detected (the
 *    per-decision selection audit — D-4 "every selection traces to a named rule").
 *  • set current_stage, gate_status, outcome, completed_at.
 *  • R17h GENUINE deletion — hard DELETE by session_id and by agent_id.
 *  • D-7 retention sweep — hard DELETE rows older than the retention window.
 *
 * RULE COMPLIANCE
 * ---------------
 *  • KG1 (Vercel five rules): EVERY Supabase read/write is awaited; no
 *    fire-and-forget; errors are surfaced as discriminated results, never
 *    swallowed-and-allowed. The admin client is lazily constructed at first call
 *    (rule 4 — never module-level state at import time), so importing this module
 *    for unit tests of the pure helpers needs no env / no Supabase round-trip.
 *  • KG7 (JSONB storage): response_history and signals_detected are written by
 *    passing JS arrays/objects DIRECTLY to the Supabase client — never
 *    JSON.stringify'd — so jsonb_typeof(...) returns 'array', not 'string'.
 *  • R17i (minimisation): only the variant selections, the agent responses, the
 *    selection audit, and the outcome are persisted. No extraneous operational
 *    context.
 *  • R0 (audit trail): response_history + signals_detected together are the
 *    reconstruct-the-run trail; this IS the product's distinctive R0 value.
 *
 * This module is the data layer only. The POST /api/calling endpoint (build
 * Stage 2 — the Critical public-surface half, follow-up session) orchestrates:
 * it computes the new arrays + scalar fields using the pure helpers below and
 * the engine's output, then calls persistTurn. The Hard Gate approval flip
 * (D-14) calls setGateStatus.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CallingStage } from './question-library'
import { ResponseRecord, EpistemicSignal, EngineOutput } from './engine'

// ============================================================================
// TYPES — mirror the discovery_sessions table
// ============================================================================

export type GateStatus = 'pending' | 'awaiting_approval' | 'approved' | 'blocked'
export type Outcome = 'found' | 'null_result'

/**
 * Per-engine-decision selection audit, stored (ordered) in signals_detected.
 * Captures the named selection rule AND the epistemic-state reads that drove it,
 * so the full run reconstructs to "every selection traces to a named rule" (D-4).
 */
export interface SelectionAudit {
  /** The engine decision kind that produced this entry. */
  kind: 'question' | 'hard_gate' | 'null_result'
  /** The stage surfaced (for a question) or the terminal stage; null if N/A. */
  stage: CallingStage | null
  /** The variant surfaced (for a question); null for terminal decisions. */
  variant: ResponseRecord['variant'] | null
  /** Stable named selection rule (e.g. 'Q2.reprompt.over-claiming'). */
  rule: string
  /** The epistemic-state reads that drove the selection. */
  signals: EpistemicSignal[]
}

/** One discovery_sessions row, typed. */
export interface DiscoverySessionRow {
  id: string
  session_id: string
  agent_id: string
  current_stage: CallingStage
  response_history: ResponseRecord[]
  signals_detected: SelectionAudit[]
  gate_status: GateStatus
  outcome: Outcome | null
  started_at: string
  completed_at: string | null
  created_at: string
}

/** Discriminated result — KG1: surface errors, never swallow. */
export type StoreResult<T> = { ok: true; value: T } | { ok: false; error: string }

// ============================================================================
// RETENTION POLICY (D-7 / R17h / R17i)
// ============================================================================
//
// 90-day window — matches the substrate's existing history_window default and is
// set as documented policy in the Stage 1 migration header. FOUNDER-CONFIRMABLE
// (privacy-policy-adjacent; flagged for the Stage 1 lawyer-engagement track).
// Changing it is a one-line edit here + the migration comment. The enforcing
// sweep is sweepExpiredSessions() below; scheduling it (cron) is wired separately
// from this data layer.

export const RETENTION_WINDOW_DAYS = 90

// ============================================================================
// PURE HELPERS (no I/O — unit-testable without a live DB)
// ============================================================================

/** The minimised insert payload for a new session (R17i). Defaults mirror the
 *  table: current_stage 'Q1', empty JSONB arrays, gate_status 'pending'. */
export function initialSessionInsert(
  session_id: string,
  agent_id: string,
): {
  session_id: string
  agent_id: string
  current_stage: CallingStage
  response_history: ResponseRecord[]
  signals_detected: SelectionAudit[]
  gate_status: GateStatus
} {
  return {
    session_id,
    agent_id,
    current_stage: 'Q1',
    response_history: [], // KG7 — JS array, written directly (never stringified)
    signals_detected: [], // KG7 — JS array, written directly
    gate_status: 'pending',
  }
}

/** Append an answered turn immutably (does not mutate the input array). */
export function appendResponse(
  history: ResponseRecord[],
  record: ResponseRecord,
): ResponseRecord[] {
  return [...history, record]
}

/** Append a selection-audit entry immutably. */
export function appendAudit(audits: SelectionAudit[], audit: SelectionAudit): SelectionAudit[] {
  return [...audits, audit]
}

/** Convert an engine decision into the auditable record stored in signals_detected. */
export function toSelectionAudit(out: EngineOutput): SelectionAudit {
  if (out.kind === 'question') {
    return { kind: 'question', stage: out.stage, variant: out.variant, rule: out.rule, signals: out.signals }
  }
  if (out.kind === 'hard_gate') {
    return { kind: 'hard_gate', stage: null, variant: null, rule: out.rule, signals: out.signals }
  }
  return { kind: 'null_result', stage: null, variant: null, rule: out.rule, signals: out.signals }
}

/**
 * Derive the persisted gate/outcome/completion state from an engine decision.
 *  - question    → still in progress; gate pending; no outcome; not complete.
 *  - hard_gate   → purpose found; gate awaiting external developer approval
 *                  (D-14 — handoff MUST NOT fire yet); sequence complete.
 *  - null_result → clean null; no handoff so gate stays pending; sequence complete.
 */
export function deriveTerminal(out: EngineOutput): {
  gateStatus: GateStatus
  outcome: Outcome | null
  isComplete: boolean
} {
  switch (out.kind) {
    case 'question':
      return { gateStatus: 'pending', outcome: null, isComplete: false }
    case 'hard_gate':
      return { gateStatus: 'awaiting_approval', outcome: 'found', isComplete: true }
    case 'null_result':
      return { gateStatus: 'pending', outcome: 'null_result', isComplete: true }
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
        '[sage-calling/session-store] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.',
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

const TABLE = 'discovery_sessions'

// ============================================================================
// I/O — every call awaited; errors surfaced (KG1)
// ============================================================================

/** Fetch one session by session_id. Returns null if absent (not an error). */
export async function getSession(session_id: string): Promise<StoreResult<DiscoverySessionRow | null>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(TABLE).select('*').eq('session_id', session_id).maybeSingle()
    if (error) return { ok: false, error: `getSession: ${error.message}` }
    return { ok: true, value: (data as DiscoverySessionRow | null) ?? null }
  } catch (e) {
    return { ok: false, error: `getSession threw: ${(e as Error).message}` }
  }
}

/** Create a new session row (minimised initial state). */
export async function createSession(
  session_id: string,
  agent_id: string,
): Promise<StoreResult<DiscoverySessionRow>> {
  try {
    const admin = getAdminClient()
    // KG7: response_history / signals_detected are JS arrays in the payload,
    // passed directly — the client serialises them to JSONB arrays.
    const { data, error } = await admin
      .from(TABLE)
      .insert(initialSessionInsert(session_id, agent_id))
      .select('*')
      .single()
    if (error) return { ok: false, error: `createSession: ${error.message}` }
    return { ok: true, value: data as DiscoverySessionRow }
  } catch (e) {
    return { ok: false, error: `createSession threw: ${(e as Error).message}` }
  }
}

/**
 * Persist one advanced turn: write the FULL new response_history +
 * signals_detected arrays (computed by the caller via the pure helpers) plus the
 * scalar fields. One awaited UPDATE; arrays passed directly (KG7).
 */
export interface PersistTurnParams {
  responseHistory: ResponseRecord[]
  signalsDetected: SelectionAudit[]
  currentStage: CallingStage
  gateStatus: GateStatus
  outcome: Outcome | null
  /** ISO timestamp when the sequence completed; null while in progress. */
  completedAt: string | null
}

export async function persistTurn(
  session_id: string,
  params: PersistTurnParams,
): Promise<StoreResult<void>> {
  try {
    const admin = getAdminClient()
    const { error } = await admin
      .from(TABLE)
      .update({
        response_history: params.responseHistory, // KG7 — array, direct
        signals_detected: params.signalsDetected, // KG7 — array, direct
        current_stage: params.currentStage,
        gate_status: params.gateStatus,
        outcome: params.outcome,
        completed_at: params.completedAt,
      })
      .eq('session_id', session_id)
    if (error) return { ok: false, error: `persistTurn: ${error.message}` }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `persistTurn threw: ${(e as Error).message}` }
  }
}

/**
 * Flip the Hard Gate status (D-14). Used by the external developer-approval path:
 * 'awaiting_approval' → 'approved' (handoff may fire) or → 'blocked'. The handoff
 * MUST NOT fire on the agent's say-so; only this explicit external transition to
 * 'approved' unlocks it.
 */
export async function setGateStatus(
  session_id: string,
  status: GateStatus,
): Promise<StoreResult<void>> {
  try {
    const admin = getAdminClient()
    const { error } = await admin.from(TABLE).update({ gate_status: status }).eq('session_id', session_id)
    if (error) return { ok: false, error: `setGateStatus: ${error.message}` }
    return { ok: true, value: undefined }
  } catch (e) {
    return { ok: false, error: `setGateStatus threw: ${(e as Error).message}` }
  }
}

/** R17h GENUINE deletion — hard DELETE one session by session_id. */
export async function deleteSession(session_id: string): Promise<StoreResult<{ deleted: number }>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(TABLE).delete().eq('session_id', session_id).select('id')
    if (error) return { ok: false, error: `deleteSession: ${error.message}` }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `deleteSession threw: ${(e as Error).message}` }
  }
}

/** R17h GENUINE deletion — hard DELETE ALL of an agent's sessions by agent_id. */
export async function deleteAgentSessions(agent_id: string): Promise<StoreResult<{ deleted: number }>> {
  try {
    const admin = getAdminClient()
    const { data, error } = await admin.from(TABLE).delete().eq('agent_id', agent_id).select('id')
    if (error) return { ok: false, error: `deleteAgentSessions: ${error.message}` }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `deleteAgentSessions threw: ${(e as Error).message}` }
  }
}

/**
 * D-7 retention sweep — hard DELETE rows whose created_at is older than the
 * window. Defaults to RETENTION_WINDOW_DAYS. The cutoff is computed here so it is
 * unit-checkable (see computeRetentionCutoffIso).
 */
export async function sweepExpiredSessions(
  windowDays: number = RETENTION_WINDOW_DAYS,
  now: Date = new Date(),
): Promise<StoreResult<{ deleted: number }>> {
  try {
    const admin = getAdminClient()
    const cutoff = computeRetentionCutoffIso(windowDays, now)
    const { data, error } = await admin.from(TABLE).delete().lt('created_at', cutoff).select('id')
    if (error) return { ok: false, error: `sweepExpiredSessions: ${error.message}` }
    return { ok: true, value: { deleted: (data as unknown[] | null)?.length ?? 0 } }
  } catch (e) {
    return { ok: false, error: `sweepExpiredSessions threw: ${(e as Error).message}` }
  }
}

/** Pure: the ISO cutoff timestamp for the retention sweep (rows older than this
 *  are eligible for deletion). Exported for unit testing. */
export function computeRetentionCutoffIso(
  windowDays: number = RETENTION_WINDOW_DAYS,
  now: Date = new Date(),
): string {
  return new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000).toISOString()
}
