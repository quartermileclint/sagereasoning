/**
 * fake-stoa-supabase.ts — a minimal in-memory fake of the Supabase client,
 * supporting exactly the call chains stoa-store.ts uses (modelled on the
 * trust-core fake, but LOCAL to the Stoa battery — importing the trust-core
 * test fake would put a trust-core specifier inside the Stoa tree and muddy
 * the #20 boundary the battery itself pins). Deterministic; no I/O. The real
 * wire is proven in the founder-walked TEST→prod migration walk.
 *
 * Supported chains:
 *   from(t).insert(row).select('*').maybeSingle()
 *   from(t).update(obj).eq(..)[.eq(..)].select('*').maybeSingle()
 *   from(t).update(obj).eq(..)[.eq(..)].select('id')
 *   from(t).delete().eq(..).select('id')
 *   from(t).select('*').eq(..)[.eq(..)][.in(..)][.contains(..)]
 *          [.order(..)][.limit(n)][.range(a,b)][.maybeSingle()]
 *
 * Enforces the two partial-unique indexes (owner_user_id / agent_id WHERE
 * status='active') so the #11 one-entry invariant is genuinely tested on BOTH
 * the insert and the reactivation path.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

type Row = Record<string, unknown>
type Filter =
  | { kind: 'eq'; col: string; val: unknown }
  | { kind: 'in'; col: string; vals: unknown[] }
  | { kind: 'contains'; col: string; vals: unknown[] }

export interface FakeStoaSupabase {
  client: SupabaseClient
  rows: Row[]
  /** Arm a ONE-SHOT error on the next matching op (transient-failure injection —
   *  the missingTables switch cannot express a post-migration failure). */
  failNext: (
    op: 'select' | 'insert' | 'update' | 'delete',
    error: { code?: string; message: string },
  ) => void
  /** The last .range() args seen (PR19 fold F4, 2026-08-03 — lets the battery
   *  assert the LIST_MAX_LIMIT clamp actually reached the query). */
  lastRange: { from: number; to: number } | null
}

export function makeFakeStoaSupabase(opts?: { missingTables?: boolean }): FakeStoaSupabase {
  const rows: Row[] = []
  let idCounter = 0
  const missing = opts?.missingTables === true
  const MISSING = {
    data: null as unknown,
    error: { code: '42P01', message: 'relation "public.stoa_entries" does not exist' },
  }
  let armed: { op: string; error: { code?: string; message: string } } | null = null

  /** The two partial uniques: an ACTIVE row per owner_user_id / per agent_id. */
  function activeCollision(candidate: Row, ignoreId?: unknown): boolean {
    if (candidate.status !== 'active') return false
    return rows.some((r) => {
      if (r === candidate || (ignoreId !== undefined && r.id === ignoreId)) return false
      if (r.status !== 'active') return false
      if (candidate.owner_user_id != null && r.owner_user_id === candidate.owner_user_id) return true
      if (candidate.agent_id != null && r.agent_id === candidate.agent_id) return true
      return false
    })
  }

  class Builder {
    private op: 'insert' | 'update' | 'delete' | 'select' | null = null
    private payload: Row | null = null
    private filters: Filter[] = []
    private single = false
    private wantRows = false // .select() after a mutation → return affected rows
    private orders: { col: string; asc: boolean }[] = []
    private limitN: number | null = null
    private rangeFrom: number | null = null
    private rangeTo: number | null = null

    insert(row: Row) {
      this.op = 'insert'
      this.payload = row
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
      else this.wantRows = true
      return this
    }
    eq(col: string, val: unknown) {
      this.filters.push({ kind: 'eq', col, val })
      return this
    }
    in(col: string, vals: unknown[]) {
      this.filters.push({ kind: 'in', col, vals })
      return this
    }
    contains(col: string, vals: unknown[]) {
      this.filters.push({ kind: 'contains', col, vals })
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
    range(from: number, to: number) {
      this.rangeFrom = from
      this.rangeTo = to
      result.lastRange = { from, to }
      return this
    }
    maybeSingle() {
      this.single = true
      return this
    }

    private match(r: Row): boolean {
      return this.filters.every((f) => {
        if (f.kind === 'eq') return r[f.col] === f.val
        if (f.kind === 'in') return f.vals.includes(r[f.col])
        const arr = r[f.col]
        return Array.isArray(arr) && f.vals.every((v) => (arr as unknown[]).includes(v))
      })
    }

    private execute(): { data: unknown; error: { code?: string; message: string } | null } {
      const op = this.op ?? 'select'
      if (armed && armed.op === op) {
        const e = armed.error
        armed = null
        return { data: null, error: e }
      }
      if (missing) return MISSING

      if (op === 'insert') {
        const row: Row = {
          id: `row-${++idCounter}`,
          renewed_at: null,
          removal_ground: null,
          removal_artifact_ref: null,
          what_i_bring: null,
          what_i_seek: null,
          contact_channel: null,
          tags: [],
          owner_user_id: null,
          agent_id: null,
          credential_ref: null,
          ...this.payload,
        }
        if (activeCollision(row)) {
          return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } }
        }
        rows.push(row)
        return { data: this.single ? row : [row], error: null }
      }

      if (op === 'update') {
        const affected = rows.filter((r) => this.match(r))
        // Reactivation collision check (the partial unique binds updates too).
        for (const r of affected) {
          const next = { ...r, ...this.payload }
          if (next.status === 'active' && activeCollision(next, r.id)) {
            return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } }
          }
        }
        for (const r of affected) Object.assign(r, this.payload)
        const out = this.wantRows ? affected : null
        if (this.single) return { data: (out ?? affected)[0] ?? null, error: null }
        return { data: out, error: null }
      }

      if (op === 'delete') {
        const affected = rows.filter((r) => this.match(r))
        for (const r of affected) rows.splice(rows.indexOf(r), 1)
        return { data: affected.map((r) => ({ id: r.id })), error: null }
      }

      // select
      let out = rows.filter((r) => this.match(r))
      for (const o of [...this.orders].reverse()) {
        out = [...out].sort((a, b) => {
          const av = String(a[o.col] ?? '')
          const bv = String(b[o.col] ?? '')
          return o.asc ? av.localeCompare(bv) : bv.localeCompare(av)
        })
      }
      if (this.rangeFrom !== null && this.rangeTo !== null) {
        out = out.slice(this.rangeFrom, this.rangeTo + 1)
      } else if (this.limitN !== null) {
        out = out.slice(0, this.limitN)
      }
      if (this.single) {
        if (out.length > 1) return { data: null, error: { message: 'multiple rows returned' } }
        return { data: out[0] ?? null, error: null }
      }
      return { data: out, error: null }
    }

    then<T>(resolve: (v: { data: unknown; error: unknown }) => T): T {
      return resolve(this.execute())
    }
  }

  const client = {
    from: (table: string) => {
      if (table !== 'stoa_entries') {
        throw new Error(`fake-stoa-supabase: unexpected table ${table}`)
      }
      return new Builder()
    },
  } as unknown as SupabaseClient

  const result: FakeStoaSupabase = {
    client,
    rows,
    failNext: (op, error) => {
      armed = { op, error }
    },
    lastRange: null,
  }
  return result
}
