/**
 * mentor-interactions-loader.ts — Live mentor_interactions → InteractionRecord[] loader
 *
 * PURPOSE: Read hub-scoped rows from `mentor_interactions` and map them to the
 * `InteractionRecord` shape that `analysePatterns()` (sage-mentor/pattern-engine.ts)
 * consumes. This is the live counterpart to the PROOF_INTERACTIONS fixture
 * (lib/mentor-ring-fixtures.ts), introduced under ADR-PE-01 §1.2 (c) and
 * §7.1 (Adopted 26 April 2026).
 *
 * Contract:
 *   - Hub-scoped per (profile_id, hub_id). ADR §1.4. Q-Loader-Scope.
 *   - Default time window: last 90 days. Default limit: 100 most recent.
 *     Q-Loader-Source plan-walk decisions (26 April 2026).
 *   - Returns InteractionRecord[] (possibly empty). Never throws — any DB or
 *     mapping error is caught and logged, and the function returns []. Worst
 *     case A mitigation: empty input → analysePatterns produces an empty
 *     PatternAnalysis with no detections (structurally valid).
 *   - Read-only. No writes from this file.
 *
 * Risk classification: this file itself is Standard (read-only). The session
 * that introduces it is Critical under PR6 because it sits inside the
 * encryption pipeline's blast radius — every consumer that calls it will, on
 * cache miss, run analysePatterns over the loader's output and persist the
 * result inside the encrypted profile blob.
 *
 * Single-endpoint proof (PR1): this loader is wired only on
 * /api/mentor/ring/proof in the introducing session. Reflect and founder-hub
 * remain on 2A-skip on absence until the loader reaches Verified status.
 *
 * Knowledge-gap citations:
 *   - KG3 (hub-label end-to-end contract): the caller passes the canonical
 *     hub_id; this loader does not map labels. Allowed values are constrained
 *     by the InteractionsHubId type below; callers using request-derived
 *     hub_ids must validate against an allowlist before calling.
 *   - KG7 (JSONB shape): defensive parse on `passions_detected`. The historical
 *     R2-followup bug (string-inside-JSONB at recordInteraction in
 *     sage-mentor/profile-store.ts:781) means some rows store the array as
 *     a JSON-string scalar. Mirror the parse pattern from
 *     mentor-context-private.ts:687-695 so legacy rows render correctly even
 *     after the writer-layer fix lands.
 *   - KG1 rule 2 (await DB writes): N/A — this file performs reads only.
 *   - KG6 (composition order): N/A — this file produces input for
 *     analysePatterns; composition is the caller's responsibility.
 *
 * Field-shape mapping (worst case D):
 *   Live `mentor_interactions.passions_detected` row shape:
 *     { root_passion: string, sub_species: string, false_judgement: string }[]
 *   Engine-expected `InteractionRecord.passions_detected` shape:
 *     { passion: string, false_judgement: string }[]
 *   Mapping rule: passion := sub_species ?? root_passion. Sub-species is more
 *   specific (e.g., "deadline anxiety") and is the value PROOF_INTERACTIONS
 *   uses; root_passion (e.g., "phobos") is the fallback when sub_species is
 *   absent. false_judgement passes through unchanged.
 *
 * Verification at introduction: the proof endpoint's recompute branch fires
 * the loader on cache miss / bypass; pattern_source: 'recomputed' confirms
 * the loader was invoked, returned data, and produced a valid PatternAnalysis.
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import type { InteractionRecord } from '@/lib/sage-mentor-ring-bridge'

/**
 * Hub identifiers permitted in the mentor_interactions table per the
 * 2026-04-12 hub_isolation migration. Constrained at the type level so a
 * miscalled loader fails at compile time, not at query time.
 */
export type InteractionsHubId = 'private-mentor' | 'founder-mentor'

/**
 * Loader options. All optional; defaults match the 26 April 2026 founder
 * direction at the Q-Loader-Source plan walk.
 */
export interface LoaderOptions {
  /** Time window in days (default 90). Rows older than (now - windowDays) are excluded. */
  windowDays?: number
  /** Max rows returned (default 100). Most recent first. */
  limit?: number
}

/** Internal — shape of a row as the loader expects it from Supabase. */
interface MentorInteractionRow {
  id: string
  interaction_type: string
  description: string | null
  proximity_assessed: string | null
  passions_detected: unknown // JSONB; may be array or JSON-string-scalar (KG7)
  mechanisms_applied: string[] | null
  created_at: string
}

/** Internal — the live row's `passions_detected` element shape. */
interface LiveDetectedPassion {
  root_passion?: string
  sub_species?: string
  false_judgement?: string
  passion?: string // tolerated for forward-compat if a writer has already migrated
}

/**
 * Defensive JSONB parse mirroring mentor-context-private.ts:687-695.
 * Returns an array of LiveDetectedPassion (possibly empty); never throws.
 *
 * Three input shapes are tolerated:
 *   - Array (correct shape): pass through.
 *   - String (KG7 / R2-followup bug): JSON.parse, expect array; on parse error
 *     or non-array result, return [].
 *   - Anything else (null/undefined/object/etc.): return [].
 */
function parsePassionsDetected(raw: unknown): LiveDetectedPassion[] {
  let parsed: unknown = raw
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed)
    } catch {
      return []
    }
  }
  if (!Array.isArray(parsed)) return []
  return parsed.filter(
    (item): item is LiveDetectedPassion =>
      item !== null && typeof item === 'object',
  )
}

/**
 * Map a live row to an InteractionRecord. Pure function, no I/O.
 * Returns null if the row is structurally unmappable (worst case B mitigation).
 *
 * Required fields for a successful map:
 *   - id (string)
 *   - interaction_type (string)
 *   - created_at (string, ISO timestamp)
 *   - description: tolerated as null → empty string
 *   - proximity_assessed: tolerated as null → 'reflexive' (the InteractionRecord
 *     type requires a proximity string; reflexive is the most conservative
 *     default — it produces no signal in the time-of-day / day-of-week detectors
 *     because they require ≥2 buckets / >0.5 passion rate).
 *   - mechanisms_applied: tolerated as null → []
 *   - passions_detected: parsed defensively per KG7; mapped per worst case D.
 */
function rowToInteractionRecord(
  row: MentorInteractionRow,
): InteractionRecord | null {
  if (!row.id || !row.interaction_type || !row.created_at) {
    return null
  }

  const livePassions = parsePassionsDetected(row.passions_detected)

  // Worst case D: shape map. passion := sub_species ?? root_passion ?? passion
  // (last fallback covers any forward-compat row where the writer has already
  // been migrated to the engine-expected shape).
  const passions_detected: InteractionRecord['passions_detected'] = []
  for (const live of livePassions) {
    const passion =
      (typeof live.sub_species === 'string' && live.sub_species) ||
      (typeof live.root_passion === 'string' && live.root_passion) ||
      (typeof live.passion === 'string' && live.passion) ||
      null
    const false_judgement =
      typeof live.false_judgement === 'string' ? live.false_judgement : null
    if (passion && false_judgement) {
      passions_detected.push({ passion, false_judgement })
    }
    // If either field is missing after the defensive map, skip this passion
    // entry rather than fabricating a value. The remaining passions on the row
    // (if any) and the row itself remain valid.
  }

  return {
    id: row.id,
    interaction_type: row.interaction_type,
    description: row.description ?? '',
    proximity_assessed:
      (row.proximity_assessed as InteractionRecord['proximity_assessed']) ??
      'reflexive',
    passions_detected,
    mechanisms_applied: Array.isArray(row.mechanisms_applied)
      ? row.mechanisms_applied
      : [],
    created_at: row.created_at,
  }
}

/**
 * Load hub-scoped mentor interactions for a profile, mapped to InteractionRecord[]
 * for direct consumption by analysePatterns().
 *
 * Q-Loader-Cadence: per-consumer-request. The caller decides invocation
 * frequency; this loader is stateless.
 *
 * @param profileId - The mentor_profiles.id (NOT auth user_id) for the practitioner.
 *                    Caller is responsible for the lookup (profile_id is
 *                    already cached on the proof endpoint via getProfileId).
 * @param hubId    - Hub scope: 'private-mentor' or 'founder-mentor'.
 * @param options  - { windowDays?: number; limit?: number }. Defaults: 90, 100.
 * @returns Promise<InteractionRecord[]> — empty array on any error.
 */
export async function loadMentorInteractionsAsRecords(
  profileId: string,
  hubId: InteractionsHubId,
  options?: LoaderOptions,
): Promise<InteractionRecord[]> {
  const windowDays = options?.windowDays ?? 90
  const limit = options?.limit ?? 100

  try {
    // Compute the cutoff timestamp. Worst case A mitigation: any failure in
    // this block falls through to the catch and returns [].
    const cutoffMs = Date.now() - windowDays * 24 * 60 * 60 * 1000
    const cutoffIso = new Date(cutoffMs).toISOString()

    const { data, error } = await supabaseAdmin
      .from('mentor_interactions')
      .select(
        'id, interaction_type, description, proximity_assessed, passions_detected, mechanisms_applied, created_at',
      )
      .eq('profile_id', profileId)
      .eq('hub_id', hubId)
      .gte('created_at', cutoffIso)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error(
        `[mentor-interactions-loader] query error profile=${profileId} hub=${hubId}:`,
        error,
      )
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    const rows = data as MentorInteractionRow[]

    // Map defensively — rows that fail validation are skipped, not the whole
    // load. Worst case B mitigation.
    const records: InteractionRecord[] = []
    for (const row of rows) {
      const record = rowToInteractionRecord(row)
      if (record) records.push(record)
    }

    return records
  } catch (err) {
    console.error(
      `[mentor-interactions-loader] unhandled error profile=${profileId} hub=${hubId}:`,
      err,
    )
    return []
  }
}
