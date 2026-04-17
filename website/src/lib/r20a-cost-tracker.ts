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
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005]
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { COST_HEALTH } from '@/lib/stripe'

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
export async function logClassifierRun(run: ClassifierRunLog): Promise<void> {
  const admin = getAdminClient()

  let estimatedCostCents = 0
  if (run.llm_stage_ran && run.llm_input_tokens && run.llm_output_tokens) {
    estimatedCostCents = estimateHaikuCostCents(run.llm_input_tokens, run.llm_output_tokens)
  }

  const { error } = await admin
    .from('classifier_cost_log')
    .insert({
      session_id: run.session_id || null,
      rule_stage_hit: run.rule_stage_hit,
      llm_stage_ran: run.llm_stage_ran,
      llm_input_tokens: run.llm_input_tokens || null,
      llm_output_tokens: run.llm_output_tokens || null,
      estimated_cost_cents: estimatedCostCents,
      severity_result: run.severity_result,
      flag_written: run.flag_written,
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
