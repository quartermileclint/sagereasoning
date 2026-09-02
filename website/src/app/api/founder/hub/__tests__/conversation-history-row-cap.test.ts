/**
 * conversation-history-row-cap.test.ts — EXECUTED regression pin for the
 * silent PostgREST 1,000-row cap on /api/founder/hub (found + confirmed on
 * production 2026-09-02; fixed the same day).
 *
 * ===========================================================================
 * WHY THIS IS AN EXECUTION HARNESS AND NOT A SOURCE-PATTERN TEST
 * ===========================================================================
 *
 * The 2026-09-01 message-persistence pin is a source-pattern test, and the
 * handoff prompt for this fix was explicit that the >1,000-row property is
 * "fixture-constructible — do not accept a source-pattern assertion alone
 * where the behaviour can be executed." So the two reads were extracted into
 * conversation-history.ts and are EXECUTED here against a fake client that
 * MODELS THE CAP: every response is truncated to `maxRows` (default 1,000)
 * after ordering and after any explicit limit, exactly as PostgREST does, and
 * an exact count is computed on the full matching set INDEPENDENT of the
 * cap, exactly as PostgREST does. §1 proves the fake reproduces the
 * production defect against the OLD chain shape before anything else is
 * asserted — a fake that could not reproduce the bug would make every later
 * pass vacuous.
 *
 * The route's wiring to the helpers is then pinned by RUNNING the repo's own
 * unbounded-select sweep over route.ts (scripts/unbounded-select-sweep.ts)
 * and asserting zero unbounded reads of the messages table remain — with a
 * non-vacuity floor that the sweep saw at least one chain on that table, so
 * the pin cannot pass by finding nothing.
 *
 * Run: npx tsx src/app/api/founder/hub/__tests__/conversation-history-row-cap.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  loadRecentHistory,
  loadConversationPage,
  parseConversationPageParams,
  clampPageLimit,
  MENTOR_HISTORY_WINDOW,
  CONVERSATION_PAGE_DEFAULT,
  CONVERSATION_PAGE_MAX,
  MESSAGES_TABLE,
  type PageCursor,
} from '../conversation-history'
import { sweep } from '../../../../../../scripts/unbounded-select-sweep'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// The cap-modelling fake
// ─────────────────────────────────────────────────────────────────────────────

type Row = Record<string, unknown>
type Pred = (r: Row) => boolean

/** Parse a PostgREST logical filter — `a.lt.X,and(a.eq.X,b.lt.Y)` — into a
 *  predicate. Supports eq/neq/lt/lte/gt/gte on string-comparable values and
 *  nested and()/or() groups. Throws on anything else, so a helper emitting a
 *  shape this parser does not understand FAILS the test rather than silently
 *  matching everything. String comparison is the right model here: the
 *  fixture's timestamps share one format/precision and its ids are
 *  same-length lowercase hex, so lexical order == Postgres order. */
function compileLogic(expr: string, mode: 'or' | 'and'): Pred {
  const terms = splitTopLevel(expr)
  const preds = terms.map(compileTerm)
  return mode === 'or' ? (r) => preds.some((p) => p(r)) : (r) => preds.every((p) => p(r))
}

function splitTopLevel(s: string): string[] {
  const out: string[] = []
  let depth = 0
  let cur = ''
  for (const ch of s) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ',' && depth === 0) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  if (cur.length) out.push(cur)
  return out
}

function compileTerm(t: string): Pred {
  const trimmed = t.trim()
  const group = /^(and|or)\(([\s\S]*)\)$/.exec(trimmed)
  if (group) return compileLogic(group[2], group[1] as 'and' | 'or')
  const m = /^([A-Za-z_][A-Za-z0-9_]*)\.(eq|neq|lt|lte|gt|gte)\.([\s\S]*)$/.exec(trimmed)
  if (!m) throw new Error(`fake: unsupported filter term ${JSON.stringify(trimmed)}`)
  const [, col, op, rawVal] = m
  const val = rawVal.startsWith('"') && rawVal.endsWith('"') ? rawVal.slice(1, -1) : rawVal
  return (r) => {
    const v = String(r[col])
    switch (op) {
      case 'eq':
        return v === val
      case 'neq':
        return v !== val
      case 'lt':
        return v < val
      case 'lte':
        return v <= val
      case 'gt':
        return v > val
      case 'gte':
        return v >= val
      default:
        return false
    }
  }
}

interface FakeOpts {
  maxRows?: number
  /** One-shot: the next query on this client returns this error. */
  failNext?: { message: string; code?: string } | null
}

function makeFakeClient(tables: Record<string, Row[]>, opts: FakeOpts = {}): { client: SupabaseClient; state: { queries: number; failNext: FakeOpts['failNext'] } } {
  const maxRows = opts.maxRows ?? 1000
  const state = { queries: 0, failNext: opts.failNext ?? null }

  class FakeQuery {
    private preds: Pred[] = []
    private orders: { col: string; asc: boolean }[] = []
    private limitN: number | null = null
    private countMode = false
    constructor(private rows: Row[]) {}
    select(_cols?: string, o?: { count?: string; head?: boolean }) {
      if (o?.count === 'exact') this.countMode = true
      return this
    }
    eq(col: string, v: unknown) {
      this.preds.push((r) => r[col] === v)
      return this
    }
    or(expr: string) {
      this.preds.push(compileLogic(expr, 'or'))
      return this
    }
    order(col: string, cfg?: { ascending?: boolean }) {
      this.orders.push({ col, asc: cfg?.ascending !== false })
      return this
    }
    limit(n: number) {
      this.limitN = n
      return this
    }
    private run() {
      state.queries++
      if (state.failNext) {
        const err = state.failNext
        state.failNext = null
        return { data: null, error: err, count: null }
      }
      const filtered = this.rows.filter((r) => this.preds.every((p) => p(r)))
      const sorted = filtered.slice().sort((a, b) => {
        for (const o of this.orders) {
          const av = String(a[o.col])
          const bv = String(b[o.col])
          if (av === bv) continue
          const c = av < bv ? -1 : 1
          return o.asc ? c : -c
        }
        return 0
      })
      // PostgREST: exact count on the FULL matching set, independent of max-rows.
      const count = this.countMode ? filtered.length : null
      // Explicit limit first, then the server-side cap — min(limit, max-rows).
      let out = this.limitN !== null ? sorted.slice(0, this.limitN) : sorted
      out = out.slice(0, maxRows)
      return { data: out.map((r) => ({ ...r })), error: null, count }
    }
    then<T>(resolve: (v: { data: unknown; error: unknown; count: number | null }) => T) {
      return Promise.resolve(this.run()).then(resolve)
    }
  }

  const client = {
    from(table: string) {
      return new FakeQuery(tables[table] ?? [])
    },
  } as unknown as SupabaseClient
  return { client, state }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixture: a 1,013-row conversation, mirroring the production thread
// ─────────────────────────────────────────────────────────────────────────────

const CONV = 'conv-8223090a'
const OTHER_CONV = 'conv-other'

function ts(i: number): string {
  // PostgREST timestamptz shape with 6 fractional digits and a +00:00 offset.
  const d = new Date(Date.UTC(2026, 7, 1, 0, 0, 0) + i * 1000)
  return d.toISOString().replace('Z', '000+00:00')
}
function uuid(i: number): string {
  return `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`
}

/** Row i (1-based) — odd rows are the founder, even rows the mentor, every
 *  50th an observer aside (so the window's role mix is realistic). Content is
 *  `row <i>` so assertions can name rows by number. `ties` = pairs [a, b]
 *  that share a's timestamp with their ids SWAPPED so that id order opposes
 *  index order at the tie — the tie-break must still walk them correctly. */
function makeRows(n: number, ties: Array<[number, number]> = []): Row[] {
  const rows: Row[] = []
  for (let i = 1; i <= n; i++) {
    const observer = i % 50 === 0
    rows.push({
      id: uuid(i),
      conversation_id: CONV,
      role: observer ? 'observer' : i % 2 === 1 ? 'founder' : 'agent',
      agent_type: observer ? 'ops' : i % 2 === 1 ? null : 'mentor',
      content: `row ${i}`,
      created_at: ts(i),
    })
  }
  for (const [a, b] of ties) {
    rows[b - 1].created_at = rows[a - 1].created_at
    const tmp = rows[a - 1].id
    rows[a - 1].id = rows[b - 1].id
    rows[b - 1].id = tmp
  }
  // Noise: another conversation's rows, which must never leak in.
  for (let i = 1; i <= 30; i++) {
    rows.push({ id: uuid(900000 + i), conversation_id: OTHER_CONV, role: 'founder', agent_type: null, content: `other ${i}`, created_at: ts(i) })
  }
  return rows
}

const N = 1013
const rowNum = (r: { content?: unknown }) => Number(String(r.content).replace('row ', ''))

async function main(): Promise<void> {
  // ── §0 The fake models the cap (self-test; everything below leans on it) ──
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) })
    const { data, count } = await (client.from(MESSAGES_TABLE).select('*', { count: 'exact' }).eq('conversation_id', CONV) as unknown as Promise<{ data: Row[]; count: number }>)
    assert(data.length === 1000, `§0-1 an unbounded query on ${N} rows returns exactly 1,000 (saw ${data.length}) — the fake enforces max-rows`)
    assert(count === N, `§0-2 the exact count is ${N} regardless of the cap (saw ${count}) — the fake models PostgREST count semantics`)
  }

  // ── §1 NEGATIVE CONTROL: the pre-fix chain shape reproduces the defect ────
  // This is the old route.ts code, verbatim in shape: ascending, no limit,
  // then slice(-20). If this section ever stops reproducing rows 981-1000,
  // the fake no longer models the bug and every pass below is suspect.
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) })
    const { data } = await (client
      .from(MESSAGES_TABLE)
      .select('role, agent_type, content')
      .eq('conversation_id', CONV)
      .order('created_at', { ascending: true }) as unknown as Promise<{ data: Row[] }>)
    const history = data ?? []
    const window = history.slice(-20)
    assert(history.length === 1000, `§1-1 old shape: 1,000 rows returned of ${N} (saw ${history.length})`)
    assert(rowNum(history[history.length - 1]) === 1000, `§1-2 old shape: the last visible row is row 1000 (saw ${rowNum(history[history.length - 1])}) — the NEWEST 13 are the ones dropped`)
    assert(window.length === 20 && rowNum(window[0]) === 981 && rowNum(window[19]) === 1000, `§1-3 old shape: slice(-20) is rows 981-1000 (saw ${rowNum(window[0])}-${rowNum(window[window.length - 1])}) — the mentor's memory pinned to row 1000`)
    assert(!history.some((r) => rowNum(r) === N), `§1-4 old shape: row ${N} (the founder's newest message) is absent — the production symptom, reproduced`)
  }

  // ── §2 loadRecentHistory returns the NEWEST window, ascending, with the total
  {
    const { client, state } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) })
    const res = await loadRecentHistory(client, CONV)
    assert(res.error === null, '§2-1 no error')
    assert(res.history.length === MENTOR_HISTORY_WINDOW, `§2-2 exactly ${MENTOR_HISTORY_WINDOW} rows (saw ${res.history.length})`)
    assert(rowNum(res.history[0]) === N - MENTOR_HISTORY_WINDOW + 1 && rowNum(res.history[res.history.length - 1]) === N, `§2-3 the window is rows ${N - MENTOR_HISTORY_WINDOW + 1}-${N} (saw ${rowNum(res.history[0])}-${rowNum(res.history[res.history.length - 1])}) — the mentor sees the ACTUAL newest message`)
    assert(res.history.every((r, i) => i === 0 || String(r.created_at) >= String(res.history[i - 1].created_at)), '§2-4 returned ascending (oldest → newest), the shape the model-message builder expects')
    assert(res.total === N, `§2-5 total is the exact conversation count ${N} (saw ${res.total}), not the window length`)
    assert(state.queries === 1, `§2-6 one round trip (saw ${state.queries}) — count rides the same request`)
    assert(res.history.every((r) => String(r.content).startsWith('row ')), '§2-7 no other conversation leaks in (the fixture\'s other-conversation rows read "other N")')
  }

  // ── §3 Empty conversation ────────────────────────────────────────────────
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) })
    const res = await loadRecentHistory(client, 'conv-empty')
    assert(res.error === null && res.history.length === 0 && res.total === 0, `§3-1 empty conversation → [] and total 0 (saw ${res.history.length}/${res.total})`)
  }

  // ── §4 Read errors surface; they are not swallowed into "no memory" ──────
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) }, { failNext: { message: 'boom', code: 'XX000' } })
    const res = await loadRecentHistory(client, CONV)
    assert(res.error !== null && res.error.message === 'boom', '§4-1 the read error is returned, not discarded')
    assert(res.history.length === 0 && res.total === null, '§4-2 no history and no total on error (the route throws — see §11)')
  }

  // ── §5 First page: newest 200, ascending, cursor on the earliest ─────────
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) })
    const res = await loadConversationPage(client, CONV)
    assert(res.error === null, '§5-1 no error')
    assert(res.page.limit === CONVERSATION_PAGE_DEFAULT && res.page.returned === CONVERSATION_PAGE_DEFAULT, `§5-2 default page of ${CONVERSATION_PAGE_DEFAULT} (saw ${res.page.returned})`)
    assert(rowNum(res.messages[res.messages.length - 1]) === N, `§5-3 the page ends on row ${N} — the newest message IS on the first page`)
    assert(rowNum(res.messages[0]) === N - CONVERSATION_PAGE_DEFAULT + 1, `§5-4 the page begins at row ${N - CONVERSATION_PAGE_DEFAULT + 1} (saw ${rowNum(res.messages[0])})`)
    assert(res.page.has_earlier === true, '§5-5 has_earlier is true')
    assert(res.page.matching_total === N, `§5-6 matching_total is ${N} on the first page`)
    assert(res.page.earliest_cursor !== null && res.page.earliest_cursor.id === String(res.messages[0].id) && res.page.earliest_cursor.created_at === String(res.messages[0].created_at), '§5-7 the cursor is the earliest returned row')
  }

  // ── §6 Walking every page reconstructs the whole thread exactly ──────────
  async function walk(client: SupabaseClient, limit: number): Promise<{ all: Row[]; pages: number; lastPage: Awaited<ReturnType<typeof loadConversationPage>> }> {
    const all: Row[] = []
    let before: PageCursor | null = null
    let pages = 0
    let last = await loadConversationPage(client, CONV, { limit, before })
    for (;;) {
      pages++
      if (last.error) throw new Error(last.error.message)
      all.unshift(...(last.messages as Row[]))
      if (!last.page.has_earlier) break
      before = last.page.earliest_cursor
      if (pages > 200) throw new Error('walk did not terminate')
      last = await loadConversationPage(client, CONV, { limit, before })
    }
    return { all, pages, lastPage: last }
  }
  function assertExactThread(all: Row[], label: string): void {
    const nums = all.map(rowNum)
    const distinct = new Set(nums)
    assert(all.length === N, `${label}-a ${N} rows reconstructed (saw ${all.length})`)
    assert(distinct.size === N, `${label}-b no duplicates (distinct ${distinct.size})`)
    assert(nums.every((v, i) => i === 0 || v === nums[i - 1] + 1) && nums[0] === 1, `${label}-c contiguous and in order 1..${N}`)
  }
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) })
    const { all, pages, lastPage } = await walk(client, 200)
    assertExactThread(all, '§6-1')
    assert(pages === Math.ceil(N / 200), `§6-2 ${Math.ceil(N / 200)} pages (saw ${pages})`)
    assert(lastPage.page.returned === N % 200 && lastPage.page.has_earlier === false && lastPage.page.matching_total === N % 200, `§6-3 the last page returns the remainder ${N % 200} with has_earlier false and matching_total ${N % 200} (saw ${lastPage.page.returned}/${lastPage.page.has_earlier}/${lastPage.page.matching_total})`)
  }

  // ── §7 Timestamp ties at a page boundary: the id tie-break holds ─────────
  // Page boundaries at limit 200 fall between rows 813|814, 613|614, 413|414,
  // 213|214, 13|14. Tie rows across each boundary, with ids swapped so the
  // tie-break has to do real work, and a three-way tie inside a page.
  {
    const ties: Array<[number, number]> = [[813, 814], [613, 614], [413, 414], [213, 214], [13, 14], [500, 501], [501, 502]]
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N, ties) })
    const { all } = await walk(client, 200)
    const nums = all.map(rowNum)
    assert(all.length === N && new Set(nums).size === N, `§7-1 ties at every boundary: ${N} rows, no duplicates, none skipped (saw ${all.length}/${new Set(nums).size})`)
  }

  // ── §8 The design survives the cap itself (a lower max-rows than the page)
  // A future project setting of max-rows=100, or a limit above the cap, must
  // not lose rows: has_earlier comes from the exact count and the cursor
  // from the earliest row ACTUALLY returned, so the walk takes more pages
  // rather than dropping a remainder. This is the property that makes the
  // fix robust rather than merely "has a limit now".
  {
    const { client } = makeFakeClient({ [MESSAGES_TABLE]: makeRows(N) }, { maxRows: 100 })
    const first = await loadConversationPage(client, CONV, { limit: 500 })
    assert(first.page.returned === 100 && first.page.has_earlier === true, `§8-1 a 500-row page under a 100-row cap returns 100 and STILL reports has_earlier (saw ${first.page.returned}/${first.page.has_earlier})`)
    const { all, pages } = await walk(client, 500)
    assertExactThread(all, '§8-2')
    assert(pages === Math.ceil(N / 100), `§8-3 the walk simply takes ${Math.ceil(N / 100)} pages (saw ${pages})`)
    const recent = await loadRecentHistory(client, CONV)
    assert(recent.history.length === MENTOR_HISTORY_WINDOW && rowNum(recent.history[recent.history.length - 1]) === N, '§8-4 the mentor window is unaffected by a 100-row cap (20 < 100)')
  }

  // ── §9 clampPageLimit ────────────────────────────────────────────────────
  {
    assert(clampPageLimit(undefined) === CONVERSATION_PAGE_DEFAULT, '§9-1 absent → default')
    assert(clampPageLimit(null) === CONVERSATION_PAGE_DEFAULT, '§9-2 null → default')
    assert(clampPageLimit('50') === 50, '§9-3 "50" → 50')
    assert(clampPageLimit(0) === CONVERSATION_PAGE_DEFAULT && clampPageLimit(-1) === CONVERSATION_PAGE_DEFAULT, '§9-4 0 / negative → default')
    assert(clampPageLimit('abc') === CONVERSATION_PAGE_DEFAULT && clampPageLimit(NaN) === CONVERSATION_PAGE_DEFAULT, '§9-5 non-numeric → default')
    assert(clampPageLimit(5000) === CONVERSATION_PAGE_MAX && clampPageLimit(CONVERSATION_PAGE_MAX) === CONVERSATION_PAGE_MAX, `§9-6 above max → clamped to ${CONVERSATION_PAGE_MAX}`)
    assert(clampPageLimit(1) === 1 && clampPageLimit('7.9') === 7, '§9-7 1 → 1; fractional floors')
    assert(CONVERSATION_PAGE_MAX < 1000, `§9-8 the page max (${CONVERSATION_PAGE_MAX}) sits under the 1,000-row cap by construction`)
  }

  // ── §10 parseConversationPageParams — the cursor is validated, never ignored
  {
    const ok = parseConversationPageParams(new URLSearchParams(''))
    assert(ok.ok && ok.before === null && ok.limit === CONVERSATION_PAGE_DEFAULT, '§10-1 no params → first page, default limit')
    const withCursor = parseConversationPageParams(new URLSearchParams({ limit: '100', before_created_at: ts(814), before_id: uuid(814) }))
    assert(withCursor.ok && withCursor.limit === 100 && withCursor.before?.id === uuid(814) && withCursor.before?.created_at === ts(814), '§10-2 a well-formed cursor round-trips')
    const zForm = parseConversationPageParams(new URLSearchParams({ before_created_at: '2026-08-31T09:15:49.123Z', before_id: uuid(1) }))
    assert(zForm.ok, '§10-3 the Z-suffixed ISO form is accepted too')
    const half = parseConversationPageParams(new URLSearchParams({ before_created_at: ts(814) }))
    assert(!half.ok, '§10-4 one cursor param without the other → error (400), not silently the first page')
    const badDate = parseConversationPageParams(new URLSearchParams({ before_created_at: 'yesterday', before_id: uuid(1) }))
    assert(!badDate.ok, '§10-5 malformed timestamp → error')
    const badId = parseConversationPageParams(new URLSearchParams({ before_created_at: ts(1), before_id: 'not-a-uuid' }))
    assert(!badId.ok, '§10-6 malformed id → error')
    const inject = parseConversationPageParams(new URLSearchParams({ before_created_at: ts(1), before_id: `${uuid(1)}),or(id.gt.0` }))
    assert(!inject.ok, '§10-7 a filter-injection attempt in the id is refused')
    const injectTs = parseConversationPageParams(new URLSearchParams({ before_created_at: `${ts(1)},id.gt.0`, before_id: uuid(1) }))
    assert(!injectTs.ok, '§10-8 a filter-injection attempt in the timestamp is refused')
    const emptyId = parseConversationPageParams(new URLSearchParams({ before_created_at: ts(1), before_id: '' }))
    assert(!emptyId.ok, '§10-9 an empty id is refused')
  }

  // ── §11 The route is wired to the bounded helpers — pinned by RUNNING the sweep
  {
    const websiteRoot = path.resolve(__dirname, '../../../../../..')
    const ROUTE = 'src/app/api/founder/hub/route.ts'
    const HELPER = 'src/app/api/founder/hub/conversation-history.ts'
    const { chains } = sweep(websiteRoot, { includeTests: false })
    const routeChains = chains.filter((c) => c.file === ROUTE && c.table === MESSAGES_TABLE)
    assert(routeChains.length >= 6, `§11-0 non-vacuity: the sweep sees the route's chains on ${MESSAGES_TABLE} (saw ${routeChains.length})`)
    const unboundedInRoute = routeChains.filter((c) => c.classification === 'unbounded-read')
    assert(unboundedInRoute.length === 0, `§11-1 ZERO unbounded reads of ${MESSAGES_TABLE} remain in route.ts (saw ${unboundedInRoute.length}: ${unboundedInRoute.map((c) => c.line).join(',')})`)
    const routeReads = routeChains.filter((c) => c.methods.includes('select') && !c.methods.some((m) => ['insert', 'update', 'upsert', 'delete'].includes(m)))
    assert(routeReads.length === 0, `§11-2 route.ts performs NO direct read of ${MESSAGES_TABLE} at all any more — both go through conversation-history.ts (saw ${routeReads.length})`)
    const helperChains = chains.filter((c) => c.file === HELPER)
    assert(helperChains.length === 2, `§11-3 non-vacuity: the sweep sees the helper's two chains (saw ${helperChains.length})`)
    // loadRecentHistory is one expression (bounded-explicit); loadConversationPage
    // builds its chain across statements because the cursor filter is
    // conditional, so the sweep sees it as an assigned builder bounded by a
    // later `.limit(` (bounded-continuation). Neither is `unbounded-read` —
    // and the bound itself is EXECUTED by §5 (a 1,013-row thread returns
    // exactly 200), which is the load-bearing proof; this pin only keeps the
    // repo's own sweep honest about this file.
    const classes = helperChains.map((c) => c.classification).sort()
    assert(classes.join(',') === 'bounded-continuation,bounded-explicit', `§11-4 helper chains are bounded-explicit + bounded-continuation (saw ${classes.join(',')})`)
    assert(!chains.some((c) => c.file === HELPER && c.classification === 'unbounded-read'), '§11-4b no helper chain is classified unbounded-read')

    const routeSrc = fs.readFileSync(path.join(websiteRoot, ROUTE), 'utf-8')
    assert(/const historyRead = await loadRecentHistory\(supabaseAdmin, convId\)/.test(routeSrc), '§11-5 POST load_history calls loadRecentHistory')
    assert(/if \(historyRead\.error\) throw historyRead\.error/.test(routeSrc), '§11-6 POST throws on a history read error (fail loud, the 2026-09-01 discipline)')
    assert(/message_count: priorMessageCount \+ 2 \+ contributions\.length/.test(routeSrc), '§11-7 message_count derives from the exact prior count, not the window length')
    assert(/const priorMessageCount = historyRead\.total \?\? conversationHistory\.length/.test(routeSrc), '§11-8 priorMessageCount is the count with an honest fallback')
    assert(/loadConversationPage\(supabaseAdmin, conversationId, \{/.test(routeSrc), '§11-9 GET calls loadConversationPage')
    assert(/parseConversationPageParams\(searchParams\)/.test(routeSrc), '§11-10 GET validates the cursor params')
    assert(/page: pageRead\.page,/.test(routeSrc), '§11-11 GET returns the page descriptor to the client')
    assert(/conversationHistory\.slice\(-MENTOR_HISTORY_WINDOW\)/.test(routeSrc), '§11-12 the model-message builder slices by the named constant, not a literal 20')
    assert(!/\.slice\(-20\)/.test(routeSrc), '§11-13 no bare .slice(-20) literal remains')
  }

  // ── §12 The governance constant is pinned ────────────────────────────────
  // Not a tunable. The handoff prompt (§5c): "Put it to the mentor. Do not
  // widen the constant unilaterally as part of a bug fix." A change here must
  // be a deliberate test diff carrying a mentor ruling reference.
  assert(MENTOR_HISTORY_WINDOW === 20, `§12-1 MENTOR_HISTORY_WINDOW is 20 (saw ${MENTOR_HISTORY_WINDOW}) — the value the old slice(-20) used; widening is a mentor decision, not a build one`)

  // ── §13 The client pages consume the page descriptor ─────────────────────
  {
    const websiteRoot = path.resolve(__dirname, '../../../../../..')
    for (const page of ['src/app/private-mentor/page.tsx', 'src/app/founder-hub/page.tsx']) {
      const src = fs.readFileSync(path.join(websiteRoot, page), 'utf-8')
      assert(/before_created_at/.test(src) && /before_id/.test(src), `§13-1 ${page} can request an earlier page (passes the cursor back as before_created_at + before_id)`)
      assert(/has_earlier/.test(src) && /earliest_cursor/.test(src), `§13-2 ${page} reads has_earlier + earliest_cursor`)
      assert(/Load earlier/i.test(src), `§13-3 ${page} renders a load-earlier affordance`)
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('Failures:')
    for (const f of failures) console.log('  - ' + f)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('harness error:', err)
  process.exit(1)
})
