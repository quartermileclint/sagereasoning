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
