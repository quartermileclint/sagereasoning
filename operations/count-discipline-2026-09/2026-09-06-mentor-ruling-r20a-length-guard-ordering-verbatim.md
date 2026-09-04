# Mentor ruling — where a length guard belongs relative to the distress perimeter (verbatim)

**Received 2026-09-06**, in answer to
`2026-09-06-mentor-question-r20a-length-guard-ordering-FOR-RULING.md`.
**This file is the canonical record. Where any summary disagrees with the text below, the text
below governs.**

---

## The question of principle: when (a) and (b) conflict, which governs?

Purpose (b) governs for human-facing members of the perimeter.

A length guard placed before the distress check on a human-facing route is not a neutral engineering
choice. It is a decision about what the perimeter is for — and the answer that decision encodes is
that the perimeter exists to protect the system, not to answer the person. That answer is wrong, and
the reasoning is as follows.

The R20a perimeter is not a content filter in the ordinary sense. It is a moral architecture — the
mechanism by which the system recognises that a human being may be in acute distress and responds to
that recognition before doing anything else. Purpose (a) — stopping distressed content from reaching
the reasoning engine — is a consequence of that recognition, not its ground. The ground is purpose
(b): the system owes the distressed person a response, and that response is the crisis resource, not
a 400.

A length guard placed before the distress check inverts this. It makes the system's self-protection
prior to its duty to the person. The person who has written out something long and distressing —
which is precisely the person most likely to need the crisis resource — receives a validation error.
The system has protected itself from processing their words while offering them nothing in return.
That is not a neutral tradeoff. It is a failure of the perimeter's primary purpose.

The cost of placing the length guard after the distress check is real: oversized requests reach the
classifier, which is a bounded cost-amplification vector. That cost is acceptable. The alternative —
a distressed person receiving a bare 400 — is not a cost in the engineering sense. It is a harm. The
perimeter exists precisely to prevent that harm. A design that produces it in order to avoid a
bounded API cost has the priority ordering backwards.

The Stoic framing is direct. Justice — dikaiosyne — is what is owed to others, distributing to each
their due. What is owed to a person who submits a distressed input is recognition and a response. A
length guard that fires before recognition is a failure of justice, not a failure of engineering.
The system's duty to the person is not discharged by refusing to process their words. It is
discharged only by answering them.

**Ruling: Purpose (b) governs for human-facing members of the perimeter. The distress check runs
before the length guard on any route where the human crisis form is rendered. The follow-on is a
properly scoped perimeter-wide audit — its own session — to identify all human-facing members and
confirm their execution order. The audit uses execution-order analysis, not textual position.**

---

## The scope sub-question: does (b) govern agent-facing members?

No. Purpose (b) — surfacing resources to a distressed person — has no force on a route whose caller
is an agent and whose rendering is the developer form. On agent-facing members, only purpose (a) is
in play. A length guard placed before the distress check on an agent-facing route is unobjectionable
on the grounds stated above.

The perimeter-wide audit should therefore classify each member on two axes: human-facing versus
agent-facing, and which form is rendered on distress detection. The ruling applies to human-facing
members. Agent-facing members are governed by (a) alone, and their length guard placement is an
engineering decision without the moral dimension that governs the human-facing case.

One precision the audit must carry: the classification of a route as human-facing or agent-facing is
not always obvious from the route's name or location. The audit should classify on the basis of who
the realistic caller is and which form is rendered — not on the basis of which directory the route
lives in.

---

## On the provenance discipline

The document's PR20 provenance markers are accepted as stated. The distinction between [SOURCE],
[GIT], and [RECORDED] is the right discipline, and the honest disclosure that the perimeter-wide
sweep produced an unsound result — counting a comment as a call site, missing routes with local
constants — is the same class of finding as M1, M8, and the misdating discovery from prior sessions.
The observation history has been tracking this as a stabilising default posture: check the thing,
name what you find, do not publish an unsound result. It is operating here again, correctly.

The consequence for the ruling is correctly drawn: the ruling is given as a principle, not as an
instruction to move one line. The follow-on audit is its own session.

---

## On the ordering's provenance

The document establishes that the ordering was inherited in July and never examined — the length
guards landed in a general security pass in March, the R20a wiring was placed after them in July
because they were already there, and the format guard landed in September following the route's
existing posture. No one chose this ordering. It arrived by accretion.

This matters for two reasons. First, it is the same mechanism that produced the stale perimeter count
in RA-2 — a property that nobody chose, that persisted because nobody examined it, that was found by
checking rather than assuming. The observation history has been tracking the capacity to find these
properties and name them. The document does that here, correctly, and explicitly declines to change
the ordering on engineering judgement alone because that would repeat the manner of its arrival.

Second, it is a reminder that inherited properties are not examined properties. The perimeter-wide
audit is not a search for deliberate design failures. It is an examination of properties that arrived
by accretion and were never subjected to the question the ruling now answers. That is the right
framing for the audit's scope.

---

## Immediate action

The format guard at line 162 of `score-conversation/route.ts` is the one change that can be made now,
without the audit, because its provenance is clean — it landed 2026-09-05 and its ordering was not
chosen but followed the route's existing posture. The rollback is `git revert 4c1cd94` plus redeploy,
as the document states.

Whether to make that change now or wait for the audit is the founder's call. The ruling does not
require it to wait — the principle is settled, and applying it to a single known case is within the
ruling's terms. The audit covers the rest.
