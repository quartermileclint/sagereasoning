/**
 * atrf-s4-fields.test.ts — the ATRF/S4 additive candidate fields on
 * POST /api/practice/watching (GS-ATRF-2 + the S4 traceability extension,
 * built 2026-08-23; migration:
 * website/supabase-idea-loop-candidates-atrf-blast-radius-and-s4-migration.sql).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — injectable deps.
 *
 * A SEPARATE FILE from watching-handler.test.ts deliberately: that battery is 72
 * assertions of already-ruled behaviour and this change must be shown NOT to
 * disturb it. Keeping the new assertions here means the regression signal from
 * the old file stays clean.
 *
 * WHAT IT PROVES:
 *   1. BYTE-IDENTITY — a write that omits every new field produces an insert
 *      object with NO new keys at all (not keys set to null). This is the S4
 *      build-success criterion "a candidate write with the new column absent
 *      behaves byte-identically to today", asserted rather than inspected — and
 *      it is what makes the code safe against a database that has not yet had
 *      the migration applied (memory `build-dark-migrate-later-breaks-writes`).
 *   2. The ruled vocabularies are exactly the ruled vocabularies.
 *   3. Q-A4's null-plus-flag COHERENCE is enforced, both directions.
 *   4. The Q-A4 disclosure string is compared against the mentor's own record,
 *      not against a copy retyped here.
 *   5. The four GS-ATRF-1 dimensions are all required together (they are the
 *      indicator's four constituent readings, not four alternatives).
 *   6. The S4 evidence payload is bounded.
 *   7. C15: target_circle is the loop's own 1..5 rank.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import {
  parseWatchingBody,
  BLAST_RADIUS_VALUES,
  TRACEABILITY_CHECK_VALUES,
  BLAST_RADIUS_DIMENSION_KEYS,
  MAX_EXTRACTION_ELEMENTS_PER_CATEGORY,
  MAX_EXTRACTION_ELEMENT_CHARS,
  MAX_EXTRACTION_EVIDENCE_CHARS,
} from '../handler'
import { BLAST_RADIUS_NO_BASIS_DISCLOSURE } from '@/lib/substrate/idea-loop-types'

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

const NEW_KEYS = [
  'blast_radius',
  'agent_blast_radius',
  'target_circle',
  'blast_radius_basis',
  'traceability_check',
  'extraction_evidence',
] as const

function body(candidateOver: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    cycle: {
      loop_id: 'loop-1',
      cycle_number: 3,
      cycle_outcome: 'winner',
      friction_only_mode: false,
    },
    candidates: [
      {
        heuristic: 'analogous_transfer',
        proposed_action: 'do the thing',
        classification_kind: 'virtue_domain',
        classified_domains: ['phronesis'],
        cycle_outcome: 'winner',
        ...candidateOver,
      },
    ],
  }
}

function goodDimensions(): Record<string, string> {
  return {
    circles_affected: 'circle 3 (local community) — the affected users',
    reversibility: 'reversible within one deploy cycle',
    preferred_indifferents: 'one low-axia preferred indifferent (throughput)',
    impulse_proportionality: 'proportionate; no excess over what reason warrants',
  }
}

function assessedBasis(): Record<string, unknown> {
  return {
    assessed: true,
    dimensions: goodDimensions(),
    proxy_disclosure: 'Assessed at the reasoning level, without task details.',
  }
}

// ============================================================================
// 1. BYTE-IDENTITY — the load-bearing assertion
// ============================================================================
{
  const errors: string[] = []
  const parsed = parseWatchingBody(body(), errors)
  assert(parsed !== null && errors.length === 0, 'BI-1 a pre-ATRF write still parses clean')
  const cand = parsed!.candidates[0] as unknown as Record<string, unknown>
  for (const k of NEW_KEYS) {
    assert(
      !(k in cand),
      `BI-2 omitted field '${k}' contributes NO KEY to the insert object (not a null) — so the body is byte-identical to a pre-ATRF write and works against a pre-migration database`,
    )
  }
  assert(
    Object.keys(cand).length === 14,
    'BI-3 the insert object has exactly the 14 pre-ATRF keys when no new field is supplied (non-vacuity: BI-2 is not passing because the object is empty)',
  )
}

// ============================================================================
// 2. RULED VOCABULARIES
// ============================================================================
assert(
  BLAST_RADIUS_VALUES.length === 3 &&
    ['high', 'medium', 'low'].every((v) => (BLAST_RADIUS_VALUES as readonly string[]).includes(v)),
  'V-1 the blast-radius vocabulary is exactly the three manifest-fixed values — a build inherits this enum, it does not choose one',
)
assert(
  TRACEABILITY_CHECK_VALUES.length === 4 &&
    ['clean', 'diverged', 'not_comparable', 'unlabelled'].every((v) =>
      (TRACEABILITY_CHECK_VALUES as readonly string[]).includes(v),
    ),
  'V-2 the traceability vocabulary is the FOUR-valued B7 set — not_comparable is a first-class value, never inferred clean',
)
{
  const errors: string[] = []
  assert(
    parseWatchingBody(body({ blast_radius: 'catastrophic' }), errors) === null,
    'V-3 an invented blast-radius value is refused at the route BEFORE any DB call',
  )
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(body({ traceability_check: 'probably_fine' }), errors) === null,
    'V-4 an invented traceability value is refused',
  )
}

// ============================================================================
// 3. Q-A4 NULL-PLUS-FLAG COHERENCE — both directions
// ============================================================================
{
  // PR19 finding (2026-08-23, MEDIUM), fixed: an assessed basis WITHOUT
  // target_circle recreates the exact unauditable state Q-B1 elected the column
  // to close. This case must now be REJECTED, not accepted.
  const errors: string[] = []
  const parsed = parseWatchingBody(
    body({ blast_radius: 'medium', blast_radius_basis: assessedBasis() }),
    errors,
  )
  assert(
    parsed === null && errors.some((e) => e.includes('not auditable without the circle')),
    'C-1 value + assessed basis WITHOUT target_circle is now REFUSED (the PR19 auditability fix) — an assessed reading with no recoverable circle is exactly the unauditable state Q-B1 elected the column to prevent',
  )
}
{
  // The positive control: the SAME write, WITH target_circle, is accepted.
  const errors: string[] = []
  const parsed = parseWatchingBody(
    body({ blast_radius: 'medium', target_circle: 3, blast_radius_basis: assessedBasis() }),
    errors,
  )
  assert(
    parsed !== null && errors.length === 0,
    'C-1b value + assessed basis + target_circle IS coherent and accepted (non-vacuity: the C-1 refusal is not blanket)',
  )
}
{
  const errors: string[] = []
  const parsed = parseWatchingBody(
    body({
      heuristic: 'friction_detection',
      classification_kind: 'preferred_indifferent',
      classified_domains: null,
      blast_radius_basis: { assessed: false, disclosure: BLAST_RADIUS_NO_BASIS_DISCLOSURE },
    }),
    errors,
  )
  assert(
    parsed !== null && errors.length === 0,
    'C-2 the friction case — NO value + the no-basis flag + NO target_circle — is still coherent and accepted (the new requirement fires only on assessed:true; a friction candidate has no dikaiosyne-dimension reading to audit in the first place)',
  )
  const cand = parsed!.candidates[0] as unknown as Record<string, unknown>
  assert(!('blast_radius' in cand), 'C-3 the friction case sends NO blast_radius key at all')
  assert('blast_radius_basis' in cand, 'C-4 …but DOES send the flag, so a reader can tell "no basis" from "not computed"')
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({ blast_radius: 'high', blast_radius_basis: { assessed: false, disclosure: BLAST_RADIUS_NO_BASIS_DISCLOSURE } }),
      errors,
    ) === null && errors.some((e) => e.includes('claims the proxy was not run')),
    'C-5 a VALUE beside a no-basis flag is refused — the flag would otherwise be meaningless',
  )
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(body({ blast_radius_basis: assessedBasis() }), errors) === null &&
      errors.some((e) => e.includes('must accompany the value it produced')),
    'C-6 an assessed basis with NO value is refused — a basis reporting the proxy ran must carry what it produced',
  )
}
{
  // The deliberate asymmetry: NEITHER is fine (an older runner computing no proxy).
  const errors: string[] = []
  assert(
    parseWatchingBody(body({ target_circle: 3 }), errors) !== null,
    'C-7 neither field supplied is NOT an error — the coherence rule binds only when a basis is actually sent',
  )
}

// ============================================================================
// 4. THE RULED DISCLOSURE STRING — compared against the mentor's own record
// ============================================================================
{
  const record = readFileSync(
    join(
      process.cwd(),
      '..',
      'operations',
      'agent-circles-2026-08',
      '2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md',
    ),
    'utf-8',
  )
  assert(
    record.includes(BLAST_RADIUS_NO_BASIS_DISCLOSURE),
    'S-1 the frozen disclosure constant is BYTE-PRESENT in the mentor’s own ruling record (reword either and this reds)',
  )
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({ blast_radius_basis: { assessed: false, disclosure: 'loop-level blast radius unavailable' } }),
      errors,
    ) === null && errors.some((e) => e.includes('ruled verbatim string')),
    'S-2 a PARAPHRASED disclosure is refused — the mentor’s words are not open to rewording at the write boundary',
  )
}

// ============================================================================
// 4b. PR19 fix — target_circle is REQUIRED whenever the basis is assessed
// ============================================================================
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({
        target_circle: 4,
        blast_radius: 'high',
        blast_radius_basis: assessedBasis(),
      }),
      errors,
    ) !== null,
    'TC-1 target_circle present alongside an assessed basis is accepted at any valid rank',
  )
}
{
  // Non-vacuity in the other direction: the friction (assessed:false) case does
  // NOT spuriously trigger the new target_circle requirement even though
  // blast_radius is legitimately absent there too.
  const errors: string[] = []
  const parsed = parseWatchingBody(
    body({
      heuristic: 'friction_detection',
      classification_kind: 'preferred_indifferent',
      classified_domains: null,
      blast_radius_basis: { assessed: false, disclosure: BLAST_RADIUS_NO_BASIS_DISCLOSURE },
    }),
    errors,
  )
  assert(
    parsed !== null && !errors.some((e) => e.includes('target_circle')),
    'TC-2 non-vacuity: the assessed:false path never fires the target_circle requirement, confirming TC-1/C-1 are testing the assessed:true branch specifically',
  )
}

// ============================================================================
// 5. THE FOUR DIMENSIONS ARE REQUIRED TOGETHER
// ============================================================================
assert(BLAST_RADIUS_DIMENSION_KEYS.length === 4, 'D-1 exactly four ruled dimensions')
for (const missing of BLAST_RADIUS_DIMENSION_KEYS) {
  const dims = goodDimensions()
  delete (dims as Record<string, unknown>)[missing]
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({
        blast_radius: 'low',
        blast_radius_basis: { assessed: true, dimensions: dims, proxy_disclosure: 'p' },
      }),
      errors,
    ) === null,
    `D-2 dropping '${missing}' is refused — the four are the indicator's four constituent readings, not four alternatives`,
  )
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({ blast_radius: 'low', blast_radius_basis: { assessed: true, dimensions: goodDimensions() } }),
      errors,
    ) === null && errors.some((e) => e.includes('rides EVERY reading')),
    'D-3 the standing proxy disclosure is required on every assessed basis, whichever dimensions drove it',
  )
}

// ============================================================================
// 6. THE S4 EVIDENCE PAYLOAD IS BOUNDED
// ============================================================================
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({
        traceability_check: 'clean',
        extraction_evidence: {
          winner: true,
          guardrail: {
            control_filter_elements: ['whether I deploy'],
            oikeiosis_circles_engaged: ['the affected users'],
            kathekon_factors: ['role obligation'],
            virtue_domains: ['phronesis', 'dikaiosyne'],
            proximity: 'principled',
          },
          reason: {
            control_filter_elements: ['whether I deploy'],
            virtue_domains: ['phronesis'],
            proximity: 'deliberate',
          },
        },
      }),
      errors,
    ) !== null,
    'E-1 a well-formed two-endpoint evidence record is accepted (the cross-endpoint comparison the criterion rests on)',
  )
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({
        extraction_evidence: {
          guardrail: {
            control_filter_elements: Array.from(
              { length: MAX_EXTRACTION_ELEMENTS_PER_CATEGORY + 1 },
              (_, i) => `e${i}`,
            ),
          },
        },
      }),
      errors,
    ) === null,
    'E-2 too many elements in a category is refused',
  )
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({
        extraction_evidence: {
          guardrail: { kathekon_factors: ['x'.repeat(MAX_EXTRACTION_ELEMENT_CHARS + 1)] },
        },
      }),
      errors,
    ) === null,
    'E-3 an oversized single element is refused (bounded verbatim, not unbounded verbatim)',
  )
}
{
  const errors: string[] = []
  const huge = { note: 'y'.repeat(MAX_EXTRACTION_EVIDENCE_CHARS + 100) }
  assert(
    parseWatchingBody(body({ extraction_evidence: huge }), errors) === null,
    'E-4 the TOTAL serialized bound catches payload abuse through unknown keys — which are otherwise permitted so the shape can grow',
  )
}
{
  const errors: string[] = []
  assert(
    parseWatchingBody(
      body({ extraction_evidence: { guardrail: { proximity: 'excellent' } } }),
      errors,
    ) === null,
    'E-5 an invented proximity inside the evidence record is refused',
  )
}
{
  // A filtered candidate legitimately has NO reason-side reading. The schema
  // must accept that rather than force a fabricated one — it is BY CONSTRUCTION
  // (a rejected_by_guardrail candidate never reaches /api/reason) and is exactly
  // why traceability_check reads not_comparable for that class.
  const errors: string[] = []
  assert(
    parseWatchingBody(
      {
        cycle: { loop_id: 'l', cycle_number: 1, cycle_outcome: 'null_cycle', friction_only_mode: false },
        candidates: [
          {
            heuristic: 'anomaly_detection',
            proposed_action: 'x',
            classification_kind: 'virtue_domain',
            cycle_outcome: 'rejected_by_guardrail',
            traceability_check: 'not_comparable',
            extraction_evidence: { winner: false, guardrail: { kathekon_factors: ['k'] } },
          },
        ],
      },
      errors,
    ) !== null,
    'E-6 a FILTERED candidate may carry guardrail-only evidence with not_comparable — the guardrail-internal stream (Q4-e) is not foreclosed at the schema level',
  )
}

// ============================================================================
// 7. C15 — target_circle is the loop's own 1..5 rank
// ============================================================================
for (const r of [1, 2, 3, 4, 5]) {
  const errors: string[] = []
  assert(parseWatchingBody(body({ target_circle: r }), errors) !== null, `C15-1 rank ${r} accepted`)
}
for (const bad of [0, 6, 2.5, -1, '3']) {
  const errors: string[] = []
  assert(
    parseWatchingBody(body({ target_circle: bad }), errors) === null,
    `C15-2 ${JSON.stringify(bad)} refused — the enumeration is the loop's own closed OikeiosisCircleRank, not a free integer`,
  )
}

// ============================================================================
// 8. THE TWO DIMENSION SHAPES MUST NOT DIVERGE (PR19 finding, 2026-08-23, LOW)
//
// The four ruled GS-ATRF-1 dimensions are defined TWICE, deliberately: as the
// runner-side in-memory proposal shape (BlastRadiusDimensions in
// idea-loop-types.ts, camelCase, the house TS convention) and as the wire/DB
// shape the handler validates (BLAST_RADIUS_DIMENSION_KEYS, snake_case, the
// house wire convention). That split is intentional and matches the rest of
// this codebase.
//
// But optionalBlastRadiusBasis returns an untyped Record, so `tsc` CANNOT catch
// a future divergence — someone adding a fifth dimension to one and not the
// other would compile clean and silently accept a basis missing a ruled
// dimension. This pin is the substitute for the type-check that cannot exist.
// ============================================================================
{
  const typesSrc = readFileSync(
    join(process.cwd(), 'src', 'lib', 'substrate', 'idea-loop-types.ts'),
    'utf-8',
  )
  const ifaceMatch = typesSrc.match(/export interface BlastRadiusDimensions \{([\s\S]*?)\n\}/)
  assert(ifaceMatch !== null, 'X-1 BlastRadiusDimensions is still declared in idea-loop-types.ts (an unparseable source is a failed pin, never a skip)')

  const camelFields = [...(ifaceMatch?.[1] ?? '').matchAll(/^\s{2}(\w+):/gm)].map((m) => m[1])
  const toSnake = (c: string) => c.replace(/[A-Z]/g, (ch) => '_' + ch.toLowerCase())
  const derived = camelFields.map(toSnake).sort()
  const wire = [...BLAST_RADIUS_DIMENSION_KEYS].sort()

  assert(
    camelFields.length === 4,
    `X-2 the type declares exactly four dimensions (found ${camelFields.length}) — non-vacuity for X-3`,
  )
  assert(
    JSON.stringify(derived) === JSON.stringify(wire),
    `X-3 the TS dimension shape and the wire vocabulary are the SAME four dimensions: type→${JSON.stringify(derived)} vs wire→${JSON.stringify(wire)}. Add a dimension to one and this reds — which is the point, since tsc cannot see across the untyped boundary.`,
  )
}

console.log(`atrf-s4-fields battery: ${passed} passed, ${failed} failed`)
if (failures.length) {
  console.error('\nFailures:')
  for (const f of failures) console.error(`  - ${f}`)
}
process.exit(failed === 0 ? 0 : 1)
