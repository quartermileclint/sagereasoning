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

import { extractFeatures } from './layer1-extractor'
import { applyMechanisms } from './layer2-mechanisms'
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
// Update if Anthropic pricing changes. Used at M1-CP5 when extractFeatures +
// generateProse are extended to expose token usage; capture path scaffolded
// here for that future integration. Currently logged in Phase 9 reporting only.
const SONNET_INPUT_USD_PER_MILLION_TOKENS = 3
const SONNET_OUTPUT_USD_PER_MILLION_TOKENS = 15

// Deadline grace period AFTER runSageReason returns. The parallel sandwich has
// up to this long to complete before the user response proceeds.
// Per Step 1(e): 500ms is a starting point.
const PARALLEL_DEADLINE_MS = 500

// ============================================================================
// TYPES
// ============================================================================

export interface ParallelRunInput {
  // ---- Same inputs as runSageReason (passed through to Layer 1) ----
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

  // ---- Bundled-depth context for the comparison row ----
  /** The full ReasonResult object returned by runSageReason. */
  bundledDepthOutput: unknown
  /** Latency of the bundled-depth call in milliseconds. */
  bundledDepthLatencyMs: number
}

type FailureCategory =
  | 'layer1_throw'
  | 'layer3_throw'
  | 'validation_throw'
  | 'cost_cap_reached'
  | 'deadline_exceeded'

interface SandwichRunResult {
  output: unknown // The composed { extraction, assessment, prose, ... } shape (or null on failure)
  error: FailureCategory | null
  layer1_latency_ms: number | null
  layer2_latency_ms: number | null
  layer3_latency_ms: number | null
  layer1_cost_usd_microcents: number | null
  layer3_cost_usd_microcents: number | null
}

// ============================================================================
// COST CALCULATION (utility — currently unused; activated at M1-CP5)
//
// Convert Anthropic SDK usage (input_tokens, output_tokens) to USD microcents.
// 1 microcent = $0.000001. So Sonnet input @ $3/M tokens = 3 microcents/token.
// Exported so M1-CP5 can wire it without a parallel-run module amendment.
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

async function logComparison(
  params: ParallelRunInput,
  requestId: string,
  inputHash: string,
  result: SandwichRunResult
): Promise<void> {
  try {
    const { error } = await getAdminClient()
      .from('translation_sandwich_comparisons')
      .insert({
        request_id: requestId,
        input_text_hash: inputHash,
        bundled_depth_output: params.bundledDepthOutput,
        translation_sandwich_output: result.output,
        translation_sandwich_error: result.error,
        layer1_latency_ms: result.layer1_latency_ms,
        layer2_latency_ms: result.layer2_latency_ms,
        layer3_latency_ms: result.layer3_latency_ms,
        bundled_depth_latency_ms: params.bundledDepthLatencyMs,
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

async function runSandwichInner(params: ParallelRunInput): Promise<SandwichRunResult> {
  const result: SandwichRunResult = {
    output: null,
    error: null,
    layer1_latency_ms: null,
    layer2_latency_ms: null,
    layer3_latency_ms: null,
    layer1_cost_usd_microcents: null,
    layer3_cost_usd_microcents: null,
  }

  // ---- Layer 1 ----
  let layer1Schema
  const layer1Start = Date.now()
  try {
    layer1Schema = await extractFeatures({
      input: params.input,
      context: params.context,
      domain_context: params.domain_context,
      urgency_context: params.urgency_context,
      stoicBrainContext: params.stoicBrainContext,
      retrievedPassages: params.retrievedPassages,
      practitionerContext: params.practitionerContext,
      projectContext: params.projectContext,
    })
  } catch (err) {
    result.layer1_latency_ms = Date.now() - layer1Start
    result.error = 'layer1_throw'
    console.warn('[parallel-run] Layer 1 threw:', err instanceof Error ? err.message : err)
    return result
  }
  result.layer1_latency_ms = Date.now() - layer1Start
  // Layer 1 cost is currently not captured because extractFeatures does not
  // expose token usage. Revisit at M1-CP5 by extending the layer module to
  // return usage alongside the schema. For now, log null.
  result.layer1_cost_usd_microcents = null

  // ---- Layer 2 (deterministic, synchronous) ----
  const layer2Start = Date.now()
  let layer2Assessment
  try {
    layer2Assessment = applyMechanisms(layer1Schema)
  } catch (err) {
    result.layer2_latency_ms = Date.now() - layer2Start
    result.error = 'validation_throw'
    console.warn('[parallel-run] Layer 2 threw (programming error):', err instanceof Error ? err.message : err)
    return result
  }
  result.layer2_latency_ms = Date.now() - layer2Start

  // ---- Layer 3 (with deterministic fallback) ----
  let layer3Prose: Layer3Prose
  const layer3Start = Date.now()
  try {
    layer3Prose = await generateProse(layer2Assessment, { consumer: 'api_reason' })
  } catch (err) {
    // Per ADR-007 §6: invoke the deterministic fallback so the composed output is complete.
    // Per ADR-004 §9.3: the user is never stranded by a Layer 3 failure.
    result.layer3_latency_ms = Date.now() - layer3Start
    console.warn('[parallel-run] Layer 3 generateProse threw, falling back:', err instanceof Error ? err.message : err)
    try {
      layer3Prose = generateFallbackProse(layer2Assessment)
    } catch (fallbackErr) {
      // Both LLM + fallback failed. Catastrophic — log and short-circuit.
      result.error = 'layer3_throw'
      console.warn('[parallel-run] Layer 3 fallback ALSO threw:', fallbackErr instanceof Error ? fallbackErr.message : fallbackErr)
      return result
    }
  }
  result.layer3_latency_ms = Date.now() - layer3Start
  // Layer 3 cost is currently not captured (same reason as Layer 1). Revisit at M1-CP5.
  result.layer3_cost_usd_microcents = null

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
// DEADLINE WRAPPER
// Per Step 1(e): the parallel sandwich has up to PARALLEL_DEADLINE_MS to
// complete after invocation. If it does not finish in time, we proceed with
// 'deadline_exceeded' and the in-flight sandwich is killed by Vercel after
// the user response is sent (KG1 rule 4).
// ============================================================================

async function runWithDeadline(
  params: ParallelRunInput,
  deadlineMs: number
): Promise<SandwichRunResult> {
  const sandwichPromise = runSandwichInner(params)
  // Attach a no-op catch so a deadline-loss does not produce an unhandled rejection.
  sandwichPromise.catch(() => {/* deadline already won; outcome is logged by the deadline branch */})

  const deadlineSentinel = Symbol('deadline')
  const deadlinePromise = new Promise<typeof deadlineSentinel>((resolve) =>
    setTimeout(() => resolve(deadlineSentinel), deadlineMs)
  )

  const winner = await Promise.race([sandwichPromise, deadlinePromise])
  if (winner === deadlineSentinel) {
    return {
      output: null,
      error: 'deadline_exceeded',
      layer1_latency_ms: null,
      layer2_latency_ms: null,
      layer3_latency_ms: null,
      layer1_cost_usd_microcents: null,
      layer3_cost_usd_microcents: null,
    }
  }
  return winner as SandwichRunResult
}

// ============================================================================
// PUBLIC ENTRY POINT
// Imported by /api/reason/route.ts ONLY. Invoked AFTER runSageReason returns
// and BEFORE the response is sent. Never throws.
// ============================================================================

/**
 * Run the translation-sandwich engine in parallel-run mode and log a comparison row.
 *
 * NEVER throws. Every error is caught and logged to console.warn.
 * If the env flag TRANSLATION_SANDWICH_PARALLEL_RUN is unset/"0", returns immediately.
 *
 * Per ADR-004 §6.3 (Failure isolation): the user is unaffected by translation-sandwich failures.
 *
 * @param params - The same inputs runSageReason received plus the bundled-depth output.
 */
export async function runParallelSandwich(params: ParallelRunInput): Promise<void> {
  if (!PARALLEL_RUN_ENABLED) return

  try {
    // 1. Cost-cap check.
    const capStatus = await readCostTracker()
    if (capStatus.cap_reached) {
      const requestId = randomUUID()
      const inputHash = sha256Hex(params.input)
      await logComparison(params, requestId, inputHash, {
        output: null,
        error: 'cost_cap_reached',
        layer1_latency_ms: null,
        layer2_latency_ms: null,
        layer3_latency_ms: null,
        layer1_cost_usd_microcents: null,
        layer3_cost_usd_microcents: null,
      })
      return
    }
    if (capStatus.read_failed) {
      // Continue conservatively — read failed but we proceed (cap may not enforce
      // for this request). Logged in readCostTracker. We could fail closed here
      // instead; current choice is fail open to keep the parallel-run period
      // running through transient Supabase blips.
    }

    // 2. Run the sandwich with deadline.
    const requestId = randomUUID()
    const inputHash = sha256Hex(params.input)
    const sandwichResult = await runWithDeadline(params, PARALLEL_DEADLINE_MS)

    // 3. Log comparison row (always, even on failure).
    await logComparison(params, requestId, inputHash, sandwichResult)

    // 4. Increment cost tracker (only on attempts that actually called the LLM —
    //    deadline_exceeded incurs partial cost; we count it conservatively as 0
    //    here because we do not have token counts; revisit at M1-CP5 when the
    //    layer modules return usage).
    if (sandwichResult.error !== 'cost_cap_reached') {
      const totalCost =
        (sandwichResult.layer1_cost_usd_microcents ?? 0) +
        (sandwichResult.layer3_cost_usd_microcents ?? 0)
      await incrementCostTracker(totalCost)
    }
  } catch (err) {
    // Defense-in-depth — runWithDeadline + logComparison + incrementCostTracker
    // all swallow errors internally, but if any unexpected throw escapes, catch it here.
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
export async function runSandwichForHarness(params: ParallelRunInput): Promise<SandwichRunResult> {
  return runSandwichInner(params)
}

/** Test-only: read the activation flag without re-importing the env. */
export function isParallelRunEnabled(): boolean {
  return PARALLEL_RUN_ENABLED
}

/** Test-only: cost-cap constants for harness Phase 9 reporting. */
export const PARALLEL_RUN_CONFIG = {
  CAP_USD_MICROCENTS: CAP_USD_MICROCENTS.toString(),
  CAP_REQUEST_COUNT,
  CAP_DAYS,
  PARALLEL_DEADLINE_MS,
  SONNET_INPUT_USD_PER_MILLION_TOKENS,
  SONNET_OUTPUT_USD_PER_MILLION_TOKENS,
} as const
