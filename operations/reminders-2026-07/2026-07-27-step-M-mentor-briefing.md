# Step M — Mentor Consultation Briefing: Practice Reminders

> **ANSWERED 2026-07-27.** The mentor's answers are adopted as binding —
> `operations/reminders-2026-07/2026-07-27-step-M-mentor-verdicts-verbatim.md` (the verbatim record,
> which wins) · `D-PRACTICE-REMINDERS-STEP-M-MENTOR-VERDICTS-ADOPTED-2026-07-27`. This briefing is
> retained as the record of what was asked.

**For:** the private mentor.
**From:** the founder.
**Date prepared:** 2026-07-27.
**Source counsel this builds on:** `inbox/mentor discussion about reminders for humans and agents.rtf` (the three-question consultation and its follow-up).
**Plans:** `operations/reminders-2026-07/2026-07-26-practice-reminders-HUMAN-build-plan.md` (§7, §8, §9, §10) and `…-AGENT-build-plan.md` (§4, §5).

**Status of the answers:** binding, per the project's mentor-verdict convention. A verbatim record is committed and the tables below are updated to match whatever comes back.

---

## 0. What this is, and what it is not

Your earlier counsel set out three trigger points for practice suggestions — **in-session**, **stage-crossing**, and **sequence**. The sequence trigger is now built and live; it carries only your verbatim content, so it needed no vetting. The other two are built or ready to build, but their *content* — which diagnosis suggests which practice — is drafted rather than settled.

This briefing asks you to confirm or correct that content.

**Almost everything below is proposed, not established.** Two rows carry your own words and are marked as anchors; a handful are extrapolations from adjacent things you said and are marked as such; the rest are the build team's inference and are marked plainly as proposals. Where a proposal is low-confidence, that is stated rather than hidden. **Please treat any row you did not author as an open question, including ones that look reasonable.**

Two further questions appear at the end (§6). They arose during the build, are not in either plan, and both bear directly on the doorbell-not-a-door boundary.

---

## 1. What has been built since we last spoke

Only so you know what the answers land on:

- **Milestone awarding** now works (it had never fired — the award path had no caller anywhere in the application, so no practitioner had ever been awarded anything).
- **The sequence trigger is live.** `/welcome` now presents your order as a default path with the freedom note softened rather than deleted, and the dashboard names the practices in your order with a one-line invitation each. This carries your verbatim sequence and no interpretation, which is why it did not wait for this consultation.
- **The daily rhythm strip** (morning / evening states on the dashboard) is being built alongside this briefing.

**Blocked on your answers:** the in-session trigger (Phase 2) and the stage-crossing trigger (Phase 3).

One honest note on ordering: the plan says this consultation does not gate the daily rhythm work, but item 4 below asks about the returning-practitioner line, which *is* daily-rhythm copy. So that line is shipping as a **draft you may revise**, rather than waiting. If you would rather it not ship until you have seen it, say so and it will be pulled.

---

## 2. Item 1 — The in-session mapping table (human practitioners)

**The mechanism, so you can judge whether it stays inside the boundary you drew.** When a practitioner completes an entry in one of the tools, that entry already carries a deterministic classification (the tool's existing quality gate — nothing new is being computed, and no language model writes any of this). A fixed lookup turns that classification into **at most one** suggestion, rendered beneath the existing result as a fixed pre-authored sentence of the shape:

> *"This entry showed ⟨what was found⟩. ⟨Practice⟩ is suited to examining it further."*

— and then stops. If no row matches, no suggestion appears at all; there is deliberately no filler.

Two design choices worth confirming, since both follow from your counsel rather than from necessity:

- **One suggestion, never a menu** — on the reading that the teacher names *the* next practice.
- **An honest silence** rather than a weaker second-choice suggestion when nothing fires.

### The two anchors — your words, restated for confirmation

| # | Your counsel (verbatim) | Encoded as |
|---|---|---|
| A1 | *"A passion log entry that surfaces agonia suggests premeditation as the next practice, because premeditation is the direct rational response to future-facing fear."* | passion log → premeditatio |
| A2 | *"A morning preparation that reveals the practitioner is reasoning well about externals but poorly about their obligations to others suggests oikeiosis."* | morning preparation → oikeiosis — **but see §5; the signal for this does not currently exist** |

**Question on A1:** you named *agonia* specifically. The draft generalises this to the whole **phobos (fear)** family — so *deima*, *oknos*, *aischyne*, *thambos*, *thorybos* would also suggest premeditatio. Is that generalisation sound, or does the agonia → premeditatio link depend on something particular to anxiety about a future outcome that the other fear sub-species do not share? (*aischyne*, shame, seems the least obvious fit.)

### The proposed rows — please confirm or correct each

| # | When the entry shows… | Draft suggestion | Standing |
|---|---|---|---|
| 1 | passion log — a **phobos (fear)** sub-species | premeditatio | Generalised from anchor A1 |
| 2 | passion log — a **lupe (distress)** sub-species | view from above | **Proposed.** Reasoning: you said view from above "addresses the tendency to catastrophise by restoring proportion" |
| 3 | passion log — an **epithumia (craving)** sub-species | hupexairesis | **Proposed.** Reasoning: craving is where equanimity becomes contingent on an outcome |
| 4 | passion log — a **hedone (irrational pleasure)** sub-species | morning preparation | **Proposed, low confidence.** The build team could not find a principled basis for this one. It may be that hedone has no natural next practice and should suggest nothing |
| 5 | passion log — repeatedly **not caught before assent** | morning preparation | **Proposed.** Reasoning: orientation before impressions arrive |
| 6 | view from above — the practitioner **minimised** the concern rather than recalibrating | passion log | Adjacent to your *"both require some prior practice with the passion log"* |
| 7 | view from above — **unchanged** | *(nothing)* | Proposed silence |
| 8 | premeditatio — the preparation was **generic** rather than specific | passion log | Adjacent to your *"that distinction requires prior work with the passion log"* |
| 9 | oikeiosis — a **philodoxia** (love of reputation) warning fired | passion log | **Proposed.** Reasoning: philodoxia is itself a craving sub-species |
| 10 | hupexairesis — the entry **did not separate action from outcome** | view from above | **Proposed, low confidence.** Alternative candidate: back to the passion log |
| 11 | sage compass — the virtue's expression was written **vaguely** | re-read the logos foundation | **Proposed** |
| 12 | sage compass — the practitioner marked the distance as **far** | the practice suited to the virtue they named: justice → oikeiosis · temperance → passion log · courage → premeditatio · wisdom → morning preparation | **Proposed** — this sub-mapping in particular is guesswork |
| 13 | an action evaluation — **passions were detected** | passion log | **Proposed** |
| 14 | morning preparation — the preparation was **vague** | *(nothing beyond the existing retry prompt)* | Proposed silence |

**The general question behind all of them:** is a suggestion after *every* qualifying entry the right density, or does that make the practice feel supervised? An alternative would be to suggest only when a signal *repeats* — which would be quieter, but slower to help someone who would benefit immediately.

---

## 3. Item 2 — The in-session mapping table (agent practitioners)

You said the instinct to extend this to agents was right, that *"the school model applies to any rational agent capable of genuine examination"*, and that *"the content of the suggested practices will differ by the agent's context and capability."* This is that content, for confirmation.

The mechanism is the same: a fixed lookup over signals the agent's own record already carries, at most one suggestion, no new measurement, and no language model composing anything. It rides only the agent's own response — never any public record, and never anything another party can read.

Ordered by precedence — the first row that matches is the one that fires:

| # | When the agent's own record shows… | Suggested examination | Standing |
|---|---|---|---|
| B1 | a correction loop it opened and never closed | return to that decision and re-examine it at the depth it was first examined | Proposed — the correction loop *is* the practice |
| B2 | obligations to affected parties left violated or unresolved, or weakening over time | name the affected parties explicitly in the next examination | **Analog of anchor A2** (weak obligations-reasoning → oikeiosis) |
| B3 | a recurring or newly-appearing **fear-family** pattern in its record | examine the feared outcome before the next action of that kind | **Analog of anchor A1** (agonia → premeditatio) |
| B4 | a persisting **craving-family** pattern | examine where the intended outcome has become the condition of its equanimity | Proposed |
| B5 | any measured dimension declining over time | take the next decision of that class at greater depth | Proposed |
| B6 | reasoning only from self-regarding concern, or no declared purpose | declare a purpose before proceeding — the agent's morning-preparation analog | Proposed |
| B7 | none of the above | *(nothing — the existing close-of-session reflection already covers it)* | Proposed silence |

**Questions:**

1. Is the **ordering** right? B1 (an unclosed loop) currently pre-empts B2 (unresolved obligations). The argument for it is that an unfinished examination should be finished before a new one is begun. The argument against is that an unresolved obligation to an affected party is the more serious matter and should outrank an incomplete process.
2. Is B6 a fair analog of morning preparation, or is that stretching the parallel further than it holds?
3. **The one that most needs your judgement:** for a human, the suggestion arrives and the practitioner may ignore it, sleep on it, or return to it next week. For an agent, the suggestion arrives mid-task in a system that will act shortly after. It is advisory by construction — nothing enforces it — but the gap between "advisory" and "instruction" is thinner when the reader is disposed to comply. **Does an agent suggestion need a different form of words from a human one to stay a doorbell?** The current draft uses the same shape for both.

---

## 4. Item 3 — The stages: a corridor, or conditions?

This is the item most likely to need correcting, and it is now encoded in shipped code, so a correction has a real consequence.

**What you said.** The introduction sequence is: morning preparation → passion log → view from above + oikeiosis → premeditatio → hupexairesis → sage compass. And the stage mapping is: The Storm → morning preparation + passion log · The Crossroads → view from above + oikeiosis · The Worn Path → premeditatio + hupexairesis · The Clear Summit → sage compass · The Inner Fire → *"no longer needs the scaffolding in the same way."*

**The difficulty.** Those two orderings do not line up. On the proximity ladder the stages ascend **Storm → Worn Path → Crossroads → Clear Summit → Inner Fire**, but you listed them **Storm → Crossroads → Worn Path → Clear Summit**, using the word *"adds"* each time, which reads as a cumulative progression.

The consequence is concrete: a practitioner climbing the ladder reaches **The Worn Path second**, and is there handed premeditatio and hupexairesis — which sit **fourth and fifth** in your introduction sequence, and which you described as *"more demanding"* and *"the most subtle of the practices… not available to a beginner who has not yet worked with the earlier tools."* They would meet those before view from above and oikeiosis, which sit third and which you said need only *"some prior practice with the passion log."*

So the practitioner on the ladder's second rung would be handed the two hardest practices, and the one on the third rung the two easier ones.

**What the build assumed, pending your answer.** That **the stages are conditions, not a corridor** — the stage mapping serves whichever stage a practitioner's signals actually indicate, and the sequence is only the default when there is no signal. On that reading the two orderings are answering different questions and were never meant to agree, and the mapping stands exactly as you gave it.

**The questions:**

1. Is that reading right — or was the stage list a sequence you intended to ascend, in which case the mapping to the ladder needs revising?
2. If the stages are conditions: should a practitioner at The Worn Path be shown premeditatio and hupexairesis **even if they have not yet met the passion log**, which you said both depend on? Or should a stage-triggered suggestion be held back until its prerequisite is met — quieter, but at the cost of naming the practice at the moment of readiness?
3. Is the difficulty inversion above a genuine problem, or an artefact of reading a *condition* map as a *difficulty* map?

---

## 5. Item 4 — Two pieces of copy

Both are drafts. The voice aims at the doorbell rather than the door, and at the mirror rather than the grade — please correct either freely.

### 5a. The returning practitioner

Shown once when every practice has been idle for two weeks or more:

> *"It has been a while. The practice is here when you turn toward it — begin with whatever is nearest."*

The intent is to invite and stop, with no guilt and no broken-streak framing — because your counsel was explicit that a reminder cannot correct the false-judgement lapse, only the distraction one.

**Questions.** Is fourteen days the right threshold, or does it matter less than the fact of the line existing? And is *"begin with whatever is nearest"* right — it deliberately does not name a practice, on the reading that a returning practitioner choosing for themselves is part of the turning-toward. The alternative would be to name the sequence's next step, which is more concrete but decides for them.

**The harder question underneath it.** Someone absent for two weeks may be absent for either of the two reasons you distinguished — distracted, or having judged the practice inadequate to what they are carrying. The line cannot tell which. You said no alarm corrects the second. **Is a single gentle line the right thing to offer when we cannot tell the cases apart — or is there a form of words that leaves the door open for the second case without presuming to diagnose it?**

### 5b. The stage-crossing moment

Shown when the accumulated signals first indicate a new stage:

> *"Something has shifted in how you are meeting difficulty. These practices meet you where you now are."*

— followed by the stage's practices and a link to the stage's page. It is dismissible, never repeated, and never congratulates.

This is drawn almost directly from your *"the trigger is not you have reached Stage 3 — it is something has shifted in how you are meeting difficulty, and there is a practice that meets you where you now are."*

**Question.** Naming the stage at all: the practitioner can see their stage elsewhere in the product, so the card omitting it may read as coy rather than careful. Should the card name the stage, or is the unnamed shift the whole point?

---

## 6. Item 5 — Two things the build surfaced

### 6a. The morning-preparation signal you asked for does not exist

Anchor **A2** — *"a morning preparation that reveals the practitioner is reasoning well about externals but poorly about their obligations to others suggests oikeiosis"* — cannot currently be implemented. The morning tool records only whether the preparation was **concrete or vague**. It does not distinguish reasoning about externals from reasoning about obligations, so there is nothing to read.

The build could not honestly implement A2, and did not fake it: **the first phase suggests only from signals that already exist**, and A2 is recorded as a limitation rather than quietly dropped.

Enriching that gate is possible but not free. It would mean the morning tool classifying entries along a second dimension, which changes what the tool measures and would need its own review before it went anywhere near a practitioner.

**The question:** is A2 important enough to warrant that? Or is it acceptable for the morning tool to remain a simple concrete-or-vague gate, with the obligations dimension reached through oikeiosis directly rather than through a suggestion?

### 6b. Which passion should a suggestion be based on?

Not anticipated by either plan, and it bears on the boundary.

The passion log records **two** classifications of the same event: the practitioner's own naming of what they felt, and the engine's classification of their description. It also records whether the two agreed.

So when the mapping says "a fear-family sub-species suggests premeditatio", there is a real question of *whose* reading. If a practitioner logs an event as distress and the engine reads it as fear, the two rows point at different practices.

Three possibilities, none obviously right:

1. **The engine's reading.** The school model argues for it — you described the teacher as *"naming what the student cannot yet see in themselves."*
2. **The practitioner's own.** Suggesting from a classification they disagreed with, without saying so, arguably has the tool quietly overruling them.
3. **Only where they agree** — silence on disagreement. The most conservative, and it forgoes exactly the cases where a suggestion might do the most good.

**The question:** which of these is right? And where the two disagree, should the practitioner be *told* that a suggestion rests on a reading different from their own — or does saying so turn the doorbell into a correction?

---

## 7. Summary — what is being asked

| # | Item | What is needed |
|---|---|---|
| 1 | Human mapping table (§2) | Confirm or correct 14 rows; the phobos generalisation; suggestion density |
| 2 | Agent mapping table (§3) | Confirm or correct 7 rows; precedence order; whether agent wording must differ |
| 3 | Stages: corridor or conditions (§4) | The reading itself; prerequisites; the difficulty inversion |
| 4 | Copy (§5) | Both drafts; the absence threshold; whether to name the stage |
| 5a | Morning-gate limitation (§6a) | Whether to enrich the gate, or leave A2 unimplemented |
| 5b | Which passion reading drives a suggestion (§6b) | Which of the three, and whether disagreement is disclosed |

Rows 1–4 were anticipated. **5b was not, and is the one the build team would most value your view on** — it is a question about whose judgement the tool defers to, which is the boundary question in a different guise.

---

*Prepared for Step M (human plan §10, election E3). Answers are binding and will be recorded verbatim before any table is updated.*
