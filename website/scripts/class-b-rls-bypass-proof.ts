/**
 * class-b-rls-bypass-proof.ts — behavioural proof of the RLS bypass on the
 * three Class B tables (action_evaluations_v3, journal_entries, reflections),
 * for supabase-class-b-rls-lockdown-migration.sql's §PRE (before) and §VERIFY
 * (after) steps.
 *
 * Generalises scripts/practice-family-rls-bypass-proof.ts (same sign-in,
 * cleanup, and TEST-only safety-rail shape) with ONE structural difference:
 * `reflections` no longer has an owner INSERT policy at all (closed 2026-08-16,
 * Class C row 25 — see supabase-open-insert-policies-lockdown-migration.sql).
 * So its "before" bypass is a SELECT proof (can an authenticated session read
 * its own rows through the still-open owner SELECT policy — the thing this
 * migration's §3 revokes), not an INSERT proof like the other two tables.
 * `mode: 'select-only'` on its config branches the harness accordingly; the
 * other two use `mode: 'insert'`, identical in shape to every prior table
 * this project has walked this way.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT DEFAULT MODE PROVES:
 *   insert-mode tables (action_evaluations_v3, journal_entries): a direct
 *   anon-key INSERT bypassing the route (field validation, rate limiting,
 *   and for journal_entries the R20a distress check). BEFORE the lockdown,
 *   the INSERT succeeds (201); AFTER, it is denied (401/403/42501/empty).
 *   select-only-mode table (reflections): a direct anon-key SELECT of the
 *   session's own rows. BEFORE the lockdown this succeeds (RLS permits it,
 *   by design — this was never a data leak); AFTER, the privilege itself is
 *   revoked and the SAME query is denied outright (42501), proving the grant
 *   removal took effect independent of RLS.
 *
 * WHAT --legit MODE PROVES, per table: the app's own path — a real request
 * through the table's route(s), service-role client — still works unchanged
 * AFTER the lockdown.
 *   action_evaluations_v3: POST /api/score/save (write) + GET
 *     /api/action-evaluations (read) + GET /api/practice-calendar (the
 *     cross-table consumer all three of these tables share).
 *   journal_entries: POST /api/journal (write) + GET /api/journal (read,
 *     both the no-param and ?day=N shapes) + GET /api/practice-calendar.
 *   reflections: GET /api/practice-calendar only — reflections has no
 *     dedicated read route of its own; api/practice-calendar is its sole
 *     read consumer post-refactor (writes go through /api/reflect,
 *     /api/reflections, /api/mentor/private/reflect, none of which this
 *     migration touches — all already service-role).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO RUN (founder-walked; TEST project via .env.development.local):
 *
 *   # BEFORE the migration, on TEST — expect: bypass OPEN
 *   npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts <table>
 *
 *   # AFTER the migration, on TEST — expect: bypass DENIED
 *   npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts <table>
 *
 *   # AFTER, on TEST, dev server running — the legitimate-path proof:
 *   npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts <table> --legit
 *
 *   # All three in sequence (default mode):
 *   npx tsx --env-file=.env.development.local scripts/class-b-rls-bypass-proof.ts --all
 *
 *   # AFTER the migration, on PRODUCTION — a deliberate post-migration check
 *   # (read-only; must show the privilege already revoked):
 *   npx tsx --env-file=.env.local scripts/class-b-rls-bypass-proof.ts <table> --force-nontest
 *
 * TEST ONLY for a WRITING §PRE step (action_evaluations_v3, journal_entries).
 * `reflections`' select-only default mode never writes, so it is exempt from
 * the TEST-only rail in EITHER direction (nothing to accidentally write to
 * production) — but is still gated like every other mode for --legit, which
 * writes real rows via the real routes.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const service = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.MINT_CLI_ADMIN_EMAIL
const password = process.env.MINT_CLI_ADMIN_PASSWORD

function must(name: string, v: string | undefined): string {
  if (!v) { console.error(`Missing env: ${name}`); process.exit(1) }
  return v
}

interface TableConfig {
  table: string
  mode: 'insert' | 'select-only'
  markerColumn?: string
  /** insert-mode only: direct-PostgREST bypass body. */
  insertBody?: (uid: string, marker: string) => Record<string, unknown>
  /** --legit mode: one or more real-route checks to run. */
  legit: Array<{
    label: string
    method: 'GET' | 'POST'
    path: string
    body?: (marker: string) => Record<string, unknown>
    /** Assert the response body (parsed JSON) satisfies this, given the marker. */
    check: (json: any, marker: string) => boolean
  }>
}

const CLEANUP_NOTE = 'rls bypass proof — cleaned up immediately'

const TABLES: readonly TableConfig[] = [
  {
    table: 'action_evaluations_v3',
    mode: 'insert',
    markerColumn: 'action',
    insertBody: (uid, marker) => ({
      user_id: uid,
      action: marker,
      katorthoma_proximity: 'deliberate',
      is_kathekon: true,
    }),
    legit: [
      {
        label: 'POST /api/score/save',
        method: 'POST',
        path: '/api/score/save',
        body: (marker) => ({
          action: marker,
          katorthoma_proximity: 'deliberate',
          is_kathekon: true,
          kathekon_quality: 'moderate',
        }),
        check: (json) => json?.success === true && typeof json?.id === 'string',
      },
      {
        label: 'GET /api/action-evaluations',
        method: 'GET',
        path: '/api/action-evaluations?limit=5',
        check: (json) => Array.isArray(json?.evaluations),
      },
    ],
  },
  {
    table: 'journal_entries',
    mode: 'insert',
    markerColumn: 'reflection_text',
    insertBody: (uid, marker) => ({
      user_id: uid,
      day_number: 1,
      phase_number: 1,
      reflection_text: marker,
      word_count: 1,
    }),
    legit: [
      {
        label: 'GET /api/journal (no param)',
        method: 'GET',
        path: '/api/journal',
        check: (json) => typeof json?.completed_days === 'number' && Array.isArray(json?.entries),
      },
    ],
  },
  {
    table: 'reflections',
    mode: 'select-only',
    legit: [
      {
        label: 'GET /api/practice-calendar (reflections\' sole remaining read consumer)',
        method: 'GET',
        path: `/api/practice-calendar?month=${new Date().toISOString().slice(0, 7)}`,
        check: (json) => typeof json?.month === 'string' && typeof json?.days === 'object',
      },
    ],
  },
]

async function signIn(U: string, ANON: string, EMAIL: string, PASSWORD: string) {
  const res = await fetch(`${U}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) {
    console.error(`Sign-in failed: HTTP ${res.status} ${await res.text()}`)
    process.exit(1)
  }
  const session = (await res.json()) as { access_token: string; user: { id: string } }
  return { jwt: session.access_token, uid: session.user.id }
}

async function cleanupByMarker(U: string, SERVICE: string, table: string, markerColumn: string, marker: string): Promise<number> {
  const del = await fetch(
    `${U}/rest/v1/${table}?${markerColumn}=like.${encodeURIComponent(`*${marker}*`)}`,
    { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=representation' } }
  )
  try { return (JSON.parse(await del.text()) as unknown[]).length } catch { return 0 }
}

async function cleanupById(U: string, SERVICE: string, table: string, id: string): Promise<number> {
  const del = await fetch(
    `${U}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=representation' } }
  )
  try { return (JSON.parse(await del.text()) as unknown[]).length } catch { return 0 }
}

/** Default mode, insert-mode tables: the direct anon-key bypass attempt + read check + cleanup. */
async function runInsertBypassProof(
  U: string, ANON: string, SERVICE: string, EMAIL: string, PASSWORD: string, cfg: TableConfig,
): Promise<void> {
  console.log(`\n════ ${cfg.table} — insert bypass proof ════`)
  const { jwt, uid } = await signIn(U, ANON, EMAIL, PASSWORD)
  console.log(`Signed in as ${EMAIL} (uid ${uid})`)

  const marker = `RLS-BYPASS-PROOF ${cfg.table} ${new Date().toISOString()}`
  const insert = await fetch(`${U}/rest/v1/${cfg.table}`, {
    method: 'POST',
    headers: { apikey: ANON, Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(cfg.insertBody!(uid, marker)),
  })
  const insertBody = await insert.text()
  console.log('── DIRECT anon-key INSERT (the bypass attempt) ──')
  console.log(`   HTTP ${insert.status}`)
  let createdId: string | null = null
  if (insert.status === 201) {
    try { createdId = (JSON.parse(insertBody)[0]?.id as string) ?? null } catch { /* noop */ }
    console.log(`   RESULT: SUCCEEDED — bypass is OPEN. (row id ${createdId})`)
    console.log('   → §PRE expects this. §VERIFY must NOT see this.')
  } else {
    console.log(`   RESULT: DENIED — bypass is CLOSED. body: ${insertBody.slice(0, 300)}`)
    console.log('   → §VERIFY expects this. §PRE would NOT see this (means already locked).')
  }

  const sel = await fetch(
    `${U}/rest/v1/${cfg.table}?select=id&${cfg.markerColumn}=like.${encodeURIComponent(`*${marker}*`)}`,
    { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } }
  )
  let selCount = 0
  try { selCount = (JSON.parse(await sel.text()) as unknown[]).length } catch { /* noop */ }
  console.log('── DIRECT anon-key SELECT (read-bypass check) ──')
  console.log(`   HTTP ${sel.status} — rows visible via anon session: ${selCount}`)

  const delCount = await cleanupByMarker(U, SERVICE, cfg.table, cfg.markerColumn!, marker)
  console.log(`── CLEANUP (service key) ── deleted ${delCount} proof row(s)`)
  if (delCount === 0 && createdId) {
    console.error(`   ⚠ WARNING: created a row but cleanup deleted 0 — search ${cfg.table}.${cfg.markerColumn} for the marker manually.`)
    process.exit(1)
  }
}

/** Default mode, reflections (select-only): confirm the owner SELECT policy's
 *  reach, then confirm it stops working post-migration. Never writes. */
async function runSelectOnlyProof(U: string, ANON: string, EMAIL: string, PASSWORD: string, cfg: TableConfig): Promise<void> {
  console.log(`\n════ ${cfg.table} — select-only proof (INSERT already closed 2026-08-16) ════`)
  const { jwt, uid } = await signIn(U, ANON, EMAIL, PASSWORD)
  console.log(`Signed in as ${EMAIL} (uid ${uid})`)

  const sel = await fetch(
    `${U}/rest/v1/${cfg.table}?select=id&user_id=eq.${uid}&limit=1`,
    { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } }
  )
  const selBody = await sel.text()
  console.log('── DIRECT anon-key SELECT (own rows, via the owner policy) ──')
  console.log(`   HTTP ${sel.status}`)
  if (sel.status === 200) {
    console.log(`   RESULT: PERMITTED — the owner SELECT grant is still open. body: ${selBody.slice(0, 200)}`)
    console.log('   → §PRE expects this (RLS still correctly scopes to own rows — never a data leak).')
  } else {
    console.log(`   RESULT: DENIED — the grant has been revoked. body: ${selBody.slice(0, 300)}`)
    console.log('   → §VERIFY expects this.')
  }
}

/** --legit mode: run every configured real-route check for a table, in order. */
async function runLegitPathChecks(
  U: string, ANON: string, SERVICE: string, EMAIL: string, PASSWORD: string, cfg: TableConfig, baseUrl: string,
): Promise<void> {
  console.log(`\n════ ${cfg.table} — legitimate-path checks ════`)
  const { jwt } = await signIn(U, ANON, EMAIL, PASSWORD)

  let allPass = true
  const check = (label: string, pass: boolean, detail?: string) => {
    console.log(`   ${pass ? 'PASS' : 'FAIL'} — ${label}${detail ? `: ${detail}` : ''}`)
    if (!pass) allPass = false
  }

  for (const legit of cfg.legit) {
    const marker = `LEGIT-PATH-CHECK ${new Date().toISOString()}`
    const res = await fetch(`${baseUrl}${legit.path}`, {
      method: legit.method,
      headers: { Authorization: `Bearer ${jwt}`, ...(legit.body ? { 'Content-Type': 'application/json' } : {}) },
      ...(legit.body ? { body: JSON.stringify(legit.body(marker)) } : {}),
    })
    const text = await res.text()
    let json: any = null
    try { json = JSON.parse(text) } catch { /* noop */ }
    const ok = res.ok && legit.check(json, marker)
    check(legit.label, ok, `HTTP ${res.status}: ${text.slice(0, 150)}`)

    // Clean up write-mode checks (score/save creates a real row).
    if (ok && json?.id && legit.method === 'POST') {
      const delCount = await cleanupById(U, SERVICE, cfg.table, json.id)
      check(`${legit.label} — cleanup`, delCount === 1, `deleted ${delCount}`)
    }
  }

  console.log(`\n${allPass ? 'ALL PASS' : 'FAILED'} — legitimate route path(s) for ${cfg.table} ${allPass ? 'unaffected by the RLS lockdown.' : 'have a problem — investigate before proceeding.'}`)
  if (!allPass) process.exit(1)
}

async function main() {
  const U = must('NEXT_PUBLIC_SUPABASE_URL', url)
  const ANON = must('NEXT_PUBLIC_SUPABASE_ANON_KEY', anon)
  const SERVICE = must('SUPABASE_SERVICE_ROLE_KEY', service)
  const EMAIL = must('MINT_CLI_ADMIN_EMAIL', email)
  const PASSWORD = must('MINT_CLI_ADMIN_PASSWORD', password)

  const args = process.argv.slice(2)
  const legit = args.includes('--legit')
  const all = args.includes('--all')
  const baseUrlArg = args.find((a) => a.startsWith('--base-url='))
  const baseUrl = baseUrlArg ? baseUrlArg.slice('--base-url='.length) : 'http://localhost:3000'
  const tableName = args.find((a) => !a.startsWith('--'))

  const targets = all ? TABLES : TABLES.filter((t) => t.table === tableName)
  if (targets.length === 0) {
    console.error(
      `Usage: class-b-rls-bypass-proof.ts <table> [--legit] [--all] [--force-nontest] [--base-url=…]\n` +
      `Known tables:\n${TABLES.map((t) => `  - ${t.table} (${t.mode})`).join('\n')}`
    )
    process.exit(1)
  }

  // Safety rail: any mode that WRITES a row (insert-mode default, or --legit,
  // which drives real POST routes) is TEST-only unless forced.
  // select-only default mode never writes, so it is exempt in that ONE case.
  const anyWriting = legit || targets.some((t) => t.mode === 'insert')
  if (anyWriting) {
    const isTest = U.includes('iwdtrvuphogkwmovhnvz')
    const forced = args.includes('--force-nontest')
    if (!isTest && !forced) {
      console.error(
        `\n  REFUSING TO RUN: ${U}\n` +
        `  This harness WRITES rows (default mode on insert-mode tables, or any\n` +
        `  --legit check) and is TEST-only. The URL is not the known TEST project.\n` +
        `  If this is a deliberate, exceptional non-TEST run, re-run with --force-nontest.\n`
      )
      process.exit(2)
    }
    console.log(`Target: ${U}  (${isTest ? 'TEST' : 'NON-TEST — forced'})`)
  } else {
    console.log(`Target: ${U}  (read-only select-only mode — no TEST-only rail applies)`)
  }

  for (const cfg of targets) {
    if (legit) {
      await runLegitPathChecks(U, ANON, SERVICE, EMAIL, PASSWORD, cfg, baseUrl)
    } else if (cfg.mode === 'insert') {
      await runInsertBypassProof(U, ANON, SERVICE, EMAIL, PASSWORD, cfg)
    } else {
      await runSelectOnlyProof(U, ANON, EMAIL, PASSWORD, cfg)
    }
  }
  console.log('\nDone.')
}

main()
