/**
 * run-comb2.ts — Combination 2 (documentation assertion).
 *
 * Combination 2 = Reasoning + Assent, no Reflect, described as a "practice".
 * This is NOT an endpoint drive — it is a cross-cutting DOCUMENTATION property
 * (scenario-matrix.md Comb 2; test-brief §A.2 / §A.3): the no-practice
 * disclaimer string must be PRESENT and non-empty on every surface where the
 * configuration is offered / described:
 *   - developer docs    src/app/api-docs/page.tsx
 *   - llms.txt          public/llms.txt
 *   - agent-card.json   public/.well-known/agent-card.json
 *   - limitations page  src/app/limitations/page.tsx
 *
 * The disclaimer text was authored under R19e (configuration honesty), aligned
 * with the K1 ADR's "dated, scoped verdict" honesty principle, and approved by
 * the founder 2026-05-27. This runner is the Comb-2 assertion (test-brief §A.3)
 * and ALSO resolves L7 assertion (b) (run-l7.ts), which shares this property.
 *
 * No env, no network, no DB — pure static file reads. Runs in the sandbox and
 * host alike:  cd website && npx tsx scripts/whole-system-harness/run-comb2.ts
 *
 * Exit code 0 = all assertions passed; non-zero = failures (CI-style).
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import { AssertionLedger } from './lib/assertions'
import { writeLedger, type RunLedger } from './lib/capture'

const HERE = dirname(fileURLToPath(import.meta.url))

/**
 * The canonical no-practice disclaimer — placed verbatim on every surface.
 * Source of truth for the Comb-2 assertion. If the wording is revised, update
 * it here AND on all four surfaces together (the assertion will catch drift).
 */
const CANONICAL_DISCLAIMER =
  'This configuration — SageReasoning with Sage Assent, without Sage Reflect — ' +
  'supports virtue-grounded reasoning and credentialing within individual sessions. ' +
  'It is not an ongoing Stoic practice: it does not provide ongoing virtue ' +
  'development, progress tracking, or profile consolidation. Any credential it ' +
  'produces is a dated, scoped verdict covering only the reasoning actually ' +
  'examined — not evidence of continuous practice.'

/** A short ASCII anchor used as a secondary, encoding-robust presence check. */
const ASCII_ANCHOR = 'It is not an ongoing Stoic practice'

interface Surface {
  label: string
  relPath: string
}

const SURFACES: Surface[] = [
  { label: 'developer docs (api-docs/page.tsx)', relPath: '../../src/app/api-docs/page.tsx' },
  { label: 'llms.txt', relPath: '../../public/llms.txt' },
  { label: 'agent-card.json', relPath: '../../public/.well-known/agent-card.json' },
  { label: 'limitations page (limitations/page.tsx)', relPath: '../../src/app/limitations/page.tsx' },
]

/**
 * Normalise for matching: unify every dash / hyphen variant to '-', collapse
 * all whitespace runs (incl. JSX line-wrapping) to single spaces, trim. Applied
 * to BOTH the canonical string and the file content, so source-formatting and
 * em-dash-vs-hyphen differences never cause a false fail.
 */
function normalize(s: string): string {
  return s
    .replace(/[‐‑‒–—―−-]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

function main(): void {
  const ledger = new AssertionLedger()
  const notes: string[] = []
  const normCanonical = normalize(CANONICAL_DISCLAIMER)
  const normAnchor = normalize(ASCII_ANCHOR)

  console.log('\n=== Combination 2 — no-practice disclaimer documentation assertion ===\n')

  for (const s of SURFACES) {
    const abs = resolve(HERE, s.relPath)
    let content = ''
    let readOk = true
    try {
      content = readFileSync(abs, 'utf8')
    } catch (err) {
      readOk = false
      ledger.assert(`${s.label}: file readable`, false, `could not read ${abs}: ${String(err)}`)
    }
    if (!readOk) continue

    const norm = normalize(content)
    ledger.assert(
      `${s.label}: canonical no-practice disclaimer present`,
      norm.includes(normCanonical),
      'canonical disclaimer string not found (normalised match). Did the wording drift from CANONICAL_DISCLAIMER?'
    )
    ledger.assert(
      `${s.label}: disclaimer non-empty / ASCII anchor present`,
      normAnchor.length > 0 && norm.includes(normAnchor),
      'ASCII anchor "It is not an ongoing Stoic practice" not found'
    )
  }

  notes.push(
    'Combination 2 is a cross-cutting DOCUMENTATION property (scenario-matrix Comb 2; ' +
      'test-brief §A.2/§A.3) — no endpoint drive, no env, no network, no DB.'
  )
  notes.push(
    'Matching normalises dash variants + whitespace so JSX line-wrapping and ' +
      'em-dash-vs-hyphen differences across surfaces do not cause false fails.'
  )
  notes.push(
    'This run ALSO resolves L7 assertion (b) (run-l7.ts) — L7 shares the no-practice ' +
      'disclaimer property with Comb 2.'
  )

  const result: 'PASS' | 'FAIL' = ledger.allPassed ? 'PASS' : 'FAIL'
  const ledgerOut: RunLedger = {
    scenario: 'Comb2',
    scenario_label:
      'Reasoning + Assent (no Reflect) — no-practice disclaimer present on all surfaces',
    mode: 'build-only',
    timestamp: new Date().toISOString(),
    result,
    assertions: ledger.results,
    summary: ledger.summaryLine(),
    notes,
  }
  const { jsonPath, mdPath } = writeLedger(ledgerOut)

  console.log(`\n${ledger.summaryLine()}`)
  console.log(`Result: ${result}`)
  console.log(`Ledger written:\n  ${jsonPath}\n  ${mdPath}`)
  process.exit(result === 'PASS' ? 0 : 1)
}

main()
