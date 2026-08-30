# Next-session prompt — apply the verdict-variance disclosure (wording already signed)

**Paste this as the task after the standing session opener — but ONLY once the mentor has answered
the rate-location question.** Authored 2026-08-30.

**Tier:** `code-elevated`. Live public-contract surfaces + the battery-locked `TRUST_RECORD_ENVELOPE`.
No auth, perimeter, encryption, or schema surface; no flag is flipped; no behaviour changes.

## Pre-conditions

**1. The mentor answer — DISCHARGED 2026-08-30.** The question was put and answered the same day:
`operations/agent-circles-2026-08/2026-08-30-mentor-ruling-verdict-variance-rate-location-verbatim.md`
(binding). *"'Available in the watching table' described where I assumed aggregate measurement data
would naturally accumulate… It was not a ruling that D6a's output must persist there. The executing
session's reading is correct… **That wording stands.** D6a's DQ-2 remains open."* **No word of the
held wording changes.** The ruling's two forward obligations bear on D6a and on the eventual rate
update, not on this application — both are folded into the D6a build prompt and recorded at
sign-off-package §1. **This pre-condition no longer blocks; do not re-litigate it.**

**2. The one remaining gate — PR19.** An independent adversarial review of the held wording has
**not** been run — the authoring session was under a no-subagent constraint and said so rather than
claiming the gate discharged. Run it **before** anything reaches a surface. Tell the reviewer that
the author's own claims-vs-source pass already ran (package §11) so it hunts for what that pass
missed. The prompt this arc inherits warns that the mandatory-re-run obligation *"has been missed
once already in this arc"* — do not make it twice.

**Nothing else blocks.** The wording is signed and mentor-confirmed; run the review, then apply.

## What is already done, and must not be re-litigated

**The wording is SIGNED.** `operations/agent-circles-2026-08/2026-08-30-verdict-variance-disclosure-R18-SIGNOFF-PACKAGE.md`
carries the exact text for every surface, plus the founder's elections:

- §3 `does_not_attest` entry, §4 ADR-013 §8 amendment, §6 the three R18 surfaces — **signed as drafted**
- §7 guardrail R10 addition — **elected in full, advisory sentence retained**
- §8 the epistemic-status-map fourth route — **elected, take it**

**Re-open the wording only if** PR19 finds a defect in it (the mentor's answer did not require any
change — it confirmed the wording), or to adopt package **§11's F-1** (replace *"is scheduled"* with *"has been designed and is queued"* —
recommended, and it needs the founder's word since they signed the current phrasing).

## Ordering — binding, from ADR-013 §8's own 2026-08-15 and 2026-08-25 precedents

1. **Edit 1, one commit:** `TRUST_RECORD_ENVELOPE` (`website/src/lib/substrate/trust-core/trust-record-payload.ts`)
   + the ADR-013 §8 dated amendment + battery pins **S2-48/S2-49/S2-50**, together.
2. **Edit 2, after 1 is committed:** `llms.txt` (trust-record list, guardrail section, epistemic-status
   map), `agent-card.json` (new `verdict-variance/v1`), api-docs.

**The public surfaces must not lead** — publishing a `does_not_attest` claim the served envelope
does not yet carry is the defect the precedent exists to prevent.

## Facts to re-derive, never quote

- **S10 battery baseline: 140 passed / 0 failed** as of 2026-08-30. The predecessor prompt said 106/0
  and was stale. Re-run before and after; expect it to FAIL first on the S2-37-adjacent pins and
  treat that as the pins working.
- **`agent-card.json` extension count: 24** as of 2026-08-30 → **25** after the addition. Re-derive
  by parsing the file.
- **Mutation-verify each of S2-48/49/50**: delete its clause, confirm the pin fails, restore.

## Standing constraints

- **Nothing here publishes a rate.** Not the c11 1-in-10, not a Wilson interval, not "approximately".
  **S2-49 exists to enforce exactly that** — it pins `'Its rate has not been measured'`.
- **Layer 2 of the ruling** (the per-verdict disagreement count on K-sampled verdicts) is **not in
  scope**; it needs D6a and Option S live.
- **Weights-BLOCKED, Q1** — untouched. This changes no behaviour, no gate verdict, no engine path.
- **PR25** — any verification claim in a code comment carries its check.
- **Concurrency** — `ListAgents` at open; `git status` twice; path-scoped commits; never `git add -A`;
  append shared records at the physical tail.
- Nothing bears on the 0h call.

## What "done" looks like

PR19 run and folded; edit 1 committed with the battery green and the
three pins mutation-verified; edit 2 committed with the extension count re-derived; a decision-log
entry at the tail; a lean close. The rate ships **unknown**; D6a's DQ-2 carries the
publicly-readable-location obligation the mentor's answer created, already folded into its prompt.

End of prompt.
