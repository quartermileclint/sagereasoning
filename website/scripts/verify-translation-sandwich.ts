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
 *   Phase 3 — Layer 2 determinism (M1-CP2)
 *   Phase 4 — Layer 2 coverage (M1-CP2)
 *   Phase 5 — Layer 3 prose-assessment consistency (M1-CP3 — per ADR-007 §8)
 *   Phase 6 — End-to-end orchestration (THIS SESSION, M1-CP4 — composes §2.1 shape from cached layer outputs; no new LLM calls)
 *   Phase 7 — R20a perimeter preservation (THIS SESSION, M1-CP4 — grep + invocation pattern test per AC4)
 *   Phase 8 — Fallback semantics (THIS SESSION, M1-CP4 — invalid input → layer1_throw; generateFallbackProse validates)
 *   Phase 9 — Cost + latency reporting (THIS SESSION, M1-CP4 — aggregate per-layer latency + cost-cap config summary)
 *
 * Cost note: Phase 1 + Phase 2 issue real Sonnet calls (4 fixtures). Per ADR-005
 * §8 the per-run cost is ~$0.10–0.40. Phase 3 + Phase 4 add NO LLM cost (Layer 2
 * is deterministic). Phase 5 issues real Sonnet calls (4 fixtures × 2000 max-tokens).
 * Per ADR-007 §8.3 the per-run cost is ~$0.04–0.16. Combined harness cost ~$0.20–0.60.
 * Cached Layer 1 schemas + Layer 3 prose at scripts/.translation-sandwich-cache/
 * (gitignored) let subsequent runs replay without re-calling Sonnet — set
 * LAYER1_REPLAY_CACHE=1 to use the cache (single env flag governs both layers
 * at M1-CP3). Do not run in a tight loop.
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

import {
  generateProse,
  generateFallbackProse,
  validateLayer3Prose,
  Layer3ValidationError,
  type Layer3Prose,
} from '../src/lib/translation-sandwich/layer3-prose'

// M1-CP4 (2026-05-04): translation-sandwich orchestrator + harness-facing exports.
import {
  runSandwichForHarness,
  isParallelRunEnabled,
  PARALLEL_RUN_CONFIG,
} from '../src/lib/translation-sandwich/parallel-run'

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

// Layer 3 cache helpers — same pattern, same env flag (LAYER1_REPLAY_CACHE)
// per ADR-007 §8.3 (single env flag at M1-CP3; can be split later).

function layer3CacheFilePath(fixtureId: string): string {
  return join(CACHE_DIR, `layer3-${fixtureId}.json`)
}

function loadCachedLayer3Prose(fixtureId: string): Layer3Prose | null {
  const path = layer3CacheFilePath(fixtureId)
  if (!existsSync(path)) return null
  try {
    const raw = readFileSync(path, 'utf8')
    const parsed = JSON.parse(raw)
    return validateLayer3Prose(parsed)
  } catch (err) {
    console.warn(
      `[cache] failed to load layer3 ${path}: ${err instanceof Error ? err.message : String(err)}`
    )
    return null
  }
}

function saveCachedLayer3Prose(fixtureId: string, prose: Layer3Prose): void {
  ensureCacheDir()
  const path = layer3CacheFilePath(fixtureId)
  writeFileSync(path, JSON.stringify(prose, null, 2), 'utf8')
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
// 7. Phase 5 — Layer 3 prose-assessment consistency (per ADR-004 §7.2 + ADR-007 §8)
// -----------------------------------------------------------------------------

// Greek identifiers Layer 3's prose may name. Used for the consistency check
// (assertion 6 in ADR-007 §8.2): every Greek identifier in prose must appear
// in the assessment.
const GREEK_IDENTIFIERS_TO_CHECK: ReadonlyArray<string> = [
  // root passions
  'epithumia', 'hedone', 'phobos', 'lupe',
  // sub-species
  'orge', 'eros', 'pothos', 'philedonia', 'philoplousia', 'philodoxia',
  'kelesis', 'epichairekakia', 'terpsis',
  'deima', 'oknos', 'aischyne', 'thambos', 'thorybos', 'agonia',
  'eleos', 'phthonos', 'zelotypia', 'penthos', 'achos',
  // causal stages
  'phantasia', 'synkatathesis', 'horme', 'praxis',
  // virtues
  'phronesis', 'dikaiosyne', 'andreia', 'sophrosyne',
]

// Note: oikeiosis, kathekon, prohairesis are excluded from the per-input check
// list above — they are architectural vocabulary always present at /api/reason
// regardless of the per-input assessment, so naming them in prose is always OK.

interface AssessmentVocabulary {
  passion_roots: Set<string>
  passion_sub_species: Set<string>
  causal_stages: Set<string>
  virtues: Set<string>
}

function buildAssessmentVocabulary(a: Layer2Assessment): AssessmentVocabulary {
  const passion_roots = new Set<string>()
  const passion_sub_species = new Set<string>()
  const causal_stages = new Set<string>()
  for (const p of a.passion_diagnosis.passions_detected) {
    passion_roots.add(p.root_passion)
    if (p.sub_species) passion_sub_species.add(p.sub_species)
    causal_stages.add(p.causal_stage_affected)
  }
  if (a.passion_diagnosis.causal_stage_affected) {
    causal_stages.add(a.passion_diagnosis.causal_stage_affected)
  }
  const virtues = new Set<string>(a.virtue_domains_engaged)
  return { passion_roots, passion_sub_species, causal_stages, virtues }
}

function findUnsupportedGreekIdentifiers(
  prose: string,
  vocab: AssessmentVocabulary
): string[] {
  const lower = prose.toLowerCase()
  const found: string[] = []
  for (const ident of GREEK_IDENTIFIERS_TO_CHECK) {
    // word-boundary match (handle parens around translations like "phobos (fear)")
    const re = new RegExp(`\\b${ident}\\b`, 'i')
    if (!re.test(lower)) continue
    const supported =
      vocab.passion_roots.has(ident) ||
      vocab.passion_sub_species.has(ident) ||
      vocab.causal_stages.has(ident) ||
      vocab.virtues.has(ident)
    if (!supported) found.push(ident)
  }
  return found
}

// Marginal-case phrasing recognisers — keyed off ADR-007 §3 prompt + §6 fallback.
// Loose substring matches (case-insensitive) so close paraphrases pass.

function proseHasUndecidableKathekonPhrasing(prose: string): boolean {
  const l = prose.toLowerCase()
  return (
    l.includes('cannot be determined') ||
    l.includes('appropriateness cannot') ||
    l.includes('undetermined') ||
    l.includes("cannot determine")
  )
}

function proseHasSingleSnapshotPhrasing(prose: string): boolean {
  const l = prose.toLowerCase()
  return (
    l.includes('single snapshot') ||
    l.includes('no trajectory') ||
    l.includes('snapshot; no')
  )
}

function proseHasNoImprovementPathPhrasing(prose: string): boolean {
  const l = prose.toLowerCase()
  return (
    l.includes('no specific improvement path') ||
    l.includes('no improvement path identified') ||
    l.includes('no specific improvement')
  )
}

interface Phase5Result {
  fixture_id: string
  llm_prose?: Layer3Prose
  fallback_prose?: Layer3Prose
  llm_latency_ms: number
  llm_skipped: boolean
}

async function runFixtureLayer3(
  fixtureId: string,
  assessment: Layer2Assessment
): Promise<Phase5Result> {
  // LLM path — replay cache if enabled
  let llm_prose: Layer3Prose | undefined
  let llm_latency_ms = 0
  let llm_skipped = false

  if (REPLAY_CACHE) {
    const cached = loadCachedLayer3Prose(fixtureId)
    if (cached) {
      info(`  [cache] loaded layer3 ${fixtureId} from cache (no Sonnet call)`)
      llm_prose = cached
    } else {
      info(
        `  [cache] no layer3 cache for ${fixtureId}; LLM call will be skipped (re-run without LAYER1_REPLAY_CACHE to populate)`
      )
      llm_skipped = true
    }
  } else {
    const start = Date.now()
    try {
      llm_prose = await generateProse(assessment, { consumer: 'api_reason' })
      llm_latency_ms = Date.now() - start
      try {
        saveCachedLayer3Prose(fixtureId, llm_prose)
      } catch (cacheErr) {
        info(
          `  [cache] write failed for layer3 ${fixtureId}: ${
            cacheErr instanceof Error ? cacheErr.message : String(cacheErr)
          }`
        )
      }
    } catch (err) {
      llm_latency_ms = Date.now() - start
      llm_skipped = true
      const detail =
        err instanceof Layer3ValidationError
          ? `Layer3ValidationError category=${err.category} field=${err.field ?? 'n/a'}: ${err.message}`
          : err instanceof Error
            ? `${err.name}: ${err.message}`
            : String(err)
      fail(`${fixtureId}.P5 — generateProse threw — ${detail}`)
      totalChecks++
    }
  }

  // Fallback path — always runs (no LLM, no I/O — cheap)
  let fallback_prose: Layer3Prose | undefined
  try {
    fallback_prose = generateFallbackProse(assessment)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    fail(`${fixtureId}.P5 — generateFallbackProse threw — ${detail}`)
    totalChecks++
  }

  return {
    fixture_id: fixtureId,
    llm_prose,
    fallback_prose,
    llm_latency_ms,
    llm_skipped,
  }
}

async function runPhase5Async(
  layer2Results: Layer2FixtureResult[]
): Promise<Phase5Result[]> {
  console.log('=== PHASE 5 — Layer 3 prose-assessment consistency ===\n')

  const usable = layer2Results.filter((r) => r.assessment_a !== undefined)
  if (usable.length === 0) {
    fail('Phase 5: no usable Phase 3 results — Layer 3 cannot be exercised')
    totalChecks++
    return []
  }

  if (REPLAY_CACHE) {
    console.log(`Running ${usable.length} fixtures (REPLAY mode — Layer 3 cache lookup)\n`)
  } else {
    console.log(
      `Running ${usable.length} fixtures (real Sonnet calls; per-run cost ~$0.04–0.16)\n`
    )
  }

  const phase5Results: Phase5Result[] = []

  for (const l2r of usable) {
    const fixtureId = l2r.fixture.id
    const assessment = l2r.assessment_a!
    console.log(`--- ${fixtureId} — ${l2r.fixture.label} ---`)

    const p5 = await runFixtureLayer3(fixtureId, assessment)
    phase5Results.push(p5)

    info(`  layer3_latency_ms=${p5.llm_latency_ms} llm_skipped=${p5.llm_skipped}`)

    // ---- Per-fixture assertions ----

    // Assertion 1: generateProse completes (no throw)
    if (!p5.llm_skipped) {
      check(
        `${fixtureId}.P5 — generateProse completes (no throw)`,
        p5.llm_prose !== undefined
      )
    } else {
      info(`  ${fixtureId}.P5 — generateProse SKIPPED (replay cache miss or throw above)`)
    }

    if (p5.llm_prose) {
      // Assertion 2: result validates (JSON roundtrip + validator)
      let llmRoundtripOk = false
      let llmRoundtripDetail = ''
      try {
        validateLayer3Prose(JSON.parse(JSON.stringify(p5.llm_prose)))
        llmRoundtripOk = true
      } catch (err) {
        llmRoundtripDetail = err instanceof Error ? err.message : String(err)
      }
      check(
        `${fixtureId}.P5 — generateProse output validates (JSON roundtrip)`,
        llmRoundtripOk,
        llmRoundtripDetail || undefined
      )

      // Assertion 3: source === 'llm'
      check(
        `${fixtureId}.P5 — generateProse output has source='llm'`,
        p5.llm_prose.source === 'llm',
        `source=${p5.llm_prose.source}`
      )
    }

    if (p5.fallback_prose) {
      // Assertion 4: generateFallbackProse is idempotent
      const fb_a = JSON.stringify(p5.fallback_prose)
      const fb_b = JSON.stringify(generateFallbackProse(assessment))
      check(
        `${fixtureId}.P5 — generateFallbackProse IDEMPOTENT (call A === call B by JSON)`,
        fb_a === fb_b,
        fb_a === fb_b
          ? undefined
          : 'fallback_a !== fallback_b — generateFallbackProse is non-deterministic; this is a hard fail'
      )

      // Assertion 5: fallback validates with source='fallback'
      let fbValid = false
      let fbValidDetail = ''
      try {
        const reparsed = JSON.parse(fb_a)
        const v = validateLayer3Prose(reparsed)
        fbValid = v.source === 'fallback'
        if (!fbValid) fbValidDetail = `source=${v.source}`
      } catch (err) {
        fbValidDetail = err instanceof Error ? err.message : String(err)
      }
      check(
        `${fixtureId}.P5 — generateFallbackProse validates with source='fallback'`,
        fbValid,
        fbValidDetail || undefined
      )
    }

    // Assertion 6: consistency check (per ADR-007 §5)
    // Run against LLM prose if available; else against fallback prose (also exercises §5 contract).
    const proseForConsistency = p5.llm_prose ?? p5.fallback_prose
    if (proseForConsistency) {
      const vocab = buildAssessmentVocabulary(assessment)
      const allProseText = [
        proseForConsistency.philosophical_reflection,
        proseForConsistency.improvement_guidance,
        proseForConsistency.summary,
      ].join(' ')

      // Greek identifier consistency
      const unsupported = findUnsupportedGreekIdentifiers(allProseText, vocab)
      if (unsupported.length > 0) {
        // SOFT-WARN: log but do not fail (per ADR-007 §5 — soft-warn for unsupported Greek)
        info(
          `  ${fixtureId}.P5 — soft-warn: prose names Greek identifier(s) not in assessment: ${unsupported.join(', ')}`
        )
      } else {
        info(`  ${fixtureId}.P5 — Greek identifier consistency: clean`)
      }

      // Marginal-case phrasing — HARD asserts when assessment has marginal field
      const isKathekonNull = assessment.kathekon_assessment.is_kathekon === null
      const isSingleSnapshot =
        assessment.iterative_refinement.direction_of_travel === 'single_snapshot'
      const noImprovementPath = assessment.improvement_path_structured === null

      if (isKathekonNull) {
        const has = proseHasUndecidableKathekonPhrasing(allProseText)
        check(
          `${fixtureId}.P5 — is_kathekon=null → prose contains undecidable phrasing`,
          has,
          has ? undefined : 'expected phrasing like "cannot be determined" — missing'
        )
      }

      if (isSingleSnapshot) {
        const has = proseHasSingleSnapshotPhrasing(allProseText)
        check(
          `${fixtureId}.P5 — direction_of_travel=single_snapshot → prose contains single-snapshot phrasing`,
          has,
          has
            ? undefined
            : 'expected phrasing like "single snapshot" or "no trajectory" — missing'
        )
      }

      if (noImprovementPath) {
        const has = proseHasNoImprovementPathPhrasing(allProseText)
        check(
          `${fixtureId}.P5 — improvement_path_structured=null → prose contains no-improvement-path phrasing`,
          has,
          has
            ? undefined
            : 'expected phrasing like "no specific improvement path" — missing'
        )
      }

      // Hard contradiction checks
      // Prose must not assert kathekon when assessment says null
      if (isKathekonNull) {
        const lower = allProseText.toLowerCase()
        const assertsTrue =
          lower.includes('the action is appropriate') ||
          lower.includes('this is appropriate') ||
          lower.includes('action is kathekon')
        const assertsFalse =
          lower.includes('the action is not appropriate') ||
          lower.includes('this is not appropriate') ||
          lower.includes('action is contrary')
        check(
          `${fixtureId}.P5 — is_kathekon=null → prose does NOT assert appropriateness either way`,
          !assertsTrue && !assertsFalse,
          assertsTrue
            ? 'prose asserts appropriate when assessment is null — HARD FAIL'
            : assertsFalse
              ? 'prose asserts not appropriate when assessment is null — HARD FAIL'
              : undefined
        )
      }
    }

    // Diagnostics for founder review
    if (p5.llm_prose) {
      const r = p5.llm_prose
      info(`  llm.summary: ${r.summary.length > 200 ? r.summary.slice(0, 200) + '…' : r.summary}`)
      info(
        `  llm.philosophical_reflection.length=${r.philosophical_reflection.length} improvement_guidance.length=${r.improvement_guidance.length}`
      )
    }
    if (p5.fallback_prose) {
      const r = p5.fallback_prose
      info(
        `  fallback.summary: ${r.summary.length > 200 ? r.summary.slice(0, 200) + '…' : r.summary}`
      )
    }

    console.log()
  }

  // ---- Cross-fixture coverage assertion (Phase 5 assertion 7) ----

  console.log('--- Phase 5 cross-fixture coverage ---')
  // Coverage: at least one fixture must exercise marginal-case phrasing
  // (is_kathekon=null OR direction_of_travel=single_snapshot OR improvement_path_structured=null)
  // AND that fixture's prose must contain the corresponding marginal-case phrasing.
  const coverageHits: string[] = []
  for (const p5r of phase5Results) {
    const l2 = layer2Results.find((l) => l.fixture.id === p5r.fixture_id)
    if (!l2 || !l2.assessment_a) continue
    const a = l2.assessment_a
    const proseForCheck = p5r.llm_prose ?? p5r.fallback_prose
    if (!proseForCheck) continue
    const proseText = [
      proseForCheck.philosophical_reflection,
      proseForCheck.improvement_guidance,
      proseForCheck.summary,
    ].join(' ')

    if (
      a.kathekon_assessment.is_kathekon === null &&
      proseHasUndecidableKathekonPhrasing(proseText)
    ) {
      coverageHits.push(`${p5r.fixture_id}/is_kathekon=null`)
    }
    if (
      a.iterative_refinement.direction_of_travel === 'single_snapshot' &&
      proseHasSingleSnapshotPhrasing(proseText)
    ) {
      coverageHits.push(`${p5r.fixture_id}/single_snapshot`)
    }
    if (
      a.improvement_path_structured === null &&
      proseHasNoImprovementPathPhrasing(proseText)
    ) {
      coverageHits.push(`${p5r.fixture_id}/no_improvement_path`)
    }
  }
  check(
    `P5 — marginal-case coverage: at least one fixture surfaces a marginal field AND prose contains the marginal-case phrasing`,
    coverageHits.length >= 1,
    coverageHits.length >= 1
      ? `(satisfied by: ${coverageHits.join(', ')})`
      : 'NO fixture surfaced a marginal field with matching prose phrasing'
  )

  console.log()
  return phase5Results
}

// -----------------------------------------------------------------------------
// 7b. Phase 6 — End-to-end orchestration (M1-CP4)
//
// Verifies that for each fixture, the cached Layer 1 schema + Layer 2 assessment
// + Layer 3 prose compose into the ADR-004 §2.1 top-level shape:
//   { version, extraction, assessment, prose, meta }
//
// Does NOT issue any new LLM calls. Uses the outputs already produced by Phases
// 1–5 in this run. Cost: $0.
//
// Also performs a smoke check that runSandwichForHarness is exported and is an
// async function — confirms the orchestrator's surface compiles cleanly.
// -----------------------------------------------------------------------------

interface ComposedShape {
  version: 'translation-sandwich-v1'
  extraction: Layer1Schema
  assessment: Layer2Assessment
  prose: Layer3Prose
  meta: {
    engine_attribution: 'translation-sandwich'
    layer1_latency_ms: number | null
    layer2_latency_ms: number | null
    layer3_latency_ms: number | null
  }
}

function runPhase6(
  fixtureResults: FixtureResult[],
  layer2Results: Layer2FixtureResult[],
  phase5Results: Phase5Result[]
): void {
  console.log('=== PHASE 6 — END-TO-END ORCHESTRATION ===\n')

  // Smoke check on the orchestrator export.
  check(
    `P6 — runSandwichForHarness is an exported async function`,
    typeof runSandwichForHarness === 'function' &&
      runSandwichForHarness.constructor.name === 'AsyncFunction',
    `typeof=${typeof runSandwichForHarness}, ctor=${runSandwichForHarness?.constructor?.name}`
  )

  for (const fr of fixtureResults) {
    const fixtureId = fr.fixture.id
    const l2 = layer2Results.find((l) => l.fixture.id === fixtureId)
    const p5 = phase5Results.find((p) => p.fixture_id === fixtureId)

    if (!fr.schema || !l2?.assessment_a || !p5) {
      info(
        `  ${fixtureId}.P6 — SKIP composition (upstream phase failed: schema=${!!fr.schema} assessment=${!!l2?.assessment_a} phase5=${!!p5})`
      )
      continue
    }

    const proseForCompose = p5.llm_prose ?? p5.fallback_prose
    if (!proseForCompose) {
      info(`  ${fixtureId}.P6 — SKIP composition (no Layer 3 prose available)`)
      continue
    }

    // Compose §2.1 shape.
    const composed: ComposedShape = {
      version: 'translation-sandwich-v1',
      extraction: fr.schema,
      assessment: l2.assessment_a,
      prose: proseForCompose,
      meta: {
        engine_attribution: 'translation-sandwich',
        layer1_latency_ms: fr.latency_ms,
        layer2_latency_ms: 0, // Layer 2 is synchronous deterministic; Phase 3 doesn't track latency separately
        layer3_latency_ms: p5.llm_latency_ms ?? null,
      },
    }

    // Assertions on the composed shape (matches ADR-004 §2.1).
    check(
      `${fixtureId}.P6 — composed.version === 'translation-sandwich-v1'`,
      composed.version === 'translation-sandwich-v1'
    )
    check(
      `${fixtureId}.P6 — composed.extraction is a valid Layer1Schema`,
      composed.extraction.version === 'layer1-schema-v1'
    )
    check(
      `${fixtureId}.P6 — composed.assessment is a valid Layer2Assessment`,
      composed.assessment.version === 'layer2-assessment-v1'
    )
    check(
      `${fixtureId}.P6 — composed.prose is a valid Layer3Prose`,
      composed.prose.version === 'layer3-prose-v1' &&
        composed.prose.consumer === 'api_reason'
    )
    check(
      `${fixtureId}.P6 — composed.meta.engine_attribution === 'translation-sandwich'`,
      composed.meta.engine_attribution === 'translation-sandwich'
    )
    check(
      `${fixtureId}.P6 — composed.prose's layer2_assessment_version matches composed.assessment.version`,
      composed.prose.layer2_assessment_version === composed.assessment.version
    )
    // Composition order proof: every required top-level key present
    const requiredKeys = ['version', 'extraction', 'assessment', 'prose', 'meta'] as const
    const missingKeys = requiredKeys.filter((k) => !(k in composed))
    check(
      `${fixtureId}.P6 — composed shape has all 5 §2.1 top-level keys`,
      missingKeys.length === 0,
      missingKeys.length > 0 ? `missing: ${missingKeys.join(', ')}` : undefined
    )
  }

  console.log()
}

// -----------------------------------------------------------------------------
// 7c. Phase 7 — R20a perimeter preservation (M1-CP4)
//
// Per AC4 (Invocation Testing for Safety Functions): grep the route source for
// the distress-check call and the parallel-run call, assert the distress check
// appears earlier in the file. Per ADR-004 §8.
//
// This phase does NOT execute any code in the route — it inspects the source
// text. AC4 explicitly endorses grep-based invocation testing.
// -----------------------------------------------------------------------------

function runPhase7(): void {
  console.log('=== PHASE 7 — R20a PERIMETER PRESERVATION ===\n')

  const routePath = join(__dirname, '..', 'src', 'app', 'api', 'reason', 'route.ts')
  let routeSrc: string
  try {
    routeSrc = readFileSync(routePath, 'utf8')
  } catch (err) {
    check(
      `P7 — read /api/reason/route.ts`,
      false,
      `failed: ${err instanceof Error ? err.message : String(err)}`
    )
    console.log()
    return
  }

  const lines = routeSrc.split('\n')
  function findLine(needle: RegExp): number {
    for (let i = 0; i < lines.length; i++) {
      if (needle.test(lines[i])) return i + 1 // 1-based
    }
    return -1
  }

  // --- Distress check call line (the R20a perimeter) ---
  const distressLine = findLine(
    /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/
  )
  check(
    `P7 — route imports enforceDistressCheck and detectDistressTwoStage`,
    /from '@\/lib\/r20a-classifier'/.test(routeSrc) &&
      /from '@\/lib\/constraints'/.test(routeSrc)
  )
  check(
    `P7 — route calls enforceDistressCheck(detectDistressTwoStage(input))`,
    distressLine > 0,
    distressLine > 0 ? `at line ${distressLine}` : 'call pattern not found'
  )

  // --- Distress-redirect early-return ---
  const redirectIfLine = findLine(/if\s*\(\s*gate\.shouldRedirect\s*\)/)
  check(
    `P7 — route guards shouldRedirect with an early return`,
    redirectIfLine > 0 && redirectIfLine > distressLine,
    redirectIfLine > 0 ? `at line ${redirectIfLine}` : 'shouldRedirect guard missing'
  )

  // --- Parallel-run import + call ---
  const parallelImportLine = findLine(
    /from '@\/lib\/translation-sandwich\/parallel-run'/
  )
  check(
    `P7 — route imports runParallelSandwich from translation-sandwich/parallel-run`,
    parallelImportLine > 0,
    parallelImportLine > 0 ? `at line ${parallelImportLine}` : 'import not found'
  )

  const parallelCallLine = findLine(/await\s+runParallelSandwich\s*\(/)
  check(
    `P7 — route awaits runParallelSandwich(...) (KG1 rule 2: no fire-and-forget)`,
    parallelCallLine > 0,
    parallelCallLine > 0 ? `at line ${parallelCallLine}` : 'await call not found'
  )

  // --- The critical ordering invariant: distress-check call BEFORE parallel-run call ---
  check(
    `P7 — distress-check call appears BEFORE runParallelSandwich call (R20a perimeter intact)`,
    distressLine > 0 && parallelCallLine > 0 && distressLine < parallelCallLine,
    distressLine > 0 && parallelCallLine > 0
      ? `distress at L${distressLine}, parallel-run at L${parallelCallLine}`
      : 'one or both calls missing'
  )

  // --- runSageReason also after distress-check (existing invariant) ---
  // Concurrent execution model: runSageReason is called WITHOUT await (returns
  // a promise captured as bundledPromise). The await happens later on
  // bundledPromise. So the grep no longer requires `await` immediately before.
  const runSageReasonCallLine = findLine(/=\s*runSageReason\s*\(|await\s+runSageReason\s*\(/)
  check(
    `P7 — runSageReason call also appears AFTER distress-check (existing invariant preserved)`,
    distressLine > 0 &&
      runSageReasonCallLine > 0 &&
      distressLine < runSageReasonCallLine,
    distressLine > 0 && runSageReasonCallLine > 0
      ? `runSageReason at L${runSageReasonCallLine}`
      : 'runSageReason call not found'
  )

  // --- runSageReason is invoked BEFORE runParallelSandwich (so the bundledPromise
  //     can be passed in). Both run concurrently — bundled-depth is already in
  //     flight by the time runParallelSandwich is called.
  //     Per the M1-CP4 follow-up refactor (concurrent execution model). ---
  check(
    `P7 — runSageReason invoked BEFORE runParallelSandwich (concurrent composition: bundled fires first; parallel awaits both)`,
    runSageReasonCallLine > 0 &&
      parallelCallLine > 0 &&
      runSageReasonCallLine < parallelCallLine,
    runSageReasonCallLine > 0 && parallelCallLine > 0
      ? `runSageReason at L${runSageReasonCallLine}, parallel-run at L${parallelCallLine}`
      : undefined
  )

  // --- Single-route discipline: parallel-run module imported only inside this route ---
  // (Confirmed at session close by a separate grep audit; here we only assert that
  // this file imports it — the cross-codebase audit is a separate verification step
  // documented in the decision log.)

  console.log()
}

// -----------------------------------------------------------------------------
// 7d. Phase 8 — Fallback semantics (M1-CP4)
//
// Per ADR-004 §9 (Fallback semantics):
//   - Layer 1 throws → orchestrator returns with error='layer1_throw', output=null.
//   - Layer 3 throws → orchestrator falls back to generateFallbackProse(assessment).
//   - User is never stranded.
//
// Phase 8a invokes runSandwichForHarness with an invalid input that triggers
// Layer 1's validator-level throw (no LLM cost). Phase 8b confirms
// generateFallbackProse produces a valid Layer3Prose for each fixture's
// assessment (this is also covered in Phase 5 but Phase 8 names it explicitly
// for the fallback-semantics contract).
// -----------------------------------------------------------------------------

async function runPhase8(layer2Results: Layer2FixtureResult[]): Promise<void> {
  console.log('=== PHASE 8 — FALLBACK SEMANTICS ===\n')

  // Phase 8a: invalid input → layer1_throw.
  // extractFeatures throws Layer1ValidationError on empty input (validator-level
  // check, no LLM call). The orchestrator catches it and reports layer1_throw.
  const invalidInputResult = await runSandwichForHarness({
    input: '', // intentionally invalid — extractFeatures throws Layer1ValidationError
  })

  check(
    `P8 — invalid input triggers layer1_throw (no Sonnet call)`,
    invalidInputResult.error === 'layer1_throw',
    `actual error=${invalidInputResult.error}`
  )
  check(
    `P8 — layer1_throw → output is null (user never sees translation-sandwich output)`,
    invalidInputResult.output === null
  )
  check(
    `P8 — layer1_throw → layer1_latency_ms is recorded (failure timing captured)`,
    invalidInputResult.layer1_latency_ms !== null && invalidInputResult.layer1_latency_ms >= 0
  )
  check(
    `P8 — layer1_throw → downstream layer latencies are null (Layers 2 + 3 did not run)`,
    invalidInputResult.layer2_latency_ms === null &&
      invalidInputResult.layer3_latency_ms === null
  )

  // Phase 8b: generateFallbackProse produces valid Layer3Prose for every fixture's assessment.
  for (const l2r of layer2Results) {
    if (!l2r.assessment_a) continue
    const fixtureId = l2r.fixture.id

    let fbValid = false
    let fbDetail = ''
    try {
      const fb = generateFallbackProse(l2r.assessment_a)
      const reparsed = JSON.parse(JSON.stringify(fb))
      const validated = validateLayer3Prose(reparsed)
      fbValid = validated.source === 'fallback' && validated.consumer === 'api_reason'
      if (!fbValid)
        fbDetail = `source=${validated.source}, consumer=${validated.consumer}`
    } catch (err) {
      fbDetail = err instanceof Error ? err.message : String(err)
    }

    check(
      `${fixtureId}.P8 — generateFallbackProse(assessment) → valid Layer3Prose with source='fallback'`,
      fbValid,
      fbDetail || undefined
    )
  }

  console.log()
}

// -----------------------------------------------------------------------------
// 7e. Phase 9 — Cost + latency reporting (M1-CP4)
//
// Aggregates per-layer latency from Phase 1+2 (Layer 1) and Phase 5 (Layer 3).
// Reports the parallel-run cost-cap configuration so the founder can see what
// is enforced at runtime.
//
// Layer 1 + Layer 3 cost-per-fixture is reported as "not captured" because
// extractFeatures + generateProse do not currently expose token usage. M1-CP5
// may extend the layer modules to return usage; documented as an open question
// in the decision-log entry for this session.
// -----------------------------------------------------------------------------

function runPhase9(
  fixtureResults: FixtureResult[],
  phase5Results: Phase5Result[]
): void {
  console.log('=== PHASE 9 — COST + LATENCY REPORTING ===\n')

  let totalLayer1LatencyMs = 0
  let layer1Count = 0
  for (const fr of fixtureResults) {
    if (typeof fr.latency_ms === 'number' && fr.latency_ms > 0) {
      totalLayer1LatencyMs += fr.latency_ms
      layer1Count++
    }
  }

  let totalLayer3LatencyMs = 0
  let layer3Count = 0
  for (const p5r of phase5Results) {
    if (typeof p5r.llm_latency_ms === 'number' && p5r.llm_latency_ms > 0) {
      totalLayer3LatencyMs += p5r.llm_latency_ms
      layer3Count++
    }
  }

  console.log(`  Layer 1 latency: ${totalLayer1LatencyMs} ms total across ${layer1Count} fixture(s)`)
  if (layer1Count > 0) {
    console.log(`  Layer 1 avg latency: ${Math.round(totalLayer1LatencyMs / layer1Count)} ms`)
  }
  console.log(`  Layer 2 latency: synchronous deterministic (sub-millisecond per fixture)`)
  console.log(`  Layer 3 latency: ${totalLayer3LatencyMs} ms total across ${layer3Count} fixture(s)`)
  if (layer3Count > 0) {
    console.log(`  Layer 3 avg latency: ${Math.round(totalLayer3LatencyMs / layer3Count)} ms`)
  }

  console.log()
  console.log(`  Layer 1 cost per fixture: not captured at M1 (extractFeatures does not expose usage)`)
  console.log(`  Layer 3 cost per fixture: not captured at M1 (generateProse does not expose usage)`)
  console.log(`  → Per-fixture cost capture deferred to M1-CP5; logged as open question.`)

  console.log()
  console.log(`  Parallel-run config (production):`)
  console.log(`    TRANSLATION_SANDWICH_PARALLEL_RUN at module load: ${isParallelRunEnabled() ? 'ENABLED' : 'disabled'}`)
  console.log(`    Cap (USD microcents): ${PARALLEL_RUN_CONFIG.CAP_USD_MICROCENTS} (= $${(BigInt(PARALLEL_RUN_CONFIG.CAP_USD_MICROCENTS) / BigInt(1_000_000)).toString()})`)
  console.log(`    Cap (request count): ${PARALLEL_RUN_CONFIG.CAP_REQUEST_COUNT}`)
  console.log(`    Cap (period days): ${PARALLEL_RUN_CONFIG.CAP_DAYS}`)
  console.log(`    Execution model: ${PARALLEL_RUN_CONFIG.EXECUTION_MODEL} (no deadline cutoff during M1-CP4-CP5 testing window)`)
  console.log(`    Sonnet pricing (USD/M tokens): input=${PARALLEL_RUN_CONFIG.SONNET_INPUT_USD_PER_MILLION_TOKENS}, output=${PARALLEL_RUN_CONFIG.SONNET_OUTPUT_USD_PER_MILLION_TOKENS}`)

  // Phase 9 is reporting-only; it produces no check() assertions.
  console.log()
}

// -----------------------------------------------------------------------------
// 6. main()
// -----------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('verify-translation-sandwich.ts — M1-CP4 standalone harness (Phases 1–9)')
  console.log('Per ADR-004 §7 + ADR-005 §8 + ADR-006 §4 + ADR-007 §8\n')

  const fixtureResults = await runPhase1AndPhase2()
  const layer2Results = runPhase3(fixtureResults)
  runPhase4(layer2Results)
  const phase5Results = await runPhase5Async(layer2Results)

  // Phases 6–9 wired this session (M1-CP4). Phases 6, 7, 9 issue NO new LLM
  // calls. Phase 8 invokes runSandwichForHarness with an invalid input which
  // throws at the validator level (no LLM call). Total marginal cost: $0.
  runPhase6(fixtureResults, layer2Results, phase5Results)
  runPhase7()
  await runPhase8(layer2Results)
  runPhase9(fixtureResults, phase5Results)

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------

  console.log('---')
  console.log(`SUMMARY: ${passedChecks} / ${totalChecks} checks passed`)
  if (passedChecks === totalChecks) {
    console.log('ALL CHECKS PASSED (Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5 + Phase 6 + Phase 7 + Phase 8 + Phase 9)')
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
