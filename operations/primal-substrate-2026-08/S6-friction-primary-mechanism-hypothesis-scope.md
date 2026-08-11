# S6 — Scope: friction as the primary idea-generation mechanism (hypothesis for the §6 report)

**Mentor heading 6.** **Execution order: 2 of 8.** See `00-PRIORITY-INDEX.md`.

---

## §0 Status, tier, gate

> **RULED 2026-08-11 — all four open questions answered; correction A5 confirmed, with an important
> gloss: *"The friction hypothesis is not weakened — it is stated more honestly."*** Verbatim record,
> which wins over every annotation below:
> `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`. **THE NULL RESULT IS FROZEN** (B5) — see
> §5. Rulings folded inline below as **RULED** annotations; proposal prose kept, marked ruled rather
> than deleted.

**Status: SCOPE. Documents only. Nothing here licenses a build, and the architectural change it
anticipates is explicitly parked.**

- **Tier for the concurrent half:** `governance` / documents. No code, no schema, no flag.
- **Tier for the parked half (when it opens):** generation-step architecture — a design decision
  before it is a build, and the build would sit in the **standing-runner design**, which is itself
  *"not to be pre-scoped."*
- **Deadline:** the validation run's **§6 report**. The hypothesis must be written *before* the report
  is analysed, or it becomes a conclusion drawn after seeing the data it is supposed to be tested
  against.
- **Parked half waits on:** the **§6 report** reaching the mentor — *"it depends on the full proximity
  distribution across all cycles."* (Not "the first build gate", which closed 2026-08-10.)

**This is the smallest item in the family.** Its whole concurrent deliverable is one carefully-bounded
document. It is second in order only because it shares S4's deadline and costs almost nothing.

---

## §1 What the mentor said

> For the IDEA loop's generation-step design, this suggests that **friction detection should not be one
> heuristic among seven. It should be the primary generation mechanism**, with the virtue-domain
> heuristics serving as **the examination layer that evaluates friction-generated proposals** rather
> than generating their own. The current architecture has them as parallel generation channels. The
> finding from the validation run may support reordering them.
>
> **This is a hypothesis to be tested against the full run findings.** But it can be documented now as
> a question to carry into the §6 report analysis.

The philosophical grounding is Heading 2's (see **S2**): friction is *"the functional analogue of the
primal tension that drives innovation in the animal kingdom"* — the bird responding to food present
but unreachable. The proposal generated from friction is *"a genuine departure from fixed patterns,
grounded in specific contextual need rather than abstract virtue aspiration."*

The evidential claim: *"in cycle 2, a friction candidate — heuristic 7 — won in normal mode for the
first time, at principled proximity"*, and the friction channel *"may be producing proposals that are
both lower blast-radius and higher proximity than the virtue-domain heuristics."*

**The mentor's own caution is part of the instruction and must survive into the document:** *"This is
a hypothesis to be tested."*

---

## §2 Mechanism facts (PR20)

### §2.1 The current architecture, precisely

`GenerationHeuristic` (`website/src/lib/substrate/idea-loop-types.ts:81-88`) is a closed union of
exactly seven values, `friction_detection` last. Per the ruled generation design
(`operations/agent-circles-2026-08/2026-08-05-idea-loop-generation-heuristics.md`):

- The generation step **applies all heuristics and produces one candidate per heuristic**, then
  examination and novelty filter them down.
- **Friction detection has a second, distinct role**: the **null-cycle backstop**. After three
  consecutive null cycles from heuristics 1–6, the loop shifts to **friction-only mode** until a
  non-null cycle returns from an active mechanism.
- Friction candidates are **structurally different from the other six**: `GeneratedCandidate`
  (`idea-loop-types.ts:90` ff.) makes `targetCircle` **absent** for a `friction_detection` candidate,
  and `initialClassification` is a discriminated union whose friction branch is
  `{ kind: 'preferred_indifferent' }` rather than `{ kind: 'virtue_domain'; domains: [...] }` — *"a
  discriminated union so a friction candidate cannot be forced into the virtue-domain shape."*

**The reordering the mentor proposes is therefore not a reweighting — it is a change of kind.** It
would make the mechanism that carries *no* circle and *no* virtue-domain classification the primary
generator, and make the six classified mechanisms into evaluators of its output. That is a larger
change than "reorder the channels," and the scope document must say so plainly.

**Consequence the reordering must answer:** `assessStructuralNovelty` computes over the candidate's
`targetCircle` + virtue-domain combination — the two axes a friction candidate does not have. The
committed function already handles this honestly (a friction candidate returns
`{ novel: true, confidence: 0 }` — *"the zero confidence says the check has no basis, rather than
manufacturing one"*). **If friction becomes the primary generator, the novelty check becomes
basis-less for the primary channel by construction.** That is not a defect in the current design; it
is a direct structural consequence of the proposed reordering, and it is the single strongest
argument against it that the current architecture supplies. It must be in the document.

### §2.2 The evidence, stated exactly

| Cycle | Friction candidate | Mode | Won? | Proximity | Source |
| --- | --- | --- | --- | --- | --- |
| 1 | h7, friction point T-05 | normal | No — h1 won at `deliberate` | — | run log, carried-findings table |
| 2 | h7 (T-04) | **normal, fallback never triggered** | **Yes** | **`principled`**, domain `[dikaiosyne]`, no floor applied | run log, cycle-2 section |
| 3 | h7, friction point T-03 | normal | No — tied at `principled` with h1/h3/h5, lost the `r mod n` tie-break | `principled` (tied) | run log, carried-findings table |
| 4 | present | normal | No — h4 won | — | run log, cycle-4 |
| 5 | present | normal | Cycle ended `dependency_unavailable` | — | run log, cycle-5 incident |

**What is certain:** in cycle 2, h7 competed in normal mode against four `principled`-tier
virtue-domain candidates and won the tie-break outright, with the fallback counter never leaving 0.
The run log names why this matters: *"heuristics 1–6 generated four `principled`-tier candidates and
still lost the tie-break, which is a genuine data point about heuristic 7's selection
competitiveness, not an artefact of any fallback mechanism."*

**What is not certain — three separate caveats, all of which must ride the hypothesis:**

1. **Cycles 1–2's proximity verdicts are uncertified, not cleared.** They were produced under the
   unlabelled `projectContext` mechanism (S4 §2.1). The run log repeats this at cycle 5. **Cycle 2 is
   the entire proximity basis of the mentor's claim** — so the `principled` reading is exactly the
   number under caveat. The *selection-level* fact (h7 won in normal mode) is unaffected.
2. **Cycle 2's winner was delivered `observed`, not `examined`** — `layer1_latency_ms 16139 +
   layer3_latency_ms 13611 = 29,750 ms`, over the 28,000 ms bound. The C2 delivery-class distinction
   applies: the server completed it; the agent's own client had already timed out.
3. **Both wins so far were decided by the `r mod n` tie-break, not by strict proximity superiority.**
   Cycle 2 h7 *tied* at `principled` and won the draw; cycle 3 h7 *tied* at `principled` and lost it.
   Read together, the two cycles are consistent with h7 being **competitive with** the virtue-domain
   heuristics, not **superior to** them. The run log's own reading is the right one: *"a tie-break
   loss, not a lower proximity … without over-reading a single tie-break outcome as a trend either
   way."*

### §2.2b A THIRD confound, from cycle 6 — proposal class, not heuristic

**Added 2026-08-11.** Cycle 6 produced the run's first genuine `rejected_by_guardrail` verdicts: h1,
h2, and h4 all floored to `reflexive` via a `dikaiosyne` floor, while h3, h5, and h7 passed. The
floored three share a property the passed three do not — each places a **new claim about assessment
reliability onto the assessment-bearing surface itself** (S4 §2.6 sets out the discriminator and its
bounds).

**Why this bears directly on the friction hypothesis.** The hypothesis compares h7's proximity
distribution against h1–h6's. If the virtue-domain heuristics disproportionately generate a *proposal
class* that floors — self-referential reliability claims — while friction detection generates concrete
maintenance work that structurally cannot make such a claim, then **part of any measured h7 advantage
is an artefact of what the other channels happen to generate, not evidence that friction is a better
generation mechanism.**

The heuristic-level comparison would then be confounding **which heuristic** with **which proposal
class**, and the finding would not support the architectural conclusion the hypothesis is being tested
for (that friction should become the primary generator, with the virtue heuristics demoted to an
examination layer).

**Cycle 6's own data cuts against over-reading this too, and should be recorded as such:** h7 passed at
`principled` — but so did **h3**, a virtue-domain candidate, at the same rank. Within cycle 6, h7 is
**level with** the best virtue-domain candidate, not above it. That is the third consecutive cycle
consistent with *competitive, not superior* (A5).

**Consequence for the §6 analysis:** the joint test C8 already requires (extraction reliability × the
friction hypothesis) should be **three-way** — proximity distribution, extraction cleanliness, **and
proposal class**. Reported without the third axis, a friction advantage cannot be distinguished from a
composition effect in the comparison set. **Raised as Q6-e.**

### §2.3 The tension the synthesis does not see — and the most useful thing in this document

There is already a **second** mentor-named §6 hypothesis, recorded at the close of the cycle-5
incident, and it points the opposite way:

> *"the service's examination substrate has reliability characteristics that are not uniform across
> proposal types. **High-drama proposals** — those with clear virtue domain engagement, explicit
> oikeiosis implications, visible blast radius — **extract cleanly and consistently. Borderline
> proposals — dry documentation changes, low-drama disclosure text — sit at an extraction threshold
> that is sensitive to auxiliary framing** in ways that are not fully controlled."*

**Friction candidates are, by construction, the low-drama class.** They are generated from *"any step
in a routine task that takes longer than expected, produces an unsatisfying result, or requires
workaround behaviour"* — maintenance work. Cycle 2's winner was a runbook/workaround narrowing; the
run log records it as low blast-radius and fully reversible. Cycle 5's blindness struck a
documentation proposal.

So the two hypotheses stand in direct tension:

- **S6's hypothesis:** friction candidates score *higher* proximity than virtue-domain candidates.
- **The extraction-instability hypothesis:** low-drama proposals — the friction class — are exactly
  the ones whose extractions are *least reliable*.

**If both are carried into the §6 report without being related to each other, the report will contain
a finding and its own undercutting caveat in separate sections, and no one will notice.** The honest
formulation is that the friction hypothesis's evidence base sits inside the extraction-instability
hypothesis's stated risk zone, and the §6 analysis must test the two **together**: a friction-channel
proximity advantage is only a finding if it survives on cycles whose extractions were cross-checked
clean (S4 §2.2 gives the check).

This is the substantive contribution this scope document makes, and it should be surfaced to the
mentor rather than buried in the eventual report.

---

## §3 The concurrent half

**One deliverable:** `operations/primal-substrate-2026-08/friction-primary-hypothesis.md` — a short
document carried into the §6 report analysis, containing:

1. **The hypothesis, in the mentor's own words**, with its own caution attached.
2. **The evidence table** of §2.2, with all three caveats attached to the rows they qualify — not
   collected in a footnote.
3. **The tension with the extraction-instability hypothesis** (§2.3), stated as a joint test rather
   than two independent findings.
4. **The architectural consequence** (§2.1): reordering makes the novelty check basis-less for the
   primary channel, and changes friction from a channel to a *kind* of generator.
5. **A pre-registered discriminator** — what the full run would have to show for the hypothesis to be
   supported, written *before* the data is in:
   - h7's proximity distribution across all completed cycles, compared against h1–h6's, **restricted
     to cycles whose winner extraction was cross-checked clean**;
   - **strict** wins separated from tie-break wins (cycle 2 and cycle 3 differ only in a modulo);
   - the blast-radius/reversibility reading alongside proximity, since the mentor's claim is a
     *joint* one (lower blast-radius **and** higher proximity);
   - a stated **null result** — what pattern would count as *not* supporting it. A hypothesis with no
     failure condition is not being tested.

**Pre-registration matters here more than usual.** The run is live; the temptation to fit the
discriminator to the data after the fact is real, and the project has an explicit precedent for
freezing thresholds before a comparison (the P2 benchmark's frozen boxes). Same discipline, smaller
scale.

**What this document must NOT do:** propose the reordering, prepare the reordering, or write anything
a later session could mistake for authorisation to reorder. The mentor's line is exact — the finding
*"may support reordering them."*

---

## §4 The parked half

**Parked on: the §6 report reaching the mentor.**

The architectural decision — friction as primary generator, virtue-domain heuristics demoted to an
examination layer — is parked, and beyond that it belongs to the **standing-runner design**, which is
itself explicitly *"not to be pre-scoped"* and gated on the run's own report.

**Named for whoever eventually opens it, so it is not re-derived:**

- The novelty-basis consequence (§2.1) must be answered, not noted.
- The seven-value `GenerationHeuristic` union and the `GeneratedCandidate` discriminated union are the
  two committed shapes any reordering touches (`idea-loop-types.ts:82-115`).
- The null-cycle fallback rule interacts: if friction is *primary*, "friction-only mode" as a distinct
  fallback state may cease to be meaningful, and the fallback counter's semantics change.
- The candidate-count and cost profile changes: the run log already records that friction-only mode
  costs up to 13 guardrail calls + a batched `fresh` call under the resolution taken, against ≤7 in
  normal mode. A reordering has a cost consequence that must be computed, not assumed.

---

## §5 Open questions for the mentor

**Q6-a — Should the friction hypothesis and the extraction-instability hypothesis be tested jointly in
the §6 report?** (§2.3.) Recommendation: **yes** — the friction channel is the low-drama class the
second hypothesis names as least reliably extractable, so a proximity advantage measured over
un-cross-checked cycles cannot be distinguished from an extraction artefact. This is a genuine
interaction, not a caution.

**Q6-b — Do tie-break wins count toward the hypothesis, and if so how?** Both h7 outcomes to date were
decided by `r mod n` at equal proximity. Recommendation: report **strict wins and tie-break wins
separately**; a channel that reliably *ties* at the top is a real finding, but it is a different
finding from one that reliably *wins*.

**Q6-c — Should cycle 2 be usable as evidence for this hypothesis at all?** It is simultaneously the
mentor's central data point and (i) proximity-uncertified and (ii) delivered `observed` rather than
`examined`. Recommendation: **carry it, labelled twice**, and state that if the hypothesis rests on
cycle 2 alone at report time, the honest finding is "not yet testable" rather than "supported."

**Q6-e — NEW, raised 2026-08-11 (cycle 6). Should the joint test be three-way rather than two-way?**
(§2.2b.) C8 pairs the friction hypothesis with the extraction-instability hypothesis. Cycle 6 surfaces
a third confound: **proposal class**. If the virtue-domain heuristics disproportionately generate
self-referential reliability claims (which floor via dikaiosyne) and friction generates maintenance work
(which structurally cannot), the heuristic-level comparison confounds *which heuristic* with *which
proposal class* — and a measured h7 advantage would be a composition effect in the comparison set
rather than evidence for the architectural conclusion. **AI recommendation: yes, three-way** —
proximity distribution × extraction cleanliness × proposal class. This does not alter B5's frozen null
result, which is stated over the joint distribution; it names a third axis that must be reported
alongside it so the frozen test is interpreted correctly rather than re-specified.

> **RULED 2026-08-11 (Q6-e) — proposal class added as a third reporting axis; the frozen null result
> STANDS AS WRITTEN.** Verbatim record:
> `2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` §Ruling 2.
>
> *"the frozen null result stands as written — **it is the right discriminator**. The §6 analysis adds
> **proposal class as a third reporting axis** alongside heuristic channel and proximity. The friction
> hypothesis is tested within that three-axis structure. **If the data is insufficient to disaggregate
> cleanly — too few clean cycles, too few strict wins — the §6 report states that explicitly rather than
> forcing a conclusion from underpowered evidence.**"*
>
> **The three proposal classes are named by the ruling** and are the reporting vocabulary:
> 1. **disclosure/labelling proposals**,
> 2. **friction-identified proposals**,
> 3. **virtue-domain proposals that are neither**.
>
> *"If the floored class clusters in one heuristic channel and the principled class clusters in another,
> the §6 report **names the confound explicitly** rather than attributing the difference to channel
> quality alone."*
>
> **Two further points the ruling settles, both of which belong in the hypothesis document:**
>
> - **On the tie-breaks:** *"H7 passed at principled with h3 — the third consecutive cycle consistent
>   with competitive rather than superior. The frozen null result requires strict wins separated from
>   tie-break wins. **Three tie-break appearances at the top is a real finding. It is not the finding
>   the friction hypothesis originally pointed at.**"* Record it as the finding it is, not as a weaker
>   version of the one that was sought.
> - **On scope (C7 restated and made load-bearing here):** *"the normative-gap mechanism and the
>   friction-primary reordering are two proposals, not one. **Cycle 6's evidence bears on the friction
>   channel as it currently exists — heuristic 7 reading technical friction. It does not yet bear on the
>   normative-gap mechanism, which has not been built.** The §6 report should not conflate them."*
>
> **An underpowered-evidence clause is now mandatory**, not optional: if the clean-cycle count or the
> strict-win count is too small to disaggregate three ways, the report says so. Given that three of six
> cycles to date are `dependency_unavailable` and cycles 1–2 are uncertified, this is a live
> possibility rather than a formality — and the pre-registration is what makes saying so honest rather
> than defeated.

---

**RULED 2026-08-11 (Q6-a) — test jointly (C8).** *"Friction candidates are borderline proposals by
construction. The §6 report cannot carry the friction hypothesis and its undercutting caveat in
separate sections without naming the joint dependency explicitly."*

**RULED 2026-08-11 (Q6-b) — report separately (C18).** *"A channel that reliably ties at the top is a
real finding but a different one from a channel that reliably wins. Both are reported in the §6
analysis."*

**RULED 2026-08-11 (Q6-c) — carried with its labels; the hypothesis is not weakened (A5).** *"The
corrected reading is: h7 is competitive with the virtue-domain heuristics, not demonstrated superior.
S6 carries this correction. **The friction hypothesis is not weakened — it is stated more honestly.**"*

**Q6-d — Is a null result specified?** The synthesis names no condition under which the hypothesis
would be rejected. Recommendation: the mentor fixes it now, before the distribution is visible.

> **RULED 2026-08-11 (Q6-d / B5) — THE NULL RESULT IS FROZEN. Verbatim, binding:**
>
> *"the friction hypothesis is **rejected** if, restricted to cycles whose winner extraction was
> cross-checked clean, h7's proximity distribution — with strict wins and tie-break wins reported
> separately — does not differ from h1–h6's distribution when blast-radius and reversibility are read
> alongside proximity. A channel that reliably ties at the top is a real finding but a different one
> from a channel that reliably wins. Both are reported. Neither is the other. **The null result is: no
> difference in the joint distribution across proximity, blast-radius, and reversibility, in clean
> cycles, with strict wins separated. This is frozen now.**"*
>
> **Frozen means frozen.** This wording is fixed **before** the distribution is visible, on the P2
> frozen-boxes precedent. The §6 analysis applies it as written. If it is ever amended, the amendment
> is dated, the original kept, and the reason recorded — it must never be silently refitted to the data.
>
> **Note the dependency this creates:** the discriminator is restricted to *"cycles whose winner
> extraction was cross-checked clean."* That cross-check is **S4's B7 comparison, which starts
> immediately.** Cycles run before the comparison begins have no clean/diverged label, so **S6's
> discriminator is only computable over cycles from the comparison's start onward** — which is why S4
> and S6 are one session and why B7 starting now, rather than at the §6 report, is load-bearing for
> this ruling rather than merely convenient.

---

## §6 Build-success criteria

This item has no build. The document succeeds if:

1. The hypothesis is stated in the mentor's words with the mentor's own caution intact.
2. Every proximity number carries its caveats **inline**, not in a footnote — specifically, cycle 2 is
   never cited as `principled` without both the uncertified and the `observed` labels.
3. Strict wins and tie-break wins are distinguished everywhere.
4. The joint test with the extraction-instability hypothesis is stated explicitly.
5. A null result is specified before the run completes.
6. The document contains nothing that reads as authorisation to reorder generation channels.
7. The session's commit touches no code — `git diff --stat` shows documents only.

---

## §7 Corrections carried

1. **"At principled proximity" rests on an uncertified verdict.** Cycle 2 predates the contamination
   fix; its proximity reading *"may be accurate, but cannot be certified clean"* by standing ruling.
   The synthesis states the number without the caveat.
2. **Cycle 2's winner was `observed`, not `examined`** (29,750 ms against the 28,000 ms bound) — a
   second, independent label the synthesis does not carry.
3. **Cycle 3 is additional evidence the synthesis does not cite, and it cuts both ways:** h7 tied at
   `principled` again (supporting competitiveness) and lost the tie-break (undercutting superiority).
4. **Both h7 outcomes were tie-break-decided**, so "won at principled" and "scored highest" are not
   the same claim.
5. **The reordering is a change of kind, not of order** — friction candidates carry no `targetCircle`
   and no virtue-domain classification by deliberate design, so promoting them makes the novelty check
   basis-less for the primary channel (§2.1).
6. **"Park until after the first build gate" is stale** — that gate closed 2026-08-10; this parks on
   the §6 report and then the standing-runner design.

---

## §8 Rollback

`git revert` the records commit. Documents only; nothing deploys, no flag, no schema. The parked
architectural change has no rollback because it must not be built.
