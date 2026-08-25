# Session Close — 2026-08-26 — Provenance ledger: mentor ruling folded, Q1 returned

**Stream:** founder. **Tier:** `governance` — documents only. **Risk:** Standard. **AC7 not engaged.**
No code, schema, migration, flag, credential, public surface, or live operation. **Production
byte-equivalent.**

## What was done

Recorded and folded the mentor's ruling on Q1–Q4 into the scope document. Three of four are now decided
and implemented in the design; Q1 came back unruled because you (correctly) inferred options rather
than reading them off the scope, and the mentor declined to rule on an inference.

## Decisions Made

- `D-PROVENANCE-LEDGER-Q2Q3Q4-RULED-Q1-RETURNED-2026-08-26`

## What's now decided

**Q2 — the ledger gates on `supplied`, not just on missing.** This closes the gap that made the ledger
cosmetic. A resolved entry reading `supplied` refuses the mint exactly like a missing one, but with a
distinct, honestly-worded reason. The plugin path — which is *forced* to supply extraction — is named
as its own future question, not settled and not blocking everything else.

**Q3 — the departure from your ruling's exact wording is now labelled and argued, not asserted.** The
scope now shows its work: reusing `coverage_gaps` unmodified would blur a provenance refusal into an
existing A2-evidence signal (worse than not using it); widening its type would break a documented public
field's shape against every precedent this project has for adding this kind of thing. The sibling field
is recommended on those stated grounds — the mentor can still rule for widening `coverage_gaps` instead
if the breaking-change cost is acceptable to them.

**Q4 — half fixed, half genuinely still open, exactly as ruled.** The threshold no longer punishes an
agent for legitimately resubmitting an artifact the ledger predates — that population is now honestly
excluded from the completeness check rather than blocking it forever. **The 404 problem is not fixed.**
An agent whose every mint is refused gets no public record at all, so its refusals are invisible — which
the mentor called the more serious of the two findings. Two shapes are named (a stub record; a separate
surfacing mechanism) and neither is chosen.

## What's coming back to you

**Q1, with the real options this time.** The mentor's provisional guess at your three exits wasn't quite
right — you'd actually scoped a fourth-ish possibility (merging the harness's two credentials, trading
security posture for coverage) that wasn't in the guess, and your general "accept permanent refusal for
every split-pair agent" is broader than the mentor's narrower "just defer the harness." Those aren't the
same ruling, and which one lands changes how much of §9's threshold machinery is actually needed.
`2026-08-26-MENTOR-QUESTION-round2-provenance-ledger-q1-options.md` — please relay when ready.

## Founder Verification

Nothing new. Still owed from the prior close: the s9-loop consult credential's live `owner_user_id`
(decides how live Q1's premise is, not whether it's real).

## Status Changes

- Q2: **Ruled and implemented.**
- Q3: **Ruled — a genuine choice offered, awaiting the mentor's pick between sibling field and widened
  `coverage_gaps`.**
- Q4: **Half implemented (threshold), half open (404) — carried per the ruling.**
- Q1: **Unruled, returned with precise options.**

## Next Session Should

Relay `2026-08-26-MENTOR-QUESTION-round2-provenance-ledger-q1-options.md`, and — if there's appetite —
the still-open 404/stub-record question and the §9 cohort-freeze-vs-exception-register choice could ride
in the same relay rather than a third round.

## Blocked On

The mentor's answer to Q1 (round 2). The 404 and cohort-mechanism questions are open but not blocking
build slices that don't touch enforcement.

## Cross-references

- `operations/agent-circles-2026-08/2026-08-26-mentor-ruling-provenance-ledger-q1-q4-verbatim.md`
- `operations/agent-circles-2026-08/2026-08-26-MENTOR-QUESTION-round2-provenance-ledger-q1-options.md`
- `operations/agent-circles-2026-08/2026-08-26-provenance-ledger-SCOPE.md`
- `operations/decision-log.md` — `D-PROVENANCE-LEDGER-Q2Q3Q4-RULED-Q1-RETURNED-2026-08-26`

**Rollback:** `git revert` the session commit. Documents only.
