/**
 * layer2-canonical-json.ts — Deterministic JSON serialisation for Layer2Assessment.
 *
 * Per /adopted/ADR-layer2-signing-infrastructure.md Decision 2 + Open Question 4
 * (Choice 2(a) elected at session-open: in-house implementation).
 *
 * WHY THIS EXISTS. Cryptographic signing requires that the signer and the verifier
 * agree on the exact byte sequence of the payload. JavaScript's JSON.stringify is
 * not deterministic across environments — object key order follows insertion
 * order in modern V8 but is not guaranteed by the JSON spec. Two implementations
 * that disagree on canonical bytes produce a signature that fails to verify even
 * though both are reading the same logical assessment. This module enforces a
 * single canonical byte representation: lexicographically-sorted object keys at
 * every nesting level, deterministic number formatting, rejection of values that
 * have no canonical representation (NaN, Infinity, undefined).
 *
 * Algorithm (small, intentional):
 *   - Objects: keys sorted lexicographically using Array.prototype.sort() default
 *     (UTF-16 code-unit comparison, which matches RFC 8785 §3.2.3 ordering for
 *     the Layer2Assessment field set — all field names are ASCII).
 *   - Arrays: order preserved.
 *   - Strings: JSON.stringify (handles escapes, controls, surrogates per ECMA-404).
 *   - Numbers: rejects NaN / +Infinity / -Infinity; -0 normalised to 0;
 *     otherwise Number.prototype.toString() (deterministic for finite numbers).
 *   - Booleans: 'true' / 'false'.
 *   - null: 'null'.
 *   - undefined: throws Layer2CanonicalisationError. Layer 2 must not produce
 *     undefined; if it does, that is itself a bug worth surfacing rather than
 *     silently dropping the field.
 *   - Symbols, functions, BigInts: throw Layer2CanonicalisationError. None are
 *     present in Layer2Assessment by type; this is defence-in-depth.
 *
 * Compliance:
 *   - AC1: N/A — no LLM call; cited per cache Element 6 row "Documentation,
 *           schema migration, registry update — N/A".
 *   - AC4: N/A at the function level. Imported by layer2-signer.ts; the
 *           layer2-signer wires into runSandwichInner where invocation is
 *           assured by AC4 discipline at the orchestrator.
 *   - AC5: R20a perimeter unaffected.
 *   - AC6: N/A — no RAG context.
 *   - AC7: NOT engaged. No auth/cookie/session/redirect surface touched.
 *   - AC8: Module under translation-sandwich/.
 *   - KG1: Pure synchronous functions; no fire-and-forget; no module-level
 *           cache; no DB writes; no self-calls.
 *   - PR3: Synchronous; safety-critical-adjacent (signing depends on this
 *           helper producing identical bytes on signer and verifier).
 *   - PR6: Layer 2 signing is safety-critical-adjacent; changes to canonical
 *           JSON are Critical per the Critical Change Protocol because they
 *           would break verification of already-issued signatures.
 *
 * Status at file creation: Wired (this module is imported by layer2-signer.ts).
 * Reaches Verified after the round-trip + perturbation tests pass at
 * /api/reason per the PR1 single-endpoint proof.
 */

import type { Layer2Assessment } from './layer2-mechanisms'

/**
 * Typed error for canonicalisation failures. The signer wraps + rethrows.
 */
export class Layer2CanonicalisationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'Layer2CanonicalisationError'
  }
}

/**
 * Canonicalise an arbitrary value at the given dotted path. Recursive.
 * Throws Layer2CanonicalisationError on any value that has no canonical
 * representation (undefined, NaN, Infinity, Symbol, function, BigInt).
 *
 * Note: this function takes `unknown` because Layer2Assessment's typed shape
 * does not exhaustively rule out NaN / Infinity at compile time (numeric
 * fields are typed `number`, which includes those values). Defence-in-depth
 * runtime check.
 */
function canonicaliseValue(value: unknown, path: string): string {
  if (value === null) {
    return 'null'
  }

  if (value === undefined) {
    throw new Layer2CanonicalisationError(
      `Encountered undefined at ${path}; Layer2Assessment must not contain undefined values.`
    )
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false'
  }

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new Layer2CanonicalisationError(
        `Non-finite number ${String(value)} at ${path}; Layer2Assessment must contain only finite numbers.`
      )
    }
    // Normalise -0 to 0 for canonical determinism. Number.prototype.toString
    // returns '0' for both, but Object.is(-0, -0) and Object.is(0, 0) differ;
    // explicit normalisation makes the contract explicit.
    if (Object.is(value, -0)) {
      return '0'
    }
    return value.toString()
  }

  if (typeof value === 'string') {
    // JSON.stringify handles escape sequences, control characters, and
    // surrogate pairs per ECMA-404. Output is deterministic for any given
    // input string.
    return JSON.stringify(value)
  }

  if (Array.isArray(value)) {
    const parts: string[] = []
    for (let i = 0; i < value.length; i++) {
      parts.push(canonicaliseValue(value[i], `${path}[${i}]`))
    }
    return `[${parts.join(',')}]`
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    // Lexicographic sort using Array.prototype.sort default. For the
    // Layer2Assessment field set (all ASCII), this matches RFC 8785 §3.2.3
    // ordering. Object.keys returns own enumerable string-keyed properties
    // (no Symbols), which matches the Layer2Assessment type contract.
    const keys = Object.keys(obj).sort()
    const parts: string[] = []
    for (const k of keys) {
      const v = obj[k]
      // JSON.stringify on the key handles any escape sequences in the key
      // itself (defence-in-depth; Layer2Assessment field names are all
      // simple identifiers).
      parts.push(`${JSON.stringify(k)}:${canonicaliseValue(v, `${path}.${k}`)}`)
    }
    return `{${parts.join(',')}}`
  }

  // Symbol, function, BigInt — no canonical representation defined here.
  throw new Layer2CanonicalisationError(
    `Unserialisable value of type ${typeof value} at ${path}.`
  )
}

/**
 * Produce the canonical JSON byte representation of a Layer2Assessment.
 *
 * Returns a string whose UTF-8 encoding is the byte sequence used as the
 * signing payload. The signer feeds this to crypto.sign; the verifier feeds
 * the same canonicalisation of the verifier-side assessment to crypto.verify.
 *
 * Determinism guarantees:
 *   - Same logical assessment → same string byte-for-byte, regardless of
 *     property insertion order in the input object.
 *   - Re-canonicalising the parsed result of the canonical output yields the
 *     same canonical output (round-trip stability).
 *
 * Throws Layer2CanonicalisationError if the assessment contains a value that
 * has no canonical representation.
 *
 * @param assessment - the Layer2Assessment to canonicalise
 * @returns the canonical JSON string
 */
export function canonicaliseLayer2Assessment(assessment: Layer2Assessment): string {
  return canonicaliseValue(assessment, 'assessment')
}
