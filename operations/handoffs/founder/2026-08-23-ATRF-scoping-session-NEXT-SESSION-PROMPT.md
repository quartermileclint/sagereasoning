# Next-Session Prompt — the ATRF Scoping Session (scoping only; output = a FOR-MENTOR-REVIEW document)

> **SPENT 2026-08-23** — the session ran; deliverable:
> `operations/agent-circles-2026-08/2026-08-23-ATRF-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW.md`
> (`D-ATRF-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW-AUTHORED-2026-08-23`). Note per Step 0.5: the
> GS-ATRF-4 SQL caution below was resolved at drafting-time-plus-hours — the founder-walked write
> ran 2026-08-19 (`D-GSATRF4-EPISTEMIC-STATUS-LIVE-2026-08-19`); the live row carries GS-ATRF-4.

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` — documents only. Standard risk under 0d-ii. No build, no schema, no flag, no
credential, no migration, no live op. AC7 not engaged. (If the session finds itself wanting to touch
code, stop — that is out of scope by construction; this session scopes, it does not build.)
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor closes:** `operations/handoffs/founder/2026-08-22-engine-evolution-examination-CLOSE.md`
(through Addendum 3) and whatever is newest in `operations/handoffs/founder/` at open — **check, do
not assume**; the mechanical-items and Class-B threads were moving in parallel sessions when this
prompt was written.

**Gate status (verified at drafting, 2026-08-22, per PR20's carry-forward discipline):** the ATRF
scoping session's *"post-validation-run, do not open early"* gate is **discharged** — the bounded
validation run completed at 20 cycles and its §6 report was accepted in full
(`D-MENTOR-RULING-R1-S6-REPORT-ACCEPTED-2026-08-16`); the concurrent-arc plan's R5 entry records the
session as *"now legitimately open."* **One sequencing fact to record, not to re-litigate:** the
2026-08-10 confirmed priority order listed this session AFTER the standing-runner design session.
The founder's election to open ATRF scoping first is a deliberate sequencing choice — compatible
with the 2026-08-21 Q5 ruling (the two sessions are parallel tracks; neither gates the other) — and
this session's records should say so explicitly so no future reader mistakes it for drift.

---

## Why this session matters

The ATRF scoping session is the single largest accumulation of routed-but-unexamined inputs in the
project: four ruled-open GS-ATRF questions, two carry-forwards from the primal-substrate family, the
parked halves of S3 and S5, the sufficiency-examination content, the two-vocabulary question, and —
since the engine-evolution examination — the Direction 1 and Direction 2 routed components. It is
also a gate for someone else: the **Evaluative Engine Epistemic Status Scoping Session** cannot open
until this session's ruling on the two-vocabulary question exists. The output of THIS session is
**not a ruling and not a final scope** — it is a scoping document the founder takes to the mentor
for feedback; the scope is finalised only after that feedback returns.

---

## Step 0 — Open, and re-ground in the CURRENT project state (do not trust this prompt's snapshot)

1. Read `/adopted/standing-protocol-cache.md` in full. Read this file in full.
2. **Concurrent-session check (live lesson from 2026-08-22, not hypothetical):** run `ListAgents`
   before any file-edit intent. On 2026-08-22 three sessions were active in this one working tree
   simultaneously, and a decision-log append had to be explicitly sequenced between two of them. If
   peers are active, coordinate before writing; sequence any decision-log append explicitly.
3. **Check HEAD and the window since.** This prompt was written at `6dcbe09`. Run `git log
   6dcbe09..HEAD --oneline` and read the decision-log tail (last ~5 entries). The mechanical-items
   thread (items 2/3/4 done; Class-B route work in flight at drafting) and any housekeeping sessions
   may have landed more. If anything touching the ATRF's inherited inputs landed — especially
   anything opening the standing-runner design session — fold it into the grounding before scoping.
4. **Re-derive every inherited item's status from its primary source.** The register in Part B below
   is a **starting hypothesis, not a fact list** — the standing discipline (three stale carried
   counts caught in one week of this stream) applies. For each item: open the cited source, confirm
   the item is still open/parked/routed as described, and timestamp-check every present-tense
   mechanism fact (PR20, both 2026-08-19 amendments) before it enters the scoping document.
5. **Named verification:** check whether the GS-ATRF-4 founder-walked SQL
   (`website/supabase-project-context-2026-08-19-gsatrf4-update.sql`) has been run — the decision
   log recorded it outstanding as of 2026-08-19, meaning the live `project_context` row may not yet
   carry GS-ATRF-4 even though the static `project-context.json` does. The scoping document must
   state which state the live surface is actually in (or mark it unverifiable-from-repo, honestly).
6. Confirm at open: tier (`governance`); hold-point (P0 0h active — and the founder's standing
   direction of 2026-08-22: all current tasks complete before any 0h assessment); model + effort
   stated; status vocabulary; weights BLOCKED throughout; the Q1 hard constraint (the loop proposes,
   never executes) untouched by anything this session does.

## Part A — Tier-2 reading (in this order; verbatim records win over every summary)

1. `manifest.md` — the ATRF section + the Consciousness and Continuity Obligation (the ATRF's own
   text is the thing being scoped; read it verbatim, not from memory).
2. `operations/primal-substrate-2026-08/gs-atrf-corrections.md` — FULL (§(a) the unabridged
   four-dimension GS-ATRF-1 answer; §(b) the fixed vocabulary + two-record requirement; §(c) the
   no-`target_circle`-column fact; §(c-bis) the basis-lessness gap; §(d) the justice carry-forward;
   §(e) the epistemic-status carry-forward — noting §(e)'s destination line carries a 2026-08-22
   dated correction).
3. `operations/agent-circles-2026-08/2026-08-19-mentor-ruling-gsatrf4-epistemic-status-verbatim.md`
   — including its 2026-08-22 dated-correction section (the "generation-step scoping session"
   phrase was corrected to the ATRF scoping session by the Q1 ruling).
4. `operations/agent-circles-2026-08/2026-08-21-mentor-rulings-five-questions-examination-session-verbatim.md`
   — Q1 (session identity + destinations), Q2 (the two vocabularies + the named ATRF input), Q3
   (the Evaluative Engine session gated on this session's Q2 ruling), Q4 (the
   agonia-at-synkatathesis doctrine + the Sage Calling primary-input directive).
5. `operations/agent-circles-2026-08/2026-08-22-DESIGN-EXAMINATION-deterministic-engine-evolution-four-directions.md`
   — §1 (Direction 1, the generative-process gap and its fragments), §2 (Direction 2, the
   layer-division and capacity-axis analysis), §7 (the routing this session inherits), §6 (which
   open questions are resolved vs still open).
6. `operations/primal-substrate-2026-08/S3-boulesis-generation-mechanism-scope.md` — §5-Q3-e (the
   M5 ruling: boulesis vs sufficiency, separate fields, Q3-d unblocked) and §5-Q3-d itself.
7. `operations/primal-substrate-2026-08/S5-moral-community-boundary-scope.md` — §1 (the parked
   half: agent-profile functional analogues + completion-signal design) and §2.1 (L2b assumes human
   structure — with its own caution about a false correction).
8. `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` — the ATRF session's gates-table row
   and the sufficiency-examination routings (§ the 2026-08-12 additions).
9. `operations/handoffs/founder/2026-08-15-concurrent-arc-plan.md` — the R5 entry (what it bundles
   beyond scoping) and the R6/R8 entries (for boundary-drawing).
10. The 2026-08-09 six-Stoic-items relay record (locate via the decision log around
    `D-ATRF-AND-CONSCIOUSNESS-CONTINUITY-ADDED-2026-08-09`) — the six items are named ATRF-session
    inputs and must each be dispositioned.

## Part B — The inherited-inputs register (starting hypothesis; re-derive per Step 0.4)

The scoping document must disposition EVERY item below — in scope, out of scope with named
destination, or deferred with named condition. Silent omission of any item is the failure mode this
register exists to prevent.

**The four GS-ATRF questions (all land HERE per the 2026-08-21 Q1 ruling):**
1. **GS-ATRF-1** — the loop-level blast-radius proxy: the ruled four-dimension answer (unabridged,
   §(a)), and **§(c-bis)** — the friction-channel has no basis at all; the `high|medium|low`
   vocabulary cannot express basis-lessness; `assessStructuralNovelty`'s `novel:true/confidence:0`
   posture is the available precedent, **not** a pre-authorised answer.
2. **GS-ATRF-2** — the proposal shape / per-cycle record: the fixed three-value vocabulary +
   two-record requirement (§(b)); the missing `target_circle` column and the three-additive-columns
   need (§(c)); the clean-field constraint (elevated to "a named constraint, not a preference").
3. **GS-ATRF-3** — the completion signal: the B1 boundary (*what must be carried, not how built*);
   the return path (transport, schema, endpoint, what the harness does with it); the
   sufficiency-examination **content** specification (what the completion signal's examination
   should ask); and **§(d)** — whether a completion signal can honestly carry something about the
   justice assessment given the floor dynamics (with the three must-NOT-assume bullets).
4. **GS-ATRF-4** — the epistemic status of propositions (the ruled provenance vocabulary:
   observation/inference/assumption/unknown), and the **two-vocabulary question** (2026-08-21 Q2,
   verbatim): are the provenance and credence vocabularies one framework with two orthogonal axes,
   or two frameworks? If one, what is the complete epistemic status entry structure? If two, what
   governs their relationship? **This session's eventual ruling here un-gates the Evaluative Engine
   Epistemic Status Scoping Session — flag it as such in the scoping document.**

**From the primal-substrate family:**
5. **S3's boulesis generation mechanism** (parked mechanism design) + **Q3-d** (eighth heuristic vs
   reshaped existing vs pre-generation step — unblocked by M5) — under the M5 binding directives:
   sufficiency is an epistemic threshold check, not a motivational-state check; `boulesis present`
   and `sufficiency reached` are separate fields, never collapsed.
6. **S5's parked half** — the agent-user profile architecture: functional analogues of passion, of
   oikeiosis extension, of progress grades (L2b assumes human structure), plus the completion-signal
   design half.
7. **The six Stoic items** (2026-08-09 relay): kathêkon/katorthoma at agent level; the four-virtue
   pre-task diagnostic; synkatathesis as a named assessment point; premeditatio malorum; the
   oikeiosis extension metric; hegemonikon stability. Each recorded-not-adopted; each needs a
   disposition here.

**From the engine-evolution examination (2026-08-22 routings):**
8. **Direction 1's generative-process examination content** — with the **Sage Calling generative-act
   diagnostics as PRIMARY input** (the 2026-08-21 Q4 ruling's directive;
   `website/src/lib/sage-calling/engine.ts:421-463` — premature-closure / continued-search /
   imagined-need) and the ruled **agonia-at-synkatathesis diagnostic entry**. The scoped question
   must establish: is the generative-process examination ATRF content (a fourth carried element) or
   a distinct examination category? How does it compose with the sufficiency-examination content?
   Which of the examination document's still-open questions 2–3 (form of the examination; the
   discriminating-signature problem, F-Q43 class) must be settled first?
9. **Direction 2's profile-analogue half** — folded with item 6; plus: is the capacity axis (the
   examination's fourth-axis finding) part of the profile design or a separate account? Constraints
   to carry: ruling C17 (extensible participant-class enums) and the M-4 refuse-to-attest precedent.

**Boundary questions the scoping document must dispose of explicitly (propose, for the mentor to
confirm — do not assume):**
10. **§2.13 (null cycle — examined or counted?)** — lives ruled-open in the closed generation-step
    document. Its subject is cycle behaviour (arguably standing-runner) but its sufficiency-content
    is ATRF-adjacent. Propose an owner; name the F-Q43 discriminating-signature warning either way.
11. **The R5 entry's bundled non-scoping tasks** ("execute the S6 reordering decision as ruled, and
    scope R6's two migrations") — confirm with the founder at open whether these ride this session
    or a successor; do not silently drop or silently absorb them.
12. **What this session is NOT:** it does not open the standing-runner design session (parallel
    track; its own inputs — the conjectural-entry carry-forward, the three complexity-science items,
    Q5 trigger placement — stay there untouched); it is not the Evaluative Engine Epistemic Status
    Scoping Session (gated on this session's Q2 ruling; its primary input is the examination
    document's §3 inventory, not this session's to consume); it does not advance the puzzle-taxonomy
    entry types (held pre-ruling); it does not touch the Consciousness and Continuity Obligation
    beyond forward-pointing references.

## Part C — What this session produces

**One deliverable:** `operations/agent-circles-2026-08/<session-date>-ATRF-SCOPING-DOCUMENT-FOR-MENTOR-REVIEW.md`

Requirements for that document:
- **Status header:** `FOR MENTOR REVIEW — NOT FINAL. This scoping is not adopted until the mentor's
  feedback returns and the founder finalises it. No build, route, flag, credential, or schema is
  licensed by this document.`
- **PR20 throughout:** every present-tense mechanism fact carries a file:line or record citation
  verified this session (not inherited from this prompt); every affected existing mechanism the
  eventual rulings will land on is named specifically (the PR20 core discipline — this is a
  mentor-consultation document, so PR20 binds it directly). Facts that cannot be verified from the
  repo are marked unverifiable, not asserted.
- **Content:** (a) the proposed scope — what the ATRF session will and will not examine, structured
  around the register above with every item dispositioned; (b) the proposed question set for the
  mentor, each question self-contained with its mechanism facts stated; (c) the proposed sequencing
  within the session's own work (which questions gate which); (d) named open questions the scoping
  itself could not settle; (e) the boundary dispositions (items 10–12) stated as proposals for
  confirmation; (f) a cross-reference list.
- **Epistemic discipline:** the 2026-08-21 Q4 anti-overcorrection ruling applies — assess each
  item's readiness honestly rather than holding everything uniformly cautious or uniformly ready.
- The session should run an **independent adversarial review pass over the document's mechanism
  claims before handing it over** (the engine-evolution examination's precedent: three verification
  passes caught real defects, including a missing charter record) — proportionate scale, but not
  skipped.

**Close discipline:** lean decision-log entry (`governance`/Standard) + lean session close naming
the deliverable path; commit only the session's own files, sequenced with any active peers per the
Step 0.2 discipline. The prompt file you are reading is SPENT once the session opens.

## What does not move in this session

- No GS-ATRF question is RESOLVED here — this session prepares them for ruling; the mentor rules.
- The standing-runner design session, the Evaluative Engine Epistemic Status Scoping Session, the
  taxonomy entry types, the Consciousness and Continuity Obligation: all untouched (see item 12).
- The 0h call: untouched; the founder's 2026-08-22 direction stands (all current tasks before any
  0h assessment).
- Weights BLOCKED; the Q1 hard constraint; the R20a perimeter; auth; `manifest.md` (this session
  proposes, it does not amend governing documents).

---

*End of prompt. The session's success condition: a FOR-MENTOR-REVIEW scoping document grounded in
the repo's state at open (not at this prompt's drafting), with every inherited item dispositioned,
every mechanism fact freshly verified, and the mentor's question set ready to relay — and nothing
scoped into existence that the rulings have not licensed.*
