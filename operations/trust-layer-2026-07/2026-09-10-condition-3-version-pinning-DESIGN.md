# Condition 3 — the client-version pin and its fallback: DESIGN (nothing built)

**Authored 2026-09-10 ~05:0x AEST (`date`) = 2026-09-09 ~19:0x UTC.**
**⚠ THE AEST AND UTC DATES DIVERGE FOR THIS SESSION.** The machine's local day had already rolled to
2026-09-10 while UTC was still 2026-09-09. This file is named and dated from local `date`, per the
house rule and the immediate predecessor's convention; every *window* figure below is bucketed by
**UTC**, because `capturedAt` is UTC. Do not reconcile the two by assumption.

**Session:** `76d3b72c-e7c9-4ff6-b5c3-0fb7b4fce2e5`. Client `2.1.260`, entrypoint `claude-desktop`
(re-derived first-hand this session — see §2.1, not quoted from a prior record).

**STATUS: DESIGN ONLY. NOTHING WAS BUILT.** `classifyCaller` is byte-unchanged;
`false-hold-observation-report.ts` is byte-unchanged; no `GUARD_RE`-matched path was modified. This is
verifiable from `git diff --stat`, not merely asserted here.

**EVERY NUMBER IN THIS FILE IS RE-DERIVED THIS SESSION.** Where a figure differs from a prior
session's, both are stated.

---

## 0. What this session was asked, and what it found

Condition 3 of the 2026-09-07 five-question ruling, verbatim:

> *"Client version pinning in the disclosure. The Option D ruling's amended segment-1 clause must note
> the client version (2.1.260) at which `agent_id` was first observed. If the mechanism is built and
> the client updates, the harness must detect the field's absence and fall back to `unknown` rather
> than silently misclassifying. This is not a build instruction — it is a condition on what the build
> must include when it lands."*

The session produced a design. It also produced **one empirical finding that falsifies the obvious
implementation**, and that finding is the most useful thing here:

> **A client version read from the *head* of the transcript is wrong. 17 of 400 transcripts on this
> machine (4.25%) carry MIXED `version` values — a session that straddles a client update writes lines
> under both. TWO of them straddle `2.1.258 → 2.1.260`, the exact boundary this condition is about (re-verified: `529bff0d…` and `aa4c27d7…`).**

A head-read returns the version in force when the session *started*. If a session begins on the pinned
version and the client updates mid-session, a head-read reports the pinned version and **the gate
passes while the live client has moved on** — which is precisely the silent misclassification the
ruling forbids. §3.2 gives the corrected mechanism.

---

## 1. The two requirements inside Condition 3, which are commonly conflated

The clause carries **two separable requirements**. Reading them as one produces a weaker build.

**(3a) A DISCLOSURE requirement.** The amended segment-1 clause must *note* the client version at which
`agent_id` was first observed. This is a static historical fact — `2.1.260` — and requires no runtime
mechanism at all. Draft wording: §5.

**(3b) A RUNTIME FALLBACK requirement.** *"the harness must detect the field's absence and fall back to
`unknown` rather than silently misclassifying."*

Note what (3b) says literally: detect **the field's** absence — the field being `agent_id`, not the
version. Read strictly, (3b) is satisfied by a field-presence check alone, with the version appearing
only in the disclosure. The section is even titled "Client version pinning **in the disclosure**."

**This design deliberately does more than the literal reading, and §2 argues why the literal reading
is insufficient against the ruling's own governing principle.**

---

## 2. Why a field-presence check alone is not enough

### 2.1 The three failure modes, enumerated

Option C′ classifies: `agent_id` **present** ⇒ subagent; **absent** ⇒ live agent (licensed by
Condition 1's negative result — a top-level session's H3 stdin never carries `agent_id`).

| # | What the client does | Field-presence check alone | Version+entrypoint gate |
|---|---|---|---|
| 1 | Update removes `agent_id` | absent ⇒ `unknown` ✓ safe | gate fails ⇒ `unknown` ✓ safe |
| 2 | Update leaves `agent_id` unchanged | classifies ✓ correct | gate fails ⇒ `unknown` — *safe but lossy* |
| 3 | **Update sets `agent_id` on top-level sessions too** | **present ⇒ "subagent" — MISCLASSIFIES** | gate fails ⇒ `unknown` ✓ safe |

**Mode 3 is the dangerous one, and only the version gate catches it.** A field-presence check cannot
distinguish "present because subagent" from "present because the semantics changed."

### 2.2 Why mode 3 is the mode that matters

The Option D ruling's own §5(d) governing principle:

> *"a classifier that misflags live-agent records is invisibly destructive in the direction that
> matters most — it removes the very observations the measurement exists to capture."*

Mode 3 misflags live-agent records **as subagent**, so the exclusion removes them from the rate. It is
exactly the failure the ruling names, arriving by a different route than Option B's spawn-depth. A
build that guards only against mode 1 leaves the ruling's own stated hazard open.

**Conclusion: gate on version AND entrypoint AND field presence, AND-ed, with `unknown` on any failure.**
Mode 2's lossiness is the correct price — it degrades to the status quo (Option D), never to a false
claim, and it forces a deliberate human re-verification before the pin is bumped.

---

## 3. The mechanism, concretely

### 3.1 Where the version comes from — and where it does not

Established first-hand this session by key-list inspection of already-captured hook payloads (no new
capture was taken; these are the existing dumps):

| field | `PreToolUse` (H3) | `PostToolUse`/`Stop` (H4) | `UserPromptSubmit` (H1) |
|---|---|---|---|
| `version` | **ABSENT** | **ABSENT** | **ABSENT** |
| `entrypoint` | **ABSENT** | **ABSENT** | **ABSENT** |
| `transcript_path` | **present** | **present** | **present** |
| `session_id` | present | present | present |

Full H3 key list as observed: `cwd, effort, hook_event_name, permission_mode, prompt_id,
scratchpad_dir, session_id, tool_input, tool_name, tool_use_id, transcript_path`.

This confirms the Condition-2 session's correction of the S10 premise: **`version`/`entrypoint` do not
ride the hook payload.** They ride the transcript, which is reachable only via `transcript_path`.

**So a runtime version read means the hook opens and parses a file.** That is a materially heavier
design than reading a field in hand, and it is the only design available.

### 3.2 The read: TAIL, not head — the corrected mechanism

Measured this session across 400 transcripts (top-level and `subagents/`) in
`~/.claude/projects/-Users-clintonaitkenhead-Claude-work-PROJECTS-sagereasoning/`:

- 400 transcripts carry ≥1 top-level `version` key.
- 16 distinct versions across the corpus (`2.1.209` … `2.1.260`).
- **17 transcripts (4.25%) carry MORE THAN ONE version**, e.g. `['2.1.258','2.1.260']`,
  `['2.1.241','2.1.246']`, `['2.1.229','2.1.234']`.
- **Subagent transcripts DO carry `version` and `entrypoint`** (sampled `agent-*.jsonl`: 72/72 lines,
  `2.1.247` / `claude-desktop`) — so the read works on both call paths.

Mixed-version transcripts are **not an edge case at 4.25%**, and the pinned boundary itself appears in
the data. Therefore:

> **The version in force at the moment a record is written is the LAST version-bearing line of the
> transcript, not the first.** Read the tail.

**Specified read:**

1. Take `transcript_path` from the hook payload. If missing / not a string / not readable ⇒ `unknown`.
2. Read at most the final **64 KB** of the file (bounded; the transcript is ~1.8 MB after ~170 lines,
   so 64 KB comfortably spans several recent lines).
3. Scan lines **backwards**; parse each as JSON; take the **first** line found carrying a top-level
   `version`. Read `entrypoint` from that same line, so the two always come from one observation and
   cannot be skewed relative to each other.
4. If no version-bearing line is found in that window, or nothing parses ⇒ `unknown`. **Do not widen
   the window to hunt** — an unbounded backward scan on a large file inside a per-tool-call hook is
   the wrong trade, and the safe answer is already available.

**Caching.** Do **not** cache the version for the life of the session: the mid-session-update case is
exactly what a session-lifetime cache would mask. If a cache is wanted, key it on the transcript's
`(size, mtime)` and invalidate on change. **Recommendation: no cache in v1.** The read happens only
when a record is about to be written (222 guard records across four UTC days in this window), not on
every hook fire — the cost is negligible and a cache adds a staleness failure mode to a mechanism
whose entire purpose is detecting staleness.

**⚠ ADVERSARIAL FINDING, this session (self-review under Sonnet 5): the 64 KB bound is NOT
comfortably larger than worst-case inter-version-line spacing, and the design draft above overstated
this before the claim was checked against real data.** Measuring this session's own transcript
directly: the single largest line is **1,142,339 bytes** (an `attachment`-type line, over 1.1 MB) —
17x the proposed window — and it happens to be the one 4.25%-class transcript boundary this design is
built around checking. **The reason the mechanism still works in practice, verified on this file, is
that the giant line ITSELF carries a `version` key** — attachment lines are stamped like every other
line — so a backward scan finds it on the very first line inspected regardless of size. Version-density
across this transcript is 192/245 lines (≈78%), so a tail scan is very likely to hit a version-bearing
line within a few KB in the common case. **But "very likely" is not "guaranteed", and this design's
original wording claimed a guarantee it had not verified.** A future build must either (a) prove every
line-type structurally carries `version` (not yet done — only sampled, not exhaustively confirmed
across line `type`s), or (b) treat a scan that exhausts the 64 KB window without finding a
version-bearing line as its own explicit case, falling back to `unknown` — which the conditional in
§3.3 already does by construction (no version found ⇒ `unknown`), so **the safety property holds
regardless of window size**; only the *frequency* of falling back to `unknown` on a technically-live
wire is at stake, not correctness. Recommendation unchanged (no cache), but the "comfortably larger"
language is retracted as an overclaim not backed by the data it should have been checked against
before being written.

**Placement.** The read belongs in the capture layer at record-build time, not in `classifyCaller`.
`classifyCaller` should stay a pure function of its arguments — that purity is why the current
docblock can honestly say it "correctly reports what it is given." The caller passes it the already-read
values.

### 3.3 The exact conditional

```
PINNED_VERSION    = "2.1.260"      // the version at which agent_id was first observed (S8/S9)
PINNED_ENTRYPOINT = "claude-desktop"

classifyCaller({ transcriptPath, agentIdPresent, runtimeVersion, runtimeEntrypoint }):

  // Gate — every clause must hold, or the answer is `unknown`.
  if (runtimeVersion    !== PINNED_VERSION)    return "unknown"   // client moved; semantics unverified
  if (runtimeEntrypoint !== PINNED_ENTRYPOINT) return "unknown"   // untested entrypoint (see §4)
  if (runtimeVersion === null || runtimeEntrypoint === null) return "unknown"  // unreadable transcript

  // Gate passed: the wire is the one Conditions 1 and 2 characterised.
  if (agentIdPresent === true)  return "subagent"
  if (agentIdPresent === false) return "live_agent"   // licensed ONLY by Condition 1's negative result
  return "unknown"                                    // payload unavailable / indeterminate
```

Three properties worth stating explicitly, because each is load-bearing:

- **`unknown` is the default on every path**, including exceptions. Any throw inside the transcript
  read must be caught and become `unknown`. The ruling says fall back, not crash.
- **`agentIdPresent` must be a genuine tri-state** (`true` / `false` / unavailable), never a truthiness
  coercion. A payload that could not be inspected must not collapse into `false`, because `false` now
  carries the positive meaning "live agent."
- **The gate is checked before the classification, never after.** Ordering is the whole mechanism.

### 3.4 The new third value, and what it costs

Post-build the vocabulary must be **three** values, not two, or the rate's denominator becomes
uninterpretable: a post-build `unknown` would otherwise conflate "gate failed, no signal" with
"gate passed, agent_id absent, therefore live agent." Those are opposite epistemic situations.

**This is a change from ruling 3's deliberate two-value design, and the change is licensed by
Condition 1, not by convenience.** Ruling 3 refused to emit `live_agent` because a session-shaped path
was "exactly consistent with two different worlds." Condition 1 closed that: a top-level session's H3
stdin never carries `agent_id`, across every configuration tested including concurrent background
agents. Under a *passing* gate, absence is now a positive observation rather than an ambiguity. **If
Condition 1's finding is ever overturned, `live_agent` must be withdrawn and the mechanism reverts to
two values.** That dependency should be written into the code, not just this document.

**Two consequences the build must carry, both found by reading the current code:**

1. **Schema bump to `false-hold-record-v6`.** Following this file's own established discipline
   (v4→v5 added `callerClass`): the new field(s) — `clientVersion`, `clientEntrypoint`, and the widened
   `callerClass` — **must be TOP-LEVEL**. `recordHash` in `false-hold-observation-report.ts` hashes
   `JSON.stringify(r.signals)`, so anything added *inside* `signals` re-hashes every existing v1/v2/v3
   record and breaks ingest idempotency. `schema` itself is deliberately not hashed, so the bump moves
   no existing hash.

2. **The report's validator must be extended in the same change.** `false-hold-observation-report.ts`
   currently asserts, at its record-validity check, that a v5 record's `callerClass` is `'subagent'`
   **or** `'unknown'` — anything else makes the record **INVALID and skipped**. A `live_agent` record
   emitted against an unextended validator would be **silently dropped from the population**, which is
   a data-loss failure mode wearing the costume of a schema check. The whitelist (`isGuardSchema`, the
   admitted-schema list, and the `callerClass` vocabulary assertion) must all admit v6 and `live_agent`
   in the same commit that emits them. **This is the single most likely way to get this build wrong.**

---

## 4. Configuration 5 (a second entrypoint): is the gap safe-by-construction?

**The prompt asks this to be argued, not assumed. Argued: it is NOT safe under a version-only gate, and
IS safe once the entrypoint is pinned alongside the version.**

The gap is real: no `claude` CLI exists on this machine, so a second entrypoint has never been live-tested.
Every observation in this arc is `claude-desktop`.

**Why a version-only gate does not close it.** The version is a property of the client *build*, shared
across its entrypoints. A CLI at `2.1.260` would therefore **pass a version-only gate** while its H3
`agent_id` behaviour is entirely unverified. If that entrypoint sets `agent_id` on top-level sessions,
the gate passes and mode 3 fires. So the fallback does *not* rescue the untested entrypoint by itself —
the naive assumption here would have been wrong.

**Why pinning the entrypoint does close it.** `entrypoint` sits on the *same transcript lines* as
`version` (135/135 lines this session; 72/72 in the sampled subagent transcript), so reading it costs
nothing extra. With `runtimeEntrypoint !== "claude-desktop" ⇒ unknown`:

- An untested entrypoint fails the pin ⇒ `unknown` ⇒ **exactly Option D's status quo**, which is the
  currently-accepted, currently-disclosed state. No new claim is introduced.
- The mechanism only ever asserts a classification on the one entrypoint where the wire was actually
  characterised.

**So Configuration 5's absence becomes safe-by-construction — but only because the entrypoint is
pinned, and that is an addition this design makes rather than something the ruling's text required.**
The honest statement of the residual: *the mechanism is inert on any entrypoint but `claude-desktop`,
and enabling another entrypoint requires re-running Conditions 1 and 2 against it.* That belongs in the
disclosure (§5) and in a code comment, so a future session does not "fix" the entrypoint pin by
loosening it.

---

## 5. The amended segment-1 clause, once the build lands

**The clause does NOT change now.** The S8 ruling is explicit: *"The amended segment-1 clause stands
exactly as the Option D ruling left it until a build actually lands."* This is a draft held for that
moment, not an edit to be applied.

Current (Option D, in force):

> *"Post-boundary records — `caller_class` field present at capture; distinction between live-agent and
> review-fleet records not currently achievable at source; `caller_class` reports `unknown` for all
> records on this harness as wired; no exclusion is applied; the structural reason is disclosed."*

Draft successor, for use only when the build lands:

> *"Post-boundary records — `caller_class` field present at capture. From the build boundary onward the
> harness discriminates callers by the presence of `agent_id` on the `PreToolUse` payload, a field
> first observed at client version **2.1.260**, entrypoint `claude-desktop`, and confirmed present on a
> second session and a separate calendar day at the same version. The classification is gated: the
> harness reads the client version and entrypoint from the session transcript at record time, and
> emits `unknown` — applying no exclusion — whenever the version or entrypoint differs from the pinned
> pair, whenever the transcript cannot be read, or whenever `agent_id`'s presence cannot be determined.
> Records classified `subagent` are excluded from the rate and their count is disclosed separately;
> records classified `live_agent` are included; records classified `unknown` are included, and the rate
> discloses that this residual contains an unmeasured proportion of review-fleet records. The
> mechanism is inert on any entrypoint other than `claude-desktop`, on which the wire has not been
> characterised. Records captured before the build boundary carry no such gate and are never
> retroactively classified."*

Three honesty properties that must survive any rewording:

- **The pinned version is named**, satisfying Condition 3(a) literally.
- **The `unknown` residual is still disclosed as contaminated** — the build shrinks that residual; it
  does not clean it.
- **Pre-build and post-build `unknown` are distinguished.** They mean different things and the clause
  must not let a reader merge them.

---

## 6. Is the three-condition gate discharged?

**This session does not answer that. It is relayed** —
`2026-09-10-condition-3-gate-discharge-RELAY.md`. Every session in this arc has treated "conditions
met" as requiring an explicit confirming ruling before code changes, and that precedent is followed
here rather than assumed away.

The session's own assessment, offered as input to that decision and not as a finding:

- **Condition 1 — CLOSED.** Evidence file, PR19-reviewed.
- **Condition 2 — CLOSED.** Evidence file, PR19-reviewed CLEAN.
- **Condition 3 — a condition on the build, not an investigation.** It is discharged when a build
  *carries* the pin and fallback. This document specifies what that means concretely enough to
  implement without re-derivation. Whether the specification suffices is the mentor's call.

**Two items that would change the answer if the mentor weighs them differently — stated plainly rather
than buried:**

1. **The `live_agent` value is a widening of ruling 3's deliberate two-value design.** It is licensed by
   Condition 1's negative result, but ruling 3 refused that value for reasons it argued at length.
   Whether Condition 1 is sufficient to license it is a judgement the mentor may wish to make rather
   than have inferred. **If the answer is no, the build still works** — it emits `subagent`/`unknown`
   only, gains the mode-3 protection, and simply cannot credit live-agent records positively.
2. **The entrypoint pin is an addition, not a requirement of the ruling's text.** §4 argues it is what
   makes Configuration 5's absence safe. If the mentor disagrees that an entrypoint pin is warranted,
   Configuration 5 becomes load-bearing again and a live CLI test is owed before build.

---

## 7. Honest limits of this design

- **No new capture was taken.** Every payload fact comes from already-captured dumps and from the
  transcript corpus on disk. Nothing here rests on a fresh `GATE1_DEBUG` act, and none was performed.
- **The mid-session-update failure mode is inferred, not observed end-to-end.** The mixed-version
  transcripts are directly observed (17/400); that a *hook firing after* such an update would read the
  stale head value is a straightforward consequence, but has not been reproduced live. The tail-read
  is the conservative response either way.
- **`agent_id`'s absence on a top-level payload is confirmed once more this session** (the H3 dump
  carries no `agent_id`), but that dump is from the Condition-2 session's own top-level probe, so it
  corroborates Condition 1 rather than independently extending it.
- **The 64 KB tail window is a proposed bound, not a measured one — and the adversarial pass this
  session ran against it (see §3.2's inline correction) found the "comfortably larger" claim was
  false on this machine's own data**, where a single attachment line exceeds the window 17x over.
  Correctness survives regardless (the conditional falls back to `unknown` on a failed scan), but the
  bound's *effectiveness* — how often it actually classifies rather than defaulting to `unknown` — is
  unverified for line types other than the ones sampled. A build should measure version-density and
  max single-line size across a broader transcript sample before treating 64 KB as final, and should
  test the exhausted-window path explicitly rather than only the found-it path.
- **Nothing here has been executed.** No test was written or run against the proposed conditional; this
  is a specification, and a build session owes it real pins.
