/**
 * a4-smoke-test.ts — runtime verification of /api/public-key against the
 * four-env-var contract per ADR-A4-key-management §Decision 2.
 */

import { GET } from '../src/app/api/public-key/route'

let pass = 0
let fail = 0

const TEST_CURRENT_PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEATEST_currentkey_smoke_test==\n-----END PUBLIC KEY-----'
const TEST_CURRENT_KEY_ID = 'substrate-layer2-test-current'
const TEST_CURRENT_ISSUED_AT = '2026-05-10T04:45:15.516Z'

const TEST_PREVIOUS_PUBLIC_KEY =
  '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEATEST_previouskey_smoke_test==\n-----END PUBLIC KEY-----'
const TEST_PREVIOUS_KEY_ID = 'substrate-layer2-test-previous'
const TEST_PREVIOUS_ISSUED_AT = '2026-02-01T00:00:00.000Z'
const TEST_PREVIOUS_RETIRES_AT = '2026-10-06T00:00:00.000Z'

function setCurrent() {
  process.env.SUBSTRATE_LAYER2_PUBLIC_KEY = TEST_CURRENT_PUBLIC_KEY
  process.env.SUBSTRATE_LAYER2_KEY_ID = TEST_CURRENT_KEY_ID
  process.env.SUBSTRATE_LAYER2_KEY_ISSUED_AT = TEST_CURRENT_ISSUED_AT
}
function setAllPrevious() {
  process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY = TEST_PREVIOUS_PUBLIC_KEY
  process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID = TEST_PREVIOUS_KEY_ID
  process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT = TEST_PREVIOUS_ISSUED_AT
  process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT = TEST_PREVIOUS_RETIRES_AT
}
function unsetAllPrevious() {
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT
  delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT
}
function unsetCurrent() {
  delete process.env.SUBSTRATE_LAYER2_PUBLIC_KEY
  delete process.env.SUBSTRATE_LAYER2_KEY_ID
  delete process.env.SUBSTRATE_LAYER2_KEY_ISSUED_AT
}
function check(label: string, ok: boolean, detail?: string) {
  if (ok) { pass++; console.log(`PASS — ${label}`) }
  else { fail++; console.log(`FAIL — ${label}${detail ? ' :: ' + detail : ''}`) }
}

async function run() {
  unsetCurrent(); unsetAllPrevious(); setCurrent()
  let res = await GET()
  let body: any = await res.json()
  check('Scenario 1: status 200', res.status === 200, `got ${res.status}`)
  check('Scenario 1: previous is null', body.previous === null)
  check('Scenario 1: rotation_overlap_until is null', body.rotation_overlap_until === null)
  check('Scenario 1: current key_id preserved', body.key_id === TEST_CURRENT_KEY_ID)
  check('Scenario 1: algorithm is Ed25519', body.algorithm === 'Ed25519')

  setAllPrevious()
  res = await GET(); body = await res.json()
  check('Scenario 2: status 200', res.status === 200)
  check('Scenario 2: previous is non-null', body.previous !== null)
  check('Scenario 2: previous.key_id matches', body.previous?.key_id === TEST_PREVIOUS_KEY_ID)
  check('Scenario 2: previous.public_key_pem matches', body.previous?.public_key_pem === TEST_PREVIOUS_PUBLIC_KEY)
  check('Scenario 2: previous.issued_at matches', body.previous?.issued_at === TEST_PREVIOUS_ISSUED_AT)
  check('Scenario 2: previous.retires_at matches', body.previous?.retires_at === TEST_PREVIOUS_RETIRES_AT)
  check('Scenario 2: rotation_overlap_until mirrors previous.retires_at',
    body.rotation_overlap_until === TEST_PREVIOUS_RETIRES_AT)
  check('Scenario 2: current key fields preserved',
    body.key_id === TEST_CURRENT_KEY_ID && body.public_key_pem === TEST_CURRENT_PUBLIC_KEY)

  setAllPrevious(); delete process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY
  res = await GET(); body = await res.json()
  check('Scenario 3a: PREVIOUS_PUBLIC_KEY unset → previous=null',
    body.previous === null && body.rotation_overlap_until === null)

  setAllPrevious(); delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ID
  res = await GET(); body = await res.json()
  check('Scenario 3b: PREVIOUS_KEY_ID unset → previous=null',
    body.previous === null && body.rotation_overlap_until === null)

  setAllPrevious(); delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_ISSUED_AT
  res = await GET(); body = await res.json()
  check('Scenario 3c: PREVIOUS_KEY_ISSUED_AT unset → previous=null',
    body.previous === null && body.rotation_overlap_until === null)

  setAllPrevious(); delete process.env.SUBSTRATE_LAYER2_PREVIOUS_KEY_RETIRES_AT
  res = await GET(); body = await res.json()
  check('Scenario 3d: PREVIOUS_KEY_RETIRES_AT unset → previous=null',
    body.previous === null && body.rotation_overlap_until === null)

  setAllPrevious(); process.env.SUBSTRATE_LAYER2_PREVIOUS_PUBLIC_KEY = ''
  res = await GET(); body = await res.json()
  check('Scenario 3e: empty-string previous env var → previous=null (fail-safe)',
    body.previous === null && body.rotation_overlap_until === null)

  unsetCurrent(); unsetAllPrevious()
  res = await GET(); body = await res.json()
  check('Scenario 4: current PUBLIC_KEY unset → status 503', res.status === 503)
  check('Scenario 4: error code is substrate_public_key_unavailable',
    body.error === 'substrate_public_key_unavailable')

  setCurrent(); unsetAllPrevious()
  res = await GET(); body = await res.json()
  const call1Previous = body.previous
  setAllPrevious()
  res = await GET(); body = await res.json()
  const call2Previous = body.previous
  unsetAllPrevious()
  res = await GET(); body = await res.json()
  const call3Previous = body.previous
  check('Scenario 5: call 1 (no prev env) → previous=null', call1Previous === null)
  check('Scenario 5: call 2 (prev env set) → previous populated',
    call2Previous !== null && call2Previous.key_id === TEST_PREVIOUS_KEY_ID)
  check('Scenario 5: call 3 (prev env unset) → previous=null', call3Previous === null)

  setCurrent()
  res = await GET()
  const cacheControl = res.headers.get('Cache-Control')
  check('A3 contract: Cache-Control = public, max-age=3600, s-maxage=3600',
    cacheControl === 'public, max-age=3600, s-maxage=3600',
    `got ${cacheControl}`)

  console.log()
  console.log(`=== ${pass} PASS / ${fail} FAIL out of ${pass + fail} invariants ===`)
  if (fail > 0) process.exit(1)
}

run().catch((e) => { console.error('Smoke test threw:', e); process.exit(2) })
