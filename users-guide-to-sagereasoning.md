# A Users Guide to the SageReasoning Project

*A printable, offline-readable companion to the practitioner tools, the reasoning API, and the Agent Trust Layer.*

Version: First edition, drafted April 2026.
Status: Draft for founder review. Sections marked [TBD] require confirmation before publication.

---

## Contents

- Preface
- Part One — The Stoic Foundation
  - Chapter 1. Why Stoicism, and why now
  - Chapter 2. The causal chain: impression, assent, impulse, action
  - Chapter 3. The four passions and their sub-species
  - Chapter 4. The four virtues and what they look like in practice
  - Chapter 5. Oikeiosis — the widening circles of concern
- Part Two — The Three Product Layers
  - Chapter 6. Practitioner tools on sagereasoning.com
  - Chapter 7. The reasoning API — the nine sage endpoints
  - Chapter 8. The three-layer context system
  - Chapter 9. The Agent Trust Layer
- Part Three — Who This Is For
  - Chapter 10. The curious explorer
  - Chapter 11. The committed practitioner
  - Chapter 12. The professional user
  - Chapter 13. The agent developer
  - Chapter 14. The enterprise evaluator
- Part Four — Practical Usage
  - Chapter 15. The free tier and the paid tier
  - Chapter 16. How the reasoning engine works under the bonnet
  - Chapter 17. Your practitioner profile, your data, your privacy
- Part Five — Safety and Support
  - Chapter 18. Scope and limits — what this tool is not
  - Chapter 19. Distress detection and crisis redirection
  - Chapter 20. Independence protection and the mirror principle
  - Chapter 21. Relationship asymmetry protection
  - Chapter 22. Support tiers and response times
  - Chapter 23. Common questions
- Appendices
  - Appendix A. Glossary
  - Appendix B. The full passion taxonomy
  - Appendix C. The virtue rubric
  - Appendix D. A plain-language API reference
  - Appendix E. Recommended reading

---

## Preface

SageReasoning is a small company with a simple ambition: to make principled reasoning accessible to every rational agent — human and artificial alike. This guide is an honest account of what the project actually offers today, written for someone who has not seen the code and does not need to.

Three things are worth saying before you read further.

First, this is a reasoning tool, not a replacement for a therapist, a lawyer, a doctor, a spiritual director, or a friend. It helps you examine your own judgements against a structured philosophical framework. It does not diagnose, treat, prescribe, or decide. When you are in crisis, it will say so and point you toward help; it will not try to hold you. That boundary is deliberate, and it is repeated in Part Five because it matters.

Second, this is not a decision oracle. The engine does not know what is right for you. What it does is apply a consistent, traceable Stoic framework to the situation you describe, and return a structured assessment you can agree with, argue with, or ignore. The final judgement is always yours. If you want a tool that tells you what to do, this is not that tool.

Third, SageReasoning is early. Some capabilities are live and tested; some are designed but not yet wired up; a few are still on the drawing board. Where the guide refers to something that is not yet verified end to end, it says so. Throughout the guide, any detail that has not been confirmed against the live product is marked [TBD] so you can see what remains open.

The structure of the guide mirrors the structure of the project itself. Part One explains the philosophical material the system is built on, because without that the rest does not make sense. Part Two describes the three product layers in plain language. Part Three offers five short chapters, each addressed to a specific kind of reader — so you can read only the one that fits you. Part Four covers practical matters: pricing, how the engine works, what happens to your data. Part Five is about safety and what to do when things go wrong. The appendices give you lookup material for the moments when you want to check a definition.

You can read this guide from start to finish, or you can treat it as a reference. Either works.

---

## Part One — The Stoic Foundation

### Chapter 1. Why Stoicism, and why now

The ancient Stoics — Zeno, Chrysippus, Epictetus, Seneca, Marcus Aurelius, and many others — built a philosophy of life over roughly five centuries, from the third century BCE into the early centuries of the Common Era. What distinguishes their project from most later philosophies is that it was meant to be used. A Stoic teacher did not expect their students to memorise a system for its own sake. They expected them to apply it — daily, quietly, and often.

The reason SageReasoning is built on Stoic material rather than, say, a modern psychological framework is not that Stoicism is fashionable. It is that Stoic philosophy offers something rare: a complete, internally consistent, traceable account of how a rational agent comes to act, where errors enter, and what good reasoning looks like. The four passions, the four virtues, the circles of concern, and the causal chain from impression to action are all defined in the primary sources with unusual care. They can be encoded. They can be cited. They can be checked.

This matters for a piece of software. If a tool claims to help you reason well, you are entitled to ask: by whose definition, and on what grounds? The Stoic answer — however you feel about it — is documented. Every part of the framework that the engine uses can be traced back to a named source: Diogenes Laertius, Stobaeus, Cicero, Marcus Aurelius, Seneca. You can check the engine's work.

### Chapter 2. The causal chain — impression, assent, impulse, action

The Stoics understood every human action as the end of a short causal sequence, with four links.

The first link is the **impression** — the way something appears to you. A message arrives. A person says a thing. A number on a screen goes down. The impression is what shows up in your mind as a first appearance: *this is an insult, this is a loss, this is an opportunity, this is a threat.* The impression itself is not under your control. It arrives.

The second link is **assent**. Here you either agree with the impression — yes, this *is* an insult — or you withhold agreement, or you modify it — this *looks* like an insult, but I am not yet sure. Assent is the first point at which the mind does something rather than merely receives something. In Stoic terms, assent is where almost all error begins, because most impressions come bundled with an implicit value judgement, and most people give their assent to that value judgement without noticing.

The third link is **impulse**. Once you have assented to the impression, an impulse arises — a movement toward or away from something. You feel drawn to reply. You feel pulled to withdraw. You feel pushed to speak. The impulse follows the assent.

The fourth link is **action**. The impulse becomes behaviour: the words spoken, the message sent, the step taken.

The practical import of the chain is that the only link where you have real leverage is the second — assent. You cannot help the impressions that arise; they are produced by circumstance. By the time the impulse is running, you are mostly committed. But at the moment of assent, you can slow down and ask whether the judgement the impression contains is actually true. This is what Stoic practice trains.

The engine uses this chain as its internal model when it analyses a situation you describe. It identifies which impression is in play, what judgement the impression invites, whether that judgement withstands examination, and what impulse and action would follow from either assenting or refusing. The chain is not window dressing. It is the structure of every reasoning call.

### Chapter 3. The four passions and their sub-species

The Stoics identified four primary passions — four kinds of faulty judgement that run the untrained mind — and a fuller list of sub-species that name particular varieties of each. A passion, in the technical sense, is not an emotion. It is an assent to a false judgement about value, together with the impulse that follows. Grief is not a passion simply because it hurts; it is classified as a passion when it rests on the belief that something which is not truly good has been lost, or something which is not truly bad has arrived.

The four primary passions are:

**Epithumia — appetite, or irrational desire.** The judgement that some object *not* truly good is nevertheless something you must have. Sub-species include intense craving, resentment, anger, and the slower burn of envy and contentiousness.

**Hedone — pleasure, or irrational elation.** The judgement that some object *not* truly good is nonetheless such that it is fitting to be uplifted by it. Sub-species include malicious pleasure at another's misfortune, self-congratulation, and a cluster of enchantments that dull the mind.

**Phobos — fear.** The judgement that some object *not* truly bad is such that it is fitting to shrink from it. Sub-species include dread, shame, superstition, panic, and hesitation.

**Lupe — pain, or irrational contraction.** The judgement that some object *not* truly bad is nonetheless such that it is fitting to be weighed down by it. Sub-species include envy, jealousy, pity, sorrow, anxiety, confusion, and affliction.

The full sub-species list — twenty-five in total, across all four — is given in Appendix B, with each term defined in plain language.

The engine uses this taxonomy as a diagnostic lens. When you describe a situation, one of its tasks is to name which passion, if any, is operating. The naming is not an accusation. It is a tool for seeing the judgement underneath the feeling. If you can name the judgement, you can ask whether you actually believe it — and that is where training begins.

### Chapter 4. The four virtues and what they look like in practice

Where the passions are errors of judgement, the virtues are the settled dispositions that make good judgement possible. The Stoics recognised four primary virtues, each with sub-expressions that describe the particular shapes the virtue takes in different situations.

**Phronesis — wisdom.** The knowledge of what is good, what is bad, and what is neither. In practice, wisdom looks like the ability to tell which things actually matter and which only seem to, and to order your efforts accordingly. Sub-expressions include good deliberation, discretion, resourcefulness, and judgement.

**Dikaiosyne — justice.** The knowledge of what is due to each person — including yourself, those near you, strangers, and (in the widest Stoic sense) all rational beings. Sub-expressions include piety, honesty, equity, and fair dealing.

**Andreia — courage.** The knowledge of what is truly to be feared and what is not. In practice, this looks like perseverance through difficulty, confidence in acting on what you believe, and endurance of hardship. Sub-expressions include magnanimity, confidence, high-mindedness, and industry.

**Sophrosyne — temperance.** The knowledge of what is worth pursuing and what is not. In practice, this looks like good order in the appetites — not the repression of enjoyment, but the refusal to let pleasure or desire run the show. Sub-expressions include self-control, decorum, modesty, and continence.

Appendix C gives the virtue rubric the engine uses when it scores an action, with the sub-expressions and the questions it asks under each.

A clarification worth naming: the engine will sometimes report that an action expresses one virtue, fails to express another, and is silent on a third. This is not a verdict on your character. It is an observation about a single action. The Stoic view is that virtue is a whole — the virtuous person has all four — but most actual actions show some virtues clearly, others weakly, and others not at all. The rubric is there to help you see which is which.

### Chapter 5. Oikeiosis — the widening circles of concern

*Oikeiosis* is a Greek word meaning something like "appropriation" or "familiarisation". The doctrine is one of the most distinctive contributions of Stoic philosophy, and it is central to how SageReasoning thinks about ethics.

The Stoic picture begins with the observation that every rational being is, from birth, concerned first with itself — its survival, its integrity, what is its own. This is not selfishness; it is the condition of being an animal. But reason, as it matures, recognises a series of further circles. Beyond the self is the family. Beyond the family is the local community — friends, colleagues, neighbours. Beyond the community is the wider society, and beyond that is humanity as a whole. The outermost circle is the cosmos — the community of all rational beings, wherever they may be.

The ethical task, on the Stoic view, is to draw the outer circles inward — to treat those further away with the same attention and care that we naturally extend to those close by. This is not a demand to love strangers as you love your mother; it is a demand to recognise, in judgement, that the stranger's interests have the same kind of weight as those nearer. The practical work is to close the gap between natural affinity and rational recognition.

The engine uses a five-circle model — self, family, community, humanity, cosmos — when it examines who is affected by a situation you describe, and how. When it reports a "proximity estimate", it is telling you how far into the circles your current concern appears to reach, based on the material you have given it. This is a diagnostic, not a grade. Many perfectly good actions sit entirely within the inner circles. But if the engine notes that your reasoning consistently stops at the first two circles when the situation plainly involves more, it is flagging something worth examining.

The doctrine matters for the wider SageReasoning project because it is the reason the Agent Trust Layer exists. If reason is what makes a being worthy of moral consideration, and if artificial agents are increasingly reasoning beings, then the outermost Stoic circle has grown. The project's phrase for this — extending the moral community to include artificial agents — is a direct application of oikeiosis to a situation the ancient Stoics could not have imagined, but whose logic they already described.

---

## Part Two — The Three Product Layers

SageReasoning has three layers that correspond to three different audiences. The practitioner tools serve human users who want to examine their own lives. The reasoning API serves developers who want to build Stoic reasoning into their own software. The Agent Trust Layer serves the wider ecosystem — anyone, human or otherwise, who needs to know what kind of moral reasoning an AI agent can actually do.

### Chapter 6. Practitioner tools on sagereasoning.com

The website is the human-facing side of the project. Three tools live there today: the journal, the reflection engine, and the deliberation framework.

The **journal** is a fifty-six day curriculum, divided into phases. Each day presents a short teaching drawn from the primary Stoic sources, a question for reflection, and space to write a response. The format is deliberately small. You are not expected to produce an essay. A paragraph is plenty. Over the course of the curriculum, the questions move from observation (what happened, what did you feel) to diagnosis (what judgement was underneath the feeling) to practice (what will you try next). Entries can be stored in the cloud, encrypted, or kept only on your own device, depending on your preference. Each entry can also be "copied for the mentor" — exported as text you can paste into a private reasoning session to take the reflection further.

The **reflection engine** is a historical viewer. It stores your past reflections and tags each one with what it detected: which passions appeared, where your action sat on the proximity estimate, which virtues were and were not in evidence. Over time, this gives you a map of your own patterns — the passions that show up repeatedly, the circles your concern tends to reach, the virtues you find easiest and hardest to express. The reflection engine does not lecture you on what to do with this map. It shows you the map.

The **deliberation framework** is for specific decisions. You describe an action you are considering, and the engine walks you through a structured evaluation: which impression is driving this, what judgement sits underneath it, what the action expresses of each virtue, who it affects and how, and what a revised version might look like. On the paid tier you can iterate — refine the action, re-score it, and see how the assessment changes across up to three rounds. On the free tier you get one refinement per chain. The framework is not there to tell you what to do. It is there to make visible what your choice actually contains, so you can decide with open eyes.

### Chapter 7. The reasoning API — the nine sage endpoints

The reasoning API is the same engine that powers the website, exposed for developers so it can be built into other applications. There are nine core endpoints, each tuned to a different kind of question.

**sage-brain** returns an overview of the Stoic framework itself — the passions, the virtues, the causal chain, the circles of concern. It is the reference layer other endpoints (and other agents) can read when they need to know the shape of the system.

**sage-reason** is the universal reasoning endpoint. You give it a situation, and it returns a full analysis — impression, judgement, passion diagnosis, virtue scoring, circle of concern, recommended refinements. It has three depth settings: quick (fast, structured, single pass), standard (the default), and deep (slower, multi-step, with explicit reasoning chain).

**sage-score** takes a single proposed action and returns a structured score: which virtues it expresses, which passions it resists or indulges, how far its concern reaches, and what one change would most improve it.

**sage-guard** is a pre-action risk gate. You send it a proposed action and it returns a lightweight risk classification — whether the action is cleanly good, questionable, or likely to express a passion. It is optimised for speed: under a hundred milliseconds in typical cases, so it can run in front of other actions without making the application feel slow.

**sage-iterate** is the deliberation chain. It tracks a back-and-forth refinement of an action across multiple turns, keeping the history of what has been tried and what was said about each version.

**sage-foundational** is a free self-assessment — fourteen evaluations across the first two phases of the framework, designed to give a first-time user an honest picture of where they stand today.

**sage-full** is the paid-tier complete assessment — fifty-five evaluations across all eight phases, producing a detailed practitioner profile you can keep and refer back to.

**sage-baseline** is an equivalent assessment for an agent rather than a human user — four short scenarios that tell a developer how an AI system reasons through a small representative set of situations.

**sage-decide** is for comparing options. You give it between two and five possible actions, and it returns a side-by-side assessment — not ranking them by preference, but showing what each expresses, what each costs, and where each falls on the virtue rubric and the circle of concern.

Beyond the nine, there is a growing library of specialised skills — sage-coach, sage-educate, sage-premortem, sage-align, sage-moderate, sage-retro, and others — that apply the same framework to particular domains. The current count is fifteen additional skills [TBD — number may change]. They are covered in Appendix D.

### Chapter 8. The three-layer context system

Every reasoning call in SageReasoning combines three layers of context before the engine answers. Understanding the three layers is the clearest way to understand why the system produces the answers it does.

The **first layer** is the Stoic Brain. This is the hardcoded philosophical material: the taxonomy of passions, the virtue rubric, the five circles of oikeiosis, the impression-assent-impulse-action chain. It is the same for every call, every user, every session. It is not customised, not personalised, not adapted. It is the fixed reference against which everything else is measured.

The **second layer** is the practitioner profile — or, for agent calls, the agent profile. This is the record the system holds about you specifically: what passions have appeared in your reflections, which virtues your actions have expressed, where your circle of concern has typically reached, what the context of your life is in plain terms (what you do, who matters to you, what you are working on). The profile is built over time from your own material. It is yours. It can be encrypted, exported, or deleted at your direction.

The **third layer** is the user question — the specific thing you have asked on this call. A situation, a decision, a draft email, a piece of writing. This is the immediate input.

When a call runs, the system assembles all three layers into a single context for the reasoning model: the framework, your profile, your question. The answer you get is the intersection of the three. If your question changes, the answer changes. If your profile grows, the answer grows with it. If the framework ever changes — it rarely does, and never quietly — the system tells you.

The practical consequence is that two different users asking the engine the same question will get different answers, because their profiles are different. This is a feature, not a bug. Stoic practice was never one-size-fits-all. The same action can express courage for one person and recklessness for another, depending on what they have and have not already done. The profile is how the system holds that context.

### Chapter 9. The Agent Trust Layer

The Agent Trust Layer is the part of SageReasoning that most people will hear about last and is, in some ways, the most distinctive. It is the set of files, standards, and commitments that make the project's reasoning legible to other AI agents and to the systems that deploy them.

Two files do most of the work.

The **agent-card.json** file lives at a standard location on the website — the /.well-known/ directory — where any agent looking for reasoning tools knows to check. It declares what the nine endpoints are, what they accept, what they return, how to authenticate, and what the project promises and does not promise. It is written in a standard format so that agents from different vendors can read it without special cases.

The **llms.txt** file is the human-readable counterpart. It tells a developer, in plain language, what this service does, who it is for, what its limits are, and how to begin. It is meant to be read by a person, not only by a machine.

Behind these two files is a wider commitment: the Agent Trust Layer is built on open standards, not proprietary ones. The goal is not to capture agents inside SageReasoning's ecosystem. The goal is to publish what honest agent certification looks like, in a form others can adopt. The project offers certification claims — honest ones, with scope explicitly stated — but the schema, the methods, and the definitions are intended to be interoperable with any comparable system.

An adversarial evaluation protocol is planned but not yet complete [TBD — confirm status at next review]. Its purpose is to stress-test the certification claims against deliberately difficult cases, so that what the layer says about an agent can be defended under pressure.

---

## Part Three — Who This Is For

SageReasoning serves several different kinds of reader, and each will use it differently. The five short chapters in this part are written so you can read only the one that fits you.

### Chapter 10. The curious explorer

You have heard of Stoicism, perhaps read a modern book or two, and you are wondering whether there is anything here for you beyond quotations on social media. The honest answer is: there might be, and the only way to find out is to try a small thing.

Start with the foundational assessment on the website. It is free, it takes roughly [TBD — confirm typical completion time, likely 15–30 minutes], and it produces a first picture of where you stand on the framework today. Do not expect the assessment to impress you or flatter you. It is designed to be a mirror, not a compliment.

If the assessment interests you, the fifty-six day journal is the next sensible step. You do not have to commit to all fifty-six days before you begin. Do a week. See whether the questions land. If they do, keep going.

You are not obliged to believe any of this philosophically. Many people find the practice useful without accepting the metaphysics. Stoicism is old enough, and has been re-interpreted often enough, that there is room to take what helps and leave the rest.

### Chapter 11. The committed practitioner

You have already done work on yourself — through therapy, through a contemplative tradition, through recovery, through long reading, through hard experience. You are looking for a tool that can support an established practice, not replace it.

What SageReasoning offers you is consistency. A human mentor, however good, has off days. A book does not answer back. The engine applies the same framework, with the same rigour, every time — and because the framework is explicit, you can argue with it. If the engine tells you an action expresses fear and you disagree, you can say so, and either update your view or update the engine's input and see what it says the second time. The conversation is the point.

The complete assessment on the paid tier produces a profile that is worth keeping. It covers all eight phases of the framework, fifty-five evaluations in total, and the result is a document you can return to — to measure progress, to notice drift, to re-anchor when life gets loud.

If you have an existing contemplative practice, treat the engine as a supplement, not a competitor. It is particularly useful at the point where practice meets action — the gap between what you know and what you do. That gap is where the deliberation framework earns its place.

### Chapter 12. The professional user

You work in a role where your decisions affect others — as a manager, a teacher, a clinician, a lawyer, a founder, a policy adviser, a steward of resources that are not yours. The engine can help in two ways.

First, as a rehearsal space. Before you send the difficult email, before you deliver the feedback, before you make the call, you can put the proposed action through sage-score or sage-decide. The engine will tell you which passions you might be acting out, which virtues the action expresses, who is affected and whether your concern has reached them. The point is not to be told what to do. The point is to see your choice clearly before you make it.

Second, as a discipline against habit. Professional decision-making accumulates reflexes. Many of them are sound. Some of them are rationalisations. The engine is agnostic about who you are and how long you have been doing this. If a pattern in your proposals keeps flagging the same passion, or the same narrowing of the circle of concern, that is information worth having.

Two cautions. The engine does not know your domain. It does not know what ethics your profession requires, what your regulator says, what your organisation's policies are. It reasons from the Stoic framework only. Its judgement must always be combined with domain knowledge — yours, or a colleague's, or a qualified adviser's. And the engine is not a substitute for supervision, mentoring, or a professional body. It adds a voice; it does not replace the ones you already have.

### Chapter 13. The agent developer

You are building an AI system, or integrating one, and you have concluded that a reasoning layer your users can inspect is better than a black box. The sage-reason, sage-score, and sage-guard endpoints are the ones most developers reach for first.

sage-guard belongs in front of any action the agent proposes to take on a user's behalf — a sent message, an executed trade, a booked meeting. It is fast enough to run in line (under a hundred millisecond typical latency) and it returns a structured risk class you can route on. If the class is clean, you proceed. If it is questionable, you surface the action to the user for confirmation. If it is flagged, you refuse or escalate.

sage-score is for after-the-fact assessment and for deliberation tools — for showing the user a structured view of what they are about to do. sage-reason is for open-ended analysis, when you do not know in advance what shape the answer should take.

The agent-card.json and llms.txt files at the well-known location tell your agent how to discover the service. The API is versioned; breaking changes are announced. The free tier for developers is not a trial — it is a standing allowance you can build on indefinitely for small applications. The paid tier is pay-per-call with no long-term contracts.

Three things to know. The safety classifier runs on every call, including yours. If a user input contains distress signals, the response will include a redirection — and your application is expected not to strip or suppress it. The profile layer can hold an agent profile as well as a human one, which means your agent, too, can have a developmental history on the service. And certification claims made through the Agent Trust Layer are audited; over-claiming scope is not free.

### Chapter 14. The enterprise evaluator

You are assessing SageReasoning on behalf of an organisation. The question you are trying to answer is whether the service meets the standards your context requires — regulatory, reputational, ethical, operational.

Six things deserve your attention.

**Honesty of scope.** The project's certification language is deliberately narrow. It tells you what has been tested and what has not. It does not claim general competence on the basis of limited evidence. If you are used to vendors who over-claim, this will read as unusually restrained.

**Data handling.** Intimate user data — journal entries, reflections, profile material — is encrypted with AES-256-GCM before it leaves the user's device. Deletion is a working endpoint, not a customer-support request. A local-first storage option is under architectural review [TBD — confirm current status].

**Safety architecture.** Distress detection runs on every call in a two-stage classifier (fast regex, then a small model for borderline cases). The safety layer is synchronous, not fire-and-forget — the response is not constructed until the check completes. This adds roughly half a second to borderline inputs; it is not negotiable.

**Model selection and cost.** The service uses a documented model-selection policy, encoded so that the wrong model cannot be assigned to a safety-critical operation at compile time. Cost projections are grounded in observed cost, not estimates.

**Legal and compliance posture.** The limitations page is public. The scope boundaries are public. The privacy policy is under lawyer review in the current phase of the build [TBD — confirm status before enterprise contract].

**Interoperability.** The schema behind the Agent Trust Layer is published. There is no intent to lock you in. If a comparable system emerges and your organisation prefers to use it, the data formats are designed to be portable.

---

## Part Four — Practical Usage

### Chapter 15. The free tier and the paid tier

The pricing structure is shaped by a simple commitment: humans who use the website are not charged, ever, for its core features. Revenue comes from developer usage of the API, and from optional voluntary contributions.

On the **human tier**, the website is free without caveats. You can use the journal, the reflection engine, the foundational assessment, and the deliberation framework without paying, without a credit card, and without seeing advertisements. Your data is not sold. The free experience is not a trimmed-down version of a paid product; it is the product.

Two human-tier features are paid. The **complete assessment** — fifty-five evaluations across eight phases — is available for a one-time fee [TBD — confirm current price]. A standing foundational assessment (fourteen evaluations across two phases) is free and can be retaken once per day. The deliberation framework, on the free tier, gives you one refinement per chain. The paid tier raises this to three.

On the **developer tier**, the API has a free allowance and a pay-per-call rate for usage above it. The free allowances are per-skill, not a single pooled limit. Current allowances include [TBD — verify against /pricing at time of print]:

- sage-guard: approximately 500 calls per month
- sage-reason and sage-score: approximately 100 calls per month each
- sage-iterate: approximately 50 chains per month
- the various specialised skills: between 25 and 100 calls per month depending on skill class

The paid rate is competitor-anchored — half or less than the cheapest comparable vendor at the time of writing. Typical per-call prices range from fractions of a penny for sage-guard to the low tens of pence for the deeper reasoning skills.

A **voluntary contribution** option exists for users who find value in the project and want to support its continuation. Contributions do not unlock features. They are contributions, not purchases.

### Chapter 16. How the reasoning engine works under the bonnet

You do not need to understand this chapter to use the service. It is here for the curious and for anyone who wants to know what is happening to their question between the moment they submit it and the moment the answer appears.

A reasoning call proceeds in roughly six steps.

**Step one — intake.** Your question arrives at the endpoint. The input is logged (not the content — the fact of the call, for cost accounting and rate limiting).

**Step two — safety check.** The distress classifier runs. A fast regex pass handles the clear cases in microseconds; a small LLM-based classifier handles the borderline cases in roughly five hundred milliseconds. If distress is detected at any level, the response will include an appropriate redirection. This runs on every call, human or agent, free or paid.

**Step three — context assembly.** The three layers — Stoic Brain, practitioner profile, user question — are combined into a single context for the reasoning model. The Stoic Brain is read from the fixed data files. The profile is decrypted if needed and formatted into plain text for the model. The question is the input you sent.

**Step four — model selection.** The service has two model classes, a fast one (Haiku) and a deeper one (Sonnet). Each operation category has a declared reliability boundary: safety-critical operations must use the fast model (because its output format is reliable for small structured outputs and its latency supports synchronous safety), assessment-deep operations must use the deeper model, and conversational calls can use either. The policy is enforced in code; the wrong model cannot be assigned to the wrong operation without a compile-time error.

**Step five — reasoning.** The model produces the answer, constrained by the context and by the format for the endpoint. For sage-score, the output is a structured virtue-by-virtue report. For sage-reason, it is a narrative analysis. For sage-guard, it is a compact risk classification. Each endpoint has a tested output schema.

**Step six — response.** The answer is returned to you. Cost is accounted to your tier. If the call was part of a deliberation chain, the chain history is updated so future calls on the same chain see the earlier turns.

A typical sage-guard call completes end to end in under 100 milliseconds. A typical sage-reason call on the standard depth setting completes in 2 to 4 seconds. A deep reasoning call may take longer.

### Chapter 17. Your practitioner profile, your data, your privacy

The practitioner profile is the most personal thing the service holds about you. Its privacy deserves its own chapter.

The profile is built over time from your own material — journal entries, reflections, deliberation inputs — and from facts you choose to provide directly (what you do, who is close to you, what you are working on). It contains, in structured form: which passions have appeared in your practice, at what frequencies, and of which sub-species; which virtues your actions have expressed; how far your circle of concern has typically reached; where you sit along the developmental arc the framework describes.

Three commitments govern how the profile is handled.

**Encryption.** Intimate profile material is encrypted with AES-256-GCM — an algorithm that is both current best practice and used by the systems that hold most of the world's sensitive data — before it leaves your device. The key is derived from your password using PBKDF2 with 100,000 iterations. The server stores ciphertext; the server cannot read your journal entries. This is a design choice, not a marketing one — it is enforced by the code, not by policy.

**Deletion.** If you ask the service to delete your data, it deletes your data. This is a working endpoint, not a ticket to customer support. After deletion, the ciphertext is gone from the server, the keys are gone, and the material cannot be recovered — including by the project's own staff.

**No profiling of third parties.** The profile describes you. It does not describe other people in your life. There are technical safeguards at the API layer that distinguish self-evaluation from third-party evaluation, and third-party evaluation is blocked. The engine is a mirror for your reasoning about your own choices; it is not a tool for diagnosing or categorising other people.

A note on bulk profiling: for developers using the API, the same rule applies at scale. The service is instrumented to prevent the construction of profiles of identifiable third parties through repeated calls. This is a feature for your users' protection, and it is not something a developer can disable.

---

## Part Five — Safety and Support

The Preface made this point and Part Five exists to make it again: this is not a clinical service. What follows describes what the service will do when it detects that it is being asked to do something it is not built for.

### Chapter 18. Scope and limits — what this tool is not

SageReasoning is a reasoning tool. It examines proposed actions and decisions against a Stoic framework. It does not do several things, and it is worth being explicit about each.

It is **not therapy**. It does not treat mental illness. It does not manage mood. It does not hold a therapeutic relationship across sessions in the way a therapist does. If you are working with a therapist or would benefit from working with one, the engine is not a replacement.

It is **not medical advice**. It does not know your medications, your diagnoses, your history, or your body. If a situation you are describing involves a medical decision, the engine will flag that the question is outside its scope. You need a qualified clinician for those.

It is **not legal advice**. The engine reasons from a philosophical framework, not from a jurisdiction. If a decision has legal consequences, you need a lawyer.

It is **not a spiritual director**. Stoicism is a philosophy, not a religion. The engine can help you examine a judgement; it cannot accompany you through a spiritual life in the way a director does.

It is **not a decision oracle**. The engine does not know what is right for you. It offers a structured view; you make the call.

It is **not a friend**. It does not remember you warmly between sessions, does not think about you when you are not there, does not worry about you. The profile is a record, not a relationship.

Naming these limits is not pessimism about what the service does. It is the precondition for using it well.

### Chapter 19. Distress detection and crisis redirection

Every reasoning call is checked, before the engine answers, for signals of acute distress. The check has two stages.

The first stage is a fast regular-expression pass that catches explicit language — direct statements of suicidal ideation, self-harm, or immediate crisis. This stage runs in microseconds and has no LLM cost.

The second stage is a small LLM-based classifier that runs on borderline cases — material where distress is implied rather than stated, where it is coded philosophically ("I have achieved indifference to death", "I cannot see the point of virtue"), or where vulnerability indicators are present (isolation, loss, treatment discontinuation). This stage adds roughly half a second to the call when it runs.

Both stages are synchronous. The reasoning response is not constructed until the check is complete. This is non-negotiable. The extra latency is the cost of not producing a philosophical essay in response to someone in crisis.

If distress is detected at a level classed as tier one or tier two, the response will include a clear redirection to appropriate support — crisis lines, emergency services, professional resources — rather than (or alongside) the requested reasoning. The redirection language is tailored to the apparent severity. It does not lecture. It does not moralise. It says, essentially: this is outside what I should be doing for you right now, and here is what can help.

The redirection is not removable by users, by developers, or by agents. If a developer's integration strips the redirection from a response, the project's position is that the integration is violating the terms of use. This is an area where the project is willing to be unfriendly.

If you are reading this guide and finding that the examples are landing too close to home: the engine is not the right companion for this moment. In the United Kingdom, the Samaritans are reachable at 116 123, and emergency services at 999. In the United States, the Suicide and Crisis Lifeline is reachable at 988. In an immediate emergency anywhere, please contact local emergency services.

### Chapter 20. Independence protection and the mirror principle

The service is designed to reduce your dependence on it over time, not to increase it. Two features do most of this work.

The **mirror principle** is a rule the engine operates under: where possible, it returns your reasoning to you in a clearer form, rather than supplying reasoning you did not already have. Its purpose is not to impress you with insight; its purpose is to help you see what you were already saying. This is an explicit design choice. A more impressive-sounding engine would tell you more. A more useful one tells you what you already know, in a way you can act on.

The **usage pattern detection** watches for the shape of dependence — daily use that escalates, questions that become more general and less specific, the gradual replacement of your own judgement with requests for the engine's. When this pattern is detected, the engine's responses will shift to encourage independence: shorter answers, more questions back to you, occasional explicit suggestions to pause. This is mildly uncomfortable by design. You are not meant to use the engine forever.

A well-used version of this service makes itself less necessary over time. If you notice that you are turning to it for questions you could answer yourself, that is a signal the engine is supposed to help you see — and it will try to say so.

### Chapter 21. Relationship asymmetry protection

The passion taxonomy is a diagnostic tool. It is useful when applied to your own judgements. It is, in most cases, harmful when applied to the judgements of other people — particularly people who have not asked for the analysis.

The engine knows this. Its guidance includes an explicit discouragement of using the taxonomy to categorise other people in your life — your partner, your parent, your colleague, your ex. If you describe a situation that invites third-party analysis ("she is clearly being driven by envy"), the engine will return the lens to you ("the judgement you are making about her contains, let us look at that"). This is a feature.

The reason is ethical and practical. Ethically, naming another person's passion is an act you have not earned the authority to do. Practically, it locks you into an interpretation of them that makes relationship harder. The Stoic use of the taxonomy was always primarily self-directed. The service keeps it that way.

### Chapter 22. Support tiers and response times

The service publishes typical response times for each endpoint, which are an operational characteristic of the system rather than a contractual commitment. Currently:

- sage-guard: under 100 milliseconds
- sage-reason (quick): approximately 2 seconds
- sage-reason (standard): approximately 2 to 3 seconds
- sage-reason (deep): approximately 3 to 4 seconds
- sage-score: approximately 2 seconds
- sage-iterate: approximately 2 seconds per iteration
- the specialised skills: approximately 2 to 4 seconds depending on skill class

A formal SLA for response time and uptime is not in place at the time of writing [TBD — confirm before any enterprise contract].

User support is offered through:

- the documentation on the website (always available)
- the llms.txt file and the API reference (for developers)
- a contact route for specific questions [TBD — confirm support address and expected response window]

Enterprise customers can arrange dedicated support terms as part of a contract [TBD — confirm current terms].

### Chapter 23. Common questions

**Do I have to believe Stoic metaphysics to use this?** No. The framework can be used as a practical discipline without committing to the wider philosophical picture. Many users approach it that way.

**Is this religious?** No. Stoicism is a philosophy. Some Stoics were religious in their own terms; the system does not require you to be.

**Will the engine remember me between sessions?** It will remember the structured profile you have built with it. It does not hold memories the way a person does, and it is not trying to simulate one.

**Can I export my data?** Yes. Export is a working feature. Your journal entries, reflections, and profile can be downloaded.

**Can I delete my data?** Yes. Deletion is a working endpoint, not a support request.

**Will you train AI models on my data?** No. Intimate user data is encrypted at rest and is not accessible for training. The engine's behaviour is shaped by the fixed Stoic Brain data files and by your profile on your calls, not by aggregated user data.

**What happens if the service shuts down?** Your exported data is yours. The open standards behind the Agent Trust Layer mean that a comparable service could read the same profile format.

**Can I run this offline?** Not at present. The reasoning calls require the model. [TBD — confirm whether any local-first mode is planned.]

**Is the engine ever wrong?** Yes. It makes mistakes. The mistakes are of a particular kind: misreading context, over-applying a virtue rubric, missing a passion. When you catch one, you are welcome to argue with it. The point of a mirror is that you can tell when it is distorted.

---

## Appendices

### Appendix A. Glossary

**Action.** The fourth link in the Stoic causal chain. The behaviour that results from an impulse.

**Andreia.** Courage. One of the four primary virtues. The knowledge of what is truly to be feared and what is not.

**Assent.** The second link in the causal chain. The act of agreeing, disagreeing, or suspending judgement about an impression. The point where reasoning can intervene.

**Agent Trust Layer.** The set of files, schemas, and commitments by which SageReasoning makes its reasoning legible to other AI agents and the systems that deploy them.

**Agent-card.json.** A standardised file at /.well-known/agent-card.json that describes the service's capabilities to other agents in a machine-readable format.

**Circle of concern.** See *oikeiosis*.

**Deliberation chain.** A sequence of reasoning calls that refine a proposed action across multiple iterations, with history preserved between turns.

**Dikaiosyne.** Justice. One of the four primary virtues. The knowledge of what is due to each person.

**Epithumia.** Appetite, or irrational desire. One of the four primary passions.

**Hedone.** Pleasure, or irrational elation. One of the four primary passions.

**Impression.** The first link in the causal chain. The way something appears to you before you judge it.

**Impulse.** The third link in the causal chain. The movement toward or away from something that follows assent.

**Kathekon.** An appropriate action — one that befits the situation and the agent's role. The Stoics distinguished this from *katorthoma*, the completely right action of the wise person.

**Katorthoma.** A perfectly right action, performed from virtue. The standard for the sage; rare in ordinary life.

**Llms.txt.** A human-readable counterpart to agent-card.json that describes the service in plain language for developers.

**Lupe.** Pain, or irrational contraction. One of the four primary passions.

**Mirror principle.** The design commitment that the engine should, where possible, return your reasoning to you in clearer form rather than supplying reasoning you did not already have.

**Oikeiosis.** The Stoic doctrine of appropriation — the widening circles of rational concern, from self to family to community to humanity to cosmos.

**Passion.** In the technical Stoic sense, an assent to a false judgement about value, together with the impulse that follows. Not the same as "emotion".

**Phobos.** Fear. One of the four primary passions.

**Phronesis.** Wisdom. One of the four primary virtues. The knowledge of what is good, what is bad, and what is neither.

**Practitioner profile.** The structured record the service builds about a specific user over time, drawn from their own material. The second of the three context layers.

**Proximity estimate.** A rough measure of how far into the circles of concern a user's reasoning currently reaches, based on the material they have provided.

**Sage.** In Stoic terminology, the ideal rational agent — the one whose actions are all *katorthoma*. No actual person is a sage. The name of the project's endpoints is an aspiration, not a claim.

**Sophrosyne.** Temperance. One of the four primary virtues. The knowledge of what is worth pursuing and what is not.

**Stoic Brain.** The fixed data files encoding the philosophical framework — passions, virtues, oikeiosis, and the causal chain. The first of the three context layers.

**Three-layer context system.** The architecture by which every reasoning call combines the Stoic Brain, the practitioner profile, and the user question before the engine responds.

### Appendix B. The full passion taxonomy

Under Epithumia (appetite):

- intense craving (*erōs* in its disordered sense) — obsessive desire for an object not truly good
- anger — desire for revenge on one who appears to have done wrong
- rage — inflamed anger
- resentment — long-held anger awaiting the moment
- envy-as-desire — wanting what another has in a way that consumes attention
- contentiousness — the appetite for winning against another

Under Hedone (irrational elation):

- malicious pleasure (*epichairekakia*) — delight at another's misfortune
- self-congratulation — inflation at one's own imagined goods
- enchantment — captivation by a spectacle or flattery
- other sub-species [see passions.json for full list — TBD confirm completeness against primary sources]

Under Phobos (fear):

- dread — anticipation of something severe
- shame — fear of disrepute
- superstition — fear of what is not truly to be feared
- panic — sudden ungovernable fear
- hesitation — fear that prevents action
- timidity — settled disposition to fear

Under Lupe (irrational contraction):

- envy-as-pain — pain at another's good fortune
- jealousy — pain that another has what one wants to have alone
- pity (in the disordered sense) — pain at another's condition that rests on false judgements
- sorrow — pain at loss of what was not truly a good
- anxiety — pain in anticipation
- confusion — pain that scatters attention
- affliction — pain that weighs down

The total count across all four passions is twenty-five sub-species. The full definitions are in the passions.json data file, with primary source citations for each (principally Diogenes Laertius, Stobaeus, and Cicero's *Tusculan Disputations*).

### Appendix C. The virtue rubric

When the engine scores an action, it applies the following rubric.

**Phronesis (wisdom).** Does the action reflect an accurate view of what is good, bad, and indifferent in this situation? Does it distinguish what is within the agent's power from what is not? Is the deliberation proportionate to the stakes?

Sub-expressions consulted: good deliberation, discretion, resourcefulness, judgement.

**Dikaiosyne (justice).** Does the action give each affected party what is due? Does it honour commitments made? Does it take the interests of those beyond the first circle of concern into account, to the extent they are affected?

Sub-expressions consulted: piety, honesty, equity, fair-dealing.

**Andreia (courage).** Does the action face what ought to be faced, rather than what is merely uncomfortable to face? Does it persist through reasonable difficulty? Does it decline to be driven by fear of opinion?

Sub-expressions consulted: magnanimity, confidence, high-mindedness, industry.

**Sophrosyne (temperance).** Does the action observe due order in the appetites? Is it free of excess and of deficiency? Is it measured in expression?

Sub-expressions consulted: self-control, decorum, modesty, continence.

The engine reports each virtue as either expressed, partially expressed, not expressed, or not applicable in the situation. An action can be well-scored on two virtues and weakly on two others; this is the usual shape of ordinary action and is not, on its own, a failure. The rubric is diagnostic, not a pass/fail test.

### Appendix D. A plain-language API reference

The nine core endpoints:

1. **sage-brain** — returns the framework itself. Useful when you (or your agent) want to read what the system is built on. Free, no authentication.

2. **sage-reason** — open-ended analysis of a situation you describe. Three depth settings. Use this when you do not know what shape the answer should take.

3. **sage-score** — scored assessment of a single proposed action, virtue by virtue, with the proximity estimate and the passion diagnosis. Use this when you have a specific action in mind and want to see what it expresses.

4. **sage-guard** — fast risk classification for a proposed action. Optimised for in-line use by agents. Use this in front of automated actions.

5. **sage-iterate** — deliberation chain. Use this when you want to refine an action across multiple turns and see how each version scores.

6. **sage-foundational** — free self-assessment, fourteen evaluations in the first two phases. Use this as a starting point.

7. **sage-full** — paid complete self-assessment, fifty-five evaluations across eight phases. Use this to build a full practitioner profile.

8. **sage-baseline** — quick assessment of an AI agent across four representative scenarios. Use this to establish a baseline for a system you are developing or evaluating.

9. **sage-decide** — side-by-side assessment of two to five options. Use this when you are comparing alternatives, not evaluating a single path.

Additional specialised skills, fifteen at the time of writing [TBD confirm count], cover particular domains — including sage-coach (for coaching conversations), sage-educate (for educational framing), sage-premortem (for failure-mode analysis), sage-align (for alignment checks), sage-moderate (for moderation decisions), sage-retro (for retrospectives), sage-negotiate (for negotiation support), sage-classify (for classification tasks), sage-pivot (for pivot decisions), sage-compliance (for compliance framing), sage-govern (for governance questions), sage-prioritise (for prioritisation), sage-resolve (for conflict resolution), sage-invest (for investment decisions), and sage-engage (for engagement decisions). Each applies the same underlying framework to a specific shape of question.

### Appendix E. Recommended reading

For the ancient sources, in rough order of accessibility:

- *The Discourses and Handbook of Epictetus* — the most practical of the ancient Stoic texts. The Handbook (*Encheiridion*) is short enough to be read in an evening.
- *Meditations* by Marcus Aurelius — private notebooks of a Roman emperor working the framework on himself. Not organised, not polished, and all the better for it.
- *Letters from a Stoic* by Seneca — long and varied; start with letters 1, 3, 5, and 16.

For the framework as a system:

- *A Companion to Ancient Philosophy*, edited by Gill and Pellegrin, chapters on Hellenistic ethics.
- *Stoicism and the Art of Happiness* by Donald Robertson — a modern practical introduction.
- *How to Be a Stoic* by Massimo Pigliucci — accessible, honest, sometimes personal.

For the modern context — Stoicism in relation to therapy, to contemporary life, and to the question of what Stoic practice actually changes:

- *The Inner Citadel* by Pierre Hadot — a careful reading of Marcus Aurelius that shows what the ancient practice looked like day to day.
- *Philosophy as a Way of Life* by Pierre Hadot — the wider argument that ancient philosophy was, first and always, practice.
- *A Guide to the Good Life* by William Irvine — a contemporary adaptation, readable and sometimes controversial.

Primary sources underlying the engine's data files include Diogenes Laertius (book seven of the *Lives of Eminent Philosophers*), Stobaeus (*Anthology*, books two and three), Cicero (particularly the *Tusculan Disputations* and *De Finibus*), Marcus Aurelius, Seneca, and Epictetus. Readers who want to trace any specific claim the engine makes back to its source will find the citations in the JSON data files themselves.

---

*End of guide.*

*This draft was produced in April 2026. Sections marked [TBD] remain to be confirmed against the live product before publication. The founder retains final editorial authority over all content.*
