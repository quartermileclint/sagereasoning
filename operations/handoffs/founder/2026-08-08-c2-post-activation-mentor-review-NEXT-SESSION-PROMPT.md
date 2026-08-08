# Next-Session Prompt — C2 post-activation validation (the mentor-reviewed production consult) + the curation-via-volume ruling request

**Tier: `code-elevated`/`governance` — read-only investigation + drafting a mentor consultation write-up. No schema/flag/credential/public-surface change is anticipated; if one is proposed mid-session, it escalates to its own founder-walked `code-critical` step per the standing rules — do not fold it in here.**

## Context

The C2/C1c activation walk (`2026-08-08-c2-c1c-activation-CLOSE.md`) put C2 (the fifth-circle orientation reading) and C1c (its trust-event class) live in production under MEASURE. Immediately after, the founder relayed a mentor response to eight open items (verbatim: `operations/agent-circles-2026-08/2026-08-08-mentor-consultation-c2c1c-open-questions-verbatim.md`; decision-log: `D-C2-C1C-POST-ACTIVATION-MENTOR-CONSULTATION-OPEN-QUESTIONS-2026-08-08`). Two items from that response are this session's work. **Do not conflate them — they are separate mentor consultations.**

## Part A (primary) — the production-consult review (item 1)

**The mentor's own words, binding:** *"Smoke verification that the mechanism works is not the same as reviewing a genuine production reading for anomalous behaviour... The next actionable step is a real production consult, its orientation reading reviewed, and that review brought to the mentor. Nothing else substitutes for this."* This is also the autonomous-loop two-part blocking condition's part (b) — until this is done, the loop-extension design brief cannot be scoped, and the loop-fold self-regarding bucket + practice-suggestion basis B6 stay blocked.

### Step 1 — check for a naturally-occurring reading first

The founder's own standing harness (`sagereasoning:s9-loop@v1`) was live and firing real at-action/calling consults for the second half of the 2026-08-08 activation session (from the moment `SUBSTRATE_ORIENTATION_READING_ENABLED` went live in Step 3 onward) — genuine work, not a synthetic smoke. Check first whether that traffic already produced a real orientation-reading event, before manufacturing one:

```bash
curl -s "https://www.sagereasoning.com/api/trust-record/sagereasoning:s9-loop@v1" | python3 -m json.tool
```

Look at `data.orientation_readings` (if present) and `data.total_orientation_readings_count`. This is a fully AI-drivable, read-only, public-unauthenticated check — no founder action needed for this step.

### Step 2 — if none exists yet, produce one from genuine work

If Step 1 shows no orientation readings, do NOT construct a synthetic "smoke test" narrative — the mentor's distinction is specifically activation-vs-validation, and a fabricated test scenario risks reproducing exactly the gap being closed. Instead: continue this session's own genuine work (whatever the founder actually needs done) with the harness on (`/practice-on` if not already), and let at least one real at-action or calling consult fire naturally. Then re-run Step 1's curl.

### Step 3 — review for anomalous behaviour

For each orientation-reading event found (real or freshly produced), review:
- Does the `toward`/`away`/`indeterminate` classification match what a human reading the same underlying reasoning would independently judge?
- Does the entry's inline not-attestable clause read correctly, verbatim?
- Is there anything about the reading's basis, timing, or context that looks wrong, surprising, or worth flagging — not just "did the code run," but "does the reading's *content* look sound"?

This is the substantive check the mentor is asking for. Write it up plainly — a short review memo (2–4 paragraphs is fine), not a battery or a formal report.

### Step 4 — bring the review to the mentor

Put the review memo to the mentor (the founder relays; a fresh AskUserQuestion-style prompt or however the founder prefers to route it). Record the mentor's response verbatim, per the standing discipline, in `operations/agent-circles-2026-08/` and a decision-log entry. **Only once this is done and the mentor has responded does the autonomous-loop design-brief session become openable** — do not scope that brief in this session even if the review comes back clean.

## Part B (independent, can run before, after, or in parallel with Part A) — the curation-via-volume ruling request (item 2)

**The mentor's own words, binding:** *"The current public surfaces name the total-count fact but do not name 'curation via volume' as a distinct vector. Whether to surface that vector explicitly on public-facing disclosures is a genuine open question. Bring it to the mentor as a separate ruling request — do not resolve it by silent wording choice."*

**Do not silently add wording to `llms.txt`/`agent-card.json`/api-docs about this vector.** Instead, draft a short, honest framing of the question for the mentor — something like: *"Should the public trust-record disclosures name, explicitly, that an agent could generate enough favorable `toward` readings to push unfavorable `away`/`indeterminate` entries out of the visible 50-entry recency window — distinct from the already-disclosed total-count fact? If yes, what form (a named-vector sentence in the existing 'Orientation readings' section? a new disclosure)?"* Put this to the mentor, record the verbatim response the same way as Part A, and only then — if the ruling calls for a wording change — apply it as its own small, focused edit (likely `code-elevated`, similar in shape to Step 5 of the activation walk: apply verbatim, verify live).

## Also carry forward, lower priority

- **Check the telos line on THIS session's own opening calling frame.** The mentor sharpened the standard: if the mentor's Q7 line (*"The reasoning this session serves is oriented toward the rational order. What does this session's work require of that reasoning?"*) does not appear appended to the declared-purpose calling frame at this session's own open, **that is a build defect** — flag it immediately, do not quietly re-check later. (You may already have the calling frame from this session's own open in view — check it before doing anything else.)
- **The git-fetch/push anomaly recurred a second time** in the prior session (two separate commits each landed on `origin/main` without an explicit `git push`, confirmed both times via a genuine read-only `git fetch`). Per the mentor's stated threshold ("a single unexplained anomaly is noise; a pattern is signal"), this is now worth a few minutes of investigation at the start of this session — check `git config`, any global hooks, credential helpers, or environment-level sync behaviour that might explain it, and record what's found (even if the answer is "still unexplained").

## What this session does NOT do

- Does not scope or write the autonomous-loop design brief — that's gated on Part A being fully done, including the mentor's response to the review.
- Does not silently add curation-via-volume wording anywhere — Part B's ruling request must go to the mentor first.
- Does not touch D4, the Stoa activation, the original build-plan C1c, or any of items 5/6 (Logos-on W2/W3) unless the founder explicitly redirects — those are separate, unblocked-but-not-yet-elected sequencing decisions, named in the activation close, not this session's job.
