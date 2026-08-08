# Next-Session Prompt — confirm the examined/observed fold with the mentor; re-check the telos line

**Tier: `governance`/`code-elevated` — a mentor consultation + possible small follow-up wording/build work depending on the ruling. No schema/flag/credential change is anticipated; if the mentor's response calls for a build change, scope it as its own step rather than folding it in live.**

## Context

The prior session (`2026-08-08-c2-examined-observed-fold-CLOSE.md`; decision-log `D-C2-EXAMINED-OBSERVED-DELIVERY-CLASS-BUILT-DEPLOYED-LIVE-2026-08-08`) closed out both items the mentor requested after the C2/C1c activation walk:

1. A real production consult's orientation reading was reviewed, found a genuine anomaly (server-completed-but-undelivered consults were being recorded as "examinations"), and that review was brought to the mentor.
2. The mentor ruled Option B (a distinct `examined`/`observed` delivery class, elapsed-time-proxy classified against the harness's documented 28000ms timeout) and supplied exact verbatim wording.
3. A separate curation-via-volume ruling request was also resolved and applied.

Both rulings were then **built, deployed, and live-verified** in the same session — not just scoped. `tsc`/`build` clean, three batteries extended (100/57/128, all green, non-vacuous end-to-end coverage), and a live curl against `GET /api/trust-record/sagereasoning:s9-loop@v1` confirmed the `class` field is genuinely present and correctly defaulting to `examined` on the 13 pre-existing (pre-fold) readings.

## Step 1 (primary) — confirm the live build satisfies the mentor's condition

**The mentor's rulings so far addressed the design decision (which option, which wording, which threshold) — they did not sign off on a specific live deploy.** Per this project's standing discipline (the activation-vs-validation distinction the mentor drew explicitly last time — "smoke verification that the mechanism works is not the same as..."), do not assume the fix being live automatically satisfies whatever condition gated the autonomous-loop blocking condition's part (b). Ask directly.

Put to the mentor (the founder relays, as always): a summary of what was built (the elapsed-time proxy at exactly 28000ms, the mentor's verbatim wording applied to both classes, the prospective-only no-backfill posture, the three R18 surfaces updated) plus the live-verification evidence (the curl output showing 13 readings correctly defaulting to `examined`). Ask explicitly:

- Does this closure of the examined/observed distinction satisfy whatever the mentor considers necessary before the autonomous-loop design-brief session can be scoped? Or is there a further condition (e.g., seeing a genuine `"observed"`-classified row live, not just the correct default on legacy rows) still outstanding?
- Record the response verbatim, per the standing discipline, in `operations/agent-circles-2026-08/` and a decision-log entry — do not summarize-and-discard.

**Only if the mentor confirms this closes the loop should the autonomous-loop design-brief session be scoped in a later session.** Do not scope it in this session even if the answer sounds like a yes — that's still a separate, later step per the prior session's own explicit instruction not to fold things together.

## Step 2 — re-check the telos line (now failed twice; escalate if it fails again)

The mentor's Q7 line (appended to the calling frame on the declared-purpose branch) has now been **unverifiable for two consecutive sessions** because both ran with the harness returning `http 401` on every hook call (unframed throughout). Check at the very start of this session, before doing anything else:

- Does this session's own opening calling frame (if the harness is framed at all this time) carry the mentor's Q7 telos line?
- If the harness is framed and the line is **absent**, the mentor already set the standard for this: **that is a build defect, to be flagged immediately** — not quietly re-checked again next time.
- If the harness is **still unframed** (401 again), that's now a third data point on a pattern (two-then-three consecutive sessions unable to verify) — worth surfacing to the founder directly as its own concern, separate from the telos-line question itself: something about credential health or harness configuration may need attention, independent of whatever caused the specific 401s.

## Step 3 — watch for a live "observed" sighting (passive, not a task to force)

If, in the course of this session's own harness-driven work, a consult naturally exceeds the harness's 28-second timeout (as happened repeatedly during the original C2/C1c activation walk), a quick `curl` on the trust record afterward would confirm the `"observed"` class round-trips correctly on the wire — closing the one remaining honest limit from the prior session. **Do not artificially construct a slow consult to force this** — the prior session deliberately declined to fabricate a test scenario for exactly this reason (the mentor's activation-vs-validation distinction). Just check opportunistically if it happens.

## What this session does NOT do

- Does not scope the autonomous-loop design brief, even if Step 1's answer is favorable — that requires its own explicit go-ahead in a later session, per the standing "do not fold things together" instruction.
- Does not touch the original build-plan C1c, Logos-on W2/W3, or the loop-fold/practice-suggestion B6 block unless the founder explicitly redirects.
- Does not attempt any further build work on the examined/observed mechanism unless Step 1's mentor response specifically calls for it.
