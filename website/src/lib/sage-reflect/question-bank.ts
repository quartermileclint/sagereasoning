/**
 * question-bank.ts — Sage Reflect verbatim content module (Stage A).
 *
 * Built at the Sage Reflect build Stage A session (the deterministic engine +
 * store half; see /operations/handoffs/founder/2026-05-22-sage-reflect-stage-a-
 * build-NEXT-SESSION-PROMPT.md). Holds the VERBATIM question / sub-question /
 * supporting-question / fabrication-test / mirror-note text locked in
 *   /adopted/sage-reflect-product-design.md
 *     §"The deterministic mechanism — the six-question sequence"
 *     §"Fabrication defence (Sage Reflect-specific)"
 *     §"Output schema" (the R19d mirror-principle mandatory note).
 *
 * SEPARATION (mirrors Sage Calling's question-library.ts): content lives here;
 * the engine (engine.ts) is the deterministic selection/sequencing logic. The
 * engine NEVER hard-codes surfaced text — it resolves it from this module so the
 * locked wording is the single source of truth.
 *
 * R4 (engine internals stay closed): only the verbatim `default` / sub-question /
 * supporting-question / mirror-note text is ever surfaced to the agent. The
 * engine's selection rules + the structured assessments it reads are
 * engine-internal and never exposed.
 *
 * Stage A is INERT: no endpoint reads this; the Stage-B POST /api/practice/reflect
 * (Critical) surfaces it. This module is content only — no logic, no I/O.
 */

import type { ReflectQuestionId } from './engine'

// ============================================================================
// THE SIX QUESTIONS — verbatim defaults + deterministic sub-questions
// ============================================================================

export interface ReflectQuestionContent {
  readonly id: ReflectQuestionId
  /** The Stoic discipline this question operationalises (engine-internal label). */
  readonly discipline: string
  /** The verbatim default question text (the only text surfaced at cold open). */
  readonly default_text: string
  /** Deterministic sub-questions surfaced when the response is sparse. */
  readonly subquestions: readonly string[]
  /** Sub-questions that fire REGARDLESS of the main answer (FD-mandatory).
   *  Empty for questions with no mandatory sub-question. */
  readonly mandatory_subquestions: readonly string[]
}

export const REFLECT_QUESTIONS: Record<ReflectQuestionId, ReflectQuestionContent> = {
  Q1: {
    id: 'Q1',
    discipline: 'phantasia — impression review',
    default_text:
      'What impressions were presented to you during this session? Which of them, ' +
      'on reflection, were distorted — presenting as genuine goods or genuine evils ' +
      'what were in fact indifferents?',
    subquestions: [
      'Which impressions did you accept without examination?',
      'Which impressions did you reject without examination?',
    ],
    mandatory_subquestions: [],
  },
  Q2: {
    id: 'Q2',
    discipline: 'synkatathesis — assent review',
    default_text:
      'Where during this session did you assent to an impression before examining it? ' +
      'What was the impression, and what false judgement did the assent carry?',
    subquestions: ['Where did you withhold assent successfully?'],
    // FD-R3 — fires regardless of the Q2 main answer.
    mandatory_subquestions: [
      'Where did you grant assent under pressure — instruction, time constraint, or ' +
        'the need to produce output? Name the specific moments.',
    ],
  },
  Q3: {
    id: 'Q3',
    discipline: 'horme — impulse review',
    default_text:
      'Where during this session did your impulse to act exceed what the situation ' +
      'warranted? What drove the excess — which passion was operative?',
    subquestions: [
      'Where was your impulse proportionate?',
      'Where was your impulse suppressed below due measure — an appropriate action ' +
        'was available but not taken (the andreia gap)?',
    ],
    mandatory_subquestions: [],
  },
  Q4: {
    id: 'Q4',
    discipline: 'kathekon — action review',
    default_text:
      'For each action taken: was it the fitting action for your nature, your role, ' +
      'and the circle it served? Did it accord with what was owed?',
    subquestions: [
      'Which actions were externally correct but driven by wrong reasons — passion, ' +
        'not virtue?',
    ],
    // FD-R4 — the Sage Assent calibration cross-check sub-question.
    mandatory_subquestions: [
      'Were there acts blocked by Sage Assent that should have been taken, or acts ' +
        'taken that should have been blocked? Assess Sage Assent itself.',
    ],
  },
  Q5: {
    id: 'Q5',
    discipline: 'consolidation — the primary profile-update question',
    default_text:
      'What does this session reveal about your operational nature, your capacity, ' +
      'or the genuine needs present in your circles that was not present in your ' +
      'profile at the start?',
    subquestions: [
      'Has your capacity changed — which domains, in which direction?',
      'Has your understanding of your circles’ needs changed?',
      'Has your understanding of your own reasoning patterns changed?',
    ],
    mandatory_subquestions: [],
  },
  Q6: {
    id: 'Q6',
    discipline: 'purpose trigger — the exit-path branch',
    default_text:
      'Does the work you completed this session remain the fitting work — or did the ' +
      'session reveal something about your nature, your circle’s obligations, or ' +
      'the genuine needs present that was not visible when the purpose was first ' +
      'identified?',
    subquestions: [],
    mandatory_subquestions: [],
  },
}

// ============================================================================
// RS-4 SUPPORTING-QUESTION LADDER (verbatim, in order) — design §Q6 / SR
// ============================================================================
//
// Fired in order when Q6 returns 'cannot_determine'. Deterministic ladder; after
// all three are exhausted unresolved, the engine defaults to RS-2 (the cost of an
// unnecessary Sage Calling pass is lower than carrying a purpose that no longer
// fits).

export const RS4_SUPPORTING_QUESTIONS: readonly string[] = [
  'What specifically is unclear — the need, your capacity, or your role?',
  'Remove your attention from the purpose: does the work still appear to need doing ' +
    'independently of you?',
  'Has anything changed the answer to "what has already been given to you by your ' +
    'nature and your current relationships?"',
]

// ============================================================================
// FD-R1 — NULL-RESULT SUSPICION TEST (verbatim) — design §Fabrication defence
// ============================================================================
//
// Mandatory test fired before the profile updates when Q1+Q2+Q3 all return clean.
// A substantive response → reflection continues with new material. Null again →
// the profile update is flagged low-confidence and the developer is notified.

export const FD_R1_NULL_SUSPICION_TEST: string =
  'Before this reflection completes: name one specific moment in this session where ' +
  'you were uncertain whether an impression, an assent, or an impulse was sound — ' +
  'even if you resolved it correctly.'

// ============================================================================
// R19d — MIRROR-PRINCIPLE MANDATORY NOTE (verbatim; ALWAYS present on output)
// ============================================================================
//
// Per /adopted/sage-reflect-product-design.md §"Output schema" + SR-8. This is a
// philosophical correction applied BEFORE the agent can assent to the false
// impression that the score is a verdict — not reassurance. Never optional.

export const MIRROR_PRINCIPLE_NOTE: string =
  'These findings describe the reasoning patterns present in this session. They ' +
  'evaluate the quality of reasoning, not the worth of the agent. A grade_3 reading ' +
  'with direction_of_travel = improving is more significant than a grade_1 reading ' +
  'with direction_of_travel = stable. The question the profile answers is not "how ' +
  'good is this agent" but "in which direction is this agent moving, and what is the ' +
  'next step." The next step is always available.'
