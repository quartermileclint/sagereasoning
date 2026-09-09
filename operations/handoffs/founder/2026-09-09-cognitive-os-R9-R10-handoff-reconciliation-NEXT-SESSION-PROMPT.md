# SESSION PASTE — Cognitive OS: R9/R10 handoff reconciliation (the Phase-2 prerequisite)

**Paste this as the FIRST message of a FRESH session.**

**Open the standing opener first** (`STANDING-SESSION-OPENER-grounded-foundations.md`, most recent
version), then this. **EVERY NUMBER IN THIS FILE IS A CLAIM TO RE-DERIVE, NOT A FACT TO QUOTE.**

**Tier: `governance` (inspection) — likely `code-elevated` if the reconciliation itself requires
schema/type changes to the Phase-1 library.** Confirm at open. **This session does NOT build Phase 2.**
The mentor ruled Phase 2 remains **NOT LICENSED**; this session's job is to discharge one of its named
prerequisites, not to accelerate past it.

---

## 0. Why this session exists

Phase 1 of the Cognitive OS is built and mentor-approved
(`operations/cognitive-os-2026-09/2026-09-09-STEP-2-PHASE-1-BUILD-CLOSE.md` — **read this close in
full before anything else**; it is this session's immediate predecessor and its own governing chain in
precedence order is listed there). The mentor's review of that report ruled, on Phase 2:

> *"R9/R10 handoff reconciliation is owed before Phase 2 opens. This is a prerequisite, not a
> follow-up. The HandoffEnvelope does not supersede R9's handoff design. The two must be reconciled
> when the actor architecture begins consuming these state services."*

That reconciliation is this session's task. **It is not itself Phase 2** — Phase 2 is the Epistemic
Debt service (spec: debt calculation, contradiction tracking, decision-readiness checks). This session
determines how the Cognitive OS's `HandoffEnvelope` (built in Phase 1,
`website/src/lib/cognitive-os/handoff-envelope.ts`) relates to the standing-runner arc's own handoff
design in R9/R10 — where the two overlap, where they diverge, and what (if anything) needs to change
before Phase 2's actor-consuming work can begin.

---

## 1. Your governing documents, in precedence order

1. **The Phase-1 build close** —
   `operations/cognitive-os-2026-09/2026-09-09-STEP-2-PHASE-1-BUILD-CLOSE.md` — the mentor's ruling
   that licenses this session, and the full account of what Phase 1 built (read §"What was built,
   where inserted" and §"Carried forward" from the linked build report if you need component detail).
2. **The Phase-1 build report** —
   `operations/cognitive-os-2026-09/2026-09-09-STEP-2-PHASE-1-BUILD-REPORT.md` — the `HandoffEnvelope`
   is documented in full there (§1 table, §3.1 C5/C6/C8 disposition, §3.4 the three founder-flagged
   items). **Do not re-derive its shape from the source alone; read the report's account of what it
   does and does not do, then verify against source.**
3. **The Phase-1 library itself** — `website/src/lib/cognitive-os/handoff-envelope.ts` and
   `website/src/lib/cognitive-os/permissions.ts` (the four scope identifiers `Laboratory`/`Attic`/
   `Archive`/`Threshold` — approved **as permission-scope identifiers only, Phase 1 only**, per the
   2026-09-08 rulings; **any use of them to instantiate an actor requires its own scoping**, per the
   binding ruling this session must respect, not relitigate).
4. **The R9 standing-runner design** —
   `operations/agent-circles-2026-08/2026-09-04-standing-runner-design-R9.md`. It already uses
   **"Threshold"** for "handoff to external execution" — read this carefully; it is either a genuine
   convergence with the Cognitive OS naming or a coincidence worth flagging, and this session should
   determine which, not assume.
5. **The R10 twelve-environment amendment** —
   `operations/agent-circles-2026-08/2026-09-04-standing-runner-design-R10-twelve-environment-amendment.md`.
6. **The R9/R10 reception + mentor exceptions** —
   `operations/agent-circles-2026-08/2026-09-05-R9-R10-reception-summary-and-exceptions-FOR-MENTOR.md`
   and `operations/agent-circles-2026-08/2026-09-05-mentor-reception-R9-R10-exceptions-verbatim.md` —
   **canonical; verbatim wins.**
7. **The standing-runner priority index** —
   `operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs" — for the founder
   elections and prerequisites the standing-runner track already carries.

**Verbatim mentor records win over every summary, including this paste.**

---

## 2. What this session should do (Step 1 pattern — inspect before deciding)

This arc's own build discipline worked: gap analysis before code, questions before implementation,
one complete unit of work per session. Follow the same shape here.

1. **Read the R9/R10 handoff design in full** and extract: what fields it carries, what it calls the
   sender/receiver, what validation or staleness rules it has, and what problem it solves for the
   standing-runner architecture.
2. **Read the Cognitive OS `HandoffEnvelope` in full** (already summarised in the build report, but
   verify against source) and do the same extraction.
3. **Produce a comparison, field by field and concept by concept** — named collisions (the
   "Threshold" naming is the first one to check), named genuine differences, and named gaps each
   design has that the other might fill.
4. **Identify what — if anything — needs to change**, in either design, before Phase 2 (the actor
   architecture consuming Cognitive OS state services) can proceed without the two handoff shapes
   silently diverging under the same name.
5. **Flag, do not resolve, any collision that touches a binding ruling** — in particular, do not let
   this session's reconciliation quietly expand the permission-scope-identifiers-only ruling on
   `Laboratory`/`Attic`/`Archive`/`Threshold` into an actor-instantiation. If the reconciliation
   appears to require that, **stop and route it** — it needs its own scoping session, per the standing
   2026-09-04 rulings the Q1 ruling itself cites.
6. **Produce a written reconciliation document** (own file under `operations/cognitive-os-2026-09/` or
   `operations/agent-circles-2026-08/`, your call, name it clearly) stating: what stays as-is in each
   design, what changes (if anything, and only if licensed — see below), and what remains genuinely
   open for the founder/mentor to rule on.

### ⛔ Do NOT, in this session

- **Do not build Phase 2.** Not the Epistemic Debt object, not debt calculation, not the
  decision-readiness gate. Those wait on this session's own output plus a fresh licensing step.
- **Do not touch the observation window's measured files.** Re-derive `GUARD_RE` from
  `website/src/app/logos/__tests__/human-practitioner-boundary.test.ts` §C (was, at last check:
  `api/reason|api/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|
  translation-sandwich|/substrate/|trust-core|kathekon-engagement|false-hold|harness/gate1|
  layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain` — **re-derive, do not quote**). Neither
  `handoff-envelope.ts` nor the R9/R10 documents should match it, but test rather than assume.
- **Do not instantiate an actor** from `Laboratory`/`Attic`/`Archive`/`Threshold`. That is a separate,
  unlicensed step regardless of what this reconciliation finds.
- **Do not modify `HandoffEnvelope`'s code without checking whether the change is even licensed** —
  this session's mandate is reconciliation (a design/comparison task), and if it concludes a code
  change is needed, that may be its own scoped follow-up rather than something to do inline. Use
  judgement, but state the reasoning either way.

---

## 3. Practice discipline this session must carry, per this project's standing record

1. **Re-derive window + baseline health at OPEN and again at CLOSE.** At this paste's authoring:
   buffer 361, window population 222, baseline **3 of 5** (2026-09-06/07/08 UTC). **Re-derive; do not
   quote.**
2. **Run the byte-identity guard battery at open and after any commit-shaped moment.** It was
   **250/0** at authoring. Both SHA pins green (`layer2-mechanisms.ts` `60cefedb…`, `stoic-brain.ts`
   `fa8895ec…`).
3. **`git status` whole, never truncated.** `ListAgents` at open. **Path-scoped commits, always.**
   There are peer sessions and uncommitted peer work in the tree — **never stage another session's
   files.**
4. **Disclose the tool-mode effect, per the standing ruling this session's predecessor obtained.**
   Choose the authoring tool on the task's merits, never on the counter, and **state in the close which
   tool mode was used and what it contributed to the window** — this is now a standing disclosure
   obligation, not merely a nice-to-have.
5. **⚠ If a `cat >` (or any truncating overwrite redirect) is used and the guard fires on it, read the
   signal from the CURRENT frame before classifying it — do not carry a classification forward from a
   prior session's caution.** This is a binding practice requirement from the mentor's ruling this
   session's predecessor obtained (2026-09-09), not yet folded into the standing opener itself. If you
   are the session that next touches the standing opener, that line is owed there too (see §4 below).

---

## 4. Other carried-forward items — NOT this session's job, but visible so nothing is rediscovered

These are named so a reader does not have to reconstruct them from the decision log. **Pick them up
only if you are a different, explicitly-scoped session — do not fold them into this one opportunistically.**

- **The Cognitive OS table step** (schema, data-rights wiring, `retain_until`, sweep, migration) —
  founder-walked, its own session, opens only after this reconciliation if the reconciliation doesn't
  change the shape of what gets persisted.
- **`Q-PREFLIP-REPORTS` now has THREE named disclosures owed**, not two: baseline composition
  day-by-day, loop-count-by-action-class, and (new, 2026-09-09) **tool-mode composition per baseline
  day**. Gated on a founder waiver (`false-hold-observation-report.ts` matches `GUARD_RE`).
- **The session-opener `cat >` addition** (§3.5 above) — owed to
  `STANDING-SESSION-OPENER-grounded-foundations.md` at its next revision.
- **The cap-transparency requirement for review workflows** (any future PR19-style fleet must
  disclose its per-dimension finding cap and whether it bound) — not yet folded into
  `/adopted/project-instructions-snapshot.md` or wherever such standing requirements live; worth
  raising at the next `governance` session that touches process instructions.
- **A manifest amendment owed BEFORE Phase 3** (Consciousness and Continuity Obligation, component
  one) — unchanged, still gated at Phase 3, not this session's concern.

---

## 5. If you hit a conflict

**Route it; do not resolve it.** If any part of the reconciliation appears to require touching a
governed surface, a settled constraint, or a file covered by the byte-identity guard, stop and flag it
before proceeding. The founder is the decision authority on all governance questions.

**The S11 flip remains REFUSED; weights remain BLOCKED; the 0h call remains the founder's.**
