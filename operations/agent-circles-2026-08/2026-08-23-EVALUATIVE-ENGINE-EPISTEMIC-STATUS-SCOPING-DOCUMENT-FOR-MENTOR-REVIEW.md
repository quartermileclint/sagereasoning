# Evaluative Engine Epistemic Status — scoping document

**FOR MENTOR REVIEW — NOT FINAL. This scoping is not adopted until the mentor's feedback returns
and the founder finalises it. No build, route, flag, credential, or schema is licensed by this
document.**

> **Dated note, 2026-08-23 (same day; governs the reading):** the mentor's response RETURNED and
> the founder finalised on the direction "proceed." Every EE-question is RULED — see §10 below and
> the verbatim record
> (`2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md` — verbatim wins).
> Nothing is built: Shape 1 (documentation map) is future documents-work; Shape 2's wire changes
> (incl. the EE-C1 ruled rewording) are future PR19-reviewed `code-critical` build scoping; Shape 3
> is deferred. The body below is preserved as reviewed.

---

## §0 Provenance, gate verification, and grounding at open

**Session:** the **Evaluative Engine Epistemic Status Scoping Session** — the name, election basis,
primary input, and gate all fixed by the mentor's 2026-08-21 Q3 ruling
(`2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md`, verbatim wins):
founder-elected; **not** gated on any Q11 item (routing the evaluative engine into a Q11 session was
ruled *"a category error"* — the engine is the foundational layer the IDEA loop runs on top of);
subject matter = **the epistemic status of the ENGINE's own outputs**; primary input = the
per-output inventory (examination §3.2); gate = the ATRF scoping session's ruling on the
two-vocabulary question.

**Gate verified DISCHARGED at open.** The gating ruling exists in-repo, committed at HEAD
`0fd098c`: **Q-A1** of `2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md` (verbatim
wins), whose own text reads *"This ruling un-gates the Evaluative Engine Epistemic Status Scoping
Session."* Its answer, restated because everything below sits on it:

> **One framework, two orthogonal axes.** Provenance (*observation / inference / assumption /
> unknown*) answers how a proposition arrived; credence (*established / probably-true / unknown /
> probably-false*) answers how likely it is true. Neither axis reduces to the other. A complete
> epistemic status entry carries both: `{ provenance, credence }` — **uniform in form**, with
> **honest constraints on which values are available for each proposition type** (the ruled
> constraints cover the four ATRF proposition types: impressions, candidate ideas, blast-radius
> assessments, completion signals).

Two sibling rulings arrive as named inputs, not context: per **Q-A2**, *"credence assignment
belongs to entry-type machinery outside [the ATRF's] scope — the Evaluative Engine Epistemic Status
Scoping Session ... is the correct home for credence assignment questions"* — the credence half is
this session's **owned subject matter**; and Q-A1's per-type honest-constraint pattern is the model
any engine-output status design composes with. (The 2026-08-21 Q2 ruling's opening line read *"Two
frameworks, two orthogonal axes"*; the ATRF scoping document surfaced that internal shape for the
mentor, and Q-A1 resolved it: *"One framework, two orthogonal axes. The headline lean is
confirmed."* Q-A1 governs. Nothing here re-opens it.)

**Grounding.** Opened 2026-08-23 at HEAD `0fd098c` (the commit that carried the Q-A1 ruling; the
window between the session prompt's drafting HEAD `6dcbe09` and `0fd098c` is the ATRF/O-C ruling
arc, documents-only — all sixteen ATRF rulings and the five O-C Gate-2 rulings are adopted and
executed; zero mentor ruling requests were outstanding at open). The engine files this document
cites have **no commits and no uncommitted changes** since the prompt's anchors were verified
(`git log`/`git status` on `website/src/lib/translation-sandwich/` — last engine commits predate
2026-08-23). Four peer sessions were active at open (`ListAgents`); this session writes only its
own new files and sequences its decision-log append explicitly at close.

**Tier and posture, confirmed at open:** `governance` — documents only; Standard risk under 0d-ii;
AC7 not engaged; no build, schema, flag, credential, migration, or live op. P0 0h hold active
(founder's 2026-08-22 direction: all current tasks before any 0h assessment). Model
`claude-fable-5`, effort high. Weights BLOCKED throughout; the Q1 hard constraint untouched;
ADR-012 governs the frame — the practice is a **measurement instrument**: a status layer discloses
measurement limits, it does not enforce.

**PR20 note.** Every present-tense mechanism fact below was re-verified first-hand this session
(2026-08-23, HEAD `0fd098c`) by direct file reads at the cited lines — not inherited from the
session prompt or the examination document. Both 2026-08-19 PR20 amendments bind this document.

**Independent adversarial review — RUN AND FOLDED before handover** (the ATRF three-reviewer
pattern, proportionate per the prompt's Part C): three independent reviewers over the finished
draft — code-anchor verification (45 anchors checked: 43 verified, 1 drift, 1 wrong), record-claim
/ ruling-fidelity verification (34 claims: 32 verified, 2 drift, 0 refuted), and
register-completeness/compliance audit (all seven checklist items PASS; 3 LOW findings). **All
findings folded into this revision**, including the convergent one — two reviewers independently
caught that this session's own first-pass "precision" about the phantasia-default disclosure
channel was itself wrong (see precision 1 below, which now records the correction rather than
hiding it) — plus the imprecise `guardrail-sandwich.ts` anchor (now pointing at
`synthesizeReasoning` itself), one paraphrase that had been dressed as a verbatim quote (§2.2 row
(f), now quoted exactly), an open-ended line range closed, and the §2.2 table's framing tightened
to raw-material-for-EE-A1.

Three grounding precisions the re-verification caught, reported rather than silently absorbed:

1. The causal-stage `phantasia` default is disclosed through the **Layer-2 ambiguity-notes
   channel** — `composeLayer2AmbiguityNotes` (`layer2-mechanisms.ts:2430-2451`, the note itself at
   `:2444-2447` — *"passion_diagnosis: causal stage defaulted to phantasia (no
   causal_stage_evidence in Layer 1)"*), wired via `:2950` into the `layer2_ambiguity_notes` field
   (`:402,:2969`). **Correction to an earlier draft of this precision, caught by the independent
   review:** this session's first pass mis-attributed the disclosure to `intake_clarifications` — a
   wholly separate mechanism (the AC-13/AC-14 Tier-2/3 trigger machinery, ~`:2286-2421`) that has
   nothing to do with this note. The examination document's original phrasing — "disclosed in
   ambiguity notes" — was in fact correct; it names Layer 2's own ambiguity-notes channel precisely.
2. The literal `does_not_attest` field lives in the S10 trust-record envelope
   (`trust-record-payload.ts:52`, `TRUST_RECORD_ENVELOPE`), served on
   `GET /api/trust-record/{agent_id}`; the R18 public surfaces carry **equivalent prose**, not the
   literal field (`agent-card.json:312` — *"does NOT attest factual correctness ..."*;
   `llms.txt:636/:678/:724/:735` — the *"cannot attest"* clauses). The surface-level-vs-field-level
   distinction (§2.4 below) survives unchanged; the citation is now precise.
3. A load-bearing fact the session prompt did not carry: **quiet site #1's string surfaces verbatim
   on the live `/api/guardrail` reasoning** — `synthesizeReasoning` (`guardrail-sandwich.ts:195`,
   called at `:350`) synthesizes the verdict's `reasoning` deterministically from the L2 kathekon
   justification (the field's own doc-comment at `:153,:156` states the same). Any wording change
   to that string is therefore a change to a live public verdict surface, not only to the signed
   assessment's interior (carried into EE-C1's constraints).

---

## §1 The subject, from the ruled records

**What "the engine" precisely is** (examination §0, re-verified this session): the examination
pipeline live on `/api/reason` and `/api/guardrail` — **Layer 1**, one Sonnet call
(`extractFeatures`, `MODEL_DEEP`, 4000 max-tokens, temperature 0.2 —
`layer1-extractor.ts:2262-2267`) whose every schema field is LLM inference over the submitted text,
anchored by mandatory verbatim `evidence` quotes (*"Quote the input verbatim in every `evidence`
field"* — the extraction contract at `layer1-extractor.ts:1816-1830`), self-constrained to
*"FEATURE EXTRACTION ONLY"* plus exactly **two licensed structured judgements** (per-circle
`obligation_assessment` and `examined_before_acting` — the prompt's *"TWO NARROW EXCEPTIONS"*
paragraph), with *"Do not guess"* routing uncertainty into the `ambiguity_notes`
declared-uncertainty channel; **Layer 2**, `applyMechanisms`/`computeProximity` — pure
deterministic computation over that inference (*"No LLM. No I/O. No async ... same Layer1Schema
input → byte-for-byte equal Layer2Assessment output"* — `layer2-mechanisms.ts:8-25`), Ed25519-signed.
**"Deterministic" is exact for Layer 2 and for the signature's claim (the computation is
reproducible from the extraction); the extraction is an inference layer, and the engine's epistemic
ceiling on every output is set there.**

**What this session prepares** (Direction 3 of the engine-evolution examination, found
**WELL-GROUNDED as classification-and-disclosure precision**): the engine already implements every
element of an epistemic-status account — explicit unknown values, observation anchoring,
declared-uncertainty channels, withheld classifications, disclosed conservative defaults,
per-mechanism quality scores, verdict provenance, surface envelopes — but **heterogeneously, in
per-mechanism vocabularies at three grains** (per-field corroboration findings; per-signal floors
and bases; per-surface envelopes). The open design question is whether one formal status per
consequential output — a fourth, finer grain — is worth its cost against that existing machinery,
and what the two quiet confidence-exceeds-basis sites should say. **This session's output is not a
ruling and not a final scope** — it is this scoping document, which the founder takes to the mentor;
the scope is finalised only after that feedback returns (the ATRF pattern, mentor-praised
2026-08-23).

---

## §2 The inherited-inputs register, dispositioned

Every item of the session prompt's Part B register is dispositioned here — in scope, out of scope
with named destination, or deferred with named condition. Nothing is silently omitted. Per-item
readiness is assessed honestly under the mentor's anti-overcorrection discipline (*"assess each
finding honestly and assign the epistemic status it actually warrants"*).

### 2.1 The Q-A1 ruling — APPLIED, never re-opened

**Disposition: IN SCOPE as governing structure.** This session applies `{ provenance, credence }` —
uniform in form, per-class honest constraints — to the engine's output population. Q-A1's ruled
per-type constraints cover the four ATRF proposition types; the engine's outputs are a different,
larger population, so the **application** (which output classes exist, what constraints are honest
for each) is this session's Group-A question set (§5). The structure itself is settled and no
question below invites its revision. **Readiness: READY** — structural application, prepared for
ruling.

### 2.2 The §3.2 per-output inventory — the ruled PRIMARY input

**Disposition: IN SCOPE — the primary input, re-verified this session.** The inventory below is
re-derived from source at the cited lines (not carried forward), grouped into the seven candidate
**output classes** the Group-A questions propose. The "Proposed provenance constraint" column is
**raw material feeding EE-A1, not a decided classing** — every value in it is re-opened verbatim by
EE-A1 for the mentor's ruling:

| Class | Outputs (verified anchors) | Proposed provenance constraint |
|---|---|---|
| **(a) Verbatim evidence spans** | mandatory verbatim quotes, R7 (`layer1-extractor.ts:1816-1830`) | **observation** — the anchor every classification wraps; the engine's only observation-class output |
| **(b) Layer-1 classifications** | passions (`sub_species` nullable — `layer1-extractor.ts:136`), circles, factors, urgency, orientation observations; *"Do not guess"* + `ambiguity_notes` | **inference**, observation-anchored; `ambiguity_notes` is the existing declared-uncertainty channel |
| **(c) The two licensed structured judgements** | per-circle `obligation_assessment`; `examined_before_acting` (the prompt's TWO NARROW EXCEPTIONS) | **inference**, bounded by explicit prompt licence |
| **(d) Explicit refusal states** | `sub_species: null`; `is_kathekon: null` (`layer2-mechanisms.ts:249`, with the intake note *"marginal — only one kathekon factor engaged; is_kathekon is undecidable"*, `:2456-2458`); argued `indeterminate` (`:1562-1565`); `single_snapshot` (`trajectory-overlay.ts:52,124`); orientation `indeterminate` + basis (`orientation-reading.ts:86,111,121-126`) | **unknown, expressed** — the ruled vocabulary's own term for a proposition the engine could not form |
| **(e) Disclosed conservative defaults** | absent obligation → reflexive (*"not a penalty — an accurate reading"*, `layer2-mechanisms.ts:1558`); stage-less grave act → reflexive read conservatively per-indicator (`:1680-1704`); mixed orientation → indeterminate (`orientation-reading.ts:121-126`); causal stage defaulted to phantasia, disclosed via the Layer-2 ambiguity-notes channel (`layer2-mechanisms.ts:2444-2447`, → `layer2_ambiguity_notes` at `:2969`) | **assumption, disclosed** (conservative direction, documented as accurate readings) |
| **(f) Doctrinal prior constants** | `honourability_grade`/`advantageousness_grade` from fixed per-circle `CIRCLE_HONOURABILITY_BASE`/`CIRCLE_ADVANTAGEOUSNESS_BASE` constants (`:772,:780`), factor-bumped (`:1130-1141`) — **undisclosed as priors today**; and the legacy `obligation_met` lexical scan (`computeObligationMet` — FULFILMENT/FAILURE substring match, explicit null), marked *"Retained for backward compatibility + display; NOT the §4 dikaiosyne resolution input"* (`:214-216`) | **assumption** — precisely Q-A1's own worked example of *"an assumption that is established (a foundational axiom treated as given)"*: candidate entry `{ provenance: assumption, credence: established }`, currently carrying no such label (→ EE-C3) |
| **(g) Layer-2 computed fields** | proximity base, kathekon quality, domain floors, aggregate; `proximity_floors.basis` names which domain floored the verdict (`:461,:477,:2976`); `stage_scores` per-mechanism not_applied/weak/adequate/strong (`:393,:2965`) | **the open structural question** — computation over inference, ceiling set by Layer 1 (→ EE-A2) |

Cross-cutting machinery, also re-verified: the **corroboration report** — `corroborated /
uncorroborated / contradicted` per claim, verbatim marker spans, monotone floor-only overrides — is
the one observation-anchored **checking** layer and is **conditional, not universal** (it runs only
when the caller supplied the action text AND the check flag is on AND dikaiosyne weighting is on —
`layer2-mechanisms.ts:2808-2818`); **Tier-1 halts** (TEMPORAL_AMBIGUITY `:2826-2838`,
SCOPE_AMBIGUITY `:2848-2859` — refuse-rather-than-guess, with ADR-008 §A.4 continuation
suppression); **Tier-2/3 withheld classifications** with named reasons (*"Eupatheia confirmation
requires longitudinal evidence ... The current instance does not provide this evidence"* —
`:2370`); the **reserved `*_inferred` motivation values** — `MotivationClassification` is a
five-state union (`virtue_explicit | virtue_inferred | convention_inferred |
unclear_pending_clarification | null`) with `virtue_inferred`/`convention_inferred` explicitly
*"reserved; not used at M1"* (`:148-158`) — a designed refusal to infer.

**Readiness: READY — this is done work.** The inventory is the examination's product, re-verified
here; the Group-A questions put its classing for ruling.

### 2.3 The two quiet sites — the disclosure-wording question

**Disposition: IN SCOPE (Group C). Readiness: SMALL AND READY.**

- **Quiet site #1** — the kathekon zero-factor justification. When no kathekon factor is extracted,
  the justification string is set to *"No kathekon factors detected; action is contrary to
  appropriate action."* (`layer2-mechanisms.ts:1271-1274`) — a substantive negative claim derived
  solely from **absence of extracted factors**, presented assertorically. It rides inside the
  signed assessment **and** surfaces verbatim on the live `/api/guardrail` verdict's `reasoning`
  (deterministic synthesis from the L2 kathekon justification — `synthesizeReasoning`,
  `guardrail-sandwich.ts:195`, called at `:350`). The eventual ruling owes this site its label: the
  wording, and where it rides (→ EE-C1).
- **Quiet site #2** — `ruling_faculty_state`'s deliberation input is still
  `oik.deliberation_notes.length > 0` (`layer2-mechanisms.ts:2903-2908`), which counts the *"No
  circles engaged in this snapshot."* filler note (`:1173`). The D4 fix was **deliberately scoped
  to proximity only**: `hasGenuineDeliberation` (`:1544-1548`) requires a substantive note, and its
  docstring states *"ruling_faculty_state is untouched this session (the broader proxy
  re-examination is a named follow-up)"* (`:1538-1543`). The follow-up is a **code** item with its
  own standing; this session's material is only the **disclosure while it stands** (→ EE-C2).

### 2.4 The three disclosed confidence-exceeds-basis routes + the signature condition

**Disposition: IN SCOPE as representation questions (Group D) — inherited as DISCLOSED ceilings the
status layer must represent honestly, never as things this session closes.** Re-verified:

1. **The lying-met route** — an *argued* `obligation_assessment: met` removes the dikaiosyne floor
   (top sentinel), with only the *unargued* case guarded (*"an unargued 'met' is treated as
   unevaluated (gameable-floor guard)"* — `layer2-mechanisms.ts:1566-1569`).
2. **The lying `examined_before_acting` route** — *"Disclosed ceiling: a LYING
   `examined_before_acting: true` on a rash carried-out act lifts the floor ... a LOCUS-2
   extraction-quality / Goodhart ceiling"*, closing it named as a follow-up *"gating the
   model-creator/weights tier"* (`:1695-1700`).
3. **The A2 self-report-omission class** — structural: *"It CANNOT close the structural half — a
   harm genuinely absent from the text has nothing to corroborate against. That residual is the
   weights-tier problem ... disclosed, NOT addressed here. Do not over-claim."*
   (`corroboration-check.ts:15-22`).

Plus the general condition: inference fields ride inside a **signed** assessment whose signature
attests the deterministic computation, not the extraction's truth — disclosed today at **surface
level** (the S10 envelope's `does_not_attest` list, `trust-record-payload.ts:52`; the equivalent
R18 prose at `agent-card.json:312` and the `llms.txt` *"cannot attest"* clauses), **not at field
level**. Field-level is the question (→ EE-D2). **Readiness: READY to put** once the Group-A/B
answers fix what a field-level entry would even be.

### 2.5 The core cost question

**Disposition: IN SCOPE (Group B) — the genuine open design question of the session.** Which
outputs count as consequential; whether one uniform field is worth its cost against the existing
three-grain machinery; presented with an explicit option gradation rather than a presumed answer
(→ EE-B1/EE-B2). **Readiness: a genuine open design question** — the scoping prepares it with the
honest cost/benefit structure; it does not lean it to a conclusion.

### 2.6 The §3.3 boundary — kept

**Disposition: KEPT as a binding boundary (→ EE-E1).** **Status-as-disclosure is the finding**
(additive fields, the established record-and-floor pattern, no verdict changes).
**Status-as-gate is structural revision, outside the finding and unexamined** — the engine already
gates on specific unknowns in bounded calibrated places (Tier-1, evidence floors, the conservative
obligation defaults); a general confidence-exceeds-basis gate carries over-strictness risk of
exactly the class the ADR-010 §4 history documents. The gating variant is **named as out of scope**
(§3) and may be proposed as its own future scoped question; it is not folded in.

### 2.7 The measured-surface implementation constraint — carried without pre-deciding

**Disposition: CARRIED.** `layer1-extractor.ts` / `layer2-mechanisms.ts` are in the `/api/reason`
and `/api/guardrail` import graphs; any eventual wiring — including a one-string wording change to
quiet site #1, which reaches the live guardrail's `reasoning` — is PR19-reviewed `code-critical`
work under the byte-identity disciplines. This session is documents-only and licenses none of it.
The constraint is **named inside the cost question** (an added field inside the signed assessment
changes the signed bytes; a wording change changes a live verdict surface) without pre-deciding any
design.

### 2.8 Boundary items — dispositioned explicitly

- **The ATRF/harness side — settled inputs, consumed not re-scoped:** provenance assignment/check
  at the generation step by the runner, disclosed on the proposal shape (Q-A2, ruled); the
  blast-radius vocabulary — null-plus-flag, `manifest.md:269` untouched (Q-A4, ruled); the
  completion-signal statuses — inference / inference-with-credence-constraint / unknown on the
  refuse branch (Q-C4, ruled, cited as settled input); GS-ATRF-4's routing (ruled standalone;
  ATRF-session home per the 2026-08-21 Q1 dated correction). None re-opened here.
- **Q-C2b** (discriminating signatures) — the standing-runner design session's, per its ruled home.
  Not consumed.
- **§6.9** (whether inquiry-discipline outputs feed the public trust record) — far downstream, not
  inherited; stays an unowned named question (→ EE-E3 confirms).
- **The D4-scope code follow-up** behind quiet site #2 — its own standing as a code item; not
  absorbed here (only the interim disclosure question is this session's, → EE-C2).
- **Weights BLOCKED throughout** — restated as a design constraint in its own right: a status
  field, once served, is a new claim surface; no status field may become a training-reward surface
  (→ EE-B2 names this in the cost structure).

---

## §3 Explicitly out of scope (named destinations; nothing silently dropped)

| Item | Destination / condition |
|---|---|
| **Status-as-gate** (blocking/flooring outputs whose confidence exceeds basis, as a general posture) | Its own future scoped question, if ever proposed — unexamined; carries the ADR-010 §4 over-strictness class as its named risk. Nothing in this session's question set licenses it. |
| Harness-side status assignment, check, disclosure (GS-ATRF-4) | Ruled (Q-A2); consumed as settled input |
| The blast-radius vocabulary | Ruled (Q-A4: null-plus-flag); settled input |
| Completion-signal proposition statuses | Ruled (Q-C4); settled input |
| Q-C2b — discriminating-signature design | The standing-runner design session (ruled home; Q4.3 precedent + F-Q43 carried there) |
| §6.9 — inquiry-discipline outputs feeding the public trust record | Far downstream; unowned; not inherited |
| The `ruling_faculty_state` proxy **fix** (D4 completion) | The named code follow-up (`layer2-mechanisms.ts:1538-1543`'s own text); separately scoped, PR19-reviewed `code-critical` when elected |
| Any implementation/wiring of any eventual ruling | Separately scoped, PR19-reviewed `code-critical` on the measured surfaces; nothing here licenses it |
| The ATRF session's other material, the standing-runner design session, the puzzle-taxonomy entry types, the Consciousness and Continuity Obligation | Untouched, per the session prompt's own boundary |
| The generative-process examination (Q-E1's category) | The Sage Calling engine's diagnostic apparatus (ruled home) |
| Orientation readings' own disclosure regime (the mentor-Q6 inline clauses; examined/observed classes) | Governed by its own rulings; any status design **composes with** it and re-opens none of it |

---

## §4 Boundary dispositions (proposals for the mentor to confirm — not assumptions)

1. **The engine-output population vs the ATRF proposition population are distinct, and this
   session's rulings bind only the former.** Q-A1's per-type constraints continue to govern the
   four ATRF types unchanged; the Group-A questions propose *engine-output* classes in the same
   pattern. Proposed as a boundary, for confirmation.
2. **The two quiet sites' wording questions are disclosure-only.** Neither EE-C1 nor EE-C2 may
   change a classification, a floor, or any downstream consequence — a wording ruling that changed
   `is_kathekon` behaviour would be status-as-gate territory and is not asked for. Proposed as a
   constraint on the rulings themselves.
3. **Meta/overlay outputs with their own ruled disclosure regimes** (`meta.trajectory` + delta,
   practice suggestions, orientation readings, the loop fold) are **outside the v1 consequential
   population** — each already carries its own ruled per-surface honesty machinery, and folding
   them in would re-open ruled designs. Proposed as a v1 boundary, with the composition question
   (one day, one vocabulary?) held as a named open question (§7.3), not answered.

---

## §5 Proposed question set for the mentor

Each question is self-contained; mechanism facts are stated in the question per PR20 (verified
2026-08-23 at HEAD `0fd098c`). Numbering is `EE-*` to keep these unambiguous from the ATRF set's
`Q-*`.

### Group A — Applying the ruled entry structure to the engine's outputs

**EE-A1 — The output-class table and its per-class honest constraints.** Q-A1 ruled the epistemic
status entry `{ provenance: observation | inference | assumption | unknown, credence: established |
probably-true | unknown | probably-false }` — uniform in form, with per-proposition-type honest
constraints — for the four ATRF proposition types. The engine's outputs are a different, larger
population. The verified inventory groups them into seven classes (§2.2's table): (a) verbatim
evidence spans; (b) Layer-1 classifications; (c) the two licensed structured judgements; (d)
explicit refusal states; (e) disclosed conservative defaults; (f) doctrinal prior constants; (g)
Layer-2 computed fields. **Question:** does the ruled entry structure govern engine outputs in the
same pattern — uniform in form, per-class honest constraints — and are the proposed classes and
their provenance constraints as tabled in §2.2 correct? In particular: (i) class (a) as the
engine's only observation-class output; (ii) class (d) as `unknown, expressed` (the same claim as
Q-A3's *"the honest provenance status for a proposition the agent could not form"*); (iii) class
(f) as Q-A1's own assumption-established example (*"a foundational axiom treated as given"*).

**EE-A2 — The provenance of deterministic computation over inference.** A Layer-2 computed field
(proximity, floors, aggregate — class (g)) arrives by pure deterministic computation
(`layer2-mechanisms.ts:8-25`: no LLM, no I/O, byte-for-byte reproducible) over Layer-1 inference;
the signature attests that computation's reproducibility, not the extraction's truth. The ruled
four-value provenance vocabulary contains no "computation" value. **Question:** which is the honest
expression — (a) **inference**, inheriting the weakest provenance of the field's inputs (the
examination's own language: *"computation over inference — ceiling set by Layer 1"*), with the
computation's determinism expressed on a different axis (the signature); (b) a distinct fifth
provenance value (a vocabulary amendment only a ruling makes — noting Q-A4's discipline that a new
vocabulary value makes a different epistemic claim than an annotation); or (c) a compound entry
(provenance: inference; plus a named derivation disclosure)? The scoping leans (a) and puts the
lean for ruling, not as an answer.

**EE-A3 — The credence axis for engine outputs (the owned Q-A2 subject matter).** Q-A2 ruled that
credence assignment belongs to this session. The engine is deterministic: it cannot form a *new*
judgement of likelihood; any credence it serves must be **derived deterministically from existing
machinery** (the `ambiguity_notes` refs, `stage_scores`' input-emptiness/ambiguity grading, the
corroboration findings, the evidence floors) — or not served at all. **Question, in three parts:**
(i) should engine outputs carry a credence value at all, or does the existing three-grain machinery
*already constitute* the engine's credence expression (in per-mechanism vocabularies rather than
the ruled four-value one)? (ii) if credence is served, is deterministic derivation from the
existing machinery the only honest assignment path (any new LLM judgement being a new inference
layer, i.e. structural revision outside this scope)? (iii) how does the ruled credence vocabulary
relate to the live **corroboration findings vocabulary** (`corroborated / uncorroborated /
contradicted` — the mentor-A1 S3-combiner routing key): a mapping (corroborated → probably-true;
uncorroborated → unknown; contradicted → probably-false), a derivation input, or deliberate
coexistence without mapping? The corroboration vocabulary's routing role must not be disturbed by
any answer.

### Group B — Consequentiality and the cost question

**EE-B1 — Which outputs count as consequential.** Proposed criterion: an output is consequential
iff it (a) determines or floors a verdict (proximity and its domain floors, the obligation
resolution, the kathekon assessment, Tier-1 triggers); or (b) is served on a public or consumer
surface (the signed assessment's fields; the `/api/guardrail` verdict fields including its
synthesized `reasoning`; trust-record fields); or (c) feeds a trust event or accreditation record.
Internal intermediates (e.g. the evidence-quote aggregation at `layer2-mechanisms.ts:2868-2875`)
are not. Meta/overlay outputs with their own ruled disclosure regimes are outside the v1 population
(§4.3). **Question:** is this criterion correct, and is the resulting population (the §2.2
inventory's classes (a)–(g) as served) the right v1 scope?

**EE-B2 — The uniform-field cost question (the core of the session).** The engine's status
machinery exists at three grains today; the design question is whether a fourth, finer grain — one
formal `{ provenance, credence }` entry per consequential output — is worth its cost. Three shapes
are put, in ascending wire impact:

- **Shape 1 — documentation-only.** A field-level status map (per-output provenance/credence
  constraints, the §2.2 table matured) published on the R18 surfaces (`llms.txt`,
  `agent-card.json`, api-docs); the wire untouched. Cost: near-zero build; drift risk between the
  published map and the code is managed by the existing PR20/R18 disciplines. Limit: a consumer
  must join the map to the payload by hand; nothing rides the signed bytes.
- **Shape 2 — gap-filling.** Status entries added **only where the existing machinery is silent**:
  the doctrinal priors (class (f) — currently undisclosed as priors), the two quiet sites' labels
  (Group C), and the computed-field derivation disclosure (per EE-A2's answer) — each additive,
  record-and-floor pattern, no verdict change; everything already-disclosed stays in its existing
  per-mechanism vocabulary, with the Shape-1 map published over the whole.
- **Shape 3 — full uniform field.** Every consequential output carries the entry. Maximal
  uniformity; maximal cost.

Cost dimensions stated honestly: every added field inside the signed assessment **changes the
signed bytes** (measured surfaces; PR19 `code-critical`; byte-identity disciplines); a uniform
field **restating** what floors/bases/corroboration already express creates a second disclosure
channel that can drift from the first (this stream's own citation-drift history is the evidence the
risk is real); reader burden grows with schema surface; and a **served credence value is a new
claim surface** — under the weights-BLOCKED constraint it must never become a training-reward
surface, and under the LOCUS-2 history any new served claim is a new optimization target to
consider. Benefit dimensions: uniformity for cross-output comparison; one place a consumer checks;
the fourth grain generalises a shape the corroboration report and `proximity_floors.basis` already
demonstrate. **Question:** which shape (or staging of shapes — e.g. 1 now, 2 on election, 3 never
or later) is worth its cost?

### Group C — The disclosure-wording questions (small and ready)

**EE-C1 — Quiet site #1's label.** Current wording, verified: *"No kathekon factors detected;
action is contrary to appropriate action."* (`layer2-mechanisms.ts:1271-1274`) — a substantive
negative claim derived solely from absence of extracted factors, presented assertorically; it rides
inside the signed assessment and surfaces verbatim on the live `/api/guardrail` `reasoning`
(`synthesizeReasoning`, `guardrail-sandwich.ts:195`, called at `:350`). **Question, two parts:**
(i) the wording — should the string carry
its derivation explicitly (direction, for the mentor to fix or replace: *"No kathekon factors were
extracted from the submitted text; on that absence, the engine reads the action as contrary to
appropriate action."*), consistent with class (e)'s disclosed-default pattern (*"an accurate
reading, not a penalty"*)? (ii) where it rides — rewording the justification string in place (a
wire change on both measured surfaces) versus an additive disclosure note alongside it (the
record-and-floor pattern)? Constraint (per §4.2): disclosure-only — the `is_kathekon = false`
classification and every downstream consequence are unchanged by any answer.

**EE-C2 — Quiet site #2: the interim label, and its sequencing against the fix.** Verified:
`computeRulingFacultyState`'s deliberation input is `oik.deliberation_notes.length > 0`
(`layer2-mechanisms.ts:2903-2908`), which counts the *"No circles engaged in this snapshot."*
filler (`:1173`); the D4 fix was deliberately proximity-only and names the broader proxy
re-examination a follow-up (`:1538-1543`). The **fix** is a code item with its own standing, not
this session's. **Question:** while the proxy stands, does the status layer owe
`ruling_faculty_state` an interim disclosure (a label that its deliberation input is a legacy proxy
that counts the filler note), or is the honest sequencing to leave it unlabelled and let the named
code follow-up supersede the need — and if a label is owed, does it ride the assessment or the
Shape-1 documentation map?

**EE-C3 — The doctrinal-prior grades' label.** Verified: `honourability_grade` /
`advantageousness_grade` derive from fixed per-circle doctrinal constants
(`layer2-mechanisms.ts:772,:780`), factor-bumped (`:1130-1141`), riding the assessment with no
marker that they are priors; the sibling `obligation_met` field, by contrast, is explicitly marked
legacy/display-only in its type docstring (`:214-216`). Q-A1's own example fits exactly:
*"an assumption that is established (a foundational axiom treated as given)."* **Question:** do the
prior-derived grades need an explicit status entry (`{ provenance: assumption, credence:
established }`, doctrinal basis named), a documentation-map disclosure (Shape 1), or no label
(on the reading that a committed doctrinal constant is the framework itself, not a proposition the
engine asserts about the submitted text)?

### Group D — Representing the disclosed ceilings and the signature scope

**EE-D1 — The three ceilings at whatever grain is elected.** The lying-met route
(`layer2-mechanisms.ts:1566-1569`), the lying `examined_before_acting` route (`:1695-1700`), and
the A2 self-report-omission class (`corroboration-check.ts:15-22`) are inherited as DISCLOSED
ceilings; nothing here closes them. If per-field status entries exist (Shapes 2/3): (i) should
`obligation_assessment` and `examined_before_acting` — the two licensed judgements that carry the
first two ceilings — carry a **conditionality marker** (corroboration-checked on this consult vs
not, the check being conditional per `:2808-2818`)? (ii) the A2 class is structurally
per-field-unmarkable (a clean lie is indistinguishable from truth at the field level — that is what
"structural" means), so its representation necessarily stays at surface/documentation level;
**question:** confirm that per-field status must never *imply* A2 coverage (an entry reading
`inference, corroborated` must not read as "verified true"), and give the constraint its wording.

**EE-D2 — The signature-scope disclosure grain.** The condition — the Ed25519 signature attests the
deterministic computation's reproducibility from the extraction, never the extraction's truth — is
disclosed today at surface level (`trust-record-payload.ts:52`'s `does_not_attest` list;
`agent-card.json:312`; the `llms.txt` clauses), not on the assessment itself. **Question:** does
this one general condition deserve a field-level-adjacent home — a single fixed envelope note
riding inside the signed assessment (one addition, not per-field) — or does moving/duplicating it
into the signed bytes add a second copy that can drift from the canonical surface disclosure
without adding honesty? (The drift-vs-honesty trade is the same one EE-B2 prices; this question is
its sharpest single instance.)

### Group E — Boundary confirmations

**EE-E1 — The §3.3 boundary.** Confirm: every ruling in this set is disclosure-side; no ruling in
this set licenses a gate; the status-as-gate variant, if ever wanted, is its own future scoped
question carrying the ADR-010 §4 over-strictness class as its named risk.

**EE-E2 — The harness-side settlements.** Confirm they are consumed as settled inputs and none is
re-opened: Q-A2 (runner-assigned provenance at generation; credence here), Q-A4 (null-plus-flag),
Q-C4 (completion-signal statuses), GS-ATRF-4's ruled routing.

**EE-E3 — The unowned far-downstream items.** Confirm §6.9 (inquiry-discipline outputs and the
public trust record) stays unowned and uninherited; confirm the D4-completion code follow-up keeps
its own standing; confirm the v1 population boundary of §4.3 (meta/overlay outputs under their own
ruled regimes).

---

## §6 Proposed sequencing

1. **EE-A1 → EE-A2 → EE-A3** — the structural application first (everything else consumes its
   vocabulary; A2's computed-field answer feeds A3's derivation question; A3 is the owned Q-A2
   subject matter and should not be ruled before A1/A2 fix what an engine-output entry is).
2. **Group C next** (small and ready): EE-C1 and EE-C2 are rulable on their own facts; EE-C3
   benefits from EE-A1's confirmation of the assumption-established example — sequenced after A1,
   which step 1 already guarantees.
3. **EE-B1 → EE-B2** — the cost question is honest only once the entry's content (Group A) and the
   gap list (Group C's answers determine how much "gap" Shape 2 would fill) are known.
4. **Group D after A and B** — EE-D1/EE-D2 presuppose the elected grain.
5. **Group E** — confirmations; may be ruled at any point, listed last for completeness.

The one hard external dependency is already discharged (Q-A1). No question in this set gates any
other session; the standing-runner design session and the O-C Gate-3 design session are parallel
tracks (ruled 2026-08-21 Q5 / 2026-08-23).

---

## §7 Named open questions the scoping could not settle

1. **Whether "computation over inference" is expressible in the ruled four-value vocabulary without
   amendment** — EE-A2 puts the lean (inference, ceiling-inherited); the scoping cannot settle it.
2. **Whether a deterministically-derived credence is meaningful at all for engine outputs** — the
   derivation-circularity worry: a credence computed from `ambiguity_notes` + `stage_scores` +
   corroboration findings may only restate those inputs in a second vocabulary, adding a drift
   surface without adding information. EE-A3(i) puts this; the scoping flags it, not answers it.
3. **The eventual composition question for meta/overlay outputs** — whether the per-surface
   disclosure regimes (trajectory, suggestions, orientation, loop fold) should one day converge on
   the same entry vocabulary, or stay deliberately per-surface. Held (§4.3); no owner proposed.
4. **Double-disclosure drift management** — if Shape 2 or 3 is elected, which discipline owns
   keeping the field-level entries and the existing three-grain machinery consistent (a PR20-class
   obligation, but on the wire rather than the records). Named for the eventual build scoping, not
   this session's.
5. **Sequencing between the D4-completion code follow-up and the quiet-site-#2 interim label** —
   EE-C2 puts the question; if the mentor rules "label while unfixed," the label's own lifetime
   (removed when the fix lands?) needs stating at build scoping.
6. **Whether any eventual wire change can be staged dark behind a flag** consistent with the
   byte-identity disciplines on the measured surfaces — an implementation question for the
   PR19-reviewed build scoping; carried, not answered (the record-and-floor + flag-off-byte-identical
   precedent suggests yes, but that is precedent, not a verified design).

---

## §8 What this document does not do

It rules nothing — every EE-question is prepared for the mentor; the founder relays; the scope is
finalised only after feedback returns. It touches no code (documents only; the byte-identity guard
posture unchanged; the engine files verified unmodified at open). It re-opens no ruling — Q-A1 is
applied, not revised; the harness-side settlements are consumed as settled. It does not consume the
ATRF session's other material, the standing-runner design session, the puzzle-taxonomy entry types,
or the Consciousness and Continuity Obligation. It does not fold in the status-as-gate variant. It
licenses no build, route, flag, credential, schema, or migration; any eventual implementation is
separately scoped, PR19-reviewed `code-critical` work on the measured surfaces. Weights remain
BLOCKED; the Q1 hard constraint is untouched; the R20a perimeter and auth are untouched; the P0 0h
hold stands and the 0h call remains the founder's.

---

## §9 Cross-references

**Rulings and records (verbatim wins over every summary):**
- `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md` —
  Q-A1 (the gate-discharging ruling; the entry structure), Q-A2 (credence home = this session),
  Q-A3 (`unknown` = basis-absent, same claim), Q-A4 (null-plus-flag), Q-C4 (completion-signal
  statuses)
- `operations/agent-circles-2026-08/2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md`
  — Q2 (the two vocabularies; the named input), Q3 (this session's charter), Q5 (parallel tracks)
- `operations/agent-circles-2026-08/2026-08-22-DESIGN-EXAMINATION-deterministic-engine-evolution-four-directions.md`
  — §0 (what the engine is), §3 (Direction 3: the two vocabularies, the per-output inventory, the
  precision/structural-revision split), §5 (the D3 map rows), §6.9, §7 (the routing paragraph)
- `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`
  — the ruled provenance vocabulary + governing rule (*"confidence of an explanation must never
  exceed its evidential basis"*); read for inheritance, harness routing untouched
- `operations/agent-circles-2026-08/2026-08-23-ATRF-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW.md` — §2.4
  (how the vocabulary question was framed) and §10 (the finalisation pattern; the boundary)
- `operations/handoffs/founder/2026-08-23-ATRF-scoping-session-CLOSE.md` (through Addendum 3) — the
  predecessor close; zero ruling requests outstanding at this session's open
- `adopted/adr/2026-06-24-sage-practice-measurement-instrument-reframe.md` (ADR-012) — the
  measurement-instrument frame every disclosure design keeps
- `operations/handoffs/founder/2026-08-23-evaluative-engine-epistemic-status-scoping-NEXT-SESSION-PROMPT.md`
  — this session's opening prompt (gate-check discipline; the Part-B register)

**Code anchors (all re-verified this session, 2026-08-23, HEAD `0fd098c`):**
- `website/src/lib/translation-sandwich/layer2-mechanisms.ts` — :8-25 (Layer-2 purity docstring);
  :148-158 (`MotivationClassification` + reserved `*_inferred`); :214-216 (`obligation_met`
  legacy/display marker); :249 (`is_kathekon` nullable); :461/:477/:2976 (`proximity_floors` +
  basis); :393/:2965 (`stage_scores`); :772/:780 + :1130-1141 (doctrinal prior constants);
  :1173 (the filler note); :1271-1274 (quiet site #1); :1538-1548 (the D4-scope docstring +
  `hasGenuineDeliberation`); :1558/:1562-1565/:1566-1569 (`obligationToProximity` — J1 default,
  argued-indeterminate, the lying-met ceiling); :1680-1704 (the andreia conservative floor + the
  lying-`examined` LOCUS-2 ceiling at :1695-1700); :2370 (Tier-2 eupatheia withholding);
  :2430-2451 (`composeLayer2AmbiguityNotes` — the phantasia-default disclosure at :2444-2447,
  wired via :2950 into `layer2_ambiguity_notes` at :402/:2969); :2456-2458 (the `is_kathekon: null` intake
  note); :2808-2818 (the corroboration conditional); :2826-2859 (Tier-1 triggers + suppression);
  :2903-2908 (quiet site #2)
- `website/src/lib/translation-sandwich/layer1-extractor.ts` — :136 (`sub_species` nullable);
  :1816-1830 (FEATURE EXTRACTION ONLY; the two licensed judgements; "Do not guess" +
  `ambiguity_notes`; verbatim evidence); :2262-2267 (`extractFeatures` — MODEL_DEEP, 4000 tokens,
  temperature 0.2)
- `website/src/lib/translation-sandwich/corroboration-check.ts` — :15-22 (the A2 structural
  residual disclosure)
- `website/src/lib/guardrail-sandwich.ts` — :195 (`synthesizeReasoning` — the verdict `reasoning`
  synthesized from the L2 kathekon justification, called at :350; the field's doc-comment at
  :153/:156 — quiet site #1's live surface)
- `website/src/lib/translation-sandwich/orientation-reading.ts` — :86/:111/:121-126 (indeterminate
  + basis; the conservative mixed-evidence default)
- `website/src/lib/substrate/trajectory-overlay.ts` — :52/:124 (`single_snapshot`)
- `website/src/lib/substrate/trust-core/trust-record-payload.ts` — :45-79 (`TRUST_RECORD_ENVELOPE`
  — the literal `attests`/`does_not_attest` lists; `does_not_attest` opens at :52)
- `website/public/llms.txt` — :636/:678/:724/:735 (the *"cannot attest"* clauses);
  `website/public/.well-known/agent-card.json` — :312 (the trust-record extension's *"does NOT
  attest"* prose)

---

## §10 Mentor rulings returned (2026-08-23) — scope FINALISED; every EE-question ruled

**Source (verbatim wins):**
`operations/agent-circles-2026-08/2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md`.
The founder relayed the mentor's response the same day with the direction **"proceed"** — the
finalisation election. The response confirms the document's construction (the folded adversarial
review named *"the right posture"*), carries one standing observation for the record (*"the impulse
to sharpen can overshoot the target"* — the phantasia-channel first-pass error class), and rules
every question:

- **EE-A1:** all seven output classes CONFIRMED with per-class rulings; class (b)'s
  `ambiguity_notes` named as the unknown value's existing per-mechanism implementation; class (c)'s
  status entry to name the prompt licence explicitly (the honest provenance, not a disclaimer);
  **class (e)'s credence is `established`, not probably-true** (principled defaults with documented
  direction), entry `{ provenance: assumption, credence: established }` with the conservative
  direction named; class (f) assumption-established.
- **EE-A2:** option (a) RULED — **inference, weakest-provenance-inherited**; the fifth
  "computation" value DECLINED (*"a transformation method, not an epistemic origin"*); a derivation
  **note** warranted (documentation map, or additive field per build scoping), never a vocabulary
  value.
- **EE-A3:** the existing three-grain machinery IS the engine's credence expression; deterministic
  derivation the ONLY honest assignment path (a new LLM likelihood judgement = structural
  revision); the corroboration vocabulary is a **derivation input, not a mapping** (*"corroborated
  means probably-true ... is not always true"*); routing role untouched; the §7.2 circularity worry
  held, not dismissed.
- **EE-C1:** wording RULED, in place at `layer2-mechanisms.ts:1271-1274`: *"No kathekon factors
  were extracted from the submitted text; **on that basis**, the engine reads the action as
  contrary to appropriate action."* ("basis," not the proposed "absence" — absence can read as a
  claim about the world rather than the extraction). No additive sibling note (two channels = the
  drift risk). A wire change on two measured surfaces — **PR19-reviewed `code-critical` at build
  scoping; not licensed by the ruling.**
- **EE-C2:** an interim label IS owed; rides the **Shape-1 documentation map** (constant
  architectural fact, not per-consult); **removed at the same commit the D4-completion fix lands**
  — that follow-up inherits this as a named step, stated now.
- **EE-C3:** documentation-map disclosure; no wire entry; the map entry's wording ruled verbatim.
- **EE-B1:** criterion CONFIRMED plus condition **(d)** — *"named in a disclosure that a consumer
  is expected to act on"* (the corroboration report's per-claim findings the clearest example);
  the §4.3 v1 boundary confirmed.
- **EE-B2:** **Shape 2 elected; Shape 1 its unconditional prerequisite; Shape 3 deferred** (its own
  future scoped question if a concrete cross-output-credence use case exists). **Shape 2 fills
  provenance gaps only — no credence field** (the circularity worry constrains it).
- **EE-D1:** conditionality marker at documentation-map level (ruled wording); the A2-coverage
  standing constraint's wording FIXED (*"per-field status entries do not imply A2 coverage and must
  not be constructed to suggest it"*).
- **EE-D2:** the signature-scope condition STAYS at surface level (*"one place, one copy, one
  discipline"*); the map carries the ruled forward pointer, never the signed bytes.
- **EE-E1/E2/E3 and all three §4 boundary proposals:** CONFIRMED as stated.

**What the rulings hand forward, each through its own gates:** Shape 1 (the documentation map —
future documents-work, founder-elected, carrying the ruled EE-C2/C3/D1/D2 wordings + the EE-A2
derivation note); Shape 2's build scoping (PR19-reviewed `code-critical`, incl. the EE-C1
rewording); the D4-completion follow-up's inherited label-removal step; Shape 3 deferred. **No
build, route, flag, credential, or schema is licensed by the rulings — their own words.**

---

*End of scoping document. The scope above was reviewed by the mentor and finalised by the founder
2026-08-23 (§10; the header's dated note governs the reading). The rulings' verbatim record wins
over every summary here.*
