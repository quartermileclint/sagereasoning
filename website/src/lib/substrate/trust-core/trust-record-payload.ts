/**
 * trust-record-payload.ts — Trust Layer S10: the PURE composer for the public
 * trust-record read surface (GET /api/trust-record/{agent_id}).
 *
 * Composes the wire payload from a TrustVerdict (harness-integration Section E)
 * + the honest reflect summary. No I/O, no env, no clock beyond the injected
 * `generatedAt` — decay is already realized upstream (computeEffectiveDomain,
 * lazy-on-read E3), so this module serves DECAYED TRUTH, never stale rows.
 *
 * ── The honest-claims envelope (ADR-013 §8, as narrowed 2026-07-12) ──────────
 * TRUST_RECORD_ENVELOPE below is the R18 boundary this surface publishes inside.
 * It carries the PA-6 narrowing (reflect events are record-backed + screened-
 * examination-backed, honesty-gated, MODULATE-ONLY — never level-raising) and
 * the PA-10 disclosure (the stale-artifact replay class). The S10 battery locks
 * its load-bearing phrases against drift; the staged R18 docs quote it.
 *
 * ── What is deliberately NOT served (design decisions of record, S10) ────────
 * - The S4 intervention recommendation. The v1 public claim is per-domain
 *   levels + confidence + coverage + the envelope (build plan §S10); the
 *   recommendation is orchestrator-facing intervention machinery (MEASURE), and
 *   publishing it would read as SageReasoning advising third parties whether to
 *   proceed — beyond the v1 claim.
 * - The event ledger. Only the state fold is served: event payloads can carry
 *   passion sub-species detail (suppression watch) and per-write internals;
 *   the R17e-adjacent conservative posture is state-fold-only in v1.
 * - Any A5 confidence tier this build does not genuinely compute per verdict.
 *   The aggregate confidence weight is served with its honest basis: the
 *   STRUCTURAL + CONSERVATIVE read-time synthesis readTrustVerdict documents.
 *
 * Interop (founder election 4 — design-for, ship native): the shape is
 * VC-claims-mappable (subject / issuer / claims-per-domain / evidence basis)
 * and versioned for an A2A extension; NOTHING is published to any external
 * registry — `interop.published_externally` states it on the wire.
 */

import type { KatorthomaProximity } from '@/lib/translation-sandwich/layer2-mechanisms'
import { selectOrientationEntryWording } from '@/lib/translation-sandwich/orientation-reading'
import type { TrustVerdict } from './harness-integration'
import type { EffectiveDomainTrust, VirtueTrustDomain } from './types'

// ============================================================================
// THE HONEST-CLAIMS ENVELOPE (ADR-013 §8; PA-6 narrowed; PA-10 disclosed)
// ============================================================================

export const TRUST_RECORD_ENVELOPE = {
  attests: [
    'Signed, reproducible examination artifacts (Ed25519-verifiable against GET /api/public-key) exist for the examination-derived trust events this record aggregates — the R18f-parallel rule: no examination-derived event is folded without a re-verified signed assessment. Reflect-path events are the disclosed exception: they are backed by the retained reflect-session record and, where the out-of-band screened examination ran, its deterministic completion against the agent’s verbatim reflection — honesty-gated, and modulate-only (they cannot raise any trust level).',
    'HOW the aggregated decisions were reasoned, as narrated and extracted from the submitted text: examination before acting, justice structure over the affected circles named in the text, passion diagnosis, and proximity to right reason with per-domain floors. This holds for consults whose extraction the server itself produced; it does not hold where the caller supplied the extraction \u2014 see the extraction-origin item in the does-not-attest list.',
    'The decay and coverage state of each virtue domain, honestly marked: levels decay with domain inactivity toward the profile prior; sparse evidence and unevaluated domains are named, never papered over.',
    'The confidence basis of the aggregate: a structural, conservative read-time synthesis (signed artifacts; corroboration floored at "uncorroborated"; recency from the decay state) — the weakest contributing domain sets the aggregate confidence.',
  ],
  does_not_attest: [
    'Factual correctness. The instrument reads how a decision was reasoned, not whether it was factually right. It is not a fact-checker (the D3 scoping bound).',
    'Harms omitted from the submitted text. The corroboration check corroborates self-reports against the submitted text only; a cleanly-narrated account that omits a real harm scores high (the disclosed extraction-trust ceiling: the A2 self-report-omission class). At the delegation level, a genuinely uncatchable justice failure produces a developmental flag, not a detected violation (the A9 case-3 class).',
    // 2026-08-25 (mentor ruling Q2 + F-2, first edit; ADR-013 §8 dated amendment lands in
    // the SAME edit, with the S2-43..S2-46 pins — the ruling's own same-edit requirement).
    // FUTURE TENSE IS DELIBERATE on the coverage-gap clause: no provenance ledger exists and no
    // mint is being refused at the time of writing, so a present-tense claim would publish
    // behaviour that does not exist — the exact defect class this item corrects.
    'Extraction origin on caller-supplied consults. The served attestation that decisions were reasoned as narrated and extracted from the submitted text does not hold for consults where the caller supplied the extraction rather than the server producing it. On those consults the extraction\u2019s origin is not verified at the point where trust events are minted, and a supplied extraction is not distinguishable, at that point, from one the server produced. This disclaimer list will be updated when a structural fix is in place; that fix will surface any artifact whose origin it cannot verify as a named coverage gap on this record, never as silence \u2014 an absent event will say why it is absent, and that it does not mean the agent did not practise.',
    'Freshness beyond the artifact record. A genuinely-earned signed assessment re-submitted inside later writes can sustain a domain at — never above — its once-demonstrated proximity (the disclosed stale-artifact replay class, PA-10; structural closure is scheduled with recency-tier confidence weighting at the S2 fold wiring).',
    'Reasoning quality beyond what the signed artifacts carry. No claim rests on agent self-report alone; a reflect history is a modulate-only record, not a verified pattern of honesty.',
    'Future behaviour. Trust here is evaluative and present-looking; it decays without exercise and is never a prediction or a guarantee.',
    'Fitness as a training signal. Weights-tier claims are blocked.',
    'Fifth-circle alignment: orientation_readings entries describe a single examination or a single observation (each carries its own inline clause); the record cannot attest that the agent is fifth-circle-aligned (mentor Q6).',
    'Confirmed delivery. An orientation_readings entry\'s class field (examined/observed) is computed from an ELAPSED-TIME PROXY against the harness\'s documented consult timeout — never a confirmed-delivery acknowledgement, which no channel exists to provide. Entries recorded before 2026-08-08 predate this classification and default to examined (the architecture at time of writing, not a confirmed status; never backfilled).',
    // Ruling Set B, R-2 (2026-08-15; ADR-013 §8 dated amendment lands in the SAME
    // edit, with the S10 battery pin — the ruling's own same-edit requirement).
    // Named as DISCRIMINATIVE RANGE specifically, not variance or dispersion
    // generically: the doctrinal concept is the Senecan relapse-resistance
    // criterion (Seneca 75.8-9), not statistical variance as such.
    //
    // M-4 obligation 4 (mentor ruling M4-return, 2026-08-16/17, ADOPTED
    // 2026-08-17; retirement built + applied 2026-08-20/21): appended, not
    // replaced — the sentence above is the perturbation-limit disclosure and
    // stays word-for-word intact (S2-39/S2-40 pin it). This addition names the
    // second, now-corrected mean-blindness defect, states the limit applies at
    // every rung (not only the top), and discloses the top-rung/display
    // retirement this obligation requires as a GATE on obligation 1's build,
    // per the ruling's own text: "Nothing ships until the disclosure lands."
    'Discriminative range — whether the agent\'s proximity readings vary across different types of actions, or whether stability in the record reflects tested relapse-resistance rather than absence of perturbation. The disposition_stability dimension measures consistency of proximity readings; it cannot distinguish a stable disposition that has been tested under varied conditions from one that has not been tested at all. A related defect, corrected 2026-08-17: this dimension previously certified \'advanced\' from low variance alone, without regard to the underlying mean — a consistently poor mean could certify as advanced provided it was consistently poor. A mean floor now gates that certification. The discriminative-range limit above still applies at every rung this dimension informs, not only the top one. For that reason, disposition_stability has been retired from agent-facing display and from certifying the top rung (principled→sage_like) specifically: that transition can never be reached while this dimension cannot make the distinction the top rung\'s evidentiary bar requires. It remains, unchanged, a live gate input at the three lower rungs — a deliberate decision, not an oversight, because the same limit does not disqualify it from informing a lower, less demanding bar. Consistency of examination outputs is evidence of stable disposition, not proof of it; the harness cannot distinguish hexis — a genuinely stable disposition toward virtue — from drift, a settled pattern of habitual response that has stopped being examined, from the outside.',
    // 2026-08-31 (mentor rulings of 2026-08-30: verdict-variance disclosure, and the
    // rate-presentation ruling that governs how the measured rate is stated; the
    // rate-location ruling binds the path specificity). The ADR-013 §8 dated amendment lands
    // in the SAME edit, with pins S2-48/S2-50/S2-51 — the rulings' own same-edit requirement.
    //
    // S2-49 IS RETIRED. It pinned 'Its rate has not been measured' to stop a rate
    // being published without sign-off; that condition is discharged by the founder's approval
    // of 2026-08-31, and the string it pinned is now false. Do not re-add S2-49.
    //
    // ── 2026-08-30 n=100 REVISION (mentor ruling: publish-n=100 / indeterminacy /
    // per-probe distributions / K=20 class limit, verbatim and binding; founder-signed
    // wording 2026-08-30). The measurement passage is REPLACED at n=100.
    //
    // S2-51 IS RETIRED IN THIS EDIT, as a decision and not as a broken test. It pinned
    // 'Wilson 95% CI 5.6–23.8%' — the n=50 interval — which the pooled two-sweep n=100
    // measurement supersedes. S2-58 replaces it as the same inverse guard at the current
    // figure. Do not re-add S2-51.
    //
    // THE DIRECTIONAL DECOMPOSITION IS NOT PUBLISHED (ruling Q3). The per-input
    // distributions (0, 0, 2, 2, 8 of 20) replace it, and S2-60 pins its absence in both
    // directions. Do not re-introduce a directional split here.
    //
    // S2-54 IS NEITHER RETIRED NOR EDITED: 'calibration falsification' remains the founder's
    // own elected wording and survives this revision unchanged.
    //
    // PATH SPECIFICITY IS BINDING: the rate is /api/guardrail ONLY. /api/reason is unmeasured
    // and must be stated as unknown wherever the rate appears. Do not generalise it here.
    'Verdict determinism — that the same text re-examined yields the same verdict. The verdicts aggregated here are draws from a probabilistic extraction, not deterministic functions of the submitted text. The Layer-2 mechanism pass is deterministic and its result is reproducible from the extraction it was given — that is what the Ed25519 signature attests. Layer 1, which produces that extraction, is a sampled model output, so the same text examined twice can yield different extractions and therefore different verdicts. Variance appears across the verdict scale, including on benign inputs. Two populations are named separately, because they were always different and were called by one name: grave-vocabulary traffic — the actions the harness and the loop actually submit, which is what was measured here — and near-boundary inputs, those whose verdicts sit near the proceed/block boundary, which is the population a disagreement rate is properly computed about. Grave-vocabulary traffic is not homogeneous on the measured dimension, and no rate has been measured on near-boundary inputs as a defined population. Measured on the guardrail gate on 2026-08-30, five grave-vocabulary inputs were re-examined twenty times each across two independent series. The per-input distributions are published first, rather than a directional summary, because a summary would imply a regularity the inputs do not share. Of twenty examinations each: two inputs never crossed the boundary at all (a package-registry publish and a subscriber-list send, 0 of 20); two varied slightly (a production deploy and a stale staging-snapshot cleanup, 2 of 20 each) — occasional blocks on actions the gate otherwise permits, which is friction; and one input, a force-push proposal, crossed the boundary 8 times in 20. Two of the five grave-vocabulary probes showed no boundary crossings across twenty examinations each, indistinguishable from the clean anchor; the class definition admits actions the gate handles with complete stability at this sample size. The pooled rate across this probe set is 12% (Wilson 95% CI 7.0–19.8%, n=100 outcomes, 12 disagreements), and it is not evenly spread. Two independent balanced series returned the same pooled rate to the digit. On that force-push input the gate\'s behaviour is indeterminate. Across two independent series of ten examinations, the gate blocked in one series more often than it permitted (7 of 10) and in the other split exactly evenly (5 of 10) — 12 blocked and 8 permitted across the twenty. A recipient cannot predict whether this input will be blocked or permitted, and cannot describe the gate as having a usual behaviour toward it. That is the gate failing at its purpose rather than a friction cost, and it is a finding about that input, not about the input class. What the class label rests on, at this sample size: grave-vocabulary traffic is distinguished from the clean anchor solely by the force-push input\'s distribution; the remaining four members are statistically indistinguishable from the anchor on the proceed boundary across twenty examinations each. Further, the aggregate rate reflects this probe set\'s composition; a set with more or fewer force-push-shaped probes would produce a materially different aggregate with no change in gate behaviour. The clean anchor moved once in twenty on the proximity dimension and held its proceed verdict on all twenty; its second series was stable. The instrument recorded that movement as a calibration falsification — by its own check, the class boundaries its probe set asserts did not fully hold — and it is left recorded rather than repaired by re-partitioning the probes. The measurement was taken on the guardrail gate; the extraction stage that varies is the same code path, model and sampling temperature that produces the assessments this record aggregates, so the variance is a property of the instrument and not of the gate alone. No rate has been measured on the consult path (/api/reason), and the figures above must not be read as applying to it. The figures rest on two sweeps on one date, spanning a production redeploy in which no file in the gate\'s code path changed — route, sandwich and engine byte-identical across both sweeps, verified by diff, so the two sweeps measure the same code. The instrument\'s deploy identifier is a local-repository proxy that recorded two values because the repository moved; it attests nothing about what production was running, and no constancy is claimed from it. A server-side model change is not excluded. The interval quantifies sampling within the sweeps. This disclosure states the best available evidence at the time of publication, and it updates when better evidence arrives. The gate\'s evaluation takes no role input. Kathekon is role-relative — what is appropriate depends on the agent\'s roles and relationships — so an evaluation without role context assesses whether an action is the kind of thing a rational agent should do in general, not whether it is the kind of thing this agent should do. This is a confirmed design deficiency, not a design choice, and is recorded as one. Read any single verdict as one draw — what the examination found on that occasion, not the only reading the same text can produce.',
  ],
  honest_limit:
    'This record is an attestation composed server-side from consumer-unforgeable trust events under a 90-day retention regime — not a cryptographic proof of the agent’s inner states, and not a certification of safety, ethics, or trustworthiness in any absolute sense (R18a). MEASURE mode: nothing in this record binds any decision; a human’s right to override is absolute regardless of any level shown here (R20c).',
} as const

/**
 * M6 (mentor ruling 2026-08-15, VERBATIM + BINDING — the verbatim record wins
 * over this comment). Served on the total-UNKNOWN branch of the capped
 * orientation-readings note. The total-known branch discloses the composition
 * effect and can quantify the gap; this branch cannot, so it names the
 * inability to assess rather than staying silent about it.
 *
 * Note the vocabulary, recorded rather than adapted: M6 says "interactions"
 * where the surrounding payload says "readings". The mentor wording lands
 * verbatim — the surrounding note supplies the readings context, and M6's own
 * logic (a branch that cannot quantify the curation effect names the inability)
 * is vocabulary-independent.
 */
export const M6_TOTAL_UNKNOWN_CURATION_DISCLOSURE =
  'The trust record for this agent is incomplete. The total number of ' +
  'interactions cannot be confirmed. Curation effects — where high-volume ' +
  'interaction patterns may suppress individual signal visibility — cannot be ' +
  'assessed at this time. This record should be read with that limitation in mind.'

// ============================================================================
// WIRE TYPES (sage-trust-record/v1)
// ============================================================================

export interface TrustRecordDomainView {
  domain: VirtueTrustDomain
  /** The LIVE level: earned, decayed toward the prior, justice-capped. */
  effective_level: KatorthomaProximity
  earned_level: KatorthomaProximity
  profile_prior: KatorthomaProximity
  decay_steps_applied: number
  reflect_modulated: boolean
  justice_capped: boolean
  coverage_status: string | null
  has_evidence: boolean
}

export interface TrustRecordAggregateView {
  /** Minimum-domain level across the evaluated CARDINAL domains (spec 6); null
   *  when no cardinal domain carries evidence. Categorical, never a score. */
  level: KatorthomaProximity | null
  limiting_domain: VirtueTrustDomain | null
  resolution: 'combined' | 'pause-escalate'
  any_conflict: boolean
  any_justice_capped: boolean
  coverage_gaps: VirtueTrustDomain[]
  /** The weakest contributing domain's S2 evidence weight (derived scalar; the
   *  LEVEL is the canonical output). */
  confidence_weight: number
  confidence_basis: string
  basis: string
}

export interface TrustRecordReflectView {
  /** Count of reflect-completed-honest events (honest BY CONSTRUCTION in the
   *  deriver). Served as a modulate-only record — see `class` + `note`. */
  honest_reflect_count: number
  latest_honest_reflect_at: string | null
  class: 'modulate-only'
  note: string
}

/**
 * Agent-circles C2c (2026-08-08) — one served orientation-reading entry. The
 * NAMED, BOUNDED exception to S10's state-fold-only posture (the C2c placement
 * ruling + scope §4.5; the reflect-summary cap precedent): a capped
 * recent-entries list composed from the three orientation-reading-* ledger
 * events. Every entry carries the not-attestable clause INLINE — "the entry is
 * the unit that will be read in isolation" (the ruling's structural addition).
 * The entry describes ONE examination's direction, never the agent's standing;
 * nothing here is an aggregation, a trend, or a score.
 */
export interface TrustRecordOrientationEntry {
  reading: 'toward' | 'away' | 'indeterminate'
  /** 2026-08-08 examined/observed fold (mentor ruling): the elapsed-time-proxy
   *  delivery classification. 'examined' ⇒ entry_text/not_attestable_clause
   *  use the existing per-reading templates. 'observed' ⇒ both use the fixed
   *  verbatim pair naming that the framing was not delivered in time — see
   *  selectOrientationEntryWording. Defaults to 'examined' for events
   *  emitted before this fold (prospective-only, never backfilled). */
  class: 'examined' | 'observed'
  /** selectOrientationEntryWording(reading, class).entryText. */
  entry_text: string
  /** selectOrientationEntryWording(reading, class).notAttestableClause. */
  not_attestable_clause: string
  occurred_at: string
}

export interface TrustRecordPayload {
  schema: 'sage-trust-record/v1'
  subject: { agent_id: string }
  issuer: 'https://www.sagereasoning.com'
  generated_at: string
  /** MEASURE until the S11 founder-walked ENFORCE activation — binds nothing. */
  mode: 'measure'
  record: {
    domains: TrustRecordDomainView[]
    aggregate: TrustRecordAggregateView
    unevaluated_cardinal_domains: string[]
    sparse: boolean
    reflect_record: TrustRecordReflectView | null
    /** C2c: ABSENT entirely while SUBSTRATE_ORIENTATION_READING_ENABLED is
     *  unset (byte-identical payload — the established optional-field
     *  pattern); flag-on, the capped recent-entries list (newest first). */
    orientation_readings?: TrustRecordOrientationEntry[]
    /** Mentor §6(b) ruling (2026-08-08, C2d sign-off): the TOTAL count of
     *  orientation-reading events, served alongside the capped list so a
     *  reader sees "showing 50 of 847" rather than inferring completeness —
     *  the honest-scope disclosure for the recency-ordered window. Present
     *  whenever orientation_readings is present AND the count read succeeded
     *  (omitted on a transient count failure — never fabricated). */
    total_orientation_readings_count?: number
  }
  envelope: typeof TRUST_RECORD_ENVELOPE
  evidence: {
    artifact_note: string
    retention: { window_days: 90; note: string }
  }
  interop: {
    design_shapes: string[]
    published_externally: false
    note: string
  }
  notes: string[]
}

export const REFLECT_MODULATE_ONLY_NOTE =
  'Reflect events modulate decay only (half-rate cap; screened at quarter-rate). ' +
  'They cannot raise any trust level and are not attested as a verified pattern of honesty.'

const ARTIFACT_NOTE =
  'Examination-derived trust events fold only from Ed25519-re-verified signed assessments ' +
  '(verify against GET /api/public-key). Reflect-path events are backed by the retained ' +
  'reflect-session record and the out-of-band screened examination where it ran — modulate-only.'

const RETENTION_NOTE =
  'Trust events and state sweep at retain_until (90 days); the record is erasable on request ' +
  '(R17 — owner deletion, credential erasure).'

const CONFIDENCE_BASIS =
  'Structural, conservative read-time synthesis: every folded event is R18f-re-verified ' +
  '(signature: signed); depth standard; corroboration floored at "uncorroborated" (the fold ' +
  'retains no per-verdict corroboration); recency from the decay state. The weakest ' +
  'contributing domain sets the aggregate confidence (mentor A5: the weakest dimension is the ceiling).'

const INTEROP_NOTE =
  'Design-for-interop, shipped native (founder election 4): the payload is W3C-VC-claims-mappable ' +
  '(subject/issuer/claims-per-domain/evidence-basis) and versioned as an A2A-extension-shaped schema. ' +
  'Nothing is published to any external registry or standard body at v1.'

// ============================================================================
// COMPOSER (pure)
// ============================================================================

function domainView(d: EffectiveDomainTrust): TrustRecordDomainView {
  return {
    domain: d.virtueDomain,
    effective_level: d.effectiveLevel,
    earned_level: d.earnedLevel,
    profile_prior: d.profilePrior,
    decay_steps_applied: d.decayStepsApplied,
    reflect_modulated: d.reflectModulated,
    justice_capped: d.justiceCapped,
    coverage_status: d.coverageStatus ?? null,
    has_evidence: d.hasEvidence,
  }
}

export interface ComposeTrustRecordInput {
  verdict: TrustVerdict
  reflectSummary: {
    honestReflectCount: number
    latestHonestReflectAt: string | null
    capped?: boolean
  } | null
  /** C2c (2026-08-08): the capped orientation-readings ledger slice.
   *  `undefined` ⇒ the orientation surface is dark (flag off) — the payload
   *  carries NO orientation_readings key at all (byte-identity). `null` ⇒ the
   *  flag is on but the read failed honestly — the field is omitted this read
   *  with an honest note (the reflect-summary outage posture). A value ⇒
   *  composed entries, each carrying the inline not-attestable clause, plus
   *  the mentor-§6(b) total count (null ⇒ count omitted, never fabricated). */
  orientationReadings?: {
    entries: { reading: string; occurredAt: string; deliveryClass: 'examined' | 'observed' }[]
    capped: boolean
    totalCount?: number | null
  } | null
  /** Injected read time (the route passes new Date(); tests pin it). */
  generatedAt: Date
}

/**
 * Compose the public payload. PRECONDITION (enforced by the handler): the
 * verdict is not dark, its profile is non-null, and the profile is non-empty
 * (an empty profile is a 404 honest miss, composed nowhere).
 *
 * `reflectSummary` null ⇒ the summary read failed honestly upstream: the record
 * ships WITHOUT a reflect_record and with an honest note — a supplementary
 * field's outage never fabricates and never blocks the primary record.
 */
export function composeTrustRecordPayload(input: ComposeTrustRecordInput): TrustRecordPayload {
  const profile = input.verdict.profile
  if (!profile) {
    throw new Error('composeTrustRecordPayload requires a non-null profile (handler precondition)')
  }
  const aggregate = input.verdict.aggregate

  const notes: string[] = []
  if (input.reflectSummary === null) {
    notes.push('reflect summary unavailable (fail-honest) — reflect_record omitted this read')
  }
  if (input.reflectSummary?.capped) {
    notes.push(
      'honest_reflect_count is capped at the bounded read window (older events not counted — under-reporting, the safe direction)',
    )
  }
  // C2c: compose the orientation entries (flag-on only — `undefined` means the
  // surface is dark and the key must be absent entirely). Defensive filter to
  // the three known readings so a future vocabulary widening can never render
  // an entry with no template text.
  let orientationEntries: TrustRecordOrientationEntry[] | undefined
  if (input.orientationReadings === null) {
    notes.push(
      'orientation readings unavailable (fail-honest) — orientation_readings omitted this read',
    )
  } else if (input.orientationReadings !== undefined) {
    orientationEntries = input.orientationReadings.entries
      .filter(
        (
          e,
        ): e is {
          reading: 'toward' | 'away' | 'indeterminate'
          occurredAt: string
          deliveryClass: 'examined' | 'observed'
        } => e.reading === 'toward' || e.reading === 'away' || e.reading === 'indeterminate',
      )
      .map((e) => {
        const wording = selectOrientationEntryWording(e.reading, e.deliveryClass)
        return {
          reading: e.reading,
          class: e.deliveryClass,
          entry_text: wording.entryText,
          not_attestable_clause: wording.notAttestableClause,
          occurred_at: e.occurredAt,
        }
      })
    if (input.orientationReadings.capped) {
      // Mentor §6(b): the capped note names the total when available, so a
      // reader sees "showing N of M" rather than inferring completeness.
      // 2026-08-08 curation-via-volume ruling (confirmed closed 2026-08-12;
      // the sentence below is verbatim from the mentor-ruled llms.txt text,
      // folded here — a residual found in the same 2026-08-12 follow-up —
      // because the composition-effect claim itself leans on the total count
      // being known, it rides only the total-known branch): the total-count
      // disclosure alone does not prevent an agent from generating high
      // volumes of toward-classified consults to displace older away or
      // indeterminate entries from the visible recency window.
      const total = input.orientationReadings.totalCount
      const totalKnown = typeof total === 'number'
      let cappedNote =
        (totalKnown
          ? `orientation_readings shows the ${orientationEntries?.length ?? 0} most recent of ` +
            `${total} total readings (a recency window, not the full record); because the ` +
            'served list is recency-ordered, an agent generating high volumes of ' +
            'toward-classified consults could displace older away or indeterminate entries ' +
            'from the visible window; the total count discloses that more entries exist but ' +
            'does not prevent this composition effect; '
          : 'orientation_readings is capped at the bounded read window (older readings not ' +
            'listed; the total count was unavailable this read); ') +
        'each entry describes one examination only — see its inline not-attestable clause'
      // M6 (2026-08-15 mentor ruling, verbatim + binding): the total-KNOWN arm
      // above can name the composition effect because it can quantify the gap.
      // This arm cannot — so it names the INABILITY TO ASSESS instead, rather
      // than staying silent about a limitation it genuinely has. The existing
      // operational clause is RETAINED (it states the mechanical fact; M6 states
      // the honest consequence) — battery pin S6-5d rides that clause.
      // ORDERING NOTE: the ruled sentence is folded AFTER the shared tail rather
      // than mid-sentence before it, purely so the served prose does not read
      // "…in mind. each entry describes…". The wording itself is untouched.
      if (!totalKnown) cappedNote += `. ${M6_TOTAL_UNKNOWN_CURATION_DISCLOSURE}`
      notes.push(cappedNote)
    }
  }
  if (profile.unevaluatedCardinalDomains.length > 0) {
    notes.push(
      `unevaluated cardinal domain(s): ${profile.unevaluatedCardinalDomains.join(', ')} — ` +
        'no evidence has been folded for them; absence is a coverage gap, never a level',
    )
  }

  const aggregateView: TrustRecordAggregateView = aggregate
    ? {
        level: aggregate.level,
        limiting_domain: aggregate.limitingDomain,
        resolution: aggregate.resolution,
        any_conflict: aggregate.anyConflict,
        any_justice_capped: aggregate.anyJusticeCapped,
        coverage_gaps: aggregate.coverageGaps,
        confidence_weight: aggregate.aggregateConfidenceWeight,
        confidence_basis: CONFIDENCE_BASIS,
        basis: aggregate.basis,
      }
    : {
        level: null,
        limiting_domain: null,
        resolution: 'combined',
        any_conflict: false,
        any_justice_capped: false,
        coverage_gaps: [],
        confidence_weight: 0,
        confidence_basis: CONFIDENCE_BASIS,
        basis: 'no evaluated cardinal-domain evidence',
      }

  return {
    schema: 'sage-trust-record/v1',
    subject: { agent_id: profile.agentId },
    issuer: 'https://www.sagereasoning.com',
    generated_at: input.generatedAt.toISOString(),
    mode: 'measure',
    record: {
      domains: profile.domains.map(domainView),
      aggregate: aggregateView,
      unevaluated_cardinal_domains: [...profile.unevaluatedCardinalDomains],
      sparse: profile.sparse,
      reflect_record: input.reflectSummary
        ? {
            honest_reflect_count: input.reflectSummary.honestReflectCount,
            latest_honest_reflect_at: input.reflectSummary.latestHonestReflectAt,
            class: 'modulate-only',
            note: REFLECT_MODULATE_ONLY_NOTE,
          }
        : null,
      // C2c: attached ONLY when composed (spread-omitted otherwise — the key is
      // structurally absent flag-off, byte-identical payload). The mentor-§6(b)
      // total count rides alongside whenever the count read succeeded.
      ...(orientationEntries !== undefined ? { orientation_readings: orientationEntries } : {}),
      ...(orientationEntries !== undefined &&
      typeof input.orientationReadings?.totalCount === 'number'
        ? { total_orientation_readings_count: input.orientationReadings.totalCount }
        : {}),
    },
    envelope: TRUST_RECORD_ENVELOPE,
    evidence: {
      artifact_note: ARTIFACT_NOTE,
      retention: { window_days: 90, note: RETENTION_NOTE },
    },
    interop: {
      design_shapes: [
        'w3c-vc-claims-mapping (subject/issuer/claims/evidence)',
        'a2a-extension-shape (sage-trust-record/v1)',
        'otel-genai-shaped span refs in observability logs',
      ],
      published_externally: false,
      note: INTEROP_NOTE,
    },
    notes,
  }
}
