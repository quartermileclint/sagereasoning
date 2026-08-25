# IW-7 opening 1 — the measurement task, run

**Date:** 2026-08-25 · **Tier:** `governance`, measurement only — no code, no ruling needed (per the
scope document's own §1: *"it is answerable without a mentor ruling"*). **AC7 not engaged.**
**Predecessor:** `operations/reflections-examination-2026-08/2026-08-25-iw7-three-openings-scope.md`
§1, which inferred the elicitation likely fires too rarely to matter from reading the guard's
allowlist, and named the count as the way to check that inference rather than rest on it.

**What was run:** a direct count against the harness's own live log, `~/.sage-gate1/gate1.log`
(the founder's personal dogfood state directory — `GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1`,
confirmed from the environment, not assumed), **28,406 lines, spanning 2026-07-12T13:13Z to
2026-08-25T09:35Z** (44 days) — this is the same underlying session store the 100-reflection corpus
this whole arc examines was drawn from, so the population is the right one, not a proxy for it.

---

## The counts

| Event | Count | What it means |
|---|---|---|
| `GUARD-CAUTION` | 641 | The guard fired on an irreversible action and returned a caution — the *only* condition that arms the elicitation marker |
| `GUARD-OUTAGE` | 530 | The guard could not run (timeout/no credential) |
| `GUARD-PROCEED` | 4 | The guard ran and returned a clean proceed |
| `GUARD-BLOCK` | 2 | The guard blocked the action outright |
| `CONSULT` | 1,140 | A Gate-2 consult completed |
| `CONSULT-OUTAGE` | 2,856 | A Gate-2 consult attempt failed (timeout, mostly) |
| `ELICIT` | 83 | The three-sub-question elicitation was captured and examined |
| `ELICIT-OUTAGE` | 63 | An elicitation was armed but the examination call failed |
| `ELICIT-SKIP` | 1 | Armed but skipped (no transcript tail to capture) |
| `CLOSE` | 149 | A close-hook fired |

Sum of all counted event types: 28,406 of 28,406 log lines — **the accounting is exhaustive**, not a
sample.

## The rates

**Against the elicitation's own arming condition (`GUARD-CAUTION`):**
- Completed examinations: **83 / 641 = 12.9%**
- All attempts (completed + failed + skipped): **147 / 641 = 22.9%**
- So even when the arming condition fires, roughly **77% of the time no elicitation attempt is ever
  recorded at all** — most guard cautions are never followed by a subsequent H3 firing that would
  flush the pending marker (the mechanism is fire-marker-now, flush-on-next-hook; a caution on the
  session's last consequential action never gets flushed).

**Against total decision volume (`CONSULT` + `CONSULT-OUTAGE`, the broadest reasonable denominator —
every distinct decision the session made, whether or not the consult itself succeeded):**
- Completed examinations: **83 / 3,996 = 2.1%**
- Against successful consults alone: **83 / 1,140 = 7.3%**

**This confirms the scope document's inference, and sharpens it past "likely too rare to matter" into
a number: on the most generous reading (all attempts, not just completions, against the narrowest
denominator), the elicitation reaches under a quarter of its own arming condition, and under a
tenth of the session's actual decision volume.**

## A finding beyond what was asked for

**The completion rate is not stable — it is getting worse, in the same window this arc examines.**

| Month | `GUARD-CAUTION` | `ELICIT` completed | `ELICIT-OUTAGE` | Completion rate |
|---|---|---|---|---|
| 2026-07 | 171 | 50 | 18 | 29.2% |
| 2026-08 | 470 | 33 | 45 | 7.0% |

Guard cautions nearly tripled between the two months. Completed elicitations *fell* in absolute terms
despite that. Every one of the 63 `ELICIT-OUTAGE` events across the whole log carries the identical
reason: `http 503 — service error` from the discernment route — and the outage count alone (18 → 45)
accounts for most of the completion-rate collapse. **This is an operational/infrastructure fact about
a live service, not a design property of the trigger.** It is outside this arc's scope to diagnose or
fix (the reflections arc is documents-only, and the discernment route's server-side health is a
SageReasoning project concern, not a reflections-arc one) — named here because it directly bears on
opening 1's own question and because leaving it unnamed would repeat exactly the failure this arc's
own letters are about (a measurement task that stops short of the number it actually found).

---

## What this settles, and what it doesn't

**Settled:** the elicitation mechanism, as it exists today, does not reach anywhere close to enough
of the session's decision volume to meaningfully move the coverage figure the item-4 document's §4.4
cited (58%, itself not independently re-derived here or there). §1's honest finding — "the honest
next question is not add a new trigger, it is widen this one's gate" — now has a number behind it
rather than an inference.

**Not settled, and not in scope for this document:**
- Why the discernment route's failure rate grew across the window (a live-service diagnostic, not a
  count).
- Whether opening 2 (arm the elicitation from the consult verdict too) would actually close the gap —
  it remains held on the signal-quality question per the mentor's ruling, independent of this count.
- Whether opening 3 phase one (already mentor-cleared) is sufficient on its own — the mentor's own
  ruling already named it as only a partial closure (the legibility gap, not the temporal one).

**Honest limit on the count itself:** this is one practitioner's personal dogfood log
(`~/.sage-gate1`), not the reflections corpus's own extraction file — a related but distinct source.
The 100-reflection corpus draws from the same session store's *transcripts*; this log draws from the
*harness's own hook firings* over a wider window (44 days vs. the corpus's 2026-07-19–08-22). The two
are not the same denominator and this document does not claim they are.
