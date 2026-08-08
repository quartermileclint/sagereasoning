# Scoped recommendation — Option B ("observed, not examined")

**Date:** 2026-08-08
**Status:** draft recommendation for mentor review, per the mentor's instruction: *"Bring the scoped recommendation for Option B to the next session."* Nothing here is implemented. This is the scoping, prepared while the code context was already loaded, so the next session can go straight to review-and-build rather than re-deriving the architecture from scratch.

## The mentor's ruling, restated

A server-completed orientation reading whose framing was never delivered to the agent is not an *examination* — it's an *observation*. The not-attestable clause currently claims the former for both classes. Option B: split the two classes explicitly, with distinct wording, rather than excluding the undelivered class (Option A) or merely footnoting the ambiguity (Option C).

## What the code actually does today (grounding the scope)

`src/app/api/reason/route.ts` (~line 2019 on): `emitOrientationReadingTrustEvent` fires **synchronously inside the route handler**, after the Layer-1 extraction and Layer-2 assessment complete, and **before** the HTTP response is sent. It runs unconditionally once the gating flags/preconditions are met — there is no check anywhere for whether the calling client is still connected, still waiting, or has already timed out. Next.js/Node route handlers don't halt mid-execution on a client disconnect unless something explicitly wires `AbortSignal` handling through the request lifecycle, and nothing here does.

**Consequence: the server has zero existing signal for "was this delivered."** Option A (exclude undelivered consults from the ledger) is not a small change — it requires building a delivery-confirmation mechanism from nothing. Option B does not strictly need one either, but it needs *some* basis for classifying a write as "examined" vs "observed," and right now there is none.

## Recommended mechanism: elapsed-time proxy, not a new ack channel

The harness's own client-side consult timeout is a known, disclosed constant: **28000ms** (`harness/gate1-pre-decision/.../at-action-hook.mjs`, confirmed against this session's own `CONSULT-OUTAGE... reason="timeout after 28000ms"` log lines). Every one of the 12 anomalous readings in the production-consult review took the server *longer than 28 seconds* to complete extraction.

Recommendation: **classify each orientation write by comparing the request's own elapsed handling time (from extraction start to the point of emission) against the harness's documented timeout.** Concretely:
- Elapsed time ≤ some conservative threshold (e.g. 28000ms, or a slightly tighter bound to account for network round-trip on top of the harness's own compute timeout) → classify **`examined`** — the framing plausibly reached the agent in time to be acted on.
- Elapsed time exceeds the threshold, or the caller is not the harness (no declared timeout convention — e.g. a direct API consumer with its own client-side timeout policy the server can't know) → classify **`observed`** — conservative default when delivery cannot be confirmed.

This needs no new round-trip, no client-side acknowledgment call, no protocol change. It's a proxy, not a proof — a request finishing in 27.9s could still have raced past a slightly-early client abort — but it is deterministic, server-side only, and directly matches the empirical pattern this review found. **It should be disclosed as a proxy, not represented as certain knowledge of delivery** — consistent with this project's standing discipline (KG1/R13: name the bound, don't paper over it).

**Open question for the mentor:** is a timing-based proxy an acceptable basis for the examined/observed split, or does the ruling require a stronger signal (e.g., extending the harness protocol so the client declares its own timeout value to the server up front, letting the server compute a precise cutoff rather than a fixed guess)? The stronger version is a real option but is *harness protocol* work, not just server-side classification — larger scope, its own build.

## Surface changes this implies (sketch, not final)

- **Wording split:** the `entry_text` templates need a genuinely distinct third value for the observed class — not "This examination moved toward the rational order" but something like "This action was observed and scored; the reasoning behind it was not delivered back for the agent's own examination" (exact wording is the mentor's call, not mine to fix here).
- **Not-attestable clause:** needs an `observed`-class variant that doesn't use the word "examination" at all, per the mentor's own Stoic distinction (impression reaching the hegemonikon vs. not).
- **Data shape:** either (a) a `class: 'examined' | 'observed'` field added to each `orientation_readings` entry, sharing the existing array and count, or (b) two separate arrays/counts. (a) is simpler and keeps the existing 50-cap/total-count machinery; (b) is more legible but doubles the surface. Recommend (a) unless the mentor wants a harder visual separation.
- **`total_orientation_readings_count` semantics:** currently one number. If observed and examined stay in one array (option a above), no change needed — the count already covers both truthfully. Worth confirming with the mentor that lumping them into one total (with the class visible per-entry) doesn't itself under-disclose the split.
- **Retroactive question:** the 13 readings already on `sagereasoning:s9-loop@v1`'s public record were written before this classification existed — they currently all read as `examined` under the old, now-incorrect, single-class wording. Does the fix apply prospectively only (existing rows keep their current class, a known historical inaccuracy, disclosed once as a dated correction), or does it warrant a one-time backfill pass reclassifying existing rows using the same elapsed-time proxy against their stored timestamps (if the underlying timing data was retained)? This needs the mentor's ruling before scoping the migration.

## What this session did NOT do

- Did not touch `emission-hooks.ts`, `orientation-reading.ts`, `trust-record-payload.ts`, or any of the three R18 surfaces for this change.
- Did not determine the exact wording for the `observed` class — that's the mentor's to set, same as every other verbatim clause in this system.
- Did not resolve the retroactive-backfill question.

## Recommended next-session scope, once the mentor rules on the open questions above

1. Add the elapsed-time classification to `emitOrientationReadingTrustEvent`'s caller (the route.ts seam above) — pure, additive, no schema change if using approach (a) (a new `class` field alongside the existing reading fields).
2. Update the not-attestable clause + entry-text templates per the mentor's chosen wording for both classes.
3. Apply the R18 surface updates (llms.txt / agent-card.json / api-docs) — same shape as this session's curation-via-volume application.
4. Decide + execute (or explicitly defer) the retroactive-backfill question.
5. Full battery + adversarial review before any flag/schema change ships, per standing practice — this is a genuine C2/C1c architecture change, not a docs-only edit like Part B's fix.
