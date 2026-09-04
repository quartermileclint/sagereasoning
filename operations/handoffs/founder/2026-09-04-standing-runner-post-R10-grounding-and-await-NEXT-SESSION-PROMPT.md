# NEXT SESSION PROMPT — standing-runner track, post-R10: re-ground from source, verify the state, report, and await instructions

**Paste this into a fresh session. Tier: `governance` — documents and reads only.** No code, schema,
flag, migration, credential, or live operation. No commit unless the founder elects one. The Critical
Change Protocol is NOT engaged; AC7 is NOT engaged.

**Written 2026-09-04 at the close of the session that ran R10 and executed its six rulings.** HEAD at
writing: `b019e97`, on `origin/main`, Vercel green.

---

## 0. Open the session

1. Read, in order: `/adopted/standing-protocol-cache.md`; `/adopted/project-instructions-snapshot.md`
   (PR1–PR25; verify the count by enumeration, do not trust this line); `/manifest.md` targeted
   sections only (R0 + the three un-numbered mentor sections; AC5; AC7).
2. `/CLAUDE.md` — read the **2026-09-03 refresh block and its 2026-09-04 addendum** (the paragraph
   beginning *"2026-09-04 addendum: the standing-runner track's consolidated mentor input brief
   arrived…"* through *"…nothing was built."*). Everything else in that file is history for this
   session's purpose.
3. `ListAgents` at open; `git status` at open and again before any staging; commits path-scoped;
   never `git add -A`. Peer sessions have been active on this repo all day — a peer's uncommitted work
   under `harness/` or `website/` is theirs, not yours.
4. Confirm at open: tier `governance`; P0 0h hold active; model per the founder's setting.

## 1. Re-ground the track from source, not from summaries (PR20)

Read these **in full, in this order** — they are the record; the CLAUDE.md addendum is a summary of them:

1. `operations/agent-circles-2026-08/2026-09-04-mentor-brief-standing-runner-design-session-and-rulings-verbatim.md`
   — **Part 3 is the governing brief** (Part 1's six-room mapping is superseded and omits Workshop).
2. `…/2026-09-04-mentor-ruling-standing-runner-close-gate-discrepancy-verbatim.md`
3. `…/2026-09-04-mentor-ruling-standing-runner-gate-item-level-session-may-open-verbatim.md`
4. `…/2026-09-04-standing-runner-design-R9.md` — the second sitting; **its head withdraws three
   structural over-claims from its own first draft**; §16 is the follow-on list.
5. `…/2026-09-04-mentor-amendment-twelve-environment-agent-architecture-verbatim.md`
6. `…/2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md` — the third sitting;
   **its head withdraws eight corrections from its own first draft, one of which was a false source
   claim**; §10b is the 45-finding fold table; **the RULED addendum at its head maps each ruling to
   the section it bears on — the body is NOT rewritten and is to be read as reviewed.**
7. `…/2026-09-04-mentor-ruling-twelve-environment-architecture-six-questions-verbatim.md` — **the
   six rulings; verbatim wins over every summary of them including R10's addendum.**
8. The last four entries of `operations/decision-log.md`
   (`D-MENTOR-BRIEF-…`, `D-MENTOR-RULING-CLOSE-GATE-…`, `D-MENTOR-RULING-OPTION-S-GATE-…`,
   `D-STANDING-RUNNER-DESIGN-R9-…`, `D-MENTOR-AMENDMENT-TWELVE-…`, `D-MENTOR-RULING-TWELVE-…`).
9. `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the standing-runner rows and the R9/R10
   head-note blocks.

**Verify, do not restate.** Where this prompt or any document claims a mechanism fact, open the cited
source and read it. Three facts this track has already been burned on and which you must re-derive at
open:

- **Q1's scope.** It is stated, agent-generally, in the **2026-08-12 amendment** at
  `2026-08-08-autonomous-loop-design-brief.md:178-212`, and Q-B's ruling extends it to any scale at
  which assent occurs. R10's first draft claimed the record was silent; it was wrong.
- **The live generative-room count is THREE** (Workshop, Garden, Forest). Observatory and Archive are
  occupied by heuristics that are not production functions (R9 §1.11: h5 is a weighting function; h6
  is inert without runner history, and that read is unbuilt). Attic and Cellar are empty. Re-derive
  from `2026-08-05-idea-loop-generation-heuristics.md` + R9 §1.11 + §2.1; do not quote "three" from
  this prompt.
- **The R20a perimeter count.** Re-derive from the arrays in
  `website/src/lib/__tests__/r20a-invocation-guard.test.ts`. Do not quote any document's number.

## 2. The state of the track at this prompt's writing (verify each against the sources above)

**Settled and binding:**
- The Option S gate is **item-level** and binds **only** the M/W/S floor-semantics election and R8-D7's
  sampling policy. Both are **deferred in writing**. **Path A** (build Option S; exercise it against
  the closed run's 29 decision-bearing candidates, ≈$1.24, carrying the closed-run-population limit)
  is the ruled route. Path C is not adopted.
- The session is **open** and has run **three sittings** (R8, R9, R10). Nothing is built. The nine-
  candidate close gate is discharged (twice).
- **Q1 reaches any composed pipeline on this harness**; the execution boundary is **Threshold's
  handoff**, as R9 designed. No pipeline architecture needs its own execution ruling.
- **C1 does not transfer to per-room identities**; that architecture needs its own attestation ruling;
  **practice-exercised is not attestable in v1** — a disclosed limit.
- **Environment agents do not accumulate their own trust records in v1.** Any multi-agent build brief
  must pin the absence of independent writes to the trust state.
- **The twelve-environment architecture is REVISED, not confirmed, and is prospective in v1, not
  operational.** The room, not the agent, is the unit. The identity architecture (shared vs. per-room)
  is **genuinely open** — a write-side `UNIQUE(loop_id, cycle_number)` constraint
  (`website/supabase-idea-loop-watching-migration.sql:87,131`) bites either route and is unresolved.
- **Attic/Cellar heuristics are NOT elected.** Election is a founder-walked act needing its own scoping
  session under the 2026-08-19 forward-reservation principle.
- **Item D:** the deprecation branch is declined; restoration recommended; the A2 engine change and any
  injection-path edit are gated on it. `GATE1_FALSE_HOLD_CAPTURE` is not restored.
- **The single-identity prerequisite is unmet** — a harness identity with an examined record for the v1
  executing actor. Three independent findings (R9 §3.1, R10 §4.4, R10 §5.2) converge on it as the
  binding prerequisite. Until it exists, v1 generation runs on `gap_only` and R9 §3 is idle.

**Reserved to their own future sessions, none pre-answered, all live only if the multi-agent form is
ever built:** the per-room attestation ruling (Q-C); the pipeline-identity longitudinal design (Q-D);
per-agent vs. shared accumulation (Q-E).

**Open, named, not before this session by ruling:** §5d (doctrinal, `code-critical`, its own session);
the vocabulary-direction question's ownership (D1); any manifest ATRF amendment (D2 — draft for ruling
only; R9 §16.5); the ENV-1 gate extension (Gate-3 Q6); GS-CYB-1's two conditions (unmet, untouched);
the differential pricing observation (deferred by the amendment itself); the O-C Gate-3 design session
(explicitly excluded — do not open).

**Q-ENV-1's interface contract does NOT yet meet the amendment's own build-brief-precision bar** — the
room-framing context, per-cycle cardinality, refusal semantics, and invocation direction are named
gaps (R10 §2.1, §9). This is a design-completeness gap, not a mentor question, and it is **not**
assigned to any session.

## 3. What this session does

**Re-ground, verify, report, and stop.** Produce a short status report to the founder covering: (a)
what you re-derived at open and whether any document is stale against source — name the discrepancy,
**do not fix it unless the founder elects**; (b) the track's waiting state in one paragraph; (c) the
follow-ons available for election, listed without recommendation unless asked.

**Then await instructions.** The founder may: relay a further mentor input (capture verbatim, adopt as
binding on relay, annotate, record, path-scoped commit — the pattern of the last three sittings);
elect a follow-on from R9 §16 / R10 §9 (each is its own session, most are `code-*` and need their own
prompt); or direct something else.

## 4. What this session does NOT do

- **Does not open R11 or any design sitting** unless the founder says so in-conversation. A design
  sitting is the founder's act to open.
- Does not build, flag, migrate, mint, activate, or publish. Does not touch `website/`, `harness/`, or
  any `.sql`.
- Does not elect any follow-on. Does not restore `GATE1_FALSE_HOLD_CAPTURE`. Does not elect
  Attic/Cellar. Does not mint a harness identity. Does not build Option S.
- Does not rewrite R9's or R10's PR19-reviewed bodies. A later correction goes in a dated addendum at
  the head or in a successor document — never in place.
- Does not record any retrospective environment attribution under the C1 tag's name
  (`generative_environment`); the voluntary finding lives under `assessed_environment_retrospective`
  only (R9 §13).
- Does not use the bare two-word layer term in its own prose (Q5b); quote mentor text as written.
- Does not quote any perimeter count, room count, or PR count from a document — re-derive.
- **If a mentor input you are asked to fold contains a premise behind the record** (the R10 amendment
  did — it said the session was "unopened"), **name it, do not absorb it, and put it to the mentor as a
  question**; proceed on the substance only where the input's own terms license doing so.

## 5. If asked to run a design sitting (R11) — the discipline that has held

Every sitting on this track has found its own first draft wrong on independent review — R9: three
structural over-claims; R10: eight, one a false source claim. **The pattern is that self-review does
not catch them and blind review does.** If R11 opens: draft; then launch **three parallel, blind,
read-only reviewers** (claims-vs-source; constraint compliance; design soundness), each briefed to
break rather than confirm; fold every confirmed finding at the root; withdraw over-claims at the head,
not buried; populate the fold table by finding number **after** the review returns, never before.
The Gate-1/Gate-2 hooks returned UNAVAILABLE for most of the last two sittings — record that honestly
in the close; do not claim a frame you did not receive.

## 6. Founder verification of the state this prompt describes

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -6
grep -c "R10 2026-09-04" operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md
grep -n "RULED 2026-09-04" operations/agent-circles-2026-08/2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md | head -1
```
Expected: `b019e97` at or near the top; `1`; one match at R10's head.

*This prompt self-starts nothing. The track waits on the founder.*
