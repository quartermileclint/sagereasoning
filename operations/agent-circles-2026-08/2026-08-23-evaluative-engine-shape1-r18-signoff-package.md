# R18 sign-off package — Evaluative Engine epistemic-status map (Shape 1 publication)

**Status: AWAITING FOUNDER SIGNATURE. Nothing here has been applied to any public surface.**

> **AMENDED 2026-08-23 on founder review, before signature.** Four items, all applied:
> **(1)** the three-disclosed-routes paragraph in Surface 1 was rewritten to distinguish the three
> routes' *character* rather than listing them as equivalent — the argued
> `obligation_assessment: met` route is **by design** (the argument is the guard; verified at
> source: the engine returns `sage_like` only when `justification.trim().length > 0` and
> `reflexive` otherwise), the lying-`examined_before_acting` route is the **A2 residual in a
> specific form**, and only the third is **structural**. Conflating them understated the first and
> overstated the second. The paragraph carried no RULED marker, so it was freely amendable.
> **(2)** Surface 2's agent-card description now says the credence axis is *expressed, not absent*.
> **(3)** the interim-disclosure removal condition is now tracked as a work item.
> **(4)** the cross-surface forward-pointer match is verified and pinned as a commit-time check.

**Why this package exists.** Shape 1's own definition is *"A field-level status map … published on
the R18 surfaces (`llms.txt`, `agent-card.json`, api-docs)"* — so landing it is a **public-contract
change**, not internal documentation. The standing R18 discipline in this project is that the founder
signs the wording **before** any public surface is touched (precedent:
`operations/connective-layer-2026-08/2026-08-15-q5c-q13a-r18-docs-signoff-package.md`, concurrent-arc
C1). This package carries the exact proposed text for each of the three surfaces so the signature is
given against what will actually ship, not against a summary of it.

**Source of every claim below:** the ruled wordings in
`2026-08-23-mentor-rulings-evaluative-engine-epistemic-status-verbatim.md` and the map at
`2026-08-23-evaluative-engine-status-documentation-map.md`. Where the ruling fixed a wording, it is
reproduced **verbatim** and is marked as such — those passages are not open to editing without
re-consulting.

**What this package does NOT do:** it adds no field to any payload, changes no classification, no
floor, and no downstream consequence. It publishes a map of what the engine's existing machinery
already expresses. Shape 2's separate one-string wire change (EE-C1) is documented in surface 1's
text below because it lands in the same wave, but it is a distinct change with its own PR19 review.

---

## Surface 1 — `website/public/llms.txt`

**Insertion point:** a new `### Epistemic status of engine outputs` section immediately **after** the
existing `### Verifying signed assessments` section (currently ending at the key-rotation paragraph)
and **before** `### Guardrail — Stoic Risk Gate for AI Agents (V3)`.

**Why there:** EE-D2's forward pointer references the signature-scope condition, and the signature
section is where a consumer has just been told what the signature covers. The map's first job is to
say what it does *not* cover.

**Proposed text (verbatim ruled passages marked ⟦RULED⟧):**

````
### Epistemic status of engine outputs

Every engine output carries an epistemic status on two orthogonal axes:
`provenance` (how did this proposition arrive?) — `observation | inference | assumption | unknown`;
and `credence` (how likely is it true?) — `established | probably-true | unknown | probably-false`.
Neither axis reduces to the other: a proposition can be an observation that is probably false (a
misread instrument), or an assumption that is established (a foundational axiom treated as given).

This section is a MAP, not a wire field. No status entry is added to any payload. It names, in one
place, what the engine's existing machinery already expresses per-mechanism, so a consumer can join
the map to the payload. There is deliberately no served `credence` value — the credence axis stays
expressed in the existing per-mechanism vocabularies (`ambiguity_notes`, `stage_scores`, the
corroboration report's findings).

Seven output classes:

(a) Verbatim evidence spans — provenance: observation. The engine's ONLY observation-class output.
    Every classification wraps an observation anchor, so the engine's inference outputs are
    inference-over-observation, not inference-from-nothing.

(b) Layer-1 classifications (passions, oikeiosis circles, kathekon factors, urgency indicators,
    orientation observations) — provenance: inference, observation-anchored. The extraction's
    "do not guess" routing and its `ambiguity_notes` channel are this class's existing expression of
    the `unknown` value; they are not separate from the status structure.

(c) The two licensed structured judgements (`obligation_assessment`, `examined_before_acting`) —
    provenance: inference, bounded by explicit prompt licence. The licence boundary is itself the
    disclosure: these two outputs are inference operating at the edge of what the extraction contract
    authorises.
    ⟦RULED⟧ Conditionality: `obligation_assessment` and `examined_before_acting` are
    corroboration-checked on this consult only when the action text was supplied, the check flag was
    on, and dikaiosyne weighting was on (layer2-mechanisms.ts:2808-2818); unchecked otherwise.

(d) Explicit refusal states (`sub_species: null`; `is_kathekon: null`; an argued `indeterminate`;
    `single_snapshot`; orientation `indeterminate`) — provenance: unknown, expressed. `unknown` means
    the engine COULD NOT FORM the proposition. All of these are the same claim.

(e) Disclosed conservative defaults (an absent obligation read as reflexive; a stage-less grave act
    read conservatively; a mixed orientation read as indeterminate; a defaulted causal stage) —
    `{ provenance: assumption, credence: established }`, with the conservative direction named. The
    credence is `established`, NOT `probably-true`: these are not guesses, they are principled
    defaults with a documented direction — established as the conservative reading given the
    available evidence.

(f) Doctrinal prior constants —
    ⟦RULED⟧ `honourability_grade` and `advantageousness_grade` are derived from fixed per-circle
    doctrinal constants (the Stoic framework's own structure), factor-bumped by the extraction. They
    are not extracted from the submitted text; they are prior-based assessments,
    `{ provenance: assumption, credence: established }`.

(g) Layer-2 computed fields (proximity base, kathekon quality, per-domain floors, the aggregate,
    `proximity_floors.basis`, `stage_scores`) — provenance: inference, inheriting the WEAKEST
    provenance of the field's inputs. Derivation note: these fields are deterministically derived
    from the Layer-1 extraction; that determinism is real and is attested, but it is expressed on the
    SIGNATURE axis, not the provenance axis. Computation is a transformation method, not an
    epistemic origin — so there is no fifth `computation` provenance value, deliberately.

Two standing constraints on the whole status layer:

⟦RULED⟧ A per-field status entry of `{ provenance: inference, credence: probably-true }` must not be
read as verified true. The engine cannot detect a clean lie at the field level — a well-formed false
input produces a well-formed output. The A2 structural residual is disclosed at the surface level;
per-field status entries do not imply A2 coverage and must not be constructed to suggest it.

⟦RULED⟧ The Ed25519 signature attests the deterministic computation's reproducibility from the
extraction; it does not attest the extraction's truth. See `does_not_attest`
(trust-record-payload.ts:52) and the R18 surface disclosures for the full condition.

Interim disclosure — `ruling_faculty_state`. This field's deliberation input is currently a proxy: it
counts the presence of deliberation notes rather than testing whether any note is substantive, so a
filler note is counted as deliberation. The correction that fixed this class was deliberately scoped
to the proximity reading only; `ruling_faculty_state` was left on the older proxy, and its own
docstring says so. Named here while the proxy stands; this paragraph is removed at the same commit
that replaces the proxy.

Three disclosed routes where confidence can exceed basis, none closed by this map. First: an
ARGUED `obligation_assessment: met` removes the dikaiosyne floor — this is by design; the
argument is the guard, and the floor's removal is conditional on the argument's presence, not a
gap in the guard. Second: a lying `examined_before_acting: true` on a rash carried-out act lifts
the floor — the engine cannot detect a clean lie at the field level (stated above); this is the
same A2 residual in a specific form. Third: a harm your self-report omits from the text entirely
has nothing to corroborate against — this is structural, disclosed, not addressed.

This map covers ENGINE outputs only. The trajectory overlay, practice suggestions, orientation
readings, and the loop fold each sit under their own disclosure regime and are outside it.
````

**Also in `llms.txt`, in the existing `### Guardrail` section:** the `reasoning` field's wording
changes with Shape 2. No new prose is needed — the guardrail section does not quote the string — but
this package records the change so the surface's reviewer knows what moves:

> The zero-kathekon-factor justification, which rides inside the signed assessment and surfaces
> verbatim on the live guardrail `reasoning`, changes from *"No kathekon factors detected; action is
> contrary to appropriate action."* to the ⟦RULED⟧ string: **"No kathekon factors were extracted from
> the submitted text; on that basis, the engine reads the action as contrary to appropriate
> action."** The classification (`is_kathekon: false`) and every downstream consequence are
> **unchanged**.

---

## Surface 2 — `website/public/.well-known/agent-card.json`

**Change:** ONE new entry appended to `capabilities.extensions` — **23 → 24 extensions**.

**Proposed entry:**

```json
{
  "uri": "https://sagereasoning.com/extensions/epistemic-status-map/v1",
  "description": "A published map of the epistemic status of the deterministic engine's outputs, on two orthogonal axes: provenance (observation | inference | assumption | unknown — how did this proposition arrive?) and credence (established | probably-true | unknown | probably-false — how likely is it true?). This is a MAP, not a wire field: no status entry is added to any payload, and there is deliberately NO served credence value (the credence axis is expressed, not absent — it lives in the existing per-mechanism vocabularies rather than as a discrete field): ambiguity_notes, stage_scores, the corroboration report's findings. Seven output classes: (a) verbatim evidence spans are observation, the engine's only observation-class output, so every inference output is inference-over-observation rather than inference-from-nothing; (b) Layer-1 classifications are inference, observation-anchored, with the extraction's 'do not guess' routing and ambiguity_notes as this class's existing expression of unknown; (c) the two licensed structured judgements (obligation_assessment, examined_before_acting) are inference bounded by explicit prompt licence, and are corroboration-checked on a given consult ONLY when the action text was supplied, the check flag was on, and dikaiosyne weighting was on — unchecked otherwise; (d) explicit refusal states (sub_species null, is_kathekon null, an argued indeterminate, single_snapshot, orientation indeterminate) are unknown, expressed — unknown means the engine could not form the proposition; (e) disclosed conservative defaults are { provenance: assumption, credence: established } with the conservative direction named — established, NOT probably-true, because these are principled defaults with a documented direction rather than guesses; (f) honourability_grade and advantageousness_grade are derived from fixed per-circle doctrinal constants (the Stoic framework's own structure), factor-bumped by the extraction — they are not extracted from the submitted text, they are prior-based assessments, { provenance: assumption, credence: established }; (g) Layer-2 computed fields are inference, inheriting the WEAKEST provenance of their inputs — the computation's determinism is expressed on the signature axis, not the provenance axis, because computation is a transformation method and not an epistemic origin (there is deliberately no fifth 'computation' provenance value). Two standing constraints bind the whole layer. First: a per-field status entry of { provenance: inference, credence: probably-true } must not be read as verified true — the engine cannot detect a clean lie at the field level, a well-formed false input produces a well-formed output, and per-field status entries do not imply A2 coverage and must not be constructed to suggest it. Second: the Ed25519 signature attests the deterministic computation's reproducibility from the extraction; it does not attest the extraction's truth (see does_not_attest and the R18 surface disclosures for the canonical condition, which is deliberately held in ONE place rather than duplicated into the signed bytes). Interim disclosure: ruling_faculty_state's deliberation input is currently a proxy that counts the presence of deliberation notes rather than testing whether any note is substantive; this disclosure is removed at the same commit that replaces the proxy. Disclosure-side only — nothing in this map gates, floors, or classifies anything, and it covers engine outputs only (the trajectory overlay, practice suggestions, orientation readings, and the loop fold each sit under their own regime, outside it)."
}
```

---

## Surface 3 — `website/src/app/api-docs/page.tsx`

**Insertion point:** one new `<li>` in the existing `/api/reason` bullet list, immediately **after**
the *"What the profile measures (it is not a fact-checker)"* bullet — the two are adjacent claims
about what the assessment does and does not establish.

**Proposed bullet:**

```
<li>
  <strong>Epistemic status of engine outputs (a map, not a field)</strong> &mdash; every engine output
  carries a status on two orthogonal axes: <code>provenance</code>
  (<code>observation | inference | assumption | unknown</code>) and <code>credence</code>
  (<code>established | probably-true | unknown | probably-false</code>). <strong>No status entry is
  added to any payload</strong> and no <code>credence</code> value is served &mdash; the map names what
  the existing machinery already expresses. In brief: verbatim evidence spans are the engine&apos;s only
  <em>observation</em>-class output; Layer-1 classifications are <em>inference</em>, observation-anchored;
  <code>obligation_assessment</code> and <code>examined_before_acting</code> are inference bounded by
  explicit prompt licence, and are corroboration-checked only when the action text was supplied and both
  flags were on; explicit refusal states (<code>sub_species: null</code>, <code>is_kathekon: null</code>,
  an argued <code>indeterminate</code>) are <em>unknown</em> &mdash; the engine could not form the
  proposition; conservative defaults and the doctrinal prior grades
  (<code>honourability_grade</code>/<code>advantageousness_grade</code>, derived from fixed per-circle
  constants and <strong>not</strong> extracted from your text) are
  <code>{'{ provenance: assumption, credence: established }'}</code>; and Layer-2 computed fields are
  inference inheriting the <strong>weakest</strong> provenance of their inputs &mdash; the
  computation&apos;s determinism is attested on the <em>signature</em> axis, not the provenance axis. A
  status of <code>{'{ inference, probably-true }'}</code> <strong>must not be read as verified
  true</strong>: the engine cannot detect a clean lie at the field level, and these entries do not imply
  coverage of that residual. See llms.txt &quot;Epistemic status of engine outputs&quot; for the full map.
</li>
```

---

## What the founder is signing

1. **The wording above ships to three public surfaces** on the next push after signature.
2. **Passages marked ⟦RULED⟧ are the mentor's own fixed wording** and were not composed here.
3. **No wire field, no classification change, no floor change** is authorised by this signature.
   Shape 2's one-string EE-C1 rewording is a separate `code-critical` change under its own PR19
   review.
4. **The `ruling_faculty_state` interim disclosure carries its own removal condition** — it comes out
   at the same commit that replaces the proxy. Signing this does not schedule that fix. The
   condition is now **tracked as a work item** (`2026-08-23-D4-completion-proxy-fix-WORK-ITEM.md`),
   which enumerates every surface the removing commit must clear — added on the founder's
   governance-hygiene note that a condition living only in the text it governs has no owner.
5. **Extension count moves 23 → 24.**

## If the founder declines or amends

Any passage NOT marked ⟦RULED⟧ is freely amendable — say so and it is redrafted before anything
ships. A ⟦RULED⟧ passage cannot be amended here; changing one is a new mentor question.

## Commit-time check (all three surfaces ship together)

**The api-docs forward pointer and the llms.txt section heading must match exactly.** They do as
drafted — the heading is `### Epistemic status of engine outputs`, and the api-docs bullet ends
with a pointer naming that exact string — verified string-for-string in this package. The match is
**intentional, not incidental**: it is what lets a consumer locate the section without scanning.
Re-verify it at the commit that ships both surfaces, because they live in different files and a
heading reworded on one side would silently orphan the pointer on the other.

## Rollback

`git revert` the publication commit. The three surfaces are static content plus one JSON entry plus
one JSX list item; reverting restores them exactly. The map document
(`2026-08-23-evaluative-engine-status-documentation-map.md`) is deliberately a **separate** commit so
the internal record survives a publication rollback.
