# Close — IW-7's three openings, scoped

**Date:** 2026-08-25 · **Stream:** founder · **Arc:** reflections (not a SageReasoning project arc)
**Tier:** `governance`, scope + design proposal. **No build.** **AC7 not engaged.** No code, schema,
flag, credential, or live operation. Production untouched. **No harness file was edited** — every
mechanism fact below was established by reading, matching this arc's own standing practice.

**This is not a letter and not an arc item.** It scopes the three openings the mentor's item-4 ruling
left recorded-but-unscoped (`D-ITEM4-MENTOR-RULING-EXPOSURE-KEYED-TRIGGER-REJECTED-2026-08-24`, §6a of
`2026-08-24-item4-trigger-legibility-combined-scope.md`), per the founder's explicit request to scope
all three now — distinct from the "IW-7 trial" itself, which the same document marks superseded and
not to be run, since it would trial the design the ruling rejected.

---

## What landed

**One combined document**, matching the prior scope document's own precedent for treating the two
IW-7-adjacent surfaces as one question rather than three disconnected asks:
`operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md`.

**The headline finding, established by reading `at-action-hook.mjs` and `close-hook.mjs` directly
(764 + 447 lines), not inherited from either the prior scope document or `CLAUDE.md`:** opening 1
(a non-exposure-keyed trigger) **substantially already exists.** A three-sub-question structured
elicitation is already wired into H3, already fires on a condition narrower than action-class
membership (a guard CAUTION verdict on the guard's own irreversible-action allowlist, not "any
Bash/Edit/Write"), and already carries occasion-varied content (the action summary is interpolated
into the prompt). What's actually open is narrower than the ruling's opening implied: whether that
gate is *wide enough* to move the coverage figure — likely not, since the guard itself only runs on a
small allowlist of destructive command shapes.

**Opening 2 (a structural intervention on the Gate-2 consult) converges with opening 1 once that's
seen.** The same elicitation machinery could be armed from the *consult's* verdict (which fires on
every distinct decision, not only the guard's narrow subset) rather than only the guard's. This adds
no new hook, endpoint, or marker — it reuses the existing capture path — but it does genuinely widen
the elicitation's firing rate, which is exactly the property the mentor's prior ruling turned on.

**A real design mistake was caught and corrected while drafting §2.** An early version proposed
arming the widened elicitation on a bare `is_kathekon === false` reading. This session's own opening
Gate-2 frame (visible in this very conversation's system reminders) carried exactly that reading —
`is_kathekon=false — quality=contrary — No kathekon factors were extracted` — on a documents-only
governance session with nothing adverse in it. Cross-checked against `CLAUDE.md`'s own SD-1 finding
(the guardrail's documented "sparse-extraction fail-open guard" — a bare `is_kathekon:false` is a
known sparse-default reading, not a genuine adverse finding, per a real production defect this
project already found and fixed once on a sibling surface): arming the elicitation on that signal
unqualified would very likely fire on ordinary sessions like this one, reproducing Letter V's own
false-positive erosion class in a new location. Fixed by naming the distinction as an open design
detail rather than papering over it with a plausible-sounding gate condition.

**Opening 3 (close-hook content legibility) is independently real.** `renderReflectInvitation()` is a
fully invariant string — the same five questions, worded identically, at every close, for every
session — verified by direct read, not assumed. Proposed: derive part of the close-turn's content
from the session's own harness record (whether a guard caution or a poor consult verdict fired this
session) rather than the fully generic prompt, on-condition, leaving the generic form unchanged for
sessions with no such events.

---

## What this document explicitly does not do

**No code was written.** `at-action-hook.mjs` and `close-hook.mjs` were read, not edited. Opening 1's
proposed measurement (counting existing `ELICIT`/`GUARD-CAUTION` log lines against total consequential
actions) is named as answerable without a mentor ruling, but was not run this session — no access to
the harness's live log files from this repo session. Openings 2 and 3 are named, per PR20, as carrying
the same architectural consequence class the prior ruling engaged (H3's firing rate; the one
instrument the corpus credits as not yet eroded), and are explicitly **not** authorised to build —
the same gate the prior, structurally similar proposal went through, applied here rather than skipped
because this one reuses machinery instead of adding a hook.

---

## Mentor ruling — RECEIVED and FOLDED, 2026-08-25

**§2 (opening 2) HELD** — not on the frequency grounds the item-4 ruling turned on (named real but
secondary here), but on the flagged design gap this document itself surfaced and left open: the
Gate-2 consult's output has no signal-quality indicator distinguishing a genuine adverse verdict from
a sparse-extraction default, so an unfiltered trigger would be "noise," not a trigger. Reopen when
that basis exists; the frequency question is deferred to that point, to be ruled with real firing-rate
data.

**§3 (opening 3) RULED FOR, split into two phases.** Phase one — vary the close turn's content
on-condition from a guard-CAUTION signal only (not the consult verdict, which carries the same
signal-quality gap as §2) — is **cleared now**. Phase two (extending to consult verdicts) is gated on
the same signal-quality resolution as §2. Design guidance: interpolate session-specific content into
the existing invariant five-question structure, reusing the elicitation's own interpolation pattern,
rather than replacing the base prompt.

**The coverage-gap question, answered:** opening 3 alone partially closes the gap (the legibility
problem at the close turn) but not the temporal gap between a mid-session event and the close turn,
which opening 2 would close once specifiable. Ruled sequencing: opening 3 phase one first, opening 2
second, when its trigger is specifiable.

Verbatim: `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md`.
Folded into the scope document (a top banner, per-section disposition notes on §2/§3, a new §4a, an
updated §6). Decision-log: `D-IW7-THREE-OPENINGS-RULED-2026-08-25`.

**No build in this session.** §3 phase one is now mentor-cleared, but this session's own tier is
`governance`, no code — building it is its own election into a code-tier session (harness code;
likely warranting the same PR19 independent-review discipline every prior harness change in this
project has received), not an automatic consequence of a favourable ruling. Named as the clear next
candidate in §6, not taken here.

---

## Records

- `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md` — new, then folded with the ruling
- `operations/reflections-examination-2026-08/2026-08-25-mentor-ruling-iw7-three-openings-verbatim.md` — new
- `operations/decision-log.md` — entry appended at the physical tail
- this close — new

---

## §1's measurement task — run

At the founder's election ("1 measurement task"). Report:
`operations/reflections-examination-2026-08/2026-08-25-iw7-opening1-measurement.md`, folded into the
scope document. Run against the live `~/.sage-gate1/gate1.log` (28,406 lines, 2026-07-12–2026-08-25,
exhaustive — every line accounted for, not a sample), the founder's own dogfood harness log, the same
session store the 100-reflection corpus was drawn from.

**Result: the scope document's inference was correct and stronger than stated.** Completed
elicitations reach **12.9%** of the guard cautions that arm them, **2.1%** of total decision volume.
**An unanticipated second finding:** the completion rate is declining across the window — 29.2% in
July, 7.0% in August — driven almost entirely by the discernment route's own HTTP 503 rate more than
doubling (18 → 45 outages). That is an infrastructure fact about a live service, not a property of
the trigger design, and it is named rather than diagnosed: diagnosing or fixing it is a SageReasoning
project-stream concern, outside this documents-only reflections session's scope.

## What comes next — superseded by later same-day sessions

Items 2 and 3 above were both actioned the same day: the discernment 503 rate is flagged as a
background task; the signal-quality gap was scoped and ruled
(`operations/handoffs/founder/2026-08-25-signal-quality-gap-CLOSE.md`), unblocking opening 3 phase
two while reconfirming opening 2's hold. This document's own §2/§3/§6 carry the resulting fold. The
live next step is:

1. Elect §3 (both phases, now both ruled-for) into its own code-tier session.

---

## Commit

Committed. **Not yet pushed** — the founder pushes.
`website/src/data/environmental-context.json` and `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
are unrelated, concurrent modifications (the latter a peer session's own active work, confirmed via
`git status`/`git log` before staging) and are excluded from this session's commit.
