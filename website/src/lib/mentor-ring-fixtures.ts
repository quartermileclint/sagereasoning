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

import type { MentorProfile } from '../../../sage-mentor'

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
