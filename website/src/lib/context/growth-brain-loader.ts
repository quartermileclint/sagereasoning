/**
 * growth-brain-loader.ts — Domain-specific Sage-Growth Brain context builder.
 *
 * Loads compiled Growth Brain data and assembles context blocks tailored to the
 * growth domain being invoked. Follows the Stoic Brain loader pattern:
 * domain-specific loaders → composite builder by depth level.
 *
 * Token budgets:
 *   - Per domain: 400-800 tokens
 *   - Quick depth (2 domains): ~1500 tokens ceiling
 *   - Standard depth (4 domains): ~3000 tokens ceiling
 *   - Deep depth (6 domains): ~5000 tokens ceiling
 *
 * Usage:
 *   const context = getGrowthBrainContext('standard')
 *   // → Returns combined context for positioning, audience, content, developer relations
 */

import {
  POSITIONING_CONTEXT,
  AUDIENCE_CONTEXT,
  CONTENT_CONTEXT,
  DEVREL_CONTEXT,
  COMMUNITY_CONTEXT,
  METRICS_CONTEXT,
  GROWTH_BRAIN_FOUNDATIONS,
} from '@/data/growth-brain-compiled'

type GrowthDepth = 'quick' | 'standard' | 'deep'

// =============================================================================
// DOMAIN-SPECIFIC CONTEXT BUILDERS
// =============================================================================

/**
 * Context for Domain 1 — Positioning.
 * Unique position, competitive differentiation, value propositions.
 */
export function getPositioningContext(): string {
  const competitors = POSITIONING_CONTEXT.competitor_differentiation
    .map(c => `  ${c.competitor_type}: Their strength is ${c.their_strength.toLowerCase()}. Their weakness: ${c.their_weakness.toLowerCase()}. Our advantage: ${c.our_advantage}`)
    .join('\n')

  return `SAGE-GROWTH BRAIN — POSITIONING
Core: ${POSITIONING_CONTEXT.core_principle}

What We Are: ${POSITIONING_CONTEXT.unique_position.what_we_are}
Dual Audience: ${POSITIONING_CONTEXT.unique_position.dual_audience}
Why Unique: ${POSITIONING_CONTEXT.unique_position.why_unique}

Competitive Differentiation:
${competitors}

Value Propositions:
  For Humans: ${POSITIONING_CONTEXT.value_propositions.for_humans}
  For Agents: ${POSITIONING_CONTEXT.value_propositions.for_agents}`
}

/**
 * Context for Domain 2 — Audience.
 * Human and agent developer personas, buying journeys.
 */
export function getAudienceContext(): string {
  const humanPersonas = AUDIENCE_CONTEXT.human_practitioner_personas
    .map(p => `  ${p.name} (${p.id}): ${p.description}. Motivation: ${p.motivation}`)
    .join('\n')

  const agentPersonas = AUDIENCE_CONTEXT.agent_developer_personas
    .map(p => `  ${p.name} (${p.id}): ${p.description}. Motivation: ${p.motivation}`)
    .join('\n')

  return `SAGE-GROWTH BRAIN — AUDIENCE
Core: ${AUDIENCE_CONTEXT.core_principle}

Human Practitioner Personas:
${humanPersonas}

Agent Developer Personas:
${agentPersonas}

Buying Journey:
  Free Tier: ${AUDIENCE_CONTEXT.buying_journey.free_tier}
  Conversion Trigger: ${AUDIENCE_CONTEXT.buying_journey.conversion_trigger}
  Paid Commitment: ${AUDIENCE_CONTEXT.buying_journey.paid_commitment}`
}

/**
 * Context for Domain 3 — Content.
 * Tone of voice, SEO strategy, channel guidance.
 */
export function getContentContext(): string {
  const avoid = CONTENT_CONTEXT.tone_of_voice.avoid
    .map(a => `  - ${a}`)
    .join('\n')

  const embrace = CONTENT_CONTEXT.tone_of_voice.embrace
    .map(e => `  - ${e}`)
    .join('\n')

  const keywords = CONTENT_CONTEXT.seo_strategy.primary_keywords.join(', ')
  const pillars = CONTENT_CONTEXT.seo_strategy.content_pillars.join(', ')

  const channels = CONTENT_CONTEXT.channel_guidance
    .map(c => `  ${c.channel} (${c.frequency}): ${c.purpose}`)
    .join('\n')

  return `SAGE-GROWTH BRAIN — CONTENT
Core: ${CONTENT_CONTEXT.core_principle}

Tone of Voice: ${CONTENT_CONTEXT.tone_of_voice.primary}

Avoid:
${avoid}

Embrace:
${embrace}

SEO Strategy:
  Primary Keywords: ${keywords}
  Content Pillars: ${pillars}

Channel Guidance:
${channels}`
}

/**
 * Context for Domain 4 — Developer Relations.
 * API as marketing, DX standards, community building.
 */
export function getDevrelContext(): string {
  const mechanisms = DEVREL_CONTEXT.api_as_marketing.discovery_mechanisms
    .map(m => `  - ${m}`)
    .join('\n')

  const standards = DEVREL_CONTEXT.developer_experience_standards
    .map(s => `  - ${s}`)
    .join('\n')

  const pathways = DEVREL_CONTEXT.community_building.contribution_pathways
    .map(p => `  - ${p}`)
    .join('\n')

  return `SAGE-GROWTH BRAIN — DEVELOPER RELATIONS
Core: ${DEVREL_CONTEXT.core_principle}

API as Marketing Principle: ${DEVREL_CONTEXT.api_as_marketing.principle}

Discovery Mechanisms:
${mechanisms}

Developer Experience Standards:
${standards}

Community Building Approach: ${DEVREL_CONTEXT.community_building.approach}

Contribution Pathways:
${pathways}`
}

/**
 * Context for Domain 5 — Community.
 * Community principles, practitioner progression, open source engagement.
 */
export function getCommunityContext(): string {
  const principles = COMMUNITY_CONTEXT.community_principles
    .map(p => `  - ${p}`)
    .join('\n')

  return `SAGE-GROWTH BRAIN — COMMUNITY
Core: ${COMMUNITY_CONTEXT.core_principle}

Community Principles:
${principles}

Practitioner Progression:
  Recognition: ${COMMUNITY_CONTEXT.practitioner_progression.recognition}
  Sharing: ${COMMUNITY_CONTEXT.practitioner_progression.sharing}
  Contribution: ${COMMUNITY_CONTEXT.practitioner_progression.contribution}

Open Source Engagement:
  Strategy: ${COMMUNITY_CONTEXT.open_source_engagement.strategy}
  Why: ${COMMUNITY_CONTEXT.open_source_engagement.why}`
}

/**
 * Context for Domain 6 — Metrics.
 * Acquisition, activation, retention, revenue, content performance metrics.
 */
export function getMetricsContext(): string {
  const acquisition = METRICS_CONTEXT.acquisition_metrics
    .map(m => `  - ${m}`)
    .join('\n')

  const activation = METRICS_CONTEXT.activation_metrics
    .map(m => `  - ${m}`)
    .join('\n')

  const retention = METRICS_CONTEXT.retention_metrics
    .map(m => `  - ${m}`)
    .join('\n')

  const revenue = METRICS_CONTEXT.revenue_metrics
    .map(m => `  - ${m}`)
    .join('\n')

  const contentPrimary = METRICS_CONTEXT.content_performance.primary
    .map(m => `  - ${m}`)
    .join('\n')

  const contentConversion = METRICS_CONTEXT.content_performance.conversion
    .map(m => `  - ${m}`)
    .join('\n')

  return `SAGE-GROWTH BRAIN — METRICS
Core: ${METRICS_CONTEXT.core_principle}

Acquisition Metrics:
${acquisition}

Activation Metrics:
${activation}

Retention Metrics:
${retention}

Revenue Metrics:
${revenue}

Content Performance — Primary:
${contentPrimary}

Content Performance — Conversion:
${contentConversion}`
}

// =============================================================================
// COMPOSITE CONTEXT BUILDER — Returns combined context for a given depth
// =============================================================================

/**
 * Domain-to-loader mapping.
 */
const DOMAIN_LOADERS: Record<string, () => string> = {
  positioning: getPositioningContext,
  audience: getAudienceContext,
  content: getContentContext,
  developer_relations: getDevrelContext,
  community: getCommunityContext,
  metrics: getMetricsContext,
}

/**
 * Which domains are included at each depth level.
 */
const DEPTH_DOMAINS: Record<GrowthDepth, string[]> = {
  quick: ['positioning', 'audience'],
  standard: ['positioning', 'audience', 'content', 'developer_relations'],
  deep: ['positioning', 'audience', 'content', 'developer_relations', 'community', 'metrics'],
}

/**
 * Get combined Sage-Growth Brain context for a given depth level.
 *
 * @param depth - 'quick' | 'standard' | 'deep'
 * @returns Formatted context string ready for system prompt injection
 */
export function getGrowthBrainContext(depth: GrowthDepth): string {
  const domains = DEPTH_DOMAINS[depth]
  const sections = domains
    .map(d => {
      const loader = DOMAIN_LOADERS[d]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  const foundations = `SAGE-GROWTH BRAIN FOUNDATIONS:
${GROWTH_BRAIN_FOUNDATIONS.core_premise}
Operating principle: ${GROWTH_BRAIN_FOUNDATIONS.operating_principle}
Four growth virtues: ${Object.values(GROWTH_BRAIN_FOUNDATIONS.four_growth_virtues).map(v => `${v.name} (${v.stoic_parallel})`).join(', ')}`

  return [foundations, ...sections].join('\n\n---\n\n')
}

/**
 * Get Sage-Growth Brain context for specific domains.
 *
 * @param domains - Array of domain IDs to include
 * @returns Formatted context string
 */
export function getGrowthBrainContextForDomains(domains: string[]): string {
  const sections = domains
    .map(d => {
      const loader = DOMAIN_LOADERS[d]
      return loader ? loader() : ''
    })
    .filter(Boolean)

  return sections.join('\n\n---\n\n')
}
