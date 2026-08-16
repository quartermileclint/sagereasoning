/**
 * agent-hold-observations-store.ts — the retention purge for
 * `public.agent_hold_observations` (the S11 false-hold observation instrument).
 *
 * WHY THIS EXISTS (PR24 — retention parity): the table has declared
 * `retain_until TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')` since its
 * 2026-07-12 migration (`website/supabase-agent-hold-observations-migration.sql:126`)
 * with NOTHING enforcing it. PR24's rule is that a table declaring `retain_until`
 * ships its purge and sweep wiring in the same session; this closes the older debt.
 *
 * WHY NOT `stoa_entries`, which PR24's own grounding sentence names alongside it:
 * that table deliberately has NO `retain_until` at all, by binding mentor ruling #24
 * (Q9) — entries are STANDING declarations and "silent expiry is prohibited". It is
 * pinned in three places, including an executing battery assertion
 * (`stoa-boundary.test.ts` C.2). Building a sweep for it would contradict an adopted
 * ruling, not close a gap. PR24's grounding sentence is corrected in the same commit.
 *
 * WHY THIS FILE IS AT src/lib/ AND NOT src/lib/substrate/: the table is a Trust-Layer
 * artifact, so `substrate/` reads like the better conceptual home — but that path
 * matches the byte-identity guard's measured-set regex
 * (`human-practitioner-boundary.test.ts` §C, `/substrate/`), and this module has no
 * business inside the measured set. It sits beside `observability-store.ts`, whose
 * sweep it copies. Recorded here so it is not "tidied" into substrate/ later.
 *
 * DELETE IS EXPLICITLY PERMITTED on this table despite its append-only posture: the
 * immutability trigger `trg_aho_forbid_update` is BEFORE UPDATE only, and the
 * migration header states "INSERT + DELETE (retention purge / erasure) are permitted;
 * UPDATE is trigger-forbidden" (:148-152, repeated in the COMMENT ON TABLE at :195).
 *
 * DARK: gated by SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED, its OWN flag — never a
 * reuse of SUBSTRATE_TRUST_CORE_SWEEP_ENABLED, which is LIVE in production and would
 * have made this delete rows the moment it deployed (the standing
 * `shared-flag-dark-is-per-flag-not-per-feature` lesson). No flag is set this session
 * and no vercel.json cron entry ships with this build; scheduling is R4.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Lazily constructed, mirroring observability-store.ts exactly. NOT constructed at
// module load: an eager client throws `supabaseUrl is required` in any test that
// merely imports this chain (the documented harness ergonomics issue).
let _adminClient: SupabaseClient | null = null

function getAdminClient(): SupabaseClient | null {
  if (_adminClient) return _adminClient
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  _adminClient = createClient(url, key)
  return _adminClient
}

export const HOLD_OBSERVATIONS_SWEEP_ENV_VAR = 'SUBSTRATE_HOLD_OBSERVATIONS_SWEEP_ENABLED'

/**
 * True only when the flag is the exact string 'true'. Unset/other ⇒ the sweep route
 * reports { flag_enabled: false } and does NO DB work. Read at call time (mirrors
 * every sibling flag) so a test can set and unset it in-process.
 */
export function isHoldObservationsSweepEnabled(): boolean {
  return process.env[HOLD_OBSERVATIONS_SWEEP_ENV_VAR] === 'true'
}

/**
 * THE PK_COLUMN MAP EXISTS EVEN THOUGH THIS TABLE'S PK GENUINELY IS `id`, and that is
 * the whole point. The 2026-08-12 C-1 live defect was a hardcoded `.select('id')`
 * against `route_errors`/`throttle_events`, whose PKs are `error_id`/`throttle_id`:
 * `DELETE … RETURNING id` is rejected wholesale by Postgres, so the sweep could never
 * delete anything — fail-honest, but silently useless. It survived a 47-assertion
 * battery because the fake test client's `select(_cols)` ignored its argument.
 *
 * `agent_hold_observations.id` (migration :72) happens to be right, which is exactly
 * how this class hides: a hardcoded literal would look correct today and break the
 * moment a sibling table with a different PK is added to the map. Encoding it here,
 * plus validating the column in the fake client (route.test.ts), closes the class
 * rather than the symptom.
 */
const PK_COLUMN: Record<'agent_hold_observations', string> = {
  agent_hold_observations: 'id',
}

/**
 * Narrow "table not migrated on this deployment" classifier. Deliberately does NOT
 * treat a missing COLUMN as benign: a column error means genuine schema drift and
 * must surface as a real error, never as a false "purged" (the C-1 discipline).
 */
function isMissingTableError(error: { code?: string; message?: string }): boolean {
  const code = error?.code ?? ''
  const msg = (error?.message ?? '').toLowerCase()
  if (code === '42703' || code === 'PGRST204') return false
  if (msg.includes('column')) return false
  return code === '42P01' || msg.includes('does not exist') || msg.includes('schema cache')
}

/**
 * DELETE every `agent_hold_observations` row past its `retain_until`. Indexed
 * (`idx_aho_retain_until`, migration :146-147). Fail-honest: an error is reported,
 * never swallowed and never reported as a successful zero-row purge.
 *
 * SCOPE HONESTY — this sweep is UNSCOPED (all agents), which is complementary to,
 * not a duplicate of, the AGENT-SCOPED purge the operator report already performs
 * (`website/scripts/false-hold-observation-report.ts`, `.eq('agent_id', agentId)`).
 * That one runs only when an operator runs the report, for one agent.
 *
 * A DEFEAT CONDITION worth stating rather than discovering later: the report's ingest
 * purges expired rows and then RE-INSERTS from the local JSONL buffer, whose own
 * comment calls the JSONL "the source of truth, so a cleared row is always
 * re-creatable". So a row this sweep deletes can reappear with a fresh `retain_until`
 * at the next operator report run. This sweep enforces retention on the SERVER copy;
 * it is not a guarantee about the operator's local buffer, and the two are in tension
 * by design during an active observation window.
 */
export async function purgeExpiredHoldObservations(
  client?: SupabaseClient,
): Promise<{ deleted: number; error: string | null }> {
  const fnName = 'purgeExpiredHoldObservations'
  try {
    const db = client ?? getAdminClient()
    // No service-role credentials on this deployment — honest, not silent, and NOT
    // reported as a successful zero-row purge.
    if (!db) return { deleted: 0, error: `${fnName}: admin client unavailable` }
    const { data, error } = await db
      .from('agent_hold_observations')
      .delete()
      .lt('retain_until', new Date().toISOString())
      .select(PK_COLUMN.agent_hold_observations)
    if (error) {
      if (isMissingTableError(error)) return { deleted: 0, error: null }
      return { deleted: 0, error: `${fnName}: ${error.message}` }
    }
    return { deleted: (data as unknown[] | null)?.length ?? 0, error: null }
  } catch (e) {
    // `(e as Error).message` is unsafe — a rejection can carry a non-Error value, and
    // reading `.message` off it throws a FRESH error from inside this catch, which
    // nothing above wraps. Matches the sibling stores' hardening.
    return { deleted: 0, error: `${fnName} threw: ${e instanceof Error ? e.message : String(e)}` }
  }
}
