/**
 * mentor-ledger.ts — Cross-Cutting Accountability Extraction
 *
 * The Mentor Ledger is a cross-cutting extraction layer that runs alongside
 * Layers 1-10 during journal interpretation. It captures everything the
 * mentor should track, return to, or hold the practitioner accountable for:
 *
 *   - Aims: "My aim is to become someone who acts from principle, not habit"
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
 * The six kinds of thing the mentor should track.
 *
 * Each kind has a different accountability profile:
 *   - aim:         Identity-level or life-level aspiration — the practitioner's
 *                   self-declared telos. "The person I want to become." Not tracked
 *                   for accountability like commitments; instead woven into the
 *                   mentor's framing of everything else. Aims are the WHY behind
 *                   commitments and intentions. Default priority: foundational.
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
  | 'aim'
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

  // ── Engagement & Sage-Path Weighting ──────────────────────────────────
  /** Layer 3 engagement gradient — how genuinely the practitioner engaged (0.0-1.0) */
  readonly engagement_intensity: number
  /**
   * Composite sage-path weight — how much this entry contributes to progress
   * toward the ideal Sage. Higher values = prioritised for resurfacing.
   * Computed from developmental_priority, engagement_intensity, entry kind,
   * and connections to persisting passions / weakest virtue domains.
   * Range: 0.0 – 2.0 (base weight 0.0–1.0 + bonus weights up to +1.0)
   */
  readonly sage_path_weight: number

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
return to later. Extract entries in the following six categories:

1. AIMS — Identity-level aspirations, life goals, or statements of purpose.
   Look for: "My aim is...", "What matters most to me is...", "The person I want to
   become...", "My purpose is...", "I'm working toward...", "What I care about most
   deeply is...", "The kind of life I want to live...", "I want to be the kind of
   person who..."
   These sit ABOVE commitments and intentions — they are the practitioner's
   self-declared telos. The mentor does not check accountability on aims; instead it
   weaves them into its framing of everything else. Always tag as foundational priority.

2. COMMITMENTS — Specific actions the practitioner says they will take.
   Look for: "I will...", "I need to...", "From now on I'll...", "Next time I should..."
   Include the target action and any timeframe mentioned.

3. REALISATIONS — Insights or observations the practitioner noted as significant.
   Look for: "I notice that...", "I realise...", "It struck me that...", "The real issue is..."
   These are not actions — they are moments of self-knowledge worth preserving.

4. SELF-POSED QUESTIONS — Questions the practitioner asked themselves but did not answer.
   Look for: "How do I...?", "What would it look like to...?", "Why do I always...?"
   Unanswered questions are growth edges — the mentor should return to them.

5. TENSIONS — Acknowledged gaps between what the practitioner knows and how they act.
   Look for: "I know X but I still...", "Even though I understand...", "I can see the
   contradiction but..."
   These are the practitioner naming their own declared-vs-observed value gaps.

6. INTENTIONS — Practice directions or aspirations softer than commitments.
   Look for: "I want to get better at...", "I aspire to...", "My goal is to eventually..."
   These are development trajectory markers — where the practitioner wants to go.

For each entry found, return:
- kind: aim | commitment | realisation | question | tension | intention
- original_text: the practitioner's own words (quote directly, keep brief)
- mentor_summary: one sentence distilling what this means for their development
- connected_passions: any passions from the 25-species taxonomy this relates to ([] if none)
- connected_virtues: which virtue domain(s) this exercises ([] if none)
- causal_stage: which stage of impression→assent→impulse→action this addresses (null if none)
- developmental_priority: foundational (core to their practice), active_edge (current growth
  work), consolidation (reinforcing existing understanding), or aspirational (future development)
  NOTE: Aims should almost always be tagged as "foundational".
- engagement_intensity: a float 0.0-1.0 rating how genuinely the practitioner was engaging
  when they wrote this. 1.0 = deep wrestling, vulnerability, breakthrough moment.
  0.5 = thoughtful but routine reflection. 0.1 = perfunctory or formulaic.
  Use writing length, specificity, emotional honesty, and presence of struggle as signals.

SPECIAL ATTENTION — WISDOM WORTH PRESERVING:
Pay particular attention to entries that show genuine engagement — moments where the
practitioner is wrestling with something real, not performing wisdom. Observations that
feel highly relevant in the moment are often forgotten within weeks. The mentor's job is
to ensure they are not lost. When in doubt about whether something is ledger-worthy, err
on the side of extraction — it is easier to prune than to recover a lost insight.

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
  /** Layer 3 engagement gradient — how genuinely the practitioner was engaging (0.0-1.0) */
  readonly engagement_intensity: number
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

      const engagement = typeof raw.engagement_intensity === 'number'
        ? Math.max(0, Math.min(1, raw.engagement_intensity))
        : 0.5 // default if not provided

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
        engagement_intensity: engagement,
        sage_path_weight: computeSagePathWeight(raw, engagement),
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
    aim: 0, commitment: 0, realisation: 0, question: 0, tension: 0, intention: 0,
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
      (e.kind === 'aim' || e.kind === 'commitment' || e.kind === 'intention') &&
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
  if (raw.kind === 'aim') {
    mechanisms.push('value_assessment')
    mechanisms.push('iterative_refinement')
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

/**
 * Compute the sage-path weight for a ledger entry.
 *
 * This determines how strongly the resurfacing engine should prioritise
 * this entry when selecting insights to deliver. Higher weight = more
 * relevant to the practitioner's path toward the ideal Sage.
 *
 * Factors:
 *   - developmental_priority: foundational (1.0) > active_edge (0.8) > consolidation (0.5) > aspirational (0.3)
 *   - engagement_intensity: multiplied into the base weight (high engagement = the insight came from genuine reflection)
 *   - kind_weight: aims (1.0), tensions (0.9), realisations (0.8), questions (0.7), commitments (0.6), intentions (0.5)
 *     — tensions and realisations are more diagnostic of sage-path progress than action items
 *
 * Additional bonuses (applied during resurfacing when profile is available):
 *   - Connected to a persisting passion from MentorProfile: +0.2
 *   - Connected to the weakest virtue domain: +0.2
 *
 * Range: 0.0 – 2.0 (base × engagement + bonuses)
 */
function computeSagePathWeight(
  raw: RawLedgerExtraction,
  engagement: number
): number {
  // Base weight from developmental priority
  const priorityWeights: Record<string, number> = {
    foundational: 1.0,
    active_edge: 0.8,
    consolidation: 0.5,
    aspirational: 0.3,
  }
  const baseWeight = priorityWeights[raw.developmental_priority] ?? 0.5

  // Kind weight — how diagnostic this type of entry is for sage-path progress
  const kindWeights: Record<LedgerEntryKind, number> = {
    aim: 1.0,
    tension: 0.9,
    realisation: 0.8,
    question: 0.7,
    commitment: 0.6,
    intention: 0.5,
  }
  const kindWeight = kindWeights[raw.kind] ?? 0.5

  // Composite: (base × kind) × engagement
  // This means a foundational tension with high engagement scores highest
  return (baseWeight * kindWeight) * Math.max(0.3, engagement)
}

// ============================================================================
// RESURFACING ENGINE — Selection logic for when/how to resurface insights
// ============================================================================

/**
 * Configuration for the resurfacing engine.
 * Controls how entries are selected for scheduled and contextual resurfacing.
 */
export type ResurfacingConfig = {
  /** Maximum times an entry can be surfaced per week via scheduled reflections */
  readonly max_surfaces_per_week: number
  /** Minimum days between resurfacing the same entry via scheduled delivery */
  readonly min_days_between_surfaces: number
  /** Entries must have at least this sage_path_weight to be eligible for scheduled reflections */
  readonly min_sage_path_weight: number
  /** How many entries to select per scheduled reflection */
  readonly entries_per_reflection: number
  /** Weight multiplier for entries that haven't been surfaced recently */
  readonly recency_decay_factor: number
}

export const DEFAULT_RESURFACING_CONFIG: ResurfacingConfig = {
  max_surfaces_per_week: 1,
  min_days_between_surfaces: 5,
  min_sage_path_weight: 0.15,
  entries_per_reflection: 2,
  recency_decay_factor: 0.1,
}

/**
 * The result of a resurfacing selection — what the reflection generator receives.
 */
export type ResurfacingSelection = {
  /** The primary entry to build the reflection around */
  readonly primary: LedgerEntry
  /** An optional companion entry (aim or realisation that gives context) */
  readonly companion: LedgerEntry | null
  /** Why these were selected (for audit trail) */
  readonly selection_reason: string
  /** The combined sage-path weight of the selection */
  readonly combined_weight: number
}

/**
 * Select entries for a scheduled reflection (Mode B — daily/weekly).
 *
 * Algorithm:
 *   1. Filter to active entries with sage_path_weight above threshold
 *   2. Exclude entries surfaced too recently (min_days_between_surfaces)
 *   3. Score remaining entries: sage_path_weight + recency bonus
 *   4. Add controlled randomness to prevent the same top entries repeating
 *   5. Select primary entry (highest adjusted score)
 *   6. Select companion: prefer an 'aim' that connects to the primary's
 *      passions or virtues. If no aim connects, use a realisation or tension.
 *
 * The goal: each reflection pairs something the practitioner is working through
 * (tension, question, realisation) with something they aspire to (aim, intention).
 * This connects daily practice to the larger telos.
 */
export function selectForScheduledReflection(
  ledger: MentorLedger,
  config: ResurfacingConfig = DEFAULT_RESURFACING_CONFIG,
  /** Optional: persisting passions from MentorProfile, for bonus weighting */
  persistingPassions: string[] = [],
  /** Optional: weakest virtue domain from MentorProfile, for bonus weighting */
  weakestVirtue: string | null = null
): ResurfacingSelection | null {
  const now = Date.now()
  const minDaysMs = config.min_days_between_surfaces * 24 * 60 * 60 * 1000

  // Step 1: Filter eligible entries
  const eligible = ledger.entries.filter(e => {
    if (e.status !== 'active' && e.status !== 'extracted') return false
    if (e.sage_path_weight < config.min_sage_path_weight) return false
    // Respect cooling period
    if (e.last_engaged_at && (now - new Date(e.last_engaged_at).getTime()) < minDaysMs) return false
    return true
  })

  if (eligible.length === 0) return null

  // Step 2: Score with recency bonus and profile bonuses
  const scored = eligible.map(entry => {
    let score = entry.sage_path_weight

    // Recency bonus: entries not surfaced recently get a boost
    const daysSinceLastSurface = entry.last_engaged_at
      ? (now - new Date(entry.last_engaged_at).getTime()) / (1000 * 60 * 60 * 24)
      : 30 // Never surfaced = treat as 30 days old
    score += Math.min(daysSinceLastSurface * config.recency_decay_factor, 0.5)

    // Profile bonus: connected to persisting passions
    if (persistingPassions.length > 0) {
      const passionOverlap = entry.connected_passions.some(p => persistingPassions.includes(p))
      if (passionOverlap) score += 0.2
    }

    // Profile bonus: connected to weakest virtue
    if (weakestVirtue && entry.connected_virtues.includes(weakestVirtue as any)) {
      score += 0.2
    }

    return { entry, score }
  })

  // Step 3: Add controlled randomness (±15%) to prevent repetitive top picks
  const randomised = scored.map(({ entry, score }) => ({
    entry,
    score: score * (0.85 + Math.random() * 0.30),
  }))

  // Sort by adjusted score descending
  randomised.sort((a, b) => b.score - a.score)

  // Step 4: Select primary (skip aims — they serve as companions)
  const primaryCandidate = randomised.find(
    r => r.entry.kind !== 'aim'
  )
  if (!primaryCandidate) return null

  const primary = primaryCandidate.entry

  // Step 5: Select companion — prefer an aim whose virtues/passions overlap
  let companion: LedgerEntry | null = null
  const aims = eligible.filter(e => e.kind === 'aim' && e.id !== primary.id)

  if (aims.length > 0) {
    // Try to find an aim that shares a virtue or passion with the primary
    const connectedAim = aims.find(a =>
      a.connected_virtues.some(v => primary.connected_virtues.includes(v)) ||
      a.connected_passions.some(p => primary.connected_passions.includes(p))
    )
    companion = connectedAim || aims[0]
  } else {
    // No aims available — use a realisation or intention as companion
    const fallback = randomised.find(
      r => r.entry.id !== primary.id &&
           (r.entry.kind === 'realisation' || r.entry.kind === 'intention')
    )
    companion = fallback?.entry || null
  }

  return {
    primary,
    companion,
    selection_reason: buildSelectionReason(primary, companion, primaryCandidate.score),
    combined_weight: primaryCandidate.score + (companion?.sage_path_weight ?? 0),
  }
}

/**
 * Select entries for contextual resurfacing (Mode A — during sessions).
 *
 * Given a current session context (what the practitioner is working on),
 * find ledger entries whose passions, virtues, or causal stage match.
 * Returns up to `limit` entries, sorted by sage_path_weight.
 */
export function selectForContextualResurfacing(
  ledger: MentorLedger,
  context: {
    /** Passions detected in the current session */
    activePassions?: string[]
    /** Virtue domains relevant to current session */
    relevantVirtues?: string[]
    /** Causal stage where current reasoning is operating */
    activeCausalStage?: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis' | null
    /** Free-text topic/keywords from the session */
    sessionTopic?: string
  },
  limit: number = 3
): LedgerEntry[] {
  const { activePassions = [], relevantVirtues = [], activeCausalStage } = context

  // Score each active entry by how well it matches the current context
  const scored = ledger.entries
    .filter(e => e.status === 'active' || e.status === 'extracted')
    .map(entry => {
      let contextScore = 0

      // Passion overlap
      const passionOverlap = entry.connected_passions.filter(
        p => activePassions.includes(p)
      ).length
      contextScore += passionOverlap * 0.3

      // Virtue overlap
      const virtueOverlap = entry.connected_virtues.filter(
        v => relevantVirtues.includes(v)
      ).length
      contextScore += virtueOverlap * 0.25

      // Causal stage match
      if (activeCausalStage && entry.causal_stage === activeCausalStage) {
        contextScore += 0.2
      }

      // Boost by sage_path_weight and engagement
      const totalScore = contextScore * (1 + entry.sage_path_weight) * (1 + entry.engagement_intensity)

      return { entry, score: totalScore }
    })
    .filter(({ score }) => score > 0) // Only include entries with some context match
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(s => s.entry)
}

/**
 * Build a human-readable reason for why entries were selected.
 */
function buildSelectionReason(
  primary: LedgerEntry,
  companion: LedgerEntry | null,
  score: number
): string {
  const parts: string[] = []
  parts.push(`Primary: "${primary.mentor_summary}" (${primary.kind}, weight: ${score.toFixed(2)})`)
  if (companion) {
    parts.push(`Companion: "${companion.mentor_summary}" (${companion.kind})`)
  }
  if (primary.times_surfaced === 0) {
    parts.push('First time surfacing this insight.')
  }
  return parts.join(' | ')
}

// ============================================================================
// RANKING — Sort and rank ledger entries by developmental importance
// ============================================================================

/**
 * Rank all entries in a MentorLedger by sage_path_weight descending.
 *
 * This is the primary prioritisation mechanism. Higher-ranked entries:
 *   1. Get surfaced more frequently by the resurfacing engine
 *   2. Appear first in Hub views and morning/evening prompts
 *   3. Are tracked more actively for follow-through (commitments)
 *
 * Optionally applies profile-aware bonuses when MentorProfile data is provided.
 *
 * Returns a new MentorLedger with entries sorted by rank and summary recomputed.
 */
export function rankLedgerEntries(
  ledger: MentorLedger,
  profileBonuses?: {
    /** Passions that persist across multiple sections — entries connected to these get +0.2 */
    persistingPassions?: string[]
    /** The virtue domain where the practitioner is weakest — entries exercising this get +0.2 */
    weakestVirtue?: 'phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne' | null
  }
): MentorLedger {
  const { persistingPassions = [], weakestVirtue = null } = profileBonuses ?? {}

  // Recompute sage_path_weight with profile bonuses
  const reweighted = ledger.entries.map(entry => {
    let weight = entry.sage_path_weight

    // Profile bonus: connected to persisting passions
    if (persistingPassions.length > 0) {
      const hasOverlap = entry.connected_passions.some(p =>
        persistingPassions.some(pp => pp.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(pp.toLowerCase()))
      )
      if (hasOverlap) weight += 0.2
    }

    // Profile bonus: connected to weakest virtue
    if (weakestVirtue && entry.connected_virtues.includes(weakestVirtue)) {
      weight += 0.2
    }

    return { ...entry, sage_path_weight: Math.round(weight * 1000) / 1000 }
  })

  // Sort by sage_path_weight descending
  reweighted.sort((a, b) => b.sage_path_weight - a.sage_path_weight)

  return {
    ...ledger,
    entries: reweighted,
    summary: computeLedgerSummary(reweighted),
    last_updated: new Date().toISOString(),
  }
}

/**
 * Get the top N entries from a ranked ledger, optionally filtered by kind.
 * Useful for Hub views that show "Top priorities" or "Active edge items".
 */
export function getTopRankedEntries(
  ledger: MentorLedger,
  limit: number = 10,
  filter?: {
    kinds?: LedgerEntryKind[]
    statuses?: LedgerEntryStatus[]
    priorities?: ('foundational' | 'active_edge' | 'consolidation' | 'aspirational')[]
    minWeight?: number
  }
): LedgerEntry[] {
  let entries = ledger.entries

  if (filter?.kinds) {
    entries = entries.filter(e => filter.kinds!.includes(e.kind))
  }
  if (filter?.statuses) {
    entries = entries.filter(e => filter.statuses!.includes(e.status))
  }
  if (filter?.priorities) {
    entries = entries.filter(e => filter.priorities!.includes(e.developmental_priority as any))
  }
  if (filter?.minWeight !== undefined) {
    entries = entries.filter(e => e.sage_path_weight >= filter.minWeight!)
  }

  // Already sorted by sage_path_weight from rankLedgerEntries
  return entries.slice(0, limit)
}

// ============================================================================
// ONE-OFF IMPORT ENRICHMENTS — Extract maximum value from the journal import
// ============================================================================

/**
 * Additional extraction targets for the one-off journal import.
 * These capture data that would be difficult or impossible to reconstruct
 * after the import, because they depend on the temporal arc, emotional
 * freshness, and longitudinal patterns of the 55-day journal.
 *
 * These run as a SECOND addendum alongside the Mentor Ledger extraction.
 */

/**
 * A self-authored maxim — the practitioner's own formulation of a principle
 * that could be quoted back to them as their own wisdom.
 * "Your words, not Seneca's."
 */
export type PractitionerMaxim = {
  readonly id: string
  readonly text: string
  /** The Stoic principle this echoes (if identifiable) */
  readonly stoic_echo: string | null
  /** Which virtue domain it addresses */
  readonly virtue_domain: ('phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne') | null
  /** Section and page where it appeared */
  readonly journal_section: string
  readonly page_or_entry: number | string | null
  /** Engagement intensity when they wrote it */
  readonly engagement_intensity: number
}

/**
 * An emotional anchor — a specific memory or experience described vividly
 * enough to serve as a reference point. The mentor can say:
 * "Remember when you described [X]? This is similar."
 */
export type EmotionalAnchor = {
  readonly id: string
  /** Brief description of the experience */
  readonly experience: string
  /** The emotion or state that was vivid */
  readonly emotion: string
  /** What insight came from it */
  readonly insight: string
  /** Passions involved */
  readonly connected_passions: string[]
  readonly journal_section: string
  readonly page_or_entry: number | string | null
}

/**
 * Growth evidence — a pair of entries showing evolution on the same topic.
 * Early vs. late in the journal, demonstrating actual developmental change.
 * These are proof that the practitioner can and does grow.
 */
export type GrowthEvidence = {
  readonly id: string
  /** The topic or theme where growth is visible */
  readonly theme: string
  /** The earlier entry (less developed reasoning) */
  readonly earlier: {
    readonly section: string
    readonly page_or_entry: number | string | null
    readonly summary: string
    readonly approximate_week: number
  }
  /** The later entry (more developed reasoning) */
  readonly later: {
    readonly section: string
    readonly page_or_entry: number | string | null
    readonly summary: string
    readonly approximate_week: number
  }
  /** What specifically changed */
  readonly growth_description: string
  /** Which virtue domain this growth demonstrates */
  readonly virtue_domain: ('phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne') | null
}

/**
 * Unfinished thread — a topic started but never resolved in the journal.
 * The mentor should return to these when the practitioner has more experience.
 */
export type UnfinishedThread = {
  readonly id: string
  /** The thread topic */
  readonly topic: string
  /** Where it first appeared */
  readonly first_mention_section: string
  readonly first_mention_page: number | string | null
  /** What was left unresolved */
  readonly unresolved_aspect: string
  /** Why the mentor should return to it */
  readonly return_rationale: string
  /** Connected passions or virtues */
  readonly connected_passions: string[]
  readonly connected_virtues: ('phronesis' | 'dikaiosyne' | 'andreia' | 'sophrosyne')[]
}

/**
 * The complete one-off import enrichment result.
 * Captured once during journal import, never re-run.
 */
export type ImportEnrichment = {
  readonly maxims: PractitionerMaxim[]
  readonly emotional_anchors: EmotionalAnchor[]
  readonly growth_evidence: GrowthEvidence[]
  readonly unfinished_threads: UnfinishedThread[]
  readonly import_timestamp: string
}

/**
 * Extraction prompt addendum for the one-off import enrichments.
 * Appended AFTER the Mentor Ledger addendum during journal interpretation.
 * Only runs during the initial import — not during subsequent re-interpretations.
 */
export const IMPORT_ENRICHMENT_ADDENDUM = `
ONE-OFF IMPORT ENRICHMENT — MAXIMUM VALUE EXTRACTION

This journal will only be imported once. The following extractions capture data
that cannot be reconstructed later — they depend on the temporal arc, emotional
freshness, and longitudinal patterns of the original writing.

Extract the following IN ADDITION to the Mentor Ledger entries above:

A. PRACTITIONER MAXIMS — Sentences where the practitioner formulated their own
   principle, rule, or insight in memorable language. These are quotable back to them.
   Look for: Declarative statements of belief, personal rules, reformulations of
   Stoic principles in the practitioner's own words, any sentence that sounds like
   the practitioner teaching themselves.
   Return: { text, stoic_echo (which Stoic principle this echoes, or null),
   virtue_domain (or null), engagement_intensity (0.0-1.0) }

B. EMOTIONAL ANCHORS — Specific experiences described with enough vividness that
   the mentor can reference them as touchstones. "Remember when you described [X]?"
   Look for: Detailed personal anecdotes, vivid descriptions of moments of clarity
   or struggle, turning points in the practitioner's thinking.
   Return: { experience (brief), emotion, insight, connected_passions }

C. GROWTH EVIDENCE — Places where the practitioner's reasoning visibly improved
   between an earlier and later section. Evidence of actual developmental change.
   Look for: Similar topics addressed differently at different points in the journal,
   initial reactive responses that later become more measured, early confusions that
   later show clarity.
   Return: { theme, earlier: { section, summary, approximate_week },
   later: { section, summary, approximate_week }, growth_description, virtue_domain }

D. UNFINISHED THREADS — Topics the practitioner started exploring but never resolved.
   The mentor should return to these when the practitioner has more experience.
   Look for: Questions left hanging, explorations that trailed off, contradictions
   acknowledged but not worked through, topics touched once and never revisited.
   Return: { topic, first_mention_section, unresolved_aspect, return_rationale,
   connected_passions, connected_virtues }

Return these as a separate "import_enrichment" object in the response alongside
the "ledger_entries" array. If nothing fits a category, return an empty array for it.
`.trim()
