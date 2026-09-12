# Standing Session Opener — Grounded Foundations

**Version 2026-09-10** (amends the 2026-09-08 version, now archived at
`archive/2026-09-08_STANDING-SESSION-OPENER-grounded-foundations.md`; predecessors at
`archive/2026-09-05_…`, `archive/2026-08-29_…`, `archive/2026-08-15_…`, `archive/2026-08-12_…`,
`archive/2026-08-01_…`, `archive/2026-07-25_…`, `archive/2026-07-13_…`).

> **✅ FOUNDER-ADOPTED 2026-09-12.** Drafted at the 2026-09-10 grounding session per the mentor's
> ruling (*"The regrounding is a founder act… It requires twenty minutes and accurate facts"*), and
> **adopted by the founder on 2026-09-12**. This is the operative standing opener. **Its figures
> remain claims to re-derive at your own open** — the window has moved since it was written (see the
> 2026-09-12 pre-flip report and its two rulings for the current readiness board, which supersedes
> this file's own window figures).

> **How this version was grounded.** Written 2026-09-10 (Thu) evening AEST, dated from `date`, not
> from the conversation context, by session `8fe3a6ae-dcb1-4324-846d-631d51336dc4`, opened under
> `2026-09-10-opener-regrounding-and-51-1-rederivation-NEXT-SESSION-PROMPT.md`. **First-hand,
> without subagents:** the guard-log-buffer-reconciliation close + its mentor ruling (canonical,
> verbatim wins), the post-Condition-3-build-verification close, the post-build-outcome mentor
> response, the Condition-3 design close and its two addenda, and the decision-log physical tail.
> **Live first-hand checks, not restatements:** the false-hold buffer parsed record-by-record in
> Python (452 lines, 0 unparseable); both SHA pins; the byte-identity guard battery **run** (250
> passed, 0 failed); the R20a registry arrays, the agent-card extensions array, the PR range, and
> `vercel.json`'s crons all **counted from source**; `git status`; `ListAgents`.
> **Claims a repo session cannot verify — Vercel environment values, Supabase state — are marked
> unverified rather than restated.**
> **The prior version (2026-09-08) opened three sessions on false facts before this correction landed
> — see "What was wrong in the prior version," below.** Re-derive all of it at your own open.

**For the founder. Paste this as the FIRST message of a new session, then state your task beneath it
(or in your next message).** It grounds the session in the project's state and the trust-layer harness
*before* any work begins. It is **reusable across any task** — a preamble, **not a task**: read,
confirm, then wait for the task.

---

## ⚠️ What was wrong in the prior version (2026-09-08), and what is true now

The mentor's 2026-09-10 ruling identified three false facts in the 2026-09-08 opener. All three are
corrected here; the underlying detail is in
`operations/handoffs/founder/2026-09-10-guard-log-buffer-reconciliation-CLOSE.md` and its mentor
ruling.

| The 2026-09-08 opener said | Re-derived 2026-09-10 |
|---|---|
| Baseline **"2 of 5"** | **5 of 5** in the counting sense. **This does NOT unblock D2** — see below. |
| `classifyCaller` **byte-unchanged**; no build licensed | **Built and LIVE**, mentor-ruled and acknowledged. It carries no separate feature flag — its own gate (version + entrypoint + agent_id presence) is the activation condition, live the moment `GATE1_FALSE_HOLD_CAPTURE=true` and the hooks fire. It has already fired on real production traffic, corroborated across two independent sessions, emitting `live_agent` correctly. |
| `caller_class` measures **null** — two values only | **Three values now present**: `unknown` (137), `subagent` (12), **`live_agent` (18)**. Schema is `false-hold-record-v6`, additionally carrying `clientVersion`/`clientEntrypoint`. |

## ⚠️ Do not over-read the corrections

- **D2 is NOT unblocked.** The mentor's Q1 ruling (2026-09-10, verbatim) holds that "ordinary" does
  independent work beyond counting completion: the instrument changed mid-window (day 09-09 splits
  v3/v4/v5 before 19:27:17Z from v6 after, with two `unknown/null` anomalies inside an edit window;
  day 09-10 runs wholly under v6). **The pre-flip report must disclose the instrument change
  explicitly** — schema distribution, the edit-window anomaly and its explanation, and that
  `live_agent` was not a possible emission for days 1 through most of day 4. **Whether that
  disclosure suffices for the flip is the 0h call, the founder's** — this ruling does not pre-empt it.
- **`Q-PREFLIP-REPORTS` is still unbuilt and still needs a founder waiver** (it matches `GUARD_RE`).
  The ruling adds required content to it; it does not license building it.
- The Option C′ gate (Conditions 1–3, all now complete) is **discharged**; `Q-CALLER-BUILD` is done,
  not "NOT LICENSED." The register row for it should be updated to reflect this at the next
  records-fold session.

## The window, re-derived at this writing

Buffer: **452 lines, 0 unparseable.** Schema distribution: v1=138 (pre-window, never mixed in), v3=50,
v4=97, v5=135, v6=32 — **sums to 452.** Window (post-probe, index 140 onward) = **313 records** = 50
consult + 263 guard.

| UTC day | consult | guard |
|---|---|---|
| 2026-09-06 | 3 | 76 |
| 2026-09-07 | 17 | 63 |
| 2026-09-08 | 6 | 57 |
| 2026-09-09 | 18 | 40 |
| 2026-09-10 | 6 | 27 (partial day) |

**BASELINE: 5 of 5** — every day now carries ≥1 consult record. **Counting-complete; not
sufficient for D2 alone** (see above). **Never "refresh" the buffer. It is append-only and never
truncated.**

## Two new traps to carry beside the existing `CONSULT`/`CONSULT-OUTAGE` prefix trap

- **TRAP-1**: `GUARD-OUTAGE` lines in `gate1.log` carry **no `tool=` field**. A `tool=`-keyed regex
  silently drops them. (Retroactive check run 2026-09-10: **CLEAN** — no published figure is computed
  with a `tool=`-keyed regex; the sole producer of published figures, `false-hold-observation-report.ts`,
  never reads `gate1.log` at all. See the reconciliation close for the full account, including one
  disclosed residual: an uncommitted ad-hoc script from 2026-09-09 cannot be re-read to directly
  confirm its method.)
- **TRAP-3**: **"record N" in this project's records is 1-INDEXED.** The took-effect probe is buffer
  line **139** (0-indexed **138**); the window is line **140 onward** (0-indexed **139 onward**).
  Sessions have drawn this boundary inconsistently — verify the indexing convention before quoting a
  window-start line number.
- **The guard log token is lossier than the buffer.** `GUARD-CAUTION` in `gate1.log` covers both
  `pause_for_review` and `proceed_with_caution`; for caution **grade**, the buffer is authoritative,
  not the log. (Guard population count reconciles exactly 1:1 against the buffer — 258=258,
  zero mismatches — but grade detail does not survive the log's own token collapsing.)

## F-K, resolved in recommendation

Do **not** extend the window for more v6 consult days — "adjusting the measurement to look cleaner"
(mentor). Disclose the instrument composition in the pre-flip report; let the 0h call rest on the
disclosed facts. If the founder wants future sessions to reliably produce consult records, tool-mode
routing should be **"a deliberate founder-visible setting, not an auto-mode outcome"** — an explicit
choice, not an artifact of auto-mode's Bash-vs-Write/Edit steering.

## A carried figure, now re-derived (was: unresolved across three sessions)

The Cognitive OS build session's own figure — **"52 window records — 51 guard, 1 consult"** —
**REPRODUCES**, precisely, with one clarification the mentor's summary omitted: it is the count
**as of that session's own report-close** (buffer at exactly 360 total lines), for session
`a7ee3eeb-8b49-4db1-b281-e0db4f8270b0`. Grouping the buffer by that session's `session` field through
line 360: **52 records, 51 guard, 1 consult** — exact. That same session ID continued afterward
(apparently resumed the next day) and added 3 more records (2 guard, 1 consult) after line 360, for a
**lifetime total of 55 records — 53 guard, 2 consult** across the full 452-line buffer as it now
stands. **Method for any future re-derivation: group by the buffer's own `session` field, never by an
ad-hoc time filter; split guard/consult by `path == 'guard'`.**

## A residual off-by-one, inside the ruling itself — surfaced, not corrected

The mentor's Q1 ruling states the required pre-flip schema distribution as *"v3=47, v4=96, v5=135,
v6=6"* (the 423-line snapshot at the time). **`v4=96` is wrong; it is `v4=97`** — the buffer's first
423 rows are append-only and sum to exactly 423 only with v4=97 (138+47+97+135+6=423; the ruling's set
sums to 422). Provenance traced: the 2026-09-10 verification session's own close had 97 (correct); its
register row had 96; the ruling adopted the register row. **The verbatim ruling is not edited — it is
canonical.** All of these counts are stale regardless (the buffer has since grown to 452 lines) and
must be re-derived when the pre-flip report is actually written. **This is a founder/mentor decision
(erratum? a note? nothing?), not resolved by any session.**

---

## ⚠️ Facts carried unchanged from the 2026-09-08 version (still true, re-verified)

### Eleven interactive sessions are open, against a standing ruling to consolidate

`ListAgents` at this writing: **10 interactive peers + this one** (same count as 2026-09-08 — the
composition has changed but not the number). The standing ruling to consolidate (S6b) stands
unamended. Founder item **F-E**.

### Production is unchanged since 2026-09-06 and the R20a ordering arc is CLOSED

No production surface has changed. **R20a: 43 route-level + 2 substrate-gate = 45**, re-counted from
the registry arrays this session (`HUMAN_FACING_POST_ROUTES.length === 43`,
`SUBSTRATE_GATE_ROUTES.length === 2`). **Agent-card extensions: 26.** **PR1–PR26** (PR26 has been
adopted since the 2026-09-08 version, which said PR1–PR25 — re-verify by enumeration, do not quote
this line). **6 crons** in `vercel.json` (`observability`, `trajectory-retention-sweep`,
`narrative-sweep`, `trust-core-retention-sweep`, `observability-retention-sweep`, plus one more — count
from source, not from this line).

### A binding pre-check still gates any future `GATE1_DEBUG` session

Unchanged from 2026-09-08: **(i)** `rm ~/.sage-gate1/*-stdin.json`; **(ii)** a fresh session, a control
probe, confirmed no fresh dumps. **The three stale `~/.sage-gate1/*-stdin.json` files remain on disk,
inert. Founder `rm` still owed** — CLAUDE.md's S9 production-state block remains uncorrected by
design (a correction belongs to whichever session finally closes that thread with a complete record,
not to an annotation from a grounding session).

### Every count in every document is a claim to re-derive

Re-derived from source at this writing: R20a 43+2=45; agent-card extensions 26; PR1–PR26; 6 crons; SHA
pins clean; byte-identity guard 250/0. CLAUDE.md's ~20 dated extension counts remain historical by
design. **Date your own artifacts from `date` and `git log`, never from the conversation context.**

---

## Part A — Open under the standard protocol (Tier 1 — always; ~8–10 min)

Read, in order:

1. `/adopted/standing-protocol-cache.md` — session protocol, model selection (AC1), risk
   classification (0d-ii), the concurrency check §6, the status vocabulary. **Process rules are
   PR1–PR26 — verify by enumeration; do not quote this line.**
2. `/adopted/build-sessions-protocol-cache.md` — if the task is a substrate/trust-layer build.
3. `/adopted/project-instructions-snapshot.md` — **PR19** (independent review REQUIRED), PR20 as
   amended, PR25.
4. `/manifest.md` — targeted sections only: R0 + the four un-numbered mentor-directed sections; AC5
   (note its internal contradiction, unresolved — a founder call); AC7.
5. `/CLAUDE.md` — the "Live in production" list. **⚠ Its S9 production-state block still says the
   loop is "still dumping every `PreToolUse` hook's raw stdin to disk" and that a manual `rm` is
   owed. This remains uncorrected by design** — see above.
6. `/operations/decision-log.md` — the **physical tail** (newest entries are at the END; a bare
   `grep '^## D-'` misses entries using the `## <date> — D-…` form).
7. **The most recent closes matched to your task:**
   caller-class / Option C′ → `2026-09-10-guard-log-buffer-reconciliation-CLOSE.md`, then
   `2026-09-10-post-condition3-build-verification-CLOSE.md`, then
   `2026-09-10-condition-3-version-pinning-design-CLOSE.md`;
   the two mentor verbatims dated 2026-09-10 (guard-reconciliation three questions; post-build-outcome
   response) — **canonical, verbatim wins over every summary including this one.**
8. **`git status`** (whole, never truncated) and **`git fetch origin && git log --oneline
   origin/main..HEAD`**. At this session's writing several files from other, closed sessions sat
   uncommitted (the cognitive-os arc, the condition-3 arc, a peer's `environmental-context.json` scan,
   S10's working notes) — **none matches `GUARD_RE`; never stage another session's files.** Re-derive
   the current state at your own open, do not quote this line.
9. **`ListAgents`** — note the peer count before writing anything.

*Tier 2 (task-dependent):* the day's deliverable in full; for the S11/caller-class track,
`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` **in full** plus the 2026-09-10
mentor verbatims; for the standing-runner track,
`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs"; for R20a/count-discipline,
`operations/count-discipline-2026-09/`; for anything in the agent-circles/ATRF/EE/provenance line,
`operations/agent-circles-2026-08/`. **The mentor verbatims are canonical.**

---

## Part B — Ground in the current project state (confirm you can state these)

### Production state

The substrate is live at `www.sagereasoning.com`. **Nothing has changed in production since
2026-09-06.** The R20a perimeter (43+2=45), the R20a ordering arc (closed), D4 (live and
took-effect-proven), the row-cap arc (closed, two deliberate exceptions), the provenance ledger
(slice 3 + 404-contract tail live, C3 soak to ~2026-11-24), the verdict-variance disclosure (live at
seven places, frozen evidence), and the public assessment contract (fixed on three surfaces, `api-docs`
rewrite still open) are **all unchanged from the 2026-09-08 version** — see it in
`archive/2026-09-08_STANDING-SESSION-OPENER-grounded-foundations.md` if you need the full detail on any
of these.

### Verified first-hand at this writing (2026-09-10 evening AEST)

| Claim | Check | Result |
|---|---|---|
| SHA pins | `shasum -a 256` | `layer2-mechanisms.ts` `60cefedb5f4f…`; `stoic-brain.ts` `fa8895ec949b…` — **both unchanged** |
| Byte-identity guard | battery **run** | **250 passed, 0 failed** |
| R20a route-level / substrate-gate | counted from array bodies | **43 / 2** |
| Agent-card extensions | `len(d['capabilities']['extensions']))` | **26** |
| Process rules | enumerated | **PR1–PR26** |
| False-hold buffer | parsed record-by-record | **452** rows, 0 unparseable; window **313** = 50 consult + 263 guard |
| Baseline days (≥1 consult) | grouped by UTC day | **5 of 5** |
| `caller_class` distribution | counted | unknown 137 / subagent 12 / **live_agent 18** |
| `git status` | whole | 3 modified/untracked files from other, closed sessions; none `GUARD_RE` |
| Open sessions | `ListAgents` | **10 interactive peers + this one** |
| Vercel / Supabase state | — | **unverified from a repo session** |

---

## Standing queue — carried from the 2026-09-08 version, with corrections applied

**Not re-derived row-by-row this session** (out of this grounding's scope — see Task A of the session
that wrote this version). Apply these corrections to the 2026-09-08 queue table before trusting any
row:

- **`Q-CALLER-C2` and `Q-CALLER-C3`: DONE.** Condition 2 (second live capture) and Condition 3
  (client-version pinning) both closed 2026-09-09/10 — see the closes listed in Part A §7.
- **`Q-CALLER-BUILD`: DONE, LIVE.** No longer "NOT LICENSED" — see the correction table at the top of
  this file.
- **`Q-D2-ENGINE`: still BLOCKED**, but the reason has changed from "baseline 2→5" to "the pre-flip
  report's instrument-change disclosure has not been written or judged sufficient" (Q1 ruling).
- **`Q-PREFLIP-REPORTS`: still unbuilt, still needs a founder waiver** — now carries **required
  content** per the Q1 ruling (schema distribution, edit-window anomaly, the `live_agent`
  non-emission-window fact) that did not exist as a requirement on 2026-09-08.
- All other rows (`Q-L1SUPPLY-2B`, `Q-OPTION-S-RUN`, `Q-HUB-CONTINUITY`, `Q-G6A-QUALIFICATION`,
  `Q-RECORDS-FOLD`) and the founder-action rows (F-A through F-K, F-K now resolved-in-recommendation
  per above) are **carried forward unverified by this session** — re-derive their state before acting
  on any of them. The held/gated list (C) and longer-tail list (D) are likewise carried forward
  unverified.

### The 0h launch hold-point

**Unchanged in substance.** Weights **BLOCKED** throughout. **The Q1 hard constraint holds: the loop
proposes; it never executes.**

---

## Running a side arc in parallel — the four constraints that actually bind

Unchanged from the 2026-09-08 version — see Part A §7 pointer above or the archived file for the full
text. In brief: (1) the byte-identity guard is ARMED, both SHA pins catch committed edits too, a
waiver is required to touch any `GUARD_RE` file; (2) nothing perturbing `/api/reason` or
`/api/guardrail` may run during the window; (3) concurrency discipline — path-scoped commits, `git
status` whole, `ListAgents` at open; (4) tool mode has a measurement consequence (now a *ruled
structural dependency*, per F-K above) — disclose it, never choose *because of* it.

---

## Part C — The trust-layer harness + its capabilities

The 2026-09-08 opener's Part C stands, **with `caller_class` now corrected**: it carries **three**
values (`unknown`, `subagent`, `live_agent`), not two, on `false-hold-record-v6`, which additionally
carries `clientVersion`/`clientEntrypoint`. `classifyCaller` is live, self-activating on
`GATE1_FALSE_HOLD_CAPTURE=true`, no separate flag. Everything else in Part C (guard-disclosure
segments, outage exclusion, harness config keys, client version fields) is unchanged — re-derive at
your own open, do not quote.

## Part D — Working inside the dogfooded harness (standing context)

Unchanged from the 2026-09-08 version.

## Part E — Confirm the standard opening (state these, briefly, before the task)

1. Tier (0d-ii) and whether AC7 engages; model per AC1.
2. Hold-point: **0h HELD**; **S11 flip REFUSED**; **weights BLOCKED**.
3. Status vocabulary: `Scoped → Designed → Scaffolded → Wired → Verified → Live`;
   `Adopted / Under review / Superseded`.
4. **Window state re-derived by you, not quoted from here** — buffer size, window population,
   baseline days, both SHA pins, guard battery green, `caller_class` distribution.
5. `git status` whole; unpushed commits; **`ListAgents` peer count**.
6. Whether your task touches `GUARD_RE`. If it does and you have no recorded waiver, **stop**.

## Part F — Now state the task

**Everything above is preamble. Wait for the task.**

---

*End of the standing opener, Version 2026-09-10. Drafted by a grounding session from primary sources;
awaiting founder confirmation/adoption per the mentor's 2026-09-10 ruling. Every number in it is a
claim to re-derive.*
