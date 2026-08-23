# Evaluative Engine — epistemic-status documentation map (Shape 1)

**Status: AUTHORED 2026-08-23** under the binding rulings in
`operations/agent-circles-2026-08/2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md`
(**verbatim wins over anything in this document**). Shape 1 is the ruling's **unconditional
prerequisite**: *"Required regardless of which shape is elected… Shape 1 runs first,
unconditionally."*

**Tier:** `governance` — documents only. **This document changes no wire, no classification, no
floor, and no downstream consequence.** It names, in one place, what the engine's existing status
machinery already expresses.

**Publication:** Shape 1's own definition (EE scoping document §EE-B2) is *"A field-level status map
… published on the R18 surfaces (`llms.txt`, `agent-card.json`, api-docs)."* Publication is
therefore a **public-contract change** and rides the standing R18 gate — founder-signed wording
**before** any public surface is touched. The proposed surface diffs are in the companion sign-off
package: `2026-08-23-evaluative-engine-shape1-r18-signoff-package.md`. **Nothing in this document is
live until that package is signed and applied.**

---

## 0. What this map is, and what it is not

**Is:** a consumer-facing statement of the epistemic status of each class of engine output, in the
ruled two-axis vocabulary — `{ provenance: observation | inference | assumption | unknown, credence:
established | probably-true | unknown | probably-false }` (Q-A1, ATRF rulings 2026-08-23). Uniform
in *form*; per-class honest constraints on which values are available.

**Is not:**
- **Not a wire change.** No status entry is added to any payload by this map. Shape 2's wire work is
  separate, `code-critical`, PR19-reviewed, and consists of exactly one string rewording (EE-C1).
- **Not a credence field.** EE-B2: *"Shape 2 fills the provenance gaps; it does not add a credence
  field."* The credence axis for engine outputs remains expressed in the existing per-mechanism
  vocabularies (`ambiguity_notes`, `stage_scores`, corroboration findings) — the derivation-
  circularity worry constrains it, and no concrete cross-output-credence use case exists yet.
- **Not a gate.** EE-E1: *"Every ruling in this set is disclosure-side. No ruling in this set
  licenses a gate."*
- **Not the ATRF proposition population.** The rulings bind only the **engine-output** population.
  Q-A1's per-type constraints continue to govern the four ATRF proposition types unchanged.
- **Not the meta/overlay outputs.** Trajectory, practice suggestions, orientation readings, and the
  loop fold each sit under their own ruled disclosure regime and are **outside** the v1
  consequential population (§4.3, EE-E3 confirmed).

**Weights BLOCKED throughout.** Nothing in this map is a training signal, and a served status value
must never become one.

---

## 1. The consequential population (EE-B1)

An engine output is **consequential** — and therefore in this map's v1 scope — when **any** of:

- **(a)** it determines or floors a verdict;
- **(b)** it is served on a public or consumer surface;
- **(c)** it feeds a trust event or accreditation record;
- **(d)** it is named in a disclosure that a consumer is expected to act on.

Condition (d) is the ruling's addition (EE-B1). Its clearest instance is the corroboration report's
per-claim findings: served conditionally, but when served, a consumer is expected to act on them.

---

## 2. The map — seven output classes

Each row states the class, its verified anchors, and its ruled status. **Provenance and credence are
orthogonal**: a proposition can be an observation that is probably false (a misread instrument), or
an assumption that is established (a foundational axiom treated as given). Neither axis reduces to
the other.

### (a) Verbatim evidence spans — `{ provenance: observation }`

**What:** the mandatory verbatim quotes the extraction contract requires (R7,
`layer1-extractor.ts:1816-1830`).

**Status:** **observation.** This is the engine's **only** observation-class output. Every
classification the engine makes wraps an observation anchor; the anchor itself is observation.

**Why it matters to a consumer:** it sets the ceiling. The engine's inference outputs are
**inference-over-observation, not inference-from-nothing.**

### (b) Layer-1 classifications — `{ provenance: inference }`, observation-anchored

**What:** passions (`sub_species` nullable, `layer1-extractor.ts:136`), oikeiosis circles, kathekon
factors, urgency indicators, orientation observations.

**Status:** **inference, observation-anchored.**

**Existing credence expression:** the *"Do not guess"* routing and the `ambiguity_notes`
declared-uncertainty channel are **not separate from** the entry structure — they are its current
per-mechanism implementation of the `unknown` value within this class.

### (c) The two licensed structured judgements — `{ provenance: inference }`, licence-bounded

**What:** per-circle `obligation_assessment`; `examined_before_acting`. These are the extraction
prompt's **two narrow exceptions** to its own feature-extraction-only remit.

**Status:** **inference, bounded by explicit prompt licence.** The licence boundary is itself a
disclosure: these two outputs are inference operating at the edge of what the extraction contract
authorises. **The licence is named as the honest provenance of the judgement — not as a
disclaimer.**

**Conditionality marker (EE-D1(i)), ruled wording:**

> `obligation_assessment` and `examined_before_acting` are corroboration-checked on this consult only
> when the action text was supplied, the check flag was on, and dikaiosyne weighting was on
> (`layer2-mechanisms.ts:2808-2818`); unchecked otherwise.

This is a **constant architectural fact, not a per-consult finding** — which is why it rides this map
rather than the wire.

### (d) Explicit refusal states — `{ provenance: unknown }`, expressed

**What:** `sub_species: null`; `is_kathekon: null` (`layer2-mechanisms.ts:249`, with the intake note
*"marginal — only one kathekon factor engaged; is_kathekon is undecidable"*); argued `indeterminate`;
`single_snapshot` (`trajectory-overlay.ts`); orientation `indeterminate` + basis
(`orientation-reading.ts`).

**Status:** **unknown, expressed.** The alignment with Q-A3 is exact: `unknown` in the provenance
vocabulary means **the engine could not form the proposition**. All of the above are the same claim.

**This map adds no information here.** It names what the existing machinery already expresses.

### (e) Disclosed conservative defaults — `{ provenance: assumption, credence: established }`

**What:** absent obligation → reflexive (*"not a penalty — an accurate reading"*,
`layer2-mechanisms.ts:1558`); a stage-less grave act read conservatively per-indicator; mixed
orientation → indeterminate; causal stage defaulted to phantasia, disclosed via the Layer-2
ambiguity-notes channel.

**Status:** **`{ provenance: assumption, credence: established }`, with the conservative direction
named.**

**The credence value is `established`, NOT `probably-true`** — this is the ruling's own correction of
the proposed table (EE-A1(e)). These are **not guesses**; they are principled defaults with a
documented direction. The default is not probably-true *in the sense of uncertain*; it is
**established as the conservative reading given the available evidence.**

### (f) Doctrinal prior constants — `{ provenance: assumption, credence: established }`

**What:** `honourability_grade` / `advantageousness_grade`, derived from the fixed per-circle
`CIRCLE_HONOURABILITY_BASE` / `CIRCLE_ADVANTAGEOUSNESS_BASE` constants and factor-bumped by the
extraction. Also the legacy `computeObligationMet` lexical scan, retained for backward compatibility
and display and explicitly **not** the §4 dikaiosyne resolution input.

**Status (EE-C3), ruled wording — this entry's text is fixed by the ruling and is reproduced
verbatim:**

> `honourability_grade` and `advantageousness_grade` are derived from fixed per-circle doctrinal
> constants (the Stoic framework's own structure), factor-bumped by the extraction. They are not
> extracted from the submitted text; they are prior-based assessments,
> `{ provenance: assumption, credence: established }`.

**Why a label is owed at all:** the constants *are* the framework — but the **grades derived from
them are propositions the engine asserts about the submitted text**. A consumer reading a grade
without knowing it is prior-derived may treat it as an extraction finding. The map corrects that
impression **without adding a wire field** (the wire-entry option was considered and **not
elected**).

### (g) Layer-2 computed fields — `{ provenance: inference }`, weakest-provenance-inherited

**What:** proximity base, kathekon quality, per-domain floors, the aggregate; `proximity_floors.basis`
(which domain floored the verdict); `stage_scores` (per-mechanism
`not_applied` / `weak` / `adequate` / `strong`).

**Status (EE-A2):** **inference, inheriting the weakest provenance of the field's inputs.**

**The derivation note (EE-A2), which rides this map and is NOT a vocabulary value:**

> These fields are **deterministically derived** from the Layer-1 extraction. The determinism is real
> and is attested — but it is expressed on the **signature** axis, not the provenance axis. A Layer-2
> computed field arrives by deterministic computation over Layer-1 inference; the computation does
> not change the proposition's epistemic origin. If the input is inference, the output is inference,
> regardless of how reliably the transformation was performed.

**A fifth `computation` provenance value was considered and DECLINED.** Computation is a
**transformation method, not an epistemic origin**. A `computation` value would claim it is one,
parallel to observation / inference / assumption / unknown. It is not.

---

## 3. Standing constraints on the whole status layer

### 3.1 The A2-coverage constraint (EE-D1(ii)) — ruled wording, fixed

> A per-field status entry of `{ provenance: inference, credence: probably-true }` must not be read as
> verified true. The engine cannot detect a clean lie at the field level — a well-formed false input
> produces a well-formed output. The A2 structural residual is disclosed at the surface level;
> per-field status entries do not imply A2 coverage and must not be constructed to suggest it.

**This is a standing constraint on the entire status layer**, not a per-field annotation. It binds
every present and future entry in this map.

### 3.2 The signature-scope forward pointer (EE-D2) — ruled wording, fixed

> The Ed25519 signature attests the deterministic computation's reproducibility from the extraction;
> it does not attest the extraction's truth. See `does_not_attest` (`trust-record-payload.ts:52`) and
> the R18 surface disclosures for the full condition.

**The condition itself stays at surface level — one place, one copy, one discipline.** It is a
constant architectural fact about the signature; moving or duplicating it into the signed bytes would
create a second copy of a constant claim, where the two copies can drift from each other without
either being wrong in isolation. **This map carries a pointer, never the condition's canonical
copy.**

### 3.3 The three disclosed confidence-exceeds-basis routes

Named here so a consumer reading this map does not have to rediscover them. None is closed by
anything in this map.

1. **The lying-`met` route** — an *argued* `obligation_assessment: met` removes the dikaiosyne floor;
   only the *unargued* case is guarded (the gameable-floor guard, `layer2-mechanisms.ts:1566-1569`).
2. **The lying `examined_before_acting` route** — a lying `examined_before_acting: true` on a rash
   carried-out act lifts the floor. A LOCUS-2 extraction-quality / Goodhart ceiling; closing it is a
   named follow-up gating the model-creator/weights tier.
3. **The A2 self-report-omission class** — structural. A harm genuinely absent from the text has
   nothing to corroborate against. **Disclosed, not addressed. Do not over-claim.**

---

## 4. What Shape 2 changes on the wire, and what it does not

**Shape 2 is elected** (EE-B2), with Shape 1 as its unconditional prerequisite and **Shape 3
deferred**. Shape 2's total wire footprint on the engine is **one string**:

**EE-C1 — ruled wording, applied verbatim, in place:**

> No kathekon factors were extracted from the submitted text; on that basis, the engine reads the
> action as contrary to appropriate action.

replacing *"No kathekon factors detected; action is contrary to appropriate action."*

**Why "on that basis" and not "on that absence":** the proposed direction read *"on that absence"*;
the ruling substituted *"on that basis"* because **"absence" can read as a claim about the world**
(no factors exist) **rather than a claim about the extraction** (no factors were found in the text).
The engine's reading is grounded in what the extraction produced, not in a claim about what the
action contains.

**An additive disclosure note alongside the string was considered and NOT elected** — two disclosure
channels for one claim is the drift risk. The in-place rewording is a single change to a single
string.

**THE CLASSIFICATION IS UNCHANGED.** EE-C1 and EE-C2 change no classification, no floor, and no
downstream consequence. `is_kathekon = false` and everything derived from it are exactly as before.
This is a wording change and nothing else.

**Shape 3 (a full uniform `{provenance, credence}` field on every consequential output) is
DEFERRED** — its own future scoped question, only if a concrete cross-output-credence use case ever
exists.

---

## 5. What this map deliberately leaves alone

- **§6.9** (inquiry-discipline outputs on the public trust record) — unowned, uninherited, far
  downstream, no session assigned.
- **The EE-A3 credence-field wire option** — explicitly not elected.
- **`practitionerContext`'s unlabelled defect** and the larger `projectContext` architectural fix —
  both named elsewhere, both deliberately untouched; the latter is mentor-ruled **not to be built
  unless the founder explicitly asks**.
- **The composition question** — whether the per-surface disclosure regimes should one day converge
  on the same entry vocabulary — held as a named open question, unowned, no session proposed.

**Closed since this map was authored** (kept out of the list above, which carries only genuinely
still-untouched items): **the D4-completion proxy fix**, BUILT 2026-08-23
(`D-D4-COMPLETION-RULING-FACULTY-DELIBERATION-PROXY-REPLACED-2026-08-23`) — `ruling_faculty_state`
now reads the substantive-note predicate, and the interim label this map carried under EE-C2 was
removed in that same commit, exactly as the ruling required.

---

## 5b. Named bounds — the oikeiosis-only scope of `ruling_faculty_state`

Added 2026-08-23 at the D4-completion commit as a bound recorded in-repo with no public wording.
**Superseded 2026-08-24: the bound is RULED to owe a public scope note**
(`2026-08-24-mentor-ruling-oikeiosis-scope-note-verbatim.md`, adopted as binding). It is no longer
a deliberately-unpublished bound; it is a pending R18 publication awaiting founder-signed wording.

- **`ruling_faculty_state`'s deliberation reading is oikeiosis-only.** It is drawn solely from the
  oikeiosis mechanism — a cross-circle tension or a `balanced_neither_decisive` Cicero verdict. It
  reads nothing from the control filter, the value assessment, or the causal-stage evidence, so a
  snapshot that deliberates entirely in those mechanisms is reported as not-deliberating, and the
  branch then emits the strongest available negative claim: *"Disengaged — no passions, no
  deliberation; ruling faculty at rest."*

  **This is pre-existing and was NOT created by the D4-completion fix**, which narrowed the
  deliberation input without widening where it reads from. Nor was it what EE-C2's interim label
  disclosed — that label described the presence-vs-substantive proxy, a different gap, now closed.
  Evidence that it is not an edge case: `website/smoke_a_prod.json`, a real production consult with
  **two** engaged circles, four sorted control-filter elements and causal evidence spanning
  phantasia→praxis, already reads that exact string under the PRE-fix code.

  **RULED 2026-08-24 — the bound owes a public scope note.** The mentor's reasoning: EE-C2 held that
  the label should disclose what the field actually measures, not what a consumer might assume, and
  *"the oikeiosis-only bound is that same gap in a different form."* Crucially the two disclosures
  are **distinct and both owed** — the retired interim label named *a deficiency in how the
  oikeiosis mechanism counts* deliberation; this note names *the scope of what the mechanism reads
  at all*, which is **prior**. *"The proxy disclosure does not substitute for the scope note."*

  **Lifetime:** the note **stays until the mechanism's scope changes** — a separate build decision,
  not a proxy fix. It is not retired by any future D4-style correction.

  **The mentor declined to rule on wording** (they have not seen a draft) and fixed the required
  content instead — three clauses, the third explicitly flagged as mattering: the reading is drawn
  from the oikeiosis mechanism only; a snapshot deliberating in the control-filter,
  value-assessment or causal-stage mechanisms but not in oikeiosis reads as not-deliberating; and
  **this is a scope constraint on the field, not a deficiency in the snapshot.** The note must not
  imply the snapshot is incomplete or that the agent failed to deliberate.

  **The 2026-08-23 draft below FAILS that requirement** and is retained only as the superseded
  record: it carries the first two clauses and omits the third.

  > *superseded draft, not for publication —* "`ruling_faculty_state`'s deliberation reading is
  > drawn solely from the oikeiosis mechanism (a cross-circle tension or a balanced Cicero verdict).
  > A snapshot that deliberates only in the control-filter, value-assessment or causal-stage
  > mechanisms reads as not-deliberating."

  **Carried to its own session**, R18-gated on founder signature:
  `operations/handoffs/founder/2026-08-24-oikeiosis-scope-note-r18-publication-NEXT-SESSION-PROMPT.md`
  carries revised candidate wording covering all three clauses, for all **three** surfaces —
  `llms.txt`, `agent-card.json` and `api-docs/page.tsx`. Note the mentor's positional hint
  (*"adjacent to the interim proxy disclosure"*) does not locate anything on the third surface:
  api-docs carried the map but never the interim clause.

---

## 6. Rollback

`git revert` the records commit. Documents only; nothing deploys from this file. If the companion
R18 sign-off package has already been applied to the public surfaces, revert that commit
independently — the two are deliberately separable.

---

## 7. Cross-references

- `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md` — **binding; verbatim wins**
- `operations/agent-circles-2026-08/2026-08-23-EVALUATIVE-ENGINE-EPISTEMIC-STATUS-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW.md` — the scoping document (§2.2 inventory, §10 rulings-returned)
- `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-atrf-sixteen-questions-verbatim.md` — Q-A1's entry structure, Q-A3's `unknown`
- `operations/agent-circles-2026-08/2026-08-23-evaluative-engine-shape1-r18-signoff-package.md` — the
  publication half. **Signed and shipped**; its `ruling_faculty_state` interim paragraph and
  agent-card clause were retired at the D4-completion commit, so the package's proposed text no
  longer matches the live surfaces and must not be re-derived from (marked in the package itself).
- `operations/handoffs/founder/2026-08-23-evaluative-engine-epistemic-status-scoping-CLOSE.md` — the predecessor close
