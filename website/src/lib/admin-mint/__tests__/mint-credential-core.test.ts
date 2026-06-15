/**
 * mint-credential-core.test.ts — M2 CI-7 pure-logic tests (no DB, no fetch).
 *
 * Run via: `npx tsx website/src/lib/admin-mint/__tests__/mint-credential-core.test.ts`
 * (plain-assertion script per CLAUDE.md conventions; no Jest. No --env-file
 * needed — the core and the two route validation modules it reuses are pure.)
 *
 * COVERAGE:
 *   PC — parseCommand: list / mint / revoke / help shapes; bad input rejected.
 *   MA — mint api: label required; tier validated; limits OMITTED unless
 *        flagged (the route's adopted 30/1/1 defaults stay the single source
 *        of truth — CI-6); explicit limit flags pass through as integers.
 *   MI — mint install: `purpose: 'plugin_install'` baked in (PF-1); validated
 *        with the route's own validator (bad scope rejected locally).
 *   MS — mint assent: `purpose: 'sage_assent_write'` baked in (PF-1);
 *        validated with the route's own validator.
 *   RV — revoke: api → PATCH is_active=false (NO DELETE on that surface —
 *        the PF-1 family wrong-verb defect); install/assent → DELETE ?id=;
 *        UUID required.
 *   SM — summariseMintResponse: token extraction per response shape.
 *
 * The live leg (mint → row shows 30/1/1 → use once on /api/reason → revoke →
 * negative-auth) is the M2 founder-walked TEST verification — NOT mocked here.
 */

import {
  parseCommand,
  buildListPlan,
  buildMintPlan,
  buildRevokePlan,
  summariseMintResponse,
  classFromPrefix,
  normaliseListRow,
  checkRevokeTarget,
} from '../mint-credential-core'

let passCount = 0
let failCount = 0

function assert(name: string, condition: boolean) {
  if (condition) {
    passCount++
    console.log(`  ✓ ${name}`)
  } else {
    failCount++
    console.error(`  ✗ ${name}`)
  }
}

const FAKE_UUID = '123e4567-e89b-42d3-a456-426614174000'

// ── PC — parseCommand ────────────────────────────────────────────────────────
console.log('PC — parseCommand')
{
  const help = parseCommand([])
  assert('PC-1 empty argv → help', help.ok && help.command.action === 'help')

  const list = parseCommand(['list'])
  assert('PC-2 list parses', list.ok && list.command.action === 'list')

  const listExtra = parseCommand(['list', '--foo', 'bar'])
  assert('PC-3 list with arguments rejected', !listExtra.ok)

  const mint = parseCommand(['mint', 'api', '--label', 'Test key'])
  assert(
    'PC-4 mint api parses with flags',
    mint.ok &&
      mint.command.action === 'mint' &&
      mint.command.credentialClass === 'api' &&
      mint.command.flags['label'] === 'Test key'
  )

  const badClass = parseCommand(['mint', 'bogus', '--label', 'x'])
  assert('PC-5 unknown credential class rejected', !badClass.ok)

  const danglingFlag = parseCommand(['mint', 'api', '--label'])
  assert('PC-6 flag without value rejected', !danglingFlag.ok)

  const unknownCmd = parseCommand(['frobnicate'])
  assert('PC-7 unknown command rejected', !unknownCmd.ok)
}

// ── MA — mint api ────────────────────────────────────────────────────────────
console.log('MA — mint api (sr_live_)')
{
  const noLabel = buildMintPlan('api', {})
  assert('MA-1 label required', !noLabel.ok)

  const plain = buildMintPlan('api', { label: 'Test key' })
  assert(
    'MA-2 minimal mint → POST /api/admin/api-keys with label only',
    plain.ok &&
      plain.plan.method === 'POST' &&
      plain.plan.path === '/api/admin/api-keys' &&
      plain.plan.body?.label === 'Test key'
  )
  assert(
    'MA-3 limits OMITTED unless flagged (route 30/1/1 defaults govern — CI-6)',
    plain.ok &&
      !('monthly_limit' in plain.plan.body!) &&
      !('daily_limit' in plain.plan.body!) &&
      !('max_chain_iterations' in plain.plan.body!)
  )

  const badTier = buildMintPlan('api', { label: 'x', tier: 'platinum' })
  assert('MA-4 invalid tier rejected locally', !badTier.ok)

  const withLimits = buildMintPlan('api', {
    label: 'Paid key',
    tier: 'paid',
    monthly: '10000',
    daily: '500',
    chain: '3',
  })
  assert(
    'MA-5 explicit limit flags pass through as integers',
    withLimits.ok &&
      withLimits.plan.body?.monthly_limit === 10000 &&
      withLimits.plan.body?.daily_limit === 500 &&
      withLimits.plan.body?.max_chain_iterations === 3 &&
      withLimits.plan.body?.tier === 'paid'
  )

  const badLimit = buildMintPlan('api', { label: 'x', monthly: 'lots' })
  assert('MA-6 non-integer limit rejected locally', !badLimit.ok)
}

// ── MI — mint install ────────────────────────────────────────────────────────
console.log('MI — mint install (sr_inst_)')
{
  const good = buildMintPlan('install', {
    'install-id': 'test-install-1',
    'identity-type': 'agent',
    scope: 'assessment-only',
  })
  assert(
    'MI-1 valid mint → POST /api/admin/plugin-install-credentials',
    good.ok && good.plan.path === '/api/admin/plugin-install-credentials'
  )
  assert(
    "MI-2 purpose 'plugin_install' baked into the body (PF-1)",
    good.ok && good.plan.body?.purpose === 'plugin_install'
  )

  const badScope = buildMintPlan('install', {
    'install-id': 'test-install-1',
    'identity-type': 'agent',
    scope: 'everything',
  })
  assert(
    "MI-3 invalid install_scope rejected locally (route's own validator)",
    !badScope.ok && !badScope.ok && /install_scope/.test(badScope.error)
  )

  const missingId = buildMintPlan('install', {
    'identity-type': 'human',
    scope: 'mentor-also',
  })
  assert('MI-4 missing install_id rejected locally', !missingId.ok)
}

// ── MS — mint assent ─────────────────────────────────────────────────────────
console.log('MS — mint assent (sr_assent_)')
{
  const good = buildMintPlan('assent', { 'agent-id': 'agent_test_v1' })
  assert(
    'MS-1 valid mint → POST /api/admin/accreditation-credentials',
    good.ok && good.plan.path === '/api/admin/accreditation-credentials'
  )
  assert(
    "MS-2 purpose 'sage_assent_write' baked into the body (PF-1)",
    good.ok && good.plan.body?.purpose === 'sage_assent_write'
  )

  const missingAgent = buildMintPlan('assent', {})
  assert('MS-3 missing agent_id rejected locally', !missingAgent.ok)

  const badModel = buildMintPlan('assent', {
    'agent-id': 'agent_test_v1',
    'identity-model': 'psychic',
  })
  assert(
    "MS-4 invalid scope_downstream_identity_model rejected locally (route's own validator)",
    !badModel.ok
  )
}

// ── MP — mint practice (sr_prac_ Unified Practice Credential, CI-14) ──────────
console.log('MP — mint practice (sr_prac_)')
{
  const noLabel = buildMintPlan('practice', { capabilities: 'consult' })
  assert('MP-1 label required', !noLabel.ok)

  const noCaps = buildMintPlan('practice', { label: 'UPC' })
  assert('MP-2 capabilities required', !noCaps.ok)

  const badCap = buildMintPlan('practice', { label: 'UPC', capabilities: 'consult,teleport' })
  assert('MP-3 invalid capability rejected locally', !badCap.ok && /teleport/.test(badCap.error))

  const full = buildMintPlan('practice', {
    label: 'Full UPC',
    capabilities: 'consult,l1_supply,accreditation_write,calling,reflect',
    'agent-id': 'ns:agent@1',
    'owner-email': 'op@example.com',
  })
  assert(
    'MP-4 full UPC → POST /api/admin/api-keys with capabilities[] + agent_id + owner_email',
    full.ok &&
      full.plan.method === 'POST' &&
      full.plan.path === '/api/admin/api-keys' &&
      Array.isArray(full.plan.body?.capabilities) &&
      (full.plan.body?.capabilities as string[]).length === 5 &&
      full.plan.body?.agent_id === 'ns:agent@1' &&
      full.plan.body?.owner_email === 'op@example.com'
  )
  assert(
    'MP-5 limits OMITTED (route 30/1/1 defaults govern — CI-6)',
    full.ok &&
      !('monthly_limit' in full.plan.body!) &&
      !('daily_limit' in full.plan.body!)
  )

  const badOwnerKind = buildMintPlan('practice', {
    label: 'x',
    capabilities: 'consult',
    'owner-kind': 'wizard',
  })
  assert('MP-6 invalid owner-kind rejected locally', !badOwnerKind.ok)

  const consultOnly = buildMintPlan('practice', {
    label: 'consult UPC',
    capabilities: 'consult,l1_supply',
  })
  assert(
    'MP-7 consult-only UPC carries no write-class capability',
    consultOnly.ok &&
      !(consultOnly.plan.body?.capabilities as string[]).includes('accreditation_write')
  )

  const rev = buildRevokePlan('practice', { id: FAKE_UUID })
  assert(
    'MP-8 revoke practice → PATCH is_active=false on /api/admin/api-keys (no DELETE)',
    rev.ok &&
      rev.plan.method === 'PATCH' &&
      rev.plan.path === '/api/admin/api-keys' &&
      rev.plan.body?.is_active === false
  )

  assert('MP-9 classFromPrefix sr_prac_ → practice', classFromPrefix('sr_prac_abc123') === 'practice')

  const parsed = parseCommand(['mint', 'practice', '--label', 'x', '--capabilities', 'consult'])
  assert(
    'MP-10 parseCommand accepts the practice class',
    parsed.ok && parsed.command.credentialClass === 'practice'
  )
}

// ── RV — revoke ──────────────────────────────────────────────────────────────
console.log('RV — revoke (per-surface verbs)')
{
  const api = buildRevokePlan('api', { id: FAKE_UUID })
  assert(
    'RV-1 api revoke → PATCH is_active=false (no DELETE on this surface)',
    api.ok &&
      api.plan.method === 'PATCH' &&
      api.plan.path === '/api/admin/api-keys' &&
      api.plan.body?.is_active === false &&
      api.plan.body?.id === FAKE_UUID
  )
  assert(
    'RV-2 api revoke carries a suspended_reason default',
    api.ok && api.plan.body?.suspended_reason === 'admin_revocation'
  )

  const install = buildRevokePlan('install', { id: FAKE_UUID, reason: 'rotation' })
  assert(
    'RV-3 install revoke → DELETE ?id= with reason body',
    install.ok &&
      install.plan.method === 'DELETE' &&
      install.plan.path === `/api/admin/plugin-install-credentials?id=${FAKE_UUID}` &&
      install.plan.body?.reason === 'rotation'
  )

  const assent = buildRevokePlan('assent', { id: FAKE_UUID })
  assert(
    'RV-4 assent revoke → DELETE ?id=',
    assent.ok &&
      assent.plan.method === 'DELETE' &&
      assent.plan.path === `/api/admin/accreditation-credentials?id=${FAKE_UUID}`
  )

  const noId = buildRevokePlan('api', {})
  assert('RV-5 missing --id rejected', !noId.ok)

  const badId = buildRevokePlan('install', { id: 'not-a-uuid' })
  assert('RV-6 non-UUID --id rejected locally', !badId.ok)
}

// ── SM — summariseMintResponse + list plan ───────────────────────────────────
console.log('SM — response summarising')
{
  const api = summariseMintResponse('api', {
    message: 'created',
    api_key: 'sr_live_abc123',
    id: FAKE_UUID,
    monthly_limit: 30,
  })
  assert(
    'SM-1 api: token from api_key; message stripped; record kept',
    api.token === 'sr_live_abc123' &&
      api.record.monthly_limit === 30 &&
      !('api_key' in api.record) &&
      !('message' in api.record)
  )

  const inst = summariseMintResponse('install', {
    credential: { id: FAKE_UUID, install_id: 'x' },
    token: 'sr_inst_def456',
    warning: 'shown once',
  })
  assert(
    'SM-2 install/assent: token + credential record extracted',
    inst.token === 'sr_inst_def456' && inst.record.install_id === 'x'
  )

  // SM-4 — CI-14: 'practice' mints via /api/admin/api-keys (the api shape:
  // { message, api_key, ...keyRecord }), NOT the install/assent { token,
  // credential } shape. Regression-locks the live-replay-found bug where the
  // sr_prac_ token was dropped (token null, record {}).
  const prac = summariseMintResponse('practice', {
    message: 'created',
    api_key: 'sr_prac_abc123',
    id: FAKE_UUID,
    agent_id: 'legb:upc-replay@v1',
  })
  assert(
    'SM-4 practice: token from api_key (api shape); record kept; message stripped',
    prac.token === 'sr_prac_abc123' &&
      prac.record.agent_id === 'legb:upc-replay@v1' &&
      !('api_key' in prac.record) &&
      !('message' in prac.record)
  )

  const list = buildListPlan()
  assert(
    'SM-3 list plan → GET /api/admin/api-keys',
    list.method === 'GET' && list.path === '/api/admin/api-keys'
  )
}

// ── CP — classFromPrefix ─────────────────────────────────────────────────────
console.log('CP — credential class from key_prefix')
{
  assert('CP-1 sr_live_ → api', classFromPrefix('sr_live_a1b2c3') === 'api')
  assert('CP-2 sr_inst_ → install', classFromPrefix('sr_inst_d4e5f6') === 'install')
  assert('CP-3 sr_assent_ → assent', classFromPrefix('sr_assent_g7h8') === 'assent')
  assert('CP-5 sr_prac_ → practice', classFromPrefix('sr_prac_a1b2c3') === 'practice')
  assert('CP-4 anything else → unknown', classFromPrefix('sk-ant-oops') === 'unknown')
}

// ── NR — normaliseListRow against the REAL view shape ────────────────────────
// Fixture columns are exactly what api_key_usage_current serves
// (api/api-keys-schema.sql §4): the UUID is aliased to api_key_id; there is
// NO id, NO purpose, NO max_chain_iterations column.
console.log('NR — list-row normalisation (api_key_usage_current shape)')
{
  const viewRow = {
    api_key_id: FAKE_UUID,
    key_prefix: 'sr_inst_d4e5f6',
    label: 'Leg B install',
    tier: 'free',
    is_active: true,
    monthly_limit: 100,
    daily_limit: 100,
    owner_email: null,
    monthly_calls: 7,
    todays_calls: 1,
    monthly_remaining: 93,
    monthly_pct_used: 7.0,
    last_used_at: '2026-06-11T10:00:00Z',
    created_at: '2026-06-11T09:00:00Z',
  }
  const r = normaliseListRow(viewRow)
  assert('NR-1 id read from api_key_id (the view alias)', r.id === FAKE_UUID)
  assert('NR-2 class derived from prefix, not a fabricated purpose', r.credentialClass === 'install')
  assert(
    'NR-3 limits/usage mapped; nothing invented for absent columns',
    r.monthlyLimit === 100 && r.dailyLimit === 100 && r.monthlyCalls === 7
  )
  assert('NR-4 active state mapped', r.active === true)

  const sparse = normaliseListRow({ key_prefix: 'sr_live_a1b2c3', is_active: false })
  assert(
    'NR-5 sparse row → nulls, REVOKED state, class still derived',
    sparse.id === null && sparse.active === false && sparse.credentialClass === 'api'
  )
}

// ── RG — revoke class-guard ──────────────────────────────────────────────────
console.log('RG — revoke class-guard (no unaudited cross-class revoke)')
{
  const rows = [
    normaliseListRow({ api_key_id: FAKE_UUID, key_prefix: 'sr_inst_d4e5f6', label: 'x' }),
  ]
  const cross = checkRevokeTarget(rows, FAKE_UUID, 'api')
  assert(
    'RG-1 revoke api on an sr_inst_ id REFUSED, correct subcommand named',
    !cross.ok && /revoke install/.test(cross.error)
  )

  const match = checkRevokeTarget(rows, FAKE_UUID, 'install')
  assert('RG-2 matching class allowed', match.ok)

  const missing = checkRevokeTarget(rows, '00000000-0000-4000-8000-000000000000', 'api')
  assert('RG-3 id not in list → refused (fail-safe, no blind revoke)', !missing.ok)

  const unknownRows = [
    normaliseListRow({ api_key_id: FAKE_UUID, key_prefix: 'sk-ant-oops', label: 'x' }),
  ]
  const unknown = checkRevokeTarget(unknownRows, FAKE_UUID, 'api')
  assert('RG-4 unclassifiable prefix → refused', !unknown.ok)

  const cased = checkRevokeTarget(rows, ` ${FAKE_UUID.toUpperCase()} `, 'install')
  assert('RG-5 uppercase/padded (valid) id still matches its row', cased.ok)
}

console.log(`\n${passCount} passed, ${failCount} failed`)
if (failCount > 0) process.exit(1)
