# Next-Session Prompt — Activation: Close-Hook Content Variation

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Arc:** the IW-7-openings thread, itself a named successor of the reflections-examination arc — **not
a SageReasoning project arc**, but this session's *work* touches a live local harness install, which
IS a SageReasoning project concern (the same reference harness every S8/S9/S9b/Slice-5 session in
`CLAUDE.md`'s history has activated). Read the arc-separation note below before doing anything.

**Stream:** founder.
**Tier at open: `code-critical`** — this session flips a flag in the founder's own standing dogfood
install and observes real session content vary as a result. **This is a founder-walked step.** The AI
guides + verifies; the founder performs the actual local config edit and any live-loop observation
that requires the founder's own Claude Code session. Do not attempt to perform the activation
unilaterally — confirm this classification yourself at open per the manifest's risk table before
proceeding.

**Predecessors, read in this order:**
1. `operations/handoffs/founder/2026-08-25-close-hook-content-variation-CLOSE.md` — the build close.
   States exactly what was built, the battery counts (528/0 combined), the PR19 verdict (GO_WITH_FIX,
   three LOW items all folded), and that nothing is activated anywhere, including the founder's own
   dogfood install.
2. `operations/handoffs/founder/2026-08-25-close-hook-content-variation-BUILD-NEXT-SESSION-PROMPT.md`
   — the prompt that produced the build. Carries the ruling citations, the confidence-disclosure
   constraint (binding, quoted verbatim there), and the design decisions made in-code.
3. `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md` and
   `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`
   — the first ruling (phase one, guard-CAUTION content variation).
4. `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md` and
   `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`
   — the second ruling (phase two, the confidence-graded consult-verdict variation; the
   confidence-disclosure constraint this session must verify fires correctly live, not just in the
   battery).

---

## Arc separation — read this before anything else

This work descends from the reflections-examination arc, but it is not a reflections-arc session and
does not touch reflections-arc files. Activating it touches the founder's own local
`.claude/settings.local.json` (or equivalent operator install config) — the same surface every prior
`/practice-on`-adjacent activation in this project's history has touched. **Run `ListAgents` at open**
and coordinate before editing any shared file, per the project's standing concurrency practice.

---

## What is settled, and is not being re-litigated here

Both phases are built, battery-green (528 assertions, 0 failures across
`close-content-variation.test.mjs` 70/0, `logic-harness.mjs` 171/0, `negative-battery.mjs` 250/0
RELEASE GATE PASS, `false-hold-capture.test.mjs` 37/0), and independently adversarially reviewed
(PR19, verdict GO_WITH_FIX, no findings required before "done" — three optional LOW items, all folded
in the build session). **This session's job is to activate what was built, not to re-design it.** If
observing the live fire surfaces a genuine defect the battery didn't catch, stop, characterise it,
and treat the fix as its own small step (build dark again if it's non-trivial) rather than patching
live behind an already-flipped flag.

### What "activation" concretely means here

The mechanism (per the close): a single flag, `GATE1_CLOSE_CONTENT_VARIATION_ENABLED`, read once in
`framing-core.mjs`'s `loadConfig`, defaulting off. Flag-on:
- A guard CAUTION verdict at any point in the session (from `runGuard` in `at-action-hook.mjs`) causes
  the close turn's `renderReflectInvitation()` output to name it, appended to the unchanged
  five-question base string.
- A qualifying consult verdict (`katorthoma_proximity` at `reflexive`/`habitual` — unconditionally
  high-confidence; or `kathekon_quality === 'contrary'` — confidence-graded by whether the
  extraction's other four Layer1Schema arrays are also empty) does the same, with a plain-language
  disclosure of the confidence basis when the kathekon reading fires (the binding constraint from the
  second ruling).
- A low-confidence-only kathekon signal, or no signal at all, produces byte-identical output — the
  same code branch, not a hedged variant.
- Precedence: if both a guard caution and a qualifying consult signal occur in one session, only the
  guard caution is named (a disclosed design election, not mandated by either ruling).

**No server-side, Vercel, or Supabase coordination is needed** — this is pure local harness logic
(confirmed in the build session). Activation is a config-file edit plus a live observation, not a
deploy.

---

## What this session should do

1. **Re-confirm the build is exactly what the close describes.** `git log`/`git show` the commit named
   in the close (scoped to the harness lib/hook/test files + the close + the decision-log entry). Read
   the actual diff, not just the close's prose summary — this project's own standing lesson (memory
   `primary-data-beats-secondary-characterisation.md`) applies here as much as anywhere.
2. **Re-run all four batteries fresh** (`close-content-variation.test.mjs`, `logic-harness.mjs`,
   `negative-battery.mjs`, `false-hold-capture.test.mjs`) before touching any live config, to confirm
   nothing has drifted since the build session closed. Expect 528/0 combined; if it isn't, stop and
   diagnose before proceeding to activation.
3. **Founder sets `GATE1_CLOSE_CONTENT_VARIATION_ENABLED=true`** in the founder's own dogfood install
   (`.claude/settings.local.json`'s `env` block, following the existing pattern for
   `GATE1_PROVENANCE_ENABLED`/`GATE1_REFLECT_TURN_ENABLED` and the other harness flags already there).
   The founder performs this edit; the AI can draft the exact line to add/change and verify the file
   afterward, but does not edit the founder's live local config unilaterally without the founder
   present and confirming.
4. **Observe live, in a genuine session:**
   - A session where a guard CAUTION genuinely fires (an irreversible-action attempt on the guard's
     named allowlist) — confirm the close turn's content names it, and that the base five-question
     string is still fully present (interpolation, not replacement).
   - A session with no qualifying signal — confirm the close turn is byte-identical to the pre-flip
     baseline.
   - If practical without contriving an artificial task, a session where a consult verdict reads
     `reflexive`/`habitual` proximity, or `contrary` kathekon quality with either a rich or an
     all-empty extraction elsewhere — confirm the high-confidence and low-confidence paths read
     genuinely differently to a human reader, and that the confidence basis is disclosed in plain
     language exactly as the second ruling requires. **This is the one property that matters most to
     verify live rather than trust from the battery** — a battery assertion that two strings differ
     is not the same evidence as a human reading both and confirming the difference is legible and
     honest.
5. **Record what was actually observed**, not what was expected to be observed — if a genuine
   guard-CAUTION or qualifying-consult session doesn't arise naturally during this session's own work,
   say so honestly rather than fabricating or forcing one; a later session can complete the
   live-observation record if this one only gets the no-signal baseline confirmed.

---

## What this session should NOT do

- Does not touch opening 2 (still held on the signal-quality gap, per the standing rulings).
- Does not touch the discernment-route 503 rate diagnosis (a separate flagged background task).
- Does not reopen any reflections-arc letter or item.
- Does not flip this flag, or install this harness version, on any surface other than the founder's
  own dogfood install (no production flag, no other operator's credential, no schema/deployment
  change — there is none here to make).
- Does not silently patch the mechanism if a live defect surfaces — name it, and treat the fix as its
  own step per the project's build discipline (dark → battery → independent review → activate).

---

## Records

- A decision-log entry at the physical tail of `operations/decision-log.md`, Elevated/Critical lean
  form per what actually happens this session — `AC7` engaged only if the flag is genuinely flipped
  and live behaviour is genuinely observed to differ; if this session only re-verifies and drafts the
  edit without the founder present to flip it, say so and leave activation itself carried forward.
- A session close naming: what was re-verified, whether the flag was flipped, what was live-observed
  (guard-caution case / no-signal case / consult-verdict case — name which were actually seen and
  which were not), and anything carried forward.
- Commit any repo-tracked changes (there should be none beyond the decision-log entry and the close,
  since the flag lives in the founder's gitignored local settings); **do not push** — the founder
  pushes, per this project's standing convention.

---

## What comes next — not chosen here

1. If the live observation surfaces a genuine gap (a case the battery didn't anticipate, or content
   that reads as hedged/degraded rather than genuinely different), scope and build the fix as its own
   step, following the same build discipline as the original two-phase build.
2. Opening 2 remains held on the signal-quality gap (unchanged by this session).
3. The discernment-route 503 rate diagnosis (named, not acted on here).
4. Whether to widen activation beyond the founder's own dogfood install to any other standing operator
   install is a separate, later founder decision — not implied or pre-approved by this session.
