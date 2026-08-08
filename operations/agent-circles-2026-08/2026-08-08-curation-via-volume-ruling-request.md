# Ruling request — "curation via volume" as a named disclosure vector

**Date:** 2026-08-08
**Prepared by:** AI (Claude Code), per the mentor's instruction (`2026-08-08-mentor-consultation-c2c1c-open-questions-verbatim.md`, item 2): *"Whether to surface that vector explicitly on public-facing disclosures is a genuine open question. Bring it to the mentor as a separate ruling request — do not resolve it by silent wording choice."*
**Status:** open question, no wording has been changed. This is the request itself, not a proposed fix.

## The fact already disclosed

The public trust record (`GET /api/trust-record/{agent_id}`) caps `orientation_readings` at the 50 most recent entries and separately states `total_orientation_readings_count` — an honest count of everything, even when the list itself is a window. This was the mentor's own §6(b) ruling ("showing 50 of 847," never a bare window implying completeness), and it is live and correct as far as it goes.

## The distinct vector not yet named

That disclosure covers *volume exceeding the window*. It does not name a *second, distinct* thing an agent could do: deliberately generate many `toward`-classified consults in order to push older, less favorable (`away` or `indeterminate`) readings out of the visible 50-entry window — not by hiding them (the total count still discloses their existence), but by making them practically invisible to anyone reading the *readings list itself* rather than doing the arithmetic on the count.

This is different from ordinary trust-ledger gaming in two ways: (1) it costs the agent nothing but volume — every entry counted is genuine, correctly-classified work, not a fabricated or manipulated one; and (2) the total count *does* disclose that more exist, so nothing is technically hidden — but a reader who trusts the visible list as representative, without doing the count subtraction themselves, could be quietly misled about the *recent character* of an agent's conduct.

## The question

Should the public trust-record disclosures name this "curation via volume" possibility explicitly, as a distinct vector from the already-disclosed windowing fact? If yes:

- Does it belong as an added sentence in the existing "Orientation readings" section (`llms.txt` / `agent-card.json` / api-docs), alongside the total-count disclosure?
- Or does it need its own separate disclosure, since it's a distinct risk (a possible strategy) rather than a structural fact (a window size)?
- Or is the existing total-count disclosure judged sufficient — since a careful reader already has the information needed to notice the gap themselves, and naming the strategy explicitly might read as instructions rather than disclosure?

No wording has been applied anywhere pending the mentor's ruling. If the ruling calls for a change, it will be scoped as its own small `code-elevated` edit (apply verbatim to the three R18 surfaces, verify live) — the same shape as the Step 5 wording application in the C2/C1c activation walk.
