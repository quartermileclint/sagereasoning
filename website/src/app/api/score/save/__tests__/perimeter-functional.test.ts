/**
 * perimeter-functional.test.ts — the FUNCTIONAL R20a battery for
 * POST /api/score/save. Written BEFORE the route change, per the rebuild
 * prompt's §1e.
 *
 * ===========================================================================
 * WHY THIS FILE EXISTS — and why it is not another source-parsing test
 * ===========================================================================
 *
 * The 2026-08-31 PR19 review of the FIRST attempt at this change
 * (operations/agent-circles-2026-08/2026-08-31-PR19-review-register-score-save-
 * perimeter.md) proved TEN mutations — five of them CRITICAL — that left every
 * existing battery green while acute distress reached the database:
 *
 *   C1  `].filter(() => false))`      → empty subject, classifier never runs
 *   C2  move the block after .insert( → distress written, THEN screened
 *   C3  delete the `return`           → response built, discarded, falls through
 *   C4  `severity !== 'mild'` → `===` → acute and moderate PERSIST
 *   C5  `if (false && isR20a…())`     → whole block dead
 *
 * Every one of them survived because every route-side assertion in the
 * invocation guard is a PRESENCE-OF-TEXT GREP over comment-stripped source.
 * A grep proves an identifier appears. It proves nothing about ordering,
 * dataflow, or whether a verdict binds. That is the register's own standing
 * lesson, and this file is the structural answer to it: it EXECUTES the route.
 *
 * The test drives the real POST handler with a stubbed classifier and a stubbed
 * DB, and asserts on OUTCOMES — did an insert happen, what status came back,
 * what text actually reached the classifier. Each of C1-C5 fails it.
 *
 * ===========================================================================
 * MECHANISM — no production code was reshaped to make this testable
 * ===========================================================================
 *
 * This project's tsx targets CJS, so the module registry is writable: the
 * stubs are installed into `require.cache` BEFORE the route is required, and
 * the route then resolves the stubbed modules through its ordinary `@/lib/…`
 * imports. Nothing in the route is refactored for the test — deliberately, so
 * the thing under test is the thing that ships. (A handler.ts split would also
 * have worked and is the local idiom for injectable deps — see
 * api/cron/observability-retention-sweep — but it would have moved the
 * perimeter block out of the file both batteries read, so it was rejected.)
 *
 * `security` is spread-and-overridden rather than replaced: requireAuth and
 * checkRateLimit are stubbed, while validateTextLength / TEXT_LIMITS /
 * RATE_LIMITS stay REAL, so the route's own length validation is genuinely
 * exercised rather than mocked away.
 *
 * The classifier stub is severity-scripted AND records every subject it is
 * handed. That second property is what lets §3 assert, per field, that the
 * field's text actually reached the classifier — functional per-field coverage
 * of the mentor's ten-field ruling, not a grep for ten identifiers.
 *
 * Run: npx tsx src/app/api/score/save/__tests__/perimeter-functional.test.ts
 * (calls process.exit explicitly — importing security.ts installs a keepalive
 * interval that otherwise holds the process open; memory
 * `tsx-tests-setinterval-keepalive-hang`.)
 *
 * PR6 engaged: this is a safety-perimeter surface.
 */

import * as path from 'path'
import { SCORE_SAVE_PERSISTED_FIELD_CAP } from '../r20a'
import { DISTRESS_SUBJECT_FIELD_CAP } from '@/lib/r20a-gap-closure'
import { TEXT_LIMITS } from '@/lib/security'

const websiteRoot = path.resolve(__dirname, '../../../../../..')

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

// ---------------------------------------------------------------------------
// The ruled screened set (10) and the reasoned exclusions (3).
//
// Enumerated from the route's destructure against supabase-v3-migration.sql,
// per the ruling's "enumerate these from the route's actual schema, not from a
// criterion that the code does not enforce".
// ---------------------------------------------------------------------------

/** TEXT columns, practitioner-typed on the live client flow. */
const SCREENED_TEXT_PRACTITIONER = ['action', 'context', 'relationships', 'emotional_state'] as const

/** TEXT columns, engine-authored but CALLER-SUPPLIED at this boundary. */
const SCREENED_TEXT_ENGINE = [
  'philosophical_reflection',
  'improvement_path',
  'oikeiosis_context',
  'ruling_faculty_state',
] as const

/** JSONB columns — zero validation, no CHECK. composeDistressSubject skips
 *  non-strings, so these need a collector or they screen clean. */
const SCREENED_JSONB = ['false_judgements', 'passions_detected'] as const

/** Excluded: enum-CHECKed or boolean — prose cannot persist. */
const EXCLUDED_FIELDS = ['katorthoma_proximity', 'kathekon_quality', 'is_kathekon'] as const

const ALL_SCREENED = [...SCREENED_TEXT_PRACTITIONER, ...SCREENED_TEXT_ENGINE, ...SCREENED_JSONB]

/** Real acute trigger — matches DISTRESS_PATTERNS 'suicidal ideation'
 *  (src/lib/guardrails.ts:152). Used as the payload, but severity is driven by
 *  the stub, so the test never depends on regex behaviour it does not own. */
const ACUTE_TEXT = 'I want to kill myself and I have a plan'
const BENIGN_TEXT = 'I decided to refactor the billing module before the deadline'

// ---------------------------------------------------------------------------
// Stubs — installed into require.cache BEFORE the route is required.
// ---------------------------------------------------------------------------

type Severity = 'none' | 'mild' | 'moderate' | 'acute'

interface Spy {
  inserts: { table: string; row: Record<string, unknown> }[]
  subjects: string[]
  classifierCalls: number
  severity: Severity
  insertError: unknown
}

const spy: Spy = {
  inserts: [],
  subjects: [],
  classifierCalls: 0,
  severity: 'none',
  insertError: null,
}

function resetSpy(severity: Severity): void {
  spy.inserts = []
  spy.subjects = []
  spy.classifierCalls = 0
  spy.severity = severity
  spy.insertError = null
}

function stubModule(absPath: string, exports: Record<string, unknown>): void {
  const resolved = require.resolve(absPath)
  require.cache[resolved] = {
    id: resolved,
    filename: resolved,
    loaded: true,
    children: [],
    paths: [],
    exports,
  } as unknown as NodeModule
}

// ── supabase-server: the insert spy. Also the "no insert occurred" oracle. ──
const fakeAdmin = {
  from(table: string) {
    return {
      insert(row: Record<string, unknown>) {
        spy.inserts.push({ table, row })
        return {
          select() {
            return {
              single: async () => ({
                data: spy.insertError ? null : { id: 'stub-row-id' },
                error: spy.insertError,
              }),
            }
          },
        }
      },
    }
  },
}
stubModule(path.join(websiteRoot, 'src/lib/supabase-server.ts'), {
  supabaseAdmin: fakeAdmin,
  getAdminClient: () => fakeAdmin,
})

// ── r20a-classifier: severity-scripted, and records every subject. ──────────
// Spread the real module so any other export the chain needs stays real; only
// detectDistressTwoStage is replaced.
const realClassifierPath = require.resolve(path.join(websiteRoot, 'src/lib/r20a-classifier.ts'))
const realClassifier = require(realClassifierPath) as Record<string, unknown>
stubModule(path.join(websiteRoot, 'src/lib/r20a-classifier.ts'), {
  ...realClassifier,
  detectDistressTwoStage: async (text: string) => {
    spy.classifierCalls++
    spy.subjects.push(text)
    const severity = spy.severity
    return {
      distress_detected: severity !== 'none',
      severity,
      indicators_found: severity === 'none' ? [] : ['stubbed indicator'],
      redirect_message:
        severity === 'acute' || severity === 'moderate'
          ? 'STUB CRISIS MESSAGE — resources would appear here'
          : null,
    }
  },
})

// ── security: spread-and-override. validateTextLength/TEXT_LIMITS stay REAL. ─
const realSecurityPath = require.resolve(path.join(websiteRoot, 'src/lib/security.ts'))
const realSecurity = require(realSecurityPath) as Record<string, unknown>
stubModule(path.join(websiteRoot, 'src/lib/security.ts'), {
  ...realSecurity,
  checkRateLimit: () => null,
  requireAuth: async () => ({ user: { id: 'test-user-id', email: 'test@example.invalid' } }),
})

// ---------------------------------------------------------------------------
// Request helper + route import (AFTER the stubs).
// ---------------------------------------------------------------------------

function makeReq(body: unknown): unknown {
  return {
    headers: { get: () => null },
    json: async () => {
      if (body === '__INVALID_JSON__') throw new Error('invalid json')
      return body
    },
  }
}

function validBody(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    action: BENIGN_TEXT,
    katorthoma_proximity: 'deliberate',
    is_kathekon: true,
    kathekon_quality: 'moderate',
    ...overrides,
  }
}

/** The DEDICATED flag — deliberately NOT the shared gap-closure flag. See
 *  ../r20a.ts for why (dark-deploy discipline + a rollback lever that does not
 *  strip screening from 25 other routes). If this ever reverts to the shared
 *  flag, §6's flag-off identity case is the assertion that will notice. */
const FLAG = 'SUBSTRATE_SCORE_SAVE_R20A_ENABLED'

async function main(): Promise<void> {
  process.env[FLAG] = 'true'

  const routeMod = require(path.join(websiteRoot, 'src/app/api/score/save/route.ts')) as {
    POST: (req: unknown) => Promise<{ status: number; json: () => Promise<Record<string, unknown>> }>
  }
  const POST = routeMod.POST

  assert(typeof POST === 'function', 'HARNESS-1: the route exports a POST handler')

  // ── §0 POSITIVE CONTROL — the harness can observe an insert at all. ───────
  // Without this, every "no insert occurred" assertion below could be passing
  // because the spy is broken rather than because the route blocked. This is
  // the non-vacuity floor for the whole file.
  {
    resetSpy('none')
    const res = await POST(makeReq(validBody()))
    assert(res.status === 200, '§0-1: a benign save returns 200')
    assert(spy.inserts.length === 1, '§0-2: NON-VACUITY — the insert spy observes a real insert on the benign path')
    assert(
      spy.inserts[0]?.table === 'action_evaluations_v3',
      '§0-3: the insert targets action_evaluations_v3'
    )
    assert(
      spy.inserts[0]?.row?.user_id === 'test-user-id',
      '§0-4: user_id comes from the verified session, not the body'
    )
    assert(spy.classifierCalls === 1, '§0-5: the classifier ran exactly once on the benign path')
  }

  // ── §1 THE RULED PROPERTY — acute in ANY screened field blocks the insert ─
  // This is the mentor's ruling stated as an executable assertion, per field.
  // Kills C1, C2, C3, C4, C5 — each of which lets at least one of these
  // through while every grep-based battery stays green.
  for (const field of ALL_SCREENED) {
    resetSpy('acute')
    const isJsonb = (SCREENED_JSONB as readonly string[]).includes(field)
    // JSONB fields carry arrays in production; place the distress inside the
    // array, which is the shape the collector must reach into.
    const value = isJsonb
      ? field === 'passions_detected'
        ? [{ id: 'p1', name: ACUTE_TEXT, root_passion: 'lupe' }]
        : [ACUTE_TEXT]
      : ACUTE_TEXT
    const res = await POST(makeReq(validBody({ [field]: value })))
    const body = await res.json()

    assert(
      spy.inserts.length === 0,
      `§1-${field}-a: acute distress in '${field}' — NO INSERT occurs (the ruled property)`
    )
    assert(
      res.status !== 200,
      `§1-${field}-b: acute distress in '${field}' — the response is NOT 200 (the ruled response requirement)`
    )
    assert(
      body.distress_detected === true,
      `§1-${field}-c: acute distress in '${field}' — the body carries distress_detected: true`
    )
    assert(
      typeof body.redirect_message === 'string' && body.redirect_message.length > 0,
      `§1-${field}-d: acute distress in '${field}' — crisis resources are returned to the practitioner`
    )
    assert(
      spy.subjects.some((s) => s.includes(ACUTE_TEXT)),
      `§1-${field}-e: '${field}' actually REACHED the classifier (per-field composition coverage)`
    )
  }

  // ── §2 ORDERING — the check precedes the DB call even for an INVALID body ─
  // The perimeter must run BEFORE field validation, so distress in an
  // otherwise-rejectable body still catches. Directly kills C2.
  {
    resetSpy('acute')
    // No katorthoma_proximity, no is_kathekon → would 400 on validation.
    const res = await POST(makeReq({ action: ACUTE_TEXT }))
    const body = await res.json()
    assert(spy.inserts.length === 0, '§2-1: no insert on an acute + invalid body')
    assert(
      body.distress_detected === true,
      '§2-2: the perimeter fires BEFORE field validation — distress in an otherwise-invalid body still catches'
    )
  }

  // ── §3 MODERATE behaves as acute; MILD proceeds and folds support. ────────
  {
    resetSpy('moderate')
    const res = await POST(makeReq(validBody({ emotional_state: ACUTE_TEXT })))
    const body = await res.json()
    assert(spy.inserts.length === 0, '§3-1: MODERATE also blocks the insert (kills the `=== mild` inversion, C4)')
    assert(res.status !== 200, '§3-2: MODERATE returns a non-200')
    assert(body.distress_detected === true, '§3-3: MODERATE carries distress_detected')
  }
  {
    resetSpy('mild')
    const res = await POST(makeReq(validBody({ emotional_state: 'life is meaningless' })))
    const body = await res.json()
    assert(res.status === 200, '§4-1: MILD proceeds — the evaluation is still saved')
    assert(spy.inserts.length === 1, '§4-2: MILD writes the row (mild is not a block)')
    assert(
      body.support_resources !== undefined &&
        typeof (body.support_resources as { message?: unknown })?.message === 'string',
      '§4-3: MILD folds support_resources onto the success response'
    )
  }

  // ── §5 THE EXCLUSIONS are genuinely excluded, and say so by behaviour. ────
  // Documents the reasoned exclusion functionally: content in an enum-CHECKed
  // field is not composed into the subject. If a future maintainer screens
  // them, this fails LOUDLY and the exclusion reasoning gets revisited.
  for (const field of EXCLUDED_FIELDS) {
    resetSpy('none')
    await POST(makeReq(validBody({ [field]: field === 'is_kathekon' ? true : 'deliberate' })))
    assert(
      !spy.subjects.some((s) => s.includes('deliberate')),
      `§5-${field}: '${field}' is NOT composed into the distress subject (the reasoned exclusion, asserted by behaviour)`
    )
  }

  // ── §6 FLAG-OFF IDENTITY — unset means byte-identical prior behaviour. ────
  // Kills C5's inverse: proves the flag genuinely gates, and proves flag-off
  // does not silently screen (or silently bill a classifier call).
  {
    delete process.env[FLAG]
    resetSpy('acute')
    const res = await POST(makeReq(validBody({ emotional_state: ACUTE_TEXT })))
    assert(res.status === 200, '§6-1: flag OFF — acute distress saves exactly as before the change')
    assert(spy.inserts.length === 1, '§6-2: flag OFF — the insert still happens (no behaviour change)')
    assert(spy.classifierCalls === 0, '§6-3: flag OFF — the classifier is NEVER called (no billed call)')
    process.env[FLAG] = 'true'
  }

  // ── §7 EMPTY-SUBJECT GATE — no billed classifier call on nothing. ─────────
  {
    resetSpy('none')
    // Every screenable field absent/blank; only the excluded enum fields present.
    await POST(makeReq({ katorthoma_proximity: 'deliberate', is_kathekon: true }))
    assert(
      spy.classifierCalls === 0,
      '§7-1: an empty composed subject skips the classifier (hasScreenableSubject gate — no billed call)'
    )
  }

  // ── §8 NON-STRING SMUGGLING — the register's M5 case. ────────────────────
  // `emotional_state: {note: "…"}` composed away, screened clean and reached
  // the insert in the reverted implementation. A nested object is not a
  // legitimate shape for these TEXT columns, so the requirement is only that
  // it cannot both evade screening AND persist.
  {
    resetSpy('acute')
    const res = await POST(makeReq(validBody({ emotional_state: { note: ACUTE_TEXT } })))
    assert(
      spy.inserts.length === 0,
      '§8-1: M5 — a non-string carrying distress cannot both evade screening and reach the insert'
    )
    void res
  }

  // ── §8-2 M5, ISOLATED FROM THE STUB. PR19 (2026-08-31, verify phase) proved
  // §8-1 vacuous: the classifier stub returns 'acute' unconditionally under
  // resetSpy('acute'), so §8-1 passes whether the TYPE-CHECK LOOP rejects the
  // non-string or the severity-scripted stub blocks it regardless of content
  // — deleting the type-check loop entirely left the suite green. This is the
  // exact class of the §5-6/§15 vacuous-pin lesson, recurring in a place I had
  // not looked. Isolated with severity 'none': acceptance is possible, so a
  // 400 here can only come from the type check actually running.
  {
    resetSpy('none')
    const res2 = await POST(makeReq(validBody({ emotional_state: { note: 'benign nested object' } })))
    assert(
      res2.status === 400,
      '§8-2: M5 ISOLATED — a non-string emotional_state is rejected by the TYPE-CHECK LOOP itself, independent of what the classifier stub returns'
    )
    assert(spy.inserts.length === 0, '§8-2b: and nothing persists')
  }

  // ── §9 SCREENED WINDOW >= PERSISTED WINDOW — the register's H3. ───────────
  // A field longer than the screening cap must not persist unscreened: either
  // it is rejected, or the whole of it is screened. Proven by outcome, not by
  // reading a constant.
  {
    resetSpy('none')
    const oversized = 'x'.repeat(6339) // the register's own reproduction length
    const res = await POST(makeReq(validBody({ action: oversized })))
    if (res.status === 200) {
      const screened = spy.subjects.join('')
      assert(
        screened.includes(oversized),
        '§9-1: H3 — if an oversized field PERSISTS, the whole of it was screened (screened window >= persisted window)'
      )
    } else {
      assert(
        spy.inserts.length === 0,
        '§9-1: H3 — an oversized field is rejected rather than persisted unscreened'
      )
    }
  }

  // ── §10 ARITY STARVATION — the hazard unique to this route. ──────────────
  // Ten sources share DISTRESS_SUBJECT_MAX_FIELDS (20), and two of them are
  // JSONB of caller-controlled arity. If the collector returned an ARRAY, a
  // large passions_detected would consume the whole budget and push `action`
  // and `emotional_state` out of the subject — screening them against nothing,
  // input-inducible, and invisible to every source-parsing battery. The
  // collector flattens each JSONB source to ONE value to prevent exactly this.
  {
    resetSpy('acute')
    const manyPassions = Array.from({ length: 30 }, (_, i) => ({
      id: `p${i}`,
      name: `passion ${i}`,
      root_passion: 'lupe',
    }))
    const res = await POST(
      makeReq(validBody({ action: ACUTE_TEXT, passions_detected: manyPassions }))
    )
    assert(
      spy.subjects.some((s) => s.includes(ACUTE_TEXT)),
      '§10-1: a 30-element passions_detected does NOT push `action` out of the composed subject (arity starvation)'
    )
    assert(spy.inserts.length === 0, '§10-2: starvation case still blocks the insert')
    assert(res.status !== 200, '§10-3: starvation case still returns a non-200')
  }

  // ── §11 OBJECT KEYS CARRY PROSE — and persist verbatim in JSONB. ─────────
  // `{"I want to kill myself": true}` is a legal body. A walker that reads only
  // values would screen it clean while the key persists in full.
  {
    resetSpy('acute')
    await POST(makeReq(validBody({ false_judgements: { [ACUTE_TEXT]: true } })))
    assert(
      spy.subjects.some((s) => s.includes(ACUTE_TEXT)),
      '§11-1: a JSONB OBJECT KEY carrying distress reaches the classifier'
    )
    assert(spy.inserts.length === 0, '§11-2: distress in a JSONB key blocks the insert')
  }

  // ── §12 DEEP NESTING — shape-agnostic, not shape-anticipating. ───────────
  {
    resetSpy('acute')
    await POST(
      makeReq(validBody({ false_judgements: [{ a: { b: [{ c: ACUTE_TEXT }] } }] }))
    )
    assert(
      spy.subjects.some((s) => s.includes(ACUTE_TEXT)),
      '§12-1: distress nested four levels deep in JSONB still reaches the classifier'
    )
    assert(spy.inserts.length === 0, '§12-2: deeply-nested distress blocks the insert')
  }

  // ── §13 THE COLLECTOR NEVER THROWS on hostile input. ─────────────────────
  // It runs BEFORE the route's own 400s, so it receives raw wire values.
  // A throw here would 500 the route and lose the perimeter entirely.
  {
    const hostile: Record<string, unknown> = { action: BENIGN_TEXT, katorthoma_proximity: 'deliberate', is_kathekon: true }
    const cyclic: Record<string, unknown> = {}
    cyclic.self = cyclic
    hostile.false_judgements = cyclic
    resetSpy('none')
    let threw = false
    try {
      await POST(makeReq(hostile))
    } catch {
      threw = true
    }
    assert(!threw, '§13-1: a self-referential JSONB value does not throw out of the route')
  }

  // ── §14 SEPARATOR-INFLATION BYPASS — a real defect, found and fixed. ─────
  // The collector joins with a 7-character separator. An earlier version bounded
  // the JSONB field on its SERIALIZED length and argued that made
  // screened >= persisted hold. It did not: the separators are our own addition
  // and are absent from the serialized form, so a caller could pad an array
  // until the collected string crossed the 5,000-char screening cap while the
  // serialized form stayed far under the persistence check — putting distress
  // past the truncation boundary. Reproduced concretely before the fix:
  //   700 x "a" + an acute phrase -> serialized 2,843 (persisted)
  //                               -> collected  5,639 (truncated at 5,000)
  //                               -> the acute phrase was NEVER screened.
  // The bound now binds on the COLLECTED length, so the outcome must be either
  // "screened in full" or "refused" — never "persisted unscreened".
  //
  // ⚠ HONEST LIMIT ON THIS SECTION, stated so it is not mistaken for the proof.
  // §14 runs with severity scripted to 'acute', and the stub returns 'acute'
  // regardless of what text it was handed — so a refusal here can come from the
  // distress arm even when the classifier never saw the distress. §14 therefore
  // proves only that the padded payload cannot PERSIST. The section that
  // actually isolates the invariant is §15, which scripts 'none' so acceptance
  // is possible and then checks whether the prose reached the classifier at all.
  // Verified: reverting the bound to serialized length leaves §14 GREEN and
  // fails §15. Do not delete §15 believing §14 covers it.
  {
    resetSpy('acute')
    const padded = [...Array.from({ length: 700 }, () => 'a'), ACUTE_TEXT]
    const res = await POST(makeReq(validBody({ false_judgements: padded })))
    const screened = spy.subjects.join('')
    const reachedClassifier = screened.includes(ACUTE_TEXT)
    assert(
      spy.inserts.length === 0,
      '§14-1: separator-inflation padding cannot persist a record — either the distress is screened and blocks, or the write is refused'
    )
    assert(
      reachedClassifier || res.status !== 200,
      '§14-2: distress behind separator padding is either SEEN by the classifier or the request is REFUSED — never silently persisted'
    )
  }

  // ── §15 THE INVARIANT ITSELF — stated as a property, over many shapes. ───
  // Everything above tests instances. This tests the rule: for any JSONB value
  // the route ACCEPTS, the classifier must have seen all of the prose that
  // value carries.
  {
    let violations = 0
    for (const n of [1, 5, 50, 300, 700, 1200]) {
      resetSpy('none')
      const marker = `ZZMARKER${n}ZZ`
      const value = [...Array.from({ length: n }, () => 'a'), marker]
      const res = await POST(makeReq(validBody({ false_judgements: value })))
      if (res.status === 200) {
        // Accepted => it persisted => every part must have been screened.
        if (!spy.subjects.join('').includes(marker)) violations++
      }
    }
    assert(
      violations === 0,
      `§15-1: INVARIANT — for every accepted JSONB value, all of its prose reached the classifier (${violations} violation(s))`
    )
  }

  // ── §16 DEPTH BYPASS — found by PR19 review, not by the author. ──────────
  // The collector originally returned silently at depth > 6, so a string nested
  // seven levels deep was never read, never screened, and PERSISTED. A caller
  // controls the nesting entirely, so this was a general bypass of the whole
  // JSONB half of the ruling.
  //
  // The fix is the same discipline as the length bound: a walk that stopped
  // early has NOT seen everything that would persist, so "we could not read all
  // of it" resolves to REFUSE, never to save. Raising the depth number alone
  // would not have been a fix — it would only have moved the boundary.
  {
    const deep = (n: number, leaf: string): unknown => {
      let v: unknown = leaf
      for (let i = 0; i < n; i++) v = { a: v }
      return v
    }
    for (const depth of [3, 7, 20, 40, 200]) {
      resetSpy('none') // 'none' so acceptance is POSSIBLE — see §15's reasoning
      const marker = `DEEPMARK${depth}MARK`
      const res = await POST(makeReq(validBody({ false_judgements: deep(depth, marker) })))
      if (res.status === 200) {
        assert(
          spy.subjects.join('').includes(marker),
          `§16-${depth}: prose nested ${depth} deep was ACCEPTED, so it must have been screened`
        )
      } else {
        assert(
          spy.inserts.length === 0,
          `§16-${depth}: prose nested ${depth} deep was refused, and nothing persisted`
        )
      }
    }
  }

  // ── §17 FLAG-OFF IDENTITY, TESTED PROPERLY. ─────────────────────────────
  // PR19 found the previous claim FALSE and mis-cited. §6 tests flag-gating on
  // ONE short valid body and never compares against pre-rebuild behaviour, yet
  // r20a.ts cited it as the assertion backing "flag-off is byte-identical".
  // The reviewer ran BEFORE-route.ts and the shipped route side by side and
  // found 11 of 13 bodies differing, 9 of them turning an accepted, persisted
  // save into a 400 — because the new bounds ran unconditionally.
  //
  // The bounds are now gated, so the property is real. This section tests it as
  // a property over the exact body shapes that used to diverge: with the flag
  // OFF, every one of them must persist, because the pre-rebuild route bounded
  // none of them.
  {
    const previouslyAccepted: [string, Record<string, unknown>][] = [
      ['emotional_state 6000 chars', { emotional_state: 'e'.repeat(6000) }],
      ['relationships 6000 chars', { relationships: 'r'.repeat(6000) }],
      ['context 6000 chars', { context: 'c'.repeat(6000) }],
      ['philosophical_reflection 20000 chars', { philosophical_reflection: 'p'.repeat(20000) }],
      ['improvement_path 20000 chars', { improvement_path: 'i'.repeat(20000) }],
      ['oikeiosis_context 20000 chars', { oikeiosis_context: 'o'.repeat(20000) }],
      ['ruling_faculty_state 20000 chars', { ruling_faculty_state: 'x'.repeat(20000) }],
      ['non-string emotional_state', { emotional_state: { note: 'structured' } }],
      ['huge false_judgements', { false_judgements: Array.from({ length: 900 }, () => 'j') }],
      ['deeply nested false_judgements', { false_judgements: { a: { a: { a: { a: { a: { a: { a: { a: 'deep' } } } } } } } } }],
      ['non-enum kathekon_quality', { kathekon_quality: 'not-an-enum-value' }],
    ]
    delete process.env[FLAG]
    let divergences = 0
    for (const [label, overrides] of previouslyAccepted) {
      resetSpy('none')
      const res = await POST(makeReq(validBody(overrides)))
      const persisted = spy.inserts.length === 1 && res.status === 200
      if (!persisted) {
        divergences++
        console.error(`  flag-off divergence: ${label} -> status ${res.status}, inserts ${spy.inserts.length}`)
      }
      assert(
        spy.classifierCalls === 0,
        `§17-${label}: flag OFF — no classifier call (no billed request, no added latency)`
      )
    }
    assert(
      divergences === 0,
      `§17-identity: flag OFF — every body the PRE-REBUILD route accepted still persists (${divergences} divergence(s)). ` +
        `This is the claim r20a.ts makes; a divergence here means the deploy is not the no-op the activation runbook promises.`
    )

    // And the engine fields must persist UNTRUNCATED flag-off, since the
    // pre-rebuild route stored them whole.
    resetSpy('none')
    const long = 'z'.repeat(20000)
    await POST(makeReq(validBody({ philosophical_reflection: long })))
    assert(
      spy.inserts[0]?.row?.philosophical_reflection === long,
      '§17-truncation: flag OFF — engine fields are stored WHOLE, exactly as before the rebuild'
    )
    process.env[FLAG] = 'true'
  }

  // ── §18 THE H3 COUPLING — pinned from both ends. ─────────────────────────
  // PR19 (two dimensions independently): the whole screened >= persisted
  // property rests on SCORE_SAVE_PERSISTED_FIELD_CAP equalling the screening
  // window, and nothing pinned that. Mutating TEXT_LIMITS.medium to 8000, or
  // making boundEngineField a no-op, reopened register H3 with every battery
  // green. Both are now pinned — the second behaviourally, which is what a
  // constant-equality check alone would still miss.
  {
    // THREE constants in THREE modules must all stay <= the screening window,
    // and they are equal today only by coincidence of authorship. PR19 proved
    // the third leg with a one-token edit: TEXT_LIMITS.medium 5000 -> 8000 let
    // a 5,500-character emotional_state persist while only its first 5,000
    // characters were ever screened — every battery green.
    //
    // My first version of this pin compared only the first two and MISSED that
    // mutation. Caught by mutation-testing my own pin, which is the only reason
    // it is here.
    assert(
      SCORE_SAVE_PERSISTED_FIELD_CAP <= DISTRESS_SUBJECT_FIELD_CAP,
      `§18-1a: the persisted cap (${SCORE_SAVE_PERSISTED_FIELD_CAP}) is within the screening window (${DISTRESS_SUBJECT_FIELD_CAP})`
    )
    assert(
      TEXT_LIMITS.medium <= DISTRESS_SUBJECT_FIELD_CAP,
      `§18-1b: TEXT_LIMITS.medium (${TEXT_LIMITS.medium}) — the bound on context/relationships/` +
        `emotional_state — is within the screening window (${DISTRESS_SUBJECT_FIELD_CAP}). If it ever ` +
        `exceeds it, a practitioner's own words persist beyond what the classifier ever saw.`
    )
    assert(
      TEXT_LIMITS.short <= DISTRESS_SUBJECT_FIELD_CAP,
      `§18-1c: TEXT_LIMITS.short (${TEXT_LIMITS.short}) — the bound on action — is within the screening window`
    )

    // The behavioural half: the constants could be re-plumbed without moving
    // these names, so assert the PROPERTY on a practitioner-typed field too.
    for (const field of ['emotional_state', 'relationships', 'context'] as const) {
      resetSpy('none')
      const marker = `OVERCAP${field}MARK`
      const oversized = 'y'.repeat(DISTRESS_SUBJECT_FIELD_CAP + 500) + marker
      const r = await POST(makeReq(validBody({ [field]: oversized })))
      if (r.status === 200) {
        assert(
          spy.subjects.join('').includes(marker),
          `§18-3-${field}: flag ON — an over-window '${field}' was ACCEPTED, so all of it must have been screened`
        )
      } else {
        assert(
          spy.inserts.length === 0,
          `§18-3-${field}: flag ON — an over-window '${field}' is refused rather than persisted unscreened`
        )
      }
    }
    resetSpy('none')
    const over = 'q'.repeat(SCORE_SAVE_PERSISTED_FIELD_CAP + 1200)
    const res = await POST(makeReq(validBody({ philosophical_reflection: over })))
    if (res.status === 200) {
      const stored = spy.inserts[0]?.row?.philosophical_reflection
      assert(
        typeof stored === 'string' && stored.length <= SCORE_SAVE_PERSISTED_FIELD_CAP,
        '§18-2: flag ON — an over-cap engine field is never PERSISTED beyond the screening window (boundEngineField is load-bearing, not decorative)'
      )
    } else {
      assert(spy.inserts.length === 0, '§18-2: flag ON — an over-cap engine field is refused rather than persisted unscreened')
    }
  }

  console.log('\n' + passed + ' passed, ' + failed + ' failed')
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log('  - ' + f)
  }
  process.exit(failed === 0 ? 0 : 1)
}

void main()
