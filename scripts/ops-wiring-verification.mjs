#!/usr/bin/env node
/**
 * ops-wiring-verification.mjs — Founder-runnable harness for the Sage-Ops
 * chat-persona wiring fix (Channel 1 cost state + Channel 2 continuity
 * state), 20 April 2026.
 *
 * WHAT THIS PROVES
 *   1. Channel 1 module integrity. `ops-cost-state.ts` exists at the
 *      expected path, exports `getOpsCostState`, imports the service-role
 *      Supabase client + the classifier summary helper, and encodes the
 *      D-Ops-2 / D-Ops-6 "unknown" posture for concentration and runway.
 *      (Cannot be dynamically import()'d here because it uses the `@/`
 *      path alias to '@/lib/supabase-server' which Node's native TS
 *      loader does not resolve without a tsconfig path resolver. This
 *      mirrors the pattern documented in support-wiring-verification.mjs.)
 *
 *   2. Channel 2 parse. `ops-continuity-state.ts` loads through
 *      getOpsContinuityState() and yields a structured block with all
 *      five sources attempted. Each source either parses to 'file' with
 *      at least one item, or reports a self-disclosing stub. The
 *      formatted_context must contain the OPERATIONAL CONTINUITY header
 *      and the names of all five source files.
 *
 *   3. Wiring integration. `website/src/app/api/founder/hub/route.ts`
 *      imports both new loaders at the top, awaits both inside the
 *      `case 'ops'` branch, and injects both formatted_context strings
 *      into the Ops system prompt in the expected order (cost state,
 *      then continuity state, then ops brain).
 *
 * EXPECTED FIRST-RUN OUTCOME
 *   Channel 1: GREEN. File exists; exports and imports present.
 *   Channel 2: GREEN. source === 'file' for each of the five sections.
 *     Handoffs >= 1, decisions >= 10, knowledge_gaps >= 1,
 *     compliance >= 1, d_register >= 10.
 *   Wiring: GREEN. Two imports + two awaits + two formatted_context
 *     references all present in the correct case block.
 *
 * WHAT THIS DOES NOT PROVE
 *   - It does NOT call Anthropic or invoke the Ops persona. Live probe
 *     against /founder-hub is the separate verification step.
 *   - It does NOT reach Supabase. On a first-run local harness the
 *     Supabase read path is exercised only at live-probe time; the
 *     expected outcome at that step is a well-formed block with live
 *     threshold readings OR a self-disclosing stub if no
 *     cost_health_snapshots rows exist yet. Concentration and runway
 *     will remain 'unknown' regardless, per D-Ops-2 and D-Ops-6.
 *   - It does NOT confirm Vercel runtime path resolution. The known
 *     limitation documented on the Tech/Growth loaders applies to the
 *     file-based loader in Channel 2 as well; a dedicated follow-up
 *     session will resolve Vercel cwd behaviour for all file-based
 *     loaders.
 *
 * HOW TO RUN
 *   From the repo root:
 *     node scripts/ops-wiring-verification.mjs
 *
 *   Requires Node 22.6 or later (native TypeScript import support).
 *
 * EXIT CODE
 *   0 = every assertion passed
 *   1 = at least one assertion failed (details printed above)
 *
 * Rules served: PR1 (single-persona proof — Ops is the fourth persona
 * wiring), PR2 (build-to-wire verification immediate), PR5 (KG scan
 * performed at session open), PR6 (no safety-critical code touched).
 */

import { readFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Repo-root path resolution
// ---------------------------------------------------------------------------

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

const COST_STATE_PATH = path.join(
  repoRoot,
  'website/src/lib/context/ops-cost-state.ts',
)
const CONTINUITY_STATE_PATH = path.join(
  repoRoot,
  'website/src/lib/context/ops-continuity-state.ts',
)
const HUB_ROUTE_PATH = path.join(
  repoRoot,
  'website/src/app/api/founder/hub/route.ts',
)

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
// CHECK 1 — Channel 1 module integrity (static file-text checks)
// ---------------------------------------------------------------------------

section('CHECK 1 — Channel 1 module integrity (ops-cost-state.ts)')

try {
  const src = await readFile(COST_STATE_PATH, 'utf8')

  console.log(`\nfile:          ${COST_STATE_PATH}`)
  console.log(`size:          ${src.length} chars`)

  assert(
    'file exists and is non-empty',
    src.length > 0,
  )
  assert(
    "exports getOpsCostState",
    /export\s+async\s+function\s+getOpsCostState\b/.test(src),
  )
  assert(
    "exports the OpsCostBlock type",
    /export\s+interface\s+OpsCostBlock\b/.test(src),
  )
  assert(
    "imports supabaseAdmin from @/lib/supabase-server",
    /import\s*\{\s*supabaseAdmin\s*\}\s*from\s*['"]@\/lib\/supabase-server['"]/.test(src),
  )
  assert(
    "imports getClassifierCostSummary from @/lib/r20a-cost-tracker",
    /import\s*\{\s*getClassifierCostSummary\s*\}\s*from\s*['"]@\/lib\/r20a-cost-tracker['"]/.test(src),
  )
  assert(
    "reads from cost_health_snapshots table",
    /\.from\(['"]cost_health_snapshots['"]\)/.test(src),
  )
  assert(
    "revenue-to-cost target constant set to 2.0",
    /REVENUE_RATIO_TARGET\s*=\s*2\.0/.test(src),
  )
  assert(
    "Ops monthly cap constant set to 100",
    /OPS_MONTHLY_CAP_USD\s*=\s*100/.test(src),
  )
  assert(
    "stale-snapshot threshold set to 7 days",
    /SNAPSHOT_STALE_AFTER_DAYS\s*=\s*7/.test(src),
  )
  assert(
    "concentration note cites D-Ops-2",
    /D-Ops-2/.test(src),
  )
  assert(
    "runway note cites D-Ops-6",
    /D-Ops-6/.test(src),
  )
  assert(
    "source field can be 'supabase' or 'stub'",
    /'supabase'\s*\|\s*'stub'/.test(src),
  )
} catch (err) {
  assert(
    'Channel 1 file read did not throw',
    false,
    String(err && err.stack ? err.stack : err),
  )
}

// ---------------------------------------------------------------------------
// CHECK 2 — Channel 2 parse (dynamic import — runs end-to-end)
// ---------------------------------------------------------------------------

section('CHECK 2 — Channel 2 parse (ops-continuity-state.ts)')

try {
  const mod = await import(CONTINUITY_STATE_PATH)
  const { getOpsContinuityState } = mod

  assert(
    'module exports getOpsContinuityState',
    typeof getOpsContinuityState === 'function',
  )

  const block = await getOpsContinuityState()

  console.log('\nas_of:                 ', block.as_of)
  console.log('handoffs source:       ', block.handoffs.source, `(items: ${block.handoffs.items.length})`)
  console.log('decisions source:      ', block.decisions.source, `(items: ${block.decisions.items.length})`)
  console.log('knowledge_gaps source: ', block.knowledge_gaps.source, `(items: ${block.knowledge_gaps.items.length})`)
  console.log('compliance source:     ', block.compliance.source, `(items: ${block.compliance.items.length})`)
  console.log('d_register source:     ', block.d_register.source, `(items: ${block.d_register.items.length})`)

  // Print a compact excerpt of each source's first item for eyeball check
  const first = (arr) => (arr && arr.length ? JSON.stringify(arr[0]) : '(none)')
  console.log('\nfirst handoff:       ', first(block.handoffs.items))
  console.log('first decision:      ', first(block.decisions.items))
  console.log('first KG:            ', first(block.knowledge_gaps.items))
  console.log('first obligation:    ', first(block.compliance.items))
  console.log('first D-entry:       ', first(block.d_register.items))

  console.log('\nformatted_context (first 1000 chars):')
  console.log(block.formatted_context.slice(0, 1000))
  if (block.formatted_context.length > 1000) console.log('...')

  assert(
    'loader returned an object with a formatted_context string',
    typeof block.formatted_context === 'string' &&
      block.formatted_context.length > 0,
  )
  assert(
    'formatted_context contains the OPERATIONAL CONTINUITY header',
    block.formatted_context.includes('OPERATIONAL CONTINUITY'),
  )
  assert(
    'formatted_context names operations/handoffs/',
    block.formatted_context.includes('operations/handoffs/'),
  )
  assert(
    'formatted_context names operations/decision-log.md',
    block.formatted_context.includes('operations/decision-log.md'),
  )
  assert(
    'formatted_context names operations/knowledge-gaps.md',
    block.formatted_context.includes('operations/knowledge-gaps.md'),
  )
  assert(
    'formatted_context names compliance/compliance_register.json',
    block.formatted_context.includes('compliance/compliance_register.json'),
  )
  assert(
    'formatted_context names build-knowledge-extraction-2026-04-17.md',
    block.formatted_context.includes('build-knowledge-extraction-2026-04-17.md'),
  )

  // Source parse checks
  assert(
    "handoffs source === 'file' (operations/handoffs directory readable)",
    block.handoffs.source === 'file',
    `note: ${block.handoffs.note ?? 'none'}`,
  )
  assert(
    'at least one recent handoff found',
    block.handoffs.items.length >= 1,
    `count: ${block.handoffs.items.length}`,
  )
  assert(
    "decisions source === 'file' (decision-log.md readable)",
    block.decisions.source === 'file',
    `note: ${block.decisions.note ?? 'none'}`,
  )
  assert(
    'decision log parsed at least 10 entries',
    block.decisions.items.length >= 10,
    `count: ${block.decisions.items.length}`,
  )
  assert(
    "knowledge_gaps source === 'file' (knowledge-gaps.md readable)",
    block.knowledge_gaps.source === 'file',
    `note: ${block.knowledge_gaps.note ?? 'none'}`,
  )
  assert(
    'knowledge-gaps register parsed at least 1 KG entry',
    block.knowledge_gaps.items.length >= 1,
    `count: ${block.knowledge_gaps.items.length}`,
  )
  assert(
    "compliance source === 'file' (compliance_register.json readable)",
    block.compliance.source === 'file',
    `note: ${block.compliance.note ?? 'none'}`,
  )
  assert(
    'compliance register parsed at least 1 obligation',
    block.compliance.items.length >= 1,
    `count: ${block.compliance.items.length}`,
  )
  assert(
    "d_register source === 'file' (build-knowledge-extraction readable)",
    block.d_register.source === 'file',
    `note: ${block.d_register.note ?? 'none'}`,
  )
  assert(
    'D-register parsed at least 10 entries (D1..D10)',
    block.d_register.items.length >= 10,
    `count: ${block.d_register.items.length}`,
  )
  if (block.d_register.items.length >= 1) {
    const first = block.d_register.items[0]
    assert(
      'first D-register entry has id matching /^D\\d+$/',
      /^D\d+$/.test(first.id),
      `actual: ${first.id}`,
    )
  }
} catch (err) {
  assert(
    'Channel 2 loader did not throw',
    false,
    String(err && err.stack ? err.stack : err),
  )
}

// ---------------------------------------------------------------------------
// CHECK 3 — Wiring integration (hub/route.ts inspection)
// ---------------------------------------------------------------------------

section('CHECK 3 — Wiring integration (hub/route.ts)')

try {
  const src = await readFile(HUB_ROUTE_PATH, 'utf8')

  console.log(`\nfile:          ${HUB_ROUTE_PATH}`)
  console.log(`size:          ${src.length} chars`)

  assert(
    "hub/route.ts imports getOpsCostState from @/lib/context/ops-cost-state",
    /import\s*\{\s*getOpsCostState\s*\}\s*from\s*['"]@\/lib\/context\/ops-cost-state['"]/.test(src),
  )
  assert(
    "hub/route.ts imports getOpsContinuityState from @/lib/context/ops-continuity-state",
    /import\s*\{\s*getOpsContinuityState\s*\}\s*from\s*['"]@\/lib\/context\/ops-continuity-state['"]/.test(src),
  )

  // Find the case 'ops' block and confirm both awaits + both injections live inside it.
  // hub/route.ts contains three `case 'ops':` clauses: two single-line helper
  // switches (lines ~74, ~84) and the block-form primaryText switch. We anchor
  // on the block-form `case 'ops': {` and bound the block at the next
  // block-form `case 'tech': {`. This is the only occurrence in the file.
  const opsStart = src.indexOf("case 'ops': {")
  const techStart = src.indexOf("case 'tech': {")
  assert(
    "block-form case 'ops' { branch exists (primaryText switch)",
    opsStart !== -1,
  )
  assert(
    "block-form case 'tech' { branch exists (used as ops-block upper bound)",
    techStart !== -1 && techStart > opsStart,
  )

  if (opsStart !== -1 && techStart !== -1 && techStart > opsStart) {
    const opsBlock = src.slice(opsStart, techStart)
    assert(
      "case 'ops' block awaits getOpsCostState()",
      /await\s+getOpsCostState\s*\(\s*\)/.test(opsBlock),
    )
    assert(
      "case 'ops' block awaits getOpsContinuityState()",
      /await\s+getOpsContinuityState\s*\(\s*\)/.test(opsBlock),
    )
    assert(
      "case 'ops' block interpolates opsCostState.formatted_context",
      /\$\{opsCostState\.formatted_context\}/.test(opsBlock),
    )
    assert(
      "case 'ops' block interpolates opsContinuityState.formatted_context",
      /\$\{opsContinuityState\.formatted_context\}/.test(opsBlock),
    )
    assert(
      "case 'ops' block interpolates ${brainContext} AFTER both new channels (injection order)",
      (() => {
        const a = opsBlock.indexOf('${opsCostState.formatted_context}')
        const b = opsBlock.indexOf('${opsContinuityState.formatted_context}')
        const c = opsBlock.indexOf('${brainContext}')
        return a !== -1 && b !== -1 && c !== -1 && a < c && b < c
      })(),
      'expected order: opsCostState → opsContinuityState → brainContext',
    )
  }
} catch (err) {
  assert(
    'hub/route.ts read did not throw',
    false,
    String(err && err.stack ? err.stack : err),
  )
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

section('SUMMARY')

console.log(`\nPassed: ${passCount}`)
console.log(`Failed: ${failCount}`)

if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures)
    console.log(`  - ${f.label}${f.detail ? ' — ' + f.detail : ''}`)
  process.exit(1)
}

console.log('\nAll assertions passed. Ops wiring is verified at the unit level.')
console.log('Reminder: live probe against /founder-hub is the separate step — see the')
console.log('          close handoff. Concentration and runway returning "unknown" is')
console.log('          the intended posture (D-Ops-2 and D-Ops-6), not a bug.')
process.exit(0)
