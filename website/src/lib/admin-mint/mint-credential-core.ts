/**
 * mint-credential-core.ts — pure command/request planning for the admin
 * credential CLI (scripts/mint-credential.ts).
 *
 * CI-7 (mechanism-correction M2, 2026-06-13; FX-1/B8): replaces the
 * browser-console mint paste-work that produced the leg-B error class
 * (PF-1 missing-`purpose` 400-retries; the `etch is not defined` typo class;
 * the wrong-revocation-verb instruction). The CLI never composes a request
 * body by hand:
 *
 *   - install / assent mint bodies carry their required `purpose` literal
 *     baked in, and are pre-validated with the SAME validation modules the
 *     routes run server-side — a body this module emits cannot 400 on
 *     contract shape.
 *   - revocation uses the correct per-surface verb: sr_live_ keys have no
 *     DELETE — they revoke via PATCH { is_active: false }; sr_inst_ and
 *     sr_assent_ revoke via DELETE ?id= (the PF-1 family asymmetry).
 *
 * PURE: no fetch, no env, no I/O — unit-tested per PR1/PR2; the thin CLI in
 * scripts/ owns auth + transport.
 */

import { validatePluginInstallMintInput } from '../../app/api/admin/plugin-install-credentials/validation'
import { validateMintInput } from '../../app/api/admin/accreditation-credentials/validation'
import { PRACTICE_CAPABILITIES } from '../practice-credential'

// 'practice' = CI-14 Unified Practice Credential (sr_prac_): one credential carrying
// a capabilities[] set, minted via the (extended) /api/admin/api-keys route.
export type CredentialClass = 'api' | 'install' | 'assent' | 'practice'

export const CREDENTIAL_CLASSES: readonly CredentialClass[] = [
  'api',
  'install',
  'assent',
  'practice',
] as const

/** A fully-planned HTTP request — origin supplied by the CLI at execution. */
export interface RequestPlan {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  /** Path + query string, no origin. */
  path: string
  body?: Record<string, unknown>
}

export type PlanResult =
  | { ok: true; plan: RequestPlan }
  | { ok: false; error: string }

export interface ParsedCommand {
  action: 'list' | 'mint' | 'revoke' | 'help'
  credentialClass?: CredentialClass
  flags: Record<string, string>
}

export type ParseResult =
  | { ok: true; command: ParsedCommand }
  | { ok: false; error: string }

export const USAGE = `mint-credential — admin credential surface (mint / revoke / list), zero console paste-work.

USAGE (from website/):
  npx tsx --env-file=.env.development.local scripts/mint-credential.ts <command>

COMMANDS
  list                                   List all credentials (all three classes)
  mint api      --label <text>           Mint an sr_live_ ecosystem API key
                [--owner-email <email>] [--agent-id <id>] [--tier free|paid]
                [--monthly <n>] [--daily <n>] [--chain <n>] [--notes <text>]
                (omitted limits use the adopted 30/1/1 server defaults — CI-6)
  mint install  --install-id <id> --identity-type human|agent
                --scope assessment-only|mentor-also|admin [--label <text>]
                Mint an sr_inst_ per-install plugin credential
  mint assent   --agent-id <id> [--label <text>]
                [--identity-model <m>] [--path-posture <p>]
                Mint an sr_assent_ accreditation write credential
  mint practice --label <text> --capabilities <c1,c2,...>
                [--agent-id <id>] [--owner-email <email>]
                [--owner-kind operator|external_consumer] [--tier free|paid] [--notes <text>]
                [--monthly <n>] [--daily <n>] [--chain <n>]
                [--examination-enforcement pre_decision_harness]
                Mint an sr_prac_ Unified Practice Credential (CI-14). --capabilities is a
                comma-separated subset of: consult,l1_supply,accreditation_write,calling,reflect,
                watching_write
                (write-class members are opt-in; agent-id binds write/calling/reflect/watching_write)
                (omitted limits use the adopted 30/1/1 server defaults — CI-6, same as mint api)
                --examination-enforcement (Gate-1 Arc 1, operator-only) marks the credential
                pre-decision-harness so its accreditation writes earn examination_mode:
                pre_decision_harness. DO NOT use until a genuine pre-decision harness exists.
  revoke api      --id <uuid> [--reason <text>]   (PATCH is_active=false — no DELETE on this surface)
  revoke install  --id <uuid> [--reason <text>]   (DELETE)
  revoke assent   --id <uuid> [--reason <text>]   (DELETE)
  revoke practice --id <uuid> [--reason <text>]   (PATCH is_active=false — sr_prac_ lives on the api-keys surface)
  help                                   Show this usage

ENVIRONMENT
  MINT_CLI_BASE_URL              Target origin (default http://localhost:3000;
                                 production: https://www.sagereasoning.com)
  MINT_CLI_ADMIN_JWT             Pre-obtained admin JWT (skips sign-in), OR:
  NEXT_PUBLIC_SUPABASE_URL       + NEXT_PUBLIC_SUPABASE_ANON_KEY
  MINT_CLI_ADMIN_EMAIL           + MINT_CLI_ADMIN_PASSWORD (password sign-in)

The minted key/token is printed ONCE and cannot be retrieved later.`

const ADMIN_API_KEYS_PATH = '/api/admin/api-keys'
const ADMIN_INSTALL_PATH = '/api/admin/plugin-install-credentials'
const ADMIN_ASSENT_PATH = '/api/admin/accreditation-credentials'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Parse `--key value` pairs. Every flag must carry a value. */
export function parseFlags(
  args: string[]
): { ok: true; flags: Record<string, string> } | { ok: false; error: string } {
  const flags: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg.startsWith('--')) {
      return { ok: false, error: `Unexpected argument "${arg}" — flags are --key value pairs.` }
    }
    const key = arg.slice(2)
    const value = args[i + 1]
    if (value === undefined || value.startsWith('--')) {
      return { ok: false, error: `Flag --${key} requires a value.` }
    }
    flags[key] = value
    i++
  }
  return { ok: true, flags }
}

/** Parse the full CLI argv (after the script name). */
export function parseCommand(argv: string[]): ParseResult {
  const [action, ...rest] = argv
  if (!action || action === 'help' || action === '--help' || action === '-h') {
    return { ok: true, command: { action: 'help', flags: {} } }
  }
  if (action === 'list') {
    if (rest.length > 0) {
      return { ok: false, error: 'list takes no arguments.' }
    }
    return { ok: true, command: { action: 'list', flags: {} } }
  }
  if (action === 'mint' || action === 'revoke') {
    const cls = rest[0] as CredentialClass | undefined
    if (!cls || !CREDENTIAL_CLASSES.includes(cls)) {
      return {
        ok: false,
        error: `${action} requires a credential class: ${CREDENTIAL_CLASSES.join(' | ')}`,
      }
    }
    const parsed = parseFlags(rest.slice(1))
    if (!parsed.ok) return parsed
    return { ok: true, command: { action, credentialClass: cls, flags: parsed.flags } }
  }
  return { ok: false, error: `Unknown command "${action}". Run with "help" for usage.` }
}

export function buildListPlan(): RequestPlan {
  return { method: 'GET', path: ADMIN_API_KEYS_PATH }
}

/** Mint body for sr_live_ keys — mirrors the route's own checks locally. */
function buildApiMintPlan(flags: Record<string, string>): PlanResult {
  const label = flags['label']?.trim()
  if (!label) {
    return { ok: false, error: 'mint api requires --label.' }
  }
  const body: Record<string, unknown> = { label }

  if (flags['owner-email']) body.owner_email = flags['owner-email']
  if (flags['agent-id']) body.agent_id = flags['agent-id']
  if (flags['notes']) body.notes = flags['notes']

  if (flags['tier'] !== undefined) {
    if (!['free', 'paid'].includes(flags['tier'])) {
      return { ok: false, error: 'tier must be "free" or "paid".' }
    }
    body.tier = flags['tier']
  }

  // Limits are OMITTED unless explicitly flagged, so the route's adopted
  // 30/1/1 defaults (API_KEY_FREE_TIER_DEFAULTS — CI-6) stay the single
  // source of truth.
  const limitFlags: Array<[flag: string, field: string]> = [
    ['monthly', 'monthly_limit'],
    ['daily', 'daily_limit'],
    ['chain', 'max_chain_iterations'],
  ]
  for (const [flag, field] of limitFlags) {
    const raw = flags[flag]
    if (raw !== undefined) {
      const n = Number(raw)
      if (!Number.isInteger(n) || n < 1) {
        return { ok: false, error: `--${flag} must be a positive integer.` }
      }
      body[field] = n
    }
  }

  return { ok: true, plan: { method: 'POST', path: ADMIN_API_KEYS_PATH, body } }
}

/**
 * Mint body for sr_prac_ — a CI-14 Unified Practice Credential. Posts to the
 * (extended) /api/admin/api-keys route with an explicit capabilities[] set, which
 * triggers UPC mode there (sr_prac_ prefix, purpose='unified_practice',
 * owner_kind, credential_provenance). --capabilities is a comma-separated subset
 * of the closed vocabulary; write-class members (accreditation_write/calling/
 * reflect/watching_write) are opt-in. Limits are omitted so the route's CI-6 30/1/1 defaults
 * remain the single source of truth.
 */
function buildPracticeMintPlan(flags: Record<string, string>): PlanResult {
  const label = flags['label']?.trim()
  if (!label) {
    return { ok: false, error: 'mint practice requires --label.' }
  }
  const capsRaw = flags['capabilities']?.trim()
  if (!capsRaw) {
    return {
      ok: false,
      error: `mint practice requires --capabilities (comma-separated subset of ${PRACTICE_CAPABILITIES.join(',')}).`,
    }
  }
  const capabilities = capsRaw.split(',').map((c) => c.trim()).filter(Boolean)
  const allowed = PRACTICE_CAPABILITIES as readonly string[]
  const bad = capabilities.filter((c) => !allowed.includes(c))
  if (capabilities.length === 0 || bad.length > 0) {
    return {
      ok: false,
      error: `--capabilities has invalid member(s) [${bad.join(', ')}]; allowed: ${allowed.join(', ')}.`,
    }
  }

  const body: Record<string, unknown> = { label, capabilities }
  if (flags['agent-id']) body.agent_id = flags['agent-id']
  if (flags['owner-email']) body.owner_email = flags['owner-email']
  if (flags['owner-kind'] !== undefined) {
    if (!['operator', 'external_consumer'].includes(flags['owner-kind'])) {
      return { ok: false, error: "owner-kind must be 'operator' or 'external_consumer'." }
    }
    body.owner_kind = flags['owner-kind']
  }
  if (flags['tier'] !== undefined) {
    if (!['free', 'paid'].includes(flags['tier'])) {
      return { ok: false, error: 'tier must be "free" or "paid".' }
    }
    body.tier = flags['tier']
  }
  if (flags['notes']) body.notes = flags['notes']

  // Limits are OMITTED unless explicitly flagged, so the route's adopted
  // 30/1/1 defaults (API_KEY_FREE_TIER_DEFAULTS — CI-6) stay the single
  // source of truth. Mirrors buildApiMintPlan's loop above — before this fix
  // (2026-07-21, P4 agent-1 session), mint practice silently ignored these
  // three flags and always landed on 30/1/1 regardless of what was passed,
  // even though the route itself (POST /api/admin/api-keys) already accepts
  // monthly_limit/daily_limit/max_chain_iterations overrides on the UPC-mode
  // path identically to the legacy sr_live_ path — this was a CLI-only gap.
  const limitFlags: Array<[flag: string, field: string]> = [
    ['monthly', 'monthly_limit'],
    ['daily', 'daily_limit'],
    ['chain', 'max_chain_iterations'],
  ]
  for (const [flag, field] of limitFlags) {
    const raw = flags[flag]
    if (raw !== undefined) {
      const n = Number(raw)
      if (!Number.isInteger(n) || n < 1) {
        return { ok: false, error: `--${flag} must be a positive integer.` }
      }
      body[field] = n
    }
  }

  // Gate-1 surface honesty (Arc 1, 2026-06-20) — the OPERATOR-ONLY pre-decision
  // marker. Sets credential_provenance.examination_enforcement='pre_decision_harness'
  // at the (admin-gated) route, so the credential earns
  // examination_mode:'pre_decision_harness' on its accreditation writes. Per Arc 1
  // sequencing this stays UN-ISSUED until a genuine pre-decision harness exists —
  // do NOT pass this flag until then (it would be an empty claim).
  if (flags['examination-enforcement'] !== undefined) {
    if (flags['examination-enforcement'] !== 'pre_decision_harness') {
      return {
        ok: false,
        error: "examination-enforcement, if set, must be 'pre_decision_harness'.",
      }
    }
    body.examination_enforcement = 'pre_decision_harness'
  }

  return { ok: true, plan: { method: 'POST', path: ADMIN_API_KEYS_PATH, body } }
}

/** Mint body for sr_inst_ — purpose baked; pre-validated with the route's validator. */
function buildInstallMintPlan(flags: Record<string, string>): PlanResult {
  const body: Record<string, unknown> = {
    purpose: 'plugin_install',
    identity_type: flags['identity-type'],
    install_id: flags['install-id'],
    install_scope: flags['scope'],
  }
  if (flags['label']) body.label = flags['label']

  const validated = validatePluginInstallMintInput(body)
  if (!validated.ok) return { ok: false, error: validated.error }

  return { ok: true, plan: { method: 'POST', path: ADMIN_INSTALL_PATH, body } }
}

/** Mint body for sr_assent_ — purpose baked; pre-validated with the route's validator. */
function buildAssentMintPlan(flags: Record<string, string>): PlanResult {
  const body: Record<string, unknown> = {
    purpose: 'sage_assent_write',
    agent_id: flags['agent-id'],
  }
  if (flags['label']) body.label = flags['label']
  if (flags['identity-model']) body.scope_downstream_identity_model = flags['identity-model']
  if (flags['path-posture']) body.scope_path_posture = flags['path-posture']

  const validated = validateMintInput(body)
  if (!validated.ok) return { ok: false, error: validated.error }

  return { ok: true, plan: { method: 'POST', path: ADMIN_ASSENT_PATH, body } }
}

export function buildMintPlan(
  credentialClass: CredentialClass,
  flags: Record<string, string>
): PlanResult {
  switch (credentialClass) {
    case 'api':
      return buildApiMintPlan(flags)
    case 'install':
      return buildInstallMintPlan(flags)
    case 'assent':
      return buildAssentMintPlan(flags)
    case 'practice':
      return buildPracticeMintPlan(flags)
  }
}

export function buildRevokePlan(
  credentialClass: CredentialClass,
  flags: Record<string, string>
): PlanResult {
  const id = flags['id']?.trim()
  if (!id || !UUID_RE.test(id)) {
    return { ok: false, error: 'revoke requires --id <uuid> (the credential record id from list/mint output).' }
  }
  const reason = flags['reason']?.trim() || 'admin_revocation'

  if (credentialClass === 'api' || credentialClass === 'practice') {
    // sr_live_ ecosystem keys AND sr_prac_ UPCs live on the api-keys route and
    // have no DELETE — revocation is PATCH is_active=false (the universal
    // revocation flag; the PF-1 family wrong-verb defect this surface encodes away).
    return {
      ok: true,
      plan: {
        method: 'PATCH',
        path: ADMIN_API_KEYS_PATH,
        body: { id, is_active: false, suspended_reason: reason },
      },
    }
  }

  const path =
    credentialClass === 'install' ? ADMIN_INSTALL_PATH : ADMIN_ASSENT_PATH
  return {
    ok: true,
    plan: {
      method: 'DELETE',
      path: `${path}?id=${encodeURIComponent(id)}`,
      body: { reason },
    },
  }
}

/**
 * Derive the credential class from a key_prefix (first 14 chars of the raw
 * key). The list view (api_key_usage_current, api/api-keys-schema.sql §4)
 * exposes NO purpose column — key_prefix is the honest class source.
 */
export function classFromPrefix(prefix: string): CredentialClass | 'unknown' {
  if (prefix.startsWith('sr_live_')) return 'api'
  if (prefix.startsWith('sr_inst_')) return 'install'
  if (prefix.startsWith('sr_assent_')) return 'assent'
  if (prefix.startsWith('sr_prac_')) return 'practice'
  return 'unknown'
}

/**
 * A normalised row from GET /api/admin/api-keys. The backing view aliases
 * the UUID to `api_key_id` and carries no purpose/max_chain_iterations —
 * this normaliser maps what the view actually serves and fabricates nothing.
 */
export interface ListRow {
  id: string | null
  prefix: string
  credentialClass: CredentialClass | 'unknown'
  label: string
  tier: string
  active: boolean
  monthlyLimit: number | null
  dailyLimit: number | null
  monthlyCalls: number | null
  createdAt: string | null
}

export function normaliseListRow(row: Record<string, unknown>): ListRow {
  const id =
    typeof row.api_key_id === 'string'
      ? row.api_key_id
      : typeof row.id === 'string'
        ? row.id
        : null
  const prefix = typeof row.key_prefix === 'string' ? row.key_prefix : ''
  return {
    id,
    prefix,
    credentialClass: classFromPrefix(prefix),
    label: typeof row.label === 'string' ? row.label : '',
    tier: typeof row.tier === 'string' ? row.tier : '?',
    active: row.is_active !== false,
    monthlyLimit: typeof row.monthly_limit === 'number' ? row.monthly_limit : null,
    dailyLimit: typeof row.daily_limit === 'number' ? row.daily_limit : null,
    monthlyCalls: typeof row.monthly_calls === 'number' ? row.monthly_calls : null,
    createdAt: typeof row.created_at === 'string' ? row.created_at : null,
  }
}

/**
 * Guard a revoke against the wrong credential class. The api-keys PATCH path
 * has no purpose filter and writes no credential_audit row, so revoking an
 * sr_inst_/sr_assent_ credential through `revoke api` would be an unaudited
 * cross-class revocation (R0). The CLI looks the target up in the list first
 * and refuses any mismatch, naming the correct subcommand. Fail-safe: an id
 * that cannot be found or classified is refused, not revoked blind.
 */
export function checkRevokeTarget(
  rows: ListRow[],
  id: string,
  credentialClass: CredentialClass
): { ok: true; row: ListRow } | { ok: false; error: string } {
  const want = id.trim().toLowerCase()
  const row = rows.find((r) => r.id?.toLowerCase() === want)
  if (!row) {
    return {
      ok: false,
      error: `No credential with id ${id} found in the list — check the id (list shows id= per row).`,
    }
  }
  if (row.credentialClass !== credentialClass) {
    const right =
      row.credentialClass === 'unknown'
        ? `prefix "${row.prefix}" is not a recognised credential class — inspect the row in Supabase before revoking`
        : `that credential is class "${row.credentialClass}" (prefix ${row.prefix}) — use: revoke ${row.credentialClass} --id ${id}`
    return { ok: false, error: `Refusing cross-class revoke: ${right}.` }
  }
  return { ok: true, row }
}

/** Extract the shown-once token + record from a successful mint response. */
export function summariseMintResponse(
  credentialClass: CredentialClass,
  json: Record<string, unknown>
): { token: string | null; record: Record<string, unknown> } {
  // 'api' AND 'practice' (CI-14 UPC) both mint via /api/admin/api-keys, which
  // returns { api_key, ...keyRecord } — NOT the { token, credential } shape the
  // install/assent admin routes return. Group them (mirrors buildMintPlan).
  if (credentialClass === 'api' || credentialClass === 'practice') {
    const { api_key, message: _message, ...record } = json
    return { token: typeof api_key === 'string' ? api_key : null, record }
  }
  const token = typeof json.token === 'string' ? json.token : null
  const record =
    json.credential && typeof json.credential === 'object'
      ? (json.credential as Record<string, unknown>)
      : {}
  return { token, record }
}
