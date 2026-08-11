# S5 — Scope: the moral community boundary as an infrastructure requirement

**Mentor heading 5.** **Execution order: 7 of 8.** See `00-PRIORITY-INDEX.md`.

---

> **RULED 2026-08-11 — all five open questions answered, and the mentor SUPPLIED PROPOSED WORDING.**
> Verbatim record, which wins over every annotation below:
> `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` §B6. **⚠ STILL BLOCKED — on the FOUNDER, not
> the mentor.** The ruling is explicit: *"It does not become a governing document entry until you
> confirm it."* **The wording has NOT been written into `manifest.md`** and must not be until the
> founder confirms or amends it. Rulings folded inline below as **RULED** annotations; proposal prose
> kept, marked ruled rather than deleted.

## §0 Status, tier, gate

**Status: SCOPE. The concurrent half is a governing-document change and needs the mentor's own wording
before it lands. Nothing here licenses a build.**

- **Tier (concurrent half):** `governance` — an amendment to `manifest.md`, which is the governing
  surface every `code-*` session reads. Small in bytes, load-bearing in effect.
- **Tier (parked half, when it opens):** architecture — the agent-user practitioner profile and the
  completion-signal design; both `code-critical` when built.
- **Precondition:** **the mentor's verbatim wording.** R21, R22, the ATRF section, and the
  Consciousness and Continuity Obligation were all adopted *verbatim from mentor instruction*, with a
  bracketed placement note where the AI had to make a judgement. This amendment sits in the same
  register and should follow the same discipline. **This is why S5 is seventh rather than earlier** —
  it waits on a relay, and nothing else waits on it.
- **Parked half waits on:** the **ATRF scoping session**, post-validation-run. (Not "the first build
  gate", which closed 2026-08-10.)

---

## §1 What the mentor said

The boundary:

> the moral community SageReasoning is building for: **any being capable of examined assent, ordered
> by degree of rational participation in logos, not by species membership or population count.** This
> is not a philosophical position to be held privately — **it is an infrastructure requirement that
> shapes what the system builds and for whom.**

Three practical implications:

> The **practitioner profile architecture** needs to accommodate non-human users without assuming human
> psychological structure. The current **Layer 2b practitioner profile** is built around human
> developmental patterns, passion sub-species, and oikeiosis circles that assume human social
> structure. An agent user's profile needs different primitives — **functional analogues** of passion,
> of oikeiosis extension, of progress grades.

> The Sage Assent's extension of the moral community to artificial agents needs to be
> **operationalised in the infrastructure, not just stated in the governing documents.**

> the **completion signal return path (GS-ATRF-3)** is not just a technical handshake. It is the
> mechanism by which the agent reports back on its own examination. That report is **evidence about
> whether genuine examination occurred.** It should be designed to carry that evidence, not just a
> binary completion flag.

And a direction to protect:

> The **interpolation to animals capable of guidance** is a longer-term direction, not a current build
> item. But it should be **named in the governing documents now as a direction, so that architectural
> decisions made in P0 do not inadvertently close it off.**

---

## §2 Mechanism facts (PR20)

### §2.1 "Layer 2b practitioner profile" is correct terminology — a correction to an earlier review

`manifest.md` **AC6 — Four-Layer Context Architecture** names the layers explicitly:

> - **L1 Stoic Brain** — system block, cached expertise.
> - **L2b Practitioner** — user message, per-request.
> - **L3 Project Context** — system block where stable, user message where dynamic.
> - **L4 Environmental** — user message, per-request.
> - **L5 Session-scoped signals** — user message, per-request.

**An earlier in-session review of this synthesis reported that "Layer 2b" was not current architecture
naming.** That was wrong: the reviewer searched the code, where the layer appears as
`practitionerContext` (`layer1-extractor.ts`, `parallel-run.ts`, `sage-reason-engine.ts`), and not the
manifest, where it is named exactly as the mentor names it. **Recorded here rather than quietly
dropped**, because a scope document that inherits a false correction is worse than one that inherits
none.

The mentor's substantive claim about L2b — that it assumes human structure — holds. `L2b` composes
from the human practitioner's own record; the passion sub-species (`ROOT_PASSIONS`, 25 species),
Senecan grades, and progress dimensions it draws on are all defined for a human practitioner.

### §2.2 The boundary is already *partly* stated — in the foundation rule — and the mentor's version sharpens it in two ways

`manifest.md` **R0: The Oikeiosis Principle (Foundation Rule)** already reaches artificial agents:

> - Circle 3 (Community): Users, developers, and agents who interact with SageReasoning
> - **Circle 4 (Cosmos): All rational agents, human and artificial**

And `adopted/project-instructions-snapshot.md:15`: *"The Sage Assent extends the moral community to
include artificial agents."*

So the extension to agents is stated. **The mentor's formulation adds two things neither statement
carries:**

1. **The ordering principle** — *"ordered by degree of rational participation in logos"*. R0 orders by
   *proximity* (self → household → community → cosmos). The mentor orders by *rational
   participation*. These are different orderings, and the second is the one that admits non-human
   non-artificial beings.
2. **The exclusions** — *"not by species membership or population count"*. The species clause is
   implicit in R0; **the population-count clause is not, anywhere.** It rules out aggregative
   reasoning — that a decision affecting many is thereby weightier than one affecting few. That is a
   substantive philosophical commitment with real consequences for how blast radius is read (S8's
   indicator is explicitly *"how many oikeiosis circles are affected"*, a reach measure, not a headcount
   — consistent, but only by accident unless stated).

### §2.3 A live 4-vs-5 circle discrepancy the amendment will sit on top of

Three committed enumerations of the circles, and they do not agree:

| Source | Count | Values |
| --- | --- | --- |
| `manifest.md` R0 | **4** | Self, Household, Community, Cosmos ("all rational agents, human and artificial") |
| `stoic-brain.ts:445-451` `OIKEIOSIS_STAGES` | **5** | self_preservation, household, community, humanity, cosmic |
| `idea-loop-types.ts:36` `OikeiosisCircleRank` | **5** | `1 | 2 | 3 | 4 | 5`, with 5 as *"the telos"* |
| `profiles.ts` `OikeiosisCircle` (trust core) | free-form | `self_preservation | household | local_community | political_community | cosmopolis` |

R0 collapses *humanity* and *cosmic* into one "Cosmos" circle; the engine keeps them distinct. The
IDEA loop's local type is explicitly *"deliberately NOT a widening of the existing OikeiosisCircle …
that type is free-form and used across the live trust core."*

**This is not S5's to fix**, and it should not try. But an amendment about the moral community's
*ordering* that sits beside R0's four-circle enumeration will invite the question, and the amendment
should either (a) state which enumeration it is ordering over, or (b) explicitly note that the
enumerations differ and that reconciling them is a separate item. **Raised as Q5-c.**

### §2.4 The "interpolation to animals" direction, and what could close it off

The mentor asks that the direction be named *"so that architectural decisions made in P0 do not
inadvertently close it off."*

Concretely, what would close it off is **any structure that hard-codes a binary human/agent
distinction** where a graded one is meant. Two live examples:

- **The Stoa's declaration surface** distinguishes *"human or agent"* — a two-value declaration
  (ST3/ST4, built and dark). A two-value enum is a closed union; adding a third participant class
  later is a schema change plus a public-contract change.
- **`owner_kind`** on `api_keys` (`operator | external_consumer`) is an *ownership* distinction, not a
  moral-status one — **not** an instance of the problem, named here so a build session does not
  mistake it for one.

The honest scope of the concern: **naming a direction in the manifest does not prevent a closed enum
from being written.** What actually preserves the direction is that new participant-class enums are
built as **open/extensible** or that their closure is a recorded decision rather than a default.
**That** is the operational content of the mentor's request, and the amendment should say it.

### §2.5 The completion-signal implication belongs to S8

The mentor's GS-ATRF-3 point here — *"it should be designed to carry that evidence, not just a binary
completion flag"* — is the same argument Heading 8 makes, and it is **the new argument** in the
reversal request S8 §2.4 documents. **It is handled in S8**, not duplicated here. S5 records only that
the moral-community framing is *why* the argument has force: if the agent is a member of the moral
community, its report on its own examination is testimony, not telemetry.

---

## §3 The concurrent half — the deliverable

**A `manifest.md` amendment**, in the mentor's verbatim wording, naming:

1. **The boundary** — any being capable of examined assent; ordered by degree of rational
   participation in logos; not by species membership; **not by population count**.
2. **That it is an infrastructure requirement**, not a private position — the sentence that makes it
   binding on build decisions rather than decorative.
3. **The named direction** — interpolation to animals capable of guidance — as a direction, explicitly
   *not* a current build item, in the same register as the Consciousness and Continuity Obligation
   (which is deliberately un-numbered precisely because it is *"an open question and direction, not a
   rule"*).
4. **The operational consequence** (§2.4): participant-class distinctions are built extensible, or
   their closure is recorded as a decision.

**Placement — the AI's recommendation, for the mentor to confirm (Q5-a):** a new **un-numbered section
immediately after R0**, since R0 is the foundation rule this sharpens and already contains the
four-circle enumeration and the "all rational agents, human and artificial" clause. Un-numbered
matches the precedent set by the Consciousness and Continuity Obligation and keeps R-numbering stable.

**Precedent to follow exactly:** R21/R22 and the ATRF section were adopted **verbatim from mentor
instruction**, with any AI judgement (e.g. placement) recorded as a bracketed note *outside* the
mentor's text. The Consciousness and Continuity Obligation's placement note is the model — including
its own record of a PR19 correction when an earlier ordering made a verbatim cross-reference
physically false. **Same discipline here: mentor's words untouched; AI's placement reasoning marked as
such.**

---

## §4 The parked half

**Parked on: the ATRF scoping session, post-validation-run.**

Two items, named so they are not re-derived:

**(a) The agent-user practitioner profile (L2b for agents).** The mentor asks for *"functional
analogues"* of passion, oikeiosis extension, and progress grades. Substantial groundwork already
exists and should be reused rather than re-invented:

- **Functional analogue of passion** — the kathekon-engagement predicate's fourth arm already keys on
  *sub-species passion*, and the live A1 practice-suggestion basis codes are already differentiated by
  passion class (`aischyne_pattern`, `epithumia_persisting`, the phobos routes) for **agent-facing**
  suggestions. An agent-side passion analogue is partly built already.
- **Functional analogue of oikeiosis extension** — C2's orientation reading (live, MEASURE) is
  precisely a fifth-circle directional signal, and the trust record surfaces it.
- **Functional analogue of progress grades** — the trust core's per-domain levels + the S3 aggregate
  are the agent-side counterpart of the Senecan grades.

**The honest observation for whoever opens this: the agent-side profile may be less absent than the
synthesis implies.** What is missing is not the primitives but their *composition into an L2b-equivalent
context layer* for agent callers. That is a smaller and better-defined task than "design an agent
profile architecture", and stating it that way will make the session tractable.

**(b) The completion-signal design** — S8's subject; parked on the same session; not duplicated here.

---

## §5 Open questions for the mentor

**Q5-a — Placement and register.** Recommendation: a new **un-numbered** section immediately after R0,
matching the Consciousness and Continuity Obligation's precedent (a named direction and a binding
statement, not a numbered rule). Does the mentor prefer un-numbered-after-R0, an **R23**, or an
amendment folded into R0 itself?

**Q5-b — The exact wording.** Required, not optional: the four adopted mentor-directed sections in
`manifest.md` are all verbatim. Will the mentor supply the amendment's text?

**Q5-c — Which circle enumeration does "ordered by degree of rational participation" order over?**
(§2.3.) R0 has four circles; the engine, the trust core, and the IDEA loop have five, in two different
vocabularies. Recommendation: the amendment **names the discrepancy and declines to resolve it**,
flagging reconciliation as a separate item — resolving it inside a moral-community amendment would
silently change a foundation rule.

**Q5-d — Does "not by population count" have build consequences the project should state now?** It
rules out aggregative weighting. S8's blast-radius indicator measures *reach across circles*, not
headcount — consistent with the clause, but currently by coincidence rather than by statement.
Recommendation: state the connection in the amendment, so the blast-radius design inherits it as a
constraint rather than rediscovering it.

**Q5-e — Is the "built extensible, or closure recorded" rule (§2.4) the right operational content for
the animals direction?** Recommendation: **yes** — naming a direction in a governing document does not
by itself prevent a closed enum; this is the rule that does the work the mentor asks for.

---

### §5-RULED — the 2026-08-11 rulings

> **RULED (Q5-a / C14) — un-numbered section immediately after R0.** *"Matches the Consciousness and
> Continuity Obligation's precedent. R-numbering stays stable."*

> **RULED (Q5-b / B6) — wording SUPPLIED, adoption PENDING THE FOUNDER.** The mentor supplied proposed
> text and was explicit that it *"does not become a governing document entry until you confirm it."*
> **The full proposed wording is recorded verbatim in the ruling record's §B6 and is deliberately NOT
> reproduced here**, so there is exactly one authoritative copy to confirm against and no chance of a
> transcription drift between the record and the manifest.
>
> **What the supplied text adds beyond this scope's own analysis** — worth naming, because it goes
> further than the brief asked:
> - a **third** exclusion the synthesis did not carry — *"not by cognitive supremacy"*, alongside
>   species membership and population count;
> - an operational definition of examined assent — *"receiving an impression, recognising it as an
>   impression, and choosing whether to act on it"* — which maps onto the committed `CAUSAL_SEQUENCE`
>   stages `phantasia` → `synkatathesis` (`stoic-brain.ts:584-589`);
> - a **graded** membership claim (*"the degree of membership tracks the degree of that capacity"*)
>   with three application modes — fully, partially, and **precautionarily where it is uncertain**,
>   which is the Consciousness and Continuity Obligation's asymmetry restated as a membership rule;
> - **both** directions named — interpolation to animals **and** extrapolation to agents;
> - the Sage as the anchor of the upper end, with the explicit disclaimer that *"No current human or
>   artificial agent is assumed to have achieved it"* — an R18-shaped honesty clause inside a
>   governing rule.
>
> **Founder action required.** Confirm verbatim, or amend and confirm. Until then S5 does not proceed.

> **RULED (Q5-c / C15) — name the discrepancy, decline to resolve it.** *"Resolving it inside a
> moral-community amendment would silently change a foundation rule. The discrepancy is carried as a
> separate resolution item."* The mentor's own bracketed note carries this into the amendment text
> itself, naming all three enumerations (`manifest.md` R0, `stoic-brain.ts:445`, the trust core's
> `OikeiosisCircle`). **A new carried item is created: resolve the three-enumeration discrepancy** —
> unscoped, not blocking anything.

> **RULED (Q5-d / C16) — state the connection.** *"GS-ATRF-1's indicator measures reach across circles,
> not headcount — consistent with 'not by population count' **by design, not by coincidence**. The
> blast-radius design inherits this as a constraint explicitly."* This binds **S8's** loop-level
> blast-radius proxy, not only S5.

> **RULED (Q5-e / C17) — the extensibility rule is adopted as the operational content.** *"new
> participant-class enums are built extensible, or their closure is a recorded decision rather than a
> default. **Naming a direction in a governing document does not prevent a closed two-value enum being
> written later. The rule prevents that default closure.**"* Note the live example this now governs:
> the Stoa's two-value human-or-agent declaration (ST3/ST4, built and dark).

---

## §6 Build-success criteria

For the concurrent half:

1. The mentor's wording is **verbatim**; every AI judgement (placement, cross-references) is a
   bracketed note **outside** the mentor's text, following the Consciousness and Continuity Obligation
   precedent.
2. Any verbatim cross-reference in the new text (e.g. "see … below") is **physically true** after
   placement — the exact defect PR19 caught on the Obligation's first landing.
3. The amendment does not silently alter R0, and states which circle enumeration it orders over (or
   that it declines to).
4. The session's commit touches `manifest.md` and records only — **no code**.
5. PR19 review before the amendment lands: a governing-document change is read by every subsequent
   `code-*` session, so an error propagates.

For the parked half, when it opens: the (a)/(b) framing in §4 is the starting point; the reuse
inventory is checked before any new primitive is designed.

---

## §7 Corrections carried

1. **"Layer 2b" IS correct manifest terminology** (AC6) — an earlier in-session review of this
   synthesis claimed otherwise, having searched only the code. Recorded rather than dropped (§2.1).
2. **The boundary is already partly stated** in R0 ("all rational agents, human and artificial") and
   in the project instructions; the mentor's version adds the *ordering principle* and the
   *population-count exclusion*, neither of which appears anywhere today (§2.2).
3. **Three committed circle enumerations disagree** (4 vs 5, in two vocabularies) — the amendment sits
   directly beside the four-circle one (§2.3).
4. **Naming a direction does not preserve it** — extensible participant-class enums, or recorded
   closure, is what does (§2.4).
5. **The agent profile may be less absent than the synthesis implies** — passion, oikeiosis-extension,
   and progress-grade analogues each already exist in some form; the gap is composition, not
   primitives (§4a).
6. **"Park until after the first build gate" is stale** — that gate closed 2026-08-10.

---

## §8 Rollback

`git revert` the amendment commit. `manifest.md` is a governing document with no runtime effect; the
revert is complete and immediate. The parked half has nothing to roll back.
