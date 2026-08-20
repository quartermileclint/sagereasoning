/**
 * R20a Classifier Cost Tracker
 *
 * Scaffolded infrastructure for tracking R20a classifier costs.
 * Phase D (r20a-classifier.ts) calls logClassifierRun() after each invocation.
 * /api/billing/usage-summary calls getClassifierCostSummary() for monthly aggregation.
 *
 * ADR-R20a-01 D7-b: If classifier cost exceeds 20% of mentor-turn cost in any
 * month, the ADR is reopened for reconsideration.
 *
 * Status: Scaffolded — table and function exist, classifier not yet built.
 *         Becomes active when Phase D (r20a-classifier.ts) ships.
 *
 * Rules served: R5 (cost health), R20a (vulnerable user protections)
 *
 * ---------------------------------------------------------------------------
 * Option D integration (per D-BILLING-MODEL-LOCKED-2026-05-17 + Decision E +
 * build session Step 6, 2026-05-MM):
 *
 * `logClassifierRun` accepts an optional `loop_id` that is persisted into
 * classifier_cost_log.loop_id (new column added in option-d-billing-schema.sql).
 * This enables forensic queries that join classifier_cost_log with
 * loop_billing_events on loop_id (e.g., "total LLM cost for loop X including
 * its classifier run").
 *
 * Live add-to-loop-aggregate at the TypeScript layer (so the loop's
 * loop_billing_events.anthropic_cost_cents includes the classifier's cost)
 * is DEFERRED under PR7 to avoid touching r20a-classifier.ts (Critical
 * under PR6). Current shape: classifier cost lives in classifier_cost_log;
 * loop cost in loop_billing_events; the two are joined post-hoc by analytics
 * or reconciliation queries via the new loop_id column. Revisit condition:
 * the discrepancy materially affects R5 ratio analysis OR an integration
 * use case requires unified cost surfaces.
 *
 * Pricing convention reconciliation with /website/src/lib/loop-cost-tracker.ts:
 * the per-million constants below (HAIKU_INPUT_COST_PER_MILLION = 25,
 * OUTPUT = 125) appear to overestimate Anthropic Haiku 4.5 pricing by ~25x
 * relative to the design's cost-per-loop appendix and loop-cost-tracker.ts's
 * convention ($1/$5 per million tokens). The two trackers are NOT yet sharing
 * the per-call cost-estimation primitive — re-aligning is a follow-on
 * Standard-risk session per PR7 to avoid pricing-correction scope creep into
 * the Option D build.
 * ---------------------------------------------------------------------------
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { COST_HEALTH } from '@/lib/stripe'
import { deterministicLoopId } from '@/lib/loop-cost-tracker'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ClassifierRunLog {
  session_id?: string         // mentor session ID (null for batch rescoring)
  rule_stage_hit: boolean     // true if rules matched (no LLM needed)
  llm_stage_ran: boolean      // true if borderline → Haiku called
  llm_input_tokens?: number   // Haiku input tokens (null if LLM not called)
  llm_output_tokens?: number  // Haiku output tokens (null if LLM not called)
  severity_result: number     // 0=clear, 1=mild, 2=moderate, 3=acute
  flag_written: boolean       // true if a vulnerability_flag row was created
  loop_id?: string            // OPTIONAL — parent loop UUID when classifier runs inside a wrapper
                              // invocation (Option D integration per D-BILLING-MODEL-LOCKED-2026-05-17
                              // Decision E + Step 6). Persisted to classifier_cost_log.loop_id.
                              // Enables forensic JOIN with loop_billing_events.
}

export interface ClassifierCostSummary {
  total_invocations: number
  rule_only_count: number
  llm_invocations: number
  total_cost_cents: number
  avg_cost_per_run: number
  flags_written: number
  severity_3_count: number
}

export interface ClassifierCostAlert {
  triggered: boolean
  classifier_cost_cents: number
  mentor_turn_cost_cents: number
  ratio: number | null
  threshold: number
  message: string | null
}

// ---------------------------------------------------------------------------
// Haiku cost model — update when Anthropic pricing changes
// ---------------------------------------------------------------------------

// Haiku pricing as of April 2026 (USD per 1M tokens)
const HAIKU_INPUT_COST_PER_MILLION = 25   // $0.025 per 1K = $25 per 1M
const HAIKU_OUTPUT_COST_PER_MILLION = 125  // $0.125 per 1K = $125 per 1M

/**
 * Estimate cost in cents for a single Haiku call.
 */
function estimateHaikuCostCents(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1_000_000) * HAIKU_INPUT_COST_PER_MILLION * 100
  const outputCost = (outputTokens / 1_000_000) * HAIKU_OUTPUT_COST_PER_MILLION * 100
  return Math.round((inputCost + outputCost) * 10000) / 10000  // 4 decimal places
}

// ---------------------------------------------------------------------------
// Service client (admin — no RLS)
// ---------------------------------------------------------------------------

function getAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ---------------------------------------------------------------------------
// Log a classifier run
// ---------------------------------------------------------------------------

/**
 * Called by Phase D classifier after each invocation.
 * Logs the run to classifier_cost_log for monthly aggregation.
 *
 * Cost is auto-calculated from token counts if LLM was invoked,
 * or zero if only the rule stage fired.
 */
/**
 * THE DEFECT THIS EXISTS TO CLOSE (R2b item 5, 2026-08-17), which every prior record
 * MIS-NAMED as "the reflect-path loop_id metering bug":
 *
 * `classifier_cost_log.session_id` is a **UUID** column
 * (supabase/migrations/20260417_r20a_classifier_cost_tracking.sql:45). Two live
 * surfaces hand the R20a gate a FREE-FORM session id and it arrives here unshaped:
 *   • /api/practice/reflect (route.ts:413) — ids shaped `reflect-<uuid>`
 *   • /api/calling         (route.ts:462) — an unrecorded adjacent instance
 * Both parse only as `typeof === 'string' && trim().length > 0`, and both tables
 * store the id as `text`, so the value is genuinely free-form by design.
 *
 * Postgres rejects the whole INSERT on the cast — so it is not merely a lost
 * correlation id: the token counts, the cost cents and the severity for that run are
 * lost with it. CORRECTED 2026-08-17 (PR19 fold — the original text here claimed
 * this was "swallowed TWICE", which overstated the path): `logClassifierRun`
 * below never THROWS on a Supabase query-level error — it awaits the insert and,
 * on `{error}`, only `console.error`s and resolves normally. So
 * `logClassifierRunSafe`'s `.catch()` (r20a-classifier.ts) is DEAD CODE for this
 * specific defect — it never fires, because there is no rejection to catch. The
 * failure is swallowed ONCE, by the internal console.error below. (The `.catch()`
 * remains live for a genuinely different failure class — a synchronous throw
 * before the query resolves, e.g. `getAdminClient()` itself throwing — just not
 * this one.) Net effect unchanged either way: reflect persists, loop billing
 * succeeds, and the cost row is PERMANENTLY ABSENT. R20a cost/coverage telemetry
 * has been silently undercounting both surfaces.
 *
 * NOT the reflect route's `loop_id`, which has been UUID-safe since that route's
 * creation (`extractLoopId(request) ?? generateLoopId()`, present from 0eb36c8).
 * Verified; deliberately untouched.
 *
 * WHY SHAPE AT THIS CHOKEPOINT rather than thread a real UUID from each route: this
 * is the single write into the column, so it defends all three current gate call
 * sites AND every future one, where per-route threading defends only the callers
 * someone remembers to update — the exact fragility that let /api/calling go
 * unrecorded. The shaping is DETERMINISTIC (`deterministicLoopId`, the proven S9b
 * fix), so the same session id always yields the same UUID and rows remain
 * correlatable to each other; it is one-way, so the original id is not recoverable
 * from the column — an honest trade, named rather than hidden.
 *
 * DARK: gated by SUBSTRATE_CLASSIFIER_SESSION_ID_SHAPING_ENABLED. Unflagged this
 * would be a live behaviour change on push — two surfaces would begin writing rows
 * they have NEVER written, stepping up the numerator of the R5 classifier-cost ratio
 * against a live alert threshold. Flagged, activation is its own small founder-walked
 * step with a real before/after row-count observation.
 */
export const CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR =
  'SUBSTRATE_CLASSIFIER_SESSION_ID_SHAPING_ENABLED'

/** True only for the exact string 'true'. Read at call time, per the house pattern. */
export function isClassifierSessionIdShapingEnabled(): boolean {
  return process.env[CLASSIFIER_SESSION_ID_SHAPING_ENV_VAR] === 'true'
}

/** A canonical UUID v4 matcher — an id already in UUID shape is passed through
 *  UNCHANGED, so existing well-formed callers keep their real, joinable id.
 *  Exported (2026-08-20, M-5 fix) so r20a-vulnerability-write.ts can reuse the
 *  same pattern instead of a second, independently-maintained copy — purely
 *  additive, no behaviour change to this file. */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Shape a caller-supplied session id into something the UUID column accepts.
 * Flag-off ⇒ returns exactly what the previous code passed (`v || null`), so the
 * insert is byte-identical, including its failure.
 *
 * The seed prefix is FIXED and recorded here rather than only in code, because
 * changing it later would silently break every prior row's recoverability.
 */
export function shapeClassifierSessionId(sessionId: string | null | undefined): string | null {
  const v = sessionId || null
  if (!isClassifierSessionIdShapingEnabled()) return v
  if (v === null) return null
  if (UUID_RE.test(v)) return v
  return deterministicLoopId(`classifier-session|${v}`)
}

export async function logClassifierRun(run: ClassifierRunLog): Promise<void> {
  const admin = getAdminClient()

  let estimatedCostCents = 0
  if (run.llm_stage_ran && run.llm_input_tokens && run.llm_output_tokens) {
    estimatedCostCents = estimateHaikuCostCents(run.llm_input_tokens, run.llm_output_tokens)
  }

  const { error } = await admin
    .from('classifier_cost_log')
    .insert({
      session_id: shapeClassifierSessionId(run.session_id),
      rule_stage_hit: run.rule_stage_hit,
      llm_stage_ran: run.llm_stage_ran,
      llm_input_tokens: run.llm_input_tokens || null,
      llm_output_tokens: run.llm_output_tokens || null,
      estimated_cost_cents: estimatedCostCents,
      severity_result: run.severity_result,
      flag_written: run.flag_written,
      loop_id: run.loop_id || null,  // Option D integration — null when classifier
                                      // runs outside a wrapper loop (mentor surfaces, etc.)
    })

  if (error) {
    // Fail open — classifier cost logging should never block the response path
    // Log but do not throw
    console.error('[R20a cost tracker] Failed to log classifier run:', error.message)
  }
}

// ---------------------------------------------------------------------------
// Monthly aggregation query
// ---------------------------------------------------------------------------

/**
 * Fetches the monthly classifier cost summary using the DB function.
 * Called by /api/billing/usage-summary.
 */
export async function getClassifierCostSummary(
  periodStart: string,
  periodEnd: string
): Promise<ClassifierCostSummary> {
  const admin = getAdminClient()

  const { data, error } = await admin
    .rpc('get_classifier_cost_summary', {
      p_period_start: periodStart,
      p_period_end: periodEnd,
    })

  if (error || !data || data.length === 0) {
    // Return zeros if table is empty or function doesn't exist yet
    // (graceful degradation before migration is run)
    return {
      total_invocations: 0,
      rule_only_count: 0,
      llm_invocations: 0,
      total_cost_cents: 0,
      avg_cost_per_run: 0,
      flags_written: 0,
      severity_3_count: 0,
    }
  }

  const row = Array.isArray(data) ? data[0] : data
  return {
    total_invocations: Number(row.total_invocations) || 0,
    rule_only_count: Number(row.rule_only_count) || 0,
    llm_invocations: Number(row.llm_invocations) || 0,
    total_cost_cents: Number(row.total_cost_cents) || 0,
    avg_cost_per_run: Number(row.avg_cost_per_run) || 0,
    flags_written: Number(row.flags_written) || 0,
    severity_3_count: Number(row.severity_3_count) || 0,
  }
}

// ---------------------------------------------------------------------------
// 20% threshold check — ADR-R20a-01 D7-b
// ---------------------------------------------------------------------------

/**
 * Checks whether classifier cost exceeds 20% of mentor-turn cost this month.
 * Returns an alert object. If triggered, the ADR should be reopened.
 *
 * mentorTurnCostCents: total estimated cost of mentor LLM calls this period.
 * classifierCostCents: total classifier cost this period (from getClassifierCostSummary).
 */
export function checkClassifierCostThreshold(
  classifierCostCents: number,
  mentorTurnCostCents: number
): ClassifierCostAlert {
  const threshold = COST_HEALTH.R20A_CLASSIFIER_MAX_MENTOR_RATIO

  if (mentorTurnCostCents === 0) {
    return {
      triggered: false,
      classifier_cost_cents: classifierCostCents,
      mentor_turn_cost_cents: 0,
      ratio: null,
      threshold,
      message: classifierCostCents > 0
        ? 'Classifier costs accruing but no mentor-turn costs recorded yet. Cannot compute ratio.'
        : null,
    }
  }

  const ratio = classifierCostCents / mentorTurnCostCents

  if (ratio > threshold) {
    return {
      triggered: true,
      classifier_cost_cents: classifierCostCents,
      mentor_turn_cost_cents: mentorTurnCostCents,
      ratio: Math.round(ratio * 10000) / 10000,
      threshold,
      message:
        `R20a ALERT: Classifier cost ($${(classifierCostCents / 100).toFixed(2)}) is ` +
        `${(ratio * 100).toFixed(1)}% of mentor-turn cost ($${(mentorTurnCostCents / 100).toFixed(2)}). ` +
        `Exceeds ${threshold * 100}% threshold. ADR-R20a-01 should be reopened per D7-b.`,
    }
  }

  return {
    triggered: false,
    classifier_cost_cents: classifierCostCents,
    mentor_turn_cost_cents: mentorTurnCostCents,
    ratio: Math.round(ratio * 10000) / 10000,
    threshold,
    message: null,
  }
}
