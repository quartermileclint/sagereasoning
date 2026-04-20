#!/usr/bin/env node
/**
 * support-wiring-verification.mjs — Founder-runnable harness for the
 * Support agent wiring fix (Channel 1 distress pre-processor + Channel 2
 * history synthesis), 20 April 2026.
 *
 * WHAT THIS PROVES
 *   1. The SupportSafetyGate brand is produced only via the preprocessor
 *      (PR3 — synchronous safety gate). An acute-distress input must
 *      resolve with `shouldRedirect === true` and a non-null redirect
 *      message. A clean input must resolve with `shouldRedirect === false`.
 *   2. The 90-day baseline read is wired. A returning customer with a
 *      prior mild flag produces `baseline_severity === 'mild'`.
 *   3. The 30-day history synthesis is wired. A returning customer with
 *      four prior billing interactions produces trend === 'frequent' and
 *      `category_frequency_30d.billing === 4`, and open issues are surfaced.
 *
 * WHAT THIS DOES NOT PROVE
 *   - It does NOT call Anthropic (the real Haiku classifier is not
 *     invoked; a deterministic stub is injected per PR6 — no classifier
 *     touch). KG2 (Haiku reliability) is orthogonal to this harness.
 *   - It does NOT talk to Supabase (a local in-memory stub mimics the
 *     narrow SupabaseReadClient contract).
 *   - It does NOT validate prompt construction inside buildDraftPrompt
 *     beyond ensuring the history_context block is produced when a
 *     history object is supplied.
 *
 * HOW TO RUN
 *   From the repo root:
 *     node scripts/support-wiring-verification.mjs
 *
 *   Requires Node 22.6+ (native TypeScript import support). The script
 *   dynamically imports the .ts modules — no build step is needed.
 *
 * EXIT CODE
 *   0 = every assertion passed
 *   1 = at least one assertion failed (details printed above)
 *
 * Rules served: PR1 (single-endpoint proof), PR2 (build-to-wire verification
 * immediate), PR3 (safety-critical synchronous gate), PR6 (no classifier
 * touch — stub injected via DI).
 */

// ---------------------------------------------------------------------------
// Dynamic imports (Node strips TS types at load time)
// ---------------------------------------------------------------------------

const preprocessor = await import('../sage-mentor/support-distress-preprocessor.ts')
const synthesis = await import('../sage-mentor/support-history-synthesis.ts')

// NOTE: support-agent.ts transitively imports the rest of sage-mentor via
// extensionless .ts imports (ring-wrapper, persona, etc.). Node's native
// TypeScript loader cannot resolve those without a tsconfig path resolver.
// Loading the whole module chain is out of scope for a unit-level harness,
// and Channel 1 + Channel 2 proofs do not depend on support-agent.ts being
// importable here. The processInboxItem → gate wiring is verified by:
//   (a) the grep in Task #7 (single call site, brand type enforced)
//   (b) reading sage-mentor/support-agent.ts lines 780–899 directly
//       (processInboxItem signature + processInboxItemWithGuard).

const {
  preprocessSupportDistress,
  enforceSupportDistressCheck,
} = preprocessor

const {
  synthesiseSupportHistory,
  formatHistoryContextBlock,
  categoriseSubject,
} = synthesis

// ---------------------------------------------------------------------------
// Assertion helper
// ---------------------------------------------------------------------------

let passCount = 0
let failCount = 0
const failures = []

function assert(label, condition, detail) {
  if (condition) {
    passCount += 1
    console.log(`  \u2713 ${label}`)
  } else {
    failCount += 1
    failures.push({ label, detail })
    console.log(`  \u2717 ${label}`)
    if (detail) console.log(`      ${detail}`)
  }
}

function section(title) {
  console.log('')
  console.log('='.repeat(72))
  console.log(title)
  console.log('='.repeat(72))
}

// ---------------------------------------------------------------------------
// Stub: deterministic two-stage classifier (NO Anthropic call)
// ---------------------------------------------------------------------------
//
// PR6 discipline: the real detectDistressTwoStage is NOT touched and NOT
// copied here. The harness only needs a deterministic function with the
// same shape (DistressDetectionResult). Production wires in the proven
// classifier via deps.classify.

function stubClassifier(text, _sessionId) {
  const lower = String(text || '').toLowerCase()
  const acuteHits = [
    'kill myself',
    'end it all',
    'want to die',
    'suicide',
    'take my life',
  ].filter((k) => lower.includes(k))
  const moderateHits = [
    'hopeless',
    'cannot go on',
    "can't go on",
    'worthless',
  ].filter((k) => lower.includes(k))
  const mildHits = ['exhausted', 'overwhelmed', 'burned out', 'burnt out']
    .filter((k) => lower.includes(k))

  if (acuteHits.length > 0) {
    return Promise.resolve({
      distress_detected: true,
      severity: 'acute',
      indicators_found: acuteHits,
      redirect_message:
        'I can hear how much pain you are in. Please contact Lifeline on 13 11 14 (Australia) ' +
        'or your local crisis line. A real person is available 24/7.',
    })
  }
  if (moderateHits.length > 0) {
    return Promise.resolve({
      distress_detected: true,
      severity: 'moderate',
      indicators_found: moderateHits,
      redirect_message:
        'It sounds like you are carrying a lot right now. You do not have to carry it alone — ' +
        'Lifeline (13 11 14) and Beyond Blue (1300 22 4636) both offer free conversations.',
    })
  }
  if (mildHits.length > 0) {
    return Promise.resolve({
      distress_detected: true,
      severity: 'mild',
      indicators_found: mildHits,
      redirect_message: null,
    })
  }
  return Promise.resolve({
    distress_detected: false,
    severity: 'none',
    indicators_found: [],
    redirect_message: null,
  })
}

// ---------------------------------------------------------------------------
// Stub: narrow SupabaseReadClient
// ---------------------------------------------------------------------------
//
// Builds a thenable query builder that returns a canned row set keyed by
// table name. Matches the structural contract declared in
// support-distress-preprocessor.ts (SupabaseReadClient) exactly.

function makeStubSupabase(tables) {
  return {
    from(table) {
      let rows = tables[table] || []
      const builder = {
        select: (_cols) => builder,
        eq: (_c, _v) => builder,
        gte: (_c, _v) => builder,
        order: (_c, _o) => builder,
        limit: (_n) => builder,
        then: (resolve, reject) => {
          try {
            resolve({ data: rows.slice(), error: null })
          } catch (err) {
            if (reject) reject(err)
          }
        },
      }
      return builder
    },
  }
}

// ---------------------------------------------------------------------------
// Canonical test fixtures
// ---------------------------------------------------------------------------

const USER_ID = '00000000-0000-0000-0000-000000000001'

// Seed data for Case C — returning customer
const nowMs = Date.now()
const dayMs = 24 * 60 * 60 * 1000
const iso = (offsetDays) =>
  new Date(nowMs - offsetDays * dayMs).toISOString()

const returningCustomerTables = {
  vulnerability_flag: [
    {
      flag_id: 'flag-001',
      session_id: 'sess-old-001',
      severity: 1, // INTEGER column → maps to 'mild'
      created_at: iso(45), // inside 90d window
    },
  ],
  support_interactions: [
    {
      id: 'row-1',
      interaction_id: 'si-001',
      channel: 'email',
      status: 'resolved',
      customer_id: 'cust-42',
      subject: 'Invoice discrepancy on March billing',
      created_at: iso(20),
      resolved_at: iso(19),
    },
    {
      id: 'row-2',
      interaction_id: 'si-002',
      channel: 'email',
      status: 'resolved',
      customer_id: 'cust-42',
      subject: 'Refund for duplicate charge',
      created_at: iso(15),
      resolved_at: iso(14),
    },
    {
      id: 'row-3',
      interaction_id: 'si-003',
      channel: 'email',
      status: 'open',
      customer_id: 'cust-42',
      subject: 'Billing question about subscription tier',
      created_at: iso(6),
      resolved_at: null,
    },
    {
      id: 'row-4',
      interaction_id: 'si-004',
      channel: 'email',
      status: 'resolved',
      customer_id: 'cust-42',
      subject: 'Payment method update',
      created_at: iso(2),
      resolved_at: iso(2),
    },
  ],
}

const emptyTables = {
  vulnerability_flag: [],
  support_interactions: [],
}

// ---------------------------------------------------------------------------
// CASE A — clean billing question, new customer
// ---------------------------------------------------------------------------

section('CASE A — clean billing question, new customer')

{
  const text = 'Hi team, I was double-charged last Tuesday. Could you refund one of the invoices?'
  const deps = {
    supabase: makeStubSupabase(emptyTables),
    classify: stubClassifier,
  }

  const gate = await enforceSupportDistressCheck(
    preprocessSupportDistress(deps, USER_ID, 'cust-new', text, 'sess-A'),
  )
  const history = await synthesiseSupportHistory(
    deps.supabase,
    USER_ID,
    'cust-new',
    30,
    gate.signal.prior_flags,
  )

  console.log('\nSupportDistressSignal:')
  console.log(JSON.stringify(gate.signal, null, 2))
  console.log('\nSupportInteractionHistory:')
  console.log(JSON.stringify(history, null, 2))
  console.log('\nformatHistoryContextBlock output:')
  console.log(formatHistoryContextBlock(history))

  assert('SafetyGate brand present', gate.__brand === 'support_safety_gate')
  assert("gate.shouldRedirect === false", gate.shouldRedirect === false)
  assert("current.severity === 'none'", gate.signal.current.severity === 'none')
  assert('current.redirect_message === null', gate.signal.current.redirect_message === null)
  assert("baseline_severity === 'none'", gate.signal.baseline_severity === 'none')
  assert('sudden_change === false', gate.signal.sudden_change === false)
  assert('prior_contact_count === 0', history.prior_contact_count === 0)
  assert("trend === 'new'", history.trend === 'new')
  assert('open_issues empty', history.open_issues.length === 0)
}

// ---------------------------------------------------------------------------
// CASE B — acute distress ("I want to kill myself"), no history
// ---------------------------------------------------------------------------

section('CASE B — acute distress message, no prior history')

{
  const text =
    'I cannot do this any more. I want to kill myself. Please cancel my account.'
  const deps = {
    supabase: makeStubSupabase(emptyTables),
    classify: stubClassifier,
  }

  const gate = await enforceSupportDistressCheck(
    preprocessSupportDistress(deps, USER_ID, 'cust-B', text, 'sess-B'),
  )

  console.log('\nSupportDistressSignal:')
  console.log(JSON.stringify(gate.signal, null, 2))

  assert('SafetyGate brand present', gate.__brand === 'support_safety_gate')
  assert('gate.shouldRedirect === true', gate.shouldRedirect === true)
  assert("current.severity === 'acute'", gate.signal.current.severity === 'acute')
  assert(
    'current.redirect_message is non-null',
    typeof gate.signal.current.redirect_message === 'string' &&
      gate.signal.current.redirect_message.length > 0,
  )
  // With no priors the baseline defaults to 'none'; moving to 'acute' still
  // counts as a sudden change per isSuddenChange() — baseline rank 0 ≤ 1
  // AND current rank 3 ≥ 2. That is the R20 "sudden drastic change"
  // trigger firing correctly, not a bug.
  assert(
    'sudden_change === true (none → acute counts as drastic)',
    gate.signal.sudden_change === true,
  )
}

// ---------------------------------------------------------------------------
// CASE C — returning customer, clean message, 4 prior billing interactions
// ---------------------------------------------------------------------------

section('CASE C — returning customer with billing history')

{
  const text =
    'Thanks for sorting out the last invoice. Can you confirm my next renewal date?'
  const deps = {
    supabase: makeStubSupabase(returningCustomerTables),
    classify: stubClassifier,
  }

  const gate = await enforceSupportDistressCheck(
    preprocessSupportDistress(deps, USER_ID, 'cust-42', text, 'sess-C'),
  )
  const history = await synthesiseSupportHistory(
    deps.supabase,
    USER_ID,
    'cust-42',
    30,
    gate.signal.prior_flags,
  )

  console.log('\nSupportDistressSignal:')
  console.log(JSON.stringify(gate.signal, null, 2))
  console.log('\nSupportInteractionHistory:')
  console.log(JSON.stringify(history, null, 2))
  console.log('\nformatHistoryContextBlock output:')
  console.log(formatHistoryContextBlock(history))

  assert('SafetyGate brand present', gate.__brand === 'support_safety_gate')
  assert('gate.shouldRedirect === false (clean current)', gate.shouldRedirect === false)
  assert("current.severity === 'none'", gate.signal.current.severity === 'none')
  assert('prior_flags length === 1', gate.signal.prior_flags.length === 1)
  assert(
    "baseline_severity === 'mild'",
    gate.signal.baseline_severity === 'mild',
    `actual: ${gate.signal.baseline_severity}`,
  )
  assert('sudden_change === false (mild → none)', gate.signal.sudden_change === false)
  assert('prior_contact_count === 4', history.prior_contact_count === 4)
  assert("trend === 'frequent'", history.trend === 'frequent')
  assert(
    'category_frequency_30d.billing === 4',
    history.category_frequency_30d.billing === 4,
    `actual: ${JSON.stringify(history.category_frequency_30d)}`,
  )
  assert('open_issues length === 1', history.open_issues.length === 1)
  assert(
    "open issue status === 'open'",
    history.open_issues[0] && history.open_issues[0].status === 'open',
  )
  assert(
    "categoriseSubject routes 'billing' correctly",
    categoriseSubject('Invoice discrepancy on March billing') === 'billing',
  )
}

// ---------------------------------------------------------------------------
// CASE D — formatHistoryContextBlock emits expected HISTORY CONTEXT prose
// ---------------------------------------------------------------------------
//
// Covers buildDraftPrompt indirectly: the prompt builder calls
// formatHistoryContextBlock(history) verbatim and prepends it to the
// draft instructions. If this block contains the expected markers, the
// prompt builder will too. support-agent.ts itself cannot be dynamically
// imported here (see note at the top of the file), so this is the unit-
// level proof for the history_context wiring.

section('CASE D — formatHistoryContextBlock prose shape')

{
  const deps = {
    supabase: makeStubSupabase(returningCustomerTables),
    classify: stubClassifier,
  }
  const gate = await enforceSupportDistressCheck(
    preprocessSupportDistress(
      deps,
      USER_ID,
      'cust-42',
      'Can you confirm my next renewal date?',
      'sess-D',
    ),
  )
  const history = await synthesiseSupportHistory(
    deps.supabase,
    USER_ID,
    'cust-42',
    30,
    gate.signal.prior_flags,
  )

  const block = formatHistoryContextBlock(history)
  console.log('\nformatHistoryContextBlock output:')
  console.log(block)

  assert(
    'block contains HISTORY CONTEXT header',
    typeof block === 'string' && block.includes('HISTORY CONTEXT:'),
  )
  assert(
    "block mentions trend 'frequent'",
    typeof block === 'string' && block.toLowerCase().includes('frequent'),
  )
  assert(
    'block lists billing category frequency',
    typeof block === 'string' && block.toLowerCase().includes('billing'),
  )
  assert(
    'block surfaces one open issue',
    typeof block === 'string' && /open issues \(1\)/i.test(block),
  )
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

section('SUMMARY')

console.log(`\nPassed: ${passCount}`)
console.log(`Failed: ${failCount}`)

if (failCount > 0) {
  console.log('\nFailures:')
  for (const f of failures) {
    console.log(`  - ${f.label}${f.detail ? ' — ' + f.detail : ''}`)
  }
  process.exit(1)
} else {
  console.log('\nAll assertions passed. Support wiring is verified at the unit level.')
  process.exit(0)
}
