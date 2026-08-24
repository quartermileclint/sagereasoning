/**
 * header-bytestring-check.ts — structural check for the ByteString header class.
 *
 * IW-2 route (a), the first mechanically-testable lesson converted from a citation
 * into a check. Source lesson: memory `public-read-surface-honesty-classes`.
 *
 * THE PROPERTY. An HTTP header value is a ByteString. A typographic character in
 * one (an em-dash, a curly quote, an ellipsis) throws at RUNTIME, on every response
 * that route serves — while `tsc --noEmit` and `next build` both pass green. It is
 * therefore invisible to every gate this repo currently runs before a commit.
 *
 * WHAT THIS CHECK ACTUALLY COVERS, AND WHAT IT DOES NOT (PR25 branch 1 — this
 * comment names its own scope so the next reader is not misled about its reach):
 *   COVERED — a header-name-shaped string-literal KEY mapped to a string-literal
 *   VALUE, in any file under src/app/api, where either side carries a non-ASCII
 *   codepoint. This is the form every header in this repo currently uses; verified
 *   by grep at authoring time (2026-08-24): no `headers.set(` call sites exist.
 *   NOT COVERED — a value supplied through an identifier rather than a literal
 *   (`'X-Foo': SOME_CONST`). The check cannot follow the indirection and does not
 *   claim to. A non-ASCII constant reaching a header that way still ships.
 *   NOT COVERED — headers set outside src/app/api, or via middleware.
 *
 * NON-VACUITY. A guard that silently stops guarding still reports zero failures
 * (memory `guard-needs-a-non-vacuity-floor`). So this check counts what it actually
 * traversed and FAILS if the detector inspected no header lines at all, and
 * `--self-test` runs a synthetic violating fixture the detector must flag.
 *
 * Usage:
 *   npx tsx scripts/header-bytestring-check.ts             # check the repo
 *   npx tsx scripts/header-bytestring-check.ts --self-test # prove the detector is live
 *   npx tsx scripts/header-bytestring-check.ts --staged    # only staged files (pre-commit)
 *
 * Exit 0 = clean. Exit 1 = a violation, or the detector traversed nothing.
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative } from 'node:path'

const API_ROOT = join(process.cwd(), 'src', 'app', 'api')

/** A string-literal key that looks like an HTTP header, mapped to a string literal. */
const HEADER_PAIR = /(['"])([A-Za-z][A-Za-z0-9-]*-[A-Za-z0-9-]+)\1\s*:\s*(['"`])((?:\\.|(?!\3)[\s\S])*)\3/g
const NON_ASCII = /[^\x00-\x7F]/

export interface Violation {
  file: string
  line: number
  header: string
  offending: string
  where: 'key' | 'value'
}

export interface CheckResult {
  filesScanned: number
  headerLinesInspected: number
  violations: Violation[]
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(p)) out.push(p)
  }
  return out
}

export function scanSource(source: string, file: string): { inspected: number; violations: Violation[] } {
  const violations: Violation[] = []
  let inspected = 0
  source.split('\n').forEach((line, i) => {
    HEADER_PAIR.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = HEADER_PAIR.exec(line)) !== null) {
      inspected++
      const [, , key, , value] = m
      if (NON_ASCII.test(key)) {
        violations.push({ file, line: i + 1, header: key, offending: key, where: 'key' })
      }
      if (NON_ASCII.test(value)) {
        violations.push({ file, line: i + 1, header: key, offending: value.trim().slice(0, 90), where: 'value' })
      }
    }
  })
  return { inspected, violations }
}

function run(files: string[]): CheckResult {
  let headerLinesInspected = 0
  const violations: Violation[] = []
  for (const f of files) {
    const { inspected, violations: v } = scanSource(readFileSync(f, 'utf8'), relative(process.cwd(), f))
    headerLinesInspected += inspected
    violations.push(...v)
  }
  return { filesScanned: files.length, headerLinesInspected, violations }
}

function selfTest(): boolean {
  const fixtureClean = `  const headers = { 'X-Sage-Note': 'plain ascii only', 'Content-Type': 'application/json' }`
  const fixtureDirty = `  const headers = { 'X-Sage-Note': 'one Stoic framework — evaluates grounding' }`
  const clean = scanSource(fixtureClean, '<self-test:clean>')
  const dirty = scanSource(fixtureDirty, '<self-test:dirty>')

  const checks: Array<[string, boolean]> = [
    ['detector inspects the clean fixture (non-vacuity)', clean.inspected === 2],
    ['clean fixture yields no violation', clean.violations.length === 0],
    ['detector inspects the dirty fixture', dirty.inspected === 1],
    ['dirty fixture is FLAGGED (the em-dash)', dirty.violations.length === 1],
    ['violation is attributed to the value, not the key', dirty.violations[0]?.where === 'value'],
    ['violation names its header', dirty.violations[0]?.header === 'X-Sage-Note'],
  ]
  let ok = true
  for (const [name, pass] of checks) {
    console.log(`  ${pass ? 'PASS' : 'FAIL'}  ${name}`)
    if (!pass) ok = false
  }
  return ok
}

function main() {
  const args = process.argv.slice(2)

  if (args.includes('--self-test')) {
    console.log('header-bytestring-check — self-test (proves the detector is live):')
    const ok = selfTest()
    console.log(ok ? '\nSelf-test PASSED.' : '\nSelf-test FAILED — the detector is not working.')
    process.exit(ok ? 0 : 1)
  }

  let files: string[]
  if (args.includes('--staged')) {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
      .split('\n').map(s => s.trim()).filter(Boolean)
      .filter(p => /^website\/src\/app\/api\/.*\.tsx?$/.test(p))
      .map(p => join(process.cwd(), '..', p))
      .filter(existsSync)
    files = staged
    if (files.length === 0) {
      console.log('header-bytestring-check: no staged API files — nothing to check.')
      process.exit(0)
    }
  } else {
    files = walk(API_ROOT)
  }

  const result = run(files)
  console.log(
    `header-bytestring-check: ${result.filesScanned} file(s) scanned, ` +
    `${result.headerLinesInspected} header literal(s) inspected.`
  )

  // Non-vacuity floor: a full-repo run that inspects nothing means the detector
  // broke, not that the repo is clean. A --staged run legitimately may inspect 0.
  if (!args.includes('--staged') && result.headerLinesInspected === 0) {
    console.error(
      'FAIL — the detector inspected zero header literals across the whole API tree.\n' +
      '       That is a broken detector, not a clean repo. Run --self-test.'
    )
    process.exit(1)
  }

  if (result.violations.length > 0) {
    console.error(`\nFAIL — ${result.violations.length} non-ASCII header literal(s):\n`)
    for (const v of result.violations) {
      console.error(`  ${v.file}:${v.line}  ${v.header} (${v.where})`)
      console.error(`      ${v.offending}`)
    }
    console.error(
      '\nHTTP header values are ByteString. A typographic character here throws at\n' +
      'runtime on every response, while tsc and next build stay green.\n' +
      'Fix: use ASCII (- for an em-dash, ... for an ellipsis, straight quotes).'
    )
    process.exit(1)
  }

  console.log('header-bytestring-check: PASS — no non-ASCII header literals.')
}

main()
