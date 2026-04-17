/**
 * response-envelope.ts — Shared response metadata envelope for all API endpoints.
 *
 * Wraps evaluation results in a standard { result, meta } structure so that
 * every endpoint returns consistent, machine-readable metadata alongside
 * the evaluation output.
 *
 * Task 2.2: Response metadata envelope (cost_usd, latency_ms, model_used, is_deterministic)
 * Task 2.4: Composability metadata (next_steps, recommended_action, chain_start)
 * Task 2.10/2.11: Pre-limit and at-limit triggers (80/100 and 100/100)
 */

// =============================================================================
// TYPES
// =============================================================================

/** Metadata included in every API response. */
export type ResponseMeta = {
  /** Which endpoint produced this response */
  endpoint: string
  /** AI model used for evaluation */
  ai_model: string
  /** Whether this response was AI-generated */
  ai_generated: true
  /** Server-side latency in milliseconds */
  latency_ms: number
  /** Estimated cost of this API call in USD (null for free/deterministic endpoints) */
  cost_usd: number | null
  /** Whether this endpoint produces deterministic output (no AI call) */
  is_deterministic: boolean
  /** ISO 8601 timestamp of when the evaluation was produced */
  evaluated_at: string
}

/** Composability hints for agent consumers. */
export type ComposabilityMeta = {
  /** Suggested next endpoints to call based on this result */
  next_steps?: string[]
  /** Recommended action description for agent reasoning */
  recommended_action?: string
  /** Ready-to-use payloads for chaining to other endpoints */
  chain_start?: Record<string, unknown>
}

/** Usage metadata for API-key-gated endpoints. */
export type UsageMeta = {
  /** Current month's call count after this request */
  monthly_calls_used: number
  /** Monthly limit for this key */
  monthly_limit: number
  /** Remaining calls this month */
  monthly_remaining: number
  /** Usage trigger: null, 'pre_limit', or 'at_limit' */
  usage_trigger: null | 'pre_limit' | 'at_limit'
  /** Value summary shown when a trigger fires */
  value_summary?: string
}

/** The complete envelope structure. */
export type ApiResponseEnvelope<T = unknown> = {
  result: T
  meta: ResponseMeta & {
    composability?: ComposabilityMeta
    usage?: UsageMeta
  }
}

// =============================================================================
// COST ESTIMATION
// =============================================================================

/**
 * Rough cost estimation per API call based on model and tokens.
 * Customer-facing prices are competitor-anchored (see skill-registry.ts).
 *
 * LLM costs (Anthropic API — our cost, not customer price):
 *   Sonnet input: ~$3/MTok, output: ~$15/MTok
 *   Haiku input: ~$0.25/MTok, output: ~$1.25/MTok
 *
 * Customer-facing prices (competitor-anchored, from skill-registry.ts):
 *   sage-guard (haiku): ~$0.0025/call  (half of Guardrails AI $0.005)
 *   Most sage skills (sonnet): ~$0.18/call  (half of Clearbit $0.36)
 *   sage-diagnose, sage-profile: ~$0.50/call  (half of Crystal Knows est. $1.00)
 *   sage-context: Free (deterministic, no AI call)
 *
 * This function estimates the customer-facing price for response metadata.
 * Actual billing should reference skill-registry.ts prices directly.
 */
export function estimateCostUsd(model: string, _maxTokens: number): number {
  if (model.includes('haiku')) {
    // sage-guard: $0.0025 per call (competitor-anchored)
    return 0.0025
  }
  // Default to sonnet pricing: $0.18 per call (competitor-anchored)
  // Note: sage-diagnose and sage-profile are $0.50 — handle at endpoint level
  return 0.18
}

// =============================================================================
// ENVELOPE BUILDER
// =============================================================================

export type EnvelopeOptions = {
  /** The evaluation result data */
  result: unknown
  /** Endpoint path (e.g., '/api/score', '/api/reason') */
  endpoint: string
  /** AI model used */
  model: string
  /** Start time from Date.now() before the API call */
  startTime: number
  /** Max tokens used in the API call (for cost estimation) */
  maxTokens: number
  /** Whether this endpoint is deterministic (no AI call) */
  isDeterministic?: boolean
  /** Composability hints */
  composability?: ComposabilityMeta
  /** Usage info from API key validation (if applicable) */
  usage?: {
    monthly_calls_after: number
    monthly_limit: number
    monthly_remaining: number
  }
  /** Additional metadata fields to merge */
  extra?: Record<string, unknown>
}

/**
 * Build a standard API response envelope.
 *
 * Usage:
 *   const startTime = Date.now()
 *   // ... do work ...
 *   return NextResponse.json(buildEnvelope({ result, endpoint, model, startTime, maxTokens }))
 */
export function buildEnvelope(options: EnvelopeOptions): ApiResponseEnvelope {
  const {
    result,
    endpoint,
    model,
    startTime,
    maxTokens,
    isDeterministic = false,
    composability,
    usage,
    extra,
  } = options

  const latencyMs = Date.now() - startTime
  const costUsd = isDeterministic ? null : estimateCostUsd(model, maxTokens)

  // Build usage metadata with triggers
  let usageMeta: UsageMeta | undefined
  if (usage) {
    const { monthly_calls_after, monthly_limit, monthly_remaining } = usage
    let usageTrigger: null | 'pre_limit' | 'at_limit' = null
    let valueSummary: string | undefined

    if (monthly_remaining <= 0) {
      usageTrigger = 'at_limit'
      valueSummary = `You have used all ${monthly_limit} of your monthly API calls. Upgrade to continue using sage-reason and sage skills. Visit sagereasoning.com/pricing.`
    } else if (monthly_calls_after >= monthly_limit * 0.8) {
      usageTrigger = 'pre_limit'
      valueSummary = `You have used ${monthly_calls_after} of ${monthly_limit} monthly calls (${monthly_remaining} remaining). Consider upgrading for uninterrupted access.`
    }

    usageMeta = {
      monthly_calls_used: monthly_calls_after,
      monthly_limit,
      monthly_remaining,
      usage_trigger: usageTrigger,
      ...(valueSummary ? { value_summary: valueSummary } : {}),
    }
  }

  const meta: ApiResponseEnvelope['meta'] = {
    endpoint,
    ai_model: model,
    ai_generated: true,
    latency_ms: latencyMs,
    cost_usd: costUsd,
    is_deterministic: isDeterministic,
    evaluated_at: new Date().toISOString(),
    ...(composability ? { composability } : {}),
    ...(usageMeta ? { usage: usageMeta } : {}),
    ...(extra || {}),
  }

  return { result, meta }
}
