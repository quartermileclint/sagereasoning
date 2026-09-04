# NEXT SESSION PROMPT — the R20a perimeter-ordering audit (ruled follow-on)

**Paste into a fresh session. Tier: `governance`** for the audit itself. **Any remediation it
identifies is `code-critical`** (R20a perimeter, PR6 + AC5) and is NOT part of this session.

**Authorised by:** `operations/count-discipline-2026-09/2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`
(read it first; it governs). Adopted under
`D-MENTOR-RULING-R20A-LENGTH-GUARD-ORDERING-ADOPTED-2026-09-06`.

---

## 1. The ruling this session executes

> **Purpose (b) governs for human-facing members of the perimeter. The distress check runs before
> the length guard on any route where the human crisis form is rendered. The follow-on is a properly
> scoped perimeter-wide audit — its own session — to identify all human-facing members and confirm
> their execution order. The audit uses execution-order analysis, not textual position.**

Where (a) = stopping distressed content reaching the engine; (b) = surfacing crisis resources to the
distressed person. The mentor's ground: *"the system owes the distressed person a response, and that
response is the crisis resource, not a 400."* A bare 400 to a distressed person *"is not a cost in
the engineering sense. It is a harm."*

**Agent-facing members are governed by (a) alone.** A length guard before the distress check there is
unobjectionable. **Do not "fix" them.**

---

## 2. What this session produces

A written audit, committed. **It changes no route.** Remediation is a separate founder-walked
Critical session, because every candidate is a live perimeter member.

Deliverable: one document classifying **every** route-level perimeter member on two axes and
recording its execution order, with the method stated and its limits disclosed.

---

## 3. Method — and the part that must not be repeated

**A textual-position sweep was attempted on 2026-09-06 and produced an unsound result.** It is
recorded as unsound in the mentor question and must not be resurrected. It failed in **both**
directions:

- it treated a mention of `enforceDistressCheck` inside a `/** */` block comment as the call site
  (it stripped `//` lines but not block comments); and
- it missed routes bounding input via a **local constant** (e.g. `FIELD_MAX` in
  `api/mentor/stoa/route.ts`) rather than `TEXT_LIMITS`.

Its 20 / 10 / 13 split was **discarded, not published.** Do not quote it. Re-derive.

**The ruling requires execution-order analysis, not textual position.** Textual order is a proxy that
fails on early returns, helper indirection, conditional branches, and guards living in an imported
module. At minimum: trace, per route, whether a rejection path can return **before** the
`enforceDistressCheck(detectDistressTwoStage(...))` call is reached, following the actual control
flow — including into `handler.ts` siblings and shared validators. Where a route's answer cannot be
established by reading, **say so** rather than guessing.

**Bounding forms to cover — establish the real set, do not inherit this list:** inline
`.length > TEXT_LIMITS.*`; the `validateTextLength(...)` helper; local constants (`FIELD_MAX`,
`TAG_MAX`, per-route caps); schema/zod validation; and any early `return` on a malformed body that
precedes the gate. Confirm the set from source before scanning for it.

---

## 4. The two-axis classification the ruling mandates

For each route-level member:

| Axis | Values | How to decide |
|---|---|---|
| Audience | human-facing / agent-facing | **who the realistic caller is** |
| Rendering on distress | human crisis form / developer form | the `audience:` argument at the actual `renderR20aRedirectResponse(...)` **call site** |

**The mentor's explicit precision:** *"the classification of a route as human-facing or agent-facing
is not always obvious from the route's name or location. The audit should classify on the basis of
who the realistic caller is and which form is rendered — not on the basis of which directory the
route lives in."*

So: **do not classify by path.** `/api/mentor/*` is not automatically human-facing;
`/api/skill/*` is not automatically agent-facing. Read the auth mode (cookie/JWT session vs
credential/Bearer) and the rendered form. Verify at the **call site**, not from a docstring — the
2026-09-06 session found `score-conversation`'s audience by reading `route.ts:230`, and the
surrounding comment would have served equally well while proving nothing.

---

## 5. Scope

Re-derive membership from `HUMAN_FACING_POST_ROUTES` and `SUBSTRATE_GATE_ROUTES` in
`website/src/lib/__tests__/r20a-invocation-guard.test.ts`. **Do not quote a count from any document,
including this prompt.** As of 2026-09-06 it derived to 43 route-level + 2 substrate-gate; treat that
as certain to be stale.

The 2 substrate-gate members use `enforceLayer2R20aGate`, a different pattern. Say whether the ruling
reaches them; do not assume either way.

---

## 6. Framing — from the ruling, and it matters

> *"The perimeter-wide audit is not a search for deliberate design failures. It is an examination of
> properties that arrived by accretion and were never subjected to the question the ruling now
> answers."*

Nobody chose the `score-conversation` ordering: guards landed 2026-03-26 in a general security pass,
R20a wiring was placed after them 2026-07-07 because they were already there, and the `format` guard
followed that posture 2026-09-05. Expect more of the same. **Report findings as inherited, not as
anyone's error** — and check provenance with `git log -L` before characterising any of them.

---

## 7. Already known, do not re-derive

`/api/score-conversation` — **human-facing** (`route.ts:230` renders `audience: 'human_user'`;
cookie/JWT auth, developer form unreachable). Three length guards at lines **111** / **117** / **162**
precede the R20a block at **223**. **Non-conformant under the ruling.** Its `format` guard is
separately actionable — see §8.

---

## 8. What is NOT this session's

- **The `format`-guard change** (`git revert 4c1cd94` + redeploy). The mentor left this to the
  founder: *"Whether to make that change now or wait for the audit is the founder's call."* If it has
  already been actioned, record that and move on; do not redo it.
- **Any remediation.** Every candidate is a live perimeter member ⇒ `code-critical`, founder-walked,
  its own session with its own PR19 pass.
- **Agent-facing members.** Classify them, then leave them alone.

---

## 9. Do NOT

Change any route. Apply a migration or flip a flag. Mint or size a credential. Touch
`.claude/settings.local.json`. Quote a perimeter count from a document. Resurrect the 20 / 10 / 13
split. Publish a classification whose method you could not make sound — **disclose the limit
instead**; the ruling explicitly commended that posture: *"check the thing, name what you find, do
not publish an unsound result."*

---

## 10. Open

`ListAgents` at open; `git status` at open and again before every staging; path-scoped commits, never
`git add -A`. Peers have been active on this checkout continuously. **A peer's push publishes your
commits — the commit, not the push, is the point of no return.**
