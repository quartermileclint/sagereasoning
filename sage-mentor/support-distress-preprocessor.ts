/**
 * support-distress-preprocessor.ts — Channel 1: R20a distress pre-processing for Support.
 *
 * PURPOSE: Make the Support agent honour R20a at pipeline entry. Every
 * customer message is classified for distress *before* the drafter runs.
 * If moderate or acute distress is detected, the Support agent does not
 * draft — it escalates with crisis resources. A 90-day baseline of prior
 * vulnerability flags is surfaced so R20's "sudden drastic change"
 * indicator can fire.
 *
 * PROVEN PATTERN: Ported from the private mentor's
 *   website/src/app/api/mentor/private/reflect/route.ts
 * which uses detectDistressTwoStage() + enforceDistressCheck() in
 * website/src/lib/r20a-classifier.ts + website/src/lib/constraints.ts.
 *
 * PR1 evidence: the mentor is the single-endpoint proof. Support is the
 * second endpoint. No third endpoint in this session.
 *
 * PR3: runs SYNCHRONOUSLY with respect to the rest of the pipeline.
 * `processInboxItem` awaits a resolved SupportSafetyGate before anything
 * else runs. No background, no fire-and-forget. ~500ms latency on borderline
 * inputs is accepted and non-negotiable.
 *
 * PR6: any touch of distress logic is Critical under 0d-ii. This file is
 * the wiring *around* the proven classifier — it does not modify the
 * classifier itself.
 *
 * PR4: model selection for the classifier is already constrained in
 * website/src/lib/constraints.ts (Haiku, SafetyCriticalCallParams).
 * We do not re-choose the model here — the classifier is injected.
 *
 * KG2: the R20a classifier uses Haiku because its output is a 3-field
 * JSON object. That is within Haiku's reliability boundary. We rely on
 * the existing classifier — no change to model selection.
 *
 * DEPENDENCY INJECTION: sage-mentor is a sibling module to website/, so
 * it cannot resolve `@/lib/r20a-classifier`. The classifier is passed in
 * as `deps.classify`. Production callers inject `detectDistressTwoStage`.
 * The verification harness injects a test double.
 *
 * Rules served: R20a (vulnerable user detection), R17 (no raw flag content here).
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-20
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-005]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-20
 * change_trigger: [R20a amendment, PR6 classifier change]
 * deprecation_flag: false
 */

// ============================================================================
// TYPES — Distress detection result shape (structural, no imports from website)
// ============================================================================

/**
 * Structural shape of the DistressDetectionResult returned by
 * `detectDistressTwoStage()` in website/src/lib/r20a-classifier.ts.
 *
 * Defined structurally here so sage-mentor does not need a cross-package
 * import. Production callers pass the real type — TypeScript accepts it
 * by structural compatibility.
 */
export interface DistressDetectionResult {
  distress_detected: boolean
  severity: 'none' | 'mild' | 'moderate' | 'acute'
  indicators_found: string[]
  redirect_message: string | null
}

/**
 * Severity as stored in the `vulnerability_flag` table (INTEGER 1-3),
 * mapped to R20a §4 SLA tiers.
 *
 * 1 = borderline (maps to 'mild')
 * 2 = sustained incapacity (maps to 'moderate')
 * 3 = explicit means/intent (maps to 'acute')
 *
 * See supabase/migrations/20260416_r20a_vulnerability_flag.sql.
 */
export type VulnerabilitySeverityInt = 1 | 2 | 3
export type DistressSeverity = 'none' | 'mild' | 'moderate' | 'acute'

/**
 * A prior distress flag for the same user. Used by R20's
 * "sudden drastic change" indicator.
 */
export interface PriorDistressFlag {
  flag_id: string | null
  interaction_id: string | null
  severity: 'mild' | 'moderate' | 'acute'
  detected_at: string
  source: 'vulnerability_flag' | 'support_interaction_metadata'
}

/**
 * The full distress signal for a single Support inbox item.
 *
 * `current` is the two-stage classifier's fresh verdict on the inbound
 * message. `prior_flags` is the 90-day baseline for the same user. The
 * `sudden_change` flag fires when baseline is none/mild and current is
 * moderate/acute — that is R20's "sudden drastic change" trigger.
 */
export interface SupportDistressSignal {
  current: DistressDetectionResult
  prior_flags: PriorDistressFlag[]
  baseline_severity: DistressSeverity
  sudden_change: boolean
  source_stage: 'regex' | 'haiku' | 'none'
  processed_at: string
}

/**
 * A branded token proving that the Support distress check has been
 * awaited. Same discipline as `SafetyGate` in
 * website/src/lib/constraints.ts but scoped to Support so the two
 * surfaces do not collide at the type level.
 *
 * The brand cannot be constructed except via `enforceSupportDistressCheck()`
 * or `createSupportSafetyGate()`. Any function that requires a
 * `SupportSafetyGate` parameter cannot be called without a completed
 * distress check — enforced at compile time.
 *
 * KG3 / KG7: this brand is the invocation guard. The grep assertion in
 * the verification harness is the runtime backstop.
 */
export interface SupportSafetyGate {
  readonly __brand: 'support_safety_gate'
  readonly signal: SupportDistressSignal
  /** True when current severity is moderate or acute. Support must not draft. */
  readonly shouldRedirect: boolean
  /** Convenience: true when a sudden change from baseline is detected. */
  readonly sudden_change: boolean
}

// ============================================================================
// SUPABASE READ INTERFACE — Narrow structural type, no hard dependency
// ============================================================================

/**
 * Narrow structural interface describing the subset of Supabase JS client
 * behaviour this module uses. Defined locally so `sage-mentor` stays free
 * of a hard `@supabase/supabase-js` dependency (matching the pattern used
 * by `sync-to-supabase.ts`).
 *
 * The real @supabase/supabase-js client satisfies this shape by structural
 * compatibility. Tests and the verification harness can pass a mock.
 */
export interface SupabaseReadClient {
  from(table: string): SupabaseSelectBuilder
}

interface SupabaseSelectBuilder {
  select(columns: string): SupabaseFilterBuilder
}

interface SupabaseFilterBuilder extends PromiseLike<SupabaseQueryResult> {
  eq(column: string, value: string | number | null): SupabaseFilterBuilder
  gte(column: string, value: string | number): SupabaseFilterBuilder
  order(column: string, options?: { ascending?: boolean }): SupabaseFilterBuilder
  limit(n: number): SupabaseFilterBuilder
}

interface SupabaseQueryResult {
  data: Record<string, unknown>[] | null
  error: { message: string } | null
}

// ============================================================================
// DEPENDENCIES
// ============================================================================

/**
 * Dependencies injected into the preprocessor.
 *
 * `classify` is the proven two-stage distress classifier. Production
 * callers inject `detectDistressTwoStage` from
 * `website/src/lib/r20a-classifier`. The verification harness injects a
 * deterministic test classifier. This is the only safe way to let a
 * sibling module reuse the proven classifier without copying its code
 * (PR6 — no classifier touch).
 */
export interface SupportDistressDeps {
  supabase: SupabaseReadClient
  classify: (text: string, sessionId?: string) => Promise<DistressDetectionResult>
}

// ============================================================================
// CONSTANTS
// ============================================================================

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Map the `vulnerability_flag.severity` INTEGER column to the string
 * severity used across the distress pipeline.
 *
 * Source of truth: supabase/migrations/20260416_r20a_vulnerability_flag.sql
 *   COMMENT ON COLUMN public.vulnerability_flag.severity: R20a §4 SLA tier.
 */
function severityIntToString(level: unknown): 'mild' | 'moderate' | 'acute' {
  if (level === 3) return 'acute'
  if (level === 2) return 'moderate'
  return 'mild' // 1 or anything non-canonical falls through to mild (conservative)
}

/**
 * Severity ranking for "sudden change" computation.
 * Higher number = more severe. A sudden change is a jump from <=1 (none/mild)
 * to >=2 (moderate/acute).
 */
const SEVERITY_RANK: Record<DistressSeverity, number> = {
  none: 0,
  mild: 1,
  moderate: 2,
  acute: 3,
}

// ============================================================================
// 90-DAY PRIOR-FLAG BASELINE
// ============================================================================

/**
 * Read prior distress flags for a user over the last 90 days.
 *
 * Phase 1 scope (per 20 April 2026 choice point decision):
 *   - Includes mentor-side flags as well as Support-originated flags.
 *     They are real distress signals for the same user — just from a
 *     different surface. The founder explicitly chose "proceed as designed"
 *     over the Support-only variant.
 *
 * Failure behaviour:
 *   - If the Supabase query errors, return an empty array and a console
 *     warning. The preprocessor must NEVER throw from a query error — a
 *     DB hiccup should not cascade into an over-escalation flood. The
 *     current-message classifier still runs and is authoritative.
 *   - See PR3: the safety check result (from the classifier) must still
 *     be complete before the response is constructed. The baseline is
 *     additive context, not a safety gate.
 */
export async function readPriorDistressFlags(
  supabase: SupabaseReadClient,
  userId: string,
): Promise<PriorDistressFlag[]> {
  if (!userId) return []

  const sinceIso = new Date(Date.now() - NINETY_DAYS_MS).toISOString()

  try {
    const result = await supabase
      .from('vulnerability_flag')
      .select('flag_id, session_id, severity, created_at')
      .eq('user_id', userId)
      .gte('created_at', sinceIso)
      .order('created_at', { ascending: false })
      .limit(50)

    if (result.error) {
      // Fail-soft — do not explode the preprocessor on a read error.
      // See PR3 and the F1 fail-open pattern in r20a-classifier.ts.
      // eslint-disable-next-line no-console
      console.warn(
        '[support-distress-preprocessor] vulnerability_flag read error — returning empty baseline',
        result.error.message,
      )
      return []
    }

    const rows = Array.isArray(result.data) ? result.data : []
    return rows.map((row) => ({
      flag_id: (row.flag_id as string | undefined) ?? null,
      interaction_id: (row.session_id as string | undefined) ?? null,
      severity: severityIntToString(row.severity),
      detected_at: String(row.created_at ?? ''),
      source: 'vulnerability_flag' as const,
    }))
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[support-distress-preprocessor] vulnerability_flag read threw — returning empty baseline',
      err instanceof Error ? err.message : String(err),
    )
    return []
  }
}

// ============================================================================
// BASELINE DERIVATION — modal severity + sudden-change computation
// ============================================================================

/**
 * Derive the modal (most common) severity across prior flags.
 * If there are no prior flags, baseline is 'none'.
 *
 * Ties broken by highest severity — conservatively biases toward flagging
 * sudden-change false positives over sudden-change false negatives.
 */
export function deriveBaselineSeverity(priors: PriorDistressFlag[]): DistressSeverity {
  if (priors.length === 0) return 'none'

  const counts: Record<string, number> = {}
  for (const flag of priors) {
    counts[flag.severity] = (counts[flag.severity] ?? 0) + 1
  }

  let best: DistressSeverity = 'none'
  let bestCount = 0
  for (const sev of ['acute', 'moderate', 'mild'] as const) {
    const c = counts[sev] ?? 0
    if (c > bestCount) {
      best = sev
      bestCount = c
    }
  }
  return best
}

/**
 * R20 "sudden drastic change" indicator:
 *   baseline none/mild AND current moderate/acute.
 */
export function isSuddenChange(
  baseline: DistressSeverity,
  current: DistressSeverity,
): boolean {
  return SEVERITY_RANK[baseline] <= 1 && SEVERITY_RANK[current] >= 2
}

// ============================================================================
// CURRENT-MESSAGE CLASSIFICATION
// ============================================================================

/**
 * Determine which stage of the two-stage classifier produced the result.
 * The proven classifier sets a text marker in `indicators_found` when the
 * LLM stage fires ('haiku_evaluator: ...'). Regex detections do not carry
 * that marker.
 */
function inferSourceStage(result: DistressDetectionResult): 'regex' | 'haiku' | 'none' {
  if (!result.distress_detected) return 'none'
  const hasHaiku = result.indicators_found.some(
    (i) => typeof i === 'string' && (
      i.startsWith('haiku_evaluator:') ||
      i === 'llm_content_safety_triggered'
    ),
  )
  return hasHaiku ? 'haiku' : 'regex'
}

// ============================================================================
// PUBLIC ENTRY POINT — preprocessSupportDistress
// ============================================================================

/**
 * Run Channel 1: two-stage distress classification on the current message
 * PLUS 90-day prior-flag baseline lookup.
 *
 * Returns a SupportDistressSignal. Callers wrap this in a
 * `SupportSafetyGate` via `enforceSupportDistressCheck()` or
 * `createSupportSafetyGate()` before passing to `processInboxItem`.
 *
 * PR3: this function is awaited synchronously before the drafter runs.
 * It is the only place where the Support pipeline blocks on the R20a
 * classifier.
 *
 * @param deps.supabase - Supabase read client (structural)
 * @param deps.classify - Injected two-stage classifier (proven pattern)
 * @param userId - Auth user id (owner of the support interaction)
 * @param _customerId - Customer correlation id (reserved for future
 *                      cross-customer baseline; unused in Phase 1 per
 *                      the handoff design — prior flags are scoped to
 *                      the authenticated user, not the customer)
 * @param text - The text to classify. Usually the inbox item's
 *               customer_message; callers may concatenate subject + body.
 * @param sessionId - Optional session id for classifier cost tracking.
 */
export async function preprocessSupportDistress(
  deps: SupportDistressDeps,
  userId: string,
  _customerId: string | null,
  text: string,
  sessionId?: string,
): Promise<SupportDistressSignal> {
  // Both sub-operations are independent — run in parallel.
  // The classifier is synchronous-w.r.t.-pipeline (PR3) but its own
  // internal work and the DB read can proceed concurrently.
  const [current, priorFlags] = await Promise.all([
    deps.classify(text, sessionId),
    readPriorDistressFlags(deps.supabase, userId),
  ])

  const baselineSeverity = deriveBaselineSeverity(priorFlags)
  const suddenChange = isSuddenChange(baselineSeverity, current.severity)

  return {
    current,
    prior_flags: priorFlags,
    baseline_severity: baselineSeverity,
    sudden_change: suddenChange,
    source_stage: inferSourceStage(current),
    processed_at: new Date().toISOString(),
  }
}

// ============================================================================
// SAFETY GATE CONSTRUCTORS
// ============================================================================

/**
 * Shouldred-redirect rule for Support, matching the mentor's rule:
 *   - acute / moderate  → redirect (do not draft)
 *   - mild              → proceed, but the drafter is expected to add
 *                         resources to the response
 *   - none              → proceed normally
 *
 * Mirrors `enforceDistressCheck` in website/src/lib/constraints.ts which
 * keys off `redirect_message !== null` — the proven classifier sets that
 * string only for moderate and acute severities.
 */
function shouldRedirectFromSignal(signal: SupportDistressSignal): boolean {
  return signal.current.redirect_message !== null
}

/**
 * Await a SupportDistressSignal promise and produce a SupportSafetyGate.
 *
 * This is the ONLY way to obtain a SupportSafetyGate asynchronously.
 * Any function requiring a gate parameter therefore cannot be called
 * without first awaiting the preprocessor — the branded type makes
 * bypass a compile error (KG3/KG7 invocation guard).
 *
 * Usage at the caller site:
 * ```ts
 * const gate = await enforceSupportDistressCheck(
 *   preprocessSupportDistress(deps, userId, customerId, text, sessionId),
 * )
 * if (gate.shouldRedirect) { ...crisis-resource message, escalate... }
 * // Proceed with draft — gate proves the safety check completed.
 * ```
 */
export async function enforceSupportDistressCheck(
  check: Promise<SupportDistressSignal>,
): Promise<SupportSafetyGate> {
  const signal = await check
  return {
    __brand: 'support_safety_gate' as const,
    signal,
    shouldRedirect: shouldRedirectFromSignal(signal),
    sudden_change: signal.sudden_change,
  }
}

/**
 * Synchronous variant for when the signal has already been resolved.
 * Used by callers that have awaited the preprocessor separately.
 */
export function createSupportSafetyGate(signal: SupportDistressSignal): SupportSafetyGate {
  return {
    __brand: 'support_safety_gate' as const,
    signal,
    shouldRedirect: shouldRedirectFromSignal(signal),
    sudden_change: signal.sudden_change,
  }
}
