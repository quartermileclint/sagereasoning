# Pre-activation checklist — the Stoa Q5c/Q13a trust-event flag intake

**Requested by the mentor 2026-08-04**, in the same response reviewing the architecture map: "prepare a pre-activation checklist that names: the two flags and their exact environment variable names, the migration file and its rollback procedure, the smoke test sequence that confirms the evidence gate is functioning correctly on first real traffic, and the monitoring signal that would indicate the gate has failed silently. The founder walks the activation; you prepare the checklist."

**This is a checklist, not the activation itself.** Every step below marked "founder-performed" stays the founder's — per the standing PR17 discipline, walked live, step by step, not handed off. Nothing in this document authorizes any live operation on its own.

**Build session this activates:** `D-STOA-Q5C-Q13A-BUILT-DARK-EVIDENCE-GATE-FOLDED-2026-08-04` (decision log). Battery at build close: 60/0. `tsc` 0. `npm run build` clean.

---

## 1. The two flags — exact names

| Flag | Current state | What it gates |
|---|---|---|
| `SUBSTRATE_TRUST_CORE_ENABLED` | Already `true` in production since 2026-07-11 (S9) | The trust core as a whole — every event type, not just the Stoa's. |
| `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED` | **Unset** — needs to be added | Dedicated to the two Stoa event derivers ONLY. Both flags must read `true` for either Stoa emitter to write anything; either alone is not enough. |

**Order matters:** the migration (§2) must land BEFORE `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED` is set. If the flag goes live before the migration, the first genuine submission will fail loudly (a rejected INSERT against the old CHECK constraint) rather than silently — that's the intended fail-honest behaviour, but it's still an avoidable false start.

## 2. The migration

**File:** `website/supabase-agent-trust-events-stoa-vocabulary-migration.sql`

**What it does:** widens two CHECK constraints on `agent_trust_events` — `event_type` (18 → 21 values, adding the three Stoa literals on top of the 15 original + the 3 `orientation-reading-*` values a separate, unrelated 2026-08-08 migration already added) and `artifact_kind` (4 → 5 values, adding `stoa_examined_artifact`). Both widenings are additive only — no existing row can be invalidated (the file's own `§PRE` section proves this before applying).

**⚠ Corrected 2026-08-12, post-walk:** the file's original §A target (18 values, omitting `orientation-reading-*`) was stale relative to that later migration — applying it as originally written would have dropped `orientation-reading-*` from the constraint. The file and this checklist are now corrected to the true target (21). See the migration file's own corrected header and `D-STOA-Q5C-Q13A-MIGRATION-STALENESS-FOUND-AND-FIXED-2026-08-12` for the full account, including the discovery that production's `event_type` half was already silently correct going into that walk while `artifact_kind` was not, and a companion regression on TEST that was found and fixed in the same session.

**Apply order (founder-performed, per PR17 — walked live):**
1. Run `§PRE` on the TEST project first. Expect both counts to read 0.
2. Apply `§A` and `§B` on TEST.
3. Run `§VERIFY`. Expect `event_type` to list twenty-one values ending with the three `orientation-reading-*` types followed by the three Stoa literals; `artifact_kind` to list five values ending with `stoa_examined_artifact`.
4. Run the file's own commented-out behavioural probe (insert three probe rows, confirm they're accepted, delete them) on TEST — this proves the new vocabulary is genuinely writable, not just present in the constraint definition.
5. Repeat steps 1–4 on production. **Confirm the project name/header in the dashboard before every query** — a project mix-up mid-walk is exactly the failure mode the 2026-08-12 session hit and recovered from.

**Rollback procedure:** reversible ONLY while no row actually uses the *Stoa* values — i.e., while `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED` has never been set to `true`. To roll back: re-`DROP CONSTRAINT` + re-`ADD CONSTRAINT` with the 18 pre-Stoa values (15 original + the 3 `orientation-reading-*` values — NOT the bare 15; the exact list is in the migration file's own corrected header comment) for `event_type`, and the original 4 for `artifact_kind`. Once real Stoa events have been written under the new vocabulary, rolling the constraint back would strand those rows — at that point rollback means unsetting the flag (stops new writes) and leaving the existing rows in place, not reversing the schema.

## 3. Smoke test sequence — confirming the evidence gate on first real traffic

Run in this order, after both flags are `true` on production. Use a throwaway admin session and a throwaway Stoa entry created for this purpose (an agent-identity test entry, not a real practitioner's).

1. **Flag-echo check.** POST to `/api/admin/stoa-trust-flag` with a deliberately invalid body (missing all three blocks). Expect a 400 naming the missing block — confirms the route is reachable and validating before touching the flags at all.
2. **Fresh-domain check (the evidence gate's core behaviour) — HARD GATE, not soft.** Flag a contradiction against an agent with NO prior trust state in the target domain. Expect the response to read `written:1, held:1` — the event is ledgered, but not folded. Then query `GET /api/trust-record/{agent_id}` for that agent — expect a **404** (no domain carries evidence), NOT a 200 showing a floored `reflexive` level. **If this returns 200 instead: the session stops here. Unset `SUBSTRATE_STOA_TRUST_EVENTS_ENABLED` immediately, run the cross-check query (§4) to capture the affected row(s), and bring the finding to the mentor before any further activation attempt.** Do not proceed to step 3, do not retry, do not investigate further in this session — a step-2 failure means the evidence gate is not doing what it was built to do, and that is a design-level finding, not a bug to patch mid-walk. (Mentor confirmation, 2026-08-05: "Treat it as a hard gate, not a soft one.")
3. **Seeded-domain check.** Using an agent that DOES have prior independent trust state in the target domain (e.g. one with a real prior credential-completed event), flag a second contradiction. Expect `written:1, held:0` — the event both ledgers and folds. Confirm via the trust-record read surface that the domain's level moved down one rank from where it stood before.
4. **Idempotency check.** Resubmit the EXACT SAME body from step 2 or 3. Expect `written:0` on the retry (the correlation-id dedup catching the duplicate) — never a second decrease from one resubmission.
5. **Q13(a) divergence check.** Flag a calling-divergence against a fresh domain. Expect the same `written:1, held:1` pattern as step 2, and confirm the domain still reads as carrying no evidence on the read surface (the flag effect changes no level even when it does fold — but on a fresh domain it shouldn't even reach that far).
6. **Teardown.** Delete the throwaway Stoa entry and its associated trust-events rows (by agent_id) before closing the session. Revoke the throwaway admin session if one was minted specifically for this walk.

## 4. Monitoring signal for a silent gate failure

**The specific failure mode to watch for:** the evidence gate silently NOT engaging — i.e. every submission folding regardless of prior evidence, quietly reproducing the exact bug this build fixed (a single curator submission originating a public trust record from nothing).

**What to watch:**
- **Log line:** every store-layer failure in this path is logged with the `[trust-core]` prefix (`emitStoaGatedTrustEvents threw:` or `insert failed at ... — events lost:`). A Vercel log search for `[trust-core]` combined with `stoa` in the same window as any admin flag-intake call is the first check.
- **The response body itself, on every real submission:** the route always returns `written`/`held` per block. If `held` is EVER 0 on a submission you know targeted a fresh (never-before-examined) domain, that is the silent-failure signature — the gate should have held it and didn't. This is checkable per-call without any log access, from the admin session's own transcript.
- **The cross-check query — BUILT, run it before activation, not just when a question arises.** `operations/connective-layer-2026-08/2026-08-05-stoa-evidence-gate-crosscheck.sql`. Read-only; finds every `(agent_id, virtue_domain)` whose entire event history is Stoa-sourced but whose `agent_trust_state` row shows folded activity anyway — the gate-failure signature stated precisely. Expected result on a healthy gate: zero rows. Per the mentor's 2026-08-05 instruction, this exists as a runnable artifact PRE-activation specifically so a later question ("did the gate ever leak?") never requires reconstructing the query from scratch — run it once before the founder walks the activation session (baseline: should be 0 rows even pre-activation, since no Stoa events exist yet), and again after the smoke sequence (§3) completes.

## 5. Not covered by this checklist

- **The R18 public-docs step — deferred, but the trigger is named explicitly so it doesn't drift.** Naming the Stoa trust-event mechanism on the public surfaces (`llms.txt`, `agent-card.json`, api-docs) is correctly NOT bundled into activation. **Its trigger: activation is confirmed clean** (the smoke sequence in §3 passes end to end, including the hard gate at step 2, and the cross-check query above returns zero rows post-smoke). At that point R18 docs become the next named step — not an open-ended backlog item with no clear moment to pick it up.
- The founder's own credential-minting and flag-setting steps in the Vercel/Supabase dashboards — those are walked live at the session itself, per PR17, not scripted in advance here.
