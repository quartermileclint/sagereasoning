# Friction as the primary idea-generation mechanism — pre-registered hypothesis for the §6 report

**S6's concurrent deliverable.** Written 2026-08-11, feeding the IDEA-loop bounded validation run's
§6 report. **Scope document:** `S6-friction-primary-mechanism-hypothesis-scope.md`. **Binding
rulings this document implements:** `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` (A5, B5,
C7, C8, C18) and `2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` (Ruling 2, §Q6-e).

**This document does not propose, prepare, or authorise reordering the IDEA loop's generation
channels.** It states a hypothesis, a frozen null result, and a discriminator — nothing more. It
touches no code, schema, or flag, and it is not written into the validation run's own records.

---

## 1. The hypothesis, in the mentor's own words, with the mentor's own caution intact

> For the IDEA loop's generation-step design, this suggests that friction detection should not be one
> heuristic among seven. It should be the primary generation mechanism, with the virtue-domain
> heuristics serving as the examination layer that evaluates friction-generated proposals rather than
> generating their own. The current architecture has them as parallel generation channels. The finding
> from the validation run may support reordering them.
>
> **This is a hypothesis to be tested against the full run findings.** But it can be documented now as
> a question to carry into the §6 report analysis.

The philosophical grounding: friction — *"the point where the system resists or fails"* — is
named as *"the functional analogue of the primal tension that drives innovation in the animal
kingdom"* — the bird using a straw, responding to food present but unreachable by normal means. The
proposal generated from friction is claimed to be *"a genuine departure from fixed patterns, grounded
in specific contextual need rather than abstract virtue aspiration,"* as against proposals generated
from virtue aspiration alone.

**The caution is part of the instruction and is restated here so no reader of this document mistakes
the hypothesis for a finding:** this is a hypothesis to be tested, not a conclusion. Nothing in this
document, or in any evidence gathered under it, licenses building the reordering it describes.

---

## 2. The architectural stakes — reordering is a change of kind, not of order

`GenerationHeuristic` (`website/src/lib/substrate/idea-loop-types.ts:81-88`) is a closed union of
exactly seven values, `friction_detection` last. Under the ruled generation design, the generation
step applies all seven heuristics and produces one candidate per heuristic; examination and novelty
then filter them down. Friction detection also carries a second, distinct role today — the
**null-cycle backstop**: after three consecutive null cycles from heuristics 1–6, the loop shifts to
friction-only mode until a non-null cycle returns from an active mechanism.

Friction candidates are structurally different from the other six by deliberate design.
`GeneratedCandidate` (`idea-loop-types.ts:90` ff.) makes `targetCircle` **absent** for a
`friction_detection` candidate, and `initialClassification` is a discriminated union whose friction
branch is `{ kind: 'preferred_indifferent' }` rather than `{ kind: 'virtue_domain'; domains: [...] }`
— a discriminated union specifically so a friction candidate cannot be forced into the virtue-domain
shape.

**The reordering the mentor names is therefore not a reweighting of seven parallel channels — it
would make the mechanism that carries no circle and no virtue-domain classification the primary
generator, and make the six classified mechanisms into evaluators of its output.** That is a larger
change than "reorder the channels."

**The strongest structural argument against it, supplied by the current architecture itself:**
`assessStructuralNovelty` computes over a candidate's `targetCircle` and virtue-domain combination —
the two axes a friction candidate does not have. The committed function already handles this
honestly: a friction candidate returns `{ novel: true, confidence: 0 }` — the zero confidence
disclosing that the check has no basis rather than manufacturing one. **If friction becomes the
primary generator, the novelty check becomes basis-less for the primary channel by construction.**
This is not a defect in the current design. It is a direct structural consequence of the proposed
reordering, and any session that eventually opens the parked architectural question must answer it,
not merely note it.

---

## 3. The evidence table — every caveat on the row it qualifies

**What is certain:** in cycle 2, h7 competed in normal mode against four candidates that read
`principled` **(uncertified — predates the contamination fix; delivered `observed`, not `examined`,
at 29,750 ms against the 28,000 ms bound — both labels apply to every `principled` reading from cycle
2)** and won the tie-break outright, with the fallback counter never leaving 0. The run log names why
this matters: *"heuristics 1–6 generated four `principled`-tier candidates and still lost the
tie-break, which is a genuine data point about heuristic 7's selection competitiveness, not an
artefact of any fallback mechanism."*

| Cycle | Friction candidate | Mode | Won? | Proximity | Caveats (inline, not footnoted) |
| --- | --- | --- | --- | --- | --- |
| 1 | h7, T-05 | normal | No — h1 won a six-way tie at `deliberate` | — | Cycles 1–2's proximity verdicts are **uncertified, not cleared** — produced under the unlabelled `projectContext` mechanism, fixed 2026-08-11. |
| 2 | h7, T-04 | **normal, fallback never triggered** | **Yes**, tie-break | **`principled`**, domain `[dikaiosyne]`, no floor applied | **Uncertified proximity** (same reason as cycle 1 — this is the mentor's own central data point, and it is the exact number under caveat). **Delivered `observed`, not `examined`** — `layer1_latency_ms 16139 + layer3_latency_ms 13611 = 29,750 ms`, over the 28,000 ms bound; the C2 delivery-class distinction applies — the server completed the examination, but the agent's own client had already timed out. **Decided by the `r mod n` tie-break**, not by strict proximity superiority — h7 tied at `principled` with three virtue-domain candidates and won the draw. |
| 3 | h7, T-03 | normal | No — tied at `principled` with h1/h3/h5, lost the tie-break | `principled` (tied) | Certified (post-fix window not yet relevant to cycle 3 itself — cycle 3 is the cycle the contamination fix addresses, and it is a `dependency_unavailable` cycle with no winner, so h7's own guardrail-stage `principled` reading here is a filtered-candidate reading, not a winner reading). **Decided by the tie-break, and h7 lost it** — the mirror case to cycle 2. |
| 4 | h7, T-07 | normal | No — h4 won outright at `sage_like`, no tie | `principled` | Certified. **First cycle h7 lost outright on proximity alone**, not on a tie-break — a virtue-domain candidate simply out-scored it. |
| 5 | present | normal | No — tied at `principled` with h3/h4, lost the tie-break | `principled` (tied, not selected) | Certified. Cycle itself ended `dependency_unavailable` (the winner h4's `/api/reason` call failed — `extraction_instability`); h7 was not the winner and is unaffected by that failure. Third `principled` appearance, second tie-break loss. |
| 6 | h7, T-05 | normal | No — tied at `principled` with h3, lost the tie-break | `principled` (tied, not selected) | Certified. **h3, a virtue-domain candidate, tied h7 at the same rank** — see §5. Fourth `principled` appearance, third tie-break loss. Cycle ended `dependency_unavailable` (the winner h3's `/api/reason` call was the honest `layer1_throw` fallback — a distinct failure class from cycle 5's, see the traceability criterion document §5). |

**Cycle 2 is never cited as `principled` without both labels attached — uncertified and `observed`.**
Both labels ride the row above, inline, and both are repeated inline at every other point in this
document where cycle 2's proximity is invoked (§4), not only where the table itself is reproduced.

---

## 4. Strict wins versus tie-break wins — kept separate throughout

**Both h7 outcomes to date were decided by the `r mod n` tie-break, not by strict proximity
superiority.** Cycle 2 h7 *tied* at `principled` (**uncertified, `observed`** — see §3) and won the
draw; cycle 3 h7 *tied* at `principled` and lost it. Cycles 5 and 6 add two further tie-break losses
at `principled`. **Zero strict wins. One tie-break win. Three tie-break losses, plus one outright loss
(cycle 4) where h7 did not even reach the winning rank.**

Read together, these five outcomes are consistent with h7 being **competitive with** the
virtue-domain heuristics, not **superior to** them. The run log's own reading, quoted rather than
paraphrased: *"a tie-break loss, not a lower proximity … without over-reading a single tie-break
outcome as a trend either way."*

**The corrected reading, ruled (A5):**

> *"the corrected reading is: h7 is competitive with the virtue-domain heuristics, not demonstrated
> superior. S6 carries this correction. **The friction hypothesis is not weakened — it is stated more
> honestly.**"*

**The finding must be stated as its own finding, not as a diminished version of the one originally
sought (Q6-e ruling):**

> *"H7 passed at principled with h3 — the third consecutive cycle consistent with competitive rather
> than superior. The frozen null result requires strict wins separated from tie-break wins. **Three
> tie-break appearances at the top is a real finding. It is not the finding the friction hypothesis
> originally pointed at.**"*

At six cycles: **h7 has reached `principled` or better in five of the six cycles it has appeared in
(cycles 2, 3, 4, 5, 6 — every cycle except cycle 1, where the whole field tied at `deliberate`),
converted one of those five into a win, and never once strictly outscored the field.** That pattern —
reliable arrival at the top tier, unreliable conversion into an outright win — is the finding this
evidence supports. It is not evidence that
friction candidates score *higher* than virtue-domain candidates, which is the claim the original
hypothesis (§1) makes.

---

## 5. A third confound, from cycle 6 — proposal class, not heuristic

Cycle 6 produced the run's first genuine `rejected_by_guardrail` verdicts: h1, h2, and h4 all
floored to `reflexive` via a `dikaiosyne` floor, while h3, h5, and h7 passed. The floored three share
a property the passed three do not — each places a new claim about assessment reliability onto the
assessment-bearing surface itself (the traceability criterion document, §7, sets out the
discriminator and its bounds in full; not re-derived here).

**Why this bears directly on the friction hypothesis.** The hypothesis compares h7's proximity
distribution against h1–h6's. If the virtue-domain heuristics disproportionately generate a proposal
class that floors — self-referential reliability claims — while friction detection generates concrete
maintenance work that structurally cannot make such a claim, then part of any measured h7 advantage
would be an artefact of what the other channels happen to generate, not evidence that friction is a
better generation mechanism. The heuristic-level comparison would then be confounding **which
heuristic** with **which proposal class**, and a measured advantage would not support the
architectural conclusion the hypothesis is being tested for (friction as primary generator, virtue
heuristics demoted to an examination layer).

**Cycle 6's own data cuts against over-reading this, and is recorded as such rather than as
confirmation of an h7 advantage:** h7 passed at `principled` — but so did h3, a virtue-domain
candidate, at the same rank. Within cycle 6, h7 is **level with** the best virtue-domain candidate,
not above it. This is the third consecutive cycle consistent with *competitive, not superior* (§4).

---

## 6. The three-axis structure (Q6-e) — the joint test's required shape

There is already a second mentor-named §6 hypothesis, recorded at the close of the cycle-5 incident,
and it points the opposite way from the friction hypothesis:

> *"the service's examination substrate has reliability characteristics that are not uniform across
> proposal types. High-drama proposals — those with clear virtue domain engagement, explicit
> oikeiosis implications, visible blast radius — extract cleanly and consistently. Borderline
> proposals — dry documentation changes, low-drama disclosure text — sit at an extraction threshold
> that is sensitive to auxiliary framing in ways that are not fully controlled."*

Friction candidates are, by construction, the low-drama class — generated from any step in a routine
task that takes longer than expected, produces an unsatisfying result, or requires workaround
behaviour. Cycle 2's winner was a runbook/workaround narrowing, low blast-radius and fully reversible.
Cycle 5's extraction blindness struck a documentation proposal.

**So a friction-channel proximity advantage, read against un-cross-checked cycles alone, cannot be
distinguished from the extraction-instability hypothesis's own risk zone.** If both hypotheses are
carried into the §6 report without being related to each other, the report will contain a finding and
its own undercutting caveat in separate sections, unnoticed. **Ruled to be tested jointly (C8):**

> *"Test jointly. Friction candidates are borderline proposals by construction. The §6 report cannot
> carry the friction hypothesis and its undercutting caveat in separate sections without naming the
> joint dependency explicitly."*

Cycle 6 adds a **third** axis to that joint test — proposal class (§5). **Ruled, and now binding on
the §6 analysis (Q6-e):**

> *"the frozen null result stands as written — it is the right discriminator. The §6 analysis adds
> proposal class as a third reporting axis alongside heuristic channel and proximity. The friction
> hypothesis is tested within that three-axis structure. If the data is insufficient to disaggregate
> cleanly — too few clean cycles, too few strict wins — the §6 report states that explicitly rather
> than forcing a conclusion from underpowered evidence."*

**The reporting vocabulary for proposal class, named by the ruling and binding:**

1. **disclosure/labelling proposals**,
2. **friction-identified proposals**,
3. **virtue-domain proposals that are neither**.

**If the floored class clusters in one heuristic channel and the principled class clusters in
another, the §6 report must name the confound explicitly rather than attribute the difference to
channel quality alone.**

**Scope boundary — load-bearing, and separate from the reordering question (C7, restated by the
Q6-e ruling as directly relevant here):**

> *"the normative-gap mechanism and the friction-primary reordering are two proposals, not one.
> Cycle 6's evidence bears on the friction channel as it currently exists — heuristic 7 reading
> technical friction. It does not yet bear on the normative-gap mechanism, which has not been built.
> The §6 report should not conflate them."*

The normative-gap mechanism — an agent asking *"where does the current system fall short of what
virtue requires?"* as a distinct generation mechanism grounded in boulesis rather than technical
friction (Heading 2/3 of the synthesis, developed in S2/S3) — **has not been built and is not what
cycle 6's evidence bears on.** Every reference to "the friction hypothesis" in this document and in
the §6 report means heuristic 7 as it currently exists — technical friction detection — and not the
normative-gap mechanism, until the latter is separately scoped and built.

---

## 7. The frozen null result — transcribed verbatim, not paraphrased

**This is the discriminator (B5, ruled 2026-08-11).** It is reproduced here exactly as it appears in
`2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` §B5, without paraphrase or improvement:

> **B5. S6 — Null result specified now.** The run is live. The temptation to fit the discriminator
> after seeing the distribution is real and the project has a precedent for freezing thresholds
> first. Ruling: the friction hypothesis is **rejected** if, restricted to cycles whose winner
> extraction was cross-checked clean, h7's proximity distribution — with strict wins and tie-break
> wins reported separately — does not differ from h1–h6's distribution when blast-radius and
> reversibility are read alongside proximity. A channel that reliably ties at the top is a real
> finding but a different one from a channel that reliably wins. Both are reported. Neither is the
> other. **The null result is: no difference in the joint distribution across proximity, blast-radius,
> and reversibility, in clean cycles, with strict wins separated. This is frozen now.**

**Frozen means frozen.** Per the mentor's instruction in `RUN-LOG.md:326`: this wording is fixed
*before the distribution is visible*, on the P2 frozen-boxes precedent. The §6 analysis applies it as
written. If it is ever amended, the amendment is dated, the original is kept, and the reason is
recorded — it must never be silently refitted to the data. **The proposal-class axis added by Q6-e
(§6 above) is a reporting addition to how the frozen result is interpreted; it is not a
re-specification of the discriminator itself, and it must not be read as one.**

**The dependency this creates on S4's cross-endpoint check, stated plainly:** the discriminator is
restricted to *"cycles whose winner extraction was cross-checked clean."* That cross-check is S4's B7
comparison, which is in force from cycle 6 onward. Cycles run before the comparison began carry no
clean/diverged label under the four-valued vocabulary (`clean` / `diverged` / `not_comparable` /
`unlabelled` — see the traceability criterion document, §4), and per that vocabulary's own discipline
`not_comparable` behaves like `unlabelled` — out of scope, never inferred clean. **So S6's
discriminator is computable only over cycles from the cross-check's start onward.** This is why S4 and
S6 are one session, and why B7 starting at cycle 6 rather than at the §6 report is load-bearing for
this ruling rather than merely convenient.

**Current standing under the discriminator, as of cycle 6 — stated for orientation, not as an
analysis:** the cross-endpoint check has run on exactly one comparable cycle so far (cycle 6 was
`not_comparable`; cycles 1–2 are `unlabelled`; cycle 3 was already `diverged` on a pre-existing,
now-fixed contamination signature; cycle 4 was `clean (qualitative)`; cycle 5 was `diverged` on the
empty-vs-populated signature). **Zero cycles are simultaneously (a) cross-checked clean and (b) a
strict h7 win.** This is not itself the analysis — it is the honest state of the denominator at the
point this document is written, and it is why §8's underpowered-evidence clause is not a formality.

---

## 8. The mandatory underpowered-evidence clause

**If the clean-cycle count or the strict-win count is too small to disaggregate three ways
(heuristic channel × proximity × proposal class), the §6 report must say so rather than force a
conclusion.** This is now a mandatory clause under the Q6-e ruling, not an optional caveat:

> *"If the data is insufficient to disaggregate cleanly — too few clean cycles, too few strict wins —
> the §6 report states that explicitly rather than forcing a conclusion from underpowered evidence."*

**This is a live possibility, not a formality, given the run's own state at the time this document is
written:** three of the run's first six cycles are `dependency_unavailable`; cycles 1–2 are
proximity-uncertified; and, per §7, the frozen discriminator's own denominator (cross-checked-clean
cycles) is currently thin. A §6 report reaching the mentor with too few qualifying cycles to
disaggregate three ways must say exactly that — "not yet testable," in the run log's own phrase for
an analogous situation — rather than report a partial breakdown as if it were conclusive.

---

## 9. What this document does not do

- It does not propose, prepare, or write anything a later session could read as authorisation to
  reorder the IDEA loop's generation channels. The mentor's line is exact, and no stronger claim is
  made anywhere above: the finding *"may support reordering them."*
- It does not re-specify the frozen null result (§7). The three-axis addition from Q6-e is a
  **reporting** addition — how the frozen discriminator's result is disaggregated and presented — not
  a change to the discriminator itself.
- It does not conflate the friction-primary reordering with the normative-gap mechanism (§6). The
  latter has not been built and this document's evidence does not bear on it.
- It writes nothing into the validation run's own records.

---

## 10. Sources

- `2026-08-11-mentor-synthesis-primal-substrate-verbatim.md` — Heading 6 (the hypothesis, verbatim).
- `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` — A5, B5 (the frozen null result, source
  of §7's verbatim transcription), C7, C8, C18.
- `2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` — Ruling 1 (the dikaiosyne floor
  pattern, cross-referenced from the traceability criterion document) and Ruling 2, §Q6-e (the
  three-axis structure).
- `S6-friction-primary-mechanism-hypothesis-scope.md` — the full mechanism-fact trace (PR20) this
  document builds on.
- `traceability-criterion.md` — the cross-endpoint check and its four-valued vocabulary, referenced
  rather than re-derived, per §7's dependency on it.
- `RUN-LOG.md:296-334` (the B7 ruling detail and the friction-channel dependency it names verbatim),
  `RUN-LOG.md:533-627` (cycles 1–2), `RUN-LOG.md:930, :1412, :1737` (the friction-channel productivity
  table across cycles 4, 5, 6), `RUN-LOG.md:1610-1675` (cycle 6's guardrail step and the
  `rejected_by_guardrail` pattern), `RUN-LOG.md:1749` (the `not_comparable` cross-endpoint row).
