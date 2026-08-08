# Next-Session Prompt — C2/C1c activation walk (the fifth-circle orientation reading goes LIVE, MEASURE)

**Tier: `code-critical` — full Critical Change Protocol, founder-walked throughout (AC7 + PR6 + PR17).** The AI guides + verifies and performs no Supabase/Vercel/git-push/mint op. **Commit-and-push BEFORE any flag** (the 2026-07-30 lesson); **migration BEFORE flag; TEST BEFORE prod.**

**Pre-conditions (all must hold before opening):**
1. The 2026-08-08 build commit is on `origin/main` and Vercel is green with it (the build is dark — `SUBSTRATE_ORIENTATION_READING_ENABLED` unset ⇒ byte-identical, battery-asserted).
2. **DISCHARGED 2026-08-08.** The mandatory PR19 independent re-run completed FULLY on Sonnet 5 medium effort (`wf_63ff4a50-a2a`, 39 agents, 0 errors, 28 confirmed-or-partial findings, 5 refuted). Five real findings folded at the root (a HIGH/MEDIUM flag-off byte-identity break on the wire-echo strip; the F-2 digest test-coverage gap, closed with a mutation-verified test; F-1's single-point-of-enforcement, closed with a hook-level re-check; a real surrogate-pair truncation defect causing silent data loss; a capped-flag off-by-one). Two genuine open questions were surfaced, NOT resolved by code — see the sign-off package §6 below. Full record: `D-C2-C1C-PR19-RERUN-COMPLETE-FOLDED-2026-08-08`. This walk may now proceed past step 1.
3. The founder has signed off the C2d wording package: `operations/agent-circles-2026-08/2026-08-08-c2d-honest-claims-signoff-package.md`. **HARD GATE — if unsigned, the walk may still do steps 1–4 (the MEASURE surfaces) but MUST stop before step 5 (the envelope/ADR/R18 changes).**

**Read first:** the build close (`2026-08-08-c2-c1c-build-CLOSE.md`); the scope doc (`operations/agent-circles-2026-08/2026-08-06-c2-orientation-reading-and-c1c-trust-event-scope.md`); the C2d package; the migration file's own §PRE/§VERIFY.

## The walk (inviolable order)

### Step 1 — the migration, TEST then prod (founder, SQL editor)
Run `website/supabase-agent-trust-events-orientation-vocabulary-migration.sql` on **TEST** (`iwdtrvuphogkwmovhnvz`): §PRE expects 0; apply §A; §VERIFY expects the 21-value CHECK. Run the behavioural probe (three NULL-domain inserts + delete + the state-stays-empty check). Then repeat on **prod** (§PRE, §A, §VERIFY — skip the probe or run it inside a transaction). The migration is additive; a pre-flag deploy cannot PGRST204 (no code writes the new types until the flag is set).

### Step 2 — the flag, TEST first
In `website/.env.development.local`: `SUBSTRATE_ORIENTATION_READING_ENABLED=true` (+ the already-true agent-circles + trust-core flags per the TEST parity block). Local dev server against TEST; throwaway TEST credential (agent-bound, K1-canonical id — the accreditation vocabulary rule). Smokes:
- **(a) consult happy path:** a credential-bearing consult whose input narrates BOTH marker classes → HTTP 200; the response's `extraction` carries **NO** `orientation_observations` (the strip — the load-bearing check); no orientation field anywhere on the response; then SQL: one `agent_trust_events` row, `event_type` = the expected reading, `virtue_domain IS NULL`, payload carries reading/basis/bounds; **`agent_trust_state` has NO new row for the test agent** (insert-only — the trap check).
- **(b) the 400:** re-submit the SAME consult as `layer1_schema` supply INCLUDING an `orientation_observations` array → HTTP 400 `orientation_observations_not_suppliable`.
- **(c) S10:** `GET /api/trust-record/{agent_id}` — if the agent carries examined evidence, `record.orientation_readings` present, each entry with `entry_text` + the verbatim inline clause; if it does not, an honest 404 (the ENV-1 contract is unchanged — orientation events alone never surface a record).
- **(d) reflect:** drive a reflect session to Q6 → the surfaced `mandatory_subquestions` carries the orientation question verbatim.
- **(e) dedup:** replay the same signed assessment → `written: 0` (the `orient:` correlation dedup).
Teardown: revoke the TEST credential; delete the TEST probe/smoke rows; unset the TEST flag if not wanted standing.

### Step 3 — production flag (founder, Vercel)
Set `SUBSTRATE_ORIENTATION_READING_ENABLED=true` in Vercel Production + redeploy (green). Live smokes on a founder-minted throwaway prod credential (prod mints need the browser-session JWT → `MINT_CLI_ADMIN_JWT`): repeat (a) + (b) + (c); revoke the throwaway at teardown; the smoke's ledger rows are `retain_until`-swept (exclude from samples). **Rollback at any point: unset the flag + redeploy (byte-identical flag-off, battery-asserted); the migration may stay (inert).**

### Step 4 — the harness telos line (founder's loop, local)
Add `GATE1_TELOS_LINE_ENABLED=true` to the harness env block in `.claude/settings.local.json` (hot-reloads). Verify the next session-open calling frame carries the mentor's telos line verbatim. Rollback: remove the env line.

### Step 5 — C2d (HARD GATE: the signed-off wording only)
With the package signed: (a) ADR-013 §8 dated amendment; (b) the `TRUST_RECORD_ENVELOPE` line (note: changes the LIVE envelope on push — this is the intended standing change); (c) the three R18 surfaces (`llms.txt`, `agent-card.json` → 21 extensions, api-docs), **in that order**, then push + verify live by curl. Every wording change comes from the signed package verbatim — no improvisation.

### Step 6 — records
Decision-log activation entry (`D-C2-C1C-ORIENTATION-READING-ACTIVATION-LIVE-...`); update the dependency graph (`06-PLAIN-TEXT-MIRROR.md` item 2b/3 → LIVE-MEASURE); note the **autonomous-loop blocking condition part (b)** is now startable: at least one real production consult fires the reading, its output is reviewed, and that review goes TO THE MENTOR before any design brief is scoped (`D-C2-C1C-ORDERING-RULED-CROSSCHECK-BUILT-2026-08-05` — "C2 built" alone does not satisfy it); session close.

## What this walk does NOT do
- Does not touch D4, the Stoa activation, the generation step, or the original first-circle C1c.
- Does not activate anything the sign-off package hasn't blessed; does not reword any mentor-verbatim text.
- Does not treat the orientation reading as an input to anything (MEASURE; ENFORCE is S11; weights BLOCKED).
