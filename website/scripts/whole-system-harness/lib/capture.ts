/**
 * capture.ts — write the L7 run ledger to data-room/05_outputs/.
 *
 * data-room/05_outputs/ is the room's results folder (0e; brief §6). Each run
 * writes two artefacts:
 *   - a JSON ledger (machine-readable: mode, assertions, status codes, EvaluatedAction)
 *   - a Markdown summary (founder-readable)
 *
 * The output dir is resolved relative to THIS file (via import.meta.url), not
 * the working directory, so the harness can be run from anywhere.
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'

const HERE = dirname(fileURLToPath(import.meta.url))
// lib/ → whole-system-harness/ → scripts/ → website/ → <repo root> → data-room/05_outputs
export const OUTPUT_DIR = resolve(HERE, '../../../../data-room/05_outputs')

export interface RunLedger {
  scenario: 'L7'
  mode: 'build-only' | 'live'
  timestamp: string
  result: 'PASS' | 'FAIL'
  assertions: { label: string; pass: boolean; detail?: string }[]
  summary: string
  /** live-only: the /api/reason status code */
  reason_status?: number
  /** live-only: the /api/accreditation status code */
  accreditation_status?: number
  /** bridge step output */
  receipt_id?: string
  evaluated_action?: unknown
  /** scenario input the run consumed (recorded for inspectability) */
  scenario_input?: unknown
  /** narrative notes (deferred assertions, build-only caveats) */
  notes?: string[]
}

export function writeLedger(ledger: RunLedger): { jsonPath: string; mdPath: string } {
  mkdirSync(OUTPUT_DIR, { recursive: true })
  const stamp = ledger.timestamp.replace(/[:.]/g, '-')
  const base = `L7-${ledger.mode}-${stamp}`
  const jsonPath = join(OUTPUT_DIR, `${base}.json`)
  const mdPath = join(OUTPUT_DIR, `${base}.md`)

  writeFileSync(jsonPath, JSON.stringify(ledger, null, 2) + '\n', 'utf8')
  writeFileSync(mdPath, renderMarkdown(ledger), 'utf8')
  return { jsonPath, mdPath }
}

function renderMarkdown(l: RunLedger): string {
  const lines: string[] = []
  lines.push('# L7 Single-Loop Proof — Run Ledger')
  lines.push('')
  lines.push(`- **Scenario:** ${l.scenario} (Reasoning + Assent)`)
  lines.push(`- **Mode:** ${l.mode}`)
  lines.push(`- **Timestamp:** ${l.timestamp}`)
  lines.push(`- **Result:** ${l.result}`)
  lines.push(`- **Summary:** ${l.summary}`)
  if (l.reason_status !== undefined) lines.push(`- **/api/reason status:** ${l.reason_status}`)
  if (l.accreditation_status !== undefined) {
    lines.push(`- **/api/accreditation status:** ${l.accreditation_status}`)
  }
  if (l.receipt_id) lines.push(`- **Bridge receipt_id:** \`${l.receipt_id}\``)
  lines.push('')

  lines.push('## Assertions')
  lines.push('')
  lines.push('| Result | Assertion | Detail |')
  lines.push('|---|---|---|')
  for (const a of l.assertions) {
    const detail = a.detail ? a.detail.replace(/\|/g, '\\|') : ''
    lines.push(`| ${a.pass ? 'PASS' : 'FAIL'} | ${a.label.replace(/\|/g, '\\|')} | ${detail} |`)
  }
  lines.push('')

  if (l.notes && l.notes.length > 0) {
    lines.push('## Notes')
    lines.push('')
    for (const n of l.notes) lines.push(`- ${n}`)
    lines.push('')
  }

  if (l.evaluated_action) {
    lines.push('## EvaluatedAction (bridge output)')
    lines.push('')
    lines.push('```json')
    lines.push(JSON.stringify(l.evaluated_action, null, 2))
    lines.push('```')
    lines.push('')
  }

  if (l.scenario_input) {
    lines.push('## Scenario input consumed')
    lines.push('')
    lines.push('```json')
    lines.push(JSON.stringify(l.scenario_input, null, 2))
    lines.push('```')
    lines.push('')
  }

  return lines.join('\n') + '\n'
}
