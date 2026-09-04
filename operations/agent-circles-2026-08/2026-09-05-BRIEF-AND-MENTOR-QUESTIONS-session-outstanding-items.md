# Brief + mentor questions — outstanding items from the 2026-09-04/05 session

**For relay.** `governance`. HEAD pushed, `origin/main` clean, Vercel green. **Nothing in this
session touched production, ran a migration, minted a credential, flipped a flag, or spent.**
Option S is built and unpopulated; `runs/` is empty; no live call has been made.

---

## PART 1 — Brief: what this session did

**Path A.** Built the Option S instrument, had it torn apart by three blind PR19 reviewers (6 HIGH,
none refuted), rebuilt it, then found the **c11 re-submission data already existed in the repo** —
K=10, 9/10 `deliberate` / 1/10 `reflexive`, p̂_floor 0.10, on a minimal payload — **before any quota
was spent**. That data localised the mechanism (Layer-1 assigns the same grave-act indicator to four
different states on identical text; only `praxis` floors) and produced a measured cost of
$0.014222/call. On the founder's election the instrument was made **forward-looking** — no resampled
verdict is compared to a recorded one — which the mentor confirmed is within Path A's terms. The
subsequent ruling was adopted and executed: **production count governs, K=10, run precedes the
election.**

**Housekeeping.** Closed **RA-2** (named 2026-07-17, never done): the R20a guard test's own header
carried a perimeter count that had gone stale **three times** *despite already carrying an emphatic
warning not to hand-maintain it*. That is now **enforced by an assertion**, mutation-verified —
717/0 clean, fails on reintroduction of even a *correct* count. Corrected three CLAUDE.md drifts
(the Prerequisite Criterion missing from the session-open reading list since 2026-08-29; PR range;
the extension count, via a standing note rather than rewriting ~20 accurate dated bullets).

**Gate-2.** Diagnosed the guard outages this session kept recording. See Q-G1.

---

## PART 2 — One item RESOLVED without mentor time, reported because the mechanism matters

**The "v3/v4 lift check" in the Path A ruling belongs to the false-hold/P6 track, not to Option S.**

The Path A ruling's *"owed before the run"* list included: *"The v3/v4 lift check must run before any
figure is published — the round-trip is proven on 130 v1 records, not v3/v4 records."* The executing
session **did not absorb it**, because verified at source `false-hold-record-v3`/`-v4` are
**false-hold capture record schemas** (`harness/…/false-hold-capture.mjs:107,166`) and the 130
records are the **frozen false-hold buffer** — Option S has no versioned record schema and no
round-trip, so there is no check by that name it could run.

**Confirmed the same day by the P6 ruling's own text**, issued to the other track:
> *"A v3/v4 lift check must run before any figure is published **from the window**. This is a
> precondition of publication, not a precondition of the ruling."*

**The same P6 ruling also originates the A8 bound** — *"The A8 bound and the depth: "" bound for
guard records are printed on the rate."*

**So both unrequested items in the Path A ruling are P6 conditions that crossed between two rulings
issued to two tracks on the same day.** The A8 bound was **accepted anyway**, because it verified
independently true (`intervention-engine.ts`'s `habitualReExaminationCount` defaults to 0, no live
caller supplies it, so the escalation row cannot fire) and carrying it is cheap and honest. The
v3/v4 item was **refused** as uninterpretable for Option S.

**Q-X1 (confirmation, not a request for new reasoning):** should the Path A ruling's "owed before the
run" list be corrected to drop the v3/v4 item, leaving Option S's only owed precondition as the
production extraction? The executing session has proceeded on that reading.

---

## PART 3 — Mentor question

### Q-G1 — The guard is chronically unavailable. Does that bear on what ENFORCE can mean at S11?

**The finding, from the live log** (`~/.sage-gate1/gate1.log`, counted per day):

| date | guard attempts | outages | rate | sessions |
|---|---|---|---|---|
| 2026-08-29 | 26 | 6 | 23% | 11 |
| 2026-08-30 | 192 | 61 | 32% | 17 |
| 2026-09-02 | 46 | 5 | 11% | 3 |
| 2026-09-03 | 58 | 12 | 21% | 11 |
| **2026-09-04** | **65** | **39** | **60%** | **9** |

**Concurrency does not explain it** — 08-30 ran 17 sessions at 32%; 09-04 ran 9 at 60%.

**Mechanism (PR20, verified):** every outage reads `timeout after 28000ms`; **no 429s**, so latency
not throttling. The guard's budget is 28,000 ms (`framing-core.mjs:100`, *"< the 30s hook timeout"*),
against `/api/guardrail`'s **measured 14.5–19.1 s** (the c11 record's ten stored responses). Under 2×
headroom. It fails **open** with an honest log — correct and designed (KG1).

**The questions.**

**(a)** The guard is the ENFORCE channel — the only mechanism in the harness that can *deny* an
irreversible action. On an ordinary day it is absent for **a fifth to a third** of the occasions it
is asked. Does a channel with that availability bear on what the **S11 ENFORCE flip** could
honestly claim, independently of the four-part readiness standard? The standard's part (3) measures a
**false-hold rate**; it does not measure **whether the holder was present**.

**(b)** The remedy the record already names is `GATE1_ACTION_TEXT_MODE=lean` — carried since
2026-07-19 as *"a fidelity-vs-availability tradeoff that is the founder's call."* This diagnosis is
the missing evidence for that call. But it buys availability by **sending less of the action to the
examination**. Is that purely an operational election, or does reducing the examined input to make
the examination *complete more often* have a doctrinal dimension — is a cheaper examination still the
same examination? The alternative (raise the timeout) preserves fidelity and costs only latency.

**(c)** Should any **new false-hold observation window** measure guard availability as a **covariate**
rather than assume it? A window run at a 20–30% outage rate captures whatever *succeeded*, which is
not a random sample of what was attempted. (Routed to P6, not resolved here; nothing is being
corrupted now — capture has been off since 2026-07-17.)

---

## PART 4 — Founder open questions, with recommended action

| # | Item | Recommendation |
|---|---|---|
| **F1** | **Gate-2 remedy** — lean mode, raise the budget, or both | **Raise the budget first, alone.** Guard hook 30 s → 60 s **and** `GATE1_TIMEOUT_MS` → ~55000 **together** (raising only the inner budget past the hook timeout converts a logged fail-open into a *killed* hook — worse, because the honest log line is lost). The 30 s is not a platform ceiling: another `PreToolUse` hook in the same file already runs at 120. **Hold lean mode** until Q-G1(b) is answered — it trades examination fidelity, which is the thing being measured, and the cheaper fix costs only latency. |
| **F2** | **Path A production run** | **Ready; nothing blocks it but you.** Run `EXTRACTION.sql` §PRE, then §2/§3. If it returns **24**, the ruling's "20 cycle winners" gets a correction note naming the discrepancy — the obligation is recorded on the SQL itself. Then elect and size the credential: **K=10 × the set = ~240–290 calls ≈ $3.41–4.12**, and **quota units are calls × 2**. |
| **F3** | **`agent_hold_observations` sweep** | **Still hold.** Now firmer than when first recommended: P6 has just established the live buffer is **138 records against the frozen 130**, and the difference is live evidence. A 90-day sweep against that table would purge it. Do not flip until P6 says the buffer is finished with. |
| **F4** | **`stoic-brain.json` citations** (Meditations **7.9** cited as 4.26; `DL 7.38` also off) | **Still hold.** Blocked by the byte-identity guard, whose window status is exactly what P6 is deciding. Re-raise once that lands; not worth racing a peer over a guarded file for a low-severity internal-corpus defect. |
| **F5** | **Should the count-discipline become PR26?** ("a count in prose is derived or enforced, never written") | **Not yet.** One enforced instance is not a pattern needing a rule, and the standing cache already prefers convention until convention demonstrably slips. Revisit if a *fourth* surface drifts after this session's fixes. |
| **F6** | **Publication semantics on this checkout** | **Adopt as practice, no rule needed.** A peer's push publishes your local commits too — observed twice, now explained (`git reflog show origin/main` reads `update by push`; no husky hook pushes). **The commit, not the push, is the point of no return.** Stop describing work as "committed but not published" as though that were enforceable. |

---

## PART 5 — Stated against interest

The forward-looking design change in Part 1 was **proposed by this session and repairs this session's
own earlier design**; the mentor's ruling explicitly declined to discount it on that basis, and it is
flagged again here so the record does not lose it. The Gate-2 diagnosis was motivated by this
session's own recurring "Gate-2 UNAVAILABLE" notes — the first hypothesis (concurrency) was this
session's, and the data killed it.

*Nothing here licenses a build, spend, activation or publication. Path A's run remains a
founder-walked act.*
