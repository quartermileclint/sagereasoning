/**
 * practice-suggestion.ts — the agent practice-suggestion composer
 * (practice reminders, agent half, Phase A1; 2026-07-28).
 *
 * STATUS: Wired (ships DARK — SUBSTRATE_PRACTICE_SUGGESTION_ENABLED unset in
 * every environment; both attach seams are byte-identical when off). Reaches
 * Verified-live at the Phase A3 founder-walked Critical activation, which also
 * publishes the R18 docs. Nothing here pre-approves that step.
 *
 * GOVERNING DOCUMENTS (verbatim records win over every summary, including this
 * header):
 *   - operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md
 *     — BINDING (D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED).
 *   - operations/reminders-2026-07/2026-07-26-practice-reminders-AGENT-build-plan.md §4.
 *   - The 2026-07-12 S11 enforce-gate verdict (kathekon qualification of the
 *     open-loop hold class) and the 2026-07-19 self-circle ruling — both
 *     binding, both applied below.
 *
 * WHAT THIS IS. The school-model moment for an agent practitioner: when the
 * agent's OWN record shows a qualifying gap, the response it is already reading
 * carries ONE question naming what the record shows. It is the doorbell, not
 * the door.
 *
 * THE FIVE THINGS THE MENTOR FIXED, encoded here:
 *
 *  1. QUESTION FORM, NOT DESTINATION FORM (the most important verdict). "The
 *     agent receives a suggestion mid-task in a system that will act shortly
 *     after… the doorbell rings, and the agent is already standing at the door
 *     with its hand on the handle." A named practice risks the suggestion doing
 *     the reasoning. So every rendered `line` names the gap and ASKS — it never
 *     names a practice as a destination and never supplies the conclusion the
 *     examination would reach. The machine-readable `practice` / `endpoint_hint`
 *     still carry the target for a caller that wants it; the LINE prompts the
 *     agent's own examination. Every line ends with SUGGESTION_QUESTION verbatim
 *     (battery-pinned).
 *  2. PRECEDENCE: B2 (obligations) BEFORE B1 (unclosed loop). "Dikaiosyne —
 *     giving each their due — is not subordinate to procedural completeness."
 *     CANDIDATE ORDER below is the precedence; the FIRST match wins.
 *  3. B1 NARROWED to a loop genuinely not closed — see BD-1a/BD-1b.
 *  4. B5 needs a decline sustained across 2–3 consecutive sessions, never a
 *     single-session dip — see BD-2 (B5 is SILENT in v1).
 *  5. B7'S SILENCE IS PROTECTED: no default suggestion for completeness, ever.
 *     No basis ⇒ NO `suggestion` field at all (absent, not null).
 *
 * ONE SUGGESTION MAX. "The teacher names the next practice, not a range of
 * options. A menu converts the suggestion into a choice exercise."
 *
 * THE BUILD DECISIONS (BDs) taken in-session, each inside the verdicts' bounds:
 *
 *  BD-1a — THE FOLD'S OPEN LOOPS STAY SILENT. Mentor note 3 narrows B1 to a loop
 *     "genuinely not closed", CONDITIONAL on "if the classification can
 *     distinguish them". It cannot, on the fold: LOOP_FOLD_CHAIN_SCOPE_NOTE
 *     states the fold covers the SUBMITTED chain only (no server store persists
 *     the CI-4 markers), so `character.loops.open > 0` means "nothing in THIS
 *     chain closed it" — indistinguishable from a loop the agent closed in a
 *     consult it did not submit. Firing there would assert a reasoning gap the
 *     record cannot evidence. NAMED FOLLOW-UP: persisting the markers
 *     (row-widening, its own founder-walked schema step, already named as an
 *     A8-review input) would make the class distinguishable and re-open this.
 *     THE CLOSURE PRINCIPLE IS SETTLED IN ADVANCE (2026-07-28 record, Item 8):
 *     formal closure requires explicit re-examination of the SAME decision
 *     that was redirected — adjacent competence in the class is never closure
 *     ("the bar is the specific decision, not the class") — so when the
 *     markers are persisted, the distinction to encode is same-decision
 *     re-encounter, not same-class quality.
 *  BD-1b — B1 IS KATHEKON-GATED. `examination_open` alone is the measured
 *     FALSE-POSITIVE hold class: the frozen 130-record observation buffer
 *     classified 129 false_positive / 0 correct_hold under the narrowed
 *     predicate (the STRICT reading; the legacy bracket reads 128/1). The
 *     loop-fold refuses to treat that class as character data — under its v2
 *     THREE-WAY split a non-engaged redirection lands in `self_regarding` when
 *     it is self-regarding-prudential and in `instrument_calibration` otherwise;
 *     either way its closure signal never reaches `character.loops`. (Corrected
 *     by the PR19 review: the earlier wording here named only
 *     `instrument_calibration`, which was the pre-v2 routing.) A suggestion
 *     built on it would be character advice built on instrument noise, and
 *     would earn precisely the reaction the mentor warns of for B5 ("the agent
 *     will learn to treat it as noise"). The 2026-07-12 verdict already ruled
 *     this class must be kathekon-qualified before it binds anything. So B1
 *     fires only when the CANONICAL SHARED PREDICATE reads the current
 *     assessment as kathekon-ENGAGED (imported, never re-implemented — PR15).
 *  BD-2 — B5 IS SILENT IN V1. A row is one CONSULT, not one session —
 *     EvaluatedAction carries no session identifier (verified field-by-field) —
 *     so a "sustained decline across 2–3 consecutive sessions" is not derivable
 *     from what the delta serves. `dimension_trends` is gated by
 *     `meetsFloorSegment` (trajectory-delta.ts — `input_count - empty_count >=
 *     EVIDENCE_FLOOR`, i.e. ≥3 non-empty across the WHOLE segment, NOT ≥3 per
 *     half; the per-half gate `meetsFloorBothHalves` serves the sub-species,
 *     kathekon-quality, obligation and domain signals instead), and the trend
 *     itself is computed inside `computeWindowSnapshot`'s own half-split, not by
 *     the delta's `rows.slice` (which produces the BASIS only). Consequence:
 *     `judgement_quality` and `disposition_stability` feed on `() => true`, so
 *     THREE consults minutes apart — unambiguously one session — already yield a
 *     served `declining`. (All three corrections from the PR19 review; the
 *     original header cited a per-half floor and a six-consult minimum, which
 *     UNDERSTATED the exposure. The conclusion is unchanged and better
 *     supported.) NAMED FOLLOW-UP (evidence gap, out of scope here): a
 *     per-session-granularity sustained-decline signal is a delta change.
 *     `deepen_examination` stays in the locked vocabulary — the vetted table's
 *     row is deferred, not dropped — and the battery pins that no path emits it.
 *  BD-3 — THE SUGGESTION RIDES ONLY AN EMITTED `practice` BLOCK. It is a member
 *     of the CI-13 carrier, so SUBSTRATE_PRACTICE_CYCLE_HINT_ENABLED stays the
 *     carrier's master switch (it is live in production). Flag-on-without-carrier
 *     ⇒ no suggestion.
 *  BD-4 — B2's OBLIGATION LEG REQUIRES A CIRCLE BEYOND SELF. The 2026-07-19
 *     ruling is binding: "dikaiosyne is other-directed — the self_preservation
 *     circle standing alone… is NOT a justice surface", and the mentor's own B2
 *     reasoning is about "an obligation to ANOTHER PARTY unaddressed". A
 *     violated obligation carried only by the self circle would make the
 *     rendered line ("an obligation to an affected party") literally false of
 *     the record. It still engages kathekon via Arm 2, so it can reach B1 —
 *     which is the correct routing for a self-regarding gap.
 *  BD-5 — "WEAKEST DOMAIN" MEANS ACTUALLY WEAK. A dikaiosyne reading above
 *     `deliberate` (the live assent threshold) is a record showing principled or
 *     sage-like justice; being merely the lowest of several strong domains
 *     warrants no question. Both weak-domain legs therefore require the
 *     dikaiosyne reading to sit at or below `deliberate`. Conservative — the
 *     silence direction the mentor protects.
 *
 * THE SECOND CONSULTATION (2026-07-28) — verbatim record
 * operations/reminders-2026-07/2026-07-28-mentor-verdicts-agent-suggestions-verbatim.md,
 * binding alongside Step M and, where it speaks, the later and more specific
 * ruling. It CONFIRMED BD-1b in the letter ("the kathekon qualification [is]
 * not a refinement but a structural necessity"), CONFIRMED the machine-readable
 * `practice`/`endpoint_hint` fields staying alongside the question line ("the
 * doorbell boundary is maintained by the question form of the rendered line,
 * not by withholding the lookup result"), reviewed all eleven record clauses
 * (7–10 revised to plain-language sub-species naming), resolved BD-6's named
 * follow-up (the mapping in the constants block below), and settled the Item 8
 * closure principle noted under BD-1a. Three further build decisions came out
 * of the fold: BD-7 (the acute-fear question-form fork — at
 * SUGGESTION_QUESTION_PROHAIRESIS), BD-8 (the philodoxia/general craving
 * split — at b4EpithumiaPersisting), BD-9 (the oknos mechanical tails + the
 * passion-tier micro-ordering — at the oknos lines and CANDIDATE_ORDER).
 *
 * PURE COMPOSER. `composePracticeSuggestion` reads NO env, makes NO DB read and
 * NO LLM call: it is a function of blocks the response has ALREADY computed at
 * the attach point. The flag is read at the seam helper below
 * (`practiceSuggestionFor`) — the practice-cycle-hint.ts pattern.
 *
 * MEASURE-ONLY, restated on the block itself (PRACTICE_SUGGESTION_FRAMING_NOTE)
 * and structurally: advisory by the channel law; binds nothing; not an S4 input;
 * never a trust-event source. This module NEVER imports the intervention engine
 * (battery-pinned, mirroring the loop-fold's own guard) — it reads records, not
 * recommendations.
 */

import type { KatorthomaProximity, Layer2Assessment } from '@/lib/translation-sandwich/layer2-mechanisms'
import type {
  EpithumiaSubSpecies,
  LupeSubSpecies,
  PhobosSubSpecies,
  RootPassion,
} from '@/lib/translation-sandwich/layer1-extractor'
import type { TrajectoryDeltaBlock } from './trajectory-delta'
import type { LoopFoldBlock } from './trust-core/loop-fold'
import { PROXIMITY_RANK } from './trust-core/constants'
import {
  assessKathekonEngagement,
  kathekonSignalsFromAssessment,
  SELF_PRESERVATION_CIRCLE,
} from './trust-core/kathekon-engagement'

// ============================================================================
// FLAG
// ============================================================================

export const PRACTICE_SUGGESTION_ENV_VAR = 'SUBSTRATE_PRACTICE_SUGGESTION_ENABLED'

/** True only when the flag is the exact string 'true'. Unset/other ⇒ no
 *  `suggestion` member is added anywhere (byte-identical to pre-A1). */
export function isPracticeSuggestionEnabled(): boolean {
  return process.env[PRACTICE_SUGGESTION_ENV_VAR] === 'true'
}

// ============================================================================
// LOCKED VOCABULARY
// ============================================================================

/**
 * The locked agent examination-practice vocabulary (the vetted §4 table).
 * `deepen_examination` is RESERVED: the B5 row is deferred per BD-2 and no code
 * path emits it in v1 (battery-pinned). It is kept so the served vocabulary
 * matches the vetted table and the deferral is visible rather than silent.
 */
export type PracticeSuggestionPractice =
  | 'examine_obligations'
  | 'reexamine_same_depth'
  | 'premeditatio_examination'
  | 'reserve_clause_examination'
  | 'deepen_examination'
  /** 2026-07-28 verdicts, Item 1: the acute-fear route — orient the agent
   *  toward the control-filter reading it ALREADY HOLDS (the assessment
   *  computes prohairesis on every consult), "rather than toward a separate
   *  practice". Deliberately NOT `calling_purpose` — "purpose-declaration
   *  addresses the absence of declared purpose, not the presence of acute
   *  fear." No endpoint: nothing to call; the reading is in hand. */
  | 'control_filter_examination'
  | 'calling_purpose'

/** The locked basis vocabulary — one code per firing signal. */
export type PracticeSuggestionBasisCode =
  // B2 — obligations (FIRST in precedence, per the Step M reversal)
  | 'obligation_violated'
  | 'obligation_indeterminate'
  | 'first_circle_obligation_declining'
  | 'dikaiosyne_weakest_domain'
  | 'dikaiosyne_weakest_domain_chain'
  // B1 — the genuinely-open, kathekon-engaged correction loop
  | 'examination_open_kathekon_engaged'
  // B3 — the ANTICIPATORY fear sub-species (BD-6), now named PER SUB-SPECIES
  // per the 2026-07-28 Item 5 ruling ("name the sub-species… in plain
  // language"; family-level naming "is softening the reflection").
  | 'agonia_recurring'
  | 'agonia_new'
  | 'agonia_persisting'
  | 'oknos_recurring'
  | 'oknos_new'
  | 'oknos_persisting'
  // 2026-07-28 Item 1 — the formerly-silent phobos routes: acute fear
  // (deima/thorybos) → the control-filter question; aischyne → re-examination
  // with the mirror-principle clause. thambos stays SILENT (confirmed —
  // "silence is preferable to a weak suggestion").
  | 'acute_fear_pattern'
  | 'aischyne_pattern'
  // B4 — craving-class, split per Item 5: philodoxia gets its vetted specific
  // line; every other epithumia sub-species the vetted general-contingency
  // line (see BD-8).
  | 'philodoxia_persisting'
  | 'epithumia_persisting'
  // 2026-07-28 Item 2 — the lupe comparison pair (phthonos/zelotypia), an
  // oikeiosis failure routed to the obligations examination. penthos/achos/
  // eleos and the whole hedone family stay SILENT (confirmed).
  | 'comparison_persisting'
  // B6 — the minimal calling analog
  | 'self_only_circles'

/** The question clause every rendered line ends with, verbatim from the Step M
 *  verdict's proposed shape. Battery-pinned on every line (one exception below). */
export const SUGGESTION_QUESTION =
  'Before proceeding: is this the reasoning this action warrants?'

/**
 * The SECOND vetted question form — 2026-07-28 Item 5, mentor-verbatim, used by
 * `acute_fear_pattern` ONLY (battery-pinned both directions): "for acute fear
 * the more useful examination is not whether the reasoning was warranted but
 * what the agent actually controls."
 *
 * BD-7 — THE MENTOR'S FORK, DECIDED BY THE TRUTHFULNESS DISCIPLINE. The mentor
 * offered two defensible forms and left the choice to the build team
 * ("consistency of question form" vs "precision of prompt"). The
 * standard-question alternative's record clause asserts the record "has not
 * examined [the situation] for what is within your prohairesis" — but the
 * extraction computes the control filter on EVERY consult, so that clause can
 * be false of the very record that fired the pattern. Every rendered line must
 * be literally true of the record (the A1 discipline), which decides the fork:
 * the departing-question form, whose clause claims only what the window showed.
 * The alternative is preserved in the verbatim record if a later consultation
 * re-weighs the criterion.
 */
export const SUGGESTION_QUESTION_PROHAIRESIS =
  'Before proceeding: what within this situation is actually within your prohairesis?'

/**
 * The rendered lines — a FIXED pre-authored set, never composed from record
 * data. Each names what the record showed and then asks; none names a practice
 * as a destination; none supplies a conclusion. Exported so the battery pins the
 * VALUES (a source-substring check is satisfiable by a comment — the standing
 * lesson).
 */
export const SUGGESTION_LINES: Record<PracticeSuggestionBasisCode, string> = {
  obligation_violated:
    'This record shows an obligation to an affected party assessed as violated. ' +
    SUGGESTION_QUESTION,
  obligation_indeterminate:
    'This record shows an obligation to an affected party left indeterminate. ' +
    SUGGESTION_QUESTION,
  first_circle_obligation_declining:
    'This record shows the rate at which first-circle obligations were met ' +
    'declining across this window. ' +
    SUGGESTION_QUESTION,
  dikaiosyne_weakest_domain:
    'This record shows dikaiosyne as the weakest engaged domain in this ' +
    'examination. ' +
    SUGGESTION_QUESTION,
  dikaiosyne_weakest_domain_chain:
    'This record shows dikaiosyne as the weakest evidenced domain across the ' +
    'submitted chain. ' +
    SUGGESTION_QUESTION,
  examination_open_kathekon_engaged:
    'This record shows an examination that engaged a kathekon factor and ' +
    'issued a redirection that is not yet closed. ' +
    SUGGESTION_QUESTION,
  // The agonia trio — 2026-07-28 Item 5 revised forms, mentor-verbatim
  // ("a fear of a future outcome" = agonia named in plain language).
  agonia_recurring:
    'This record shows a fear of a future outcome recurring across this window. ' +
    SUGGESTION_QUESTION,
  agonia_new:
    'This record shows a fear of a future outcome appearing in this window ' +
    'that the earlier half did not show. ' +
    SUGGESTION_QUESTION,
  agonia_persisting:
    'This record shows a fear of a future outcome persisting across this window. ' +
    SUGGESTION_QUESTION,
  // The oknos trio — the mentor's parallel form ("a pattern of shrinking from
  // action" = oknos in plain language), given verbatim for the recurring
  // variant; the new/persisting variants compose that vetted clause with the
  // already-vetted line-8/line-9 tails (BD-9 — mechanical composition of
  // vetted parts, no new content authored).
  oknos_recurring:
    'This record shows a pattern of shrinking from action recurring across ' +
    'this window. ' +
    SUGGESTION_QUESTION,
  oknos_new:
    'This record shows a pattern of shrinking from action appearing in this ' +
    'window that the earlier half did not show. ' +
    SUGGESTION_QUESTION,
  oknos_persisting:
    'This record shows a pattern of shrinking from action persisting across ' +
    'this window. ' +
    SUGGESTION_QUESTION,
  // Acute fear — 2026-07-28 Item 1/Item 5, mentor-verbatim, the ONE line on
  // the second vetted question (BD-7).
  acute_fear_pattern:
    'This record shows acute fear-class reasoning. ' + SUGGESTION_QUESTION_PROHAIRESIS,
  // Aischyne — 2026-07-28 Item 1/Item 5, mentor-verbatim ("the record clause
  // must name the assent specifically, not just the passion family").
  aischyne_pattern:
    'This record shows reasoning shaped by anticipated judgement of its ' +
    "output rather than by the action's rightness. " +
    SUGGESTION_QUESTION,
  // The craving split — 2026-07-28 Item 5, both mentor-verbatim (BD-8).
  philodoxia_persisting:
    'This record shows a persisting orientation toward reputation or ' +
    'recognition across this window. ' +
    SUGGESTION_QUESTION,
  epithumia_persisting:
    'This record shows reasoning in which equanimity has become contingent on ' +
    'a specific outcome across this window. ' +
    SUGGESTION_QUESTION,
  // The lupe comparison pair — 2026-07-28 Item 2, mentor-verbatim ("closer to
  // the mirror than 'this record shows an envy-class pattern'").
  comparison_persisting:
    "This record shows reasoning that treated another party's standing as a " +
    'condition of its own. ' +
    SUGGESTION_QUESTION,
  self_only_circles:
    'This record shows reasoning that identified no circle of concern beyond ' +
    'self-preservation. ' +
    SUGGESTION_QUESTION,
}

/** The practice each basis points at (machine-readable target; the LINE never
 *  names it — the question form is the whole point). */
const BASIS_PRACTICE: Record<PracticeSuggestionBasisCode, PracticeSuggestionPractice> = {
  obligation_violated: 'examine_obligations',
  obligation_indeterminate: 'examine_obligations',
  first_circle_obligation_declining: 'examine_obligations',
  dikaiosyne_weakest_domain: 'examine_obligations',
  dikaiosyne_weakest_domain_chain: 'examine_obligations',
  examination_open_kathekon_engaged: 'reexamine_same_depth',
  agonia_recurring: 'premeditatio_examination',
  agonia_new: 'premeditatio_examination',
  agonia_persisting: 'premeditatio_examination',
  oknos_recurring: 'premeditatio_examination',
  oknos_new: 'premeditatio_examination',
  oknos_persisting: 'premeditatio_examination',
  acute_fear_pattern: 'control_filter_examination',
  aischyne_pattern: 'reexamine_same_depth',
  philodoxia_persisting: 'reserve_clause_examination',
  epithumia_persisting: 'reserve_clause_examination',
  comparison_persisting: 'examine_obligations',
  self_only_circles: 'calling_purpose',
}

/**
 * Endpoint hints — present ONLY where the named target is an actual endpoint the
 * agent can call without exiting the task (the CI-4 re-examination affordance;
 * the calling gate). The mid-task examinations (obligations, premeditatio,
 * reserve clause) deliberately carry NONE: "an agent mid-task cannot pause for a
 * full premeditatio exercise… the question form prompts that examination without
 * requiring the agent to exit the task."
 */
const BASIS_ENDPOINT: Partial<Record<PracticeSuggestionBasisCode, string>> = {
  examination_open_kathekon_engaged: '/api/reason',
  // 2026-07-28 Item 1: aischyne routes to the re-examination affordance —
  // "it asks the agent to return to the decision at the depth it was first
  // examined" — which IS callable (the CI-4 prior_feedback path).
  aischyne_pattern: '/api/reason',
  self_only_circles: '/api/calling',
}

/** The framing restated ON the block (the VOCABULARY_NOTE precedent). */
export const PRACTICE_SUGGESTION_FRAMING_NOTE =
  'Advisory only (the channel law): this is a question raised from the ' +
  'agent’s own record, not an instruction. It binds nothing, is not an input ' +
  'to any recommendation or gate, and is never a trust-event source. It ' +
  'describes what the record showed (past tense) and predicts nothing. ' +
  'One suggestion at most; no suggestion is offered when no basis clears its ' +
  'evidence floor — the silence is honest, never filler. Weights-tier use ' +
  'remains blocked.'

// ============================================================================
// BLOCK SHAPE
// ============================================================================

export interface PracticeSuggestionBasis {
  /** The locked basis code that fired. */
  code: PracticeSuggestionBasisCode
  /** The exact served field the basis was read from (auditable). */
  signal: string
  /** The served value observed there (record data, never prose). */
  observed: string
}

export interface PracticeSuggestion {
  schema: 'agent-practice-suggestion/v1'
  /** The machine-readable examination target. */
  practice: PracticeSuggestionPractice
  basis: PracticeSuggestionBasis
  /** The rendered question — always one of SUGGESTION_LINES, verbatim. */
  line: string
  /** Present only where the target is callable mid-task (see BASIS_ENDPOINT). */
  endpoint_hint?: string
  framing_note: string
}

/**
 * The snapshot the composer reads — blocks ALREADY computed for this response at
 * the attach point. Every field optional: a surface supplies what it has (the
 * consult has an assessment + delta; the accreditation write has a fold).
 */
export interface PracticeSuggestionSnapshot {
  /** The consult's assessment — bare or signed (unwrapped internally). */
  assessment?: unknown
  /** The consult's top-level `examination_open` (CI-4; present flag-on). */
  examinationOpen?: boolean
  /** meta.trajectory.delta (AE-1) when served. */
  delta?: TrajectoryDeltaBlock
  /** The accreditation write's loop_fold (AE-2) when served. */
  loopFold?: LoopFoldBlock
}

// ============================================================================
// PURE READERS
// ============================================================================

/**
 * Unwrap the response `assessment` field, which is a bare Layer2Assessment when
 * Layer-2 signing is off and a SignedLayer2Assessment ({assessment, signature,
 * key_id}) when it is on — signing is LIVE, so the wrapped shape is the normal
 * case. Returns undefined for anything unrecognisable (fail-silent: an
 * unreadable assessment yields no suggestion, never a guessed one).
 */
export function unwrapAssessment(field: unknown): Layer2Assessment | undefined {
  if (field === null || typeof field !== 'object') return undefined
  const outer = field as { assessment?: unknown; signature?: unknown }
  const inner =
    outer.signature !== undefined && outer.assessment !== null && typeof outer.assessment === 'object'
      ? outer.assessment
      : field
  const candidate = inner as Partial<Layer2Assessment>
  return typeof candidate.katorthoma_proximity === 'string' ? (inner as Layer2Assessment) : undefined
}

/** BD-5's floor: a reading at or below the live assent threshold. */
const WEAK_DOMAIN_CEILING: KatorthomaProximity = 'deliberate'

function atOrBelowCeiling(level: KatorthomaProximity): boolean {
  return PROXIMITY_RANK[level] <= PROXIMITY_RANK[WEAK_DOMAIN_CEILING]
}

/** The root-passion families the vetted table names, typed against the CANONICAL
 *  extraction vocabulary so a rename is a compile error, never silent drift
 *  (the SELF_PRESERVATION_CIRCLE pattern). */
const PHOBOS: RootPassion = 'phobos'
const EPITHUMIA: RootPassion = 'epithumia'
const LUPE: RootPassion = 'lupe'

/**
 * BD-6 — B3 IS SUB-SPECIES-DIFFERENTIATED, NOT FAMILY-WIDE.
 *
 * The binding record rules on this in terms: "do not generalise to the whole
 * phobos family. Keep the agonia → premeditatio link as the anchor. Add oknos →
 * premeditatio as a sound extension." Its reasoning is about the PASSION↔PRACTICE
 * fit, not the practitioner — "premeditatio … requires some distance from the
 * impression" (deima/thorybos are acute and present-tense); "for thambos, silence
 * is preferable to a weak suggestion"; "premeditatio is not the natural next
 * practice for shame" (aischyne is evaluative, not anticipatory). The agent
 * section licenses only the FORM to differ: "the signal mapping — what fires
 * what — can be shared. The form of the suggestion should differ by practitioner
 * type." The agent target here is literally premeditatio, the same practice the
 * record declines for those four.
 *
 * The extraction DOES classify to sub-species (PhobosSubSpecies; the delta's keys
 * are `${root}/${sub}`), so the record's first branch applies: apply the
 * differentiated mapping. This matches the human half of the same programme,
 * which already ships it (practice-sequence.ts PASSION_SUGGESTION_TABLE).
 *
 * THE FOLLOW-UP WAS ANSWERED (2026-07-28 consultation — the second verbatim
 * record, which now governs this mapping). The formerly-silent four resolve:
 * deima/thorybos → the control-filter question line (`control_filter_examination`
 * — NOT calling_purpose: "purpose-declaration addresses the absence of declared
 * purpose, not the presence of acute fear"); aischyne → `reexamine_same_depth`
 * with the mirror-principle clause ("the equivalent assent is the one that
 * converted anticipated judgement of its output into the operative motive");
 * thambos → SILENCE, confirmed unchanged. The same record adds the lupe
 * comparison pair (phthonos/zelotypia → examine_obligations — "both failures of
 * oikeiosis"), confirms penthos/achos/eleos and the whole hedone family SILENT,
 * and directs per-sub-species plain-language naming of every rendered clause
 * ("a clause that names the family when the sub-species is known is softening
 * the reflection").
 *
 * Originally caught by the PR19 independent review; the §4 mapping table in the
 * build plan carries the correction; BOTH verbatim records win over both.
 */
const AGONIA: PhobosSubSpecies = 'agonia'
const OKNOS: PhobosSubSpecies = 'oknos'
/** Acute, present-tense fear — routed to the control-filter question (Item 1). */
const ACUTE_PHOBOS: readonly PhobosSubSpecies[] = ['deima', 'thorybos']
const AISCHYNE: PhobosSubSpecies = 'aischyne'
// thambos: NO detector — mentor-confirmed silence, twice.
/** The comparison-borne lupe pair (Item 2) — the other three lupe sub-species
 *  (penthos/achos/eleos) have NO detector: mentor-confirmed silence. */
const COMPARISON_LUPE: readonly LupeSubSpecies[] = ['phthonos', 'zelotypia']
const PHILODOXIA: EpithumiaSubSpecies = 'philodoxia'

/** The sub-species half of a root-qualified delta key ('phobos/agonia' → 'agonia'). */
function subSpeciesOfKey(key: string): string {
  const i = key.indexOf('/')
  return i === -1 ? '' : key.slice(i + 1)
}

/** The delta's sub-species keys are already root-qualified compounds
 *  (`${root_passion}/${sub_species}`) — the family reads straight off the key
 *  prefix; no parallel sub-species→root map is authored or needed. */
function rootOfKey(key: string): string {
  const i = key.indexOf('/')
  return i === -1 ? key : key.slice(0, i)
}

// ============================================================================
// CANDIDATE DETECTORS — the precedence order IS the array order (B2 → B1 → B3
// → B4 → [B5 silent, BD-2] → B6). The FIRST match wins; one suggestion max.
// ============================================================================

type Candidate = (s: PracticeSuggestionSnapshot) => PracticeSuggestionBasis | undefined

/** B2, leg 1+2 — a beyond-self circle carrying a violated/indeterminate
 *  obligation on THIS examination (BD-4: the self circle alone cannot make the
 *  rendered line true). */
const b2CurrentObligation: Candidate = (s) => {
  const a = unwrapAssessment(s.assessment)
  const circles = a?.oikeiosis?.relevant_circles
  if (!Array.isArray(circles)) return undefined
  const beyondSelf = circles.filter(
    (c) => typeof c?.circle === 'string' && c.circle !== SELF_PRESERVATION_CIRCLE,
  )
  // Violated outranks indeterminate — the stronger adverse evidence first.
  for (const status of ['violated', 'indeterminate'] as const) {
    if (beyondSelf.some((c) => c?.obligation_assessment?.status === status)) {
      return {
        code: status === 'violated' ? 'obligation_violated' : 'obligation_indeterminate',
        signal: 'assessment.oikeiosis.relevant_circles[].obligation_assessment.status',
        observed: status,
      }
    }
  }
  return undefined
}

/** B2, leg 3 — the window's first-circle obligation met-rate trend. Floored:
 *  `insufficient_extraction` is never a basis. */
const b2ObligationTrend: Candidate = (s) =>
  s.delta?.first_circle_obligation_trend === 'declining'
    ? {
        code: 'first_circle_obligation_declining',
        signal: 'meta.trajectory.delta.first_circle_obligation_trend',
        observed: 'declining',
      }
    : undefined

/** B2, leg 4a — dikaiosyne floored THIS examination's proximity to (jointly) the
 *  weakest engaged domain, and the reading is actually weak (BD-5).
 *  proximity_floors is present only when the ADR-010 §4 flag is on (LIVE); the
 *  aggregate being the minimum makes "dikaiosyne === aggregate" exactly
 *  "dikaiosyne is jointly weakest". */
const b2WeakDomainCurrent: Candidate = (s) => {
  const floors = unwrapAssessment(s.assessment)?.proximity_floors
  const dik = floors?.dikaiosyne
  if (floors === undefined || dik === null || dik === undefined) return undefined
  const flooredBelowBase = PROXIMITY_RANK[floors.aggregate] < PROXIMITY_RANK[floors.base]
  const dikIsWeakest = PROXIMITY_RANK[dik] === PROXIMITY_RANK[floors.aggregate]
  return flooredBelowBase && dikIsWeakest && atOrBelowCeiling(dik)
    ? {
        code: 'dikaiosyne_weakest_domain',
        signal: 'assessment.proximity_floors.dikaiosyne',
        observed: dik,
      }
    : undefined
}

/** B2, leg 4b — dikaiosyne is STRICTLY the weakest evidenced domain across the
 *  submitted chain, and actually weak (BD-5). Strictness implies ≥2 evidenced
 *  domains, so a dikaiosyne-only chain never fires. `insufficient_extraction`
 *  domains are skipped, never read as a level. */
const b2WeakDomainChain: Candidate = (s) => {
  const domains = s.loopFold?.character?.domains
  if (domains === undefined || domains === null || typeof domains !== 'object') return undefined
  const dik = domains['dikaiosyne']
  if (dik === undefined || dik === 'insufficient_extraction') return undefined
  if (!atOrBelowCeiling(dik.level)) return undefined
  let others = 0
  for (const [name, fold] of Object.entries(domains)) {
    if (name === 'dikaiosyne' || fold === 'insufficient_extraction') continue
    others++
    if (PROXIMITY_RANK[fold.level] <= PROXIMITY_RANK[dik.level]) return undefined
  }
  return others >= 1
    ? {
        code: 'dikaiosyne_weakest_domain_chain',
        signal: 'loop_fold.character.domains.dikaiosyne.level',
        observed: dik.level,
      }
    : undefined
}

/** B1 — a redirection issued by a KATHEKON-ENGAGED examination and not yet
 *  closed (BD-1b gates on the canonical shared predicate; BD-1a keeps the fold's
 *  open loops silent, so there is deliberately no fold leg here). */
const b1OpenExamination: Candidate = (s) => {
  if (s.examinationOpen !== true) return undefined
  const a = unwrapAssessment(s.assessment)
  if (a === undefined) return undefined
  const engagement = assessKathekonEngagement(kathekonSignalsFromAssessment(a))
  return engagement.engaged
    ? {
        code: 'examination_open_kathekon_engaged',
        signal: 'examination_open + assessKathekonEngagement(assessment).engaged',
        observed: engagement.firedArms.join(','),
      }
    : undefined
}

/** B3, leg 1 — a fear-class sub-species recurring or newly present across the
 *  window's compared halves. Floored: the whole record can read
 *  `insufficient_extraction`. */
/** A recurring/new hit in the frequency deltas for the given root + sub-species
 *  set. Floored: `insufficient_extraction` (and any malformed shape) is never a
 *  basis. Deterministic: keys sorted, first hit wins. */
function frequencyHit(
  s: PracticeSuggestionSnapshot,
  root: RootPassion,
  subs: readonly string[],
): { key: string; value: 'recurring' | 'new' } | undefined {
  const deltas = s.delta?.sub_species_frequency_deltas
  if (deltas === undefined || deltas === 'insufficient_extraction') return undefined
  if (typeof deltas !== 'object' || deltas === null) return undefined
  const keys = Object.keys(deltas)
    .filter((k) => rootOfKey(k) === root && subs.includes(subSpeciesOfKey(k)))
    .filter((k) => deltas[k] === 'recurring' || deltas[k] === 'new')
    .sort()
  if (keys.length === 0) return undefined
  return { key: keys[0], value: deltas[keys[0]] as 'recurring' | 'new' }
}

const FREQ_SIGNAL = 'meta.trajectory.delta.sub_species_frequency_deltas'

/** B3, leg 1 — the anticipatory sub-species in the frequency deltas, named PER
 *  SUB-SPECIES (Item 5: the mirror requires accuracy — 'new' is not
 *  'recurring', agonia is not oknos; each (sub × variant) has its own line). */
const b3AnticipatoryFrequency: Candidate = (s) => {
  const rows: readonly [PhobosSubSpecies, PracticeSuggestionBasisCode, PracticeSuggestionBasisCode][] = [
    [AGONIA, 'agonia_recurring', 'agonia_new'],
    [OKNOS, 'oknos_recurring', 'oknos_new'],
  ]
  for (const [sub, recurringCode, newCode] of rows) {
    const hit = frequencyHit(s, PHOBOS, [sub])
    if (hit !== undefined) {
      return {
        code: hit.value === 'new' ? newCode : recurringCode,
        signal: FREQ_SIGNAL,
        observed: `${hit.key}=${hit.value}`,
      }
    }
  }
  return undefined
}

/** B3, leg 2 — the anticipatory sub-species among the window's persisting
 *  passions, per sub-species. */
const b3AnticipatoryPersisting: Candidate = (s) =>
  persistingOfFamily(s, PHOBOS, 'agonia_persisting', (x) => x === AGONIA) ??
  persistingOfFamily(s, PHOBOS, 'oknos_persisting', (x) => x === OKNOS)

/** Acute fear (deima/thorybos) — Item 1: the control-filter question, one code
 *  for both legs (the mentor's clause carries no window/variant framing, so it
 *  is true under recurrence, first appearance, or persistence; the observed
 *  field carries the exact detail). */
const acuteFearPattern: Candidate = (s) => {
  const hit = frequencyHit(s, PHOBOS, ACUTE_PHOBOS)
  if (hit !== undefined) {
    return { code: 'acute_fear_pattern', signal: FREQ_SIGNAL, observed: `${hit.key}=${hit.value}` }
  }
  return persistingOfFamily(s, PHOBOS, 'acute_fear_pattern', (x) =>
    (ACUTE_PHOBOS as readonly string[]).includes(x),
  )
}

/** Aischyne — Item 1: the mirror-principle clause + the re-examination
 *  affordance; one code for both legs (same no-variant-framing reasoning). */
const aischynePattern: Candidate = (s) => {
  const hit = frequencyHit(s, PHOBOS, [AISCHYNE])
  if (hit !== undefined) {
    return { code: 'aischyne_pattern', signal: FREQ_SIGNAL, observed: `${hit.key}=${hit.value}` }
  }
  return persistingOfFamily(s, PHOBOS, 'aischyne_pattern', (x) => x === AISCHYNE)
}

/** B4, split per Item 5 (BD-8): philodoxia carries its vetted specific line… */
const b4PhilodoxiaPersisting: Candidate = (s) =>
  persistingOfFamily(s, EPITHUMIA, 'philodoxia_persisting', (x) => x === PHILODOXIA)

/** …and every OTHER epithumia sub-species the vetted general-contingency line —
 *  which is true of any craving ("craving is precisely where equanimity becomes
 *  contingent on an outcome", the confirmed B4 framing). Plain-language names
 *  for orge/eros/pothos/philedonia/philoplousia await vetted copy — a KNOWN
 *  LIMITATION per Item 5's own note, recorded in the build record. The vetted
 *  row remains PERSISTING only; the frequency-delta leg is deliberately not
 *  extended. */
const b4EpithumiaPersisting: Candidate = (s) =>
  persistingOfFamily(s, EPITHUMIA, 'epithumia_persisting', (x) => x !== PHILODOXIA)

/** The lupe comparison pair — Item 2: "a persisting phthonos or zelotypia
 *  pattern … should fire an obligations-examination suggestion." PERSISTING
 *  leg only (the ruling's own word); the frequency-delta leg is not extended
 *  without vetting. penthos/achos/eleos: no detector — confirmed silence. */
const comparisonPersisting: Candidate = (s) =>
  persistingOfFamily(s, LUPE, 'comparison_persisting', (x) =>
    (COMPARISON_LUPE as readonly string[]).includes(x),
  )

function persistingOfFamily(
  s: PracticeSuggestionSnapshot,
  family: RootPassion,
  code: PracticeSuggestionBasisCode,
  subSpeciesFilter?: (subSpecies: string) => boolean,
): PracticeSuggestionBasis | undefined {
  const persisted = s.delta?.passions_persisted_in_window
  if (persisted === undefined || persisted === 'insufficient_extraction') return undefined
  if (!Array.isArray(persisted)) return undefined
  const hit = persisted.find(
    (p) =>
      p?.root_passion === family &&
      (subSpeciesFilter === undefined || subSpeciesFilter(String(p?.sub_species ?? ''))),
  )
  return hit !== undefined
    ? {
        code,
        signal: 'meta.trajectory.delta.passions_persisted_in_window[].root_passion',
        observed: `${hit.root_passion}/${hit.sub_species}`,
      }
    : undefined
}

/**
 * B6 — the minimal calling analog: THIS examination identified circles, and
 * every one of them is self_preservation. Positive evidence only — a circle-less
 * examination (nothing identified) is NOT this class and stays silent, and an
 * unknown-identity entry never satisfies "all self" (strict, mirroring the
 * narrowed Arm 1's own treatment).
 *
 * Mentor note 5: the H1 calling gate at SessionStart is the STRONGER analog and
 * where this should ideally fire; mid-task is "the best available
 * approximation". Harness rendering is out of this plan's scope (§9).
 */
const b6SelfOnlyCircles: Candidate = (s) => {
  const a = unwrapAssessment(s.assessment)
  if (a === undefined) return undefined
  const names = kathekonSignalsFromAssessment(a).circles
  if (names.length === 0) return undefined
  return names.every((n) => n === SELF_PRESERVATION_CIRCLE)
    ? {
        code: 'self_only_circles',
        signal: 'assessment.oikeiosis.relevant_circles[].circle',
        observed: SELF_PRESERVATION_CIRCLE,
      }
    : undefined
}

/**
 * THE PRECEDENCE. B2's four legs, then B1, then B3, then B4, then B6.
 * B5 is absent by BD-2 — the deferral is here, in the order, where a reader
 * looking for it will find it.
 */
const CANDIDATE_ORDER: readonly Candidate[] = [
  // B2 — obligations FIRST (the Step M reversal).
  b2CurrentObligation,
  b2ObligationTrend,
  b2WeakDomainCurrent,
  b2WeakDomainChain,
  // B1 — the genuinely-open, kathekon-engaged loop.
  b1OpenExamination,
  // B3 — the anticipatory fear cluster (agonia, oknos → premeditatio-class).
  b3AnticipatoryFrequency,
  b3AnticipatoryPersisting,
  // The 2026-07-28 phobos additions: acute fear, then aischyne. Micro-ordering
  // within the passion tier (anticipatory → acute → aischyne → craving →
  // comparison) follows the two records' own discussion order; the mentor fixed
  // the TIER order (B2 → B1 → B3 → B4 → B6), not the order among these
  // pattern rows — recorded as BD-9, low-stakes since at most one fires.
  acuteFearPattern,
  aischynePattern,
  // B4 — craving-class: the specific vetted line first, then the general.
  b4PhilodoxiaPersisting,
  b4EpithumiaPersisting,
  // The lupe comparison pair (Item 2).
  comparisonPersisting,
  // B5 — SILENT in v1 (BD-2): no detector exists.
  // B6 — the minimal calling analog.
  b6SelfOnlyCircles,
]

// ============================================================================
// THE COMPOSER (pure) + THE FLAG-GATED SEAM HELPER
// ============================================================================

/**
 * Compose at most ONE suggestion from the snapshot. PURE — no env read, no I/O,
 * no clock, no randomness; a fixed snapshot yields a byte-identical result.
 * Returns undefined when no basis fires (B7's protected silence: the caller must
 * OMIT the field entirely, never serve null).
 */
export function composePracticeSuggestion(
  snapshot: PracticeSuggestionSnapshot,
): PracticeSuggestion | undefined {
  for (const candidate of CANDIDATE_ORDER) {
    const basis = candidate(snapshot)
    if (basis === undefined) continue
    const endpoint = BASIS_ENDPOINT[basis.code]
    return {
      schema: 'agent-practice-suggestion/v1',
      practice: BASIS_PRACTICE[basis.code],
      basis,
      line: SUGGESTION_LINES[basis.code],
      ...(endpoint !== undefined ? { endpoint_hint: endpoint } : {}),
      framing_note: PRACTICE_SUGGESTION_FRAMING_NOTE,
    }
  }
  return undefined
}

/**
 * The attach-seam helper: the ONLY place the flag is read. Returns undefined
 * when the flag is off — so the caller's `practice` block is byte-identical to
 * pre-A1 (and, per BD-3, the caller only calls this when it is emitting a
 * `practice` block at all).
 */
export function practiceSuggestionFor(
  snapshot: PracticeSuggestionSnapshot,
): PracticeSuggestion | undefined {
  if (!isPracticeSuggestionEnabled()) return undefined
  // NEVER-THROWS BOUNDARY — defense-in-depth, mirroring
  // computeLoopFoldAnnotation's wrapper (log + undefined, never silent, never
  // propagated). BOTH seams call this on a SUCCESS path: at /api/reason after
  // the assessment is built, and at the accreditation write AFTER the row is
  // committed, inside the outer try whose catch returns 503. A throw there
  // would fail a request whose real work already succeeded.
  //
  // HONEST SCOPE (the PR19 review refuted the stronger claim, and the weaker one
  // is what stands): the composer's readers are guarded, and the one input that
  // escapes the type system — /api/reason's `output.assessment` — CANNOT carry
  // the malformed shapes that would throw, because applyMechanisms builds those
  // collections locally and itself calls .some/.filter/.length on them long
  // before this runs. So this wrapper guards no reachable case today. It is here
  // because the accreditation seam's sibling (the fold) has exactly this
  // protection for exactly this reason, and an asymmetry in a
  // never-fail-a-committed-write guarantee is not worth preserving.
  try {
    return composePracticeSuggestion(snapshot)
  } catch (e) {
    console.error('[practice-suggestion] compose error (response unaffected):', (e as Error).message)
    return undefined
  }
}
