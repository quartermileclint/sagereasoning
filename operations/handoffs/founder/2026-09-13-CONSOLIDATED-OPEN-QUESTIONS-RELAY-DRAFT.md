# CONSOLIDATED RELAY DRAFT — open questions for the mentor, and the founder's own decisions

**Assembled 2026-09-13 (evening, from `date`) at the founder's request, by the autonomous session that
drafted the Part (1) mark record. DRAFTED, NOT SENT — the AI does not relay.**

**Every item was re-derived from primary sources for this brief, not restated from memory.** Where a
question turned out to be **already ruled**, that is said rather than passed through — three did.
Recommendations are the assembling session's and are **clearly separated from the questions
themselves**, so the mentor receives the question and not the advocacy.

---

## PART 1 — WHERE THINGS STAND (the short version)

**The current false-hold observation window closed its clock today at three of four.** Part (1)'s
seven-day mark passed at `2026-09-13T09:44:55Z`; part (3) is MET regime-scoped (0 false-positive / 164
correct under `at-action-v2-composed`); part (4) is SATISFIED. **Part (2) is NOT MET and cannot be
discharged from this window** — `andreia` has **4 records in the whole window, all on the consult
path, none on the guard path**, and *"one observation is not an evaluation."* Per Q-S1 the mark closes
this window and **does not carry into W2**.

**The W2 window — the differently-composed window that could discharge part (2) — has an unsettled
start.** Two binding rulings landed on 2026-09-13 hours apart; between them the R11 standing-runner
design sitting ran in exactly the mode Q-M3 describes and produced 32 consult records. **Whether its
first consult record started W2's clock is Question 1 below, and it is the highest item.**

**Everything downstream waits on that**: the date of W2's own part-(1) mark, the start of the S11-D2
baseline (Q-M4: five ordinary consult days from W2's first record, count restarting at zero), and
whether sittings running right now are inside or outside the window.

**Separately, R11 designed two documents and drew seven rulings**; R8-D7's *parameters* remain
deliberately open by ruling (set from live-loop data that does not yet exist), and the bounded
founder-attended re-run that would produce that data is prepared but not run.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.** Nothing below changes any of those.

---

## PART 2 — QUESTIONS FOR THE MENTOR

### ⚖️ Q1 (HIGHEST) — Did the R11 sitting start the W2 window's clock?

**Full evidence and the neutral statement of both readings:**
`operations/trust-layer-2026-07/2026-09-13-w2-clock-start-EVIDENCE-MEMO.md`.
**A standalone relay is already drafted:** `…/2026-09-13-w2-clock-start-RELAY-DRAFT.md`.

**The question.** Q-M3 rules: *"The first consult record of a design sitting on this work starts the
W2 window's clock."* Q-M1 amended the ordering to **(c) the standing-runner design track primary**.
R11 **is** that track, ran on the measured checkout in deliberately-set Write/Edit mode, under a
prompt that does not name the observation goal (Q-S2-conforming on its face), and wrote 24 of its 32
consult records into **two of the three documents Q-M3 names by name**. **But** the earlier 05:30
ruling says the clock starts at the first consult record *"from whichever work is designated. **This
is the founder's call.**"*

**The crux, isolated:** does Q-M1's **ordering of candidates** constitute the **designation** that the
05:30 ruling assigns to the founder — or did Q-M1 narrow the menu without choosing from it?

**One thing the mentor should know before ruling.** The sentence most often cited against the clock
having started — *"the first sitting is the founder's to open under a Q-S2-conforming prompt"* — **is
not in either ruling.** It sits below `*End of verbatim ruling.*` under a heading its own author
titled *"Recording notes (the executing session's, not the ruling's)"*, and a parallel note at the
foot of the 05:30 file says the same. **Both were written before R11 ran.** They may still be the
right reading; they are not law, and the relay should not present them as such.

> **RECOMMENDATION — and it disagrees with the textually stronger reading, deliberately.**
> **On the text, reading A is stronger:** Q-M3 is declarative about what *starts* a clock rather than
> permissive about who may start one; Q-M1 supplied the designation; R11 met every stated condition.
> **I nonetheless recommend B — that the clock has not started and the founder opens a clean first
> sitting — on an asymmetry-of-risk argument rather than a textual one.** If the mentor rules B and A
> was right, the cost is ~9 hours of records that do not count. If the mentor rules A and B was right,
> **the window's first day is permanently composed of sittings that nobody ran as window work** —
> including this one, which hit a 33% consult-outage rate and two 55-second timeouts — and that is
> precisely the *"materially different composition is a materially different window"* problem Q-S1 was
> decided on. **B is recoverable; A is not.** If the mentor prefers A, one clarification would help:
> what, in the record, would distinguish a sitting *opened as* W2's first from R11 — given Q-S2 forbids
> the prompt from saying so in terms?

---

### ⚖️ Q2 (NEW — surfaced by this session, unruled anywhere) — May two windows overlap on the same records?

**Under reading A of Q1, R11's 38 records sit inside the current (now-closing) window *and* inside the
W2 window simultaneously** — one append-only buffer, two windows, the same rows. **No ruling this
session read resolves whether that is permitted**, or what it does to each window's composition
disclosure.

It matters beyond Q1: the buffer is continuous and every future window will be carved from it, so the
project will face this again whatever the answer to Q1.

> **RECOMMENDATION.** Rule that **a record belongs to exactly one window**, and that a new window's
> clock starting closes the prior window's *intake* even where its clock has not yet run out. The
> alternative — shared records — makes each window's composition disclosure describe a population it
> shares with another, which is the same class of error Q-S1 identified in describing two windows as
> one. **If the mentor rules that overlap is permitted, the composition disclosure on both windows
> should be required to name the shared span explicitly.**

---

### ⚖️ Q3 — R8-D7 §5 Q2: is a provenance-triggered stratum a legitimate live trigger?

Source: `operations/agent-circles-2026-08/2026-09-13-R8-D7-sampling-policy-SCOPING-DRAFT.md` §5 Q2,
verbatim:

> Q-R2 accepted the pre-declared stratum for the *election* because the classes were declared before
> the run. A *live* policy that examines previously-rejected inputs harder selects on the measured
> variable (limit 2) and, under W, converges on a ratchet. Is that a floor (a ceiling on permitted
> risk, applied to an input with known adverse history) or a category error of the Q-S2 kind
> (provenance standing in for behaviour)?

> **RECOMMENDATION: rule it a category error — no.** It selects on the measured variable, and under
> worst-of-K (where any floor blocks and no rejection can recover) it ratchets: an input rejected once
> is sampled harder, so is more likely to floor again, so is sampled harder still. **Note also that
> Q-R11-A1 may already substantially answer this** — it ruled a first-draw-signal trigger *"admissible
> only on a measured relation to the latent floor; none is admissible before Deliverable A's
> cross-tabulation exists."* A provenance trigger is a different trigger, so it is not formally
> pre-empted, but the same reasoning reaches it. **Worth asking whether the mentor considers Q-R11-A1
> to have settled the trigger class generally.**

---

### ⚖️ Q4 — R8-D7 §5 Q3: can a confidence signal be designed before the near-boundary population is measured?

Source: same file, §5 Q3, verbatim:

> Q-S2 ruled the gap not closed. Option C needs a measured signal-to-variance relation that does not
> exist. Is the mentor's ruling that Option C is unavailable until that measurement exists, or that
> some first-draw signal (proximity distance to the threshold; `is_kathekon: null`) is admissible on
> doctrine alone?

> **RECOMMENDATION: no, and this may be close to already-ruled from three directions.** Q-S2 ruled the
> near-boundary gap not closed; Q-M8 forbids a confidence scalar on a sampled verdict; and the
> **Prerequisite Criterion** rules against a design producing a practitioner-facing output that
> resembles wisdom without building the prerequisite — which a confidence signal derived from an
> unmeasured relation would be. **I recommend putting it anyway**, because the three rulings reach it
> by different routes and none addresses it head-on, and a design session will otherwise re-derive the
> answer from inference.

---

### ⚖️ Q5 — The three standing `governance` scoping sessions, all recorded OPEN and awaiting ruling

From `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`:

| Session record | Opens | Recorded status |
|---|---|---|
| `2026-08-12-SESSION-kathekon-role-relative-evaluation-SCOPING-RECORD.md` | Should candidate evaluation be **role-relative**? Gap confirmed **total** — `/api/guardrail` takes no role input. | **OPEN** |
| `2026-08-12-SESSION-hegemonikon-drift-and-melete-SCOPING-RECORD.md` | Does the trust record attest anything about **discriminative range**? Criterion: Seneca *Letters* 75.8–9 — relapse-resistance, not level. | **OPEN** |
| `2026-08-12-SESSION-layer3-per-consumer-rendering-SCOPING-RECORD.md` | Re-open the S7 "Layer 3 internal-only" decision? | **OPEN — but see below** |

> **RECOMMENDATION on the first two: ask which, if either, should open next**, rather than asking for a
> substantive ruling now — both are scoping sessions whose gate is the mentor's, and neither has a
> drafted question. **The role-relative one is the more consequential**: a total gap on role input
> touches the gate's own evaluation, and Q-M5's would-be-winner scope interacts with it.
>
> **RECOMMENDATION on the third — flag it as a probable record defect rather than relay it.**
> **Ruling Set D (2026-08-15) appears to have already ruled this**: L-1 adopted O-B (practitioner-type
> calibration on live surfaces, wording-level first), opened **O-C** as a design question only, and
> stated the O-C design session *"is not licensed by this ruling — it requires a separate scoping
> session, which itself requires a ruling before execution."* **The priority index's "OPEN" row and
> Ruling Set D are not obviously consistent**, and this is the kind of drift the project has been
> bitten by before. **I recommend the founder reconcile the row against Ruling Set D before relaying
> anything on it.**

---

### ⚖️ Q6 — Two relayed instructions carried as "not yet ruled"

Both from `2026-09-01-mentor-instruction-bidirectional-algorithm-verbatim.md`, held in the
standing-runner register, each marked *"not yet ruled — a relayed instruction, no ruling request has
been raised on it"*:

1. **GS-ATRF-1's blast-radius proxy — an alternative basis.** Blast radius as a *topological* property
   (the number and kind of expanding moves from the generalisation of the practitioner's current
   state) in place of task-level consequence assessment. Explicitly *"a candidate for GS-ATRF-1's
   resolution, not a ruling"*; does not on its own reopen the 2026-08-11 ruling.
2. **The generation-step design candidate** (the "bidirectional/reverse algorithm" shape). Its
   topological continuous-connection-to-core constraint is offered as a possible structural analogue of
   the weights constraint — **but GS-CYB-1's two conditions still gate any weighting or scoring
   function entering the generation step, unmoved.**

> **RECOMMENDATION: do not relay these yet.** Both are design inputs held for the standing-runner
> track, both are marked candidate-not-ruling by their own text, and **R9 has already designed against
> them** without needing a ruling. Asking now spends a mentor exchange on questions no open session is
> blocked by. **Raise them when the receiving session opens** — unless the mentor's own view is that a
> relayed instruction should not sit unruled indefinitely, which is itself a fair thing to ask.

---

## PART 3 — DECISIONS THAT ARE THE FOUNDER'S, NOT THE MENTOR'S

> **⚖️ REWRITTEN 2026-09-13 (evening), AFTER the six questions were ruled.** The pre-ruling version of
> this table is in git history at commit `3672181`. Three items are discharged, three are new, and one
> constraint now governs the ordering of all of them. **Verbatim, canonical:**
> `operations/trust-layer-2026-07/2026-09-13-mentor-ruling-consolidated-six-questions-w2-clock-window-membership-verbatim.md`.

### 3.0 The constraint that now governs the ORDER — read this before the table

**Q2 ruled that a new window's clock starting closes the prior window's intake.** Two consequences,
and together they are the whole sequencing problem:

1. **The current window's intake is still OPEN.** Its clock passed its mark on 2026-09-13, but on Q2's
   mechanism nothing closes its intake until W2's first sitting opens. **Every session run in this
   repo between now and then adds records to the current window — after its mark.**
2. **The moment W2 opens, everything counts toward W2.** Q1's whole ground was that R11's records were
   *"not the records a deliberately-opened W2 first sitting would produce."* That reasoning applies
   just as much to whatever runs *after* W2 opens. **W2's composition will be whatever you run in this
   repo from that instant, designated work or not.**

**So the order is the decision.** Housekeeping and one-off acts belong *before* W2 opens; only work you
want measured belongs after.

**One clean exception worth knowing:** **Session R runs in the scratch project
`…/PROJECTS/idea-loop-rerun-2026-09/` and produces NO records in this repo's window** — it is
orthogonal to all of this and can run at any time. **Session S runs *here*** and does produce records.

---

### 3.1 The table — recommendations updated for the ruling

**D-numbers are for you to rule on by number.**

#### BEFORE W2 opens — everything here lands in the current window, whose clock is already done

| # | Decision | Recommendation |
|---|---|---|
| **D-1** | **Record the Part (1) mark.** Draft at `…/2026-09-13-current-window-part1-mark-RECORD-DRAFT.md`. | **Record the *clock* anchor** (probe + 7d = `09:44:55Z`), noting the script's record-span metric beside it, and attach the composition disclosure. **CHANGED BY THE RULING:** the disclosure is **as-of, not final** — the window keeps accruing until W2 opens, so either record it as as-of, or do D-2 first and record a closed window. **I now recommend recording it as as-of and not waiting** — the composition will not change materially, and holding F-4 open a fourth time costs more than the precision gains. |
| **D-2** | **Adopt the standing opener** (F-2). Until then the 2026-09-10 version is operative and carries three known-false lines. | **Adopt it.** Its addendum §D is now rewritten from OPEN to RULED, so it is current as of this evening. **More urgent than before** — the version it replaces says the W2 designation is still yours to make, which is now wrong twice over. |
| **D-3** | **Sign the record-level compliance-not-virtue clause** (F-3) — the one R18 item still owed in the logos-on program. | Sign it. Nothing depends on further analysis and it is not affected by the ruling. |
| **D-4** | **Apply the ruled ATRF item-3 wording to `manifest.md`** (Q-R11-C1). **Reserved to your own act** — no session may make it. | Do it before W2 opens. The wording is ruled, *"whether the idea was completed"* is removed, and it is a governing-surface edit you will not want competing with a running window. |
| **D-5** | **Reconcile the Layer-3 priority-index row against Ruling Set D** — **newly ruled as your task** (Q5). | Do it now; it is a five-minute read. If Ruling Set D is consistent with the current state, *"the 'OPEN' row is a documentation drift and should be corrected."* If not, surface *"a specific question, not… a general relay."* I have marked the row NOT-CONFIRMED but have not resolved it — that reconciliation is yours. |
| **D-6** | **F-I — revoke `sagereasoning:option-s@v1`**, ruled *"immediately"* at the election's close; **unverified from a repo session whether it is done.** | **Verify and revoke if not.** This is an open production credential with ~520 unused quota units. Of everything in this table it is the only item with a live security surface. |
| **D-7** | **F-E — close idle peers.** 13 interactive sessions are open against the standing ruling to work one arc; several are ≥1 day old. | Close them **before** W2 opens. A stale peer that wakes inside W2 contributes records to the window with no one having decided it should. |
| **D-8** | **F-F — the `manifest.md` AC5 contradiction** (bolds *"does not hand-enumerate route-level membership"*, then enumerates all 43; counts currently correct, the defect is the contradiction). | Fold into D-4's sitting — same file, same class of act, one governing-surface edit instead of two. |

#### THE GATING ACT

| # | Decision | Recommendation |
|---|---|---|
| **D-9 (HIGHEST)** | **Open W2's first sitting.** Newly the gating act: Q1 ruled the clock has not started and *"the founder opens a clean first sitting under a Q-S2-conforming prompt. That sitting's first consult record starts W2's clock."* | **Open it once D-1…D-8 are done, and not before.** The work is Q-M1's **(c) the standing-runner design track** (primary). The prompt must **name the work and never the observation**, and it must be **your act of opening** — that act, not the prompt's content, is what the ruling says distinguishes it from R11. **I can author the prompt at your direction; I should not open it.** Note the corollary you may not want: from that instant, everything running in this repo is W2's composition. |

#### AFTER W2 opens — only work you want measured

| # | Decision | Recommendation |
|---|---|---|
| **D-10** | **Open the `kathekon-role-relative-evaluation` scoping session** — ruled (Q5) to open **before** the hegemonikon-drift session, because *"Q-M5's would-be-winner scope interacts with the total gap on role input."* | **After W2 opens, not before.** It is consequential Write/Edit design authoring in `operations/` — exactly the shape that feeds the window well. **But note it is a *separate track* from Q-M1's designated (c) work**, so if you want W2's early composition to be the designated work, let the standing-runner sitting run first. |
| **D-11** | **Session R's founder-walked half** — elect mint numbers (**doubled**: two quota units per call), mint a **new** runner credential (the novelty window is keyed by `credential_ref`), place tokens, attend the run, revoke both at close. | **Any time — it is orthogonal.** Session R runs in the scratch project and produces **no records in this repo's window**. **Session S does run here**, so open Session S after W2 if you want its records in W2, or before if you do not. This remains the item that unblocks R8-D7's parameters. |

#### Unchanged by the ruling — parked or carried

| # | Decision | Recommendation |
|---|---|---|
| **D-12** | **Q-M4's "ordinary" day judgement.** | **MATERIALLY CHANGED: this is now two questions, not one.** Q-M4 restarted the S11-D2 baseline at zero from W2's first record, so **2026-09-12's ordinariness no longer bears on the D2 baseline at all** — that question is moot for D2. It remains live **only** for the current window's own part-(1) composition disclosure. I still lean to naming it non-ordinary there (highest record count *and* highest outage share, the spend-limit day), but it is now a much smaller decision than when I first raised it. |
| **D-13** | **F-7 — part 3's consult/guard split**, open and unruled, parked by your own election until part (2) resolves. | **Leave parked.** Part (2) is unchanged by this ruling — still NOT MET and still needing a differently-composed window, which is what W2 is for. |
| **D-14** | **F-1** — designate the W2 work. | **Fully discharged.** Q-M1 designated it; Q1 settled the remaining timing question. Nothing left. |
| **D-15** | **F-B / F-D / F-G / F-H / F-J** — the peer's `environmental-context.json`; `npx` fail-closed on the pre-commit guard; the PR26 concurrency election; founder-hub Q4; TEST parity. | All carried unverified; none gates anything above. **F-B is worth two minutes before D-9** — it is a modified file sitting in the tree that every session's `git status` has to step around. |

---

## PART 4 — RECORD DEFECTS WORTH FIXING (found while assembling this)

1. **The R8-D7 scoping draft's header says "§5 Q2, Q3, Q5 and Q8 remain unput." Q5 and Q8 are now
   ruled** — Q-R11-A2 (*"Gate only… a separate design with its own measurement"*) answers Q5, and
   Q-R11-A3 (*"The defect does not bind the new capture by construction"*) answers Q8. The line
   predates the R11 ruling. **Only Q2 and Q3 remain**, which is why only those two are relayed above.
2. **The priority-index Layer-3 row vs Ruling Set D** — see Q5 above.
3. **My own error, corrected today and worth knowing because it moved a part-(2) figure:** an earlier
   draft reported `andreia` at **6** consult records; it is **4**. The 6 came from matching the string
   against each record's whole JSON, which also caught two `actionPreview` **filenames** containing the
   word. **The error made part (2) look 50% better evidenced than it is.** Caught by a blind reviewer
   and corroborated against the opener's own independent "andreia 0 / 4".

---

## PART 5 — WHAT I RECOMMEND YOU ACTUALLY RELAY

**Relay Q1 and Q2 together.** They are the same subject — when a window starts and what belongs to it
— and Q2 only bites under one answer to Q1. The standalone relay draft for Q1 already exists and can
be sent as-is with Q2 appended.

**Relay Q3 and Q4 together as a second, lower-priority exchange**, or fold them into the next
standing-runner exchange. Neither blocks anything today: R8-D7's parameters are ruled to wait for
live-loop data regardless.

**Ask Q5's first two as a sequencing question, not a substantive one.** Do not relay Q5's third item
or Q6 — reconcile the first against Ruling Set D, and hold the second until the receiving session
opens.

---

*Drafted, not sent. No relay was made. No record was altered by assembling this, no clock started or
stopped, and no question here was answered on the founder's or the mentor's behalf.*

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
