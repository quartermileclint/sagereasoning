/**
 * support-brain-loader.ts — Domain-specific Sage-Support Brain context builder.
 *
 * Loads compiled Support Brain data and assembles context blocks tailored to the
 * support domain being invoked. Follows the Stoic Brain loader pattern:
 * domain-specific loaders → composite builder by depth level.
 *
 * Token budgets:
 *   - Per domain: 400-800 tokens
 *   - Quick depth (2 domains): ~1500 tokens ceiling
 *   - Standard depth (4 domains): ~3000 tokens ceiling
 *   - Deep depth (6 domains): ~5000 tokens ceiling
 *
 * Usage:
 *   const context = getSupportBrainContext('standard')
 *   // → Returns combined context for triage, vulnerable users, philosophical sensitivity, escalation
 */

import {
  TRIAGE_CONTEXT,
  VULNERABLE_USERS_CONTEXT,
  PHILOSOPHICAL_SENSITIVITY_CONTEXT,
  ESCALATION_CONTEXT,
  KNOWLEDGE_BASE_CONTEXT,
  FEEDBACK_LOOP_CONTEXT,
  SUPPORT_BRAIN_FOUNDATIONS,
} from '@/data/support-brain-compiled'

type SupportDepth = 'quick' | 'standard' | 'deep'

// =============================================================================
// DOMAIN-SPECIFIC CONTEXT BUILDERS
// =============================================================================

/**
 * Context for Domain 1 — Triage.
 * Severity levels, escalation criteria, response time classification.
 */
export function getTriageContext(): string {
  const levels = TRIAGE_CONTEXT.severity_levels
    .map(s => `  ${s.id} (${s.name}): ${s.description} Response: ${s.response_time}. Action: ${s.action}`)
    .join('\n')

  const criteria = TRIAGE_CONTEXT.escalation_criteria
    .map(c => `  - ${c}`)
    .join('\n')

  return `SAGE-SUPPORT BRAIN — TRIAGE
Core: ${TRIAGE_CONTEXT.core_principle}

Severity Levels:
${levels}

Escalation Criteria:
${criteria}`
}

/**
 * Context for Domain 2 — Vulnerable Users.
 * Distress indicators, what not to do, redirection protocol, independence encouragement.
 */
export function getVulnerableUsersContext(): string {
  const indicators = VULNERABLE_USERS_CONTEXT.distress_indicators
    .map(i => `  - ${i}`)
    .join('\n')

  const dont = VULNERABLE_USERS_CONTEXT.what_not_to_do
    .map(d => `  - ${d}`)
    .join('\n')

  const protocol = VULNERABLE_USERS_CONTEXT.redirection_protocol
  const steps = protocol.immediate_steps.map(s => `    - ${s}`).join('\n')
  const examples = protocol.language_examples
    .map(e => `    - "${e}"`)
    .join('\n')

  return `SAGE-SUPPORT BRAIN — VULNERABLE USERS
Core: ${VULNERABLE_USERS_CONTEXT.core_principle}

Distress Indicators:
${indicators}

What NOT to Do:
${dont}

Redirection Protocol — Immediate Steps:
${steps}

Language Examples:
${examples}

Independence Encouragement: ${VULNERABLE_USERS_CONTEXT.independence_encouragement.principle}
Warning Signs: ${VULNERABLE_USERS_CONTEXT.independence_encouragement.warning_signs.join('; ')}`
}

/**
 * Context for Domain 3 — Philosophical Sensitivity.
 * When philosophy helps, when it may harm, mirror principle, relationship asymmetry.
 */
export function getPhilosophicalSensitivityContext(): string {
  const helps = PHILOSOPHICAL_SENSITIVITY_CONTEXT.when_philosophy_helps
    .map(h => `  - ${h}`)
    .join('\n')

  const harms = PHILOSOPHICAL_SENSITIVITY_CONTEXT.when_philosophy_may_harm
    .map(h => `  - ${h}`)
    .join('\n')

  const mirror = PHILOSOPHICAL_SENSITIVITY_CONTEXT.mirror_principle
  const asymmetry = PHILOSOPHICAL_SENSITIVITY_CONTEXT.relationship_asymmetry

  return `SAGE-SUPPORT BRAIN — PHILOSOPHICAL SENSITIVITY
Core: ${PHILOSOPHICAL_SENSITIVITY_CONTEXT.core_principle}

When Philosophy Helps:
${helps}

When Philosophy May Harm:
${harms}

Mirror Principle (${mirror.rule}):
  Application: ${mirror.application}

Relationship Asymmetry (${asymmetry.rule}):
  Guidance: ${asymmetry.guidance}`
}

/**
 * Context for Domain 4 — Escalation.
 * Crisis resources, handoff language, documentation requirements.
 */
export function getEscalationContext(): string {
  const resources = ESCALATION_CONTEXT.crisis_resources
    .map(r => `  ${r.region} — ${r.service} (${r.contact}) ${r.web}`)
    .join('\n')

  const handoff = ESCALATION_CONTEXT.handoff_language
    .map(h => `  - "${h}"`)
    .join('\n')

  const docs = ESCALATION_CONTEXT.documentation_requirements
    .map(d => `  - ${d}`)
    .join('\n')

  return `SAGE-SUPPORT BRAIN — ESCALATION
Core: ${ESCALATION_CONTEXT.core_principle}

Crisis Resources:
${resources}

Handoff Language:
${handoff}

Documentation Requirements:
${docs}`
}

/**
 * Context for Domain 5 — Knowledge Base.
 * Common questions, API troubleshooting, account support.
 */
export function getKnowledgeBaseContext(): string {
  const faq = KNOWLEDGE_BASE_CONTEXT.common_user_questions
    .map(q => `  Q: ${q.question} (${q.category})\n    A: ${q.answer_guidance}`)
    .join('\n')

  const api = KNOWLEDGE_BASE_CONTEXT.api_troubleshooting
    .map(a => `  ${a.issue}: ${a.diagnosis} → ${a.resolution}`)
    .join('\n')

  return `SAGE-SUPPORT BRAIN — KNOWLEDGE BASE
Core: ${KNOWLEDGE_BASE_CONTEXT.core_principle}

Common User Questions:
${faq}

API Troubleshooting:
${api}`
}

/**
 * Context for Domain 6 — Feedback Loop.
 * Signal types, pattern detection, product improvement pipeline.
 */
export function getFeedbackLoopContext(): string {
  const signals = FEEDBACK_LOOP_CONTEXT.signal_types
    .map(s => `  ${s.type}: ${s.description} → ${s.action}`)
    .join('\n')

  return `SAGE-SUPPORT BRAIN — FEEDBACK LOOP
Core: ${FEEDBACK_LOOP_CONTEXT.core_principle}

Signal Types:
${signals}

Pattern Detection: ${FEEDBACK_LOOP_CONTEXT.pattern_detection.method}
Current Tracking: ${FEEDBACK_LOOP_CONTEXT.pattern_detection.current_tracking}

Product Improvement Pipeline: ${FEEDBACK_LOOP_CONTEXT.product_improvement_pipeline.flow}`
}

// =============================================================================
// COMPOSITE CONTEXT BUILDER — Returns combined context for a given depth
// =============================================================================

/**
 * Domain-to-loader mapping.
 */
const DOMAIN_LOADERS: Record<string, () => string> = {
  triage: getTriageContext,
  vulnerable_users: getVulnerableUsersContext,
  philosophical_sensitivity: getPhilosophicalSensitivityContext,
  escalation: getEscalationContext,
  knowledge_base: getKnowledgeBaseContext,
  feedback_loop: getFeedbackLoopContext,
}

/**
 * Which domains are included at each depth level.
 */
const DEPTH_DOMAINS: Record<SupportDepth, string[]> = {
  quick: ['triage', 'vulnerable_users'],
  standard: ['triage', 'vulnerable_users', 'philosophical_sensitivity', 'escalation'],
  deep: ['triage', 'vulnerable_users', 'philosophical_sensitivity', 'escalation', 'knowledge_base', 'feedback_loop'],
}

/**
 * Get combined Sage-Support Brain context for a given depth level.
 *
 * @param depth - 'quick' | 'standard' | 'deep'
 * @returns Formatted context string ready for system prompt injection
 */
export function getSupportBrainContext(depth: SupportDepth): string {
  const domains = DEPTH_DOMAINS[depth]
  const sections = domains
    .map(d => {
      const loader = DOMAIN_LOADERS[d]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  const foundations = `SAGE-SUPPORT BRAIN FOUNDATIONS:
${SUPPORT_BRAIN_FOUNDATIONS.core_premise}
Operating principle: ${SUPPORT_BRAIN_FOUNDATIONS.operating_principle}
Four support virtues: ${Object.values(SUPPORT_BRAIN_FOUNDATIONS.four_support_virtues).map(v => `${v.name} (${v.stoic_parallel})`).join(', ')}`

  return [foundations, ...sections].join('\n\n---\n\n')
}

/**
 * Get Sage-Support Brain context for specific domains.
 *
 * @param domains - Array of domain IDs to include
 * @returns Formatted context string
 */
export function getSupportBrainContextForDomains(domains: string[]): string {
  const sections = domains
    .map(d => {
      const loader = DOMAIN_LOADERS[d]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  return sections.join('\n\n---\n\n')
}
