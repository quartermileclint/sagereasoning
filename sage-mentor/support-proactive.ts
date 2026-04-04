/**
 * support-proactive.ts — Proactive Scheduler Wiring for Support Agent
 *
 * Connects the proactive scheduler to the support agent's operational
 * context. When the morning/evening/weekly prompts fire, they now
 * include support context:
 *
 *   Morning: "Any open tickets from yesterday? Any patterns?"
 *   Evening: "How did you handle today's escalation?"
 *   Weekly:  "What topics came up most? Is the KB covering them?"
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance]
 * deprecation_flag: false
 */

import type { InboxItem } from './support-agent'
import { generateDailySummary } from './support-agent'
import type { ProactiveResult, ProactiveScheduleType, ProactivePreferences } from './proactive-scheduler'
import { dispatchProactive, buildProactiveInteractionRecord } from './proactive-scheduler'
import type { ProfileWithCache } from './profile-store'
import type { LLMBridgeConfig, LLMCallResult } from './llm-bridge'
import { executeProactiveWithLLM } from './llm-bridge'
import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Support context injected into proactive prompts.
 */
export type SupportContext = {
  /** Open tickets still in the inbox */
  readonly open_tickets: number
  /** Escalated tickets needing founder attention */
  readonly escalated_tickets: number
  /** Tickets resolved today */
  readonly resolved_today: number
  /** Most common topic today */
  readonly top_topic: string | null
  /** Any governance flags raised today */
  readonly governance_flags: string[]
  /** Total interactions this week (for weekly mirror) */
  readonly week_total: number
  /** Resolution rate this week */
  readonly week_resolution_rate: number | null
}

/**
 * Result of a support-aware proactive execution.
 */
export type SupportProactiveResult = {
  readonly type: ProactiveScheduleType
  readonly response: string
  readonly support_context: SupportContext
  readonly error: string | null
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build support context from current inbox state.
 *
 * Reads the current state of inbox and resolved items to build
 * operational context for the proactive prompts.
 */
export function buildSupportContext(
  openItems: InboxItem[],
  resolvedToday: InboxItem[],
  resolvedThisWeek: InboxItem[]
): SupportContext {
  const dailySummary = resolvedToday.length > 0
    ? generateDailySummary(resolvedToday)
    : null

  const weekTotal = resolvedThisWeek.length
  const weekResolved = resolvedThisWeek.filter(i => i.frontmatter.status === 'resolved').length

  // Find the most common topic from today's subjects
  const topicCounts: Record<string, number> = {}
  for (const item of [...openItems, ...resolvedToday]) {
    const words = item.frontmatter.subject.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    for (const word of words) {
      topicCounts[word] = (topicCounts[word] || 0) + 1
    }
  }
  const topTopic = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || null

  return {
    open_tickets: openItems.filter(i => i.frontmatter.status === 'open').length,
    escalated_tickets: openItems.filter(i => i.frontmatter.status === 'escalated').length,
    resolved_today: resolvedToday.length,
    top_topic: topTopic,
    governance_flags: dailySummary?.governance_flags || [],
    week_total: weekTotal,
    week_resolution_rate: weekTotal > 0
      ? Math.round((weekResolved / weekTotal) * 100)
      : null,
  }
}

// ============================================================================
// SUPPORT-AWARE PROMPT ENRICHMENT
// ============================================================================

/**
 * Build a support context addendum for proactive prompts.
 *
 * This text is appended to the standard proactive prompt so the
 * mentor can incorporate operational awareness into its output.
 */
export function buildSupportAddendum(
  context: SupportContext,
  scheduleType: ProactiveScheduleType
): string {
  const lines: string[] = []

  if (scheduleType === 'morning_check_in') {
    lines.push('\n--- Support Operations Context ---')
    if (context.open_tickets > 0) {
      lines.push(`There are ${context.open_tickets} open support ticket(s) in the inbox.`)
    }
    if (context.escalated_tickets > 0) {
      lines.push(`${context.escalated_tickets} ticket(s) are escalated and need the founder's attention.`)
    }
    if (context.resolved_today > 0) {
      lines.push(`${context.resolved_today} ticket(s) were resolved yesterday.`)
    }
    if (context.governance_flags.length > 0) {
      lines.push(`Recent governance flags: ${context.governance_flags.join(', ')}`)
    }
    lines.push('Consider asking: "Any of these need attention before the day begins?"')
  }

  if (scheduleType === 'evening_reflection') {
    lines.push('\n--- Today\'s Support Activity ---')
    lines.push(`Resolved today: ${context.resolved_today}`)
    lines.push(`Still open: ${context.open_tickets}`)
    if (context.escalated_tickets > 0) {
      lines.push(`Escalated: ${context.escalated_tickets} (governance-sensitive)`)
    }
    if (context.top_topic) {
      lines.push(`Most common topic today: "${context.top_topic}"`)
    }
    lines.push('Consider asking: "How did you handle the most challenging inquiry today?"')
  }

  if (scheduleType === 'weekly_pattern_mirror') {
    lines.push('\n--- This Week\'s Support Patterns ---')
    lines.push(`Total interactions this week: ${context.week_total}`)
    if (context.week_resolution_rate !== null) {
      lines.push(`Resolution rate: ${context.week_resolution_rate}%`)
    }
    if (context.top_topic) {
      lines.push(`Most discussed topic: "${context.top_topic}"`)
    }
    if (context.governance_flags.length > 0) {
      lines.push(`Governance flags this week: ${context.governance_flags.join(', ')}`)
    }
    lines.push('Consider noting: which topics recur? Is the knowledge base covering the right questions?')
  }

  return lines.join('\n')
}

// ============================================================================
// FULL PROACTIVE EXECUTION WITH SUPPORT CONTEXT
// ============================================================================

/**
 * Execute a proactive output enriched with support context.
 *
 * Flow:
 * 1. Build support context from current operational state
 * 2. Dispatch the standard proactive prompt
 * 3. If dispatched, append support context addendum
 * 4. Send to LLM via the bridge
 * 5. Return the response with context
 */
export async function executeSupportProactive(
  scheduleType: ProactiveScheduleType,
  cached: ProfileWithCache,
  prefs: ProactivePreferences,
  openItems: InboxItem[],
  resolvedToday: InboxItem[],
  resolvedThisWeek: InboxItem[],
  llmConfig: LLMBridgeConfig,
  weekActions?: { action: string; proximity: KatorthomaProximityLevel; passions: string[] }[]
): Promise<SupportProactiveResult> {
  // 1. Build support context
  const supportContext = buildSupportContext(openItems, resolvedToday, resolvedThisWeek)

  // 2. Dispatch the standard proactive output
  const proactiveResult = dispatchProactive(scheduleType, cached, prefs, weekActions)

  if (!proactiveResult) {
    return {
      type: scheduleType,
      response: '',
      support_context: supportContext,
      error: 'Proactive output suppressed (quiet mode or no data)',
    }
  }

  // 3. Enrich the system prompt with support context
  const supportAddendum = buildSupportAddendum(supportContext, scheduleType)
  const enrichedResult: ProactiveResult = {
    ...proactiveResult,
    system_prompt: proactiveResult.system_prompt + supportAddendum,
  }

  // 4. Execute via LLM bridge
  const llmOutput = await executeProactiveWithLLM(llmConfig, enrichedResult)

  if (llmOutput.error) {
    return {
      type: scheduleType,
      response: '',
      support_context: supportContext,
      error: llmOutput.error,
    }
  }

  // 5. Update token usage on the proactive result
  if (llmOutput.tokenUsage) {
    proactiveResult.token_usage = llmOutput.tokenUsage
  }

  return {
    type: scheduleType,
    response: llmOutput.response,
    support_context: supportContext,
    error: null,
  }
}
