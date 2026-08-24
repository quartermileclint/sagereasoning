# Next-Session Prompt — The named-input register, and the concurrent-session coordination mechanism

**Paste as the first message of a new session, in the `sagereasoning` repo root.**

**Stream:** founder.
**Tier:** `governance` — **documents only.** No code, no flag, no schema, no credential, no public
surface, no live operation. **AC7 not engaged.**
**Risk:** Standard under 0d-ii.
**Governing frame:** `/adopted/standing-protocol-cache.md`.
**Predecessor:** commits `d2d4002` + `cfad444`
(`D-DELIBERATION-READING-OPEN-QUESTION-ROUTING-BRIEF-AUTHORED-2026-08-24`,
`D-DELIBERATION-READING-OPEN-QUESTION-ROUTED-STANDING-RUNNER-2026-08-24`), close at
`operations/handoffs/founder/2026-08-24-deliberation-reading-open-question-routing-CLOSE.md`.

**This is NOT a continuation of §5d.** That question is routed, anchored, and deliberately parked
until the standing-runner design session. **Nothing in this session touches it.** This session takes
up the **two carried items** the §5d session surfaced and deliberately did not act on — both of which
are about how this project's records survive concurrency and deferral, and **both of which need a
founder election rather than an AI choice.**

**If the founder wants a different session instead,** these prompts appear unspent (spent-state **not
verified** — check each before opening): `2026-08-19-post-taxonomy-stubs-task-menu`,
`2026-08-22-item3-activation-and-item4-rls-walk`, `2026-08-22-mechanical-items-234-and-routing`,
`2026-08-23-post-item4-housekeeping`. This session is small and can be deferred without cost to any
of them.

---

## Step 0 — Open and re-ground

1. Read `/adopted/standing-protocol-cache.md`.
2. Read the predecessor close (path above) — specifically its **Open Questions** section, which is
   this session's entire agenda.
3. Read `2026-08-19-mentor-ruling-late-arriving-carry-forward-ruled-session-verbatim.md` **in full**
   — it is the binding source of the "named input" mechanism, and Item 1 is about whether that
   mechanism has a register.
4. `git log -1` / `git status` — confirm HEAD is at or after `cfad444`.
5. `ListAgents` — **expect many.** See the concurrency note; it is also Item 2's evidence.
6. Confirm at open: tier; hold-point P0 0h; weights BLOCKED; **documents only.**

---

## Item 1 — The named-input mechanism has no register (a CLASS, not an instance)

**Where this came from.** The §5d session found that the 2026-08-19 precedent's own named input — the
conjectural entry type, redirected to the standing-runner design session — is anchored **only** in its
producing design document
(`2026-08-19-DESIGN-THINKING-puzzle-taxonomy-entry-types-mathematical-discovery-modes.md`, at the
ruled blockquote *"carry-forward redirected to standing-runner design session per 2026-08-19 ruling —
to be examined when that session opens, not before"*) and appears **nowhere** in the gates table of
`operations/primal-substrate-2026-08/00-PRIORITY-INDEX.md`. A standing-runner session reading that
register at open would not find it. The §5d session **indexed its own routing rather than repeating
the pattern**, and **deliberately did not touch the other document** — someone else's record, outside
that session's scope.

**Then a survey showed it is not one instance.** A `grep -rn "named input" operations/ --include=*.md`
run 2026-08-24 returned occurrences across roughly a dozen documents — named inputs held for the
**ATRF scoping session** (GS-ATRF-1..4; the sufficiency-examination items; the provenance/credence
one-framework-or-two question), for the **standing-runner design** (the conjectural entry type; now
§5d), for the **runner scoping session** (`2026-08-10-runner-scoping.md`), and more from the
2026-08-21 five-questions rulings and the 2026-08-22 complexity-science addendum.

> **The honest scope of that check, stated because the session depends on it (PR25's discipline
> applied to prose):** the grep establishes only that the *phrase* occurs in those documents. **No
> one has verified which of those named inputs are registered anywhere a receiving session would
> read, and which are not.** That enumeration is this session's first task, not an inherited finding.

**The question this raises, and it is genuinely open:** the 2026-08-19 ruling created a real mechanism
— a question is held as a named input to a session that has not yet opened — but **named no register
for it.** Each holder records the input in its own producing document. When the receiving session
finally opens, there is no single surface it reads to discover what it has inherited. The
reconstruction burden falls on whichever session happens to look, which is precisely the failure the
mechanism exists to prevent.

**Step 1 — enumerate, first-hand.** For each named input found, record: what it is, which session it
is held for, which document holds it, and **whether any register a receiving session would plausibly
read at open points at it.** Verify each at source. Do not carry a claim forward from this prompt.

**Step 2 — put it to the founder as an election, not a recommendation.** Plausible shapes, none of
them pre-chosen here:
- **(a) A register per receiving session** — each pending session gets a stub document listing its
  inherited inputs; holders point at it.
- **(b) One register** — a single `named-inputs.md`, indexed by receiving session.
- **(c) Extend the gates table** — what the §5d session did for its own routing, generalised.
- **(d) A convention only** — every named input must also be registered wherever its receiving
  session is named, with no new artifact.
- **(e) Do nothing** — record the enumeration as the register and leave the mechanism as ruled.

**(e) is a real option, not a courtesy one.** The 2026-08-19 ruling is binding and did not ask for a
register; adding governance machinery the mentor did not order is its own risk, and PR1's discipline
cuts against inventing a general artifact when the specific case is handled.

**Step 3 — if the founder elects a mechanism that changes a ruled procedure, it goes to the mentor,
not into the repo.** The named-input mechanism was mentor-ruled. Extending it is a governance change
to a ruled mechanism — the §5d session's own lesson is that a persuasive AI reading of a binding
ruling is the most dangerous way to make a decision look authorised. **Options (a)–(c) probably need a
ruling; (d) and (e) probably do not.** That judgement is itself for the founder.

**Do NOT edit another session's document to fix its unregistered input** until the shape is elected.
That is the specific restraint the §5d session exercised and the reason this item exists at all.

---

## Item 2 — The concurrent-session coordination mechanism (the condition is now met)

**The predecessor-of-the-predecessor named this and attached a condition:** *"A working-tree check
detects staged and committed state but not another session mid-edit; if that is going to keep
happening, a real mechanism is owed."*

**It kept happening.** At the §5d session: **ten peer sessions open at session open**, `adopted/`
modified in the working tree by a concurrent session, and **HEAD moved mid-session** (`8aa9fae` →
`d5669f4`, a peer's reflections-arc commit landing while the session was reading files). Path-scoped
commits kept it harmless — for the second consecutive session. **That is the condition the earlier
close attached to the recommendation, now satisfied.**

**What has worked so far, and what it does not cover.** Path-scoped commits + a `git status` check
immediately before staging have prevented every actual collision to date. They do **not** detect a
peer mid-edit, and they do **not** help when two sessions edit the *same* shared record — and this
project has several heavily co-edited ones (`operations/decision-log.md`,
`00-PRIORITY-INDEX.md`, `adopted/standing-protocol-cache.md`, `CLAUDE.md`). The decision log has
already accumulated **21 out-of-order entries across four separate prepending events**
(`D-DECISION-LOG-PLACEMENT-NOTE-2026-08-24`) — evidence that shared-record discipline drifts under
concurrency even when every individual session is careful.

**Step 1 — characterise the actual failure modes, from the record.** What has genuinely gone wrong
(the prepending events; `adopted/` edits appearing under a session that did not make them), versus
what has been caught in time. **Distinguish the two rigorously** — the temptation is to build a
mechanism against a hypothetical.

**Step 2 — put the options to the founder.** Candidate shapes, again not pre-chosen: a session
registry file each session touches at open and close; an append-only convention enforced by a
pre-commit hook (the PR22/PR25 escalation pattern this project already uses); a per-session
path-lease convention for the heavily co-edited files; `ListAgents` at open as a named protocol step
rather than an ad-hoc habit; or accepting the current practice with the discipline written down.

**Step 3 — if adopted, it is a process rule (PR26) and it updates the cache in the same session,**
per the cache's own update discipline, with a `D-CACHE-DRIFT-RESOLVED-…` entry. **Do not draft PR26
text before the founder has elected a shape.**

---

## Constraints that bind

- **Do not touch §5d, either published scope note, the lifetime formulation, or the standing-runner
  routing.** All settled at the predecessor.
- **Do not open the standing-runner design or the ATRF scoping session**, and do not examine any named
  input's *content* — this session is about whether they are findable, not what they say.
- **Do not edit another session's document to fix an unregistered input** before the shape is elected
  (Item 1, Step 3).
- **Do not draft PR26 text speculatively** (Item 2, Step 3).
- **Path-scoped commits**, excluding `website/src/data/environmental-context.json` and anything under
  `adopted/` this session did not itself author. `git status` before writing **and** again before
  committing. **This session is itself an instance of its own Item 2** — if concurrency bites during
  it, that is data, and it should be recorded rather than merely worked around.
- Weights BLOCKED. The Q1 hard constraint untouched. Nothing here bears on the 0h call.
- **`governance`/documents session ⇒ PR19 does not engage.** Say so rather than leaving it implicit —
  and note that the predecessor recorded "no independent review" as an honest limit on findings the
  mentor then adopted into a binding ruling. The same limit applies here.

## Rollback

`git revert` the records commit. Documents only; nothing deploys.

## What "done" looks like

Both items are enumerated from source rather than from this prompt, put to the founder as elections
with the do-nothing option genuinely on the table, and either (i) elected and recorded, (ii) elected
and routed to the mentor where a ruled mechanism would change, or (iii) deferred with the enumeration
itself standing as the useful artifact. **A session that produces the enumeration and no decision is a
success, not a failure** — the enumeration is the thing nobody currently has.

*End of prompt.*
