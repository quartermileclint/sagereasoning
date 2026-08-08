/**
 * orientation-reading.test.ts — the C2 orientation-reading battery
 * (agent-circles C2a/C2b/C2(ii)/C2e, 2026-08-08).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — no env, no I/O, no
 * LLM. Pins, per the build plan §6 + the approved scope's own pins:
 *   §1  computeOrientationReading — every branch, transcribed-scope parity,
 *       determinism, conservative default (never a defaulted 'toward').
 *   §2  ORIENTATION_ENTRY_TEXT + the not-attestable clause — VERBATIM locks
 *       (the mentor's exact sentences; battery-locked, never reworded).
 *   §3  composeGenerativePrompt — population conditions (away/indeterminate +
 *       ≥1 circle only; NEVER on 'toward'; never circle-less), the settled
 *       one-sentence format, the widest-circle rule, the circle-5 telos case.
 *   §4  Prompt gating — orientation category present ONLY when BOTH flags on;
 *       flag-off prompt BYTE-IDENTICAL to the C1 prompt (the C2a dark rule).
 *   §5  Validation — the optional-field discipline (absent/null/empty omitted;
 *       bad enum / empty span rejected; valid entries round-trip).
 *   §6  PLACEMENT PINS (the C2c ruling made structural): the reading never
 *       enters applyMechanisms/computeProximity or any consult-response field;
 *       the route strips + refuses; the gate strips; the suggestion composer
 *       is silent on the fifth circle (source-grep INV pins, the house
 *       r20a-audience-rendering pattern).
 *   §7  ORIENTATION_READING_BOUNDS — verbatim lock.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import {
  computeOrientationReading,
  composeGenerativePrompt,
  ORIENTATION_ENTRY_TEXT,
  ORIENTATION_NOT_ATTESTABLE_CLAUSE,
  ORIENTATION_READING_BOUNDS,
  engagedCircleNames,
  isOrientationReadingEnabled,
  classifyOrientationDelivery,
  selectOrientationEntryWording,
  ORIENTATION_DELIVERY_TIMEOUT_MS,
  ORIENTATION_OBSERVED_ENTRY_TEXT,
  ORIENTATION_OBSERVED_NOT_ATTESTABLE_CLAUSE,
} from '../orientation-reading'
import {
  buildLayer1SystemPrompt,
  validateLayer1Schema,
  Layer1ValidationError,
  type OrientationObservation,
} from '../layer1-extractor'

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

function g(evidence = 'weighed the specific impression'): OrientationObservation {
  return { observed: 'genuine_examination_markers', evidence }
}
function h(evidence = 'the way I always handle these'): OrientationObservation {
  return { observed: 'habitual_output_markers', evidence }
}

// ============================================================================
// §1 computeOrientationReading — branches + determinism
// ============================================================================

{
  const r1 = computeOrientationReading(undefined)
  assert(r1.reading === 'indeterminate' && r1.basis === 'no_orientation_observations_extracted', '§1.1 undefined → indeterminate/no_observations')
  const r2 = computeOrientationReading(null)
  assert(r2.reading === 'indeterminate' && r2.basis === 'no_orientation_observations_extracted', '§1.2 null → indeterminate/no_observations')
  const r3 = computeOrientationReading([])
  assert(r3.reading === 'indeterminate' && r3.basis === 'no_orientation_observations_extracted', '§1.3 empty → indeterminate/no_observations')

  const r4 = computeOrientationReading([g()])
  assert(r4.reading === 'toward' && r4.basis === 'genuine_examination_markers_only', '§1.4 genuine-only → toward')
  const r5 = computeOrientationReading([g(), g('revised a first reading')])
  assert(r5.reading === 'toward', '§1.5 multiple genuine → toward')

  const r6 = computeOrientationReading([h()])
  assert(r6.reading === 'away' && r6.basis === 'habitual_output_markers_only', '§1.6 habitual-only → away')

  const r7 = computeOrientationReading([g(), h()])
  assert(r7.reading === 'indeterminate' && r7.basis === 'mixed_or_tied_observations', '§1.7 tied mixed → indeterminate/mixed_or_tied')
  const r8 = computeOrientationReading([g(), g(), h()])
  assert(r8.reading === 'indeterminate' && r8.basis === 'insufficient_extraction', '§1.8 unequal mixed → indeterminate/insufficient (never a defaulted toward)')
  const r9 = computeOrientationReading([h(), h(), g()])
  assert(r9.reading === 'indeterminate', '§1.9 habitual-majority mixed still indeterminate (never away on conflict)')

  // Determinism: identical input ⇒ identical output object shape.
  const a = computeOrientationReading([g(), h()])
  const b = computeOrientationReading([g(), h()])
  assert(JSON.stringify(a) === JSON.stringify(b), '§1.10 deterministic')
}

// ============================================================================
// §2 Entry text + the not-attestable clause — VERBATIM
// ============================================================================

{
  assert(ORIENTATION_ENTRY_TEXT.toward === 'This examination moved toward the rational order.', '§2.1 toward entry text verbatim')
  assert(ORIENTATION_ENTRY_TEXT.away === 'This examination moved away from the rational order.', '§2.2 away entry text verbatim')
  assert(
    ORIENTATION_ENTRY_TEXT.indeterminate === 'This examination showed insufficient evidence to read a direction.',
    '§2.3 indeterminate entry text verbatim',
  )
  // The mentor's EXACT two sentences (Q6 / the placement ruling) — never reworded.
  assert(
    ORIENTATION_NOT_ATTESTABLE_CLAUSE ===
      'The record can attest that specific examinations were oriented toward the rational order. It cannot attest that the agent is fifth-circle-aligned.',
    '§2.4 not-attestable clause verbatim (the mentor\'s two sentences)',
  )
  // Entry text is EXAMINATION-voiced, never agent-voiced (the ruling's own
  // distinction — "It does not say: this agent is oriented…").
  for (const text of Object.values(ORIENTATION_ENTRY_TEXT)) {
    assert(text.startsWith('This examination'), `§2.5 entry text examination-voiced: "${text}"`)
    assert(!text.includes('agent'), `§2.6 entry text never names the agent: "${text}"`)
  }
}

// ============================================================================
// §3 composeGenerativePrompt — population + format
// ============================================================================

{
  assert(composeGenerativePrompt('toward', ['household']) === undefined, '§3.1 NEVER on toward')
  assert(composeGenerativePrompt('away', []) === undefined, '§3.2 never circle-less (away)')
  assert(composeGenerativePrompt('indeterminate', []) === undefined, '§3.3 never circle-less (indeterminate)')
  assert(composeGenerativePrompt('away', ['unknown_circle_name']) === undefined, '§3.4 unmappable circle names → no prompt')

  const p1 = composeGenerativePrompt('away', ['local_community'])
  assert(p1 !== undefined && p1.startsWith('this action engaged circle 3'), '§3.5 settled format prefix (circle 3)')
  assert(p1 !== undefined && p1.includes('toward circle 4'), '§3.6 targets N+1')
  // One sentence, maximum (ruling 5): exactly one terminal period, no second
  // sentence-forming ". " boundary.
  assert(p1 !== undefined && p1.endsWith('.') && !p1.slice(0, -1).includes('. '), '§3.7 one sentence, maximum')

  // Widest engaged circle wins: household(2) + political_community(3) → 3→4.
  const p2 = composeGenerativePrompt('indeterminate', ['household', 'political_community'])
  assert(p2 !== undefined && p2.startsWith('this action engaged circle 3'), '§3.8 widest circle governs')

  // cosmopolis(4) → circle 5, the telos — describable, never a party.
  const p3 = composeGenerativePrompt('away', ['cosmopolis'])
  assert(p3 !== undefined && p3.includes('toward circle 5') && p3.includes('rational order'), '§3.9 circle-5 telos case')
  assert(p3 !== undefined && p3.includes('never a party'), '§3.10 telos never a party (C3 mapping rule)')

  // Gap DESCRIPTION, never a prescription: no imperative "must"/"should".
  for (const p of [p1, p2, p3]) {
    assert(p !== undefined && !/\b(must|should|shall)\b/.test(p), '§3.11 description, never an instruction')
  }
}

// ============================================================================
// §4 Prompt gating — both flags required; flag-off byte-identity
// ============================================================================

{
  const c1Prompt = buildLayer1SystemPrompt(true)
  const c1PromptExplicit = buildLayer1SystemPrompt(true, false)
  assert(c1Prompt === c1PromptExplicit, '§4.1 default second param ⇒ byte-identical to the C1 prompt (flag-off dark rule)')
  assert(!c1Prompt.includes('orientation_observations'), '§4.2 orientation never solicited flag-off')

  const both = buildLayer1SystemPrompt(true, true)
  assert(both.includes('14. orientation_observations'), '§4.3 category 14 present when both flags on')
  assert(both.includes('fourteen'), '§4.4 category count fourteen')
  assert(both.includes('genuine_examination_markers') && both.includes('habitual_output_markers'), '§4.5 both marker classes taught')
  assert(both.includes('brevity is not habit'), '§4.6 absence-is-not-evidence guard taught')

  // Orientation WITHOUT agent-circles: the section must NOT render (Q9b — the
  // criterion presupposes the corrected first-circle regime).
  const orientOnly = buildLayer1SystemPrompt(false, true)
  assert(orientOnly === buildLayer1SystemPrompt(false), '§4.7 orientation alone changes nothing (requires agent-circles)')
  assert(!orientOnly.includes('orientation_observations'), '§4.8 no category without agent-circles')

  // Flag reader: exact-string 'true' only.
  const saved = process.env.SUBSTRATE_ORIENTATION_READING_ENABLED
  delete process.env.SUBSTRATE_ORIENTATION_READING_ENABLED
  assert(isOrientationReadingEnabled() === false, '§4.9 flag unset → false')
  process.env.SUBSTRATE_ORIENTATION_READING_ENABLED = '1'
  assert(isOrientationReadingEnabled() === false, '§4.10 flag "1" → false (exact-string discipline)')
  process.env.SUBSTRATE_ORIENTATION_READING_ENABLED = 'true'
  assert(isOrientationReadingEnabled() === true, '§4.11 flag "true" → true')
  if (saved === undefined) delete process.env.SUBSTRATE_ORIENTATION_READING_ENABLED
  else process.env.SUBSTRATE_ORIENTATION_READING_ENABLED = saved
}

// ============================================================================
// §5 Validation — the optional-field discipline
// ============================================================================

{
  const base = {
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
  }

  const v1 = validateLayer1Schema({ ...base })
  assert(!('orientation_observations' in v1), '§5.1 absent → key omitted')
  const v2 = validateLayer1Schema({ ...base, orientation_observations: null })
  assert(!('orientation_observations' in v2), '§5.2 explicit null → key omitted')
  const v3 = validateLayer1Schema({ ...base, orientation_observations: [] })
  assert(!('orientation_observations' in v3), '§5.3 empty array → key omitted')

  const v4 = validateLayer1Schema({
    ...base,
    orientation_observations: [
      { observed: 'genuine_examination_markers', evidence: 're-checked what they were owed' },
      { observed: 'habitual_output_markers', evidence: 'as usual' },
    ],
  })
  assert(
    Array.isArray(v4.orientation_observations) && v4.orientation_observations.length === 2,
    '§5.4 valid entries round-trip',
  )

  let threw = false
  try {
    validateLayer1Schema({
      ...base,
      orientation_observations: [{ observed: 'confident_markers', evidence: 'x' }],
    })
  } catch (e) {
    threw = e instanceof Layer1ValidationError && e.category === 'enum'
  }
  assert(threw, '§5.5 unknown marker class rejected (enum)')

  threw = false
  try {
    validateLayer1Schema({
      ...base,
      orientation_observations: [{ observed: 'genuine_examination_markers', evidence: '   ' }],
    })
  } catch (e) {
    threw = e instanceof Layer1ValidationError && e.category === 'shape'
  }
  assert(threw, '§5.6 whitespace-only evidence rejected (an observation requires substance)')

  // engagedCircleNames: dedup + order + tolerance.
  const names = engagedCircleNames({
    oikeiosis_circles_engaged: [
      { circle: 'household', evidence: 'x' },
      { circle: 'cosmopolis', evidence: 'y' },
      { circle: 'household', evidence: 'z' },
    ] as never,
  })
  assert(JSON.stringify(names) === JSON.stringify(['household', 'cosmopolis']), '§5.7 engagedCircleNames dedups in order')
  assert(engagedCircleNames({ oikeiosis_circles_engaged: null as never }).length === 0, '§5.8 engagedCircleNames tolerates null')
}

// ============================================================================
// §6 PLACEMENT PINS (the C2c ruling, structural) — source-grep INV pins
// ============================================================================

{
  const read = (rel: string): string => readFileSync(join(__dirname, rel), 'utf8')

  // INV-1: the verdict path NEVER sees the reading — layer2-mechanisms has no
  // orientation import and no orientation logic (the computation lives outside
  // applyMechanisms' call graph BY CONSTRUCTION).
  const l2 = read('../layer2-mechanisms.ts')
  assert(!l2.includes('orientation-reading') && !l2.includes('orientation_observations'), '§6.1 INV: layer2-mechanisms is orientation-free (never feeds the verdict)')

  // INV-2: parallel-run (the consult response composer) is orientation-free —
  // the strip + emission live at the ROUTE decoration seam, not in the sandwich.
  const pr = read('../parallel-run.ts')
  assert(!pr.includes('orientation'), '§6.2 INV: parallel-run is orientation-free')

  // INV-3: the route strips the wire echo, refuses supplied observations, and
  // emits via the trust-core hook — all behind the flag.
  const route = readFileSync(
    join(__dirname, '../../../app/api/reason/route.ts'),
    'utf8',
  )
  assert(route.includes("delete wireExtraction.orientation_observations"), '§6.3 INV: route strips orientation_observations from the wire echo')
  assert(route.includes("'orientation_observations_not_suppliable'"), '§6.4 INV: route refuses supplied observations (no false affordance)')
  assert(route.includes('emitOrientationReadingTrustEvent'), '§6.5 INV: route emits via the C1c hook')
  assert(route.includes('isOrientationReadingEnabled()'), '§6.6 INV: the route block is flag-gated')
  // F-1 (PR19 first-hand fold): the emission requires the agent-circles flag
  // too — no reading from an extraction that was never asked the question.
  const emissionMarkerIdx = route.indexOf('const wireExtraction = output.extraction as')
  const emissionBlock = route.slice(emissionMarkerIdx)
  assert(
    emissionBlock.slice(0, 1500).includes('isAgentCirclesEnabled() &&'),
    '§6.6b INV: the emission ANDs the agent-circles flag (mirrors the prompt gate)',
  )
  // PR19 re-run fold (2026-08-08, CONFIRMED HIGH/MEDIUM, closed at the root):
  // the strip must be UNCONDITIONAL — never re-gated behind either flag. A
  // mutation that re-wraps the delete inside `if (isOrientationReadingEnabled())`
  // would place that literal BETWEEN this marker and the delete call, which
  // the negative assertion below catches (stronger than a bare presence pin —
  // it fails on the exact regression class PR19 found).
  const uncondMarkerIdx = route.indexOf('UNCONDITIONAL — see the fold note above')
  assert(uncondMarkerIdx !== -1, '§6.6c INV: the unconditional-strip fold marker is present')
  const uncondSlice = route.slice(uncondMarkerIdx, uncondMarkerIdx + 400)
  assert(
    uncondSlice.includes('delete wireExtraction.orientation_observations'),
    '§6.6d INV: the strip follows the unconditional marker directly',
  )
  assert(
    !uncondSlice.includes('isOrientationReadingEnabled()') &&
      !uncondSlice.includes('isAgentCirclesEnabled()'),
    '§6.6e INV: the strip is NOT re-gated behind either flag between the marker and the delete (the PR19 byte-identity fold)',
  )
  // PR19 re-run fold (2026-08-08, CONFIRMED nit): skip the credCtx read on a
  // supplied schema (layer1Source would be 'supplied' and the hook no-ops).
  assert(
    emissionBlock.slice(0, 1500).includes('preExtractedLayer1Schema === undefined &&'),
    '§6.6f INV: the emission skips work entirely on a supplied schema',
  )

  // INV-4: the gate strips its echo too (the at-action hook consumes the gate
  // verdict — the markers must never sit one step from an at-action frame).
  const gate = readFileSync(join(__dirname, '../../guardrail-sandwich.ts'), 'utf8')
  assert(gate.includes('orientation_observations: _stripped'), '§6.7 INV: guardrail strips the extraction echo')

  // INV-5: at-action/one-question silence — the suggestion composer never
  // names the fifth circle, the orientation reading, or the rational order
  // (Q7: "The at-action moment: silent on the fifth circle").
  const suggestion = readFileSync(
    join(__dirname, '../../substrate/practice-suggestion.ts'),
    'utf8',
  )
  // (The bare word "orientation" appears in a pre-existing philodoxia line —
  // "orientation toward reputation" — a different sense; the pin targets the
  // fifth-circle vocabulary specifically.)
  assert(
    !/rational order|fifth circle|fifth-circle|orientation.reading|orientation_reading|OrientationReading/i.test(
      suggestion,
    ),
    '§6.8 INV: the suggestion composer is fifth-circle-SILENT (no basis code, no line)',
  )

  // INV-6: the reflect surfacing seam exists exactly as designed — Q6-only +
  // flag-gated, at the service layer (the engine + bank stay pure/static).
  const reflectService = readFileSync(
    join(__dirname, '../../sage-reflect/reflect-service.ts'),
    'utf8',
  )
  assert(reflectService.includes("questionId !== 'Q6' || !isOrientationReadingEnabled()"), '§6.9 INV: reflect orientation question is Q6-only + flag-gated')
  assert(
    (reflectService.match(/withOrientationSubquestion\(/g) ?? []).length >= 4,
    '§6.10 INV: the helper is applied at every question-decision site (3 call sites + 1 definition)',
  )
  const engine = readFileSync(join(__dirname, '../../sage-reflect/engine.ts'), 'utf8')
  assert(!engine.includes('orientation'), '§6.11 INV: the reflect engine stays orientation-free (purity preserved)')

  // INV-7: the C1c emission path is INSERT-ONLY — the hook uses
  // emitLedgerOnlyTrustEvents and NEVER the generic emitTrustEvents (whose
  // null-domain branch would stamp a reflect timestamp — half-rate decay).
  const hooks = readFileSync(
    join(__dirname, '../../substrate/trust-core/emission-hooks.ts'),
    'utf8',
  )
  const orientHookBody = hooks.slice(hooks.indexOf('export async function emitOrientationReadingTrustEvent'))
  const orientFnBody = orientHookBody.slice(0, orientHookBody.indexOf('\n}\n') + 3)
  assert(orientFnBody.includes('emitLedgerOnlyTrustEvents'), '§6.12 INV: orientation emission is ledger-only')
  assert(!orientFnBody.includes('emitTrustEvents(['), '§6.13 INV: orientation emission never calls the generic folding emitter')

  // INV-8: the S10 entry composition carries the inline clause on EVERY entry
  // (asserted behaviourally in the S10 battery; pinned here at the source so a
  // refactor cannot drop the inline carry). Post the 2026-08-08 examined/
  // observed fold, the clause is selected via selectOrientationEntryWording
  // (class-dependent) rather than the bare ORIENTATION_NOT_ATTESTABLE_CLAUSE
  // constant — the pin now checks for the SELECTOR call, not the old literal.
  const payload = readFileSync(
    join(__dirname, '../../substrate/trust-core/trust-record-payload.ts'),
    'utf8',
  )
  assert(payload.includes('selectOrientationEntryWording('), '§6.14 INV: every S10 entry\'s wording is selected via selectOrientationEntryWording (class-dependent)')
  assert(payload.includes('not_attestable_clause: wording.notAttestableClause'), '§6.14b INV: not_attestable_clause is ALWAYS the selector\'s output — never a bare constant that could skip the observed-class branch')

  // INV-9 (2026-08-08 examined/observed fold, mentor ruling): the route
  // measures elapsed time from request receipt and threads it, unconditionally,
  // to the orientation emission call — never an omitted/optional field a
  // future edit could silently drop.
  assert(route.includes('const requestReceivedAtMs = Date.now()'), '§6.15 INV: route captures the request-receipt timestamp')
  assert(route.includes('elapsedMs: Date.now() - requestReceivedAtMs'), '§6.16 INV: route threads elapsedMs to the orientation emission call')

  // INV-10: elapsedMs is REQUIRED (not optional) on both the emission-input and
  // deriver-input types — a future edit widening either back to optional would
  // silently reopen the class-defaults-to-examined-on-omission risk the mentor
  // ruled must never happen unnoticed.
  const emissionTypes = read('../../substrate/trust-core/emission-hooks.ts')
  assert(/elapsedMs: number\b/.test(emissionTypes), '§6.17 INV: OrientationReadingEmissionInput.elapsedMs is required (not `elapsedMs?:`)')
  const deriveTypes = read('../../substrate/trust-core/derive-trust-events.ts')
  assert(/elapsedMs: number\b/.test(deriveTypes) && !/elapsedMs\?: number/.test(deriveTypes), '§6.18 INV: OrientationReadingInput.elapsedMs is required (not optional)')
}

// ============================================================================
// §7 Bounds — verbatim lock
// ============================================================================

{
  assert(ORIENTATION_READING_BOUNDS.startsWith('MEASURE-ONLY:'), '§7.1 bounds class prefix')
  assert(ORIENTATION_READING_BOUNDS.includes('never an input to katorthoma'), '§7.2 bounds never-an-input clause')
  assert(ORIENTATION_READING_BOUNDS.includes('never returned on the consult response'), '§7.3 bounds never-on-response clause')
  assert(ORIENTATION_READING_BOUNDS.includes('extraction-trust ceiling'), '§7.4 bounds gaming-ceiling disclosure')
  assert(ORIENTATION_READING_BOUNDS.endsWith(ORIENTATION_NOT_ATTESTABLE_CLAUSE), '§7.5 bounds carries the not-attestable clause verbatim')
}

// ============================================================================
// §8 THE EXAMINED/OBSERVED DELIVERY CLASS (2026-08-08, mentor ruling on the
// production-consult review's finding — an elapsed-time PROXY, never a
// confirmed-delivery signal)
// ============================================================================

{
  // §8.1 the threshold constant is EXACTLY the harness's documented default —
  // the mentor ruled explicitly against a tighter bound.
  assert(ORIENTATION_DELIVERY_TIMEOUT_MS === 28000, '§8.1 the delivery-classification threshold is EXACTLY 28000ms (mentor ruling: not a tighter bound)')

  // §8.2 classifyOrientationDelivery — boundary behaviour, both directions.
  assert(classifyOrientationDelivery(0) === 'examined', '§8.2a zero elapsed ⇒ examined')
  assert(classifyOrientationDelivery(27999) === 'examined', '§8.2b just under the threshold ⇒ examined')
  assert(classifyOrientationDelivery(28000) === 'examined', '§8.2c EXACTLY the threshold ⇒ examined (<=, never <)')
  assert(classifyOrientationDelivery(28001) === 'observed', '§8.2d one ms over the threshold ⇒ observed')
  assert(classifyOrientationDelivery(60000) === 'observed', '§8.2e well over the threshold ⇒ observed')

  // §8.3 selectOrientationEntryWording — 'examined' reuses the existing
  // per-reading templates (byte-identical to pre-fold behaviour); 'observed'
  // uses the FIXED verbatim pair regardless of the underlying reading.
  const towardExamined = selectOrientationEntryWording('toward', 'examined')
  assert(towardExamined.entryText === ORIENTATION_ENTRY_TEXT.toward, '§8.3a examined+toward ⇒ the existing toward template')
  assert(towardExamined.notAttestableClause === ORIENTATION_NOT_ATTESTABLE_CLAUSE, '§8.3b examined ⇒ the existing not-attestable clause')

  for (const reading of ['toward', 'away', 'indeterminate'] as const) {
    const observed = selectOrientationEntryWording(reading, 'observed')
    assert(observed.entryText === ORIENTATION_OBSERVED_ENTRY_TEXT, `§8.3c observed+${reading} ⇒ the fixed observed entry text (never the per-reading template)`)
    assert(observed.notAttestableClause === ORIENTATION_OBSERVED_NOT_ATTESTABLE_CLAUSE, `§8.3d observed+${reading} ⇒ the fixed observed clause (never the examined clause)`)
  }

  // §8.4 VERBATIM LOCKS (mentor ruling, exact — battery-locked, never reworded).
  assert(
    ORIENTATION_OBSERVED_ENTRY_TEXT ===
      'This action was scored by the server-side pipeline; the reasoning was not returned ' +
        'to the agent in time to be examined. This is an observation, not an examination.',
    '§8.4a the observed entry text is verbatim the mentor\'s ruling',
  )
  assert(
    ORIENTATION_OBSERVED_NOT_ATTESTABLE_CLAUSE ===
      'The record can attest that this action was scored. It cannot attest that the agent ' +
        'examined the reasoning behind it — the framing was not delivered within the agent\'s ' +
        'own consult window.',
    '§8.4b the observed not-attestable clause is verbatim the mentor\'s ruling',
  )
  // The mentor's own stated invariant (verbatim in the ruling): "the word
  // 'examination' does not appear in the observed-class wording anywhere."
  // The entry text uses "examined" (a verb, past tense, inside "not returned
  // ... in time to be examined") and "examination" (inside "not an
  // examination") — checked literally: the exact noun form 'examination'
  // appears exactly once, inside the explicit negation "not an examination".
  const entryOccurrences = ORIENTATION_OBSERVED_ENTRY_TEXT.match(/examination/gi) ?? []
  assert(entryOccurrences.length === 1, '§8.4c the entry text uses the noun "examination" exactly once')
  assert(
    ORIENTATION_OBSERVED_ENTRY_TEXT.includes('not an examination'),
    '§8.4d that one occurrence is inside an explicit negation ("not an examination") — never an affirmative claim',
  )
  assert(
    !/\bexamination\b/i.test(ORIENTATION_OBSERVED_NOT_ATTESTABLE_CLAUSE),
    '§8.4e the observed not-attestable clause never uses the noun "examination" at all (only the verb "examined", itself negated by "cannot attest")',
  )
}

// ============================================================================
console.log(`\norientation-reading battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('FAILURES:\n - ' + failures.join('\n - '))
  process.exit(1)
}
