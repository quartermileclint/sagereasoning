/**
 * route-export-check.ts — structural check for the Next.js route-export class.
 *
 * Reflections arc, item 3's first named-not-taken leftover, taken up on explicit founder
 * election (2026-08-26): a cheap AST/regex approximation over the full-`npm run build` gate or
 * leaving it to Vercel. Source lesson: memory `nextjs-route-export-validation`.
 *
 * THE PROPERTY. A Next.js App Router `route.ts` (`website/src/app/api/**\/route.ts`) may export
 * ONLY the HTTP method handlers and route-segment-config properties Next.js recognises. Any other
 * runtime export — a helper function, a constant, an injectable test seam — fails
 * `Type error: "<name>" is not a valid Route export field` at `next build` time, on Vercel, while
 * `tsc --noEmit` and the repo's `npx tsx` assertion tests both pass green (neither runs Next's own
 * route-export validation). The 2026-06-14 trajectory-B1 incident this lesson records: an injectable
 * `runTrajectoryRetentionSweep` + `SweepDeps` export from a cron `route.ts` passed every local gate
 * and still turned Vercel red.
 *
 * WHAT THIS CHECK ACTUALLY COVERS, AND WHAT IT DOES NOT (the header-bytestring-check.ts precedent —
 * this comment names its own scope so the next reader is not misled about its reach):
 *   COVERED — a top-level (column-0) `export function|async function|const|let|var|class|type|
 *   interface NAME`, and a top-level `export { a, b as c }` list, in any `route.ts` under
 *   src/app/api. Each captured NAME is checked against the known Next.js route-export allowlist
 *   (the seven HTTP methods + the documented route-segment-config properties +
 *   `generateStaticParams`). A bare `export default` is always flagged — route.ts has no valid
 *   default export.
 *   NOT COVERED — an export whose name is produced by anything other than the literal forms above
 *   (e.g. a computed re-export, `export * from`, a name introduced via a macro or codegen). The
 *   check cannot follow that indirection and does not claim to. It also does not run the real
 *   TypeScript/Next.js compiler — a syntactically unusual but Next-legal export shape this regex
 *   does not recognise could be a false positive; if that happens, widen the regex, do not silence
 *   the check.
 *   NOT COVERED — `page.tsx`/`layout.tsx` (a different, broader allowed-export set — `metadata`,
 *   `generateMetadata`, a default component export, etc.) and anything outside src/app/api.
 *
 * NON-VACUITY. A guard that silently stops guarding still reports zero failures (memory
 * `guard-needs-a-non-vacuity-floor`). This check counts every route.ts file it actually inspected
 * and every export it found, and FAILS a full-repo run that finds zero route.ts files (a broken
 * detector, not an empty repo — this codebase has ~40+ route.ts files as of authoring). `--self-test`
 * runs synthetic clean and violating fixtures the detector must classify correctly.
 *
 * Usage:
 *   npx tsx scripts/route-export-check.ts             # check the whole repo
 *   npx tsx scripts/route-export-check.ts --self-test  # prove the detector is live
 *   npx tsx scripts/route-export-check.ts --staged     # only staged route.ts files (pre-commit)
 *
 * Exit 0 = clean. Exit 1 = a violation, or the detector traversed nothing on a full run.
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative, basename } from 'node:path'

const API_ROOT = join(process.cwd(), 'src', 'app', 'api')

// The Next.js App Router route-handler allowlist. HTTP methods + the documented route-segment
// config properties + generateStaticParams (valid on a dynamic-segment route handler). Anything
// else is a build-time rejection.
const ALLOWED_ROUTE_EXPORTS = new Set([
  'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS',
  'dynamic', 'dynamicParams', 'revalidate', 'fetchCache', 'runtime', 'preferredRegion',
  'maxDuration', 'generateStaticParams',
])

// Any top-level `export default ...` — always invalid on a route.ts, regardless of what follows.
// Checked BEFORE the named-export regex below, because a default export whose declared name
// happens to coincide with an allowed handler name (`export default function GET() {}`) is still
// a default export, not a recognised route handler — the name coinciding must not exempt it.
const ANY_DEFAULT = /^export\s+default\b/
// If the default export declares a name, capture it for the diagnostic only.
const DEFAULT_NAME = /^export\s+default\s+(?:async\s+)?(?:function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/

// Top-level (column-0) NON-default export declarations that introduce exactly one name.
const SINGLE_EXPORT =
  /^export\s+(?:async\s+)?(?:function|const|let|var|class|type|interface)\s+([A-Za-z_$][A-Za-z0-9_$]*)/
// A top-level `export { a, b as c, ... }` list (re-export or local-name export list).
const EXPORT_LIST = /^export\s*\{([^}]*)\}/

export interface Violation {
  file: string
  line: number
  name: string
  reason: string
}

export interface CheckResult {
  filesScanned: number
  exportsInspected: number
  violations: Violation[]
}

function isRouteFile(p: string): boolean {
  return basename(p) === 'route.ts'
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (isRouteFile(p)) out.push(p)
  }
  return out
}

export function scanSource(source: string, file: string): { inspected: number; violations: Violation[] } {
  const violations: Violation[] = []
  let inspected = 0

  source.split('\n').forEach((raw, i) => {
    const line = raw.trimEnd()

    if (ANY_DEFAULT.test(line)) {
      inspected++
      const declaredName = line.match(DEFAULT_NAME)?.[1]
      violations.push({
        file, line: i + 1, name: declaredName ?? 'default',
        reason: 'route.ts has no valid default export' +
          (declaredName ? ` (declaring "${declaredName}" as default does not make it a handler)` : ''),
      })
      return
    }

    const single = line.match(SINGLE_EXPORT)
    if (single) {
      inspected++
      const name = single[1]
      if (!ALLOWED_ROUTE_EXPORTS.has(name)) {
        violations.push({
          file, line: i + 1, name,
          reason: `"${name}" is not a valid Route export field`,
        })
      }
      return
    }

    const list = line.match(EXPORT_LIST)
    if (list) {
      const names = list[1]
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => {
          const asMatch = s.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s+as\s+([A-Za-z_$][A-Za-z0-9_$]*)$/)
          return asMatch ? asMatch[2] : s.match(/^([A-Za-z_$][A-Za-z0-9_$]*)/)?.[1]
        })
        .filter((s): s is string => Boolean(s))
      for (const name of names) {
        inspected++
        if (!ALLOWED_ROUTE_EXPORTS.has(name)) {
          violations.push({
            file, line: i + 1, name,
            reason: `"${name}" is not a valid Route export field`,
          })
        }
      }
    }
  })

  return { inspected, violations }
}

function run(files: string[]): CheckResult {
  let exportsInspected = 0
  const violations: Violation[] = []
  for (const f of files) {
    const { inspected, violations: v } = scanSource(readFileSync(f, 'utf8'), relative(process.cwd(), f))
    exportsInspected += inspected
    violations.push(...v)
  }
  return { filesScanned: files.length, exportsInspected, violations }
}

function selfTest(): boolean {
  const fixtureClean = [
    `export const dynamic = 'force-dynamic'`,
    `export const maxDuration = 60`,
    `export async function GET(request: Request) {`,
    `  return new Response('ok')`,
    `}`,
    `export async function POST(request: Request) {`,
    `  return new Response('ok')`,
    `}`,
  ].join('\n')

  const fixtureDirty = [
    `export const dynamic = 'force-dynamic'`,
    `export interface SweepDeps {`,
    `  now: () => Date`,
    `}`,
    `export function runTrajectoryRetentionSweep(deps: SweepDeps) {`,
    `  return deps.now()`,
    `}`,
    `export async function GET(request: Request) {`,
    `  return new Response('ok')`,
    `}`,
  ].join('\n')

  const fixtureDefaultExport = [
    `export async function GET() { return new Response('ok') }`,
    `export default function unexpected() {}`,
  ].join('\n')

  // The sharper case: a default export whose declared name coincides with an allowed handler
  // name. Must still be flagged as a default export — the name coinciding is not an exemption.
  const fixtureDefaultNamedGet = [
    `export default function GET() { return new Response('ok') }`,
  ].join('\n')

  const fixtureExportList = [
    `function helper() {}`,
    `export { helper as GET, helper as leakedHelper }`,
  ].join('\n')

  const clean = scanSource(fixtureClean, '<self-test:clean>')
  const dirty = scanSource(fixtureDirty, '<self-test:dirty>')
  const defaultExport = scanSource(fixtureDefaultExport, '<self-test:default>')
  const defaultNamedGet = scanSource(fixtureDefaultNamedGet, '<self-test:default-named-get>')
  const exportList = scanSource(fixtureExportList, '<self-test:list>')

  const checks: Array<[string, boolean]> = [
    ['clean fixture inspects all 4 exports (non-vacuity)', clean.inspected === 4],
    ['clean fixture yields no violation', clean.violations.length === 0],
    ['dirty fixture inspects all 4 exports', dirty.inspected === 4],
    ['dirty fixture flags exactly the 2 non-handler exports', dirty.violations.length === 2],
    ['dirty violation names SweepDeps', dirty.violations.some(v => v.name === 'SweepDeps')],
    ['dirty violation names runTrajectoryRetentionSweep',
      dirty.violations.some(v => v.name === 'runTrajectoryRetentionSweep')],
    ['a bare `export default function unexpected` is flagged',
      defaultExport.violations.some(v => v.name === 'unexpected')],
    ['the default-export fixture leaves the real GET export unflagged',
      defaultExport.violations.length === 1],
    ['a default export NAMED "GET" is still flagged as a default export ' +
      '(the name coinciding with an allowed handler is not an exemption)',
      defaultNamedGet.violations.length === 1 && defaultNamedGet.violations[0]?.name === 'GET'],
    ['an export-list alias to a disallowed name is flagged',
      exportList.violations.some(v => v.name === 'leakedHelper')],
    ['an export-list alias to an allowed name (GET) is not flagged',
      exportList.violations.every(v => v.name !== 'GET')],
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
    console.log('route-export-check — self-test (proves the detector is live):')
    const ok = selfTest()
    console.log(ok ? '\nSelf-test PASSED.' : '\nSelf-test FAILED — the detector is not working.')
    process.exit(ok ? 0 : 1)
  }

  let files: string[]
  if (args.includes('--staged')) {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
      .split('\n').map(s => s.trim()).filter(Boolean)
      .filter(p => /^website\/src\/app\/api\/.*\/route\.ts$/.test(p))
      .map(p => join(process.cwd(), '..', p))
      .filter(existsSync)
    files = staged
    if (files.length === 0) {
      console.log('route-export-check: no staged route.ts files — nothing to check.')
      process.exit(0)
    }
  } else {
    files = walk(API_ROOT)
  }

  const result = run(files)
  console.log(
    `route-export-check: ${result.filesScanned} route.ts file(s) scanned, ` +
    `${result.exportsInspected} export(s) inspected.`
  )

  // Non-vacuity floor: a full-repo run that finds zero route.ts files means the detector or its
  // root path broke, not that the repo has no routes. A --staged run legitimately may find 0.
  if (!args.includes('--staged') && result.filesScanned === 0) {
    console.error(
      'FAIL — found zero route.ts files under src/app/api.\n' +
      '       That is a broken detector or a moved API root, not an empty repo. Run --self-test.'
    )
    process.exit(1)
  }

  if (result.violations.length > 0) {
    console.error(`\nFAIL — ${result.violations.length} invalid route export(s):\n`)
    for (const v of result.violations) {
      console.error(`  ${v.file}:${v.line}  ${v.reason}`)
    }
    console.error(
      '\nA route.ts may export only HTTP method handlers and route-segment config. ' +
      '`tsc` and the tsx test suite both miss this — it fails only at `next build`.\n' +
      'Fix: move the extra export into a sibling module (e.g. handler.ts) and have route.ts ' +
      'import from it, exporting only the thin wrapper.'
    )
    process.exit(1)
  }

  console.log('route-export-check: PASS — no invalid route exports.')
}

main()
