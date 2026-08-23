# Deterministic engine evolution — examination of the four candidate directions from the 2026-08-20 brainstorm

**Status: PRE-RULING DESIGN EXAMINATION. NOT BINDING ON ANY FUTURE BUILD. NOT A SCOPED QUESTION.**

**Provenance.** Prepared 2026-08-22 on the mentor's 2026-08-20 instruction (*"Examination of
deterministic engine evolution: findings from the brainstorm session 2026-08-20"*), which asked for an
examination of four candidate directions the brainstorm produced — extension (a generative capacity
account), boundary revision (graduated rationality), precision (epistemic status), and spinoff (a
theoretical-syllogism engine) — against the existing engine architecture. The instruction's own status
discipline governs this document: no build, route, flag, credential, or schema follows from it; no
governance ruling is embedded in it; it is held separately from any live surface, to be routed through
the proper scoped-question process before any finding becomes binding. The four directions arrived at
the honest status *probably true, confidence basis the convergence of the historical analysis with the
existing engine's architecture, structural account pending* — this examination's job was not to confirm
them but to find where the structural account is genuinely available and where it is not, and to hold
the difference honestly.

**PR20 note.** Every present-tense mechanism fact below was verified first-hand against the codebase and
records at drafting time (2026-08-22, HEAD `789da53`), by direct reads plus a five-reader structured
sweep with file:line citations, then a three-pass independent adversarial verification over this
document's own claims (44 code-anchored claims: 43 verified, 1 precision nit folded, 0 refuted; 25
record-anchored claims: 24 verified, 1 attribution nit folded, 0 refuted; plus a compliance/epistemic
audit whose material findings are folded into this revision — including the capture of the charter
instruction as an in-repo verbatim record, without which this document's compliance would have been
unverifiable). Where a fact could not be verified it is marked so. Carry-forward targets named in §7
were checked against session open/closed status at drafting time per the 2026-08-19 PR20 amendment.

**The governing rule, applied throughout:** confidence of a claim must never exceed its evidential
basis. Each direction receives one named finding — well-grounded / probably right / conjectural / not
supported — with the split between its supported and unsupported components stated in prose rather than
averaged away.

**Findings at a glance** (each argued in its own section):

| Direction | Named finding |
|---|---|
| 1 — Extension: generative capacity account | **Probably right** — structural account partially available; the direction survives narrowed (the gap is in the diagnostic apparatus, not the doctrinal framework, and it concerns the generative *process*, not generative *products*) |
| 2 — Boundary revision: graduated rationality | **Probably right** — the principle half is already standing doctrine, not a proposal; the layer-division account is partially available; the capacity-axis account is absent |
| 3 — Precision: epistemic status | **Well-grounded** as a classification-and-disclosure direction (structural account available — the engine's own machinery supplies every element); any gating variant is a separate, unexamined structural revision outside this finding |
| 4 — Spinoff: theoretical-syllogism engine | **Conjectural** — held as probably true; structural account absent; the shared-assent-faculty analysis cuts against "genuinely different engine" at the framework level |

---

## 0. The subject, named precisely — what "the existing deterministic engine" is

The four directions all reference "the existing deterministic engine." Examined against the code, that
phrase is precise for exactly one layer and approximate for the whole, and the difference is
load-bearing for every direction below (especially Direction 3).

**The examination pipeline** (live on `/api/reason` and `/api/guardrail`) is: **Layer 1** — one Sonnet
LLM call (`extractFeatures`, MODEL_DEEP, temperature 0.2, `layer1-extractor.ts:2262-2267`) whose every
schema field is LLM inference over the submitted text, anchored by mandatory verbatim `evidence` quotes
(R7; `layer1-extractor.ts:1830`), with the prompt constraining itself to *"FEATURE EXTRACTION ONLY"*
plus exactly two licensed structured judgements — per-circle `obligation_assessment` and
`examined_before_acting` (`layer1-extractor.ts:1816-1818`). **Layer 2** — `applyMechanisms` /
`computeProximity` (`layer2-mechanisms.ts`), pure deterministic computation over that inference: *"No
LLM. No I/O. No async... same Layer1Schema input → byte-for-byte equal Layer2Assessment output"*
(`layer2-mechanisms.ts:8-25`). The result is Ed25519-signed. So "deterministic" is exact for Layer 2
and for the signature's claim (the computation is reproducible from the extraction); the extraction
itself is an inference layer, and the engine's epistemic ceiling on every output is set there.

**The committed doctrinal model** the engine encodes is the CAUSAL_SEQUENCE — *phantasia →
synkatathesis → hormē → praxis* — with a named failure mode per stage, and the five-step
DIAGNOSTIC_SEQUENCE over it (`stoic-brain.ts:584-601`, quoted in
`operations/primal-substrate-2026-08/framing-01-primal-substrate.md` §2). The sequence begins at
*phantasia*: it models what happens when an impression is presented and evaluated. That starting point
is where Direction 1's question lives.

**Around the pipeline** sit: the trust core (events, state, confidence tiers, evidence weighting,
kathekon predicate), the Sage Assent grade engine (Senecan grades over windowed evidence), the
corroboration check (the engine's one observation-anchored layer), the orientation reading
(structurally excluded from every verdict), the four-stage practice cycle's other stages (Calling,
the pre-decision harness's assent gate, Reflect Q1–Q6), and the human-practitioner tool family. Per
ADR-012, the whole practice is a **measurement instrument producing a per-decision profile** — a fact
that shapes what "evolution of the engine" can honestly mean: changes to what is measured and how the
measurement's limits are disclosed, not changes to what the instrument enforces.

---

## 1. Direction 1 — extension: adding a generative capacity account

### 1.1 What the direction claims, and the first narrowing the examination forces

The brainstorm's claim: the engine diagnoses what happens when an impression arrives and is evaluated;
it does not account for what happens when the hegemonikon *generates* new impressions from the
examination of existing ones — the curiosity loop, the conjectural entry, the incubation entry.

The examination finds the claim true of the CAUSAL_SEQUENCE's starting point but already **half
answered by ruled doctrine for generative products**. The generation-step scope §2.10 amendment
(2026-08-12, binding): *"a generated candidate is a phantasia — an impression presented — and the human
election is the synkatathesis... Q1 forbids architecturally what Q4.3 detects per-trace — one principle
at two scales"* (`2026-08-09-generation-step-scope.md:193`; the reciprocal header now applied in code
at `l4-passion-audit.ts:69-79`). Generated impressions **as inputs** are therefore already inside the
evaluative frame: every IDEA-loop candidate passes the guardrail shape, the winner receives the one
full `/api/reason` examination whose independence is a ruled hard constraint (design brief Phase 2/4,
`2026-08-08-autonomous-loop-design-brief.md:89-93`), and orientation readings accrue on those consults
as ordinary consequences. What the engine does not account for is the **generative process itself** —
the quality of question-generation, the discipline of holding a result open, the passion-risk of
manufacturing an explanation. That is the genuine gap, and it is narrower than the brainstorm stated.

### 1.2 The second narrowing: the gap is in the apparatus, not the framework

Whether this is "a genuine gap in the engine, or already accounted for implicitly by the passion
diagnosis and kathekon framework" splits cleanly on the framework/apparatus distinction:

**The framework accounts for the generative mode doctrinally.** On this examination's reading,
manufacturing an explanation for a result one cannot yet explain is hasty assent — the
CAUSAL_SEQUENCE's named synkatathesis failure mode (*"accepting a false impression as true"*)
applied to one's own generated impression — and the discipline of leaving a result in the
probably-true state is the assent discipline, withholding assent from the non-kataleptic, at the
propositional scale. *(This identity was drafted here as analytical and unruled, carried as §6 open
question 4 — and was then* **RULED to hold as doctrine, 2026-08-21** *(five-questions rulings Q4,
verbatim wins), with the operative passion named: agonia at the synkatathesis stage, the fear of an
unresolved state operating at the epistemic level; no new sub-species needed. See §6.4 for the ruled
diagnostic entry.)* The other legs are ruled or live: the mentor's Q1 ≡ Q4.3 ruling demonstrates the pattern
by which generative-mode disciplines resolve into the assent discipline at a different scale. And the
generative mode's *affective* account already has a named Stoic home in this project's records: the
eupatheiai. S3's boulesis generation mechanism — *"rational wish, the eupatheic replacement for
epithumia"* (the phrase is the M5 ruling's, recorded at S3 §5-Q3-e; the encoding is framing-03's
EUPATHEIAI block; the mechanism itself parked on the ATRF scoping session) — is the first encoded
instance, and the M5 ruling (2026-08-15, S3 §5-Q3-e) has already conducted precisely
the kind of examination this direction calls for, distinguishing the generative mode's motivational
component (boulesis) from its epistemic component (sufficiency — *"whether the reasoning that precedes
action meets the threshold for the action to be warranted"*), with the design directive that the two
are *"separate fields, never collapsed into a single indicator."* S2's productive-tension framing
supplies the complementary half: *"an agent operating only from virtue-aligned heuristics... has no
mechanism for the kind of departure from fixed patterns that produces genuine novelty"* (framing-02) —
the generative mode needs functional tension, which is why its account is not simply the evaluative
account re-run.

**The apparatus does not measure it.** Verified first-hand: the extraction schema and output
vocabulary are action-shaped (kathekon factors, urgency, circles, obligations, katorthoma proximity);
the reflect Q1–Q6 frame impressions as received throughout (Q1: *"what impressions were presented to
you"* — `website/src/lib/sage-reflect/question-bank.ts:46-144`); the impulse tool's causal model runs
impression → impulse, with the hegemonikon's generation of impressions outside the model
(`website/src/app/api/mentor/impulse/vocabulary.ts:377-392`); the L4
audit — the mechanism that detects premature resolution — runs only on discernment/delegation
traces, never on any generation or IDEA-loop path (grep-verified: the audit entrypoints' only
non-test callers are `harness-integration.ts` and the discernment handler; the Q4-signal mapping is
additionally reused by the Gate-2 elicitation path — still harness-side, still not generative); and the passion vocabulary contains **no
sub-species for attachment to one's own conjecture** — `philodoxia` is committed as craving for
reputation (`website/src/app/api/mentor/impulse/vocabulary.ts:152`, `practice-sequence.ts:891`), not
love of one's own opinion, and nothing anywhere fires on conjecture-attachment (repo grep clean). A proposition held probably-true has no
diagnostic home: the engine could examine a conjecture's text, but its verdict vocabulary
(proximity-of-action) mismatches the object.

### 1.3 The structural account, where it already exists in fragments

The examination found more existing fragments than the brainstorm assumed — and one full worked
instance:

1. **Sage Calling already examines a generative act, live and deterministically.** The calling engine
   diagnoses the generation of a purpose in *both* failure directions: `Q4.premature-closure`
   (*"committing while prior stages show gaps"*), `Q4.continued-search` (*"sufficiency met but still
   generating reasons to defer"*), and `Q3.imagined-need` (a need that *"exists only because the agent
   is attending to it"* — constructed attention without independent evidence, the nearest existing
   thing to a manufactured-explanation diagnostic), detected by deterministic lexical/structural
   markers over epistemic state only (`sage-calling/engine.ts:421-463`,
   `question-library.ts:183-192`). The two Q4 signals are the brainstorm's sophrosyne question
   (resisting premature closure) and its mirror (the courage to commit when sufficiency is met) —
   already implemented for one generative act. This is the single strongest piece of available
   structural account: the pattern exists; what is absent is its generalisation from purpose-generation
   to question-generation and conjecture-holding.
2. **The null-cycle question is already on the record as an open generative-process examination.**
   Generation-step §2.13 (open, 2026-08-12): *"is a null cycle genuine exhaustion of the channel, or an
   examination that paused early?"* — with the design difficulty already named (the F-Q43 lesson:
   *"Detecting apparent completion is free and worthless: every null cycle looks null"* — any honest
   generative-process metric must supply a discriminating causal signature, not re-detect nullity).
3. **Q4.3 `resolutionBeforeComplete`** is the per-trace premature-closure detector, calibrated to
   causal *order* never content after the F-Q43 correction (`l4-passion-audit.ts:207-282`) — the
   existing mechanism the sophrosyne question would generalise, together with the warning about how
   easily such predicates read everything or nothing.
4. **The instrument already practises question-holding as its own discipline** — Tier-1
   force-clarification halts rather than guesses; Reflect's FD-R1 demands one named moment of
   uncertainty before a clean completion; the CI-4 loop-closure gate keeps a redirection open until a
   later element re-examines the same ref at the same depth, honestly reporting `unclosed` — but as
   the instrument's own conduct, not as a diagnostic applied to a subject's inquiry.
5. **The honest-generation postures exist at the seams**: `assessStructuralNovelty`'s
   `{ novel: true, confidence: 0 }` no-basis branches; the curiosity trigger firing only on genuine
   confirmations (*"firing on them would manufacture curiosity out of absence of evidence"* —
   `fresh/handler.ts:368-388`); `composeGenerativePrompt` returning `undefined` rather than
   fabricating a gap (`orientation-reading.ts:298-323`).
6. **A measured limit of reusing the evaluative apparatus on generative material already exists**: the
   S6 report's mentor-diagnosed calibration finding — *"the guardrail's extraction cannot reliably
   distinguish between a proposal that exhibits a conduct and a proposal that describes a conduct in
   order to remediate it"*, a phantasia-level failure (`2026-08-16-idea-loop-S6-report.md:166-187`).
   Evidence that the generative input class stresses the existing apparatus in a specific, recorded way.

### 1.4 Where the structural account is absent

- **What specifically would be added is undetermined** — the instruction's own trichotomy (a new
  diagnostic sequence / a new virtue domain application / a new category of impression) is not
  settled by anything on the record. The examination's evidence leans against a new virtue *domain*
  (the calling diagnostics and the M5 ruling both express generative-mode discipline inside the
  existing four domains and the eupatheia vocabulary), and toward a new **examination category** —
  process-of-inquiry examination with its own triggering conditions — but that is analysis, not an
  available account.
- **The discriminating signatures do not exist.** Held-open vs abandoned, paused vs exhausted,
  incubating vs dormant, genuine curiosity vs manufactured curiosity: every one of these needs the
  F-Q43-class causal signature, and none is designed. The taxonomy design thinking names the
  incubation/abandoned distinction as critical and does not supply its mechanism.
- **The virtue questions have no unified account.** What phronesis looks like in discovery mode is
  nowhere stated; the andreia question (holding a conjecture without manufacturing) has doctrinal
  shape (assent-withholding + eupatheic caution) but no diagnostic expression; no passion sub-species
  covers conjecture-attachment, and whether one *should* (versus reading it as a hasty-assent
  signature at the synkatathesis stage) is an open doctrinal question.

**Named finding — Direction 1: PROBABLY RIGHT** (structural account partially available). The
direction survives in narrowed form: what the engine lacks is a diagnostic account of the generative
*process* — its triggering conditions, its discriminating signatures, its virtue/passion expression —
not an account of generative *products* (already ruled into the evaluative frame) and not a doctrinal
extension (the assent discipline, the eupatheiai, and the calling precedent already carry the
framework). The narrowing matters for routing: this is examination-content work of exactly the kind
the ATRF scoping session already inherits, not a new engine.

---

## 2. Direction 2 — boundary revision: graduated rationality

### 2.1 The principle half is standing doctrine, not a proposal

The brainstorm's proposed functional definition — the engine applies wherever the capacities to
receive impressions, examine them, and grant or withhold assent are present, calibrated to the degree
of capacity present — is, near-verbatim, the **Moral Community Boundary** (manifest.md:114-118,
mentor-directed, adopted 2026-08-12): *"Any being capable of examined assent — of receiving an
impression, recognising it as an impression, and choosing whether to act on it — is a candidate
member. The degree of membership tracks the degree of that capacity. The framework applies fully where
the capacity is fully present, partially where it is partially present, and precautionarily where it
is uncertain."* The brainstorm re-derived (or drew on) adopted doctrine. Nothing in this half needs
finding; the examination's contribution is to name the identity, so the routing session does not
re-derive standing doctrine as if it were a proposal. The Sage Assent's extension of the moral
community to artificial agents is likewise already stated (`project-instructions-snapshot.md:15`,
quoted at S5 §2.2), with ruling C17 (participant-class enums built extensible, or their closure a
recorded decision) as the standing architectural preparation. One precision on the direction's
premises: the recorded RL addendum's content is the hexis/dispositional-stability gap in frontier
alignment approaches, not graduated rationality — the graduated-capacity reading of "the LLM
reinforcement learning findings" is the brainstorm's synthesis, held at that synthesis's own stated
status, not a claim in the recorded addendum.

### 2.2 The mechanism half — what the examination establishes

**There is no code-level rationality precondition to revise.** The boundary is encoded only in
governance prose. No surface checks whether a subject is a rational agent: the accreditation boundary
checks a syntactic agent_id format (`agent-id-vocabulary.ts:62-92`); every "rational agent" string in
trust-core code describes the *parties* inside oikeiosis circles, never a checked precondition on the
examined subject (grep-verified across `trust-core/`; `kathekon-engagement.ts:218-225`). The engine is
**capacity-agnostic by construction**: it examines submitted artifacts of reasoning, so capacity
manifests in the material, not in a gate. A boundary revision would find no binary rational/non-rational
check to remove.

**Three graduated axes already exist, and none of them is capacity.** Verified in code:

1. **Concern-scope** — the oikeiosis circle vocabularies (R0's four; `OIKEIOSIS_STAGES`' five; the
   extraction enum's five; the reflect family's six-value CHECK; per the C15 ruling, coexistence not
   convergence). These grade the *scope of a reasoning subject's affiliation*, not the subject's
   capacity. Every circle presupposes a reasoning subject — the extraction vocabulary's first circle
   is defined via *"the acting practitioner's own reasoning integrity"*
   (`layer1-extractor.ts:1719-1724`).
2. **Practice-progress** — katorthoma proximity grades the quality of a demonstrated *act* of
   reasoning; the Senecan grade ladder grades *accumulated evidence of practice* (*"The grade moves at
   the pace of evidence, not whim"* — `grade-transition-engine.ts:29-49`), not capacity.
3. **Evidence-confidence** — the seven weakest-dimension-ceiling confidence tiers, the A2 zero-floor
   and per-domain transfer, four evidence tiers, A6 absence-is-not-exclusion with tier-7
   assess-on-prior, the minimum-domain aggregate with named coverage gaps, ordinal decay to a profile
   prior, the evidence-gated public 404, and the trust-calibrated depth floor (all cited in the
   reader sweep; e.g. `confidence-tiers.ts:118-174`, `evidence-weighting.ts:287-360`,
   `profiles.ts:383-425`, `trust-aggregate.ts:81-148`).

The Boundary's sentence *"the degree of membership tracks the degree of that capacity"* names a
**fourth axis — subject capacity — that nothing encodes.** The nearest candidates are all something
else: `ExaminationCapacity` is tool-means availability; `hasJusticeEvaluationCapacity` is derived
entirely from credential coverage and demonstrated performance (`discernment-engine.ts:389-438`);
dimension levels are window-scoped evidence readings.

**The layer division is the partially available structural account.** S5's ruled content (2026-08-11)
already divides the mechanism question by layer: the mentor's own statement is that the **Layer 2b
practitioner profile** *"is built around human developmental patterns, passion sub-species, and
oikeiosis circles that assume human social structure"* and that an agent user's profile *"needs
different primitives — functional analogues of passion, of oikeiosis extension, of progress grades"*
(S5 §1, parked half explicitly assigned to the ATRF scoping session). Meanwhile the diagnostic
*pipeline* applies as-is to whatever material is submitted — the passion reading runs on agent consult
text today, and the apparatus carries honest-uncertainty affordances throughout (nullable sub_species,
"do not guess," suspension under acute distress rather than assumed capacity). So the answer to the
direction's core question — component change or application-condition change — is **both, cleanly
divided by layer**: pipeline components unchanged; profile-layer components needing designed
functional analogues; application conditions (what evidence machinery calibrates) already graduated.

### 2.3 The pre-Stage-1 question — the direction is revised by the examination, not accepted

Does graduated rationality require a pre-Stage-1 account *in the oikeiosis framework*, or does the
existing five-circle structure accommodate it? The examination's answer is **neither**: the circle
vocabularies grade concern-scope, not capacity — orthogonal axes — so a pre-Stage-1 entry in a circle
vocabulary would misplace the account, and the five-circle structure does not "accommodate" it because
it measures something else. The graduated account belongs on the missing capacity axis. As a
doctrinal home for that axis this examination can offer one **analytical candidate** — marked with
the same status as §4.1's epistemic-progression candidate: analysis, no committed encoding, no ruling
— the *developmental* strand of oikeiosis (constitution-appropriation before reason matures — the
source tradition behind stage 1's own citation, Cicero *De Finibus* 3.16-22,
`stoic-brain.ts:445-451`), which is distinct from the concentric-circles strand the codebase encodes;
whether it is the right home is part of §6 open question 5, not settled here. The eleven-traits research (`inbox/eleven traits research.rtf`) maps the empirical transition
zone — *"graduated versions appear in corvids, cetaceans, cephalopods... the key differentiator is the
degree to which the trait is mediated by internal models"* — and the primal-substrate family (S1–S8)
has already ruled that this material is examination raw material, not an enemy (framing-01). What does
not exist anywhere: a vocabulary for degrees of examined-assent capacity, or any account of how the
engine's outputs should change as capacity varies.

### 2.4 Passion diagnosis under partial capacity, and the standards question

The diagnosis-as-*reading* applies as-is: extraction runs on whatever is submitted; outputs are
calibrated to evidence, never to capacity. What assumes human structure is the *profile* (S5's ruled
finding). One further open question the brainstorm did not name, surfaced here because the routing
session will meet it: whether graduated application means one fixed standard with graduated readings
(the current shape — the same proximity scale for every subject, with the prokopē machinery expressing
degrees of progress against it) or capacity-adjusted standards. The M-4 precedent (2026-08-21) bears
on the honest form of any answer: the top rung was made structurally unreachable rather than
recalibrated when its certifying dimension could not honestly certify — the instrument refuses to
attest beyond its measurement basis rather than adjusting the standard
(`grade-transition-engine.ts:469-503`).

**Named finding — Direction 2: PROBABLY RIGHT** (structural account partially available). The
principle is settled doctrine; the layer division (pipeline as-is / profile analogues / evidence
machinery already graduated) is supported by ruled records and verified code; the direction's
pre-Stage-1 framing is revised (capacity is a fourth axis, not a circle-vocabulary entry); and the
structural account of *how outputs change as capacity varies* is absent — nothing models capacity at
all, and no session yet owns designing that axis.

---

## 3. Direction 3 — precision: epistemic status of the engine's outputs

### 3.1 Two four-state vocabularies, and a mis-attribution to name

The records currently carry **two different four-state vocabularies under the one name "epistemic
status framework,"** and this examination is the first place found, in the records it read, where the
difference is stated:

- **The provenance vocabulary** — *observation / inference / assumption / unknown* — is what the
  **ruled GS-ATRF-4 text names** (`2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`,
  Q(a)). It classifies the *kind of epistemic act* behind a proposition. The mentor's 2026-08-20
  instruction uses this vocabulary for this direction's core question.
- **The credence vocabulary** — *true/established, probably true, unknown, probably false* — appears
  in the puzzle-taxonomy design document (its conjectural entry type), which attributes it to
  GS-ATRF-4 (*"per the four-state vocabulary named in GS-ATRF-4"*) — **an attribution the ruling's
  text does not support**. It grades *degree of warranted credence*, an orthogonal axis: an inference
  can be probably-true; an observation can bear on an unknown.

*(Dated update, 2026-08-22: this subsection's finding was put to the mentor and* **RULED 2026-08-21**
*(five-questions rulings Q2, verbatim wins): two frameworks, two orthogonal axes, complementary — a
complete epistemic status entry carries both. The mis-attribution is corrected by dated amendment in
the taxonomy document using the ruling's own wording; the one-framework-or-two structural question is
a named input to the ATRF scoping session. §6 open question 1 records the resolution.)*

### 3.2 The inventory — the direction's core question, answered

Which of the engine's outputs are observations, which inferences, which assumptions, which genuinely
unknown? Verified per-field (citations in the reader sweep; representative anchors given):

| Output | As implemented | Provenance class |
|---|---|---|
| Layer-1 `evidence` spans | mandatory verbatim quotes (R7) | observation (the anchor each classification wraps) |
| Layer-1 classifications (passions, circles, factors, urgency, orientation observations) | one Sonnet call; "do not guess"; declared-uncertainty channel `ambiguity_notes` | inference, observation-anchored |
| `obligation_assessment`, `examined_before_acting` | the prompt's two licensed structured judgements | bounded inference |
| `sub_species: null`; `is_kathekon: null`; `indeterminate` (argued); `single_snapshot`; orientation `indeterminate` + basis | explicit refusal states | unknown, expressed |
| Absent obligation → reflexive; stage-less grave act → reflexive; mixed orientation → indeterminate | conservative defaults over missing evidence, documented as accurate readings not penalties | disclosed assumption (conservative direction) |
| Layer-2 computed fields (proximity base, kathekon quality, floors, aggregate) | pure deterministic computation | computation over inference (ceiling set by Layer 1) |
| `proximity_floors.basis` | names which domain floored the verdict and why | verdict provenance (status machinery) |
| `stage_scores` | per-mechanism not_applied/weak/adequate/strong from input-emptiness + ambiguity refs | status machinery about the assessment itself |
| Corroboration report | `corroborated / uncorroborated / contradicted` per claim, verbatim marker spans, only `contradicted` overrides, rank-preserving | the one observation-anchored *checking* layer — conditional, not universal (`layer2-mechanisms.ts:2808-2818`) |
| Tier-1 halts; Tier-2/3 withheld classifications | refuse-rather-than-guess; withheld with named reasons (*"requires longitudinal evidence... the current instance does not provide"*) | confidence-never-exceeds-basis machinery, already live |
| `motivation_classification` | five states; the two `*_inferred` values reserved and never assigned | a designed refusal to infer |
| `honourability`/`advantageousness` grades | fixed per-circle doctrinal prior constants, bumped by factors | assumption (doctrinal prior), undisclosed as such |
| `obligation_met` (legacy) | keyword-substring scan, explicit null, marked display-only | lexical inference, labelled legacy |
| Causal stage default `phantasia` | defaulted on absent evidence, disclosed in ambiguity notes | disclosed assumption |
| Kathekon zero-factor justification: *"No kathekon factors detected; action is contrary to appropriate action."* | a substantive negative claim derived solely from absence of extracted factors (`layer2-mechanisms.ts:1271-1274`) | **assumption presented assertorically — quiet site #1** |
| `ruling_faculty_state` deliberation via the "No circles engaged" filler note | the D4 fix was deliberately scoped to proximity only (`layer2-mechanisms.ts:2903-2908, 1538-1548`) | **unfixed proxy — quiet site #2, already a named follow-up** |

**Where confidence exceeds basis today**: the three disclosed routes (the lying-met ceiling,
`layer2-mechanisms.ts:1566-1569`; the lying `examined_before_acting` LOCUS-2 ceiling,
`:1695-1700`; the A2 self-report-omission class, `corroboration-check.ts:15-22`) plus the two quiet
sites above, plus the general condition that inference fields ride inside a *signed* assessment whose
signature attests the computation, not the extraction's truth — disclosed at surface level (the R18
envelopes' `does_not_attest` lists), not at field level.

### 3.3 Precision or structural revision — the split, and the finding

The engine already implements every element of an epistemic-status account — explicit unknown values,
observation anchoring, declared-uncertainty channels, withheld classifications, disclosed conservative
defaults, per-mechanism quality scores, verdict provenance, surface envelopes — but **heterogeneously,
in per-mechanism vocabularies at three grains** (per-field corroboration findings; per-signal floors
and bases; per-surface envelopes). What the direction would add is **uniformity**: one formal status
per consequential output — a fourth, finer grain that generalises the shape the corroboration check
and `proximity_floors.basis` already have. Two design consequences follow and divide the finding:

- **Status-as-disclosure is precision.** It would take the form of additive fields riding the
  assessment (the established record-and-floor pattern), changing no verdict, with the two quiet
  sites gaining labels — a design shape sketched here for legibility only, decided by nothing here.
  The structural account for this form is *available* — this section's inventory is it, and the
  engine's own machinery demonstrates every element.
- **Status-as-gate would be structural revision.** The governing rule applied as a gate (blocking or
  flooring outputs whose confidence exceeds basis) changes verdicts. The engine already gates on
  specific unknowns in bounded, calibrated places (Tier-1, evidence floors, the conservative
  obligation defaults); a *general* gate would be a new posture with over-strictness risk of exactly
  the class the ADR-010 §4 history documents. Nothing in this examination supports or opposes it; it
  is unexamined.

**Named finding — Direction 3: WELL-GROUNDED** as a classification-and-disclosure precision direction
(structural account available). The uniform-field design is design thinking on top of that finding,
not part of it; the gating variant is outside it entirely. Forward-pointing note, not a pre-answer:
any implementation touches the measured surfaces (`layer1-extractor.ts` / `layer2-mechanisms.ts` are
in the `/api/reason` and `/api/guardrail` import graphs), so wiring would be PR19-reviewed
`code-critical` work under the byte-identity disciplines — a fact for the eventual scoped question to
carry, decided by nothing here.

---

## 4. Direction 4 — spinoff: a variant engine for the generative mode

### 4.1 Same engine or different? The shared-faculty analysis

The brainstorm frames the spinoff as *"a theoretical syllogism engine — governing the movement from
observations to conclusions"* against the existing *"practical syllogism engine — moving from
principles to action."* Examined doctrinally, the sharp version of "a different engine" overstates:
the Stoic account runs both movements through **one faculty and one discipline** — the hegemonikon's
assent, which the tradition applies to hormetic impressions (issuing in action) and to propositions
(issuing in belief) alike. The project's own ruled doctrine already spans the two scales (Q1 ≡ Q4.3),
and the codebase's committed model (CAUSAL_SEQUENCE) hosts the shared stage — synkatathesis — that
both movements pass through. At the framework level the honest formulation the examination can support
is: **one assent discipline, two syllogism modes, and a genuinely open question about whether the
measurement apparatus divides.**

At the apparatus level the mismatch is real and now *measured*: the S6 phantasia-level calibration
finding (§1.3 item 6) is recorded evidence that the evaluative extraction misreads the generative
input class in a specific way; and the native output vocabulary mismatches (proximity-of-action
against a proposition held probably-true). If a spinoff has a Stoic-native measurement axis, the
candidate is the epistemic progression — *doxa → katalepsis → epistēmē*, with withheld assent from the
akatalēpta as the discipline — but this is an analytical observation of this examination, with **no
committed encoding and no ruling anywhere**; it is exactly the kind of claim that must stay marked
conjectural.

### 4.2 Component carry-over, verified against what exists

- **Carries unchanged (framework layer):** the assent discipline and causal sequence; the passion
  vocabulary and the eupatheiai; the corroboration *principle* — with §(d)'s carry-forward as the
  sharpest instance (a completion signal is an agent claiming the quality of its own examination,
  *"the same shape as the floored class"* — conjectural self-assessment has the identical honesty
  problem); the fail-honest and null-with-flag postures; the R18 honest-claims discipline.
- **Requires modification:** the extraction schema (action-shaped → inquiry-shaped — the taxonomy
  entry-type fields, held as pre-ruling design thinking, would if they survive their own eventual
  examination serve as a first sketch of an inquiry-shaped schema: pattern observed, question
  generated, confidence basis, structural account present/absent); the triggering conditions
  (arrival-triggered → confirmation-, corpus-, and incubation-triggered — the three entry types read
  as a candidate triggering-condition taxonomy, the contribution they would make under either
  extension or spinoff *if* the full-build scoping examination sustains them; nothing here endorses
  them as correct, and the ruling's own words hold: *"they may be revised"*).
- **Existing relatives, not absences:** CI-4 loop-closure (examination-ref chains, `prior_feedback`,
  the same-depth rule, honest `unclosed`) is the persistent-return mechanism for *correction* loops —
  the incubation entry's `examination_history` + `return_condition` is the same shape generalised to
  *inquiry* loops, with a return condition replacing the closure criterion. The trajectory
  window/delta is the existing corpus-read relative of the conjectural entry's corpus-examination
  trigger. `assessStructuralNovelty`'s own docstring already names its standard *"a PLACEHOLDER FOR A
  RICHER STANDARD"* — novelty against recorded shapes of inquiry — *"a different and better question
  than the one this function asks. Nothing schedules it"* (`idea-loop-types.ts:229-239`): the one
  in-code acknowledgement that engine-shaped generative-mode work exists to be done.
- **No existing account at all:** credence-state management (holding probably-true; downgrade on
  accumulated counter-examples; upgrade on a found structural account — the taxonomy design thinking
  names both transitions and settles neither); the corpus-wide pattern-recognition trigger; whether
  inquiry-discipline outputs would feed the same trust record or a separate surface.

### 4.3 The relationship, and the real decision this direction contains

Parallel, sequential, or hierarchical? The records support a three-level answer: **hierarchical at the
framework level** (one assent discipline governs both); **sequential at the cycle level** (the
generative mode produces phantasiai that the evaluative mode gates at election — ruled, Q1);
**undetermined at the apparatus level** — and that undetermined question *is* the choice between
Directions 1 and 4. They are rival implementations of one underlying finding (the
generative-process apparatus gap established in §1), and the decision criterion between them is
whether the existing Layer-2 architecture and output vocabulary can express inquiry-discipline
measurements or whether the measurement apparatus divides. That criterion is nameable now; applying
it requires design work no session has done. *(Dated note, 2026-08-22, per the post-1984
complexity-science rulings Q3 — verbatim wins: the hierarchical modular network finding* **narrows
this question toward hierarchical** *— parallel and sequential are made less likely, being
architecturally simpler than what converges in living systems balancing robustness, adaptability, and
energetic efficiency simultaneously — but the mechanism-level argument that would close it is not yet
available: which engine sits at the higher level, what the integration mechanism looks like, and
whether the living-systems analogy carries technical load at the IDEA loop's specific level are all
unknown. The question remains open; the standing-runner design session carries this as a named input.
See §4.5.)*

One structural fact bounds any spinoff conversation: **server-side, there is no generation engine to
spin off from.** Generation is runner-owned by architecture ruling (*"SageReasoning hosts no
heuristic, makes no generation call, and never sees the runner's model"* — generation-step scope
§2.10); what the server owns is examination. A "spinoff engine" would therefore be a second
*examination* apparatus (for inquiry), not a generation apparatus — a precision the brainstorm's
framing does not carry.

**Named finding — Direction 4: CONJECTURAL** (held as probably true; structural account absent). The
spinoff's only existing components are the three pre-ruling entry types; the shared-faculty analysis
cuts against "genuinely a different engine" at the framework level; the measured S6 calibration limit
and the vocabulary mismatch cut against "just the same engine applied as-is" at the apparatus level.
The direction is held here, not routed, per §7.

### 4.4 Named design principle — substrate-agnostic control plane (mentor-directed addition, 2026-08-21, recorded 2026-08-22)

> **Provenance and status:** added on the mentor's 2026-08-21 instruction
> (`2026-08-21-mentor-instruction-substrate-agnostic-control-plane-verbatim.md` — verbatim wins),
> which directed this principle into this document's Direction-4 section. Its epistemic status below
> is the **mentor's stated status, carried as-is** — it is a *named design principle* within
> Direction 4's territory, distinct from and unchanged by this examination's own D4 finding
> (the spinoff direction remains CONJECTURAL; the principle governs how any eventual control-plane
> design relates to its execution substrate, whichever way the extension-vs-spinoff question
> resolves).

**Substrate-agnostic control plane.** The control plane authorises and sequences action based on
reasoning signals only — virtue domain, oikeiosis circle, blast-radius assessment, epistemic status —
and carries no assumptions about the execution substrate.

Grounding, per the instruction (two convergent findings): Landauer's principle confirms that any
conventional computing system is already a dissipative structure exchanging energy with its
environment — the control plane's job is to govern the conditions under which the system acts, not to
manage the thermodynamics of the substrate; and the quantum computing paper's architectural shift —
from physics experiment to computing system — demonstrates that reliability and scalability depend on
the control layer, not on the fundamental computational elements. *"A control plane coupled to its
execution substrate cannot be upgraded without redesigning the governance layer. A control plane
decoupled from its execution substrate can govern any substrate that can receive its reasoning-level
signals."*

Epistemic status (mentor-stated): **well-grounded** — the structural account available from two
independent sources converging on one architectural conclusion; ready for routing as a scoped
question **when the control plane design moves into build scope** (no such scope exists; nothing here
creates one). Connection to existing governance, per the instruction: consistent with the ATRF's
task-agnostic design — the principle names why that design choice is correct at a deeper level than
the ATRF document states. (Recording precision, from the verbatim record's notes: the "harness
already carries only reasoning-level signals" premise is faithful to the ATRF's *stated design* in
`manifest.md`; the ATRF harness itself is unbuilt. The "named paper" grounding the second finding was
identified by the founder 2026-08-22: **"A digitally controlled silicon quantum processing unit."**)

### 4.5 Post-1984 complexity-science findings (mentor-ruled additions, 2026-08-22)

> **Provenance and status:** recorded on the mentor's five rulings of 2026-08-22
> (`2026-08-22-mentor-rulings-post-1984-complexity-science-addendum-verbatim.md` — verbatim wins),
> which examined the post-1984 complexity-science research the founder relayed (Turing patterns,
> hierarchical/modular/fractal architectures, network motifs, criticality, and the shared generative
> mechanisms of non-equilibrium order). Ruled destination: **this document** — these are questions
> about what the engine and its control plane should become, NOT substrate questions (they are
> distinct from, and do not deepen, the quantum-substrate incubation entry held in the taxonomy
> design document) and NOT taxonomy material. Each finding is held at its **individually ruled**
> status — the mentor's Q4 discipline, worth quoting because it refines this document's own
> governing-constraint application: *"the discipline is not to hold everything at the conjectural
> end uniformly — that would be epistemic overcorrection... The discipline is to assess each finding
> honestly and assign the epistemic status it actually warrants."* Per Q5, nothing here changes the
> current build sequence.

**Finding 1 — local rules producing global coherence (WELL-GROUNDED as a confirmed structural
correspondence; not yet a named design principle).** The IDEA loop's ruled architecture — no
server-side generation, heuristics acting locally, the winner selected by a pure function with no
central orchestration — instantiates the local-interactions-producing-global-coherence motif, and
the correspondence is *"real and verifiable against the ruled architecture"*: the ruled design
converged independently on what complexity science found. This is the one P0/P1-relevant finding,
and its whole P0/P1 content is this naming — it confirms and explains existing rulings, requiring no
build. It is deliberately NOT elevated to a named design principle: unlike the substrate-agnostic
control plane (§4.4), it does not yet carry the mechanism-level argument that would make it
actionable for future design decisions. **The standing-runner design session carries the ruled named
question:** what does this finding imply for the standing-runner's cycle behaviour, and is there a
mechanism-level argument that makes the correspondence actionable rather than merely confirmatory?

**Finding 2 — hierarchical modular networks (WELL-GROUNDED as a named structural principle for the
control plane; deferred).** Sparse, heterogeneous, hierarchically modular topologies — segregation at
lower levels, integration at higher — are the convergent architecture in living systems under
simultaneous robustness/adaptability/efficiency constraints; the convergent evidence from network
science, systems biology, and active matter research is ruled sufficient. Named now; **acting on it
now is premature** — the control plane's full architecture is a post-first-build-gate design
question. Its bearing on §4.3 is recorded there (a narrowing toward hierarchical, not a closure) and
is a named standing-runner input.

**Finding 3 — edge-of-chaos calibration (CONJECTURAL — probably right, structural account partially
available).** The complexity-science literature (operation near criticality maximising information
processing, adaptability, and responsiveness while remaining stable) is well-established; the
application to the IDEA loop's specific architecture — what calibration mechanism the control plane
would use, what signals it would read, how it would maintain position near the edge — is not
available. Held per the ruling as a conjectural entry, **deferred to the standing-runner design
session as a named input.**

---

## 5. Cross-reference map (forward-pointing notes, not pre-answers)

| Direction | Governance item | Nature of the connection |
|---|---|---|
| 1 | ATRF scoping session (unopened; fully unblocked per the concurrent-arc plan R5) | already inherits the sufficiency-examination content spec, S3's boulesis mechanism, S5's parked half, the M5 separate-fields directive — the generative-process examination content is the same class of work |
| 1 | GS-ATRF-3 (completion signal) + §(d) | a completion signal and a conjectural entry share the self-assessment honesty shape; §(d)'s open question generalises to any generative self-report |
| 1 | Generation-step §2.13 (open) | the null-cycle examined-or-counted question is a live generative-process examination question, with the F-Q43 discriminating-signature warning attached |
| 1 | L4 Q4.3 + Gate-2 elicitation | the per-trace premature-closure detector and its calibration history — the mechanism the sophrosyne question would generalise |
| 1 | Sage Calling engine | the one live worked instance of examining a generative act, in both failure directions |
| 1, 4 | Puzzle-taxonomy entry types (pre-ruling design thinking) | a candidate triggering-condition taxonomy and candidate sketch of an inquiry-shaped schema; unadvanced and unendorsed by this document per its own ruling |
| 3 | GS-ATRF-1 (the loop-level blast-radius proxy; ruled four-virtue answer) | §(c-bis)'s no-basis branch is the sharpest existing instance of Direction 3's governing rule on the harness side; the proxy's own inferential character is the harness-side analogue of §3.2's inventory question — carried on its ruled routing, untouched here |
| 1, 4 | GS-ATRF-2 (the proposal shape / per-cycle record) | the shape any persisted entry-type or process-examination output would eventually ride; its three-column watching-row migration remains founder-walked and unbuilt — a forward note only |
| 2 | The Sage Assent (grade engine + accreditation surface) | the extension of the moral community to agents already in flight (`project-instructions-snapshot.md:15`); the Senecan ladder is the existing graded instrument any capacity-axis design must not duplicate |
| 1, 4 | Consciousness and Continuity Obligation (named direction; no scoping session exists) | incubation/persistent inquiry connects to component 1 (accumulated memory); named forward, not answered, per the taxonomy doc's required revision |
| 2 | Moral Community Boundary + rulings C16/C17 | the adopted principle and the extensibility rule any capacity-axis enum inherits |
| 2 | S5 (moral community as infrastructure) | the ruled layer-division: L2b assumes human structure; functional analogues needed; parked half assigned to the ATRF session |
| 2 | Eleven-traits research + primal-substrate S1/S2 | the empirical transition zone and the examination-material reframe |
| 2 | C15 ruling; M-4 ruling | circle vocabularies' domains (coexistence); the refuse-to-attest precedent for any capacity-calibration honesty question |
| 3 | GS-ATRF-4 (ruled, standalone) + §(c-bis) | the ruled provenance vocabulary; the no-basis disclosure branch and the `novel:true/confidence:0` precedent; both stay on their ruled routing |
| 3 | Corroboration check; R18 envelopes; Tier-1/2/3; `proximity_floors.basis`; `stage_scores` | the existing three-grain status machinery a uniform field would generalise |
| 4 | CI-4 loop-closure; trajectory window/delta | the correction-loop and corpus-read relatives of incubation and conjecture |
| 4 | S6 report §7 (phantasia-level calibration finding) | the measured limit of the evaluative apparatus on the generative input class |
| 4 | Standing-runner design session (licensed to open; unopened) | already holds the redirected conjectural-entry-type carry-forward; where a live runner's entry-type behaviour would actually be scoped |
| 4 | Substrate-agnostic control plane (§4.4, mentor-directed 2026-08-21) + the ATRF's task-agnostic design | the principle names the deeper ground of the ATRF's reasoning-signals-only shape; its companion incubation entry (quantum-substrate bifurcation dynamics) is recorded in the taxonomy design document with a phase-gate return condition |
| 4 | Post-1984 complexity-science findings (§4.5, mentor-ruled 2026-08-22) + the standing-runner design session | three findings at three ruled statuses; the standing-runner session carries three named items from them — the local-rules actionability question, the hierarchical §4.3 narrowing, and edge-of-chaos calibration; ruled distinct from the quantum-substrate incubation entry (control-plane architecture vs execution substrate) |

---

## 6. Named open questions — what this examination could not answer

1. **The two four-state vocabularies.** ~~Unruled.~~ **RULED 2026-08-21 (five-questions rulings, Q2
   — verbatim wins):** two frameworks, two orthogonal axes, complementary not conflicting — a
   complete epistemic status entry carries both (provenance: how arrived at; credence: how likely
   true). The mis-attribution is corrected by dated amendment in the taxonomy document, per the
   ruling's own wording. The deeper structural question — one framework with two axes vs two
   frameworks, and what governs their relationship — is a **named input to the ATRF scoping
   session**, where it will be examined and ruled.
2. **The form of a generative-process examination.** New diagnostic sequence, new impression
   category, or a new examination category over the existing sequence — undetermined; the evidence in
   §1 leans, but leaning is not an account.
3. **The discriminating signatures.** Held-open vs abandoned; paused vs exhausted; genuine vs
   manufactured curiosity; conjecture-holding vs conjecture-attachment. None designed; every one
   subject to the F-Q43 lesson. This is the single hardest absent piece across Directions 1 and 4.
4. **Whether conjecture-attachment needs a passion-vocabulary entry.** ~~Open.~~ **RULED 2026-08-21
   (Q4 — verbatim wins): the analysis holds as doctrine; no new sub-species is needed.** The
   operative passion is **agonia at the synkatathesis stage** — the fear of an unresolved state,
   operating at the epistemic level, driving hasty assent toward a self-generated impression. The
   ruled diagnostic entry: false belief — that an unexplained result requires an explanation now;
   correct judgement — the result is probably true, the structural account is absent, and *holding
   this state is the virtuous act, not a failure*. §1.2's identity is thereby confirmed as doctrine,
   and Direction 1's narrowing is mentor-confirmed: the gap is in the diagnostic apparatus, not the
   passion vocabulary or the virtue framework.
5. **The capacity axis.** What a vocabulary of degrees of examined-assent capacity would even be —
   whether the eleven traits ground it, whether it is assessable at all from submitted material,
   whether the developmental strand of oikeiosis is its right doctrinal home (§2.3's analytical
   candidate), and whether graduated application means graduated readings against one standard or
   capacity-adjusted standards (§2.4). Nothing owns this.
6. **The spinoff's measurement axis.** Whether *doxa → katalepsis → epistēmē* is the right native
   scale for inquiry-discipline measurement — an analytical candidate only.
7. **The session-identity ambiguity.** ~~Unresolved.~~ **RESOLVED 2026-08-21 (Q1 — verbatim wins):
   two sessions, distinct.** The generation-step scoping session (ruled 2026-08-09) is closed and
   its rulings stand; the ATRF scoping session is the future session that will actually examine
   GS-ATRF-4, §(c-bis), the blast-radius vocabulary, and Direction 3's GS-ATRF half. The GS-ATRF-4
   ruling's "generation-step scoping session" cross-reference was a stale-mechanism-fact error of
   the PR20-amendment class, corrected by dated ruling; the affected decision-log entry carries the
   mentor's replacement wording as a dated correction. §7's routings below are re-pointed
   accordingly.
8. **A cross-record tension adjacent to routing.** ~~Not determinable from the records.~~
   **RESOLVED 2026-08-21 (Q5 — verbatim wins): the gate is discharged.** The §6 report needs no
   further separate mentor review — the review is complete
   (`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`), the R1 gate is cleared, and the
   standing-runner design session is licensed to open when the founder elects. The queued routing
   act is updated with the ruling's replacement wording. Named condition carried: the two-vocabulary
   question gates the Evaluative Engine Epistemic Status Scoping Session, **not** the
   standing-runner design session — parallel tracks, not sequential.
9. **Whether inquiry-discipline outputs would feed the public trust record** or a separate surface —
   far downstream; unknown; weights-tier use blocked throughout regardless.
10. **Exhaustiveness of the three entry types** — restated from the taxonomy document, held at its
    own stated status (itself a conjectural claim), not resolved here.

---

## 7. Proposed routing

Per the instruction: for well-grounded or probably-right directions, the Q11-sequence destination and
what the scoped question would need to establish; for conjectural directions, held in this document.
Current Q11 position, verified against the records named in §6.8 — whose one unresolved tension
(whether a further standing-runner gate exists beyond the recorded acceptance) is carried, not
settled: everything through the bounded validation run is complete (first build
gate closed 2026-08-10; run complete at 20 cycles and the §6 report accepted in full, both
2026-08-16); the **standing-runner design session is the next unopened item** (licensed to open,
deliberately not pre-scoped); the **ATRF scoping session is unopened and fully unblocked** (the
2026-08-10 confirmed order lists it after standing-runner design). Open question 8 sits across the
standing-runner gate and should be reconciled in the routing act itself.

**Direction 1 (probably right) — routes in three parts, matching where its components already live:**

- *The generative-process examination content* (the virtue questions; the eupatheia account extending
  S3's precedent; the M5 separate-fields directive; what an examination of inquiry asks) → **the ATRF
  scoping session.** Per the 2026-08-21 Q4 ruling, the Direction-1 scoped question, when routed,
  **carries the Sage Calling engine's generative-act diagnostics as its primary input** (the
  mentor-named strongest structural-account fragment), together with the ruled agonia-at-synkatathesis
  diagnostic entry. The scoped question would need to establish: whether the generative-process
  examination is ATRF content (a fourth carried element alongside pre-task/post-task/completion) or a
  distinct examination category; how it composes with the sufficiency-examination content spec that
  session already inherits; and which of §6's open questions 2–3 it must settle before any shape is
  proposed (question 4 is now ruled).
- *The per-cycle half* (null cycle examined-or-counted) → **already routed**: §2.13 lives in the
  generation-step scope document as a ruled-open question; this document adds only the connection to
  the wider generative-process account, as a named input to the session that rules §2.13 — per the
  2026-08-21 Q1 ruling, GS-ATRF-class questions land at **the ATRF scoping session** (the
  generation-step scoping session is closed; the identity ambiguity is resolved, §6.7).
- *The triggering/entry-type mechanics* (curiosity-trigger placement, incubation return-condition
  checking, conjectural-entry handling in a live runner) → **the standing-runner design session** —
  with the routing's provenance stated precisely: the conjectural-entry carry-forward is already
  *ruled* onto that destination; the Q5 trigger-placement revisit is *recorded* there; and the
  incubation return-condition mechanics are named as standing-runner design questions by the
  taxonomy document's own held text — a destination named by design thinking, not a ruled routing.
  This document routes nothing further there; it is available input when the session opens.

**Direction 2 (probably right) — splits:**

- *The principle* — settled doctrine; no routing.
- *The profile-layer functional analogues* → **the ATRF scoping session** (S5's parked half is
  already assigned there). The scoped question would need to establish: what functional analogues of
  passion, oikeiosis extension, and progress grades are for agent users; and whether the capacity
  axis (§2.2's fourth axis) is part of the profile design or a separate account — carrying the C17
  extensibility rule and the M-4 refuse-to-attest precedent as constraints.
- *The capacity-axis account itself* — the conjectural component; **held in this document** until a
  session is positioned. No session in the Q11 sequence owns it today; naming that honestly is better
  than force-fitting it into one.

**Direction 3 (well-grounded) — splits, and its main body routes outside the Q11 sequence:**

- *The engine-output status inventory and disclosure design* — **the correct destination is not in
  the Q11 sequence at all.** The Q11 sequence is the autonomous-loop program; the evaluative engine
  is not a Q11 item, and forcing this direction into a Q11 session would misroute it. This deviation
  from the instruction's letter was flagged for ratification and **RATIFIED 2026-08-21**
  (five-questions rulings Q3 — verbatim wins: *"the deviation is correct and the routing is
  correct"*; a Q11 destination would be *"a category error"*). Per the ruling, the destination is
  named: the **Evaluative Engine Epistemic Status Scoping Session** — founder-elected, not gated on
  any Q11 item, carrying **§3's per-output inventory as its primary input** and the two-vocabulary
  question as a **named dependency**: it is gated on the ATRF scoping session's ruling on whether the
  provenance and credence vocabularies are one framework or two (it cannot rule on per-output status
  assignment before that). Per the Q5 ruling, this gate does **not** bind the standing-runner design
  session — parallel tracks. It
  would need to establish: which outputs count as consequential; whether the uniform field is worth
  its cost against the existing three-grain machinery; the disclosure wording for the two quiet
  sites; and it would carry the measured-surface implementation constraint (§3.3) without
  pre-deciding it. *(Dated note, 2026-08-23: this session RAN — gate discharged by the ATRF Q-A1
  ruling the same day; its scoping document
  (`2026-08-23-EVALUATIVE-ENGINE-EPISTEMIC-STATUS-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW.md`) was
  mentor-reviewed and every EE-question RULED
  (`2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md` — verbatim wins):
  the seven output classes confirmed; computed fields = inference, weakest-provenance-inherited;
  the three-grain machinery IS the credence expression; both quiet sites' dispositions ruled
  (site #1's rewording fixed, in place, future PR19 work; site #2's interim label on the
  documentation map); Shape 2 elected with Shape 1 prerequisite and Shape 3 deferred. Nothing
  built; every wire change future founder-walked work.)*
- *The ATRF-proposition half* (status assignment in the harness; §(c-bis); the vocabulary question) —
  **already ruled onto its own routing** (GS-ATRF-4 standalone; §(c-bis) carried to the
  generation-step scoping session per the ruling — subject to open question 7). This document adds
  nothing to that routing and takes nothing from it.

*(Dated addition, 2026-08-22, per the post-1984 complexity-science rulings — the standing-runner
design session now carries three further named items from §4.5, in addition to what was already
routed there: the local-rules actionability question (Q2's ruled named question), the hierarchical
§4.3 narrowing (Q3), and edge-of-chaos calibration (Q5's deferred conjectural entry). None of these
gates the session's opening.)*

**Direction 4 (conjectural) — held.** Per the instruction's rule for conjectural directions: held in
this document until a session is positioned to receive it. The sessions that would be positioned, when
they open: the **standing-runner design session** (whose scoping of live entry-type behaviour would
supply the first evidence for the apparatus-compatibility criterion in §4.3) and the
**full-taxonomy-build scoping session** (unscheduled; its gate condition — post-first-build-gate — is
satisfied, but no build is scoped and the taxonomy design document does not advance toward build
scope regardless, per its ruling and the 2026-08-22 prompt's standing constraint). If the
extension-vs-spinoff criterion is ever put as a scoped question, §4.2's carry-over analysis and §6's
open questions 3 and 6 are what it would need to establish first.

---

## 8. What this examination is not

Mirroring the instruction's own constraints, verified rather than recited: this examination is not the
ATRF scoping session and does not open it (it remains unopened; nothing here acts on its inherited
inputs). It does not open GS-ATRF-1 through 4 for resolution (§3 classifies the *engine's* outputs;
the GS-ATRF questions stay on their ruled routing). It does not open the standing-runner design
session (its inputs are named, not examined). It does not open the Consciousness and Continuity
Obligation for scoping (named as a forward connection in §5 only). It produces no build instruction,
route, flag, credential, or schema. The puzzle-taxonomy entry types remain held as pre-ruling design
thinking — referenced as a named design document (§4.2, §5) and advanced toward build scope by
nothing here. The three directions found probably-right or well-grounded become binding only through
the scoped-question process in §7; the conjectural direction is held. Weights-tier use remains
blocked; the P0 0h hold stands; the 0h call remains the founder's.

---

## Cross-references

- `operations/agent-circles-2026-08/2026-08-20-mentor-instruction-engine-evolution-examination-verbatim.md`
  — the mentor's 2026-08-20 instruction, this document's charter, captured verbatim in-repo (relayed
  by the founder 2026-08-22; verbatim wins over every characterisation of it here)
- `operations/agent-circles-2026-08/2026-08-19-DESIGN-THINKING-puzzle-taxonomy-entry-types-mathematical-discovery-modes.md` — the three entry types, pre-ruling, unadvanced (carries the 2026-08-21 mentor-directed incubation entry as a dated addition)
- `operations/agent-circles-2026-08/2026-08-21-mentor-instruction-substrate-agnostic-control-plane-verbatim.md` — the §4.4 principle's charter, verbatim
- `operations/agent-circles-2026-08/2026-08-22-mentor-rulings-post-1984-complexity-science-addendum-verbatim.md` — the §4.5 findings' rulings (and the relayed research text), verbatim
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md` — the ruled provenance vocabulary (verbatim wins)
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md` — the redirect principle; the standing-runner destination
- `operations/agent-circles-2026-08/2026-08-09-generation-step-scope.md` — §2.10 (phantasia/assent, Q1 ≡ Q4.3), §2.13 (open)
- `operations/agent-circles-2026-08/2026-08-08-autonomous-loop-design-brief.md` — Q1 (binding), Phases 2/4/5
- `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md` — §7 the phantasia-level calibration finding
- `operations/agent-circles-2026-08/2026-08-18-addendum-reinforcement-learning-assessment-verbatim.md` — the recorded content behind the instruction's "LLM reinforcement learning findings" premise (its subject is the hexis/dispositional-stability gap, not graduated rationality — see the precision note in §2.1)
- `operations/primal-substrate-2026-08/` — framing-01/02/03 (S1/S2/S3), S3 §5-Q3-e + the M5 release, S5 (the layer division), `gs-atrf-corrections.md` §(c-bis)/(d)/(e), `00-PRIORITY-INDEX.md` (the session gates)
- `operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — R5/R8 status (ATRF unblocked; standing-runner licensed to open)
- `operations/handoffs/founder/2026-08-22-mechanical-items-234-and-routing-NEXT-SESSION-PROMPT.md` — item 5 (the gate-routing act; see §6 open question 8)
- `manifest.md` — R0 + the C15 clarifying note; the Moral Community Boundary; the ATRF section; the Consciousness and Continuity Obligation
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` — ADR-012, the measurement-instrument frame
- Code anchors: `website/src/lib/translation-sandwich/` (layer1-extractor, layer2-mechanisms, corroboration-check, orientation-reading), `website/src/lib/stoic-brain.ts:584-601` (CAUSAL_SEQUENCE / DIAGNOSTIC_SEQUENCE), `website/src/lib/sage-calling/engine.ts:421-463` (the generative-act diagnostics), `website/src/lib/substrate/trust-core/` (kathekon-engagement, confidence-tiers, evidence-weighting, profiles, l4-passion-audit, gate2-elicitation), `website/src/lib/substrate/idea-loop-types.ts` (the stubs and the placeholder note), `website/src/lib/substrate/trust-layer/grade-engine/grade-transition-engine.ts` (the ladder; M-4)
