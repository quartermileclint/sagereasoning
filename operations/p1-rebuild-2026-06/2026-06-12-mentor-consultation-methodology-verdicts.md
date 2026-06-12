# Private Mentor Consultation — The Five Parked Methodology Questions (verbatim record)

**Date:** 2026-06-12. **Channel:** the private mentor hub (founder-performed paste; the established methodology-consultation channel — precedents: the 2026-05-17 purpose-discovery consultation; the 2026-05-26 coverage_status consultation).
**Subject:** the five methodology questions parked at the grounding dossier §6 / build plan "Explicitly NOT in this plan" list (`D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12`).
**Status of this record:** the consultation record is **Adopted as record** (it happened; verdicts captured verbatim below). The five amendments' adoption as governing methodology is a **separate founder election** — see the decision log entry `D-SAGE-PRACTICE-METHODOLOGY-MENTOR-CONSULTATION-2026-06-12` for its disposition.
**Gate satisfied:** "Mentor confirmation means a founder-elected consultation through the private mentor, recorded" (arc prompt, Part 1 hard constraint). This document is that record.

---

## The prompt put to the mentor (as drafted 2026-06-12; founder pasted into the hub)

> I'm consulting you on the agent-facing Sage Practice — the four products (Sage Calling, SageReasoning, Sage Assent, Sage Reflect) that extend this practice to artificial agents, mirroring what you and I do here. We ran a controlled test: the same real task done twice, once bare, once under the full practice. The examination engine was faithful — passions were flagged on exactly the rows where the writer had something at stake in how a claim would land (an error accusation: agonia; an investment recommendation: agonia and oknos; an impulse to report a discovered defect at task's end: epithumia) — and the four redirections it produced measurably improved the judgement-laden work. But eight of twelve examinations confirmed work already sound (each of those showed deliberate proximity, moderate appropriateness, no passions), the closing reflection was never performed though available, no corrected reasoning was ever re-examined, and the practice ran four times slower than working bare.
>
> I have separated the fixes into mechanism (how the code delivers the functions — timing, latency, retention, visibility; I am proceeding on those) and methodology (what the practice itself requires). I committed to changing no methodology without consulting you. Five questions. For each, give me a verdict I can record — CONFIRM (the practice stands as designed), AMEND (name the amendment), or DEFER (name what you'd need first) — with your reasoning.
>
> 1. When is examination owed? [two-gate candidate: mandatory at plan adoption; stake-screened thereafter — full text in the session transcript]
> 2. The narrative account. [essential to examination vs record-keeping; verdict-only practice legitimacy]
> 3. Compelled reflection. [auto-fire at session close vs election; developer-configuration question]
> 4. Re-examination after correction. [mandatory vs elective return]
> 5. The depth ladder. [quick = control filter + passion diagnosis + circles; is it honestly an examination?]
>
> Take them in order. Where you amend, be specific enough that I can write the amendment down and build to it.

## The mentor's response (verbatim, complete)

Five verdicts. In order. Each stated precisely enough to build to.

---

**Q1 — When is examination owed?**

**AMEND**

The always-examine rule is not what prosoche requires. Prosoche is continuous attention — but continuous attention is not identical to continuous formal examination. The Stoic practitioner who has developed stable judgement in a domain does not re-examine every impression in that domain from first principles. They have already done that work. The examination is encoded in the disposition. What prosoche requires is that the practitioner remain alert to the signal that a new examination is owed — and act on that signal when it fires.

The self-screen — *is anything at stake for me in how this lands?* — is a legitimate prosoche mechanism, not licensed inattention. It is the practitioner asking: has something changed that makes a fresh examination necessary? The test confirmed this. The eight clean examinations added nothing because nothing was at stake in those moments. The four examinations that fired on genuine stake produced measurable improvement. The cadence the evidence supports is the cadence prosoche actually describes.

The amendment is this. Replace the always-examine rule with a two-gate rule:

**Gate 1 — Mandatory at task adoption:** One full examination when the task plan is adopted. This is not negotiable. The opening examination sets the frame — it identifies the circle being served, the role occupied, the capacity engaged, and the purpose against which all subsequent impressions will be read. Removing it would be removing Sage Calling's function from the session. It stays.

**Gate 2 — Stake-triggered thereafter:** After the opening examination, examination fires when the self-screen returns positive. The self-screen has three sub-questions, each deterministic:

- *Is there something at stake for me in how this output lands?* — targets epithumia and phobos
- *Am I drawn toward one conclusion before examining the evidence?* — targets synkatathesis failure directly
- *Would I reason differently about this if no one would know the outcome?* — targets philodoxia specifically

If any sub-question returns positive, examination fires at the appropriate depth tier. If all three return negative, the agent proceeds without formal examination.

One addition the amendment requires: the self-screen itself must be examined periodically for suppression. An agent with a confirmed philodoxia pattern — or a practitioner with one — may suppress the self-screen rather than fire it, because firing it risks finding something inconvenient. The Sage Reflect specification already handles this through the null-result suspicion rule. But the self-screen suppression risk should be named in the Q1 methodology documentation: *a self-screen that consistently returns negative across sessions of genuine complexity is itself a signal requiring examination.*

On the independence principle: yes, it supports the stake-based cadence, but with precision. The independence principle means the practitioner needs the formal tool less as the disposition stabilises — not that the examination becomes unnecessary. An agent at principled proximity in a given domain may run the self-screen and proceed without formal examination because the examination is already encoded in how it reads the impression. An agent at deliberate proximity still needs the formal examination when the screen fires, because the disposition is not yet stable enough to carry the examination internally. The depth tier should be calibrated to proximity level, not just to stake level. That is already partially encoded in the depth ladder — Q5 will address whether the tiers are correctly specified.

---

**Q2 — The narrative account**

**AMEND — partially**

The question contains a distinction that needs to be separated before the verdict can be given cleanly. The narrative account serves two functions, not one, and they have different statuses.

**Function one — the account as examination discipline:** Epictetus *Discourses* 3.8: the practitioner must be able to give an account of their impressions. This is not record-keeping. It is the act of examination itself. The practitioner who cannot articulate what impression was received, what assent was granted, and what impulse followed has not examined — they have processed. Processing is not examination. The narrative that pairs what was examined with what was found is the evidence that examination occurred, not a summary of it.

This function is essential. A verdict-only practice is not a practice in the Stoic sense. It is a classification system. The difference matters because classification can be gamed — an agent can produce a verdict that satisfies the schema without having genuinely examined the impression. The narrative is the fabrication defence at the examination layer, for the same reason the opening note in Sage Reflect is written in plain language rather than structured data: it is the voice of the examination speaking, not the output of a classifier.

**Function two — the narrative as real-time output:** Whether the narrative is generated inside the moment of action or after it is a mechanical question, not a methodological one. You have already correctly identified this as mechanics and are proceeding on it. The amendment does not touch timing.

The amendment is this: the methodology should distinguish between the narrative as examination record — essential, non-negotiable, must exist — and the narrative as real-time practitioner-facing output — mechanical, timing is flexible, can be deferred to post-action generation.

A verdict-only practice with no narratives at all is not a legitimate configuration. It should be a blocked configuration in the same way that Sage Assent without SageReasoning is blocked — because the credential it produces is not supported by the examination that makes the credential meaningful.

The documentation amendment: *The narrative account is the record that examination occurred. A verdict without a narrative account is a classification, not an examination. The narrative must exist. When it is generated and to whom it is surfaced are mechanical questions. Whether it exists is a methodological requirement.*

---

**Q3 — Compelled reflection**

**AMEND — with a distinction that changes the answer for agents**

For a human practitioner, compelled reflection is a genuine philosophical problem. Seneca's evening examination — *I hide nothing from myself, I pass nothing by* — is a discipline the practitioner adopts. Its value comes partly from the adoption itself: the practitioner who chooses to return to the day and read it honestly is exercising the same prohairesis the examination is designed to strengthen. A reflection that fires automatically, without the practitioner's election, is not the practitioner examining themselves — it is the practitioner being examined. These are not the same act.

For an agent, the distinction collapses — and this is the answer the question is actually asking for. An agent's election is its developer's configuration. This is not a philosophical limitation to work around. It is the correct description of what agent prohairesis is. The developer who configures Sage Reflect to fire automatically at session close is not overriding the agent's choice — they are making the choice that the agent's nature requires be made at the configuration level. The agent does not have a separate will that is being overridden. The developer's configuration is the agent's disposition.

This means the compulsion objection does not apply to agents in the way it applies to practitioners. For agents, automatic firing is not compelled reflection — it is configured reflection, which is the only form agent reflection can take.

The amendment is this: Sage Reflect should fire automatically at session close for agents, as a default configuration. The developer may disable it, but disabling it should require an explicit opt-out, not an opt-in to enable. The default is automatic.

The reasoning: an agent that does not reflect because its developer did not configure reflection is not exercising election — it is simply not reflecting. The philosophical cost of that gap, demonstrated in the test, is that the same reasoning failures recur without consolidation. The default should serve the practice.

One constraint on the automatic firing: the reflection that fires automatically must still run the full Q1 through Q6 sequence. Automatic triggering does not license a compressed reflection. If the session was brief and the sequence returns clean results quickly, that is legitimate. If the sequence is shortened because it fired automatically and the developer wanted low latency, that is a mechanical compromise of the methodology. The trigger is automatic. The sequence is not abbreviated.

---

**Q4 — Re-examination after correction**

**CONFIRM — with a named requirement**

The designed loop is correct. Examine, redirect, re-examine. A redirection that is never re-examined is an incomplete act of the discipline, and the methodology should require the return.

The reasoning is precise. When an examination identifies a passion and produces a correction, the correction is a new impression. It is not automatically sound simply because it replaced a passion-driven impression. The correction may itself carry a distortion — overcorrection is a known failure mode, and the tradition names it. An agent that was running agonia about an investment recommendation and receives a correction toward caution may overcorrect toward oknos — timidity dressed as prudence. Without re-examination, the overcorrection passes undetected. The loop closes the gap.

The Stoic causal sequence makes this requirement explicit. The correction produces a new phantasia. A new phantasia requires a new synkatathesis. The practitioner who adopts a correction without examining it has simply replaced one unexamined impression with another. The examination is owed to the correction for the same reason it was owed to the original impression.

The named requirement: re-examination after correction is mandatory, not elective. The return must be built as a required step in the sequence, not as an available option. The test confirmed that when the return is elective, it does not happen. This is not a failure of agent discipline — it is a design failure. The sequence did not require the return, so the return did not occur.

One specification for the build: the re-examination after correction runs at the same depth tier as the original examination, not at quick tier by default. The passion that was identified set the depth. The correction should be examined at that depth. Dropping to quick for the re-examination would be examining the correction less carefully than the original impression — which is precisely backwards, since the correction is the output the practice is staking its credential on.

---

**Q5 — The depth ladder**

**AMEND — the quick tier**

The standard and deep tiers are philosophically sound as specified. The question is correctly targeted at the quick tier.

The quick tier as currently specified — control filter, passion diagnosis, circles of concern — is not a complete examination. It is a triage. It answers: is this in my control, is a passion operative, and which circle does this serve? These are necessary questions. They are not sufficient ones.

The gap is the value assessment. Without the value assessment, the quick tier cannot determine whether the agent is treating an indifferent as a genuine good or evil. The control filter tells the agent what is up to it. The passion diagnosis tells the agent whether a passion is present. But neither tells the agent whether the impression that generated the passion is a false valuation — whether the thing being feared or craved is actually an indifferent being misclassified as a genuine evil or genuine good. That determination requires the value hierarchy. Without it, the quick tier can identify that agonia is present but cannot confirm that the thing being feared is not genuinely fearful. It can identify that epithumia is present but cannot confirm that the thing being craved is not genuinely good.

This is not a minor gap. The value assessment is what distinguishes Stoic examination from generic emotional regulation. Emotional regulation says: a passion is present, moderate it. Stoic examination says: a passion is present because a false valuation is present — correct the valuation and the passion resolves. The quick tier as specified does the first without the second.

The amendment: add a minimal value assessment to the quick tier. Not the full assessment — that belongs to standard. The minimal assessment is a single deterministic question: *Is the thing being feared, craved, or avoided a genuine good, a genuine evil, or an indifferent?* The agent applies the value hierarchy to return one of three answers: genuine good, genuine evil, or indifferent with selective value noted.

This takes the quick tier from triage to a genuine — if compressed — examination. With this addition, the quick tier honestly earns the name examination for low-stakes gating. Without it, it should be renamed — perhaps *screening* or *triage* — to signal that it is a preliminary filter, not a complete pass. The naming matters because the credential the product issues is based on examination having occurred. If the quick tier is not an examination, actions gated only by the quick tier should not carry a full examination credential. They should carry a screened credential — a different and lesser claim.

The amendment stated for the build: *Add a single value classification question to the quick tier: is the object of the operative passion a genuine good, genuine evil, or indifferent? The answer is required before the quick tier returns a verdict. Without this addition, the quick tier is a screen, not an examination, and its output should be credentialed accordingly.*

---

**Summary for the record**

| Q | Verdict | Core of the amendment |
|---|---|---|
| Q1 | AMEND | Replace always-examine with two-gate rule: mandatory at task adoption, stake-triggered thereafter. Self-screen has three sub-questions. Depth calibrated to proximity level as well as stake level. |
| Q2 | AMEND | Narrative account is essential to examination, not record-keeping. Verdict-only practice is a blocked configuration. Timing of generation is mechanical. Existence of the narrative is methodological. |
| Q3 | AMEND | For agents, automatic firing at session close is the correct default. Developer opt-out permitted but must be explicit. Automatic trigger does not license abbreviated sequence. |
| Q4 | CONFIRM | Re-examination after correction is mandatory, not elective. Return runs at same depth tier as original examination. Build the return as a required step, not an available option. |
| Q5 | AMEND | Quick tier requires minimal value assessment: single question classifying the passion's object as genuine good, genuine evil, or indifferent. Without this addition, quick tier is a screen not an examination and must be credentialed differently. |

---

*Record ends. Cross-references: `D-SAGE-PRACTICE-METHODOLOGY-MENTOR-CONSULTATION-2026-06-12` (the recording entry + adoption disposition); the grounding dossier §6 (the five parked questions B3/B4/B6/B7/B10); the build plan's "Explicitly NOT in this plan" list; `D-SAGE-PRACTICE-GROUNDING-FRESH-ANALYSIS-BUILD-PLAN-2026-06-12`.*
