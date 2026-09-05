> **RULED 2026-09-05** — Part 5 — the principle extends to P′ and to O where the screened text is present; J/A/F outside; three-condition boundary ruled. Verbatim (canonical): `operations/count-discipline-2026-09/2026-09-05-mentor-rulings-five-relays-verbatim.md`; adopted `D-MENTOR-RULINGS-FIVE-RELAYS-ADOPTED-2026-09-05`.

# Mentor question — does the length-guard ruling's principle extend to the other ways a human-facing route can refuse a person before the distress check runs?

**Prepared 2026-09-05 (22:58 AEST) for founder relay.** `governance`, documents only. Raised by the
perimeter-ordering audit (`2026-09-05-r20a-perimeter-ordering-AUDIT.md` §4.4) and deliberately put
to the mentor rather than decided by a session. **PR20:** every mechanism fact below is **[SOURCE]**
at HEAD `19509bb` (re-derived tonight — line numbers on the four Group-1 routes moved today) or
**[RECORDED]** from the audit.

---

## 1. The ruling as given, and its literal scope

*"Purpose (b) governs for human-facing members of the perimeter. The distress check runs before
the length guard on any route where the human crisis form is rendered."* Its ground: *"the system
owes the distressed person a response, and that response is the crisis resource, not a 400."*
(`2026-09-06-mentor-ruling-r20a-length-guard-ordering-verbatim.md`). The ruling speaks of **length
guards**. The audit executed it on that reading: 16 members, 39 guard sites; Group 1 (the nine
minima's first four) is live as of tonight.

## 2. What the audit found beside the length guards — recorded, not classified

On the same human-facing members, other rejections can also return **before** the check runs. Each
sends a distressed person a bare error, exactly the outcome the ruling names as a harm — but none is
a length guard. Five classes, with live sites:

| Class | What it refuses | Live sites (human-facing) |
|---|---|---|
| **J — malformed JSON** | a body that does not parse | 8 members (`readJsonBody` / `request.json()` catch → 400; e.g. `mentor/stoa/route.ts:346`, `:397`) |
| **A — founder-only 403** | any non-founder session | 10 members (`FOUNDER_USER_ID` gate) |
| **F — flag-off 503** | everything, when the feature flag is off | the Stoa pair (`stoaClosed()`; `mentor/stoa/route.ts:337`) |
| **O — non-text validation 400/503** | an enum, id, boolean, timestamp, or a missing encryption key | e.g. `mentor/private/reflect/route.ts:223` (`bypass_pattern_cache must be a boolean`); the Stoa `visibility` enum; `/api/reason`'s flag-gated `session_marker`/`loop_id` 400s; `mentor-appendix`/`mentor-profile` encryption 503 |
| **P′ — presence check on a DIFFERENT field than the one screened** | a body whose *screened* field carries distress but a *sibling* required field is missing | `score-scenario/route.ts:293` rejects a missing `scenario` while `:334` screens only `response`; `mentor/journal-feed/route.ts:47` rejects an empty `action` while `:87` screens `impression`; `journal/route.ts:34` rejects a missing `day_number` while `:54` screens `reflection_text` |

Class **P proper** — a presence check on the screened field itself — is different and not asked
about: no text exists to screen, and the audit's reviewers confirmed that reasoning holds only for
the *sole* screened field, which is why P′ is separated out above.

## 3. Why this is a question of principle and not engineering

Each class has a reason to sit first that is not about the system protecting itself:

- **J**: there is no field to screen at all — the body is not readable. Moving the check "before"
  it has no meaning; the only alternative is screening the raw body bytes.
- **A**: the 403 protects the founder's private surface from other humans; the person refused is
  *not* the founder, and the founder's crisis form is not owed to them on that route. But a
  non-founder in distress who hits it gets a 403.
- **F**: the whole feature is off; the route is honestly closed.
- **O**: the field being rejected is not text a person wrote in distress (a boolean, an enum).
- **P′** is the sharp one: the screened text *is present and may carry distress*, and the person is
  refused because a *different* field is missing. Under the ruling's ground — "what is owed to a
  person who submits a distressed input is recognition and a response" — this looks like the
  length case wearing a different coat. Under the ruling's letter it is not a length guard.

## 4. The question

**Does the principle the ruling states — recognition before refusal, on human-facing members —
bind only length guards, or every rejection that can fire on a body whose screened text is present
and readable?** Specifically:

1. **P′** — should a presence check on a sibling field move after the check, as the minima did?
   (Three sites; each a small move of the Group-1 shape.)
2. **O** — same question for non-text validation 400s where the screened text is present (the
   boolean, the enum, the id): is a distressed person owed the crisis form before being told their
   `visibility` value is invalid?
3. **J, A, F** — are these outside the principle by their nature (no readable text; a different
   person; a closed feature), so that no move is owed? The audit's reading is yes; it is put here so
   the boundary is ruled, not assumed.

## 5. What this session recommends, stated as its view and not as the answer

That the principle extends to **P′** (three moves, Group-1 shape, add to the remediation list) and
to **O where the screened text is present** (case by case), and that **J, A, F** are outside it.
The audit's §4.4 deliberately did not act on that view.

## 6. What is NOT asked

Whether the length ruling itself stands (it does; Group 1 executed it tonight and is live); anything
about agent-facing members (purpose (a) alone; unchanged); the S11 flip, the window, the 0h call.

**Relay note:** attach this document whole, and the ruling verbatim it extends. Record: the audit
§4.4; `D-R20A-PERIMETER-ORDERING-AUDIT-COMPLETE-2026-09-05`.
