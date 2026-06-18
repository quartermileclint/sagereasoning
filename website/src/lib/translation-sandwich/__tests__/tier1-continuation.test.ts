/**
 * tier1-continuation.test.ts — AC-13 Tier 1 clarification-continuation fix
 * (mechanism-correction Part A; ADR-008 §A, 2026-06-18).
 *
 * Plain-assertion script run with: npx tsx <this file>   (pure — no Supabase
 * chain; layer2-mechanisms + tier1-token are env/pure. The Layer-1 schema
 * fixtures are the harness's cached real extractions for F7/F8/F9, replayed
 * here — no Sonnet calls).
 *
 * WHAT IT PROVES (the load-bearing assertions of the fix):
 *   1. ENGINE SUPPRESSION — the answered trigger does NOT re-fire:
 *      - applyMechanisms(schema, { suppressTrigger: 'SCOPE_AMBIGUITY' }) on a
 *        scope-ambiguous schema (F8) returns a FULL assessment, not a halt.
 *      - applyMechanisms(schema, { suppressTrigger: 'TEMPORAL_AMBIGUITY' }) on a
 *        temporal-ambiguous schema (F9) returns a FULL assessment.
 *      - detectTier1Trigger(schema, 'ELEMENT_FUSION') on a fused schema (F7)
 *        returns null (the engine proceeds to Layer 2).
 *   2. ONLY THE ANSWERED TRIGGER IS SUPPRESSED — a DIFFERENT trigger still fires
 *      (ADR-008 §A.1: "a different Tier-1 trigger may still fire").
 *   3. BYTE-IDENTITY — suppressTrigger undefined ≡ no options ≡ pre-Part-A
 *      behaviour; suppressing a trigger that wasn't going to fire is inert.
 *   4. SAFETY (AC5) — composeContinuationDistressText folds the answer into the
 *      distress subject text, and returns `input` alone when there is no answer
 *      (the byte-identical flag-off path).
 *   5. ANSWER-INTO-CONTEXT — composeClarificationContext folds the answer for
 *      the Layer-1 re-extraction; no-op when there is no answer.
 *   6. FLAG — isTier1ContinuationEnabled reads the exact-'true' env var.
 *
 * NEGATIVE CONTROL throughout: every suppression assertion is paired with the
 * un-suppressed baseline proving the fixture really would have fired.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import type { Layer1Schema } from '../layer1-extractor'
import {
  applyMechanisms,
  detectTier1Trigger,
  type Layer2Assessment,
  type Tier1ShortCircuit,
} from '../layer2-mechanisms'
import {
  isTier1ContinuationEnabled,
  composeContinuationDistressText,
  composeClarificationContext,
  TIER1_TOKEN_CONFIG,
} from '../tier1-token'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

function isShortCircuit(
  x: Layer2Assessment | Tier1ShortCircuit,
): x is Tier1ShortCircuit {
  return 'tier1_trigger' in x
}

// ---------------------------------------------------------------------------
// Load the harness's cached REAL Layer-1 extractions (no Sonnet calls).
//   F7 → ELEMENT_FUSION (fused === true)
//   F8 → SCOPE_AMBIGUITY (Position 6 short-circuit)
//   F9 → TEMPORAL_AMBIGUITY (Position 2 short-circuit)
// These are the exact fixtures the verify-translation-sandwich harness uses to
// prove the triggers fire; replaying them keeps this test in lock-step.
// ---------------------------------------------------------------------------
const CACHE_DIR = join(__dirname, '../../../../scripts/.translation-sandwich-cache')
function loadSchema(fixtureId: string): Layer1Schema {
  const raw = readFileSync(join(CACHE_DIR, `layer1-${fixtureId}.json`), 'utf8')
  return JSON.parse(raw) as Layer1Schema
}
const F7 = loadSchema('F7') // element-fusion (fused === true)
const F9 = loadSchema('F9') // temporal-ambiguity (Position 2 short-circuit)
const F1 = loadSchema('F1') // baseline — no Tier 1 fires

// SCOPE_AMBIGUITY fixture. The cached raw layer1-F8.json is a stale capture
// whose extraction (a local_community circle + no praxis stage) no longer meets
// the current detectScopeAmbiguity conditions (the live harness regenerates F8).
// Derive a deterministic scope-firing schema from the real F8 base by meeting
// the detector's three documented conditions exactly (ADR-006 §3.10):
//   (a) an action present  — add a praxis-stage causal_stage_evidence entry
//   (b) an unspecified-other referent in evidence — "to them"
//   (c) no relational oikeiosis circle — empty circles
// Temporal is checked first (Position 2): the added evidence is past-anchored
// ("this morning"), so no future marker → TEMPORAL_AMBIGUITY does NOT pre-empt.
const F8base = loadSchema('F8')
const F8scope: Layer1Schema = {
  ...F8base,
  oikeiosis_circles_engaged: [],
  causal_stage_evidence: [
    ...F8base.causal_stage_evidence,
    { stage: 'praxis', evidence: 'I responded to them this morning the way I usually do' },
  ],
}

// ============================================================================
// 1. BASELINE — the fixtures really fire their triggers (negative control)
// ============================================================================

const f8Base = applyMechanisms(F8scope)
assert(
  isShortCircuit(f8Base) && f8Base.tier1_trigger.trigger_code === 'SCOPE_AMBIGUITY',
  'F8 baseline: applyMechanisms short-circuits SCOPE_AMBIGUITY (no suppression)',
)

const f9Base = applyMechanisms(F9)
assert(
  isShortCircuit(f9Base) && f9Base.tier1_trigger.trigger_code === 'TEMPORAL_AMBIGUITY',
  'F9 baseline: applyMechanisms short-circuits TEMPORAL_AMBIGUITY (no suppression)',
)

const f7Base = detectTier1Trigger(F7)
assert(
  f7Base !== null && f7Base.trigger_code === 'ELEMENT_FUSION',
  'F7 baseline: detectTier1Trigger fires ELEMENT_FUSION (no suppression)',
)

const f1Base = applyMechanisms(F1)
assert(!isShortCircuit(f1Base), 'F1 baseline: no Tier 1 — a full assessment')

// ============================================================================
// 2. SUPPRESSION — the answered trigger does NOT re-fire; full assessment runs
// ============================================================================

const f8Suppressed = applyMechanisms(F8scope, { suppressTrigger: 'SCOPE_AMBIGUITY' })
assert(
  !isShortCircuit(f8Suppressed),
  'F8 + suppress SCOPE_AMBIGUITY: full assessment (no re-fire)',
)
assert(
  !isShortCircuit(f8Suppressed) && 'improvement_path_structured' in f8Suppressed,
  'F8 + suppress SCOPE_AMBIGUITY: the assessment is a real Layer2Assessment',
)

const f9Suppressed = applyMechanisms(F9, { suppressTrigger: 'TEMPORAL_AMBIGUITY' })
assert(
  !isShortCircuit(f9Suppressed),
  'F9 + suppress TEMPORAL_AMBIGUITY: full assessment (no re-fire)',
)

const f7Suppressed = detectTier1Trigger(F7, 'ELEMENT_FUSION')
assert(
  f7Suppressed === null,
  'F7 + suppress ELEMENT_FUSION: detectTier1Trigger returns null (proceeds to Layer 2)',
)

// ============================================================================
// 3. ONLY THE ANSWERED TRIGGER IS SUPPRESSED — a different one still fires
// ============================================================================

const f8WrongSuppress = applyMechanisms(F8scope, { suppressTrigger: 'TEMPORAL_AMBIGUITY' })
assert(
  isShortCircuit(f8WrongSuppress) &&
    f8WrongSuppress.tier1_trigger.trigger_code === 'SCOPE_AMBIGUITY',
  'F8 + suppress TEMPORAL_AMBIGUITY: SCOPE_AMBIGUITY still fires (only the answered trigger is suppressed)',
)

const f9WrongSuppress = applyMechanisms(F9, { suppressTrigger: 'SCOPE_AMBIGUITY' })
assert(
  isShortCircuit(f9WrongSuppress) &&
    f9WrongSuppress.tier1_trigger.trigger_code === 'TEMPORAL_AMBIGUITY',
  'F9 + suppress SCOPE_AMBIGUITY: TEMPORAL_AMBIGUITY still fires',
)

const f7WrongSuppress = detectTier1Trigger(F7, 'SCOPE_AMBIGUITY')
assert(
  f7WrongSuppress !== null && f7WrongSuppress.trigger_code === 'ELEMENT_FUSION',
  'F7 + suppress SCOPE_AMBIGUITY: ELEMENT_FUSION still fires',
)

// ============================================================================
// 4. BYTE-IDENTITY — undefined ≡ no options; suppression is inert when the
//    trigger wasn't going to fire; determinism preserved under suppression
// ============================================================================

assert(
  JSON.stringify(applyMechanisms(F8scope)) === JSON.stringify(applyMechanisms(F8scope, undefined)),
  'byte-identity: applyMechanisms(F8scope) === applyMechanisms(F8scope, undefined)',
)
assert(
  JSON.stringify(detectTier1Trigger(F7)) === JSON.stringify(detectTier1Trigger(F7, undefined)),
  'byte-identity: detectTier1Trigger(F7) === detectTier1Trigger(F7, undefined)',
)
// Suppressing a trigger that wasn't going to fire (F1 — no Tier 1) does not
// change the assessment one byte.
assert(
  JSON.stringify(applyMechanisms(F1)) ===
    JSON.stringify(applyMechanisms(F1, { suppressTrigger: 'SCOPE_AMBIGUITY' })),
  'inert suppression: F1 assessment unchanged by an irrelevant suppressTrigger',
)
// Determinism preserved under suppression (the suppressed full assessment is
// itself reproducible — the verdict the signed sandwich would sign).
assert(
  JSON.stringify(applyMechanisms(F8scope, { suppressTrigger: 'SCOPE_AMBIGUITY' })) ===
    JSON.stringify(applyMechanisms(F8scope, { suppressTrigger: 'SCOPE_AMBIGUITY' })),
  'determinism: suppressed assessment is byte-reproducible',
)

// ============================================================================
// 5. SAFETY (AC5) — composeContinuationDistressText folds the answer
// ============================================================================

assert(
  composeContinuationDistressText('the situation', undefined) === 'the situation',
  'distress text: no answer → input alone (flag-off / first-turn parity)',
)
assert(
  composeContinuationDistressText('the situation', '') === 'the situation',
  'distress text: empty answer → input alone',
)
assert(
  composeContinuationDistressText('the situation', '   ') === 'the situation',
  'distress text: whitespace-only answer → input alone',
)
assert(
  composeContinuationDistressText('the situation', 'work, primarily') ===
    'the situation\n\nwork, primarily',
  'distress text: real answer → input + answer (the perimeter sees the answer)',
)

// ============================================================================
// 6. ANSWER-INTO-CONTEXT — composeClarificationContext folds the answer
// ============================================================================

assert(
  composeClarificationContext(undefined, undefined) === undefined,
  'context fold: no base, no answer → undefined (byte-identical)',
)
assert(
  composeClarificationContext('base context', undefined) === 'base context',
  'context fold: base, no answer → base unchanged (byte-identical)',
)
{
  const folded = composeClarificationContext(undefined, 'work, primarily')
  assert(
    typeof folded === 'string' && folded.includes('work, primarily'),
    'context fold: no base, answer → the answer note alone',
  )
}
{
  const folded = composeClarificationContext('base context', 'work, primarily')
  assert(
    typeof folded === 'string' &&
      folded.includes('base context') &&
      folded.includes('work, primarily'),
    'context fold: base + answer → both present (re-extraction is informed)',
  )
}

// ============================================================================
// 7. FLAG — isTier1ContinuationEnabled reads exact 'true'
// ============================================================================

const FLAG = TIER1_TOKEN_CONFIG.CONTINUATION_ENV_VAR
const savedFlag = process.env[FLAG]
delete process.env[FLAG]
assert(isTier1ContinuationEnabled() === false, 'flag unset → false (byte-identical default)')
process.env[FLAG] = 'false'
assert(isTier1ContinuationEnabled() === false, "flag 'false' → false")
process.env[FLAG] = 'TRUE'
assert(isTier1ContinuationEnabled() === false, "flag 'TRUE' (wrong case) → false (exact-string match)")
process.env[FLAG] = 'true'
assert(isTier1ContinuationEnabled() === true, "flag 'true' → true")
if (savedFlag === undefined) delete process.env[FLAG]
else process.env[FLAG] = savedFlag

// ============================================================================
// 8. ROUTE + ENGINE WIRING (source-grep, mirrors the AC4 INV pattern in
//    src/app/api/reason/__tests__/r20a-audience-rendering.test.ts).
//
//    The sections above prove the PURE functions. These prove the route and
//    engine actually CALL them in the right ORDER — the only failure mode tsc
//    cannot see (a future refactor silently dropping a threaded read or
//    reordering the perimeter). Folded from the Part-A pre-activation review:
//    W-1/W-3 close the AC5 distress-augmentation wiring guard (finding #1);
//    W-4/W-5 close the new 400 branches + their R9 billing split (#3/#5);
//    W-6/W-7 close the suppress threading route→runSandwich→engine (#6);
//    W-8 closes the CF-2 supplied-schema conflict-400 (cross-flag finding).
// ============================================================================

const ROUTE_SRC = readFileSync(
  join(__dirname, '../../../app/api/reason/route.ts'),
  'utf8',
)
const PARALLEL_RUN_SRC = readFileSync(join(__dirname, '../parallel-run.ts'), 'utf8')

// W-1 — the route imports the three continuation helpers from tier1-token.
assert(
  ROUTE_SRC.includes('isTier1ContinuationEnabled') &&
    ROUTE_SRC.includes('composeContinuationDistressText') &&
    ROUTE_SRC.includes('composeClarificationContext'),
  'W-1 route imports isTier1ContinuationEnabled + composeContinuationDistressText + composeClarificationContext',
)

// W-2 — the distress subject text is composed via the helper AND fed to the
// classifier (the single line realising AC5 "distress in the answer cannot
// escape the perimeter").
assert(
  ROUTE_SRC.includes('composeContinuationDistressText(') &&
    ROUTE_SRC.includes('detectDistressTwoStage(distressSubjectText)'),
  'W-2 route feeds composeContinuationDistressText result into detectDistressTwoStage (AC5 wiring)',
)

// W-3 — ORDERING: the distress check runs BEFORE continuation-token validation
// (AC5/§A.3 — the perimeter must precede token validation on every turn).
{
  // Match the CALL form `validateContinuationToken(` — the bare name also
  // appears in the import block at the top of the file (which would falsely
  // precede the body distress check).
  const distressIdx = ROUTE_SRC.indexOf('detectDistressTwoStage(distressSubjectText)')
  const tokenIdx = ROUTE_SRC.indexOf('validateContinuationToken(')
  assert(
    distressIdx !== -1 && tokenIdx !== -1 && distressIdx < tokenIdx,
    'W-3 distress check precedes validateContinuationToken (perimeter-before-token)',
  )
}

// W-4 — all four new 400 error codes are present (the structural-rejection
// contract: non-string, required, without-token, supplied-schema conflict).
for (const code of [
  'clarification_response must be a string',
  'clarification_response_required',
  'clarification_response_without_token',
  'clarification_response_with_supplied_layer1_schema',
]) {
  assert(ROUTE_SRC.includes(code), `W-4 route contains 400 branch: ${code}`)
}

// W-5 — R9 billing split: the token-bearing "required" branch is billed
// (post-perimeter client error, base rate); the two pre-substrate structural
// rejections are NOT billed. Region-scoped so the assertion is precise.
function regionAfter(src: string, marker: string, span = 600): string {
  const i = src.indexOf(marker)
  return i === -1 ? '' : src.slice(i, i + span)
}
assert(
  regionAfter(ROUTE_SRC, "error: 'clarification_response_required'").includes(
    'isBillable: true',
  ),
  'W-5a clarification_response_required → isBillable: true (post-perimeter client error, R9)',
)
assert(
  regionAfter(ROUTE_SRC, "error: 'clarification_response_without_token'").includes(
    'isBillable: false',
  ),
  'W-5b clarification_response_without_token → isBillable: false (pre-substrate)',
)
assert(
  regionAfter(
    ROUTE_SRC,
    "error: 'clarification_response_with_supplied_layer1_schema'",
  ).includes('isBillable: false'),
  'W-5c clarification_response_with_supplied_layer1_schema → isBillable: false (pre-substrate)',
)

// W-6 — the route threads the answered trigger into the engine call.
assert(
  ROUTE_SRC.includes('tier1SuppressTrigger,') &&
    ROUTE_SRC.includes('tier1SuppressTrigger = previousTrigger'),
  'W-6 route assigns tier1SuppressTrigger = previousTrigger and passes it to runSandwich',
)

// W-7 — ENGINE threading: parallel-run reads params.tier1SuppressTrigger into
// BOTH suppression sites. This is the exact tsc-invisible read a refactor could
// silently drop (the review's named failure mode).
assert(
  PARALLEL_RUN_SRC.includes('detectTier1Trigger(layer1Schema, params.tier1SuppressTrigger)'),
  'W-7a parallel-run threads params.tier1SuppressTrigger into detectTier1Trigger (ELEMENT_FUSION)',
)
assert(
  PARALLEL_RUN_SRC.includes('params.tier1SuppressTrigger !== undefined') &&
    PARALLEL_RUN_SRC.includes('suppressTrigger: params.tier1SuppressTrigger'),
  'W-7b parallel-run threads params.tier1SuppressTrigger into applyMechanisms (TEMPORAL/SCOPE)',
)

// W-8 — CF-2 ORDERING: the supplied-schema conflict-400 (preExtractedLayer1Schema
// guard) is checked BEFORE the trigger is suppressed — else the answer would be
// dropped while the engine proceeds on the still-ambiguous schema (false success).
{
  const cf2Idx = ROUTE_SRC.indexOf(
    'clarification_response_with_supplied_layer1_schema',
  )
  const suppressIdx = ROUTE_SRC.indexOf('tier1SuppressTrigger = previousTrigger')
  assert(
    cf2Idx !== -1 && suppressIdx !== -1 && cf2Idx < suppressIdx,
    'W-8 CF-2 supplied-schema 400 precedes tier1SuppressTrigger assignment (no false success)',
  )
  assert(
    regionAfter(ROUTE_SRC, 'clarification_response_with_supplied_layer1_schema', 80).length > 0 &&
      ROUTE_SRC.includes('preExtractedLayer1Schema !== undefined'),
    'W-8b CF-2 guard keys off preExtractedLayer1Schema !== undefined',
  )
}

// ============================================================================
// SUMMARY
// ============================================================================

console.log(`\n${passed} pass / ${failed} fail`)
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}
