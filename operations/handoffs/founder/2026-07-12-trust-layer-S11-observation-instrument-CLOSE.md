# Session Close — 2026-07-12 — Trust Layer S11 observation period: the false-hold labelling instrument (BUILT DARK + review-folded)

**Stream:** founder.
**Governing frame:** /adopted/standing-protocol-cache.md + /adopted/build-sessions-protocol-cache.md; the observation-period prompt (`2026-07-12-trust-layer-S11-observation-period-NEXT-SESSION-PROMPT.md`).
**Tier:** `code-critical` — **escalated from the prompt's `code-elevated`** by the founder's DB-table election (a new table ⇒ a founder-walked migration). Everything built DARK/additive/flag-off this session; the migration + flag activation (to start the 7-day clock) is the CARRIED founder-walked step. The AI performed no Supabase/Vercel/git op.
**Date:** 2026-07-12.
**Decision-log entry:** `D-TRUST-LAYER-S11-OBSERVATION-INSTRUMENT-BUILT-DARK-REVIEW-FOLDED`.

## What happened

The S11 deferral named a four-part readiness standard; part (3) — a **measured false-hold rate over the live distribution** — is unmeasurable from the current MEASURE record (it logs verdicts but does not label which holds are false positives). This session built the instrument that produces that measurement, DARK and MEASURE-only:

- **The canonical Q3 predicate** (`website/src/lib/substrate/trust-core/kathekon-engagement.ts`) — `assessKathekonEngagement` (the four arms: justice surface present / violated obligation / proximity ≤ habitual / sub-species passion), `kathekonSignalsFromAssessment` (the projection), `classifyObservation` (the false_positive / correct_hold / not_a_hold labelling). The justice arm **reuses the engine's own `deriveWorstJusticeOutcome`**; the proximity arm reuses `PROXIMITY_RANK`. This is authored **once as the exact shared function the eventual S11 G6(a) flip binds on** — the flip reuses it, never re-implements it.
- **The additive harness capture** (`false-hold-capture.mjs` + the `runConsult` call + the `GATE1_FALSE_HOLD_CAPTURE` flag) — durably records every at-action verdict's kathekon signals + the loop event to a JSONL buffer. Flag OFF by default ⇒ **byte-identical** to pre-S11 (proven at the release-gate level). Fail-soft; CONSULT-path only.
- **The `agent_hold_observations` table migration** (append-only, RLS service-role-only, retention, idempotent + reversible) — AUTHORED, not applied.
- **The ingest + readiness report** (`false-hold-observation-report.ts`) — applies the predicate, idempotently ingests, and prints the whole four-part readiness standard, with the false-hold rate (part 3) as the computed core.

**Founder elections (AskUserQuestion):** classification = **the structural Q3 predicate + a day-7 spot-check**; store = **a New DB table** (which escalated the tier to `code-critical`).

**The dogfood measured its own builder throughout** — roughly a dozen live reproductions of the exact "contrary; no kathekon factors detected" false-positive class on this session's own build actions (the predicate Write, the edits, the doc writes), each with an open correction loop and an `S4 recommendation: proceed/log` (i.e. the hold source was the G6 open-loop bound, not the decision table). Run the predicate on each and it returns `engaged=false → false_positive`. The instrument correctly labels its own construction.

## Adversarial review

A 7-dimension Workflow (find → adversarially-verify) **completed fully — 10 agents, 0 errors, ~2.3M tokens.** 5 dimensions CLEAN (predicate-faithfulness, non-vacuity, capture-byte-identity, projection-consistency, migration-correctness). **3 findings, all CONFIRMED, 0 refuted, all LOW/nit, all folded + re-verified:** (a) the report's bulk upsert would abort the whole run's ingest on one DB-invalid `loop_event`/`captured_at` → `isValidRecord` now guards the enum + parseability (skip-and-count; verified 2 malformed lines skipped, 14 valid still ingest); (b)+(c) the "ingest recomputes on each run" claim overclaimed (ON CONFLICT DO NOTHING + append-only freeze stored labels at first ingest) → the claim corrected to describe the idempotent first-write behavior honestly + a `--reingest` flag added for a genuine refresh path. The load-bearing classifier survived clean.

## Status Changes
| Item | Old | New |
|---|---|---|
| The false-hold labelling instrument | Scoped (the observation period's first task) | **BUILT DARK + review-folded** (predicate + capture + table + report) |
| The canonical Q3 kathekon-engagement predicate | Spec text (ADR-013 §11) | **Live in code** (`kathekon-engagement.ts`; the exact fn the S11 G6(a) flip reuses) |
| `agent_hold_observations` table | — | **Migration authored** (dark; founder-walked apply) |
| The 7-day observation clock | Not started | **Ready to start** (the carried founder-walked activation) |

## Next Session Should

Two founder-present steps, in order:
1. **Start the clock** (this close's §Founder Walk) — apply the migration + set `GATE1_FALSE_HOLD_CAPTURE=true` + a durable `GATE1_STATE_DIR`, then run ordinary work for ≥7 days.
2. **Return with the record** — `operations/handoffs/founder/2026-07-12-trust-layer-S11-return-with-record-NEXT-SESSION-PROMPT.md` (run the report, assess the four-part standard, and — if met — re-examine the S11 enforce assent; the flip itself is a separate `code-critical` founder-walked session, the assent re-confirmed at flip time, PR7).

## Blocked On
**Uncommitted (this session's commit set):**
- `website/src/lib/substrate/trust-core/kathekon-engagement.ts` (NEW)
- `website/src/lib/substrate/trust-core/index.ts` (additive re-export)
- `website/src/lib/substrate/trust-core/__tests__/kathekon-engagement.test.ts` (NEW)
- `harness/gate1-pre-decision/claude-code/hooks/lib/false-hold-capture.mjs` (NEW)
- `harness/gate1-pre-decision/claude-code/hooks/at-action-hook.mjs` (the flag-gated capture call)
- `harness/gate1-pre-decision/claude-code/hooks/lib/framing-core.mjs` (the flag)
- `harness/gate1-pre-decision/test/false-hold-capture.test.mjs` (NEW)
- `website/supabase-agent-hold-observations-migration.sql` (NEW — authored, not applied)
- `website/scripts/false-hold-observation-report.ts` (NEW)
- `operations/handoffs/founder/2026-07-12-trust-layer-S11-return-with-record-NEXT-SESSION-PROMPT.md` (NEW)
- `operations/handoffs/founder/2026-07-12-trust-layer-S11-observation-instrument-CLOSE.md` (NEW, this file)
- `operations/decision-log.md` (the build entry)
- `CLAUDE.md` (production-state refresh)

**Production state at session close (PR18):** unchanged from the S11 deferral. All live trust/S9b flags (`SUBSTRATE_TRUST_CORE_ENABLED` + sweep + read surface + reflect-screened-exam + discernment-metering) `true` (the trust layer live under MEASURE). **No S11 enforce flag exists/is set; the intervention engine remains MEASURE; the calling-gate enforce arm remains dark.** The new `GATE1_FALSE_HOLD_CAPTURE` flag is UNSET; the `agent_hold_observations` table is not migrated; the harness capture is dark ⇒ **production byte-equivalent** until the founder walks the migration + sets the flag. R18f / R20a / distress / Layer-2 signing / UPC auth / the `gate1-dogfood@v1` + `s9-loop@v1` credentials untouched. No mint/deploy/flag/schema op this session.

## Verification Method Used
Batteries (plain-assertion `tsx` + `node`, project convention): kathekon-engagement **66/0** (new; the four arms, the 8 live false-positive fixtures → `false_positive`, the positive controls → `correct_hold`, the non-vacuity guard, the engine-agreement pin); false-hold-capture **30/0** (new; flag-off byte-identity + spawn integration + the pure projection + fail-soft); logic-harness **104/0** + negative-battery **230/0** (RELEASE GATE PASS — no regression); trust-core S1 **97/0**, emission-hooks **15/0**, S10 **106/0** (no regression from the index re-export); `tsc` **0**. The report was run offline (`--dry-run`) against a synthetic 14-record set — every branch exercised (6.88-day span → PENDING, 12 holds [8 false-positive / 4 correct across all four arms], 4/4 domains, target NOT MET); the 2 malformed-line fold re-verified. The AI performed no DB/deploy/git op; the migration is authored for the founder to walk.

## Risk Classification Record
Critical under 0d-ii (NEW schema). Built dark/additive/flag-off; the founder-walked migration + flag activation is the CARRIED step. No existing table altered; no live route/flag/auth/perimeter change; the capture is off by default; the table is inert until applied + ingested. MEASURE-only — the instrument binds nothing (adversarially confirmed by the measure-only-and-scope dimension). The 0h hold-point is unaffected.

## Founder Verification (Between Sessions)
```
cd "/Users/clintonaitkenhead/Claude-work/PROJECTS/sagereasoning"
git add -A
git commit -m "Trust Layer S11 observation period — the false-hold labelling instrument BUILT DARK + review-folded (D-TRUST-LAYER-S11-OBSERVATION-INSTRUMENT-BUILT-DARK-REVIEW-FOLDED): the canonical Q3 kathekon-engagement predicate (the fn the eventual G6(a) flip reuses), an additive flag-gated fail-soft harness capture (GATE1_FALSE_HOLD_CAPTURE, off ⇒ byte-identical), the agent_hold_observations migration (authored, founder-walked), the ingest+readiness report; batteries green (kathekon 66/0, capture 30/0, logic-harness 104/0, negative-battery 230/0, tsc 0); 7-dimension adversarial review 3/3 LOW findings folded; production byte-equivalent, capture flag unset, table unapplied"
```
Then push via GitHub Desktop. No Vercel change expected (dark; capture flag unset, table unapplied).

**Founder Walk (starts the 7-day clock — Critical Change Protocol; the founder runs each step, the AI guides + verifies):**
1. **Migration** — apply `website/supabase-agent-hold-observations-migration.sql` on **TEST** (SQL Editor) → run the §VERIFY block → then on **PRODUCTION** → §VERIFY. (What changes: one new table, empty + inert, RLS service-role-only. What could break: nothing — no existing table altered; the FK to `profiles` cascades. Rollback: the migration's rollback block, `DROP TABLE`.)
2. **Flags** — in `~/.claude/settings.local.json` (the founder's, gitignored) `env` block: add `"GATE1_FALSE_HOLD_CAPTURE": "true"` and set `"GATE1_STATE_DIR"` to a **DURABLE** path (e.g. `"/Users/clintonaitkenhead/.sage-gate1"` — NOT the default `/tmp`, which a reboot clears). The S9 hooks are already installed; only these two vars are new.
3. **Confirm** — after a tool call or two of ordinary work, `<durable dir>/false-hold-record.jsonl` should carry records.
4. **Run ≥7 days**, then the return-with-record session (run the report with `--env-file=.env.local`).

## PR5 / Knowledge-Gap Carry-Forward
- **The verdict fields are the measurement, and today they are discarded** — the at-action hook injects the full verdict into the frame then keeps only `proximity=`. Any future "measure the at-action examination" work must capture the kathekon signals at the point the verdict is in hand; retrospective log analysis cannot recover them. (This is why the capture was structurally required regardless of the classification mechanism.)
- **KG-EX1 (instrument-fidelity) held:** the battery's load-bearing assertion is that the classifier DISCRIMINATES (the positive control genuinely separates from the false-positive class) — a non-vacuity guard, not a "beats-bare" claim. The instrument measures; it does not intervene.
- **A new-table election escalates the tier** — "whether the labelling design needs a store" (the prompt's own words) moved this from `code-elevated` to `code-critical`; surfaced honestly at open with the clean architecture (local JSONL capture + server-side ingest) that honors the choice without a per-tool network write or a DB secret in the `.mjs` hook.

## Open Questions / Carried
- The 7-day observation clock + the return-with-record session (both founder-present).
- The **data-rights rider** for `agent_hold_observations` (full delete/erase/export wiring deferred — no external users; the founder's own loop; retention = the ingest self-purge + DROP; gated on external multi-tenant onboarding alongside `reflect-store owner-scoping`).
- Representativeness of the 7-day distribution (assess at the return session — a week of one action class is not representative).

## Orchestration Reminder
Deferral (adopted) → **the false-hold instrument BUILT DARK + review-folded (this session)** → the founder-walked activation (migration + flags) starts the 7-day clock → the record accumulates over ordinary work → the return-with-record session (run the report, assess the four-part standard) → later, the S11 enforce flip re-examined (staged, G6-qualified, bounds named), the assent re-confirmed at flip time. **ENFORCE remains S11, readiness-gated.** Weights BLOCKED; the 0h call remains the founder's.

*End of session close. The instrument that will measure whether the practice is ready to bind was built by the practice, on the builder, measuring the builder — and it labelled its own construction a false positive, exactly as designed.*
