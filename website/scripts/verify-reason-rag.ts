/**
 * verify-reason-rag.ts — verification harness for D6/D7 Pattern A2 consumer wiring.
 *
 * Originally produced for Sub-session E1 (/api/reason quick-depth). Extended in
 * Sub-session E2 with Phase D (/api/score standard-depth). Refactored in
 * Sub-session E3 with the V2 phase helper (`runConsumerWiringPhase`) so each
 * Pattern A2 consumer is one function call instead of an inline block, and
 * extended with Phase E (/api/score-conversation deep depth). Extended in
 * Sub-session E4 with Phase F (/api/score-social standard-depth wiring;
 * Group A second consumer).
 *
 * Run from inside website/:
 *   npx tsx scripts/verify-reason-rag.ts
 *
 * What this does:
 *   PHASE A — Pure-helper tests (no network):
 *     A1. getCorpusMechanismsForDepth('quick' | 'standard' | 'deep') returns
 *         the expected corpus mechanism IDs.
 *     A2. RETRIEVAL_TOP_K_BY_DEPTH has the expected shape per depth.
 *     A3. toBm25OrShape (re-export) transforms 3 representative inputs.
 *     A4. formatRetrievedPassagesAsBlock with empty array returns empty string.
 *     A5. formatRetrievedPassagesAsBlock with one passage builds the expected
 *         header + citation + text shape.
 *
 *   PHASE B — /api/reason quick-depth wiring (real OpenAI + real Supabase):
 *     For each of 3 representative inputs (career decision, passion-driven
 *     anger, oikeiosis-relevant family), invokes runConsumerWiringPhase('B',
 *     'quick', ...). Asserts non-empty top, every passage's mechanism in
 *     filter, every passage carries source_citation (R7), separate-cache
 *     replay, and comparison-axis (both paths non-empty; new path under
 *     ceiling).
 *
 *   PHASE C — Quick-depth comparison axis (preserved from E1 for continuity).
 *     Note: Phase B's comparison axis (delegated to runConsumerWiringPhase)
 *     covers the same checks; Phase C is retained as the original surface.
 *
 *   PHASE D — /api/score standard-depth wiring (E2). Same shape as Phase B
 *     via runConsumerWiringPhase('D', 'standard', ...).
 *
 *   PHASE E (E3) — /api/score-conversation deep-depth wiring. Same shape via
 *     runConsumerWiringPhase('E', 'deep', ...). First deep-depth Pattern A2
 *     consumer; completes coverage across all three depth settings.
 *
 *   PHASE F (E4) — /api/score-social standard-depth wiring. Same shape via
 *     runConsumerWiringPhase('F', 'standard', ...). Group A second consumer
 *     (matches /api/score-conversation Pattern A2 on the shared substrate).
 *
 * Exit code 0 if all checks pass; 1 otherwise.
 *
 * Sub-session E3 changes:
 *   - Helper imports moved from `@/app/api/reason/helpers` to `@/lib/rag/helpers`
 *     (Pattern S2 lift completed this session).
 *   - Phase B / D / E refactored to call runConsumerWiringPhase (V2).
 *   - Phase E added at deep depth.
 *   - Phase A and Phase C kept inline (per-helper tests + retained quick-depth
 *     surface for continuity with E1's verification record).
 *
 * Sub-session E4 changes:
 *   - Phase F added at standard depth (/api/score-social — Group A second
 *     consumer). One additional `runConsumerWiringPhase` call; no other shape
 *     change. Total checks 59 → 75 (Phase F adds 16).
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - /website/src/app/api/reason/route.ts (E1 consumer — quick depth)
 *   - /website/src/app/api/score/route.ts (E2 consumer — standard depth)
 *   - /website/src/app/api/score-conversation/route.ts (E3 consumer — deep depth)
 *   - /website/src/app/api/score-social/route.ts (E4 consumer — standard depth)
 *   - /website/src/lib/rag/helpers.ts (depth-mechanism mapping; shared by all consumers)
 *   - /website/src/lib/rag/load-layer1-with-fallback.ts (the shared wrapper)
 *   - /website/src/lib/sage-reason-engine.ts (formatRetrievedPassagesAsBlock)
 *   - /website/scripts/verify-internal-retrieve.ts (Sub-session D harness pattern)
 *   - /operations/decision-log.md D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04
 *   - /operations/decision-log.md D-REASON-RAG-WIRED-2026-05-04
 *   - /operations/decision-log.md D-SCORE-RAG-WIRED-2026-05-04
 *   - /operations/decision-log.md D-CONSUMER-WIRING-LIFT-2026-05-04
 *   - /operations/decision-log.md D-SCORE-SOCIAL-RAG-WIRED-2026-05-04
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// -----------------------------------------------------------------------------
// 1. Load .env.local manually (no dotenv dep) — same pattern as Sub-session D
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

const REQUIRED_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[env] MISSING required env var: ${key}`)
    process.exit(1)
  }
}
console.log(`[env] all required env vars present\n`)

// -----------------------------------------------------------------------------
// 2. Test fixtures — 3 representative inputs (work for all three depths /
//    consumer shapes; see fixture rationale)
// -----------------------------------------------------------------------------

interface ReasonFixture {
  label: string
  input: string
  /** Plain-language summary of why this fixture is here. */
  rationale: string
}

const FIXTURES: ReasonFixture[] = [
  {
    label: 'F1 career decision',
    input: 'I have been offered a new job at a competitor. The pay is significantly higher but the work is less meaningful. Should I take it?',
    rationale: 'Exercises control_filter (what is up to me) + value_assessment via oikeiosis (preferred indifferents).',
  },
  {
    label: 'F2 passion-driven anger',
    input: 'I am furious with my colleague for missing yet another deadline. I want to confront them publicly tomorrow morning.',
    rationale: 'Exercises passion_diagnosis (orge sub-species under epithumia) + control_filter (the colleague\'s action is not up to me).',
  },
  {
    label: 'F3 oikeiosis-relevant family',
    input: 'I am thinking about cutting back on my weekly calls to my elderly parents because they exhaust me emotionally.',
    rationale: 'Exercises oikeiosis_stage (family obligations, stage 2) + oikeiosis_obligation (Cicero\'s deliberation).',
  },
]

const QUICK_DEPTH_EXPECTED_MECHANISMS = [
  'prohairesis_filter',
  'passion_root_detection',
  'passion_sub_species',
  'passion_false_judgement',
  'oikeiosis_stage',
  'oikeiosis_obligation',
]
// Standard-depth = quick + ['value_indifferent', 'virtue_domain_engaged']
// Deep-depth     = standard + ['katorthoma_proximity']
// Asserted inline in Phase A; resolved at runtime via getCorpusMechanismsForDepth in B/D/E.

// -----------------------------------------------------------------------------
// 3. Pretty-print helpers
// -----------------------------------------------------------------------------

function ok(msg: string) {
  console.log(`  ✓ ${msg}`)
}
function fail(msg: string) {
  console.log(`  ✗ ${msg}`)
}
function info(msg: string) {
  console.log(`    → ${msg}`)
}

// -----------------------------------------------------------------------------
// 4. V2 phase helper — runs one Pattern A2 consumer wiring phase end-to-end.
//
// Encapsulates the per-fixture assertion sequence (non-empty top, mechanism
// filter overlap, R7 source_citation), separate-cache replay assertion, and
// the OLD-vs-NEW Layer 1 comparison axis. Each Pattern A2 consumer is one call.
// -----------------------------------------------------------------------------

interface PhaseDeps {
  retrievePassages: typeof import('@/lib/rag').retrievePassages
  reRank: typeof import('@/lib/rag').reRank
  getCorpusMechanismsForDepth: typeof import('@/lib/rag/helpers').getCorpusMechanismsForDepth
  RETRIEVAL_TOP_K_BY_DEPTH: typeof import('@/lib/rag/helpers').RETRIEVAL_TOP_K_BY_DEPTH
  toBm25OrShape: typeof import('@/lib/rag/helpers').toBm25OrShape
  formatRetrievedPassagesAsBlock: typeof import('@/lib/sage-reason-engine').formatRetrievedPassagesAsBlock
  getStoicBrainContext: typeof import('@/lib/context/stoic-brain-loader').getStoicBrainContext
}

interface PhaseConfig {
  /** Phase letter for log prefixes (e.g., 'B', 'D', 'E'). */
  label: string
  /** Engine depth — controls mechanism filter + top-k via the shared helpers. */
  depth: 'quick' | 'standard' | 'deep'
  /** Plain-English description of which consumer this phase exercises. */
  consumerDescription: string
  /** Per-depth NEW Layer 1 ceiling in chars. */
  ceilingChars: number
}

interface PhaseResult {
  totalChecks: number
  passedChecks: number
}

async function runConsumerWiringPhase(
  cfg: PhaseConfig,
  deps: PhaseDeps,
): Promise<PhaseResult> {
  let totalChecks = 0
  let passedChecks = 0

  console.log(`PHASE ${cfg.label} — ${cfg.consumerDescription}`)
  console.log('-'.repeat(`PHASE ${cfg.label} — ${cfg.consumerDescription}`.length))
  console.log()

  const cache = new Map()
  const fixtureResults: Array<{
    fixture: ReasonFixture
    passages: Awaited<ReturnType<typeof deps.reRank>>
    elapsed_ms: number
  }> = []

  const corpusMechanisms = deps.getCorpusMechanismsForDepth(cfg.depth)
  const { top_k, top_k_after_rerank } = deps.RETRIEVAL_TOP_K_BY_DEPTH[cfg.depth]

  for (const fixture of FIXTURES) {
    console.log(`${cfg.label}/${fixture.label} — running retrievePassages + reRank @ ${cfg.depth} depth`)
    info(`input: ${fixture.input.slice(0, 80)}${fixture.input.length > 80 ? '...' : ''}`)
    info(`rationale: ${fixture.rationale}`)

    const retrieveInput = {
      query: fixture.input,
      bm25_query: deps.toBm25OrShape(fixture.input),
      mechanism_filter: corpusMechanisms,
      passage_type_filter: ['mechanism' as const],
      top_k,
    }

    const start = Date.now()
    const result = await deps.retrievePassages(retrieveInput, cache)
    const top = await deps.reRank(result.passages, retrieveInput, 'heuristic', { top_k_after_rerank })
    const elapsed_ms = Date.now() - start

    info(
      `bm25_count=${result.retrieval_diagnostics.bm25_count} ` +
      `vector_count=${result.retrieval_diagnostics.vector_count} ` +
      `fusion_count=${result.retrieval_diagnostics.fusion_count} ` +
      `elapsed_ms=${elapsed_ms} (D6=${result.retrieval_diagnostics.elapsed_ms}ms) ` +
      `→ reranked top=${top.length}`,
    )

    // Assert: non-empty top
    totalChecks++
    if (top.length > 0) {
      ok(`returned ${top.length} passages (top_k_after_rerank=${top_k_after_rerank})`)
      passedChecks++
    } else {
      fail(`returned 0 passages`)
    }

    // Assert: every passage's canonical_mechanism overlaps the depth filter
    totalChecks++
    const allInFilter = top.every((p) =>
      p.canonical_mechanism.some((m) => corpusMechanisms.includes(m)),
    )
    if (allInFilter) {
      ok(`every passage's canonical_mechanism is in ${cfg.depth}-depth filter`)
      passedChecks++
    } else {
      const offenders = top.filter(
        (p) => !p.canonical_mechanism.some((m) => corpusMechanisms.includes(m)),
      )
      fail(`${offenders.length}/${top.length} passages outside filter`)
      for (const o of offenders)
        info(`  out-of-filter: ${o.passage_id} mechanisms=[${o.canonical_mechanism.join(',')}]`)
    }

    // Assert: every passage carries source_citation (R7)
    totalChecks++
    const allCited = top.every(
      (p) => typeof p.source_citation === 'string' && p.source_citation.length > 0,
    )
    if (allCited) {
      ok(`every passage carries source_citation (R7 fidelity)`)
      passedChecks++
    } else {
      fail(`some passages missing source_citation`)
    }

    // Print top-5 passage_ids for founder review
    const top5 = top.slice(0, 5).map((p) => p.passage_id).join('\n         ')
    info(`top-5 passage_ids:\n         ${top5}`)

    fixtureResults.push({ fixture, passages: top, elapsed_ms })
    console.log()
  }

  // Cache replay
  console.log(`${cfg.label}-cache. Replay F1 with the same per-phase cache`)
  totalChecks++
  const f1 = FIXTURES[0]
  const retrieveInputReplay = {
    query: f1.input,
    bm25_query: deps.toBm25OrShape(f1.input),
    mechanism_filter: corpusMechanisms,
    passage_type_filter: ['mechanism' as const],
    top_k,
  }
  const startReplay = Date.now()
  const replay = await deps.retrievePassages(retrieveInputReplay, cache)
  const elapsedReplay = Date.now() - startReplay
  if (replay.retrieval_diagnostics.cache_hit && elapsedReplay < 50) {
    ok(`cache_hit=true, elapsed_ms=${elapsedReplay} (≈0ms)`)
    passedChecks++
  } else {
    fail(
      `expected cache_hit + ≈0ms, got cache_hit=${replay.retrieval_diagnostics.cache_hit}, ` +
      `elapsed_ms=${elapsedReplay}`,
    )
  }
  console.log()

  // Comparison axis
  console.log(`${cfg.label}-comparison. OLD vs NEW Layer 1 at ${cfg.depth} depth`)
  const oldLayer1 = deps.getStoicBrainContext(cfg.depth)
  console.log(`OLD path getStoicBrainContext('${cfg.depth}'): ${oldLayer1.length} chars`)
  console.log(`         first 200: ${oldLayer1.slice(0, 200).replace(/\n/g, ' / ')}...\n`)

  for (const { fixture, passages } of fixtureResults) {
    const newLayer1 = deps.formatRetrievedPassagesAsBlock(passages)
    console.log(
      `NEW path for ${fixture.label}: ${newLayer1.length} chars (${passages.length} passages)`,
    )
    console.log(
      `         first 200: ${newLayer1.slice(0, 200).replace(/\n/g, ' / ')}...`,
    )

    // Assert: both paths produce non-empty content
    totalChecks++
    if (oldLayer1.length > 0 && newLayer1.length > 0) {
      ok(
        `both paths non-empty (OLD=${oldLayer1.length} chars, NEW=${newLayer1.length} chars)`,
      )
      passedChecks++
    } else {
      fail(`empty content: OLD=${oldLayer1.length}, NEW=${newLayer1.length}`)
    }

    // Assert: new path under depth-specific ceiling
    totalChecks++
    if (newLayer1.length <= cfg.ceilingChars) {
      ok(`new path within ceiling (${newLayer1.length} ≤ ${cfg.ceilingChars})`)
      passedChecks++
    } else {
      fail(`new path exceeds ceiling: ${newLayer1.length} > ${cfg.ceilingChars}`)
    }
    console.log()
  }

  return { totalChecks, passedChecks }
}

// -----------------------------------------------------------------------------
// 5. Main
// -----------------------------------------------------------------------------

async function main() {
  // Lazy import — env must be loaded before supabase-server.ts runs
  const { retrievePassages, reRank } = await import('@/lib/rag')
  const {
    getCorpusMechanismsForDepth,
    RETRIEVAL_TOP_K_BY_DEPTH,
    toBm25OrShape,
  } = await import('@/lib/rag/helpers')
  const { formatRetrievedPassagesAsBlock } = await import('@/lib/sage-reason-engine')
  const { getStoicBrainContext } = await import('@/lib/context/stoic-brain-loader')

  const deps: PhaseDeps = {
    retrievePassages,
    reRank,
    getCorpusMechanismsForDepth,
    RETRIEVAL_TOP_K_BY_DEPTH,
    toBm25OrShape,
    formatRetrievedPassagesAsBlock,
    getStoicBrainContext,
  }

  let totalChecks = 0
  let passedChecks = 0

  // ===========================================================================
  // PHASE A — Pure-helper tests
  // ===========================================================================

  console.log('PHASE A — Pure-helper tests')
  console.log('---------------------------\n')

  console.log('A1. getCorpusMechanismsForDepth')
  const expectedQuick = QUICK_DEPTH_EXPECTED_MECHANISMS
  const expectedStandard = [...expectedQuick, 'value_indifferent', 'virtue_domain_engaged']
  const expectedDeep = [...expectedStandard, 'katorthoma_proximity']

  for (const [depth, expected] of [
    ['quick', expectedQuick],
    ['standard', expectedStandard],
    ['deep', expectedDeep],
  ] as const) {
    totalChecks++
    const actual = getCorpusMechanismsForDepth(depth)
    if (
      actual.length === expected.length &&
      expected.every((m) => actual.includes(m))
    ) {
      ok(`depth='${depth}' → ${actual.length} mechanisms: ${actual.join(', ')}`)
      passedChecks++
    } else {
      fail(`depth='${depth}': expected [${expected.join(', ')}], got [${actual.join(', ')}]`)
    }
  }
  console.log()

  console.log('A2. RETRIEVAL_TOP_K_BY_DEPTH structure')
  for (const depth of ['quick', 'standard', 'deep'] as const) {
    totalChecks++
    const cfg = RETRIEVAL_TOP_K_BY_DEPTH[depth]
    if (
      cfg &&
      typeof cfg.top_k === 'number' &&
      typeof cfg.top_k_after_rerank === 'number' &&
      cfg.top_k > 0 &&
      cfg.top_k_after_rerank > 0 &&
      cfg.top_k_after_rerank <= cfg.top_k
    ) {
      ok(`depth='${depth}' → top_k=${cfg.top_k}, top_k_after_rerank=${cfg.top_k_after_rerank}`)
      passedChecks++
    } else {
      fail(`depth='${depth}': invalid config ${JSON.stringify(cfg)}`)
    }
  }
  console.log()

  console.log('A3. toBm25OrShape on 3 representative inputs')
  for (const fixture of FIXTURES) {
    totalChecks++
    const transformed = toBm25OrShape(fixture.input)
    if (transformed.includes(' OR ') && transformed.length > 0) {
      ok(`${fixture.label} → ${transformed.length > 60 ? transformed.slice(0, 57) + '...' : transformed}`)
      passedChecks++
    } else {
      fail(`${fixture.label}: expected OR-shape, got "${transformed}"`)
    }
  }
  console.log()

  console.log('A4. formatRetrievedPassagesAsBlock with empty array')
  totalChecks++
  const emptyBlock = formatRetrievedPassagesAsBlock([])
  if (emptyBlock === '') {
    ok('empty input → empty string')
    passedChecks++
  } else {
    fail(`expected empty string, got "${emptyBlock.slice(0, 50)}..."`)
  }
  console.log()

  console.log('A5. formatRetrievedPassagesAsBlock with one synthetic passage')
  totalChecks++
  const syntheticBlock = formatRetrievedPassagesAsBlock([
    {
      passage_id: 'test:synthetic:001',
      source_file: 'test.json',
      source_citation: 'Test citation',
      passage_type: 'mechanism',
      canonical_mechanism: ['prohairesis_filter'],
      passion: null,
      sub_passion: null,
      audience_tier: 'tier_1',
      text: 'This is the test passage text.',
      paragraph_text: null,
      rrf_score: 1.0,
      bm25_rank: 1,
      vector_rank: 1,
    },
  ])
  if (
    syntheticBlock.includes('STOIC BRAIN — RETRIEVED PASSAGES') &&
    syntheticBlock.includes('[Test citation]') &&
    syntheticBlock.includes('This is the test passage text.')
  ) {
    ok(`block contains header + citation + text`)
    info(`first 100 chars: ${syntheticBlock.slice(0, 100)}...`)
    passedChecks++
  } else {
    fail(`block missing expected components: ${syntheticBlock.slice(0, 200)}`)
  }
  console.log()

  // ===========================================================================
  // PHASE B — /api/reason quick-depth wiring (E1)
  // ===========================================================================

  const phaseB = await runConsumerWiringPhase(
    {
      label: 'B',
      depth: 'quick',
      consumerDescription: '/api/reason quick-depth wiring (E1)',
      ceilingChars: 12000,
    },
    deps,
  )
  totalChecks += phaseB.totalChecks
  passedChecks += phaseB.passedChecks

  // ===========================================================================
  // PHASE C — Quick-depth comparison axis surface (preserved from E1)
  //
  // Phase B's runConsumerWiringPhase already covers the comparison checks. This
  // section is retained as a record-keeping surface so the E1 verification log
  // continues to read with PHASE C labelling. No new assertions here.
  // ===========================================================================

  console.log('PHASE C — (covered by Phase B runConsumerWiringPhase comparison axis)')
  console.log('--------------------------------------------------------------------')
  info('No additional checks; Phase B comparison axis covers OLD vs NEW Layer 1 at quick depth.')
  console.log()

  // ===========================================================================
  // PHASE D — /api/score standard-depth wiring (E2)
  // ===========================================================================

  const phaseD = await runConsumerWiringPhase(
    {
      label: 'D',
      depth: 'standard',
      consumerDescription: '/api/score standard-depth wiring (E2)',
      ceilingChars: 12000,
    },
    deps,
  )
  totalChecks += phaseD.totalChecks
  passedChecks += phaseD.passedChecks

  // ===========================================================================
  // PHASE E — /api/score-conversation deep-depth wiring (E3)
  // ===========================================================================

  const phaseE = await runConsumerWiringPhase(
    {
      label: 'E',
      depth: 'deep',
      consumerDescription: '/api/score-conversation deep-depth wiring (E3)',
      ceilingChars: 14000,
    },
    deps,
  )
  totalChecks += phaseE.totalChecks
  passedChecks += phaseE.passedChecks

  // ===========================================================================
  // PHASE F — /api/score-social standard-depth wiring (E4)
  // ===========================================================================

  const phaseF = await runConsumerWiringPhase(
    {
      label: 'F',
      depth: 'standard',
      consumerDescription: '/api/score-social standard-depth wiring (E4)',
      ceilingChars: 12000,
    },
    deps,
  )
  totalChecks += phaseF.totalChecks
  passedChecks += phaseF.passedChecks

  // ===========================================================================
  // SUMMARY
  // ===========================================================================

  console.log('---')
  console.log(`SUMMARY: ${passedChecks} / ${totalChecks} checks passed`)
  if (passedChecks === totalChecks) {
    console.log('ALL CHECKS PASSED')
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
