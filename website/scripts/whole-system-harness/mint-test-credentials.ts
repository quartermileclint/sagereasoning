/**
 * mint-test-credentials.ts — generate the two TEST credentials for the L7 harness.
 *
 * WHAT THIS IS. The repo's admin minting routes (/api/admin/api-keys,
 * /api/admin/accreditation-credentials) require a logged-in admin user
 * (requireAdmin → ADMIN_USER_ID), which a fresh TEST project does not have. So
 * for the test env we seed the credentials directly. This script produces the
 * two RAW tokens (shown once — run it yourself so they stay off-chat) plus a
 * paste-ready SQL block that inserts the matching rows into the TEST project.
 *
 * DATA MODEL (verified by code-read 2026-05-25):
 *   Both credentials are rows in the SAME `api_keys` table, distinguished by
 *   `purpose`:
 *     - sr_live_  API key → /api/reason (X-Api-Key); validateApiKey (security.ts L325)
 *     - sr_assent_ token  → /api/accreditation/[agent_id] (Bearer); purpose
 *                           'sage_assent_write'; validateSageAssentWriteToken (L657)
 *   Stored as key_hash = SHA-256(raw) hex — byte-identical to security.ts
 *   hashKey (L300) and both validators (L358 / L671), so these rows validate.
 *
 *   The sr_assent_ row carries owner_user_id, which FKs to public.profiles(id),
 *   and the active-row CHECK (api_keys_..._invariant) requires agent_id AND
 *   owner_user_id NOT NULL. profiles.id is the auth user's id (resolveProfileId).
 *   So a profile must exist first → the printed SQL seeds profiles(id,email) for
 *   the UUID you pass (which must be a real auth user's UID in the TEST project).
 *
 * PURE: randomBytes + SHA-256 only. No Supabase, no env. Run with bare tsx.
 *   (Token-gen is replicated rather than imported to keep this env-free; the
 *    security-critical part — the SHA-256 hash — is identical to security.ts.)
 *
 * USAGE:
 *   npx tsx scripts/whole-system-harness/mint-test-credentials.ts <owner_profile_uuid> [agent_id]
 *     <owner_profile_uuid>  the User UID of a test user created in the TEST
 *                           project (Authentication → Add user). Required.
 *     [agent_id]            defaults to 'wsh-test-agent-L7' (run-l7.ts's default).
 */

import { randomBytes, createHash } from 'node:crypto'

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex')

const ownerUuid = process.argv[2]
const agentId = process.argv[3] ?? 'wsh-test-agent-L7'

if (!ownerUuid || !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(ownerUuid)) {
  console.error('ERROR: first argument must be a test user UUID (the User UID from Authentication → Add user).')
  console.error('Usage: npx tsx scripts/whole-system-harness/mint-test-credentials.ts <owner_profile_uuid> [agent_id]')
  process.exit(2)
}

// sr_live_ API key (format per security.ts L276) and sr_assent_ write token
// (format per generateSageAssentWriteToken, security.ts L586): prefix + 16 random bytes hex.
const apiKeyRaw = 'sr_live_' + randomBytes(16).toString('hex')
const assentRaw = 'sr_assent_' + randomBytes(16).toString('hex')
const apiKeyHash = sha256(apiKeyRaw)
const assentHash = sha256(assentRaw)
const apiKeyPrefix = apiKeyRaw.slice(0, 14)
const assentPrefix = assentRaw.slice(0, 14)

const sql = `-- ===== Paste into the TEST project SQL editor (NOT production). Run once. =====
-- 1. Owner profile — FK target for the sr_assent_ credential's owner_user_id.
--    '${ownerUuid}' must be a real auth user's UID in this test project.
insert into public.profiles (id, email)
values ('${ownerUuid}', 'harness@test.local')
on conflict (id) do nothing;

-- 2. API key for /api/reason (purpose defaults to 'ecosystem').
--    Limits are deliberately generous TEST-only values so harness runs never
--    trip the caps — NOT the adopted 30/1/1 mint defaults (api-key-defaults.ts),
--    and deliberately distinct from the retired FX-12 drift triple.
insert into public.api_keys
  (key_hash, key_prefix, label, tier, monthly_limit, daily_limit, max_chain_iterations, is_active)
values
  ('${apiKeyHash}', '${apiKeyPrefix}', 'wsh-l7-apikey', 'free', 10000, 1000, 3, true);

-- 3. sr_assent_ write token (purpose 'sage_assent_write', bound to agent_id + owner).
insert into public.api_keys
  (key_hash, key_prefix, label, agent_id, owner_user_id, purpose, tier, monthly_limit, daily_limit, max_chain_iterations, is_active)
values
  ('${assentHash}', '${assentPrefix}', 'wsh-l7-assent', '${agentId}', '${ownerUuid}', 'sage_assent_write', 'free', 100, 100, 1, true);
`

console.log('\n================= RAW TOKENS (copy into your harness env vars — shown once) =================\n')
console.log('WSH_AGENT_ID=' + agentId)
console.log('WSH_API_KEY=' + apiKeyRaw)
console.log('WSH_ASSENT_TOKEN=' + assentRaw)
console.log('\n================= SQL (paste into the TEST project SQL editor, then Run) =================\n')
console.log(sql)
console.log('================= verify after running the SQL =================')
console.log(`select label, purpose, agent_id, is_active from public.api_keys where label in ('wsh-l7-apikey','wsh-l7-assent') order by label;`)
console.log('-- expect 2 rows: wsh-l7-apikey (purpose ecosystem) + wsh-l7-assent (purpose sage_assent_write)\n')
