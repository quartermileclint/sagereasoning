# Next session — S4 + S6: the traceability criterion and the friction hypothesis

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: `governance` / documents. Standard under 0d-ii.** No code, schema, flag, credential, migration,
or public-surface change. AC7 not engaged. PR6 not engaged. **The session's own commit must touch
nothing outside `operations/primal-substrate-2026-08/` and `operations/decision-log.md`** — verify with
`git diff --stat` before committing.

**Both deliverables are documents that feed the live validation run's §6 report.** They are paired in
one session because they share that deadline, share their evidence base, and one of them (S6) depends
on a mechanism the other (S4) specifies.

---

## 0. Before anything else — the standing opener applies

Open under `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` as normal.
**Then note the exception that applies to this session:** the opener's box directs any task touching
`/api/reason`, `/api/guardrail`, or the trust-core emission path to read the IDEA-loop parallel-window
prompt first. **This session touches none of those** — it writes documents *about* observed behaviour.
It does not modify, call, or configure any of them, and **it must not write into the validation run's
records**. The run's findings are the run's.

---

## 1. What you are building

Two documents, both in `operations/primal-substrate-2026-08/`:

| Deliverable | File | What it is |
| --- | --- | --- |
| **S4's concurrent half** | `traceability-criterion.md` | The examined-assent verification criterion, turned into checks a reviewer can apply — now with **two evidence streams**, per the Q4-e ruling |
| **S6's concurrent half** | `friction-primary-hypothesis.md` | The friction hypothesis, pre-registered with its frozen null result and its **three-axis** test structure |

**Both are already fully scoped and fully ruled.** Your job is to write them to the specifications that
exist, not to re-scope them. If you find yourself re-opening a decision, check whether it has already
been ruled before proposing anything.

---

## 2. Read these, in this order

1. **`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`** — the family's shape and current
   status. Both blockers (D1, D2) are cleared; everything relevant here is ruled.
2. **`operations/primal-substrate-2026-08/S4-traceability-criterion-scope.md`** — in full. §3 is your
   build spec; §2.6 and the Q4-e ruling change its structure materially.
3. **`operations/primal-substrate-2026-08/S6-friction-primary-mechanism-hypothesis-scope.md`** — in
   full. §3 is your build spec; §2.2b and the Q6-e ruling add the third axis.
4. **The three verbatim ruling records** — these win over every annotation in the scope documents,
   including the annotations that quote them:
   - `2026-08-11-mentor-synthesis-primal-substrate-verbatim.md` (the source synthesis)
   - `2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` (the 35-item confirmation; **B5's frozen
     null result** is here, verbatim — transcribe it from here, never re-type it)
   - `2026-08-11-mentor-rulings-cycle6-and-open-questions-verbatim.md` (cycle 6; **Q4-e and Q6-e**)
5. **The run log** — `/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/RUN-LOG.md`
   — **read, never write.** Specifically: `:286` (the B7 ruling in force), `:371` (the cross-endpoint
   carried-findings table), `:330-360` (the friction-channel table), `:1620-1700` (cycle 6's candidates,
   guardrail verdicts, and the run session's own pattern analysis), `:1749` (the `not_comparable` row).
   **Verify the numbers you cite against this file rather than against the scope documents' summaries of
   it** — that discipline has already caught real things twice in this family.

---

## 3. S4 — `traceability-criterion.md`

### What it must contain

**(a) The criterion**, in the mentor's words: genuine examination produces verdicts *"traceable to the
specific content examined, proportionate to the actual virtue domains engaged, and consistent across
equivalent inputs."*

**(b) The two evidence streams — this is the Q4-e ruling and it is the document's spine.** The three
properties do not apply uniformly; they split by what evidence exists:

- **Winners** (both extractions exist): all three properties, including the cross-endpoint comparison.
- **Filtered candidates** (guardrail extraction only): traceability and proportionality **within the
  single extraction**. The third property — consistency across equivalent inputs — is **unavailable by
  construction**, because a `rejected_by_guardrail` candidate never reaches `/api/reason`.

State the mentor's own summary: *"The §6 report carries two distinct evidence streams: cross-endpoint
divergence for winners, guardrail-internal coherence for filtered candidates. Neither closes the
problem. Both narrow it honestly."*

**(c) Each check with its PASS case, not only its failure signature.** A criterion that names only
failure will read every unusual verdict as a defect.

**(d) The two divergence signatures, as distinct failure classes** — the correction the mentor already
made once to the B7 relay, so do not lose it here:
- **empty-vs-populated** (cycle 5's signature — one side did not read the text);
- **disjoint domain sets** (no instance yet in the run — both sides read it, as being about different
  things).
Plus the recording vocabulary: `clean` · `diverged` · `not_comparable` · `unlabelled`.
**`not_comparable`** is cycle 6's condition (one side made no attempt) — it is **not** a divergence and
must not inflate the §6 divergence rate. Under B5 it behaves like `unlabelled`: out of scope, never
inferred clean.

**(e) The three failure classes**, by their ruled names — `contamination` (addition),
`extraction_instability` (omission), `layer1_throw` (honest non-attempt) — **with the mentor's reason
why the third is categorically different**: it announces its own failure, so it cannot contaminate
completed verdicts, only reduce their count.

**(f) The doubled honest bound.** Two agreeing cross-endpoint extractions can both be wrong (C3), *and*
two agreeing guardrail extractions can both be wrong (Q4-e). Say both. The criterion narrows the locust
problem; it does not close it.

**(g) The dikaiosyne floor pattern**, carried as a named finding with **both** the mentor's readings
stated and **not diagnosed** — plus the discriminator S4 §2.6 proposes (whether the proposal places a
*new reliability claim on the assessment-bearing surface itself*), explicitly labelled a **proposed
refinement at N=6**, with h3 named as the control that makes it discriminating. Carry the binding
instruction: **do not adjust the generation heuristics to avoid producing disclosure proposals.**

**(h) The §6 framing the mentor gave for the three `dependency_unavailable` cycles**, verbatim, because
the naive reading is the opposite: they are evidence *"the retry-then-stop discipline is working …
costing cycles and preserving integrity. That is the correct trade."*

### What it must NOT do

- Not propose the `projectContext` architectural fix. Mentor-ruled, deliberately unscheduled. **Do not
  build it unless the founder explicitly asks.**
- Not touch `practitionerContext`'s parallel defect (named, deliberately left).
- Not specify the parked watching-table extension beyond what S4 §4 already says (derived summary in
  v1, per C4).
- Not write anything into the run's records.

---

## 4. S6 — `friction-primary-hypothesis.md`

### What it must contain

**(a) The hypothesis in the mentor's words, with the mentor's own caution intact** (*"This is a
hypothesis to be tested"*).

**(b) The evidence table**, with **every caveat inline on the row it qualifies**, never collected in a
footnote. Cycle 2 is never cited as `principled` without both labels: **uncertified** (it predates the
contamination fix) **and `observed` not `examined`** (29,750 ms against the 28,000 ms bound).

**(c) The frozen null result, transcribed verbatim from the B6/B5 record.** Do not paraphrase it, do not
improve it, do not re-type it from memory. It is frozen; the document's job is to carry it exactly.

**(d) The three-axis structure** (Q6-e): proximity distribution × extraction cleanliness × **proposal
class**. The three classes are named by the ruling: **disclosure/labelling** · **friction-identified** ·
**virtue-domain proposals that are neither**.

**(e) Strict wins separated from tie-break wins throughout** — and the mentor's finding stated as its
own finding, not as a weaker version of the sought one: *"Three tie-break appearances at the top is a
real finding. It is not the finding the friction hypothesis originally pointed at."*

**(f) The mandatory underpowered-evidence clause.** If the clean-cycle count or the strict-win count is
too small to disaggregate three ways, the §6 report **says so** rather than forcing a conclusion. Given
that three of six cycles to date are `dependency_unavailable` and cycles 1–2 are uncertified, this is a
live possibility.

**(g) The scope boundary (C7, made load-bearing by Q6-e):** cycle 6's evidence bears on **heuristic 7 as
it currently exists — technical friction**. It does **not** bear on the normative-gap mechanism, which
has not been built. **The §6 report must not conflate them.**

**(h) The B7 dependency, stated plainly:** the discriminator is restricted to cycles cross-checked
clean, and the cross-check began at cycle 6. Cycles before it carry no label and are out of scope.

### What it must NOT do

- Not propose the reordering, prepare for it, or write anything a later session could read as
  authorisation. The mentor's line is exact: the finding *"may support reordering them."*
- Not re-specify the frozen null result. Adding the third axis is a **reporting** addition; the
  discriminator stands as written.

---

## 5. Verification before you close

1. `git diff --stat` — documents only; nothing outside the two permitted paths.
2. Every number cited traced to `RUN-LOG.md`, not to a scope document's summary of it.
3. Every mentor quotation traced to a verbatim record.
4. Cycle 2 never appears with `principled` unlabelled.
5. The frozen null result is byte-identical to the record it came from.
6. Both honest bounds present in S4; the underpowered-evidence clause present in S6.
7. Nothing written into `/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`.

**PR19:** an independent adversarial review is required before any build in this family lands. These
are documents feeding a live analysis rather than code, so scale it accordingly — a focused review on
(a) fidelity to the frozen null result, (b) whether any caveat has drifted from the row it qualifies,
and (c) claims-vs-run-log is proportionate. If an account limit forces a first-hand fallback, disclose
it and note that an independent re-run can follow.

---

## 6. Close with

- A decision-log entry (`D-S4-S6-CRITERION-AND-HYPOTHESIS-AUTHORED-…`), following the house shape.
- A note in `00-PRIORITY-INDEX.md` marking S4 and S6's concurrent halves **done**, and what remains
  parked (S4's table extension on the §6 report; S6's reordering decision on the §6 report then the
  standing-runner design).
- **A statement of what the founder must relay**, if anything — most likely: both documents exist and
  the §6 report should draw on them. **You do not carry them into the run yourself.**

---

## 7. What is NOT this session

**S8** (the generation-step dated amendment, per B1's middle option) — next in order, its own session.
**S1 → S2 → S3** (the framing trilogy) — now unblocked, `inbox/eleven traits research.rtf` is committed;
**cite traits by name, never by number** (the source is unnumbered and the synthesis's positional
reference is off by two). **S5** — unblocked, wording approved, transcribe from the record verbatim.
**S7** — the build; unblocked, but it is an R20a perimeter change and deserves its own session.

Nothing here bears on the 0h call.
