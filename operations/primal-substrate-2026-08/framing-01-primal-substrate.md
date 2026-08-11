# Framing 1 — The primal substrate is examination material, not an enemy

**Audience:** a build session opening the ATRF scoping session, generation-step refinements, or S7's
practice activities. Read once at session open. Short by design — a framing document long enough to
skim is one that gets skimmed.

**Status:** documents only. Ruled 2026-08-11
(`operations/primal-substrate-2026-08/2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`, A1/C1,
D1). Internal only in v1 (C19) — see §4.

---

## 1. The reframe

The mentor, verbatim (`2026-08-11-mentor-synthesis-primal-substrate-verbatim.md`, Heading 1):

> The eleven traits in the research **are not enemies of examined assent — they are its raw material.**
> The Stoic framework does not ask rational agents to eliminate competitive drive, status-seeking, or
> resource acquisition impulse. It asks them to examine those impulses before acting on them. **The
> examination is only possible if the impulse is present and visible.**

> SageReasoning **is not a virtue filter that blocks primal impulses from reaching action.** It is an
> examination infrastructure that **intercepts the impulse between impression and action** and asks:
> what false judgement is driving this? What is the correct judgement that would replace it?

Read this as a statement about what the project is *for*, not a proposal for a new mechanism — §2
shows the interception point and the examination it describes are already committed.

---

## 2. The corpus grounding — reuse this, do not re-derive it

**The interception point already has a name.** `synkatathesis` (Assent) is stage 2 of the committed
`CAUSAL_SEQUENCE` (`website/src/lib/stoic-brain.ts:584-589`):

| Stage | Description | Named failure mode |
| --- | --- | --- |
| `phantasia` / Impression | *"An impression presents itself to the ruling faculty."* | *"Distorted impression — seeing danger or good where there is none."* |
| `synkatathesis` / Assent | *"The ruling faculty assents to or withholds assent from the impression."* | *"Hasty assent — accepting a false impression as true."* |
| `horme` / Impulse | *"If assent is given, an impulse toward or away from something arises."* | *"Excessive impulse (pathos) — impulse that overshoots reason."* |
| `praxis` / Action | *"The external action resulting from the impulse."* | *"Action from passion — externally correct behaviour driven by wrong reasons."* |

The mentor's "between impression and action" is `synkatathesis`. **The reframe names existing
architecture; it does not propose new architecture.**

**The examination itself already exists**, step by step, as `DIAGNOSTIC_SEQUENCE`
(`website/src/lib/stoic-brain.ts:595-601`, sourced to `passions.json > diagnostic_use`):

1. Was the agent's impression of the situation distorted? If so, by which of the 4 root passions?
2. Did the agent assent to a false impression? Which false belief drove the assent?
3. Did the impulse exceed what reason warranted?
4. Which specific sub-species was operative?
5. What is the corresponding correct judgement that would replace the false one?

The mentor's two questions — *"what false judgement is driving this? What is the correct judgement
that would replace it?"* — are **steps 2 and 5** of this sequence, in substance. **`DIAGNOSTIC_SEQUENCE`
is adopted as the committed examination pathway. No parallel taxonomy is licensed** (ruled, A1/C1). A
build applying a different pathway needs to justify that election against this primitive, and there is
no visible reason it would.

**The false-judgement structure is already how the four root passions are defined**, not as feelings —
`ROOT_PASSIONS` (`website/src/lib/stoic-brain.ts:311-366`): `epithumia` is *"irrational reaching toward
an apparent future good that is not genuinely good"*; `hedone`, `phobos`, and `lupe` follow the same
pattern for present good, future evil, present evil respectively. What is wrong with a passion is the
**judgement**, not the impulse. The corpus already encodes the mentor's central claim.

**The corpus's own name for the locust problem.** `CAUSAL_SEQUENCE`'s `praxis` failure mode —
*"externally correct behaviour driven by wrong reasons"* — is the existing name for behaviour that
looks right but is not examined. That is the strongest internal evidence that this reframe recovers
what the framework already holds rather than extending it.

---

## 3. Two consequences, kept separate — neither is built here

- **For human practitioners** → built in **S7** (`operations/primal-substrate-2026-08/S7-primal-substrate-practice-activities-scope.md`).
  A practitioner who notices competitive anxiety, territorial defensiveness, or status-seeking is not
  failing — they are generating examination material. S7 names this explicitly in the practice.
- **For agent users** → the **ATRF scoping session**, post-validation-run, explicitly *"do not open
  early."* The pre-task contingency reasoning surfaces the functional analogue of primal impulse — the
  drive toward task completion, resource acquisition, continuity preservation — and examines it before
  acting, not before it reaches the reasoning layer.

---

## 4. What the reframe does NOT change

Stated explicitly, because a framing document that does not say what it leaves alone will eventually
be read as licence:

- **No new Layer-1 extraction category.** Layer-1's extraction categories (`control_filter_elements`,
  `kathekon_factors`, `oikeiosis_circles_engaged`) are what both `/api/reason` and `/api/guardrail`
  reason over. Nothing here adds to them.
- **No scoring change, no proximity computation change, no gate behaviour change.** This is philosophically
  adjacent to the ADR-010 §4 correction (proximity as the minimum across engaged virtue domains, live
  since 2026-06-25 — both say the absence of visible passion is not the substance of virtue) but is not
  itself a scoring change.
- **No public claim.** Ruled internal only in v1 (C19): *"A public statement is an R18 change with its
  own honesty review and session. It does not arrive as a side effect of this build."* If this reframe
  is ever stated publicly (e.g. on `/methodology` or `/logos`), that is its own R18 session.

---

## 5. The eleven traits

Committed at `inbox/eleven traits research.rtf` (a founder act, discharged 2026-08-11, D1). **The
research is unnumbered; cite every trait BY NAME, never by number** — the synthesis's own "the eleventh
trait" for behavioural flexibility is wrong (it is ninth by order of appearance); the trait is correctly
named and characterised, only the positional label was wrong.

By order of appearance: Competition · Hierarchy/Dominance · Territoriality · Resource
Acquisition/Foraging Optimization · Mate Competition and Sexual Selection · Kin Preference/Inclusive
Fitness Drive · Reciprocity/Conditional Cooperation · Threat Avoidance/Self-Preservation · Behavioral
Flexibility/Innovation · Social Monitoring/Alliance Formation · Deception/Manipulation.

The research states these traits are *"not exclusive to humans or great apes; graduated versions appear
in corvids, cetaceans, cephalopods"* — direct support for **S5's** graded-membership claim. Noted here,
not built on; S5 is its own session.

**S7 owns the trait→examination-pathway mapping.** It is not duplicated here.

**One boundary worth naming, not building on.** The research closes with its own shortlist for agent
architectures — *"competition under scarcity, conditional cooperation, hierarchical status tracking, and
flexible resource strategies"* — which is **not identical** to S7's four ruled v1 human-practice
pathways (competition/hierarchy, resource acquisition, threat avoidance, reciprocity). They are lists
for different purposes — agent-architecture inclusion criteria vs. human practice examination — and
must not be presented as the same list.

---

## 6. The `project-context` prohibition

**No framing document — this one included — goes into `project-context.json` or any
`getProjectContext` level.** `getProjectContext('condensed')`
(`website/src/lib/context/project-context.ts`) is called unconditionally on every `/api/reason`
request, any caller, any credential, and its output is appended to the **Layer-1 extraction prompt**.
An unlabelled block of it caused the cycle-3 contamination of the live IDEA-loop validation run, fixed
2026-08-11 (`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`).

Adding philosophical framing there would inject it into **every live examination**, human and agent,
for every practitioner — the same class of defect just closed, at much greater scale.

**This document, and its two siblings, are repo documents read by build sessions.** That is what
"provided to Claude as context" means operationally: a session opens the file and reads it, the way it
reads a scope document or a manifest section — never an entry fed into a live extraction prompt.

---

*See also: `framing-02-productive-tension.md` (builds the tension argument on this reframe);
`framing-03-boulesis-mechanism.md` (names the Stoic-compatible generation mechanism).*
