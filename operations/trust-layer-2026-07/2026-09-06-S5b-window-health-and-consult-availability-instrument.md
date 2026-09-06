# S5b — window health check + the consult-availability instrument, named

**Session:** S5b (`governance` + read-only verification). **Model:** `claude-opus-5`.
**Written 2026-09-06, dated from `date`/`git log`, never the context date.**
**Nothing was built, flagged, migrated or pushed. The window ran untouched throughout.**

Covers session-paste deliverables **(a)** window health and **(c)** the consult-availability
instrument, named and not built.

---

## 0. The correction that reframes deliverable (a)

**The session paste says "The window has been running for roughly a day." It had been running
~13 minutes when this session opened, and ~20 minutes at the time of the measurements below.**

Established at source, not inferred:

| Fact | Value | How established |
|---|---|---|
| Window start | `2026-09-06T09:44:55.267Z` | record 139 `capturedAt`; S4 close |
| S4 close commit (which contains the paste) | `2026-09-06 19:55:25 +1000` = `09:55:25Z` | `git log --date=iso-local` |
| Session open | `2026-09-06T09:57:29Z` | `date -u` |
| Measurement snapshot | `2026-09-06T10:05:14Z` | `date -u` |
| **Window age at snapshot** | **20.3 minutes** | computed |

The paste was written **two minutes before this session opened**. "Roughly a day" is a context-date
artifact of exactly the class this project has recorded three times in one week
(`date-artifacts-from-machine-clock`). **Every duration-dependent expectation in the paste's §2(a)
should be read against 20 minutes, not a day.**

This does not invalidate the paste. Its §6 forecast explicitly admits "an honest 'almost nothing
yet'" as a success condition. That is the outcome.

---

## 1. Is the window actually capturing? — YES, mechanism proven

| Check | Result |
|---|---|
| `GATE1_FALSE_HOLD_CAPTURE` in `.claude/settings.local.json` | present, `"true"` (1 occurrence) |
| Present in the hook's actual runtime env | **yes** — confirmed by reading it from a live shell |
| `GATE1_STATE_DIR` | `/Users/clintonaitkenhead/.sage-gate1` — **unchanged**, durable, not `/tmp` |
| Buffer path | `~/.sage-gate1/false-hold-record.jsonl` |
| Buffer size at snapshot | **142 lines** (was 139 at S4 close) |
| Schema split | **138 `false-hold-record-v1` + 4 `false-hold-record-v4`** |
| Records accrued since S4's probe | **3 organic** (records 140, 141, 142) |

**The capture mechanism works.** Three records accrued organically in 20 minutes without
intervention. Nothing was refreshed, truncated or regenerated; the buffer is append-only and the
138 `v1` records are untouched.

**Record 139 remains excluded** as S4's deliberate took-effect probe. **The 138 `v1` records remain
excluded** as a different extraction regime. Both exclusions are honoured in every figure below.

---

## 2. The per-path break-out the paste asked for

**All three organic records, without exception:**

| Field | Value (all 3) |
|---|---|
| `path` | **`guard`** |
| `tool` | **`Bash`** |
| `loopEvent` | `none` |
| `depth` | `""` (empty) |
| `captureBasis` | `assessment` (all real classifiable verdicts — no outage records) |
| `extractionRegime` | `at-action-v2-composed` (correct post-S11b regime) |
| `signals.proximity` | `deliberate` |
| `guardHold` | `false` |
| `guardOutcome` | `proceed_with_caution` ×2, `pause_for_review` ×1 |

**Consult-path records in the window: ZERO.**

Corroborated independently in `gate1.log`, counting entries with timestamp
`>= 2026-09-06T09:44:55Z` **as at the `10:05:14Z` snapshot** (the log is append-only and grows,
so these counts are only reproducible against that cutoff — a later re-run will legitimately
differ, and PR19's independent re-count at a slightly different instant gave 40/4 rather than
42/3, which is the expected artifact and not a discrepancy):

```
42  AT-ACTION-SKIP-BASH
 3  GUARD-CAUTION
 2  ELICIT
 1  FRAMED
 0  CONSULT
 0  CONSULT-OUTAGE
```

Zero consults **attempted** — not zero succeeded. The consult path had not fired at all.

### 2.1 ⚠ SUPERSEDED LATER THE SAME SESSION — the consult population populated, and how it happened
**is itself the evidence for §3.1**

**The "ZERO" above was true at `10:05Z` and is FALSE as of `11:22Z`.** It is preserved rather than
rewritten, because *how* it changed is the finding.

During the PR19 fold I stopped writing files with Bash heredocs and used the **`Edit` tool** instead.
**Consult records appeared immediately.** Re-derived at `2026-09-06T11:22:53Z` (window age 98 min),
buffer **152 lines = 138 `v1` + 14 `v4`-era records**, 13 organic:

| Population | n | schema | tool | depth | proximity | D2-defect |
|---|---|---|---|---|---|---|
| **guard** | **10** | `v4` | `Bash` ×10 | `""` ×10 | `deliberate` | **6** |
| **consult** | **3** | `v3` | `Edit` ×3 | `standard` ×3 | `principled` ×2, `deliberate` ×1 | **0** |

The consult records carry `loopEvent` `opened` ×1 / `reopened` ×2 and `carriedPrior: true` on two —
**genuine same-depth loop-closure behaviour**, not bare captures.

**Three consequences, and the third is the one that matters most:**

1. **§3.1's mechanism claim is now confirmed empirically, not only from source.** I predicted from
   reading `at-action-hook.mjs` that consults fire on `Edit`/`Write` and never on `Bash`. Switching
   tool produced exactly that, unprompted. **This was an accident of the fold, not a designed
   experiment** — but it is a clean natural experiment and it corroborates the source reading.
2. **The window-close representativeness condition is now MET on its face.** S4's close and scoping
   note §2.6/§5 require "more than one tool class/depth." The window now holds **two tool classes
   (`Bash`, `Edit`) and two depth tiers (`""`, `standard`).** §3.3's risk 2 is accordingly
   **downgraded** — see the note there. It is met on the letter; whether 3 consult records constitute
   a *representative* consult population under part (1) is a different and unanswered question.
3. **The D2 defect is concentrated ENTIRELY in the guard population — 6 of 10 guard, 0 of 3
   consult.** The mechanism is legible: guard-path `Bash` actions extract **zero circles**, so the
   over-broad `is_kathekon !== null` trigger tags `dikaiosyne` with no other-party evidence; the
   `Edit` consults all extracted `cosmopolis`, a genuine beyond-self circle, so term (a) holds and the
   tag is correct. **This is carried to the scope document, because part (3) is a within-CONSULT
   measure and the defect currently sits outside that population.** n=3 — far too small to conclude
   anything, and it is **not** offered as a conclusion.

---

## 3. Why — established at source, and why it is NOT yet a finding

### 3.1 The mechanism (verified in `at-action-hook.mjs`)

The hook checks the guard **first** and **returns**; a guard action never reaches consult. Non-guard
`Bash` is then **dropped from the consult floor by default** — `GATE1_CONSULT_BASH` is **unset**
(confirmed in both the runtime env and `.claude/settings.local.json`, 0 occurrences). Only
`Write`/`Edit`/`MultiEdit`/`NotebookEdit` reach `runConsult`.

So the consult population is fed **exclusively** by the Edit/Write tool family, and this session's
own working mode is Bash-first — which is why its own 42 tool actions produced 42 skips.

### 3.2 The calibration that stops this being a finding — and it is the important part

The obvious inference is "the consult population is structurally starved." **That inference is not
supported, and the check that refutes it is the v1 window's own log.**

| | v1 window (2026-07-12→17) | current window (20 min) |
|---|---|---|
| `AT-ACTION-SKIP-BASH` | **1,961** | 42 |
| `CONSULT` | **152** | 0 |
| skip : consult ratio | **12.9 : 1** | — |
| records written | 138 (72 `Edit` + 66 `Write`) | 3 |

**Bash dominance is chronic and pre-existing, not new.** The v1 window ran at a 12.9:1 skip-to-consult
ratio and still produced 138 records. Re-deriving the rate **from the log, end to end** — 152
`CONSULT` entries spanning `2026-07-12T13:15:47Z` → `2026-07-17T23:04:20Z` = 129.81 h = **5.409
days** — gives **28.10 consults/day = 1.171/hour.**

Over 20.3 minutes (0.338 h) that rate predicts **λ ≈ 0.396 consults**. Under a Poisson assumption,
**P(observing zero) = e^−0.396 ≈ 0.673** — zero is the *single most likely* outcome. The observation
is **entirely consistent with a healthy consult population** and carries no information either way.

> **⚠ PR19-caught, and the root cause is worth carrying.** An earlier draft gave ~30/day, ~1.26/hour,
> λ≈0.43, P(0)≈0.65 — every figure inflated ~8–13% in the same direction. The cause was **pairing a
> record-derived span with a log-derived count**: 5.03 days taken from the *buffer records* (whose
> last entry is `13:58:29Z`) against 152 `CONSULT` entries from the *log* (whose last is `23:04:20Z`).
> Mismatched numerator and denominator from two different populations — **the same defect class PR19
> caught in S4 one session earlier** (a partial-day figure paired with a full-day denominator). The
> qualitative conclusion is unchanged under either set, but the numbers above are the re-derived ones
> and are the ones to carry.

**Reporting "the consult population is empty" from this sample would be a false finding.** It is
recorded here as a null result.

### 3.3 What IS worth naming — as risk, not conclusion

Two dated observations that a longer window must test, neither established:

1. **Recent per-day consult volume is highly variable: 0 to 99.** From `gate1.log`, successful
   consults per day: `08-31: 0 · 09-01: 1 · 09-02: 29 · 09-03: 27 · 09-04: 4 · 09-05: 99 · 09-06: 1`.
   Several recent days sit at 0–4. If the window lands on a run of such days, part (3)'s measured
   population accrues very slowly. **This is a duration risk, not a defect.**

2. **The window-close representativeness condition may only be satisfiable from the consult side.**
   **⚠ DOWNGRADED at 11:22Z — see §2.1: the condition is now met on its face (two tool classes, two
   depth tiers). The reasoning below stands as the explanation of WHY it needed the consult side.**
   S4's close and scoping note §2.6/§5 require "more than one tool class/depth" before the window
   closes. The window's records are currently **one tool class (`Bash`) and one depth (empty)**. The
   part-(3) ruling states the guard population's narrowness is **structural, not a sampling
   artefact** — *"A longer window would not broaden it, because the narrowness is not a function of
   time."* **It therefore follows that representativeness must come from the consult population.**
   That makes consult accrual the binding constraint on window close, which is consistent with the
   part-(3) ruling's own conclusion that "the window's duration is set by the consult population."

---

## 4. Has the byte-identity guard tripped? — NO, and it is armed and non-vacuous

`npx tsx src/app/logos/__tests__/human-practitioner-boundary.test.ts` → **249 passed, 0 failed.**

Three checks beyond the pass count, because a passing count alone proves nothing
(`guard-needs-a-non-vacuity-floor`):

1. **It is genuinely ARMED, not dormant.** The binding is
   `process.env.GATE1_FALSE_HOLD_CAPTURE === 'true'` — read from the *test process's* environment. I
   confirmed the variable is present in the runtime shell, and re-ran with it set explicitly:
   **249/0** either way.
2. **It is NON-VACUOUS — mutation-verified live.** I appended one comment line to
   `website/src/lib/guardrail-sandwich.ts` and re-ran: **248 passed, 1 failed**, with the exact
   message `NO file in the measured set may be modified while the observation window runs. Offending:
   M website/src/lib/guardrail-sandwich.ts`. The file was then restored via `git checkout --` and the
   tree re-verified clean.
3. **`git status --short` was empty at open, throughout, and at close.** No measured-set file has sat
   modified at any point in this session.

**Two structural facts about the guard, established at source for deliverable (b):**

- **(i) It reads `git status --short`, so it detects UNCOMMITTED modifications only.** A
  committed-and-deployed change to a measured file would alter the instrument mid-window **without
  the guard detecting it.** The test's own header discloses this: *"The git guard sees UNCOMMITTED
  edits only (status vs HEAD)."* **This is a gap in the guard's coverage, not a licence.**
- **(ii) §C2/§C2b are UNCONDITIONAL** — outside the `if (observationWindowRunning)` branch. §C2b
  pins `stoic-brain.ts` by **SHA-256** (`fa8895ec…`), which closes the committed-edit gap **for that
  one file only**. `layer2-mechanisms.ts` — D2's target — **has no such pin.**

---

## 5. A live D2 defect instance, captured INSIDE the window

Not sought; found while breaking out the records. **Organic record [3]** (`2026-09-06T09:58:36.925Z`):

```
circles   = []                                        <- ZERO circles
domains   = ['phronesis', 'dikaiosyne', 'sophrosyne'] <- dikaiosyne TAGGED
kathekon  = { isKathekon: false, quality: 'contrary' } <- non-null
obligations = []
```

This is simultaneously **both** defects the D2 ruling corrects:

- **The zero-circle case** — ruling Q2: *"Zero circles means no other party is implicated.
  Dikaiosyne is other-directed. With no other party, dikaiosyne does not engage."*
- **The over-broad `is_kathekon !== null` trigger** — `isKathekon: false` is non-null, so the trigger
  fires and tags dikaiosyne on an action with no other-party evidence at all.

Under the corrected predicate — (a) a circle beyond `self_preservation`, **OR** (b) a
`natural_relationship` factor — term (a) is false (no circles) and there is no evidence of (b).
**The corrected tag would not include dikaiosyne on this record.**

### 5.1 ⚠ UPDATED at PR19 fold — the sample grew during review and the picture is materially stronger

The paragraph above was written against a 3-record sample. **PR19 caught two things: the excluded
probe record carries the identical defect signature (undisclosed in the first draft), and the buffer
had grown.** Re-derived at `2026-09-06T11:17:56Z`, window age **~93 minutes**, buffer **13 `v4`
records** (1 probe + 12 organic):

| | count | D2-defect present |
|---|---|---|
| Probe (record 139, excluded from all rates) | 1 | **yes** |
| **Organic** | **12** | **6** |
| All `v4` | 13 | 7 |

**Every one of the 13 records tags `dikaiosyne`** — 100%. The 6 organic defect records all show
`circles = []` with a non-null `kathekon`, i.e. the over-broad trigger firing with **zero**
other-party evidence.

**What this does and does not license.** It is still **not a rate** and is **not** offered as one:
n=12, a single session, a single working style, ~93 minutes, and every record is guard-path/`Bash`
(§2). A different session shape would very likely give a different mix. **But "1 of 3, an
illustration" understated it, and the corrected figure is 6 of 12.** The qualitative conclusion
strengthens accordingly: on this session's traffic the uncorrected tag is wrong **about half the
time**, which is not a rare edge case.

**Consequence, carried to the scope document:** the window is *already* recording data under the
**uncorrected** tagging regime, and the correction *will* change a substantial share of what such
records say. This converts the D2 ruling's *"the window's records span two tagging regimes"* from a
theoretical consequence into a **dated, observed, and non-marginal** one.

---

## 6. Deliverable (c) — the consult-availability instrument, NAMED not built

**Nothing was built. This section specifies what is owed.**

### 6.1 The obligation

The F-3′ ruling (2026-09-06, binding): consult availability is *"counted from day one"*; the
consult-side bound threshold is *"set after five ordinary post-remedy days of window data"*; and
**publication waits on that assessment** — the window's start did not.

### 6.2 The gap, re-confirmed at source

**The report script (`website/scripts/false-hold-observation-report.ts`) does not and cannot measure
this.** It reads the buffer, and **a consult outage writes no buffer record** — the loss is invisible
by construction. S4 recorded this; it still holds.

**The data IS accruing and nothing is being lost.** `gate1.log` is append-only in the durable
`GATE1_STATE_DIR` and already carries both event classes with timestamps and reasons. Confirmed:
38,071 lines, spanning the whole history.

**Also confirmed clean (a check that could have been a finding and was not):** the scoping note §2.1
says the report classifies "STRICT on v3", while every new-window record is **v4**. The *script* is
correct — it accepts `v1|v2|v3|v4` and counts v3+v4 as new-regime coverage (lines ~314–352, 733–736).
**The scoping note's text is stale; the code is right.** No action needed beyond not trusting the note.

### 6.3 What the instrument must compute

**Inputs:** `gate1.log` only. Two line classes, both already emitted:

- `CONSULT` — a consult that returned an assessment (⇒ a buffer record was written)
- `CONSULT-OUTAGE` — a consult **attempted** and failed, carrying `reason="..."`

**Denominator:** `attempted = CONSULT + CONSULT-OUTAGE`. **Availability** = `CONSULT / attempted`.
**Loss rate** = its complement.

> **⚠ Frame discipline — the mentor's documents state the LOSS rate, not availability.** The F-3′
> ruling's *"The consult path lost 70.3%"* is `outages/attempted`. Its *"25.6% and 50%"* are likewise
> loss figures. **An instrument reporting availability where the ruling reads loss will invert every
> comparison.** Report both, labelled.

**Required break-outs:**
1. **Per UTC day**, with an "ordinary day" qualifier — F-3′ set `≥20 attempts` for the guard path;
   the consult-side equivalent is **not yet set** and must not be assumed.
2. **By outage reason**, because the reasons are not one failure mode:
   `timeout after 28000ms` · `timeout after 55000ms` · `http 401` · `no assessment in response` ·
   `non-JSON response`.
3. **Segmented by timeout regime.** `28000` is the hard-coded **default** in `framing-core.mjs:101`
   when `GATE1_TIMEOUT_MS` is unset; `55000` is the current configured value. **Records from the two
   are not one population** — the same discipline as the S11b extraction-regime boundary.
4. **Window-only vs all-time**, so window figures are never contaminated by pre-window history.

**Explicitly out of scope:** the instrument counts and bounds. It does **not** set the threshold —
that is the founder's, after five ordinary post-remedy days.

### 6.4 Preliminary figures — offered as calibration ONLY, not as the measurement

Computed this session to check the instrument is feasible from `gate1.log`. **None of these is the
owed measurement**, and the window figure is the only one drawn from window data.

| Population | ok | outage | attempted | availability | **loss** |
|---|---|---|---|---|---|
| All-time (whole log) | 1,375 | 3,261 | 4,636 | 29.7% | **70.3%** |
| Current 55s-timeout regime (≥ `2026-09-04T06:14Z`) | 104 | 35 | 139 | 74.8% | **25.2%** |
| **Window-to-date** | **0** | **0** | **0** | **n/a** | **n/a** |

**The all-time 70.3% loss reproduces the mentor's own figure exactly**, which corroborates that this
methodology matches what was relayed for the ruling.

**But the all-time figure must not be quoted forward as current.** 1,918 of 1,921 timeouts are at
**28,000 ms** — the pre-remedy default — and the last `http 401` entry occurred at
`2026-08-08T12:36:34Z`, consistent with a same-day s9-loop credential rotation. **⚠ PR19-caught: an
earlier draft claimed all 1,123 `http 401` entries "predate 2026-08-08" — false as stated; 71 of them
occur ON 2026-08-08 itself, the last at 12:36:34Z. This document has no verified rotation timestamp
to check the 71 same-day entries against, so the correct claim is the last-occurrence timestamp
above, not a whole-date exclusion.** Under the current regime the loss rate is **25.2%**, not 70.3%.
That is still **~5× above** F-3′'s guard-path threshold of ≤5% aggregate, which is consistent with
the ruling's own judgement that F-3′'s numbers must not simply be transplanted.

**Named for the instrument's build, not diagnosed here:** the 32 `no assessment in response` outages
in the current regime match a recorded failure class — the A11b injection defence rejecting this
project's own substrate schema tokens while `/api/reason` still returns 200
(`D-CONSULT-PATH-DEGRADATION-ROOT-CAUSE-A11B-SCHEMA-FIELD-INJECTION-FAIL-CLOSED-2026-09-05`). If that
holds, a share of consult "outage" is **self-inflicted by working on substrate code** — which would
bias the window's own measurement precisely when substrate sessions run. **Flagged, not established.**

---

## 7. Honest limits of this check

1. **20 minutes of window data. Three records.** Nothing here is a rate, and no figure from §2 should
   be carried forward as one.
2. **The consult-zero observation carries no information** (§3.2). It is a null result.
3. **The 1-of-3 D2-affected count in §5 is an illustration, not a rate.**
4. **The A11b attribution in §6.4 is a hypothesis** matched to a prior record, not re-established.
5. **No `agent_hold_observations` ingest was run** and none is owed yet.
6. **B4's post-remedy guard rate was NOT computed** — the ≥`2026-09-08 UTC` date gate stands, and this
   session did not pre-empt it, exactly as S4 did not.
