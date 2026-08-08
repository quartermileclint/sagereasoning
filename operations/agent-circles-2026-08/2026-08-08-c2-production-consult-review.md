# C2 production-consult review — for the mentor

**Date:** 2026-08-08
**Prepared by:** AI (Claude Code), per the mentor's binding instruction (`2026-08-08-mentor-consultation-c2c1c-open-questions-verbatim.md`, item 1): *"The next actionable step is a real production consult, its orientation reading reviewed, and that review brought to the mentor. Nothing else substitutes for this."*
**Status:** drafted for the founder to relay to the mentor. Not yet reviewed by the mentor.

## What was checked

`GET /api/trust-record/sagereasoning:s9-loop@v1` (public, unauthenticated) was pulled fresh this session. It shows **13 real orientation readings**, all from genuine harness-driven work in the founder's own standing loop (session `36670296-e716-4619-bdb9-e9ebf9404961`, the session that ran the C2/C1c activation walk itself and continued into ordinary edit/commit work afterward) — 11 `toward`, 2 `indeterminate`, 0 `away`. None of these were manufactured for this review; they were already sitting on the public record before this session touched anything. This satisfies the mentor's distinction between "smoke verification" and "a genuine production reading": this traffic is neither — it's the harness's own ordinary operation, observed after the fact.

## Finding 1 — content plausibility (clean, but unverifiable in detail)

The distribution (11 toward / 2 indeterminate / 0 away) is plausible for a session that was mostly routine file edits, git operations, and test runs — nothing in the surrounding session shape (per `gate1.log`) suggests conduct that should have drawn an `away` reading, and none appeared. No `away` reading firing on legitimate constructive work would have been the sharpest kind of false positive to catch; none did.

I cannot independently verify each reading's *specific* correctness against the underlying reasoning trace, because the entry text is a fixed two-sentence template (`"This examination moved toward the rational order."` / `"...showed insufficient evidence to read a direction."`) by design — the mechanism deliberately does not echo agent-specific content back (C2's own scope decision, to avoid a self-report channel). The underlying Layer-1 extraction that produced each classification is signed and server-side only; it isn't retrievable from the public trust-record surface, and the local harness didn't retain it for 12 of the 13 readings (see Finding 2 — the reasons are the same). So this check is a plausibility read at the distribution level, not a per-reading trace audit. That limit should be named to the mentor plainly rather than glossed over.

## Finding 2 — the real anomaly: a local/server divergence in what counts as "examined"

This is the substantive finding, and it is genuinely surprising.

Cross-referencing the 13 readings' `occurred_at` timestamps against the founder's own local hook log (`~/.sage-gate1/gate1.log`) for the same window (10:09–10:43 UTC) shows: **12 of the 13 readings landed a few seconds after the local hook had already logged a `CONSULT-OUTAGE`** (a client-side 28-second timeout, or "no assessment in response") for what appears to be the *same* at-action consult attempt. Only one of the 13 (10:09:15) corresponds to a consult the local hook itself recorded as successful.

Concretely, pairing each outage with the nearest following reading:

| local CONSULT-OUTAGE (client gave up) | orientation reading recorded (server completed) | gap |
|---|---|---|
| 10:12:41.877 | 10:12:44.569 | ~2.7s |
| 10:13:26.118 | 10:13:31.036 | ~4.9s |
| 10:15:07.413 | 10:15:14.667 | ~7.3s |
| 10:16:02.986 | 10:16:03.631 | ~0.6s |
| 10:22:06.684 | 10:22:08.563 | ~1.9s |
| 10:22:41.457 | 10:22:43.356 | ~1.9s |
| 10:23:18.587 | 10:23:20.956 | ~2.4s |
| 10:24:55.450 | 10:25:11.673 | ~16.2s |
| 10:35:09.675 | 10:35:15.046 | ~5.4s |
| 10:36:08.882 | 10:36:12.567 | ~3.7s |
| 10:41:18.838 | 10:41:27.880 | ~9.0s |
| 10:42:57.366 | 10:43:10.399 | ~13.0s |

**Reading:** the harness hook aborts the client-side fetch at a 28-second timeout and logs the action as `CONSULT-OUTAGE` — meaning, from the agent's own point of view, the action proceeded *unframed*, with no Stoic examination returned and nothing injected into context. But the server-side request kept running past that client timeout (consistent with the pre-existing M1 architecture, where a route handler can continue executing after the client disconnects), completed its Layer-1 extraction, computed the orientation reading, and wrote it to the permanent trust ledger — all without the agent ever seeing the result or having any chance to act on it.

So on this session's own record: **12 of 13 "examinations" the public trust record now attests to were, from the examined agent's own point of view, never delivered.** The agent experienced these actions as unexamined (correctly logged locally as unframed); the server experienced them as fully examined and scored, and permanently recorded a directional judgment about them.

This is not a claim that the readings themselves are wrong — the ones I can sanity-check (11 toward, 2 indeterminate, on ordinary constructive work) look right. It's a claim about what "examined" means. C2's own not-attestable clause says the record attests that *"specific examinations were oriented toward the rational order"* — but on this evidence, "examination" here means "the server-side pipeline ran to completion," not "the agent underwent and could respond to an examination." Those are different claims, and the public wording doesn't currently distinguish them. Whether this divergence is acceptable, needs disclosure, or points to a deeper timeout/architecture question (should a request whose framing response was never delivered even be eligible to mint a permanent trust-ledger event?) is exactly the kind of question this review exists to surface, not to resolve unilaterally.

## What I am NOT claiming

- I am not claiming the orientation-reading *classifications themselves* are wrong on the evidence available.
- I am not claiming this is a new defect in C2's build — the underlying 28-second consult-timeout class is a pre-existing, disclosed phenomenon (the S11b `CONSULT-OUTAGE`/fail-open-honest class, and the transient-401 class from an earlier memory). What's new is that C2 is the **first mechanism that turns "the server finished even though the client gave up" into a permanent, publicly-attested directional claim about the agent**, where every prior consequence of that timing gap (a missed frame, a missed guard) was purely local and silent.
- I am not proposing a fix. That's a design/scope decision for after the mentor has seen this.

## Question for the mentor

Given this: does an orientation reading drawn from a consult whose result was never delivered to the examined agent still fall within what C2's not-attestable clause licenses the record to say? Or does "examined" need to mean something closer to "delivered and available to the agent," with server-completed-but-undelivered consults excluded from the orientation-reading ledger (or disclosed as a distinct class)?
