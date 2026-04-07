/**
 * stripe-projects.ts — Stripe Projects Integration (PLACEHOLDER)
 *
 * STATUS: Designed (architecture decided, no functional code yet)
 *
 * Stripe Projects launched in developer preview ~March 26, 2026.
 * This file scaffolds the integration points for when SageReasoning
 * becomes a Stripe Projects provider.
 *
 * WHAT THIS WILL DO:
 *   - Allow agents to provision SageReasoning API access via:
 *     `stripe projects add sagereasoning/sage-reason`
 *   - Auto-generate API keys with proper tier configuration
 *   - Sync credentials to agent's .env via vault
 *   - Provide llm-context output describing SageReasoning capabilities
 *   - Handle plan selection (free → paid upgrade) via Stripe billing
 *
 * WHEN TO BUILD:
 *   - After Stripe Projects reaches GA (expected late April 2026)
 *   - After P4 (Stripe payment processing) is wired and verified
 *   - Contact provider-request@stripe.com to become a listed provider
 *
 * REFERENCE DOCS:
 *   - https://docs.stripe.com/projects
 *   - /inbox/stripe projects.txt
 *   - /inbox/native recommendations.txt
 *
 * ARCHITECTURE (from inbox research):
 *   Products should include four components:
 *   1. Engine — CLI command support, .projects/ state, .env sync
 *   2. Skills — Agent skill for provisioning via Stripe Projects
 *   3. Tools — Function-calling wrapper for Stripe Projects CLI
 *   4. Wrappers — Language-specific SDKs
 *
 * Rules served: R0 (expanding access), R4 (IP protection — keys via vault),
 *               R5 (cost controls on provisioned keys)
 */

// =============================================================================
// TYPES — Provider integration contract
// =============================================================================

/**
 * The plan structure SageReasoning would expose to Stripe Projects catalog.
 *
 * TODO: Implement when becoming a Stripe Projects provider.
 * These plans map to our existing tier structure in api-keys-schema.sql.
 */
export interface SageReasoningPlan {
  /** Plan identifier in Stripe Projects catalog */
  planId: string
  /** Human-readable name */
  name: string
  /** Maps to api_keys.tier */
  tier: 'free' | 'paid'
  /** Per-call pricing in USD */
  perCallPriceUsd: number
  /** Monthly call limit */
  monthlyLimit: number
  /** Daily call limit */
  dailyLimit: number
  /** Max deliberation chain iterations */
  maxChainIterations: number
}

/**
 * Plans we would list in the Stripe Projects catalog.
 *
 * TODO: Register these with Stripe when provider integration is built.
 */
export const STRIPE_PROJECTS_PLANS: SageReasoningPlan[] = [
  {
    planId: 'sagereasoning/sage-reason-free',
    name: 'SageReasoning Free',
    tier: 'free',
    perCallPriceUsd: 0,
    monthlyLimit: 30,
    dailyLimit: 1,
    maxChainIterations: 1,
  },
  {
    planId: 'sagereasoning/sage-reason-paid',
    name: 'SageReasoning Paid',
    tier: 'paid',
    perCallPriceUsd: 0.18,
    monthlyLimit: 10000,
    dailyLimit: 500,
    maxChainIterations: 3,
  },
]


// =============================================================================
// PROVISIONING — Credential handoff (PLACEHOLDER)
// =============================================================================

/**
 * Provision a new SageReasoning API key for a Stripe Projects user.
 *
 * TODO: Implement when Stripe Projects provider integration is built.
 *
 * This function will:
 *   1. Create a Stripe customer link (or find existing)
 *   2. Generate an API key (sr_live_<hex>)
 *   3. Store key hash in api_keys table with appropriate tier
 *   4. Return credentials for vault storage
 *
 * The credential shape for .env injection:
 *   SAGEREASONING_API_KEY=sr_live_<key>
 *   SAGEREASONING_BASE_URL=https://api.sagereasoning.com
 */
export async function provisionForStripeProjects(
  _stripeCustomerId: string,
  _planId: string,
  _email: string
): Promise<{ apiKey: string; baseUrl: string }> {
  // TODO: Implement provisioning flow
  // 1. Validate stripeCustomerId against Stripe
  // 2. Determine tier from planId
  // 3. Generate API key via existing /api/keys logic
  // 4. Return credentials for vault injection
  throw new Error(
    'Stripe Projects provider integration not yet implemented. ' +
    'Expected after GA (late April 2026). See /inbox/stripe projects.txt.'
  )
}


// =============================================================================
// LLM CONTEXT — Machine-readable capability description (PLACEHOLDER)
// =============================================================================

/**
 * Generate llm-context output for `stripe projects llm-context`.
 *
 * TODO: Implement when provider integration is built.
 *
 * This output is consumed by AI coding agents to understand what
 * SageReasoning can do and how to call it. It should include:
 *   - Available endpoints with descriptions
 *   - Authentication method (X-Api-Key header)
 *   - Request/response examples
 *   - Rate limits and pricing
 *   - Error handling patterns
 *
 * See: /public/llms.txt and /public/openapi.yaml for existing content
 * that could seed this output.
 */
export function generateLlmContext(): string {
  // TODO: Generate from skill-registry.ts and openapi.yaml
  // For now, point to existing discovery files
  return [
    '# SageReasoning — Stoic Reasoning API',
    '',
    '## Discovery',
    'OpenAPI spec: https://sagereasoning.com/openapi.yaml',
    'Agent card: https://sagereasoning.com/.well-known/agent-card.json',
    'LLM context: https://sagereasoning.com/llms.txt',
    '',
    '## Authentication',
    'Pass API key as: X-Api-Key: sr_live_<key>',
    '',
    '## Quick start',
    'POST https://sagereasoning.com/api/reason',
    '{ "input": "your action or decision", "depth": "quick" }',
    '',
    '## Full documentation',
    'https://sagereasoning.com/api-docs',
  ].join('\n')
}


// =============================================================================
// PLAN UPGRADE — Handle upgrade/downgrade via Stripe Projects (PLACEHOLDER)
// =============================================================================

/**
 * Handle plan changes triggered by `stripe projects upgrade`.
 *
 * TODO: Implement when provider integration is built.
 *
 * This will:
 *   1. Receive upgrade webhook from Stripe Projects
 *   2. Update api_keys tier and limits
 *   3. Confirm new credential shape (same key, higher limits)
 */
export async function handlePlanChange(
  _stripeCustomerId: string,
  _newPlanId: string
): Promise<void> {
  // TODO: Implement plan change logic
  // Reuse upgrade_api_key_to_paid / downgrade_api_key_to_free SQL functions
  throw new Error(
    'Stripe Projects plan changes not yet implemented. ' +
    'See stripe-billing-schema.sql for existing upgrade/downgrade functions.'
  )
}
