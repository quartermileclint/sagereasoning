/**
 * mentor-profile-summary.ts — Convert a MentorProfile JSON to a text summary
 * suitable for passing to /api/mentor-baseline and /api/mentor-journal-week.
 *
 * The mentor-baseline endpoint needs a profile_summary string that captures
 * the practitioner's extracted profile. This function converts the full JSON
 * into a structured text summary that the LLM can use to generate targeted
 * baseline gap detection questions.
 */

export interface PassionMapEntry {
  passion_id: string
  sub_species: string
  root_passion: string
  frequency: number
  max_intensity: string
  sections_present: string[]
  false_judgements: string[]
}

export interface VirtueEntry {
  overall_strength: string
  observations_count: number
  evidence_summary: string[]
}

export interface MentorProfileData {
  user_id: string
  display_name: string
  journal_name: string
  journal_period: string
  sections_processed: number
  entries_processed: number
  total_word_count: number
  passion_map: PassionMapEntry[]
  virtue_profile: Record<string, VirtueEntry>
  causal_tendencies: {
    primary_breakdown: string
    description: string
    specific_breakdowns: Record<string, string>
  }
  value_hierarchy: {
    explicit_top_values: string[]
    primary_conflict: string
    classification_gaps: string[]
  }
  oikeiosis_map: Record<string, { level: string; evidence: string }>
  proximity_estimate: {
    level: string
    senecan_grade: string
    description: string
  }
  preferred_indifferents_aggregate: string[]
}

/**
 * Build a text summary of a MentorProfile suitable for the
 * mentor-baseline and mentor-journal-week endpoints.
 */
export function buildProfileSummary(profile: MentorProfileData): string {
  const sections: string[] = []

  // Identity and scope
  sections.push(
    `PRACTITIONER PROFILE: ${profile.display_name}`,
    `Journal: ${profile.journal_name} (${profile.journal_period})`,
    `Scope: ${profile.sections_processed} sections, ${profile.entries_processed} entries, ${profile.total_word_count} words`,
    ''
  )

  // Proximity and grade
  sections.push(
    `PROXIMITY ESTIMATE: ${profile.proximity_estimate.level}`,
    `Senecan grade: ${profile.proximity_estimate.senecan_grade}`,
    `Assessment: ${profile.proximity_estimate.description}`,
    ''
  )

  // Passion map (sorted by frequency)
  const sortedPassions = [...profile.passion_map].sort((a, b) => b.frequency - a.frequency)
  sections.push('PASSION MAP (sorted by frequency):')
  for (const p of sortedPassions) {
    const persistence = p.frequency >= 7 ? 'persistent' : p.frequency >= 4 ? 'recurring' : p.frequency >= 2 ? 'occasional' : 'rare'
    sections.push(
      `  ${p.sub_species} (${p.root_passion}) — frequency: ${p.frequency}/12, intensity: ${p.max_intensity}, pattern: ${persistence}`,
      `    False judgements: ${p.false_judgements.slice(0, 3).join('; ')}${p.false_judgements.length > 3 ? ` (+${p.false_judgements.length - 3} more)` : ''}`
    )
  }
  sections.push('')

  // Virtue profile
  sections.push('VIRTUE PROFILE:')
  for (const [virtue, data] of Object.entries(profile.virtue_profile)) {
    sections.push(
      `  ${virtue}: ${data.overall_strength} (${data.observations_count} observations)`,
      `    Evidence: ${data.evidence_summary[0]}`
    )
  }
  sections.push('')

  // Causal tendencies
  sections.push(
    'CAUSAL TENDENCIES:',
    `  Primary breakdown: ${profile.causal_tendencies.primary_breakdown}`,
    `  ${profile.causal_tendencies.description}`
  )
  for (const [stage, desc] of Object.entries(profile.causal_tendencies.specific_breakdowns)) {
    sections.push(`  ${stage}: ${desc}`)
  }
  sections.push('')

  // Value hierarchy
  sections.push(
    'VALUE HIERARCHY:',
    `  Top values: ${profile.value_hierarchy.explicit_top_values.join(', ')}`,
    `  Primary conflict: ${profile.value_hierarchy.primary_conflict}`,
    `  Classification gaps: ${profile.value_hierarchy.classification_gaps.join('; ')}`
  )
  sections.push('')

  // Oikeiosis map
  sections.push('OIKEIOSIS MAP:')
  for (const [circle, data] of Object.entries(profile.oikeiosis_map)) {
    sections.push(`  ${circle}: ${data.level} — ${data.evidence}`)
  }
  sections.push('')

  // Preferred indifferents
  sections.push(
    'PREFERRED INDIFFERENTS (treated as genuine goods):',
    `  ${profile.preferred_indifferents_aggregate.join(', ')}`
  )

  return sections.join('\n')
}
