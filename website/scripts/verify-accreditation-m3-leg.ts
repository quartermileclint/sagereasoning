/**
 * verify-accreditation-m3-leg.ts — TEST-only end-to-end proof of the M3
 * accreditation fixes (mechanism-correction M3, 2026-06-13):
 *   - CI-12: write/read agent_id reconcile (FX-11). A record written on a
 *     K1-canonical id must be readable through the SAME public GET; a free-form
 *     id must be refused at BOTH ends.
 *   - CI-11: K1 coverage-status first slice. A freshly written credential must
 *     carry honest coverage values (coverage_status='agent_elected',
 *     monitored_since, a credential_basis whose window is labelled
 *     "self-reported by submitter" on the wrapper write path).
 *
 * It runs four probes and prints a PASS/FAIL line for each:
 *   1. POST a seed record on a K1-canonical id        → expect 200 ok
 *   2. GET that same id (the FX-11 repro)             → expect 200 + honest K1 fields
 *   3. GET an unknown-but-valid canonical id          → expect 404
 *   4. GET a free-form id (the old leg-B id)          → expect 400 (vocabulary)
 *
 * PRE-CONDITIONS (TEST — never production):
 *   - The K1 coverage migration applied on TEST (the three columns exist).
 *   - The dev server is running against TEST:  cd website && npm run dev
 *     with .env.development.local carrying SUBSTRATE_WRITE_PATH_ENABLED=true
 *     (TEST-only; removed at teardown) and NEITHER provenance nor loop-closure
 *     flag set to 'true' (so no provenance block / closure markers are required
 *     for this seed write).
 *   - An sr_assent_ credential minted on the agent id below (the mint CLI shows
 *     the token once) — pass it in via M3_ASSENT_TOKEN.
 *
 * RUN:
 *   cd website
 *   M3_ASSENT_TOKEN="sr_assent_..." \
 *     npx tsx --env-file=.env.development.local scripts/verify-accreditation-m3-leg.ts
 *
 * The --env-file is used only so the wrapper's transitive imports load cleanly;
 * createCarriedProfile is pure and the only network calls are HTTP to the local
 * dev server. Nothing here touches Supabase directly.
 */

export {} // mark as a module so top-level names don't collide with sibling scripts

const BASE_URL = process.env.M3_BASE_URL || 'http://localhost:3000'
const TOKEN = process.env.M3_ASSENT_TOKEN
const AGENT_ID = process.env.M3_AGENT_ID || 'sagereasoning:m3-test@v1'
const UNKNOWN_ID = 'sagereasoning:does-not-exist@v1'      // valid form, no row → 404
const FREEFORM_ID = 'p1-comparison-leg-b-agent'           // the FX-11 repro → 400

let pass = 0
let fail = 0
function report(label: string, ok: boolean, detail: string): void {
  if (ok) {
    pass++
    console.log(`PASS  ${label} — ${detail}`)
  } else {
    fail++
    console.log(`FAIL  ${label} — ${detail}`)
  }
}

async function getJson(path: string, init?: RequestInit): Promise<{ status: number; body: Record<string, unknown> }> {
  const res = await fetch(`${BASE_URL}${path}`, init)
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>
  return { status: res.status, body }
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error('\nERROR: set M3_ASSENT_TOKEN to the sr_assent_ token minted for ' + AGENT_ID + '.\n')
    process.exit(1)
  }
  console.log(`Target: ${BASE_URL}`)
  console.log(`Agent id (K1-canonical): ${AGENT_ID}\n`)

  // createCarriedProfile is pure; dynamic-import keeps any transitive module
  // load lazy (matches the whole-system-harness pattern).
  const { createCarriedProfile } = await import('../src/lib/substrate/sage-assent-wrapper')

  const encoded = encodeURIComponent(AGENT_ID)

  // 1) POST a seed record on the canonical id.
  const post = await getJson(`/api/accreditation/${encoded}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: 'seed', profile: createCarriedProfile(AGENT_ID) }),
  })
  report(
    '1. POST seed on canonical id',
    post.status === 200 && post.body.status === 'ok',
    `status ${post.status} ${JSON.stringify(post.body)}`,
  )

  // 2) GET that same id — the FX-11 repro: write-accepted ⇒ read-accepted.
  const get = await getJson(`/api/accreditation/${encoded}`)
  const data = (get.body.data ?? {}) as Record<string, unknown>
  const basis = typeof data.credential_basis === 'string' ? data.credential_basis : ''
  report(
    '2a. GET canonical id returns the record (FX-11 fix)',
    get.status === 200 && get.body.status === 'ok' && data.agent_id === AGENT_ID,
    `status ${get.status}, agent_id=${data.agent_id}`,
  )
  report(
    '2b. CI-11 coverage_status is honest (agent_elected)',
    data.coverage_status === 'agent_elected',
    `coverage_status=${data.coverage_status}, monitored_since=${data.monitored_since}`,
  )
  report(
    '2c. CI-11 credential_basis labels the window self-reported (wrapper path honesty)',
    basis.includes('window self-reported by submitter') && basis.includes(`identity ${AGENT_ID}`),
    `credential_basis="${basis}"`,
  )

  // 3) GET an unknown-but-valid canonical id → 404 (vocabulary accepts the form,
  //    no row exists).
  const unknown = await getJson(`/api/accreditation/${encodeURIComponent(UNKNOWN_ID)}`)
  report(
    '3. GET unknown valid id → 404',
    unknown.status === 404,
    `status ${unknown.status} (${UNKNOWN_ID})`,
  )

  // 4) GET a free-form id → 400 (the shared vocabulary rejects it — the same
  //    rejection the write boundary now enforces; this is the symmetry).
  const freeform = await getJson(`/api/accreditation/${encodeURIComponent(FREEFORM_ID)}`)
  report(
    '4. GET free-form id → 400 (vocabulary rejects)',
    freeform.status === 400,
    `status ${freeform.status} (${FREEFORM_ID})`,
  )

  console.log(`\n${pass} passed, ${fail} failed`)
  if (fail > 0) process.exit(1)
}

main().catch((err) => {
  console.error('\nERROR:', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
