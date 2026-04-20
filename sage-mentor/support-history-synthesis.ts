/**
 * support-history-synthesis.ts — Channel 2: Support interaction history synthesis.
 *
 * PURPOSE: Teach the Support drafter who it is talking to. Before each
 * draft, read the customer's recent history from `support_interactions`,
 * compute category frequency + trend + open issues, and inject a
 * history_context block into `buildDraftPrompt` so the drafter sees
 * "this is customer X's third contact this week, two about billing, one
 * open issue still pending".
 *
 * Also surfaces the 30-day category frequency the feedback loop's 20%
 * category threshold consumes downstream.
 *
 * CLASSIFICATION: Elevated under 0d-ii (new read path, non-safety-critical).
 *
 * SCOPE: read-only. No writes, no migrations, no mutation of existing
 * support data. Select list is scoped to primitive columns — we do NOT
 * read `ring_evaluation` JSONB, so KG10 (JSONB storage format) does not
 * apply to this module. If a future change needs ring_evaluation, KG10's
 * defensive-parse pattern must be added explicitly.
 *
 * Rules served: R5 (cost awareness — category frequency informs the
 * 20% feedback loop), R16 (pipeline data governance — read-only view).
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-20
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-005]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-20
 * change_trigger: [support_interactions schema change]
 * deprecation_flag: false
 */

import type { PriorDistressFlag, SupabaseReadClient } from './support-distress-preprocessor'

// ============================================================================
// TYPES
// ============================================================================

/**
 * A reference to an unresolved support interaction. Surfaced to the
 * drafter so it can acknowledge open threads.
 */
export interface OpenIssueRef {
  readonly interaction_id: string
  readonly subject: string | null
  readonly channel: string
  readonly status: 'open' | 'in_progress' | 'escalated'
  readonly opened_at: string
  readonly days_open: number
}

/**
 * Trend classification based on contact volume in the window.
 *   new         → no prior contacts in the window
 *   returning   → 1-2 prior contacts
 *   frequent    → 3-5 prior contacts
 *   escalating  → 6+ prior contacts OR any escalated status in window
 */
export type SupportTrend = 'new' | 'returning' | 'frequent' | 'escalating'

/**
 * The synthesis output. Consumed by buildDraftPrompt as a history_context
 * block and by the feedback loop's 20% category threshold.
 */
export interface SupportInteractionHistory {
  readonly prior_contact_count: number
  readonly last_contact_at: string | null
  readonly open_issues: OpenIssueRef[]
  readonly category_frequency_30d: Record<string, number>
  readonly trend: SupportTrend
  readonly prior_distress_flags: PriorDistressFlag[]
  readonly synthesized_at: string
}

// ============================================================================
// CATEGORY BUCKETING
// ============================================================================

/**
 * Simple keyword-based category derivation from subject + (optional)
 * governance flags. Keeps the 20% category threshold computable without
 * a dedicated category column on `support_interactions`.
 *
 * Buckets are deliberately broad for Phase 1. Sharper categorisation
 * can be added post-MVP once real traffic informs the right axes.
 */
const CATEGORY_RULES: ReadonlyArray<{ bucket: string; keywords: readonly string[] }> = [
  { bucket: 'billing', keywords: ['billing', 'invoice', 'refund', 'charge', 'subscription', 'payment', 'receipt'] },
  { bucket: 'access', keywords: ['login', 'password', 'sign in', 'sign-in', 'access', 'locked out', '2fa', 'mfa'] },
  { bucket: 'feature', keywords: ['feature', 'request', 'suggestion', 'wishlist', 'can you add', 'would be nice'] },
  { bucket: 'bug', keywords: ['bug', 'broken', 'error', 'not working', 'crash', 'fails', 'exception'] },
  { bucket: 'account', keywords: ['account', 'profile', 'email change', 'delete my account', 'cancel account'] },
  { bucket: 'governance', keywords: ['therapy', 'therapeutic', 'clinical', 'medical', 'legal', 'compliance'] },
]

/**
 * Bucket a subject line into a broad category. Returns 'other' when no
 * keyword rule matches. Case-insensitive.
 */
export function categoriseSubject(subject: string | null | undefined): string {
  if (!subject) return 'other'
  const lower = subject.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.bucket
  }
  return 'other'
}

// ============================================================================
// TREND CLASSIFICATION
// ============================================================================

export function classifyTrend(
  priorContactCount: number,
  hasEscalationInWindow: boolean,
): SupportTrend {
  if (hasEscalationInWindow) return 'escalating'
  if (priorContactCount === 0) return 'new'
  if (priorContactCount <= 2) return 'returning'
  if (priorContactCount <= 5) return 'frequent'
  return 'escalating'
}

// ============================================================================
// OPEN-ISSUE DERIVATION
// ============================================================================

function toOpenIssueRef(
  row: Record<string, unknown>,
  now: number,
): OpenIssueRef | null {
  const status = String(row.status ?? '')
  if (status !== 'open' && status !== 'in_progress' && status !== 'escalated') {
    return null
  }
  const openedAt = String(row.created_at ?? '')
  const openedAtMs = openedAt ? Date.parse(openedAt) : NaN
  const daysOpen = Number.isFinite(openedAtMs)
    ? Math.max(0, Math.floor((now - openedAtMs) / (24 * 60 * 60 * 1000)))
    : 0

  return {
    interaction_id: String(row.interaction_id ?? row.id ?? ''),
    subject: row.subject != null ? String(row.subject) : null,
    channel: String(row.channel ?? 'email'),
    status: status as 'open' | 'in_progress' | 'escalated',
    opened_at: openedAt,
    days_open: daysOpen,
  }
}

// ============================================================================
// SUPABASE READ
// ============================================================================

/**
 * Read support_interactions rows for the user over a rolling window.
 *
 * Select list is deliberately scoped to primitive columns — we do NOT
 * read `ring_evaluation` JSONB, so KG10 does not apply here.
 *
 * Index utilised: idx_support_interactions_created (user_id, created_at DESC)
 *   — see api/migrations/support-agent-schema.sql. Elevated-risk worst
 *   case (slow query) is already mitigated by this index.
 */
async function readSupportInteractions(
  supabase: SupabaseReadClient,
  userId: string,
  windowDays: number,
): Promise<Record<string, unknown>[]> {
  const sinceIso = new Date(
    Date.now() - windowDays * 24 * 60 * 60 * 1000,
  ).toISOString()

  const result = await supabase
    .from('support_interactions')
    .select(
      'id, interaction_id, channel, status, customer_id, subject, created_at, resolved_at',
    )
    .eq('user_id', userId)
    .gte('created_at', sinceIso)
    .order('created_at', { ascending: false })
    .limit(200)

  if (result.error) {
    // Elevated-risk fail-soft: an empty history is safer than a 500 —
    // the drafter simply treats the customer as new.
    // eslint-disable-next-line no-console
    console.warn(
      '[support-history-synthesis] support_interactions read error — returning empty history',
      result.error.message,
    )
    return []
  }
  return Array.isArray(result.data) ? result.data : []
}

// ============================================================================
// PUBLIC ENTRY POINT
// ============================================================================

/**
 * Synthesise the customer's recent support interaction history.
 *
 * @param supabase     - Supabase read client (structural)
 * @param userId       - Auth user id (owner of the support interactions)
 * @param _customerId  - Customer correlation id. RESERVED for a future
 *                       phase that joins interactions across customers
 *                       sharing a single user_id. Phase 1 scopes history
 *                       to the user_id only — matching how
 *                       support_interactions' RLS is defined.
 * @param windowDays   - Rolling window. Defaults to 30 per the handoff.
 * @param priorDistressFlags - Prior flags from Channel 1. Re-used here
 *                       rather than re-queried (single source of truth).
 */
export async function synthesiseSupportHistory(
  supabase: SupabaseReadClient,
  userId: string,
  _customerId: string | null,
  windowDays: number = 30,
  priorDistressFlags: PriorDistressFlag[] = [],
): Promise<SupportInteractionHistory> {
  const now = Date.now()
  const rows = await readSupportInteractions(supabase, userId, windowDays)

  const categoryFrequency: Record<string, number> = {}
  const openIssues: OpenIssueRef[] = []
  let hasEscalation = false
  let lastContactAt: string | null = null

  for (const row of rows) {
    const status = String(row.status ?? '')
    if (status === 'escalated') hasEscalation = true

    const createdAt = String(row.created_at ?? '')
    if (createdAt && (!lastContactAt || createdAt > lastContactAt)) {
      lastContactAt = createdAt
    }

    const bucket = categoriseSubject(row.subject as string | null | undefined)
    categoryFrequency[bucket] = (categoryFrequency[bucket] ?? 0) + 1

    const open = toOpenIssueRef(row, now)
    if (open) openIssues.push(open)
  }

  return {
    prior_contact_count: rows.length,
    last_contact_at: lastContactAt,
    open_issues: openIssues,
    category_frequency_30d: categoryFrequency,
    trend: classifyTrend(rows.length, hasEscalation),
    prior_distress_flags: priorDistressFlags,
    synthesized_at: new Date().toISOString(),
  }
}

// ============================================================================
// PROMPT BLOCK BUILDER
// ============================================================================

/**
 * Build a plain-text history_context block for injection into the
 * Support draft prompt. Readable by the LLM without JSON parsing.
 *
 * The block deliberately uses natural prose — the drafter treats it as
 * background, not as structured data. No customer-identifying text is
 * echoed here beyond what the drafter already has access to via the
 * inbox item.
 */
export function formatHistoryContextBlock(history: SupportInteractionHistory): string {
  if (history.prior_contact_count === 0 && history.prior_distress_flags.length === 0) {
    return 'HISTORY CONTEXT:\nThis appears to be the customer\'s first recent contact (no prior support interactions in the last 30 days).'
  }

  const lines: string[] = ['HISTORY CONTEXT:']
  lines.push(`- Trend: ${history.trend}.`)
  lines.push(
    `- Prior contacts in the last 30 days: ${history.prior_contact_count}` +
      (history.last_contact_at ? ` (last: ${history.last_contact_at}).` : '.'),
  )

  const freqEntries = Object.entries(history.category_frequency_30d)
    .sort((a, b) => b[1] - a[1])
  if (freqEntries.length > 0) {
    const freqStr = freqEntries
      .map(([bucket, count]) => `${bucket} (${count})`)
      .join(', ')
    lines.push(`- Category frequency (30d): ${freqStr}.`)
  }

  if (history.open_issues.length > 0) {
    lines.push(`- Open issues (${history.open_issues.length}):`)
    for (const issue of history.open_issues.slice(0, 5)) {
      const subj = issue.subject ? `"${issue.subject}"` : '(no subject)'
      lines.push(
        `  • ${issue.interaction_id} — ${subj} — status: ${issue.status}, ` +
          `${issue.days_open} day(s) open via ${issue.channel}.`,
      )
    }
    if (history.open_issues.length > 5) {
      lines.push(`  (+ ${history.open_issues.length - 5} more older issues)`)
    }
  }

  if (history.prior_distress_flags.length > 0) {
    lines.push(
      `- Prior vulnerability flags in the last 90 days: ${history.prior_distress_flags.length}. ` +
        'Treat the customer with extra care. Do not comment on distress directly in the draft.',
    )
  }

  lines.push('')
  lines.push(
    'Use this context to acknowledge recurring threads, avoid repeating ' +
      'information already supplied, and keep continuity with the prior ' +
      'conversation. Do not reveal internal tracking metadata verbatim.',
  )

  return lines.join('\n')
}
