/**
 * r20a-invocation-guard.test.ts — Automated invocation test for the R20a perimeter.
 *
 * PURPOSE: Prevents the 5-session dead-code gap (SS3) from recurring.
 * detectDistress() was defined on 6 Apr but never called until 11 Apr.
 * This test reads the source files of every R20a-perimeter route and
 * confirms the canonical safety function is both imported AND called.
 *
 * Two registries (per AC5 + Option A build arc 2026-05-28 spec §5):
 *
 *   HUMAN_FACING_POST_ROUTES (the original eight per manifest §AC5):
 *     route-level pattern → `await enforceDistressCheck(detectDistressTwoStage(...))`
 *
 *   SUBSTRATE_GATE_ROUTES (added under D-R20A-OPTIONA-S2-CALLING-WIRED-2026-05-28):
 *     substrate-gate pattern → `await enforceLayer2R20aGate({ text, ... })`
 *     Calling is the first member (ninth route in the R20a perimeter overall).
 *     The substrate-gate path reuses A7 which internally invokes
 *     detectDistressTwoStage via SafetyCriticalCallParams — same Haiku
 *     classifier, different surface call. AC5's intent (the safety function
 *     runs on the route) is preserved.
 *
 * This is an INVOCATION test, not a FUNCTIONAL test. It verifies the
 * function exists in the execution path — not that it returns correct
 * output. The eval suite (r20a-classifier-eval.ts) handles functional
 * testing against the live API; per-route functional tests live under each
 * route's `__tests__/` folder (e.g. api/calling/__tests__/r20a-invocation.test.ts).
 *
 * No API key required. No network calls. Runs at build time.
 *
 * Run: npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts
 *
 * Rules served: R20a (vulnerable user detection and redirection); AC4 (invocation
 * testing); AC5 (perimeter — 20 route-level + 2 substrate-gate = 22 as of
 * 2026-08-12; this line previously read "eight route-level + one substrate-gate
 * = nine", which had been stale for months while the accurate prose block
 * below tracked the real counts — corrected rather than left to drift again).
 * Knowledge gaps addressed: KG3, KG7 (build-to-wire gap pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) { passed++ } else { failed++; failures.push(label); console.error('FAIL: ' + label) }
}

// ---------------------------------------------------------------------------
// Human-facing POST routes that MUST call detectDistressTwoStage.
//
// This list is the authoritative registry. When a new human-facing POST
// endpoint is added, it MUST be added here. If it is not added, this test
// will not catch missing safety checks on the new route — which is its own
// failure mode. The pre-commit checklist (verification-framework.md) covers
// that case: "Safety-critical function: at least one endpoint calls the
// function, and a test confirms the end-to-end path."
//
// Agent-facing endpoints (score-iterate, assessment/*, baseline/agent) are
// excluded because they process agent output, not human distress input.
//
// Stoa ST4 (2026-08-03, recorded decision): src/app/api/stoa/declare/route.ts
// is excluded for the same reason — its what_i_bring/what_i_seek/
// contact_channel/tags fields are agent-authored text submitted over a
// credential-authenticated API call (Bearer practice credential), not human
// free text through a cookie/JWT session. Its human counterpart,
// src/app/api/mentor/stoa/route.ts, IS the perimeter member above for this
// exact field set, because there the same fields are typed by a human.
// ---------------------------------------------------------------------------

const HUMAN_FACING_POST_ROUTES = [
  'src/app/api/score/route.ts',
  'src/app/api/score-decision/route.ts',
  'src/app/api/score-document/route.ts',
  'src/app/api/score-scenario/route.ts',
  'src/app/api/score-social/route.ts',
  'src/app/api/reason/route.ts',
  'src/app/api/reflect/route.ts',
  'src/app/api/mentor/private/reflect/route.ts',
  // gap-#4 remediation (2026-05-31; AC5 ninth/tenth-route protocol) — the two
  // journal routes accept human free-text and store it; both now screen via
  // `await enforceDistressCheck(detectDistressTwoStage(...))` before storing.
  'src/app/api/mentor/journal-feed/route.ts',
  'src/app/api/journal/route.ts',
  // Foundation Completion Session 2 (2026-07-07; AC5 eleventh-route protocol;
  // closes the S8b 0h-exit blocker (c) — the S8a "inside-perimeter exception"):
  // score-conversation joins the route-level pattern FLAG-GATED behind
  // SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED (dark until the founder-walked
  // activation; flag-off is byte-identical). The AC5-mandated call pattern is
  // asserted below like every other route-level entry; the flag posture is
  // asserted in FLAG_GATED_ROUTE_LEVEL_ROUTES + the per-route test at
  // src/app/api/score-conversation/__tests__/r20a-invocation.test.ts.
  'src/app/api/score-conversation/route.ts',
  // Stoa ST3 (2026-08-03; AC5 twelfth-route protocol): the Stoa declaration
  // route accepts human free text (what_i_bring / what_i_seek /
  // contact_channel — a person's own words about what they carry and what
  // they need) on POST + PATCH and screens it via the mandated
  // `await enforceDistressCheck(detectDistressTwoStage(...))` BEFORE any
  // store write. Dark behind SUBSTRATE_STOA_ENABLED (the whole route 503s
  // flag-off — no separate R20a flag; the route never exists live without
  // its check). The browse route (/api/stoa/entries) takes no free text and
  // stays outside the perimeter (the recorded AC5 decision's other half).
  'src/app/api/mentor/stoa/route.ts',
  // Stoa ST6 (2026-08-03; AC5 thirteenth route-level protocol; the Q12
  // exception): the draft mirror-reading route accepts the SAME human
  // free-text class (what_i_bring / what_i_seek / contact_channel), this
  // time pre-publish, and screens it via the mandated
  // `await enforceDistressCheck(detectDistressTwoStage(...))` BEFORE the
  // mirror-reading LLM call ever fires. Dark behind SUBSTRATE_STOA_ENABLED
  // AND SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED (both required).
  'src/app/api/mentor/stoa/draft-reflect/route.ts',
  // S7 (2026-08-12; AC5 FOURTEENTH route-level protocol) — the primal-impulse
  // examination tool.
  //
  // *** A RULED DEPARTURE FROM FAMILY PRECEDENT (mentor ruling B3). *** Every
  // other Remaining-Principles human-practitioner tool (/premeditatio,
  // /hupexairesis, /oikeiosis, /view-from-above, /morning, /sage-compass,
  // /logos) sits OUTSIDE this perimeter, carrying SupportFooter as its crisis
  // exit. /impulse is INSIDE it, deliberately, because it "deliberately
  // elicits shame and agonia in the practitioner's own words, beside grief,
  // envy, and jealousy" — `aischyne` (shame) and `agonia` (dread) are named,
  // selectable sub-species of the exercise — and "the design premise is that
  // the practitioner should not suppress this material, which means the tool
  // is doing exactly what the perimeter exists to catch when it fires
  // genuinely."
  //
  // Recorded here as well as in the route, in
  // src/app/api/mentor/impulse/r20a.ts, and in the decision-log entry, because
  // a reader comparing this tool to its siblings would otherwise read the
  // membership as an error. DO NOT REMOVE THIS ENTRY on the assumption it was
  // added by mistake.
  //
  // Screens BOTH write paths (POST create + PATCH revise — a revision carries
  // the same free text) via the mandated
  // `await enforceDistressCheck(detectDistressTwoStage(...))`, before the
  // gate's LLM call AND before the route's own field validation. Dark behind
  // SUBSTRATE_IMPULSE_R20A_ENABLED; flag-off is byte-identical.
  'src/app/api/mentor/impulse/route.ts',
  // ── GAP CLOSURE (2026-08-17; AC5 fifteenth through EIGHTEENTH route-level
  // protocol). FOUR routes found in this pass; PR19 then found TWO MORE (the
  // nineteenth + twentieth block below), so the gap totals SIX. Each accepts human
  // practitioner free text behind requireAuth (up to TEXT_LIMITS.medium per
  // field) with NO distress check of any kind, and each absent from this
  // registry — so this battery could not see them.
  //
  // HOW THE GAP AROSE, recorded so the shape is not read as intentional: the
  // 13 sibling skill routes are built on createContextTemplateHandler, which
  // screens at context-template.ts:112. sage-classify and sage-prioritise have
  // their OWN route.ts and inherited nothing. The passion routes never had a
  // shared handler to inherit from.
  //
  // TWO DIFFERENT GROUNDS FOR MEMBERSHIP — do not flatten them:
  //   • passion-classify / passion-log (and the two baseline-response routes)
  //     are ARGUED inside by extending the reasoning of the mentor's B3 ruling.
  //     ⚠ B3 IS SCOPED TO /impulse (S7) ALONE — it says nothing about these
  //     routes. The extension is the BUILDER'S judgement, not a mentor ruling;
  //     ratification is an open mentor question (see r20a-gap-closure.ts, which
  //     states this provenance before making the argument). The argument: their
  //     whole subject is the practitioner's own fear, anger, grief and shame,
  //     and passion-log.false_judgement asks specifically for the belief that
  //     drove it — arguably a purer instance of B3's reasoning than /impulse.
  //   • sage-classify / sage-prioritise are inside on the ordinary ground that
  //     every human-facing free-text evaluation route is inside (the five
  //     score routes, /reflect, the journal routes). A practitioner in crisis
  //     does not confine their words to the routes designed to receive them.
  //
  // The recorded exclusion for the OTHER Remaining-Principles tools
  // (/premeditatio, /hupexairesis, /oikeiosis + /extension, /view-from-above,
  // /morning, /sage-compass, /logos) is UNCHANGED — they remain outside by
  // family precedent, carrying SupportFooter. That standing AC5 question is
  // NOT resolved by this closure.
  //
  // All SIX share ONE flag (SUBSTRATE_R20A_GAP_CLOSURE_ENABLED) rather than
  // one each: they are one remediation of one gap, and a half-closed safety
  // perimeter is worse than a fully-open one because it invites the belief the
  // gap was handled. See src/lib/r20a-gap-closure.ts for the full rationale.
  'src/app/api/mentor/passion-classify/route.ts',
  'src/app/api/mentor/passion-log/route.ts',
  'src/app/api/skill/sage-classify/route.ts',
  'src/app/api/skill/sage-prioritise/route.ts',
  // ── The SAME gap closure, two MORE routes found by the PR19 review of the
  // first four (AC5 nineteenth + twentieth route-level protocol). Both accept
  // an array of practitioner-authored free-text `answer` fields with NO length
  // validation and concatenate them straight into the runSageReason LLM input.
  //
  // The finding that settles it: /api/score-scenario accepts the SAME field
  // shape (a practitioner's free-text answer to a posed question) and DOES call
  // enforceDistressCheck(detectDistressTwoStage(...)). These two did not. The
  // asymmetry between siblings was the tell.
  //
  // Founder-only auth is NOT an exemption for the /private twin:
  // /api/mentor/private/reflect is founder-only and is already a member.
  //
  // ⚠ THE COUNT HAS MOVED THREE TIMES: 2 → 4 (second pass) → 6 (PR19's third,
  // independent pass) → 8 (PR19's FOURTH pass, reviewing the six-route
  // activation, found two more: gap4 + founder-facts, both founder-only).
  // Each pass over a different slice of api/ found more. DO NOT treat 8 as
  // proven final. There is no filesystem-level exhaustiveness check in this
  // file (see the named follow-up in the gap-closure decision-log entry) —
  // this registry is purely additive, so a structurally identical NINTH route
  // would not be caught by anything here.
  'src/app/api/mentor-baseline-response/route.ts',
  'src/app/api/mentor/private/baseline-response/route.ts',
  'src/app/api/mentor/gap4/route.ts',
  'src/app/api/mentor/private/founder-facts/route.ts',
]

// ---------------------------------------------------------------------------
// Flag-gated route-level routes — route-level-pattern perimeter members whose
// check is additionally gated behind a per-route feature flag (dark-build
// posture; the flag defaults OFF and activation is a founder-walked Critical
// step). Each entry pairs the route with the exported flag-check function it
// must import AND call — mirroring the SUBSTRATE_GATE_ROUTES flag assertions.
// The flag lives with its mechanism (see src/lib/score-conversation-r20a.ts).
// ---------------------------------------------------------------------------

interface FlagGatedRouteLevelEntry {
  /** Route source path relative to website/ root. */
  readonly route: string
  /** The exported flag-check function name the route imports + calls. */
  readonly flag: string
  /** The module (import-path fragment) the flag is imported from. */
  readonly flagSource: string
}

const FLAG_GATED_ROUTE_LEVEL_ROUTES: readonly FlagGatedRouteLevelEntry[] = [
  {
    route: 'src/app/api/score-conversation/route.ts',
    flag: 'isScoreConversationR20aEnabled',
    flagSource: 'score-conversation-r20a',
  },
  {
    // Stoa ST3: the route's flag IS the surface flag (SUBSTRATE_STOA_ENABLED
    // via isStoaEnabled) — flag-off the route 503s before any work, so the
    // perimeter check is unconditional on the flag-on path.
    route: 'src/app/api/mentor/stoa/route.ts',
    flag: 'isStoaEnabled',
    flagSource: 'stoa-store',
  },
  {
    // Stoa ST6: gated behind BOTH the base Stoa flag and its own dedicated
    // sub-flag — two entries, same route, one per flag (the interface only
    // carries one flag per entry; the loop below checks each independently).
    route: 'src/app/api/mentor/stoa/draft-reflect/route.ts',
    flag: 'isStoaEnabled',
    flagSource: 'stoa-store',
  },
  {
    route: 'src/app/api/mentor/stoa/draft-reflect/route.ts',
    flag: 'isStoaDraftReflectEnabled',
    flagSource: 'stoa-draft-reflect',
  },
  {
    // S7 /impulse — the flag lives with its mechanism in a module COLOCATED
    // with the route (src/app/api/mentor/impulse/r20a.ts) rather than in
    // src/lib/, so the whole tool reverts as one unit. Imported as './r20a';
    // route.ts cannot export it itself (Next.js rejects non-handler exports
    // from route.ts at build — memory: nextjs-route-export-validation).
    route: 'src/app/api/mentor/impulse/route.ts',
    flag: 'isImpulseR20aEnabled',
    flagSource: './r20a',
  },
  // ── GAP CLOSURE (2026-08-17): all SIX share ONE flag, deliberately, so the
  // perimeter cannot be half-closed by a forgotten flag. Unlike /impulse the
  // module lives in src/lib/ rather than colocated, because it serves routes in
  // two different trees (api/mentor/ and api/skill/).
  {
    route: 'src/app/api/mentor/passion-classify/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/mentor/passion-log/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/skill/sage-classify/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/skill/sage-prioritise/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    // PR19-found, same gap, same flag.
    route: 'src/app/api/mentor-baseline-response/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    route: 'src/app/api/mentor/private/baseline-response/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    // PR19-found, session's activation review, gap 7 — founder-only is not an
    // exemption.
    route: 'src/app/api/mentor/gap4/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
  {
    // PR19-found gap 8 (POST) + builder-found while wiring it (PUT). Two
    // guarded handlers, ONE flag import — a single entry covers both per this
    // interface's per-route (not per-handler) shape; the per-route source-grep
    // below matches once regardless of how many exported functions call it.
    route: 'src/app/api/mentor/private/founder-facts/route.ts',
    flag: 'isR20aGapClosureEnabled',
    flagSource: 'r20a-gap-closure',
  },
]

// ---------------------------------------------------------------------------
// Substrate-gate routes — perimeter additions catching distress via the A7
// substrate gate (enforceLayer2R20aGate). A7 internally invokes
// detectDistressTwoStage via SafetyCriticalCallParams (Haiku), so the
// underlying safety classifier is the same; only the surface call pattern
// differs. Added under the Option A build arc (D-R20A-SC1-...-2026-05-28
// design spec §5.2 + §5.3); each entry here joins the R20a perimeter as the
// ninth+ route per AC5's ninth/tenth-route protocol.
//
// Each entry pairs a route source path with its per-route feature-flag name
// (the flag the route imports + calls from substrate/r20a-gate). The four
// test.each blocks below assert both surfaces — import + call — for each
// entry. Per-route flags decouple activations across endpoints per design
// spec §5.6 (Calling's flag is independent of Reflect-content's flag is
// independent of A7's flag).
// ---------------------------------------------------------------------------

interface SubstrateGateRouteEntry {
  /** Route source path relative to website/ root. */
  readonly route: string
  /** The exported flag-check function name the route imports + calls. */
  readonly flag: string
}

const SUBSTRATE_GATE_ROUTES: readonly SubstrateGateRouteEntry[] = [
  { route: 'src/app/api/calling/route.ts', flag: 'isCallingR20aEnabled' },
  { route: 'src/app/api/practice/reflect/route.ts', flag: 'isReflectR20aEnabled' },
]

// ---------------------------------------------------------------------------
// The function that MUST be present — both import and call
// ---------------------------------------------------------------------------

const REQUIRED_FUNCTION = 'detectDistressTwoStage'
const REQUIRED_IMPORT_SOURCE = 'r20a-classifier'

// Task 3 addition: the safety gate wrapper that enforces synchronous execution
const REQUIRED_GATE_FUNCTION = 'enforceDistressCheck'
const REQUIRED_GATE_SOURCE = 'constraints'

// Substrate-gate addition: the A7 entry point reused by Option A perimeter routes
const REQUIRED_SUBSTRATE_GATE_FUNCTION = 'enforceLayer2R20aGate'
const REQUIRED_SUBSTRATE_GATE_SOURCE = 'substrate/r20a-gate'
// Per-route flag names are carried on each SubstrateGateRouteEntry (see above).

// websiteRoot — original test resolves from __dirname (.. .. ..) i.e. website/.
const websiteRoot = path.resolve(__dirname, '..', '..', '..')

/**
 * Strip TS comments before any CALL-site check (ST3 fold, 2026-08-03 — a
 * live mutation proved the raw-source call checks were COMMENT-SATISFIABLE:
 * a route whose documentation quotes the AC5 pattern kept passing this guard
 * with the real call mutated away; the guard-non-vacuity lesson). Import
 * checks stay on raw source (import lines are code). Strictly tightening —
 * every registered route re-verified green after the fold.
 *
 * Known corruption classes (PR19 review, 2026-08-03 — none currently trip):
 * a '//' inside a non-protocol string literal truncates that line, and a
 * regex literal containing '/*' opens a phantom block comment. Both fail in
 * the SAFE direction (a swallowed real call site goes loudly red, never a
 * vacuous pass); revisit only if a registered route ever carries such text.
 */
function stripComments(ts: string): string {
  return ts.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
}

// ---------------------------------------------------------------------------
// R20a Safety Invocation Guard
// ---------------------------------------------------------------------------

// test.each(HUMAN_FACING_POST_ROUTES): '%s imports detectDistressTwoStage from r20a-classifier'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} imports detectDistressTwoStage from r20a-classifier`
  const fullPath = path.join(websiteRoot, routePath)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  // Check import statement
  const hasImport =
    source.includes(`import`) &&
    source.includes(REQUIRED_FUNCTION) &&
    source.includes(REQUIRED_IMPORT_SOURCE)

  assert(hasImport === true, `${label} (hasImport)`)
}

// test.each(HUMAN_FACING_POST_ROUTES): '%s calls detectDistressTwoStage (not just imports it)'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} calls detectDistressTwoStage (not just imports it)`
  const fullPath = path.join(websiteRoot, routePath)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  // Remove import lines to isolate call sites
  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  // The function must appear in the body (as a call, not just an import)
  const hasCall = bodySource.includes(REQUIRED_FUNCTION)

  assert(hasCall === true, label)
}

// test('No human-facing POST route is missing from the registry')
{
  const label = 'R20a Safety Invocation Guard: No human-facing POST route is missing from the registry'
  // This test is a reminder, not an automated check.
  // It documents the routes that were verified at the time of writing.
  // When adding a new human-facing POST endpoint, add it to
  // HUMAN_FACING_POST_ROUTES above.
  //
  // Current count: 20 route-level routes (8 as of 18 April 2026 + the two
  // journal routes added 2026-05-31 under the gap-#4 remediation, AC5
  // ninth/tenth-route protocol + score-conversation added 2026-07-07 under
  // the AC5 eleventh-route protocol, flag-gated dark + the Stoa declaration
  // route added 2026-08-03 under the AC5 twelfth-route protocol, flag-gated
  // dark behind SUBSTRATE_STOA_ENABLED + the Stoa draft-reflect route added
  // 2026-08-03 (ST6, the Q12 exception) under the AC5 thirteenth-route
  // protocol, flag-gated dark behind SUBSTRATE_STOA_ENABLED AND
  // SUBSTRATE_STOA_DRAFT_REFLECT_ENABLED + /impulse added 2026-08-12 (S7)
  // under the AC5 fourteenth-route protocol, flag-gated dark behind
  // SUBSTRATE_IMPULSE_R20A_ENABLED — a RULED DEPARTURE from the
  // Remaining-Principles family precedent, see its entry above)
  // + 2 substrate-gate routes (Calling + Reflect-content added 2026-05-28
  // under Option A; see SUBSTRATE_GATE_ROUTES)
  // = 22 routes in the R20a perimeter overall (20 route-level + 2 substrate-gate;
  // the six 2026-08-17 gap-closure routes took it from 14 to 20).
  //
  // The floors are bumped with each addition on purpose: a floor left at the
  // PREVIOUS count stops guarding the newest member (13 >= 13 still passes
  // after the 14th is deleted), which is the one most likely to be removed by
  // someone who reads its perimeter membership as a mistake.
  //
  // ⚠ BUMPED 2026-08-17 (14 -> 20, 5 -> 11) — AND THE MISS IS RECORDED, because
  // it is the exact failure this comment warns about. The six gap-closure routes
  // were added to both registries while these floors were left at 14 and 5, so
  // for a short window all six could have been deleted with the battery still
  // passing. Caught by an independent records-verification pass, not by the
  // battery itself. **Bump BOTH floors in the same edit as any registry
  // addition — the comment above is not advisory.**
  //
  // ⚠ BUMPED AGAIN, same day, same session (20 -> 22, 11 -> 13) — PR19's fourth
  // pass found gap4 + founder-facts. This time the floors were bumped in the
  // SAME edit that added the routes, per the standing lesson above.
  assert(HUMAN_FACING_POST_ROUTES.length >= 22, `${label} (>=22 route-level)`)
  assert(SUBSTRATE_GATE_ROUTES.length >= 2, `${label} (>=2 substrate-gate)`)
  // FLAG_GATED_ROUTE_LEVEL_ROUTES had no count assertion at all until 2026-08-12,
  // so a flag-gated entry could be deleted silently. 13 flag-pairs across 12
  // distinct routes (draft-reflect carries two flags, one entry each).
  assert(FLAG_GATED_ROUTE_LEVEL_ROUTES.length >= 13, `${label} (>=13 flag-gated route-level flag-pairs)`)
}

// test('detectDistressTwoStage result is awaited (async safety)')
{
  const label = 'R20a Safety Invocation Guard: detectDistressTwoStage result is awaited (async safety)'
  // The classifier MUST run synchronously (awaited) before the response
  // is constructed. This checks that the call uses `await`.
  for (const routePath of HUMAN_FACING_POST_ROUTES) {
    const fullPath = path.join(websiteRoot, routePath)
    const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

    // Look for `await enforceDistressCheck(detectDistressTwoStage(` — the Task 3 pattern
    // OR the original `await detectDistressTwoStage(` pattern for backward compatibility
    const hasAwaitedCall =
      /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(source) ||
      /await\s+detectDistressTwoStage\s*\(/.test(source)

    assert(hasAwaitedCall === true, `${label} — ${routePath}`)
  }
}

// test.each(HUMAN_FACING_POST_ROUTES): '%s imports enforceDistressCheck from constraints (Task 3 — synchronous enforcement)'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} imports enforceDistressCheck from constraints (Task 3 — synchronous enforcement)`
  const fullPath = path.join(websiteRoot, routePath)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  // Check import of the safety gate wrapper
  const hasGateImport =
    source.includes('import') &&
    source.includes(REQUIRED_GATE_FUNCTION) &&
    source.includes(REQUIRED_GATE_SOURCE)

  assert(hasGateImport === true, `${label} (hasGateImport)`)
}

// test.each(HUMAN_FACING_POST_ROUTES): '%s calls enforceDistressCheck wrapping detectDistressTwoStage (Task 3 — compile-time gate)'
for (const routePath of HUMAN_FACING_POST_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${routePath} calls enforceDistressCheck wrapping detectDistressTwoStage (Task 3 — compile-time gate)`
  const fullPath = path.join(websiteRoot, routePath)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  // The enforceDistressCheck(detectDistressTwoStage(...)) pattern must be present
  const hasGateCall = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(source)

  assert(hasGateCall === true, label)
}

// -------------------------------------------------------------------------
// SUBSTRATE-GATE ROUTES (Option A build arc, 2026-05-28; ninth+ route)
//
// Calling and other future substrate-consuming routes catch distress via
// enforceLayer2R20aGate (A7) rather than the route-level pattern. The
// underlying classifier (detectDistressTwoStage via Haiku) is identical;
// the surface call shape is different because A7 sits at the substrate's
// Layer 2 boundary, not at the route's edge.
//
// Each substrate-gate route MUST:
//   1. Import enforceLayer2R20aGate from @/lib/substrate/r20a-gate
//   2. Import its own substrate-gate flag check (e.g. isCallingR20aEnabled)
//      from the same source — so the catch is feature-flagged
//   3. Call enforceLayer2R20aGate, awaited (PR3 — synchronous safety)
//   4. Gate the call site behind the flag check (so production with the
//      flag UNSET is byte-identical to pre-Option-A behaviour)
// -------------------------------------------------------------------------

// test.each(SUBSTRATE_GATE_ROUTES): '$route imports enforceLayer2R20aGate from substrate/r20a-gate (Option A — substrate-gate pattern)'
for (const { route } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} imports enforceLayer2R20aGate from substrate/r20a-gate (Option A — substrate-gate pattern)`
  const fullPath = path.join(websiteRoot, route)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  const hasImport =
    source.includes('import') &&
    source.includes(REQUIRED_SUBSTRATE_GATE_FUNCTION) &&
    source.includes(REQUIRED_SUBSTRATE_GATE_SOURCE)

  assert(hasImport === true, `${label} (hasImport)`)
}

// test.each(SUBSTRATE_GATE_ROUTES): '$route imports its substrate-gate feature flag $flag from substrate/r20a-gate (Option A — feature-gated catch)'
for (const { route, flag } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} imports its substrate-gate feature flag ${flag} from substrate/r20a-gate (Option A — feature-gated catch)`
  const fullPath = path.join(websiteRoot, route)
  const source = fs.readFileSync(fullPath, 'utf-8')

  // Each substrate-gate route names its own feature flag check (mirroring
  // isSubstrateR20aGateEnabled for A7). The check MUST be imported from
  // substrate/r20a-gate so the perimeter's flag surface is centralised.
  // Per-route flag names decouple activations across endpoints per design
  // spec §5.6 (Calling, Reflect-content, and A7 each have independent flags).
  const hasFlagImport =
    source.includes('import') &&
    source.includes(flag) &&
    source.includes(REQUIRED_SUBSTRATE_GATE_SOURCE)

  assert(hasFlagImport === true, label)
}

// test.each(SUBSTRATE_GATE_ROUTES): '$route calls enforceLayer2R20aGate awaited (PR3 — synchronous safety)'
for (const { route } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} calls enforceLayer2R20aGate awaited (PR3 — synchronous safety)`
  const fullPath = path.join(websiteRoot, route)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  // The function must be CALLED in the body (not merely imported), and
  // the call must be awaited (PR3 — no fire-and-forget on safety paths).
  const hasAwaitedCall = /await\s+enforceLayer2R20aGate\s*\(/.test(bodySource)

  assert(hasAwaitedCall === true, label)
}

// test.each(SUBSTRATE_GATE_ROUTES): '$route gates the enforceLayer2R20aGate call behind its substrate-gate flag $flag (feature flag check present)'
for (const { route, flag } of SUBSTRATE_GATE_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} gates the enforceLayer2R20aGate call behind its substrate-gate flag ${flag} (feature flag check present)`
  const fullPath = path.join(websiteRoot, route)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  // The flag function MUST be CALLED in the body (not just imported).
  // This guards the production default-OFF posture.
  const hasFlagCall = new RegExp(`${flag}\\s*\\(`).test(bodySource)

  assert(hasFlagCall === true, label)
}

// -------------------------------------------------------------------------
// FLAG-GATED ROUTE-LEVEL ROUTES (2026-07-07; AC5 eleventh-route protocol)
//
// These perimeter members carry the full route-level pattern (asserted by
// the HUMAN_FACING_POST_ROUTES blocks above) AND gate it behind a per-route
// feature flag for the dark-build posture. Each MUST:
//   1. Import its flag-check function from the named module
//   2. Call the flag check in the route body (not just import it)
// The flag semantics themselves (unset/false/'1' → OFF; 'true' → ON) are
// asserted in the per-route test under the route's __tests__/ folder.
// -------------------------------------------------------------------------

for (const { route, flag, flagSource } of FLAG_GATED_ROUTE_LEVEL_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} imports its route-level feature flag ${flag} from ${flagSource}`
  const fullPath = path.join(websiteRoot, route)
  assert(fs.existsSync(fullPath) === true, `${label} (file exists)`)

  const source = fs.readFileSync(fullPath, 'utf-8')

  const hasFlagImport =
    source.includes('import') &&
    source.includes(flag) &&
    source.includes(flagSource)

  assert(hasFlagImport === true, label)
}

for (const { route, flag } of FLAG_GATED_ROUTE_LEVEL_ROUTES) {
  const label = `R20a Safety Invocation Guard: ${route} calls its route-level feature flag ${flag} in the body (flag check, not just import)`
  const fullPath = path.join(websiteRoot, route)
  const source = stripComments(fs.readFileSync(fullPath, 'utf-8'))

  const lines = source.split('\n')
  const nonImportLines = lines.filter(
    (line) => !line.trim().startsWith('import ')
  )
  const bodySource = nonImportLines.join('\n')

  const hasFlagCall = new RegExp(`${flag}\\s*\\(\\s*\\)`).test(bodySource)

  assert(hasFlagCall === true, label)
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
