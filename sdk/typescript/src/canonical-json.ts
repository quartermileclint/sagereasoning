/**
 * canonical-json.ts — deterministic JSON serialisation for signature verification.
 *
 * This is a faithful client-side port of the substrate's signing canonicaliser
 * (website/src/lib/translation-sandwich/layer2-canonical-json.ts). The signer and
 * the verifier MUST agree on the exact byte sequence or the signature fails to
 * verify even though both read the same logical assessment.
 *
 * The canonical form (the footgun documented in llms.txt "Verifying signed
 * assessments"):
 *   - object keys sorted lexicographically (default sort) at EVERY nesting level
 *   - arrays preserved in order
 *   - compact separators (no spaces)
 *   - raw UTF-8 (JS JSON.stringify does NOT ASCII-escape — an ensure_ascii=true
 *     canonicaliser would produce different bytes and would NOT verify)
 *   - -0 normalised to 0; NaN / Infinity / undefined rejected
 *
 * Keep this byte-identical to the server algorithm. A change here is a breaking
 * change to verification of already-issued signatures.
 */

export class CanonicalisationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CanonicalisationError'
  }
}

function canonicaliseValue(value: unknown, path: string): string {
  if (value === null) return 'null'

  if (value === undefined) {
    throw new CanonicalisationError(
      `Encountered undefined at ${path}; a signed assessment must not contain undefined values.`,
    )
  }

  if (typeof value === 'boolean') return value ? 'true' : 'false'

  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new CanonicalisationError(
        `Non-finite number ${String(value)} at ${path}; only finite numbers are canonicalisable.`,
      )
    }
    if (Object.is(value, -0)) return '0'
    return value.toString()
  }

  if (typeof value === 'string') {
    // JSON.stringify emits raw UTF-8 (no ASCII escaping) and handles control
    // chars / surrogate pairs per ECMA-404 — matching the server.
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
    const keys = Object.keys(obj).sort()
    const parts: string[] = []
    for (const k of keys) {
      parts.push(`${JSON.stringify(k)}:${canonicaliseValue(obj[k], `${path}.${k}`)}`)
    }
    return `{${parts.join(',')}}`
  }

  throw new CanonicalisationError(`Unserialisable value of type ${typeof value} at ${path}.`)
}

/**
 * Produce the canonical JSON string whose UTF-8 encoding is the signed payload.
 * Pass the INNER assessment object — i.e. `response.assessment.assessment`, the
 * object the signature actually covers (see verifyAssessment in client.ts).
 */
export function canonicalise(assessment: unknown): string {
  return canonicaliseValue(assessment, 'assessment')
}
