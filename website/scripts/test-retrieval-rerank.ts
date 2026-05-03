/**
 * test-retrieval-rerank.ts — verification harness for D6 + D7.
 *
 * Run from inside website/:
 *   npx tsx scripts/test-retrieval-rerank.ts
 *
 * What this does:
 *   1. Loads credentials from website/.env.local (manual parse — no dotenv dep)
 *   2. Imports D6 + D7 dynamically (env must load BEFORE supabase-server.ts)
 *   3. Runs 5 representative queries through retrievePassages → reRank
 *   4. Prints diagnostics + post-rerank top 3 for each
 *   5. Reports total OpenAI embedding cost + latency observations
 *
 * The founder reviews the output and confirms expected passage_ids appear at
 * the top of each result. Step 4 of Sub-session C-bis.
 *
 * Cross-references:
 *   - /operations/handoffs/founder/2026-05-XX-sub-session-C-bis-NEXT-SESSION-PROMPT.md
 *   - /website/src/lib/rag/retrieve-passages.ts (D6)
 *   - /website/src/lib/rag/rerank.ts (D7)
 *   - /operations/migrations/2026-05-04-retrieval-rpc-functions.sql (RPCs)
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// -----------------------------------------------------------------------------
// 1. Load .env.local manually (no dotenv dep)
// -----------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ENV_LOCAL_PATH = join(__dirname, '..', '.env.local');

function loadEnvFile(path: string): void {
  const content = readFileSync(path, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

try {
  loadEnvFile(ENV_LOCAL_PATH);
  console.log(`[env] loaded ${ENV_LOCAL_PATH}`);
} catch (err) {
  console.error(`[env] FAILED to load ${ENV_LOCAL_PATH}:`, err);
  process.exit(1);
}

const REQUIRED_ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[env] MISSING required env var: ${key}`);
    process.exit(1);
  }
}
console.log(`[env] all required env vars present\n`);

// -----------------------------------------------------------------------------
// 2. Test query definitions (D6 + D7 imported lazily inside main())
// -----------------------------------------------------------------------------

interface TestQuery {
  label: string;
  description: string;
  input: {
    query: string;
    mechanism_filter?: string[];
    passion_filter?: string;
    sub_passion_filter?: string;
    passage_type_filter?: Array<'mechanism' | 'canonical_line' | 'example' | 'focus_question_stem' | 'scoring_rule'>;
    trigger_condition_filter?: string;
    intake_tier_filter?: 1 | 2 | 3;
    top_k?: number;
    trace_enabled?: boolean;
  };
  expectedTopMatch: string;
}

const TESTS: TestQuery[] = [
  {
    label: 'Q1 — philodoxia false-judgement template',
    description: 'Rule 5 Pass-1 shape: retrieve canonical false-judgement template for philodoxia.',
    input: {
      query: 'philodoxia false judgement reputation',
      mechanism_filter: ['passion_false_judgement'],
      passion_filter: 'epithumia',
      sub_passion_filter: 'philodoxia',
      passage_type_filter: ['mechanism'],
      top_k: 20,
    },
    expectedTopMatch: 'philodoxia',
  },
  {
    label: 'Q2 — dichotomy of control',
    description: 'Rule 1 shape: retrieve up_to_us list for prohairesis filter.',
    input: {
      query: 'dichotomy of control what is up to us',
      mechanism_filter: ['prohairesis_filter'],
      passage_type_filter: ['mechanism', 'canonical_line'],
      top_k: 20,
    },
    expectedTopMatch: 'dichotomy_of_control',
  },
  {
    label: 'Q3 — oikeiosis stage',
    description: 'Rule 6 shape: retrieve oikeiosis stage definitions.',
    input: {
      query: 'oikeiosis circle of concern self-other expansion',
      mechanism_filter: ['oikeiosis_stage'],
      passage_type_filter: ['mechanism'],
      top_k: 20,
    },
    expectedTopMatch: 'oikeiosis',
  },
  {
    label: 'Q4 — TEMPORAL_AMBIGUITY focus stem',
    description: 'Layer 3 trigger fire: retrieve canonical Tier 1 stem.',
    input: {
      query: 'temporal ambiguity when is the reflection covering',
      passage_type_filter: ['focus_question_stem'],
      trigger_condition_filter: 'TEMPORAL_AMBIGUITY',
      intake_tier_filter: 1,
      top_k: 5,
    },
    expectedTopMatch: 'TEMPORAL_AMBIGUITY',
  },
  {
    label: 'Q5 — passion root detection',
    description: 'Rule 2 shape: retrieve root passion definitions.',
    input: {
      query: 'epithumia desire grasping for what we lack',
      mechanism_filter: ['passion_root_detection'],
      passage_type_filter: ['mechanism'],
      top_k: 20,
    },
    expectedTopMatch: 'epithumia',
  },
];

// -----------------------------------------------------------------------------
// 4. Run tests
// -----------------------------------------------------------------------------

function snippet(text: string, maxLen = 100): string {
  const oneLine = text.replace(/\s+/g, ' ').trim();
  return oneLine.length <= maxLen ? oneLine : oneLine.slice(0, maxLen - 1) + '…';
}

interface RunOutcome {
  label: string;
  elapsed_ms: number;
  bm25_count: number;
  vector_count: number;
  fusion_count: number;
  expected_match_in_top_3: boolean;
  query_chars: number;
  degraded: boolean;
}

// Module-level handles populated by main() after dynamic import
type RagModule = typeof import('../src/lib/rag/index');
let retrievePassages: RagModule['retrievePassages'];
let reRank: RagModule['reRank'];

async function runOne(test: TestQuery): Promise<RunOutcome> {
  console.log(`\n${'='.repeat(78)}`);
  console.log(test.label);
  console.log('-'.repeat(78));
  console.log(test.description);
  console.log(`Query: "${test.input.query}"`);

  const cache = new Map();
  const retrieved = await retrievePassages(test.input, cache);

  console.log(`\nRetrieval diagnostics:`);
  console.log(`  bm25_count:   ${retrieved.retrieval_diagnostics.bm25_count}`);
  console.log(`  vector_count: ${retrieved.retrieval_diagnostics.vector_count}`);
  console.log(`  fusion_count: ${retrieved.retrieval_diagnostics.fusion_count}`);
  console.log(`  cache_hit:    ${retrieved.retrieval_diagnostics.cache_hit}`);
  console.log(`  elapsed_ms:   ${retrieved.retrieval_diagnostics.elapsed_ms}`);
  if (retrieved.retrieval_diagnostics.degraded_retrieval) {
    console.log(`  *** degraded_retrieval: TRUE ***`);
  }

  const reranked = await reRank(retrieved.passages, test.input, 'heuristic', {
    top_k_after_rerank: 3,
  });

  console.log(`\nPost-rerank top 3:`);
  reranked.forEach((p, idx) => {
    console.log(
      `  [${idx + 1}] passage_id="${p.passage_id}"  type=${p.passage_type}` +
        `  rrf=${p.rrf_score.toFixed(5)}  rerank=${(p.rerank_score ?? 0).toFixed(5)}`
    );
    console.log(`      text: ${snippet(p.text)}`);
  });

  const matched = reranked.some((p) =>
    p.passage_id.toLowerCase().includes(test.expectedTopMatch.toLowerCase())
  );
  console.log(
    `\nExpected match for "${test.expectedTopMatch}" in top 3: ${matched ? '✓ YES' : '✗ NO'}`
  );

  return {
    label: test.label,
    elapsed_ms: retrieved.retrieval_diagnostics.elapsed_ms,
    bm25_count: retrieved.retrieval_diagnostics.bm25_count,
    vector_count: retrieved.retrieval_diagnostics.vector_count,
    fusion_count: retrieved.retrieval_diagnostics.fusion_count,
    expected_match_in_top_3: matched,
    query_chars: test.input.query.length,
    degraded: retrieved.retrieval_diagnostics.degraded_retrieval ?? false,
  };
}

async function main() {
  console.log('========================================================');
  console.log(' Sub-session C-bis verification harness — D6 + D7');
  console.log('========================================================');
  console.log(`Started: ${new Date().toISOString()}\n`);

  // Dynamic import — must come AFTER env is loaded (supabase-server reads env at module top)
  const ragModule = await import('../src/lib/rag/index');
  retrievePassages = ragModule.retrievePassages;
  reRank = ragModule.reRank;

  const outcomes: RunOutcome[] = [];
  for (const t of TESTS) {
    try {
      outcomes.push(await runOne(t));
    } catch (err) {
      console.error(`\n!!! ${t.label} threw:`, err);
    }
  }

  // Cold + warm same-query for Q1 (cache test)
  console.log(`\n${'='.repeat(78)}`);
  console.log(`Q1 cold + warm comparison (cache test)`);
  console.log('-'.repeat(78));
  const sharedCache = new Map();
  const cold = await retrievePassages(TESTS[0].input, sharedCache);
  const warm = await retrievePassages(TESTS[0].input, sharedCache);
  console.log(`  cold: elapsed_ms=${cold.retrieval_diagnostics.elapsed_ms}, cache_hit=${cold.retrieval_diagnostics.cache_hit}`);
  console.log(`  warm: elapsed_ms=${warm.retrieval_diagnostics.elapsed_ms}, cache_hit=${warm.retrieval_diagnostics.cache_hit}`);

  console.log(`\n${'='.repeat(78)}`);
  console.log('SUMMARY');
  console.log('='.repeat(78));
  console.log(`Tests run:                       ${outcomes.length}/${TESTS.length}`);
  const matchedCount = outcomes.filter((o) => o.expected_match_in_top_3).length;
  console.log(`Tests with expected match top-3: ${matchedCount}/${outcomes.length}`);
  const degradedCount = outcomes.filter((o) => o.degraded).length;
  console.log(`Tests with degraded retrieval:   ${degradedCount}/${outcomes.length}`);

  // Cost estimate
  const totalChars = outcomes.reduce((acc, o) => acc + o.query_chars, 0)
    + 2 * (outcomes[0]?.query_chars ?? 0); // cold + warm extra
  const estimatedTokens = Math.ceil(totalChars / 4); // rough
  const costUSD = (estimatedTokens / 1_000_000) * 0.02;
  console.log(`\nCost (text-embedding-3-small @ $0.02/1M):`);
  console.log(`  estimated tokens: ~${estimatedTokens}`);
  console.log(`  estimated cost:   $${costUSD.toFixed(7)}`);

  console.log(`\nLatencies (warm target <200ms; cold target <500ms):`);
  outcomes.forEach((o) => {
    console.log(`  ${o.label.padEnd(50)} ${o.elapsed_ms}ms  bm25=${o.bm25_count} vec=${o.vector_count} fusion=${o.fusion_count}`);
  });
  console.log(`  Q1 cold (cache miss)                              ${cold.retrieval_diagnostics.elapsed_ms}ms`);
  console.log(`  Q1 warm (cache hit)                               ${warm.retrieval_diagnostics.elapsed_ms}ms`);

  console.log(`\nCompleted: ${new Date().toISOString()}`);

  const allMatched = outcomes.every((o) => o.expected_match_in_top_3);
  process.exit(allMatched && outcomes.length === TESTS.length ? 0 : 1);
}

main().catch((err) => {
  console.error('\n!!! Test harness top-level error:', err);
  process.exit(1);
});
