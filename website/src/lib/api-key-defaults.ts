/**
 * api-key-defaults.ts — adopted free-tier defaults for ecosystem API keys
 * (sr_live_), matched to the schema source of truth /api/api-keys-schema.sql:
 * monthly_limit DEFAULT 30 (:84), daily_limit DEFAULT 1 (:88),
 * max_chain_iterations DEFAULT 1 (:92).
 *
 * CI-6 (mechanism-correction M2, 2026-06-13; FX-12/F12): the admin mint route
 * previously hard-coded 667/50/20 — ~22× over-provisioned against the adopted
 * defaults on a billing-adjacent surface (leg-B live catch). The route now
 * defaults from this constant; explicit per-key overrides in the POST body
 * still apply. api-key-defaults.test.ts asserts these values against the
 * schema file's DEFAULT clauses, so any future drift fails the suite.
 *
 * Lives outside the route file because Next.js route files may only export
 * HTTP handlers (same factoring as the admin validation modules). Mirrors the
 * sibling idiom: PLUGIN_INSTALL_DEFAULTS (plugin-install-credentials) and
 * A10_DEFAULTS (accreditation-credentials).
 */

export const API_KEY_FREE_TIER_DEFAULTS = {
  monthly_limit: 30,
  daily_limit: 1,
  max_chain_iterations: 1,
} as const
