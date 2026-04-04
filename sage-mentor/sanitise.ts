/**
 * sanitise.ts — Prompt Injection Defence Layer
 *
 * Every user-controlled string that enters an LLM prompt MUST pass through
 * one of these functions first. The goal is NOT to make injection impossible
 * (that's architecturally impossible with string concatenation) but to:
 *
 *   1. Strip control sequences that break prompt boundaries
 *   2. Enforce length limits to prevent context-window flooding
 *   3. Detect obvious injection attempts and flag them
 *   4. Wrap user content in clear delimiters so the LLM can distinguish
 *      system instructions from user data
 *
 * Defence-in-depth: These functions are the FIRST line. The SECOND line is
 * structuring prompts to treat user content as data, not instructions.
 * The THIRD line is output validation (see validate-llm-output.ts).
 *
 * SageReasoning Proprietary Licence
 */
/**
 * @compliance
 * compliance_version: CR-2026-Q2-v1
 * last_regulatory_review: 2026-04-04
 * applicable_jurisdictions: [AU, EU, US]
 * regulatory_references: [CR-001, CR-002, CR-009]
 * review_cycle: quarterly
 * owner: founder
 * next_review_due: 2026-07-06
 * change_trigger: [EU AI Act classification guidance, AU Privacy Act reform]
 * deprecation_flag: false
 */

// ============================================================================
// CONSTANTS
// ============================================================================

/** Characters and sequences that can break prompt boundaries */
const CONTROL_PATTERNS = [
  /\r/g,                          // Carriage returns (normalise to \n)
  /\x00/g,                        // Null bytes
  /[\x01-\x08\x0B\x0C\x0E-\x1F]/g, // Non-printable control chars (preserve \n and \t)
] as const

/** Sequences commonly used in prompt injection attempts */
const INJECTION_SIGNATURES = [
  /(?:^|\n)\s*(?:SYSTEM|ADMIN|DEVELOPER|ROOT)\s*(?:PROMPT|MESSAGE|OVERRIDE|INSTRUCTION)/i,
  /(?:^|\n)\s*(?:IGNORE|FORGET|DISREGARD|OVERRIDE)\s+(?:ALL|YOUR|THE|PREVIOUS|ABOVE)/i,
  /(?:^|\n)\s*(?:NEW|UPDATED?|REVISED?)\s+(?:INSTRUCTION|PROMPT|DIRECTIVE|RULE)/i,
  /(?:^|\n)\s*(?:YOU ARE NOW|ACT AS|PRETEND|ROLEPLAY|YOUR NEW ROLE)/i,
  /(?:^|\n)\s*---+\s*PROMPT\s*OVERRIDE/i,
  /(?:^|\n)\s*```\s*(?:system|prompt|instruction)/i,
] as const

/** Maximum lengths for different content types */
export const MAX_LENGTHS = {
  display_name: 100,
  agent_name: 100,
  task_description: 2000,
  action_text: 2000,
  journal_entry: 5000,
  inner_agent_output: 3000,
  passion_name: 200,
  context_field: 1000,
  generic: 1000,
} as const

export type ContentType = keyof typeof MAX_LENGTHS

// ============================================================================
// CORE SANITISATION
// ============================================================================

/**
 * Strip control characters that could break prompt structure.
 * Preserves newlines (\n) and tabs (\t) as legitimate formatting.
 */
function stripControlChars(text: string): string {
  let result = text
  for (const pattern of CONTROL_PATTERNS) {
    result = result.replace(pattern, '')
  }
  return result
}

/**
 * Collapse excessive newlines that could create visual separation
 * mimicking prompt section boundaries.
 *
 * Allows max 2 consecutive newlines (one blank line).
 */
function collapseNewlines(text: string): string {
  return text.replace(/\n{3,}/g, '\n\n')
}

/**
 * Escape backtick sequences that could create code blocks
 * within prompts, potentially breaking delimiters.
 */
function escapeBackticks(text: string): string {
  return text.replace(/`{3,}/g, '` ` `')
}

/**
 * Detect potential prompt injection signatures.
 *
 * Returns an array of matched patterns. An empty array means
 * no injection detected (but does NOT guarantee safety).
 */
export function detectInjection(text: string): string[] {
  const matches: string[] = []
  for (const pattern of INJECTION_SIGNATURES) {
    if (pattern.test(text)) {
      const match = text.match(pattern)
      if (match) matches.push(match[0].trim())
    }
  }
  return matches
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Result of sanitisation — includes the cleaned text and any warnings.
 */
export type SanitiseResult = {
  /** The sanitised text, safe to embed in a prompt */
  readonly text: string
  /** Whether the text was truncated to fit length limits */
  readonly was_truncated: boolean
  /** Detected injection attempts (empty = none found) */
  readonly injection_warnings: string[]
  /** Original length before any processing */
  readonly original_length: number
}

/**
 * Sanitise user-controlled text for safe embedding in LLM prompts.
 *
 * Call this on EVERY piece of user data before it enters a prompt template.
 *
 * @param input      The raw user-provided text
 * @param contentType Which category of content (determines max length)
 * @param options    Optional overrides
 * @returns          SanitiseResult with cleaned text and warnings
 *
 * @example
 * ```ts
 * const result = sanitise(profile.display_name, 'display_name')
 * const prompt = `Hello ${result.text}, welcome.`
 * if (result.injection_warnings.length > 0) {
 *   logSecurityEvent('injection_attempt', result)
 * }
 * ```
 */
export function sanitise(
  input: string | null | undefined,
  contentType: ContentType = 'generic',
  options?: {
    /** Override the max length for this call */
    maxLength?: number
    /** Skip injection detection (use only for trusted internal data) */
    skipInjectionCheck?: boolean
  }
): SanitiseResult {
  // Handle null/undefined
  if (input == null) {
    return {
      text: '',
      was_truncated: false,
      injection_warnings: [],
      original_length: 0,
    }
  }

  const originalLength = input.length
  const maxLength = options?.maxLength ?? MAX_LENGTHS[contentType]

  // 1. Strip control characters
  let cleaned = stripControlChars(input)

  // 2. Collapse excessive newlines
  cleaned = collapseNewlines(cleaned)

  // 3. Escape backtick sequences
  cleaned = escapeBackticks(cleaned)

  // 4. Trim whitespace
  cleaned = cleaned.trim()

  // 5. Enforce length limit
  const wasTruncated = cleaned.length > maxLength
  if (wasTruncated) {
    cleaned = cleaned.slice(0, maxLength) + '...[truncated]'
  }

  // 6. Detect injection attempts
  const injectionWarnings = options?.skipInjectionCheck
    ? []
    : detectInjection(cleaned)

  return {
    text: cleaned,
    was_truncated: wasTruncated,
    injection_warnings: injectionWarnings,
    original_length: originalLength,
  }
}

/**
 * Sanitise and wrap in delimiters for clear data boundaries.
 *
 * Wraps user content in XML-style tags so the LLM can clearly
 * distinguish system instructions from user-provided data.
 *
 * @param input       The raw user-provided text
 * @param label       Label for the delimiter (e.g., 'user_journal_entry')
 * @param contentType Content category for length limits
 * @returns           SanitiseResult with delimited text
 *
 * @example
 * ```ts
 * const result = sanitiseAndDelimit(entry.user_response, 'journal_response', 'journal_entry')
 * // result.text = '<user_data label="journal_response">\n...content...\n</user_data>'
 * ```
 */
export function sanitiseAndDelimit(
  input: string | null | undefined,
  label: string,
  contentType: ContentType = 'generic'
): SanitiseResult {
  const result = sanitise(input, contentType)

  if (result.text === '') {
    return result
  }

  // Wrap in clear data delimiters
  const delimited = `<user_data label="${sanitise(label, 'generic', { maxLength: 50, skipInjectionCheck: true }).text}">\n${result.text}\n</user_data>`

  return {
    ...result,
    text: delimited,
  }
}

/**
 * Batch sanitise an array of strings (e.g., passion names, tags).
 *
 * @param items       Array of strings to sanitise
 * @param contentType Content category for length limits per item
 * @param maxItems    Maximum number of items to keep
 * @returns           Array of sanitised strings (empty items removed)
 */
export function sanitiseArray(
  items: string[] | null | undefined,
  contentType: ContentType = 'passion_name',
  maxItems: number = 50
): string[] {
  if (!items || items.length === 0) return []

  return items
    .slice(0, maxItems)
    .map(item => sanitise(item, contentType).text)
    .filter(text => text.length > 0)
}

/**
 * Quick boolean check: does this text contain injection signatures?
 *
 * Use this for logging/alerting without needing the full sanitise pipeline.
 */
export function hasInjectionSignatures(text: string): boolean {
  return INJECTION_SIGNATURES.some(pattern => pattern.test(text))
}
