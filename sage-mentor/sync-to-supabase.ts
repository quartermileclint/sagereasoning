/**
 * sync-to-supabase.ts — Markdown → Supabase Sync Bridge
 *
 * Bridges local markdown files (fast, visible, editable) with
 * Supabase persistent memory (durable, searchable, cross-device).
 *
 * Two modes:
 *   1. Per-interaction: Runs after each interaction is resolved
 *   2. End-of-day batch: Scans all resolved files, verifies sync,
 *      pushes any missed items, generates daily pattern summary
 *
 * The sync function:
 *   1. Reads the markdown file
 *   2. Parses frontmatter + body + ring-review block
 *   3. Upserts into support_interactions table
 *   4. Records token usage from the ring session
 *   5. Marks the local file as synced (adds synced_at to frontmatter)
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
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { TokenUsage } from './ring-wrapper'
import type { InboxItem, InboxFrontmatter } from './support-agent'
import { parseFrontmatter, serialiseFrontmatter, parseInboxFile } from './support-agent'

// ============================================================================
// TYPES
// ============================================================================

/**
 * A Supabase client interface.
 * Uses the standard Supabase JS client pattern.
 * Injected at runtime — no hard dependency on @supabase/supabase-js.
 */
export type SupabaseClient = {
  from: (table: string) => {
    upsert: (data: Record<string, unknown>, options?: { onConflict?: string }) => Promise<{ data: unknown; error: Error | null }>
    insert: (data: Record<string, unknown> | Record<string, unknown>[]) => Promise<{ data: unknown; error: Error | null }>
    select: (columns?: string) => {
      eq: (column: string, value: unknown) => {
        single: () => Promise<{ data: unknown; error: Error | null }>
        gte: (column: string, value: unknown) => {
          lte: (column: string, value: unknown) => Promise<{ data: unknown[]; error: Error | null }>
        }
      }
    }
  }
  rpc: (fn: string, params: Record<string, unknown>) => Promise<{ data: unknown; error: Error | null }>
}

/**
 * Record shape for the support_interactions Supabase table.
 */
export type SupportInteractionRecord = {
  interaction_id: string
  user_id: string
  channel: string
  status: string
  customer_id: string | null
  subject: string | null
  raw_content: string
  draft_response: string | null
  ring_evaluation: Record<string, unknown> | null
  resolved_at: string | null
  updated_at: string
}

/**
 * Record shape for the support_token_usage Supabase table.
 */
export type SupportTokenUsageRecord = {
  user_id: string
  interaction_id: string
  model: string
  model_tier: string
  input_tokens: number
  output_tokens: number
  estimated_cost: number
  phase: string
}

/**
 * Record shape for the support_pattern_summaries Supabase table.
 */
export type PatternSummaryRecord = {
  user_id: string
  summary_type: 'weekly' | 'monthly' | 'quarterly'
  period_start: string
  period_end: string
  total_interactions: number
  resolution_rate: number | null
  escalation_rate: number | null
  top_topics: Record<string, unknown> | null
  ring_observations: Record<string, unknown> | null
}

/**
 * Result of a sync operation.
 */
export type SyncResult = {
  readonly interaction_id: string
  readonly synced: boolean
  readonly error: string | null
  readonly synced_at: string
}

/**
 * Result of a batch sync operation.
 */
export type BatchSyncResult = {
  readonly total_files: number
  readonly synced: number
  readonly already_synced: number
  readonly failed: number
  readonly errors: string[]
  readonly pattern_summary_generated: boolean
}

// ============================================================================
// PER-INTERACTION SYNC
// ============================================================================

/**
 * Sync a single resolved interaction to Supabase.
 *
 * Call this after a support interaction is resolved (founder approved).
 *
 * Steps:
 * 1. Parse the markdown file into structured data
 * 2. Upsert into support_interactions table
 * 3. Record token usage if available
 * 4. Return the synced_at timestamp for the local file
 */
export async function syncInteraction(
  supabase: SupabaseClient,
  userId: string,
  item: InboxItem,
  tokenUsage: TokenUsage[] = []
): Promise<SyncResult> {
  const now = new Date().toISOString()

  try {
    // 1. Build the interaction record
    const record: SupportInteractionRecord = {
      interaction_id: item.frontmatter.id,
      user_id: userId,
      channel: item.frontmatter.channel,
      status: item.frontmatter.status,
      customer_id: item.frontmatter.customer || null,
      subject: item.frontmatter.subject || null,
      raw_content: item.customer_message,
      draft_response: item.draft_response || null,
      ring_evaluation: item.ring_review
        ? { raw_text: item.ring_review }
        : null,
      resolved_at: item.frontmatter.status === 'resolved' ? now : null,
      updated_at: now,
    }

    // 2. Upsert into support_interactions
    const { error: interactionError } = await supabase
      .from('support_interactions')
      .upsert(record, { onConflict: 'interaction_id' })

    if (interactionError) {
      return {
        interaction_id: item.frontmatter.id,
        synced: false,
        error: `Failed to upsert interaction: ${interactionError.message}`,
        synced_at: '',
      }
    }

    // 3. Record token usage
    if (tokenUsage.length > 0) {
      const usageRecords: SupportTokenUsageRecord[] = tokenUsage.map(t => ({
        user_id: userId,
        interaction_id: item.frontmatter.id,
        model: t.model,
        model_tier: t.model_tier,
        input_tokens: t.input_tokens,
        output_tokens: t.output_tokens,
        estimated_cost: t.estimated_cost_usd,
        phase: t.phase,
      }))

      const { error: usageError } = await supabase
        .from('support_token_usage')
        .insert(usageRecords)

      if (usageError) {
        // Non-fatal — interaction is synced, just usage failed
        console.warn(`Token usage sync failed for ${item.frontmatter.id}: ${usageError.message}`)
      }
    }

    return {
      interaction_id: item.frontmatter.id,
      synced: true,
      error: null,
      synced_at: now,
    }
  } catch (err) {
    return {
      interaction_id: item.frontmatter.id,
      synced: false,
      error: `Unexpected error: ${err instanceof Error ? err.message : String(err)}`,
      synced_at: '',
    }
  }
}

// ============================================================================
// BATCH SYNC (End of Day)
// ============================================================================

/**
 * Run end-of-day batch sync.
 *
 * 1. Scan all resolved files from today
 * 2. Check which ones have been synced (synced_at in frontmatter)
 * 3. Push any missed items
 * 4. Generate daily pattern summary
 */
export async function batchSync(
  supabase: SupabaseClient,
  userId: string,
  resolvedItems: InboxItem[]
): Promise<BatchSyncResult> {
  let synced = 0
  let alreadySynced = 0
  let failed = 0
  const errors: string[] = []

  for (const item of resolvedItems) {
    // Skip already-synced items
    if (item.frontmatter.synced_at) {
      alreadySynced++
      continue
    }

    const result = await syncInteraction(supabase, userId, item)

    if (result.synced) {
      synced++
    } else {
      failed++
      if (result.error) errors.push(`${item.frontmatter.id}: ${result.error}`)
    }
  }

  // Generate daily pattern summary
  let patternGenerated = false
  if (resolvedItems.length > 0) {
    const summaryResult = await generateAndSyncPatternSummary(
      supabase,
      userId,
      resolvedItems,
      'weekly'
    )
    patternGenerated = summaryResult.synced
  }

  return {
    total_files: resolvedItems.length,
    synced,
    already_synced: alreadySynced,
    failed,
    errors,
    pattern_summary_generated: patternGenerated,
  }
}

// ============================================================================
// PATTERN SUMMARY GENERATION
// ============================================================================

/**
 * Generate and sync a pattern summary from resolved interactions.
 */
async function generateAndSyncPatternSummary(
  supabase: SupabaseClient,
  userId: string,
  items: InboxItem[],
  summaryType: 'weekly' | 'monthly' | 'quarterly'
): Promise<{ synced: boolean; error: string | null }> {
  const dates = items
    .map(i => i.frontmatter.received.split('T')[0])
    .sort()

  const periodStart = dates[0] || new Date().toISOString().split('T')[0]
  const periodEnd = dates[dates.length - 1] || periodStart

  const totalInteractions = items.length
  const resolved = items.filter(i => i.frontmatter.status === 'resolved').length
  const escalated = items.filter(i => i.frontmatter.status === 'escalated').length

  // Aggregate topics from subjects
  const topicCounts: Record<string, number> = {}
  for (const item of items) {
    const subject = item.frontmatter.subject.toLowerCase()
    // Simple topic extraction — group by common keywords
    const keywords = subject.split(/\s+/).filter(w => w.length > 3)
    for (const kw of keywords) {
      topicCounts[kw] = (topicCounts[kw] || 0) + 1
    }
  }

  const topTopics = Object.entries(topicCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }))

  // Aggregate governance flags
  const allFlags: Record<string, number> = {}
  for (const item of items) {
    for (const flag of item.frontmatter.governance_flags) {
      allFlags[flag] = (allFlags[flag] || 0) + 1
    }
  }

  const record: PatternSummaryRecord = {
    user_id: userId,
    summary_type: summaryType,
    period_start: periodStart,
    period_end: periodEnd,
    total_interactions: totalInteractions,
    resolution_rate: totalInteractions > 0
      ? Math.round((resolved / totalInteractions) * 10000) / 100
      : null,
    escalation_rate: totalInteractions > 0
      ? Math.round((escalated / totalInteractions) * 10000) / 100
      : null,
    top_topics: { topics: topTopics },
    ring_observations: {
      governance_flags: allFlags,
      channels: items.reduce<Record<string, number>>((acc, i) => {
        acc[i.frontmatter.channel] = (acc[i.frontmatter.channel] || 0) + 1
        return acc
      }, {}),
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

// ============================================================================
// FRONTMATTER UPDATE HELPER
// ============================================================================

/**
 * Update the synced_at field in a markdown file's frontmatter.
 *
 * Returns the updated file content string.
 * The caller is responsible for writing it to disk.
 */
export function markAsSynced(fileContent: string, syncedAt: string): string {
  const { frontmatter, body } = parseFrontmatter(fileContent)
  frontmatter.synced_at = syncedAt
  return `---\n${serialiseFrontmatter(frontmatter)}\n---\n${body}`
}
