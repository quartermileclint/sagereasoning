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
 * Run: npx jest mentor-profile-summary --no-coverage
 */

import { buildProfileSummary } from '../mentor-profile-summary'
import type { MentorProfile } from '../../../../sage-mentor'

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

describe('buildProfileSummary (canonical MentorProfile input)', () => {
  let summary: string

  beforeAll(() => {
    summary = buildProfileSummary(SAMPLE_PROFILE)
  })

  it('returns a non-empty string', () => {
    expect(typeof summary).toBe('string')
    expect(summary.length).toBeGreaterThan(0)
  })

  it('contains every required section heading', () => {
    for (const heading of REQUIRED_HEADINGS) {
      expect(summary).toContain(heading)
    }
  })

  it('renders the practitioner display name in the identity line', () => {
    expect(summary).toContain('Sample Practitioner')
  })

  it('renders all canonical proximity fields without the legacy nested path', () => {
    expect(summary).toContain('deliberate')
    expect(summary).toContain('grade_3')
    expect(summary).toContain('Reasoning is deliberate when calm')
    // Legacy `proximity_estimate.<x>` field-access path should not appear in
    // the rewritten output's keys (these are output-text checks, not type
    // checks — but a regression that hardcodes the legacy path would surface).
    expect(summary).not.toMatch(/proximity_estimate\./)
  })

  it('renders each passion using the bucket string, not the legacy /12 count', () => {
    expect(summary).toContain('persistent')
    expect(summary).toContain('recurring')
    expect(summary).toContain('occasional')
    // Legacy implementation emitted `frequency: N/12` — must be gone.
    expect(summary).not.toMatch(/\/12/)
  })

  it('renders the founder-facts section when present', () => {
    expect(summary).toContain('Age 47')
    expect(summary).toContain('married 18 years')
    expect(summary).toContain('Recently relocated for family reasons.')
  })

  it('renders top values and classification gaps under VALUE HIERARCHY', () => {
    expect(summary).toContain('philosophical practice')
    expect(summary).toContain('family time')
    expect(summary).toContain('"professional reputation"')
    expect(summary).toContain('declared preferred indifferent')
    expect(summary).toContain('observed genuine good')
  })

  it('renders all four virtue domains', () => {
    expect(summary).toContain('phronesis')
    expect(summary).toContain('dikaiosyne')
    expect(summary).toContain('andreia')
    expect(summary).toContain('sophrosyne')
  })

  it('renders preferred indifferents from the canonical field name', () => {
    expect(summary).toContain('professional reputation')
    expect(summary).toContain('project velocity')
    expect(summary).toContain('recognition')
  })

  it('contains no `undefined` substrings (optional fields handled defensively)', () => {
    expect(summary).not.toContain('undefined')
  })
})

describe('buildProfileSummary — sparse profile (optional fields absent)', () => {
  it('renders without throwing when website-only optional fields are missing', () => {
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
    const summary = buildProfileSummary(sparse)
    expect(typeof summary).toBe('string')
    expect(summary).toContain('PRACTITIONER PROFILE:')
    expect(summary).toContain('PROXIMITY ESTIMATE:')
    // The optional sections should be absent rather than emitting `undefined`.
    expect(summary).not.toContain('undefined')
    expect(summary).not.toContain('WHO THIS PERSON IS:')
    expect(summary).not.toContain('Journal:')
    expect(summary).not.toContain('Scope:')
    // Assessment line is optional — should not appear when description absent.
    expect(summary).not.toContain('Assessment:')
  })
})
