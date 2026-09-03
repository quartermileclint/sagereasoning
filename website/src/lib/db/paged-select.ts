/**
 * paged-select.ts — a shared, minimal keyset-paging helper for exhaustive
 * Supabase reads, built 2026-09-03 (C1 of the row-cap sweep remediation,
 * `operations/founder-hub-2026-09/2026-09-02-unbounded-select-sweep-REPORT.md`).
 *
 * WHY THIS EXISTS. PostgREST silently truncates any unbounded `.select()` at
 * this project's `db-max-rows` (confirmed behaviourally at 1,000; see the
 * sweep report §0). No error, no header — just the newest or oldest rows
 * silently dropped depending on order. Nine sites across the cost-health
 * (A13), abuse-detection (A19), SLO-health (A14), and admin-metrics surfaces
 * read a table with no `.limit()` at all and aggregate (count/sum/max/
 * distinct/group) the result client-side — every one of them was silently
 * wrong the moment its table crossed the cap. `pagedRows` walks the table to
 * completion via a strict keyset cursor so the caller's aggregation always
 * runs over the TRUE full set, never an arbitrary 1,000-row slice.
 *
 * NOT a general query builder. It supports exactly the shape every site in
 * this sweep needs: an optional `.eq()` filter, an optional `.gte()` time
 * filter, ordered ascending by a single cursor column, paged forward with a
 * strict `.gt()` on that column.
 *
 * THE CURSOR COLUMN MUST BE A TOTAL ORDER OVER THE FILTERED ROWS — either a
 * genuinely unique column (a primary key: `id`, `event_id`) or a column
 * whose ties are acceptable to the caller. Two call sites in this session
 * use `created_at` alone on `analytics_events` (whose schema has no
 * CREATE TABLE in this repo, so its primary-key column name could not be
 * confirmed from source) — a documented, disclosed residual: at the
 * confirmed ~1 write/13min rate on that table, two rows sharing an exact
 * microsecond timestamp is vanishingly unlikely, and even if it happened the
 * failure mode is that a tied row landing AFTER the page boundary is
 * SKIPPED (the strict `.gt()` cursor excludes every row sharing the last
 * page's final timestamp, not just the ones already returned) — a bounded,
 * single-page-boundary miss, never a systemic truncation of the aggregate.
 * Every other call site in this build uses a confirmed UUID primary key,
 * which has no such residual (a UNIQUE column has no ties to lose rows to).
 *
 * FAIL-HONEST, not fail-closed: a read error on any page aborts the whole
 * walk and returns `{ rows: null, error }` — a partial result is NEVER
 * silently presented as complete (the same discipline
 * `provenance-c2-discharge-tally.ts`'s `must()` and this session's
 * `conversation-history.ts` keyset both already follow).
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export interface PagedSelectOpts {
  /** Column to filter on with `.eq()`. Optional. */
  eqColumn?: string
  eqValue?: unknown
  /** Column to filter on with `.not(col, 'is', null)`. Optional. */
  notNullColumn?: string
  /** Column to filter on with `.gte()` — a time-window lower bound. Optional. */
  gteColumn?: string
  gteValue?: string
  /** Rows per page. Default 500 — comfortably under the 1,000 server cap so a
   *  page can never itself be silently truncated. */
  pageSize?: number
}

export interface PagedSelectResult<T> {
  rows: T[] | null
  error: string | null
}

/**
 * Exhaustively read `table`, filtered per `opts`, ordered ascending by
 * `cursorColumn`, paged forward with a strict `.gt()` cursor. Returns every
 * matching row across as many requests as needed — never truncates at the
 * server's row cap.
 */
export async function pagedRows<T>(
  db: SupabaseClient,
  table: string,
  cursorColumn: string,
  selectColumns: string,
  opts: PagedSelectOpts = {},
): Promise<PagedSelectResult<T>> {
  const pageSize = opts.pageSize ?? 500
  const out: T[] = []
  let cursor: unknown = null

  for (;;) {
    let q = db.from(table).select(selectColumns)
    if (opts.eqColumn !== undefined) q = q.eq(opts.eqColumn, opts.eqValue)
    if (opts.notNullColumn !== undefined) q = q.not(opts.notNullColumn, 'is', null)
    if (opts.gteColumn !== undefined && opts.gteValue !== undefined) {
      q = q.gte(opts.gteColumn, opts.gteValue)
    }
    if (cursor !== null) q = q.gt(cursorColumn, cursor)
    q = q.order(cursorColumn, { ascending: true }).limit(pageSize)

    const { data, error } = await q
    if (error) {
      return { rows: null, error: error.message ?? String(error) }
    }
    const page = (data ?? []) as unknown as T[]
    if (page.length === 0) break
    out.push(...page)
    if (page.length < pageSize) break
    cursor = (page[page.length - 1] as Record<string, unknown>)[cursorColumn]
  }

  return { rows: out, error: null }
}

/**
 * `pagedRangeSelect` — a second, OFFSET-based pagination strategy for C4 (the
 * data-rights export/access/delete class, `operations/founder-hub-2026-09/
 * 2026-09-02-unbounded-select-sweep-REPORT.md` §M5/M6), added 2026-09-03.
 *
 * WHY A SECOND STRATEGY, NOT `pagedRows` REUSED. `pagedRows` requires a
 * caller-known, genuinely-unique cursor column. The data-rights export loops
 * in `user/export/route.ts` iterate ~15-20 DIFFERENT tables generically (a
 * `{ key, table, select }` array), most with schemas outside this repo's
 * tracked migrations — their primary-key column names cannot be confirmed
 * from source, and a wrong guess would silently break pagination rather than
 * fail loudly (a `.order()`/`.gt()` on a nonexistent column errors, which
 * `pagedRows` DOES surface honestly — but that would mean every one of these
 * ~20 tables needs its schema individually verified before this ships, which
 * PR19 review should assess against the alternative below).
 *
 * `pagedRangeSelect` needs no PK knowledge: it walks `.range(offset,
 * offset+pageSize-1)` with NO explicit `.order()` call. THIS IS A GENUINE,
 * NOT MERELY THEORETICAL, RESIDUAL (PR19 review, 2026-09-03, MEDIUM finding,
 * folded into this disclosure rather than silently accepted): Postgres makes
 * no ordering guarantee for a query without `ORDER BY`, and each page here
 * is a SEPARATE HTTP round-trip (no held-open server-side cursor), so a plan
 * change, autovacuum, or HOT-chain relocation between two page requests can
 * genuinely reorder rows the walk has not yet reached — this is reachable by
 * ordinary, non-adversarial concurrent activity (e.g. the same user writing
 * a new row to the very table being exported, in the same window as their
 * own export/delete request), not only pathological timing. Every C4 site
 * this ships at (2026-09-03) reads at most one page (well under
 * `pageSize`=500) for its own data volume today, so the multi-page case this
 * residual requires is not yet live-observed — but it is NOT bounded away by
 * this helper's own design, only by today's data volumes at each site. A
 * later table crossing one page's worth of rows for one user reopens this
 * exactly.
 *
 * THE TRADE-OFF, DISCLOSED: offset pagination is not safe against a
 * concurrent WRITE to the SAME filtered row-set while the walk is in
 * progress (a row inserted or deleted between page N and page N+1 can shift
 * every subsequent offset, causing a row to be skipped or, less likely,
 * repeated) — compounded by the ordering gap above. Accepted for C4
 * specifically because every call site is a one-shot read of one
 * user's/credential's own historical or configuration data during an
 * account export or an account-deletion's key-resolution step — not a live,
 * continuously-written feed multiple readers observe concurrently (the
 * founder-hub chat case `pagedRows`'s keyset design was built for). The
 * residual risk is a MISSED row in an export or a missed credential in a
 * deletion's key-resolution pass, in the rare case the user is actively
 * writing to that exact table in the same instant as their own export/delete
 * request — not a systemic truncation, and the reviewer's own verdict was
 * ship-safe with this disclosed, not a blocking defect. `incomplete` is set
 * true if the walk hits `MAX_PAGES` (a safety valve against an unbounded
 * loop) so a caller can disclose an incomplete result rather than present it
 * as definitive — but note `incomplete` does NOT catch the ordering/
 * concurrent-write residual above; only the page-count ceiling.
 */
export interface PagedRangeResult<T> {
  rows: T[] | null
  error: string | null
  incomplete: boolean
}

const PAGED_RANGE_MAX_PAGES = 50 // 50 * 500 = 25,000 rows — a generous ceiling

export async function pagedRangeSelect<T>(
  db: SupabaseClient,
  table: string,
  applyFilter: (q: any) => any,
  selectColumns = '*',
  opts: { pageSize?: number } = {},
): Promise<PagedRangeResult<T>> {
  const pageSize = opts.pageSize ?? 500
  const out: T[] = []
  let offset = 0
  let pages = 0
  let incomplete = false

  for (;;) {
    let q = db.from(table).select(selectColumns)
    q = applyFilter(q)
    q = q.range(offset, offset + pageSize - 1)

    const { data, error } = await q
    if (error) {
      return { rows: null, error: error.message ?? String(error), incomplete: false }
    }
    const page = (data ?? []) as unknown as T[]
    out.push(...page)
    pages += 1
    if (page.length < pageSize) break
    if (pages >= PAGED_RANGE_MAX_PAGES) {
      incomplete = true
      break
    }
    offset += pageSize
  }

  return { rows: out, error: null, incomplete }
}
