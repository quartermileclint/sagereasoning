# Standing Session Opener — Grounded Foundations

**Version 2026-09-08** (amends the 2026-09-05 version, now archived at
`archive/2026-09-05_STANDING-SESSION-OPENER-grounded-foundations.md`; predecessors at
`archive/2026-08-29_…`, `archive/2026-08-15_…`, `archive/2026-08-12_…`, `archive/2026-08-01_…`,
`archive/2026-07-25_…`, `archive/2026-07-13_…`).

> **How this version was grounded.** Written 2026-09-08 (Tue) ~18:45 AEST = 2026-09-08 ~08:45 UTC,
> dated from `date`, not from the conversation context. It re-derives the **2026-09-07 16:19 AEST →
> now** window — everything after the previous version's last in-place amendment (commit `3437dc0`)
> — **first-hand and without subagents**: the four session closes since (S6b, S7, S8, S9), the S10
> working-notes file (a paused, deliberately record-less session), every decision-log entry from
> `D-MENTOR-RULINGS-S6B-THREE-QUESTIONS-ADOPTED-2026-09-07` to the physical tail
> (`D-MENTOR-RULING-S9-FOUR-QUESTIONS-ADOPTED-2026-09-08`), the two governing mentor rulings of that
> window in full, the S11 register's D2/P6/B4 rows, and the amended Condition-2 prompt. **Live
> first-hand checks, not restatements:** `git status` and `git log origin/main..HEAD`; the false-hold
> buffer parsed record-by-record in Python; `gate1.log`'s tail; `~/.sage-gate1/` for `*-stdin.json`
> residue; `.claude/settings.local.json` (keys only, no token read); both SHA pins; the byte-identity
> guard battery **run, not quoted**; the R20a registry arrays, the agent-card extensions array, the
> PR range, and `vercel.json`'s crons all **counted from source**; `ListAgents`.
> **Claims a repo session cannot verify — Vercel environment values, Supabase state — are marked
> unverified rather than restated.** At writing the tree is **clean of guarded files, `origin/main`
> and `HEAD` are level at `ff6b51d`, and nothing is unpushed.** Re-derive all of it at your own open.

**For the founder. Paste this as the FIRST message of a new session, then state your task beneath it
(or in your next message).** It grounds the session in the project's state and the trust-layer harness
*before* any work begins. It is **reusable across any task** — a preamble, **not a task**: read,
confirm, then wait for the task.

---

## ⚠️ The facts every session in this window must know before anything else

### 1. The observation window is RUNNING, and most sessions add nothing to it

Started **2026-09-06T09:44:55Z**, took-effect proven. `GATE1_FALSE_HOLD_CAPTURE=true` is present in
the founder's local `.claude/settings.local.json` (verified first-hand). **Nothing about the window
lives in Vercel** — the flag is read only by `harness/gate1-pre-decision/**`; a false start that set
it in Vercel was caught at S4 and is on record.

Buffer at this writing: **298 records** — 138 pre-window `v1` (a different regime, **never mixed
in**), record 139 the deliberate took-effect probe (**excluded**), leaving a window population of
**159** = **139 guard + 20 consult**.

| UTC day | consult | guard |
|---|---|---|
| 2026-09-06 | 3 | 76 |
| 2026-09-07 | 17 | 63 |
| 2026-09-08 | **0** | **0** |

**BASELINE: 2 of 5.** The gate is **five ordinary days WITH CONSULT RECORDS** — a day with ≥1
consult counts; a zero-consult day does **not** (binding, D2 ruling). Two days qualify. **S11-D2 is
blocked on this counter and on nothing else.**

**Never "refresh" the buffer. It is append-only and is never truncated.**

### 2. ⚠ SESSION NUMBERS S7–S10 NOW MEAN TWO DIFFERENT THINGS. This version renames them.

The standing queue used `S1…S11` as *queue row labels*. The caller-class arc of 2026-09-07/08 then
reused `S6a, S6b, S7, S8, S9, S10` as *its own* session numbers, for entirely different work. The
collision is real and would mislead a session told to "run S7":

| Label | Queue row (older meaning) | Caller-class arc (2026-09-07/08 usage) |
|---|---|---|
| S7 | item 2b — `l1_supply` out of the `ecosystem` preset — **still queued** | rulings 2 & 3 executed — **done** |
| S8 | records fold + governing-surface edits — **still queued** | Option C investigation — **done** |
| S9 | harness A11b redaction — **done 2026-09-06** | Condition 1 — **done 2026-09-08** |
| S10 | founder-hub mentor continuity — **still queued** | Condition 2 capture — **paused, unreached** |

**From this version the two namespaces are separated and the queue rows below use the new names.**
Queue rows are `Q-…` (by topic, not number). Caller-class arc sessions keep their historical
`S6a…S10` labels **only** as references to work already done. **Never open a session by a bare
number again — name the deliverable.**

### 3. The Option C′ gate: three conditions, one complete, and NO BUILD IS LICENSED

`classifyCaller` may not be modified until **all three** are met (S8 five-question ruling, binding):

- **Condition 1 — false-positive check under controlled conditions. ✅ COMPLETE and closed by
  ruling (S9).** A top-level session never carried `agent_id` at H3 across eight captures / four
  configurations on client `2.1.260`. The `CLAUDE_CODE_CHILD_SESSION` question the ruling named as
  *"the first thing to examine"* is answered: it reads `1` in a top-level session whose H3 captures
  carry no `agent_id`. Configuration 5 (a second entrypoint) is **ruled out of scope** — it belongs
  to Condition 3, so it is no longer a Condition-1 gap.
- **Condition 2 — a second live capture. ❌ OUTSTANDING.** Must be a **genuinely different calendar
  day** (*"literal, not approximate"*), a **different session ID**, and the **same client 2.1.260**.
- **Condition 3 — client-version pinning in the build, with detection of the field's absence falling
  back to `unknown` rather than silently misclassifying. ❌ OUTSTANDING, not started.**

**`classifyCaller` is byte-unchanged. Nothing may be built against this candidate.**

**S10 attempted Condition 2 and correctly could not run it** — it opened ~10 minutes after S9 closed,
the same day under both conventions. It is **paused, not closed**: no decision-log entry, no register
row, no `D-` code, by founder ruling. Its working notes
(`operations/trust-layer-2026-07/2026-09-08-S10-WORKING-NOTES-session-paused-NOT-CLOSED.md`,
**untracked**) hold perishable evidence only. **Do not cite S10 as a finding.**
**The first unambiguously qualifying day for Condition 2 is 2026-09-09 local.** UTC rolls at 10:00
AEST, so 11:00 AEST on 09-08 is a new UTC day but the same *local* day — it does not qualify.

### 4. A binding pre-check now gates any future `GATE1_DEBUG` session

Before **any** session sets `GATE1_DEBUG` again, **both** are required and **neither is optional**
(S9 four-question ruling): **(i)** `rm ~/.sage-gate1/*-stdin.json`; **(ii)** open a **fresh session**,
run a control probe, and **confirm no fresh dumps appear**. If dumps appear, the variable is still
live and *"its persistence mechanism must be understood before it is used again."*

**Current state, verified first-hand at this writing: no `*-stdin.json` files exist.** The S9
residual has cleared. **This does NOT discharge the pre-check** — the ruling requires it run in the
capturing session itself.

**Why it exists:** `GATE1_DEBUG` shows a **revert asymmetry**. Addition took effect within one tool
call; removal had not taken effect at all by S9's close (sentinel-proven). The config file was
byte-identical to its backup both times; the *runtime effect* was not. S10 eliminated two candidate
carriers (app-process restart — the app PID was continuous across S8/S9/S10; pure elapsed-time TTL —
contradicted, ≥1h45m in S8 vs ≤9min in S10) and **the carrier is still not identified.** A session
boundary survives as the one differing variable.

### 5. The measured population depends on tool mode — and this session is a live example

**Ruled disclosure (S9), now a named *structural dependency* in the pre-flip report, not merely a
limitation:** the consult denominator *"is not a random sample of all actions the agent takes — it is
a sample of actions taken with Write/Edit/MultiEdit/NotebookEdit tools."* `Bash` is dropped from the
consult floor, so a session authoring via heredocs adds **nothing** to the consult population.

Observable right now in `gate1.log`: this session's every Bash call logs
`AT-ACTION-SKIP-BASH reason=bash-dropped-from-score` (or `housekeeping`). **A Bash-authored session
cannot advance the baseline toward 5 of 5. A Write/Edit-authored one can.**

Two consequences, both named rather than decided by any session:
- **Composition is disclosed, never filtered.** All 20 consult records in the window are
  documentation authoring; **zero `website/src` engineering actions** so far. The mentor ruled such
  days **count** — *"a day composed entirely of markdown authoring is a day the instrument examined
  Write and Edit actions"* — and that filtering them would be *"a post-hoc narrowing of the
  population mid-window, the move ruled against twice already."*
- **Tool choice therefore moves a gated counter.** Choosing a tool *because of* its measurement
  effect, in either direction, would be shaping the instrument. Choose on the task's merits and
  disclose the effect.

### 6. Eleven interactive sessions are open on this project, against a standing ruling to consolidate

`ListAgents` at this writing: **10 interactive peers + this one.** At S6b the mentor ruled on exactly
this: *"Epithumia — craving — presents as urgency… more arcs means more surface area for errors to
propagate undetected."* At S7 there were six. **The count has grown, not shrunk.**

This matters for any proposal to add a parallel arc — see **"Running a side arc in parallel"** below,
which states the four constraints that actually bind.

### 7. Production is unchanged since 2026-09-06 and the R20a ordering arc is CLOSED

No production surface has changed since the Stoa restructure went live and was smoke-verified
(2026-09-06). Everything since is **repo-only or local-harness**: no flag set or unset, no schema, no
migration, no credential, no deploy. **Every human-facing member of the R20a perimeter now reaches
its distress check before any refusal on a body whose screened text is present.** Groups 1, 2, 2b, 3
and the Stoa pair are all live. J/A/F members are outside the ruling by its own terms — **no move is
owed there, and they must not be "fixed."**

### 8. Every count in every document is a claim to re-derive

Re-derived from source at this writing: **R20a 43 route-level + 2 substrate-gate = 45**;
**agent-card extensions 26**; **PR1–PR25**; **6 crons** (none is the environmental scan).
CLAUDE.md's ~20 dated extension counts and every perimeter figure in it are **historical by design**.
**Date your own artifacts from `date` and `git log`, never from the conversation context** — that
error misdated three separate sessions in the previous window and is why a cluster of files is
labelled one day ahead of reality (read past it; the labels are cited by filename and stay).

### 9. Two mentor items and several founder acts are pending — nothing self-starts on them

See "Founder actions between sessions" below.

---

## Part A — Open under the standard protocol (Tier 1 — always; ~8–10 min)

Read, in order:

1. `/adopted/standing-protocol-cache.md` — session protocol, model selection (AC1), risk
   classification (0d-ii), the five-row AI-failure-mode table, the **concurrency check §6** (carrying
   the 2026-09-05 collision annotation), the status vocabulary. **Process rules are PR1–PR25 —
   verify by enumeration in `/adopted/project-instructions-snapshot.md`; do not quote this line.**
2. `/adopted/build-sessions-protocol-cache.md` — if the task is a substrate/trust-layer build.
3. `/adopted/project-instructions-snapshot.md` — **PR19** (independent review REQUIRED — it has now
   found HIGHs that first-hand review missed **eight** separate times across two windows), PR20 as
   amended (timestamp-check present-tense mechanism facts at relay), PR25.
4. `/manifest.md` — targeted sections only: R0 + the **four** un-numbered mentor-directed sections
   (the Moral Community Boundary; the ATRF; the Consciousness and Continuity Obligation; **the
   Prerequisite Criterion**, binding governance since 2026-08-29); AC5 (note its internal
   contradiction — it bolds *"does not hand-enumerate route-level membership"* then enumerates all
   43; counts correct today, the contradiction is a founder call); AC7.
5. `/CLAUDE.md` — the 2026-09-05 grounding note, then the 09-06-labelled item-E block, then the
   "Live in production" list. **⚠ Its S9 production-state block currently says the loop is "still
   dumping every `PreToolUse` hook's raw stdin to disk" and that a manual `rm` is owed. Both are
   now FALSE** (fact 4). The correction belongs in the resumed Condition-2 session's own complete
   record; it is deliberately left uncorrected rather than annotated from a half-finished session.
6. `/operations/decision-log.md` — the last 3 entries at the **physical tail**, which as of this
   writing are `D-S9-CONDITION-1-AGENTID-PARENT-SESSION-PASSES-2026-09-08`,
   `D-MENTOR-RULING-S9-FOUR-QUESTIONS-ADOPTED-2026-09-08`, and before them
   `D-MENTOR-RULING-S8-FIVE-QUESTIONS-ADOPTED-2026-09-08`. **The head of the file is NOT the newest
   material**, and the newest entries use `## <date> — D-…` headings, not the older `## D-…` form —
   a bare `grep '^## D-'` will silently miss everything after 2026-09-05.
7. **The most recent close matched to your task:** caller-class / Option C′ →
   `2026-09-08-S9-condition-1-agentid-CLOSE.md` then `2026-09-08-S8-option-C-investigation-CLOSE.md`;
   window + Option S → `2026-09-07-S6b-commit-gate-and-option-s-fixes-CLOSE.md` and
   `2026-09-07-S7-rulings-2-and-3-executed-CLOSE.md`; R20a → the four
   `2026-09-06-r20a-perimeter-ordering-remediation-*-CLOSE.md` files; standing runner →
   `2026-09-04-standing-runner-design-R10-twelve-environment-CLOSE.md`.
8. **`git status`** (whole, never truncated) and **`git fetch origin && git log --oneline
   origin/main..HEAD`**. Expected at this writing: `HEAD` = `origin/main` = `ff6b51d`; nothing
   unpushed; **two modified files and one untracked file in the tree that are NOT yours** (see
   "What is in the tree that you did not put there"). **Never stage another session's files.**
9. **`ListAgents`** — note the peer count before writing anything.

*Tier 2 (task-dependent):* the day's deliverable in full; for the S11/caller-class track,
`operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` **in full** plus the S8 and S9
mentor verbatims; for the standing-runner track,
`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md` §"Named inputs" and the R9/R10 designs'
head-of-document withdrawals and RULED addenda; for R20a/count-discipline,
`operations/count-discipline-2026-09/`; for anything in the agent-circles/ATRF/EE/provenance line,
`operations/agent-circles-2026-08/`. **The mentor verbatims are canonical — verbatim wins over every
summary, including this one.**

---

## Part B — Ground in the current project state (confirm you can state these)

### Production state

The substrate is live at `www.sagereasoning.com`. **Nothing has changed in production since
2026-09-06.** Everything the 2026-09-05 opener listed as live remains live, and its "what is live
beyond the 08-29 list" section stands unamended — read it in
`archive/2026-09-05_STANDING-SESSION-OPENER-grounded-foundations.md` if you need the detail. The
headline items, unchanged:

- **The R20a perimeter: 43 route-level + 2 substrate-gate members**, counted from the registry
  arrays at this writing. The count is **enforced, not warned** — the guard battery asserts no
  hand-maintained count appears in its own comments, and strips comments before every per-route
  import check.
- **The R20a ordering arc is closed** (fact 7). Groups 1/2/2b/3 and the Stoa pair live.
- **D4 live and took-effect proven** (`SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED=true`).
  D4 does **not** close D1's full-ledger-replay caveat.
- **The row-cap arc is closed**; two deliberate exceptions remain (`provenance-ledger-store.ts`
  WATCHED, and C5 Stripe-gated).
- **Provenance ledger:** slice 3 + the 404-contract tail live. Switch-on scoreboard C1 ✅ · C2 ✅ ·
  C4 ✅ · **C3 ⏳ the 90-day soak to ~2026-11-24. Slice 5 is not to be opened before that.**
- **The verdict-variance disclosure is live at seven places.** D6a's runs are **frozen evidence** —
  never "refresh" the figures.
- **The public assessment contract is FIXED** on the three served surfaces (S2 rode `6586713`,
  2026-09-06: llms.txt ×6, agent-card ×4, skill-registry ×1, drift assertion 13/0). **Still open,
  deliberately excluded by the package's own §D:** the `api-docs/page.tsx` assessment-entry rewrite —
  both entries still document a request shape neither assessment route ever accepted.
- **`environmental_context` still has no scheduled producer** — but see "What is in the tree", below:
  a peer session has a **hand-run weekly scan sitting uncommitted**, which changes the disposition
  question from "is this abandoned scaffolding?" to "is this meant to be run by hand?"

### Verified first-hand at this writing (2026-09-08, ~18:45 AEST)

| Claim | Check | Result |
|---|---|---|
| Git state | `git status`; `git log origin/main..HEAD` | `HEAD` = `origin/main` = **`ff6b51d`**; **nothing unpushed**; 2 modified + 1 untracked, none mine |
| R20a route-level / substrate-gate | entries counted inside each array body | **43** / **2** |
| Agent-card extensions | `len(d['capabilities']['extensions'])` | **26** |
| Process rules | enumerated in the snapshot | **PR1–PR25** |
| Scheduled crons | `vercel.json` | **6** (none is the environmental scan) |
| Byte-identity guard | battery **run**, not quoted | **250 passed, 0 failed** — armed and green |
| `layer2-mechanisms.ts` SHA pin | `shasum -a 256` | `60cefedb5f4f…` — **unchanged** |
| `stoic-brain.ts` SHA pin | `shasum -a 256` | `fa8895ec949b…` — **unchanged** |
| False-hold buffer | parsed record-by-record | **298** rows; window **159** = 139 guard + 20 consult |
| Baseline days (≥1 consult) | grouped by `capturedAt` UTC day | **2 of 5** (09-06, 09-07) |
| `GATE1_FALSE_HOLD_CAPTURE` | `.claude/settings.local.json` | **`true`** — window running |
| `GATE1_DEBUG` residue | `ls ~/.sage-gate1/*-stdin.json` | **none** — S9 residual cleared |
| Harness identity | config keys | `sagereasoning:s9-loop@v1`; `GATE1_TIMEOUT_MS=55000`; `GATE1_DEPTH=standard` |
| Open sessions | `ListAgents` | **10 interactive peers + this one** |
| Vercel / Supabase state | — | **unverified from a repo session** |

### What is in the tree that you did not put there

Three files are modified/untracked at this writing and **none belongs to a session you are opening**:

- `website/src/data/environmental-context.json` — **modified, uncommitted, a peer's.** A genuine
  hand-run weekly environmental scan (`last_scanned` 08-31 → **09-07**, both domain summaries
  rewritten with primary-source citations). Substantive and worth committing; **not yours to stage.**
- `operations/handoffs/founder/2026-09-08-condition-2-second-capture-NEXT-SESSION-PROMPT.md` —
  **modified, uncommitted.** S10's amendment: a **STEP 0 date gate** (+69 lines) and a client-version
  correction. **UNSPENT.**
- `operations/trust-layer-2026-07/2026-09-08-S10-WORKING-NOTES-session-paused-NOT-CLOSED.md` —
  **untracked.** Perishable evidence from the paused S10. **Not a finding; do not cite it.**

**None matches `GUARD_RE`.** Path-scoped commits, always. A peer's push publishes your local commits
too — **the commit, not the push, is the point of no return.**

### The window, in the detail a session actually needs

- **Gate:** five ordinary days **with consult records**. Currently **2 of 5**.
- **What a guard record is:** four `GUARD-*` tokens in `gate1.log`, matched **whole**, never by
  prefix (`CONSULT` matches `CONSULT-OUTAGE` — split by exact token or you over-count).
- **What is excluded, by ruling:** `GUARD-OUTAGE` records (they record that no examination happened);
  consult outages (excluded by construction — the hook returns before the capture); review-fleet
  subagent records (excluded in principle — see the null finding below); the 138 `v1` records; the
  took-effect probe at index 139.
- **The `caller_class` signal measures NULL, and that is the honest result.** S7 built it at a dated
  v4→v5 schema boundary with **two** values only — `'subagent'` on positive structural evidence,
  `'unknown'` for everything else. Across every re-derivation since (19 → 27 → 28 → 30 → all
  post-boundary v5 records), **every record reads `unknown`; none reads `subagent`** — including
  records provably generated by review fleets. So the exclusion is a correct mechanism with **no live
  population to exclude**, and reports an honest **lower bound of zero**. Had a `'live_agent'` value
  existed, the field would now read 100% `live_agent` and be misread as *"no contamination found"*
  when it means *"no signal was available."* The `agent_id` candidate (Option C′) is the possible
  fix, and it is behind the three-condition gate.
- **Corroboration recipe, with its two traps:** anchor the day boundary on the **`gate1.log` line
  timestamp**, not the buffer's `capturedAt` (the same event is stamped twice, milliseconds apart);
  and split token families by **exact match**, never prefix.
- **Re-derive aggregate tallies at close, immediately before writing them** — a running session
  appends to the buffer it is reading, and attribute records by the buffer's own `session` field,
  never by an ad-hoc time filter. Both S8 and S9 published stale figures and had them caught by PR19.

### The window's method lessons (added this window)

- **A mutation test that PASSES may mean the mutation never landed.** S7 hit a false negative caused
  by shell escaping; re-applied properly, the battery went red. **Assert the file actually changed.**
- **A shell *fallback* must never run a destructive git command.** S7 ran `git checkout --` on an
  un-backed-up file as a restore-check fallback and wiped its own working change. Recovered, but the
  lesson is structural: **back up before any truncating write, and stop to diagnose rather than
  letting a fallback fire.** All restores are now SHA-checked, not assumed.
- **Naming the pull is not resisting it.** S10 identified its own blocking condition in its *first
  tool call*, then ran a pre-check, a full window re-derivation that provably could not have moved, 
  ~600 lines of records and a three-agent PR19 — while its own examination named the driver three
  times (*"the pull to fill the gap with visible output"*). **A session that correctly refuses to
  start owes nothing. A two-line report is a complete and successful output.**
- **A reviewer that has not read the source can still ask a good question — but its answer is not a
  finding.** S9's PR19 dimension 1 disclosed it had not read the files; its structural questions were
  followed up first-hand against source rather than accepted.
- **`maybeDebugDump` keys its file by event NAME, not by which hook wrote it** — H2 and H3 share the
  `PreToolUse` slot, and reading the dump with Bash is itself matched by H3's matcher and overwrites
  the file before the read completes. **Use the Read tool.**
- **A subagent turn that answers in text without a real tool call produces `tool_uses:0`** — a
  diagnostic depending on a hook firing must instruct the subagent to invoke a tool, and the caller
  must check `tool_uses`, not merely that a response came back.
- **Sentinel-content-provenance** (a unique string in each action's own `tool_input`, accepted as
  evidence only on an exact match) makes a single-slot dump usable under genuine concurrency
  **without editing any guarded file**. It caught two real race overwrites in flight.

### Threads

1. **Trust Layer / S11 + caller-class.** Register:
   `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md`. P1 discharged; P2/P3 landed;
   P4/P5/P6 open; B1–B4; **D1 open** with its C2 cross-reference (the close hook is seed-only and the
   row exists ⇒ 409 before emission, so harness traffic can never discharge it); **D2 raised and
   BLOCKED on baseline 2→5**; D3 standing; **D4 live and proven**; D5 closed. **Option C′ behind its
   three conditions.** **The S11 flip is REFUSED, MEASURE throughout, weights BLOCKED.**
2. **Standing runner / agent circles.** R8/R9/R10 sat; founder elections standing (R9 §16). The Option
   S gate is **item-level** — only the M/W/S floor-semantics election and R8-D7's sampling policy wait
   on its data. **Option S is fixed and has still never made a call.** The twelve-environment agent
   architecture is REVISED-not-confirmed and **prospective in v1**. R11 is the founder's to open.
3. **R20a perimeter + website.** Arc closed. Still open: the `/api/score/save` local-storage bypass;
   `api/mentor/private/reflect/route.ts:660`'s body-supplied `user_id` (**founder-ordered first of
   the named-unbuilt list on 2026-08-24, still unbuilt**); the view-grants remediation migration
   (authored, not run) + the escalated `vulnerability_flag_owner_view`; `triggered_rules` encryption;
   M-5(b) identity threading; 15 of 22 routes without per-route invocation tests; the
   `mentor_profiles` decrypt failure; `founder_conversations` plaintext-at-rest + no data-rights
   wiring; `stoa-boundary` battery RED since 08-03 (awaiting ruling #20).
4. **Count discipline / R18.** The assessment-contract package is **applied**; the `api-docs` rewrite
   is not; the manifest AC5 contradiction is a founder call.
5. **Provenance ledger.** C3 clock only; the switch-on re-check is a **hard** obligation.
6. **Reflections / close hook.** Case 2 (the consult-verdict path) still unobserved; IW-7 opening 2
   HELD by ruling.
7. **Founder hub / mentor continuity.** Row-cap fix live; the continuity-window question is **ruled on
   shape** but **Q4 is still owed and is the founder's alone** — read rows 1001–1011 and decide
   whether the 08-31 corrected ruling stands.
8. **Future directions** (recorded, not build items): SagePals / the Prudence Group; the
   engine-evolution examination; the incubation entry type; melete.

### The 0h launch hold-point

**Unchanged in substance.** P2's verdict stands; the founder's three branches remain the standing
decision; the 2026-08-22 sequencing stands (all current tasks complete before any 0h assessment).
**Nothing in this window bears on the call.** Weights **BLOCKED** throughout (GS-CYB-1's two-condition
gate + the Prerequisite Criterion). **The Q1 hard constraint holds: the loop proposes; it never
executes** — and reaches any composed pipeline on this harness.

---

## Standing queue — the prioritised session plan (as of 2026-09-08; none self-starts)

**Ordering principle:** each session removes a blocker for the next or closes a live harm class;
autonomous sessions lead where the founder's action is not on the critical path; founder-attended
work is batched so one sitting discharges many gates; every session is sized to one context window.

**Naming:** rows are `Q-<topic>`, not numbers (fact 2). Historical `S…` labels appear only as
back-references to completed work.

### A. Founder actions between sessions (no session needed — each unblocks something)

| # | Action | Unblocks |
|---|---|---|
| **F-A** | **Commit the four S9 record files + the S8 staged records** (the founder commits by name; the AI never pushes). None matches `GUARD_RE`. | the record's visibility |
| **F-B** | **Commit or discard the peer's `environmental-context.json` scan** — it is real, sourced work sitting uncommitted | closes F-5's disposition question at the same time |
| **F-C** | **Relay nothing new — but decide Condition 3's shape.** S10 found `version` rides the hook payload, so the harness can read the client version **at runtime** rather than hard-coding a constant. That is a materially better shape for the Condition-3 build. | `Q-CALLER-C3` |
| **F-D** | **`npx` fail-closed** on the pre-commit guard (mentor-recommended; the precondition — Node on GitHub Desktop's PATH — was **discharged at S7**) | makes the commit gate real rather than nominal |
| **F-E** | **Close idle peer sessions.** 10 interactive peers are open against a standing ruling to work one arc. | error surface; the mentor ruled on this twice |
| **F-F** | **Decide the manifest AC5 fix** (remove the enumeration, or remove the bolded claim) | a governing-surface edit any session can then apply |
| **F-G** | **Decide the concurrency escalation** after the first collision (pre-commit hook / PR26 / leave as convention) | the standing cache's §6 |
| **F-H** | **Founder-hub Q4** — read rows 1001–1011, decide whether the 08-31 corrected ruling stands, recover any uncaptured ruling | `Q-HUB-CONTINUITY` |
| **F-I** | **Path A's production extraction** (`option-s/EXTRACTION.sql` §PRE/§2/§3) — if it returns 24, the ruling's "20 winners" gets a correction note | `Q-OPTION-S-RUN` |
| **F-J** | **TEST parity, one sitting:** the ATRF-EE Step-0 read-only determination on TEST; TEST's `project_context` row | removes two "undetermined" carries |
| **F-K** | **The tool-choice measurement-validity question** — named at S6a, carried unresolved through S6b/S7/S8/S9. Now sharper: fact 5 makes it a ruled *structural dependency*, and the baseline cannot advance on Bash-authored sessions. **Do you want sessions steered toward Write/Edit while the window runs, or not?** | the window's own composition |

### B. Sessions, in priority order — ONE SERIAL ARC

| Row | Session | Tier / attendance | State |
|---|---|---|---|
| **Q-CALLER-C2** | **Condition 2 — the second live capture.** Different calendar day, different session ID, same client `2.1.260`. **STEP 0 date gate STOPS the session if the day does not qualify.** Mandatory two-step `GATE1_DEBUG` pre-check first. | `code-elevated`, founder-attended | **PROMPT UNSPENT AND AMENDED.** Earliest qualifying day **2026-09-09 local** |
| **Q-CALLER-C3** | **Condition 3 — client-version pinning**, with absence-detection falling back to `unknown`. Shape improved by S10's `version`-rides-the-payload finding (F-C). | `code-elevated`, PR19 | to author; gated behind C2 |
| **Q-CALLER-BUILD** | `classifyCaller` modified to read `agent_id`. **Licensed by nothing until all three conditions are met.** Touches `false-hold-capture.mjs` (`GUARD_RE`) ⇒ needs a founder waiver, guard left armed. | `code-elevated`, founder waiver | **NOT LICENSED** |
| **Q-L1SUPPLY-2B** | Item 2b — `l1_supply` out of the `ecosystem` preset (ruled; verify `active_with_l1_supply = 0` at open). *(Was queue-row "S7".)* | `code-critical`, founder-walked, PR19 | queued; **window-neutral, may run during the window** |
| **Q-OPTION-S-RUN** | Run Option S against the 29 decision-bearing candidates (≈$1.24). All four pre-run blockers fixed at S6b; the median convention **ruled `lower_median` before any spend**. | `code-elevated` | **fixed, still never run**; needs F-I |
| **Q-HUB-CONTINUITY** | Founder-hub mentor continuity (session-bounded token-budgeted fetch; the "what you cannot see" line; `MENTOR_HISTORY_WINDOW` changes only by a ruling-citing diff). *(Was queue-row "S10".)* | `code-elevated` | **gated on F-H** |
| **Q-PREFLIP-REPORTS** | The **two owed pre-flip disclosures**, both registered and **neither built**: (i) baseline composition day-by-day with tool distribution; (ii) **loop count by action class** (product/governing-document actions vs protocol-required record-keeping). `false-hold-observation-report.ts` matches `GUARD_RE` ⇒ founder waiver + its own session. Required **before the flip**, not now. | `code-elevated`, founder waiver | to author |
| **Q-G6A-QUALIFICATION** | Encode the **ruled further qualification** to G6(a): it binds on kathekon-engaged loops opened by **consequential actions on the product or its governing documents**, not on loops opened by the agent's own **protocol-required record-keeping**. *"Whether the protocol's own requirements can generate a do-not-proceed condition on the act of following the protocol. They should not."* | `code-elevated` | ruled, **unbuilt** |
| **Q-D2-ENGINE** | The D2 correction at the engine (`computeVirtueDomains`), landing **mid-window**, window keeps running after. Needs the waiver mechanics + the SHA pin surviving. | `code-critical`, founder waiver | **BLOCKED on baseline 2 → 5** |
| **Q-RECORDS-FOLD** | Records fold + governing-surface edits on election (AC5 per F-F; `environmental_context` per F-B; retire spent prompts; correct CLAUDE.md's now-false S9 stdin-dump block). *(Was queue-row "S8".)* | `governance` | batch into the next production-changing sitting, **never alone** |

### C. Held / gated — do not open

Slice 5 (C3 clock → ~2026-11-24, then the hard C2 re-check); IW-7 opening 2; Spec 4 dispersion (M-4
restoration); the hegemonikon uniformity family (unruled); melete; the Prudence Stage-3 scoping
session; Layer 3 activation (`SUBSTRATE_LAYER3_ENABLED` unset; O-C Gate 3 CLOSED); R11 (the founder
opens); Attic/Cellar heuristics; the `agent_hold_observations` sweep (HOLD by ruling until P6 says
the buffer is finished with); the `stoic-brain.json` citations (**HOLD** — the freeze on
`stoic-brain.ts` is unconditional and SHA-pinned); Resend / ST7; AE-3; **the S11 flip; the 0h call;
weights.**

### D. Longer-tail named-unbuilt (re-derive before acting)

The view-grants migration + the escalated view; `triggered_rules` encryption + M-5(b); reflect
`route.ts:660` `user_id` (**founder-ordered first**); close-hook case 2; R3 (`/api/reason` status
masking; input-cap steps 2/3); R7 (permission-scrutiny 14–17); C5 (Stoa reactivation guard, ruled
M3); the `/api/score` local-storage bypass; `founder_conversations` LOWs; the `mentor_profiles`
decrypt failure; the `api-docs/page.tsx` assessment rewrite; the CLAUDE.md dated bullets (**never
rewritten — annotated only**).

### E. Future milestones — the forward map

These are **sequenced dependencies, not dates.** Nothing here is scheduled; each is gated.

| Milestone | Gate | Currently |
|---|---|---|
| **M1 · Window baseline reached** | 5 ordinary days with ≥1 consult record | **2 of 5.** Cannot advance on Bash-authored sessions (fact 5) |
| **M2 · D2 engine correction lands** | M1 | blocked on M1 |
| **M3 · Option C′ decided** | Conditions 1 ✅ + 2 + 3 | C2 earliest 2026-09-09 |
| **M4 · Pre-flip report complete** | M1 + `Q-PREFLIP-REPORTS` + `Q-G6A-QUALIFICATION` + the false-hold rate + guard-availability bound (F-3′ threshold, a P6 design question, **still unset**) | not started |
| **M5 · The S11 readiness standard re-examined** | M4 + the four-part standard: ≥7 days representative MEASURE · all four cardinal domains evaluated, ≥2 above conservative · a **measured** false-hold rate · G6(a) qualification encoded | **REFUSED** — and the assent is re-confirmed at flip time regardless (PR7) |
| **M6 · Provenance slice 5** | C3 soak → **~2026-11-24**, then the **hard** C2 re-check | clock only |
| **M7 · Standing-runner v1 build brief** | founder elections (R9 §16) + **a harness identity with an examined record for the v1 executing actor** — the binding prerequisite three findings converge on | founder's to open |
| **M8 · Option S data → M/W/S election + R8-D7 sampling policy** | `Q-OPTION-S-RUN` (F-I first) | item-level gate; everything else ungated |
| **M9 · The 0h launch call** | all current tasks complete (2026-08-22 sequencing); P2's verdict + the founder's three branches | **the founder's, and only the founder's** |
| **M10 · Weights-tier use** | GS-CYB-1's two-condition gate + the Prerequisite Criterion | **BLOCKED.** No public claim |

---

## Running a side arc in parallel — the four constraints that actually bind

A parallel arc is not forbidden. Four things bind it, and only these:

1. **The byte-identity guard is ARMED** (because the window is running). **No file matching
   `GUARD_RE` may sit modified in the working tree** — `api/reason`, `api/guardrail`,
   `guardrail-sandwich`, `sage-reason-engine`, `reasoning-receipt`, `translation-sandwich`,
   `/substrate/`, `trust-core`, `kathekon-engagement`, `false-hold`, `harness/gate1`,
   `layer1-extractor`, `layer2-mechanisms`, `sage-reflect`, `stoic-brain`. **Two SHA pins**
   (`layer2-mechanisms.ts`, `stoic-brain.ts`) catch **committed** edits too, so a side arc cannot
   route around the guard by committing. Touching any of these needs a **recorded founder waiver for
   the named commit, guard LEFT ARMED, exception documented not encoded** — a silent commit
   exploiting the committed-edit gap is **FORBIDDEN**.
2. **Anything that could perturb the instrument must not run during the window.** The window measures
   `/api/reason` and `/api/guardrail` behaviour; a window spanning instrument edits measures neither
   state. A side arc on the **website product surface, human-practitioner tools, docs, governance, or
   anything outside `GUARD_RE`** is window-neutral and safe.
3. **Concurrency discipline, now with a collision on the record.** Path-scoped commits, always. Run
   `git status` whole. `ListAgents` at open. **A peer's push publishes your local commits.** With 11
   sessions open, a side arc adds surface area the mentor has already ruled against twice — the
   cheapest mitigation is to close idle peers first (F-E).
4. **Tool mode has a measurement consequence** (fact 5). A side arc authored with Write/Edit **adds
   consult records and can advance the baseline**; one authored with Bash adds nothing. Neither is
   wrong; the choice should be made on the task's merits and **disclosed**, never made *because of*
   its effect on the counter.

**What a side arc must not do:** open anything in list C; modify `classifyCaller`; touch the buffer;
"refresh" D6a's frozen runs; set or unset any production flag without the founder walking it; or
re-open a ruled question without attaching the prior ruling.

---

## Part C — The trust-layer harness + its capabilities

The 08-29 opener's Part C stands. **Deltas since:**

- **The window is running** and the byte-identity guard is armed with it (facts 1 and 7).
- **`caller_class` exists** on `false-hold-record-v5`, at a dated v4→v5 boundary, top-level (nesting
  in `signals` would re-hash the frozen buffer), **not** in `recordHash`, **not** ingested (the DB
  ingest maps an explicit column list and already omits every post-v2 field — **no migration is
  involved**). Two values only. **It measures null** (see Part B).
- **The guard disclosure has three segments** by ruling: post-boundary (review fleets excluded and
  counted), pre-boundary (size stated, composition declared unknown, **no rate computed**, reason
  stated), outage (excluded from both). **A retroactive classification pass is NOT owed.**
- **`GUARD-OUTAGE` records are excluded from the rate denominator**; the outage rate is reported
  separately on both sides. The consult side is outage-free **by construction** — verified at
  source 2026-09-08: in `at-action-hook.mjs` the `if (!r.ok)` outage branch logs `CONSULT-OUTAGE`,
  emits the fail-open note and `process.exit(0)`s **before** the `if (cfg.falseHoldCapture)`
  capture block is reached. Cited by structure, not line number — the numbers this window's
  records quote (704/747) have already drifted to 709/752.
- **Harness config** (keys read first-hand): `GATE1_FALSE_HOLD_CAPTURE=true`; `GATE1_TIMEOUT_MS=55000`;
  `GATE1_DEPTH=standard`; `GATE1_TELOS_LINE_ENABLED=true`;
  `GATE1_CLOSE_CONTENT_VARIATION_ENABLED=true`; `SAGE_GATE1_REFLECT_PERSIST_ENABLED=true`;
  `GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1`; agent `sagereasoning:s9-loop@v1`.
  `GATE1_ACTION_TEXT_MODE` absent (**composed** — lean mode is ruled **doctrinal**, not an
  operational preference). `GATE1_DEBUG` **absent, with no residue**.
- **Client:** Claude Code **`2.1.260`**, entrypoint `claude-desktop`. Note the two numbers that were
  being conflated: the **Claude Desktop app** is `1.46388.4` and is **not** the number any ruling
  refers to. `version` and `entrypoint` are fields on the **hook stdin payload** — read from the
  wire, never from a UI.

## Part D — Working inside the dogfooded harness (standing context)

- **The frame is ADVISE. The guard's deny is ENFORCE and is honored.** An **outage is not a deny** —
  read the grounds of every caution rather than flattening them by habit.
- **The at-action false positive is the measured class, not a malfunction.** A caution reading *"no
  kathekon factors were extracted"* on a read-only shell command is exactly what the window exists to
  count. Answer the elicitation genuinely; do not let it become ritual.
- **Under an ENFORCE deny, an agent once softened four phrases toward what the classifier would pass
  without deciding to** — the failure mode the instrument cannot see, because it keeps verdicts, not
  the drafts shaped to earn them.
- **Bash is dropped from the consult floor**; `Write`/`Edit`/`MultiEdit`/`NotebookEdit` are the
  consult surface. Bash denylist matches still produce guard records.
- **Never edit a `GUARD_RE` file without a recorded waiver. Never `git checkout --` an un-backed-up
  file. Back up before any truncating write.**

## Part E — Confirm the standard opening (state these, briefly, before the task)

1. Tier (0d-ii) and whether AC7 engages; model per AC1.
2. Hold-point: **0h HELD**; **S11 flip REFUSED**; **weights BLOCKED**.
3. Status vocabulary: `Scoped → Designed → Scaffolded → Wired → Verified → Live`;
   `Adopted / Under review / Superseded`.
4. **Window state re-derived by you, not quoted from here** — buffer size, window population,
   baseline days, both SHA pins, guard battery green.
5. `git status` whole; unpushed commits; **`ListAgents` peer count**.
6. Whether your task touches `GUARD_RE`. If it does and you have no recorded waiver, **stop**.

## Part F — Now state the task

**Everything above is preamble. Wait for the task.**

---

*End of the standing opener, Version 2026-09-08. Rewritten only at a grounding session, from primary
sources, carrying its as-of date. Every number in it is a claim to re-derive.*
