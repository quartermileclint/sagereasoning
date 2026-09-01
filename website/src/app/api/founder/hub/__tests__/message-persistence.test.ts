/**
 * message-persistence.test.ts — regression pin for a silent-write-failure
 * defect found and fixed 2026-09-01 in POST /api/founder/hub.
 *
 * ===========================================================================
 * THE BUG, and why this class of defect keeps recurring in this codebase
 * ===========================================================================
 *
 * The founder reported: the /private-mentor page had lost some of yesterday's
 * mentor responses, and today's exchange was not retained across a page
 * refresh. Root cause: every `.insert()` into `founder_conversation_messages`
 * in this route was `await`ed with its `{ error }` result discarded —
 *
 *   await supabaseAdmin.from('founder_conversation_messages').insert({...})
 *
 * — so a failed write never threw, never logged, and never surfaced to the
 * caller. The mentor's reply is built entirely from the Anthropic call's own
 * return value (`primaryResponse.content`) and rendered client-side without
 * ever being re-fetched from the database, so a failed persistence write was
 * completely invisible in the same session — the exchange looked saved right
 * up until the next page load, when `loadConversation()` re-reads from the
 * DB and the messages that were never actually written are simply gone.
 *
 * THIS IS THE THIRD INSTANCE of this exact failure class in this codebase:
 *   1. action_evaluations_v3 — every human score save failed silently for
 *      four months (2026-03-21 -> 07-26), `if (!error) setSaved(true)` with
 *      no else branch. Fixed by failing loud; regression-pinned by
 *      action-evaluations-v3-schema-drift.test.ts's LOUD-1/LOUD-2.
 *   2. Sage Reflect completion — a schema-drift 503 on every completion,
 *      latent because the path was never exercised in prod.
 *   3. This one.
 *
 * The fix (route.ts, 2026-09-01): every insert now destructures `{ error }`.
 * The two CRITICAL saves — the founder's own message, and the primary agent's
 * response, the two halves of the exchange the founder actually sees — now
 * THROW on a write error, routing through the route's own existing
 * `debugStep` catch handler (which already reports the failed step + detail;
 * no new response shape was needed). The supplementary saves (observer
 * contributions, the ops recommended-action note, the conversation's
 * `updated_at` bump) log loudly rather than throw, matching the non-blocking
 * posture the surrounding observer-fetch code already uses — losing an
 * observer's aside should not fail the whole exchange the way losing the
 * founder's own message would.
 *
 * ===========================================================================
 * WHY THIS IS A SOURCE-PATTERN TEST AND NOT A FULL EXECUTION HARNESS
 * ===========================================================================
 *
 * This route is 1700+ lines, constructs a real Anthropic client, and fans out
 * to observer agents and a recommended-action synthesis pass. A full
 * require.cache-stubbed execution harness (the idiom this session used for
 * /api/score/save, a much smaller route) would need to stub the Anthropic SDK
 * across every one of those call paths — disproportionate to a fix that is,
 * at the code level, "check the error before discarding it."
 *
 * This codebase's own established precedent for EXACTLY this defect class —
 * action-evaluations-v3-schema-drift.test.ts's LOUD-1/LOUD-2 — is a
 * source-pattern regression test, not full execution. This file follows that
 * precedent. It is mutation-verified (see the fold commit) to actually catch
 * the reverted form of each fix, which is the load-bearing property a
 * source-pattern test must have to be worth anything.
 *
 * Run: npx tsx src/app/api/founder/hub/__tests__/message-persistence.test.ts
 */

import * as fs from 'fs'
import * as path from 'path'

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

const websiteRoot = path.resolve(__dirname, '../../../../../..')
const ROUTE = 'src/app/api/founder/hub/route.ts'
const src = fs.readFileSync(path.join(websiteRoot, ROUTE), 'utf-8')

/**
 * Find every `.insert({...})` call against founder_conversation_messages or
 * founder_conversations in the (standard-agent, non-ask-org) message-save
 * path, and return the ~300-char window following each so we can inspect
 * whether the result is checked. Deliberately narrow to `.insert(` on this
 * table, not every Supabase call in the file — the file also touches other
 * tables the fix does not (and need not) reach.
 */
// Offset marking where the ask-org (multi-agent) mode block ends and the
// standard-agent path (what /private-mentor actually calls) begins. Found via
// the route's own section comment, so it tracks the file rather than a
// hand-copied line number that would drift the next time this file is
// edited.
const STANDARD_AGENT_MODE_MARKER = '// ── Standard agent mode'
const standardAgentModeStart = src.indexOf(STANDARD_AGENT_MODE_MARKER)

function findInsertSites(tableCall: string, fromOffset = 0): { index: number; window: string }[] {
  const sites: { index: number; window: string }[] = []
  const marker = `.from('${tableCall}')`
  let i = fromOffset
  while ((i = src.indexOf(marker, i)) !== -1) {
    // Only count sites that are actually chained into an .insert( — this
    // marker also appears on .update(/.select( calls we don't care about here.
    // The lookahead window must clear the marker string ITSELF (39 chars for
    // 'founder_conversation_messages') before it can reach '.insert(' — a
    // window this test's own first draft got wrong (a 40-char window left
    // exactly 1 spare character, always missing '.insert('), which is worth
    // recording: even a source-pattern test needs verifying it can pass at
    // all, not just verifying it can fail.
    const after = src.slice(i, i + 80)
    if (/\.insert\s*\(/.test(after)) {
      sites.push({ index: i, window: src.slice(i, i + 320) })
    }
    i += marker.length
  }
  return sites
}

// ── §1 EVERY insert into founder_conversation_messages checks its error ────
// The core of the fix. A `await supabaseAdmin.from(...).insert({...})` with
// no `{ error }` destructuring anywhere in its statement is exactly the
// pre-fix shape.
{
  assert(standardAgentModeStart !== -1, '§1-pre: located the standard-agent-mode section marker (scoping anchor)')
  // Scoped to the STANDARD-AGENT path only. The ask-org (multi-agent) mode
  // has the identical defect and is deliberately NOT fixed here — see §6.
  const sites = findInsertSites('founder_conversation_messages', standardAgentModeStart)
  assert(sites.length >= 4, `§1-0: found a plausible number of message-insert call sites in ${ROUTE} (saw ${sites.length}) — non-vacuity floor`)

  let uncheckedCount = 0
  for (const site of sites) {
    // The check must be present as a destructured `error` binding on THIS
    // statement — i.e. `const { error... } =` immediately preceding the call,
    // or `.insert(` itself preceded by `const { error` on the same statement.
    // We look BACKWARD from the .from() marker for the nearest statement start
    // (a newline followed by `const`/`await`) and confirm it destructures error.
    const stmtStart = src.lastIndexOf('\n', site.index)
    const stmtHead = src.slice(stmtStart, site.index)
    const checksError = /const\s*\{\s*error/.test(stmtHead)
    if (!checksError) {
      uncheckedCount++
      console.error('  unchecked insert near offset ' + site.index + ': ' + stmtHead.trim())
    }
  }
  assert(
    uncheckedCount === 0,
    `§1-1: EVERY founder_conversation_messages insert in the standard-agent path checks its {error} (found ${uncheckedCount} unchecked)`
  )
}

// ── §2 THE TWO CRITICAL SAVES THROW ON ERROR ────────────────────────────────
// The founder's own message and the primary agent's response are the two
// halves of the exchange the founder actually sees. Losing either silently is
// the reported bug. Both must re-throw so the route's existing debugStep
// catch handler reports the failure instead of returning a false 200.
{
  assert(
    /const \{ error: founderMsgErr \} = await supabaseAdmin\.from\('founder_conversation_messages'\)\.insert\(\{[\s\S]{0,300}?if \(founderMsgErr\) throw founderMsgErr/.test(src),
    "§2-1: the founder's-message save checks its error AND throws on failure"
  )
  assert(
    /const \{ error: primaryMsgErr \} = await supabaseAdmin\.from\('founder_conversation_messages'\)\.insert\(\{[\s\S]{0,400}?if \(primaryMsgErr\) throw primaryMsgErr/.test(src),
    '§2-2: the primary-response save checks its error AND throws on failure'
  )
}

// ── §3 debugStep IS SET IMMEDIATELY BEFORE EACH CRITICAL SAVE ──────────────
// This is what makes a thrown error from §2 actionable rather than a bare
// "Internal Server Error": the route's catch handler reports
// `Failed at step: ${debugStep}`, so debugStep must be freshly set to name
// the exact save that failed, not left over from an earlier step.
{
  const founderSaveIdx = src.indexOf("debugStep = 'save_founder_message'")
  const primarySaveIdx = src.indexOf("debugStep = 'save_primary_response'")
  assert(founderSaveIdx !== -1, "§3-1: debugStep = 'save_founder_message' is set")
  assert(primarySaveIdx !== -1, "§3-2: debugStep = 'save_primary_response' is set")
  if (founderSaveIdx !== -1) {
    const gapToInsert = src.slice(founderSaveIdx, founderSaveIdx + 250)
    assert(
      /founder_conversation_messages/.test(gapToInsert),
      "§3-3: 'save_founder_message' debugStep sits immediately before its own insert (not stranded)"
    )
  }
}

// ── §4 THE CATCH HANDLER GENUINELY REPORTS debugStep + DETAIL ──────────────
// The mechanism §2's throws route through. If this regresses, a thrown
// founderMsgErr/primaryMsgErr would still 500, but with no indication of
// which save failed or why — much harder to diagnose the next time this
// class of bug recurs.
{
  assert(
    /console\.error\(`Founder hub error at step \[\$\{debugStep\}\]:`, error\)/.test(src),
    '§4-1: the catch handler logs the failed debugStep + the underlying error'
  )
  assert(
    /error: `Failed at step: \$\{debugStep\}\. Detail: \$\{errMsg\}`/.test(src),
    '§4-2: the catch handler returns the failed debugStep + detail to the caller'
  )
}

// ── §5 SUPPLEMENTARY SAVES ARE CHECKED-BUT-NON-BLOCKING ────────────────────
// Observer contributions, the recommended-action note, and the updated_at
// bump should not fail the whole exchange — but a failure must still be
// LOGGED, not silently discarded, which was the pre-fix state for these too.
{
  assert(
    /if \(obsErr\) console\.error\(`Failed to save observer \$\{obs\.agent\} message \(non-blocking\):`, obsErr\)/.test(src),
    '§5-1: an observer-contribution save failure is logged, not discarded'
  )
  assert(
    /if \(recActErr\) console\.error\('Failed to save recommended-action message \(non-blocking\):', recActErr\)/.test(src),
    '§5-2: a recommended-action save failure is logged, not discarded'
  )
  assert(
    /if \(timestampErr\) console\.error\('Failed to bump conversation updated_at \(non-blocking\):', timestampErr\)/.test(src),
    '§5-3: an updated_at bump failure is logged, not discarded — relevant to the list-ordering half of the reported symptom'
  )
}

// ── §6 NAMED, NOT SILENTLY FIXED: the ask-org mode's own four inserts ──────
// Found while fixing this bug, sharing the exact same shape, but a different
// feature (the multi-agent "Ask the Org" mode, not /private-mentor — the
// route actually reported). Left unfixed deliberately, to keep this change
// scoped and reviewable rather than silently widening it. This assertion is
// NOT a pass/fail gate — it exists so the count is visible and does not drift
// unnoticed, and so a future session fixing them updates this pin rather than
// rediscovering the gap from scratch.
{
  // Scoped to BEFORE the standard-agent-mode boundary, and counted the same
  // checked-vs-unchecked way §1 counts the standard-agent path, so this
  // number cannot be inflated by matching a fixed line's substring (an
  // earlier draft of this check used a naive whole-file regex and reported 8
  // when the true count is 4 — it was matching '...insert({' inside the now-
  // fixed 'const { error } = await supabaseAdmin...insert({' lines too).
  const askOrgSites = findInsertSites('founder_conversation_messages').filter(s => s.index < standardAgentModeStart)
  const askOrgUnchecked = askOrgSites.filter(s => {
    const stmtStart = src.lastIndexOf('\n', s.index)
    return !/const\s*\{\s*error/.test(src.slice(stmtStart, s.index))
  }).length
  console.log(`  (informational, not a failure) ask-org mode has ${askOrgUnchecked} unchecked founder_conversation_messages insert(s) of ${askOrgSites.length} total — same defect class, different feature, named follow-up`)
}

console.log('\n' + passed + ' passed, ' + failed + ' failed')
if (failed > 0) {
  console.error('\nFailures:')
  for (const f of failures) console.error('  - ' + f)
  process.exit(1)
}
