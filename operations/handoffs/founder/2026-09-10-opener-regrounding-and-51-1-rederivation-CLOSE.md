# Session close — opener regrounding + the "51 guard, 1 consult" re-derivation

**Session `8fe3a6ae-dcb1-4324-846d-631d51336dc4`'s continuation, opened under
`2026-09-10-opener-regrounding-and-51-1-rederivation-NEXT-SESSION-PROMPT.md`.** Tier: read-only
diagnostic + documents. **AC7 not engaged.** No production surface touched, no `GUARD_RE` file edited,
no flag/schema/credential changed.

## Status: COMPLETE

## Task A — the standing opener reground

**Drafted, not adopted** — per the mentor's own ruling, regrounding is a founder act; this session did
the derivation and wrote the replacement. `operations/handoffs/founder/STANDING-SESSION-OPENER-grounded-foundations.md`
is now **Version 2026-09-10**, explicitly marked ⚠ DRAFTED, NOT YET FOUNDER-ADOPTED at its head. The
2026-09-08 version is archived at
`operations/handoffs/founder/archive/2026-09-08_STANDING-SESSION-OPENER-grounded-foundations.md`.

All three false facts the mentor named are corrected, with re-derivation evidence, not just assertion:

- **Baseline is 5 of 5** (re-derived independently from the buffer: window population 313 = 50
  consult + 263 guard, every UTC day 09-06 through 09-10 carries ≥1 consult record) — but **D2 remains
  blocked** per the Q1 ruling's "ordinary" condition, stated explicitly in the new version rather than
  left implicit.
- **`classifyCaller` is built and live** — confirmed from the Condition-3 design close's two addenda
  and the mentor's post-build-outcome response: no separate flag, self-activating, already fired live
  on production traffic with corroborating evidence across two sessions.
- **`caller_class` carries three values** — re-derived directly from the buffer: `unknown` 137,
  `subagent` 12, `live_agent` 18.

The new version does not re-verify every queue row from the 2026-09-08 table — that was out of this
grounding's declared scope (Task A's minimum list did not include the full standing-queue table) — and
says so explicitly, carrying the rest forward as unverified with a correction list layered on top
(`Q-CALLER-C2`/`C3`/`BUILD` done; `Q-D2-ENGINE` still blocked for a different reason; `Q-PREFLIP-REPORTS`
now carries required content).

## Task B — the "51 guard records, 1 consult record" figure: RE-DERIVED, REPRODUCES

Per the prompt's specified method (group buffer records by the `session` field, split guard/consult by
`path == 'guard'`, never an ad-hoc time filter):

- Session `a7ee3eeb-8b49-4db1-b281-e0db4f8270b0`'s records, restricted to buffer lines ≤360 (the exact
  buffer size the Cognitive OS build session's own close reported at the moment it wrote that
  figure): **52 records, 51 guard, 1 consult — exact match.**
- The same session ID continued after that point (most plausibly a resumed session the next UTC day —
  the last pre-360 record is 2026-09-08T20:35:50Z and the next is 2026-09-09T06:43:56Z, a ~6-hour gap)
  and accumulated 3 more records (2 guard, 1 consult), for a **lifetime total of 55 — 53 guard, 2
  consult** against the current 452-line buffer.

**The figure reproduces precisely, once scoped to the moment it was reported rather than to the
session's full lifetime.** This is now recorded in the standing opener with the method, so a future
session does not have to redo this triangulation.

## Task C — the v4=96/97 arithmetic: re-verified, not corrected

Independently re-derived from the current 452-line buffer's schema distribution (v1=138, v3=50, v4=97,
v5=135, v6=32, summing to 452) and cross-checked against the 423-line snapshot the ruling and the
2026-09-10 verification close both used (138+47+**97**+135+6=423, matching the append-only prefix
property; the ruling's own v3=47/v4=96/v5=135/v6=6 sums to 422). **The off-by-one is confirmed real.
The verbatim ruling was not edited.** This is surfaced in the new opener for the founder/mentor as an
open decision, not resolved here.

## What was NOT done, correctly

- `Q-PREFLIP-REPORTS` was not opened or built — it needs a founder waiver, and nothing in this
  session's prompt licensed building it.
- No queue row beyond the three named corrections was re-verified from source.
- The buffer was not touched, refreshed, or truncated.
- No `GUARD_RE` file was modified.

## Verified at close

| Check | Result |
|---|---|
| Byte-identity guard | **250 passed, 0 failed** |
| `layer2-mechanisms.ts` / `stoic-brain.ts` SHA pins | `60cefedb5f4f…` / `fa8895ec949b…` — unchanged |
| `GUARD_RE` files modified in tree | none |
| Buffer refreshed / truncated | no |
| R20a | 43 + 2 = 45 (counted from `r20a-invocation-guard.test.ts` array bodies) |
| Agent-card extensions | 26 |
| PR range | PR1–PR26 |
| `ListAgents` | 10 interactive peers + this one |
| Production surface touched | none |

## Commit scoping

This session's own new/modified paths are limited to: the standing opener (rewrite), its new archive
copy, this close file, and a decision-log tail append. **Several other files sit uncommitted in the
tree from other, closed sessions** (the cognitive-os arc, the condition-3 arc, a peer's
`environmental-context.json` scan, S10's working notes) — **none was staged or touched by this
session.** Any commit of this session's work must be path-scoped to its own files only.

**D2 REMAINS BLOCKED. The S11 flip remains REFUSED. Weights remain BLOCKED. The 0h call remains the
founder's.**
