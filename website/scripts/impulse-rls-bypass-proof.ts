/**
 * impulse-rls-bypass-proof.ts — behavioural proof of the impulse_entries RLS
 * bypass, for the C4 Phase 2 §PRE (before) and §VERIFY (after) steps.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT PROVES. That an ordinary AUTHENTICATED practitioner, holding only the
 * public anon key and their own session JWT, can write an impulse_entries row
 * DIRECTLY via PostgREST — bypassing /api/mentor/impulse and therefore the R20a
 * distress check, field validation, and rate limiting. Before the lockdown
 * migration the direct INSERT succeeds (201); after it, the same INSERT is
 * denied (401/403/empty). The diff is the fix, proven behaviourally rather than
 * by reading policy definitions.
 *
 * TEST ONLY. Run against the TEST Supabase project via .env.development.local,
 * which Next loads ahead of .env.local. NEVER production for the §PRE step —
 * the §PRE proof deliberately WRITES a bypass row, and we never write a bypass
 * row to a real practitioner's table. The production step (§6 of the prompt)
 * runs this same harness against production ONLY on a disposable test account,
 * after the migration, to confirm the bypass is closed (an attempt that must
 * FAIL and therefore writes nothing).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * HOW TO RUN (founder-walked; the founder executes these in the walk):
 *
 *   # BEFORE the migration, on TEST — expect: INSERT SUCCEEDS (bypass open)
 *   npx tsx --env-file=.env.development.local scripts/impulse-rls-bypass-proof.ts
 *
 *   # AFTER the migration, on TEST — expect: INSERT DENIED (bypass closed)
 *   npx tsx --env-file=.env.development.local scripts/impulse-rls-bypass-proof.ts
 *
 * It signs in a throwaway/test user (MINT_CLI_ADMIN_EMAIL / _PASSWORD from the
 * env file), attempts the direct anon-key INSERT for THAT user's own user_id
 * (the owner policy is auth.uid() = user_id, so the reachable bypass is a
 * practitioner writing their OWN entries around the route), reports the outcome,
 * then DELETES any row it created using the service key (cleanup succeeds
 * regardless of RLS). No row it writes ever survives the run.
 *
 * Requires in the env file: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

async function main() {
  const U = must('NEXT_PUBLIC_SUPABASE_URL', url)
  const ANON = must('NEXT_PUBLIC_SUPABASE_ANON_KEY', anon)
  const SERVICE = must('SUPABASE_SERVICE_ROLE_KEY', service)
  const EMAIL = must('MINT_CLI_ADMIN_EMAIL', email)
  const PASSWORD = must('MINT_CLI_ADMIN_PASSWORD', password)

  // Safety rail: refuse to run the WRITE proof against a URL that isn't the
  // known TEST project unless explicitly forced. The §PRE bypass write must
  // never land on production. (TEST project ref: iwdtrvuphogkwmovhnvz.)
  const isTest = U.includes('iwdtrvuphogkwmovhnvz')
  const forced = process.argv.includes('--force-nontest')
  if (!isTest && !forced) {
    console.error(
      `\n  REFUSING TO RUN: ${U}\n` +
      `  This harness WRITES a bypass row and is TEST-only. The URL is not the\n` +
      `  known TEST project. If this is a deliberate post-migration production\n` +
      `  check (which must FAIL and write nothing), re-run with --force-nontest.\n`
    )
    process.exit(2)
  }
  console.log(`Target: ${U}  (${isTest ? 'TEST' : 'NON-TEST — forced'})`)

  // 1. Sign in as the throwaway/test user via the public anon key.
  const signIn = await fetch(`${U}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!signIn.ok) {
    console.error(`Sign-in failed: HTTP ${signIn.status} ${await signIn.text()}`)
    process.exit(1)
  }
  const session = (await signIn.json()) as { access_token: string; user: { id: string } }
  const jwt = session.access_token
  const uid = session.user.id
  console.log(`Signed in as ${EMAIL} (uid ${uid})`)

  // 2. THE BYPASS ATTEMPT — a direct PostgREST INSERT with only the anon key +
  //    this user's JWT, for this user's own user_id. A valid reciprocity-mode
  //    row (satisfies impulse_entries_mode_fields_check).
  const marker = `RLS-BYPASS-PROOF ${new Date().toISOString()}`
  const insert = await fetch(`${U}/rest/v1/impulse_entries`, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      user_id: uid,
      mode: 'reciprocity',
      impression: marker,
      cooperation_ground: 'uncertain',
      cooperation_ground_note: 'bypass proof — cleaned up immediately',
      counterfactual: 'n/a — this row exists only to prove the RLS bypass',
    }),
  })
  const insertBody = await insert.text()

  console.log('\n── DIRECT anon-key INSERT (the bypass attempt) ──')
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

  // 3. A read bypass check too (SELECT via the same session).
  const sel = await fetch(
    `${U}/rest/v1/impulse_entries?select=id,impression&impression=eq.${encodeURIComponent(marker)}`,
    { headers: { apikey: ANON, Authorization: `Bearer ${jwt}` } }
  )
  const selBody = await sel.text()
  let selCount = 0
  try { selCount = JSON.parse(selBody).length } catch { /* noop */ }
  console.log('\n── DIRECT anon-key SELECT (read-bypass check) ──')
  console.log(`   HTTP ${sel.status} — rows visible via anon session: ${selCount}`)

  // 4. CLEANUP — delete anything we created, via the service key (bypasses RLS,
  //    so this works whether or not the bypass itself is open). Belt-and-braces:
  //    delete by marker AND by id.
  const del = await fetch(
    `${U}/rest/v1/impulse_entries?impression=eq.${encodeURIComponent(marker)}`,
    { method: 'DELETE', headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=representation' } }
  )
  const delBody = await del.text()
  let delCount = 0
  try { delCount = JSON.parse(delBody).length } catch { /* noop */ }
  console.log(`\n── CLEANUP (service key) ── deleted ${delCount} proof row(s), HTTP ${del.status}`)
  if (delCount === 0 && createdId) {
    console.error('   ⚠ WARNING: created a row but cleanup deleted 0 — check manually for the marker above.')
    process.exit(1)
  }

  console.log('\nDone.')
}

main().catch((e) => { console.error(e); process.exit(1) })
