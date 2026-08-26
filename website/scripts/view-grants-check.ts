/**
 * view-grants-check.ts — structural check for the Supabase default-view-grants class.
 *
 * Reflections arc, item 3's second named-not-taken leftover, taken up on explicit founder
 * election (2026-08-26): "remediate the 5 existing files first, then add the check." Source
 * lesson: memory `supabase-view-default-grants-auto-updatable`.
 *
 * THE PROPERTY. Supabase grants default privileges — the FULL set (SELECT, INSERT, UPDATE,
 * DELETE, TRUNCATE, ...) — to `anon`, `authenticated`, and `service_role` on any newly created
 * `public` view, invisibly to the migration's own text. A migration that states only a `GRANT
 * SELECT` (or no grant at all) reads as SELECT-restricted but is not: the default grant sits
 * underneath it. A single-table view is also auto-updatable in Postgres, and the view's owner
 * bypasses the base table's RLS — so an unrevoked default grant can let an anonymous PostgREST
 * client write through the view, not merely read it. Found live on the ST1 TEST walk
 * (2026-08-03) and again during this leftover's own remediation (2026-08-26), which found 5 of
 * the repo's 7 view-creating files carrying no REVOKE at all.
 *
 * THE CHECK: every `CREATE VIEW` / `CREATE OR REPLACE VIEW <name>` in a SQL file must be paired,
 * IN THE SAME FILE, with a `REVOKE ALL ON <name> FROM ...` statement — the pattern every
 * remediated file in this repo now follows (`REVOKE ALL` first, `GRANT` exactly what's needed
 * after). This does not verify the grant that follows is correctly scoped (that is a design
 * judgement — who should read it — this check cannot make); it only verifies the default-ALL
 * grant is not left standing unrevoked.
 *
 * WHAT THIS CHECK ACTUALLY COVERS, AND WHAT IT DOES NOT (the header-bytestring-check.ts /
 * route-export-check.ts precedent — this comment names its own scope):
 *   COVERED — a `CREATE VIEW` or `CREATE OR REPLACE VIEW [public.]NAME` statement anywhere in a
 *   `.sql` file, cross-referenced against a `REVOKE ALL ON [public.]NAME` statement anywhere in
 *   THE SAME FILE (case-insensitive on both; the `public.` prefix is optional on either side and
 *   does not need to match between the two).
 *   NOT COVERED — a REVOKE issued in a DIFFERENT file than the CREATE VIEW (this repo's own
 *   `view-grants-remediation-migration.sql` is exactly that shape, and is allow-listed by name
 *   below rather than pretending the check can see the connection — it retroactively fixes 4
 *   ALREADY-LIVE files, it does not itself create any view). A future one-off remediation file
 *   of this shape would need the same allow-list treatment, named explicitly, not silently
 *   passed.
 *   NOT COVERED — whether the REVOKE's own FROM clause is complete (anon, authenticated,
 *   service_role, PUBLIC) or whether the subsequent GRANT is scoped to the right role for the
 *   view's actual consumers. Presence of a REVOKE is a floor, not a correctness proof.
 *   NOT COVERED — a view created via a mechanism other than a literal `CREATE VIEW` statement
 *   (a stored procedure, a dynamic `EXECUTE`, dbt, etc.).
 *
 * NON-VACUITY. A guard that silently stops guarding still reports zero failures (memory
 * `guard-needs-a-non-vacuity-floor`). A full-repo run that finds zero CREATE VIEW statements at
 * all is treated as a broken detector (this repo has 7+ view-creating files as of authoring), not
 * a clean repo. `--self-test` runs synthetic paired and unpaired fixtures the detector must
 * classify correctly.
 *
 * Usage:
 *   npx tsx scripts/view-grants-check.ts             # check the whole repo
 *   npx tsx scripts/view-grants-check.ts --self-test  # prove the detector is live
 *   npx tsx scripts/view-grants-check.ts --staged     # only staged .sql files (pre-commit)
 *
 * Exit 0 = clean. Exit 1 = a violation, or the detector traversed nothing on a full run.
 */

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, relative } from 'node:path'

const REPO_ROOT = join(process.cwd(), '..')

// A retroactive remediation file whose REVOKEs deliberately apply to views CREATEd in other,
// already-live files (2026-08-26). Named explicitly rather than silently exempted by a general
// rule — a future file of this exact shape needs its own named addition here, not a loosened
// pattern.
const CROSS_FILE_REMEDIATIONS = new Set(['supabase-view-grants-remediation-migration.sql'])

const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'dist', 'build'])

const CREATE_VIEW = /create\s+(?:or\s+replace\s+)?view\s+(?:public\.)?([a-z_][a-z0-9_]*)/gi
const REVOKE_ALL_ON = /revoke\s+all\s+on\s+(?:public\.)?([a-z_][a-z0-9_]*)/gi

export interface Violation {
  file: string
  line: number
  view: string
}

export interface CheckResult {
  filesScanned: number
  viewsInspected: number
  violations: Violation[]
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.sql$/i.test(p)) out.push(p)
  }
  return out
}

/** Strip a `-- ...` line comment (the only comment style this repo's SQL files use — a NOT
 * COVERED case, per the header above, if `--` ever appears inside a string literal). */
function stripLineComment(line: string): string {
  const idx = line.indexOf('--')
  return idx === -1 ? line : line.slice(0, idx)
}

export function scanSource(source: string, file: string, fileBaseName: string):
  { views: string[]; violations: Violation[] } {
  if (CROSS_FILE_REMEDIATIONS.has(fileBaseName)) return { views: [], violations: [] }

  const lines = source.split('\n').map(stripLineComment)
  const stripped = lines.join('\n')

  const revoked = new Set<string>()
  REVOKE_ALL_ON.lastIndex = 0
  let rm: RegExpExecArray | null
  while ((rm = REVOKE_ALL_ON.exec(stripped)) !== null) revoked.add(rm[1].toLowerCase())

  const views: string[] = []
  const violations: Violation[] = []

  lines.forEach((line, i) => {
    CREATE_VIEW.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = CREATE_VIEW.exec(line)) !== null) {
      const name = m[1]
      views.push(name)
      if (!revoked.has(name.toLowerCase())) {
        violations.push({ file, line: i + 1, view: name })
      }
    }
  })

  return { views, violations }
}

function run(files: string[]): CheckResult {
  let viewsInspected = 0
  const violations: Violation[] = []
  for (const f of files) {
    const rel = relative(REPO_ROOT, f)
    const { views, violations: v } = scanSource(readFileSync(f, 'utf8'), rel, f.split('/').pop() || '')
    viewsInspected += views.length
    violations.push(...v)
  }
  return { filesScanned: files.length, viewsInspected, violations }
}

function selfTest(): boolean {
  const fixturePaired = [
    `CREATE OR REPLACE VIEW public.my_view AS SELECT 1;`,
    ``,
    `REVOKE ALL ON public.my_view FROM anon, authenticated, service_role, PUBLIC;`,
    `GRANT SELECT ON public.my_view TO service_role;`,
  ].join('\n')

  const fixtureUnpaired = [
    `CREATE VIEW leaky_view AS SELECT * FROM profiles;`,
    `GRANT SELECT ON leaky_view TO service_role;`, // a grant with no preceding revoke
  ].join('\n')

  const fixtureMultiView = [
    `CREATE OR REPLACE VIEW view_a AS SELECT 1;`,
    `CREATE OR REPLACE VIEW view_b AS SELECT 1;`,
    `REVOKE ALL ON view_a FROM anon, authenticated, service_role, PUBLIC;`,
    `GRANT SELECT ON view_a TO service_role;`,
    // view_b has no matching revoke — must be flagged even though view_a in the same file is fine
  ].join('\n')

  // The exact false-positive class found live against this repo (2026-08-26): a comment
  // MENTIONING "CREATE OR REPLACE VIEW" in prose must never be read as a real statement, and a
  // file whose only view block has been neutralised to a comment must report zero views.
  const fixtureCommentOnly = [
    `-- Postgres does not allow CREATE OR REPLACE VIEW to remove`,
    `-- a column (CREATE OR REPLACE VIEW appends columns).`,
    `ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;`,
  ].join('\n')

  const paired = scanSource(fixturePaired, '<self-test:paired>', 'paired.sql')
  const unpaired = scanSource(fixtureUnpaired, '<self-test:unpaired>', 'unpaired.sql')
  const multi = scanSource(fixtureMultiView, '<self-test:multi>', 'multi.sql')
  const allowlisted = scanSource(fixtureUnpaired, '<self-test:allowlisted>',
    'supabase-view-grants-remediation-migration.sql')
  const commentOnly = scanSource(fixtureCommentOnly, '<self-test:comment-only>', 'comment-only.sql')

  const checks: Array<[string, boolean]> = [
    ['paired fixture inspects the 1 view (non-vacuity)', paired.views.length === 1],
    ['paired fixture yields no violation', paired.violations.length === 0],
    ['unpaired fixture is flagged', unpaired.violations.length === 1],
    ['unpaired violation names the leaky view', unpaired.violations[0]?.view === 'leaky_view'],
    ['multi-view fixture inspects both views', multi.views.length === 2],
    ['multi-view fixture flags only the unrevoked one', multi.violations.length === 1],
    ['the unrevoked violation names view_b, not view_a', multi.violations[0]?.view === 'view_b'],
    ['the named cross-file-remediation file is allow-listed (0 violations, 0 views claimed)',
      allowlisted.violations.length === 0 && allowlisted.views.length === 0],
    ['a comment merely MENTIONING "CREATE OR REPLACE VIEW" claims zero views (non-vacuity ' +
      'the other direction — it must not fabricate a violation from prose)',
      commentOnly.views.length === 0 && commentOnly.violations.length === 0],
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
    console.log('view-grants-check — self-test (proves the detector is live):')
    const ok = selfTest()
    console.log(ok ? '\nSelf-test PASSED.' : '\nSelf-test FAILED — the detector is not working.')
    process.exit(ok ? 0 : 1)
  }

  let files: string[]
  if (args.includes('--staged')) {
    const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
      .split('\n').map(s => s.trim()).filter(Boolean)
      .filter(p => /\.sql$/i.test(p))
      .map(p => join(REPO_ROOT, p))
      .filter(existsSync)
    files = staged
    if (files.length === 0) {
      console.log('view-grants-check: no staged .sql files — nothing to check.')
      process.exit(0)
    }
  } else {
    files = walk(REPO_ROOT)
  }

  const result = run(files)
  console.log(
    `view-grants-check: ${result.filesScanned} .sql file(s) scanned, ` +
    `${result.viewsInspected} CREATE VIEW statement(s) inspected.`
  )

  // Non-vacuity floor: a full-repo run that finds zero CREATE VIEW statements means the detector
  // broke, not that the repo has no views. A --staged run legitimately may find 0.
  if (!args.includes('--staged') && result.viewsInspected === 0) {
    console.error(
      'FAIL — found zero CREATE VIEW statements across the whole repo.\n' +
      '       That is a broken detector, not a view-free repo. Run --self-test.'
    )
    process.exit(1)
  }

  if (result.violations.length > 0) {
    console.error(`\nFAIL — ${result.violations.length} view(s) with no REVOKE ALL in the same file:\n`)
    for (const v of result.violations) {
      console.error(`  ${v.file}:${v.line}  ${v.view}`)
    }
    console.error(
      '\nSupabase grants the FULL default privilege set (not just SELECT) to anon/authenticated/\n' +
      'service_role on a new public view. Add, in this same file, right after the view:\n' +
      '  REVOKE ALL ON <view> FROM anon, authenticated, service_role, PUBLIC;\n' +
      '  GRANT SELECT ON <view> TO <the roles that actually need it>;\n' +
      'A single-table view is also auto-updatable — an unrevoked default grant can let an\n' +
      'anonymous client write through it, bypassing the base table\'s RLS.'
    )
    process.exit(1)
  }

  console.log('view-grants-check: PASS — every CREATE VIEW has a matching REVOKE ALL.')
}

main()
