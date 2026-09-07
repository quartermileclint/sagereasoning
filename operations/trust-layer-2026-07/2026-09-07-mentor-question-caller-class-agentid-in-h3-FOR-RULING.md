# Mentor question — `caller_class`: a fourth field appeared in H3's own wire, and it discriminates directly

**Session S8, 2026-09-07. Answers the Option D ruling's owed bounded investigation
(`2026-09-07-mentor-ruling-caller-class-option-D-verbatim.md`, §"What Option D requires
operationally", item 3): *"does `SubagentStart` supply a signal that correlates to an H3 record via
a key OTHER than session ID?"***

**The answer is YES, but not in the shape the question anticipated, and that shape mismatch is why
this is put to you rather than actioned unilaterally — the ruling's own words: "If yes, Option C
becomes viable and the ruling is revisited."**

---

## What was tested, and how

Per the ruling's own method requirement — *"the wire shape must be OBSERVED, not inferred from SDK
types"* — the founder set `GATE1_DEBUG=1` (a recorded founder waiver on the founder's own live
harness config; the founder directed the AI to perform the edit; scope: one key, no guarded file,
reverted the same session with a SHA-verified restore from a scratchpad backup, never `git
checkout`). Two live captures of `PreToolUse` stdin (H3, the at-action hook) were taken and diffed
field-by-field:

1. **Fired inside a genuine subagent** (a spawned worker whose only tool use was one `Bash echo`,
   confirmed by `tool_uses:1` in the spawn result and by the subagent's own transcript at
   `<session>/subagents/agent-<id>.jsonl`, `isSidechain:true`).
2. **Fired at the top level** (the orchestrating session's own `Bash echo`, immediately after, same
   session, same tool, same matcher).

**The diff, complete:**

| field | subagent-fired H3 | top-level-fired H3 |
|---|---|---|
| `session_id` | parent's session id | parent's session id (**same value**) |
| `transcript_path` | parent's transcript path | parent's transcript path (**same value**) |
| `cwd`, `effort`, `hook_event_name`, `permission_mode`, `prompt_id`, `scratchpad_dir`, `tool_name`, `tool_input`, `tool_use_id` | identical shape | identical shape |
| **`agent_id`** | **present** (`"af66a9042661cfc48"`) | **absent — key does not exist** |
| **`agent_type`** | **present** (`"general-purpose"`) | **absent — key does not exist** |

Both established findings from ruling 3 and the Option D ruling **hold, re-confirmed on the current
client (2.1.260)**: `session_id` does not discriminate; `transcript_path` does not discriminate. No
new evidence contradicts either.

**⚠ Provenance of the two captures, made explicit (PR19 finding, folded):** `maybeDebugDump` keys its
output file by **event name** (`PreToolUse-stdin.json`), and H2 (`subagent-framing-hook.mjs`, matched
on `Task|Agent`) and H3 (`at-action-hook.mjs`, matched on `Bash|Edit|Write|MultiEdit|NotebookEdit`)
both register under the identical event name `PreToolUse`. **The dump filename alone cannot prove
which hook wrote a given capture.** What proves it here: both captures carry `"tool_name":"Bash"`, a
value H2's matcher structurally can never see (H2 only fires when the tool is `Task` or `Agent`). So
these two captures are provably H3's, by content, not by filename — a distinction worth stating
because a future capture on a different tool matcher would need the same check re-done, not assumed.

**What is new: H3's own `PreToolUse` payload now carries `agent_id`/`agent_type` directly, whose mere
presence discriminates a subagent-fired invocation from a top-level one, with no correlation to any
other hook's record required.**

This was not present in the wire shape the project's standing memory records from the 2026-06-20
raw-stdin capture (`{session_id, transcript_path, cwd, permission_mode, hook_event_name,
tool_use_id}` — no `agent_id`). The client has moved since; the wire changed under the harness
without any harness-side edit.

---

## Why this does not answer the literal question as asked, and why that matters

The bounded question presupposed the shape of the fix: `SubagentStart` writes a marker keyed on
something both hooks can see; H3 looks the marker up. That presupposition is now moot — **if
`agent_id`'s presence is itself sufficient, no `SubagentStart` marker, no correlation key, no second
hook registration, and no `hooks.json` edit are needed at all.** `classifyCaller` could be changed
from reading `transcript_path` to reading `typeof event.agent_id === "string" && event.agent_id !==
""`, entirely inside `false-hold-capture.mjs` and `at-action-hook.mjs` — files already inside
`GUARD_RE`, but requiring no NEW guarded file and no harness re-registration.

Put plainly: **the mechanism the ruling asked to be tested (Option C, `SubagentStart` correlation)
was superseded before the test could confirm or deny it, by a simpler mechanism (Option C′? — H3
self-discrimination) discovered in the course of testing it.**

Two reasons this is not actioned unilaterally, consistent with the task's own bound ("Do NOT build
the mechanism this session. Determine whether it is possible.") and the founder-relay instruction:

1. **The observation is a snapshot of one client version on one machine.** Whether `agent_id`'s
   presence-at-H3 is a stable contract of the Claude Code command-hook interface, or an
   implementation detail that could vanish on the next client update the way its ABSENCE was itself
   an implementation detail until now, is unverified. The June capture and this capture already
   disagree once.
2. **The ruling's own governing principle (§5(d), carried into Option D) is that a classifier which
   misflags a live-agent record is "invisibly destructive in the direction that matters most."** Before
   building anything against `agent_id`, the same false-positive check Option B (spawn-depth) failed
   needs to be run against this candidate: does the harness's own PR19 review-fleet architecture ever
   have the PARENT session act with an `agent_id` set (e.g., during nested delegation, or a
   host-session/child-session split — `CLAUDE_CODE_CHILD_SESSION` was observed as `1` on this
   session's own environment, a fact this investigation did not chase down because it fell outside
   the bounded question)? That needs its own controlled measurement before the mechanism is trusted,
   the same discipline Option B was held to.

---

## The question put to you

Given `agent_id`'s presence at H3 directly discriminates subagent-fired from top-level-fired
invocations on the currently-observed wire (2.1.260), superseding the `SubagentStart`-correlation
mechanism the Option D ruling's owed investigation was scoped to test:

1. **Does this reopen ruling 3's exclusion as viable** (i.e., is Option D's "unimplementable on this
   harness as wired" now false, pending the controlled-conditions check named above), or does the
   single-client-version, single-session nature of this observation mean it stays a candidate rather
   than a finding, the same status the ruling gave Option C itself?
2. **If it is viable in principle, what is owed before it may be built** — a false-positive check
   against ground truth analogous to what falsified Option B (spawn-depth), a second live capture on
   a separate day/session to rule out a session-specific artifact, or something narrower?
3. **Does the segment-1 clause (amended by the Option D ruling) need a further amendment now**, or
   does it stand exactly as amended until a build actually lands — i.e., does a candidate mechanism,
   however promising, change what the disclosure may currently claim?

**Nothing has been built.** `classifyCaller` is unmodified; `at-action-hook.mjs` and
`false-hold-capture.mjs` are byte-unchanged this session; the amended segment-1 clause stands exactly
as the Option D ruling left it. The window keeps running throughout.

---

# Two further questions, surfaced by this session's own PR19 and NOT part of the owed investigation

**Both were found by reviewing this session's records, not by the investigation itself. Neither is
urgent in the sense of blocking anything. Both are put here rather than held, because each is a
question of principle about what the window MEASURES, and both bear on the S11 flip the window
precedes. Nothing has been decided on either.**

---

## Question A — the baseline moved, and the day that moved it contains no engineering work

**The fact.** The five-day baseline threshold (part (1) of the readiness standard) moved from **1 of
5 to 2 of 5** during this session. The day that moved it, `2026-09-07` UTC, carries **12 consult
records. Every one of them is a `Write` or an `Edit`, and every one is this session authoring its own
governance documents** — the mentor question you are reading, the scope record, the close, the
decision-log and register entries. Not one came from engineering work on the product.

Derived from the buffer directly, not summarised:

```
2026-09-07 consult records, by tool:
  09:08:48 Write   09:10:00 Write   09:13:03 Edit    09:20:06 Write
  09:20:57 Write   09:29:33 Edit    09:30:39 Edit    09:36:17 Edit
  09:37:35 Edit    09:38:41 Edit    10:53:21 Edit    10:54:15 Edit
```

Across the whole window there are 15 consult records; **12 of them (80%) are this session's own
record-keeping.** The mechanism is not a defect: the consult floor is
`Write`/`Edit`/`MultiEdit`/`NotebookEdit`, and `Bash` is deliberately dropped from it, so a session's
*tool mode* decides whether its work enters the measured population at all. That property has been
carried as a named, unresolved item across several closes. This is the first time it has actually
moved a gate.

**Why this is a question of principle and not a counting question.** Under the rule as written — days
with ≥1 consult record count — the day plainly counts, and we have not filtered it. But readiness
standard part (1) does not only require seven days; it requires *"≥7 days live MEASURE over a
**representative** action distribution."* A day composed entirely of markdown authoring may satisfy
the counting rule while failing the representativeness clause, and the two could diverge silently for
the whole window.

**Put to you:**

**A1.** Does a day whose consult records are entirely the agent's own record-keeping count toward the
five-day baseline on the same footing as a day of engineering work — or does part (1)'s
"representative action distribution" clause require some qualification of which days count?

**A2.** If such days count but the distribution matters, is the right remedy a **disclosure of
composition** on the baseline (the shape you ruled for the guard population under Option D — name
what the population is made of rather than filter it), or something stronger?

**Our recommendation, offered as a position and not a presumption:** count the day, disclose the
composition. Filtering days by the provenance of their records would be a post-hoc narrowing of a
population mid-window, which is the move ruled against twice already — once on retroactive
`caller_class` classification, and again in Option D's *"do not claim a classification you cannot
make."* The consistent treatment is the one Option D chose for the guard population: state plainly
what the days are made of. **But whether a documentation-only day is admissible evidence for part (1)
at all is a question about the standard's meaning, which is yours and not ours.**

---

## Question B — twelve correction loops opened this session, eleven abandoned, and all met G6(a)'s threshold

**The fact, taken from the harness's own loop-state file rather than from the transcript — and note
the sequence, because it changed while this section was being written:**

At the moment this section was drafted, the state file read:

```
openLoop:      7aea1759-d7f6-4724-b21a-deee6000cdcc  (depthTier: standard)
closedRefs:    []                                     ← zero closed, all session
abandonedRefs: [11 items]
```

**The act of writing this very section then closed that loop.** The write carried `prior_feedback` at
the same depth, the re-examination the loop was waiting for actually occurred, and the harness
recorded `The open examination loop is now CLOSED (the correction was re-examined and cleared)`.
Re-read immediately after:

```
openLoop:      None
closedRefs:    ['7aea1759-d7f6-4724-b21a-deee6000cdcc']   ← one, the first of the session
abandonedRefs: [11 items]
```

**Tally as at `2026-09-07T11:00Z`: twelve loops opened, eleven abandoned before re-examination, one
closed.** Stated as a snapshot deliberately — this is a live counter, and writing *this correction*
opened a thirteenth. That is not a defect in the figure; it is the same structural pattern the
question is about, still running while the question is being asked. The count is not chased further,
because doing so would open a fourteenth and a fifteenth without changing anything you need to rule
on. The correction is left visible rather than tidied away, because the mechanism by which the
twelfth closed is the most useful thing in this question.

The pattern for the eleven was structural rather than accidental: each `Write`/`Edit` drew a
redirection, and the next `Write`/`Edit` opened a fresh one before the previous could be re-examined,
so the chain never terminated. **The twelfth closed because the session finally did something
different — it stopped producing new artifacts and instead re-examined its own prior reasoning at the
same depth.** That is the closure condition working exactly as designed. It suggests the eleven
abandonments are not evidence of a broken mechanism but of a *working* mechanism measuring a session
that never paused to re-examine until the end.

**Why this reaches G6(a).** The readiness standard's part (4) qualification limits G6(a) to
*"correction loops opened by a verdict meeting a kathekon-engagement threshold"* — precisely so the
measured false-positive class (a "contrary; no kathekon factors detected" verdict) can never bind.
**That qualification does not exclude these loops.** The frames carried
`is_kathekon=true`, quality `moderate` or `strong`, with `role obligation engaged` and a justification
offered. They are kathekon-engaged by the predicate's own reading.

So on this session's evidence: **had G6(a) been enforcing, an ordinary records-and-review session
would have hit a do-not-proceed condition twelve times**, on actions that were in every case the
fitting thing to do — writing the record the protocol requires.

**Put to you:**

**B1.** Is a session of this shape — one that produces many sequential documents, each drawing a
kathekon-engaged redirection that the next document supersedes — a class G6(a) should bind on, or one
it should not?

**B2.** If it should not, is the kathekon-engagement qualification sufficient as it stands (and this
is simply a MEASURE-mode observation with no consequence), or does G6(a) need a further qualification
— for instance distinguishing a loop opened by an agent's own record-keeping from one opened by a
consequential action on the product?

**B3.** Does this bear on readiness part (3) at all — i.e. should a "loops opened vs. loops closed"
figure be reported alongside the false-hold rate before the flip, rather than left to be discovered
at flip time?

**Our recommendation, again a position and not a presumption:** report it, do not act on it. Nothing
bound; this is MEASURE working exactly as intended, and the finding is the kind the window exists to
surface. But it is better in front of you now than found at the moment of the flip. We have **not**
proposed a mechanism, because the last time this project reasoned from a plausible-looking marker to
a classifier (spawn-depth) it produced something you correctly ruled *"invisibly destructive."*

---

**Nothing in either question has been built, changed, or acted on.** No code, schema, flag,
credential or public surface moved this session. The window keeps running; the guard stays armed;
`layer2-mechanisms.ts` is byte-unchanged. Baseline stands at **2 of 5** as measured, with its
composition disclosed above rather than smoothed over.
