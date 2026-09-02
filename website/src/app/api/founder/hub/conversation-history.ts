/**
 * conversation-history.ts — the two BOUNDED reads of `founder_conversation_messages`
 * that /api/founder/hub makes, extracted from route.ts so the >1,000-row
 * property can be EXECUTED against a cap-modelling fake client rather than
 * asserted from a source pattern.
 *
 * ===========================================================================
 * THE DEFECT THIS REPLACES (found + confirmed on production 2026-09-02)
 * ===========================================================================
 *
 * PostgREST returns at most `max-rows` rows per request — Supabase's project
 * default is 1,000 — and says NOTHING when it truncates: no error, no flag,
 * no header the supabase-js client surfaces. Both conversation reads in this
 * route were `select(...).eq('conversation_id', id).order('created_at',
 * { ascending: true })` with NO limit. Once the founder's private-mentor
 * thread passed 1,000 messages, both reads silently returned the OLDEST
 * 1,000 rows — ascending order is what made the dropped remainder the NEWEST
 * messages rather than the oldest.
 *
 *   GET  ?conversation_id=  → the browser received rows 1-1000 and the page
 *        appeared to end on 31 Aug (row 1000 = 2026-08-31 09:15:49).
 *   POST load_history       → the same 1,000 rows were then `.slice(-20)`'d
 *        for the model's context window, so the mentor's working memory was
 *        PINNED to rows 981-1000 and could not advance. It answered a
 *        "Test message, please reply briefly." with a re-answer to row 1000's
 *        ruling request. Confident, well-formed, wrong question.
 *
 * Confirmed behaviourally with a row_number() query over the 1,013-row
 * conversation, not by reading a config value. Nothing was lost — a read-path
 * visibility failure, silent, and self-worsening (every new message widens
 * the invisible tail). It is the FOURTH instance of this codebase's recurring
 * silent-failure class (action_evaluations_v3's four months of silently
 * failed writes; the Sage Reflect completion 503; the unchecked hub inserts
 * fixed 2026-09-01) — the first three discarded ERRORS; this one discarded a
 * REMAINDER. The pattern is what recurs, not the individual bug.
 *
 * ===========================================================================
 * THE FIX — bound every read explicitly, and never depend on the cap
 * ===========================================================================
 *
 * loadRecentHistory   fetches the NEWEST `window` rows DESCENDING with an
 *                     explicit .limit(), then reverses to ascending. Correct
 *                     for a conversation of any length, and cheaper than
 *                     fetching everything to slice the tail. Returns the
 *                     exact total via PostgREST's count (computed on the
 *                     full matching set, independent of max-rows) so
 *                     `message_count` no longer derives from a windowed
 *                     array's length.
 *
 * loadConversationPage KEYSET pagination for the GET: the most recent
 *                     `limit` rows first, plus an `earliest_cursor` the
 *                     client hands back to load the page before it. Keyset
 *                     (created_at, id) rather than offset because new
 *                     messages append at the END of the thread while the
 *                     reader pages BACKWARDS from it — an offset page would
 *                     shift under every send and repeat rows at the seam.
 *                     The cursor is (created_at, id) with `id` as the
 *                     tie-break so two rows sharing a timestamp at a page
 *                     boundary are neither skipped nor duplicated.
 *
 *                     A property worth stating because it is the reason the
 *                     design is robust and not merely "has a limit": even if
 *                     a requested page is itself truncated by the cap (a
 *                     future lower max-rows, or a limit above it), the
 *                     cursor comes from the earliest row ACTUALLY returned
 *                     and `has_earlier` from the exact count — so the next
 *                     page continues from the right place. The walk cannot
 *                     lose rows to the cap; it can only take more pages.
 *                     Pinned by the regression test's capped-page case.
 *
 * ===========================================================================
 * THE GOVERNANCE CONSTANT — read before touching MENTOR_HISTORY_WINDOW
 * ===========================================================================
 *
 * The 20-message window is how much of the thread the mentor can SEE when it
 * replies. Widening it is a one-line change and therefore tempting; it is
 * also a decision about what the project's governing advisory surface — whose
 * rulings bind — is able to remember. The 2026-09-02 handoff prompt (§5c)
 * says: "Put it to the mentor. Do not widen the constant unilaterally as part
 * of a bug fix." This module keeps the window at exactly the value the old
 * `.slice(-20)` used, and the regression test pins it, so any change shows
 * up as a deliberate test diff rather than an incidental edit.
 *
 * Note the window is 20 RAW rows (any role, any agent), exactly as the old
 * slice was; the role/agent filtering that decides which of those rows reach
 * the model as user/assistant turns happens in getPrimaryAgentResponse and
 * is unchanged.
 */

import type { SupabaseClient } from '@supabase/supabase-js'

export const MESSAGES_TABLE = 'founder_conversation_messages'

/** See the header — a governance constant, pinned by test; not a tunable. */
export const MENTOR_HISTORY_WINDOW = 20

/** GET pagination defaults. MAX is deliberately well under the 1,000-row cap
 *  so a single page can never itself be silently truncated at the default
 *  Supabase setting; the keyset design tolerates it anyway (see header). */
export const CONVERSATION_PAGE_DEFAULT = 200
export const CONVERSATION_PAGE_MAX = 500

export interface HistoryRow {
  id: string
  role: string
  agent_type: string | null
  content: string
  created_at: string
}

export interface ReadError {
  message: string
  code?: string
  details?: string | null
  hint?: string | null
}

export interface RecentHistoryResult {
  /** The newest `window` rows, ASCENDING (oldest → newest) — the shape the
   *  model-message builder expects. */
  history: HistoryRow[]
  /** Exact count of ALL messages in the conversation (not just the window),
   *  or null if the client did not return one. */
  total: number | null
  error: ReadError | null
}

/**
 * The newest `window` messages of a conversation, in ascending order, plus
 * the conversation's exact total message count.
 *
 * Fails LOUD: on a read error the caller gets `error` set and an EMPTY
 * history. The route throws on it. The pre-fix code discarded the error and
 * proceeded with `history || []` — a mentor answering with no memory and no
 * indication why, which is the same silent class this whole module exists
 * to close.
 */
export async function loadRecentHistory(
  client: SupabaseClient,
  conversationId: string,
  window: number = MENTOR_HISTORY_WINDOW,
): Promise<RecentHistoryResult> {
  const { data, error, count } = await client
    .from(MESSAGES_TABLE)
    .select('id, role, agent_type, content, created_at', { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(window)

  if (error) {
    return { history: [], total: null, error }
  }
  const rows = (data ?? []) as HistoryRow[]
  return {
    history: rows.slice().reverse(),
    total: typeof count === 'number' ? count : null,
    error: null,
  }
}

export interface PageCursor {
  created_at: string
  id: string
}

export interface ConversationPageInfo {
  limit: number
  returned: number
  /** True when rows exist before the earliest row of this page. Derived from
   *  the exact count, never from `returned === limit` alone (a capped page
   *  could return fewer than `limit` while more remain — see the header). */
  has_earlier: boolean
  /** Hand back as `before_created_at` + `before_id` to load the previous page. */
  earliest_cursor: PageCursor | null
  /** Rows matching the query's filter: the whole conversation on the first
   *  page; rows strictly BEFORE the cursor on later pages. */
  matching_total: number | null
}

export interface ConversationPageResult {
  /** ASCENDING within the page (oldest → newest), the shape the pages render. */
  messages: Record<string, unknown>[]
  page: ConversationPageInfo
  error: ReadError | null
}

/**
 * Clamp a raw `limit` query value into [1, CONVERSATION_PAGE_MAX], defaulting
 * to CONVERSATION_PAGE_DEFAULT for anything absent, non-numeric, or < 1.
 */
export function clampPageLimit(raw: unknown): number {
  const n = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : NaN
  if (!Number.isFinite(n) || n < 1) return CONVERSATION_PAGE_DEFAULT
  return Math.min(Math.floor(n), CONVERSATION_PAGE_MAX)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// A timestamptz as PostgREST serialises it (ISO-8601 with an offset or Z).
// Deliberately strict: these values are interpolated into a PostgREST `or=`
// filter, whose grammar reserves `,` `(` `)` `"` `\` — so the validator is
// also the injection guard. Anything outside this alphabet is refused.
const ISO_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/

export type PageParams =
  | { ok: true; limit: number; before: PageCursor | null }
  | { ok: false; error: string }

/**
 * Parse `?limit=&before_created_at=&before_id=`. The two cursor params must
 * be supplied together and must each be well-formed; a malformed cursor is a
 * 400 at the route, never silently ignored (silently ignoring it would serve
 * the FIRST page in place of the requested earlier one — a different silent
 * remainder).
 */
export function parseConversationPageParams(params: URLSearchParams): PageParams {
  const limit = clampPageLimit(params.get('limit'))
  const beforeCreatedAt = params.get('before_created_at')
  const beforeId = params.get('before_id')
  if (beforeCreatedAt === null && beforeId === null) {
    return { ok: true, limit, before: null }
  }
  if (beforeCreatedAt === null || beforeId === null) {
    return { ok: false, error: 'before_created_at and before_id must be supplied together.' }
  }
  if (!ISO_TS_RE.test(beforeCreatedAt) || Number.isNaN(Date.parse(beforeCreatedAt))) {
    return { ok: false, error: 'before_created_at must be an ISO-8601 timestamp as returned in earliest_cursor.' }
  }
  if (!UUID_RE.test(beforeId)) {
    return { ok: false, error: 'before_id must be a UUID as returned in earliest_cursor.' }
  }
  return { ok: true, limit, before: { created_at: beforeCreatedAt, id: beforeId } }
}

/**
 * One page of a conversation, most-recent-first semantics, returned ascending.
 * With no `before` cursor: the newest `limit` rows. With a cursor: the
 * `limit` rows immediately before it under (created_at, id) ordering.
 */
export async function loadConversationPage(
  client: SupabaseClient,
  conversationId: string,
  opts: { limit?: number; before?: PageCursor | null } = {},
): Promise<ConversationPageResult> {
  const limit = clampPageLimit(opts.limit)
  const before = opts.before ?? null

  let query = client
    .from(MESSAGES_TABLE)
    .select('*', { count: 'exact' })
    .eq('conversation_id', conversationId)

  if (before) {
    // Keyset: rows strictly before the cursor under (created_at DESC, id DESC).
    // The values are validated by parseConversationPageParams (or constructed
    // server-side) so they contain none of PostgREST's reserved characters.
    query = query.or(
      `created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`,
    )
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (error) {
    return {
      messages: [],
      page: { limit, returned: 0, has_earlier: false, earliest_cursor: null, matching_total: null },
      error,
    }
  }

  const desc = (data ?? []) as Record<string, unknown>[]
  const asc = desc.slice().reverse()
  const earliest = asc[0]
  const matchingTotal = typeof count === 'number' ? count : null
  return {
    messages: asc,
    page: {
      limit,
      returned: asc.length,
      // Exact-count based. Fallback (count absent) is the conservative
      // "possibly more" reading, never a silent "no more".
      has_earlier: matchingTotal !== null ? matchingTotal > asc.length : asc.length >= limit,
      earliest_cursor: earliest
        ? { created_at: String(earliest.created_at), id: String(earliest.id) }
        : null,
      matching_total: matchingTotal,
    },
    error: null,
  }
}
