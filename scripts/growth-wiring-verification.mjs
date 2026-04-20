#!/usr/bin/env node
/**
 * growth-wiring-verification.mjs — Founder-runnable harness for the Growth
 * chat-persona wiring fix (Channel 1 actions log + Channel 2 market
 * signals), 20 April 2026.
 *
 * WHAT THIS PROVES
 *   1. Channel 1 parse — operations/growth-actions-log.md loads through
 *      getGrowthActionsLog() and yields a structured block. A seeded
 *      entry (back-dated to 2026-04-20 per D-Growth-1) must parse as
 *      exactly one action inside the 90-day rolling window.
 *   2. Channel 2 parse — operations/growth-market-signals.md loads
 *      through getGrowthMarketSignals() and yields a sparse-state
 *      block. With the stub file as of 20 April 2026, every section
 *      carries the "no signal yet" placeholder, so zero signals parse
 *      and is_sparse must be true. The formatted_context must contain
 *      the sparse-state disclosure text.
 *
 * EXPECTED FIRST-RUN OUTCOME
 *   Channel 1: GREEN. source === 'file'. One action parsed with
 *     domain === 'positioning' and action_type === 'decided'.
 *   Channel 2: GREEN. source === 'file'. Zero signals parsed,
 *     is_sparse === true. formatted_context contains
 *     "This is expected at P0" and "do NOT invent signals".
 *
 * WHAT THIS DOES NOT PROVE
 *   - It does NOT call Anthropic or invoke the Growth persona. Live
 *     probe against /founder-hub is the separate verification step.
 *   - It does NOT talk to Supabase.
 *   - It does NOT confirm Vercel runtime path resolution. The Tech
 *     wiring session (20 April 2026) observed that process.cwd() on
 *     Vercel serverless does not resolve to the repo root; a fix is
 *     scheduled for a dedicated follow-up session. This harness runs
 *     locally (or in a sandbox mounted at repo root) and will pass
 *     before the Vercel fix lands; the live probe after Vercel deploy
 *     may return stub text until then.
 *
 * HOW TO RUN
 *   From the repo root:
 *     node scripts/growth-wiring-verification.mjs
 *
 *   Requires Node 22.6 or later (native TypeScript import support).
 *
 * EXIT CODE
 *   0 = every assertion passed
 *   1 = at least one assertion failed
 *
 * Rules served: PR1 (single-persona proof — Growth is the third
 * persona wiring; Ops is the natural next session), PR2 (build-to-wire
 * verification immediate), PR5 (KG scan performed at session open).
 */

import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Dynamic imports of the two new loaders
// ---------------------------------------------------------------------------

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

const actionsLogModule = await import(
  path.join(repoRoot, 'website/src/lib/context/growth-actions-log.ts')
)
const marketSignalsModule = await import(
  path.join(repoRoot, 'website/src/lib/context/growth-market-signals.ts')
)

const { getGrowthActionsLog } = actionsLogModule
const { getGrowthMarketSignals } = marketSignalsModule

// ---------------------------------------------------------------------------
// Assertion helper
// ---------------------------------------------------------------------------

let passCount = 0
let failCount = 0
const failures = []

function assert(label, condition, detail) {
  if (condition) {
    passCount += 1
    console.log(`  \u2713 ${label}`)
  } else {
    failCount += 1
    failures.push({ label, detail })
    console.log(`  \u2717 ${label}`)
    if (detail) console.log(`      ${detail}`)
  }
}

function section(title) {
  console.log('')
  console.log('='.repeat(72))
  console.log(title)
  console.log('='.repeat(72))
}

// ---------------------------------------------------------------------------
// CHECK 1 — Channel 1 parse (operations/growth-actions-log.md)
// ---------------------------------------------------------------------------

section('CHECK 1 — Channel 1 parse (operations/growth-actions-log.md)')

try {
  const block = await getGrowthActionsLog()
  console.log('\nsource:        ', block.source)
  console.log('as_of:         ', block.as_of)
  console.log('maintainer:    ', block.maintainer)
  console.log('window_days:   ', block.window_days)
  console.log('actions parsed:', block.actions.length)

  if (block.actions.length) {
    console.log('\nparsed actions:')
    for (const a of block.actions) {
      console.log(`  ${a.date}  ${a.domain}/${a.action_type}  — ${a.summary}`)
      if (a.reference) console.log(`    reference: ${a.reference}`)
      console.log(`    outcome: ${a.outcome}`)
    }
  }

  console.log('\nformatted_context (first 600 chars):')
  console.log(block.formatted_context.slice(0, 600))
  if (block.formatted_context.length > 600) console.log('...')

  assert(
    'loader returned an object with a formatted_context string',
    typeof block.formatted_context === 'string' && block.formatted_context.length > 0,
  )
  assert(
    "source === 'file' (growth-actions-log.md is readable)",
    block.source === 'file',
    `actual: ${block.source}`,
  )
  assert(
    'actions is an array',
    Array.isArray(block.actions),
  )
  assert(
    'window_days === 90 (default rolling window)',
    block.window_days === 90,
    `actual: ${block.window_days}`,
  )
  assert(
    'formatted_context mentions GROWTH ACTIONS LOG header',
    block.formatted_context.includes('GROWTH ACTIONS LOG'),
  )
  assert(
    "at least one action parsed (seeded entry from D-Growth-1)",
    block.actions.length >= 1,
    `actions parsed: ${block.actions.length}`,
  )
  if (block.actions.length >= 1) {
    const seeded = block.actions[0]
    assert(
      "seeded entry has domain === 'positioning'",
      seeded.domain === 'positioning',
      `actual: ${seeded.domain}`,
    )
    assert(
      "seeded entry has action_type === 'decided'",
      seeded.action_type === 'decided',
      `actual: ${seeded.action_type}`,
    )
  }
} catch (err) {
  assert('Channel 1 loader did not throw', false, String(err && err.stack ? err.stack : err))
}

// ---------------------------------------------------------------------------
// CHECK 2 — Channel 2 parse (operations/growth-market-signals.md)
// ---------------------------------------------------------------------------

section('CHECK 2 — Channel 2 parse (operations/growth-market-signals.md)')

try {
  const block = await getGrowthMarketSignals()
  console.log('\nsource:        ', block.source)
  console.log('as_of:         ', block.as_of)
  console.log('maintainer:    ', block.maintainer)
  console.log('window_days:   ', block.window_days)
  console.log('signals parsed:', block.signals.length)
  console.log('is_sparse:     ', block.is_sparse)

  if (block.signals.length) {
    console.log('\nparsed signals:')
    for (const s of block.signals) {
      console.log(`  ${s.date}  ${s.section}  [${s.strength}]  — ${s.observation}`)
      if (s.reference) console.log(`    reference: ${s.reference}`)
    }
  }

  console.log('\nformatted_context (first 900 chars):')
  console.log(block.formatted_context.slice(0, 900))
  if (block.formatted_context.length > 900) console.log('...')

  assert(
    'loader returned an object with a formatted_context string',
    typeof block.formatted_context === 'string' && block.formatted_context.length > 0,
  )
  assert(
    "source === 'file' (growth-market-signals.md is readable)",
    block.source === 'file',
    `actual: ${block.source}`,
  )
  assert(
    'signals is an array',
    Array.isArray(block.signals),
  )
  assert(
    'window_days === 120 (default rolling window)',
    block.window_days === 120,
    `actual: ${block.window_days}`,
  )
  assert(
    'formatted_context mentions GROWTH MARKET SIGNALS header',
    block.formatted_context.includes('GROWTH MARKET SIGNALS'),
  )
  assert(
    "is_sparse === true (expected at P0 with stub file)",
    block.is_sparse === true,
    `actual: ${block.is_sparse}`,
  )
  assert(
    "signals.length === 0 (stub file carries 'no signal yet' placeholders)",
    block.signals.length === 0,
    `actual: ${block.signals.length}`,
  )
  assert(
    'sparse-state formatted_context contains the expected disclosure',
    block.formatted_context.includes('This is expected at P0') &&
      block.formatted_context.includes('Do NOT invent signals'),
  )
} catch (err) {
  assert('Channel 2 loader did not throw', false, String(err && err.stack ? err.stack : err))
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

section('SUMMARY')

console.log(`\nPassed: ${passCount}`)
console.log(`Failed: ${failCount}`)

if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f.label}${f.detail ? ' — ' + f.detail : ''}`)
  process.exit(1)
}

console.log('\nAll assertions passed. Growth wiring is verified at the unit level.')
console.log('Reminder: live probe against /founder-hub is the separate step — see the')
console.log('          close handoff. Channel 2 is_sparse=true + the sparse disclosure')
console.log('          is the harness working correctly, not a bug.')
process.exit(0)
