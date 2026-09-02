# Smoke kit — `/api/score/save` R20a activation (§2 of the 2026-09-01 prompt)

**Prepared 2026-09-02.** Every phrase and expectation below was verified first-hand this session
against the real classifier and the real route source — nothing here is quoted from a prior document.
**Every live step is the founder's** (this environment holds no production admin credential).

---

## 0. The one precondition that silently voids the whole test

**The throwaway account must be in CLOUD storage mode.** On `/score` the local-storage branch
(`score/page.tsx:324` — `else if (user && storageMode === 'local') { setSaved(true) }`) never calls
`/api/score/save` at all. In local mode the acute probe below will appear to "pass" while proving
nothing. Confirm the page shows *"Evaluation saved **to your profile**"* (cloud), not *"to this
device"*, before trusting any result. This is the §1(b) gap, live.

---

## 1. Trigger phrases — verified against `detectDistress` this session

Run against the real classifier, output reproduced verbatim:

| Phrase | Severity | Blocks (422)? | Indicator |
|---|---|---|---|
| `I keep thinking I want to die.` | **acute** | **YES** | suicidal ideation |
| `Nothing matters anymore.` | **acute** | **YES** | hopelessness |
| `I have been hurting myself again.` | **acute** | **YES** | self-harm |
| `I am a burden to everyone around me.` | **moderate** | **YES** | perceived burdensomeness |
| `Life is meaningless.` | **mild** | no — saves, + support panel | severe emotional distress |
| `Frustrated, and anxious about the outcome.` | none | no | — |
| `Tired but relieved it is over.` | none | no | — |

All are **stage-1 regex** matches, so they are deterministic and short-circuit before the Haiku call
(`r20a-classifier.ts:289` — "Regex caught it, return immediately, no LLM needed"). Only the *benign*
save makes a billed stage-2 call.

**Use `I keep thinking I want to die.` for the primary probe** — it is the least ambiguous acute
match and exercises the highest-severity path.

---

## 2. Where to type it, and why that field

Put the benign text in **"What are you evaluating?"** (`action`) and the acute phrase in
**"What were you feeling?"** (`emotional_state`, the passion-diagnosis textarea).

This is deliberate, and it is the sharpest possible test: `/api/score` screens only the bare `action`
field (`api/score/route.ts:154`), so a benign `action` + acute `emotional_state` sails through the
evaluation untouched and lands on `/api/score/save`, where the new screening is the **only** thing
standing between that text and a durable row. If the flag works, this is exactly the case it catches.

`emotional_state` is the first field in the screened composition order
(`score/save/route.ts:249` — most distress-bearing source first, ten sources against twenty slots).

---

## 3. Row-count SQL

Get the throwaway user's id once, then reuse it. Pure ASCII throughout.

```sql
-- (a) resolve the throwaway account's id (replace the email)
SELECT id, email FROM auth.users WHERE email = 'THROWAWAY@EXAMPLE.COM';
```

```sql
-- (b) THE ASSERTION THAT MATTERS. Run before and after each probe.
SELECT count(*) AS rows_for_user
FROM public.action_evaluations_v3
WHERE user_id = 'PASTE-UUID-HERE';
```

Scoped to the one user on purpose: the table carries real practitioner traffic, and an unscoped
count can move underneath you mid-test for reasons unrelated to the probe.

```sql
-- (c) optional: see exactly what landed, newest first
SELECT id, created_at, left(action, 60) AS action_head,
       left(emotional_state, 60) AS emotional_head, katorthoma_proximity
FROM public.action_evaluations_v3
WHERE user_id = 'PASTE-UUID-HERE'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 4. The walk

**Step 1 — pre-flight, BEFORE setting the flag.** Benign evaluation in cloud mode. Expect a normal
result card, "saved to your profile", and `rows_for_user` **+1**. This is the deploy-is-a-no-op check.

**Step 2 — set `SUBSTRATE_SCORE_SAVE_R20A_ENABLED=true`** in Vercel Production. Redeploy. Wait green.

**Step 3a — the acute probe.** Benign `action`, `I keep thinking I want to die.` in "What were you
feeling?". Expect **all four**:

- **`rows_for_user` does NOT move.** The assertion the reverted build would have failed.
- **HTTP 422** from `/api/score/save` in the network tab (not 200, not 500).
- **Crisis resources on screen**, opening *"We've paused this evaluation because your words suggest
  you may be going through something very difficult right now."* followed by all seven lines
  (Lifeline AU, Beyond Blue, 988 US, Crisis Text Line US, Samaritans UK, Shout UK, 988 CA).
- **No scoring card underneath it** — no proximity grade, no philosophical reflection. The page
  clears `result` deliberately (`score/page.tsx:251-261`); a grade rendered beneath a crisis message
  would also make the message's own first sentence false.

**Step 3b — the benign probe.** Ordinary evaluation, no trigger language. Expect 200, normal result
card, `rows_for_user` **+1**. This is the no-over-block half; without it a 422 proves only that the
route can refuse, not that it still works.

**Step 3c — optional, and it settles §1(a) for you.** `Life is meaningless.` in "What were you
feeling?". Expect: the save **succeeds** (row +1, mild does not block) **and** the mild support
panel renders. That panel is `buildMildSupportResources('practice')` — the founder-signed copy
opening *"Your entry is saved, and working through this deliberately was the right thing to do..."*.
Reading it on screen, in context, is the cheapest way to confirm or reject that variant choice.

**Step 4 — teardown.**

```sql
DELETE FROM public.action_evaluations_v3 WHERE user_id = 'PASTE-UUID-HERE';
SELECT count(*) AS should_be_zero
FROM public.action_evaluations_v3 WHERE user_id = 'PASTE-UUID-HERE';
```

Then delete the throwaway auth user (`profiles.id` cascades, so this also clears anything missed).

---

## 5. If it goes wrong

**Rollback:** unset `SUBSTRATE_SCORE_SAVE_R20A_ENABLED`, redeploy. Flag-off is differentially tested
byte-identical to pre-rebuild across 13 body shapes (`perimeter-functional.test.ts` §17).

**NEVER** touch `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` to mitigate anything here. Unsetting it strips
distress screening from 25 other routes including the passion and grief tools, which are the most
distress-likely surfaces in the product. A rollback lever that removes protection from the people
most likely to need it is not a rollback lever.

**A 500 rather than a 422** on the acute probe means the screening ran but something downstream
threw. Do not re-run the same text; capture the Vercel function log first.

**A 200 with a row written** on the acute probe means the flag did not take effect (check it is
exactly `true`, and that the redeploy actually shipped) or the screening has a genuine hole. Either
way: unset, redeploy, and stop.
