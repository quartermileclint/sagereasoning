/**
 * SageReasoning — Siri Phrase Registry (Phase 0.4)
 *
 * Canonical Siri trigger phrases for every planned App Intent.
 * This file serves as the single source of truth for interaction design.
 *
 * When the native iOS app is built, these phrases map directly to
 * AppShortcutsProvider entries. Having them documented now means:
 * 1. The UX is designed before the code exists
 * 2. No phrase conflicts between intents
 * 3. A Swift developer can copy-paste into AppShortcutsProvider
 *
 * Phrase design rules (Apple guidelines):
 * - Include the app name in at least one phrase per intent
 * - Keep phrases natural and conversational
 * - Avoid ambiguity between intents (e.g., "score" vs "advise")
 * - Use \(.applicationName) placeholder for the app name in Swift
 */

export interface SiriIntentPhrase {
  /** Swift struct name for the AppIntent */
  intentName: string
  /** What this intent does in plain language */
  description: string
  /** Canonical Siri trigger phrases */
  phrases: string[]
  /** What Siri prompts the user for (if the intent needs input) */
  siriPrompts: Record<string, string>
  /** What Siri says back (response template) */
  responseTemplate: string
  /** System image for Shortcuts app icon */
  systemImageName: string
  /** Implementation priority */
  priority: 'P1-Core' | 'P2-Expansion' | 'P3-Intelligence'
  /** Which API endpoint this calls */
  apiEndpoint: string
}

export const SIRI_INTENT_PHRASES: SiriIntentPhrase[] = [
  // ============================================================
  // P1-Core — Ship with v1.0 of native app
  // ============================================================
  {
    intentName: 'ScoreActionIntent',
    description: 'Evaluate a past action against Stoic virtue',
    phrases: [
      'Sage score this action',
      'Score this action with SageReasoning',
      'SageReasoning evaluate what I did',
    ],
    siriPrompts: {
      actionText: 'What did you do?',
      context: 'Any context?',
    },
    responseTemplate:
      'Your action is {proximityLevel}. {improvementPath_firstSentence}',
    systemImageName: 'brain.head.profile',
    priority: 'P1-Core',
    apiEndpoint: 'POST /api/score',
  },
  {
    intentName: 'DailyReflectionIntent',
    description: 'Submit end-of-day reflection for Stoic evaluation',
    phrases: [
      'Time for my daily reflection with Sage',
      'SageReasoning daily reflection',
      'Sage reflect on my day',
    ],
    siriPrompts: {
      reflectionText: 'Tell me about your day.',
    },
    responseTemplate:
      'Your reflection shows {proximityLevel} awareness. {keyInsight}',
    systemImageName: 'moon.stars',
    priority: 'P1-Core',
    apiEndpoint: 'POST /api/reflect',
  },
  {
    intentName: 'OpenJournalIntent',
    description: 'Open the 55-day Stoic journal to the current day',
    phrases: [
      'Open my Stoic journal in SageReasoning',
      'SageReasoning journal',
      'Sage open my journal',
    ],
    siriPrompts: {},
    responseTemplate:
      "You're on Day {dayNumber} — the {phaseTitle} phase. Today's focus: {title}.",
    systemImageName: 'book',
    priority: 'P1-Core',
    apiEndpoint: 'GET /journal (deep link)',
  },
  {
    intentName: 'CheckGuardrailIntent',
    description: 'Pre-action virtue check — proceed or block',
    phrases: [
      'Sage check this action',
      'SageReasoning guardrail check',
      'Should I do this, Sage?',
    ],
    siriPrompts: {
      actionText: 'What are you considering doing?',
    },
    responseTemplate:
      '{recommendation}. {reasoning_firstSentence}',
    systemImageName: 'shield.checkered',
    priority: 'P1-Core',
    apiEndpoint: 'POST /api/guardrail',
  },

  // ============================================================
  // P2-Expansion — Ship with v1.1
  // ============================================================
  {
    intentName: 'ScoreDocumentIntent',
    description: 'Score any document against Stoic virtue framework',
    phrases: [
      'Sage score this document',
      'SageReasoning evaluate this document',
      'Sage review this for virtue',
    ],
    siriPrompts: {
      documentText: 'Share the document you want scored.',
    },
    responseTemplate:
      'This document scores {proximityLevel}. {virtueBreakdown_summary}',
    systemImageName: 'doc.text.magnifyingglass',
    priority: 'P2-Expansion',
    apiEndpoint: 'POST /api/score-document',
  },
  {
    intentName: 'RankDecisionsIntent',
    description: 'Rank 2-5 decision options by reasoning quality',
    phrases: [
      'Sage help me decide',
      'SageReasoning rank my options',
      'Sage compare these choices',
    ],
    siriPrompts: {
      options: 'What are your options? (Tell me each one)',
    },
    responseTemplate:
      'Sage recommends: {topOption}. {reasoning_firstSentence}',
    systemImageName: 'list.number',
    priority: 'P2-Expansion',
    apiEndpoint: 'POST /api/score-decision',
  },
  {
    intentName: 'SageReasonIntent',
    description: 'Deep reasoning analysis at quick, standard, or deep depth',
    phrases: [
      'Sage reason about this',
      'SageReasoning deep analysis',
      'Help me think through this, Sage',
    ],
    siriPrompts: {
      topic: 'What do you want to reason about?',
      depth: 'Quick, standard, or deep analysis?',
    },
    responseTemplate:
      'Core analysis: {controlFilter_summary}. {passionDiagnosis_summary}',
    systemImageName: 'brain',
    priority: 'P2-Expansion',
    apiEndpoint: 'POST /api/reason',
  },
  {
    intentName: 'ExecuteSkillIntent',
    description: 'Run a sage skill from the marketplace',
    phrases: [
      'Sage run the {skillName} skill',
      'SageReasoning execute skill',
    ],
    siriPrompts: {
      skillName: 'Which sage skill?',
      input: 'What should the skill work on?',
    },
    responseTemplate: '{skillName} result: {result_summary}',
    systemImageName: 'wand.and.stars',
    priority: 'P2-Expansion',
    apiEndpoint: 'POST /api/execute',
  },
  {
    intentName: 'AdviseActionIntent',
    description: 'Get Stoic guidance on a proposed action',
    phrases: [
      'Sage advise me on this',
      'SageReasoning what should I do',
      'Sage guide this decision',
    ],
    siriPrompts: {
      proposedAction: 'What are you thinking of doing?',
    },
    responseTemplate:
      'Sage recommends: {recommendedAction}. {sageFraming_firstSentence}',
    systemImageName: 'lightbulb',
    priority: 'P2-Expansion',
    apiEndpoint: 'POST /api/advise-action',
  },
  {
    intentName: 'ViewProfileIntent',
    description: 'Check your Stoic progress and Senecan grade',
    phrases: [
      'How am I doing on Sage',
      'SageReasoning show my progress',
      'My Stoic profile',
    ],
    siriPrompts: {},
    responseTemplate:
      "You're at {senecanGrade} level, {typicalProximity} proximity, and {directionOfTravel}.",
    systemImageName: 'chart.line.uptrend.xyaxis',
    priority: 'P2-Expansion',
    apiEndpoint: 'GET /api/user/profile',
  },

  // ============================================================
  // P3-Intelligence — Ship with Apple Intelligence features
  // ============================================================
  {
    intentName: 'FilterSocialPostIntent',
    description: 'Check social media post for tone and reasoning before publishing',
    phrases: [
      'Sage check this post before I publish',
      'SageReasoning filter this post',
      'Sage review my social post',
    ],
    siriPrompts: {
      postText: 'Share the text you want to check.',
    },
    responseTemplate:
      'Your post scores {proximityLevel} for reasoning. {flagSummary}',
    systemImageName: 'text.bubble.badge.checkmark',
    priority: 'P3-Intelligence',
    apiEndpoint: 'POST /api/score-social',
  },
  {
    intentName: 'TakeBaselineIntent',
    description: 'Take the 5-question baseline assessment',
    phrases: [
      'SageReasoning baseline assessment',
      'Sage test my baseline',
      'Start my Sage baseline',
    ],
    siriPrompts: {},
    responseTemplate: 'Opens baseline assessment in app.',
    systemImageName: 'graduationcap',
    priority: 'P3-Intelligence',
    apiEndpoint: 'GET /api/baseline',
  },
]

/**
 * Total intent count by priority tier.
 * Use for planning and progress tracking.
 */
export const INTENT_COUNTS = {
  'P1-Core': SIRI_INTENT_PHRASES.filter((p) => p.priority === 'P1-Core').length,
  'P2-Expansion': SIRI_INTENT_PHRASES.filter((p) => p.priority === 'P2-Expansion').length,
  'P3-Intelligence': SIRI_INTENT_PHRASES.filter((p) => p.priority === 'P3-Intelligence').length,
  total: SIRI_INTENT_PHRASES.length,
}
