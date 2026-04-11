/**
 * json-utils.ts — Shared JSON extraction from LLM responses.
 *
 * Centralises the parse-fallback chain that was independently implemented
 * in sage-reason-engine.ts, reflect/route.ts, mentor/private/reflect/route.ts,
 * and evaluate/route.ts. Any improvements to parsing propagate everywhere.
 *
 * Fallback chain:
 *   1. Bare JSON.parse
 *   2. Strip markdown code fences, then parse
 *   3. Regex: first { to last } match
 *   4. Index-based: first { to last }
 *
 * On any fallback beyond step 1, logs which step succeeded
 * and the first 100 chars of input for diagnosis.
 * Throws with a descriptive error if all steps fail.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractJSON(text: string): any {
  const preview = text.slice(0, 100)

  // Step 1: Bare parse
  try {
    return JSON.parse(text.trim())
  } catch { /* continue */ }

  // Step 2: Strip markdown code fences
  const fenceStripped = text
    .replace(/```json?\s*\n?/gi, '')
    .replace(/```\s*\n?/g, '')
    .trim()
  try {
    const result = JSON.parse(fenceStripped)
    console.warn(`extractJSON: fence-strip fallback succeeded. Input preview: ${preview}`)
    return result
  } catch { /* continue */ }

  // Step 3: Regex match first complete JSON object
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      const result = JSON.parse(jsonMatch[0])
      console.warn(`extractJSON: regex fallback succeeded. Input preview: ${preview}`)
      return result
    } catch { /* continue */ }
  }

  // Step 4: Index-based first { to last }
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      const result = JSON.parse(text.slice(firstBrace, lastBrace + 1))
      console.warn(`extractJSON: brace-extraction fallback succeeded. Input preview: ${preview}`)
      return result
    } catch { /* continue */ }
  }

  throw new Error(`extractJSON: Could not extract valid JSON (${text.length} chars). Preview: ${preview}`)
}
