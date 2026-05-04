/**
 * verify-internal-retrieve.ts — verification harness for /api/internal/retrieve.
 *
 * Run from inside website/:
 *   npx tsx scripts/verify-internal-retrieve.ts
 *
 * What this does:
 *   PHASE A — Pure-helper tests (no network):
 *     A1. toBm25OrShape on the 5 C-bis queries — assert OR-shape transforms.
 *     A2. validateRequest on valid + invalid inputs — assert pass/fail behaviour.
 *
 *   PHASE B — Wiring test (real OpenAI + real Supabase):
 *     B1. For each of the 5 C-bis queries, call retrievePassages(...) with
 *         the OR-shaped query + per-request cache, then reRank(...) — exactly
 *         the wiring shape the route runs. Assert the expected passage_id
 *         appears in the top-K post-rerank.
 *     B2. Cache test — call B1's first query a second time with the same
 *         cache; assert cache_hit and elapsed_ms ≈ 0.
 *
 *   PHASE C — BM25 reformulation effect:
 *     C1. For each C-bis query, compare bm25_count BEFORE reformulation
 *         (raw query) vs AFTER (OR-shaped). Surface the lift.
 *
 * The founder reviews the printed output and confirms each test reports OK.
 * Step 4 of Sub-session D.
 *
 * Cross-references:
 *   - /adopted/adr/2026-05-04-d6-d7-consumer-wiring.md (ADR-001)
 *   - /website/src/app/api/internal/retrieve/route.ts
 *   - /website/src/app/api/internal/retrieve/helpers.ts
 *   - /website/scripts/test-retrieval-rerank.ts (C-bis predecessor pattern)
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// -----------------------------------------------------------------------------
// 1. Load .env.local manually (no dotenv dep) — same pattern as C-bis harness
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
// 2. Test plan — 5 C-bis queries + expected top-3 passage_ids
// -----------------------------------------------------------------------------

interface TestQuery {
  label: string
  query: string
  expected_passage_id: string
  filters: {
    mechanism_filter?: string[]
    passion_filter?: string
    sub_passion_filter?: string
    passage_type_filter?: import('@/lib/rag').PassageType[]
    trigger_condition_filter?: string
    intake_tier_filter?: 1 | 2 | 3
  }
}

// All 5 queries + filters mirror /website/scripts/test-retrieval-rerank.ts
// (the C-bis verification harness) verbatim, so this script's results are
// directly comparable to D-RETRIEVAL-RERANK-IMPLEMENTED-2026-05-04 baseline.
// Expected passage_id values are the top-1 from C-bis's run.
const TEST_QUERIES: TestQuery[] = [
  {
    label: 'Q1 philodoxia false-judgement',
    query: 'philodoxia false judgement reputation',
    expected_passage_id: 'passions:epithumia:philodoxia:definition',
    filters: {
      mechanism_filter: ['passion_false_judgement'],
      passion_filter: 'epithumia',
      sub_passion_filter: 'philodoxia',
      passage_type_filter: ['mechanism'],
    },
  },
  {
    label: 'Q2 dichotomy of control',
    query: 'dichotomy of control what is up to us',
    expected_passage_id: 'stoic-brain:foundations:dichotomy_of_control:up_to_us:list',
    filters: {
      mechanism_filter: ['prohairesis_filter'],
      passage_type_filter: ['mechanism', 'canonical_line'],
    },
  },
  {
    label: 'Q3 oikeiosis stage',
    query: 'oikeiosis circle of concern self-other expansion',
    expected_passage_id: 'action:oikeiosis:stage_2_family',
    filters: {
      mechanism_filter: ['oikeiosis_stage'],
      passage_type_filter: ['mechanism'],
    },
  },
  {
    label: 'Q4 TEMPORAL_AMBIGUITY focus stem',
    query: 'temporal ambiguity when is the reflection covering',
    expected_passage_id: 'tier_1:temporal_ambiguity:001',
    filters: {
      passage_type_filter: ['focus_question_stem'],
      trigger_condition_filter: 'TEMPORAL_AMBIGUITY',
      intake_tier_filter: 1,
    },
  },
  {
    label: 'Q5 passion root detection',
    query: 'epithumia desire grasping for what we lack',
    expected_passage_id: 'passions:epithumia:definition',
    filters: {
      mechanism_filter: ['passion_root_detection'],
      passage_type_filter: ['mechanism'],
    },
  },
]

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
  const { toBm25OrShape, validateRequest } = await import(
    '@/app/api/internal/retrieve/helpers'
  )

  let totalChecks = 0
  let passedChecks = 0

  // ===========================================================================
  // PHASE A — Pure-helper tests
  // ===========================================================================

  console.log('PHASE A — Pure-helper tests')
  console.log('---------------------------\n')

  console.log('A1. toBm25OrShape on 5 C-bis queries')
  for (const tq of TEST_QUERIES) {
    totalChecks++
    const transformed = toBm25OrShape(tq.query)
    const tokensRaw = tq.query.toLowerCase().split(/\s+/).filter((t) => t.length >= 2)
    const expectedOr = tokensRaw.join(' OR ')
    if (transformed === expectedOr) {
      ok(`${tq.label} → ${transformed.length > 60 ? transformed.slice(0, 57) + '...' : transformed}`)
      passedChecks++
    } else {
      fail(`${tq.label}: expected "${expectedOr}", got "${transformed}"`)
    }
  }
  console.log()

  console.log('A2. validateRequest acceptance / rejection')
  const validationCases: Array<{
    name: string
    body: unknown
    expectOk: boolean
    expectErrorContains?: string
  }> = [
    { name: 'valid minimal request', body: { query: 'hello' }, expectOk: true },
    {
      name: 'valid full request',
      body: {
        query: 'philodoxia',
        mechanism_filter: ['passion_false_judgement'],
        passion_filter: 'epithumia',
        sub_passion_filter: 'philodoxia',
        passage_type_filter: ['mechanism'],
        top_k: 20,
        top_k_after_rerank: 3,
        rerank_policy: 'heuristic',
        trace_enabled: true,
      },
      expectOk: true,
    },
    { name: 'missing query', body: {}, expectOk: false, expectErrorContains: 'query' },
    {
      name: 'empty query',
      body: { query: '   ' },
      expectOk: false,
      expectErrorContains: 'must not be empty',
    },
    {
      name: 'wrong type passage_type_filter',
      body: { query: 'x', passage_type_filter: ['not_a_real_type'] },
      expectOk: false,
      expectErrorContains: 'invalid values',
    },
    {
      name: 'bad rerank_policy (cross_encoder rejected at validation)',
      body: { query: 'x', rerank_policy: 'cross_encoder' },
      expectOk: false,
      expectErrorContains: 'rerank_policy',
    },
    {
      name: 'bad intake_tier_filter (4)',
      body: { query: 'x', intake_tier_filter: 4 },
      expectOk: false,
      expectErrorContains: 'intake_tier_filter',
    },
    {
      name: 'top_k out of range (101)',
      body: { query: 'x', top_k: 101 },
      expectOk: false,
      expectErrorContains: 'top_k',
    },
    {
      name: 'non-object body',
      body: 'just a string',
      expectOk: false,
      expectErrorContains: 'JSON object',
    },
  ]
  for (const tc of validationCases) {
    totalChecks++
    const result = validateRequest(tc.body)
    if (tc.expectOk) {
      if (result.ok) {
        ok(`${tc.name}: accepted`)
        passedChecks++
      } else {
        fail(`${tc.name}: expected accept, got reject (${result.error}: ${result.details?.join('; ')})`)
      }
    } else {
      if (!result.ok) {
        const allText = `${result.error} ${(result.details || []).join(' ')}`
        if (!tc.expectErrorContains || allText.includes(tc.expectErrorContains)) {
          ok(`${tc.name}: rejected as expected`)
          passedChecks++
        } else {
          fail(
            `${tc.name}: rejected but error didn't contain "${tc.expectErrorContains}" — got "${allText}"`
          )
        }
      } else {
        fail(`${tc.name}: expected reject, got accept`)
      }
    }
  }
  console.log()

  // ===========================================================================
  // PHASE B — Wiring test (real OpenAI + real Supabase)
  // ===========================================================================

  console.log('PHASE B — Wiring test (real OpenAI + Supabase)')
  console.log('----------------------------------------------\n')

  const sharedCache = new Map()
  const wiringResults: Array<{
    label: string
    bm25_count: number
    vector_count: number
    fusion_count: number
    cache_hit: boolean
    elapsed_ms: number
    top_passage_id: string | null
    expected_in_top: boolean
  }> = []

  for (const tq of TEST_QUERIES) {
    totalChecks++
    const bm25Query = toBm25OrShape(tq.query)
    const retrieveInput = {
      query: tq.query,
      bm25_query: bm25Query,
      ...tq.filters,
    }
    let retrieved
    try {
      retrieved = await retrievePassages(retrieveInput, sharedCache)
    } catch (err) {
      fail(`${tq.label}: retrievePassages threw — ${(err as Error).message}`)
      continue
    }
    const topK = await reRank(
      retrieved.passages,
      retrieveInput, // input.query is already the original; heuristic uses it for tag context
      'heuristic',
      { top_k_after_rerank: 3 }
    )
    const passageIds = topK.map((p) => p.passage_id)
    const expectedFound = passageIds.includes(tq.expected_passage_id)
    if (expectedFound) {
      ok(`${tq.label}: expected passage_id in top-3`)
      passedChecks++
    } else {
      fail(`${tq.label}: expected "${tq.expected_passage_id}" NOT in top-3`)
    }
    info(
      `bm25=${retrieved.retrieval_diagnostics.bm25_count}, ` +
        `vector=${retrieved.retrieval_diagnostics.vector_count}, ` +
        `fusion=${retrieved.retrieval_diagnostics.fusion_count}, ` +
        `elapsed=${retrieved.retrieval_diagnostics.elapsed_ms}ms`
    )
    info(`top-3: ${passageIds.join(', ')}`)
    wiringResults.push({
      label: tq.label,
      bm25_count: retrieved.retrieval_diagnostics.bm25_count,
      vector_count: retrieved.retrieval_diagnostics.vector_count,
      fusion_count: retrieved.retrieval_diagnostics.fusion_count,
      cache_hit: retrieved.retrieval_diagnostics.cache_hit,
      elapsed_ms: retrieved.retrieval_diagnostics.elapsed_ms,
      top_passage_id: passageIds[0] ?? null,
      expected_in_top: expectedFound,
    })
  }
  console.log()

  console.log('B2. Cache test — re-running Q1 against the warm cache')
  totalChecks++
  const tq1 = TEST_QUERIES[0]
  const bm25Q1 = toBm25OrShape(tq1.query)
  const replay = await retrievePassages(
    { query: tq1.query, bm25_query: bm25Q1, ...tq1.filters },
    sharedCache
  )
  if (replay.retrieval_diagnostics.cache_hit && replay.retrieval_diagnostics.elapsed_ms < 20) {
    ok(
      `cache hit: cache_hit=${replay.retrieval_diagnostics.cache_hit}, ` +
        `elapsed=${replay.retrieval_diagnostics.elapsed_ms}ms`
    )
    passedChecks++
  } else {
    fail(
      `cache test: cache_hit=${replay.retrieval_diagnostics.cache_hit}, ` +
        `elapsed=${replay.retrieval_diagnostics.elapsed_ms}ms (expected hit + sub-20ms)`
    )
  }
  console.log()

  // ===========================================================================
  // PHASE C — BM25 reformulation effect (raw vs OR-shaped)
  // ===========================================================================

  console.log('PHASE C — BM25 reformulation effect (raw query vs OR-shaped)')
  console.log('------------------------------------------------------------\n')

  // Both calls use the same `query` (so vector channel is held constant);
  // only bm25_query differs. Fresh cache per call so we get real DB reads.
  for (const tq of TEST_QUERIES) {
    totalChecks++
    const cacheRaw = new Map()
    const cacheOr = new Map()

    let rawResult
    try {
      rawResult = await retrievePassages(
        { query: tq.query, ...tq.filters },
        cacheRaw
      )
    } catch (err) {
      fail(`${tq.label}: raw bm25 query threw — ${(err as Error).message}`)
      continue
    }
    let orResult
    try {
      orResult = await retrievePassages(
        { query: tq.query, bm25_query: toBm25OrShape(tq.query), ...tq.filters },
        cacheOr
      )
    } catch (err) {
      fail(`${tq.label}: OR-shaped bm25 query threw — ${(err as Error).message}`)
      continue
    }
    const lift = orResult.retrieval_diagnostics.bm25_count - rawResult.retrieval_diagnostics.bm25_count
    if (orResult.retrieval_diagnostics.bm25_count >= rawResult.retrieval_diagnostics.bm25_count) {
      ok(
        `${tq.label}: BM25 raw=${rawResult.retrieval_diagnostics.bm25_count} → OR=${orResult.retrieval_diagnostics.bm25_count} (lift +${lift})`
      )
      passedChecks++
    } else {
      fail(
        `${tq.label}: BM25 OR-shaped (${orResult.retrieval_diagnostics.bm25_count}) WORSE than raw (${rawResult.retrieval_diagnostics.bm25_count})`
      )
    }
  }
  console.log()

  // ===========================================================================
  // SUMMARY
  // ===========================================================================

  console.log('SUMMARY')
  console.log('-------')
  console.log(`Checks passed: ${passedChecks} / ${totalChecks}`)
  console.log()
  console.log('Per-query wiring summary:')
  console.log(
    '  label                              | bm25 | vec | fusion | elapsed | top-3 ✓'
  )
  console.log(
    '  -----------------------------------|------|-----|--------|---------|--------'
  )
  for (const r of wiringResults) {
    const pad = (s: string, n: number) => s.padEnd(n).slice(0, n)
    console.log(
      `  ${pad(r.label, 35)}| ${String(r.bm25_count).padStart(4)} | ${String(r.vector_count).padStart(3)} | ${String(r.fusion_count).padStart(6)} | ${String(r.elapsed_ms).padStart(7)} | ${r.expected_in_top ? '✓' : '✗'}`
    )
  }

  if (passedChecks === totalChecks) {
    console.log('\nALL CHECKS PASSED.')
    process.exit(0)
  } else {
    console.log(`\n${totalChecks - passedChecks} CHECK(S) FAILED.`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Verification harness failed:', err)
  process.exit(1)
})
