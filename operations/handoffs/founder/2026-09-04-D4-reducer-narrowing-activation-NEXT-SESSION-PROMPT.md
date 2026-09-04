# Next session — TWO items: register D4's activation, and F-3′ (guard availability as a window precondition)

**Item 1 — D4's activation walk** is `code-critical` and attended (below).
**Item 2 — F-3′** is documents-only and can be done either side of it.
**A third item was considered and is NOT carried:** the register changelog entry for the 2026-08-17 P8a
build. A mentor sequencing note re-queued it here, but it was **already applied on 2026-09-04** and is
present in the register (verify with the grep in "First move"). Do not write it twice.


**This session is ATTENDED and `code-critical`.** It flips a flag that changes a **LIVE trust-event
emitter**. AC7 engages; PR6 and PR17 engage; every live op is yours, not the AI's. It cannot be run
autonomously, which is why the 2026-09-05 founder decision gave it its own session.

**Read first, in this order:** `/adopted/standing-protocol-cache.md` →
`operations/handoffs/founder/2026-09-04-P6-recommendation-column-CLOSE.md` **including §7** (PR21) →
`S11-FLIP-PREREQUISITES-REGISTER.md` **§D rows D1, D3, D4 in full** →
`2026-07-19-mentor-consultation-dikaiosyne-self-circle-verbatim.md` (the ruling being completed) →
the **2026-08-16 mentor ruling M-1**, which OVERTURNED this build's original asymmetry → then this file.

## First move: verify, don't trust this file

```bash
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git fetch origin && git status -sb | head -3
git log --oneline -3
cd website && npx tsx src/lib/substrate/trust-core/__tests__/at-action-seam.test.ts
npx tsx scripts/__tests__/false-hold-observation-report.test.ts
cd .. && node harness/gate1-pre-decision/test/negative-battery.mjs | tail -2
```

Then confirm item 2 is still owed, and that item 3 is still done — a peer session works this register:

```bash
# F-3' still outstanding? BOTH must print 0. If either is non-zero, a peer has landed it — re-scope.
awk '/\| \*\*P6\*\*/' operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md | grep -ciE "availab|outage|presence rate"
grep -ciE "availab|outage|presence rate" operations/trust-layer-2026-07/2026-08-15-false-hold-new-window-scoping-note.md
# The P8a changelog entry: must print 1 (already applied — do NOT add it again).
grep -c "2026-08-17 (P8a guard-path capture BUILT" operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md
```

Expected: `59 passed`; `74 passed`; `251 passed, 0 failed` + `RELEASE GATE: PASS ✓`; then `0`, `0`, `1`.
**Run the real `fetch`** — four consecutive sessions have found unlanded commits this way, and on
2026-09-04 a peer's push published six of them mid-session.

## What D4 is, in one paragraph

The 2026-07-19 self-circle ruling landed in the **predicate** (`kathekon-engagement.ts`, MEASURE-consumed)
but not in the **reducer** (`deriveWorstJusticeOutcome`, `derive-trust-events.ts`), which reads no circle
identity and still emits justice events for a self-only-circle assessment. Per the ruling that is a
mis-attribution: self-only action is `phronesis`/`sophrosyne`, not `dikaiosyne`. The reducer half is
**BUILT DARK** (2026-08-17, R2b) behind the dedicated flag
**`SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED`** (unset everywhere ⇒ pre-D4 byte-identical,
battery-asserted). **This session is the activation, not the build.**

## Three things to carry in, none of which are optional

1. **The narrowing is SYMMETRIC across all four outcomes, by mentor ruling M-1 (2026-08-16), which
   OVERTURNED the original build's asymmetry.** The first build gated `unevaluated`/`indeterminate`/`met`
   but left `violated` ungated, reasoning that dropping adverse evidence makes trust read higher. The
   mentor rejected that. **Read M-1 before you touch the flag** — if the code has drifted back toward the
   asymmetry, that is a stop condition, not a footnote.

2. **D1's cap logic rests on the same reducer** and the register says the two must be settled together.
   Determine, from source, whether activating D4 alone moves the live `justice_capped` state on any
   existing agent — and whether the append-only historical event would re-latch on a future replay (the
   disclosed 2026-07-18 caveat). If it would, that belongs in the walk, not in a later surprise.

3. **This flag is now also read by the P6 recommendation column** (built 2026-09-04, `dc100b4`).
   `derive-trust-events.ts:125` reads it **at call time**, so the false-hold report's recommendation
   column depends on it. Verified byte-identical both ways on the v1 frozen buffer (no circle names for
   the narrowing to read); **on v3/v4 window data the two settings can diverge.** The report prints this
   as its ENGINE-FLAG BOUND. Consequence: after activation, any published figure must record which
   setting produced it — and figures produced before and after are not directly comparable.

## Item 2 — F-3′: land the routed guard-availability precondition

**Documents only. Tier `governance`.** This is the half of the guard-availability matter that was
deliberately left for this track.

**What happened.** A concurrent session measured a chronic guard-outage rate and recorded it as register
**B4** in **Section B** (`2026-09-05-mentor-ruling-guard-availability-and-lean-mode-doctrine-verbatim.md`,
Q-G1). That ruling's Q-G1(c) — the availability covariate is *"not optional for honest reporting"* — was
**ROUTED to P6 and deliberately NOT written into the P6 row**, in the peer's own words *"routed, not
appropriated"*, because P6 was another session's active work. A later ruling
(`2026-09-05-mentor-ruling-part3-structural-unfailability-verbatim.md`, Q3) then made a bounded
availability rate **a precondition on the WINDOW, in the same class as P8a**.

**The task.** Record that precondition where P6 actually lives:
1. **The scoping note** (`2026-08-15-false-hold-new-window-scoping-note.md`) — §2.4 is the closest
   existing home (it already covers *consult* timeout losses, a **different quantity**), and §3 is where
   window preconditions are sequenced. A bounded guard-availability rate joins P8a's activation there.
2. **The P6 register row** — name it as a precondition and point at B4.

**Constraints, all load-bearing:**
- **Point at B4; do NOT restate it.** B4 carries the measurement, the mechanism, the applied F1 remedy
  and the owed follow-up. Duplicating any of that creates two copies that will drift — this project's
  most reliable failure mode.
- **Do not move B4 or change its section.** Q-G1 is explicit that it is *"NOT a new gate and does not
  reopen P4's four-part standard"*, hence Section B. F-3′ is compatible with that: **P8a is a window
  precondition, not a fifth part of the standard**, and so is this.
- **Quote the measured baseline correctly: 11–32% on ordinary days, with 60% on 2026-09-04 as a named
  outlier.** A ruling initially restated this as "20–60% baseline" and the correction was accepted and
  carried. Do not propagate the wrong figure.
- **The threshold is NOT set here.** Q3: *"The threshold is a P6 design question."* Name the
  precondition; do not invent a number for it.
- **The F1 remedy is applied and its follow-up measurement is OWED, not done.** B4 states the honest
  position: the presence rate was 11–32% when last measured, a remedy has been applied, and its effect is
  unquantified. Do not write as though the remedy discharged the bound.

## What this session must NOT do

- **Not** start the false-hold window, set `GATE1_FALSE_HOLD_CAPTURE`, or touch `GATE1_STATE_DIR`.
- **Not** treat D4's activation as progress toward the flip. **The S11 flip is REFUSED and stays refused.**
  P4/P5/P6 are unmoved by anything here. If a move starts to feel like it is building toward the flip,
  stop and name it.
- **Not** fold in the standing-runner track (`operations/agent-circles-2026-08/`) even if its files appear
  in `git status` — peer sessions work there. Commit path-scoped; run `git status` twice.
- **Not** let the AI perform any Supabase, Vercel, git-push or mint operation. It guides and verifies.
- **Not** restate B4's content in the P6 row or the scoping note, move B4, or re-add the 2026-08-17 P8a
  changelog entry that is already there.
- **Not** set a numeric availability threshold — Q3 reserves that to the P6 design work.

## Standing constraints

- **Verify against source, not against this file or the decision log's prose.** On 2026-09-04 the
  session's own build shipped a figure that was an arithmetic identity, and it took an independent
  review to find it; the register was right and a prompt was wrong on an earlier occasion.
- **PR19 applies** to any code change here. An independent adversarial review of the 2026-09-04 build
  ran 29 mutations against its author's battery and found six survivors the author's own 8-mutation
  sweep had missed. **Assume your own sweep is weaker than you think it is.**
- **Timestamp-check every present-tense mechanism fact you write (PR20).**
- **Guardrail cautions: read the grounds.** Expect outages — a peer measured a chronic **11–32%**
  guard-unavailability rate on 2026-09-04 (`cc846a9`), mechanism identified as the 28s budget against a
  14.5–19.1s measured endpoint latency. A deny is ENFORCE and is honored; an outage is not a deny.

## Anticipated shape

| Phase | Estimate |
|---|---|
| Reads (cache, close, register §D, both rulings) | 25–30 min |
| Pre-flight: batteries + the M-1 symmetry check + the D1 coupling determination | 30–45 min |
| TEST activation + verification | 30–45 min |
| Production flag flip + live verification (yours) | 30 min |
| Item 2 — F-3′ (scoping note §2.4/§3 + P6 row) | 30–40 min |
| Decision-log + close | 30 min |

**Rollback:** unset `SUBSTRATE_JUSTICE_SELF_CIRCLE_NARROWING_ENABLED` and redeploy — flag-off is
byte-identical and battery-asserted. No schema change is involved.

End of prompt.
