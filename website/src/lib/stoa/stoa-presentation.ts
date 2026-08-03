/**
 * stoa-presentation.ts — the served projection of a Stoa entry (ST3).
 *
 * What a VIEWER sees is deliberately narrower than the stored row:
 *   - display identity is the practitioner's chosen presence — the
 *     profiles.display_name for humans (Q4b: pseudonymity honoured, NEVER the
 *     email), the K1 agent_id for agents. The raw owner auth UUID is NEVER
 *     served (the ST1 community-map lesson — the raw UUID was dropped at the
 *     repair; a new surface never re-introduces it).
 *   - credential_ref is NEVER served (operational linkage, not presence).
 *   - status / removal fields are NEVER served (the list is active-only; a
 *     removal record is visible only to its own practitioner via the
 *     own-entry read).
 *   - declared_at (+ renewed_at when present) ALWAYS served (#12 — honest
 *     ageing, no editorialising).
 *   - NO evaluative field exists to serve (#20) and NO engagement field
 *     exists at all (#23).
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { StoaEntry, StoaRemovalGround } from './stoa-store'
import { STOA_STALE_AFTER_DAYS } from './stoa-copy'

/** The wire shape of a served entry. */
export interface StoaEntryView {
  id: string
  /** 'human' | 'agent' — presentation only, never a hierarchy (#2: one space). */
  kind: 'human' | 'agent'
  /** The practitioner's chosen presence: display_name (humans, Q4b) or the
   *  K1 agent_id (agents). */
  display_name: string
  /** Served for agent entries only — the id an ST4/ST5 consumer uses to look
   *  up the public trust record (#19; the link itself is ST4's build). */
  agent_id: string | null
  what_i_bring: string | null
  what_i_seek: string | null
  contact_channel: string | null
  visibility: 'community' | 'public'
  tags: string[]
  declared_at: string
  renewed_at: string | null
}

/** Resolve display names for the human entries' owners in one query.
 *  Returns ownerUserId → display_name. Fail-soft: on any error the fallback
 *  'Practitioner' (the profiles column's own default) is used — a display
 *  hiccup must never fail the list. */
export async function resolveDisplayNames(
  client: SupabaseClient,
  ownerUserIds: string[],
): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const ids = [...new Set(ownerUserIds)].filter(Boolean)
  if (ids.length === 0) return map
  try {
    const { data, error } = await client
      .from('profiles')
      .select('id, display_name')
      .in('id', ids)
    if (error || !data) return map
    for (const row of data as Array<{ id: string; display_name: string | null }>) {
      if (row.display_name) map.set(row.id, row.display_name)
    }
  } catch {
    // fall through to defaults
  }
  return map
}

/** Project a stored entry onto the served view. `displayNames` supplies the
 *  human display identities (Q4b); anything unresolved falls back to
 *  'Practitioner'. */
export function presentStoaEntry(
  entry: StoaEntry,
  displayNames: Map<string, string>,
): StoaEntryView {
  const isAgent = entry.agentId !== null
  return {
    id: entry.id,
    kind: isAgent ? 'agent' : 'human',
    display_name: isAgent
      ? (entry.agentId as string)
      : (displayNames.get(entry.ownerUserId ?? '') ?? 'Practitioner'),
    agent_id: entry.agentId,
    what_i_bring: entry.whatIBring,
    what_i_seek: entry.whatISeek,
    contact_channel: entry.contactChannel,
    visibility: entry.visibility,
    tags: entry.tags,
    declared_at: entry.declaredAt,
    renewed_at: entry.renewedAt,
  }
}

/** Present a list: resolve the human display names once, project every entry. */
export async function presentStoaEntries(
  client: SupabaseClient,
  entries: StoaEntry[],
): Promise<StoaEntryView[]> {
  const ownerIds = entries
    .map((e) => e.ownerUserId)
    .filter((id): id is string => id !== null)
  const names = await resolveDisplayNames(client, ownerIds)
  return entries.map((e) => presentStoaEntry(e, names))
}

/**
 * The OWN-VIEW projection (PR19 fold, 2026-08-03): what a practitioner sees
 * of their OWN row. Strictly the caller's data, but still projected — the
 * first draft served the raw store row, contradicting the module's stated
 * invariant: the raw auth UUID and credential ref are never on the wire
 * (even to their subject — nothing needs them), and `removalArtifactRef` is
 * an internal reference not served to the removed party. `status` and
 * `removalGround` ARE served: the practitioner may honestly see that (and on
 * which ruled ground) their declaration was removed.
 */
export interface StoaOwnEntryView {
  id: string
  whatIBring: string | null
  whatISeek: string | null
  contactChannel: string | null
  visibility: 'community' | 'public'
  tags: string[]
  declaredAt: string
  renewedAt: string | null
  status: 'active' | 'withdrawn' | 'removed'
  removalGround: StoaRemovalGround | null
}

export function presentOwnStoaEntry(entry: StoaEntry): StoaOwnEntryView {
  return {
    id: entry.id,
    whatIBring: entry.whatIBring,
    whatISeek: entry.whatISeek,
    contactChannel: entry.contactChannel,
    visibility: entry.visibility,
    tags: entry.tags,
    declaredAt: entry.declaredAt,
    renewedAt: entry.renewedAt,
    status: entry.status,
    removalGround: entry.removalGround,
  }
}

/**
 * The Q9 staleness reading (#24) — extracted pure so the boundary battery
 * can pin the threshold behaviour (PR19 fold: the inline route computation
 * was untested at the 179/180 boundary). Days are measured from the LATER of
 * declared/renewed (tending the entry resets the clock).
 */
export function assessStoaStaleness(
  declaredAt: string,
  renewedAt: string | null,
  nowMs: number,
): { stale: boolean; daysSinceTended: number } {
  const tendedAt = new Date(renewedAt ?? declaredAt).getTime()
  const daysSinceTended = Math.floor((nowMs - tendedAt) / (24 * 60 * 60 * 1000))
  return { stale: daysSinceTended >= STOA_STALE_AFTER_DAYS, daysSinceTended }
}

/**
 * The in-route text search (#9 — consultation of the resource). A FILTER,
 * never a rank: order is preserved (the store's declaration recency, #8).
 * Case-insensitive substring over the DECLARED fields + tags only.
 */
export function filterStoaEntriesByQuery(entries: StoaEntry[], q: string): StoaEntry[] {
  const needle = q.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter((e) => {
    const hay = [e.whatIBring ?? '', e.whatISeek ?? '', e.tags.join(' ')]
      .join(' ')
      .toLowerCase()
    return hay.includes(needle)
  })
}
