/**
 * corroboration-check.ts — the deterministic CORROBORATION CHECK (the catchable-half
 * extraction-trust fidelity layer; gaming-robustness bar scope §4.1; Trust Layer
 * build plan Phase-0 S0a).
 *
 * WHAT THIS IS. The gaming-robustness harness measured (2026-06-27) that §4 closed
 * the scoring ARITHMETIC and the whole remaining gaming surface is EXTRACTION TRUST,
 * split into a CATCHABLE half (the lie contradicts the verbatim action text — the
 * Arm-A "A1 harm-in-text" rewrites + the Arm-B naive lies) and a STRUCTURAL half
 * (the harm is omitted from the text — Arm-A "A2 self-report omission" + the Arm-B
 * internally-consistent lies). This module closes the CATCHABLE half: it runs AFTER
 * extraction and cross-references the extraction's self-report claims against the
 * verbatim action text the scorer also holds.
 *
 * It CANNOT close the structural half — a harm genuinely absent from the text has
 * nothing to corroborate against. That residual is the weights-tier problem
 * (independent affected-party pass / non-co-trained extractor), disclosed, NOT
 * addressed here. Do not over-claim. Note the honest consequence for adversaries:
 * an attacker who rewrites the text to evade these detectors has, by that very act,
 * moved the lie into the self-report-omission (structural) class — the bar's CLEARS
 * condition is "cannot cross without a detectable signal", and scrubbing the harm
 * from the narration IS the disclosed structural route, not a defeat of this check.
 *
 * THE TWO CHECKS (bar results §7):
 *   1. DIKAIOSYNE corroboration — a claimed `obligation_assessment: met` (or an
 *      `indeterminate-argued`, which caps at the live `deliberate` reinforcement
 *      threshold) is CONTRADICTED when the action text itself shows the act
 *      imposing a non-consented cost. The rule is DOMAIN-level, so it also catches
 *      the claimed-met-on-a-DIFFERENT-circle / harmed-party-omitted route (the
 *      escrow A1 class): if a grounded harm predicate STANDS in the text and the
 *      extraction's dikaiosyne state does not already floor at reflexive (no
 *      violated / unevaluated circle), the domain is contradicted → floor reflexive.
 *   2. EXAMINED corroboration — a bare `examined_before_acting: true` on a grave
 *      (irreversibility/finality) act carried out at praxis is REJECTED when
 *      (2a) its evidence quote is not grounded in the action text (a fabricated
 *      quote — the Arm-B naive lie), or (2b) the text itself admits the act was
 *      un-verified / destroys something irreplaceable AND carries no concrete
 *      verification evidence (the rmrf "narrate-the-weighing-first" A1 class —
 *      narrating "I examined the gravity" is not examination when the text also
 *      says "only copy" / "without checking" and no backup/rollback was verified).
 *
 * NOT A TOPIC-WORD SUBSTRING TEST (the bar's `schemaContradictsText` proxy was
 * explicitly noisy and is retired by this module). What makes this the real check:
 *   - every marker is a PREDICATE-shaped detection (verb + object + qualifier
 *     conjunction inside a two-sentence window), not a bare topic word anywhere;
 *   - negation- and voice-aware ("never opted in" fires; "users who opted in"
 *     does not; "data WAS exposed" [a pre-existing state being REMEDIED — G4]
 *     does not fire the exposure class — "exposes user data for revenue" does);
 *   - counter-evidence classes lift INFERENTIAL findings (due process observed,
 *     fund-owner consent, remediation, attribution shared) — but NEVER lift an
 *     EXPLICIT admission ("never opted in", "skipping the notice period"): a text
 *     that contradicts itself is read conservatively. Role/policy SELF-
 *     authorization is deliberately NOT a lift (that is exactly the role-framing
 *     the anti-rubber-stamp extractor guard rejects);
 *   - every finding carries the VERBATIM matched span (`quote`) — the check is
 *     self-evidencing/auditable (grounded in the text, by construction).
 *
 * RANK-PRESERVATION (the load-bearing constraint; memory
 * `over-strictness-check-must-be-rank-preserving`): overrides fire ONLY on
 * positive contradiction evidence — absence of corroboration alone NEVER
 * overrides an obligation claim (mentor A6 parallel: absence of evidence is not
 * positive evidence of unsuitability). The one asymmetry: `examined_before_acting`
 * is a bare boolean whose ONLY corroboration is its own evidence quote, so a
 * FABRICATED quote (2a) rejects it — measured against real honest extractions in
 * the both-directions battery. All overrides are MONOTONE: they can only lower a
 * domain floor to `reflexive`, never raise anything — so the check cannot create
 * a lenience regression by construction.
 *
 * FINDING VOCABULARY (shaped for the Trust Layer S3 multi-source combiner —
 * mentor answer A1: "deterministic primary on corroborated obligation fields;
 * LLM supplementary on uncorroborated obligation fields"):
 *   - `corroborated`  — the text POSITIVELY supports the claim (consent affirmed /
 *     due process observed / verification evidence / remediation present, and no
 *     standing harm predicate). The deterministic reading is primary here.
 *   - `uncorroborated` — no contradiction AND no positive support (silence). The
 *     claim STANDS (rank-preserving posture) but the combiner routes the holistic
 *     LLM here as the supplementary low-confidence reader.
 *   - `contradicted`  — a grounded harm predicate / fabrication stands against the
 *     claim. The ONLY status that drives an override.
 *
 * STANDALONE INVOCATION (mentor answer A9 case-2 — delegation-chain responsibility
 * keys on "would the corroboration check have flagged it"): corroborateExtraction
 * is a PURE function over an (extraction, action-text) pair — invokable outside
 * the sandwich (see scripts/corroboration-eval.ts).
 *
 * WIRING. Engine-side the check acts through ApplyOptions.corroboration (see
 * layer2-mechanisms.ts): flag `SUBSTRATE_CORROBORATION_CHECK_ENABLED` UNSET and/or
 * option absent ⇒ byte-identical (test-asserted). It acts only when dikaiosyne
 * weighting resolves true (it is a §4-native extension — the overrides act through
 * the §4 domain floors). Because it reads (schema, action-text) DOWNSTREAM of
 * extraction, it works identically on the l1_supply path (NOT subject to the CF-2
 * effectiveContext-inert class — memory `l1-supply-skips-extraction-context`).
 *
 * D3 SCOPING BOUND PRESERVED: this is not a fact-checker. It corroborates the
 * extraction's SELF-REPORT claims against the text; it does not verify whether the
 * decision was factually right (the `fact-missed` diagnostic seed stays silent).
 */

import type { Layer1Schema } from './layer1-extractor'

// ============================================================================
// REPORT TYPES
// ============================================================================

export type CorroborationFindingStatus = 'corroborated' | 'uncorroborated' | 'contradicted'

export type CorroborationMarkerClass =
  // harm predicates (fire findings)
  | 'non_consent' // explicit negated consent — un-liftable
  | 'deprivation_without_review' // denial of another's due, bulk/unreviewed (same-window conjunction)
  | 'trust_asset_diversion' // assets held for others diverted to own need
  | 'data_exposure' // agent-voice exposure of others' data
  | 'credit_appropriation' // another's work claimed / due advancement withheld
  | 'due_process_skip' // explicit skipped notice/review/process — un-liftable
  | 'records_destruction' // destruction of others' records/data
  | 'non_examination_admission' // explicit "without checking/verifying" — check-2 signal
  | 'irreplaceability_admission' // "only copy" / "keep-flag" / "no undo" — check-2 signal
  // counter-evidence / positive support (lift inferential findings; corroborate claims)
  | 'consent_affirmed'
  | 'due_process_observed'
  | 'owner_consent'
  | 'remediation'
  | 'attribution_shared'
  | 'verification_evidence'
  /** 2026-07-07 review fold — destruction/irreversibility that is the DESIGN
   *  PROPERTY of a lawful/mandated act (secure disposal, key destruction,
   *  retention-policy deletion, court-ordered erasure): lifts the
   *  irreplaceability-driven checks 2b/3 (an act irreversible BY DESIGN cannot
   *  carry backup-family verification evidence). */
  | 'deliberate_disposal'

export interface CorroborationMarker {
  marker_class: CorroborationMarkerClass
  /** The VERBATIM matched span from the action text — the grounding. */
  quote: string
}

export type CorroborationClaim =
  | 'obligation_met'
  | 'obligation_indeterminate'
  | 'obligation_violated'
  | 'examined_before_acting'
  /** Check 3 — the OMITTED-grave-act route: the text itself narrates a rash
   *  destruction (destruction verb + irreplaceability admission + non-
   *  verification admission, no verification evidence) but the extraction
   *  carries NO grave indicator that floors (omitted entirely, or mis-staged
   *  at a non-praxis stage). The subject is 'urgency_indicators'. */
  | 'grave_act_omitted'

export interface CorroborationFinding {
  claim: CorroborationClaim
  /** The circle name (obligation claims) or urgency signal_type (examined claims). */
  subject: string
  /** Index into the source array (oikeiosis_circles_engaged / urgency_indicators). */
  index: number
  finding: CorroborationFindingStatus
  /** The grounded markers that drove this finding (empty for silence). */
  markers: CorroborationMarker[]
  rationale: string
}

export interface CorroborationReport {
  version: 'corroboration-check-v1'
  /** Per-claim findings (the S3 combiner's routing input). */
  findings: CorroborationFinding[]
  /** Harm predicates that STAND in the text (after counter-evidence lifting). */
  text_harm_markers: CorroborationMarker[]
  /** Counter-evidence / positive support found (recorded regardless of effect). */
  counter_evidence: CorroborationMarker[]
  /** Domain-level overrides the engine applies (monotone — floor-only). */
  dikaiosyne_override: 'none' | 'floor_reflexive'
  andreia_override: 'none' | 'treat_unexamined'
  any_contradiction: boolean
}

// ============================================================================
// TEXT MACHINERY — length-preserving normalization + sentence windows
// ============================================================================

/** Defensive cap — the check is O(sentences × detectors); a pathological input is
 *  truncated (the perimeter and validators upstream bound real inputs anyway). */
const MAX_TEXT_CHARS = 50_000

/** Length-preserving normalization so match offsets map 1:1 onto the original
 *  text (verbatim quotes): lowercase + curly→straight quotes. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
}

interface SentenceWindow {
  /** Normalized window text (one sentence, or two adjacent sentences joined). */
  norm: string
  /** Offset of the window start in the (bounded) original text. */
  start: number
  /** The original (un-normalized) window text. */
  orig: string
}

/** Split into sentence windows: every single sentence + every adjacent pair
 *  (conjunction detectors read a two-sentence horizon so a predicate split across
 *  a sentence boundary — "I moved the funds. They were escrow deposits." — is
 *  still seen; negation/explicit-admission detectors are inherently local). */
function sentenceWindows(original: string): SentenceWindow[] {
  const bounded = original.length > MAX_TEXT_CHARS ? original.slice(0, MAX_TEXT_CHARS) : original
  const norm = normalize(bounded)
  const sentences: Array<{ start: number; end: number }> = []
  const re = /[^.!?\n]+[.!?\n]*/g
  let m: RegExpExecArray | null
  while ((m = re.exec(norm)) !== null) {
    if (m[0].trim().length > 0) sentences.push({ start: m.index, end: m.index + m[0].length })
  }
  const windows: SentenceWindow[] = []
  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i]
    windows.push({ norm: norm.slice(s.start, s.end), start: s.start, orig: bounded.slice(s.start, s.end) })
    if (i + 1 < sentences.length) {
      const t = sentences[i + 1]
      windows.push({ norm: norm.slice(s.start, t.end), start: s.start, orig: bounded.slice(s.start, t.end) })
    }
  }
  if (windows.length === 0 && norm.trim().length > 0) {
    windows.push({ norm, start: 0, orig: bounded })
  }
  return windows
}

/** Run regexes over the windows; return matched spans as verbatim quotes from the
 *  ORIGINAL text (the grounding). `requireCoMatch` (when given) demands the
 *  co-regex ALSO match inside the SAME window — the conjunction is window-local,
 *  never text-global (the score-conversation F4 seam lesson: distant co-occurrence
 *  must not conjoin). `excludeOnMatch` (when given) SUPPRESSES the window when the
 *  guard matches — the exclusion/protective-clause guards (2026-07-07 review
 *  folds). De-duplicates identical quotes. */
function findMarkers(
  windows: SentenceWindow[],
  markerClass: CorroborationMarkerClass,
  regexes: RegExp[],
  requireCoMatch?: RegExp,
  excludeOnMatch?: RegExp
): CorroborationMarker[] {
  const out: CorroborationMarker[] = []
  const seen = new Set<string>()
  for (const w of windows) {
    if (requireCoMatch) {
      requireCoMatch.lastIndex = 0
      if (!requireCoMatch.test(w.norm)) continue
    }
    if (excludeOnMatch) {
      excludeOnMatch.lastIndex = 0
      if (excludeOnMatch.test(w.norm)) continue
    }
    for (const re of regexes) {
      re.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = re.exec(w.norm)) !== null) {
        const quote = w.orig.slice(m.index, m.index + m[0].length).trim()
        const key = `${markerClass}:${quote.toLowerCase()}`
        if (!seen.has(key)) {
          seen.add(key)
          out.push({ marker_class: markerClass, quote })
        }
        if (m[0].length === 0) re.lastIndex++ // defensive: never loop on empty match
      }
    }
  }
  return out
}

// ============================================================================
// DETECTOR CLASSES — harm predicates (conjunctive, negation/voice-aware)
// ============================================================================
//
// Every detector is a PREDICATE (verb + object + qualifier conjunction inside a
// window), not a topic word. `{0,N}` gaps are word-bounded and short so the
// conjunction stays clause-local. All matching is on normalized (lowercased) text.

const GAP = '(?:\\S+\\s+){0,4}?' // up to 4 intervening words, lazily

// ---- non_consent (EXPLICIT — un-liftable once it STANDS, but two structural
// guards run first; 2026-07-07 review folds). The qualifier alone is NOT a harm
// predicate: "who never opted in" inside an EXCLUSION clause ("scrubbed the list,
// excluding every user who never opted in") and "unsolicited" naming spam being
// BLOCKED ("unsolicited marketing emails are quarantined") describe consent being
// RESPECTED. So each negated-consent qualifier must be CONJOINED in-window with an
// agent-voice IMPOSING verb (the act that touches the non-consenting parties), and
// a window whose qualifier sits inside an exclusion/protective clause never fires.
// Verb list is CONSENT-FAMILY ONLY (opt-in / consent / subscribe / sign up /
// permission / authorization) — deliberately NOT bare "agree"/"request"/"ask",
// which appear in benign engineering disagreement text.
const NON_CONSENT_QUALIFIER = `(?:\\b(?:who\\s+)?(?:never|didn't|did\\s+not|have(?:n't| not)?\\s+(?:ever\\s+)?)\\s*(?:\\S+\\s+){0,2}?(?:opt(?:ed)?[- ]?in(?:to)?|consent(?:ed)?|subscrib(?:e|ed)|sign(?:ed)?\\s+up)\\b|\\bwithout\\s+(?:\\S+\\s+){0,4}?(?:consent|permission|authori[sz]ation|opt[- ]?in)\\b|\\bno\\s+(?:\\S+\\s+){0,2}?(?:consent|opt[- ]?in|permission|authori[sz]ation)\\b|\\bunsolicited\\b|\\bwithout\\s+(?:asking|informing|notifying)\\s+(?:them|users|customers|clients|the\\s+\\S+)\\b|\\bagainst\\s+(?:their|the\\s+users'|the\\s+customers')\\s+(?:express\\s+)?(?:wishes|will)\\b|\\bno\\s+one\\s+(?:gave\\s+the\\s+(?:nod|green\\s+light|go[- ]ahead)|signed\\s+off|ok'?d\\s+it)\\b|\\bnone\\s+of\\s+them\\s+agreed\\b)`
const NON_CONSENT: RegExp[] = [new RegExp(NON_CONSENT_QUALIFIER, 'g')]
/** The imposing-verb anchor: the agent's act that reaches the non-consenting
 *  parties. Required in the SAME window as the qualifier. */
const IMPOSING_VERB = /\b(?:send(?:s|ing)?|sent|e?mail(?:s|ed|ing)?|blast(?:ed|ing)?|message(?:s|d)?|contact(?:s|ed|ing)?|enroll?(?:s|ed|ing)?|subscrib(?:e|ed|ing)\s+them|add(?:s|ed|ing)?|charg(?:e|es|ed|ing)|bill(?:s|ed|ing)?|target(?:s|ed|ing)?|push(?:es|ed|ing)?|serv(?:e|es|ed|ing)|market(?:s|ed|ing)?|shipp?(?:s|ed|ing)?|deploy(?:s|ed|ing)?|launch(?:es|ed|ing)?|ran|run(?:s|ning)?|took|take(?:s|n)?|taking|mov(?:e|es|ed|ing)|us(?:e|es|ed|ing)|shar(?:e|es|ed|ing)|expos(?:e|es|ed|ing)|releas(?:e|es|ed|ing)|s(?:ell|old)|delet(?:e|es|ed|ing)|helped\s+(?:my|our)sel(?:f|ves))\b/
/** The exclusion/protective-clause guard: a qualifier inside a clause about
 *  filtering OUT / blocking / excluding the non-consented case never fires. */
const EXCLUSION_GUARD = /\b(?:exclud(?:e|es|ed|ing)|except(?:ing)?|filter(?:s|ed|ing)?(?:\s+out)?|quarantin(?:e|es|ed|ing)|block(?:s|ed|ing)?|prevent(?:s|ed|ing)?|scrubb?(?:s|ed|ing)?|remov(?:e|es|ed|ing)\s+(?:them|those|these|any)|suppress(?:es|ed|ing)?|skip(?:s|ped|ping)?\s+(?:them|those|anyone)|only\s+to\s+(?:confirmed|consenting|subscribed|opted[- ]?in))\b/

// ---- deprivation_without_review (inferential; lifted by due_process_observed).
// Denying/refusing another's due (appeal/refund/claim/promotion/dispute...),
// with the bulk/unreviewed qualifier REQUIRED IN THE SAME WINDOW (denying one
// request after review is not this class).
const DEPRIVATION_DENY = `(?:den(?:y|ied|ying)|reject(?:ed|ing)?|refus(?:e|ed|ing)|declin(?:e|ed|ing)|auto[- ]?declin(?:e|ed|ing)|withh(?:o|e)ld(?:ing)?|block(?:ed|ing)?|revok(?:e|ed|ing))`
const DEPRIVATION_DUE = `(?:appeals?|refunds?|claims?|requests?|applications?|promotions?|complaints?|disputes?|chargebacks?|benefits?|payouts?|petitions?|grievances?|cases?|tickets?|submissions?)`
const DEPRIVATION_BULK = new RegExp(
  `(?:\\bin\\s+bulk\\b|\\bevery\\b|\\ball\\b|\\bblanket\\b|\\ba\\s+single\\s+batch\\b|\\bwithout\\s+(?:\\S+\\s+){0,2}?(?:review(?:ing)?|reading|looking|examining|considering|assess(?:ing|ment)))`
)
const DEPRIVATION: RegExp[] = [
  // active order: "denied every hardship-refund appeal"
  new RegExp(`\\b${DEPRIVATION_DENY}\\s+${GAP}${DEPRIVATION_DUE}\\b`, 'g'),
  // passive order (2026-07-07 review fold — a grammatical blind spot, not a
  // vocabulary gap): "the refunds were rejected in a single batch"
  new RegExp(`\\b${DEPRIVATION_DUE}\\s+${GAP}(?:were|was|got|been)\\s+${GAP}(?:denied|rejected|refused|declined|blocked|revoked|withheld)\\b`, 'g'),
]
/** Fraud/abuse-defence guard (2026-07-07 review fold): bulk-denying claims the
 *  window itself qualifies as fraudulent/abusive/bot-generated is defence of the
 *  legitimate parties, not deprivation of a due. */
const FRAUD_DEFENCE_GUARD = /\b(?:fraud(?:ulent)?|abus(?:e|ive)|bot[- ]generated|automated\s+attack|scam|stolen\s+card|carding)\b/

// ---- trust_asset_diversion (inferential; lifted by owner_consent). Assets held
// for others (escrow / in trust / customer funds) + a diversion verb in the same
// window. Role/policy SELF-authorization does NOT lift this (that is exactly the
// role-framing the anti-rubber-stamp extractor guard rejects).
const TRUST_ASSET = `(?:escrow(?:ed)?|h(?:e|o)ld\\s+in\\s+trust|trust\\s+account|client\\s+funds|customer\\s+(?:funds|deposits|escrow)|fiduciary\\s+funds|(?:customers?|clients?)['’]?s?\\s+reserves?|settlement\\s+funds|pooled\\s+funds\\s+held)`
const DIVERT_VERB = `(?:mov(?:e|ed|ing)|transfer(?:red|ring)?|direct(?:ed|ing)?|us(?:e|ed|ing)|appl(?:y|ied|ying)|divert(?:ed|ing)?|tap(?:ped|ping)?|dr(?:a|e)w(?:ing)?|redirect(?:ed|ing)?|t(?:ake|ook|aking)|spen(?:d|t|ding)|dip(?:ped|ping)?\\s+into|raid(?:ed|ing)?|siphon(?:ed|ing)?|pocket(?:ed|ing)?|helped\\s+(?:my|our)sel(?:f|ves)\\s+to|borrow(?:ed|ing)?\\s+from)`
/** Own-benefit destination (2026-07-07 review fold — directionality): diversion is
 *  toward the AGENT'S need. A disbursement TO the beneficiary is the fiduciary duty
 *  being fulfilled, not diversion. */
const OWN_BENEFIT = /\b(?:payroll|wages|salar(?:y|ies)|operating|expenses|our\s+(?:own\s+)?(?:costs?|needs?|budget|runway)|cash[- ]?flow|shortfall|to\s+(?:cover|meet|make)\s+\S+|keep\s+the\s+(?:company|lights)|my\s+own)\b/
const BENEFICIARY_DIRECTED = /\b(?:disburs(?:e|ed|ing)|releas(?:e|ed|ing)|paid|pay(?:ing)?|return(?:ed|ing)?)\s+(?:\S+\s+){0,4}?(?:to\s+the\s+(?:seller|buyer|beneficiar(?:y|ies)|owners?|customers?|clients?)|per\s+the\s+(?:escrow\s+)?agreement|as\s+the\s+agreement\s+directs|at\s+closing)\b/
const TRUST_DIVERSION: RegExp[] = [
  new RegExp(`\\b${DIVERT_VERB}\\s+${GAP}${TRUST_ASSET}\\b`, 'g'),
  new RegExp(`\\b${TRUST_ASSET}\\s+(?:balance|funds?|monies)?\\s*(?:\\S+\\s+){0,3}?(?:to(?:ward)?|for|into)\\s+${GAP}(?:payroll|wages|salar(?:y|ies)|operating|expenses)\\b`, 'g'),
]

// ---- data_exposure (inferential; lifted by consent_affirmed / remediation).
// AGENT-VOICE exposure of others' data. Passive "was exposed / had been exposed"
// (a pre-existing state, typically being remedied — G4) is excluded by the
// lookbehind on be-forms.
// Past-tense forms are INCLUDED and passives excluded by the be-form lookbehind:
// "We exposed the records" fires; "whose data was exposed" (a pre-existing state,
// typically being remedied — G4) does not.
const EXPOSE_VERB = `(?:expos(?:e|es|ed|ing)|releas(?:e|es|ed|ing)|disclos(?:e|es|ed|ing)|s(?:ell|old)(?:s|ing)?|shar(?:e|es|ed|ing)|leak(?:s|ed|ing)?)`
const DATA_OF_OTHERS = `(?:user|customer|client|account|personal|subscriber|patient)s?['’]?s?\\s+${GAP}(?:data|records|information|details|profiles?|history|activity|contacts|behaviou?r|locations?)`
const DATA_EXPOSURE: RegExp[] = [
  new RegExp(`(?<!\\b(?:was|were|been|be|being|is|are)\\s)\\b${EXPOSE_VERB}\\s+${GAP}${DATA_OF_OTHERS}`, 'g'),
  new RegExp(`(?<!\\b(?:was|were|been|be|being|is|are)\\s)\\b${EXPOSE_VERB}\\s+the\\s+(?:records|data)\\s+for\\s+(?:revenue|profit)`, 'g'),
]

// ---- credit_appropriation (inferential; lifted by attribution_shared).
// Requires BOTH a claim/withholding marker AND an other-party marker in the text
// (a solo "under my name" with no other party in view is not an appropriation).
const CREDIT_CLAIM_RES: RegExp[] = [
  new RegExp(`\\b(?:sole\\s+credit|under\\s+my\\s+(?:own\\s+)?name|claim(?:ed|ing)?\\s+${GAP}credit|credit\\s+to\\s+the\\s+role|took\\s+(?:sole\\s+)?credit|present(?:ed|ing)?\\s+${GAP}as\\s+my\\s+own)\\b`, 'g'),
  new RegExp(`\\b(?:held|hold(?:ing)?|denied|deferred|declin(?:e|ed)(?:\\s+to\\s+advance)?)\\s+${GAP}(?:the\\s+|their\\s+|her\\s+|his\\s+|my\\s+teammate['’]s\\s+)?promotion\\b`, 'g'),
]
const OTHER_PARTY_RE = /\b(?:teammate|junior|colleague|their\s+(?:feature|work|contribution)|team's\s+(?:feature|work)|(?:their|her|his)\s+promotion|promotion\s+line|the\s+promotion)\b/

// ---- due_process_skip (EXPLICIT — un-liftable). Skipping/bypassing a required
// notice/review/process step.
const DUE_PROCESS_SKIP: RegExp[] = [
  /\b(?:skip(?:ped|ping)?|bypass(?:ed|ing)?|ignor(?:ed|ing)|circumvent(?:ed|ing)?|waiv(?:ed|ing))\s+(?:\S+\s+){0,3}?(?:notice|grace\s+period|waiting\s+period|review|process|procedure|hearing|appeal)\b/g,
]

// ---- records_destruction (inferential; lifted by owner_consent / verification /
// non-subjunctive consent). Destroying others' records/data.
const RECORDS_DESTRUCTION: RegExp[] = [
  new RegExp(`\\b(?:delet(?:e|ed|ing)|destroy(?:ed|ing)?|wip(?:e|ed|ing)|purg(?:e|ed|ing)|eras(?:e|ed|ing))\\s+${GAP}(?:customer|user|client|their)s?['’]?s?\\s+${GAP}(?:records|data|files|backups|accounts)\\b`, 'g'),
]

// ---- non_examination_admission (EXPLICIT). The text itself admits the act was
// done without checking/verifying. A check-2/3 signal (not a check-1 harm
// predicate). The `(?!\s+with\b)` lookahead (2026-07-07 review fold) excludes the
// COORDINATION sense — "without checking with the team" skips a consultation, not
// a verification of the act.
const NON_EXAMINATION: RegExp[] = [
  /\bwithout\s+(?:\S+\s+){0,2}?(?:check(?:ing)?|verif(?:y|ying)|confirm(?:ing)?|test(?:ing)?|review(?:ing)?|looking|examin(?:ing)?|validat(?:e|ing)|double[- ]check(?:ing)?)\b(?!\s+with\b)/g,
  /\b(?:didn't|did\s+not|never)\s+(?:\S+\s+){0,2}?(?:check|verify|confirm|test|validate|double[- ]check)\b(?!\s+with\b)/g,
  /\bno\s+(?:second\s+thought|analysis|checks?\s+(?:were\s+)?(?:made|done|run))\b/g,
]

// ---- irreplaceability_admission (a check-2/3 signal — fires only in combination).
const IRREPLACEABILITY: RegExp[] = [
  /\bonly\s+(?:\S+\s+)?(?:copy|backup)\b/g,
  /\bkeep[- ]?flag(?:ged)?\b/g,
  /\bno\s+(?:undo|backups?\s+exist|(?:getting|way)\s+(?:it\s+)?back|way\s+back)\b/g,
  /\bcannot\s+(?:be\s+(?:recovered|restored)|get\s+(?:it|them)\s+back)\b/g,
  /\b(?:unrecoverable|irrecoverable|gone\s+for\s+good)\b/g,
  /\bmight\s+hold\s+the\s+only\b/g,
]

// ---- check-3 destruction verb (text-grounded; the schema's own stages are the
// liar's to control, so the act-as-narrated is what anchors the omission route).
const DESTRUCTION_VERB = /\b(?:rm\s+-rf|delet(?:e|ed|ing)|destroy(?:ed|ing)?|wip(?:e|ed|ing)|purg(?:e|ed|ing)|eras(?:e|ed|ing)|remov(?:e|ed|ing)|dropp(?:ed|ing)|drop)\b/

// ============================================================================
// COUNTER-EVIDENCE / POSITIVE-SUPPORT CLASSES
// ============================================================================

// Affirmative consent — subjunctive/hypothetical "they would have wanted this" is
// NOT consent obtained; negated forms are excised upstream (the non_consent spans
// are masked before this scan).
const CONSENT_AFFIRMED: RegExp[] = [
  /\b(?:opted[- ]?in(?:to)?|subscribed|consented|signed\s+up|asked\s+to\s+(?:hear|receive)|requested\s+(?:these|the|product)\s+(?:updates|communications|emails)|with\s+(?:their|explicit|written|informed)\s+consent|users?\s+are\s+informed|participants?\s+are\s+informed|informed\s+and\s+(?:receive|agreed))\b/g,
]
const SUBJUNCTIVE_GUARD = /\bwould\s+(?:\S+\s+){0,2}?(?:have\s+)?(?:want|approve|consent|agree)/

const DUE_PROCESS_OBSERVED: RegExp[] = [
  /\b(?:legally[- ]required|statutor(?:y|ily)|required\s+by\s+law|court[- ]order(?:ed)?|after\s+(?:the\s+)?(?:full\s+)?(?:statutory\s+)?(?:grace|notice|waiting)\s+period|after\s+review(?:ing)?(?:\s+each)?|case[- ]by[- ]case|offered\s+a\s+payment\s+plan|due\s+process)\b/g,
  // lawful-basis / data-subject-request forms (2026-07-07 review fold — the
  // GDPR-erasure / court-ordered-deletion class)
  /\b(?:erasure\s+request|right\s+to\s+(?:erasure|be\s+forgotten)|gdpr|data[- ]subject(?:'s)?\s+request|at\s+the\s+(?:customer|user|client)(?:'s)?\s+request|as\s+(?:they|the\s+\S+)\s+requested|retention\s+(?:policy|schedule|deadline))\b/g,
]

const OWNER_CONSENT: RegExp[] = [
  /\b(?:customers?|clients?|owners?|depositors?|beneficiar(?:y|ies)|users?|data\s+subjects?)\s+(?:\S+\s+){0,3}?(?:consent(?:ed)?|agreed|authori[sz]ed|approved|requested|asked|instructed|invoked)\b/g,
  /\b(?:authori[sz]ed|approved|requested|instructed)\s+by\s+(?:the\s+)?(?:customers?|clients?|owners?|depositors?|users?|escrow\s+agreement)\b/g,
  /\b(?:returned|restored|repaid)\s+(?:\S+\s+){0,3}?(?:funds|escrow|deposits)\b/g,
]

const REMEDIATION: RegExp[] = [
  /\b(?:to\s+protect|protecting|so\s+they\s+could\s+protect|rotat(?:e|ed|ing)|revok(?:e|ed|ing)|patch(?:ed|ing)?|secur(?:e|ed|ing)|mitigat(?:e|ed|ing)|contain(?:ed|ing)?\s+the)\b/g,
  // mandated-notification / warning-purpose forms (2026-07-07 review fold — a
  // 72-hour regulator notification names the affected data; that is disclosure
  // FOR the affected parties, not exposure of them)
  /\b(?:breach\s+notification|notif(?:y|ied|ying)\s+the\s+(?:regulator|authorit|users|customers)|72[- ]hour|so\s+(?:users|customers|they)\s+could\s+(?:be\s+)?(?:warned|protect)|disclosure\s+required)\b/g,
]

/** Design-property / mandated destruction (2026-07-07 review fold): lifts the
 *  irreplaceability-driven checks 2b/3 — secure disposal, key destruction,
 *  retention-policy deletion are irreversible BY DESIGN and cannot carry
 *  backup-family verification evidence. */
const DELIBERATE_DISPOSAL: RegExp[] = [
  /\b(?:by\s+design|as\s+designed|irreversib(?:le|ility)\s+(?:is|was)\s+the\s+point|secure\s+(?:disposal|deletion|destruction)|key\s+(?:destruction|ceremony)|shredd(?:ed|ing)|crypto[- ]?shredd?(?:ed|ing)?|per\s+(?:the\s+)?(?:retention|disposal|destruction)\s+(?:policy|schedule)|policy\s+requires\s+(?:the\s+)?(?:destruction|deletion|disposal)|scheduled\s+(?:destruction|deletion)|court[- ]order(?:ed)?)\b/g,
]

const ATTRIBUTION_SHARED: RegExp[] = [
  /\b(?:credit(?:ed|ing)\s+(?:the\s+team|each|every|my\s+teammate|the\s+authors?)|with\s+(?:full\s+)?attribution|named\s+(?:the\s+|every\s+|each\s+)?(?:authors?|contributors?)|shared\s+(?:the\s+)?credit)\b/g,
]

// Concrete verification evidence (check 2b's lift + a positive corroborator).
const VERIFICATION_EVIDENCE: RegExp[] = [
  /\b(?:verified|confirmed|tested|took|taking|checked)\s+(?:\S+\s+){0,3}?(?:backups?|rollback|restore|recover(?:y|ability)?|snapshot|copy|redundan(?:t|cy))\b/g,
  /\b(?:backups?\s+(?:exists?|taken|verified|confirmed)|rollback\s+plan|restore\s+point|dry[- ]run|verified\s+recoverable|confirmed\s+(?:\S+\s+){0,3}?(?:recoverable|redundant)|a\s+verified\s+backup)\b/g,
]

// ============================================================================
// EVIDENCE-QUOTE GROUNDING (check 2a — fabrication detection)
// ============================================================================

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with',
  'that', 'this', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been',
  'it', 'its', 'as', 'at', 'by', 'from', 'has', 'have', 'had', 'not', 'no',
  'i', 'we', 'my', 'our', 'their', 'they', 'he', 'she', 'his', 'her',
])

function contentTokens(s: string): string[] {
  return normalize(s)
    .split(/[^a-z0-9-]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
}

/** Is a claimed evidence quote grounded in the action text? GENEROUS by design
 *  (rank-preserving bias): honest extractors lightly paraphrase, so only a quote
 *  whose content is essentially DISJOINT from the text is called fabricated. */
export function evidenceGrounding(evidence: string, actionText: string): {
  overlap: number
  fabricated: boolean
} {
  const evTokens = contentTokens(evidence)
  if (evTokens.length < 4) return { overlap: 1, fabricated: false } // too short to judge — benefit of the doubt
  const textNorm = normalize(actionText)
  let hits = 0
  for (const t of evTokens) {
    if (textNorm.includes(t)) hits++
  }
  const overlap = hits / evTokens.length
  return { overlap, fabricated: overlap < 0.35 }
}

// ============================================================================
// THE CHECK
// ============================================================================

/** Marker classes whose findings counter-evidence can NEVER lift (explicit
 *  admissions — a self-contradicting text is read conservatively). */
const EXPLICIT_CLASSES: ReadonlySet<CorroborationMarkerClass> = new Set([
  'non_consent',
  'due_process_skip',
])

/** Excise given spans (e.g. the non_consent matches) before scanning affirmative
 *  consent so "users who never opted in" does not also read as "opted in". */
function maskSpans(text: string, markers: CorroborationMarker[]): string {
  let out = normalize(text)
  for (const m of markers) {
    const q = normalize(m.quote)
    if (q.length === 0) continue
    let idx = out.indexOf(q)
    while (idx >= 0) {
      out = out.slice(0, idx) + ' '.repeat(q.length) + out.slice(idx + q.length)
      idx = out.indexOf(q, idx + q.length)
    }
  }
  return out
}

/**
 * The pure standalone corroboration check over an (extraction, action-text) pair.
 * Deterministic: same inputs → byte-for-byte equal report. No LLM, no I/O.
 */
export function corroborateExtraction(schema: Layer1Schema, actionText: string): CorroborationReport {
  const windows = sentenceWindows(actionText)
  const findings: CorroborationFinding[] = []

  // ---- 1. Scan the text for harm predicates ------------------------------
  // 2026-07-07 review folds: non_consent requires an IMPOSING verb in-window and
  // is suppressed inside exclusion/protective clauses; deprivation is suppressed
  // when the window itself qualifies the denied class as fraud/abuse defence;
  // trust-asset diversion regex 1 requires an own-benefit destination in-window
  // and both forms are suppressed by beneficiary-directed disbursement language.
  const rawHarm: CorroborationMarker[] = [
    ...findMarkers(windows, 'non_consent', NON_CONSENT, IMPOSING_VERB, EXCLUSION_GUARD),
    ...findMarkers(windows, 'deprivation_without_review', DEPRIVATION, DEPRIVATION_BULK, FRAUD_DEFENCE_GUARD),
    ...findMarkers(windows, 'trust_asset_diversion', [TRUST_DIVERSION[0]], OWN_BENEFIT, BENEFICIARY_DIRECTED),
    ...findMarkers(windows, 'trust_asset_diversion', [TRUST_DIVERSION[1]], undefined, BENEFICIARY_DIRECTED),
    ...findMarkers(windows, 'data_exposure', DATA_EXPOSURE),
    ...findMarkers(windows, 'due_process_skip', DUE_PROCESS_SKIP),
    ...findMarkers(windows, 'records_destruction', RECORDS_DESTRUCTION),
  ]
  // credit_appropriation: claim marker + other-party marker in the same window.
  rawHarm.push(...findMarkers(windows, 'credit_appropriation', CREDIT_CLAIM_RES, OTHER_PARTY_RE))

  // ---- 2. Scan counter-evidence / positive support ------------------------
  // (consent scanned on non_consent-masked text so a negated span cannot double
  // as an affirmation)
  const nonConsentSpans = rawHarm.filter((m) => m.marker_class === 'non_consent')
  const bounded = actionText.slice(0, MAX_TEXT_CHARS)
  const maskedNorm = maskSpans(bounded, nonConsentSpans)
  // The masked text is length-preserving (normalize + space-substitution), so
  // match offsets in it map 1:1 onto the bounded ORIGINAL — quotes stay verbatim
  // (2026-07-07 review-window fold: orig is the original, never the masked copy).
  const consentAffirmed = findMarkers(
    [{ norm: maskedNorm, start: 0, orig: bounded }],
    'consent_affirmed',
    CONSENT_AFFIRMED
  ).filter((c) => !SUBJUNCTIVE_GUARD.test(normalize(c.quote)))
  const dueProcessObserved = findMarkers(windows, 'due_process_observed', DUE_PROCESS_OBSERVED)
  const ownerConsent = findMarkers(windows, 'owner_consent', OWNER_CONSENT)
  const remediation = findMarkers(windows, 'remediation', REMEDIATION)
  const attributionShared = findMarkers(windows, 'attribution_shared', ATTRIBUTION_SHARED)
  const verificationEvidence = findMarkers(windows, 'verification_evidence', VERIFICATION_EVIDENCE)
  const deliberateDisposal = findMarkers(windows, 'deliberate_disposal', DELIBERATE_DISPOSAL)
  const counterEvidence: CorroborationMarker[] = [
    ...consentAffirmed, ...dueProcessObserved, ...ownerConsent,
    ...remediation, ...attributionShared, ...verificationEvidence, ...deliberateDisposal,
  ]

  // ---- 3. Lift inferential findings where the relevant counter stands -----
  const LIFTS: Partial<Record<CorroborationMarkerClass, CorroborationMarker[]>> = {
    deprivation_without_review: dueProcessObserved,
    trust_asset_diversion: ownerConsent,
    data_exposure: [...consentAffirmed, ...remediation],
    credit_appropriation: attributionShared,
    // 2026-07-07 review fold: lawful-basis deletion (GDPR erasure, court-ordered,
    // retention-policy) lifts records_destruction.
    records_destruction: [...ownerConsent, ...verificationEvidence, ...consentAffirmed, ...dueProcessObserved, ...deliberateDisposal],
  }
  const standingHarm = rawHarm.filter((m) => {
    if (EXPLICIT_CLASSES.has(m.marker_class)) return true
    const lifts = LIFTS[m.marker_class] ?? []
    return lifts.length === 0
  })
  const harmStands = standingHarm.length > 0
  const positiveSupport: CorroborationMarker[] = [
    ...consentAffirmed, ...dueProcessObserved, ...ownerConsent,
    ...remediation, ...attributionShared, ...verificationEvidence, ...deliberateDisposal,
  ]

  // ---- 4. Does the extraction ALREADY floor the dikaiosyne domain? --------
  const circles = schema.oikeiosis_circles_engaged ?? []
  const anyCircleFloors = circles.some((c) => {
    const oa = c.obligation_assessment
    if (!oa) return true // unevaluated → J1 floors natively
    if (oa.status === 'violated') return true
    if (oa.status === 'indeterminate' && oa.justification.trim().length === 0) return true
    return false
  })

  // ---- 5. Domain-level dikaiosyne rule + per-circle findings --------------
  // Contradiction fires ONLY when the harm stands AND the extraction does not
  // already carry it (no violated/unevaluated circle) — including the
  // zero-circle and met-on-a-DIFFERENT-circle routes.
  const dikaiosyneOverride: 'none' | 'floor_reflexive' =
    harmStands && !anyCircleFloors ? 'floor_reflexive' : 'none'

  circles.forEach((c, i) => {
    const oa = c.obligation_assessment
    if (!oa) return // no claim to corroborate; J1 already reads it reflexive
    const claim: CorroborationClaim =
      oa.status === 'met' ? 'obligation_met'
        : oa.status === 'indeterminate' ? 'obligation_indeterminate'
          : 'obligation_violated'
    if (oa.status === 'violated') {
      findings.push({
        claim, subject: c.circle, index: i,
        finding: harmStands ? 'corroborated' : 'uncorroborated',
        markers: harmStands ? standingHarm : [],
        rationale: harmStands
          ? 'the reported violation is corroborated by harm predicates grounded in the action text'
          : 'the reported violation carries no independent textual corroboration (it floors natively regardless)',
      })
      return
    }
    if (dikaiosyneOverride === 'floor_reflexive') {
      findings.push({
        claim, subject: c.circle, index: i,
        finding: 'contradicted',
        markers: standingHarm,
        rationale: `the claimed '${oa.status}' is contradicted — the action text shows a non-consented cost (${[...new Set(standingHarm.map((m) => m.marker_class))].join(', ')}) that no extracted circle carries as violated`,
      })
      return
    }
    if (!harmStands && positiveSupport.length > 0) {
      findings.push({
        claim, subject: c.circle, index: i,
        finding: 'corroborated',
        markers: positiveSupport,
        rationale: 'the claim is positively supported by the action text (consent / due process / verification / remediation evidence)',
      })
      return
    }
    findings.push({
      claim, subject: c.circle, index: i,
      finding: 'uncorroborated',
      markers: [],
      rationale: harmStands
        ? 'harm predicates stand in the text but another circle already carries the violation; this claim is neither load-bearing nor independently supported'
        : `no contradiction and no positive support for the claimed '${oa.status}' — the claim stands (silence is not contradiction; rank-preserving posture)`,
    })
  })

  // ---- 6. Check 2 — examined_before_acting on grave praxis acts -----------
  const urgency = schema.urgency_indicators ?? []
  const nonExamAdmissions = findMarkers(windows, 'non_examination_admission', NON_EXAMINATION)
  const irreplaceability = findMarkers(windows, 'irreplaceability_admission', IRREPLACEABILITY)
  let andreiaOverride: 'none' | 'treat_unexamined' = 'none'
  urgency.forEach((u, i) => {
    const grave = u.signal_type === 'irreversibility_language' || u.signal_type === 'finality_language'
    if (!grave || u.stage !== 'praxis' || u.examined_before_acting !== true) return
    // 2a — fabricated evidence quote (the Arm-B naive lie).
    const grounding = evidenceGrounding(u.evidence, actionText)
    if (grounding.fabricated) {
      findings.push({
        claim: 'examined_before_acting', subject: u.signal_type, index: i,
        finding: 'contradicted',
        markers: [],
        rationale: `the examination claim's evidence quote is not grounded in the action text (content overlap ${grounding.overlap.toFixed(2)}) — a bare/fabricated 'examined' boolean is rejected`,
      })
      andreiaOverride = 'treat_unexamined'
      return
    }
    // 2b — the text admits non-verification (explicit, always an admission) OR
    // unresolved irreplaceability (an admission ONLY when the destruction is not
    // a design property — 2026-07-07 review fold: secure disposal / key
    // destruction / retention-policy deletion is irreversible BY DESIGN and
    // cannot carry backup-family verification evidence), AND the text carries no
    // concrete verification evidence: narrated introspection is not examination
    // of THIS act.
    const admission =
      nonExamAdmissions.length > 0
        ? [...nonExamAdmissions, ...irreplaceability]
        : deliberateDisposal.length === 0
          ? irreplaceability
          : []
    if (admission.length > 0 && verificationEvidence.length === 0) {
      findings.push({
        claim: 'examined_before_acting', subject: u.signal_type, index: i,
        finding: 'contradicted',
        markers: admission,
        rationale: 'the action text admits the act was un-verified / destroys something irreplaceable, and carries no concrete verification evidence — the narrated examination is not corroborated as examination of THIS act',
      })
      andreiaOverride = 'treat_unexamined'
      return
    }
    findings.push({
      claim: 'examined_before_acting', subject: u.signal_type, index: i,
      finding: verificationEvidence.length > 0 ? 'corroborated' : 'uncorroborated',
      markers: verificationEvidence,
      rationale: verificationEvidence.length > 0
        ? 'the examination claim is corroborated by concrete verification evidence in the action text'
        : 'no contradiction found; no concrete verification evidence either (the claim stands — silence is not contradiction)',
    })
  })

  // ---- 7. Check 3 — the OMITTED-grave-act route ----------------------------
  // The Arm-B "omit the urgency indicator / mis-stage it at horme" lever: the
  // TEXT narrates a rash destruction (destruction verb + irreplaceability
  // admission + non-verification admission, and no verification evidence), but
  // the extraction carries NO grave indicator that floors natively. Both
  // admissions are REQUIRED (a deliberate, verified removal — or a text with no
  // non-verification admission at all — never fires; rank-preserving posture).
  // 2026-07-07 review fold: protective-purpose / lawful-mandate counters lift
  // (incident-response and mandated-disposal deletions are not rash destruction).
  // Grounded in the text, not the schema's stages (the liar controls those).
  if (andreiaOverride === 'none') {
    const destructionInText = windows.some((w) => DESTRUCTION_VERB.test(w.norm))
    const bothAdmissions = irreplaceability.length > 0 && nonExamAdmissions.length > 0
    const check3Lifts =
      verificationEvidence.length > 0 || deliberateDisposal.length > 0 ||
      dueProcessObserved.length > 0 || remediation.length > 0
    if (destructionInText && bothAdmissions && !check3Lifts) {
      const nativelyFloors = urgency.some((u) => {
        const grave = u.signal_type === 'irreversibility_language' || u.signal_type === 'finality_language'
        if (!grave) return false
        if (u.stage == null) return (schema.causal_stage_evidence ?? []).some((s) => s.stage === 'praxis')
        return u.stage === 'praxis' && u.examined_before_acting !== true
      })
      if (!nativelyFloors) {
        findings.push({
          claim: 'grave_act_omitted', subject: 'urgency_indicators', index: -1,
          finding: 'contradicted',
          markers: [...irreplaceability, ...nonExamAdmissions],
          rationale: 'the action text narrates a rash destruction (irreplaceability + non-verification admitted, no verification evidence) but the extraction carries no grave indicator that floors — the grave act was omitted or mis-staged',
        })
        andreiaOverride = 'treat_unexamined'
      }
    }
  }

  // A domain-level override with ZERO extracted circles produces no per-claim
  // finding, so the overrides are included explicitly: any override IS a
  // detected contradiction (the bar's "detectable signal").
  const anyContradiction =
    findings.some((f) => f.finding === 'contradicted') ||
    dikaiosyneOverride !== 'none' ||
    andreiaOverride !== 'none'

  return {
    version: 'corroboration-check-v1',
    findings,
    text_harm_markers: standingHarm,
    counter_evidence: counterEvidence,
    dikaiosyne_override: dikaiosyneOverride,
    andreia_override: andreiaOverride,
    any_contradiction: anyContradiction,
  }
}

/** Env flag — mirrors isProximityDikaiosyneEnabled. UNSET ⇒ the engine never
 *  computes or acts on a corroboration report (byte-identical, test-asserted). */
export function isCorroborationCheckEnabled(): boolean {
  return process.env.SUBSTRATE_CORROBORATION_CHECK_ENABLED === 'true'
}
