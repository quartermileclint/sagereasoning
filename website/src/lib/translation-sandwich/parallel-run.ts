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

// A12 (2026-06-03): OTel layer-span emission. No-op unless SUBSTRATE_OTEL_ENABLED.
// Covers Layer 1/2/3 ONLY — NOT the A7 R20a gate or its wrappers (PR6 boundary).
import { emitLayerSpan } from '@/lib/substrate/substrate-telemetry'

import { extractFeatures, type Layer1Schema } from './layer1-extractor'
import {
  applyMechanisms,
  detectTier1Trigger,
  type Tier1Trigger,
  type Layer2Assessment,
} from './layer2-mechanisms'
// Mechanism-correction M5 (CI-4 reason-route half): the loop-closure
// examination markers the route builds and runSandwichInner attaches inside the
// signed assessment. See reason-loop-closure.ts.
import { examinationOpen, type ExaminationMarkers } from './reason-loop-closure'
import {
  generateProse,
  generateFallbackProse,
  type Layer3Prose,
} from './layer3-prose'
// Stage 1 A3 (D-A3-LAYER2-SIGNING-WIRED-...): cryptographic signing of the
// authoritative Layer2Assessment. Per /adopted/ADR-layer2-signing-infrastructure.md
// Decision 1 (Ed25519) + Decision 2 (Layer2Assessment-only signed payload).
// Wired between Layer 2 production and composed-output construction below.
// Fail-closed: SubstrateSigningKeyMissingError surfaces as error='signing_throw';
// the route translates that to a 503 user-facing response.
import {
  signLayer2Assessment,
  SubstrateSigningKeyMissingError,
  type SignedLayer2Assessment,
} from './layer2-signer'
// Stage 1 A5 (D-A5-LAYER3-SCAFFOLDED-...): substrate Layer 3 service.
// Wraps the existing Layer 3 prose with deterministic R3 + R19 + R20a + R18a +
// R18e injections; projects AC9 / AC10 / AC11 fields. Activation gated by
// SUBSTRATE_LAYER3_ENABLED env flag (default OFF). When OFF, the existing
// generateProse path runs exactly as today (byte-identical behaviour).
// When ON, A5 wraps the prose AFTER generateProse returns; the wrapped
// Layer3Response is surfaced as a new top-level `substrate_layer3_response`
// field on the composed output. The existing user-facing fields (extraction,
// assessment, prose, meta, disclaimer) are preserved unchanged.
// PR1 single-endpoint proof: /api/reason is the proof endpoint for A5.
import {
  applyLayer3Injections,
  isSubstrateLayer3Enabled,
  type Layer3Response,
} from '@/lib/substrate/layer3-service'
// Stage 1 A7 (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13): substrate
// server-side R20a gate. Sits between Layer 1 and Layer 2 inside
// runSandwichInner. Decides PASS / REDIRECT / BYPASSED based on the feature
// flag SUBSTRATE_R20A_GATE_ENABLED (default OFF). When OFF, A7 returns
// BYPASSED and the orchestrator falls through to existing logic unchanged.
// When ON, A7 reuses the SafetyGate from the route-level perimeter check
// (zero added latency) or runs a fresh classifier call.
//
// REDIRECT → orchestrator short-circuits Layer 2 + Layer 3; sets error=
// 'r20a_gate_redirect'; the route translates to a user-facing redirect.
// PASS + distress_signal=true (mild) → attached to Layer2Assessment AFTER
// applyMechanisms; A5.4 reads the flag during Layer 3 prose generation
// and injects R20A_DISTRESS_PASSTHROUGH.
//
// PR1 single-endpoint proof: /api/reason is the proof endpoint for A7.
import {
  enforceLayer2R20aGate,
  attachDistressSignalToAssessment,
  isSubstrateR20aGateEnabled,
  type R20aGateOutput,
} from '@/lib/substrate/r20a-gate'
import type { SafetyGate } from '@/lib/constraints'
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

/**
 * Stage 1 A3 — Layer 2 signing activation flag. Read once at module load.
 * Set SUBSTRATE_LAYER2_SIGNING_ENABLED='true' in Vercel env to activate
 * cryptographic signing of every Layer2Assessment.
 *
 * When 'true': the composed sandwich output's `assessment` field carries
 * {assessment, signature, key_id} instead of the bare Layer2Assessment.
 * Verifiers (plugins, third-party agents) check signatures against the
 * public key published at /api/public-key.
 *
 * When unset/'false' (the default — pre-flag-flip and rollback Path A):
 * the `assessment` field carries the bare Layer2Assessment exactly as today.
 * Behaviour is byte-identical to the pre-A3 wire format.
 *
 * Per /adopted/ADR-layer2-signing-infrastructure.md §"Critical Change Protocol
 * responses" — Path A rollback is "flip this flag false" (~30s recovery via
 * Vercel redeploy).
 */
const SUBSTRATE_LAYER2_SIGNING_ENABLED =
  process.env.SUBSTRATE_LAYER2_SIGNING_ENABLED === 'true'

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
  /**
   * A12 (2026-06-03): correlation id — loop_id when present on /api/reason, else
   * a server-generated reason_id. Stamped on the OTel layer spans + carried to the
   * audit row so a trace, a loop_billing_events row, and a substrate_audit_events
   * row share one join key. Optional + observability-only; absence changes nothing.
   */
  correlationId?: string
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
  /**
   * Added 2026-06-12 (M1 CI-1, D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12):
   * request to defer Layer-3 prose generation out of the hot path
   * (response_format: 'assessment_first' on /api/reason, gated by
   * SUBSTRATE_L3_DEFER_ENABLED — the route only sets this when the flag is on).
   *
   * A REQUEST, not a guarantee: the orchestrator applies the structural
   * distress guard (M1 election 5) — when the A7 gate attached a mild-severity
   * distress_signal to the Layer2Assessment, prose generation stays
   * synchronous and inline exactly as today, and `prose_deferred` comes back
   * false. Moderate/acute distress never reaches Layer 3 at all (route-level
   * perimeter + the A7 REDIRECT short-circuit above).
   *
   * When deferral is active: generateProse and the A5 injection wrapper are
   * NOT called; the composed output carries `prose: null`; the bare
   * Layer2Assessment is exposed on `result.layer2_assessment` so the route can
   * generate-and-retain after the response (CI-17 existence guarantee:
   * deferral moves generation, never suppresses it).
   *
   * When undefined (the default — every existing caller), behaviour is
   * byte-identical to the pre-M1 state.
   */
  deferProse?: boolean
  /**
   * Added 2026-05-13 (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13):
   * SafetyGate token from the route-level R20a perimeter check
   * (constraints.ts §enforceDistressCheck).
   *
   * When provided (the /api/reason path — the route at line 544 already
   * ran detectDistressTwoStage on the input), A7 inside runSandwichInner
   * REUSES this gate's result without making a new classifier call. Zero
   * added latency.
   *
   * When undefined (future substrate consumers that don't have their own
   * route-level perimeter), A7 runs a fresh classifier call inheriting
   * the AC2 ~500ms regex → Haiku budget.
   *
   * The gate-passthrough is the operational basis for A7's "defence in
   * depth" + "mild-severity gap closure" without doubling the safety-
   * classifier cost on /api/reason traffic.
   */
  safetyGate?: SafetyGate
  /**
   * Added 2026-06-13 (mechanism-correction M5, CI-4 reason-route half;
   * D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12): loop-closure
   * examination markers. The route builds these (and only passes them) when
   * SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED is on. runSandwichInner attaches them
   * to the Layer2Assessment BEFORE signing (both the deferred and inline
   * paths), so they sit INSIDE the signature and the M3 write-boundary gate can
   * trust them; it also surfaces a top-level `examination_open` on the composed
   * output (true when this examination issued a redirection — owes a
   * re-examination).
   *
   * When undefined (the default — flag off, and every existing caller),
   * behaviour is byte-identical to the pre-M5 state: no markers, no
   * examination_open.
   */
  loopClosure?: ExaminationMarkers
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
  // Added 2026-05-MM (D-A3-LAYER2-SIGNING-WIRED-...) — Layer 2 signing failed
  // (env var unset/malformed, or canonicalisation rejected a value). Per
  // /adopted/ADR-layer2-signing-infrastructure.md §"Critical Change Protocol
  // responses" — fail-closed: the substrate never returns an unsigned
  // assessment when signing is enabled. The route translates this to a 503
  // user-facing response (substrate_signing_unavailable).
  | 'signing_throw'
  // Added 2026-05-13 (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13) — A7
  // server-side R20a gate decided REDIRECT. The substrate short-circuited
  // Layer 2 + Layer 3; the orchestrator's `output` field carries a redirect
  // shape with the user-facing redirect_message. The route translates this
  // to a 200 user-facing redirect response (matching the pattern at the
  // route-level perimeter line 544-549). For /api/reason this branch is
  // mostly defence-in-depth (line 544 already handles MODERATE/ACUTE before
  // runSandwich is called); for future substrate consumers without their
  // own perimeter, this is the primary REDIRECT surface.
  | 'r20a_gate_redirect'

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
  // Added 2026-05-12 (D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12) — substrate
  // Layer 3 service response when SUBSTRATE_LAYER3_ENABLED is 'true'. Null when
  // flag is off (the default; byte-identical to pre-A5 behaviour). Surfaced on
  // the composed output as `substrate_layer3_response` for downstream consumers.
  substrate_layer3_response: Layer3Response | null
  // Added 2026-05-13 (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13) — A7
  // server-side R20a gate output. Null when SUBSTRATE_R20A_GATE_ENABLED is
  // unset (the default; byte-identical to pre-A7 behaviour). When the flag
  // is on, carries the R20aGateOutput discriminated union (PASS / REDIRECT
  // / BYPASSED). PASS + distress_signal=true is attached to Layer2Assessment
  // via attachDistressSignalToAssessment so A5.4 reads it in Layer 3 prose
  // generation. REDIRECT short-circuits Layer 2 + Layer 3 and sets
  // result.error='r20a_gate_redirect'.
  substrate_r20a_gate_output: R20aGateOutput | null
  // Added 2026-06-12 (M1 CI-1) — true when Layer-3 prose generation was
  // deferred out of the hot path (params.deferProse honoured AND the
  // structural distress guard passed). The composed output carries
  // `prose: null`; the route generates-and-retains after the response.
  // Always false when params.deferProse is undefined (every pre-M1 caller).
  prose_deferred: boolean
  // Added 2026-06-12 (M1 CI-1) — the bare (unsigned) Layer2Assessment on the
  // happy path, for post-response narrative generation + retention
  // (generateProse takes the bare assessment; output.assessment may be the
  // signed wrapper). Null on Tier-1 / redirect / throw paths. Internal field —
  // NOT part of the wire output.
  layer2_assessment: Layer2Assessment | null
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
// M1 CI-1 (2026-06-12) — prose-deferral flag + the structural distress guard.
// Defined HERE (not in narrative-retention.ts, which re-exports them) because
// the orchestrator below is the load-bearing call site and narrative-retention
// imports from this module (cycle avoidance). Per the founder's M1 elections
// (D-MECHANISM-CORRECTION-BUILD-PLAN-APPROVED-2026-06-12).
// ============================================================================

/**
 * Election 1: SUBSTRATE_L3_DEFER_ENABLED, read at CALL TIME (the A5/A7
 * pattern — a flag change needs no code change). UNSET (production default) →
 * deferral structurally unavailable everywhere; behaviour byte-identical.
 */
export function isL3DeferEnabled(): boolean {
  return process.env.SUBSTRATE_L3_DEFER_ENABLED === 'true'
}

/**
 * Election 5: may Layer-3 prose generation be deferred out of the hot path?
 *
 * The distress guard is STRUCTURAL: a truthy `distress_signal` on the
 * Layer2Assessment (the A7 PASS + mild-severity attachment) makes deferral
 * unavailable regardless of what the caller requested — the prose (and, when
 * SUBSTRATE_LAYER3_ENABLED, its R20A_DISTRESS_PASSTHROUGH injection) stays
 * synchronous and inline exactly as today. Moderate/acute distress never
 * reaches Layer 3 at all (route-level perimeter + the A7 REDIRECT
 * short-circuit) — verified at the M1 session open. This function does not
 * touch the classifier, the A7 gate, or the A5 wrapper; it reads an
 * already-attached field. PR6 posture preserved.
 */
export function shouldDeferProse(args: {
  deferRequested: boolean
  flagEnabled: boolean
  distressSignal: boolean | undefined
}): boolean {
  if (!args.flagEnabled) return false
  if (!args.deferRequested) return false
  if (args.distressSignal === true) return false
  return true
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
    substrate_layer3_response: null,
    substrate_r20a_gate_output: null,
    prose_deferred: false,
    layer2_assessment: null,
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

  // A12: emit the Layer 1 GenAI span (no-op unless SUBSTRATE_OTEL_ENABLED). genAI
  // is false on the plugin pre-extracted path (no server-side LLM call ran).
  emitLayerSpan({
    name: 'substrate.layer1.extract_features',
    startMs: layer1Start,
    latencyMs: result.layer1_latency_ms,
    genAI: params.preExtractedLayer1Schema === undefined,
    model: 'claude-sonnet-4-6',
    costMicrocents: result.layer1_cost_usd_microcents,
    ok: true,
    correlationId: params.correlationId,
  })

  // ---- A7 substrate R20a gate (D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13) ----
  // Per /adopted/substrate-plugin-staging-plan.md Stage 1 item A7.
  // Per /website/src/lib/substrate/r20a-gate.ts.
  //
  // A7 sits AFTER Layer 1 extraction and BEFORE the Tier 1 ELEMENT_FUSION
  // detection (founder Option (a) election at session-open 2026-05-13 —
  // distress redirect takes precedence over clarification questions).
  //
  // SUBSTRATE_R20A_GATE_ENABLED gates the entire A7 path. When OFF (the
  // default), the flag check short-circuits before any classifier work;
  // behaviour is byte-identical to pre-A7. When ON:
  //
  //   - A7 reuses params.safetyGate when provided (the /api/reason route
  //     passes its line-544 gate down; zero added latency).
  //   - A7 makes a fresh classifier call otherwise (future substrate
  //     consumers without their own perimeter; inherits AC2 ~500ms budget).
  //   - REDIRECT (moderate/acute) → short-circuit Layer 2 + Layer 3; set
  //     error='r20a_gate_redirect'; output carries the redirect shape; the
  //     route translates to a user-facing redirect response.
  //   - PASS + distress_signal=true (mild severity) → store for later
  //     attachment AFTER applyMechanisms; A5.4 reads the flag at Layer 3.
  //   - PASS + distress_signal=false → no special handling; continue.
  //
  // PR1 single-endpoint proof: /api/reason is the proof endpoint for A7.
  // PR2 build-to-wire-immediate: invocation verified by Step 4 grep in
  //   the same session.
  // PR3 synchronous: enforceLayer2R20aGate is awaited; no fire-and-forget.
  // PR6 safety-critical: A7 is the second-layer R20a defence; Critical
  //   change classification per 0d-ii.
  // AC2 latency: reused-gate path is zero added latency; fresh-call path
  //   inherits the existing classifier's ~500ms budget.
  // AC4 invocation testing: the grep on parallel-run.ts in the same session
  //   confirms enforceLayer2R20aGate is called here.
  // AC5 perimeter: A7 does NOT add a ninth perimeter route. A7 is a
  //   substrate-internal function. The eight enumerated perimeter routes
  //   are unchanged.
  // AC7: not engaged. A7 doesn't touch auth, sessions, or redirects.
  let a7GateOutput: R20aGateOutput | null = null
  if (isSubstrateR20aGateEnabled()) {
    a7GateOutput = await enforceLayer2R20aGate({
      text: params.input,
      gate: params.safetyGate,
    })
    result.substrate_r20a_gate_output = a7GateOutput

    if (a7GateOutput.decision === 'REDIRECT') {
      result.error = 'r20a_gate_redirect'
      result.output = {
        version: 'translation-sandwich-v1',
        distress_detected: true,
        severity: a7GateOutput.severity,
        redirect_message: a7GateOutput.redirect_message,
        meta: {
          engine_attribution: 'translation-sandwich',
          r20a_gate_redirect: true,
          r20a_gate_source: a7GateOutput.source,
        },
      }
      // layer2_latency_ms, layer3_latency_ms remain null (Layer 2 + 3 not called).
      return result
    }
    // PASS or BYPASSED → continue. PASS+distress_signal=true is attached
    // after applyMechanisms below.
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

  // A12: emit the Layer 2 deterministic span (internal; no GenAI attributes).
  emitLayerSpan({
    name: 'substrate.layer2.apply_mechanisms',
    startMs: layer2Start,
    latencyMs: result.layer2_latency_ms,
    genAI: false,
    ok: true,
    correlationId: params.correlationId,
  })

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
  // Mutable so A7's distress_signal attachment can rebind it below.
  let layer2Assessment: Layer2Assessment = layer2Result

  // ---- A7 distress_signal attachment (PASS + mild severity case) ----
  // Per D-A7-R20A-GATE-SCAFFOLDED-VERIFIED-2026-05-13 + r20a-gate.ts §A7.3.
  //
  // A7 ran above (between Layer 1 and Tier 1 ELEMENT_FUSION). If A7 returned
  // PASS with a sub-threshold (mild-severity) distress signal, attach the
  // flag to the Layer2Assessment so A5.4 (in Layer 3 prose generation)
  // reads it and injects R20A_DISTRESS_PASSTHROUGH into the prose output.
  //
  // attachDistressSignalToAssessment is a no-op when:
  //   - a7GateOutput is null (flag was off; BYPASSED)
  //   - a7GateOutput.decision === 'BYPASSED' or 'REDIRECT' (latter is
  //     unreachable here because REDIRECT short-circuits above)
  //   - a7GateOutput.distress_signal === false (no signal)
  //
  // AC4 invocation testing: the grep on parallel-run.ts confirms
  // attachDistressSignalToAssessment is called here.
  if (a7GateOutput !== null) {
    layer2Assessment = attachDistressSignalToAssessment(layer2Assessment, a7GateOutput)
  }

  // ---- M5 CI-4 (2026-06-13): loop-closure examination markers ----
  // Attach the markers the route built (only present when
  // SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED is on) BEFORE signing — both the
  // deferred path (signs at the deferral branch below) and the inline path
  // (signs before the final compose) sign the marked assessment, so the markers
  // sit INSIDE the signature and the M3 write-boundary gate can trust them.
  //
  // params.loopClosure is already shaped to omit prior_feedback_ref when absent
  // (buildExaminationMarkers in reason-loop-closure.ts) — never an undefined
  // value, which the Layer-2 canonicaliser would reject. When undefined (flag
  // off / legacy caller), the field is never added: byte-identical signing.
  if (params.loopClosure !== undefined) {
    layer2Assessment = { ...layer2Assessment, examination: params.loopClosure }
  }

  // ---- M1 CI-1 (2026-06-12): prose-deferral decision ----
  // The bare assessment is exposed for post-response narrative generation +
  // retention regardless of deferral (the route's inline-retention path needs
  // it too — election 4d: every examination retained when the flag is on).
  result.layer2_assessment = layer2Assessment

  // Election 5 structural distress guard inside shouldDeferProse: a truthy
  // distress_signal (A7 PASS+mild attachment, line above) forces the inline
  // synchronous path below — generateProse + the A5 injection wrapper run
  // exactly as today. isL3DeferEnabled() is defence-in-depth: even a future
  // caller passing deferProse without the flag cannot defer.
  const deferralActive = shouldDeferProse({
    deferRequested: params.deferProse === true,
    flagEnabled: isL3DeferEnabled(),
    distressSignal: (layer2Assessment as { distress_signal?: boolean }).distress_signal,
  })

  if (deferralActive) {
    result.prose_deferred = true

    // Same A3 signing logic + fail-closed posture as the inline path below
    // (deliberately duplicated rather than restructuring the inline flow —
    // the assessment returned immediately must be signed exactly as today).
    let deferredAssessmentField: Layer2Assessment | SignedLayer2Assessment = layer2Assessment
    if (SUBSTRATE_LAYER2_SIGNING_ENABLED) {
      try {
        deferredAssessmentField = signLayer2Assessment(layer2Assessment)
      } catch (err) {
        result.error = 'signing_throw'
        console.warn(
          '[parallel-run] Layer 2 signing failed on deferred path (fail-closed; route returns 503):',
          err instanceof SubstrateSigningKeyMissingError
            ? err.message
            : err instanceof Error
              ? err.message
              : String(err)
        )
        return result
      }
    }

    // CI-17: prose: null here is NOT a verdict-only configuration — the route
    // writes the pending retention row before responding and generation
    // completes via waitUntil or the narrative-sweep backstop. Deferral moves
    // generation; it never suppresses it.
    result.output = {
      version: 'translation-sandwich-v1',
      extraction: layer1Schema,
      assessment: deferredAssessmentField,
      prose: null,
      // M5 CI-4 (2026-06-13): present only when the route passed loop-closure
      // markers (SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED on). True when this
      // examination issued a redirection (improvement_path_structured non-null)
      // — i.e. it owes a same-depth re-examination before the loop is closed.
      ...(params.loopClosure !== undefined && {
        examination_open: examinationOpen(layer2Assessment),
      }),
      meta: {
        engine_attribution: 'translation-sandwich',
        layer1_latency_ms: result.layer1_latency_ms,
        layer2_latency_ms: result.layer2_latency_ms,
        layer3_latency_ms: null,
      },
    }
    return result
  }

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

  // A12: emit the Layer 3 GenAI span (no-op unless SUBSTRATE_OTEL_ENABLED). On the
  // deterministic-fallback path layer3_cost is null (no LLM cost) — recorded as such.
  emitLayerSpan({
    name: 'substrate.layer3.generate_prose',
    startMs: layer3Start,
    latencyMs: result.layer3_latency_ms,
    genAI: true,
    model: 'claude-sonnet-4-6',
    costMicrocents: result.layer3_cost_usd_microcents,
    ok: true,
    correlationId: params.correlationId,
  })

  // ---- A5 substrate Layer 3 service wiring (D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12) ----
  // Per /adopted/substrate-plugin-staging-plan.md Stage 1 item A5.
  // Per /website/src/lib/substrate/layer3-service.ts.
  //
  // SUBSTRATE_LAYER3_ENABLED gates A5 wiring. When OFF (the default), control
  // flow skips the A5 call entirely — behaviour is byte-identical to pre-A5.
  // When ON, applyLayer3Injections wraps the just-generated Layer3Prose with
  // the five deterministic injections (R3 + R19c + R19d + R20a + R18a + R18e)
  // and projects AC9/AC10/AC11 fields. The Layer3Response is attached to the
  // SandwichRunResult; the route or downstream consumers can read it.
  //
  // PR1 single-endpoint proof: /api/reason is the proof endpoint for A5.
  // PR3 synchronous: applyLayer3Injections is synchronous; no fire-and-forget.
  // PR6 safety-critical: A5.4 (R20a distress pass-through injection) is the
  //   third-layer R20a defence. Functional + invocation tested in this session.
  // AC4 invocation testing: the grep on the test file in the same session
  //   confirms applyLayer3Injections is called here.
  // AC5 perimeter: A5 is downstream of the route-level R20a perimeter (line
  //   ~173 of /api/reason/route.ts); A5 enforces injection AFTER the gate has
  //   already had a chance to redirect.
  if (isSubstrateLayer3Enabled()) {
    try {
      result.substrate_layer3_response = applyLayer3Injections(
        {
          assessment: layer2Assessment,
          consumer_context: {
            consumer: 'api_reason',
            is_mentor_flavoured: false,
            include_category_framing: false,
          },
          // distress_gate intentionally omitted: /api/reason's route-level
          // R20a perimeter already enforces redirection upstream. A5.4's
          // defensive read of assessment.decision === 'ESCALATE' and
          // assessment.distress_signal activates when A7 wires the gate
          // attaching distress signals to the Layer2Assessment.
        },
        layer3Prose
      )
    } catch (err) {
      // A5 injection should not throw on valid input; if it does, log and
      // continue with the legacy non-A5 output. Fail-open posture — A5 is
      // additive metadata, not the user-facing prose path. A12 instrumentation
      // surfaces these failures via OTel spans.
      console.warn(
        '[parallel-run] A5 applyLayer3Injections threw; falling back to non-A5 output:',
        err instanceof Error ? err.message : err
      )
      result.substrate_layer3_response = null
    }
  }

  // ---- A3 signing wiring (D-A3-LAYER2-SIGNING-WIRED-...) ----
  // Per /adopted/ADR-layer2-signing-infrastructure.md Decision 2: when
  // SUBSTRATE_LAYER2_SIGNING_ENABLED is 'true', the composed `assessment`
  // field carries {assessment, signature, key_id} (a SignedLayer2Assessment)
  // instead of the bare Layer2Assessment. The bare form is preserved when
  // the flag is unset/'false', which is the default at deploy time and the
  // rollback Path A target.
  //
  // Fail-closed posture per the ADR's CCP responses: if signing throws (env
  // var unset, env var malformed, or canonicalisation rejects a value), the
  // orchestrator returns error='signing_throw'; the route translates that
  // into a 503 substrate_signing_unavailable response. The substrate NEVER
  // returns an unsigned assessment when the flag is on.
  //
  // PR3: synchronous; no async signing.
  // PR6: this branch is the safety-critical surface; changes are Critical.
  // AC4: invocation-tested by the Step 12 production scenarios on /api/reason.
  let assessmentField: Layer2Assessment | SignedLayer2Assessment = layer2Assessment
  if (SUBSTRATE_LAYER2_SIGNING_ENABLED) {
    try {
      assessmentField = signLayer2Assessment(layer2Assessment)
    } catch (err) {
      result.error = 'signing_throw'
      console.warn(
        '[parallel-run] Layer 2 signing failed (fail-closed; route returns 503):',
        err instanceof SubstrateSigningKeyMissingError
          ? err.message
          : err instanceof Error
            ? err.message
            : String(err)
      )
      return result
    }
  }

  // ---- Compose final output per ADR-004 §2.1 top-level shape ----
  // The `assessment` field is bare Layer2Assessment when signing disabled
  // (existing behaviour) or SignedLayer2Assessment when signing enabled
  // (A3 wire format). Verifiers re-derive canonical bytes via
  // canonicaliseLayer2Assessment and check the signature against the public
  // key matching the key_id (published at /api/public-key).
  result.output = {
    version: 'translation-sandwich-v1',
    extraction: layer1Schema,
    assessment: assessmentField,
    prose: layer3Prose,
    // M5 CI-4 (2026-06-13): present only when the route passed loop-closure
    // markers (SUBSTRATE_REASON_LOOP_CLOSURE_ENABLED on). True when this
    // examination issued a redirection (improvement_path_structured non-null) —
    // i.e. it owes a same-depth re-examination before the loop is closed.
    ...(params.loopClosure !== undefined && {
      examination_open: examinationOpen(layer2Assessment),
    }),
    meta: {
      engine_attribution: 'translation-sandwich',
      layer1_latency_ms: result.layer1_latency_ms,
      layer2_latency_ms: result.layer2_latency_ms,
      layer3_latency_ms: result.layer3_latency_ms,
    },
    // A5 (D-A5-LAYER3-SCAFFOLDED-VERIFIED-2026-05-12) — substrate Layer 3
    // response when SUBSTRATE_LAYER3_ENABLED is 'true'. Absent (undefined)
    // when flag is off; the existing user-facing fields (prose, disclaimer
    // at route level) preserve byte-identical pre-A5 behaviour.
    // Type: Layer3Response | undefined. See layer3-service.ts.
    ...(result.substrate_layer3_response !== null && {
      substrate_layer3_response: result.substrate_layer3_response,
    }),
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
        substrate_layer3_response: null,
        substrate_r20a_gate_output: null,
        prose_deferred: false,
        layer2_assessment: null,
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
