/**
 * loop-id-field.test.ts — the QG-C `loop_id` passthrough label (ruled
 * 2026-08-09; generation-step scope §2.7 + §2.11 dimension 6).
 *
 * Run via: npx tsx src/lib/substrate/__tests__/loop-id-field.test.ts
 *
 * Plain-assertion script (no Jest). EXIT 0 on all pass; EXIT 1 on any fail.
 *
 * WHAT THE RULING REQUIRES THIS BATTERY TO SHOW (§2.11 dimension 6, verbatim):
 * *"The additive `loop_id` field on `/api/reason` correctly implemented per the
 * B5 `session_marker` precedent — optional declared field, validated flag-on,
 * malformed → 400, ignored flag-off, byte-identical behaviour verified."*
 *
 * A NOTE ON THE PRECEDENT'S OWN COVERAGE (PR20 — stated because the build
 * prompt assumed otherwise): B5's route-level `session_marker` validation block
 * has NO battery anywhere in this repo. Its coverage is the pure detector
 * (`session-decline-signal.test.ts`) plus the store write-stamp; the 400 itself
 * was verified live against production. So this battery does NOT mirror a B5
 * route test — there is none. It follows the actual house pattern that
 * `r20a-audience-rendering` / `fresh` / `watching` all use: exhaustive
 * functional coverage of the pure module + the deriver/store it feeds, plus
 * source-grep INV pins over `route.ts` for the wiring a unit test cannot reach
 * (route.ts is a 2,200-line Next handler with no importable seam). That is
 * strictly more coverage than the precedent it mirrors.
 *
 * COVERAGE
 *   §1 FLAG semantics — case-strict, read at CALL TIME (never cached), which is
 *      what makes the "never inspected/validated flag-off" gate testable at
 *      all (PR19 re-run wording fold, 2026-08-09: a destructuring read of the
 *      property still occurs regardless of the flag; only INSPECTION is
 *      flag-gated — see loop-id-field.ts's docstring).
 *   §2 validateLoopId — every rejection path + the trim contract + the exact
 *      cap boundary (at-cap accepted, cap+1 rejected: a bound that rejected at
 *      the cap would be a silently different contract).
 *   §3 The deriver — loopId stamped VERBATIM as its own payload field; absent
 *      when not supplied; and the ruled composition: NEVER concatenated into
 *      the correlation identity, both independently visible on one event.
 *   §4 The store — the payload carrying loopId reaches the ledger row intact
 *      (KG7, JSONB object passed directly — no per-field extraction, which is
 *      why no schema migration is needed).
 *   §5 The emission hook — loopId is a pure passthrough: it does not gate,
 *      alter, or rescue any of the hook's refusal branches.
 *   §6 Source-grep INV pins over route.ts + the threading files — the flag is
 *      read at call time, the gate is `flag && field !== undefined` (never
 *      parse-then-discard), the 400 is `isBillable: false`, the value never
 *      enters the signed assessment, and NO new LLM call was introduced.
 *   §7 NON-VACUITY — the §6 pins are proven to genuinely discriminate (a
 *      deliberately wrong pattern must FAIL), per the standing guard lesson
 *      that a pin which cannot fail is not a pin.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import {
  isLoopIdFieldEnabled,
  validateLoopId,
  MAX_LOOP_ID_CHARS,
  LOOP_ID_FIELD_ENV_VAR,
} from '../loop-id-field'
import { deriveOrientationReadingEvent } from '../trust-core/derive-trust-events'
import { emitLedgerOnlyTrustEvents } from '../trust-core/trust-core-store'
import { emitOrientationReadingTrustEvent, computeOrientationCorrelationId } from '../trust-core/emission-hooks'
import { makeFakeSupabase } from '../trust-core/__tests__/fake-supabase'
import type { SignedLayer2Assessment } from '@/lib/translation-sandwich/layer2-signer'
import type { TrustEvent } from '../trust-core/types'

// ── hermetic env pin ─────────────────────────────────────────────────────────
const SAVED_ENV: Record<string, string | undefined> = {
  [LOOP_ID_FIELD_ENV_VAR]: process.env[LOOP_ID_FIELD_ENV_VAR],
  SUBSTRATE_TRUST_CORE_ENABLED: process.env.SUBSTRATE_TRUST_CORE_ENABLED,
  SUBSTRATE_ORIENTATION_READING_ENABLED: process.env.SUBSTRATE_ORIENTATION_READING_ENABLED,
  SUBSTRATE_AGENT_CIRCLES_ENABLED: process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
}
delete process.env.NEXT_PUBLIC_SUPABASE_URL
delete process.env.SUPABASE_SERVICE_ROLE_KEY
delete process.env[LOOP_ID_FIELD_ENV_VAR]
delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
delete process.env.SUBSTRATE_ORIENTATION_READING_ENABLED
delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

const NOW = new Date('2026-08-09T10:00:00.000Z')
const LOOP = 'sagereasoning:idea-loop@v1#001'

const fakeSigned = (signature = 'sig-abc'): SignedLayer2Assessment =>
  ({
    assessment: { katorthoma_proximity: 'deliberate', virtue_domains_engaged: ['phronesis'] },
    signature,
    key_id: 'substrate-layer2-2026Q2',
    signed_at: NOW.toISOString(),
    canonicalization: 'sage-canonical-json-v1',
    algorithm: 'ed25519',
  }) as unknown as SignedLayer2Assessment

const verifyOk = () => ({ valid: true, key_id: 'substrate-layer2-2026Q2' }) as const

const gObs = { observed: 'genuine_examination_markers' as const, evidence: 'weighed the impression' }

const ROUTE_PATH = join(process.cwd(), 'src/app/api/reason/route.ts')
const ROUTE_SRC = readFileSync(ROUTE_PATH, 'utf8')

async function main(): Promise<void> {
  // ==========================================================================
  // §1 flag semantics — case-strict, call-time
  // ==========================================================================
  {
    assert(isLoopIdFieldEnabled() === false, '§1.1 unset ⇒ false')
    process.env[LOOP_ID_FIELD_ENV_VAR] = 'true'
    assert(isLoopIdFieldEnabled() === true, '§1.2 exact "true" ⇒ true')
    process.env[LOOP_ID_FIELD_ENV_VAR] = 'false'
    assert(isLoopIdFieldEnabled() === false, '§1.3 "false" ⇒ false')
    process.env[LOOP_ID_FIELD_ENV_VAR] = '1'
    assert(isLoopIdFieldEnabled() === false, '§1.4 "1" ⇒ false (case-strict, no truthiness)')
    process.env[LOOP_ID_FIELD_ENV_VAR] = 'TRUE'
    assert(isLoopIdFieldEnabled() === false, '§1.5 "TRUE" ⇒ false (only literal lowercase)')
    process.env[LOOP_ID_FIELD_ENV_VAR] = ' true'
    assert(isLoopIdFieldEnabled() === false, '§1.6 " true" ⇒ false (no trimming of the flag itself)')
    delete process.env[LOOP_ID_FIELD_ENV_VAR]
    assert(isLoopIdFieldEnabled() === false, '§1.7 deleting mid-run flips it back — read at CALL time, never cached')
  }

  // ==========================================================================
  // §2 validateLoopId — the pure validator
  // ==========================================================================
  {
    // Accepts.
    const ok = validateLoopId(LOOP)
    assert(ok.ok === true && ok.value === LOOP, '§2.1 the ruled convention value is accepted verbatim')

    const trimmed = validateLoopId(`  ${LOOP}\n`)
    assert(trimmed.ok === true && trimmed.value === LOOP, '§2.2 surrounding whitespace is TRIMMED (one instance ⇒ one label)')

    const atCap = validateLoopId('x'.repeat(MAX_LOOP_ID_CHARS))
    assert(atCap.ok === true, '§2.3 exactly MAX_LOOP_ID_CHARS is accepted (boundary — inclusive)')

    // Rejects.
    const overCap = validateLoopId('x'.repeat(MAX_LOOP_ID_CHARS + 1))
    assert(overCap.ok === false, '§2.4 MAX_LOOP_ID_CHARS + 1 is rejected (boundary — the cap genuinely binds)')
    assert(overCap.ok === false && overCap.error.includes(String(MAX_LOOP_ID_CHARS)), '§2.5 the over-cap error names the bound')

    // Over-cap is measured AFTER trimming — an at-cap value padded with
    // whitespace must not be rejected for length it does not contribute.
    const paddedAtCap = validateLoopId('  ' + 'x'.repeat(MAX_LOOP_ID_CHARS) + '  ')
    assert(paddedAtCap.ok === true, '§2.6 the cap is measured on the TRIMMED value')

    assert(validateLoopId('').ok === false, '§2.7 empty string rejected')
    assert(validateLoopId('   ').ok === false, '§2.8 whitespace-only rejected (trims to empty)')
    assert(validateLoopId(42).ok === false, '§2.9 number rejected')
    assert(validateLoopId(true).ok === false, '§2.10 boolean rejected')
    assert(validateLoopId({ loopId: LOOP }).ok === false, '§2.11 object rejected')
    assert(validateLoopId([LOOP]).ok === false, '§2.12 array rejected')
    assert(validateLoopId(null).ok === false, '§2.13 null rejected by the validator (the route additionally treats null as absent)')
    assert(validateLoopId(undefined).ok === false, '§2.14 undefined rejected by the validator (the route gates on !== undefined first)')

    // The validator does NOT interpret the label's shape — enforcing the
    // {k1AgentId}#{instance} convention would be the server interpreting a
    // passthrough, which the ruling forbids.
    assert(validateLoopId('anything at all').ok === true, '§2.15 an unconventional label is ACCEPTED (passthrough — the server never interprets the shape)')

    // Purity: the validator reads no env (flag-gating is the caller's job).
    process.env[LOOP_ID_FIELD_ENV_VAR] = 'true'
    const flagOn = validateLoopId(LOOP)
    delete process.env[LOOP_ID_FIELD_ENV_VAR]
    const flagOff = validateLoopId(LOOP)
    assert(
      flagOn.ok === true && flagOff.ok === true && flagOn.ok && flagOff.ok && flagOn.value === flagOff.value,
      '§2.16 validator is PURE — identical result regardless of the flag (the gate lives at the route)',
    )
  }

  // ==========================================================================
  // §3 the deriver — the ruled composition
  // ==========================================================================
  {
    const withLoop = deriveOrientationReadingEvent({
      agentId: 'sagereasoning:loop-test@v1',
      ownerUserId: 'owner-1',
      credentialRef: 'api_key:k1',
      signedAssessment: fakeSigned(),
      observations: [gObs],
      engagedCircles: ['household'],
      now: NOW,
      correlationId: computeOrientationCorrelationId('sagereasoning:loop-test@v1', 'sig-abc'),
      elapsedMs: 1000,
      loopId: LOOP,
      verify: verifyOk,
    })
    assert(withLoop !== null && withLoop.payload.loopId === LOOP, '§3.1 loopId stamped VERBATIM on the payload')

    const withoutLoop = deriveOrientationReadingEvent({
      agentId: 'sagereasoning:loop-test@v1',
      ownerUserId: 'owner-1',
      credentialRef: 'api_key:k1',
      signedAssessment: fakeSigned(),
      observations: [gObs],
      engagedCircles: ['household'],
      now: NOW,
      correlationId: computeOrientationCorrelationId('sagereasoning:loop-test@v1', 'sig-abc'),
      elapsedMs: 1000,
      verify: verifyOk,
    })
    assert(withoutLoop !== null && !('loopId' in withoutLoop.payload), '§3.2 loopId ABSENT (not null, not "") when not supplied — byte-identical payload for every non-runner consult')

    // THE RULED COMPOSITION: "two identifiers on the same event as separate
    // fields, never concatenated, both independently visible."
    if (withLoop && withoutLoop) {
      assert(
        withLoop.correlationId === withoutLoop.correlationId,
        '§3.3 loopId is NOT an input to the correlation identity (same examination ⇒ same correlationId with or without a loop label)',
      )
      assert(
        typeof withLoop.correlationId === 'string' &&
          !withLoop.correlationId.includes(LOOP) &&
          !withLoop.correlationId.includes('#001'),
        '§3.4 the correlation identity does not contain the loop label — never concatenated into one token',
      )
      assert(
        typeof withLoop.payload.loopId === 'string' && typeof withLoop.correlationId === 'string' && withLoop.payload.loopId !== withLoop.correlationId,
        '§3.5 BOTH identities independently visible on one event, as distinct values',
      )
      assert(
        withLoop.artifactRef === withoutLoop.artifactRef && withLoop.eventType === withoutLoop.eventType && withLoop.virtueDomain === null,
        '§3.6 loopId changes NOTHING else about the event (no artifact/type/domain effect — a label, not a signal)',
      )
      // Everything else in the payload is identical: the label is purely additive.
      const strip = (p: Record<string, unknown>) => {
        const { loopId: _drop, ...rest } = p
        return JSON.stringify(rest)
      }
      assert(
        strip(withLoop.payload) === strip(withoutLoop.payload),
        '§3.7 the rest of the payload is byte-identical — loopId is purely additive',
      )
    }

    // A trimmed/odd label still lands verbatim as validated (the deriver never
    // re-validates or re-interprets — passthrough all the way down).
    const odd = deriveOrientationReadingEvent({
      agentId: 'a', ownerUserId: null, credentialRef: null,
      signedAssessment: fakeSigned(), observations: [gObs], engagedCircles: [],
      now: NOW, correlationId: 'orient:zzz', elapsedMs: 1000,
      loopId: 'not-the-convention', verify: verifyOk,
    })
    assert(odd !== null && odd.payload.loopId === 'not-the-convention', '§3.8 the deriver never re-interprets the label')
  }

  // ==========================================================================
  // §4 the store — the label reaches the ledger row (KG7)
  // ==========================================================================
  {
    const fake = makeFakeSupabase()
    const ev: TrustEvent = {
      agentId: 'sagereasoning:loop-test@v1',
      virtueDomain: null,
      eventType: 'orientation-reading-toward',
      artifactKind: 'signed_layer2_assessment',
      artifactRef: 'signed:k',
      payload: { orientationReading: 'toward', loopId: LOOP },
      occurredAt: NOW.toISOString(),
      correlationId: 'orient:loop-1',
    }
    const r = await emitLedgerOnlyTrustEvents([ev], fake.client)
    assert(r.ok, '§4.1 ledger insert lands with a loopId-carrying payload')
    const row = fake.tables.agent_trust_events[0] as { payload?: Record<string, unknown> } | undefined
    assert(row?.payload?.loopId === LOOP, '§4.2 the JSONB payload reaches the row with loopId intact — object passed directly (KG7), which is why NO schema migration is needed')
    assert(fake.tables.agent_trust_state.length === 0, '§4.3 still INSERT-ONLY — a loop label cannot seed trust state')
  }

  // ==========================================================================
  // §5 the emission hook — loopId is a passthrough, never a gate
  // ==========================================================================
  {
    const baseInput = {
      agentId: 'sagereasoning:loop-test@v1',
      credentialId: 'k1',
      ownerUserId: null,
      signedAssessment: fakeSigned(),
      observations: [gObs],
      engagedCircles: ['household'],
      layer1Source: 'server' as const,
      elapsedMs: 1000,
      loopId: LOOP,
    }
    const original = console.error
    let logged: string[] = []
    const capture = () => {
      logged = []
      console.error = (...args: unknown[]) => { logged.push(args.map(String).join(' ')) }
    }

    // Flags off ⇒ still a silent no-op. A supplied loopId must not "activate"
    // anything: the label is not a feature switch.
    capture()
    await emitOrientationReadingTrustEvent(baseInput)
    console.error = original
    assert(logged.length === 0, '§5.1 flags off + loopId supplied ⇒ still a silent no-op (a label never activates emission)')

    process.env.SUBSTRATE_TRUST_CORE_ENABLED = 'true'
    process.env.SUBSTRATE_ORIENTATION_READING_ENABLED = 'true'
    process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED = 'true'

    // A supplied extraction is STILL refused with a loopId present — the
    // gaming gate is not weakened by the new field.
    capture()
    await emitOrientationReadingTrustEvent({ ...baseInput, layer1Source: 'supplied' })
    console.error = original
    assert(logged.length === 0, '§5.2 supplied extraction + loopId ⇒ still refused before any DB touch (the gaming gate is untouched)')

    // Empty signature ⇒ still a no-op, and never a throw to the caller.
    capture()
    let threw = false
    try {
      await emitOrientationReadingTrustEvent({ ...baseInput, signedAssessment: { signature: '' } })
    } catch { threw = true }
    console.error = original
    assert(!threw && logged.length === 0, '§5.3 empty signature + loopId ⇒ no-op, never a throw (measure mode preserved)')

    delete process.env.SUBSTRATE_TRUST_CORE_ENABLED
    delete process.env.SUBSTRATE_ORIENTATION_READING_ENABLED
    delete process.env.SUBSTRATE_AGENT_CIRCLES_ENABLED
  }

  // ==========================================================================
  // §6 INV source-grep pins over route.ts (the wiring no unit test can reach)
  // ==========================================================================
  {
    assert(ROUTE_SRC.length > 0, '§6.0 route.ts read')
    assert(
      ROUTE_SRC.includes("from '@/lib/substrate/loop-id-field'"),
      '§6.1 route imports the loop-id-field module',
    )
    assert(
      ROUTE_SRC.includes('isLoopIdFieldEnabled()'),
      '§6.2 route CALLS the flag checker (call-time read, not a cached constant)',
    )
    assert(
      ROUTE_SRC.includes('validateLoopId(loop_id)'),
      '§6.3 route validates the raw field through the shared validator (no re-derived inline rules)',
    )
    // THE BYTE-IDENTITY PIN: the gate must be flag-first, so flag-off the
    // value is NEVER INSPECTED (the property is still bound by the
    // destructuring assignment above — see loop-id-field.ts's wording note —
    // but never subsequently read/validated/acted upon).
    assert(
      /if \(loopIdFieldEnabled && loop_id !== undefined && loop_id !== null\)/.test(ROUTE_SRC),
      '§6.4 the gate is `flag && field !== undefined && field !== null` — flag-off the value is NEVER INSPECTED (byte-identity)',
    )
    // The 400 must be pre-substrate/non-billable, exactly as session_marker's.
    const gateIdx = ROUTE_SRC.indexOf('const loopIdFieldEnabled')
    const gateBlock = ROUTE_SRC.slice(gateIdx, gateIdx + 900)
    assert(
      gateBlock.includes('status: 400') && gateBlock.includes('isBillable: false'),
      '§6.5 malformed ⇒ 400 with isBillable:false (pre-substrate — no LLM cost incurred), the session_marker error shape',
    )
    // The validation must precede the engine call, or a malformed value would
    // burn an LLM call before being rejected.
    const engineIdx = ROUTE_SRC.indexOf('runSandwich(')
    assert(
      gateIdx > 0 && engineIdx > 0 && gateIdx < engineIdx,
      '§6.6 the loop_id gate sits BEFORE the engine call — a 400 costs no LLM call',
    )
    // The label must reach ONLY the orientation emission — never the signed
    // assessment (it is an event-payload passthrough, not examined material).
    assert(
      /\.\.\.\(loopIdFieldEnabled && validatedLoopId !== undefined\s*\n?\s*\? \{ loopId: validatedLoopId \}/.test(ROUTE_SRC),
      '§6.7 the value is spread into the emission input under BOTH conditions (the B5 spread-conditional pattern)',
    )
    assert(
      (ROUTE_SRC.match(/validatedLoopId/g) ?? []).length === 4,
      '§6.8 validatedLoopId appears exactly 4× (declaration, assignment, and the emission spread\'s guard + value) — ONE consumer, no second read site',
    )
    const emitIdx = ROUTE_SRC.indexOf('emitOrientationReadingTrustEvent({')
    const spreadIdx = ROUTE_SRC.indexOf('{ loopId: validatedLoopId }')
    assert(
      emitIdx > 0 && spreadIdx > emitIdx,
      '§6.9 the ONLY consumer is the orientation emission call — the label never enters the signed assessment',
    )
    // No new LLM call was introduced by this build.
    assert(
      (ROUTE_SRC.match(/messages\.create\(/g) ?? []).length === 0,
      '§6.10 route.ts makes no direct Anthropic call, and this build added none',
    )
    // The threading files carry the typed field (not a silent index-signature
    // pass-through) — the ruling and the B5 precedent both require typed.
    const typesSrc = readFileSync(join(process.cwd(), 'src/lib/substrate/trust-core/types.ts'), 'utf8')
    assert(/^\s{2}loopId\?: string$/m.test(typesSrc), '§6.11 the payload type carries an EXPLICIT typed loopId?: string field')
    const deriveSrc = readFileSync(join(process.cwd(), 'src/lib/substrate/trust-core/derive-trust-events.ts'), 'utf8')
    assert(deriveSrc.includes('payload.loopId = input.loopId'), '§6.12 the deriver stamps the payload field')
    const hooksSrc = readFileSync(join(process.cwd(), 'src/lib/substrate/trust-core/emission-hooks.ts'), 'utf8')
    assert(hooksSrc.includes('loopId: input.loopId'), '§6.13 the emission hook threads it to the deriver')
    assert(
      !/computeOrientationCorrelationId\([^)]*loopId/.test(hooksSrc),
      '§6.14 loopId is NOT an input to the correlation identity — never concatenated (the ruled composition, pinned at the source)',
    )
  }

  // ==========================================================================
  // §7 NON-VACUITY — the §6 pins genuinely discriminate
  // ==========================================================================
  {
    // A pin that cannot fail is not a pin (the standing guard lesson). Each
    // check below applies the §6 pattern to a deliberately WRONG source string
    // and asserts it does NOT match.
    const parseThenDiscard = 'if (loop_id !== undefined && loopIdFieldEnabled) {'
    assert(
      !/if \(loopIdFieldEnabled && loop_id !== undefined && loop_id !== null\)/.test(parseThenDiscard),
      '§7.1 §6.4 rejects a field-first gate (the read-then-discard shape it exists to forbid)',
    )
    const concatenated = "computeOrientationCorrelationId(input.agentId + loopId, signed.signature)"
    assert(
      /computeOrientationCorrelationId\([^)]*loopId/.test(concatenated),
      '§7.2 §6.14 would genuinely FIRE on a concatenated correlation identity',
    )
    const untyped = '  [key: string]: unknown'
    assert(
      !/^\s{2}loopId\?: string$/m.test(untyped),
      '§7.3 §6.11 rejects a bare index signature (an explicit typed field is required)',
    )
  }

  // ── restore env ────────────────────────────────────────────────────────────
  for (const [k, v] of Object.entries(SAVED_ENV)) {
    if (v === undefined) delete process.env[k]
    else process.env[k] = v
  }

  console.log(`\nloop-id-field: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.error('\nFailures:\n' + failures.map((f) => '  - ' + f).join('\n'))
    process.exit(1)
  }
  process.exit(0)
}

void main()
