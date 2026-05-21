/**
 * question-library.test.ts — content-integrity tests for the Sage Calling
 * question library + clarification templates (build Stage 1,
 * D-SAGE-CALLING-STAGE1-BUILD-WIRED-VERIFIED-2026-05-21).
 *
 * Run via: npx tsx website/src/lib/sage-calling/__tests__/question-library.test.ts
 * (plain-assertion script; no Jest — mirrors the substrate / translation-sandwich
 *  test harness pattern. No Supabase import → no --env-file needed.)
 *
 * Checks (per the Stage 1 prompt Step 4):
 *   CI  — Content-integrity: 24 variants present; six stages (Q1–Q6) covered 4×
 *         each; A/B/C/D present per stage with no duplicates; every field
 *         non-empty.
 *   CT  — Clarification templates: exactly four (A–D), non-empty.
 *   VB  — Verbatim: every variant `text`, every variant `use_when`, and every
 *         clarification-template paragraph appears VERBATIM in the locked design
 *         (/adopted/purpose-discovery-product-design.md — the source of truth).
 *         This is the "text matches the locked design" check, run against ALL
 *         content rather than as a spot-check.
 *
 * Exit code 0 = all pass. Non-zero = failures listed.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import {
  QUESTION_VARIANTS,
  CLARIFICATION_TEMPLATES,
  CALLING_STAGES,
  VARIANT_IDS,
} from '../question-library'

// ============================================================================
// Test runner — plain assertions; exit code reports pass/fail
// ============================================================================

let passCount = 0
let failCount = 0
const failures: string[] = []

function assert(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passCount++
    console.log(`PASS  ${label}`)
  } else {
    failCount++
    const msg = detail ? `${label} — ${detail}` : label
    failures.push(msg)
    console.log(`FAIL  ${msg}`)
  }
}

function assertEqual<T>(label: string, actual: T, expected: T): void {
  const ok = actual === expected
  assert(
    label,
    ok,
    ok ? undefined : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

// ============================================================================
// CI — Content-integrity: structure of the 24-variant library
// ============================================================================

assertEqual('CI-1  exactly 24 question variants', QUESTION_VARIANTS.length, 24)

assertEqual('CI-2  CALLING_STAGES is the six stages Q1–Q6', JSON.stringify(CALLING_STAGES), JSON.stringify(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']))

assertEqual('CI-3  VARIANT_IDS is A/B/C/D', JSON.stringify(VARIANT_IDS), JSON.stringify(['A', 'B', 'C', 'D']))

for (const stage of CALLING_STAGES) {
  const ofStage = QUESTION_VARIANTS.filter((v) => v.stage === stage)
  assertEqual(`CI-4  stage ${stage} has exactly 4 variants`, ofStage.length, 4)

  const ids = ofStage.map((v) => v.variant).sort()
  assertEqual(
    `CI-5  stage ${stage} has variants A/B/C/D (no dupes, none missing)`,
    JSON.stringify(ids),
    JSON.stringify(['A', 'B', 'C', 'D'])
  )
}

// Every variant references a valid stage + variant id.
{
  const stageSet = new Set(CALLING_STAGES as readonly string[])
  const idSet = new Set(VARIANT_IDS as readonly string[])
  const allValid = QUESTION_VARIANTS.every((v) => stageSet.has(v.stage) && idSet.has(v.variant))
  assert('CI-6  every variant has a valid stage + variant id', allValid)
}

// Non-empty fields on every variant.
{
  const allNonEmpty = QUESTION_VARIANTS.every(
    (v) => v.label.trim().length > 0 && v.text.trim().length > 0 && v.use_when.trim().length > 0
  )
  assert('CI-7  every variant has non-empty label, text, and use_when', allNonEmpty)
}

// No two variants share identical text (each is a distinct question).
{
  const texts = new Set(QUESTION_VARIANTS.map((v) => v.text))
  assertEqual('CI-8  all 24 variant texts are distinct', texts.size, 24)
}

// ============================================================================
// CT — Clarification templates
// ============================================================================

assertEqual('CT-1  exactly four clarification templates', CLARIFICATION_TEMPLATES.length, 4)

{
  const ids = CLARIFICATION_TEMPLATES.map((t) => t.variant).sort()
  assertEqual(
    'CT-2  clarification templates are A/B/C/D (no dupes, none missing)',
    JSON.stringify(ids),
    JSON.stringify(['A', 'B', 'C', 'D'])
  )
}

{
  const allNonEmpty = CLARIFICATION_TEMPLATES.every(
    (t) => t.label.trim().length > 0 && t.text.trim().length > 0
  )
  assert('CT-3  every clarification template has non-empty label + text', allNonEmpty)
}

// ============================================================================
// VB — Verbatim: all content appears in the locked design (source of truth)
// ============================================================================

/** Walk up from cwd to find the repo's locked design doc, robust to whether the
 *  test is run from the repo root or from website/. */
function locateDesign(): string | null {
  let dir = process.cwd()
  for (let i = 0; i < 8; i++) {
    const candidate = join(dir, 'adopted', 'purpose-discovery-product-design.md')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return null
}

const designPath = locateDesign()
if (designPath === null) {
  assert(
    'VB-0  locked design located for verbatim cross-check',
    false,
    'could not find adopted/purpose-discovery-product-design.md by walking up from cwd; run from the repo root or website/'
  )
} else {
  assert('VB-0  locked design located for verbatim cross-check', true)
  const design = readFileSync(designPath, 'utf8')

  // Each variant's question text appears verbatim in the design.
  for (const v of QUESTION_VARIANTS) {
    assert(
      `VB  ${v.stage}/${v.variant} text is verbatim in the locked design`,
      design.includes(v.text),
      'variant text not found verbatim in design'
    )
  }

  // Each variant's use_when (trigger description) appears verbatim in the design.
  for (const v of QUESTION_VARIANTS) {
    assert(
      `VB  ${v.stage}/${v.variant} use_when is verbatim in the locked design`,
      design.includes(v.use_when),
      'variant use_when not found verbatim in design'
    )
  }

  // Each clarification template's paragraphs appear verbatim in the design.
  // (Per-paragraph rather than whole-block — robust to inter-paragraph
  //  whitespace, while still proving the prose is verbatim.)
  for (const t of CLARIFICATION_TEMPLATES) {
    const paragraphs = t.text.split('\n\n').map((p) => p.trim()).filter((p) => p.length > 0)
    paragraphs.forEach((para, i) => {
      assert(
        `VB  clarification ${t.variant} paragraph ${i + 1} is verbatim in the locked design`,
        design.includes(para),
        `paragraph not found verbatim: "${para.slice(0, 48)}…"`
      )
    })
  }
}

// ============================================================================
// Report
// ============================================================================

console.log(`\n${passCount} pass / ${failCount} fail`)
if (failCount > 0) {
  console.log('\nFailures:')
  failures.forEach((f) => console.log(`  - ${f}`))
  process.exit(1)
}
process.exit(0)
