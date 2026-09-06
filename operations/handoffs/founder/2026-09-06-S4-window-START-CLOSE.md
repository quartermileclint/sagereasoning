# S4 close — the false-hold observation window is RUNNING (2026-09-06)

**Model:** `claude-opus-5`, with two adversarial reviews under `claude-sonnet-5` (founder-dropped for
each, restored after). **Tier:** read-only autonomous half → one founder-directed act.
**Records:** `D-S4-WINDOW-START-READINESS-BLOCKED-DATE-GATE-2026-09-06` through
`D-FALSE-HOLD-OBSERVATION-WINDOW-STARTED-LIVE-2026-09-06`. All commits pushed; tree clean.

---

## Headline

**The window started at `2026-09-06T09:44:55Z`.** The session opened expecting to report the window
*blocked* — leg (a)'s date gate was unmet and both preconditions failed. Two mentor rulings the same
day dissolved both blockers, and the founder performed the act.

---

## What happened, in order

**1. The date gate held and leg (a) was correctly not run.** `date -u` at open was
`2026-09-06T04:11:54Z` against a ≥2026-09-08 requirement. **No post-remedy rate was computed** — B4
remains a real measurement rather than one this session pre-empted.

**2. F-3′'s threshold was proposed, adversarially reviewed, and elected.** ≤5% aggregate / ≤10% any
single ordinary day / ordinary day = ≥20 guard attempts. **PR19 found 1 HIGH + 2 MEDIUM in the
session's own first cut** — a partial-day 60% figure wrongly paired with a full-day attempt count
(corrected to that day's actual 25.25%), "lean mode is closed" (it is *held*), and an unsourced
concurrency figure whose source document uses it to *refute* concurrency.

**3. A finding the threshold work surfaced became the session's substance.** The guard-**deny**
population — part (3)'s "correct holds" denominator — is **15 events over 57 calendar days**, 45 of
50 active guard days at zero, ≈0.6/week excluding one outlier, all `Bash`/`reflexive`/`depth:""`.
Put to the mentor rather than resolved.

**4. Ruled: part (3) is a WITHIN-CONSULT measure.** The guard population is a separately-reported
disclosure, not a denominator. Its thinness *"stops being a blocker and becomes a disclosure."*

**5. That created a second question, and researching it produced the sharper finding.** The
**consult** path — now part (3)'s measured population — runs at **70.3% outage** over the full log
(3,261 / 4,636), against the guard path's 31.7%.

**6. Ruled: F-3′ is DISCHARGED as a gate; a consult-side bound replaces it AT PUBLICATION.**
*"A precondition whose rationale has been dissolved by a subsequent ruling does not survive as a
formality."* Requiring the bound before the window starts *"is not a precondition. It is a
circularity."*

**7. The act — and a false start caught first.** The founder reported *"set and redeploy green"*;
three checks disagreed (flag in zero settings files, file mtime from the previous day, buffer
unmoved at 138 all-`v1`). **It had been set in Vercel, which is inert — no route or lib reads it.**
Accepting that report would have produced a `-LIVE-` record for a window that never started.

**8. Took-effect proven, not inferred.** Buffer **138 → 139**; record 139 is the **first
`false-hold-record-v4` in the buffer's history** (`path: "guard"`, `captureBasis: "assessment"`,
`extractionRegime: "at-action-v2-composed"`). It cannot exist flag-off.

---

## Also closed this session

- **The Stoa restructure is LIVE-VERIFIED** — 4/4 assertions, both write surfaces, founder-walked.
  It had been deployed since 11:48 AEST with **no `-LIVE-` record and no smoke**.
- **The R18 assessment-contract corrections verified live** by unauthenticated GET (14 / 55 / 8
  phases, no `SO-01`). The ~5-month public-contract defect is closed in production.
- **S2 §D — api-docs corrected.** Both assessment entries documented a request shape neither route
  accepts and a response shape neither returns. PR19 found **three HIGH** in the first cut, including
  `"proficiens"` (invented) and `"pleonexia"` in `root_passion` (a type violation). Scope extended by
  three further entries, disclosed.

---

## Errors this session made, recorded because the discipline is the point

- **A partial-day figure paired with a full-day denominator** (Anchor 4) — caught by PR19, not by me.
- **`"assessment_id": "uuid"` carried into the api-docs fix** — the exact defect class the fix
  existed to remove, reproduced inside it.
- **A smoke that overwrote real user data.** The Stoa test assumed it was creating a throwaway
  entry; the identity already held a withdrawn row **with real content**, so it reactivated and
  overwrote the founder's own words. The `DELETE`-only teardown could never have repaired that — and
  the baseline read had already shown withdrawn rows retain content **before** the write step ran.
- **Claimed `declaredAt` was intact when it was not**, asserted from a truncated console object.
- **Two arithmetic slips** (median, calendar span) caught by self-check before review.

**Standing lesson:** a smoke against a surface holding real user data needs a **content**-restore
step, not a **status**-restore step, and the baseline read must be *consulted* before the write step,
not merely captured.

---

## State at close

**Window RUNNING** since `2026-09-06T09:44:55Z`. `GATE1_FALSE_HOLD_CAPTURE=true` in the founder's
local `.claude/settings.local.json` — **not production**; nothing deployed.
`GATE1_STATE_DIR=/Users/clintonaitkenhead/.sage-gate1`, durable, must not change for the window's
duration. Buffer 139 records (138 `v1` + 1 `v4` probe). **P5 DISCHARGED.** F-3′ discharged as a gate.
**S11 flip REFUSED; weights BLOCKED; 0h call the founder's** — none touched.

**Three things that must not be done:** never "refresh" the buffer (append-only; the frozen 130 is an
exact prefix and is evidence); never mix the 138 `v1` records into the new rate (different regime);
never count **record 139** in the rate (a deliberate took-effect probe).

**⚠ THE BYTE-IDENTITY GUARD IS ARMED.** It binds iff the capture flag is set (M1 ruling). Its
`GUARD_RE` matches
`api/reason|api/guardrail|guardrail-sandwich|sage-reason-engine|reasoning-receipt|translation-sandwich|/substrate/|trust-core|kathekon-engagement|false-hold|harness/gate1|layer1-extractor|layer2-mechanisms|sage-reflect|stoic-brain`
against `git status --short`. **No matching file may sit modified in the working tree.** This reaches
the scoping note's own filename (`…false-hold-new-window-scoping-note.md`).

---

## Owed, in the order it comes due

1. **S11-D2 is BLOCKED** — its correction must edit `layer2-mechanisms.ts`, which the armed guard
   covers. **Whether "after the window establishes a baseline" means mid-window or post-window is
   genuinely open**; the D2 ruling's own regime-boundary discussion implies mid-window, the guard
   implies otherwise. **Founder/mentor decision, before S11-D2 opens.**
2. **B4's guard measurement, ≥2026-09-08 UTC** — no longer a gate, still owed as the guard
   disclosure's honesty input.
3. **The consult-availability instrument.** The report script does **not** measure it — it reads the
   buffer, and a consult outage writes no record. **The data IS accruing in `gate1.log`** (append-only,
   durable), so nothing is being lost; the instrument is owed **before publication**, not before day one.
4. **The consult-side threshold** — set after the first **five ordinary post-remedy days** of window
   data. Deliberately **not** F-3′'s numbers.
5. **Window close** — ≥7 days AND a representativeness break-out showing more than one tool
   class/depth. Then freeze the buffer by copy, run the report, assess all four parts.

**Window-neutral and available now:** S7 (item 2b), S6 (Option S pre-run fixes).
