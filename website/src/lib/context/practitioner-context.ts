/**
 * practitioner-context.ts — Condensed practitioner profile for LLM context injection.
 *
 * For authenticated endpoints, loads the practitioner's encrypted MentorProfile
 * from Supabase and returns a condensed context block (~300-500 tokens) suitable
 * for injection into the user message of any LLM call.
 *
 * This is NOT the full profile summary (buildProfileSummary produces ~7,500 chars
 * for mentor endpoints). This is a focused extract of the dimensions most relevant
 * to real-time reasoning: dominant passions, weakest virtue, causal breakdown,
 * proximity level, and top value conflicts.
 *
 * Graceful degradation: returns null if no profile exists, if encryption is not
 * configured, or if the load fails. Callers should proceed without personalisation.
 *
 * R17b: Profile data is encrypted at rest. This module reads through the
 * existing loadMentorProfile() pipeline which handles decryption.
 */

import { loadMentorProfile } from '@/lib/mentor-profile-store'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import type { MentorProfileData, PassionMapEntry } from '@/lib/mentor-profile-summary'

/**
 * Get a condensed practitioner context block for LLM injection.
 * Used by product-facing endpoints and the public mentor.
 *
 * @param userId - Authenticated user's ID
 * @returns Formatted context string (~300-500 tokens), or null if no profile
 */
export async function getPractitionerContext(userId: string): Promise<string | null> {
  try {
    if (!isServerEncryptionConfigured()) return null

    const stored = await loadMentorProfile(userId)
    if (!stored) return null

    return buildCondensedContext(stored.profile)
  } catch (err) {
    console.error('[practitioner-context] Failed to load profile:', err)
    return null
  }
}

/**
 * Get the FULL practitioner profile context for the private mentor.
 * Returns the complete buildProfileSummary output (~7,500 chars) including:
 * full passion map with all false judgements, virtue profile with evidence,
 * detailed causal tendencies, complete oikeiosis map, value hierarchy with
 * conflicts and classification gaps, and preferred indifferents.
 *
 * This is substantially richer than the condensed version (~300-500 tokens)
 * and should ONLY be used for the private mentor (founder-only) endpoint.
 *
 * @param userId - Authenticated user's ID
 * @returns Full profile context string, or null if no profile
 */
export async function getFullPractitionerContext(userId: string): Promise<string | null> {
  try {
    if (!isServerEncryptionConfigured()) return null

    const stored = await loadMentorProfile(userId)
    if (!stored) return null

    return stored.summary // buildProfileSummary output — already computed by loadMentorProfile
  } catch (err) {
    console.error('[practitioner-context] Failed to load full profile:', err)
    return null
  }
}

/**
 * Build a condensed context block from a MentorProfile.
 * Target: 300-500 tokens. Focuses on the dimensions most relevant to
 * real-time reasoning quality.
 */
function buildCondensedContext(profile: MentorProfileData): string {
  const sections: string[] = []

  sections.push('PRACTITIONER CONTEXT (personalised to this user):')

  // 0. Founder Facts one-liner — who this person is (if available)
  if (profile.founder_facts) {
    const ff = profile.founder_facts
    sections.push(
      `Person: age ${ff.age}, married ${ff.years_married}y, children ${ff.children_ages.join('/')}, ${ff.financial_situation}, ${ff.retirement_horizon}`
    )
  }

  // 1. Proximity and grade — the single most important context signal
  sections.push(
    `Proximity: ${profile.proximity_estimate.level} (Senecan grade: ${profile.proximity_estimate.senecan_grade})`
  )

  // 2. Top 3 passions by frequency — what distorts this person's reasoning most
  const topPassions = [...profile.passion_map]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3)

  if (topPassions.length > 0) {
    const passionLines = topPassions.map(formatPassion)
    sections.push(`Dominant passions: ${passionLines.join('; ')}`)
  }

  // 3. Weakest virtue — where they need the most growth
  const weakest = findWeakestVirtue(profile)
  if (weakest) {
    sections.push(`Weakest virtue: ${weakest.name} (${weakest.strength})`)
  }

  // 4. Primary causal breakdown — where reasoning fails
  sections.push(
    `Causal breakdown: ${profile.causal_tendencies.primary_breakdown} — ${profile.causal_tendencies.description}`
  )

  // 5. Top value conflict — the tension most likely to surface
  if (profile.value_hierarchy.primary_conflict) {
    sections.push(`Primary value conflict: ${profile.value_hierarchy.primary_conflict}`)
  }

  // Instruction to the LLM on how to use this context
  sections.push(
    '',
    'Use this practitioner context to personalise your analysis. Reference their specific passions, weakest virtue, and causal breakdown where relevant. Do not repeat the context verbatim — weave it into your reasoning naturally.'
  )

  return sections.join('\n')
}

function formatPassion(p: PassionMapEntry): string {
  const falseJudgement = p.false_judgements[0] || ''
  const brief = falseJudgement.length > 80
    ? falseJudgement.substring(0, 77) + '...'
    : falseJudgement
  return `${p.sub_species} (${p.root_passion}, freq ${p.frequency}/12)${brief ? ` — "${brief}"` : ''}`
}

function findWeakestVirtue(
  profile: MentorProfileData
): { name: string; strength: string } | null {
  const strengthOrder: Record<string, number> = {
    gap: 0,
    developing: 1,
    moderate: 2,
    strong: 3,
  }

  let weakest: { name: string; strength: string } | null = null
  let weakestScore = Infinity

  for (const [virtue, data] of Object.entries(profile.virtue_profile)) {
    const score = strengthOrder[data.overall_strength] ?? 1
    if (score < weakestScore) {
      weakestScore = score
      weakest = { name: virtue, strength: data.overall_strength }
    }
  }

  return weakest
}

// =============================================================================
// Profile Projection Layer (Session Context Loader — Piece 1)
// =============================================================================
//
// The full profile summary (buildProfileSummary) is ~7,500 chars and is sent
// on every mentor request. As interaction history accumulates in context, this
// risks context window saturation and wastes tokens on dimensions irrelevant
// to the current conversation.
//
// projectProfile() filters the full profile to the dimensions relevant to the
// current conversation topic:
//
//   ALWAYS INCLUDED
//     - founder facts one-liner (who this person is)
//     - proximity estimate (level + senecan grade)
//     - primary causal tendency (synkatathesis / horme / phantasia / praxis)
//     - top 3 passions by frequency
//     - weakest virtue (one line)
//
//   CONDITIONALLY INCLUDED (by topic signal, simple keyword match)
//     - virtue profile (if topic touches action or courage)
//     - oikeiosis map (if topic touches relationships or community)
//     - value hierarchy (if topic touches decisions or priorities)
//     - full passion map (if topic touches emotional reaction)
//
//   NEVER INCLUDED BY DEFAULT
//     - raw journal entries (these are source material, not session context)
//
// Topic signal = keyword matching on the incoming user message. Simple by
// design — can be upgraded later to embedding/LLM-based classification.
// =============================================================================

export interface TopicSignal {
  touches_action: boolean           // virtue profile
  touches_relationships: boolean    // oikeiosis map
  touches_decisions: boolean        // value hierarchy
  touches_emotion: boolean          // full passion map
}

/**
 * Detect which conditional dimensions the topic touches, via simple keyword
 * matching on the opening message. Lightweight by design — not NLP.
 */
export function detectTopicSignal(topic: string): TopicSignal {
  const text = (topic || '').toLowerCase()
  const has = (words: string[]) => words.some(w => text.includes(w))

  return {
    touches_action: has([
      'should i', 'should we', 'what do i do', 'what should', 'action', 'act',
      'courage', 'brave', 'do the right', 'duty', 'obligation',
      'confront', 'stand up', 'speak up', 'push back', 'hard thing',
    ]),
    touches_relationships: has([
      'wife', 'husband', 'spouse', 'partner', 'marriage',
      'child', 'children', 'son', 'daughter', 'kids',
      'parent', 'mother', 'father', 'family', 'sibling',
      'friend', 'colleague', 'team', 'co-worker', 'coworker',
      'community', 'relationship', 'neighbour', 'neighbor',
      'boss', 'manager', 'report', 'customer', 'user',
    ]),
    touches_decisions: has([
      'decide', 'decision', 'choose', 'choice', 'pick', 'select',
      'priority', 'prioritise', 'prioritize', 'between',
      'trade-off', 'tradeoff', 'weigh', 'important', 'matters more',
      'should i pick', 'which one', 'either or',
    ]),
    touches_emotion: has([
      'angry', 'anger', 'furious', 'irritated', 'frustrat',
      'afraid', 'fear', 'scared', 'anxious', 'anxiety', 'worry', 'worried', 'dread',
      'ashamed', 'shame', 'embarrass', 'humiliat', 'guilt',
      'desire', 'crav', 'long for', 'want so bad',
      'sad', 'grief', 'grieving', 'hurt', 'devastat',
      'jealous', 'envy', 'resent', 'bitter',
    ]),
  }
}

/**
 * Project the full practitioner profile down to the dimensions relevant to
 * the current conversation topic. Returns a formatted context block for
 * injection into the user message.
 *
 * Target size: 40-60% smaller than the full buildProfileSummary output.
 *
 * @param profile - The full MentorProfileData loaded from storage
 * @param topic - The opening message / current conversation content (used for keyword matching)
 */
export function projectProfile(profile: MentorProfileData, topic: string): string {
  const signal = detectTopicSignal(topic)
  const sections: string[] = []

  sections.push('PRACTITIONER CONTEXT (projected to current topic):')

  // ── Always include ────────────────────────────────────────────────

  // Founder facts one-liner
  if (profile.founder_facts) {
    const ff = profile.founder_facts
    sections.push(
      `Person: age ${ff.age}, married ${ff.years_married}y, children ${ff.children_ages.join('/')}, ${ff.financial_situation}, ${ff.retirement_horizon}`
    )
    // Recent biographical notes (last 3) help the mentor stay current
    if (ff.additional_context && ff.additional_context.length > 0) {
      const recent = ff.additional_context.slice(-3)
      sections.push(`Recent notes: ${recent.join(' | ')}`)
    }
  }

  // Proximity estimate + Senecan grade
  sections.push(
    `Proximity: ${profile.proximity_estimate.level} (Senecan grade: ${profile.proximity_estimate.senecan_grade})`
  )

  // Primary causal tendency
  sections.push(
    `Primary causal breakdown: ${profile.causal_tendencies.primary_breakdown} — ${profile.causal_tendencies.description}`
  )

  // Top 3 passions by frequency (always included, brief form)
  const topPassions = [...profile.passion_map]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 3)

  if (topPassions.length > 0) {
    const passionLines = topPassions.map(formatPassion)
    sections.push(`Top 3 passions (by frequency): ${passionLines.join('; ')}`)
  }

  // Weakest virtue (one line, always)
  const weakest = findWeakestVirtue(profile)
  if (weakest) {
    sections.push(`Weakest virtue: ${weakest.name} (${weakest.strength})`)
  }

  // ── Conditional sections ──────────────────────────────────────────

  if (signal.touches_action) {
    sections.push('', 'VIRTUE PROFILE (topic touches action/courage):')
    for (const [virtue, data] of Object.entries(profile.virtue_profile)) {
      const evidenceBrief = (data.evidence_summary || [])
        .slice(0, 2)
        .join('; ')
      sections.push(
        `  ${virtue}: ${data.overall_strength} (${data.observations_count} obs)${evidenceBrief ? ` — ${evidenceBrief}` : ''}`
      )
    }
  }

  if (signal.touches_relationships) {
    sections.push('', 'OIKEIOSIS MAP (topic touches relationships/community):')
    for (const [ring, data] of Object.entries(profile.oikeiosis_map)) {
      sections.push(`  ${ring}: ${data.level} — ${data.evidence}`)
    }
  }

  if (signal.touches_decisions) {
    sections.push('', 'VALUE HIERARCHY (topic touches decisions/priorities):')
    if (profile.value_hierarchy.explicit_top_values?.length > 0) {
      sections.push(
        `  Top values: ${profile.value_hierarchy.explicit_top_values.join(', ')}`
      )
    }
    if (profile.value_hierarchy.primary_conflict) {
      sections.push(`  Primary conflict: ${profile.value_hierarchy.primary_conflict}`)
    }
    if (profile.value_hierarchy.classification_gaps?.length > 0) {
      sections.push(
        `  Classification gaps: ${profile.value_hierarchy.classification_gaps.join('; ')}`
      )
    }
  }

  if (signal.touches_emotion) {
    sections.push('', 'FULL PASSION MAP (topic touches emotional reaction):')
    for (const p of profile.passion_map) {
      const fj = p.false_judgements[0] || ''
      const brief = fj.length > 100 ? fj.substring(0, 97) + '...' : fj
      sections.push(
        `  ${p.sub_species} (${p.root_passion}, freq ${p.frequency}, ${p.max_intensity})${brief ? ` — "${brief}"` : ''}`
      )
    }
  }

  sections.push(
    '',
    'Use this projected context to personalise your analysis. Reference the specific dimensions where relevant. Do not repeat the context verbatim — weave it into your reasoning naturally.'
  )

  return sections.join('\n')
}

/**
 * Load the practitioner's profile and return the topic-projected context
 * block. Replaces getFullPractitionerContext() when projection is enabled.
 *
 * @param userId - Authenticated user's ID
 * @param topic - The incoming message / conversation content for keyword match
 * @returns Projected context string, or null if no profile
 */
export async function getProjectedPractitionerContext(
  userId: string,
  topic: string
): Promise<string | null> {
  try {
    if (!isServerEncryptionConfigured()) return null

    const stored = await loadMentorProfile(userId)
    if (!stored) return null

    return projectProfile(stored.profile, topic)
  } catch (err) {
    console.error('[practitioner-context] Failed to load projected profile:', err)
    return null
  }
}
