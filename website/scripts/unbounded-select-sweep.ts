/**
 * unbounded-select-sweep.ts — codebase-wide inventory of Supabase/PostgREST
 * read chains and whether each carries an explicit row bound.
 *
 * WHY THIS EXISTS (2026-09-02). PostgREST returns at most `max-rows` rows per
 * request (Supabase's project default: 1,000) and says NOTHING when it does —
 * no error, no truncation flag, no header the supabase-js client surfaces by
 * default. A `select()` chain with no `.limit()` / `.range()` / `.single()` /
 * `.maybeSingle()` / head-count therefore returns a silently truncated set
 * once the matching rows exceed the cap. Confirmed behaviourally on
 * `founder_conversation_messages` (1,013 rows → the newest 13 invisible,
 * because the query ordered ASCENDING). A silently truncated read on a
 * MEASUREMENT table is worse than a display defect: it produces a confidently
 * wrong number with no error — "a verified arithmetic operating on an
 * unverified set", already a named standing constraint in this project.
 *
 * WHAT IT DOES. Walks `src/` and `scripts/`, finds every `.from(<table>)`
 * call — a string literal OR an identifier/constant (`.from(table)`,
 * `.from(SESSIONS)`; the data-rights export/delete loops use exactly that
 * shape, and a sweep that could not see them would miss the one place a
 * silent truncation is a compliance defect rather than a display one) —
 * extracts the full fluent chain that follows it (across lines, through
 * nested parentheses and string/template literals), and classifies:
 *
 *   unbounded-read   a read chain (.select present, no prior write verb) with
 *                    NO .limit / .range / .single / .maybeSingle and not a
 *                    head-only count. THE CLASS THIS SWEEP EXISTS TO FIND.
 *   bounded-explicit a read chain carrying an explicit bound.
 *   bounded-continuation
 *                    a read chain assigned to a variable (`let q = …`) whose
 *                    bound is applied in a LATER statement on that variable
 *                    (`q = q.limit(…)`, `await q.order(…).limit(…)`). Found
 *                    by a forward scan within the same function; the
 *                    reviewer confirms the bound is on every path.
 *   count-only       .select(cols, { count, head: true }) — returns no rows;
 *                    the count reflects the full matching set (PostgREST
 *                    computes exact counts independently of max-rows).
 *   write-returning  .insert/.update/.upsert/.delete followed by .select —
 *                    the returned set is the write's own row set.
 *   write            a write chain with no .select at all.
 *   other            .from without .select (e.g. a bare .delete().eq()).
 *
 * Each site also carries two honesty flags for the reviewer:
 *   dynamicTable        the table name is an identifier, not a literal — the
 *                       reviewer resolves it (often a loop over a table list).
 *   assignedToVariable  the chain is assigned (`let q = client.from(...)`)
 *                       rather than awaited in place, so it may be CONTINUED
 *                       later (`q = q.limit(...)`) in code this tool cannot
 *                       see. An `unbounded-read` with this flag is a
 *                       candidate that needs the surrounding statements read
 *                       before it counts as a finding — the tool errs toward
 *                       the false-positive direction here, never the silent
 *                       one.
 *
 * WHAT IT DOES NOT DO. It does not know a table's cardinality, whether a
 * filter pins a primary key, or what the caller does with the rows. Those are
 * the semantic questions the per-site review answers; this script's job is to
 * make sure that review starts from the COMPLETE list rather than a grep that
 * cannot see a chain spanning six lines. Every `unbounded-read` it reports is
 * a CANDIDATE, not a finding; every chain it classifies as bounded is bounded
 * by an explicit method call, which is the only kind of bound it can see.
 *
 * Also lists `.rpc(` calls separately — PostgREST applies max-rows to
 * set-returning RPC responses too, so those need the same per-site read.
 *
 * Skips: node_modules, .next, __tests__ directories and *.test.ts (fake
 * clients — not production reads; pass --include-tests to see them), and
 * FUSE `.fuse_hidden*` artefacts (git-ignored deleted-file husks).
 *
 * Run:  npx tsx scripts/unbounded-select-sweep.ts [--json out.json] [--md out.md] [--include-tests]
 * Exit code is 0 regardless — this is an inventory, not a gate. A gate that
 * fails on any unbounded read would fire on legitimate small-table reads;
 * whether a gate is warranted is a question the first full review answers.
 */

import * as fs from 'fs'
import * as path from 'path'

export type Classification =
  | 'unbounded-read'
  | 'bounded-explicit'
  | 'bounded-continuation'
  | 'count-only'
  | 'write-returning'
  | 'write'
  | 'other'

export interface ChainSite {
  file: string
  line: number
  table: string
  dynamicTable: boolean
  assignedToVariable: boolean
  /** For `bounded-continuation`: the line where the assigned builder later
   *  receives its .limit/.range/.single — the reviewer confirms it is on the
   *  same code path (the heuristic cannot see branches). */
  continuationBoundLine: number | null
  methods: string[]
  classification: Classification
  /** The raw chain text, whitespace-collapsed, for the reviewer. */
  chain: string
  isTest: boolean
}

export interface RpcSite {
  file: string
  line: number
  fn: string
  isTest: boolean
}

const READ_BOUNDS = new Set(['limit', 'range', 'single', 'maybeSingle'])
const WRITE_VERBS = new Set(['insert', 'update', 'upsert', 'delete'])
/** Identifiers that are `.from(` callers but not Supabase (Array.from, Buffer.from, ...). */
const NON_SUPABASE_FROM_RECEIVERS = new Set(['Array', 'Buffer', 'Uint8Array', 'Object', 'Set', 'Map', 'Int8Array', 'Uint16Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'Uint8ClampedArray'])

function walk(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name.startsWith('.fuse_hidden')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) {
      out.push(full)
    }
  }
}

// Non-recursive: files directly at `dir`'s top level (never descends into
// subdirectories). Used for `website/`'s own root, whose subdirectories
// (src/, scripts/) are already walked separately by `sweep()` — a recursive
// walk here would double-count them.
function walkTopLevel(dir: string, out: string[]): void {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) continue
    if (/\.(ts|tsx|mjs|js)$/.test(entry.name)) out.push(path.join(dir, entry.name))
  }
}

function isTestPath(p: string): boolean {
  return /__tests__\//.test(p) || /\.test\.(ts|tsx|mjs|js)$/.test(p) || /\/fake-[a-z-]*supabase[a-z-]*\.ts$/.test(p)
}

/**
 * Starting at the index of a `.from(` match, walk forward and return the end
 * index of the fluent chain. A chain continues while, after a balanced `(...)`
 * closes at depth 0, the next significant token is `.identifier(`. Handles
 * string literals ('…', "…", `…` incl. `${…}` nesting), line + block comments,
 * and nested parentheses/brackets/braces inside arguments.
 */
function chainEnd(src: string, start: number): number {
  let i = start
  const n = src.length
  while (i < n) {
    if (src[i] !== '.') return i
    let j = i + 1
    while (j < n && /[A-Za-z0-9_$]/.test(src[j])) j++
    if (j === i + 1) return i
    const k = skipInsignificant(src, j)
    if (src[k] !== '(') {
      return i
    }
    let depth = 0
    let p = k
    while (p < n) {
      const c = src[p]
      if (c === "'" || c === '"') {
        p = skipString(src, p, c)
        continue
      }
      if (c === '`') {
        p = skipTemplate(src, p)
        continue
      }
      if (c === '/' && src[p + 1] === '/') {
        while (p < n && src[p] !== '\n') p++
        continue
      }
      if (c === '/' && src[p + 1] === '*') {
        p = src.indexOf('*/', p + 2)
        if (p === -1) return n
        p += 2
        continue
      }
      if (c === '(' || c === '[' || c === '{') depth++
      else if (c === ')' || c === ']' || c === '}') {
        depth--
        if (depth === 0) {
          p++
          break
        }
      }
      p++
    }
    const next = skipInsignificant(src, p)
    if (src[next] === '.' && /[A-Za-z_$]/.test(src[next + 1] ?? '')) {
      i = next
      continue
    }
    return p
  }
  return i
}

function skipInsignificant(src: string, i: number): number {
  const n = src.length
  for (;;) {
    while (i < n && /\s/.test(src[i])) i++
    if (src[i] === '/' && src[i + 1] === '/') {
      while (i < n && src[i] !== '\n') i++
      continue
    }
    if (src[i] === '/' && src[i + 1] === '*') {
      const e = src.indexOf('*/', i + 2)
      i = e === -1 ? n : e + 2
      continue
    }
    return i
  }
}

function skipString(src: string, i: number, quote: string): number {
  let p = i + 1
  while (p < src.length) {
    if (src[p] === '\\') {
      p += 2
      continue
    }
    if (src[p] === quote) return p + 1
    if (src[p] === '\n') return p
    p++
  }
  return p
}

function skipTemplate(src: string, i: number): number {
  let p = i + 1
  while (p < src.length) {
    if (src[p] === '\\') {
      p += 2
      continue
    }
    if (src[p] === '`') return p + 1
    if (src[p] === '$' && src[p + 1] === '{') {
      let depth = 0
      p += 1
      while (p < src.length) {
        const c = src[p]
        if (c === "'" || c === '"') {
          p = skipString(src, p, c)
          continue
        }
        if (c === '`') {
          p = skipTemplate(src, p)
          continue
        }
        if (c === '{') depth++
        else if (c === '}') {
          depth--
          if (depth === 0) {
            p++
            break
          }
        }
        p++
      }
      continue
    }
    p++
  }
  return p
}

function methodNames(chain: string): string[] {
  const names: string[] = []
  let i = 0
  const n = chain.length
  while (i < n) {
    if (chain[i] !== '.') break
    let j = i + 1
    while (j < n && /[A-Za-z0-9_$]/.test(chain[j])) j++
    names.push(chain.slice(i + 1, j))
    const k = skipInsignificant(chain, j)
    if (chain[k] !== '(') break
    let depth = 0
    let p = k
    while (p < n) {
      const c = chain[p]
      if (c === "'" || c === '"') {
        p = skipString(chain, p, c)
        continue
      }
      if (c === '`') {
        p = skipTemplate(chain, p)
        continue
      }
      if (c === '(' || c === '[' || c === '{') depth++
      else if (c === ')' || c === ']' || c === '}') {
        depth--
        if (depth === 0) {
          p++
          break
        }
      }
      p++
    }
    i = skipInsignificant(chain, p)
  }
  return names
}

function selectHasHeadCount(chain: string): boolean {
  const m = /\.select\s*\(([^)]*)\)/.exec(chain)
  if (!m) return false
  const args = m[1]
  return /head\s*:\s*true/.test(args) && /count\s*:/.test(args)
}

export function classify(chain: string, methods: string[]): Classification {
  const selectIdx = methods.indexOf('select')
  const firstWriteIdx = methods.findIndex((m) => WRITE_VERBS.has(m))
  if (selectIdx === -1) return firstWriteIdx !== -1 ? 'write' : 'other'
  if (firstWriteIdx !== -1 && firstWriteIdx < selectIdx) return 'write-returning'
  if (selectHasHeadCount(chain)) return 'count-only'
  if (methods.some((m) => READ_BOUNDS.has(m))) return 'bounded-explicit'
  return 'unbounded-read'
}

function lineOf(src: string, idx: number): number {
  let line = 1
  for (let i = 0; i < idx; i++) if (src[i] === '\n') line++
  return line
}

/** The identifier immediately before the `.from(` (the client expression's last segment). */
function receiverBefore(src: string, dotIdx: number): string {
  let e = dotIdx
  let s = e
  while (s > 0 && /[A-Za-z0-9_$]/.test(src[s - 1])) s--
  return src.slice(s, e)
}

/**
 * When the chain's receiver is on the right-hand side of an assignment
 * (`let q = client.from(...)`, `q = client\n  .from(...)`) rather than awaited
 * or returned in place, return the assigned variable's name; else null.
 * Looks backwards over whitespace + the receiver expression (identifiers
 * joined by `.`, possibly across lines) for `=` as the preceding significant
 * character, excluding `=>`, `==`, `!=`, `<=`, `>=`, then reads the
 * identifier before that `=`.
 */
function assignedVariableBefore(src: string, dotIdx: number): string | null {
  let s = dotIdx
  for (;;) {
    while (s > 0 && /\s/.test(src[s - 1])) s--
    const idEnd = s
    while (s > 0 && /[A-Za-z0-9_$]/.test(src[s - 1])) s--
    if (s === idEnd) break
    while (s > 0 && /\s/.test(src[s - 1])) s--
    if (s > 0 && src[s - 1] === '.') {
      s--
      continue
    }
    break
  }
  while (s > 0 && /\s/.test(src[s - 1])) s--
  if (s === 0 || src[s - 1] !== '=') return null
  const prev = src[s - 2] ?? ''
  if (prev === '=' || prev === '!' || prev === '<' || prev === '>') return null
  // the variable name: identifier immediately before the '='
  let e = s - 1
  while (e > 0 && /\s/.test(src[e - 1])) e--
  let b = e
  while (b > 0 && /[A-Za-z0-9_$]/.test(src[b - 1])) b--
  const name = src.slice(b, e)
  return name.length ? name : null
}

/**
 * For a chain assigned to `varName`, look FORWARD from the chain's end for a
 * later use of that variable that applies a read bound — `q.limit(`,
 * `q = q.range(`, `await q.order(...).limit(` — within the same function
 * (approximated as: before the next top-level `function`/`export` or 4,000
 * characters, whichever is first). Returns the line of the bound or null.
 * This is a heuristic in the false-NEGATIVE-safe direction: a missed
 * continuation leaves the chain classified unbounded (a candidate the review
 * reads), never the reverse.
 */
function continuationBound(src: string, chainEndIdx: number, varName: string): number | null {
  const stop = (() => {
    const tail = src.slice(chainEndIdx)
    const m = /\n(?:export\s+)?(?:async\s+)?function\s|\nexport\s+(?:const|default)\s/.exec(tail)
    const limitAt = m ? m.index : 4000
    return chainEndIdx + Math.min(limitAt, 4000)
  })()
  const region = src.slice(chainEndIdx, stop)
  const re = new RegExp(`\\b${varName.replace(/\$/g, '\\$')}\\b((?:\\s*\\.\\s*[A-Za-z_$][A-Za-z0-9_$]*\\s*\\((?:[^()]|\\([^()]*\\))*\\))*)\\s*\\.\\s*(limit|range|single|maybeSingle)\\s*\\(`, 'g')
  const m = re.exec(region)
  if (!m) return null
  return lineOf(src, chainEndIdx + m.index)
}

export function sweep(root: string, opts: { includeTests: boolean }): { chains: ChainSite[]; rpcs: RpcSite[]; filesScanned: number } {
  const files: string[] = []
  // `../sage-mentor` and `../sdk` sit OUTSIDE website/ at the repo root but are
  // imported across the boundary by website code (e.g. route.ts's
  // `../../../../../../sage-mentor/profile-store`) and carry their own
  // Supabase reads. A sweep rooted at website/ alone would not see them.
  for (const sub of ['src', 'scripts', '../sage-mentor', '../sdk']) {
    const d = path.join(root, sub)
    if (fs.existsSync(d)) walk(d, files)
  }
  // `website/`'s own top level (as opposed to website/src or website/scripts)
  // was previously unswept entirely — a real gap found on the 2026-09-03
  // retroactive review: website/hub_id_check.mjs is a founder-scratch
  // diagnostic script with a genuine unbounded `.from('mentor_interactions')`
  // read. Non-recursive so it doesn't double-count src/scripts.
  walkTopLevel(root, files)
  const chains: ChainSite[] = []
  const rpcs: RpcSite[] = []
  // literal table OR identifier table (`.from(table)`, `.from(TABLE_CONST)`)
  const fromRe = /\.from\(\s*(?:(['"`])([^'"`]+)\1|([A-Za-z_$][A-Za-z0-9_$.]*))\s*\)/g
  const rpcRe = /\.rpc\(\s*(['"`])([^'"`]+)\1/g
  for (const file of files) {
    const rel = path.relative(root, file)
    const isTest = isTestPath(rel)
    if (isTest && !opts.includeTests) continue
    const src = fs.readFileSync(file, 'utf-8')
    let m: RegExpExecArray | null
    fromRe.lastIndex = 0
    while ((m = fromRe.exec(src)) !== null) {
      const start = m.index
      const receiver = receiverBefore(src, start)
      if (NON_SUPABASE_FROM_RECEIVERS.has(receiver)) continue
      const literal = m[2]
      const ident = m[3]
      const end = chainEnd(src, start)
      const chainRaw = src.slice(start, end)
      const methods = methodNames(chainRaw)
      // Guard against non-Supabase `.from(x)` on arbitrary objects: require a
      // recognisable PostgREST verb somewhere in the chain.
      const looksPostgrest = methods.some((mm) => mm === 'select' || WRITE_VERBS.has(mm))
      if (!looksPostgrest) continue
      let classification = classify(chainRaw, methods)
      const assignedVar = assignedVariableBefore(src, start)
      let continuationBoundLine: number | null = null
      if (classification === 'unbounded-read' && assignedVar) {
        continuationBoundLine = continuationBound(src, end, assignedVar)
        if (continuationBoundLine !== null) classification = 'bounded-continuation'
      }
      chains.push({
        file: rel,
        line: lineOf(src, start),
        table: literal ?? ident,
        dynamicTable: literal === undefined,
        assignedToVariable: assignedVar !== null,
        continuationBoundLine,
        methods,
        classification,
        chain: chainRaw.replace(/\s+/g, ' ').slice(0, 400),
        isTest,
      })
    }
    rpcRe.lastIndex = 0
    while ((m = rpcRe.exec(src)) !== null) {
      rpcs.push({ file: rel, line: lineOf(src, m.index), fn: m[2], isTest })
    }
  }
  return { chains, rpcs, filesScanned: files.length }
}

function main(): void {
  const argv = process.argv.slice(2)
  const includeTests = argv.includes('--include-tests')
  const jsonOut = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null
  const mdOut = argv.includes('--md') ? argv[argv.indexOf('--md') + 1] : null
  const root = path.resolve(__dirname, '..')
  const { chains, rpcs, filesScanned } = sweep(root, { includeTests })

  const counts: Record<Classification, number> = {
    'unbounded-read': 0,
    'bounded-explicit': 0,
    'bounded-continuation': 0,
    'count-only': 0,
    'write-returning': 0,
    write: 0,
    other: 0,
  }
  for (const c of chains) counts[c.classification]++

  console.log(`files scanned: ${filesScanned}`)
  console.log(`.from() chains: ${chains.length}`)
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k}: ${v}`)
  console.log(`.rpc() calls: ${rpcs.length}`)

  const unbounded = chains.filter((c) => c.classification === 'unbounded-read')
  console.log(`\nunbounded-read: ${unbounded.length} (dynamic table: ${unbounded.filter((c) => c.dynamicTable).length}; assigned-to-variable: ${unbounded.filter((c) => c.assignedToVariable).length})`)
  const byTable = new Map<string, number>()
  for (const c of unbounded) byTable.set(c.table, (byTable.get(c.table) ?? 0) + 1)
  console.log('\nunbounded-read sites by table:')
  for (const [t, n] of [...byTable.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${n.toString().padStart(3)}  ${t}`)

  if (jsonOut) {
    fs.writeFileSync(jsonOut, JSON.stringify({ filesScanned, counts, chains, rpcs }, null, 2))
    console.log(`\nwrote ${jsonOut}`)
  }
  if (mdOut) {
    const lines: string[] = []
    lines.push('# Unbounded-select sweep — mechanical inventory', '')
    lines.push(`Files scanned: ${filesScanned}. Chains: ${chains.length}. RPC calls: ${rpcs.length}.`, '')
    lines.push('| # | class | file:line | table | flags | methods |', '|---|---|---|---|---|---|')
    chains
      .slice()
      .sort((a, b) => (a.classification === b.classification ? a.file.localeCompare(b.file) || a.line - b.line : a.classification.localeCompare(b.classification)))
      .forEach((c, i) => {
        const flags = [c.dynamicTable ? 'dynamic' : '', c.assignedToVariable ? 'assigned' : '', c.continuationBoundLine !== null ? `bound@${c.continuationBoundLine}` : ''].filter(Boolean).join(',')
        lines.push(`| ${i + 1} | ${c.classification} | \`${c.file}:${c.line}\` | \`${c.table}\` | ${flags} | ${c.methods.join(' → ')} |`)
      })
    lines.push('', '## RPC calls', '', '| file:line | fn |', '|---|---|')
    for (const r of rpcs) lines.push(`| \`${r.file}:${r.line}\` | \`${r.fn}\` |`)
    fs.writeFileSync(mdOut, lines.join('\n') + '\n')
    console.log(`wrote ${mdOut}`)
  }
}

if (require.main === module) main()
