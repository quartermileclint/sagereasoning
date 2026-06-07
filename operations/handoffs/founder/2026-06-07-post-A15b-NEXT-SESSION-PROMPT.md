# Next-Session Prompt — Post-A15b: Stage-1 build continuation (founder elects at open)

Paste this whole file into a new session to proceed. Canonical prompt for the session after **A15b** (the GDPR Article 15 SAR endpoint `/api/user/access`) reached **Verified-on-TEST** and was committed + pushed (Vercel green; additive; production data-access live, request-logging pending the production log-table migration).

**Stream:** founder. **Tier:** set by the elected item (see menu) — `governance` for the housekeeping items; `code-critical` for A15c, the production log-table migration, or any inert-flag activation; `code-elevated` for A18 / A19 surface-rollout. Confirm at open.
**Governing frame:** `/adopted/standing-protocol-cache.md` + `/adopted/build-sessions-protocol-cache.md` ("no current users" holds → Critical Change Protocol step 3 = N/A; all other steps in full force).
**Predecessor close:** `/operations/handoffs/founder/2026-06-07-A15b-sar-access-endpoint-close.md`.
**Predecessor decision-log entries:** `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07`; `D-A15-SAR-PORTABILITY-GOVERNANCE-CONFIRM-2026-06-07`; `D-A14-SLO-ERROR-BUDGET-POLICY-2026-06-07`; `D-A19-VELOCITY-VERIFIED-LIVE-2026-06-06`.

## Carried-forward state (read before scoping)

* **A15b `/api/user/access` is built + Verified-on-TEST.** Founder TEST run 2026-06-07 passed: all three top-level keys + all eight Article 15 fields present; profiling disclosure (15(1)(h)) present; 24 `personal_data` sections; rate-limit returned HTTP 429 on the 6th rapid call; 5 rows logged in `compliance_access_log` (one per successful call; the 429'd call logged nothing). Committed + pushed; Vercel green. Additive — `/api/user/export`, `/api/user/delete`, `/api/reason` byte-identical.
* **Production posture for A15b:** the endpoint is **deployed and live in production** for the data-access + Article 15 functions. The request-logging write is **inert in production until the `compliance_access_log` table is created in the production Supabase project** — the insert is a non-blocking try/catch, so it silently no-ops and users still receive their full response. Running that one migration in production (`supabase/migrations/20260607_a15b_compliance_access_log.sql`) is a small founder-performed step (walk live per PR17); low urgency (no real users yet) but required for full R17g logging compliance before launch.
* **TEST-login note (new, useful):** `test-erasure-A@example.com` was consumed/deleted by the erasure test (its own test deletes the account), which is why the A15b run initially failed with `invalid_credentials`. A fresh **`test-access-a15b@example.com`** (created 2026-06-07 in the TEST project, auto-confirmed, password `testaccessa15b2026`) is now the stable **read-endpoint** TEST user — reuse it for `/export` + `/access` TEST runs. Destructive (delete/rectify) tests need their own throwaway user each run.
* **Status-confirm housekeeping (owed):** the committed `D-A15B-…` entry + close record A15b as **"Wired (reaches Verified on the founder's TEST run)."** TEST passed → a one-line status-confirm append (**Wired → Verified-on-TEST**) is owed in the next governance pass. Deliberately not done post-commit to avoid leaving an uncommitted diff.
* **Pending governing-doc edits carried (each Elevated; each needs explicit per-edit approval + a prior-version backup):**
   1. `manifest.md` `CR-GDPR-A20-PORTABILITY` posture → "implementation complete; pending lawyer review".
   2. `manifest.md` `CR-GDPR-A15-ACCESS` posture → "implementation built + TEST-verified; pending production log-table migration + lawyer review" (NEW from A15b).
   3. `adopted/substrate-plugin-staging-plan.md` §A15 annotation → record A15b built/Verified-on-TEST, A15d build-complete, A15c remaining.
   4. `adopted/substrate-plugin-staging-plan.md` §A14 status → "governance done; implementation deferred".
   5. `CLAUDE.md` "Production state (as of 2026-05-14)" block — stale; refresh to the 2026-06-07 state.
* **PR5 candidates:** (a) NEW (count 1) — the `/export` data-gathering logic is now duplicated with `website/src/lib/user-data-gathering.ts`; a future **Elevated** consolidation migrates `/export` onto the shared helper. (b) append-only teardown (count 1) — NOT re-triggered (`compliance_access_log` was built without a no-delete trigger by design, keeping TEST teardown clean).
* **Operational note (standing):** the AI does **not** run git in the Cowork sandbox (it leaves a `.git/index.lock` the sandbox can't remove, blocking the founder's commit). The AI reads git state via the file tools only; the founder commits/pushes via GitHub Desktop.

## Founder elects the item at open

This prompt's default + recommendation: **A15c (rectification)** is the clean next A15 build and reuses the A15b patterns wholesale; and/or kick off the **FPE/legal track** on wall-clock (the long-pole gating A16/A17 and Stage-1 close). The two are independent and can run in parallel. Say so at open; the AI re-scopes to any of the below.

* **A15c — rectification** (`code-critical`; focused). `/api/user/rectify` + a correctable-field allow-list + an immutable before/after audit table. Full Critical Change Protocol. Reuses `RATE_LIMITS.dataRights`, the compliance-log + Supabase SQL-editor table-create flow, and a `rectify-test.py` mirror of `access-test.py`. Finishes the A15 set except A16/A17 (lawyer-coupled). **Recommended next build.**
* **FPE / legal track kickoff** (founder-initiated; startable on wall-clock anytime). Gates A16 + A17 and therefore Stage-1 close. The AI helps scope the lawyer engagement, the L1 entity ADR, and the I1 insurance quote. Independent of the build items; highest-leverage strategic move.
* **A18 — onboarding + limitations governance pass** (mixed Standard/Elevated; ~1–2 sessions). R19c limitations page, R19d mirror principle, R20b framework-dependence detection (PR6 applies to A18c), accessibility statement, first-run experience, cognitive-accessibility pass. The other clean no-lawyer build item; founder elects which slice.
* **Governance/housekeeping pass** (`governance`; ~1 short session). With approval + backups, apply the 5 pending edits above + the A15b Wired→Verified status-confirm. Clears accumulated governing-doc drift. The cheap default.
* **Production log-table migration** (small founder-performed step; walked live per PR17). Create `compliance_access_log` in the production Supabase project to enable R17g request-logging in production. Low urgency (no users); can fold into any session or stand alone.
* **A19 surface rollout** (`code-elevated`; ~1 session). Add the `systematic_enumeration` + `rapid_input_variation` detectors to the Verified A19 evaluator (PR1 surface rollout — pattern proven). Structural-only off `masked_context` (no raw text — R3/R17 boundary).
* **Deferred Critical activations** (`code-critical` each) — A19 / A10 / A11b / A12 production activations; A13 automated-delivery follow-on; A14 live-adherence tracker. Each its own Critical session. Low urgency (no traffic/revenue yet).

**Recommendation:** **A15c** for build progress (now small; reuses the A15b harness), and/or start the **FPE track** in parallel (it gates the most remaining items). Governance housekeeping is the cheap default if you want a short session.

## Where this sits (one paragraph)

Stage 1 of the substrate-as-plugin arc. Verified-live: A10 (identity), A11b (injection defence), A12 (OTel + baselines), A13 (cost-health — also activated in production), A14 (SLOs — governance half), A15a (R17c deletion), **A15b (Art 15 access — NEW; Verified-on-TEST + deployed)**, A15d (portability, build-complete), and A19 (abuse-detection, detection-only). A10/A11b/A12/A19 are Verified-live on TEST but inert in production (flags UNSET; activation deferred under PR7). Stage-1 close needs all A10–A19 Verified — remaining: **A15c, A16, A17, A18** (A16/A17 lawyer-coupled), plus the deferred A14 tracker — plus lawyer engagement initiated, an EU-customer plausibility decision, and the parallel FPE track (L1 ADR + I1 quote). Stage-1 close is several sessions out, not imminent.

## Pre-conditions (founder confirms at open; AI verifies by read)

1. The A15b commit is pushed; Vercel green; `/api/reason` byte-identical. Last commit references `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07`; working tree clean; no `.git/index.lock`.
2. Production flags unchanged: all four R20a flags `true`; `SUBSTRATE_OTEL_ENABLED` / injection-defence / Layer3 / plugin-install-auth / `SUBSTRATE_ABUSE_DETECTION_ENABLED` all UNSET; A13 cost-health detection Live.
3. `D-A15B-SAR-ACCESS-ENDPOINT-BUILT-2026-06-07` is the last decision-log entry; no work begun after it. Branch `main`; the AI does no git operations.
4. No outstanding TEST seed data (`compliance_access_log` test rows cleared at A15b teardown — or note if left; the table itself can remain in TEST).

## Part A — Open under the protocol

Read in order:
1. `/adopted/standing-protocol-cache.md` — tier, model selection, risk class, signals, status vocabulary, the AI-failure-modes table (KG-EX1 prescribe-before-grounding + PR17 one-line-hand-off redirects).
2. `/adopted/build-sessions-protocol-cache.md` — "no current users" note; living-state references (component-registry is the status source-of-truth).
3. The predecessor close in full: `/operations/handoffs/founder/2026-06-07-A15b-sar-access-endpoint-close.md`.
4. For the elected item: `/adopted/a15-sar-portability-disposition.md` §4 (A15c scope) if A15c; `/adopted/substrate-plugin-staging-plan.md` §A18 / §A19 / Stage-1-close gating if A18 / A19 / FPE. Read against the decision log, not at face value.
5. `/operations/decision-log.md` last 3 entries (the predecessors above) + grep the Verified states for A10/A11b/A12/A13/A14/A15a/A15b/A15d/A19.
6. `/manifest.md` targeted for the elected item — for A15c: R17f/h (Critical surface + Critical Change Protocol); for A18: R19c/R19d/R20b; for A19-rollout: R3 + R17 (no-PII scope).

Confirm at open (narrate before substantive work, per the cache's failure-modes subsection): where we are in the arc; what's queued; what's awaiting the founder vs the AI. Model selection per the cache AC1 table (N/A unless an LLM classifier is introduced — A18c framework-dependence detection may introduce one). KG scan: KG1 on any DB-write code; KG7 on JSONB writes. PR15 consult before any bespoke build (`.claude/skills/anthropic/` + `/operations/agentic-commerce-findings-downstream-order.md`; state whether an Anthropic-canonical primitive could deliver the outcome before electing bespoke). PR6 applies to A15c + A18c. PR17 on every founder-performed step.

## Part B — Procedure

Re-scope to the elected item's staging-plan section + disposition.

**If A15c (Critical) is elected:** complete the Critical Change Protocol (0c-ii) visibly before any production change; prove on a single surface first (PR1); verify build-to-wire in-session (PR2 — `tsc --noEmit` + `eslint` + confirm the new functions are invoked in the execution path, not just defined); walk every founder-performed Supabase/Vercel/Terminal step live (PR17). Reuse the A15b harness: `RATE_LIMITS.dataRights`, the `compliance_*_log` + RLS-no-policies pattern, the Supabase SQL-editor table-create flow, and a `rectify-test.py` mirror of `access-test.py` against the stable `test-access-a15b@example.com` user (create a separate throwaway user if the rectify test mutates then needs a clean state).

**If the housekeeping pass is elected:** confirm each of the 5 edits + the A15b status-confirm with the founder one at a time (exact before/after text); back up each governing doc first to `archive/2026-06-07-post-A15b-housekeeping/<file>.backup-pre-edit`; apply in place; verify with a `grep` diff the founder reads; lean decision-log + close.

## What is NOT in this session

* No production activation of any inert flag (A19 / A10 / A11b / A12 / A13-delivery / A14 tracker) unless explicitly elected — each its own Critical session.
* No R20a / Zone 2/3 / classifier / wrapper touch (PR6 trip-wire — if any step is found to, it becomes Critical).
* No `/api/user/export` refactor onto the shared `user-data-gathering.ts` helper unless explicitly elected (an Elevated change to a Verified-live endpoint — its own session).
* No git operations by the AI (founder commits/pushes via GitHub Desktop).
* No edits to governing docs (manifest, staging plan, CLAUDE.md) without explicit per-edit founder approval + prior-version backup.

## Rollback path

Per the elected item. A15c: full Critical rollback (additive + flag/revert-able commit; new audit table droppable via `drop table`). Housekeeping: restore each file from its `archive/2026-06-07-post-A15b-housekeeping/*.backup-pre-edit`. Production log-table migration: `drop table public.compliance_access_log;` in production.

## Forecast

Most likely: A15c builds cleanly reusing the A15b harness, leaving only A16/A17 (lawyer-coupled), A18, and the deferred A14 tracker before Stage-1 close. The FPE/legal track remains the long-pole gating A16/A17 and Stage-1 close, so starting it on wall-clock in parallel is the highest-leverage move regardless of which build item is elected.

End of prompt. Opens on `main`. Tier set by the elected item; if a Critical item is chosen, the full Critical Change Protocol (0c-ii) is completed visibly before any production change, and every founder-performed dashboard/Vercel/Terminal step is walked live (PR17).
