/**
 * practice-family-rls-bypass-proof.ts — behavioural proof of the RLS bypass on
 * the ten practice-family / mentor-examination tables (survey Class A rows
 * 2–11), for the practice-family lockdown migration's §PRE (before) and
 * §VERIFY (after) steps.
 *
 * Generalises scripts/impulse-rls-bypass-proof.ts (row 1's harness) to a
 * per-table config: same sign-in, same direct anon-key INSERT + SELECT probe,
 * same service-key cleanup, same TEST-only safety rail. One script, ten
 * tables, so the walk is `for each table: run` rather than ten hand-edited
 * copies.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT DEFAULT MODE PROVES, per table: that an ordinary AUTHENTICATED
 * practitioner, holding only the public anon key and their own session JWT,
 * can write a row DIRECTLY via PostgREST — bypassing the route and with it
 * field validation, rate limiting, and the R20a distress check. BEFORE the
 * lockdown migration the INSERT succeeds (201); AFTER it, the same INSERT is
 * denied (401/403/42501/empty). The diff is the fix, proven behaviourally.
 *
 * WHAT --legit MODE PROVES, per table: that the app's own path — a real POST
 * through the table's Next.js route, service-role client — still works
 * unchanged AFTER the lockdown. Asserts HTTP 200, confirms the row landed
 * (service-key SELECT by marker), then deletes it (service key). Requires a
 * running dev server started with the same env file.
 *
 *   EXCEPTION: mentor_baseline_appendix has NO --legit config. Its write path
 *   runs the full appendix generation flow (LLM question generation +
 *   encrypted payload assembly) — driving that from a harness would test the
 *   harness, not the lockdown. Its legitimate-path check is a founder UI walk
 *   (the baseline appendix flow), per the founder-conversations precedent.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO RUN (founder-walked; TEST project via .env.development.local):
 *
 *   # BEFORE the migration, on TEST — expect: INSERT SUCCEEDS (bypass open)
 *   npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts <table>
 *
 *   # AFTER the migration, on TEST — expect: INSERT DENIED (bypass closed)
 *   npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts <table>
 *
 *   # AFTER, on TEST, dev server running — the legitimate-path proof:
 *   npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts <table> --legit
 *
 *   # All ten in sequence (default mode):
 *   npx tsx --env-file=.env.development.local scripts/practice-family-rls-bypass-proof.ts --all
 *
 *   # AFTER the migration, on PRODUCTION — a deliberate post-migration check
 *   # (must FAIL and therefore write nothing):
 *   npx tsx --env-file=.env.local scripts/practice-family-rls-bypass-proof.ts <table> --force-nontest
 *
 * TEST ONLY for the §PRE step — §PRE deliberately WRITES a bypass row, and we
 * never write a bypass row to a real practitioner's table. Requires in the env
 * file: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
 * SUPABASE_SERVICE_ROLE_KEY, MINT_CLI_ADMIN_EMAIL, MINT_CLI_ADMIN_PASSWORD.
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

// ─────────────────────────────────────────────────────────────────────────────
// Per-table config. `insertBody` must satisfy every NOT NULL + CHECK on the
// table (verified against each table's own migration DDL, 2026-08-22). The
// marker rides in `markerColumn` so cleanup-by-marker works in both modes.
// Circle vocabularies use the post-C15 canonical spellings where the route
// enforces them ('self_preservation'); the DB CHECKs accept both.
// ─────────────────────────────────────────────────────────────────────────────

interface TableConfig {
  table: string
  markerColumn: string
  /** Direct-PostgREST bypass body (default mode). */
  insertBody: (uid: string, marker: string) => Record<string, unknown>
  /** Route POST body (--legit mode); omitted ⇒ founder UI walk (see header). */
  legit?: { path: string; body: (marker: string) => Record<string, unknown> }
}

const CLEANUP_NOTE = 'rls bypass proof — cleaned up immediately'

const TABLES: readonly TableConfig[] = [
  {
    table: 'sage_compass_entries',
    markerColumn: 'situation',
    insertBody: (uid, marker) => ({
      user_id: uid,
      situation: marker,
      action_considered: CLEANUP_NOTE,
      virtue_engaged: 'wisdom',
      complete_expression: 'n/a — this row exists only to prove the RLS bypass',
      distance: 'n/a',
    }),
    legit: {
      path: '/api/mentor/sage-compass',
      body: (marker) => ({
        situation: `${marker} — choosing whether to raise a delivery risk with the team now or wait`,
        action_considered: 'Wait until Friday and hope the risk resolves itself',
        virtue_engaged: 'courage',
        complete_expression:
          'Complete courage here names the risk at tomorrow morning\'s standup, with the evidence, before it compounds',
        distance: 'I am one honest sentence away from it; the gap is the waiting',
      }),
    },
  },
  {
    table: 'morning_preparation_entries',
    markerColumn: 'roles_active',
    insertBody: (uid, marker) => ({
      user_id: uid,
      roles_active: marker,
      expected_impressions: CLEANUP_NOTE,
      prepared_virtue_response: 'n/a — this row exists only to prove the RLS bypass',
    }),
    legit: {
      path: '/api/mentor/morning',
      body: (marker) => ({
        roles_active: `${marker} — engineer on the release; parent on the school run`,
        expected_impressions: 'A terse review comment is likely; it will feel like an attack',
        prepared_virtue_response:
          'Read the comment twice before replying, and answer the substance of it, not the tone',
      }),
    },
  },
  {
    table: 'view_from_above_entries',
    markerColumn: 'concern',
    insertBody: (uid, marker) => ({
      user_id: uid,
      concern: marker,
      recalibrated_reading: CLEANUP_NOTE,
    }),
    legit: {
      path: '/api/mentor/view-from-above',
      body: (marker) => ({
        concern: `${marker} — the launch slipping a week feels catastrophic today`,
        recalibrated_reading:
          'In a year this is one line in a retro; the work itself is sound and the week changes nothing durable',
      }),
    },
  },
  {
    table: 'reserve_clause_entries',
    markerColumn: 'outcome_pursued',
    insertBody: (uid, marker) => ({
      user_id: uid,
      outcome_pursued: marker,
      prepared_response: CLEANUP_NOTE,
    }),
    legit: {
      path: '/api/mentor/hupexairesis',
      body: (marker) => ({
        outcome_pursued: `${marker} — the conference talk being accepted`,
        prepared_response:
          'If it is not accepted, the abstract becomes a blog post and the preparation was still the practice',
      }),
    },
  },
  {
    table: 'circle_extension_entries',
    markerColumn: 'situation',
    insertBody: (uid, marker) => ({
      user_id: uid,
      situation: marker,
      current_circle: 'self_preservation',
      extended_circle: 'household',
      extended_reasoning: CLEANUP_NOTE,
      assessment_shift: 'n/a — this row exists only to prove the RLS bypass',
    }),
    legit: {
      path: '/api/mentor/oikeiosis/extension',
      body: (marker) => ({
        situation: `${marker} — deciding whether to take the weekend on-call shift`,
        current_circle: 'self_preservation',
        extended_circle: 'household',
        extended_reasoning: 'From the household circle, the shift trades my rest against the family weekend',
        assessment_shift: 'The money stops being the deciding factor; the weekend plans get a vote',
      }),
    },
  },
  {
    table: 'oikeiosis_reflections',
    markerColumn: 'action_description',
    insertBody: (uid, marker) => ({
      user_id: uid,
      quarter: 1,
      year: 2026,
      stage: 'household',
      action_description: marker,
    }),
    legit: {
      path: '/api/mentor/oikeiosis',
      body: (marker) => ({
        quarter: 3,
        year: 2026,
        stage: 'household',
        action_description: `${marker} — organised care for a parent this quarter without announcing it anywhere`,
        reputational_return: 'no',
      }),
    },
  },
  {
    table: 'premeditatio_entries',
    markerColumn: 'anticipated_event',
    insertBody: (uid, marker) => ({
      user_id: uid,
      anticipated_event: marker,
      false_impression: CLEANUP_NOTE,
      correct_judgement: 'n/a — this row exists only to prove the RLS bypass',
    }),
    legit: {
      path: '/api/mentor/premeditatio',
      body: (marker) => ({
        anticipated_event: `${marker} — Monday's stakeholder review may reject the proposal`,
        false_impression: 'A rejection would mean the quarter was wasted',
        correct_judgement:
          'The proposal was one use of the quarter\'s work; the analysis stands whichever way the review goes',
      }),
    },
  },
  {
    table: 'passion_events',
    markerColumn: 'false_judgement',
    insertBody: (uid, marker) => ({
      user_id: uid,
      passion_type: 'orge',
      intensity: 2,
      caught_before_assent: true,
      false_judgement: marker,
    }),
    legit: {
      path: '/api/mentor/passion-log',
      body: (marker) => ({
        passion_type: 'orge',
        intensity: 2,
        caught_before_assent: true,
        false_judgement: `${marker} — "they ignored my message deliberately"`,
        description: 'A colleague did not reply for a day and I felt the anger rise before remembering their week',
      }),
    },
  },
  {
    table: 'realtime_journal_entries',
    markerColumn: 'impression',
    insertBody: (uid, marker) => ({
      user_id: uid,
      impression: marker,
      assent: CLEANUP_NOTE,
      action: 'n/a — this row exists only to prove the RLS bypass',
    }),
    legit: {
      path: '/api/mentor/journal-feed',
      body: (marker) => ({
        impression: `${marker} — the inbox looked like an accusation this morning`,
        assent: 'Withheld — an unread count is a number, not a verdict',
        action: 'Worked the two oldest threads first, then closed the tab',
      }),
    },
  },
  {
    table: 'mentor_baseline_appendix',
    markerColumn: 'receipt_id',
    insertBody: (uid, marker) => ({
      user_id: uid,
      submitted_at: new Date().toISOString(),
      responses_processed: 0,
      receipt_id: marker,
      encrypted_payload: 'bypass-proof-not-real-ciphertext',
      encryption_meta: { note: CLEANUP_NOTE },
    }),
    // No legit config — see the header's EXCEPTION note.
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

async function cleanupByMarker(U: string, SERVICE: string, cfg: TableConfig, marker: string): Promise<number> {
  const del = await fetch(
    `${U}/rest/v1/${cfg.table}?${cfg.markerColumn}=like.${encodeURIComponent(`*${marker}*`)}`,
    { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=representation' } }
  )
  try { return (JSON.parse(await del.text()) as unknown[]).length } catch { return 0 }
}

/** Default mode: the direct anon-key bypass attempt + read check + cleanup. */
async function runBypassProof(
  U: string, ANON: string, SERVICE: string, EMAIL: string, PASSWORD: string, cfg: TableConfig,
): Promise<void> {
  console.log(`\n════ ${cfg.table} — bypass proof ════`)
  const { jwt, uid } = await signIn(U, ANON, EMAIL, PASSWORD)
  console.log(`Signed in as ${EMAIL} (uid ${uid})`)

  const marker = `RLS-BYPASS-PROOF ${cfg.table} ${new Date().toISOString()}`
  const insert = await fetch(`${U}/rest/v1/${cfg.table}`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(cfg.insertBody(uid, marker)),
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

  const delCount = await cleanupByMarker(U, SERVICE, cfg, marker)
  console.log(`── CLEANUP (service key) ── deleted ${delCount} proof row(s)`)
  if (delCount === 0 && createdId) {
    console.error(`   ⚠ WARNING: created a row but cleanup deleted 0 — search ${cfg.table}.${cfg.markerColumn} for the marker manually.`)
    process.exit(1)
  }
}

/** --legit mode: POST through the real route, confirm the row landed, clean up. */
async function runLegitPathCheck(
  U: string, ANON: string, SERVICE: string, EMAIL: string, PASSWORD: string,
  cfg: TableConfig, baseUrl: string,
): Promise<void> {
  if (!cfg.legit) {
    console.error(
      `${cfg.table} has no --legit config (its write path is the full appendix generation flow).\n` +
      `Verify its legitimate path via the founder UI walk instead — see the harness header.`
    )
    process.exit(1)
  }
  console.log(`\n════ ${cfg.table} — legitimate-path check (${cfg.legit.path}) ════`)
  const { jwt } = await signIn(U, ANON, EMAIL, PASSWORD)

  const marker = `LEGIT-PATH-CHECK ${new Date().toISOString()}`
  let allPass = true
  const check = (label: string, pass: boolean, detail?: string) => {
    console.log(`   ${pass ? 'PASS' : 'FAIL'} — ${label}${detail ? `: ${detail}` : ''}`)
    if (!pass) allPass = false
  }

  const post = await fetch(`${baseUrl}${cfg.legit.path}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cfg.legit.body(marker)),
  })
  const postText = await post.text()
  check('route POST returns HTTP 200', post.status === 200, `got ${post.status}: ${postText.slice(0, 200)}`)

  // The row landed — confirmed via the service key, which sees through RLS.
  const sel = await fetch(
    `${U}/rest/v1/${cfg.table}?select=id&${cfg.markerColumn}=like.${encodeURIComponent(`*${marker}*`)}`,
    { headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` } }
  )
  let rowCount = 0
  try { rowCount = (JSON.parse(await sel.text()) as unknown[]).length } catch { /* noop */ }
  check('row persisted via the route (service-key read)', rowCount === 1, `saw ${rowCount}`)

  const delCount = await cleanupByMarker(U, SERVICE, cfg, marker)
  check('proof row deleted', delCount === rowCount, `deleted ${delCount}`)

  console.log(`\n${allPass ? 'ALL PASS' : 'FAILED'} — legitimate route path ${allPass ? 'is unaffected by the RLS lockdown.' : 'has a problem — investigate before proceeding.'}`)
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

  const targets = all
    ? TABLES
    : TABLES.filter((t) => t.table === tableName)
  if (targets.length === 0) {
    console.error(
      `Usage: practice-family-rls-bypass-proof.ts <table> [--legit] [--all] [--force-nontest] [--base-url=…]\n` +
      `Known tables:\n${TABLES.map((t) => `  - ${t.table}`).join('\n')}`
    )
    process.exit(1)
  }

  if (!legit) {
    // Safety rail (identical to the impulse harness): the write proof is
    // TEST-only unless explicitly forced. (TEST project ref: iwdtrvuphogkwmovhnvz.)
    const isTest = U.includes('iwdtrvuphogkwmovhnvz')
    const forced = args.includes('--force-nontest')
    if (!isTest && !forced) {
      console.error(
        `\n  REFUSING TO RUN: ${U}\n` +
        `  This harness WRITES bypass rows and is TEST-only. The URL is not the\n` +
        `  known TEST project. If this is a deliberate post-migration production\n` +
        `  check (which must FAIL and write nothing), re-run with --force-nontest.\n`
      )
      process.exit(2)
    }
    console.log(`Target: ${U}  (${isTest ? 'TEST' : 'NON-TEST — forced'})`)
  }

  for (const cfg of targets) {
    if (legit) await runLegitPathCheck(U, ANON, SERVICE, EMAIL, PASSWORD, cfg, baseUrl)
    else await runBypassProof(U, ANON, SERVICE, EMAIL, PASSWORD, cfg)
  }
  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })

// Module marker: makes this file an ES module so its top-level bindings are
// module-scoped, not global. Without it, tsc treats this and the sibling
// impulse-rls-bypass-proof.ts (also a bare script) as one global scope and
// their identical `const url`/`anon`/… collide. `export {}` adds no runtime
// surface; tsx runs the file identically.
export {}
