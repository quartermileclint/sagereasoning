# Gate-2 guard outages — diagnosis from the live log

**Date:** 2026-09-04. `governance`, read-only. **No harness config was changed**, no hook installed
or removed, no flag set. `.claude/settings.local.json` is the founder's file and is untouched.

**Why this exists.** The session that produced it recorded "Gate-2 UNAVAILABLE (28s timeout)" on most
of its own actions and said so in every commit. That is worth diagnosing rather than repeating.

---

> **⚖ RULED 2026-09-05 — this diagnosis was put to the mentor and its bearing is now binding**
> (`agent-circles-2026-08/2026-09-05-mentor-ruling-guard-availability-and-lean-mode-doctrine-verbatim.md`):
>
> - **The presence rate and the false-hold rate are ORTHOGONAL, and P4's four-part readiness standard
>   measures only the second.** A channel absent this often *"is not failing its examination. It is
>   not conducting one."* In the Stoic framing the guard enacts **eulabeia** at the action boundary,
>   and caution structurally absent 20–60% of the time is *"intermittent caution, which is a different
>   thing."*
> - **NOT a new gate; the four-part standard is NOT reopened.** The incompleteness *"should be named
>   explicitly before any flip is considered"* — recorded as **bound B4** in
>   `operations/trust-layer-2026-07/S11-FLIP-PREREQUISITES-REGISTER.md` §B, not as a §A prerequisite.
> - **Lean mode is DOCTRINAL, not an engineering preference.** *"A shorter impression is a different
>   impression."* It trades **examination completeness against examination frequency**, and a lean
>   examination that misses what would trigger a hold *"is failing to see what it would need to see to
>   hold — a different failure mode from a false hold, and not measured by the false-hold rate."*
>   **Lean mode is NOT to be adopted as the remedy.**
> - **The remedy is §3(b): raise the budget, both values together.** Confirmed correct.
> - **§4's covariate is not optional:** *"Any rate published from the window without an availability
>   covariate is a rate over a selected sample"*, and the selection mechanism correlates with the
>   examination conditions. Routed to P6.

## 1. The finding: the ENFORCE channel is chronically absent, and today it was mostly absent

Counted from `~/.sage-gate1/gate1.log`, all `GUARD-*` events per day:

| date | guard attempts | outages | outage rate | distinct sessions |
|---|---|---|---|---|
| 2026-08-29 | 26 | 6 | 23% | 11 |
| 2026-08-30 | 192 | 61 | 32% | 17 |
| 2026-09-01 | 4 | 1 | 25% | 1 |
| 2026-09-02 | 46 | 5 | 11% | 3 |
| 2026-09-03 | 58 | 12 | 21% | 11 |
| **2026-09-04** | **65** | **39** | **60%** | **9** |

**Two separate findings, and the second is the one that was not expected.**

**(a) There is a chronic baseline outage rate of roughly 11–32%.** On an ordinary day the guard —
the only mechanism in the harness that can actually *deny* an irreversible action — is unavailable on
something between a fifth and a third of the occasions it is asked. It fails **open**, with an honest
log line, which is the correct and designed behaviour (KG1). But "fails open honestly" describes the
failure mode, not the frequency, and the frequency has not been recorded anywhere until now.

**(b) 2026-09-04 is an outlier at 60%, and concurrency does not explain it.** The obvious hypothesis
— several sessions contending — **does not survive the data**: 2026-08-30 ran **17** distinct
sessions at **32%**, while today ran **9** at **60%**. Roughly half the sessions, roughly double the
failure rate. Whatever changed today, it is not session count.

## 2. Mechanism

- Every outage today carried the same reason: **`timeout after 28000ms`** (42 of 44; the other two
  were `http 503 — service error`). **No 429s** — so this is latency, **not** the IP rate limiter.
- The guard's budget is `GATE1_TIMEOUT_MS || fileCfg.timeoutMs || 28000`
  (`framing-core.mjs:100`), commented *"< the 30s hook timeout"*.
- The guard hook is a `PreToolUse` entry with **`timeout: 30`** in the founder's settings.
- **`/api/guardrail`'s measured latency is 14.5–19.1 s** — from the ten stored responses of the
  2026-08-29 c11 experiment, single session, sequential, ~6 s spacing
  (`agent-circles-2026-08/2026-08-30-c11-rerun-experiment-record.md`).

**So the budget carries under 2× headroom over the endpoint's own measured latency.** A route whose
best observed case is 14.5 s and whose worst is 19.1 s, behind a 28 s cutoff, will fail on ordinary
variance. The chronic 11–32% is what that looks like; today's 60% is that plus something unidentified.

**What cannot be determined from here:** whether today's excess is model latency, a deploy, cold
starts, or upstream load. A repo session cannot read production. Stated rather than guessed.

## 3. Two levers exist, neither is set, and both are the founder's

**(a) `GATE1_ACTION_TEXT_MODE=lean`** — real, implemented at `framing-core.mjs:147`, defaulting to
`composed`. This is the **already-named, still-open** "composed-consult latency lever" carried since
the 2026-07-19 consult-lookup-resilience prompt (its item B), described there as *a
fidelity-vs-availability tradeoff that is the founder's call*. It sends less text, so the Layer-1
extraction is cheaper and faster. **The diagnosis above is the missing evidence for that decision:**
the availability side of the tradeoff is not hypothetical, it is 11–32% chronic.

**(b) Raise the budget.** `GATE1_TIMEOUT_MS` is configurable and the 30 s hook timeout is **not a
platform ceiling** — another `PreToolUse` hook in the same file already runs at **`timeout: 120`**.
Raising the guard hook to, say, 60 s and `GATE1_TIMEOUT_MS` to ~55000 would put real headroom over a
19 s worst case. **Both must move together**: raising only the inner budget above the hook timeout
converts a logged fail-open into a killed hook, which is worse — it fails open *without* the honest
log line.

**Not recommended from here, and not done:** both live in the founder's gitignored
`.claude/settings.local.json`, both change live harness behaviour in the founder's own loop, and (a)
is explicitly reserved to the founder by the standing record.

## 4. One consequence worth routing, not acted on

**This bears on the false-hold observation window.** A guard that is unavailable on a fifth to a
third of attempts would produce a capture badly skewed toward whatever succeeds. **No data is
currently being corrupted** — `GATE1_FALSE_HOLD_CAPTURE` has been unset since 2026-07-17 and the
130-record buffer is frozen — but **any new observation window should size its expectations against
this outage rate**, or measure it as a covariate. A peer session is working that track (P6) at the
time of writing; this is routed there, not resolved here.

## 5. Reproduce

```bash
LOG=~/.sage-gate1/gate1.log
grep "^2026-09-04" $LOG | grep -o "GUARD-[A-Z]*" | sort | uniq -c
grep "^2026-09-04" $LOG | grep -o 'reason="[^"]*"' | sort | uniq -c
```

*Read-only. Nothing here changes the harness. The two levers are named, evidenced, and left to the
founder.*
