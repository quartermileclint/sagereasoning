/**
 * verify-translation-sandwich.ts — verification harness for the translation-sandwich engine.
 *
 * Per ADR-004 §7 (Verification Harness — Decision C new harness) — sibling to
 * verify-reason-rag.ts (which continues unchanged for the bundled engine until M5).
 *
 * Per ADR-005 §8 (Standalone harness — Phase 1 + Phase 2 fixtures, M1-CP1).
 * Per ADR-006 §4 (Idempotency guarantee — Phase 3 + Phase 4 implementation, M1-CP2).
 *
 * Run from inside website/:
 *   npx tsx scripts/verify-translation-sandwich.ts
 *
 * Replay cached Layer 1 schemas (skip Sonnet calls):
 *   LAYER1_REPLAY_CACHE=1 npx tsx scripts/verify-translation-sandwich.ts
 *
 * Phases (per ADR-004 §7.2):
 *   Phase 1 — Layer 1 extraction completeness (M1-CP1)
 *   Phase 2 — Layer 1 schema fidelity (M1-CP1)
 *   Phase 3 — Layer 2 determinism (THIS SESSION, M1-CP2)
 *   Phase 4 — Layer 2 coverage (THIS SESSION, M1-CP2)
 *   Phase 5 — Layer 3 prose-assessment consistency (DEFERRED to M1-CP3; see ADR-004 §7.2)
 *   Phase 6 — End-to-end orchestration (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *   Phase 7 — R20a perimeter preservation (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *   Phase 8 — Fallback semantics (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *   Phase 9 — Cost + latency reporting (DEFERRED to M1-CP4; see ADR-004 §7.2)
 *
 * Cost note: Phase 1 + Phase 2 issue real Sonnet calls (4 fixtures). Per ADR-005
 * §8 the per-run cost is ~$0.10–0.40. Phase 3 + Phase 4 add NO LLM cost (Layer 2
 * is deterministic). Cached Layer 1 schemas at scripts/.translation-sandwich-cache/
 * (gitignored) let subsequent runs replay without re-calling Sonnet — set
 * LAYER1_REPLAY_CACHE=1 to use the cache. Do not run in a tight loop.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  extractFeatures,
  validateLayer1Schema,
  Layer1ValidationError,
  type Layer1Schema,
} from '../src/lib/translation-sandwich/layer1-extractor'

import {
  applyMechanisms,
  validateLayer2Assessment,
  type Layer2Assessment,
} from '../src/lib/translation-sandwich/layer2-mechanisms'

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

const REPLAY_CACHE = process.env.LAYER1_REPLAY_CACHE === '1'
const CACHE_DIR = join(__dirname, '.translation-sandwich-cache')

if (!REPLAY_CACHE) {
  const REQUIRED_ENV = ['ANTHROPIC_API_KEY']
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      console.error(`[env] MISSING required env var: ${key}`)
      process.exit(1)
    }
  }
  console.log(`[env] all required env vars present\n`)
} else {
  console.log(`[env] LAYER1_REPLAY_CACHE=1 — Phase 1+2 will replay cached schemas (no Sonnet calls)\n`)
}

// -----------------------------------------------------------------------------
// 1b. Layer 1 schema cache helpers (per ADR-006 §4 idempotency verification)
// -----------------------------------------------------------------------------

function ensureCacheDir(): void {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function cacheFilePath(fixtureId: string): string {
  return join(CACHE_DIR, `layer1-${fixtureId}.json`)
}

function loadCachedSchema(fixtureId: string): Layer1Schema | null {
  const path = cacheFilePath(fixtureId)
  if (!existsSync(path)) return null
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw)
    return validateLayer1Schema(parsed)
  } catch (err) {
    console.warn(
      `[cache] failed to load ${path}: ${err instanceof Error ? err.message : String(err)}`
    )
    return null
  }
}

function saveCachedSchema(fixtureId: string, schema: Layer1Schema): void {
  ensureCacheDir()
  const path = cacheFilePath(fixtureId)
  writeFileSync(path, JSON.stringify(schema, null, 2), 'utf8')
}

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

  // Replay cache path — skip Sonnet, load from disk
  if (REPLAY_CACHE) {
    const cached = loadCachedSchema(fixture.id)
    if (cached) {
      info(`  [cache] loaded ${fixture.id} from cache (no Sonnet call)`)
      return { fixture, schema: cached, latency_ms: Date.now() - start }
    }
    return {
      fixture,
      error: new Error(`LAYER1_REPLAY_CACHE=1 but cache file missing for ${fixture.id}; run without LAYER1_REPLAY_CACHE first to populate cache`),
      latency_ms: Date.now() - start,
    }
  }

  // Fresh extraction path — call Sonnet, save to cache on success
  try {
    const schema = await extractFeatures({ input: fixture.input })
    try {
      saveCachedSchema(fixture.id, schema)
    } catch (cacheErr) {
      // Cache-write failure is not fatal — Phase 3+4 use the in-memory schema
      info(
        `  [cache] write failed for ${fixture.id} (Phase 3+4 will still run): ${
          cacheErr instanceof Error ? cacheErr.message : String(cacheErr)
        }`
      )
    }
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

async function runPhase1AndPhase2(): Promise<FixtureResult[]> {
  console.log('=== PHASE 1 + PHASE 2 — Layer 1 extraction + schema fidelity ===\n')
  if (REPLAY_CACHE) {
    console.log(`Running ${FIXTURES.length} fixtures (REPLAY mode — no Sonnet calls)\n`)
  } else {
    console.log(`Running ${FIXTURES.length} fixtures (real Sonnet calls; per-run cost ~$0.10–0.40)\n`)
  }

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

  return results
}

// -----------------------------------------------------------------------------
// 5. Phase 3 — Layer 2 determinism (per ADR-004 §7.2 + ADR-006 §4)
// -----------------------------------------------------------------------------

interface Layer2FixtureResult {
  fixture: Fixture
  /** First applyMechanisms call result. */
  assessment_a?: Layer2Assessment
  /** Second applyMechanisms call result — must deep-equal assessment_a. */
  assessment_b?: Layer2Assessment
  error?: unknown
  layer2_latency_ms_a: number
  layer2_latency_ms_b: number
}

function runLayer2Twice(schema: Layer1Schema, fixture: Fixture): Layer2FixtureResult {
  const result: Layer2FixtureResult = {
    fixture,
    layer2_latency_ms_a: 0,
    layer2_latency_ms_b: 0,
  }
  try {
    const startA = Date.now()
    result.assessment_a = applyMechanisms(schema)
    result.layer2_latency_ms_a = Date.now() - startA

    const startB = Date.now()
    result.assessment_b = applyMechanisms(schema)
    result.layer2_latency_ms_b = Date.now() - startB
  } catch (err) {
    result.error = err
  }
  return result
}

function deepEqualByJSON(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function runPhase3(fixtureResults: FixtureResult[]): Layer2FixtureResult[] {
  console.log('=== PHASE 3 — Layer 2 determinism ===\n')

  const layer2Results: Layer2FixtureResult[] = []

  for (const fr of fixtureResults) {
    if (!fr.schema) {
      console.log(`--- ${fr.fixture.id} skipped (Phase 1+2 failed) ---\n`)
      continue
    }

    console.log(`--- ${fr.fixture.id} — ${fr.fixture.label} ---`)
    const l2 = runLayer2Twice(fr.schema, fr.fixture)
    layer2Results.push(l2)

    info(`  layer2_latency_ms a=${l2.layer2_latency_ms_a} b=${l2.layer2_latency_ms_b}`)

    // P3 assertion 1 — both calls completed without error
    check(
      `${fr.fixture.id}.P3 — applyMechanisms completes (no throw)`,
      l2.error === undefined && l2.assessment_a !== undefined && l2.assessment_b !== undefined,
      l2.error
        ? l2.error instanceof Error
          ? `${l2.error.name}: ${l2.error.message}`
          : String(l2.error)
        : undefined
    )

    if (!l2.assessment_a || !l2.assessment_b) {
      console.log()
      continue
    }

    // P3 assertion 2 — assessment_a is a valid Layer2Assessment (validator pass)
    let aValid = false
    let aValidErr = ''
    try {
      validateLayer2Assessment(JSON.parse(JSON.stringify(l2.assessment_a)))
      aValid = true
    } catch (err) {
      aValidErr = err instanceof Error ? err.message : String(err)
    }
    check(
      `${fr.fixture.id}.P3 — first call output validates`,
      aValid,
      aValidErr || undefined
    )

    // P3 assertion 3 — IDEMPOTENCY: assessment_a deep-equals assessment_b
    const equal = deepEqualByJSON(l2.assessment_a, l2.assessment_b)
    check(
      `${fr.fixture.id}.P3 — IDEMPOTENT (call A === call B by JSON)`,
      equal,
      equal
        ? undefined
        : 'assessment_a !== assessment_b — Layer 2 is non-deterministic; this is a hard fail'
    )

    // Diagnostics for founder review
    info(
      `  passions(${l2.assessment_a.passion_diagnosis.passions_detected.length}) ` +
        `cf_within(${l2.assessment_a.control_filter.within_prohairesis.length}) ` +
        `cf_outside(${l2.assessment_a.control_filter.outside_prohairesis.length}) ` +
        `cf_disambig(${l2.assessment_a.control_filter.disambiguation_required.length}) ` +
        `circles(${l2.assessment_a.oikeiosis.relevant_circles.length}) ` +
        `indifferents(${l2.assessment_a.value_assessment.indifferents_at_stake.length}) ` +
        `kathekon=${l2.assessment_a.kathekon_assessment.quality} ` +
        `senecan=${l2.assessment_a.iterative_refinement.senecan_grade} ` +
        `direction=${l2.assessment_a.iterative_refinement.direction_of_travel}`
    )
    info(
      `  proximity=${l2.assessment_a.katorthoma_proximity} ` +
        `virtues=[${l2.assessment_a.virtue_domains_engaged.join(',')}] ` +
        `improvement=${l2.assessment_a.improvement_path_structured ? l2.assessment_a.improvement_path_structured.mechanism_applies : 'null'} ` +
        `hasty_assent=${l2.assessment_a.hasty_assent_risk}`
    )
    if (l2.assessment_a.layer2_ambiguity_notes.length > 0) {
      l2.assessment_a.layer2_ambiguity_notes
        .slice(0, 3)
        .forEach((n, i) =>
          info(`  layer2_ambiguity_note[${i}]: ${n.length > 120 ? `${n.slice(0, 120)}…` : n}`)
        )
    }

    console.log()
  }

  return layer2Results
}

// -----------------------------------------------------------------------------
// 6. Phase 4 — Layer 2 coverage (per ADR-004 §7.2 + ADR-006 §"Phase 4")
// -----------------------------------------------------------------------------

function runPhase4(layer2Results: Layer2FixtureResult[]): void {
  console.log('=== PHASE 4 — Layer 2 coverage ===\n')
  console.log(
    'Each mechanism must produce non-empty/non-default output for at least one fixture.\n'
  )

  // Filter to results with assessment_a (skip Phase 3-failed fixtures)
  const usable = layer2Results.filter((r) => r.assessment_a !== undefined)

  if (usable.length === 0) {
    fail('Phase 4: no usable Phase 3 results — coverage cannot be asserted')
    totalChecks++
    return
  }

  // Per-mechanism coverage assertions
  const coverageChecks: Array<{
    label: string
    predicate: (a: Layer2Assessment) => boolean
  }> = [
    {
      label: 'control_filter.within_prohairesis non-empty',
      predicate: (a) => a.control_filter.within_prohairesis.length >= 1,
    },
    {
      label: 'control_filter.outside_prohairesis non-empty',
      predicate: (a) => a.control_filter.outside_prohairesis.length >= 1,
    },
    {
      label: 'passion_diagnosis.passions_detected non-empty',
      predicate: (a) => a.passion_diagnosis.passions_detected.length >= 1,
    },
    {
      label: 'oikeiosis.relevant_circles non-empty',
      predicate: (a) => a.oikeiosis.relevant_circles.length >= 1,
    },
    {
      label: 'value_assessment.indifferents_at_stake non-empty',
      predicate: (a) => a.value_assessment.indifferents_at_stake.length >= 1,
    },
    {
      label: 'kathekon_assessment.quality non-contrary',
      predicate: (a) => a.kathekon_assessment.quality !== 'contrary',
    },
    {
      label: 'iterative_refinement.senecan_grade computed',
      predicate: (a) =>
        ['pre_progress', 'grade_1', 'grade_2', 'grade_3'].includes(
          a.iterative_refinement.senecan_grade
        ),
    },
    {
      label: 'virtue_domains_engaged non-empty',
      predicate: (a) => a.virtue_domains_engaged.length >= 1,
    },
    {
      label: 'improvement_path_structured non-null',
      predicate: (a) => a.improvement_path_structured !== null,
    },
    {
      label: 'hasty_assent_risk non-none',
      predicate: (a) => a.hasty_assent_risk !== 'none',
    },
    {
      label: 'katorthoma_proximity classified',
      predicate: (a) =>
        ['reflexive', 'habitual', 'deliberate', 'principled', 'sage_like'].includes(
          a.katorthoma_proximity
        ),
    },
  ]

  for (const cc of coverageChecks) {
    const matchingFixtures = usable
      .filter((r) => cc.predicate(r.assessment_a!))
      .map((r) => r.fixture.id)
    const passed = matchingFixtures.length >= 1
    check(
      `P4 — ${cc.label}`,
      passed,
      passed ? `(satisfied by: ${matchingFixtures.join(', ')})` : '(NOT satisfied by any fixture)'
    )
  }

  console.log()
}

// -----------------------------------------------------------------------------
// 7. Phase 5+ stubs (DEFERRED to later checkpoints per ADR-004 §7.2)
// -----------------------------------------------------------------------------

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
  console.log('verify-translation-sandwich.ts — M1-CP2 standalone harness')
  console.log('Per ADR-004 §7 + ADR-005 §8 + ADR-006 §4\n')

  const fixtureResults = await runPhase1AndPhase2()
  const layer2Results = runPhase3(fixtureResults)
  runPhase4(layer2Results)

  console.log('=== PHASES 5–9 (DEFERRED) ===\n')
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
    console.log('ALL CHECKS PASSED (Phase 1 + Phase 2 + Phase 3 + Phase 4)')
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
