# Next session — the Stoa is live, and its activation gate was never run

**Paste this as the first message of a new session, beneath the standing session opener.**

**Tier: opens `code-elevated`. Escalates to `code-critical` the moment any remediation touches
`SUBSTRATE_STOA_ENABLED`, the `stoa_entries` schema, or a credential** — and one plausible outcome
of this session *is* a flag decision, so read §6 before you touch anything. AC7 engages at that
point, not before. PR6 engages if any R20a behaviour is altered.

**Permitted paths to WRITE, until the session's own findings justify more:** `operations/decision-log.md`,
`operations/connective-layer-2026-08/`, `CLAUDE.md`, and
`operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`. **Read anything.**
Verify with `git diff --stat` before committing.

---

## 0. Concurrency — run the parallel-window pre-flight first, as always

`operations/handoffs/founder/2026-08-10-idea-loop-parallel-window-NEXT-SESSION-PROMPT.md`. As of
2026-08-12 the bounded validation run was at **8 completed cycles** of its 20–40 target — Mode 2.
**Re-derive that; do not inherit it.**

This session's *reads* touch nothing fenced. Its *possible remediations* touch a public route and a
flag, which are not on the run's fenced list either (`/api/mentor/stoa` is not one of the four
endpoints the runner calls). **But `/api/reason` is shared** — if any finding here leads toward the
R20a classifier or the distress perimeter's shared code, stop and re-read the window prompt.

---

## 1. What happened, and why this is not a records chore

The 2026-08-12 grounding-record reconciliation (`D-GROUNDING-RECORD-RECONCILIATION-2026-08-12`)
found that **every project record described the Stoa's ST2/ST3/ST4 as "built, reviewed, and dark,"
and that description was false.** Its PR19 independent review caught it; the reconciliation session
itself had copied the wrong claim forward into `CLAUDE.md` before being corrected.

**The founder has now confirmed it directly: `SUBSTRATE_STOA_ENABLED` was already set `true` in
Vercel.** So:

- **`POST/PATCH /api/mentor/stoa` (ST3, the human surface) is LIVE** — it gates on nothing but
  `isStoaEnabled()`, four call sites (`website/src/app/api/mentor/stoa/route.ts:276,337,388,439`).
- **`/api/stoa/declare` (ST4, the agent surface) is LIVE** — same gating, four call sites
  (`website/src/app/api/stoa/declare/route.ts:196,254,301,344`).
- **`/api/stoa/entries` (the browse route) is LIVE** (`route.ts:48`).
- **ST2's schema is therefore in use.**

**The sharp part, and the reason this session exists.** ST3 is the **twelfth R20a route-level
distress-perimeter member**. Its only decision-log record is
`D-STOA-ST3-HUMAN-SURFACE-BUILT-DARK-2026-08-03`. **There is no ST3 activation entry anywhere, and
no live distress smoke has ever been run against it** — because everyone, including every session
that read the records, believed it was dark. Compare `/impulse` (2026-08-12) and
`/api/score-conversation` (2026-07-07): both perimeter members got a founder-walked live smoke in
both directions before being trusted. **ST3 never did, and it has been serving.**

**And ST5 — the activation walk — was never run.** Its own carried checklist
(`operations/decision-log.md`, the ST4 entry's "Open questions carried to ST5") names four gating
items that the flag being pre-set silently bypassed:
1. the **anonymous-sign-ins-OFF** check,
2. the **q-filter pagination bound**,
3. the **row-level reactivation guard** (the recency-cycling residual, possibly a mentor question),
4. the **ST5 R18 sign-off checklist** — including re-diffing `STOA_ETHIC` and **re-counting
   `agent-card.json` extensions**, explicitly because another session might land in between (several
   did).

**Do not read this as an incident to be dramatised.** Nothing is known to have gone wrong. Pre-0h,
the practitioner population is small. What is true is narrower and still serious: **a live public
surface inside the distress perimeter has been serving without the verification its own build
sequence specified.** The job is to find out where it actually stands and close the gate properly —
retroactively if that is what the evidence supports.

---

## 2. First — establish the facts, in this order, before forming any view

**Do not skip to remediation.** The last three sessions in this thread each found that a confident
claim about Stoa state was wrong; assume this one's premises need checking too.

1. **Confirm the flag's value and, if the dashboard shows it, when it was set.** Founder-performed
   (Vercel). If the set-date is recoverable, it bounds the exposure window; if not, say so and use
   2026-08-03 (the ST6 activation entry's *"already `true`"*) as the earliest defensible date.
2. **Is there real data?** Founder-run, read-only SQL:
   ```sql
   SELECT count(*) AS total,
          count(*) FILTER (WHERE created_at < '2026-08-03') AS before_st6_activation,
          min(created_at) AS first_entry, max(created_at) AS latest_entry
   FROM public.stoa_entries;
   ```
   **This is the pivotal number.** Zero rows means the exposure was theoretical and this becomes a
   verification-and-records session. Non-zero means real practitioners have written free text into a
   surface whose distress check has never been live-verified — which changes the priority of §4
   entirely and is a genuine, if small, R20a matter.
3. **Is `/stoa` reachable by a practitioner in production?** ST7 added nav links
   (`NavBar.tsx` + the footer Tools column, `aec67b2`). Confirm by clicking, not by grep — a live
   link is what determines whether anyone could have arrived.
4. **Did the R18 public-surface docs ship?** `operations/connective-layer-2026-08/st4-r18-docs-staged.md`
   is **staged**. Check whether its content is actually in `llms.txt` / `agent-card.json` /
   api-docs. **A live agent surface with unpublished contract docs is an R18 gap** — and if the
   staged docs were never applied, that is a second thing the missing ST5 walk dropped.

**Report these four before proposing anything.** Founder decides the shape of the rest on the
evidence.

---

## 3. Verify the perimeter member is actually working — do not assume it is

ST3 is in the registry (`website/src/lib/__tests__/r20a-invocation-guard.test.ts`, twelfth
route-level entry) and the guard suite is green, **but the standing lesson from the
`founder-watching` PostgREST defect applies exactly here: every battery was green while the live
route was broken.** A registry pin proves the call is present in the source; it does not prove the
redirect fires in production.

**Run the live distress smoke, both directions, on production, founder-walked** — the same shape as
`/impulse`'s (`D-S7-IMPULSE-MIGRATION-AND-ACTIVATION-LIVE` Step 2) and
`/api/score-conversation`'s:
- **Benign** submission → saves normally; row count increments.
- **Acute** submission → the human-audience crisis redirect (the corrected **7-resource** list, incl.
  Shout UK 85258 + 988 CA) **and the row count does not move** — no write on redirect.
- **Both write paths.** ST3 screens **POST and PATCH** (a revision carries the same free text). The
  `/impulse` precedent smoked both; do the same. A PATCH-only bypass is exactly the kind of gap a
  POST-only smoke misses.
- Use a throwaway/test practitioner account, and **tear down the rows you create**, verifying the
  count returns to its starting value.

**If the redirect does NOT fire correctly, stop and escalate to `code-critical` immediately.** That
is a live distress-perimeter failure on a reachable public surface and it outranks everything else
in this prompt, including the records.

---

## 4. Then run the bypassed ST5 gating checks

Only after §2 and §3. Each is small; none should be skipped as "probably fine" — the whole reason
they are outstanding is that someone's default assumption replaced a check.

- **Anonymous sign-ins OFF** (Supabase Auth settings, founder-read).
- **The q-filter pagination bound** — confirm the browse route cannot be driven into an unbounded
  scan; `website/src/app/api/stoa/entries/route.ts`.
- **The row-level reactivation guard** (recency-cycling residual). If this still looks like a mentor
  question, **it is one** — name it, brief it under PR20 (cite `file:line`), do not resolve it by
  AI judgement.
- **The R18 sign-off**: re-diff `STOA_ETHIC` against what is live, and **re-count
  `agent-card.json` extensions first-hand** — the count has moved repeatedly (it was 20 at the
  2026-07-29 `loop-fold/v2` addition; **do not quote that number, re-count it**).
- **The live-DB integration smoke for `stoa-credential.ts`** (named as ST5's job in the ST4 entry).

---

## 5. Records to correct — and the one that must not be smoothed over

- `CLAUDE.md`: the Live-list Stoa bullet and the `2026-08-12 refresh` block both currently say the
  flag's state is **`unverified`**. It is now verified — **`true`**. Replace the hedge with the
  confirmed fact, keep the correction history (a future reader needs to know the "dark" claim was
  wrong and for how long), and state ST3/ST4/browse as **live**.
- The standing opener: same, plus **strike queue item 10** (this check) and **rewrite item 17
  ("Stoa activation")** — its premise is now known false. What actually remains to activate is the
  **Q5c/Q13a trust events** (`SUBSTRATE_STOA_TRUST_EVENTS_ENABLED`, genuinely dark, both it and
  `SUBSTRATE_TRUST_CORE_ENABLED` required to emit), **not** ST3/ST4.
- **Write the ST3/ST4 activation record that was never written**, dated honestly: activated
  2026-08-03 (or the confirmed date) *by flag pre-set rather than by an activation walk*, with the
  verification performed retroactively at this session. **Do not back-date it as though the walk had
  happened.** The record's value is precisely that it says what actually occurred.
- **Record the process finding, not just the fact.** A flag set once for one sub-item (ST6) silently
  activated three others that gated on the same flag, and every subsequent record described them as
  dark. That is a reusable failure mode — *a shared base flag makes "dark" a per-flag claim, not a
  per-feature claim* — and it belongs in the log, and probably in memory, as a standing lesson.

---

## 6. What NOT to do

- **Do not unset `SUBSTRATE_STOA_ENABLED` as a reflex.** It has been live for ~9 days; there may be
  real practitioner entries, and ST6 (the draft-mirror tool, genuinely activated on purpose) rides
  the same flag — unsetting takes ST6 down too. If §2 or §3 produces a reason to take the surface
  dark, that is a **founder-walked `code-critical` decision with its own rollback plan**, made on
  the evidence, not a tidying reflex.
- **Do not treat green batteries as proof the live route works.** §3 exists because they are not.
- **Do not resolve the row-level reactivation guard by AI judgement** if it is a mentor question.
- **Do not touch the fenced IDEA-loop surfaces**, `/api/reason`, `/api/guardrail`, or
  `project-context.*`.
- **Do not shorten the two settled names** — *loop-level blast-radius proxy*, *permission-layer
  blast-radius enrichment*.
- **Do not open the ATRF scoping session** (post-validation-run, "do not open early") or design the
  standing runner.

---

## 7. Verification before you close

1. `git diff --stat` — permitted paths only.
2. Every count re-derived first-hand — **especially the `agent-card.json` extension count and the
   R20a perimeter count** (14 route-level + 2 substrate-gate = 16 as of 2026-08-12; **re-derive from
   the arrays in `website/src/lib/__tests__/r20a-invocation-guard.test.ts`, not from `CLAUDE.md` and
   not from that file's own header comment**).
3. Any claim about production that you could not verify is marked **`unverified`**, not restated.
4. The live smoke's result is recorded **as observed**, including any partial or ambiguous outcome.
5. **PR19: independent adversarial review before this lands.** Focus it on (a) whether the live
   smoke actually proves what the record claims it proves, (b) claims-vs-repo on every status
   assertion, and (c) whether anything was called verified on the strength of a battery rather than
   a live observation. **The last two sessions in this thread each had their headline finding
   produced by the independent review rather than the author — budget for that, do not treat it as
   a formality.**

## 8. Close with

- A decision-log entry, house shape. **`git commit -F <file>`, not `-m`.**
- An explicit statement of **what is now known to have been live, since when, and what was verified
  retroactively versus what remains unverified.**

## 9. What follows

The **Q5c/Q13a trust-event activation** becomes the real remaining Stoa activation decision
(founder-elected, `code-critical`). The **"curation via volume" second mentor ruling** is still
named and unscheduled. **PR24's retention-parity gap explicitly names `stoa_entries`** — if §2 finds
real rows, that gap stops being theoretical and should be re-prioritised. Stoa **subscriptions**
remain blocked on Resend.

Nothing here bears on the 0h call.
