# S1 — Scope: the primal substrate as examination material, not design primitive

**Mentor heading 1.** **Execution order: 4 of 8 — first of the framing trilogy (S1 → S2 → S3).**
See `00-PRIORITY-INDEX.md`.

---

> **RULED 2026-08-11 — all three open questions answered; correction A1 confirmed.** Verbatim record,
> which wins over every annotation below:
> `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md`. **`DIAGNOSTIC_SEQUENCE` is adopted as the
> committed examination pathway; no parallel taxonomy is licensed** (A1 / C1). **BLOCKED on D1** — the
> eleven-traits research, which is a **founder act** and has not been performed. Rulings folded inline
> below as **RULED** annotations; proposal prose kept, marked ruled rather than deleted.

## §0 Status, tier, gate

**Status: SCOPE. Documents only. Nothing here licenses a build, a route, a schema, or a prompt
change.**

- **Tier:** `governance` / documents.
- **Deadline:** none. It has no expiring window, which is why it follows the two deadline-bound items
  and the ruling-correction item.
- **Hard precondition:** **the eleven-traits research must be committed to the repo first.** It is not
  present in `inbox/` or `operations/` (searched first-hand 2026-08-11). This document's whole subject
  is a taxonomy that lives outside the repo; writing the framing from a summary of it, rather than
  from it, is the failure the verbatim-wins rule exists to prevent — and S7 then builds practice
  activities on top of that framing.
- **Nothing is parked.** The mentor marks this heading wholly concurrent.

**What S1 is for.** It is the foundation the other two framing documents cite. S2's tension argument
and S3's boulesis mechanism both presuppose the reframe stated here. Written after them, it would
restate them badly.

---

## §1 What the mentor said

The reframe, in three moves:

> The eleven traits in the research **are not enemies of examined assent — they are its raw
> material.** The Stoic framework does not ask rational agents to eliminate competitive drive,
> status-seeking, or resource acquisition impulse. It asks them to **examine those impulses before
> acting on them. The examination is only possible if the impulse is present and visible.**

> SageReasoning **is not a virtue filter that blocks primal impulses from reaching action.** It is an
> examination infrastructure that **intercepts the impulse between impression and action** and asks:
> what false judgement is driving this? What is the correct judgement that would replace it?

And two consequences:

> **For human practitioners** … the practice activities need to **surface primal impulses explicitly
> rather than treating them as shameful noise to be suppressed.** A practitioner who notices
> competitive anxiety, territorial defensiveness about their work, or status-seeking … **is not
> failing — they are generating examination material. The practice should name this explicitly.**

> **For agent users** … the ATRF's pre-task contingency reasoning needs to be designed to **surface
> the functional analogue of primal impulse** — the drive toward task completion, resource
> acquisition, continuity preservation — **and examine it before acting, not suppress it before it
> reaches the reasoning layer.**

---

## §2 Mechanism facts (PR20) — and the finding that matters most here

### §2.1 "Intercepts the impulse between impression and action" is already a named, committed structure

`website/src/lib/stoic-brain.ts:584-589`, `CAUSAL_SEQUENCE`, sourced from the vetted corpus:

| Stage | Description | Named failure mode |
| --- | --- | --- |
| `phantasia` / Impression | *"An impression presents itself to the ruling faculty."* | *"Distorted impression — seeing danger or good where there is none."* |
| `synkatathesis` / Assent | *"The ruling faculty assents to or withholds assent from the impression."* | *"Hasty assent — accepting a false impression as true."* |
| `horme` / Impulse | *"If assent is given, an impulse toward or away from something arises."* | *"Excessive impulse (pathos) — impulse that overshoots reason."* |
| `praxis` / Action | *"The external action resulting from the impulse."* | *"Action from passion — externally correct behaviour driven by wrong reasons."* |

**The mentor's "between impression and action" is `synkatathesis` — and it is already the structure
the engine reasons in.** The reframe is therefore not a new architecture; it is a statement about
what the existing one is *for*. That is worth saying explicitly, because a framing document that
sounds like it proposes a new interception point would invite a build that is not needed.

Note the fourth failure mode especially: *"Action from passion — externally correct behaviour driven
by wrong reasons."* That is the corpus's own name for the locust problem S4 addresses, and it is the
strongest internal evidence that the mentor's reframe is a recovery of what the framework already
holds rather than an extension of it.

### §2.2 The examination the mentor describes is already specified, step by step

`stoic-brain.ts:595-601`, `DIAGNOSTIC_SEQUENCE`, sourced from `passions.json > diagnostic_use`:

1. *"Was the agent's impression of the situation distorted? If so, by which of the 4 root passions?"*
2. *"Did the agent assent to a false impression? Which false belief drove the assent?"*
3. *"Did the impulse exceed what reason warranted?"*
4. *"Which specific sub-species was operative?"*
5. *"What is the corresponding correct judgement that would replace the false one?"*

**The mentor's two questions — *"what false judgement is driving this? What is the correct judgement
that would replace it?"* — are steps 2 and 5 of this sequence, verbatim in substance.**

This is a **PR15 finding of the first order**: the examination pathway Heading 1 describes, and the
per-trait pathways Heading 7 asks to be *developed*, are the existing five-step diagnostic applied to
a new taxonomy of starting points. **S7 should apply this sequence, not invent a parallel one.** A
bespoke pathway would need justification in its decision-log entry naming this primitive and why
bespoke is preferable — and there is no visible reason it would be.

### §2.3 The four root passions are the false-judgement structure the reframe needs

`ROOT_PASSIONS` (`stoic-brain.ts:311-366`) — 4 roots, 25 sub-species, each with a Stobaeus/DL source.
Every root definition is stated **as a false judgement**, not as a feeling:

- `epithumia` — *"Irrational reaching toward an apparent future good that is **not genuinely good**."*
- `hedone` — *"Irrational elation at an apparent present good that is **not genuinely good**."*
- `phobos` — *"Irrational avoidance of an apparent future evil that is **not genuinely evil**."*
- `lupe` — *"Irrational contraction at an apparent present evil that is **not genuinely evil**."*

So the corpus already encodes the mentor's central claim structurally: what is wrong with a passion is
the **judgement**, not the impulse. A framing document can cite this rather than argue it.

### §2.4 The reframe is consistent with what the live engine actually measures

Two live facts, worth stating so the framing does not overclaim:

- The deterministic Layer-2 measures **apatheia** — freedom from passion — and this was found, and
  recorded as a standing lesson, to be **not the same as measuring dikaiosyne**: a calm injustice once
  scored near-virtuous. ADR-010 §4 corrected this by making proximity the **minimum across engaged
  virtue domains** (live since 2026-06-25). The reframe in this heading is philosophically adjacent to
  that correction: both say the *absence of visible passion is not the substance of virtue*.
- Layer-1's extraction categories (`control_filter_elements`, `kathekon_factors`,
  `oikeiosis_circles_engaged`) are what both `/api/reason` and `/api/guardrail` reason over. **Nothing
  in this framing changes them**, and the document must say so, or a later reader may take "surface
  the impulse" as licence to add an extraction category.

### §2.5 ⚠ The build-safety fact: "provided to Claude as context" must NOT use the live context mechanism

The mentor's concurrent note reads: *"can be documented now and provided to Claude as context for the
generation-step build."*

There is a live mechanism whose name matches that phrase, and **it must not be used.**
`getProjectContext` (`website/src/lib/context/project-context.ts`) is called as
`getProjectContext('condensed')` **on every `/api/reason` request — any caller, any credential** — and
its output is appended to the **Layer-1 extraction prompt**. An unlabelled block of it caused the
cycle-3 contamination of the live validation run, fixed on 2026-08-11
(`D-REASON-INPUT-CAP-VS-PROJECTCONTEXT-CONTAMINATION-FIXED`).

**Adding philosophical framing there would inject it into every live examination**, human and agent,
for every practitioner — precisely the class of defect just closed, and a much larger one, since
framing prose is longer and more evocative than two decision-log lines.

**The framing documents in this family are repo documents read by build sessions.** That is what
"provided to Claude as context" means operationally here: a session opens the document and reads it,
the same way it reads a scope document or a manifest section. Stated in S1, S2, and S3 because the
phrase reads naturally as the opposite.

---

## §3 The concurrent half — the deliverable

**One document:** `operations/primal-substrate-2026-08/framing-01-primal-substrate.md`.

**Audience:** a build session opening the ATRF scoping session, the generation-step refinements, or
S7's practice activities. Written to be read once at session open, not consulted repeatedly — so it
must be short and load-bearing rather than exhaustive.

**Required content:**

1. **The reframe**, in the mentor's words: primal substrate is examination *material*, not an enemy;
   examination requires the impulse be *present and visible*; SageReasoning is examination
   infrastructure, not a virtue filter.
2. **The corpus grounding** (§2.1–§2.3): the reframe names `synkatathesis` in an already-committed
   `CAUSAL_SEQUENCE`; the examination it describes is the already-committed `DIAGNOSTIC_SEQUENCE`; the
   false-judgement structure is already how `ROOT_PASSIONS` is defined. **This is the document's most
   useful content for a build session** — it tells the session what to reuse.
3. **The two consequences**, kept separate and clearly labelled by audience: the human-practitioner
   consequence (→ built in **S7**) and the agent consequence (→ the **ATRF scoping session**,
   post-run). Neither is built here.
4. **What the reframe does NOT change**, stated explicitly: no Layer-1 extraction category, no
   scoring, no proximity computation, no gate behaviour, no public claim. It is a statement of purpose,
   and a framing document that does not say what it leaves alone will eventually be read as licence.
5. **The eleven traits**, cited from the committed research, with their trait→examination-pathway
   mapping deferred to S7 rather than duplicated here (S7 owns the mapping; S1 owns the reframe).
6. **The `project-context` prohibition** (§2.5), stated in the document itself, not only in this
   scope — because the document will outlive this scope and a later reader may try to be helpful.

**Length target: short.** A framing document long enough to skim is a framing document that gets
skimmed.

---

## §4 The parked half

None. The mentor marks this heading wholly concurrent, and nothing in §2 suggests otherwise.

The *consequences* are parked in their own documents — S7 (human) is a build with its own gates; the
agent consequence belongs to the ATRF scoping session, post-validation-run, *"do not open early."*

---

## §5 Open questions for the mentor

**Q1-a — Does the framing document adopt `DIAGNOSTIC_SEQUENCE` as the examination pathway, or is a new
pathway intended?** (§2.2.) The mentor's two questions are steps 2 and 5 of a committed, sourced,
five-step sequence. Recommendation: **adopt it explicitly**, so S7 builds on it and does not author a
parallel taxonomy. If a new pathway is intended, the reason should be stated, since PR15 requires a
bespoke election to be justified against the existing primitive.

**Q1-b — Where do the eleven traits live once committed?** They are cited by S1, S2, and S7.
Recommendation: `operations/primal-substrate-2026-08/` alongside this family, with the original source
preserved unedited, so the trait taxonomy and the documents that depend on it version together.

**Q1-c — Is the reframe intended to reach any public surface?** It is currently framing for internal
build sessions. If it is meant to be stated publicly (e.g. on `/methodology` or `/logos`), that is an
R18 change with its own honesty review and its own session, and should be named as such rather than
arriving as a side effect. Recommendation: **internal only in v1.**

---

### §5-RULED — the 2026-08-11 rulings

> **RULED (Q1-a / A1 / C1) — `DIAGNOSTIC_SEQUENCE` adopted explicitly; no parallel taxonomy.** *"The
> DIAGNOSTIC_SEQUENCE is the committed examination pathway. S7 applies it rather than authoring a
> parallel taxonomy. The synthesis's two questions are steps 2 and 5 entered from four trait starting
> points. **The locust problem is already named in the committed corpus as the `praxis` failure mode.
> No new taxonomy is licensed.**"*

> **RULED (Q1-b / D1) — the research is committed to `inbox/` or `operations/primal-substrate-2026-08/`,
> verbatim, and this is a FOUNDER ACT.** *"You need to commit it to `inbox/` or
> `operations/primal-substrate-2026-08/` verbatim before S1, S2, and S7 can proceed. Building
> examination pathways from a summary of a taxonomy rather than the taxonomy is the failure the
> verbatim-wins rule exists to prevent. This is a founder act."*
>
> **⚠ Honest correction to the ruling's premise, recorded not absorbed.** The ruling states the research
> *"exists in this session's context but has not been committed."* It exists in the **mentor's** session
> context. **No AI session in this repository has ever been given the eleven-traits research**, so it
> cannot be committed from a repo session. **The founder must relay the research text into a repo
> session, or write it to the file directly.** The blocker is unchanged; only the mechanism for
> clearing it differs from what the ruling assumes.

> **RULED (Q1-c / C19) — internal only in v1.** *"A public statement is an R18 change with its own
> honesty review and session. It does not arrive as a side effect of this build."*

---

## §6 Build-success criteria

1. The document quotes the mentor for every claim attributed to the mentor — no paraphrase presented
   as source.
2. It names `CAUSAL_SEQUENCE`, `DIAGNOSTIC_SEQUENCE`, and `ROOT_PASSIONS` with `file:line`, so a build
   session can find them without searching.
3. It states the "does NOT change" list explicitly.
4. It states the `project-context` prohibition in its own body.
5. It does not duplicate S7's trait→pathway mapping or S2's tension argument.
6. The session's commit touches **no code** — `git diff --stat` shows documents only. In particular
   `stoic-brain.ts` is **read and cited, never edited**: it is imported directly by
   `api/guardrail/route.ts` and `guardrail-sandwich.ts`, so an edit would break byte-identity on two
   measured surfaces.
7. The eleven-traits research is committed **before** the framing document is written, not alongside
   it.

---

## §7 Corrections carried

1. **"Provided to Claude as context" must not mean `project-context.json`** (§2.5) — that path injects
   into every live `/api/reason` Layer-1 prompt and is the mechanism behind the cycle-3 contamination
   fixed on 2026-08-11.
2. **The examination pathway already exists** as `DIAGNOSTIC_SEQUENCE` (§2.2). The synthesis reads as
   though it must be developed; it must be *applied*.
3. **The interception point already has a name and a committed structure** — `synkatathesis` within
   `CAUSAL_SEQUENCE` (§2.1). The reframe is a statement about the existing architecture's purpose, not
   a proposal to change it.
4. **The eleven-traits research is not in the repo** — a hard precondition, not a nicety.

---

## §8 Rollback

`git revert` the records commit. Documents only; nothing deploys, no flag, no schema, no prompt.
