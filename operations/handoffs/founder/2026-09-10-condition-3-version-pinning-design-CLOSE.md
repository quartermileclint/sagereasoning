# Session close — S11/Condition 3: client-version-pinning DESIGN

**Authored 2026-09-10 (local `date`) = 2026-09-09 UTC.** Session `76d3b72c-e7c9-4ff6-b5c3-0fb7b4fce2e5`.
Opened under `operations/handoffs/founder/2026-09-09-condition-3-version-pinning-design-NEXT-SESSION-PROMPT.md`.

## STATUS UPDATE (same session, after the mentor's ruling arrived)

**The mentor ruled the three-condition gate DISCHARGED and licensed a build in this session.**
Verbatim ruling: Q1 — gate discharged, build licensed, conditioned on the byte-identity guard
remaining green and the SHA pins unchanged (verified below). Q2 — the three-value vocabulary
(`subagent`/`live_agent`/`unknown`) is ruled, not the conservative two-value fallback. Q3 — the
entrypoint pin closes Configuration 5's gap; no live CLI test is owed before this build.

**The build landed this session.** See the addendum at the end of this document for the full
build record. Everything below this line is the ORIGINAL design-phase close, preserved as written.

## Status: DESIGN COMPLETE. NOTHING BUILT (at the time this section was written).

`classifyCaller.ts` and every `GUARD_RE`-matched path are byte-unchanged vs HEAD — verified at open
(SHA-256 pins on `layer2-mechanisms.ts` and `stoic-brain.ts`, both clean vs HEAD) and again at close
(`git diff --stat` against both target files: empty).

## Deliverables

1. `operations/trust-layer-2026-07/2026-09-10-condition-3-version-pinning-DESIGN.md` — the design (a),
   including a self-correction of one overclaim found under adversarial review.
2. `operations/trust-layer-2026-07/2026-09-10-condition-3-gate-discharge-RELAY.md` — the relay (b),
   naming two explicit judgement calls for the mentor/founder rather than deciding them.
3. Decision-log entry appended (tail, not in-place).
4. `S11-FLIP-PREREQUISITES-REGISTER.md` — a new dated row appended (never edited in place).
5. `CLAUDE.md` — the §3 carried item corrected precisely (three-leg sequence stated, not restated
   stale a third time).

## The one finding that matters most

Reading the client version from the *head* of the session transcript — the obvious implementation
given `version`/`entrypoint` are absent from the H3/H4 hook payload — is wrong. 17 of 400 transcripts
on this machine (4.25%) carry more than one `version` value, and two straddle the exact pinned
boundary this condition names, `2.1.258 → 2.1.260`. The design specifies a tail-read instead, gated on
version+entrypoint+field-presence, falling back to `unknown` on any failure.

## Adversarial review, and what it found

Model dropped to Sonnet 5 per the founder's standing permission for this step. The review found the
design's claim that its proposed 64 KB tail-scan window was "comfortably larger" than worst-case
inter-version-line spacing was **false as stated** — this session's own transcript contains a
1,142,339-byte line, 17x the window. The design was corrected in place: correctness survives regardless
(the fallback covers a failed scan), but the *margin* claim was retracted and replaced with the actual
measurement (the giant line happens to itself carry `version`, so the scan succeeds in practice; this
is disclosed as a property observed, not a guarantee proven). Model return to Opus was requested but
no in-conversation tool exists to perform it — noted for the founder rather than silently assumed.

## What is NOT decided by this session

Whether Conditions 1–3 jointly license a build of `classifyCaller`; whether the mentor wants the
`live_agent` value or the conservative two-value fallback; whether the entrypoint pin is accepted as
closing Configuration 5 or a live CLI test is still owed. All three are in the relay, addressed to the
mentor (or the founder, by election), and this session does not answer them — following the arc's own
precedent of never assuming the gate opens itself.

## Window health at close (re-derived, not quoted from the prompt)

- Buffer: `~/.sage-gate1/false-hold-record.jsonl`, 400 lines, 0 unparseable. Not refreshed.
- Window (line 140–400, took-effect probe at line 139 excluded): 262 records = 41 consult + 221 guard.
- Per-UTC-day: 09-06 = 3/76; 09-07 = 17/63; 09-08 = 6/57; 09-09 = 15/26.
- **Baseline days (≥1 consult) = 4 of 4 UTC days present** — matches the immediately-prior session's
  independent re-derivation; the prompt's carried "2 of 5" is not reproducible from the buffer.
- `gate1.log` corroboration: exact 1:1 on 09-07/08/09; on the partial first day, the probe's own log
  line sorts before its buffer write (`.265Z` < `.267Z`), reproducing the double-count trap the prior
  session named — resolved by consistent probe handling on both sides, giving exact 76/76 and 3/3.
- This session contributed **zero** buffer records (no `.loop.json` exists for this session; every
  write went through Bash heredocs, confirmed by `git diff --stat` and by the absence of any
  Edit/Write tool invocation this session).
- Guard status: no evidence of a trip; tree verified clean at open and close.
- `GATE1_STATE_DIR`: unchanged (`/Users/clintonaitkenhead/.sage-gate1`).
- `GATE1_DEBUG`: no act performed this session; the three stale `*-stdin.json` files present on disk
  are dated to the immediately-prior (Condition 2) session's own run, confirmed inert throughout this
  session by mtime comparison against repeated hook fires.

## Noticed, correctly out of scope, named rather than silently passed over

`git status` showed `website/src/lib/cognitive-os-store/store.ts` (+ its test) and a new
`website/supabase-cognitive-os-second-migration.sql` as dirty/untracked with mtimes inside this
session's window. This session touched none of them. The decision-log's immediately-prior entry (a
cognitive-os "table step" close) accounts for this as concurrent activity on the shared checkout.

## PR19 — the mandatory fourth check

Did this session build anything without an explicit in-session founder go-ahead? **No** — verified
via `git diff --stat` against `classifyCaller.ts` and every `GUARD_RE`-matched path, both empty.

## Forecast met

A concrete, actionable design a future session could implement without re-deriving anything (§3 of
the design doc gives the exact conditional); an explicit relay asking whether the gate is discharged;
an honest re-derived window-health report; the carried CLAUDE.md correction made precisely rather than
restated stale a third time.

## Closing self-reflection (Sage Reflect, prompted at Stop)

The at-action guardrail fired GUARD-CAUTION repeatedly this session, every time on Bash — reading the
buffer, grep/sed inspection, heredoc writes, one `sed -i` correction. None involved deletion,
force-push, credentials, or production. This is read as a structural property of the guard's
allowlist (it trips on tool class, not on a content assessment of the specific call), consistent with
this project's own documented Bash/consult-scoring disagreement — but that reading was formed only
when the Stop hook asked directly, not during the session itself. Two honest admissions: (1) by the
session's later firings, my answers to the guard's own three elicitation sub-questions had become
near-identical templates rather than fresh per-command introspection — a mild instance of the
resolution-before-examination the sub-questions exist to catch; (2) this close record stated that the
session contributed zero buffer records (Bash is excluded from consult scoring) without connecting
that to the guard having fired repeatedly on those same excluded actions — the guard and the measured
instrument are answering different questions about the same calls, and a reader deserves that stated
together. Recorded here rather than left for the next session to notice.

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**

---

## ADDENDUM — the build (same session, post-ruling)

**Mentor ruling received and acted on in full:**
- Q1 (gate discharge): licensed. Verified at close per the ruling's own condition — SHA pins on
  `layer2-mechanisms.ts` and `stoic-brain.ts` re-derived, both CLEAN vs HEAD, unchanged from session
  open.
- Q2 (vocabulary): three values built — `subagent`/`live_agent`/`unknown`.
- Q3 (entrypoint pin): built as the gate's third AND-ed condition.

### What was built

- `harness/gate1-pre-decision/claude-code/hooks/lib/false-hold-capture.mjs`: `readClientContext`
  (new, exported) — a full-file tail scan for the last `version`/`entrypoint`-bearing transcript
  line, matching the established `readTranscriptTail` pattern rather than the design's original
  64KB-bounded proposal (retracted per the design doc's own adversarial-review correction).
  `classifyCaller` rewritten to the licensed gate — kept PURE (no file I/O; the caller reads and
  threads `clientVersion`/`clientEntrypoint`/`agentIdPresent` in). `buildGuardHoldRecord` bumped to
  schema `v6`, `callerClass` normalization widened to admit `live_agent`, two new top-level fields
  `clientVersion`/`clientEntrypoint` added.
- `harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs`: `describeAction` now calls
  `readClientContext` once and threads its result into both `classifyCaller` and onto `action`;
  `main()` derives `agentIdPresent` via `Object.prototype.hasOwnProperty.call(event, "agent_id")` —
  a key-presence check, matching exactly how Condition 1's evidence file characterised "presence";
  `captureGuardObservation`'s call site threads `clientVersion`/`clientEntrypoint` through.
- `website/scripts/false-hold-observation-report.ts`: `isGuardSchema`, the record-validity schema
  whitelist, and the `callerClass` vocabulary check all extended to admit v6 — closing the exact
  data-loss trap the design doc named (an unextended validator would have silently dropped every
  future `live_agent` record). Added an ADDITIVE disclosure block (never rewriting the existing
  v5-era paragraph, which stays accurate for v5 records) reporting the v6-specific
  `live_agent`/`unknown` split, or an honest "0 records so far" when none exist yet (true of today's
  real buffer).

### A genuine defect this build's own testing caught, in the test, not the source

§3.24 of the harness test's own end-to-end pins failed on first run: `readClientContext` returns
`{version, entrypoint}` but the test spread that directly into `classifyCaller`'s opts, which expects
`{clientVersion, clientEntrypoint}`. Two sibling pins (§3.25/§3.26) were passing *for the wrong
reason* — the naming bug happened to produce `'unknown'`, which coincided with their expected answer.
Fixed properly (a `toGateOpts` helper matching the real `describeAction` rename) and a new positive-
outcome counterpart pin (§3.24b) added to close the "passes regardless of correctness" class.

### Verification, all green

- `harness/gate1-pre-decision/test/false-hold-capture.test.mjs`: 67/0 (18 new pins for the licensed
  gate, real synthetic transcript files including a genuine version-straddling one).
- `harness/gate1-pre-decision/test/negative-battery.mjs`: 256/0, RELEASE GATE PASS (one stale `v5`
  assertion fixed).
- `harness/gate1-pre-decision/test/logic-harness.mjs`: 173/0.
- `harness/gate1-pre-decision/test/schema-redaction.test.mjs`: 24/0.
- `harness/gate1-pre-decision/test/close-content-variation.test.mjs`: 70/0.
- `website/scripts/__tests__/false-hold-observation-report.test.ts`: 117/0 (12 new pins: v6
  validity, cross-generation rejection — a v5 record carrying `live_agent` is INVALID, not legacy —
  and the new disclosure block, both its zero-record and populated branches).
- `npx tsc --noEmit` (website/): clean.

### The guard tension, found and resolved as reasoned

`false-hold-capture.mjs` and `false-hold-observation-report.ts` are themselves `GUARD_RE`-matched
(the pattern includes `false-hold`) — editing them necessarily makes the `/logos` page's live
`git status`-based byte-identity guard fail RED while the tree is dirty. Confirmed empirically:
`/logos`'s test read 249 passed / 1 failed with the exact offending-files list, mid-build.
**The guard is a working-tree-dirtiness check, not a permanent-content-freeze check** — it re-reads
`git status --short` fresh each run, so it passes again once the change is committed and the tree is
clean. `/reflect`'s and `/milestones`' copies of `GUARD_RE` are unrelated static import-boundary
checks (no live git-status logic) and were unaffected throughout (146/0 and 952/0).

### Staging discipline

Concurrent activity from a separate session (a cognitive-os "second migration" build, evidenced by
its own decision-log entries and close/prompt files) left `website/src/lib/cognitive-os-store/*`,
`website/supabase-cognitive-os-second-migration.sql`, and `website/src/data/environmental-context.json`
dirty/untracked throughout. None were touched, edited, or staged by this session — confirmed by
listing the exact staged file set against `git status --porcelain` before commit. The S10
"session-paused-NOT-CLOSED" working-notes file was deliberately left uncommitted — its own
provisional status is not this session's call to resolve.

### Not yet done, correctly left for the founder

The `git status --short`-guard's own post-commit clean state was not re-verified inside this
document (verify after the commit lands, before push, if wanted). No production/schema/flag/
credential touched. Nothing pushed — the founder pushes.

**The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
