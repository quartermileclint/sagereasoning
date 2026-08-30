# Next-session prompt — R8-D6a: the first live sweep

**Paste this as the task after the standing session opener.** Authored 2026-08-30 at the close of
the D6a build session, after the founder approved every election and walked the credential mint.
**Authoring this prompt licensed nothing; the run happens only under this prompt's own session and
the founder's election inside it.**

## Tier

**`code-standard`** for everything the AI does (running a repo script, extracting results, writing
records). **The live sweep itself is founder-elected** — it spends real money against a live safety
gate. Nothing here is pre-approved by the fact that the credential exists.

**AC7 is NOT engaged.** No mint, no schema, no flag, no migration, no public surface. The
credential already exists and this session only *uses* it.

## What is already done — do not redo any of it

- **The probe set is frozen** at `operations/agent-circles-2026-08/d6a/d6a-probes.json`: 7 probes,
  5 borderline + 1 clean anchor + 1 floor anchor, byte-guarded, all `series_started: null` (the
  freeze has not yet engaged — it engages on this session's first run).
- **The runner is built and PR19-reviewed** at `operations/agent-circles-2026-08/d6a/d6a-runner.py`
  (three independent reviewers, 4 HIGH folded, wholesale rewrite).
- **Every election is made and recorded** in that file's `_meta.elections_2026_08_30`: repo
  evidence files; the rate rides the authored disclosure as a dated path-qualified literal; K=10,
  on-demand, all 7 probes; `runs/` committed; class labels frozen against post-hoc repartition.
- **The credential is minted and verified:** `4d96307f-2c19-4c82-a1fe-bd901c3bee4d`,
  `sr_prac_62c629`, `agent_id sagereasoning:d6a-probe@v1`, `capabilities ["consult"]`,
  `owner_kind external_consumer`, monthly 600 / daily 200, active, **never used**.

**Read at open:** the two decision-log entries
(`D-R8-D6A-VERDICT-REPEATABILITY-INSTRUMENT-BUILT-PR19-FOLDED-2026-08-30` and
`D-R8-D6A-ELECTIONS-APPROVED-AND-PROBE-CREDENTIAL-MINTED-2026-08-30`), the close
(`2026-08-30-R8-D6a-instrument-built-CLOSE.md`), and both binding mentor verbatims
(`2026-08-30-mentor-ruling-verdict-variance-disclosure-verbatim.md`,
`2026-08-30-mentor-ruling-verdict-variance-rate-location-verbatim.md`). **The verbatims win over
every summary, including this prompt.**

## Pre-conditions — check all four before spending anything

1. **The credential file exists**: `ls -l ~/.sage-d6a-probe-credential` → `-rw-------`. If absent,
   the founder must re-create it; the raw key is not recoverable from the DB and a fresh mint is a
   Critical founder-walked step.
2. **Nothing has begun**: every probe still shows `series_started: null`. If any is non-null a
   sweep has already started — read `runs/` before adding to it.
3. **The credential is unused and active** — founder-run, production SQL:
   ```sql
   select key_prefix, is_active, monthly_limit, daily_limit,
          total_calls, monthly_calls_used, daily_calls_used
   from public.api_keys
   where id = '4d96307f-2c19-4c82-a1fe-bd901c3bee4d';
   ```
   Expected before the sweep: `is_active true`, 600/200, and call counters at zero (or whatever a
   prior sweep legitimately left).
4. **Budget confirmed with the founder**: ≈70 calls, **≈$1.00**, **140 quota units** (every metered
   call increments usage twice). Against 600 monthly this is one of roughly four sweeps.

## The sweep

Seven invocations, one per probe, **sequential — never concurrent**. The pre-auth IP limiter is 30
requests / 60 seconds keyed on IP, so a concurrent sweep trips it immediately; the runner's 6s
inter-call spacing is a requirement, not a nicety.

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning/operations/agent-circles-2026-08/d6a"
python3 d6a-runner.py run p1-c11 10
python3 d6a-runner.py run p2-deploy 10
python3 d6a-runner.py run p3-email 10
python3 d6a-runner.py run p4-delete 10
python3 d6a-runner.py run p5-force 10
python3 d6a-runner.py run p6-clean 10
python3 d6a-runner.py run p7-floor 10
```

Each takes about 4 minutes at pilot latency (14.5–19.1s/call + 6s spacing) — **against a 10-minute
tool ceiling, so run them one at a time or in the background, not chained in one call.** Worst case
per invocation is ~21 minutes if every call hits the 120s timeout.

**Expected behaviour, so you can tell a defect from a finding:**
- The first probe's run stamps `series_started`, `frozen_text_sha256`, and `frozen_class` into the
  probes file. **That is the freeze engaging — commit that change.**
- A first-call null on any strict field **aborts** with an instrument-defect message. That is a
  real halt: fix the field path, do not re-run past it.
- A `tier1_pause` or `engine_unavailable` line is **not** a failure — it is the gate speaking, and
  it counts as an outcome in the distribution. This was the worst defect PR19 caught.
- A `quota_429` **aborts the series** and marks it incomplete. Do not pool an incomplete series.
- A `SHAPE-DRIFT WARNING` on runs ≥2 means the response shape moved mid-series. Stop and
  investigate — that is either a deploy landing mid-sweep or a real defect.

Then:

```bash
python3 d6a-runner.py summary runs/<the-dated-dir>
```

## What to do with the output

The summary writes `runs/<date>/d6a-rate.json` carrying the **named** outputs:
`aggregate_disagreement_rate`, `aggregate_proceed_flip_rate`, `borderline_counted_outcomes`,
`borderline_disagreements`, `borderline_failures`, `all_borderline_series_complete`, and the
`calibration` block.

**Read the calibration block before reading the rate.** Three things falsify the headline:
- `all_borderline_series_complete: false` → the aggregate pools partial data and **must not be
  published**.
- An anchor moved (`anchors_stable` shows false) → the class boundaries the probe set asserts are
  not holding.
- `borderline_probes_showing_variance: 0` → either the instrument is more stable than c11
  suggested, or the probe set is not the borderline class it claims to be.

**If the class definition is falsified, report BOTH the rate as-defined AND the falsification as a
finding. Do NOT re-partition the probes to fix it** — the class labels are frozen and the runner
ignores post-hoc edits precisely because dropping a low-variance probe raises the rate and adding
one lowers it. A wrong-but-fixed partition with the falsification disclosed is honest; a
re-partition after seeing the numbers is not.

## Standing constraints — unchanged, and check operator strength not just presence

- **Weights-BLOCKED.** No weighting function may be designed, sketched, or evaluated. The
  instrument produces distributions and proposes no aggregation rule over them. `modal_outcome` is
  a descriptive dispersion reference and **bears on the deferred M-vs-W ruling in neither
  direction** — do not present it as bearing on that ruling.
- **Q1 — the loop proposes; it never executes.** D6a is not in the loop's path at all.
- **The §A boundary.** Nothing consumes D6a's output as a signal into generation or election. If
  any session proposes that, it is a different design needing its own ruling — refuse in place.
- **Path-specificity is binding.** The rate is measured on `/api/guardrail` ONLY. The trust record
  aggregates `/api/reason`-derived events, and no rate has ever been measured there. Wherever the
  rate is named it carries its path and an explicit statement that the reason-path rate is
  unknown.
- **Excludability.** Every call writes THREE tables — `api_key_usage`, `analytics_events`
  (`event_type: 'guardrail_check_v3'`), and `loop_billing_events` — plus `throttle_events` on any
  throttle. All are excludable by `agent_id = 'sagereasoning:d6a-probe@v1'`, which the runner sends
  in every payload. **Disclose the full footprint in the close**, including the measured cost from
  the recorded `cost_usd` values rather than the estimate in this prompt.
- **PR19.** The runner and probe set were reviewed before this run. If the run produces a *change*
  to either, that change needs its own independent review before the next sweep.
- **Concurrency convention:** `ListAgents` at open; `git status` twice; path-scoped commits; never
  `git add -A`; append shared records at the physical tail.
- Nothing here bears on the 0h call, which remains the founder's.

## The sequencing fact — read this before treating the rate as deliverable

The instrument-level disclosure runs **before** D6a in the mentor's sequencing, and as of this
prompt's authoring it is **still unapplied**: the wording is authored, founder-signed, and
mentor-confirmed, but blocked on its own PR19 review, with nothing yet on `llms.txt`,
`agent-card.json`, api-docs, or `TRUST_RECORD_ENVELOPE`.

The sweep may proceed regardless — the ruling places the *existence-of-variance* disclosure first
and the *rate* as a later update to it. But **the run's output must not be treated as feeding a
disclosure that is not published.** If this session produces a rate, it produces a rate that waits.

## What "done" looks like

Seven series complete and committed under `runs/<date>/`; the freeze engaged and the frozen probe
file committed; `d6a-rate.json` written with its calibration block read and interpreted; the
falsification question answered honestly either way; the full production footprint disclosed with
measured cost; a PR19-conscious decision-log entry at the tail; a lean close. **Nothing consumes
the output. No gate behaviour changes anywhere. No new credential, flag, schema, or public
surface.**

**The successor this unlocks (name it in the close; do not build it):** the R18 wording update that
carries the measured rate onto the public surfaces — which the mentor scoped as its own work,
outside D6a, and which is gated on the layer-1 disclosure being applied first.

End of prompt.
