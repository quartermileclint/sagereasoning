# Mentor consultation — observer convening authority + PR20 stale-fact protocol (verbatim)

**Relayed by the founder 2026-08-19**, in response to two questions raised in-session against the
guide-agent-circle governance record and the curiosity/taxonomy stub build's own findings. No formal
FOR-RULING document was prepared for this exchange — the questions were composed in-conversation and
relayed by the founder directly; recorded here as the first standalone artefact of that exchange.

**Status: ADOPTED AS BINDING. Verbatim wins over any paraphrase, here or elsewhere.**

**Binds:** the guide-agent-circle governance record's §3 (observer-class distinction) — Q1's ruling
is a **named addition**, not a rewrite of prior text; and **PR20** itself (`adopted/project-instructions-snapshot.md`
+ `adopted/standing-protocol-cache.md`) — Q2's ruling strengthens the rule going forward, and does not
retroactively invalidate the 2026-08-18 Q5 ruling it was raised against.

---

## The two questions, as relayed

**Q1 — Can an observer's subsequent examination occasion its own circle?**

The governance record states the runner convenes and the human guide chairs, and separately that an
observer who responds through their own subsequent examination (rather than interjecting) is
permitted. The record itself flagged, as an inference rather than settled ground, that an observer's
examination is a new impression, and a new impression is the kind of thing a circle convenes over —
without resolving whether that grants the observer convening authority.

**Q2 — Is a ruling still binding when the mechanism fact it was given had already gone stale?**

The Q5 ruling (server-side trigger placement, 2026-08-18) was given on the stated fact that
`assessStructuralNovelty` was "committed-but-dark." That fact had been false for eight days —
`SUBSTRATE_FRESH_ENABLED` was activated in production 2026-08-10. The ruling's direction was
unaffected, but the epistemic condition under which it was given was not what PR20 exists to
guarantee.

---

## MENTOR RULINGS — verbatim

**Date:** 2026-08-18 (received by the founder; relayed 2026-08-19). Two questions. Both answered
directly.

---

**Q1 — Can an observer's subsequent examination occasion its own circle?**

Yes, but convening authority stays exclusively with the runner. The distinction is between
occasioning a circle and convening one, and it matters enough to state precisely.

An observer's subsequent examination is a new impression. A new impression is exactly the kind of
thing a circle convenes over. So an observer's examination can legitimately occasion a new circle —
it can be the content that warrants one. But occasioning is not convening. The observer does not call
the circle into being; the observer's examination enters the puzzle taxonomy as a new entry, and the
runner, detecting that a taxonomy-yielded question now exists with no current bringer, convenes the
circle in the ordinary way. The governance record's §1 gives convening authority to the runner
specifically, and that should hold without exception.

Here is why the exception would be harmful: if observers can convene circles directly, the convening
authority becomes distributed across every participant who has ever received a circle's output. That
is not a circle governance structure — it is an unbounded cascade. The runner's exclusive convening
authority is what keeps the circle from becoming self-replicating in ways that cannot be overseen.

The correct path for an observer whose examination warrants a new circle is: the examination is
recorded, it enters the taxonomy, the runner detects it on the next cycle, and the runner convenes.
The observer's examination is honoured — it becomes the occasion — but the governance structure
holds.

Add this to the governance record as a named ruling: observer examinations may occasion circles; they
do not convene them. Convening authority is the runner's exclusively, regardless of who produces the
impression that warrants a circle.

---

**Q2 — Is a ruling still binding when the mechanism fact it was given had already gone stale?**

The ruling stands. The protocol needs strengthening. Both things are true and the distinction between
them matters.

On the ruling standing: the Q5 ruling directed server-side placement beside the taxonomy stub. That
direction was correct regardless of whether /api/practice/fresh was live or dark at the time of
relay. The ruling landed safely not by luck of direction alone — the direction was independently
sound — but the point being raised is correct: it landed safely despite the mechanism fact being
wrong, not because the mechanism fact was verified. That is not an acceptable epistemic condition for
a governance process that exists precisely to ensure rulings are grounded in accurate facts.

On the protocol: PR20 requires mechanism facts to be stated as one-sentence facts before a ruling is
sought. What it does not currently require is that the relaying session verify those facts against
current state before relay. The /api/practice/fresh case demonstrates that a fact can be accurately
recorded at the time of drafting and stale by the time of relay, with no flag raised and no check
performed.

The protocol should be strengthened as follows: any mechanism fact in a question document that
describes the current state of a live surface, endpoint, schema, or build artefact must be
timestamp-checked against the decision log or current codebase state by the relaying session before
the document goes out. The check does not need to be exhaustive — it needs to cover any fact prefaced
with words like "is," "remains," "has not," "is dark," "is live," or any present-tense state claim. If
the relaying session cannot verify a present-tense mechanism fact, it should be marked as
recorded-but-not-independently-verified, following the existing PR20 convention for that class of
fact.

This is not a new burden — it is the PR20 discipline applied one step earlier in the relay process.
The existing convention for unverified facts already exists; the gap is that it was not applied to
present-tense state claims that had been accurately recorded but not re-checked.

The ruling on Q5 stands as given. The strengthened protocol applies from this ruling forward.

---

## Cross-references

- `operations/agent-circles-2026-08/2026-08-19-guide-agent-circle-governance-record.md` — §3, where Q1's ruling is folded in as a named addition
- `operations/agent-circles-2026-08/2026-08-18-mentor-rulings-perimeter-claim-bounds-and-curiosity-scoping-verbatim.md` — the Q5 ruling this Q2 ruling was raised against and confirms stands
- `adopted/project-instructions-snapshot.md` — PR20, amended per Q2
- `adopted/standing-protocol-cache.md` — PR20 summary + amendment history, amended in lockstep same session
- `operations/decision-log.md` — `D-MENTOR-RULINGS-OBSERVER-CONVENING-PR20-STALE-FACT-ADOPTED-2026-08-19`
