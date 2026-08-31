/**
 * score-save-response.test.ts — the RESPONSE-HANDLING layer of the
 * /api/score/save perimeter, which is the layer the 2026-08-31 revert was
 * actually about.
 *
 * The mentor's ruling puts it explicitly in scope: "the calling page's handling
 * of that response is in scope for the PR19 review — the prior implementation's
 * failure was at the response-handling layer, and the review must verify that
 * layer explicitly, not only the detection layer."
 *
 * Two halves:
 *   §1-§3  unit tests of the pure discriminator (every response shape the route
 *          can actually produce, plus the malformed ones it cannot).
 *   §4     a STRUCTURAL pin on score/page.tsx proving the distress branch sits
 *          BEFORE setSaved(true) and before the /api/milestones POST, so both
 *          are unreachable on a distress response. Source-index ordering is
 *          normally a weak assertion, but here both statements live in the SAME
 *          function body, so their relative order is exactly what determines
 *          reachability.
 *
 * Run: npx tsx src/lib/__tests__/score-save-response.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import {
  classifySaveResponse,
  readSaveDistressPayload,
  readSaveSupportMessage,
} from '../score-save-response'

let passed = 0
let failed = 0
const failures: string[] = []

function assert(condition: boolean, label: string): void {
  if (condition) {
    passed++
  } else {
    failed++
    failures.push(label)
    console.error('FAIL: ' + label)
  }
}

const websiteRoot = path.resolve(__dirname, '..', '..', '..')

const DISTRESS_BODY = {
  distress_detected: true,
  severity: 'acute',
  redirect_message: 'We have paused this evaluation. Support is available: …',
}

// ── §1 The three real response shapes ──────────────────────────────────────
assert(
  classifySaveResponse(422, DISTRESS_BODY) === 'distress',
  '§1-1: 422 + distress body => distress'
)
assert(
  classifySaveResponse(200, { success: true, id: 'abc' }) === 'ok',
  '§1-2: 200 + success body => ok'
)
assert(
  classifySaveResponse(500, { error: 'Failed to save evaluation' }) === 'error',
  '§1-3: 500 + error body => error'
)
assert(
  classifySaveResponse(400, { error: 'action is required' }) === 'error',
  '§1-4: a validation 400 is an error, NOT distress — the practitioner must be told which'
)

// ── §2 The discriminator keys on the BODY, not the status ──────────────────
// If a future change altered the status, keying on status would silently
// resume showing a scoring card to someone in crisis. Keying on the body means
// the status can move without the safety property moving.
assert(
  classifySaveResponse(200, DISTRESS_BODY) === 'distress',
  '§2-1: a distress body is distress even on a 200 — the exact reverted-implementation shape, now handled safely'
)
assert(
  classifySaveResponse(409, DISTRESS_BODY) === 'distress',
  '§2-2: a distress body is distress on any status'
)

// ── §3 Malformed and hostile shapes degrade to `error`, never to `ok` ───────
// `error` is wrong-but-safe: it shows a failure message rather than "saved".
// The one thing that must never happen is a distress response read as success.
for (const [label, body] of [
  ['null body (unparseable)', null],
  ['undefined body', undefined],
  ['a bare string', 'not an object'],
  ['an array', []],
  ['flag true but NO message', { distress_detected: true, severity: 'acute' }],
  ['flag true but EMPTY message', { distress_detected: true, redirect_message: '   ' }],
  ['flag as the string "true"', { distress_detected: 'true', redirect_message: 'x' }],
  ['flag truthy-but-not-true', { distress_detected: 1, redirect_message: 'x' }],
] as const) {
  assert(
    classifySaveResponse(422, body) !== 'ok',
    `§3-${label}: never classified as ok on a non-2xx`
  )
}
assert(
  classifySaveResponse(422, { distress_detected: true, severity: 'acute' }) === 'error',
  '§3-1: a distress FLAG with no crisis message is an error, not distress — a crisis card with nothing in it is silence where support should be'
)
assert(
  classifySaveResponse(200, null) === 'ok',
  '§3-2: an unreadable body on a 2xx is still ok (the save genuinely happened)'
)

// ── §4 Payload + support extraction ────────────────────────────────────────
assert(
  readSaveDistressPayload(DISTRESS_BODY).severity === 'acute',
  '§4-1: severity is read from the body'
)
assert(
  readSaveDistressPayload({ redirect_message: 'x' }).severity === 'acute',
  '§4-2: a missing severity falls back to acute — the SAFE direction, never a lower severity'
)
assert(
  readSaveSupportMessage({ success: true, support_resources: { message: 'take care' } }) === 'take care',
  '§4-3: the mild support message is extracted from a success body'
)
assert(
  readSaveSupportMessage({ success: true }) === null,
  '§4-4: absent support_resources => null (silence is an absent field)'
)
assert(
  readSaveSupportMessage({ success: true, support_resources: { message: '  ' } }) === null,
  '§4-5: a blank support message is treated as absent, not rendered as an empty card'
)

// ── §5 STRUCTURAL PIN on the calling page ──────────────────────────────────
// The revert's dispositive defect was that setSaved(true) ran on a record that
// was never written. These assertions make that unreachable BY ORDER, and both
// statements sit in the same function body so the ordering is meaningful.
{
  const pageSrc = fs.readFileSync(path.join(websiteRoot, 'src/app/score/page.tsx'), 'utf-8')

  const distressBranch = pageSrc.indexOf("if (kind === 'distress')")
  const setSavedTrue = pageSrc.indexOf('setSaved(true)')
  const milestonesPost = pageSrc.indexOf("authFetch('/api/milestones'")

  assert(distressBranch !== -1, "§5-1: score/page.tsx carries the kind === 'distress' branch")
  assert(setSavedTrue !== -1, '§5-2: score/page.tsx still calls setSaved(true) somewhere (control — the pin is not vacuous)')
  assert(milestonesPost !== -1, '§5-3: score/page.tsx still POSTs to /api/milestones (control)')
  assert(
    distressBranch !== -1 && setSavedTrue !== -1 && distressBranch < setSavedTrue,
    '§5-4: the distress branch precedes setSaved(true) — a refused save can never report "saved"'
  )
  assert(
    distressBranch !== -1 && milestonesPost !== -1 && distressBranch < milestonesPost,
    '§5-5: the distress branch precedes the /api/milestones POST — a refused save awards no milestone'
  )
  // ⚠ §5-6 AND §5-11 ARE SCOPED TO THE BRANCH BODY, NOT THE FILE.
  //
  // PR19 (2026-08-31) mutation-proved the file-wide form of §5-6 VACUOUS: it
  // asserted `pageSrc.includes('setResult(null)')`, which is satisfied by
  // handleEvaluate's preamble ~114 lines earlier. Deleting setResult(null) from
  // the DISTRESS BRANCH left this suite at 31/0 — while a practitioner in acute
  // distress would have seen the full scoring card rendered beneath the crisis
  // message, since {result} renders independently of {distressRedirect}.
  //
  // The same reviewer found that setDistressRedirect(payload) — the single line
  // that actually puts crisis resources on screen — had NO coverage at all:
  // replacing it with `void payload` left every battery green.
  //
  // Both are now asserted against the SLICE of source between the branch and
  // its return. A file-wide `includes` on a statement that legitimately appears
  // elsewhere proves nothing about the branch, which is this project's standing
  // lesson about presence-greps stated in a new place.
  const branchStart = pageSrc.indexOf("if (kind === 'distress')")
  const branchEnd = branchStart === -1 ? -1 : pageSrc.indexOf('return', branchStart)
  const branchBody = branchStart !== -1 && branchEnd !== -1 ? pageSrc.slice(branchStart, branchEnd) : ''

  assert(branchBody.length > 0, '§5-6a: located the distress branch body (pin is not vacuous)')
  assert(
    branchBody.includes('setResult(null)'),
    '§5-6: the DISTRESS BRANCH clears `result` — {result} renders independently of {distressRedirect}, so a scoring card would otherwise sit beneath the crisis message'
  )
  assert(
    branchBody.includes('setDistressRedirect('),
    '§5-11: the DISTRESS BRANCH calls setDistressRedirect — the one line that actually renders crisis resources; PR19 proved its removal left every battery green'
  )
  assert(
    branchBody.includes('setSaved(false)'),
    '§5-12: the DISTRESS BRANCH clears `saved` — the reverted build\'s dispositive defect was the word "saved" on an unwritten record'
  )
  assert(
    !/setSaved\(true\)/.test(branchBody),
    '§5-13: the DISTRESS BRANCH never sets saved true'
  )
  assert(
    /if \(kind === 'distress'\)[\s\S]{0,700}?setLoading\(false\)[\s\S]{0,40}?return/.test(pageSrc),
    '§5-7: the distress branch calls setLoading(false) BEFORE returning — the trailing setLoading(false) is after the try block and an early return would skip it, stranding the practitioner on a spinner'
  )
  assert(
    pageSrc.includes('const saveBody = await saveRes.json().catch(() => null)'),
    '§5-8: the save response body is read exactly once (a Response body is single-use)'
  )
  assert(
    !/const error = saveRes\.ok \? null/.test(pageSrc),
    '§5-9: the old `saveRes.ok`-only discriminator is GONE — it is what read the 200 redirect as success'
  )
  assert(
    pageSrc.includes('{supportMessage && ('),
    '§5-10: the mild support message is RENDERED, not returned into a dead path'
  )
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
