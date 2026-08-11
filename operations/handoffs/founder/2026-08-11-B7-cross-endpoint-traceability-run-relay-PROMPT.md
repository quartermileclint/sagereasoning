# B7 relay — cross-endpoint traceability comparison, into the validation run's own channel

**What this file is:** the text for the founder to paste into a session working in the
**idea-loop-validation-run scratch project** (`/Users/clintonaitkenhead/Claude-work/PROJECTS/idea-loop-validation-run/`).
It carries a mentor ruling on the run's own review protocol. **Authored in the `sagereasoning` repo,
executed in the run's project** — the ruling is explicit that the mechanism belongs to the run, and a
`sagereasoning`-side session must not write into the run's records.

**Provenance for the receiving session:** this is a **founder relay of a mentor ruling**, not an
instruction from another AI session. The ruling text below is verbatim and binding; everything under
"How to apply it" is the relaying session's specification, which the receiving session should check
against the ruling rather than accept.

**Source of record (in the `sagereasoning` repo, not the run's project):**
`operations/primal-substrate-2026-08/2026-08-11-mentor-ruling-scope-confirmation-verbatim.md` §B7, §C2,
§C3, §C4, §B5; and the scope document it rules on,
`operations/primal-substrate-2026-08/S4-traceability-criterion-scope.md`.

---

## PASTE FROM HERE

You are working in the **idea-loop-validation-run** scratch project. This message carries a **mentor
ruling on the run's own review protocol**, relayed by the founder. It is not a build task and it does
not touch the `sagereasoning` repo.

### 1. The ruling, verbatim and binding

> **B7. S4 — Traceability check mid-flight.** Ruling: the cross-endpoint comparison is proposed through
> the run's own channel now, in this response, as a ruling on the run's review protocol. It requires no
> repo-side session because it costs nothing — both extractions are already produced every cycle,
> already billed, never compared. **The check is: after each cycle's winner is identified, compare the
> guardrail extraction and the reason extraction on the same input. Divergence is flagged.** The table
> extension is the durable record of it, parked on the §6 report gate. **The mechanism is the comparison
> itself, which starts immediately.**

Three supporting confirmations from the same ruling:

> **C2.** The cross-endpoint comparison is adopted as **the systematic step now**. Zero cost, no schema
> change. The table extension is the durable record, **not the mechanism**.
>
> **C3.** The criterion's honest bound is stated explicitly: **the check detects divergence and
> unsourceability. Two agreeing extractions can both be wrong.** No third independent reading is
> introduced.
>
> **C4.** Derived summary in v1 — **element counts, domain set, divergence flag** — with
> `guardrail_session_id` preserving the full re-audit path. Verbatim is preserved as an upgrade path,
> not a v1 requirement.

### 2. Why this exists

The check is the operational form of a criterion the mentor stated for distinguishing genuine
examination from simulated examination:

> genuine examination produces verdicts that are **traceable to the specific content examined**,
> **proportionate to the actual virtue domains engaged**, and **consistent across equivalent inputs**.
> Simulated examination produces verdicts that are **confident, formulaic, and contaminated by context
> that was not in the input**.

**This run has already produced both failure modes, and the second was caught by exactly this
comparison:**

- **Cycle 3 — `contamination`** (by addition): `/api/reason` extracted content never submitted.
  Root-caused to an unlabelled `projectContext` block; fixed 2026-08-11.
- **Cycle 5 — `extraction_instability`** (by omission): `/api/reason` returned an **empty extraction**
  with an articulate justification, on text `/api/guardrail` had extracted richly minutes earlier in
  the same cycle. Mentor-ruled as having **no clean fix**; carried as a named §6 finding.

Cycle 5's incident section in `RUN-LOG.md` is the **worked example** of the check — it was found by
comparing the two readings, and the run log's own inference is the model: a materially poorer
extraction of the same text *"is not a floored version of the guardrail's reading (floors can only make
a verdict more conservative on a shared extraction)."* You are being asked to do systematically, every
cycle, what was done ad hoc at cycle 5.

**But read cycle 5 as one failure class, not as the whole check.** Cycle 5 is the
**empty-vs-populated** signature. §3 defines a **second, independent** signature — **disjoint domain
sets** — which has not yet occurred in this run and therefore has no worked example. A session that
takes cycle 5 as the template will look only for empty extractions and miss the case where both
readings are populated but are about different things.

### 3. How to apply it — from the next cycle onward

**Cost: zero.** Both extractions are already produced and already billed every cycle. Nothing new is
called. No schema changes. No `sagereasoning` code changes.

**At the point the cycle's winner is identified**, compare the two extractions of that winner's action
text:

| Source | Where it comes from |
| --- | --- |
| **Guardrail extraction** | the `/api/guardrail` call made for that candidate during the filtering step |
| **Reason extraction** | the `/api/reason` winner consult |

**Compare on three axes:**

1. **Element counts per category** — `control_filter_elements`, `oikeiosis_circles_engaged`,
   `kathekon_factors`.
2. **The virtue-domain set.**
3. **The resulting proximity.**

**Flag as a material divergence when either holds:**

- one reading is **empty or near-empty** where the other is populated (cycle 5's signature); or
- the domain sets are **disjoint** — not merely different in size, but sharing no domain.

**Disjoint domain sets are a distinct failure class from empty-vs-populated — both flag, for different
reasons.** The first is one endpoint failing to read the text at all; the second is both endpoints
reading it, and reading it as being about different things. Do not treat "disjoint" as a stricter
version of "empty" — a cycle can be perfectly populated on both sides and still diverge.

A proximity difference **alone** is not automatically a divergence: a floor can lawfully make one
verdict more conservative on a *shared* extraction. The question the check asks is whether the two
readings were computed over **the same understanding of the text**, not whether they reached the same
number.

**On a flagged divergence**, apply the existing posture the run already uses for served-but-wrong
responses — the cycle-3 precedent: one retry, then stop-and-escalate rather than retry-and-proceed,
because a served-but-wrong verdict cannot be distinguished from a correct one without independent
knowledge of what was submitted. **Here the sibling reading is that independent knowledge.** Record it
as a first-class finding, not a footnote.

### 4. What to record — every cycle, including the clean ones

Record for **every** cycle from now on, in the carried-findings section of `RUN-LOG.md`:

- the **element counts** from both readings,
- the **domain set** from both readings,
- a **divergence flag** — `clean` or `diverged`,
- and, where present, the `guardrail_session_id`, which preserves the full re-audit path against the
  signed assessments.

**Record the clean cycles too.** This is load-bearing, not bookkeeping: without the negative cases
there is no denominator, and "two incidents in five cycles" cannot be interpreted. The §6 report needs
a **rate**, not a list of anomalies.

### 5. Why the per-cycle label matters more than it looks — the S6 dependency

The same ruling **froze the null result** for the friction-channel hypothesis, and the frozen wording
restricts it to cross-checked cycles:

> the friction hypothesis is **rejected** if, **restricted to cycles whose winner extraction was
> cross-checked clean**, h7's proximity distribution — with strict wins and tie-break wins reported
> separately — does not differ from h1–h6's distribution when blast-radius and reversibility are read
> alongside proximity.

**So the `clean` / `diverged` label is an input to the frozen discriminator, not just a quality note.**
Cycles that carry no label cannot enter that analysis at all. Every cycle from here that is labelled is
a cycle the §6 friction analysis can use; every cycle that is not, is not.

This is also why the mentor ruled the check starts *immediately* rather than at the §6 report.

### 6. The honest bound — state it in the record

Per C3, and it must appear wherever the check's results are reported:

**The check detects divergence and unsourceability. It does not detect a consistently wrong
extraction — two agreeing readings can both be wrong.** No third independent reading is introduced to
break agreement. The check narrows the problem; it does not close it.

### 7. What this does NOT change

- **No cycle outcome is re-decided.** Cycles 1–5's recorded outcomes stand.
- **Cycles 1–2 remain uncertified, not cleared**, exactly as previously ruled.
- **No new endpoint, call, cost, or schema.** The durable table extension is parked on the §6 report
  gate and is explicitly *not* the mechanism.
- **No `sagereasoning` repo change** is requested by this ruling.

### 8. One question to answer honestly, not assume

**Can cycles 1–5 be retrospectively labelled?** That depends on whether both extractions were preserved
for each cycle's winner — check what the run's own artefacts actually hold rather than assuming either
way. Cycle 5's are preserved (its incident section documents both readings). If earlier cycles'
extractions were not retained, say so plainly and label them **`unlabelled`** rather than inferring a
`clean` from the absence of a recorded anomaly — an unexamined cycle is not a clean one, and under the
frozen B5 discriminator an `unlabelled` cycle is simply out of scope for the friction analysis.

## PASTE TO HERE

---

## Mentor review of this prompt — 2026-08-11

**Reviewed before relay and cleared, with one precision correction, now applied.**

**The correction (applied at both places it lands):** §3's divergence definition was correct as
stated, but §2's worked example describes cycle 5 as *empty-vs-populated*, not *disjoint domains* —
*"The receiving session needs to know these are two distinct signatures, not one. The current text
implies they are alternatives of equal weight. They are — but a session reading quickly may treat
'disjoint' as a stricter version of 'empty' rather than a separate failure class."* The mentor's
suggested sentence is now in §3 verbatim, and §2 additionally warns that cycle 5 is **one** failure
class with no worked example yet existing for the other — closing the ambiguity at its source rather
than only at its restatement. Classed by the mentor as *"a minor precision point, not a blocking
issue."*

**All five judgement calls confirmed sound**, in the mentor's own words:

1. **Proximity difference alone is not a divergence** — *"A floor operating on a shared extraction is
   the system working as designed. The question is whether both readings understood the same text."*
   The cycle-5 run-log inference is the authority and is cited correctly.
2. **Record clean cycles too** — *"Without a denominator, 'two incidents in five cycles' is
   uninterpretable. The §6 report needs a rate."* The S6 dependency in §5 is the right reason to
   emphasise it.
3. **The cycle-3 retry-then-stop posture transfers by analogy** — *"the sibling reading is that
   independent knowledge."* Stating it as a drawn analogy the receiving session should check against
   the ruling, rather than as ruling text, is *"the honest framing."*
4. **The `unlabelled` category** — *"Correct and important. An unexamined cycle is not a clean one …
   Under the frozen B5 discriminator, unlabelled is simply out of scope — safer than a false clean
   entering the friction analysis."*
5. **Retrospective labelling posed as a question, not assumed** — *"You cannot see the run's artefacts
   from here."*

---

## Notes for the founder (not part of the pasted text)

- **This is the whole of the B7 action.** Once the receiving session records the ruling in `RUN-LOG.md`
  and applies the check from the next cycle, B7 is discharged.
- **It does not need a `sagereasoning` session.** The ruling says so explicitly (*"It requires no
  repo-side session"*), and S4's own concurrent half is already written on the repo side.
- **S6 can be written before or after this lands** — B7 gates S6's *data*, not S6's *writing*. But the
  sooner the labelling starts, the more cycles the frozen discriminator can actually use.
- If the receiving session pushes back on any specification in §3–§4, **the ruling text in §1 governs**
  and the specification is the relaying session's reading of it, open to correction.
