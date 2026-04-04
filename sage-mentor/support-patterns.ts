/**
 * support-patterns.ts — Pattern Engine Wiring for Support Data
 *
 * Connects the pattern engine (pattern-engine.ts) to support
 * operational data. Analyses support interactions for:
 *
 *   - Topic recurrence (what questions come up most?)
 *   - Escalation patterns (which types always escalate?)
 *   - KB coverage gaps (frequent questions not in KB?)
 *   - Channel distribution trends
 *   - Governance flag frequency
 *
 * Stores summaries in the support_pattern_summaries Supabase table.
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-005]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance]
 * deprecation_flag: false
 */

import type { InboxItem, KBArticle } from './support-agent'
import { searchKnowledgeBase } from './support-agent'
import type { SupabaseClient, PatternSummaryRecord } from './sync-to-supabase'

// ============================================================================
// TYPES
// ============================================================================

/**
 * A pattern detected in support data.
 */
export type SupportPattern = {
  readonly type: 'topic_recurrence' | 'escalation_trend' | 'kb_gap' | 'channel_shift' | 'governance_frequency'
  readonly description: string
  readonly frequency: number
  readonly severity: 'info' | 'attention' | 'action_required'
  readonly recommendation: string
}

/**
 * Full analysis result from the support pattern engine.
 */
export type SupportPatternAnalysis = {
  readonly period: { start: string; end: string }
  readonly total_interactions: number
  readonly patterns: SupportPattern[]
  readonly top_topics: Array<{ topic: string; count: number }>
  readonly kb_coverage: {
    covered: number
    gaps: string[]
  }
  readonly channel_distribution: Record<string, number>
  readonly governance_summary: Record<string, number>
  readonly resolution_rate: number
  readonly escalation_rate: number
}

// ============================================================================
// PATTERN ANALYSIS
// ============================================================================

/**
 * Run pattern analysis on a set of support interactions.
 *
 * This is the batch analysis function called by the weekly pattern
 * summary workflow or the proactive scheduler.
 */
export function analyseSupportPatterns(
  interactions: InboxItem[],
  kbArticles: KBArticle[]
): SupportPatternAnalysis {
  if (interactions.length === 0) {
    return emptyAnalysis()
  }

  const dates = interactions.map(i => i.frontmatter.received.split('T')[0]).sort()
  const periodStart = dates[0]
  const periodEnd = dates[dates.length - 1]

  // ── Topic extraction ──────────────────────────────────────────
  const topicCounts: Record<string, number> = {}
  for (const item of interactions) {
    const words = extractTopicWords(item.frontmatter.subject, item.customer_message)
    for (const word of words) {
      topicCounts[word] = (topicCounts[word] || 0) + 1
    }
  }

  const topTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([topic, count]) => ({ topic, count }))

  // ── Channel distribution ──────────────────────────────────────
  const channelDist: Record<string, number> = {}
  for (const item of interactions) {
    channelDist[item.frontmatter.channel] = (channelDist[item.frontmatter.channel] || 0) + 1
  }

  // ── Governance flags ──────────────────────────────────────────
  const govFlags: Record<string, number> = {}
  for (const item of interactions) {
    for (const flag of item.frontmatter.governance_flags) {
      govFlags[flag] = (govFlags[flag] || 0) + 1
    }
  }

  // ── Resolution and escalation rates ───────────────────────────
  const resolved = interactions.filter(i => i.frontmatter.status === 'resolved').length
  const escalated = interactions.filter(i => i.frontmatter.status === 'escalated').length
  const total = interactions.length
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 10000) / 100 : 0
  const escalationRate = total > 0 ? Math.round((escalated / total) * 10000) / 100 : 0

  // ── KB coverage check ─────────────────────────────────────────
  const kbGaps: string[] = []
  let kbCovered = 0

  for (const topic of topTopics.slice(0, 10)) {
    const matches = searchKnowledgeBase(kbArticles, topic.topic, 1)
    if (matches.length > 0) {
      kbCovered++
    } else if (topic.count >= 2) {
      // Topic appears 2+ times but has no KB article
      kbGaps.push(topic.topic)
    }
  }

  // ── Pattern detection ─────────────────────────────────────────
  const patterns: SupportPattern[] = []

  // Topic recurrence patterns
  for (const topic of topTopics) {
    if (topic.count >= 5) {
      patterns.push({
        type: 'topic_recurrence',
        description: `"${topic.topic}" appears in ${topic.count} interactions`,
        frequency: topic.count,
        severity: topic.count >= 10 ? 'action_required' : 'attention',
        recommendation: `Consider creating a dedicated KB article or FAQ entry for "${topic.topic}"`,
      })
    }
  }

  // Escalation trend
  if (escalationRate > 20) {
    patterns.push({
      type: 'escalation_trend',
      description: `Escalation rate is ${escalationRate}% — above 20% threshold`,
      frequency: escalated,
      severity: escalationRate > 30 ? 'action_required' : 'attention',
      recommendation: 'Review escalated tickets for patterns. Consider adding playbooks for common escalation triggers.',
    })
  }

  // KB gaps
  if (kbGaps.length > 0) {
    patterns.push({
      type: 'kb_gap',
      description: `${kbGaps.length} frequent topic(s) not covered by knowledge base: ${kbGaps.join(', ')}`,
      frequency: kbGaps.length,
      severity: kbGaps.length >= 3 ? 'action_required' : 'attention',
      recommendation: `Write KB articles for: ${kbGaps.join(', ')}`,
    })
  }

  // Governance frequency
  if (Object.keys(govFlags).length > 0) {
    const totalFlags = Object.values(govFlags).reduce((a, b) => a + b, 0)
    patterns.push({
      type: 'governance_frequency',
      description: `${totalFlags} governance flag(s) triggered across ${Object.keys(govFlags).length} rule(s)`,
      frequency: totalFlags,
      severity: totalFlags >= 5 ? 'action_required' : 'info',
      recommendation: `Most triggered rule: ${Object.entries(govFlags).sort(([, a], [, b]) => b - a)[0][0]}. Review whether customers are unclear about SageReasoning's scope.`,
    })
  }

  return {
    period: { start: periodStart, end: periodEnd },
    total_interactions: total,
    patterns,
    top_topics: topTopics,
    kb_coverage: { covered: kbCovered, gaps: kbGaps },
    channel_distribution: channelDist,
    governance_summary: govFlags,
    resolution_rate: resolutionRate,
    escalation_rate: escalationRate,
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract meaningful topic words from subject and message content.
 */
function extractTopicWords(subject: string, message: string): string[] {
  const stopWords = new Set([
    'the', 'and', 'for', 'that', 'this', 'with', 'from', 'have', 'been',
    'will', 'your', 'about', 'what', 'how', 'does', 'can', 'not', 'are',
    'was', 'but', 'has', 'you', 'they', 'its', 'more', 'some', 'any',
    'when', 'which', 'would', 'could', 'should', 'there', 'their',
  ])

  const combined = `${subject} ${message.slice(0, 300)}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w))
}

/**
 * Return an empty analysis for periods with no data.
 */
function emptyAnalysis(): SupportPatternAnalysis {
  const today = new Date().toISOString().split('T')[0]
  return {
    period: { start: today, end: today },
    total_interactions: 0,
    patterns: [],
    top_topics: [],
    kb_coverage: { covered: 0, gaps: [] },
    channel_distribution: {},
    governance_summary: {},
    resolution_rate: 0,
    escalation_rate: 0,
  }
}

// ============================================================================
// SUPABASE SYNC
// ============================================================================

/**
 * Sync a pattern analysis to Supabase as a pattern summary.
 */
export async function syncPatternAnalysis(
  supabase: SupabaseClient,
  userId: string,
  analysis: SupportPatternAnalysis,
  summaryType: 'weekly' | 'monthly' | 'quarterly'
): Promise<{ synced: boolean; error: string | null }> {
  const record: PatternSummaryRecord = {
    user_id: userId,
    summary_type: summaryType,
    period_start: analysis.period.start,
    period_end: analysis.period.end,
    total_interactions: analysis.total_interactions,
    resolution_rate: analysis.resolution_rate,
    escalation_rate: analysis.escalation_rate,
    top_topics: {
      topics: analysis.top_topics,
      kb_gaps: analysis.kb_coverage.gaps,
    },
    ring_observations: {
      patterns: analysis.patterns,
      channel_distribution: analysis.channel_distribution,
      governance_summary: analysis.governance_summary,
    },
  }

  try {
    const { error } = await supabase
      .from('support_pattern_summaries')
      .upsert(record)

    return { synced: !error, error: error?.message || null }
  } catch (err) {
    return {
      synced: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Format a pattern analysis as human-readable markdown.
 *
 * Used for the weekly pattern summary workflow notification.
 */
export function formatPatternReport(analysis: SupportPatternAnalysis): string {
  const lines: string[] = []

  lines.push(`# Support Pattern Summary`)
  lines.push(`**Period:** ${analysis.period.start} to ${analysis.period.end}`)
  lines.push(`**Total interactions:** ${analysis.total_interactions}`)
  lines.push(`**Resolution rate:** ${analysis.resolution_rate}%`)
  lines.push(`**Escalation rate:** ${analysis.escalation_rate}%`)
  lines.push('')

  if (analysis.top_topics.length > 0) {
    lines.push('## Top Topics')
    for (const topic of analysis.top_topics.slice(0, 5)) {
      lines.push(`- ${topic.topic} (${topic.count} times)`)
    }
    lines.push('')
  }

  if (analysis.patterns.length > 0) {
    lines.push('## Patterns Detected')
    for (const pattern of analysis.patterns) {
      const icon = pattern.severity === 'action_required' ? '[ACTION]'
        : pattern.severity === 'attention' ? '[ATTENTION]'
        : '[INFO]'
      lines.push(`- ${icon} ${pattern.description}`)
      lines.push(`  Recommendation: ${pattern.recommendation}`)
    }
    lines.push('')
  }

  if (analysis.kb_coverage.gaps.length > 0) {
    lines.push('## Knowledge Base Gaps')
    lines.push(`Topics needing KB articles: ${analysis.kb_coverage.gaps.join(', ')}`)
    lines.push('')
  }

  return lines.join('\n')
}
