# Next-Session Prompt — Curiosity / puzzle-taxonomy stubs + guide-circle governance record

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier: `code-elevated`.** Settled — **item 4's migration is RULED DEFERRED** (2026-08-18 Q1), so no
live CHECK widening is in scope. If anything would push this to `code-critical`, stop: it is out of
scope for this session.
**Predecessor:** `2026-08-18-perimeter-completion-CLOSE.md` (`fba9b4c`, pushed, Vercel green).
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

It should not. But the 2026-08-17 ruling's instruction to *"publish A3's original wording"* is
**AMENDED** by the 2026-08-18 Q3 ruling: a bare **"every time" now OVER-PROMISES and may not be
published**. A session acting on the older ruling alone would publish a claim the mentor has since
ruled dishonest. The ruled replacement wording (preferred + floor formulations, verbatim) is staged at
`operations/agent-circles-2026-08/2026-08-18-limitations-crisis-wording-STAGED.md`. Publication
remains gated on the perimeter being confirmed LIVE, which has not happened.

## Carried from the perimeter session (unrelated, still open)

The empty-subject billed-call defect in the **17 routes wired in the predecessor session** (fixed
only in the 3 wired 2026-08-18; see `hasScreenableSubject`); no per-route runtime invocation tests
for those 3; `/limitations` still gated on live perimeter confirmation **and now needing the Q3
bound**; **M-5 ("nothing happens afterwards") remains P0 and is not discharged by any of this.**

**Already applied 2026-08-18, do not redo:** the `/api/guardrail` exclusion entry was updated from a
deferral to a reasoned judgement per Q4, and the deferral notation retired. Battery re-verified 689/0.

*End of prompt. The valuable move here is item 3 and the two stubs; item 4 is where the care is owed.*
