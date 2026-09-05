/**
 * r20a-ordering-pin-helpers.ts — shared primitives for the per-route
 * EXECUTION-ORDER pins that the 2026-09-06 mentor ruling requires
 * (D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06: "the
 * distress check runs before the length guard on any route where the human
 * crisis form is rendered"), first applied by Session 3 of the perimeter-
 * ordering audit (operations/count-discipline-2026-09/2026-09-05-r20a-
 * perimeter-ordering-AUDIT.md §6) on 2026-09-05.
 *
 * WHY A SHARED MODULE: the FV-6 pin on /api/score-conversation was WRONG on
 * its first cut — it anchored on the R20a block's OPENING, so a guard placed
 * inside the block before the check passed green (found independently by all
 * three PR19 reviewers of that move). The correct anchor is the block's
 * brace-matched structural END. That matcher is the load-bearing piece; it
 * belongs in one place so every per-route battery pins the same way and a
 * fix to it reaches all of them (memory `guard-scope-must-cover-the-class`).
 *
 * WHAT THESE PRIMITIVES ARE NOT: they are TEXTUAL position over a
 * comment-stripped, string-blanked view of one file — a regression lock on a
 * straight-line handler, never a substitute for the audit's control-flow
 * trace. A refactor into a helper, or a call reached via a variable rather
 * than its literal name, defeats them silently (FALSE PASS — the dangerous
 * direction); the audit's sweep (2026-09-05-r20a-ordering-sweep.js) is the
 * cross-route check. The opposite failure mode also exists and is SAFE, not
 * dangerous: a per-route guard-content regex (e.g. `MIN_GUARD_RE`) is
 * literal text, so a semantics-preserving rewrite of a moved guard (added
 * parens, changed whitespace) makes the pin report the guard as MISSING
 * (a FALSE FAIL — blocks a legitimate refactor from merging; never lets a
 * real ordering regression through). Found at the Session 3 PR19 re-run,
 * 2026-09-05. If a future refactor trips this, update the guard's regex in
 * the same commit — do not weaken it to a substring match.
 *
 * Not a route file; exports are free (memory `nextjs-route-export-validation`
 * concerns route.ts only).
 */

import * as fs from 'fs'

/**
 * Comments removed. Mirrors the per-line quote-aware strip that the
 * score-conversation battery adopted at its 2026-09-06 PR19 fold (F5): a
 * trailing `// comment` is cut only when the `//` is outside every quote span
 * on that line, so a URL inside a string survives. Block comments are removed
 * first. String CONTENTS are kept here — use `blankStrings` for brace work.
 */
export function stripComments(source: string): string {
  const stripLineComment = (line: string): string => {
    let inSingle = false
    let inDouble = false
    let inTemplate = false
    for (let i = 0; i < line.length; i++) {
      const c = line[i]
      const next = line[i + 1]
      if (c === "'" && !inDouble && !inTemplate) inSingle = !inSingle
      else if (c === '"' && !inSingle && !inTemplate) inDouble = !inDouble
      else if (c === '`' && !inSingle && !inDouble) inTemplate = !inTemplate
      else if (c === '/' && next === '/' && !inSingle && !inDouble && !inTemplate) {
        return line.slice(0, i)
      }
    }
    return line
  }
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map(stripLineComment)
    .join('\n')
}

/**
 * String and template-literal CONTENTS replaced by spaces, LENGTH-PRESERVING,
 * so an index into the returned text is an index into the input. Quote
 * characters themselves are kept. Escapes are honoured. Used so that a brace
 * inside an error message can never fool the structural-end matcher — the
 * limit FV-6c's comment disclosed ("a future brace-in-string") is closed here
 * rather than left to a comment.
 */
export function blankStrings(code: string): string {
  const out = code.split('')
  let i = 0
  const n = code.length
  while (i < n) {
    const c = code[i]
    if (c === '"' || c === "'" || c === '`') {
      const q = c
      i++
      while (i < n && code[i] !== q) {
        if (code[i] === '\\') {
          out[i] = ' '
          if (i + 1 < n && code[i + 1] !== '\n') out[i + 1] = ' '
          i += 2
          continue
        }
        if (code[i] !== '\n') out[i] = ' '
        i++
      }
      i++
      continue
    }
    i++
  }
  return out.join('')
}

export function loadCodeOnly(routePath: string): string {
  return stripComments(fs.readFileSync(routePath, 'utf-8'))
}

export interface StructuralBlock {
  /** Index of the block's opening `{` in `code`, or -1. */
  openIdx: number
  /** Index of the matching closing `}` in `code`, or -1. */
  endIdx: number
  /** How many times `openRe` matched — a pin should require exactly 1. */
  matches: number
}

/**
 * Locate a block by its opening pattern (which MUST end at the opening brace,
 * e.g. /if\s*\(\s*gate\.shouldRedirect\s*\)\s*\{/) and brace-match from that
 * brace to the block's structural END on a string-blanked view of `code`.
 * The returned indices are valid in `code` itself (blanking is
 * length-preserving). `endIdx` is -1 if the block is unterminated.
 */
export function structuralBlock(code: string, openRe: RegExp): StructuralBlock {
  const global = new RegExp(openRe.source, openRe.flags.includes('g') ? openRe.flags : openRe.flags + 'g')
  const blanked = blankStrings(code)
  let matches = 0
  let first: RegExpExecArray | null = null
  let m: RegExpExecArray | null
  while ((m = global.exec(blanked))) {
    matches++
    if (!first) first = m
  }
  if (!first) return { openIdx: -1, endIdx: -1, matches: 0 }
  const openIdx = first.index + first[0].length - 1
  if (blanked[openIdx] !== '{') return { openIdx: -1, endIdx: -1, matches }
  let depth = 0
  for (let i = openIdx; i < blanked.length; i++) {
    if (blanked[i] === '{') depth++
    else if (blanked[i] === '}') {
      depth--
      if (depth === 0) return { openIdx, endIdx: i, matches }
    }
  }
  return { openIdx, endIdx: -1, matches }
}

/** First index of `re` in the string-blanked view of `code` (so a match inside a string never counts), or -1. */
export function codeIndex(code: string, re: RegExp): number {
  return blankStrings(code).search(re)
}

/**
 * First index of `re` at or after `from` in the string-blanked view, or -1.
 * Use this for anchors that may ALSO occur earlier in the file on a different
 * path (e.g. /api/score-scenario's generate branch calls the same RAG loader
 * and LLM client before the scoring handler does): an ordering pin must
 * compare the guard against the first occurrence AFTER the check it follows,
 * not the file's first occurrence — the first cut of that battery anchored on
 * the file's first and failed on correct code (2026-09-05, caught in-build).
 */
export function codeIndexAfter(code: string, re: RegExp, from: number): number {
  if (from < 0) return -1
  const rel = blankStrings(code).slice(from).search(re)
  return rel === -1 ? -1 : from + rel
}

/**
 * A quoted string literal in the BLANKED view: the quote characters survive
 * blanking but the contents do not, so a pin that wants "typeof x !== 'string'"
 * must match the quotes with anything (or nothing) between them, never the
 * word `string` itself — the first cut of all four Group 1 pins made exactly
 * that mistake and failed on correct code (2026-09-05, caught in-build).
 */
export const QUOTED = `['"][^'"]*['"]`

/** Number of matches of `re` in the string-blanked view of `code`. */
export function codeCount(code: string, re: RegExp): number {
  const global = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g')
  return (blankStrings(code).match(global) ?? []).length
}
