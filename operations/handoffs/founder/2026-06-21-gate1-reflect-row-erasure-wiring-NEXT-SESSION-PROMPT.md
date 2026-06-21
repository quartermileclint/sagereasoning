# Next-Session Prompt — Wire reflect-row erasure (the Gate-1 Slice-5c named follow-up)

**For the founder. Paste as the first message of a fresh session.**

**Stream:** founder.
**Tier:** **`code-critical`** — full Critical Change Protocol (0c-ii). Touches two **data-deletion** surfaces (`/api/user/delete`, `/api/credential/erase`) + a new **retention cron** + a `vercel.json` change + an env flag. **AC7 + PR6 engaged.** Every prod step is the founder's (PR17); the AI guides + verifies.
**Predecessor decision-log entries:** `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5C-CHANNEL-REARCHITECTURE-BUILT-TEST-VERIFIED`, `D-SAGE-PRACTICE-GATE1-FULL-LOOP-HARNESS-SLICE5C-LIVE-FIRE-VERIFIED-LIVE-THEN-TORN-DOWN`.
**Predecessor close:** `operations/handoffs/founder/2026-06-21-gate1-full-loop-harness-slice5c-channel-rearchitecture-close.md`.

## Session open (per the protocol)
Read in order: `/adopted/standing-protocol-cache.md` (~3 min — confirm tier, model selection, risk class, signals); the predecessor close above; this prompt in full; `/operations/decision-log.md` last 3 entries. Confirm at open: tier (`code-critical`); hold-point P0 0h; status vocabulary; risk class per 0d-ii. Recall memory `[[gate1-harness-channel-law]]` (the arc context) — but this session is a **data-rights / R17c** build, not a harness build.

## Where the Gate-1 arc stands (so this session has the context)
The Gate-1 full-loop harness is **Verified-LIVE** (Slice 5c): the channel-law re-architecture proved out on prod — a capable agent **engages** the pure in-conversation reflect invitation and **discounts** the advisory frame; enforcement + instrumentation (guard-deny, accred-write, verbatim reflection persistence) run **out-of-band**. Standing on prod: the narrowed public `pre_decision_harness` docs + the additive `context_source` field. **`persistReflection` is DARK** (`SAGE_GATE1_REFLECT_PERSIST_ENABLED` unset); the hooks are registered-but-not-installed; the dogfood marker + LIVE H1/H2 are untouched. **This session is the named prerequisite that gates any STANDING `persistReflection` activation.**

## Why this session matters
`persistReflection` (and the existing SR-13 reflect feature, Live since 2026-06-18) write the agent's **encrypted introspective reflection** to `sage_reflect_sessions`. The reflect store's genuine-deletion functions exist but are **UNWIRED** — so a user-account deletion or a consumer credential-erasure leaves those intimate rows in the DB, and there is **no retention cron**. That is a pre-existing **R17c** gap (the "deletable on request" promise is not honoured by any automated path), independent of the harness, and it is the **named blocker** before a standing `persistReflection`. Closing it makes the harness README's erasure disclosure true and fixes the live reflect feature's gap in one go.

## First-hand findings (verified at the Slice-5c session — re-verify at build, PR11)
- `website/src/lib/sage-reflect/session-store.ts` exports `deleteSession(session_id)`, `deleteAgentSessions(agent_id)`, `sweepExpiredSessions(windowDays=90, now)` — all built, exported, unit-tested, but **called NOWHERE** in production code (grep-confirmed). The 90-day `RETENTION_WINDOW_DAYS` + the cutoff helper already exist.
- `website/src/app/api/user/delete/route.ts` deletes many tables by `user_id` + `agent_assessment_history` by owner (`deleteAssessmentHistoryForOwner`), but **never touches `sage_reflect_sessions`** (a maintainer NOTE is already in the file at the agent_assessment_history block).
- `website/src/lib/consumer-erasure.ts` + `website/src/app/api/credential/erase/handler.ts` erase a credential's trajectory (by `credential_ref`) + anonymise the husk + de-personalise billing, but **never touch `sage_reflect_sessions`** (a maintainer NOTE is already in `consumer-erasure.ts` after the trajectory delete).
- `website/src/app/api/cron/` has `trajectory-retention-sweep`, `narrative-sweep`, `observability` — **no reflect sweep**. `vercel.json` lists those three crons. The project is on Vercel **Pro** (supports >2 + hourly crons).

## The keying crux (the design decision)
`sage_reflect_sessions` rows are keyed by **`agent_id`** (+ `session_id`), **NOT** `user_id` or `credential_ref`. So:
- **`/api/user/delete` (operator):** map `user_id` → the operator's owned `agent_id`s (`SELECT agent_id FROM api_keys WHERE owner_user_id = userId AND agent_id IS NOT NULL`) → `deleteAgentSessions(agent_id)` per agent (mirrors how `agent_assessment_history` is handled, but that one is owner-keyed; reflect is agent-keyed, so the join is the new bit). Decide: dedupe agent_ids; tolerate "no agent_ids" (no-op); a missing table is benign (the store no-ops).
- **`/api/credential/erase` (consumer):** add `agent_id` to `ERASURE_SELECT`, read it **before** the husk is anonymised (the erase nulls `agent_id`), pass it to `eraseExternalConsumerCredential`, then `deleteAgentSessions(agent_id)`; surface the deleted count in `ErasureResult` + the compliance record.
- **Cron (the orphan backstop):** a new `GET /api/cron/reflect-retention-sweep` (route+handler split like `trajectory-retention-sweep`, CRON_SECRET-gated, flag-gated, **fail-honest** not fail-closed) calling `sweepExpiredSessions()`; a `vercel.json` entry; a kill-switch flag (e.g. `SUBSTRATE_REFLECT_SWEEP_ENABLED`). The cron catches orphaned rows whose `agent_id` no longer maps to an `api_keys` row (revoked credential) — name that edge explicitly.

## Critical Change Protocol (state at open; founder approves per named risk)
1. **What changes:** (a) `/api/user/delete` — add the user→agent_id→`deleteAgentSessions` step + the table to the compliance `tables_cleared` list; (b) `/api/credential/erase` — read+thread `agent_id`, call `deleteAgentSessions`, surface the count; (c) a new flag-gated reflect-retention cron + `vercel.json` entry; (d) update the harness README + the ADR to mark the erasure follow-up DONE (retire the "not yet wired" caveat). The two `/trust-layer` mirror trees: confirm whether they carry reflect erasure (likely not — reflect has no mirror; verify).
2. **Named risks:** genuine hard-DELETE of intimate encrypted rows (R17c — irreversible by design; that is the point); a new cron firing a delete on a schedule (flag-gated + fail-honest); a data-deletion surface change (Critical). No auth/perimeter change.
3. **Existing sessions:** `persistReflection` stays dark until this lands; the live SR-13 reflect feature gains genuine deletion (a fix, not a behaviour regression).
4. **Rollback:** `git revert` the commit; the cron is flag-gated (unset ⇒ inert) + removable from `vercel.json`; the delete wiring is additive (deletes MORE on an erase/delete request — the safe direction for R17c).
5. **Verification:** TEST — seed a reflect row under a test agent_id, run user-delete (or consumer-erase) → the row is gone; run the cron → expired rows gone, fresh rows kept; KG1 (every delete awaited, errors surfaced). Then a founder-walked prod activation (the flag + a zero-footprint smoke).
6. **Approval:** per named risk.

## Step-by-step (founder-walked)
1. **Build dark** (repo-only): the user-delete wiring + the consumer-erase wiring + the cron (flag UNSET) + unit tests + a battery/assertion check that a seeded reflect row is deleted by each path. Re-verify the first-hand findings above (PR11). `tsc` 0; `npm run build` 0 (the new route + the two changed routes register).
2. **Adversarial pre-activation review** (the established discipline): dimensions = correct keying (no over-deletion of another user's rows; agent_id read BEFORE anonymise), fail-honesty (a delete error surfaces, never a false "deleted"), flag-off byte-identity (cron inert; the two routes unchanged when no reflect rows match), R17c genuineness, KG1. Fold findings.
3. **Activate (founder-walked 0c-ii):** push; set the cron flag in Vercel + add the `vercel.json` cron + redeploy; a zero-footprint smoke (the cron curl returns `flag_enabled:true`; a no-row user-delete/erase still 200s). Apply the README/ADR "DONE" update on the push.
4. **Decision-log + close + CLAUDE.md refresh** (this unblocks standing `persistReflection`; note it explicitly).

## Risk classification
`code-critical` — two data-deletion surfaces + a delete-on-schedule cron + a `vercel.json`/flag activation. Full Critical Change Protocol; every prod step the founder's.

## Forecast
Ends with reflect-row erasure genuinely wired into both deletion paths + a retention cron — closing the pre-existing R17c gap for the live reflect feature AND satisfying the named prerequisite for a **standing `persistReflection`** activation. After this, the only open Gate-1 items are the standing `persistReflection` turn-on (a later founder election) and the **0h launch call** (the founder's).

End of prompt.
