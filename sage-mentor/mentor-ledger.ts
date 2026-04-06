/**
 * mentor-ledger.ts — Cross-Cutting Accountability Extraction
 *
 * The Mentor Ledger is a cross-cutting extraction layer that runs alongside
 * Layers 1-10 during journal interpretation. It captures everything the
 * mentor should track, return to, or hold the practitioner accountable for:
 *
 *   - Commitments: "I will apply the prohairesis filter before pricing meetings"
 *   - Realisations: "I notice my urgency isn't strategic — it's fear-driven"
 *   - Self-posed questions: "How do I tell genuine urgency from passion-driven reactivity?"
 *   - Unresolved tensions: "I know reputation is an indifferent but I can't stop caring"
 *   - Practice intentions: "I need to pause before reacting to competitive pressure"
 *
 * Architecture:
 *   This module does NOT define a new numbered layer. It is a cross-cutting
 *   concern that runs during every section's interpretation pass, producing
 *   ledger entries that are orthogonal to the 10-layer taxonomy.
 *
 *   The ledger feeds three consumers:
 *     1. The Private Mentor Hub — displays a "Ledger" view with active items
 *     2. The Proactive Scheduler — morning check-in references open commitments;
 *        evening reflection asks about follow-through
 *     3. The Pattern Engine — tracks commitment completion rates over time,
 *        detects patterns in what gets deferred or abandoned
 *
 *   Lifecycle of a ledger entry:
 *     EXTRACTED → ACTIVE → { COMPLETED | DEFERRED | ABANDONED | SUPERSEDED }
 *
 *   The mentor manages the lifecycle through conversation. The practitioner
 *   can mark items directly, or the mentor can propose status changes based
 *   on observed behaviour via the session bridge and pattern engine.
 *
 * Extraction approach:
 *   The LLM extraction prompt for each journal section includes a
 *   CROSS-CUTTING EXTRACTION addendum that asks the model to identify
 *   ledger-worthy content in parallel with the primary layer extraction.
 *   This avoids a separate pass over the journal text and keeps token
 *   usage efficient.
 *
 * Rules:
 *   R1:  Accountability is philosophical practice, not therapeutic obligation
 *   R6d: Tracking is diagnostic (growth awareness), not punitive
 *   R7:  Ledger entries trace to journal citations
 *   R9:  No outcome promises — tracking commitments is a practice, not a contract
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-05
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-005, CR-009]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { KatorthomaProximityLevel } from '../trust-layer/types/accreditation'

// ============================================================================
// LEDGER ENTRY TYPES
// ============================================================================

/**
 * The five kinds of thing the mentor should track.
 *
 * Each kind has a different accountability profile:
 *   - commitment:  Has a target action + timeframe. Mentor checks follow-through.
 *   - realisation:  No action required — but the mentor surfaces it when relevant
 *                   context recurs. "You noticed this before. Has it changed?"
 *   - question:     Unanswered question the practitioner posed to themselves.
 *                   Mentor returns to it when the practitioner has more experience.
 *   - tension:      Acknowledged gap between knowledge and disposition (hexis).
 *                   Closely related to Layer 4 contradictions but more personal —
 *                   the practitioner named it themselves.
 *   - intention:    Softer than a commitment — a practice direction or aspiration.
 *                   "I need to get better at pausing." Mentor tracks progress over time.
 */
export type LedgerEntryKind =
  | 'commitment'
  | 'realisation'
  | 'question'
  | 'tension'
  | 'intention'

/**
 * Lifecycle status of a ledger entry.
 *
 * EXTRACTED:   Just extracted from the journal — not yet reviewed by practitioner.
 * ACTIVE:      Confirmed by practitioner as something the mentor should track.
 * COMPLETED:   The commitment was fulfilled, the question answered, the tension resolved.
 * DEFERRED:    Postponed deliberately — the practitioner chose to delay, not abandon.
 * ABANDONED:   The practitioner recognised this is no longer relevant or important.
 * SUPERSEDED:  Replaced by a more developed understanding or a new commitment.
 */
export type LedgerEntryStatus =
  | 'extracted'
  | 'active'
  | 'completed'
  | 'deferred'
  | 'abandoned'
  | 'superseded'

/**
 * A single entry in the Mentor Ledger.
 *
 * Each entry is something the mentor should remember, track, or hold the
 * practitioner accountable for. Entries are extracted from the journal and
 * enriched with Stoic Brain connections to make them actionable within
 * the mentor relationship.
 */
export type LedgerEntry = {
  readonly id: string
  readonly kind: LedgerEntryKind
  readonly status: LedgerEntryStatus

  /** The practitioner's own words, extracted from the journal */
  readonly original_text: string

  /** The mentor's distillation — what this entry means for the practice */
  readonly mentor_summary: string

  // ── Journal Citation ──────────────────────────────────────────────────
  /** Which journal section this was extracted from */
  readonly journal_section: string
  /** Page or entry reference for citation */
  readonly page_or_entry: number | string | null
  /** The broader context in which this appeared */
  readonly surrounding_context: string

  // ── Stoic Brain Connections ───────────────────────────────────────────
  /** Which passions this entry relates to (if any) */
  readonly connected_passions: string[]
  /** Which virtue domain this entry exercises (if any) */
  readonly connected_virtues: ('phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne')[]
  /** Which causal stage this entry addresses (if any) */
  readonly causal_stage: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis' | null
  /** Brain mechanisms relevant to this entry (for R12 compliance) */
  readonly mechanisms: string[]

  // ── Accountability Metadata ───────────────────────────────────────────
  /** When was this extracted */
  readonly extracted_at: string
  /** When did the practitioner last engage with this entry */
  readonly last_engaged_at: string | null
  /** How many times has the mentor surfaced this entry */
  readonly times_surfaced: number
  /** Target timeframe (for commitments and intentions) */
  readonly target_timeframe: string | null
  /** Priority: how important is this for the practitioner's development */
  readonly developmental_priority: 'foundational' | 'active_edge' | 'consolidation' | 'aspirational'

  // ── Lifecycle Tracking ────────────────────────────────────────────────
  /** Status change history */
  readonly status_history: LedgerStatusChange[]
  /** If superseded, what replaced it */
  readonly superseded_by: string | null
}

/**
 * A record of a status change on a ledger entry.
 * Captures who initiated the change and why.
 */
export type LedgerStatusChange = {
  readonly from: LedgerEntryStatus
  readonly to: LedgerEntryStatus
  readonly changed_at: string
  readonly changed_by: 'practitioner' | 'mentor'
  readonly reason: string
}

// ============================================================================
// THE COMPLETE LEDGER
// ============================================================================

/**
 * The full Mentor Ledger — all entries extracted from the journal,
 * plus aggregated accountability metrics.
 */
export type MentorLedger = {
  readonly user_id: string
  readonly journal_name: string
  readonly entries: LedgerEntry[]

  /** Summary statistics for the Hub dashboard */
  readonly summary: LedgerSummary

  /** When this ledger was last updated */
  readonly last_updated: string
}

/**
 * Aggregated view of the ledger for the Hub dashboard.
 */
export type LedgerSummary = {
  readonly total_entries: number
  readonly by_kind: Record<LedgerEntryKind, number>
  readonly by_status: Record<LedgerEntryStatus, number>
  readonly by_priority: Record<string, number>

  /** The entries the mentor should surface most urgently */
  readonly top_active: LedgerEntry[]

  /** Commitments approaching or past their target timeframe */
  readonly overdue_commitments: LedgerEntry[]

  /** Questions that have been open longest without engagement */
  readonly oldest_open_questions: LedgerEntry[]

  /** Tensions that appear in multiple journal sections (persistent gaps) */
  readonly persistent_tensions: LedgerEntry[]

  /** Completion rate for commitments (completed / (completed + abandoned)) */
  readonly commitment_completion_rate: number | null
}

// ============================================================================
// EXTRACTION PROMPT ADDENDUM
// ============================================================================

/**
 * The cross-cutting extraction addendum appended to every section's
 * extraction prompt during journal interpretation.
 *
 * This runs in parallel with the primary layer extraction — the LLM
 * receives the section text plus both the layer-specific guidance AND
 * this addendum, and returns both extractions in a single response.
 *
 * Token cost: ~150 tokens per section (addendum) + ~50 tokens per
 * extracted entry. For a 12-section journal, total overhead is ~2,400
 * tokens — less than 1% of the full interpretation cost.
 */
export const LEDGER_EXTRACTION_ADDENDUM = `
CROSS-CUTTING EXTRACTION — MENTOR LEDGER

In addition to the layer-specific extraction above, scan this section for
anything the practitioner wrote that the mentor should remember, track, or
return to later. Extract entries in the following five categories:

1. COMMITMENTS — Specific actions the practitioner says they will take.
   Look for: "I will...", "I need to...", "From now on I'll...", "Next time I should..."
   Include the target action and any timeframe mentioned.

2. REALISATIONS — Insights or observations the practitioner noted as significant.
   Look for: "I notice that...", "I realise...", "It struck me that...", "The real issue is..."
   These are not actions — they are moments of self-knowledge worth preserving.

3. SELF-POSED QUESTIONS — Questions the practitioner asked themselves but did not answer.
   Look for: "How do I...?", "What would it look like to...?", "Why do I always...?"
   Unanswered questions are growth edges — the mentor should return to them.

4. TENSIONS — Acknowledged gaps between what the practitioner knows and how they act.
   Look for: "I know X but I still...", "Even though I understand...", "I can see the
   contradiction but..."
   These are the practitioner naming their own declared-vs-observed value gaps.

5. INTENTIONS — Practice directions or aspirations softer than commitments.
   Look for: "I want to get better at...", "I aspire to...", "My goal is to eventually..."
   These are development trajectory markers — where the practitioner wants to go.

For each entry found, return:
- kind: commitment | realisation | question | tension | intention
- original_text: the practitioner's own words (quote directly, keep brief)
- mentor_summary: one sentence distilling what this means for their development
- connected_passions: any passions from the 25-species taxonomy this relates to ([] if none)
- connected_virtues: which virtue domain(s) this exercises ([] if none)
- causal_stage: which stage of impression→assent→impulse→action this addresses (null if none)
- developmental_priority: foundational (core to their practice), active_edge (current growth
  work), consolidation (reinforcing existing understanding), or aspirational (future development)

If no ledger-worthy content exists in this section, return an empty array.
Do NOT force extraction — quality over quantity. Only extract entries where the
practitioner clearly expressed something they consider important.
`.trim()

/**
 * Raw extraction result from a single section.
 * This is what the LLM returns alongside the layer extraction.
 */
export type RawLedgerExtraction = {
  readonly kind: LedgerEntryKind
  readonly original_text: string
  readonly mentor_summary: string
  readonly connected_passions: string[]
  readonly connected_virtues: ('phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne')[]
  readonly causal_stage: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis' | null
  readonly developmental_priority: 'foundational' | 'active_edge' | 'consolidation' | 'aspirational'
}

// ============================================================================
// AGGREGATION — Build the full ledger from per-section extractions
// ============================================================================

/**
 * Aggregate raw ledger extractions from all journal sections into a
 * complete MentorLedger.
 *
 * Handles:
 *   - ID generation for each entry
 *   - Deduplication (same commitment expressed in multiple sections)
 *   - Section citation attachment
 *   - Summary computation
 *   - Initial status assignment (all entries start as 'extracted')
 */
export function aggregateLedgerExtractions(
  userId: string,
  journalName: string,
  sectionExtractions: {
    section: string
    pageOrEntry: number | string | null
    surroundingContext: string
    entries: RawLedgerExtraction[]
  }[]
): MentorLedger {
  const allEntries: LedgerEntry[] = []
  const seenTexts = new Set<string>()
  let entryIndex = 0

  const now = new Date().toISOString()

  for (const section of sectionExtractions) {
    for (const raw of section.entries) {
      // Basic deduplication: skip if we've seen very similar original_text
      const normalised = raw.original_text.toLowerCase().trim()
      if (seenTexts.has(normalised)) continue
      seenTexts.add(normalised)

      entryIndex++

      const entry: LedgerEntry = {
        id: `ledger_${userId}_${String(entryIndex).padStart(3, '0')}`,
        kind: raw.kind,
        status: 'extracted',
        original_text: raw.original_text,
        mentor_summary: raw.mentor_summary,
        journal_section: section.section,
        page_or_entry: section.pageOrEntry,
        surrounding_context: section.surroundingContext,
        connected_passions: raw.connected_passions,
        connected_virtues: raw.connected_virtues,
        causal_stage: raw.causal_stage,
        mechanisms: deriveMechanisms(raw),
        extracted_at: now,
        last_engaged_at: null,
        times_surfaced: 0,
        target_timeframe: null, // Populated during practitioner review
        developmental_priority: raw.developmental_priority,
        status_history: [{
          from: 'extracted',
          to: 'extracted',
          changed_at: now,
          changed_by: 'mentor',
          reason: 'Initial extraction from journal interpretation',
        }],
        superseded_by: null,
      }

      allEntries.push(entry)
    }
  }

  return {
    user_id: userId,
    journal_name: journalName,
    entries: allEntries,
    summary: computeLedgerSummary(allEntries),
    last_updated: now,
  }
}

// ============================================================================
// SUMMARY COMPUTATION
// ============================================================================

/**
 * Compute the aggregated summary for the Hub dashboard.
 */
function computeLedgerSummary(entries: LedgerEntry[]): LedgerSummary {
  const byKind: Record<LedgerEntryKind, number> = {
    commitment: 0, realisation: 0, question: 0, tension: 0, intention: 0,
  }
  const byStatus: Record<LedgerEntryStatus, number> = {
    extracted: 0, active: 0, completed: 0, deferred: 0, abandoned: 0, superseded: 0,
  }
  const byPriority: Record<string, number> = {
    foundational: 0, active_edge: 0, consolidation: 0, aspirational: 0,
  }

  for (const entry of entries) {
    byKind[entry.kind]++
    byStatus[entry.status]++
    byPriority[entry.developmental_priority]++
  }

  // Top active: active entries sorted by priority (foundational first)
  const priorityOrder = ['foundational', 'active_edge', 'consolidation', 'aspirational']
  const topActive = entries
    .filter(e => e.status === 'active' || e.status === 'extracted')
    .sort((a, b) => priorityOrder.indexOf(a.developmental_priority) - priorityOrder.indexOf(b.developmental_priority))
    .slice(0, 5)

  // Overdue commitments: commitments with a target_timeframe that has passed
  const now = Date.now()
  const overdueCommitments = entries
    .filter(e =>
      e.kind === 'commitment' &&
      (e.status === 'active' || e.status === 'extracted') &&
      e.target_timeframe !== null &&
      new Date(e.target_timeframe).getTime() < now
    )

  // Oldest open questions: questions that have been open longest
  const oldestOpenQuestions = entries
    .filter(e => e.kind === 'question' && (e.status === 'active' || e.status === 'extracted'))
    .sort((a, b) => new Date(a.extracted_at).getTime() - new Date(b.extracted_at).getTime())
    .slice(0, 3)

  // Persistent tensions: tensions that appear across multiple sections
  const tensionSections = new Map<string, string[]>()
  for (const entry of entries.filter(e => e.kind === 'tension')) {
    const key = entry.mentor_summary.toLowerCase()
    const sections = tensionSections.get(key) || []
    sections.push(entry.journal_section)
    tensionSections.set(key, sections)
  }
  const persistentTensions = entries
    .filter(e => {
      if (e.kind !== 'tension') return false
      const sections = tensionSections.get(e.mentor_summary.toLowerCase())
      return sections !== undefined && sections.length > 1
    })

  // Commitment completion rate
  const completedCommitments = entries.filter(
    e => e.kind === 'commitment' && e.status === 'completed'
  ).length
  const closedCommitments = entries.filter(
    e => e.kind === 'commitment' && (e.status === 'completed' || e.status === 'abandoned')
  ).length
  const completionRate = closedCommitments > 0
    ? completedCommitments / closedCommitments
    : null

  return {
    total_entries: entries.length,
    by_kind: byKind,
    by_status: byStatus,
    by_priority: byPriority,
    top_active: topActive,
    overdue_commitments: overdueCommitments,
    oldest_open_questions: oldestOpenQuestions,
    persistent_tensions: persistentTensions,
    commitment_completion_rate: completionRate,
  }
}

// ============================================================================
// STATUS MANAGEMENT — Lifecycle transitions
// ============================================================================

/**
 * Transition a ledger entry to a new status.
 *
 * Returns a new entry (immutable update) with the updated status and
 * a new history record. Returns null if the transition is invalid.
 *
 * Valid transitions:
 *   extracted → active (practitioner confirms)
 *   extracted → abandoned (practitioner dismisses)
 *   active → completed (commitment fulfilled, question answered, tension resolved)
 *   active → deferred (postponed deliberately)
 *   active → abandoned (no longer relevant)
 *   active → superseded (replaced by new understanding)
 *   deferred → active (practitioner re-engages)
 *   deferred → abandoned (decide not to return)
 */
export function transitionLedgerEntry(
  entry: LedgerEntry,
  newStatus: LedgerEntryStatus,
  changedBy: 'practitioner' | 'mentor',
  reason: string
): LedgerEntry | null {
  const validTransitions: Record<LedgerEntryStatus, LedgerEntryStatus[]> = {
    extracted: ['active', 'abandoned'],
    active: ['completed', 'deferred', 'abandoned', 'superseded'],
    deferred: ['active', 'abandoned'],
    completed: [],
    abandoned: [],
    superseded: [],
  }

  if (!validTransitions[entry.status]?.includes(newStatus)) {
    return null
  }

  const change: LedgerStatusChange = {
    from: entry.status,
    to: newStatus,
    changed_at: new Date().toISOString(),
    changed_by: changedBy,
    reason,
  }

  return {
    ...entry,
    status: newStatus,
    last_engaged_at: new Date().toISOString(),
    status_history: [...entry.status_history, change],
  }
}

/**
 * Record that the mentor surfaced a ledger entry in conversation.
 * Updates the engagement tracking without changing status.
 */
export function recordLedgerSurfacing(entry: LedgerEntry): LedgerEntry {
  return {
    ...entry,
    last_engaged_at: new Date().toISOString(),
    times_surfaced: entry.times_surfaced + 1,
  }
}

// ============================================================================
// PROACTIVE INTEGRATION — What the scheduler needs
// ============================================================================

/**
 * Select ledger entries relevant to a morning check-in.
 *
 * Returns commitments and intentions that are active, ordered by
 * developmental priority. The morning prompt can reference these:
 * "You committed to X. Today might present an opportunity to practice."
 */
export function selectForMorningCheckIn(
  ledger: MentorLedger,
  limit: number = 3
): LedgerEntry[] {
  const priorityOrder = ['foundational', 'active_edge', 'consolidation', 'aspirational']
  return ledger.entries
    .filter(e =>
      (e.kind === 'commitment' || e.kind === 'intention') &&
      e.status === 'active'
    )
    .sort((a, b) =>
      priorityOrder.indexOf(a.developmental_priority) -
      priorityOrder.indexOf(b.developmental_priority)
    )
    .slice(0, limit)
}

/**
 * Select ledger entries relevant to an evening reflection.
 *
 * Returns the same active commitments (for follow-through check) plus
 * any realisations or tensions that might have been tested today.
 */
export function selectForEveningReflection(
  ledger: MentorLedger,
  limit: number = 4
): LedgerEntry[] {
  const priorityOrder = ['foundational', 'active_edge', 'consolidation', 'aspirational']
  return ledger.entries
    .filter(e =>
      e.status === 'active' &&
      (e.kind === 'commitment' || e.kind === 'tension' || e.kind === 'realisation')
    )
    .sort((a, b) =>
      priorityOrder.indexOf(a.developmental_priority) -
      priorityOrder.indexOf(b.developmental_priority)
    )
    .slice(0, limit)
}

/**
 * Select ledger entries relevant to the weekly pattern mirror.
 *
 * Returns all active items plus recently completed ones (for progress
 * narrative) and persistent tensions (for trajectory analysis).
 */
export function selectForWeeklyMirror(
  ledger: MentorLedger,
  weekEndingDate: string
): {
  active: LedgerEntry[]
  recentlyCompleted: LedgerEntry[]
  persistentTensions: LedgerEntry[]
  openQuestions: LedgerEntry[]
} {
  const weekStart = new Date(weekEndingDate)
  weekStart.setDate(weekStart.getDate() - 7)
  const weekStartMs = weekStart.getTime()

  return {
    active: ledger.entries.filter(e => e.status === 'active'),
    recentlyCompleted: ledger.entries.filter(e =>
      e.status === 'completed' &&
      e.last_engaged_at !== null &&
      new Date(e.last_engaged_at).getTime() >= weekStartMs
    ),
    persistentTensions: ledger.summary.persistent_tensions,
    openQuestions: ledger.entries.filter(e =>
      e.kind === 'question' && e.status === 'active'
    ),
  }
}

// ============================================================================
// PATTERN ENGINE INTEGRATION — Accountability patterns
// ============================================================================

/**
 * Data structure for the pattern engine to analyse ledger trends.
 *
 * Tracks: commitment completion velocity, deferral patterns,
 * which kinds of entries persist longest, which passions appear
 * in the most abandoned entries (resistance patterns).
 */
export type LedgerPatternData = {
  /** Average days from extraction to completion (for completed commitments) */
  readonly avg_completion_days: number | null
  /** Kinds that are most often deferred or abandoned */
  readonly resistance_kinds: LedgerEntryKind[]
  /** Passions most associated with abandoned entries */
  readonly resistance_passions: string[]
  /** Entries that have been surfaced 3+ times without engagement */
  readonly unengaged_entries: LedgerEntry[]
  /** Week-over-week change in active entry count */
  readonly active_count_trend: 'growing' | 'stable' | 'shrinking'
}

/**
 * Compute pattern data from the ledger for the pattern engine.
 */
export function computeLedgerPatterns(ledger: MentorLedger): LedgerPatternData {
  const entries = ledger.entries

  // Average completion days
  const completedCommitments = entries.filter(
    e => e.kind === 'commitment' && e.status === 'completed' && e.last_engaged_at
  )
  const avgCompletionDays = completedCommitments.length > 0
    ? completedCommitments.reduce((sum, e) => {
        const start = new Date(e.extracted_at).getTime()
        const end = new Date(e.last_engaged_at!).getTime()
        return sum + (end - start) / (1000 * 60 * 60 * 24)
      }, 0) / completedCommitments.length
    : null

  // Resistance kinds
  const abandonedByKind = new Map<LedgerEntryKind, number>()
  for (const e of entries.filter(e => e.status === 'abandoned' || e.status === 'deferred')) {
    abandonedByKind.set(e.kind, (abandonedByKind.get(e.kind) || 0) + 1)
  }
  const resistanceKinds = Array.from(abandonedByKind.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= 2)
    .map(([kind]) => kind)

  // Resistance passions
  const abandonedPassions = new Map<string, number>()
  for (const e of entries.filter(e => e.status === 'abandoned')) {
    for (const p of e.connected_passions) {
      abandonedPassions.set(p, (abandonedPassions.get(p) || 0) + 1)
    }
  }
  const resistancePassions = Array.from(abandonedPassions.entries())
    .sort((a, b) => b[1] - a[1])
    .filter(([, count]) => count >= 2)
    .map(([passion]) => passion)

  // Unengaged entries (surfaced 3+ times, never engaged)
  const unengagedEntries = entries.filter(
    e => e.times_surfaced >= 3 && e.last_engaged_at === null
  )

  return {
    avg_completion_days: avgCompletionDays,
    resistance_kinds: resistanceKinds,
    resistance_passions: resistancePassions,
    unengaged_entries: unengagedEntries,
    active_count_trend: 'stable', // Requires historical data — placeholder
  }
}

// ============================================================================
// UTILITY
// ============================================================================

/**
 * Derive brain mechanisms from a raw extraction (for R12 compliance).
 * Ensures at least 2 mechanisms per entry.
 */
function deriveMechanisms(raw: RawLedgerExtraction): string[] {
  const mechanisms: string[] = []

  if (raw.connected_passions.length > 0) {
    mechanisms.push('passion_diagnosis')
  }
  if (raw.causal_stage) {
    mechanisms.push('control_filter')
  }
  if (raw.connected_virtues.length > 0) {
    mechanisms.push('value_assessment')
  }
  if (raw.kind === 'commitment' || raw.kind === 'intention') {
    mechanisms.push('social_obligation')
  }
  if (raw.kind === 'tension') {
    mechanisms.push('iterative_refinement')
  }
  if (raw.kind === 'question') {
    mechanisms.push('iterative_refinement')
  }

  // Ensure R12 compliance: at least 2 mechanisms
  if (mechanisms.length < 2) {
    if (!mechanisms.includes('control_filter')) {
      mechanisms.push('control_filter')
    }
    if (mechanisms.length < 2 && !mechanisms.includes('value_assessment')) {
      mechanisms.push('value_assessment')
    }
  }

  return mechanisms
}
