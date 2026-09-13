# DRAFT — THE FOUNDER RECORDS — the current false-hold window's Part (1) mark

**STATUS: DRAFT. This is F-4 and F-4 is the founder's.** An autonomous session (founder absent)
assembled it on 2026-09-13 evening from a `--dry-run` report and the raw buffer. **Nothing here is
recorded, adopted, or entered into any register by the session that wrote it.**

**Evidence captured verbatim — TWO captures, both kept deliberately:**
- `operations/trust-layer-2026-07/runs/2026-09-13/observation-report-DRY-RUN-at-part1-mark.txt`
  (capture 1, 09:47:47Z — Part (1) reads **`PENDING`**)
- `…/observation-report-DRY-RUN-at-part1-mark-CAPTURE-2.txt`
  (capture 2, 09:50:58Z — Part (1) reads **`MEETS ≥7 days`**)

**Why both are kept, and a disclosure the assembling session owes.** The two differ only because the
script's span runs to the *newest record*, not the wall clock (§1). Between them, authoring this very
draft produced a consult record past the span threshold and flipped the reading. **The Write was the
commissioned deliverable and its record is an ordinary consequence of doing the work — but the
decision to re-run the report immediately afterward was taken because the session wanted to see the
flip.** That motivation is disclosed rather than hidden, and **keeping capture 1 rather than
overwriting it is the point**: a single `MET` capture with no history would have concealed a reading
that the session had a stake in changing. **No work was invented to move any counter.**

---

## 1. The mark, and a two-anchor distinction the founder should record deliberately

**The window's canonical mark — PASSED.** The window started at the took-effect probe
`2026-09-06T09:44:55.267Z` (buffer line 139 — *"the first `false-hold-record-v4` in its history"*,
the deliberate probe that proved the flag took effect, and which is **excluded from the window's
rate**). Seven days from it:

> **`2026-09-13T09:44:55Z` = Sunday 13 September, 19:44 AEST.**

`date -u` was checked repeatedly across this session and read **`09:44:59Z`** at first confirmation.
**The mark has passed.** Every record in this project that names a date for it — the S4 window-start
close, the pre-flip report, the two 2026-09-12 closes, the drafted opener, the prior two session
prompts — names this same instant.

**But the report script does not measure that clock, and says so in its own output:**

> `window (OPERATIVE, ruled 2026-09-12 — span of window records; the window CLOCK starts at flag-set,`
> `which this script cannot observe): 2026-09-06T09:48:32.456Z → 2026-09-13T09:43:48.241Z`
> `span:   7.00 days   ⇒ PENDING (need 0.00 more days)`

The script's span runs **first window record → last window record**. Its start anchor is the window's
first *real* record (`09:48:32.456Z`, 3m37s after the probe), and its end anchor is whatever the
newest record happens to be — not the wall clock. **So the script reads `PENDING` until a record
lands at or after `2026-09-13T09:48:32.456Z`.** At the capture above the newest record was
`09:43:48.241Z`, 4m44s short.

**Both statements are true and neither should be dropped:**

| anchor | capture 1 (09:47:47Z) | capture 2 (09:50:58Z) |
|---|---|---|
| **the window's clock** (flag-set / took-effect probe + 7d) — what every prior record means by "the mark" | **PASSED** at `2026-09-13T09:44:55Z` | **PASSED** (unchanged — a wall-clock fact) |
| **the script's record-span metric** (first window record → newest window record) | **7.00 days, `PENDING`** (newest record `09:43:48.241Z`) | **7.00 days, `MEETS ≥7 days`** (newest record `09:50:56.038Z`) |

**The flip between the two captures is an artifact of the metric, not a change in the window.** The
clock anchor passed once, at 09:44:55Z, and nothing since has moved it.

**The founder's recording act should name which anchor it records.** The recommendation this draft
makes — and it is only a recommendation — is to record the **clock** anchor as the mark, because that
is what every prior record and every ruling means by it, and to note the script's span reading beside
it as an artifact of the script measuring records rather than time. **The gap between the two anchors
is 3m37s and it changes nothing about what the window contains.**

---

## 2. The board at the mark

**The governing sentence, from the Q-A ruling, quoted because it is the whole point of this record:**

> the seven-day clock reaching its mark does not change what the window contains

| Part | State at the mark | Basis |
|---|---|---|
| **(1)** ≥7 days representative MEASURE | **COUNTING THRESHOLD REACHED** | The clock anchor above. The script's span metric reads `PENDING` by 4½ minutes for the reason in §1 — a measurement artifact, not a shortfall in duration. |
| **(2)** four cardinal domains evaluated, ≥2 above conservative | **NOT MET, and NOT dischargeable from this window** | Ruled (A1, 2026-09-12). The **trust-state** reading is operative (Q-B); *"one observation is not an evaluation."* **A write on this evidence is forbidden** (Q-B condition; Q-W4). See §2.1 — the dry-run prints a different, non-operative reading and it must not be mistaken for this one. |
| **(3)** a measured false-hold rate | **MET, regime-scoped** — `at-action-v2-composed`: **0 false-positive holds, 163 correct holds** | The pooled figure (137 false / 163 correct, 45.7%) is **DISCLOSURE ONLY** — it mixes the retired `at-action-v1-lean` instrument with the current one (ADR-014; ruled 2026-09-11). |
| **(4)** the Q3 G6(a) qualification encoded | **SATISFIED**, with the B2 qualification | `assessKathekonEngagement` is the classifier the report uses and the exact shared function the eventual flip binds on. B2 (2026-09-07): G6(a) binds on the product-or-governing-document class, **not** on the protocol-required class. |

### 2.1 A trap in the report output, named so it is not walked into

The `--dry-run` prints, under Part 2:

> `cardinal domains ENGAGED by the live examinations (records): 4/4 — phronesis, dikaiosyne, andreia, sophrosyne`
> `(trust-state confidence read skipped in --dry-run; run against the DB for the per-domain confidence.)`

**That 4/4 is the RECORDS reading. It is not the operative reading and it does not discharge part
(2).** Q-B made the **trust-state** reading operative, and the trust-state read is exactly what
`--dry-run` skips. **Part (2) remains NOT MET.** A reader taking "4/4" off this line would read the
window as four-for-four; it is three-for-four.

---

## 3. The figures, as captured

From the verbatim captures (`--dry-run`, offline, no DB write, no ingest, nothing written to
`~/.sage-gate1/`). **Figures are given at BOTH captures where they differ — the buffer is live and
append-only, so any figure drawn from it is as-of a timestamp, never a standing fact.**

- **buffer parsed:** 747 (capture 1) → 749 (capture 2) valid records. **Window** (line 140 onward,
  probe excluded): **608 → 610** at the report's own scoping; by this session's independent parse at
  09:36Z: **430 guard / 173 consult**, all `at-action-v2-composed`.
- **at-action examinations:** 697 → 699. **Holds (loop opened/reopened):** 300 → 301 (43.0% → 43.1%) of
  examinations.
- **Regime split (the operative one):**
  - `at-action-v1-lean` (pre-mark, **excluded**): n=138 — 137 false-positive, 0 correct, 1 not-a-hold
    — **identical at both captures, as a closed pre-window population must be**
  - **`at-action-v2-composed`: n=559 → 561 — 0 false-positive, 163 → 164 correct**
- **Correct-hold arms** (capture 2): justice-surface 164, proximity≤habitual 15,
  sub-species-passion 6, violated 4.
- **Legacy bracket:** 1 hold predates circle-identity capture; strict 137/164, legacy-compat 136/165
  at capture 2; **1 record where the unknown identity is decisive — not certified either way.**

**The false-positive count is 0 at both captures and every `at-action-v2-composed` record added
between them was a correct hold** — which is to say part (3)'s operative figure did not become MET by
this session's own activity; it was already MET and stayed MET.
- **Instrument age:** ~7.0 days from the earliest `at-action-v2-composed` record.
- **Baseline days with ≥1 consult record:** 8 (2026-09-06 … 2026-09-13).
- **Loop events by action class (B2 disclosure):** opened/reopened — protocol-required 18 at both
  captures, product-or-governing-document **137 → 138**; closed — 2 and 15, unchanged at both.

---

## 4. The composition disclosure — what this window actually contains

**Part (1)'s requirement is a *representative* distribution, and the seven days do not by themselves
establish one.** The following are properties of this window's composition, each re-derived
first-hand. **They are disclosed, not corrected.**

1. **The work was governance and design authoring via Write/Edit, not product work.** The consult
   population is `Edit` and `Write` actions on `operations/` documents almost throughout (report §5d:
   Edit 127 / Write 49 across the eight days).
2. **Bash actions are dropped from the consult floor entirely.** `AT-ACTION-SKIP-BASH
   reason=bash-dropped-from-score` — **4,344 such lines** between the window's first record and a
   **frozen snapshot boundary** at `2026-09-13T09:21:47.673Z` (`2026-09-06T09:48:32.456Z` →
   `09:21:47.673Z`). **That boundary is NOT the window's last record** — the window is live and had
   grown past it before this draft was finished; it is the last record that predates this session's
   own drafting, frozen deliberately so the figures exclude the drafting session's own contamination.
   A session working in Bash mode
   contributes guard records and, unless it trips the irreversible set, nothing else. **The measured
   population is therefore a function of tool mode as much as of the work.**
3. **Roughly one in three attempted consults produced no record at all.** Across the same span
   `gate1.log` carries **172 `CONSULT` against 84 `CONSULT-OUTAGE` — a 32.8% outage share.**
   Consult-side outages write **no** buffer record (the outage returns before the capture call), so
   they are invisible to the report, which states this in its own output rather than estimating them.

   *(Both figures in 2 and 3 are computed at the window's own declared boundaries. Earlier drafts of
   this section carried `4,383` and `173/86/33.2%` — a mid-session snapshot and a cutoff ~14 minutes
   past the window's last record respectively. The defect class was caught by a blind PR19 reviewer on
   the sibling evidence memo and found here by the same check; the conclusions are unchanged.)*
4. **2026-09-12 is an extreme outlier in both directions** — the window's highest record count (148)
   and its highest outage share (60 outages against 40 consults, 60%). It is the day of the Anthropic
   spend-limit block (~06:07Z–08:27Z). **Whether it is an "ordinary" day is the founder's judgement,
   and the 2026-09-10 ruling is the test:** *"A day on which the measuring apparatus was functionally
   modified is not an ordinary day in the sense the baseline requires."*
5. **`andreia` appears on the consult path only — 4 records; the guard path has never carried one.**
   Sub-species window-wide: `agonia` and `achos` only. This is part (2)'s whole problem, restated
   from this window's own data.

   *(An earlier draft said **6**. That figure came from matching the string `andreia` against each
   record's whole JSON, which also matched two `actionPreview` values containing the word inside a
   **filename**. Matching `signals.virtueDomainsEngaged` — the field that actually carries the
   domain — gives **4**, at buffer lines 152, 542, 544, 545, all consult. Caught by a blind PR19
   reviewer, and it independently corroborates the standing opener's own long-standing figure,
   "andreia 0 / 4". **The defect made part (2) look 50% better evidenced than it is** — which is the
   direction that matters, since part (2) is the one part this window cannot discharge.)*
6. **`caller_class` is largely absent or `unknown`:** at the 603-record snapshot this session parsed
   (cutoff `2026-09-13T09:21:47.673Z`), `unknown` 293, absent 269, `live_agent` 27, `subagent` 14. **At
   the two captures' own wider windows the counts are `unknown` 295 / absent 272 (608 records, capture
   1) and `unknown` 296 / absent 273 (610 records, capture 2); `live_agent` 27 and `subagent` 14 are
   unchanged at all three.** The `live_agent` value did not exist before `2026-09-09T19:27:17.253Z`
   (report §5c) — everything earlier reads unknown **by construction, not by gate failure.**
7. **Exclusions applied to the rate:** 36 `no_assessment` (all guard — non-examinations) and 14
   review-fleet records (`callerClass: 'subagent'`, ruling 3).
8. **Guard records carry `depth: ""`**, so the decision table applies its own `standard` default for
   the entire guard population (report's own bound; it moves no figure on today's table).
9. **The A8 two-then-escalate row can never fire** in these figures — no re-examination counter exists
   anywhere in the harness (report's own bound).

---

## 5. What reaching the mark does, and does not do — the Q-S1 consequence

**Stated plainly, because this is the sentence the record is for:**

> **This closes the current window at three of four, and it starts nothing.**

- **It does not discharge part (2).** Part (2) is not dischargeable from this window's evidence at
  all; it needs a differently-composed window. **A trust-record write on this evidence is forbidden.**
- **It does not carry into the W2 window.** Q-S1, verbatim: *"The current window's seven-day mark,
  when it arrives Sunday, closes the current window's clock. It does not start W2's clock."* And:
  *"A materially different composition is a materially different window."*
- **It does not license the S11 flip.** Three of four is not four of four, and the assent is the
  founder's and the mentor's regardless (PR7).
- **It does not change what the window contains** (Q-A, quoted in §2).
- **It does not stop the capture.** `GATE1_FALSE_HOLD_CAPTURE` remains set; the buffer is append-only
  and **must never be truncated or "refreshed."**

**Q-S1 also stated the arithmetic in advance, and it holds:**

> the current window's part (1) mark arriving Sunday, combined with part (3) already met and part (4)
> satisfied, means the current window will have three of four parts met at Sunday's mark. Part (2)
> remains structurally unmet on the current window's evidence. That is the honest reading of where the
> current window closes.

---

## 6. An open question this record does NOT answer

**Whether the W2 window's clock has already started is unsettled**, and it is a different question
from this one. See `operations/trust-layer-2026-07/2026-09-13-w2-clock-start-EVIDENCE-MEMO.md` and the
relay draft beside it. **Under one reading the R11 sitting's 32 consult records (2026-09-13) are
simultaneously inside this closing window and inside the W2 window; under the other they are inside
this one only.** Nothing in this record depends on the answer, and nothing in it should be read as
settling it.

---

## 7. For the founder — what recording this looks like

1. Read the verbatim capture in `runs/2026-09-13/`.
2. Decide which anchor the record names (§1) — the recommendation is the **clock** anchor, with the
   script's span reading noted beside it.
3. Record the mark and the three-of-four board, with the §4 composition disclosure attached to it (it
   is the part that keeps "seven days" from being read as "representative").
4. Note the §2.1 trap so the `--dry-run`'s "4/4" is never quoted as part (2).
5. **Do not** treat this as a W2 event; **do not** write to the trust record; **do not** read it as
   moving the flip.

**D2 remains blocked. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
