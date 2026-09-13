# EVIDENCE MEMO — did the R11 sitting start the W2 window's clock?

**Assembled 2026-09-13 (evening, from `date`) by an autonomous session, founder absent.**
**This memo assembles evidence and states no preference between the two readings.** The question is
the founder's to settle, with the mentor if the founder elects a relay
(`2026-09-13-w2-clock-start-RELAY-DRAFT.md`, drafted and NOT sent).

**Every figure below was re-derived first-hand from the false-hold buffer
(`~/.sage-gate1/false-hold-record.jsonl`, read-only), from `~/.sage-gate1/gate1.log`, and from the
prompt and ruling files named. Nothing is quoted from a summary.**

---

## 1. The two ruled texts, verbatim, and a distinction between them that matters

### 1.1 The clock rule as first stated — BINDING RULING

`operations/trust-layer-2026-07/2026-09-13-mentor-ruling-w2-window-work-and-QS2-discipline-verbatim.md`,
question (i), received ~05:30 AEST:

> The clock does not start from W2's first Bash guard record. It starts from the first consult record
> produced by consequential Write/Edit work on a live surface.

and, later in the same answer:

> The ruling: the window's work designation should be updated before the first session opens. The
> founder should identify what W2 activation requires in terms of authored documents, assess whether
> that constitutes sufficient consequential Write/Edit work, and if not, designate the
> standing-runner design session as the window's primary work. The clock starts at the first consult
> record from whichever work is designated. This is the founder's call, with the two constraints —
> consequential subject matter and consult channel — as the governing criteria.

### 1.2 Q-M3 — BINDING RULING

`operations/trust-layer-2026-07/2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`,
received ~11:24 AEST:

> **Q-M3 — Does design authoring in operations/ satisfy the clock rule?**
>
> Yes. Design authoring on a document in operations/ satisfies the clock rule when two conditions
> hold: the document is consequential in the sense that getting it wrong has real downstream
> consequences for the project's architecture or governance, and the authoring is carried out through
> composed, narrated Write/Edit actions on the measured checkout.
>
> The standing-runner design work satisfies both. R8-D7's sampling-policy design, the manifest ATRF
> item-3 amendment draft, and the build brief's second increment are documents whose errors propagate
> into build decisions with real costs. They are Write/Edit work by nature. **The first consult record
> of a design sitting on this work starts the W2 window's clock.**
>
> The ruling's language — "on a live surface" — means consequential, not necessarily production code.
> A design document that governs a production build is live in the relevant sense.

*(Bold added here for locating the operative sentence; the source carries no emphasis on it.)*

### 1.3 The second text the prompt asks to be quoted is NOT a ruling — a distinction to note

The session prompt that commissioned this memo describes *"two ruled texts"* and names, as the
second, *"the same entry's statement that 'the first sitting is the founder's to open under a
Q-S2-conforming prompt.'"* **That sentence is not in the ruling.** It appears in the same file, below
`*End of verbatim ruling.*`, under a heading the executing session wrote for itself:

> ## Recording notes (the executing session's, not the ruling's)
>
> - **The W2 window's clock has NOT started.** Q-M3 makes the standing-runner design work eligible to
>   start it; the first such sitting is the founder's to open under a Q-S2-conforming prompt (name the
>   work, never the observation). **This session did not open it and is the wrong author for that
>   prompt.**

The same claim also appears in a second, likewise non-ruling place — the *"A consequence stated
plainly"* recording note at the foot of the 05:30 ruling file:

> - **A consequence stated plainly:** the W2 window's clock has **not started**, and it does not start
>   at any Bash record. It starts at the first consult record from the work the founder designates.

**Both are recording notes written by executing sessions, and both were written BEFORE R11 ran.** The
first was written by the 05:30 capture session; the second by the ~11:24 capture session — R11's
first consult record is 11:48 AEST. Neither note is a ruling, and neither could have been a statement
about a sitting that had not yet happened.

**The weight that survives that observation, stated here rather than left to §6** — because PR19
review (Reviewer A, MEDIUM) found that discounting these notes in §1, ahead of the readings, primes a
reader against reading B's strongest documents before reading B has been stated. The finding is
upheld and this paragraph is the fold:

- **A recording note written by the session that captured the ruling, immediately after capturing it,
  is the best contemporaneous evidence of what the ruling was understood to mean** by a reader who had
  just read it in full and had no stake in R11.
- **Both notes say the same thing independently**, hours apart, written by different sessions from
  different source rulings. That convergence is evidence about the rulings' plain sense.
- **"Written before R11 ran" cuts both ways.** It means neither note judged R11 — and it equally means
  neither was written to exclude R11. A note stating a general condition ("the first sitting is the
  founder's to open") is not disabled as to a later instance merely by predating it; that is how
  general statements normally work.
- **The project's own discipline elsewhere treats executing sessions' recording notes as load-bearing
  corrections** — the 05:30 ruling file's own recording note corrects a factual error *inside* the
  ruling it accompanies, and that correction is relied on by the eight-question ruling.

**What this memo therefore does:** it distinguishes ruling from recording note (§1.1/§1.2 are
binding; §1.3's notes are not), **and it takes no position on how much the notes weigh.** Whether an
executing session's recording note binds the founder's reading is itself part of the question being
asked.

---

## 2. The R11 sitting's records, re-derived from the buffer

The buffer was grouped by the `session` field. One session's consult records write the three R11
deliverables under `operations/agent-circles-2026-08/`.

**Session `3f433f68…`** (the R11 sitting; the R11 close names itself `sagereasoning-6b [802222]` —
a display id, not the buffer key, so the identification here rests on the written paths in §2.2, not
on matching identifiers):

| fact | value |
|---|---|
| total buffer records | **38** |
| consult records (`path` absent, schema `false-hold-record-v3`) | **32** |
| guard records (`path: "guard"`, schema `false-hold-record-v6`) | **6** |
| first record of any kind | `2026-09-13T01:40:00.332Z` — **a Bash guard record** |
| **first CONSULT record** | **`2026-09-13T01:48:38.960Z`** — tool `Write` |
| last consult record | `2026-09-13T06:00:02.431Z` — tool `Edit` |
| last record of any kind | `2026-09-13T06:00:39.413Z` — Bash guard |
| tools across all 38 | `Edit` 25, `Write` 7, `Bash` 6 |
| `extractionRegime` | `at-action-v2-composed` on all 38 — one regime, no mixing |

**The 8-minute gap between the session's first record (01:40:00Z, Bash/guard) and its first consult
record (01:48:38Z, Write) is exactly the distinction §1.1 draws** — *"does not start from W2's first
Bash guard record… starts from the first consult record."* Under reading A the operative timestamp is
the second, not the first.

### 2.2 What the 32 consult records wrote (target path parsed from `actionPreview`)

| n | path |
|---|---|
| 11 | `operations/agent-circles-2026-08/2026-09-13-R11-R8D7-worst-of-K-policy-DESIGN.md` |
| 11 | `operations/agent-circles-2026-08/2026-09-13-R11-live-loop-verdict-measurement-DESIGN.md` |
| 3 | `operations/decision-log.md` |
| 2 | `operations/agent-circles-2026-08/2026-09-13-R11-manifest-ATRF-item3-amendment-DRAFT-FOR-RULING.md` |
| 2 | `operations/handoffs/founder/2026-09-13-standing-runner-R11-CLOSE.md` |
| 1 | `operations/agent-circles-2026-08/2026-09-13-RELAY-DRAFT-R11-seven-questions-NOT-SENT.md` |
| 1 | `operations/handoffs/founder/2026-09-13-R11-measurement-bounded-rerun-FOUNDER-WALKED-RUN-NEXT-SESSION-PROMPT.md` |
| 1 | a file under the session scratchpad (`/private/tmp/claude-501/…`) |

**Two of the three documents Q-M3 names by name are in this list** — *"R8-D7's sampling-policy
design"* (11 records) and *"the manifest ATRF item-3 amendment draft"* (2 records). The third Q-M3
names, *"the build brief's second increment,"* was not authored in this sitting.

**Stated as fact, not as an argument:** 24 of the 32 consult records wrote the two design documents
Q-M3 names, on the measured checkout, through composed Write/Edit actions. The scratchpad record (1)
is a session-local working file, not a governing document.

---

## 3. Was R11's opening prompt Q-S2-conforming? (grep, quoted)

Q-S2's binding condition, from
`2026-09-12-mentor-ruling-window-specification-QS1-QS2-QS3-verbatim.md`:

> There is one condition on this ruling: the §2 discipline must hold at the session-prompt level, not
> only at the specification level. If a W2 session prompt names the observation goal — if it tells the
> loop that andreia is being watched, or that variety of courage-relevant moments is the criterion —
> the discipline is broken at the point of application, regardless of what the specification says.

**Grep of
`operations/handoffs/founder/2026-09-13-standing-runner-R11-R8D7-policy-and-live-measurement-design-NEXT-SESSION-PROMPT.md`**
for the observation goal's vocabulary — case-insensitive, on
`observation|false.?hold|window|clock|seven.?day|7.?day|W2|measured checkout|capture|buffer|part \(1\)|counting threshold`
— returns **two lines in a 12,712-byte file**, quoted in full:

> line 33: `- **Never write to any file under `~/.sage-gate1/` or to `agent_hold_observations`.**`

> line 109: `(Source: `operations/trust-layer-2026-07/2026-09-13-mentor-ruling-eight-questions-w2-work-s11d2-sequencing-r8d7-under-w-verbatim.md`,`

Line 33 is a **prohibition** on writing to the instrument, not a statement of the observation goal.
Line 109 is a **source citation** whose filename happens to contain the token `w2-work`. **The words
`andreia`, `variety`, `courage`, and any statement that the loop is being watched for a domain or a
moment-type, do not appear.** On Q-S2's own test — *"tells the loop that andreia is being watched, or
that variety of courage-relevant moments is the criterion"* — the prompt does not name the
observation goal.

**A fact that cuts in no single direction, recorded because it is load-bearing either way.** The same
prompt sets the tool mode explicitly, in its own words:

> **House tool-mode setting for this sitting (founder-visible, deliberate):** author every document
> with the **Write and Edit tools**, on the main checkout. Use Bash only to run read-only checks and
> to commit. Do not use Bash heredocs to write documents.

That is the exact instrument condition Q-M3 requires (*"composed, narrated Write/Edit actions on the
measured checkout"*), set deliberately and labelled as such, **without naming the observation.** A
reader may take this as the designation being carried out in the only way Q-S2 permits; a reader may
equally take it as a house consistency setting adopted after the prior session's own tool-mode
disclosure, with no W2 intent. **This memo does not choose.**

---

## 4. Who authored R11's prompt, and who opened R11 — quoted, not inferred

**Authorship, from the prompt's own header (line 6):**

> Authored 2026-09-13 (from `date`) at the founder's direction. **Every number in this file is a claim
> to re-derive, not a fact to quote.**

**The authoring session**, from
`operations/handoffs/founder/2026-09-13-window-mark-F1-assessment-and-R8D7-scoping-CLOSE.md`, its
addendum (~11:24 AEST):

> The founder asked for a relay with recommendations
> (`2026-09-13-F1-and-R8D7-RELAY-DRAFT-with-recommendations.md`, committed), sent it, and relayed the
> mentor's eight-question ruling […] **Nothing built, activated, flipped or pushed. The W2 clock has
> not started — the first sitting is the founder's to open.**

The prompt file's mtime is `Sep 13 11:35`; that session's last buffer record is
`2026-09-13T01:35:47.043Z` = 11:35:47 AEST. **That session wrote 13 buffer records, all Bash guard,
zero consult** — it authored R11's prompt in Bash-heredoc mode, so the authoring itself produced no
consult records.

**Who opened R11 — the record does not say in terms.** The R11 close's header states only:

> **Session:** `sagereasoning-6b [802222]`, 2026-09-13, ~11:39–12:10 AEST (from `date`), on the main
> checkout, opened under
> `2026-09-13-standing-runner-R11-R8D7-policy-and-live-measurement-design-NEXT-SESSION-PROMPT.md`

**No record found by this session states that the founder opened R11, and none states that he did
not.** Structurally, a `NEXT-SESSION-PROMPT` whose own first line reads *"Paste this as the FIRST
message of a FRESH session"* can only be pasted by the founder — **that is an inference, and it is
recorded here as one, not as a quotation.** What is quoted and certain: the founder was present and
active on either side of R11 (he directed the relay at ~11:24 and directed the run prompt at
~12:30–13:10, per the R11 close's addendum), so R11 was not an unattended autonomous sitting.

### 4.1 What the R11 sitting itself said about the question

From the R11 close, **§6, immediately under the verification table**:

> A note for the window record, stated as fact not as a claim: this sitting authored consequential
> design documents in `operations/` through composed Write/Edit actions on the measured checkout with
> the guard armed and the consult path active — the Q-M3 shape. Whether its records are the W2
> window's first is the founder's and the mentor's to determine; the sitting's prompt named the work,
> not the observation.

*(Bold added here for locating the operative sentence; the source carries no emphasis on it — the
same liberty §1.2 discloses.)*

**The R11 decision-log entry
(`D-STANDING-RUNNER-R11-R8D7-AMENDED-POLICY-AND-LIVE-MEASUREMENT-DESIGNED-2026-09-13`) contains no
mention of the clock, the window, or W2 at all** — grepped for `clock|W2|window|first consult|Q-M3`,
zero matches. The sitting neither claimed the clock nor disclaimed it in the log; it raised the
question only in its close and routed it.

---

## 5. Was the designation made? — the one contested premise beneath both readings

§1.1 ends: *"The clock starts at the first consult record from whichever work is designated. This is
the founder's call."* So both readings turn on whether a **designation** exists.

**Q-M1, BINDING:**

> Candidate (b) is withdrawn as a source of window work. The ruled ordering is amended to: (c)
> standing-runner design track as primary, (a) staged-clause application as secondary, (b) removed.

**The drafted standing opener's F-1 row reads that as the designation having been made** (the opener
is DRAFTED, not founder-adopted — this is a drafting session's reading, not a ruling):

> **The designation is made by the ruling; what remains yours is opening the first sitting under a
> Q-S2-conforming prompt.**

**R11 is the standing-runner design track.** Its own title is *"Standing-runner design sitting R11"*;
its deliverables are R8-D7's policy design and the standing-runner's live-loop measurement design;
the priority index's standing-runner rows are in its read set. **That it belongs to candidate (c) is
not in dispute anywhere in the record this session read.**

### 5.1 But that settles the easy half only — and the hard half is genuinely open

**An earlier draft of this section stopped at the line above, and PR19 review (Reviewer A,
MEDIUM/HIGH) found that this reads as resolving the premise in reading A's favour while appearing
merely to examine it.** The finding is upheld. Two distinct questions sit under "was the designation
made?", and only the first is settled:

| sub-question | status |
|---|---|
| **(i) Does R11 belong to candidate (c)?** | **Settled — yes.** Nothing in the record disputes it. |
| **(ii) Does Q-M1's *ordering of candidates* constitute the *designation* that §1.1 makes "the founder's call"?** | **GENUINELY OPEN. The memo does not answer it.** |

**The case that (ii) is already satisfied:** Q-M1 does not merely rank — it *withdraws* one candidate
and *amends the ruled ordering*, naming (c) primary. A designation whose content is fixed by ruling
leaves the founder nothing to designate. The drafted opener's F-1 row reads it exactly this way.

**The case that (ii) is not satisfied:** §1.1's sentence is *"This is the founder's call, with the two
constraints… as the governing criteria"* — it assigns an act to the founder, and an act assigned is
not an act performed. On this reading Q-M1 narrowed the menu the founder chooses from; it did not
choose. The opener's F-1 row is a **drafted, unadopted** document's reading, not a ruling, and the
same opener elsewhere still states the clock has not started.

**This memo takes no position on (ii).** It is the crux of the question being relayed, and it is the
founder's.

---

## 6. The two readings, and what each implies

**Neither is preferred here. Both are stated at their strongest.**

### Reading A — the clock started at R11's first consult record

*The case, as the texts support it:* Q-M3 says *"The first consult record of a design sitting on this
work starts the W2 window's clock"* — a description of what starts the clock, not a permission to be
exercised. Q-M1 designated (c) as primary. R11 is (c). R11's prompt named the work and not the
observation, satisfying Q-S2's condition. R11 ran composed Write/Edit on the measured checkout with
the guard armed and the consult path active. On this reading the clock is a fact about the record, not
about anyone's intent, and it started when the conditions Q-M3 states were first met.

| quantity | value under reading A |
|---|---|
| **W2 clock start** | **`2026-09-13T01:48:38.960Z`** (= Sunday 13 Sep, 11:48 AEST — no calendar-day straddle: `2026-09-13T01:48Z + 10h = 2026-09-13T11:48` local, same date) |
| **Part (1) seven-day mark for W2** | **`2026-09-20T01:48:38Z`** = Sunday 20 Sep, 11:48 AEST |
| W2 consult records already banked | **32** from R11, plus any later sitting's |
| **S11-D2 baseline (Q-M4: five ordinary consult days from W2's first record)** | day 1 = 2026-09-13 (UTC), which already carries consult records. **Four further ordinary consult days needed**, earliest conceivable completion **2026-09-17 (UTC)** if every one of 09-14…09-17 produces ≥1 consult record and each is "ordinary" |

### Reading B — the clock has not started; the first sitting is still to be opened

*The case, as the texts support it:* §1.1 makes the clock start *"at the first consult record from the
work the founder designates"* and calls it *"the founder's call."* Both capture sessions recorded, in
terms, that the clock had not started and that **the first sitting is the founder's to open**. R11's
prompt was authored to design R8-D7 and the measurement — it was not authored or opened *as* the W2
window's first sitting, names nothing of the kind, and its own close routes the question rather than
claiming it. On this reading a W2 sitting is constituted by being opened as one, and no such sitting
has yet opened.

| quantity | value under reading B |
|---|---|
| **W2 clock start** | **not started** — starts at the first consult record of a sitting the founder opens as W2's first |
| **Part (1) seven-day mark for W2** | seven days from that record; **undetermined** |
| W2 consult records banked | **0** (R11's 32 are pre-window, in the same sense the 138 `at-action-v1-lean` records are pre-window for the current window) |
| **S11-D2 baseline** | restarts at zero from that same first record (Q-M4); **five ordinary consult days**, earliest completion five days after the sitting opens |

### 6.1 What "ordinary" excludes — the 2026-09-10 ruling, verbatim

Relevant to the D2 baseline under **both** readings:

> A day on which the measuring apparatus was functionally modified is not an ordinary day in the sense
> the baseline requires.

and, from the 2026-09-06 D2 mid-window ruling — quoted in the source's own order (an earlier draft of
this memo inverted it, caught at PR19 review):

> If the consult population is accruing at zero on some days, the threshold is five days with
> meaningful consult records — days producing at least one consult record count; days producing zero
> do not.
>
> The baseline threshold is five ordinary days with consult records.

**Q-M4 leaves the "ordinary" half expressly to the founder:** *"The "ordinary" half remains the
founder's judgement, as the session's recommendation correctly states. The count half restarts at
zero."* **The count half's restart is ruled; which days are ordinary is not.**

---

## 7. What this session's own records add under each reading

**Tool-mode disclosure for this session, stated so a later assessment can attribute it.** This memo,
the relay draft, the Part (1) mark record draft, the opener addendum, this session's close and its
decision-log entry were authored with the **Write and Edit tools on the measured checkout**; Bash was
used for read-only checks, the report run and the commit. The choice was made on the work's merits —
the documents quote ruling text densely (backticks, nested quotes) where heredoc authoring is a
corruption hazard, and PR19 folds require surgical edits rather than whole-file rewrites — **and not
on its effect on any record count, in either direction.** The exact per-path record contribution is
enumerated in this session's close.

**At the time this section was written, this session had contributed ZERO buffer records**: its
26 Bash calls logged `AT-ACTION-SKIP-BASH reason=bash-dropped-from-score` in `gate1.log` (Bash is
dropped from the consult trigger, and none of the commands hit the guard's irreversible set), plus one
`FRAMED` at session open.

**And the first Write — this file — did not produce one either.** Its at-action consult was attempted
and **timed out at 55,000 ms**, logging `CONSULT-OUTAGE` and no buffer record:

> `2026-09-13T09:34:56.163Z TRUST-READ session=e1713b19… aggregate=reflexive rec=do-not-proceed/escalate mode=measure`
> `2026-09-13T09:34:56.164Z DEPTH-CALIBRATED session=e1713b19… floor=deep (aggregate=reflexive) — deep REQUIRED (reflexive); an incomplete deep consult fails open-honest, never a silent downgrade`
> `2026-09-13T09:35:51.171Z CONSULT-OUTAGE session=e1713b19… reason="timeout after 55000ms"`

**A hypothesis formed from this and then REFUTED, recorded because it was nearly carried forward as a
finding.** The obvious reading — that the G5 depth calibration raising the floor to `deep` makes the
consult slow enough to time out, so the deepest examinations are systematically the ones missing from
the buffer — **is not supported.** At the point this section was first drafted, six `DEPTH-CALIBRATED`
deep-required lines existed in the whole window period; the next consult-class token in the same
session was `CONSULT` on **five** of them (R11 ×4, the pre-flight session ×1) and `CONSULT-OUTAGE` on
only the sixth, which is this session's. **Re-derived at PR19 review: the count had grown to 8 by
then** — this session logged two further `DEPTH-CALIBRATED floor=deep` lines later in its own
authoring (`09:37:58Z`, `09:38:43Z`), both followed by a successful `CONSULT`. That growth is the
buffer accruing live while this memo was being written, not a correction to the ratio: **7 of 8
deep-required consults completed; only the one already named timed out. n=1 remains an instance, not
a pattern.** The outage rate's real distribution is in §8.1 below.

- **Under reading A:** these records fall **inside** the W2 window and count toward its composition,
  its part-(1) span and the D2 baseline's day-count.
- **Under reading B:** they fall **outside** any W2 window, exactly as R11's 32 do, and count toward
  nothing but the current (closing) window.

**The same act therefore has two different meanings depending on an unsettled question — which is the
reason this memo exists and the reason the founder should settle it before more sittings run.** Stated
as a consequence, not as a recommendation.

---

## 8. The current window, for contrast (not part of this question)

Re-derived at this writing: buffer **742** records; the current window (line 140 onward, the probe at
line 139 excluded per its ruling) is **603** records = **430 guard / 173 consult**, all
`at-action-v2-composed`, spanning `2026-09-06T09:48:32.456Z` → `2026-09-13T09:21:47.673Z`.
**R11's 38 records are inside that count** under either reading — the current window and the W2 window
are different windows over one append-only buffer, and a record can belong to the first and, on
reading A, also to the second. **No ruling this session read resolves whether the two windows may
overlap on the same records.** Recorded as an open structural point, not answered.

### 8.1 Consult availability across the window — the F-3′ standing obligation's count

The F-3′ ruling's standing obligation is to *"count consult availability from day one."* Counted here
from `gate1.log` over the window period, by exact token:

| UTC day | `CONSULT` | `CONSULT-OUTAGE` | outage share |
|---|---|---|---|
| 2026-09-06 (part-day) | 3 | 1 | 25.0% |
| 2026-09-07 | 17 | 2 | 10.5% |
| 2026-09-08 | 6 | 3 | 33.3% |
| 2026-09-09 | 18 | 7 | 28.0% |
| 2026-09-10 | 34 | 7 | 17.1% |
| 2026-09-11 | 19 | 4 | 17.4% |
| **2026-09-12** | **40** | **60** | **60.0%** |
| 2026-09-13 (to §8's own window boundary, 09:21:47.673Z) | 35 | 0 | 0.0% |
| **window period total (through §8's own boundary)** | **172** | **84** | **32.8%** |

**A correction folded after PR19 review (Reviewer A, MEDIUM):** the table above originally extended
~14 minutes past §8's own declared window-closing timestamp (`09:21:47.673Z`), pulling in two
`CONSULT-OUTAGE` events that fall outside the window as this memo itself defines it (a 173/86/33.2%
reading, drawn from a cutoff of `09:36Z`). Re-run at §8's own boundary the figures are **172 / 84 /
32.8%** — materially the same conclusion, corrected here rather than left inconsistent with §8.

**Stated as fact, not interpreted here.** 2026-09-12 is the day CLAUDE.md records the Anthropic
spend-limit block (~06:07Z–08:27Z), and it is an extreme outlier in both directions — the window's
highest record count (148) and its highest outage share (60%). **Whether 2026-09-12 is an "ordinary"
day in the sense the D2 baseline requires is the founder's judgement (Q-M4), not this memo's.** The
figure matters to that judgement under both readings of the W2 clock, and under reading A it also
falls inside the W2 window.

**One in three attempted consults across the window produced no buffer record.** The 86 are not in the
measured population; they are not false holds, correct holds, or anything else. The composition
disclosure on any figure drawn from this window should carry that denominator.

---

## 9. What this memo does not do

- It states **no preference** between readings A and B. **This was independently tested.** A blind
  PR19 reviewer, given the memo and the raw data but not this session's reasoning, was briefed that
  *"any sentence that reads as a preference between the two readings is a finding"* and returned
  **three neutrality findings, all upheld and all folded**: §5 resolved the contested premise in
  reading A's favour while appearing only to examine it (now §5.1 — both cases stated, no position
  taken); §1.3 discounted reading B's strongest documents ahead of the readings (now carries the
  weight that survives, in reading B's favour); and the two together left the memo's argumentative
  infrastructure asymmetric even though §6's head-to-head was balanced. **The reviewer also found six
  arithmetic/quotation defects, all upheld and folded** — a wrong weekday label, a consult-availability
  table that extended ~14 minutes past the memo's own declared window boundary (173/86/33.2% →
  172/84/32.8%), a count that had grown from 6 to 8 while the memo was being written, an undisclosed
  bold, an inverted quotation order, and a quote-mark drift. **The memo is more balanced than its
  first draft, and the corrections ran against the drafting session's own reasoning.**
- It does **not** start, stop, or date the W2 clock; **no record anywhere was altered.**
- It does **not** treat the executing sessions' recording notes (§1.3) as binding, and does not treat
  them as void either — it distinguishes them and leaves the weight to the founder.
- It did **not** open the scratch project `…/PROJECTS/idea-loop-rerun-2026-09/`, read `option-s/`, or
  touch any `GUARD_RE` file, `~/.sage-gate1/` write path, or R18 surface.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
