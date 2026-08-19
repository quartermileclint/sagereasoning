/**
 * idea-loop-types.test.ts — the C2(iii) structural-novelty battery + the
 * approved-type invariants (agent-circles, 2026-08-08).
 *
 * Plain-assertion script: npx tsx <this file>. Hermetic — pure module, no env.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { readdirSync, statSync } from 'fs'
import {
  createOikeiosisGap,
  assessStructuralNovelty,
  isGenuineNoveltyConfirmation,
  noteCuriosityTrigger,
  TAXONOMY_QUESTION_OUTCOME,
  type GeneratedCandidate,
  type NoveltyHistoryRow,
  type PuzzleTaxonomyEntry,
  type PuzzleType,
} from '../idea-loop-types'
import { EVIDENCE_FLOOR } from '../trajectory-delta'

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

function row(stage: string | null, domains: string[]): NoveltyHistoryRow {
  return { oikeiosis_stage: stage, virtue_domains_engaged: domains }
}

// ============================================================================
// §1 createOikeiosisGap — the current+1 construction-time invariant
// ============================================================================
{
  const gap = createOikeiosisGap(3, 'serve the wider project community')
  assert(gap.targetCircle === 4, '§1.1 target is ALWAYS current+1')
  assert(gap.schema === 'idea-loop-oikeiosis-gap-v1', '§1.2 schema tag')
  let threw = false
  try {
    createOikeiosisGap(5, 'x')
  } catch {
    threw = true
  }
  assert(threw, '§1.3 circle 5 has no next circle (the telos is never a target)')
}

// ============================================================================
// §2 assessStructuralNovelty — floor reuse + matching + honesty
// ============================================================================
{
  assert(EVIDENCE_FLOOR === 3, '§2.1 the REUSED floor is trajectory-delta\'s own 3 (never re-derived)')

  const window: NoveltyHistoryRow[] = [
    row('local_community', ['phronesis', 'dikaiosyne']),
    row('local_community', ['dikaiosyne', 'phronesis']), // set-equal, order differs
    row('local_community', ['phronesis']),
    row('political_community', ['phronesis', 'dikaiosyne']), // rank 3 too
    row('cosmopolis', ['phronesis', 'dikaiosyne']),
    row(null, ['phronesis', 'dikaiosyne']), // unmappable — never matches
  ]

  // Candidate at circle 3 with {phronesis,dikaiosyne}: matches rows 1,2,4 = 3
  // occurrences ⇒ NOT novel (count === floor).
  const c1 = assessStructuralNovelty(
    { targetCircle: 3, initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] } },
    window,
  )
  assert(c1.novel === false, '§2.2 at the floor ⇒ not novel')
  assert(c1.confidence === 0, '§2.3 boundary count ⇒ lowest confidence')

  // Order-insensitive set equality (row 2's reversed domains counted).
  const c2 = assessStructuralNovelty(
    { targetCircle: 3, initialClassification: { kind: 'virtue_domain', domains: ['dikaiosyne', 'phronesis'] } },
    window,
  )
  assert(c2.novel === c1.novel, '§2.4 domain order never changes the verdict')

  // Circle 4 with the same domains: 1 occurrence ⇒ novel.
  const c3 = assessStructuralNovelty(
    { targetCircle: 4, initialClassification: { kind: 'virtue_domain', domains: ['phronesis', 'dikaiosyne'] } },
    window,
  )
  assert(c3.novel === true, '§2.5 below the floor ⇒ novel')
  assert(c3.confidence > 0 && c3.confidence < 1, '§2.6 near-floor confidence is partial')

  // Empty window — AMENDED 2026-08-09 per the fresh scope's Q-C ruling: a
  // starved window must NEVER read as a confident result (the pre-ruling
  // behaviour here was novel at confidence 1.0 — explicitly rejected by the
  // mentor as "a false impression of evidential strength").
  const c4 = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    [],
  )
  assert(
    c4.novel === true && c4.confidence === 0 && c4.basis === 'insufficient_history',
    '§2.7 empty window ⇒ novel with ZERO confidence + insufficient_history basis (Q-C ruled)',
  )

  // The ruled wiring detail: the basis check reads TOTAL window size, not the
  // matching-row count. A POPULATED window (≥ floor rows) with ZERO matching
  // rows is the genuinely-novel case — full curve confidence, NO basis field.
  const c4b = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    window, // 6 rows, none matching circle-2/sophrosyne
  )
  assert(
    c4b.novel === true && c4b.confidence === 1 && c4b.basis === undefined,
    '§2.7b populated-but-non-matching window ⇒ genuinely novel at curve confidence, NOT insufficient_history',
  )

  // A below-floor-but-non-empty window is starved too (total size, not zero).
  const c4c = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    [row('household', ['sophrosyne']), row('household', ['sophrosyne'])], // 2 < floor
  )
  assert(
    c4c.novel === true && c4c.confidence === 0 && c4c.basis === 'insufficient_history',
    '§2.7c two-row window (below floor) ⇒ insufficient_history even with matching rows',
  )

  // Saturated: 6+ matches ⇒ confidently NOT novel.
  const saturated = Array.from({ length: 6 }, () => row('household', ['sophrosyne']))
  const c5 = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    saturated,
  )
  assert(c5.novel === false && c5.confidence === 1, '§2.8 saturated ⇒ not novel, full confidence')

  // Friction candidate (no circle, preferred_indifferent): unassessable —
  // novel:true at confidence 0, never a manufactured basis. Surfaced UNCHANGED
  // by the Q-C amendment (ruled): no basis field, even on a starved window
  // (the axes-free branch precedes the starvation check).
  const c6 = assessStructuralNovelty(
    { initialClassification: { kind: 'preferred_indifferent' } },
    window,
  )
  assert(c6.novel === true && c6.confidence === 0 && c6.basis === undefined, '§2.9 friction candidate ⇒ honest zero-confidence (no structural axis to assess), no basis field')
  const c6b = assessStructuralNovelty(
    { initialClassification: { kind: 'preferred_indifferent' } },
    [], // starved window too — friction branch still wins (surfaced unchanged)
  )
  assert(c6b.novel === true && c6b.confidence === 0 && c6b.basis === undefined, '§2.9b friction candidate on a starved window ⇒ still the unchanged friction outcome')

  // Monotone confidence away from the floor (both directions) — AMENDED
  // 2026-08-09: matching-count monotonicity is now asserted over POPULATED
  // windows (each padded to ≥ floor total rows with non-matching rows), since
  // a window whose TOTAL size is below the floor is the starved case (Q-C).
  const pad = Array.from({ length: 3 }, () => row('cosmopolis', ['phronesis']))
  const counts = [0, 1, 2, 3, 4, 5, 6]
  const conf = counts.map((n) =>
    assessStructuralNovelty(
      { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['andreia'] } },
      [...pad, ...Array.from({ length: n }, () => row('household', ['andreia']))],
    ).confidence,
  )
  assert(conf[0] === 1 && conf[1] > conf[2] && conf[2] > conf[3] && conf[3] === 0 && conf[4] < conf[5] && conf[5] < conf[6], '§2.10 confidence is monotone distance-from-the-floor (populated windows)')
}

// ============================================================================
// §3 MEASUREMENT-NEUTRALITY pins — no LIVE/MEASURED path imports this module.
// AMENDED 2026-08-09: the module is consumed by exactly ONE route,
// /api/practice/fresh. CORRECTED 2026-08-19: this block was headed "Darkness
// pins" and described that route as DARK with "SUBSTRATE_FRESH_ENABLED unset
// ⇒ 503" — false since 2026-08-10, when the flag was activated and
// live-verified in production. The route is LIVE; §3.1's real subject was
// never darkness but MEASUREMENT NEUTRALITY (the /api/reason engine and the
// guard channel must not import this module), and that is what it still
// asserts. §3.3 pins flag-GATING — that unset still means off — which is a
// rollback property, not a claim that the flag is unset.
// ============================================================================
{
  const importers: string[] = []
  const files = [
    '../../../app/api/reason/route.ts',
    '../../guardrail-sandwich.ts',
    '../trust-core/derive-trust-events.ts',
    '../trust-core/emission-hooks.ts',
    '../practice-suggestion.ts',
  ]
  for (const f of files) {
    const src = readFileSync(join(__dirname, f), 'utf8')
    if (src.includes('idea-loop-types')) importers.push(f)
  }
  assert(importers.length === 0, `§3.1 INV: no live/measured path imports idea-loop-types — found: ${importers.join(', ')}`)

  const freshHandler = readFileSync(
    join(__dirname, '../../../app/api/practice/fresh/handler.ts'),
    'utf8',
  )
  assert(
    freshHandler.includes("from '@/lib/substrate/idea-loop-types'") &&
      freshHandler.includes('assessStructuralNovelty'),
    '§3.2 INV: the (LIVE, flag-gated) fresh handler is the module\'s consumer (wiring pin, non-vacuous)',
  )
  assert(
    freshHandler.includes("process.env.SUBSTRATE_FRESH_ENABLED === 'true'"),
    '§3.3 INV: the fresh consumer is flag-GATED (unset ⇒ off — the rollback property; the flag IS set in production since 2026-08-10)',
  )
}

// ============================================================================
// §4 Q6 seventh cycleOutcome value ('terminated_by_timeout') — landed at the
// fresh build (2026-08-09), per the ruled follow-up. Compile-time: the union
// accepts it; runtime: assignment round-trips.
// ============================================================================
{
  const outcome: GeneratedCandidate['cycleOutcome'] = 'terminated_by_timeout'
  assert(outcome === 'terminated_by_timeout', '§4.1 cycleOutcome accepts the Q6 seventh value')
}

// ============================================================================
// §5 Puzzle taxonomy STUB — shape, and the DESIGN-PRINCIPLE guard
// (curiosity/taxonomy scoping session, 2026-08-19)
// ============================================================================
{
  const MODULE_SRC = readFileSync(join(__dirname, '../idea-loop-types.ts'), 'utf8')
  // Comment prose reflows; normalise ` * ` continuations before matching so a
  // pin fails on DELETION, not on rewrapping.
  const PROSE = MODULE_SRC.replace(/\n\s*\*\s?/g, ' ').replace(/\s+/g, ' ')

  // 5.1 — the four scoped puzzle types are exactly the four, and constructible.
  const types: PuzzleType[] = ['pattern', 'contradiction', 'discovery', 'connection']
  const entries: PuzzleTaxonomyEntry[] = types.map((t) => ({
    schema: 'idea-loop-puzzle-taxonomy-entry-v1',
    puzzleType: t,
    origin: { kind: 'examination_record', ref: 'sess_9f2a:14' },
    questionsOpened: [],
    taxonomyConnections: [],
  }))
  assert(entries.length === 4, '§5.1 all four scoped puzzle types construct')
  assert(
    entries.every((e) => e.schema === 'idea-loop-puzzle-taxonomy-entry-v1'),
    '§5.2 schema tag (house convention, matches the sibling approved types)',
  )
  assert(
    entries.every((e) => e.questionsOpened.length === 0 && e.taxonomyConnections.length === 0),
    '§5.3 EMPTY AT STUB — nothing populates either array in this build',
  )

  // 5.4 — the external-origin branch of the discriminated union.
  const external: PuzzleTaxonomyEntry = {
    schema: 'idea-loop-puzzle-taxonomy-entry-v1',
    puzzleType: 'contradiction',
    origin: { kind: 'external', description: 'raised in conversation, no examination record' },
    questionsOpened: [],
    taxonomyConnections: [],
  }
  assert(
    external.origin.kind === 'external' && !('ref' in external.origin),
    '§5.4 an external-origin puzzle structurally cannot carry a false examination-record ref',
  )

  // 5.5 — THE DESIGN-PRINCIPLE GUARD, and the most load-bearing pin in §5.
  // "The taxonomy stores the shapes of inquiry, not conclusions." A future
  // session adding a conclusions/answers/findings field is DEPARTING from the
  // design principle, not extending it — this makes that departure fail loudly
  // rather than arrive quietly.
  // ALL declarations, not just the first: TypeScript interface DECLARATION
  // MERGING means a second `export interface PuzzleTaxonomyEntry { ... }`
  // anywhere in the module silently adds its members to the same type. A
  // first-match-only regex would never see it — the evasion PR19 review found.
  const ifaceBlocks = [
    ...MODULE_SRC.matchAll(/export interface PuzzleTaxonomyEntry \{([\s\S]*?)\n\}/g),
  ]
  assert(ifaceBlocks.length >= 1, '§5.5a at least one PuzzleTaxonomyEntry interface block is findable (non-vacuity floor for 5.5b)')
  const ifaceBody = ifaceBlocks.map((m) => m[1]).join('\n')
  assert(
    ifaceBody.includes('puzzleType') && ifaceBody.includes('questionsOpened'),
    '§5.5b the parsed block is genuinely the interface body (non-vacuity floor — a regex that silently matched nothing would pass 5.5c trivially)',
  )
  // Field-name positions only: strip comment lines so the guard cannot be
  // tripped by the word "conclusions" appearing in explanatory prose.
  const declaredFields = ifaceBody
    .split('\n')
    .filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('/*') && !l.trim().startsWith('//'))
    .join('\n')
  const FORBIDDEN_FIELD_STEMS = ['conclusion', 'answer', 'finding', 'resolution', 'explanation']
  const found = FORBIDDEN_FIELD_STEMS.filter((stem) => new RegExp(stem, 'i').test(declaredFields))
  assert(
    found.length === 0,
    `§5.5c NO conclusions/answers field — the taxonomy stores shapes of inquiry, not conclusions (found: ${found.join(', ')})`,
  )

  // 5.6 — the two verbatim design-grounding quotes survive in the docstring.
  assert(
    PROSE.includes('The taxonomy stores the shapes of inquiry, not conclusions.'),
    '§5.6 the shapes-of-inquiry grounding quote is recorded verbatim in the type docstring',
  )
  assert(
    PROSE.includes(
      'the taxonomy stores examination chains about the internal world of reasoning, not the external world of facts',
    ),
    '§5.7 the NON-DUPLICATION BOUNDARY quote is recorded verbatim (the guard against drifting into a general knowledge store)',
  )

  // 5.8 — the placeholder note on the novelty assessment (item 1, second half).
  assert(
    PROSE.includes('PLACEHOLDER FOR A RICHER STANDARD'),
    '§5.8 the structural-novelty standard is marked a placeholder for a richer standard once the taxonomy is populated',
  )
}

// ============================================================================
// §6 curiosity-trigger STUB — pass-through identity, and firing ONLY on a
// genuine confirmation (placement RULED 2026-08-18 Q5)
// ============================================================================
{
  const populated: NoveltyHistoryRow[] = [
    row('household', ['sophrosyne']),
    row('household', ['sophrosyne']),
    row('household', ['sophrosyne']),
    row('cosmopolis', ['phronesis']),
  ]

  const genuine = assessStructuralNovelty(
    { targetCircle: 4, initialClassification: { kind: 'virtue_domain', domains: ['andreia'] } },
    populated,
  )
  const notNovel = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    populated,
  )
  const starved = assessStructuralNovelty(
    { targetCircle: 2, initialClassification: { kind: 'virtue_domain', domains: ['sophrosyne'] } },
    [],
  )
  const friction = assessStructuralNovelty(
    { initialClassification: { kind: 'preferred_indifferent' } },
    populated,
  )

  // 6.0 — the fixtures are the branches they claim to be (non-vacuity floor:
  // without this, 6.2's three negatives could all be passing for the wrong
  // reason — e.g. if `genuine` were silently not novel, everything below would
  // still "pass").
  assert(
    genuine.novel === true && genuine.confidence > 0 && genuine.basis === undefined,
    '§6.0a the genuine fixture really is a populated-window novel result',
  )
  assert(notNovel.novel === false, '§6.0b the not-novel fixture really is not novel')
  assert(
    starved.novel === true && starved.confidence === 0 && starved.basis === 'insufficient_history',
    '§6.0c the starved fixture really is the insufficient_history branch',
  )
  assert(
    friction.novel === true && friction.confidence === 0 && friction.basis === undefined,
    '§6.0d the friction fixture really is the axis-free branch',
  )

  // 6.1 — isGenuineNoveltyConfirmation: the disclosed build-time judgement.
  assert(isGenuineNoveltyConfirmation(genuine) === true, '§6.1a genuine novelty ⇒ a confirmation')
  assert(isGenuineNoveltyConfirmation(notNovel) === false, '§6.1b not novel ⇒ not a confirmation')
  assert(
    isGenuineNoveltyConfirmation(starved) === false,
    '§6.1c starved window ⇒ NOT a confirmation (an honest no-basis pass, never manufactured curiosity)',
  )
  assert(
    isGenuineNoveltyConfirmation(friction) === false,
    '§6.1d friction candidate ⇒ NOT a confirmation (no structural axis to be novel against)',
  )

  // 6.2 — the trigger is a PURE PASS-THROUGH on every branch: same reference,
  // out as in. This is what makes it impossible for the seam to alter any byte
  // of /api/practice/fresh's response.
  for (const [label, r] of [
    ['genuine', genuine],
    ['notNovel', notNovel],
    ['starved', starved],
    ['friction', friction],
  ] as const) {
    assert(
      noteCuriosityTrigger(r) === r,
      `§6.2 ${label}: pass-through returns the SAME object reference (cannot alter a verdict)`,
    )
  }

  // 6.3 — it logs on a genuine confirmation, and ONLY then. Synchronous
  // stub/restore in a single sequential block (memory
  // `async-test-console-stub-race`: only concurrent async blocks clobber).
  const original = console.log
  const lines: unknown[][] = []
  console.log = (...args: unknown[]) => {
    lines.push(args)
  }
  try {
    noteCuriosityTrigger(genuine)
    noteCuriosityTrigger(notNovel)
    noteCuriosityTrigger(starved)
    noteCuriosityTrigger(friction)
  } finally {
    console.log = original
  }
  assert(lines.length === 1, `§6.3a exactly ONE log line across the four branches (got ${lines.length})`)
  const first = String(lines[0]?.[0] ?? '')
  assert(
    first.includes('[curiosity-trigger]') && first.includes('reached'),
    '§6.3b the log says the trigger was reached, under its internal mechanism name',
  )
  const payload = (lines[0]?.[1] ?? {}) as Record<string, unknown>
  assert(
    payload.outcomeWhenPopulated === TAXONOMY_QUESTION_OUTCOME,
    '§6.3c the log names the deferred outcome it will eventually emit',
  )
  assert(
    !JSON.stringify(lines[0] ?? []).includes('gapRef'),
    '§6.3d nothing caller-supplied is logged (no gapRef in the payload)',
  )
}

// ============================================================================
// §7 `taxonomy_question` CONTAINMENT — the Q1 ruling made executable.
// The migration is DEFERRED, so this value must NOT be writable. Code-first
// adoption would let a route accept a value the live CHECK rejects — a 500 on
// write, the ordering hazard the `not_selected` precedent names.
// ============================================================================
{
  assert(
    TAXONOMY_QUESTION_OUTCOME === 'taxonomy_question',
    '§7.1 snake_case spelling, per Q1 ("taxonomy_question, not taxonomy-question")',
  )

  // 7.2 — absent from the watching route's CYCLE_LEVEL_OUTCOMES. Parsed from
  // source rather than imported: importing that handler pulls in security.ts,
  // whose keepalive interval would stop this hermetic battery exiting (memory
  // `tsx-tests-setinterval-keepalive-hang`). The exported-value assertion is
  // carried in watching-handler.test.ts §4.5, which already imports it.
  const watchingSrc = readFileSync(
    join(__dirname, '../../../app/api/practice/watching/handler.ts'),
    'utf8',
  )
  const cycleArr = watchingSrc.match(/export const CYCLE_LEVEL_OUTCOMES = \[([\s\S]*?)\] as const/)
  assert(cycleArr !== null, '§7.2a CYCLE_LEVEL_OUTCOMES is findable in source (non-vacuity floor)')
  const cycleValues = (cycleArr ? cycleArr[1] : '').match(/'([a-z_]+)'/g)?.map((q) => q.slice(1, -1)) ?? []
  assert(
    cycleValues.length === 4 &&
      JSON.stringify([...cycleValues].sort()) ===
        JSON.stringify(['dependency_unavailable', 'null_cycle', 'terminated_by_timeout', 'winner']),
    `§7.2b the parse really yielded the four known cycle-level values (non-vacuity floor; got ${cycleValues.join(',')})`,
  )
  assert(
    !cycleValues.includes(TAXONOMY_QUESTION_OUTCOME),
    '§7.2c taxonomy_question is NOT in CYCLE_LEVEL_OUTCOMES — the migration is deferred (RULED Q1)',
  )

  // 7.3 — absent from the LIVE cycle-level CHECK in the migration.
  const migration = readFileSync(
    join(__dirname, '../../../../supabase-idea-loop-watching-migration.sql'),
    'utf8',
  )
  const checkBlock = migration.match(
    /cycle_outcome TEXT NOT NULL CHECK \(cycle_outcome IN \(\s*'winner'[\s\S]*?\)\)/,
  )
  assert(checkBlock !== null, '§7.3a the cycle-level CHECK block is findable in the migration (non-vacuity floor)')
  const checkValues = (checkBlock ? checkBlock[0] : '').match(/'([a-z_]+)'/g)?.map((q) => q.slice(1, -1)) ?? []
  assert(
    checkValues.length === 4,
    `§7.3b the live cycle-level CHECK still enumerates exactly four values (got ${checkValues.length}: ${checkValues.join(',')})`,
  )
  assert(
    !checkValues.includes(TAXONOMY_QUESTION_OUTCOME),
    '§7.3c taxonomy_question is NOT in the live CHECK — adding it is a founder-walked migration, not a code change',
  )

  // 7.4 — no ROUTE anywhere carries the literal: the stub is code-only, and
  // "code-only" means it does not reach a write path. Walks src/app/api.
  //
  // __tests__ directories are EXCLUDED, and the exclusion is a real correction
  // rather than a convenience: the first form of this pin walked them too and
  // then failed on its own control run, because the sibling batteries' own
  // assertion LABELS quote the literal while asserting its absence. The pin's
  // subject is route source — code that could write the value — not test prose
  // that names it.
  const apiRoot = join(__dirname, '../../../app/api')
  const offenders: string[] = []
  let filesWalked = 0
  const walk = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name)
      if (statSync(full).isDirectory()) {
        if (name !== '__tests__') walk(full)
        continue
      }
      if (!name.endsWith('.ts') && !name.endsWith('.tsx')) continue
      filesWalked++
      if (readFileSync(full, 'utf8').includes(TAXONOMY_QUESTION_OUTCOME)) offenders.push(name)
    }
  }
  walk(apiRoot)
  assert(filesWalked > 50, `§7.4a the API walk genuinely traversed the tree (non-vacuity floor; walked ${filesWalked} files)`)
  assert(
    offenders.length === 0,
    `§7.4b no API route source carries the taxonomy_question literal — the stub writes nothing (found in: ${offenders.join(', ')})`,
  )
}

console.log(`\nidea-loop-types battery: ${passed} passed, ${failed} failed`)
if (failed > 0) {
  console.error('FAILURES:\n - ' + failures.join('\n - '))
  process.exit(1)
}
