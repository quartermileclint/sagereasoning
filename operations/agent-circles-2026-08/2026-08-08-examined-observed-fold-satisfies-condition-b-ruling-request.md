# Ruling request — does the live examined/observed fold satisfy autonomous-loop condition part (b)?

**Date:** 2026-08-08 (following the prior session's build/deploy/live-verify)
**Prepared by:** AI (Claude Code), per the standing next-session prompt's Step 1: *"Do not assume the fix being live automatically satisfies whatever condition gated the autonomous-loop blocking condition's part (b). Ask directly."*
**Status:** open question. Nothing has been scoped or built in response to this memo — it is the request itself.

## What is being asked

The mentor's binding statement on item 1 of the prior open-questions consultation (`2026-08-08-mentor-consultation-c2c1c-open-questions-verbatim.md`) was:

> "The next actionable step is a real production consult, its orientation reading reviewed, and that review brought to the mentor. Nothing else substitutes for this."

That review happened (`2026-08-08-c2-production-consult-review.md`) and surfaced a genuine anomaly — 12 of 13 real orientation readings on `sagereasoning:s9-loop@v1`'s live trust record had been permanently ledgered from consults the agent itself experienced as timed-out and unframed. The mentor ruled on the anomaly (Option B: a distinct `examined`/`observed` delivery class) and then ruled on three scoping questions the recommendation surfaced (the elapsed-time proxy at exactly 28000ms; a single `class` field; prospective-only, no backfill), supplying exact verbatim wording for both the observed-class text and a separate curation-via-volume disclosure.

**Both rulings were then built, deployed, and live-verified in the same session** (`D-C2-EXAMINED-OBSERVED-DELIVERY-CLASS-BUILT-DEPLOYED-LIVE-2026-08-08`):

- New pure functions `classifyOrientationDelivery(elapsedMs)` (28000ms-exact threshold, disclosed as a proxy never a confirmed-delivery claim) and `selectOrientationEntryWording(...)` (the mentor's verbatim pair for the observed class, applied word-for-word — including the constraint that "examination" never appear affirmatively in observed-class text).
- The route now captures `requestReceivedAtMs` and threads `elapsedMs` through the deriver into a required (not defaulted) input.
- The read path selects the new `orientationDeliveryClass` jsonb key via a JSON-path select that deliberately never exposes the whole payload column — preserving the pre-existing "cannot leak consult content" guarantee.
- All three R18 surfaces (`llms.txt`, `agent-card.json`, api-docs) carry both rulings' exact verbatim wording, plus a dated ADR-013 §8 amendment.
- Batteries extended non-vacuously (orientation-reading 100/0, orientation-trust-events 57/0 — including an end-to-end emit→read round trip proving the JSON-path select genuinely differentiates per-row rather than passing by coincidence — s10-trust-record-surface 128/0).
- **Live-verified after the founder's push and a green Vercel deploy:** curl against production confirmed the correct wording on all three public surfaces, and confirmed `GET /api/trust-record/sagereasoning:s9-loop@v1` now genuinely serves `"class": "examined"` on all 13 pre-existing readings — a real Postgres round-trip, not the in-memory test double.

## Why this needs asking rather than assuming

The mentor's rulings on Option B addressed the **design decision** — which option, what threshold, what wording, what data shape. They did not, at any point, sign off on a **specific live deploy** as satisfying the original item-1 condition. The mentor has drawn this activation-vs-validation distinction explicitly once already in this same thread ("smoke verification that the mechanism works is not the same as..."), and the standing next-session prompt for this session named that discipline directly as the reason to ask rather than infer.

## The two things this memo needs a ruling on

1. **Does the design + build + live-verification above close item 1**, such that the autonomous-loop blocking condition's part (b) is now satisfied — clearing the way for a later session to scope the autonomous-loop design brief? Or is there a further condition still outstanding (for example: does the mentor need to see a genuine live `"observed"`-classified row before considering the delivery-honesty defect itself closed, as distinct from the anomaly review being complete)?

2. **If not yet closed, what specifically remains?** So the next session (whichever one it is) has a concrete, non-inferred target rather than repeating the same "is this enough?" cycle.

No further build work has been undertaken pending this ruling. If the mentor's answer calls for anything further (a genuine `"observed"` sighting to be manufactured rather than awaited naturally, an additional disclosure, a different closure criterion entirely), it will be scoped as its own step per the standing discipline, not folded into this memo.
