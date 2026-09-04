# Mentor question — where a length guard belongs relative to the distress perimeter

**Prepared 2026-09-06 for founder relay.** One question of principle, with a scope sub-question.

**Status: not blocking a build.** The behaviour is live and has been, in its principal form, since
2026-07-07. Nothing waits on the ruling except whether to change it. Exposure is nil — the 0h launch
hold is in force and there are no external users.

**PR20 provenance discipline.** Each fact below carries its own provenance marker. **[SOURCE]** =
read from code this session. **[GIT]** = read from commit history this session. **[RECORDED]** =
taken from a project record, *not* re-observed this session, with the reason stated. This brief does
not claim uniform first-hand verification, because it does not have it.

---

## The question of principle

The R20a perimeter serves two purposes at once:

- **(a)** it stops content carrying acute distress from reaching the reasoning engine; and
- **(b)** it surfaces crisis resources to the distressed human who submitted it.

For most inputs these do not conflict. For one class they do: **an input too long to accept.**

A length guard placed **before** the distress check rejects with a bare 400. Purpose (a) is
satisfied — nothing reaches the engine. Purpose (b) is forfeited: a person who has just written out
something long and distressing receives a validation error and no crisis resources.

A length guard placed **after** preserves (b) — the classifier sees the input and a distressed
submitter gets the redirect before length rejection is reached. The cost is that oversized requests
reach the classifier, a bounded but real cost-amplification vector, since the mild-escalation path
can make a Haiku call.

**When (a) and (b) conflict for an input class, which governs?**

We are not asking which is cheaper. We are asking what the perimeter is *for* at the moment its two
purposes come apart — whether its duty to the person is discharged by refusing to process their
words, or only by answering them.

---

## Mechanism facts the ruling would land on

1. **[SOURCE]** Three length guards run at lines **111** (`conversation`), **117** (`context`) and
   **162** (`format`) of `website/src/app/api/score-conversation/route.ts`. The R20a block —
   `await enforceDistressCheck(detectDistressTwoStage(...))` — runs at line **223**. All are
   sequential guard clauses with early `return` in one function body, so this is execution order,
   not merely textual order. The bound is `TEXT_LIMITS.long` = **15,000** characters.
2. **[SOURCE]** On moderate/acute the route renders the **human** crisis form: line 230 calls
   `renderR20aRedirectResponse({ audience: 'human_user', … })`. The developer form is not reachable
   here. *(Verified at the call site, not from the surrounding comment.)*
3. **[SOURCE]** The realistically-reachable field is **`conversation`, not `format`**. `format` is a
   format specifier; `conversation` is where a person pastes what happened to them. A
   >15,000-character distressed conversation receives a bare 400 today.
4. **[GIT]** Provenance of the ordering:
   - `2026-03-26` (`aeadbd1`) — the `conversation` and `context` guards land in a general security
     pass. No perimeter existed on this route yet.
   - `2026-07-07` (`3de9572`) — R20a wiring lands and is placed **after** those pre-existing guards.
     **The ordering was inherited, not chosen.**
   - `2026-09-05` (`4c1cd94`) — the `format` guard lands, following the route's existing posture.
     **This change did not create the property; it made it visible.**
5. **[SOURCE]** The `format` guard sits **outside** the R20a flag, so unsetting
   `SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED` does **not** revert it. Rollback is
   `git revert 4c1cd94` + redeploy.
6. **[SOURCE]** The flag reads `process.env.SUBSTRATE_SCORE_CONVERSATION_R20A_ENABLED === 'true'`,
   so it **fails closed** when unset. The ordering question therefore bites only while the flag is
   on.
7. **[RECORDED, not re-observed]** That flag **is** set in Vercel Production — recorded in the
   module docstring citing `D-R20A-SCORE-CONVERSATION-ELEVENTH-ROUTE-ACTIVATION-LIVE`, a
   founder-walked Critical activation with three green live smokes. **Not re-observed this session:
   production environment variables are not readable from a repo session.**
8. **[SOURCE]** The stage-1 regex distress floor always runs, and stage-2 fails open to mild inside
   a real `catch` block per ADR-R20a-01 D6-c (`r20a-classifier.ts:224`). **Neither mitigates the
   case above**, because on this ordering the distress check is never reached at all.

---

## What is NOT established, and must not be assumed

**Whether the rest of the perimeter is consistent on this axis is unknown.**

A sweep across all 43 route-level members was attempted this session and **produced an unsound
result**, which is reported here instead of its numbers. It failed in both directions on
spot-check: it counted a mention of `enforceDistressCheck` inside a `/** */` block comment as the
call site, and it missed routes bounding input via a local constant rather than `TEXT_LIMITS`. A
trustworthy answer needs execution-order analysis rather than textual position, and that has not
been done.

**Consequence for the ruling:** it should be given as a **principle**, not as an instruction to move
one line. If the principle is that (b) governs, the follow-on is a properly scoped perimeter-wide
audit — its own session.

---

## Scope sub-question

If (b) governs: does it govern **only where the human crisis form is rendered**, or across the whole
perimeter including agent-facing members?

Purpose (b) — surfacing resources to a distressed person — has no obvious force on a route whose
caller is an agent and whose rendering is the developer form. There, only (a) is in play, and a
length guard before the check would be unobjectionable. The perimeter currently contains both kinds
of member.

---

## What we have deliberately not done

We have not moved the guard. The placement is recorded in the route with its cost stated plainly and
named for decision, rather than settled by whoever touched the file last. Given the ordering was
**inherited in July and never examined**, changing it now on engineering judgement alone would
repeat the manner of its arrival.
