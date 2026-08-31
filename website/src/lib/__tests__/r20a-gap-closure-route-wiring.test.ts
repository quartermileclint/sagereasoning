/**
 * r20a-gap-closure-route-wiring.test.ts — per-route wiring battery for every
 * route that consumes the shared R20a gap-closure module (mechanical item 2,
 * 2026-08-22 — the per-route invocation-test gap, built as ONE parameterised
 * battery rather than 25 copy-pasted files; the judgement call the session
 * prompt left open, taken because all 25 perimeter blocks landed through
 * shared commits and a single config table cannot drift 25 ways).
 *
 * WHAT THIS ADDS over the central guard battery (r20a-invocation-guard.test.ts,
 * which asserts import + call PRESENCE per route on source text):
 *
 *   1. STRUCTURE, not presence. Each flag block is extracted by a string-aware
 *      brace scanner and the classifier call is proven to sit INSIDE the
 *      hasScreenableSubject gate, INSIDE the flag gate — so a refactor that
 *      leaves the call in the file but moves it somewhere unreachable (the
 *      exact class a source-grep cannot see) goes red here.
 *   2. COUNTS. A route with two write paths (POST + PATCH) must carry two
 *      blocks; losing the PATCH check while keeping POST passes every
 *      presence-grep and fails here.
 *   3. FIELD LISTS. Each block's subject expression is pinned, and every
 *      local subject-composer's field list is pinned — a field dropped from
 *      the composition (the "silently narrowed perimeter" class, which is how
 *      this whole gap arose) goes red.
 *   4. REGISTRY EQUALITY. The config table below must equal, exactly, the set
 *      of src/app/**\/route.ts files importing r20a-gap-closure — a new
 *      consumer route must register here (and gets all the checks for one
 *      config row), and a row whose route stops importing the module goes red.
 *
 * All call-site checks run on COMMENT-STRIPPED code (the ST3 fold's lesson:
 * raw-source call checks are comment-satisfiable). One route carries the
 * awaited-call pattern inside a STRING LITERAL too (founder/hub's persona
 * prompt quotes the AC5 pattern as documentation); that occurrence is counted
 * explicitly in its config row rather than left to inflate a pin.
 *
 * HONEST LIMITS (same posture as the sibling per-route tests): this battery is
 * static — it proves structure, not execution. The RUNTIME half lives in
 * r20a-gap-closure.test.ts (the shared module's real functions, real inputs,
 * real stage-1 regex). End-to-end HTTP against a handler needs live env + a
 * session and stays with the founder-walked smokes. Cross-function ordering
 * ("check runs before the route's own LLM call") is NOT asserted here: with
 * helpers defined above/below their call sites, source-index ordering across
 * function boundaries proves nothing, and a false pin is worse than a named
 * absence.
 *
 * Run (from website/): npx tsx src/lib/__tests__/r20a-gap-closure-route-wiring.test.ts
 * No API key, no network, no --env-file, no imports beyond fs/path.
 * EXIT 0 all pass; EXIT 1 any fail.
 *
 * Rules served: R20a; AC4; AC5; PR3; PR15 (extends the impulse/journal
 * per-route pattern); PR23 (guard-non-vacuity floor per the standing memory —
 * the battery counts the blocks it actually verified).
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// website/ root — this test sits at src/lib/__tests__/ (3 up).
const websiteRoot = path.resolve(__dirname, '..', '..', '..')

// ---------------------------------------------------------------------------
// Source utilities
// ---------------------------------------------------------------------------

/** Comment stripper (the family's shared shape; ':'-guard keeps https:// intact). */
function stripComments(ts: string): string {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

/** Collapse whitespace so multi-line expressions match single-line pins. */
function normalise(code: string): string {
  return code.replace(/\s+/g, ' ')
}

/**
 * Find the index of the bracket matching source[openIdx], skipping string
 * literal contents ('…', "…", `…`) so a brace inside a string never
 * unbalances the scan. Returns -1 if unbalanced.
 */
function findMatching(source: string, openIdx: number, open: string, close: string): number {
  let depth = 0
  let i = openIdx
  while (i < source.length) {
    const ch = source[i]
    if (ch === "'" || ch === '"' || ch === '`') {
      const quote = ch
      i++
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++
        i++
      }
    } else if (ch === open) {
      depth++
    } else if (ch === close) {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  return -1
}

interface ExtractedBlock {
  /** The full `if (…)` condition text, parens excluded. */
  condition: string
  /** The block body between the braces. */
  body: string
  /** Index of the block's `if` in the stripped code. */
  start: number
}

/** Extract every `if (isR20aGapClosureEnabled()…) { … }` block, in source order. */
function extractFlagBlocks(code: string, label: string, flagFn: string): ExtractedBlock[] {
  const blocks: ExtractedBlock[] = []
  // The flag-check function name is per-route (see RouteWiring.flagFn). It
  // defaults to the shared gap-closure flag, so all pre-existing rows are
  // byte-identical; /api/score/save takes a dedicated flag and would otherwise
  // have been invisible to this entire battery.
  const re = new RegExp('if\\s*\\(\\s*' + escapeRe(flagFn) + '\\s*\\(\\s*\\)', 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(code)) !== null) {
    const condOpen = code.indexOf('(', m.index)
    const condClose = findMatching(code, condOpen, '(', ')')
    assert(condClose !== -1, `${label}: flag-block condition parens balance`)
    if (condClose === -1) continue
    const braceOpen = code.indexOf('{', condClose)
    assert(
      braceOpen !== -1 && code.slice(condClose + 1, braceOpen).trim() === '',
      `${label}: flag block is a braced if-block (nothing between condition and '{')`
    )
    if (braceOpen === -1) continue
    const braceClose = findMatching(code, braceOpen, '{', '}')
    assert(braceClose !== -1, `${label}: flag-block braces balance`)
    if (braceClose === -1) continue
    blocks.push({
      condition: code.slice(condOpen + 1, condClose),
      body: code.slice(braceOpen + 1, braceClose),
      start: m.index,
    })
  }
  return blocks
}

function countOccurrences(haystack: string, re: RegExp): number {
  return (haystack.match(re) ?? []).length
}

// ---------------------------------------------------------------------------
// Config table — one row per consumer route.
//
// Every value below was derived FIRST-HAND from comment-stripped source on
// 2026-08-22, not carried from prose (this task list's standing stale-count
// lesson). When a route's perimeter wiring legitimately changes, update its
// row in the same commit — that is the intended friction.
// ---------------------------------------------------------------------------

interface BlockSpec {
  /**
   * 'standard': block body composes the subject, then `if (hasScreenableSubject(v)) { classifier … }`.
   * 'combined': the subject is composed BEFORE the block and the flag
   *             condition itself carries `hasScreenableSubject(v)` (the
   *             premeditatio PATCH shape — its metadata-only branch would
   *             otherwise pay a Haiku call per checkbox toggle).
   */
  gate: 'standard' | 'combined'
  /** The subject variable the classifier must receive. */
  subjectVar: string
  /** Normalised pin for the subject composition statement (in-block for
   *  'standard'; anywhere BEFORE the block for 'combined'). */
  subjectExpr: string
  /** Extra condition text that must appear in the flag condition (execute's
   *  human-branch gate). */
  extraCondition?: string
  /**
   * The HTTP status the non-mild redirect MUST carry, asserted inside the
   * argument span of the NextResponse.json call that builds the distress
   * payload.
   *
   * OPTIONAL, and asserted only when present, so all pre-existing rows stay
   * byte-identical. It deliberately does NOT default to 200: of the 45 distress
   * redirect calls in this codebase, 32 express 200 by OMITTING the second
   * argument (12 pass it explicitly), so a required field with an implicit-200
   * sentinel would have to touch every row for no safety gain.
   *
   * /api/score/save is the only route that sets it. It returns 422 because its
   * calling page treats a 200 as a durable write having happened — the exact
   * defect that forced the 2026-08-31 revert.
   */
  redirectStatus?: number
}

interface LocalComposerSpec {
  /** The local function name. */
  name: string
  /** Whether its body must call the shared composeDistressSubject. */
  callsShared: boolean
  /** Substrings that must appear in the function body — field references for
   *  subject composers; bound expressions for the recursive collectors. */
  mustContain: string[]
}

interface RouteWiring {
  route: string
  blocks: BlockSpec[]
  /** The exported flag-check function gating this route's perimeter block.
   *  Defaults to the shared 'isR20aGapClosureEnabled'. /api/score/save takes a
   *  DEDICATED flag (see its ./r20a.ts for why the shared one was rejected:
   *  no dark-deploy window, and a rollback lever that would strip screening
   *  from 25 other routes). Without this field a dedicated flag is invisible
   *  to extractFlagBlocks and the route silently leaves this battery. */
  flagFn?: string
  mildVariant: 'passion' | 'practice' | 'skill'
  /** File-level counts of the two mild-fold attachment shapes. */
  attach: { spread: number; envelope: number }
  localComposers?: LocalComposerSpec[]
  /** Occurrences of the awaited classifier pattern living inside string
   *  literals (documentation text), which comment-stripping cannot remove. */
  classifierMentionsInStrings?: number
}

const ROUTE_WIRING: readonly RouteWiring[] = [
  {
    route: 'src/app/api/compose/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject(collectStepText(body?.steps))' }],
    mildVariant: 'skill',
    attach: { spread: 0, envelope: 1 },
    localComposers: [{ name: 'collectStepText', callsShared: false, mustContain: ['depth > 4', 'acc.length >= 20'] }],
  },
  {
    route: 'src/app/api/evaluate/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([input])' }],
    mildVariant: 'skill',
    attach: { spread: 0, envelope: 2 },
  },
  {
    route: 'src/app/api/execute/route.ts',
    blocks: [{
      gate: 'standard', subjectVar: 'subject',
      subjectExpr: 'const subject = composeDistressSubject(collectExecuteText(body?.input))',
      // The dual-auth route screens the HUMAN branch only (authedUser is a
      // verified Supabase JWT, not caller-choosable) — the recorded design.
      extraCondition: '&& authedUser',
    }],
    mildVariant: 'skill',
    attach: { spread: 0, envelope: 2 },
    localComposers: [{ name: 'collectExecuteText', callsShared: false, mustContain: ['depth > 4', 'acc.length >= 20'] }],
  },
  {
    route: 'src/app/api/founder/hub/route.ts',
    blocks: [{
      gate: 'standard', subjectVar: 'subject',
      // The single-field fieldCap override (TEXT_LIMITS.long) — the default
      // 5000 would screen only the first third of a 15000-validated message.
      subjectExpr: 'const subject = composeDistressSubject([message], TEXT_LIMITS.long)',
    }],
    mildVariant: 'skill',
    attach: { spread: 2, envelope: 0 },
    // The hub's persona prompt QUOTES the awaited AC5 pattern as documentation
    // inside a string literal; counted here so it cannot inflate a pin.
    classifierMentionsInStrings: 1,
  },
  {
    route: 'src/app/api/mentor-appendix/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject(collectAppendixAnswerText(body?.answers))' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    // RULED 2026-08-31 (corrected Question A2b), built, PR19-reviewed,
    // REVERTED, rebuilt. The row exists because three independent reviewers
    // found its absence separately: it is the pin that kills the whole
    // CRITICAL mutation class (empty subject, block-after-insert, missing
    // return, severity inversion, dead flag) in a single config entry.
    //
    // TWO THINGS ARE UNIQUE TO THIS ROW, and both are deliberate:
    //   flagFn         — a DEDICATED flag, not the shared gap-closure one.
    //                    See ../../../app/api/score/save/r20a.ts.
    //   redirectStatus — 422, not 200. The ONLY route in the perimeter that
    //                    sets it, because it is the only one whose caller
    //                    treats a 200 as a durable write having happened.
    route: 'src/app/api/score/save/route.ts',
    flagFn: 'isScoreSaveR20aEnabled',
    blocks: [{
      gate: 'standard',
      subjectVar: 'subject',
      subjectExpr: 'const subject = scoreSaveDistressSubject(body)',
      redirectStatus: 422,
    }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
    localComposers: [
      {
        // The shape-agnostic JSONB walker. `depth > 6` and
        // JSONB_COLLECTOR_WORK_CEILING are WORK bounds only — they stop a
        // hostile payload making us walk forever. They are NOT the safety
        // guarantee, and an earlier version of this row said they were.
        //
        // PR19 found a SECOND bypass in the same function: the depth bound
        // returned SILENTLY, so prose nested 7 deep was never read and
        // persisted unscreened. Pinning the literal `depth > 6` had cemented
        // the defective number — raising it turned this battery red and read as
        // the regression. The pin is now on the NAMED bounds and on
        // `bounded = true`, because what must not be lost is not any particular
        // number but the property that hitting a bound REFUSES the write.
        //
        // The guarantee is the route's JSONB check binding on the length of
        // THIS FUNCTION'S OUTPUT (pinned separately on the composer row below,
        // and in the route's own header). Binding it on SERIALIZED size instead
        // was a demonstrated bypass: the collector's own 7-char separators
        // inflate the collected string past the 5,000 screening cap while the
        // serialized form stays far under it, so padded distress persisted
        // having never been screened. The ceiling must stay ABOVE the cap, so
        // that hitting it yields an over-cap string the route REJECTS rather
        // than a quietly-shortened one it accepts.
        name: 'collectScoreSaveJsonbText',
        callsShared: false,
        mustContain: ['JSONB_COLLECTOR_MAX_DEPTH', 'JSONB_COLLECTOR_WORK_CEILING', 'bounded = true', 'parts.push(k)', 'DISTRESS_SUBJECT_SEPARATOR'],
      },
      {
        // All TEN screened fields pinned by name. A field dropped from the
        // composition is a silently narrowed perimeter — and this route's
        // screened set is a binding mentor ruling, not a builder's judgement.
        name: 'scoreSaveDistressSubject',
        callsShared: true,
        mustContain: [
          'body?.emotional_state',
          'body?.action',
          'collectScoreSaveJsonbText(body?.false_judgements)',
          'body?.context',
          'body?.relationships',
          'body?.philosophical_reflection',
          'body?.improvement_path',
          'body?.oikeiosis_context',
          'body?.ruling_faculty_state',
          'collectScoreSaveJsonbText(body?.passions_detected)',
        ],
      },
    ],
  },
  {
    route: 'src/app/api/mentor-baseline-response/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject(collectBaselineAnswerText(responses))' }],
    mildVariant: 'passion',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor-baseline/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([body?.profile_summary])' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor-journal-week/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([body?.profile_summary, body?.recent_activity])' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor-profile/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject(collectMentorProfileText(profile))' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/gap4/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([content, divergence_description])' }],
    mildVariant: 'passion',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/hupexairesis/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = reserveDistressSubject(body)' },
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = reserveDistressSubject(body)' },
    ],
    mildVariant: 'practice',
    attach: { spread: 2, envelope: 0 },
    localComposers: [{
      name: 'reserveDistressSubject', callsShared: true,
      mustContain: ['b.outcome_pursued', 'b.prepared_response', 'b.action_context'],
    }],
  },
  {
    route: 'src/app/api/mentor/morning/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = morningDistressSubject(body)' },
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = morningDistressSubject(body)' },
    ],
    mildVariant: 'practice',
    attach: { spread: 2, envelope: 0 },
    localComposers: [{
      name: 'morningDistressSubject', callsShared: true,
      mustContain: ['b.roles_active', 'b.expected_impressions', 'b.prepared_virtue_response'],
    }],
  },
  {
    route: 'src/app/api/mentor/oikeiosis/extension/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = extensionDistressSubject(parsedBody.body)' },
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = extensionDistressSubject(parsedBody.body)' },
    ],
    mildVariant: 'practice',
    attach: { spread: 2, envelope: 0 },
    localComposers: [{
      name: 'extensionDistressSubject', callsShared: true,
      mustContain: ['b.situation', 'b.extended_reasoning', 'b.assessment_shift', 'b.cosmopolitan_note'],
    }],
  },
  {
    route: 'src/app/api/mentor/oikeiosis/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([body?.action_description, body?.reputational_return])' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/passion-classify/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([description, user_diagnosis])' }],
    mildVariant: 'passion',
    attach: { spread: 2, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/passion-log/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([false_judgement, description])' }],
    mildVariant: 'passion',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/premeditatio/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = premeditatioDistressSubject(body)' },
      // The PATCH shape: subject composed before the block (pure function, no
      // billed call), flag && screenable in ONE condition — so the
      // metadata-only branch (a checkbox toggle) never pays for a Haiku call.
      { gate: 'combined', subjectVar: 'patchSubject', subjectExpr: 'const patchSubject = premeditatioDistressSubject(body)' },
    ],
    mildVariant: 'practice',
    attach: { spread: 3, envelope: 0 },
    localComposers: [{
      name: 'premeditatioDistressSubject', callsShared: true,
      mustContain: [
        'b.anticipated_event', 'b.false_impression', 'b.correct_judgement',
        'b.within_control', 'b.outside_control', 'b.virtue_response', 'b.prepared_disposition',
      ],
    }],
  },
  {
    route: 'src/app/api/mentor/private/baseline-response/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject(collectBaselineAnswerText(responses))' }],
    mildVariant: 'passion',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/private/baseline/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([body?.profile_summary])' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/private/founder-facts/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject(collectFounderFactsPutText(facts))' },
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([note])' },
    ],
    mildVariant: 'passion',
    attach: { spread: 2, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/private/journal-week/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([body?.profile_summary, body?.recent_activity])' }],
    mildVariant: 'practice',
    attach: { spread: 1, envelope: 0 },
  },
  {
    route: 'src/app/api/mentor/sage-compass/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = compassDistressSubject(parsedBody.body)' },
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = compassDistressSubject(parsedBody.body)' },
    ],
    mildVariant: 'practice',
    attach: { spread: 2, envelope: 0 },
    localComposers: [{
      name: 'compassDistressSubject', callsShared: true,
      mustContain: ['b.situation', 'b.action_considered', 'b.complete_expression', 'b.distance'],
    }],
  },
  {
    route: 'src/app/api/mentor/view-from-above/route.ts',
    blocks: [
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = viewDistressSubject(body)' },
      { gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = viewDistressSubject(body)' },
    ],
    mildVariant: 'practice',
    attach: { spread: 2, envelope: 0 },
    localComposers: [{
      name: 'viewDistressSubject', callsShared: true,
      mustContain: [
        'b.concern', 'b.recalibrated_reading', 'b.expansion_one_year', 'b.expansion_ten_years',
        'b.expansion_whole_life', 'b.expansion_widest_circle', 'b.fate_acceptance',
      ],
    }],
  },
  {
    route: 'src/app/api/skill/sage-classify/route.ts',
    blocks: [{ gate: 'standard', subjectVar: 'subject', subjectExpr: 'const subject = composeDistressSubject([input, context])' }],
    mildVariant: 'skill',
    attach: { spread: 2, envelope: 0 },
  },
  {
    route: 'src/app/api/skill/sage-prioritise/route.ts',
    blocks: [{
      gate: 'standard', subjectVar: 'subject',
      subjectExpr: 'const subject = composeDistressSubject([ ...collectPrioritiseItemText(body?.items), body?.objective, body?.criteria, body?.stakeholders, ])',
    }],
    mildVariant: 'skill',
    attach: { spread: 2, envelope: 0 },
  },
]

// ---------------------------------------------------------------------------
// Registry equality — the config table must exactly match the filesystem.
// ---------------------------------------------------------------------------

function findConsumerRoutes(dir: string, acc: string[]): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue
      findConsumerRoutes(full, acc)
    } else if (entry.name === 'route.ts') {
      const src = fs.readFileSync(full, 'utf-8')
      // Quote-agnostic (PR19 fold, 2026-08-22): a single-quote-only substring
      // check silently misses a route importing the module with double or
      // template quotes — the exact silent-perimeter-narrowing class this
      // registry-equality check exists to catch. The codebase's consumer set
      // is uniformly single-quote today (25/25), so this was latent, not
      // live — but a new route in a different style must still register.
      if (/\/r20a-gap-closure['"`]/.test(src)) acc.push(path.relative(websiteRoot, full))
    }
  }
  return acc
}

{
  const onDisk = findConsumerRoutes(path.join(websiteRoot, 'src', 'app'), []).sort()
  const configured = ROUTE_WIRING.map((r) => r.route).slice().sort()

  assert(
    ROUTE_WIRING.length >= 26,
    `registry floor: at least 26 configured consumer routes (saw ${ROUTE_WIRING.length}) — bump this floor in the SAME edit as any registry addition (the guard battery's own standing lesson)`
  )
  for (const r of onDisk) {
    assert(configured.includes(r), `registry: consumer route ${r} imports r20a-gap-closure but has NO config row here — add one (it gets every wiring check for one row)`)
  }
  for (const r of configured) {
    assert(onDisk.includes(r), `registry: configured route ${r} no longer imports r20a-gap-closure — remove or fix the row`)
  }
  assert(new Set(configured).size === configured.length, 'registry: no duplicate config rows')
}

// ---------------------------------------------------------------------------
// Per-route wiring checks
// ---------------------------------------------------------------------------

let blocksVerified = 0

for (const cfg of ROUTE_WIRING) {
  const label = cfg.route
  const fullPath = path.join(websiteRoot, cfg.route)
  assert(fs.existsSync(fullPath), `${label}: file exists`)
  if (!fs.existsSync(fullPath)) continue

  const raw = fs.readFileSync(fullPath, 'utf-8')
  const code = stripComments(raw)
  const norm = normalise(code)

  // Imports: the four shared helpers all come from the shared module.
  // Checked against COMMENT-STRIPPED source (PR19 fold, 2026-08-22): the raw
  // form let a symbol named only in a comment satisfy this assertion with no
  // real import/use. Backstopped in practice by the structural block checks
  // below (assertRedirectAndMild requires a real buildMildSupportResources(…)
  // call site inside the gated body), so this was a test-hygiene gap, not a
  // live vacuous pass — fixed anyway so this assertion means what it claims.
  const flagFn = cfg.flagFn ?? 'isR20aGapClosureEnabled'
  for (const sym of [flagFn, 'composeDistressSubject', 'buildMildSupportResources', 'hasScreenableSubject']) {
    assert(code.includes(sym), `${label}: imports/uses ${sym}`)
  }

  const blocks = extractFlagBlocks(code, label, flagFn)
  assert(
    blocks.length === cfg.blocks.length,
    `${label}: exactly ${cfg.blocks.length} flag-gated perimeter block(s) (saw ${blocks.length}) — a lost write-path check or an unregistered new one`
  )

  const n = Math.min(blocks.length, cfg.blocks.length)
  for (let i = 0; i < n; i++) {
    const spec = cfg.blocks[i]
    const block = blocks[i]
    const blockLabel = `${label} block ${i + 1}/${cfg.blocks.length}`
    blocksVerified++

    if (spec.extraCondition) {
      assert(
        normalise(block.condition).includes(spec.extraCondition),
        `${blockLabel}: flag condition carries '${spec.extraCondition}' (the recorded human-branch gate)`
      )
    }

    // The classifier call, exactly once, in the right place.
    const classifierRe = new RegExp(
      `await\\s+enforceDistressCheck\\s*\\(\\s*detectDistressTwoStage\\s*\\(\\s*${spec.subjectVar}\\s*\\)`,
      'g'
    )

    if (spec.gate === 'standard') {
      // Subject composed inside the block.
      assert(
        normalise(block.body).includes(spec.subjectExpr),
        `${blockLabel}: composes the pinned subject — '${spec.subjectExpr}'`
      )
      // The screenable gate wraps the classifier: extract the inner if.
      const innerMatch = /if\s*\(\s*hasScreenableSubject\s*\(/.exec(block.body)
      assert(innerMatch !== null, `${blockLabel}: carries the hasScreenableSubject gate (the bbd89d1 empty-subject skip)`)
      if (innerMatch === null) continue
      const innerCondOpen = block.body.indexOf('(', innerMatch.index)
      const innerCondClose = findMatching(block.body, innerCondOpen, '(', ')')
      const innerBraceOpen = block.body.indexOf('{', innerCondClose)
      const innerBraceClose = findMatching(block.body, innerBraceOpen, '{', '}')
      assert(
        innerCondClose !== -1 && innerBraceOpen !== -1 && innerBraceClose !== -1 &&
          block.body.slice(innerCondClose + 1, innerBraceOpen).trim() === '',
        `${blockLabel}: the screenable gate is a braced if-block`
      )
      if (innerCondClose === -1 || innerBraceOpen === -1 || innerBraceClose === -1) continue
      const innerCond = block.body.slice(innerCondOpen + 1, innerCondClose)
      const innerBody = block.body.slice(innerBraceOpen + 1, innerBraceClose)

      assert(
        normalise(innerCond).trim() === `hasScreenableSubject(${spec.subjectVar})`,
        `${blockLabel}: the screenable gate reads the SAME variable the subject was composed into (saw '${innerCond.trim()}')`
      )
      assert(
        countOccurrences(innerBody, classifierRe) === 1,
        `${blockLabel}: exactly one awaited classifier call on ${spec.subjectVar}, INSIDE the screenable gate`
      )
      assert(
        countOccurrences(block.body, classifierRe) === 1,
        `${blockLabel}: no classifier call outside the screenable gate within this block`
      )
      assertRedirectAndMild(innerBody, blockLabel, cfg.mildVariant, spec.redirectStatus)
    } else {
      // 'combined': subject composed BEFORE the block; the flag condition
      // itself carries the screenable gate.
      const preBlockCode = normalise(code.slice(0, block.start))
      assert(
        preBlockCode.includes(spec.subjectExpr),
        `${blockLabel}: the pre-composed subject statement precedes the block — '${spec.subjectExpr}'`
      )
      assert(
        normalise(block.condition).includes(`hasScreenableSubject(${spec.subjectVar})`),
        `${blockLabel}: the flag condition carries hasScreenableSubject(${spec.subjectVar}) (the combined gate shape)`
      )
      assert(
        countOccurrences(block.body, classifierRe) === 1,
        `${blockLabel}: exactly one awaited classifier call on ${spec.subjectVar} inside the combined block`
      )
      assertRedirectAndMild(block.body, blockLabel, cfg.mildVariant, spec.redirectStatus)
    }
  }

  // File-level counts.
  const expectedClassifierTotal = cfg.blocks.length + (cfg.classifierMentionsInStrings ?? 0)
  assert(
    countOccurrences(code, /detectDistressTwoStage\s*\(/g) === expectedClassifierTotal,
    `${label}: classifier call-site count is exactly ${expectedClassifierTotal} (blocks${cfg.classifierMentionsInStrings ? ' + the documented string-literal mention' : ''})`
  )
  assert(
    countOccurrences(norm, new RegExp(escapeRe(`buildMildSupportResources('${cfg.mildVariant}')`), 'g')) === cfg.blocks.length,
    `${label}: buildMildSupportResources('${cfg.mildVariant}') appears exactly ${cfg.blocks.length}× (one per block, the right variant)`
  )
  assert(
    countOccurrences(norm, /buildMildSupportResources\('/g) === cfg.blocks.length,
    `${label}: no mild fold under a DIFFERENT variant anywhere in the file`
  )
  assert(
    countOccurrences(norm, /\.\.\.\(mildSupport \? \{ support_resources: mildSupport \} : \{\}\)/g) === cfg.attach.spread,
    `${label}: conditional spread attachment count is exactly ${cfg.attach.spread}`
  )
  assert(
    countOccurrences(norm, /mildSupport \? \{ \.\.\.envelope, support_resources: mildSupport \} : envelope/g) === cfg.attach.envelope,
    `${label}: conditional envelope attachment count is exactly ${cfg.attach.envelope}`
  )
  assert(
    !norm.includes('support_resources: null'),
    `${label}: never sends support_resources: null — silence is an ABSENT field`
  )

  // Local composers/collectors: definition present, bounds/fields pinned.
  //
  // ⚠ EXTRACTOR LIMITATION, found 2026-08-31 and recorded rather than papered
  // over: the body scan below takes the FIRST '{' after the parameter list's
  // closing paren. A function whose RETURN TYPE is an inline object literal
  // (`): { a: string } {`) therefore has its TYPE ANNOTATION extracted as the
  // body, and every mustContain entry then fails confusingly — or, for a row
  // with no mustContain entries, silently verifies nothing. It failed loudly in
  // the case that surfaced it, which is the safe direction, but the vacuous
  // case is real. Use a NAMED return type on any local composer you pin here
  // (score/save's collector uses `JsonbCollected` for exactly this reason).
  for (const lc of cfg.localComposers ?? []) {
    const defMatch = new RegExp(`function\\s+${lc.name}\\s*\\(`).exec(code)
    assert(defMatch !== null, `${label}: local function ${lc.name} is defined`)
    if (defMatch === null) continue
    const fnBraceOpen = code.indexOf('{', findMatching(code, code.indexOf('(', defMatch.index), '(', ')'))
    const fnBraceClose = findMatching(code, fnBraceOpen, '{', '}')
    assert(fnBraceOpen !== -1 && fnBraceClose !== -1, `${label}: ${lc.name} body braces balance`)
    if (fnBraceOpen === -1 || fnBraceClose === -1) continue
    const fnBody = normalise(code.slice(fnBraceOpen + 1, fnBraceClose))
    if (lc.callsShared) {
      assert(
        fnBody.includes('composeDistressSubject('),
        `${label}: ${lc.name} composes through the SHARED composeDistressSubject (caps + seam guarantees inherited)`
      )
    }
    for (const field of lc.mustContain) {
      assert(
        fnBody.includes(field),
        `${label}: ${lc.name} carries '${field}' — a field dropped from the composition is a silently narrowed perimeter`
      )
    }
  }
}

/** The non-mild redirect + mild fold, asserted inside the gated body. */
function assertRedirectAndMild(
  gatedBody: string,
  blockLabel: string,
  variant: string,
  redirectStatus?: number
): void {
  const nb = normalise(gatedBody)
  assert(
    nb.includes("gate.result.distress_detected && gate.result.severity !== 'mild'"),
    `${blockLabel}: non-mild detection branch present inside the gated body`
  )
  assert(
    nb.includes('return NextResponse.json'),
    `${blockLabel}: the redirect RETURNS (terminates the request) inside the gated body`
  )
  for (const key of ['distress_detected: true', 'severity: gate.result.severity', 'redirect_message: gate.result.redirect_message']) {
    assert(nb.includes(key), `${blockLabel}: redirect payload carries '${key}'`)
  }
  assert(
    nb.includes("gate.result.severity === 'mild'") && nb.includes(`buildMildSupportResources('${variant}')`),
    `${blockLabel}: the mild path folds buildMildSupportResources('${variant}') inside the gated body`
  )

  // ── The ruled HTTP status, bound to the SAME call as the payload ─────────
  // Deliberately NOT a file-wide `nb.includes('status: 422')`: that is the
  // register's H6 pin-false-pass class — an unrelated 422 elsewhere in the file
  // would satisfy it while the redirect itself silently returned 200. Locate
  // the NextResponse.json call whose ARGUMENT SPAN carries the distress
  // payload, and assert the status inside that span.
  if (redirectStatus !== undefined) {
    let statusOnRedirect = false
    let inspected = 0
    const callRe = /NextResponse\.json\s*\(/g
    let cm: RegExpExecArray | null
    while ((cm = callRe.exec(gatedBody)) !== null) {
      const open = gatedBody.indexOf('(', cm.index)
      const close = findMatching(gatedBody, open, '(', ')')
      if (close === -1) continue
      const span = normalise(gatedBody.slice(open + 1, close))
      if (!span.includes('distress_detected: true')) continue
      inspected++
      statusOnRedirect = span.includes(`status: ${redirectStatus}`)
      break
    }
    assert(
      inspected === 1,
      `${blockLabel}: found exactly one NextResponse.json call carrying the distress payload (saw ${inspected}) — the status pin needs an unambiguous target`
    )
    assert(
      statusOnRedirect,
      `${blockLabel}: the distress redirect carries { status: ${redirectStatus} } in the SAME NextResponse.json call as the payload (the ruled non-200 response)`
    )
  }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ---------------------------------------------------------------------------
// Guard non-vacuity floor (standing memory: a guard that stops guarding still
// prints 0 failed — count the traversal).
// ---------------------------------------------------------------------------

{
  const expectedBlocks = ROUTE_WIRING.reduce((acc, r) => acc + r.blocks.length, 0)
  assert(
    blocksVerified === expectedBlocks && expectedBlocks >= 33,
    `non-vacuity floor: verified ${blocksVerified} of ${expectedBlocks} configured blocks (floor 33) — the battery actually traversed every block`
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
