/**
 * pass-through-fields.ts — Validators for the six enterprise-accountability
 * pass-through fields on EvaluatedAction and CarriedProfile.
 *
 * STATUS: Scaffolded → Wired → Verified (2026-05-17, this build). New code,
 * not yet wired into any production path — wrappers that want validated
 * pass-through fields call the `normalise*` helpers explicitly at write
 * time. The substrate validates the enum values and persists them; it does
 * NOT interpret them for Layer 1/2/3 reasoning.
 *
 * GOVERNING DOCUMENTS:
 *   - /adopted/pass-through-fields-design.md — the design (Adopted 2026-05-17
 *     under D-PASS-THROUGH-FIELDS-LOCKED-2026-05-17). Six locked decisions
 *     A–F define the field surfaces; structural constraints in each
 *     decision name the type + the validator helper shape implemented here.
 *   - /operations/decision-log.md — D-PASS-THROUGH-FIELDS-BUILD-WIRED-
 *     VERIFIED-2026-05-17 (this build).
 *   - /manifest.md §R0 (audit trail accuracy); §R9 (Decision E primary —
 *     verification posture); §R10 (marketplace consistency across all
 *     six); §R17 (intimate-data adjacency via Decisions B + D);
 *     §R18a (Character Kernel framing preserved — these are operational
 *     metadata, not credential framing); §R18c (additive interoperability);
 *     §AC8 (Layer 4 pass-through; no Layer 1 contract change); §KG1
 *     (engaged this build — synchronous normalisation; no fire-and-forget;
 *     soft-fallback warning logs awaited via console.warn).
 *
 * THE SIX VALIDATORS
 *
 *   normaliseOperationClass()         — Decision A (EvaluatedAction)
 *   normaliseIdentityModel()          — Decision B (CarriedProfile)
 *   normalisePathPosture()            — Decision C (CarriedProfile)
 *   normaliseTargetVendor()           — Decision D vendor side (EvaluatedAction)
 *   normaliseTargetDetail()           — Decision D detail side (EvaluatedAction)
 *   normaliseOutcomeVerification()    — Decision E (EvaluatedAction)
 *   normaliseReversibilitySignal()    — Decision F (EvaluatedAction)
 *
 * (Decision D has two validators because it lands as two paired fields:
 * vendor enum + free-form detail string.)
 *
 * SOFT-FALLBACK POSTURE
 *
 * Every normaliser uses soft-fallback rather than throw-on-unknown:
 * unknown values land on the field's default, with a console.warn for
 * visibility. This preserves backward compatibility with wrappers that
 * supply slightly-different values (e.g., 'create' instead of 'write')
 * without crashing the request. The warning surfaces the integration
 * mismatch without breaking traffic. See each decision's "Structural
 * constraint" section in /adopted/pass-through-fields-design.md.
 *
 * COMPLIANCE
 *   - PR1: extends the existing validator pattern (the substrate already
 *     has accreditation-record.ts validators); not a novel architecture.
 *   - PR2: the test file (__tests__/pass-through-fields.test.ts) invokes
 *     every exported function in the same session this module is written.
 *   - PR4: N/A — no LLM call. Deterministic normalisation only.
 *   - PR10: Plan → Execute → Verify. Plan was the 2026-05-17 design pass;
 *     this build is Execute; the test suite is Verify.
 *   - PR15: Anthropic-canonical primitives consulted — no skill substitutes
 *     for substrate-internal type validators. Bespoke election justified
 *     in D-PASS-THROUGH-FIELDS-BUILD-WIRED-VERIFIED-2026-05-17.
 */

import type {
  OperationClass,
  DownstreamIdentityModel,
  PathPosture,
  TargetSystemVendor,
  OutcomeVerification,
  ReversibilitySignal,
} from '../types/evaluation'

// ============================================================================
// CONSTANTS — readonly arrays of valid enum values for each field
// ============================================================================
//
// Exported so wrappers + tests + future analytics layers can enumerate the
// valid values without re-importing the union type itself. Marked
// `as const` so TypeScript narrows the inferred type from `string[]` to
// the exact tuple of literal strings — preserves type safety at every
// call site.
//
// ============================================================================

/** Decision A — operation_class. 9 prompt-kit values + 'unknown' default. */
export const VALID_OPERATION_CLASSES: readonly OperationClass[] = [
  'read',
  'search',
  'summarize',
  'draft',
  'recommend',
  'write',
  'approve',
  'execute',
  'delete',
  'unknown',
] as const

/** Decision B — downstream_identity_model. 7 prompt-kit values + 'unknown' default. */
export const VALID_IDENTITY_MODELS: readonly DownstreamIdentityModel[] = [
  'delegated_user',
  'service_account',
  'vendor_framework',
  'api_key',
  'browser_session',
  'mcp_server',
  'unknown',
] as const

/** Decision C — path_posture. 4 prompt-kit values (no 'unknown'); default 'ambiguous'. */
export const VALID_PATH_POSTURES: readonly PathPosture[] = [
  'endorsed',
  'open_api',
  'ambiguous',
  'unsanctioned',
] as const

/** Decision D vendor side — target_system_vendor. 8 canonical prompt-kit
 *  vendors + 'other' + 'none' default. */
export const VALID_TARGET_VENDORS: readonly TargetSystemVendor[] = [
  'salesforce',
  'microsoft',
  'servicenow',
  'sap',
  'workday',
  'zendesk',
  'hubspot',
  'atlassian',
  'other',
  'none',
] as const

/** Decision E — outcome_verification. 4 values; default 'self_reported'. */
export const VALID_OUTCOME_VERIFICATIONS: readonly OutcomeVerification[] = [
  'self_reported',
  'system_confirmed',
  'external_auditor',
  'not_applicable',
] as const

/** Decision F — reversibility_signal. 4 values + 'unknown' default. */
export const VALID_REVERSIBILITY_SIGNALS: readonly ReversibilitySignal[] = [
  'reversible',
  'partially_reversible',
  'irreversible',
  'unknown',
] as const

/** Decision D detail side — maximum character length for target_system_detail.
 *  Prevents abuse (no 10MB detail strings landing in downstream rows). The
 *  cap is generous (sub-system names like 'opportunities' or
 *  'outlook.calendar' or 'change_requests' are well under 100 chars). */
export const MAX_TARGET_DETAIL_LENGTH = 100 as const

// ============================================================================
// NORMALISER HELPERS — soft-fallback with warning log on unknown values
// ============================================================================
//
// Pure functions: deterministic, no I/O except console.warn on soft-
// fallback. KG1-aligned (synchronous; the warning log is fire-and-await
// via console.warn — no Promise, no microtask queue). Pass undefined / null
// / empty string → default. Pass an invalid value → default + warn. Pass
// a valid value → echo it back typed as the union.
//
// ============================================================================

/**
 * Normalise an operation_class value to a valid OperationClass.
 *
 * Returns 'unknown' for undefined / null / empty string (the conservative
 * baseline default). Returns 'unknown' + warns on unrecognised values
 * (soft-fallback — preserves backward compatibility with wrappers that
 * supply slightly-different terms like 'create' for 'write').
 *
 * @param value the wrapper-supplied operation_class string (or undefined)
 * @returns the normalised OperationClass enum value
 */
export function normaliseOperationClass(
  value: string | undefined | null
): OperationClass {
  if (value === undefined || value === null || value === '') return 'unknown'
  if ((VALID_OPERATION_CLASSES as readonly string[]).includes(value)) {
    return value as OperationClass
  }
  console.warn(
    `[pass-through-fields] normaliseOperationClass: unrecognised value '${value}' — defaulting to 'unknown'`
  )
  return 'unknown'
}

/**
 * Normalise a downstream_identity_model value to a valid DownstreamIdentityModel.
 *
 * Returns 'unknown' for undefined / null / empty string (the conservative
 * baseline default). Returns 'unknown' + warns on unrecognised values.
 *
 * @param value the wrapper-supplied identity_model string (or undefined)
 * @returns the normalised DownstreamIdentityModel enum value
 */
export function normaliseIdentityModel(
  value: string | undefined | null
): DownstreamIdentityModel {
  if (value === undefined || value === null || value === '') return 'unknown'
  if ((VALID_IDENTITY_MODELS as readonly string[]).includes(value)) {
    return value as DownstreamIdentityModel
  }
  console.warn(
    `[pass-through-fields] normaliseIdentityModel: unrecognised value '${value}' — defaulting to 'unknown'`
  )
  return 'unknown'
}

/**
 * Normalise a path_posture value to a valid PathPosture.
 *
 * Returns 'ambiguous' for undefined / null / empty string (matches the
 * prompt-kit's "do not invent specific licensing status; flag as
 * ambiguous rather than guessing" guardrail). Returns 'ambiguous' + warns
 * on unrecognised values.
 *
 * Note: the default differs from Decisions A + B's 'unknown' — the
 * prompt-kit Access Path Status taxonomy doesn't include 'unknown'
 * because the choice is fundamentally about vendor sanction, which is
 * always answerable (even "I don't know the vendor's exact policy" is
 * itself 'ambiguous').
 *
 * @param value the wrapper-supplied path_posture string (or undefined)
 * @returns the normalised PathPosture enum value
 */
export function normalisePathPosture(
  value: string | undefined | null
): PathPosture {
  if (value === undefined || value === null || value === '') return 'ambiguous'
  if ((VALID_PATH_POSTURES as readonly string[]).includes(value)) {
    return value as PathPosture
  }
  console.warn(
    `[pass-through-fields] normalisePathPosture: unrecognised value '${value}' — defaulting to 'ambiguous'`
  )
  return 'ambiguous'
}

/**
 * Normalise a target_system_vendor value to a valid TargetSystemVendor.
 *
 * Returns 'none' for undefined / null / empty string (the default —
 * action doesn't affect any external system). Returns 'other' + warns on
 * unrecognised values (NOT 'none' — the meaningful semantic distinction
 * 'none' (no target) vs 'other' (target exists but not in the canonical
 * 8) is preserved by the soft-fallback).
 *
 * @param value the wrapper-supplied target_system_vendor string (or undefined)
 * @returns the normalised TargetSystemVendor enum value
 */
export function normaliseTargetVendor(
  value: string | undefined | null
): TargetSystemVendor {
  if (value === undefined || value === null || value === '') return 'none'
  if ((VALID_TARGET_VENDORS as readonly string[]).includes(value)) {
    return value as TargetSystemVendor
  }
  console.warn(
    `[pass-through-fields] normaliseTargetVendor: unrecognised value '${value}' — defaulting to 'other'`
  )
  return 'other'
}

/**
 * Normalise a target_system_detail value — free-form string capped at
 * MAX_TARGET_DETAIL_LENGTH characters.
 *
 * Returns undefined for undefined / null / empty string (no default — the
 * detail field is genuinely optional; absence means "no sub-system
 * specified"). Truncates strings longer than the cap to prevent abuse
 * (no 10MB detail strings landing in downstream rows). Non-string inputs
 * return undefined.
 *
 * WARNING: wrappers SHOULD NOT put PII in this field. It is structural
 * sub-system identification only (e.g., 'opportunities',
 * 'outlook.calendar', 'change_requests'). This validator does not
 * enforce the no-PII rule — that's a wrapper-side discipline noted in
 * the field's JSDoc on EvaluatedAction.
 *
 * @param value the wrapper-supplied target_system_detail string (or undefined)
 * @returns the normalised detail string (length-capped) or undefined
 */
export function normaliseTargetDetail(
  value: unknown
): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') return undefined
  if (value.length <= MAX_TARGET_DETAIL_LENGTH) return value
  return value.slice(0, MAX_TARGET_DETAIL_LENGTH)
}

/**
 * Normalise an outcome_verification value to a valid OutcomeVerification.
 *
 * Returns 'self_reported' for undefined / null / empty string (the most
 * honest baseline — downstream consumers know to weight self-reported
 * claims as agent-asserted). Returns 'self_reported' + warns on
 * unrecognised values.
 *
 * @param value the wrapper-supplied outcome_verification string (or undefined)
 * @returns the normalised OutcomeVerification enum value
 */
export function normaliseOutcomeVerification(
  value: string | undefined | null
): OutcomeVerification {
  if (value === undefined || value === null || value === '') return 'self_reported'
  if ((VALID_OUTCOME_VERIFICATIONS as readonly string[]).includes(value)) {
    return value as OutcomeVerification
  }
  console.warn(
    `[pass-through-fields] normaliseOutcomeVerification: unrecognised value '${value}' — defaulting to 'self_reported'`
  )
  return 'self_reported'
}

/**
 * Normalise a reversibility_signal value to a valid ReversibilitySignal.
 *
 * Returns 'unknown' for undefined / null / empty string (matches the
 * Decision C 'ambiguous' pattern — encourages honest "I don't know"
 * rather than forcing wrappers into false confidence). Returns 'unknown'
 * + warns on unrecognised values. Downstream risk classification can
 * weight 'unknown' as high-risk if it wants to.
 *
 * @param value the wrapper-supplied reversibility_signal string (or undefined)
 * @returns the normalised ReversibilitySignal enum value
 */
export function normaliseReversibilitySignal(
  value: string | undefined | null
): ReversibilitySignal {
  if (value === undefined || value === null || value === '') return 'unknown'
  if ((VALID_REVERSIBILITY_SIGNALS as readonly string[]).includes(value)) {
    return value as ReversibilitySignal
  }
  console.warn(
    `[pass-through-fields] normaliseReversibilitySignal: unrecognised value '${value}' — defaulting to 'unknown'`
  )
  return 'unknown'
}
