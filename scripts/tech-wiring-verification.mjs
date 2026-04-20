#!/usr/bin/env node
/**
 * tech-wiring-verification.mjs — Founder-runnable harness for the Tech
 * agent wiring fix (Channel 1 live system state + Channel 2 endpoint
 * inventory), 20 April 2026.
 *
 * WHAT THIS PROVES
 *   1. Channel 1 parse — operations/tech-known-issues.md loads through
 *      getTechSystemState() and yields a structured block. Empty stub
 *      file is expected to produce zero issues and the "none recorded"
 *      lines in formatted_context.
 *   2. Channel 2 parse — /TECHNICAL_STATE.md loads through
 *      getEndpointInventory() and yields runSageReason-family and
 *      mentor-family entries with an "as of" date pulled from the file
 *      header.
 *   3. Drift check — a filesystem grep of website/src/app/api/**\/route.ts
 *      for runSageReason( is compared with the runSageReason entries in
 *      the inventory. Prints GREEN if they match exactly, or DRIFT with
 *      the set difference and the message "TECHNICAL_STATE.md §2 is out
 *      of date. Update before proceeding."
 *
 * EXPECTED FIRST-RUN OUTCOME
 *   Channel 1: GREEN, zero issues.
 *   Channel 2: GREEN parse, non-zero endpoint count.
 *   Drift: DRIFT. TECHNICAL_STATE.md §2 lists 9 endpoints, the codebase
 *     has 10. Reconciling TECHNICAL_STATE.md is the next session's task.
 *     Drift reported = harness working correctly. Drift absent on first
 *     run = harness broken.
 *
 * WHAT THIS DOES NOT PROVE
 *   - It does NOT call Anthropic or invoke the Tech persona. Live probe
 *     against /private-mentor is the separate verification step.
 *   - It does NOT talk to Supabase.
 *   - It does NOT validate that the loaders are imported from
 *     hub/route.ts. That is the grep step in the session flow.
 *
 * HOW TO RUN
 *   From the repo root:
 *     node scripts/tech-wiring-verification.mjs
 *
 *   Requires Node 22.6+ (native TypeScript import support).
 *
 * EXIT CODE
 *   0 = every assertion passed, no DRIFT
 *   1 = at least one assertion failed
 *   2 = parse assertions passed but drift detected (expected first run)
 *
 * Rules served: PR1 (single-persona proof), PR2 (build-to-wire
 * verification immediate), PR5 (KG3/KG7 call-site verification at
 * session close, not here).
 */

import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Dynamic imports of the two new loaders
// ---------------------------------------------------------------------------

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..')

const systemStateModule = await import(
  path.join(repoRoot, 'website/src/lib/context/tech-system-state.ts')
)
const endpointInventoryModule = await import(
  path.join(repoRoot, 'website/src/lib/context/tech-endpoint-inventory.ts')
)

const { getTechSystemState } = systemStateModule
const { getEndpointInventory } = endpointInventoryModule

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
// Route-file scanner — finds every file containing runSageReason(
// ---------------------------------------------------------------------------

async function findRouteFilesCallingRunSageReason() {
  const apiRoot = path.join(repoRoot, 'website/src/app/api')
  const hits = []

  async function walk(dir) {
    let entries
    try {
      entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walk(full)
        continue
      }
      if (!entry.isFile()) continue
      if (entry.name !== 'route.ts' && entry.name !== 'route.js') continue
      let contents
      try {
        contents = await fs.readFile(full, 'utf8')
      } catch {
        continue
      }
      if (contents.includes('runSageReason(')) {
        // Convert filesystem path into an /api/... route string.
        const rel = path.relative(apiRoot, path.dirname(full))
        const routePath = '/api/' + rel.split(path.sep).join('/')
        hits.push({ file: full, route: routePath })
      }
    }
  }

  await walk(apiRoot)
  return hits
}

// ---------------------------------------------------------------------------
// CHECK 1 — Channel 1 parse
// ---------------------------------------------------------------------------

section('CHECK 1 — Channel 1 parse (operations/tech-known-issues.md)')

let channel1Ok = false
try {
  const state = await getTechSystemState()
  console.log('\nsource:        ', state.source)
  console.log('as_of:         ', state.as_of)
  console.log('maintainer:    ', state.maintainer)
  console.log('current issues:', state.current_issues.length)
  console.log('resolved:      ', state.recently_resolved.length)
  console.log('\nformatted_context (first 400 chars):')
  console.log(state.formatted_context.slice(0, 400))

  assert(
    'loader returned an object with a formatted_context string',
    typeof state.formatted_context === 'string' && state.formatted_context.length > 0,
  )
  assert(
    "source === 'file' (the known-issues file is readable)",
    state.source === 'file',
    `actual: ${state.source}`,
  )
  assert(
    'current_issues is an array',
    Array.isArray(state.current_issues),
  )
  assert(
    'recently_resolved is an array',
    Array.isArray(state.recently_resolved),
  )
  assert(
    'formatted_context mentions LIVE SYSTEM STATE header',
    state.formatted_context.includes('LIVE SYSTEM STATE — KNOWN ISSUES'),
  )
  channel1Ok = true
} catch (err) {
  assert('Channel 1 loader did not throw', false, String(err && err.stack ? err.stack : err))
}

// ---------------------------------------------------------------------------
// CHECK 2 — Channel 2 parse
// ---------------------------------------------------------------------------

section('CHECK 2 — Channel 2 parse (/TECHNICAL_STATE.md)')

let inventory = null
try {
  inventory = await getEndpointInventory()
  const runSageReason = inventory.endpoints.filter((e) => e.family === 'runSageReason')
  const mentor = inventory.endpoints.filter((e) => e.family === 'mentor')

  console.log('\nsource:                  ', inventory.source)
  console.log('as_of:                   ', inventory.as_of)
  console.log('runSageReason endpoints: ', runSageReason.length)
  console.log('mentor endpoints:        ', mentor.length)
  console.log('total endpoints:         ', inventory.endpoints.length)
  console.log('\nrunSageReason routes (parsed):')
  for (const e of runSageReason) console.log(`  ${e.method} ${e.route}  [${e.status}]`)
  console.log('\nmentor routes (parsed):')
  for (const e of mentor) console.log(`  ${e.method} ${e.route}  [${e.status}]`)

  assert(
    'loader returned an object with a formatted_context string',
    typeof inventory.formatted_context === 'string' && inventory.formatted_context.length > 0,
  )
  assert(
    "source === 'file' (TECHNICAL_STATE.md is readable)",
    inventory.source === 'file',
    `actual: ${inventory.source}`,
  )
  assert(
    'at least one runSageReason endpoint parsed',
    runSageReason.length > 0,
    `parsed count: ${runSageReason.length}`,
  )
  assert(
    'at least one mentor endpoint parsed',
    mentor.length > 0,
    `parsed count: ${mentor.length}`,
  )
  assert(
    'as_of is non-unknown (header date captured)',
    typeof inventory.as_of === 'string' && inventory.as_of !== 'unknown' && inventory.as_of !== 'unavailable',
    `actual: ${inventory.as_of}`,
  )
} catch (err) {
  assert('Channel 2 loader did not throw', false, String(err && err.stack ? err.stack : err))
}

// ---------------------------------------------------------------------------
// CHECK 3 — Drift detection
// ---------------------------------------------------------------------------

section('CHECK 3 — Drift detection (inventory §2 vs actual route files)')

let driftDetected = false
let driftReport = null

if (inventory) {
  const actualHits = await findRouteFilesCallingRunSageReason()
  const actualRoutes = new Set(actualHits.map((h) => h.route))
  const inventoryRoutes = new Set(
    inventory.endpoints.filter((e) => e.family === 'runSageReason').map((e) => e.route),
  )

  const onlyInCode = [...actualRoutes].filter((r) => !inventoryRoutes.has(r)).sort()
  const onlyInInventory = [...inventoryRoutes].filter((r) => !actualRoutes.has(r)).sort()

  console.log('\ncodebase runSageReason routes (grep of website/src/app/api/**/route.ts):')
  for (const r of [...actualRoutes].sort()) console.log(`  ${r}`)
  console.log('\ninventory runSageReason routes (from TECHNICAL_STATE.md §2):')
  for (const r of [...inventoryRoutes].sort()) console.log(`  ${r}`)

  if (onlyInCode.length === 0 && onlyInInventory.length === 0) {
    console.log('\nRESULT: GREEN — inventory matches reality.')
    assert('drift check is GREEN', true)
  } else {
    driftDetected = true
    console.log('\nRESULT: DRIFT — TECHNICAL_STATE.md §2 is out of date. Update before proceeding.')
    if (onlyInCode.length) {
      console.log('\nRoutes in code but NOT in inventory:')
      for (const r of onlyInCode) console.log(`  + ${r}`)
    }
    if (onlyInInventory.length) {
      console.log('\nRoutes in inventory but NOT in code:')
      for (const r of onlyInInventory) console.log(`  - ${r}`)
    }
    driftReport = { onlyInCode, onlyInInventory }
    // NOT recorded as a failure. First-run drift is expected per the handoff.
    console.log(
      '\nNote: first-run drift is expected. The drift itself is the signal',
    )
    console.log(
      '      Channel 2 was wired to surface. Reconciliation is the next session.',
    )
  }
} else {
  assert('drift check requires Channel 2 to parse', false)
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

section('SUMMARY')

console.log(`\nPassed: ${passCount}`)
console.log(`Failed: ${failCount}`)
console.log(`Drift:  ${driftDetected ? 'YES (see above)' : 'none'}`)

if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) console.log(`  - ${f.label}${f.detail ? ' — ' + f.detail : ''}`)
  process.exit(1)
}

if (driftDetected) {
  console.log('\nParse assertions all passed. Drift detection is working as designed.')
  process.exit(2)
}

console.log('\nAll assertions passed. No drift. Tech wiring is verified at the unit level.')
process.exit(0)
