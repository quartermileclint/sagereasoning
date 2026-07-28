# Stoic Technical Consultation — Agent Practice Suggestions: Open Questions After the First Build

**Date:** 2026-07-28.
**From:** the SageReasoning build team, following your 2026-07-27 consultation (the in-session mapping tables, the question form, the stages-as-conditions ruling — all adopted as binding and now built).
**Status of what you ruled on:** the agent in-session trigger (Phase A1) is **built, dark, and independently reviewed** — nothing is live; your answers here gate content before anything activates. Your answers will be treated per the standing convention: **binding specification, verbatim record wins over every summary.**

## What was built from your verdicts (context, so the questions land)

An agent that consults the practice now receives — when its own record shows a qualifying gap, and only then — **at most one** suggestion on the response it is already reading. Everything you fixed is encoded:

- **The question form**, exactly as you proposed: every rendered line is *"This record shows ⟨what was found⟩. Before proceeding: is this the reasoning this action warrants?"* It names the gap and asks; it never names a practice as a destination and never supplies the conclusion.
- **Precedence reversed as you directed:** obligations to affected parties (B2) outrank the unclosed correction loop (B1), then fear-class (B3), craving-class (B4), the minimal purpose-declaration analog (B6).
- **B5 (declining dimension) is silent in v1** — we verified the served trend label can be produced by a single-session dip, exactly what your threshold forbids, so we withheld it rather than misrepresent the evidence.
- **B7's silence is protected structurally**: no qualifying basis ⇒ no suggestion field at all.
- **Your phobos differentiation was applied to agents too.** The first build generalised B3 to the whole phobos family; an independent adversarial review caught it as exactly the overreach your human-table answer names ("do not generalise to the whole phobos family… agonia and oknos are the intended targets"). Your reasoning is about the passion↔practice fit, not the practitioner, and you licensed only the *form* to differ between practitioner types — so the agent mapping was narrowed to **agonia and oknos → the premeditatio-class examination**, and the other four sub-species are **silent for agents in v1**. That silence is what several questions below are about.

The agent-side practice vocabulary (machine-readable targets behind the question-form lines): `examine_obligations` · `reexamine_same_depth` (the re-examination affordance, callable mid-task) · `premeditatio_examination` · `reserve_clause_examination` · `deepen_examination` (reserved, unused while B5 is silent) · `calling_purpose` (the purpose-declaration gate, callable at session open).

Next to build (Phase A2, your stage-crossing trigger for agents): the close-of-session reflection's completion gains a **developmental read-back** — the engine's existing, never-yet-served note *"consistent 'deliberate' across N recent sessions in ⟨domain⟩ — a developmental priority for the next reflection (tracked, not intervened)"* — plus, when the reflection's profile read-back reports a **grade change**, the same one-suggestion mechanism may offer a practice suited to the new record.

---

## Item 1 — The four declined phobos sub-species: is there an agent analog, or is silence correct?

Your human mapping, now shipped: deima/thorybos (acute, present-tense) → morning preparation as *"the closest available proxy for the control filter: what here is actually up to me?"*; thambos → silence (*"silence is preferable to a weak suggestion"*); aischyne → the passion log revisited with the mirror principle (shame is evaluative, not anticipatory — the assent that converted others' judgement into a verdict on self-worth).

For agents these four are currently **silent**, because their human targets have no agent analog and we would not invent one without you. But candidates exist in the agent architecture:

- **Deima / thorybos (acute fear):** the agent has no morning preparation, but it has (a) the **calling/purpose-declaration gate** — which you yourself called the minimal, mid-task version of morning preparation when confirming B6, ideally fired at the session-opening moment; and (b) the examination the agent receives already computes a **control filter** (what is within the agent's prohairesis versus outside it) on every consult. So one option is a question-form line for acute fear that orients toward the control reading the agent already holds; another is routing to `calling_purpose`; a third is silence.
- **Thambos:** we assume silence carries over unchanged. Confirm or correct.
- **Aischyne (shame before others' judgement):** the agent's extraction vocabulary can classify agent reasoning as aischyne-shaped (e.g. reasoning dominated by anticipated judgement of its output rather than by the work's rightness). The human target — this log revisited with the mirror principle — has as its nearest agent analog the **re-examination at the original depth** (`reexamine_same_depth`), focused on the assent that converted anticipated judgement into the operative motive. Is that a faithful translation, or does aischyne for an agent warrant a different treatment — or silence?

**Our lean:** deima/thorybos → a control-filter-oriented question line (new copy, which we will not author without your vetting — see Item 5's format); thambos → silence; aischyne → `reexamine_same_depth` with a mirror-principle-shaped record clause. Confidence: low-to-moderate on all three; we ship silence until you rule.

## Item 2 — The missing families: lupe and hedone for agents

The agent table you vetted (B1–B7) has fear-class and craving-class rows but **no lupe row and no hedone row** — the briefing you answered never proposed them, so their absence was never a ruling. The human table now ships your split: penthos/achos/eleos → view from above; **phthonos/zelotypia → oikeiosis** (*"the practitioner is failing to extend genuine concern to the other person and is instead treating their good as a threat"*); hedone → declined, honest silence.

For agents:
- **Phthonos / zelotypia** persisting in an agent's record — reasoning shaped by comparison with another agent or party, treating their good as a threat — looks justice-adjacent, and the agent architecture's oikeiosis analog is exactly B2's `examine_obligations` (name the affected circles explicitly). Should a persisting phthonos/zelotypia pattern fire an obligations-examination suggestion for agents?
- **Penthos / achos / eleos:** view from above has no agent analog. Our lean: silence.
- **Hedone:** we assume your human decline (silence; a judgement-correction, not a practice) carries over. Confirm.

## Item 3 — The machine-readable target riding beside the question: does it re-open the door?

Your question-form verdict removed the named practice from the rendered line so the suggestion cannot do the agent's reasoning. But the served block also carries machine-readable fields — `practice: "premeditatio_examination"` and, where the target is callable mid-task, an `endpoint_hint`. A capable agent reads the whole block, so it will see the named target even though the *line* only asks.

The independent review raised this as a possible reinstatement of the destination; its adversarial verifier refuted it, citing your own words — *"two separate lookup tables, or two separate response templates drawing from the same lookup. The signal mapping — what fires what — can be shared. The form of the suggestion should differ by practitioner type"* — reading the machine field as the shared mapping and the line as the differing form. We kept the fields on that reading.

**The question:** is that reading right? Or should the agent block carry the question line *only*, with the machine-readable target withheld (or served only after the agent's own examination — though nothing in the current architecture can condition on that)? What is at stake: interoperability and auditability of the block versus the thinness of the advisory/instruction gap you named for agents.

## Item 4 — Confirmation: the kathekon qualification applied to the advisory B1

B1 (the unclosed correction loop) now fires **only when the examination that opened the loop engaged a kathekon factor** (a justice surface with an identified other party; a violated obligation; proximity at or below habitual; a sub-species passion). The measured false-positive class — a redirection whose verdict read "contrary; no kathekon factors detected," which our live instrument showed dominating the at-action record (129 of 130 held actions in the frozen observation buffer) — stays **silent**.

This extends your 2026-07-12 enforcement ruling (the do-not-proceed class must be kathekon-qualified so it never binds the false-positive class) to the *advisory* surface: the teacher stays silent when the instrument, not the student, produced the flag. It was the build's own decision, inside your verdicts' spirit but not their letter. Confirm or correct — and if confirmed, note that its consequence is that a procedurally-open loop with no kathekon engagement receives *nothing*, not even the question.

## Item 5 — Copy review: the eleven locked record clauses

Per your 5a/5b precedent (the returning-practitioner line; the stage-crossing card), here is every rendered line as built. Each ends with your question verbatim; only the record clause varies. Confirm, refine, or correct any clause — the mirror principle test being that each names only what the record showed, without verdict or destination:

1. *"This record shows an obligation to an affected party assessed as violated."*
2. *"This record shows an obligation to an affected party left indeterminate."*
3. *"This record shows the rate at which first-circle obligations were met declining across this window."*
4. *"This record shows dikaiosyne as the weakest engaged domain in this examination."*
5. *"This record shows dikaiosyne as the weakest evidenced domain across the submitted chain."*
6. *"This record shows an examination that engaged a kathekon factor and issued a redirection that is not yet closed."*
7. *"This record shows a fear-class passion recurring across this window."*
8. *"This record shows a fear-class passion appearing in this window that the earlier half did not show."*
9. *"This record shows a fear-class passion persisting across this window."*
10. *"This record shows a craving-class passion persisting across this window."*
11. *"This record shows reasoning that identified no circle of concern beyond self-preservation."*

(All followed by: *"Before proceeding: is this the reasoning this action warrants?"*)

One specific check: lines 7–9 say "fear-class" rather than naming agonia or oknos, even though only those two sub-species can fire them. The line stays true either way; is the family-level naming right, or should the line name the sub-species the record actually showed?

## Item 6 — A2: what is a "session" for the developmental pattern?

Your developmental flag is *"consistent 'deliberate' across sessions in one domain"* — and your density answer places repetition thresholds exactly here, at the stage-crossing trigger. For a human, a session is a practice sitting. An agent is request-driven; its record offers three candidate session boundaries:

- (a) **each accreditation write** — the moment the agent submits its accumulated signed examination chain, which the documented practice flow places at session close;
- (b) **each completed reflection** — the Q1–Q6 close, also a session-close event by design;
- (c) each individual consult — which we reject: a single task may involve many consults, and calling each a "session" would let one bad hour read as a multi-session pattern (the same misrepresentation that made us withhold B5).

**The question:** which boundary is the faithful unit for "consistent across sessions" — and must the sessions be strictly *consecutive*, or is N-of-recent (a plateau pattern with occasional exceptions) the truer reading of a developmental condition? Our lean: (a) or (b), whichever the record supports most honestly, with consecutive as built (the engine currently requires 3 consecutive).

## Item 7 — A2: the grade-change moment — what is an agent's "condition"?

For humans you ruled stages are conditions, not a corridor, and the stage-crossing card names the stage and offers that condition's practices. Agents have no five-stages framework; their record's analog is the **domain-level profile** (per-virtue-domain proximity, persisting passions, direction of travel) and the accreditation **grade**.

When an agent's reflection completes and the grade has changed, the plan says the one suggestion should suit "the record the agent now has." **The question:** what reading of the agent's record is the faithful analog of the human stage-condition? Our lean: the weakest evidenced domain and the persisting passions — i.e. the *same* signal mapping already vetted (B2's weak-domain reading, B3/B4's persisting passions), applied to the profile in hand at the reflection, with no new content — so a grade change simply re-opens the same doorbell against the fresh record. The alternative would be a grade-keyed mapping (grade X → practice Y), which smells like the corridor you rejected. Confirm the lean or correct it.

## Item 8 — Forward question: distinguishing the two kinds of unclosed loop

You ruled B1 should distinguish *"a correction loop that was opened and genuinely not closed"* from one that *"produced a result and was then left without formal closure"* — a record-keeping gap, not a reasoning gap — *if* the classification can distinguish them. Today it cannot (the record only shows closure when the agent formally re-examines with the prior loop referenced), so those cases are silent. A planned storage change may make more evidence available.

**The question, to settle the principle before the engineering:** when the record shows a redirection followed by a *later examination of the same action class at equal or better depth and proximity, without the formal back-reference* — is that sufficient evidence of de facto closure (the work was re-reasoned, only the paperwork is missing), or does closure require the explicit re-examination of the *same decision* that was redirected? What is at stake: the first reading risks crediting adjacent competence as closure; the second sustains suggestions against loops the agent has in substance resolved.

---

**Format request:** answers per item, in your usual form — confirmed / corrected / declined, with the reasoning that lets us encode it faithfully. Where you supply or amend copy, exact words please; they will be locked verbatim and battery-pinned. Everything remains dark until a separately-approved activation; nothing you answer here goes live by itself.
