# Close — O-C Gate 3: the per-consumer rendering design session

**Date:** 2026-09-03. **Stream:** founder. **Tier:** `governance` — Standard risk, documents only.
**AC7:** not engaged. **PR6:** not engaged. **Production:** untouched — `git diff -- website/` clean;
`SUBSTRATE_LAYER3_ENABLED` unset throughout.
**Session model:** `claude-opus-5` (effort high) for the authoring and the fold; the three adversarial
reviewers ran under `claude-sonnet-5` at the founder's election, the model being restored before the
fold began.
**Decision-log entry:** `D-OC-GATE3-DESIGN-DOCUMENT-AUTHORED-PR19-REWRITTEN`.

---

## 1. Status in one paragraph

Gate 3 of the O-C three-gate chain opened on founder election and produced a design document for its
own mentor ruling, plus a question-format companion. **The first draft's central proposition was
withdrawn as refuted and the document substantially rewritten** after three independent blind
adversarial reviews. Nothing was built, flagged, activated or published. The design's own boundary
question — whether Gate 3 and Ruling Set E's A4 are the same question routed twice — is asked
**first**, because if the mentor answers it the other way the design's substance belongs to the
standing-runner track and this document becomes an input rather than a design.

## 2. What was produced

| File | What it is |
|---|---|
| `operations/agent-circles-2026-08/2026-09-03-DESIGN-DOCUMENT-oc-per-consumer-rendering-FOR-RULING.md` | The design. §0 re-verification, §§2–4 the five dimensions in the ruled order, §5 the proposed shape, §6 channel classification + success criterion, §7 non-licensing, §8 seven questions, §10 the review record |
| `operations/agent-circles-2026-08/2026-09-03-MENTOR-QUESTIONS-oc-gate3-per-consumer-rendering.md` | The distillation for ruling — PR20 mechanism facts, three corrections, the seven questions |

## 3. The substantive result

**Answered.** Q2's generalisation question: L-5's discipline **does** generalise, by inverting who
owes the honesty — on reflect the practitioner owes the honest *"I cannot determine"*; on consult the
**server** does. Q3's cross-endpoint question: **render the disposition, decline to render the
comparison** — a consult response cannot carry a comparison it has not performed, but it can honestly
say that this endpoint's reading is not guaranteed to match another's.

**Proposed.** A `rendering` block of nine elements, sited beside `meta.trajectory`, outside the signed
assessment, absent when the flag is off. **Five of the nine need no new wording** — they re-site text
already ruled, battery-locked and live on other surfaces.

**The design's own centre of gravity, stated honestly:** most of what dimension (c) requires already
exists. The gap is not absent honest language; it is honest language **sited where the practitioner it
concerns does not read it** — delivery on the public trust record, floor provenance and the
corroboration report inside the signed assessment.

## 4. What the adversarial review changed (PR19, by analogy)

PR19 does not literally bind a governance document. It was invoked by analogy following the
nine-candidate precedent, because the document has design consequences and goes to the mentor. **Three
independent blind reviewers**, each told to break rather than confirm. **Every load-bearing finding was
re-verified first-hand against source before folding.**

**The withdrawn proposition.** *"The per-consumer part of per-consumer rendering is form, not
content"* fails three ways: **Ruling Set D's L-2 rules the opposite** and the first draft **never
quoted L-2**; **the crisis precedent cited as its own support refutes it** (`safety_signal` *"ignored
for human_user audience"*, `developer_note` agent-only — content withheld from the human by design);
and it was **circular**. Replaced by the **disclosure floor**: content may differ by audience; the
floor may not.

**Also folded:** a **fabricated quotation** (a composite in no primary source, with "[the framing]"
substituted for "it" — and the predecessor Gate-2 document had it right, so a regression); a **false
premise** about the served `meta` shape, which surfaced `meta.trajectory` as the precedent the draft
had missed; a **self-defeating collision** between the draft's own relay constraint and its flagship
element; an **unreachable remedy** (the trust-record pointer 404s for orientation-only agents);
**dimension (d) silently narrowed** to its "why" half with L-2's affordance half dropped; **dimension
(e) mislabelled as declined** while two (e) decisions were being made; **no channel classification**;
and a **"robust under both readings" claim** achieved by redefining Reading A until it converged.

## 5. Two corrections this session's own verification found

**(a) The prescribed Part A dormancy check was structurally blind.** The session prompt's command
names `website/src/lib/substrate/layer3-prose.ts` — **which does not exist**; the file is under
`translation-sandwich/`. `git log` does not error on a non-matching pathspec, so the check silently
covered two of three files and would have reported clean regardless of what happened to the third.
Per-file, all three predate the chain — dormancy holds, but that check did not establish it. **The
same wrong path appears in the Gate-2 document's §6 table.**

**(b) An inherited misattribution.** The Gate-2 document cites the B7 scoping as *"Ruling Set D's
B/R-6"*; Ruling Set D contains no such item. It is **Ruling Set B's R-6**, and its full wording ends
with a clause the Gate-2 document drops — *"a served form needs its own scoping session"* — which
bears directly on this document's own (c-3) position.

## 6. The delivery-polarity correction, with its debit

Source: `elapsedMs <= 28000 ⇒ 'examined'`, `> 28000 ⇒ 'observed'`. **19 of 22 (≈86%) landed outside
the window, not 3 of 22 (14%).** Precisely: the Gate-2 document's **§2.2 is correct**; its **§3
mis-summarises its own evidence**; the session prompt repeats §3's error **while citing §2.2**; the
mentor's Q2 ruling inherits the figure.

**The first draft took the credit without the debit, and that is corrected.** At 86% outside, a
response-borne delivery notice reaches ~14% of readers — the circularity is the dominant case, not a
caveat, and the element's value shifts onto a pointer that does not resolve for the target population.
Q2's substance is untouched and strengthened; **this design element is weakened.**

## 7. Status changes

| Item | Old | New |
|---|---|---|
| O-C Gate 3 | Licensed, unopened | **Run; design document FOR RULING** |
| The O-C design question | Scoped (Gate 2) | **Designed, awaiting Gate-3 ruling** |
| `SUBSTRATE_LAYER3_ENABLED` | Unset | **Unset** (unchanged) |
| The three Layer-3 files | Untouched | **Untouched** |
| A4 / Gate-3 ownership | Unnoticed | **Surfaced as an open boundary question** |

## 8. Open questions — all seven are the mentor's

Design §8, in order: **Q1** the A4 boundary (asked first — it conditions the rest); **Q2** the
disclosure floor; **Q3** re-siting ruled text; **Q4** the delivery sentence's referent under a change
of surface; **Q5** the refusal class; **Q6** the pointer and the ENV-1 gate; **Q7** dimension (d)'s
evidential position.

## 9. What this session did NOT license

Activation; any edit to the Layer-3 files, `parallel-run.ts`, `/api/reason/route.ts`, or
`orientation-reading.ts`; any new delivery-class computation on the human path; any change to the
trust record's ENV-1 gate; any schema change for the four relational-context fields (F-b); any change
to `question-bank.ts` (L-5); publication of any string, **including the re-sited ones**; any change to
the R18 surfaces; any movement of R8's gates or the A2/A4 routings. Any eventual build is additionally
gated on the byte-identity guard's end condition.

## 10. Blocked on / carried

- **The Gate-3 ruling.** Nothing on this track proceeds without it.
- **Two documents the mentor may wish corrected in place**, both outside this session's remit: the
  Gate-2 document's §3 delivery figure, and its §6 wrong path for `layer3-prose.ts` plus its B/R-6
  attribution. Named, not edited — they are ruled documents.
- **Unchanged elsewhere:** R8's gates; F-b; L-5; the standing-runner track's next design-capable
  session; the founder-walked live-step queue; the 0h call.

## 11. Founder verification

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git diff --stat -- website/
grep -c "single credentialed loop identity" operations/agent-circles-2026-08/2026-09-03-DESIGN-DOCUMENT-oc-per-consumer-rendering-FOR-RULING.md
```
Expected: **no output** from the first (no code, schema or config touched); **7** from the second (the
Q5 caveat at each point of §6 citation).

## 12. Session honesty notes

- **The Gate-1 pre-decision frame and most Gate-2 at-action examinations returned UNAVAILABLE** (28s
  timeout). One at-action guardrail CAUTION did fire — on a read-only `grep`, while both document
  writes proceeded unguarded. The frame's own text on that caution read *"No kathekon factors were
  extracted from the submitted text"*, which is the documented sparse-extraction class; the closing
  reflection recorded that reading rather than deferring to a contrary characterisation.
- **The review's shape was drafted by the author it would judge.** Disclosed rather than left
  unremarked.
- **Concurrency:** `git status` run twice; commit path-scoped; the decision-log entry appended at the
  physical tail. One untracked file from another session
  (`2026-09-01-score-save-perimeter-activation-NEXT-SESSION-PROMPT.md`) was left alone.

## 13. Cross-references

`D-OC-GATE3-DESIGN-DOCUMENT-AUTHORED-PR19-REWRITTEN` ·
`D-MENTOR-RULINGS-OC-GATE2-ADOPTED-GATE3-LICENSED-2026-08-23` ·
`D-MENTOR-RULING-SET-D-LAYER3-SCOPE-DOCUMENT-RECORDED-2026-08-15` ·
`2026-08-30-mentor-ruling-set-E-A2-A3-A4-D-verbatim.md` ·
`operations/handoffs/founder/2026-09-03-OC-Gate3-per-consumer-rendering-DESIGN-NEXT-SESSION-PROMPT.md`

*End of close. The design goes to the mentor at the founder's cadence; it self-starts nothing.*
