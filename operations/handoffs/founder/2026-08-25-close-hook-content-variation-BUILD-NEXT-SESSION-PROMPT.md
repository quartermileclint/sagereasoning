# Next-Session Prompt — Build §3: Close-Hook Content Variation (Both Phases)

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Arc:** the IW-7-openings thread, itself a named successor of the reflections-examination arc — **not
a SageReasoning project arc**, but this session's *work* is real harness code (`harness/gate1-pre-decision/`),
not documents. Read the arc-separation note below before doing anything.

**Stream:** founder.
**Tier at open: `code-elevated`** (a new function on an existing hook, no auth/session/encryption/R20a
perimeter/deployment-config surface touched by the build itself) — **confirm this classification
yourself at open** rather than inherit it; if the design turns out to need something this prompt
didn't anticipate (a new credential, a schema change, a flag flip in production), reclassify upward
per the manifest's own risk table and follow the Critical Change Protocol from that point.
**Activation (if the design lands behind a flag, expected) is its own, later, founder-walked
`code-critical` step — not this session's to take.**

**Predecessors, read in this order:**
1. `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md` — the master
   scope, §0 (mechanism facts), §3 (both phases, ruled), §6 (status). This is the primary spec.
2. `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`
   — the first ruling (clears phase one; design guidance on interpolation).
3. `operations/reflections-examination-2026-08/2026-08-25-signal-quality-gap-scope.md` — the
   confidence-proxy design (§0–§2) that phase two is built on.
4. `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`
   — the second ruling (unblocks phase two, on the confidence-disclosure constraint — read this one
   most carefully; its constraint is load-bearing and easy to under-build).
5. `operations/handoffs/founder/2026-08-25-signal-quality-gap-CLOSE.md` and
   `operations/handoffs/founder/2026-08-25-iw7-three-openings-CLOSE.md` — the closes, for the
   condensed state and what's explicitly NOT authorised.

---

## Arc separation — read this before anything else

This work descends from the reflections-examination arc (item 4 → the IW-7 openings → this build), but
it is not a reflections-arc session and does not touch reflections-arc files. It IS a SageReasoning
project concern once it becomes code: the harness this session edits is the same reference harness
every S8/S9/S9b/Slice-5 session in `CLAUDE.md`'s history has built, and this session should treat
those as its direct precedent for process (build dark → battery-green → adversarial review →
founder-walked activation), not as background colour. **Run `ListAgents` at open** and coordinate
before touching any shared file, per the project's standing concurrency practice.

---

## What is ruled, and is not being re-litigated here

**Both phases of §3 are mentor-cleared.** This session's job is to build what was ruled, not to
re-scope it. If, during the build, something in the ruling turns out to be under-specified in a way
that changes the *design*, stop and ask rather than improvise past it — but the *policy* questions
(should this exist, at what frequency, on what signal) are closed.

### Phase one — vary the close turn's content on-condition from a guard-CAUTION signal

**Ruled for** (`2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`, §"Opening 3"). The condition:
did `runGuard` (in `at-action-hook.mjs`) return a CAUTION verdict at any point this session — the
guard's own narrow, named irreversible-action allowlist, not the consult. If so, the close turn's
content should name it.

### Phase two — extend the condition to a confidence-graded consult verdict

**Ruled for, on a constraint** (`2026-08-25-mentor-ruling-signal-quality-gap-verbatim.md`). The
condition: did any `runConsult` verdict this session read `katorthoma_proximity` at `reflexive` or
`habitual`, or `kathekon_quality` at `contrary`? If `contrary`, compute the confidence proxy from
`2026-08-25-signal-quality-gap-scope.md` §2 — check whether the extraction's *other* arrays
(`passions_present`, `oikeiosis_circles_engaged`, `value_categories_at_stake`,
`causal_stage_evidence`) are also empty (low confidence the `contrary` reading is genuine) or some are
populated (higher confidence). **The binding constraint, quoted so it cannot be missed:**

> *"the content variation must disclose the heuristic's basis when it fires on a high-confidence
> adverse verdict. Not a technical disclosure — a plain one. … The practitioner should know the
> difference between 'the instrument found something worth reflecting on' and 'the instrument thinks
> it found something but cannot be certain.' … The content variation design should carry the
> confidence level explicitly, not absorb it silently."*

**A low-confidence read gets generic content or no variation at all — do not silently degrade it into
a vague version of the high-confidence content.** The two must read differently to the practitioner,
in plain language, not just internally differently to the code.

### Design guidance, both phases, from the first ruling

> *"the invariant five-question string stays as the base structure … session-specific content should
> be interpolated into the existing structure, not replace it … reusing the same interpolation pattern
> the guard's elicitation machinery already uses."*

Concretely: `renderReflectInvitation()` in `close-hook.mjs` (currently a fully invariant string, no
session-specific content) should gain an optional interpolated block, modelled on
`renderGate2ElicitationBlock(action.summary)` in `at-action-hook.mjs` (which truncates and interpolates
`action.summary` into a fixed template) — not a rewrite of the five questions, an addition alongside
them.

---

## The open design question this prompt does not pre-answer

**How does `close-hook.mjs` (the `Stop` hook) learn what happened earlier in the session, at H3 (the
`PreToolUse` hook)?** These are separate process invocations; there is no shared in-memory state. Two
established patterns already exist in this codebase to solve exactly this — read both before choosing:

1. **A per-session state file**, written by `at-action-hook.mjs` at the moment of the signal (a guard
   CAUTION; a consult verdict crossing the threshold) and read by `close-hook.mjs` at close. This
   mirrors `elicitMarkerPath`'s own pattern (`at-action-hook.mjs:183-184`) and `close-hook.mjs`'s own
   `closeMarkerPath`/`reflectedMarkerPath` conventions (`close-hook.mjs:101-118`) — the established
   idiom in this file pair.
2. **Reading `honestLog`'s own output** (`~/.sage-gate1/gate1.log` by default, `GATE1_STATE_DIR`
   env-configurable) at close time, filtered to the current session ID, and scanning backward for
   `GUARD-CAUTION`/`CONSULT` lines. This is what the opening-1 measurement task did read-only, from a
   repo session with no live harness of its own — but the close-hook runs IN the live harness, so it
   has a cleaner option (1) available and probably shouldn't re-parse its own log as a database.

**Recommendation, not a mandate:** pattern 1 (a small per-session state file) is more in keeping with
this codebase's existing idiom and doesn't require parsing free-text log lines back into structured
data. Decide and document the choice; either is defensible.

---

## What this session should verify before writing any code (PR20/PR23)

- **Re-read `at-action-hook.mjs`'s actual current guard-CAUTION branch** (`runGuard`, roughly lines
  508–566 as of this prompt's authoring — **verify the line numbers directly, do not trust this
  prompt's numbers**, the file may have changed) to confirm the exact verdict shape available at that
  moment (`r.recommendation`, `r.proximity`, `r.reasoning`) — this prompt describes it from a read
  earlier the same day; re-derive, don't inherit.
- **Re-read the consult verdict shape** (`runConsult`, and `extractVerdict`/`fetchFrame` in
  `framing-core.mjs`) to confirm exactly which fields are present on the verdict object your close-hook
  logic will need: `katorthoma_proximity`, `kathekon_quality` (confirm this exact key name on the wire
  — the mentor ruling and scope document use `kathekon_quality`/`is_kathekon`; the harness code's own
  local variable names in `framing-core.mjs:622-624` are `kathekonQuality`/`isKathekon` — verify the
  actual JSON field names on `body.assessment.assessment` before writing any parsing code).
- **Confirm the `Layer1Schema` array field names** independently against
  `website/src/lib/translation-sandwich/layer1-extractor.ts:550` at the time you build — this prompt
  cites them from a same-day read; re-verify rather than copy.
- **Check whether `discernmentEnabled(cfg, dcfg)` or an equivalent provisioning gate should apply** to
  this new logic, matching the existing elicitation's honest-skip-when-unprovisioned behaviour, or
  whether it's independent of that gate (the confidence-proxy computation touches only fields already
  present on the ordinary consult response, not the discernment route specifically — likely does NOT
  need that gate, but confirm rather than assume).

---

## Build discipline (matching every prior harness session's precedent in `CLAUDE.md`)

1. **Build dark.** Wrap the new logic behind a flag defaulting off (name it yourself, following this
   project's `GATE1_*` naming convention — e.g. `GATE1_CLOSE_CONTENT_VARIATION_ENABLED` or similar).
   Flag-off must be byte-identical to `close-hook.mjs`'s current behaviour — test-assert this, the
   same way every prior session in this harness's history has.
2. **Battery.** Extend `harness/gate1-pre-decision/test/logic-harness.mjs` and
   `negative-battery.mjs` (or add a new battery file matching this pair's convention) covering: flag-off
   byte-identity; phase-one firing correctly on a genuine guard CAUTION and not otherwise; phase-two's
   confidence computation on both a rich-elsewhere and an all-empty extraction; the low-confidence path
   producing genuinely different (not silently degraded) content from the high-confidence path;
   no-signal sessions keeping the fully generic five-question form unchanged.
3. **Independent adversarial review before calling this done.** Every prior harness build in this
   project's history received one (per PR19, and per this specific thread's own precedent — the
   original §4 mid-session-reflect design was caught by exactly this kind of review before it reached
   the mentor). Do not skip it because this build reuses machinery instead of adding a hook.
4. **Do not activate.** Ship dark, flag off, on push. The flag flip (if the design needs Vercel/server
   coordination — it likely does not, since this is pure local harness logic, but confirm) or the local
   install update is its own founder-walked step, named and not taken here.

---

## Records

- Author the build in the harness tree as scoped above.
- A decision-log entry per the manifest's Elevated-risk lean form (or full form if reclassified to
  Critical), at the physical tail of `operations/decision-log.md`.
- A session close naming what was built, what battery counts resulted, whether the independent review
  ran and what it found, and the explicit "not activated" status with the activation step named as the
  next founder-walked prompt.
- Commit; **do not push** — the founder pushes, per this project's standing convention.

---

## What this session does not do

Does not touch opening 2 (held), does not touch the discernment-route 503 diagnosis (a separate
flagged background task), does not reopen any reflections-arc letter or item, does not activate
anything server-side or flip any flag to on.
