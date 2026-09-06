# Session close — S9, harness-side A11b schema-token redaction

**2026-09-06** (machine date). Tier `code-elevated`, autonomous. **Harness files only — no
production route, schema, flag, credential or migration touched, and the injection defence itself is
byte-untouched (`git diff --stat` on `injection-defence.ts` is empty).** Model `claude-opus-5`.
Decision-log entry: `D-S9-HARNESS-A11B-REDACTION-BUILT-2026-09-06`.

## Production state at close

**UNCHANGED, and unchangeable by this session** — nothing here deploys. The harness runs locally in
the founder's own Claude Code loop.

## The problem

`website/src/lib/translation-sandwich/injection-defence.ts` rejects any Layer-1 input containing the
substrate's own internal field identifiers (`distress_detected`, `shouldRedirect`, `is_kathekon`,
`layer1_schema`, `severity: none`, and their siblings). That is correct for a practitioner: nobody
writing about their day types those words. But a session that MAINTAINS the substrate produces them
constantly — in edits, in transcripts, in its own prompts. The harness sends exactly that text to
three surfaces that run Layer-1 extraction, so the defence fired, the routes failed closed, and the
harness went blind on precisely the sessions where the agent's actions matter most. The `gate1.log`
line was indistinguishable from a genuine outage, which is why it was misdiagnosed as an upstream
rate limit before the founder's `route_errors` query settled it.

Observed in this arc: Session 3 logged 18 consult outages and 19 discernment 503s from this cause
alone; Session 3C logged an unframed prompt; and writing the S9 session paste tripped it again,
because the paste necessarily quotes the tokens it describes.

## The ruling (mentor, 2026-09-05, Part 4)

Remedy (a), harness-side redaction, governs. The defence stays untouched. A credential-scoped
downgrade was considered and explicitly **not** elected — *"a trust-scoped exception in a security
surface … the exact shape a defence should not have."* Accept-and-classify was ruled *"not
acceptable as a permanent posture."*

On the channel law the mentor answered directly: a mechanically redacted tail **is** still
out-of-band verbatim, because *"it is shaped by a rule, not by the agent"* — conditional on the rule
being disclosed in the harness documentation and the redaction being logged.

## What was built

`claude-code/hooks/lib/schema-redaction.mjs` — one rule, in one place. Each token is replaced by
`⟨schema-field⟩`, which names the category so a reader knows what was replaced; the count is
returned and logged as `redacted=N`. Redaction runs **last**, after truncation, so the count is what
was actually sent, and a token split by truncation is left alone deliberately (a fragment is not a
defence match either).

**Applied to the three surfaces whose text is actually examined:**

| Surface | Fields |
|---|---|
| `/api/reason` consult | `input`, `context` |
| `/api/guardrail` | `action`, `context` — an unredacted action is an UNGUARDED action |
| `/api/practice/discernment` spawn | `reasoning_trace.trace` |

**Deliberately NOT applied**, and this is the substantive scoping judgement of the session: the
accreditation write and the hand-back carry **server-signed assessment envelopes** whose fields
legitimately include these identifiers. Redacting them would corrupt the signed bytes and break the
verification that the whole trust record rests on — and neither route runs Layer-1 extraction, so
the defence never sees them and there was nothing to fix. `/api/practice/reflect` likewise runs no
extraction. `delegated_task_preview` and the profile blocks are sent but never examined, so shaping
them would alter text nobody reads and widen the channel-law disclosure for no benefit.

The sweep that established this found **seven** fetch call sites, not the two the session paste
named — the paste's own warning that its list might be incomplete was correct.

## Verification

`schema-redaction.test.mjs` **24/0** · logic-harness **173/0** · negative-battery **RELEASE GATE:
PASS** · false-hold-capture **37/0** · close-content-variation **70/0** · the server-side
`injection-defence.test.ts` **60/0** with the defence byte-untouched · every `.mjs` `node --check`
clean.

**Mutation record** (16 mutations, hash-verified restore, all RED, post-restore GREEN): the token
list drifting from the defence; the placeholder emptied, or changed to a defence token; case- and
global-flag dropped; the count not incremented; word boundaries removed; each of the three surfaces
sending unredacted text; a count dropped from one failure path; the log dropping the count; and the
scope fence — the accreditation write importing the redactor at all.

**DIV-1 is the load-bearing pin.** The harness cannot import the TypeScript defence, so its token
list is hard-coded — and this project has gone stale on hand-copied constants repeatedly. DIV-1
re-reads `injection-defence.ts` and asserts byte-identity, so the day the defence's list moves, the
battery goes red rather than the harness silently under-redacting.

## Honest limits, and four in-build corrections worth recording

1. **My first divergence extractor read the wrong pattern.** It anchored on the first textual
   occurrence of `schema_field_injection`, which is a doc comment several lines above the real
   entry, and compared the harness against `instruction_override`. Fixed to anchor on the entry
   itself, with DIV-0 asserting that entry is unique.
2. **I hard-coded a count inside the very battery written to prevent count drift.** A pin asserted
   the defence has five pattern categories; it has six — I had missed `role_reassignment`. The pin
   now derives the number from the defence's own array. The substantive claim was unaffected (the
   placeholder was tested against all six and trips none), but the shape of the error is exactly the
   one this project keeps relearning.
3. **A threshold pin passed a mutation it should have caught.** WIRE-5 asserted "at least twelve
   occurrences" where the real property is universal, so dropping the count from one failure path
   stayed green. Replaced with a brace-matched check that every return carries it. The first cut of
   that replacement then failed on correct code, because it took the first `{` after the function
   name as the body — both signatures destructure, so that brace belongs to the parameter list.
4. **The count was wired to every outage line but not to the SUCCESS lines.** The ruling says "per
   call", and a successful call is a call — worse, the success path is exactly the case that
   demonstrates the fix, so the evidence was invisible. Found by reading `gate1.log` after a
   token-dense consult returned a verdict and logged no count. WIRE-6 had passed anyway, because it
   only required the count to appear somewhere in the file, and it did — on the outage paths. It now
   enumerates all nine log lines; both new paths are mutation-verified.

Two of the four were found by the mutation harness and one by reading the live log — none by
reviewing my own diff. That is the argument for running both.

## Owed

| # | Item | Owner |
|---|---|---|
| 1 | Push the S9 commit | founder |
| 2 | Confirm `redacted=N` appears in `gate1.log` on the next substrate-editing session | founder or a later session |
| 3 | **S5 — the next row** (D2 scope-for-ruling, autonomous, before S4(d)) — paste authored: `2026-09-06-SESSION-S5-D2-scope-for-ruling-SESSION-PASTE.md` | a Session S5 |

## Rollback

`git revert` the commit. The harness returns to failing closed on substrate sessions, which is the
status quo; nothing in production is affected either way.

## Cross-references

`D-S9-HARNESS-A11B-REDACTION-BUILT-2026-09-06`; the ruling
`operations/count-discipline-2026-09/2026-09-05-mentor-rulings-five-relays-verbatim.md` Part 4;
memory `harness-blind-on-substrate-sessions-a11b-schema-tokens`; the paste
`2026-09-06-SESSION-S9-harness-a11b-redaction-SESSION-PASTE.md` (executed).
