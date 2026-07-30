/**
 * practice-credential.test.ts — CI-14 UPC capability model + chokepoint evaluator.
 *
 * STATUS: NEW (2026-06-15, CI-14 Critical build, Step 4). Pure-logic assertion
 * parity for the capability derivation (COALESCE(capabilities, preset_for(purpose)))
 * and the evaluatePracticeCredentialRow decision core. No I/O — runs with bare
 * `npx tsx` (no --env-file; practice-credential.ts constructs its Supabase client
 * inside the async validator, never at module load). Does NOT import security.ts,
 * so it exits cleanly (no setInterval keepalive).
 *
 * Run: npx tsx website/src/lib/__tests__/practice-credential.test.ts
 */

import {
  presetForPurpose,
  effectiveCapabilities,
  credentialHasCapability,
  evaluatePracticeCredentialRow,
  isUpcCapabilityAuthEnabled,
  capabilitiesIncludeWriteClass,
  l1SupplyRefused,
  WRITE_CLASS_CAPABILITIES,
  isCredentialLookupRetryEnabled,
  lookupCredentialRowWithRetry,
  type PracticeCredentialRow,
  type PracticeCapability,
  type CredentialLookupOutcome,
} from '@/lib/practice-credential'

let passed = 0
let failed = 0
const failures: string[] = []

function test(name: string, fn: () => void): void {
  try {
    fn()
    passed++
  } catch (e) {
    failed++
    failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`)
  }
}

async function testAsync(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
  } catch (e) {
    failed++
    failures.push(`${name}: ${e instanceof Error ? e.message : String(e)}`)
  }
}

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(msg)
}

function eqSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false
  const bs = new Set(b)
  return a.every((x) => bs.has(x))
}

/** A full active row factory — every field present; override per test. */
function mkRow(overrides: Partial<PracticeCredentialRow> = {}): PracticeCredentialRow {
  return {
    id: 'cred-1',
    is_active: true,
    purpose: 'ecosystem',
    capabilities: null,
    owner_user_id: 'owner-1',
    agent_id: null,
    label: 'test',
    tier: 'free',
    suspended_reason: null,
    monthly_limit: 30,
    daily_limit: 1,
    max_chain_iterations: 1,
    scope_downstream_identity_model: null,
    scope_path_posture: null,
    identity_type: null,
    install_id: null,
    install_scope: null,
    ...overrides,
  }
}

// ── presetForPurpose: the legacy mapping (MUST match the Step-2 backfill) ───────
test('preset ecosystem → {consult,l1_supply}', () =>
  assert(eqSet(presetForPurpose('ecosystem'), ['consult', 'l1_supply']), 'ecosystem preset'))
test('preset plugin_install → {consult,l1_supply}', () =>
  assert(eqSet(presetForPurpose('plugin_install'), ['consult', 'l1_supply']), 'plugin preset'))
test('preset sage_assent_write → {accreditation_write,calling,reflect}', () =>
  assert(
    eqSet(presetForPurpose('sage_assent_write'), ['accreditation_write', 'calling', 'reflect']),
    'assent preset',
  ))
test('preset unified_practice → {} (capabilities[] is authoritative)', () =>
  assert(presetForPurpose('unified_practice').length === 0, 'upc preset empty'))
test('preset null → {} (fail-closed)', () =>
  assert(presetForPurpose(null).length === 0, 'null preset empty'))
test('preset unknown → {} (fail-closed)', () =>
  assert(presetForPurpose('garbage').length === 0, 'unknown preset empty'))

// ── effectiveCapabilities: COALESCE(capabilities, preset_for(purpose)) ──────────
test('effective: explicit capabilities win over purpose preset', () =>
  assert(
    eqSet(effectiveCapabilities({ capabilities: ['consult'], purpose: 'ecosystem' }), ['consult']),
    'explicit wins',
  ))
test('effective: null capabilities → ecosystem preset', () =>
  assert(
    eqSet(effectiveCapabilities({ capabilities: null, purpose: 'ecosystem' }), [
      'consult',
      'l1_supply',
    ]),
    'null → ecosystem preset',
  ))
test('effective: null capabilities → sage_assent_write preset', () =>
  assert(
    eqSet(effectiveCapabilities({ capabilities: null, purpose: 'sage_assent_write' }), [
      'accreditation_write',
      'calling',
      'reflect',
    ]),
    'null → assent preset',
  ))
test('effective: unknown members filtered out', () =>
  assert(
    eqSet(effectiveCapabilities({ capabilities: ['consult', 'bogus'], purpose: null }), ['consult']),
    'filters unknown',
  ))
test('effective: explicit empty array wins (a deliberately capability-less credential)', () =>
  assert(
    effectiveCapabilities({ capabilities: [], purpose: 'ecosystem' }).length === 0,
    'empty explicit wins',
  ))

// ── credentialHasCapability ────────────────────────────────────────────────────
test('has: ecosystem(null caps) grants consult + l1_supply, not accreditation_write', () => {
  const r = { capabilities: null, purpose: 'ecosystem' }
  assert(credentialHasCapability(r, 'consult'), 'consult')
  assert(credentialHasCapability(r, 'l1_supply'), 'l1_supply')
  assert(!credentialHasCapability(r, 'accreditation_write'), 'not write')
})
test('has: sage_assent_write(null caps) grants calling + reflect + write, not consult', () => {
  const r = { capabilities: null, purpose: 'sage_assent_write' }
  assert(credentialHasCapability(r, 'calling'), 'calling')
  assert(credentialHasCapability(r, 'reflect'), 'reflect')
  assert(credentialHasCapability(r, 'accreditation_write'), 'write')
  assert(!credentialHasCapability(r, 'consult'), 'not consult')
})

// ── evaluatePracticeCredentialRow: the decision core ───────────────────────────
test('evaluate: null row → invalid_token', () => {
  const r = evaluatePracticeCredentialRow(null, 'consult')
  assert(!r.valid && r.reason === 'invalid_token', 'null→invalid_token')
})
test('evaluate: inactive → suspended (+ suspendedReason)', () => {
  const r = evaluatePracticeCredentialRow(
    mkRow({ is_active: false, suspended_reason: 'manual' }),
    'consult',
  )
  assert(!r.valid && r.reason === 'suspended' && r.suspendedReason === 'manual', 'suspended')
})
test('evaluate: active ecosystem requires consult → valid', () => {
  const r = evaluatePracticeCredentialRow(mkRow({ purpose: 'ecosystem' }), 'consult')
  assert(r.valid === true, 'consult valid')
})
test('evaluate: active ecosystem requires accreditation_write → insufficient_capability', () => {
  const r = evaluatePracticeCredentialRow(mkRow({ purpose: 'ecosystem' }), 'accreditation_write')
  assert(!r.valid && r.reason === 'insufficient_capability', 'insufficient')
})
test('evaluate: sage_assent_write serves calling AND reflect AND write (unscoped reuse)', () => {
  const base = { purpose: 'sage_assent_write', agent_id: 'ns:a@1', capabilities: null }
  for (const cap of ['calling', 'reflect', 'accreditation_write'] as PracticeCapability[]) {
    const r = evaluatePracticeCredentialRow(mkRow(base), cap, { agent_id: 'ns:a@1' })
    assert(r.valid === true, `${cap} valid`)
  }
})
test('evaluate: agent binding mismatch → wrong_agent', () => {
  const r = evaluatePracticeCredentialRow(
    mkRow({ purpose: 'sage_assent_write', agent_id: 'ns:a@1' }),
    'accreditation_write',
    { agent_id: 'ns:b@1' },
  )
  assert(!r.valid && r.reason === 'wrong_agent', 'wrong_agent')
})
test('evaluate: scope permissive when null', () => {
  const r = evaluatePracticeCredentialRow(
    mkRow({ purpose: 'sage_assent_write', agent_id: 'ns:a@1', scope_downstream_identity_model: null }),
    'accreditation_write',
    { agent_id: 'ns:a@1' },
  )
  assert(r.valid === true, 'permissive null scope')
})
test('evaluate: scope fail-closed when set + no supplied value → wrong_scope', () => {
  const r = evaluatePracticeCredentialRow(
    mkRow({
      purpose: 'sage_assent_write',
      agent_id: 'ns:a@1',
      scope_downstream_identity_model: 'service_account',
    }),
    'accreditation_write',
    { agent_id: 'ns:a@1' },
  )
  assert(!r.valid && r.reason === 'wrong_scope', 'fail-closed scope')
})
test('evaluate: scope matches when supplied value equals the set column', () => {
  const r = evaluatePracticeCredentialRow(
    mkRow({
      purpose: 'sage_assent_write',
      agent_id: 'ns:a@1',
      scope_downstream_identity_model: 'service_account',
    }),
    'accreditation_write',
    { agent_id: 'ns:a@1', carriedProfile: { downstream_identity_model: 'service_account' } },
  )
  assert(r.valid === true, 'scope match')
})

// ── the leg-B acceptance proof, at the unit level: ONE UPC, five capabilities ───
test('evaluate: one unified_practice credential serves ALL five surfaces', () => {
  const all: PracticeCapability[] = [
    'consult',
    'l1_supply',
    'accreditation_write',
    'calling',
    'reflect',
  ]
  const upc = mkRow({
    purpose: 'unified_practice',
    capabilities: all,
    agent_id: 'ns:agent@1',
    owner_user_id: 'op-1',
  })
  for (const cap of all) {
    // consult/l1_supply unscoped; write/calling/reflect bind the agent.
    const ctx = ['accreditation_write', 'calling', 'reflect'].includes(cap)
      ? { agent_id: 'ns:agent@1' }
      : undefined
    const r = evaluatePracticeCredentialRow(upc, cap, ctx)
    assert(r.valid === true, `UPC serves ${cap}`)
  }
})
test('evaluate: a consult-only UPC is refused write/calling/reflect (least-privilege)', () => {
  const consultOnly = mkRow({
    purpose: 'unified_practice',
    capabilities: ['consult', 'l1_supply'],
    agent_id: 'ns:agent@1',
  })
  for (const cap of ['accreditation_write', 'calling', 'reflect'] as PracticeCapability[]) {
    const r = evaluatePracticeCredentialRow(consultOnly, cap, { agent_id: 'ns:agent@1' })
    assert(!r.valid && r.reason === 'insufficient_capability', `consult-only refuses ${cap}`)
  }
})

// ── cross-class capability denial at the evaluator (locks the consult gate that
//    validateApiKeyUpc relies on, and the write-route capability gates — the
//    capability half of constraint 7; the route-level X-Api-Key transport
//    regression test rides Step 6's live route integration) ──────────────────────
test('evaluate: a write credential (sage_assent_write preset) is refused consult', () => {
  const r = evaluatePracticeCredentialRow(
    mkRow({ purpose: 'sage_assent_write', capabilities: null, agent_id: 'ns:a@1' }),
    'consult',
  )
  assert(!r.valid && r.reason === 'insufficient_capability', 'write cred refused consult')
})
test('evaluate: an ecosystem credential is refused each write capability', () => {
  for (const cap of ['accreditation_write', 'calling', 'reflect'] as PracticeCapability[]) {
    const r = evaluatePracticeCredentialRow(mkRow({ purpose: 'ecosystem' }), cap, { agent_id: 'x' })
    assert(!r.valid && r.reason === 'insufficient_capability', `ecosystem refused ${cap}`)
  }
})

// ── isUpcCapabilityAuthEnabled: the flag ───────────────────────────────────────
test('flag: unset → false', () => {
  delete process.env.SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED
  assert(isUpcCapabilityAuthEnabled() === false, 'unset false')
})
test('flag: "true" → true', () => {
  process.env.SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED = 'true'
  assert(isUpcCapabilityAuthEnabled() === true, 'true')
  delete process.env.SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED
})
test('flag: "false" → false (strict === "true")', () => {
  process.env.SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED = 'false'
  assert(isUpcCapabilityAuthEnabled() === false, 'false')
  delete process.env.SUBSTRATE_UPC_CAPABILITY_AUTH_ENABLED
})

// ── capabilitiesIncludeWriteClass — must match the 6e §A DB CHECK set ───────────
// (used by the api-keys UPC mint pre-validation; CI-14 Step 7).
test('write-class: the set is exactly {accreditation_write, calling, reflect}', () => {
  assert(
    WRITE_CLASS_CAPABILITIES.length === 3 &&
      WRITE_CLASS_CAPABILITIES.includes('accreditation_write') &&
      WRITE_CLASS_CAPABILITIES.includes('calling') &&
      WRITE_CLASS_CAPABILITIES.includes('reflect'),
    'write-class set matches the 6e CHECK overlap array',
  )
})
test('write-class: each member alone → true', () => {
  assert(capabilitiesIncludeWriteClass(['accreditation_write']), 'accreditation_write')
  assert(capabilitiesIncludeWriteClass(['calling']), 'calling')
  assert(capabilitiesIncludeWriteClass(['reflect']), 'reflect')
})
test('write-class: consult-only / l1_supply → false (no owner+agent required)', () => {
  assert(!capabilitiesIncludeWriteClass(['consult']), 'consult only')
  assert(!capabilitiesIncludeWriteClass(['consult', 'l1_supply']), 'consult+l1_supply')
  assert(!capabilitiesIncludeWriteClass([]), 'empty set')
})
test('write-class: a mixed set with any write member → true', () => {
  assert(capabilitiesIncludeWriteClass(['consult', 'l1_supply', 'calling']), 'mixed incl. calling')
})

// ── l1SupplyRefused — the M1 CI-2 × CI-14 schema-supply gate (closes L1SUP-1) ──
test('l1SupplyRefused: flag off → never refuses (byte-identical skip)', () => {
  assert(!l1SupplyRefused({ upcEnabled: false, capabilities: ['consult'] }), 'consult-only, flag off')
  assert(!l1SupplyRefused({ upcEnabled: false, capabilities: undefined }), 'undefined caps, flag off')
  assert(!l1SupplyRefused({ upcEnabled: false, capabilities: [] }), 'empty caps, flag off')
})
test('l1SupplyRefused: flag on + capabilities undefined/null → skip (legacy non-UPC path)', () => {
  assert(!l1SupplyRefused({ upcEnabled: true, capabilities: undefined }), 'undefined ⇒ skip')
  assert(!l1SupplyRefused({ upcEnabled: true, capabilities: null }), 'null ⇒ skip')
})
test('l1SupplyRefused: flag on + l1_supply present → allow (false)', () => {
  assert(!l1SupplyRefused({ upcEnabled: true, capabilities: ['consult', 'l1_supply'] }), 'consult+l1_supply')
  assert(!l1SupplyRefused({ upcEnabled: true, capabilities: ['l1_supply'] }), 'l1_supply alone')
})
test('l1SupplyRefused: flag on + l1_supply ABSENT → REFUSE (403, fail-closed)', () => {
  assert(l1SupplyRefused({ upcEnabled: true, capabilities: ['consult'] }), 'consult-only ⇒ 403')
  assert(l1SupplyRefused({ upcEnabled: true, capabilities: [] }), 'empty set ⇒ 403')
  assert(l1SupplyRefused({ upcEnabled: true, capabilities: ['accreditation_write', 'calling'] }), 'write-class without l1_supply ⇒ 403')
})

// ── isCredentialLookupRetryEnabled — the consult-lookup resilience flag ────────
test('retry flag: unset → false', () => {
  delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
  assert(isCredentialLookupRetryEnabled() === false, 'unset false')
})
test('retry flag: "true" → true', () => {
  process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED = 'true'
  assert(isCredentialLookupRetryEnabled() === true, 'true')
  delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
})
test('retry flag: "false" → false (strict === "true")', () => {
  process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED = 'false'
  assert(isCredentialLookupRetryEnabled() === false, 'false')
  delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
})

// ── lookupCredentialRowWithRetry — Item A of the 2026-07-19 consult-lookup
//    resilience follow-up. Injectable lookup fn — no Supabase I/O. ─────────────
function callCounter(outcomes: CredentialLookupOutcome[]): { fn: () => Promise<CredentialLookupOutcome>; calls: number[] } {
  let i = 0
  const calls: number[] = []
  const fn = async () => {
    calls.push(Date.now())
    const outcome = outcomes[Math.min(i, outcomes.length - 1)]
    i++
    return outcome
  }
  return { fn, calls }
}

async function runRetryTests(): Promise<void> {
  await testAsync('retry: flag off + unknown-key (no error, no row) → one attempt, no retry', async () => {
    delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
    const { fn, calls } = callCounter([{ row: null, error: null }])
    const result = await lookupCredentialRowWithRetry(fn)
    assert(calls.length === 1, `expected 1 call, got ${calls.length}`)
    assert(result.row === null && result.error === null, 'unknown-key outcome unchanged')
  })

  await testAsync('retry: flag off + persistent error → one attempt, fail-closed (byte-identical to pre-retry behaviour)', async () => {
    delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
    const { fn, calls } = callCounter([{ row: null, error: { message: 'network error' } }])
    const result = await lookupCredentialRowWithRetry(fn)
    assert(calls.length === 1, `expected 1 call (flag off), got ${calls.length}`)
    assert(result.error !== null, 'error surfaced (caller fails closed → invalid_token)')
  })

  await testAsync('retry: flag on + unknown-key (no error, no row) → still one attempt (never retries a genuine miss)', async () => {
    process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED = 'true'
    const { fn, calls } = callCounter([{ row: null, error: null }])
    const result = await lookupCredentialRowWithRetry(fn)
    delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
    assert(calls.length === 1, `expected 1 call, got ${calls.length}`)
    assert(result.row === null && result.error === null, 'unknown-key outcome unchanged')
  })

  await testAsync('retry: flag on + transient error then success → retries once, returns the row', async () => {
    process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED = 'true'
    const goodRow = mkRow({ id: 'cred-retry-ok' })
    const { fn, calls } = callCounter([
      { row: null, error: { message: 'timeout' } },
      { row: goodRow, error: null },
    ])
    const result = await lookupCredentialRowWithRetry(fn)
    delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
    assert(calls.length === 2, `expected 2 calls (retry once), got ${calls.length}`)
    assert(result.error === null && result.row?.id === 'cred-retry-ok', 'the retried success is returned')
  })

  await testAsync('retry: flag on + persistent error across both attempts → still fails closed after the retry', async () => {
    process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED = 'true'
    const { fn, calls } = callCounter([
      { row: null, error: { message: 'timeout' } },
      { row: null, error: { message: 'timeout again' } },
    ])
    const result = await lookupCredentialRowWithRetry(fn)
    delete process.env.SUBSTRATE_CREDENTIAL_LOOKUP_RETRY_ENABLED
    assert(calls.length === 2, `expected exactly 2 calls (one retry, not a loop), got ${calls.length}`)
    assert(result.error !== null, 'persistent error still fails closed (invalid_token)')
  })
}

void (async () => {
  await runRetryTests()

  console.log('')
  console.log(`Total: ${passed + failed}  Pass: ${passed}  Fail: ${failed}`)
  if (failed > 0) {
    console.error('')
    console.error('Failures:')
    for (const f of failures) console.error(`  - ${f}`)
    process.exit(1)
  }
})()
