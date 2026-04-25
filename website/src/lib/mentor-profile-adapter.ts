/**
 * mentor-profile-adapter.ts — Read-time adapter
 *   MentorProfileData (persisted website shape) → MentorProfile (canonical sage shape)
 *
 * PURPOSE: Session 1 of the staged transition adopted under
 * /compliance/ADR-Ring-2-01-shape-adapter.md (Adopted 25 April 2026).
 *
 * The website's persistence layer stores `MentorProfileData` (defined in
 * /website/src/lib/mentor-profile-summary.ts). The Ring Wrapper, pattern-engine,
 * and the rest of /sage-mentor/ consume `MentorProfile` (defined in
 * /sage-mentor/persona.ts). The two shapes are similar but not identical
 * (full enumeration in ADR-Ring-2-01 §2).
 *
 * This file is the single read-time conversion. It is consumed by
 * `loadMentorProfileCanonical()` in /website/src/lib/mentor-profile-store.ts
 * to translate decrypted plaintext into the canonical shape on every read.
 *
 * Properties:
 *   - Pure synchronous function. No I/O. No async. (PR3.)
 *   - Operates on plaintext that came from the encryption pipeline. R17
 *     surface unchanged: no new at-rest plaintext location.
 *   - Honest sentinels for data we cannot derive from the persisted shape
 *     (see ADR-Ring-2-01 §6.2). No fabricated data.
 *   - Frequency-bucket conversion uses `frequencyBucketFromCount` — exported
 *     so any future consumer (e.g. the rewritten buildProfileSummary in
 *     Session 5) imports from a single source of truth (ADR §2.4 + §6.3).
 *
 * Future amendments to either type definition should also touch this file.
 * Reference comments in /sage-mentor/persona.ts (MentorProfile) and
 * /website/src/lib/mentor-profile-summary.ts (MentorProfileData) point here.
 */

import type {
  MentorProfile,
  PassionMapEntry as CanonicalPassionMapEntry,
  CausalTendency,
  ValueHierarchyEntry,
  OikeioisMapEntry,
  VirtueDomainAssessment,
  JournalReference,
} from '../../../sage-mentor'
import type {
  DimensionScores,
  KatorthomaProximityLevel,
  DimensionLevel,
} from '../../../trust-layer/types/accreditation'
import type { MentorProfileData } from './mentor-profile-summary'

// ── Type-level helpers (pulled from MentorProfile field unions) ─────────

type RootPassion = CanonicalPassionMapEntry['root_passion']
type FrequencyBucket = CanonicalPassionMapEntry['frequency']
type CausalFailurePoint = CausalTendency['failure_point']
type OikeiosisStage = OikeioisMapEntry['oikeiosis_stage']
type ReflectionFrequency = OikeioisMapEntry['reflection_frequency']
type VirtueDomain = VirtueDomainAssessment['domain']
type VirtueStrength = VirtueDomainAssessment['strength']
type SenecanGrade = MentorProfile['senecan_grade']
type DirectionOfTravel = MentorProfile['direction_of_travel']

// ── Allowlists for runtime validation ───────────────────────────────────

const ROOT_PASSIONS: ReadonlySet<RootPassion> = new Set<RootPassion>([
  'epithumia',
  'hedone',
  'phobos',
  'lupe',
])

const CAUSAL_FAILURE_POINTS: ReadonlySet<CausalFailurePoint> = new Set<CausalFailurePoint>([
  'phantasia',
  'synkatathesis',
  'horme',
  'praxis',
])

const OIKEIOSIS_STAGES: ReadonlySet<OikeiosisStage> = new Set<OikeiosisStage>([
  'self_preservation',
  'household',
  'community',
  'humanity',
  'cosmic',
])

const REFLECTION_FREQUENCIES: ReadonlySet<ReflectionFrequency> = new Set<ReflectionFrequency>([
  'rarely',
  'sometimes',
  'often',
])

const VIRTUE_DOMAINS: ReadonlySet<VirtueDomain> = new Set<VirtueDomain>([
  'phronesis',
  'dikaiosyne',
  'andreia',
  'sophrosyne',
])

const VIRTUE_STRENGTHS: ReadonlySet<VirtueStrength> = new Set<VirtueStrength>([
  'strong',
  'moderate',
  'developing',
  'gap',
])

const SENECAN_GRADES: ReadonlySet<SenecanGrade> = new Set<SenecanGrade>([
  'pre_progress',
  'grade_3',
  'grade_2',
  'grade_1',
])

const PROXIMITY_LEVELS: ReadonlySet<KatorthomaProximityLevel> = new Set<KatorthomaProximityLevel>([
  'reflexive',
  'habitual',
  'deliberate',
  'principled',
  'sage_like',
])

const DIMENSION_LEVELS: ReadonlySet<DimensionLevel> = new Set<DimensionLevel>([
  'emerging',
  'developing',
  'established',
  'advanced',
])

// ── Frequency-bucket conversion ─────────────────────────────────────────

/**
 * Convert a passion-frequency count (1–12, used by the journal-ingestion
 * pipeline and the persisted MentorProfileData shape) into the canonical
 * frequency bucket used by MentorProfile.
 *
 * This is the de-facto canonical mapping that lives in
 * `mentor-profile-summary.ts:126`, lifted here as the single source of truth
 * (per ADR-Ring-2-01 §2.4 and §6.3). Once consumers migrate (Sessions 3–5),
 * `mentor-profile-summary.ts:126` either imports this or is removed.
 *
 * Boundaries:
 *   1     → 'rare'
 *   2–3   → 'occasional'
 *   4–6   → 'recurring'
 *   7–12  → 'persistent'
 *
 * Out-of-range or invalid inputs are clamped to the nearest valid bucket
 * and a warning is logged (per ADR §6.4 — no throws on degraded data).
 */
export function frequencyBucketFromCount(n: number): FrequencyBucket {
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    console.warn(
      `[mentor-profile-adapter] frequencyBucketFromCount: invalid input ${String(n)} — defaulting to 'rare'`,
    )
    return 'rare'
  }
  if (n < 1) {
    console.warn(
      `[mentor-profile-adapter] frequencyBucketFromCount: ${n} < 1 — clamped to 'rare'`,
    )
    return 'rare'
  }
  if (n > 12) {
    console.warn(
      `[mentor-profile-adapter] frequencyBucketFromCount: ${n} > 12 — clamped to 'persistent'`,
    )
    return 'persistent'
  }
  if (n >= 7) return 'persistent'
  if (n >= 4) return 'recurring'
  if (n >= 2) return 'occasional'
  return 'rare'
}

// ── Honest-sentinel constants (per ADR §6.2) ────────────────────────────

const SENTINEL_LAST_INTERACTION = 'not yet recorded'
const DEFAULT_DIMENSIONS: DimensionScores = {
  passion_reduction: 'developing',
  judgement_quality: 'developing',
  disposition_stability: 'developing',
  oikeiosis_extension: 'developing',
}

// ── Per-section converters ──────────────────────────────────────────────

function convertPassionMap(
  source: MentorProfileData['passion_map'] | undefined,
): CanonicalPassionMapEntry[] {
  if (!Array.isArray(source) || source.length === 0) return []
  const out: CanonicalPassionMapEntry[] = []
  for (const p of source) {
    if (!p || typeof p !== 'object') continue
    const root = ROOT_PASSIONS.has(p.root_passion as RootPassion)
      ? (p.root_passion as RootPassion)
      : 'phobos'
    if (root !== p.root_passion) {
      console.warn(
        `[mentor-profile-adapter] convertPassionMap: unknown root_passion "${String(p.root_passion)}" — defaulted to 'phobos'`,
      )
    }
    const falseJudgements = Array.isArray(p.false_judgements) ? p.false_judgements : []
    out.push({
      passion_id: typeof p.passion_id === 'string' ? p.passion_id : 'unknown',
      sub_species: typeof p.sub_species === 'string' ? p.sub_species : 'unknown',
      root_passion: root,
      false_judgement: falseJudgements[0] ?? '',
      frequency: frequencyBucketFromCount(typeof p.frequency === 'number' ? p.frequency : 0),
      first_seen: '',
      last_seen: '',
      journal_references: [],
    })
  }
  return out
}

function convertCausalTendencies(
  source: MentorProfileData['causal_tendencies'] | undefined,
): CausalTendency[] {
  if (!source || typeof source !== 'object') return []
  const out: CausalTendency[] = []

  // Primary breakdown becomes one entry if it maps to a known failure point
  const primary = source.primary_breakdown
  if (typeof primary === 'string' && primary.length > 0) {
    const failurePoint = CAUSAL_FAILURE_POINTS.has(primary as CausalFailurePoint)
      ? (primary as CausalFailurePoint)
      : 'phantasia'
    if (failurePoint !== primary) {
      console.warn(
        `[mentor-profile-adapter] convertCausalTendencies: unknown primary_breakdown "${primary}" — defaulted to 'phantasia'`,
      )
    }
    out.push({
      failure_point: failurePoint,
      description: typeof source.description === 'string' ? source.description : '',
      frequency: 'common',
      examples: [],
    })
  }

  // Specific breakdowns each become an additional entry
  const specific =
    source.specific_breakdowns && typeof source.specific_breakdowns === 'object'
      ? source.specific_breakdowns
      : {}
  for (const [stage, desc] of Object.entries(specific)) {
    if (typeof desc !== 'string') continue
    const failurePoint = CAUSAL_FAILURE_POINTS.has(stage as CausalFailurePoint)
      ? (stage as CausalFailurePoint)
      : null
    if (!failurePoint) {
      console.warn(
        `[mentor-profile-adapter] convertCausalTendencies: unknown specific_breakdown stage "${stage}" — entry skipped`,
      )
      continue
    }
    // Skip if we already pushed this failure point as the primary
    if (out.some((e) => e.failure_point === failurePoint)) continue
    out.push({
      failure_point: failurePoint,
      description: desc,
      frequency: 'occasional',
      examples: [],
    })
  }

  return out
}

function convertValueHierarchy(
  source: MentorProfileData['value_hierarchy'] | undefined,
): ValueHierarchyEntry[] {
  if (!source || typeof source !== 'object') return []
  const out: ValueHierarchyEntry[] = []

  const explicitTop = Array.isArray(source.explicit_top_values) ? source.explicit_top_values : []
  for (const item of explicitTop) {
    if (typeof item !== 'string' || item.length === 0) continue
    out.push({
      item,
      declared_classification: 'preferred indifferent',
      observed_classification: 'preferred indifferent',
      gap_detected: false,
      journal_references: [],
    })
  }

  const gaps = Array.isArray(source.classification_gaps) ? source.classification_gaps : []
  for (const item of gaps) {
    if (typeof item !== 'string' || item.length === 0) continue
    out.push({
      item,
      declared_classification: 'preferred indifferent',
      observed_classification: 'genuine good',
      gap_detected: true,
      journal_references: [],
    })
  }

  return out
}

function convertOikeiosisMap(
  source: MentorProfileData['oikeiosis_map'] | undefined,
): OikeioisMapEntry[] {
  if (!source || typeof source !== 'object') return []
  const out: OikeioisMapEntry[] = []
  for (const [circle, entry] of Object.entries(source)) {
    if (!entry || typeof entry !== 'object') continue
    const stage = OIKEIOSIS_STAGES.has(circle as OikeiosisStage)
      ? (circle as OikeiosisStage)
      : null
    if (!stage) {
      console.warn(
        `[mentor-profile-adapter] convertOikeiosisMap: unknown circle "${circle}" — entry skipped`,
      )
      continue
    }
    const evidence = typeof entry.evidence === 'string' ? entry.evidence : ''
    const level = typeof entry.level === 'string' ? entry.level : ''
    const reflection: ReflectionFrequency = REFLECTION_FREQUENCIES.has(level as ReflectionFrequency)
      ? (level as ReflectionFrequency)
      : 'sometimes'
    out.push({
      person_or_role: evidence || circle,
      relationship: circle,
      oikeiosis_stage: stage,
      reflection_frequency: reflection,
    })
  }
  return out
}

function convertVirtueProfile(
  source: MentorProfileData['virtue_profile'] | undefined,
): VirtueDomainAssessment[] {
  if (!source || typeof source !== 'object') return []
  const out: VirtueDomainAssessment[] = []
  for (const [virtue, entry] of Object.entries(source)) {
    if (!entry || typeof entry !== 'object') continue
    if (!VIRTUE_DOMAINS.has(virtue as VirtueDomain)) {
      console.warn(
        `[mentor-profile-adapter] convertVirtueProfile: unknown virtue "${virtue}" — entry skipped`,
      )
      continue
    }
    const strengthRaw = typeof entry.overall_strength === 'string' ? entry.overall_strength : ''
    const strength: VirtueStrength = VIRTUE_STRENGTHS.has(strengthRaw as VirtueStrength)
      ? (strengthRaw as VirtueStrength)
      : 'developing'
    if (strength !== strengthRaw) {
      console.warn(
        `[mentor-profile-adapter] convertVirtueProfile: unknown strength "${strengthRaw}" for ${virtue} — defaulted to 'developing'`,
      )
    }
    const evidenceArr = Array.isArray(entry.evidence_summary) ? entry.evidence_summary : []
    out.push({
      domain: virtue as VirtueDomain,
      strength,
      evidence: evidenceArr[0] ?? '',
      journal_references: [],
    })
  }
  return out
}

function deriveSenecanGrade(source: string | undefined): SenecanGrade {
  if (typeof source !== 'string' || source.length === 0) return 'pre_progress'
  if (SENECAN_GRADES.has(source as SenecanGrade)) return source as SenecanGrade
  console.warn(
    `[mentor-profile-adapter] deriveSenecanGrade: unknown grade "${source}" — defaulted to 'pre_progress'`,
  )
  return 'pre_progress'
}

function deriveProximityLevel(source: string | undefined): KatorthomaProximityLevel {
  if (typeof source !== 'string' || source.length === 0) return 'reflexive'
  if (PROXIMITY_LEVELS.has(source as KatorthomaProximityLevel)) {
    return source as KatorthomaProximityLevel
  }
  console.warn(
    `[mentor-profile-adapter] deriveProximityLevel: unknown level "${source}" — defaulted to 'reflexive'`,
  )
  return 'reflexive'
}

function clampDimensionLevel(value: unknown, fieldName: string): DimensionLevel {
  if (typeof value === 'string' && DIMENSION_LEVELS.has(value as DimensionLevel)) {
    return value as DimensionLevel
  }
  if (value !== undefined) {
    console.warn(
      `[mentor-profile-adapter] clampDimensionLevel: invalid ${fieldName}="${String(value)}" — defaulted to 'developing'`,
    )
  }
  return 'developing'
}

// ── Top-level adapter ───────────────────────────────────────────────────

/**
 * Optional metadata that the loader can pass through to the adapter.
 * Today this only carries the persisted row's `updated_at` timestamp,
 * used as the honest sentinel for `last_interaction` (per ADR §6.2).
 */
export interface MentorProfileAdapterMeta {
  /** Persisted row's updated_at timestamp (ISO 8601). */
  lastUpdated?: string
}

/**
 * Convert a persisted MentorProfileData (decrypted plaintext) to the canonical
 * MentorProfile shape consumed by the Ring Wrapper, pattern-engine, and the
 * rest of /sage-mentor/.
 *
 * Pure synchronous function. No I/O. Safe to call on every request.
 *
 * Sage-only-field defaults follow ADR-Ring-2-01 §6.2 — honest sentinels:
 *   persisting_passions  → derived from passion_map[].frequency >= 'recurring'
 *   current_prescription → null
 *   direction_of_travel  → 'stable'
 *   dimensions           → all 'developing'
 *   interaction_count    → 0
 *   last_interaction     → meta.lastUpdated ?? 'not yet recorded'
 *   journal_references   → []
 *
 * Drift-risk mitigation (ADR §8.4): the structural-completeness test in
 * `mentor-profile-adapter.test.ts` exercises every output field and asserts
 * the resulting MentorProfile has no missing required keys.
 */
export function adaptMentorProfileDataToCanonical(
  data: MentorProfileData,
  meta?: MentorProfileAdapterMeta,
): MentorProfile {
  if (!data || typeof data !== 'object') {
    throw new TypeError(
      '[mentor-profile-adapter] adaptMentorProfileDataToCanonical: input data is required',
    )
  }

  const passionMap = convertPassionMap(data.passion_map)
  const causalTendencies = convertCausalTendencies(data.causal_tendencies)
  const valueHierarchy = convertValueHierarchy(data.value_hierarchy)
  const oikeiosisMap = convertOikeiosisMap(data.oikeiosis_map)
  const virtueProfile = convertVirtueProfile(data.virtue_profile)

  const senecanGrade = deriveSenecanGrade(data.proximity_estimate?.senecan_grade)
  const proximityLevel = deriveProximityLevel(data.proximity_estimate?.level)

  // persisting_passions = those at 'recurring' or 'persistent' frequency.
  // Computed from the freshly-converted passion map so the bucket logic is
  // single-sourced via frequencyBucketFromCount.
  const persistingPassions = passionMap
    .filter((p) => p.frequency === 'recurring' || p.frequency === 'persistent')
    .map((p) => p.sub_species)

  const preferredIndifferents = Array.isArray(data.preferred_indifferents_aggregate)
    ? data.preferred_indifferents_aggregate.filter((s): s is string => typeof s === 'string')
    : []

  // dimensions — defaulted to 'developing' across the board (ADR §6.2).
  // Future progression-tracking surface populates real values; for now an
  // honest sentinel so the ring's profile context renders without lying
  // about progression state. Persisted rows do not carry these fields.
  const dimensions: DimensionScores = { ...DEFAULT_DIMENSIONS }
  void clampDimensionLevel // referenced to keep helper available for Session 2+

  const lastInteraction =
    typeof meta?.lastUpdated === 'string' && meta.lastUpdated.length > 0
      ? meta.lastUpdated
      : SENTINEL_LAST_INTERACTION

  const journalReferences: JournalReference[] = []
  const directionOfTravel: DirectionOfTravel = 'stable'

  return {
    user_id: typeof data.user_id === 'string' ? data.user_id : '',
    display_name: typeof data.display_name === 'string' ? data.display_name : 'Practitioner',
    passion_map: passionMap,
    causal_tendencies: causalTendencies,
    value_hierarchy: valueHierarchy,
    oikeiosis_map: oikeiosisMap,
    virtue_profile: virtueProfile,
    senecan_grade: senecanGrade,
    proximity_level: proximityLevel,
    dimensions,
    direction_of_travel: directionOfTravel,
    persisting_passions: persistingPassions,
    preferred_indifferents: preferredIndifferents,
    journal_references: journalReferences,
    current_prescription: null,
    last_interaction: lastInteraction,
    interaction_count: 0,
  }
}
