# SESSION PASTE — Session 3B: the R20a perimeter-ordering REMEDIATION, Group 2

**Founder: paste this ENTIRE file as the first message of a new session. Nothing else is needed.**

**Stream:** founder. **Tier:** `code-critical` — every candidate is a live R20a perimeter member
(PR6 + AC5). **Founder-walked (PR17):** the AI edits, tests, reviews; **you push, watch Vercel, and
run the live smokes.** AC7 engages at the push (not at the edit). **PR19 is REQUIRED** — three blind
reviewers on the group's diff before you push; if the account limit kills them, the AI completes
first-hand, discloses it, and an independent re-run gates the push (PR19 §4). **This session is
ATTENDED** — it needs two elections from you at open and your walk at the end.

**Written 2026-09-05, 22:50 AEST** (machine date — `date`; HEAD at writing `c5c0986`, pushed,
Vercel green, tree clean). Continues Session 3 of the 2026-09-05 plan under the same governing
prompt; Group 1 is LIVE.

---

## PART 1 — Open under the standard protocol

1. **`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md` — Version
   2026-09-05, in full.** Its S1 and S3 queue lines are already updated (S1 RUN; S3 Group 1 LIVE).
   If the opener has been updated past this writing, the newer version governs.
2. **`git status` (whole), `git fetch origin`, `git log --oneline origin/main..HEAD`, `ListAgents`.**
   Expected: clean tree; HEAD at or after `c5c0986`; nothing unpushed. Never stage another session's
   files; commit path-scoped; never `git add -A`.
3. **Confirm at open, one short paragraph:** tier `code-critical`; model (state it; disclose any
   switch — Session 3 switched from `claude-fable-5-1` to `claude-sonnet-5` mid-session by `/model`);
   AC7 engages at the push; PR19 required; PR20 (timestamp-check every present-tense mechanism fact);
   PR22 trailers; PR23 memory-first — read **`harness-blind-on-substrate-sessions-a11b-schema-tokens`**
   (new, see PART 2 §0), `human-routes-bearer-jwt-console-smoke`, `guard-scope-must-cover-the-class`,
   `nextjs-route-export-validation`, `tsx-tests-setinterval-keepalive-hang`; concurrency
   convention; P0 0h hold; status vocabulary; date discipline.
4. **Narrate the arc, one paragraph:** S1 (audit) RUN; S3 Group 1 LIVE and smoked; **this session is
   Group 2**; S2 (R18 corrections) still waits on the founder's signature; S4 (window readiness) not
   before 2026-09-08 UTC; the window has NOT started (`GATE1_FALSE_HOLD_CAPTURE` absent at writing —
   re-check keys only, never read a token).

---

## PART 2 — The task: Group 2, and one thing to know first

### §0 Expect the harness to go blind on you, and do not chase it

Read the memory above and `D-CONSULT-PATH-DEGRADATION-ROOT-CAUSE-A11B-SCHEMA-FIELD-INJECTION-FAIL-CLOSED-2026-09-05`.
**Every edit, battery, and message in this session will contain `distress_detected`,
`shouldRedirect`, `redirect_message`, `is_kathekon`.** The A11b injection defence hard-rejects
input containing those tokens (`injection-defence.ts:125`), so during this work: consults will log
`CONSULT-OUTAGE "no assessment in response"` (a masked HTTP 200 with `assessment: null` — R3);
elicitations will 503; guards may report "could not evaluate". **That is the defence working
correctly on the substrate's own maintenance text, not an outage.** Honor cautions, proceed
deliberately, record the counts in the close for B4 as self-inflicted, and **do not weaken the
defence** — the harness-side question (pre-redact vs flag-not-reject) is a founder/mentor call,
not this session's.

### §1 Governing documents — read in full, in this order

1. **The remediation prompt** — `2026-09-05-r20a-perimeter-ordering-REMEDIATION-NEXT-SESSION-PROMPT.md`
   (its top line records Group 1 done). Its §3 design constraints bind this session unchanged;
   **constraint 2 (bound what reaches the classifier) is THE design element of Group 2** — moving a
   maximum guard after the check sends unbounded text to `detectDistressTwoStage` unless a screening
   cap rides the move.
2. **The audit §6 Group 2 list** — `operations/count-discipline-2026-09/2026-09-05-r20a-perimeter-ordering-AUDIT.md`
   (rows 4/7/8/11 carry MOVED annotations from Group 1; §4.3 is the truncation residual you will now
   be creating deliberately and must disclose).
3. **The Group 1 precedent** — the four route diffs in `c679739` (`git show c679739 -- website/`),
   the shared helper `website/src/lib/__tests__/r20a-ordering-pin-helpers.ts`, and one battery
   (`website/src/app/api/reflect/__tests__/r20a-invocation.test.ts`) — the pin shape, the split
   discipline, the comment register, the mutation record.
4. **The Session 3 close** — `2026-09-05-r20a-perimeter-ordering-remediation-session3-CLOSE.md`
   (observed smoke outputs; what is owed).

### §2 Two founder elections at open (AskUserQuestion, then proceed)

**Election A — scope.** Group 2 is six items (audit §6 items 5–10). Recommended sitting: **items
5, 6, 7, 8** (the reflect pair, the two journal routes, score-conversation's two remaining maxima,
the five score-family routes) — one design shape (split-and-move plus a screening cap), 11 routes
touched, one PR19 pass, one push. **Item 9 (the Stoa restructure) and item 10 (`/api/reason`) are
different shapes** and are recommended for their own sittings. Alternative: items 5–7 only (six
routes) if you want a smaller first Group-2 push.

**Election B — `/api/reason` timing (item 10) and the R3 observability fix.** Both edit the measured
`/api/reason` surface and must land **before** you set `GATE1_FALSE_HOLD_CAPTURE` (S4, not before
09-08 UTC) or wait until the window closes. The R3 fix is small and now urgent-ish: the masked
fallback (`reason/route.ts` Branch 2) should `logRouteError` so an injection REJECT against
`/api/reason` leaves a row. Options: (i) fold item 10 + the R3 log into THIS session after the
score-family work (long session; one push); (ii) a separate short session before S4; (iii) after
the window. The AI recommends **(ii)** — its own PR19 pass on the measured surface, not tacked onto
a large diff.

### §3 Design — settled, restated for Group 2's shape

For each route in scope, the maximum guard (`validateTextLength(field, …, TEXT_LIMITS.X)` or the
inline `field.length > TEXT_LIMITS.long` on score-conversation) moves to **after the check and its
redirect return, before any context/RAG/engine call** — the same anchor and pin shape as Group 1.
**Guard values, messages, and status codes do not change.** And, new to this group:

- **Screening cap at the move.** The check must not receive the raw field. Compose the screened
  subject through a slice at the route's own bound: `field.slice(0, TEXT_LIMITS.X)` per screened
  field, joined with the gap-closure separator convention (`DISTRESS_SUBJECT_FIELD_CAP` in
  `r20a-gap-closure.ts`; score-conversation already caps via its composer at `TEXT_LIMITS.long` —
  verify it still bounds `conversation`/`context` once their maxima move, since the composer
  already caps every field at 15,000, it does; **pin that the composer's cap is the bound**).
  `/api/score-document` is the largest raw input (30,000) — its cap is `TEXT_LIMITS.document`.
- **Disclose the relocated residual in the route comment** (audit §4.3): distress past the cap is
  unscreened; before the move it was unread entirely (a 400). Never present the cap as new harm.
- **Reflect's `how_i_responded`** already has a max guard under `if (how_i_responded)`; both
  fields' maxima move together and the combined subject caps each field.
- **Journal-feed screens three fields** (`impression`, `assent`, `action`) — cap each.
- **Per-route battery**: extend Group 1's (reflect, private/reflect, score-scenario,
  score-conversation FV-8) and create new ones (score, score-decision, score-document,
  score-social, journal, journal-feed) with the helper; pins: max guard(s) after the redirect
  block's structural end; before the first context load and the LLM/engine call; the screening cap
  present on the subject expression and equal to the route's bound (import `TEXT_LIMITS` and
  assert the literal); non-vacuity; mutation-verify each pin against the max guard placed before the
  check, between the check and the return, deleted, and the cap removed (must go red).
- **Regex-literal hygiene for the pins:** the helper blanks string contents, so a pin that wants
  `'string'` must use `QUOTED`; anchors that also occur earlier in a file (score-scenario's generate
  path) must use `codeIndexAfter` from the check — both are documented in the helper from Group 1's
  own two in-build mistakes.

### §4 Procedure

Exactly the remediation prompt's §5, with these additions: (1) the design note per route goes to the
founder before editing (Group 1's table shape: guard today / where it goes / cap / anchor);
(2) after edits: `tsc`, `npm run build` (route files), all route batteries, the guard battery
(expect `722 passed, 0 failed` — re-derive), and **the rev-2 sweep**
(`node operations/count-discipline-2026-09/2026-09-05-r20a-ordering-sweep.js website`) — each moved
guard must vanish from its handler's pre-check list and the check→redirect window must stay
`0 bound line(s)`; commit the refreshed `…-sweep-OUTPUT.txt` with the group; (3) mutation proofs on
the REAL files with backup-and-`cp`-restore and a hash check (never `git checkout --`), using plain
shell variables — **macOS bash 3 has no associative arrays; Group 1's first harness silently mutated
one route four times because of it**; (4) PR19 three blind reviewers (execution order; classifier
input incl. the cap; byte-identity + test adequacy with mutations on scratch copies); (5) commit
path-scoped with `Model:`/`Effort:` trailers; **you push**; (6) smokes.

### §5 Smokes (founder, Bearer JWT, console; the Group 1 `smoke()` helper works unchanged)

Per moved maximum: an oversized **distressed** body (the phrase *"I want to die."* in the first
2,000 characters, then padding past the bound) → **HTTP 200** with `distress_detected: true`; an
oversized **benign** body → **HTTP 400** with the route's `exceeds maximum length` message. None
writes a row except the two reflect routes' `analytics_events` distress row (pre-existing). Avoid
mild-severity wording in benign padding.

### §6 Do NOT

Change a guard value. Move an agent-path guard. Edit `/api/reason` in this sitting unless Election
B chose (i). Weaken or touch `injection-defence.ts`. Push before the PR19 pass. Anchor a pin on a
block's opening. Flip or unset any flag. Touch `operations/agent-circles-2026-08/d6a/` or the
byte-identity guard's set. Quote a perimeter count. Read a token from `settings.local.json`.

---

## PART 3 — Records and close

Decision-log entry (BUILT, then LIVE after your walk) at the physical tail; the audit's §2.1 rows
annotated MOVED; the remediation prompt's top line marked for Group 2; the opener's S3 line; the
CLAUDE.md production-state block per PR18; a lean close carrying the observed smoke table and the
A11b self-inflicted event count for B4. Commit path-scoped. **Do not push.**

## PART 4 — Founder verification (between sessions)

```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git log --oneline -4
cd website && npx tsc --noEmit; echo "tsc exit: $?"
npx tsx src/lib/__tests__/r20a-invocation-guard.test.ts > /tmp/g.txt 2>&1; tail -1 /tmp/g.txt
```
Expected: the Group 2 commit at the top; `tsc exit: 0`; the guard battery green at its re-derived
count.

## PART 5 — Anticipated shape (items 5–8)

| Phase | Estimate |
|---|---|
| Opener + reads + two elections | 25 min |
| Design notes (11 routes) + founder confirm | 25 min |
| Edits + caps + pins + mutation proofs | 2–3 h |
| PR19 fleet + fold | 40 min |
| Push, deploy, smokes (founder) | 30 min |
| Records + close | 30 min |

**Rollback:** `git revert` the group's commit + redeploy; never a flag.

**Forecast:** success = every maximum in scope runs after the check with the classifier's input
capped at the route's own bound, pinned and mutation-verified, three reviewers satisfied, and your
smokes showing an oversized distressed write-up answered with the crisis resource. **The session
ends with guard values unchanged and the classifier's input bounded.**

End of paste.
