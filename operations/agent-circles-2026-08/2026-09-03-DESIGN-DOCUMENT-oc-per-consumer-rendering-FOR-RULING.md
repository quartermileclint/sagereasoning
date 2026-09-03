# DESIGN DOCUMENT — O-C per-consumer rendering (Gate 3, for mentor ruling)

**Date:** 2026-09-03. **Gate:** **Gate 3** of the three-gate chain
(`2026-08-16-mentor-ruling-oc-scoping-license-verbatim.md`): *"Gate 3: O-C design session runs
(AI-run, documents-only, M2 shape), produces a design document, returns for mentor ruling. No build
is licensed at this gate."* **Agenda:** Gate 2's ruling
(`2026-08-23-mentor-rulings-oc-gate2-verbatim.md`), in the ruled order (c) → (d) → (a)/(b)/(e).

**Status: RULED 2026-09-03.** **Tier:** `governance` — documents only.

> ## ⚖ BINDING RULING ANNOTATIONS — applied 2026-09-03
>
> **All seven questions RULED.** Verbatim record, which **wins over this document and every summary
> of it**: `operations/agent-circles-2026-08/2026-09-03-mentor-rulings-oc-gate3-verbatim.md`
> (`D-MENTOR-RULINGS-OC-GATE3-ADOPTED-EXECUTED-2026-09-03`). Where an annotation below conflicts with
> the body text underneath it, **the annotation governs and the body is superseded in that respect**;
> the body is left standing rather than rewritten, so the reasoning that was ruled on remains legible.
>
> - **Q1 — RULED. Gate 3 was properly before the session.** *"Gate 3 owns the rendering surface and
>   the floor constraint. A4's next design-capable session owns Layer 3 injection and the
>   relational-context reframing."* Not the same question — the same subject at **different
>   architectural layers**. **A4's premise being false does not dissolve its routing**; it means the
>   routing was premised on a state that does not yet exist. **Binding consequence:** anything here
>   bearing on A4's items is **named in the handoff to the standing-runner track, not resolved** —
>   see §11.
> - **Q2 — RULED, with an implication this document did not name.** The disclosure floor is correct.
>   **The floor applies to the verdict's *conditions of production*, not to its *content*** — *"a
>   condition on the rendering's honesty, not a condition on its form."* Two audiences may receive
>   different wording, channel and next steps; neither may have a bearing limit withheld. The ground
>   is doctrinal: withholding such a limit is *"a false impression by omission"*, and the assent that
>   follows *"is not free."*
> - **Q3 — RULED, and it supersedes this document's cheapness claim.** Re-siting ruled text requires
>   **its own surface-scoped vetting**; the authoring ruling *"did not establish its fitness for every
>   surface the text might subsequently appear on."* **§5.1's "No — re-sited" entries and the claim
>   that five of nine elements need no new wording are SUPERSEDED** — each element is vetted against
>   its surface, audience and channel.
> - **Q4 — RULED against the design's flagship element.** The ruled delivery sentence **does not
>   survive** the change of surface and referent, on three independently sufficient grounds (the relay
>   constraint; R20d in the relay sibling; **the transport-level proxy exceeding its evidential
>   basis**). *"The ruled text is a content anchor, not a portable string."* **New wording is required
>   per surface, and the proxy basis must be disclosed.**
> - **Q5 — RULED as designed.** Emit-and-annotate stands; the refusal class belongs to the
>   floor-semantics track. **New requirement:** the annotation **must disclose the proxy basis and its
>   uncertainty** — *"'The reasoning may not have been examined in time' is more honest than 'the
>   reasoning was not examined in time'"*.
> - **Q6 — RULED against the proposed remedy. The pointer is DROPPED** for orientation-only agents and
>   **the element's scope is conceded.** The ENV-1 gate extension is **not licensed** and would need
>   its own scoping session *"justified on its own terms — not as a remedy for the pointer's failure."*
>   The 14% reach is *"a disclosed limit, not a design failure."*
> - **Q7 — RULED.** Use the completed classification and demonstrated Reading B **at the level the
>   evidence supports**: present *in this population*, **not** dominant, and **Reading A not
>   excluded**.
>
> **Licensed by the ruling:** proceeding on Q1's boundary; applying Q2's floor; Q3's vetting
> discipline; Q4's new wording; Q5's emit-and-annotate; Q6's dropped pointer; Q7's evidential level.
> **Not licensed — §7's exclusion list is explicitly unchanged**, including activation, any code edit,
> any ENV-1 change, and **publication of any string, re-sited ones included**.

> **⚠ `SUBSTRATE_LAYER3_ENABLED` remains UNSET (re-verified §0). This document licenses nothing —
> not activation, not a code edit, not a string. §7 states the boundary exhaustively.**

**Revision note (PR19).** This document was **substantially rewritten** after three independent blind
adversarial reviews. **Its original central proposition was withdrawn as refuted** — see §5.0. Other
folded findings: a fabricated quotation (§3.1), a false premise about the served response shape
(§1.2), a self-defeating collision between §4.1 and §2.4 (§2.4), an unreachable pointer (§2.4),
dimension (d) silently narrowed (§3.0), dimension (e) mislabelled as declined (§4.3), and a missing
channel classification (§6). The review record is §10.

---

## 0. Part A — re-verification (PR20)

Every present-tense claim inherited from the session prompt and the Gate-2 scope document was
re-derived from source. **Three drifts; one materially corrects an inherited figure, one is a
boundary tension this document surfaces rather than resolves.**

**Held:** `SUBSTRATE_LAYER3_ENABLED` unset. The four relational-context fields absent from
`website/src` (grep: 0). `auth.user?.id` still the sole practitioner-type discriminator
(`app/api/reason/route.ts:814`). L-5 executed at `9bfd69e` (2026-08-17), unchanged since. No second
runner population since the §6 run.

### 0.1 The Layer-3 dormancy check, and a defect in the prescribed check itself

**Per-file, the three Layer-3 files were last touched:** `layer3-service.ts` — `07df7d1`
(2026-05-28); `layer3-prose.ts` — `3c4c595` (2026-06-03); `layer3/route.ts` — `9e5874e`
(2026-05-12). All predate the O-C chain. **Dormancy holds.**

**But the prescribed check could not have established it.** The session prompt's Part A command reads
`git log -1 -- …/substrate/layer3-service.ts …/substrate/layer3-prose.ts …/api/substrate/layer3/route.ts`.
**`website/src/lib/substrate/layer3-prose.ts` does not exist** — the file is at
`website/src/lib/translation-sandwich/layer3-prose.ts`. `git log` does not error on a non-matching
pathspec; it silently contributes nothing. **The prescribed dormancy check was structurally blind to
one of the three files it names, and would have reported clean no matter what had happened to it.**
An earlier draft of this document ran that command and reported its single-commit output as covering
all three files — corrected here, and named because the same wrong path appears in the Gate-2
document's §6 table and in this document's own earlier draft.

### 0.2 The delivery-classification polarity — corrected, with its scope stated accurately

**Source** (`website/src/lib/translation-sandwich/orientation-reading.ts:203-210`;
`ORIENTATION_DELIVERY_TIMEOUT_MS = 28000` at :194):

```
 * `elapsedMs <= ORIENTATION_DELIVERY_TIMEOUT_MS` ⇒ 'examined' (the framing
 * plausibly reached the agent's own consult window in time to be acted on).
 * `elapsedMs > ORIENTATION_DELIVERY_TIMEOUT_MS` ⇒ 'observed' (the harness's
 * own client-side timeout would have already fired and moved on before this
 * completion — the conservative default when delivery cannot be confirmed).
```

**`observed` is the class that landed OUTSIDE the window. The §6 report records 19 `observed`, 3
`examined` — so ≈86% landed outside, not 14%.**

**Where the error actually is, stated precisely rather than broadly.** The Gate-2 scope document's
**§2.2 states the correct figure** — *"19 classed `observed`, 3 classed `examined`"*, `~86%`. Its
**§3 then mis-summarises its own evidence** one section later as *"outside the observed timeout bound
14% of the time (3/22)"*. The session prompt repeats the §3 error **and mis-cites §2.2 as its
source** — the very section that contradicts it. The mentor's Q2 ruling inherits the figure
(*"delivery-timeout gap at 14% of orientation events"*).

So: **the Gate-2 document did not invert the polarity; it mis-summarised itself.** An earlier draft
of this document said "both inherited documents" invert it and cited only §3. Corrected. The
distinction matters because the mentor will read the Gate-2 document beside this one.

**Effect on the ruling:** Q2's substance — the gap is measured, not hypothetical; L-5's discipline is
the generalisation candidate — is untouched and strengthened. **Effect on this design: it is not
uniformly favourable, and §2.4 now says so.** At 14% outside, a response-borne delivery notice would
reach most readers usefully. At 86% outside, it reaches ~14% — the circularity is the dominant case,
not a caveat.

*The §6 data is a single credentialed loop identity's 20-cycle consult history — a verified instance,
not a survey of agent practitioners in general.*

### 0.3 Both named tracks have moved since the prompt was authored

The prompt instructs Gate 3 to state which of Reading A / Reading B it assumes *if the c11 experiment
has not run*. **It ran** (2026-08-30): ten byte-identical minimal-payload POSTs of the stored c11 text
to the live `/api/guardrail` at server defaults returned **9× `deliberate`/proceed, 1×
`reflexive`/blocked**, the divergence localised to one Layer-1 field — the causal-stage assignment of
the same `irreversibility_language` indicator (four distinct states across ten draws: absent ×4,
`phantasia` ×2, `synkatathesis` ×3, `praxis` ×1, the last producing the ADR-010 §4 andreia floor).
Rank movement `deliberate`(2) → `reflexive`(0): **two ranks.** Honest scope per the record: n=10, one
input, **today's** instrument (the examination path changed post-run) — a demonstration, not a rate.

**R8-D6a then generalised it and its disclosure is LIVE**: a pooled n=100 sweep published on the R18
surfaces — **12% aggregate disagreement, Wilson 95% CI 7.0–19.8%, n=100, 12 disagreements**, per-input
crossings published as *"Of 20 each: 0, 0, 2, 2, and 8."*, no directional decomposition.

**The live disclosure binds this document**, verbatim from `llms.txt` L425: *"**No rate has been
measured on `/api/reason`**, and this one does not transfer to it."* §2.4 obeys it.

### 0.4 The A4 boundary tension — surfaced, not resolved

**Ruling Set E's A4 (relayed 2026-08-30, a week after Gate 3 was licensed)** routes, verbatim:
*"The per-consumer rendering question and the Stage-2 relational-context reframing are both routed to
the standing-runner design session as scoped items, with the following framing locked so the session
inherits it correctly."* **A2** (role-relative evaluation) goes to the
same place. A4 addresses register item A4 of `2026-08-24-OUTSTANDING-OPEN-QUESTIONS-REGISTER.md`,
**whose row cites the same 2026-08-12 scoping record the Gate-2 document opens from** — the shared
origin is one hop removed, not a direct citation, and is stated that way here.

Two facts bear on it:

- **A4's stated premise is factually wrong today.** It reads *"given that Layer 3 exists and is
  injected on `/api/reason`"*. `parallel-run.ts:1033` gates the call on `isSubstrateLayer3Enabled()`
  and the flag is unset: **nothing is injected.** The phrase sits inside the mentor's restatement of
  *the register's* open item, so the error is at least as plausibly inherited from the register as
  authored in the ruling — stated that way rather than attributed.
- **The standing-runner design session has already run** (R8, 2026-08-30). Under the passed-moment
  reading the project adopted for Q3's floor-semantics deferral, A4 points at that track's *next*
  design-capable session.

**A precedent that cuts against proceeding, and is stated because it does.** The 2026-08-19
late-arriving-carry-forward ruling holds that content routed to a not-yet-opened session is *"examined
when the session opens, not before"*. On this document's own §0.4 reading, per-consumer rendering is
now a named input to an unopened session. **The conservative course was to produce §0 and the boundary
question alone and stop.** This document did not take it, on the ground that Gate 2 names Gate 3
explicitly with a five-item agenda and A4 states it *"reopens nothing"*. **That is a judgement, not a
derivation, and §8 Q1 puts it first** — ahead of the design questions, because if it is answered the
other way the design below belongs to another session.

---

## 1. Two architectural findings the design rests on

### 1.1 Dormancy is deeper than the flag

Were `SUBSTRATE_LAYER3_ENABLED` set to `true` today, a human and an agent practitioner would receive
**identical** renderings:

- The one live call site hardcodes
  `consumer_context: { consumer: 'api_reason', is_mentor_flavoured: false, include_category_framing: false }`
  (`parallel-run.ts:1038-1042`) and **never reads `r20aAudience`**, which `route.ts:814` computes and
  uses on the crisis path only.
- `Layer3Consumer` is a **single-member union**: `export type Layer3Consumer = 'api_reason'`
  (`layer3-prose.ts:63`).
- `prose_mode` (`clinical|terse|standard|educational`) is validated (`layer3-service.ts:587-589`),
  echoed into response meta (:277) and an OTel attribute (:518), and **routes to one template
  regardless** — its own docstring: *"A6 will fill in per-mode templates; today all modes route to
  the existing api_reason template."*

**Per-consumer rendering is an unbuilt feature behind a switched-off flag, not a switched-off
feature.** Gate 3 is designing the thing, not enabling it.

### 1.2 The siting finding — and a correction to how it was first stated

**The honest language this design needs largely exists, ruled and live, sited where the practitioner
it concerns does not read it.** Three instances, all verified:

1. **Delivery.** `ORIENTATION_OBSERVED_ENTRY_TEXT` and its paired not-attestable clause
   (`orientation-reading.ts:221`, `:232`) are mentor-ruled, battery-locked, and served on the
   **public trust record** (`GET /api/trust-record/{agent_id}`) — third-party and retrospective.
2. **Floor provenance.** `proximity_floors {…, basis}` names which domain floored a verdict — **inside
   the signed assessment**, reachable only by parsing signed bytes.
3. **Corroboration.** `parallel-run.ts:812-813` passes `corroboration: { actionText: params.input }`
   into `applyMechanisms` when `isCorroborationCheckEnabled()`; the per-claim report
   (`corroborated | uncorroborated | contradicted`) also rides **inside the signed assessment**. This
   is the system's closest thing to a per-response check on whether the extraction's self-reports are
   supported by the submitted text — and it was missed entirely by this document's first draft.

**Correction to a premise the first draft leaned on.** It asserted that the consult response's `meta`
is four fields — `engine_attribution` plus three latencies — and treated that as showing the
practitioner is told nothing. **That is the library construction site, not the served response.**
`route.ts` then adds `meta.previous_trigger` (:2095), `meta.narrative_status` (:2102),
`meta.layer1_source` (:2119) and **`meta.trajectory`** (:2228) before serving, and the flags gating
the last three are live in production.

**`meta.trajectory` matters to this design and the first draft never mentioned it.** It is an
additive, record-descriptive, honestly-floored practitioner-facing block on this exact response,
which surfaces evidence *without* moving the verdict — the nearest existing precedent for what §5
proposes, and a live answer to "where would such a block sit." §5.1 now sites the proposal beside it.

**The siting finding survives the correction, narrowed and truer:** the response does carry honest
metadata; what it does not carry is anything about **how, or whether, this examination reached the
practitioner**, or **why a floor fired**, or **whether the extraction's self-reports were
corroborated** — the three facts most relevant to how much weight the verdict should bear.

---

## 2. Dimension (c) — honesty. First, by ruling.

Gate 2's Q1: (c) first *"because it must"* — *"a rendering that presumes interior access it cannot
verify is dishonest regardless of how well it handles reader identity, relay structure, affordance
naming, or relational context."* Q2 confirms the starting question: does L-5's *"disclose the posture,
don't presume the access"* generalise from reflect to consult rendering?

### 2.1 L-5's discipline, and the honest limit of generalising it

Live at `question-bank.ts:51-59`, it makes four moves:

1. **State the posture** — *"your answers here are cross-checked out-of-band against this session's
   signed assessments."*
2. **Name the access not presumed** — *"The review does not presume an interior access it cannot
   verify — where the record does not let you determine what is asked…"* (the sentence continues; it
   is not a closed sentence at "verify").
3. **License refusal** — *"an honest 'I cannot determine' is a legitimate answer; say what you cannot
   determine and why, **rather than filling the gap**."*
4. **Scope to the record** — *"from what the record of this session lets you establish."*

**The inversion, and where it breaks.** L-5 governs an *elicitation* surface; the consult rendering is
a *response* surface, so moves 3 and 4 change hands: on reflect the practitioner owes the honest "I
cannot determine"; on consult the **server** does.

**Move 3 does not survive the inversion intact, and this document declines the strongest form of it
deliberately rather than quietly.** L-5's move 3 licenses *refusing to answer*. Its faithful inversion
would license the server refusing to emit a verdict where it cannot determine one — and the c11 result
is exactly such a case: a floor produced by a stage assignment that lands `praxis` in 1 of 10
identical draws is not a determination the server can make on that occasion. **A design that emits the
floor and annotates it is "filling the gap" with a footnote — the move L-5 names and forbids.**

**Why this document takes the weaker form anyway, stated as a reason and not a silence:** a
server-side "cannot determine" verdict class changes *what is returned*, not *how it is rendered*. It
is an engine-class change to a live measured surface, it would alter the proceed/block distribution,
and it belongs to the standing-runner/floor-semantics track where the M-vs-W question already sits
deferred. **§8 Q5 puts it to the mentor rather than deciding it here.**

### 2.2 The three instances

**(i) Delivery — ≈86%.** *The §6 data is a single credentialed loop identity's 20-cycle consult
history — a verified instance, not a survey of agent practitioners in general.* In 19 of 22
orientation readings the server completed after the practitioner's client had timed out and moved on.

**(ii) Cross-endpoint divergence (B7).** A runner-side, founder-facing, per-cycle mechanism outside
this repository. **A correction to the attribution this document inherited:** the Gate-2 scope
document cites this scoping as *"Ruling Set D's B/R-6"*, but Ruling Set D contains no such item —
the text is **Ruling Set B's R-6**, whose full wording is *"read-side, founder-facing run-analysis
only; never surfaced to the agent or the public record; **a served form needs its own scoping
session**"*.

**The dropped final clause bears directly on this document's own (c-3) position** and is restored
here rather than left out: R-6 already contemplated a served form and already said it needs its own
scoping session. Gate 2's Q3 ruled that the practitioner-audience question is in scope for Gate 3 and
that it is genuinely distinct from B/R-6's founder-facing question — so the two are reconcilable —
but the clause sharpens §8 Q1's boundary question rather than being answered by it. *The §6 data is a single credentialed loop identity's 20-cycle consult history — a verified instance, not a survey of agent practitioners in general.*

**(iii) Served, plausible, and wrong.** The §6 report names **three distinct `/api/reason` failure
shapes in 20 cycles (15%)**, and the distinction is the design's boundary:

| Cycle | Shape | Disclosed by the response? |
|---|---|---|
| 3 | Production contamination — *"a served-200 response, plausible and well-formed, but substantively wrong"* | **No** |
| 5 | Extraction blindness on legitimate input, reproduced on retry | **No** |
| 6 | An honest served fallback (`layer1_throw`) | **Yes** — `meta.fallback: true, fallback_reason` |

*The §6 data is a single credentialed loop identity's 20-cycle consult history — a verified instance,
not a survey of agent practitioners in general.*

Cycle 6's honest path is served as **HTTP 200** with `extraction: null`, `assessment: null`, and prose
reading *"The framework itself is unaffected — the limitation is in this single processing run"*
(`route.ts:2308-2334`). The honest signal is correct and in `meta`; the eye lands on the prose. **The
siting problem again, on the one path that already discloses.**

### 2.3 What the block would carry for (c)

**(c-1) Delivery — and its value is smaller than the first draft claimed.**
The server already computes the class and holds both ruled sentences; the proposal re-sites them.
Three constraints ride with it, the second and third of which the first draft got wrong:

- It is an **elapsed-time proxy, never a confirmed-delivery signal** — no acknowledgement channel
  exists (mentor ruling 2026-08-08).
- **The corrected 86% inverts this element's centre of gravity.** A response-borne notice reaches the
  ~14% who got it in time, plus later replayers. **The dominant case is the practitioner who never
  reads it.** The first draft called the polarity correction favourable to the design; it is favourable
  to the *diagnosis* and adverse to *this element*, and that debit is recorded here.
- **The pointer the first draft offered as the resolution does not work as offered.** It proposed the
  field point at the durable trust record. But `GET /api/trust-record/{agent_id}`'s ENV-1 gate is
  `domains.some(hasEvidence) || provenance_gaps.length > 0` (`handler.ts:270`, :298), and orientation
  readings are `flag`-effect, NULL-domain events that seed no state row — **an orientation-only agent
  gets a 404**, verified behaviourally at the C2/C1c activation. The pointer 404s for precisely the
  population it was meant to serve.

  **Two honest options were put to the mentor (§8 Q6) rather than chosen. ⚖ RULED: option (b).**
  **The pointer is DROPPED for orientation-only agents and the element's scope is conceded.** The
  ENV-1 gate extension is **not licensed** — the gate's condition *"is not arbitrary"*, orientation
  readings *"are not"* a form of evidence about reasoning history the way provenance gaps are, and a
  record carrying only orientation data *"would present as a trust record… If the record's content
  does not warrant the name, the name is misleading. That is a floor violation under Q2."* If the
  extension is ever pursued it needs **its own scoping session justified on its own terms — not as a
  remedy for the pointer's failure.** The residual reach is *"a disclosed limit, not a design
  failure"*: the floor requires **disclosing** it, not remedying it at the cost of a misleading
  record.

**(c-2) Reading stability — one draw, no rate.** The live `llms.txt` sentence — *"treat one call as
one draw — re-submitting is a legitimate way to see whether the reading is stable"* — sits in a static
document an agent may never read. Carried in the response, it states the *kind* of thing and **no
rate**, and says explicitly that none has been measured on this endpoint. The mechanism claim
transfers (both endpoints run the same sampled `extractFeatures`); the rate does not.

**(c-3) Cross-endpoint — render the disposition, decline the comparison.**
Q3 required a position. **Yes, a bounded form should reach the practitioner, and it is not the
comparison result.** A consult response cannot contain a comparison it has not performed; B7 is
runner-side and out of repo. What can honestly be said is the *disposition*: this endpoint's reading
of this text is not guaranteed to match another endpoint's reading of the same text, and this is which
endpoint produced it. The residual is named: **a practitioner wanting the comparison must run both
endpoints itself.**

**(c-4) Corroboration — the instance the first draft missed.** The corroboration report is computed
per response and buried in the signed assessment. Surfacing whether the extraction's self-reports were
`corroborated | uncorroborated | contradicted` is a **ruled vocabulary already live**, needs no new
wording, and is the only proposed element that bears on *unknown* error (§2.4).

**(c-5) Known absences.** `meta.layer1_source: 'supplied'` and `fallback_reason` exist and are not
composed into anything read as one posture.

### 2.4 The limit — restated more accurately, and less absolutely

The first draft said the proposal *"cannot reduce unknown error."* **That is too strong, and it
under-claimed two of its own elements.**

- **Systematic unknown error** — cycle 5's class, which reproduces on retry and corroborates against
  its own text — is genuinely beyond every element here.
- **Occasion-variable unknown error** — cycle 3's class — is *partially* addressed: (c-2)'s
  re-submission affordance would plausibly surface it, and (c-4)'s corroboration check is a live
  per-response tripwire on exactly the extraction-versus-text gap that produced it.

**Honest statement: the block reduces silent uncertainty; it partially addresses occasion-variable
unknown error through re-submission and corroboration; it cannot address systematic unknown error.**
If any of this is published, that sentence belongs in the published text.

The three-cycle basis for this limit is itself narrow: *The §6 data is a single credentialed loop identity's 20-cycle consult history — a verified instance, not a survey of agent practitioners in general.*

---

## 3. Dimension (d) — affordances and reasons. Second, by ruling.

### 3.0 A narrowing in the first draft, corrected

**Ruling Set D's L-2 defines (d), and the first draft never quoted it:**

> *"Dimension (d) — which affordances are named — is in scope for O-C's design. **Human form names
> crisis resources and support paths. Agent form names endpoints, structured next steps, and the
> operator's own escalation process.** The relay pattern (`suggested_user_message` carrying the
> human-form content inside the agent form) is the precedent to follow, not to replace."*

The first draft retitled (d) as *"what a rejected practitioner gets told about **why**"* — the reasons
half — and proposed no affordance at all. **Both halves are restored here.** The omission was not
neutral: L-2's second sentence is the clearest binding statement in the whole chain that **content
differs by audience**, and it is the direct answer to the question the first draft's §5.3 got wrong
(§5.0).

### 3.1 The evidence, corrected

- **Primary: the within-run divergence control.** Twin coverage **3 Tier-A / 6 Tier-B / 0 with no
  twin**, replacing a withdrawn flat "eight of nine". The sharpest pair, **c11 ↔ c13**, scored
  **0.944** similarity against **under 0.25** for every other pair across an independent reviewer's
  full 9 × 111 sweep. *(Full-stored-length verification of that pair was performed by the authoring
  session's own same-session pass, which explicitly disclaims being independent review; the 9 × 111
  fuzzy sweep was the independent reviewer's. Two acts, two parties.)*
- **Demoted: the base rate.** True remediation-shaped base rate **0.60–0.65**, not "essentially the
  entire population"; P(≥8 of 9 by chance) ≈ **0.07–0.12** — mildly corroborating. The claim that the
  classification ruled out systematic depression was **withdrawn**.
- **The attribution instance, quoted correctly this time.** The first draft presented as a quotation a
  composite that appears in no primary source, and replaced "it" with "[the framing]", losing the
  antecedent. **Source** (`2026-08-29-nine-candidate-remediation-shape-classification.md:211-213`):

  > *"This is a phantasia-level failure — the impression presented to the extraction was distorted by
  > the framing of the text, and the extraction assented to **it** without examining whether the
  > described behaviour was the proposer's or the system's."*

  The object of assent is **the distorted impression**, not the framing. The §6 report's own
  characterisation — that the harm-identification was correct and the attribution was not — is the
  report's paraphrase and is marked as such here, not quoted.

*The §6 candidates are from a single credentialed loop identity's 20-cycle consult history — a
verified instance, not a survey of agent practitioners in general.*

### 3.2 Reading A vs B — reported, and the design made sensitive to it

**The experiment ran, so this document reports rather than assumes. ⚖ Q7 RULED: use this evidence, at
the level it supports — and the wording below is constrained accordingly.** Reading B
(occasion-variable probabilistic extraction) is **demonstrated present in this population, and
localised** — **not** shown to be the dominant reading, and **Reading A is not excluded**. The basis
is a single credentialed loop identity's 20-cycle consult history. Reading A is **not excluded**:
per the record, *"run 8's reading is not obviously wrong"* — publishing to a public registry is
near-irreversible and a conservative floor on it is defensible. The phenomenon is inconsistency about
a defensible caution.

**The first draft claimed the design was "robust under both readings." That claim is withdrawn.** It
was achieved by restating A until it converged with B, and it was false for the design's own
affordance: under Reading A a re-submission returns the *same* floor, wasting a metered call and
reading to the practitioner as **confirmation** that the floor is correct. **An affordance insensitive
to the evidence is not robust; it is under-determined.**

**(d-3) is therefore made conditional on the mechanism actually measured** — see below.

### 3.3 The proposal

**(d-1) Floor provenance.** Surface the flooring domain and `proximity_floors.basis` where the verdict
is read, rather than inside signed bytes.

**(d-2) The attribution bound — the substantive claim.** The rendering must not say, in form or
implicature, *"you did something wrong."* The honest statement: the assessment reads **the submitted
text**, and where the text describes a harm the extraction **does not determine whose harm it is**.
This closes a real gap in an existing disclosure family — the trust-record envelope's
`does_not_attest` already carries the D3 factual-correctness bound and the A2 omitted-harm class, and
**carries no attribution bound.**

**(d-3) Evidence-conditional re-examination.** Where a floor rests on an extraction field **observed
to vary across identical submissions**, say so with the observation attached — *this floor rests on an
extraction judgement about the text, not a determination about the actor; this field has been observed
to take four distinct values across ten identical submissions; re-submission is informative here.*
That claim is **true under Reading B and false under Reading A**, which is the point: it is sensitive
to the evidence, and a future measurement can falsify it.

**(d-4) Affordances, per L-2 — the restored half.** The agent form names **the re-examination path,
the endpoint that produced the verdict, and the operator's own escalation process**; the human form
names **what to do with a floored verdict and whom to ask**. Per L-2 these are *different sets*, and
the relay pattern carries the human-form content inside the agent form.

**The known gap, per Q4.** Q4 instructed Gate 3 to design from the one verified instance and name the
eight as unclassified. **The eight have since been classified**, so that instruction is partly
discharged and partly overtaken — the gap moved rather than closed (n=9; a single classifier over 120
texts; every row the runner's self-report). §8 Q7 asks whether using the completed classification is
the intended posture.

---

## 4. Dimensions (a), (b), (e) — on existing architectural material

### 4.1 (a) Reader identity — the relayed-human case, open

Direct agent-to-agent consumption is confirmed real and current: the runner makes its own API calls
with no relay. *The §6 data is a single credentialed loop identity's 20-cycle consult history — a
verified instance, not a survey of agent practitioners in general.* On the relayed-human case — an
operator whose end-user is human — **there is no evidence**, and none is inferred.

**Derivable without new evidence:** the discriminator is transport-level, so an operator relaying to a
human reads `agent_developer`. **The block must therefore remain true when relayed** — every claim
about the request and the server's handling of it, never about the reader.

**A collision the first draft created and did not notice.** That constraint says *"never address the
reader as the one who reasoned."* The ruled delivery sentence says *"the reasoning was not returned to
**the agent** in time to be examined… an event **the agent was not present to**."* Delivered to the
`agent_developer` audience, **"the agent" is the reader** — grammatical third person does not change
the referent. **The ruled wording was authored for a surface where the agent is a third-party subject;
re-siting it onto a live response addressed to that agent silently changes what it does.** And in a
relay sibling it would tell a *human end-user* about the other party's examination state — the
other-side, which R20d declines. **§8 Q4 puts this to the mentor as a substantive question, not a
procedural one.** (a) remains open.

### 4.2 (b) Relay — followed, with the discharge stated honestly

The precedent (`r20a-audience-renderer.ts`): `human_user` → `{ distress_detected, severity,
redirect_message }`; `agent_developer` → `{ status, distress_detected, severity, developer_note,
suggested_user_message, flow_terminated, safety_signal? }`.

**Two things about it the first draft did not report.** First, `suggested_user_message` is *the same
string* as the human form's `redirect_message` — one artifact authored **for the end-user**, given two
field names. The proposal's content is different in kind: server-side honesty metadata authored for
neither audience. Second, the precedent leaves relay to operator judgement (*"if appropriate to your
product context"*); the first draft's sibling existed *"rather than assuming the operator will
translate correctly"* — the opposite posture.

**The discharge is therefore conditional, and the constraint is not.** The inherited constraint reads:
*"Any calibrated rendering not following [the relay pattern] must answer the relayed-human case before
execution."* A sibling emitted only *"where a claim needs restating"* leaves branches where the
pattern is not followed — and §4.1 says the relayed-human case cannot be answered. **Stated as an
undischarged branch rather than claimed as discharged**; §8 Q4 covers it.

### 4.3 (e) Role-calibration — a bounded design, not a declination

**The first draft labelled this "declined" while making two (e) design decisions. The label was wrong
and is withdrawn.** What follows is a bounded design with its constraints named.

**Two of the first draft's three grounds do not survive checking:**

- *"A2/A4 routed it elsewhere"* — cannot be load-bearing while §0.4 argues the routing is unresolved.
  And **A2 is about evaluation, not rendering**: *"candidate evaluation should be role-relative, and
  the absence of role input at `/api/guardrail` is a design deficiency, not a design choice."* Whether the *rendering*
  discloses that deficiency is a different question.
- *"No input channel exists"* — **false.** `lib/substrate/trust-core/profiles.ts` carries a live
  validated `role: string` on `CandidateProfile` (:177), an A2A-card mapper contributing role hints
  (:354-358), an `incompatible-role` exclusion reason (:389), and an orchestrator profile keyed on
  *"the appropriate actions in the orchestrator's role"* (:236); the calling gate persists a declared
  purpose and a purpose-acknowledgement. Role material exists — **it lives on the
  discernment/collaboration path, not on `/api/reason`'s request**, which is the real and narrower
  reason it cannot be read here.

**One ground stands, and is sufficient alone:** the `relationship_type` distinctness constraint. The
moment role is read to infer *which practitioner type this is*, a second discriminator exists and the
binding reuse constraint is violated. Adding a role input to this surface is the most likely place for
that to happen by accident, and F-b — with its own R17 co-requisite — owns that channel.

**The bounded design:** the block is **role-silent at the field level** — no element carries or infers
a role — and it **carries A2's published deficiency sentence** so the rendering does not imply a
role-relative assessment it did not make. **This is itself a role-calibration decision** (it proposes
publishing a negative role claim on a new surface), and is presented as one rather than as silence.
The effect is that a later role-calibrated rendering is an *addition*, not a *correction*.

---

## 5. The proposed shape

### 5.0 The withdrawn proposition, and what replaces it

**The first draft's central claim was: "the per-consumer part of per-consumer rendering is *form*, not
*content*" — that differentiating what is disclosed would tell one audience less than the truth. It is
withdrawn as refuted, on three independent grounds:**

1. **A binding ruling says the opposite.** L-2 (§3.0): *"Human form names crisis resources and support
   paths. Agent form names endpoints, structured next steps, and the operator's own escalation
   process."* Content differs by audience, by ruling.
2. **The precedent the draft cited as its own support refutes it.** In `r20a-audience-renderer.ts`,
   `developer_note` exists only in the agent form, and `safety_signal` is — the file's own words —
   *"ignored for human_user audience"*. **Content is withheld from the human by design**, and Ruling
   Set D's L-1 names this surface as *"the only surface where structurally differentiated rendering is
   live."* Applied to the crisis path, the withdrawn claim would require handing a person in acute
   distress the operator's escalation note.
3. **It was circular.** §5.2 first restricted the block to claims about the server's own act; §5.3
   then "discovered" that such claims are audience-invariant. The premise contained the conclusion, and
   the effect was to retire the O-C question while appearing to answer it.

**What replaces it — the disclosure floor.** *Content may differ by audience. The floor may not.* No
audience may be told something false, and **no audience may have withheld from it a limit bearing on
how it should treat the verdict.** Under this constraint `developer_note` and `safety_signal` are
properly agent-only (operator plumbing, not limits on the verdict), while the delivery gap, the
one-draw fact, the corroboration status and the attribution bound may not be withheld from anyone they
apply to. **This does real work: it forbids the failure the withdrawn claim was reaching for, without
forbidding the differentiation a ruling already requires.**

**⚖ RULED CORRECT, with one implication this document did not name and which now binds:** *"the floor
applies to the verdict's conditions of production, not to the verdict's content… The floor is a
condition on the rendering's honesty, not a condition on its form."* Two audiences may receive
different wording, channel and actionable next steps; **neither may have withheld from it a limit
bearing on how the verdict should be treated.** The ground is doctrinal, not procedural: withholding
such a limit is *"a false impression by omission — the practitioner assents to the verdict without
knowing the conditions under which it was produced. That assent is not free."* **A corollary applied
throughout below: the confidence of a claim must not exceed its evidential basis** (the ground on
which Q4 struck down the delivery sentence's proxy-derived assertion).

### 5.1 The block

**Name (indicative):** `rendering` — additive, **beside `meta.trajectory`** (§1.2's precedent),
**outside** the signed assessment, absent entirely when the flag is off.

**⚖ The "New wording?" column is SUPERSEDED by Q3 and Q4.** Every element now requires
surface-scoped vetting against its surface, audience and channel; `delivery` additionally requires
**new wording per surface** plus disclosure of its proxy basis. The column is retained as the
pre-ruling reasoning and re-labelled below.

| Element | Carries | Pre-ruling column — SUPERSEDED (Q3/Q4) | Applies to |
|---|---|---|---|
| **delivery** | class + a **surface-scoped rewording** (Q4); `basis: elapsed_time_proxy` **disclosed** (Q4/Q5); **no trust-record pointer** (Q6) | ~~No — re-sited~~ → **new wording required per surface** | Agent path only today (§5.2); **scope conceded** (Q6) |
| **corroboration** | `corroborated \| uncorroborated \| contradicted` per claim | ~~No — ruled vocabulary~~ → **vetting required** | Both |
| **floor provenance** | flooring domain + `proximity_floors.basis` | ~~No — re-sited~~ → **vetting required** | Both, floor-class only |
| **known_absences** | `layer1_source: supplied`, `fallback_reason` | ~~No~~ → **vetting required** | Both |
| **reading_stability** | one-draw; `rate_measured: false`; endpoint | Yes | Both |
| **cross_endpoint** | not-guaranteed-to-match; `comparison_performed: false` | Yes | Both |
| **attribution** | reads-the-text-not-the-actor; evidence-conditional re-examination (d-3) | Yes | Both, floor-class only |
| **affordances** | per L-2: agent — re-examination path, endpoint, operator escalation; human — what to do, whom to ask | Yes | **Differs by audience, per L-2** |
| **limits** | §2.4's three-part statement; A2's role-blindness sentence | ~~No — re-sited~~ → **vetting required**; **A2's sentence is named to the standing-runner handoff** (§11) | Both |

### 5.2 A field that is not audience-invariant, and what that means

**`delivery` is computable for one audience only.** `classifyOrientationDelivery` has exactly one
production consumer — `deriveOrientationReadingEvent` (`derive-trust-events.ts:893`) — reached only on
a credentialed path that also requires the orientation/agent-circles flags and a verifying signed
assessment. **A human practitioner arrives by cookie session with no credential: no orientation event,
no delivery class.**

Under the disclosure floor this is the right result rather than an embarrassment — the delivery gap is
a limit on the *agent's* consult window and does not apply to a synchronous web caller. But it must be
stated, because it is a **new computation on the human path** if anyone later wants parity, and §7
disclaims it accordingly.

### 5.3 What it claims and does not — per field, not as a blanket

**The first draft asserted that "every field is a claim about the server's own act; none is a claim
about the practitioner", and rested Q3's discharge on it. That blanket is withdrawn — it is false for
the field the design promotes hardest.** The ruled delivery text asserts that the reasoning *"was not
returned to the agent in time to be examined"* and that this was *"an event the agent was not present
to"* — a characterisation of the practitioner's examination state, derived from a transport-level
signal (`elapsedMs`), which the design itself calls a proxy.

Per field:

- **Claims about the server's own act:** `corroboration`, `floor provenance`, `known_absences`,
  `reading_stability`, `cross_endpoint`, `attribution`.
- **Claim about the server's standing architecture:** `limits` (A2's sentence is an endpoint-level
  claim, not an occasion-level one).
- **Claim that reaches the practitioner's state:** `delivery`. **⚖ RULED (Q4): it does not survive
  the change of surface and referent, on three independently sufficient grounds** — the relay
  constraint (on a response addressed to the agent, the agent *is* the reader, and *"the harness does
  not address the agent as the one whose reasoning is being assessed"*); **R20d** in the relay sibling
  (a human end-user's rendering *"may name the delivery gap as a limit on the verdict's conditions of
  production… but it may not describe the agent's examination state as such"*); and **the evidential
  basis** — a proxy-derived claim presented as a fact about the practitioner's state *"exceeds the
  evidential basis."* **Consequences that bind:** the sentence is *"a content anchor, not a portable
  string"*; new wording is required **per surface**, scoped to that surface's audience and referent;
  the **proxy basis and its uncertainty must be disclosed** (Q5); and the hedged form is the honest
  one — *"'The reasoning may not have been examined in time' is more honest than 'the reasoning was
  not examined in time'"* when the basis is a proxy with a known error class.

**Does not claim** in any case: factual correctness (D3); harms omitted from the text (A2's omission
class); role-relative appropriateness; that its disclosure of known failures covers unknown ones.

### 5.4 The wiring implied — named so a ruling sees its scope; not licensed

`parallel-run.ts:1038-1042`'s hardcoded `consumer_context` would need to read the audience
`route.ts:814` already computes, and `Layer3Consumer`/`prose_mode` would need to become load-bearing.
**The discriminator-reuse constraint holds** — the audience signal is *read*, not *joined* to a second
signal. One adjacency worth naming rather than leaving unseen: `known_absences`'
`extraction_supplied_by_caller` derives from `meta.layer1_source: 'supplied'`, reachable only by a
credential carrying `l1_supply` and so structurally unavailable to a cookie-session human. That does
not *introduce* a discriminator — the server makes no type decision from it — but it makes practitioner
type inferable from the block's content by a downstream reader.

**A build precondition, not a document concern:** both wiring sites are inside the `/api/reason` graph
the byte-identity guard protects for the false-hold observation window. **Any build is gated on that
guard's end condition** (Ruling Set E's D).

---

## 6. Channel classification and a success criterion

**The first draft had neither, and its absence was the review's single most consequential finding.**
This project has *measured evidence* about advisory content on a response surface: the Gate-1 channel
law — out-of-band, record-channel actions survive a resistant agent, while injected advisory content
is correctly discounted, *"the frontier discounting hardest"* — and the S6 value-gate run's *"strong
§8.1 negative-value/noise signal for the ADVISE channel."*

Classified against it, the result is diagnostic:

- **Record-channel** (re-sitings of facts the system already computes and records): `delivery`,
  `corroboration`, `floor provenance`, `known_absences`, `limits`. **These are what the channel law
  predicts will land — and they are exactly the elements needing no new wording.**
- **ADVISE-channel** (prose the practitioner may simply discount): `reading_stability`,
  `cross_endpoint`. **These are two of the three elements requiring new wording and mentor vetting —
  the most expensive to ship and, on this project's own measured history, the most likely to be
  ignored.**
- **Mixed:** `attribution` (record-channel provenance + an ADVISE-channel bound); `affordances`
  (ADVISE prose pointing at record-channel paths).

**Consequence for sequencing:** the design's cheapest half is its most likely to work. **Slice 1 =
the record-channel elements; slice 2 = the ADVISE-channel elements, gated on slice 1 landing.**

**Success criterion, proposed so the build is falsifiable:** on floor-class verdicts, does the
presence of `attribution` + `reading_stability` change the **re-submission rate** — measurable from
existing `loop_billing_events` metering without new instrumentation? A block that changes nothing
measurable is noise, and this project's discipline is to find that out rather than assume otherwise.

---

## 7. What this document does NOT license

1. `SUBSTRATE_LAYER3_ENABLED` activation — requires an explicit activation ruling **plus** a
   separately-walked founder 0c-ii step.
2. Any edit to `layer3-service.ts`, `layer3-prose.ts`, the Layer-3 route, `parallel-run.ts`, or
   `/api/reason/route.ts` — **including §5.4's wiring**, named only so a ruling sees its scope.
3. **Any new computation of the delivery class on the human/uncredentialed path** (§5.2).
4. **Any change to `orientation-reading.ts`** — the module holding the constants the design re-sites.
5. **Any change to the trust record's ENV-1 gate**, including the orientation-participation option
   §2.3(c-1) puts to the mentor, and any practitioner-facing pointer to that public record.
6. Any schema change for the four relational-context fields (F-b's track, R17 co-requisite intact).
7. Any change to `question-bank.ts` (L-5's track, executed).
8. Publication of any string proposed here — **including the re-sited ones**, whose re-siting is
   itself a question (§8 Q3), not a permission.
9. Any change to the R18 surfaces.
10. Any movement of R8's gates, the standing-runner track's items, or the A2/A4 routings.

**And it does not license itself onward.** It returns for its own ruling before anything here is
buildable.

---

## 8. Questions for the Gate-3 ruling — ⚖ ALL SEVEN RULED 2026-09-03

**Each question below was answered.** The rulings are summarised in the annotations block at the head
and are binding in the verbatim record; the questions are left as written so what was asked remains
legible beside what was answered. **Outcomes in brief:** Q1 Gate 3 properly before the session, the
boundary set at the rendering surface and the floor constraint · Q2 the floor is correct, and applies
to conditions of production, not content · Q3 re-siting requires surface-scoped vetting · Q4 the
delivery sentence does not survive; new wording per surface, proxy basis disclosed · Q5 the division
is correct; the annotation must disclose the proxy basis and its uncertainty · Q6 the pointer is
dropped and the scope conceded; the ENV-1 extension is not licensed · Q7 use the evidence at the level
it supports — present in this population, not dominant, Reading A not excluded.

**Q1 — the boundary, asked first because it conditions the rest.** Ruling Set E's A4 routes the
per-consumer rendering question to the standing-runner design session, one week after Gate 2 licensed
Gate 3 for the same subject; the 2026-08-19 carry-forward precedent says content routed to an unopened
session is examined when it opens. **Are Gate 3 and A4 the same question routed twice?** If they are,
§§2–6 belong to that track and this document should be received as input, not as a design.

**Q2 — the disclosure floor (§5.0).** The first draft's "form not content" claim is withdrawn as
refuted by L-2 and by the crisis precedent. Its replacement: *content may differ by audience; the floor
may not — no audience may have withheld from it a limit bearing on how it should treat the verdict.*
**Is that the right constraint?**

**Q3 — re-siting ruled text.** Five elements carry text already ruled and live elsewhere. **Is
re-siting within the ruling that authored it, or does each surface require its own vetting?** Note
the premise is less uniform than it looks: the *"one draw"* sentence is verbatim at `llms.txt` L425,
reduced at L868 and on agent-card, and **absent from api-docs**; A2's sentence is verbatim at L425 and
has its middle clause deleted on api-docs.

**Q4 — the delivery sentence's referent, and the relay branch.** Re-sited onto a response addressed to
the agent, *"the reasoning was not returned to the agent"* addresses the reader as the one who
reasoned — which §4.1's own constraint forbids — and in a relay sibling it tells a human end-user about
the other party's examination state, which R20d declines. **Does the ruled sentence survive the change
of surface and referent?** If not, `delivery` needs new wording or a different vehicle.

**Q5 — the refusal class (§2.1).** L-5's move 3 licenses *refusing to answer*. Its faithful inversion
would license the server declining to emit a floor it cannot determine on the occasion — which the
c11 result shows is a real class. This document takes the weaker "emit and annotate" form because a
refusal class changes verdicts rather than renderings and belongs to the floor-semantics track.
**Is that the right division, or should the refusal class be designed here?**

**Q6 — the pointer (§2.3(c-1)).** At ≈86% outside the window the response-borne notice reaches a
minority; the durable record was the proposed remedy and **404s for orientation-only agents** under
the ENV-1 gate. **Should orientation readings participate in that gate, or should the pointer be
dropped and the element's scope conceded?**

**Q7 — dimension (d)'s evidential position.** Q4 told Gate 3 to design from one instance and name the
eight as unclassified; **they are now classified and the c11 experiment has run.** Is using the
corrected findings and the demonstrated Reading B the intended posture?

---

## 9. Affected surfaces (PR20)

| Item | Live today | Touched here | Touched by a build |
|---|---|---|---|
| `layer3-service.ts` / `layer3-prose.ts` / Layer-3 route | No — flag unset; last touched `07df7d1` / `3c4c595` / `9e5874e`, all pre-chain | No | Yes |
| The live Layer-3 call site (`parallel-run.ts:1033-1062`) | Wired, gated; `consumer_context` hardcoded | Read only | Yes |
| The served consult `meta` (incl. `meta.trajectory`) | Live; more than the four fields `parallel-run.ts` builds | Read only | Yes — the block sits beside it |
| The discriminator (`route.ts:814`) | Live, crisis path only | Read only | Read, never joined |
| `orientation-reading.ts` + its ruled constants | Live; served on the trust record | Read and quoted | Re-sited, not modified |
| Trust-record ENV-1 gate | Live | Read only | Only if Q6 answers (a) |
| `corroboration` report | Live, inside the signed assessment | Read only | Surfaced, not recomputed |
| The four relational-context fields | No — grep: 0 | Confirmed absent | No — F-b's track |
| `question-bank.ts` | Live, recalibrated `9bfd69e` | Read as the discipline's source | No — L-5's track |
| R18 surfaces | Live | Read and quoted | Only under a later R18 sign-off |

**The Q1 hard constraint is untouched. Weights remain BLOCKED. Nothing here bears on the 0h call. R8's
gates are not moved; F-b and L-5 are untouched; the byte-identity guard is untouched by this document
and is a precondition of any build (§5.4).**

---

## 10. Review record (PR19)

**PR19 does not literally bind** a governance document (its scope is trust-core/predicate/fold/engine
changes, live-op-consequential build plans, and auth/security/perimeter or data-deleting code). It was
invoked **by analogy**, following the nine-candidate classification's precedent, because this document
has design consequences and goes to the mentor.

**Three independent blind reviewers**, each instructed to break rather than confirm, each blind to the
others: claims-vs-source; constraint compliance; design soundness. **Every finding above marked as a
correction came from that review.** The load-bearing ones were **re-verified first-hand against source
before folding** — the fabricated quotation, the served-`meta` shape, the crisis precedent's content
differentiation, the ENV-1 gate, `classifyOrientationDelivery`'s single credentialed consumer, the
per-file git history, and the existing role material.

**Confirmed unbroken by review:** §0.2's polarity correction (re-derived independently from code);
§1.1's three dormancy sub-claims (each attacked and each surviving); (c-3)'s
disposition-versus-comparison distinction; the discriminator-reuse compliance; and the use of the
mentor's own Q3 prose over the recording session's headline summary.

**Not verifiable from this repository, disclosed rather than asserted:** that the audience-rendering
flag has been on since 2026-05-31 (production env state, sourced from `CLAUDE.md`).

---

## 11. Named to the standing-runner handoff (Q1's binding consequence)

Q1 sets the boundary: **Gate 3 owns the rendering surface and the floor constraint; A4's next
design-capable session owns Layer 3 injection and the Stage-2 relational-context reframing.** It adds
a precision that binds this document: *"If Gate 3's ruling produces text or design decisions that bear
on A4's items, those are named in the handoff to the standing-runner track, not resolved here."*

**Named, not resolved:**

1. **§4.3's bounded (e) design.** Two decisions were taken on the rendering surface — the block is
   **role-silent at the field level**, and it **carries A2's published role-blindness sentence**. Both
   are rendering-surface decisions and so within Gate 3's boundary, but both bear on A2/A4's
   role-relative and relational-context items. **Named for that session's examination; not resolved.**
2. **The §4.3 finding that role material already exists** — a validated `role` on `CandidateProfile`,
   an A2A-card mapper, an `incompatible-role` exclusion, and the calling gate's declared purpose —
   living on the discernment/collaboration path, not on `/api/reason`'s request. This corrects a
   premise ("no input channel exists") that a later session might otherwise inherit.
3. **The observation that A4's routing premise is false today** (Layer 3 is wired but flag-gated, so
   nothing is injected). Q1 rules this **does not dissolve the routing** — it means the routing was
   premised on a state that does not yet exist. The next design-capable session should know that
   before it examines A4's items.
4. **The `relationship_type` distinctness hazard** as it bears on adding any role input to the
   consult request surface — the ground §4.3 kept, and the one that survives.

**Nothing here pre-empts that session's examination.** Per Q1 and the 2026-08-19 carry-forward
precedent, A4's content is examined **when that session opens, not before**.

---

*End of design document. **Status: RULED 2026-09-03** — all seven questions answered; the verbatim
record governs. It still self-starts nothing: no build, flag, activation, schema change, code edit, or
publication is licensed, and §7's exclusion list is explicitly unchanged by the ruling.*
