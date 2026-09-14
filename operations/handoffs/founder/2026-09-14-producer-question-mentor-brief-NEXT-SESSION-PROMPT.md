# Next session — author the producer-question mentor brief

> **⚠ SPENT 2026-09-14 — RUN, BUT RESCOPED IN FLIGHT. DO NOT RE-RUN AS WRITTEN.**
> The session opened under this prompt and found, at its PR20 verification step, that **all four
> items in §2.1 were put to the mentor on 2026-08-30 and ruled the same day** (Q1a/Q1b/Q1c/Q2 —
> `2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md`), in a brief that already
> exists in this repository. Authoring §2.1's four items would have asked the mentor to re-rule
> their own ruling. **§2.1 is therefore void; §2.2 (PR20) and §2.3 were performed and stand.**
> The session did **not** cancel — Item 3's ruling stands under PR20's withheld-premise rule — but
> **rescoped**, and delivered
> `operations/agent-circles-2026-08/2026-09-14-MENTOR-QUESTIONS-producer-question-FOR-RULING.md`:
> the premise put back, three factual corrections to the record, one genuinely-open question
> (**Q-P1**, created by Q1a and unanswered by it), and three window-gated build items.
> **§6's claim that the producer question gates the build is superseded** — what gates it is
> unbuilt work, not an unanswered question.

**Authored 2026-09-14** by session `sagereasoning-b1 [4bc334]` (R12), on the founder's election
following the mentor's Item-3 ruling: *"Open the producer-question mentor brief… a structural
dependency, not a design preference."*

**Tier: `governance` / documents. Risk classification: Standard under 0d-ii. AC7 NOT engaged.
Critical Change Protocol does NOT apply.** The session authors a brief for the mentor. **It builds
nothing, migrates nothing, mints nothing, activates nothing and relays nothing** — the founder
relays.

**This is authoring, which the observation window admits.** Q-R12-B confines the window's waiver
admission to authoring and excludes code builds; this session stays on the authoring side of that
line. **Do not touch any file under `website/` or `harness/`.**

---

## 0. Why this session matters

Everything in R8 §§4.3–4.8 — the completion-signal read paths, the v1 update rule, the phase ladder —
**consumes a signal whose producer the design has never established can exist.** R8 named this at the
head of its own design rather than in its limits, and called it *"this design's own largest open
item"* and *"the single most important item for the follow-on brief."* Its recommended next act was
*"a mentor question, not a build."*

**That recommendation is now binding rather than advisory.** R12 §7.6 found the gap still open and
Q-R12-B ruled the build waits for the window's close, so the producer question is the only thing on
this track that can move. Concretely: **without an answer, nobody but the runner itself can post a
completion signal**, and phase 3 would consume a stream only the runner produces.

---

## 1. Pre-conditions — confirm before authoring

1. **Read `operations/agent-circles-2026-08/2026-08-30-standing-runner-design-R8.md` §4.0 in full.**
   It states the question in four items and is the brief's spine. **Verbatim wins over this prompt.**
2. **Read R12's brief §7.6** (`2026-09-14-R12-standing-runner-build-brief-second-increment.md`) for
   why item 2 is structural rather than tidy.
3. **The brief is NARROWER than R8 §11.1 described it.** R8 bundled the M/W/S floor-semantics
   election into this follow-on. **That election is CLOSED** — W elected 2026-09-13, and the Option S
   gate is fully discharged. **Do not re-open it, and do not carry it into the brief.**
4. **Confirm the standing holds** are unchanged: 0h HELD · the S11 flip REFUSED · weights BLOCKED ·
   D2 blocked.
5. **Re-derive at open, never quote:** the byte-identity guard (expect ARMED — the window is
   running), the three SHA pins, `git status` whole, `ListAgents` peer count.

---

## 2. What the brief must contain

### 2.1 The four items, stated as R8 states them

1. **Who executes, in any real deployment?** The bounded validation run had **no executing agent at
   all** — elected ideas were proposals to the founder and nothing was executed by any agent. *"If no
   agent ever executes an elected idea, no honest signal can ever be produced, and every consumption
   surface below has an empty input forever."*
2. **How does an executing agent learn `loop_id` + `cycle_number`?** The built schema requires
   **both** (`loop_id` alone does not identify a cycle). The only designed read is scoped to the
   runner's own loop identity. *"No designed path hands an external executing agent the cycle
   identity it is required to attest about."* **This is the concrete, closable one.**
3. **May the runner and the executing agent share an `agent_id`?** Mint-level capability separation
   (`completion_signal_write` ≠ `watching_write`) stops one *credential* doing both; **nothing
   observed stops one agent identity holding both credentials.** Whether that is permitted
   *"materially changes §6's signature… and the actor separation Q-C1's reasoning rests on."*
4. **The Q-C2a elector/attester tension — a tension in the inherited rulings, which R8 explicitly did
   not resolve.** Q-C2a's first ruled question asks *"What impression did the agent assent to **when
   it elected this idea**?"* — but **election is runner-side**, and in the observed record **4 of
   h7's 5 wins were resolved by an `r mod n` random tie-break.** For a tie-broken cycle the honest
   answer about assent *at election* is `habitual` or a refusal, **for every such cycle**, however
   carefully the executing agent later examined the idea. *"The ruled question presumes an
   elector-attester identity the current architecture splits."* **It touches ruled content — put it,
   do not answer it.**

### 2.2 PR20 in full — this is the brief's hardest requirement

R8 §11.1 says **PR20 applies in full**: name the live mechanisms each ruling will land on, as
**one-sentence, mechanism-level facts about current behaviour**, and **timestamp-check every
present-tense fact at relay**, not only at drafting.

**Verify at source and cite file:line.** At minimum: what `POST /api/practice/completion-signal`
accepts and requires; that the route exports POST and OPTIONS only; the `idea_loop_completion_signals`
columns and the CHECK binding `refuse_to_attest` to `threshold_reached`; that
`completion_signal_write` and `watching_write` are distinct capabilities and both write-class; what
the 6e §A CHECK requires of a credential carrying either; and that **no read surface hands cycle
identity to a non-runner.** **Mark anything you cannot verify from the repo —
production flag states, live credential rows — as recorded-but-not-independently-verified.**

### 2.3 What the brief must NOT do

- **Not answer item 4.** It touches ruled content.
- **Not propose a build**, a schema change, a capability, or an activation. **Q-R12-B forbids the
  build regardless**, and R8's own recommendation is a question, not a build.
- **Not re-open** the M/W/S election, the Option S gate, R8-D7's open parameters, or any Q-R11 or
  R12 ruling.
- **Not assign** the GS-ATRF-4 vocabulary-direction question, which stays held open and owned by no
  session per D1.

---

## 3. Procedure

**Step 1.** Open under the standing protocol; confirm §1's pre-conditions; state tier and holds.
**Step 2.** Read R8 §4.0 in full, then §§4.1–4.8 for what depends on it. Read R12 §7.6.
**Step 3.** Verify every mechanism fact at source (§2.2), citing file:line.
**Step 4.** Author the brief at
`operations/agent-circles-2026-08/2026-09-14-MENTOR-QUESTIONS-producer-question-FOR-RULING.md`
(adjust the date to the authoring day from `date`, never from context).
**Step 5. PR19.** A build plan is not being drafted, so PR19's letter may not engage — **but launch
an independent review anyway** if the brief makes any load-bearing claim about current behaviour.
R12's own experience is the argument: three blind reviewers found twelve real defects in work its
author believed sound, and the dimension that found nothing was the least informative.
**Step 6.** Append a decision-log entry at the **physical tail** (newest entries are at the END).
**Step 7.** Session close; hand the brief to the founder to relay. **The AI never relays and never
pushes.**

---

## 4. Anticipated session shape

One sitting. The brief is a question document, not a design — it should be shorter than R12's build
brief and denser in verified mechanism facts. The largest risk is **over-reach**: answering item 4,
or proposing a producer rather than asking who it is.

---

## 5. Rollback

`git revert` the session's commit. Documents only; nothing live to reverse.

---

## 6. Context the session should not have to re-derive

- **W2's clock is RUNNING.** The founder determined 2026-09-14 that R12's sitting was W2's first;
  the clock started at its first consult record, **`2026-09-14T08:44:36.147Z`**. The baseline is
  **five ordinary consult days** from that record (Q-M4) — and **which days are "ordinary" is the
  founder's judgement, not a computation** (the standing opener: *"The count half restarts at zero.
  The 'ordinary' half remains the founder's"*). **No end date can be stated; do not invent one.**
- **The build bundle waits for the window's close** (Q-R12-B). This session is authoring and is
  admitted.
- **Two R12 elections are applied:** `accepted_move_count` is **derived, not stored** (its column is
  struck from the bundle); `election_basis` sits on the **candidate row**. Phase 3's **N = 3**.
- **A defect is parked, not pending:** consult-side Condition-3 parity **is owed** and the capture
  gap **is a defect** (ruled 2026-09-14), but the fix is in `harness/gate1` and **waits for the
  window's close.**

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
