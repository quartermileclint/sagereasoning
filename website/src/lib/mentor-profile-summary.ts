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

/**
 * Founder Facts — stable biographical context that persists across sessions.
 *
 * Definition moved to /sage-mentor/founder-facts.ts on 2026-04-25 under
 * ADR-Ring-2-01 Session 2 so the canonical MentorProfile (in
 * /sage-mentor/persona.ts) can reference the same type without sage-mentor
 * importing from /website/. Re-exported here so downstream consumers that
 * import via `@/lib/mentor-profile-summary` continue to work unchanged.
 */
export type { FounderFacts } from '../../../sage-mentor'
import type { FounderFacts, MentorProfile } from '../../../sage-mentor'

/**
 * The persisted website profile shape. Written by the journal-ingestion
 * pipeline; stored encrypted in `mentor_profiles.encrypted_profile`.
 *
 * Under ADR-Ring-2-01 (Adopted 25 April 2026) this shape is being retired
 * in favour of MentorProfile (defined in /sage-mentor/persona.ts). The
 * read-time conversion is handled by
 * /website/src/lib/mentor-profile-adapter.ts. Sessions 3–5 of the staged
 * transition migrate every consumer to MentorProfile and remove this type.
 *
 * Until then: any amendment to this shape should also touch the adapter
 * so the conversion stays current.
 */
export interface MentorProfileData {
  user_id: string
  display_name: string
  journal_name: string
  journal_period: string
  sections_processed: number
  entries_processed: number
  total_word_count: number
  /** Stable biographical context — who this person is as a person. Optional
   *  because older profiles may not have this field yet. */
  founder_facts?: FounderFacts
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
 *
 * Rewritten under ADR-Ring-2-01 Session 3 (25 April 2026) to consume the
 * canonical `MentorProfile` (defined in /sage-mentor/persona.ts) instead of
 * the legacy persisted `MentorProfileData`. Field-access translation table
 * lives in ADR §2.1 / §2.2.
 *
 * Key differences from the legacy implementation:
 *   - `proximity_estimate.{level,senecan_grade,description}` →
 *     `proximity_level`, `senecan_grade`, optional
 *     `proximity_estimate_description` (C-α field placement, ADR §6.1).
 *   - `passion_map[].frequency` is now the bucket string
 *     ('rare'|'occasional'|'recurring'|'persistent'), not the 1–12 count.
 *     The inline number-to-bucket mapping that lived at line 131 is retired
 *     (per Decision 3 of this session — `frequencyBucketFromCount` exported
 *     from /website/src/lib/mentor-profile-adapter.ts is the single source
 *     of truth and the rewrite no longer needs the conversion).
 *   - `passion_map[].false_judgements[]` (plural) →
 *     `passion_map[].false_judgement` (singular).
 *   - `passion_map[].max_intensity` and `sections_present` have no
 *     canonical equivalent; intensity is omitted from the per-passion line.
 *   - `virtue_profile` is an array of `VirtueDomainAssessment` (not a
 *     keyed Record). Iterated by `domain`/`strength`/`evidence`.
 *   - `causal_tendencies` is an array of `CausalTendency` (not a
 *     summary record). Iterated by `failure_point`/`description`.
 *   - `value_hierarchy` is an array of `ValueHierarchyEntry` (not a
 *     summary record). Top values = entries without `gap_detected`;
 *     classification gaps = entries with `gap_detected: true`.
 *   - `oikeiosis_map` is an array of `OikeioisMapEntry` (not a keyed
 *     Record). Iterated by `relationship`/`oikeiosis_stage`.
 *   - `preferred_indifferents_aggregate` → `preferred_indifferents`.
 *   - Website-only optional fields (`journal_name`, `journal_period`,
 *     `sections_processed`, `entries_processed`, `total_word_count`,
 *     `founder_facts`, `proximity_estimate_description`) are guarded —
 *     under C-α the canonical type may not carry them for un-seeded or
 *     un-migrated profiles.
 */
export function buildProfileSummary(profile: MentorProfile): string {
  const sections: string[] = []

  // Identity and scope (scope line is conditional — optional fields under C-α)
  sections.push(`PRACTITIONER PROFILE: ${profile.display_name}`)
  if (profile.journal_name || profile.journal_period) {
    sections.push(
      `Journal: ${profile.journal_name ?? 'n/a'} (${profile.journal_period ?? 'n/a'})`,
    )
  }
  if (
    typeof profile.sections_processed === 'number' ||
    typeof profile.entries_processed === 'number' ||
    typeof profile.total_word_count === 'number'
  ) {
    sections.push(
      `Scope: ${profile.sections_processed ?? 0} sections, ${profile.entries_processed ?? 0} entries, ${profile.total_word_count ?? 0} words`,
    )
  }
  sections.push('')

  // Founder Facts — stable biographical context (injected first so the mentor
  // knows who the person IS before reading their philosophical profile)
  if (profile.founder_facts) {
    const ff = profile.founder_facts
    sections.push(
      'WHO THIS PERSON IS:',
      `  Age ${ff.age}, married ${ff.years_married} years, children ages ${ff.children_ages.join(' and ')}`,
      `  Work: ${ff.work_schedule}`,
      `  Family: ${ff.family_situation}`,
      `  Financial: ${ff.financial_situation}`,
      `  Horizon: ${ff.retirement_horizon}`,
    )
    // Defensive: O-2B from Session 2 close — `additional_context` is typed as
    // required `string[]` on FounderFacts but older persisted rows may carry
    // `undefined`. Guard with `Array.isArray` so the rewrite tolerates the
    // pre-existing posture without changing the FounderFacts type.
    if (Array.isArray(ff.additional_context) && ff.additional_context.length > 0) {
      for (const note of ff.additional_context) {
        sections.push(`  • ${note}`)
      }
    }
    sections.push(`  (Last updated: ${ff.last_updated})`, '')
  }

  // Proximity and grade
  sections.push(
    `PROXIMITY ESTIMATE: ${profile.proximity_level}`,
    `Senecan grade: ${profile.senecan_grade}`,
  )
  if (profile.proximity_estimate_description) {
    sections.push(`Assessment: ${profile.proximity_estimate_description}`)
  }
  sections.push('')

  // Passion map (sorted by bucket — persistent first, then recurring,
  // occasional, rare). The bucket order is fixed; sorting is by index in the
  // ordered list rather than a numeric comparison.
  const BUCKET_ORDER: Record<MentorProfile['passion_map'][number]['frequency'], number> = {
    persistent: 0,
    recurring: 1,
    occasional: 2,
    rare: 3,
  }
  const sortedPassions = [...profile.passion_map].sort(
    (a, b) => BUCKET_ORDER[a.frequency] - BUCKET_ORDER[b.frequency],
  )
  sections.push('PASSION MAP (sorted by frequency bucket):')
  for (const p of sortedPassions) {
    sections.push(
      `  ${p.sub_species} (${p.root_passion}) — pattern: ${p.frequency}`,
      `    False judgement: ${p.false_judgement || 'n/a'}`,
    )
  }
  sections.push('')

  // Virtue profile (canonical: array of VirtueDomainAssessment)
  sections.push('VIRTUE PROFILE:')
  for (const v of profile.virtue_profile) {
    sections.push(
      `  ${v.domain}: ${v.strength}`,
      `    Evidence: ${v.evidence || 'n/a'}`,
    )
  }
  sections.push('')

  // Causal tendencies (canonical: array of CausalTendency)
  sections.push('CAUSAL TENDENCIES:')
  for (const t of profile.causal_tendencies) {
    sections.push(`  ${t.failure_point} (${t.frequency}): ${t.description}`)
  }
  sections.push('')

  // Value hierarchy (canonical: array of ValueHierarchyEntry).
  // Top values = entries without `gap_detected`; gaps = entries with it.
  const topValues = profile.value_hierarchy
    .filter((v) => !v.gap_detected)
    .map((v) => v.item)
  const valueGaps = profile.value_hierarchy.filter((v) => v.gap_detected)
  sections.push(
    'VALUE HIERARCHY:',
    `  Top values: ${topValues.join(', ') || 'none recorded'}`,
  )
  if (valueGaps.length > 0) {
    sections.push('  Classification gaps:')
    for (const g of valueGaps) {
      sections.push(
        `    "${g.item}" — declared ${g.declared_classification}, observed ${g.observed_classification}`,
      )
    }
  }
  sections.push('')

  // Oikeiosis map (canonical: array of OikeioisMapEntry)
  sections.push('OIKEIOSIS MAP:')
  for (const o of profile.oikeiosis_map) {
    sections.push(
      `  ${o.relationship} (${o.oikeiosis_stage}) — reflection ${o.reflection_frequency}`,
    )
  }
  sections.push('')

  // Preferred indifferents
  sections.push(
    'PREFERRED INDIFFERENTS (treated as genuine goods):',
    `  ${profile.preferred_indifferents.join(', ') || 'none recorded'}`,
  )

  return sections.join('\n')
}
