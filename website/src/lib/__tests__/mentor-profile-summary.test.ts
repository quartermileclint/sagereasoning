/**
 * mentor-profile-summary.test.ts — Structural-completeness test for the
 * rewritten `buildProfileSummary(profile: MentorProfile): string`.
 *
 * PURPOSE: Drift-risk mitigation per ADR-Ring-2-01 §8.4 and Decision 4 of
 * Session 3 (25 April 2026). The rewrite changed `buildProfileSummary`'s
 * input type from the legacy `MentorProfileData` to the canonical
 * `MentorProfile`. This test exercises the rewritten function on a
 * structurally complete `MentorProfile` fixture and asserts the output
 * string contains every section heading the legacy implementation produced
 * (plus the new founder-facts section). It does NOT assert on specific
 * field values — only that the section structure is intact.
 *
 * SCOPE: Structural completeness. If a future amendment silently drops a
 * section (e.g., removing the OIKEIOSIS MAP heading by mistake), this test
 * fails. Specific philosophical or wording assertions are out of scope —
 * those belong with the live-probe of the migrated caller.
 *
 * Run: npx tsx <this file>
 */

import { buildProfileSummary } from '../mentor-profile-summary'
import type { MentorProfile } from '../../../../sage-mentor'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// ---------------------------------------------------------------------------
// Representative fixture — a structurally complete canonical MentorProfile.
// Values are illustrative; the test asserts on section headings and
// presence/absence of expected substrings, not on values themselves.
// ---------------------------------------------------------------------------

const SAMPLE_PROFILE: MentorProfile = {
  user_id: 'sample-user',
  display_name: 'Sample Practitioner',
  passion_map: [
    {
      passion_id: 'phobos-deadline',
      sub_species: 'fear of failing the deadline',
      root_passion: 'phobos',
      false_judgement: 'If I miss this, my reputation is finished.',
      frequency: 'persistent',
      first_seen: '2026-01-12',
      last_seen: '2026-04-20',
      journal_references: ['j-2026-01-12-a'],
    },
    {
      passion_id: 'lupe-loss',
      sub_species: 'sorrow at parting from old role',
      root_passion: 'lupe',
      false_judgement: 'My identity required that role.',
      frequency: 'recurring',
      first_seen: '2026-02-04',
      last_seen: '2026-04-15',
      journal_references: [],
    },
    {
      passion_id: 'epithumia-recognition',
      sub_species: 'craving for external recognition',
      root_passion: 'epithumia',
      false_judgement: 'I need them to see what I did.',
      frequency: 'occasional',
      first_seen: '2026-03-01',
      last_seen: '2026-04-10',
      journal_references: [],
    },
  ],
  causal_tendencies: [
    {
      failure_point: 'phantasia',
      description: 'Initial impressions are catastrophising under pressure.',
      frequency: 'common',
      examples: [],
    },
    {
      failure_point: 'synkatathesis',
      description: 'Assents quickly to first plausible interpretation.',
      frequency: 'occasional',
      examples: [],
    },
  ],
  value_hierarchy: [
    {
      item: 'philosophical practice',
      declared_classification: 'preferred indifferent',
      observed_classification: 'preferred indifferent',
      gap_detected: false,
      journal_references: [],
    },
    {
      item: 'family time',
      declared_classification: 'preferred indifferent',
      observed_classification: 'preferred indifferent',
      gap_detected: false,
      journal_references: [],
    },
    {
      item: 'professional reputation',
      declared_classification: 'preferred indifferent',
      observed_classification: 'genuine good',
      gap_detected: true,
      journal_references: [],
    },
  ],
  oikeiosis_map: [
    {
      person_or_role: 'self',
      relationship: 'self_preservation',
      oikeiosis_stage: 'self_preservation',
      reflection_frequency: 'often',
    },
    {
      person_or_role: 'household',
      relationship: 'household',
      oikeiosis_stage: 'household',
      reflection_frequency: 'often',
    },
    {
      person_or_role: 'community',
      relationship: 'community',
      oikeiosis_stage: 'community',
      reflection_frequency: 'sometimes',
    },
  ],
  virtue_profile: [
    {
      domain: 'phronesis',
      strength: 'developing',
      evidence: 'Reasons clearly when calm; rushes under pressure.',
      journal_references: [],
    },
    {
      domain: 'dikaiosyne',
      strength: 'moderate',
      evidence: 'Considers fairness in family decisions.',
      journal_references: [],
    },
    {
      domain: 'andreia',
      strength: 'developing',
      evidence: 'Begun naming fears explicitly in journal.',
      journal_references: [],
    },
    {
      domain: 'sophrosyne',
      strength: 'developing',
      evidence: 'Boundaries on work hours often eroded.',
      journal_references: [],
    },
  ],
  senecan_grade: 'grade_3',
  proximity_level: 'deliberate',
  dimensions: {
    passion_reduction: 'developing',
    judgement_quality: 'developing',
    disposition_stability: 'developing',
    oikeiosis_extension: 'developing',
  },
  direction_of_travel: 'stable',
  persisting_passions: ['fear of failing the deadline', 'sorrow at parting from old role'],
  preferred_indifferents: ['professional reputation', 'project velocity', 'recognition'],
  journal_references: [],
  current_prescription: null,
  last_interaction: '2026-04-25T10:00:00.000Z',
  interaction_count: 0,
  // Website-only optional fields (C-α)
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
  proximity_estimate_description: 'Reasoning is deliberate when calm; reflexive under pressure.',
}

// ---------------------------------------------------------------------------
// Section-heading checklist. Every heading the rewritten implementation is
// expected to emit when given a fully-populated profile. If a heading is
// removed or renamed, this test fails — drift-risk mitigation per
// ADR-Ring-2-01 §8.4.
// ---------------------------------------------------------------------------

const REQUIRED_HEADINGS: string[] = [
  'PRACTITIONER PROFILE:',
  'Journal:',
  'Scope:',
  'WHO THIS PERSON IS:',
  'PROXIMITY ESTIMATE:',
  'Senecan grade:',
  'Assessment:',
  'PASSION MAP (sorted by frequency bucket):',
  'VIRTUE PROFILE:',
  'CAUSAL TENDENCIES:',
  'VALUE HIERARCHY:',
  'OIKEIOSIS MAP:',
  'PREFERRED INDIFFERENTS (treated as genuine goods):',
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// describe('buildProfileSummary (canonical MentorProfile input)')
// beforeAll: compute the summary once for the populated-profile block.
const summary: string = buildProfileSummary(SAMPLE_PROFILE)

// it('returns a non-empty string')
assert(Object.is(typeof summary, 'string'), 'canonical input: returns a non-empty string — typeof is string')
assert(summary.length > 0, 'canonical input: returns a non-empty string — length > 0')

// it('contains every required section heading')
for (const heading of REQUIRED_HEADINGS) {
  assert(summary.includes(heading), 'canonical input: contains every required section heading — ' + heading)
}

// it('renders the practitioner display name in the identity line')
assert(summary.includes('Sample Practitioner'), 'canonical input: renders the practitioner display name in the identity line')

// it('renders all canonical proximity fields without the legacy nested path')
assert(summary.includes('deliberate'), 'canonical input: renders proximity fields — deliberate')
assert(summary.includes('grade_3'), 'canonical input: renders proximity fields — grade_3')
assert(summary.includes('Reasoning is deliberate when calm'), 'canonical input: renders proximity fields — estimate description')
// Legacy `proximity_estimate.<x>` field-access path should not appear in
// the rewritten output's keys.
assert(!(/proximity_estimate\./.test(summary)), 'canonical input: no legacy proximity_estimate. nested path')

// it('renders each passion using the bucket string, not the legacy /12 count')
assert(summary.includes('persistent'), 'canonical input: passion bucket — persistent')
assert(summary.includes('recurring'), 'canonical input: passion bucket — recurring')
assert(summary.includes('occasional'), 'canonical input: passion bucket — occasional')
// Legacy implementation emitted `frequency: N/12` — must be gone.
assert(!(/\/12/.test(summary)), 'canonical input: no legacy /12 count')

// it('renders the founder-facts section when present')
assert(summary.includes('Age 47'), 'canonical input: founder-facts — Age 47')
assert(summary.includes('married 18 years'), 'canonical input: founder-facts — married 18 years')
assert(summary.includes('Recently relocated for family reasons.'), 'canonical input: founder-facts — additional context')

// it('renders top values and classification gaps under VALUE HIERARCHY')
assert(summary.includes('philosophical practice'), 'canonical input: value hierarchy — philosophical practice')
assert(summary.includes('family time'), 'canonical input: value hierarchy — family time')
assert(summary.includes('"professional reputation"'), 'canonical input: value hierarchy — quoted professional reputation')
assert(summary.includes('declared preferred indifferent'), 'canonical input: value hierarchy — declared preferred indifferent')
assert(summary.includes('observed genuine good'), 'canonical input: value hierarchy — observed genuine good')

// it('renders all four virtue domains')
assert(summary.includes('phronesis'), 'canonical input: virtue domain — phronesis')
assert(summary.includes('dikaiosyne'), 'canonical input: virtue domain — dikaiosyne')
assert(summary.includes('andreia'), 'canonical input: virtue domain — andreia')
assert(summary.includes('sophrosyne'), 'canonical input: virtue domain — sophrosyne')

// it('renders preferred indifferents from the canonical field name')
assert(summary.includes('professional reputation'), 'canonical input: preferred indifferents — professional reputation')
assert(summary.includes('project velocity'), 'canonical input: preferred indifferents — project velocity')
assert(summary.includes('recognition'), 'canonical input: preferred indifferents — recognition')

// it('contains no `undefined` substrings (optional fields handled defensively)')
assert(!summary.includes('undefined'), 'canonical input: contains no undefined substrings')

// describe('buildProfileSummary — sparse profile (optional fields absent)')
// it('renders without throwing when website-only optional fields are missing')
{
  const sparse: MentorProfile = {
    ...SAMPLE_PROFILE,
    journal_name: undefined,
    journal_period: undefined,
    sections_processed: undefined,
    entries_processed: undefined,
    total_word_count: undefined,
    founder_facts: undefined,
    proximity_estimate_description: undefined,
  }
  const sparseSummary = buildProfileSummary(sparse)
  assert(Object.is(typeof sparseSummary, 'string'), 'sparse profile: returns a string')
  assert(sparseSummary.includes('PRACTITIONER PROFILE:'), 'sparse profile: contains PRACTITIONER PROFILE:')
  assert(sparseSummary.includes('PROXIMITY ESTIMATE:'), 'sparse profile: contains PROXIMITY ESTIMATE:')
  // The optional sections should be absent rather than emitting `undefined`.
  assert(!sparseSummary.includes('undefined'), 'sparse profile: contains no undefined substrings')
  assert(!sparseSummary.includes('WHO THIS PERSON IS:'), 'sparse profile: omits WHO THIS PERSON IS:')
  assert(!sparseSummary.includes('Journal:'), 'sparse profile: omits Journal:')
  assert(!sparseSummary.includes('Scope:'), 'sparse profile: omits Scope:')
  // Assessment line is optional — should not appear when description absent.
  assert(!sparseSummary.includes('Assessment:'), 'sparse profile: omits Assessment:')
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
