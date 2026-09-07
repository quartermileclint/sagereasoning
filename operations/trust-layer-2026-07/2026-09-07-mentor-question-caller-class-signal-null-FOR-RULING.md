# Mentor question — `caller_class` was built, and the signal it rests on measures NULL

**Raised at session S7, 2026-09-07 AEST, HOURS AFTER the ruling it concerns
(`2026-09-07-mentor-ruling-caller-class-schema-boundary-verbatim.md`), by the session that executed
that ruling.**
**Status: OPEN. Not decided in-session, deliberately.**

**This document reports a measurement that falsifies a premise of the ruling it implements, and asks
what follows. It argues each option at full strength and chooses none.**

---

## 1. What was built, and what happened when it ran

Ruling 3 (2026-09-07) required that review-fleet subagent records be excluded from the guard
population, and specified the mechanism: *"if the session ID alone is insufficient, a `caller_class`
field on the record is the right addition."* Session ID is insufficient — subagent records carry the
**parent** id.

`caller_class` was built, at a dated `v4 → v5` boundary, and landed (`97320a0`). It reads
`transcript_path` and emits exactly two values: **`"subagent"`** on a positive structural observation
(a `/subagents/` path segment — the shape a subagent's own transcript is written to, live-confirmed
2026-06-21) and **`"unknown"`** for everything else, including a session-shaped path.

**Then it ran, under two review fleets, against its own diff.**

> **20 post-boundary records. Every single one reads `"unknown"`. Zero read `"subagent"` — including
> records this session can prove were fleet-generated.**

At least one is unambiguous: `git diff -- harness/ website/scripts/ > /tmp/fh_diff_full.txt`, a command
the live agent never issued. It was written by a review-fleet subagent, it fired the guard hook, and
`caller_class` recorded `"unknown"`.

**The wiring is not broken.** An end-to-end test drives the real hook with a genuine
`/subagents/`-shaped `transcript_path` and produces `"subagent"` correctly; reverting the wiring turns
that test red. The mechanism works. **What does not happen is the wire supplying the input** — the
`PreToolUse` hook, fired inside a subagent, receives a path with no `/subagents/` segment.

---

## 2. What this falsifies

The ruling's segment-1 clause reads, verbatim:

> *"Post-boundary records — `caller_class` field present at capture; **live-agent and review-fleet
> records distinguished at source**; rate computed over live-agent records only; review-fleet count
> disclosed separately."*

**"Distinguished at source" is, on this evidence, not currently achievable.** The field is present at
capture. It distinguishes nothing. The rate is therefore computed over "everything not positively
identified as a subagent" — which today is everything.

**The design is not thereby wrong, and this is the part worth stating plainly.** Because
`caller_class` refuses to emit a `"live_agent"` value, the field reads `"unknown"` rather than
falsely reading 100% clean. Had the earlier draft shipped — which did emit `"live_agent"` for a
session-shaped path — the record would now assert *"no contamination found"* when the truth is *"no
signal was ever available"*. The two-value asymmetry did the work it was built for. **But it has
converted a false claim into an honest one, not into a working exclusion.**

---

## 3. The alternatives, and what is known about each

### Option A — accept the null; keep the field; disclose a standing zero

Change nothing mechanically. The exclusion count stays 0, disclosed as a lower bound, with the measured
null result stated on the figure (this is what shipped).

### Option B — a spawn-depth marker (H2/H5)

**Structurally available, and verified at source.** The harness registers `PreToolUse` on `Task|Agent`
(H2, fires in the parent *before* dispatch) and `PostToolUse` on `Task|Agent` (H5, fires in the parent
*after* return). H2 could increment a marker, H5 decrement it, and H3 read it: "a subagent is in
flight, therefore this action is probably a subagent's."

**Its failure mode is not theoretical, and this session measured it.** In one observed fleet window,
12 fleet records and **2 parent records interleaved** — record #235 (a live-agent action) sits strictly
between #234 and #236, both fleet. A spawn-depth marker would have caught 12 of 12 fleet records **and
misclassified that genuine live-agent action as review fleet.** With concurrent fleets (this session
ran up to 16 agents at once) the parent is *routinely* acting inside the window.

### Option C — a different hook layer

`SubagentStart` **does** fire for subagents and its command-hook stdin carries **`agent_id` and
`agent_type`** — verified by raw-stdin capture 2026-06-20 (memory `claude-code-subagent-hook-contract`).
It is not registered in this harness, it cannot block, and **whether a marker it wrote could be
correlated to an H3 record is unverified** — H3 receives the parent's `session_id`, so the correlation
key is exactly the open problem. This is a candidate requiring investigation, not a solution in hand.

### Option D — declare the guard population structurally unable to satisfy ruling 3

Record that the exclusion is correct in principle and unimplementable on this harness as wired, and
carry that as a disclosed limit on the guard disclosure rather than as work.

---

## 4. The arguments

**For A (accept the null).** The ruling's own reasoning in §5(d) of the prior question was that a
classifier which *"misflags live-agent records"* is *"invisibly destructive in the direction that
matters most"* — it removes the very observations the measurement exists to capture. Option B does
exactly that, and this session has now measured that it would. A is the only option that adds no false
exclusions. An exclusion that never fires is honest; an exclusion that fires wrongly is not.

**For B (spawn-depth).** A is an exclusion in name only: ruling 3 said the population *"should contain
only records where the live agent was the actor"*, and under A it demonstrably does not — 12 known
fleet records sit in the population right now. B is the only option that actually removes them. The
misclassification cost is bounded and *measurable* (the marker's own state says when it is uncertain),
whereas A's contamination is unbounded and invisible. And the error direction can be tuned: a marker
that excludes only when exactly one subagent is in flight and the parent has been idle would trade
recall for precision.

**For C (different layer).** Both A and B accept the current wire as fixed. If `SubagentStart` can
supply a correlatable identity, the distinction becomes real rather than inferred, and ruling 3's
mechanism works as written. It is the only option that could satisfy *"distinguished at source"*
literally. Its cost is investigation into an unregistered hook, and it may simply not correlate.

**For D (declare it unimplementable).** The cleanest honesty. A and B both leave a reader believing the
guard population is being cleaned when it is not, or is being cleaned wrongly. D says the thing that is
true and stops there — consistent with the ruling's own preference for *"naming the situation plainly"*
over both discarding data and classifying it by guess.

---

## 5. What is NOT in question

- **The consult population is unaffected.** No subagent has ever produced a consult record; the gated
  within-consult measure — part (3)'s actual denominator — carries none of this.
- **The pre-boundary ruling stands.** Post-boundary only; no retroactive classification. That is
  settled and was executed.
- **`classifyCaller` needs no code change under any option.** It correctly reports what it is given.
- **Nothing here bears on the S11 flip, the weights, or the 0h call.**

---

## 6. What the answer decides

1. Whether ruling 3's exclusion is implemented, disclosed-as-null, or declared unimplementable.
2. Whether a mechanism that trades false exclusions for real ones (B) is acceptable, given §5(d)'s
   stated preference against exactly that trade.
3. Whether investigation into `SubagentStart` (C) is owed as work.
4. Whether the segment-1 clause *"live-agent and review-fleet records distinguished at source"* should
   be amended to match what the instrument can actually do.

**A note on the asymmetry between this question and the last one.** The previous question asked what to
do about records already captured. This one asks what to do about records *not yet captured* — the pool
keeps growing under Option A (the founder elected to continue PR19 fleets as structured), and every one
of those records is now post-boundary, carries a `caller_class`, and is nonetheless unclassified.
