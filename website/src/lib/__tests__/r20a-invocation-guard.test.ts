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
 * Run: npx jest r20a-invocation-guard --no-coverage
 *
 * Rules served: R20a (vulnerable user detection and redirection); AC4 (invocation
 * testing); AC5 (perimeter — eight route-level + one substrate-gate = nine).
 * Knowledge gaps addressed: KG3, KG7 (build-to-wire gap pattern).
 */

import * as fs from 'fs'
import * as path from 'path'

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

describe('R20a Safety Invocation Guard', () => {
  const websiteRoot = path.resolve(__dirname, '..', '..', '..')

  test.each(HUMAN_FACING_POST_ROUTES)(
    '%s imports detectDistressTwoStage from r20a-classifier',
    (routePath) => {
      const fullPath = path.join(websiteRoot, routePath)
      expect(fs.existsSync(fullPath)).toBe(true)

      const source = fs.readFileSync(fullPath, 'utf-8')

      // Check import statement
      const hasImport =
        source.includes(`import`) &&
        source.includes(REQUIRED_FUNCTION) &&
        source.includes(REQUIRED_IMPORT_SOURCE)

      expect(hasImport).toBe(true)
    }
  )

  test.each(HUMAN_FACING_POST_ROUTES)(
    '%s calls detectDistressTwoStage (not just imports it)',
    (routePath) => {
      const fullPath = path.join(websiteRoot, routePath)
      const source = fs.readFileSync(fullPath, 'utf-8')

      // Remove import lines to isolate call sites
      const lines = source.split('\n')
      const nonImportLines = lines.filter(
        (line) => !line.trim().startsWith('import ')
      )
      const bodySource = nonImportLines.join('\n')

      // The function must appear in the body (as a call, not just an import)
      const hasCall = bodySource.includes(REQUIRED_FUNCTION)

      expect(hasCall).toBe(true)
    }
  )

  test('No human-facing POST route is missing from the registry', () => {
    // This test is a reminder, not an automated check.
    // It documents the routes that were verified at the time of writing.
    // When adding a new human-facing POST endpoint, add it to
    // HUMAN_FACING_POST_ROUTES above.
    //
    // Current count: 8 route-level routes (as of 18 April 2026) + 2
    // substrate-gate routes (Calling added 2026-05-28 under Option A
    // session 2; Reflect-content added 2026-05-28 under Option A session 3;
    // see SUBSTRATE_GATE_ROUTES) = 10 routes in the R20a perimeter overall.
    expect(HUMAN_FACING_POST_ROUTES.length).toBeGreaterThanOrEqual(8)
    expect(SUBSTRATE_GATE_ROUTES.length).toBeGreaterThanOrEqual(2)
  })

  test('detectDistressTwoStage result is awaited (async safety)', () => {
    // The classifier MUST run synchronously (awaited) before the response
    // is constructed. This checks that the call uses `await`.
    for (const routePath of HUMAN_FACING_POST_ROUTES) {
      const fullPath = path.join(websiteRoot, routePath)
      const source = fs.readFileSync(fullPath, 'utf-8')

      // Look for `await enforceDistressCheck(detectDistressTwoStage(` — the Task 3 pattern
      // OR the original `await detectDistressTwoStage(` pattern for backward compatibility
      const hasAwaitedCall =
        /await\s+enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(source) ||
        /await\s+detectDistressTwoStage\s*\(/.test(source)

      expect(hasAwaitedCall).toBe(true)
    }
  })

  test.each(HUMAN_FACING_POST_ROUTES)(
    '%s imports enforceDistressCheck from constraints (Task 3 — synchronous enforcement)',
    (routePath) => {
      const fullPath = path.join(websiteRoot, routePath)
      expect(fs.existsSync(fullPath)).toBe(true)

      const source = fs.readFileSync(fullPath, 'utf-8')

      // Check import of the safety gate wrapper
      const hasGateImport =
        source.includes('import') &&
        source.includes(REQUIRED_GATE_FUNCTION) &&
        source.includes(REQUIRED_GATE_SOURCE)

      expect(hasGateImport).toBe(true)
    }
  )

  test.each(HUMAN_FACING_POST_ROUTES)(
    '%s calls enforceDistressCheck wrapping detectDistressTwoStage (Task 3 — compile-time gate)',
    (routePath) => {
      const fullPath = path.join(websiteRoot, routePath)
      const source = fs.readFileSync(fullPath, 'utf-8')

      // The enforceDistressCheck(detectDistressTwoStage(...)) pattern must be present
      const hasGateCall = /enforceDistressCheck\s*\(\s*detectDistressTwoStage\s*\(/.test(source)

      expect(hasGateCall).toBe(true)
    }
  )

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

  test.each(SUBSTRATE_GATE_ROUTES)(
    '$route imports enforceLayer2R20aGate from substrate/r20a-gate (Option A — substrate-gate pattern)',
    ({ route }) => {
      const fullPath = path.join(websiteRoot, route)
      expect(fs.existsSync(fullPath)).toBe(true)

      const source = fs.readFileSync(fullPath, 'utf-8')

      const hasImport =
        source.includes('import') &&
        source.includes(REQUIRED_SUBSTRATE_GATE_FUNCTION) &&
        source.includes(REQUIRED_SUBSTRATE_GATE_SOURCE)

      expect(hasImport).toBe(true)
    }
  )

  test.each(SUBSTRATE_GATE_ROUTES)(
    '$route imports its substrate-gate feature flag $flag from substrate/r20a-gate (Option A — feature-gated catch)',
    ({ route, flag }) => {
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

      expect(hasFlagImport).toBe(true)
    }
  )

  test.each(SUBSTRATE_GATE_ROUTES)(
    '$route calls enforceLayer2R20aGate awaited (PR3 — synchronous safety)',
    ({ route }) => {
      const fullPath = path.join(websiteRoot, route)
      const source = fs.readFileSync(fullPath, 'utf-8')

      const lines = source.split('\n')
      const nonImportLines = lines.filter(
        (line) => !line.trim().startsWith('import ')
      )
      const bodySource = nonImportLines.join('\n')

      // The function must be CALLED in the body (not merely imported), and
      // the call must be awaited (PR3 — no fire-and-forget on safety paths).
      const hasAwaitedCall = /await\s+enforceLayer2R20aGate\s*\(/.test(bodySource)

      expect(hasAwaitedCall).toBe(true)
    }
  )

  test.each(SUBSTRATE_GATE_ROUTES)(
    '$route gates the enforceLayer2R20aGate call behind its substrate-gate flag $flag (feature flag check present)',
    ({ route, flag }) => {
      const fullPath = path.join(websiteRoot, route)
      const source = fs.readFileSync(fullPath, 'utf-8')

      const lines = source.split('\n')
      const nonImportLines = lines.filter(
        (line) => !line.trim().startsWith('import ')
      )
      const bodySource = nonImportLines.join('\n')

      // The flag function MUST be CALLED in the body (not just imported).
      // This guards the production default-OFF posture.
      const hasFlagCall = new RegExp(`${flag}\\s*\\(`).test(bodySource)

      expect(hasFlagCall).toBe(true)
    }
  )
})
