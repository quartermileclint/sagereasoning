/**
 * ee-c1-kathekon-justification-wording.test.ts — the EE-C1 pin.
 *
 * Plain-assertion script: npx tsx <this file>  (pure — layer2-mechanisms has no
 * Supabase chain; no LLM, no I/O beyond reading the mentor's own record).
 *
 * WHAT IT PROVES, and why it is built this way:
 *
 * The zero-kathekon-factor justification string is RULED VERBATIM (EE-C1,
 * 2026-08-23). A pin that hard-codes the expected string in the test would drift
 * from the ruling in exactly the way this project keeps getting bitten by: the
 * test and the code would agree with each other while both diverged from the
 * mentor's actual words, and nothing would notice.
 *
 * So the expected string is READ FROM THE MENTOR'S OWN VERBATIM RECORD at
 * assertion time and byte-compared against what the engine actually emits.
 * Consequences, both intended:
 *   - reword the CODE  → this test fails.
 *   - reword the RECORD → this test fails.
 * The only way to pass is for the two to agree, which is the property worth
 * pinning.
 *
 * IT ALSO PINS THE NON-CHANGE. EE-C1 is a wording change and nothing else — the
 * ruling says so explicitly ("The classification and every downstream
 * consequence are unchanged"). So the classification, quality, and the derived
 * proximity are asserted alongside the string; a future edit that "improves" the
 * wording by also touching the verdict reds here.
 *
 * AND IT PINS THE SECOND SURFACE. The ruling names two measured surfaces for
 * one change. synthesizeReasoning (guardrail-sandwich.ts) composes the live
 * guardrail `reasoning` from this same justification, so a single source edit
 * must reach both — asserted end-to-end rather than assumed from a code read.
 * (This is also why NO edit to guardrail-sandwich.ts was made or is wanted: an
 * additive note there would be the second disclosure channel the ruling
 * declined.)
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import type { Layer1Schema } from '../layer1-extractor'
import { applyMechanisms, type Layer2Assessment, type Tier1ShortCircuit } from '../layer2-mechanisms'
import { synthesizeReasoning } from '@/lib/guardrail-sandwich'

let passed = 0
let failed = 0
const failures: string[] = []
function assert(condition: boolean, label: string): void {
  if (condition) passed++
  else {
    failed++
    failures.push(label)
    console.error(`FAIL: ${label}`)
  }
}

function full(x: Layer2Assessment | Tier1ShortCircuit, label: string): Layer2Assessment {
  if ('tier1_trigger' in x) {
    throw new Error(`${label}: unexpected Tier-1 short-circuit ${x.tier1_trigger.trigger_code}`)
  }
  return x
}

function base(overrides: Partial<Layer1Schema>): Layer1Schema {
  return {
    version: 'layer1-schema-v1',
    passions_present: [],
    control_filter_elements: [],
    oikeiosis_circles_engaged: [],
    value_categories_at_stake: [],
    kathekon_factors: [],
    urgency_indicators: [],
    causal_stage_evidence: [],
    eupatheia_candidates: [],
    stated_concern_targets: [],
    stated_equanimity_signals: [],
    motivation_stated: false,
    motivation_evidence: [],
    element_fusion_detected: { fused: false, fused_concerns: null },
    ambiguity_notes: [],
    ...overrides,
  }
}

// ============================================================================
// A. The ruled string, read from the mentor's own record
// ============================================================================

const RECORD_PATH = join(
  process.cwd(),
  '..',
  'operations',
  'agent-circles-2026-08',
  '2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md',
)

const record = readFileSync(RECORD_PATH, 'utf-8')

// The record states it as:   *Ruled wording:* "…"
const ruledMatch = record.match(/\*Ruled wording:\*\s*"([^"]+)"/)
assert(ruledMatch !== null, 'A-1 the mentor record still carries a *Ruled wording:* line (an unparseable record is a failed pin, never a skip)')
const RULED = ruledMatch ? ruledMatch[1] : '<<record unparseable>>'

// Non-vacuity: the extracted string must actually be the EE-C1 one, or a future
// record edit that moved this marker elsewhere would silently pin the wrong text.
assert(
  RULED.startsWith('No kathekon factors were extracted'),
  'A-2 the extracted ruled wording is EE-C1’s (non-vacuity: the marker did not drift onto a different ruling)',
)
assert(
  RULED.includes('on that basis'),
  'A-3 the ruled wording carries "on that basis" — the ruling’s own one revision to the proposed direction ("absence" reads as a claim about the world; "basis" as a claim about the extraction)',
)
assert(
  !RULED.includes('on that absence'),
  'A-4 the ruled wording does NOT carry the superseded "on that absence" phrasing',
)

// ============================================================================
// B. The engine emits it, byte-for-byte
// ============================================================================

const zeroFactors = full(applyMechanisms(base({}), { dikaiosyneWeighting: false }), 'zero-factor off')

assert(
  zeroFactors.kathekon_assessment.justification === RULED,
  'B-1 the zero-kathekon-factor justification is BYTE-IDENTICAL to the mentor’s ruled wording',
)

// The same under the live flag state — the wording is not flag-conditional.
const zeroFactorsOn = full(applyMechanisms(base({}), { dikaiosyneWeighting: true }), 'zero-factor on')
assert(
  zeroFactorsOn.kathekon_assessment.justification === RULED,
  'B-2 the wording is identical with dikaiosyne weighting ON (it is not flag-conditional)',
)

// The superseded string is gone from the emitted output entirely.
assert(
  !zeroFactors.kathekon_assessment.justification.includes('No kathekon factors detected'),
  'B-3 the superseded string is no longer emitted',
)

// ============================================================================
// C. THE NON-CHANGE — EE-C1 changed the wording and NOTHING else
// ============================================================================

assert(zeroFactors.kathekon_assessment.is_kathekon === false, 'C-1 is_kathekon is still false')
assert(zeroFactors.kathekon_assessment.quality === 'contrary', 'C-2 kathekon quality is still contrary')
assert(
  zeroFactorsOn.katorthoma_proximity === zeroFactors.katorthoma_proximity,
  'C-3 the derived proximity is unchanged across the flag states this pin exercises',
)

// A populated-factor case is untouched by EE-C1 — it never used that branch.
const withFactor = full(
  applyMechanisms(
    base({ kathekon_factors: [{ factor_type: 'role_obligation', description: 'r', evidence: 'my role' }] }),
    { dikaiosyneWeighting: false },
  ),
  'one-factor',
)
assert(
  withFactor.kathekon_assessment.justification === 'role obligation engaged.',
  'C-4 the populated-factor justification branch is untouched (EE-C1 changed only the zero-factor branch)',
)
assert(
  withFactor.kathekon_assessment.justification !== RULED,
  'C-5 non-vacuity: the two branches genuinely differ, so B-1 is not trivially satisfied by every input',
)

// ============================================================================
// D. THE SECOND MEASURED SURFACE — one string, two surfaces, no second edit
// ============================================================================

const reasoning = synthesizeReasoning(zeroFactors)

assert(
  reasoning.includes(RULED),
  'D-1 the LIVE guardrail `reasoning` carries the ruled wording verbatim — the single source edit reaches BOTH measured surfaces',
)
assert(
  !reasoning.includes('No kathekon factors detected'),
  'D-2 the superseded string is gone from the guardrail surface too',
)
// The guardrail composes; it does not restate. If someone ever adds a second
// copy of this claim in guardrail-sandwich.ts, the claim would appear twice —
// which is precisely the drift risk the ruling declined ("two disclosure
// channels for the same claim").
const occurrences = reasoning.split(RULED).length - 1
assert(
  occurrences === 1,
  'D-3 the claim appears EXACTLY ONCE on the guardrail surface — no second disclosure channel was introduced',
)

// ============================================================================
console.log(`ee-c1-kathekon-justification-wording battery: ${passed} passed, ${failed} failed`)
if (failures.length) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
}
process.exit(failed === 0 ? 0 : 1)
