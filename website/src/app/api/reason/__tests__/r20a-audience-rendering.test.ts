/**
 * r20a-audience-rendering.test.ts — AC4 invocation + functional test for the
 * Layer-3 audience-rendering helper + /api/reason agent-API fix (Finding 2)
 * (Option A build arc, Session 4, 2026-05-28).
 *
 * Run via: npx tsx src/app/api/reason/__tests__/r20a-audience-rendering.test.ts
 *
 * Plain-assertion script (no Jest). Pattern mirrors S2 + S3's
 * r20a-invocation.test.ts per PR15 (reuse the pattern). EXIT 0 on all pass;
 * EXIT 1 on any fail.
 *
 * COVERAGE
 *
 * Invocation tests (INV-0..INV-7) — file-grep over /api/reason/route.ts source:
 *   - INV-0: route.ts exists
 *   - INV-1: route.ts imports renderR20aRedirectResponse from
 *            substrate/r20a-audience-renderer
 *   - INV-2: route.ts imports isR20aAudienceRenderingEnabled
 *   - INV-3: route.ts imports R20aAudience type
 *   - INV-4: route.ts body contains `renderR20aRedirectResponse(` (called)
 *   - INV-5: route.ts body contains `isR20aAudienceRenderingEnabled()` (flag
 *            check called)
 *   - INV-6: route.ts body contains `auth.user?.id ? 'human_user' :
 *            'agent_developer'` (audience derivation from auth signal)
 *   - INV-7: route.ts body has EXACTLY two render-helper call sites (both
 *            redirect branches updated — route-guard + Branch 1.7)
 *
 * Prose-mode key tests (PR-1..PR-3) — verify R20A_DEVELOPER_NOTE_DEFAULT
 * is exported, non-empty, and contains key audience-contract phrases:
 *   - PR-1: R20A_DEVELOPER_NOTE_DEFAULT is a string
 *   - PR-2: R20A_DEVELOPER_NOTE_DEFAULT length > 0
 *   - PR-3: R20A_DEVELOPER_NOTE_DEFAULT contains "agent operator", "not a
 *           crisis pathway", "suggested_user_message", and "substrate"
 *
 * Flag tests (FT-1..FT-5) — verify isR20aAudienceRenderingEnabled semantics
 * mirror the existing flag-gating pattern (case-strict; only literal 'true'):
 *   - FT-1: SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED unset → false
 *   - FT-2: = 'true' → true
 *   - FT-3: = 'false' → false
 *   - FT-4: = '1' → false (case-strict)
 *   - FT-5: = 'TRUE' → false (case-strict — only literal lowercase 'true')
 *
 * Audience-routing tests (AR-1..AR-10) — exercise the render helper across
 * both audience forms:
 *   - AR-1: human_user audience → shape with redirect_message, NO status,
 *           NO developer_note, NO suggested_user_message, NO safety_signal
 *   - AR-2: agent_developer audience → shape with status='redirected',
 *           developer_note, suggested_user_message, flow_terminated=true,
 *           safety_signal (when supplied)
 *   - AR-3: agent_developer at severity='moderate' → severity preserved
 *   - AR-4: agent_developer at severity='acute' → severity preserved
 *   - AR-5: agent_developer with safetySignal → safety_signal field in payload
 *   - AR-6: agent_developer WITHOUT safetySignal → no safety_signal field
 *   - AR-7: human_user → distress_detected=true preserved
 *   - AR-8: agent_developer → developer_note === R20A_DEVELOPER_NOTE_DEFAULT
 *   - AR-9: agent_developer → suggested_user_message === input redirect_message
 *   - AR-10: human_user → redirect_message === input redirect_message
 *
 * Calling-side refactor regression tests (RB-Calling-1..RB-Calling-12) —
 * confirm the thin-wrapper refactor preserves the S2 wire shape structurally
 * AND now emits the formalised R20A_DEVELOPER_NOTE_DEFAULT text:
 *   - RB-Calling-1..10: mirror S2's RB-1 structural assertions (HTTP 200,
 *     status='redirected', session_id preserved, distress_detected=true,
 *     severity, developer_note present, suggested_user_message preserved,
 *     flow_terminated=true, safety_signal fields)
 *   - RB-Calling-11: developer_note text === R20A_DEVELOPER_NOTE_DEFAULT
 *     (formalised replacement for the retired
 *     CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER)
 *   - RB-Calling-12: interaction_type === 'stoic-purpose-discovery'
 *     (Calling-specific surface field preserved)
 *
 * Reflect-side refactor regression tests (RB-Reflect-1..RB-Reflect-12) —
 * parallel to the Calling RB tests:
 *   - RB-Reflect-1..10: mirror S3's RB-1 structural assertions
 *   - RB-Reflect-11: developer_note text === R20A_DEVELOPER_NOTE_DEFAULT
 *     (formalised replacement for the retired
 *     REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER)
 *   - RB-Reflect-12: interaction_type === 'stoic-post-action-reflection'
 *     (Reflect-specific surface field preserved)
 *
 * NOT COVERED HERE (deferred to live exercise / session 5):
 *   - End-to-end HTTP test against the /api/reason handler (requires Supabase
 *     env per CLAUDE.md's session-store transitive-import rule). The invocation
 *     tests + audience-routing tests + refactor regression tests together
 *     cover the wiring (helper is called) AND the verdict logic (helper
 *     returns the right shape) AND the response emission (route call sites
 *     produce the right wire shape).
 *   - End-to-end propagation across L1–L7 flows (deferred to session 5 —
 *     configuration-level invocation tests).
 *   - Live-Haiku coverage (deferred to C2 live run post-Option-A).
 *
 * Rules served: R20a (vulnerable user detection); R19c (formalised wording
 * — placeholders retired); AC4 (invocation testing); AC5 (perimeter
 * unchanged -- membership is the registry in r20a-invocation-guard.test.ts,
 * never a count written here); PR1 (single-endpoint proof on /api/reason); PR3
 * (synchronous safety — helper is pure-sync); PR6 (Critical); PR15 (mirrors
 * S2 + S3 test patterns).
 */

import * as fs from 'fs'
import * as path from 'path'

import type { SafetySignal } from '@/lib/substrate/r20a-gate'

import {
  renderR20aRedirectResponse,
  isR20aAudienceRenderingEnabled,
  R20A_DEVELOPER_NOTE_DEFAULT,
  type R20aAgentDeveloperRedirectPayload,
  type R20aHumanUserRedirectPayload,
} from '@/lib/substrate/r20a-audience-renderer'

import { buildCallingDistressRedirectResponse } from '@/app/api/calling/response-builders'
import { buildReflectDistressRedirectResponse } from '@/app/api/practice/reflect/response-builders'

// ============================================================================
// TEST HARNESS
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
// ROUTE SOURCE — read once for the INV-* tests
// ============================================================================

const ROUTE_PATH = path.resolve(__dirname, '..', 'route.ts')

function loadRouteSource(): { source: string; bodyOnly: string } {
  const source = fs.readFileSync(ROUTE_PATH, 'utf-8')
  const bodyOnly = source
    .split('\n')
    .filter((line) => !line.trim().startsWith('import '))
    .join('\n')
  return { source, bodyOnly }
}

// ============================================================================
// INVOCATION TESTS — INV-0..INV-7
// ============================================================================

function runInvocationTests(): void {
  expectTrue('INV-0 route.ts exists at ' + ROUTE_PATH, fs.existsSync(ROUTE_PATH))

  const { source, bodyOnly } = loadRouteSource()

  // INV-1: imports renderR20aRedirectResponse from substrate/r20a-audience-renderer
  expectTrue(
    'INV-1 route.ts imports renderR20aRedirectResponse from substrate/r20a-audience-renderer',
    source.includes('renderR20aRedirectResponse') &&
      source.includes('substrate/r20a-audience-renderer'),
  )

  // INV-2: imports isR20aAudienceRenderingEnabled
  expectTrue(
    'INV-2 route.ts imports isR20aAudienceRenderingEnabled',
    source.includes('isR20aAudienceRenderingEnabled'),
  )

  // INV-3: imports R20aAudience type
  expectTrue(
    'INV-3 route.ts imports R20aAudience type',
    source.includes('R20aAudience'),
  )

  // INV-4: body contains `renderR20aRedirectResponse(` (called, not just imported)
  expectTrue(
    'INV-4 route.ts body calls renderR20aRedirectResponse(',
    /renderR20aRedirectResponse\s*\(/.test(bodyOnly),
  )

  // INV-5: body contains `isR20aAudienceRenderingEnabled()` (flag check called)
  expectTrue(
    'INV-5 route.ts body calls isR20aAudienceRenderingEnabled()',
    /isR20aAudienceRenderingEnabled\s*\(\s*\)/.test(bodyOnly),
  )

  // INV-6: body contains the audience-derivation pattern from the auth signal
  expectTrue(
    "INV-6 route.ts body derives r20aAudience from auth.user?.id (auth signal)",
    /auth\.user\?\.id\s*\?\s*['"]human_user['"]\s*:\s*['"]agent_developer['"]/.test(bodyOnly),
  )

  // INV-7: EXACTLY two call sites — both redirect branches updated
  const callSiteCount = (bodyOnly.match(/renderR20aRedirectResponse\s*\(/g) ?? []).length
  expectEq(
    'INV-7 route.ts body has exactly TWO renderR20aRedirectResponse call sites (route-guard branch + Branch 1.7)',
    callSiteCount,
    2,
  )
}

// ============================================================================
// PROSE-MODE KEY TESTS — PR-1..PR-3 (R20A_DEVELOPER_NOTE_DEFAULT)
// ============================================================================

function runProseModeKeyTests(): void {
  // PR-1: R20A_DEVELOPER_NOTE_DEFAULT is a string
  expectTrue(
    'PR-1 R20A_DEVELOPER_NOTE_DEFAULT is a string',
    typeof R20A_DEVELOPER_NOTE_DEFAULT === 'string',
  )

  // PR-2: R20A_DEVELOPER_NOTE_DEFAULT is non-empty
  expectTrue(
    'PR-2 R20A_DEVELOPER_NOTE_DEFAULT length > 0',
    R20A_DEVELOPER_NOTE_DEFAULT.length > 0,
  )

  // PR-3: contains the audience-contract key phrases
  const txt = R20A_DEVELOPER_NOTE_DEFAULT
  expectTrue(
    'PR-3a R20A_DEVELOPER_NOTE_DEFAULT contains "agent operator"',
    txt.includes('agent operator'),
  )
  expectTrue(
    'PR-3b R20A_DEVELOPER_NOTE_DEFAULT contains "not a crisis pathway"',
    txt.includes('not a crisis pathway'),
  )
  expectTrue(
    'PR-3c R20A_DEVELOPER_NOTE_DEFAULT contains "suggested_user_message"',
    txt.includes('suggested_user_message'),
  )
  expectTrue(
    'PR-3d R20A_DEVELOPER_NOTE_DEFAULT contains "substrate"',
    txt.includes('substrate'),
  )
}

// ============================================================================
// FLAG TESTS — FT-1..FT-5 (isR20aAudienceRenderingEnabled)
// ============================================================================

function runFlagTests(): void {
  // FT-1 — unset → false
  delete process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
  expectEq(
    'FT-1 SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED unset → isR20aAudienceRenderingEnabled=false',
    isR20aAudienceRenderingEnabled(),
    false,
  )

  // FT-2 — 'true' → true
  process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = 'true'
  expectEq(
    'FT-2 SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = "true" → isR20aAudienceRenderingEnabled=true',
    isR20aAudienceRenderingEnabled(),
    true,
  )

  // FT-3 — 'false' → false
  process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = 'false'
  expectEq(
    'FT-3 SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = "false" → isR20aAudienceRenderingEnabled=false',
    isR20aAudienceRenderingEnabled(),
    false,
  )

  // FT-4 — '1' → false (case-strict)
  process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = '1'
  expectEq(
    'FT-4 SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = "1" → isR20aAudienceRenderingEnabled=false',
    isR20aAudienceRenderingEnabled(),
    false,
  )

  // FT-5 — 'TRUE' → false (case-strict; only literal lowercase 'true')
  process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = 'TRUE'
  expectEq(
    'FT-5 SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED = "TRUE" → isR20aAudienceRenderingEnabled=false (case-strict)',
    isR20aAudienceRenderingEnabled(),
    false,
  )

  // Cleanup
  delete process.env.SUBSTRATE_R20A_AUDIENCE_RENDERING_ENABLED
}

// ============================================================================
// AUDIENCE-ROUTING TESTS — AR-1..AR-10
// ============================================================================

const sampleSafetySignal: SafetySignal = {
  flow_terminated: true,
  cause: 'distress',
  severity: 'acute',
  caught_at: 'substrate_layer2',
}

function runAudienceRoutingTests(): void {
  const sampleRedirectMessage =
    'Before we continue, we want to make sure you are okay. Some of what you have described sounds like it might be weighing heavily on you.'

  // AR-1: human_user audience → shape with redirect_message + NO agent-only fields
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'moderate',
      redirect_message: sampleRedirectMessage,
    }) as R20aHumanUserRedirectPayload
    expectTrue('AR-1a human_user → payload has redirect_message', 'redirect_message' in payload)
    expectTrue('AR-1b human_user → payload has NO status', !('status' in payload))
    expectTrue('AR-1c human_user → payload has NO developer_note', !('developer_note' in payload))
    expectTrue(
      'AR-1d human_user → payload has NO suggested_user_message',
      !('suggested_user_message' in payload),
    )
    expectTrue('AR-1e human_user → payload has NO safety_signal', !('safety_signal' in payload))
    expectTrue(
      'AR-1f human_user → payload has NO flow_terminated',
      !('flow_terminated' in payload),
    )
  }

  // AR-2: agent_developer audience → developer-form shape
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'moderate',
      redirect_message: sampleRedirectMessage,
      safetySignal: sampleSafetySignal,
    }) as R20aAgentDeveloperRedirectPayload
    expectEq('AR-2a agent_developer → status="redirected"', payload.status, 'redirected')
    expectEq('AR-2b agent_developer → distress_detected=true', payload.distress_detected, true)
    expectTrue(
      'AR-2c agent_developer → developer_note present (string)',
      typeof payload.developer_note === 'string',
    )
    expectTrue(
      'AR-2d agent_developer → suggested_user_message present (string)',
      typeof payload.suggested_user_message === 'string',
    )
    expectEq('AR-2e agent_developer → flow_terminated=true', payload.flow_terminated, true)
    expectTrue('AR-2f agent_developer → safety_signal present', payload.safety_signal !== undefined)
  }

  // AR-3: agent_developer at severity='moderate' → severity preserved
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'moderate',
      redirect_message: sampleRedirectMessage,
    }) as R20aAgentDeveloperRedirectPayload
    expectEq('AR-3 agent_developer severity="moderate" preserved', payload.severity, 'moderate')
  }

  // AR-4: agent_developer at severity='acute' → severity preserved
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'acute',
      redirect_message: sampleRedirectMessage,
    }) as R20aAgentDeveloperRedirectPayload
    expectEq('AR-4 agent_developer severity="acute" preserved', payload.severity, 'acute')
  }

  // AR-5: agent_developer with safetySignal → safety_signal field present
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'acute',
      redirect_message: sampleRedirectMessage,
      safetySignal: sampleSafetySignal,
    }) as R20aAgentDeveloperRedirectPayload
    expectTrue(
      'AR-5a agent_developer with safetySignal → safety_signal present',
      payload.safety_signal !== undefined,
    )
    if (payload.safety_signal) {
      expectEq(
        'AR-5b agent_developer safety_signal.cause preserved',
        payload.safety_signal.cause,
        'distress',
      )
      expectEq(
        'AR-5c agent_developer safety_signal.caught_at preserved',
        payload.safety_signal.caught_at,
        'substrate_layer2',
      )
    }
  }

  // AR-6: agent_developer WITHOUT safetySignal → no safety_signal field
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'acute',
      redirect_message: sampleRedirectMessage,
    }) as R20aAgentDeveloperRedirectPayload
    expectTrue(
      'AR-6 agent_developer without safetySignal → no safety_signal field (additive only)',
      payload.safety_signal === undefined,
    )
  }

  // AR-7: human_user → distress_detected=true
  {
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'acute',
      redirect_message: sampleRedirectMessage,
    }) as R20aHumanUserRedirectPayload
    expectEq('AR-7 human_user → distress_detected=true', payload.distress_detected, true)
  }

  // AR-8: agent_developer → developer_note === R20A_DEVELOPER_NOTE_DEFAULT
  {
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'acute',
      redirect_message: sampleRedirectMessage,
    }) as R20aAgentDeveloperRedirectPayload
    expectEq(
      'AR-8 agent_developer → developer_note === R20A_DEVELOPER_NOTE_DEFAULT',
      payload.developer_note,
      R20A_DEVELOPER_NOTE_DEFAULT,
    )
  }

  // AR-9: agent_developer → suggested_user_message === input redirect_message
  {
    const customMessage = 'custom crisis pass-through message for test'
    const payload = renderR20aRedirectResponse({
      audience: 'agent_developer',
      severity: 'acute',
      redirect_message: customMessage,
    }) as R20aAgentDeveloperRedirectPayload
    expectEq(
      'AR-9 agent_developer → suggested_user_message === input redirect_message',
      payload.suggested_user_message,
      customMessage,
    )
  }

  // AR-10: human_user → redirect_message === input redirect_message (pass-through)
  {
    const customMessage = 'custom crisis pass-through message for test'
    const payload = renderR20aRedirectResponse({
      audience: 'human_user',
      severity: 'acute',
      redirect_message: customMessage,
    }) as R20aHumanUserRedirectPayload
    expectEq(
      'AR-10 human_user → redirect_message === input redirect_message',
      payload.redirect_message,
      customMessage,
    )
  }
}

// ============================================================================
// CALLING-SIDE REFACTOR REGRESSION TESTS — RB-Calling-1..RB-Calling-12
//
// Confirms the S4 thin-wrapper refactor preserves the S2 wire shape
// structurally AND now emits the formalised R20A_DEVELOPER_NOTE_DEFAULT text.
// ============================================================================

async function runCallingRefactorRegressionTests(): Promise<void> {
  const res = buildCallingDistressRedirectResponse(
    'sess-s4-rb-calling-001',
    'acute',
    'crisis pass-through message',
    sampleSafetySignal,
  )
  expectEq('RB-Calling-1 redirect response → HTTP 200', res.status, 200)
  const body = (await res.json()) as Record<string, unknown>
  expectEq('RB-Calling-2 redirect body → status="redirected"', body.status, 'redirected')
  expectEq(
    'RB-Calling-3 redirect body → session_id preserved',
    body.session_id,
    'sess-s4-rb-calling-001',
  )
  expectEq('RB-Calling-4 redirect body → distress_detected=true', body.distress_detected, true)
  expectEq('RB-Calling-5 redirect body → severity="acute"', body.severity, 'acute')
  expectTrue(
    'RB-Calling-6 redirect body → developer_note present (non-empty string)',
    typeof body.developer_note === 'string' && (body.developer_note as string).length > 0,
  )
  expectEq(
    'RB-Calling-7 redirect body → suggested_user_message preserved',
    body.suggested_user_message,
    'crisis pass-through message',
  )
  expectEq('RB-Calling-8 redirect body → flow_terminated=true', body.flow_terminated, true)
  const sig = body.safety_signal as SafetySignal
  expectEq(
    'RB-Calling-9 redirect body → safety_signal.flow_terminated=true',
    sig.flow_terminated,
    true,
  )
  expectEq('RB-Calling-10 redirect body → safety_signal.cause="distress"', sig.cause, 'distress')
  // RB-Calling-11: developer_note === R20A_DEVELOPER_NOTE_DEFAULT (the formalised
  // replacement for the retired CALLING_R20A_DEVELOPER_NOTE_PLACEHOLDER).
  expectEq(
    'RB-Calling-11 redirect body → developer_note === R20A_DEVELOPER_NOTE_DEFAULT (formalised)',
    body.developer_note,
    R20A_DEVELOPER_NOTE_DEFAULT,
  )
  // RB-Calling-12: interaction_type === 'stoic-purpose-discovery' (Calling-specific
  // surface field; preserved through the thin-wrapper refactor via build() helper).
  expectEq(
    'RB-Calling-12 redirect body → interaction_type="stoic-purpose-discovery" (Calling-specific preserved)',
    body.interaction_type,
    'stoic-purpose-discovery',
  )
}

// ============================================================================
// REFLECT-SIDE REFACTOR REGRESSION TESTS — RB-Reflect-1..RB-Reflect-12
//
// Parallel to RB-Calling-*. Confirms S3 wire shape preserved structurally
// + formalised developer_note text + Reflect-specific interaction_type.
// ============================================================================

async function runReflectRefactorRegressionTests(): Promise<void> {
  const res = buildReflectDistressRedirectResponse(
    'sess-s4-rb-reflect-001',
    'acute',
    'crisis pass-through message',
    sampleSafetySignal,
  )
  expectEq('RB-Reflect-1 redirect response → HTTP 200', res.status, 200)
  const body = (await res.json()) as Record<string, unknown>
  expectEq('RB-Reflect-2 redirect body → status="redirected"', body.status, 'redirected')
  expectEq(
    'RB-Reflect-3 redirect body → session_id preserved',
    body.session_id,
    'sess-s4-rb-reflect-001',
  )
  expectEq('RB-Reflect-4 redirect body → distress_detected=true', body.distress_detected, true)
  expectEq('RB-Reflect-5 redirect body → severity="acute"', body.severity, 'acute')
  expectTrue(
    'RB-Reflect-6 redirect body → developer_note present (non-empty string)',
    typeof body.developer_note === 'string' && (body.developer_note as string).length > 0,
  )
  expectEq(
    'RB-Reflect-7 redirect body → suggested_user_message preserved',
    body.suggested_user_message,
    'crisis pass-through message',
  )
  expectEq('RB-Reflect-8 redirect body → flow_terminated=true', body.flow_terminated, true)
  const sig = body.safety_signal as SafetySignal
  expectEq(
    'RB-Reflect-9 redirect body → safety_signal.flow_terminated=true',
    sig.flow_terminated,
    true,
  )
  expectEq('RB-Reflect-10 redirect body → safety_signal.cause="distress"', sig.cause, 'distress')
  // RB-Reflect-11: developer_note === R20A_DEVELOPER_NOTE_DEFAULT (the formalised
  // replacement for the retired REFLECT_R20A_DEVELOPER_NOTE_PLACEHOLDER).
  expectEq(
    'RB-Reflect-11 redirect body → developer_note === R20A_DEVELOPER_NOTE_DEFAULT (formalised)',
    body.developer_note,
    R20A_DEVELOPER_NOTE_DEFAULT,
  )
  // RB-Reflect-12: interaction_type === 'stoic-post-action-reflection' (Reflect-
  // specific surface field; preserved through the thin-wrapper refactor).
  expectEq(
    'RB-Reflect-12 redirect body → interaction_type="stoic-post-action-reflection" (Reflect-specific preserved)',
    body.interaction_type,
    'stoic-post-action-reflection',
  )
}

// ============================================================================
// SHARED-HELPER CONSISTENCY TEST — SH-1
//
// Verify both refactored builders source the EXACT same developer_note text.
// This is the proof of "one helper, one developer_note" — the audience
// contract consolidates the per-surface placeholders.
// ============================================================================

async function runSharedHelperConsistencyTests(): Promise<void> {
  const callingRes = buildCallingDistressRedirectResponse(
    'sess-sh-001',
    'acute',
    'crisis pass-through message',
    sampleSafetySignal,
  )
  const reflectRes = buildReflectDistressRedirectResponse(
    'sess-sh-002',
    'acute',
    'crisis pass-through message',
    sampleSafetySignal,
  )
  const callingBody = (await callingRes.json()) as Record<string, unknown>
  const reflectBody = (await reflectRes.json()) as Record<string, unknown>

  expectEq(
    'SH-1 Calling.developer_note === Reflect.developer_note (single source of truth)',
    callingBody.developer_note,
    reflectBody.developer_note,
  )
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  console.log('--- r20a-audience-rendering.test.ts (S4 audience contract + /api/reason fix) ---')

  runInvocationTests()
  runProseModeKeyTests()
  runFlagTests()
  runAudienceRoutingTests()
  await runCallingRefactorRegressionTests()
  await runReflectRefactorRegressionTests()
  await runSharedHelperConsistencyTests()

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
