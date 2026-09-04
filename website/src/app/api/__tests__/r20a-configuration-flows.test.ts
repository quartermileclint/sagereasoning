/**
 * r20a-configuration-flows.test.ts — Option A build arc, Session 5 (2026-05-30).
 *
 * CONFIGURATION-LEVEL R20a invocation tests (AC4 extended from per-route to
 * per-configuration-flow). Run via:
 *
 *   npx tsx src/app/api/__tests__/r20a-configuration-flows.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors the S2/S3/S4
 * r20a-invocation.test.ts + r20a-audience-rendering.test.ts per PR15 (reuse the
 * pattern). EXIT 0 on all pass; EXIT 1 on any fail. No LLM call (tsx exercising
 * existing code + source-greps over the route files). No Supabase env needed
 * (imports only the pure builders + helpers, exactly as the S4 test does).
 *
 * WHAT THIS SESSION PROVES (per design spec §4.4 halt + §4.5 idempotency +
 * §5.5 Session-D scope), per configuration flow:
 *   - Catch: distress at the entry point is caught at the substrate boundary
 *     (A7's enforceLayer2R20aGate, flag-gated per surface).
 *   - Halt: the catch's emitted SafetySignal carries flow_terminated:true,
 *     cause:'distress', caught_at:'substrate_layer2'.
 *   - Idempotency / single-emission: where a wired downstream consumer exists
 *     (Reflect's Zone-3 precedence), an upstream flow-terminating signal causes
 *     the downstream stage to skip its own catch — exactly one emission per flow.
 *   - Audience-correct: the terminal stage renders via the S4 render helper
 *     (R20A_DEVELOPER_NOTE_DEFAULT; agent-developer wire shape).
 *   - No double-reporting across the configuration's seams.
 *
 * PROPAGATION-REALITY FINDING (Pre-condition 3, Diagnostic-certain — S5 open
 * 2026-05-30, by code-read): NO end-to-end cross-surface forwarding exists
 * today. The Calling -> Reasoning hand-off envelope (DiscoveredPurpose) has no
 * safety_signal slot; /api/reason neither consumes nor emits a `safety_signal`
 * carrier; each surface emits the carrier only on its OWN outward response
 * shape. Therefore S5 tests are PROPAGATION-SHAPED per-stage (assert the shape
 * produced at each catch boundary + the only wired consumer's skip behaviour),
 * NOT a single end-to-end test exercising a forwarding mechanism that does not
 * exist. The FL-BOUNDARY group below pins that finding as executable assertions
 * — it documents why surfaces without a wired catch need no propagation test
 * today. End-to-end forwarding is a future K-category migration session.
 *
 * FLOW SET (founder election, S5 2026-05-30 — "any configuration that needs
 * it"): the three surfaces with R20a catches actually wired — FL-REASON
 * (/api/reason), FL-CALLING (/api/calling), FL-REFLECT (/api/practice/reflect)
 * — plus FL-BOUNDARY documenting the propagation-reality finding. The broader
 * candidate set (mentor/private/reflect, Sage Assent, plugin wrappers) has no
 * catch wired and therefore no propagation to exercise today.
 *
 * SCOPE DISCIPLINE: additive test only. No safety code, route handler, or
 * builder is modified. AC5 perimeter unchanged (membership is the registry in
 * r20a-invocation-guard.test.ts; no count is written here). PR6 NOT engaged
 * (no safety-function change). Rollback = git rm.
 *
 * Rules served: R20a (vulnerable user detection); R19c (formalised wording);
 * AC4 (invocation testing — per-flow extension); AC5 (perimeter unchanged);
 * AC8 (translation-sandwich boundary); PR1 (single-endpoint proofs S2/S3/S4
 * are the seed; this ratifies the configuration perimeter); PR3 (synchronous
 * safety); PR15 (reuses A7 + canonical SafetySignal + S4 render helper + the
 * existing builders — no primitive rebuilt).
 */

import * as fs from 'fs'
import * as path from 'path'

// Canonical cross-seam carrier (substrate-emitted).
import type { SafetySignal } from '@/lib/substrate/r20a-gate'

// S4 audience-render helper + the formalised prose-mode key.
import {
  renderR20aRedirectResponse,
  R20A_DEVELOPER_NOTE_DEFAULT,
  type R20aAgentDeveloperRedirectPayload,
  type R20aHumanUserRedirectPayload,
} from '@/lib/substrate/r20a-audience-renderer'

// Calling surface builders (pure).
import {
  buildCallingDistressRedirectResponse,
  buildQuestionResponse as buildCallingQuestionResponse,
} from '@/app/api/calling/response-builders'

// Reflect surface builders (pure).
import {
  buildReflectDistressRedirectResponse,
  buildQuestionResponse as buildReflectQuestionResponse,
  buildZone3Response,
} from '@/app/api/practice/reflect/response-builders'

// Reflect's existing developer-declared-harm boundary (the only wired
// downstream consumer that skips on an upstream flow-terminating signal).
// NB: zone3-boundary exports its OWN SafetySignal ({ harm_flagged }) — distinct
// from the canonical carrier above. Aliased to avoid the name collision.
import {
  checkZone3Boundary,
  ZONE3_DEVELOPER_NOTE,
  type SafetySignal as Zone3SafetySignal,
} from '@/lib/sage-reflect/zone3-boundary'

// ============================================================================
// TEST HARNESS (identical to the S2/S3/S4 pattern)
// ============================================================================

let passCount = 0
let failCount = 0

function pass(name: string): void {
  console.log(`PASS — ${name}`)
  passCount++
}

function fail(name: string, message: string): void {
  console.log(`FAIL — ${name}: ${message}`)
  failCount++
}

function expectEq<T>(name: string, actual: T, expected: T): void {
  if (actual === expected) {
    pass(name)
  } else {
    fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
  }
}

function expectTrue(name: string, condition: boolean, hint?: string): void {
  if (condition) {
    pass(name)
  } else {
    fail(name, hint ?? 'condition was false')
  }
}

// ============================================================================
// SOURCE LOADING — for the INV-* source-grep assertions
// ============================================================================

const API_DIR = path.resolve(__dirname, '..') // src/app/api
const SRC_DIR = path.resolve(__dirname, '..', '..', '..') // src

const REASON_ROUTE = path.resolve(API_DIR, 'reason', 'route.ts')
const CALLING_ROUTE = path.resolve(API_DIR, 'calling', 'route.ts')
const REFLECT_ROUTE = path.resolve(API_DIR, 'practice', 'reflect', 'route.ts')
const LAYER1_EXTRACTOR = path.resolve(SRC_DIR, 'lib', 'translation-sandwich', 'layer1-extractor.ts')
const CALLING_SERVICE = path.resolve(SRC_DIR, 'lib', 'sage-calling', 'calling-service.ts')
const CALLING_BUILDERS = path.resolve(API_DIR, 'calling', 'response-builders.ts')
const REFLECT_BUILDERS = path.resolve(API_DIR, 'practice', 'reflect', 'response-builders.ts')

function readSource(p: string): string {
  return fs.readFileSync(p, 'utf-8')
}

/** Strip import lines AND comment-only lines so a grep finds real call sites,
 *  not prose mentions in the leading documentation blocks. */
function codeOnly(source: string): string {
  return source
    .split('\n')
    .filter((line) => {
      const t = line.trim()
      if (t.startsWith('import ')) return false
      if (t.startsWith('//')) return false
      if (t.startsWith('*')) return false
      if (t.startsWith('/*')) return false
      return true
    })
    .join('\n')
}

// Shared fixtures.
const REDIRECT_MESSAGE =
  'Before we continue, we want to make sure you are okay. Some of what you have described sounds heavy.'

const acuteCarrier: SafetySignal = {
  flow_terminated: true,
  cause: 'distress',
  severity: 'acute',
  caught_at: 'substrate_layer2',
}

const mildCarrier: SafetySignal = {
  flow_terminated: false,
  cause: 'distress',
  severity: 'mild',
  caught_at: 'substrate_layer2',
}

// ============================================================================
// FL-REASON — the /api/reason configuration flow
//
// Entry: input text -> A7 substrate gate (reused gate, zero added latency).
// Terminal: the route's two redirect branches render via the S4 helper, with
// audience derived from auth.user?.id. Catch + halt + audience-correct proven
// per-surface in S4; FL-REASON confirms it from the configuration vantage point
// + pins the propagation-reality boundary for this surface.
// ============================================================================

function runReasonFlow(): void {
  expectTrue('FL-REASON-1 /api/reason/route.ts exists', fs.existsSync(REASON_ROUTE))

  const source = readSource(REASON_ROUTE)
  const body = codeOnly(source)

  // Invocation — the catch's terminal render is wired in the execution path.
  expectTrue(
    'FL-REASON-2 route imports renderR20aRedirectResponse from substrate/r20a-audience-renderer',
    source.includes('renderR20aRedirectResponse') &&
      source.includes('substrate/r20a-audience-renderer'),
  )
  expectTrue(
    'FL-REASON-3 route imports isR20aAudienceRenderingEnabled (flag-gated audience render)',
    source.includes('isR20aAudienceRenderingEnabled'),
  )
  expectTrue(
    "FL-REASON-4 route derives r20aAudience from auth.user?.id (web=human_user / API=agent_developer)",
    /auth\.user\?\.id\s*\?\s*['"]human_user['"]\s*:\s*['"]agent_developer['"]/.test(body),
  )
  const reasonCallSites = (body.match(/renderR20aRedirectResponse\s*\(/g) ?? []).length
  expectEq(
    'FL-REASON-5 route has EXACTLY two render-helper call sites (route-guard branch + Branch 1.7)',
    reasonCallSites,
    2,
  )

  // Terminal render — human-user form (web caller): crisis pass-through, no
  // agent-only fields. (Catch renders the audience-appropriate output.)
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'moderate',
      redirect_message: REDIRECT_MESSAGE,
    }) as R20aHumanUserRedirectPayload
    expectTrue('FL-REASON-6a human_user terminal → has redirect_message', 'redirect_message' in payload)
    expectTrue('FL-REASON-6b human_user terminal → no status field', !('status' in payload))
    expectTrue('FL-REASON-6c human_user terminal → no flow_terminated field', !('flow_terminated' in payload))
  }

  // Terminal render — agent-developer form (API caller): halt-marked
  // (flow_terminated:true) + developer note + suggested_user_message.
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'acute',
      redirect_message: REDIRECT_MESSAGE,
      safetySignal: acuteCarrier,
    }) as R20aAgentDeveloperRedirectPayload
    expectEq('FL-REASON-7a agent_developer terminal → status="redirected"', payload.status, 'redirected')
    expectEq('FL-REASON-7b agent_developer terminal → flow_terminated=true (halt)', payload.flow_terminated, true)
    expectEq('FL-REASON-7c agent_developer terminal → developer_note formalised', payload.developer_note, R20A_DEVELOPER_NOTE_DEFAULT)
    expectEq('FL-REASON-7d agent_developer terminal → suggested_user_message preserved', payload.suggested_user_message, REDIRECT_MESSAGE)
  }

  // Boundary / propagation-reality (this surface): /api/reason neither consumes
  // nor emits a cross-seam `safety_signal` carrier today — its halt marker is
  // flow_terminated inside the audience payload, not a forwarded safety_signal.
  expectTrue(
    'FL-REASON-8 route source contains NO `safety_signal` (no cross-surface carrier consumed/emitted; halt via flow_terminated only)',
    !source.includes('safety_signal'),
  )
}

// ============================================================================
// FL-CALLING — the /api/calling configuration flow
//
// Entry: agent's conversational `response` -> A7 fresh-call catch (flag-gated
// by SUBSTRATE_CALLING_R20A_ENABLED, overrideFlag:true). Terminal: REDIRECT ->
// developer-form payload + canonical safety_signal; mild -> additive carrier
// rides on the normal response; the Calling->Reasoning hand-off envelope
// (DiscoveredPurpose) carries NO forwarded carrier (single-surface emission).
// ============================================================================

async function runCallingFlow(): Promise<void> {
  expectTrue('FL-CALLING-1 /api/calling/route.ts exists', fs.existsSync(CALLING_ROUTE))

  const source = readSource(CALLING_ROUTE)
  const body = codeOnly(source)

  // Invocation — the catch is wired in the execution path, flag-gated.
  expectTrue(
    'FL-CALLING-2 route imports enforceLayer2R20aGate + isCallingR20aEnabled',
    source.includes('enforceLayer2R20aGate') && source.includes('isCallingR20aEnabled'),
  )
  expectTrue(
    'FL-CALLING-3a route body calls isCallingR20aEnabled() (per-surface flag gate)',
    /isCallingR20aEnabled\s*\(\s*\)/.test(body),
  )
  expectTrue(
    'FL-CALLING-3b route body calls enforceLayer2R20aGate( (the substrate catch)',
    /enforceLayer2R20aGate\s*\(/.test(body),
  )
  expectTrue(
    "FL-CALLING-4 route body constructs caught_at:'substrate_layer2' (canonical carrier at the catch)",
    /caught_at:\s*['"]substrate_layer2['"]/.test(body),
  )

  // Catch -> halt: REDIRECT emits the developer-form payload + flow-terminating
  // canonical safety_signal.
  {
    const res = buildCallingDistressRedirectResponse('sess-fl-calling-1', 'acute', REDIRECT_MESSAGE, acuteCarrier)
    expectEq('FL-CALLING-5a redirect → HTTP 200', res.status, 200)
    const b = (await res.json()) as Record<string, unknown>
    expectEq('FL-CALLING-5b redirect → status="redirected"', b.status, 'redirected')
    expectEq('FL-CALLING-5c redirect → distress_detected=true', b.distress_detected, true)
    expectEq('FL-CALLING-5d redirect → flow_terminated=true (halt)', b.flow_terminated, true)
    const sig = b.safety_signal as SafetySignal
    expectEq('FL-CALLING-5e redirect → safety_signal.flow_terminated=true', sig.flow_terminated, true)
    expectEq('FL-CALLING-5f redirect → safety_signal.cause="distress"', sig.cause, 'distress')
    expectEq('FL-CALLING-5g redirect → safety_signal.caught_at="substrate_layer2"', sig.caught_at, 'substrate_layer2')
    // Audience-correct + surface field preserved.
    expectEq('FL-CALLING-6a redirect → developer_note formalised', b.developer_note, R20A_DEVELOPER_NOTE_DEFAULT)
    expectEq('FL-CALLING-6b redirect → interaction_type="stoic-purpose-discovery"', b.interaction_type, 'stoic-purpose-discovery')
  }

  // Mild PASS: the carrier rides additively on the normal (non-halting)
  // response; the conversation continues (status in_progress).
  {
    const res = buildCallingQuestionResponse('sess-fl-calling-2', 'Q3', 'What is the genuine need here?', undefined, mildCarrier)
    const b = (await res.json()) as Record<string, unknown>
    expectEq('FL-CALLING-7a mild → status="in_progress" (no halt)', b.status, 'in_progress')
    const sig = b.safety_signal as SafetySignal
    expectTrue('FL-CALLING-7b mild → safety_signal present (additive carrier)', sig !== undefined)
    expectEq('FL-CALLING-7c mild → safety_signal.flow_terminated=false (does NOT terminate)', sig.flow_terminated, false)
    expectEq('FL-CALLING-7d mild → safety_signal.severity="mild"', sig.severity, 'mild')
  }

  // None: no carrier attached (additive only — severity 'none' emits nothing).
  {
    const res = buildCallingQuestionResponse('sess-fl-calling-3', 'Q3', 'What is the genuine need here?')
    const b = (await res.json()) as Record<string, unknown>
    expectTrue('FL-CALLING-8 none → no safety_signal key (additive only)', !('safety_signal' in b))
  }

  // No cross-surface forwarding / no double-emit: the Calling->Reasoning
  // hand-off envelope (DiscoveredPurpose) and its assembler carry no
  // safety_signal slot, so the single emission is at the Calling surface only.
  const purposeIface = readSource(LAYER1_EXTRACTOR)
  const ifaceBlock = purposeIface.slice(
    purposeIface.indexOf('interface DiscoveredPurpose'),
    purposeIface.indexOf('interface DiscoveredPurpose') + 600,
  )
  expectTrue(
    'FL-CALLING-9a DiscoveredPurpose interface has NO safety_signal slot (hand-off envelope carries no forwarded carrier)',
    !ifaceBlock.includes('safety_signal'),
  )
  expectTrue(
    'FL-CALLING-9b buildDiscoveredPurpose assembler never threads safety_signal (single-surface emission)',
    !readSource(CALLING_SERVICE).includes('safety_signal'),
  )
}

// ============================================================================
// FL-REFLECT — the /api/practice/reflect configuration flow
//
// Two entries, real in-configuration idempotency:
//   (a) developer-declared harm (upstream signal) -> Zone-3 boundary FIRST ->
//       status 'flagged'; the substrate content catch is SKIPPED (the route
//       returns before calling the classifier). This is the §4.5 single-
//       emission rule realised within the surface.
//   (b) substrate-detected distress on the answer turn -> REDIRECT -> status
//       'redirected' + flow-terminating canonical safety_signal.
// The two mechanisms are distinct (different statuses), never both for one turn.
// ============================================================================

async function runReflectFlow(): Promise<void> {
  expectTrue('FL-REFLECT-1 /api/practice/reflect/route.ts exists', fs.existsSync(REFLECT_ROUTE))

  const source = readSource(REFLECT_ROUTE)
  const body = codeOnly(source)

  // Invocation — both the Zone-3 boundary and the substrate catch are wired.
  expectTrue(
    'FL-REFLECT-2 route imports checkZone3Boundary + enforceLayer2R20aGate + isReflectR20aEnabled',
    source.includes('checkZone3Boundary') &&
      source.includes('enforceLayer2R20aGate') &&
      source.includes('isReflectR20aEnabled'),
  )

  // Ordering / idempotency precedence: the Zone-3 call site appears BEFORE the
  // substrate-catch call site in the execution path — the upstream developer-
  // declared signal takes precedence and skips the downstream catch.
  {
    const zoneIdx = body.indexOf('checkZone3Boundary(')
    const gateIdx = body.indexOf('enforceLayer2R20aGate(')
    expectTrue('FL-REFLECT-3a checkZone3Boundary( call present in body', zoneIdx >= 0)
    expectTrue('FL-REFLECT-3b enforceLayer2R20aGate( call present in body', gateIdx >= 0)
    expectTrue(
      'FL-REFLECT-3c Zone-3 boundary runs BEFORE the substrate catch (upstream precedence → downstream skip)',
      zoneIdx >= 0 && gateIdx >= 0 && zoneIdx < gateIdx,
    )
  }

  // Upstream catch engages (developer-declared harm) -> the precondition for
  // the route's skip-the-classifier path.
  {
    const harm: Zone3SafetySignal = { harm_flagged: true, detail: 'session involved a harmful act' }
    const r = checkZone3Boundary({ safety_signal: harm })
    expectEq('FL-REFLECT-4a harm_flagged=true → Zone-3 engaged=true (upstream flow-terminating signal)', r.engaged, true)
    expectEq('FL-REFLECT-4b Zone-3 engaged → developer_note === ZONE3_DEVELOPER_NOTE', r.developer_note, ZONE3_DEVELOPER_NOTE)
  }

  // No upstream signal -> boundary clear, the substrate catch is free to run.
  {
    const r = checkZone3Boundary({})
    expectEq('FL-REFLECT-5a no signal → Zone-3 engaged=false', r.engaged, false)
    expectEq('FL-REFLECT-5b no signal → developer_note null', r.developer_note, null)
  }

  // acts_blocked harm also engages the boundary.
  {
    const r = checkZone3Boundary({ acts_blocked: [{ act: 'x', reason: 'y', category: 'harm' }] })
    expectEq('FL-REFLECT-6 acts_blocked category=harm → Zone-3 engaged=true', r.engaged, true)
  }

  // Substrate catch -> halt: REDIRECT emits the developer-form payload + the
  // flow-terminating canonical carrier (distinct status from Zone-3).
  let redirectStatus: unknown
  {
    const res = buildReflectDistressRedirectResponse('sess-fl-reflect-1', 'acute', REDIRECT_MESSAGE, acuteCarrier)
    const b = (await res.json()) as Record<string, unknown>
    redirectStatus = b.status
    expectEq('FL-REFLECT-7a substrate redirect → status="redirected"', b.status, 'redirected')
    expectEq('FL-REFLECT-7b substrate redirect → flow_terminated=true (halt)', b.flow_terminated, true)
    const sig = b.safety_signal as SafetySignal
    expectEq('FL-REFLECT-7c substrate redirect → safety_signal.caught_at="substrate_layer2"', sig.caught_at, 'substrate_layer2')
    expectEq('FL-REFLECT-9a substrate redirect → developer_note formalised', b.developer_note, R20A_DEVELOPER_NOTE_DEFAULT)
    expectEq('FL-REFLECT-9b substrate redirect → interaction_type="stoic-post-action-reflection"', b.interaction_type, 'stoic-post-action-reflection')
  }

  // Two mechanisms distinct -> no double-emit: Zone-3='flagged' vs substrate
  // ='redirected'. Different statuses; the route returns on the first match,
  // so exactly one emission per turn.
  {
    const zres = buildZone3Response('sess-fl-reflect-2', ZONE3_DEVELOPER_NOTE)
    const zb = (await zres.json()) as Record<string, unknown>
    expectEq('FL-REFLECT-8a Zone-3 → status="flagged"', zb.status, 'flagged')
    expectTrue(
      'FL-REFLECT-8b Zone-3 status !== substrate-redirect status (distinct single-emission mechanisms)',
      zb.status !== redirectStatus,
    )
  }

  // Mild PASS rides additively on the six-question sequence (no halt).
  {
    const res = buildReflectQuestionResponse('sess-fl-reflect-3', 'Q2', 'What did you do?', [], [], undefined, mildCarrier)
    const b = (await res.json()) as Record<string, unknown>
    expectEq('FL-REFLECT-10a mild → status="in_progress" (no halt)', b.status, 'in_progress')
    const sig = b.safety_signal as SafetySignal
    expectEq('FL-REFLECT-10b mild → safety_signal.flow_terminated=false', sig.flow_terminated, false)
  }
}

// ============================================================================
// FL-BOUNDARY — propagation-reality finding pinned as executable assertions
//
// Documents WHY surfaces without a wired catch need no propagation test today,
// and why S5 is propagation-shaped (per-stage) rather than a single end-to-end
// test: no cross-surface forwarding mechanism exists. Each emitting surface
// attaches the carrier only additively on its OWN response shape.
// ============================================================================

function runBoundaryGroup(): void {
  const layer1 = readSource(LAYER1_EXTRACTOR)
  const ifaceStart = layer1.indexOf('interface DiscoveredPurpose')
  const ifaceBlock = layer1.slice(ifaceStart, ifaceStart + 600)

  expectTrue(
    'BND-1 Calling→Reasoning envelope (DiscoveredPurpose) has no safety_signal field',
    !ifaceBlock.includes('safety_signal'),
  )
  expectTrue(
    'BND-2 /api/reason consumes/emits no `safety_signal` carrier (no cross-surface forwarding into reasoning)',
    !readSource(REASON_ROUTE).includes('safety_signal'),
  )
  expectTrue(
    'BND-3 buildDiscoveredPurpose assembler never threads the carrier',
    !readSource(CALLING_SERVICE).includes('safety_signal'),
  )
  // Each emitting surface attaches the carrier ADDITIVELY on its own shape
  // (the spread-guard pattern `...(safetySignal ? { safety_signal: safetySignal } : {})`).
  expectTrue(
    'BND-4a Calling builders attach safety_signal additively on Calling responses only',
    /\.\.\.\(safetySignal\s*\?\s*\{\s*safety_signal:\s*safetySignal\s*\}\s*:\s*\{\}\)/.test(readSource(CALLING_BUILDERS)),
  )
  expectTrue(
    'BND-4b Reflect builders attach safety_signal additively on Reflect responses only',
    /\.\.\.\(safetySignal\s*\?\s*\{\s*safety_signal:\s*safetySignal\s*\}\s*:\s*\{\}\)/.test(readSource(REFLECT_BUILDERS)),
  )
  // The canonical carrier's halt marker is flow_terminated — the field a future
  // wired downstream consumer would read to skip (today only Reflect's Zone-3
  // precedence exercises that read; see FL-REFLECT-3/4).
  expectTrue(
    'BND-5 canonical SafetySignal halt marker is flow_terminated (the cross-seam skip contract)',
    acuteCarrier.flow_terminated === true && mildCarrier.flow_terminated === false,
  )
}

// ============================================================================
// CROSS-SURFACE CONSISTENCY — one developer_note across the perimeter
// (mirrors the S4 SH-1 proof, now across all three configuration flows).
// ============================================================================

async function runConsistencyGroup(): Promise<void> {
  const callingRes = buildCallingDistressRedirectResponse('sess-c-1', 'acute', REDIRECT_MESSAGE, acuteCarrier)
  const reflectRes = buildReflectDistressRedirectResponse('sess-c-2', 'acute', REDIRECT_MESSAGE, acuteCarrier)
  const cb = (await callingRes.json()) as Record<string, unknown>
  const rb = (await reflectRes.json()) as Record<string, unknown>
  expectEq('CON-1 Calling.developer_note === Reflect.developer_note (single source of truth across the perimeter)', cb.developer_note, rb.developer_note)
  expectEq('CON-2 perimeter developer_note === R20A_DEVELOPER_NOTE_DEFAULT', cb.developer_note, R20A_DEVELOPER_NOTE_DEFAULT)
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- r20a-configuration-flows.test.ts (Option A S5 — configuration-level R20a propagation) ---')

  runReasonFlow()
  await runCallingFlow()
  await runReflectFlow()
  runBoundaryGroup()
  await runConsistencyGroup()

  const total = passCount + failCount
  console.log('---')
  console.log(`${passCount}/${total} pass | ${failCount}/${total} fail`)

  if (failCount > 0) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unhandled test error:', err)
  process.exit(1)
})
