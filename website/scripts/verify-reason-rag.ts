/**
 * verify-reason-rag.ts — verification harness for /api/reason + /api/score RAG wiring.
 *
 * Originally produced for Sub-session E1 (/api/reason quick-depth). Extended in
 * Sub-session E2 with Phase D — /api/score standard-depth wiring.
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
 *   PHASE B — /api/reason quick-depth wiring test (real OpenAI + real Supabase):
 *     For each of 3 representative /api/reason quick-depth inputs (career
 *     decision, passion-driven situation, oikeiosis-relevant relationship):
 *     B1. Run retrievePassages + reRank with the depth-mapped mechanism filter
 *         and top_k_after_rerank — exactly the call shape loadLayer1WithFallback
 *         runs in the route.
 *     B2. Assert: returned passages array is non-empty.
 *     B3. Assert: every returned passage's canonical_mechanism overlaps with
 *         the depth's expected corpus mechanism IDs.
 *     B4. Assert: every returned passage carries source_citation (R7).
 *     B5. Cache replay test — call fixture 1 a second time with the same
 *         per-request cache; assert cache_hit and elapsed_ms ≈ 0.
 *
 *   PHASE C — Comparison axis (old vs new Layer 1) at quick depth:
 *     For each of the 3 fixtures, render Layer 1 content via:
 *       - OLD path: getStoicBrainContext('quick') string
 *       - NEW path: formatRetrievedPassagesAsBlock(<retrieved passages>)
 *     C1. Both paths produce non-empty content.
 *     C2. New path stays under the 12000-char ceiling (quick-depth budget).
 *     C3. Print a first-200-char preview of each path for founder visual
 *         comparison. The founder judges semantic equivalence.
 *
 *   PHASE D (E2) — /api/score standard-depth wiring + comparison axis:
 *     Same shape as Phase B + C, but at standard depth (8 corpus mechanisms,
 *     top_k=25/top_k_after_rerank=12). The existing 3 fixtures function as
 *     "actions to score" — input semantics overlap closely with /api/reason.
 *     D1. retrievePassages + reRank at standard depth → non-empty.
 *     D2. Every passage's canonical_mechanism in the standard-depth filter.
 *     D3. Every passage carries source_citation (R7).
 *     D4. Cache replay (separate per-request cache from Phase B).
 *     D5. OLD vs NEW comparison axis at standard depth (against
 *         getStoicBrainContext('standard') ~1538 tokens / ~6000 chars).
 *
 * Exit code 0 if all checks pass; 1 otherwise.
 *
 * E3+ candidate: factor Phase B + Phase D into a shared
 *   `runConsumerWiringPhase(depth, fixtures, harness)` helper if more consumers
 *   come online. Lighter touch for E2 — duplicate the block for clarity.
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - /website/src/app/api/reason/route.ts (E1 consumer — quick depth)
 *   - /website/src/app/api/score/route.ts (E2 consumer — standard depth)
 *   - /website/src/app/api/reason/helpers.ts (depth-mechanism mapping; shared by both consumers)
 *   - /website/src/lib/sage-reason-engine.ts (formatRetrievedPassagesAsBlock)
 *   - /website/scripts/verify-internal-retrieve.ts (Sub-session D harness pattern)
 *   - /operations/decision-log.md D-INTERNAL-RETRIEVE-ROUTE-VERIFIED-2026-05-04
 *   - /operations/decision-log.md D-REASON-RAG-WIRED-2026-05-04
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
// 2. Test fixtures — 3 representative /api/reason quick-depth inputs
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
// Standard-depth expected mechanisms = quick + ['value_indifferent', 'virtue_domain_engaged'].
// Asserted inline in Phase A; resolved at runtime via getCorpusMechanismsForDepth('standard') in Phase D.

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
// 4. Main
// -----------------------------------------------------------------------------

async function main() {
  // Lazy import — env must be loaded before supabase-server.ts runs
  const { retrievePassages, reRank } = await import('@/lib/rag')
  const {
    getCorpusMechanismsForDepth,
    RETRIEVAL_TOP_K_BY_DEPTH,
    toBm25OrShape,
  } = await import('@/app/api/reason/helpers')
  const { formatRetrievedPassagesAsBlock } = await import('@/lib/sage-reason-engine')
  const { getStoicBrainContext } = await import('@/lib/context/stoic-brain-loader')

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
  // PHASE B — Wiring test (real Supabase + OpenAI)
  // ===========================================================================

  console.log('PHASE B — Wiring test (real Supabase + OpenAI)')
  console.log('----------------------------------------------\n')

  const cache = new Map()
  const fixtureResults: Array<{ fixture: ReasonFixture; passages: Awaited<ReturnType<typeof reRank>>; elapsed_ms: number }> = []

  for (const fixture of FIXTURES) {
    console.log(`B/${fixture.label} — running retrievePassages + reRank`)
    info(`input: ${fixture.input.slice(0, 80)}${fixture.input.length > 80 ? '...' : ''}`)
    info(`rationale: ${fixture.rationale}`)

    const corpusMechanisms = getCorpusMechanismsForDepth('quick')
    const { top_k, top_k_after_rerank } = RETRIEVAL_TOP_K_BY_DEPTH.quick
    const retrieveInput = {
      query: fixture.input,
      bm25_query: toBm25OrShape(fixture.input),
      mechanism_filter: corpusMechanisms,
      passage_type_filter: ['mechanism' as const],
      top_k,
    }

    const start = Date.now()
    const result = await retrievePassages(retrieveInput, cache)
    const top = await reRank(result.passages, retrieveInput, 'heuristic', { top_k_after_rerank })
    const elapsed_ms = Date.now() - start

    info(
      `bm25_count=${result.retrieval_diagnostics.bm25_count} ` +
      `vector_count=${result.retrieval_diagnostics.vector_count} ` +
      `fusion_count=${result.retrieval_diagnostics.fusion_count} ` +
      `elapsed_ms=${elapsed_ms} (D6=${result.retrieval_diagnostics.elapsed_ms}ms) ` +
      `→ reranked top=${top.length}`,
    )

    // B-assert: non-empty
    totalChecks++
    if (top.length > 0) {
      ok(`returned ${top.length} passages (top_k_after_rerank=${top_k_after_rerank})`)
      passedChecks++
    } else {
      fail(`returned 0 passages`)
    }

    // B-assert: every passage's canonical_mechanism overlaps the depth filter
    totalChecks++
    const allInFilter = top.every((p) =>
      p.canonical_mechanism.some((m) => corpusMechanisms.includes(m)),
    )
    if (allInFilter) {
      ok(`every passage's canonical_mechanism is in depth filter`)
      passedChecks++
    } else {
      const offenders = top.filter(
        (p) => !p.canonical_mechanism.some((m) => corpusMechanisms.includes(m)),
      )
      fail(`${offenders.length}/${top.length} passages outside filter`)
      for (const o of offenders) info(`  out-of-filter: ${o.passage_id} mechanisms=[${o.canonical_mechanism.join(',')}]`)
    }

    // B-assert: every passage carries source_citation (R7)
    totalChecks++
    const allCited = top.every((p) => typeof p.source_citation === 'string' && p.source_citation.length > 0)
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

  console.log('B-cache. Replay F1 with the same per-request cache')
  totalChecks++
  const f1 = FIXTURES[0]
  const corpusMechanisms = getCorpusMechanismsForDepth('quick')
  const { top_k } = RETRIEVAL_TOP_K_BY_DEPTH.quick
  const retrieveInputReplay = {
    query: f1.input,
    bm25_query: toBm25OrShape(f1.input),
    mechanism_filter: corpusMechanisms,
    passage_type_filter: ['mechanism' as const],
    top_k,
  }
  const start = Date.now()
  const replay = await retrievePassages(retrieveInputReplay, cache)
  const elapsed_ms = Date.now() - start
  if (replay.retrieval_diagnostics.cache_hit && elapsed_ms < 50) {
    ok(`cache_hit=true, elapsed_ms=${elapsed_ms} (≈0ms)`)
    passedChecks++
  } else {
    fail(
      `expected cache_hit + ≈0ms, got cache_hit=${replay.retrieval_diagnostics.cache_hit}, ` +
      `elapsed_ms=${elapsed_ms}`,
    )
  }
  console.log()

  // ===========================================================================
  // PHASE C — Comparison axis (old vs new Layer 1)
  // ===========================================================================

  console.log('PHASE C — Comparison axis (old vs new Layer 1)')
  console.log('----------------------------------------------\n')

  const oldLayer1 = getStoicBrainContext('quick')
  console.log(`OLD path getStoicBrainContext('quick'): ${oldLayer1.length} chars`)
  console.log(`         first 200: ${oldLayer1.slice(0, 200).replace(/\n/g, ' / ')}...\n`)

  const QUICK_CEILING_CHARS = 12000

  for (const { fixture, passages } of fixtureResults) {
    const newLayer1 = formatRetrievedPassagesAsBlock(passages)
    console.log(`NEW path for ${fixture.label}: ${newLayer1.length} chars (${passages.length} passages)`)
    console.log(`         first 200: ${newLayer1.slice(0, 200).replace(/\n/g, ' / ')}...`)

    // C-assert: both paths produce non-empty content
    totalChecks++
    if (oldLayer1.length > 0 && newLayer1.length > 0) {
      ok(`both paths non-empty (OLD=${oldLayer1.length} chars, NEW=${newLayer1.length} chars)`)
      passedChecks++
    } else {
      fail(`empty content: OLD=${oldLayer1.length}, NEW=${newLayer1.length}`)
    }

    // C-assert: new path under quick-depth ceiling
    totalChecks++
    if (newLayer1.length <= QUICK_CEILING_CHARS) {
      ok(`new path within ceiling (${newLayer1.length} ≤ ${QUICK_CEILING_CHARS})`)
      passedChecks++
    } else {
      fail(`new path exceeds ceiling: ${newLayer1.length} > ${QUICK_CEILING_CHARS}`)
    }
    console.log()
  }

  // ===========================================================================
  // PHASE D (E2) — /api/score standard-depth wiring + comparison axis
  // ===========================================================================

  console.log('PHASE D — /api/score standard-depth wiring (E2)')
  console.log('-----------------------------------------------\n')

  const cacheD = new Map()
  const fixtureResultsStandard: Array<{
    fixture: ReasonFixture
    passages: Awaited<ReturnType<typeof reRank>>
    elapsed_ms: number
  }> = []

  const standardCorpusMechanisms = getCorpusMechanismsForDepth('standard')
  const { top_k: standardTopK, top_k_after_rerank: standardTopKRerank } =
    RETRIEVAL_TOP_K_BY_DEPTH.standard

  for (const fixture of FIXTURES) {
    console.log(`D/${fixture.label} — running retrievePassages + reRank @ standard depth`)
    info(`input (as /api/score 'action'): ${fixture.input.slice(0, 80)}${fixture.input.length > 80 ? '...' : ''}`)
    info(`rationale: ${fixture.rationale}`)

    const retrieveInput = {
      query: fixture.input,
      bm25_query: toBm25OrShape(fixture.input),
      mechanism_filter: standardCorpusMechanisms,
      passage_type_filter: ['mechanism' as const],
      top_k: standardTopK,
    }

    const start = Date.now()
    const result = await retrievePassages(retrieveInput, cacheD)
    const top = await reRank(result.passages, retrieveInput, 'heuristic', {
      top_k_after_rerank: standardTopKRerank,
    })
    const elapsed_ms = Date.now() - start

    info(
      `bm25_count=${result.retrieval_diagnostics.bm25_count} ` +
      `vector_count=${result.retrieval_diagnostics.vector_count} ` +
      `fusion_count=${result.retrieval_diagnostics.fusion_count} ` +
      `elapsed_ms=${elapsed_ms} (D6=${result.retrieval_diagnostics.elapsed_ms}ms) ` +
      `→ reranked top=${top.length}`,
    )

    // D-assert: non-empty
    totalChecks++
    if (top.length > 0) {
      ok(`returned ${top.length} passages (top_k_after_rerank=${standardTopKRerank})`)
      passedChecks++
    } else {
      fail(`returned 0 passages`)
    }

    // D-assert: every passage's canonical_mechanism overlaps the standard-depth filter
    totalChecks++
    const allInFilter = top.every((p) =>
      p.canonical_mechanism.some((m) => standardCorpusMechanisms.includes(m)),
    )
    if (allInFilter) {
      ok(`every passage's canonical_mechanism is in standard-depth filter`)
      passedChecks++
    } else {
      const offenders = top.filter(
        (p) => !p.canonical_mechanism.some((m) => standardCorpusMechanisms.includes(m)),
      )
      fail(`${offenders.length}/${top.length} passages outside filter`)
      for (const o of offenders)
        info(`  out-of-filter: ${o.passage_id} mechanisms=[${o.canonical_mechanism.join(',')}]`)
    }

    // D-assert: every passage carries source_citation (R7)
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

    fixtureResultsStandard.push({ fixture, passages: top, elapsed_ms })
    console.log()
  }

  console.log('D-cache. Replay F1 with the same per-request cache (Phase D)')
  totalChecks++
  const f1Standard = FIXTURES[0]
  const retrieveInputReplayStandard = {
    query: f1Standard.input,
    bm25_query: toBm25OrShape(f1Standard.input),
    mechanism_filter: standardCorpusMechanisms,
    passage_type_filter: ['mechanism' as const],
    top_k: standardTopK,
  }
  const startD = Date.now()
  const replayD = await retrievePassages(retrieveInputReplayStandard, cacheD)
  const elapsedD_ms = Date.now() - startD
  if (replayD.retrieval_diagnostics.cache_hit && elapsedD_ms < 50) {
    ok(`cache_hit=true, elapsed_ms=${elapsedD_ms} (≈0ms)`)
    passedChecks++
  } else {
    fail(
      `expected cache_hit + ≈0ms, got cache_hit=${replayD.retrieval_diagnostics.cache_hit}, ` +
      `elapsed_ms=${elapsedD_ms}`,
    )
  }
  console.log()

  // Comparison axis at standard depth
  console.log('D-comparison. OLD vs NEW Layer 1 at standard depth')
  const oldLayer1Standard = getStoicBrainContext('standard')
  console.log(
    `OLD path getStoicBrainContext('standard'): ${oldLayer1Standard.length} chars`,
  )
  console.log(
    `         first 200: ${oldLayer1Standard.slice(0, 200).replace(/\n/g, ' / ')}...\n`,
  )

  const STANDARD_CEILING_CHARS = 12000

  for (const { fixture, passages } of fixtureResultsStandard) {
    const newLayer1Standard = formatRetrievedPassagesAsBlock(passages)
    console.log(
      `NEW path for ${fixture.label}: ${newLayer1Standard.length} chars (${passages.length} passages)`,
    )
    console.log(
      `         first 200: ${newLayer1Standard.slice(0, 200).replace(/\n/g, ' / ')}...`,
    )

    // D-assert: both paths produce non-empty content
    totalChecks++
    if (oldLayer1Standard.length > 0 && newLayer1Standard.length > 0) {
      ok(
        `both paths non-empty (OLD=${oldLayer1Standard.length} chars, NEW=${newLayer1Standard.length} chars)`,
      )
      passedChecks++
    } else {
      fail(`empty content: OLD=${oldLayer1Standard.length}, NEW=${newLayer1Standard.length}`)
    }

    // D-assert: new path under standard-depth ceiling
    totalChecks++
    if (newLayer1Standard.length <= STANDARD_CEILING_CHARS) {
      ok(`new path within ceiling (${newLayer1Standard.length} ≤ ${STANDARD_CEILING_CHARS})`)
      passedChecks++
    } else {
      fail(
        `new path exceeds ceiling: ${newLayer1Standard.length} > ${STANDARD_CEILING_CHARS}`,
      )
    }
    console.log()
  }

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
