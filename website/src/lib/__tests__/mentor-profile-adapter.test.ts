/**
 * mentor-profile-adapter.test.ts — Structural-completeness test for the
 * read-time MentorProfileData → MentorProfile adapter.
 *
 * PURPOSE: Drift-risk mitigation per ADR-Ring-2-01 §8.4. While both type
 * definitions coexist (Sessions 1–5), this test exercises the adapter on a
 * representative MentorProfileData input and asserts the resulting
 * MentorProfile is structurally complete — every required canonical field
 * is present and reachable. Catches regressions at compile + run time.
 *
 * SCOPE: Structural completeness, not philosophical correctness. The test
 * verifies "the adapter produces a valid MentorProfile" — not "the adapter
 * captures every nuance of the persisted data". The latter is for the
 * live-probe verification at the end of Session 1.
 *
 * Run: npx jest mentor-profile-adapter --no-coverage
 */

import {
  adaptMentorProfileDataToCanonical,
  frequencyBucketFromCount,
} from '../mentor-profile-adapter'
import type { MentorProfileData } from '../mentor-profile-summary'
import type { MentorProfile } from '../../../../sage-mentor'

// ---------------------------------------------------------------------------
// Representative input — covers every field the adapter reads.
// Numbers and strings are deliberate so the assertions can target them.
// ---------------------------------------------------------------------------

const SAMPLE_INPUT: MentorProfileData = {
  user_id: 'sample-user',
  display_name: 'Sample Practitioner',
  journal_name: 'Sample Journal',
  journal_period: '2026-Q1',
  sections_processed: 4,
  entries_processed: 28,
  total_word_count: 12_345,
  passion_map: [
    {
      passion_id: 'phobos-deadline',
      sub_species: 'deadline anxiety',
      root_passion: 'phobos',
      frequency: 8, // → 'persistent'
      max_intensity: 'strong',
      sections_present: ['week-1', 'week-2'],
      false_judgements: [
        'Missing the deadline would damage my standing.',
        'Quality matters less than punctuality.',
      ],
    },
    {
      passion_id: 'lupe-loss',
      sub_species: 'financial loss aversion',
      root_passion: 'lupe',
      frequency: 5, // → 'recurring'
      max_intensity: 'moderate',
      sections_present: ['week-2'],
      false_judgements: ['A loss of money is a loss of safety.'],
    },
    {
      passion_id: 'epithumia-status',
      sub_species: 'status seeking',
      root_passion: 'epithumia',
      frequency: 1, // → 'rare' (does NOT promote to persisting_passions)
      max_intensity: 'mild',
      sections_present: ['week-1'],
      false_judgements: ['Recognition validates my work.'],
    },
  ],
  virtue_profile: {
    phronesis: { overall_strength: 'developing', observations_count: 3, evidence_summary: ['Examines reasoning when prompted.'] },
    sophrosyne: { overall_strength: 'gap', observations_count: 5, evidence_summary: ['Urgency-driven decisions under pressure.'] },
    andreia: { overall_strength: 'moderate', observations_count: 2, evidence_summary: ['Faces difficult conversations.'] },
    dikaiosyne: { overall_strength: 'moderate', observations_count: 2, evidence_summary: ['Considers others affected.'] },
  },
  causal_tendencies: {
    primary_breakdown: 'phantasia',
    description: 'Accepts first-pass impressions without examining them.',
    specific_breakdowns: {
      synkatathesis: 'Assents quickly to anxiety-coloured impressions.',
      praxis: 'Action follows assent without pause.',
    },
  },
  value_hierarchy: {
    explicit_top_values: ['family', 'integrity'],
    primary_conflict: 'reputation vs presence',
    classification_gaps: ['professional reputation'],
  },
  oikeiosis_map: {
    self_preservation: { level: 'often', evidence: 'Daily morning check-ins on disposition.' },
    household: { level: 'often', evidence: 'Weekly conversations about decisions affecting family.' },
    community: { level: 'sometimes', evidence: 'Considers users affected by product choices.' },
  },
  proximity_estimate: {
    level: 'deliberate',
    senecan_grade: 'grade_3',
    description: 'Reasoning is deliberate when calm; reflexive under pressure.',
  },
  preferred_indifferents_aggregate: ['professional reputation', 'project velocity', 'recognition'],
}

// ---------------------------------------------------------------------------
// Required-key assertion table for the canonical MentorProfile shape.
// If MentorProfile gains a required field in the future, this list must be
// updated — and the adapter must populate it.
// ---------------------------------------------------------------------------

const REQUIRED_TOP_LEVEL_KEYS: Array<keyof MentorProfile> = [
  'user_id',
  'display_name',
  'passion_map',
  'causal_tendencies',
  'value_hierarchy',
  'oikeiosis_map',
  'virtue_profile',
  'senecan_grade',
  'proximity_level',
  'dimensions',
  'direction_of_travel',
  'persisting_passions',
  'preferred_indifferents',
  'journal_references',
  'current_prescription',
  'last_interaction',
  'interaction_count',
]

const REQUIRED_DIMENSION_KEYS: Array<keyof MentorProfile['dimensions']> = [
  'passion_reduction',
  'judgement_quality',
  'disposition_stability',
  'oikeiosis_extension',
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('frequencyBucketFromCount', () => {
  it('maps boundary counts to the documented buckets', () => {
    expect(frequencyBucketFromCount(1)).toBe('rare')
    expect(frequencyBucketFromCount(2)).toBe('occasional')
    expect(frequencyBucketFromCount(3)).toBe('occasional')
    expect(frequencyBucketFromCount(4)).toBe('recurring')
    expect(frequencyBucketFromCount(6)).toBe('recurring')
    expect(frequencyBucketFromCount(7)).toBe('persistent')
    expect(frequencyBucketFromCount(12)).toBe('persistent')
  })

  it('clamps out-of-range values to the nearest bucket without throwing', () => {
    expect(frequencyBucketFromCount(0)).toBe('rare')
    expect(frequencyBucketFromCount(-3)).toBe('rare')
    expect(frequencyBucketFromCount(99)).toBe('persistent')
  })

  it('survives non-numeric and non-finite input', () => {
    // @ts-expect-error — testing runtime safety against malformed input
    expect(frequencyBucketFromCount('not a number')).toBe('rare')
    expect(frequencyBucketFromCount(NaN)).toBe('rare')
    expect(frequencyBucketFromCount(Infinity)).toBe('rare')
  })
})

describe('adaptMentorProfileDataToCanonical', () => {
  let result: MentorProfile

  beforeAll(() => {
    result = adaptMentorProfileDataToCanonical(SAMPLE_INPUT, {
      lastUpdated: '2026-04-25T10:00:00.000Z',
    })
  })

  it('returns an object with every required top-level key', () => {
    for (const key of REQUIRED_TOP_LEVEL_KEYS) {
      expect(result).toHaveProperty(key)
    }
  })

  it('preserves identity fields directly', () => {
    expect(result.user_id).toBe('sample-user')
    expect(result.display_name).toBe('Sample Practitioner')
  })

  it('converts passion_map entries with frequency-bucket mapping', () => {
    expect(result.passion_map.length).toBe(3)
    const persistent = result.passion_map.find((p) => p.passion_id === 'phobos-deadline')
    const recurring = result.passion_map.find((p) => p.passion_id === 'lupe-loss')
    const rare = result.passion_map.find((p) => p.passion_id === 'epithumia-status')
    expect(persistent?.frequency).toBe('persistent')
    expect(recurring?.frequency).toBe('recurring')
    expect(rare?.frequency).toBe('rare')
    expect(persistent?.false_judgement).toBe('Missing the deadline would damage my standing.')
  })

  it('derives persisting_passions from recurring/persistent entries only', () => {
    expect(result.persisting_passions).toEqual(
      expect.arrayContaining(['deadline anxiety', 'financial loss aversion']),
    )
    expect(result.persisting_passions).not.toContain('status seeking')
  })

  it('converts causal_tendencies record into an array with valid failure_points', () => {
    expect(Array.isArray(result.causal_tendencies)).toBe(true)
    expect(result.causal_tendencies.length).toBeGreaterThanOrEqual(1)
    const failurePoints = result.causal_tendencies.map((c) => c.failure_point)
    expect(failurePoints).toEqual(expect.arrayContaining(['phantasia']))
  })

  it('converts value_hierarchy with declared/observed split and gap_detected flags', () => {
    expect(Array.isArray(result.value_hierarchy)).toBe(true)
    const familyEntry = result.value_hierarchy.find((v) => v.item === 'family')
    const gapEntry = result.value_hierarchy.find((v) => v.item === 'professional reputation')
    expect(familyEntry?.gap_detected).toBe(false)
    expect(gapEntry?.gap_detected).toBe(true)
    expect(gapEntry?.observed_classification).toBe('genuine good')
  })

  it('converts oikeiosis_map into an array with valid stages', () => {
    expect(Array.isArray(result.oikeiosis_map)).toBe(true)
    const stages = result.oikeiosis_map.map((o) => o.oikeiosis_stage)
    expect(stages).toEqual(expect.arrayContaining(['self_preservation', 'household', 'community']))
  })

  it('converts virtue_profile into an array with all four virtue domains', () => {
    expect(Array.isArray(result.virtue_profile)).toBe(true)
    const domains = result.virtue_profile.map((v) => v.domain)
    expect(domains).toEqual(
      expect.arrayContaining(['phronesis', 'sophrosyne', 'andreia', 'dikaiosyne']),
    )
  })

  it('derives senecan_grade and proximity_level from proximity_estimate', () => {
    expect(result.senecan_grade).toBe('grade_3')
    expect(result.proximity_level).toBe('deliberate')
  })

  it('populates dimensions with the documented honest sentinels', () => {
    for (const key of REQUIRED_DIMENSION_KEYS) {
      expect(result.dimensions[key]).toBe('developing')
    }
  })

  it('uses honest sentinels for sage-only fields not present in MentorProfileData', () => {
    expect(result.current_prescription).toBeNull()
    expect(result.direction_of_travel).toBe('stable')
    expect(result.interaction_count).toBe(0)
    expect(result.journal_references).toEqual([])
    expect(result.last_interaction).toBe('2026-04-25T10:00:00.000Z')
  })

  it('falls back to "not yet recorded" when no lastUpdated meta is provided', () => {
    const noMeta = adaptMentorProfileDataToCanonical(SAMPLE_INPUT)
    expect(noMeta.last_interaction).toBe('not yet recorded')
  })

  it('forwards preferred_indifferents from the aggregate field', () => {
    expect(result.preferred_indifferents).toEqual(
      expect.arrayContaining(['professional reputation', 'project velocity', 'recognition']),
    )
  })

  it('survives a sparse input (empty arrays, missing optional fields) without throwing', () => {
    const sparse: MentorProfileData = {
      user_id: 'sparse-user',
      display_name: 'Sparse',
      journal_name: '',
      journal_period: '',
      sections_processed: 0,
      entries_processed: 0,
      total_word_count: 0,
      passion_map: [],
      virtue_profile: {},
      causal_tendencies: { primary_breakdown: '', description: '', specific_breakdowns: {} },
      value_hierarchy: { explicit_top_values: [], primary_conflict: '', classification_gaps: [] },
      oikeiosis_map: {},
      proximity_estimate: { level: '', senecan_grade: '', description: '' },
      preferred_indifferents_aggregate: [],
    }
    const out = adaptMentorProfileDataToCanonical(sparse)
    expect(out.passion_map).toEqual([])
    expect(out.persisting_passions).toEqual([])
    expect(out.virtue_profile).toEqual([])
    expect(out.proximity_level).toBe('reflexive') // default
    expect(out.senecan_grade).toBe('pre_progress') // default
  })
})
