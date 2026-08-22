/**
 * impulse-rls-bypass-proof.ts — behavioural proof of the impulse_entries RLS
 * bypass, for the C4 Phase 2 §PRE (before) and §VERIFY (after) steps.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IT PROVES (default mode — the bypass attempt). That an ordinary
 * AUTHENTICATED practitioner, holding only the public anon key and their own
 * session JWT, can write an impulse_entries row DIRECTLY via PostgREST —
 * bypassing /api/mentor/impulse and therefore the R20a distress check, field
 * validation, and rate limiting. Before the lockdown migration the direct
 * INSERT succeeds (201); after it, the same INSERT is denied (401/403/empty).
 * The diff is the fix, proven behaviourally rather than by reading policy
 * definitions.
 *
 * WHAT --legit MODE PROVES (§VERIFY V5). That the app's own legitimate path —
 * a real POST/GET/PATCH through the Next.js route, which uses the service-role
 * client and therefore bypasses RLS regardless — still works unchanged AFTER
 * the lockdown. This is the "did I break anything real" half of the proof,
 * distinct from "is the bypass closed". Requires a running dev server (Next.js
 * reads the SAME env file at boot, so start it with
 * `npx next dev --env-file=.env.development.local` or ensure
 * .env.development.local is in place before `npm run dev`).
 *
 * TEST ONLY. Run against the TEST Supabase project via .env.development.local,
 * which Next loads ahead of .env.local. NEVER production for the §PRE step —
 * the §PRE proof deliberately WRITES a bypass row, and we never write a bypass
 * row to a real practitioner's table. The production step (§6 of the prompt)
 * runs this same harness (default mode) against production ONLY on a
 * disposable test account, after the migration, to confirm the bypass is
 * closed (an attempt that must FAIL and therefore writes nothing).
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
 *   # AFTER the migration, on TEST, with the dev server running — the
 *   # legitimate-path proof (§VERIFY V5):
 *   npx tsx --env-file=.env.development.local scripts/impulse-rls-bypass-proof.ts --legit
 *   # (optionally --base-url=http://localhost:3000, the default)
 *
 *   # AFTER the migration, on PRODUCTION — expect: INSERT DENIED, writes
 *   # nothing (see the safety-rail note below):
 *   npx tsx --env-file=.env.local scripts/impulse-rls-bypass-proof.ts --force-nontest
 *
 * The default mode signs in a throwaway/test user (MINT_CLI_ADMIN_EMAIL /
 * _PASSWORD from the env file), attempts the direct anon-key INSERT for THAT
 * user's own user_id (the owner policy is auth.uid() = user_id, so the
 * reachable bypass is a practitioner writing their OWN entries around the
 * route), reports the outcome, then DELETES any row it created using the
 * service key (cleanup succeeds regardless of RLS). No row it writes ever
 * survives the run, in either mode.
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

/** Sign in the throwaway/test user via the public anon key. Shared by both modes. */
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

/**
 * --legit mode (§VERIFY V5). Drives the REAL app route
 * (POST -> GET feed -> PATCH), using only the practitioner's own JWT against
 * the running dev server — never PostgREST directly. Proves the legitimate
 * path is unaffected by the RLS lockdown (the route's service-role client
 * bypasses RLS regardless of the migration). Deletes the row it creates via
 * the service key at the end, same as the default mode.
 */
async function runLegitPathCheck(U: string, ANON: string, SERVICE: string, EMAIL: string, PASSWORD: string, baseUrl: string) {
  console.log(`Legit-path check against: ${baseUrl}  (Supabase: ${U})`)
  const { jwt } = await signIn(U, ANON, EMAIL, PASSWORD)
  console.log(`Signed in as ${EMAIL}`)

  const body = {
    trait: 'reciprocity',
    impression: `LEGIT-PATH-CHECK ${new Date().toISOString()} — a colleague offered to cover my shift.`,
    cooperation_ground: 'uncertain',
    cooperation_ground_note: 'legit-path check — created by the harness, deleted immediately after',
    counterfactual: 'n/a — this row exists only to prove the legitimate route path',
  }

  let allPass = true
  const check = (label: string, pass: boolean, detail?: string) => {
    console.log(`   ${pass ? 'PASS' : 'FAIL'} — ${label}${detail ? `: ${detail}` : ''}`)
    if (!pass) allPass = false
  }

  console.log('\n── 1. POST /api/mentor/impulse (create) ──')
  const post = await fetch(`${baseUrl}/api/mentor/impulse`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const postText = await post.text()
  let entryId: string | null = null
  try { entryId = JSON.parse(postText)?.entry?.id ?? null } catch { /* noop */ }
  check('HTTP 200', post.status === 200, `got ${post.status}`)
  check('response carries an entry id', !!entryId, postText.slice(0, 200))

  if (entryId) {
    console.log('\n── 2. GET /api/mentor/impulse?view=feed (read back) ──')
    const get = await fetch(`${baseUrl}/api/mentor/impulse?view=feed&limit=10`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
    const getText = await get.text()
    let feedHasEntry = false
    try {
      const feed = JSON.parse(getText)
      feedHasEntry = Array.isArray(feed?.entries) && feed.entries.some((e: { id?: string }) => e.id === entryId)
    } catch { /* noop */ }
    check('HTTP 200', get.status === 200, `got ${get.status}`)
    check('created entry appears in the feed', feedHasEntry)

    console.log('\n── 3. PATCH /api/mentor/impulse (revise in place) ──')
    const patch = await fetch(`${baseUrl}/api/mentor/impulse`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: entryId, ...body, impression: `${body.impression} (revised)` }),
    })
    const patchText = await patch.text()
    check('HTTP 200', patch.status === 200, `got ${patch.status}: ${patchText.slice(0, 200)}`)

    console.log('\n── 4. CLEANUP (service key) ──')
    const del = await fetch(`${U}/rest/v1/impulse_entries?id=eq.${entryId}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, Prefer: 'return=representation' },
    })
    let delCount = 0
    try { delCount = (JSON.parse(await del.text()) as unknown[]).length } catch { /* noop */ }
    check('proof row deleted', delCount === 1, `HTTP ${del.status}, deleted ${delCount}`)
  } else {
    allPass = false
    console.log('\n(skipping GET/PATCH/cleanup — no entry id from POST; check the row manually if it was created)')
  }

  console.log(`\n${allPass ? 'ALL PASS' : 'FAILED'} — legitimate route path ${allPass ? 'is unaffected by the RLS lockdown.' : 'has a problem — investigate before proceeding.'}`)
  if (!allPass) process.exit(1)
}

async function main() {
  const U = must('NEXT_PUBLIC_SUPABASE_URL', url)
  const ANON = must('NEXT_PUBLIC_SUPABASE_ANON_KEY', anon)
  const SERVICE = must('SUPABASE_SERVICE_ROLE_KEY', service)
  const EMAIL = must('MINT_CLI_ADMIN_EMAIL', email)
  const PASSWORD = must('MINT_CLI_ADMIN_PASSWORD', password)

  const legit = process.argv.includes('--legit')
  const baseUrlArg = process.argv.find((a) => a.startsWith('--base-url='))
  const baseUrl = baseUrlArg ? baseUrlArg.slice('--base-url='.length) : 'http://localhost:3000'

  if (legit) {
    await runLegitPathCheck(U, ANON, SERVICE, EMAIL, PASSWORD, baseUrl)
    return
  }

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
  const { jwt, uid } = await signIn(U, ANON, EMAIL, PASSWORD)
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
      trait: 'reciprocity',
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

// Isolates this file's module scope for `tsc --noEmit` (a whole-project
// check): without this, its top-level `const url`/`anon`/`service`/etc. and
// helper function names collide with any OTHER plain script in scripts/
// declaring the same names, since a script with no top-level import/export
// is treated as global scope. Found 2026-08-23 when a new sibling script
// (class-b-rls-bypass-proof.ts) collided with this file — practice-family-
// rls-bypass-proof.ts already carries this same `export {}` fix; this file
// predated that fix and is corrected to match, closing the gap at the root
// rather than leaving one of two now-three siblings unprotected.
export {}
