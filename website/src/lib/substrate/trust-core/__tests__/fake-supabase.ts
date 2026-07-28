/**
 * fake-supabase.ts — a minimal in-memory fake of the Supabase client, supporting
 * exactly the call chains trust-core-store.ts uses. Deterministic; no I/O. Lets
 * the battery exercise emit idempotency, the fold, reflect-across-domains, data
 * rights, and purge without a real DB (the real wire is proven in the founder-
 * walked TEST end-to-end walk).
 *
 * Supported chains:
 *   from(t).insert(row).select('id')                       → { data:[{id}], error }
 *   from(t).upsert(row, { onConflict })                    → { error }
 *   from(t).update(obj).eq(c,v)                            → { error }
 *   from(t).delete().eq(c,v).select('id')                  → { data:[{id}], error }
 *   from(t).delete().lt(c,v).select('id')                  → { data:[{id}], error }
 *   from(t).select('*').eq(c,v)[.eq(c2,v2)][.maybeSingle]  → { data, error }
 *   from(t).select('col').eq().eq().order().limit(1).maybeSingle() → { data, error }
 *
 * Enforces the events unique index (correlation_id, event_type,
 * coalesce(virtue_domain,'__agent_wide__')) WHERE correlation_id IS NOT NULL — so
 * idempotency is genuinely tested.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

type Row = Record<string, unknown>
type Filter = { kind: 'eq' | 'lt'; col: string; val: unknown }

export interface FakeSupabase {
  client: SupabaseClient
  tables: { agent_trust_events: Row[]; agent_trust_state: Row[]; collaboration_records: Row[] }
  /** PA-3 pin (2026-07-11): arm a ONE-SHOT error on the next matching op — lets
   *  the battery inject a TRANSIENT (non-missing-table) failure, which the
   *  missingTables switch cannot express. Fires once, then clears. */
  failNext: (
    op: 'select' | 'upsert' | 'insert' | 'update' | 'delete',
    table: string,
    error: { code?: string; message: string },
  ) => void
}

export function makeFakeSupabase(opts?: { missingTables?: boolean }): FakeSupabase {
  const tables: Record<string, Row[]> = {
    agent_trust_events: [],
    agent_trust_state: [],
    // Trust Layer S5 — the collaboration record (added 2026-07-09). Lets the S5
    // battery exercise the collaboration-store CRUD + data-rights + purge.
    collaboration_records: [],
  }
  let idCounter = 0
  const missing = opts?.missingTables === true
  const MISSING = { data: null as unknown, error: { code: '42P01', message: 'relation does not exist' } }
  let armedFailure: {
    op: 'select' | 'upsert' | 'insert' | 'update' | 'delete'
    table: string
    error: { code?: string; message: string }
  } | null = null

  function eventKey(r: Row): string {
    return `${String(r.correlation_id)}|${String(r.event_type)}|${r.virtue_domain ?? '__agent_wide__'}`
  }

  class Builder {
    private op: 'insert' | 'upsert' | 'update' | 'delete' | 'select' | null = null
    private payload: Row | Row[] | null = null
    private filters: Filter[] = []
    private single = false
    private onConflict: string | null = null
    /** A2 (2026-07-28): chained .order() calls accumulate as primary + tiebreak
     *  columns, in call order — mirrors real PostgREST multi-column ordering.
     *  Backward-compatible: a single .order() call behaves exactly as before. */
    private orders: { col: string; asc: boolean }[] = []
    private limitN: number | null = null

    constructor(private table: string) {}

    insert(row: Row | Row[]) {
      this.op = 'insert'
      this.payload = row
      return this
    }
    upsert(row: Row, cfg?: { onConflict?: string }) {
      this.op = 'upsert'
      this.payload = row
      this.onConflict = cfg?.onConflict ?? null
      return this
    }
    update(obj: Row) {
      this.op = 'update'
      this.payload = obj
      return this
    }
    delete() {
      this.op = 'delete'
      return this
    }
    select(_cols?: string) {
      if (this.op === null) this.op = 'select'
      return this
    }
    eq(col: string, val: unknown) {
      this.filters.push({ kind: 'eq', col, val })
      return this
    }
    lt(col: string, val: unknown) {
      this.filters.push({ kind: 'lt', col, val })
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
    maybeSingle() {
      this.single = true
      return this
    }

    private match(r: Row): boolean {
      return this.filters.every((f) =>
        f.kind === 'eq'
          ? r[f.col] === f.val
          : String(r[f.col]) < String(f.val),
      )
    }

    private run(): { data: unknown; error: unknown } {
      if (missing) return MISSING
      if (armedFailure && armedFailure.op === this.op && armedFailure.table === this.table) {
        const e = armedFailure.error
        armedFailure = null // one-shot
        return { data: null, error: e }
      }
      const rows = tables[this.table]
      switch (this.op) {
        case 'insert': {
          const toInsert = Array.isArray(this.payload) ? this.payload : [this.payload as Row]
          const inserted: Row[] = []
          for (const raw of toInsert) {
            const r: Row = { id: `id-${idCounter++}`, ...raw }
            if (this.table === 'agent_trust_events' && r.correlation_id != null) {
              const key = eventKey(r)
              if (rows.some((ex) => eventKey(ex) === key)) {
                return { data: null, error: { code: '23505', message: 'duplicate key' } }
              }
            }
            // collaboration_records: enforce uq_cr_orchestrator_task so the
            // idempotent-open path (duplicate → 23505 → benign) is genuinely tested.
            if (this.table === 'collaboration_records') {
              if (
                rows.some(
                  (ex) =>
                    ex.orchestrator_agent_id === r.orchestrator_agent_id &&
                    ex.task_ref === r.task_ref,
                )
              ) {
                return { data: null, error: { code: '23505', message: 'duplicate key' } }
              }
            }
            rows.push(r)
            inserted.push(r)
          }
          return { data: inserted.map((r) => ({ id: r.id })), error: null }
        }
        case 'upsert': {
          const row = this.payload as Row
          const keys = (this.onConflict ?? '').split(',').map((s) => s.trim()).filter(Boolean)
          const idx = rows.findIndex((ex) => keys.every((k) => ex[k] === row[k]))
          if (idx >= 0) rows[idx] = { ...rows[idx], ...row }
          else rows.push({ id: `id-${idCounter++}`, ...row })
          return { data: null, error: null }
        }
        case 'update': {
          for (let i = 0; i < rows.length; i++) {
            if (this.match(rows[i])) rows[i] = { ...rows[i], ...(this.payload as Row) }
          }
          return { data: null, error: null }
        }
        case 'delete': {
          const kept: Row[] = []
          const removed: Row[] = []
          for (const r of rows) (this.match(r) ? removed : kept).push(r)
          tables[this.table] = kept
          return { data: removed.map((r) => ({ id: r.id })), error: null }
        }
        case 'select':
        default: {
          let out = rows.filter((r) => this.match(r))
          if (this.orders.length > 0) {
            const orders = this.orders
            out = [...out].sort((a, b) => {
              for (const { col, asc } of orders) {
                const av = String(a[col] ?? '')
                const bv = String(b[col] ?? '')
                const cmp = av.localeCompare(bv)
                if (cmp !== 0) return asc ? cmp : -cmp
              }
              return 0
            })
          }
          if (this.limitN != null) out = out.slice(0, this.limitN)
          if (this.single) return { data: out.length ? out[0] : null, error: null }
          return { data: out, error: null }
        }
      }
    }

    // Thenable — `await builder` resolves the query.
    then<R>(onFulfilled: (value: { data: unknown; error: unknown }) => R): R {
      return onFulfilled(this.run())
    }
  }

  const client = {
    from(table: string) {
      return new Builder(table)
    },
  } as unknown as SupabaseClient

  return {
    client,
    tables: tables as FakeSupabase['tables'],
    failNext: (op, table, error) => {
      armedFailure = { op, table, error }
    },
  }
}
