/**
 * reflect-extractor.ts — Sage Reflect translation-sandwich (Stage B, B-2).
 *
 * Built at the Sage Reflect build Stage B (Critical) session. Implements SR-6 of
 * /adopted/sage-reflect-product-design.md: the CONTROL FLOW is deterministic (the
 * engine); the SEMANTIC SCORING of the free-text answers is the translation-
 * sandwich. Layer 1 (Sonnet) extracts structured features from the agent's free
 * text → Layer 2 (deterministic, in the engine's typed assessment shapes) applies
 * the Stoic Brain mechanism. "Layer 2 keeps the judgement deterministic; the LLM
 * only extracts features."
 *
 * MODEL SELECTION (PR4 / AC1, cache row "Layer 1 translation = Sonnet"):
 *   Q1–Q4 semantic feature extraction uses MODEL_DEEP (Sonnet) — multi-mechanism
 *   structured extraction is beyond Haiku's reliability boundary (KG2). There is NO
 *   safety-critical Haiku call in this product; the Zone-3 path (zone3-boundary.ts)
 *   is a deterministic boundary check, not an LLM classifier.
 *
 * R5 COST BOUND: a full pass makes AT MOST 5 Layer-1 (Sonnet) calls — Q1, Q2, Q3,
 * Q4 (always), plus ONE CONDITIONAL Q5 escalation (A4, PR7). Q5 is DETERMINISTIC-
 * FIRST: buildQ5Deterministic returns the conservative reading for free; only when
 * the answer is AMBIGUOUS (isQ5Ambiguous — substantive AND carrying a change cue)
 * does extractQ5 make a 5th Sonnet call to confirm a genuine capacity/reasoning-
 * pattern change (so the engine's FD-R2 q5ConfirmsChange gate can be satisfied from
 * a real, clearly-stated change). Q6 (response-shape) stays deterministic; the FD-R1
 * null-suspicion test and the RS-4 ladder answers are deterministic too. Each
 * Q1–Q5 call's token usage is returned so the route can bill the loop (R5 2x).
 * (Bound raised ≤4→≤5 on 2026-05-23 under D-TRACK-FOLLOWONS-A-BUILD-2026-05-23.)
 *
 * DEPENDENCY-INJECTION SEAM: the route uses createSonnetExtractor() (real Sonnet);
 * tests pass a deterministic mock implementing ReflectExtractor. This is the same
 * DI discipline as sage-assent-feed.ts — the orchestration (reflect-service.ts) is
 * provable in isolation without any live LLM call.
 *
 * DEFENSIVE PARSING (R18d posture): the LLM output is validated against the
 * controlled vocabularies (root passion / proximity / kathekon quality / virtue
 * domain / horme direction). Any value outside the vocabulary is DROPPED, never
 * coerced — a malformed extraction degrades to a cleaner (more conservative)
 * assessment rather than fabricating signal. The engine's FD-R1 null-suspicion gate
 * then catches a suspiciously-clean result.
 *
 * R4: the prompts + the Layer-2 mapping are engine-internal; only the resulting
 * assessment (consumed by the deterministic engine) is produced here, never the
 * scoring logic or thresholds.
 */

import { getClient } from '@/lib/sage-reason-engine'
import { MODEL_DEEP } from '@/lib/model-config'
import { extractJSON } from '@/lib/json-utils'
import { sonnetCostMicrocents } from '@/lib/translation-sandwich/parallel-run'
import type {
  RootPassionId,
  KatorthomaProximityLevel,
} from '@/lib/substrate/trust-layer/types/accreditation'
import type { KathekonQuality } from '@/lib/substrate/trust-layer/types/evaluation'
import type {
  Q1Assessment,
  Q2Assessment,
  Q3Assessment,
  Q4Assessment,
  Q5Assessment,
  CapacityDelta,
  ResponseShape,
  VirtueDomain,
  HormeDirection,
  SessionSummary,
  PhantasiaDistortion,
  SynkatathesisFailure,
  HormePattern,
  KathekonAssessment,
} from './engine'

// ============================================================================
// CONTROLLED VOCABULARIES (Layer-2 validation allowlists)
// ============================================================================

const ROOT_PASSIONS: readonly RootPassionId[] = ['epithumia', 'hedone', 'phobos', 'lupe']
const PROXIMITIES: readonly KatorthomaProximityLevel[] = [
  'reflexive',
  'habitual',
  'deliberate',
  'principled',
  'sage_like',
]
const KATHEKON_QUALITIES: readonly KathekonQuality[] = ['strong', 'moderate', 'marginal', 'contrary']
const VIRTUE_DOMAINS: readonly VirtueDomain[] = ['phronesis', 'dikaiosyne', 'andreia', 'sophrosyne']
const HORME_DIRECTIONS: readonly HormeDirection[] = ['excess', 'deficit', 'misdirection']

function asEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : null
}
function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function asBool(value: unknown): boolean {
  return value === true
}
function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

// ============================================================================
// TOKEN USAGE + COST (R5)
// ============================================================================

export interface ExtractorTokenUsage {
  readonly input_tokens: number
  readonly output_tokens: number
}

export const ZERO_USAGE: ExtractorTokenUsage = { input_tokens: 0, output_tokens: 0 }

/** Sum two usages (a pass accumulates ≤4 Layer-1 calls). */
export function addUsage(a: ExtractorTokenUsage, b: ExtractorTokenUsage): ExtractorTokenUsage {
  return { input_tokens: a.input_tokens + b.input_tokens, output_tokens: a.output_tokens + b.output_tokens }
}

/** Convert a usage to cents for the loop bill. 1 cent = 10,000 microcents (1
 *  microcent = $0.000001), so cents = microcents / 10000 — matching the canonical
 *  loop-cost-tracker formula `(tokens/1e6) * USD_per_million * 100`. Returns a
 *  PRECISE FLOAT; rounding to the integer cents the `increment_api_usage` RPC
 *  requires happens at the meter/billing boundary (loop-cost-tracker convention). */
export function usageToCents(usage: ExtractorTokenUsage): number {
  return sonnetCostMicrocents(usage.input_tokens, usage.output_tokens) / 10000
}

export interface ExtractResult<A> {
  readonly assessment: A
  readonly usage: ExtractorTokenUsage
}

// ============================================================================
// DI SEAM
// ============================================================================

export interface ReflectExtractor {
  extractQ1(response: string): Promise<ExtractResult<Q1Assessment>>
  extractQ2(response: string): Promise<ExtractResult<Q2Assessment>>
  extractQ3(response: string): Promise<ExtractResult<Q3Assessment>>
  extractQ4(response: string): Promise<ExtractResult<Q4Assessment>>
  /** A4 (PR7): the conditional 5th call — only invoked when isQ5Ambiguous(response). */
  extractQ5(response: string, summary: SessionSummary): Promise<ExtractResult<Q5Assessment>>
}

// ============================================================================
// DETERMINISTIC HELPERS (no LLM — Q5, Q6/RS-4, FD-R1). PURE.
// ============================================================================

const NULL_TOKENS = new Set(['no', 'none', 'nothing', 'n/a', 'na', 'nil', 'nope', '-'])

/** FD-R1 null-suspicion test: is the answer substantive (not a bare denial)? Pure. */
export function isSubstantiveResponse(response: string): boolean {
  const trimmed = response.trim().toLowerCase().replace(/[.!]+$/g, '')
  if (trimmed.length === 0) return false
  if (NULL_TOKENS.has(trimmed)) return false
  // A bare denial is short and contains no concrete account. Substantive answers
  // name a moment — a heuristic threshold (a handful of words) is enough here; the
  // engine's low-confidence flag is the real safeguard.
  return trimmed.split(/\s+/).filter(Boolean).length >= 4
}

const COMPLETE_CUES = ['complete', 'completed', 'finished', 'done', 'fulfilled', 'accomplished', 'no longer needed']
const CHANGED_CUES = ['changed', 'different', 'revealed', 'new need', 'shifted', 'revised', 'misjudged', 'no longer fits', 'wrong']
const CONTINUES_CUES = ['continue', 'continues', 'still fitting', 'still fits', 'remains', 'holds', 'ongoing', 'unchanged', 'same purpose']

/**
 * Q6 / RS-4 deterministic response-shape classification (SR-6 "deterministic
 * structural rules first"). Keyword/structural cues map the free text to a shape;
 * an unresolved answer returns 'cannot_determine', which the engine routes into
 * the deterministic RS-4 supporting-question ladder (no LLM escalation needed).
 * PURE.
 */
export function classifyResponseShape(response: string): ResponseShape {
  const t = response.trim().toLowerCase()
  if (t.length === 0) return 'cannot_determine'
  const hasAny = (cues: readonly string[]): boolean => cues.some((c) => t.includes(c))
  // "changed" dominates "complete"/"continues" when both present (a revision is the
  // most consequential reading — RS-3 correction re-run).
  if (hasAny(CHANGED_CUES)) return 'changed'
  if (hasAny(COMPLETE_CUES)) return 'complete'
  if (hasAny(CONTINUES_CUES)) return 'continues'
  return 'cannot_determine'
}

/**
 * Q5 consolidation deltas — DETERMINISTIC-FIRST (SR-6). The default reading is
 * conservative: NO capacity change and NO confirmed reasoning-pattern change (so
 * FD-R2 holds progress dimensions unless a genuine change is confirmed), with the
 * circle-need carried from the session's opening circle and the verbatim Q5 answer
 * as the need description. PURE.
 *
 * A4 (PR7) escalation: when isQ5Ambiguous(response) is true, reflect-service calls
 * extractQ5 — the optional 5th Layer-1 call — to CONFIRM a genuine capacity /
 * reasoning-pattern change from the free text, rather than leaving the conservative
 * default in place. The default below is still correct when the answer is NOT
 * ambiguous (no change cue): a single session does not move the profile without a
 * clearly-stated change.
 */
export function buildQ5Deterministic(response: string, summary: SessionSummary): Q5Assessment {
  return {
    capacity_delta: { domains_added: [], domains_removed: [], domains_updated: [] },
    circle_need_delta: {
      circle: summary.circle_at_open,
      need_description: response.trim(),
      independence_confirmed: false,
      proportion_assessment: '',
    },
    reasoning_pattern_change: false,
  }
}

/**
 * Change cues that mark a Q5 answer as AMBIGUOUS (a possible confirmed change the
 * deterministic reading can't resolve). Matched on WORD BOUNDARIES so a negation
 * like "unchanged" does NOT match "changed" / "change", and "still"/"same"
 * (continuation, not change) are deliberately absent.
 */
const Q5_CHANGE_CUES: readonly string[] = [
  'changed', 'change', 'different', 'shifted', 'shift', 'revised', 'revise', 'revision',
  'no longer', 'new need', 'gained', 'lost', 'grew', 'developed', 'expanded', 'improved',
  'learned', 'realised', 'realized', 'acquired', 'dropped',
]

/**
 * A4 (PR7) ambiguity detector. A Q5 answer is ambiguous — warranting the optional
 * 5th Layer-1 (extractQ5) call — when it is SUBSTANTIVE (not a bare denial) AND
 * carries at least one change cue on a word boundary. A non-substantive answer, or
 * one with no change cue, keeps the conservative deterministic default (no 5th
 * call). Over-escalation only costs one extra Sonnet call that returns "no change"
 * (safe); under-escalation just keeps the conservative hold (also safe). PURE.
 */
export function isQ5Ambiguous(response: string): boolean {
  if (!isSubstantiveResponse(response)) return false
  const t = response.trim().toLowerCase()
  return Q5_CHANGE_CUES.some((cue) => new RegExp(`\\b${cue}\\b`).test(t))
}

// ============================================================================
// LAYER-2 MAPPERS — coerce raw LLM JSON → the engine's typed assessments. PURE.
// ============================================================================

function mapQ1(raw: unknown): Q1Assessment {
  const obj = (raw ?? {}) as Record<string, unknown>
  const distortions: PhantasiaDistortion[] = []
  for (const d of asArray(obj.distortions)) {
    const e = (d ?? {}) as Record<string, unknown>
    const root = asEnum(e.root_passion, ROOT_PASSIONS)
    if (!root) continue // drop invalid-vocabulary entries (conservative)
    distortions.push({ impression: asString(e.impression), root_passion: root, examined: asBool(e.examined) })
  }
  return { distortions }
}

function mapQ2(raw: unknown): Q2Assessment {
  const obj = (raw ?? {}) as Record<string, unknown>
  const failures: SynkatathesisFailure[] = []
  for (const f of asArray(obj.failures)) {
    const e = (f ?? {}) as Record<string, unknown>
    failures.push({
      impression: asString(e.impression),
      false_judgement: asString(e.false_judgement),
      selective_value_level: asString(e.selective_value_level),
    })
  }
  const pa = (obj.pressure_assent ?? {}) as Record<string, unknown>
  return {
    failures,
    pressure_assent: {
      admitted: asBool(pa.admitted),
      account_given: asBool(pa.account_given),
      moments: asArray(pa.moments).map(asString).filter((m) => m.length > 0),
    },
  }
}

function mapQ3(raw: unknown): Q3Assessment {
  const obj = (raw ?? {}) as Record<string, unknown>
  const patterns: HormePattern[] = []
  for (const p of asArray(obj.patterns)) {
    const e = (p ?? {}) as Record<string, unknown>
    const direction = asEnum(e.direction, HORME_DIRECTIONS)
    const domain = asEnum(e.virtue_domain, VIRTUE_DOMAINS)
    if (!direction || !domain) continue
    patterns.push({ direction, virtue_domain: domain, passion: asEnum(e.passion, ROOT_PASSIONS) })
  }
  return { patterns }
}

function mapQ4(raw: unknown): Q4Assessment {
  const obj = (raw ?? {}) as Record<string, unknown>
  const actions: KathekonAssessment[] = []
  for (const a of asArray(obj.actions)) {
    const e = (a ?? {}) as Record<string, unknown>
    const quality = asEnum(e.quality, KATHEKON_QUALITIES)
    const proximity = asEnum(e.proximity, PROXIMITIES)
    if (!quality || !proximity) continue
    const passions: { root_passion: RootPassionId; sub_species: string }[] = []
    for (const p of asArray(e.passions_detected)) {
      const pe = (p ?? {}) as Record<string, unknown>
      const rp = asEnum(pe.root_passion, ROOT_PASSIONS)
      if (rp) passions.push({ root_passion: rp, sub_species: asString(pe.sub_species) })
    }
    const domains = asArray(e.virtue_domains_engaged)
      .map((d) => asEnum(d, VIRTUE_DOMAINS))
      .filter((d): d is VirtueDomain => d !== null)
    actions.push({
      action: asString(e.action),
      quality,
      is_kathekon: asBool(e.is_kathekon),
      proximity,
      passions_detected: passions,
      virtue_domains_engaged: domains,
      oikeiosis_met: typeof e.oikeiosis_met === 'boolean' ? e.oikeiosis_met : null,
      oikeiosis_stage: typeof e.oikeiosis_stage === 'string' ? e.oikeiosis_stage : null,
    })
  }
  const cal = (obj.calibration ?? {}) as Record<string, unknown>
  const verdicts = typeof cal.verdicts_reviewed === 'number' ? Math.max(0, Math.trunc(cal.verdicts_reviewed)) : 0
  const discrepancies = typeof cal.discrepancies_found === 'number' ? Math.max(0, Math.trunc(cal.discrepancies_found)) : 0
  return {
    actions,
    calibration: { verdicts_reviewed: verdicts, discrepancies_found: Math.min(discrepancies, verdicts) },
  }
}

/**
 * A4 (PR7) Q5 escalation mapper — extracts ONLY the capacity delta + the confirmed
 * reasoning-pattern-change boolean from the LLM output. Defensive: capacity domains
 * are the agent's own free-text capability labels (NOT the four virtue domains), so
 * each is kept iff it is a non-empty string (trimmed) — invalid entries are dropped,
 * never coerced. reasoning_pattern_change defaults to false unless the LLM returns
 * an explicit true. The circle-need carry is built deterministically by the caller.
 * PURE.
 */
function mapQ5Escalation(raw: unknown): { capacity_delta: CapacityDelta; reasoning_pattern_change: boolean } {
  const obj = (raw ?? {}) as Record<string, unknown>
  const cap = (obj.capacity_delta ?? {}) as Record<string, unknown>
  const domains = (key: string): string[] =>
    asArray(cap[key]).map(asString).map((s) => s.trim()).filter((s) => s.length > 0)
  return {
    capacity_delta: {
      domains_added: domains('domains_added'),
      domains_removed: domains('domains_removed'),
      domains_updated: domains('domains_updated'),
    },
    reasoning_pattern_change: asBool(obj.reasoning_pattern_change),
  }
}

// ============================================================================
// SONNET LAYER-1 CALL
// ============================================================================

const SHARED_SYSTEM_PREAMBLE =
  'You are the Layer-1 feature extractor for Sage Reflect, a Stoic post-action ' +
  'reflection product. You receive an agent\'s free-text answer to one reflection ' +
  'question and return ONLY a JSON object of extracted features. You do not judge, ' +
  'score, advise, or add commentary. Extract only what the text supports; if the ' +
  'text reports nothing for a field, return an empty array / false. Use ONLY the ' +
  'controlled vocabularies given. Return strictly valid JSON, no prose.'

const Q1_SYSTEM =
  `${SHARED_SYSTEM_PREAMBLE}\n\n` +
  'TASK (Q1 — phantasia / impression review): extract distorted impressions — those ' +
  'presenting an indifferent as a genuine good or genuine evil.\n' +
  'Return: {"distortions":[{"impression":string,"root_passion":"epithumia"|"hedone"|"phobos"|"lupe","examined":boolean}]}\n' +
  'root_passion: epithumia=future apparent good, hedone=present apparent good, ' +
  'phobos=future apparent evil, lupe=present apparent evil. examined=whether the ' +
  'agent reports having examined the impression before accepting/rejecting it.'

const Q2_SYSTEM =
  `${SHARED_SYSTEM_PREAMBLE}\n\n` +
  'TASK (Q2 — synkatathesis / assent review): extract assent failures (assent given ' +
  'before examination) AND the mandatory pressure-assent report.\n' +
  'Return: {"failures":[{"impression":string,"false_judgement":string,"selective_value_level":string}],' +
  '"pressure_assent":{"admitted":boolean,"account_given":boolean,"moments":[string]}}\n' +
  'pressure_assent.admitted=whether assent under pressure (instruction, time, output ' +
  'demand) is reported; account_given=whether a substantive account accompanies it ' +
  '(not a bare denial); moments=specific named moments.'

const Q3_SYSTEM =
  `${SHARED_SYSTEM_PREAMBLE}\n\n` +
  'TASK (Q3 — horme / impulse review): extract impulse patterns by direction and ' +
  'virtue domain.\n' +
  'Return: {"patterns":[{"direction":"excess"|"deficit"|"misdirection","virtue_domain":"phronesis"|"dikaiosyne"|"andreia"|"sophrosyne","passion":"epithumia"|"hedone"|"phobos"|"lupe"|null}]}\n' +
  'excess=impulse exceeded due measure; deficit=appropriate action available but not ' +
  'taken (andreia gap); misdirection=directed at the wrong recipient.'

const Q4_SYSTEM =
  `${SHARED_SYSTEM_PREAMBLE}\n\n` +
  'TASK (Q4 — kathekon / action review): for each action taken, extract its fitting- ' +
  'action assessment; also extract the Sage Assent calibration sub-answer.\n' +
  'Return: {"actions":[{"action":string,"quality":"strong"|"moderate"|"marginal"|"contrary",' +
  '"is_kathekon":boolean,"proximity":"reflexive"|"habitual"|"deliberate"|"principled"|"sage_like",' +
  '"passions_detected":[{"root_passion":"epithumia"|"hedone"|"phobos"|"lupe","sub_species":string}],' +
  '"virtue_domains_engaged":["phronesis"|"dikaiosyne"|"andreia"|"sophrosyne"],' +
  '"oikeiosis_met":boolean|null,"oikeiosis_stage":string|null}],' +
  '"calibration":{"verdicts_reviewed":number,"discrepancies_found":number}}\n' +
  'calibration.verdicts_reviewed=how many Sage Assent verdicts the agent reviewed; ' +
  'discrepancies_found=how many the agent judged miscalibrated (blocked-should-have- ' +
  'been-taken / taken-should-have-been-blocked). 0 = all verdicts judged correct.'

const Q5_SYSTEM =
  `${SHARED_SYSTEM_PREAMBLE}\n\n` +
  'TASK (Q5 — consolidation / capacity + reasoning-pattern change): the agent reports ' +
  'what this session consolidated. Extract ONLY changes the agent explicitly and ' +
  'confidently reports — do NOT infer a change from a restatement, a hedge, or a ' +
  'description of a different task.\n' +
  'Return: {"capacity_delta":{"domains_added":[string],"domains_removed":[string],"domains_updated":[string]},' +
  '"reasoning_pattern_change":boolean}\n' +
  'domains_* = the agent\'s own capability/capacity labels in free text (e.g. ' +
  '"incident triage", "spec review"); added=newly held, removed=no longer held, ' +
  'updated=meaningfully revised. reasoning_pattern_change=true ONLY when the agent ' +
  'affirms a genuine, confirmed change in HOW they reason (not merely that the task ' +
  'differed, not a tentative "maybe"). When no real change is reported, return empty ' +
  'arrays and false.'

async function callSonnetJSON(system: string, response: string): Promise<{ raw: unknown; usage: ExtractorTokenUsage }> {
  const client = getClient()
  const userMessage =
    `Extract the features from this reflection answer.\n\nAnswer: ${response.trim()}\n\nReturn only the JSON object.`
  const message = await client.messages.create({
    model: MODEL_DEEP,
    max_tokens: 2000,
    temperature: 0.2,
    system: [{ type: 'text', text: system }],
    messages: [{ role: 'user', content: userMessage }],
  })
  const text = message.content[0]?.type === 'text' ? message.content[0].text : ''
  const usage: ExtractorTokenUsage = {
    input_tokens: message.usage.input_tokens,
    output_tokens: message.usage.output_tokens,
  }
  const raw = extractJSON(text)
  return { raw, usage }
}

/**
 * The production extractor. Each Q1–Q4 method makes ONE Sonnet call and maps its
 * output into the engine's typed assessment via the defensive Layer-2 mappers.
 *
 * KG1: each call is awaited; no fire-and-forget. The route awaits the result. A
 * thrown LLM/parse error propagates to the route, which fails closed (503).
 */
export function createSonnetExtractor(): ReflectExtractor {
  return {
    async extractQ1(response) {
      const { raw, usage } = await callSonnetJSON(Q1_SYSTEM, response)
      return { assessment: mapQ1(raw), usage }
    },
    async extractQ2(response) {
      const { raw, usage } = await callSonnetJSON(Q2_SYSTEM, response)
      return { assessment: mapQ2(raw), usage }
    },
    async extractQ3(response) {
      const { raw, usage } = await callSonnetJSON(Q3_SYSTEM, response)
      return { assessment: mapQ3(raw), usage }
    },
    async extractQ4(response) {
      const { raw, usage } = await callSonnetJSON(Q4_SYSTEM, response)
      return { assessment: mapQ4(raw), usage }
    },
    // A4 (PR7): the conditional 5th call. The circle-need carry is deterministic
    // (same as buildQ5Deterministic); the LLM supplies only capacity_delta +
    // reasoning_pattern_change. The caller (reflect-service) invokes this ONLY when
    // isQ5Ambiguous(response) — otherwise the conservative default stands (no call).
    async extractQ5(response, summary) {
      const { raw, usage } = await callSonnetJSON(Q5_SYSTEM, response)
      const esc = mapQ5Escalation(raw)
      const base = buildQ5Deterministic(response, summary)
      return {
        assessment: { ...base, capacity_delta: esc.capacity_delta, reasoning_pattern_change: esc.reasoning_pattern_change },
        usage,
      }
    },
  }
}

// Exported for unit tests (Layer-2 mapping is pure + vocabulary-validated).
export const __testing = { mapQ1, mapQ2, mapQ3, mapQ4, mapQ5Escalation }
