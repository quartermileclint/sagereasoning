/**
 * mint-credential.ts — admin credential CLI: mint / revoke / list across all
 * three credential classes (sr_live_ api | sr_inst_ install | sr_assent_
 * assent), with the key shown once.
 *
 * CI-7 (mechanism-correction M2, 2026-06-13; FX-1/B8, founder-elected CLI
 * form): replaces browser-console fetch paste-work. All request planning +
 * contract validation lives in src/lib/admin-mint/mint-credential-core.ts
 * (pure, unit-tested); this file owns env, auth, transport, and display only.
 *
 * The CLI calls the existing admin routes over HTTP — it never touches the DB
 * directly, so route-level validation, rate limits, and the credential_audit
 * writes are preserved exactly. Auth is the same founder-admin gate the routes
 * already enforce (requireAdmin / ADMIN_USER_ID); this script only OBTAINS a
 * JWT (password grant against Supabase auth, or a pre-supplied token) and
 * presents it — no auth surface is modified.
 *
 * RUN (TEST — dev server on localhost:3000, standing TEST-run process):
 *   cd website
 *   npx tsx --env-file=.env.development.local scripts/mint-credential.ts list
 *   npx tsx --env-file=.env.development.local scripts/mint-credential.ts \
 *     mint api --label "My agent key"
 *
 * RUN (production — founder-performed; creds exported in-shell, never
 * committed to a file):
 *   MINT_CLI_BASE_URL=https://www.sagereasoning.com \
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *   MINT_CLI_ADMIN_EMAIL=... MINT_CLI_ADMIN_PASSWORD=... \
 *   npx tsx scripts/mint-credential.ts list
 *
 * Run `npx tsx scripts/mint-credential.ts help` for full usage.
 */

import {
  parseCommand,
  buildListPlan,
  buildMintPlan,
  buildRevokePlan,
  summariseMintResponse,
  normaliseListRow,
  checkRevokeTarget,
  USAGE,
  type RequestPlan,
  type ListRow,
} from '../src/lib/admin-mint/mint-credential-core'

const BASE_URL = process.env.MINT_CLI_BASE_URL || 'http://localhost:3000'

function fail(message: string): never {
  console.error(`\nERROR: ${message}\n`)
  process.exit(1)
}

/** Obtain an admin JWT: pre-supplied token, or Supabase password grant. */
async function obtainAdminJwt(): Promise<string> {
  const preSupplied = process.env.MINT_CLI_ADMIN_JWT
  if (preSupplied) return preSupplied

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const email = process.env.MINT_CLI_ADMIN_EMAIL
  const password = process.env.MINT_CLI_ADMIN_PASSWORD
  if (!supabaseUrl || !anonKey || !email || !password) {
    fail(
      'Missing auth environment. Set MINT_CLI_ADMIN_JWT, or all of: ' +
        'NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, ' +
        'MINT_CLI_ADMIN_EMAIL, MINT_CLI_ADMIN_PASSWORD.'
    )
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: anonKey },
      body: JSON.stringify({ email, password }),
    }
  )
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok || typeof json.access_token !== 'string') {
    const detail =
      typeof json.error_description === 'string'
        ? json.error_description
        : typeof json.msg === 'string'
          ? json.msg
          : `status ${response.status}`
    fail(`Admin sign-in failed (${detail}). Check MINT_CLI_ADMIN_EMAIL / MINT_CLI_ADMIN_PASSWORD.`)
  }
  return json.access_token as string
}

async function execute(plan: RequestPlan, jwt: string) {
  const response = await fetch(`${BASE_URL}${plan.path}`, {
    method: plan.method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      ...(plan.body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(plan.body ? { body: JSON.stringify(plan.body) } : {}),
  })
  const json = (await response.json().catch(() => ({}))) as Record<string, unknown>
  return { status: response.status, ok: response.ok, json }
}

/** Fetch + normalise the credential list (the view aliases id → api_key_id). */
async function fetchList(jwt: string): Promise<ListRow[]> {
  const result = await execute(buildListPlan(), jwt)
  if (!result.ok) {
    fail(`list failed (${result.status}): ${result.json.error ?? 'unknown error'}`)
  }
  const keys = Array.isArray(result.json.keys)
    ? (result.json.keys as Record<string, unknown>[])
    : []
  return keys.map(normaliseListRow)
}

function printKeyList(rows: ListRow[]) {
  console.log(`\n${rows.length} credential(s):\n`)
  for (const r of rows) {
    const limits = `${r.monthlyLimit ?? '?'}/mo ${r.dailyLimit ?? '?'}/day`
    const used = r.monthlyCalls !== null ? ` used:${r.monthlyCalls}` : ''
    const state = r.active ? 'active' : 'REVOKED'
    console.log(
      `  ${r.prefix.padEnd(16)} ${state.padEnd(8)} ${r.credentialClass.padEnd(8)} ` +
        `${r.tier.padEnd(5)} ${(limits + used).padEnd(22)} id=${r.id ?? '?'}  ${r.label}`
    )
  }
  console.log('')
}

async function main() {
  const parsed = parseCommand(process.argv.slice(2))
  if (!parsed.ok) fail(parsed.error)
  const { command } = parsed

  if (command.action === 'help') {
    console.log(USAGE)
    return
  }

  // Echo the target on every credential-touching invocation — a stale
  // MINT_CLI_BASE_URL export must never silently aim a mint/revoke at the
  // wrong environment.
  console.log(`Target: ${BASE_URL}`)

  const jwt = await obtainAdminJwt()

  if (command.action === 'list') {
    printKeyList(await fetchList(jwt))
    return
  }

  if (command.action === 'mint') {
    const planned = buildMintPlan(command.credentialClass!, command.flags)
    if (!planned.ok) fail(planned.error)
    const result = await execute(planned.plan, jwt)
    if (!result.ok) {
      fail(`mint failed (${result.status}): ${result.json.error ?? 'unknown error'}`)
    }
    const { token, record } = summariseMintResponse(command.credentialClass!, result.json)
    console.log('\nMinted. Record:')
    console.log(JSON.stringify(record, null, 2))
    console.log('\n========== KEY — SHOWN ONCE, STORE IT NOW ==========')
    console.log(token ?? '(no token in response — inspect the record above)')
    console.log('====================================================\n')
    return
  }

  if (command.action === 'revoke') {
    const planned = buildRevokePlan(command.credentialClass!, command.flags)
    if (!planned.ok) fail(planned.error)

    // Class-guard: look the target up first and refuse a cross-class revoke
    // (the api PATCH path has no purpose filter and no audit write — R0).
    const guard = checkRevokeTarget(
      await fetchList(jwt),
      command.flags['id'],
      command.credentialClass!
    )
    if (!guard.ok) fail(guard.error)

    const result = await execute(planned.plan, jwt)
    if (!result.ok) {
      // The install/assent surfaces return 500-with-revoked:true when the
      // credential WAS disabled but the audit write failed — report that
      // truthfully instead of inviting a retry that would 409.
      if (result.json.revoked === true) {
        console.log(
          `\nRevoked, with an AUDIT GAP: ${result.json.error ?? ''}\n` +
            'The credential is disabled. Report the audit gap; do not retry.\n'
        )
        return
      }
      fail(`revoke failed (${result.status}): ${result.json.error ?? 'unknown error'}`)
    }
    console.log('\nRevoked:')
    console.log(JSON.stringify(result.json, null, 2))
    console.log('')
    return
  }
}

main().catch((err) => {
  fail(err instanceof Error ? err.message : String(err))
})
