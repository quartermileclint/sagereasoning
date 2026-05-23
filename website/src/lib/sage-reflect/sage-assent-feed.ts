/**
 * sage-assent-feed.ts — the Sage Assent (ATL) feed (Stage A, A-5; SR-4).
 *
 * Built at the Sage Reflect build Stage A session. Implements the LOAD-BEARING
 * reuse decision SR-4 of /adopted/sage-reflect-product-design.md: Sage Reflect
 * does NOT re-implement the deterministic grade/proximity/dimension logic — it
 * FEEDS the existing Sage Assent engine. Q4 kathekon records are written as
 * EvaluatedAction-shaped rows; the existing pure aggregator computeWindowSnapshot()
 * + the existing grade-transition-engine recompute agent_accreditation. Sage
 * Reflect submits EVIDENCE and lets the engine decide — it never writes
 * senecan_grade / typical_proximity directly, which preserves the engine's
 * hysteresis (no single session moves a grade).
 *
 * THE FLOW
 * --------
 *   Q4 KathekonAssessment[]  → kathekonToEvaluatedAction (pure)
 *     → ENSURE parent agent_accreditation row exists (seed conservative starting
 *       credential if absent — the evaluated_actions FK requires it)
 *     → persist the new rows (durable window — A-3)
 *     → read back the agent's recent rows (oldest-first)
 *     → computeWindowSnapshot (existing pure aggregator — consumes the rows UNCHANGED)
 *     → evaluateGradeTransition (existing pure grade engine — hysteresis)
 *     → upsert the engine's resulting AccreditationRecord (NOT a hand-written grade)
 *   In parallel (SR-15): computePerDomainProximity (KP-04 unity rule) → upsert the
 *   Sage-Reflect-owned per-domain store.
 *
 * THE FK FINDING (2026-05-22 grounding): evaluated_actions.agent_id REFERENCES
 *   agent_accreditation(agent_id). A Q4 row cannot be inserted unless the agent has
 *   an accreditation row. ensureAccreditation seeds a conservative starting
 *   credential (pre_progress / reflexive / all-emerging) if none exists — the
 *   correct first-write, after which the engine moves the grade only on evidence.
 *
 * RULE COMPLIANCE
 * ---------------
 *  • KG1: every DB call awaited; errors surfaced as a discriminated StoreResult;
 *    no fire-and-forget; no self-calls (direct imports of the store + the ported
 *    pure trust-layer functions).
 *  • KG7: the persistence layer passes JSONB arrays directly (passions_detected).
 *  • PR1: the feed is proven on its own path in isolation (this session) before any
 *    endpoint (Stage B) consumes it.
 *  • PR2: the feed's tests invoke the orchestrator with mock deps, asserting the
 *    seed branch, the persist→aggregate→grade→upsert order, and the SR-15 write.
 *  • PR4: N/A — no LLM; the feed is deterministic plumbing over pure functions.
 *  • PR6: NOT engaged — no R20a / distress surface.
 *
 * TESTABILITY: like sage-assent-accreditation-writer.ts, the orchestrator accepts an
 * optional `deps` defaulting to the real store + ported pure functions. Tests pass
 * mocks. The module's top-level import of sage-assent-accreditation-store transitively
 * loads supabase-server.ts, so the test runs with `--env-file=.env.local` (the
 * client is constructed at import but never CALLED under mock deps).
 */

import {
  lookupAccreditationRecord,
  upsertAccreditationRecord,
} from '@/lib/substrate/sage-assent-accreditation-store'
import { createAccreditationRecord } from '@/lib/substrate/trust-layer/accreditation/accreditation-record'
import { computeWindowSnapshot } from '@/lib/substrate/trust-layer/evaluation-window/window-aggregator'
import { evaluateGradeTransition } from '@/lib/substrate/trust-layer/grade-engine/grade-transition-engine'
import { DEFAULT_WINDOW_CONFIG } from '@/lib/substrate/trust-layer/types/evaluation'
import type { EvaluatedAction } from '@/lib/substrate/trust-layer/types/evaluation'
import type {
  AccreditationRecord,
  DimensionScores,
  DirectionOfTravel,
  KatorthomaProximityLevel,
  SenecanGradeId,
} from '@/lib/substrate/trust-layer/types/accreditation'

import {
  persistEvaluatedActions as realPersist,
  getRecentEvaluatedActions as realGetRecent,
  countLifetimeActions as realCount,
  type StoreResult,
} from './evaluated-actions-store'
import { upsertProximityDomains as realUpsertProximity } from './session-store'
import { computePerDomainProximity, type PerDomainProximity } from './proximity-domains'
import type { KathekonAssessment, Q4Assessment } from './engine'

// ============================================================================
// PURE MAPPER — Q4 kathekon → EvaluatedAction (SR-4; type-compatible, no change)
// ============================================================================

/**
 * Map a single Q4 KathekonAssessment to an EvaluatedAction. PURE.
 *
 * receipt_id is the stable Sage Reflect trace `reflect_<session>_q4_<idx>`;
 * skill_id is 'sage_reflect'; candidates_considered defaults to 1 (intuited —
 * Sage Reflect does not deliberate over decision candidates, it reviews completed
 * actions). The optional pass-through fields are left unset (defaulted downstream).
 */
export function kathekonToEvaluatedAction(
  a: KathekonAssessment,
  agentId: string,
  sessionId: string,
  idx: number,
  evaluatedAt: string,
): EvaluatedAction {
  return {
    receipt_id: `reflect_${sessionId}_q4_${idx}`,
    agent_id: agentId,
    evaluated_at: evaluatedAt,
    proximity: a.proximity,
    is_kathekon: a.is_kathekon,
    kathekon_quality: a.quality,
    passions_detected: a.passions_detected.map((p) => ({ ...p })),
    virtue_domains_engaged: [...a.virtue_domains_engaged],
    oikeiosis_met: a.oikeiosis_met,
    oikeiosis_stage: a.oikeiosis_stage,
    ruling_faculty_state: `sage_reflect:${a.quality}`,
    skill_id: 'sage_reflect',
    candidates_considered: 1,
  }
}

/** Map a full Q4 assessment to the EvaluatedAction[] batch. PURE. */
export function q4ToEvaluatedActions(
  q4: Q4Assessment,
  agentId: string,
  sessionId: string,
  evaluatedAt: string = new Date().toISOString(),
): EvaluatedAction[] {
  return q4.actions.map((a, i) => kathekonToEvaluatedAction(a, agentId, sessionId, i, evaluatedAt))
}

/** The conservative starting credential seeded when an agent has no accreditation
 *  row yet (the evaluated_actions FK precondition). PURE. */
export function seedRecord(agentId: string): AccreditationRecord {
  const startingDimensions: DimensionScores = {
    passion_reduction: 'emerging',
    judgement_quality: 'emerging',
    disposition_stability: 'emerging',
    oikeiosis_extension: 'emerging',
  }
  return createAccreditationRecord({
    agent_id: agentId,
    starting_grade: 'pre_progress',
    starting_proximity: 'reflexive',
    starting_dimensions: startingDimensions,
  })
}

// ============================================================================
// DEPENDENCY-INJECTION SEAM
// ============================================================================

export interface SageAssentFeedDeps {
  readonly lookupAccreditation: (agentId: string) => Promise<AccreditationRecord | null>
  readonly upsertAccreditation: (record: AccreditationRecord) => Promise<void>
  readonly persistEvaluatedActions: (
    actions: readonly EvaluatedAction[],
  ) => Promise<StoreResult<{ inserted: number }>>
  readonly getRecentEvaluatedActions: (
    agentId: string,
    limit: number,
  ) => Promise<StoreResult<EvaluatedAction[]>>
  readonly countLifetimeActions: (agentId: string) => Promise<StoreResult<number>>
  readonly upsertProximityDomains: (
    agentId: string,
    p: PerDomainProximity,
  ) => Promise<StoreResult<void>>
}

const DEFAULT_DEPS: SageAssentFeedDeps = {
  lookupAccreditation: lookupAccreditationRecord,
  upsertAccreditation: (record) => upsertAccreditationRecord(record),
  persistEvaluatedActions: realPersist,
  getRecentEvaluatedActions: realGetRecent,
  countLifetimeActions: realCount,
  upsertProximityDomains: realUpsertProximity,
}

// ============================================================================
// RESULT
// ============================================================================

export interface SageAssentFeedResult {
  readonly evaluated_actions_persisted: number
  readonly seeded_accreditation: boolean
  readonly grade_changed: boolean
  /** Read back from the engine's resulting record (NOT hand-written). */
  readonly senecan_grade: SenecanGradeId
  readonly typical_proximity: KatorthomaProximityLevel
  readonly dimension_levels: DimensionScores
  readonly direction_of_travel: DirectionOfTravel
  /** SR-15 — the per-virtue-domain proximity Sage Reflect computed + stored. */
  readonly per_domain_proximity: PerDomainProximity
}

// ============================================================================
// THE FEED
// ============================================================================

export interface FeedParams {
  readonly agentId: string
  readonly sessionId: string
  readonly q4: Q4Assessment
  /** ISO timestamp stamped on the new EvaluatedAction rows (defaults to now). */
  readonly evaluatedAt?: string
}

/**
 * Feed Sage Reflect's Q4 evidence into Sage Assent + write the SR-15 per-domain
 * proximity. Returns the engine-decided grade/proximity/dimensions + the per-domain
 * breakdown. KG1: errors surface as a discriminated StoreResult.
 *
 * NOTE on hysteresis: evaluateGradeTransition is called with regressingCheckCount=0
 * here. The lookup returns an AccreditationRecord (no regressing_check_count — that
 * is a store-only column). 0 is the conservative value: a single reflection feed
 * cannot trip a regression-count downgrade (those need >= 2 consecutive checks),
 * which is exactly the intended hysteresis. A future enhancement may carry the
 * count via a CarriedProfile-style read (PR7).
 */
export async function feedSageAssent(
  params: FeedParams,
  deps: SageAssentFeedDeps = DEFAULT_DEPS,
): Promise<StoreResult<SageAssentFeedResult>> {
  const { agentId, sessionId, q4 } = params
  const evaluatedAt = params.evaluatedAt ?? new Date().toISOString()

  try {
    // 1) Map Q4 → EvaluatedAction[].
    const newActions = q4ToEvaluatedActions(q4, agentId, sessionId, evaluatedAt)

    // 2) Ensure the parent agent_accreditation row exists (FK precondition).
    let currentRecord = await deps.lookupAccreditation(agentId)
    let seeded = false
    if (!currentRecord) {
      currentRecord = seedRecord(agentId)
      await deps.upsertAccreditation(currentRecord)
      seeded = true
    }

    // 3) Persist the new Q4 rows (durable window — A-3).
    const persistRes = await deps.persistEvaluatedActions(newActions)
    if (!persistRes.ok) return persistRes

    // 4) Read back the recent window (oldest-first) + the lifetime total.
    const recentRes = await deps.getRecentEvaluatedActions(agentId, DEFAULT_WINDOW_CONFIG.window_size)
    if (!recentRes.ok) return recentRes
    const totalRes = await deps.countLifetimeActions(agentId)
    if (!totalRes.ok) return totalRes

    // 5) Aggregate → grade transition (existing pure functions; SR-4 reuse).
    const snapshot = computeWindowSnapshot(agentId, recentRes.value, totalRes.value)
    const transition = evaluateGradeTransition(currentRecord, snapshot, 0)

    // 6) Upsert the engine's resulting record (NOT a hand-written grade).
    await deps.upsertAccreditation(transition.record)

    // 7) SR-15 — compute + store the per-domain proximity (KP-04 unity rule).
    const perDomain = computePerDomainProximity(q4.actions)
    const proxRes = await deps.upsertProximityDomains(agentId, perDomain)
    if (!proxRes.ok) return proxRes

    return {
      ok: true,
      value: {
        evaluated_actions_persisted: persistRes.value.inserted,
        seeded_accreditation: seeded,
        grade_changed: transition.grade_changed,
        senecan_grade: transition.record.senecan_grade,
        typical_proximity: transition.record.typical_proximity,
        dimension_levels: transition.record.dimension_levels,
        direction_of_travel: transition.record.direction_of_travel,
        per_domain_proximity: perDomain,
      },
    }
  } catch (e) {
    return { ok: false, error: `feedSageAssent threw: ${(e as Error).message}` }
  }
}
