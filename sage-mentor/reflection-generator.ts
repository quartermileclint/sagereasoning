/**
 * reflection-generator.ts — Stoic-Style Reflection Generator
 *
 * Generates personalised daily reflections that draw from the Mentor Ledger,
 * Import Enrichments, and MentorProfile to resurface insights the practitioner
 * identified as important but may have forgotten.
 *
 * Each reflection reads like a letter from Seneca — personal, grounded in the
 * practitioner's own words and experience, connecting daily practice to the
 * larger telos. Not a notification. Not a quote. A moment of principled reflection.
 *
 * Two delivery modes:
 *   A. Scheduled (daily morning / weekly mirror) — driven by the resurfacing engine's
 *      rotation algorithm. Selects entries by sage-path weight, engagement intensity,
 *      and recency, then generates a reflection that connects them.
 *   B. Contextual (during sessions via sage-consult) — surfaces relevant entries
 *      based on the current session's topic, passions, and virtues.
 *
 * Architecture:
 *   - Uses the resurfacing engine (selectForScheduledReflection, selectForContextualResurfacing)
 *     from mentor-ledger.ts for entry selection
 *   - Uses the LLM bridge (callAnthropic) for natural language generation
 *   - Feeds the Proactive Scheduler for scheduled delivery
 *   - Feeds sage-consult for contextual delivery
 *
 * Rules:
 *   R1:   Reflection is philosophical practice, not therapy
 *   R6d:  Diagnostic tone — growth-oriented, not punitive
 *   R7:   Journal citations preserved (section + page)
 *   R9:   No outcome promises — reflection is a practice, not a guarantee
 *   R17:  Intimate data (passion maps, trigger patterns) handled with care
 *   R19d: Mirror principle — the framework examines the practitioner's OWN reasoning
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-06
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-005, CR-009, CR-017]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { MentorProfile } from './persona'
import type {
  MentorLedger,
  LedgerEntry,
  ResurfacingConfig,
  ResurfacingSelection,
  ImportEnrichment,
  PractitionerMaxim,
  EmotionalAnchor,
} from './mentor-ledger'
import {
  selectForScheduledReflection,
  selectForContextualResurfacing,
  DEFAULT_RESURFACING_CONFIG,
} from './mentor-ledger'

// ============================================================================
// REFLECTION TYPES
// ============================================================================

/**
 * A generated reflection — the final output delivered to the practitioner.
 */
export type GeneratedReflection = {
  readonly id: string
  readonly generated_at: string
  readonly delivery_mode: 'scheduled_morning' | 'scheduled_weekly' | 'contextual'

  /** The reflection text itself — Seneca-style, personal, grounded */
  readonly reflection_text: string

  /** The entries this reflection draws from */
  readonly source_entries: {
    readonly primary: LedgerEntry
    readonly companion: LedgerEntry | null
  }

  /** Any maxim or emotional anchor woven in */
  readonly enrichments_used: {
    readonly maxim: PractitionerMaxim | null
    readonly anchor: EmotionalAnchor | null
  }

  /** The prompt that generated this reflection (for reproducibility) */
  readonly generation_prompt: string

  /** Token cost of generation */
  readonly token_cost: number | null
}

/**
 * Context for generating a contextual reflection (during a session).
 */
export type ContextualReflectionRequest = {
  /** What the practitioner is currently working on */
  readonly session_topic: string
  /** Passions detected in the current session */
  readonly active_passions: string[]
  /** Virtue domains relevant to the current session */
  readonly relevant_virtues: string[]
  /** The causal stage where reasoning is currently operating */
  readonly active_causal_stage: 'phantasia' | 'synkatathesis' | 'horme' | 'praxis' | null
}

// ============================================================================
// REFLECTION PROMPT BUILDERS
// ============================================================================

/**
 * Build the LLM prompt for generating a morning reflection.
 *
 * The reflection should:
 *   - Open with or reference the practitioner's own words
 *   - Connect the selected entry to the practitioner's stated aim (if companion is an aim)
 *   - Include one Stoic principle, named without jargon
 *   - Close with a single question or observation for the day ahead
 *   - Be 3-6 sentences. Not a lecture. A moment of reflection.
 *   - Sound like a letter from a wise friend, not a notification from an app
 */
export function buildMorningReflectionPrompt(
  selection: ResurfacingSelection,
  profile: MentorProfile | null,
  enrichment: ImportEnrichment | null
): string {
  const parts: string[] = []

  parts.push(`You are the Sage Mentor — a philosophical companion, not a therapist or coach.`)
  parts.push(`Generate a brief morning reflection (3-6 sentences) for the practitioner.`)
  parts.push(``)
  parts.push(`TONE: Like a letter from Seneca to Lucilius — warm, personal, grounded in the`)
  parts.push(`practitioner's own experience. Not preachy. Not clinical. Not a motivational poster.`)
  parts.push(``)
  parts.push(`PRIMARY ENTRY TO REFLECT ON:`)
  parts.push(`Kind: ${selection.primary.kind}`)
  parts.push(`The practitioner wrote: "${selection.primary.original_text}"`)
  parts.push(`Context: ${selection.primary.mentor_summary}`)
  parts.push(`Section: ${selection.primary.journal_section}`)
  if (selection.primary.connected_passions.length > 0) {
    parts.push(`Connected passions: ${selection.primary.connected_passions.join(', ')}`)
  }
  if (selection.primary.connected_virtues.length > 0) {
    parts.push(`Connected virtues: ${selection.primary.connected_virtues.join(', ')}`)
  }

  if (selection.companion) {
    parts.push(``)
    parts.push(`COMPANION ENTRY (weave this in as framing or aspiration):`)
    parts.push(`Kind: ${selection.companion.kind}`)
    parts.push(`The practitioner wrote: "${selection.companion.original_text}"`)
    parts.push(`Context: ${selection.companion.mentor_summary}`)
  }

  // Weave in a maxim if available and relevant
  const relevantMaxim = findRelevantMaxim(selection, enrichment)
  if (relevantMaxim) {
    parts.push(``)
    parts.push(`PRACTITIONER'S OWN MAXIM (quote back to them if it fits naturally):`)
    parts.push(`"${relevantMaxim.text}"`)
    if (relevantMaxim.stoic_echo) {
      parts.push(`(This echoes the Stoic principle: ${relevantMaxim.stoic_echo})`)
    }
  }

  // Weave in an emotional anchor if available
  const relevantAnchor = findRelevantAnchor(selection, enrichment)
  if (relevantAnchor) {
    parts.push(``)
    parts.push(`EMOTIONAL ANCHOR (reference if it adds depth — "remember when you described..."):`)
    parts.push(`Experience: ${relevantAnchor.experience}`)
    parts.push(`Emotion: ${relevantAnchor.emotion}`)
    parts.push(`Insight: ${relevantAnchor.insight}`)
  }

  if (profile) {
    parts.push(``)
    parts.push(`PRACTITIONER CONTEXT:`)
    parts.push(`Senecan grade: ${profile.senecan_grade}`)
    parts.push(`Direction of travel: ${profile.direction_of_travel}`)
    if (profile.passion_map.length > 0) {
      const topPassions = profile.passion_map.slice(0, 3).map(p => p.passion_id)
      parts.push(`Persisting passions: ${topPassions.join(', ')}`)
    }
  }

  parts.push(``)
  parts.push(`RULES:`)
  parts.push(`- Use the practitioner's own words where possible (quote from the entries above)`)
  parts.push(`- 3-6 sentences maximum. One core thought, not three.`)
  parts.push(`- End with a single question or observation for the day ahead`)
  parts.push(`- No bullet points, no headers, no formatting. Just prose.`)
  parts.push(`- Do NOT use Greek terms unless the practitioner used them in their journal`)
  parts.push(`- Do NOT say "remember" more than once`)
  parts.push(`- Sound like a wise friend who knows the practitioner's journal deeply`)
  parts.push(`- R1: This is philosophical reflection, not therapeutic intervention`)
  parts.push(`- R6d: Diagnostic tone — growth-oriented, never punitive`)

  return parts.join('\n')
}

/**
 * Build the LLM prompt for generating a contextual reflection during a session.
 *
 * Shorter than morning reflections — 1-3 sentences that connect what the
 * practitioner is doing NOW to what they wrote THEN.
 */
export function buildContextualReflectionPrompt(
  entries: LedgerEntry[],
  context: ContextualReflectionRequest,
  _profile: MentorProfile | null,
  enrichment: ImportEnrichment | null
): string {
  const parts: string[] = []

  parts.push(`You are the Sage Mentor. The practitioner is in a working session about:`)
  parts.push(`"${context.session_topic}"`)
  if (context.active_passions.length > 0) {
    parts.push(`Passions detected: ${context.active_passions.join(', ')}`)
  }
  if (context.relevant_virtues.length > 0) {
    parts.push(`Relevant virtue domains: ${context.relevant_virtues.join(', ')}`)
  }
  parts.push(``)
  parts.push(`The following journal entries are relevant to what they're doing right now:`)

  for (const entry of entries) {
    parts.push(``)
    parts.push(`[${entry.kind.toUpperCase()}] "${entry.original_text}"`)
    parts.push(`From: ${entry.journal_section} — ${entry.mentor_summary}`)
  }

  // Add maxim if relevant
  const topEntry = entries[0]
  if (topEntry && enrichment?.maxims) {
    const maxim = enrichment.maxims.find(m =>
      m.virtue_domain && topEntry.connected_virtues.includes(m.virtue_domain)
    )
    if (maxim) {
      parts.push(``)
      parts.push(`The practitioner once wrote this maxim: "${maxim.text}"`)
    }
  }

  parts.push(``)
  parts.push(`Generate a brief contextual reflection (1-3 sentences) that:`)
  parts.push(`- Connects what the practitioner wrote THEN to what they're facing NOW`)
  parts.push(`- Uses their own words where possible`)
  parts.push(`- Asks one question that applies their past insight to the present moment`)
  parts.push(`- Does NOT lecture or summarise the philosophy — assumes they know the framework`)
  parts.push(`- R1: Philosophical reflection, not therapy. R6d: Growth-oriented, not punitive.`)

  return parts.join('\n')
}

/**
 * Build the prompt for a weekly pattern mirror reflection.
 * Longer than morning reflections — 5-10 sentences reviewing the week's
 * relationship to the practitioner's ledger entries.
 */
export function buildWeeklyReflectionPrompt(
  weekData: {
    active: LedgerEntry[]
    recentlyCompleted: LedgerEntry[]
    persistentTensions: LedgerEntry[]
    openQuestions: LedgerEntry[]
  },
  _profile: MentorProfile | null,
  enrichment: ImportEnrichment | null
): string {
  const parts: string[] = []

  parts.push(`You are the Sage Mentor generating a weekly pattern mirror reflection.`)
  parts.push(`This is longer than a morning reflection — 5-10 sentences reviewing the week.`)
  parts.push(``)
  parts.push(`ACTIVE LEDGER ENTRIES (${weekData.active.length}):`)
  for (const e of weekData.active.slice(0, 5)) {
    parts.push(`- [${e.kind}] "${e.original_text}" (surfaced ${e.times_surfaced}x)`)
  }

  if (weekData.recentlyCompleted.length > 0) {
    parts.push(``)
    parts.push(`RECENTLY COMPLETED:`)
    for (const e of weekData.recentlyCompleted) {
      parts.push(`- [${e.kind}] "${e.original_text}" — COMPLETED`)
    }
  }

  if (weekData.persistentTensions.length > 0) {
    parts.push(``)
    parts.push(`PERSISTENT TENSIONS (appear across multiple journal sections):`)
    for (const e of weekData.persistentTensions) {
      parts.push(`- "${e.original_text}"`)
    }
  }

  if (weekData.openQuestions.length > 0) {
    parts.push(``)
    parts.push(`OPEN QUESTIONS (unanswered — waiting for more experience):`)
    for (const e of weekData.openQuestions) {
      parts.push(`- "${e.original_text}"`)
    }
  }

  // Include growth evidence if available
  if (enrichment?.growth_evidence && enrichment.growth_evidence.length > 0) {
    const evidence = enrichment.growth_evidence[0]
    parts.push(``)
    parts.push(`GROWTH EVIDENCE (from the journal import):`)
    parts.push(`On the theme of "${evidence.theme}":`)
    parts.push(`Earlier (week ~${evidence.earlier.approximate_week}): ${evidence.earlier.summary}`)
    parts.push(`Later (week ~${evidence.later.approximate_week}): ${evidence.later.summary}`)
    parts.push(`Change: ${evidence.growth_description}`)
  }

  parts.push(``)
  parts.push(`GENERATE A WEEKLY REFLECTION that:`)
  parts.push(`- Acknowledges what was completed (celebrate progress without praise)`)
  parts.push(`- Names the persistent tensions honestly ("this is still the work")`)
  parts.push(`- Connects an open question to something the practitioner has more experience with now`)
  parts.push(`- References growth evidence if relevant ("you've done this before — remember...")`)
  parts.push(`- Ends with one question or observation for the week ahead`)
  parts.push(`- 5-10 sentences. Prose, not bullet points. Seneca's tone, not a coach's.`)
  parts.push(`- R1: Philosophical. R6d: Diagnostic, not punitive. R19d: Mirror principle.`)

  return parts.join('\n')
}

// ============================================================================
// ENRICHMENT HELPERS — Find relevant maxims and anchors for reflections
// ============================================================================

/**
 * Find a maxim that's relevant to the selected ledger entries.
 * Matches on shared virtue domain or passion.
 */
function findRelevantMaxim(
  selection: ResurfacingSelection,
  enrichment: ImportEnrichment | null
): PractitionerMaxim | null {
  if (!enrichment?.maxims || enrichment.maxims.length === 0) return null

  const primaryVirtues = selection.primary.connected_virtues
  const _primaryPassions = selection.primary.connected_passions

  // Try virtue match first
  const virtueMatch = enrichment.maxims.find(
    m => m.virtue_domain && primaryVirtues.includes(m.virtue_domain)
  )
  if (virtueMatch) return virtueMatch

  // Try any high-engagement maxim
  const highEngagement = enrichment.maxims.filter(m => m.engagement_intensity > 0.7)
  if (highEngagement.length > 0) {
    return highEngagement[Math.floor(Math.random() * highEngagement.length)]
  }

  return null
}

/**
 * Find an emotional anchor relevant to the selected entries.
 * Matches on shared passions.
 */
function findRelevantAnchor(
  selection: ResurfacingSelection,
  enrichment: ImportEnrichment | null
): EmotionalAnchor | null {
  if (!enrichment?.emotional_anchors || enrichment.emotional_anchors.length === 0) return null

  const primaryPassions = selection.primary.connected_passions

  const match = enrichment.emotional_anchors.find(
    a => a.connected_passions.some(p => primaryPassions.includes(p))
  )

  return match || null
}

// ============================================================================
// REFLECTION GENERATION — Orchestrators
// ============================================================================

/**
 * Generate a morning reflection.
 *
 * Orchestrates the full pipeline: select entries → find enrichments →
 * build prompt → call LLM → format result.
 *
 * Returns null if no eligible entries exist (nothing to reflect on).
 */
export function prepareMorningReflection(
  ledger: MentorLedger,
  profile: MentorProfile | null,
  enrichment: ImportEnrichment | null,
  config: ResurfacingConfig = DEFAULT_RESURFACING_CONFIG,
  persistingPassions: string[] = [],
  weakestVirtue: string | null = null
): {
  selection: ResurfacingSelection
  prompt: string
  entriesToMarkSurfaced: LedgerEntry[]
} | null {
  const selection = selectForScheduledReflection(
    ledger, config, persistingPassions, weakestVirtue
  )
  if (!selection) return null

  const prompt = buildMorningReflectionPrompt(selection, profile, enrichment)
  const entriesToMark = [selection.primary]
  if (selection.companion) entriesToMark.push(selection.companion)

  return { selection, prompt, entriesToMarkSurfaced: entriesToMark }
}

/**
 * Generate a contextual reflection for a live session.
 *
 * Returns null if no relevant entries exist for the current context.
 */
export function prepareContextualReflection(
  ledger: MentorLedger,
  context: ContextualReflectionRequest,
  profile: MentorProfile | null,
  enrichment: ImportEnrichment | null
): {
  entries: LedgerEntry[]
  prompt: string
  entriesToMarkSurfaced: LedgerEntry[]
} | null {
  const entries = selectForContextualResurfacing(ledger, {
    activePassions: context.active_passions,
    relevantVirtues: context.relevant_virtues,
    activeCausalStage: context.active_causal_stage,
    sessionTopic: context.session_topic,
  })

  if (entries.length === 0) return null

  const prompt = buildContextualReflectionPrompt(entries, context, profile, enrichment)

  return { entries, prompt, entriesToMarkSurfaced: entries }
}
