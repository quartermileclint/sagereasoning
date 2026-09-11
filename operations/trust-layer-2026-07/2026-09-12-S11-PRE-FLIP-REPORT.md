# S11 pre-flip report — the four-part readiness standard, first assembled reading

**Assembled Sat Sep 12 2026, 08:39 AEST (2026-09-11T22:39:56Z), from `date`.** Session continuing
`8fe3a6ae-dcb1-4324-846d-631d51336dc4`. **Evidence file (the production run this report reads):**
`operations/trust-layer-2026-07/runs/2026-09-12/observation-report-PRODUCTION-RUN.txt`
— the first non-dry-run of `false-hold-observation-report.ts` (ingest + trust-state read) against
production, buffer at **492 lines** at run time. Consult-side outage figures are the one thing below
that the script does not produce; they were read from `gate1.log` by the method stated in §4.4.

**STATUS: RELAYED AND RULED ON, 2026-09-12.** The mentor has reviewed this report and ruled on all
three of its §11 questions; those rulings are folded into §§1–4, §6, §8 and §11 below, each marked
⚖️ at the point it binds. Canonical verbatim:
`operations/trust-layer-2026-07/2026-09-12-mentor-ruling-preflip-report-three-questions-verbatim.md`
— **verbatim wins over every line of this report.** §12 lists what is owed after the ruling.

**What this report is:** the record the 2026-07-12 enforce-gate verdict asked to be brought back —
*"Return in seven days with the record. The assent will be examined then."* It carries every
disclosure the rulings since have made required pre-flip content (the 2026-09-07 S8 ruling; the
2026-09-10 Q1 ruling; the 2026-09-11 regime ruling; and now the 2026-09-12 ruling on this report).

**What this report is not:** a licence to flip. It computes nothing binding. The S11 flip remains a
founder-walked Critical activation, re-confirmed at flip time regardless (PR7). **Every number below
is a claim to re-derive, not a fact to quote forward** — the buffer is append-only and had already
moved by the time this was written.

---

## 0. The standard, verbatim (2026-07-12 verdict, Q1)

**PR19 fold, 2026-09-12 (found by the pre-flip review workflow, findings #1/#6, both CONFIRMED
2/2):** the first draft of this blockquote used "…" to mark one elision (in the false-hold-rate
bullet) but silently truncated two others with no mark at all. Every elision below is now marked.

> **Duration:** a minimum of seven days of live MEASURE accumulation on the founder's loop, covering a
> representative distribution of action types — not just the current session's action class.
> **Record shape:** all four cardinal domains evaluated at least once each, with the aggregate
> confidence rising above conservative on at least two domains. […A trust record with one evaluated
> domain at conservative confidence is not a record that can tell you whether the decision table's
> pause and do-not-proceed rows would fire correctly or over-fire on the actual distribution.]
> **False-hold rate:** a measured false-hold rate on the at-action examination across the live
> distribution, not the battery distribution… the false-hold rate on kathekon-free actions does not
> exceed the rate at which the examination correctly holds genuinely problematic actions.
> **The G6 composition question** — addressed fully in Q3 — must be resolved before the assent,
> because the G6 line-item as currently specified would have held the writing of this consultation
> document.

## 1. The board, honestly

**⚖️ RULED 2026-09-12 — all three of this report's §11 questions are answered.** Verbatim, canonical:
`operations/trust-layer-2026-07/2026-09-12-mentor-ruling-preflip-report-three-questions-verbatim.md`
(verbatim wins over every line below). The board is updated to the ruled readings; §11 now records
the answers rather than posing the questions.

| Part | Reading at this assembly | Basis |
|---|---|---|
| **(1) Duration ≥ 7 days, representative** | **NOT MET — 5.54 days on the window's own clock. RULED 2026-09-12 (Q-A): the window-clock reading is the operative one**, on the same reasoning the 2026-09-11 ruling applied to part (3); the script's "61.39 days ⇒ MEETS" is a pooled-span artifact and *"a disclosure, not an answer."* Counting threshold reached **2026-09-13T09:44:55Z = Sun 13 Sep 19:44 AEST**. Representativeness: composition disclosed, §2.2 — and the ruling adds that reaching the mark *"does not change what the window contains."* | window start 2026-09-06T09:44:55Z → run 2026-09-11T22:39:56Z |
| **(2) All four domains evaluated; ≥2 above conservative** | **NOT MET — 1 of 4. RULED 2026-09-12 (Q-B): the trust-state reading is the operative one**, resolving the ambiguity this report identified — *"the standard asks for evaluation that produces a record, not engagement that passes through the harness without leaving a trace."* The records-proxy 4/4 answers a different question. **Structurally blocked by the emission path; the recommended path is Branch 1** (a founder-walked accreditation write) — §3. | production trust-state read |
| **(3) Measured false-hold rate, false ≤ correct** | **MET under `at-action-v2-composed` (0 false-positive holds, 73 correct holds).** Instrument age ≈ 5.5 days. Pre-window `at-action-v1-lean` (n=138: 137 false-positive, 0 correct, 1 not-a-hold) excluded per ADR-014. Ruled 2026-09-11. **Guard-side sub-figure carries its own ruled qualification (Q-C): MET (0 false-positive holds, 3 correct holds; n=3 — rate stated, not leaned on)** — §4.2. | §4 |
| **(4) The G6 composition question** | **SATISFIED** (the shared Q3 predicate is the classifier used) **plus the further qualification ruled 2026-09-07 encoded as a disclosure**, §5. | §5 |

**Read plainly: two of four parts are met; part (1) reaches its counting threshold on Sunday
evening; part (2) is structurally blocked and will not be met by waiting.** Part (2) is the long
pole, and the 2026-09-12 ruling confirms it: the block is the emission path, and the path through it
is a founder-walked accreditation write **that must reflect what the loop actually demonstrated** —
see §3's closing, which carries the most important sentence in that ruling.

---

## 2. Part (1) — duration and representativeness

### 2.1 The window clock, and a script artifact disclosed

The observation window started **2026-09-06T09:44:55Z** (took-effect proven; the buffer's record 139
is the probe, the window is record 140 onward). At the run stamp the window had run **5 days 12 h 55
m = 5.54 days.** It reaches seven days at **2026-09-13T09:44:55Z (Sun 13 Sep 19:44 AEST).**

The script's Part 1 line reads `window: 2026-07-12T13:15:47Z → 2026-09-11T22:39:54Z · span: 61.39
days ⇒ MEETS ≥7 days`. That span begins at the buffer's first **pre-window `v1`** record (the
retired July instrument). It is the same class of error the 2026-09-11 ruling addressed for part (3)
— a figure computed over a mixture of the retired and current instruments describes neither — and it
is **disclosed here, not silently corrected**: `false-hold-observation-report.ts` matches `GUARD_RE`,
the window is armed, and no waiver covers a Part-1 edit.

**⚖️ RULED 2026-09-12 (Q-A) — the window-clock reading is operative, and the script defect is
confirmed.** Verbatim: *"The pooled span is a disclosure, not an answer… Part (1) is NOT MET at the
time of this assembly and reaches its counting threshold on Sunday evening."* The ruling confirms
§8 item 1 as a defect *"on the same grounds as the Part 3 defect the 2026-09-11 ruling corrected"*
and holds that **it needs its own waiver before it can be fixed**, with the grounds it should state
dictated by the ruling itself:

> the window-clock figure is the operative one per this ruling; the script's current output is the
> same class of pooled-span artifact that Part 3 carried before correction.

**That waiver has not been requested or granted as of this fold, and the fix is NOT made here.** The
correction is scoped to Part 1's span computation only — the same shape the Part 3 correction took.

### 2.2 Representativeness — composition disclosed, never filtered

Per the 2026-09-07 ruling (Question A): a documentation-only day **counts**, and *"the disclosure for
the baseline reports composition alongside the count."* The window's consult population, day by day
(UTC), from the run's Part 5d — reconciled 1:1 against `gate1.log`'s `CONSULT` lines (78 = 78, every
day):

| UTC day | consult records | tool distribution |
|---|---|---|
| 2026-09-06 | 3 | Edit 3 |
| 2026-09-07 | 17 | Edit 12 · Write 5 |
| 2026-09-08 | 6 | Edit 2 · Write 4 |
| 2026-09-09 | 18 | Edit 8 · Write 10 |
| 2026-09-10 | 34 | Edit 27 · Write 7 |

Baseline days with ≥1 consult record: **5 of 5** — *"complete in the counting sense"* (mentor,
2026-09-10), which the same ruling held is **necessary but not sufficient**: days on which the
instrument was functionally modified (09-09 split at 19:27:17Z; 09-10 wholly under v6) are not
*ordinary* days. The instrument-change disclosure that ruling requires is §6.

**What the population is made of, stated rather than filtered.** Every consult record in the window
is a Write/Edit examination; the overwhelming majority are governance and record-keeping documents,
not product code (§5's action-class split: 62 of 70 loop-opening consults were on product-or-
governing-document files, 8 on protocol-required record-keeping — but "governing document" here is
mostly ADRs, registers and plans, not `website/src`). The mentor ruled this a disclosure concern, not
a filtering concern, and this report treats it so.

**The tool-mode dependency, measured.** Over the same window, exact-token-matched and clipped to
`[2026-09-06T09:44:55Z, 2026-09-11T22:39:56Z]` (the window start through this run's own timestamp —
**PR19 fold, 2026-09-12, finding #3/#10, LOW/PLAUSIBLE, CONFIRMED: the first draft's figure of 2,850
did not reproduce against any stated boundary; re-derived here with the exact bound every other
log-derived number in this report already uses**), `gate1.log` records **2,846**
`AT-ACTION-SKIP-BASH` lines (Bash actions, dropped from the consult floor by design) against **78**
consult examinations and **276** guard verdicts. The consult denominator is therefore a sample of
Write/Edit actions only — the ruled structural dependency (S9), restated here because it is present
in every figure below. The per-session instance the mentor carried — *"51 guard records, 1 consult
record, a full build session"* — was re-derived this session and **reproduces exactly** (session
`a7ee3eeb…` through buffer line 360; that session later continued to 53 guard / 2 consult).

**⚖️ RULED 2026-09-12 (Q-A) — the composition, named plainly, to be carried into the Part (1)
assessment at the seven-day mark.** The ruling holds §2.2's treatment is right and adds that the
composition deserves stating in one place without qualification:

> The window's 78 consult records are overwhelmingly Write/Edit examinations of governance and
> record-keeping documents. The 2,846 Bash actions are dropped from the consult floor entirely. The
> at-action-v2-composed regime's 73 correct holds are all justice-surface reads. This is a real
> composition, honestly disclosed. **The seven-day clock reaching its mark does not change what the
> window contains.** The pre-flip report carries the composition; the 0h call rests on the disclosed
> facts.

**This is the sentence to carry forward on Sunday evening:** part (1)'s counting threshold arriving
is a fact about the clock, not about the population. Nothing in the composition above changes at
19:44 AEST on 2026-09-13.

---

## 3. Part (2) — the trust record's shape: NOT MET, and why waiting will not meet it

**PR19 fold, 2026-09-12 (findings #8/#11, HIGH/MEDIUM, both CONFIRMED — the same evidence file
prints a second figure this section originally omitted entirely).** The production run file carries
TWO distinct Part-2 readings under the same header, and the first draft of this report reported only
the second:

```
── Part 2 — four-domain coverage + confidence ─────────────────────
cardinal domains ENGAGED by the live examinations (records): 4/4 — phronesis, dikaiosyne, andreia, sophrosyne
[…]
── Part 2 (trust state) ───────────────────────────────────────────
cardinal domains evaluated (trust state, hasEvidence): 1/4 — dikaiosyne
  phronesis:  (no state row)
  dikaiosyne: level=habitual prior=habitual evidence=true
  andreia:    (no state row)
  sophrosyne: (no state row)
aggregate: level=habitual (limiting: dikaiosyne) confidenceWeight=0.420 coverageGaps=[]
part-2 proxy: all-four-evaluated=false; ≥2-with-evidence=false
```

**These are not the same claim, and the standard's own wording ("all four cardinal domains
evaluated") is ambiguous between them.** The **records-proxy** reading (4/4) counts every virtue
domain that appears in `virtue_domains_engaged` across the window's raw examination signals — it
answers "did the examinations, as extracted, touch all four domains?" The **trust-state** reading
(1/4) counts domains that have an actual row in the persisted trust profile — it answers "has an
accreditation write turned an examination of that domain into accumulated trust evidence?" The
examinations plainly engaged all four domains. **What has not happened is the second step**: turning
that engagement into a trust-state row, which (per below) requires an accreditation write, not more
consult volume.

**⚖️ RULED 2026-09-12 (Q-B) — THE AMBIGUITY IS RESOLVED: the trust-state reading is operative.**
Verbatim: *"The standard asks for evaluation that produces a record — not engagement that passes
through the harness without leaving a trace. The phrase 'aggregate confidence rising above
conservative on at least two domains' presupposes a record with confidence weights, which only the
trust-state produces. The records-proxy reading answers a different question: did the harness touch
these domains? The standard's question is: does the trust record reflect examined assessment of
these domains? Those are not the same question."* **Part (2) reads 1 of 4, NOT MET.** The
records-proxy 4/4 stays on this page as an honest disclosure of what the examinations touched; it is
**not** an alternative reading of the standard.

**On "above conservative":** the term is not encoded numerically anywhere in `trust-core` (checked:
no confidence-tier constant carries that name); the script itself says the precise tier reading *"is
the founder's call."* This report therefore reports the observable — one domain, weight 0.420 — and
claims nothing about the tier.

**Why three domains have no trust-state row, though all four were examined — a structural fact
about the emission path, not a sparse-data one.** Trust events are emitted only from accreditation
writes (`emitAccreditationTrustEvents`, gated on the R18f provenance check), one `credential-completed`
per cardinal domain the *signed assessments in that write* engaged (`derive-trust-events.ts:82–104`).
At-action consult examinations do not themselves become trust events — the register's own D1 row
states this directly: *"the at-action consults never became trust events (emission fires only on
accreditation writes, `emitAccreditationTrustEvents` gated on `provenanceEnforced`)."* Separately,
D1 also records that the harness's close-hook write path returns **409 before any emission** on
every close once the agent's accreditation row already exists (*"the accreditation route returns
409 before any emission on every close"*), because the close hook sends only a `seed`-kind body, no
`update` path. **PR19 fold, finding #4/#7 (NIT/LOW, CONFIRMED):** the phrase *"harness traffic can
never discharge it"* in the first draft was presented as a quote from D1; it is not there —
it is this session's own paraphrase (it does appear, unquoted, in an archived standing-opener
document) and is now stated as such, not in quotation marks. **Consequence: part (2) cannot be met
by more window days of the current harness traffic pattern alone.**

### 3.1 The three branches, as ruled 2026-09-12 (Q-B)

The ruling is on the fork, not on which branch to take — *"that is the founder's call, not this
ruling's to pre-empt."* Its assessment of each:

| Branch | Ruled assessment |
|---|---|
| **1. A founder-walked accreditation write** carrying signed assessments engaging `phronesis`/`andreia`/`sophrosyne` | **The structurally correct path, and the recommended one.** *"The emission path is working as designed… The design reflects a deliberate choice: the trust record should reflect examined, signed assessments, not the volume of harness traffic. A founder-walked accreditation write is not a workaround. It is the path the system was built for."* |
| **2. Change the close hook's seed-only shape** | *"Not ruled against, but it is the more complex path and it changes the emission semantics in ways that would need their own examination. **It is not the recommended branch.**"* A build under waiver, touching a `GUARD_RE` file. |
| **3. Re-read part (2) against what the dogfood loop can structurally produce** | **Examined and closed** — the trust-state reading is operative (above). This branch is not available as a way through. |

### 3.2 The condition on Branch 1 — the most important passage in the ruling

Branch 1 being recommended is **not** a licence to perform the write in order to clear the gate. The
ruling is explicit, and this is the sentence that governs:

> The founder should examine what signed assessments for phronesis, andreia, and sophrosyne would
> honestly reflect about the loop's behaviour in the window, and whether those assessments are ready
> to be made. **If they are not ready to be made honestly, the accreditation write should not be
> performed to discharge a gate. The gate exists to ensure the record reflects genuine assessment,
> not to be discharged by any available mechanism.**
>
> …The accreditation write should reflect what the loop has actually demonstrated, not what would
> discharge the gate. **If the honest assessment of phronesis, andreia, and sophrosyne is that the
> evidence is thin, the write should say so. A conservative confidence weight on a domain with thin
> evidence is not a failure. It is the correct reading.**

**Read against this window's own composition (§2.2), that condition has teeth.** The window's 73
correct holds are *all* justice-surface reads — `dikaiosyne`, the one domain that already has a
state row. What the window demonstrates about `phronesis`, `andreia` and `sophrosyne` specifically
is exactly the question the founder must answer before any write, and this report does not answer it
or pre-judge it. A thin-evidence reading, honestly recorded, satisfies the ruling; a write
constructed to produce four rows does not.

---

## 4. Part (3) — the measured false-hold rate

### 4.1 The operative reading (ruled 2026-09-11)

> **MET under `at-action-v2-composed` (0 false-positive holds, 73 correct holds). Instrument age:
> approximately 5.5 days. Pre-window `at-action-v1-lean` records (n=138: 137 false-positive, 0
> correct, 1 not-a-hold) excluded per ADR-014 — mixed regimes may not be presented as one
> distribution.**

**A divergence from the ruling's own dictated wording, disclosed rather than silently corrected
(PR19 fold, 2026-09-12, findings #2/#5/#9/#13, HIGH-to-LOW, all CONFIRMED — this is one issue raised
four times).** The 2026-09-11 ruling's Q3 dictates the pre-window clause as *"n=138, all
false-positive."* The buffer's actual pre-window population is **137 false-positive + 0 correct + 1
not-a-hold**, not 138/138 false-positive — the same fact the script's own regime split has always
shown (`at-action-v1-lean (pre-mark): n=138 false_positive=137 correct=0`). This report's §4.1
quotes the ruling's *structure* but substitutes the more precise breakdown without flagging the
substitution — the same class of silent departure §6 explicitly calls out and refuses to commit for
the v4=96 figure. Named here on the same footing: **the ruling said "all false-positive"; the buffer
says 137 of 138, with 1 record that is neither.** The one-record difference changes nothing about
the MET reading (the excluded population is pre-window regardless of its internal split), but a
mentor re-reading this report should not have to independently re-derive that their own dictated
wording was inexact.

**⚖️ RULED 2026-09-12 — SETTLED. The substitution stands.** Verbatim: *"The ruling's wording was
imprecise. The buffer's breakdown is the accurate one. This report's §4.1 substitution of the precise
breakdown for the ruling's wording is correct and should stand… The ruling's imprecision is named,
not corrected by silent substitution — which is exactly the discipline the report applied."* No
longer an open item for the founder or mentor.

The pooled figure is a **disclosure only**, never the headline (the ruling's own words: a mixture
*"that has never existed as a coherent measuring apparatus"*): pooled, 477 at-action examinations ·
210 holds (44.0%) · 137 false-positive · 73 correct · 65.2% false-positive rate among holds. Every one
of the 137 is a pre-window `v1` record.

### 4.2 Per population (the F-3′ obligation: the guard population reported separately)

| Population | Classified holds (false / correct) | Notes |
|---|---|---|
| **Consult** (n=216 all-time; 78 in-window) | pooled 137 / 70; **composed regime 0 / 70** | all 137 false-positives are pre-window `v1` |
| **Guard** (n=276, all in-window) | **MET (0 false-positive holds, 3 correct holds; n=3 — rate stated, not leaned on)** | only **3 guard denies** in the whole window; the other 273 guard records are cautions/proceeds that *allow* the tool and are not holds by definition |

The guard population's **denominator** was verified 1:1 against `gate1.log` on 2026-09-10 (258=258
then; 276=276 at this run: 254 `GUARD-CAUTION` + 18 `GUARD-PROCEED` + 3 `GUARD-BLOCK` + 1
`GUARD-OUTAGE`). Its **rate** — 0 false among 3 holds — is reported here for the first time.

**⚖️ RULED 2026-09-12 (Q-C) — the three-event rate discharges the F-3′ obligation, and it carries a
small-sample qualification** (wording dictated by the ruling, used verbatim in the table above):
*"MET (0 false-positive holds, 3 correct holds; n=3 — rate stated, not leaned on)."* On the
asymmetry with the consult-side figure, which the 2026-09-11 ruling held needs **no** such flag at
73 holds: *"The asymmetry… is not inconsistency. It reflects the actual difference in sample sizes.
73 holds is enough to characterise a rate. 3 holds is enough to report a rate. They are not the
same thing, and the pre-flip report should not treat them as if they were."* **The guard-side
availability figure (275/276 = 99.6%, §4.4) carries no analogous qualification** — ruled: *"a single
outage in 276 records is a precise count, not a rate over a thin sample."*

**A disclosure the script itself prints, repeated so it is not missed:** on the guard side the
decision-table column says `do-not-proceed` on **25** records, of which only **3** are classified
holds — the other **22** are `not_a_hold` records the table nonetheless recommends against (*"these
inflate the CORRECT count above from outside the classified-hold set"*). The two columns are reported
together precisely because the mapping is not total in either direction. Part (3)'s figure is the
**classification** column, per the P6 §7 ruling; the recommendation column is Part 3b's measure of
the table, not of the predicate.

### 4.3 What the correct holds were

Correct-hold arms over the 73: `justice-surface` 73 (the window's correct holds are entirely
justice-surface reads), `proximity≤habitual` 5, `violated` 2, `sub-species-passion` 2 (arms
overlap). Legacy bracket: 1 hold predates circle-identity capture and is bracket-decisive — it is a
`v1` record and is outside the operative figure regardless.

### 4.4 Outages — both sides, reported separately (ruling 2; F-3′)

- **Guard side:** 1 `no_assessment` record in 276 (excluded from the denominator, counted) —
  availability **275/276 = 99.6%**.
- **Consult side:** a consult outage returns *before* the capture call and writes **no buffer
  record**, so the count exists only in `gate1.log`. Read there, **window-clipped to
  2026-09-06T09:44:55Z and matched on the exact token `CONSULT-OUTAGE session=`**: **20 outages
  against 78 completed consults — availability 78/98 = 79.6%.** Reasons: `timeout after 55000ms`
  ×12, `no assessment in response` ×8. Per UTC day: 09-06 1 · 09-07 2 · 09-08 3 · 09-09 7 · 09-10 7.
- **A live instance of the prefix trap, disclosed:** this report's first count of the consult side
  read **zero** outages, because a regex of the form `CONSULT\b` matches `CONSULT-OUTAGE` — the
  exact `CONSULT`/`CONSULT-OUTAGE` trap the standing opener names. The space-anchored recount
  (which reconciled 78=78 against the buffer) exposed it. The 20 is the corrected figure.
- **The consult-side availability bound threshold** (F-3′: *"set the consult-side bound threshold
  after five ordinary post-remedy days"*) is a P6 design question and **remains unset**. The
  measured availability is reported; no threshold is claimed against it.

---

## 5. Part (4) — the G6 composition question

**Encoded:** `assessKathekonEngagement` (`kathekon-engagement.ts`) is the classifier every figure
above uses and *"the exact shared function the eventual S11 G6(a) qualification binds on"* — the
2026-07-12 Q3 qualification (justice surface / violated obligation / proximity ≤ habitual /
sub-species passion) is what "correct hold" means throughout this report.

**The further qualification (2026-09-07, B2), carried as a disclosed property, not a filter:**
*"G6(a) binds on kathekon-engaged loops opened by consequential actions on the product or its
governing documents, not on loops opened by the agent's own protocol-required record-keeping."* The
loop-events-by-action-class figure that ruling's B3 asked for (Part 5e; window-scoped; a heuristic
over `actionPreview`, stated as such; counts *events*, not reconciled lifecycles):

| Loop event | protocol-required | product-or-governing-document | unclassified |
|---|---|---|---|
| opened / reopened | 8 | 62 | 0 |
| closed | 1 | 5 | 0 |

Nothing in any other figure was excluded on this basis. **The binding of G6(a) itself — the S11
build — is not done and is not part of this report.**

---

## 6. The instrument-change disclosure (required pre-flip content, 2026-09-10 Q1 ruling)

- **Schema distribution in the window** (v1 excluded; the ruling's own convention): **v3=78 ·
  v4=96 · v5=135 · v6=44** (353 window records; whole buffer 492 incl. 138 `v1` + the probe).
  **⚖️ THE v4 OFF-BY-ONE IS RULED AND SETTLED (2026-09-12): the operative figure is 96.** Verbatim:
  *"The 2026-09-10 ruling's quoted figure carried v4=96 at a 423-line snapshot where the arithmetic
  gives 97. At this run the window's own v4 count is 96 (the probe sits outside the window). The
  operative figure is 96. The prior ruling's figure was a snapshot of a moving buffer; the current
  run's figure is the authoritative one for this report."* **No longer an open item.**
- **The edit-window anomaly:** **2** schema-v6 records read `callerClass: unknown` /
  `clientVersion: null` (2026-09-09T19:27:17Z and 19:28:21Z). Diagnosed 2026-09-10 at an honest
  confidence level — both fall inside the 19:25:00–19:29:27Z window in which
  `false-hold-capture.mjs` was being rewritten by sequential edits; a hook on a concurrent session
  most plausibly read a transiently inconsistent file. Corroborated by timestamp correlation, not
  proven by byte reconstruction. The safety property held: the read degraded to `unknown`, never to
  a false classification.
- **`live_agent` was not a possible emission for days 1 through most of day 4.** First possible
  emission: **2026-09-09T19:27:17.253Z** (the earliest v6 record). Every record before it reads
  `unknown`/`subagent` by construction — the value did not exist in the vocabulary. Day 09-09 is
  split (v3/v4/v5 before 19:27:17Z, v6 after); day 09-10 runs wholly under v6.
- **The caller-class population as it now stands** (guard side, Part 3b): post-boundary 179 — of
  which v6 = 44: `live_agent` 27 (included), `unknown` 3 (included, disclosed residual), `subagent`
  14 (excluded, the review-fleet class — the first non-null review-fleet exclusions in the window's
  history); pre-boundary 96 (composition unknown, no rate computed, by ruling); outage 1.

**The 2026-09-10 ruling's Q2 obligation — already discharged, not owed by this report.** **PR19
fold, 2026-09-12 (finding #12, HIGH, CONFIRMED):** the first draft of this report cited the
2026-09-10 ruling's Q1 and Q3/F-3′ but never named Q2, which states *"a retroactive check of
already-published guard-side and outage figures is owed… before the pre-flip report is written."*
That check was **already run and closed** in the same session that received the ruling
(`operations/handoffs/founder/2026-09-10-guard-log-buffer-reconciliation-CLOSE.md`, "The
retroactive check — CLEAN, and why that is structural rather than lucky"): no published figure in
this project was ever computed with a `tool=`-keyed regex, because the sole producer of published
figures (`false-hold-observation-report.ts`) never reads `gate1.log` at all. The obligation Q2 names
is therefore discharged, and this report inherits that clean result rather than owing a fresh check.

---

## 7. Two counting traps met while assembling this, on record

**TRAP-3 (1-indexed "record N")** and **TRAP-1 (`GUARD-OUTAGE` carries no `tool=`)** were both
respected: the window is record 140 onward (0-based 139), and every log count matched on token +
`session=`. The **`CONSULT`/`CONSULT-OUTAGE` prefix trap** was *not* respected on the first pass
(§4.4) and is disclosed. Three sessions in a row have now each hit one of these; the fix is
mechanical (exact-token, space-anchored regexes), and this report's figures were produced with it.

## 8. Script defects found by assembling this report — NOT fixed, named for waivers

1. **Part 1's duration is a pooled-buffer span** (§2.1) — reads 61.39 days over a 5.54-day window.
   Same class as the Part 3 error the 2026-09-11 ruling corrected. **⚖️ CONFIRMED AS A DEFECT
   2026-09-12 (Q-A), and it needs its own waiver before it can be fixed.** The ruling dictates the
   grounds the waiver request should state: *"the window-clock figure is the operative one per this
   ruling; the script's current output is the same class of pooled-span artifact that Part 3 carried
   before correction."* **Waiver not requested or granted as of this fold — the fix is not made.**
2. **Part 3 pools consult and guard** (the script says so: *"a population-split Part 3 is an OPEN,
   UNRULED item"*). §4.2 above supplies the split from Part 3b's own columns; whether Part 3 itself
   should be split is a ruling question, not a session's call. **Still open and unruled** — the
   2026-09-12 ruling did not reach it.

## 9. What this report does not do

It does not license the flip; it does not compute anything that binds; it does not touch the buffer,
the window, or any production surface beyond the designed, idempotent ingest that the run performed
(492 rows into `agent_hold_observations`, first-ever, on `record_hash` — a note for any DB-side
reader: the table carries **no regime column**; the regime split lives only in the JSONL, so a rate
computed from the table alone would repeat the pooled error). **D2 remains blocked** on the separate
"ordinary" condition. **Weights remain BLOCKED.** **The 0h call remains the founder's.**

## 10. Where this leaves the standard

- **(3) is met** and **(4) is satisfied**, on the current instrument, with their bounds stated —
  the guard-side sub-figure now carrying its own ruled `n=3` qualification.
- **(1) is NOT MET** — 5.54 days on the window's own clock, which the 2026-09-12 ruling confirms is
  the operative reading. It reaches its counting threshold **Sun 13 Sep 19:44 AEST**, and reaching it
  *"does not change what the window contains."*
- **(2) is NOT MET at 1 of 4**, ruled on the trust-state reading, and **structurally blocked by the
  emission path — not by time.**

The honest one-line summary the founder can carry: *the instrument's false-hold behaviour under the
current regime is clean; the record it is meant to inform is one-domain-wide; the seven days arrive
on Sunday evening; and the one path through part (2) is a write that must be honest before it is
useful.*

## 11. The three questions — ANSWERED (ruled 2026-09-12)

Verbatim, canonical:
`operations/trust-layer-2026-07/2026-09-12-mentor-ruling-preflip-report-three-questions-verbatim.md`.
This section is retained as the record of what was asked and what came back; the substance is folded
into §§1–4 and §8 above.

**Q-A — Part (1) on the window's clock. → YES, the window-clock reading is operative.** Same
reasoning as the 2026-09-11 part (3) ruling: *"The pooled span is a disclosure, not an answer."*
Part (1) is NOT MET; threshold Sun 13 Sep 19:44 AEST. §8 item 1 is confirmed as a defect needing its
own waiver, with the grounds dictated. Folded into §1, §2.1, §2.2, §8.

**Q-B — Part (2) is not a waiting problem. → The fork is correctly named; the trust-state reading is
operative; Branch 1 is recommended, conditionally.** The ambiguity is resolved against the
records-proxy reading. Branch 1 (a founder-walked accreditation write) is *"the path the system was
built for"* — **but only if the assessments can be made honestly.** Folded into §1, §3, §3.1, §3.2.
**Which branch to take remains the founder's call; the ruling explicitly declines to pre-empt it.**

**Q-C — The guard-side rate rests on three holds. → It discharges the obligation, and carries a
small-sample qualification.** Wording dictated and now used verbatim: *"MET (0 false-positive holds,
3 correct holds; n=3 — rate stated, not leaned on)."* The availability figure needs none. Folded
into §1, §4.2.

**Both wording divergences are SETTLED** (§4.1, §6): the v4 operative figure is **96**, and §4.1's
precise-breakdown substitution **stands**. Neither remains an open item.

## 12. What is owed after this ruling

1. **The founder's Branch-1 examination** — whether honest signed assessments for `phronesis`,
   `andreia` and `sophrosyne` can be made from what the window actually demonstrates. **Not a session's
   call, and explicitly not to be performed to discharge a gate** (§3.2).
2. **A waiver request for §8 item 1** (Part 1's pooled-span defect), grounds dictated by the ruling.
   Not requested here.
3. **Part (1)'s counting threshold** arrives 2026-09-13T09:44:55Z — a clock fact, carrying the
   composition disclosure with it (§2.2).
4. **Part 3's consult/guard split** (§8 item 2) remains open and unruled.

---

*Assembled from the production run file, the buffer parsed record-by-record, `gate1.log` read with
exact-token matching, and the four governing verbatim rulings (2026-07-12, 2026-09-07, 2026-09-10,
2026-09-11). Verbatim wins over every summary in this document.*
