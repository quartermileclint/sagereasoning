# Memo: loop-engineering automation capabilities available to the IDEA loop's external runner

**Status: informational, not a ruling and not a scope document.** Offered to accompany `06-PLAIN-TEXT-MIRROR.md` when it goes to the mentor, per the founder's request. This memo does not amend the approved configuration shape, the approved shared-task-list shape, or any dependency-graph item. Nothing here is built or proposed to be built this session.

**What this is:** a survey of automation primitives available in the Claude Code harness this session runs in — distinct from SageReasoning itself — that bear directly on the already-ruled architecture ("the loop lives OUTSIDE SageReasoning's own servers... a calling process — the founder's Claude Code session, a dedicated harness, or a future purpose-built runner — holds the cycle state," `06-PLAIN-TEXT-MIRROR.md` §Sixth element). Two of the three named candidate runners are Claude-Code-shaped. This memo describes what that shape can and cannot currently do, so the mentor is weighing the ruled architecture against real tooling rather than an abstract "some external runner" placeholder.

---

## 1. Conflicts / questions to flag alongside the mirror document

**1.1 — `loopId` vs. `GeneratedCandidate.gapRef`'s `sessionId` component.** `gapRef` is formatted `{sessionId}:{cycleNumber}:{currentCircle}->{targetCircle}` (approved 2026-08-06) — `sessionId` there names the *examination* session on SageReasoning's side. `loopId` (added by the same day's ruling) names the *runner instance* on the external side. Nothing requires these to coincide, and depending on which runner mechanism is eventually chosen (below), they may or may not have a natural 1:1 relationship — a single Claude Code session issuing multiple SageReasoning consults across one IDEA loop cycle would have one `sessionId` per consult but one `loopId` for the whole run; a durable external harness spanning many Claude Code sessions would have one `loopId` but many `sessionId`s. Worth the mentor confirming these are deliberately independent identifiers before the generation step locks in how they compose.

**1.2 — the shared task-list shape (`SharedTask`, approved 2026-08-06) may be reinventing an existing tool rather than new infrastructure.** See §3 below — several already-connectable project-management systems satisfy every property the ruling required (shared, externally-readable, multi-writer, multi-reader) natively. This doesn't change the *ruling* (external to SageReasoning — confirmed either way), but it changes what "build the shared task list" means: a from-scratch store, versus a thin mapping layer onto an existing tool's API. Worth surfacing before any implementation session assumes the former.

**1.3 — `CronCreate`-class scheduling (the mechanism behind Claude Code's `/schedule`, see §2.2) is explicitly non-durable: session-only jobs, and recurring jobs auto-expire after 7 days.** This is a hard constraint the mirror document's "externally-driven" framing doesn't currently distinguish from a genuinely standing runner. If the founder's Claude Code session (or a scheduled-agent variant of it) is meant to be the *literal* runner named in the ruling, the mentor should know it cannot run indefinitely unattended — it needs periodic renewal, which either falls to the founder manually or needs its own small watchdog. This is not a reason to abandon the option; it's a property the mentor should weigh when judging whether "a future purpose-built runner" needs to be built as bespoke infrastructure sooner rather than treating Claude Code's own scheduling as sufficient long-term.

---

## 2. Automation primitives available in this harness, mapped to the ruled shape

None of the below is proposed as an immediate build. Each is named against the specific parameter or requirement it could satisfy, with its real constraints stated alongside — not oversold.

### 2.1 `/loop` (dynamic self-pacing, `ScheduleWakeup`-backed)

A running Claude Code session can re-invoke itself at a self-chosen interval (60s–3600s per wakeup, chained indefinitely by re-scheduling each time it fires) rather than a fixed cron tick. This maps closely onto the *reasoning* behind `minimumIncubationInterval` and `randomOffsetPercent`'s second purpose: the session can decide its own next-wake delay based on what happened in the cycle just closed (a genuine non-cron-tick incubation gap), and can vary that delay per invocation (a natural home for jitter) rather than being locked to a fixed external schedule. **Constraint:** requires the session to stay live between wakeups — it is not a fire-and-forget standing service, and the founder (or whoever owns the session) is the thing keeping it alive. Best fit for "the founder's own Claude Code session" as the runner, not for an unattended long-running harness.

### 2.2 `/schedule` (`CronCreate`-backed recurring/one-shot jobs)

Standard 5-field cron scheduling of a prompt, independent of any single session staying open. Maps directly onto `minimumInterval` as a cadence and, with an explicit off-tick minute choice, offers a crude form of the anti-synchronisation half of `randomOffsetPercent`'s purpose (though the harness's own small built-in jitter, up to 10% of the period, is not the same as the design-intent phantasia-variation half — that half is still generation-step content, per A.3 of the approved scope document). A per-run wall-clock guard inside the prompt itself (check elapsed time, self-terminate) would realise `maximumDuration`. **Constraint, confirmed directly from the tool's own description this session:** jobs are **session-only, in-memory, gone when the Claude session ends**, and **recurring jobs auto-expire after 7 days** regardless. This is the single most important fact for the mentor to have: `/schedule` is not durable standing infrastructure on its own. It is a real fit for a *bounded validation run* (e.g. the two-part IDEA-loop-extension validation condition already named in the dependency graph, item 9 — "at least one real production consult has fired... reviewed... no anomalous behaviour found" is exactly the shape of thing a 7-day-bounded scheduled job could produce evidence for) but not, as-is, for the loop's eventual standing operation.

### 2.3 `Workflow` (deterministic multi-agent orchestration)

Directly shaped like the already-ruled generation-step cost profile (`D-IDEA-LOOP-EXAMINATION-COST-RULED-NULL-CYCLE-2026-08-05`): "six candidates generated, one per heuristic... each passes through the guardrail shape only... the candidate with the highest proximity rating that also passes the novelty threshold receives the full examination shape." A `pipeline`/`parallel` script — one agent call per heuristic running concurrently, a filtering stage, a single escalation to full examination for the winner — is the canonical shape this tool is built for, and would let the six heuristic-candidates genuinely run in parallel rather than sequentially, shortening real cycle wall-clock time. **Named for whenever the generation step itself is built, not now** — this is implementation-mechanism information for that later session, not a change to anything already ruled.

### 2.4 `Agent` (subagent spawning) and `Monitor` (event-stream watching)

`Agent` is the lower-level primitive `Workflow` is built on — six parallel `Agent` calls, one per heuristic, is a workable substitute for the runner if it doesn't need `Workflow`'s full orchestration machinery. `Monitor` can watch a long-running cycle (or a `Bash`-run harness process) and emit one notification per event rather than requiring active polling — a plausible completion-signal mechanism for whichever runner shape is chosen, letting the founder (or a supervising process) be notified `maximumDuration` was hit, or a cycle closed, without watching the terminal continuously.

### 2.5 `TaskCreate`/`TaskList` — **explicitly NOT the shared task list; naming this to prevent confusion**

Claude Code's own `TaskCreate` tool is a single-session todo tracker — confirmed this session, from the tool's own description, as scoped to "your current coding session." It is not shared across agents, not externally readable by another process, and not multi-writer in the sense the friction-detection heuristic needs. Raising this only because the name is easy to conflate with the ruled `SharedTask` concept — they are unrelated, and nothing about Claude Code's own task list satisfies (or is meant to satisfy) the shared-task-list ruling.

---

## 3. A genuine simplification opportunity for the shared task list

The founder's Claude Code environment already has connector plugins listed for several real, multi-user, externally-hosted, multi-writer/multi-reader project-management tools — Linear, Asana, ClickUp, monday.com, Notion, among others (currently unauthenticated in this session, per the standing MCP-server list — connecting any of them is the founder's own action, outside what this session can do). Any one of these satisfies every property `D-IDEA-LOOP-FRICTION-DETECTION-SHARED-STATE-2026-08-05` named for the shared task list — shared, externally-readable, multi-writer, multi-reader — natively, as a mature product built for exactly that shape of coordination, rather than as new bespoke storage.

**Worth putting to the mentor directly:** does "the shared task list" mean a purpose-built store scoped to the IDEA loop's own vocabulary (the `SharedTask` shape as drafted, §B.3 of the approved scope document — `taskId`/`description`/`createdBy`/`status`/`frictionAssessment`), or would an existing PM tool's own task/issue shape serve, with `SharedTask` becoming a thin mapping spec (which fields of, say, a Linear issue map onto `status`/`frictionAssessment`) rather than a schema to build from scratch? The ruling already fixed *where* the list lives (external to SageReasoning); this is the next-layer question of *what* external thing it is, and it wasn't resolved by either ruling to date. Flagging it now, before any implementation session assumes the bespoke-store reading by default.

---

## What this memo does not do

- Does not change any ruled item — `loopId`, the external-only configuration ruling, the external task-list ruling, and `dependency_unavailable` all stand exactly as ruled 2026-08-06.
- Does not propose building any of the mechanisms named above. Proposes only that the mentor have this information in view when weighing how the ruled architecture gets realised.
- Does not touch C2/C1c, D4, the Stoa activation, or the generation step's own scope document (still queued, unblocked, not opened by this memo).

---

*Authored 2026-08-06, same day as the configuration/shared-task-list ruling, at the founder's request ahead of bringing `06-PLAIN-TEXT-MIRROR.md` to the mentor. Not itself a scope document — no decision-log entry is created for this memo unless the mentor's response warrants one.*