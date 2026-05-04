/**
 * verify-translation-sandwich.ts — verification harness for the translation-sandwich engine.
 *
 * Per ADR-004 §7 (Verification Harness — Decision C new harness) — sibling to
 * verify-reason-rag.ts (which continues unchanged for the bundled engine until M5).
 *
 * Per ADR-005 §8 (Standalone harness — Phase 1 + Phase 2 fixtures, M1-CP1).
 *
 * Run from inside website/:
 *   npx tsx scripts/verify-translation-sandwich.ts
 *
 * Phases (per ADR-004 §7.2):
 *   Phase 1 — Layer 1 extraction completeness (THIS SESSION, M1-CP1)
 *   Phase 2 — Layer 1 schema fidelity (THIS SESSION, M1-CP1)
 *   Phase 3 — Layer 2 determinism (DEFERRED to M1-CP2; see ADR-004 §7.2)
 *   Phase 4 — Layer 2 coverage (DEFERRED to M1-CP2; see ADR-004 §7.2)
 *   Phase 5 — Layer 3 prose-assessment consistency (DEFERRED to M1-CP3; see ADR-004 §7.2)
 *   Phase 6 — End-to-end orchestration (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *   Phase 7 — R20a perimeter preservation (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *   Phase 8 — Fallback semantics (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *   Phase 9 — Cost + latency reporting (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *
 * Cost note: Phase 1 + Phase 2 issue real Sonnet calls (4 fixtures). Per ADR-005
 * §8 the per-run cost is ~$0.10–0.40. Do not run in a tight loop.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  extractFeatures,
  validateLayer1Schema,
  Layer1ValidationError,
  type Layer1Schema,
} from '../src/lib/translation-sandwich/layer1-extractor'

// -----------------------------------------------------------------------------
// 1. Load .env.local manually (no dotenv dep) — same pattern as verify-reason-rag.ts
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ENV_LOCAL_PATH = join(__dirname, '..', '.env.local')

function loadEnvFile(path: string): void {
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

try {
  loadEnvFile(ENV_LOCAL_PATH)
  console.log(`[env] loaded ${ENV_LOCAL_PATH}`)
} catch (err) {
  console.error(`[env] FAILED to load ${ENV_LOCAL_PATH}:`, err)
  process.exit(1)
}

const REQUIRED_ENV = ['ANTHROPIC_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[env] MISSING required env var: ${key}`)
    process.exit(1)
  }
}
console.log(`[env] all required env vars present\n`)

// -----------------------------------------------------------------------------
// 2. Output helpers
// -----------------------------------------------------------------------------

let totalChecks = 0
let passedChecks = 0

function ok(message: string): void {
  passedChecks++
  console.log(`  [PASS] ${message}`)
}

function fail(message: string): void {
  console.log(`  [FAIL] ${message}`)
}

function info(message: string): void {
  console.log(`  [INFO] ${message}`)
}

function check(message: string, condition: boolean, detail?: string): void {
  totalChecks++
  if (condition) {
    ok(message)
  } else {
    fail(detail ? `${message} — ${detail}` : message)
  }
}

// -----------------------------------------------------------------------------
// 3. Fixtures (per ADR-005 §8.1)
// -----------------------------------------------------------------------------

interface Fixture {
  /** Identifier (F1–F4). */
  id: string
  /** Short label for output. */
  label: string
  /** The agent input — what the LLM extracts from. */
  input: string
  /** Expected non-empty categories per ADR-005 §8.2. Used in Phase 1 assertions. */
  expected_non_empty: Array<keyof Layer1Schema>
  /** Categories where empty is acceptable (e.g., F3's passions_present). */
  expected_optional: Array<keyof Layer1Schema>
}

const FIXTURES: Fixture[] = [
  {
    id: 'F1',
    label: 'Simple control-filter case',
    input:
      "I keep checking my phone to see if she's replied. I sent the message two hours ago and she still hasn't read it. I don't know what to do.",
    expected_non_empty: [
      'passions_present',
      'control_filter_elements',
      'oikeiosis_circles_engaged',
      'causal_stage_evidence',
    ],
    expected_optional: ['value_categories_at_stake', 'kathekon_factors', 'urgency_indicators'],
  },
  {
    id: 'F2',
    label: 'Multi-passion case',
    input:
      "I should have spoken up at the meeting today. Everyone else got credit for the work I led, and now I look weak in front of the team. But part of me is also relieved I didn't argue — I hate confrontation.",
    expected_non_empty: [
      'passions_present',
      'control_filter_elements',
      'oikeiosis_circles_engaged',
      'value_categories_at_stake',
      'causal_stage_evidence',
    ],
    expected_optional: ['kathekon_factors', 'urgency_indicators'],
  },
  {
    id: 'F3',
    label: 'Multi-circle obligation conflict',
    input:
      "My mother needs me at home this weekend, but I promised the volunteer group I'd be at the community event. I can't be in two places. I keep going back and forth on which obligation matters more.",
    expected_non_empty: [
      'control_filter_elements',
      'oikeiosis_circles_engaged',
      'kathekon_factors',
      'causal_stage_evidence',
    ],
    expected_optional: ['passions_present', 'value_categories_at_stake', 'urgency_indicators'],
  },
  {
    id: 'F4',
    label: 'Urgency-pressured case',
    input:
      "I have to send the contract back today or the deal falls through. I haven't had time to read it properly but everyone's pressing me. Just sign and move on, that's what they're saying.",
    expected_non_empty: [
      'passions_present',
      'control_filter_elements',
      'urgency_indicators',
      'kathekon_factors',
      'causal_stage_evidence',
    ],
    expected_optional: ['oikeiosis_circles_engaged', 'value_categories_at_stake'],
  },
]

// -----------------------------------------------------------------------------
// 4. Phase 1 + Phase 2 — Layer 1 extraction completeness + schema fidelity
// -----------------------------------------------------------------------------

interface FixtureResult {
  fixture: Fixture
  /** undefined if extractFeatures threw (which doubles as a Phase 2 fail). */
  schema?: Layer1Schema
  error?: unknown
  latency_ms: number
}

async function runFixture(fixture: Fixture): Promise<FixtureResult> {
  const start = Date.now()
  try {
    const schema = await extractFeatures({ input: fixture.input })
    return { fixture, schema, latency_ms: Date.now() - start }
  } catch (err) {
    return { fixture, error: err, latency_ms: Date.now() - start }
  }
}

function diagnoseSchema(schema: Layer1Schema): void {
  // Per-category counts so the founder can review fixture diagnostics.
  info(
    `  passions_present(${schema.passions_present.length}) ` +
      `control_filter_elements(${schema.control_filter_elements.length}) ` +
      `oikeiosis_circles_engaged(${schema.oikeiosis_circles_engaged.length}) ` +
      `value_categories_at_stake(${schema.value_categories_at_stake.length}) ` +
      `kathekon_factors(${schema.kathekon_factors.length}) ` +
      `urgency_indicators(${schema.urgency_indicators.length}) ` +
      `causal_stage_evidence(${schema.causal_stage_evidence.length}) ` +
      `ambiguity_notes(${schema.ambiguity_notes.length})`
  )
  if (schema.passions_present.length > 0) {
    const summary = schema.passions_present
      .map((p) => `${p.root_passion}/${p.sub_species ?? '(none)'}`)
      .join(', ')
    info(`  passions: ${summary}`)
  }
  if (schema.oikeiosis_circles_engaged.length > 0) {
    info(
      `  circles: ${schema.oikeiosis_circles_engaged.map((c) => c.circle).join(', ')}`
    )
  }
  if (schema.urgency_indicators.length > 0) {
    info(
      `  urgency: ${schema.urgency_indicators.map((u) => u.signal_type).join(', ')}`
    )
  }
  if (schema.ambiguity_notes.length > 0) {
    schema.ambiguity_notes.slice(0, 3).forEach((n, i) =>
      info(`  ambiguity_note[${i}]: ${n.length > 120 ? `${n.slice(0, 120)}…` : n}`)
    )
  }
}

async function runPhase1AndPhase2(): Promise<void> {
  console.log('=== PHASE 1 + PHASE 2 — Layer 1 extraction + schema fidelity ===\n')
  console.log(`Running ${FIXTURES.length} fixtures (real Sonnet calls; per-run cost ~$0.10–0.40)\n`)

  const results: FixtureResult[] = []
  for (const fixture of FIXTURES) {
    console.log(`--- ${fixture.id} — ${fixture.label} ---`)
    info(`  input.length=${fixture.input.length}`)
    const result = await runFixture(fixture)
    results.push(result)
    info(`  latency_ms=${result.latency_ms}`)

    // Phase 2 — schema fidelity (extractFeatures internally validates; a throw is the fail signal)
    check(
      `${fixture.id}.P2 — extractFeatures completes (no parse / schema-validation throw)`,
      result.schema !== undefined,
      result.error
        ? result.error instanceof Layer1ValidationError
          ? `Layer1ValidationError category=${result.error.category} field=${result.error.field ?? 'n/a'}: ${result.error.message}`
          : result.error instanceof Error
            ? `${result.error.name}: ${result.error.message}`
            : String(result.error)
        : undefined
    )

    if (!result.schema) {
      console.log()
      continue
    }

    // Phase 2 — version
    check(
      `${fixture.id}.P2 — version === 'layer1-schema-v1'`,
      result.schema.version === 'layer1-schema-v1'
    )

    // Phase 2 — re-validation roundtrip (JSON.stringify → JSON.parse → validateLayer1Schema)
    let roundtripOk = false
    let roundtripDetail = ''
    try {
      const reparsed = JSON.parse(JSON.stringify(result.schema))
      validateLayer1Schema(reparsed)
      roundtripOk = true
    } catch (err) {
      roundtripDetail = err instanceof Error ? err.message : String(err)
    }
    check(
      `${fixture.id}.P2 — JSON roundtrip re-validates`,
      roundtripOk,
      roundtripDetail || undefined
    )

    // Diagnostics for founder review
    diagnoseSchema(result.schema)

    // Phase 1 — expected non-empty categories
    for (const category of fixture.expected_non_empty) {
      const arr = result.schema[category] as unknown[]
      check(
        `${fixture.id}.P1 — ${String(category)} non-empty`,
        Array.isArray(arr) && arr.length > 0,
        Array.isArray(arr) ? `length=${arr.length}` : 'not an array'
      )
    }

    // Phase 1 — optional categories noted (not asserted)
    for (const category of fixture.expected_optional) {
      const arr = result.schema[category] as unknown[]
      info(
        `  ${fixture.id}.P1 — ${String(category)} (optional) length=${
          Array.isArray(arr) ? arr.length : 'n/a'
        }`
      )
    }

    console.log()
  }

  // Summary table
  console.log('--- Phase 1 + Phase 2 fixture summary ---')
  for (const r of results) {
    const status = r.schema ? 'OK' : 'FAIL'
    console.log(
      `  ${r.fixture.id} ${status.padEnd(4)} latency_ms=${r.latency_ms.toString().padStart(5)} ` +
        `${r.fixture.label}`
    )
  }
  console.log()
}

// -----------------------------------------------------------------------------
// 5. Phase 3+ stubs (DEFERRED to later checkpoints per ADR-004 §7.2)
// -----------------------------------------------------------------------------

function runPhase3Stub(): void {
  // TODO: M1-CP2 — see ADR-004 §7.2
  // Layer 2 determinism: for each fixture, run applyMechanisms twice with the same
  // Layer 1 input; outputs deep-equal.
  console.log('[SKIP] Phase 3 (Layer 2 determinism) — DEFERRED to M1-CP2; see ADR-004 §7.2')
}

function runPhase4Stub(): void {
  // TODO: M1-CP2 — see ADR-004 §7.2
  // Layer 2 coverage: every mechanism produces output for at least one fixture; no mechanism silently absent.
  console.log('[SKIP] Phase 4 (Layer 2 coverage) — DEFERRED to M1-CP2; see ADR-004 §7.2')
}

function runPhase5Stub(): void {
  // TODO: M1-CP3 — see ADR-004 §7.2
  // Layer 3 prose-assessment consistency: extract claims from prose; check each against Layer 2 assessment.
  console.log('[SKIP] Phase 5 (Layer 3 consistency) — DEFERRED to M1-CP3; see ADR-004 §7.2')
}

function runPhase6Stub(): void {
  // TODO: M1-CP4 — see ADR-004 §7.2
  // End-to-end orchestration: Layer 1 → Layer 2 → Layer 3 composes correctly; route response shape matches §2.1.
  console.log('[SKIP] Phase 6 (end-to-end orchestration) — DEFERRED to M1-CP4; see ADR-004 §7.2')
}

function runPhase7Stub(): void {
  // TODO: M1-CP4 — see ADR-004 §7.2
  // R20a perimeter preservation: distress check at /api/reason line 144 fires once per request before any layer.
  // Verified by AC4 invocation testing (grep + execution path proof).
  console.log('[SKIP] Phase 7 (R20a perimeter preservation) — DEFERRED to M1-CP4; see ADR-004 §7.2')
}

function runPhase8Stub(): void {
  // TODO: M1-CP4 — see ADR-004 §7.2
  // Fallback semantics: Layer 1 throws → bundled-depth result. Layer 3 throws → bundled-depth result.
  console.log('[SKIP] Phase 8 (fallback semantics) — DEFERRED to M1-CP4; see ADR-004 §7.2')
}

function runPhase9Stub(): void {
  // TODO: M1-CP4 — see ADR-004 §7.2
  // Cost + latency reporting: per-layer latency, total latency, per-layer cost estimate, total cost estimate.
  // Output is the data for the cutover decision at M1-CP5.
  console.log('[SKIP] Phase 9 (cost + latency reporting) — DEFERRED to M1-CP4; see ADR-004 §7.2')
}

// -----------------------------------------------------------------------------
// 6. main()
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('verify-translation-sandwich.ts — M1-CP1 standalone harness')
  console.log('Per ADR-004 §7 + ADR-005 §8\n')

  await runPhase1AndPhase2()

  console.log('=== PHASES 3–9 (DEFERRED) ===\n')
  runPhase3Stub()
  runPhase4Stub()
  runPhase5Stub()
  runPhase6Stub()
  runPhase7Stub()
  runPhase8Stub()
  runPhase9Stub()
  console.log()

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------

  console.log('---')
  console.log(`SUMMARY: ${passedChecks} / ${totalChecks} checks passed`)
  if (passedChecks === totalChecks) {
    console.log('ALL CHECKS PASSED (Phase 1 + Phase 2)')
    process.exit(0)
  } else {
    console.log(`FAILED: ${totalChecks - passedChecks} check(s) did not pass`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('\n[FATAL] Unhandled error in main():')
  console.error(err)
  process.exit(1)
})
