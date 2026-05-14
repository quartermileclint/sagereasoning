/**
 * philosophical-mode-service.test.ts — philosophical-mode v1 functional tests
 * + invariant checks.
 *
 * Run via: `npx tsx website/src/lib/substrate/__tests__/philosophical-mode-service.test.ts`
 * (mirrors the A5 / A7 verification pattern; no Jest framework dependency).
 *
 * COVERAGE — per the philosophical-mode spec's open-question 8 test strategy +
 * the build prompt's Step 4:
 *
 *   DISPATCH (PR1 / PR2 — the mode-dispatch pattern is invoked here)
 *     DSP-1  renderLayer3Mode({ mode: 'philosophical' }) returns a result
 *     DSP-2  the result carries mode / json / markdown
 *     DSP-3  renderLayer3Mode throws on an unimplemented mode
 *
 *   MANDATORY WRAPS (R3 / R19c / R19d / R20a / R18a / R18e)
 *     WRAP-1  R3 disclaimer present in JSON opening_wrap + canonical
 *     WRAP-2  R19c limitations present in JSON closing_wraps + canonical
 *     WRAP-3  R18e transparency notice present in JSON closing_wraps + canonical
 *     WRAP-4  R19d mirror principle null when not mentor-flavoured
 *     WRAP-5  R19d mirror principle present + canonical when mentor-flavoured
 *     WRAP-6  R18a category framing null when not requested
 *     WRAP-7  R18a category framing present + canonical when requested
 *     WRAP-8  all six wraps appear in the Markdown in their spec positions
 *
 *   R17e EXCLUSION (load-bearing)
 *     R17E-1  applyR17eExclusionFilter removes iterative_refinement
 *     R17E-2  excluded field NAMES never appear in JSON or Markdown
 *     R17E-3  excluded field VALUES (canaries) never appear in JSON or Markdown
 *     R17E-4  meta.excluded_field_paths records the exclusion
 *
 *   SECTION ORDERING
 *     ORD-1  Markdown section order: wrap → title → verdict → score note →
 *            assessment → source material → closing wraps
 *     ORD-2  field-by-field sub-section order a → b → c → d → e → f → g
 *
 *   PER-SECTION GLOSSING (R8a)
 *     GLOSS-1  a Greek term is glossed on first occurrence within its section
 *     GLOSS-2  the same term is NOT re-glossed later in the same section
 *     GLOSS-3  glossing resets per section (term re-glossed in a new section)
 *
 *   EMPTY-FIELD OMISSION
 *     OMIT-1  minimal assessment omits improvement path / stage scores /
 *             ambiguity notes / clarifications from the Markdown
 *     OMIT-2  full assessment includes those sections
 *     OMIT-3  empty soft_clarifications omitted even when open_deferrals present
 *     OMIT-4  the JSON preserves all fields (no omission in the JSON)
 *
 *   SCORE DEFERRAL
 *     SCORE-1  json.score.deferred === true
 *     SCORE-2  json.verdict.justification_source === null
 *     SCORE-3  Markdown carries the score-deferral transparency note
 *
 *   SOURCE MATERIAL
 *     SRC-1  Markdown source-material section renders the retrieved passages
 *     SRC-2  the JSON does NOT carry retrieved passages (json-excluded)
 *     SRC-3  retrieve-passages failure degrades gracefully (render does not throw)
 *     SRC-4  buildSourceMaterialRetrieveInput sets top_k=3 + passage_type_filter
 *
 *   R20a DISTRESS PASSTHROUGH (PR6 watch-point — rendered, not modified)
 *     R20A-1  distress signal → json.distress_passthrough is the canonical text
 *     R20A-2  distress signal → json.fields is null (section 6 replaced)
 *     R20A-3  distress signal → Markdown omits the assessment + source-material
 *             sections
 *
 *   INVARIANTS
 *     INV-1  two identical renders produce byte-identical JSON
 *     INV-2  two identical renders produce byte-identical Markdown
 *     INV-3  input_observed override is used when supplied; deterministic
 *            composition is used when not
 *
 * Exit code 0 = all pass. Non-zero = failures printed.
 */

import {
  renderLayer3Mode,
  applyR17eExclusionFilter,
  buildSourceMaterialRetrieveInput,
  R17E_EXCLUDED_FIELD_PATHS,
  type Layer3RenderMode,
  type RetrievePassagesFn,
} from '../philosophical-mode-service'

import {
  R3_DISCLAIMER,
  R19C_LIMITATIONS_LINK,
  R19D_MIRROR_PRINCIPLE,
  R20A_DISTRESS_PASSTHROUGH,
  R18A_CHARACTER_KERNEL_CATEGORY,
  R18E_ARTICLE_50_TRANSPARENCY_NOTICE,
  type ConsumerContext,
} from '../layer3-service'

import type { Layer2Assessment } from '../../translation-sandwich/layer2-mechanisms'
import type { RetrievedPassage } from '../../rag/retrieve-passages'

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
    ok
      ? undefined
      : `expected=${JSON.stringify(expected)}, actual=${JSON.stringify(actual)}`
  )
}

/** Count non-overlapping occurrences of `needle` in `haystack`. */
function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0
  let count = 0
  let idx = 0
  for (;;) {
    const found = haystack.indexOf(needle, idx)
    if (found === -1) break
    count++
    idx = found + needle.length
  }
  return count
}

/** Slice the Markdown between a start marker (inclusive) and the next `### `
 *  sub-heading or `## ` heading (exclusive). */
function sliceSection(markdown: string, startMarker: string): string {
  const start = markdown.indexOf(startMarker)
  if (start === -1) return ''
  const after = markdown.slice(start + startMarker.length)
  const nextSub = after.search(/\n#{2,3} /)
  return nextSub === -1 ? after : after.slice(0, nextSub)
}

// ============================================================================
// Fixtures
// ============================================================================

/** FULL assessment — team-channel-checking scenario, every section populated.
 *  Two phobos passions (for the per-section glossing test), circles,
 *  indifferents, an improvement path, non-not_applied stage scores, ambiguity
 *  notes, one open deferral, empty soft_clarifications. */
const FULL_ASSESSMENT: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [
      {
        id: 'p1',
        name: 'Anguished anxiety over peer response',
        root_passion: 'phobos',
        sub_species: 'agonia',
        false_judgement:
          'The absence of a peer response is evidence of material failure.',
        correct_judgement:
          "Another's response is a preferred indifferent of low worth.",
        causal_stage_affected: 'synkatathesis',
        evidence: 'I keep checking the team channel after I post anything important.',
      },
      {
        id: 'p2',
        name: 'Hesitation before the next post',
        root_passion: 'phobos',
        sub_species: 'oknos',
        false_judgement: 'Posting again will bring the same evil.',
        correct_judgement: 'Right action proceeds from judgement, not from fear.',
        causal_stage_affected: 'horme',
        evidence: 'I tell myself it doesn’t matter while still checking again.',
      },
    ],
    false_judgements: ['The absence of a peer response is evidence of failure.'],
    correct_judgements: ["Another's response is a preferred indifferent."],
    causal_stage_affected: 'synkatathesis',
  },
  control_filter: {
    within_prohairesis: [
      {
        item: 'the quality of my own work',
        agent_named_position: 'within',
        classification: 'within',
        reasoning: 'agent_identified_within',
      },
    ],
    outside_prohairesis: [
      {
        item: 'peer response timing',
        agent_named_position: 'outside',
        classification: 'outside',
        reasoning: 'agent_identified_outside',
      },
    ],
    disambiguation_required: [],
  },
  oikeiosis: {
    relevant_circles: [
      {
        stage: 3,
        circle: 'local_community',
        description: 'colleagues on the team channel',
        honourability_grade: 2,
        advantageousness_grade: 2,
        cicero_verdict: 'balanced_neither_decisive',
        obligation_met: null,
        tension: 'work obligation versus relational impulse',
      },
    ],
    deliberation_notes: 'The work obligation is being fulfilled.',
  },
  value_assessment: {
    indifferents_at_stake: [
      {
        name: 'reputation',
        axia: 'low',
        treated_as: 'evil',
        evidence: 'I feel the dip when no one has responded.',
        error: 'a low-worth dispreferred indifferent mis-categorised as a genuine evil',
      },
    ],
    value_error: 'Peer recognition is treated as more than it is.',
  },
  kathekon_assessment: {
    is_kathekon: false,
    quality: 'marginal',
    justification:
      'The pattern of post-submission checking is not consistent with appropriate action.',
  },
  iterative_refinement: {
    senecan_grade: 'grade_1',
    progress_dimensions: {
      passion_reduction: 'LEAKCANARY-passion-reduction',
      judgement_quality: 'LEAKCANARY-judgement-quality',
      disposition_stability: 'LEAKCANARY-disposition-stability',
      oikeiosis_extension: 'LEAKCANARY-oikeiosis-extension',
    },
    direction_of_travel: 'stable',
    motivation_classification: 'unclear_pending_clarification',
  },
  katorthoma_proximity: 'deliberate',
  ruling_faculty_state: 'Examining the pattern but not yet substituting the judgement.',
  virtue_domains_engaged: ['phronesis'],
  improvement_path_structured: {
    false_judgement_to_correct:
      'The absence of peer response is evidence of material failure.',
    mechanism_applies: 'passion_diagnosis',
    corrected_judgement:
      "Another's response is a preferred indifferent of low worth.",
  },
  stage_scores: {
    control_filter: 'adequate',
    passion_diagnosis: 'weak',
    oikeiosis: 'adequate',
    value_assessment: 'adequate',
    kathekon_assessment: 'weak',
    iterative_refinement: 'not_applied',
  },
  hasty_assent_risk: 'high',
  intake_clarifications: {
    soft_clarifications: [],
    open_deferrals: [
      {
        trigger_code: 'PRAXIS_MOTIVATION_AMBIGUITY',
        intake_tier: 3,
        stem_id: 'stem-praxis-motivation',
        slot_fills: { SURFACE_PATTERN: 'the repeated checking' },
        withheld_classification: {
          field_path: 'iterative_refinement.motivation_classification',
          withheld_at_position: 'position-6',
          reason: 'The submitter’s own account of what was operative is absent.',
        },
        status: 'open',
      },
    ],
  },
  layer1_ambiguity_notes: ['The temporal scope of "weeks" was not made precise.'],
  layer2_ambiguity_notes: ['Whether the recognition is corrective or intellectual is unclear.'],
}

/** MINIMAL assessment — every omittable section empty/null. No passions, no
 *  circles, no indifferents, improvement_path null, all stage_scores
 *  not_applied, empty ambiguity notes, empty clarifications. */
const MINIMAL_ASSESSMENT: Layer2Assessment = {
  version: 'layer2-assessment-v1',
  layer1_schema_version: 'layer1-schema-v1',
  passion_diagnosis: {
    passions_detected: [],
    false_judgements: [],
    correct_judgements: [],
    causal_stage_affected: null,
  },
  control_filter: {
    within_prohairesis: [],
    outside_prohairesis: [],
    disambiguation_required: [],
  },
  oikeiosis: { relevant_circles: [], deliberation_notes: '' },
  value_assessment: { indifferents_at_stake: [], value_error: null },
  kathekon_assessment: {
    is_kathekon: null,
    quality: 'marginal',
    justification: 'Appropriateness cannot be determined from the available evidence.',
  },
  iterative_refinement: {
    senecan_grade: 'pre_progress',
    progress_dimensions: {
      passion_reduction: 'LEAKCANARY-min-pr',
      judgement_quality: 'LEAKCANARY-min-jq',
      disposition_stability: 'LEAKCANARY-min-ds',
      oikeiosis_extension: 'LEAKCANARY-min-oe',
    },
    direction_of_travel: 'single_snapshot',
    motivation_classification: null,
  },
  katorthoma_proximity: 'reflexive',
  ruling_faculty_state: 'Insufficient evidence to characterise.',
  virtue_domains_engaged: [],
  improvement_path_structured: null,
  stage_scores: {
    control_filter: 'not_applied',
    passion_diagnosis: 'not_applied',
    oikeiosis: 'not_applied',
    value_assessment: 'not_applied',
    kathekon_assessment: 'not_applied',
    iterative_refinement: 'not_applied',
  },
  hasty_assent_risk: 'none',
  intake_clarifications: { soft_clarifications: [], open_deferrals: [] },
  layer1_ambiguity_notes: [],
  layer2_ambiguity_notes: [],
}

/** DISTRESS assessment — A7's sub-threshold distress_signal flag set. */
const DISTRESS_ASSESSMENT: Layer2Assessment = {
  ...FULL_ASSESSMENT,
  distress_signal: true,
}

const CONSUMER_PLAIN: ConsumerContext = { consumer: 'api_reason' }
const CONSUMER_MENTOR: ConsumerContext = {
  consumer: 'api_reason',
  is_mentor_flavoured: true,
}
const CONSUMER_CATEGORY: ConsumerContext = {
  consumer: 'api_reason',
  include_category_framing: true,
}

/** Stub retrieve-passages — three canned passages; runs without DB / OpenAI. */
const STUB_PASSAGES: RetrievedPassage[] = [
  {
    passage_id: 'pg-1',
    source_file: 'enchiridion.md',
    source_citation: 'Epictetus, Enchiridion §5',
    passage_type: 'canonical_line',
    canonical_mechanism: ['passion_diagnosis'],
    passion: 'phobos',
    sub_passion: 'agonia',
    audience_tier: 'general',
    text: "What disturbs men's minds is not events but their judgements on events.",
    paragraph_text: null,
    rrf_score: 0.9,
    bm25_rank: 1,
    vector_rank: 1,
  },
  {
    passage_id: 'pg-2',
    source_file: 'meditations.md',
    source_citation: 'Marcus Aurelius, Meditations 8.47',
    passage_type: 'mechanism',
    canonical_mechanism: ['passion_diagnosis'],
    passion: 'phobos',
    sub_passion: null,
    audience_tier: 'general',
    text: 'If you are pained by any external thing, it is your own judgement about it that disturbs you.',
    paragraph_text: null,
    rrf_score: 0.8,
    bm25_rank: 2,
    vector_rank: 3,
  },
  {
    passage_id: 'pg-3',
    source_file: 'enchiridion.md',
    source_citation: 'Epictetus, Enchiridion §33',
    passage_type: 'example',
    canonical_mechanism: ['value_assessment'],
    passion: null,
    sub_passion: null,
    audience_tier: 'general',
    text: 'If anyone tells you that a certain person speaks ill of you, do not make excuses.',
    paragraph_text: null,
    rrf_score: 0.7,
    bm25_rank: 3,
    vector_rank: 2,
  },
]

const stubRetrieve: RetrievePassagesFn = async () => ({
  passages: STUB_PASSAGES,
  retrieval_diagnostics: {
    bm25_count: 3,
    vector_count: 3,
    fusion_count: 3,
    cache_hit: false,
    elapsed_ms: 12,
  },
})

const throwingRetrieve: RetrievePassagesFn = async () => {
  throw new Error('simulated retrieval failure')
}

const SECTION6_HEADING = '## Assessment'
const SRC_HEADING = '## Source material'

// ============================================================================
// Main — async because renderLayer3Mode awaits the retrieve-passages call
// ============================================================================

async function main(): Promise<void> {
  // --- Renders used across the assertions -------------------------------
  const fullPlain = await renderLayer3Mode({
    mode: 'philosophical',
    assessment: FULL_ASSESSMENT,
    consumer_context: CONSUMER_PLAIN,
    retrievePassagesFn: stubRetrieve,
  })
  const fullMentor = await renderLayer3Mode({
    mode: 'philosophical',
    assessment: FULL_ASSESSMENT,
    consumer_context: CONSUMER_MENTOR,
    retrievePassagesFn: stubRetrieve,
  })
  const fullCategory = await renderLayer3Mode({
    mode: 'philosophical',
    assessment: FULL_ASSESSMENT,
    consumer_context: CONSUMER_CATEGORY,
    retrievePassagesFn: stubRetrieve,
  })
  const minimal = await renderLayer3Mode({
    mode: 'philosophical',
    assessment: MINIMAL_ASSESSMENT,
    consumer_context: CONSUMER_PLAIN,
    retrievePassagesFn: stubRetrieve,
  })
  const distress = await renderLayer3Mode({
    mode: 'philosophical',
    assessment: DISTRESS_ASSESSMENT,
    consumer_context: CONSUMER_PLAIN,
    retrievePassagesFn: stubRetrieve,
  })

  // --- DISPATCH ---------------------------------------------------------
  assert('DSP-1  renderLayer3Mode returns a result', fullPlain != null)
  assert(
    'DSP-2  result carries mode / json / markdown',
    fullPlain.mode === 'philosophical' &&
      typeof fullPlain.markdown === 'string' &&
      fullPlain.json != null &&
      fullPlain.json.version === 'philosophical-mode-response-v1'
  )
  {
    let threw = false
    try {
      await renderLayer3Mode({
        mode: 'standard' as Layer3RenderMode,
        assessment: FULL_ASSESSMENT,
        consumer_context: CONSUMER_PLAIN,
        retrievePassagesFn: stubRetrieve,
      })
    } catch {
      threw = true
    }
    assert('DSP-3  renderLayer3Mode throws on an unimplemented mode', threw)
  }

  // --- MANDATORY WRAPS --------------------------------------------------
  assertEqual(
    'WRAP-1  R3 disclaimer present + canonical in JSON',
    fullPlain.json.opening_wrap.r3_disclaimer,
    R3_DISCLAIMER
  )
  assertEqual(
    'WRAP-2  R19c limitations present + canonical in JSON',
    fullPlain.json.closing_wraps.r19c_limitations,
    R19C_LIMITATIONS_LINK
  )
  assertEqual(
    'WRAP-3  R18e transparency notice present + canonical in JSON',
    fullPlain.json.closing_wraps.r18e_transparency_notice,
    R18E_ARTICLE_50_TRANSPARENCY_NOTICE
  )
  assertEqual(
    'WRAP-4  R19d mirror principle null when not mentor-flavoured',
    fullPlain.json.closing_wraps.r19d_mirror_principle,
    null
  )
  assertEqual(
    'WRAP-5  R19d mirror principle present + canonical when mentor-flavoured',
    fullMentor.json.closing_wraps.r19d_mirror_principle,
    R19D_MIRROR_PRINCIPLE
  )
  assertEqual(
    'WRAP-6  R18a category framing null when not requested',
    fullPlain.json.title_block.r18a_category_framing,
    null
  )
  assertEqual(
    'WRAP-7  R18a category framing present + canonical when requested',
    fullCategory.json.title_block.r18a_category_framing,
    R18A_CHARACTER_KERNEL_CATEGORY
  )
  {
    // R18a appears in the title block (before Verdict); R3 at the very top;
    // R19c / R19d / R18e at the closing (after Source material).
    const md = fullMentor.markdown
    const mdCat = fullCategory.markdown
    const r3Pos = md.indexOf(R3_DISCLAIMER)
    const verdictPos = md.indexOf('## Verdict')
    const srcPos = md.indexOf(SRC_HEADING)
    const r19cPos = md.indexOf(R19C_LIMITATIONS_LINK)
    const r19dPos = md.indexOf(R19D_MIRROR_PRINCIPLE)
    const r18ePos = md.indexOf(R18E_ARTICLE_50_TRANSPARENCY_NOTICE)
    const r18aPos = mdCat.indexOf(R18A_CHARACTER_KERNEL_CATEGORY)
    const catVerdictPos = mdCat.indexOf('## Verdict')
    assert(
      'WRAP-8  six wraps in spec positions in the Markdown',
      r3Pos >= 0 &&
        r3Pos < verdictPos &&
        r18aPos >= 0 &&
        r18aPos < catVerdictPos &&
        r19cPos > srcPos &&
        r19dPos > srcPos &&
        r18ePos > srcPos &&
        r19cPos < r18ePos,
      `r3=${r3Pos} verdict=${verdictPos} r18a=${r18aPos} src=${srcPos} r19c=${r19cPos} r19d=${r19dPos} r18e=${r18ePos}`
    )
  }

  // --- R17e EXCLUSION ---------------------------------------------------
  {
    const filtered = applyR17eExclusionFilter(FULL_ASSESSMENT)
    assert(
      'R17E-1  applyR17eExclusionFilter removes iterative_refinement',
      !('iterative_refinement' in filtered)
    )
  }
  {
    // R17e protection: the top-level iterative_refinement object + its four
    // sub-fields + score_confidence must not render as ASSESSMENT FIELDS.
    //
    // Two appearances of the substring "iterative_refinement" are spec-
    // sanctioned and are NOT R17e leaks — they are deliberately excluded from
    // this check:
    //   (a) stage_scores.iterative_refinement — a per-response stage-quality
    //       grade (a StageScore enum), NOT trajectory data; the spec's section
    //       6i renders stage scores and does not exclude this key.
    //   (b) an open deferral's withheld_classification.field_path — the spec's
    //       "Reflection component" section REQUIRES rendering field_path
    //       verbatim; for PRAXIS_MOTIVATION_AMBIGUITY it legitimately reads
    //       "iterative_refinement.motivation_classification". It names a
    //       *withheld* classification — it surfaces the absence of data, not
    //       data.
    // The load-bearing assertion: no excluded field is a top-level key of
    // json.fields (R17E-2), and no excluded field VALUE renders anywhere
    // (R17E-3).
    const f = fullPlain.json.fields
    const excludedKeys = [
      'iterative_refinement',
      'direction_of_travel',
      'senecan_grade',
      'progress_dimensions',
      'motivation_classification',
      'score_confidence',
    ]
    const fieldKeyLeaks = f
      ? excludedKeys.filter((k) => k in (f as object))
      : []
    assert(
      'R17E-2  no excluded field appears as a top-level key of json.fields',
      fieldKeyLeaks.length === 0,
      `leaked keys: ${fieldKeyLeaks.join(', ')}`
    )
    // R17E-3 — the substantive protection: excluded field VALUES never render.
    // Canaries: the four progress_dimensions strings, the distinctive
    // senecan_grade value (grade_1), and the motivation_classification value.
    const jsonStr = JSON.stringify(fullPlain.json)
    const md = fullPlain.markdown
    const valueCanaries = ['LEAKCANARY', 'grade_1', 'unclear_pending_clarification']
    const valueLeaks = valueCanaries.filter(
      (c) => jsonStr.includes(c) || md.includes(c)
    )
    assert(
      'R17E-3  excluded field values never appear in JSON or Markdown',
      valueLeaks.length === 0,
      `leaked values: ${valueLeaks.join(', ')}`
    )
    assert(
      'R17E-4  R17E_EXCLUDED_FIELD_PATHS records the exclusion; meta flags the filter ran',
      R17E_EXCLUDED_FIELD_PATHS.includes(
        'iterative_refinement.direction_of_travel'
      ) &&
        R17E_EXCLUDED_FIELD_PATHS.includes('score_confidence') &&
        fullPlain.json.meta.r17e_exclusion_applied === true
    )
  }

  // --- SECTION ORDERING -------------------------------------------------
  {
    const md = fullPlain.markdown
    const positions = [
      md.indexOf(R3_DISCLAIMER),
      md.indexOf('# Stoic Reasoning Assessment'),
      md.indexOf('## Verdict'),
      md.indexOf('Score breakdown and scalar score: deferred'),
      md.indexOf(SECTION6_HEADING),
      md.indexOf(SRC_HEADING),
      md.indexOf(R19C_LIMITATIONS_LINK),
    ]
    let ordered = true
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] <= positions[i - 1] || positions[i] < 0) ordered = false
    }
    assert('ORD-1  Markdown section order follows the spec', ordered, positions.join(','))
  }
  {
    const md = fullPlain.markdown
    const subPositions = [
      md.indexOf('### a. Passion diagnosis'),
      md.indexOf('### b. Control filter'),
      md.indexOf('### c. '),
      md.indexOf('### d. Value assessment'),
      md.indexOf('### e. '),
      md.indexOf('### f. '),
      md.indexOf('### g. Virtue domains engaged'),
    ]
    let ordered = true
    for (let i = 1; i < subPositions.length; i++) {
      if (subPositions[i] <= subPositions[i - 1] || subPositions[i] < 0) {
        ordered = false
      }
    }
    assert(
      'ORD-2  field-by-field sub-section order a → g',
      ordered,
      subPositions.join(',')
    )
  }

  // --- PER-SECTION GLOSSING --------------------------------------------
  {
    const passionSection = sliceSection(
      fullPlain.markdown,
      '### a. Passion diagnosis'
    )
    // FULL_ASSESSMENT has two phobos passions. phobos is glossed once.
    assert(
      'GLOSS-1  Greek term glossed on first occurrence in its section',
      passionSection.includes('*phobos* (fear)')
    )
    assert(
      'GLOSS-2  same term not re-glossed later in the same section',
      countOccurrences(passionSection, '(fear)') === 1 &&
        countOccurrences(passionSection, '*phobos*') === 2
    )
    // prohairesis is glossed inside the control-filter section — a *different*
    // section — proving the per-section reset.
    const controlSection = sliceSection(
      fullPlain.markdown,
      '### b. Control filter'
    )
    assert(
      'GLOSS-3  glossing resets per section (prohairesis glossed in its own section)',
      controlSection.includes('*prohairesis* (moral choice / ruling faculty)') &&
        countOccurrences(controlSection, '(moral choice / ruling faculty)') === 1
    )
  }

  // --- EMPTY-FIELD OMISSION --------------------------------------------
  {
    const md = minimal.markdown
    assert(
      'OMIT-1  minimal assessment omits improvement path / stage scores / ambiguity notes / clarifications',
      !md.includes('Improvement path') &&
        !md.includes('Stage scores') &&
        !md.includes('Ambiguity notes') &&
        !md.includes('Soft clarifications') &&
        !md.includes('Open deferrals')
    )
    const mdFull = fullPlain.markdown
    assert(
      'OMIT-2  full assessment includes those sections',
      mdFull.includes('Improvement path') &&
        mdFull.includes('Stage scores') &&
        mdFull.includes('Ambiguity notes') &&
        mdFull.includes('Open deferrals')
    )
    assert(
      'OMIT-3  empty soft_clarifications omitted even when open_deferrals present',
      !mdFull.includes('Soft clarifications') && mdFull.includes('Open deferrals')
    )
    // The JSON preserves all fields even on the minimal assessment.
    assert(
      'OMIT-4  the JSON preserves all fields (no omission in the JSON)',
      minimal.json.fields !== null &&
        minimal.json.fields.improvement_path_structured === null &&
        Object.keys(minimal.json.fields.stage_scores).length === 6
    )
  }

  // --- SCORE DEFERRAL ---------------------------------------------------
  assertEqual('SCORE-1  json.score.deferred === true', fullPlain.json.score.deferred, true)
  assertEqual(
    'SCORE-2  json.verdict.justification_source === null',
    fullPlain.json.verdict.justification_source,
    null
  )
  assert(
    'SCORE-3  Markdown carries the score-deferral transparency note',
    fullPlain.markdown.includes(
      'Score breakdown and scalar score: deferred to a future build'
    ) && fullPlain.json.meta.score_sections_deferred === true
  )

  // --- SOURCE MATERIAL --------------------------------------------------
  {
    const md = fullPlain.markdown
    assert(
      'SRC-1  Markdown source-material section renders the retrieved passages',
      md.includes(SRC_HEADING) &&
        md.includes(STUB_PASSAGES[0].text) &&
        md.includes(STUB_PASSAGES[0].source_citation) &&
        md.includes('**On '),
    )
    const jsonStr = JSON.stringify(fullPlain.json)
    assert(
      'SRC-2  the JSON does NOT carry retrieved passages (json-excluded)',
      !jsonStr.includes(STUB_PASSAGES[0].text) &&
        !jsonStr.includes(STUB_PASSAGES[0].source_citation)
    )
  }
  {
    let threw = false
    let degraded
    try {
      degraded = await renderLayer3Mode({
        mode: 'philosophical',
        assessment: FULL_ASSESSMENT,
        consumer_context: CONSUMER_PLAIN,
        retrievePassagesFn: throwingRetrieve,
      })
    } catch {
      threw = true
    }
    assert(
      'SRC-3  retrieve-passages failure degrades gracefully (render does not throw)',
      !threw &&
        degraded != null &&
        degraded.markdown.includes(SRC_HEADING) &&
        degraded.markdown.includes('returned no passages')
    )
  }
  {
    const ri = buildSourceMaterialRetrieveInput(
      applyR17eExclusionFilter(FULL_ASSESSMENT)
    )
    assert(
      'SRC-4  buildSourceMaterialRetrieveInput sets top_k=3 + passage_type_filter + passion_filter',
      ri.top_k === 3 &&
        Array.isArray(ri.passage_type_filter) &&
        ri.passage_type_filter.length === 3 &&
        ri.passage_type_filter.includes('mechanism') &&
        ri.passage_type_filter.includes('canonical_line') &&
        ri.passage_type_filter.includes('example') &&
        ri.passion_filter === 'phobos' &&
        ri.sub_passion_filter === 'agonia'
    )
  }

  // --- R20a DISTRESS PASSTHROUGH ---------------------------------------
  assertEqual(
    'R20A-1  distress signal → json.distress_passthrough is the canonical text',
    distress.json.distress_passthrough,
    R20A_DISTRESS_PASSTHROUGH
  )
  assertEqual(
    'R20A-2  distress signal → json.fields is null (section 6 replaced)',
    distress.json.fields,
    null
  )
  assert(
    'R20A-3  distress signal → Markdown omits the assessment + source-material sections',
    !distress.markdown.includes(SECTION6_HEADING) &&
      !distress.markdown.includes(SRC_HEADING) &&
      distress.markdown.includes(R20A_DISTRESS_PASSTHROUGH) &&
      distress.json.meta.distress_passthrough_active === true
  )

  // --- INVARIANTS -------------------------------------------------------
  {
    const a = await renderLayer3Mode({
      mode: 'philosophical',
      assessment: FULL_ASSESSMENT,
      consumer_context: CONSUMER_PLAIN,
      retrievePassagesFn: stubRetrieve,
    })
    const b = await renderLayer3Mode({
      mode: 'philosophical',
      assessment: FULL_ASSESSMENT,
      consumer_context: CONSUMER_PLAIN,
      retrievePassagesFn: stubRetrieve,
    })
    assertEqual(
      'INV-1  two identical renders produce byte-identical JSON',
      JSON.stringify(a.json),
      JSON.stringify(b.json)
    )
    assertEqual(
      'INV-2  two identical renders produce byte-identical Markdown',
      a.markdown,
      b.markdown
    )
  }
  {
    const withOverride = await renderLayer3Mode({
      mode: 'philosophical',
      assessment: FULL_ASSESSMENT,
      consumer_context: CONSUMER_PLAIN,
      input_observed: 'CALLER-SUPPLIED CHARACTERISATION',
      retrievePassagesFn: stubRetrieve,
    })
    assert(
      'INV-3  input_observed override used when supplied; deterministic composition when not',
      withOverride.json.title_block.input_observed ===
        'CALLER-SUPPLIED CHARACTERISATION' &&
        fullPlain.json.title_block.input_observed.includes('phobos') &&
        fullPlain.json.title_block.input_observed !==
          'CALLER-SUPPLIED CHARACTERISATION'
    )
  }

  // --- Summary ----------------------------------------------------------
  console.log('')
  console.log(`Total: ${passCount + failCount}  Pass: ${passCount}  Fail: ${failCount}`)
  if (failCount > 0) {
    console.log('')
    console.log('FAILURES:')
    for (const f of failures) console.log(`  - ${f}`)
  }
}

main()
  .then(() => {
    process.exit(failCount === 0 ? 0 : 1)
  })
  .catch((err) => {
    console.error('Test harness error:', err)
    process.exit(1)
  })
