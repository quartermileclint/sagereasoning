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
