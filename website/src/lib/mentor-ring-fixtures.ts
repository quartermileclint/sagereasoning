/**
 * mentor-ring-fixtures.ts — Hand-constructed MentorProfile for the ring proof
 *
 * PURPOSE: PR1 single-endpoint proof of the Ring Wrapper integration.
 *
 * The website's loadMentorProfile() returns MentorProfileData (defined in
 * mentor-profile-summary.ts). The Ring Wrapper expects MentorProfile (defined
 * in sage-mentor/persona.ts). The two shapes are not equivalent.
 *
 * Resolving that shape mismatch is a SEPARATELY SCOPED follow-up
 * (see decision-log: "FOLLOW-UP: Shape unification adapter", 25 Apr 2026).
 *
 * This fixture lets the proof exercise the ring end-to-end without
 * committing to an adapter shape we haven't agreed on yet.
 *
 * Status: TEMPORARY. Remove once the shape unification adapter lands.
 *
 * Decisions made for this fixture:
 *   - 1 persisting passion (so the ring's checkPassionPatterns has something
 *     to find when given matching keywords)
 *   - 1 indexed journal reference (so findRelevantJournalPassage has
 *     something to surface when given matching topic)
 *   - current_prescription set to null (avoids dependency on
 *     ProgressionPrescription construction for the proof)
 *   - All values plausible but explicitly fictional for the proof
 */

import type { MentorProfile, InteractionRecord } from '../../../sage-mentor'

export const PROOF_PROFILE: MentorProfile = {
  user_id: 'proof-fixture-user',
  display_name: 'Proof Practitioner',

  passion_map: [
    {
      passion_id: 'phobos-deadline-anxiety',
      sub_species: 'deadline anxiety',
      root_passion: 'phobos',
      false_judgement: 'A missed deadline would damage my standing — this is genuinely bad.',
      frequency: 'persistent',
      first_seen: '2026-01-15',
      last_seen: '2026-04-20',
      journal_references: ['proof-passage-1'],
    },
  ],

  causal_tendencies: [
    {
      failure_point: 'phantasia',
      description: 'Tends to accept first-pass impressions without examining whether the situation is genuinely good or bad.',
      frequency: 'common',
      examples: ['Reacts to deadline pressure as if the deadline were intrinsically harmful'],
    },
  ],

  value_hierarchy: [
    {
      item: 'professional reputation',
      declared_classification: 'preferred indifferent',
      observed_classification: 'genuine good',
      gap_detected: true,
      journal_references: ['proof-passage-1'],
    },
  ],

  oikeiosis_map: [
    {
      person_or_role: 'immediate family',
      relationship: 'household',
      oikeiosis_stage: 'household',
      reflection_frequency: 'often',
    },
  ],

  virtue_profile: [
    {
      domain: 'phronesis',
      strength: 'developing',
      evidence: 'Demonstrates willingness to examine reasoning when prompted; less consistent unprompted.',
      journal_references: ['proof-passage-1'],
    },
    {
      domain: 'sophrosyne',
      strength: 'gap',
      evidence: 'Pattern of urgency-driven decisions suggests temperance gap under pressure.',
      journal_references: ['proof-passage-1'],
    },
    {
      domain: 'andreia',
      strength: 'moderate',
      evidence: 'Faces difficult conversations but avoids the most uncomfortable ones.',
      journal_references: [],
    },
    {
      domain: 'dikaiosyne',
      strength: 'moderate',
      evidence: 'Considers others affected; sometimes narrowly.',
      journal_references: [],
    },
  ],

  senecan_grade: 'grade_3',
  proximity_level: 'deliberate',

  dimensions: {
    passion_reduction: 'developing',
    judgement_quality: 'developing',
    disposition_stability: 'emerging',
    oikeiosis_extension: 'developing',
  },

  direction_of_travel: 'improving',

  persisting_passions: ['deadline anxiety'],

  preferred_indifferents: ['professional reputation', 'project velocity'],

  journal_references: [
    {
      passage_id: 'proof-passage-1',
      journal_phase: 'phase_2',
      journal_day: 18,
      topic_tags: ['deadline', 'pressure', 'urgency'],
      summary: 'Reflection on how deadline pressure consistently triggers the same impression-assent-action chain.',
      relevance_triggers: ['deadline', 'urgent', 'pressure', 'rushed'],
    },
  ],

  current_prescription: null,

  last_interaction: '2026-04-20T12:00:00.000Z',
  interaction_count: 12,
}

/**
 * PROOF_INTERACTIONS — Hand-crafted InteractionRecord[] for the pattern-engine
 * proof.
 *
 * PURPOSE: PR1 single-endpoint proof of pattern-engine wiring. The fixtures
 * are sized so the deterministic detectors in pattern-engine.ts have enough
 * data to actually find patterns:
 *
 *   - Time-of-day bucket detector: needs ≥8 assessed interactions across
 *     ≥2 buckets, with avg-proximity gap ≥0.8.
 *   - Day-of-week detector: needs ≥10 with passions, with one day having
 *     a passion rate >1.5× overall AND >0.5.
 *   - Context-type detector: needs ≥10 total, ≥3 per context, with passion
 *     rate ≥0.6 in a context to fire.
 *   - Cluster detector: needs ≥2 co-occurrences of a passion pair.
 *   - Regression detector: requires PROOF_PROFILE.passion_map[] entries with
 *     last_seen >30d ago or frequency='rare' — currently false for the
 *     existing fixture, so regressions are NOT exercised by this proof.
 *     Documenting the omission so a future change can extend it.
 *
 * Status: TEMPORARY. Retires when the live mentor_interactions loader lands
 * (separately scoped — see "Pattern-engine loader" follow-up in decision log).
 *
 * Shape note: pattern-engine's InteractionRecord uses passions_detected of
 * shape {passion: string; false_judgement: string}[]. The live
 * mentor_interactions row uses {root_passion, sub_species, false_judgement}[].
 * The future loader must map between these shapes.
 */
export const PROOF_INTERACTIONS: InteractionRecord[] = [
  // ── Monday morning — career, deliberate ─────────────────────────────────
  {
    id: 'fixture-001',
    interaction_type: 'morning_check_in',
    description: 'Reviewed plans for the upcoming sprint and considered which tasks align with career priorities.',
    proximity_assessed: 'deliberate',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-13T08:30:00.000Z', // Monday 08:30 UTC — morning bucket
  },
  // ── Monday midday — financial, deliberate ───────────────────────────────
  {
    id: 'fixture-002',
    interaction_type: 'action_evaluation',
    description: 'Discussed budget allocation for Q2; weighed the cost of a new tool against expected revenue impact.',
    proximity_assessed: 'deliberate',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-13T13:15:00.000Z', // Monday 13:15 — midday bucket
  },
  // ── Monday evening — career, habitual, passion fires ────────────────────
  {
    id: 'fixture-003',
    interaction_type: 'evening_reflection',
    description: 'Felt mounting pressure about the deadline at work; reacted to the deadline as if it were intrinsically harmful.',
    proximity_assessed: 'habitual',
    passions_detected: [
      { passion: 'deadline anxiety', false_judgement: 'Missing the deadline would damage my standing — this is genuinely bad.' },
    ],
    mechanisms_applied: ['passion_diagnosis', 'control_filter'],
    created_at: '2026-04-13T19:45:00.000Z', // Monday 19:45 — evening bucket
  },
  // ── Tuesday morning — career, principled ────────────────────────────────
  {
    id: 'fixture-004',
    interaction_type: 'morning_check_in',
    description: 'Considered the day\'s work calmly; asked whether ambition was driving the schedule rather than what was actually needed.',
    proximity_assessed: 'principled',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment', 'passion_diagnosis'],
    created_at: '2026-04-14T07:50:00.000Z', // Tuesday 07:50 — morning
  },
  // ── Tuesday midday — financial, principled ──────────────────────────────
  {
    id: 'fixture-005',
    interaction_type: 'action_evaluation',
    description: 'Reviewed the budget projection again; recognised that the financial outcome is largely outside my direct control.',
    proximity_assessed: 'principled',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-14T12:30:00.000Z', // Tuesday 12:30 — midday
  },
  // ── Tuesday evening — career + financial, reflexive, two passions ───────
  {
    id: 'fixture-006',
    interaction_type: 'evening_reflection',
    description: 'Spiralled about a financial decision I made earlier and worried it might affect my career trajectory.',
    proximity_assessed: 'reflexive',
    passions_detected: [
      { passion: 'deadline anxiety', false_judgement: 'A poor outcome would prove I am not capable.' },
      { passion: 'financial loss aversion', false_judgement: 'A loss of money is a loss of safety.' },
    ],
    mechanisms_applied: ['passion_diagnosis', 'control_filter', 'value_assessment'],
    created_at: '2026-04-14T20:15:00.000Z', // Tuesday 20:15 — evening
  },
  // ── Wednesday morning — relationship, deliberate ────────────────────────
  {
    id: 'fixture-007',
    interaction_type: 'morning_check_in',
    description: 'Thought about how to approach a difficult conversation with a family member this evening.',
    proximity_assessed: 'deliberate',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-15T08:00:00.000Z', // Wednesday morning
  },
  // ── Wednesday evening — career, habitual, passion ───────────────────────
  {
    id: 'fixture-008',
    interaction_type: 'evening_reflection',
    description: 'Pressure about an upcoming deadline at work returned; reacted with the same urgent rushing as before.',
    proximity_assessed: 'habitual',
    passions_detected: [
      { passion: 'deadline anxiety', false_judgement: 'I have to push through tonight or it will be too late.' },
    ],
    mechanisms_applied: ['passion_diagnosis', 'control_filter'],
    created_at: '2026-04-15T18:30:00.000Z', // Wednesday evening
  },
  // ── Thursday midday — career, deliberate ────────────────────────────────
  {
    id: 'fixture-009',
    interaction_type: 'action_evaluation',
    description: 'Took on a new project commitment after weighing whether it served the team\'s actual priorities.',
    proximity_assessed: 'deliberate',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-16T14:00:00.000Z', // Thursday midday
  },
  // ── Thursday evening — career + financial, habitual, two passions ───────
  {
    id: 'fixture-010',
    interaction_type: 'evening_reflection',
    description: 'Worried about the budget and how a deadline slip would look professionally.',
    proximity_assessed: 'habitual',
    passions_detected: [
      { passion: 'deadline anxiety', false_judgement: 'How this looks to others is what matters.' },
      { passion: 'financial loss aversion', false_judgement: 'A budget overrun would prove I cannot manage money.' },
    ],
    mechanisms_applied: ['passion_diagnosis', 'control_filter', 'value_assessment'],
    created_at: '2026-04-16T19:00:00.000Z', // Thursday evening
  },
  // ── Friday morning — career, principled ─────────────────────────────────
  {
    id: 'fixture-011',
    interaction_type: 'morning_check_in',
    description: 'Started the day with an explicit reminder that career outcomes are preferred indifferents, not goods in themselves.',
    proximity_assessed: 'principled',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment', 'passion_diagnosis'],
    created_at: '2026-04-17T07:30:00.000Z', // Friday morning
  },
  // ── Friday midday — financial, deliberate ───────────────────────────────
  {
    id: 'fixture-012',
    interaction_type: 'action_evaluation',
    description: 'Considered a money decision deliberately; identified the impression and questioned the assent rather than reacting.',
    proximity_assessed: 'deliberate',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-17T12:45:00.000Z', // Friday midday
  },
  // ── Friday evening — career, reflexive, passion ─────────────────────────
  {
    id: 'fixture-013',
    interaction_type: 'evening_reflection',
    description: 'End of week deadline pressure spiked again; the same impression-assent-action chain played out.',
    proximity_assessed: 'reflexive',
    passions_detected: [
      { passion: 'deadline anxiety', false_judgement: 'The week ends badly if this is not done.' },
    ],
    mechanisms_applied: ['passion_diagnosis', 'control_filter'],
    created_at: '2026-04-17T21:00:00.000Z', // Friday evening
  },
  // ── Saturday night — relationship, habitual ─────────────────────────────
  {
    id: 'fixture-014',
    interaction_type: 'evening_reflection',
    description: 'A conversation with a friend left me thinking about whether I had been honest enough in the moment.',
    proximity_assessed: 'habitual',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-18T23:30:00.000Z', // Saturday night
  },
  // ── Sunday midday — financial, deliberate ───────────────────────────────
  {
    id: 'fixture-015',
    interaction_type: 'action_evaluation',
    description: 'Reviewed the week\'s spending; treated the review as data, not as a verdict on character.',
    proximity_assessed: 'deliberate',
    passions_detected: [],
    mechanisms_applied: ['control_filter', 'value_assessment'],
    created_at: '2026-04-19T13:00:00.000Z', // Sunday midday
  },
]
