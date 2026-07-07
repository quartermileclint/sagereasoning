/**
 * corroboration-eval.ts — STANDALONE invocation of the deterministic corroboration
 * check over an (extraction, action-text) pair (Trust Layer plan S0a addendum;
 * mentor answer A9 case-2 — delegation-chain responsibility keys on "would the
 * corroboration check have flagged it", so the check must be runnable as its own
 * evaluation, not only inline in the sandwich).
 *
 * No LLM, no env, no DB — pure deterministic evaluation.
 *
 * RUN:
 *   cd website && npx tsx scripts/corroboration-eval.ts <pair.json>
 *   # pair.json: { "schema": <Layer1Schema>, "action_text": "<the verbatim action text>" }
 *   # (aliases accepted: "extraction" for schema, "artifact_text"/"input" for action_text)
 *
 * OUTPUT: the full CorroborationReport as JSON on stdout. Exit 0 always (the
 * report IS the verdict; `any_contradiction` / the overrides are the flags).
 */

import { readFileSync } from 'node:fs'
import { validateLayer1Schema } from '@/lib/translation-sandwich/layer1-extractor'
import { corroborateExtraction } from '@/lib/translation-sandwich/corroboration-check'

function main(): void {
  const path = process.argv[2]
  if (!path) {
    console.error('usage: npx tsx scripts/corroboration-eval.ts <pair.json>')
    console.error('  pair.json: { "schema": <Layer1Schema>, "action_text": "..." }')
    process.exit(1)
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  const schemaRaw = raw.schema ?? raw.extraction
  const actionText = raw.action_text ?? raw.artifact_text ?? raw.input
  if (schemaRaw === undefined || typeof actionText !== 'string') {
    console.error('pair.json must carry a "schema" (or "extraction") object and an "action_text" (or "artifact_text"/"input") string')
    process.exit(1)
  }
  const schema = validateLayer1Schema(schemaRaw) // throws with a precise message on an invalid extraction
  const report = corroborateExtraction(schema, actionText)
  console.log(JSON.stringify(report, null, 2))
}

main()
