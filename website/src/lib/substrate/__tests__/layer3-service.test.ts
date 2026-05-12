/**
 * layer3-service.test.ts — A5 functional tests + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/layer3-service.test.ts`
 * (mirrors the A4 / A3 verification pattern; no Jest framework dependency).
 *
 * COVERAGE — per AC4 functional-test requirements + the Step 6 verify block:
 *
 *   FT-1  injectR3Disclaimer returns the canonical R3 disclaimer string
 *   FT-2  injectR3Disclaimer is idempotent (multiple calls return identical strings)
 *   FT-3  injectR19Limitations returns the canonical R19c limitations string
 *   FT-4  injectR19MirrorPrinciple returns null when consumer is not mentor-flavoured
 *   FT-5  injectR19MirrorPrinciple returns the canonical R19d string when mentor-flavoured
 *   FT-6  injectR20aDistressPassthrough returns null on plain assessment (no distress)
 *   FT-7  injectR20aDistressPassthrough returns the canonical pass-through on SafetyGate.shouldRedirect = true
 *   FT-8  injectR20aDistressPassthrough returns the canonical pass-through on assessment.decision === 'ESCALATE'
 *   FT-9  injectR20aDistressPassthrough returns the canonical pass-through on assessment.distress_signal === true
 *   FT-10 injectR18aCategory returns null when consumer_context.include_category_framing is false
 *   FT-11 injectR18aCategory returns the canonical R18a string when true
 *   FT-12 injectR18eTransparencyNotice returns the canonical R18e Article 50 placeholder
 *
 * AC9 / AC10 PROJECTION CHECKS
 *
 *   AC9-1 applyLayer3Injections projects decision = null when assessment.decision absent
 *   AC9-2 applyLayer3Injections projects decision = 'ESCALATE' when present
 *   AC9-3 applyLayer3Injections sets meta.distress_detected = true when decision === 'ESCALATE'
 *   AC10-1 applyLayer3Injections defaults provenance to 'generated' when absent
 *   AC10-2 applyLayer3Injections defaults use_policies to ['advisory'] when absent
 *
 * AC11 SPAN EMISSION CHECK
 *
 *   AC11-1 applyLayer3Injections returns a non-empty span_id on every call
 *
 * INVARIANT CHECKS — properties that must hold across calls
 *
 *   INV-1 Two identical inputs produce identical injection contents (deterministic)
 *   INV-2 The R3 disclaimer text never changes between calls
 *   INV-3 The R20a pass-through text is identical regardless of which signal source fired
 *
 * Exit code 0 = all pass. Non-zero = first failure prints; remaining tests not run.
 */

import {
  injectR3Disclaimer,
  injectR19Limitations,
  injectR19MirrorPrinciple,
  injectR20aDistressPassthrough,
  injectR18aCategory,
  injectR18eTransparencyNotice,
  applyLayer3Injections,
  R3_DISCLAIMER,
  R19C_LIMITATIONS_LINK,
  R19D_MIRROR_PRINCIPLE,
  R20A_DISTRESS_PASSTHROUGH,
  R18A_CHARACTER_KERNEL_CATEGORY,
  R18E_ARTICLE_50_TRANSPARENCY_NOTICE,
} from '../layer3-service'

import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'
import type { Layer3Prose } from '../../translation-sandwich/layer3-prose'
import type { SafetyGate } from '../../constraints'

// ============================================================================
// Test scaffolding — minimal mock fixtures
// ============================================================================

/** Minimal Layer2Assessment for testing — uses `any` cast because the actual
 *  Layer2Assessment shape is large; the A5 service only reads a small subset
 *  of fields (defensively). The test asserts behaviour given those fields. */
const MOCK_ASSESSMENT_PLAIN: Layer2Assessment = ({
  version: 'layer2-assessment-v1',
} as unknown) as Layer2Assessment

const MOCK_ASSESSMENT_ESCALATE: Layer2Assessment = ({
  version: 'layer2-assessment-v1',
  decision: 'ESCALATE',
} as unknown) as Layer2Assessment

const MOCK_ASSESSMENT_DISTRESS_SIGNAL: Layer2Assessment = ({
  version: 'layer2-assessment-v1',
  distress_signal: true,
} as unknown) as Layer2Assessment

const MOCK_ASSESSMENT_WITH_TAGS: Layer2Assessment = ({
  version: 'layer2-assessment-v1',
  decision: 'ALLOW',
  provenance: 'inferred',
  use_policies: ['binding_within_session'],
} as unknown) as Layer2Assessment

const MOCK_PROSE: Layer3Prose = {
  version: 'layer3-prose-v1',
  layer2_assessment_version: 'layer2-assessment-v1',
  consumer: 'api_reason',
  philosophical_reflection: 'Test reflection.',
  improvement_guidance: 'Test guidance.',
  summary: 'Test summary.',
  soft_clarification_prose: null,
  open_deferrals_prose: null,
  source: 'llm',
}

const MOCK_GATE_REDIRECT: SafetyGate = {
  __brand: 'safety_gate' as const,
  result: { redirect_message: 'Some redirect text' } as never,
  shouldRedirect: true,
}

const MOCK_GATE_PASS: SafetyGate = {
  __brand: 'safety_gate' as const,
  result: { redirect_message: null } as never,
  shouldRedirect: false,
}

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
// ============================================================================

let passCount = 0
let failCount = 0
const failures: string[] = []

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const ok = actual === expected
  assert(
    label,
    ok,
    ok ? undefined : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

// ============================================================================
// FT — Functional tests for the injection helpers (AC4 functional tests)
// ============================================================================

// FT-1, FT-2
assertEqual('FT-1  injectR3Disclaimer returns canonical R3 disclaimer', injectR3Disclaimer(), R3_DISCLAIMER)
assertEqual('FT-2  injectR3Disclaimer is idempotent', injectR3Disclaimer(), injectR3Disclaimer())

// FT-3
assertEqual('FT-3  injectR19Limitations returns canonical R19c link', injectR19Limitations(), R19C_LIMITATIONS_LINK)

// FT-4, FT-5
assertEqual('FT-4  injectR19MirrorPrinciple returns null when not mentor-flavoured', injectR19MirrorPrinciple(false), null)
assertEqual('FT-5  injectR19MirrorPrinciple returns canonical R19d when mentor-flavoured', injectR19MirrorPrinciple(true), R19D_MIRROR_PRINCIPLE)

// FT-6, FT-7, FT-8, FT-9
assertEqual('FT-6  injectR20aDistressPassthrough returns null on plain assessment (no distress)', injectR20aDistressPassthrough(MOCK_ASSESSMENT_PLAIN, MOCK_GATE_PASS), null)
assertEqual('FT-7  injectR20aDistressPassthrough returns canonical pass-through on SafetyGate.shouldRedirect=true', injectR20aDistressPassthrough(MOCK_ASSESSMENT_PLAIN, MOCK_GATE_REDIRECT), R20A_DISTRESS_PASSTHROUGH)
assertEqual('FT-8  injectR20aDistressPassthrough returns canonical pass-through on decision=ESCALATE', injectR20aDistressPassthrough(MOCK_ASSESSMENT_ESCALATE), R20A_DISTRESS_PASSTHROUGH)
assertEqual('FT-9  injectR20aDistressPassthrough returns canonical pass-through on distress_signal=true', injectR20aDistressPassthrough(MOCK_ASSESSMENT_DISTRESS_SIGNAL), R20A_DISTRESS_PASSTHROUGH)

// FT-10, FT-11
assertEqual('FT-10 injectR18aCategory returns null when include_category_framing=false', injectR18aCategory(false), null)
assertEqual('FT-11 injectR18aCategory returns canonical R18a when true', injectR18aCategory(true), R18A_CHARACTER_KERNEL_CATEGORY)

// FT-12
assertEqual('FT-12 injectR18eTransparencyNotice returns canonical R18e placeholder', injectR18eTransparencyNotice(), R18E_ARTICLE_50_TRANSPARENCY_NOTICE)

// ============================================================================
// AC9 — Layer2Decision projection checks
// ============================================================================

const responsePlain = applyLayer3Injections(
  {
    assessment: MOCK_ASSESSMENT_PLAIN,
    consumer_context: { consumer: 'api_reason' },
  },
  MOCK_PROSE
)
assertEqual('AC9-1 meta.decision = null when assessment.decision absent', responsePlain.meta.decision, null)
assertEqual('AC9-1b meta.distress_detected = false on plain assessment', responsePlain.meta.distress_detected, false)
assertEqual('AC9-1c injections.r20a_distress_passthrough = null on plain assessment', responsePlain.injections.r20a_distress_passthrough, null)

const responseEscalate = applyLayer3Injections(
  {
    assessment: MOCK_ASSESSMENT_ESCALATE,
    consumer_context: { consumer: 'api_reason' },
  },
  MOCK_PROSE
)
assertEqual('AC9-2 meta.decision = ESCALATE when assessment.decision = ESCALATE', responseEscalate.meta.decision, 'ESCALATE')
assertEqual('AC9-3 meta.distress_detected = true when decision = ESCALATE', responseEscalate.meta.distress_detected, true)
assertEqual('AC9-3b injections.r20a_distress_passthrough non-null when decision = ESCALATE', responseEscalate.injections.r20a_distress_passthrough, R20A_DISTRESS_PASSTHROUGH)

// ============================================================================
// AC10 — Provenance + use-policy tag projection
// ============================================================================

assertEqual('AC10-1 meta.provenance defaults to "generated" when absent', responsePlain.meta.provenance, 'generated')
assertEqual('AC10-2 meta.use_policies defaults to ["advisory"] when absent', JSON.stringify(responsePlain.meta.use_policies), JSON.stringify(['advisory']))

const responseWithTags = applyLayer3Injections(
  {
    assessment: MOCK_ASSESSMENT_WITH_TAGS,
    consumer_context: { consumer: 'api_reason' },
  },
  MOCK_PROSE
)
assertEqual('AC10-3 meta.provenance projects from assessment when present', responseWithTags.meta.provenance, 'inferred')
assertEqual('AC10-4 meta.use_policies projects from assessment when present', JSON.stringify(responseWithTags.meta.use_policies), JSON.stringify(['binding_within_session']))

// ============================================================================
// AC11 — OpenTelemetry span emission stub
// ============================================================================

assert('AC11-1 applyLayer3Injections returns a non-empty span_id', typeof responsePlain.meta.span_id === 'string' && responsePlain.meta.span_id.length > 0)
assert('AC11-2 span_id differs between independent calls (UUID-ish)', responsePlain.meta.span_id !== responseEscalate.meta.span_id)

// ============================================================================
// INV — Invariants
// ============================================================================

assertEqual('INV-1 Two identical inputs produce identical injection contents (R3)', responsePlain.injections.r3_disclaimer, applyLayer3Injections({ assessment: MOCK_ASSESSMENT_PLAIN, consumer_context: { consumer: 'api_reason' } }, MOCK_PROSE).injections.r3_disclaimer)
assertEqual('INV-2 R3 disclaimer text constant across calls', injectR3Disclaimer(), R3_DISCLAIMER)
assertEqual('INV-3 R20a pass-through text identical across signal sources (gate vs decision)', injectR20aDistressPassthrough(MOCK_ASSESSMENT_PLAIN, MOCK_GATE_REDIRECT), injectR20aDistressPassthrough(MOCK_ASSESSMENT_ESCALATE))
assertEqual('INV-3b R20a pass-through text identical across signal sources (decision vs distress_signal)', injectR20aDistressPassthrough(MOCK_ASSESSMENT_ESCALATE), injectR20aDistressPassthrough(MOCK_ASSESSMENT_DISTRESS_SIGNAL))

// ============================================================================
// Report
// ============================================================================

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
