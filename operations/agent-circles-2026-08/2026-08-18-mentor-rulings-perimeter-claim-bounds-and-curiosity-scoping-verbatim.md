# Mentor rulings — perimeter claim bounds + curiosity/taxonomy scoping (verbatim)

**Relayed by the founder 2026-08-18**, in response to
`2026-08-18-mentor-questions-perimeter-and-curiosity-scoping-FOR-RULING.md`.

**Status: ADOPTED AS BINDING SPECIFICATION. Verbatim wins over any paraphrase, here or elsewhere.**

**Binds:** the `/limitations` published wording (Q3 — **AMENDS the 2026-08-17 ruling's instruction to
publish A3's original wording**); the `/api/guardrail` exclusion entry in
`website/src/lib/__tests__/r20a-invocation-guard.test.ts` (Q4); the `taxonomy_question` outcome value
and its deferred migration (Q1); the curiosity-trigger placement (Q5); and — as a standing principle
beyond this session — the ruling-fidelity pattern established in Q2.

---

**MENTOR RULINGS — Perimeter claim bounds + curiosity/taxonomy scoping**

**Date:** 2026-08-18. Five questions. Rulings given in order. Q2 and Q3 first, as they are blocking.

---

**Q2 — Substituted predicate: accepted.**

The substitution is accepted as faithful to the ruling.

The ruling's stated purpose was to remove a proxy that stood between the sweep and the truth. The
content-matching predicate would have replaced one proxy with another — authentication status
exchanged for content signature — and the measured cost of three dropped perimeter members
demonstrates this concretely. A predicate that silently stops guarding live members is not more
honest than the one it replaced; it is less honest, because it produces a green result while covering
less ground.

What was built instead — in scope equals a write verb and reads caller-supplied input, with the
content judgement moved into 29 written reasoned exclusion entries each requiring a stated reason —
serves the ruling's purpose more faithfully than the literal instruction would have. The content
judgement is now explicit, auditable, and human-readable rather than implicit in a predicate. That is
the right direction.

The principle this establishes for future build decisions: when a literal instruction produces a
measured regression against the ruling's stated purpose, the faithful move is to serve the purpose and
name the deviation, not to execute the instruction and accept the regression silently. That is what
was done here, and it is the correct pattern.

---

**Q3 — The published claim needs a bound. "Every time" over-promises.**

The corrected sweep does not discharge the standard as stated, and the fallibility is not ordinary
engineering. Here is why.

The standard set on 2026-08-17 was: "a filesystem-level sweep that produces a definitive count is a
prerequisite for publishing 'every time' honestly. The honest claim is only as strong as the
verification behind it."

The sweep now exists, runs green, and produces a definitive count. But within 24 hours of being built,
adversarial review found a structural blind spot — six live routes placing their input-reading in a
sibling handler file, silently outside the sweep's scope, with the battery green throughout. It was
reproduced with a synthetic unscreened route the sweep never flagged. It was fixed, and a regression
pin now names the four newly-visible routes directly.

This is not a story about a bug that was found and fixed. It is a story about a verification mechanism
that was found to have a structural blind spot discoverable only by adversarial review — and that was
discovered in practice, not hypothetically, within one day of the mechanism being built.

The sweep is now more robust than it was. It is not proven exhaustive. The distinction matters because
the claim being published is "every time" — a universal claim — and the verification behind it is a
mechanism that has demonstrated it can be structurally incomplete while running green.

The published claim should carry a bound. The wording should be honest about what the sweep is and
what it has demonstrated about itself. A formulation that works:

*"The distress check runs on every surface the sweep can see. The sweep is a mechanism: it has been
found structurally incomplete once, corrected, and hardened with a regression pin. It is the strongest
verification we can honestly offer, not a guarantee of exhaustiveness."*

This is not weakening the claim. It is making the claim honest at the level of the verification behind
it. A practitioner who reads "every time" and trusts it absolutely is trusting a universal claim backed
by a mechanism that has already demonstrated one blind spot. They deserve to know that. The bound is
the honest version of the claim.

If the wording on the /limitations page needs to be shorter than the above, the minimum honest version
is:

*"The check runs on every surface the sweep can see — the sweep has been tested, found incomplete once,
and corrected."*

That is the floor. Anything shorter than that is over-promising.

---

**Q1 — taxonomy-question outcome value: retain the intent, defer the migration.**

The bounded validation run has closed. The stated rationale — identifiable when it fires during that
run — cannot be met. The outcome value should not be added to the production table on an expired
rationale.

The intent behind it is sound and is retained: when the puzzle taxonomy yields a question and no
current bringer exists, that outcome should be identifiable and distinguishable from a null cycle. But
the right home for that distinction is the standing-runner design, not a production migration applied
now against a closed run.

Defer the schema migration until the standing-runner design opens. At that point the outcome value
should be added with the standing-runner's rationale — not the bounded-run rationale — and the spelling
should follow the established snake_case convention: `taxonomy_question`, not `taxonomy-question`.

The stub in the current build should be code-only, logging the outcome without writing to the
constrained column, until the migration is ruled and walked.

---

**Q4 — /api/guardrail: the deferred election is now resolvable. It stays outside.**

The deferred election from 2026-06-19 can now be resolved on the strength of the mechanism facts
stated. The human-reachable path into /api/guardrail runs through /api/compose and /api/execute, both
of which are now perimeter members that screen before forwarding. The human path is covered upstream.
The remaining direct path requires an agent credential, which places it in the standing exclusion
class — agent-credentialed surfaces are excluded on the same reasoning that applies to the rest of
that class.

The exclusion entry should be updated from a deferral to a reasoned judgement: excluded because the
human-reachable path is screened upstream by two perimeter members, and the remaining direct path is
agent-credentialed. The deferral notation should be retired.

This is the one member of the exclusion list that was resting on a deferral rather than a reason, and
it should not remain that way behind a published claim.

---

**Q5 — Curiosity-loop trigger placement: server-side, beside the taxonomy stub.**

The trigger belongs server-side, beside the taxonomy stub, for now.

The reasoning is the same as the reasoning behind placing the taxonomy stub there: the only live home
for anything connected to the fresh endpoint is server-side, and the standing-runner design has not
opened. Placing the trigger runner-side would defer it behind the standing-runner opening with no gain
— the trigger's function at stub stage is to log that it was reached and pass through, which is equally
achievable server-side.

When the standing-runner design opens, the question of whether the trigger migrates runner-side or
remains server-side should be revisited explicitly. The honest answer at that point may be that the
trigger belongs in both places — server-side as a seam that confirms novelty, runner-side as the
mechanism that acts on the confirmation. That is a question for the standing-runner scoping session,
not for now.

For now: server-side, beside the taxonomy stub, as the relay placed it. No further ruling needed
beyond this confirmation.
