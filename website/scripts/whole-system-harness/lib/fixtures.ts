/**
 * fixtures.ts — a known-valid synthetic SignedLayer2Assessment for the
 * BUILD-ONLY bridge tsx step.
 *
 * The Layer2Assessment below is copied VERBATIM from the bridge's own test
 * fixture (src/lib/substrate/__tests__/sage-assent-bridge.test.ts FULL_ASSESSMENT)
 * — a known type-valid, bridge-relevant-field-populated assessment. PR15:
 * reuse the proven fixture rather than hand-authoring the deep nested type.
 *
 * This is a STRUCTURAL fixture (proves the bridge mapping), distinct from the
 * L7 scenario input in scenario-input.ts (which drives the live /api/reason
 * call). Build-only mode does not call /api/reason, so the bridge step needs a
 * stand-in signed assessment; the LIVE run replaces this whole object with the
 * real signed assessment returned by /api/reason.
 *
 * The `signature` is a FIXED synthetic string — NOT a real Ed25519 signature.
 * deriveReceiptId only hashes the string, so a fixed value yields a
 * deterministic, run-to-run-reproducible receipt_id. It is never verified
 * cryptographically in build-only mode.
 *
 * KEEP IN SYNC: if the bridge test's FULL_ASSESSMENT shape changes, re-port here.
 */

import type { Layer2Assessment } from '../../../src/lib/translation-sandwich/layer2-mechanisms'
import type { SignedLayer2Assessment } from '../../../src/lib/translation-sandwich/layer2-signer'

export const SYNTHETIC_LAYER2_ASSESSMENT: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [
      {
        id: 'p1',
        name: 'Anguished anxiety over peer response',
        root_passion: 'phobos',
        sub_species: 'agonia',
        false_judgement: 'The absence of a peer response is evidence of failure.',
        correct_judgement: "Another's response is a preferred indifferent.",
        causal_stage_affected: 'synkatathesis',
        evidence: 'I keep checking the team channel after I post.',
      },
      {
        id: 'p2',
        name: 'Hesitation before the next post',
        root_passion: 'phobos',
        // NULL sub_species — exercises the null → '' narrowing in the bridge.
        sub_species: null,
        false_judgement: 'Posting again will bring the same evil.',
        correct_judgement: 'Right action proceeds from judgement, not fear.',
        causal_stage_affected: 'horme',
        evidence: 'I tell myself it does not matter while still checking.',
      },
    ],
    false_judgements: ['The absence of a peer response is evidence of failure.'],
    correct_judgements: ["Another's response is a preferred indifferent."],
    causal_stage_affected: 'synkatathesis',
  },
  control_filter: {
    within_prohairesis: [
      {
        item: 'the quality of my own work',
        agent_named_position: 'within',
        classification: 'within',
        reasoning: 'agent_identified_within',
      },
    ],
    outside_prohairesis: [
      {
        item: 'peer response timing',
        agent_named_position: 'outside',
        classification: 'outside',
        reasoning: 'agent_identified_outside',
      },
    ],
    disambiguation_required: [],
  },
  oikeiosis: {
    relevant_circles: [
      {
        stage: 2,
        circle: 'household',
        description: 'immediate dependents',
        honourability_grade: 3,
        advantageousness_grade: 2,
        cicero_verdict: 'honourable_prevails',
        obligation_met: true,
        tension: null,
      },
      {
        stage: 3,
        circle: 'local_community',
        description: 'colleagues on the team channel',
        honourability_grade: 2,
        advantageousness_grade: 2,
        cicero_verdict: 'balanced_neither_decisive',
        obligation_met: false,
        tension: 'work obligation versus relational impulse',
      },
    ],
    deliberation_notes: 'The household obligation is being fulfilled.',
  },
  value_assessment: {
    indifferents_at_stake: [
      {
        name: 'reputation',
        axia: 'low',
        treated_as: 'evil',
        evidence: 'I feel the dip when no one has responded.',
        error: 'a low-worth dispreferred indifferent mis-categorised as evil',
      },
    ],
    value_error: 'Peer recognition is treated as more than it is.',
  },
  kathekon_assessment: {
    is_kathekon: false,
    quality: 'marginal',
    justification: 'The post-submission checking pattern is not appropriate action.',
  },
  iterative_refinement: {
    senecan_grade: 'grade_1',
    progress_dimensions: {
      passion_reduction: 'developing',
      judgement_quality: 'developing',
      disposition_stability: 'developing',
      oikeiosis_extension: 'developing',
    },
    direction_of_travel: 'stable',
    motivation_classification: 'unclear_pending_clarification',
  },
  katorthoma_proximity: 'deliberate',
  ruling_faculty_state: 'Examining the pattern but not yet substituting the judgement.',
  virtue_domains_engaged: ['phronesis', 'sophrosyne'],
  improvement_path_structured: {
    false_judgement_to_correct: 'The absence of peer response is evidence of failure.',
    mechanism_applies: 'passion_diagnosis',
    corrected_judgement: "Another's response is a preferred indifferent of low worth.",
  },
  stage_scores: {
    control_filter: 'adequate',
    passion_diagnosis: 'weak',
    oikeiosis: 'adequate',
    value_assessment: 'adequate',
    kathekon_assessment: 'weak',
    iterative_refinement: 'not_applied',
  },
  hasty_assent_risk: 'high',
  intake_clarifications: {
    soft_clarifications: [],
    open_deferrals: [],
  },
  layer1_ambiguity_notes: ['The temporal scope of "weeks" was not made precise.'],
  layer2_ambiguity_notes: [],
}

/** A fixed, synthetic base64-shaped "signature" — NOT a real Ed25519 signature.
 *  Build-only mode hashes it via deriveReceiptId; it is never verified. */
export const SYNTHETIC_SIGNATURE =
  'c3ludGhldGljLXNpZ25hdHVyZS1mb3ItYnVpbGQtb25seS1icmlkZ2Utc3RlcC1ub3QtY3J5cHRvZ3JhcGhpYz09'

export const SYNTHETIC_KEY_ID = 'substrate-layer2-test'

export const SYNTHETIC_SIGNED_ASSESSMENT: SignedLayer2Assessment = {
  assessment: SYNTHETIC_LAYER2_ASSESSMENT,
  signature: SYNTHETIC_SIGNATURE,
  key_id: SYNTHETIC_KEY_ID,
}
