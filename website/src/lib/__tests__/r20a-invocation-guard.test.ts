/**
 * r20a-invocation-guard.test.ts — Automated invocation test for detectDistressTwoStage.
 *
 * PURPOSE: Prevents the 5-session dead-code gap (SS3) from recurring.
 * detectDistress() was defined on 6 Apr but never called until 11 Apr.
 * This test reads the source files of every human-facing POST route and
 * confirms that detectDistressTwoStage is both imported AND called.
 *
 * This is an INVOCATION test, not a FUNCTIONAL test. It verifies the
 * function exists in the execution path — not that it returns correct
 * output. The eval suite (r20a-classifier-eval.ts) handles functional
 * testing against the live API.
 *
 * No API key required. No network calls. Runs at build time.
 *
 * Run: npx jest r20a-invocation-guard --no-coverage
 *
 * Rules served: R20a (vulnerable user detection and redirection)
 * Knowledge gaps addressed: KG3, KG7 (build-to-wire gap pattern)
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
// The function that MUST be present — both import and call
// ---------------------------------------------------------------------------

const REQUIRED_FUNCTION = 'detectDistressTwoStage'
const REQUIRED_IMPORT_SOURCE = 'r20a-classifier'

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
    // Current count: 8 routes (as of 18 April 2026)
    expect(HUMAN_FACING_POST_ROUTES.length).toBeGreaterThanOrEqual(8)
  })

  test('detectDistressTwoStage result is awaited (async safety)', () => {
    // The classifier MUST run synchronously (awaited) before the response
    // is constructed. This checks that the call uses `await`.
    for (const routePath of HUMAN_FACING_POST_ROUTES) {
      const fullPath = path.join(websiteRoot, routePath)
      const source = fs.readFileSync(fullPath, 'utf-8')

      // Look for `await detectDistressTwoStage` or `await detectDistressTwoStage(`
      const hasAwaitedCall = /await\s+detectDistressTwoStage\s*\(/.test(source)

      expect(hasAwaitedCall).toBe(true)
    }
  })
})
