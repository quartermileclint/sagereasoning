/**
 * pattern-engine.ts — Pattern Recognition Engine (Priority 6)
 *
 * Temporal pattern detection that powers the weekly pattern mirror and
 * the ring's passion early-warning system. Extends the basic passion
 * matching in ring-wrapper.ts with temporal correlations:
 *   - Time-of-day patterns (e.g., worse reasoning in the evening)
 *   - Day-of-week patterns (e.g., Monday stress, Friday appetite)
 *   - Context-type patterns (e.g., financial decisions trigger fear)
 *   - Journal-era regression detection (was this passion beaten, back now?)
 *
 * Architecture:
 *   This engine runs as a BATCH, not per-call. The ring-wrapper's
 *   checkPassionPatterns() handles real-time detection. This engine
 *   runs every Nth interaction (default: 5) or daily, pre-computes
 *   pattern summaries, and stores them in the profile for the ring
 *   to read cheaply.
 *
 *   Pattern recognition is deterministic (no LLM calls for aggregation).
 *   Only novel pattern combinations escalate to Sonnet for narrative
 *   interpretation.
 *
 * Token efficiency:
 *   - Batch aggregation: Haiku or zero LLM (deterministic)
 *   - Novel analysis: Sonnet (only when new patterns detected)
 *   - Ring reads pre-computed patterns: zero tokens
 *
 * Brain mechanisms:
 *   - passions.json: 25-species taxonomy for passion classification
 *   - psychology.json: Causal sequence for failure-point patterns
 *   - progress.json: Disposition stability dimension, direction of travel
 *   - scoring.json: Rolling window aggregation logic
 *
 * Rules:
 *   R6c: Qualitative patterns only — no numeric scoring
 *   R6d: Diagnostic, not punitive — patterns are observations, not judgements
 *   R7:  All pattern names trace to brain file taxonomy
 *   R12: Pattern insights derive from 2+ mechanisms
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-005, CR-009]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

import type { MentorProfile, PassionMapEntry } from './persona'
import type {
  KatorthomaProximityLevel,
} from '../trust-layer/types/accreditation'

import { PATTERN_RECOGNITION_CONFIG } from './ring-wrapper'

// ============================================================================
// TYPES
// ============================================================================

/**
 * A single interaction record for pattern analysis.
 *
 * This is the input format — the caller extracts these from the
 * mentor_interactions table (via profile-store.ts).
 */
export type InteractionRecord = {
  readonly id: string
  readonly interaction_type: string
  readonly description: string
  readonly proximity_assessed: KatorthomaProximityLevel | null
  readonly passions_detected: { passion: string; false_judgement: string }[]
  readonly mechanisms_applied: string[]
  readonly created_at: string
}

/**
 * A temporal pattern detected across interactions.
 */
export type TemporalPattern = {
  /** What dimension this pattern covers */
  readonly dimension: 'time_of_day' | 'day_of_week' | 'context_type' | 'passion_cluster' | 'regression'
  /** Human-readable label for the pattern */
  readonly label: string
  /** The key observation (diagnostic, not punitive — R6d) */
  readonly observation: string
  /** How strong the signal is */
  readonly strength: 'weak' | 'moderate' | 'strong'
  /** How many data points support this pattern */
  readonly evidence_count: number
  /** Brain mechanisms that identify this pattern (R12: 2+ required) */
  readonly mechanisms: string[]
  /** When this pattern was first detected */
  readonly first_detected: string
  /** When this pattern was last confirmed */
  readonly last_confirmed: string
}

/**
 * A passion cluster — passions that tend to co-occur.
 */
export type PassionCluster = {
  /** The passions that appear together */
  readonly passions: string[]
  /** Root passion family (if all share the same root) */
  readonly root_passion: 'epithumia' | 'hedone' | 'phobos' | 'lupe' | 'mixed'
  /** How many times this combination has appeared */
  readonly co_occurrence_count: number
  /** The typical context where this cluster appears */
  readonly typical_context: string | null
}

/**
 * Complete pattern analysis result.
 * Stored in the profile and read by the ring on each interaction.
 */
export type PatternAnalysis = {
  /** When this analysis was computed */
  readonly computed_at: string
  /** How many interactions were analysed */
  readonly interactions_analysed: number
  /** Temporal patterns detected */
  readonly temporal_patterns: TemporalPattern[]
  /** Passion co-occurrence clusters */
  readonly passion_clusters: PassionCluster[]
  /** Passions that were beaten (journal era) but may be returning */
  readonly regression_warnings: RegressionWarning[]
  /** Whether this analysis contains novel patterns not seen before */
  readonly has_novel_patterns: boolean
  /** Summary for the ring to read (pre-computed, no LLM needed) */
  readonly ring_summary: string
}

/**
 * A regression warning — a passion that was overcome but is reappearing.
 */
export type RegressionWarning = {
  /** The passion sub-species */
  readonly passion: string
  /** Root passion */
  readonly root_passion: string
  /** When it was last seen in the journal era */
  readonly journal_last_seen: string | null
  /** When it reappeared in recent interactions */
  readonly reappeared_at: string
  /** Number of recent occurrences */
  readonly recent_count: number
}

// ============================================================================
// BATCH TRIGGER LOGIC
// ============================================================================

/**
 * Determine whether pattern analysis should run.
 *
 * Runs after every Nth interaction (PATTERN_RECOGNITION_CONFIG.batch_interval)
 * or if it's been more than 24 hours since the last analysis.
 */
export function shouldRunPatternAnalysis(
  interactionCount: number,
  lastAnalysisTimestamp: string | null
): boolean {
  // Run every Nth interaction
  if (interactionCount % PATTERN_RECOGNITION_CONFIG.batch_interval === 0) {
    return true
  }

  // Run if it's been more than 24 hours since last analysis
  if (lastAnalysisTimestamp) {
    const hoursSinceLast = (Date.now() - new Date(lastAnalysisTimestamp).getTime()) / (1000 * 60 * 60)
    if (hoursSinceLast >= 24) return true
  }

  // Run if we've never analysed before and have enough data
  if (!lastAnalysisTimestamp && interactionCount >= 5) {
    return true
  }

  return false
}

// ============================================================================
// TIME-OF-DAY PATTERN DETECTION
// ============================================================================

/**
 * Time-of-day buckets for pattern analysis.
 *
 * These align with Stoic daily practice:
 *   - morning: premeditatio malorum (Marcus Aurelius morning prep)
 *   - midday: the active day (most decisions happen here)
 *   - evening: the Senecan review window
 *   - night: post-review (often when rumination occurs)
 */
type TimeBucket = 'morning' | 'midday' | 'evening' | 'night'

function getTimeBucket(timestamp: string): TimeBucket {
  const hour = new Date(timestamp).getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'midday'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

/**
 * Detect time-of-day patterns in reasoning quality.
 *
 * Example output: "Your reasoning tends to drop from deliberate
 * to habitual in the evening — this may be decision fatigue."
 *
 * Brain mechanisms: psychology.json (impression quality degrades
 * with fatigue), progress.json (disposition stability dimension).
 */
function detectTimeOfDayPatterns(
  interactions: InteractionRecord[]
): TemporalPattern[] {
  const assessed = interactions.filter(i => i.proximity_assessed)
  if (assessed.length < 8) return [] // Need enough data per bucket

  const proximityRank: Record<KatorthomaProximityLevel, number> = {
    reflexive: 0, habitual: 1, deliberate: 2, principled: 3, sage_like: 4,
  }

  // Group by time bucket
  const buckets: Record<TimeBucket, { total: number; count: number }> = {
    morning: { total: 0, count: 0 },
    midday: { total: 0, count: 0 },
    evening: { total: 0, count: 0 },
    night: { total: 0, count: 0 },
  }

  for (const interaction of assessed) {
    const bucket = getTimeBucket(interaction.created_at)
    buckets[bucket].total += proximityRank[interaction.proximity_assessed!]
    buckets[bucket].count++
  }

  // Find significant differences between buckets
  const patterns: TemporalPattern[] = []
  const bucketAvgs: Partial<Record<TimeBucket, number>> = {}

  for (const [bucket, data] of Object.entries(buckets)) {
    if (data.count >= 3) {
      bucketAvgs[bucket as TimeBucket] = data.total / data.count
    }
  }

  const avgEntries = Object.entries(bucketAvgs) as [TimeBucket, number][]
  if (avgEntries.length < 2) return []

  // Find the best and worst time periods
  avgEntries.sort((a, b) => b[1] - a[1])
  const best = avgEntries[0]
  const worst = avgEntries[avgEntries.length - 1]

  // Only report if the gap is meaningful (>0.8 proximity levels apart)
  if (best[1] - worst[1] >= 0.8) {
    const strength = best[1] - worst[1] >= 1.5 ? 'strong' : 'moderate'
    const bestBucket = buckets[best[0]]
    const worstBucket = buckets[worst[0]]

    patterns.push({
      dimension: 'time_of_day',
      label: `${worst[0]}_reasoning_drop`,
      observation: `Reasoning quality tends to be lower in the ${worst[0]} ` +
        `compared to the ${best[0]}. ` +
        `This may reflect disposition instability under fatigue or end-of-day stress.`,
      strength,
      evidence_count: bestBucket.count + worstBucket.count,
      mechanisms: ['control_filter', 'passion_diagnosis'],
      first_detected: new Date().toISOString(),
      last_confirmed: new Date().toISOString(),
    })
  }

  return patterns
}

// ============================================================================
// DAY-OF-WEEK PATTERN DETECTION
// ============================================================================

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * Detect day-of-week patterns in passion frequency.
 *
 * Example: "Passions related to appetite tend to cluster on Fridays"
 * (end-of-week reward-seeking behaviour).
 *
 * Brain mechanisms: passions.json (passion classification),
 * psychology.json (impression → assent patterns under weekly rhythm).
 */
function detectDayOfWeekPatterns(
  interactions: InteractionRecord[]
): TemporalPattern[] {
  const withPassions = interactions.filter(i => i.passions_detected.length > 0)
  if (withPassions.length < 10) return []

  // Count passion occurrences per day of week
  const dayPassionCounts: Record<number, number> = {}
  const dayTotalCounts: Record<number, number> = {}

  for (const interaction of interactions) {
    const day = new Date(interaction.created_at).getDay()
    dayTotalCounts[day] = (dayTotalCounts[day] || 0) + 1
    if (interaction.passions_detected.length > 0) {
      dayPassionCounts[day] = (dayPassionCounts[day] || 0) + 1
    }
  }

  const patterns: TemporalPattern[] = []

  // Find days with significantly higher passion rates
  const overallRate = withPassions.length / interactions.length

  for (const [dayStr, passionCount] of Object.entries(dayPassionCounts)) {
    const day = Number(dayStr)
    const total = dayTotalCounts[day] || 0
    if (total < 3) continue // Need enough data

    const dayRate = passionCount / total
    if (dayRate > overallRate * 1.5 && dayRate > 0.5) {
      patterns.push({
        dimension: 'day_of_week',
        label: `${DAY_NAMES[day].toLowerCase()}_passion_spike`,
        observation: `Passions appear more frequently on ${DAY_NAMES[day]}s ` +
          `(${Math.round(dayRate * 100)}% of interactions vs ${Math.round(overallRate * 100)}% overall). ` +
          `Consider what about this day's rhythm triggers false judgements.`,
        strength: dayRate > overallRate * 2 ? 'strong' : 'moderate',
        evidence_count: passionCount,
        mechanisms: ['passion_diagnosis', 'control_filter'],
        first_detected: new Date().toISOString(),
        last_confirmed: new Date().toISOString(),
      })
    }
  }

  return patterns
}

// ============================================================================
// CONTEXT-TYPE PATTERN DETECTION
// ============================================================================

/**
 * Context keywords mapped to decision domains.
 *
 * These are used to classify interaction descriptions into context
 * types for pattern detection. The mentor can then identify that
 * (for example) financial decisions consistently trigger phobos.
 */
const CONTEXT_KEYWORDS: Record<string, string[]> = {
  financial: ['money', 'invest', 'spend', 'cost', 'budget', 'revenue', 'profit', 'loss', 'pricing', 'salary'],
  relationship: ['partner', 'friend', 'family', 'colleague', 'team', 'conflict', 'trust', 'relationship'],
  career: ['job', 'career', 'promotion', 'interview', 'resign', 'opportunity', 'performance', 'boss'],
  health: ['health', 'exercise', 'diet', 'sleep', 'stress', 'burnout', 'energy', 'medication'],
  creative: ['create', 'build', 'write', 'design', 'project', 'launch', 'idea', 'vision'],
  ethical: ['right', 'wrong', 'fair', 'honest', 'integrity', 'compromise', 'principle', 'moral'],
}

function classifyContext(description: string): string | null {
  const lower = description.toLowerCase()
  let bestMatch: string | null = null
  let bestCount = 0

  for (const [context, keywords] of Object.entries(CONTEXT_KEYWORDS)) {
    const count = keywords.filter(kw => lower.includes(kw)).length
    if (count > bestCount) {
      bestCount = count
      bestMatch = context
    }
  }

  return bestCount >= 1 ? bestMatch : null
}

/**
 * Detect context-type patterns — which domains trigger passions.
 *
 * Example: "Financial decisions consistently trigger fear-related
 * passions (phobos). The causal sequence tends to break at the
 * impression stage — the financial impression is immediately
 * assented to as threatening."
 *
 * Brain mechanisms: passions.json (passion per context),
 * value.json (treating indifferents as goods in specific domains).
 */
function detectContextPatterns(
  interactions: InteractionRecord[]
): TemporalPattern[] {
  if (interactions.length < 10) return []

  // Classify each interaction and track passion rates per context
  const contextStats: Record<string, { total: number; withPassions: number; passionTypes: string[] }> = {}

  for (const interaction of interactions) {
    const context = classifyContext(interaction.description)
    if (!context) continue

    if (!contextStats[context]) {
      contextStats[context] = { total: 0, withPassions: 0, passionTypes: [] }
    }

    contextStats[context].total++
    if (interaction.passions_detected.length > 0) {
      contextStats[context].withPassions++
      for (const p of interaction.passions_detected) {
        contextStats[context].passionTypes.push(p.passion)
      }
    }
  }

  const patterns: TemporalPattern[] = []

  for (const [context, stats] of Object.entries(contextStats)) {
    if (stats.total < 3) continue

    const rate = stats.withPassions / stats.total
    if (rate >= 0.6) {
      // Find the most common passion in this context
      const passionCounts = new Map<string, number>()
      for (const p of stats.passionTypes) {
        passionCounts.set(p, (passionCounts.get(p) || 0) + 1)
      }
      const topPassion = Array.from(passionCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]

      patterns.push({
        dimension: 'context_type',
        label: `${context}_passion_trigger`,
        observation: `${context.charAt(0).toUpperCase() + context.slice(1)} decisions ` +
          `tend to trigger passions (${Math.round(rate * 100)}% of the time)` +
          (topPassion ? `. Most common: ${topPassion[0]}.` : '.') +
          ` Consider whether ${context} situations are generating false impressions ` +
          `about what is genuinely good or evil.`,
        strength: rate >= 0.8 ? 'strong' : 'moderate',
        evidence_count: stats.withPassions,
        mechanisms: ['passion_diagnosis', 'value_assessment'],
        first_detected: new Date().toISOString(),
        last_confirmed: new Date().toISOString(),
      })
    }
  }

  return patterns
}

// ============================================================================
// PASSION CLUSTER DETECTION
// ============================================================================

/**
 * Detect passion co-occurrence clusters.
 *
 * Passions rarely appear alone. Fear of loss (phobos) often co-occurs
 * with appetite for security (epithumia). The cluster reveals the
 * underlying false judgement more clearly than individual passions.
 *
 * Brain mechanisms: passions.json (25-species interaction),
 * psychology.json (causal sequence — one impression can trigger
 * multiple passions through branching assent).
 */
function detectPassionClusters(
  interactions: InteractionRecord[]
): PassionCluster[] {
  // Build co-occurrence matrix
  const pairCounts = new Map<string, number>()
  const passionContexts = new Map<string, string[]>()

  for (const interaction of interactions) {
    const passions = interaction.passions_detected.map(p => p.passion).sort()
    if (passions.length < 2) continue

    // Record all pairs
    for (let i = 0; i < passions.length; i++) {
      for (let j = i + 1; j < passions.length; j++) {
        const key = `${passions[i]}|${passions[j]}`
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1)

        // Track context
        const context = classifyContext(interaction.description)
        if (context) {
          const existing = passionContexts.get(key) || []
          existing.push(context)
          passionContexts.set(key, existing)
        }
      }
    }
  }

  // Filter to meaningful clusters (appeared 2+ times)
  const clusters: PassionCluster[] = []

  for (const [key, count] of pairCounts.entries()) {
    if (count < 2) continue

    const passions = key.split('|')

    // Determine root passion family
    // (We don't have the full taxonomy here, so we use a simplified check)
    const contexts = passionContexts.get(key) || []
    const typicalContext = contexts.length > 0
      ? getMostCommon(contexts)
      : null

    clusters.push({
      passions,
      root_passion: 'mixed', // Would need passion_map lookup for accuracy
      co_occurrence_count: count,
      typical_context: typicalContext,
    })
  }

  return clusters.sort((a, b) => b.co_occurrence_count - a.co_occurrence_count)
}

// ============================================================================
// REGRESSION DETECTION
// ============================================================================

/**
 * Detect passion regression — passions that were overcome during the
 * journal era but are reappearing in recent interactions.
 *
 * This is the engine's most important diagnostic. If someone spent
 * weeks working through a specific passion during the journal and
 * it returns months later, the mentor should notice and name it.
 *
 * Brain mechanisms: progress.json (direction of travel, regression),
 * passions.json (specific passion identification).
 */
function detectRegressions(
  profile: MentorProfile,
  recentInteractions: InteractionRecord[]
): RegressionWarning[] {
  if (profile.passion_map.length === 0) return []

  // Find passions from the journal that were marked as 'rare' or had old last_seen
  const historicalPassions = profile.passion_map.filter(p => {
    const lastSeen = new Date(p.last_seen)
    const daysSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60 * 24)
    // Consider "historical" if last seen more than 30 days ago
    return daysSinceLastSeen > 30 || p.frequency === 'rare'
  })

  if (historicalPassions.length === 0) return []

  // Check recent interactions for these passions
  const warnings: RegressionWarning[] = []
  const recentPassionCounts = new Map<string, { count: number; firstSeen: string }>()

  for (const interaction of recentInteractions) {
    for (const detected of interaction.passions_detected) {
      const existing = recentPassionCounts.get(detected.passion)
      if (existing) {
        existing.count++
      } else {
        recentPassionCounts.set(detected.passion, {
          count: 1,
          firstSeen: interaction.created_at,
        })
      }
    }
  }

  for (const historical of historicalPassions) {
    const recent = recentPassionCounts.get(historical.sub_species)
    if (recent && recent.count >= 2) {
      warnings.push({
        passion: historical.sub_species,
        root_passion: historical.root_passion,
        journal_last_seen: historical.last_seen,
        reappeared_at: recent.firstSeen,
        recent_count: recent.count,
      })
    }
  }

  return warnings
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Run the full pattern analysis.
 *
 * This is the batch function called by the scheduler or after every
 * Nth interaction. It runs all pattern detectors and produces a
 * PatternAnalysis that is stored on the profile for the ring to read.
 *
 * Deterministic — no LLM calls. The `has_novel_patterns` flag tells
 * the caller whether to escalate to Sonnet for narrative interpretation.
 */
export function analysePatterns(
  profile: MentorProfile,
  interactions: InteractionRecord[],
  previousAnalysis: PatternAnalysis | null = null
): PatternAnalysis {
  // Run all detectors
  const timePatterns = detectTimeOfDayPatterns(interactions)
  const dayPatterns = detectDayOfWeekPatterns(interactions)
  const contextPatterns = detectContextPatterns(interactions)
  const passionClusters = detectPassionClusters(interactions)
  const regressions = detectRegressions(profile, interactions)

  const allPatterns = [...timePatterns, ...dayPatterns, ...contextPatterns]

  // Detect novel patterns (not in previous analysis)
  let hasNovel = false
  if (previousAnalysis) {
    const previousLabels = new Set(previousAnalysis.temporal_patterns.map(p => p.label))
    hasNovel = allPatterns.some(p => !previousLabels.has(p.label))
    if (!hasNovel) {
      // Check for new passion clusters
      const previousClusters = new Set(
        previousAnalysis.passion_clusters.map(c => c.passions.sort().join('|'))
      )
      hasNovel = passionClusters.some(
        c => !previousClusters.has(c.passions.sort().join('|'))
      )
    }
    if (!hasNovel) {
      // Check for new regressions
      const previousRegressions = new Set(
        previousAnalysis.regression_warnings.map(r => r.passion)
      )
      hasNovel = regressions.some(r => !previousRegressions.has(r.passion))
    }
  } else {
    // First analysis is always "novel"
    hasNovel = allPatterns.length > 0 || passionClusters.length > 0 || regressions.length > 0
  }

  // Build ring summary (pre-computed, zero tokens at read time)
  const ringParts: string[] = []

  if (allPatterns.filter(p => p.strength === 'strong').length > 0) {
    ringParts.push(
      'Strong patterns: ' +
      allPatterns.filter(p => p.strength === 'strong').map(p => p.label).join(', ')
    )
  }

  if (regressions.length > 0) {
    ringParts.push(
      'Regression warnings: ' +
      regressions.map(r => `${r.passion} (${r.recent_count} recent occurrences)`).join(', ')
    )
  }

  if (passionClusters.length > 0) {
    ringParts.push(
      'Passion clusters: ' +
      passionClusters.slice(0, 3).map(c => c.passions.join(' + ')).join('; ')
    )
  }

  const ringSummary = ringParts.length > 0
    ? ringParts.join('. ') + '.'
    : 'No significant patterns detected in current window.'

  return {
    computed_at: new Date().toISOString(),
    interactions_analysed: interactions.length,
    temporal_patterns: allPatterns,
    passion_clusters: passionClusters,
    regression_warnings: regressions,
    has_novel_patterns: hasNovel,
    ring_summary: ringSummary,
  }
}

// ============================================================================
// PATTERN NARRATIVE BUILDER — For LLM interpretation of novel patterns
// ============================================================================

/**
 * Build a prompt for the LLM to interpret novel patterns.
 *
 * This is ONLY called when has_novel_patterns is true. The LLM
 * (Sonnet tier) receives the raw pattern data and produces a
 * narrative interpretation for the weekly pattern mirror.
 *
 * Token efficiency: This prompt is small (~200-400 tokens of data)
 * because the patterns have already been aggregated deterministically.
 * The LLM's job is just narrative interpretation, not data crunching.
 */
export function buildPatternNarrativePrompt(
  analysis: PatternAnalysis,
  profile: MentorProfile
): string {
  const parts: string[] = []

  parts.push('PATTERN ANALYSIS DATA (interpret as narrative, do not score):')
  parts.push('')

  if (analysis.temporal_patterns.length > 0) {
    parts.push('TEMPORAL PATTERNS:')
    for (const p of analysis.temporal_patterns) {
      parts.push(`  - [${p.strength}] ${p.observation}`)
    }
    parts.push('')
  }

  if (analysis.passion_clusters.length > 0) {
    parts.push('PASSION CLUSTERS (co-occurring):')
    for (const c of analysis.passion_clusters.slice(0, 5)) {
      parts.push(`  - ${c.passions.join(' + ')} (${c.co_occurrence_count}x` +
        (c.typical_context ? `, typically in ${c.typical_context} contexts` : '') + ')')
    }
    parts.push('')
  }

  if (analysis.regression_warnings.length > 0) {
    parts.push('REGRESSION WARNINGS (previously overcome, now returning):')
    for (const r of analysis.regression_warnings) {
      parts.push(`  - ${r.passion} (${r.root_passion}): ${r.recent_count} recent occurrences`)
    }
    parts.push('')
  }

  parts.push(`PROFILE CONTEXT:`)
  parts.push(`  Proximity: ${profile.proximity_level}`)
  parts.push(`  Direction: ${profile.direction_of_travel}`)
  parts.push(`  Growth edge: ${profile.current_prescription?.weakest_dimension || 'not assessed'}`)
  parts.push('')
  parts.push('TASK: Interpret these patterns as a brief narrative insight (2-3 sentences). ' +
    'Connect to the person\'s trajectory. Name specific passions using their proper terms. ' +
    'End with one question. Do NOT score. Do NOT promise outcomes (R9). ' +
    'Be diagnostic, not punitive (R6d).')

  return parts.join('\n')
}

// ============================================================================
// UTILITY
// ============================================================================

function getMostCommon(items: string[]): string | null {
  const counts = new Map<string, number>()
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [item, count] of counts) {
    if (count > bestCount) {
      best = item
      bestCount = count
    }
  }
  return best
}
