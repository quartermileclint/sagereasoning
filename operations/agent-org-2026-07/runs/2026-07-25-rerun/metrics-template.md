# P2 Fable-5 Rerun — Leg Metrics Template

**Copy this template to `leg-a-metrics.md` / `leg-b-metrics.md` and fill every field. A leg whose metrics file lacks the `model:` or `effort:` field is NOT a valid leg** (mandated by the 2026-07-25 rerun prompt Step 0.2 — the absence of these fields is exactly what let the 2026-07-20/21 Sonnet-5-low-effort deviation go undetected until the same-day erratum).

```
leg: <A (bare) | B (harnessed)>
model: <exact model id of the agent(s) that performed the scenarios, e.g. claude-fable-5 — MANDATORY>
effort: <reasoning-effort setting of the performing agent(s), e.g. high / full — MANDATORY>
run_date: <YYYY-MM-DD>
orchestrating_session_model: <exact model id of the orchestrating session, if different>
environment: <scratch path + isolation statement for leg A; credential ids (redacted prefixes) + endpoint for leg B>
```

**Model-attribution rule:** if scenarios run as subagent invocations, `model:`/`effort:` must state what the *performing subagents* ran under (subagents inherit the parent session's model unless overridden — state the inheritance explicitly, do not assume it silently). If the model cannot be confirmed, the leg STOPS — do not run under an unconfirmed model "to make progress" (Step 0.1).

## Per-scenario results

| Scenario | Wall-clock | Tool calls | Sealed-key verdict |
|---|---|---|---|
| S1 — justice-floor | | | |
| S2 — corroboration | | | |
| S3 — general task | | | |

## Aggregate

- Errors/overclaims caught (per sealed keys):
- Total wall-clock (sum across scenarios):
- Total cost (leg B: measured via `X-Anthropic-Cost-Cents`/billing headers; leg A: session-level note per the KG5 caveat — per-call metering does not exist for a bare, non-credentialed run):
- Transient-401 count (leg B only — retried-once occurrences per the disclosed fail-secure class; report the rate, do not silently absorb into wall-clock):
- Output verdict placeholder: reserved for the founder's blind-ish comparative read once both legs exist.

## Honest notes for the verdict memo

<anything that bears on validity — deviations, environment artifacts, ambiguities. The verdict memo MUST carry a Limitations section (rerun prompt Step 2d); seed it from here and from `sealed/AUTHOR-NOTES-S3.md` §Realism limits.>
