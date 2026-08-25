# Close — Close-hook content variation, both phases built dark

**Date:** 2026-08-25 · **Stream:** founder · **Arc:** the IW-7-openings thread (a reflections-arc
successor, not a SageReasoning project arc) — but this session's own tier is `code-elevated`, real
harness code, not documents.
**Tier:** `code-elevated`. **Risk:** Elevated. **AC7 not engaged** — no activation, no flag flipped in
any live install, no credential/schema/deployment surface touched.

---

## What landed

Built both mentor-ruled phases of IW-7 opening 3 (close-hook content legibility) per
`operations/handoffs/founder/2026-08-25-close-hook-content-variation-BUILD-NEXT-SESSION-PROMPT.md`,
which itself executed:
- `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md` §3
- `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`
- `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md`
- `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`

**Phase one (guard-CAUTION content variation) and phase two (confidence-graded consult-verdict
content variation) are both built, in one session, behind one new flag.**

**The mechanism.** A new shared flag `GATE1_CLOSE_CONTENT_VARIATION_ENABLED` (default off, read once
in `framing-core.mjs`'s `loadConfig` so H3 and H4 derive it identically — mirroring
`captureProvenance`'s own precedent). Two new lib files: `consult-signal.mjs` (pure — the two
disjoint triggers the second ruling specifies: proximity `reflexive`/`habitual`, unconditionally
high-confidence; kathekon `quality === 'contrary'`, confidence-graded by whether the extraction's
other four Layer1Schema arrays are also empty) and `close-signal-state.mjs` (fs-backed per-session
state, first-wins for the guard signal, strongest-wins/never-downgrades for the consult signal —
the build prompt's recommended pattern, matching this codebase's `elicitMarkerPath` idiom). Wired
into `at-action-hook.mjs` at two flag-gated call sites (the guard's CAUTION branch; after a
successful consult fetch). `close-hook.mjs`'s `renderReflectInvitation(cfg, sessionId)` returns the
EXACT pre-existing invariant five-question string — now a named constant, `BASE_REFLECT_INVITATION`
— unchanged in three cases: flag off; no signal recorded; or a low-confidence-only kathekon signal
(the ruling's "generic content or no variation at all" — this build chose the second option
deliberately, so a low-confidence read is architecturally indistinguishable from a no-signal
session, never a hedged version of the high-confidence wording). When a qualifying signal exists,
one interpolated paragraph is appended (never a replacement — the base string is still the whole
prefix), naming the tool and, for the kathekon basis, plainly disclosing why the reading is
high-confidence (the second ruling's binding constraint, quoted verbatim in the build prompt).

**Design decisions made and documented in-code, not left implicit:**
- The per-session bridge between H3 and H4 uses a state file (the build prompt's pattern 1), not a
  re-parse of `honestLog`'s free-text output (pattern 2).
- Precedence when both a guard caution and a qualifying consult signal occur in one session: the
  guard caution is named, the consult signal is not additionally surfaced — one finding per close
  turn, matching the base prompt's own single-paragraph shape. This is a disclosed design election,
  not mandated by either ruling (neither ruling addresses the both-fired case).
- The low-confidence path returns exactly the same content as the no-signal path — the same code
  branch, not two branches that merely happen to look alike — which is how the "genuinely different,
  not silently degraded" requirement is realised structurally rather than by wording alone.

---

## Battery

New file `harness/gate1-pre-decision/test/close-content-variation.test.mjs`: **70 assertions**
(pure-function unit tests for the classification/confidence/supersession logic and the
state-file module, plus hook-spawn integration tests via the mock server). `test/mock-reason-server.mjs`
extended with three new `/api/reason` fixture modes and an `extraction` override —
backward-compatible, confirmed by reading the diff (every existing caller that doesn't pass the new
opts gets byte-identical fixtures; independently re-confirmed by the adversarial reviewer).

**All batteries green, no regression:**
- `close-content-variation.test.mjs` — 70/0 (new)
- `logic-harness.mjs` — 171/0
- `negative-battery.mjs` — 250/0, RELEASE GATE: PASS
- `false-hold-capture.test.mjs` — 37/0

Combined: **528 assertions, 0 failures.**

---

## Independent adversarial review — PR19

A fresh subagent (no prior context beyond the governing documents and the file list) reviewed against
ten named risk categories: flag-off byte-identity (checked at the code-path level, not just the test
assertion); the confidence-disclosure constraint's literal wording; precedence; strongest-wins
semantics and race conditions; whether the proximity basis quietly skipped a confidence check the
mentor actually wanted applied there too; fail-soft discipline; mock-server backward compatibility;
battery adequacy; whether this genuinely avoids adding a new firing point (the whole IW-7 arc's
central concern); and mid-session flag-flip degradation.

**Verdict: GO_WITH_FIX — no findings required before "done."** Three optional LOW items, all folded
in this session:
1. A battery case proving a genuinely CORRUPTED state file (malformed bytes on disk, not merely an
   unwritable directory) degrades to `null` rather than throwing.
2. A battery case pairing a guard caution with a LOW-confidence consult signal, confirming the guard
   content still shows (precedence doesn't silently produce no content at all).
3. A disclosure comment in `close-signal-state.mjs` naming the unlocked check-then-act read/write
   race as an accepted, bounded limit (cannot corrupt state; cannot let a low-confidence signal beat
   an already-recorded high-confidence one — both reviewer-confirmed non-issues).

The reviewer separately confirmed, as findings rather than gaps: the proximity-basis-as-
unconditionally-high-confidence design is faithful to both governing documents (the signal-quality
scope never addresses proximity; the three-openings scope explicitly analogises reflexive/habitual
proximity to the guard's own non-ambiguous CAUTION gate); the confidence-disclosure wording is a
genuine plain-language disclosure, not a technical one, and there is no secondary leak path through
logs; and `close-hook.mjs`'s `main()` genuinely adds no new firing point — only the content of the
existing once-per-session `Stop` invocation now varies.

Post-fold re-verification: all four batteries re-run green (528/528).

---

## What this session explicitly does not do

- **Not activated.** `GATE1_CLOSE_CONTENT_VARIATION_ENABLED` is unset everywhere, including the
  founder's own dogfood install. Flag-off is byte-identical to the pre-existing behaviour, both
  test-asserted and independently code-path-confirmed.
- Does not touch opening 2 (still held on the signal-quality gap, per the standing rulings).
- Does not touch the discernment-route 503 rate diagnosis (a separate flagged background task).
- Does not reopen any reflections-arc letter or item.
- Does not flip any flag in production or in any operator install.

---

## Records

- `operations/decision-log.md` — entry appended at the physical tail:
  `D-CLOSE-HOOK-CONTENT-VARIATION-BUILT-DARK-REVIEW-FOLDED-2026-08-25`
- This close — new.

## Commit

Committed, scoped to exactly the files this session touched (the harness lib/hook/test files listed
above, this close, and the decision-log entry). **Not pushed — the founder pushes**, per this
project's standing convention. Several unrelated untracked files from concurrent peer sessions
(confirmed via `git status`/`ListAgents` at open — five peer sessions active) are excluded from this
commit.

---

## What comes next — not chosen here

1. **Activation** — a founder-walked step: set `GATE1_CLOSE_CONTENT_VARIATION_ENABLED=true` in the
   founder's own dogfood install (or any standing operator install) and observe the content variation
   fire live against real session signals. No production/server-side coordination is needed — this is
   pure local harness logic, confirmed by this session per the build prompt's own instruction to
   verify rather than assume.
2. Opening 2 remains held on the signal-quality gap (unchanged by this session).
3. The discernment-route 503 rate diagnosis (named, not acted on here).
