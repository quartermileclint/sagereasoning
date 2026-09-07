# Mentor ruling — S9 four questions (VERBATIM, CANONICAL)

**Received 2026-09-08 ~04:00 AEST (`date`) = 2026-09-07 ~18:00 UTC.**
**This file is the canonical record. Where any summary, decision-log entry or register row differs
from the text below, THIS TEXT WINS.**

Questions relayed by the founder at S9 close, arising from
`D-S9-CONDITION-1-AGENTID-PARENT-SESSION-PASSES-2026-09-08`. All four AI recommendations were
**upheld**; question 3's was **elevated in force** (founder question → standing requirement) and
question 4's gained a **substantive addition**.

---

## Session S9 — four questions ruled

---

### Question 1: Does this session's capture satisfy Condition 2?

No. The recommendation is correct and is ruled on its own stated grounds.

Condition 2 requires a second live capture on a separate day and session. The value of a second
capture is precisely to test what varies with wall-clock conditions — server state, session
initialisation, client behaviour across time. A same-day capture on the same client cannot test those
dimensions. It confirms the finding holds across session IDs, which is useful, but it does not
discharge what Condition 2 exists to establish.

The next capture for Condition 2 should be on a genuinely different calendar day, different session
ID, same client version (2.1.260). The day boundary is literal, not approximate.

Condition 2 remains outstanding.

---

### Question 2: Does Configuration 5's absence leave Condition 1 incomplete?

No. Condition 1 stands complete without it. The recommendation is correct.

Condition 1 is scoped to the parent-versus-agent distinction on the current harness as wired. It
passed: a top-level parent session never carried `agent_id` in H3's stdin across a control, two
configurations isolating the ruling's decisive cases, and worktree isolation. That is what Condition 1
asks.

Testing a second client entrypoint under Condition 1 would duplicate work Condition 3 already exists
to do. Condition 3 is explicitly about client-version pinning and version stability. The work belongs
there.

Condition 1: complete. Conditions 2 and 3: outstanding.

---

### Question 3: The GATE1_DEBUG revert-lag — what is owed before the next debug session?

The recommendation is correct and is elevated from a founder question to a standing requirement before
Condition 2's capture session runs.

The revert-lag is now sentinel-proven, not merely timestamp-inferred. The mechanism is unknown. The
dumps carry raw tool input and session content.

Before any session runs GATE1_DEBUG again — including Condition 2's capture session — the following is
required:

Open a fresh session. Run a control probe. Confirm no fresh dumps appear.

If dumps appear, the variable is still live and its persistence mechanism must be understood before it
is used again. If no dumps appear, the session is genuinely inert and Condition 2's capture may
proceed.

The `rm ~/.sage-gate1/*-stdin.json` cleanup the summary names is the right first step. The confirmation
probe is the second. Both are required. Neither is optional.

A debug session run without this confirmation is a debug session whose outputs cannot be trusted to
reflect the current wire rather than a residual state.

This is not a high-cost requirement. It is a one-probe check at the start of a session. The cost of
skipping it is that Condition 2's capture may be contaminated by a state the session did not know it
was in. That is the same class of invisible contamination the project has ruled against consistently.

---

### Question 4: Disclosed caveat or corrected measurement for the instrument-composition finding?

Disclosed caveat is sufficient for now. The recommendation is correct, with one addition.

The finding — that the consult denominator is sensitive to which tool a session happens to author
with, Bash heredoc versus Write/Edit for identical work — is a structural property of the measurement,
not a defect in a specific session's records. Correcting it mid-window would be the post-hoc narrowing
of a population the project has ruled against twice. The consistent treatment is disclosure.

The addition: this finding must be folded into the pre-flip report not only as a named limitation but
as a named structural dependency. The report should state explicitly that the consult denominator's
composition is partly a function of tool mode, that tool mode is partly a function of the kind of work
a session does, and that this means the measured population is not a random sample of all actions the
agent takes — it is a sample of actions taken with Write/Edit/MultiEdit/NotebookEdit tools. A reader of
the false-hold rate should see that dependency clearly, not discover it in a session's evidence file.

The loop-count-by-action-class report the prior ruling required already carries this. The
instrument-composition finding is folded into that report as a parallel disclosure: loop counts by
action class, consult denominator composition by tool mode, both named as structural properties of the
measurement rather than session-specific artefacts.
