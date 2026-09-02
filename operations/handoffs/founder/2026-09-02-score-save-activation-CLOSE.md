# Close — `/api/score/save` R20a perimeter ACTIVATION

**Date:** 2026-09-02. **Tier:** `code-critical` (AC5 + AC7 + PR6 + PR17).
**AC7:** **ENGAGED AND DISCHARGED** — a production flag activation on a live human-facing route.
**Founder-walked throughout.** The AI performed no Vercel, Supabase, git-push or live operation and
did not itself observe production; it prepared the walk, verified every claim in it against source,
and records the founder's reported outcome against expectations stated in advance.
**Session model:** `claude-opus-5`, effort high. **Peers at open:** 9 (one interactive on this
project) — path-scoped commits only.

**Decision-log entry:** `D-R20A-SCORE-SAVE-PERIMETER-ACTIVATION-LIVE-2026-09-02`.
**Commits this session:** `c48ff46` (the smoke kit) + this close and log entry.

---

## 1. Status in one paragraph

`SUBSTRATE_SCORE_SAVE_R20A_ENABLED=true` in Vercel Production. `/api/score/save` screens ten
caller-supplied fields, refuses a distress-carrying record with **422**, and `/score` renders crisis
resources rather than a scoring card. All three probes and the teardown went as specified. The
mild-variant copy (§6(a) of the build close) is **settled** — confirmed by reading it on screen, not
from a quotation. The local-storage bypass (§6(b)) is **still open** and is now sharper than when it
was written: a new finding this session is that the storage mode cannot be changed through the
product at all.

---

## 2. What the founder observed

Expectations were fixed in writing before any observation — that is what gives the report its force.

| Probe | Expected | Result |
|---|---|---|
| Pre-flight benign, flag OFF | 200, row +1 (deploy is a no-op) | as expected |
| **Acute** — `I keep thinking I want to die.` in `emotional_state` | **row count unchanged**, 422, seven crisis lines, **no scoring card beneath** | **as expected** |
| Benign | 200, normal card, row +1 | as expected |
| Mild — `Life is meaningless.` | saves (row +1) + support panel | as expected |
| Teardown | rows deleted | done |

**The assertion that mattered** was the first one on the acute probe: the row count not moving. It is
the assertion the reverted 2026-08-31 build would have failed.

**Honest limit:** the AI did not witness any of this. This is the founder's report, checked against a
pre-committed expected shape.

---

## 3. What made the acute probe a real test

Benign text in `action`, acute phrase in `emotional_state`. `/api/score` screens the bare `action`
only (`api/score/route.ts:154`), so that combination passes the evaluation untouched and lands on
`/api/score/save`, where the new screening is the **sole** thing between the text and a durable row.
Anything weaker would have been screened twice and proved less.

The phrases were **executed** against the real `detectDistress`, not read off the regexes — seven
candidates, output reproduced verbatim in the kit. All are stage-1 regex matches, which return before
the LLM (`r20a-classifier.ts:289`), so the blocking probes are deterministic and unbilled; only the
benign save incurs the stage-2 Haiku call.

---

## 4. §6(a) — SETTLED

`buildMildSupportResources('practice')` is confirmed. The founder read the founder-signed copy on
screen, in the context a flagged practitioner sees it, and is happy with the wording. No change
follows; the variant choice is no longer a builder's call left standing.

---

## 5. §6(b) — STILL OPEN, and worse than recorded

Re-derived first-hand: `score/page.tsx:324` — `else if (user && storageMode === 'local') {
setSaved(true) }`. The local branch never calls the route. (The build close cited 312-314; the lines
have drifted — the known citation-rot class.)

**NEW FINDING, found while preparing the walk.** There is **no in-app way to change storage mode
after the first choice.** The chooser renders only when the localStorage lookup misses
(`score/page.tsx:354` — `if (showSetup && user)`); after that the badge on the form is display-only.
The founder had to clear `action_storage_<user_id>` in devtools to run this smoke at all.

So: which practitioners this ruling protects is decided by a browser value the practitioner cannot
revisit through the product. The mentor's A2b reasoning — that the route cannot enforce a distinction
about a client it does not control — applies with more force now, not less.

The durable fix is upstream, extending `/api/score`'s screening from `action` to all four submitted
fields. Deliberately not done here: engine-adjacent, measurement-neutrality-protected, outside the
ruling's scope. **Disposition is the founder's, and plausibly the mentor's.**

A second, smaller question rides with it: whether the missing mode-switch is itself a product defect
worth fixing independently of the screening gap.

---

## 6. Carried, not done

- **§3 of the activation prompt — the private-mentor fix verification.** Untouched this session.
  Still needs the founder's eyes: use `/private-mentor`, refresh, confirm the exchange persists. If
  it does not, look for `Founder hub error at step [save_founder_message]` or
  `[save_primary_response]` in the logs — the fix makes a genuine write failure loud, it does not
  diagnose the underlying cause.
- **CLAUDE.md is not updated.** Its Live list does not carry this activation, and it remains stale
  for the whole 08-17 to 08-26 window besides. Folding that window in is the queued housekeeping item
  the standing opener names; this session did not open it. **Anyone reading CLAUDE.md's Live list
  before that fold will not see `/api/score/save`.**
- **Perimeter count.** The route is the 43rd route-level member. Re-derive from the registry arrays
  rather than quoting that figure — the count has drifted silently before, twice.
- The build close's own §8 follow-ups are unchanged: response-handling execution coverage,
  perimeter-wide `userId` threading, the steady-state billed Haiku call on every cloud-mode save.

---

## 7. Rollback

Unset `SUBSTRATE_SCORE_SAVE_R20A_ENABLED` and redeploy. Flag-off is a differentially-tested
byte-identical match to pre-rebuild across 13 previously-accepted body shapes
(`perimeter-functional.test.ts` §17). Or `git revert` the rebuild commits.

**NEVER** unset the shared `SUBSTRATE_R20A_GAP_CLOSURE_ENABLED` to mitigate anything on this route.
It covers 25 others, including the passion and grief tools — the surfaces where the material is most
likely to be genuinely acute. A lever that removes protection from the people most likely to need it
is not a rollback lever.

---

## 8. Untouched

Every other R20a flag; the shared gap-closure flag; R18f; the distress classifier itself; Layer-2
signing; UPC auth; S10; S11; and the provenance-ledger C2 readiness window with its watched surfaces
(`emission-hooks.ts`, `provenance-*.ts`, `/api/reason`'s write block, the sweep handler). Weights
**BLOCKED unchanged**. The 0h call remains the founder's.
