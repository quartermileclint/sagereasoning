/**
 * mentor-knowledge-base-loader.ts — Layer 5: Non-doctrinal background briefings
 * for the Sage Mentor.
 *
 * Loads compiled knowledge base documents and formats them for injection into
 * the USER MESSAGE (never system blocks). Each briefing is clearly labelled as
 * non-doctrinal context that does not modify the Stoic Brain.
 *
 * The Stoic Brain's model fidelity is preserved absolutely. The mentor may
 * reason about relevance, continuity, or modern application using this context,
 * but all conclusions must be grounded in the Stoic Brain's ancient sources.
 *
 * Injection point: User message, after practitioner/project/environmental context.
 * Token budget: ~800-1200 tokens total (both documents combined).
 *
 * Usage:
 *   const briefing = getMentorKnowledgeBase()
 *   // → Returns formatted string for user message injection
 *   // → Includes both documents with safeguard labels
 */

import {
  STOIC_HISTORICAL_CONTEXT,
  GLOBAL_STATE_OF_HUMANITY,
} from '@/data/mentor-knowledge-base'

// =============================================================================
// DOCUMENT FORMATTERS
// =============================================================================

/**
 * Format the Stoic Historical Context document for injection.
 */
export function getStoicHistoricalContext(): string {
  const periods = STOIC_HISTORICAL_CONTEXT.post_ancient_evolution
    .map(p => `  ${p.period}: ${p.summary}`)
    .join('\n')

  const capabilities = STOIC_HISTORICAL_CONTEXT.current_inflection_point.ai_capabilities
    .map(c => `  - ${c}`)
    .join('\n')

  return `MENTOR KNOWLEDGE BASE — STOIC HISTORICAL CONTEXT (Non-Doctrinal)
⚠ ${STOIC_HISTORICAL_CONTEXT.safeguard}

Post-Ancient Evolution:
${periods}

Current Inflection Point — ${STOIC_HISTORICAL_CONTEXT.current_inflection_point.concept}:
${STOIC_HISTORICAL_CONTEXT.current_inflection_point.definition}
Historical access: ${STOIC_HISTORICAL_CONTEXT.current_inflection_point.historical_access}
AI-enabled capabilities:
${capabilities}

${STOIC_HISTORICAL_CONTEXT.closing_safeguard}`
}

/**
 * Format the Global State of Humanity document for injection.
 */
export function getGlobalStateContext(): string {
  const pop = GLOBAL_STATE_OF_HUMANITY.population_demographics
  const uncertainties = GLOBAL_STATE_OF_HUMANITY.major_uncertainties
    .map(u => `  - ${u}`)
    .join('\n')

  return `MENTOR KNOWLEDGE BASE — GLOBAL STATE OF HUMANITY (Non-Doctrinal)
⚠ ${GLOBAL_STATE_OF_HUMANITY.safeguard}

Evolutionary Universals: ${GLOBAL_STATE_OF_HUMANITY.evolutionary_universals.summary}

Population & Demographics: World population ${pop.world_population}. Fertility rate ${pop.fertility_rate}. Life expectancy ${pop.life_expectancy}. Urbanisation ${pop.urbanisation}. Median age ${pop.median_age}. Projection: ${pop.projection}

Technology: ${GLOBAL_STATE_OF_HUMANITY.technological_inflection_points.summary}

Planetary Systems: ${GLOBAL_STATE_OF_HUMANITY.planetary_ecological_systems.summary}

Major Uncertainties:
${uncertainties}

${GLOBAL_STATE_OF_HUMANITY.closing_note}
${GLOBAL_STATE_OF_HUMANITY.closing_safeguard}`
}

// =============================================================================
// COMPOSITE LOADER — Returns both documents as a single injection block
// =============================================================================

/**
 * Get the full Mentor Knowledge Base briefing for user message injection.
 *
 * Returns both documents (Stoic Historical Context + Global State of Humanity)
 * formatted with safeguard labels and clearly marked as non-doctrinal.
 *
 * This is Layer 5 — injected in the user message after all other context layers.
 * It does not modify the Stoic Brain, agent brains, or any system blocks.
 *
 * @returns Formatted string ready for user message injection
 */
export function getMentorKnowledgeBase(): string {
  const header = `LAYER 5: MENTOR KNOWLEDGE BASE — NON-DOCTRINAL BACKGROUND BRIEFING
This information provides historical and global context for the mentor to reason about.
It does not modify expertise, principles, or the Stoic Brain in any way.
All reasoning and conclusions must be grounded exclusively in the Stoic Brain's ancient sources.`

  const stoicHistory = getStoicHistoricalContext()
  const globalState = getGlobalStateContext()

  return [header, stoicHistory, globalState].join('\n\n---\n\n')
}

/**
 * Get only the Stoic Historical Context document.
 * Use when the global state briefing is not relevant to the endpoint.
 */
export function getMentorKnowledgeBaseStoicHistory(): string {
  return getStoicHistoricalContext()
}

/**
 * Get only the Global State of Humanity document.
 * Use when the historical context is not relevant to the endpoint.
 */
export function getMentorKnowledgeBaseGlobalState(): string {
  return getGlobalStateContext()
}
