// ============================================================================
// 2026-05-04 — corpus_passages embedding generation pass (Sub-session C)
// ============================================================================
//
// Source: D5 Index Schema (Adopted 2026-05-02) §"Embedding model selection"
//         + D-CORPUS-PASSAGES-SCHEMA-2026-05-03 (the embedding deferral)
//         + D-CORPUS-PASSAGES-POPULATION-2026-05-03 (the 186-row substrate this script embeds)
//         + KG1 rule 2 (await all DB writes)
//
// What this script does:
//   1. Loads OPENAI_API_KEY + Supabase service-role creds from website/.env.local
//   2. Selects every row from corpus_passages where embedding IS NULL
//   3. Batches the rows in groups of 100 (OpenAI embeddings API supports
//      batched input arrays — cheaper + faster than per-row calls)
//   4. For each batch: sends `text` field to OpenAI text-embedding-3-small;
//      receives 1536-dim float32 vectors; writes them back to corpus_passages
//      via UPDATE ... WHERE id = $id (KG1 rule 2 — every UPDATE is awaited)
//   5. Reports progress + final cost
//
// Idempotent: re-runs only target rows where embedding IS NULL. Safe to re-run
// if interrupted (rows successfully embedded earlier in the run are skipped on
// retry). Safe to re-run after a TRUNCATE (would re-embed everything).
//
// To run:
//   cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
//   node operations/migrations/2026-05-04-corpus-passages-embeddings.mjs
//
// Expected output:
//   "Found 186 rows with NULL embedding. Generating in batches of 100..."
//   "Batch 1/2 (100 rows): 100 embeddings generated, written. Cumulative cost: $0.000XXX"
//   "Batch 2/2 (86 rows): 86 embeddings generated, written. Cumulative cost: $0.000XXX"
//   "DONE — all 186 embeddings populated. Total cost: $0.000XXX. Total time: Xs."
//
// Rollback: UPDATE corpus_passages SET embedding = NULL;
//           in Supabase SQL Editor returns the column to NULL. Then re-run.
//
// Risk: Standard under 0d-ii. Idempotent data-write against existing column;
//       no schema changes; no auth/encryption surface. AC7 not engaged.
//       PR6 not engaged. Critical Change Protocol not engaged.
// ============================================================================

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ----------------------------------------------------------------------------
// Step 0 — Load env vars from website/.env.local
// ----------------------------------------------------------------------------

function loadEnv() {
  const envPath = './website/.env.local';
  let envFile;
  try {
    envFile = readFileSync(envPath, 'utf-8');
  } catch (err) {
    console.error(`ERROR: cannot read ${envPath}. Run from project root.`);
    process.exit(1);
  }
  envFile.split('\n').forEach((line) => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing from website/.env.local');
  process.exit(1);
}

if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY missing from website/.env.local. Add it per Sub-session C Step 1b before running.');
  process.exit(1);
}

// Service role bypasses RLS — required for build-time UPDATEs per D5 §"RLS policy"
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ----------------------------------------------------------------------------
// Constants — D5 §"Embedding model selection"
// ----------------------------------------------------------------------------

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;
const BATCH_SIZE = 100;
const COST_PER_1M_INPUT_TOKENS_USD = 0.02; // text-embedding-3-small pricing per D5

// ----------------------------------------------------------------------------
// Step 1 — Fetch rows where embedding IS NULL
// ----------------------------------------------------------------------------

async function fetchUnembeddedRows() {
  // Note: Supabase JS client does not expose a literal "is null" filter the same
  // way as eq/neq, so we use .is('embedding', null) — verified pattern.
  const { data, error } = await supabase
    .from('corpus_passages')
    .select('id, passage_id, text')
    .is('embedding', null)
    .order('passage_id', { ascending: true }); // deterministic order for reproducibility

  if (error) {
    console.error('ERROR fetching rows:', error);
    process.exit(1);
  }

  return data ?? [];
}

// ----------------------------------------------------------------------------
// Step 2 — Embed a batch via OpenAI
// ----------------------------------------------------------------------------

async function embedBatch(rows) {
  const inputs = rows.map((r) => r.text);

  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: inputs,
    encoding_format: 'float',
  });

  // Sanity checks
  if (!response.data || response.data.length !== rows.length) {
    throw new Error(
      `OpenAI returned ${response.data?.length ?? 0} embeddings; expected ${rows.length}`
    );
  }

  for (const item of response.data) {
    if (!Array.isArray(item.embedding) || item.embedding.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(
        `OpenAI returned embedding of dimension ${item.embedding?.length ?? 'undefined'}; expected ${EMBEDDING_DIMENSIONS}`
      );
    }
  }

  // Each item.index points back to the input position
  const ordered = new Array(rows.length);
  for (const item of response.data) {
    ordered[item.index] = item.embedding;
  }

  return {
    embeddings: ordered, // array of float arrays, indexed parallel to `rows`
    usage: response.usage, // { prompt_tokens, total_tokens }
  };
}

// ----------------------------------------------------------------------------
// Step 3 — Write embeddings back, one row at a time (KG1 rule 2)
// ----------------------------------------------------------------------------

async function writeEmbeddingsBatch(rows, embeddings) {
  let written = 0;
  for (let i = 0; i < rows.length; i++) {
    const { id, passage_id } = rows[i];
    const vector = embeddings[i];

    // pgvector accepts a stringified literal for vector columns: '[0.1,0.2,...]'
    // The Supabase JS client passes the value through; pgvector's input parser
    // handles either a JSON array or the bracketed-literal string form.
    const vectorLiteral = `[${vector.join(',')}]`;

    const { error } = await supabase
      .from('corpus_passages')
      .update({ embedding: vectorLiteral })
      .eq('id', id);

    if (error) {
      console.error(`  ERROR updating ${passage_id}:`, error);
      throw error;
    }
    written++;
  }
  return written;
}

// ----------------------------------------------------------------------------
// Step 4 — Main loop
// ----------------------------------------------------------------------------

async function main() {
  const startTime = Date.now();

  console.log('Loading rows where embedding IS NULL...');
  const rows = await fetchUnembeddedRows();

  if (rows.length === 0) {
    console.log('No rows need embedding. (All 186 already populated, or table empty.)');
    return;
  }

  console.log(`Found ${rows.length} rows with NULL embedding. Generating in batches of ${BATCH_SIZE}...`);

  let totalTokens = 0;
  let totalWritten = 0;
  const totalBatches = Math.ceil(rows.length / BATCH_SIZE);

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(`Batch ${batchNum}/${totalBatches} (${batch.length} rows): embedding... `);
    const { embeddings, usage } = await embedBatch(batch);
    process.stdout.write(`OK. writing... `);

    const written = await writeEmbeddingsBatch(batch, embeddings);
    totalWritten += written;
    totalTokens += usage.total_tokens;

    const cumulativeCost = (totalTokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS_USD;
    console.log(
      `wrote ${written}. Cumulative tokens: ${totalTokens}. Cumulative cost: $${cumulativeCost.toFixed(6)}`
    );
  }

  const totalCost = (totalTokens / 1_000_000) * COST_PER_1M_INPUT_TOKENS_USD;
  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('');
  console.log(`DONE — all ${totalWritten} embeddings populated.`);
  console.log(`Total tokens: ${totalTokens}`);
  console.log(`Total cost (text-embedding-3-small @ $${COST_PER_1M_INPUT_TOKENS_USD}/1M tokens): $${totalCost.toFixed(6)}`);
  console.log(`Total elapsed time: ${elapsedSec}s.`);
  console.log('');
  console.log('Verification: in Supabase SQL Editor run:');
  console.log('  SELECT count(*) FROM corpus_passages WHERE embedding IS NOT NULL;');
  console.log(`  Expected: ${totalWritten}`);
  console.log('');
  console.log('Next step: re-introduce the ivfflat index (Sub-session C Step 3).');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
