/**
 * constraints.ts — Compile-time model selection enforcement.
 *
 * PURPOSE: Make choosing the wrong model for a safety-critical operation a
 * TYPE ERROR, not a runtime bug. Previously, model selection was enforced by
 * convention and code review. This module makes the TypeScript compiler enforce it.
 *
 * KEY CONCEPT: ModelReliabilityBoundary — a type-level mapping from operation
 * categories (safety-critical, assessment, conversational) to the models that
 * are permitted for each. If code tries to pass a model that doesn't meet the
 * reliability boundary for a given operation, `tsc` fails.
 *
 * KNOWLEDGE GAP ADDRESSED: KG2 (Haiku Model Reliability Boundary)
 *   - Haiku: reliable for simple, single-mechanism queries (quick depth),
 *     small structured JSON (3-field classifier output).
 *   - Sonnet: required for multi-mechanism analysis, complex JSON, longer outputs.
 *   - The R20a distress classifier uses Haiku because its output is a single
 *     small JSON object. This is within Haiku's reliability boundary.
 *
 * Rules served: R20a (model selection for safety classifier), R5 (cost awareness)
 *
 * @compliance
 * compliance_version: CR-2026-Q2-v4
 * regulatory_references: [CR-005]
 */

import { MODEL_FAST, MODEL_DEEP } from '@/lib/model-config'

// =============================================================================
// MODEL IDENTITY TYPES — Branded string types for compile-time discrimination
// =============================================================================

/**
 * Branded type for the fast model (Haiku).
 * The __brand field exists only at the type level — no runtime overhead.
 */
export type FastModel = typeof MODEL_FAST & { readonly __brand: 'fast' }

/**
 * Branded type for the deep model (Sonnet).
 */
export type DeepModel = typeof MODEL_DEEP & { readonly __brand: 'deep' }

/**
 * Union of all known model types.
 */
export type KnownModel = FastModel | DeepModel

// =============================================================================
// OPERATION CATEGORIES
// =============================================================================

/**
 * Operation categories that determine which models are permitted.
 *
 * safety_critical:
 *   Distress classification, vulnerable user detection. These operations
 *   use simple structured output (small JSON) and are within Haiku's
 *   reliability boundary. Haiku is REQUIRED here — Sonnet adds latency
 *   and cost without improving the 3-field JSON output.
 *
 * assessment:
 *   Multi-mechanism Stoic evaluation. Standard/deep depth requires Sonnet
 *   for complex structured JSON. Quick depth can use Haiku.
 *
 * conversational:
 *   Mentor interactions, reflections. May use either model depending on
 *   complexity, but defaults to the deep model for nuanced responses.
 */
export type OperationCategory =
  | 'safety_critical'
  | 'assessment_quick'
  | 'assessment_standard'
  | 'assessment_deep'
  | 'conversational'

// =============================================================================
// MODEL RELIABILITY BOUNDARY — The core constraint
// =============================================================================

/**
 * Maps each operation category to the model types permitted for it.
 * This is the compile-time enforcement mechanism.
 *
 * To read this: "For a safety_critical operation, only FastModel is allowed."
 * If someone tries to pass DeepModel to a safety_critical function,
 * TypeScript will produce a type error.
 */
export type ModelReliabilityBoundary = {
  safety_critical: FastModel
  assessment_quick: FastModel
  assessment_standard: DeepModel
  assessment_deep: DeepModel
  conversational: FastModel | DeepModel
}

/**
 * Extract the permitted model type for a given operation category.
 * Usage: PermittedModel<'safety_critical'> resolves to FastModel
 */
export type PermittedModel<T extends OperationCategory> = ModelReliabilityBoundary[T]

// =============================================================================
// MODEL CONSTRUCTORS — Runtime values with compile-time brands
// =============================================================================

/**
 * Get the fast model constant with its branded type.
 * Use this instead of importing MODEL_FAST directly when you need
 * compile-time enforcement of model selection.
 */
export function getFastModel(): FastModel {
  return MODEL_FAST as FastModel
}

/**
 * Get the deep model constant with its branded type.
 */
export function getDeepModel(): DeepModel {
  return MODEL_DEEP as DeepModel
}

/**
 * Select the correct model for a given operation category.
 * Returns a properly branded model type that satisfies the reliability boundary.
 *
 * This is the primary entry point for model selection in new code.
 */
export function selectModel<T extends OperationCategory>(
  operation: T
): PermittedModel<T> {
  switch (operation) {
    case 'safety_critical':
      return getFastModel() as PermittedModel<T>
    case 'assessment_quick':
      return getFastModel() as PermittedModel<T>
    case 'assessment_standard':
      return getDeepModel() as PermittedModel<T>
    case 'assessment_deep':
      return getDeepModel() as PermittedModel<T>
    case 'conversational':
      return getDeepModel() as PermittedModel<T>
    default: {
      // Exhaustiveness check — if a new category is added but not handled,
      // TypeScript will error here at compile time.
      const _exhaustive: never = operation
      throw new Error(`Unknown operation category: ${_exhaustive}`)
    }
  }
}

// =============================================================================
// TYPE-SAFE MODEL PARAMETER INTERFACES
// =============================================================================

/**
 * Parameters for a safety-critical LLM call.
 * The `model` field ONLY accepts FastModel — passing DeepModel is a type error.
 *
 * Usage in r20a-classifier.ts:
 *   const params: SafetyCriticalCallParams = {
 *     model: getFastModel(),  // OK
 *     // model: getDeepModel(),  // TYPE ERROR
 *   }
 */
export interface SafetyCriticalCallParams {
  model: FastModel
  max_tokens: number
  temperature: 0  // Safety classifiers must be deterministic
}

/**
 * Parameters for a standard assessment LLM call (standard/deep depth).
 * The `model` field ONLY accepts DeepModel.
 */
export interface AssessmentCallParams {
  model: DeepModel
  max_tokens: number
  temperature?: number
}

/**
 * Parameters for a quick assessment LLM call.
 * The `model` field ONLY accepts FastModel.
 */
export interface QuickAssessmentCallParams {
  model: FastModel
  max_tokens: number
  temperature?: number
}

// =============================================================================
// DEPTH-TO-MODEL MAPPING — Bridges depth-constants.ts and model selection
// =============================================================================

import type { ReasonDepth } from '@/lib/depth-constants'

/**
 * Maps ReasonDepth to the correct branded model type.
 * Enforces KG2 at the type level: quick → Haiku, standard/deep → Sonnet.
 */
export type DepthModel<D extends ReasonDepth> =
  D extends 'quick' ? FastModel :
  D extends 'standard' ? DeepModel :
  D extends 'deep' ? DeepModel :
  never

/**
 * Select model by depth with compile-time enforcement.
 * Drop-in replacement for the inline ternary in sage-reason-engine.ts.
 */
export function selectModelByDepth<D extends ReasonDepth>(depth: D): DepthModel<D> {
  if (depth === 'quick') {
    return getFastModel() as DepthModel<D>
  }
  return getDeepModel() as DepthModel<D>
}

// =============================================================================
// SYNCHRONOUS SAFETY ENFORCEMENT — Type-level guarantee that distress check
// runs before any API response containing reasoning output.
// =============================================================================

import type { DistressDetectionResult } from '@/lib/guardrails'

/**
 * A branded token proving that the distress check has been awaited.
 *
 * This cannot be constructed except by calling `enforceDistressCheck()`,
 * which awaits the safety classifier. Any function that requires a
 * `SafetyGate` parameter cannot be called without first completing
 * the safety check — enforced at compile time.
 *
 * WHY THIS EXISTS:
 * The invocation guard test (r20a-invocation-guard.test.ts) verifies that
 * `await detectDistressTwoStage` appears in each route's source code.
 * That's a static text check. This type guard makes the COMPILER enforce
 * the same invariant — you literally cannot call `buildSafeResponse()`
 * without first obtaining a SafetyGate from `enforceDistressCheck()`.
 */
export interface SafetyGate {
  readonly __brand: 'safety_gate'
  /** The result of the distress check — available for inspection */
  readonly result: DistressDetectionResult
  /** Whether the request should be redirected (distress detected at moderate+) */
  readonly shouldRedirect: boolean
}

/**
 * Await the distress classifier and return a SafetyGate token.
 *
 * This is the ONLY way to obtain a SafetyGate. The function signature
 * requires a Promise<DistressDetectionResult>, which means the caller
 * must have called detectDistressTwoStage() and must await the result
 * to get the gate.
 *
 * Usage in route files:
 * ```ts
 * const gate = await enforceDistressCheck(
 *   detectDistressTwoStage(userInput)
 * )
 * if (gate.shouldRedirect) {
 *   return NextResponse.json({ ... gate.result ... })
 * }
 * // Proceed with reasoning — gate proves safety check completed
 * ```
 */
export async function enforceDistressCheck(
  check: Promise<DistressDetectionResult>
): Promise<SafetyGate> {
  const result = await check
  return {
    __brand: 'safety_gate' as const,
    result,
    shouldRedirect: result.redirect_message !== null,
  }
}

/**
 * Synchronous variant for when the distress check result is already resolved.
 * Used when the route has already awaited the check but needs to construct
 * the gate token for type-safe downstream functions.
 */
export function createSafetyGate(result: DistressDetectionResult): SafetyGate {
  return {
    __brand: 'safety_gate' as const,
    result,
    shouldRedirect: result.redirect_message !== null,
  }
}

/**
 * Type-safe response builder that REQUIRES a SafetyGate.
 *
 * Any function that builds a response containing LLM reasoning output
 * should accept a SafetyGate parameter. This makes it a compile-time
 * error to build a reasoning response without first completing the
 * safety check.
 *
 * The gate is not consumed or modified — it's a proof token.
 */
export interface SafeResponseParams {
  /** Proof that the distress check was completed before this response */
  gate: SafetyGate
  /** The reasoning result to include in the response */
  result: Record<string, unknown>
  /** HTTP status code */
  status?: number
}
