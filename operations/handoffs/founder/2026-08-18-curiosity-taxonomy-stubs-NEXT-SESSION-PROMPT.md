# Next-Session Prompt — Curiosity / puzzle-taxonomy stubs + guide-circle governance record

> **⚠ SPENT — executed 2026-08-19.** All three items built, item 4's migration correctly deferred per
> the Q1 ruling. Decision: `D-CURIOSITY-TAXONOMY-STUBS-BUILT-GUIDE-CIRCLE-RECORDED-2026-08-19`.
> Close: `2026-08-19-curiosity-taxonomy-stubs-CLOSE.md`. **Do not re-run.** One finding is worth
> carrying if you arrive here from elsewhere: this prompt's F-notes describe `assessStructuralNovelty`
> as living in a dark module — `/api/practice/fresh` has been LIVE in production since 2026-08-10, and
> the Q5 ruling was given on that false mechanism fact. The ruling's direction survives; the risk
> classification did not.

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier: `code-elevated`.** Settled — **item 4's migration is RULED DEFERRED** (2026-08-18 Q1), so no
live CHECK widening is in scope. If anything would push this to `code-critical`, stop: it is out of
scope for this session.
**Predecessor:** `2026-08-19-perimeter-live-confirmation-and-limitations-publication-CLOSE.md`
(`D-PERIMETER-LIVE-CONFIRMED-LIMITATIONS-PUBLISHED`, pushed, Vercel green). **Note: this prompt was
originally authored 2026-08-18, queued behind the perimeter-confirmation session, and has now been
corrected in place** — the `/limitations` warning below is updated to reflect that the perimeter is
confirmed live and the page is published, not still gated.
**Source:** the founder's 2026-08-18 exploratory-session mentor relay, **now ruled**. All five
questions raised against it were answered — read the verbatim record FIRST:
`operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-curiosity-scoping-verbatim.md`

---

## Step 0 — Open

Read `/adopted/standing-protocol-cache.md`, then this file, then:

- `operations/agent-circles-2026-08/2026-08-08-autonomous-loop-design-brief.md` — the **Q11 binding
  sequence** lives in its status header. The relay states Q11 is unchanged; verify that first-hand.
- `manifest.md` — the three un-numbered mentor-directed sections, especially the **ATRF** and the
  **Consciousness and Continuity Obligation**. The relay's governance record sits *alongside* ATRF.
- `/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/RUN-LOG.md` — **the run is
  CLOSED** (2026-08-16, cycle 20, mentor-ruled). This bears directly on item 4.

**Check HEAD, do not assume it.** Re-verify the byte-identity guard posture first-hand
(`GATE1_FALSE_HOLD_CAPTURE` in the process env AND `.claude/settings.local.json`).

---

## THE THREE FINDINGS — ALL NOW RULED ON

Established first-hand 2026-08-18 against the live code, put to the mentor, and **all three ruled**.
Retained because the next session must re-verify the mechanism facts, not inherit them from this file.

**F1 — Item 4 is a live CHECK widening, not a stub. RULED: no migration this session (Q1).**
`website/supabase-idea-loop-watching-migration.sql` (~line 95) declares
`cycle_outcome TEXT NOT NULL CHECK (cycle_outcome IN ('winner','null_cycle','dependency_unavailable',
'terminated_by_timeout'))` on a LIVE table holding real validation-run rows. A fifth value is a
production migration — Critical, AC7, founder-walked, migration-before-code. The `not_selected`
precedent (candidate-level, 2026-08-10) is the correct model AND the proof this is multi-step.
**Two prior incidents in this repo (C15; Stoa Q5c/Q13a) found a CHECK independently widened by an
unrelated migration, production already at a different target than the file assumed. Re-derive the
live constraint with `pg_get_constraintdef` before writing any migration — never trust the file.**

**F2 — Item 4's stated rationale has expired. RULED: migration deferred (Q1).**
The relay asks for the outcome to be "visible in the watching table's outcome column so that when it
fires during the bounded validation run, it is identifiable." **The bounded validation run closed
2026-08-16 at cycle 20 on mentor ruling; cycle 21 was never opened.** The stub cannot fire during it.
The value may still be wanted for the standing-runner design — but that is a *different* rationale,
and substituting it is the mentor's call, not the builder's (PR20).

**F3 — Naming collides with the live convention. RULED: use `taxonomy_question` (Q1).**
The relay proposes `curiosity-trigger` and `taxonomy-question` (kebab). Every live outcome value is
snake_case (`null_cycle`, `dependency_unavailable`, `terminated_by_timeout`, `rejected_by_guardrail`,
`not_selected`). Internal mechanism names need not match the outcome vocabulary — but an outcome
VALUE must, or it fails the CHECK as written.

---

## What to build — items 1, 2, 3

### 1. Puzzle taxonomy — stub data structure
A named, addressable type only. **No schema, no route, no population.** Home: alongside
`assessStructuralNovelty` (`website/src/lib/substrate/idea-loop-types.ts:222`), which is the
committed-but-dark function the fresh endpoint wraps.

Carries: puzzle type (`pattern | contradiction | discovery | connection`), origin (examination-record
ref or external), questions opened (array, empty at stub), taxonomy connections (array, empty at stub).

Add a comment at the structural-novelty assessment noting the current standard — structural novelty
against the existing corpus — is a **placeholder for a richer standard** once the taxonomy is
populated. Do not change the assessment's behaviour.

**Design grounding — ADDED 2026-08-19, record it in the type's docstring.** From the RL-passage
addendum (verbatim record:
`operations/agent-circles-2026-08/2026-08-18-addendum-reinforcement-learning-assessment-verbatim.md`).
It supplies the *why* behind the shape already scoped above, and one boundary worth having in writing
before anything populates the taxonomy:

- **Why shapes of inquiry, not conclusions.** *"storing the chain of reasoning rather than the answer
  is what makes tuning meaningful is the computational grounding for the puzzle taxonomy's design
  principle. The taxonomy stores the shapes of inquiry, not conclusions."* This is why the type
  carries *questions opened* and *taxonomy connections* rather than findings or answers.
- **The non-duplication boundary — the load-bearing half.** *"the taxonomy's value is not duplicated
  by what frontier labs are building — because the taxonomy stores examination chains about the
  internal world of reasoning, not the external world of facts."* Write this down. It tells a future
  session what the taxonomy is **not** for, and is the cheapest available guard against it drifting
  into a general knowledge store.

**This changes no field, route, behaviour, or schema** — it is docstring content for a stub already in
scope. If following it would add any of those, stop: that is scope creep, not grounding.

### 2. Curiosity-loop trigger — stub mechanism
A named stub at the point structural novelty is confirmed. **Logs that it was reached, passes
through, nothing else.** Internal mechanism name (not a surface name) — `curiosity-trigger` is the
relay's suggestion and is fine as an internal identifier.

Comment its future function: classify novelty by puzzle type, consult the taxonomy for related
puzzle shapes, **generate questions rather than explanations**.

**Placement is RULED (2026-08-18 Q5): server-side, beside the taxonomy stub.** The interpretation
was put to the mentor and confirmed — verbatim: *"Placing the trigger runner-side would defer it
behind the standing-runner opening with no gain."* **Carry forward, do not lose:** the mentor also
ruled that when the standing-runner design opens, placement must be **revisited explicitly**, and
that the honest answer may be **both** — *"server-side as a seam that confirms novelty, runner-side
as the mechanism that acts on the confirmation."*

### 3. Guide agent circle — governance record
**A document, not a build artefact.** Sits alongside the ATRF as a companion governance record.
Suggested home: `operations/agent-circles-2026-08/`.

Records, from the relay: runner agent **convenes** (it has the information, found the question, knows
there are no bringers). Human guide **chairs** — governance authority follows moral accountability,
not information access. **Observer class distinction:** observers who receive the record and respond
through their own subsequent examination are permitted; observers who interject during examination
are not. The circle is an **examination body, not a decision-making body**. Output is a more examined
impression — what the theory explains, where it reaches the unknown honestly, where it is dressed-up
explanation, what questions it opens. That record returns to the taxonomy and enriches it.

Also record the **string-theory parallel** as accepted precedent for principled extrapolation toward
the unmeasurable — internally consistent, grounded in observation, reaching beyond empirical
verification — **with the warning that internal consistency is necessary but not sufficient**, and
the note that the Stoic logos doctrine operates the same way.

---

## Item 4 — RULED: retain the intent, DEFER the migration

**The mentor ruled 2026-08-18 (Q1). Do not add the outcome value to the production table.**

Verbatim: *"The outcome value should not be added to the production table on an expired rationale…
Defer the schema migration until the standing-runner design opens. At that point the outcome value
should be added with the standing-runner's rationale — not the bounded-run rationale — and the
spelling should follow the established snake_case convention: `taxonomy_question`, not
`taxonomy-question`. The stub in the current build should be code-only, logging the outcome without
writing to the constrained column, until the migration is ruled and walked."*

**So, in this session:**
- Build the stub **code-only**. It logs the outcome and **must not write to `cycle_outcome`** — that
  column's CHECK does not admit the value and will reject it.
- Use the spelling **`taxonomy_question`** (snake_case) everywhere, including in the code-only stub,
  so no rename is needed when the migration eventually lands.
- **No migration. No CHECK widening. No production DB change of any kind.**
- The intent is retained and recorded: when the taxonomy yields a question and no current bringer
  exists, that outcome must be distinguishable from a null cycle. Its home is the standing-runner
  design.

## Record-items carried by the 2026-08-19 addendum — DO NOT ACT ON THESE

The RL-passage addendum (recorded verbatim, see item 1's design grounding) carries three further
items. **Only its connection 1 is in this session's scope** — the docstring grounding above.

The other three are **record entries for other sessions**. They are named here so this session knows
they exist and does **not** absorb them:

1. **Positioning (connection 2)** — the dispositional layer (practitioner's hexis, the guide agent's
   accumulated examination history, the ATRF's task-agnostic harness) is named as SageReasoning's
   specific contribution to the alignment space, *"when the project's positioning is next reviewed."*
   **No positioning review is scheduled.** Not this session's.
2. **GS-ATRF-1 (connection 3)** — an epistemic-status rule offered as a candidate mechanism for the
   §(c-bis) basis-lessness gap. **Already routed** to
   `operations/primal-substrate-2026-08/gs-atrf-corrections.md` **§(e)**, where the owning session
   meets it. **It carries a blocking gap** — the framework has no repo record (see below). Not this
   session's; this session touches neither GS-ATRF-1 nor the proxy.
3. **The hexis open question** — whether a reasoning system can be aligned toward dispositional
   stability rather than output correctness alone. Verified 2026-08-19 to match the second component
   of `manifest.md`'s **Consciousness and Continuity Obligation** (*"a mechanism by which an agent's
   disposition deepens over time rather than resetting between cycles"*). Surfaces when that
   Obligation comes into active scoping. **Not this session's, and not any current session's** — the
   Obligation is a named direction, not a build item.

**Two founder actions are outstanding and are not this session's to perform or chase:**

- **Relay the epistemic status framework** so it can be recorded. `epistemic status` returns **zero
  repo hits**; the framework exists only in the 2026-08-18 exploratory session, whose record is also
  not in the repo. Until relayed, the GS-ATRF-1 session can carry in only the single quoted sentence,
  not a framework.
- **Decide whether `manifest.md`'s Consciousness and Continuity Obligation should carry a pointer** to
  the addendum. Deliberately not done unilaterally — a manifest edit requires a same-session cache
  update and a `D-CACHE-DRIFT-…` entry, a cost that should be paid deliberately rather than ridden in
  on a records act.

**If this session finds itself scoping GS-ATRF-1, the loop-level blast-radius proxy, the ATRF, or the
Consciousness and Continuity Obligation — stop.** All four are out of scope, and three are explicitly
gated behind the post-validation-run ATRF scoping session marked *"do not open early."*

## Constraints that bind regardless

- **The Q1 hard constraint: the loop proposes; it never executes.** Nothing here may create a path
  from a generated candidate to an action-taking tool or scheduler.
- **The Q11 sequence and the first build gate are unchanged.** Nothing here jumps that queue.
- **Nothing licenses a route, flag, credential, or schema** beyond the stubs — and item 4 is the only
  schema, which is why it is held back.
- GS-ATRF-1/2/3, the surface name register, and the runner agent identity are all unchanged.
- **PR19 applies** if any live-surface code changes. Items 1–3 as scoped are additive/inert; say so
  honestly, and run PR19 if that stops being true.

## ⚠ IF ANYTHING IN THIS SESSION TOUCHES `/limitations` — READ THIS FIRST

**UPDATED 2026-08-19 — the situation this warning originally described is resolved.** The perimeter
was confirmed LIVE (founder-run smoke, 2026-08-19) and `/limitations` is now **published** with the
Q3-ruled wording (`D-PERIMETER-LIVE-CONFIRMED-LIMITATIONS-PUBLISHED`) — the coverage bound verbatim,
plus the M-5 "nothing happens afterwards" disclosure kept prominent. This session's scope (items 1–3,
the taxonomy/curiosity stubs and the governance record) has no reason to touch that page. If it does,
stop: that is out of this session's declared scope and needs its own grounding, not an incidental edit
riding on unrelated work.

## Carried from the perimeter session (unrelated, still open)

The empty-subject billed-call defect in the **17 routes wired in the predecessor-of-the-predecessor
session** (fixed only in the 3 wired 2026-08-18; see `hasScreenableSubject`); no per-route runtime
invocation tests for those 3; PR24 retention parity for `agent_hold_observations`; M-4 obligations 1
and 4; the RLS survey remainder. **M-5 ("nothing happens afterwards") remains P0 and is not
discharged by any of this** — publishing the disclosure is not building the write path.

**Already applied 2026-08-18, do not redo:** the `/api/guardrail` exclusion entry was updated from a
deferral to a reasoned judgement per Q4, and the deferral notation retired. Battery re-verified 689/0.

*End of prompt. The valuable move here is item 3 and the two stubs; item 4 is where the care is owed.*
