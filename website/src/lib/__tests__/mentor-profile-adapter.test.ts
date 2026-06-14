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
 * Run: npx tsx src/lib/__tests__/mentor-profile-adapter.test.ts
 */

import {
  adaptMentorProfileDataToCanonical,
  frequencyBucketFromCount,
  type MentorProfileData,
} from '../mentor-profile-adapter'
import type { MentorProfile } from '../../../../sage-mentor'
import { isDeepStrictEqual } from 'node:util'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

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
  founder_facts: {
    age: 47,
    years_married: 18,
    children_ages: [12, 9],
    work_schedule: 'Mon–Fri, ~8h/day',
    family_situation: 'Two children at school; spouse working part-time.',
    financial_situation: 'Stable income; mortgage two-thirds paid.',
    retirement_horizon: '~18 years.',
    additional_context: ['Recently relocated for family reasons.'],
    last_updated: '2026-04-01T00:00:00.000Z',
  },
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

// describe('frequencyBucketFromCount')

// it('maps boundary counts to the documented buckets')
{
  assert(Object.is(frequencyBucketFromCount(1), 'rare'), 'frequencyBucketFromCount: maps boundary counts — 1 → rare')
  assert(Object.is(frequencyBucketFromCount(2), 'occasional'), 'frequencyBucketFromCount: maps boundary counts — 2 → occasional')
  assert(Object.is(frequencyBucketFromCount(3), 'occasional'), 'frequencyBucketFromCount: maps boundary counts — 3 → occasional')
  assert(Object.is(frequencyBucketFromCount(4), 'recurring'), 'frequencyBucketFromCount: maps boundary counts — 4 → recurring')
  assert(Object.is(frequencyBucketFromCount(6), 'recurring'), 'frequencyBucketFromCount: maps boundary counts — 6 → recurring')
  assert(Object.is(frequencyBucketFromCount(7), 'persistent'), 'frequencyBucketFromCount: maps boundary counts — 7 → persistent')
  assert(Object.is(frequencyBucketFromCount(12), 'persistent'), 'frequencyBucketFromCount: maps boundary counts — 12 → persistent')
}

// it('clamps out-of-range values to the nearest bucket without throwing')
{
  assert(Object.is(frequencyBucketFromCount(0), 'rare'), 'frequencyBucketFromCount: clamps out-of-range — 0 → rare')
  assert(Object.is(frequencyBucketFromCount(-3), 'rare'), 'frequencyBucketFromCount: clamps out-of-range — -3 → rare')
  assert(Object.is(frequencyBucketFromCount(99), 'persistent'), 'frequencyBucketFromCount: clamps out-of-range — 99 → persistent')
}

// it('survives non-numeric and non-finite input')
{
  // @ts-expect-error — testing runtime safety against malformed input
  assert(Object.is(frequencyBucketFromCount('not a number'), 'rare'), 'frequencyBucketFromCount: survives non-numeric — "not a number" → rare')
  assert(Object.is(frequencyBucketFromCount(NaN), 'rare'), 'frequencyBucketFromCount: survives non-finite — NaN → rare')
  assert(Object.is(frequencyBucketFromCount(Infinity), 'rare'), 'frequencyBucketFromCount: survives non-finite — Infinity → rare')
}

// describe('adaptMentorProfileDataToCanonical')

// beforeAll
const result: MentorProfile = adaptMentorProfileDataToCanonical(SAMPLE_INPUT, {
  lastUpdated: '2026-04-25T10:00:00.000Z',
})

// it('returns an object with every required top-level key')
{
  for (const key of REQUIRED_TOP_LEVEL_KEYS) {
    assert(key in (result as object), 'adaptMentorProfileDataToCanonical: returns object with every required top-level key — has ' + String(key))
  }
}

// it('preserves identity fields directly')
{
  assert(Object.is(result.user_id, 'sample-user'), 'adaptMentorProfileDataToCanonical: preserves identity fields — user_id')
  assert(Object.is(result.display_name, 'Sample Practitioner'), 'adaptMentorProfileDataToCanonical: preserves identity fields — display_name')
}

// it('converts passion_map entries with frequency-bucket mapping')
{
  assert(Object.is(result.passion_map.length, 3), 'adaptMentorProfileDataToCanonical: converts passion_map — length 3')
  const persistent = result.passion_map.find((p) => p.passion_id === 'phobos-deadline')
  const recurring = result.passion_map.find((p) => p.passion_id === 'lupe-loss')
  const rare = result.passion_map.find((p) => p.passion_id === 'epithumia-status')
  assert(Object.is(persistent?.frequency, 'persistent'), 'adaptMentorProfileDataToCanonical: converts passion_map — persistent.frequency')
  assert(Object.is(recurring?.frequency, 'recurring'), 'adaptMentorProfileDataToCanonical: converts passion_map — recurring.frequency')
  assert(Object.is(rare?.frequency, 'rare'), 'adaptMentorProfileDataToCanonical: converts passion_map — rare.frequency')
  assert(Object.is(persistent?.false_judgement, 'Missing the deadline would damage my standing.'), 'adaptMentorProfileDataToCanonical: converts passion_map — persistent.false_judgement')
}

// it('derives persisting_passions from recurring/persistent entries only')
{
  assert(result.persisting_passions.includes('deadline anxiety'), 'adaptMentorProfileDataToCanonical: derives persisting_passions — contains "deadline anxiety"')
  assert(result.persisting_passions.includes('financial loss aversion'), 'adaptMentorProfileDataToCanonical: derives persisting_passions — contains "financial loss aversion"')
  assert(!result.persisting_passions.includes('status seeking'), 'adaptMentorProfileDataToCanonical: derives persisting_passions — does NOT contain "status seeking"')
}

// it('converts causal_tendencies record into an array with valid failure_points')
{
  assert(Object.is(Array.isArray(result.causal_tendencies), true), 'adaptMentorProfileDataToCanonical: converts causal_tendencies — is array')
  assert(result.causal_tendencies.length >= 1, 'adaptMentorProfileDataToCanonical: converts causal_tendencies — length >= 1')
  const failurePoints = result.causal_tendencies.map((c) => c.failure_point)
  assert(failurePoints.includes('phantasia'), 'adaptMentorProfileDataToCanonical: converts causal_tendencies — failure_points contains "phantasia"')
}

// it('converts value_hierarchy with declared/observed split and gap_detected flags')
{
  assert(Object.is(Array.isArray(result.value_hierarchy), true), 'adaptMentorProfileDataToCanonical: converts value_hierarchy — is array')
  const familyEntry = result.value_hierarchy.find((v) => v.item === 'family')
  const gapEntry = result.value_hierarchy.find((v) => v.item === 'professional reputation')
  assert(Object.is(familyEntry?.gap_detected, false), 'adaptMentorProfileDataToCanonical: converts value_hierarchy — family gap_detected false')
  assert(Object.is(gapEntry?.gap_detected, true), 'adaptMentorProfileDataToCanonical: converts value_hierarchy — gap gap_detected true')
  assert(Object.is(gapEntry?.observed_classification, 'genuine good'), 'adaptMentorProfileDataToCanonical: converts value_hierarchy — gap observed_classification "genuine good"')
}

// it('converts oikeiosis_map into an array with valid stages')
{
  assert(Object.is(Array.isArray(result.oikeiosis_map), true), 'adaptMentorProfileDataToCanonical: converts oikeiosis_map — is array')
  const stages = result.oikeiosis_map.map((o) => o.oikeiosis_stage)
  assert(stages.includes('self_preservation'), 'adaptMentorProfileDataToCanonical: converts oikeiosis_map — stages contains "self_preservation"')
  assert(stages.includes('household'), 'adaptMentorProfileDataToCanonical: converts oikeiosis_map — stages contains "household"')
  assert(stages.includes('community'), 'adaptMentorProfileDataToCanonical: converts oikeiosis_map — stages contains "community"')
}

// it('converts virtue_profile into an array with all four virtue domains')
{
  assert(Object.is(Array.isArray(result.virtue_profile), true), 'adaptMentorProfileDataToCanonical: converts virtue_profile — is array')
  const domains = result.virtue_profile.map((v) => v.domain)
  assert(domains.includes('phronesis'), 'adaptMentorProfileDataToCanonical: converts virtue_profile — domains contains "phronesis"')
  assert(domains.includes('sophrosyne'), 'adaptMentorProfileDataToCanonical: converts virtue_profile — domains contains "sophrosyne"')
  assert(domains.includes('andreia'), 'adaptMentorProfileDataToCanonical: converts virtue_profile — domains contains "andreia"')
  assert(domains.includes('dikaiosyne'), 'adaptMentorProfileDataToCanonical: converts virtue_profile — domains contains "dikaiosyne"')
}

// it('derives senecan_grade and proximity_level from proximity_estimate')
{
  assert(Object.is(result.senecan_grade, 'grade_3'), 'adaptMentorProfileDataToCanonical: derives senecan_grade — grade_3')
  assert(Object.is(result.proximity_level, 'deliberate'), 'adaptMentorProfileDataToCanonical: derives proximity_level — deliberate')
}

// it('populates dimensions with the documented honest sentinels')
{
  for (const key of REQUIRED_DIMENSION_KEYS) {
    assert(Object.is(result.dimensions[key], 'developing'), 'adaptMentorProfileDataToCanonical: populates dimensions — ' + String(key) + ' === "developing"')
  }
}

// it('uses honest sentinels for sage-only fields not present in MentorProfileData')
{
  assert(result.current_prescription === null, 'adaptMentorProfileDataToCanonical: honest sentinels — current_prescription null')
  assert(Object.is(result.direction_of_travel, 'stable'), 'adaptMentorProfileDataToCanonical: honest sentinels — direction_of_travel "stable"')
  assert(Object.is(result.interaction_count, 0), 'adaptMentorProfileDataToCanonical: honest sentinels — interaction_count 0')
  assert(isDeepStrictEqual(result.journal_references, []), 'adaptMentorProfileDataToCanonical: honest sentinels — journal_references []')
  assert(Object.is(result.last_interaction, '2026-04-25T10:00:00.000Z'), 'adaptMentorProfileDataToCanonical: honest sentinels — last_interaction')
}

// it('falls back to "not yet recorded" when no lastUpdated meta is provided')
{
  const noMeta = adaptMentorProfileDataToCanonical(SAMPLE_INPUT)
  assert(Object.is(noMeta.last_interaction, 'not yet recorded'), 'adaptMentorProfileDataToCanonical: falls back to "not yet recorded" when no lastUpdated meta')
}

// it('forwards preferred_indifferents from the aggregate field')
{
  assert(result.preferred_indifferents.includes('professional reputation'), 'adaptMentorProfileDataToCanonical: forwards preferred_indifferents — contains "professional reputation"')
  assert(result.preferred_indifferents.includes('project velocity'), 'adaptMentorProfileDataToCanonical: forwards preferred_indifferents — contains "project velocity"')
  assert(result.preferred_indifferents.includes('recognition'), 'adaptMentorProfileDataToCanonical: forwards preferred_indifferents — contains "recognition"')
}

// it('passes through the seven website-only optional fields (ADR-Ring-2-01 Session 2 — C-α)')
{
  // Provenance fields
  assert(Object.is(result.journal_name, 'Sample Journal'), 'adaptMentorProfileDataToCanonical: passes through website-only — journal_name')
  assert(Object.is(result.journal_period, '2026-Q1'), 'adaptMentorProfileDataToCanonical: passes through website-only — journal_period')
  assert(Object.is(result.sections_processed, 4), 'adaptMentorProfileDataToCanonical: passes through website-only — sections_processed')
  assert(Object.is(result.entries_processed, 28), 'adaptMentorProfileDataToCanonical: passes through website-only — entries_processed')
  assert(Object.is(result.total_word_count, 12_345), 'adaptMentorProfileDataToCanonical: passes through website-only — total_word_count')

  // Biographical context
  assert(result.founder_facts !== undefined, 'adaptMentorProfileDataToCanonical: passes through website-only — founder_facts defined')
  assert(Object.is(result.founder_facts?.age, 47), 'adaptMentorProfileDataToCanonical: passes through website-only — founder_facts.age')
  assert(Object.is(result.founder_facts?.years_married, 18), 'adaptMentorProfileDataToCanonical: passes through website-only — founder_facts.years_married')
  assert(isDeepStrictEqual(result.founder_facts?.children_ages, [12, 9]), 'adaptMentorProfileDataToCanonical: passes through website-only — founder_facts.children_ages')
  assert(isDeepStrictEqual(result.founder_facts?.additional_context, [
    'Recently relocated for family reasons.',
  ]), 'adaptMentorProfileDataToCanonical: passes through website-only — founder_facts.additional_context')

  // Flat proximity description (per ADR §12 Session 2 — not a sub-object)
  assert(Object.is(result.proximity_estimate_description,
    'Reasoning is deliberate when calm; reflexive under pressure.'),
    'adaptMentorProfileDataToCanonical: passes through website-only — proximity_estimate_description')
}

// it('survives a sparse input (empty arrays, missing optional fields) without throwing')
{
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
  assert(isDeepStrictEqual(out.passion_map, []), 'adaptMentorProfileDataToCanonical: survives sparse — passion_map []')
  assert(isDeepStrictEqual(out.persisting_passions, []), 'adaptMentorProfileDataToCanonical: survives sparse — persisting_passions []')
  assert(isDeepStrictEqual(out.virtue_profile, []), 'adaptMentorProfileDataToCanonical: survives sparse — virtue_profile []')
  assert(Object.is(out.proximity_level, 'reflexive'), 'adaptMentorProfileDataToCanonical: survives sparse — proximity_level default "reflexive"')
  assert(Object.is(out.senecan_grade, 'pre_progress'), 'adaptMentorProfileDataToCanonical: survives sparse — senecan_grade default "pre_progress"')
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
