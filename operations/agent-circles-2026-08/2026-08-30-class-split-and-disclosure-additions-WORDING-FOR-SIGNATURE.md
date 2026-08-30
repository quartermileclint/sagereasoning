# Wording for signature — the class split (A5), the kathekon role-deficiency (A2), and the hexis-vs-drift limit (A3)

**STATUS: DRAFT FOR THE FOUNDER'S SIGNATURE. NOT APPLIED. Authoring this licensed nothing.**
Authored 2026-08-30, executing three rulings of the same day.

**Binding sources (win over this draft):**
- `2026-08-30-mentor-ruling-borderline-class-definition-verbatim.md` (A5 — Q3/Q4/Q5)
- `2026-08-30-mentor-ruling-set-E-A2-A3-A4-D-verbatim.md` (A2; A3 item 1)

**Three rulings are bundled into one package deliberately.** All three change the same four files, and
this disclosure has already been applied four times in three days. **A fifth and a sixth application
for separate one-sentence additions would be governance cost with no honesty gain.** If you prefer
them split, say so and they split — but the coverage risk rises with each pass, and every blocking
defect in this arc has been coverage.

**No figure changes. No pin is retired. Nothing is retracted.** A5 Q4 is explicit: *"This is a
description update, not a retraction."*

---

## Part 1 — A5: the class split (Q3), and the description update (Q4/Q5)

### 1a. The governing definition — the naming clarification (Q3)

The frozen `input_class` currently names one class. It is **split into two named classes**, which the
ruling calls **disambiguation, not repartitioning** — *"naming two things that were always different
but were called by one name."*

- **Grave-vocabulary traffic** — the honest description of what the Gate-1 harness and the IDEA loop
  actually submit at the default band. **This is what the n=100 record measured.**
- **Near-boundary inputs** — actions whose verdicts sit near the proceed/block boundary, where the
  gate's probabilistic behaviour is decision-relevant. **This is the population a disagreement rate is
  properly computed about.** Nothing has been measured on it as a defined population.

**The criterion that separates them is `proximity to the proceed/block boundary`, and it is governed
because it is derived from what "borderline" was always intended to mean** — not from the observation
that p1 and p3 showed zero variance. The ruling's own test: *"could this revision criterion have been
stated before the sweep ran, as a clarification of what the definition intends?"* It could.

**Applied in the repo only** — the instrument's `d6a-probes.json` `input_class`, the run records'
`input_class` field, and the ADR amendment. **The frozen text of what was measured is NOT rewritten**;
the split is recorded as a clarification carrying its own date, so the record of what the sweep was
told it was measuring stays legible.

### 1b. The published surfaces — the description update (Q4)

**Every place that describes the n=100 record as measured "on a borderline input class" is renamed to
name the population accurately.** The ruled form:

> measured across grave-vocabulary traffic

with the finding, stated where the class limit already sits:

> near-boundary behaviour is concentrated in one member of the measured population.

**What does NOT change:** every figure; the per-input distributions and their leading position; the
indeterminacy passage; the composition dependence; the stability finding; the anchor and its
falsification; path specificity; the deploy-proxy caveat; the revision note.

**Coverage warning, because this is the highest-risk edit in the package.** "Borderline" appears
**4 times in the envelope, 8 in `llms.txt`, 11 in `agent-card.json`, 2 in api-docs — 25 occurrences.**
**They are not all the same claim.** Some name the *measured population* (rename); some name the
*probe set* or an individual probe (leave); some appear inside the frozen `input_class` quotation
(leave). **Each occurrence must be classified individually before any is touched, and the
classification recorded.** A blanket find-and-replace would rewrite the frozen definition quotation
and silently falsify the record — the single most likely way to get this wrong.

---

## Part 2 — A2: the kathekon role-relativity deficiency

The `guardrail-signed-sandwich/v1` extension already carries a **role-blindness** note. It presents
role-blindness as a **scoping statement**. The ruling reclassifies it: *"a design deficiency, not a
design choice."* The note is amended to say so, and the same statement is added to the surfaces that
describe the gate's evaluation but currently carry no role note at all.

> The gate's evaluation takes no role input. Kathēkon is role-relative — what is appropriate depends
> on the agent's roles and relationships, and an evaluation without role context assesses whether an
> action is the kind of thing a rational agent should do in general, not whether it is the kind of
> thing **this** agent should do. **This is a confirmed design deficiency, not a design choice**, and
> it is recorded as one pending the standing-runner design session.

**No behaviour changes. No role input is added.** The ruling is explicit that it *"does not require
immediate remediation."*

## Part 3 — A3 item 1: consistency is evidence of stable disposition, not proof

The envelope's **discriminative-range** does-not-attest item already says stability *"may reflect
absence of perturbation, not tested relapse-resistance."* That is **adjacent but not the same claim**.
The ruled limit is about what consistency can evidence at all, and it is added **as its own
statement**, not folded into the existing one:

> Consistency of examination outputs is evidence of stable disposition, not proof of it; the harness
> cannot distinguish hexis — a genuinely stable disposition toward virtue — from drift, a settled
> pattern of habitual response that has stopped being examined, from the outside.

**Melete (A3 item 2) is a routed design gap and changes no text here.**

---

## Battery pins

- **S2-65** — `env.includes('grave-vocabulary traffic')` — the Q4 population name.
- **S2-66** — `env.includes('evidence of stable disposition, not proof')` — the A3 limit.
- **S2-67** — `env.includes('cannot distinguish hexis')` — its operative half, pinned separately so
  the mechanism cannot be dropped while the hedge survives.
- **S2-62/63/64 unchanged; S2-64's ordering assertion must still hold after the rename. S2-54 NOT
  retired and NOT edited** — a fourth consecutive revision leaving it alone.

All mutation-verified before commit. **S2-64 must be re-verified against a re-inversion after the
rename, not merely re-run.**

## ADR-013 §8

One further dated amendment recording all three, **and A4 and D, which change no public text and would
otherwise exist only in the verbatims**: A4 reopens nothing and licenses no `SUBSTRATE_LAYER3_ENABLED`
activation; D's byte-identity guard now has a defined end condition where it had none.

---

## Ordering

1. **Classify all 25 "borderline" occurrences and record the classification** before editing any.
2. Envelope + ADR amendment + pins, one commit.
3. The six R18 places.
4. Re-derive the extension count.
5. **Live-verify by `curl`: order, the rename, and that no frozen quotation was rewritten.**

*Nothing here is applied. Signature required before any public surface changes.*
