> **SPENT 2026-09-04** — the grounding ran; the mentor's brief was relayed into it, questioned (eighteen questions), corrected and adopted (`D-MENTOR-BRIEF-STANDING-RUNNER-DESIGN-SESSION-ADOPTED-RECORDED-2026-09-04`). The standing-runner track's current hold prompt is `2026-09-04-standing-runner-post-R10-grounding-and-await-NEXT-SESSION-PROMPT.md`; the current project-wide grounding is the standing opener, Version 2026-09-05.

# Next-Session Prompt — Grounding session: re-ground, report, and hold for the runner-design mentor instructions

**Paste this as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` — Standard risk. **Documents and reads only.** No code, no schema, no flag, no
migration, no credential, no live operation, no commit unless the founder elects one at the end.
**Critical Change Protocol NOT engaged. AC7 NOT engaged.**

**Expected HEAD at authoring:** `50ce187` (the prompt was first drafted at `767f3ee` and updated at the Gate-3 ruling). **One untracked file expected**, belonging to another
session and not to be touched:
`operations/handoffs/founder/2026-09-01-score-save-perimeter-activation-NEXT-SESSION-PROMPT.md`.

---

## Why this session exists

**This is a grounding-and-hold session, not a build or design session.** Its whole purpose is to
re-ground in the project's actual current state — from source and the record, not from summaries —
and then **report that it is grounded and standing by for the founder to relay new mentor
instructions relating to the standing-runner design track.**

**Do not open any of the queued work.** Do not start the standing-runner build brief, the
contested-migration walk, records hygiene, the O-C follow-on, or anything else on the standing queue.
If the grounding surfaces something that looks urgent, **name it and stop** — surfacing is this
session's job; acting is not.

---

## Part A — Open under the protocol (the standard opener)

Read in order:

1. **`/adopted/standing-protocol-cache.md`** (~3 min) — confirms tier, model selection, risk class,
   status vocabulary, signals, and the AI-failure-modes table. Note the **concurrency convention**:
   run `ListAgents` at open and note the peer count; `git status` twice; path-scoped commits only;
   never `git add -A`.
2. **This prompt in full.**
3. **The grounding document — `operations/p1-rebuild-2026-06/sage-practice-grounding-dossier.md`** —
   read in full. This is what the practice's mechanisms are *supposed* to deliver, its
   methodology-vs-mechanism boundary table (B1–B12), and the origins of the whole arc.
   > **A reading taken, stated so it can be corrected:** "the grounding document" is read here as the
   > grounding dossier, the one artifact in this repo that carries that name. It is dated 2026-06-12
   > and is arc-specific. **If the founder meant a different grounding surface, say so at open and
   > re-read against that instead** — the rest of this prompt is unaffected.
4. **`/CLAUDE.md`'s "Production state" block** — read the **2026-09-03 refresh first**, then the
   2026-08-12 reconciliation block, then the "Live in production" list. Treat its counts and statuses
   as **claims to verify, not ground truth** — that file's own header says so, twice.
5. **`/manifest.md`** — targeted sections only, plus the three un-numbered mentor-directed sections
   (the Moral Community Boundary; the ATRF; the Consciousness and Continuity Obligation).
6. **`operations/decision-log.md`** — the last six entries, and specifically
   `D-OC-GATE3-DESIGN-DOCUMENT-AUTHORED-PR19-REWRITTEN` (the predecessor session).
7. **The predecessor close:**
   `operations/handoffs/founder/2026-09-03-OC-Gate3-per-consumer-rendering-design-CLOSE.md`.

**Confirm at open:** tier; hold-point status (P0 0h — still active, still the founder's call); model
selection per the cache's AC1 table; status vocabulary; signals + risk classification; peer count.

---

## Part B — Verify the status claims rather than restating them (PR20)

**The point of this session is that the report at the end is trustworthy.** Restating `/CLAUDE.md` is
not grounding. Check each of the following against source and record what you actually found — and
where a claim cannot be verified from the repository, **mark it unverified rather than passing it**.

1. **The R20a perimeter count.** **Do not quote any number from any document.** Re-derive it from
   `HUMAN_FACING_POST_ROUTES` and `SUBSTRATE_GATE_ROUTES` in
   `website/src/lib/__tests__/r20a-invocation-guard.test.ts`. This file's own record shows the count
   has drifted repeatedly and has been wrong in `/CLAUDE.md` and in `/manifest.md` simultaneously.
2. **`SUBSTRATE_LAYER3_ENABLED` is unset and the three Layer-3 files are untouched.**
   **Note a defect in the check that was prescribed for this in a prior prompt:**
   `website/src/lib/substrate/layer3-prose.ts` **does not exist** — the file is at
   `website/src/lib/translation-sandwich/layer3-prose.ts`, and `git log` does not error on a
   non-matching pathspec. **Run `git log -1` per file, one command each.**
3. **The row-cap sweep is genuinely complete.** `D-ROW-CAP-SWEEP-C4-COMPLETE-LIVE-2026-09-03` claims
   every site in `operations/founder-hub-2026-09/2026-09-02-unbounded-select-sweep-REPORT.md` is now
   exhaustive-read. Spot-check two or three sites against source.
4. **The standing-runner track's actual open state** (Part C is the substance of this session — get
   it right).
5. **Anything in `/CLAUDE.md`'s 2026-09-03 block that a one-command check can confirm or refute.**
   Prefer checks that could come back negative.

---

## Part C — The standing-runner track: establish exactly what it is waiting for

This is the state the founder will be relaying mentor instructions *into*, so it must be accurate.
Read the primary records, not the summaries of them:

- `operations/agent-circles-2026-08/2026-08-30-standing-runner-design-R8.md` — the design, with its
  binding dated-annotations block.
- `operations/agent-circles-2026-08/2026-08-30-mentor-ruling-R8-producer-floor-semantics-verbatim.md`
  — the three R8 rulings. **Verbatim wins over every summary, including the decision log.**
- `operations/agent-circles-2026-08/2026-08-30-mentor-ruling-set-E-A2-A3-A4-D-verbatim.md` — the
  three items routed *to* this track (A2 role-relative evaluation; A3's melete surface; A4's
  per-consumer rendering + Stage-2 relational-context framing) and D's byte-identity-guard end
  condition.
- `operations/handoffs/founder/2026-08-30-R8-followon-rulings-adoption-NEXT-SESSION-PROMPT.md` — §C's
  elections, of which **2, 3 and 5 were left unelected**.
- **`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`** — **this is the named-input
  register**, and it is where the nine standing-runner rows carry their dated `[R8:…]` dispositions
  inline (verified: nine tagged rows plus a head-note). **Do not confuse it with**
  `operations/2026-08-24-OUTSTANDING-OPEN-QUESTIONS-REGISTER.md`, which is the separate
  outstanding-open-questions register and carries **no** `[R8:…]` tags — an earlier draft of this
  prompt named the wrong one, caught by checking rather than by restating.
- `operations/2026-08-24-OUTSTANDING-OPEN-QUESTIONS-REGISTER.md` — still worth reading for the A2/A3/A4
  rows and the C-series gates, but it is not the named-input register.

**What is believed true at authoring, for you to confirm or correct:**

- **R8 has already run** (2026-08-30). Its design is a proposal; nothing in it is activated.
- **The M-vs-W floor-semantics ruling is DEFERRED with its framing locked**, to *"the standing-runner
  track's next design-capable session"* — which, on the adopted passed-moment reading, is a **future**
  session, not R8.
- **Option S (sample-and-disclose) is ruled buildable and is NOT built.**
- **R8's single-backward-edge evaluation is carried as awaiting confirmation**, and must not be
  treated as settled in any design or build work before that confirmation.
- **Three Ruling-Set-E items are routed to this track**, which is *"not to be opened early"* per its
  own gating condition.
- **Four further named inputs arrived 2026-09-03 and now belong here** — **RULED, after this prompt's
  first draft was written.** The O-C Gate-3 rulings
  (`operations/agent-circles-2026-08/2026-09-03-mentor-rulings-oc-gate3-verbatim.md`;
  `D-MENTOR-RULINGS-OC-GATE3-ADOPTED-EXECUTED-2026-09-03`) settled the boundary: **Gate 3 owns the
  rendering surface and the floor constraint; this track owns Layer 3 injection and the Stage-2
  relational-context reframing.** Q1 requires anything Gate 3 produced that bears on those items to be
  **named in the handoff, not resolved** — and it is, at **§11 of the design document**: (i) the
  bounded (e) design's two rendering-surface decisions; (ii) the finding that **role material already
  exists** (a validated `role` on `CandidateProfile`, an A2A-card mapper, an `incompatible-role`
  exclusion, the calling gate's declared purpose — on the discernment path, not on `/api/reason`'s
  request), which corrects a premise this track might otherwise inherit; (iii) A4's routing premise
  being **false today**, which Q1 rules **does not dissolve the routing**; (iv) the
  `relationship_type` distinctness hazard. **Read §11; do not pre-empt the examination** — per Q1 and
  the 2026-08-19 carry-forward precedent, A4's content is examined **when this session opens, not
  before.**

---

## Part D — Produce the report, and stop

A short written report **in the session, not as a new file** unless the founder asks for one:

1. **Grounded state** — what was verified, with the check that established each, and what could not
   be verified from the repository (marked as such).
2. **Corrections** — anything in `/CLAUDE.md`, `/manifest.md`, or a recent close that the verification
   found stale or wrong. **Name them; do not fix them in this session** unless the founder elects it.
3. **The standing-runner track's precise waiting state** — what is deferred, what is routed in, what
   is ruled-but-unbuilt, and what the next design-capable session would open with.
4. **The standing queue behind it** — one line each, no elaboration: the founder-walked live steps
   (R4 activation batch; Class-B view-grants remediation; `triggered_rules` encryption migration; the
   close-hook case-2 decision; provenance-ledger slice 3), route (i)'s pending founder/mentor
   recommendation, AE-3 (deferred, preconditions unmet), and the **0h call**, which remains the
   founder's and which nothing in this session touches. **The O-C Gate-3 ruling is no longer
   outstanding — it was ruled and executed 2026-09-03; that track is CLOSED.**
5. **The statement this session exists to make:** grounded, and **standing by for the founder to relay
   new mentor instructions relating to the standing-runner design track.**

Then **stop and wait.** Do not propose next steps beyond the report. Do not open anything.

---

## What NOT to do

- **Do not open the standing-runner design session**, or any session it gates. It is explicitly *"not
  to be opened early."*
- **Do not act on the O-C Gate-3 design.** It is now **RULED** (2026-09-03) and still licenses
  nothing — the ruling's own exclusion list is explicitly unchanged: no activation, no code edit, no
  ENV-1 change, **no publication of any string, re-sited ones included.** Two of the design's
  proposals were **ruled against** (the delivery sentence's re-siting; the trust-record pointer) — do
  not resurrect either.
- **Do not build, flag, migrate, mint, deploy, or run any live operation.**
- **Do not fix the stale claims you find** unless the founder elects it — surfacing is the deliverable.
- **Do not restate `/CLAUDE.md` as if it were verification.** A grounding report whose claims are
  transcribed rather than checked is the failure this session exists to avoid.
- **Do not quote the R20a perimeter count from any document**, including this prompt.

---

## Standing constraints (unchanged)

Weights remain **BLOCKED**. The **Q1 hard constraint** holds: the loop proposes; it never executes.
The **P0 0h hold** is active and the launch call is the founder's. `SUBSTRATE_LAYER3_ENABLED` stays
unset. **R20d** binds on all surfaces. Any eventual build touching the `/api/reason` graph is gated on
the **byte-identity guard's end condition** (Ruling Set E, item D).

## Rollback path

Nothing to roll back — the session reads and reports. If the founder elects a records correction at
the end, `git revert` that single path-scoped commit.

## Forecast

Success = a grounding report whose every claim carries the check that established it; an accurate,
primary-source statement of what the standing-runner track is waiting for; the standing queue named
without being advanced; and a clean hold for the mentor instructions the founder will relay. **The
session ends by waiting, and that is the correct outcome — not a shortfall.**

End of prompt.
