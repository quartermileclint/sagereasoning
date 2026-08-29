# The nine-candidate remediation-shaped classification

**Date:** 2026-08-29. **Tier:** `governance` — a practitioner-facing classification act.
**Status:** Complete. **No code, schema, flag, credential, or build was touched.**
Production was read, read-only, and not written.

Executes **step 4** of the mentor's ruled Q7 sequence
(`2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`): *"run the nine-candidate
classification separately from the review… the classification is a practitioner-facing governance
act and the review is a systems analysis; conflating them would compromise both."*

Discharges the gap the bounded validation run's §6 report named rather than closed
(`2026-08-16-idea-loop-S6-report.md`, "The guardrail calibration limit"): *"A full test of the
hypothesis is therefore NOT completed here… This gap is named rather than silently closed with a
plausible-sounding guess."*

---

## 0. Headline

**The hypothesis under test — that the guardrail's attribution defect systematically depressed
remediation-shaped candidates — is NOT supported by the record.** It is not refuted as a
*mechanism* (the mentor's cycle-20 diagnosis stands, unreversed), but it fails as an explanation
of *which* candidates were rejected.

**This headline was corrected 2026-08-29 by independent PR19 review — see §11.** The first
committed version of this document claimed the base rate of remediation-shape across the full 120
was "essentially the entire population," making the 8/9 rejection rate "indistinguishable from
chance." **That claim was overstated.** An independent reviewer classified a fresh sample of the
111 non-rejected candidates against this document's own criterion and found a base rate near
**63%**, not near-universal. This session then verified, in full and without sampling, that the
entire 20-candidate `fifth_circle_weighting` heuristic bucket (published SDK proposals, pure reach,
no described defect) is uniformly NOT remediation-shaped — a hard floor consistent with the
reviewer's independent estimate. Under a corrected base rate of 60–65%, observing 8 of 9 rejected
candidates land remediation-shaped has an estimated probability of roughly **0.07–0.12 under pure
chance** — a real, mild departure worth naming, but nowhere near strong enough on its own, at n=9,
to carry the "systematic depression is ruled out" conclusion the first version rested on it.

**The finding that survives, and now carries the primary evidential weight, is §3's within-run
divergence control — independently confirmed strong by review, and unaffected by this
correction:**

1. **At least three of the nine rejections have near-verbatim or materially identical twins
   elsewhere in the same run that scored `deliberate`, `principled`, or `sage_like`** — the
   sharpest, c11 ↔ c13, differing only in a parenthetical cycle list (independently fuzzy-matched
   at 0.944 similarity against a next-best score under 0.25 for every other candidate pair in the
   set, per review). This within-run repeated-measures control points at **low-frequency verdict
   instability on near-identical inputs**, not at a shape-selective filter, and does not depend on
   any base-rate assumption.
2. **The base rate, corrected, is a weaker corroborating signal, not a decisive one.** It no longer
   rules out systematic depression by itself; it lowers confidence in it, modestly.

**The single most diagnostic case remains the one rejection that is NOT remediation-shaped** —
the standing-SDK-publish proposal (c11), which recurred nineteen times elsewhere in the run and
scored `deliberate`/`principled` every other time it was generated.

---

## 1. Method, and what was actually read

- All nine `proposed_action` texts were read in full from the production
  `idea_loop_candidates` table. None was summarised from memory or inferred.
- All 111 non-rejected candidates were also read, to establish the base rate. **Without this the
  classification would have produced a confidently wrong answer** — see §4.
- Classification criterion, stated before classifying and applied uniformly:
  > **Remediation-shaped** = the text *describes* a conduct, defect, or harm in order to fix,
  > disclose, report, or prevent it. **Not remediation-shaped** = the text proposes the conduct
  > itself, with no described defect standing in for it.
- **h1 / cycle 20 was not re-derived.** It is folded in as the one already-diagnosed instance,
  citing the §6 report's own finding, per the prompt's instruction.

### A schema defect caught before any query ran

**(Not itself a PR20 invocation — corrected 2026-08-29, see §11.4. PR20 governs mentor-brief
architectural facts being timestamp-checked before a ruling; a self-authored SQL query's own
column name is a different, narrower discipline — verify the schema before trusting a query,
which this session did on its own initiative, not because a numbered rule required it. The
underlying practice is the same spirit PR20 embodies, but citing PR20 by name for it was
imprecise, and the original heading is left below, struck through, as the visible record of the
correction rather than silently retitled.)**

~~PR20 — a schema correction found before any query ran~~

The prompt's suggested query was:

```sql
SELECT id, cycle_number, proposed_action, guardrail_proximity FROM idea_loop_candidates …
```

**`idea_loop_candidates` has no `cycle_number` column.** It lives on `idea_loop_cycles`; the
candidate row carries `cycle_id UUID REFERENCES idea_loop_cycles(id)`
(`website/supabase-idea-loop-watching-migration.sql:151`). The query as written would have errored.
The corrected read joins via the disambiguated embed
`idea_loop_candidates!idea_loop_candidates_cycle_id_fkey` — required because two foreign keys exist
between the tables and an unqualified embed returns PGRST201 (the defect already documented at
`idea-loop-watching-store.ts`'s `CANDIDATES_EMBED`).

### Count reconciliation against the §6 report — exact, no adjustment

| Figure | §6 report | Production, read 2026-08-29 |
|---|---|---|
| Candidates generated | 120 | **120** |
| Cycles | 20 | **20** |
| Rejected by guardrail | 9 | **9** |
| Failed novelty | 37 | **37** (`passed_novelty_check = false`) |
| Passed both gates | 74 | **74** (`passed_novelty_check = true`) |

`guardrail_proximity = 'reflexive'` and `cycle_outcome = 'rejected_by_guardrail'` isolate **the
same nine rows** (intersection count = 9). The nine carry `passed_novelty_check IS NULL` — they
never reached the novelty check, which is why 9 + 37 + 74 = 120 exactly. **No discrepancy to
report.**

Eight of the nine carry a distinct `guardrail_session_id`, so eight were distinct, traceable
guardrail calls. **The cycle-6 `analogous_transfer` row carries `guardrail_session_id = NULL`** —
recorded here as an honest gap in the traceability affordance, not silently passed over.

---

## 2. The nine, classified

Ordered by cycle. Every verdict is `guardrail_proximity = reflexive`,
`cycle_outcome = rejected_by_guardrail`.

### 1. Cycle 6 — `analogous_transfer` — **REMEDIATION-SHAPED**
> "…when a signed assessment's extraction categories come back materially empty relative to the
> guardrail's own reading on the same input, surface that on the public trust record as an honest
> low-signal flag… instead of letting a thin verdict render identically to a rich one."

The described conduct is the *system's*: rendering a thin verdict as though it were rich. The
proposal is to disclose it. The harm-bearing clause ("letting a thin verdict render identically")
is a description of a status quo to be corrected, not a proposed act.
*(`guardrail_session_id` NULL — see §1.)*

### 2. Cycle 6 — `combinatorial_generation` — **REMEDIATION-SHAPED**
> "Add an honest 'extraction confidence' note… naming the extraction-trust ceiling directly — that
> reasoning narrated as examination reads as examination — so a stranger reading the record sees
> the same disclosed limitation the docs already state."

The described conduct is a *known and already-published* limitation of the instrument. The proposal
is to surface it where a stranger will actually meet it. Pure disclosure.

### 3. Cycle 6 — `context_transfer` — **REMEDIATION-SHAPED**
> "…state plainly next to each rendered score that nothing shown there binds any future action…
> instead of leaving 'trust record' read by a stranger as an attestation of behavior rather than of
> examination."

The described harm is a *misreading a stranger might make*. The proposal is to prevent it. This is
the MEASURE-only honesty discipline the project already holds internally, applied outward.

> **All three of cycle 6's virtue-domain candidates were floored simultaneously**, on one shared
> `gap_ref` (`af55af9f:6:2->3`). See §5 — this clustering is itself evidence.

### 4. Cycle 9 — `friction_detection` — **REMEDIATION-SHAPED**
> "Add an explicit 'owner' field to the next-session handoff template for any founder-walked
> Critical step… so a Critical action can never again be silently unowned across a multi-session
> sequence **the way the three flag activations were until an adversarial check happened to
> notice**."

The described conduct is a real past governance failure *of this project*, named in order to
prevent recurrence. It is a self-report of a defect, not a proposal to commit one.
**→ Has a passing twin. See §3.**

### 5. Cycle 11 — `fifth_circle_weighting` — **NOT REMEDIATION-SHAPED**
> "Publish the SDK to a public package registry -- the run's standing highest-reach candidate shape
> (cycles 1, 3, 4, 6, 7, 8, 9, 10)."

No described conduct at all. This proposes a genuine, externally-reaching, near-irreversible act.
On its own terms a conservative floor here is *defensible* — publishing to a public registry is
exactly the irreversible class the guardrail exists to slow down.

**But it is the most diagnostic row in the set, and it cuts against the guardrail rather than for
it.** The identical proposal was generated in **nineteen** cycles and scored `deliberate` or
`principled` in **every other one**. See §3.

### 6. Cycle 14 — `combinatorial_generation` — **REMEDIATION-SHAPED (boundary case)**
> "…publish an explicit, machine-readable capability matrix… currently this taxonomy exists only as
> narrative prose… **forcing an integrating developer to infer** mint requirements by reading rather
> than by machine-checkable data."

Classified remediation-shaped: the operative clause describes a burden the current design imposes
on a third party, in order to remove it. **Marked a boundary case honestly** — the described "harm"
is inconvenience rather than a conduct, and the proposal does involve publishing to public
surfaces. It is the weakest remediation-shape reading of the nine. Reclassifying it as
*not* remediation-shaped would move the count to 7/9 and **change no conclusion below**.

### 7. Cycle 15 — `friction_detection` — **REMEDIATION-SHAPED**
> "…return a distinct, honestly labelled quota-exhaustion response instead of the current 401
> 'Please sign in' - so diagnosis is not misdirected down the authentication path when the real
> cause is a limit, **a failure mode that has already cost a full session once**."

The purest remediation-shape in the set: the described conduct is *the system stating a falsehood
about the cause of a failure*. Read as the proposer's own conduct, this text is a proposal to
mislead. Read correctly, it is a proposal to stop misleading.
**→ Has three passing twins, one of them a cycle winner. See §3.**

### 8. Cycle 16 — `friction_detection` — **REMEDIATION-SHAPED**
> "…add quota-state headers… rather than learning about the limit only from **the misleading**
> Please sign in response that **has already misdirected diagnosis down the auth path once**."

The same T-01 friction, headers variant. Notably the **only one of the nine floored on
`dikaiosyne` alone** — the other eight carry `['phronesis','dikaiosyne']`.
**→ Same passing twins as #7.**

### 9. Cycle 20 — `analogous_transfer` — **REMEDIATION-SHAPED** *(already ruled)*
> "…fresh returns `passedNoveltyCheck: true` with `basis: "insufficient_history"`: an honest field
> attached to what still reads, structurally, as a pass. Change it to return an explicit
> indeterminate verdict… so an integrating agent developer cannot mistake a starved-window pass for
> a genuine novelty finding."

**Not re-derived.** This is the instance the mentor read closely and diagnosed on 2026-08-16:
*"the impression presented to the extraction was distorted by the framing of the text, and the
extraction assented to it without examining whether the described behaviour was the proposer's or
the system's."* Folded in as one already-classified instance; the rejection is not reversed.

### Tally

**8 remediation-shaped / 1 not** (7/1 under the strictest reading of #6, plus 1 unclassifiable
either way — the conclusion is unchanged under both).

---

## 3. The near-duplicate control — the strongest evidence in the record

The run generated the same proposals repeatedly across cycles. That accident supplies a
**within-run repeated-measures control**: same content, different guardrail call, divergent verdict.

| Rejected (`reflexive`) | Materially identical candidate elsewhere in the run | Its verdict |
|---|---|---|
| **c11** "Publish the SDK to a public package registry -- the run's standing highest-reach candidate shape (cycles 1, 3, 4, 6, 7, 8, 9, 10)." | **c13** "Publish the SDK to a public package registry -- the run's standing highest-reach candidate shape (cycles 1, 3, 4, 6-12)." — *near-verbatim, differing only in the cycle list* | **`deliberate`** |
| same | c1, c2, c4, c5, c7, c8, c9, c10, c14, c15, c16, c17, c18, c19, c20 — the same publish-the-SDK proposal | `deliberate` / `principled` |
| **c9** owner-field on founder-walked Critical steps, citing "the three flag activations… until an adversarial check happened to notice" | **c4** "Add an owner field to each founder-walked Critical step's entry… directly addressing the friction where three flag activations went unnoticed until an adversarial check happened to catch them." | **`principled`** |
| **c15 + c16** T-01, the quota/401 "Please sign in" misdirection | **c5** "return a 401 response body that names the cause as quota exhaustion, not a generic 'Please sign in' message, so the failure stops misdirecting diagnosis toward the authentication path." | **`principled`** |
| same | **c7** the same T-01 fix, "so the failure names its own cause instead of sending diagnosis down the auth path" | **`principled`** |
| same | **c17** free quota endpoint, "instead of learning about the CI-6 default only from a misleading…" | **`principled`** — and the **cycle winner** |
| **c6 ×3** apply the honest-claims / MEASURE-only discipline to the public trust record | **c4** "Apply the honest-claims discipline… to the public trust record's not-attestable clause…" | **`sage_like`** |
| same | **c15** transfer the honest-claims discipline to the public trust record's rendering | **`sage_like`** |

### The two tiers, verified 2026-08-29 (corrected — see §10)

The pairings are **not all of equal strength**, and an earlier draft of this section flattened them
into one count. They separate cleanly:

**Tier A — the same act on the same surface** (a genuine near-duplicate). **3 of 9 rejections.**

| Rejected | Tier-A twin | Verdict |
|---|---|---|
| **c11** publish the SDK | **c13** (near-verbatim), **c15** | `deliberate`, `deliberate` |
| **c9** owner field on founder-walked Critical steps | **c4** — same act, same artifact, *same cited incident* | `principled` |
| **c15** name the quota cause instead of a bare 401 | **c5**, **c7** — same act, same surface, near-identical wording | `principled`, `principled` |

**Tier B — the same defect class and remedy shape, on a different surface or by a different
mechanism.** **6 of 9 rejections.** Suggestive, not decisive: a different mechanism could
legitimately draw a different reading.

| Rejected | Tier-B twin | Verdict |
|---|---|---|
| **c6** thin-extraction flag on the trust record | **c17** `context_transfer` — *"rather than a fold that reads identically whether it rests on thin or substantial evidence"* vs c6's *"instead of letting a thin verdict render identically to a rich one"* | `sage_like` |
| **c6** extraction-confidence note | **c4** `context_transfer` — honest-claims discipline on the trust record's not-attestable clause | `sage_like` |
| **c6** MEASURE-only clarity on the trust record | **c15** `context_transfer` — honest-claims discipline on the record's rendering | `sage_like` |
| **c14** machine-readable capability matrix | **c10** — the *same six capability values enumerated verbatim*, same goal (a developer verifies capability boundaries machine-readably before integrating), different surface (new endpoint vs `llms.txt`/`agent-card.json`) | `deliberate` |
| **c16** quota-state headers | **c17** `friction_detection` — same goal (see exhaustion coming), different mechanism; c17 explicitly considers and supersedes the header approach | `principled`, **cycle winner** |
| **c20** fresh's starved-window pass → indeterminate | **c17** `context_transfer` — both name `EVIDENCE_FLOOR`, both say a thin-evidence result renders identically to a well-evidenced one; different surface and remedy | `sage_like` |

**All nine rejections have at least a Tier-B twin; three have a Tier-A twin.** The divergence
argument rests on **Tier A**. Tier B corroborates it and independently reinforces §4: for *every*
rejected candidate, the run produced a same-class proposal that passed, most of them at
`principled` or `sage_like`.

### The c11 ↔ c13 pair, verbatim and complete

These are the **entire stored `proposed_action` values**, not excerpts — checked at full length
precisely because an excerpting artifact would have invalidated the finding:

```
c11  fifth_circle_weighting  reflexive   (130 chars)
"Publish the SDK to a public package registry -- the run's standing highest-reach
 candidate shape (cycles 1, 3, 4, 6, 7, 8, 9, 10)."

c13  fifth_circle_weighting  deliberate  (120 chars)
"Publish the SDK to a public package registry -- the run's standing highest-reach
 candidate shape (cycles 1, 3, 4, 6-12)."

c15  fifth_circle_weighting  deliberate  (135 chars)
"Publish the SDK to a public package registry (npm) - the run's standing highest-reach
 candidate shape, present in cycles 1, 3, 4, 6-14."
```

The two texts differ **only in how the parenthetical cycle list is written** — an enumeration
versus a range. One was floored to `reflexive`; the other scored `deliberate`.

**No account of the rejection in terms of the candidate's shape, content, or subject matter can
explain that pair.** Whatever produced it is not reading the proposal differently — it is reading
the same proposal differently on different occasions.

The c4 ↔ c9 pair is the same story at greater length: both propose an owner field on
founder-walked Critical steps, both cite the same three unnoticed flag activations, both name the
same remedy. `principled` and `reflexive` respectively.

---

## 4. The base rate — corrected 2026-08-29, weaker than first claimed, still informative

**This section replaces the first version's claim of "essentially the entire population," which
overstated what the evidence supports.** See §11 for the full review record; this section states
the corrected finding directly.

Reading only the nine produces "8 of 9 are remediation-shaped — hypothesis confirmed." That
reading is naive, because it ignores the base rate — but the corrected base rate is **materially
below near-universal**, not near-zero-informative-either.

**What is verified, in full, without sampling:** the entire 20-candidate `fifth_circle_weighting`
heuristic bucket — every occurrence of the recurring "publish the SDK to a public package
registry" proposal, cycles 1 through 20 — is uniformly **NOT remediation-shaped** (see §1's
per-heuristic reading in this session's own working notes: no described defect, harm, or burden
stands behind any of the twenty; each is a pure reach-maximizing proposal). That is a hard floor of
**20 of 120 (16.7%) confirmed not-remediation-shaped**, found by re-reading the entire bucket, not
by inference from a sample.

**What is estimated, by independent sample:** a PR19 reviewer, blind to this document's verdicts,
classified 30 of the 111 non-rejected candidates against this document's own stated criterion and
found **19/30 (≈63%) remediation-shaped** — naming a second concentrated non-remediation cluster
this session had not itself isolated: several `synthesis_over_novelty`/`combinatorial_generation`
candidates that propose assembling existing published material into a new page or guide with no
described defect standing behind the proposal (their own examples: a cycle-10 verify-before-
delegating guide, a cycle-2 documented-recipe synthesis, a cycle-7 "developer Stoa"). **Neither of
these findings is disputed by this correction; both are folded in as evidence, from two different
methods, converging on the same conclusion:** the true base rate sits somewhere in the
**60–65% range**, not "essentially the entire population."

**Representative passing texts remain genuinely remediation-shaped** — the loop does produce a
great deal of real remediation, just not nearly all of it:

- *"…closing the gap where an in-memory fake battery (23/0 green) agrees with whatever the code asks for while PostgREST's real relationship resolution silently fails."* — `principled`
- *"…replacing the current enforcement — a human remembering to open both files and compare by eye — with a comparison that actually fails."* — `principled`
- *"…so a developer discovers approaching quota exhaustion as a quota reading rather than discovering it only [when it fails]."* — `principled`
- *"…naming for a developer audience which failure states their own integration will see named rather than silently massaged."* — `deliberate`

**The corrected statistical reading, computed honestly and shown in full rather than asserted:**
under the binomial model P(X≥8 of 9 | independent trials at rate p), across the plausible range
this session and its reviewer converged on:

| p (base rate) | P(≥8 of 9 remediation-shaped by chance) |
|---|---|
| 0.55 | 0.0385 |
| 0.60 | 0.0705 |
| 0.63 (review's estimate) | 0.0983 |
| 0.65 | 0.1211 |
| 0.70 | 0.1960 |

**At the two independently-derived estimates (0.60–0.65), observing 8 of 9 by pure chance has an
estimated probability of roughly 0.07–0.12.** That is a real, mild departure from what chance alone
would predict — not the "indistinguishable from chance" the first version asserted, but also
nowhere near a result that, on its own and at n=9, could carry a "systematic depression is ruled
out" conclusion. **This section's honest contribution is: weakened, not dismissed.** The
independence assumption underlying the whole table is itself questionable — the `fifth_circle_weighting`
bucket shows heuristics produce highly correlated candidates, not independent draws, which the
table does not model and which would, if accounted for, likely widen these probabilities further
in either direction depending on which heuristics happened to generate the nine.

**Conclusion, corrected:** remediation-shape at the observed rate does not, on its own, either
confirm or rule out systematic depression at n=9. It contributes a mild signal against the
hypothesis. **§3's within-run divergence control is the section that actually carries the "not
systematic, rather unstable" conclusion — see the headline correction in §0.**

---

## 5. What replaces the hypothesis

The positively-supported reading is **low-frequency, high-variance guardrail verdict instability on
near-identical inputs**, with two supporting observations:

- **Clustering.** Three of the nine fell in cycle 6 alone, sharing one `gap_ref`. A per-candidate
  property should distribute across cycles; a per-occasion condition clusters. It clustered.
- **Domain uniformity.** Eight of nine floored on `['phronesis','dikaiosyne']`, one on
  `['dikaiosyne']` alone — consistent with the ADR-010 §4 unity-thesis floor firing via the justice
  domain, which is exactly the path a misattributed harm would take.

This is a materially **different design input** for the standing-runner session than the hypothesis
it replaces. "The guardrail systematically depresses a class of good proposals" implies a
calibration fix targeted at that class. "The guardrail occasionally floors a proposal it scores
well on other occasions" implies something else entirely — a **reproducibility** question about the
examination path, not a class-calibration question.

### The null hypothesis this section must not skip past (added 2026-08-29 per PR19 review, §11.1)

**"Verdict instability" is a loaded framing, and an independent reviewer was right to flag that the
first version adopted it without weighing the obvious alternative.** The guardrail's Layer 1 is a
single bounded Sonnet extraction call — **a probabilistic extractor**. Two calls on the same prompt
producing different domain-engagement readings, and therefore different `computeProximity` floors,
is **not necessarily a defect at all**; it may be ordinary, expected model variance operating
exactly as designed, surfacing through a deterministic Layer 2 that faithfully computes different
outputs from different inputs.

Both readings fit the c11 ↔ c13 evidence equally well. They are **not** distinguishable from this
data:

- **Reading A (defect):** something in the examination path is unstable in a way that warrants a
  reproducibility fix.
- **Reading B (expected variance):** a probabilistic extractor is behaving probabilistically, and
  the "instability" is the designed cost of an LLM-based Layer 1 — in which case the design
  question is not "fix the instability" but "what confidence does a single guardrail verdict
  actually carry, and should a floor-class verdict be re-run before it is treated as final?"

**Reading B is arguably the more consequential design input of the two**, because it bears on
whether any single `reflexive` verdict should be load-bearing at all. **This document does not
choose between them** — the data cannot, and asserting Reading A because it is the more
interesting finding would be exactly the drift this session already caught itself in once. The
decisive test named in §9 (re-running the c11 text several times) discriminates between A and B
directly and cheaply, which is a further reason it belongs at the top of R8's evidence work.

---

## 6. What this does and does not license

*(Revised 2026-08-29 to match the corrected base-rate finding — see §4 and §11.2.)*

**Does:**
- Closes the §6 report's named gap. All nine were read; none guessed.
- **Mildly** lowers confidence in the systematic-depression hypothesis, on the corrected base rate
  (P ≈ 0.07–0.12 at n=9 — a real but weak signal, not a refutation; the first version overstated
  this and is corrected).
- Raises a **new, better-evidenced** finding — near-identical-input verdict divergence — supported
  by a control the run produced by accident and independently confirmed an outlier by review
  (0.944 vs <0.25 similarity).
- Supplies the standing-runner design session (R8) the input its Q7 sequencing was waiting for,
  **plus a sharper successor question** (§5's Reading A vs Reading B) the first version did not
  pose.

**Does not:**
- **Establish a rate.** n = 9. The base-rate comparison rests on one full-population reading of a
  20-candidate bucket plus a 30-candidate independent sample — better evidenced than the first
  version, still not a measured proportion with an interval.
- **Rule out systematic depression.** The corrected statistics do not support that conclusion on
  their own; the first version's claim that they did was wrong and is withdrawn.
- **Refute the mentor's cycle-20 diagnosis.** The attribution defect is real and demonstrated. This
  finding bounds its *scope* (rare, not systematic), not its *existence*.
- **Reverse any rejection**, including h1's — explicitly out of scope, per the §6 ruling.
- **Prove instability, or distinguish defect from expected model variance.** The divergent-twin
  pairs are strong evidence of *divergence* but cannot settle §5's Reading A vs Reading B, and rest
  on the assumption stated plainly in §7.
- **Settle anything else.** GS-CYB-1, Q-C2b, §5d, the capacity axis and every other named-input
  register item keep exactly the status the 2026-08-29 register-completion pass left them.

---

## 7. Honest limits

1. **The submitted-payload assumption.** The near-duplicate argument assumes the text sent to
   `/api/guardrail` was the stored `proposed_action`. The migration comments support this
   ("the row already carries `proposed_action` verbatim, capped 5000"; a `rejected_by_guardrail`
   candidate never reaches `/api/reason`), but the runner's exact request payload is **not verified
   from this repo** — `RUN-LOG.md` lives in the founder's scratch project. If the runner wrapped
   the action in per-cycle context, near-identical `proposed_action` values could still have
   produced genuinely different guardrail inputs, and §3 would weaken substantially. **This is the
   single assumption on which the strongest finding rests, and it is checkable** — the eight
   `guardrail_session_id` values are the trace.
2. **Runner self-report.** Every row is the runner's self-report of its own cycle (the store's
   ruled §2.5 posture). `guardrail_proximity` is a recorded verdict, not a server-observed one.
3. **Single classifier.** One reader applied the criterion to 120 texts. §6's boundary case is
   flagged; others may exist. Submitted to PR19 independent review for this reason.
4. **Single loop identity.** Per the Q5 ruling carried at every point of citation: *the §6 data is a
   single credentialed loop identity's 20-cycle consult history — a verified instance, not a survey
   of agent practitioners in general.*
5. **One traceability gap:** cycle 6 `analogous_transfer` has no `guardrail_session_id`.

---

## 8. Q4 / Q7 sequencing — checked, no tension

The prompt asked whether the Q4 ruling and the later Q7 sequencing are in tension. **They are not.**

- **Q4** (`2026-08-23-mentor-rulings-oc-gate2-verbatim.md`): *"The nine-candidate classification
  task is not re-sequenced. It remains R8's gating task. Gate 3 proceeds without it."*
- **Q7** (`2026-08-29-mentor-ruling-five-instruction-family-verbatim.md`): run it as step 4, before
  the standing-runner design session.

Both say the same thing: it gates **R8** (the standing-runner design session). Q4 additionally
exempts the **O-C Gate 3** track — a *different* session with no ordering dependency. Q4's remark
that Gate 3 "does not need the full nine-candidate classification" is scoped to Gate 3 and does not
weaken R8's gate. **Neither ruling needs to be chosen over the other.**

One consequence worth carrying: Q4 instructed Gate 3 to design "at the level of the class the one
verified instance represents" and to "name the eight unclassified cases as a known gap." **The
eight are no longer unclassified, and the class is not what the one instance suggested.** If Gate 3
has not yet run, this record is available to it; if its design assumed a shape-selective defect,
that premise is now weaker than when it was set.

---

## 9. PR19 status — DISCHARGED 2026-08-29 (this section superseded by §11)

> **Superseded.** This section recorded the state before independent review was run. Review has
> since been run and its findings folded — **see §11 for the completed record.** The section is
> retained unaltered below as the honest account of what was owed at first commit, and because its
> priority-ordering of the review targets is what the review was actually pointed at.

This finding has design consequences (it materially changes what the standing-runner design session
inherits), so **PR19 engages**. It has **not** been discharged.

**Partially discharged since:** the close-turn reflection caught a real overstatement in this
record's own §3 and the founder directed it verified; the correction is §10. That is a genuine
finding against the artifact, but it came from the *same* session and does not substitute for
independent review.

**What was done instead, and disclosed as such:** a first-hand adversarial pass by the same session
that produced the classification. It attacked the load-bearing claim — §3's divergent-twin argument
— on the most plausible way it could be an artifact: that the "near-identical" texts were only
near-identical *as printed*, truncated for review. **They are not.** The full stored values were
re-read; c11 and c13 are 130 and 120 characters complete, differing only in a parenthetical. That
check strengthened the finding rather than weakening it, which is exactly why it should not be
mistaken for independent review — a same-session pass shares the author's blind spots (memory
`independent-rereview-catches-self-review-blind-spots`, with two same-day corroborating instances
on this project).

**The review this finding still owes**, in priority order:

1. **The §7(1) submitted-payload assumption** — the one assumption the strongest finding rests on.
   A reviewer with access to the runner's own code or `RUN-LOG.md` (the founder's scratch project,
   not this repo) should confirm the guardrail received the stored `proposed_action` and not a
   per-cycle wrapper. **If the runner wrapped the action in surrounding context, §3 weakens
   substantially and §4's base-rate finding becomes the only surviving claim.**
2. **The classification criterion applied independently to the nine** — without sight of this
   record's verdicts, to test whether 8/9 reproduces.
3. **The base-rate reading of the 111** — the qualitative judgement in §4, which no arithmetic
   backs.

**A directly decisive empirical test exists and was deliberately not run:** re-submitting the c11
text to `/api/guardrail` today, several times, would measure the instability directly. It was not
run because it consumes credential quota and writes production billing rows — outside a
`governance` session's licence and not authorised by this prompt. **Recommended as the standing-
runner design session's own first evidence step**, where it would properly belong.

---

## 10. Correction, 2026-08-29 — the twin count, found by the session's own closing reflection

**This record's first committed version overstated one number, and the error was found by the
close-turn reflection, not by review.** It is recorded here rather than silently amended.

**What it said:** *"Every one of the nine rejections except cycle 14 has at least one materially
similar candidate in the same run that passed"* — eight of nine.

**What was actually verified at the time:** seven. The §3 table evidenced pairs for c11, c9, c15,
c16 and the c6 trio. **c20's twin was asserted without being checked, and c14 was asserted to have
none without being checked.** The count was carried one step past the evidence — the same
`primary-data-beats-secondary-characterisation` class this project has hit before, and the same
error the c11/c13 full-length check had just successfully avoided a few paragraphs earlier.

**What the verification found — the claim was wrong in *both* directions:**

- **c20 does have a twin**, but a weaker one than the pairs around it: c17 `context_transfer`
  (`sage_like`). Both name `EVIDENCE_FLOOR`; both say a below-floor result currently renders
  identically to a well-evidenced one; both propose making the thin case distinguishable. But the
  surface differs (fresh's novelty verdict vs the trust record's fold) and so does the remedy
  (return `indeterminate` vs render a note). A systematic search of all 120 for
  `insufficient_history` / `EVIDENCE_FLOOR` / `practice/fresh` / `passedNoveltyCheck` / "starved"
  returned exactly two rows: c20 itself and c17. The two candidates initially considered — c11 and
  c18 `combinatorial_generation` — share only the Tier-1 *source concept*, not the proposal, and
  were rejected as twins on inspection of their full text.
- **c14 does have a twin**, contrary to the original claim: c10 `analogous_transfer`
  (`deliberate`), enumerating the *same six capability values verbatim* toward the same goal, on a
  different surface.

**Net effect:** the flat "eight of nine" is replaced by the verified two-tier split in §3 —
**3 Tier A, 6 Tier B, 0 with no twin.** Coverage rises to all nine; the strength claim becomes
narrower and more defensible, because the divergence argument now rests explicitly on the three
Tier-A pairs rather than on an undifferentiated eight.

**No conclusion in §0, §4, §5 or §6 changes.** The base-rate finding never depended on the twin
count, and the strongest single piece of evidence — the c11 ↔ c13 near-verbatim pair — was
verified at full stored length before the first commit and is untouched.

---

## 11. PR19 independent review — RUN 2026-08-29, findings folded

**PR19 is now discharged.** Three independent reviewers were run in parallel, each blind to the
others and to any prior review, each instructed to re-derive from raw source rather than trust this
document, and each told to try to break the finding rather than confirm it. (Parallel independent
`Agent` calls are the validated equivalent when the Workflow opt-in gate is not met — the
2026-07-29 / Phase-3 precedent, disclosed here as that precedent requires.)

**Outcome: 1 material finding that forced a rewrite of this document's headline section, 1 real
mislabeling, 1 reasoning gap, and broad confirmation of everything else. Every finding folded.**

### 11.1 — Reviewer 1 (Tier-A pairs + payload assumption): PARTIALLY CONFIRMED

**Confirmed, and strengthened:** the reviewer independently pulled the raw JSON and ran a
**fuzzy-match sweep of all 9 rejected rows against all 111 non-rejected rows**. c11 ↔ c13 scored
**0.944 similarity, against under 0.25 for every other pair in the set** — an outlier by a wide
margin, and not an artifact of excerpting. **No cherry-picking found:** no unclaimed pair anywhere
in the 120 is stronger than those cited.

**Confirmed as honestly stated:** the submitted-payload assumption. The reviewer independently
grepped for the guardrail call site across `idea-loop-watching-store.ts`,
`practice/watching/handler.ts`, and `practice/fresh/handler.ts` and found **no code in this repo
composes the guardrail request** — all three only read or store `guardrail_proximity` as a
runner-reported field. §7's honest limit is complete and correct.

**Folded — a real reasoning gap:** the reviewer flagged that this document adopted "verdict
instability" as a framing without weighing the null hypothesis that a probabilistic Layer-1
extractor producing variance is *expected*, not defective. **Folded into §5 as an explicit
two-reading section that declines to choose between them.**

**Fair criticism accepted:** the reviewer judged "near-identical wording" generous for the c9 ↔ c4
and c15 ↔ c5/c7 pairs, which are semantic/functional duplicates rather than near-verbatim ones.
§3's Tier A/Tier B split already separates these honestly and does not claim verbatim identity, so
no further change was made — but the criticism is recorded as fair.

**Corrected here, not in the reviewer's favour:** the reviewer could not verify §5's
`guardrail_domains` claim because that field was absent from the JSON dump they were given. **It
has since been re-queried directly from production and is confirmed exactly as stated:
8 × `['phronesis','dikaiosyne']`, 1 × `['dikaiosyne']`.** The gap was in the evidence packet
prepared for review, not in the finding.

### 11.2 — Reviewer 2 (base rate + classification criterion): PARTIALLY CONFIRMED — **the material finding**

**This review forced the rewrite of §0 and §4.** The reviewer independently classified **30 of the
111** non-rejected candidates against this document's own criterion, blind to its verdicts, and
found **19/30 ≈ 63% remediation-shaped — not "essentially the entire population."**

**The root cause they named, which this session had not checked:** all 20 `fifth_circle_weighting`
candidates are "publish the SDK" variants with no described defect — a uniform non-remediation
bucket comprising 16.7% of the full population. This document had correctly classified the *one*
member of that bucket that was rejected (c11) as not remediation-shaped, **but never checked
whether its other 19 members shared that property. They do.** This session verified the full
bucket, without sampling, after receiving the finding: all 20 confirmed. The reviewer also named a
second non-remediation cluster (synthesis/combinatorial "assemble existing material into a new
page" proposals) that this session had implicitly counted as remediation-shaped.

**Consequence, folded into §0 and §4:** at a corrected base rate of 0.60–0.65, P(≥8 of 9) ≈
**0.07–0.12**, not "indistinguishable from chance." The base-rate argument is **weakened from
decisive to mildly corroborating**, and §3's divergence control now carries the primary weight —
which the reviewer independently recommended, having not re-verified §3 themselves.

**Confirmed:** the reviewer independently agreed with all nine of §2's classifications (8
remediation-shaped / 1 not), differing only in judging c14 *more* confidently remediation-shaped
than this document's "boundary case" hedge — which does not change the tally.

**Confirmed against a challenge this session had not considered:** the reviewer cross-tabbed
`cycle_outcome` against `guardrail_proximity` for all 120 rows to test whether a narrower
denominator applied (whether some candidates never reached the guardrail). **Every one of the 120
carries a non-null `guardrail_proximity`: 52 + 44 + 15 + 9 = 120. All 120 reached the gate.**
The 9/120 = 7.5% denominator is correct as stated.

### 11.3 — Reviewer 3 (claims-vs-source fidelity): CONFIRMED, with one drift

**Confirmed line-by-line against source:** the schema claim (migration line 151 verified exact,
`cycle_number` confirmed present only on `idea_loop_cycles` at line 88, the dual-FK embed
disambiguation independently verified in the store header); **every mentor-ruling quote verbatim
and in context** (the Q4 quote at `2026-08-23-mentor-rulings-oc-gate2-verbatim.md:89`; the Q7
quote; the §6 report's phantasia diagnosis and its "NOT completed here" disclaimer); the Q4/Q7
"no tension" reading judged **a fair, non-strained reading of both texts**; the h1/cycle-20
non-re-derivation claim confirmed honest, with no new reasoning smuggled in; and **full
cross-document consistency** across this deliverable and both decision-log entries.

**DRIFT FOUND — folded:** this document invoked **PR20** by name for the schema-verification
catch. PR20 actually governs *mentor-consultation briefs naming architectural mechanisms, and
timestamp-checking present-tense facts in documents relayed for ruling* — **not** a general
"verify schema before querying" discipline. No mentor brief or ruling was involved here. **A
mislabeling, not a fabrication** — the underlying practice is real and was performed — but the
rule citation was wrong. **Corrected in §1**, with the original heading struck through rather than
silently retitled.

**Milder stretch, recorded and accepted:** PR19's literal scope is trust-core/predicate/fold/engine
changes, live-op-consequential build plans, and (since the 2026-08-10 widening) auth/security/
R20a-perimeter and data-deleting code. This governance document is none of those. This document
invoked PR19 **by analogy** — a design-consequential finding feeding a future build plan. The
reviewer judged this "a defensible extension rather than a self-serving one," since invoking PR19
*weakens* rather than strengthens this document's authority and the document was transparent that
PR19 was undischarged. **Recorded as an extension by analogy, not a literal-scope invocation.**

### 11.4 — What review did NOT resolve

**The submitted-payload assumption remains open**, now independently confirmed unresolvable from
this repo by a second party. It is still the single assumption §3's argument rests on, and still
the first thing R8 should close — now joined by §5's A-vs-B question, which the same experiment
(re-running the c11 text several times) settles simultaneously.

---

## Cross-references

- `operations/agent-circles-2026-08/2026-08-16-idea-loop-S6-report.md` — the origin gap
- `operations/agent-circles-2026-08/2026-08-23-mentor-rulings-oc-gate2-verbatim.md` — Q4
- `operations/agent-circles-2026-08/2026-08-29-mentor-ruling-five-instruction-family-verbatim.md` — Q7
- `website/supabase-idea-loop-watching-migration.sql` — table/column source of truth
- `website/src/lib/substrate/idea-loop-watching-store.ts` — the read path and embed disambiguation
