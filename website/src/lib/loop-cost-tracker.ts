/**
 * loop-cost-tracker.ts — Per-loop cost accumulation + persistence for Option D billing.
 *
 * Sibling to r20a-cost-tracker.ts. Per Decision E of /adopted/billing-model-design.md
 * (D-BILLING-MODEL-LOCKED-2026-05-17). This module owns:
 *   - Per-model pricing constants for the two models the substrate uses per AC1
 *     (Haiku for safety-critical + quick-depth; Sonnet for everything else)
 *   - Per-call cost estimation
 *   - Per-request in-memory accumulation (LoopAccumulator factory; KG1 rule 4 —
 *     never module-level state)
 *   - Async persistence of the per-loop billing event via the extended
 *     increment_api_usage RPC (transactional aggregate + ledger write)
 *
 * The bill itself (base + overage arithmetic) lives in /website/src/lib/stripe.ts
 * via computeLoopBill — single source of truth for the formula. This module
 * accumulates the inputs; stripe.ts computes the bill; this module then persists
 * via the extended RPC.
 *
 * Rules served:
 *   R0  — The persistent cost record is part of the long-term oikeiosis audit trail
 *   R3  — No PII in billing events (agent_id is wrapper-supplied; no end-user info)
 *   R4  — No engine internals (token counts + model names are operational fields)
 *   R5  — Primary engagement — the prospective formula instantiates 2x at the loop
 *          level by construction
 *   R9  — No outcome data; bills work attempted, not work completed
 *   R10 — Marketplace compliance — billing data is the canonical reconciliation surface
 *   R18a — No category-language change (billing is commercial, not credential)
 *   AC7 — Engaged at the build session (RPC signature change + schema additions)
 *   AC10 — loop_billing_events is upstream provenance surface F4 for A12 OpenTelemetry
 *   KG1 — Every write awaited; no fire-and-forget; transactional RPC writes
 *
 * Pricing note: r20a-cost-tracker.ts uses different per-million constants
 * (HAIKU_INPUT_COST_PER_MILLION = 25, OUTPUT = 125 — appears off by ~25x relative
 * to Anthropic's listed Haiku 4.5 pricing). The pricing constants below reflect
 * the design's cost-per-loop appendix (which targets Haiku ~$1/$5 + Sonnet
 * ~$3/$15 per million tokens, USD). Re-aligning r20a-cost-tracker.ts to the same
 * convention is deferred to a follow-on Standard-risk session per PR7. The
 * estimateCallCostCents function below is the single source of truth for Option D
 * per-loop cost estimation.
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-005, CR-010, CR-011, CR-012]
 */

import { createHash } from 'crypto'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { computeLoopBill } from '@/lib/stripe'

/**
 * A DETERMINISTIC loop id in valid UUID shape, derived from a seed. loop_id is a
 * UUID column (option-d-billing-schema.sql), so a metering surface that wants
 * retry-dedup (a retried POST re-billing the same logical stage must collide on
 * the UNIQUE (api_key_id, loop_id) → duplicate_loop_id no-op) CANNOT use a
 * free-form string — Postgres rejects the cast and the RPC 503s. This formats a
 * sha256 of the seed into the 8-4-4-4-12 layout the UUID type accepts (not an
 * RFC-versioned UUID — the type does not require version/variant bits, only the
 * hex layout). Same-seed ⇒ same id ⇒ the dedup the caller wants. S9b fix.
 */
export function deterministicLoopId(seed: string): string {
  const h = createHash('sha256').update(seed).digest('hex')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`
}

// =============================================================================
// PRICING CONSTANTS — update when Anthropic pricing changes
// =============================================================================
//
// USD per 1,000,000 tokens. Source: Anthropic published pricing for the two
// models the substrate uses per AC1 of /manifest.md.
//
// Conversion in estimateCallCostCents:
//   cents = (tokens / 1_000_000) * USD_per_million * 100
//
// If Anthropic changes pricing, edit this constant and rebuild. The constant
// is the single source of truth for Option D per-loop cost estimation.

interface ModelPricing {
  input_usd_per_million: number
  output_usd_per_million: number
}

const PRICING: Record<string, ModelPricing> = {
  // Haiku 4.5 — used for safety-critical (R20a distress classifier) +
  // quick-depth assessment per AC1.
  'claude-haiku-4-5-20251001': { input_usd_per_million: 1.0, output_usd_per_million: 5.0 },
  'claude-haiku-4-5':          { input_usd_per_million: 1.0, output_usd_per_million: 5.0 },
  'haiku-4-5':                 { input_usd_per_million: 1.0, output_usd_per_million: 5.0 },

  // Sonnet 4.6 — used for Layer 1 translation, engine rule LLM, Layer 3,
  // mentor reflection, standard/deep assessment per AC1.
  'claude-sonnet-4-6': { input_usd_per_million: 3.0, output_usd_per_million: 15.0 },
  'sonnet-4-6':        { input_usd_per_million: 3.0, output_usd_per_million: 15.0 },

  // Opus 4.6 — not currently used by the substrate but listed for
  // completeness; substrate model selection per AC1 confines to Haiku + Sonnet.
  'claude-opus-4-6': { input_usd_per_million: 15.0, output_usd_per_million: 75.0 },
  'opus-4-6':        { input_usd_per_million: 15.0, output_usd_per_million: 75.0 },
}

/**
 * Estimate the cost of a single Anthropic API call in cents.
 *
 * Returns a float for precision (rounding to integer cents happens at the
 * billing-construction layer in stripe.ts's computeLoopBill, applied once per
 * loop on the aggregate not per-call). Returns 0 for unknown model names —
 * better to under-bill than to throw on an unrecognised model (forward
 * compatibility with future model rollouts; warning logged once per unknown
 * model per process via console.warn).
 *
 * Per-call costs are not persisted independently; only the per-loop aggregate
 * (sum of all internal calls) is persisted to loop_billing_events.
 */
const _unknownModelWarned = new Set<string>()

export function estimateCallCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model]
  if (!pricing) {
    if (!_unknownModelWarned.has(model)) {
      console.warn(
        `[loop-cost-tracker] Unknown model "${model}" — cost estimated as 0. ` +
          `Update PRICING in /website/src/lib/loop-cost-tracker.ts to include this model.`
      )
      _unknownModelWarned.add(model)
    }
    return 0
  }

  const inputCost = (inputTokens / 1_000_000) * pricing.input_usd_per_million * 100
  const outputCost = (outputTokens / 1_000_000) * pricing.output_usd_per_million * 100

  // Keep 4 decimal places of precision for accumulation; rounded to integer
  // cents at the billing-construction step.
  return Math.round((inputCost + outputCost) * 10000) / 10000
}


// =============================================================================
// PER-REQUEST IN-MEMORY ACCUMULATOR (KG1 rule 4 — never module-level state)
// =============================================================================

/**
 * The accumulated state of a loop in flight. Snapshot read at any point;
 * incremented by addCall when each internal Anthropic call completes.
 */
export interface LoopAggregateState {
  anthropic_cost_cents: number      // sum across all internal calls; float for accumulation precision
  internal_calls: number             // count of Anthropic calls within the loop
  total_input_tokens: number
  total_output_tokens: number
  models_used: string[]              // ordered set; first occurrence wins
}

/**
 * Stateful accumulator for a single loop's cost during one HTTP request.
 *
 * Created at request entry once the loop_id is known. The route's metering
 * layer calls addCall after each Anthropic API call completes (with the
 * call's model name + token counts). At response construction time, getState
 * returns the cumulative state; the bill is computed via stripe.ts's
 * computeLoopBill; persistLoop writes the row via the extended RPC.
 *
 * State lives in the closure — never module-level. One accumulator per HTTP
 * request. KG1 rule 4 compliance.
 */
export interface LoopAccumulator {
  readonly loopId: string
  readonly apiKeyId: string
  readonly surface: 'api_reason' | 'api_score_iterate' | 'wrapper_internal' | 'api_guardrail' | 'api_practice_discernment'
  readonly agentId: string | null

  /**
   * Add an Anthropic call where we know the model + token counts; cost is
   * computed via estimateCallCostCents. Used by /api/score-iterate (direct
   * client.messages.create returns message.usage with token counts).
   */
  addCall(model: string, inputTokens: number, outputTokens: number): void

  /**
   * Add an Anthropic call where the cost was already computed upstream and
   * we don't have token-level data. Used by /api/reason where runSandwich
   * (the translation-sandwich substrate) exposes per-layer cost in microcents
   * via SandwichRunResult.layer1_cost_usd_microcents +
   * .layer3_cost_usd_microcents but does not expose token counts on
   * SandwichRunResult. The cost is in CENTS (float OK for accumulation;
   * rounded at billing-construction). Token counts default to 0; modelsUsed
   * still tracks the model.
   *
   * If the upstream cost field is null (substrate didn't run that layer —
   * e.g., Tier 1 short-circuit before Layer 3), the caller should NOT invoke
   * addPrecomputedCall for that layer.
   */
  addPrecomputedCall(model: string, costCents: number, inputTokens?: number, outputTokens?: number): void

  getState(): LoopAggregateState
}

export interface CreateLoopAccumulatorParams {
  loopId: string
  apiKeyId: string
  surface: 'api_reason' | 'api_score_iterate' | 'wrapper_internal' | 'api_guardrail' | 'api_practice_discernment'
  agentId?: string | null
}

export function createLoopAccumulator(params: CreateLoopAccumulatorParams): LoopAccumulator {
  let anthropic_cost_cents = 0
  let internal_calls = 0
  let total_input_tokens = 0
  let total_output_tokens = 0
  const models_used: string[] = []

  return {
    loopId: params.loopId,
    apiKeyId: params.apiKeyId,
    surface: params.surface,
    agentId: params.agentId ?? null,

    addCall(model, inputTokens, outputTokens) {
      anthropic_cost_cents += estimateCallCostCents(model, inputTokens, outputTokens)
      internal_calls += 1
      total_input_tokens += inputTokens
      total_output_tokens += outputTokens
      if (!models_used.includes(model)) {
        models_used.push(model)
      }
    },

    addPrecomputedCall(model, costCents, inputTokens = 0, outputTokens = 0) {
      anthropic_cost_cents += costCents
      internal_calls += 1
      total_input_tokens += inputTokens
      total_output_tokens += outputTokens
      if (!models_used.includes(model)) {
        models_used.push(model)
      }
    },

    getState() {
      return {
        anthropic_cost_cents,
        internal_calls,
        total_input_tokens,
        total_output_tokens,
        models_used: [...models_used],  // defensive copy; caller cannot mutate
      }
    },
  }
}


// =============================================================================
// PERSISTENCE — extended increment_api_usage RPC call
// =============================================================================

/**
 * Service-role client (admin — no RLS).
 *
 * Lazy-initialised. Reads NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SERVICE_ROLE_KEY at first call; throws if either is missing.
 * Module-level cached after first construction (same pattern as
 * r20a-cost-tracker.ts).
 */
let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient {
  if (!_adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error(
        '[loop-cost-tracker] Missing NEXT_PUBLIC_SUPABASE_URL or ' +
          'SUPABASE_SERVICE_ROLE_KEY; cannot create admin client.'
      )
    }
    _adminClient = createClient(url, key)
  }
  return _adminClient
}

/**
 * Outcome of the extended increment_api_usage RPC call. Used by the route's
 * response-header emission and quota-check logic.
 */
export interface RecordLoopBillingOutcome {
  monthly_calls: number       // post-increment total_calls (per-call counter — retained per Step 1(c))
  daily_calls: number         // post-increment daily_calls
  monthly_loops: number       // post-increment loop_count (Option D quota counter)
  monthly_limit: number
  daily_limit: number
}

/**
 * The kind of error recordLoopBilling can return without throwing.
 *
 * 'duplicate_loop_id' is the Step 1(e) hard-error case: a wrapper attempted
 * to bill the same (api_key_id, loop_id) twice. The route translates this
 * into HTTP 400 with X-Loop-Id-Already-Billed. Postgres SQLSTATE 23505
 * (unique_violation) is the underlying signal.
 *
 * 'rpc_error' is any other RPC failure — caught and surfaced so the route
 * can decide whether to return 500 or proceed without persistence (the
 * latter is NOT recommended for KG1 compliance; the route should return 500
 * if persistence fails to maintain billing integrity).
 */
export type RecordLoopBillingError =
  | { kind: 'duplicate_loop_id'; message: string }
  | { kind: 'rpc_error'; message: string }

export type RecordLoopBillingResult =
  | { ok: true; outcome: RecordLoopBillingOutcome }
  | { ok: false; error: RecordLoopBillingError }

export interface RecordLoopBillingParams {
  apiKeyId: string
  loopId: string
  agentId: string | null
  surface: 'api_reason' | 'api_score_iterate' | 'wrapper_internal' | 'api_guardrail' | 'api_practice_discernment'

  // Bill — from stripe.ts's computeLoopBill on the accumulator state.
  baseCents: number
  thresholdCents: number
  overageCents: number
  overageFired: boolean
  totalCents: number

  // Accumulator state — from LoopAccumulator.getState() (rounded to integer cents).
  anthropicCostCents: number
  internalCalls: number
  totalInputTokens: number
  totalOutputTokens: number
  modelsUsed: string[]

  // Existing increment_api_usage params (preserved for quota counters).
  endpoint: 'guardrail' | 'score_iterate' | 'agent_baseline' | 'other'
  year: number
  month: number
  day: number
}

/**
 * Persist a completed loop's billing event via the extended increment_api_usage RPC.
 *
 * The RPC is transactional — the api_key_usage aggregate increment AND the
 * loop_billing_events row insert succeed or fail together. KG1 rule 2
 * compliance: the call is awaited; throws / errors are surfaced as discriminated
 * results, not swallowed.
 *
 * The Step 1(e) duplicate-loop_id case is detected by Postgres SQLSTATE 23505
 * (unique_violation on the unique_api_key_loop constraint) and surfaced as
 * { ok: false, error: { kind: 'duplicate_loop_id', ... } }. The route translates
 * this into HTTP 400.
 */
export async function recordLoopBilling(
  params: RecordLoopBillingParams
): Promise<RecordLoopBillingResult> {
  const admin = getAdminClient()

  const { data, error } = await admin.rpc('increment_api_usage', {
    // Existing params (preserved).
    p_api_key_id: params.apiKeyId,
    p_year: params.year,
    p_month: params.month,
    p_day: params.day,
    p_endpoint: params.endpoint,

    // Option D params.
    p_loop_id: params.loopId,
    p_surface: params.surface,
    p_anthropic_cost_cents: params.anthropicCostCents,
    p_base_cents: params.baseCents,
    p_threshold_cents: params.thresholdCents,
    p_overage_cents: params.overageCents,
    p_overage_fired: params.overageFired,
    p_total_cents: params.totalCents,
    p_internal_calls: params.internalCalls,
    p_models_used: params.modelsUsed,
    p_total_input_tokens: params.totalInputTokens,
    p_total_output_tokens: params.totalOutputTokens,
    p_agent_id: params.agentId,
  })

  if (error) {
    // Postgres SQLSTATE 23505 = unique_violation. Step 1(e) hard-error case.
    // The Supabase JS client surfaces the code in error.code; the message may
    // contain "duplicate key value violates unique constraint" too.
    const isUniqueViolation =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).code === '23505' ||
      error.message?.includes('duplicate key value') ||
      error.message?.includes('unique_api_key_loop')

    if (isUniqueViolation) {
      return {
        ok: false,
        error: {
          kind: 'duplicate_loop_id',
          message:
            `Loop ${params.loopId} was already billed for this api_key. ` +
            `Per Option D Decision A + Step 1(e), each X-Loop-Id must be unique per ` +
            `HTTP request (multi-HTTP-request loops with shared loop_id are deferred under PR7).`,
        },
      }
    }

    return {
      ok: false,
      error: {
        kind: 'rpc_error',
        message: `increment_api_usage RPC failed: ${error.message}`,
      },
    }
  }

  const row = Array.isArray(data) ? data[0] : data
  if (!row) {
    return {
      ok: false,
      error: {
        kind: 'rpc_error',
        message: 'increment_api_usage RPC returned no rows.',
      },
    }
  }

  return {
    ok: true,
    outcome: {
      monthly_calls: Number(row.new_monthly_total) || 0,
      daily_calls: Number(row.new_daily_total) || 0,
      monthly_loops: Number(row.new_monthly_loops) || 0,
      monthly_limit: Number(row.monthly_limit) || 0,
      daily_limit: Number(row.daily_limit) || 0,
    },
  }
}


// =============================================================================
// RESPONSE-HEADER EMISSION (Decision H)
// =============================================================================

/**
 * Build the six X-Loop-* response headers per Decision H of the design doc.
 *
 * Emitted on every /api/reason and /api/score-iterate response under per-loop
 * billing. Headers are observability-only — the actual bill is invoiced via
 * Stripe at month-end. The headers let wrappers implement cost-aware logic
 * (the fair-license criterion "the meter is visible").
 *
 * Caller may pass:
 *   - loopId only (early-return cases before any LLM call): headers report
 *     loop_id with zero cost fields. The caller should still write a ledger
 *     row (base_cents only) so the loop is billed for "work attempted" per R9.
 *   - loopId + accumulator state (mid-flight or terminal): headers report
 *     cumulative state at this response point.
 *
 * Step 1(a) election: these headers are NOT added to CORS Access-Control-Expose-
 * Headers in this build session — browser-side wrappers can't read them via
 * fetch() yet. Server-to-server callers (curl, server-side wrappers) read them
 * directly. Browser CORS exposure is deferred under PR7.
 */
export interface LoopHeadersInput {
  loopId: string
  state?: LoopAggregateState
  overageFired?: boolean
  overageCents?: number
  totalCents?: number    // the bill at this point (base + overage)
}

export function buildLoopHeaders(input: LoopHeadersInput): Record<string, string> {
  const cost = input.state ? Math.round(input.state.anthropic_cost_cents) : 0
  return {
    'X-Loop-Id': input.loopId,
    'X-Loop-Cost-Cents': String(input.totalCents ?? 0),
    'X-Anthropic-Cost-Cents': String(cost),
    'X-Overage-Fired': String(input.overageFired ?? false),
    'X-Overage-Cents': String(input.overageCents ?? 0),
    'X-Loop-Internal-Calls': String(input.state?.internal_calls ?? 0),
  }
}


// =============================================================================
// LOOP_ID HANDLING
// =============================================================================

/**
 * Extract loop_id from the X-Loop-Id request header. Returns null if absent.
 * The caller (route entry point) should fall through to generating a new UUIDv4
 * server-side when null is returned (per Decision A's auto-generation fallback).
 *
 * Validates UUIDv4 shape; rejects malformed values (returns null + warning).
 * The caller's response shape should be 400 with X-Loop-Id-Invalid when the
 * header is present but malformed — but for the in-flight implementation we
 * surface null + warn so existing callers without correct UUIDs still get a
 * loop_id (auto-generated) rather than a hard 400. The hard-400-on-malformed
 * shape is a Step 1 discretion point — currently soft-fallback.
 */
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function extractLoopId(request: Request): string | null {
  const headerValue = request.headers.get('x-loop-id')
  if (!headerValue) return null
  const trimmed = headerValue.trim()
  if (!UUID_V4_RE.test(trimmed)) {
    console.warn(
      `[loop-cost-tracker] X-Loop-Id header present but not a valid UUIDv4 ` +
        `("${trimmed.slice(0, 40)}${trimmed.length > 40 ? '…' : ''}"); ` +
        `falling back to server-generated loop_id.`
    )
    return null
  }
  return trimmed.toLowerCase()
}

/**
 * Generate a fresh UUIDv4 for use as a server-assigned loop_id.
 * Uses Web Crypto's randomUUID — available in Node 19+ + edge runtimes.
 */
export function generateLoopId(): string {
  return crypto.randomUUID()
}


// =============================================================================
// END-OF-LOOP RESPONSE FINALIZATION (combines bill compute + persist + headers)
// =============================================================================

/**
 * Single helper that combines: (1) compute the per-loop bill via
 * stripe.ts's computeLoopBill, (2) persist the loop_billing_events row +
 * api_key_usage aggregates via recordLoopBilling, (3) construct the
 * NextResponse with the original body + the X-Loop-* response headers
 * merged into the supplied baseline headers.
 *
 * Used by /api/reason and /api/score-iterate at every billable response
 * branch (happy path + R20a redirect + Tier 1 + Layer throws — every
 * response after the loop_id is known). Centralises the metering logic so
 * route code stays focused on its own branching, and the metering shape
 * stays consistent across surfaces.
 *
 * Behaviour on persist failure:
 *   - duplicate_loop_id (Step 1(e) hard error): returns HTTP 400 with the
 *     X-Loop-* headers attached so the caller sees both the error AND the
 *     loop_id that conflicted. The original responseBody is replaced by an
 *     error payload.
 *   - rpc_error (any other RPC failure): returns HTTP 500. Billing is
 *     load-bearing — we don't silently lose billing data. The caller may
 *     retry with a fresh loop_id.
 *
 * Behaviour on isBillable=false (validation errors, auth failures before
 * the surface accepted the request):
 *   - No ledger row written. No bill computed. X-Loop-* headers report zero
 *     cost. Used when the request didn't reach the substrate's billable
 *     surface (e.g., malformed JSON body, depth validation failure).
 */
export interface FinalizeLoopResponseParams {
  loopId: string
  accumulator: LoopAccumulator
  apiKeyId: string
  endpoint: 'guardrail' | 'score_iterate' | 'agent_baseline' | 'other'
  responseBody: unknown
  responseStatus: number
  responseHeaders: Record<string, string>
  isBillable: boolean
}

export async function finalizeLoopResponse(
  params: FinalizeLoopResponseParams
): Promise<NextResponse> {
  const state = params.accumulator.getState()
  const bill = computeLoopBill(state.anthropic_cost_cents)

  if (params.isBillable) {
    const now = new Date()
    const persistResult = await recordLoopBilling({
      apiKeyId: params.apiKeyId,
      loopId: params.loopId,
      agentId: params.accumulator.agentId,
      surface: params.accumulator.surface,
      baseCents: bill.base_cents,
      thresholdCents: bill.threshold_cents,
      overageCents: bill.overage_cents,
      overageFired: bill.overage_fired,
      totalCents: bill.total_cents,
      anthropicCostCents: Math.round(state.anthropic_cost_cents),
      internalCalls: state.internal_calls,
      totalInputTokens: state.total_input_tokens,
      totalOutputTokens: state.total_output_tokens,
      modelsUsed: state.models_used,
      endpoint: params.endpoint,
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate(),
    })

    if (!persistResult.ok) {
      if (persistResult.error.kind === 'duplicate_loop_id') {
        // Step 1(e) hard error — wrapper attempted to bill the same
        // (api_key_id, loop_id) twice. Return 400 with the headers so the
        // caller sees the failure + the loop_id involved.
        return NextResponse.json(
          {
            error: 'loop_id_already_billed',
            detail: persistResult.error.message,
            loop_id: params.loopId,
          },
          {
            status: 400,
            headers: {
              ...params.responseHeaders,
              ...buildLoopHeaders({
                loopId: params.loopId,
                state,
                overageFired: bill.overage_fired,
                overageCents: bill.overage_cents,
                totalCents: bill.total_cents,
              }),
            },
          }
        )
      }

      // Any other RPC error — fail-closed per KG1. Billing infra
      // unavailable; don't return the user's response without recording
      // the bill.
      console.error(
        '[loop-cost-tracker] recordLoopBilling RPC failed; returning 500. ' +
          'Detail: ' + persistResult.error.message
      )
      return NextResponse.json(
        {
          error: 'billing_recording_failed',
          detail:
            'The substrate could not record this loop\'s billing event. ' +
            'Please retry. If the issue persists, contact support.',
        },
        {
          status: 500,
          headers: {
            ...params.responseHeaders,
            ...buildLoopHeaders({
              loopId: params.loopId,
              state,
              overageFired: bill.overage_fired,
              overageCents: bill.overage_cents,
              totalCents: bill.total_cents,
            }),
          },
        }
      )
    }
  }

  // Successful path (or non-billable response) — emit headers + return.
  const loopHeaders = buildLoopHeaders({
    loopId: params.loopId,
    state,
    overageFired: params.isBillable ? bill.overage_fired : false,
    overageCents: params.isBillable ? bill.overage_cents : 0,
    totalCents: params.isBillable ? bill.total_cents : 0,
  })

  return NextResponse.json(params.responseBody, {
    status: params.responseStatus,
    headers: { ...params.responseHeaders, ...loopHeaders },
  })
}


/**
 * Convenience: aggregate one loop's persisted state by querying loop_billing_events.
 *
 * Used by post-deploy forensic queries ("show me the full cost detail for loop X")
 * and by tests that need to verify the persisted row. Not called on the hot path —
 * the hot path uses createLoopAccumulator's in-memory state.
 *
 * Returns null if no row exists for the (api_key_id, loop_id) pair.
 */
export async function aggregateLoopCost(
  apiKeyId: string,
  loopId: string
): Promise<LoopAggregateState | null> {
  const admin = getAdminClient()
  const { data, error } = await admin
    .from('loop_billing_events')
    .select(
      'anthropic_cost_cents, internal_calls, total_input_tokens, total_output_tokens, models_used'
    )
    .eq('api_key_id', apiKeyId)
    .eq('loop_id', loopId)
    .maybeSingle()

  if (error || !data) return null

  return {
    anthropic_cost_cents: Number(data.anthropic_cost_cents) || 0,
    internal_calls: Number(data.internal_calls) || 0,
    total_input_tokens: Number(data.total_input_tokens) || 0,
    total_output_tokens: Number(data.total_output_tokens) || 0,
    models_used: (data.models_used as string[]) || [],
  }
}
