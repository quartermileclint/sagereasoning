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

## Records

- `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md` — new
- `operations/decision-log.md` — entry appended at the physical tail
- this close — new

---

## What comes next — three candidates, none chosen here

1. Relay the scope document to the mentor (the natural next step for §2 and §3).
2. Run §1's measurement task first, so any mentor relay carries an actual firing-rate number instead
   of an inference from reading the guard's allowlist.
3. Decline all three and record why — a founder call, the same way route (c) in the prior document
   was.

---

## Commit

Committed. **Not yet pushed** — the founder pushes.
`website/src/data/environmental-context.json` and `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
are unrelated, concurrent modifications (the latter a peer session's own active work, confirmed via
`git status`/`git log` before staging) and are excluded from this session's commit.
