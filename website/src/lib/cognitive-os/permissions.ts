/**
 * permissions.ts — the machine-enforced read/write discipline (spec §17,
 * Phase-1 component 9). Pure and deterministic. Fail-closed throughout.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚠ C2 — THE SCOPE OF THE FOUR NAMES, RULED (review Q1, 2026-09-09)
 *
 * `Laboratory`, `Attic`, `Archive`, `Threshold` are approved as PERMISSION SCOPE
 * IDENTIFIERS ONLY — read/write boundary labels in this permission model, for
 * PHASE 1 ONLY.
 *
 * THEY ARE NOT ACTOR NAMES, NOT AGENT IDENTIFIERS, AND NOT ENVIRONMENT
 * INSTANTIATIONS. Nothing in this library instantiates an actor. Any later use of
 * these identifiers to instantiate an actor REQUIRES ITS OWN SCOPING SESSION.
 *
 * "The approval is narrow and must be stated precisely." It is stated here, at the
 * only place in the library where the names are defined.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Constraints enforced HERE, structurally:
 *   C7 (Q10)  The scores a future Phase-6 routing mechanism would read are NOT
 *             WRITABLE BY ANY SCOPE. `routing_score` carries no write verb for
 *             anyone, in any row of the grant table. An agent's write permissions
 *             therefore cannot include the scores that govern its own routing.
 *             This is a PHASE-1 DESIGN CONSTRAINT, NOT A PHASE-6 PROBLEM.
 *   C8 (Q9)   `epistemic_debt_score` and `identity_coherence_score` NEVER leave
 *             the system. `assertNoInternalScoreEgress` enforces that on any
 *             payload bound for an external consumer — machine-enforced, not
 *             "internal-by-convention while being accessible via an API route a
 *             consumer could call."
 *   Constraint 6  No automatic reinstatement: Attic may SURFACE an old belief but
 *             holds NO write verb, so it structurally cannot reinstate one.
 *   Constraint 7  No automatic commitment: only Threshold holds COMMIT.
 */

import { INTERNAL_ONLY_SCALAR_KINDS } from './types'

// ============================================================================
// §1  SCOPES AND VERBS
// ============================================================================

/** C2: PERMISSION SCOPE IDENTIFIERS ONLY. Not actors. Phase 1 = these four. */
export const PERMISSION_SCOPES = [
  'Laboratory',
  'Attic',
  'Archive',
  'Threshold',
] as const

export type PermissionScope = (typeof PERMISSION_SCOPES)[number]

export const PERMISSION_VERBS = [
  'READ',
  'CREATE',
  'UPDATE',
  'REVISE',
  'RETRACT',
  'COMMIT',
] as const

export type PermissionVerb = (typeof PERMISSION_VERBS)[number]

/** Every verb except READ is a WRITE. Used by the C7 assertion. */
export const WRITE_VERBS: readonly PermissionVerb[] = Object.freeze([
  'CREATE',
  'UPDATE',
  'REVISE',
  'RETRACT',
  'COMMIT',
])

export const PERMISSION_RESOURCES = [
  'evidence',
  'claim',
  'hypothesis',
  'decision',
  'event',
  'identity',
  /** C7: the routing-relevant summary scores. Read-only to every scope, always. */
  'routing_score',
] as const

export type PermissionResource = (typeof PERMISSION_RESOURCES)[number]

// ============================================================================
// §2  THE GRANT TABLE — the whole permission model, in one readable object
// ============================================================================

/**
 * Grants, per spec §17's worked examples, narrowed to the four Phase-1 scopes.
 *
 *   Laboratory  READ evidence + claims; CREATE/UPDATE/REVISE/RETRACT claims and
 *               hypotheses. NO identity modification. NO COMMIT.
 *   Attic       READ claims + events ONLY. Surfacing an old belief is a READ.
 *               NO write verb of any kind ⇒ Constraint 6 is structural: Attic
 *               cannot reinstate; Laboratory must establish whether it returns.
 *   Archive     READ everything. NO writes. It reconstructs history (spec §6);
 *               a reconstructor that could write could rewrite the past.
 *   Threshold   READ all decision-relevant state; COMMIT decisions. It does NOT
 *               create, revise or retract claims — it decides on them.
 *
 * NOTE the empty write column for `routing_score` in EVERY row. That absence is
 * C7, and it is asserted directly by the battery rather than left to inspection.
 */
export const PERMISSION_GRANTS: Readonly<
  Record<PermissionScope, Readonly<Partial<Record<PermissionResource, readonly PermissionVerb[]>>>>
> = Object.freeze({
  Laboratory: Object.freeze({
    evidence: Object.freeze(['READ'] as PermissionVerb[]),
    claim: Object.freeze(['READ', 'CREATE', 'UPDATE', 'REVISE', 'RETRACT'] as PermissionVerb[]),
    hypothesis: Object.freeze(['READ', 'CREATE', 'UPDATE', 'REVISE', 'RETRACT'] as PermissionVerb[]),
    event: Object.freeze(['READ'] as PermissionVerb[]),
    decision: Object.freeze(['READ'] as PermissionVerb[]),
    // identity: ABSENT — "NO identity modification" (spec §17), and no read
    // either in Phase 1, since no identity state exists until Phase 3.
    routing_score: Object.freeze([] as PermissionVerb[]), // C7
  }),
  Attic: Object.freeze({
    claim: Object.freeze(['READ'] as PermissionVerb[]),
    event: Object.freeze(['READ'] as PermissionVerb[]),
    routing_score: Object.freeze([] as PermissionVerb[]), // C7
  }),
  Archive: Object.freeze({
    claim: Object.freeze(['READ'] as PermissionVerb[]),
    event: Object.freeze(['READ'] as PermissionVerb[]),
    decision: Object.freeze(['READ'] as PermissionVerb[]),
    evidence: Object.freeze(['READ'] as PermissionVerb[]),
    routing_score: Object.freeze(['READ'] as PermissionVerb[]), // READ only — C7
  }),
  Threshold: Object.freeze({
    claim: Object.freeze(['READ'] as PermissionVerb[]),
    evidence: Object.freeze(['READ'] as PermissionVerb[]),
    event: Object.freeze(['READ'] as PermissionVerb[]),
    // UPDATE added after PR19: marking a decision for review CHANGES its derived
    // status, so it is a WRITE and must not ride on READ. Threshold alone holds it.
    decision: Object.freeze(['READ', 'UPDATE', 'COMMIT'] as PermissionVerb[]),
    routing_score: Object.freeze(['READ'] as PermissionVerb[]), // READ only — C7
  }),
})

// ============================================================================
// §3  THE CHECK — fail-closed
// ============================================================================

/**
 * Is `scope` permitted to `verb` on `resource`?
 *
 * FAIL-CLOSED: an unknown scope, verb or resource returns false rather than
 * throwing or defaulting open. A permission model that errors open on an
 * unrecognised input is not a permission model.
 */
export function isPermitted(
  scope: string,
  verb: string,
  resource: string,
): boolean {
  if (!(PERMISSION_SCOPES as readonly string[]).includes(scope)) return false
  if (!(PERMISSION_VERBS as readonly string[]).includes(verb)) return false
  if (!(PERMISSION_RESOURCES as readonly string[]).includes(resource)) return false
  const row = PERMISSION_GRANTS[scope as PermissionScope]
  const verbs = row[resource as PermissionResource]
  if (verbs === undefined) return false
  return verbs.includes(verb as PermissionVerb)
}

export class PermissionDeniedError extends Error {
  constructor(
    readonly scope: string,
    readonly verb: string,
    readonly resource: string,
  ) {
    super(`Cognitive OS permission denied: ${scope} may not ${verb} ${resource}`)
    this.name = 'PermissionDeniedError'
  }
}

/** Assert a permission, throwing PermissionDeniedError if absent. */
export function assertPermitted(scope: string, verb: string, resource: string): void {
  if (!isPermitted(scope, verb, resource)) {
    throw new PermissionDeniedError(scope, verb, resource)
  }
}

/**
 * C7, asserted as a function rather than left to reading the table: no scope
 * holds any write verb on `routing_score`. Returns the offending rows, empty when
 * the constraint holds. The battery calls this AND independently re-walks the
 * table, so a bug here cannot make the constraint look satisfied.
 */
export function routingScoreWriters(): { scope: PermissionScope; verb: PermissionVerb }[] {
  const offenders: { scope: PermissionScope; verb: PermissionVerb }[] = []
  for (const scope of PERMISSION_SCOPES) {
    const verbs = PERMISSION_GRANTS[scope].routing_score ?? []
    for (const v of verbs) {
      if (WRITE_VERBS.includes(v)) offenders.push({ scope, verb: v })
    }
  }
  return offenders
}

// ============================================================================
// §4  C8 — THE EGRESS BOUNDARY (Q9), machine-enforced
// ============================================================================

/**
 * Where a payload is going.
 *
 * An `internal_scope` destination is one of the four Phase-1 permission scopes —
 * inside the system. An `external_consumer` destination is anything outside it:
 * a public API response, the public trust record, a handoff to a consumer, a
 * published artifact.
 */
export type EgressDestination =
  | { readonly kind: 'internal_scope'; readonly scope: PermissionScope }
  | { readonly kind: 'external_consumer'; readonly label: string }

export class InternalScoreEgressError extends Error {
  constructor(
    readonly offendingPath: string,
    readonly destinationLabel: string,
  ) {
    super(
      `Cognitive OS egress refused: internal-only score at "${offendingPath}" ` +
        `may never reach external consumer "${destinationLabel}". ` +
        `(Q9: epistemic_debt_score and identity_coherence_score never leave the system.)`,
    )
    this.name = 'InternalScoreEgressError'
  }
}

/**
 * Scan a payload for internal-only scores AND for anything the scan cannot read.
 *
 * ⚠ REWRITTEN AFTER PR19, WHICH LIVE-REPRODUCED FOUR BYPASSES of the original
 * `Object.entries` walk: a score inside a Map or Set, a non-enumerable own
 * property, a getter defined on a class prototype, and a Symbol key. Each was
 * invisible to the scan, so `sendExternally` shipped a real score to an external
 * consumer with no error. The original header called that "machine-enforced";
 * it was not.
 *
 * THE FIX IS NOT FOUR PATCHES. It is FAIL-CLOSED BY CONSTRUCTION: this scan
 * recognises only what it can exhaustively read — primitives, arrays, and PLAIN
 * objects walked via `Reflect.ownKeys` (which covers non-enumerable keys AND
 * Symbol keys). ANY other container — Map, Set, class instance, function, Date,
 * Proxy, or an object with an accessor property — is reported as UNSCANNABLE and
 * REFUSED at egress. You cannot certify what you cannot read, and refusing is the
 * only honest response to a container whose contents are not enumerable.
 */
export interface EgressScan {
  /** Paths at which an internal-only score was found. */
  readonly found: readonly string[]
  /** Paths the scan could not exhaustively read. Refused, not waved through. */
  readonly unscannable: readonly string[]
}

const INTERNAL_KIND_SET: ReadonlySet<string> = new Set(INTERNAL_ONLY_SCALAR_KINDS)

function isPlainObject(v: object): boolean {
  const proto = Object.getPrototypeOf(v)
  return proto === Object.prototype || proto === null
}

/** Full scan: what was found, and what could not be read. Cycle-safe. */
export function scanForEgress(payload: unknown): EgressScan {
  const found: string[] = []
  const unscannable: string[] = []
  const seen = new WeakSet<object>()

  const walk = (node: unknown, path: string): void => {
    if (node === null) return
    const t = typeof node
    if (t === 'string' || t === 'number' || t === 'boolean' || t === 'undefined' || t === 'bigint' || t === 'symbol') return
    if (t === 'function') { unscannable.push(`${path || '<root>'} (function)`); return }
    if (t !== 'object') { unscannable.push(`${path || '<root>'} (${t})`); return }

    const obj = node as object
    if (seen.has(obj)) return
    seen.add(obj)

    if (Array.isArray(obj)) {
      obj.forEach((v, i) => walk(v, `${path}[${i}]`))
      return
    }
    if (!isPlainObject(obj)) {
      // Map, Set, Date, RegExp, class instance, Proxy target... contents are not
      // exhaustively enumerable, so the scan REFUSES rather than passing it.
      const ctor = (obj as { constructor?: { name?: string } }).constructor
      unscannable.push(`${path || '<root>'} (${ctor?.name ?? 'non-plain object'})`)
      return
    }

    const rec = obj as Record<string, unknown>
    if (typeof rec.kind === 'string' && INTERNAL_KIND_SET.has(rec.kind)) {
      found.push(path === '' ? `<root>:${rec.kind}` : `${path}:${rec.kind}`)
    }

    // Reflect.ownKeys covers NON-ENUMERABLE keys and SYMBOL keys, both of which
    // Object.entries silently skipped.
    for (const key of Reflect.ownKeys(obj)) {
      const label = typeof key === 'symbol' ? `Symbol(${key.description ?? ''})` : key
      const childPath = path === '' ? String(label) : `${path}.${String(label)}`

      const desc = Object.getOwnPropertyDescriptor(obj, key)
      if (desc && typeof desc.get === 'function') {
        // An accessor cannot be read without invoking it, and invoking it may have
        // side effects. REFUSE.
        unscannable.push(`${childPath} (accessor)`)
        continue
      }
      // A key NAMED like an internal-only score, in string or Symbol form.
      const nameForMatch = typeof key === 'symbol' ? (key.description ?? '') : key
      if (INTERNAL_KIND_SET.has(nameForMatch)) found.push(childPath)

      walk(desc ? desc.value : rec[key as string], childPath)
    }
  }

  walk(payload, '')
  return Object.freeze({ found: Object.freeze(found), unscannable: Object.freeze(unscannable) })
}

/** Backwards-compatible: the found-score paths only. Prefer `scanForEgress`,
 *  which also reports what could not be read. */
export function findInternalOnlyScores(payload: unknown): string[] {
  return [...scanForEgress(payload).found]
}

/**
 * C8, enforced FAIL-CLOSED. Throws if any internal-only score would reach an
 * external consumer, AND throws if any part of the payload could not be read.
 *
 * ⚠ AN HONEST LIMIT THAT REMAINS (PR19): this is a function a caller must
 * REMEMBER TO INVOKE. It is not wired to a route, a serializer hook, or a
 * type-level barrier, because Phase 1 has no route. A future endpoint that returns
 * a raw envelope instead of `sendExternally(...)` would bypass it entirely.
 * WIRING EVERY EGRESS PATH THROUGH THIS CHECK IS AN OBLIGATION ON THE TABLE/ROUTE
 * STEP, and is named in the Phase-1 report rather than left to be rediscovered.
 */
export function assertNoInternalScoreEgress(
  payload: unknown,
  destination: EgressDestination,
): void {
  if (destination.kind === 'internal_scope') return
  const scan = scanForEgress(payload)
  if (scan.found.length > 0) {
    throw new InternalScoreEgressError(scan.found[0], destination.label)
  }
  if (scan.unscannable.length > 0) {
    throw new InternalScoreEgressError(
      `${scan.unscannable[0]} — UNSCANNABLE container; egress refused because its ` +
        `contents cannot be exhaustively read`,
      destination.label,
    )
  }
}
