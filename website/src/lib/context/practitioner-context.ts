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
 * existing loadMentorProfileCanonical() pipeline which handles decryption.
 *
 * Migrated under ADR-Ring-2-01 Session 3d (26 April 2026): switched from
 * loadMentorProfile() (legacy MentorProfileData envelope) to
 * loadMentorProfileCanonical() (canonical MentorProfile envelope). The string
 * builders (buildCondensedContext, projectProfile) and their helpers
 * (formatPassion, findWeakestVirtue) consume the canonical shape per ADR §2.1
 * / §2.2. Field translations applied internally (no wire-contract change —
 * these functions return formatted strings for prompt injection):
 *   - proximity_estimate.{level,senecan_grade} → proximity_level + senecan_grade
 *   - virtue_profile Record → VirtueDomainAssessment[] (iterate by domain)
 *   - causal_tendencies summary record → CausalTendency[] (primary picked by
 *     frequency order: common > occasional > rare)
 *   - value_hierarchy summary record → ValueHierarchyEntry[] (top values =
 *     entries without gap_detected; gaps = entries with it; legacy
 *     primary_conflict has no canonical equivalent — surface first gap entry)
 *   - oikeiosis_map Record → OikeioisMapEntry[] (iterate by person_or_role /
 *     oikeiosis_stage / reflection_frequency)
 *   - passion_map[].false_judgements[] (plural) → false_judgement (singular)
 *   - passion_map[].frequency (1–12 number) → bucket string
 *     ('rare'|'occasional'|'recurring'|'persistent'); sort changes from
 *     numeric to fixed bucket order
 *   - passion_map[].max_intensity / sections_present — no canonical equivalent;
 *     dropped from per-passion lines.
 */

import { loadMentorProfile } from '@/lib/mentor-profile-store'
import { isServerEncryptionConfigured } from '@/lib/server-encryption'
import type { CausalTendency, MentorProfile, PassionMapEntry } from '../../../../sage-mentor'

// ── Bucket-order tables for canonical sorts ─────────────────────────
// passion_map[].frequency: 'persistent' > 'recurring' > 'occasional' > 'rare'.
// Lower index sorts first, so persistent appears first in slice(0, 3).
const PASSION_BUCKET_ORDER: Record<MentorProfile['passion_map'][number]['frequency'], number> = {
  persistent: 0,
  recurring: 1,
  occasional: 2,
  rare: 3,
}
// causal_tendencies[].frequency: 'common' > 'occasional' > 'rare'. Lower
// index sorts first, so the most common breakdown is picked as primary.
const CAUSAL_FREQ_ORDER: Record<CausalTendency['frequency'], number> = {
  common: 0,
  occasional: 1,
  rare: 2,
}

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

    return stored.summary // buildProfileSummary output — already canonical-consuming since Session 3a
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
function buildCondensedContext(profile: MentorProfile): string {
  const sections: string[] = []

  sections.push('PRACTITIONER CONTEXT (personalised to this user):')

  // 0. Founder Facts one-liner — who this person is (if available)
  if (profile.founder_facts) {
    const ff = profile.founder_facts
    sections.push(
      `Person: age ${ff.age}, married ${ff.years_married}y, children ${ff.children_ages.join('/')}, ${ff.financial_situation}, ${ff.retirement_horizon}`
    )
  }

  // 1. Proximity and grade — the single most important context signal.
  // ADR-Ring-2-01 Session 3d: flat canonical fields (was nested
  // proximity_estimate.{level,senecan_grade} on MentorProfileData).
  sections.push(
    `Proximity: ${profile.proximity_level} (Senecan grade: ${profile.senecan_grade})`
  )

  // 2. Top 3 passions by frequency bucket — what distorts this person's
  // reasoning most. Sort changes from numeric (b.frequency - a.frequency)
  // to fixed bucket order (persistent first, then recurring, occasional,
  // rare) because the canonical frequency is now a string union.
  const topPassions = [...profile.passion_map]
    .sort(
      (a, b) => PASSION_BUCKET_ORDER[a.frequency] - PASSION_BUCKET_ORDER[b.frequency]
    )
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

  // 4. Primary causal breakdown — where reasoning fails. Canonical:
  // causal_tendencies is a CausalTendency[]; pick the most-frequent entry
  // (common > occasional > rare). Skip the section gracefully if empty.
  const primaryCausal = [...profile.causal_tendencies].sort(
    (a, b) => CAUSAL_FREQ_ORDER[a.frequency] - CAUSAL_FREQ_ORDER[b.frequency]
  )[0]
  if (primaryCausal) {
    sections.push(
      `Causal breakdown: ${primaryCausal.failure_point} — ${primaryCausal.description}`
    )
  }

  // 5. Top value-hierarchy gap — the tension most likely to surface.
  // Canonical: value_hierarchy is a ValueHierarchyEntry[]; legacy
  // `primary_conflict` field has no canonical equivalent. Surface the first
  // gap entry as the closest replacement signal.
  const firstGap = profile.value_hierarchy.find((v) => v.gap_detected)
  if (firstGap) {
    sections.push(
      `Primary value gap: "${firstGap.item}" — declared ${firstGap.declared_classification}, observed ${firstGap.observed_classification}`
    )
  }

  // Instruction to the LLM on how to use this context
  sections.push(
    '',
    'Use this practitioner context to personalise your analysis. Reference their specific passions, weakest virtue, and causal breakdown where relevant. Do not repeat the context verbatim — weave it into your reasoning naturally.'
  )

  return sections.join('\n')
}

function formatPassion(p: PassionMapEntry): string {
  // ADR-Ring-2-01 Session 3d: canonical false_judgement is singular (was
  // false_judgements[] plural on MentorProfileData). Frequency is now the
  // bucket string ('rare'|'occasional'|'recurring'|'persistent') — the
  // legacy "/12" suffix is dropped because the count is no longer numeric.
  const falseJudgement = p.false_judgement || ''
  const brief = falseJudgement.length > 80
    ? falseJudgement.substring(0, 77) + '...'
    : falseJudgement
  return `${p.sub_species} (${p.root_passion}, ${p.frequency})${brief ? ` — "${brief}"` : ''}`
}

function findWeakestVirtue(
  profile: MentorProfile
): { name: string; strength: string } | null {
  // ADR-Ring-2-01 Session 3d: canonical virtue_profile is an array of
  // VirtueDomainAssessment (was a Record on MentorProfileData). Iterate by
  // entry — name comes from `domain`, strength from `strength`. The
  // strengthOrder values match the canonical strength union one-for-one
  // ('gap' | 'developing' | 'moderate' | 'strong').
  const strengthOrder: Record<string, number> = {
    gap: 0,
    developing: 1,
    moderate: 2,
    strong: 3,
  }

  let weakest: { name: string; strength: string } | null = null
  let weakestScore = Infinity

  for (const v of profile.virtue_profile) {
    const score = strengthOrder[v.strength] ?? 1
    if (score < weakestScore) {
      weakestScore = score
      weakest = { name: v.domain, strength: v.strength }
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
 * @param profile - The full MentorProfile loaded from storage
 * @param topic - The opening message / current conversation content (used for keyword matching)
 */
export function projectProfile(profile: MentorProfile, topic: string): string {
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

  // Proximity estimate + Senecan grade. ADR-Ring-2-01 Session 3d: flat
  // canonical fields (was nested proximity_estimate.{level,senecan_grade}).
  sections.push(
    `Proximity: ${profile.proximity_level} (Senecan grade: ${profile.senecan_grade})`
  )

  // Primary causal tendency — pick the most-frequent entry from the
  // canonical CausalTendency[] array (common > occasional > rare). Skip
  // the section gracefully if the array is empty.
  const primaryCausal = [...profile.causal_tendencies].sort(
    (a, b) => CAUSAL_FREQ_ORDER[a.frequency] - CAUSAL_FREQ_ORDER[b.frequency]
  )[0]
  if (primaryCausal) {
    sections.push(
      `Primary causal breakdown: ${primaryCausal.failure_point} — ${primaryCausal.description}`
    )
  }

  // Top 3 passions by frequency bucket (always included, brief form). Sort
  // changes from numeric to fixed bucket order under canonical frequency.
  const topPassions = [...profile.passion_map]
    .sort(
      (a, b) => PASSION_BUCKET_ORDER[a.frequency] - PASSION_BUCKET_ORDER[b.frequency]
    )
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
    // ADR-Ring-2-01 Session 3d: virtue_profile is an array of
    // VirtueDomainAssessment. Legacy `observations_count` and
    // `evidence_summary[]` fields don't exist on the canonical type;
    // surface the canonical `evidence` string instead.
    sections.push('', 'VIRTUE PROFILE (topic touches action/courage):')
    for (const v of profile.virtue_profile) {
      const evidenceBrief = v.evidence
        ? (v.evidence.length > 120 ? v.evidence.substring(0, 117) + '...' : v.evidence)
        : ''
      sections.push(
        `  ${v.domain}: ${v.strength}${evidenceBrief ? ` — ${evidenceBrief}` : ''}`
      )
    }
  }

  if (signal.touches_relationships) {
    // ADR-Ring-2-01 Session 3d: oikeiosis_map is an array of
    // OikeioisMapEntry. The legacy Record `[ring, {level, evidence}]`
    // form has no direct canonical analogue; surface the canonical
    // person/relationship/stage/frequency fields instead.
    sections.push('', 'OIKEIOSIS MAP (topic touches relationships/community):')
    for (const o of profile.oikeiosis_map) {
      sections.push(
        `  ${o.person_or_role} (${o.oikeiosis_stage}): ${o.relationship} — reflection ${o.reflection_frequency}`
      )
    }
  }

  if (signal.touches_decisions) {
    // ADR-Ring-2-01 Session 3d: value_hierarchy is an array of
    // ValueHierarchyEntry. Top values = entries without gap_detected;
    // classification gaps = entries with it. Legacy `primary_conflict`
    // string has no canonical equivalent — dropped.
    sections.push('', 'VALUE HIERARCHY (topic touches decisions/priorities):')
    const topValues = profile.value_hierarchy
      .filter((v) => !v.gap_detected)
      .map((v) => v.item)
    if (topValues.length > 0) {
      sections.push(`  Top values: ${topValues.join(', ')}`)
    }
    const valueGaps = profile.value_hierarchy.filter((v) => v.gap_detected)
    if (valueGaps.length > 0) {
      const gapLines = valueGaps.map(
        (g) =>
          `"${g.item}" — declared ${g.declared_classification}, observed ${g.observed_classification}`
      )
      sections.push(`  Classification gaps: ${gapLines.join('; ')}`)
    }
  }

  if (signal.touches_emotion) {
    // ADR-Ring-2-01 Session 3d: per-passion line uses canonical
    // false_judgement (singular) and frequency (bucket string). Legacy
    // max_intensity has no canonical equivalent and is dropped.
    sections.push('', 'FULL PASSION MAP (topic touches emotional reaction):')
    for (const p of profile.passion_map) {
      const fj = p.false_judgement || ''
      const brief = fj.length > 100 ? fj.substring(0, 97) + '...' : fj
      sections.push(
        `  ${p.sub_species} (${p.root_passion}, ${p.frequency})${brief ? ` — "${brief}"` : ''}`
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
