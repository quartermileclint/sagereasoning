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

  // Step 5: Repair common LLM JSON errors, then retry
  // LLMs sometimes produce malformed lines like:
  //   "passions_detected [],       ← missing colon between key and value
  //   "passions_detected": [],     ← correct version on next line
  // Fix by inserting the missing colon where a quoted key is followed by
  // a JSON value character ([, {, ", digit, t, f, n) without a colon between.
  const cleaned = text
    .replace(/```json?\s*\n?/gi, '')
    .replace(/```\s*\n?/g, '')
    .trim()
  const colonFixed = cleaned.replace(
    /^(\s*"[^"]+")\s+([\[\{"tfn\d])/gm,
    '$1: $2'
  )
  if (colonFixed !== cleaned) {
    // Also handle duplicate keys that result from the fix — JSON.parse
    // uses the last occurrence, so duplicates are harmless.
    const bracketStart = colonFixed.indexOf('{')
    const bracketEnd = colonFixed.lastIndexOf('}')
    if (bracketStart !== -1 && bracketEnd !== -1 && bracketEnd > bracketStart) {
      try {
        const result = JSON.parse(colonFixed.slice(bracketStart, bracketEnd + 1))
        console.warn(`extractJSON: colon-repair fallback succeeded. Input preview: ${preview}`)
        return result
      } catch { /* continue */ }
    }
  }

  // Step 6: Remove malformed key lines entirely, then retry
  // LLMs sometimes produce lines where the key has NO closing quote:
  //   "passions_detected [],       ← no closing quote, no colon
  //   "passions_detected": [],     ← correct version on next line
  // The missing closing quote makes the string span across the newline,
  // breaking all previous repair attempts. Fix by removing lines that
  // look like a bare JSON key followed by [ or { but contain no ":"
  const lineRepaired = cleaned.split('\n').filter(line => {
    const trimmed = line.trim()
    // Match: starts with "word (with or without closing quote), then [ or {, no ":"
    // Catches both: "key [],  and  "key" [],
    if (/^"[a-zA-Z_]+"?\s*[\[\{]/.test(trimmed) && !trimmed.includes('":')) {
      return false  // Remove this malformed line
    }
    return true
  }).join('\n')

  if (lineRepaired !== cleaned) {
    const bracketStart2 = lineRepaired.indexOf('{')
    const bracketEnd2 = lineRepaired.lastIndexOf('}')
    if (bracketStart2 !== -1 && bracketEnd2 !== -1 && bracketEnd2 > bracketStart2) {
      try {
        const result = JSON.parse(lineRepaired.slice(bracketStart2, bracketEnd2 + 1))
        console.warn(`extractJSON: line-removal fallback succeeded. Input preview: ${preview}`)
        return result
      } catch { /* continue */ }
    }
  }

  throw new Error(`extractJSON: Could not extract valid JSON (${text.length} chars). Preview: ${preview}`)
}
