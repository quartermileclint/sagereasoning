# Mentor brief — primal-substrate scope documents, confirmation before builds start

**Date:** 2026-08-11. **Purpose:** confirm or overrule the amendments the scoping work made to your
2026-08-11 synthesis, and answer the decisions that block the first builds.

**Nothing has been built.** Eight scope documents exist (`operations/primal-substrate-2026-08/`,
`S1`–`S8`, numbered to match your headings), plus a verbatim record of the synthesis and an execution
index. No code, schema, flag, credential, or public surface has changed.

**PR20 note:** each claim below is traced to committed code or a committed record, with `file:line`
where it exists. Where the scoping departed from the synthesis, the departure is stated as a departure,
not absorbed.

---

## Part A — Seven corrections the scoping made. Confirm or overrule.

These are places where the scope documents do **not** follow the synthesis as written. Each was checked
first-hand. If any is wrong, the dependent scope document is wrong with it.

**A1. The examination pathway you describe already exists in the committed corpus.**
`DIAGNOSTIC_SEQUENCE` (`website/src/lib/stoic-brain.ts:595-601`, sourced to
`passions.json > diagnostic_use`) is a five-step passion diagnostic: (1) was the impression distorted,
by which root passion; (2) which false belief drove the assent; (3) did the impulse exceed what reason
warranted; (4) which sub-species was operative; (5) what correct judgement replaces the false one.
**Your two questions in Heading 1 are steps 2 and 5.** Your four pathways in Heading 7 are this
sequence entered from four different starting points. Also: *"intercepts the impulse between impression
and action"* is `synkatathesis` in the committed `CAUSAL_SEQUENCE` (`:584-589`), whose `praxis` failure
mode is already *"Action from passion — externally correct behaviour driven by wrong reasons"* — the
corpus's own name for the locust problem. **Scoped consequence: S7 applies the existing sequence rather
than authoring a new taxonomy (PR15).**

**A2. GS-ATRF-1 and GS-ATRF-2 were already ruled on 2026-08-09, and the existing answer is larger.**
Your ruled GS-ATRF-1 is a **four-virtue** proxy — circles affected (dikaiosyne), reversibility
(andreia), preferred indifferents at stake (phronesis), impulse proportionality (sophrosyne). The
synthesis's *"proxy for the oikeiosis circle most affected"* is the **first of those four**. The scope
keeps the four-dimension answer. Separately, `manifest.md`'s ATRF section already fixes the vocabulary
at **high | medium | low** and requires **two records** — the loop's indicator *and* the agent's own
assessment, *"recorded alongside … for longitudinal comparison."*

**A3. GS-ATRF-2's watching-table claim repeats a claim already checked and found false.**
The synthesis says *"the watching table's candidate row should carry the same field."* Your 08-09
review already caught this: `idea_loop_candidates` has **no `target_circle` column**. Re-verified
column-by-column 2026-08-11 against `website/supabase-idea-loop-watching-migration.sql` §2.
Consequence: realising the ruled GS-ATRF-1 needs **three** additive columns, not one — the loop's
indicator, the agent's assessment, and the circle (or a ruled cycle-level resolution of it).

**A4. "The first build gate" has closed.** Five items are parked in the synthesis on that gate. It
closed 2026-08-10 — `fresh`, `watching`, and `loop_id` were built dark and activated at the runner
scoping session, and the validation run is in flight. The scope documents re-park each item on the
**current** gate: the **§6 report**, the **post-run ATRF scoping session**, or the **standing-runner
design**.

**A5. Heading 6's "at principled proximity" rests on an uncertified verdict.** Cycle 2's proximity is
the entire basis of the friction claim, and it predates the contamination fix; your standing ruling is
that cycles 1–2 *"may be accurate, but cannot be certified clean."* It was also delivered **`observed`,
not `examined`** (16,139 + 13,611 = 29,750 ms, over the 28,000 ms bound). And **both** h7 outcomes so
far were decided by the `r mod n` tie-break — cycle 2 won the draw at `principled`, cycle 3 lost it at
`principled`. Read together the evidence supports h7 being *competitive with* the virtue-domain
heuristics, not *superior to* them.

**A6. There are two `/api/reason` incidents in five cycles, not one — of opposite sign.** Heading 4
argues from cycle 3 (`contamination`, fixed). Cycle 5 is `extraction_instability` — legitimate content
**failing** to extract, reproduced on retry, ruled by you as *"not a defect with a clean fix"* and
carried as a §6 finding. Contamination by addition, and contamination by omission. This strengthens
Heading 4's case and changes the evidence base it should be argued from.

**A7. "Layer 2b" is correct terminology — an earlier review of mine said otherwise and was wrong.**
`manifest.md` AC6 names it exactly as you do (*"L2b Practitioner — user message, per-request"*). The
earlier reviewer searched the code, where it appears as `practitionerContext`, and not the manifest.
Recorded rather than dropped.

---

## Part B — Decisions that block a build. Each has an AI recommendation.

### B1. GS-ATRF-3 — this is a reversal request, and it needs to be one. *(Blocks: ATRF scoping session; affects the generation-step document.)*

You ruled on 2026-08-09 that the completion signal is *"a separate scope item after the first build
gate"* — because it is *"a different actor (the agent, not the runner) and a different moment
(post-execution, not post-proposal),"* and *"scoping it inside the generation-step document would blur
the Q1 hard constraint."* The prioritised instruction then placed it in the post-validation-run ATRF
scoping session.

The synthesis proposes moving it into the generation-step document, on a **new** argument: the signal
*"is not just a technical handshake — it is evidence about whether genuine examination occurred."*

That argument is real and was not before you on 08-09. But it addresses the signal's **content**, and
the deferral rested on **actor and moment**. A signal can be rich in examination-evidence and still be
authored by a different actor at a different moment.

**Three options:**
1. **Hold the 08-09 ruling** — the signal stays in the ATRF session; the examination-evidence
   requirement is recorded there. Nothing is lost but the location.
2. **Reverse it** — the generation-step document takes the completion signal, and the Q1 boundary then
   needs an explicit statement of how it is still held.
3. **Middle (AI's recommendation)** — the **generation-step document states the requirement** (the
   signal must carry examination evidence, not a binary flag, and why); the **return path is scoped in
   the ATRF session**. The new argument is captured where it arose; the actor/moment boundary survives.

### B2. S7 — extend `/passion-log`, or build a new tool? *(Blocks: the S7 build entirely.)*

`/passion-log` → table `passion_events` captures `passion_type`, `intensity`, `caught_before_assent`,
`false_judgement`, `description?`. Against `DIAGNOSTIC_SEQUENCE`: step 2 covered; steps 1 and 4 partly;
**steps 3 and 5 absent**, and the trait entry point absent entirely. So your gap is real and precisely
locatable.

**The deciding fact:** `/api/mentor/passion-log`'s save path is wired into the live Phase-2 in-session
practice suggestion (the Step M mapping). `passion_events` is not an isolated table.

**AI recommendation: a new tool**, on the live-coupling risk plus the independent-revert property every
one of the seven shipped Remaining-Principles siblings has — with a conceptual link to `/passion-log`
in page prose and **no code coupling** (the `/sage-compass` precedent).

### B3. S7 — does this tool sit inside the R20a distress perimeter? *(Blocks: the S7 build. AC5 requires a recorded decision either way.)*

Every Remaining-Principles tool sits **outside** the perimeter by precedent, carrying `SupportFooter`.
**This one is different in kind.** Its pathways deliberately elicit, in the practitioner's own words,
shame (`aischyne` — *"fear of ill-repute"*, `:345`) and fear of an uncertain outcome (`agonia`, `:348`),
and it sits beside `lupe`'s grief, envy, and jealousy species. Its design premise is that the
practitioner should **not** suppress this material.

**AI recommendation: inside the perimeter**, contrary to family precedent. A false positive costs a
crisis-resource redirect to a non-distressed practitioner; a false negative is a practitioner writing
about their shame into a tool that does not notice. The pattern exists — the `/api/score-conversation`
route-level `enforceDistressCheck` before any LLM call, live since 2026-07-07.

### B4. S7 — how is the fourth pathway shaped? *(Blocks: S7 design.)*

Three of your four mappings land on committed sub-species: `philodoxia` (`:323`), `philoplousia`
(`:322`), and the phobos species. **The fourth — reciprocity → the dikaiosyne/enlightened-self-interest
tension — is not a passion sub-species.** It is a question about the *ground* of an action that may be
outwardly correct either way. Forcing it into the sub-species shape would either invent a sub-species
(R7 source-fidelity violation) or silently drop the pathway.

**AI recommendation:** a distinct mode within the same tool, with its own question set — the corpus's
own *"externally correct behaviour driven by wrong reasons"* is its natural home. Alternatives: route
it to `/oikeiosis`'s circle-extension exercise, or omit from v1 and name it.

### B5. S6 — is a null result specified, before the data is visible? *(Blocks: the §6 analysis's validity.)*

The synthesis names no condition under which the friction hypothesis would be **rejected**. The run is
live; the temptation to fit the discriminator after seeing the distribution is real, and the project
has a precedent for freezing thresholds first (P2's frozen boxes). **AI recommendation: fix the null
result now.** The scope proposes the discriminator be: h7's proximity distribution versus h1–h6's,
**restricted to cycles whose winner extraction was cross-checked clean**, with strict wins separated
from tie-break wins, and blast-radius/reversibility read alongside proximity (your claim is a joint one).

### B6. S5 — the amendment's exact wording. *(Blocks: S5 entirely.)*

R21, R22, the ATRF section, and the Consciousness and Continuity Obligation were all adopted **verbatim
from your instruction**, with any AI judgement recorded as a bracketed note outside your text. This
amendment sits in the same register. **Will you supply the text?**

### B7. S4 — does the run's review protocol change now, mid-flight? *(Time-sensitive.)*

The traceability check is proposed for the run's per-cycle review, ~15–35 cycles remaining. **AI
recommendation:** propose it through the run's own channel and let the run's ruling cadence decide; a
repo-side session should not impose a protocol change on a live founder-attended run.

---

## Part C — Confirmations. Recommendation stated; a short yes is enough.

**C1 (S1) — Does S7 adopt `DIAGNOSTIC_SEQUENCE` as the examination pathway?** *Recommend: yes,
explicitly*, so the build applies it rather than authoring a parallel taxonomy. If a new pathway is
intended, PR15 requires the reason be stated.

**C2 (S4) — Does the cross-endpoint comparison satisfy "a systematic part of the cycle review"?**
Cycle 5 was caught **only** by comparing `/api/guardrail`'s and `/api/reason`'s extractions of identical
text — both already produced every cycle, already billed, never compared. *Recommend: adopt the
cross-endpoint check as the systematic step now (zero cost, no schema change), and treat the table
extension as the durable record of it rather than as the mechanism.*

**C3 (S4) — The criterion's honest bound.** It detects divergence and unsourceability; **two agreeing
extractions can both be wrong**. *Recommend: state the bound explicitly rather than introduce a third
independent reading (which would add a call and a cost per winner).*

**C4 (S4) — Verbatim extraction, or derived summary, in the parked table extension?** *Recommend:
derived summary in v1* — element counts, domain set, divergence flag — with `guardrail_session_id`
(already present) preserving a full re-audit path. Verbatim satisfies your wording; derived satisfies
the check at a fraction of the payload.

**C5 (S3) — Heading 3's verification claim versus Heading 4's locust problem.** Heading 3 says the gap
question *"cannot be performed as a compliance check"*; Heading 4 says output quality cannot distinguish
genuine from simulated. **Cycle 5 is direct counter-evidence:** a confident, articulate, fully justified
*empty* extraction. *Recommend: reformulate as evidence, not proof* — a specific answer is evidence of
genuine assessment, a formulaic one evidence against, and the mechanism is paired with S4's check rather
than treated as self-verifying.

**C6 (S3) — What are the generation step's legitimate signal sources?** Asking an agent where the system
is *"most constrained"* requires system knowledge — and you ruled on 2026-08-11 that `projectContext`
should be **removed from API-key-authenticated `/api/reason` calls entirely**. Generation and
examination are different calls, so these are not contradictory, but the distinction is easy to lose at
build time. *Recommend: the runner's own state only* — shared task list, cycle history,
credential-scoped examination history, and **its own public trust record**, which is purpose-built to
state coverage gaps and non-attestation honestly and is the most promising signal for "where examined
assent is most constrained." **Explicitly not `getProjectContext`.**

**C7 (S2/S6) — Are the normative-gap mechanism and the friction-primary reordering one proposal or
two?** *Recommend: two.* One adds a question (*where does the system fall short of what virtue
requires?* — normative); the other promotes an existing channel (heuristic 7 reads **technical**
friction: slow steps, workarounds). Conflating them would let cycle 2's evidence stand in for a
mechanism that did not produce it.

**C8 (S6) — Should the friction hypothesis be tested jointly with your extraction-instability
hypothesis?** Your cycle-5 hypothesis is that *"borderline proposals — dry documentation changes,
low-drama disclosure text"* extract unreliably. **Friction candidates are that class by construction.**
So the friction hypothesis's evidence sits inside the other hypothesis's stated risk zone. *Recommend:
test them jointly*, or the §6 report will contain a finding and its own undercutting caveat in separate
sections.

**C9 (S2) — Does `/sage-compass`'s binding "not a verdict" constraint bind the agent-side mechanism
too?** Your #14 gap-measurement design is already live for humans; its route states *"Nothing in this
route computes, scores, ranks, grades, or classifies it."* *Recommend: yes, and state it in the framing*
— a computed gap that feeds a score is the same violation in a different medium.

**C10 (S8) — Is the loop's blast-radius indicator the same field as item 16's `blast_radius`?** Item 16
(approved 2026-08-07) puts `blast_radius` on a **separate permission-layer schema**, produced by item
14's three-step post-verdict analysis. That is an expensive enrichment; GS-ATRF-1's is a cheap
reasoning-level proxy computed without task details. They share a name and a vocabulary but not a
method, producer, or moment. *Recommend: name them distinctly now* — the project has been bitten twice
this window by two things sharing a name.

**C11 (S8) — Is the proxy disclosure persisted, or computed at read time?** *Recommend: persisted* —
consistent with the traceability criterion this same synthesis asks for; a `high` should remain
auditable after the derivation changes.

**C12 (S7) — Locally-duplicated sub-species vocabulary.** The shipped precedent requires human surfaces
to define engine-adjacent vocabulary **locally** (`stoic-brain.ts` is imported directly by
`api/guardrail/route.ts` and `guardrail-sandwich.ts` — reading permitted, **editing forbidden**). That
means transcribing the 25 sub-species, which risks silent drift. *Recommend: accept the duplication and
add a drift pin* to the boundary test that reads `stoic-brain.ts` **as text** (the test imports nothing)
and asserts the local IDs are a subset.

**C13 (S7) — Do the other seven traits get pathways in v1?** You gave four of eleven. *Recommend: build
the four given*, and design the trait vocabulary so the remaining seven can be added without a schema
change.

**C14 (S5) — Placement and register of the moral-community amendment.** *Recommend: a new **un-numbered**
section immediately after R0* — R0 is the foundation rule this sharpens, and already contains *"Circle 4
(Cosmos): All rational agents, human and artificial."* Un-numbered matches the Consciousness and
Continuity Obligation's precedent and keeps R-numbering stable. Alternatives: an R23, or folded into R0.

**C15 (S5) — Which circle enumeration does "ordered by degree of rational participation" order over?**
Three committed enumerations disagree: `manifest.md` R0 has **four** circles; `stoic-brain.ts:445` has
**five**; the trust core's `OikeiosisCircle` has five in a different vocabulary. *Recommend: the
amendment names the discrepancy and declines to resolve it* — resolving it inside a moral-community
amendment would silently change a foundation rule.

**C16 (S5) — Does "not by population count" have build consequences to state now?** It rules out
aggregative weighting. GS-ATRF-1's indicator measures **reach across circles**, not headcount —
consistent, but currently by coincidence. *Recommend: state the connection*, so the blast-radius design
inherits it as a constraint.

**C17 (S5) — What actually preserves the "interpolation to animals" direction?** Naming a direction in a
governing document does not prevent a closed two-value enum being written later (the Stoa's
human-or-agent declaration is a live example). *Recommend: the operational rule is that new
participant-class enums are built **extensible**, or their closure is a **recorded decision** rather
than a default.*

**C18 (S6) — Do tie-break wins count toward the friction hypothesis, and how?** *Recommend: report
strict wins and tie-break wins separately.* A channel that reliably **ties** at the top is a real
finding, but a different one from a channel that reliably **wins**.

**C19 (S1) — Is the primal-substrate reframe intended for any public surface?** It is currently internal
framing. *Recommend: internal only in v1* — a public statement is an R18 change with its own honesty
review and session, and should not arrive as a side effect.

---

## Part D — Two things only you can supply

**D1. The eleven-traits research is not in the repo.** Searched `inbox/` and `operations/` first-hand.
It is cited as a fixed reference throughout Headings 1, 2, and 7, and Heading 7's pathways are keyed to
named traits. **S1, S2, and S7 are blocked on it.** Building examination pathways from a summary of a
taxonomy rather than the taxonomy is the failure the verbatim-wins rule exists to prevent.

**D2. The verbatim wording for the S5 manifest amendment** (see B6).

---

## Sequencing, for context

The scope documents are ordered by deadline and risk, not by heading number:

1. **S4** (traceability) and 2. **S6** (friction hypothesis) — both feed the **§6 report**, which is
   days away. Written after it, they become an autopsy rather than an instrument.
3. **S8** (GS-ATRF corrections + B1) — protects the post-run ATRF scoping session.
4–6. **S1 → S2 → S3** (framing trilogy, strict internal order) — no deadline.
7. **S5** (moral community) — waits on D2.
8. **S7** (practice activities) — the only real build; **parallel-safe**, shares no surface with
   anything else, can start any time after S1 and D1.

Nothing self-starts; the founder sequences. Nothing in this family bears on the 0h call.
