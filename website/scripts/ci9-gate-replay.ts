/**
 * ci9-gate-replay.ts — CI-9 empirical replay (FX-15). FOUNDER-WALKED (PR17).
 *
 * Makes REAL Anthropic calls — run against the TEST environment, costs a few
 * cents:
 *   cd website
 *   npx tsx --env-file=.env.development.local scripts/ci9-gate-replay.ts
 *   # if ANTHROPIC_API_KEY is only in .env.local, use that file instead.
 *
 * WHAT IT PROVES: it calls runSageReason — the engine /api/guardrail uses —
 * TWICE with byte-identical inputs (mirroring two same-shape gate calls in one
 * warm process). Call #1 is cold (a real Haiku round-trip, multi-second). Call
 * #2 is served from the in-memory cache (sub-100ms). BOTH report
 * ai_generated:true. That reproduces the FX-15 46ms-vs-20,015ms split from a
 * single cause — the cache hit — without any code change.
 *
 * If the cold call triggers a JSON parse failure, the engine's retry escalates
 * Haiku->Sonnet and emits a "Parse failed ... Retrying with ..." console.warn —
 * that warn on a multi-second call confirms the 20s-side candidate (1) in the
 * diagnostic note.
 *
 * This script changes NOTHING. It is a diagnostic instrument only. Per PR10 the
 * founder acknowledges the observed split before CI-9 is treated as resolved.
 */

import { runSageReason } from '../src/lib/sage-reason-engine'

// A fixed, gate-shaped input. domain_context mirrors the standard-risk gate
// string (guardrail/route.ts) so the cache key matches a real standard gate call.
const INPUT = 'Send automated marketing emails to all users who have not opted in.'
const CONTEXT = 'The agent is deciding whether to proceed without explicit consent.'
const DOMAIN_CONTEXT =
  'This is a binary safety gate evaluation. Determine if this action should proceed based on Stoic virtue alignment.'

async function callOnce(label: string) {
  const t0 = Date.now()
  const r = await runSageReason({
    input: INPUT,
    context: CONTEXT,
    depth: 'quick',
    domain_context: DOMAIN_CONTEXT,
  })
  const wall = Date.now() - t0
  console.log(
    `${label}: meta.latency_ms=${r.meta.latency_ms}  wall=${wall}ms  ` +
      `ai_generated=${r.meta.ai_generated}  ai_model=${r.meta.ai_model}  ` +
      `usage=${r.meta.usage ? `${r.meta.usage.input_tokens}/${r.meta.usage.output_tokens}` : 'absent(cache hit)'}`,
  )
  return r.meta.latency_ms
}

async function main() {
  console.log('CI-9 gate-latency replay — two identical runSageReason calls (quick depth).')
  console.log('Expect: call #1 cold (multi-second), call #2 cache hit (sub-100ms), both ai_generated:true.\n')

  const cold = await callOnce('call #1 (cold)   ')
  const warm = await callOnce('call #2 (warm)   ')

  console.log('')
  console.log('='.repeat(70))
  const split = cold > 0 ? (cold / Math.max(warm, 1)).toFixed(1) : 'n/a'
  console.log(`cold=${cold}ms  warm=${warm}ms  ratio=${split}x`)
  if (warm < 100 && cold > warm * 5) {
    console.log('RESULT: reproduced — the fast verdict is a cache hit (FX-15 mechanism confirmed).')
  } else {
    console.log('RESULT: split not reproduced this run — re-run (warm process needed), or inspect logs for a parse-retry on the cold call.')
  }
  console.log('Note: usage=absent on call #2 confirms NO fresh LLM call (pure cache hit).')
}

main().catch((e) => {
  console.error('replay error:', e)
  process.exit(1)
})
