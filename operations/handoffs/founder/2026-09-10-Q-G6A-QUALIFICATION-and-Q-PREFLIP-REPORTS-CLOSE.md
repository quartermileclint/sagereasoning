# Session close — Q-G6A-QUALIFICATION + Q-PREFLIP-REPORTS built, under a founder waiver

**Session `8fe3a6ae-dcb1-4324-846d-631d51336dc4` (continuation).** Tier: `code-elevated`, founder
waiver (the touched file matches `GUARD_RE`), PR19 independent review required and run.

## Status: COMPLETE, waived work discharged, PR19-reviewed, fixes folded.

## The waiver

Granted explicitly by the founder in this session, scoped to exactly two edits inside
`website/scripts/false-hold-observation-report.ts` (plus its own test file): (1) encoding the G6(a)
product-vs-protocol-required qualification as a disclosed loop-count-by-action-class figure, and (2)
adding the pre-flip disclosures owed by the 2026-09-07 S8 ruling and the 2026-09-10 Q1 ruling. No
other file was touched. PR19 independent review before commit, as a condition of the waiver.

## What was built

A new **Part 5** in the report (`reportPreFlipDisclosures`), covering everything both binding
rulings name as owed:

- **5a** — schema distribution, **window-scoped** (v1 excluded, post-probe only), matching every
  prior session's published convention.
- **5b** — the edit-window anomaly count, re-derived from the buffer (not hardcoded) against the
  diagnosed shape (schema v6, `callerClass:'unknown'`, `clientVersion:null`).
- **5c** — the `live_agent` non-emission-window fact, derived from the earliest v6 record's
  timestamp.
- **5d** — baseline composition, day-by-day, tool distribution — the first Q-PREFLIP-REPORTS
  disclosure (item i).
- **5e** — loop events by action class (protocol-required vs product-or-governing-document vs
  unclassified) — the Q-G6A-QUALIFICATION disclosure and the second Q-PREFLIP-REPORTS item (ii),
  via a new heuristic classifier `classifyActionClass`.

Every figure is derived at report time from the buffer already read, never stored — matching the
discipline `reportRecommendationColumn` already established for the same reason (a stored reading
would freeze evidence that looks authoritative while still under active ruling).

## PR19 — real findings, all confirmed and folded before commit

Ran an independent adversarial review (general-purpose agent, code-reviewer-style brief). It found
**three real, source-confirmed defects** in the first draft, all fixed at the root and re-verified:

1. **HIGH — 5a used the wrong population.** The first draft computed the schema distribution over
   the whole buffer (v1 included) and its own comment/test asserted this matched "the ruling's own
   convention." That claim was checked and found **false**: the primary source
   (`operations/trust-layer-2026-07/2026-09-10-post-build-outcome-RELAY.md:52`) states *"schema
   distribution **in the window**"* — window-scoped, v1 excluded. Fixed: 5a now uses `windowRows`.
2. **MEDIUM/HIGH — the action-class fallback missed governing documents.** The first draft's
   fallback regex (`/\/(operations|website)\//`) never matched `manifest.md`, `CLAUDE.md`, or any
   ADR under `adopted/adr/` — exactly the "governing documents" the ruling names, and files this
   project edits routinely. Fixed: the fallback now matches the tool-preview's own generic shape
   (any recognized Write/Edit action), and a regression test (§16.4) pins all three paths correctly.
3. **MEDIUM — a stray v1 record past the window prefix would not have been excluded.** The first
   draft's window-scoping was a pure index slice; a v1 record occurring after the slice point (not
   possible on the real append-only buffer, but not structurally prevented) would have silently
   entered the window. Fixed: an explicit `schema !== 'false-hold-record-v1'` filter now applies
   regardless of position. The test's own synthetic fixture (which happened to place a stray v1
   record after a v3 record) now demonstrates the fix directly.

Two items were checked and found clean, no fix needed: no crash risk on production-shaped records
(the parse gate already validates required fields); the 5e "counts events, not lifecycles"
disclosure is honestly scoped and matches what the code actually computes.

## Verified at close

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| Report battery (`false-hold-observation-report.test.ts`) | **133 passed, 0 failed** |
| Real-buffer smoke (`--dry-run` against the live buffer) | baseline correctly reads **5 of 5**, matching this session's own independent re-derivation earlier |
| `GUARD_RE` files touched | exactly the two waived paths, nothing else |
| SHA pins (`layer2-mechanisms.ts`, `stoic-brain.ts`) | unchanged (unrelated to this change) |
| Production surface touched | none |

## What was explicitly NOT done

- **W2** (record honesty — the trust-ledger enforcement class) was scoped out at the founder's
  direction earlier in this session as unrelated and independently schedulable; still untouched.
- **No activation of anything** — this is a diagnostic script change, not a flag/schema/credential
  step. Running it against the live buffer (as done here) is read-only and non-destructive by
  construction (`--dry-run`, no DB writes).
- **The measured false-hold rate itself** was not computed here — Part 5 supplies the disclosures
  the rate's eventual publication will need; it does not compute the rate.

## Commit scoping

Two files changed: `website/scripts/false-hold-observation-report.ts` and its test. Both match the
founder's waiver exactly. Several other files remain uncommitted in the tree from other, closed
sessions — none was staged or touched.

**D2 REMAINS BLOCKED (Q1's "ordinary" condition, unaffected by this build). The S11 flip remains
REFUSED. Weights remain BLOCKED. The 0h call remains the founder's.**
