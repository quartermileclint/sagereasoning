/**
 * parallel-run.ts — Translation-sandwich parallel-run orchestrator for /api/reason.
 *
 * Per ADR-004 §6 (Cutover mechanics — Decision B parallel-run).
 * Per ADR-004 §6.3 (Failure isolation — user is unaffected by sandwich failures).
 * Per ADR-007 §6 (Fallback prose mechanics).
 *
 * COMPOSES: Layer 1 → Layer 2 → Layer 3 (with deterministic fallback per ADR-007 §6).
 * SITE: imported by /api/reason/route.ts ONLY. Single-route discipline per Step 1(b).
 * GATING: process.env.TRANSLATION_SANDWICH_PARALLEL_RUN === '1' at module load.
 *         When unset/"0", runParallelSandwich is a no-op.
 *
 * NEVER THROWS. Every failure mode logs to console.warn and returns. The user
 * response is never blocked by a parallel-run failure.
 *
 * Compliance:
 *   - AC4: Module is imported only by route.ts AFTER the line-144 distress check.
 *           Phase 7 of the harness asserts the import-position invariant.
 *   - AC5: R20a perimeter unchanged. The orchestrator does not touch the distress
 *           check or anything before it in the route.
 *   - AC6: The Layer 1 call places the RAG block in the cached system message;
 *           per-request contexts in the user message. Same composition order as
 *           runSageReason. Layer 3's prompt is also cached.
 *   - AC8: Module sits under /website/src/lib/translation-sandwich/.
 *   - KG1: All Supabase writes are awaited. No fire-and-forget. No module-level
 *           cache. No self-calls.
 *   - KG6: Composition order: input → Layer 1 (LLM) → Layer 2 (deterministic) →
 *           Layer 3 (LLM, with fallback) → comparison row write → return.
 *   - KG7: JSONB columns receive plain JS objects (no JSON.stringify before
 *           passing to the Supabase client).
 *   - PR1: Single-endpoint proof — only /api/reason imports this module at M1.
 *   - PR3: All async work is awaited; no fire-and-forget.
 *   - PR4: Sonnet for Layer 1 + Layer 3 enforced inside the layer modules.
 *   - PR6: Safety-critical preservation — this module sits AFTER the perimeter.
 *
 * Status at file creation: Wired (parallel-run, env-flag-gated). Reaches Verified
 * after the M1-CP5 parallel-run observation period.
 */

import { createHash, randomUUID } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { extractFeatures, type Layer1Schema } from './layer1-extractor'
import {
  applyMechanisms,
  detectTier1Trigger,
  type Tier1Trigger,
  type Layer2Assessment,
} from './layer2-mechanisms'
import {
  generateProse,
  generateFallbackProse,
  type Layer3Prose,
} from './layer3-prose'
import type { RetrievedPassage } from '@/lib/rag'

// Lazy-create the Supabase service-role client INSIDE functions, never at module
// load time. This mirrors the established pattern in r20a-cost-tracker.ts and
// keeps the module importable in environments (e.g., the standalone harness)
// where env vars may not yet be loaded at the moment of the import statement.
function getAdminClient(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ============================================================================
// MODULE CONFIG — read once at module load (per Step 1(b) module-load discipline)
// ============================================================================

/**
 * Activation flag. Read once at module load.
 * Set TRANSLATION_SANDWICH_PARALLEL_RUN=1 in Vercel env to activate.
 * When false (default), runParallelSandwich returns immediately.
 */
const PARALLEL_RUN_ENABLED =
  process.env.TRANSLATION_SANDWICH_PARALLEL_RUN === '1'

// Cap defaults per ADR-004 §6.2. To change, modify here + redeploy.
// (Founder approves any change as a Critical-tier amendment per project instructions §0c-ii.)
// BigInt(...) instead of `n` literal because tsconfig target is ES2017 (BigInt literals need ES2020+).
const CAP_USD_MICROCENTS = BigInt(50_000_000) // $50.00 in microcents (1 USD = 1,000,000 microcents)
const CAP_REQUEST_COUNT = 1000
const CAP_DAYS = 14

// Sonnet pricing (USD per 1M tokens) as of May 2026.
// Update if Anthropic pricing changes. Activated at M1-CP4f (2026-05-07) when
// extractFeatures + generateProse were extended to return token usage. The
// helper sonnetCostMicrocents() (below) computes per-layer cost; the
// orchestrator wires it into result.layer1_cost_usd_microcents +
// result.layer3_cost_usd_microcents which surface in the comparison row.
//
// NOTE on cache pricing: the formula below treats input_tokens as full price.
// In reality input_tokens excludes cache reads (per Anthropic SDK convention),
// and cache reads are billed at ~10% of input price. The current capture
// approximates *marginal* per-request cost rather than total cost — which is
// the right thing for R5 cost-health alerts (alerts should reflect
// traffic-driven cost growth, which is what scales). Cache-aware refinement
// is a future open question; revisit at M1-CP5+ if total-cost accuracy
// becomes load-bearing.
const SONNET_INPUT_USD_PER_MILLION_TOKENS = 3
const SONNET_OUTPUT_USD_PER_MILLION_TOKENS = 15

// Concurrent execution model (M1-CP4 follow-up, 2026-05-04):
//   The parallel sandwich runs CONCURRENTLY with runSageReason rather than
//   sequentially after it. There is NO deadline cutoff during the parallel-run
//   period — the founder's directive is "during testing we don't have a cutoff
//   deadline until we know how long it takes to get an appropriate result."
//   Total user-facing latency = max(bundled, sandwich), capped only by
//   Vercel's serverless function timeout (60s on Pro plan).
//
//   When M1-CP5 has measured realistic Layer 1 + Layer 3 latencies, an informed
//   deadline can be reintroduced if the user-latency trade-off justifies it.
//
// The 'deadline_exceeded' FailureCategory is preserved in the type union for
// forward-compatibility — if a deadline is reintroduced at M1-CP5+ it can be
// logged with that category without a schema change.

// ============================================================================
// TYPES
// ============================================================================

/**
 * Inputs the sandwich layers need (Layer 1 + Layer 2 + Layer 3).
 * Used by runSandwichForHarness (the harness can run the sandwich with no
 * bundled-depth coordination — it just exercises the layers).
 */
export interface SandwichInput {
  input: string
  context?: string
  domain_context?: string
  urgency_context?: string
  /** Pre-formatted Stoic Brain block (compiled-string fallback path). */
  stoicBrainContext?: string
  /** D6 + D7 retrieved passages (success path). Layer 1 builds the block. */
  retrievedPassages?: RetrievedPassage[]
  practitionerContext?: string | null
  projectContext?: string | null
  /**
   * Pre-computed Layer1Schema (added 2026-05-10 under
   * D-A2-INPUT-VALIDATION-SURFACE-2026-05-10).
   *
   * When present, server-side Layer 1 extraction is SKIPPED and the supplied
   * schema is used directly as Layer 2 input. Used by plugin-authenticated
   * traffic per the substrate ADR (Decision §"The three layers"): the plugin
   * runs Layer 1 locally and submits a validated Layer1Schema to the
   * substrate.
   *
   * The CALLER is responsible for validating the schema via
   * validateLayer1Schema before passing it here. This branch trusts that
   * contract (the route's validatePluginRequest helper enforces it for
   * /api/reason).
   *
   * When undefined (the default — the existing user-auth + API-key path),
   * Layer 1 runs server-side via extractFeatures as today. Behaviour is
   * byte-identical to the pre-A2 state.
   */
  preExtractedLayer1Schema?: Layer1Schema
}

/**
 * Inputs for the route's parallel-run wiring. Adds bundled-depth coordination
 * to SandwichInput so the sandwich can execute concurrently with bundled-depth
 * and log a comparison row when both have settled.
 */
export interface ParallelRunInput extends SandwichInput {
  /** Promise resolving to the bundled-depth ReasonResult. The route fires
   *  runSageReason and passes the unresolved promise here so the sandwich can
   *  execute concurrently with bundled-depth rather than waiting for it.
   *  When bundled rejects, the comparison row is skipped (the table's
   *  bundled_depth_output column is NOT NULL). */
  bundledDepthPromise: Promise<unknown>
  /** Date.now() value captured immediately before runSageReason fires.
   *  Used to compute bundled-depth latency once it resolves. */
  bundledStartedAt: number
}

type FailureCategory =
  | 'layer1_throw'
  | 'layer3_throw'
  | 'validation_throw'
  | 'cost_cap_reached'
  | 'deadline_exceeded'

interface SandwichRunResult {
  output: unknown // The composed { extraction, assessment, prose, ... } shape OR a Tier 1 force-clarification shape (per ADR-008 §2). null on failure.
  error: FailureCategory | null
  layer1_latency_ms: number | null
  layer2_latency_ms: number | null
  layer3_latency_ms: number | null
  layer1_cost_usd_microcents: number | null
  layer3_cost_usd_microcents: number | null
  // Added 2026-05-06 (M1-CP4e) — Tier 1 force-clarification surface per ADR-008 §2 + §3.10.
  // When non-null, the engine halted at the named position and `output` carries a
  // Tier 1 response shape (NOT a full evaluation). Layer 3 was not called.
  // The route (Step 7) is responsible for issuing the continuation token + composing
  // the final response shape with `continuation_token`. Logged in the comparison
  // row regardless; user-facing during parallel-run remains bundled-depth per
  // ADR-008 §7 + ADR-004 §6.3 failure-isolation guarantee.
  tier1_trigger: Tier1Trigger | null
}

// ============================================================================
// COST CALCULATION (utility — activated at M1-CP4f, 2026-05-07)
//
// Convert Anthropic SDK usage (input_tokens, output_tokens) to USD microcents.
// 1 microcent = $0.000001. So Sonnet input @ $3/M tokens = 3 microcents/token.
// Wired into runSandwichInner: layer1Result.usage and layer3Result.usage feed
// this helper, which writes to result.layer{1,3}_cost_usd_microcents and
// surfaces in the comparison row at logComparisonRow.
// ============================================================================

export function sonnetCostMicrocents(inputTokens: number, outputTokens: number): number {
  const inputMicrocents = inputTokens * SONNET_INPUT_USD_PER_MILLION_TOKENS
  const outputMicrocents = outputTokens * SONNET_OUTPUT_USD_PER_MILLION_TOKENS
  return inputMicrocents + outputMicrocents
}

// ============================================================================
// COST-TRACKER OPERATIONS
// Defensive: every read/write is wrapped in try/catch. On failure we
// console.warn and return a "not capped" default so the user is not blocked.
// ============================================================================

interface CostTrackerStatus {
  cap_reached: boolean
  /** When true, the cost-tracker read failed; we default to "not capped" but log it. */
  read_failed: boolean
}

async function readCostTracker(): Promise<CostTrackerStatus> {
  try {
    const { data, error } = await getAdminClient()
      .from('translation_sandwich_cost_tracker')
      .select('cumulative_cost_usd_microcents, request_count, cap_reached, period_start, cap_reached_at')
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      console.warn('[parallel-run] cost-tracker read failed:', error.message)
      return { cap_reached: false, read_failed: true }
    }

    if (!data) {
      // Row missing — table exists but seed didn't run. Treat as not capped.
      console.warn('[parallel-run] cost-tracker row id=1 missing; treating as not capped')
      return { cap_reached: false, read_failed: false }
    }

    if (data.cap_reached === true) {
      return { cap_reached: true, read_failed: false }
    }

    // Re-evaluate cap conditions in case state changed between writes.
    // (Defense-in-depth — the writer also flips cap_reached, but we double-check.)
    const cumulativeCost = BigInt(data.cumulative_cost_usd_microcents ?? 0)
    const requestCount = data.request_count ?? 0
    const periodStartDate = new Date(data.period_start as string)
    const ageDays = (Date.now() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24)

    if (
      cumulativeCost > CAP_USD_MICROCENTS ||
      requestCount > CAP_REQUEST_COUNT ||
      ageDays > CAP_DAYS
    ) {
      return { cap_reached: true, read_failed: false }
    }

    return { cap_reached: false, read_failed: false }
  } catch (err) {
    console.warn('[parallel-run] cost-tracker read threw:', err)
    return { cap_reached: false, read_failed: true }
  }
}

async function incrementCostTracker(addedCostMicrocents: number): Promise<void> {
  try {
    // Read-modify-write. Singleton row; concurrent writes are rare at our scale.
    // (At higher scale we'd use a Postgres function for atomic upsert.)
    const { data: current, error: readErr } = await getAdminClient()
      .from('translation_sandwich_cost_tracker')
      .select('cumulative_cost_usd_microcents, request_count, period_start')
      .eq('id', 1)
      .maybeSingle()

    if (readErr || !current) {
      console.warn('[parallel-run] cost-tracker increment skipped (row missing or read error):', readErr?.message ?? 'no data')
      return
    }

    const newCumulative = BigInt(current.cumulative_cost_usd_microcents ?? 0) + BigInt(addedCostMicrocents)
    const newRequestCount = (current.request_count ?? 0) + 1

    const periodStartDate = new Date(current.period_start as string)
    const ageDays = (Date.now() - periodStartDate.getTime()) / (1000 * 60 * 60 * 24)

    const capReached =
      newCumulative > CAP_USD_MICROCENTS ||
      newRequestCount > CAP_REQUEST_COUNT ||
      ageDays > CAP_DAYS

    const update: Record<string, unknown> = {
      cumulative_cost_usd_microcents: newCumulative.toString(),
      request_count: newRequestCount,
      cap_reached: capReached,
    }
    if (capReached) {
      update.cap_reached_at = new Date().toISOString()
    }

    const { error: updateErr } = await getAdminClient()
      .from('translation_sandwich_cost_tracker')
      .update(update)
      .eq('id', 1)

    if (updateErr) {
      console.warn('[parallel-run] cost-tracker update failed:', updateErr.message)
    }
  } catch (err) {
    console.warn('[parallel-run] cost-tracker increment threw:', err)
  }
}

// ============================================================================
// COMPARISON-TABLE WRITE
// ============================================================================

async function logComparisonRow(
  _params: ParallelRunInput,
  requestId: string,
  inputHash: string,
  bundledOutput: unknown,
  bundledLatencyMs: number,
  result: SandwichRunResult
): Promise<void> {
  try {
    const { error } = await getAdminClient()
      .from('translation_sandwich_comparisons')
      .insert({
        request_id: requestId,
        input_text_hash: inputHash,
        bundled_depth_output: bundledOutput,
        translation_sandwich_output: result.output,
        translation_sandwich_error: result.error,
        layer1_latency_ms: result.layer1_latency_ms,
        layer2_latency_ms: result.layer2_latency_ms,
        layer3_latency_ms: result.layer3_latency_ms,
        bundled_depth_latency_ms: bundledLatencyMs,
        layer1_cost_usd_microcents: result.layer1_cost_usd_microcents,
        layer3_cost_usd_microcents: result.layer3_cost_usd_microcents,
        bundled_depth_cost_usd_microcents: null, // not captured at M1; revisit at M1-CP5
      })

    if (error) {
      console.warn('[parallel-run] comparison insert failed:', error.message)
    }
  } catch (err) {
    console.warn('[parallel-run] comparison insert threw:', err)
  }
}

// ============================================================================
// SANDWICH ORCHESTRATION
// Composes Layer 1 → Layer 2 → Layer 3 with deterministic fallback on Layer 3
// failure (per ADR-007 §6). Returns SandwichRunResult; never throws.
// ============================================================================

async function runSandwichInner(params: SandwichInput): Promise<SandwichRunResult> {
  const result: SandwichRunResult = {
    output: null,
    error: null,
    layer1_latency_ms: null,
    layer2_latency_ms: null,
    layer3_latency_ms: null,
    layer1_cost_usd_microcents: null,
    layer3_cost_usd_microcents: null,
    tier1_trigger: null,
  }

  // ---- Layer 1 ----
  let layer1Schema: Layer1Schema
  const layer1Start = Date.now()
  if (params.preExtractedLayer1Schema !== undefined) {
    // Stage 1 A2 (D-A2-INPUT-VALIDATION-SURFACE-2026-05-10): pre-computed
    // Layer1Schema supplied by a plugin-authenticated caller. The plugin ran
    // Layer 1 locally per the substrate ADR (Decision §"The three layers");
    // the route validated the schema via validatePluginRequest before
    // passing here. Skip server-side extractFeatures.
    layer1Schema = params.preExtractedLayer1Schema
    result.layer1_latency_ms = 0       // No server-side Layer 1 work performed
    result.layer1_cost_usd_microcents = 0 // No LLM call
  } else {
    try {
      const layer1Result = await extractFeatures({
        input: params.input,
        context: params.context,
        domain_context: params.domain_context,
        urgency_context: params.urgency_context,
        stoicBrainContext: params.stoicBrainContext,
        retrievedPassages: params.retrievedPassages,
        practitionerContext: params.practitionerContext,
        projectContext: params.projectContext,
      })
      layer1Schema = layer1Result.schema
      // Layer 1 cost capture (M1-CP4f Step 3). usage.input_tokens excludes cache
      // reads per Anthropic SDK convention; see LayerTokenUsage docs in
      // layer1-extractor.ts. Tracking input + output approximates marginal
      // per-request cost (the right thing for R5 cost-health alerts).
      result.layer1_cost_usd_microcents = sonnetCostMicrocents(
        layer1Result.usage.input_tokens,
        layer1Result.usage.output_tokens
      )
    } catch (err) {
      result.layer1_latency_ms = Date.now() - layer1Start
      result.error = 'layer1_throw'
      console.warn('[parallel-run] Layer 1 threw:', err instanceof Error ? err.message : err)
      return result
    }
    result.layer1_latency_ms = Date.now() - layer1Start
  }

  // ---- Tier 1 ELEMENT_FUSION detection (added 2026-05-06, M1-CP4e) ----
  // Per ADR-008 §5 step 5(b)–(c) + ADR-006 §3.10. detectTier1Trigger inspects
  // schema.element_fusion_detected.fused. When fused === true, the engine halts
  // at Layer 1; Layer 2 is not called; Layer 3 is not called; the orchestrator
  // composes a Tier 1 force-clarification response shape per ADR-008 §2.
  let elementFusionTrigger: Tier1Trigger | null
  try {
    elementFusionTrigger = detectTier1Trigger(layer1Schema)
  } catch (err) {
    // detectTier1Trigger throws only on cross-field invariant violation (which
    // validateLayer1Schema should have caught upstream). Treat as a programming
    // error and fail closed.
    result.error = 'validation_throw'
    console.warn(
      '[parallel-run] detectTier1Trigger threw (cross-field invariant; likely upstream validator gap):',
      err instanceof Error ? err.message : err
    )
    return result
  }
  if (elementFusionTrigger !== null) {
    // Tier 1 ELEMENT_FUSION fired at Layer 1. Halt; compose Tier 1 response
    // shape; skip Layer 2 + Layer 3.
    result.tier1_trigger = elementFusionTrigger
    result.output = composeTier1ResponseShape(elementFusionTrigger, result)
    // layer2_latency_ms remains null because applyMechanisms was not called.
    // layer3_latency_ms + layer3_cost remain null (Layer 3 not called).
    return result
  }

  // ---- Layer 2 (deterministic, synchronous) ----
  const layer2Start = Date.now()
  let layer2Result: Layer2Assessment | { tier1_trigger: Tier1Trigger }
  try {
    layer2Result = applyMechanisms(layer1Schema)
  } catch (err) {
    result.layer2_latency_ms = Date.now() - layer2Start
    result.error = 'validation_throw'
    console.warn('[parallel-run] Layer 2 threw (programming error):', err instanceof Error ? err.message : err)
    return result
  }
  result.layer2_latency_ms = Date.now() - layer2Start

  // ---- Tier 1 SCOPE_AMBIGUITY / TEMPORAL_AMBIGUITY short-circuit (M1-CP4e) ----
  // Per ADR-008 §5 step 5(d)–(e) + ADR-006 §3.10. applyMechanisms returns a
  // discriminated union; when `tier1_trigger` is present, the engine halted at
  // Position 2 or Position 6.
  if ('tier1_trigger' in layer2Result) {
    result.tier1_trigger = layer2Result.tier1_trigger
    result.output = composeTier1ResponseShape(layer2Result.tier1_trigger, result)
    // layer3_latency_ms + layer3_cost remain null (Layer 3 not called).
    return result
  }

  // No Tier 1 fired — Layer 2 produced a full assessment. Type-narrowed.
  const layer2Assessment: Layer2Assessment = layer2Result

  // ---- Layer 3 (with deterministic fallback) ----
  let layer3Prose: Layer3Prose
  const layer3Start = Date.now()
  try {
    const layer3Result = await generateProse(layer2Assessment, { consumer: 'api_reason' })
    layer3Prose = layer3Result.prose
    // Layer 3 cost capture (M1-CP4f Step 3). Same convention as Layer 1.
    result.layer3_cost_usd_microcents = sonnetCostMicrocents(
      layer3Result.usage.input_tokens,
      layer3Result.usage.output_tokens
    )
  } catch (err) {
    // Per ADR-007 §6: invoke the deterministic fallback so the composed output is complete.
    // Per ADR-004 §9.3: the user is never stranded by a Layer 3 failure.
    result.layer3_latency_ms = Date.now() - layer3Start
    console.warn('[parallel-run] Layer 3 generateProse threw, falling back:', err instanceof Error ? err.message : err)
    try {
      layer3Prose = generateFallbackProse(layer2Assessment)
      // Fallback path has no LLM call → zero marginal cost. Leave
      // result.layer3_cost_usd_microcents at its initial null (the comparison
      // row will record null for this case, distinguishing it from "no data
      // captured" by virtue of layer3_latency_ms being non-null).
    } catch (fallbackErr) {
      // Both LLM + fallback failed. Catastrophic — log and short-circuit.
      result.error = 'layer3_throw'
      console.warn('[parallel-run] Layer 3 fallback ALSO threw:', fallbackErr instanceof Error ? fallbackErr.message : fallbackErr)
      return result
    }
  }
  result.layer3_latency_ms = Date.now() - layer3Start

  // ---- Compose final output per ADR-004 §2.1 top-level shape ----
  result.output = {
    version: 'translation-sandwich-v1',
    extraction: layer1Schema,
    assessment: layer2Assessment,
    prose: layer3Prose,
    meta: {
      engine_attribution: 'translation-sandwich',
      layer1_latency_ms: result.layer1_latency_ms,
      layer2_latency_ms: result.layer2_latency_ms,
      layer3_latency_ms: result.layer3_latency_ms,
    },
  }
  return result
}

// ============================================================================
// TIER 1 RESPONSE-SHAPE COMPOSITION (added 2026-05-06, M1-CP4e)
// Per ADR-008 §2. The orchestrator produces the response shape *without* the
// continuation_token — the route at Step 7 issues the token (which requires
// the TRANSLATION_SANDWICH_TIER1_SECRET env var) and stitches it into the
// final response. This separation keeps token issuance dependent on the route
// (which has access to the request body for input_hash computation) while
// keeping the orchestrator pure with respect to env-var availability.
// ============================================================================

/**
 * Compose the Tier 1 force-clarification response shape per ADR-008 §2 — minus
 * the continuation_token (the route fills that in at Step 7). The result is
 * stored in result.output and surfaces in the comparison row's
 * translation_sandwich_output column. During parallel-run, this is logged but
 * does not surface to the user (failure-isolation per ADR-008 §7).
 */
function composeTier1ResponseShape(
  trigger: Tier1Trigger,
  runResult: Pick<
    SandwichRunResult,
    'layer1_latency_ms' | 'layer2_latency_ms' | 'layer1_cost_usd_microcents'
  >
): unknown {
  return {
    version: 'translation-sandwich-v1',
    clarification_required: true,
    intake_tier: 1,
    trigger_code: trigger.trigger_code,
    clarification: {
      question_text: trigger.question_text,
      stem_id: trigger.stem_id,
      slot_fills: trigger.slot_fills,
    },
    // continuation_token is filled by the route (Step 7). The orchestrator
    // emits null here; the route replaces with the issued token.
    continuation_token: null,
    evaluation_partial: null,
    meta: {
      engine_version: 'translation-sandwich-v1',
      fired_at_position: trigger.fired_at_position,
      latency_ms:
        (runResult.layer1_latency_ms ?? 0) + (runResult.layer2_latency_ms ?? 0),
      cost_usd_microcents: runResult.layer1_cost_usd_microcents ?? 0,
    },
    // R3 evaluative disclaimer is composed by the route (it has access to the
    // canonical disclaimer string from the bundled-depth path). Orchestrator
    // emits null here; the route replaces with the disclaimer.
    disclaimer: null,
  }
}

// ============================================================================
// PUBLIC ENTRY POINT
// Imported by /api/reason/route.ts ONLY.
//
// CONCURRENT EXECUTION MODEL (M1-CP4 follow-up, 2026-05-04):
//   The route fires runSageReason as a Promise and passes it here as
//   `bundledDepthPromise`. runSandwichInner runs CONCURRENTLY with bundled-
//   depth (which is already in flight by the time this function is called).
//   No deadline cutoff. Comparison row is logged once both have settled.
//
//   Total user-facing latency = max(bundled-depth, sandwich), capped only by
//   Vercel's serverless function timeout. This trades worst-case user latency
//   for guaranteed parallel-sandwich completion during the M1-CP4-CP5 testing
//   window — which is exactly what the founder directed: "during testing we
//   don't have a cutoff deadline until we know how long it takes to get an
//   appropriate result."
//
// Never throws. Every error is caught and logged to console.warn. The user
// response flow is in the route — runParallelSandwich's role is purely to
// observe both engines + log the comparison row.
// ============================================================================

/**
 * @deprecated Per M1-CP6 cutover (2026-05-08, design choice 2A): parallel-run is
 * retired. The user-facing production path on /api/reason is now `runSandwich`
 * (below). This function remains in the codebase for offline / testing /
 * curiosity use only — not called from any user-facing route post-cutover.
 *
 * Run the translation-sandwich engine concurrently with the bundled-depth
 * engine and log a comparison row when both settle.
 *
 * NEVER throws. Every error is caught and logged to console.warn.
 * If TRANSLATION_SANDWICH_PARALLEL_RUN is unset/"0", awaits bundled (so the
 * route can extract the result) and returns without sandwich activity.
 *
 * Per ADR-004 §6.3 (Failure isolation): the user is unaffected by
 * translation-sandwich failures.
 *
 * @param params - Layer-1 inputs + the bundled-depth promise + start timestamp.
 */
export async function runParallelSandwich(params: ParallelRunInput): Promise<void> {
  if (!PARALLEL_RUN_ENABLED) return

  try {
    // 1. Cost-cap check.
    const capStatus = await readCostTracker()
    let sandwichResult: SandwichRunResult
    if (capStatus.cap_reached) {
      sandwichResult = {
        output: null,
        error: 'cost_cap_reached',
        layer1_latency_ms: null,
        layer2_latency_ms: null,
        layer3_latency_ms: null,
        layer1_cost_usd_microcents: null,
        layer3_cost_usd_microcents: null,
        tier1_trigger: null,
      }
    } else {
      // 2. Fire the sandwich. Runs concurrently with bundled-depth (which the
      //    route fired before calling us). No deadline.
      sandwichResult = await runSandwichInner(params)
    }
    // capStatus.read_failed: fail-open posture — proceed; logged inside readCostTracker.

    // 3. Wait for bundled-depth to settle. By this point the sandwich is done;
    //    bundled may already be done (if it was faster) or still running (if
    //    sandwich was faster). Either way we wait — total latency from the
    //    user's perspective is max(bundled, sandwich).
    let bundledOutput: unknown
    try {
      bundledOutput = await params.bundledDepthPromise
    } catch (err) {
      // Bundled threw. The route's outer try/catch will return 500 to the user.
      // We skip the comparison-row write because the table's bundled_depth_output
      // column is NOT NULL. Log the sandwich outcome to console.warn so it's
      // recoverable from Vercel logs if needed.
      console.warn(
        '[parallel-run] bundled-depth threw; comparison row skipped. Sandwich outcome:',
        sandwichResult.error ?? 'completed',
        'err:',
        err instanceof Error ? err.message : err
      )
      return
    }
    const bundledLatencyMs = Date.now() - params.bundledStartedAt

    // 4. Log comparison row.
    const requestId = randomUUID()
    const inputHash = sha256Hex(params.input)
    await logComparisonRow(
      params,
      requestId,
      inputHash,
      bundledOutput,
      bundledLatencyMs,
      sandwichResult
    )

    // 5. Increment cost tracker (skip when cost-cap-reached path).
    if (sandwichResult.error !== 'cost_cap_reached') {
      const totalCost =
        (sandwichResult.layer1_cost_usd_microcents ?? 0) +
        (sandwichResult.layer3_cost_usd_microcents ?? 0)
      await incrementCostTracker(totalCost)
    }
  } catch (err) {
    // Defense-in-depth — every helper swallows errors internally. Backstop here.
    console.warn('[parallel-run] runParallelSandwich caught unexpected error:', err)
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function sha256Hex(text: string): string {
  return createHash('sha256').update(text).digest('hex')
}

// ============================================================================
// HARNESS-FACING EXPORTS
// These exports support Phase 6 (end-to-end orchestration) + Phase 8 (fallback
// semantics) testing without requiring the harness to know about Supabase.
// ============================================================================

/**
 * Compose Layer 1 → Layer 2 → Layer 3 without any DB I/O. Returns the same
 * SandwichRunResult shape as the production path. Never throws.
 *
 * The harness uses this directly to verify end-to-end orchestration without
 * needing Supabase access. The production runParallelSandwich also uses this
 * internally (via runWithDeadline).
 */
export async function runSandwichForHarness(params: SandwichInput): Promise<SandwichRunResult> {
  return runSandwichInner(params)
}

// ============================================================================
// PRODUCTION ENTRY POINT (M1-CP6 cutover — 2026-05-08)
// Per design choice 2A: parallel-run retired; sandwich is the sole user-facing
// path on /api/reason. This function is the production orchestrator.
//
// No DB I/O — no comparison row, no cost tracker. Failure isolation per
// ADR-004 §9 is the route's responsibility: Layer 1/2/3 throws are surfaced
// via the SandwichRunResult.error discriminator; the route composes the
// deterministic minimal fallback per design choice 1C.
//
// runParallelSandwich (above) is retained for offline / testing / curiosity
// use only (per founder's 2F brainstorm note — bundled is renamed for
// non-production use; the parallel-run orchestrator follows it). Not called
// from any user-facing route post-cutover.
// ============================================================================

/**
 * Run the translation-sandwich engine and return the result.
 * Never throws. Every error is captured in result.error.
 */
export async function runSandwich(params: SandwichInput): Promise<SandwichRunResult> {
  return runSandwichInner(params)
}

/** Test-only: read the activation flag without re-importing the env. */
export function isParallelRunEnabled(): boolean {
  return PARALLEL_RUN_ENABLED
}

/** Test-only: cost-cap constants for harness Phase 9 reporting.
 *  No deadline_ms field — concurrent execution model has no cutoff during
 *  the M1-CP4-CP5 testing window per founder directive. */
export const PARALLEL_RUN_CONFIG = {
  CAP_USD_MICROCENTS: CAP_USD_MICROCENTS.toString(),
  CAP_REQUEST_COUNT,
  CAP_DAYS,
  EXECUTION_MODEL: 'concurrent_no_deadline' as const,
  SONNET_INPUT_USD_PER_MILLION_TOKENS,
  SONNET_OUTPUT_USD_PER_MILLION_TOKENS,
} as const
